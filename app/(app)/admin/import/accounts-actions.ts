"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { parseAccountSpreadsheet } from "@/lib/account-import";
import { matchUserByEmailOrName } from "@/lib/user-match";
import { prisma } from "@/lib/prisma";

export type ImportAccountsFormState = {
  error?: string;
  imported?: number;
  updated?: number;
  failed?: { row: number; reason: string }[];
};

export async function importAccountsAction(
  _prev: ImportAccountsFormState,
  formData: FormData
): Promise<ImportAccountsFormState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV or Excel file to upload." };
  }

  const buffer = await file.arrayBuffer();
  const { rows, headerError } = parseAccountSpreadsheet(buffer);
  if (headerError) {
    return { error: headerError };
  }
  if (rows.length === 0) {
    return { error: "No data rows found in the file." };
  }

  // ADMIN is a privilege, not a CSM — never assign it as an account owner via import.
  const users = await prisma.user.findMany({
    where: { role: "MEMBER" },
    select: { id: true, name: true, email: true },
  });

  const failed: { row: number; reason: string }[] = [];
  const validRows: { accountName: string; csmUserId: string | null }[] = [];

  for (const row of rows) {
    let csmUserId: string | null = null;
    if (row.csm) {
      const match = matchUserByEmailOrName(users, row.csm);
      if (!match) {
        failed.push({ row: row.rowNumber, reason: `Unknown CSM "${row.csm}"` });
        continue;
      }
      csmUserId = match.id;
    }
    validRows.push({ accountName: row.accountName, csmUserId });
  }

  // Dedupe by account name (case-insensitive), keeping the last row in the sheet, so a
  // name repeated in the file doesn't cause a duplicate-create attempt below.
  const deduped = new Map<string, { accountName: string; csmUserId: string | null }>();
  for (const row of validRows) {
    deduped.set(row.accountName.toLowerCase(), row);
  }

  const existingAccounts = await prisma.account.findMany({ select: { id: true, name: true } });

  let imported = 0;
  let updated = 0;
  for (const row of deduped.values()) {
    const existing = existingAccounts.find(
      (a) => a.name.toLowerCase() === row.accountName.toLowerCase()
    );
    if (existing) {
      await prisma.account.update({
        where: { id: existing.id },
        data: { csmUserId: row.csmUserId },
      });
      updated += 1;
    } else {
      await prisma.account.create({
        data: { name: row.accountName, csmUserId: row.csmUserId },
      });
      imported += 1;
    }
  }

  revalidatePath("/admin/import");
  revalidatePath("/admin/accounts");
  revalidatePath("/log");

  return { imported, updated, failed };
}
