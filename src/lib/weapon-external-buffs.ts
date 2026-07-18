import { getVerifiedFieldScaling } from "@/lib/ability-scaling-registry";
import { getModStatDisplayLines } from "@/lib/display/mod-display";
import {
  applyVerifiedModStatToWeapon,
  getVerifiedModStatLine,
  type WeaponModAccumulators,
} from "@/lib/mod-behavior-registry";
import { weaponSupportsPrimaryStyleSets } from "@/lib/calc/set-bonuses";
import type {
  Ability,
  Mod,
  ModSlot,
  SimulationParams,
  WarframeCalculatedStats,
  Weapon,
  WeaponExternalBuff,
  WeaponExternalBuffElemental,
} from "@/lib/types";

export interface WeaponBuffContext {
  warframeId?: string;
  warframeStats?: WarframeCalculatedStats;
  warframeAbilities?: Ability[];
  /** Warframe mod bar — stance augments (Voltaic Strike) and ability augments with weapon effects. */
  warframeModSlots?: ModSlot[];
  /** Companion body mods — bond mods that buff the operator's weapons. */
  companionModSlots?: ModSlot[];
  /** Companion weapon crit chance (for Tenacious Bond gate). */
  companionWeaponCritChance?: number;
  allMods?: Map<string, Mod>;
}

function isPrimaryWeapon(weapon: Weapon): boolean {
  return weaponSupportsPrimaryStyleSets(weapon);
}

function isSecondaryWeapon(weapon: Weapon): boolean {
  return ["pistol", "secondary", "dual_pistols"].includes(weapon.category);
}

function isMeleeWeapon(weapon: Weapon): boolean {
  return weapon.category === "melee" || weapon.triggerType === "Melee";
}

function emptyWeaponAcc(): WeaponModAccumulators {
  return {
    damageBonus: 0,
    critChanceBonus: 0,
    critMultBonus: 0,
    fireRateBonus: 0,
    multishotBonus: 0,
    statusBonus: 0,
    magBonus: 0,
    reloadBonus: 0,
    impactBonus: 0,
    punctureBonus: 0,
    slashBonus: 0,
    statusDamageBonus: 0,
    headshotDamageBonus: 0,
    statusDurationBonus: 0,
    factionBonuses: {},
    hasBloodRush: false,
    bloodRushValue: 0,
    hasConditionOverload: false,
    conditionOverloadPerStatus: 0,
    hasWeepingWounds: false,
    weepingWoundsValue: 0,
    hasBerserkerFury: false,
    berserkerFuryPerStack: 0,
    galvMultishotOnKillPerStack: 0,
    galvDamagePerStatusPerStack: 0,
    galvMultishotStackCap: 5,
    galvDamagePerStatusStackCap: 5,
    galvCritOnHeadshotBase: 0,
    galvCritOnHeadshotPerStack: 0,
    onKillStatBonuses: {},
    triggerStatBonuses: {},
    slashOnCritChance: 0,
    slashOnImpactProcChance: 0,
    firstShotDamageBonus: 0,
  };
}

function modAppliesFromWarframeToWeapon(mod: Mod, weapon: Weapon): boolean {
  if (mod.category === "melee") return isMeleeWeapon(weapon);
  if (mod.category === "augment") return true;
  return false;
}

function modNominalLine(mod: Mod, rank: number): string {
  return getModStatDisplayLines(mod, rank)
    .map((l) => l.atRank)
    .join(", ");
}

function accToExternalBuff(
  acc: WeaponModAccumulators,
  elementalFractions: WeaponExternalBuffElemental[],
  base: Omit<WeaponExternalBuff, "damageBonus" | "critChanceBonus" | "critMultBonus" | "statusBonus" | "fireRateBonus" | "multishotBonus" | "elemental">,
): WeaponExternalBuff | null {
  const hasScalar =
    acc.damageBonus !== 0 ||
    acc.critChanceBonus !== 0 ||
    acc.critMultBonus !== 0 ||
    acc.statusBonus !== 0 ||
    acc.fireRateBonus !== 0 ||
    acc.multishotBonus !== 0 ||
    elementalFractions.length > 0;
  if (!hasScalar) return null;

  return {
    ...base,
    ...(acc.damageBonus ? { damageBonus: acc.damageBonus } : {}),
    ...(acc.critChanceBonus ? { critChanceBonus: acc.critChanceBonus } : {}),
    ...(acc.critMultBonus ? { critMultBonus: acc.critMultBonus } : {}),
    ...(acc.statusBonus ? { statusBonus: acc.statusBonus } : {}),
    ...(acc.fireRateBonus ? { fireRateBonus: acc.fireRateBonus } : {}),
    ...(acc.multishotBonus ? { multishotBonus: acc.multishotBonus } : {}),
    ...(elementalFractions.length ? { elemental: elementalFractions } : {}),
  };
}

function extractWeaponDpsBuffFromMod(
  weapon: Weapon,
  modSlot: ModSlot,
  allMods: Map<string, Mod>,
  idPrefix: string,
  category: WeaponExternalBuff["category"],
): WeaponExternalBuff | null {
  const mod = allMods.get(modSlot.modId);
  if (!mod?.stats) return null;
  if (!modAppliesFromWarframeToWeapon(mod, weapon)) return null;

  const rank = Math.min(Math.max(modSlot.rank ?? 0, 0), mod.maxRank);
  const multiplier = rank + 1;
  const acc = emptyWeaponAcc();
  const elementalMods: { type: string; value: number }[] = [];
  let hasWeaponDps = false;

  for (const [statName, value] of Object.entries(mod.stats)) {
    const line = getVerifiedModStatLine(mod.id, statName);
    if (!line || line.target !== "weapon_dps") continue;
    hasWeaponDps = true;
    const modValue = (value * multiplier) / 100;
    applyVerifiedModStatToWeapon(
      {},
      {
        modId: mod.id,
        statKey: statName,
        modValue,
        baseWeaponDamage: weapon.damage,
        acc,
        elementalMods,
        comboDuration: { add: () => {} },
        heavyAttackEfficiency: { add: () => {} },
      },
    );
  }

  if (!hasWeaponDps) return null;

  const elementalFractions: WeaponExternalBuffElemental[] = elementalMods.map((e) => ({
    type: e.type,
    bonusFraction: e.value / weapon.damage,
  }));

  return accToExternalBuff(acc, elementalFractions, {
    id: `${idPrefix}:${mod.id}`,
    label: mod.name,
    category,
    nominal: modNominalLine(mod, rank),
  });
}

function resolveWarframeCrossModBuffs(
  weapon: Weapon,
  ctx: WeaponBuffContext,
): WeaponExternalBuff[] {
  const slots = ctx.warframeModSlots;
  const allMods = ctx.allMods;
  if (!slots?.length || !allMods) return [];

  const buffs: WeaponExternalBuff[] = [];
  for (const slot of slots) {
    const buff = extractWeaponDpsBuffFromMod(weapon, slot, allMods, "wf-mod", "warframe_mod");
    if (buff) buffs.push(buff);
  }
  return buffs;
}

function modStatFraction(mod: Mod, statKey: string, rank: number): number {
  const perRank = mod.stats[statKey];
  if (perRank == null) return 0;
  return (perRank * (rank + 1)) / 100;
}

function findCompanionMod(slots: ModSlot[] | undefined, modId: string): ModSlot | undefined {
  return slots?.find((s) => s.modId === modId);
}

function resolveCompanionBondBuffs(
  weapon: Weapon,
  ctx: WeaponBuffContext,
  simParams: SimulationParams,
): WeaponExternalBuff[] {
  const slots = ctx.companionModSlots;
  const allMods = ctx.allMods;
  if (!slots?.length || !allMods) return [];

  const buffs: WeaponExternalBuff[] = [];
  const tenaciousActive = simParams.applyTenaciousBondCrit !== false;
  const reinforcedActive = simParams.applyReinforcedBondFireRate !== false;

  const tenaciousSlot = findCompanionMod(slots, "tenacious_bond");
  if (tenaciousSlot && tenaciousActive) {
    const companionCrit = ctx.companionWeaponCritChance ?? 0;
    if (companionCrit > 0.5) {
      buffs.push({
        id: "companion:tenacious_bond",
        label: "Tenacious Bond",
        category: "companion",
        critMultFlatBonus: 1.2,
        nominal: "+1.2× crit damage (companion crit >50%)",
      });
    }
  }

  const reinforcedSlot = findCompanionMod(slots, "reinforced_bond");
  if (reinforcedSlot && reinforcedActive && !isMeleeWeapon(weapon)) {
    buffs.push({
      id: "companion:reinforced_bond",
      label: "Reinforced Bond",
      category: "companion",
      fireRateBonus: 0.6,
      nominal: "+60% fire rate (companion shields)",
    });
  }

  const covertSlot = findCompanionMod(slots, "covert_bond");
  if (covertSlot) {
    const mod = allMods.get("covert_bond");
    if (mod) {
      const rank = Math.min(Math.max(covertSlot.rank ?? 0, 0), mod.maxRank);
      const dmg = modStatFraction(mod, "stealthDamage", rank);
      if (dmg > 0) {
        buffs.push({
          id: "companion:covert_bond",
          label: "Covert Bond",
          category: "companion",
          damageBonus: dmg,
          nominal: modNominalLine(mod, rank),
        });
      }
    }
  }

  return buffs;
}

function scaledAbilityDamageBuff(
  warframeId: string,
  abilityName: string,
  baseBuff: number,
  abilityStrength: number,
): number {
  const rule =
    getVerifiedFieldScaling(warframeId, abilityName, "damageBuff") ??
    getVerifiedFieldScaling("rhino", abilityName, "damageBuff");
  const mult = !rule || rule.scale === "strength" ? abilityStrength : 1;
  let value = baseBuff * mult;
  if (rule?.cap != null) value = Math.min(value, rule.cap);
  return value;
}

function resolveAbilityBuffs(
  ctx: WeaponBuffContext,
  simParams: SimulationParams,
): WeaponExternalBuff[] {
  const active = simParams.activeWeaponAbilityBuffs ?? [];
  if (active.length === 0 || !ctx.warframeId || !ctx.warframeStats || !ctx.warframeAbilities) return [];

  const strength = ctx.warframeStats.abilityStrength;
  const buffs: WeaponExternalBuff[] = [];

  for (const ability of ctx.warframeAbilities) {
    if (ability.damageBuff == null || ability.damageBuff <= 0) continue;
    if (!active.includes(ability.name)) continue;

    const bonus = scaledAbilityDamageBuff(ctx.warframeId, ability.name, ability.damageBuff, strength);
    if (bonus <= 0) continue;

    // Roar / Eclipse / etc. multiply after Serration (wiki Calculating Bonuses).
    buffs.push({
      id: `ability:${ability.name}`,
      label: ability.name,
      category: "ability",
      damageMultBonus: bonus,
      nominal: `+${(ability.damageBuff * 100).toFixed(0)}% weapon damage`,
    });
  }

  return buffs;
}

function resolveShardBuffs(weapon: Weapon, ctx: WeaponBuffContext): WeaponExternalBuff[] {
  const stats = ctx.warframeStats;
  if (!stats) return [];

  const buffs: WeaponExternalBuff[] = [];

  if (isMeleeWeapon(weapon) && stats.meleeCritDamageBonus > 0) {
    buffs.push({
      id: "shard:melee-crit-damage",
      label: "Archon Shard (Melee Crit)",
      category: "shard",
      critMultBonus: stats.meleeCritDamageBonus / 100,
      nominal: `+${stats.meleeCritDamageBonus}% melee crit damage`,
    });
  }

  if (isPrimaryWeapon(weapon) && stats.primaryShardBonus > 0) {
    buffs.push({
      id: "shard:primary-status",
      label: "Archon Shard (Primary Status)",
      category: "shard",
      statusBonus: stats.primaryShardBonus / 100,
      nominal: `+${stats.primaryShardBonus}% primary status chance`,
    });
  }

  if (isSecondaryWeapon(weapon) && stats.secondaryShardBonus > 0) {
    buffs.push({
      id: "shard:secondary-crit",
      label: "Archon Shard (Secondary Crit)",
      category: "shard",
      critChanceBonus: stats.secondaryShardBonus / 100,
      nominal: `+${stats.secondaryShardBonus}% secondary crit chance`,
    });
  }

  return buffs;
}

export function resolveWeaponExternalBuffs(
  weapon: Weapon,
  ctx: WeaponBuffContext | undefined,
  simParams: SimulationParams,
): WeaponExternalBuff[] {
  if (!ctx) return [];
  return [
    ...resolveAbilityBuffs(ctx, simParams),
    ...resolveShardBuffs(weapon, ctx),
    ...resolveWarframeCrossModBuffs(weapon, ctx),
    ...resolveCompanionBondBuffs(weapon, ctx, simParams),
  ];
}

/** Abilities on a warframe that grant a top-level weapon damage buff. */
export function weaponDamageBuffAbilities(abilities: Ability[] | undefined): Ability[] {
  if (!abilities) return [];
  return abilities.filter((a) => a.damageBuff != null && a.damageBuff > 0);
}

export function mergeWeaponCalcOptions(
  existing: { progenitorElement?: string; progenitorBonusPercent?: number } | undefined,
  externalBuffs: WeaponExternalBuff[],
): import("@/lib/types").WeaponCalculationOptions | undefined {
  const hasProgenitor =
    existing?.progenitorElement &&
    existing.progenitorBonusPercent != null &&
    existing.progenitorBonusPercent > 0;
  if (!hasProgenitor && externalBuffs.length === 0) return undefined;
  return {
    ...(hasProgenitor
      ? {
          progenitorElement: existing!.progenitorElement,
          progenitorBonusPercent: existing!.progenitorBonusPercent,
        }
      : {}),
    ...(externalBuffs.length > 0 ? { externalBuffs } : {}),
  };
}
