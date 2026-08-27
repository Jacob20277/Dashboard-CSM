import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { matchSingleAccount } from "@/lib/account-match";

const REQUIRED_HEADERS = ["Record Id", "Deal Name", "Stage", "Pipeline"];

export interface ParsedZohoDealRow {
  rowNumber: number;
  recordId: string;
  dealName: string;
  accountNameId: string;
  accountName: string;
  stage: string;
  pipeline: string;
  dealType: string;
  renewalStatus: string;
  renewalType: string;
  renewalDate: string;
  isRenewal: string;
  amount: string;
  annualRecurringRevenue: string;
  closingDate: string;
}

export function parseZohoDealSpreadsheet(buffer: ArrayBuffer): {
  rows: ParsedZohoDealRow[];
  headerError?: string;
} {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  if (raw.length === 0) {
    return { rows: [], headerError: "The file is empty." };
  }

  const header = raw[0].map((h) => String(h).trim());
  const missing = REQUIRED_HEADERS.filter((h) => !header.includes(h));
  if (missing.length > 0) {
    return {
      rows: [],
      headerError: `Missing column(s): ${missing.join(", ")}. This should be a raw Zoho CRM "Deals" module export.`,
    };
  }

  const colIndex = (name: string) => header.indexOf(name);
  const cell = (row: unknown[], name: string) => {
    const idx = colIndex(name);
    return idx === -1 ? "" : String(row[idx] ?? "").trim();
  };

  const rows: ParsedZohoDealRow[] = raw
    .slice(1)
    .map((row, i) => ({
      rowNumber: i + 2,
      recordId: cell(row, "Record Id"),
      dealName: cell(row, "Deal Name"),
      accountNameId: cell(row, "Account Name.id"),
      accountName: cell(row, "Account Name"),
      stage: cell(row, "Stage"),
      pipeline: cell(row, "Pipeline"),
      dealType: cell(row, "Deal Type"),
      renewalStatus: cell(row, "Renewal Status"),
      renewalType: cell(row, "Renewal Type"),
      renewalDate: cell(row, "Renewal Date"),
      isRenewal: cell(row, "Renewal"),
      amount: cell(row, "Amount"),
      annualRecurringRevenue: cell(row, "Annual recurring revenue"),
      closingDate: cell(row, "Closing Date"),
    }))
    .filter((r) => r.recordId && r.dealName);

  return { rows };
}

function parseDateOnly(value: string): Date | null {
  if (!value) return null;
  const datePart = value.slice(0, 10);
  const parsed = new Date(`${datePart}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseMoney(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

export interface SyncZohoDealsResult {
  created: number;
  updated: number;
  skippedNoAccount: number;
  skipped: { row: number; reason: string }[];
}

// Contains all real sync logic (no Next.js-specific imports) so it can run
// identically from the admin import server action or from a one-off script.
export async function syncZohoDeals(buffer: ArrayBuffer): Promise<{ headerError: string } | SyncZohoDealsResult> {
  const { rows, headerError } = parseZohoDealSpreadsheet(buffer);
  if (headerError) return { headerError };

  const accounts = await prisma.account.findMany({
    select: { id: true, name: true, zohoAccountId: true },
  });
  const accountsByZohoId = new Map(
    accounts.filter((a) => a.zohoAccountId).map((a) => [a.zohoAccountId as string, a])
  );

  let created = 0;
  let updated = 0;
  let skippedNoAccount = 0;
  const skipped: { row: number; reason: string }[] = [];

  for (const row of rows) {
    // Primary match: exact Zoho record ID (verified reliable — see plan notes).
    // Fallback: fuzzy account-name match, for the rare row with no linked ID.
    const account =
      (row.accountNameId && accountsByZohoId.get(row.accountNameId)) ||
      (row.accountName ? matchSingleAccount(accounts, row.accountName) : undefined);

    if (!account) {
      skippedNoAccount++;
      continue;
    }

    const data = {
      accountId: account.id,
      name: row.dealName,
      pipeline: row.pipeline,
      stage: row.stage,
      dealType: row.dealType || null,
      renewalStatus: row.renewalStatus || null,
      renewalType: row.renewalType || null,
      renewalDate: parseDateOnly(row.renewalDate),
      isRenewal: row.isRenewal.toLowerCase() === "true",
      amount: parseMoney(row.annualRecurringRevenue) ?? parseMoney(row.amount),
      closingDate: parseDateOnly(row.closingDate),
    };

    try {
      const existing = await prisma.crmDeal.findUnique({
        where: { zohoRecordId: row.recordId },
        select: { id: true },
      });
      if (existing) {
        await prisma.crmDeal.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await prisma.crmDeal.create({ data: { zohoRecordId: row.recordId, ...data } });
        created++;
      }
    } catch (err) {
      skipped.push({
        row: row.rowNumber,
        reason: `Failed to save "${row.dealName}": ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  return { created, updated, skippedNoAccount, skipped };
}
