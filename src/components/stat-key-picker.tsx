"use client";

import { useMemo, useState } from "react";
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

  const grouped = useMemo(() => {
    const map = new Map<string, StatPickerOption[]>();
    for (const opt of options) {
      const group = opt.group || "Other";
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(opt);
    }
    for (const opts of map.values()) {
      opts.sort((a, b) => a.label.localeCompare(b.label));
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [options]);

  const selectValue = customMode ? "__custom__" : isKnown ? value : "";

  return (
    <div className={cn("space-y-1.5", className)}>
      <select
        value={selectValue}
        onChange={(e) => {
          const next = e.target.value;
          if (next === "__custom__") {
            setCustomMode(true);
            if (isKnown) onChange("");
            return;
          }
          setCustomMode(false);
          onChange(next);
        }}
        className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
      >
        <option value="">{placeholder}</option>
        {grouped.map(([group, opts]) => (
          <optgroup key={group} label={group}>
            {opts.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
        {allowCustom && <option value="__custom__">Other (type manually)…</option>}
      </select>
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
