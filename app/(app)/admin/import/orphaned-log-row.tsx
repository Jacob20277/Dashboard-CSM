"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/searchable-select";
import { TableCell, TableRow } from "@/components/ui/table";
import { discardOrphanedLogAction, resolveOrphanedLogAction } from "./orphaned-actions";

export function OrphanedLogRow({
  pending,
  accounts,
}: {
  pending: {
    id: string;
    title: string;
    rawAccountName: string;
    activityDate: Date;
    durationMinutes: number;
    notes: string | null;
    user: { name: string };
  };
  accounts: { id: string; name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <TableRow>
      <TableCell className="max-w-[10rem] truncate">{pending.title}</TableCell>
      <TableCell>{pending.user.name}</TableCell>
      <TableCell className="text-amber-600">{pending.rawAccountName}</TableCell>
      <TableCell className="whitespace-nowrap">
        {new Intl.DateTimeFormat("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(pending.activityDate)}
      </TableCell>
      <TableCell>{pending.durationMinutes} min</TableCell>
      <TableCell className="max-w-xs truncate text-sm">{pending.notes}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <form ref={formRef} action={resolveOrphanedLogAction}>
            <input type="hidden" name="id" value={pending.id} />
            <SearchableSelect
              name="accountId"
              options={accounts.map((a) => ({ value: a.id, label: a.name }))}
              placeholder="Choose account…"
              onSelect={() => formRef.current?.requestSubmit()}
              className="w-48"
            />
          </form>
          <form action={discardOrphanedLogAction}>
            <input type="hidden" name="id" value={pending.id} />
            <Button variant="outline" size="sm" type="submit">
              Discard
            </Button>
          </form>
        </div>
      </TableCell>
    </TableRow>
  );
}
