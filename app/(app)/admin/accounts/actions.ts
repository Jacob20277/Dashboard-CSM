"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { accountSchema } from "@/lib/validation";

export type AccountFormState = { error?: string };

export async function createAccountAction(
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  await requireAdmin();

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    isStrategic: formData.get("isStrategic") === "on",
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

export async function updateAccountAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isStrategic = formData.get("isStrategic") === "on";
  const isActive = formData.get("isActive") === "on";

  await prisma.account.update({ where: { id }, data: { isStrategic, isActive } });
  revalidatePath("/admin/accounts");
}
