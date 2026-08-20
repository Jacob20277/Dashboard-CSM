"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createKpiAction, type TaxonomyFormState } from "./actions";

const initialState: TaxonomyFormState = {};

export function CreateKpiForm({ kraId }: { kraId: string }) {
  const [state, formAction, pending] = useActionState(createKpiAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2 pl-4">
      <input type="hidden" name="kraId" value={kraId} />
      <Input name="name" placeholder="New KPI name" className="h-8 max-w-sm" required />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Adding..." : "Add KPI"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
