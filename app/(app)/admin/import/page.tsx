import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportForm } from "./import-form";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Import activity</h1>

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
                <strong>Account</strong>: must match an existing account name exactly (create
                accounts first on the Accounts page).
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
    </div>
  );
}
