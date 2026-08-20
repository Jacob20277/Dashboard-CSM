"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { parseSpreadsheet } from "@/lib/activity-import";
import { prisma } from "@/lib/prisma";

export type ImportFormState = {
  error?: string;
  imported?: number;
  orphaned?: number;
  failed?: { row: number; reason: string }[];
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function importActivityLogsAction(
  _prev: ImportFormState,
  formData: FormData
): Promise<ImportFormState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV or Excel file to upload." };
  }

  const buffer = await file.arrayBuffer();
  const { rows, headerError } = parseSpreadsheet(buffer);
  if (headerError) {
    return { error: headerError };
  }
  if (rows.length === 0) {
    return { error: "No data rows found in the file." };
  }

  const [users, accounts, kpis] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true } }),
    prisma.account.findMany({ select: { id: true, name: true } }),
    prisma.kpi.findMany({ select: { id: true, name: true } }),
  ]);

  const failed: { row: number; reason: string }[] = [];
  const validRows: {
    userId: string;
    title: string;
    accountId: string;
    activityDate: Date;
    durationMinutes: number;
    notes: string;
    kpiIds: string[];
  }[] = [];
  const orphanedRows: {
    userId: string;
    title: string;
    rawAccountName: string;
    activityDate: Date;
    durationMinutes: number;
    notes: string;
    kpiIds: string[];
  }[] = [];

  for (const row of rows) {
    if (!row.title) {
      failed.push({ row: row.rowNumber, reason: "Missing title" });
      continue;
    }

    const member = row.member.includes("@")
      ? users.find((u) => u.email.toLowerCase() === row.member.toLowerCase())
      : users.find((u) => u.name.toLowerCase() === row.member.toLowerCase());
    if (!member) {
      failed.push({ row: row.rowNumber, reason: `Unknown member "${row.member}"` });
      continue;
    }

    if (!DATE_RE.test(row.date) || Number.isNaN(new Date(row.date).getTime())) {
      failed.push({ row: row.rowNumber, reason: `Invalid date "${row.date}" (use YYYY-MM-DD)` });
      continue;
    }

    const duration = Number(row.duration);
    if (!Number.isInteger(duration) || duration <= 0) {
      failed.push({ row: row.rowNumber, reason: `Invalid duration "${row.duration}"` });
      continue;
    }

    if (!row.notes) {
      failed.push({ row: row.rowNumber, reason: "Missing notes" });
      continue;
    }

    const tagNames = row.kpiTags
      .split(";")
      .map((t) => t.trim())
      .filter(Boolean);
    const kpiIds: string[] = [];
    let unknownTag: string | undefined;
    for (const tagName of tagNames) {
      const kpi = kpis.find((k) => k.name.toLowerCase() === tagName.toLowerCase());
      if (!kpi) {
        unknownTag = tagName;
        break;
      }
      kpiIds.push(kpi.id);
    }
    if (unknownTag) {
      failed.push({ row: row.rowNumber, reason: `Unknown KPI "${unknownTag}"` });
      continue;
    }

    const account = accounts.find((a) => a.name.toLowerCase() === row.account.toLowerCase());
    if (!account) {
      // Everything else about this row is valid — only the account name didn't match.
      // Stage it as an orphaned log instead of discarding it; an admin resolves it later
      // by picking the real account from the master list.
      orphanedRows.push({
        userId: member.id,
        title: row.title,
        rawAccountName: row.account,
        activityDate: new Date(row.date),
        durationMinutes: duration,
        notes: row.notes,
        kpiIds,
      });
      continue;
    }

    validRows.push({
      userId: member.id,
      title: row.title,
      accountId: account.id,
      activityDate: new Date(row.date),
      durationMinutes: duration,
      notes: row.notes,
      kpiIds,
    });
  }

  let imported = 0;
  if (validRows.length > 0) {
    await prisma.$transaction(async (tx) => {
      const created = await tx.activityLog.createManyAndReturn({
        data: validRows.map((r) => ({
          userId: r.userId,
          title: r.title,
          accountId: r.accountId,
          activityDate: r.activityDate,
          durationMinutes: r.durationMinutes,
          notes: r.notes,
          isUnmatched: r.kpiIds.length === 0,
        })),
      });

      const kpiTagRows = created.flatMap((log, i) =>
        validRows[i].kpiIds.map((kpiId) => ({ activityLogId: log.id, kpiId }))
      );
      if (kpiTagRows.length > 0) {
        await tx.activityLogKpi.createMany({ data: kpiTagRows });
      }

      imported = created.length;
    });
  }

  if (orphanedRows.length > 0) {
    await prisma.pendingActivityImport.createMany({
      data: orphanedRows.map((r) => ({
        userId: r.userId,
        title: r.title,
        rawAccountName: r.rawAccountName,
        activityDate: r.activityDate,
        durationMinutes: r.durationMinutes,
        notes: r.notes,
        kpiIds: r.kpiIds,
      })),
    });
  }

  revalidatePath("/log");
  revalidatePath("/dashboard");
  revalidatePath("/admin/import");

  return { imported, orphaned: orphanedRows.length, failed };
}
