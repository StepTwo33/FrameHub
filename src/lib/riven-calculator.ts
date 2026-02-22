// Riven Calculator - ported from Flutter riven_calculator.dart

export interface RivenStat {
  name: string;
  type: string; // 'percent' | 'integer' | 'seconds'
  baseValue: number;
  minValue: number;
  maxValue: number;
}

export interface RivenMod {
  weaponName: string;
  polarity: string;
  rank: number; // 0-8
  rerolls: number;
  positiveStats: RivenStat[];
  negativeStat: RivenStat | null;
  disposition: number; // 0.5 to 1.55
}

export function formatRivenStatValue(stat: RivenStat): string {
  const value = Math.abs(stat.baseValue);
  if (stat.type === "percent") return `${value.toFixed(1)}%`;
  if (stat.type === "integer") return value.toFixed(0);
  if (stat.type === "seconds") return `${value.toFixed(1)}s`;
  return value.toFixed(2);
}

export function getRivenDrain(rank: number): number {
  return 10 + rank;
}

export function getEffectiveValue(stat: RivenStat, disposition: number): number {
  return stat.baseValue * disposition;
}

// ============================================================
// STAT POOLS (by weapon type)
// ============================================================
export function getRifleStats(): RivenStat[] {
  return [
    { name: "Damage", type: "percent", baseValue: 165.0, minValue: 100.0, maxValue: 220.0 },
    { name: "Multishot", type: "percent", baseValue: 120.0, minValue: 80.0, maxValue: 150.0 },
    { name: "Critical Chance", type: "percent", baseValue: 150.0, minValue: 90.0, maxValue: 200.0 },
    { name: "Critical Damage", type: "percent", baseValue: 120.0, minValue: 80.0, maxValue: 150.0 },
    { name: "Status Chance", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Fire Rate", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Magazine Capacity", type: "percent", baseValue: 50.0, minValue: 30.0, maxValue: 70.0 },
    { name: "Reload Speed", type: "percent", baseValue: 50.0, minValue: 30.0, maxValue: 70.0 },
    { name: "Ammo Maximum", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Zoom", type: "percent", baseValue: 80.0, minValue: 50.0, maxValue: 100.0 },
    { name: "Projectile Speed", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Punch Through", type: "integer", baseValue: 2.5, minValue: 1.0, maxValue: 4.0 },
    { name: "Recoil", type: "percent", baseValue: -60.0, minValue: -90.0, maxValue: -40.0 },
    { name: "Heat", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Cold", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Toxin", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Electricity", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
  ];
}

export function getMeleeStats(): RivenStat[] {
  return [
    { name: "Damage", type: "percent", baseValue: 165.0, minValue: 100.0, maxValue: 220.0 },
    { name: "Critical Chance", type: "percent", baseValue: 180.0, minValue: 110.0, maxValue: 240.0 },
    { name: "Critical Damage", type: "percent", baseValue: 120.0, minValue: 80.0, maxValue: 150.0 },
    { name: "Status Chance", type: "percent", baseValue: 120.0, minValue: 80.0, maxValue: 150.0 },
    { name: "Attack Speed", type: "percent", baseValue: 75.0, minValue: 50.0, maxValue: 100.0 },
    { name: "Range", type: "percent", baseValue: 130.0, minValue: 80.0, maxValue: 180.0 },
    { name: "Slide Attack", type: "percent", baseValue: 120.0, minValue: 80.0, maxValue: 150.0 },
    { name: "Finisher Damage", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Combo Duration", type: "seconds", baseValue: 12.0, minValue: 8.0, maxValue: 16.0 },
    { name: "Heat", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Cold", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Toxin", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Electricity", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
  ];
}

export function getShotgunStats(): RivenStat[] {
  return [
    { name: "Damage", type: "percent", baseValue: 165.0, minValue: 100.0, maxValue: 220.0 },
    { name: "Multishot", type: "percent", baseValue: 120.0, minValue: 80.0, maxValue: 150.0 },
    { name: "Critical Chance", type: "percent", baseValue: 150.0, minValue: 90.0, maxValue: 200.0 },
    { name: "Critical Damage", type: "percent", baseValue: 120.0, minValue: 80.0, maxValue: 150.0 },
    { name: "Status Chance", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Fire Rate", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Magazine Capacity", type: "percent", baseValue: 50.0, minValue: 30.0, maxValue: 70.0 },
    { name: "Reload Speed", type: "percent", baseValue: 50.0, minValue: 30.0, maxValue: 70.0 },
    { name: "Ammo Maximum", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Projectile Speed", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Heat", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Cold", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Toxin", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Electricity", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
  ];
}

export function getPistolStats(): RivenStat[] {
  return [
    { name: "Damage", type: "percent", baseValue: 165.0, minValue: 100.0, maxValue: 220.0 },
    { name: "Multishot", type: "percent", baseValue: 120.0, minValue: 80.0, maxValue: 150.0 },
    { name: "Critical Chance", type: "percent", baseValue: 150.0, minValue: 90.0, maxValue: 200.0 },
    { name: "Critical Damage", type: "percent", baseValue: 120.0, minValue: 80.0, maxValue: 150.0 },
    { name: "Status Chance", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Fire Rate", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Magazine Capacity", type: "percent", baseValue: 50.0, minValue: 30.0, maxValue: 70.0 },
    { name: "Reload Speed", type: "percent", baseValue: 50.0, minValue: 30.0, maxValue: 70.0 },
    { name: "Ammo Maximum", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Projectile Speed", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Zoom", type: "percent", baseValue: 80.0, minValue: 50.0, maxValue: 100.0 },
    { name: "Recoil", type: "percent", baseValue: -60.0, minValue: -90.0, maxValue: -40.0 },
    { name: "Heat", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Cold", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Toxin", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Electricity", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
  ];
}

export function getArchgunStats(): RivenStat[] {
  return [
    { name: "Damage", type: "percent", baseValue: 165.0, minValue: 100.0, maxValue: 220.0 },
    { name: "Multishot", type: "percent", baseValue: 120.0, minValue: 80.0, maxValue: 150.0 },
    { name: "Critical Chance", type: "percent", baseValue: 150.0, minValue: 90.0, maxValue: 200.0 },
    { name: "Critical Damage", type: "percent", baseValue: 120.0, minValue: 80.0, maxValue: 150.0 },
    { name: "Status Chance", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Fire Rate", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Magazine Capacity", type: "percent", baseValue: 50.0, minValue: 30.0, maxValue: 70.0 },
    { name: "Reload Speed", type: "percent", baseValue: 50.0, minValue: 30.0, maxValue: 70.0 },
    { name: "Projectile Speed", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Heat", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Cold", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Toxin", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
    { name: "Electricity", type: "percent", baseValue: 90.0, minValue: 60.0, maxValue: 120.0 },
  ];
}

export function getStatsForCategory(category: string): RivenStat[] {
  const cat = category.toLowerCase();
  if (cat === "melee") return getMeleeStats();
  if (cat === "shotgun") return getShotgunStats();
  if (cat === "pistol" || cat === "secondary") return getPistolStats();
  if (cat === "archgun") return getArchgunStats();
  return getRifleStats();
}

export function getStatsWithDisposition(category: string, disposition: number): RivenStat[] {
  return getStatsForCategory(category).map((stat) => ({
    ...stat,
    minValue: stat.minValue * 0.9 * disposition,
    maxValue: stat.maxValue * 1.1 * disposition,
  }));
}

export function getNegativeStats(): RivenStat[] {
  return [
    { name: "Damage", type: "percent", baseValue: -90.0, minValue: -120.0, maxValue: -60.0 },
    { name: "Multishot", type: "percent", baseValue: -60.0, minValue: -90.0, maxValue: -40.0 },
    { name: "Critical Chance", type: "percent", baseValue: -60.0, minValue: -90.0, maxValue: -40.0 },
    { name: "Critical Damage", type: "percent", baseValue: -60.0, minValue: -90.0, maxValue: -40.0 },
    { name: "Status Chance", type: "percent", baseValue: -60.0, minValue: -90.0, maxValue: -40.0 },
    { name: "Fire Rate", type: "percent", baseValue: -60.0, minValue: -90.0, maxValue: -40.0 },
    { name: "Magazine Capacity", type: "percent", baseValue: -50.0, minValue: -70.0, maxValue: -30.0 },
    { name: "Reload Speed", type: "percent", baseValue: -40.0, minValue: -60.0, maxValue: -25.0 },
    { name: "Ammo Maximum", type: "percent", baseValue: -60.0, minValue: -90.0, maxValue: -40.0 },
    { name: "Projectile Speed", type: "percent", baseValue: -80.0, minValue: -120.0, maxValue: -50.0 },
    { name: "Recoil", type: "percent", baseValue: 60.0, minValue: 40.0, maxValue: 90.0 },
    { name: "Attack Speed", type: "percent", baseValue: -30.0, minValue: -50.0, maxValue: -20.0 },
    { name: "Range", type: "percent", baseValue: -50.0, minValue: -70.0, maxValue: -35.0 },
    { name: "Slide Attack", type: "percent", baseValue: -40.0, minValue: -60.0, maxValue: -25.0 },
    { name: "Finisher Damage", type: "percent", baseValue: -40.0, minValue: -60.0, maxValue: -25.0 },
  ];
}

// ============================================================
// EVALUATOR - Grade rivens based on community standards
// ============================================================
const STAT_WEIGHTS: Record<string, number> = {
  "Damage": 1.0,
  "Multishot": 0.95,
  "Critical Chance": 0.95,
  "Critical Damage": 0.9,
  "Toxin": 0.85,
  "Heat": 0.8,
  "Cold": 0.8,
  "Electricity": 0.75,
  "Status Chance": 0.8,
  "Fire Rate": 0.7,
  "Attack Speed": 0.85,
  "Range": 0.6,
  "Slide Attack": 0.4,
  "Punch Through": 0.5,
  "Magazine Capacity": 0.4,
  "Reload Speed": 0.5,
  "Combo Duration": 0.45,
  "Finisher Damage": 0.3,
  "Zoom": 0.2,
  "Recoil": 0.15,
  "Ammo Maximum": 0.2,
  "Projectile Speed": 0.25,
};

const NEGATIVE_VALUES: Record<string, number> = {
  "Impact": 1.0,
  "Puncture": 0.95,
  "Zoom": 0.8,
  "Recoil": 0.7,
  "Ammo Maximum": 0.6,
  "Damage": 0.0,
  "Multishot": 0.0,
  "Critical Chance": 0.0,
  "Critical Damage": 0.0,
  "Status Chance": 0.1,
  "Fire Rate": 0.3,
  "Reload Speed": 0.4,
  "Magazine Capacity": 0.5,
};

export function evaluateRiven(riven: RivenMod): number {
  let score = 0;
  let greatStats = 0;

  for (const stat of riven.positiveStats) {
    const weight = STAT_WEIGHTS[stat.name] ?? 0.3;
    const value = Math.abs(stat.baseValue) / 100;

    let tierBonus = 0;
    if (weight >= 0.9) {
      tierBonus = 0.2;
      greatStats++;
    } else if (weight >= 0.7) {
      tierBonus = 0.1;
    }

    score += value * weight + tierBonus;
  }

  let negativeBonus = 0;
  if (riven.negativeStat) {
    const curseValue = NEGATIVE_VALUES[riven.negativeStat.name] ?? 0.3;
    if (curseValue >= 0.9) negativeBonus = 0.5;
    else if (curseValue >= 0.7) negativeBonus = 0.3;
    else if (curseValue >= 0.4) negativeBonus = 0.1;
    else negativeBonus = -0.3;
  }

  let godRollBonus = 0;
  if (greatStats >= 2 && negativeBonus >= 0.3) godRollBonus = 0.5;
  else if (greatStats >= 2) godRollBonus = 0.3;

  score *= riven.disposition;
  score += negativeBonus + godRollBonus;

  if (riven.rank < 8) {
    score *= 0.5 + riven.rank / 16;
  }

  return score;
}

export function getRivenGrade(score: number): string {
  if (score >= 4.5) return "God Roll";
  if (score >= 3.5) return "Excellent";
  if (score >= 2.5) return "Good";
  if (score >= 1.5) return "Average";
  if (score >= 0.8) return "Below Average";
  return "Reroll";
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case "God Roll": return "#FFD700";
    case "Excellent": return "#E91E63";
    case "Good": return "#9C27B0";
    case "Average": return "#2196F3";
    case "Below Average": return "#4CAF50";
    case "Reroll": return "#F44336";
    default: return "#9CA3AF";
  }
}

export function getStatTier(statName: string): string {
  const weight = STAT_WEIGHTS[statName] ?? 0.3;
  if (weight >= 0.9) return "GREAT";
  if (weight >= 0.7) return "Good";
  if (weight >= 0.4) return "Meh";
  return "Low";
}

export function getStatTierColor(tier: string): string {
  switch (tier) {
    case "GREAT": return "#FFD700";
    case "Good": return "#9C27B0";
    case "Meh": return "#2196F3";
    default: return "#9CA3AF";
  }
}

// ============================================================
// RIVEN GENERATION
// ============================================================
export function generateRandomRiven(
  weaponName: string,
  weaponType: string,
  disposition: number,
): RivenMod {
  const isMelee = weaponType.toLowerCase() === "melee";
  const positivePool = isMelee ? getMeleeStats() : getStatsForCategory(weaponType);
  const negativePool = getNegativeStats();

  // Shuffle
  const shuffled = [...positivePool].sort(() => Math.random() - 0.5);
  const numPositives = 2 + (Math.random() > 0.5 ? 1 : 0);
  const selectedPositives = shuffled.slice(0, numPositives);

  // 40% chance of negative
  let selectedNegative: RivenStat | null = null;
  if (Math.random() < 0.4) {
    const negShuffled = [...negativePool].sort(() => Math.random() - 0.5);
    selectedNegative = negShuffled[0];
  }

  return {
    weaponName,
    polarity: ["madurai", "vazarin", "naramon", "zenurik"][Math.floor(Math.random() * 4)],
    rank: 8,
    rerolls: Math.floor(Math.random() * 10),
    positiveStats: selectedPositives,
    negativeStat: selectedNegative,
    disposition,
  };
}

export function getRerollCost(rerollCount: number): number {
  const costs = [900, 1000, 1200, 1400, 1700, 2000, 2350, 2700, 3050];
  if (rerollCount < costs.length) return costs[rerollCount];
  return 3500; // Cap
}
