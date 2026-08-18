"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validation";

export type UserFormState = { error?: string };

export async function createUserAction(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: { name, email, passwordHash, role: "MEMBER", mustChangePassword: true },
    });
  } catch {
    return { error: "A user with that email already exists." };
  }

  revalidatePath("/admin/users");
  return {};
}

export async function setUserActiveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("nextActive") === "true";
  await prisma.user.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/users");
}

export async function resetPasswordAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword.length < 8) return;

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id },
    data: { passwordHash, mustChangePassword: true },
  });
  revalidatePath("/admin/users");
}
