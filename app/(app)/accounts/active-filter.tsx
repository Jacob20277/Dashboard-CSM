"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "all", label: "All accounts" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
] as const;

export function ActiveFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = searchParams.get("active") ?? "all";

  function setValue(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("active");
    else params.set("active", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="bg-muted inline-flex items-center gap-0.5 rounded-full p-0.5" role="group">
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => setValue(option.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              selected
                ? "bg-charcoal text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
