"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Member = { id: string; name: string };

export function DashboardScopeSelector({
  basePath,
  members,
  selectedIds,
}: {
  basePath: string;
  members: Member[];
  selectedIds: string[];
}) {
  const router = useRouter();
  const allIds = members.map((m) => m.id);
  // Guard against a selected id that isn't one of the visible options (e.g. a
  // non-CSM's own id) — it would otherwise inflate the count with no checkbox
  // to show for it.
  const validSelectedIds = selectedIds.filter((id) => allIds.includes(id));
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Set<string>>(new Set(validSelectedIds));
  const allSelected = allIds.length > 0 && allIds.every((id) => pending.has(id));

  const label = allSelected
    ? "All CSMs"
    : pending.size === 0
      ? "No one selected"
      : pending.size === 1
        ? members.find((m) => pending.has(m.id))?.name ?? "1 selected"
        : `${pending.size} of ${allIds.length} selected`;

  function toggle(id: string) {
    setPending((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function apply() {
    router.push(`${basePath}?members=${[...pending].join(",")}`);
    setOpen(false);
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setPending(new Set(validSelectedIds));
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" type="button" className="min-w-40 justify-between" />
        }
      >
        {label}
        <ChevronDown className="size-4 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <div className="flex items-center justify-between gap-2 px-1.5 py-1">
          <button
            type="button"
            className="text-primary text-xs font-medium hover:underline"
            onClick={() => setPending(new Set(allIds))}
          >
            Select all
          </button>
          <button
            type="button"
            className="text-muted-foreground text-xs font-medium hover:underline"
            onClick={() => setPending(new Set())}
          >
            Clear
          </button>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {members.map((m) => (
            <label
              key={m.id}
              className="flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent"
            >
              <Checkbox checked={pending.has(m.id)} onCheckedChange={() => toggle(m.id)} />
              {m.name}
            </label>
          ))}
          {members.length === 0 && (
            <p className="text-muted-foreground px-1.5 py-1 text-sm">No CSMs yet.</p>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="px-1.5 py-1">
          <Button size="sm" className="w-full" type="button" onClick={apply}>
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
