import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { updateAccountAction } from "./actions";
import { CreateAccountForm } from "./create-account-form";

export default async function AdminAccountsPage() {
  const accounts = await getAllAccounts();

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
          <CardTitle>All accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Settings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    {account.name}
                    {!account.isActive && (
                      <Badge variant="outline" className="ml-2">
                        Archived
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <form action={updateAccountAction} className="flex items-center gap-4">
                      <input type="hidden" name="id" value={account.id} />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="isStrategic"
                          defaultChecked={account.isStrategic}
                          className="h-4 w-4 rounded border-input"
                        />
                        Strategic
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="isActive"
                          defaultChecked={account.isActive}
                          className="h-4 w-4 rounded border-input"
                        />
                        Active
                      </label>
                      <Button variant="outline" size="sm" type="submit">
                        Save
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground">
                    No accounts yet.
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
