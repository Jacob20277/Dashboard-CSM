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
  const parsed = csatResponseSchema.safeParse({
    score: formData.get("score"),
    comment: formData.get("comment") || undefined,
    respondentName: formData.get("respondentName") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const link = await prisma.csatLink.findUnique({ where: { token } });
  if (!link || link.revokedAt) {
    return { error: "This link is no longer valid." };
  }

  await prisma.csatResponse.create({
    data: {
      csatLinkId: link.id,
      accountId: link.accountId,
      score: parsed.data.score,
      comment: parsed.data.comment || null,
      respondentName: parsed.data.respondentName || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/accounts/${link.accountId}`);
  revalidatePath("/csat-links");

  return { success: true };
}
