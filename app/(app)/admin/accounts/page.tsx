import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllAccounts, getTeamMembers } from "@/lib/dashboard-queries";
import { AccountRowForm } from "./account-row-form";
import { BulkCreateAccountsForm } from "./bulk-create-form";
import { CreateAccountForm } from "./create-account-form";

export default async function AdminAccountsPage() {
  const [accounts, members] = await Promise.all([getAllAccounts(), getTeamMembers()]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Accounts</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add account</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAccountForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk create accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <BulkCreateAccountsForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Settings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <AccountRowForm account={account} members={members} />
                  </TableCell>
                </TableRow>
              ))}
              {accounts.length === 0 && (
                <TableRow>
                  <TableCell className="text-muted-foreground">No accounts yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
