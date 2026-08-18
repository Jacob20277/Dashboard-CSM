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
  searchParams: Promise<{ scope?: string; userId?: string }>;
}) {
  const user = await requireUser();
  const { scope: scopeParam, userId: userIdParam } = await searchParams;
  const members = await getActiveTeamMembers();

  let scope: DashboardScope;
  if (scopeParam === "team") {
    scope = { type: "team" };
  } else if (scopeParam === "individual") {
    const targetId =
      userIdParam && members.some((m) => m.id === userIdParam) ? userIdParam : user.id;
    scope = { type: "individual", userId: targetId };
  } else {
    scope = { type: "me", userId: user.id };
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
        <DashboardScopeSelector
          basePath="/dashboard"
          scope={scope.type}
          userId={scope.type === "individual" ? scope.userId : undefined}
          members={members}
        />
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
