"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccountAction, updateAccountAction, type AccountFormState } from "./actions";

const initialState: AccountFormState = {};

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function healthBadgeVariant(healthStatus: string): "success" | "warning" | "danger" | "outline" {
  if (healthStatus === "Good") return "success";
  if (healthStatus === "Average") return "warning";
  if (healthStatus === "Bad" || healthStatus === "Worse") return "danger";
  return "outline";
}

export function AccountRowForm({
  account,
  renewsAt,
  members,
  isAdmin,
  currentUserId,
}: {
  account: {
    id: string;
    name: string;
    isActive: boolean;
    csmUserId?: string | null;
    healthStatus?: string | null;
    tier?: string | null;
    projectStatus?: string | null;
    annualRecurringRevenue?: number | string | null;
    workflowsEnabledList?: string[];
    renewalDateOverride?: Date | null;
    recoveryPlanNotes?: string | null;
  };
  renewsAt: Date | null;
  members: { id: string; name: string }[];
  isAdmin: boolean;
  currentUserId: string;
}) {
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteAccountAction,
    initialState
  );

  const canEdit = isAdmin || account.csmUserId === currentUserId;
  const csmName = members.find((m) => m.id === account.csmUserId)?.name ?? "No CSM";

  const crmBadges: { label: string; variant: "outline" | "success" | "warning" | "danger" }[] = [
    account.tier && { label: account.tier, variant: "outline" as const },
    account.projectStatus && { label: account.projectStatus, variant: "outline" as const },
    account.healthStatus && {
      label: `Health: ${account.healthStatus}`,
      variant: healthBadgeVariant(account.healthStatus),
    },
    account.annualRecurringRevenue != null && {
      label: `ARR: $${Number(account.annualRecurringRevenue).toLocaleString("en-US")}`,
      variant: "outline" as const,
    },
    renewsAt && { label: `Renews: ${toDateInputValue(renewsAt)}`, variant: "outline" as const },
    ...(account.workflowsEnabledList ?? []).map((w) => ({ label: w, variant: "outline" as const })),
  ].filter((v): v is { label: string; variant: "outline" | "success" | "warning" | "danger" } =>
    Boolean(v)
  );

  if (!canEdit) {
    return (
      <div className="space-y-2">
        {crmBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {crmBadges.map((badge) => (
              <Badge key={badge.label} variant={badge.variant} className="text-xs font-normal">
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-medium">{account.name}</span>
          <span className="text-muted-foreground">{csmName}</span>
          <Badge variant={account.isActive ? "success" : "outline"}>
            {account.isActive ? "Active" : "Inactive"}
          </Badge>
          {account.recoveryPlanNotes && (
            <span className="text-muted-foreground text-xs">
              Recovery plan: {account.recoveryPlanNotes}
            </span>
          )}
          <Link
            href={`/dashboard/accounts/${account.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {crmBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {crmBadges.map((badge) => (
            <Badge key={badge.label} variant={badge.variant} className="text-xs font-normal">
              {badge.label}
            </Badge>
          ))}
        </div>
      )}
      <form
        key={`${account.name}-${account.csmUserId ?? ""}-${account.isActive}-${toDateInputValue(account.renewalDateOverride)}-${account.recoveryPlanNotes ?? ""}`}
        action={updateAccountAction}
        className="flex flex-wrap items-end gap-3"
      >
        <input type="hidden" name="id" value={account.id} />
        <Input name="name" defaultValue={account.name} className="h-8 max-w-xs" required />
        <select
          name="csmUserId"
          defaultValue={account.csmUserId ?? ""}
          className="border-input h-8 rounded-md border bg-transparent px-2 text-sm"
        >
          <option value="">No CSM</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <label className="flex h-8 items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={account.isActive}
            className="h-4 w-4 rounded border-input"
          />
          Active
        </label>
        {renewsAt ? (
          // A real renewal date already exists (from Zoho or a prior manual
          // override) and is shown as the "Renews: ..." badge above — keep
          // the stored override value on submit without exposing an editable
          // (and currently-unused) input for it.
          <input
            type="hidden"
            name="renewalDateOverride"
            value={toDateInputValue(account.renewalDateOverride)}
          />
        ) : (
          <div className="space-y-1">
            <Label htmlFor={`renewal-${account.id}`} className="text-muted-foreground text-xs">
              Renewal date override
            </Label>
            <Input
              id={`renewal-${account.id}`}
              name="renewalDateOverride"
              type="date"
              defaultValue={toDateInputValue(account.renewalDateOverride)}
              className="h-8"
            />
          </div>
        )}
        <div className="min-w-48 flex-1 space-y-1">
          <Label htmlFor={`recovery-${account.id}`} className="text-muted-foreground text-xs">
            Recovery plan notes
          </Label>
          <Input
            id={`recovery-${account.id}`}
            name="recoveryPlanNotes"
            defaultValue={account.recoveryPlanNotes ?? ""}
            className="h-8"
          />
        </div>
        <Button variant="outline" size="sm" type="submit">
          Save
        </Button>
        <Link
          href={`/dashboard/accounts/${account.id}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          View
        </Link>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            type="submit"
            formAction={deleteAction}
            disabled={deletePending}
          >
            {deletePending ? "Deleting..." : "Delete"}
          </Button>
        )}
      </form>
      {deleteState?.error && <p className="text-sm text-red-600">{deleteState.error}</p>}
    </div>
  );
}
