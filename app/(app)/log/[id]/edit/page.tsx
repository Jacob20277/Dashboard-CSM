import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth-guards";
import { getActiveAccounts, getAllKrasWithKpis } from "@/lib/dashboard-queries";
import { prisma } from "@/lib/prisma";
import { ActivityLogForm } from "../../activity-log-form";
import { updateActivityLog } from "../../actions";

export default async function EditLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const log = await prisma.activityLog.findUnique({
    where: { id },
    include: { kpiTags: true },
  });

  if (!log) notFound();
  if (log.userId !== user.id && user.role !== "ADMIN") {
    redirect("/log");
  }

  const [accounts, kras] = await Promise.all([getActiveAccounts(), getAllKrasWithKpis()]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit activity entry</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityLogForm
          accounts={accounts}
          kras={kras}
          action={updateActivityLog}
          submitLabel="Save changes"
          logId={log.id}
          defaultValues={{
            title: log.title,
            accountId: log.accountId,
            activityDate: log.activityDate.toISOString().slice(0, 10),
            durationMinutes: log.durationMinutes,
            notes: log.notes ?? undefined,
            kpiIds: log.kpiTags.map((t) => t.kpiId),
            noKpiFit: log.isUnmatched && log.kpiTags.length === 0,
          }}
        />
      </CardContent>
    </Card>
  );
}
