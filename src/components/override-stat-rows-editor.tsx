"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatKeyAddRow } from "@/components/stat-key-picker";
import { getModStatLabel } from "@/lib/overrides/override-stat-catalog";
import type { StatPickerOption } from "@/lib/overrides/override-stat-catalog";
import {
  formatModStatValue,
  isFlatModStat,
  isPercentLikeModStat,
} from "@/lib/display/mod-display";

/** Marker stored in override field values when a nested stat should be stripped. */
export const STAT_ROW_DELETE_MARKER = "__DELETE__";

export function StatRowsEditor({
  title,
  rows,
  overrideValues,
  onChange,
  onFocusField,
  isFieldChanged,
  onAddKey,
  onRemoveKey,
  helperText,
  statOptions = [],
  maxRank,
}: {
  title: string;
  rows: { key: string; path: string; value: unknown }[];
  overrideValues: Record<string, string>;
  onChange: (path: string, value: string) => void;
  onFocusField?: (path: string, current: unknown) => void;
  isFieldChanged?: (path: string, current: unknown) => boolean;
  onAddKey: (key: string) => void;
  /** Mark a bogus wiki-parsed stat for removal from the item. */
  onRemoveKey?: (path: string) => void;
  helperText?: string;
  statOptions?: StatPickerOption[];
  /** When set (mods), enable Max % input mode and rank preview. */
  maxRank?: number;
}) {
  const labelForKey = (key: string) =>
    statOptions.find((o) => o.value === key)?.label ?? getModStatLabel(key);

  const usedKeys = useMemo(() => new Set(rows.map((r) => r.key)), [rows]);
  const [inputModes, setInputModes] = useState<Record<string, "perRank" | "maxPct">>({});
  const rankSteps = maxRank != null ? maxRank + 1 : 1;

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-foreground">{title}</p>
      <p className="mb-2 text-[11px] text-muted-foreground">
        {helperText ??
          (maxRank != null
            ? "Stored as per-rank base (build uses base × (rank+1)). Toggle Max % to enter the in-game max-rank total, or use Preview by rank."
            : "Per-rank base from data — enter a new number only where in-game differs. Max in build = base × (max rank + 1). Use the trash icon to strip bogus stats from the mass wiki parse.")}
      </p>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No stats on this item.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 bg-muted/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid-cols-[1fr_1fr_1fr_auto]">
            <span>Stat</span>
            <span className="hidden sm:block">Current</span>
            <span>New value</span>
            <span className="w-8" />
          </div>
          <div className="max-h-80 divide-y divide-border overflow-y-auto">
            {rows.map(({ path, key, value }) => {
              const overrideValue = overrideValues[path] ?? "";
              const isDeleted = overrideValue === STAT_ROW_DELETE_MARKER;
              const isChanged = isFieldChanged?.(path, value) ?? overrideValue !== "";
              const catalogNum = typeof value === "number" ? value : Number(value);
              const effectivePerRank =
                !isDeleted && overrideValue !== "" && Number.isFinite(Number(overrideValue))
                  ? Number(overrideValue)
                  : Number.isFinite(catalogNum)
                    ? catalogNum
                    : 0;
              const percentLike = maxRank != null && isPercentLikeModStat(key) && !isFlatModStat(key);
              const mode = inputModes[path] ?? "perRank";
              const maxPctDisplay = effectivePerRank * rankSteps;
              const inputDisplay =
                percentLike && mode === "maxPct"
                  ? (overrideValue === "" && !isChanged
                      ? String(Number.isFinite(catalogNum) ? catalogNum * rankSteps : "")
                      : String(maxPctDisplay))
                  : overrideValue;

              return (
                <div
                  key={path}
                  className={cn(
                    "space-y-1.5 px-3 py-2",
                    isDeleted && "bg-red-500/10",
                    !isDeleted && isChanged && "bg-purple-500/5",
                  )}
                >
                  <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                    <span className={cn("text-sm", isDeleted && "text-red-400 line-through")}>
                      {labelForKey(key)}
                      {isDeleted && (
                        <span className="ml-1.5 text-[10px] font-normal no-underline text-red-400/90">
                          will remove
                        </span>
                      )}
                    </span>
                    <span className="hidden text-sm text-muted-foreground sm:block">
                      {Number.isFinite(catalogNum) ? (
                        percentLike ? (
                          <span className="leading-snug">
                            <span className="font-mono">{catalogNum}</span>
                            <span className="block text-[10px] text-muted-foreground/80">
                              ≈ {formatModStatValue(key, catalogNum, maxRank!)} at max
                            </span>
                          </span>
                        ) : (
                          String(catalogNum)
                        )
                      ) : (
                        String(value ?? "—")
                      )}
                    </span>
                    {isDeleted ? (
                      <button
                        type="button"
                        onClick={() => onChange(path, "")}
                        className="h-8 rounded border border-red-500/40 bg-background px-2 text-xs text-red-400 hover:bg-red-500/10"
                      >
                        Undo remove
                      </button>
                    ) : (
                      <div className="min-w-0 space-y-1">
                        {percentLike && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setInputModes((m) => ({ ...m, [path]: "perRank" }))}
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[9px] border",
                                mode === "perRank"
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground",
                              )}
                            >
                              Per-rank
                            </button>
                            <button
                              type="button"
                              onClick={() => setInputModes((m) => ({ ...m, [path]: "maxPct" }))}
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[9px] border",
                                mode === "maxPct"
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground",
                              )}
                            >
                              Max %
                            </button>
                          </div>
                        )}
                        <input
                          type="number"
                          step="any"
                          value={
                            percentLike && mode === "maxPct"
                              ? overrideValue === ""
                                ? ""
                                : String(maxPctDisplay)
                              : overrideValue
                          }
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {
                              onChange(path, "");
                              return;
                            }
                            const n = Number(raw);
                            if (!Number.isFinite(n)) {
                              onChange(path, raw);
                              return;
                            }
                            if (percentLike && mode === "maxPct") {
                              onChange(path, String(n / rankSteps));
                            } else {
                              onChange(path, raw);
                            }
                          }}
                          onFocus={() => onFocusField?.(path, value)}
                          placeholder={
                            percentLike && mode === "maxPct"
                              ? String(Number.isFinite(catalogNum) ? catalogNum * rankSteps : "—")
                              : String(value ?? "—")
                          }
                          className={cn(
                            "h-8 w-full min-w-[100px] rounded border bg-background px-2 text-sm sm:min-w-0",
                            isChanged ? "border-purple-500" : "border-border",
                          )}
                        />
                      </div>
                    )}
                    {onRemoveKey && !isDeleted && (
                      <button
                        type="button"
                        onClick={() => onRemoveKey(path)}
                        title="Remove this stat (bogus wiki parse)"
                        className="flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground hover:border-red-500/50 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {isDeleted && <span className="w-8" />}
                  </div>
                  {percentLike && !isDeleted && Number.isFinite(effectivePerRank) && (
                    <p className="text-[10px] text-muted-foreground leading-snug pl-0.5">
                      Preview by rank:{" "}
                      {Array.from({ length: Math.min(rankSteps, 12) }, (_, rank) => (
                        <span key={rank}>
                          {rank > 0 ? " · " : ""}
                          R{rank}: {formatModStatValue(key, effectivePerRank, rank).replace(/\s+\S+$/, "")}
                        </span>
                      ))}
                      {rankSteps > 12 && (
                        <span>
                          {" "}
                          · … R{maxRank}:{" "}
                          {formatModStatValue(key, effectivePerRank, maxRank!).replace(/\s+\S+$/, "")}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {statOptions.length > 0 && (
        <StatKeyAddRow options={statOptions} usedKeys={usedKeys} onAdd={onAddKey} />
      )}
    </div>
  );
}
