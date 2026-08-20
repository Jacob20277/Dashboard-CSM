import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllAccounts } from "@/lib/dashboard-queries";
import { prisma } from "@/lib/prisma";
import { ImportForm } from "./import-form";
import { ImportAccountsForm } from "./import-accounts-form";
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
          <CardTitle>Bulk import accounts &amp; CSM owners</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground space-y-2 text-sm">
            <p>Upload a CSV or Excel file with a header row and these columns, in any order:</p>
            <p className="rounded-md border bg-muted/40 p-2 font-mono text-xs">
              Account Name, CSM
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Account Name</strong>: creates the account if it doesn&apos;t exist yet,
                or updates its CSM if it does (matched case-insensitively).
              </li>
              <li>
                <strong>CSM</strong>: the member&apos;s email or exact name. Leave blank to clear
                the CSM for that account.
              </li>
            </ul>
          </div>
          <ImportAccountsForm />
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
          <CardTitle>Orphaned logs</CardTitle>
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
                <OrphanedLogRow key={pending.id} pending={pending} accounts={accounts} />
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
