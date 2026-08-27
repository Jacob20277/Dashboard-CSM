import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { KpiTargetRow } from "@/lib/kpi-targets";

function AttainedBadge({ tracked, attained }: { tracked: boolean; attained: boolean | null }) {
  if (!tracked) {
    return <Badge variant="outline">Not tracked</Badge>;
  }
  if (attained === null) {
    return <Badge variant="outline">No data</Badge>;
  }
  return attained ? (
    <Badge variant="success">Attained</Badge>
  ) : (
    <Badge variant="danger">Not yet</Badge>
  );
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
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">{row.actualText}</p>
                      {row.percent != null && (
                        <ProgressBar
                          percent={row.percent}
                          tone={row.attained ? "success" : "danger"}
                          className="max-w-40"
                        />
                      )}
                    </div>
                  )}
                  {row.guidance && (
                    <p className="text-muted-foreground text-xs">→ {row.guidance}</p>
                  )}
                  {row.href && (
                    <Link href={row.href} className="text-primary text-xs underline underline-offset-2">
                      View upcoming renewals
                    </Link>
                  )}
                  {row.details && row.details.length > 0 && (
                    <details className="group">
                      <summary className="text-primary cursor-pointer text-xs underline underline-offset-2">
                        View all {row.details.length} {row.details.length === 1 ? "item" : "items"}
                      </summary>
                      <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-md border p-2">
                        {row.details.map((item, i) => (
                          <li
                            key={`${item.name}-${i}`}
                            className="flex items-center justify-between gap-3 text-xs"
                          >
                            <span className="min-w-0 truncate">{item.name}</span>
                            <span className="flex shrink-0 items-center gap-2">
                              {item.note && (
                                <span className="text-muted-foreground">{item.note}</span>
                              )}
                              <Badge
                                variant={item.status === "covered" ? "success" : "outline"}
                                className="text-[10px]"
                              >
                                {item.status === "covered" ? "✓" : "✗"}
                              </Badge>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </details>
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
