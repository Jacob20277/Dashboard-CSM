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
import { requireUser } from "@/lib/auth-guards";
import { getActiveCsmMembers, getScopedActiveAccounts } from "@/lib/dashboard-queries";
import { computeUpcomingRenewals } from "@/lib/kpi-targets";
import { RenewalOutreachCheckbox } from "./renewal-outreach-checkbox";

export default async function UpcomingRenewalsPage() {
  const user = await requireUser();
  const members = await getActiveCsmMembers();
  const selectedIds = user.role === "ADMIN" ? members.map((m) => m.id) : [user.id];

  const accounts = await getScopedActiveAccounts(selectedIds);
  const upcoming = computeUpcomingRenewals(accounts, 90);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Upcoming renewals</h1>
          <p className="text-muted-foreground text-sm">
            Accounts renewing in the next 90 days. Tick &quot;Reached out&quot; once renewal
            planning has started — it clears automatically once the next Deals sync shows the
            renewal as won or lost.
          </p>
        </div>
        <Link href="/dashboard" className="text-primary text-sm underline underline-offset-2">
          Back to dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{upcoming.length} renewal{upcoming.length === 1 ? "" : "s"} due</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>CSM</TableHead>
                <TableHead>Renewal date</TableHead>
                <TableHead>Stage / status</TableHead>
                <TableHead className="text-right">Reached out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcoming.map((row) => (
                <TableRow key={row.accountId}>
                  <TableCell>{row.accountName}</TableCell>
                  <TableCell className="text-muted-foreground">{row.csmName ?? "—"}</TableCell>
                  <TableCell>{row.renewalDate.toISOString().slice(0, 10)}</TableCell>
                  <TableCell className="space-x-1">
                    {row.stage && <Badge variant="outline">{row.stage}</Badge>}
                    {row.renewalStatus && <Badge variant="outline">{row.renewalStatus}</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.dealId ? (
                      <RenewalOutreachCheckbox dealId={row.dealId} initialChecked={row.outreachStarted} />
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        No linked Zoho deal
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {upcoming.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No renewals due in the next 90 days.
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
