"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteAccountAction, updateAccountAction, type AccountFormState } from "./actions";

const initialState: AccountFormState = {};

export function AccountRowForm({
  account,
  members,
}: {
  account: { id: string; name: string; isActive: boolean; csmUserId?: string | null };
  members: { id: string; name: string }[];
}) {
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteAccountAction,
    initialState
  );

  return (
    <div className="space-y-1">
      <form
        key={`${account.name}-${account.csmUserId ?? ""}-${account.isActive}`}
        action={updateAccountAction}
        className="flex flex-wrap items-center gap-3"
      >
        <input type="hidden" name="id" value={account.id} />
        <Input name="name" defaultValue={account.name} className="h-8 max-w-xs" required />
        <select
          name="csmUserId"
          defaultValue={account.csmUserId ?? ""}
          className="border-input h-8 rounded-md border bg-transparent px-2 text-sm"
        >
          <option value="">No CSM</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
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
        <Link
          href={`/dashboard/accounts/${account.id}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          View
        </Link>
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
