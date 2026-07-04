"use client";

import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatOverrideFieldLabel } from "@/lib/override-schemas";
import { scaleArcaneEffectValue } from "@/lib/arcane-utils";

export interface ArcaneEffectLineDraft {
  stat: string;
  maxValue: number;
  flat: boolean;
  stacking: boolean;
}

export function ArcaneEffectsEditor({
  lines,
  maxRank = 5,
  onChange,
}: {
  lines: ArcaneEffectLineDraft[];
  maxRank?: number;
  onChange: (lines: ArcaneEffectLineDraft[]) => void;
}) {
  const update = (index: number, patch: Partial<ArcaneEffectLineDraft>) => {
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const addLine = () => {
    onChange([...lines, { stat: "", maxValue: 0, flat: false, stacking: false }]);
  };

  const removeLine = (index: number) => {
    onChange(lines.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">Arcane effect values (used in builds)</p>
      <p className="text-[11px] text-muted-foreground">
        Max value is at max rank (R{maxRank}). Values scale linearly from R0 — compare against in-game at each rank.
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
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Stat name</span>
              <input
                value={line.stat}
                onChange={(e) => update(index, { stat: e.target.value })}
                placeholder="e.g. abilityStrength"
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Max @ R{maxRank}</span>
              <input
                type="number"
                step="any"
                value={line.maxValue}
                onChange={(e) => update(index, { maxValue: Number(e.target.value) })}
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
            <label className="block text-[11px] sm:col-span-2">
              <span className="text-muted-foreground">Preview @ R0 (scaled)</span>
              <p className="mt-0.5 font-mono text-sm text-muted-foreground">
                {scaleArcaneEffectValue(line.maxValue, 0, maxRank)}
                {line.flat ? "" : "%"}
              </p>
            </label>
          </div>
          <div className="flex flex-wrap gap-4 text-[11px]">
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

export interface AbilityDraft {
  name: string;
  energyCost: number;
  description: string;
  damage?: number;
  range?: number;
  duration?: number;
  radius?: number;
}

export function AbilitiesEditor({
  abilities,
  onChange,
}: {
  abilities: AbilityDraft[];
  onChange: (abilities: AbilityDraft[]) => void;
}) {
  const update = (index: number, patch: Partial<AbilityDraft>) => {
    onChange(abilities.map((ab, i) => (i === index ? { ...ab, ...patch } : ab)));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-foreground">Abilities</p>
      <p className="text-[11px] text-muted-foreground">
        Edit ability numbers and descriptions. Ability names stay the same.
      </p>
      {abilities.map((ability, index) => (
        <div key={index} className="rounded-lg border border-border bg-muted/10 p-3 space-y-2">
          <p className="text-sm font-medium">{ability.name || `Ability ${index + 1}`}</p>
          <label className="block text-[11px]">
            <span className="text-muted-foreground">Description</span>
            <textarea
              value={ability.description}
              onChange={(e) => update(index, { description: e.target.value })}
              rows={2}
              className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1.5 text-sm resize-y"
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Energy cost</span>
              <input
                type="number"
                value={ability.energyCost}
                onChange={(e) => update(index, { energyCost: Number(e.target.value) })}
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Damage</span>
              <input
                type="number"
                step="any"
                value={ability.damage ?? ""}
                onChange={(e) => update(index, { damage: e.target.value === "" ? undefined : Number(e.target.value) })}
                placeholder="—"
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Range</span>
              <input
                type="number"
                step="any"
                value={ability.range ?? ""}
                onChange={(e) => update(index, { range: e.target.value === "" ? undefined : Number(e.target.value) })}
                placeholder="—"
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Duration</span>
              <input
                type="number"
                step="any"
                value={ability.duration ?? ""}
                onChange={(e) => update(index, { duration: e.target.value === "" ? undefined : Number(e.target.value) })}
                placeholder="—"
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatRowsEditor({
  title,
  rows,
  overrideValues,
  onChange,
  onFocusField,
  isFieldChanged,
  onAddKey,
  newKeyValue,
  onNewKeyChange,
}: {
  title: string;
  rows: { key: string; path: string; value: unknown }[];
  overrideValues: Record<string, string>;
  onChange: (path: string, value: string) => void;
  onFocusField?: (path: string, current: unknown) => void;
  isFieldChanged?: (path: string, current: unknown) => boolean;
  onAddKey: () => void;
  newKeyValue: string;
  onNewKeyChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-foreground">{title}</p>
      <p className="mb-2 text-[11px] text-muted-foreground">
        Per-rank base from data — enter a new number only where in-game differs. Max in build = base × (max rank + 1).
      </p>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No stats on this item.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 bg-muted/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid-cols-[1fr_1fr_1fr]">
            <span>Stat</span>
            <span className="hidden sm:block">Current</span>
            <span>New value</span>
          </div>
          <div className="max-h-64 divide-y divide-border overflow-y-auto">
            {rows.map(({ path, key, value }) => {
              const overrideValue = overrideValues[path] ?? "";
              const isChanged = isFieldChanged?.(path, value) ?? overrideValue !== "";
              return (
                <div
                  key={path}
                  className={cn(
                    "grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2 sm:grid-cols-[1fr_1fr_1fr]",
                    isChanged && "bg-purple-500/5",
                  )}
                >
                  <span className="text-sm">{formatOverrideFieldLabel(key)}</span>
                  <span className="hidden text-sm text-muted-foreground sm:block">{String(value ?? "—")}</span>
                  <input
                    type="number"
                    step="any"
                    value={overrideValue}
                    onChange={(e) => onChange(path, e.target.value)}
                    onFocus={() => onFocusField?.(path, value)}
                    placeholder={String(value ?? "—")}
                    className={cn(
                      "h-8 w-full min-w-[100px] rounded border bg-background px-2 text-sm sm:min-w-0",
                      isChanged ? "border-purple-500" : "border-border",
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <input
          value={newKeyValue}
          onChange={(e) => onNewKeyChange(e.target.value)}
          placeholder="Add stat name (e.g. damage)"
          className="h-8 flex-1 rounded border border-border bg-background px-2 text-sm"
        />
        <button
          type="button"
          onClick={onAddKey}
          className="flex items-center gap-1 rounded-lg border border-border px-3 text-xs hover:bg-muted/50"
        >
          <Plus className="h-3.5 w-3.5" /> Add stat
        </button>
      </div>
    </div>
  );
}
