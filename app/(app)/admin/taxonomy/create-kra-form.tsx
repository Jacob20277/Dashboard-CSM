"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createKraAction, type TaxonomyFormState } from "./actions";

const initialState: TaxonomyFormState = {};

export function CreateKraForm() {
  const [state, formAction, pending] = useActionState(createKraAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <Input name="name" placeholder="New KRA name" className="h-9 max-w-sm" required />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding..." : "Add KRA"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
