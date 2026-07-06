/**
 * Per-arcane effect apply rules — one entry per arcane, one line per effect stat.
 * Regenerate: python scripts/generate_arcane_behaviors.py
 *
 * Edit individual lines here only — no blanket stat rules.
 */
import type { VerifiedArcaneBehavior } from "@/lib/item-behavior-types";

export const VERIFIED_ARCANE_BEHAVIORS: Record<string, VerifiedArcaneBehavior> = {

  "akimbo_slip_shot": {
    arcaneId: "akimbo_slip_shot",
    effects: [
      {"statKey": "ammoEfficiency", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Akimbo Slip Shot: ammoEfficiency (always active while equipped)"},
    ],
  },
  "arcane_acceleration": {
    arcaneId: "arcane_acceleration",
    effects: [
      {"statKey": "fireRate", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Acceleration: fireRate (conditional proc)"},
      {"statKey": "holsterDamage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Acceleration: holsterDamage (conditional proc)"},
      {"statKey": "fireRateOnCrit", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Acceleration: fireRateOnCrit (conditional proc)"},
    ],
  },
  "arcane_aegis": {
    arcaneId: "arcane_aegis",
    effects: [
      {"statKey": "shieldRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Aegis: shieldRegenChance (when damaged proc)"},
      {"statKey": "shieldRegenAmount", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Aegis: shieldRegenAmount (when damaged proc)"},
    ],
  },
  "arcane_agility": {
    arcaneId: "arcane_agility",
    effects: [
      {"statKey": "parkourVelocity", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Agility: parkourVelocity (when damaged proc)"},
    ],
  },
  "arcane_arachne": {
    arcaneId: "arcane_arachne",
    effects: [
      {"statKey": "wallLatchDamage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Arachne: wallLatchDamage (conditional proc)"},
    ],
  },
  "arcane_avenger": {
    arcaneId: "arcane_avenger",
    effects: [
      {"statKey": "criticalChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Avenger: criticalChance (when damaged proc)"},
    ],
  },
  "arcane_awakening": {
    arcaneId: "arcane_awakening",
    effects: [
      {"statKey": "holsterDamage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Awakening: holsterDamage (on reload proc)"},
    ],
  },
  "arcane_barrier": {
    arcaneId: "arcane_barrier",
    effects: [
      {"statKey": "shieldRestoreChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Barrier: shieldRestoreChance (when damaged proc)"},
    ],
  },
  "arcane_battery": {
    arcaneId: "arcane_battery",
    customHandler: "arcane_battery",
    effects: [
      {"statKey": "energyPerArmor", "target": "arcane_panel", "mode": "custom", "source": "Arcane Battery: custom handler"},
    ],
  },
  "arcane_bellicose": {
    arcaneId: "arcane_bellicose",
    customHandler: "arcane_bellicose",
    effects: [
      {"statKey": "abilityStrengthPerHealth", "target": "arcane_panel", "mode": "custom", "source": "Arcane Bellicose: custom handler"},
      {"statKey": "abilityStrengthPerHealthStep", "target": "arcane_panel", "mode": "custom", "source": "Arcane Bellicose: custom handler"},
      {"statKey": "abilityStrength", "target": "arcane_panel", "mode": "custom", "source": "Arcane Bellicose: custom handler"},
    ],
  },
  "arcane_blade_charger": {
    arcaneId: "arcane_blade_charger",
    effects: [
      {"statKey": "meleeDamageChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Blade Charger: meleeDamageChance (on kill proc)"},
      {"statKey": "meleeDamageBonus", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Blade Charger: meleeDamageBonus (on kill proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Blade Charger: buffDuration (on kill proc)"},
    ],
  },
  "arcane_blessing": {
    arcaneId: "arcane_blessing",
    effects: [
      {"statKey": "healthFlat", "target": "warframe_totals", "mode": "flat", "source": "Arcane Blessing: healthFlat (stacking — applies at sim stack count)"},
    ],
  },
  "arcane_bodyguard": {
    arcaneId: "arcane_bodyguard",
    effects: [
      {"statKey": "companionHeal", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Bodyguard: companionHeal (conditional proc)"},
    ],
  },
  "arcane_camisado": {
    arcaneId: "arcane_camisado",
    effects: [
      {"statKey": "abilityStrength", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Camisado: abilityStrength (conditional proc)"},
    ],
  },
  "arcane_circumvent": {
    arcaneId: "arcane_circumvent",
    effects: [
      {"statKey": "armorSteal", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Circumvent: armorSteal (conditional proc)"},
    ],
  },
  "arcane_concentration": {
    arcaneId: "arcane_concentration",
    effects: [
      {"statKey": "abilityDuration", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Concentration: abilityDuration (on ability cast proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Concentration: buffDuration (on ability cast proc)"},
    ],
  },
  "arcane_consequence": {
    arcaneId: "arcane_consequence",
    effects: [
      {"statKey": "parkourVelocity", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Consequence: parkourVelocity (on headshot proc)"},
    ],
  },
  "arcane_crepuscular": {
    arcaneId: "arcane_crepuscular",
    customHandler: "arcane_crepuscular",
    effects: [
      {"statKey": "abilityStrength", "target": "arcane_panel", "mode": "custom", "source": "Arcane Crepuscular: custom handler"},
      {"statKey": "criticalMultiplier", "target": "arcane_panel", "mode": "custom", "source": "Arcane Crepuscular: custom handler"},
    ],
  },
  "arcane_deflection": {
    arcaneId: "arcane_deflection",
    effects: [
      {"statKey": "statusResistance", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Deflection: statusResistance (always active while equipped)"},
    ],
  },
  "arcane_double_back": {
    arcaneId: "arcane_double_back",
    effects: [
      {"statKey": "damageReduction", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Double Back: damageReduction (stacking — applies at sim stack count)"},
    ],
  },
  "arcane_energize": {
    arcaneId: "arcane_energize",
    customHandler: "arcane_energize",
    effects: [
      {"statKey": "energyOrbBonus", "target": "arcane_panel", "mode": "custom", "source": "Arcane Energize: custom handler"},
      {"statKey": "allyEnergy", "target": "arcane_panel", "mode": "custom", "source": "Arcane Energize: custom handler"},
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "custom", "source": "Arcane Energize: custom handler"},
    ],
  },
  "arcane_eruption": {
    arcaneId: "arcane_eruption",
    customHandler: "arcane_eruption",
    effects: [
      {"statKey": "knockdownChance", "target": "arcane_panel", "mode": "custom", "source": "Arcane Eruption: custom handler"},
    ],
  },
  "arcane_escapist": {
    arcaneId: "arcane_escapist",
    customHandler: "arcane_escapist",
    effects: [
      {"statKey": "escapistStackCap", "target": "arcane_panel", "mode": "custom", "source": "Arcane Escapist: custom handler"},
      {"statKey": "invulnerabilityDuration", "target": "arcane_panel", "mode": "custom", "source": "Arcane Escapist: custom handler"},
    ],
  },
  "arcane_expertise": {
    arcaneId: "arcane_expertise",
    customHandler: "arcane_expertise",
    effects: [
      {"statKey": "abilityStrengthToShield", "target": "arcane_panel", "mode": "custom", "source": "Arcane Expertise: custom handler"},
    ],
  },
  "arcane_fury": {
    arcaneId: "arcane_fury",
    effects: [
      {"statKey": "meleeDamageBonus", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Fury: meleeDamageBonus (conditional proc)"},
      {"statKey": "meleeDamageChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Fury: meleeDamageChance (conditional proc)"},
    ],
  },
  "arcane_grace": {
    arcaneId: "arcane_grace",
    effects: [
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Grace: healthRegenChance (when damaged proc)"},
      {"statKey": "healthRegenAmount", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Grace: healthRegenAmount (when damaged proc)"},
    ],
  },
  "arcane_guardian": {
    arcaneId: "arcane_guardian",
    effects: [
      {"statKey": "armorBonusChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Guardian: armorBonusChance (when damaged proc)"},
      {"statKey": "flatArmorBonus", "target": "warframe_totals", "mode": "flat", "source": "Arcane Guardian: flatArmorBonus (when damaged proc)"},
    ],
  },
  "arcane_healing": {
    arcaneId: "arcane_healing",
    effects: [
      {"statKey": "statusResistance", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Healing: statusResistance (on status proc)"},
    ],
  },
  "arcane_hot_shot": {
    arcaneId: "arcane_hot_shot",
    effects: [
      {"statKey": "criticalChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Hot Shot: criticalChance (always active while equipped)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Hot Shot: buffDuration (always active while equipped)"},
    ],
  },
  "arcane_ice": {
    arcaneId: "arcane_ice",
    effects: [
      {"statKey": "statusResistance", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Ice: statusResistance (always active while equipped)"},
    ],
  },
  "arcane_ice_storm": {
    arcaneId: "arcane_ice_storm",
    effects: [
      {"statKey": "abilityDuration", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Ice Storm: abilityDuration (stacking — applies at sim stack count)"},
      {"statKey": "abilityStrength", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Ice Storm: abilityStrength (stacking — applies at sim stack count)"},
    ],
  },
  "arcane_impetus": {
    arcaneId: "arcane_impetus",
    effects: [
      {"statKey": "abilityEfficiency", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Impetus: abilityEfficiency (conditional proc)"},
      {"statKey": "abilityStrength", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Impetus: abilityStrength (conditional proc)"},
    ],
  },
  "arcane_intention": {
    arcaneId: "arcane_intention",
    effects: [
      {"statKey": "healthFlat", "target": "warframe_totals", "mode": "flat", "source": "Arcane Intention: healthFlat (always active while equipped)"},
    ],
  },
  "arcane_melee_animosity": {
    arcaneId: "arcane_melee_animosity",
    effects: [
      {"statKey": "criticalChance", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Melee Animosity: criticalChance (always active while equipped)"},
      {"statKey": "meleeHeavyCrit", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Melee Animosity: meleeHeavyCrit (always active while equipped)"},
    ],
  },
  "arcane_momentum": {
    arcaneId: "arcane_momentum",
    effects: [
      {"statKey": "reloadSpeedChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Momentum: reloadSpeedChance (conditional proc)"},
      {"statKey": "reloadSpeedBonus", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Momentum: reloadSpeedBonus (conditional proc)"},
    ],
  },
  "arcane_nullifier": {
    arcaneId: "arcane_nullifier",
    effects: [
      {"statKey": "statusResistance", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Nullifier: statusResistance (always active while equipped)"},
    ],
  },
  "arcane_persistence": {
    arcaneId: "arcane_persistence",
    customHandler: "arcane_persistence",
    effects: [
      {"statKey": "persistenceDamageCapPerSecond", "target": "arcane_panel", "mode": "custom", "source": "Arcane Persistence: custom handler"},
      {"statKey": "removeShields", "target": "arcane_panel", "mode": "custom", "source": "Arcane Persistence: custom handler"},
    ],
  },
  "arcane_phantasm": {
    arcaneId: "arcane_phantasm",
    effects: [
      {"statKey": "dodgeSpeed", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Phantasm: dodgeSpeed (conditional proc)"},
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Phantasm: healthRegenChance (conditional proc)"},
    ],
  },
  "arcane_pistoleer": {
    arcaneId: "arcane_pistoleer",
    effects: [
      {"statKey": "headshotProcChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Pistoleer: headshotProcChance (conditional proc)"},
      {"statKey": "ammoEfficiency", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Pistoleer: ammoEfficiency (conditional proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Pistoleer: buffDuration (conditional proc)"},
    ],
  },
  "arcane_power_ramp": {
    arcaneId: "arcane_power_ramp",
    effects: [
      {"statKey": "abilityStrength", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Power Ramp: abilityStrength (stacking — applies at sim stack count)"},
    ],
  },
  "arcane_precision": {
    arcaneId: "arcane_precision",
    effects: [
      {"statKey": "headshotDamage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Precision: headshotDamage (on headshot proc)"},
    ],
  },
  "arcane_primary_charger": {
    arcaneId: "arcane_primary_charger",
    effects: [
      {"statKey": "holsterDamage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Primary Charger: holsterDamage (on melee kill proc)"},
      {"statKey": "damage", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Arcane Primary Charger: damage (on melee kill proc)"},
      {"statKey": "armorBonusChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Primary Charger: armorBonusChance (on melee kill proc)"},
    ],
  },
  "arcane_primary_deadhead": {
    arcaneId: "arcane_primary_deadhead",
    customHandler: "arcane_primary_deadhead",
    effects: [
      {"statKey": "damage", "target": "arcane_panel", "mode": "custom", "source": "Primary Deadhead: custom handler"},
      {"statKey": "headshotMultiplier", "target": "arcane_panel", "mode": "custom", "source": "Primary Deadhead: custom handler"},
      {"statKey": "recoilReduction", "target": "arcane_panel", "mode": "custom", "source": "Primary Deadhead: custom handler"},
    ],
  },
  "arcane_primary_dexterity": {
    arcaneId: "arcane_primary_dexterity",
    customHandler: "arcane_primary_dexterity",
    effects: [
      {"statKey": "damage", "target": "arcane_panel", "mode": "custom", "source": "Primary Dexterity: custom handler"},
      {"statKey": "comboDuration", "target": "arcane_panel", "mode": "custom", "source": "Primary Dexterity: custom handler"},
    ],
  },
  "arcane_primary_merciless": {
    arcaneId: "arcane_primary_merciless",
    customHandler: "arcane_primary_merciless",
    effects: [
      {"statKey": "reloadSpeed", "target": "arcane_panel", "mode": "custom", "source": "Primary Merciless: custom handler"},
      {"statKey": "damage", "target": "arcane_panel", "mode": "custom", "source": "Primary Merciless: custom handler"},
    ],
  },
  "arcane_pulse": {
    arcaneId: "arcane_pulse",
    effects: [
      {"statKey": "healthFromOrbs", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Pulse: healthFromOrbs (on pickup proc)"},
      {"statKey": "healthOrbPulse", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Pulse: healthOrbPulse (on pickup proc)"},
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Pulse: healthRegenChance (on pickup proc)"},
    ],
  },
  "arcane_rage": {
    arcaneId: "arcane_rage",
    effects: [
      {"statKey": "holsterDamage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Rage: holsterDamage (on headshot proc)"},
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Rage: healthRegenChance (on headshot proc)"},
    ],
  },
  "arcane_reaper": {
    arcaneId: "arcane_reaper",
    effects: [
      {"statKey": "healthRegenPerSec", "target": "warframe_totals", "mode": "flat", "source": "Arcane Reaper: healthRegenPerSec (on melee kill proc)"},
      {"statKey": "flatArmorBonus", "target": "warframe_totals", "mode": "flat", "source": "Arcane Reaper: flatArmorBonus (on melee kill proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Reaper: buffDuration (on melee kill proc)"},
    ],
  },
  "arcane_resistance": {
    arcaneId: "arcane_resistance",
    effects: [
      {"statKey": "statusResistance", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Resistance: statusResistance (always active while equipped)"},
    ],
  },
  "arcane_rise": {
    arcaneId: "arcane_rise",
    effects: [
      {"statKey": "holsterDamage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Rise: holsterDamage (on reload proc)"},
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Rise: healthRegenChance (on reload proc)"},
    ],
  },
  "arcane_sculptor": {
    arcaneId: "arcane_sculptor",
    effects: [
      {"statKey": "abilityEfficiency", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Sculptor: abilityEfficiency (conditional proc)"},
    ],
  },
  "arcane_secondary_deadhead": {
    arcaneId: "arcane_secondary_deadhead",
    customHandler: "arcane_secondary_deadhead",
    effects: [
      {"statKey": "damage", "target": "arcane_panel", "mode": "custom", "source": "Secondary Deadhead: custom handler"},
      {"statKey": "headshotMultiplier", "target": "arcane_panel", "mode": "custom", "source": "Secondary Deadhead: custom handler"},
      {"statKey": "recoilReduction", "target": "arcane_panel", "mode": "custom", "source": "Secondary Deadhead: custom handler"},
    ],
  },
  "arcane_secondary_dexterity": {
    arcaneId: "arcane_secondary_dexterity",
    customHandler: "arcane_secondary_dexterity",
    effects: [
      {"statKey": "damage", "target": "arcane_panel", "mode": "custom", "source": "Secondary Dexterity: custom handler"},
      {"statKey": "comboDuration", "target": "arcane_panel", "mode": "custom", "source": "Secondary Dexterity: custom handler"},
    ],
  },
  "arcane_secondary_merciless": {
    arcaneId: "arcane_secondary_merciless",
    customHandler: "arcane_secondary_merciless",
    effects: [
      {"statKey": "reloadSpeed", "target": "arcane_panel", "mode": "custom", "source": "Secondary Merciless: custom handler"},
      {"statKey": "damage", "target": "arcane_panel", "mode": "custom", "source": "Secondary Merciless: custom handler"},
    ],
  },
  "arcane_steadfast": {
    arcaneId: "arcane_steadfast",
    customHandler: "arcane_steadfast",
    effects: [
      {"statKey": "freeAbilityCastChance", "target": "arcane_panel", "mode": "custom", "source": "Arcane Steadfast: custom handler"},
    ],
  },
  "arcane_strike": {
    arcaneId: "arcane_strike",
    effects: [
      {"statKey": "attackSpeed", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Strike: attackSpeed (on hit proc)"},
      {"statKey": "attackSpeedChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Strike: attackSpeedChance (on hit proc)"},
    ],
  },
  "arcane_tanker": {
    arcaneId: "arcane_tanker",
    effects: [
      {"statKey": "flatArmorBonus", "target": "warframe_totals", "mode": "flat", "source": "Arcane Tanker: flatArmorBonus (conditional proc)"},
    ],
  },
  "arcane_tempo": {
    arcaneId: "arcane_tempo",
    effects: [
      {"statKey": "fireRate", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Tempo: fireRate (conditional proc)"},
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Tempo: healthRegenChance (conditional proc)"},
    ],
  },
  "arcane_trickery": {
    arcaneId: "arcane_trickery",
    effects: [
      {"statKey": "invisibilityChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Trickery: invisibilityChance (on finisher proc)"},
      {"statKey": "invisibilityDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Trickery: invisibilityDuration (on finisher proc)"},
    ],
  },
  "arcane_truculence": {
    arcaneId: "arcane_truculence",
    customHandler: "arcane_truculence",
    effects: [
      {"statKey": "overguardThreshold", "target": "arcane_panel", "mode": "custom", "source": "Arcane Truculence: custom handler"},
      {"statKey": "radialAttackRadius", "target": "arcane_panel", "mode": "custom", "source": "Arcane Truculence: custom handler"},
    ],
  },
  "arcane_ultimatum": {
    arcaneId: "arcane_ultimatum",
    effects: [
      {"statKey": "armor", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Ultimatum: armor (on finisher proc)"},
    ],
  },
  "arcane_universal_fallout": {
    arcaneId: "arcane_universal_fallout",
    effects: [
      {"statKey": "universalOrbChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Universal Fallout: universalOrbChance (on status proc)"},
    ],
  },
  "arcane_velocity": {
    arcaneId: "arcane_velocity",
    effects: [
      {"statKey": "fireRate", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Velocity: fireRate (conditional proc)"},
    ],
  },
  "arcane_victory": {
    arcaneId: "arcane_victory",
    effects: [
      {"statKey": "headshotHealthRegen", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Victory: headshotHealthRegen (on headshot proc)"},
    ],
  },
  "arcane_warmth": {
    arcaneId: "arcane_warmth",
    effects: [
      {"statKey": "statusResistance", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Arcane Warmth: statusResistance (always active while equipped)"},
    ],
  },
  "cascadia_accuracy": {
    arcaneId: "cascadia_accuracy",
    effects: [
      {"statKey": "criticalChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Cascadia Accuracy: criticalChance (on movement proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Cascadia Accuracy: buffDuration (on movement proc)"},
    ],
  },
  "cascadia_empowered": {
    arcaneId: "cascadia_empowered",
    effects: [
      {"statKey": "bonusDamageOnStatus", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Cascadia Empowered: bonusDamageOnStatus (on status proc)"},
    ],
  },
  "cascadia_flare": {
    arcaneId: "cascadia_flare",
    customHandler: "cascadia_flare",
    effects: [
      {"statKey": "damage", "target": "arcane_panel", "mode": "custom", "source": "Cascadia Flare: custom handler"},
    ],
  },
  "cascadia_overcharge": {
    arcaneId: "cascadia_overcharge",
    effects: [
      {"statKey": "criticalChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Cascadia Overcharge: criticalChance (always active while equipped)"},
    ],
  },
  "conjunction_voltage": {
    arcaneId: "conjunction_voltage",
    effects: [
      {"statKey": "reloadSpeed", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Conjunction Voltage: reloadSpeed (stacking — applies at sim stack count)"},
      {"statKey": "multishot", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Conjunction Voltage: multishot (stacking — applies at sim stack count)"},
    ],
  },
  "emergence_dissipate": {
    arcaneId: "emergence_dissipate",
    customHandler: "emergence_dissipate",
    effects: [
      {"statKey": "dissipateRadius", "target": "arcane_panel", "mode": "custom", "source": "Emergence Dissipate: custom handler"},
      {"statKey": "voidMoteEnergy", "target": "arcane_panel", "mode": "custom", "source": "Emergence Dissipate: custom handler"},
    ],
  },
  "emergence_renewed": {
    arcaneId: "emergence_renewed",
    effects: [
      {"statKey": "energyRegen", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Emergence Renewed: energyRegen (conditional proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Emergence Renewed: buffDuration (conditional proc)"},
      {"statKey": "cooldown", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Emergence Renewed: cooldown (conditional proc)"},
    ],
  },
  "emergence_savior": {
    arcaneId: "emergence_savior",
    customHandler: "emergence_savior",
    effects: [
      {"statKey": "lethalInvulnDuration", "target": "arcane_panel", "mode": "custom", "source": "Emergence Savior: custom handler"},
      {"statKey": "lethalHealPercent", "target": "arcane_panel", "mode": "custom", "source": "Emergence Savior: custom handler"},
    ],
  },
  "eternal_eradicate": {
    arcaneId: "eternal_eradicate",
    effects: [
      {"statKey": "ampDamage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Eternal Eradicate: ampDamage (conditional proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Eternal Eradicate: buffDuration (conditional proc)"},
    ],
  },
  "eternal_logistics": {
    arcaneId: "eternal_logistics",
    effects: [
      {"statKey": "ampAmmoEfficiency", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Eternal Logistics: ampAmmoEfficiency (on void sling proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Eternal Logistics: buffDuration (on void sling proc)"},
    ],
  },
  "eternal_onslaught": {
    arcaneId: "eternal_onslaught",
    effects: [
      {"statKey": "criticalChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Eternal Onslaught: criticalChance (conditional proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Eternal Onslaught: buffDuration (conditional proc)"},
    ],
  },
  "exodia_brave": {
    arcaneId: "exodia_brave",
    customHandler: "exodia_brave",
    effects: [
      {"statKey": "energyRegen", "target": "arcane_panel", "mode": "custom", "source": "Exodia Brave: custom handler"},
    ],
  },
  "exodia_contagion": {
    arcaneId: "exodia_contagion",
    customHandler: "exodia_contagion",
    effects: [
      {"statKey": "projectileOnAimGlide", "target": "arcane_panel", "mode": "custom", "source": "Exodia Contagion: custom handler"},
    ],
  },
  "exodia_epidemic": {
    arcaneId: "exodia_epidemic",
    customHandler: "exodia_epidemic",
    effects: [
      {"statKey": "shockwaveOnSlam", "target": "arcane_panel", "mode": "custom", "source": "Exodia Epidemic: custom handler"},
    ],
  },
  "exodia_force": {
    arcaneId: "exodia_force",
    customHandler: "exodia_force",
    effects: [
      {"statKey": "statusProcChance", "target": "arcane_panel", "mode": "custom", "source": "Exodia Force: custom handler"},
      {"statKey": "procDamageMultiplier", "target": "arcane_panel", "mode": "custom", "source": "Exodia Force: custom handler"},
    ],
  },
  "exodia_hunt": {
    arcaneId: "exodia_hunt",
    customHandler: "exodia_hunt",
    effects: [
      {"statKey": "pullChance", "target": "arcane_panel", "mode": "custom", "source": "Exodia Hunt: custom handler"},
      {"statKey": "pullRadius", "target": "arcane_panel", "mode": "custom", "source": "Exodia Hunt: custom handler"},
    ],
  },
  "exodia_might": {
    arcaneId: "exodia_might",
    customHandler: "exodia_might",
    effects: [
      {"statKey": "lifeStealChance", "target": "arcane_panel", "mode": "custom", "source": "Exodia Might: custom handler"},
      {"statKey": "lifeSteal", "target": "arcane_panel", "mode": "custom", "source": "Exodia Might: custom handler"},
    ],
  },
  "exodia_triumph": {
    arcaneId: "exodia_triumph",
    customHandler: "exodia_triumph",
    effects: [
      {"statKey": "meleeComboChance", "target": "arcane_panel", "mode": "custom", "source": "Exodia Triumph: custom handler"},
    ],
  },
  "exodia_valor": {
    arcaneId: "exodia_valor",
    customHandler: "exodia_valor",
    effects: [
      {"statKey": "meleeComboChance", "target": "arcane_panel", "mode": "custom", "source": "Exodia Valor: custom handler"},
    ],
  },
  "fractalized_reset": {
    arcaneId: "fractalized_reset",
    effects: [
      {"statKey": "reloadSpeed", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Fractalized Reset: reloadSpeed (on ability cast proc)"},
    ],
  },
  "longbow_sharpshot": {
    arcaneId: "longbow_sharpshot",
    effects: [
      {"statKey": "damage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Longbow Sharpshot: damage (on headshot proc)"},
    ],
  },
  "magus_accelerant": {
    arcaneId: "magus_accelerant",
    effects: [
      {"statKey": "enemyResistanceReduction", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Accelerant: enemyResistanceReduction (on void sling proc)"},
    ],
  },
  "magus_aggress": {
    arcaneId: "magus_aggress",
    effects: [
      {"statKey": "criticalMultiplier", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Aggress: criticalMultiplier (conditional proc)"},
      {"statKey": "attackCount", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Aggress: attackCount (conditional proc)"},
      {"statKey": "cooldown", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Aggress: cooldown (conditional proc)"},
    ],
  },
  "magus_anomaly": {
    arcaneId: "magus_anomaly",
    effects: [
      {"statKey": "voidPullRadius", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Anomaly: voidPullRadius (conditional proc)"},
    ],
  },
  "magus_cadence": {
    arcaneId: "magus_cadence",
    customHandler: "magus_cadence",
    effects: [
      {"statKey": "sprintSpeed", "target": "arcane_panel", "mode": "custom", "source": "Magus Cadence: custom handler"},
    ],
  },
  "magus_cloud": {
    arcaneId: "magus_cloud",
    customHandler: "magus_cloud",
    effects: [
      {"statKey": "voidSlingRadius", "target": "arcane_panel", "mode": "custom", "source": "Magus Cloud: custom handler"},
    ],
  },
  "magus_destruct": {
    arcaneId: "magus_destruct",
    customHandler: "magus_destruct",
    effects: [
      {"statKey": "enemyResistanceReduction", "target": "arcane_panel", "mode": "custom", "source": "Magus Destruct: custom handler"},
    ],
  },
  "magus_drive": {
    arcaneId: "magus_drive",
    effects: [
      {"statKey": "kdDriveSpeed", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Drive: kdDriveSpeed (conditional proc)"},
    ],
  },
  "magus_elevate": {
    arcaneId: "magus_elevate",
    effects: [
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Elevate: healthRegenChance (conditional proc)"},
      {"statKey": "operatorToWarframeHeal", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Elevate: operatorToWarframeHeal (conditional proc)"},
    ],
  },
  "magus_firewall": {
    arcaneId: "magus_firewall",
    effects: [
      {"statKey": "damageReduction", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Magus Firewall: damageReduction (conditional proc)"},
      {"statKey": "voidModeDamageReduction", "target": "warframe_totals", "mode": "flat", "source": "Magus Firewall: voidModeDamageReduction (conditional proc)"},
    ],
  },
  "magus_glitch": {
    arcaneId: "magus_glitch",
    customHandler: "magus_glitch",
    effects: [
      {"statKey": "transferenceStaticNegate", "target": "arcane_panel", "mode": "custom", "source": "Magus Glitch: custom handler"},
    ],
  },
  "magus_husk": {
    arcaneId: "magus_husk",
    effects: [
      {"statKey": "operatorArmor", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Husk: operatorArmor (always active while equipped)"},
    ],
  },
  "magus_lockdown": {
    arcaneId: "magus_lockdown",
    effects: [
      {"statKey": "voidTrapDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Lockdown: voidTrapDuration (on void sling proc)"},
      {"statKey": "voidTrapRadius", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Lockdown: voidTrapRadius (on void sling proc)"},
    ],
  },
  "magus_melt": {
    arcaneId: "magus_melt",
    effects: [
      {"statKey": "damage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Melt: damage (stacking — applies at sim stack count)"},
      {"statKey": "operatorHeatDamage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Melt: operatorHeatDamage (stacking — applies at sim stack count)"},
    ],
  },
  "magus_nourish": {
    arcaneId: "magus_nourish",
    effects: [
      {"statKey": "operatorToWarframeHeal", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Nourish: operatorToWarframeHeal (always active while equipped)"},
    ],
  },
  "magus_overload": {
    arcaneId: "magus_overload",
    effects: [
      {"statKey": "damage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Overload: damage (on void sling proc)"},
    ],
  },
  "magus_repair": {
    arcaneId: "magus_repair",
    customHandler: "magus_repair",
    effects: [
      {"statKey": "operatorToWarframeHeal", "target": "arcane_panel", "mode": "custom", "source": "Magus Repair: custom handler"},
    ],
  },
  "magus_replenish": {
    arcaneId: "magus_replenish",
    effects: [
      {"statKey": "operatorHealthRegen", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Replenish: operatorHealthRegen (on void sling proc)"},
    ],
  },
  "magus_revert": {
    arcaneId: "magus_revert",
    customHandler: "magus_revert",
    effects: [
      {"statKey": "revertWindow", "target": "arcane_panel", "mode": "custom", "source": "Magus Revert: custom handler"},
      {"statKey": "revertHeal", "target": "arcane_panel", "mode": "custom", "source": "Magus Revert: custom handler"},
    ],
  },
  "magus_vigor": {
    arcaneId: "magus_vigor",
    effects: [
      {"statKey": "operatorHealth", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Vigor: operatorHealth (always active while equipped)"},
    ],
  },
  "melee_afflictions": {
    arcaneId: "melee_afflictions",
    effects: [
      {"statKey": "statusStackBonus", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Afflictions: statusStackBonus (conditional proc)"},
    ],
  },
  "melee_assimilation": {
    arcaneId: "melee_assimilation",
    effects: [
      {"statKey": "meleeHeavyDamage", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Melee Assimilation: meleeHeavyDamage (conditional proc)"},
      {"statKey": "shieldRestorePercent", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Assimilation: shieldRestorePercent (conditional proc)"},
    ],
  },
  "melee_careen": {
    arcaneId: "melee_careen",
    effects: [
      {"statKey": "meleeDamageBonus", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Careen: meleeDamageBonus (on movement proc)"},
    ],
  },
  "melee_crescendo": {
    arcaneId: "melee_crescendo",
    effects: [
      {"statKey": "meleeComboInitial", "target": "weapon_dps", "mode": "flat", "source": "Melee Crescendo: meleeComboInitial (on finisher proc)"},
    ],
  },
  "melee_doughty": {
    arcaneId: "melee_doughty",
    effects: [
      {"statKey": "critPerPunctureTen", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Doughty: critPerPunctureTen (always active while equipped)"},
    ],
  },
  "melee_duplicate": {
    arcaneId: "melee_duplicate",
    effects: [
      {"statKey": "duplicateAttackChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Duplicate: duplicateAttackChance (conditional proc)"},
    ],
  },
  "melee_exposure": {
    arcaneId: "melee_exposure",
    customHandler: "melee_exposure",
    effects: [
      {"statKey": "meleeDamageBonus", "target": "arcane_panel", "mode": "custom", "source": "Melee Exposure: custom handler"},
      {"statKey": "corrosiveDamage", "target": "arcane_panel", "mode": "custom", "source": "Melee Exposure: custom handler"},
    ],
  },
  "melee_fortification": {
    arcaneId: "melee_fortification",
    effects: [
      {"statKey": "flatArmorBonus", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Fortification: flatArmorBonus (on melee kill proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Fortification: buffDuration (on melee kill proc)"},
    ],
  },
  "melee_influence": {
    arcaneId: "melee_influence",
    effects: [
      {"statKey": "elementalProcChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Influence: elementalProcChance (always active while equipped)"},
    ],
  },
  "melee_retaliation": {
    arcaneId: "melee_retaliation",
    effects: [
      {"statKey": "meleeDamagePerShield", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Retaliation: meleeDamagePerShield (always active while equipped)"},
      {"statKey": "meleeDamagePerShieldCap", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Retaliation: meleeDamagePerShieldCap (always active while equipped)"},
    ],
  },
  "melee_vortex": {
    arcaneId: "melee_vortex",
    customHandler: "melee_vortex",
    effects: [
      {"statKey": "pullChance", "target": "arcane_panel", "mode": "custom", "source": "Melee Vortex: custom handler"},
      {"statKey": "pullRadius", "target": "arcane_panel", "mode": "custom", "source": "Melee Vortex: custom handler"},
    ],
  },
  "molt_augmented": {
    arcaneId: "molt_augmented",
    effects: [
      {"statKey": "abilityStrength", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Molt Augmented: abilityStrength (stacking — applies at sim stack count)"},
    ],
  },
  "molt_efficiency": {
    arcaneId: "molt_efficiency",
    effects: [
      {"statKey": "abilityDuration", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Molt Efficiency: abilityDuration (always active while equipped)"},
    ],
  },
  "molt_reconstruct": {
    arcaneId: "molt_reconstruct",
    customHandler: "molt_reconstruct",
    effects: [
      {"statKey": "healPerEnergySpent", "target": "arcane_panel", "mode": "custom", "source": "Molt Reconstruct: custom handler"},
    ],
  },
  "molt_vigor": {
    arcaneId: "molt_vigor",
    effects: [
      {"statKey": "abilityStrength", "target": "warframe_totals", "mode": "multiplicative_percent", "source": "Molt Vigor: abilityStrength (conditional proc)"},
    ],
  },
  "pax_bolt": {
    arcaneId: "pax_bolt",
    effects: [
      {"statKey": "abilityEfficiency", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Pax Bolt: abilityEfficiency (always active while equipped)"},
      {"statKey": "abilityStrength", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Pax Bolt: abilityStrength (always active while equipped)"},
    ],
  },
  "pax_charge": {
    arcaneId: "pax_charge",
    effects: [
      {"statKey": "kitgunRecharge", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Pax Charge: kitgunRecharge (conditional proc)"},
    ],
  },
  "pax_seeker": {
    arcaneId: "pax_seeker",
    effects: [
      {"statKey": "kitgunHoming", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Pax Seeker: kitgunHoming (on headshot proc)"},
    ],
  },
  "pax_soar": {
    arcaneId: "pax_soar",
    effects: [
      {"statKey": "airborneAccuracy", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Pax Soar: airborneAccuracy (always active while equipped)"},
      {"statKey": "airborneRecoilReduction", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Pax Soar: airborneRecoilReduction (always active while equipped)"},
      {"statKey": "aimGlideDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Pax Soar: aimGlideDuration (always active while equipped)"},
    ],
  },
  "primary_blight": {
    arcaneId: "primary_blight",
    effects: [
      {"statKey": "multishot", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Primary Blight: multishot (stacking — applies at sim stack count)"},
      {"statKey": "criticalMultiplier", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Primary Blight: criticalMultiplier (stacking — applies at sim stack count)"},
    ],
  },
  "primary_bulwark": {
    arcaneId: "primary_bulwark",
    effects: [
      {"statKey": "damagePerArmorOver", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Primary Bulwark: damagePerArmorOver (always active while equipped)"},
      {"statKey": "damagePerArmorThreshold", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Primary Bulwark: damagePerArmorThreshold (always active while equipped)"},
    ],
  },
  "primary_compression": {
    arcaneId: "primary_compression",
    effects: [
      {"statKey": "ammoEfficiency", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Primary Compression: ammoEfficiency (conditional proc)"},
      {"statKey": "damage", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Primary Compression: damage (conditional proc)"},
    ],
  },
  "primary_crux": {
    arcaneId: "primary_crux",
    effects: [
      {"statKey": "ammoEfficiency", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Primary Crux: ammoEfficiency (stacking — applies at sim stack count)"},
      {"statKey": "statusChancePerHit", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Primary Crux: statusChancePerHit (stacking — applies at sim stack count)"},
    ],
  },
  "primary_debilitate": {
    arcaneId: "primary_debilitate",
    customHandler: "primary_debilitate",
    effects: [
      {"statKey": "debilitateStackThreshold", "target": "arcane_panel", "mode": "custom", "source": "Primary Debilitate: custom handler"},
      {"statKey": "statusProcChance", "target": "arcane_panel", "mode": "custom", "source": "Primary Debilitate: custom handler"},
    ],
  },
  "primary_exhilarate": {
    arcaneId: "primary_exhilarate",
    effects: [
      {"statKey": "energyRegen", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Primary Exhilarate: energyRegen (stacking — applies at sim stack count)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Primary Exhilarate: buffDuration (stacking — applies at sim stack count)"},
    ],
  },
  "primary_frostbite": {
    arcaneId: "primary_frostbite",
    effects: [
      {"statKey": "multishot", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Primary Frostbite: multishot (stacking — applies at sim stack count)"},
      {"statKey": "criticalMultiplier", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Primary Frostbite: criticalMultiplier (stacking — applies at sim stack count)"},
    ],
  },
  "primary_obstruct": {
    arcaneId: "primary_obstruct",
    customHandler: "primary_obstruct",
    effects: [
      {"statKey": "weaponJamRadius", "target": "arcane_panel", "mode": "custom", "source": "Primary Obstruct: custom handler"},
      {"statKey": "weaponJamCooldown", "target": "arcane_panel", "mode": "custom", "source": "Primary Obstruct: custom handler"},
    ],
  },
  "primary_overcharge": {
    arcaneId: "primary_overcharge",
    customHandler: "primary_overcharge",
    effects: [
      {"statKey": "multishot", "target": "arcane_panel", "mode": "custom", "source": "Primary Overcharge: custom handler"},
    ],
  },
  "primary_plated_round": {
    arcaneId: "primary_plated_round",
    customHandler: "primary_plated_round",
    effects: [
      {"statKey": "reloadDamageRamp", "target": "arcane_panel", "mode": "custom", "source": "Primary Plated Round: custom handler"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "custom", "source": "Primary Plated Round: custom handler"},
    ],
  },
  "residual_boils": {
    arcaneId: "residual_boils",
    effects: [
      {"statKey": "zoneDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Boils: zoneDuration (conditional proc)"},
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Boils: healthRegenChance (conditional proc)"},
      {"statKey": "zoneDamage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Boils: zoneDamage (conditional proc)"},
      {"statKey": "zoneRadius", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Boils: zoneRadius (conditional proc)"},
    ],
  },
  "residual_malodor": {
    arcaneId: "residual_malodor",
    effects: [
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Malodor: healthRegenChance (conditional proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Malodor: buffDuration (conditional proc)"},
      {"statKey": "zoneDamagePerSec", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Malodor: zoneDamagePerSec (conditional proc)"},
    ],
  },
  "residual_shock": {
    arcaneId: "residual_shock",
    effects: [
      {"statKey": "electricZoneDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Shock: electricZoneDuration (conditional proc)"},
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Shock: healthRegenChance (conditional proc)"},
      {"statKey": "zoneDamage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Shock: zoneDamage (conditional proc)"},
      {"statKey": "zoneRadius", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Shock: zoneRadius (conditional proc)"},
    ],
  },
  "residual_viremia": {
    arcaneId: "residual_viremia",
    effects: [
      {"statKey": "zoneDamagePerSec", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Viremia: zoneDamagePerSec (conditional proc)"},
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Viremia: healthRegenChance (conditional proc)"},
      {"statKey": "zoneDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Viremia: zoneDuration (conditional proc)"},
    ],
  },
  "secondary_cryogenic": {
    arcaneId: "secondary_cryogenic",
    effects: [
      {"statKey": "coldStacksApplied", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Secondary Cryogenic: coldStacksApplied (conditional proc)"},
    ],
  },
  "secondary_encumber": {
    arcaneId: "secondary_encumber",
    effects: [
      {"statKey": "secondaryStatusProc", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Secondary Encumber: secondaryStatusProc (on status proc)"},
    ],
  },
  "secondary_enervate": {
    arcaneId: "secondary_enervate",
    customHandler: "secondary_enervate",
    effects: [
      {"statKey": "criticalChance", "target": "arcane_panel", "mode": "custom", "source": "Secondary Enervate: custom handler"},
      {"statKey": "bigCritThreshold", "target": "arcane_panel", "mode": "custom", "source": "Secondary Enervate: custom handler"},
    ],
  },
  "secondary_fortifier": {
    arcaneId: "secondary_fortifier",
    effects: [
      {"statKey": "overguardDamage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Secondary Fortifier: overguardDamage (always active while equipped)"},
    ],
  },
  "secondary_irradiate": {
    arcaneId: "secondary_irradiate",
    effects: [
      {"statKey": "procDamageMultiplier", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Secondary Irradiate: procDamageMultiplier (on hit proc)"},
      {"statKey": "procAuraRadius", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Secondary Irradiate: procAuraRadius (on hit proc)"},
    ],
  },
  "secondary_kinship": {
    arcaneId: "secondary_kinship",
    effects: [
      {"statKey": "criticalChance", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Secondary Kinship: criticalChance (always active while equipped)"},
    ],
  },
  "secondary_outburst": {
    arcaneId: "secondary_outburst",
    customHandler: "secondary_outburst",
    effects: [
      {"statKey": "criticalMultiplier", "target": "arcane_panel", "mode": "custom", "source": "Secondary Outburst: custom handler"},
    ],
  },
  "secondary_shiver": {
    arcaneId: "secondary_shiver",
    effects: [
      {"statKey": "damageTakenBonus", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Secondary Shiver: damageTakenBonus (conditional proc)"},
    ],
  },
  "secondary_surge": {
    arcaneId: "secondary_surge",
    customHandler: "secondary_surge",
    effects: [
      {"statKey": "damagePerEnergy", "target": "arcane_panel", "mode": "custom", "source": "Secondary Surge: custom handler"},
    ],
  },
  "shotgun_vendetta": {
    arcaneId: "shotgun_vendetta",
    effects: [
      {"statKey": "reloadSpeed", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Shotgun Vendetta: reloadSpeed (conditional proc)"},
      {"statKey": "multishot", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Shotgun Vendetta: multishot (conditional proc)"},
    ],
  },
  "theorem_contagion": {
    arcaneId: "theorem_contagion",
    customHandler: "theorem_contagion",
    effects: [
      {"statKey": "vulnerability", "target": "arcane_panel", "mode": "custom", "source": "Theorem Contagion: custom handler"},
    ],
  },
  "theorem_demulcent": {
    arcaneId: "theorem_demulcent",
    effects: [
      {"statKey": "damage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Theorem Demulcent: damage (stacking — applies at sim stack count)"},
    ],
  },
  "theorem_infection": {
    arcaneId: "theorem_infection",
    customHandler: "theorem_infection",
    effects: [
      {"statKey": "companionDamageRamp", "target": "arcane_panel", "mode": "custom", "source": "Theorem Infection: custom handler"},
    ],
  },
  "virtuos_forge": {
    arcaneId: "virtuos_forge",
    effects: [
      {"statKey": "voidConversion", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Forge: voidConversion (on hit proc)"},
    ],
  },
  "virtuos_fury": {
    arcaneId: "virtuos_fury",
    effects: [
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Fury: healthRegenChance (on status proc)"},
      {"statKey": "damage", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Virtuos Fury: damage (on status proc)"},
    ],
  },
  "virtuos_ghost": {
    arcaneId: "virtuos_ghost",
    effects: [
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Ghost: healthRegenChance (on headshot proc)"},
      {"statKey": "ampStatusChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Ghost: ampStatusChance (on headshot proc)"},
    ],
  },
  "virtuos_null": {
    arcaneId: "virtuos_null",
    effects: [
      {"statKey": "energyRegen", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Null: energyRegen (on kill proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Null: buffDuration (on kill proc)"},
    ],
  },
  "virtuos_shadow": {
    arcaneId: "virtuos_shadow",
    effects: [
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Shadow: healthRegenChance (on headshot proc)"},
      {"statKey": "ampCritChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Shadow: ampCritChance (on headshot proc)"},
    ],
  },
  "virtuos_spike": {
    arcaneId: "virtuos_spike",
    effects: [
      {"statKey": "voidConversion", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Spike: voidConversion (on hit proc)"},
    ],
  },
  "virtuos_strike": {
    arcaneId: "virtuos_strike",
    effects: [
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Strike: healthRegenChance (conditional proc)"},
      {"statKey": "ampCritDamage", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Virtuos Strike: ampCritDamage (conditional proc)"},
    ],
  },
  "virtuos_surge": {
    arcaneId: "virtuos_surge",
    effects: [
      {"statKey": "voidConversion", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Surge: voidConversion (on hit proc)"},
    ],
  },
  "virtuos_tempo": {
    arcaneId: "virtuos_tempo",
    effects: [
      {"statKey": "ampFireRate", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Virtuos Tempo: ampFireRate (on kill proc)"},
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Tempo: healthRegenChance (on kill proc)"},
    ],
  },
  "virtuos_trojan": {
    arcaneId: "virtuos_trojan",
    effects: [
      {"statKey": "voidConversion", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Trojan: voidConversion (on hit proc)"},
    ],
  },
  "zid_an_asheir": {
    arcaneId: "zid_an_asheir",
    customHandler: "zid_an_asheir",
    effects: [
      {"statKey": "statusChancePerHit", "target": "arcane_panel", "mode": "custom", "source": "Zid-An Asheir: custom handler"},
      {"statKey": "tauronStrikeCharge", "target": "arcane_panel", "mode": "custom", "source": "Zid-An Asheir: custom handler"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "custom", "source": "Zid-An Asheir: custom handler"},
    ],
  },
  "zid_an_haras": {
    arcaneId: "zid_an_haras",
    effects: [
      {"statKey": "ammoEfficiency", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Zid-An Haras: ammoEfficiency (conditional proc)"},
      {"statKey": "ampAmmoEfficiency", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Zid-An Haras: ampAmmoEfficiency (conditional proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Zid-An Haras: buffDuration (conditional proc)"},
    ],
  },
  "zid_an_osbok": {
    arcaneId: "zid_an_osbok",
    effects: [
      {"statKey": "overguardStrip", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Zid-An Osbok: overguardStrip (conditional proc)"},
      {"statKey": "ampCritDamage", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Zid-An Osbok: ampCritDamage (conditional proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Zid-An Osbok: buffDuration (conditional proc)"},
    ],
  },
  "zid_an_sek_eel": {
    arcaneId: "zid_an_sek_eel",
    customHandler: "zid_an_sek_eel",
    effects: [
      {"statKey": "invisibilityDuration", "target": "arcane_panel", "mode": "custom", "source": "Zid-An Sek-Eel: custom handler"},
      {"statKey": "tauronChargeRate", "target": "arcane_panel", "mode": "custom", "source": "Zid-An Sek-Eel: custom handler"},
    ],
  },
  "zid_an_uskos": {
    arcaneId: "zid_an_uskos",
    customHandler: "zid_an_uskos",
    effects: [
      {"statKey": "secondaryHeatDamage", "target": "arcane_panel", "mode": "custom", "source": "Zid-An Uskos: custom handler"},
    ],
  },
};
