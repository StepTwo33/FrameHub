// Time-to-Kill Calculator
// Post-Update 32 S-curve scaling, proper armor/shield/health type interactions,
// Viral/Corrosive status accounting, Slash/Heat/Toxin DoT damage, reload cycles
import { CalculatedStats } from "./types";
import {
  combatDamageMultiplier,
  factionBonusFromStats,
  factionDotMultiplier,
} from "./combat-multipliers";

export interface EnemyType {
  id: string;
  name: string;
  faction: string;
  baseHealth: number;
  baseArmor: number;
  baseShield: number;
  healthType: string;
  armorType: string;
  shieldType: string;
}

export const ENEMY_TYPES: EnemyType[] = [
  // Grineer
  { id: "lancer", name: "Lancer", faction: "Grineer", baseHealth: 100, baseArmor: 100, baseShield: 0, healthType: "cloned_flesh", armorType: "ferrite", shieldType: "none" },
  { id: "elite_lancer", name: "Elite Lancer", faction: "Grineer", baseHealth: 150, baseArmor: 200, baseShield: 0, healthType: "cloned_flesh", armorType: "alloy", shieldType: "none" },
  { id: "heavy_gunner", name: "Heavy Gunner", faction: "Grineer", baseHealth: 700, baseArmor: 500, baseShield: 0, healthType: "cloned_flesh", armorType: "ferrite", shieldType: "none" },
  { id: "bombard", name: "Bombard", faction: "Grineer", baseHealth: 600, baseArmor: 400, baseShield: 0, healthType: "cloned_flesh", armorType: "alloy", shieldType: "none" },
  { id: "nox", name: "Nox", faction: "Grineer", baseHealth: 4000, baseArmor: 250, baseShield: 0, healthType: "cloned_flesh", armorType: "ferrite", shieldType: "none" },
  { id: "demolisher", name: "Demolisher", faction: "Grineer", baseHealth: 2000, baseArmor: 500, baseShield: 0, healthType: "cloned_flesh", armorType: "alloy", shieldType: "none" },
  // Corpus
  { id: "crewman", name: "Crewman", faction: "Corpus", baseHealth: 60, baseArmor: 0, baseShield: 150, healthType: "flesh", armorType: "none", shieldType: "shield" },
  { id: "tech", name: "Tech", faction: "Corpus", baseHealth: 200, baseArmor: 25, baseShield: 400, healthType: "flesh", armorType: "none", shieldType: "shield" },
  { id: "moa", name: "MOA", faction: "Corpus", baseHealth: 100, baseArmor: 50, baseShield: 200, healthType: "robotic", armorType: "none", shieldType: "shield" },
  { id: "nullifier", name: "Nullifier", faction: "Corpus", baseHealth: 100, baseArmor: 0, baseShield: 300, healthType: "flesh", armorType: "none", shieldType: "shield" },
  // Infested
  { id: "charger", name: "Charger", faction: "Infested", baseHealth: 80, baseArmor: 5, baseShield: 0, healthType: "infested", armorType: "none", shieldType: "none" },
  { id: "ancient_healer", name: "Ancient Healer", faction: "Infested", baseHealth: 400, baseArmor: 50, baseShield: 0, healthType: "fossilized", armorType: "none", shieldType: "none" },
  { id: "toxic_ancient", name: "Toxic Ancient", faction: "Infested", baseHealth: 400, baseArmor: 50, baseShield: 0, healthType: "fossilized", armorType: "none", shieldType: "none" },
  // Corrupted
  { id: "corrupted_heavy", name: "Corrupted Heavy Gunner", faction: "Corrupted", baseHealth: 700, baseArmor: 500, baseShield: 0, healthType: "cloned_flesh", armorType: "ferrite", shieldType: "none" },
  { id: "corrupted_bombard", name: "Corrupted Bombard", faction: "Corrupted", baseHealth: 600, baseArmor: 400, baseShield: 0, healthType: "cloned_flesh", armorType: "alloy", shieldType: "none" },
  // Special
  { id: "eximus_gunner", name: "Eximus Heavy Gunner", faction: "Grineer", baseHealth: 3500, baseArmor: 750, baseShield: 0, healthType: "cloned_flesh", armorType: "ferrite", shieldType: "none" },
  { id: "acolyte", name: "Acolyte", faction: "Stalker", baseHealth: 15000, baseArmor: 200, baseShield: 3000, healthType: "cloned_flesh", armorType: "ferrite", shieldType: "shield" },
];

// ── Type modifier tables ──────────────────────────────────────────────
export const HEALTH_MODIFIERS: Record<string, Record<string, number>> = {
  flesh:        { impact: -0.25, slash: 0.25, heat: 0.25, toxin: 0.5, viral: 0.5, gas: 0.5 },
  cloned_flesh: { impact: -0.25, slash: 0.25, heat: 0.25, viral: 0.75, gas: -0.50 },
  fossilized:   { slash: 0.15, cold: -0.25, toxin: -0.5, blast: 0.5, corrosive: 0.75, radiation: -0.25 },
  infested:     { slash: 0.25, heat: 0.25, gas: 0.75, radiation: -0.5 },
  infested_flesh: { slash: 0.5, heat: 0.5, gas: 0.5, corrosive: 0.75, viral: -0.5 },
  machinery:    { impact: 0.25, electricity: 0.5, toxin: -0.25, blast: 0.75, viral: -0.25 },
  robotic:      { puncture: 0.25, slash: -0.25, electricity: 0.5, toxin: -0.25, radiation: 0.25 },
  sinew:        { puncture: 0.25, slash: 0.25, blast: 0.5, gas: 0.25, corrosive: -0.25, viral: -0.5 },
};

export const ARMOR_MODIFIERS: Record<string, Record<string, number>> = {
  ferrite: { puncture: 0.5, slash: -0.15, toxin: 0.25, corrosive: 0.75, blast: -0.25 },
  alloy:   { puncture: 0.15, slash: -0.5, cold: 0.25, magnetic: -0.5, radiation: 0.75 },
};

export const SHIELD_MODIFIERS: Record<string, Record<string, number>> = {
  shield:       { impact: 0.5, puncture: -0.2, cold: 0.5, magnetic: 0.75, radiation: -0.25 },
  proto_shield: { impact: -0.15, puncture: -0.5, heat: -0.5, toxin: 0.25, magnetic: 0.75, corrosive: -0.5 },
};

export function getMod(table: Record<string, Record<string, number>>, key: string, dmgType: string): number {
  return table[key]?.[dmgType] ?? 0;
}

// ── Post-Update 32 S-curve scaling ────────────────────────────────────
export function scaleArmor(base: number, level: number): number {
  if (base <= 0) return 0;
  const d = level - 1;
  if (d <= 0) return Math.min(base, 2700);
  let s: number;
  if (d < 70) {
    s = base * (1 + 0.005 * Math.pow(d, 1.75));
  } else if (d > 80) {
    const a80 = base * (1 + 0.005 * Math.pow(80, 1.75));
    s = a80 + (d - 80) * 0.5;
  } else {
    const t = (d - 70) / 10;
    const sm = t * t * (3 - 2 * t);
    const lo = base * (1 + 0.005 * Math.pow(d, 1.75));
    const a80 = base * (1 + 0.005 * Math.pow(80, 1.75));
    const hi = a80 + (d - 80) * 0.5;
    s = lo * (1 - sm) + hi * sm;
  }
  return Math.max(base, Math.min(s, 2700));
}

export function scaleHealth(base: number, level: number, faction?: string): number {
  const d = level - 1;
  if (d <= 0) return base;
  const exp = faction?.toLowerCase() === "infested" ? 2.15 : 2.0;
  if (d < 70) return base * (1 + 0.015 * Math.pow(d, exp));
  if (d > 80) {
    const a80 = base * (1 + 0.015 * Math.pow(80, exp));
    return a80 * (1 + (d - 80) * 0.005);
  }
  const t = (d - 70) / 10;
  const sm = t * t * (3 - 2 * t);
  const lo = base * (1 + 0.015 * Math.pow(d, exp));
  const a80 = base * (1 + 0.015 * Math.pow(80, exp));
  const hi = a80 * (1 + (d - 80) * 0.005);
  return lo * (1 - sm) + hi * sm;
}

export function scaleShield(base: number, level: number): number {
  if (base <= 0 || level <= 1) return base;
  const d = level - 1;
  if (d < 70) return base * (1 + 0.0075 * Math.pow(d, 2));
  if (d > 80) {
    const a80 = base * (1 + 0.0075 * Math.pow(80, 2));
    return a80 * (1 + (d - 80) * 0.003);
  }
  const t = (d - 70) / 10;
  const sm = t * t * (3 - 2 * t);
  const lo = base * (1 + 0.0075 * Math.pow(d, 2));
  const a80 = base * (1 + 0.0075 * Math.pow(80, 2));
  const hi = a80 * (1 + (d - 80) * 0.003);
  return lo * (1 - sm) + hi * sm;
}

// ── Crit averaging (yellow / orange / red) ────────────────────────────
// Warframe crit tier damage: tier × (cm − 1) + 1 (yellow = cm, orange = 2(cm−1)+1, …)
export function avgCritMult(cc: number, cm: number): number {
  if (cc <= 0) return 1.0;
  if (cc <= 1.0) return 1.0 + cc * (cm - 1.0);
  const tier = Math.floor(cc);
  const rem = cc - tier;
  const currentTierDmg = tier * (cm - 1.0) + 1.0;
  const nextTierDmg = (tier + 1) * (cm - 1.0) + 1.0;
  return (1 - rem) * currentTierDmg + rem * nextTierDmg;
}

// ── Main TTK interface & calculator ───────────────────────────────────
export interface TTKResult {
  enemy: EnemyType;
  level: number;
  effectiveHealth: number;
  scaledArmor: number;
  scaledShield: number;
  scaledHealth: number;
  armorDR: number;
  burstDps: number;
  sustainedDps: number;
  ttk: number;
  shotsToKill: number;
}

export function calculateTTK(stats: CalculatedStats, enemy: EnemyType, level: number): TTKResult {
  const hp = scaleHealth(enemy.baseHealth, level, enemy.faction);
  let armor = scaleArmor(enemy.baseArmor, level);
  const shield = scaleShield(enemy.baseShield, level);

  // Collect all damage types from weapon stats
  const dmgTypes: { type: string; value: number }[] = [];
  if (stats.impact > 0) dmgTypes.push({ type: "impact", value: stats.impact });
  if (stats.puncture > 0) dmgTypes.push({ type: "puncture", value: stats.puncture });
  if (stats.slash > 0) dmgTypes.push({ type: "slash", value: stats.slash });
  if (stats.elements) {
    for (const e of stats.elements) {
      if (e.value > 0) dmgTypes.push({ type: e.type, value: e.value });
    }
  }

  const totalRaw = dmgTypes.reduce((s, d) => s + d.value, 0);
  const zero: TTKResult = {
    enemy, level, effectiveHealth: hp + shield, scaledArmor: armor,
    scaledShield: shield, scaledHealth: hp, armorDR: 0,
    burstDps: 0, sustainedDps: 0, ttk: Infinity, shotsToKill: Infinity,
  };
  if (totalRaw <= 0) return zero;

  // Status procs per second — arsenal-style per-shot chance aggregated across
  // pellets (setStatusChancePerShot in calculator.ts), with a local fallback.
  // Clamp inputs so riven curses can't produce negative proc rates.
  const multishot = Math.max(0, stats.multishot);
  const statusChance = Math.min(1, Math.max(0, stats.statusChance));
  const statusChancePerShot = stats.statusChancePerShot != null
    ? Math.min(1, Math.max(0, stats.statusChancePerShot))
    : multishot > 1.0001
      ? 1 - Math.pow(1 - statusChance, multishot)
      : statusChance;
  const procsPerSec = Math.max(0, stats.fireRate) * statusChancePerShot;

  // Corrosive armor strip: 26% per stack (multiplicative), max 10 stacks
  // Estimate average stacks during a ~3s engagement window
  const corrosiveDmg = dmgTypes.find((d) => d.type === "corrosive");
  if (corrosiveDmg && armor > 0 && procsPerSec > 0) {
    const corrosiveProcsPerSec = procsPerSec * (corrosiveDmg.value / totalRaw);
    const avgStacks = Math.min(10, corrosiveProcsPerSec * 3);
    armor *= Math.pow(0.74, avgStacks);
  }

  // Viral health multiplier: stack 1 = +100%, stacks 2-10 = +25% each (max 325%)
  let viralMult = 1.0;
  const viralDmg = dmgTypes.find((d) => d.type === "viral");
  if (viralDmg && procsPerSec > 0) {
    const viralProcsPerSec = procsPerSec * (viralDmg.value / totalRaw);
    const avgStacks = Math.min(10, viralProcsPerSec * 3);
    if (avgStacks >= 1) viralMult = 2.0 + Math.min(avgStacks - 1, 9) * 0.25;
  }

  const armorDR = armor > 0 ? armor / (armor + 300) : 0;

  // Effective damage ratio vs shields
  let shieldRatio = 0;
  if (shield > 0 && enemy.shieldType !== "none") {
    for (const d of dmgTypes) {
      shieldRatio += (d.value / totalRaw) * (1 + getMod(SHIELD_MODIFIERS, enemy.shieldType, d.type));
    }
  } else {
    shieldRatio = 1;
  }

  // Effective damage ratio vs health (through armor)
  let healthRatio = 0;
  for (const d of dmgTypes) {
    const hm = getMod(HEALTH_MODIFIERS, enemy.healthType, d.type);
    let typeDmg = (d.value / totalRaw) * (1 + hm);
    if (armor > 0 && enemy.armorType !== "none") {
      const am = getMod(ARMOR_MODIFIERS, enemy.armorType, d.type);
      const effArmor = armor * Math.max(0, 1 - am);
      const effDR = effArmor > 0 ? effArmor / (effArmor + 300) : 0;
      typeDmg *= (1 - effDR);
    }
    healthRatio += typeDmg;
  }
  healthRatio *= viralMult;

  // DoT DPS contributions (apply during health phase).
  // Per-proc tick base = modded base (Serration-style only) × avg crit.
  // Multishot is NOT in the tick — procsPerSec already uses multishot-aware
  // statusChancePerShot. Heat/Toxin/Elec/Gas then × (1 + type%).
  let dotDps = 0;
  const acm = avgCritMult(stats.criticalChance, stats.criticalMultiplier);
  const moddedBase =
    stats.moddedBaseDamage != null && stats.moddedBaseDamage > 0
      ? stats.moddedBaseDamage
      : totalRaw; // fallback when stats were built without calculator
  const sim = stats.simParams;
  const factionBonus = factionBonusFromStats(
    stats.factionBonuses,
    sim?.targetFaction ?? enemy.faction,
  );
  const factionDot = factionDotMultiplier(factionBonus);
  const statusDmg = 1 + (stats.statusDamageBonus ?? 0);
  const head =
    sim?.applyHeadshots ? 2 * (1 + (stats.headshotDamageBonus ?? 0)) : 1;
  const stance =
    sim?.applyStanceMultiplier === false ? 1 : (stats.stanceDamageMultiplier ?? 1);
  const combatMult = combatDamageMultiplier({
    factionBonus,
    applyHeadshots: sim?.applyHeadshots,
    headshotDamageBonus: stats.headshotDamageBonus ?? 0,
    stanceMultiplier: stance,
  });
  const dotBase = moddedBase * acm * statusDmg * factionDot * head;

  const typeBonus = (type: string): number => {
    const el = dmgTypes.find((d) => d.type === type);
    if (!el || moddedBase <= 0) return 0;
    return el.value / moddedBase;
  };

  // Slash DoT: 35% base/tick, 7 ticks over 6s, bypasses armor (True/cinematic)
  if (stats.slash > 0 && procsPerSec > 0) {
    const slashPPS = procsPerSec * (stats.slash / totalRaw);
    const tickDmg = dotBase * 0.35;
    const dpsPerProc = tickDmg * (7 / 6);
    const slashHM = getMod(HEALTH_MODIFIERS, enemy.healthType, "slash");
    dotDps += slashPPS * dpsPerProc * (1 + slashHM) * viralMult;
  }

  // Heat DoT: 50% × (1+heat%) base/tick, armor-affected
  const heatDmg = dmgTypes.find((d) => d.type === "heat");
  if (heatDmg && procsPerSec > 0) {
    const heatPPS = procsPerSec * (heatDmg.value / totalRaw);
    const tickDmg = dotBase * 0.5 * (1 + typeBonus("heat"));
    const dpsPerProc = tickDmg * (7 / 6);
    const heatHM = getMod(HEALTH_MODIFIERS, enemy.healthType, "heat");
    dotDps += heatPPS * dpsPerProc * (1 + heatHM) * (1 - armorDR);
  }

  // Toxin DoT: 50% × (1+toxin%) base/tick, armor-affected, bypasses shields
  const toxinDmg = dmgTypes.find((d) => d.type === "toxin");
  if (toxinDmg && procsPerSec > 0) {
    const toxinPPS = procsPerSec * (toxinDmg.value / totalRaw);
    const tickDmg = dotBase * 0.5 * (1 + typeBonus("toxin"));
    const dpsPerProc = tickDmg * (7 / 6);
    const toxinHM = getMod(HEALTH_MODIFIERS, enemy.healthType, "toxin");
    dotDps += toxinPPS * dpsPerProc * (1 + toxinHM) * (1 - armorDR);
  }

  // Electricity DoT: 50% × (1+elec%) base/tick, armor-affected
  const elecDmg = dmgTypes.find((d) => d.type === "electricity");
  if (elecDmg && procsPerSec > 0) {
    const elecPPS = procsPerSec * (elecDmg.value / totalRaw);
    const tickDmg = dotBase * 0.5 * (1 + typeBonus("electricity"));
    const dpsPerProc = tickDmg * (7 / 6);
    const elecHM = getMod(HEALTH_MODIFIERS, enemy.healthType, "electricity");
    dotDps += elecPPS * dpsPerProc * (1 + elecHM) * (1 - armorDR);
  }

  // Gas DoT cloud: 50% × (1+gas%) base/tick
  const gasDmg = dmgTypes.find((d) => d.type === "gas");
  if (gasDmg && procsPerSec > 0) {
    const gasPPS = procsPerSec * (gasDmg.value / totalRaw);
    const tickDmg = dotBase * 0.5 * (1 + typeBonus("gas"));
    const dpsPerProc = tickDmg * (7 / 6);
    const gasHM = getMod(HEALTH_MODIFIERS, enemy.healthType, "gas");
    // Gas cloud deals toxin-like damage; treat as armor-affected health damage
    dotDps += gasPPS * dpsPerProc * (1 + gasHM) * (1 - armorDR) * viralMult;
  }

  // Shot-level calculations (faction hit ×1; headshot/stance; DoTs use faction² via dotBase)
  const rawPerShot = totalRaw * multishot * acm * combatMult;
  const shieldPerShot = rawPerShot * shieldRatio;
  const healthPerShot = rawPerShot * healthRatio;

  // Burst DPS (no reload)
  const shieldBurstDps = shieldPerShot * stats.fireRate;
  const healthBurstDps = healthPerShot * stats.fireRate + dotDps;

  // Time through each layer
  const shieldTime = shield > 0 && shieldBurstDps > 0 ? shield / shieldBurstDps : 0;
  const healthTime = healthBurstDps > 0 ? hp / healthBurstDps : Infinity;
  let rawTTK = shieldTime + healthTime;

  // Reload cycles
  if (stats.magazine > 0 && stats.reloadTime > 0 && stats.fireRate > 0) {
    const magDur = stats.magazine / stats.fireRate;
    if (rawTTK > magDur) {
      const totalShots = rawTTK * stats.fireRate;
      const fullReloads = Math.floor(totalShots / stats.magazine);
      rawTTK += fullReloads * stats.reloadTime;
    }
  }

  // Sustained DPS factor
  const sustainFactor = stats.magazine > 0 && stats.reloadTime > 0 && stats.fireRate > 0
    ? (stats.magazine / stats.fireRate) / (stats.magazine / stats.fireRate + stats.reloadTime)
    : 1;

  // Shots to kill
  const stk = shieldPerShot > 0 && healthPerShot > 0
    ? Math.ceil(shield / shieldPerShot) + Math.ceil(hp / healthPerShot)
    : Infinity;

  return {
    enemy,
    level,
    effectiveHealth: hp + shield,
    scaledArmor: armor,
    scaledShield: shield,
    scaledHealth: hp,
    armorDR: armorDR * 100,
    burstDps: healthBurstDps,
    sustainedDps: healthBurstDps * sustainFactor,
    ttk: rawTTK,
    shotsToKill: Math.max(1, stk),
  };
}
