import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllAccounts, getCsmMembers } from "@/lib/dashboard-queries";
import { AccountRowForm } from "./account-row-form";
import { CreateAccountForm } from "./create-account-form";
import { DeleteAllAccountsButton } from "./delete-all-accounts-button";

export default async function AdminAccountsPage() {
  const [accounts, members] = await Promise.all([getAllAccounts(), getCsmMembers()]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Accounts</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add account</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAccountForm members={members} />
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
                <TableRow key={account.id} className="border-b-4 border-border">
                  <TableCell className="py-4">
                    <AccountRowForm
                      account={{
                        ...account,
                        annualRecurringRevenue:
                          account.annualRecurringRevenue == null
                            ? null
                            : Number(account.annualRecurringRevenue),
                      }}
                      members={members}
                    />
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

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteAllAccountsButton />
        </CardContent>
      </Card>
    </div>
  );
}
