"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearRange() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={from}
        onChange={(e) => setParam("from", e.target.value)}
        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
        aria-label="From date"
      />
      <span className="text-muted-foreground text-sm">to</span>
      <input
        type="date"
        value={to}
        onChange={(e) => setParam("to", e.target.value)}
        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
        aria-label="To date"
      />
      {(from || to) && (
        <button
          type="button"
          onClick={clearRange}
          className="text-muted-foreground text-sm underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}
