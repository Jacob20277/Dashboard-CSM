"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LogFormState } from "./actions";

type Kra = { id: string; name: string; kpis: { id: string; name: string }[] };
type Account = { id: string; name: string; isStrategic: boolean };

const initialState: LogFormState = {};

export function ActivityLogForm({
  accounts,
  kras,
  action,
  submitLabel = "Log activity",
  defaultValues,
  logId,
}: {
  accounts: Account[];
  kras: Kra[];
  action: (prev: LogFormState, formData: FormData) => Promise<LogFormState>;
  submitLabel?: string;
  defaultValues?: {
    accountId?: string;
    activityDate?: string;
    durationMinutes?: number;
    notes?: string;
    kpiIds?: string[];
  };
  logId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const selectedKpiIds = new Set(defaultValues?.kpiIds ?? []);

  return (
    <form action={formAction} className="space-y-5">
      {logId && <input type="hidden" name="id" value={logId} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="accountId">Account</Label>
          <select
            id="accountId"
            name="accountId"
            defaultValue={defaultValues?.accountId ?? ""}
            required
            className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
          >
            <option value="" disabled>
              Select account
            </option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
                {a.isStrategic ? " (strategic)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activityDate">Date</Label>
          <Input
            id="activityDate"
            name="activityDate"
            type="date"
            defaultValue={defaultValues?.activityDate}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={1}
            step={1}
            defaultValue={defaultValues?.durationMinutes}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes} rows={3} />
      </div>

      <div className="space-y-3">
        <Label>KPI tags</Label>
        <p className="text-muted-foreground text-sm">
          Tag this activity against one or more KPIs. Leaving this blank still saves the entry,
          but flags it as unmatched and excludes it from KPI/KRA totals.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {kras.map((kra) => (
            <div key={kra.id} className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-medium">{kra.name}</p>
              <div className="space-y-1.5">
                {kra.kpis.map((kpi) => (
                  <label key={kpi.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="kpiIds"
                      value={kpi.id}
                      defaultChecked={selectedKpiIds.has(kpi.id)}
                      className="h-4 w-4 rounded border-input"
                    />
                    {kpi.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && !logId && <p className="text-sm text-green-600">Activity logged.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
