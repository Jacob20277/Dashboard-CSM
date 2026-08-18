"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createShareTokenAction, type ShareTokenFormState } from "./actions";

const initialState: ShareTokenFormState = {};

export function CreateShareTokenForm() {
  const [state, formAction, pending] = useActionState(createShareTokenAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="label">Label (optional)</Label>
        <Input id="label" name="label" placeholder="e.g. SLT link" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create link"}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
