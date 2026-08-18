"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bulkCreateAccountsAction, type BulkAccountFormState } from "./actions";

const initialState: BulkAccountFormState = {};

export function BulkCreateAccountsForm() {
  const [state, formAction, pending] = useActionState(bulkCreateAccountsAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="namesBlob">Account names, separated by #</Label>
        <Textarea
          id="namesBlob"
          name="namesBlob"
          rows={4}
          placeholder="Acme Corp#Beta Inc#Gamma LLC"
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Bulk create accounts"}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.result && (
        <p className="text-sm text-green-600">
          Created {state.result.created} account{state.result.created === 1 ? "" : "s"}
          {state.result.skipped > 0
            ? ` (skipped ${state.result.skipped} that already existed)`
            : ""}
          .
        </p>
      )}
    </form>
  );
}
