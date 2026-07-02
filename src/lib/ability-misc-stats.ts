import type { Ability } from "@/lib/types";
import {
  getVerifiedFieldScaling,
  getVerifiedMiscScaling,
  type AbilityScaleAttribute,
  type VerifiedStatScaling,
} from "@/lib/ability-scaling-registry";

export interface AbilityScaleContext {
  strength: number;
  duration: number;
  range: number;
}

export interface AbilityDisplayContext {
  warframeId?: string;
  abilityName: string;
  helminth?: boolean;
}

export interface ScaledMiscStatLine {
  label: string;
  base: string;
  scaled: string;
  modified: boolean;
  positive?: boolean;
}

const SKIP_KEYS = new Set(["drCap", "slowCap", "channeled", "maxDuration"]);

const LABELS: Record<string, string> = {
  shieldStrip: "Shield Strip",
  armorStrip: "Armor Strip",
  arc: "Arc",
  minRadius: "Min Radius",
  maxRadius: "Max Radius",
  decoyDamage: "Decoy Damage",
  decoyRadius: "Decoy Radius",
  decoyDuration: "Decoy Duration",
  decoyCooldown: "Decoy Cooldown",
  damageReduction: "Damage Reduction",
  healthRegen: "Health Regen",
  reviveCooldown: "Revive Cooldown",
  criticalChanceBonus: "Crit Chance Bonus",
  maxConstellationStars: "Max Stars",
  durationExtension: "Duration Extension",
  slowPercent: "Slow",
  lifeStealPercent: "Life Steal",
  defenseReduction: "Defense Reduction",
  splashRadius: "Splash Radius",
  javelins: "Javelins",
  maggots: "Maggots",
  energyRegen: "Energy Regen",
  shieldsPerKill: "Shields per Kill",
  healthPerHit: "Health per Hit",
  speedBuff: "Speed Buff",
  reloadBuff: "Reload Buff",
  gunDamage: "Gun Damage",
  meleeDamage: "Melee Damage",
  damageBonus: "Damage Bonus",
  strengthBonus: "Strength Bonus",
  enemyLinkRange: "Link Range",
  explosionRadius: "Explosion Radius",
  armorMultiplier: "Armor Multiplier",
  damageGrowth: "Damage Growth",
  electricDamageBonus: "Electric Damage Bonus",
  critDamageBonus: "Crit Damage Bonus",
  energyDrain: "Energy Drain",
  energyRefundPerHit: "Energy per Hit",
  width: "Width",
  mutationStackChance: "Mutation Chance",
  mutationStackCost: "Mutation Cost",
  statusCleanse: "Status Cleanse",
  statusChance: "Status Chance",
  healthMultiplier: "Health Multiplier",
  damageMultiplier: "Damage Multiplier",
  markDamageMultiplier: "Mark Damage Mult.",
  healPerMeter: "Heal per Meter",
  stunRadius: "Stun Radius",
  armorCap: "Armor Cap",
  armorDuration: "Armor Duration",
};

function humanizeKey(key: string): string {
  return LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function parsePercentValue(value: unknown): number | null {
  if (typeof value === "number") return value <= 1 ? value : value / 100;
  if (typeof value === "string") {
    const match = value.match(/^([\d.]+)\s*%/);
    if (match) return parseFloat(match[1]) / 100;
  }
  return null;
}

function parseRangePercent(value: string): { min: number; max: number } | null {
  const match = value.match(/^([\d.]+)\s*[–-]\s*([\d.]+)\s*%/);
  if (!match) return null;
  return { min: parseFloat(match[1]) / 100, max: parseFloat(match[2]) / 100 };
}

function parseRangePerSecond(value: string): { min: number; max: number } | null {
  const match = value.match(/^([\d.]+)\s*[–-]\s*([\d.]+)\/s$/);
  if (!match) return null;
  return { min: parseFloat(match[1]), max: parseFloat(match[2]) };
}

function parseSinglePerSecond(value: string): number | null {
  const match = value.match(/^([\d.]+)\/s$/);
  if (!match) return null;
  return parseFloat(match[1]);
}

function parseNumeric(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = parseFloat(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseMeters(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const match = value.match(/([\d.]+)\s*m\b/i);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

function parseSeconds(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const match = value.match(/^([\d.]+)s$/);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

function parseDegrees(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const match = value.match(/^([\d.]+)\s*°/);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

function fmtPct(fraction: number): string {
  return `${(fraction * 100).toFixed(0)}%`;
}

function scaleMultiplier(ctx: AbilityScaleContext, attr: AbilityScaleAttribute): number {
  if (attr === "strength") return ctx.strength;
  if (attr === "duration") return ctx.duration;
  return ctx.range;
}

function resolveCap(
  rule: VerifiedStatScaling,
  miscStats: Record<string, unknown>,
): number | undefined {
  if (rule.useSiblingDrCap) {
    const cap = miscStats.drCap;
    if (typeof cap === "number") return cap <= 1 ? cap : cap / 100;
  }
  if (rule.useSiblingSlowCap) {
    const cap = miscStats.slowCap;
    if (typeof cap === "number") return cap <= 1 ? cap : cap / 100;
  }
  return rule.cap;
}

function applyCap(value: number, cap: number | undefined): number {
  return cap != null ? Math.min(value, cap) : value;
}

function formatBaseValue(key: string, value: unknown): string {
  if (typeof value === "boolean") return String(value);
  if (key === "arc") {
    const deg = parseDegrees(value);
    if (deg != null) return `${deg.toFixed(1)}°`;
  }
  const meters = parseMeters(value);
  if (meters != null && (key.includes("adius") || key.includes("ange") || key === "width" || key === "arc")) {
    return `${meters.toFixed(1)}m`;
  }
  const seconds = parseSeconds(value);
  if (seconds != null) return `${seconds.toFixed(1)}s`;
  const pct = parsePercentValue(value);
  if (pct != null) return fmtPct(pct);
  if (typeof value === "string") {
    const range = parseRangePercent(value);
    if (range) return `${fmtPct(range.min)}–${fmtPct(range.max)}`;
    const perSec = parseRangePerSecond(value);
    if (perSec) return `${perSec.min}–${perSec.max}/s`;
    const single = parseSinglePerSecond(value);
    if (single != null) return `${single}/s`;
    return value;
  }
  if (typeof value === "number") {
    if (value > 1 && value <= 10 && (key.endsWith("Bonus") || key.endsWith("Multiplier") || key === "damageBonus")) {
      return `${(value * 100).toFixed(0)}%`;
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  return String(value);
}

function scaleVerifiedValue(
  key: string,
  value: unknown,
  rule: VerifiedStatScaling,
  ctx: AbilityScaleContext,
  miscStats: Record<string, unknown>,
): { scaled: string; modified: boolean; positive: boolean } | null {
  const mult = scaleMultiplier(ctx, rule.scale);
  const cap = resolveCap(rule, miscStats);

  if (key === "arc") {
    const base = parseDegrees(value);
    if (base == null) return null;
    const scaled = applyCap(base * mult, cap);
    return {
      scaled: `${scaled.toFixed(1)}°`,
      modified: mult !== 1,
      positive: mult >= 1,
    };
  }

  const meters = parseMeters(value);
  if (meters != null && (key.includes("adius") || key.includes("ange") || key === "width" || key === "stunRadius" || key === "enemyLinkRange" || key === "explosionRadius" || key === "splashRadius" || key === "decoyRadius")) {
    const scaled = applyCap(meters * mult, cap);
    return {
      scaled: `${scaled.toFixed(1)}m`,
      modified: mult !== 1,
      positive: mult >= 1,
    };
  }

  const seconds = parseSeconds(value);
  if (seconds != null) {
    const scaled = applyCap(seconds * mult, cap);
    return {
      scaled: `${scaled.toFixed(1)}s`,
      modified: mult !== 1,
      positive: mult >= 1,
    };
  }

  if (typeof value === "string" && key === "damageReduction") {
    const range = parseRangePercent(value);
    if (range) {
      const minScaled = applyCap(range.min * mult, cap);
      const maxScaled = applyCap(range.max * mult, cap);
      return {
        scaled: `${fmtPct(minScaled)}–${fmtPct(maxScaled)}`,
        modified: mult !== 1,
        positive: mult >= 1,
      };
    }
  }

  if (typeof value === "string" && key === "healthRegen") {
    const range = parseRangePerSecond(value);
    if (range) {
      return {
        scaled: `${Math.round(range.min * mult)}–${Math.round(range.max * mult)}/s`,
        modified: mult !== 1,
        positive: mult >= 1,
      };
    }
    const single = parseSinglePerSecond(value);
    if (single != null) {
      return {
        scaled: `${Math.round(single * mult)}/s`,
        modified: mult !== 1,
        positive: mult >= 1,
      };
    }
  }

  const pct = parsePercentValue(value);
  if (pct != null) {
    const scaled = applyCap(pct * mult, cap);
    return {
      scaled: fmtPct(scaled),
      modified: Math.abs(scaled - pct) > 0.001,
      positive: scaled >= pct,
    };
  }

  const num = parseNumeric(value);
  if (num != null) {
    let scaledNum: number;
    if (key === "javelins" || key === "maggots") {
      scaledNum = Math.max(1, Math.round(num * mult));
    } else if (key.endsWith("Multiplier") || key === "damageBonus" || key === "damageGrowth") {
      scaledNum = applyCap(num * mult, cap);
      if (num <= 1) {
        return {
          scaled: fmtPct(scaledNum),
          modified: mult !== 1,
          positive: mult >= 1,
        };
      }
      return {
        scaled: `${(scaledNum * 100).toFixed(0)}%`,
        modified: mult !== 1,
        positive: mult >= 1,
      };
    } else {
      scaledNum = applyCap(num * mult, cap);
    }
    return {
      scaled: String(Math.round(scaledNum)),
      modified: Math.round(scaledNum) !== Math.round(num),
      positive: scaledNum >= num,
    };
  }

  return null;
}

/** Scale misc stats only where verified in the scaling registry. */
export function scaleAbilityMiscStats(
  miscStats: Record<string, unknown>,
  ctx: AbilityScaleContext,
  display?: AbilityDisplayContext,
): ScaledMiscStatLine[] {
  const lines: ScaledMiscStatLine[] = [];

  for (const [key, value] of Object.entries(miscStats)) {
    if (SKIP_KEYS.has(key)) continue;

    const base = formatBaseValue(key, value);
    const rule = display
      ? getVerifiedMiscScaling(display.warframeId, display.abilityName, key, display.helminth)
      : null;

    if (!rule) {
      lines.push({
        label: humanizeKey(key),
        base,
        scaled: base,
        modified: false,
      });
      continue;
    }

    const result = scaleVerifiedValue(key, value, rule, ctx, miscStats);
    lines.push({
      label: humanizeKey(key),
      base,
      scaled: result?.scaled ?? base,
      modified: result?.modified ?? false,
      positive: result?.positive ?? true,
    });
  }

  return lines;
}

/** Effective energy cost with 175% efficiency floor (matches in-game builder cards). */
export function scaledAbilityEnergyCost(baseCost: number, efficiency: number): number {
  const clampedEff = Math.min(Math.max(efficiency, 0), 1.75);
  return Math.max(baseCost * 0.25, baseCost * (2 - clampedEff));
}

/** Treat stored DR/buff as 0–1 fraction when ≤1, else already a percent value 0–100. */
export function abilityPercentFraction(value: number): number {
  return value <= 1 ? value : value / 100;
}

export function scaledDamageReduction(
  base: number,
  strength: number,
  cap?: number,
): number {
  const fraction = abilityPercentFraction(base) * strength;
  return cap != null ? Math.min(fraction, cap) : fraction;
}

export function scaledDamageBuff(base: number, strength: number): number {
  return abilityPercentFraction(base) * strength;
}

/** Scale top-level DR only when verified for this ability. */
export function scaledAbilityDamageReduction(
  base: number,
  strength: number,
  display: AbilityDisplayContext,
  miscStats?: Record<string, unknown>,
): { value: number; modified: boolean } {
  const rule = getVerifiedFieldScaling(display.warframeId, display.abilityName, "damageReduction");
  if (!rule) {
    return { value: abilityPercentFraction(base), modified: false };
  }
  const cap = rule.useSiblingDrCap && miscStats
    ? resolveCap(rule, miscStats)
    : rule.cap;
  return {
    value: scaledDamageReduction(base, strength, cap),
    modified: strength !== 1,
  };
}

/** Scale top-level damage buff only when verified for this ability. */
export function scaledAbilityDamageBuff(
  base: number,
  strength: number,
  display: AbilityDisplayContext,
): { value: number; modified: boolean } {
  const rule = getVerifiedFieldScaling(display.warframeId, display.abilityName, "damageBuff");
  if (!rule) {
    return { value: abilityPercentFraction(base), modified: false };
  }
  const cap = rule.cap;
  const scaled = abilityPercentFraction(base) * strength;
  return {
    value: cap != null ? Math.min(scaled, cap) : scaled,
    modified: strength !== 1,
  };
}

/** @deprecated Use scaledAbilityDamageReduction — returns cap only when drCap is set on the ability. */
export function getAbilityDrCap(miscStats?: Record<string, unknown>): number | null {
  if (!miscStats || miscStats.drCap == null) return null;
  const cap = miscStats.drCap;
  return typeof cap === "number" ? (cap <= 1 ? cap : cap / 100) : null;
}

export function abilityHasScaledMisc(miscStats?: Record<string, unknown>): boolean {
  if (!miscStats) return false;
  return Object.keys(miscStats).some((k) => !SKIP_KEYS.has(k));
}

export function countAbilityStatLines(ability: Ability): number {
  let n = 0;
  if (ability.damage) n++;
  if (ability.miscStats) n += Object.keys(ability.miscStats).filter((k) => !SKIP_KEYS.has(k)).length;
  return n;
}
