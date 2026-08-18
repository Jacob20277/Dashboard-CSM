"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { taxonomyRenameSchema } from "@/lib/validation";

export async function renameKraAction(formData: FormData) {
  await requireAdmin();
  const parsed = taxonomyRenameSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });
  if (!parsed.success) return;

  await prisma.kra.update({ where: { id: parsed.data.id }, data: { name: parsed.data.name } });
  revalidatePath("/admin/taxonomy");
}

export async function renameKpiAction(formData: FormData) {
  await requireAdmin();
  const parsed = taxonomyRenameSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });
  if (!parsed.success) return;

  await prisma.kpi.update({ where: { id: parsed.data.id }, data: { name: parsed.data.name } });
  revalidatePath("/admin/taxonomy");
}
