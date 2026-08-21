import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { KpiTargetRow } from "@/lib/kpi-targets";

function AttainedBadge({ tracked, attained }: { tracked: boolean; attained: boolean | null }) {
  if (!tracked) {
    return <Badge variant="outline">Not tracked</Badge>;
  }
  if (attained === null) {
    return <Badge variant="outline">No data</Badge>;
  }
  return attained ? <Badge>Attained</Badge> : <Badge variant="destructive">Not yet</Badge>;
}

export function KpiTargetsTable({ rows }: { rows: KpiTargetRow[] }) {
  const groups = new Map<string, KpiTargetRow[]>();
  for (const row of rows) {
    const group = groups.get(row.kraName) ?? [];
    group.push(row);
    groups.set(row.kraName, group);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>KRA / KPI targets</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {[...groups.entries()].map(([kraName, kraRows]) => (
              <Fragment key={kraName}>
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={3} className="text-muted-foreground bg-muted/40 font-semibold">
                    {kraName}
                  </TableCell>
                </TableRow>
                {kraRows.map((row) => (
                  <TableRow key={row.targetText}>
                    <TableCell className="max-w-md">
                      <p>{row.targetText}</p>
                      <p className="text-muted-foreground mt-1 text-xs">{row.actualText}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap align-top">
                      <AttainedBadge tracked={row.tracked} attained={row.attained} />
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-sm text-sm">
                      {row.guidance ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
