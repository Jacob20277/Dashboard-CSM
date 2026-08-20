"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Account = { id: string; name: string };
type Member = { id: string; name: string };
type Kra = { id: string; name: string; kpis: { id: string; name: string }[] };

export function ActivityLogFilters({
  accounts,
  kras,
  members,
}: {
  accounts: Account[];
  kras: Kra[];
  members?: Member[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = ["userId", "accountId", "kpiId", "from", "to"].some((key) =>
    searchParams.get(key)
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      {members && (
        <select
          value={searchParams.get("userId") ?? ""}
          onChange={(e) => setParam("userId", e.target.value)}
          className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
        >
          <option value="">All team members</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      )}
      <select
        value={searchParams.get("accountId") ?? ""}
        onChange={(e) => setParam("accountId", e.target.value)}
        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
      >
        <option value="">All accounts</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <select
        value={searchParams.get("kpiId") ?? ""}
        onChange={(e) => setParam("kpiId", e.target.value)}
        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
      >
        <option value="">All KPIs</option>
        {kras.map((kra) => (
          <optgroup key={kra.id} label={kra.name}>
            {kra.kpis.map((kpi) => (
              <option key={kpi.id} value={kpi.id}>
                {kpi.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <input
        type="date"
        value={searchParams.get("from") ?? ""}
        onChange={(e) => setParam("from", e.target.value)}
        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
      />
      <input
        type="date"
        value={searchParams.get("to") ?? ""}
        onChange={(e) => setParam("to", e.target.value)}
        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
      />
      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="text-muted-foreground text-sm underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
