import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { matchAccountCandidates } from "@/lib/account-match";
import { getAllAccounts } from "@/lib/dashboard-queries";
import { prisma } from "@/lib/prisma";
import { ImportForm } from "./import-form";
import { ZohoAccountsImportForm } from "./zoho-accounts-import-form";
import { ZohoDealsImportForm } from "./zoho-deals-import-form";
import { OrphanedLogRow } from "./orphaned-log-row";

export default async function AdminImportPage() {
  const [accounts, orphanedLogs] = await Promise.all([
    getAllAccounts(),
    prisma.pendingActivityImport.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Import</h1>

      <Card>
        <CardHeader>
          <CardTitle>Sync Zoho Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground space-y-2 text-sm">
            <p>
              Upload the raw Zoho CRM &quot;Accounts&quot; module export (CSV or Excel) — no need to
              edit columns first. Matches by Zoho&apos;s own Record Id, so uploading the same or a
              refreshed export always updates the same accounts in place; it never touches activity
              logs or deletes anything.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Creates an account the first time a Record Id is seen, updates it after that.</li>
              <li>
                Imports CSM/PAM, industry, phone, website, ARR, tier, project status, health
                status/bucket, churn notes, and the 6 workflow-enabled feature flags.
              </li>
              <li>
                Active/inactive is derived from Project Status (Churned, Onboarding Slippage, and
                On Hold become inactive; everything else, including blank, is active).
              </li>
              <li>Blank or unrecognized CSM/PAM leaves the account&apos;s current CSM untouched.</li>
            </ul>
          </div>
          <ZohoAccountsImportForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Zoho Deals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground space-y-2 text-sm">
            <p>
              Upload the raw Zoho CRM &quot;Deals&quot; module export. Matches each deal to its
              account via Zoho&apos;s own account-record link, and upserts by Deal Record Id, so
              re-uploading is always safe.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Deals whose account isn&apos;t in the app yet are skipped (counted, not failed).</li>
              <li>
                Feeds renewal rate, the 90-day renewal planning list, and upsell identification/
                conversion on the dashboard.
              </li>
            </ul>
          </div>
          <ZohoDealsImportForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk import past activity log entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground space-y-2 text-sm">
            <p>Upload a CSV or Excel file with a header row and these columns, in any order:</p>
            <p className="rounded-md border bg-muted/40 p-2 font-mono text-xs">
              Title, Member, Account, Date, Notes, Duration (min), KPI Tags
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Member</strong>: the person&apos;s email or exact name.
              </li>
              <li>
                <strong>Account</strong>: if it doesn&apos;t match an existing account, the row
                still gets imported — it lands in Orphaned Logs below for you to assign an
                account to.
              </li>
              <li>
                <strong>Date</strong>: <code>YYYY-MM-DD</code>.
              </li>
              <li>
                <strong>KPI Tags</strong>: one or more KPI names separated by <code>;</code>.
                Leave blank to import as unmatched/flagged.
              </li>
            </ul>
          </div>
          <ImportForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orphaned logs ({orphanedLogs.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Rows imported above whose account name didn&apos;t match anything in the master
            accounts list. Pick the right account and the row moves straight into that
            member&apos;s activity; discard it if it shouldn&apos;t be imported at all.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Typed account</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Assign account</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orphanedLogs.map((pending) => (
                <OrphanedLogRow
                  key={pending.id}
                  pending={pending}
                  accounts={accounts}
                  suggestedAccounts={matchAccountCandidates(accounts, pending.rawAccountName)}
                />
              ))}
              {orphanedLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    Nothing orphaned right now.
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
