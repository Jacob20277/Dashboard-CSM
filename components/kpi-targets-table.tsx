import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <CardContent className="space-y-6">
        {[...groups.entries()].map(([kraName, kraRows]) => (
          <div key={kraName} className="space-y-3">
            <h3 className="text-sm font-semibold">{kraName}</h3>
            <div className="divide-y rounded-lg border">
              {kraRows.map((row) => (
                <div key={row.targetText} className="space-y-1.5 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 text-sm">{row.targetText}</p>
                    <div className="shrink-0">
                      <AttainedBadge tracked={row.tracked} attained={row.attained} />
                    </div>
                  </div>
                  {row.actualText && (
                    <p className="text-muted-foreground text-xs">{row.actualText}</p>
                  )}
                  {row.guidance && (
                    <p className="text-muted-foreground text-xs">→ {row.guidance}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
