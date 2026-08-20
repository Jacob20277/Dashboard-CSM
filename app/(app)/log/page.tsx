import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLogTable } from "@/components/activity-log-table";
import { ActivityLogFilters } from "@/components/activity-log-filters";
import { requireUser } from "@/lib/auth-guards";
import {
  getActiveAccounts,
  getAllAccounts,
  getAllKrasWithKpis,
  getScopedActivityLogs,
  getTeamMembers,
  type DashboardScope,
} from "@/lib/dashboard-queries";
import { todayInOrgTimezone } from "@/lib/timezone";
import { ActivityLogForm } from "./activity-log-form";
import { createActivityLog } from "./actions";
import { QuickAddAccountForm } from "./quick-add-account-form";

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{
    userId?: string;
    accountId?: string;
    kpiId?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const params = await searchParams;

  const [accounts, allAccounts, kras, members] = await Promise.all([
    getActiveAccounts(),
    getAllAccounts(),
    getAllKrasWithKpis(),
    isAdmin ? getTeamMembers() : Promise.resolve([]),
  ]);

  let scope: DashboardScope;
  if (!isAdmin) {
    scope = { type: "individual", userId: user.id };
  } else if (params.userId && members.some((m) => m.id === params.userId)) {
    scope = { type: "individual", userId: params.userId };
  } else {
    scope = { type: "team" };
  }

  const logs = await getScopedActivityLogs(
    scope,
    {
      from: params.from ? new Date(params.from) : undefined,
      to: params.to ? new Date(params.to) : undefined,
    },
    { accountId: params.accountId || undefined, kpiId: params.kpiId || undefined }
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Log Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAdmin && <QuickAddAccountForm />}
          <ActivityLogForm
            accounts={accounts}
            kras={kras}
            action={createActivityLog}
            defaultValues={{ activityDate: todayInOrgTimezone() }}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            {isAdmin ? "All team entries" : "Your recent entries"}
          </h2>
          <Suspense fallback={null}>
            <ActivityLogFilters
              accounts={allAccounts}
              kras={kras}
              members={isAdmin ? members : undefined}
            />
          </Suspense>
        </div>
        <ActivityLogTable
          logs={logs}
          currentUserId={user.id}
          isAdmin={isAdmin}
          showUser={isAdmin}
          enableSelection
        />
      </div>
    </div>
  );
}
