import { EquippedArchonShard } from "@/lib/types";
import { allArchonShards } from "@/data/archon-shards";

const shardNameById = new Map(allArchonShards.map((s) => [s.id, s.name]));

export const SHARD_SHORT_NAMES: Record<string, string> = {
  crimson: "Crim",
  azure: "Azur",
  amber: "Ambr",
  violet: "Viol",
  topaz: "Topz",
  emerald: "Emer",
};

export function getArchonShardImage(color: string, tier: number): string {
  const wiki: Record<string, { standard: string; tau: string }> = {
    crimson: {
      standard: "https://static.wikia.nocookie.net/warframe/images/0/0e/CrimsonArchonShard.png",
      tau: "https://static.wikia.nocookie.net/warframe/images/a/a1/TauforgedCrimsonArchonShard.png",
    },
    azure: {
      standard: "https://static.wikia.nocookie.net/warframe/images/4/4e/AzureArchonShard.png",
      tau: "https://static.wikia.nocookie.net/warframe/images/8/8a/TauforgedAzureArchonShard.png",
    },
    amber: {
      standard: "https://static.wikia.nocookie.net/warframe/images/6/6e/AmberArchonShard.png",
      tau: "https://static.wikia.nocookie.net/warframe/images/1/1f/TauforgedAmberArchonShard.png",
    },
    violet: {
      standard: "https://static.wikia.nocookie.net/warframe/images/2/2e/VioletArchonShard.png",
      tau: "https://static.wikia.nocookie.net/warframe/images/5/5a/TauforgedVioletArchonShard.png",
    },
    topaz: {
      standard: "https://static.wikia.nocookie.net/warframe/images/9/9e/TopazArchonShard.png",
      tau: "https://static.wikia.nocookie.net/warframe/images/3/3e/TauforgedTopazArchonShard.png",
    },
    emerald: {
      standard: "https://static.wikia.nocookie.net/warframe/images/e/e0/EmeraldArchonShard.png",
      tau: "https://static.wikia.nocookie.net/warframe/images/7/7e/TauforgedEmeraldArchonShard.png",
    },
  };
  const entry = wiki[color];
  if (!entry) return `/images/shards/${color}.png`;
  return tier === 2 ? entry.tau : entry.standard;
}

export function getShardShortLabel(color: string, tier: number): string {
  const short = SHARD_SHORT_NAMES[color] ?? color.slice(0, 4);
  return tier === 2 ? `${short} τ` : short;
}

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
