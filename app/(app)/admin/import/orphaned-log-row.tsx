"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
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
            <select
              name="accountId"
              defaultValue=""
              onChange={() => formRef.current?.requestSubmit()}
              className="border-input h-8 rounded-md border bg-transparent px-2 text-sm"
            >
              <option value="" disabled>
                Choose account…
              </option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
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
