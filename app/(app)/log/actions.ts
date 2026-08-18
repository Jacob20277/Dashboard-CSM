"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { activityLogSchema } from "@/lib/validation";

export type LogFormState = { error?: string; success?: boolean };

function readActivityLogForm(formData: FormData) {
  return activityLogSchema.safeParse({
    accountId: formData.get("accountId"),
    activityDate: formData.get("activityDate"),
    durationMinutes: formData.get("durationMinutes"),
    notes: formData.get("notes") || undefined,
    kpiIds: formData.getAll("kpiIds"),
  });
}

export async function createActivityLog(
  _prev: LogFormState,
  formData: FormData
): Promise<LogFormState> {
  const user = await requireUser();
  const parsed = readActivityLogForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { accountId, activityDate, durationMinutes, notes, kpiIds } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const log = await tx.activityLog.create({
      data: {
        userId: user.id,
        accountId,
        activityDate: new Date(activityDate),
        durationMinutes,
        notes,
        isUnmatched: kpiIds.length === 0,
      },
    });

    if (kpiIds.length > 0) {
      await tx.activityLogKpi.createMany({
        data: kpiIds.map((kpiId) => ({ activityLogId: log.id, kpiId })),
      });
    }
  });

  revalidatePath("/log");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function updateActivityLog(
  _prev: LogFormState,
  formData: FormData
): Promise<LogFormState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  const existing = await prisma.activityLog.findUnique({ where: { id } });
  if (!existing) return { error: "Entry not found" };
  if (existing.userId !== user.id && user.role !== "ADMIN") {
    return { error: "You don't have permission to edit this entry." };
  }

  const parsed = readActivityLogForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { accountId, activityDate, durationMinutes, notes, kpiIds } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.update({
      where: { id },
      data: {
        accountId,
        activityDate: new Date(activityDate),
        durationMinutes,
        notes,
        isUnmatched: kpiIds.length === 0,
      },
    });
    await tx.activityLogKpi.deleteMany({ where: { activityLogId: id } });
    if (kpiIds.length > 0) {
      await tx.activityLogKpi.createMany({
        data: kpiIds.map((kpiId) => ({ activityLogId: id, kpiId })),
      });
    }
  });

  revalidatePath("/log");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteActivityLogAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  const existing = await prisma.activityLog.findUnique({ where: { id } });
  if (!existing) return;
  if (existing.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("You don't have permission to delete this entry.");
  }

  await prisma.activityLog.delete({ where: { id } });
  revalidatePath("/log");
  revalidatePath("/dashboard");
}
