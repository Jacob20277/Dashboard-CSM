"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { accountSchema, bulkCreateAccountsSchema } from "@/lib/validation";

export type AccountFormState = { error?: string };
export type BulkAccountFormState = { error?: string; result?: { created: number; skipped: number } };

export async function createAccountAction(
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  await requireAdmin();

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await prisma.account.create({ data: parsed.data });
  } catch {
    return { error: "An account with that name already exists." };
  }

  revalidatePath("/admin/accounts");
  return {};
}

export async function bulkCreateAccountsAction(
  _prev: BulkAccountFormState,
  formData: FormData
): Promise<BulkAccountFormState> {
  await requireAdmin();

  const parsed = bulkCreateAccountsSchema.safeParse({
    namesBlob: formData.get("namesBlob"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const names = [...new Set(parsed.data.namesBlob.split("#").map((n) => n.trim()).filter(Boolean))];
  if (names.length === 0) {
    return { error: "No account names found" };
  }

  const before = await prisma.account.count();
  await prisma.account.createMany({
    data: names.map((name) => ({ name })),
    skipDuplicates: true,
  });
  const after = await prisma.account.count();
  const created = after - before;

  revalidatePath("/admin/accounts");
  return { result: { created, skipped: names.length - created } };
}

export async function updateAccountAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const isActive = formData.get("isActive") === "on";
  const csmUserId = String(formData.get("csmUserId") ?? "").trim() || null;

  if (!name) return;

  await prisma.account.update({ where: { id }, data: { name, isActive, csmUserId } });
  revalidatePath("/admin/accounts");
  revalidatePath("/log");
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
  revalidatePath("/admin/accounts");
  return {};
}
