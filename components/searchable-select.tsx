"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchableSelect({
  name,
  options,
  defaultValue = "",
  placeholder = "Search...",
  onSelect,
  className,
}: {
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  placeholder?: string;
  onSelect?: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === selectedValue);
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  function select(value: string) {
    setSelectedValue(value);
    if (hiddenInputRef.current) hiddenInputRef.current.value = value;
    setOpen(false);
    setQuery("");
    onSelect?.(value);
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <input type="hidden" name={name} ref={hiddenInputRef} defaultValue={defaultValue} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="border-input flex h-8 w-full items-center justify-between gap-1 rounded-md border bg-transparent px-2 text-left text-sm"
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected?.label ?? placeholder}
        </span>
      </button>
      {open && (
        <div className="bg-popover text-popover-foreground ring-foreground/10 absolute z-50 mt-1 w-56 rounded-lg p-1 shadow-md ring-1">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="mb-1 h-8"
          />
          <div className="max-h-56 overflow-y-auto">
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => select(o.value)}
                className={cn(
                  "flex w-full items-center rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent",
                  o.value === selectedValue && "bg-accent"
                )}
              >
                {o.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-muted-foreground px-1.5 py-1 text-sm">No matches.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
