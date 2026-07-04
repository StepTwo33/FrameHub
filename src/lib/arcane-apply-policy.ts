import { ArcaneEffectLine, ArcaneTrigger } from "@/data/arcane-effects";

/**
 * Which effects may modify core build totals vs display-only arcaneBonuses.
 * Conditional/proc/on-pickup stats must NOT blanket-inflate DPS, EHP, or max pool stats.
 */

/** Never folded into burst/sustained DPS or primary stat rows — tracked for arcane panel only. */
export const WEAPON_BONUS_ONLY_STATS = new Set([
  "utilityEffect",
  "holsterDamage",
  "holsterSpeed",
  "headshotDamage",
  "finisherDamage",
  "bonusDamageOnStatus",
  "procDamageMultiplier",
  "damagePerEnergy",
  "damagePerArmorOver",
  "damagePerArmorThreshold",
  "damageTakenBonus",
  "secondaryHeatDamage",
  "secondaryStatusProc",
  "reloadDamageRamp",
  "overguardDamage",
  "voidSprintDamage",
  "voidBlastDamage",
  "enemyResistanceReduction",
  "vulnerability",
  "lifeSteal",
  "kitgunTether",
  "kitgunRecharge",
  "kitgunHoming",
  "kitgunProjectileSpeed",
  "toxinPoolDuration",
  "gasCloudDuration",
  "electricZoneDuration",
  "coldStacksApplied",
  "critPerPunctureTen",
  "duplicateAttackChance",
  "statusStackBonus",
  "companionDamageRamp",
  "invisibilityDuration",
  "invisibilityChance",
  "tauronChargeRate",
  "fireRateOnCrit",
  "fireRateOnHeadshot",
  "attackSpeedOnKill",
  "ampHeatDamage",
  "ampRange",
]);

/** Passive weapon arcanes may modify these core stats. */
export const WEAPON_PASSIVE_BUILD_STATS = new Set([
  "criticalChance",
  "criticalMultiplier",
  "fireRate",
  "damage",
  "multishot",
  "statusChance",
  "reloadSpeed",
  "reloadSpeedBonus",
  "attackSpeed",
  "attackSpeedBonus",
  "meleeHeavyCrit",
  "meleeHeavyDamage",
  "meleeComboGain",
  "meleeComboInitial",
  "ammoEfficiency",
  "ampDamage",
  "ampFireRate",
  "ampReload",
  "ampCritChance",
  "ampCritDamage",
  "ampStatusChance",
  "ampMultishot",
  "elementalProcChance",
]);

/** Never folded into warframe totals — tracked for arcane panel only. */
export const WARFRAME_BONUS_ONLY_STATS = new Set([
  "utilityEffect",
  "healthRegenChance",
  "armorBonusChance",
  "shieldRegenChance",
  "shieldRegenAmount",
  "meleeDamageChance",
  "attackSpeedChance",
  "critChanceOnDamaged",
  "fireRateOnCrit",
  "sprintSpeedChance",
  "reloadSpeedChance",
  "nullifyChance",
  "shieldRestoreChance",
  "energyOrbBonus",
  "allyEnergy",
  "healthFromOrbs",
  "energyOrbPulse",
  "damageOnEnergyPickup",
  "damageOnRevive",
  "wallLatchDamage",
  "dodgeSpeed",
  "universalOrbChance",
  "invisibilityDuration",
  "invisibilityChance",
  "finisherDamage",
  "armorSteal",
  "companionHeal",
  "healPerEnergySpent",
  "operatorToWarframeHeal",
  "operatorHealthRegen",
  "operatorHealth",
  "operatorArmor",
  "operatorEnergyToWarframe",
  "voidConversion",
  "voidPullRadius",
  "voidSprintSpeed",
  "voidModeSpeed",
  "voidTrapDuration",
  "transferenceStaticNegate",
  "enemyResistanceReduction",
  "reflectDamage",
  "attackSpeedBonus",
  "meleeDamageBonus",
]);

/** Passive warframe arcanes may modify these core stats. */
export const WARFRAME_PASSIVE_BUILD_STATS = new Set([
  "armor",
  "armorBonusAmount",
  "flatArmorBonus",
  "abilityStrength",
  "abilityDuration",
  "abilityEfficiency",
  "abilityRange",
  "flowEnergyMax",
  "health",
  "healthFlat",
  "shield",
  "energy",
  "sprintSpeedBonus",
  "sprintSpeed",
  "parkourVelocity",
  "healthRegen",
  "healthRegenAmount",
  "healthRegenPerSec",
  "headshotHealthRegen",
  "energyRegen",
  "damageReduction",
  "voidModeDamageReduction",
  "statusResistance",
  "coldResistance",
  "healthOrbEffectiveness",
  "energyPerArmor",
  "abilityStrengthPerHealth",
  "abilityStrengthPerHealthStep",
  "abilityStrengthToShield",
  "persistenceDamageCapPerSecond",
  "removeShields",
]);

/** Arcane ids with custom apply logic — generic stat mapper is skipped. */
export const ARCANE_CUSTOM_HANDLERS = new Set([
  "arcane_persistence",
  "arcane_expertise",
  "arcane_bellicose",
  "arcane_battery",
  "arcane_energize",
  "arcane_primary_merciless",
  "arcane_secondary_merciless",
  "primary_overcharge",
  "melee_exposure",
  "cascadia_flare",
  "exodia_brave",
  "secondary_surge",
  "zid_an_uskos",
]);

export function shouldApplyEffectToBuild(
  trigger: ArcaneTrigger,
  stat: string,
  target: "weapon" | "warframe",
  arcaneId: string,
): boolean {
  if (ARCANE_CUSTOM_HANDLERS.has(arcaneId)) return false;

  const bonusOnly =
    target === "weapon" ? WEAPON_BONUS_ONLY_STATS : WARFRAME_BONUS_ONLY_STATS;
  if (bonusOnly.has(stat)) return false;

  if (trigger === "passive") {
    const buildStats =
      target === "weapon" ? WEAPON_PASSIVE_BUILD_STATS : WARFRAME_PASSIVE_BUILD_STATS;
    return buildStats.has(stat);
  }

  // Stacking arcanes: apply to build when sim stacks are active (weapon) or at cap (warframe).
  if (trigger === "stacks") {
    return !bonusOnly.has(stat);
  }

  // onKill, onDamaged, onPickup, conditional, etc. — never blanket-apply to core totals.
  return false;
}

export function isProcOrConditionalStat(stat: string, line: ArcaneEffectLine): boolean {
  return stat.endsWith("Chance") && !line.flat;
}
