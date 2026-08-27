import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { matchUserByEmailOrName } from "@/lib/user-match";

const WORKFLOW_FLAG_COLUMNS = [
  { column: "Workflows Enabled?", label: "Workflows" },
  { column: "Reports Enabled?", label: "Reports" },
  { column: "Service Task Enabled?", label: "Service Task" },
  { column: "Transfer Order Enabled?", label: "Transfer Order" },
  { column: "CPQ Enabled?", label: "CPQ" },
  { column: "Commissions Enabled?", label: "Commissions" },
] as const;

const NOT_ACTIVE_PROJECT_STATUSES = new Set(["Churned", "Onboarding Slippage", "On Hold"]);

const REQUIRED_HEADERS = ["Record Id", "Account Name"];

export interface ParsedZohoAccountRow {
  rowNumber: number;
  recordId: string;
  accountName: string;
  csm: string;
  industry: string;
  phone: string;
  website: string;
  arr: string;
  tier: string;
  projectStatus: string;
  healthStatus: string;
  healthBucket: string;
  churnNote: string;
  churnReason: string;
  workflowFlags: Record<string, boolean>;
}

export function parseZohoAccountSpreadsheet(buffer: ArrayBuffer): {
  rows: ParsedZohoAccountRow[];
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
      headerError: `Missing column(s): ${missing.join(", ")}. This should be a raw Zoho CRM "Accounts" module export.`,
    };
  }

  const colIndex = (name: string) => header.indexOf(name);
  const cell = (row: unknown[], name: string) => {
    const idx = colIndex(name);
    return idx === -1 ? "" : String(row[idx] ?? "").trim();
  };

  const rows: ParsedZohoAccountRow[] = raw
    .slice(1)
    .map((row, i) => {
      const workflowFlags: Record<string, boolean> = {};
      for (const flag of WORKFLOW_FLAG_COLUMNS) {
        workflowFlags[flag.label] = cell(row, flag.column).toLowerCase() === "true";
      }
      return {
        rowNumber: i + 2,
        recordId: cell(row, "Record Id"),
        accountName: cell(row, "Account Name"),
        csm: cell(row, "CSM/PAM"),
        industry: cell(row, "Zuper industry"),
        phone: cell(row, "Phone"),
        website: cell(row, "Website"),
        arr: cell(row, "Arrived ARR (latest based on Cbee)"),
        tier: cell(row, "Account Tier"),
        projectStatus: cell(row, "Project Status"),
        healthStatus: cell(row, "Customer Health (Manual)"),
        healthBucket: cell(row, "Customer Bucket (Health+Payment)"),
        churnNote: cell(row, "churn note"),
        churnReason: cell(row, "Reason for Churn"),
        workflowFlags,
      };
    })
    .filter((r) => r.recordId && r.accountName);

  return { rows };
}

function parseMoney(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function isActiveFromProjectStatus(projectStatus: string): boolean {
  return !NOT_ACTIVE_PROJECT_STATUSES.has(projectStatus);
}

export interface SyncZohoAccountsResult {
  created: number;
  updated: number;
  skipped: { row: number; reason: string }[];
  warnings: string[];
}

// Contains all real sync logic (no Next.js-specific imports) so it can run
// identically from the admin import server action or from a one-off script.
export async function syncZohoAccounts(buffer: ArrayBuffer): Promise<
  { headerError: string } | SyncZohoAccountsResult
> {
  const { rows, headerError } = parseZohoAccountSpreadsheet(buffer);
  if (headerError) return { headerError };

  const members = await prisma.user.findMany({
    where: { role: "MEMBER" },
    select: { id: true, name: true, email: true },
  });

  const existingByZohoId = new Map(
    (
      await prisma.account.findMany({
        where: { zohoAccountId: { not: null } },
        select: { id: true, zohoAccountId: true },
      })
    ).map((a) => [a.zohoAccountId as string, a.id])
  );

  let created = 0;
  let updated = 0;
  const unmatchedCsmNames = new Set<string>();
  const skipped: { row: number; reason: string }[] = [];

  for (const row of rows) {
    const csmUser = row.csm ? matchUserByEmailOrName(members, row.csm) : undefined;
    if (row.csm && !csmUser) unmatchedCsmNames.add(row.csm);

    const workflowsEnabledList = WORKFLOW_FLAG_COLUMNS.filter((f) => row.workflowFlags[f.label]).map(
      (f) => f.label
    );

    const existingId = existingByZohoId.get(row.recordId);

    const sharedData = {
      name: row.accountName,
      isActive: isActiveFromProjectStatus(row.projectStatus),
      industry: row.industry || null,
      phone: row.phone || null,
      website: row.website || null,
      annualRecurringRevenue: parseMoney(row.arr),
      tier: row.tier || null,
      projectStatus: row.projectStatus || null,
      healthStatus: row.healthStatus || null,
      healthBucket: row.healthBucket || null,
      churnNote: row.churnNote || null,
      churnReason: row.churnReason || null,
      workflowsEnabledCount: workflowsEnabledList.length,
      workflowsEnabledList,
    };

    try {
      if (existingId) {
        await prisma.account.update({
          where: { id: existingId },
          data: {
            ...sharedData,
            // Blank/unmatched CSM leaves the existing assignment untouched.
            ...(csmUser ? { csmUserId: csmUser.id } : {}),
          },
        });
        updated++;
      } else {
        await prisma.account.create({
          data: {
            zohoAccountId: row.recordId,
            csmUserId: csmUser?.id ?? null,
            ...sharedData,
          },
        });
        created++;
      }
    } catch (err) {
      const isUniqueViolation =
        typeof err === "object" && err !== null && "code" in err && err.code === "P2002";
      skipped.push({
        row: row.rowNumber,
        reason: isUniqueViolation
          ? `An account named "${row.accountName}" already exists (duplicate name in the export).`
          : `Failed to save "${row.accountName}": ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  const warnings =
    unmatchedCsmNames.size > 0
      ? [`Unrecognized CSM/PAM name(s), left unassigned: ${[...unmatchedCsmNames].join(", ")}`]
      : [];

  return { created, updated, skipped, warnings };
}
