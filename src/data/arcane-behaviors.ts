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
      {"statKey": "ammoEfficiency", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Akimbo Slip Shot: ammoEfficiency (always active while equipped)"},
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
  "arcane_concentration": {
    arcaneId: "arcane_concentration",
    effects: [
      {"statKey": "abilityDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Concentration: abilityDuration (on ability cast proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Concentration: buffDuration (on ability cast proc)"},
    ],
  },
  "arcane_energize": {
    arcaneId: "arcane_energize",
    customHandler: "arcane_energize",
    effects: [
      {"statKey": "energyOrbBonus", "target": "arcane_panel", "mode": "custom", "source": "Arcane Energize: custom handler"},
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
  "arcane_fury": {
    arcaneId: "arcane_fury",
    effects: [
      {"statKey": "meleeDamageBonus", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Fury: meleeDamageBonus (conditional proc)"},
    ],
  },
  "arcane_grace": {
    arcaneId: "arcane_grace",
    effects: [
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Grace: healthRegenChance (when damaged proc)"},
    ],
  },
  "arcane_guardian": {
    arcaneId: "arcane_guardian",
    effects: [
      {"statKey": "armorBonusChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Guardian: armorBonusChance (when damaged proc)"},
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
  "arcane_intention": {
    arcaneId: "arcane_intention",
    effects: [
      {"statKey": "healthFlat", "target": "warframe_totals", "mode": "flat", "source": "Arcane Intention: healthFlat (always active while equipped)"},
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
  "arcane_pistoleer": {
    arcaneId: "arcane_pistoleer",
    effects: [
      {"statKey": "headshotProcChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Pistoleer: headshotProcChance (conditional proc)"},
      {"statKey": "ammoEfficiency", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Pistoleer: ammoEfficiency (conditional proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Pistoleer: buffDuration (conditional proc)"},
    ],
  },
  "arcane_primary_dexterity": {
    arcaneId: "arcane_primary_dexterity",
    customHandler: "arcane_primary_dexterity",
    effects: [
      {"statKey": "damage", "target": "arcane_panel", "mode": "custom", "source": "Primary Dexterity: custom handler"},
    ],
  },
  "arcane_pulse": {
    arcaneId: "arcane_pulse",
    effects: [
      {"statKey": "healthFromOrbs", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Pulse: healthFromOrbs (on pickup proc)"},
    ],
  },
  "arcane_reaper": {
    arcaneId: "arcane_reaper",
    effects: [
      {"statKey": "healthRegenPerSec", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Reaper: healthRegenPerSec (on melee kill proc)"},
      {"statKey": "flatArmorBonus", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Reaper: flatArmorBonus (on melee kill proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Reaper: buffDuration (on melee kill proc)"},
    ],
  },
  "arcane_secondary_dexterity": {
    arcaneId: "arcane_secondary_dexterity",
    customHandler: "arcane_secondary_dexterity",
    effects: [
      {"statKey": "damage", "target": "arcane_panel", "mode": "custom", "source": "Secondary Dexterity: custom handler"},
    ],
  },
  "arcane_tanker": {
    arcaneId: "arcane_tanker",
    effects: [
      {"statKey": "flatArmorBonus", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Tanker: flatArmorBonus (conditional proc)"},
    ],
  },
  "arcane_trickery": {
    arcaneId: "arcane_trickery",
    effects: [
      {"statKey": "invisibilityChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Arcane Trickery: invisibilityChance (on finisher proc)"},
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
      {"statKey": "criticalChance", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Cascadia Overcharge: criticalChance (always active while equipped)"},
    ],
  },
  "conjunction_voltage": {
    arcaneId: "conjunction_voltage",
    effects: [
      {"statKey": "reloadSpeed", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Conjunction Voltage: reloadSpeed (stacking — applies at sim stack count)"},
      {"statKey": "multishot", "target": "weapon_dps", "mode": "multiplicative_percent", "source": "Conjunction Voltage: multishot (stacking — applies at sim stack count)"},
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
  "exodia_hunt": {
    arcaneId: "exodia_hunt",
    customHandler: "exodia_hunt",
    effects: [
      {"statKey": "pullChance", "target": "arcane_panel", "mode": "custom", "source": "Exodia Hunt: custom handler"},
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
  "magus_firewall": {
    arcaneId: "magus_firewall",
    effects: [
      {"statKey": "damageReduction", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Firewall: damageReduction (conditional proc)"},
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
    ],
  },
  "magus_nourish": {
    arcaneId: "magus_nourish",
    effects: [
      {"statKey": "operatorToWarframeHeal", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Magus Nourish: operatorToWarframeHeal (always active while equipped)"},
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
  "melee_crescendo": {
    arcaneId: "melee_crescendo",
    effects: [
      {"statKey": "meleeComboInitial", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Crescendo: meleeComboInitial (on finisher proc)"},
    ],
  },
  "melee_doughty": {
    arcaneId: "melee_doughty",
    effects: [
      {"statKey": "critPerPunctureTen", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Doughty: critPerPunctureTen (always active while equipped)"},
    ],
  },
  "melee_fortification": {
    arcaneId: "melee_fortification",
    effects: [
      {"statKey": "flatArmorBonus", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Fortification: flatArmorBonus (on melee kill proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Melee Fortification: buffDuration (on melee kill proc)"},
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
    ],
  },
  "primary_bulwark": {
    arcaneId: "primary_bulwark",
    effects: [
      {"statKey": "damagePerArmorOver", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Primary Bulwark: damagePerArmorOver (always active while equipped)"},
    ],
  },
  "primary_debilitate": {
    arcaneId: "primary_debilitate",
    customHandler: "primary_debilitate",
    effects: [
      {"statKey": "debilitateStackThreshold", "target": "arcane_panel", "mode": "custom", "source": "Primary Debilitate: custom handler"},
    ],
  },
  "primary_exhilarate": {
    arcaneId: "primary_exhilarate",
    effects: [
      {"statKey": "energyRegen", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Primary Exhilarate: energyRegen (stacking — applies at sim stack count)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Primary Exhilarate: buffDuration (stacking — applies at sim stack count)"},
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
  "primary_plated_round": {
    arcaneId: "primary_plated_round",
    customHandler: "primary_plated_round",
    effects: [
      {"statKey": "reloadDamageRamp", "target": "arcane_panel", "mode": "custom", "source": "Primary Plated Round: custom handler"},
    ],
  },
  "residual_malodor": {
    arcaneId: "residual_malodor",
    effects: [
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Malodor: healthRegenChance (conditional proc)"},
    ],
  },
  "residual_shock": {
    arcaneId: "residual_shock",
    effects: [
      {"statKey": "electricZoneDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Shock: electricZoneDuration (conditional proc)"},
      {"statKey": "healthRegenChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Shock: healthRegenChance (conditional proc)"},
      {"statKey": "zoneRadius", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Shock: zoneRadius (conditional proc)"},
    ],
  },
  "residual_viremia": {
    arcaneId: "residual_viremia",
    effects: [
      {"statKey": "zoneDamagePerSec", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Residual Viremia: zoneDamagePerSec (conditional proc)"},
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
    effects: [
      {"statKey": "criticalChance", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Secondary Enervate: criticalChance (on hit proc)"},
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
    ],
  },
  "secondary_shiver": {
    arcaneId: "secondary_shiver",
    effects: [
      {"statKey": "damageTakenBonus", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Secondary Shiver: damageTakenBonus (conditional proc)"},
    ],
  },
  "virtuos_null": {
    arcaneId: "virtuos_null",
    effects: [
      {"statKey": "energyRegen", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Null: energyRegen (on kill proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Virtuos Null: buffDuration (on kill proc)"},
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
      {"statKey": "ammoEfficiency", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Zid-An Haras: ammoEfficiency (conditional proc)"},
      {"statKey": "ampAmmoEfficiency", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Zid-An Haras: ampAmmoEfficiency (conditional proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Zid-An Haras: buffDuration (conditional proc)"},
    ],
  },
  "zid_an_osbok": {
    arcaneId: "zid_an_osbok",
    effects: [
      {"statKey": "overguardStrip", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Zid-An Osbok: overguardStrip (conditional proc)"},
      {"statKey": "ampCritDamage", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Zid-An Osbok: ampCritDamage (conditional proc)"},
      {"statKey": "buffDuration", "target": "arcane_panel", "mode": "multiplicative_percent", "source": "Zid-An Osbok: buffDuration (conditional proc)"},
    ],
  },
  "zid_an_sek_eel": {
    arcaneId: "zid_an_sek_eel",
    customHandler: "zid_an_sek_eel",
    effects: [
      {"statKey": "invisibilityDuration", "target": "arcane_panel", "mode": "custom", "source": "Zid-An Sek-Eel: custom handler"},
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
