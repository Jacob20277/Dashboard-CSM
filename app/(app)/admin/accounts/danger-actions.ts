"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export type WipeAccountsState = {
  error?: string;
  result?: {
    csatResponses: number;
    csatLinks: number;
    activityLogs: number;
    orphanedLogs: number;
    accounts: number;
  };
};

export async function deleteAllAccountsAction(
  _prev: WipeAccountsState,
  formData: FormData
): Promise<WipeAccountsState> {
  await requireAdmin();

  if (formData.get("confirm") !== "DELETE") {
    return { error: 'Type "DELETE" to confirm.' };
  }

  const result = await prisma.$transaction(async (tx) => {
    // Deletion order respects FK constraints: CsatResponse and CsatLink both
    // restrict on Account, and CsatResponse restricts on CsatLink. CsatAnswer,
    // CsatLinkQuestion, and ActivityLogKpi all cascade automatically from these.
    const csatResponses = await tx.csatResponse.deleteMany({});
    const csatLinks = await tx.csatLink.deleteMany({});
    const activityLogs = await tx.activityLog.deleteMany({});
    // Orphaned/pending activity imports have no FK to Account, so the deletes
    // above never touched them — but they're the same category of test data.
    const orphanedLogs = await tx.pendingActivityImport.deleteMany({});
    const accounts = await tx.account.deleteMany({});
    return {
      csatResponses: csatResponses.count,
      csatLinks: csatLinks.count,
      activityLogs: activityLogs.count,
      orphanedLogs: orphanedLogs.count,
      accounts: accounts.count,
    };
  });

  revalidatePath("/admin/accounts");
  revalidatePath("/admin/import");
  revalidatePath("/log");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/flags");

  return { result };
}
