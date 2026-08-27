"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importZohoAccountsAction, type ImportZohoAccountsFormState } from "./zoho-accounts-actions";

const initialState: ImportZohoAccountsFormState = {};

export function ZohoAccountsImportForm() {
  const [state, formAction, pending] = useActionState(importZohoAccountsAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="zoho-accounts-file">Zoho Accounts export (CSV or Excel)</Label>
        <Input id="zoho-accounts-file" name="file" type="file" accept=".csv,.xlsx,.xls" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Syncing..." : "Sync"}
      </Button>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      {(state?.created !== undefined || state?.updated !== undefined) && (
        <div className="space-y-2 text-sm">
          <p className="text-green-600">
            Created {state.created ?? 0}, updated {state.updated ?? 0} account
            {(state.created ?? 0) + (state.updated ?? 0) === 1 ? "" : "s"}.
          </p>
          {state.warnings && state.warnings.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-5 text-amber-600">
              {state.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
          {state.skipped && state.skipped.length > 0 && (
            <div className="space-y-1">
              <p className="text-red-600">
                {state.skipped.length} row{state.skipped.length === 1 ? "" : "s"} skipped:
              </p>
              <ul className="list-disc space-y-0.5 pl-5 text-red-600">
                {state.skipped.map((f, i) => (
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
