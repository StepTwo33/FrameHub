import { EquippedArchonShard } from "@/lib/types";
import { allArchonShards } from "@/data/archon-shards";

const shardNameById = new Map(allArchonShards.map((s) => [s.id, s.name]));

export const SHARD_BONUS_LABELS: Record<string, string> = {
  abilityStrength: "Ability Strength",
  abilityDuration: "Ability Duration",
  abilityEfficiency: "Ability Efficiency",
  abilityRange: "Ability Range",
  meleeCritDamage: "Melee Crit Damage",
  primaryStatusChance: "Primary Status Chance",
  secondaryCritChance: "Secondary Crit Chance",
  health: "Health",
  shield: "Shield Capacity",
  energyMax: "Max Energy",
  armor: "Armor",
  healthRegen: "Health Regen",
  castingSpeed: "Casting Speed",
  parkourVelocity: "Parkour Velocity",
  sprintSpeed: "Sprint Speed",
  startingEnergy: "Starting Energy",
  healthOrbEffectiveness: "Health Orb Effectiveness",
  energyOrbEffectiveness: "Energy Orb Effectiveness",
  abilityDamageElectricity: "Ability Dmg vs Electricity",
  primaryElectricityDamage: "Primary Electricity Damage",
  meleeCritDamageEnergy: "Melee Crit Dmg (Energy>500: 2x)",
  orbConversion: "Orb Conversion (Equilibrium)",
  blastKillHealth: "Health per Blast Kill",
  blastKillShields: "Shields on Blast Kill",
  heatKillSecondaryCrit: "Sec. Crit/Heat Kill",
  abilityDamageRadiation: "Ability Dmg vs Radiation",
  toxinStatusDamage: "Toxin Status Damage",
  toxinHealthRecovery: "Health per Toxin Tick",
  abilityDamageCorrosion: "Ability Dmg vs Corrosion",
  corrosionMaxStacks: "Max Corrosion Stacks",
};

const FLAT_SHARD_KEYS = new Set([
  "health", "shield", "energyMax", "armor", "healthRegen",
  "blastKillHealth", "blastKillShields", "toxinHealthRecovery",
  "corrosionMaxStacks", "heatKillSecondaryCrit",
]);

const CONDITIONAL_SHARD_KEYS = new Set([
  "abilityDamageElectricity", "abilityDamageRadiation", "abilityDamageCorrosion",
  "primaryElectricityDamage", "orbConversion", "blastKillHealth", "blastKillShields",
  "heatKillSecondaryCrit", "toxinHealthRecovery", "corrosionMaxStacks",
  "startingEnergy", "healthOrbEffectiveness", "energyOrbEffectiveness",
  "meleeCritDamageEnergy",
]);

export function formatShardBonusValue(key: string, value: number): string {
  if (FLAT_SHARD_KEYS.has(key)) {
    const dec = value % 1 !== 0 ? 1 : 0;
    if (key === "healthRegen") return `${value > 0 ? "+" : ""}${value.toFixed(dec)}/s`;
    if (key === "heatKillSecondaryCrit") return `${value > 0 ? "+" : ""}${value.toFixed(dec)}%/kill`;
    return `${value > 0 ? "+" : ""}${value.toFixed(dec)}`;
  }
  const dec = value % 1 !== 0 ? 1 : 0;
  return `${value > 0 ? "+" : ""}${value.toFixed(dec)}%`;
}

export interface ShardBonusLine {
  shardName: string;
  shardColor: string;
  label: string;
  value: string;
  conditional: boolean;
}

export function buildShardBonusLines(shards: (EquippedArchonShard | null)[]): ShardBonusLine[] {
  const lines: ShardBonusLine[] = [];
  for (const shard of shards) {
    if (!shard?.selectedBonus) continue;
    const key = shard.selectedBonus;
    lines.push({
      shardName: shardNameById.get(shard.shardId) ?? shard.shardId,
      shardColor: shard.shardColor,
      label: SHARD_BONUS_LABELS[key] ?? key,
      value: formatShardBonusValue(key, shard.bonusValue),
      conditional: CONDITIONAL_SHARD_KEYS.has(key),
    });
  }
  return lines;
}
