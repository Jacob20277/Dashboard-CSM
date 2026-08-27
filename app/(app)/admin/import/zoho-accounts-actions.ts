"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { syncZohoAccounts } from "@/lib/zoho-account-sync";

export type ImportZohoAccountsFormState = {
  error?: string;
  created?: number;
  updated?: number;
  skipped?: { row: number; reason: string }[];
  warnings?: string[];
};

export async function importZohoAccountsAction(
  _prev: ImportZohoAccountsFormState,
  formData: FormData
): Promise<ImportZohoAccountsFormState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a Zoho Accounts export (CSV or Excel) to upload." };
  }

  const buffer = await file.arrayBuffer();
  const result = await syncZohoAccounts(buffer);
  if ("headerError" in result) {
    return { error: result.headerError };
  }

  revalidatePath("/admin/import");
  revalidatePath("/accounts");
  revalidatePath("/log");
  revalidatePath("/dashboard");

  return result;
}
