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
import { computeAccountRenewalDate } from "@/lib/kpi-targets";
import { AccountRowForm } from "./account-row-form";
import { CreateAccountForm } from "./create-account-form";
import { DeleteAllAccountsButton } from "./delete-all-accounts-button";
import { CsmFilter } from "./csm-filter";
import { NO_CSM_VALUE } from "./csm-filter-constants";
import { RenewalDateFilter } from "./renewal-date-filter";
import { ActiveFilter } from "./active-filter";
import { AccountsPagination } from "./accounts-pagination";

const PAGE_SIZE = 50;

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{
    csm?: string;
    renewalFrom?: string;
    renewalTo?: string;
    active?: string;
    page?: string;
  }>;
}) {
  const { csm, renewalFrom, renewalTo, active, page: pageParam } = await searchParams;
  const [accounts, members] = await Promise.all([getAllAccounts(), getCsmMembers()]);

  const selectedCsmIds = (csm ?? "").split(",").filter(Boolean);
  const renewalFromDate = renewalFrom ? new Date(`${renewalFrom}T00:00:00.000Z`) : null;
  const renewalToDate = renewalTo ? new Date(`${renewalTo}T23:59:59.999Z`) : null;
  const hasDateFilter = Boolean(renewalFromDate || renewalToDate);

  const filteredAccounts = accounts.filter((account) => {
    if (active === "true" && !account.isActive) return false;
    if (active === "false" && account.isActive) return false;
    if (selectedCsmIds.length > 0) {
      const matchesCsm = selectedCsmIds.includes(account.csmUserId ?? NO_CSM_VALUE);
      if (!matchesCsm) return false;
    }
    if (hasDateFilter) {
      const renewsAt = computeAccountRenewalDate(account);
      if (!renewsAt) return false;
      if (renewalFromDate && renewsAt < renewalFromDate) return false;
      if (renewalToDate && renewsAt > renewalToDate) return false;
    }
    return true;
  });

  const pageCount = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), pageCount);
  const pagedAccounts = filteredAccounts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>
              All accounts ({filteredAccounts.length} of {accounts.length})
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <ActiveFilter />
              <CsmFilter members={members} />
              <RenewalDateFilter />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Settings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedAccounts.map((account) => (
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
                      renewsAt={computeAccountRenewalDate(account)}
                      members={members}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filteredAccounts.length === 0 && (
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    {accounts.length === 0 ? "No accounts yet." : "No accounts match these filters."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <AccountsPagination
            page={page}
            pageCount={pageCount}
            totalCount={filteredAccounts.length}
            currentParams={{ csm, renewalFrom, renewalTo, active }}
          />
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
