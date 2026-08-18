"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { shareTokenCreateSchema } from "@/lib/validation";

export type ShareTokenFormState = { error?: string };

export async function createShareTokenAction(
  _prev: ShareTokenFormState,
  formData: FormData
): Promise<ShareTokenFormState> {
  const admin = await requireAdmin();
  const parsed = shareTokenCreateSchema.safeParse({
    label: formData.get("label") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const token = randomBytes(32).toString("base64url");
  await prisma.shareToken.create({
    data: { token, label: parsed.data.label, createdByUserId: admin.id },
  });

  revalidatePath("/admin/share-links");
  return {};
}

export async function revokeShareTokenAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.shareToken.update({ where: { id }, data: { revokedAt: new Date() } });
  revalidatePath("/admin/share-links");
}
