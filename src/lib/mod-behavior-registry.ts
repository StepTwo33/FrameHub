import type { ItemApplyMode, ItemApplyTarget, VerifiedItemStatLine, VerifiedModBehavior } from "@/lib/item-behavior-types";
import { VERIFIED_MOD_BEHAVIORS } from "@/data/mod-behaviors";

export type WeaponModAccumulators = {
  damageBonus: number;
  critChanceBonus: number;
  critMultBonus: number;
  fireRateBonus: number;
  multishotBonus: number;
  statusBonus: number;
  magBonus: number;
  reloadBonus: number;
  impactBonus: number;
  punctureBonus: number;
  slashBonus: number;
  hasBloodRush: boolean;
  bloodRushValue: number;
  hasConditionOverload: boolean;
  conditionOverloadPerStatus: number;
  hasWeepingWounds: boolean;
  weepingWoundsValue: number;
  hasBerserkerFury: boolean;
  berserkerFuryPerStack: number;
  galvMultishotOnKillPerStack: number;
  galvDamagePerStatusPerStack: number;
};

export type ModApplyWeaponContext = {
  modId: string;
  statKey: string;
  modValue: number;
  baseWeaponDamage: number;
  acc: WeaponModAccumulators;
  elementalMods: { type: string; value: number }[];
  comboDuration?: { add: (v: number) => void };
  heavyAttackEfficiency?: { add: (v: number) => void };
};

export function getVerifiedModBehavior(modId: string): VerifiedModBehavior | undefined {
  return VERIFIED_MOD_BEHAVIORS[modId];
}

export function getVerifiedModStatLine(modId: string, statKey: string): VerifiedItemStatLine | undefined {
  const behavior = getVerifiedModBehavior(modId);
  return behavior?.stats.find((s) => s.statKey === statKey);
}

function trackModPanel(stats: { modBonuses?: Record<string, number> }, modId: string, statKey: string, value: number): void {
  if (!stats.modBonuses) stats.modBonuses = {};
  const key = `${modId}::${statKey}`;
  stats.modBonuses[key] = (stats.modBonuses[key] ?? 0) + value * 100;
}

function applyModeToWeaponAcc(mode: ItemApplyMode, ctx: ModApplyWeaponContext): boolean {
  const { acc, modValue, statKey, elementalMods, baseWeaponDamage } = ctx;
  switch (mode) {
    case "multiplicative_percent":
      switch (statKey) {
        case "damage":
          acc.damageBonus += modValue;
          return true;
        case "criticalChance":
          acc.critChanceBonus += modValue;
          return true;
        case "criticalMultiplier":
          acc.critMultBonus += modValue;
          return true;
        case "fireRate":
        case "attackSpeed":
          acc.fireRateBonus += modValue;
          return true;
        case "multishot":
          acc.multishotBonus += modValue;
          return true;
        case "statusChance":
          acc.statusBonus += modValue;
          return true;
        case "magazine":
          acc.magBonus += modValue;
          return true;
        case "reloadSpeed":
          acc.reloadBonus += modValue;
          return true;
        case "impact":
          acc.impactBonus += modValue;
          return true;
        case "puncture":
          acc.punctureBonus += modValue;
          return true;
        case "slash":
          acc.slashBonus += modValue;
          return true;
        default:
          return false;
      }
    case "elemental_from_base_damage":
      elementalMods.push({ type: statKey, value: baseWeaponDamage * modValue });
      return true;
    case "conditional_combo_crit":
      acc.hasBloodRush = true;
      acc.bloodRushValue = modValue;
      return true;
    case "conditional_combo_status":
      acc.hasWeepingWounds = true;
      acc.weepingWoundsValue = modValue;
      return true;
    case "conditional_damage_per_status":
      acc.hasConditionOverload = true;
      acc.conditionOverloadPerStatus = modValue;
      return true;
    case "conditional_multishot_on_kill":
      if (statKey === "multishot") {
        acc.multishotBonus += modValue;
        return true;
      }
      if (statKey === "multishotOnKill") {
        acc.galvMultishotOnKillPerStack = modValue;
        return true;
      }
      return false;
    case "conditional_damage_per_status_on_kill":
      if (statKey === "statusChance") {
        acc.statusBonus += modValue;
        return true;
      }
      if (statKey === "damagePerStatus") {
        acc.galvDamagePerStatusPerStack = modValue;
        return true;
      }
      return false;
    case "conditional_attack_speed_on_kill":
      acc.hasBerserkerFury = true;
      acc.berserkerFuryPerStack = modValue;
      return true;
    case "additive_percent":
      if (statKey === "comboDuration" && ctx.comboDuration) {
        ctx.comboDuration.add(modValue);
        return true;
      }
      if (statKey === "heavyAttackEfficiency" && ctx.heavyAttackEfficiency) {
        ctx.heavyAttackEfficiency.add(modValue);
        return true;
      }
      return false;
    default:
      return false;
  }
}

/** Apply a single mod stat line when that mod has a verified per-item entry. Returns true if handled. */
export function applyVerifiedModStatToWeapon(
  stats: { modBonuses?: Record<string, number> },
  ctx: ModApplyWeaponContext,
): boolean {
  const line = getVerifiedModStatLine(ctx.modId, ctx.statKey);
  if (!line) {
    trackModPanel(stats, ctx.modId, ctx.statKey, ctx.modValue);
    return false;
  }

  if (line.target === "mod_panel" || line.target === "pending") {
    trackModPanel(stats, ctx.modId, ctx.statKey, ctx.modValue);
    return true;
  }

  if (line.target !== "weapon_dps") {
    trackModPanel(stats, ctx.modId, ctx.statKey, ctx.modValue);
    return true;
  }

  if (line.mode === "custom") return false;

  if (applyModeToWeaponAcc(line.mode, ctx)) return true;

  trackModPanel(stats, ctx.modId, ctx.statKey, ctx.modValue);
  return true;
}

export type WarframeModAccumulators = {
  healthBonus: number;
  shieldBonus: number;
  armorBonus: number;
  energyBonus: number;
  sprintSpeedBonus: number;
  flowBonus: number;
  parkourVelocityBonus: number;
  abilityStrength: number;
  abilityDuration: number;
  abilityEfficiency: number;
  abilityRange: number;
};

export type ArchwingModAccumulators = WarframeModAccumulators & {
  flightSpeedBonus: number;
  kineticDiversionPercent: number;
};

export type CompanionModAccumulators = {
  healthBonus: number;
  shieldBonus: number;
  armorBonus: number;
  shieldRechargeBonus: number;
  meleeDamageBonus: number;
  attackSpeedBonus: number;
  critChanceBonus: number;
  critDamageBonus: number;
  weakspotDamageBonus: number;
  finisherDamageBonus: number;
  damageReductionBonus: number;
  pickupDoubleChance: number;
  creditPickupDoubleChance: number;
  resourcePickupDoubleChance: number;
  impactStatusStacks: number;
  reviveShieldHealth: number;
  incapacitationTimerReduction: number;
  healthRegenBonus: number;
};

const COMPANION_BODY_STAT_KEYS = new Set([
  "health",
  "shield",
  "armor",
  "meleeDamage",
  "attackSpeed",
  "criticalChance",
  "criticalMultiplier",
  "critChance",
  "critDamage",
  "shieldRecharge",
]);

const COMPANION_UTILITY_STAT_KEYS = new Set([
  "weakspotDamage",
  "finisherDamage",
  "damageReduction",
  "pickupDoubleChance",
  "creditPickupDoubleChance",
  "resourcePickupDoubleChance",
  "impactStatusStacks",
  "reviveShieldHealth",
  "incapacitationTimerReduction",
  "healthRegen",
]);

function appliesToCompanionTotals(
  line: VerifiedItemStatLine | undefined,
  statKey: string,
  modCategory: string,
): boolean {
  if (line?.target === "companion_totals") return true;
  if (modCategory !== "companion" && modCategory !== "augment") return false;
  if (line?.target === "warframe_totals" && COMPANION_BODY_STAT_KEYS.has(statKey)) return true;
  if (COMPANION_UTILITY_STAT_KEYS.has(statKey)) return true;
  return false;
}

export function applyVerifiedModStatToCompanion(
  stats: { modBonuses?: Record<string, number> },
  modId: string,
  statKey: string,
  modValue: number,
  acc: CompanionModAccumulators,
  modCategory: string,
): boolean {
  const line = getVerifiedModStatLine(modId, statKey);
  if (!line) return false;

  if (!appliesToCompanionTotals(line, statKey, modCategory)) {
    trackModPanel(stats, modId, statKey, modValue);
    return true;
  }

  switch (statKey) {
    case "health":
      acc.healthBonus += modValue;
      return true;
    case "shield":
      acc.shieldBonus += modValue;
      return true;
    case "armor":
      acc.armorBonus += modValue;
      return true;
    case "shieldRecharge":
      acc.shieldRechargeBonus += modValue;
      return true;
    case "meleeDamage":
      acc.meleeDamageBonus += modValue;
      return true;
    case "attackSpeed":
      acc.attackSpeedBonus += modValue;
      return true;
    case "criticalChance":
    case "critChance":
      acc.critChanceBonus += modValue;
      return true;
    case "criticalMultiplier":
    case "critDamage":
      acc.critDamageBonus += modValue;
      return true;
    case "weakspotDamage":
      acc.weakspotDamageBonus += modValue;
      return true;
    case "finisherDamage":
      acc.finisherDamageBonus += modValue;
      return true;
    case "damageReduction":
      acc.damageReductionBonus += modValue;
      return true;
    case "pickupDoubleChance":
      acc.pickupDoubleChance += modValue;
      return true;
    case "creditPickupDoubleChance":
      acc.creditPickupDoubleChance += modValue;
      return true;
    case "resourcePickupDoubleChance":
      acc.resourcePickupDoubleChance += modValue;
      return true;
    case "impactStatusStacks":
      acc.impactStatusStacks += modValue;
      return true;
    case "reviveShieldHealth":
      acc.reviveShieldHealth += modValue;
      return true;
    case "incapacitationTimerReduction":
      acc.incapacitationTimerReduction += modValue;
      return true;
    case "healthRegen":
      acc.healthRegenBonus += modValue;
      return true;
    default:
      trackModPanel(stats, modId, statKey, modValue);
      return true;
  }
}

export function applyVerifiedModStatToWarframe(
  stats: { modBonuses?: Record<string, number> },
  modId: string,
  statKey: string,
  modValue: number,
  acc: WarframeModAccumulators,
): boolean {
  const line = getVerifiedModStatLine(modId, statKey);
  if (!line) {
    trackModPanel(stats, modId, statKey, modValue);
    return false;
  }

  if (line.target === "mod_panel" || line.target === "pending" || line.target !== "warframe_totals") {
    trackModPanel(stats, modId, statKey, modValue);
    return true;
  }

  switch (statKey) {
    case "health":
      acc.healthBonus += modValue;
      return true;
    case "shield":
      acc.shieldBonus += modValue;
      return true;
    case "armor":
      acc.armorBonus += modValue;
      return true;
    case "energy":
    case "energyMax":
      acc.energyBonus += modValue;
      return true;
    case "abilityStrength":
      acc.abilityStrength += modValue;
      return true;
    case "abilityDuration":
      acc.abilityDuration += modValue;
      return true;
    case "abilityEfficiency":
      acc.abilityEfficiency += modValue;
      return true;
    case "abilityRange":
      acc.abilityRange += modValue;
      return true;
    case "sprintSpeed":
      acc.sprintSpeedBonus += modValue;
      return true;
    case "flow":
    case "flowEnergyMax":
      acc.flowBonus += modValue;
      return true;
    case "parkourVelocity":
      acc.parkourVelocityBonus += modValue;
      return true;
    default:
      trackModPanel(stats, modId, statKey, modValue);
      return true;
  }
}

export function applyVerifiedModStatToNecramech(
  stats: { modBonuses?: Record<string, number> },
  modId: string,
  statKey: string,
  modValue: number,
  acc: ArchwingModAccumulators,
): boolean {
  const line = getVerifiedModStatLine(modId, statKey);
  if (!line) {
    trackModPanel(stats, modId, statKey, modValue);
    return false;
  }

  if (line.target === "mod_panel" || line.target === "pending") {
    trackModPanel(stats, modId, statKey, modValue);
    return true;
  }

  if (line.target !== "warframe_totals") {
    trackModPanel(stats, modId, statKey, modValue);
    return true;
  }

  switch (statKey) {
    case "health":
      acc.healthBonus += modValue;
      return true;
    case "shield":
      acc.shieldBonus += modValue;
      return true;
    case "armor":
      acc.armorBonus += modValue;
      return true;
    case "energy":
    case "energyMax":
      acc.energyBonus += modValue;
      return true;
    case "abilityStrength":
      acc.abilityStrength += modValue;
      return true;
    case "abilityDuration":
      acc.abilityDuration += modValue;
      return true;
    case "abilityEfficiency":
      acc.abilityEfficiency += modValue;
      return true;
    case "abilityRange":
      acc.abilityRange += modValue;
      return true;
    default:
      trackModPanel(stats, modId, statKey, modValue);
      return true;
  }
}

export function applyVerifiedModStatToArchwing(
  stats: { modBonuses?: Record<string, number> },
  modId: string,
  statKey: string,
  modValue: number,
  acc: ArchwingModAccumulators,
): boolean {
  if (modId === "kinetic_diversion" && statKey === "damage") {
    acc.kineticDiversionPercent += modValue * 100;
    return true;
  }

  const line = getVerifiedModStatLine(modId, statKey);
  if (!line) {
    trackModPanel(stats, modId, statKey, modValue);
    return false;
  }

  if (line.target === "mod_panel" || line.target === "pending") {
    trackModPanel(stats, modId, statKey, modValue);
    return true;
  }

  if (line.target !== "warframe_totals") {
    trackModPanel(stats, modId, statKey, modValue);
    return true;
  }

  switch (statKey) {
    case "health":
      acc.healthBonus += modValue;
      return true;
    case "shield":
      acc.shieldBonus += modValue;
      return true;
    case "armor":
      acc.armorBonus += modValue;
      return true;
    case "energy":
    case "energyMax":
      acc.energyBonus += modValue;
      return true;
    case "abilityStrength":
      acc.abilityStrength += modValue;
      return true;
    case "abilityDuration":
      acc.abilityDuration += modValue;
      return true;
    case "abilityEfficiency":
      acc.abilityEfficiency += modValue;
      return true;
    case "abilityRange":
      acc.abilityRange += modValue;
      return true;
    case "flightSpeed":
      acc.flightSpeedBonus += modValue;
      return true;
    default:
      trackModPanel(stats, modId, statKey, modValue);
      return true;
  }
}

export type RailjackModAccumulators = {
  hullBonus: number;
  armorBonus: number;
  shieldBonus: number;
  shieldRechargeBonus: number;
  speedBonus: number;
  boostSpeedBonus: number;
  boostCostReduction: number;
  fluxBonus: number;
  avionicsBonus: number;
  turretDamageBonus: number;
  turretCritBonus: number;
  turretCritDmgBonus: number;
  ordnanceDamageBonus: number;
  artilleryDamageBonus: number;
  turretRangeBonus: number;
  turretProjectileSpeedBonus: number;
  ordnanceSpeedBonus: number;
  munitionsCapacityBonus: number;
};

function emptyRailjackAccumulators(): RailjackModAccumulators {
  return {
    hullBonus: 0,
    armorBonus: 0,
    shieldBonus: 0,
    shieldRechargeBonus: 0,
    speedBonus: 0,
    boostSpeedBonus: 0,
    boostCostReduction: 0,
    fluxBonus: 0,
    avionicsBonus: 0,
    turretDamageBonus: 0,
    turretCritBonus: 0,
    turretCritDmgBonus: 0,
    ordnanceDamageBonus: 0,
    artilleryDamageBonus: 0,
    turretRangeBonus: 0,
    turretProjectileSpeedBonus: 0,
    ordnanceSpeedBonus: 0,
    munitionsCapacityBonus: 0,
  };
}

export function applyVerifiedModStatToRailjack(
  stats: { modBonuses?: Record<string, number> },
  modId: string,
  statKey: string,
  modValue: number,
  acc: RailjackModAccumulators,
): boolean {
  const line = getVerifiedModStatLine(modId, statKey);
  if (!line) {
    trackModPanel(stats, modId, statKey, modValue);
    return false;
  }

  if (line.target === "mod_panel" || line.target === "pending") {
    trackModPanel(stats, modId, statKey, modValue);
    return true;
  }

  if (line.target !== "railjack_totals") {
    trackModPanel(stats, modId, statKey, modValue);
    return true;
  }

  switch (statKey) {
    case "hull":
    case "health":
      acc.hullBonus += modValue;
      return true;
    case "armor":
      acc.hullBonus += modValue;
      acc.armorBonus += modValue;
      return true;
    case "shield":
      acc.shieldBonus += modValue;
      acc.shieldRechargeBonus += modValue;
      return true;
    case "engineSpeed":
    case "speed":
      acc.speedBonus += modValue;
      return true;
    case "boostSpeed":
      acc.boostSpeedBonus += modValue;
      return true;
    case "boostCostReduction":
      acc.boostCostReduction += modValue;
      return true;
    case "fluxCapacity":
    case "flux":
      acc.fluxBonus += modValue;
      return true;
    case "avionicsCapacity":
    case "avionics":
      acc.avionicsBonus += modValue;
      return true;
    case "turretDamage":
    case "damage":
      acc.turretDamageBonus += modValue;
      return true;
    case "turretCritChance":
    case "criticalChance":
      acc.turretCritBonus += modValue;
      return true;
    case "turretCritDamage":
    case "criticalMultiplier":
      acc.turretCritDmgBonus += modValue;
      return true;
    case "ordnanceDamage":
      acc.ordnanceDamageBonus += modValue;
      return true;
    case "artilleryDamage":
      acc.artilleryDamageBonus += modValue;
      return true;
    case "turretRange":
    case "range":
      acc.turretRangeBonus += modValue;
      return true;
    case "turretProjectileSpeed":
      acc.ordnanceSpeedBonus += modValue;
      acc.turretProjectileSpeedBonus += modValue;
      return true;
    case "ordnanceSpeed":
      acc.ordnanceSpeedBonus += modValue;
      return true;
    case "magazine":
    case "munitions":
      acc.munitionsCapacityBonus += modValue;
      return true;
    default:
      trackModPanel(stats, modId, statKey, modValue);
      return true;
  }
}

export function modHasVerifiedBehavior(modId: string): boolean {
  return modId in VERIFIED_MOD_BEHAVIORS;
}

export function listUnverifiedModIds(equippedModIds: string[]): string[] {
  return equippedModIds.filter((id) => !modHasVerifiedBehavior(id));
}

export function getModStatVerificationLabel(modId: string, statKey: string): ItemApplyTarget {
  return getVerifiedModStatLine(modId, statKey)?.target ?? "pending";
}
