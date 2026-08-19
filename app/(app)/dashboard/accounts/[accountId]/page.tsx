import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLogTable } from "@/components/activity-log-table";
import { CsatSummaryCard } from "@/components/csat-summary-card";
import { CsatResponseTable } from "@/components/csat-response-table";
import { requireUser } from "@/lib/auth-guards";
import { getAccountActivityLogs } from "@/lib/dashboard-queries";
import { computeCsatSummary, getAccountCsatResponses } from "@/lib/csat-queries";
import { prisma } from "@/lib/prisma";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const user = await requireUser();

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) notFound();

  const [logs, csatResponses] = await Promise.all([
    getAccountActivityLogs(accountId),
    getAccountCsatResponses(accountId),
  ]);
  const csatSummary = computeCsatSummary(csatResponses);
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">{account.name}</h1>
        {!account.isActive && <Badge variant="outline">Archived</Badge>}
      </div>

      <CsatSummaryCard
        averageScore={csatSummary.averageScore}
        responseCount={csatSummary.responseCount}
      />

      <Card>
        <CardHeader>
          <CardTitle>CSAT responses</CardTitle>
        </CardHeader>
        <CardContent>
          <CsatResponseTable responses={csatResponses} isAdmin={isAdmin} />
        </CardContent>
      </Card>

      <ActivityLogTable
        logs={logs}
        currentUserId={user.id}
        isAdmin={user.role === "ADMIN"}
        showUser
      />
    </div>
  );
}
