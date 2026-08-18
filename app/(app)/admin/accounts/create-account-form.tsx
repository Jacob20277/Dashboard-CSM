"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAccountAction, type AccountFormState } from "./actions";

const initialState: AccountFormState = {};

export function CreateAccountForm() {
  const [state, formAction, pending] = useActionState(createAccountAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="name">Account name</Label>
        <Input id="name" name="name" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add account"}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
