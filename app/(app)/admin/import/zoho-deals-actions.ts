"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { syncZohoDeals } from "@/lib/zoho-deal-sync";

export type ImportZohoDealsFormState = {
  error?: string;
  created?: number;
  updated?: number;
  skippedNoAccount?: number;
  skipped?: { row: number; reason: string }[];
};

export async function importZohoDealsAction(
  _prev: ImportZohoDealsFormState,
  formData: FormData
): Promise<ImportZohoDealsFormState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a Zoho Deals export (CSV or Excel) to upload." };
  }

  const buffer = await file.arrayBuffer();
  const result = await syncZohoDeals(buffer);
  if ("headerError" in result) {
    return { error: result.headerError };
  }

  revalidatePath("/admin/import");
  revalidatePath("/admin/accounts");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/renewals");

  return result;
}
