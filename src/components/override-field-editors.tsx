"use client";

import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatOverrideFieldLabel } from "@/lib/override-schemas";
import { scaleArcaneEffectValue } from "@/lib/arcane-utils";
import {
  RADIAL_ELEMENT_OPTIONS,
  findPrimaryElementKey,
  type RadialDamageKey,
} from "@/lib/weapon-radial-utils";
import type { WeaponRadialAttack } from "@/lib/types";

export interface ArcaneEffectLineDraft {
  stat: string;
  maxValue: number;
  flat: boolean;
  stacking: boolean;
  constantAtAllRanks: boolean;
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
    onChange([...lines, { stat: "", maxValue: 0, flat: false, stacking: false, constantAtAllRanks: false }]);
  };

  const removeLine = (index: number) => {
    onChange(lines.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">Build effect values</p>
      <p className="text-[11px] text-muted-foreground">
        These drive arcane math in builds. Max value is at max rank (R{maxRank}) unless &quot;Same at all ranks&quot; is checked.
        Scaling stats increase linearly from R0. Click a value field to edit the current number.
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
                onFocus={(e) => e.currentTarget.select()}
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
            <label className="block text-[11px] sm:col-span-2">
              <span className="text-muted-foreground">Preview @ R0 (scaled)</span>
              <p className="mt-0.5 font-mono text-sm text-muted-foreground">
                {scaleArcaneEffectValue(line.maxValue, 0, maxRank, {
                  constantAtAllRanks: line.constantAtAllRanks,
                })}
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
  helperText,
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
  helperText?: string;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-foreground">{title}</p>
      <p className="mb-2 text-[11px] text-muted-foreground">
        {helperText ?? "Per-rank base from data — enter a new number only where in-game differs. Max in build = base × (max rank + 1)."}
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

export interface RadialAttackDraft {
  name: string;
  totalDamage: number;
  radius: number;
  impact: string;
  puncture: string;
  slash: string;
  elementKey: RadialDamageKey | "";
  elementValue: string;
  falloffPercent: string;
  explosionDelay: string;
}

export function radialAttackToDraft(attack: WeaponRadialAttack): RadialAttackDraft {
  const elementKey = findPrimaryElementKey(attack);
  const elementValue = elementKey ? String(attack[elementKey] ?? "") : "";
  return {
    name: attack.name,
    totalDamage: attack.totalDamage,
    radius: attack.radius,
    impact: attack.impact != null ? String(attack.impact) : "",
    puncture: attack.puncture != null ? String(attack.puncture) : "",
    slash: attack.slash != null ? String(attack.slash) : "",
    elementKey,
    elementValue,
    falloffPercent:
      attack.falloffReduction != null ? String(Math.round(attack.falloffReduction * 100)) : "",
    explosionDelay: attack.explosionDelay != null ? String(attack.explosionDelay) : "",
  };
}

export function draftToRadialAttack(draft: RadialAttackDraft): WeaponRadialAttack | null {
  const name = draft.name.trim();
  if (!name) return null;
  const attack: WeaponRadialAttack = {
    name,
    totalDamage: Number(draft.totalDamage) || 0,
    radius: Number(draft.radius) || 0,
  };
  if (draft.impact !== "") attack.impact = Number(draft.impact);
  if (draft.puncture !== "") attack.puncture = Number(draft.puncture);
  if (draft.slash !== "") attack.slash = Number(draft.slash);
  if (draft.elementKey && draft.elementValue !== "") {
    attack[draft.elementKey] = Number(draft.elementValue);
  }
  if (draft.falloffPercent !== "") {
    attack.falloffReduction = Number(draft.falloffPercent) / 100;
  }
  if (draft.explosionDelay !== "") {
    attack.explosionDelay = Number(draft.explosionDelay);
  }
  return attack;
}

export function toRadialAttackDrafts(raw: unknown): RadialAttackDraft[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => radialAttackToDraft(item as WeaponRadialAttack));
}

export function RadialAttacksEditor({
  attacks,
  onChange,
}: {
  attacks: RadialAttackDraft[];
  onChange: (attacks: RadialAttackDraft[]) => void;
}) {
  const update = (index: number, patch: Partial<RadialAttackDraft>) => {
    onChange(attacks.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addAttack = () => {
    onChange([
      ...attacks,
      {
        name: "",
        totalDamage: 0,
        radius: 0,
        impact: "",
        puncture: "",
        slash: "",
        elementKey: "",
        elementValue: "",
        falloffPercent: "",
        explosionDelay: "",
      },
    ]);
  };

  const removeAttack = (index: number) => {
    onChange(attacks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">Radial / AoE attacks</p>
      <p className="text-[11px] text-muted-foreground">
        Explosions, slam radials, alt-fire blasts, etc. Shown in weapon builder and Codex. Save an empty list to clear AoE.
      </p>
      {attacks.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No radial attacks on this weapon.</p>
      )}
      {attacks.map((attack, index) => (
        <div key={index} className="rounded-lg border border-border bg-muted/10 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Attack {index + 1}</span>
            <button
              type="button"
              onClick={() => removeAttack(index)}
              className="text-red-400/70 hover:text-red-400"
              aria-label="Remove attack"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-[11px] sm:col-span-2">
              <span className="text-muted-foreground">Name</span>
              <input
                value={attack.name}
                onChange={(e) => update(index, { name: e.target.value })}
                placeholder="e.g. Rocket Explosion"
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Total damage</span>
              <input
                type="number"
                step="any"
                value={attack.totalDamage}
                onChange={(e) => update(index, { totalDamage: Number(e.target.value) })}
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Radius (m)</span>
              <input
                type="number"
                step="any"
                value={attack.radius}
                onChange={(e) => update(index, { radius: Number(e.target.value) })}
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Impact</span>
              <input
                type="number"
                step="any"
                value={attack.impact}
                onChange={(e) => update(index, { impact: e.target.value })}
                placeholder="—"
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Puncture</span>
              <input
                type="number"
                step="any"
                value={attack.puncture}
                onChange={(e) => update(index, { puncture: e.target.value })}
                placeholder="—"
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Slash</span>
              <input
                type="number"
                step="any"
                value={attack.slash}
                onChange={(e) => update(index, { slash: e.target.value })}
                placeholder="—"
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Element</span>
              <select
                value={attack.elementKey}
                onChange={(e) =>
                  update(index, { elementKey: e.target.value as RadialDamageKey | "" })
                }
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              >
                {RADIAL_ELEMENT_OPTIONS.map((opt) => (
                  <option key={opt.value || "none"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Element damage</span>
              <input
                type="number"
                step="any"
                value={attack.elementValue}
                onChange={(e) => update(index, { elementValue: e.target.value })}
                placeholder="—"
                disabled={!attack.elementKey}
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm disabled:opacity-50"
              />
            </label>
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Falloff at edge (%)</span>
              <input
                type="number"
                step="any"
                value={attack.falloffPercent}
                onChange={(e) => update(index, { falloffPercent: e.target.value })}
                placeholder="e.g. 50"
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
            <label className="block text-[11px]">
              <span className="text-muted-foreground">Explosion delay (s)</span>
              <input
                type="number"
                step="any"
                value={attack.explosionDelay}
                onChange={(e) => update(index, { explosionDelay: e.target.value })}
                placeholder="—"
                className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
              />
            </label>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addAttack}
        className="flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-purple-500/40 hover:text-purple-300"
      >
        <Plus className="h-3.5 w-3.5" /> Add radial attack
      </button>
    </div>
  );
}
