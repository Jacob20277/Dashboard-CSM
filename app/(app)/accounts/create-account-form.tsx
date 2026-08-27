"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAccountAction, type AccountFormState } from "./actions";

const initialState: AccountFormState = {};

export function CreateAccountForm({ members }: { members: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createAccountAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="name">Account name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="csmUserId">CSM (optional)</Label>
        <select
          id="csmUserId"
          name="csmUserId"
          defaultValue=""
          className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
        >
          <option value="">No CSM</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add account"}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
