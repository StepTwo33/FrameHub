/**
 * Arcane effect definitions — generated from wiki Module:Arcane/data.
 * Regenerate: python scripts/generate_arcane_stats.py
 */

export type ArcaneTrigger =
  | "passive"
  | "stacks"
  | "onKill"
  | "onHeadshot"
  | "onDamaged"
  | "onReload"
  | "onAbilityCast"
  | "onMeleeKill"
  | "onFinisher"
  | "onStatus"
  | "onPickup"
  | "onVoidSling"
  | "onMovement"
  | "onHit"
  | "onFreeze"
  | "conditional";

export interface ArcaneEffectLine {
  stat: string;
  maxValue: number;
  flat?: boolean;
  stacking?: boolean;
  /** Value does not scale with arcane rank (proc chance, duration, etc.). */
  constantAtAllRanks?: boolean;
}

export interface ArcaneEffectDef {
  name: string;
  trigger: ArcaneTrigger;
  maxRank: number;
  stackCap?: number;
  effects: ArcaneEffectLine[];
}

export const ARCANE_EFFECTS: Record<string, ArcaneEffectDef> = 
{
  "akimbo_slip_shot": {
    "name": "Akimbo Slip Shot",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "ammoEfficiency",
        "maxValue": 65.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_acceleration": {
    "name": "Arcane Acceleration",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "fireRateOnCritChance",
        "maxValue": 30.0,
        "flat": false,
        "stacking": false,
        "constantAtAllRanks": true
      },
      {
        "stat": "fireRate",
        "maxValue": 90.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "buffDuration",
        "maxValue": 9.0,
        "flat": true,
        "stacking": false,
        "constantAtAllRanks": true
      }
    ]
  },
  "arcane_aegis": {
    "name": "Arcane Aegis",
    "trigger": "onDamaged",
    "maxRank": 5,
    "effects": [
      {
        "stat": "shieldRegenChance",
        "maxValue": 2.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "shieldRegenAmount",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_agility": {
    "name": "Arcane Agility",
    "trigger": "onDamaged",
    "maxRank": 5,
    "effects": [
      {
        "stat": "parkourVelocity",
        "maxValue": 60.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "sprintSpeedBonus",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "sprintSpeedChance",
        "maxValue": 3.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_arachne": {
    "name": "Arcane Arachne",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "wallLatchDamage",
        "maxValue": 25.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_avenger": {
    "name": "Arcane Avenger",
    "trigger": "onDamaged",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalChance",
        "maxValue": 45.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "critChanceOnDamaged",
        "maxValue": 7.5,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_awakening": {
    "name": "Arcane Awakening",
    "trigger": "onReload",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damageOnRevive",
        "maxValue": 15.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_barrier": {
    "name": "Arcane Barrier",
    "trigger": "onDamaged",
    "maxRank": 5,
    "effects": [
      {
        "stat": "shieldRestoreChance",
        "maxValue": 100,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_battery": {
    "name": "Arcane Battery",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "energyPerArmor",
        "maxValue": 0.3,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "arcane_bellicose": {
    "name": "Arcane Bellicose",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "abilityStrengthPerHealth",
        "maxValue": 6.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "abilityStrengthPerHealthStep",
        "maxValue": 250.0,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "abilityStrength",
        "maxValue": 6.0,
        "flat": false,
        "stacking": true
      }
    ]
  },
  "arcane_blade_charger": {
    "name": "Arcane Blade Charger",
    "trigger": "onKill",
    "maxRank": 5,
    "effects": [
      {
        "stat": "meleeDamageBonus",
        "maxValue": 300.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_blessing": {
    "name": "Arcane Blessing",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "healthFlat",
        "maxValue": 24.0,
        "flat": false,
        "stacking": true
      }
    ],
    "stackCap": 50
  },
  "arcane_bodyguard": {
    "name": "Arcane Bodyguard",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "companionHeal",
        "maxValue": 900.0,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "arcane_camisado": {
    "name": "Arcane Camisado",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "abilityStrength",
        "maxValue": 60,
        "flat": false,
        "stacking": true
      }
    ]
  },
  "arcane_circumvent": {
    "name": "Arcane Circumvent",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "armorSteal",
        "maxValue": 50.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_concentration": {
    "name": "Arcane Concentration",
    "trigger": "onAbilityCast",
    "maxRank": 5,
    "effects": [
      {
        "stat": "abilityDuration",
        "maxValue": 60,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_consequence": {
    "name": "Arcane Consequence",
    "trigger": "onHeadshot",
    "maxRank": 5,
    "effects": [
      {
        "stat": "parkourVelocity",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_crepuscular": {
    "name": "Arcane Crepuscular",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "abilityStrength",
        "maxValue": 30,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "criticalMultiplier",
        "maxValue": 200,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_deflection": {
    "name": "Arcane Deflection",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "reflectDamage",
        "maxValue": 60,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_double_back": {
    "name": "Arcane Double Back",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damageReduction",
        "maxValue": 25.0,
        "flat": false,
        "stacking": true
      }
    ],
    "stackCap": 3
  },
  "arcane_energize": {
    "name": "Arcane Energize",
    "trigger": "onPickup",
    "maxRank": 5,
    "effects": [
      {
        "stat": "energyOrbBonus",
        "maxValue": 25.0,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "allyEnergy",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_eruption": {
    "name": "Arcane Eruption",
    "trigger": "onPickup",
    "maxRank": 5,
    "effects": [
      {
        "stat": "knockdownChance",
        "maxValue": 100,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_escapist": {
    "name": "Arcane Escapist",
    "trigger": "onKill",
    "maxRank": 5,
    "effects": [
      {
        "stat": "escapistStackCap",
        "maxValue": 9,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "invulnerabilityDuration",
        "maxValue": 12,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "arcane_expertise": {
    "name": "Arcane Expertise",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "abilityStrengthToShield",
        "maxValue": 100.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_fury": {
    "name": "Arcane Fury",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "meleeDamageBonus",
        "maxValue": 15.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "meleeDamageChance",
        "maxValue": 4.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_grace": {
    "name": "Arcane Grace",
    "trigger": "onDamaged",
    "maxRank": 5,
    "effects": [
      {
        "stat": "healthRegenChance",
        "maxValue": 12,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "healthRegenAmount",
        "maxValue": 6,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_guardian": {
    "name": "Arcane Guardian",
    "trigger": "onDamaged",
    "maxRank": 5,
    "effects": [
      {
        "stat": "armorBonusChance",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "flatArmorBonus",
        "maxValue": 900.0,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "armor",
        "maxValue": 45.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "armorBonusAmount",
        "maxValue": 45.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_healing": {
    "name": "Arcane Healing",
    "trigger": "onStatus",
    "maxRank": 5,
    "effects": [
      {
        "stat": "statusResistance",
        "maxValue": 102.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "healthOrbEffectiveness",
        "maxValue": 10.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_hot_shot": {
    "name": "Arcane Hot Shot",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalChance",
        "maxValue": 6.0,
        "flat": false,
        "stacking": true
      }
    ]
  },
  "arcane_ice": {
    "name": "Arcane Ice",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "statusResistance",
        "maxValue": 102.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_ice_storm": {
    "name": "Arcane Ice Storm",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "abilityDuration",
        "maxValue": 2.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "abilityStrength",
        "maxValue": 2.0,
        "flat": false,
        "stacking": true
      }
    ],
    "stackCap": 20
  },
  "arcane_impetus": {
    "name": "Arcane Impetus",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "abilityEfficiency",
        "maxValue": 3.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_intention": {
    "name": "Arcane Intention",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "healthFlat",
        "maxValue": 250,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "arcane_momentum": {
    "name": "Arcane Momentum",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "reloadSpeedChance",
        "maxValue": 30,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "reloadSpeedBonus",
        "maxValue": 60,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_nullifier": {
    "name": "Arcane Nullifier",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "statusResistance",
        "maxValue": 102.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "nullifyChance",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_persistence": {
    "name": "Arcane Persistence",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "persistenceDamageCapPerSecond",
        "maxValue": 500,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "removeShields",
        "maxValue": 1,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "arcane_phantasm": {
    "name": "Arcane Phantasm",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "dodgeSpeed",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_pistoleer": {
    "name": "Arcane Pistoleer",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "ammoEfficiency",
        "maxValue": 102.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_power_ramp": {
    "name": "Arcane Power Ramp",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "abilityStrength",
        "maxValue": 9.0,
        "flat": false,
        "stacking": true
      }
    ]
  },
  "arcane_precision": {
    "name": "Arcane Precision",
    "trigger": "onHeadshot",
    "maxRank": 5,
    "effects": [
      {
        "stat": "headshotDamage",
        "maxValue": 15.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_primary_charger": {
    "name": "Arcane Primary Charger",
    "trigger": "onMeleeKill",
    "maxRank": 5,
    "effects": [
      {
        "stat": "holsterDamage",
        "maxValue": 300.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "damage",
        "maxValue": 300.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_pulse": {
    "name": "Arcane Pulse",
    "trigger": "onPickup",
    "maxRank": 5,
    "effects": [
      {
        "stat": "healthFromOrbs",
        "maxValue": 500.0,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "energyOrbPulse",
        "maxValue": 25.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_rage": {
    "name": "Arcane Rage",
    "trigger": "onHeadshot",
    "maxRank": 5,
    "effects": [
      {
        "stat": "holsterDamage",
        "maxValue": 180.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "damageOnEnergyPickup",
        "maxValue": 10.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_reaper": {
    "name": "Arcane Reaper",
    "trigger": "onMeleeKill",
    "maxRank": 5,
    "effects": [
      {
        "stat": "healthRegenPerSec",
        "maxValue": 24.0,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "flatArmorBonus",
        "maxValue": 660.0,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "arcane_resistance": {
    "name": "Arcane Resistance",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "statusResistance",
        "maxValue": 8.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_rise": {
    "name": "Arcane Rise",
    "trigger": "onReload",
    "maxRank": 5,
    "effects": [
      {
        "stat": "holsterDamage",
        "maxValue": 150.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_steadfast": {
    "name": "Arcane Steadfast",
    "trigger": "onAbilityCast",
    "maxRank": 5,
    "effects": [
      {
        "stat": "freeAbilityCastChance",
        "maxValue": 20,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_sculptor": {
    "name": "Arcane Sculptor",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "abilityEfficiency",
        "maxValue": 175.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_strike": {
    "name": "Arcane Strike",
    "trigger": "onHit",
    "maxRank": 5,
    "effects": [
      {
        "stat": "attackSpeed",
        "maxValue": 60.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "attackSpeedChance",
        "maxValue": 2.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "attackSpeedBonus",
        "maxValue": 7.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_tanker": {
    "name": "Arcane Tanker",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "flatArmorBonus",
        "maxValue": 50.0,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "healthFromOrbs",
        "maxValue": 50.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_tempo": {
    "name": "Arcane Tempo",
    "trigger": "onKill",
    "maxRank": 5,
    "effects": [
      {
        "stat": "fireRate",
        "maxValue": 90.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "attackSpeedOnKill",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_trickery": {
    "name": "Arcane Trickery",
    "trigger": "onFinisher",
    "maxRank": 5,
    "effects": [
      {
        "stat": "invisibilityChance",
        "maxValue": 3.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "invisibilityDuration",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_truculence": {
    "name": "Arcane Truculence",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "overguardThreshold",
        "maxValue": 3000,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "radialAttackRadius",
        "maxValue": 30,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "arcane_ultimatum": {
    "name": "Arcane Ultimatum",
    "trigger": "onFinisher",
    "maxRank": 5,
    "effects": [
      {
        "stat": "finisherDamage",
        "maxValue": 25.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_universal_fallout": {
    "name": "Arcane Universal Fallout",
    "trigger": "onStatus",
    "maxRank": 5,
    "effects": [
      {
        "stat": "universalOrbChance",
        "maxValue": 6,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_velocity": {
    "name": "Arcane Velocity",
    "trigger": "onHeadshot",
    "maxRank": 5,
    "effects": [
      {
        "stat": "fireRate",
        "maxValue": 120.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "fireRateOnHeadshot",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_victory": {
    "name": "Arcane Victory",
    "trigger": "onHeadshot",
    "maxRank": 5,
    "effects": [
      {
        "stat": "headshotHealthRegen",
        "maxValue": 3,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_warmth": {
    "name": "Arcane Warmth",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "coldResistance",
        "maxValue": 60,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "cascadia_accuracy": {
    "name": "Cascadia Accuracy",
    "trigger": "onHeadshot",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalChance",
        "maxValue": 300.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "cascadia_empowered": {
    "name": "Cascadia Empowered",
    "trigger": "onStatus",
    "maxRank": 5,
    "effects": [
      {
        "stat": "bonusDamageOnStatus",
        "maxValue": 750.0,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "cascadia_flare": {
    "name": "Cascadia Flare",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damage",
        "maxValue": 480,
        "flat": false,
        "stacking": true
      }
    ],
    "stackCap": 480
  },
  "cascadia_overcharge": {
    "name": "Cascadia Overcharge",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalChance",
        "maxValue": 300.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "conjunction_voltage": {
    "name": "Conjunction Voltage",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "multishot",
        "maxValue": 3.0,
        "flat": false,
        "stacking": true
      }
    ],
    "stackCap": 40
  },
  "emergence_dissipate": {
    "name": "Emergence Dissipate",
    "trigger": "onVoidSling",
    "maxRank": 5,
    "effects": [
      {
        "stat": "dissipateRadius",
        "maxValue": 10,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "voidMoteEnergy",
        "maxValue": 10,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "emergence_renewed": {
    "name": "Emergence Renewed",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "energyRegen",
        "maxValue": 300.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "emergence_savior": {
    "name": "Emergence Savior",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "lethalInvulnDuration",
        "maxValue": 5,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "lethalHealPercent",
        "maxValue": 60,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "eternal_eradicate": {
    "name": "Eternal Eradicate",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "ampDamage",
        "maxValue": 60.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "eternal_logistics": {
    "name": "Eternal Logistics",
    "trigger": "onVoidSling",
    "maxRank": 5,
    "effects": [
      {
        "stat": "ammoEfficiency",
        "maxValue": 72.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "eternal_onslaught": {
    "name": "Eternal Onslaught",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalChance",
        "maxValue": 180.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "exodia_brave": {
    "name": "Exodia Brave",
    "trigger": "stacks",
    "maxRank": 3,
    "effects": [
      {
        "stat": "energyRegen",
        "maxValue": 5,
        "flat": false,
        "stacking": true
      }
    ],
    "stackCap": 3
  },
  "exodia_contagion": {
    "name": "Exodia Contagion",
    "trigger": "onMovement",
    "maxRank": 3,
    "effects": [
      {
        "stat": "projectileOnAimGlide",
        "maxValue": 1,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "exodia_epidemic": {
    "name": "Exodia Epidemic",
    "trigger": "onMovement",
    "maxRank": 3,
    "effects": [
      {
        "stat": "shockwaveOnSlam",
        "maxValue": 1,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "exodia_force": {
    "name": "Exodia Force",
    "trigger": "onStatus",
    "maxRank": 3,
    "effects": [
      {
        "stat": "statusProcChance",
        "maxValue": 50,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "procDamageMultiplier",
        "maxValue": 200,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "exodia_hunt": {
    "name": "Exodia Hunt",
    "trigger": "onMovement",
    "maxRank": 3,
    "effects": [
      {
        "stat": "pullChance",
        "maxValue": 50,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "pullRadius",
        "maxValue": 12,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "exodia_might": {
    "name": "Exodia Might",
    "trigger": "onFinisher",
    "maxRank": 3,
    "effects": [
      {
        "stat": "lifeStealChance",
        "maxValue": 50,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "lifeSteal",
        "maxValue": 30,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "exodia_triumph": {
    "name": "Exodia Triumph",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "meleeComboChance",
        "maxValue": 50,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "exodia_valor": {
    "name": "Exodia Valor",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "meleeComboChance",
        "maxValue": 200,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "fractalized_reset": {
    "name": "Fractalized Reset",
    "trigger": "onAbilityCast",
    "maxRank": 5,
    "effects": [
      {
        "stat": "reloadSpeed",
        "maxValue": 240.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "longbow_sharpshot": {
    "name": "Longbow Sharpshot",
    "trigger": "onHeadshot",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damage",
        "maxValue": 300.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_accelerant": {
    "name": "Magus Accelerant",
    "trigger": "onVoidSling",
    "maxRank": 5,
    "effects": [
      {
        "stat": "fireRate",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "ampFireRate",
        "maxValue": 30.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_aggress": {
    "name": "Magus Aggress",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalMultiplier",
        "maxValue": 300.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_anomaly": {
    "name": "Magus Anomaly",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "voidPullRadius",
        "maxValue": 3.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_cadence": {
    "name": "Magus Cadence",
    "trigger": "onVoidSling",
    "maxRank": 5,
    "effects": [
      {
        "stat": "voidSprintSpeed",
        "maxValue": 60,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_cloud": {
    "name": "Magus Cloud",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "voidModeSpeed",
        "maxValue": 60,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_destruct": {
    "name": "Magus Destruct",
    "trigger": "onVoidSling",
    "maxRank": 5,
    "effects": [
      {
        "stat": "enemyResistanceReduction",
        "maxValue": 65,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_drive": {
    "name": "Magus Drive",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "reloadSpeed",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "ampReload",
        "maxValue": 30.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_elevate": {
    "name": "Magus Elevate",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "healthFromOrbs",
        "maxValue": 300.0,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "operatorToWarframeHeal",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_firewall": {
    "name": "Magus Firewall",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damageReduction",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "voidModeDamageReduction",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_glitch": {
    "name": "Magus Glitch",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "transferenceStaticNegate",
        "maxValue": 102,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_husk": {
    "name": "Magus Husk",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "operatorArmor",
        "maxValue": 25.0,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "magus_lockdown": {
    "name": "Magus Lockdown",
    "trigger": "onVoidSling",
    "maxRank": 5,
    "effects": [
      {
        "stat": "voidTrapDuration",
        "maxValue": 1.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_melt": {
    "name": "Magus Melt",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damage",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "voidSprintDamage",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_nourish": {
    "name": "Magus Nourish",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "operatorEnergyToWarframe",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_overload": {
    "name": "Magus Overload",
    "trigger": "onVoidSling",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damage",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "voidBlastDamage",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_repair": {
    "name": "Magus Repair",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "operatorToWarframeHeal",
        "maxValue": 25,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_replenish": {
    "name": "Magus Replenish",
    "trigger": "onVoidSling",
    "maxRank": 5,
    "effects": [
      {
        "stat": "operatorHealthRegen",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "magus_revert": {
    "name": "Magus Revert",
    "trigger": "onVoidSling",
    "maxRank": 5,
    "effects": [
      {
        "stat": "revertWindow",
        "maxValue": 3,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "revertHeal",
        "maxValue": 60,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "magus_vigor": {
    "name": "Magus Vigor",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "operatorHealth",
        "maxValue": 25.0,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "melee_afflictions": {
    "name": "Melee Afflictions",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "statusStackBonus",
        "maxValue": 6,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "arcane_melee_animosity": {
    "name": "Melee Animosity",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalChance",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "meleeHeavyCrit",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "melee_assimilation": {
    "name": "Melee Assimilation",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "meleeHeavyDamage",
        "maxValue": 150.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "melee_careen": {
    "name": "Melee Careen",
    "trigger": "onMovement",
    "maxRank": 5,
    "effects": [
      {
        "stat": "meleeDamageBonus",
        "maxValue": 150.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "melee_crescendo": {
    "name": "Melee Crescendo",
    "trigger": "onFinisher",
    "maxRank": 5,
    "effects": [
      {
        "stat": "meleeComboInitial",
        "maxValue": 6.0,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "melee_doughty": {
    "name": "Melee Doughty",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "critPerPunctureTen",
        "maxValue": 100,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "melee_duplicate": {
    "name": "Melee Duplicate",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "duplicateAttackChance",
        "maxValue": 100,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "melee_exposure": {
    "name": "Melee Exposure",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "meleeDamageBonus",
        "maxValue": 240,
        "flat": false,
        "stacking": true
      }
    ],
    "stackCap": 240
  },
  "melee_fortification": {
    "name": "Melee Fortification",
    "trigger": "onMeleeKill",
    "maxRank": 5,
    "effects": [
      {
        "stat": "flatArmorBonus",
        "maxValue": 210.0,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "melee_influence": {
    "name": "Melee Influence",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "elementalProcChance",
        "maxValue": 20,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "melee_retaliation": {
    "name": "Melee Retaliation",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "meleeDamagePerShield",
        "maxValue": 30.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "melee_vortex": {
    "name": "Melee Vortex",
    "trigger": "onKill",
    "maxRank": 5,
    "effects": [
      {
        "stat": "pullChance",
        "maxValue": 45,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "pullRadius",
        "maxValue": 18,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "molt_augmented": {
    "name": "Molt Augmented",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "abilityStrength",
        "maxValue": 0.24,
        "flat": false,
        "stacking": true
      }
    ],
    "stackCap": 250
  },
  "molt_efficiency": {
    "name": "Molt Efficiency",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "abilityDuration",
        "maxValue": 36,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "molt_reconstruct": {
    "name": "Molt Reconstruct",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "healPerEnergySpent",
        "maxValue": 6,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "molt_vigor": {
    "name": "Molt Vigor",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "abilityStrength",
        "maxValue": 45,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "pax_bolt": {
    "name": "Pax Bolt",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "kitgunTether",
        "maxValue": 100,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "pax_charge": {
    "name": "Pax Charge",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "kitgunRecharge",
        "maxValue": 100.0,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "pax_seeker": {
    "name": "Pax Seeker",
    "trigger": "onHeadshot",
    "maxRank": 3,
    "effects": [
      {
        "stat": "kitgunHoming",
        "maxValue": 100.0,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "pax_soar": {
    "name": "Pax Soar",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "kitgunProjectileSpeed",
        "maxValue": 50,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "primary_blight": {
    "name": "Primary Blight",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "multishot",
        "maxValue": 1.8,
        "flat": false,
        "stacking": true
      }
    ],
    "stackCap": 40
  },
  "primary_bulwark": {
    "name": "Primary Bulwark",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damagePerArmorOver",
        "maxValue": 1.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "damagePerArmorThreshold",
        "maxValue": 1.0,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "primary_compression": {
    "name": "Primary Compression",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "ammoEfficiency",
        "maxValue": 5.5,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "primary_crux": {
    "name": "Primary Crux",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "ammoEfficiency",
        "maxValue": 6.0,
        "flat": false,
        "stacking": false
      }
    ],
    "stackCap": 10
  },
  "arcane_primary_deadhead": {
    "name": "Primary Deadhead",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damage",
        "maxValue": 120,
        "flat": false,
        "stacking": true
      },
      {
        "stat": "headshotMultiplier",
        "maxValue": 30,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "recoilReduction",
        "maxValue": 50,
        "flat": false,
        "stacking": false
      }
    ],
    "stackCap": 3
  },
  "primary_debilitate": {
    "name": "Primary Debilitate",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "debilitateStackThreshold",
        "maxValue": 10,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "arcane_primary_dexterity": {
    "name": "Primary Dexterity",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damage",
        "maxValue": 60,
        "flat": false,
        "stacking": true
      },
      {
        "stat": "comboDuration",
        "maxValue": 7.5,
        "flat": true,
        "stacking": false
      }
    ],
    "stackCap": 6
  },
  "primary_exhilarate": {
    "name": "Primary Exhilarate",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "energyRegen",
        "maxValue": 1.2,
        "flat": false,
        "stacking": true
      }
    ],
    "stackCap": 3
  },
  "primary_frostbite": {
    "name": "Primary Frostbite",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "multishot",
        "maxValue": 2.25,
        "flat": false,
        "stacking": true
      }
    ],
    "stackCap": 40
  },
  "arcane_primary_merciless": {
    "name": "Primary Merciless",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "reloadSpeed",
        "maxValue": 30,
        "flat": false,
        "stacking": true
      },
      {
        "stat": "damage",
        "maxValue": 30,
        "flat": false,
        "stacking": true
      }
    ],
    "stackCap": 12
  },
  "primary_obstruct": {
    "name": "Primary Obstruct",
    "trigger": "onStatus",
    "maxRank": 5,
    "effects": [
      {
        "stat": "weaponJamRadius",
        "maxValue": 15,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "weaponJamCooldown",
        "maxValue": 10,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "primary_overcharge": {
    "name": "Primary Overcharge",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "multishot",
        "maxValue": 350,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "primary_plated_round": {
    "name": "Primary Plated Round",
    "trigger": "onReload",
    "maxRank": 5,
    "effects": [
      {
        "stat": "reloadDamageRamp",
        "maxValue": 100,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "residual_boils": {
    "name": "Residual Boils",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "toxinPoolDuration",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "residual_malodor": {
    "name": "Residual Malodor",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "gasCloudDuration",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "residual_shock": {
    "name": "Residual Shock",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "electricZoneDuration",
        "maxValue": 5.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "residual_viremia": {
    "name": "Residual Viremia",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "bonusDamageOnStatus",
        "maxValue": 40,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "secondary_cryogenic": {
    "name": "Secondary Cryogenic",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "coldStacksApplied",
        "maxValue": 3,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "arcane_secondary_deadhead": {
    "name": "Secondary Deadhead",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damage",
        "maxValue": 120,
        "flat": false,
        "stacking": true
      },
      {
        "stat": "headshotMultiplier",
        "maxValue": 30,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "recoilReduction",
        "maxValue": 50,
        "flat": false,
        "stacking": false
      }
    ],
    "stackCap": 3
  },
  "arcane_secondary_dexterity": {
    "name": "Secondary Dexterity",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damage",
        "maxValue": 60,
        "flat": false,
        "stacking": true
      },
      {
        "stat": "comboDuration",
        "maxValue": 7.5,
        "flat": true,
        "stacking": false
      }
    ],
    "stackCap": 6
  },
  "secondary_encumber": {
    "name": "Secondary Encumber",
    "trigger": "onStatus",
    "maxRank": 5,
    "effects": [
      {
        "stat": "secondaryStatusProc",
        "maxValue": 24,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "secondary_enervate": {
    "name": "Secondary Enervate",
    "trigger": "onHit",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalChance",
        "maxValue": 10,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "secondary_fortifier": {
    "name": "Secondary Fortifier",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "overguardDamage",
        "maxValue": 800,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "secondary_irradiate": {
    "name": "Secondary Irradiate",
    "trigger": "onHit",
    "maxRank": 5,
    "effects": [
      {
        "stat": "procDamageMultiplier",
        "maxValue": 180.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "secondary_kinship": {
    "name": "Secondary Kinship",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalChance",
        "maxValue": 20.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "arcane_secondary_merciless": {
    "name": "Secondary Merciless",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "reloadSpeed",
        "maxValue": 30,
        "flat": false,
        "stacking": true
      },
      {
        "stat": "damage",
        "maxValue": 30,
        "flat": false,
        "stacking": true
      }
    ],
    "stackCap": 12
  },
  "secondary_outburst": {
    "name": "Secondary Outburst",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalMultiplier",
        "maxValue": 200,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "secondary_shiver": {
    "name": "Secondary Shiver",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damageTakenBonus",
        "maxValue": 45.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "secondary_surge": {
    "name": "Secondary Surge",
    "trigger": "onAbilityCast",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damagePerEnergy",
        "maxValue": 800,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "shotgun_vendetta": {
    "name": "Shotgun Vendetta",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "reloadSpeed",
        "maxValue": 75.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "theorem_contagion": {
    "name": "Theorem Contagion",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "vulnerability",
        "maxValue": 200,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "theorem_demulcent": {
    "name": "Theorem Demulcent",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damage",
        "maxValue": 180.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "theorem_infection": {
    "name": "Theorem Infection",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "companionDamageRamp",
        "maxValue": 360,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "virtuos_forge": {
    "name": "Virtuos Forge",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "ampHeatDamage",
        "maxValue": 30,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "virtuos_fury": {
    "name": "Virtuos Fury",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "ampCritDamage",
        "maxValue": 30,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "virtuos_ghost": {
    "name": "Virtuos Ghost",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "ampStatusChance",
        "maxValue": 30,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "virtuos_null": {
    "name": "Virtuos Null",
    "trigger": "onKill",
    "maxRank": 3,
    "effects": [
      {
        "stat": "energyRegen",
        "maxValue": 20.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "virtuos_shadow": {
    "name": "Virtuos Shadow",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "ampReload",
        "maxValue": 30,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "virtuos_spike": {
    "name": "Virtuos Spike",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "ampMultishot",
        "maxValue": 30,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "virtuos_strike": {
    "name": "Virtuos Strike",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "ampCritChance",
        "maxValue": 30,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "virtuos_surge": {
    "name": "Virtuos Surge",
    "trigger": "onHit",
    "maxRank": 3,
    "effects": [
      {
        "stat": "voidConversion",
        "maxValue": 98.0,
        "flat": false,
        "stacking": false
      },
      {
        "stat": "ampRange",
        "maxValue": 0.5,
        "flat": true,
        "stacking": false
      }
    ]
  },
  "virtuos_tempo": {
    "name": "Virtuos Tempo",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "ampFireRate",
        "maxValue": 30,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "virtuos_trojan": {
    "name": "Virtuos Trojan",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "ampDamage",
        "maxValue": 30,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "zid_an_asheir": {
    "name": "Zid-An Asheir",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "statusChancePerHit",
        "maxValue": 6,
        "flat": false,
        "stacking": true
      },
      {
        "stat": "tauronStrikeCharge",
        "maxValue": 18,
        "flat": false,
        "stacking": false
      }
    ],
    "stackCap": 50
  },
  "zid_an_haras": {
    "name": "Zid-An Haras",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "ammoEfficiency",
        "maxValue": 18.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "zid_an_osbok": {
    "name": "Zid-An Osbok",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "ampCritDamage",
        "maxValue": 300.0,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "zid_an_sek_eel": {
    "name": "Zid-An Sek-Eel",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "invisibilityDuration",
        "maxValue": 30,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "tauronChargeRate",
        "maxValue": 9,
        "flat": false,
        "stacking": false
      }
    ]
  },
  "zid_an_uskos": {
    "name": "Zid-An Uskos",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "secondaryHeatDamage",
        "maxValue": 2.4,
        "flat": false,
        "stacking": true
      }
    ]
  }
}
;
