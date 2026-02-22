import { ArchonShard } from "@/lib/types";

export const allArchonShards: ArchonShard[] = [
  {
    "id": "crimson_standard",
    "name": "Crimson Archon Shard",
    "color": "crimson",
    "tier": 1,
    "statBonuses": {
      "abilityStrength": 10,
      "meleeCritDamage": 25,
      "primaryCritDamage": 25,
      "secondaryCritDamage": 25
    },
    "description": "+10% Ability Strength OR +25% Critical Damage (Melee/Primary/Secondary)",
    "isCoalescent": false
  },
  {
    "id": "crimson_tauforged",
    "name": "Tauforged Crimson Archon Shard",
    "color": "crimson",
    "tier": 2,
    "statBonuses": {
      "abilityStrength": 15,
      "meleeCritDamage": 37.5,
      "primaryCritDamage": 37.5,
      "secondaryCritDamage": 37.5
    },
    "description": "+15% Ability Strength OR +37.5% Critical Damage (Melee/Primary/Secondary)",
    "isCoalescent": false
  },
  {
    "id": "azure_standard",
    "name": "Azure Archon Shard",
    "color": "azure",
    "tier": 1,
    "statBonuses": {
      "health": 150,
      "shield": 150,
      "energyMax": 50
    },
    "description": "+150 Health OR +150 Shield OR +50 Max Energy",
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
      "energyMax": 75
    },
    "description": "+225 Health OR +225 Shield OR +75 Max Energy",
    "isCoalescent": false
  },
  {
    "id": "amber_standard",
    "name": "Amber Archon Shard",
    "color": "amber",
    "tier": 1,
    "statBonuses": {
      "castingSpeed": 25,
      "parkourVelocity": 15,
      "sprintSpeed": 10
    },
    "description": "+25% Casting Speed OR +15% Parkour Velocity OR +10% Sprint Speed",
    "isCoalescent": false
  },
  {
    "id": "amber_tauforged",
    "name": "Tauforged Amber Archon Shard",
    "color": "amber",
    "tier": 2,
    "statBonuses": {
      "castingSpeed": 37.5,
      "parkourVelocity": 22.5,
      "sprintSpeed": 15
    },
    "description": "+37.5% Casting Speed OR +22.5% Parkour Velocity OR +15% Sprint Speed",
    "isCoalescent": false
  },
  {
    "id": "violet_standard",
    "name": "Violet Archon Shard",
    "color": "violet",
    "tier": 1,
    "statBonuses": {
      "abilityDuration": 15,
      "abilityEfficiency": 15,
      "abilityRange": 15
    },
    "description": "+15% Ability Duration OR +15% Ability Efficiency OR +15% Ability Range",
    "isCoalescent": false
  },
  {
    "id": "violet_tauforged",
    "name": "Tauforged Violet Archon Shard",
    "color": "violet",
    "tier": 2,
    "statBonuses": {
      "abilityDuration": 22.5,
      "abilityEfficiency": 22.5,
      "abilityRange": 22.5
    },
    "description": "+22.5% Ability Duration OR +22.5% Ability Efficiency OR +22.5% Ability Range",
    "isCoalescent": false
  },
  {
    "id": "topaz_standard",
    "name": "Topaz Archon Shard",
    "color": "topaz",
    "tier": 1,
    "statBonuses": {
      "armor": 150,
      "elementalResistance": 25,
      "healthRegen": 5
    },
    "description": "+150 Armor OR +25% Elemental Resistance OR +5/s Health Regeneration",
    "isCoalescent": false
  },
  {
    "id": "topaz_tauforged",
    "name": "Tauforged Topaz Archon Shard",
    "color": "topaz",
    "tier": 2,
    "statBonuses": {
      "armor": 225,
      "elementalResistance": 37.5,
      "healthRegen": 7.5
    },
    "description": "+225 Armor OR +37.5% Elemental Resistance OR +7.5/s Health Regeneration",
    "isCoalescent": false
  },
  {
    "id": "emerald_standard",
    "name": "Emerald Archon Shard",
    "color": "emerald",
    "tier": 1,
    "statBonuses": {
      "healingBonus": 20,
      "statusDuration": 25,
      "abilityCastEnergyCost": -5
    },
    "description": "+20% Healing Given OR +25% Status Duration OR -5% Ability Energy Cost",
    "isCoalescent": false
  },
  {
    "id": "emerald_tauforged",
    "name": "Tauforged Emerald Archon Shard",
    "color": "emerald",
    "tier": 2,
    "statBonuses": {
      "healingBonus": 30,
      "statusDuration": 37.5,
      "abilityCastEnergyCost": -7.5
    },
    "description": "+30% Healing Given OR +37.5% Status Duration OR -7.5% Ability Energy Cost",
    "isCoalescent": false
  }
];
