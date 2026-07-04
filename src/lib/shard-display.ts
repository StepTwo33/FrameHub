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

export const SHARD_COLORS: Record<string, string> = {
  crimson: "#E74C3C",
  azure: "#3498DB",
  amber: "#F39C12",
  violet: "#9B59B6",
  topaz: "#E67E22",
  emerald: "#2ECC71",
};

export function getShardColorName(color: string): string {
  return color.charAt(0).toUpperCase() + color.slice(1);
}

/** Local PNGs in /public/images/shards/ (sourced from wiki.warframe.com via API). */
const SHARD_IMAGE_FILES: Record<string, { standard: string; tau: string }> = {
  crimson: { standard: "CrimsonArchonShard.png", tau: "TauforgedCrimsonArchonShard.png" },
  azure: { standard: "AzureArchonShard.png", tau: "TauforgedAzureArchonShard.png" },
  amber: { standard: "AmberArchonShard.png", tau: "TauforgedAmberArchonShard.png" },
  violet: { standard: "VioletArchonShard.png", tau: "TauforgedVioletArchonShard.png" },
  topaz: { standard: "TopazArchonShard.png", tau: "TauforgedTopazArchonShard.png" },
  emerald: { standard: "EmeraldArchonShard.png", tau: "TauforgedEmeraldArchonShard.png" },
};

export function getArchonShardImage(color: string, tier: number): string {
  const entry = SHARD_IMAGE_FILES[color];
  if (!entry) return "";
  const file = tier === 2 ? entry.tau : entry.standard;
  return `/images/shards/${file}`;
}

export function getShardShortLabel(color: string, tier: number): string {
  const name = getShardColorName(color);
  return tier === 2 ? `${name} Tau` : name;
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
