"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  bulkDeleteActivityLogsAction,
  deleteActivityLogAction,
  type BulkDeleteState,
} from "@/app/(app)/log/actions";

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
  enableSelection = false,
}: {
  logs: ActivityLogRow[];
  currentUserId: string;
  isAdmin: boolean;
  showUser?: boolean;
  showAccount?: boolean;
  enableSelection?: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [prevLogs, setPrevLogs] = useState(logs);
  if (logs !== prevLogs) {
    setPrevLogs(logs);
    setSelected(new Set());
  }

  const [dialogOpen, setDialogOpen] = useState(false);
  const [state, formAction, pending] = useActionState<BulkDeleteState, FormData>(
    bulkDeleteActivityLogsAction,
    {}
  );
  const [prevDeletedCount, setPrevDeletedCount] = useState(state.deletedCount);
  if (state.deletedCount !== prevDeletedCount) {
    setPrevDeletedCount(state.deletedCount);
    if (state.deletedCount !== undefined) setDialogOpen(false);
  }

  if (logs.length === 0) {
    return <p className="text-muted-foreground text-sm">No activity logged yet.</p>;
  }

  const selectableIds = logs
    .filter((l) => isAdmin || l.userId === currentUserId)
    .map((l) => l.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(selectableIds) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {enableSelection && selected.size > 0 && (
        <div className="bg-muted flex items-center justify-between rounded-md border p-3">
          <span className="text-sm">{selected.size} selected</span>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button variant="destructive" size="sm" />}>
              Delete {selected.size} entries
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete {selected.size} entries?</DialogTitle>
                <DialogDescription>This cannot be undone.</DialogDescription>
              </DialogHeader>
              {state.error && <p className="text-sm text-destructive">{state.error}</p>}
              <form action={formAction}>
                {[...selected].map((id) => (
                  <input key={id} type="hidden" name="ids" value={id} />
                ))}
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" type="button" />}>
                    Cancel
                  </DialogClose>
                  <Button type="submit" variant="destructive" disabled={pending}>
                    {pending ? "Deleting..." : "Confirm delete"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {enableSelection && (
              <TableHead className="w-8">
                <Checkbox checked={allSelected} onCheckedChange={(checked) => toggleAll(checked)} />
              </TableHead>
            )}
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
                {enableSelection && (
                  <TableCell>
                    {canEdit && (
                      <Checkbox
                        checked={selected.has(log.id)}
                        onCheckedChange={(checked) => toggleOne(log.id, checked)}
                      />
                    )}
                  </TableCell>
                )}
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
    </div>
  );
}
