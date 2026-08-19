"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { csatLinkCreateSchema } from "@/lib/validation";

export type CsatLinkFormState = { error?: string; token?: string };

export async function createCsatLink(
  _prev: CsatLinkFormState,
  formData: FormData
): Promise<CsatLinkFormState> {
  const user = await requireUser();
  const parsed = csatLinkCreateSchema.safeParse({
    accountId: formData.get("accountId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const token = randomBytes(32).toString("base64url");
  await prisma.csatLink.create({
    data: { token, accountId: parsed.data.accountId, createdByUserId: user.id },
  });

  revalidatePath("/csat-links");
  return { token };
}

export async function revokeCsatLink(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.csatLink.update({ where: { id }, data: { revokedAt: new Date() } });
  revalidatePath("/csat-links");
}
