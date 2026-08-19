import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActivityLogTable } from "@/components/activity-log-table";
import { CsatSummaryCard } from "@/components/csat-summary-card";
import { requireUser } from "@/lib/auth-guards";
import { getAccountActivityLogs } from "@/lib/dashboard-queries";
import { computeCsatSummary, getAccountCsatResponses } from "@/lib/csat-queries";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csatResponses.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(r.submittedAt)}
                  </TableCell>
                  <TableCell>{r.score} / 5</TableCell>
                  <TableCell>{r.respondentName ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{r.comment ?? "—"}</TableCell>
                </TableRow>
              ))}
              {csatResponses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No CSAT responses yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
