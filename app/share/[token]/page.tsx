import { DashboardScopeSelector } from "@/components/dashboard-scope-selector";
import { DashboardSummary } from "@/components/dashboard-summary";
import { CsatSummaryCard } from "@/components/csat-summary-card";
import {
  computeAccountTotals,
  computeKpiTotals,
  computeKraTotals,
  getActiveTeamMembers,
  getFlaggedLogs,
  getScopedActivityLogs,
  type DashboardScope,
} from "@/lib/dashboard-queries";
import { computeCsatSummary, getCsatResponses } from "@/lib/csat-queries";
import { prisma } from "@/lib/prisma";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ scope?: string }>;
}) {
  const { token } = await params;
  const { scope: scopeParam } = await searchParams;

  const shareToken = await prisma.shareToken.findUnique({ where: { token } });

  if (!shareToken || shareToken.revokedAt) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-muted-foreground max-w-sm text-center text-sm">
          This link is invalid or has been revoked. Contact the person who shared it with you.
        </p>
      </div>
    );
  }

  await prisma.shareToken.update({
    where: { id: shareToken.id },
    data: { lastAccessedAt: new Date() },
  });

  const members = await getActiveTeamMembers();

  let scope: DashboardScope;
  let selectedValue: string;
  if (scopeParam && members.some((m) => m.id === scopeParam)) {
    scope = { type: "individual", userId: scopeParam };
    selectedValue = scopeParam;
  } else {
    scope = { type: "team" };
    selectedValue = "team";
  }

  const [logs, csatResponses] = await Promise.all([
    getScopedActivityLogs(scope),
    getCsatResponses(),
  ]);
  const kraTotals = computeKraTotals(logs);
  const kpiTotals = computeKpiTotals(logs);
  const accountTotals = computeAccountTotals(logs);
  const flaggedCount = getFlaggedLogs(logs).length;
  const csatSummary = computeCsatSummary(csatResponses);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Dashboard-CSM</h1>
        <DashboardScopeSelector
          basePath={`/share/${token}`}
          value={selectedValue}
          members={members}
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
      />
    </div>
  );
}
