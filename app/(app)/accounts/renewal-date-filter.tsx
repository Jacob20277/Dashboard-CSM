"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

function lastDayOfMonth(year: number, monthIndex: number): string {
  const date = new Date(Date.UTC(year, monthIndex + 1, 0));
  return date.toISOString().slice(0, 10);
}

// If the current from/to range exactly spans one calendar month, reflect it
// in the <input type="month">; otherwise leave it blank rather than guess.
function monthValueFromRange(from: string, to: string): string {
  if (!from || !to) return "";
  const [fy, fm, fd] = from.split("-").map(Number);
  if (fd !== 1) return "";
  if (to !== lastDayOfMonth(fy, fm - 1)) return "";
  return `${from.slice(0, 7)}`;
}

export function RenewalDateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("renewalFrom") ?? "";
  const to = searchParams.get("renewalTo") ?? "";
  const monthValue = monthValueFromRange(from, to);

  function setParams(entries: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(entries)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function setMonth(value: string) {
    if (!value) {
      setParams({ renewalFrom: "", renewalTo: "" });
      return;
    }
    const [year, month] = value.split("-").map(Number);
    setParams({
      renewalFrom: `${value}-01`,
      renewalTo: lastDayOfMonth(year, month - 1),
    });
  }

  function clear() {
    setParams({ renewalFrom: "", renewalTo: "" });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-sm">Renews:</span>
      <input
        type="date"
        value={from}
        onChange={(e) => setParams({ renewalFrom: e.target.value })}
        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
        aria-label="Renewal date from"
      />
      <span className="text-muted-foreground text-sm">to</span>
      <input
        type="date"
        value={to}
        onChange={(e) => setParams({ renewalTo: e.target.value })}
        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
        aria-label="Renewal date to"
      />
      <span className="text-muted-foreground text-sm">or month:</span>
      <input
        type="month"
        value={monthValue}
        onChange={(e) => setMonth(e.target.value)}
        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
        aria-label="Renewal month"
      />
      {(from || to) && (
        <button type="button" onClick={clear} className="text-muted-foreground text-sm underline">
          Clear
        </button>
      )}
    </div>
  );
}
