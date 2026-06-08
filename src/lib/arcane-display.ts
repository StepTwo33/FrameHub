import { Mod } from "@/lib/types";
import { getPersistenceDamageCap } from "@/lib/calculator";

export interface ArcaneEffectLine {
  label: string;
  value: string;
  active?: boolean;
  note?: string;
}

export interface ArcaneDisplayInfo {
  name: string;
  rank: number;
  maxRank: number;
  description: string;
  applied: ArcaneEffectLine[];
  conditional: ArcaneEffectLine[];
}

/** Scale arcane stat values linearly from rank 0 → max rank. */
function scaleArcaneStat(maxValue: number, rank: number, maxRank: number): number {
  if (maxRank <= 0) return maxValue;
  return maxValue * ((rank + 1) / (maxRank + 1));
}

const STAT_LABELS: Record<string, string> = {
  armor: "Armor",
  armorBonusAmount: "Armor",
  abilityStrength: "Ability Strength",
  flowEnergyMax: "Max Energy",
  health: "Health",
  shield: "Shield",
  energy: "Energy",
  sprintSpeed: "Sprint Speed",
  sprintSpeedBonus: "Sprint Speed",
  healthOrbEffectiveness: "Health Orb Effectiveness",
  energyOrbBonus: "Energy from Orbs",
  allyEnergy: "Ally Energy Share",
  healthRegenAmount: "Health Regen/s",
  healthRegenChance: "Proc Chance",
  armorBonusChance: "Proc Chance",
  shieldRegenAmount: "Shield Regen/s",
  shieldRegenChance: "Proc Chance",
  meleeDamageBonus: "Melee Damage",
  meleeDamageChance: "Proc Chance",
  attackSpeedChance: "Proc Chance",
  critChanceOnDamaged: "Crit Chance",
  fireRateOnCrit: "Fire Rate",
};

const PROC_STAT_KEYS = new Set([
  "healthRegenChance", "armorBonusChance", "shieldRegenChance",
  "meleeDamageChance", "attackSpeedChance", "critChanceOnDamaged",
  "fireRateOnCrit", "removeShields", "persistenceDamageCapPerSecond",
]);

function fmtPct(n: number, decimals = 0): string {
  return `${n.toFixed(decimals)}%`;
}

export function getArcaneDisplayInfo(
  arcane: Mod,
  rank: number,
  context?: { totalArmor?: number; persistenceActive?: boolean },
): ArcaneDisplayInfo {
  const applied: ArcaneEffectLine[] = [];
  const conditional: ArcaneEffectLine[] = [];
  const cleanDesc = arcane.description.replace(/<[^>]+>/g, "").replace(/\\ /g, " ").trim();

  if (arcane.id === "arcane_persistence") {
    const cap = getPersistenceDamageCap(rank, arcane.maxRank);
    applied.push({ label: "Shields", value: "Removed", active: true });
    const armorMet = (context?.totalArmor ?? 0) >= 700;
    conditional.push({
      label: "Damage cap",
      value: `${cap}/s`,
      active: armorMet && (context?.persistenceActive ?? false),
      note: armorMet ? "Active (Armor ≥ 700)" : "Requires Armor ≥ 700",
    });
    return { name: arcane.name, rank, maxRank: arcane.maxRank, description: cleanDesc, applied, conditional };
  }

  for (const [key, maxVal] of Object.entries(arcane.stats)) {
    if (PROC_STAT_KEYS.has(key)) {
      const scaled = scaleArcaneStat(maxVal, rank, arcane.maxRank);
      const label = STAT_LABELS[key] ?? key;
      if (key.endsWith("Chance")) {
        conditional.push({
          label: `${arcane.name} — ${label}`,
          value: fmtPct(scaled, 1),
          note: "On proc",
        });
      }
      continue;
    }

    const scaled = scaleArcaneStat(maxVal, rank, arcane.maxRank);
    const label = STAT_LABELS[key] ?? key;
    const isPercent = !["health", "shield", "energy"].includes(key);
    applied.push({
      label,
      value: isPercent ? fmtPct(scaled, scaled % 1 !== 0 ? 1 : 0) : `+${scaled.toFixed(0)}`,
      active: true,
    });
  }

  if (Object.keys(arcane.stats).length === 0) {
    conditional.push({
      label: "Effect",
      value: cleanDesc.length > 120 ? `${cleanDesc.slice(0, 117)}…` : cleanDesc,
      note: "Proc / conditional",
    });
  }

  return { name: arcane.name, rank, maxRank: arcane.maxRank, description: cleanDesc, applied, conditional };
}
