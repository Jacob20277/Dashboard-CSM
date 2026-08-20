"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function resolveOrphanedLogAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const accountId = String(formData.get("accountId") ?? "");
  if (!id || !accountId) return;

  const pending = await prisma.pendingActivityImport.findUnique({ where: { id } });
  if (!pending) return;

  const kpiIds = Array.isArray(pending.kpiIds) ? (pending.kpiIds as string[]) : [];

  await prisma.$transaction(async (tx) => {
    const log = await tx.activityLog.create({
      data: {
        userId: pending.userId,
        title: pending.title,
        accountId,
        activityDate: pending.activityDate,
        durationMinutes: pending.durationMinutes,
        notes: pending.notes,
        isUnmatched: kpiIds.length === 0,
      },
    });

    if (kpiIds.length > 0) {
      await tx.activityLogKpi.createMany({
        data: kpiIds.map((kpiId) => ({ activityLogId: log.id, kpiId })),
      });
    }

    await tx.pendingActivityImport.delete({ where: { id } });
  });

  revalidatePath("/admin/import");
  revalidatePath("/log");
  revalidatePath("/dashboard");
}

export async function discardOrphanedLogAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.pendingActivityImport.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/import");
}
