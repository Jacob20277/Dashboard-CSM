"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  taxonomyCreateKpiSchema,
  taxonomyCreateKraSchema,
  taxonomyRenameSchema,
} from "@/lib/validation";

export type TaxonomyFormState = { error?: string };

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

export async function createKraAction(
  _prev: TaxonomyFormState,
  formData: FormData
): Promise<TaxonomyFormState> {
  await requireAdmin();
  const parsed = taxonomyCreateKraSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { _max } = await prisma.kra.aggregate({ _max: { sortOrder: true } });
  try {
    await prisma.kra.create({
      data: { name: parsed.data.name, sortOrder: (_max.sortOrder ?? -1) + 1 },
    });
  } catch {
    return { error: "A KRA with that name already exists." };
  }

  revalidatePath("/admin/taxonomy");
  return {};
}

export async function createKpiAction(
  _prev: TaxonomyFormState,
  formData: FormData
): Promise<TaxonomyFormState> {
  await requireAdmin();
  const parsed = taxonomyCreateKpiSchema.safeParse({
    kraId: formData.get("kraId"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { _max } = await prisma.kpi.aggregate({
    where: { kraId: parsed.data.kraId },
    _max: { sortOrder: true },
  });
  try {
    await prisma.kpi.create({
      data: {
        kraId: parsed.data.kraId,
        name: parsed.data.name,
        sortOrder: (_max.sortOrder ?? -1) + 1,
      },
    });
  } catch {
    return { error: "This KRA already has a KPI with that name." };
  }

  revalidatePath("/admin/taxonomy");
  return {};
}

export async function deleteKraAction(
  _prev: TaxonomyFormState,
  formData: FormData
): Promise<TaxonomyFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const kpiCount = await prisma.kpi.count({ where: { kraId: id } });
  if (kpiCount > 0) {
    return { error: "Delete this KRA's KPIs first, then delete the KRA." };
  }

  await prisma.kra.delete({ where: { id } });
  revalidatePath("/admin/taxonomy");
  return {};
}

export async function deleteKpiAction(
  _prev: TaxonomyFormState,
  formData: FormData
): Promise<TaxonomyFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const tagCount = await prisma.activityLogKpi.count({ where: { kpiId: id } });
  if (tagCount > 0) {
    return { error: "This KPI has logged activity tagged to it, so it can't be deleted." };
  }

  await prisma.kpi.delete({ where: { id } });
  revalidatePath("/admin/taxonomy");
  return {};
}
