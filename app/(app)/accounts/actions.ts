"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireAccountEditAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { accountSchema } from "@/lib/validation";

export type AccountFormState = { error?: string };

// ADMIN is a privilege, not a CSM — never let it be saved as an account owner.
async function resolveCsmUserId(csmUserIdRaw: string | null): Promise<string | null> {
  if (!csmUserIdRaw) return null;
  return (
    (
      await prisma.user.findFirst({
        where: { id: csmUserIdRaw, role: "MEMBER" },
        select: { id: true },
      })
    )?.id ?? null
  );
}

export async function createAccountAction(
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  await requireAdmin();

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    csmUserId: formData.get("csmUserId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const csmUserId = await resolveCsmUserId(parsed.data.csmUserId?.trim() || null);

  try {
    await prisma.account.create({ data: { name: parsed.data.name, csmUserId } });
  } catch {
    return { error: "An account with that name already exists." };
  }

  revalidatePath("/accounts");
  revalidatePath("/log");
  return {};
}

export async function updateAccountAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.account.findUnique({ where: { id }, select: { csmUserId: true } });
  if (!existing) return;
  await requireAccountEditAccess(existing.csmUserId);

  const name = String(formData.get("name") ?? "").trim();
  const isActive = formData.get("isActive") === "on";
  const csmUserId = await resolveCsmUserId(String(formData.get("csmUserId") ?? "").trim() || null);
  const renewalDateOverrideRaw = String(formData.get("renewalDateOverride") ?? "").trim();
  const renewalDateOverride = renewalDateOverrideRaw ? new Date(renewalDateOverrideRaw) : null;
  const recoveryPlanNotes = String(formData.get("recoveryPlanNotes") ?? "").trim() || null;

  if (!name) return;

  await prisma.account.update({
    where: { id },
    data: { name, isActive, csmUserId, renewalDateOverride, recoveryPlanNotes },
  });
  revalidatePath("/accounts");
  revalidatePath("/log");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/renewals");
}

export async function deleteAccountAction(
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const logCount = await prisma.activityLog.count({ where: { accountId: id } });
  if (logCount > 0) {
    return {
      error: "This account has logged activity — deactivate it instead of deleting.",
    };
  }

  await prisma.account.delete({ where: { id } });
  revalidatePath("/accounts");
  return {};
}
