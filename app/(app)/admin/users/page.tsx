import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTeamMembers } from "@/lib/dashboard-queries";
import { resetPasswordAction, setUserActiveAction } from "./actions";
import { CreateUserForm } from "./create-user-form";

export default async function AdminUsersPage() {
  const users = await getTeamMembers();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Users</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add team member</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "secondary" : "destructive"}>
                      {u.isActive ? "Active" : "Deactivated"}
                    </Badge>
                    {u.mustChangePassword && (
                      <Badge variant="outline" className="ml-2">
                        Must change password
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.role === "MEMBER" ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <form action={setUserActiveAction}>
                          <input type="hidden" name="id" value={u.id} />
                          <input
                            type="hidden"
                            name="nextActive"
                            value={(!u.isActive).toString()}
                          />
                          <Button variant="outline" size="sm" type="submit">
                            {u.isActive ? "Deactivate" : "Reactivate"}
                          </Button>
                        </form>
                        <form action={resetPasswordAction} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={u.id} />
                          <Input
                            name="newPassword"
                            type="text"
                            placeholder="New temp password"
                            minLength={8}
                            className="h-8 w-40"
                          />
                          <Button variant="outline" size="sm" type="submit">
                            Reset password
                          </Button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Shared admin login</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
