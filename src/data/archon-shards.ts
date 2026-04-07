import { ArchonShard } from "@/lib/types";

export const allArchonShards: ArchonShard[] = [
  // ── Crimson ─────────────────────────────────────────────────────────────
  {
    "id": "crimson_standard",
    "name": "Crimson Archon Shard",
    "color": "crimson",
    "tier": 1,
    "statBonuses": {
      "meleeCritDamage": 25,
      "primaryStatusChance": 25,
      "secondaryCritChance": 25,
      "abilityStrength": 10,
      "abilityDuration": 10
    },
    "description": "+25% Melee Crit Damage OR +25% Primary Status Chance OR +25% Secondary Crit Chance OR +10% Ability Strength OR +10% Ability Duration",
    "isCoalescent": false
  },
  {
    "id": "crimson_tauforged",
    "name": "Tauforged Crimson Archon Shard",
    "color": "crimson",
    "tier": 2,
    "statBonuses": {
      "meleeCritDamage": 37.5,
      "primaryStatusChance": 37.5,
      "secondaryCritChance": 37.5,
      "abilityStrength": 15,
      "abilityDuration": 15
    },
    "description": "+37.5% Melee Crit Damage OR +37.5% Primary Status Chance OR +37.5% Secondary Crit Chance OR +15% Ability Strength OR +15% Ability Duration",
    "isCoalescent": false
  },
  // ── Azure ───────────────────────────────────────────────────────────────
  {
    "id": "azure_standard",
    "name": "Azure Archon Shard",
    "color": "azure",
    "tier": 1,
    "statBonuses": {
      "health": 150,
      "shield": 150,
      "energyMax": 50,
      "armor": 150,
      "healthRegen": 5
    },
    "description": "+150 Health OR +150 Shield OR +50 Energy OR +150 Armor OR +5/s Health Regen",
    "isCoalescent": false
  },
  {
    "id": "azure_tauforged",
    "name": "Tauforged Azure Archon Shard",
    "color": "azure",
    "tier": 2,
    "statBonuses": {
      "health": 225,
      "shield": 225,
      "energyMax": 75,
      "armor": 225,
      "healthRegen": 7.5
    },
    "description": "+225 Health OR +225 Shield OR +75 Energy OR +225 Armor OR +7.5/s Health Regen",
    "isCoalescent": false
  },
  // ── Amber ───────────────────────────────────────────────────────────────
  {
    "id": "amber_standard",
    "name": "Amber Archon Shard",
    "color": "amber",
    "tier": 1,
    "statBonuses": {
      "startingEnergy": 30,
      "healthOrbEffectiveness": 100,
      "energyOrbEffectiveness": 50,
      "castingSpeed": 25,
      "parkourVelocity": 15
    },
    "description": "+30% Starting Energy OR +100% Health Orb Effectiveness OR +50% Energy Orb Effectiveness OR +25% Casting Speed OR +15% Parkour Velocity",
    "isCoalescent": false
  },
  {
    "id": "amber_tauforged",
    "name": "Tauforged Amber Archon Shard",
    "color": "amber",
    "tier": 2,
    "statBonuses": {
      "startingEnergy": 45,
      "healthOrbEffectiveness": 150,
      "energyOrbEffectiveness": 75,
      "castingSpeed": 37.5,
      "parkourVelocity": 22.5
    },
    "description": "+45% Starting Energy OR +150% Health Orb Effectiveness OR +75% Energy Orb Effectiveness OR +37.5% Casting Speed OR +22.5% Parkour Velocity",
    "isCoalescent": false
  },
  // ── Violet (Crimson + Azure fusion) ─────────────────────────────────────
  {
    "id": "violet_standard",
    "name": "Violet Archon Shard",
    "color": "violet",
    "tier": 1,
    "statBonuses": {
      "abilityDamageElectricity": 10,
      "primaryElectricityDamage": 30,
      "meleeCritDamageEnergy": 25,
      "orbConversion": 20
    },
    "description": "+10% Ability Damage vs Electricity-affected enemies OR +30% Primary Electricity Damage (+10% per Crimson/Azure/Violet shard) OR +25% Melee Crit Damage (doubles at 500+ Energy) OR Health/Energy orbs give +20% of the other",
    "isCoalescent": true
  },
  {
    "id": "violet_tauforged",
    "name": "Tauforged Violet Archon Shard",
    "color": "violet",
    "tier": 2,
    "statBonuses": {
      "abilityDamageElectricity": 15,
      "primaryElectricityDamage": 45,
      "meleeCritDamageEnergy": 37.5,
      "orbConversion": 30
    },
    "description": "+15% Ability Damage vs Electricity-affected enemies OR +45% Primary Electricity Damage (+15% per Crimson/Azure/Violet shard) OR +37.5% Melee Crit Damage (doubles at 500+ Energy) OR Health/Energy orbs give +30% of the other",
    "isCoalescent": true
  },
  // ── Topaz (Crimson + Amber fusion) ──────────────────────────────────────
  {
    "id": "topaz_standard",
    "name": "Topaz Archon Shard",
    "color": "topaz",
    "tier": 1,
    "statBonuses": {
      "blastKillHealth": 1,
      "blastKillShields": 5,
      "heatKillSecondaryCrit": 1,
      "abilityDamageRadiation": 10
    },
    "description": "+1 Health per Blast kill (max 300) OR +5 Shields on Blast kill OR +1% Secondary Crit Chance per Heat kill (max 50%) OR +10% Ability Damage vs Radiation-affected enemies",
    "isCoalescent": true
  },
  {
    "id": "topaz_tauforged",
    "name": "Tauforged Topaz Archon Shard",
    "color": "topaz",
    "tier": 2,
    "statBonuses": {
      "blastKillHealth": 2,
      "blastKillShields": 7.5,
      "heatKillSecondaryCrit": 1.5,
      "abilityDamageRadiation": 15
    },
    "description": "+2 Health per Blast kill (max 450) OR +7.5 Shields on Blast kill OR +1.5% Secondary Crit Chance per Heat kill (max 75%) OR +15% Ability Damage vs Radiation-affected enemies",
    "isCoalescent": true
  },
  // ── Emerald (Amber + Azure fusion) ──────────────────────────────────────
  {
    "id": "emerald_standard",
    "name": "Emerald Archon Shard",
    "color": "emerald",
    "tier": 1,
    "statBonuses": {
      "toxinStatusDamage": 30,
      "toxinHealthRecovery": 2,
      "abilityDamageCorrosion": 10,
      "corrosionMaxStacks": 2
    },
    "description": "+30% Toxin Status Damage OR +2 Health per Toxin tick OR +10% Ability Damage vs Corrosion-affected enemies OR +2 max Corrosion stacks",
    "isCoalescent": true
  },
  {
    "id": "emerald_tauforged",
    "name": "Tauforged Emerald Archon Shard",
    "color": "emerald",
    "tier": 2,
    "statBonuses": {
      "toxinStatusDamage": 45,
      "toxinHealthRecovery": 3,
      "abilityDamageCorrosion": 15,
      "corrosionMaxStacks": 3
    },
    "description": "+45% Toxin Status Damage OR +3 Health per Toxin tick OR +15% Ability Damage vs Corrosion-affected enemies OR +3 max Corrosion stacks",
    "isCoalescent": true
  }
];
