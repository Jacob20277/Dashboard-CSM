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
import { KraBarChart } from "@/components/kra-bar-chart";

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
  isStrategic: boolean;
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
}: {
  kraTotals: KraTotal[];
  kpiTotals: KpiTotal[];
  accountTotals: AccountTotal[];
  flaggedCount: number;
  flagsHref?: string;
  accountHrefBase?: string;
}) {
  const chartData = kraTotals.map((k) => ({
    kraName: k.kraName,
    hours: minutesToHours(k.totalMinutes),
  }));
  const totalMinutes = kraTotals.reduce((sum, k) => sum + k.totalMinutes, 0);
  const totalEntries = kraTotals.reduce((sum, k) => sum + k.entryCount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">Total hours logged</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {minutesToHours(totalMinutes)}h
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">Matched entries</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totalEntries}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">Flagged / unmatched</CardTitle>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hours by KRA</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <KraBarChart data={chartData} />
          ) : (
            <p className="text-muted-foreground text-sm">No matched activity yet.</p>
          )}
        </CardContent>
      </Card>

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
                    {a.isStrategic && (
                      <Badge variant="secondary" className="ml-2">
                        Strategic
                      </Badge>
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
