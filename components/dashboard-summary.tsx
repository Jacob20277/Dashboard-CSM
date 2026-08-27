import { CheckCircle2, Clock, Flag, UserX } from "lucide-react";
import Link from "next/link";
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

function minutesToHours(minutes: number) {
  return Math.round((minutes / 60) * 10) / 10;
}

export interface KraTotal {
  kraId: string;
  kraName: string;
  totalMinutes: number;
  entryCount: number;
}

export interface KpiTotal {
  kpiId: string;
  kpiName: string;
  kraName: string;
  totalMinutes: number;
  entryCount: number;
}

export interface AccountTotal {
  accountId: string;
  accountName: string;
  totalMinutes: number;
  entryCount: number;
  flaggedCount: number;
}

export function DashboardSummary({
  kraTotals,
  kpiTotals,
  accountTotals,
  flaggedCount,
  flagsHref,
  accountHrefBase,
  churnedAccountsCount,
  churnedAccountsHref,
  children,
}: {
  kraTotals: KraTotal[];
  kpiTotals: KpiTotal[];
  accountTotals: AccountTotal[];
  flaggedCount: number;
  flagsHref?: string;
  accountHrefBase?: string;
  churnedAccountsCount: number;
  churnedAccountsHref?: string;
  children?: React.ReactNode;
}) {
  const totalMinutes = kraTotals.reduce((sum, k) => sum + k.totalMinutes, 0);
  const totalEntries = kraTotals.reduce((sum, k) => sum + k.entryCount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-primary border-t-4">
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Clock className="size-4" />
              Total hours logged
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {minutesToHours(totalMinutes)}h
          </CardContent>
        </Card>
        <Card className="border-status-success-fg border-t-4">
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="size-4" />
              Matched entries
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totalEntries}</CardContent>
        </Card>
        <Card className="border-status-warning-fg border-t-4">
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Flag className="size-4" />
              Flagged / unmatched
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {flagsHref ? (
              <Link href={flagsHref} className="underline">
                {flaggedCount}
              </Link>
            ) : (
              flaggedCount
            )}
          </CardContent>
        </Card>
        <Card className="border-status-danger-fg border-t-4">
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <UserX className="size-4" />
              Churned accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {churnedAccountsHref ? (
              <Link href={churnedAccountsHref} className="underline">
                {churnedAccountsCount}
              </Link>
            ) : (
              churnedAccountsCount
            )}
          </CardContent>
        </Card>
      </div>

      {children}

      <Card>
        <CardHeader>
          <CardTitle>KPI breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KRA</TableHead>
                <TableHead>KPI</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Entries</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpiTotals.map((k) => (
                <TableRow key={k.kpiId}>
                  <TableCell>{k.kraName}</TableCell>
                  <TableCell>{k.kpiName}</TableCell>
                  <TableCell>{minutesToHours(k.totalMinutes)}h</TableCell>
                  <TableCell>{k.entryCount}</TableCell>
                </TableRow>
              ))}
              {kpiTotals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No matched activity yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By account</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Flagged</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountTotals.map((a) => (
                <TableRow key={a.accountId}>
                  <TableCell>
                    {accountHrefBase ? (
                      <Link href={`${accountHrefBase}/${a.accountId}`} className="underline">
                        {a.accountName}
                      </Link>
                    ) : (
                      a.accountName
                    )}
                  </TableCell>
                  <TableCell>{minutesToHours(a.totalMinutes)}h</TableCell>
                  <TableCell>{a.entryCount}</TableCell>
                  <TableCell>
                    {a.flaggedCount > 0 ? (
                      <Badge variant="destructive">{a.flaggedCount}</Badge>
                    ) : (
                      "0"
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {accountTotals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No activity logged yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
