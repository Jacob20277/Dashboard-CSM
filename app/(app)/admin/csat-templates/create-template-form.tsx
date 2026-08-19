"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCsatTemplate, type CsatTemplateFormState } from "./actions";

const initialState: CsatTemplateFormState = {};

export function CreateTemplateForm() {
  const [state, formAction, pending] = useActionState(createCsatTemplate, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="name">Template name</Label>
        <Input id="name" name="name" placeholder="e.g. Onboarding" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create template"}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
