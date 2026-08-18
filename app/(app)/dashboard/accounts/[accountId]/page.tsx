import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ActivityLogTable } from "@/components/activity-log-table";
import { requireUser } from "@/lib/auth-guards";
import { getAccountActivityLogs } from "@/lib/dashboard-queries";
import { prisma } from "@/lib/prisma";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const user = await requireUser();

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) notFound();

  const logs = await getAccountActivityLogs(accountId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">{account.name}</h1>
        {!account.isActive && <Badge variant="outline">Archived</Badge>}
      </div>
      <ActivityLogTable
        logs={logs}
        currentUserId={user.id}
        isAdmin={user.role === "ADMIN"}
        showUser
      />
    </div>
  );
}
