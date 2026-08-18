"use client";

import { useRouter } from "next/navigation";

type Member = { id: string; name: string };

export function DashboardScopeSelector({
  basePath,
  value,
  members,
}: {
  basePath: string;
  value: string;
  members: Member[];
}) {
  const router = useRouter();

  return (
    <select
      value={value}
      onChange={(e) => router.push(`${basePath}?scope=${e.target.value}`)}
      className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
    >
      <option value="team">Team</option>
      {members.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
