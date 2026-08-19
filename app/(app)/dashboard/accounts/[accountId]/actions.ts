"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function deleteCsatResponseAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const accountId = String(formData.get("accountId") ?? "");

  await prisma.csatResponse.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/accounts/${accountId}`);
}
