"use client";

import { useActionState } from "react";
import { AccountCombobox } from "@/components/account-combobox";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCsatLink, type CsatLinkFormState } from "./actions";

const initialState: CsatLinkFormState = {};

export function CreateCsatLinkForm({ accounts }: { accounts: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createCsatLink, initialState);
  const url =
    state?.token && typeof window !== "undefined"
      ? `${window.location.origin}/csat/${state.token}`
      : undefined;

  return (
    <div className="space-y-4">
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div className="w-64 space-y-2">
          <Label htmlFor="accountId">Account</Label>
          <AccountCombobox accounts={accounts} />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Generating..." : "Generate link"}
        </Button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {url && (
        <div className="flex items-center gap-2">
          <Input readOnly value={url} className="h-8 max-w-md text-xs" />
          <CopyButton text={url} />
        </div>
      )}
    </div>
  );
}
