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
  /** Value at rank 0. Linear scale to maxValue at maxRank when set. */
  baseValue?: number;
  /** Explicit per-rank values (R0 index 0). Overrides base/max interpolation. */
  valuesByRank?: number[];
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

export const ARCANE_EFFECTS: Record<string, ArcaneEffectDef> = {
  "akimbo_slip_shot": {
    "name": "Akimbo Slip Shot",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "ammoEfficiency",
        "maxValue": 65.0,
        "flat": false,
        "stacking": false,
        "baseValue": 10.833333
      }
    ]
  },
  "arcane_acceleration": {
    "name": "Arcane Acceleration",
    "trigger": "onHit",
    "maxRank": 5,
    "effects": [
      {
        "stat": "fireRate",
        "maxValue": 90.0,
        "baseValue": 15.0
      },
      {
        "stat": "holsterDamage",
        "maxValue": 90.0,
        "baseValue": 15.0
      },
      {
        "stat": "fireRateOnCrit",
        "maxValue": 30.0,
        "baseValue": 5.0
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
        "maxValue": 3.0,
        "constantAtAllRanks": true
      },
      {
        "stat": "shieldRegenAmount",
        "maxValue": 30.0,
        "baseValue": 5.0
      }
    ]
  },
  "arcane_agility": {
    "name": "Arcane Agility",
    "trigger": "onDamaged",
    "maxRank": 5,
    "effects": [
      {
        "stat": "parkourProcChance",
        "maxValue": 60,
        "baseValue": 60,
        "constantAtAllRanks": true
      },
      {
        "stat": "parkourVelocity",
        "maxValue": 60,
        "baseValue": 10
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
        "maxValue": 150.0,
        "baseValue": 25.0
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
        "baseValue": 7.5
      }
    ]
  },
  "arcane_awakening": {
    "name": "Arcane Awakening",
    "trigger": "onReload",
    "maxRank": 5,
    "effects": [
      {
        "stat": "holsterDamage",
        "maxValue": 150.0,
        "baseValue": 25.0
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
        "maxValue": 100.0,
        "flat": true,
        "baseValue": 16.666667
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
        "baseValue": 0.05
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
        "baseValue": 1.0
      },
      {
        "stat": "abilityStrengthPerHealthStep",
        "maxValue": 250,
        "flat": true,
        "constantAtAllRanks": true
      },
      {
        "stat": "abilityStrength",
        "maxValue": 6.0,
        "stacking": true,
        "baseValue": 1.0
      }
    ]
  },
  "arcane_blade_charger": {
    "name": "Arcane Blade Charger",
    "trigger": "onKill",
    "maxRank": 5,
    "effects": [
      {
        "stat": "meleeDamageChance",
        "maxValue": 30.0,
        "flat": false,
        "stacking": false,
        "baseValue": 5.0
      },
      {
        "stat": "meleeDamageBonus",
        "maxValue": 300.0,
        "flat": false,
        "stacking": false,
        "baseValue": 50.0
      },
      {
        "stat": "buffDuration",
        "maxValue": 12,
        "flat": true,
        "constantAtAllRanks": true
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
        "flat": true,
        "stacking": true,
        "baseValue": 4.0
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
        "stacking": false,
        "baseValue": 150.0
      }
    ]
  },
  "arcane_camisado": {
    "name": "Arcane Camisado",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "abilityStrength",
        "maxValue": 6.0,
        "stacking": true,
        "baseValue": 1.0
      }
    ],
    "stackCap": 10
  },
  "arcane_circumvent": {
    "name": "Arcane Circumvent",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "armorSteal",
        "maxValue": 50.0,
        "baseValue": 8.333333
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
      },
      {
        "stat": "buffDuration",
        "maxValue": 3,
        "flat": true,
        "constantAtAllRanks": true
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
        "maxValue": 60,
        "baseValue": 10
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
        "maxValue": 30.0,
        "baseValue": 5.0
      },
      {
        "stat": "criticalMultiplier",
        "maxValue": 3.0,
        "flat": true,
        "baseValue": 0.5
      }
    ]
  },
  "arcane_deflection": {
    "name": "Arcane Deflection",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "statusResistance",
        "maxValue": 102.0,
        "baseValue": 17.0
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
        "maxValue": 25,
        "stacking": true,
        "baseValue": 5
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
        "maxValue": 150.0,
        "baseValue": 25.0
      },
      {
        "stat": "allyEnergy",
        "maxValue": 150.0,
        "baseValue": 25.0
      },
      {
        "stat": "healthRegenChance",
        "maxValue": 60.0,
        "flat": true,
        "baseValue": 10.0
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
        "maxValue": 100.0,
        "baseValue": 16.666667
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
        "constantAtAllRanks": true
      },
      {
        "stat": "invulnerabilityDuration",
        "maxValue": 12,
        "flat": true,
        "constantAtAllRanks": true
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
        "baseValue": 16.666667
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
        "maxValue": 180.0,
        "baseValue": 30.0
      },
      {
        "stat": "meleeDamageChance",
        "maxValue": 60.0,
        "flat": true,
        "baseValue": 10.0
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
        "maxValue": 9,
        "flat": true,
        "baseValue": 9,
        "constantAtAllRanks": true
      },
      {
        "stat": "healthRegenAmount",
        "maxValue": 6,
        "baseValue": 1
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
        "maxValue": 15,
        "baseValue": 15,
        "constantAtAllRanks": true
      },
      {
        "stat": "flatArmorBonus",
        "maxValue": 900,
        "flat": true,
        "baseValue": 150
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
        "baseValue": 17.0
      }
    ]
  },
  "arcane_hot_shot": {
    "name": "Arcane Hot Shot",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalChance",
        "maxValue": 6.0,
        "flat": false,
        "stacking": true,
        "baseValue": 1.0
      },
      {
        "stat": "buffDuration",
        "maxValue": 10,
        "flat": true,
        "constantAtAllRanks": true
      }
    ],
    "stackCap": 50
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
        "stacking": false,
        "baseValue": 17.0
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
        "baseValue": 2.0,
        "stacking": true,
        "constantAtAllRanks": true
      },
      {
        "stat": "abilityStrength",
        "maxValue": 2.0,
        "stacking": true,
        "baseValue": 2.0,
        "constantAtAllRanks": true
      }
    ],
    "stackCap": 20
  },
  "arcane_impetus": {
    "name": "Arcane Impetus",
    "trigger": "stacks",
    "maxRank": 5,
    "stackCap": 14,
    "effects": [
      {
        "stat": "abilityEfficiency",
        "maxValue": 3.0,
        "stacking": true,
        "baseValue": 0.5
      },
      {
        "stat": "abilityStrength",
        "maxValue": 6.0,
        "stacking": true,
        "baseValue": 1.0
      }
    ]
  },
  "arcane_intention": {
    "name": "Arcane Intention",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "healthFlat",
        "maxValue": 250,
        "flat": true,
        "stacking": true,
        "baseValue": 40
      }
    ],
    "stackCap": 4
  },
  "arcane_momentum": {
    "name": "Arcane Momentum",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "reloadSpeedChance",
        "maxValue": 60.0,
        "baseValue": 10.0
      },
      {
        "stat": "reloadSpeedBonus",
        "maxValue": 150.0,
        "baseValue": 25.0
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
        "baseValue": 17.0
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
        "valuesByRank": [
          750,
          700,
          650,
          600,
          550,
          500
        ]
      },
      {
        "stat": "removeShields",
        "maxValue": 1,
        "flat": true,
        "constantAtAllRanks": true
      }
    ]
  },
  "arcane_phantasm": {
    "name": "Arcane Phantasm",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "dodgeSpeed",
        "maxValue": 60.0,
        "baseValue": 10.0
      },
      {
        "stat": "healthRegenChance",
        "maxValue": 45.0,
        "baseValue": 7.5
      }
    ]
  },
  "arcane_pistoleer": {
    "name": "Arcane Pistoleer",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "headshotProcChance",
        "maxValue": 60.0,
        "flat": false,
        "stacking": false,
        "baseValue": 10.0
      },
      {
        "stat": "ammoEfficiency",
        "maxValue": 102.0,
        "flat": false,
        "stacking": false,
        "baseValue": 17.0
      },
      {
        "stat": "buffDuration",
        "maxValue": 12,
        "flat": true,
        "constantAtAllRanks": true
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
        "maxValue": 9,
        "stacking": true,
        "baseValue": 2
      }
    ],
    "stackCap": 4
  },
  "arcane_precision": {
    "name": "Arcane Precision",
    "trigger": "onHeadshot",
    "maxRank": 5,
    "effects": [
      {
        "stat": "headshotDamage",
        "maxValue": 300.0,
        "baseValue": 50.0
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
        "baseValue": 50.0
      },
      {
        "stat": "damage",
        "maxValue": 300.0,
        "baseValue": 50.0
      },
      {
        "stat": "armorBonusChance",
        "maxValue": 30.0,
        "baseValue": 5.0
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
        "baseValue": 83.333333
      },
      {
        "stat": "healthOrbPulse",
        "maxValue": 500,
        "constantAtAllRanks": true
      },
      {
        "stat": "healthRegenChance",
        "maxValue": 60.0,
        "baseValue": 10.0
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
        "baseValue": 30.0
      },
      {
        "stat": "healthRegenChance",
        "maxValue": 15.0,
        "baseValue": 2.5
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
        "maxValue": 24,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "flatArmorBonus",
        "maxValue": 660,
        "flat": true,
        "stacking": false
      },
      {
        "stat": "buffDuration",
        "maxValue": 10,
        "flat": true,
        "constantAtAllRanks": true
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
        "maxValue": 102.0,
        "baseValue": 17.0
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
        "baseValue": 25.0
      },
      {
        "stat": "healthRegenChance",
        "maxValue": 60.0,
        "baseValue": 10.0
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
        "maxValue": 20.0,
        "baseValue": 3.333333
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
        "maxValue": 175,
        "baseValue": 125
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
        "baseValue": 10.0
      },
      {
        "stat": "attackSpeedChance",
        "maxValue": 15.0,
        "baseValue": 2.5
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
        "maxValue": 1200,
        "flat": true,
        "baseValue": 200
      }
    ]
  },
  "arcane_tempo": {
    "name": "Arcane Tempo",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "fireRate",
        "maxValue": 90.0,
        "baseValue": 15.0
      },
      {
        "stat": "healthRegenChance",
        "maxValue": 15.0,
        "baseValue": 2.5
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
        "maxValue": 15.0,
        "baseValue": 2.5
      },
      {
        "stat": "invisibilityDuration",
        "maxValue": 30,
        "flat": true,
        "constantAtAllRanks": true
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
        "constantAtAllRanks": true
      },
      {
        "stat": "radialAttackRadius",
        "maxValue": 30,
        "flat": true,
        "constantAtAllRanks": true
      }
    ]
  },
  "arcane_ultimatum": {
    "name": "Arcane Ultimatum",
    "trigger": "onFinisher",
    "maxRank": 5,
    "effects": [
      {
        "stat": "flatArmorBonus",
        "maxValue": 1200,
        "flat": true,
        "baseValue": 200
      },
      {
        "stat": "buffDuration",
        "maxValue": 45,
        "flat": true,
        "constantAtAllRanks": true
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
        "maxValue": 6.0,
        "baseValue": 1.0
      }
    ]
  },
  "arcane_velocity": {
    "name": "Arcane Velocity",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "fireRate",
        "maxValue": 120.0,
        "baseValue": 20.0
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
        "maxValue": 3.0,
        "baseValue": 0.5
      }
    ]
  },
  "arcane_warmth": {
    "name": "Arcane Warmth",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "statusResistance",
        "maxValue": 102.0,
        "baseValue": 17.0
      }
    ]
  },
  "cascadia_accuracy": {
    "name": "Cascadia Accuracy",
    "trigger": "onMovement",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalChance",
        "maxValue": 300.0,
        "flat": false,
        "stacking": false,
        "baseValue": 50.0
      },
      {
        "stat": "buffDuration",
        "maxValue": 4,
        "flat": true,
        "constantAtAllRanks": true
      }
    ]
  },
  "cascadia_empowered": {
    "name": "Cascadia Empowered",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "bonusDamageOnStatus",
        "maxValue": 750.0,
        "flat": true,
        "baseValue": 125.0
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
        "maxValue": 12.0,
        "flat": false,
        "stacking": true,
        "baseValue": 2.0
      }
    ],
    "stackCap": 40
  },
  "cascadia_overcharge": {
    "name": "Cascadia Overcharge",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalChance",
        "maxValue": 300,
        "flat": false,
        "stacking": false,
        "baseValue": 50
      }
    ]
  },
  "conjunction_voltage": {
    "name": "Conjunction Voltage",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "reloadSpeed",
        "maxValue": 1.5,
        "flat": false,
        "stacking": true,
        "baseValue": 0.25
      },
      {
        "stat": "multishot",
        "maxValue": 3.0,
        "flat": false,
        "stacking": true,
        "baseValue": 0.5
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
        "constantAtAllRanks": true
      },
      {
        "stat": "voidMoteEnergy",
        "maxValue": 10,
        "flat": true,
        "constantAtAllRanks": true
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
        "stacking": false,
        "baseValue": 50.0
      },
      {
        "stat": "buffDuration",
        "maxValue": 5,
        "flat": true,
        "constantAtAllRanks": true
      },
      {
        "stat": "cooldown",
        "maxValue": 30,
        "flat": true,
        "constantAtAllRanks": true
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
        "constantAtAllRanks": true
      },
      {
        "stat": "lethalHealPercent",
        "maxValue": 60.0,
        "baseValue": 10.0
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
        "stacking": false,
        "baseValue": 10.0
      },
      {
        "stat": "buffDuration",
        "maxValue": 8,
        "flat": true,
        "constantAtAllRanks": true
      }
    ]
  },
  "eternal_logistics": {
    "name": "Eternal Logistics",
    "trigger": "onVoidSling",
    "maxRank": 5,
    "effects": [
      {
        "stat": "ampAmmoEfficiency",
        "maxValue": 72.0,
        "flat": false,
        "stacking": false,
        "baseValue": 12.0
      },
      {
        "stat": "buffDuration",
        "maxValue": 8,
        "flat": true,
        "constantAtAllRanks": true
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
        "stacking": false,
        "baseValue": 30.0
      },
      {
        "stat": "buffDuration",
        "maxValue": 8,
        "flat": true,
        "constantAtAllRanks": true
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
        "maxValue": 5.0,
        "valuesByRank": [
          1.25,
          2.5,
          3.75,
          5.0
        ]
      },
      {
        "stat": "buffDuration",
        "maxValue": 4,
        "flat": true,
        "valuesByRank": [
          4,
          4,
          4,
          4
        ]
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
        "stat": "contagionProjectileDamage",
        "maxValue": 400,
        "valuesByRank": [
          100,
          200,
          300,
          400
        ]
      },
      {
        "stat": "contagionExplosionRadius",
        "maxValue": 8,
        "flat": true,
        "valuesByRank": [
          8,
          8,
          8,
          8
        ]
      }
    ]
  },
  "exodia_epidemic": {
    "name": "Exodia Epidemic",
    "trigger": "onMovement",
    "maxRank": 3,
    "effects": [
      {
        "stat": "epidemicSuspendDuration",
        "maxValue": 4,
        "valuesByRank": [
          1,
          2,
          3,
          4
        ]
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
        "valuesByRank": [
          50,
          50,
          50,
          50
        ]
      },
      {
        "stat": "procDamageMultiplier",
        "maxValue": 200,
        "valuesByRank": [
          50,
          100,
          150,
          200
        ]
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
        "constantAtAllRanks": true
      },
      {
        "stat": "pullRadius",
        "maxValue": 12,
        "flat": true,
        "valuesByRank": [
          6,
          8,
          10,
          12
        ]
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
        "constantAtAllRanks": true
      },
      {
        "stat": "lifeSteal",
        "maxValue": 30,
        "valuesByRank": [
          7.5,
          15,
          22.5,
          30
        ]
      },
      {
        "stat": "buffDuration",
        "maxValue": 8,
        "flat": true,
        "constantAtAllRanks": true
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
        "stacking": false,
        "valuesByRank": [
          12.5,
          25,
          37.5,
          50
        ]
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
        "stacking": false,
        "valuesByRank": [
          50,
          100,
          150,
          200
        ]
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
        "baseValue": 40.0
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
        "baseValue": 50.0
      }
    ]
  },
  "magus_accelerant": {
    "name": "Magus Accelerant",
    "trigger": "onVoidSling",
    "maxRank": 5,
    "effects": [
      {
        "stat": "enemyResistanceReduction",
        "maxValue": 65.0,
        "baseValue": 10.833333
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
        "stacking": false,
        "baseValue": 50.0
      },
      {
        "stat": "attackCount",
        "maxValue": 4,
        "flat": true,
        "constantAtAllRanks": true
      },
      {
        "stat": "cooldown",
        "maxValue": 20,
        "flat": true,
        "constantAtAllRanks": true
      }
    ]
  },
  "magus_anomaly": {
    "name": "Magus Anomaly",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "voidPullRadius",
        "maxValue": 30,
        "flat": true,
        "constantAtAllRanks": true
      }
    ]
  },
  "magus_cadence": {
    "name": "Magus Cadence",
    "trigger": "onVoidSling",
    "maxRank": 5,
    "effects": [
      {
        "stat": "sprintSpeed",
        "maxValue": 90.0,
        "baseValue": 15.0
      }
    ]
  },
  "magus_cloud": {
    "name": "Magus Cloud",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "voidSlingRadius",
        "maxValue": 300.0,
        "baseValue": 50.0
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
        "maxValue": 65.0,
        "baseValue": 10.833333
      }
    ]
  },
  "magus_drive": {
    "name": "Magus Drive",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "kdDriveSpeed",
        "maxValue": 150.0,
        "baseValue": 25.0
      }
    ]
  },
  "magus_elevate": {
    "name": "Magus Elevate",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "healthRegenChance",
        "maxValue": 95.0,
        "constantAtAllRanks": true
      },
      {
        "stat": "operatorToWarframeHeal",
        "maxValue": 300.0,
        "baseValue": 50.0
      }
    ]
  },
  "magus_firewall": {
    "name": "Magus Firewall",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "damageReduction",
        "maxValue": 12.5,
        "baseValue": 2.083333
      },
      {
        "stat": "voidModeDamageReduction",
        "maxValue": 60.0,
        "flat": true,
        "baseValue": 10.0
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
        "maxValue": 102.0,
        "flat": false,
        "stacking": false,
        "baseValue": 17.0
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
        "maxValue": 300.0,
        "flat": true,
        "baseValue": 50.0
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
        "maxValue": 4,
        "flat": true,
        "constantAtAllRanks": true
      },
      {
        "stat": "voidTrapRadius",
        "maxValue": 15,
        "flat": true,
        "constantAtAllRanks": true
      }
    ]
  },
  "magus_melt": {
    "name": "Magus Melt",
    "trigger": "stacks",
    "maxRank": 5,
    "stackCap": 7,
    "effects": [
      {
        "stat": "operatorHeatDamage",
        "maxValue": 30.0,
        "stacking": true,
        "baseValue": 5.0
      }
    ]
  },
  "magus_nourish": {
    "name": "Magus Nourish",
    "trigger": "passive",
    "maxRank": 5,
    "effects": [
      {
        "stat": "operatorToWarframeHeal",
        "maxValue": 35.0,
        "flat": true,
        "baseValue": 10.0
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
        "maxValue": 80.0,
        "baseValue": 13.333333
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
        "maxValue": 25.0,
        "baseValue": 5.0
      },
      {
        "stat": "repairRadius",
        "maxValue": 30,
        "flat": true,
        "constantAtAllRanks": true
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
        "maxValue": 30.0,
        "baseValue": 5.0
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
        "stacking": false,
        "constantAtAllRanks": true
      },
      {
        "stat": "revertHeal",
        "maxValue": 60,
        "flat": true,
        "stacking": false,
        "constantAtAllRanks": true
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
        "maxValue": 600.0,
        "flat": true,
        "baseValue": 100.0
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
        "stacking": false,
        "baseValue": 1
      }
    ]
  },
  "arcane_melee_animosity": {
    "name": "Melee Animosity",
    "trigger": "stacks",
    "maxRank": 5,
    "stackCap": 10,
    "effects": [
      {
        "stat": "criticalChance",
        "maxValue": 42.0,
        "baseValue": 7.0
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
        "baseValue": 25.0
      },
      {
        "stat": "shieldRestorePercent",
        "maxValue": 30,
        "constantAtAllRanks": true
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
        "maxValue": 250.0,
        "baseValue": 41.666667
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
        "maxValue": 6,
        "flat": true,
        "stacking": false,
        "constantAtAllRanks": true
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
        "maxValue": 100.0,
        "flat": false,
        "stacking": false,
        "baseValue": 16.666667
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
        "baseValue": 25
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
        "maxValue": 240.0,
        "stacking": true,
        "baseValue": 40.0
      },
      {
        "stat": "corrosiveDamage",
        "maxValue": 60.0,
        "baseValue": 10.0
      }
    ],
    "stackCap": 240
  },
  "melee_fortification": {
    "name": "Melee Fortification",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "flatArmorBonus",
        "maxValue": 210,
        "flat": true,
        "stacking": true,
        "baseValue": 35
      },
      {
        "stat": "buffDuration",
        "maxValue": 10,
        "flat": true,
        "constantAtAllRanks": true
      }
    ],
    "stackCap": 30
  },
  "melee_influence": {
    "name": "Melee Influence",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "elementalProcChance",
        "maxValue": 20.0,
        "baseValue": 20.0,
        "constantAtAllRanks": true
      },
      {
        "stat": "procAuraRadius",
        "maxValue": 20,
        "baseValue": 10,
        "flat": true
      },
      {
        "stat": "buffDuration",
        "maxValue": 18,
        "baseValue": 3,
        "flat": true
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
        "stacking": false,
        "baseValue": 5.0
      },
      {
        "stat": "meleeDamagePerShieldCap",
        "maxValue": 420.0,
        "flat": false,
        "stacking": false,
        "baseValue": 70.0
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
        "maxValue": 45.0,
        "baseValue": 7.5
      },
      {
        "stat": "pullRadius",
        "maxValue": 18,
        "flat": true,
        "constantAtAllRanks": true
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
        "stacking": true,
        "baseValue": 0.04
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
        "maxValue": 36.0,
        "flat": false,
        "stacking": false,
        "baseValue": 6.0
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
        "stacking": false,
        "constantAtAllRanks": true
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
        "baseValue": 15
      }
    ]
  },
  "pax_bolt": {
    "name": "Pax Bolt",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "abilityEfficiency",
        "maxValue": 30,
        "valuesByRank": [
          7.5,
          15,
          22.5,
          30
        ]
      },
      {
        "stat": "abilityStrength",
        "maxValue": 30,
        "valuesByRank": [
          7.5,
          15,
          22.5,
          30
        ]
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
        "maxValue": 50,
        "valuesByRank": [
          12.5,
          25,
          37.5,
          50
        ]
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
        "maxValue": 4,
        "flat": true,
        "valuesByRank": [
          1,
          2,
          3,
          4
        ]
      }
    ]
  },
  "pax_soar": {
    "name": "Pax Soar",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "airborneAccuracy",
        "maxValue": 50,
        "valuesByRank": [
          12.5,
          25,
          37.5,
          50
        ]
      },
      {
        "stat": "airborneRecoilReduction",
        "maxValue": 50,
        "valuesByRank": [
          12.5,
          25,
          37.5,
          50
        ]
      },
      {
        "stat": "aimGlideDuration",
        "maxValue": 5,
        "flat": true,
        "valuesByRank": [
          1.3,
          2.5,
          3.8,
          5
        ]
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
        "stacking": true,
        "baseValue": 0.3
      },
      {
        "stat": "criticalMultiplier",
        "maxValue": 3.6,
        "stacking": true,
        "baseValue": 0.6
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
        "maxValue": 500.0,
        "baseValue": 83.333333
      },
      {
        "stat": "damagePerArmorThreshold",
        "maxValue": 1000,
        "flat": true,
        "constantAtAllRanks": true
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
        "baseValue": 0.916667
      },
      {
        "stat": "damage",
        "maxValue": 100.0,
        "baseValue": 16.666667
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
        "baseValue": 1.0
      },
      {
        "stat": "statusChancePerHit",
        "maxValue": 30.0,
        "baseValue": 5.0
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
        "maxValue": 120.0,
        "stacking": true,
        "baseValue": 20.0
      },
      {
        "stat": "headshotMultiplier",
        "maxValue": 30.0,
        "baseValue": 5.0
      },
      {
        "stat": "recoilReduction",
        "maxValue": 50.0,
        "baseValue": 8.333333
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
        "constantAtAllRanks": true
      },
      {
        "stat": "statusProcChance",
        "maxValue": 100.0,
        "baseValue": 50.0
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
        "maxValue": 60.0,
        "stacking": true,
        "baseValue": 10.0
      },
      {
        "stat": "comboDuration",
        "maxValue": 7.5,
        "flat": true,
        "constantAtAllRanks": true
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
        "stacking": true,
        "baseValue": 0.2
      },
      {
        "stat": "buffDuration",
        "maxValue": 10,
        "flat": true,
        "constantAtAllRanks": true
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
        "stacking": true,
        "baseValue": 0.375
      },
      {
        "stat": "criticalMultiplier",
        "maxValue": 3.0,
        "stacking": true,
        "baseValue": 0.5
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
        "maxValue": 30.0,
        "stacking": true,
        "baseValue": 5.0
      },
      {
        "stat": "damage",
        "maxValue": 30.0,
        "stacking": true,
        "baseValue": 5.0
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
        "constantAtAllRanks": true
      },
      {
        "stat": "weaponJamCooldown",
        "maxValue": 10,
        "flat": true,
        "baseValue": 60
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
        "maxValue": 350.0,
        "baseValue": 58.333333
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
        "maxValue": 100.0,
        "baseValue": 16.666667
      },
      {
        "stat": "buffDuration",
        "maxValue": 10,
        "flat": true,
        "constantAtAllRanks": true
      }
    ]
  },
  "residual_boils": {
    "name": "Residual Boils",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "zoneDuration",
        "maxValue": 12,
        "valuesByRank": [
          3,
          6,
          9,
          12
        ]
      },
      {
        "stat": "healthRegenChance",
        "maxValue": 20.0,
        "baseValue": 5.0
      },
      {
        "stat": "zoneDamage",
        "maxValue": 80,
        "valuesByRank": [
          80,
          80,
          80,
          80
        ]
      },
      {
        "stat": "zoneRadius",
        "maxValue": 10,
        "valuesByRank": [
          10,
          10,
          10,
          10
        ]
      }
    ]
  },
  "residual_malodor": {
    "name": "Residual Malodor",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "healthRegenChance",
        "maxValue": 20.0,
        "baseValue": 5.0
      },
      {
        "stat": "buffDuration",
        "maxValue": 12,
        "flat": true,
        "constantAtAllRanks": true
      },
      {
        "stat": "zoneDamagePerSec",
        "maxValue": 40,
        "valuesByRank": [
          40,
          40,
          40,
          40
        ]
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
        "maxValue": 12.0,
        "flat": true,
        "baseValue": 3.0
      },
      {
        "stat": "healthRegenChance",
        "maxValue": 20.0,
        "baseValue": 5.0
      },
      {
        "stat": "zoneDamage",
        "maxValue": 200,
        "flat": true,
        "valuesByRank": [
          200,
          200,
          200,
          200
        ]
      },
      {
        "stat": "zoneRadius",
        "maxValue": 10,
        "flat": true,
        "valuesByRank": [
          10,
          10,
          10,
          10
        ]
      }
    ]
  },
  "residual_viremia": {
    "name": "Residual Viremia",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "zoneDamagePerSec",
        "maxValue": 40,
        "flat": true,
        "valuesByRank": [
          40,
          40,
          40,
          40
        ]
      },
      {
        "stat": "healthRegenChance",
        "maxValue": 20.0,
        "baseValue": 5.0
      },
      {
        "stat": "zoneDuration",
        "maxValue": 12,
        "valuesByRank": [
          3,
          6,
          9,
          12
        ]
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
        "constantAtAllRanks": true
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
        "maxValue": 120.0,
        "stacking": true,
        "baseValue": 20.0
      },
      {
        "stat": "headshotMultiplier",
        "maxValue": 30.0,
        "baseValue": 5.0
      },
      {
        "stat": "recoilReduction",
        "maxValue": 50.0,
        "baseValue": 8.333333
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
        "maxValue": 60.0,
        "stacking": true,
        "baseValue": 10.0
      },
      {
        "stat": "comboDuration",
        "maxValue": 7.5,
        "flat": true,
        "constantAtAllRanks": true
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
        "maxValue": 24.0,
        "flat": false,
        "stacking": false,
        "baseValue": 4.0
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
        "maxValue": 10.0,
        "baseValue": 1.666667
      },
      {
        "stat": "bigCritThreshold",
        "maxValue": 6,
        "flat": true,
        "constantAtAllRanks": true
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
        "maxValue": 8.0,
        "flat": true,
        "baseValue": 1.333333
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
        "baseValue": 30.0
      },
      {
        "stat": "procAuraRadius",
        "maxValue": 7,
        "flat": true,
        "constantAtAllRanks": true
      }
    ]
  },
  "secondary_kinship": {
    "name": "Secondary Kinship",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "criticalChance",
        "maxValue": 20.0,
        "stacking": true,
        "baseValue": 3.333333
      }
    ],
    "stackCap": 24
  },
  "arcane_secondary_merciless": {
    "name": "Secondary Merciless",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "reloadSpeed",
        "maxValue": 30.0,
        "stacking": true,
        "baseValue": 5.0
      },
      {
        "stat": "damage",
        "maxValue": 30.0,
        "stacking": true,
        "baseValue": 5.0
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
        "maxValue": 20.0,
        "stacking": true,
        "baseValue": 3.333333
      }
    ]
  },
  "secondary_shiver": {
    "name": "Secondary Shiver",
    "trigger": "stacks",
    "maxRank": 5,
    "stackCap": 10,
    "effects": [
      {
        "stat": "damage",
        "maxValue": 45.0,
        "flat": false,
        "stacking": true,
        "baseValue": 7.5
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
        "maxValue": 800.0,
        "baseValue": 133.333333
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
        "baseValue": 12.5
      },
      {
        "stat": "multishot",
        "maxValue": 180.0,
        "baseValue": 30.0
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
        "maxValue": 200.0,
        "baseValue": 33.333333
      }
    ]
  },
  "theorem_demulcent": {
    "name": "Theorem Demulcent",
    "trigger": "stacks",
    "maxRank": 5,
    "stackCap": 15,
    "effects": [
      {
        "stat": "damage",
        "maxValue": 12.0,
        "flat": false,
        "stacking": true,
        "baseValue": 2.0
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
        "maxValue": 24.0,
        "stacking": true,
        "baseValue": 4.0
      }
    ],
    "stackCap": 15
  },
  "virtuos_forge": {
    "name": "Virtuos Forge",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "voidConversion",
        "maxValue": 96,
        "baseValue": 24
      }
    ]
  },
  "virtuos_fury": {
    "name": "Virtuos Fury",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "healthRegenChance",
        "maxValue": 20.0,
        "baseValue": 20.0,
        "constantAtAllRanks": true
      },
      {
        "stat": "damage",
        "maxValue": 30.0,
        "baseValue": 7.5
      }
    ]
  },
  "virtuos_ghost": {
    "name": "Virtuos Ghost",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "healthRegenChance",
        "maxValue": 40.0,
        "baseValue": 10.0
      },
      {
        "stat": "ampStatusChance",
        "maxValue": 60.0,
        "baseValue": 15.0
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
        "stacking": false,
        "baseValue": 5.0
      },
      {
        "stat": "buffDuration",
        "maxValue": 4,
        "flat": true,
        "constantAtAllRanks": true
      }
    ]
  },
  "virtuos_shadow": {
    "name": "Virtuos Shadow",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "healthRegenChance",
        "maxValue": 40.0,
        "baseValue": 40.0,
        "constantAtAllRanks": true
      },
      {
        "stat": "critChanceOnDamaged",
        "maxValue": 60.0,
        "baseValue": 15.0
      }
    ]
  },
  "virtuos_spike": {
    "name": "Virtuos Spike",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "voidConversion",
        "maxValue": 96,
        "baseValue": 24
      }
    ]
  },
  "virtuos_strike": {
    "name": "Virtuos Strike",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "healthRegenChance",
        "maxValue": 20.0,
        "baseValue": 20.0,
        "constantAtAllRanks": true
      },
      {
        "stat": "ampCritDamage",
        "maxValue": 80.0,
        "baseValue": 20.0
      }
    ]
  },
  "virtuos_surge": {
    "name": "Virtuos Surge",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "voidConversion",
        "maxValue": 96,
        "baseValue": 24
      }
    ]
  },
  "virtuos_tempo": {
    "name": "Virtuos Tempo",
    "trigger": "conditional",
    "maxRank": 3,
    "effects": [
      {
        "stat": "ampFireRate",
        "maxValue": 60.0,
        "baseValue": 15.0
      },
      {
        "stat": "healthRegenChance",
        "maxValue": 60.0,
        "baseValue": 60.0,
        "constantAtAllRanks": true
      }
    ]
  },
  "virtuos_trojan": {
    "name": "Virtuos Trojan",
    "trigger": "passive",
    "maxRank": 3,
    "effects": [
      {
        "stat": "voidConversion",
        "maxValue": 96,
        "baseValue": 24
      }
    ]
  },
  "zid_an_asheir": {
    "name": "Zid-An Asheir",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "statusChancePerHit",
        "maxValue": 6.0,
        "flat": false,
        "stacking": true,
        "baseValue": 1.0
      },
      {
        "stat": "tauronStrikeCharge",
        "maxValue": 18.0,
        "flat": false,
        "stacking": false,
        "baseValue": 3.0
      },
      {
        "stat": "buffDuration",
        "maxValue": 30,
        "flat": true,
        "constantAtAllRanks": true
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
        "maxValue": 48.0,
        "flat": false,
        "stacking": false,
        "baseValue": 8.0
      },
      {
        "stat": "ampAmmoEfficiency",
        "maxValue": 18.0,
        "flat": false,
        "stacking": false,
        "baseValue": 3.0
      },
      {
        "stat": "buffDuration",
        "maxValue": 30,
        "flat": true,
        "constantAtAllRanks": true
      }
    ]
  },
  "zid_an_osbok": {
    "name": "Zid-An Osbok",
    "trigger": "conditional",
    "maxRank": 5,
    "effects": [
      {
        "stat": "overguardStrip",
        "maxValue": 30,
        "flat": false,
        "stacking": false,
        "baseValue": 5
      },
      {
        "stat": "ampCritDamage",
        "maxValue": 3,
        "baseValue": 0.5,
        "flat": true
      },
      {
        "stat": "buffDuration",
        "maxValue": 15,
        "flat": true,
        "constantAtAllRanks": true
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
        "constantAtAllRanks": true
      },
      {
        "stat": "tauronChargeRate",
        "maxValue": 9.0,
        "baseValue": 1.5
      }
    ]
  },
  "zid_an_uskos": {
    "name": "Zid-An Uskos",
    "trigger": "stacks",
    "maxRank": 5,
    "effects": [
      {
        "stat": "secondaryHeatDamage",
        "maxValue": 2.4,
        "flat": false,
        "stacking": true,
        "baseValue": 0.4
      }
    ],
    "stackCap": 105
  }
};
