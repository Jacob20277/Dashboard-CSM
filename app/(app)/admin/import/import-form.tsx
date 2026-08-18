"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importActivityLogsAction, type ImportFormState } from "./actions";

const initialState: ImportFormState = {};

export function ImportForm() {
  const [state, formAction, pending] = useActionState(importActivityLogsAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">CSV or Excel file</Label>
        <Input id="file" name="file" type="file" accept=".csv,.xlsx,.xls" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Importing..." : "Import"}
      </Button>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      {state?.imported !== undefined && (
        <div className="space-y-2 text-sm">
          <p className="text-green-600">
            Imported {state.imported} row{state.imported === 1 ? "" : "s"}.
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
