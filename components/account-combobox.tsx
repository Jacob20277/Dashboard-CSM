"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export function AccountCombobox({
  accounts,
  name = "accountId",
  defaultAccountId,
}: {
  accounts: { id: string; name: string }[];
  name?: string;
  defaultAccountId?: string;
}) {
  const [query, setQuery] = useState(
    () => accounts.find((a) => a.id === defaultAccountId)?.name ?? ""
  );
  const [selectedId, setSelectedId] = useState(defaultAccountId ?? "");
  const [open, setOpen] = useState(false);

  const filtered = query.trim()
    ? accounts.filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase()))
    : accounts;

  function selectAccount(account: { id: string; name: string }) {
    setSelectedId(account.id);
    setQuery(account.name);
    setOpen(false);
  }

  function handleBlur() {
    setTimeout(() => {
      const current = accounts.find((a) => a.id === selectedId);
      setQuery(current ? current.name : "");
      setOpen(false);
    }, 150);
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selectedId} />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedId("");
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder="Type to search accounts..."
        autoComplete="off"
      />
      {open && (
        <div className="bg-popover text-popover-foreground absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border shadow-md">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground px-3 py-2 text-sm">No matching accounts</p>
          ) : (
            filtered.map((a) => (
              <button
                key={a.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectAccount(a)}
                className="hover:bg-muted block w-full px-3 py-2 text-left text-sm"
              >
                {a.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
