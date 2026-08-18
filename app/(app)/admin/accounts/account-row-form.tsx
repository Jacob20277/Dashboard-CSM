"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteAccountAction, updateAccountAction, type AccountFormState } from "./actions";

const initialState: AccountFormState = {};

export function AccountRowForm({
  account,
}: {
  account: { id: string; name: string; isActive: boolean };
}) {
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteAccountAction,
    initialState
  );

  return (
    <div className="space-y-1">
      <form action={updateAccountAction} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={account.id} />
        <Input name="name" defaultValue={account.name} className="h-8 max-w-xs" required />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={account.isActive}
            className="h-4 w-4 rounded border-input"
          />
          Active
        </label>
        <Button variant="outline" size="sm" type="submit">
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="submit"
          formAction={deleteAction}
          disabled={deletePending}
        >
          {deletePending ? "Deleting..." : "Delete"}
        </Button>
      </form>
      {deleteState?.error && <p className="text-sm text-red-600">{deleteState.error}</p>}
    </div>
  );
}
