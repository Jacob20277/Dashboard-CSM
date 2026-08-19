"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  csatTemplateCreateSchema,
  csatTemplateQuestionCreateSchema,
  csatTemplateQuestionRenameSchema,
} from "@/lib/validation";

export type CsatTemplateFormState = { error?: string };

export async function createCsatTemplate(
  _prev: CsatTemplateFormState,
  formData: FormData
): Promise<CsatTemplateFormState> {
  await requireAdmin();
  const parsed = csatTemplateCreateSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const count = await prisma.csatTemplate.count();
  await prisma.csatTemplate.create({
    data: { name: parsed.data.name, sortOrder: count },
  });

  revalidatePath("/admin/csat-templates");
  return {};
}

export async function archiveCsatTemplate(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";
  await prisma.csatTemplate.update({ where: { id }, data: { isActive: !isActive } });
  revalidatePath("/admin/csat-templates");
}

export type AddQuestionFormState = { error?: string };

export async function addTemplateQuestion(
  _prev: AddQuestionFormState,
  formData: FormData
): Promise<AddQuestionFormState> {
  await requireAdmin();
  const parsed = csatTemplateQuestionCreateSchema.safeParse({
    templateId: formData.get("templateId"),
    text: formData.get("text"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const count = await prisma.csatTemplateQuestion.count({
    where: { templateId: parsed.data.templateId },
  });
  await prisma.csatTemplateQuestion.create({
    data: { templateId: parsed.data.templateId, text: parsed.data.text, sortOrder: count },
  });

  revalidatePath("/admin/csat-templates");
  return {};
}

export async function renameTemplateQuestion(formData: FormData) {
  await requireAdmin();
  const parsed = csatTemplateQuestionRenameSchema.safeParse({
    id: formData.get("id"),
    text: formData.get("text"),
  });
  if (!parsed.success) return;

  await prisma.csatTemplateQuestion.update({
    where: { id: parsed.data.id },
    data: { text: parsed.data.text },
  });
  revalidatePath("/admin/csat-templates");
}

export async function deleteTemplateQuestion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.csatTemplateQuestion.delete({ where: { id } });
  revalidatePath("/admin/csat-templates");
}

export async function moveTemplateQuestion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const templateId = String(formData.get("templateId") ?? "");
  const direction = String(formData.get("direction") ?? "");

  const questions = await prisma.csatTemplateQuestion.findMany({
    where: { templateId },
    orderBy: { sortOrder: "asc" },
  });
  const index = questions.findIndex((q) => q.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= questions.length) return;

  const a = questions[index];
  const b = questions[swapWith];
  await prisma.$transaction([
    prisma.csatTemplateQuestion.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.csatTemplateQuestion.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);
  revalidatePath("/admin/csat-templates");
}
