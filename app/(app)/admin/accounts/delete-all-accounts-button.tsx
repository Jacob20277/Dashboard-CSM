"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { deleteAllAccountsAction, type WipeAccountsState } from "./danger-actions";

const initialState: WipeAccountsState = {};

export function DeleteAllAccountsButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteAllAccountsAction, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" type="button" />}>
        Delete ALL accounts, activity logs &amp; CSAT data
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>This permanently deletes everything</DialogTitle>
          <DialogDescription>
            Every account, every activity log entry, every CSAT link, and every CSAT response
            will be deleted. This cannot be undone. Type <strong>DELETE</strong> to confirm.
          </DialogDescription>
        </DialogHeader>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.result && (
          <p className="text-sm text-green-600">
            Deleted {state.result.accounts} accounts, {state.result.activityLogs} activity logs,{" "}
            {state.result.csatLinks} CSAT links, {state.result.csatResponses} CSAT responses.
          </p>
        )}
        <form action={formAction} className="space-y-3">
          <Input name="confirm" placeholder="Type DELETE" required />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cancel</DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Deleting..." : "Confirm delete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
