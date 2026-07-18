"use client";

import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RADIAL_ELEMENT_OPTIONS,
  findPrimaryElementKey,
  type RadialDamageKey,
} from "@/lib/weapon-radial-utils";
import type { WeaponRadialAttack } from "@/lib/types";

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

