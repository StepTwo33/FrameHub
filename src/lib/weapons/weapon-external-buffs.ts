import { allHelminthAbilities } from "@/data/helminth";
import {
  getVerifiedFieldScaling,
  getVerifiedMiscScaling,
} from "@/lib/codex/ability-scaling-registry";
import { getModStatDisplayLines } from "@/lib/display/mod-display";
import {
  applyVerifiedModStatToWeapon,
  getVerifiedModStatLine,
  type WeaponModAccumulators,
} from "@/lib/mods/mod-behavior-registry";
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

/** Wiki-verified base weapon-buff fractions (rank max). Helminth overrides when host ≠ source. */
const NOURISH_VIRAL_NATIVE = 0.75;
const NOURISH_VIRAL_HELMINTH = 0.45;
const XATA_VOID_NATIVE = 0.26;
/** Wiki Vex Armor rank-3 max Fury (assumes full stacks in sim). */
const VEX_ARMOR_MAX_FURY = 2.75;

function warframeFamilyId(warframeId: string | undefined): string {
  return (warframeId ?? "").replace(/_prime$/, "");
}

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
): number | null {
  // Only verified weapon damage buffs (Roar/Eclipse/…) apply to loadout DPS.
  // Host frame → Helminth subsume key → Rhino (Roar) fallback.
  const rule =
    getVerifiedFieldScaling(warframeId, abilityName, "damageBuff") ??
    getVerifiedFieldScaling("helminth", abilityName, "damageBuff") ??
    getVerifiedFieldScaling("rhino", abilityName, "damageBuff");
  if (!rule) return null;
  const mult = rule.scale === "strength" ? abilityStrength : 1;
  let value = baseBuff * mult;
  if (rule.cap != null) value = Math.min(value, rule.cap);
  return value;
}

/** Wiki Electric Shield: +50% Electricity (additive elemental) and +100% CD (multiplicative). Fixed — no STR. */
function resolveElectricShieldBuff(
  weapon: Weapon,
  ability: Ability,
): WeaponExternalBuff | null {
  if (isMeleeWeapon(weapon)) return null;
  const ele = ability.miscStats?.electricDamageBonus;
  const crit = ability.miscStats?.critDamageBonus;
  const eleFrac = typeof ele === "number" ? ele : 0;
  const critFrac = typeof crit === "number" ? crit : 0;
  if (eleFrac <= 0 && critFrac <= 0) return null;
  return {
    id: `ability:${ability.name}`,
    label: ability.name,
    category: "ability",
    ...(eleFrac > 0
      ? { elemental: [{ type: "electricity", bonusFraction: eleFrac }] }
      : {}),
    ...(critFrac > 0 ? { critMultBonus: critFrac } : {}),
    nominal: `+${(eleFrac * 100).toFixed(0)}% Electricity, +${(critFrac * 100).toFixed(0)}% critical damage`,
  };
}

/** Wiki Nourish: +Viral as an elemental mod; Helminth base is reduced. */
function resolveNourishBuff(
  warframeId: string,
  ability: Ability,
  strength: number,
): WeaponExternalBuff | null {
  const misc = ability.miscStats?.viralDamageBonus;
  const base =
    typeof misc === "number"
      ? misc
      : warframeFamilyId(warframeId) === "grendel"
        ? NOURISH_VIRAL_NATIVE
        : NOURISH_VIRAL_HELMINTH;
  const bonus = base * strength;
  if (bonus <= 0) return null;
  return {
    id: `ability:${ability.name}`,
    label: ability.name,
    category: "ability",
    elemental: [{ type: "viral", bonusFraction: bonus }],
    nominal: `+${(base * 100).toFixed(0)}% Viral (× Strength)`,
  };
}

const CONTAGION_CLOUD_MOD_ID = "augment_saryn_contagion_cloud";

function hasContagionCloudAugment(ctx: WeaponBuffContext): boolean {
  return (ctx.warframeModSlots ?? []).some((s) => s.modId === CONTAGION_CLOUD_MOD_ID);
}

/**
 * Wiki Contagion Cloud: on-kill toxin cloud = ability misc DPS × STR
 * (× melee mult); sim gates enemy count. Not weapon-modded.
 */
function resolveContagionCloudBuff(
  weapon: Weapon,
  warframeId: string,
  ability: Ability,
  strength: number,
  ctx: WeaponBuffContext,
  simParams: SimulationParams,
): WeaponExternalBuff | null {
  const enemies = Math.max(0, Math.floor(simParams.contagionCloudEnemies ?? 0));
  if (enemies <= 0 || !hasContagionCloudAugment(ctx)) return null;
  const misc = ability.miscStats ?? {};
  const baseDps = typeof misc.contagionCloudDps === "number" ? misc.contagionCloudDps : 300;
  const meleeMult =
    typeof misc.contagionCloudMeleeMult === "number" ? misc.contagionCloudMeleeMult : 2;
  const rule = getVerifiedMiscScaling(warframeId, ability.name, "contagionCloudDps");
  const scaled = baseDps * (rule?.scale === "strength" ? strength : 1);
  const dps = scaled * (isMeleeWeapon(weapon) ? meleeMult : 1) * enemies;
  if (dps <= 0) return null;
  return {
    id: "ability:Contagion Cloud",
    label: "Contagion Cloud",
    category: "ability",
    abilityCloudDps: dps,
    nominal: `${baseDps}/s cloud × Strength × ${enemies} enem${enemies === 1 ? "y" : "ies"}`,
  };
}

/** Wiki Toxic Lash: Extra Hit % of weapon damage; melee is doubled; scales STR (cap 100%). */
function resolveToxicLashBuff(
  weapon: Weapon,
  warframeId: string,
  ability: Ability,
  strength: number,
  ctx: WeaponBuffContext,
  simParams: SimulationParams,
): WeaponExternalBuff[] {
  const gun = ability.miscStats?.gunDamage;
  const melee = ability.miscStats?.meleeDamage;
  const base = isMeleeWeapon(weapon)
    ? typeof melee === "number"
      ? melee
      : 0.6
    : typeof gun === "number"
      ? gun
      : 0.3;
  const key = isMeleeWeapon(weapon) ? "meleeDamage" : "gunDamage";
  const rule = getVerifiedMiscScaling(warframeId, ability.name, key);
  // Wiki: percentages scale with Strength and soft-cap at 100%.
  const frac = Math.min(base * strength, rule?.cap ?? 1);
  const out: WeaponExternalBuff[] = [];
  if (frac > 0) {
    out.push({
      id: `ability:${ability.name}`,
      label: ability.name,
      category: "ability",
      extraHitDamageFraction: frac,
      extraHitGuaranteedToxin: true,
      nominal: `+${(base * 100).toFixed(0)}% Toxin Extra Hit (× Strength)`,
    });
  }
  const cloud = resolveContagionCloudBuff(weapon, warframeId, ability, strength, ctx, simParams);
  if (cloud) out.push(cloud);
  return out;
}

/** Wiki Xata's Whisper: Extra Hit Void %; scales STR. */
function resolveXataBuff(
  ability: Ability,
  strength: number,
): WeaponExternalBuff | null {
  const misc = ability.miscStats?.voidDamageBonus;
  const base =
    typeof misc === "number"
      ? misc
      : typeof ability.damageBuff === "number" && ability.damageBuff > 0
        ? ability.damageBuff
        : XATA_VOID_NATIVE;
  const frac = base * strength;
  if (frac <= 0) return null;
  return {
    id: `ability:${ability.name}`,
    label: ability.name,
    category: "ability",
    extraHitDamageFraction: frac,
    nominal: `+${(base * 100).toFixed(0)}% Void Extra Hit (× Strength)`,
  };
}

/** Wiki Vex Armor: max Fury is additive Serration-style; sim can scale stack fill. */
function resolveVexArmorBuff(
  strength: number,
  furyFraction: number,
): WeaponExternalBuff | null {
  const fill = Math.min(1, Math.max(0, furyFraction));
  const bonus = VEX_ARMOR_MAX_FURY * strength * fill;
  if (bonus <= 0) return null;
  const pct = Math.round(fill * 100);
  return {
    id: "ability:Vex Armor",
    label: "Vex Armor",
    category: "ability",
    damageBonus: bonus,
    nominal:
      fill >= 1
        ? `+${(VEX_ARMOR_MAX_FURY * 100).toFixed(0)}% weapon damage at max Fury (× Strength)`
        : `+${(VEX_ARMOR_MAX_FURY * 100).toFixed(0)}% max Fury × ${pct}% stacks (× Strength)`,
  };
}

/** Wiki Shooting Gallery: additive with Serration-style mods (not Roar mult). */
function resolveShootingGalleryBuff(
  ability: Ability,
  strength: number,
): WeaponExternalBuff | null {
  const base = typeof ability.damageBuff === "number" ? ability.damageBuff : 0.25;
  const bonus = base * strength;
  if (bonus <= 0) return null;
  return {
    id: `ability:${ability.name}`,
    label: ability.name,
    category: "ability",
    damageBonus: bonus,
    nominal: `+${(base * 100).toFixed(0)}% weapon damage (additive, × Strength)`,
  };
}

function resolveNamedAbilityWeaponBuff(
  weapon: Weapon,
  ctx: WeaponBuffContext,
  ability: Ability,
  strength: number,
  simParams: SimulationParams,
): WeaponExternalBuff | null {
  const warframeId = ctx.warframeId!;
  switch (ability.name) {
    case "Electric Shield":
      return resolveElectricShieldBuff(weapon, ability);
    case "Nourish":
      return resolveNourishBuff(warframeId, ability, strength);
    case "Xata's Whisper":
      return resolveXataBuff(ability, strength);
    case "Vex Armor":
      return resolveVexArmorBuff(strength, simParams.vexArmorFuryFraction ?? 1);
    case "Shooting Gallery":
      return resolveShootingGalleryBuff(ability, strength);
    // wiki: Symphony of Mercy — Deathbringer song is additive with Serration (like SG)
    case "Symphony Of Mercy":
      return resolveShootingGalleryBuff(ability, strength);
    // wiki: Redline — full-battery fire/attack speed × Duration
    case "Redline":
      return resolveRedlineBuff(weapon, ability, ctx.warframeStats!.abilityDuration);
    // wiki: Cathode Grace — weapon CC additive with Point Strike-style mods × STR
    case "Cathode Grace":
      return resolveCathodeGraceBuff(ability, strength);
    // wiki: Wrathful Advance — flat final melee CC after mods × STR
    case "Wrathful Advance":
      return resolveWrathfulAdvanceBuff(weapon, ability, strength);
    // wiki: Grave Spirit — weapon CD additive with Organ Shatter-style mods × STR
    case "Grave Spirit":
      return resolveGraveSpiritBuff(ability, strength);
    // wiki: Penance — fire rate + reload × STR (FR also applies to melee)
    case "Penance":
      return resolvePenanceBuff(ability, strength);
    // wiki: Shroud of Dynar — flat melee CD × STR; flat CC/SC Misc-fixed (post-invis window)
    case "Shroud Of Dynar":
      return resolveShroudOfDynarBuff(weapon, ability, strength);
    default:
      return null;
  }
}

/** Wiki Shroud of Dynar: +2.0× flat melee CD × Strength; +100% flat CC/SC are Misc-fixed. */
function resolveShroudOfDynarBuff(
  weapon: Weapon,
  ability: Ability,
  strength: number,
): WeaponExternalBuff | null {
  if (!isMeleeWeapon(weapon)) return null;
  const misc = ability.miscStats ?? {};
  const cdBase = typeof misc.critDamageBonus === "number" ? misc.critDamageBonus : 2;
  const ccBase = typeof misc.criticalChanceBonus === "number" ? misc.criticalChanceBonus : 1;
  const scBase = typeof misc.statusChance === "number" ? misc.statusChance : 1;
  const cd = cdBase * strength;
  if (cd <= 0 && ccBase <= 0 && scBase <= 0) return null;
  return {
    id: "ability:Shroud Of Dynar",
    label: "Shroud Of Dynar",
    category: "ability",
    ...(cd > 0 ? { critMultFlatBonus: cd } : {}),
    ...(ccBase > 0 ? { critChanceFlatBonus: ccBase } : {}),
    ...(scBase > 0 ? { statusBonus: scBase } : {}),
    nominal: `+${cdBase.toFixed(1)}× flat melee CD (× Strength), +${(ccBase * 100).toFixed(0)}% flat CC/SC`,
  };
}

/** Wiki Penance: +35% fire rate / +70% reload × Strength. Fire rate also speeds melee. */
function resolvePenanceBuff(
  ability: Ability,
  strength: number,
): WeaponExternalBuff | null {
  const misc = ability.miscStats ?? {};
  const frBase = typeof misc.fireRateBuff === "number" ? misc.fireRateBuff : 0.35;
  const reloadBase = typeof misc.reloadBuff === "number" ? misc.reloadBuff : 0.7;
  const fr = frBase * strength;
  const reload = reloadBase * strength;
  if (fr <= 0 && reload <= 0) return null;
  return {
    id: "ability:Penance",
    label: "Penance",
    category: "ability",
    ...(fr > 0 ? { fireRateBonus: fr } : {}),
    ...(reload > 0 ? { reloadBonus: reload } : {}),
    nominal: `+${(frBase * 100).toFixed(0)}% fire rate / +${(reloadBase * 100).toFixed(0)}% reload (× Strength)`,
  };
}

/** Wiki Grave Spirit: +50% weapon CD (additive with Organ Shatter) × Strength; Doom foes use doubled base. */
function resolveGraveSpiritBuff(
  ability: Ability,
  strength: number,
): WeaponExternalBuff | null {
  const misc = ability.miscStats?.critDamageBonus;
  const base = typeof misc === "number" ? misc : 0.5;
  const bonus = base * strength;
  if (bonus <= 0) return null;
  return {
    id: "ability:Grave Spirit",
    label: "Grave Spirit",
    category: "ability",
    critMultBonus: bonus,
    nominal: `+${(base * 100).toFixed(0)}% crit damage (additive, × Strength)`,
  };
}

/** Wiki Wrathful Advance: +200% final melee CC (flat after mods) × Strength; helminth base +100%. */
function resolveWrathfulAdvanceBuff(
  weapon: Weapon,
  ability: Ability,
  strength: number,
): WeaponExternalBuff | null {
  if (!isMeleeWeapon(weapon)) return null;
  const misc = ability.miscStats?.criticalChanceBonus;
  const base = typeof misc === "number" ? misc : 2;
  const bonus = base * strength;
  if (bonus <= 0) return null;
  return {
    id: "ability:Wrathful Advance",
    label: "Wrathful Advance",
    category: "ability",
    critChanceFlatBonus: bonus,
    nominal: `+${(base * 100).toFixed(0)}% final melee crit chance (flat, × Strength)`,
  };
}

/** Wiki Cathode Grace: +50% weapon CC (additive with Point Strike) × Strength. */
function resolveCathodeGraceBuff(
  ability: Ability,
  strength: number,
): WeaponExternalBuff | null {
  const misc = ability.miscStats?.criticalChanceBonus;
  const base = typeof misc === "number" ? misc : 0.5;
  const bonus = base * strength;
  if (bonus <= 0) return null;
  return {
    id: "ability:Cathode Grace",
    label: "Cathode Grace",
    category: "ability",
    critChanceBonus: bonus,
    nominal: `+${(base * 100).toFixed(0)}% crit chance (additive, × Strength)`,
  };
}

/** Wiki Redline: max-battery Fire Rate / Attack Speed × Ability Duration. */
function resolveRedlineBuff(
  weapon: Weapon,
  ability: Ability,
  abilityDuration: number,
): WeaponExternalBuff | null {
  const misc = ability.miscStats ?? {};
  if (isMeleeWeapon(weapon)) {
    const base = typeof misc.attackSpeedBuff === "number" ? misc.attackSpeedBuff : 0;
    if (base <= 0) return null;
    const bonus = base * abilityDuration;
    return {
      id: "ability:Redline",
      label: "Redline",
      category: "ability",
      fireRateBonus: bonus,
      nominal: `+${(base * 100).toFixed(0)}% attack speed (full battery)`,
    };
  }
  const base = typeof misc.fireRateBuff === "number" ? misc.fireRateBuff : 0;
  if (base <= 0) return null;
  const bonus = base * abilityDuration;
  return {
    id: "ability:Redline",
    label: "Redline",
    category: "ability",
    fireRateBonus: bonus,
    nominal: `+${(base * 100).toFixed(0)}% fire rate (full battery)`,
  };
}

function resolveAbilityBuffs(
  weapon: Weapon,
  ctx: WeaponBuffContext,
  simParams: SimulationParams,
): WeaponExternalBuff[] {
  const active = simParams.activeWeaponAbilityBuffs ?? [];
  if (active.length === 0 || !ctx.warframeId || !ctx.warframeStats || !ctx.warframeAbilities) return [];

  const strength = ctx.warframeStats.abilityStrength;
  const buffs: WeaponExternalBuff[] = [];

  for (const ability of ctx.warframeAbilities) {
    if (!active.includes(ability.name)) continue;

    if (ability.name === "Toxic Lash") {
      buffs.push(
        ...resolveToxicLashBuff(weapon, ctx.warframeId!, ability, strength, ctx, simParams),
      );
      continue;
    }

    const named = resolveNamedAbilityWeaponBuff(weapon, ctx, ability, strength, simParams);
    if (named) {
      buffs.push(named);
      continue;
    }

    if (ability.damageBuff == null || ability.damageBuff <= 0) continue;

    const bonus = scaledAbilityDamageBuff(ctx.warframeId, ability.name, ability.damageBuff, strength);
    if (bonus == null || bonus <= 0) continue;

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
    ...resolveAbilityBuffs(weapon, ctx, simParams),
    ...resolveShardBuffs(weapon, ctx),
    ...resolveWarframeCrossModBuffs(weapon, ctx),
    ...resolveCompanionBondBuffs(weapon, ctx, simParams),
  ];
}

const NAMED_WEAPON_BUFF_ABILITIES = new Set([
  "Electric Shield",
  "Nourish",
  "Toxic Lash",
  "Xata's Whisper",
  "Vex Armor",
  "Shooting Gallery",
  "Symphony Of Mercy",
  "Redline",
  "Cathode Grace",
  "Wrathful Advance",
  "Grave Spirit",
  "Penance",
  "Shroud Of Dynar",
]);

/** Helminth Empower is +Ability Strength, not a weapon damage buff. */
const NON_WEAPON_DAMAGE_BUFF_ABILITIES = new Set(["Empower"]);

/** Replace one ability slot with a Helminth inject for loadout buff resolution. */
export function resolveAbilitiesWithHelminth(
  abilities: Ability[] | undefined,
  helminthAbilityId?: string | null,
  helminthSlot?: number | null,
): Ability[] {
  if (!abilities?.length) return [];
  const rows = abilities.map((a) => ({ ...a }));
  if (
    helminthAbilityId == null ||
    helminthSlot == null ||
    helminthSlot < 0 ||
    helminthSlot >= rows.length
  ) {
    return rows;
  }
  const h = allHelminthAbilities.find((x) => x.id === helminthAbilityId);
  if (!h) return rows;
  rows[helminthSlot] = {
    name: h.name,
    energyCost: h.energyCost,
    description: h.description,
    damage: h.damage,
    damageBuff: h.damageBuff,
    damageReduction: h.damageReduction,
    duration: h.duration,
    range: h.range,
    radius: h.radius,
    castTime: h.castTime,
    miscStats: h.miscStats,
  };
  return rows;
}

/** Abilities that can be toggled as loadout weapon buffs. */
export function weaponDamageBuffAbilities(abilities: Ability[] | undefined): Ability[] {
  if (!abilities) return [];
  return abilities.filter((a) => {
    if (NON_WEAPON_DAMAGE_BUFF_ABILITIES.has(a.name)) return false;
    if (NAMED_WEAPON_BUFF_ABILITIES.has(a.name)) return true;
    // Roar / Eclipse / etc. use verified top-level damageBuff.
    return a.damageBuff != null && a.damageBuff > 0 && a.name !== "Xata's Whisper";
  });
}

export function mergeWeaponCalcOptions(
  existing:
    | {
        progenitorElement?: string;
        progenitorBonusPercent?: number;
        incarnonFormActive?: boolean;
      }
    | undefined,
  externalBuffs: WeaponExternalBuff[],
): import("@/lib/types").WeaponCalculationOptions | undefined {
  const hasProgenitor =
    existing?.progenitorElement &&
    existing.progenitorBonusPercent != null &&
    existing.progenitorBonusPercent > 0;
  const formActive = existing?.incarnonFormActive === true;
  if (!hasProgenitor && externalBuffs.length === 0 && !formActive) return undefined;
  return {
    ...(hasProgenitor
      ? {
          progenitorElement: existing!.progenitorElement,
          progenitorBonusPercent: existing!.progenitorBonusPercent,
        }
      : {}),
    ...(externalBuffs.length > 0 ? { externalBuffs } : {}),
    ...(formActive ? { incarnonFormActive: true } : {}),
  };
}
