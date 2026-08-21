import { DashboardScopeSelector } from "@/components/dashboard-scope-selector";
import { DashboardSummary } from "@/components/dashboard-summary";
import { CsatSummaryCard } from "@/components/csat-summary-card";
import { requireUser } from "@/lib/auth-guards";
import {
  computeAccountTotals,
  computeKpiTotals,
  computeKraTotals,
  getActiveCsmMembers,
  getChurnedAccountsCount,
  getFlaggedLogs,
  getScopedActivityLogs,
  type DashboardScope,
} from "@/lib/dashboard-queries";
import { computeCsatSummary, getCsatResponses } from "@/lib/csat-queries";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; members?: string }>;
}) {
  const user = await requireUser();
  const { scope: scopeParam, members: membersParam } = await searchParams;
  const members = await getActiveCsmMembers();

  let selectedIds: string[];
  if (membersParam !== undefined) {
    const requested = new Set(membersParam.split(",").filter(Boolean));
    selectedIds = members.filter((m) => requested.has(m.id)).map((m) => m.id);
  } else if (scopeParam === "team") {
    selectedIds = members.map((m) => m.id);
  } else if (scopeParam && members.some((m) => m.id === scopeParam)) {
    selectedIds = [scopeParam];
  } else if (user.role === "ADMIN") {
    // Admin isn't a CSM, so "just me" would always be an empty scope — default
    // to everyone instead of a phantom selection the checkbox list can't show.
    selectedIds = members.map((m) => m.id);
  } else {
    selectedIds = [user.id];
  }

  const scope: DashboardScope = { type: "members", userIds: selectedIds };

  const [logs, csatResponses, churnedAccountsCount] = await Promise.all([
    getScopedActivityLogs(scope),
    getCsatResponses(scope),
    getChurnedAccountsCount(),
  ]);
  const kraTotals = computeKraTotals(logs);
  const kpiTotals = computeKpiTotals(logs);
  const accountTotals = computeAccountTotals(logs);
  const flaggedCount = getFlaggedLogs(logs).length;
  const csatSummary = computeCsatSummary(csatResponses);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <DashboardScopeSelector
          basePath="/dashboard"
          members={members}
          selectedIds={selectedIds}
        />
      </div>

      <CsatSummaryCard
        averageScore={csatSummary.averageScore}
        responseCount={csatSummary.responseCount}
      />

      <DashboardSummary
        kraTotals={kraTotals}
        kpiTotals={kpiTotals}
        accountTotals={accountTotals}
        flaggedCount={flaggedCount}
        flagsHref="/dashboard/flags"
        accountHrefBase="/dashboard/accounts"
        churnedAccountsCount={churnedAccountsCount}
        churnedAccountsHref={user.role === "ADMIN" ? "/admin/accounts" : undefined}
      />
    </div>
  );
}
