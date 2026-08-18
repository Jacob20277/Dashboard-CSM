"use server";

import bcrypt from "bcryptjs";
import { signOut } from "@/auth";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validation";

export type ChangePasswordState = { error?: string };

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false },
  });

  await signOut({ redirectTo: "/login?passwordChanged=1" });

  return {};
}
