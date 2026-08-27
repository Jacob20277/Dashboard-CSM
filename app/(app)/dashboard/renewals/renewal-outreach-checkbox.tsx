"use client";

import { useTransition } from "react";
import { setRenewalOutreachAction } from "./actions";

export function RenewalOutreachCheckbox({
  dealId,
  initialChecked,
}: {
  dealId: string;
  initialChecked: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      defaultChecked={initialChecked}
      disabled={isPending}
      onChange={(e) => {
        const checked = e.target.checked;
        startTransition(() => {
          void setRenewalOutreachAction(dealId, checked);
        });
      }}
      className="border-input h-4 w-4 rounded"
      aria-label="Reached out"
    />
  );
}
