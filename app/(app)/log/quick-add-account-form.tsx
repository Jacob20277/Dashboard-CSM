"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAccountQuickAction, type QuickAccountFormState } from "./account-actions";

const initialState: QuickAccountFormState = {};

export function QuickAddAccountForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createAccountQuickAction, initialState);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-primary underline"
      >
        + Add a new account
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <Input name="name" placeholder="New account name" className="h-9 max-w-xs" required />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding..." : "Add account"}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="w-full text-sm text-green-600">
          Account added — select it from the Account dropdown below.
        </p>
      )}
    </form>
  );
}
