import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLogTable } from "@/components/activity-log-table";
import { requireUser } from "@/lib/auth-guards";
import { getActiveAccounts, getLoggableKras, getScopedActivityLogs } from "@/lib/dashboard-queries";
import { todayInOrgTimezone } from "@/lib/timezone";
import { ActivityLogForm } from "./activity-log-form";
import { createActivityLog } from "./actions";

export default async function LogPage() {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const [accounts, kras, logs] = await Promise.all([
    getActiveAccounts(),
    getLoggableKras(),
    getScopedActivityLogs(
      isAdmin ? { type: "team" } : { type: "individual", userId: user.id }
    ),
  ]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Log Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityLogForm
            accounts={accounts}
            kras={kras}
            action={createActivityLog}
            defaultValues={{ activityDate: todayInOrgTimezone() }}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {isAdmin ? "All team entries" : "Your recent entries"}
        </h2>
        <ActivityLogTable logs={logs} currentUserId={user.id} isAdmin={isAdmin} showUser={isAdmin} />
      </div>
    </div>
  );
}
