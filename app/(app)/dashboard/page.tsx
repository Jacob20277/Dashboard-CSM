import { DashboardScopeSelector } from "@/components/dashboard-scope-selector";
import { DashboardSummary } from "@/components/dashboard-summary";
import { requireUser } from "@/lib/auth-guards";
import {
  computeAccountTotals,
  computeKpiTotals,
  computeKraTotals,
  getActiveTeamMembers,
  getFlaggedLogs,
  getScopedActivityLogs,
  type DashboardScope,
} from "@/lib/dashboard-queries";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const user = await requireUser();
  const { scope: scopeParam } = await searchParams;
  const members = await getActiveTeamMembers();

  let scope: DashboardScope;
  let selectedValue: string;
  if (scopeParam === "team") {
    scope = { type: "team" };
    selectedValue = "team";
  } else if (scopeParam && members.some((m) => m.id === scopeParam)) {
    scope = { type: "individual", userId: scopeParam };
    selectedValue = scopeParam;
  } else {
    scope = { type: "individual", userId: user.id };
    selectedValue = user.id;
  }

  const logs = await getScopedActivityLogs(scope);
  const kraTotals = computeKraTotals(logs);
  const kpiTotals = computeKpiTotals(logs);
  const accountTotals = computeAccountTotals(logs);
  const flaggedCount = getFlaggedLogs(logs).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <DashboardScopeSelector basePath="/dashboard" value={selectedValue} members={members} />
      </div>

      <DashboardSummary
        kraTotals={kraTotals}
        kpiTotals={kpiTotals}
        accountTotals={accountTotals}
        flaggedCount={flaggedCount}
        flagsHref="/dashboard/flags"
        accountHrefBase="/dashboard/accounts"
      />
    </div>
  );
}
