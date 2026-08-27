"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NO_CSM_VALUE } from "./csm-filter-constants";

export function CsmFilter({ members }: { members: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const options = [...members, { id: NO_CSM_VALUE, name: "No CSM" }];
  const selectedIds = (searchParams.get("csm") ?? "").split(",").filter(Boolean);

  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Set<string>>(new Set(selectedIds));

  const label =
    selectedIds.length === 0
      ? "All CSMs"
      : selectedIds.length === 1
        ? (options.find((m) => m.id === selectedIds[0])?.name ?? "1 selected")
        : `${selectedIds.length} selected`;

  function toggle(id: string) {
    setPending((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    if (pending.size > 0) params.set("csm", [...pending].join(","));
    else params.delete("csm");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setPending(new Set(selectedIds));
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" type="button" className="min-w-40 justify-between" />
        }
      >
        CSM: {label}
        <ChevronDown className="size-4 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <div className="flex items-center justify-between gap-2 px-1.5 py-1">
          <button
            type="button"
            className="text-primary text-xs font-medium hover:underline"
            onClick={() => setPending(new Set(options.map((m) => m.id)))}
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
          {options.map((m) => (
            <label
              key={m.id}
              className="flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent"
            >
              <Checkbox checked={pending.has(m.id)} onCheckedChange={() => toggle(m.id)} />
              {m.name}
            </label>
          ))}
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

