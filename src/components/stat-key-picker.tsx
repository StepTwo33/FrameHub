"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatPickerOption } from "@/lib/override-stat-catalog";

type StatKeyPickerProps = {
  value: string;
  onChange: (value: string) => void;
  options: StatPickerOption[];
  placeholder?: string;
  className?: string;
  /** Allow typing a custom internal key not in the catalog. */
  allowCustom?: boolean;
};

export function StatKeyPicker({
  value,
  onChange,
  options,
  placeholder = "Choose a stat…",
  className,
  allowCustom = true,
}: StatKeyPickerProps) {
  const knownValues = useMemo(() => new Set(options.map((o) => o.value)), [options]);
  const isKnown = knownValues.has(value);
  const [customMode, setCustomMode] = useState(!isKnown && value !== "");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const filteredGrouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? options.filter(
          (o) =>
            o.value.toLowerCase().includes(q) ||
            o.label.toLowerCase().includes(q) ||
            (o.group ?? "").toLowerCase().includes(q),
        )
      : options;

    const map = new Map<string, StatPickerOption[]>();
    for (const opt of filtered) {
      const group = opt.group || "Other";
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(opt);
    }
    for (const opts of map.values()) {
      opts.sort((a, b) => a.label.localeCompare(b.label));
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [options, query]);

  const selectedLabel = isKnown
    ? options.find((o) => o.value === value)?.label ?? value
    : value || placeholder;

  return (
    <div ref={rootRef} className={cn("relative space-y-1.5", className)}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setQuery("");
        }}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-border bg-background px-2 text-left text-sm"
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {customMode && value ? (
            <span className="font-mono text-xs">{value}</span>
          ) : (
            selectedLabel
          )}
        </span>
        <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="relative border-b border-border p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stats…"
              className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filteredGrouped.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">No matching stats</p>
            ) : (
              filteredGrouped.map(([group, opts]) => (
                <div key={group} className="mb-1">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {group}
                  </div>
                  {opts.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setCustomMode(false);
                        onChange(opt.value);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex w-full flex-col rounded-md px-2 py-1.5 text-left hover:bg-muted/60",
                        value === opt.value && "bg-primary/10",
                      )}
                    >
                      <span className="text-xs font-medium">{opt.label}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{opt.value}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
            {allowCustom && (
              <button
                type="button"
                onClick={() => {
                  setCustomMode(true);
                  if (isKnown) onChange("");
                  setOpen(false);
                }}
                className="mt-1 w-full rounded-md border border-dashed border-border px-2 py-2 text-left text-xs text-muted-foreground hover:bg-muted/40"
              >
                Other (type manually)…
              </button>
            )}
          </div>
        </div>
      )}

      {(customMode || (value && !isKnown)) && allowCustom && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Internal key, e.g. ammoEfficiency"
          className="h-8 w-full rounded border border-border bg-background px-2 font-mono text-xs"
        />
      )}
    </div>
  );
}

type StatKeyAddRowProps = {
  options: StatPickerOption[];
  onAdd: (key: string) => void;
  usedKeys?: Set<string>;
};

/** Pick a stat from the catalog and add it to an override record. */
export function StatKeyAddRow({ options, onAdd, usedKeys }: StatKeyAddRowProps) {
  const [selected, setSelected] = useState("");
  const available = useMemo(
    () => (usedKeys ? options.filter((o) => !usedKeys.has(o.value)) : options),
    [options, usedKeys],
  );

  return (
    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        <p className="mb-1 text-[10px] text-muted-foreground">Add stat from list</p>
        <StatKeyPicker
          value={selected}
          onChange={setSelected}
          options={available}
          placeholder="Choose stat to add…"
          allowCustom
        />
      </div>
      <button
        type="button"
        disabled={!selected.trim()}
        onClick={() => {
          if (!selected.trim()) return;
          onAdd(selected.trim());
          setSelected("");
        }}
        className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg border border-border px-3 text-xs hover:bg-muted/50 disabled:opacity-40"
      >
        Add stat
      </button>
    </div>
  );
}
