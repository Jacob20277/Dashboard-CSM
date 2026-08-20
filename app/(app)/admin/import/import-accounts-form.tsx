"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importAccountsAction, type ImportAccountsFormState } from "./accounts-actions";

const initialState: ImportAccountsFormState = {};

export function ImportAccountsForm() {
  const [state, formAction, pending] = useActionState(importAccountsAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="accounts-file">CSV or Excel file</Label>
        <Input id="accounts-file" name="file" type="file" accept=".csv,.xlsx,.xls" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Importing..." : "Import"}
      </Button>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      {(state?.imported !== undefined || state?.updated !== undefined) && (
        <div className="space-y-2 text-sm">
          <p className="text-green-600">
            Created {state.imported ?? 0}, updated {state.updated ?? 0} account
            {(state.imported ?? 0) + (state.updated ?? 0) === 1 ? "" : "s"}.
          </p>
          {state.failed && state.failed.length > 0 && (
            <div className="space-y-1">
              <p className="text-red-600">
                {state.failed.length} row{state.failed.length === 1 ? "" : "s"} skipped:
              </p>
              <ul className="list-disc space-y-0.5 pl-5 text-red-600">
                {state.failed.map((f, i) => (
                  <li key={i}>
                    Row {f.row}: {f.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
