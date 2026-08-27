"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { accountSchema } from "@/lib/validation";

export type QuickAccountFormState = { error?: string; success?: boolean };

export async function createAccountQuickAction(
  _prev: QuickAccountFormState,
  formData: FormData
): Promise<QuickAccountFormState> {
  await requireUser();

  const parsed = accountSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await prisma.account.create({ data: parsed.data });
  } catch {
    return { error: "An account with that name already exists." };
  }

  revalidatePath("/log");
  revalidatePath("/accounts");
  return { success: true };
}
