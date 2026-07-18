"use client";

import { cn } from "@/lib/utils";
import type { AbilityScaleAttribute } from "@/lib/ability-scaling-registry";
import type { Ability, WarframeCalculatedStats } from "@/lib/types";
import {
  scaleAbilityMiscStats,
  scaledAbilityDamageReduction,
  scaledAbilityDamageBuff,
  abilityPercentFraction,
  type AbilityDisplayContext,
} from "@/lib/ability-misc-stats";
import { Zap, Sparkles } from "lucide-react";

export type AbilityScaleHint = AbilityScaleAttribute;

const SLOT_STYLES: Record<number, { border: string; badge: string; glow: string }> = {
  1: {
    border: "border-l-orange-500/70",
    badge: "bg-orange-500/15 text-orange-400 ring-orange-500/30",
    glow: "shadow-[inset_3px_0_12px_-4px_rgba(249,115,22,0.35)]",
  },
  2: {
    border: "border-l-cyan-500/70",
    badge: "bg-cyan-500/15 text-cyan-400 ring-cyan-500/30",
    glow: "shadow-[inset_3px_0_12px_-4px_rgba(34,211,238,0.35)]",
  },
  3: {
    border: "border-l-violet-500/70",
    badge: "bg-violet-500/15 text-violet-400 ring-violet-500/30",
    glow: "shadow-[inset_3px_0_12px_-4px_rgba(139,92,246,0.35)]",
  },
  4: {
    border: "border-l-amber-400/80",
    badge: "bg-amber-500/15 text-amber-300 ring-amber-500/40",
    glow: "shadow-[inset_3px_0_12px_-4px_rgba(251,191,36,0.4)]",
  },
};

const SCALE_BADGE: Record<AbilityScaleHint, { label: string; className: string }> = {
  strength: { label: "STR", className: "bg-rose-500/15 text-rose-400 ring-rose-500/25" },
  duration: { label: "DUR", className: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25" },
  range: { label: "RNG", className: "bg-sky-500/15 text-sky-400 ring-sky-500/25" },
};

export function getSlotStyle(slot: number) {
  return SLOT_STYLES[slot] ?? SLOT_STYLES[1];
}

export function AbilityScaleBadge({
  scale,
  className,
}: {
  scale: AbilityScaleHint;
  className?: string;
}) {
  const cfg = SCALE_BADGE[scale];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1 py-px text-[9px] font-bold tracking-wide ring-1",
        cfg.className,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}

export function AbilitySlotBadge({ slot }: { slot: number }) {
  const style = getSlotStyle(slot);
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ring-1",
        style.badge,
      )}
    >
      {slot}
    </span>
  );
}

export function AbilityFormBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary ring-1 ring-primary/20">
      {label}
    </span>
  );
}

export function AbilityEnergyChip({
  baseCost,
  effectiveCost,
  className,
}: {
  baseCost: number;
  effectiveCost: number;
  className?: string;
}) {
  const modified = Math.abs(effectiveCost - baseCost) > 0.5;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1",
        modified
          ? "bg-blue-500/10 text-blue-300 ring-blue-500/25"
          : "bg-muted/60 text-muted-foreground ring-border/50",
        className,
      )}
    >
      <Zap className={cn("h-3 w-3", modified ? "text-blue-400" : "text-muted-foreground")} />
      <span className={cn("text-xs font-mono font-semibold", modified && "text-blue-300")}>
        {modified ? effectiveCost.toFixed(0) : baseCost}
      </span>
      {modified && (
        <span className="text-[10px] font-mono text-muted-foreground/50 line-through">{baseCost}</span>
      )}
    </div>
  );
}

export function AbilityDamageTypeChip({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-orange-500/25 bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-300">
      <Sparkles className="h-3 w-3 opacity-70" />
      {type}
    </span>
  );
}

export function AbilityStatSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <div className={cn("space-y-0.5", className)}>
      <div className="flex items-center gap-2 pb-1 pt-1.5">
        <span className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/80">
          {title}
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-border/80 to-transparent" />
      </div>
      {children}
    </div>
  );
}

export function AbilityStatRow({
  label,
  baseValue,
  modifiedValue,
  unit = "",
  isModified,
  isPositive,
  scaleHint,
  compact = false,
}: {
  label: string;
  baseValue: string;
  modifiedValue: string;
  unit?: string;
  isModified: boolean;
  isPositive: boolean;
  scaleHint?: AbilityScaleHint;
  compact?: boolean;
}) {
  const display = isModified ? modifiedValue : baseValue;
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-muted/40",
        compact ? "py-0.5" : "py-1",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        {scaleHint && <AbilityScaleBadge scale={scaleHint} />}
        <span
          className={cn(
            "text-muted-foreground",
            compact ? "text-[10px]" : "text-[11px]",
          )}
        >
          {label}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {isModified && (
          <span
            className={cn(
              "font-mono text-muted-foreground/45 line-through",
              compact ? "text-[10px]" : "text-[11px]",
            )}
          >
            {baseValue}
            {unit}
          </span>
        )}
        <span
          className={cn(
            "rounded-md bg-muted/50 px-1.5 py-0.5 font-mono font-semibold ring-1 ring-border/40",
            compact ? "text-[10px]" : "text-[11px]",
            isModified && (isPositive ? "text-emerald-400 ring-emerald-500/20 bg-emerald-500/10" : "text-rose-400 ring-rose-500/20 bg-rose-500/10"),
            !isModified && "text-foreground",
          )}
        >
          {display}
          {unit}
        </span>
      </div>
    </div>
  );
}

export function AbilityCardShell({
  slot,
  children,
  variant = "default",
  className,
}: {
  slot: number;
  children: React.ReactNode;
  variant?: "default" | "helminth";
  className?: string;
}) {
  const style = getSlotStyle(slot);
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/20",
        "border-l-[3px] shadow-sm transition-shadow hover:shadow-md",
        variant === "default" ? cn(style.border, style.glow) : "border-l-emerald-500/70 shadow-[inset_3px_0_12px_-4px_rgba(52,211,153,0.25)]",
        variant === "helminth" && "from-emerald-500/5 via-card to-card ring-1 ring-emerald-500/20",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
      <div className="relative flex h-full flex-col p-4">{children}</div>
    </div>
  );
}

export function AbilitiesSectionHeader({
  formLabel,
}: {
  formLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          Abilities
          {formLabel && (
            <span className="ml-2 font-normal text-primary">{formLabel}</span>
          )}
        </h2>
        <p className="text-[10px] text-muted-foreground">
          Stats update with your current build · one Helminth subsume per loadout
        </p>
      </div>
    </div>
  );
}

type AbilityStatSource = Pick<
  Ability,
  | "damage"
  | "directDamage"
  | "aoeDamage"
  | "damagePerSecond"
  | "range"
  | "duration"
  | "radius"
  | "health"
  | "armor"
  | "shield"
  | "damageReduction"
  | "damageBuff"
  | "statusChance"
  | "castTime"
  | "cooldown"
  | "chainRange"
  | "chainLinks"
  | "maxTargets"
  | "miscStats"
>;

export function AbilityStatsBlock({
  ability,
  stats,
  display,
  compact = false,
}: {
  ability: AbilityStatSource;
  stats: WarframeCalculatedStats | null;
  display: AbilityDisplayContext;
  compact?: boolean;
}) {
  const str = stats?.abilityStrength ?? 1;
  const dur = stats?.abilityDuration ?? 1;
  const rng = stats?.abilityRange ?? 1;

  const scaledMisc = ability.miscStats
    ? scaleAbilityMiscStats(ability.miscStats, { strength: str, duration: dur, range: rng }, display)
    : [];

  const scaledDr =
    ability.damageReduction != null && ability.damageReduction > 0
      ? scaledAbilityDamageReduction(ability.damageReduction, str, display, ability.miscStats)
      : null;
  const scaledBuff =
    ability.damageBuff != null && ability.damageBuff > 0
      ? scaledAbilityDamageBuff(ability.damageBuff, str, display)
      : null;

  const hasDamage =
    (ability.damage != null && ability.damage > 0) ||
    (ability.directDamage != null && ability.directDamage > 0) ||
    (ability.aoeDamage != null && ability.aoeDamage > 0) ||
    (ability.damagePerSecond != null && ability.damagePerSecond > 0) ||
    scaledBuff != null;

  const hasDimensions =
    ability.range != null ||
    ability.duration != null ||
    ability.radius != null ||
    ability.chainRange != null ||
    ability.chainLinks != null ||
    ability.maxTargets != null;

  const hasDefense =
    (ability.health != null && ability.health > 0) ||
    (ability.armor != null && ability.armor > 0) ||
    (ability.shield != null && ability.shield > 0) ||
    scaledDr != null ||
    (ability.statusChance != null && ability.statusChance > 0);

  const hasTiming =
    (ability.castTime != null && ability.castTime > 0) ||
    (ability.cooldown != null && ability.cooldown > 0);

  const hasAny =
    hasDamage || hasDimensions || hasDefense || hasTiming || scaledMisc.length > 0;

  if (!hasAny) return null;

  const rows: React.ReactNode[] = [];

  if (ability.damage != null && ability.damage > 0) {
    rows.push(
      <AbilityStatRow
        key="damage"
        compact={compact}
        label="Damage"
        baseValue={ability.damage.toFixed(0)}
        modifiedValue={(ability.damage * str).toFixed(0)}
        isModified={str !== 1}
        isPositive={str > 1}
        scaleHint="strength"
      />,
    );
  }
  if (ability.damagePerSecond != null && ability.damagePerSecond > 0) {
    rows.push(
      <AbilityStatRow
        key="dps"
        compact={compact}
        label="Damage/s"
        baseValue={ability.damagePerSecond.toFixed(0)}
        modifiedValue={(ability.damagePerSecond * str).toFixed(0)}
        isModified={str !== 1}
        isPositive={str > 1}
        scaleHint="strength"
      />,
    );
  }
  if (ability.directDamage != null && ability.directDamage > 0) {
    rows.push(
      <AbilityStatRow
        key="direct"
        compact={compact}
        label="Direct dmg"
        baseValue={ability.directDamage.toFixed(0)}
        modifiedValue={(ability.directDamage * str).toFixed(0)}
        isModified={str !== 1}
        isPositive={str > 1}
        scaleHint="strength"
      />,
    );
  }
  if (ability.aoeDamage != null && ability.aoeDamage > 0) {
    rows.push(
      <AbilityStatRow
        key="aoe"
        compact={compact}
        label="AoE dmg"
        baseValue={ability.aoeDamage.toFixed(0)}
        modifiedValue={(ability.aoeDamage * str).toFixed(0)}
        isModified={str !== 1}
        isPositive={str > 1}
        scaleHint="strength"
      />,
    );
  }
  if (scaledBuff) {
    rows.push(
      <AbilityStatRow
        key="buff"
        compact={compact}
        label="Dmg Buff"
        baseValue={(abilityPercentFraction(ability.damageBuff!) * 100).toFixed(0)}
        modifiedValue={(scaledBuff.value * 100).toFixed(0)}
        unit="%"
        isModified={scaledBuff.modified}
        isPositive={str >= 1}
        scaleHint="strength"
      />,
    );
  }
  if (ability.range != null) {
    rows.push(
      <AbilityStatRow
        key="range"
        compact={compact}
        label="Range"
        baseValue={ability.range.toFixed(1)}
        modifiedValue={(ability.range * rng).toFixed(1)}
        unit="m"
        isModified={rng !== 1}
        isPositive={rng > 1}
        scaleHint="range"
      />,
    );
  }
  if (ability.duration != null) {
    rows.push(
      <AbilityStatRow
        key="duration"
        compact={compact}
        label="Duration"
        baseValue={ability.duration.toFixed(1)}
        modifiedValue={(ability.duration * dur).toFixed(1)}
        unit="s"
        isModified={dur !== 1}
        isPositive={dur > 1}
        scaleHint="duration"
      />,
    );
  }
  if (ability.radius != null) {
    rows.push(
      <AbilityStatRow
        key="radius"
        compact={compact}
        label="Radius"
        baseValue={ability.radius.toFixed(1)}
        modifiedValue={(ability.radius * rng).toFixed(1)}
        unit="m"
        isModified={rng !== 1}
        isPositive={rng > 1}
        scaleHint="range"
      />,
    );
  }
  if (ability.chainRange != null && ability.chainRange > 0) {
    rows.push(
      <AbilityStatRow
        key="chain-range"
        compact={compact}
        label="Chain range"
        baseValue={ability.chainRange.toFixed(1)}
        modifiedValue={(ability.chainRange * rng).toFixed(1)}
        unit="m"
        isModified={rng !== 1}
        isPositive={rng > 1}
        scaleHint="range"
      />,
    );
  }
  if (ability.chainLinks != null && ability.chainLinks > 0) {
    rows.push(
      <AbilityStatRow
        key="chain-links"
        compact={compact}
        label="Chain links"
        baseValue={String(ability.chainLinks)}
        modifiedValue={String(ability.chainLinks)}
        isModified={false}
        isPositive
      />,
    );
  }
  if (ability.maxTargets != null && ability.maxTargets > 0) {
    rows.push(
      <AbilityStatRow
        key="max-targets"
        compact={compact}
        label="Max targets"
        baseValue={String(ability.maxTargets)}
        modifiedValue={String(ability.maxTargets)}
        isModified={false}
        isPositive
      />,
    );
  }
  if (ability.health != null && ability.health > 0) {
    rows.push(
      <AbilityStatRow
        key="health"
        compact={compact}
        label="Health"
        baseValue={ability.health.toFixed(0)}
        modifiedValue={(ability.health * str).toFixed(0)}
        isModified={str !== 1}
        isPositive={str > 1}
        scaleHint="strength"
      />,
    );
  }
  if (ability.armor != null && ability.armor > 0) {
    rows.push(
      <AbilityStatRow
        key="armor"
        compact={compact}
        label="Armor"
        baseValue={ability.armor.toFixed(0)}
        modifiedValue={(ability.armor * str).toFixed(0)}
        isModified={str !== 1}
        isPositive={str > 1}
        scaleHint="strength"
      />,
    );
  }
  if (ability.shield != null && ability.shield > 0) {
    rows.push(
      <AbilityStatRow
        key="shield"
        compact={compact}
        label="Shield"
        baseValue={ability.shield.toFixed(0)}
        modifiedValue={(ability.shield * str).toFixed(0)}
        isModified={str !== 1}
        isPositive={str > 1}
        scaleHint="strength"
      />,
    );
  }
  if (scaledDr) {
    rows.push(
      <AbilityStatRow
        key="dr"
        compact={compact}
        label="Dmg Reduction"
        baseValue={(abilityPercentFraction(ability.damageReduction!) * 100).toFixed(0)}
        modifiedValue={(scaledDr.value * 100).toFixed(0)}
        unit="%"
        isModified={scaledDr.modified}
        isPositive={str >= 1}
        scaleHint="strength"
      />,
    );
  }
  if (ability.statusChance != null && ability.statusChance > 0) {
    rows.push(
      <AbilityStatRow
        key="status"
        compact={compact}
        label="Status"
        baseValue={(ability.statusChance * 100).toFixed(0)}
        modifiedValue={Math.min(100, ability.statusChance * str * 100).toFixed(0)}
        unit="%"
        isModified={str !== 1}
        isPositive={str >= 1}
        scaleHint="strength"
      />,
    );
  }
  if (ability.castTime != null && ability.castTime > 0) {
    rows.push(
      <AbilityStatRow
        key="cast"
        compact={compact}
        label="Cast Time"
        baseValue={ability.castTime.toFixed(1)}
        modifiedValue={ability.castTime.toFixed(1)}
        unit="s"
        isModified={false}
        isPositive
      />,
    );
  }
  if (ability.cooldown != null && ability.cooldown > 0) {
    rows.push(
      <AbilityStatRow
        key="cooldown"
        compact={compact}
        label="Cooldown"
        baseValue={ability.cooldown.toFixed(1)}
        modifiedValue={ability.cooldown.toFixed(1)}
        unit="s"
        isModified={false}
        isPositive
      />,
    );
  }
  for (const line of scaledMisc) {
    rows.push(
      <AbilityStatRow
        key={line.label}
        compact={compact}
        label={line.label}
        baseValue={line.base}
        modifiedValue={line.scaled}
        isModified={line.modified}
        isPositive={line.positive ?? true}
        scaleHint={line.scaleAttr}
      />,
    );
  }
  if (ability.miscStats?.channeled === true) {
    rows.push(
      <div key="channeled" className="px-1.5 py-0.5 text-[10px] font-medium text-violet-400">
        Channeled
      </div>,
    );
  }

  return (
    <div
      className={cn(
        "space-y-0.5 rounded-lg bg-muted/20 p-1.5 ring-1 ring-border/30",
        compact && "p-1",
      )}
    >
      {rows}
    </div>
  );
}
