// Advanced Build Calculator - ported from Dart with elemental combos, status procs, heavy attacks
import { Mod, Weapon, Warframe, ModSlot, CalculatedStats, WarframeCalculatedStats, ElementalDamage, StatusProc, SimulationParams, DEFAULT_SIM_PARAMS } from './types';

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
  slash:       { duration: 6, ticks: 6, desc: 'Bleed (True damage, bypasses armor)' },
  heat:        { duration: 6, ticks: 6, desc: 'Ignite (50% base damage/tick, panic)' },
  cold:        { duration: 6, ticks: 1, desc: '-50% movement/fire rate' },
  toxin:       { duration: 6, ticks: 6, desc: 'Poison (bypasses shields)' },
  electricity: { duration: 6, ticks: 1, desc: 'Chain stun to nearby enemies' },
  blast:       { duration: 6, ticks: 1, desc: '-70% accuracy' },
  corrosive:   { duration: 8, ticks: 1, desc: '-26% armor per stack (max 10)' },
  gas:         { duration: 6, ticks: 6, desc: 'Toxin AoE cloud' },
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
const UMBRAL_MOD_IDS = ['umbra_vitality', 'umbra_fiber', 'umbra_intensify'];
const SACRIFICIAL_MOD_IDS = ['sacrificial_pressure', 'sacrificial_steel'];

// Umbral set bonus: modSetValues per WFCD
// Vitality/Fiber: [0.30, 0.80], Intensify: [0.25, 0.75]
// Index 0 = 2 mods equipped, Index 1 = 3 mods equipped
function getUmbralSetBonus(modId: string, umbralCount: number): number {
  if (umbralCount < 2) return 0;
  if (modId === 'umbra_intensify') {
    return umbralCount >= 3 ? 0.75 : 0.25;
  }
  // Vitality and Fiber
  return umbralCount >= 3 ? 0.80 : 0.30;
}

// Sacrificial set bonus: [0.25, 0.50]
function getSacrificialSetBonus(sacCount: number): number {
  if (sacCount < 2) return 0;
  return 0.50; // Only 2 mods exist, so max is index 1
}

// Gladiator set: +10% CC per combo multiplier per set mod equipped
// Works on melee only, stacks additively with Blood Rush
const GLADIATOR_MOD_IDS = [
  'gladiator_aegis', 'gladiator_finesse', 'gladiator_might',
  'gladiator_resolve', 'gladiator_rush', 'gladiator_vice',
];

// Vigilante set: +5% chance per mod to enhance crit tier on primary weapons
const VIGILANTE_MOD_IDS = [
  'vigilante_armaments', 'vigilante_fervor', 'vigilante_offense',
  'vigilante_pursuit', 'vigilante_supplies', 'vigilante_vigor',
];

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

// ── Heavy Attack / Combo ────────────────────────────────────────────────
function getComboMultiplier(comboCount: number): number {
  if (comboCount <= 0) return 1.0;
  if (comboCount < 5) return 1.0;
  if (comboCount < 15) return 1.5;
  if (comboCount < 45) return 2.0;
  if (comboCount < 135) return 2.5;
  if (comboCount < 245) return 3.0;
  return 3.5;
}

// ── Main Weapon Calculator ──────────────────────────────────────────────
export function calculateWeaponBuild(
  baseWeapon: Weapon,
  equippedMods: ModSlot[],
  allMods: Map<string, Mod>,
  incarnonStatChanges?: Record<string, number>,
  simParams?: SimulationParams,
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
  const vigilanteCount = equippedMods.filter(s => VIGILANTE_MOD_IDS.includes(s.modId)).length;

  for (const modSlot of equippedMods) {
    const mod = allMods.get(modSlot.modId);
    if (!mod) continue;

    const rank = Math.min(Math.max(modSlot.rank, 0), mod.maxRank);
    const multiplier = rank + 1;
    const conditional = isConditionalMod(mod.name);
    // Sacrificial set bonus: multiply mod values by (1 + setBonus)
    const setMult = SACRIFICIAL_MOD_IDS.includes(modSlot.modId) ? (1 + sacSetBonus) : 1;

    for (const [statName, value] of Object.entries(mod.stats)) {
      const modValue = (value * multiplier * setMult) / 100.0;

      if (BASE_ELEMENTS.includes(statName as typeof BASE_ELEMENTS[number])) {
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
          case 'impact': stats.impact *= (1 + modValue); break;
          case 'puncture': stats.puncture *= (1 + modValue); break;
          case 'slash': stats.slash *= (1 + modValue); break;
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

  // Apply damage bonus
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
  // Reload: positive bonus = faster, negative bonus = slower (Burdened Magazine etc.)
  if (reloadBonus !== 0) {
    if (reloadBonus > 0) stats.reloadTime /= (1 + reloadBonus);
    else stats.reloadTime *= (1 + Math.abs(reloadBonus));
  }

  // Resolve elemental combos
  stats.rawElements = elementalMods.map(e => ({ ...e }));
  stats.elements = resolveElementalCombos(elementalMods);

  // Recalculate totalDamage including elements
  const physicalDmg = stats.impact + stats.puncture + stats.slash;
  const elementalDmg = stats.elements.reduce((sum, e) => sum + e.value, 0);
  stats.totalDamage = physicalDmg + elementalDmg;

  // Apply Incarnon evolution stat changes
  if (incarnonStatChanges) {
    for (const [stat, value] of Object.entries(incarnonStatChanges)) {
      switch (stat) {
        case 'damage': stats.totalDamage *= (1 + value); stats.impact *= (1 + value); stats.puncture *= (1 + value); stats.slash *= (1 + value); break;
        case 'criticalChance': stats.criticalChance += value; break;
        case 'criticalMultiplier': stats.criticalMultiplier += value; break;
        case 'statusChance': stats.statusChance += value; break;
        case 'fireRate': stats.fireRate *= (1 + value); break;
        case 'multishot': stats.multishot += value; break;
        case 'magazine': stats.magazine = Math.round(stats.magazine * (1 + value)); break;
        case 'reloadSpeed': stats.reloadTime /= (1 + value); break;
        case 'heat': case 'cold': case 'toxin': case 'electricity':
          elementalMods.push({ type: stat, value: baseWeapon.damage * value });
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
  }

  // Melee-specific: combo system, heavy attacks, blood rush, weeping wounds, gladiator set
  if (isMelee) {
    stats.comboCount = sim.comboCount;
    stats.comboMultiplier = getComboMultiplier(stats.comboCount);

    // Blood Rush: +X% crit chance per combo multiplier tier
    if (hasBloodRush) {
      stats.bloodRushStacks = bloodRushValue;
      stats.criticalChance *= (1 + bloodRushValue * (stats.comboMultiplier - 1));
    }

    // Gladiator Set Bonus: +10% CC per combo multiplier per set mod equipped
    // Stacks additively with Blood Rush's combo scaling
    if (gladiatorCount > 0 && stats.comboMultiplier > 1) {
      const gladBonus = 0.10 * gladiatorCount * (stats.comboMultiplier - 1);
      stats.criticalChance *= (1 + gladBonus);
    }

    // Weeping Wounds: +X% status chance per combo multiplier tier
    if (hasWeepingWounds) {
      stats.weepingWoundsBonus = weepingWoundsValue;
      stats.statusChance *= (1 + weepingWoundsValue * (stats.comboMultiplier - 1));
    }

    stats.heavyAttackDamage = stats.totalDamage * stats.comboMultiplier * 2;
  }

  // Vigilante Set Bonus: +5% chance per mod to enhance crit tier (primary only)
  // Stored as vigilanteCritBonus for UI display — probabilistic, not a flat CC increase
  if (vigilanteCount > 0 && !isMelee) {
    stats.vigilanteCritBonus = 0.05 * vigilanteCount;
  }

  // Status procs
  stats.statusProcs = calculateStatusProcs(stats, baseWeapon.damage * dmgMult);

  // DPS
  stats.burstDps = calculateBurstDps(stats);
  stats.sustainedDps = calculateSustainedDps(stats);

  return stats;
}

function applyModStat(stats: CalculatedStats, statName: string, value: number): void {
  switch (statName) {
    case 'damage':
      stats.totalDamage *= (1 + value);
      stats.impact *= (1 + value);
      stats.puncture *= (1 + value);
      stats.slash *= (1 + value);
      break;
    case 'impact': stats.impact *= (1 + value); break;
    case 'puncture': stats.puncture *= (1 + value); break;
    case 'slash': stats.slash *= (1 + value); break;
    case 'criticalChance': stats.criticalChance *= (1 + value); break;
    case 'criticalMultiplier': stats.criticalMultiplier *= (1 + value); break;
    case 'fireRate': case 'attackSpeed': stats.fireRate *= (1 + value); break;
    case 'multishot': stats.multishot += value; break;
    case 'statusChance': stats.statusChance *= (1 + value); break;
    case 'magazine': stats.magazine = Math.round(stats.magazine * (1 + value)); break;
    case 'reloadSpeed': stats.reloadTime /= (1 + value); break;
    case 'heat': case 'cold': case 'toxin': case 'electricity':
      stats.totalDamage += stats.totalDamage * value;
      break;
  }
}

export function calculateWarframeBuild(
  warframe: Warframe,
  equippedMods: ModSlot[],
  allMods: Map<string, Mod>,
): WarframeCalculatedStats {
  const stats: WarframeCalculatedStats = {
    baseHealth: warframe.health,
    baseShield: warframe.shield,
    baseArmor: warframe.armor,
    baseEnergy: warframe.energy,
    baseSprint: warframe.sprintSpeed,
    healthBonus: 0,
    shieldBonus: 0,
    armorBonus: 0,
    energyBonus: 0,
    sprintSpeedBonus: 0,
    flowBonus: 0,
    abilityStrength: 1.0,
    abilityDuration: 1.0,
    abilityEfficiency: 1.0,
    abilityRange: 1.0,
    totalHealth: warframe.health,
    totalShield: warframe.shield,
    totalArmor: warframe.armor,
    totalEnergy: warframe.energy,
    totalSprint: warframe.sprintSpeed,
    effectiveHealth: 0,
    damageReduction: 0,
  };

  // Count Umbral set mods for set bonus
  const umbralCount = equippedMods.filter(s => UMBRAL_MOD_IDS.includes(s.modId)).length;

  for (const modSlot of equippedMods) {
    const mod = allMods.get(modSlot.modId);
    if (!mod) continue;

    const rank = Math.min(Math.max(modSlot.rank, 0), mod.maxRank);
    const multiplier = rank + 1;
    // Umbral set bonus: multiply mod values by (1 + setBonus)
    const setMult = UMBRAL_MOD_IDS.includes(modSlot.modId)
      ? (1 + getUmbralSetBonus(modSlot.modId, umbralCount))
      : 1;

    for (const [statName, value] of Object.entries(mod.stats)) {
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

  return stats;
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
  }
}

// Apply arcane stats to weapon
// stacks: number of active stacks (1 = base effect, higher = scaled)
export function applyArcaneToWeapon(stats: CalculatedStats, arcane: Mod, stacks: number = 1): void {
  if (stacks <= 0) return;
  for (const [stat, value] of Object.entries(arcane.stats)) {
    const scaled = (value * stacks) / 100;
    switch (stat) {
      case 'criticalChance':
        stats.criticalChance += scaled;
        break;
      case 'criticalMultiplier':
        stats.criticalMultiplier += scaled;
        break;
      case 'fireRate':
        stats.fireRate *= (1 + scaled);
        break;
      case 'damage':
        stats.totalDamage *= (1 + scaled);
        stats.impact *= (1 + scaled);
        stats.puncture *= (1 + scaled);
        stats.slash *= (1 + scaled);
        break;
      case 'multishot':
        stats.multishot += scaled;
        break;
      case 'statusChance':
        stats.statusChance += scaled;
        break;
      case 'reloadSpeed':
        if (scaled > 0) stats.reloadTime /= (1 + scaled);
        break;
    }
  }
}

// Apply arcane stats to warframe
export function applyArcaneToWarframe(stats: WarframeCalculatedStats, arcane: Mod, stacks: number = 1): void {
  if (stacks <= 0) return;
  for (const [stat, value] of Object.entries(arcane.stats)) {
    const scaled = (value * stacks) / 100;
    switch (stat) {
      case 'energyOrbBonus':
      case 'allyEnergy':
      case 'healthRegen':
      case 'healthRegenChance':
      case 'healthRegenAmount':
      case 'armorBonusChance':
      case 'shieldRegenChance':
      case 'shieldRegenAmount':
      case 'meleeDamageChance':
      case 'attackSpeedChance':
      case 'critChanceOnDamaged':
      case 'fireRateOnCrit':
        // Trigger-chance or non-calculable stats — not tracked in base stats
        break;
      case 'armorBonusAmount':
      case 'armor':
        stats.armorBonus += scaled;
        break;
      case 'abilityStrength':
        stats.abilityStrength += scaled;
        break;
      case 'flowEnergyMax':
        stats.flowBonus += scaled;
        break;
      case 'health':
        stats.healthBonus += scaled;
        break;
      case 'shield':
        stats.shieldBonus += scaled;
        break;
      case 'energy':
        stats.energyBonus += scaled;
        break;
      case 'sprintSpeedBonus':
      case 'sprintSpeed':
        stats.sprintSpeedBonus += scaled;
        break;
    }
  }
}

// Calculate weapon build with optional arcanes (enhanced version)
export function calculateWeaponBuildWithArcanes(
  baseWeapon: Weapon,
  equippedMods: ModSlot[],
  allMods: Map<string, Mod>,
  arcanes: Mod[],
  incarnonStatChanges?: Record<string, number>,
  simParams?: SimulationParams,
): CalculatedStats {
  const sim = simParams || DEFAULT_SIM_PARAMS;
  const stats = calculateWeaponBuild(baseWeapon, equippedMods, allMods, incarnonStatChanges, sim);
  for (const arcane of arcanes) {
    applyArcaneToWeapon(stats, arcane, sim.arcaneStacks);
  }
  stats.burstDps = calculateBurstDps(stats);
  stats.sustainedDps = calculateSustainedDps(stats);
  return stats;
}

function avgCritMultiplier(critChance: number, critMultiplier: number): number {
  if (critChance <= 0) return 1.0;
  if (critChance <= 1.0) {
    return 1.0 + critChance * (critMultiplier - 1.0);
  } else if (critChance <= 2.0) {
    const orangeChance = critChance - 1.0;
    return (1.0 - orangeChance) * critMultiplier + orangeChance * (2 * critMultiplier);
  } else if (critChance <= 3.0) {
    const redChance = critChance - 2.0;
    return (1.0 - redChance) * (2 * critMultiplier) + redChance * (3 * critMultiplier);
  } else {
    const tier = Math.floor(critChance);
    const remainder = critChance - tier;
    return (1.0 - remainder) * (tier * critMultiplier) + remainder * ((tier + 1) * critMultiplier);
  }
}

function calculateBurstDps(stats: CalculatedStats): number {
  const avgCrit = avgCritMultiplier(stats.criticalChance, stats.criticalMultiplier);
  const totalDamage = stats.totalDamage * stats.multishot;
  return totalDamage * stats.fireRate * avgCrit;
}

function calculateSustainedDps(stats: CalculatedStats): number {
  if (stats.magazine === 0) return calculateBurstDps(stats); // Melee
  const burstDps = calculateBurstDps(stats);
  const magTime = stats.magazine / stats.fireRate;
  const cycleTime = magTime + stats.reloadTime;
  return burstDps * (magTime / cycleTime);
}
