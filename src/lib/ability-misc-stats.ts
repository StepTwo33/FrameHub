import type { Ability } from "@/lib/types";

export interface AbilityScaleContext {
  strength: number;
  duration: number;
  range: number;
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
  durationExtension: "Duration per Kill",
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

function parseRangeNumbers(value: string): { min: number; max: number } | null {
  const match = value.match(/^([\d.]+)\s*[–-]\s*([\d.]+)$/);
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

function isRadiusLikeKey(key: string): boolean {
  return /radius|range/i.test(key) && !/drain|duration|cooldown|revive/i.test(key);
}

function isPercentRangeKey(key: string): boolean {
  return /strip|reduction|bonus/i.test(key) && !/multiplier|growth/i.test(key);
}

const FRACTION_BUFF_KEYS = new Set([
  "speedBuff",
  "reloadBuff",
  "gunDamage",
  "meleeDamage",
  "strengthBonus",
]);

const MULTIPLIER_KEYS = new Set([
  "damageBonus",
  "damageMultiplier",
  "healthMultiplier",
  "markDamageMultiplier",
  "armorMultiplier",
  "damageGrowth",
  "critDamageBonus",
  "electricDamageBonus",
]);

function parseRangePerSecond(value: string): { min: number; max: number } | null {
  const match = value.match(/^([\d.]+)\s*[–-]\s*([\d.]+)\/s$/);
  if (!match) return null;
  return { min: parseFloat(match[1]), max: parseFloat(match[2]) };
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

function drCapFrom(miscStats: Record<string, unknown>): number {
  const cap = miscStats.drCap;
  if (typeof cap === "number") return cap <= 1 ? cap : cap / 100;
  return 0.9;
}

/** DR cap from ability misc metadata (default 90%). */
export function getAbilityDrCap(miscStats?: Record<string, unknown>): number {
  if (!miscStats) return 0.9;
  return drCapFrom(miscStats);
}

/** Scale misc ability stats with STR / DUR / RNG and apply known caps. */
export function scaleAbilityMiscStats(
  miscStats: Record<string, unknown>,
  ctx: AbilityScaleContext,
): ScaledMiscStatLine[] {
  const { strength: str, duration: dur, range: rng } = ctx;
  const drCap = drCapFrom(miscStats);
  const lines: ScaledMiscStatLine[] = [];

  for (const [key, value] of Object.entries(miscStats)) {
    if (SKIP_KEYS.has(key)) continue;

    if (key === "statusChance" || key === "strengthBonus" || FRACTION_BUFF_KEYS.has(key)) {
      const base = parsePercentValue(value);
      if (base != null) {
        const cap = key === "speedBuff" || key === "reloadBuff" ? 1 : key === "statusChance" ? 1 : undefined;
        const scaled = cap != null ? Math.min(base * str, cap) : base * str;
        lines.push({
          label: humanizeKey(key),
          base: fmtPct(base),
          scaled: fmtPct(scaled),
          modified: str !== 1,
          positive: str >= 1,
        });
        continue;
      }
    }

    if (MULTIPLIER_KEYS.has(key) && typeof value === "number") {
      const scaled = value * str;
      lines.push({
        label: humanizeKey(key),
        base: value <= 1 ? fmtPct(value) : `${(value * 100).toFixed(0)}%`,
        scaled: value <= 1 ? fmtPct(scaled) : `${(scaled * 100).toFixed(0)}%`,
        modified: str !== 1,
        positive: str >= 1,
      });
      continue;
    }

    if (key === "armorCap" && typeof value === "number") {
      const scaled = value * str;
      lines.push({
        label: humanizeKey(key),
        base: String(Math.round(value)),
        scaled: String(Math.round(scaled)),
        modified: str !== 1,
        positive: str >= 1,
      });
      continue;
    }

    if (key === "healPerMeter" && typeof value === "number") {
      const scaled = value * str;
      lines.push({
        label: humanizeKey(key),
        base: fmtPct(value),
        scaled: fmtPct(scaled),
        modified: str !== 1,
        positive: str >= 1,
      });
      continue;
    }

    if (key === "width" || isRadiusLikeKey(key)) {
      const base = parseMeters(value);
      if (base != null) {
        const scaled = base * rng;
        lines.push({
          label: humanizeKey(key),
          base: `${base.toFixed(1)}m`,
          scaled: `${scaled.toFixed(1)}m`,
          modified: rng !== 1,
          positive: rng >= 1,
        });
        continue;
      }
    }

    if (typeof value === "string" && isPercentRangeKey(key)) {
      const range = parseRangePercent(value);
      if (range) {
        const minScaled = Math.min(range.min * str, 1);
        const maxScaled = Math.min(range.max * str, 1);
        lines.push({
          label: humanizeKey(key),
          base: `${fmtPct(range.min)}–${fmtPct(range.max)}`,
          scaled: `${fmtPct(minScaled)}–${fmtPct(maxScaled)}`,
          modified: str !== 1,
          positive: str >= 1,
        });
        continue;
      }
    }

    if (typeof value === "string") {
      const numRange = parseRangeNumbers(value);
      if (numRange && /bolt|target|enemy/i.test(key)) {
        const minScaled = Math.max(1, Math.round(numRange.min * str));
        const maxScaled = Math.max(1, Math.round(numRange.max * str));
        lines.push({
          label: humanizeKey(key),
          base: `${numRange.min}–${numRange.max}`,
          scaled: `${minScaled}–${maxScaled}`,
          modified: str !== 1,
          positive: str >= 1,
        });
        continue;
      }
    }

    if (key === "shieldStrip" || key === "armorStrip" || key === "defenseReduction") {
      const base = parsePercentValue(value);
      if (base != null) {
        const scaled = Math.min(base * str, 1);
        lines.push({
          label: humanizeKey(key),
          base: fmtPct(base),
          scaled: fmtPct(scaled),
          modified: Math.abs(scaled - base) > 0.001,
          positive: scaled >= base,
        });
        continue;
      }
    }

    if (key === "arc") {
      const base = parseDegrees(value);
      if (base != null) {
        const scaled = base * rng;
        lines.push({
          label: "Arc",
          base: `${base.toFixed(1)}°`,
          scaled: `${scaled.toFixed(1)}°`,
          modified: rng !== 1,
          positive: rng >= 1,
        });
        continue;
      }
    }

    if (
      (key === "minRadius" || key === "maxRadius" || key === "decoyRadius" || key === "splashRadius" || key === "stunRadius" || key === "explosionRadius" || key === "enemyLinkRange") &&
      typeof value === "number"
    ) {
      const scaled = value * rng;
      lines.push({
        label: humanizeKey(key),
        base: `${value.toFixed(1)}m`,
        scaled: `${scaled.toFixed(1)}m`,
        modified: rng !== 1,
        positive: rng >= 1,
      });
      continue;
    }

    if (
      (key === "decoyDamage" || key === "shieldsPerKill" || key === "energyRegen" || key === "healthPerHit" || key === "energyRefundPerHit") &&
      (typeof value === "number" || typeof value === "string")
    ) {
      const base = parseNumeric(value);
      if (base != null) {
        const scaled = base * str;
        lines.push({
          label: humanizeKey(key),
          base: String(Math.round(base)),
          scaled: String(Math.round(scaled)),
          modified: str !== 1,
          positive: str >= 1,
        });
        continue;
      }
    }

    if (key === "decoyDuration" || key === "armorDuration") {
      const base = parseSeconds(value);
      if (base != null) {
        const scaled = base * dur;
        lines.push({
          label: humanizeKey(key),
          base: `${base.toFixed(1)}s`,
          scaled: `${scaled.toFixed(1)}s`,
          modified: dur !== 1,
          positive: dur >= 1,
        });
        continue;
      }
    }

    if (key === "damageReduction" && typeof value === "string") {
      const range = parseRangePercent(value);
      if (range) {
        const minScaled = Math.min(range.min * str, drCap);
        const maxScaled = Math.min(range.max * str, drCap);
        lines.push({
          label: "Damage Reduction",
          base: `${fmtPct(range.min)}–${fmtPct(range.max)}`,
          scaled: `${fmtPct(minScaled)}–${fmtPct(maxScaled)}`,
          modified: str !== 1,
          positive: str >= 1,
        });
        continue;
      }
    }

    if (key === "healthRegen" && typeof value === "string") {
      const range = parseRangePerSecond(value);
      if (range) {
        lines.push({
          label: "Health Regen",
          base: `${range.min}–${range.max}/s`,
          scaled: `${Math.round(range.min * str)}–${Math.round(range.max * str)}/s`,
          modified: str !== 1,
          positive: str >= 1,
        });
        continue;
      }
      const single = parseSinglePerSecond(value);
      if (single != null) {
        lines.push({
          label: "Health Regen",
          base: `${single}/s`,
          scaled: `${Math.round(single * str)}/s`,
          modified: str !== 1,
          positive: str >= 1,
        });
        continue;
      }
    }

    if (key === "slowPercent" && typeof value === "number") {
      const cap = typeof miscStats.slowCap === "number"
        ? (miscStats.slowCap <= 1 ? miscStats.slowCap : miscStats.slowCap / 100)
        : 0.95;
      const scaled = Math.min(value * str, cap);
      lines.push({
        label: "Slow",
        base: fmtPct(value),
        scaled: fmtPct(scaled),
        modified: str !== 1,
        positive: str >= 1,
      });
      continue;
    }

    if (key === "lifeStealPercent" && typeof value === "number") {
      lines.push({
        label: "Life Steal",
        base: fmtPct(value),
        scaled: fmtPct(value * str),
        modified: str !== 1,
        positive: str >= 1,
      });
      continue;
    }

    if ((key === "javelins" || key === "maggots") && typeof value === "number") {
      const scaled = Math.max(1, Math.round(value * str));
      lines.push({
        label: humanizeKey(key),
        base: String(value),
        scaled: String(scaled),
        modified: scaled !== value,
        positive: scaled >= value,
      });
      continue;
    }

    if (typeof value === "boolean") {
      lines.push({
        label: humanizeKey(key),
        base: String(value),
        scaled: String(value),
        modified: false,
      });
      continue;
    }

    if (
      key === "criticalChanceBonus" ||
      key === "durationExtension" ||
      key === "maxConstellationStars" ||
      key === "reviveCooldown" ||
      key === "decoyCooldown" ||
      key === "statusCleanse" ||
      key === "mutationStackChance" ||
      key === "energyDrain" ||
      key === "mutationStackCost"
    ) {
      lines.push({
        label: humanizeKey(key),
        base: String(value),
        scaled: String(value),
        modified: false,
      });
      continue;
    }

    lines.push({
      label: humanizeKey(key),
      base: typeof value === "number"
        ? (Number.isInteger(value) ? String(value) : value.toFixed(2))
        : String(value),
      scaled: typeof value === "number"
        ? (Number.isInteger(value) ? String(value) : value.toFixed(2))
        : String(value),
      modified: false,
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

export function scaledDamageReduction(base: number, strength: number, cap = 0.9): number {
  return Math.min(abilityPercentFraction(base) * strength, cap);
}

export function scaledDamageBuff(base: number, strength: number): number {
  return abilityPercentFraction(base) * strength;
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
