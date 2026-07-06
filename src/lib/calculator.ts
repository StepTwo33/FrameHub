// Advanced Build Calculator - ported from Dart with elemental combos, status procs, heavy attacks
import { Mod, Weapon, Warframe, ModSlot, CalculatedStats, WarframeCalculatedStats, ElementalDamage, StatusProc, SimulationParams, DEFAULT_SIM_PARAMS, WeaponCalculationOptions, SetBonusLinkage, EquippedArchonShard, WeaponRadialAttack } from './types';
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
/** Combo elements that can be added directly by mods (no further combining). */
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
  return result;
}

function findCombo(a: string, b: string): string | null {
  for (const [combo, { a: ea, b: eb }] of Object.entries(ELEMENTAL_COMBOS)) {
    if ((a === ea && b === eb) || (a === eb && b === ea)) return combo;
  }
  return null;
}

// ── Status Proc Calculations ────────────────────────────────────────────
const STATUS_INFO: Record<string, { duration: number; ticks: number; desc: string }> = {
  impact:      { duration: 1, ticks: 1, desc: 'Stagger' },
  puncture:    { duration: 6, ticks: 1, desc: '-30% damage dealt' },
  // DoTs tick immediately plus once per second for 6s = 7 ticks over 6s
  slash:       { duration: 6, ticks: 7, desc: 'Bleed (True damage, bypasses armor)' },
  heat:        { duration: 6, ticks: 7, desc: 'Ignite (50% base damage/tick, panic)' },
  cold:        { duration: 6, ticks: 1, desc: '-50% movement/fire rate' },
  toxin:       { duration: 6, ticks: 7, desc: 'Poison (bypasses shields)' },
  electricity: { duration: 6, ticks: 1, desc: 'Chain stun to nearby enemies' },
  blast:       { duration: 6, ticks: 1, desc: 'Detonate: 30% base dmg/stack after 1.5s, AoE at 10 stacks' },
  corrosive:   { duration: 8, ticks: 1, desc: '-26% armor per stack (max 10)' },
  gas:         { duration: 6, ticks: 7, desc: 'Toxin AoE cloud' },
  magnetic:    { duration: 6, ticks: 1, desc: '-75% shields, +100% shield damage' },
  radiation:   { duration: 12, ticks: 1, desc: 'Confusion (friendly fire)' },
  viral:       { duration: 6, ticks: 1, desc: '+100% health damage per stack (max 10)' },
};

function calculateStatusProcs(stats: CalculatedStats, baseDamage: number): StatusProc[] {
  const allDamageTypes: { type: string; value: number }[] = [];
  if (stats.impact > 0) allDamageTypes.push({ type: 'impact', value: stats.impact });
  if (stats.puncture > 0) allDamageTypes.push({ type: 'puncture', value: stats.puncture });
  if (stats.slash > 0) allDamageTypes.push({ type: 'slash', value: stats.slash });
  for (const e of stats.elements) {
    if (e.value > 0) allDamageTypes.push({ type: e.type, value: e.value });
  }

  const totalDmg = allDamageTypes.reduce((sum, d) => sum + d.value, 0);
  if (totalDmg === 0) return [];

  return allDamageTypes.map(d => {
    const info = STATUS_INFO[d.type] || { duration: 6, ticks: 1, desc: 'Unknown' };
    const weight = d.value / totalDmg;
    const chance = stats.statusChance * weight;
    // DoT procs: slash = 35% base/tick, heat = 50% base/tick, toxin = 50% base/tick, gas = 50% base/tick
    let dpt = 0;
    if (['slash'].includes(d.type)) dpt = baseDamage * 0.35;
    else if (['heat', 'toxin', 'gas'].includes(d.type)) dpt = baseDamage * 0.50;
    return {
      type: d.type,
      chance,
      damagePerTick: dpt,
      duration: info.duration,
      ticks: info.ticks,
      totalDamage: dpt * info.ticks,
      description: info.desc,
    };
  });
}

// ── Set Bonus Detection ─────────────────────────────────────────────────
// Implemented: Umbral (×stats on Vit/Fiber/Int; Tau unscaled), Sacrificial (1.5× on both mods when 2),
// Gladiator (+10% crit/(CM−1) per piece + +15%/(CM−1) at 6 total w/ sim.wf pieces), Vigilante (5%/mod, primary only;
//   also counts Vigilante on linked Warframe or sim.extraVigilanteModsFromWarframe).
// Cross-slot: Synth 4pc +15% pistol reload; Tek 4pc optional ×1.6 vs marked (primary); loadout linkage in set-bonuses.ts.
// Warframe panel: Augur/Hunter/Mecha/Synth/Tek piece counts + Augur shields % / Hunter companion dmg % when complete.
// Not modeled in DPS: Augur shield sustain from casts, Hunter proc timing, Mecha explosion burst.
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

// ── Conditional Mod Detection ───────────────────────────────────────────
function isConditionalMod(modName: string): string | null {
  const n = modName.toLowerCase();
  if (n.includes('condition overload')) return 'condition_overload';
  if (n.includes('blood rush')) return 'blood_rush';
  if (n.includes('weeping wounds')) return 'weeping_wounds';
  if (n.includes('berserker fury')) return 'berserker_fury';
  if (n.includes('galvanized aptitude') || n.includes('galvanized savvy') || n.includes('galvanized shot')) return 'galvanized_condition';
  if (n.includes('galvanized chamber') || n.includes('galvanized hell') || n.includes('galvanized diffusion')) return 'galvanized_multishot';
  return null;
}

// ── Melee combo (current system, wiki: Melee Combo) ─────────────────────
// Blood Rush / Weeping Wounds / Gladiator use the "Melee Damage Multiplier" column.
// Legacy pre–Melee 3.0 steps (5→1.5x, 15→2x, …) are obsolete in-game.

function getMeleeScalingMultiplier(comboCount: number, weaponId?: string): number {
  if (weaponId === "venka_prime" && comboCount >= 240) return 4.0;
  if (comboCount < 20) return 1.0;
  if (comboCount < 40) return 1.25;
  if (comboCount < 60) return 1.5;
  if (comboCount < 80) return 1.75;
  if (comboCount < 100) return 2.0;
  if (comboCount < 120) return 2.25;
  if (comboCount < 140) return 2.5;
  if (comboCount < 160) return 2.75;
  if (comboCount < 180) return 3.0;
  if (comboCount < 200) return 3.25;
  if (comboCount < 220) return 3.5;
  return 3.75;
}

/** Heavy attacks use the "Heavy Attack Multiplier" column (2x at 20 hits, +1x per 20 to 12x at 220+). */
function getHeavyAttackComboMultiplier(comboCount: number, weaponId?: string): number {
  if (weaponId === "venka_prime" && comboCount >= 240) return 13.0;
  if (comboCount < 20) return 1.0;
  if (comboCount < 40) return 2.0;
  if (comboCount < 60) return 3.0;
  if (comboCount < 80) return 4.0;
  if (comboCount < 100) return 5.0;
  if (comboCount < 120) return 6.0;
  if (comboCount < 140) return 7.0;
  if (comboCount < 160) return 8.0;
  if (comboCount < 180) return 9.0;
  if (comboCount < 200) return 10.0;
  if (comboCount < 220) return 11.0;
  return 12.0;
}

const RADIAL_DAMAGE_KEYS = [
  'impact', 'puncture', 'slash', 'heat', 'cold', 'toxin', 'electricity',
  'radiation', 'viral', 'corrosive', 'blast', 'gas', 'magnetic',
] as const;

function scaleRadialAttacks(baseWeapon: Weapon, stats: CalculatedStats): void {
  const attacks = baseWeapon.radialAttacks;
  if (!attacks?.length || !baseWeapon.damage) return;

  const mult = stats.totalDamage / baseWeapon.damage;
  stats.radialAttacks = attacks.map((attack) => {
    const scaled: WeaponRadialAttack = {
      name: attack.name,
      radius: attack.radius,
      totalDamage: attack.totalDamage * mult,
    };
    if (attack.falloffReduction != null) scaled.falloffReduction = attack.falloffReduction;
    if (attack.explosionDelay != null) scaled.explosionDelay = attack.explosionDelay;
    for (const key of RADIAL_DAMAGE_KEYS) {
      const val = attack[key];
      if (val != null && val > 0) scaled[key] = val * mult;
    }
    return scaled;
  });
}

// ── Main Weapon Calculator ──────────────────────────────────────────────
export function calculateWeaponBuild(
  baseWeapon: Weapon,
  equippedMods: ModSlot[],
  allMods: Map<string, Mod>,
  incarnonStatChanges?: Record<string, number>,
  simParams?: SimulationParams,
  calcOptions?: WeaponCalculationOptions,
  linkage?: SetBonusLinkage,
  /** Riven stat fractions (1.2 = +120%); crit/status apply relative to the modded stat, unlike flat incarnon changes. */
  rivenStatChanges?: Record<string, number>,
): CalculatedStats {
  const sim = simParams || DEFAULT_SIM_PARAMS;
  const isMelee = baseWeapon.category === 'melee' || baseWeapon.triggerType === 'Melee';

  const stats: CalculatedStats = {
    totalDamage: baseWeapon.damage,
    impact: baseWeapon.impact,
    puncture: baseWeapon.puncture,
    slash: baseWeapon.slash,
    elements: [],
    rawElements: [],
    fireRate: baseWeapon.fireRate,
    criticalChance: baseWeapon.criticalChance,
    criticalMultiplier: baseWeapon.criticalMultiplier,
    statusChance: baseWeapon.statusChance,
    statusChancePerShot: baseWeapon.statusChance,
    magazine: baseWeapon.magazine,
    reloadTime: baseWeapon.reloadTime,
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
  const gladiatorCount = equippedMods.filter(s => GLADIATOR_MOD_IDS.includes(s.modId)).length + (sim.extraGladiatorMods || 0);
  const vigOnWeapon = equippedMods.filter((s) => vigilanteIdList.includes(s.modId)).length;
  const vigFromLinkedWf = linkage?.warframeMods?.filter((s) => vigilanteIdList.includes(s.modId)).length ?? 0;
  const vigFromSimFallback = linkage ? 0 : (sim.extraVigilanteModsFromWarframe ?? 0);
  const vigilanteCount = vigOnWeapon + vigFromLinkedWf + vigFromSimFallback;

  for (const modSlot of equippedMods) {
    const mod = allMods.get(modSlot.modId);
    if (!mod) continue;

    const rank = Math.min(Math.max(modSlot.rank ?? 0, 0), mod.maxRank);
    const multiplier = rank + 1;
    const conditional = isConditionalMod(mod.name);
    // Sacrificial set bonus: multiply mod values by (1 + setBonus)
    const setMult = SACRIFICIAL_MOD_IDS.includes(modSlot.modId) ? (1 + sacSetBonus) : 1;

    for (const [statName, value] of Object.entries(mod.stats)) {
      const modValue = (value * multiplier * setMult) / 100.0;

      if (BASE_ELEMENTS.includes(statName as typeof BASE_ELEMENTS[number])) {
        elementalMods.push({ type: statName, value: baseWeapon.damage * modValue });
      } else if (DIRECT_ELEMENT_MOD_STATS.includes(statName as typeof DIRECT_ELEMENT_MOD_STATS[number])) {
        elementalMods.push({ type: statName, value: baseWeapon.damage * modValue });
      } else if (conditional === 'blood_rush' && (statName === 'criticalChance' || statName === 'criticalChancePerCombo')) {
        hasBloodRush = true;
        bloodRushValue = modValue;
      } else if (conditional === 'condition_overload' && (statName === 'damage' || statName === 'damagePerStatus')) {
        hasConditionOverload = true;
        conditionOverloadPerStatus = modValue;
      } else if (conditional === 'weeping_wounds' && (statName === 'statusChance' || statName === 'statusChancePerCombo')) {
        hasWeepingWounds = true;
        weepingWoundsValue = modValue;
      } else if (conditional === 'berserker_fury' && statName === 'attackSpeed') {
        hasBerserkerFury = true;
        berserkerFuryPerStack = modValue;
      } else if (conditional === 'galvanized_multishot') {
        if (statName === 'multishot') {
          // Base multishot bonus (always active)
          multishotBonus += modValue;
        } else if (statName === 'multishotOnKill') {
          // Per-kill stack bonus
          galvMultishotOnKillPerStack = modValue;
        }
      } else if (conditional === 'galvanized_condition') {
        if (statName === 'statusChance') {
          // Base status chance bonus (always active)
          statusBonus += modValue;
        } else if (statName === 'damagePerStatus') {
          // Per-status-type damage bonus
          galvDamagePerStatusPerStack = modValue;
        }
      } else {
        switch (statName) {
          case 'damage': damageBonus += modValue; break;
          case 'criticalChance': critChanceBonus += modValue; break;
          case 'criticalMultiplier': critMultBonus += modValue; break;
          case 'fireRate': case 'attackSpeed': fireRateBonus += modValue; break;
          case 'multishot': multishotBonus += modValue; break;
          case 'statusChance': statusBonus += modValue; break;
          case 'magazine': magBonus += modValue; break;
          case 'reloadSpeed': reloadBonus += modValue; break;
          case 'comboDuration': stats.comboDuration += modValue; break;
          case 'heavyAttackEfficiency': stats.heavyAttackEfficiency += modValue; break;
          case 'impact': impactBonus += modValue; break;
          case 'puncture': punctureBonus += modValue; break;
          case 'slash': slashBonus += modValue; break;
        }
      }
    }
  }

  // Apply Condition Overload: multiplicative damage per status type on target
  if (hasConditionOverload && sim.statusTypesOnTarget > 0) {
    damageBonus += conditionOverloadPerStatus * sim.statusTypesOnTarget;
  }
  stats.conditionOverloadBonus = conditionOverloadPerStatus;

  // Apply Galvanized Condition (Aptitude/Savvy/Shot): damage per status on target per kill stack
  if (galvDamagePerStatusPerStack > 0 && sim.killStacks > 0 && sim.statusTypesOnTarget > 0) {
    damageBonus += galvDamagePerStatusPerStack * sim.killStacks * sim.statusTypesOnTarget;
  }
  stats.galvanizedDamagePerStatus = galvDamagePerStatusPerStack;

  // Apply Galvanized Multishot on-kill stacks
  if (galvMultishotOnKillPerStack > 0 && sim.killStacks > 0) {
    multishotBonus += galvMultishotOnKillPerStack * sim.killStacks;
  }
  stats.galvanizedMultishotOnKill = galvMultishotOnKillPerStack;

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
  stats.criticalChance *= (1 + critChanceBonus);
  stats.criticalMultiplier *= (1 + critMultBonus);
  stats.fireRate *= (1 + fireRateBonus);
  stats.multishot += multishotBonus;
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

  // Add innate weapon elements (kitgun chambers, Kuva/Tenet bonuses, etc.)
  // Innate elements go BEFORE mod elements in combo ordering
  const innateElemTypes = ['heat', 'cold', 'toxin', 'electricity', 'radiation', 'viral', 'corrosive', 'gas', 'magnetic', 'blast'] as const;
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
  elementalMods.unshift(...innateElements);

  // Resolve elemental combos
  stats.rawElements = elementalMods.map(e => ({ ...e }));
  stats.elements = resolveElementalCombos(elementalMods);

  // Recalculate totalDamage including elements
  const physicalDmg = stats.impact + stats.puncture + stats.slash;
  const elementalDmg = stats.elements.reduce((sum, e) => sum + e.value, 0);
  stats.totalDamage = physicalDmg + elementalDmg;

  // Apply Incarnon evolution / riven stat changes.
  // relativeCritStatus: riven crit/status/critMult bonuses are relative fractions on
  // the base stat (they join the mod bonus pool); apply them multiplicatively like
  // 'damage'. Incarnon crit/status changes are flat absolute adds (e.g. Devouring
  // Attrition criticalMultiplier: 2.5 = +2.5x crit damage), so they keep +=.
  const applyStatChanges = (changes: Record<string, number>, relativeCritStatus: boolean) => {
    for (const [stat, value] of Object.entries(changes)) {
      switch (stat) {
        case 'damage': stats.totalDamage *= (1 + value); stats.impact *= (1 + value); stats.puncture *= (1 + value); stats.slash *= (1 + value); break;
        case 'criticalChance':
          if (relativeCritStatus) stats.criticalChance *= (1 + value);
          else stats.criticalChance += value;
          break;
        case 'criticalMultiplier':
          if (relativeCritStatus) stats.criticalMultiplier *= (1 + value);
          else stats.criticalMultiplier += value;
          break;
        case 'statusChance':
          if (relativeCritStatus) stats.statusChance *= (1 + value);
          else stats.statusChance += value;
          break;
        case 'fireRate': stats.fireRate *= (1 + value); break;
        case 'multishot': stats.multishot += value; break;
        case 'magazine': stats.magazine = Math.round(stats.magazine * (1 + value)); break;
        case 'reloadSpeed': stats.reloadTime /= (1 + value); break;
        case 'heat': case 'cold': case 'toxin': case 'electricity':
          elementalMods.push({ type: stat, value: baseWeapon.damage * dmgMult * value });
          // Re-resolve elements with new additions
          stats.rawElements = elementalMods.map(e => ({ ...e }));
          stats.elements = resolveElementalCombos(elementalMods);
          break;
        // Physical damage type bonuses (from rivens)
        case 'impact': stats.impact *= (1 + value); break;
        case 'puncture': stats.puncture *= (1 + value); break;
        case 'slash': stats.slash *= (1 + value); break;
        // Melee-specific riven stats
        case 'range': /* melee range — visual only, no calc effect */ break;
        case 'slideAttack': /* slide attack bonus — visual only */ break;
        case 'finisherDamage': /* finisher bonus — visual only */ break;
        case 'comboDuration': stats.comboDuration += value; break;
        // Ranged-specific riven stats
        case 'projectileSpeed': /* visual only */ break;
        case 'zoom': /* visual only */ break;
        case 'punchThrough': /* visual only */ break;
        case 'ammoMax': /* visual only */ break;
        case 'recoil': /* visual only */ break;
      }
    }
    // Recalculate total damage after incarnon/riven changes
    const physDmg2 = stats.impact + stats.puncture + stats.slash;
    const eleDmg2 = stats.elements.reduce((sum, e) => sum + e.value, 0);
    stats.totalDamage = physDmg2 + eleDmg2;
  };
  if (incarnonStatChanges) applyStatChanges(incarnonStatChanges, false);
  if (rivenStatChanges) applyStatChanges(rivenStatChanges, true);

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

  // Melee-specific: combo system, heavy attacks, blood rush, weeping wounds, gladiator set
  if (isMelee) {
    stats.comboCount = sim.comboCount;
    stats.comboMultiplier = getMeleeScalingMultiplier(stats.comboCount, baseWeapon.id);
    stats.heavyAttackComboMultiplier = getHeavyAttackComboMultiplier(stats.comboCount, baseWeapon.id);

    // Blood Rush + Gladiator Set: additive with each other, multiplicative with modded crit
    // Wiki: Final CC = Modded CC × (1 + Blood Rush × (Melee Damage Multiplier − 1) + …)
    let comboScaling = 0;
    if (hasBloodRush) {
      stats.bloodRushStacks = bloodRushValue;
      comboScaling += bloodRushValue * (stats.comboMultiplier - 1);
    }
    // Per Gladiator piece: +10% crit per combo scaling tier; at 6 pieces +15% more (wiki full set).
    if (gladiatorCount > 0 && stats.comboMultiplier > 1) {
      let gladPerTier = 0.10 * gladiatorCount;
      if (gladiatorCount >= 6) gladPerTier += 0.15;
      comboScaling += gladPerTier * (stats.comboMultiplier - 1);
    }
    if (comboScaling > 0) {
      stats.criticalChance *= (1 + comboScaling);
    }

    // Weeping Wounds: +X% status chance per combo multiplier tier
    if (hasWeepingWounds) {
      stats.weepingWoundsBonus = weepingWoundsValue;
      stats.statusChance *= (1 + weepingWoundsValue * (stats.comboMultiplier - 1));
    }

    // Heavy attacks can crit: fold in the average crit multiplier
    stats.heavyAttackDamage = stats.totalDamage * stats.heavyAttackComboMultiplier
      * avgCritMultiplier(stats.criticalChance, stats.criticalMultiplier);
  }

  // Vigilante: +5% per equipped set mod to upgrade primary crit tier (not secondaries / melee)
  if (vigilanteCount > 0 && weaponSupportsPrimaryStyleSets(baseWeapon)) {
    stats.vigilanteCritBonus = 0.05 * vigilanteCount;
  }

  // Multishot-adjusted status chance (arsenal-style display).
  setStatusChancePerShot(stats, baseWeapon);

  // Status procs
  stats.statusProcs = calculateStatusProcs(stats, baseWeapon.damage * dmgMult);

  // DPS
  stats.burstDps = calculateBurstDps(stats);
  stats.sustainedDps = calculateSustainedDps(stats);

  stats.setBonusSummary = buildWeaponSetBonusSummary(baseWeapon, equippedMods, linkage, sim);

  scaleRadialAttacks(baseWeapon, stats);

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
      applyWarframeMod(stats, statName, modValue);
    }
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
  stats.augurEnergyToShieldsPercent = aug?.active ? 40 : 0;
  stats.hunterCompanionVsStatusDamagePercent = hun?.active ? 150 : 0;

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

function applyWarframeMod(stats: WarframeCalculatedStats, statName: string, value: number): void {
  switch (statName) {
    case 'health':
      stats.healthBonus += value;
      break;
    case 'shield':
      stats.shieldBonus += value;
      break;
    case 'armor':
      stats.armorBonus += value;
      break;
    case 'energy':
    case 'energyMax':
      stats.energyBonus += value;
      break;
    case 'abilityStrength':
      stats.abilityStrength += value;
      break;
    case 'abilityDuration':
      stats.abilityDuration += value;
      break;
    case 'abilityEfficiency':
      stats.abilityEfficiency += value;
      break;
    case 'abilityRange':
      stats.abilityRange += value;
      break;
    case 'sprintSpeed':
      stats.sprintSpeedBonus += value;
      break;
    case 'flow':
    case 'flowEnergyMax':
      stats.flowBonus += value;
      break;
    case 'parkourVelocity':
      stats.parkourVelocityBonus += value;
      break;
  }
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
  baseWeapon: Weapon,
  equippedMods: ModSlot[],
  allMods: Map<string, Mod>,
  arcanes: Mod[],
  incarnonStatChanges?: Record<string, number>,
  simParams?: SimulationParams,
  calcOptions?: WeaponCalculationOptions,
  linkage?: SetBonusLinkage,
  rivenStatChanges?: Record<string, number>,
): CalculatedStats {
  const sim = simParams || DEFAULT_SIM_PARAMS;
  const stats = calculateWeaponBuild(baseWeapon, equippedMods, allMods, incarnonStatChanges, sim, calcOptions, linkage, rivenStatChanges);
  for (const arcane of arcanes) {
    applyArcaneToWeapon(stats, arcane, effectiveWeaponArcaneStacks(arcane, sim.arcaneStacks), baseWeapon);
  }
  setStatusChancePerShot(stats, baseWeapon);
  stats.burstDps = calculateBurstDps(stats);
  stats.sustainedDps = calculateSustainedDps(stats);
  scaleRadialAttacks(baseWeapon, stats);
  return stats;
}

function critTierDamage(tier: number, critMultiplier: number): number {
  // Warframe crit tiers: yellow = cm, orange = 2(cm-1)+1, red = 3(cm-1)+1, etc.
  // General: tier_damage = tier × (cm - 1) + 1
  return tier * (critMultiplier - 1.0) + 1.0;
}

function avgCritMultiplier(critChance: number, critMultiplier: number): number {
  if (critChance <= 0) return 1.0;
  if (critChance <= 1.0) {
    // Blend between no-crit (1.0) and yellow crit
    return 1.0 + critChance * (critMultiplier - 1.0);
  }
  // For >100% crit, interpolate between current tier and next tier
  const tier = Math.floor(critChance);
  const remainder = critChance - tier;
  const currentTierDmg = critTierDamage(tier, critMultiplier);
  const nextTierDmg = critTierDamage(tier + 1, critMultiplier);
  return (1.0 - remainder) * currentTierDmg + remainder * nextTierDmg;
}

function calculateBurstDps(stats: CalculatedStats): number {
  const avgCrit = avgCritMultiplier(stats.criticalChance, stats.criticalMultiplier);
  const totalDamage = stats.totalDamage * stats.multishot;
  return totalDamage * stats.fireRate * avgCrit;
}

function calculateSustainedDps(stats: CalculatedStats): number {
  if (stats.magazine === 0) return calculateBurstDps(stats); // Melee
  if (stats.fireRate <= 0) return 0;
  const burstDps = calculateBurstDps(stats);
  const magTime = stats.magazine / stats.fireRate;
  const cycleTime = magTime + stats.reloadTime;
  if (cycleTime <= 0) return burstDps;
  return burstDps * (magTime / cycleTime);
}
