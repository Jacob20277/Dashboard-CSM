"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { csatResponseEditSchema } from "@/lib/validation";

async function revalidateCsatPaths(accountId: string, csatLinkId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/accounts/${accountId}`);
  revalidatePath("/csat-links");
  revalidatePath(`/csat-links/${csatLinkId}`);
}

export async function deleteCsatResponseAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const response = await prisma.csatResponse.delete({
    where: { id },
    select: { accountId: true, csatLinkId: true },
  });

  await revalidateCsatPaths(response.accountId, response.csatLinkId);
}

export type EditCsatResponseFormState = { error?: string };

export async function editCsatResponseAction(
  _prev: EditCsatResponseFormState,
  formData: FormData
): Promise<EditCsatResponseFormState> {
  await requireAdmin();

  const answerIds = formData.getAll("answerId").map(String);
  const scores = formData.getAll("answerScore").map(String);

  const parsed = csatResponseEditSchema.safeParse({
    responseId: formData.get("responseId"),
    respondentName: formData.get("respondentName") || undefined,
    comment: formData.get("comment") || undefined,
    answers: answerIds.map((answerId, i) => ({ answerId, score: scores[i] })),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const response = await prisma.csatResponse.findUnique({
    where: { id: parsed.data.responseId },
    include: { answers: true },
  });
  if (!response) {
    return { error: "Response not found." };
  }

  const validAnswerIds = new Set(response.answers.map((a) => a.id));
  const allBelongToResponse = parsed.data.answers.every((a) => validAnswerIds.has(a.answerId));
  if (!allBelongToResponse || parsed.data.answers.length !== response.answers.length) {
    return { error: "Answers don't match this response. Please reload and try again." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.csatResponse.update({
      where: { id: response.id },
      data: {
        respondentName: parsed.data.respondentName || null,
        comment: parsed.data.comment || null,
      },
    });
    await Promise.all(
      parsed.data.answers.map((a) =>
        tx.csatAnswer.update({ where: { id: a.answerId }, data: { score: a.score } })
      )
    );
  });

  await revalidateCsatPaths(response.accountId, response.csatLinkId);
  redirect(`/dashboard/accounts/${response.accountId}`);
}
