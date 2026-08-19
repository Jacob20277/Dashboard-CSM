"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { csatResponseSchema } from "@/lib/validation";

export type CsatResponseFormState = { error?: string; success?: boolean };

export async function submitCsatResponse(
  token: string,
  _prev: CsatResponseFormState,
  formData: FormData
): Promise<CsatResponseFormState> {
  const questionIds = formData.getAll("questionId").map(String);
  const scores = formData.getAll("score").map(String);
  const answers = questionIds.map((questionId, i) => ({ questionId, score: scores[i] }));

  const parsed = csatResponseSchema.safeParse({
    answers,
    comment: formData.get("comment") || undefined,
    respondentName: formData.get("respondentName") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const link = await prisma.csatLink.findUnique({
    where: { token },
    include: { questions: true },
  });
  if (!link || link.revokedAt) {
    return { error: "This link is no longer valid." };
  }

  const validQuestionIds = new Set(link.questions.map((q) => q.id));
  const allBelongToLink = parsed.data.answers.every((a) => validQuestionIds.has(a.questionId));
  if (!allBelongToLink || parsed.data.answers.length !== link.questions.length) {
    return { error: "This survey has changed. Please reload the page and try again." };
  }

  await prisma.$transaction(async (tx) => {
    const response = await tx.csatResponse.create({
      data: {
        csatLinkId: link.id,
        accountId: link.accountId,
        comment: parsed.data.comment || null,
        respondentName: parsed.data.respondentName || null,
      },
    });
    await tx.csatAnswer.createMany({
      data: parsed.data.answers.map((a) => ({
        csatResponseId: response.id,
        csatLinkQuestionId: a.questionId,
        score: a.score,
      })),
    });
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/accounts/${link.accountId}`);
  revalidatePath("/csat-links");

  return { success: true };
}
