import { ActivityLogTable } from "@/components/activity-log-table";
import { requireUser } from "@/lib/auth-guards";
import { getFlaggedLogs, getScopedActivityLogs } from "@/lib/dashboard-queries";

export default async function FlagsPage() {
  const user = await requireUser();
  const logs = await getScopedActivityLogs({ type: "team" });
  const flagged = getFlaggedLogs(logs);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Flagged / unmatched activity</h1>
      <p className="text-muted-foreground text-sm">
        These entries were saved but not tagged to any KPI, so they&apos;re excluded from KPI/KRA
        totals. Edit an entry to tag it.
      </p>
      <ActivityLogTable
        logs={flagged}
        currentUserId={user.id}
        isAdmin={user.role === "ADMIN"}
        showUser
      />
    </div>
  );
}
