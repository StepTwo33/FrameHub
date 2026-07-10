"use client";

import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatOverrideFieldLabel } from "@/lib/override-schemas";
import { arcaneEffectValuesByRank } from "@/lib/arcane-utils";
import { draftToEffectLine } from "@/lib/arcane-effect-drafts";
import { getArcaneStatLabel } from "@/lib/arcane-display";
import {
  RADIAL_ELEMENT_OPTIONS,
  findPrimaryElementKey,
  type RadialDamageKey,
} from "@/lib/weapon-radial-utils";
import type { WeaponRadialAttack } from "@/lib/types";
import type { ArcaneEffectLineDraft } from "@/lib/arcane-effect-drafts";
import { getArcaneEffectStatPickerOptions } from "@/lib/override-stat-catalog";
import { StatKeyAddRow, StatKeyPicker } from "@/components/stat-key-picker";
import { getModStatLabel } from "@/lib/override-stat-catalog";
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

import {
  ABILITY_DAMAGE_TYPE_OPTIONS,
  ABILITY_FIELD_DEFS,
  ABILITY_FIELD_GROUPS,
  type AbilityDraft,
  getAbilityMiscStatLabel,
  getAbilityMiscStatPickerOptions,
  getAddableAbilityFields,
} from "@/lib/ability-override-fields";

export type { AbilityDraft };

function OptionalNumberInput({
  label,
  value,
  onChange,
  placeholder = "—",
  step = "any",
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="block text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        placeholder={placeholder}
        className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
      />
    </label>
  );
}

export function AbilitiesEditor({
  abilities,
  onChange,
  allowAddAbility = false,
  allowRemoveAbility = false,
  allowRename = false,
}: {
  abilities: AbilityDraft[];
  onChange: (abilities: AbilityDraft[]) => void;
  allowAddAbility?: boolean;
  allowRemoveAbility?: boolean;
  allowRename?: boolean;
}) {
  const update = (index: number, patch: Partial<AbilityDraft>) => {
    onChange(abilities.map((ab, i) => (i === index ? { ...ab, ...patch } : ab)));
  };

  const addField = (index: number, fieldKey: string) => {
    const draft = abilities[index];
    if (!draft || draft.visibleFields.includes(fieldKey)) return;
    update(index, { visibleFields: [...draft.visibleFields, fieldKey] });
  };

  const removeField = (index: number, fieldKey: string) => {
    const draft = abilities[index];
    if (!draft) return;
    const visibleFields = draft.visibleFields.filter((k) => k !== fieldKey);
    const { [fieldKey as keyof AbilityDraft]: _removed, ...rest } = {
      ...draft,
      visibleFields,
    };
    update(index, rest as AbilityDraft);
  };

  const addAbility = () => {
    onChange([
      ...abilities,
      {
        name: "",
        energyCost: 25,
        description: "",
        visibleFields: [],
      },
    ]);
  };

  const removeAbility = (index: number) => {
    onChange(abilities.filter((_, i) => i !== index));
  };

  const miscStatOptions = getAbilityMiscStatPickerOptions();

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium text-foreground">Abilities</p>
        <p className="text-[11px] text-muted-foreground">
          Edit ability numbers used in build math and TTK. Add only the fields this ability needs — same idea as mod stat pickers.
        </p>
      </div>
      {abilities.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No abilities on this item yet.</p>
      )}
      {abilities.map((ability, index) => {
        const addable = getAddableAbilityFields(ability);
        return (
          <div key={index} className="rounded-lg border border-border bg-muted/10 p-3 space-y-3">
            <div className="flex items-start justify-between gap-2">
              {(allowRename || !ability.name.trim()) ? (
                <label className="block min-w-0 flex-1 text-[11px]">
                  <span className="text-muted-foreground">Ability name</span>
                  <input
                    value={ability.name}
                    onChange={(e) => update(index, { name: e.target.value })}
                    placeholder="e.g. Slash Dash"
                    className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm font-medium"
                  />
                </label>
              ) : (
                <p className="text-sm font-medium">{ability.name || `Ability ${index + 1}`}</p>
              )}
              {allowRemoveAbility && (
                <button
                  type="button"
                  onClick={() => removeAbility(index)}
                  className="shrink-0 text-red-400/70 hover:text-red-400"
                  aria-label="Remove ability"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

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
            </div>

            {ABILITY_FIELD_GROUPS.map((group) => {
              const groupFields = ABILITY_FIELD_DEFS.filter(
                (d) => d.group === group && ability.visibleFields.includes(d.key),
              );
              if (!groupFields.length) return null;
              return (
                <div key={group} className="space-y-2 rounded-md border border-border/60 bg-background/40 p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {groupFields.map((def) => {
                      if (def.key === "miscStats") return null;
                      if (def.kind === "damageType") {
                        return (
                          <label key={def.key} className="block text-[11px] sm:col-span-2">
                            <span className="text-muted-foreground">{def.label}</span>
                            <select
                              value={ability.damageType ?? ""}
                              onChange={(e) =>
                                update(index, { damageType: e.target.value || undefined })
                              }
                              className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
                            >
                              <option value="">—</option>
                              {ABILITY_DAMAGE_TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        );
                      }
                      if (def.kind === "subAbilities") {
                        return (
                          <label key={def.key} className="block text-[11px] sm:col-span-2">
                            <span className="text-muted-foreground">{def.label}</span>
                            <input
                              value={ability.subAbilities?.join(", ") ?? ""}
                              onChange={(e) =>
                                update(index, {
                                  subAbilities: e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                })
                              }
                              placeholder={def.placeholder}
                              className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
                            />
                          </label>
                        );
                      }
                      const val = ability[def.key as keyof AbilityDraft] as number | undefined;
                      return (
                        <div key={def.key} className="relative">
                          <OptionalNumberInput
                            label={def.label}
                            value={val}
                            onChange={(v) => update(index, { [def.key]: v } as Partial<AbilityDraft>)}
                            placeholder={def.placeholder}
                            step={def.kind === "percent" ? "0.01" : "any"}
                          />
                          <button
                            type="button"
                            onClick={() => removeField(index, def.key)}
                            className="absolute right-0 top-0 text-[10px] text-muted-foreground hover:text-red-400"
                          >
                            remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {ability.visibleFields.includes("miscStats") && (
              <div className="space-y-2 rounded-md border border-border/60 bg-background/40 p-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Extra stats (miscStats)
                  </p>
                  <button
                    type="button"
                    onClick={() => removeField(index, "miscStats")}
                    className="text-[10px] text-muted-foreground hover:text-red-400"
                  >
                    remove section
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Shield strip, decoy radius, etc. — used by ability scaling where verified.
                </p>
                {Object.entries(ability.miscStats ?? {}).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                    <span className="text-xs">{getAbilityMiscStatLabel(key)}</span>
                    <input
                      type="number"
                      step="any"
                      value={val}
                      onChange={(e) =>
                        update(index, {
                          miscStats: {
                            ...(ability.miscStats ?? {}),
                            [key]: Number(e.target.value),
                          },
                        })
                      }
                      className="h-8 w-24 rounded border border-border bg-background px-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = { ...(ability.miscStats ?? {}) };
                        delete next[key];
                        update(index, { miscStats: next });
                      }}
                      className="text-red-400/70 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <StatKeyAddRow
                  options={miscStatOptions}
                  usedKeys={new Set(Object.keys(ability.miscStats ?? {}))}
                  onAdd={(key) =>
                    update(index, {
                      miscStats: { ...(ability.miscStats ?? {}), [key]: 0 },
                    })
                  }
                />
              </div>
            )}

            {addable.length > 0 && (
              <label className="block text-[11px]">
                <span className="text-muted-foreground">Add calculable field</span>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const key = e.target.value;
                    if (!key) return;
                    addField(index, key);
                    e.target.value = "";
                  }}
                  className="mt-0.5 h-8 w-full rounded border border-border bg-background px-2 text-sm"
                >
                  <option value="">Choose field to add…</option>
                  {addable.map((def) => (
                    <option key={def.key} value={def.key}>
                      {def.group}: {def.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        );
      })}
      {allowAddAbility && (
        <button
          type="button"
          onClick={addAbility}
          className="flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-purple-500/40 hover:text-purple-300"
        >
          <Plus className="h-3.5 w-3.5" /> Add ability
        </button>
      )}
    </div>
  );
}

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
}) {
  const labelForKey = (key: string) =>
    statOptions.find((o) => o.value === key)?.label ?? getModStatLabel(key);

  const usedKeys = useMemo(() => new Set(rows.map((r) => r.key)), [rows]);
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-foreground">{title}</p>
      <p className="mb-2 text-[11px] text-muted-foreground">
        {helperText ??
          "Per-rank base from data — enter a new number only where in-game differs. Max in build = base × (max rank + 1). Use the trash icon to strip bogus stats from the mass wiki parse."}
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
          <div className="max-h-64 divide-y divide-border overflow-y-auto">
            {rows.map(({ path, key, value }) => {
              const overrideValue = overrideValues[path] ?? "";
              const isDeleted = overrideValue === STAT_ROW_DELETE_MARKER;
              const isChanged = isFieldChanged?.(path, value) ?? overrideValue !== "";
              return (
                <div
                  key={path}
                  className={cn(
                    "grid grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-2 sm:grid-cols-[1fr_1fr_1fr_auto]",
                    isDeleted && "bg-red-500/10",
                    !isDeleted && isChanged && "bg-purple-500/5",
                  )}
                >
                  <span className={cn("text-sm", isDeleted && "text-red-400 line-through")}>
                    {labelForKey(key)}
                    {isDeleted && (
                      <span className="ml-1.5 text-[10px] font-normal no-underline text-red-400/90">
                        will remove
                      </span>
                    )}
                  </span>
                  <span className="hidden text-sm text-muted-foreground sm:block">
                    {String(value ?? "—")}
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
