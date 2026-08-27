"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
      aria-label="Active status"
    >
      <option value="all">All accounts</option>
      <option value="true">Active only</option>
      <option value="false">Inactive only</option>
    </select>
  );
}
