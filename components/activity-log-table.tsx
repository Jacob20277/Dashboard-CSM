import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteActivityLogAction } from "@/app/(app)/log/actions";

export interface ActivityLogRow {
  id: string;
  title: string;
  activityDate: Date;
  durationMinutes: number;
  notes: string | null;
  isUnmatched: boolean;
  userId: string;
  user: { id: string; name: string };
  account: { id: string; name: string };
  kpiTags: { kpi: { name: string; kra: { name: string } } }[];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function ActivityLogTable({
  logs,
  currentUserId,
  isAdmin,
  showUser = false,
  showAccount = true,
}: {
  logs: ActivityLogRow[];
  currentUserId: string;
  isAdmin: boolean;
  showUser?: boolean;
  showAccount?: boolean;
}) {
  if (logs.length === 0) {
    return <p className="text-muted-foreground text-sm">No activity logged yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Date</TableHead>
          {showUser && <TableHead>Member</TableHead>}
          {showAccount && <TableHead>Account</TableHead>}
          <TableHead>Duration</TableHead>
          <TableHead>KPI tags</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => {
          const canEdit = isAdmin || log.userId === currentUserId;
          return (
            <TableRow key={log.id}>
              <TableCell className="max-w-[12rem] truncate font-medium">{log.title}</TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(log.activityDate)}</TableCell>
              {showUser && <TableCell>{log.user.name}</TableCell>}
              {showAccount && <TableCell>{log.account.name}</TableCell>}
              <TableCell>{log.durationMinutes} min</TableCell>
              <TableCell>
                {log.isUnmatched ? (
                  <Badge variant="destructive">Unmatched</Badge>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {log.kpiTags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag.kpi.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm">{log.notes}</TableCell>
              <TableCell className="text-right">
                {canEdit && (
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/log/${log.id}/edit`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Edit
                    </Link>
                    <form action={deleteActivityLogAction}>
                      <input type="hidden" name="id" value={log.id} />
                      <Button variant="outline" size="sm" type="submit">
                        Delete
                      </Button>
                    </form>
                  </div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
