"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function setRenewalOutreachAction(dealId: string, reachedOut: boolean) {
  await requireUser();

  await prisma.crmDeal.update({
    where: { id: dealId },
    data: { renewalOutreachAt: reachedOut ? new Date() : null },
  });

  revalidatePath("/dashboard/renewals");
  revalidatePath("/dashboard");
}
