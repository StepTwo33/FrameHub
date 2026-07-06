import { ArcaneEffectDef, ArcaneEffectLine } from "@/data/arcane-effects";
import { getArcaneEffectDef } from "@/lib/arcane-effect-overrides";
export { getArcaneEffectDef };
import { shouldApplyArcaneLineToBuild } from "@/lib/arcane-behavior-registry";
import {
  applyCustomArcaneToWarframe,
  applyCustomArcaneToWeapon,
  WarframeArcaneContext,
} from "@/lib/arcane-handlers";
import { getPersistenceDamageCap, scaleArcaneEffectLine } from "@/lib/arcane-utils";
import { CalculatedStats, Mod, WarframeCalculatedStats, Weapon } from "@/lib/types";

/** Effective stack count for arcane effect scaling. */
export function effectiveArcaneStacks(
  def: ArcaneEffectDef,
  simStacks: number,
  isWeapon: boolean,
): number {
  const isStacking = def.trigger === "stacks";

  if (isWeapon) {
    if (simStacks <= 0) return 0;
    if (!isStacking) return 1;
    const cap = def.stackCap ?? def.maxRank + 1;
    return Math.min(simStacks, cap);
  }

  // Warframe: always active when equipped; stacking arcanes assume full stack cap.
  if (!isStacking) return 1;
  return def.stackCap ?? 1;
}

export type { WarframeArcaneContext } from "@/lib/arcane-handlers";

function ensureArcaneBonuses(stats: { arcaneBonuses?: Record<string, number> }): Record<string, number> {
  if (!stats.arcaneBonuses) stats.arcaneBonuses = {};
  return stats.arcaneBonuses;
}

function trackBonus(stats: { arcaneBonuses?: Record<string, number> }, stat: string, value: number): void {
  const bonuses = ensureArcaneBonuses(stats);
  bonuses[stat] = (bonuses[stat] ?? 0) + value;
}

function resolveEffectValue(
  def: ArcaneEffectDef,
  line: ArcaneEffectLine,
  rank: number,
  stacks: number,
): number {
  const rankScaled = scaleArcaneEffectLine(line, rank, def.maxRank);
  const stackMult =
    def.trigger === "stacks" || line.stacking ? Math.max(stacks, 1) : 1;
  return rankScaled * stackMult;
}

function applyWeaponDamage(stats: CalculatedStats, scaled: number): void {
  stats.totalDamage *= 1 + scaled;
  stats.impact *= 1 + scaled;
  stats.puncture *= 1 + scaled;
  stats.slash *= 1 + scaled;
  for (const e of stats.elements) e.value *= 1 + scaled;
  for (const e of stats.rawElements) e.value *= 1 + scaled;
}

function applyWeaponStatToBuild(
  stats: CalculatedStats,
  stat: string,
  rawValue: number,
  line: ArcaneEffectLine,
  baseWeapon?: Weapon,
): void {
  const scaled = line.flat ? rawValue : rawValue / 100;
  const baseCritChance = baseWeapon?.criticalChance ?? stats.criticalChance;
  const baseCritMult = baseWeapon?.criticalMultiplier ?? stats.criticalMultiplier;
  const baseStatusChance = baseWeapon?.statusChance ?? stats.statusChance;

  switch (stat) {
    case "criticalChance":
    case "ampCritChance":
      stats.criticalChance += baseCritChance * scaled;
      break;
    case "criticalMultiplier":
    case "ampCritDamage":
      stats.criticalMultiplier += baseCritMult * scaled;
      break;
    case "fireRate":
    case "ampFireRate":
      stats.fireRate *= 1 + scaled;
      break;
    case "damage":
    case "ampDamage":
      applyWeaponDamage(stats, scaled);
      break;
    case "multishot":
    case "ampMultishot":
      stats.multishot += scaled;
      break;
    case "statusChance":
    case "ampStatusChance":
    case "elementalProcChance":
      stats.statusChance += baseStatusChance * scaled;
      break;
    case "reloadSpeed":
    case "ampReload":
    case "reloadSpeedBonus":
      if (scaled > 0) stats.reloadTime /= 1 + scaled;
      break;
    case "attackSpeed":
    case "attackSpeedBonus":
      stats.fireRate *= 1 + scaled;
      break;
    case "meleeHeavyCrit":
    case "meleeHeavyDamage":
      stats.heavyAttackDamage *= 1 + scaled;
      break;
    case "meleeComboGain":
    case "meleeComboInitial":
      stats.comboCount += line.flat ? rawValue : 0;
      break;
    case "ammoEfficiency":
      break;
    default:
      break;
  }
}

function applyWarframeStatToBuild(
  stats: WarframeCalculatedStats,
  stat: string,
  rawValue: number,
  line: ArcaneEffectLine,
  ctx: WarframeArcaneContext,
  def?: ArcaneEffectDef,
): void {
  const pct = rawValue / 100;
  const flat = line.flat ? rawValue : 0;

  switch (stat) {
    case "armorBonusAmount":
    case "armor":
      stats.armorBonus += pct;
      break;
    case "flatArmorBonus":
      stats.flatArmorBonus += flat || rawValue;
      break;
    case "abilityStrength":
      stats.abilityStrength += pct;
      break;
    case "abilityDuration":
      stats.abilityDuration += pct;
      break;
    case "abilityEfficiency":
      stats.abilityEfficiency += pct;
      break;
    case "abilityRange":
      stats.abilityRange += pct;
      break;
    case "flowEnergyMax":
      stats.flowBonus += pct;
      break;
    case "health":
    case "healthFlat":
      if (line.flat) stats.flatHealthBonus += rawValue;
      else stats.healthBonus += pct;
      break;
    case "shield":
      stats.shieldBonus += pct;
      break;
    case "energy":
      stats.energyBonus += pct;
      break;
    case "sprintSpeedBonus":
    case "sprintSpeed":
      stats.sprintSpeedBonus += pct;
      break;
    case "parkourVelocity":
      stats.parkourVelocityBonus += line.flat ? rawValue : rawValue / 100;
      break;
    case "healthRegen":
    case "healthRegenAmount":
    case "healthRegenPerSec":
      stats.healthRegenPerSec += line.flat ? rawValue : rawValue / 100;
      break;
    case "damageReduction":
    case "voidModeDamageReduction":
      trackBonus(stats, "damageReduction", rawValue);
      break;
    case "statusResistance":
    case "coldResistance":
      stats.elementalResistance += rawValue;
      break;
    case "healthOrbEffectiveness":
      stats.healingBonus += pct;
      break;
    default:
      break;
  }
}

export function applyArcaneEffectsToWeapon(
  stats: CalculatedStats,
  arcaneId: string,
  rank: number,
  simStacks: number,
  baseWeapon?: Weapon,
): void {
  const def = getArcaneEffectDef(arcaneId);
  if (!def || def.effects.length === 0) return;

  const stacks = effectiveArcaneStacks(def, simStacks, true);
  if (stacks <= 0) return;

  const handlerCtx = { def, arcaneId, rank, stacks, baseWeapon };
  if (applyCustomArcaneToWeapon(stats, handlerCtx)) return;

  for (const line of def.effects) {
    const raw = resolveEffectValue(def, line, rank, stacks);
    trackBonus(stats, line.stat, line.flat ? raw : raw);
    if (shouldApplyArcaneLineToBuild(arcaneId, line.stat, "weapon")) {
      applyWeaponStatToBuild(stats, line.stat, raw, line, baseWeapon);
    }
  }
}

function applyWarframeStat(
  stats: WarframeCalculatedStats,
  stat: string,
  rawValue: number,
  line: ArcaneEffectLine,
): void {
  trackBonus(stats, stat, line.flat ? rawValue : rawValue);
}

export function applyArcaneEffectsToWarframe(
  stats: WarframeCalculatedStats,
  arcaneId: string,
  rank: number,
  simStacks: number,
  ctx?: WarframeArcaneContext,
): void {
  const def = getArcaneEffectDef(arcaneId);
  if (!def || def.effects.length === 0) return;

  const stacks = effectiveArcaneStacks(def, simStacks, false);
  if (stacks <= 0) return;

  const context: WarframeArcaneContext = ctx ?? {
    totalHealth: stats.totalHealth,
    totalShield: stats.totalShield,
    totalArmor: stats.totalArmor,
  };

  const handlerCtx = { def, arcaneId, rank, stacks, warframeCtx: context };
  if (applyCustomArcaneToWarframe(stats, handlerCtx)) return;

  for (const line of def.effects) {
    const raw = resolveEffectValue(def, line, rank, stacks);
    applyWarframeStat(stats, line.stat, raw, line);
    if (shouldApplyArcaneLineToBuild(arcaneId, line.stat, "warframe")) {
      applyWarframeStatToBuild(stats, line.stat, raw, line, context, def);
    }
  }
}

/** Legacy wrapper — delegates to ARCANE_EFFECTS. Falls back to arcane.stats if no effect def. */
export function applyArcaneToWeaponFromMod(
  stats: CalculatedStats,
  arcane: Mod,
  stacks: number = 1,
  baseWeapon?: Weapon,
): void {
  const rank = arcane.maxRank;
  if (getArcaneEffectDef(arcane.id)) {
    applyArcaneEffectsToWeapon(stats, arcane.id, rank, stacks, baseWeapon);
    return;
  }
  // Fallback for arcanes missing from generated data
  for (const [stat, value] of Object.entries(arcane.stats)) {
    const line = { stat, maxValue: value, flat: false };
    const raw = value * stacks;
    trackBonus(stats, stat, raw);
    if (shouldApplyArcaneLineToBuild(arcane.id, stat, "weapon")) {
      applyWeaponStatToBuild(stats, stat, raw, line, baseWeapon);
    }
  }
}

export function applyArcaneToWarframeFromMod(
  stats: WarframeCalculatedStats,
  arcane: Mod,
  stacks: number = 1,
  rank?: number,
  ctx?: WarframeArcaneContext,
): void {
  const r = rank ?? arcane.maxRank;
  if (getArcaneEffectDef(arcane.id)) {
    applyArcaneEffectsToWarframe(stats, arcane.id, r, stacks, ctx);
    return;
  }
  for (const [stat, value] of Object.entries(arcane.stats)) {
    const line = { stat, maxValue: value, flat: false };
    const raw = value * stacks;
    const wfCtx = ctx ?? {
      totalHealth: stats.totalHealth,
      totalShield: stats.totalShield,
      totalArmor: stats.totalArmor,
    };
    applyWarframeStat(stats, stat, raw, line);
    if (shouldApplyArcaneLineToBuild(arcane.id, stat, "warframe")) {
      applyWarframeStatToBuild(stats, stat, raw, line, wfCtx);
    }
  }
}
