// Advanced Build Calculator - ported from Dart with elemental combos, status procs, heavy attacks
import { Mod, Weapon, Warframe, ModSlot, CalculatedStats, WarframeCalculatedStats, ElementalDamage, StatusProc, SimulationParams, DEFAULT_SIM_PARAMS, WeaponCalculationOptions, SetBonusLinkage, EquippedArchonShard, WeaponExternalBuff } from '../types';
import { avgCritMultiplier, quantizeBaseCritMultiplier } from './crit-utils';
import { resolveEffectiveFireRate } from './effective-fire-rate';
import { scaleRadialAttacksWithDps } from './weapon-radial-dps';
import {
  applyMeleeComboToStats,
  resolveEffectiveComboCount,
} from './melee-combo';
import { enrichWeapon } from '../weapons/weapon-enrich';

export { avgCritMultiplier, quantizeBaseCritMultiplier } from './crit-utils';
import {
  applyArcaneToWarframeFromMod,
  applyArcaneToWeaponFromMod,
  effectiveArcaneStacks,
  getArcaneEffectDef,
} from './arcane-calculator';
export { getPersistenceDamageCap, PERSISTENCE_DAMAGE_CAP_BY_RANK } from './arcane-utils';
import {
  VIGILANTE_MOD_IDS,
  UMBRAL_MOD_IDS,
  weaponSupportsPrimaryStyleSets,
  buildWarframeSetBonusSummary,
  buildWeaponSetBonusSummary,
  countSynthSetPieces,
  countTekSetPieces,
  countUmbralSetPieces,
  getUmbralSetBonusMultiplier,
  weaponAcceptsSynthReloadBonus,
} from './set-bonuses';
import { WARFRAME_ENERGY_RANK30 } from '@/data/warframe-energy-rank30';
import {
  applyVerifiedModStatToWarframe,
  applyVerifiedModStatToWeapon,
  sumSlideSpeedBonusFromModSlots,
  sumSprintSpeedBonusFromModSlots,
  type WarframeModAccumulators,
  type WeaponModAccumulators,
} from '@/lib/mods/mod-behavior-registry';
import {
  combatDamageMultiplier,
  factionBonusFromStats,
  factionDotMultiplier,
  factionHitMultiplier,
  factionTripleDotMultiplier,
  resolveStanceDamageMultiplier,
} from '@/lib/calc/combat-multipliers';

/** Unmodded rank-30 energy capacity — the pool Flow and +% max energy mods scale (wiki Energy Capacity). */
export function getWarframeEnergyModBase(warframe: Warframe): number {
  if (warframe.energy <= 0) return 0;
  const fromTable = WARFRAME_ENERGY_RANK30[warframe.id];
  if (fromTable != null) return fromTable;
  return warframe.energy + 50;
}

// ── Elemental Combo Rules ───────────────────────────────────────────────
const ELEMENTAL_COMBOS: Record<string, { a: string; b: string }> = {
  blast:     { a: 'heat', b: 'cold' },
  corrosive: { a: 'electricity', b: 'toxin' },
  gas:       { a: 'heat', b: 'toxin' },
  magnetic:  { a: 'cold', b: 'electricity' },
  radiation: { a: 'heat', b: 'electricity' },
  viral:     { a: 'cold', b: 'toxin' },
};

const BASE_ELEMENTS = ['heat', 'cold', 'toxin', 'electricity'] as const;
/** @deprecated Element mods apply only via per-mod verified entries in mod-behaviors. */
const DIRECT_ELEMENT_MOD_STATS = [
  'radiation', 'magnetic', 'viral', 'corrosive', 'gas', 'blast',
] as const;

function resolveElementalCombos(rawElements: { type: string; value: number }[]): ElementalDamage[] {
  // Work with a mutable list of pending elements in mod order
  const pending: { type: string; value: number }[] = rawElements.map(e => ({ ...e }));
  const result: ElementalDamage[] = [];

  // Try to combine from left to right
  let i = 0;
  while (i < pending.length) {
    let combined = false;
    for (let j = i + 1; j < pending.length; j++) {
      const comboType = findCombo(pending[i].type, pending[j].type);
      if (comboType) {
        result.push({ type: comboType, value: pending[i].value + pending[j].value });
        pending.splice(j, 1);
        pending.splice(i, 1);
        combined = true;
        break;
      }
    }
    if (!combined) {
      result.push({ type: pending[i].type, value: pending[i].value });
      i++;
    }
  }

  // Same final damage type stacks into one line (arsenal / wiki), even when formed
  // from separate mod pairs (e.g. two Viral from Toxin+Cold twice).
  const merged: ElementalDamage[] = [];
  for (const el of result) {
    const existing = merged.find((m) => m.type === el.type);
    if (existing) existing.value += el.value;
    else merged.push({ ...el });
  }
  return merged;
}

function findCombo(a: string, b: string): string | null {
  for (const [combo, { a: ea, b: eb }] of Object.entries(ELEMENTAL_COMBOS)) {
    if ((a === ea && b === eb) || (a === eb && b === ea)) return combo;
  }
  return null;
}

// ── Status Proc Calculations ────────────────────────────────────────────
const STATUS_INFO: Record<string, { duration: number; ticks: number; desc: string }> = {
  impact:      { duration: 1, ticks: 1, desc: 'Stagger + mercy threshold (max 5)' },
  puncture:    { duration: 10, ticks: 1, desc: '-40% dmg dealt (stacks to -80%), +crit received' },
  // DoTs: tick at application + once per second for 6s → 7 ticks
  slash:       { duration: 6, ticks: 7, desc: 'Bleed (35% base/tick, cinematic/True, ignores armor)' },
  heat:        { duration: 6, ticks: 7, desc: 'Ignite (50% base/tick), panic, armor strip to 50%' },
  cold:        { duration: 6, ticks: 1, desc: '-50% move/fire/attack (stacks to -90%), +crit mult received' },
  toxin:       { duration: 6, ticks: 7, desc: 'Poison (50% base/tick, bypasses shields)' },
  electricity: { duration: 6, ticks: 7, desc: 'Chain DoT (50% base/tick) + stun' },
  blast:       { duration: 6, ticks: 1, desc: 'Detonate: 30% base/stack after 1.5s; AoE on max stacks/death' },
  corrosive:   { duration: 8, ticks: 1, desc: '-26% armor first stack, -6% each after (max -80% at 10)' },
  gas:         { duration: 6, ticks: 7, desc: 'Gas cloud DoT (50% base/tick, AoE)' },
  magnetic:    { duration: 6, ticks: 1, desc: '+100% dmg to shields/overguard (stacks to +325%)' },
  radiation:   { duration: 12, ticks: 1, desc: 'Confusion + friendly-fire dmg (stacks to +550%)' },
  viral:       { duration: 6, ticks: 1, desc: '+100% health dmg first stack, +25% each after (max +325%)' },
  // Wiki / in-game: Status Chance Vulnerability; DE tooltip U38.5
  tau:         { duration: 8, ticks: 1, desc: '+10% status chance received per stack (max +100% / 2× procs at 10)' },
  void:        { duration: 3, ticks: 1, desc: 'Bullet Attract 2.5m for 3s (pulls projectiles to proc location)' },
};

/** Damage types that deal DoT; tick fraction of modded base (before type-specific bonuses). */
const DOT_TICK_FRACTION: Record<string, number> = {
  slash: 0.35,
  heat: 0.5,
  toxin: 0.5,
  electricity: 0.5,
  gas: 0.5,
};

/**
 * DoT tick base per proc: modded base damage (Serration-style only) × avg crit.
 * Multishot is NOT included here — each pellet procs independently and
 * statusChancePerShot / procs-per-second already accounts for extra pellets.
 * Type-specific elemental bonuses (Heat/Toxin/Elec/Gas mods) multiply after.
 * Wiki: DoT ignores elemental/physical type composition bonuses on the base.
 */
function statusDotTickBase(stats: CalculatedStats, moddedBaseDamage: number, sim?: SimulationParams): number {
  // Vigilante crit-tier enhance also applies to the proccing hit (linear in CC).
  const effCC = stats.criticalChance + (stats.vigilanteCritBonus ?? 0);
  let avgCrit = avgCritMultiplier(effCC, stats.criticalMultiplier);
  // Devouring Attrition double-dips into DoTs on non-crit proccing hits.
  avgCrit += Math.max(0, 1 - effCC) * (stats.devouringAttritionBonus ?? 0);
  const statusDmg = 1 + (stats.statusDamageBonus ?? 0);
  const factionBonus = factionBonusFromStats(stats.factionBonuses, sim?.targetFaction);
  const factionDot = factionDotMultiplier(factionBonus);
  // Headshot multi applies to the proccing hit (and thus DoT) when enabled
  const head =
    sim?.applyHeadshots
      ? 2 * (1 + (stats.headshotDamageBonus ?? 0))
      : 1;
  return moddedBaseDamage * avgCrit * statusDmg * factionDot * head;
}

/** Elemental type bonus fraction from that type's share of modded base (e.g. +90% Heat → 0.9). */
function elementalTypeBonus(stats: CalculatedStats, type: string, moddedBaseDamage: number): number {
  if (moddedBaseDamage <= 0) return 0;
  const el = stats.elements.find((e) => e.type === type);
  if (!el || el.value <= 0) return 0;
  return el.value / moddedBaseDamage;
}

function calculateStatusProcs(
  stats: CalculatedStats,
  moddedBaseDamage: number,
  sim?: SimulationParams,
): StatusProc[] {
  const allDamageTypes: { type: string; value: number }[] = [];
  if (stats.impact > 0) allDamageTypes.push({ type: 'impact', value: stats.impact });
  if (stats.puncture > 0) allDamageTypes.push({ type: 'puncture', value: stats.puncture });
  if (stats.slash > 0) allDamageTypes.push({ type: 'slash', value: stats.slash });
  for (const e of stats.elements) {
    if (e.value > 0) allDamageTypes.push({ type: e.type, value: e.value });
  }

  const totalDmg = allDamageTypes.reduce((sum, d) => sum + d.value, 0);
  if (totalDmg === 0) return [];

  const dotBase = statusDotTickBase(stats, moddedBaseDamage, sim);
  // Status duration mods (Continuous Misery, etc.) extend proc duration;
  // DoTs tick once per second, so extra duration adds ticks (ticks = floor(dur) + 1).
  const durMult = 1 + (stats.statusDurationBonus ?? 0);

  const procs: StatusProc[] = allDamageTypes.map(d => {
    const info = STATUS_INFO[d.type] || { duration: 6, ticks: 1, desc: 'Unknown' };
    const weight = d.value / totalDmg;
    const chance = stats.statusChance * weight;
    const frac = DOT_TICK_FRACTION[d.type];
    const duration = info.duration * durMult;
    const ticks = frac != null ? Math.floor(duration) + 1 : info.ticks;
    let dpt = 0;
    if (frac != null) {
      // Slash has no type-damage bonus mult; Heat/Toxin/Elec/Gas use (1 + type%).
      const typeMult = d.type === 'slash' ? 1 : 1 + elementalTypeBonus(stats, d.type, moddedBaseDamage);
      dpt = frac * dotBase * typeMult;
    }
    return {
      type: d.type,
      chance,
      damagePerTick: dpt,
      duration,
      ticks,
      totalDamage: dpt * ticks,
      description: info.desc,
    };
  });

  // Hunter Munitions: forced Slash proc on crits, independent of status chance.
  const slashOnCrit = stats.slashOnCritChance ?? 0;
  if (slashOnCrit > 0 && stats.criticalChance > 0) {
    const duration = STATUS_INFO.slash.duration * durMult;
    const ticks = Math.floor(duration) + 1;
    const dpt = DOT_TICK_FRACTION.slash * dotBase;
    const chance = slashOnCrit * Math.min(stats.criticalChance, 1);
    procs.push({
      type: 'slash',
      chance,
      damagePerTick: dpt,
      duration,
      ticks,
      totalDamage: dpt * ticks,
      description: 'Forced Slash on crit (Hunter Munitions)',
    });
  }

  // Internal Bleeding / Hemorrhage: each Impact proc has a chance to also
  // apply a Slash proc; the chance is doubled when fire rate is below 2.5.
  const slashOnImpact = stats.slashOnImpactProcChance ?? 0;
  const impactProc = procs.find((p) => p.type === 'impact');
  if (slashOnImpact > 0 && impactProc && impactProc.chance > 0) {
    const rateMult = stats.fireRate < 2.5 ? 2 : 1;
    const duration = STATUS_INFO.slash.duration * durMult;
    const ticks = Math.floor(duration) + 1;
    const dpt = DOT_TICK_FRACTION.slash * dotBase;
    const chance = impactProc.chance * Math.min(slashOnImpact * rateMult, 1);
    procs.push({
      type: 'slash',
      chance,
      damagePerTick: dpt,
      duration,
      ticks,
      totalDamage: dpt * ticks,
      description: `Slash on Impact proc (Internal Bleeding${rateMult === 2 ? ', x2 low fire rate' : ''})`,
    });
  }

  // Toxic Lash: guaranteed Toxin proc; tick = 0.5 × Extra Hit × toxin mods × Elementalist × faction³
  const tlFrac = stats.extraHitDamageFraction ?? 0;
  if (stats.extraHitGuaranteedToxin && tlFrac > 0 && stats.totalDamage > 0) {
    const effCC = stats.criticalChance + (stats.vigilanteCritBonus ?? 0);
    let avgCrit = avgCritMultiplier(effCC, stats.criticalMultiplier);
    avgCrit += Math.max(0, 1 - effCC) * (stats.devouringAttritionBonus ?? 0);
    const statusDmg = 1 + (stats.statusDamageBonus ?? 0);
    const factionBonus = factionBonusFromStats(stats.factionBonuses, sim?.targetFaction);
    const factionTriple = factionTripleDotMultiplier(factionBonus);
    const head =
      sim?.applyHeadshots
        ? 2 * (1 + (stats.headshotDamageBonus ?? 0))
        : 1;
    const toxinMult = 1 + (stats.toxinModBonusFraction ?? 0);
    const extraHit = stats.totalDamage * tlFrac;
    const dpt = 0.5 * extraHit * avgCrit * toxinMult * statusDmg * factionTriple * head;
    const duration = STATUS_INFO.toxin.duration * durMult;
    const ticks = Math.floor(duration) + 1;
    procs.push({
      type: "toxin",
      chance: 1,
      damagePerTick: dpt,
      duration,
      ticks,
      totalDamage: dpt * ticks,
      description: "Guaranteed Toxin from Toxic Lash Extra Hit",
    });
  }

  return procs;
}

// ── Damage quantization (1/32 of modded base) ───────────────────────────
/** Round each damage type to the nearest multiple of scale (moddedBase / 32). */
export function quantizeDamageValue(value: number, scale: number): number {
  if (scale <= 0 || !Number.isFinite(value)) return value;
  return Math.round(value / scale) * scale;
}

function quantizeStatsDamage(stats: CalculatedStats, moddedBaseDamage: number): void {
  const scale = moddedBaseDamage / 32;
  if (scale <= 0) return;
  // Preserve unallocated residual (weapons missing IPS/element breakdown) before re-summing.
  const prePhys = stats.impact + stats.puncture + stats.slash;
  const preElem = stats.elements.reduce((sum, e) => sum + e.value, 0);
  const residual = Math.max(0, stats.totalDamage - prePhys - preElem);

  stats.impact = quantizeDamageValue(stats.impact, scale);
  stats.puncture = quantizeDamageValue(stats.puncture, scale);
  stats.slash = quantizeDamageValue(stats.slash, scale);
  for (const e of stats.elements) e.value = quantizeDamageValue(e.value, scale);
  for (const e of stats.rawElements) e.value = quantizeDamageValue(e.value, scale);
  const physicalDmg = stats.impact + stats.puncture + stats.slash;
  const elementalDmg = stats.elements.reduce((sum, e) => sum + e.value, 0);
  stats.totalDamage = physicalDmg + elementalDmg + residual;
}

// ── Set Bonus Detection ─────────────────────────────────────────────────
// Implemented: Umbral (×stats on Vit/Fiber/Int; Tau unscaled), Sacrificial (1.5× on both mods when 2),
// Gladiator (+10% crit/(CM−1) per piece + +15%/(CM−1) at 6 total w/ sim.wf pieces), Vigilante (5%/mod, primary only;
//   also counts Vigilante on linked Warframe or sim.extraVigilanteModsFromWarframe; folded into avg crit for DPS).
// Cross-slot: Synth 4pc +15% pistol reload; Tek 4pc optional ×1.6 vs marked (primary); loadout linkage in set-bonuses.ts.
// Warframe panel: Augur/Hunter/Mecha/Synth/Tek piece counts + Augur shields % / Hunter companion dmg % (per piece).
// Not modeled in DPS: Augur shield sustain from casts, Hunter companion combat, Mecha mark/status-spread.
const SACRIFICIAL_MOD_IDS = ['sacrificial_pressure', 'sacrificial_steel'];

// Sacrificial full set bonus: +75% when both mods equipped
function getSacrificialSetBonus(sacCount: number): number {
  if (sacCount < 2) return 0;
  return 0.75;
}

// Gladiator set: +10% CC per combo multiplier per set mod equipped
// Works on melee only, stacks additively with Blood Rush
const GLADIATOR_MOD_IDS = [
  'gladiator_aegis', 'gladiator_finesse', 'gladiator_might',
  'gladiator_resolve', 'gladiator_rush', 'gladiator_vice',
];

const vigilanteIdList = VIGILANTE_MOD_IDS as unknown as string[];

function applyRadialAttacks(
  baseWeapon: Weapon,
  stats: CalculatedStats,
  incarnonActive = false,
): void {
  const { attacks, radialBurstDps, radialSustainedDps } = scaleRadialAttacksWithDps(baseWeapon, stats, incarnonActive);
  if (!attacks.length) return;
  stats.radialAttacks = attacks;
  stats.radialBurstDps = radialBurstDps;
  stats.radialSustainedDps = radialSustainedDps;
  if (radialBurstDps > 0) {
    stats.burstDps += radialBurstDps;
    stats.sustainedDps += radialSustainedDps;
  }
}

/** Contagion Cloud (and similar) flat ability cloud DPS from external buffs. */
function applyAbilityCloudDps(
  stats: CalculatedStats,
  externalBuffs?: WeaponExternalBuff[],
): void {
  if (!externalBuffs?.length) return;
  let cloud = 0;
  for (const buff of externalBuffs) {
    if (buff.abilityCloudDps && buff.abilityCloudDps > 0) cloud += buff.abilityCloudDps;
  }
  if (cloud <= 0) return;
  stats.contagionCloudDps = cloud;
  stats.burstDps += cloud;
  stats.sustainedDps += cloud;
}

function applyWeaponExternalBuffs(
  acc: WeaponModAccumulators,
  buffs?: WeaponExternalBuff[],
  elementalMods?: { type: string; value: number }[],
  baseWeaponDamage?: number,
  critMultFlat?: { critEventBonus: number },
  critChanceFlat?: { chance: number },
  /** Product of (1 + damageMultBonus) for Roar/Eclipse-style mults. */
  multDamage?: { product: number },
  extraHit?: { fraction: number; guaranteedToxin: boolean },
): void {
  if (!buffs?.length) return;
  for (const buff of buffs) {
    if (buff.damageBonus) acc.damageBonus += buff.damageBonus;
    if (buff.damageMultBonus && multDamage) {
      multDamage.product *= 1 + buff.damageMultBonus;
    }
    if (buff.critChanceBonus) acc.critChanceBonus += buff.critChanceBonus;
    if (buff.critChanceFlatBonus && critChanceFlat) critChanceFlat.chance += buff.critChanceFlatBonus;
    if (buff.critMultBonus) acc.critMultBonus += buff.critMultBonus;
    if (buff.critMultFlatBonus && critMultFlat) critMultFlat.critEventBonus += buff.critMultFlatBonus;
    if (buff.statusBonus) acc.statusBonus += buff.statusBonus;
    if (buff.fireRateBonus) acc.fireRateBonus += buff.fireRateBonus;
    if (buff.reloadBonus) acc.reloadBonus += buff.reloadBonus;
    if (buff.multishotBonus) acc.multishotBonus += buff.multishotBonus;
    if (buff.extraHitDamageFraction && extraHit) {
      extraHit.fraction += buff.extraHitDamageFraction;
      if (buff.extraHitGuaranteedToxin) extraHit.guaranteedToxin = true;
    }
    if (buff.elemental?.length && elementalMods && baseWeaponDamage) {
      for (const e of buff.elemental) {
        elementalMods.push({ type: e.type, value: baseWeaponDamage * e.bonusFraction });
      }
    }
  }
}

// ── Main Weapon Calculator ──────────────────────────────────────────────
export function calculateWeaponBuild(
  rawWeapon: Weapon,
  equippedMods: ModSlot[],
  allMods: Map<string, Mod>,
  incarnonStatChanges?: Record<string, number>,
  simParams?: SimulationParams,
  calcOptions?: WeaponCalculationOptions,
  linkage?: SetBonusLinkage,
  /** Riven stat fractions (1.2 = +120%); crit/status apply relative to the modded stat, unlike flat incarnon changes. */
  rivenStatChanges?: Record<string, number>,
): CalculatedStats {
  // Pure-element fills + charge/burst timing (idempotent if already enriched).
  const baseWeapon = enrichWeapon(rawWeapon);
  const sim = simParams || DEFAULT_SIM_PARAMS;
  const isMelee = baseWeapon.category === 'melee' || baseWeapon.triggerType === 'Melee';

  // Incarnon "Increase Base Crit/Status/CM" raises the weapon base before mod multipliers
  // (wiki Critical Hit / Critical Parallel worked example).
  const incBaseCC = incarnonStatChanges?.criticalChance ?? 0;
  const incBaseCM = incarnonStatChanges?.criticalMultiplier ?? 0;
  const incBaseSC = incarnonStatChanges?.statusChance ?? 0;
  const evolvedBaseCC = baseWeapon.criticalChance + incBaseCC;
  // Kinetic Killer-style: set base CM absolutely (replaces weapon base + Incarnon CM adds).
  const cmSet = incarnonStatChanges?.criticalMultiplierSet;
  const evolvedBaseCM =
    cmSet != null ? cmSet : baseWeapon.criticalMultiplier + incBaseCM;
  const evolvedBaseSC = baseWeapon.statusChance + incBaseSC;

  const stats: CalculatedStats = {
    totalDamage: baseWeapon.damage,
    impact: baseWeapon.impact,
    puncture: baseWeapon.puncture,
    slash: baseWeapon.slash,
    elements: [],
    rawElements: [],
    fireRate: baseWeapon.fireRate,
    criticalChance: evolvedBaseCC,
    criticalMultiplier: evolvedBaseCM,
    statusChance: evolvedBaseSC,
    statusChancePerShot: evolvedBaseSC,
    magazine: baseWeapon.magazine,
    reloadTime: baseWeapon.reloadTime,
    ammoEfficiency: 0,
    multishot: baseWeapon.multishot,
    burstDps: 0,
    sustainedDps: 0,
    statusProcs: [],
    heavyAttackDamage: 0,
    heavyAttackWindUp: 0.6,
    comboCount: 0,
    comboDuration: 5,
    heavyAttackEfficiency: 0,
    comboMultiplier: 1.0,
    heavyAttackComboMultiplier: 1.0,
    conditionOverloadBonus: 0,
    bloodRushStacks: 0,
    weavingFrameBonus: 0,
    simParams: sim,
    galvanizedMultishotOnKill: 0,
    galvanizedDamagePerStatus: 0,
    berserkerFuryBonus: 0,
    weepingWoundsBonus: 0,
    slideSpeedBonus: 0,
    sprintSpeedBonus: 0,
  };

  // Collect elemental mods in order and other stat bonuses
  let damageBonus = 0;
  let critChanceBonus = 0;
  let critMultBonus = 0;
  let fireRateBonus = 0;
  let multishotBonus = 0;
  let statusBonus = 0;
  let magBonus = 0;
  let reloadBonus = 0;
  let impactBonus = 0;
  let punctureBonus = 0;
  let slashBonus = 0;
  const elementalMods: { type: string; value: number }[] = [];
  let hasConditionOverload = false;
  let conditionOverloadPerStatus = 0;
  let hasBloodRush = false;
  let bloodRushValue = 0;
  let hasWeepingWounds = false;
  let weepingWoundsValue = 0;
  let hasBerserkerFury = false;
  let berserkerFuryPerStack = 0;
  let galvMultishotOnKillPerStack = 0;
  let galvDamagePerStatusPerStack = 0;

  // Count set mods for set bonuses
  const sacCount = equippedMods.filter(s => SACRIFICIAL_MOD_IDS.includes(s.modId)).length;
  const sacSetBonus = getSacrificialSetBonus(sacCount);
  const gladiatorFromLinkedWf =
    linkage?.warframeMods?.filter((s) => GLADIATOR_MOD_IDS.includes(s.modId)).length ?? 0;
  const gladiatorCount =
    equippedMods.filter((s) => GLADIATOR_MOD_IDS.includes(s.modId)).length +
    gladiatorFromLinkedWf +
    (sim.extraGladiatorMods || 0);
  const vigOnWeapon = equippedMods.filter((s) => vigilanteIdList.includes(s.modId)).length;
  const vigFromLinkedWf = linkage?.warframeMods?.filter((s) => vigilanteIdList.includes(s.modId)).length ?? 0;
  const vigFromSimFallback = linkage ? 0 : (sim.extraVigilanteModsFromWarframe ?? 0);
  const vigilanteCount = vigOnWeapon + vigFromLinkedWf + vigFromSimFallback;

  const weaponModAcc: WeaponModAccumulators = {
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

  // Elemental combo order follows mod slot order: left→right, top→bottom (slotIndex).
  const orderedMods = [...equippedMods].sort((a, b) => a.slotIndex - b.slotIndex);

  for (const modSlot of orderedMods) {
    const mod = allMods.get(modSlot.modId);
    if (!mod) continue;

    const rank = Math.min(Math.max(modSlot.rank ?? 0, 0), mod.maxRank);
    const multiplier = rank + 1;
    const setMult = SACRIFICIAL_MOD_IDS.includes(modSlot.modId) ? (1 + sacSetBonus) : 1;
    // Fire rate mods tagged "(x2 for Bows)" double on bows (wiki Fire Rate).
    const isBow = baseWeapon.chargeMode === "bow" || baseWeapon.triggerType === "Bow";
    const bowFireRateMult =
      isBow && /x2 for Bows/i.test(mod.description ?? "") ? 2 : 1;

    for (const [statName, value] of Object.entries(mod.stats)) {
      let modValue = (value * multiplier * setMult) / 100.0;
      if (statName === "fireRate") modValue *= bowFireRateMult;
      applyVerifiedModStatToWeapon(stats, {
        modId: modSlot.modId,
        statKey: statName,
        modValue,
        baseWeaponDamage: baseWeapon.damage,
        acc: weaponModAcc,
        elementalMods,
        comboDuration: { add: (v) => { stats.comboDuration += v; } },
        heavyAttackEfficiency: { add: (v) => { stats.heavyAttackEfficiency += v; } },
      });
    }
  }

  const critMultFlatBonus = { critEventBonus: 0 };
  const critChanceFlatBonus = { chance: 0 };
  const externalDamageMult = { product: 1 };
  const externalExtraHit = { fraction: 0, guaranteedToxin: false };
  applyWeaponExternalBuffs(
    weaponModAcc,
    calcOptions?.externalBuffs,
    elementalMods,
    baseWeapon.damage,
    critMultFlatBonus,
    critChanceFlatBonus,
    externalDamageMult,
    externalExtraHit,
  );
  // Toxin mod % (pre-combine) for Toxic Lash tick type mult.
  let toxinModBonus = 0;
  if (baseWeapon.damage > 0) {
    for (const e of elementalMods) {
      if (e.type === "toxin") toxinModBonus += e.value / baseWeapon.damage;
    }
  }
  stats.toxinModBonusFraction = toxinModBonus;
  if (externalExtraHit.fraction > 0) {
    // Wiki Extra Hit (Toxic Lash / Xata): elemental mods (and elemental ability buffs)
    // scale the Extra Hit again, even when those mods combine into other elements.
    // Innate weapon elements are pushed later — only mod/buff rows are in elementalMods now.
    let elementalDip = 0;
    if (baseWeapon.damage > 0) {
      for (const e of elementalMods) {
        elementalDip += e.value / baseWeapon.damage;
      }
    }
    stats.extraHitDamageFraction = externalExtraHit.fraction * (1 + elementalDip);
    if (externalExtraHit.guaranteedToxin) {
      stats.extraHitGuaranteedToxin = true;
      // Wiki Spores synergy: two Extra Hit damage instances, one Toxin status.
      stats.extraHitInstances = sim.toxicLashSporesOnTarget ? 2 : 1;
    } else {
      stats.extraHitInstances = 1;
    }
  }

  damageBonus = weaponModAcc.damageBonus;
  critChanceBonus = weaponModAcc.critChanceBonus;
  critMultBonus = weaponModAcc.critMultBonus;
  fireRateBonus = weaponModAcc.fireRateBonus;
  multishotBonus = weaponModAcc.multishotBonus;
  statusBonus = weaponModAcc.statusBonus;
  magBonus = weaponModAcc.magBonus;
  reloadBonus = weaponModAcc.reloadBonus;
  impactBonus = weaponModAcc.impactBonus;
  punctureBonus = weaponModAcc.punctureBonus;
  slashBonus = weaponModAcc.slashBonus;
  hasBloodRush = weaponModAcc.hasBloodRush;
  bloodRushValue = weaponModAcc.bloodRushValue;
  hasConditionOverload = weaponModAcc.hasConditionOverload;
  conditionOverloadPerStatus = weaponModAcc.conditionOverloadPerStatus;
  hasWeepingWounds = weaponModAcc.hasWeepingWounds;
  weepingWoundsValue = weaponModAcc.weepingWoundsValue;
  hasBerserkerFury = weaponModAcc.hasBerserkerFury;
  berserkerFuryPerStack = weaponModAcc.berserkerFuryPerStack;
  galvMultishotOnKillPerStack = weaponModAcc.galvMultishotOnKillPerStack;
  galvDamagePerStatusPerStack = weaponModAcc.galvDamagePerStatusPerStack;
  stats.statusDamageBonus = weaponModAcc.statusDamageBonus;
  stats.headshotDamageBonus = weaponModAcc.headshotDamageBonus;
  stats.statusDurationBonus = weaponModAcc.statusDurationBonus;
  stats.factionBonuses = { ...weaponModAcc.factionBonuses };

  // Apply Condition Overload: multiplicative damage per status type on target
  if (hasConditionOverload && sim.statusTypesOnTarget > 0) {
    damageBonus += conditionOverloadPerStatus * sim.statusTypesOnTarget;
  }
  stats.conditionOverloadBonus = conditionOverloadPerStatus;

  // Fatal Affliction (Incarnon): +40% Direct Damage per status type (CO-like, sim-gated)
  const fatalAfflictionPerStatus = incarnonStatChanges?.fatalAfflictionPerStatus ?? 0;
  if (fatalAfflictionPerStatus > 0 && sim.statusTypesOnTarget > 0) {
    damageBonus += fatalAfflictionPerStatus * sim.statusTypesOnTarget;
  }

  // King's Gambit / Prolific-style: relative CC% (paper uptime)
  critChanceBonus += incarnonStatChanges?.critChanceBonus ?? 0;
  // Spiteful Defilement-style: flat CM after mods (paper <3 statuses)
  critMultFlatBonus.critEventBonus += incarnonStatChanges?.critMultFlat ?? 0;

  // Apply Galvanized Condition (Aptitude/Savvy/Shot): damage per status on target per kill stack
  const galvConditionStacks = Math.min(sim.killStacks, weaponModAcc.galvDamagePerStatusStackCap);
  if (galvDamagePerStatusPerStack > 0 && galvConditionStacks > 0 && sim.statusTypesOnTarget > 0) {
    damageBonus += galvDamagePerStatusPerStack * galvConditionStacks * sim.statusTypesOnTarget;
  }
  stats.galvanizedDamagePerStatus = galvDamagePerStatusPerStack;
  stats.galvanizedDamagePerStatusStackCap = weaponModAcc.galvDamagePerStatusStackCap;

  // Apply Galvanized Multishot on-kill stacks (Chamber caps at 5, Hell/Diffusion at 4)
  const galvMultishotStacks = Math.min(sim.killStacks, weaponModAcc.galvMultishotStackCap);
  if (galvMultishotOnKillPerStack > 0 && galvMultishotStacks > 0) {
    multishotBonus += galvMultishotOnKillPerStack * galvMultishotStacks;
  }
  stats.galvanizedMultishotOnKill = galvMultishotOnKillPerStack;
  stats.galvanizedMultishotStackCap = weaponModAcc.galvMultishotStackCap;

  // Non-stacking on-kill buffs (Bladed Rounds, Gorgon Frenzy, Secondary Wind, …):
  // active at full value whenever the sim has any kill stacks.
  const onKill = weaponModAcc.onKillStatBonuses;
  const trigger = weaponModAcc.triggerStatBonuses;
  const activeBuffPools: Record<string, number>[] = [];
  if (sim.killStacks > 0) activeBuffPools.push(onKill);
  if (sim.applyTriggerBuffs) activeBuffPools.push(trigger);
  for (const pool of activeBuffPools) {
    damageBonus += pool.damage ?? 0;
    critChanceBonus += pool.criticalChance ?? 0;
    critMultBonus += pool.criticalMultiplier ?? 0;
    fireRateBonus += pool.fireRate ?? 0;
    statusBonus += pool.statusChance ?? 0;
    multishotBonus += pool.multishot ?? 0;
    reloadBonus += pool.reloadSpeed ?? 0;
  }
  stats.onKillStatBonuses = { ...onKill };
  stats.triggerStatBonuses = { ...trigger };

  // Hunter Munitions-style forced Slash procs on crits (adds to status proc DPS below).
  stats.slashOnCritChance = weaponModAcc.slashOnCritChance;
  // Internal Bleeding / Hemorrhage: Impact procs can add a Slash proc.
  stats.slashOnImpactProcChance = weaponModAcc.slashOnImpactProcChance;
  // Charged/Primed Chamber: first-shot damage, averaged over the magazine for DPS.
  stats.firstShotDamageBonus = weaponModAcc.firstShotDamageBonus;

  // Apply Galvanized Scope/Crosshairs: crit while aiming only after headshots (sim toggle);
  // headshot-kill stacks reuse the kill-stacks slider (in-game cap 5).
  const galvCritOnHeadshotBase = weaponModAcc.galvCritOnHeadshotBase;
  const galvCritOnHeadshotPerStack = weaponModAcc.galvCritOnHeadshotPerStack;
  if (galvCritOnHeadshotBase > 0 && sim.applyHeadshots) {
    const galvCritStacks = Math.min(sim.killStacks, 5);
    critChanceBonus += galvCritOnHeadshotBase + galvCritOnHeadshotPerStack * galvCritStacks;
  }
  stats.galvanizedCritOnHeadshot = galvCritOnHeadshotBase;
  stats.galvanizedCritOnHeadshotPerStack = galvCritOnHeadshotPerStack;

  // Apply Berserker Fury on-kill stacks (max 2 stacks)
  if (hasBerserkerFury && sim.killStacks > 0) {
    const bfStacks = Math.min(sim.killStacks, 2);
    fireRateBonus += berserkerFuryPerStack * bfStacks;
  }
  stats.berserkerFuryBonus = berserkerFuryPerStack;

  // Apply IPS bonuses additively, then global damage multiplier
  stats.impact *= (1 + impactBonus);
  stats.puncture *= (1 + punctureBonus);
  stats.slash *= (1 + slashBonus);
  const dmgMult = 1 + damageBonus;
  stats.totalDamage *= dmgMult;
  stats.impact *= dmgMult;
  stats.puncture *= dmgMult;
  stats.slash *= dmgMult;

  // Apply other bonuses
  // Wiki: add Incarnon base CM, then quantize, then apply % crit-damage mods.
  stats.criticalChance *= (1 + critChanceBonus);
  // wiki: Wrathful Advance — flat final CC after relative mods
  if (critChanceFlatBonus.chance !== 0) {
    stats.criticalChance += critChanceFlatBonus.chance;
  }
  stats.criticalMultiplier =
    quantizeBaseCritMultiplier(evolvedBaseCM) * (1 + critMultBonus);
  if (critMultFlatBonus.critEventBonus > 0) {
    stats.criticalMultiplier += critMultFlatBonus.critEventBonus;
  }
  // Cannonade mods: "Fire Rate cannot be modified" — all fire rate bonuses are nulled.
  const fireRateLocked = equippedMods.some((s) =>
    s.modId === "semi_rifle_cannonade" ||
    s.modId === "semi_pistol_cannonade" ||
    s.modId === "semi_shotgun_cannonade",
  );
  if (fireRateLocked) {
    fireRateBonus = 0;
    stats.fireRateLocked = true;
  }
  stats.fireRate *= (1 + fireRateBonus);
  stats.fireRateBonus = fireRateBonus;
  // Acuity mods: "Multishot cannot be modified" — all multishot bonuses are nulled.
  const multishotLocked = equippedMods.some(
    (s) => s.modId === "primary_acuity" || s.modId === "pistol_acuity",
  );
  if (multishotLocked) {
    multishotBonus = 0;
    stats.multishotLocked = true;
  }
  // Multishot is a % of base pellets: total = base × (1 + multishot mods).
  stats.multishot = baseWeapon.multishot * (1 + multishotBonus);
  stats.statusChance *= (1 + statusBonus);
  stats.magazine = Math.round(stats.magazine * (1 + magBonus));

  // Synth 4-set: +15% reload speed on pistols when full set across linked loadout
  const synthPieces = linkage
    ? countSynthSetPieces(linkage, equippedMods)
    : countSynthSetPieces(undefined, equippedMods) + (sim.extraSynthSetPiecesOffWeapon ?? 0);
  if (synthPieces >= 4 && weaponAcceptsSynthReloadBonus(baseWeapon)) {
    reloadBonus += 0.15;
    stats.synthSetReloadBonusApplied = 0.15;
  }

  // Reload: positive bonus = faster, negative bonus = slower (Burdened Magazine etc.)
  if (reloadBonus !== 0) {
    if (reloadBonus > 0) stats.reloadTime /= Math.max(0.01, 1 + reloadBonus);
    else stats.reloadTime *= (1 + Math.abs(reloadBonus));
  }

  // Scale mod-sourced elemental damage by the total damage multiplier (Serration/etc.)
  for (const e of elementalMods) {
    e.value *= dmgMult;
  }

  // Innate weapon elements + progenitor: applied LAST in combo order (wiki Calculating Bonuses).
  const innateElemTypes = ['heat', 'cold', 'toxin', 'electricity', 'radiation', 'viral', 'corrosive', 'gas', 'magnetic', 'blast', 'tau'] as const;
  const innateElements: { type: string; value: number }[] = [];
  for (const elem of innateElemTypes) {
    const baseVal = (baseWeapon as unknown as Record<string, unknown>)[elem] as number | undefined;
    if (baseVal && baseVal > 0) {
      innateElements.push({ type: elem, value: baseVal * dmgMult });
    }
  }
  // Kuva/Tenet/Coda progenitor bonus (% of base damage, scales with +damage mods). IPS goes to IPS stats; elements use combo pipeline.
  if (
    calcOptions?.progenitorElement &&
    calcOptions.progenitorBonusPercent != null &&
    calcOptions.progenitorBonusPercent > 0
  ) {
    const pct = calcOptions.progenitorBonusPercent / 100;
    const bonus = baseWeapon.damage * pct * dmgMult;
    const pe = calcOptions.progenitorElement;
    if (pe === "impact") stats.impact += bonus;
    else if (pe === "puncture") stats.puncture += bonus;
    else if (pe === "slash") stats.slash += bonus;
    else innateElements.push({ type: pe, value: bonus });
  }
  elementalMods.push(...innateElements);

  // Resolve elemental combos (mod order first, innate last)
  stats.rawElements = elementalMods.map(e => ({ ...e }));
  stats.elements = resolveElementalCombos(elementalMods);

  // Recalculate totalDamage including elements.
  // Residual: some weapons store total damage without IPS/element breakdown
  // (e.g. pure Amprex electricity missing the electricity field). Preserve
  // unallocated base so paper DPS is not zeroed until data is fixed.
  const ipsBaseUnmod =
    baseWeapon.impact + baseWeapon.puncture + baseWeapon.slash;
  let innateElBaseUnmod = 0;
  for (const elem of innateElemTypes) {
    const baseVal = (baseWeapon as unknown as Record<string, unknown>)[elem] as number | undefined;
    if (baseVal && baseVal > 0) innateElBaseUnmod += baseVal;
  }
  const residualBase = Math.max(0, baseWeapon.damage - ipsBaseUnmod - innateElBaseUnmod);

  let physicalDmg = stats.impact + stats.puncture + stats.slash;
  let elementalDmg = stats.elements.reduce((sum, e) => sum + e.value, 0);
  let residualDmg = residualBase * dmgMult;
  stats.totalDamage = physicalDmg + elementalDmg + residualDmg;

  // Track full damage mult for DoT base / quantization scale (Serration + damage rivens/incarnon + ability mults).
  let damageMultTotal = dmgMult;

  // Roar / Eclipse / etc.: multiply after additive base-damage mods (wiki Calculating Bonuses).
  const extMult = externalDamageMult.product;
  if (extMult !== 1 && extMult > 0) {
    damageMultTotal *= extMult;
    residualDmg *= extMult;
    stats.impact *= extMult;
    stats.puncture *= extMult;
    stats.slash *= extMult;
    for (const e of stats.elements) e.value *= extMult;
    for (const e of stats.rawElements) e.value *= extMult;
    physicalDmg = stats.impact + stats.puncture + stats.slash;
    elementalDmg = stats.elements.reduce((sum, e) => sum + e.value, 0);
    stats.totalDamage = physicalDmg + elementalDmg + residualDmg;
  }

  // Apply Incarnon evolution / riven stat changes.
  // relativeCritStatus: riven crit/status/critMult bonuses are relative fractions on
  // the (already modded) stat. Incarnon base CC/CM/SC are folded into evolvedBase*
  // before mod scaling above — remaining incarnon keys (flatBaseDamage, etc.) apply here.
  const applyStatChanges = (changes: Record<string, number>, relativeCritStatus: boolean) => {
    const phys0 = stats.impact + stats.puncture + stats.slash;
    const ele0 = stats.elements.reduce((sum, e) => sum + e.value, 0);
    let residual = Math.max(0, stats.totalDamage - phys0 - ele0);

    for (const [stat, value] of Object.entries(changes)) {
      switch (stat) {
        case 'damage': {
          const dm = 1 + value;
          damageMultTotal *= dm;
          residual *= dm;
          stats.totalDamage *= dm;
          stats.impact *= dm;
          stats.puncture *= dm;
          stats.slash *= dm;
          for (const e of stats.elements) e.value *= dm;
          for (const e of stats.rawElements) e.value *= dm;
          break;
        }
        case 'criticalChance':
          if (relativeCritStatus) stats.criticalChance *= (1 + value);
          // Incarnon base CC already applied via evolvedBaseCC — skip flat path.
          break;
        case 'criticalMultiplier':
          if (relativeCritStatus) stats.criticalMultiplier *= (1 + value);
          break;
        case 'statusChance':
          if (relativeCritStatus) stats.statusChance *= (1 + value);
          break;
        case 'fireRate': stats.fireRate *= (1 + value); break;
        // Devouring/Devastating Attrition: 50% chance for non-crit hits to
        // deal +value×100% damage. Store the average non-crit bonus (0.5 × value).
        case 'devouringAttrition':
          stats.devouringAttritionBonus = (stats.devouringAttritionBonus ?? 0) + value * 0.5;
          break;
        // Handled after modded CC/SC (see conditional Incarnon block below).
        case 'fatalAfflictionPerStatus':
        case 'statusFromCritFraction':
        case 'statusFromCritCap':
        case 'critFromStatusFraction':
        case 'critFromStatusCap':
        case 'preludeMightBaseCm':
        case 'preludeMightMaxCc':
        case 'critChanceBonus':
        case 'critMultFlat':
        case 'critMultMultiply':
        case 'criticalMultiplierSet':
          break;
        case 'headshotDamageBonus':
          stats.headshotDamageBonus = (stats.headshotDamageBonus ?? 0) + value;
          break;
        case 'slashOnImpactProcChance':
          stats.slashOnImpactProcChance = (stats.slashOnImpactProcChance ?? 0) + value;
          break;
        case 'statusDuration':
          stats.statusDurationBonus = (stats.statusDurationBonus ?? 0) + value;
          break;
        case 'statusDamageBonus':
          stats.statusDamageBonus = (stats.statusDamageBonus ?? 0) + value;
          break;
        // Neurotoxin: +toxin% while headshot sim is on (uptime assumed).
        case 'neurotoxinToxinOnHeadshot':
          if (sim.applyHeadshots && baseWeapon.damage > 0) {
            elementalMods.push({
              type: 'toxin',
              value: baseWeapon.damage * damageMultTotal * value,
            });
            stats.rawElements = elementalMods.map((e) => ({ ...e }));
            stats.elements = resolveElementalCombos(elementalMods);
          }
          break;
        // Incarnon "Increase Base Damage by +N": flat add to the weapon's base
        // damage before mods. All modded damage scales proportionally with base,
        // so this is exactly a (base + N) / base multiplier.
        case 'flatBaseDamage': {
          if (baseWeapon.damage > 0) {
            const dm = 1 + value / baseWeapon.damage;
            damageMultTotal *= dm;
            residual *= dm;
            stats.totalDamage *= dm;
            stats.impact *= dm;
            stats.puncture *= dm;
            stats.slash *= dm;
            for (const e of stats.elements) e.value *= dm;
            for (const e of stats.rawElements) e.value *= dm;
          }
          break;
        }
        case 'multishot':
          // Riven multishot is % of base pellets; incarnon may pass flat pellet adds.
          if (relativeCritStatus) stats.multishot += baseWeapon.multishot * value;
          else stats.multishot += value;
          break;
        case 'magazine': stats.magazine = Math.round(stats.magazine * (1 + value)); break;
        case 'flatMagazine': stats.magazine = Math.round(stats.magazine + value); break;
        case 'initialCombo':
          stats.incarnonInitialCombo = (stats.incarnonInitialCombo ?? 0) + value;
          break;
        case 'reloadSpeed': stats.reloadTime /= (1 + value); break;
        case 'ammoEfficiency':
          stats.ammoEfficiency = (stats.ammoEfficiency ?? 0) + value;
          break;
        case 'punctureArmorStripPerStack':
          stats.punctureArmorStripPerStack = value;
          break;
        case 'heavyAttackWindUp':
          // Wiki "+N% Heavy Attack Wind Up Speed" shortens windup time.
          if (value > -1) stats.heavyAttackWindUp /= 1 + value;
          break;
        case 'heavyAttackEfficiencySet':
          // Wiki Overhand: set base heavy efficiency (absolute), not additive.
          stats.heavyAttackEfficiency = value;
          break;
        case 'heavyAttackEfficiency':
          stats.heavyAttackEfficiency = (stats.heavyAttackEfficiency ?? 0) + value;
          break;
        case 'heat': case 'cold': case 'toxin': case 'electricity':
          elementalMods.push({ type: stat, value: baseWeapon.damage * damageMultTotal * value });
          // Re-resolve elements with new additions
          stats.rawElements = elementalMods.map(e => ({ ...e }));
          stats.elements = resolveElementalCombos(elementalMods);
          break;
        // Physical damage type bonuses (from rivens)
        case 'impact': stats.impact *= (1 + value); break;
        case 'puncture': stats.puncture *= (1 + value); break;
        case 'slash': stats.slash *= (1 + value); break;
        // Melee-specific riven / incarnon stats
        case 'range':
          // Absolute meters (Incarnon Orokin Reach). Riven % range is also stored here as a
          // display hint when base reach is unknown — still no DPS effect.
          stats.range = (stats.range ?? 0) + value;
          break;
        case 'slideAttack': /* slide attack bonus — visual only */ break;
        case 'finisherDamage': /* finisher bonus — visual only */ break;
        case 'comboDuration': stats.comboDuration += value; break;
        // Ranged-specific riven stats
        case 'projectileSpeed': /* visual only */ break;
        case 'zoom': /* visual only */ break;
        case 'punchThrough': /* visual only */ break;
        case 'ammoMax': /* riven % of ammo max — no base ammoMax on Weapon yet */ break;
        case 'flatAmmoMax':
          stats.ammoMax = (stats.ammoMax ?? 0) + value;
          break;
        case 'ammoMaxSet':
          stats.ammoMax = value;
          break;
        case 'recoil': /* visual only */ break;
      }
    }
    // Recalculate total damage after incarnon/riven changes (keep residual)
    const physDmg2 = stats.impact + stats.puncture + stats.slash;
    const eleDmg2 = stats.elements.reduce((sum, e) => sum + e.value, 0);
    stats.totalDamage = physDmg2 + eleDmg2 + residual;
  };
  if (incarnonStatChanges) applyStatChanges(incarnonStatChanges, false);
  if (rivenStatChanges) applyStatChanges(rivenStatChanges, true);

  // Conditional Incarnon cross-stats (Wiseman / High Ground / Decisive / Prelude):
  // "Increase Base X by Y% of current Z" uses post-mod CC/SC, then scales the base add
  // by the same % mods already applied to that stat.
  if (incarnonStatChanges) {
    const scFromCritFrac = incarnonStatChanges.statusFromCritFraction ?? 0;
    const scFromCritCap = incarnonStatChanges.statusFromCritCap ?? 0.4;
    const ccFromScFrac = incarnonStatChanges.critFromStatusFraction ?? 0;
    const ccFromScCap = incarnonStatChanges.critFromStatusCap ?? 0.35;
    const preludeCm = incarnonStatChanges.preludeMightBaseCm ?? 0;
    const preludeMaxCc = incarnonStatChanges.preludeMightMaxCc;
    const ccSnap = stats.criticalChance;
    const scSnap = stats.statusChance;

    if (scFromCritFrac > 0) {
      const baseAdd = Math.min(scFromCritCap, scFromCritFrac * ccSnap);
      stats.statusChance += baseAdd * (1 + statusBonus);
    }
    if (ccFromScFrac > 0) {
      const baseAdd = Math.min(ccFromScCap, ccFromScFrac * scSnap);
      stats.criticalChance += baseAdd * (1 + critChanceBonus);
    }
    if (
      preludeCm > 0 &&
      preludeMaxCc != null &&
      stats.criticalChance < preludeMaxCc
    ) {
      stats.criticalMultiplier =
        quantizeBaseCritMultiplier(evolvedBaseCM + preludeCm) * (1 + critMultBonus);
      if (critMultFlatBonus.critEventBonus > 0) {
        stats.criticalMultiplier += critMultFlatBonus.critEventBonus;
      }
    }

    // Steadfast Grit: ×N Critical Damage after mods (shield/Overguard-break paper uptime)
    const cmMultiply = incarnonStatChanges.critMultMultiply ?? 1;
    if (cmMultiply !== 1) {
      stats.criticalMultiplier *= cmMultiply;
    }
  }

  // Tek 4-set: +60% damage vs marked enemies (primary-style weapons; optional sim)
  const tekPieces = linkage
    ? countTekSetPieces(linkage, equippedMods)
    : countTekSetPieces(undefined, equippedMods) + (sim.extraTekSetPiecesOffWeapon ?? 0);
  if (tekPieces >= 4 && sim.applyTekSetVsMarkedDamage && weaponSupportsPrimaryStyleSets(baseWeapon)) {
    const tm = 1.6;
    stats.tekSetVsMarkedDamageMultiplier = tm;
    stats.impact *= tm;
    stats.puncture *= tm;
    stats.slash *= tm;
    for (const e of stats.elements) e.value *= tm;
    for (const e of stats.rawElements) e.value *= tm;
    const physTek = stats.impact + stats.puncture + stats.slash;
    const eleTek = stats.elements.reduce((sum, e) => sum + e.value, 0);
    stats.totalDamage = physTek + eleTek;
  }

  // Snapshot arsenal-style display damage before quantization (the in-game arsenal
  // shows theoretical values; actual hits are quantized below).
  stats.arsenalDamage = {
    totalDamage: stats.totalDamage,
    impact: stats.impact,
    puncture: stats.puncture,
    slash: stats.slash,
    elements: stats.elements.map((e) => ({ ...e })),
  };

  // Quantize IPS + elements to nearest 1/32 of modded base damage (game network precision).
  const moddedBaseDamage = baseWeapon.damage * damageMultTotal;
  stats.moddedBaseDamage = moddedBaseDamage;
  quantizeStatsDamage(stats, moddedBaseDamage);

  // Melee-specific: combo system, heavy attacks, blood rush, weeping wounds, gladiator set
  if (isMelee) {
    stats.preComboCriticalChance = stats.criticalChance;
    stats.preComboStatusChance = stats.statusChance;
    const comboContext = {
      hasBloodRush,
      bloodRushValue,
      hasWeepingWounds,
      weepingWoundsValue,
      gladiatorCount,
    };
    stats.meleeComboModContext = comboContext;
    const effectiveCombo = resolveEffectiveComboCount(
      sim.comboCount,
      baseWeapon.id,
      equippedMods,
      allMods,
      stats.incarnonInitialCombo ?? 0,
    );
    applyMeleeComboToStats(
      stats,
      effectiveCombo,
      baseWeapon.id,
      comboContext,
      evolvedBaseCC,
      evolvedBaseSC,
    );
  }

  // Vigilante: +5% per equipped set mod to upgrade primary crit tier (not secondaries / melee)
  if (vigilanteCount > 0 && weaponSupportsPrimaryStyleSets(baseWeapon)) {
    stats.vigilanteCritBonus = 0.05 * vigilanteCount;
  }

  // Stance average damage mult (melee light attacks)
  if (isMelee && (sim.applyStanceMultiplier !== false)) {
    stats.stanceDamageMultiplier = resolveStanceDamageMultiplier(equippedMods);
  } else {
    stats.stanceDamageMultiplier = 1;
  }

  // Multishot-adjusted status chance (arsenal-style display).
  setStatusChancePerShot(stats, baseWeapon);

  // Status procs (DoT base = modded base × avg crit; Elementalist + faction² on ticks)
  stats.statusProcs = calculateStatusProcs(stats, moddedBaseDamage, sim);

  // Effective shots/sec after charge / bow / burst timing (wiki Fire Rate)
  stats.effectiveFireRate = resolveEffectiveFireRate({
    triggerType: baseWeapon.triggerType,
    baseFireRate: baseWeapon.fireRate,
    moddedFireRate: stats.fireRate,
    fireRateBonus: stats.fireRateBonus ?? 0,
    reloadTime: stats.reloadTime,
    chargeTime: baseWeapon.chargeTime,
    chargeMode: baseWeapon.chargeMode,
    burstCount: baseWeapon.burstCount,
    burstDelay: baseWeapon.burstDelay,
    weaponId: baseWeapon.id,
  });

  // DPS (direct hits) — includes optional faction / headshot / stance
  stats.burstDps = calculateBurstDps(stats);
  stats.sustainedDps = calculateSustainedDps(stats, baseWeapon);

  stats.setBonusSummary = buildWeaponSetBonusSummary(baseWeapon, equippedMods, linkage, sim);

  applyRadialAttacks(baseWeapon, stats, calcOptions?.incarnonFormActive === true);
  applyAbilityCloudDps(stats, calcOptions?.externalBuffs);

  return stats;
}

export function calculateWarframeBuild(
  warframe: Warframe,
  equippedMods: ModSlot[],
  allMods: Map<string, Mod>,
  linkage?: SetBonusLinkage,
): WarframeCalculatedStats {
  const stats: WarframeCalculatedStats = {
    baseHealth: warframe.health,
    baseShield: warframe.shield,
    baseArmor: warframe.armor,
    baseEnergy: getWarframeEnergyModBase(warframe),
    baseSprint: warframe.sprintSpeed,
    healthBonus: 0,
    shieldBonus: 0,
    armorBonus: 0,
    energyBonus: 0,
    sprintSpeedBonus: 0,
    slideSpeedBonus: 0,
    flowBonus: 0,
    flatHealthBonus: 0,
    flatShieldBonus: 0,
    flatArmorBonus: 0,
    flatEnergyBonus: 0,
    abilityStrength: 1.0,
    abilityDuration: 1.0,
    abilityEfficiency: 1.0,
    abilityRange: 1.0,
    totalHealth: warframe.health,
    totalShield: warframe.shield,
    totalArmor: warframe.armor,
    totalEnergy: getWarframeEnergyModBase(warframe),
    totalSprint: warframe.sprintSpeed,
    effectiveHealth: 0,
    damageReduction: 0,
    castingSpeedBonus: 0,
    parkourVelocityBonus: 0,
    healthRegenPerSec: 0,
    elementalResistance: 0,
    primaryShardBonus: 0,
    secondaryShardBonus: 0,
    meleeCritDamageBonus: 0,
    healingBonus: 0,
    statusDurationBonus: 0,
    energyCostReduction: 0,
  };

  const umbralCount = countUmbralSetPieces(equippedMods);

  const wfModAcc: WarframeModAccumulators = {
    healthBonus: 0,
    shieldBonus: 0,
    armorBonus: 0,
    energyBonus: 0,
    sprintSpeedBonus: 0,
    slideSpeedBonus: 0,
    flowBonus: 0,
    parkourVelocityBonus: 0,
    abilityStrength: 0,
    abilityDuration: 0,
    abilityEfficiency: 0,
    abilityRange: 0,
  };

  for (const modSlot of equippedMods) {
    const mod = allMods.get(modSlot.modId);
    if (!mod) continue;

    const rank = Math.min(Math.max(modSlot.rank ?? 0, 0), mod.maxRank);
    const multiplier = rank + 1;
    const isUmbral = UMBRAL_MOD_IDS.includes(modSlot.modId as (typeof UMBRAL_MOD_IDS)[number]);
    const umbralSetMult = isUmbral ? getUmbralSetBonusMultiplier(modSlot.modId, umbralCount) : 1;

    for (const [statName, value] of Object.entries(mod.stats)) {
      const setMult = isUmbral && statName === "tauResistance" ? 1 : umbralSetMult;
      const modValue = (value * multiplier * setMult) / 100.0;
      applyVerifiedModStatToWarframe(stats, modSlot.modId, statName, modValue, wfModAcc);
    }
  }

  stats.healthBonus = wfModAcc.healthBonus;
  stats.shieldBonus = wfModAcc.shieldBonus;
  stats.armorBonus = wfModAcc.armorBonus;
  stats.energyBonus = wfModAcc.energyBonus;
  stats.sprintSpeedBonus = wfModAcc.sprintSpeedBonus;
  stats.slideSpeedBonus = wfModAcc.slideSpeedBonus;
  stats.flowBonus = wfModAcc.flowBonus;
  stats.parkourVelocityBonus = wfModAcc.parkourVelocityBonus;
  stats.abilityStrength = 1.0 + wfModAcc.abilityStrength;
  stats.abilityDuration = 1.0 + wfModAcc.abilityDuration;
  stats.abilityEfficiency = 1.0 + wfModAcc.abilityEfficiency;
  stats.abilityRange = 1.0 + wfModAcc.abilityRange;

  // Cross-slot movement speed from equipped weapons (Amalgam Serration sprint, etc.)
  if (linkage) {
    stats.slideSpeedBonus += sumSlideSpeedBonusFromModSlots(linkage.primaryMods, allMods);
    stats.slideSpeedBonus += sumSlideSpeedBonusFromModSlots(linkage.secondaryMods, allMods);
    stats.slideSpeedBonus += sumSlideSpeedBonusFromModSlots(linkage.meleeMods, allMods);
    stats.sprintSpeedBonus += sumSprintSpeedBonusFromModSlots(linkage.primaryMods, allMods);
    stats.sprintSpeedBonus += sumSprintSpeedBonusFromModSlots(linkage.secondaryMods, allMods);
    stats.sprintSpeedBonus += sumSprintSpeedBonusFromModSlots(linkage.meleeMods, allMods);
  }

  // Calculate derived stats
  stats.totalHealth = stats.baseHealth * (1 + stats.healthBonus);
  stats.totalShield = stats.baseShield * (1 + stats.shieldBonus);
  stats.totalArmor = stats.baseArmor * (1 + stats.armorBonus);
  stats.totalEnergy = stats.baseEnergy * (1 + stats.energyBonus + stats.flowBonus);
  stats.totalSprint = stats.baseSprint * (1 + stats.sprintSpeedBonus);

  // EHP = health / (1 - DR) + shields, where DR = armor / (armor + 300)
  const armorDR = stats.totalArmor / (stats.totalArmor + 300);
  stats.effectiveHealth = (stats.totalHealth / (1 - armorDR)) + stats.totalShield;
  stats.damageReduction = armorDR * 100;

  stats.setBonusSummary = buildWarframeSetBonusSummary(equippedMods, linkage);
  const aug = stats.setBonusSummary.find((s) => s.setId === "augur");
  const hun = stats.setBonusSummary.find((s) => s.setId === "hunter");
  // wiki Augur Set: +40% energy→shields per piece; Hunter Set: +25% companion dmg per piece
  stats.augurEnergyToShieldsPercent = (aug?.pieces ?? 0) * 40;
  stats.hunterCompanionVsStatusDamagePercent = (hun?.pieces ?? 0) * 25;

  if (equippedMods.some((s) => s.modId === "adaptation")) {
    stats.adaptationNoteMaxTypedDRPercent = 90;
  }

  return stats;
}

/** Adaptation: +10% typed resistance per stack when hit, max 9 stacks (90%). */
export const ADAPTATION_MAX_STACKS = 9;
export const ADAPTATION_DR_PER_STACK = 0.1;

/** Multiplicative armor DR + typed Adaptation resistance vs one adapted damage type. */
export function computeAdaptationSurvivability(
  effectiveHealth: number,
  armorDRFraction: number,
  stacks: number,
): { typedDRPercent: number; combinedDRPercent: number; adaptedEHP: number } {
  const cappedStacks = Math.min(Math.max(Math.round(stacks), 0), ADAPTATION_MAX_STACKS);
  const typedDR = cappedStacks * ADAPTATION_DR_PER_STACK;
  const armorMult = 1 - Math.min(Math.max(armorDRFraction, 0), 0.99);
  const combinedMult = armorMult * (1 - typedDR);
  const combinedDRPercent = (1 - combinedMult) * 100;
  const adaptedEHP = typedDR < 1 ? effectiveHealth / (1 - typedDR) : effectiveHealth;
  return { typedDRPercent: typedDR * 100, combinedDRPercent, adaptedEHP };
}

/** Multishot-adjusted status chance (arsenal-style). Beams skip pellet aggregation. */
function setStatusChancePerShot(stats: CalculatedStats, baseWeapon: Weapon): void {
  const pRaw = Math.min(1, Math.max(0, stats.statusChance));
  let pDisp = pRaw;
  if (baseWeapon.kitgunChamberCategory) {
    pDisp = Math.floor(pRaw * 10000 + 1e-12) / 10000;
  }
  const ms = stats.multishot;
  if (baseWeapon.kitgunChamberCategory === "beam") {
    stats.statusChancePerShot = pDisp;
  } else if (ms > 1.0001) {
    stats.statusChancePerShot = 1 - Math.pow(1 - pDisp, ms);
  } else {
    stats.statusChancePerShot = pDisp;
  }
}

/**
 * Weapon arcanes: stacking arcanes use sim stack count; static arcanes apply once when sim > 0.
 */
function effectiveWeaponArcaneStacks(arcane: Mod, simStacks: number): number {
  const def = getArcaneEffectDef(arcane.id);
  if (def) return effectiveArcaneStacks(def, simStacks, true);
  if (simStacks <= 0) return 0;
  const desc = arcane.description.toLowerCase();
  if (!desc.includes('stack')) return 1;
  const capMatch = desc.match(/max(?:imum)? (\d+)|stacks? up to (\d+)x/);
  const cap = capMatch ? parseInt(capMatch[1] ?? capMatch[2], 10) : arcane.maxRank + 1;
  return Math.min(simStacks, cap);
}

// Apply arcane stats to weapon — reads from ARCANE_EFFECTS (generated wiki data).
export function applyArcaneToWeapon(stats: CalculatedStats, arcane: Mod, stacks: number = 1, baseWeapon?: Weapon): void {
  applyArcaneToWeaponFromMod(stats, arcane, stacks, baseWeapon);
}

// Apply arcane stats to warframe — reads from ARCANE_EFFECTS (generated wiki data).
export function applyArcaneToWarframe(
  stats: WarframeCalculatedStats,
  arcane: Mod,
  stacks: number = 1,
  rank?: number,
): void {
  const ctx = {
    totalHealth: stats.baseHealth * (1 + stats.healthBonus) + stats.flatHealthBonus,
    totalShield: stats.baseShield * (1 + stats.shieldBonus) + stats.flatShieldBonus,
    totalArmor: stats.baseArmor * (1 + stats.armorBonus) + stats.flatArmorBonus,
  };
  applyArcaneToWarframeFromMod(stats, arcane, stacks, rank, ctx);
}

/**
 * Apply archon shards + warframe arcanes on top of `calculateWarframeBuild` output,
 * then recompute derived totals (health/shield/armor/energy/sprint, Persistence,
 * EHP/DR). Shared by the warframe builder and loadout stats so both screens
 * always show the same numbers for the same build.
 */
export function applyWarframeShardsAndArcanes(
  stats: WarframeCalculatedStats,
  shards?: (EquippedArchonShard | null)[],
  arcanes?: (Mod | null)[],
  arcaneRanks?: number[],
): WarframeCalculatedStats {
  for (const shard of shards ?? []) {
    if (!shard) continue;
    const bonusKey = shard.selectedBonus;
    const bonusValue = shard.bonusValue;
    switch (bonusKey) {
      // Flat bonuses (Azure health/shield/energy, Topaz armor)
      case 'health':
        stats.flatHealthBonus += bonusValue;
        break;
      case 'shield':
        stats.flatShieldBonus += bonusValue;
        break;
      case 'armor':
        stats.flatArmorBonus += bonusValue;
        break;
      case 'energyMax':
        stats.flatEnergyBonus += bonusValue;
        break;
      // Percentage bonuses (Crimson, Violet)
      case 'abilityStrength':
        stats.abilityStrength += bonusValue / 100;
        break;
      case 'abilityDuration':
        stats.abilityDuration += bonusValue / 100;
        break;
      case 'abilityEfficiency':
        stats.abilityEfficiency += bonusValue / 100;
        break;
      case 'abilityRange':
        stats.abilityRange += bonusValue / 100;
        break;
      // Amber
      case 'sprintSpeed':
        stats.sprintSpeedBonus += bonusValue / 100;
        break;
      case 'castingSpeed':
        stats.castingSpeedBonus += bonusValue;
        break;
      case 'parkourVelocity':
        stats.parkourVelocityBonus += bonusValue;
        break;
      case 'startingEnergy':
      case 'healthOrbEffectiveness':
      case 'energyOrbEffectiveness':
        break;
      // Azure
      case 'healthRegen':
        stats.healthRegenPerSec += bonusValue;
        break;
      // Crimson weapon bonuses (display only on warframe, applied via weapon builder)
      case 'meleeCritDamage':
      case 'meleeCritDamageEnergy':
        stats.meleeCritDamageBonus += bonusValue;
        break;
      case 'primaryStatusChance':
        stats.primaryShardBonus += bonusValue;
        break;
      case 'secondaryCritChance':
        stats.secondaryShardBonus += bonusValue;
        break;
      // Violet
      case 'abilityDamageElectricity':
      case 'abilityDamageRadiation':
      case 'abilityDamageCorrosion':
        break;
      case 'primaryElectricityDamage':
      case 'orbConversion':
        break;
      // Topaz (all conditional/on-kill)
      case 'blastKillHealth':
      case 'blastKillShields':
      case 'heatKillSecondaryCrit':
        break;
      // Emerald (conditional)
      case 'toxinStatusDamage':
        stats.statusDurationBonus += bonusValue;
        break;
      case 'toxinHealthRecovery':
      case 'corrosionMaxStacks':
        break;
    }
  }

  const arcaneList = arcanes ?? [];
  for (let i = 0; i < arcaneList.length; i++) {
    const arcane = arcaneList[i];
    if (arcane) applyArcaneToWarframe(stats, arcane, 1, arcaneRanks?.[i] ?? arcane.maxRank);
  }

  // Recalculate derived stats after shard + arcane bonuses (flat shards add after percentage scaling)
  stats.totalHealth = stats.baseHealth * (1 + stats.healthBonus) + stats.flatHealthBonus;
  stats.totalShield = stats.baseShield * (1 + stats.shieldBonus) + stats.flatShieldBonus;
  stats.totalArmor = stats.baseArmor * (1 + stats.armorBonus) + stats.flatArmorBonus;
  stats.totalEnergy = stats.baseEnergy * (1 + stats.energyBonus + stats.flowBonus) + stats.flatEnergyBonus;
  stats.totalSprint = stats.baseSprint * (1 + stats.sprintSpeedBonus);
  if (stats.shieldsNullifiedByPersistence) {
    stats.totalShield = 0;
  }
  if (stats.persistenceDamageCapPerSecond != null) {
    stats.persistenceActive = stats.totalArmor >= 700;
  }
  const armorDR = stats.totalArmor / (stats.totalArmor + 300);
  stats.effectiveHealth = (stats.totalHealth / (1 - armorDR)) + stats.totalShield;
  stats.damageReduction = armorDR * 100;

  return stats;
}

// Calculate weapon build with optional arcanes (enhanced version)
export function calculateWeaponBuildWithArcanes(
  rawWeapon: Weapon,
  equippedMods: ModSlot[],
  allMods: Map<string, Mod>,
  arcanes: Mod[],
  incarnonStatChanges?: Record<string, number>,
  simParams?: SimulationParams,
  calcOptions?: WeaponCalculationOptions,
  linkage?: SetBonusLinkage,
  rivenStatChanges?: Record<string, number>,
): CalculatedStats {
  const baseWeapon = enrichWeapon(rawWeapon);
  const sim = simParams || DEFAULT_SIM_PARAMS;
  const isMelee = baseWeapon.category === 'melee' || baseWeapon.triggerType === 'Melee';
  const stats = calculateWeaponBuild(baseWeapon, equippedMods, allMods, incarnonStatChanges, sim, calcOptions, linkage, rivenStatChanges);
  const preArcaneHeavy = stats.heavyAttackDamage;
  const preArcaneCombo = stats.comboCount;
  for (const arcane of arcanes) {
    applyArcaneToWeapon(stats, arcane, effectiveWeaponArcaneStacks(arcane, sim.arcaneStacks), baseWeapon);
  }
  if (isMelee && stats.meleeComboModContext && stats.comboCount !== preArcaneCombo) {
    const arcaneHeavyFactor = preArcaneHeavy > 0 ? stats.heavyAttackDamage / preArcaneHeavy : 1;
    applyMeleeComboToStats(
      stats,
      stats.comboCount,
      baseWeapon.id,
      stats.meleeComboModContext,
      baseWeapon.criticalChance + (incarnonStatChanges?.criticalChance ?? 0),
      baseWeapon.statusChance + (incarnonStatChanges?.statusChance ?? 0),
    );
    if (arcaneHeavyFactor !== 1) {
      stats.heavyAttackDamage *= arcaneHeavyFactor;
    }
  }
  setStatusChancePerShot(stats, baseWeapon);
  stats.effectiveFireRate = resolveEffectiveFireRate({
    triggerType: baseWeapon.triggerType,
    baseFireRate: baseWeapon.fireRate,
    moddedFireRate: stats.fireRate,
    fireRateBonus: stats.fireRateBonus ?? 0,
    reloadTime: stats.reloadTime,
    chargeTime: baseWeapon.chargeTime,
    chargeMode: baseWeapon.chargeMode,
    burstCount: baseWeapon.burstCount,
    burstDelay: baseWeapon.burstDelay,
    weaponId: baseWeapon.id,
  });
  stats.burstDps = calculateBurstDps(stats);
  stats.sustainedDps = calculateSustainedDps(stats, baseWeapon);
  applyRadialAttacks(baseWeapon, stats, calcOptions?.incarnonFormActive === true);
  applyAbilityCloudDps(stats, calcOptions?.externalBuffs);
  return stats;
}

/** Shots per second used for DPS (charge/bow/burst-aware). */
function dpsFireRate(stats: CalculatedStats): number {
  const efr = stats.effectiveFireRate;
  if (efr != null && efr > 0) return efr;
  return Math.max(0, stats.fireRate);
}

function calculateBurstDps(stats: CalculatedStats): number {
  // Vigilante set: chance per hit to upgrade the crit tier by one. Average
  // damage is linear in crit chance across tiers, so this is exactly +v CC.
  const effectiveCritChance = stats.criticalChance + (stats.vigilanteCritBonus ?? 0);
  let avgCrit = avgCritMultiplier(effectiveCritChance, stats.criticalMultiplier);
  // Devouring/Devastating Attrition: non-crit hits average +bonus damage.
  // Only the non-crit fraction of hits benefits; at ≥100% CC there are none.
  const nonCritFraction = Math.max(0, 1 - effectiveCritChance);
  avgCrit += nonCritFraction * (stats.devouringAttritionBonus ?? 0);
  const sim = stats.simParams ?? DEFAULT_SIM_PARAMS;
  const factionBonus = factionBonusFromStats(stats.factionBonuses, sim.targetFaction);
  const combatMult = combatDamageMultiplier({
    factionBonus,
    applyHeadshots: sim.applyHeadshots,
    headshotDamageBonus: stats.headshotDamageBonus ?? 0,
    stanceMultiplier:
      sim.applyStanceMultiplier === false ? 1 : (stats.stanceDamageMultiplier ?? 1),
  });
  // Charged/Primed Chamber: first shot of each magazine deals bonus damage →
  // average multiplier over a full magazine is 1 + bonus / magazine.
  const firstShotMult =
    (stats.firstShotDamageBonus ?? 0) > 0 && stats.magazine > 0
      ? 1 + (stats.firstShotDamageBonus ?? 0) / stats.magazine
      : 1;
  const totalDamage = stats.totalDamage * stats.multishot * combatMult * firstShotMult;
  // Wiki Extra Hit: faction applies again on the Extra Hit instance (second dip).
  const factionHit = factionHitMultiplier(factionBonus);
  const frac = stats.extraHitDamageFraction ?? 0;
  const instances = Math.max(1, stats.extraHitInstances ?? 1);
  const extraHitMult = 1 + frac * factionHit * instances;
  return totalDamage * dpsFireRate(stats) * avgCrit * extraHitMult;
}

function calculateSustainedDps(stats: CalculatedStats, baseWeapon?: Weapon): number {
  if (stats.magazine === 0) return calculateBurstDps(stats); // Melee
  const efr = dpsFireRate(stats);
  if (efr <= 0) return 0;
  const burstDps = calculateBurstDps(stats);
  // Bow cycle already includes reload in effective FR — don't double-count.
  if (baseWeapon?.chargeMode === "bow" || baseWeapon?.triggerType === "Bow") {
    return burstDps;
  }
  // Ammo Efficiency: expected ammo per shot = 1 − AE → longer mag before reload.
  const ae = Math.min(Math.max(stats.ammoEfficiency ?? 0, 0), 1);
  if (ae >= 0.99) return burstDps;
  const ammoPerShot = 1 - ae;
  const magTime = stats.magazine / (ammoPerShot * efr);
  const cycleTime = magTime + stats.reloadTime;
  if (cycleTime <= 0) return burstDps;
  return burstDps * (magTime / cycleTime);
}
