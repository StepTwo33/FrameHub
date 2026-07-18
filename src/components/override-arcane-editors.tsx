"use client";

import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { arcaneEffectValuesByRank } from "@/lib/calc/arcane-utils";
import { draftToEffectLine } from "@/lib/arcane-effect-drafts";
import { getArcaneStatLabel } from "@/lib/arcane-display";
import type { ArcaneEffectLineDraft } from "@/lib/arcane-effect-drafts";
import { getArcaneEffectStatPickerOptions } from "@/lib/override-stat-catalog";
import { StatKeyPicker } from "@/components/stat-key-picker";
import type { StatPickerOption } from "@/lib/override-stat-catalog";
import { ARCANE_TRIGGER_OPTIONS } from "@/lib/override-schemas";

export type { ArcaneEffectLineDraft };

export function ArcaneTriggerPicker({
  value,
  onChange,
  currentValue,
  required = false,
}: {
  value: string;
  onChange: (trigger: string) => void;
  /** Shown when leaving override empty — existing data value. */
  currentValue?: string;
  /** When true, always pick a trigger (Codex inline edit). */
  required?: boolean;
}) {
  return (
    <label className="block text-[11px]">
      <span className="text-muted-foreground">When does this arcane apply?</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
      >
        {!required && (
          <option value="">
            Leave as-is{currentValue ? ` (${ARCANE_TRIGGER_OPTIONS.find((o) => o.value === currentValue)?.label ?? currentValue})` : ""}
          </option>
        )}
        {ARCANE_TRIGGER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[10px] text-muted-foreground">
        Use <strong>On reload</strong> for Plated Round, Arcane Rise, etc. Use <strong>Conditional</strong> for proc-chance effects like Momentum.
      </p>
    </label>
  );
}

export function ArcaneEffectsEditor({
  lines,
  maxRank = 5,
  onChange,
  statOptions = getArcaneEffectStatPickerOptions(),
}: {
  lines: ArcaneEffectLineDraft[];
  maxRank?: number;
  onChange: (lines: ArcaneEffectLineDraft[]) => void;
  statOptions?: StatPickerOption[];
}) {
  const update = (index: number, patch: Partial<ArcaneEffectLineDraft>) => {
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const addLine = () => {
    onChange([...lines, { stat: "", maxValue: 0, flat: false, stacking: false, constantAtAllRanks: false }]);
  };

  const removeLine = (index: number) => {
    onChange(lines.filter((_, i) => i !== index));
  };

  const togglePerRank = (index: number, enabled: boolean) => {
    const line = lines[index]!;
    if (enabled) {
      const effectLine = draftToEffectLine(line);
      const byRank = arcaneEffectValuesByRank(effectLine, maxRank);
      update(index, { usePerRankValues: true, valuesByRank: byRank });
    } else {
      update(index, { usePerRankValues: false, valuesByRank: undefined });
    }
  };

  const fmtVal = (n: number, flat: boolean) =>
    `${Number.isInteger(n) ? n : n.toFixed(1)}${flat ? "" : "%"}`;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">Effect values by rank</p>
      <p className="text-[11px] text-muted-foreground">
        Set unranked (R0) and max-rank values, or enter each rank manually. These drive build math.
      </p>
      {lines.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No effect lines yet.</p>
      )}
      {lines.map((line, index) => (
        <div key={index} className="rounded-lg border border-border bg-muted/10 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Line {index + 1}</span>
            <button
              type="button"
              onClick={() => removeLine(index)}
              className="text-red-400/70 hover:text-red-400"
              aria-label="Remove line"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-[11px] sm:col-span-2">
              <span className="text-muted-foreground">Effect stat</span>
              <StatKeyPicker
                value={line.stat}
                onChange={(stat) => update(index, { stat })}
                options={statOptions}
                placeholder="Choose effect stat…"
              />
            </label>
            {line.constantAtAllRanks ? (
              <label className="block text-[11px] sm:col-span-2">
                <span className="text-muted-foreground">Value (all ranks)</span>
                <input
                  type="number"
                  step="any"
                  value={line.maxValue}
                  onChange={(e) => update(index, { maxValue: Number(e.target.value) })}
                  onFocus={(e) => e.currentTarget.select()}
                  className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
                />
              </label>
            ) : line.usePerRankValues ? (
              <div className="sm:col-span-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {Array.from({ length: maxRank + 1 }, (_, rank) => (
                  <label key={rank} className="block text-[11px]">
                    <span className="text-muted-foreground">R{rank}</span>
                    <input
                      type="number"
                      step="any"
                      value={line.valuesByRank?.[rank] ?? 0}
                      onChange={(e) => {
                        const next = [...(line.valuesByRank ?? Array(maxRank + 1).fill(0))];
                        next[rank] = Number(e.target.value);
                        update(index, {
                          valuesByRank: next,
                          maxValue: rank === maxRank ? Number(e.target.value) : line.maxValue,
                          baseValue: rank === 0 ? Number(e.target.value) : line.baseValue,
                        });
                      }}
                      onFocus={(e) => e.currentTarget.select()}
                      className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
                    />
                  </label>
                ))}
              </div>
            ) : (
              <>
                <label className="block text-[11px]">
                  <span className="text-muted-foreground">Unranked (R0)</span>
                  <input
                    type="number"
                    step="any"
                    value={line.baseValue ?? ""}
                    placeholder="e.g. 15"
                    onChange={(e) =>
                      update(index, {
                        baseValue: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    onFocus={(e) => e.currentTarget.select()}
                    className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
                  />
                </label>
                <label className="block text-[11px]">
                  <span className="text-muted-foreground">Max rank (R{maxRank})</span>
                  <input
                    type="number"
                    step="any"
                    value={line.maxValue}
                    onChange={(e) => update(index, { maxValue: Number(e.target.value) })}
                    onFocus={(e) => e.currentTarget.select()}
                    className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
                  />
                </label>
              </>
            )}
            {!line.constantAtAllRanks && (
              <div className="sm:col-span-2 rounded-md border border-border/60 bg-background/50 px-2.5 py-2">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">Preview by rank</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[10px]">
                  {arcaneEffectValuesByRank(draftToEffectLine(line), maxRank).map((val, rank) => (
                    <span key={rank}>
                      R{rank}: {fmtVal(val, line.flat)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-[11px]">
            {!line.constantAtAllRanks && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(line.usePerRankValues)}
                  onChange={(e) => togglePerRank(index, e.target.checked)}
                />
                Set each rank manually
              </label>
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={line.flat}
                onChange={(e) => update(index, { flat: e.target.checked })}
              />
              Flat value (not %)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={line.constantAtAllRanks}
                onChange={(e) => update(index, { constantAtAllRanks: e.target.checked })}
              />
              Same at all ranks (proc chance, duration, etc.)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={line.stacking}
                onChange={(e) => update(index, { stacking: e.target.checked })}
              />
              Stacks multiply value
            </label>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addLine}
        className="flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-purple-500/40 hover:text-purple-300"
      >
        <Plus className="h-3.5 w-3.5" /> Add effect line
      </button>
    </div>
  );
}
