"use client";

import { useRouter } from "next/navigation";

type Member = { id: string; name: string };

export function DashboardScopeSelector({
  basePath,
  scope,
  userId,
  members,
  showMeOption = true,
}: {
  basePath: string;
  scope: string;
  userId?: string;
  members: Member[];
  showMeOption?: boolean;
}) {
  const router = useRouter();

  function navigate(nextScope: string, nextUserId?: string) {
    const params = new URLSearchParams();
    params.set("scope", nextScope);
    if (nextScope === "individual") {
      params.set("userId", nextUserId ?? members[0]?.id ?? "");
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={scope}
        onChange={(e) => navigate(e.target.value, userId)}
        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
      >
        {showMeOption && <option value="me">My view</option>}
        <option value="team">Team</option>
        <option value="individual">Individual</option>
      </select>

      {scope === "individual" && (
        <select
          value={userId ?? members[0]?.id ?? ""}
          onChange={(e) => navigate("individual", e.target.value)}
          className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
