// ==========================================================================
// INCARNON EVOLUTION DATA
// ==========================================================================
// Converted from lib/data/incarnon_data_complete.dart
// 48 Incarnon weapons with full evolution data
// ==========================================================================

export interface IncarnonEvolution {
  tier: number;
  slot: number;
  name: string;
  description: string;
  statChanges: Record<string, number>;
}

export interface IncarnonForm {
  name: string;
  damage: number;
  fireRate: number;
  criticalChance: number;
  criticalMultiplier: number;
  statusChance: number;
  triggerType: string;
  magazine?: number;
  reloadTime?: number;
  specialMechanics?: Record<string, string>;
}

export interface IncarnonWeaponData {
  weaponId: string;
  weaponName: string;
  challenge: string;
  category: string;
  variants?: string[];
  forms: IncarnonForm[];
  evolutions: IncarnonEvolution[];
}

// Standard evolution pools - 3 choices per tier, based on weapon type
function getRangedEvolutions(): IncarnonEvolution[] {
  return [
    { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
    // Tier 2: Damage bonuses
    { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: { damage: 1.0 } },
    { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when only this weapon type is equipped.", statChanges: { damage: 0.6 } },
    { tier: 2, slot: 2, name: "Rapid Wrath", description: "On kill: +20% Fire Rate for 4s.", statChanges: { fireRate: 0.2 } },
    // Tier 3: Utility/damage
    { tier: 3, slot: 0, name: "Elemental Excess", description: "+20% Elemental Damage per unique status type affecting the target.", statChanges: {} },
    { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Transmutation Buildup.", statChanges: {} },
    { tier: 3, slot: 2, name: "Metabolic Recharge", description: "+100% Ammo Efficiency in Incarnon Form.", statChanges: {} },
    // Tier 4: Offensive utility
    { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
    { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
    { tier: 4, slot: 2, name: "Hound's Flare", description: "On kill: +30% Critical Chance for 12s.", statChanges: { criticalChance: 0.3 } },
    // Tier 5: Major tradeoffs
    { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +250% Damage.", statChanges: { criticalChance: -0.3, criticalMultiplier: 2.5 } },
    { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to highest Elemental type.", statChanges: {} },
    { tier: 5, slot: 2, name: "Rapacious Cruelty", description: "+50% Critical Chance, -50% Status Chance.", statChanges: { criticalChance: 0.5, statusChance: -0.5 } },
  ];
}

function getMeleeEvolutions(): IncarnonEvolution[] {
  return [
    { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Heavy/Slide attacks to transform.", statChanges: {} },
    // Tier 2: Core stat boosts
    { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
    { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
    { tier: 2, slot: 2, name: "Vehement Charge", description: "+40% Attack Speed.", statChanges: { fireRate: 0.4 } },
    // Tier 3: Utility/damage
    { tier: 3, slot: 0, name: "Elemental Excess", description: "+20% Elemental Damage per unique status type affecting the target.", statChanges: {} },
    { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Transmutation Buildup.", statChanges: {} },
    { tier: 3, slot: 2, name: "Metabolic Recharge", description: "+100% Combo Efficiency (combo counter decays slower).", statChanges: {} },
    // Tier 4: Offensive utility
    { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Melee Range.", statChanges: {} },
    { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
    { tier: 4, slot: 2, name: "Combo Fury", description: "+50% Combo Count Chance.", statChanges: {} },
    // Tier 5: Major tradeoffs
    { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +250% Damage.", statChanges: { criticalChance: -0.3, criticalMultiplier: 2.5 } },
    { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to highest Elemental type.", statChanges: {} },
    { tier: 5, slot: 2, name: "Rapacious Cruelty", description: "+50% Critical Chance, -50% Status Chance.", statChanges: { criticalChance: 0.5, statusChance: -0.5 } },
  ];
}

export const INCARNON_WEAPON_IDS = new Set([
  "ack_and_brunt",
  "ack_brunt_incarnon",
  "angstrum",
  "angstrum_incarnon",
  "anku",
  "anku_incarnon",
  "atomos",
  "atomos_incarnon",
  "bo",
  "bo_incarnon",
  "bo_prime",
  "boar",
  "boar_incarnon",
  "boar_prime",
  "boltor",
  "boltor_incarnon",
  "boltor_prime",
  "braton",
  "braton_incarnon",
  "braton_prime",
  "braton_vandal",
  "bronco",
  "bronco_incarnon",
  "bronco_prime",
  "burston",
  "burston_incarnon",
  "burston_prime",
  "ceramic_dagger",
  "ceramic_dagger_incarnon",
  "cestra",
  "cestra_incarnon",
  "dera",
  "dera_incarnon",
  "dera_vandal",
  "despair",
  "despair_incarnon",
  "dex_sybaris",
  "dread",
  "dread_incarnon",
  "dual_ichor",
  "dual_ichor_incarnon",
  "dual_toxocyst",
  "dual_toxocyst_incarnon",
  "felarx",
  "furax",
  "furax_incarnon",
  "furax_wraith",
  "furis",
  "furis_incarnon",
  "gammacor",
  "gammacor_incarnon",
  "gorgon",
  "gorgon_incarnon",
  "gorgon_wraith",
  "hate",
  "hate_incarnon",
  "innodem",
  "kunai",
  "kunai_incarnon",
  "laetum",
  "lato",
  "lato_incarnon",
  "lato_prime",
  "lato_vandal",
  "latron",
  "latron_incarnon",
  "latron_prime",
  "latron_wraith",
  "lex",
  "lex_incarnon",
  "lex_prime",
  "magistar",
  "magistar_incarnon",
  "miter",
  "miter_incarnon",
  "mk1_bo",
  "mk1_braton",
  "mk1_furax",
  "mk1_furis",
  "mk1_kunai",
  "mk1_paris",
  "mk1_strun",
  "nami_solo",
  "nami_solo_incarnon",
  "okina",
  "okina_incarnon",
  "okina_prime",
  "onos",
  "paris",
  "paris_incarnon",
  "paris_prime",
  "phenmor",
  "praedos",
  "prisma_angstrum",
  "prisma_gorgon",
  "prisma_skana",
  "ruvox",
  "sancti_magistar",
  "sibear",
  "sibear_incarnon",
  "sicarus",
  "sicarus_incarnon",
  "sicarus_prime",
  "skana",
  "skana_incarnon",
  "skana_prime",
  "soma",
  "soma_incarnon",
  "soma_prime",
  "strun",
  "strun_incarnon",
  "strun_prime",
  "strun_wraith",
  "sybaris",
  "sybaris_incarnon",
  "sybaris_prime",
  "synoid_gammacor",
  "telos_boltor",
  "thalys",
  "torid",
  "torid_incarnon",
  "vasto",
  "vasto_incarnon",
  "vasto_prime",
  "zylok",
  "zylok_incarnon",
  "zylok_prime",
]);

export const incarnonWeaponData: IncarnonWeaponData[] = [
  // Felarx (native) - wiki-verified evolutions
  {
    weaponId: "felarx",
    weaponName: "Felarx",
    challenge: "Kill 100 enemies",
    category: "native",
    forms: [
      { name: "Felarx", damage: 520.0, fireRate: 2.0, criticalChance: 0.2, criticalMultiplier: 2.0, statusChance: 0.16, triggerType: "Semi", magazine: 6, reloadTime: 2.2 },
      { name: "Felarx Incarnon", damage: 260.0, fireRate: 2.0, criticalChance: 0.3, criticalMultiplier: 2.6, statusChance: 0.20, triggerType: "Semi", magazine: 60, reloadTime: 0, specialMechanics: { evolutionMode: "Semi-auto energy projectiles with punch through", modeSwitch: "Weakpoint hits charge transmutation" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation; Alt Fire transmutes.", statChanges: {} },
      { tier: 2, slot: 0, name: "Attuned Accuracy", description: "+40% Accuracy when Aiming.", statChanges: {} },
      { tier: 2, slot: 1, name: "Kinetic Baffle", description: "-50% Weapon Recoil.", statChanges: {} },
      { tier: 2, slot: 2, name: "Frictionless Flight", description: "+50% Projectile Speed.", statChanges: {} },
      { tier: 3, slot: 0, name: "Dual-Mode Chamber", description: "Reload toggles between +100% Projectile Speed and +4m Punch Through.", statChanges: {} },
      { tier: 3, slot: 1, name: "Evolved Autoloader", description: "+50% Magazine Reloaded/s when Holstered.", statChanges: {} },
      { tier: 3, slot: 2, name: "Mounting Momentum", description: "Reload increases Fire Rate by +10% per shell. Resets on reload.", statChanges: {} },
      { tier: 4, slot: 0, name: "Brutal Edge", description: "+10% Critical Chance, +10% Status Chance.", statChanges: { criticalChance: 0.1, statusChance: 0.1 } },
      { tier: 4, slot: 1, name: "Incarnon Catalyst", description: "Headshots build 50% more Incarnon Transmutation charge.", statChanges: {} },
      { tier: 4, slot: 2, name: "Wracking Wrath", description: "+20% Status Chance, -10% Critical Chance.", statChanges: { statusChance: 0.2, criticalChance: -0.1 } },
      { tier: 5, slot: 0, name: "Devastating Attrition", description: "50% chance to deal +2000% damage on non-critical hits.", statChanges: {} },
      { tier: 5, slot: 1, name: "Ruptured Plenitude", description: "On Punch Through 3 enemies: +70% Ammo Efficiency for 20s.", statChanges: {} },
      { tier: 5, slot: 2, name: "Agile Executor", description: "Gain 50% Ammo Efficiency while Aim Gliding and Sliding.", statChanges: {} },
    ],
  },
  // Innodem (native)
  {
    weaponId: "innodem",
    weaponName: "Innodem",
    challenge: "Kill 100 enemies with Slide Attacks",
    category: "native",
    forms: [
      { name: "Innodem", damage: 230.0, fireRate: 1.0, criticalChance: 0.24, criticalMultiplier: 2.2, statusChance: 0.18, triggerType: "Melee" },
      { name: "Innodem Incarnon", damage: 460.0, fireRate: 1.0, criticalChance: 0.34, criticalMultiplier: 2.8, statusChance: 0.28, triggerType: "Melee", specialMechanics: { evolutionMode: "Heavy attacks fire void energy wave", modeSwitch: "Heavy attack or Slide attack kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Laetum (native)
  {
    weaponId: "laetum",
    weaponName: "Laetum",
    challenge: "Kill 100 enemies with headshots",
    category: "native",
    forms: [
      { name: "Laetum", damage: 90.0, fireRate: 4.0, criticalChance: 0.24, criticalMultiplier: 2.2, statusChance: 0.12, triggerType: "Semi", magazine: 12, reloadTime: 1.4 },
      { name: "Laetum Incarnon", damage: 180.0, fireRate: 4.0, criticalChance: 0.36, criticalMultiplier: 2.8, statusChance: 0.24, triggerType: "Semi", magazine: 12, reloadTime: 1.4, specialMechanics: { evolutionMode: "Full-auto with explosive rounds", modeSwitch: "Headshot kills build evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Phenmor (native)
  {
    weaponId: "phenmor",
    weaponName: "Phenmor",
    challenge: "Kill 100 enemies",
    category: "native",
    forms: [
      { name: "Phenmor", damage: 76.0, fireRate: 4.5, criticalChance: 0.2, criticalMultiplier: 2.0, statusChance: 0.16, triggerType: "Auto", magazine: 60, reloadTime: 2.0 },
      { name: "Phenmor Incarnon", damage: 152.0, fireRate: 4.5, criticalChance: 0.3, criticalMultiplier: 2.5, statusChance: 0.28, triggerType: "Auto", magazine: 60, reloadTime: 2.0, specialMechanics: { evolutionMode: "Fires seeking void projectiles", modeSwitch: "Kills build evolution gauge" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Praedos (native)
  {
    weaponId: "praedos",
    weaponName: "Praedos",
    challenge: "Kill 100 enemies with Slide Attacks",
    category: "native",
    forms: [
      { name: "Praedos", damage: 260.0, fireRate: 1.0, criticalChance: 0.26, criticalMultiplier: 2.2, statusChance: 0.18, triggerType: "Melee" },
      { name: "Praedos Incarnon", damage: 520.0, fireRate: 1.0, criticalChance: 0.36, criticalMultiplier: 2.8, statusChance: 0.28, triggerType: "Melee", specialMechanics: { evolutionMode: "Extended combos with void explosions", modeSwitch: "Heavy or Slide attack kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Onos (native)
  {
    weaponId: "onos",
    weaponName: "Onos",
    challenge: "Kill 100 enemies",
    category: "native",
    forms: [
      { name: "Onos", damage: 24.0, fireRate: 12.0, criticalChance: 0.18, criticalMultiplier: 2.0, statusChance: 0.28, triggerType: "Held", magazine: 100, reloadTime: 2.4 },
      { name: "Onos Incarnon", damage: 48.0, fireRate: 12.0, criticalChance: 0.28, criticalMultiplier: 2.5, statusChance: 0.4, triggerType: "Held", magazine: 100, reloadTime: 2.4, specialMechanics: { evolutionMode: "Chain lightning between enemies", modeSwitch: "Sustained damage builds evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Ruvox (native)
  {
    weaponId: "ruvox",
    weaponName: "Ruvox",
    challenge: "Kill 100 enemies with Slide Attacks",
    category: "native",
    forms: [
      { name: "Ruvox", damage: 280.0, fireRate: 1.0, criticalChance: 0.28, criticalMultiplier: 2.2, statusChance: 0.16, triggerType: "Melee" },
      { name: "Ruvox Incarnon", damage: 560.0, fireRate: 1.0, criticalChance: 0.38, criticalMultiplier: 2.8, statusChance: 0.26, triggerType: "Melee", specialMechanics: { evolutionMode: "Heavy attacks create void vortex", modeSwitch: "Heavy or Slide kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Thalys (native)
  {
    weaponId: "thalys",
    weaponName: "Thalys",
    challenge: "Kill 100 enemies",
    category: "native",
    forms: [
      { name: "Thalys", damage: 55.0, fireRate: 6.0, criticalChance: 0.22, criticalMultiplier: 2.0, statusChance: 0.18, triggerType: "Burst", magazine: 45, reloadTime: 1.8 },
      { name: "Thalys Incarnon", damage: 110.0, fireRate: 6.0, criticalChance: 0.32, criticalMultiplier: 2.5, statusChance: 0.3, triggerType: "Auto", magazine: 45, reloadTime: 1.8, specialMechanics: { evolutionMode: "Rapid-fire with ricocheting shots", modeSwitch: "Kills build evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Boar Incarnon (genesis_primary)
  {
    weaponId: "boar_incarnon",
    weaponName: "Boar Incarnon",
    challenge: "Kill 100 enemies with Slam Attacks",
    category: "genesis_primary",
    variants: ["boar", "boar_prime"],
    forms: [
      { name: "Boar", damage: 360.0, fireRate: 5.0, criticalChance: 0.15, criticalMultiplier: 2.0, statusChance: 0.3, triggerType: "Auto", magazine: 20, reloadTime: 2.7 },
      { name: "Boar Incarnon", damage: 720.0, fireRate: 5.0, criticalChance: 0.25, criticalMultiplier: 2.5, statusChance: 0.45, triggerType: "Auto", magazine: 20, reloadTime: 2.7, specialMechanics: { evolutionMode: "Tighter spread, higher damage", modeSwitch: "Slam attack kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Boltor Incarnon (genesis_primary)
  {
    weaponId: "boltor_incarnon",
    weaponName: "Boltor Incarnon",
    challenge: "Kill 100 enemies",
    category: "genesis_primary",
    variants: ["boltor", "boltor_prime", "telos_boltor"],
    forms: [
      { name: "Boltor", damage: 60.0, fireRate: 8.75, criticalChance: 0.1, criticalMultiplier: 1.8, statusChance: 0.14, triggerType: "Auto", magazine: 60, reloadTime: 2.6 },
      { name: "Boltor Incarnon", damage: 120.0, fireRate: 8.75, criticalChance: 0.2, criticalMultiplier: 2.3, statusChance: 0.28, triggerType: "Auto", magazine: 60, reloadTime: 2.6, specialMechanics: { evolutionMode: "Bolts explode on impact", modeSwitch: "Kills build evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Braton Incarnon (genesis_primary)
  {
    weaponId: "braton_incarnon",
    weaponName: "Braton Incarnon",
    challenge: "Kill 100 enemies with headshots",
    category: "genesis_primary",
    variants: ["braton", "braton_prime", "braton_vandal", "mk1_braton"],
    forms: [
      { name: "Braton", damage: 24.0, fireRate: 8.75, criticalChance: 0.12, criticalMultiplier: 1.6, statusChance: 0.06, triggerType: "Auto", magazine: 50, reloadTime: 2.0 },
      { name: "Braton Incarnon", damage: 80.0, fireRate: 4.0, criticalChance: 0.3, criticalMultiplier: 2.2, statusChance: 0.35, triggerType: "Semi", magazine: 50, reloadTime: 2.0, specialMechanics: { evolutionMode: "Semi-auto explosive shots", modeSwitch: "Headshot kills build evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Burston Incarnon (genesis_primary)
  {
    weaponId: "burston_incarnon",
    weaponName: "Burston Incarnon",
    challenge: "Land 10 headshots in a single mission",
    category: "genesis_primary",
    variants: ["burston", "burston_prime"],
    forms: [
      { name: "Burston", damage: 36.0, fireRate: 7.83, criticalChance: 0.18, criticalMultiplier: 1.6, statusChance: 0.28, triggerType: "Burst", magazine: 45, reloadTime: 2.0 },
      { name: "Burston Incarnon", damage: 72.0, fireRate: 7.83, criticalChance: 0.28, criticalMultiplier: 2.2, statusChance: 0.42, triggerType: "Burst", magazine: 45, reloadTime: 2.0, specialMechanics: { evolutionMode: "5-round burst with punch-through", modeSwitch: "Headshot kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Dera Incarnon (genesis_primary)
  {
    weaponId: "dera_incarnon",
    weaponName: "Dera Incarnon",
    challenge: "Kill 100 enemies",
    category: "genesis_primary",
    variants: ["dera", "dera_vandal"],
    forms: [
      { name: "Dera", damage: 30.0, fireRate: 11.25, criticalChance: 0.08, criticalMultiplier: 2.0, statusChance: 0.16, triggerType: "Burst", magazine: 45, reloadTime: 1.8 },
      { name: "Dera Incarnon", damage: 60.0, fireRate: 11.25, criticalChance: 0.18, criticalMultiplier: 2.5, statusChance: 0.32, triggerType: "Burst", magazine: 45, reloadTime: 1.8, specialMechanics: { evolutionMode: "Crimson Overture - Enhanced burst fire", modeSwitch: "Kills build evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Dread Incarnon (genesis_primary)
  {
    weaponId: "dread_incarnon",
    weaponName: "Dread Incarnon",
    challenge: "Kill 100 enemies with headshots",
    category: "genesis_primary",
    variants: ["dread"],
    forms: [
      { name: "Dread", damage: 200.0, fireRate: 1.0, criticalChance: 0.5, criticalMultiplier: 2.0, statusChance: 0.2, triggerType: "Charge", magazine: 1, reloadTime: 0.9 },
      { name: "Dread Incarnon", damage: 400.0, fireRate: 1.0, criticalChance: 0.6, criticalMultiplier: 2.5, statusChance: 0.35, triggerType: "Charge", magazine: 1, reloadTime: 0.9, specialMechanics: { evolutionMode: "Explosive arrows with 5m radius", modeSwitch: "Headshot kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Gorgon Incarnon (genesis_primary)
  {
    weaponId: "gorgon_incarnon",
    weaponName: "Gorgon Incarnon",
    challenge: "Kill 100 enemies",
    category: "genesis_primary",
    variants: ["gorgon", "gorgon_wraith", "prisma_gorgon"],
    forms: [
      { name: "Gorgon", damage: 33.0, fireRate: 12.5, criticalChance: 0.15, criticalMultiplier: 1.5, statusChance: 0.09, triggerType: "Auto", magazine: 90, reloadTime: 4.2 },
      { name: "Gorgon Incarnon", damage: 66.0, fireRate: 12.5, criticalChance: 0.25, criticalMultiplier: 2.0, statusChance: 0.2, triggerType: "Auto", magazine: 90, reloadTime: 4.2, specialMechanics: { evolutionMode: "Spin-up creates void projectiles", modeSwitch: "Sustained fire builds evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Latron Incarnon (genesis_primary)
  {
    weaponId: "latron_incarnon",
    weaponName: "Latron Incarnon",
    challenge: "Land 10 headshots in a single mission",
    category: "genesis_primary",
    variants: ["latron", "latron_prime", "latron_wraith"],
    forms: [
      { name: "Latron", damage: 55.0, fireRate: 4.17, criticalChance: 0.25, criticalMultiplier: 2.0, statusChance: 0.15, triggerType: "Semi", magazine: 15, reloadTime: 2.4 },
      { name: "Latron Incarnon", damage: 110.0, fireRate: 4.17, criticalChance: 0.35, criticalMultiplier: 2.5, statusChance: 0.28, triggerType: "Semi", magazine: 15, reloadTime: 2.4, specialMechanics: { evolutionMode: "Rounds split into 3 seeking projectiles", modeSwitch: "Headshot kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Paris Incarnon (genesis_primary)
  {
    weaponId: "paris_incarnon",
    weaponName: "Paris Incarnon",
    challenge: "Kill 100 enemies with headshots",
    category: "genesis_primary",
    variants: ["paris", "paris_prime", "mk1_paris"],
    forms: [
      { name: "Paris", damage: 180.0, fireRate: 1.0, criticalChance: 0.35, criticalMultiplier: 2.0, statusChance: 0.1, triggerType: "Charge", magazine: 1, reloadTime: 1.0 },
      { name: "Paris Incarnon", damage: 360.0, fireRate: 1.0, criticalChance: 0.45, criticalMultiplier: 2.5, statusChance: 0.22, triggerType: "Charge", magazine: 1, reloadTime: 1.0, specialMechanics: { evolutionMode: "Arrows create void tether between enemies", modeSwitch: "Headshot kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Soma Incarnon (genesis_primary)
  {
    weaponId: "soma_incarnon",
    weaponName: "Soma Incarnon",
    challenge: "Kill 100 enemies",
    category: "genesis_primary",
    variants: ["soma", "soma_prime"],
    forms: [
      { name: "Soma", damage: 12.0, fireRate: 15.0, criticalChance: 0.3, criticalMultiplier: 3.0, statusChance: 0.1, triggerType: "Auto", magazine: 100, reloadTime: 3.0 },
      { name: "Soma Incarnon", damage: 24.0, fireRate: 15.0, criticalChance: 0.4, criticalMultiplier: 3.5, statusChance: 0.2, triggerType: "Auto", magazine: 100, reloadTime: 3.0, specialMechanics: { evolutionMode: "Critical hits fire void ricochets", modeSwitch: "Critical hits build evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Strun Incarnon (genesis_primary)
  {
    weaponId: "strun_incarnon",
    weaponName: "Strun Incarnon",
    challenge: "Kill 100 enemies with Slam Attacks",
    category: "genesis_primary",
    variants: ["strun", "strun_prime", "strun_wraith", "mk1_strun"],
    forms: [
      { name: "Strun", damage: 300.0, fireRate: 2.5, criticalChance: 0.15, criticalMultiplier: 2.0, statusChance: 0.2, triggerType: "Semi", magazine: 6, reloadTime: 3.0 },
      { name: "Strun Incarnon", damage: 600.0, fireRate: 2.5, criticalChance: 0.25, criticalMultiplier: 2.5, statusChance: 0.35, triggerType: "Semi", magazine: 6, reloadTime: 3.0, specialMechanics: { evolutionMode: "Concentrated void blast with infinite punch-through", modeSwitch: "Slam attack kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Sybaris Incarnon (genesis_primary)
  {
    weaponId: "sybaris_incarnon",
    weaponName: "Sybaris Incarnon",
    challenge: "Land 10 headshots in a single mission",
    category: "genesis_primary",
    variants: ["sybaris", "sybaris_prime", "dex_sybaris"],
    forms: [
      { name: "Sybaris", damage: 75.0, fireRate: 3.33, criticalChance: 0.3, criticalMultiplier: 2.0, statusChance: 0.25, triggerType: "Burst", magazine: 20, reloadTime: 2.0 },
      { name: "Sybaris Incarnon", damage: 150.0, fireRate: 3.33, criticalChance: 0.4, criticalMultiplier: 2.5, statusChance: 0.4, triggerType: "Burst", magazine: 20, reloadTime: 2.0, specialMechanics: { evolutionMode: "Burst creates void precision strikes", modeSwitch: "Headshot kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Miter Incarnon (genesis_primary)
  {
    weaponId: "miter_incarnon",
    weaponName: "Miter Incarnon",
    challenge: "Kill 100 enemies",
    category: "genesis_primary",
    variants: ["miter"],
    forms: [
      { name: "Miter", damage: 250.0, fireRate: 2.5, criticalChance: 0.1, criticalMultiplier: 2.0, statusChance: 0.5, triggerType: "Charge", magazine: 20, reloadTime: 2.0 },
      { name: "Miter Incarnon", damage: 500.0, fireRate: 2.5, criticalChance: 0.22, criticalMultiplier: 2.5, statusChance: 0.6, triggerType: "Auto", magazine: 20, reloadTime: 2.0, specialMechanics: { evolutionMode: "Rapid-fire bouncing saw blades", modeSwitch: "Kills build evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Torid Incarnon (genesis_primary)
  {
    weaponId: "torid_incarnon",
    weaponName: "Torid Incarnon",
    challenge: "Kill 100 enemies",
    category: "genesis_primary",
    variants: ["torid"],
    forms: [
      { name: "Torid", damage: 250.0, fireRate: 1.5, criticalChance: 0.15, criticalMultiplier: 2.0, statusChance: 0.25, triggerType: "Semi", magazine: 5, reloadTime: 1.7 },
      { name: "Torid Incarnon", damage: 500.0, fireRate: 1.5, criticalChance: 0.28, criticalMultiplier: 2.5, statusChance: 0.4, triggerType: "Semi", magazine: 5, reloadTime: 1.7, specialMechanics: { evolutionMode: "Toxin grenades chain between enemies", modeSwitch: "Kills build evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Vasto Incarnon (genesis_secondary)
  {
    weaponId: "vasto_incarnon",
    weaponName: "Vasto Incarnon",
    challenge: "Kill 100 enemies with headshots",
    category: "genesis_secondary",
    variants: ["vasto", "vasto_prime"],
    forms: [
      { name: "Vasto", damage: 65.0, fireRate: 4.17, criticalChance: 0.2, criticalMultiplier: 1.8, statusChance: 0.08, triggerType: "Semi", magazine: 6, reloadTime: 1.5 },
      { name: "Vasto Incarnon", damage: 130.0, fireRate: 4.17, criticalChance: 0.32, criticalMultiplier: 2.3, statusChance: 0.18, triggerType: "Semi", magazine: 6, reloadTime: 1.5, specialMechanics: { evolutionMode: "Ricocheting void slugs", modeSwitch: "Headshot kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Lex Incarnon (genesis_secondary)
  {
    weaponId: "lex_incarnon",
    weaponName: "Lex Incarnon",
    challenge: "Kill 100 enemies with headshots",
    category: "genesis_secondary",
    variants: ["lex", "lex_prime"],
    forms: [
      { name: "Lex", damage: 130.0, fireRate: 2.0, criticalChance: 0.25, criticalMultiplier: 2.0, statusChance: 0.1, triggerType: "Semi", magazine: 9, reloadTime: 2.35 },
      { name: "Lex Incarnon", damage: 260.0, fireRate: 2.0, criticalChance: 0.35, criticalMultiplier: 2.5, statusChance: 0.2, triggerType: "Semi", magazine: 9, reloadTime: 2.35, specialMechanics: { evolutionMode: "Void precision shots with punch-through", modeSwitch: "Headshot kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Lato Incarnon (genesis_secondary)
  {
    weaponId: "lato_incarnon",
    weaponName: "Lato Incarnon",
    challenge: "Kill 100 enemies with headshots",
    category: "genesis_secondary",
    variants: ["lato", "lato_prime", "lato_vandal"],
    forms: [
      { name: "Lato", damage: 30.0, fireRate: 6.67, criticalChance: 0.1, criticalMultiplier: 1.8, statusChance: 0.08, triggerType: "Semi", magazine: 15, reloadTime: 1.4 },
      { name: "Lato Incarnon", damage: 60.0, fireRate: 6.67, criticalChance: 0.22, criticalMultiplier: 2.3, statusChance: 0.18, triggerType: "Semi", magazine: 15, reloadTime: 1.4, specialMechanics: { evolutionMode: "Burst-fire void rounds", modeSwitch: "Headshot kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Angstrum Incarnon (genesis_secondary)
  {
    weaponId: "angstrum_incarnon",
    weaponName: "Angstrum Incarnon",
    challenge: "Kill 100 enemies",
    category: "genesis_secondary",
    variants: ["angstrum", "prisma_angstrum"],
    forms: [
      { name: "Angstrum", damage: 450.0, fireRate: 2.0, criticalChance: 0.16, criticalMultiplier: 2.0, statusChance: 0.22, triggerType: "Charge", magazine: 3, reloadTime: 2.5 },
      { name: "Angstrum Incarnon", damage: 900.0, fireRate: 2.0, criticalChance: 0.26, criticalMultiplier: 2.5, statusChance: 0.35, triggerType: "Auto", magazine: 3, reloadTime: 2.5, specialMechanics: { evolutionMode: "Fires seeking void rockets", modeSwitch: "Kills build evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Atomos Incarnon (genesis_secondary)
  {
    weaponId: "atomos_incarnon",
    weaponName: "Atomos Incarnon",
    challenge: "Kill 100 enemies",
    category: "genesis_secondary",
    variants: ["atomos"],
    forms: [
      { name: "Atomos", damage: 50.0, fireRate: 8.0, criticalChance: 0.15, criticalMultiplier: 1.7, statusChance: 0.21, triggerType: "Held", magazine: 70, reloadTime: 2.0 },
      { name: "Atomos Incarnon", damage: 100.0, fireRate: 8.0, criticalChance: 0.25, criticalMultiplier: 2.2, statusChance: 0.35, triggerType: "Held", magazine: 70, reloadTime: 2.0, specialMechanics: { evolutionMode: "Void beam chains to additional targets", modeSwitch: "Sustained damage builds evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Bronco Incarnon (genesis_secondary)
  {
    weaponId: "bronco_incarnon",
    weaponName: "Bronco Incarnon",
    challenge: "Kill 100 enemies with Slam Attacks",
    category: "genesis_secondary",
    variants: ["bronco", "bronco_prime"],
    forms: [
      { name: "Bronco", damage: 280.0, fireRate: 5.0, criticalChance: 0.06, criticalMultiplier: 2.0, statusChance: 0.22, triggerType: "Semi", magazine: 4, reloadTime: 1.05 },
      { name: "Bronco Incarnon", damage: 560.0, fireRate: 5.0, criticalChance: 0.18, criticalMultiplier: 2.5, statusChance: 0.38, triggerType: "Semi", magazine: 4, reloadTime: 1.05, specialMechanics: { evolutionMode: "Void slug with massive punch-through", modeSwitch: "Slam attack kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Cestra Incarnon (genesis_secondary)
  {
    weaponId: "cestra_incarnon",
    weaponName: "Cestra Incarnon",
    challenge: "Kill 100 enemies",
    category: "genesis_secondary",
    variants: ["cestra"],
    forms: [
      { name: "Cestra", damage: 26.0, fireRate: 8.33, criticalChance: 0.06, criticalMultiplier: 1.6, statusChance: 0.2, triggerType: "Auto", magazine: 60, reloadTime: 2.0 },
      { name: "Cestra Incarnon", damage: 52.0, fireRate: 8.33, criticalChance: 0.18, criticalMultiplier: 2.2, statusChance: 0.35, triggerType: "Auto", magazine: 60, reloadTime: 2.0, specialMechanics: { evolutionMode: "Homing void projectiles", modeSwitch: "Kills build evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Despair Incarnon (genesis_secondary)
  {
    weaponId: "despair_incarnon",
    weaponName: "Despair Incarnon",
    challenge: "Kill 100 enemies with headshots",
    category: "genesis_secondary",
    variants: ["despair"],
    forms: [
      { name: "Despair", damage: 58.0, fireRate: 3.33, criticalChance: 0.16, criticalMultiplier: 1.6, statusChance: 0.16, triggerType: "Auto", magazine: 10, reloadTime: 0.75 },
      { name: "Despair Incarnon", damage: 116.0, fireRate: 3.33, criticalChance: 0.28, criticalMultiplier: 2.2, statusChance: 0.3, triggerType: "Auto", magazine: 10, reloadTime: 0.75, specialMechanics: { evolutionMode: "Void kunai that embed and explode", modeSwitch: "Headshot kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Dual Toxocyst Incarnon (genesis_secondary)
  {
    weaponId: "dual_toxocyst_incarnon",
    weaponName: "Dual Toxocyst Incarnon",
    challenge: "Kill 100 enemies with headshots",
    category: "genesis_secondary",
    variants: ["dual_toxocyst"],
    forms: [
      { name: "Dual Toxocyst", damage: 70.0, fireRate: 1.0, criticalChance: 0.05, criticalMultiplier: 2.0, statusChance: 0.37, triggerType: "Semi", magazine: 12, reloadTime: 2.35 },
      { name: "Dual Toxocyst Incarnon", damage: 140.0, fireRate: 1.0, criticalChance: 0.18, criticalMultiplier: 2.5, statusChance: 0.5, triggerType: "Semi", magazine: 12, reloadTime: 2.35, specialMechanics: { evolutionMode: "Frenzy on headshot, full-auto with increased fire rate", modeSwitch: "Headshot kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Furis Incarnon (genesis_secondary)
  {
    weaponId: "furis_incarnon",
    weaponName: "Furis Incarnon",
    challenge: "Kill 100 enemies",
    category: "genesis_secondary",
    variants: ["furis", "mk1_furis"],
    forms: [
      { name: "Furis", damage: 18.0, fireRate: 10.0, criticalChance: 0.05, criticalMultiplier: 1.8, statusChance: 0.12, triggerType: "Auto", magazine: 35, reloadTime: 1.4 },
      { name: "Furis Incarnon", damage: 36.0, fireRate: 10.0, criticalChance: 0.18, criticalMultiplier: 2.3, statusChance: 0.26, triggerType: "Auto", magazine: 35, reloadTime: 1.4, specialMechanics: { evolutionMode: "Health steal on hit", modeSwitch: "Kills build evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Gammacor Incarnon (genesis_secondary)
  {
    weaponId: "gammacor_incarnon",
    weaponName: "Gammacor Incarnon",
    challenge: "Kill 100 enemies",
    category: "genesis_secondary",
    variants: ["gammacor", "synoid_gammacor"],
    forms: [
      { name: "Gammacor", damage: 16.0, fireRate: 12.0, criticalChance: 0.08, criticalMultiplier: 1.8, statusChance: 0.2, triggerType: "Held", magazine: 50, reloadTime: 1.8 },
      { name: "Gammacor Incarnon", damage: 32.0, fireRate: 12.0, criticalChance: 0.2, criticalMultiplier: 2.3, statusChance: 0.36, triggerType: "Held", magazine: 50, reloadTime: 1.8, specialMechanics: { evolutionMode: "Magnetic void beam with energy restore", modeSwitch: "Sustained damage builds evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Kunai Incarnon (genesis_secondary)
  {
    weaponId: "kunai_incarnon",
    weaponName: "Kunai Incarnon",
    challenge: "Kill 100 enemies",
    category: "genesis_secondary",
    variants: ["kunai", "mk1_kunai"],
    forms: [
      { name: "Kunai", damage: 46.0, fireRate: 3.33, criticalChance: 0.08, criticalMultiplier: 1.6, statusChance: 0.08, triggerType: "Auto", magazine: 10, reloadTime: 0.8 },
      { name: "Kunai Incarnon", damage: 92.0, fireRate: 3.33, criticalChance: 0.2, criticalMultiplier: 2.2, statusChance: 0.2, triggerType: "Auto", magazine: 10, reloadTime: 0.8, specialMechanics: { evolutionMode: "Void kunai with seeking capability", modeSwitch: "Kills build evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Sicarus Incarnon (genesis_secondary)
  {
    weaponId: "sicarus_incarnon",
    weaponName: "Sicarus Incarnon",
    challenge: "Land 10 headshots in a single mission",
    category: "genesis_secondary",
    variants: ["sicarus", "sicarus_prime"],
    forms: [
      { name: "Sicarus", damage: 42.0, fireRate: 7.5, criticalChance: 0.16, criticalMultiplier: 2.0, statusChance: 0.1, triggerType: "Burst", magazine: 15, reloadTime: 2.0 },
      { name: "Sicarus Incarnon", damage: 84.0, fireRate: 7.5, criticalChance: 0.28, criticalMultiplier: 2.5, statusChance: 0.24, triggerType: "Burst", magazine: 15, reloadTime: 2.0, specialMechanics: { evolutionMode: "5-round burst with void explosions", modeSwitch: "Headshot kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Zylok Incarnon (genesis_secondary)
  {
    weaponId: "zylok_incarnon",
    weaponName: "Zylok Incarnon",
    challenge: "Kill 100 enemies with headshots",
    category: "genesis_secondary",
    variants: ["zylok", "zylok_prime"],
    forms: [
      { name: "Zylok", damage: 84.0, fireRate: 3.33, criticalChance: 0.2, criticalMultiplier: 2.0, statusChance: 0.26, triggerType: "Duplex", magazine: 8, reloadTime: 1.2 },
      { name: "Zylok Incarnon", damage: 168.0, fireRate: 3.33, criticalChance: 0.32, criticalMultiplier: 2.5, statusChance: 0.4, triggerType: "Duplex", magazine: 8, reloadTime: 1.2, specialMechanics: { evolutionMode: "Duplex void shots with guaranteed proc", modeSwitch: "Headshot kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Ready Retaliation", description: "+100% Damage when wielding Melee weapon.", statChanges: {} },
      { tier: 2, slot: 1, name: "Lone Gun", description: "+60% Damage when no Primary equipped.", statChanges: {} },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Long Shot", description: "+100% Damage Falloff Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Status Surge", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Bo Incarnon (genesis_melee)
  {
    weaponId: "bo_incarnon",
    weaponName: "Bo Incarnon",
    challenge: "Kill 100 enemies with Slide Attacks (Heavy Attacks count as 2)",
    category: "genesis_melee",
    variants: ["bo", "bo_prime", "mk1_bo"],
    forms: [
      { name: "Bo", damage: 200.0, fireRate: 1.0, criticalChance: 0.25, criticalMultiplier: 2.0, statusChance: 0.2, triggerType: "Melee" },
      { name: "Bo Incarnon", damage: 400.0, fireRate: 0.8, criticalChance: 0.35, criticalMultiplier: 2.5, statusChance: 0.3, triggerType: "Melee", specialMechanics: { evolutionMode: "Heavy slam creates shockwave", evolutionBonus: "Heavy attacks fire energy wave" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Skana Incarnon (genesis_melee)
  {
    weaponId: "skana_incarnon",
    weaponName: "Skana Incarnon",
    challenge: "Kill 100 enemies with Slide Attacks",
    category: "genesis_melee",
    variants: ["skana", "skana_prime", "prisma_skana"],
    forms: [
      { name: "Skana", damage: 120.0, fireRate: 1.0, criticalChance: 0.15, criticalMultiplier: 1.8, statusChance: 0.1, triggerType: "Melee" },
      { name: "Skana Incarnon", damage: 240.0, fireRate: 1.0, criticalChance: 0.25, criticalMultiplier: 2.3, statusChance: 0.22, triggerType: "Melee", specialMechanics: { evolutionMode: "Void blade extensions on heavy attack", modeSwitch: "Slide or Heavy attack kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Ack & Brunt Incarnon (genesis_melee)
  {
    weaponId: "ack_brunt_incarnon",
    weaponName: "Ack & Brunt Incarnon",
    challenge: "Block 1000 damage",
    category: "genesis_melee",
    variants: ["ack_and_brunt"],
    forms: [
      { name: "Ack & Brunt", damage: 230.0, fireRate: 0.833, criticalChance: 0.1, criticalMultiplier: 2.0, statusChance: 0.25, triggerType: "Melee" },
      { name: "Ack & Brunt Incarnon", damage: 460.0, fireRate: 0.833, criticalChance: 0.22, criticalMultiplier: 2.5, statusChance: 0.4, triggerType: "Melee", specialMechanics: { evolutionMode: "Shield throw with void explosion on return", modeSwitch: "Block damage builds evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Anku Incarnon (genesis_melee)
  {
    weaponId: "anku_incarnon",
    weaponName: "Anku Incarnon",
    challenge: "Kill 100 enemies with Slide Attacks",
    category: "genesis_melee",
    variants: ["anku"],
    forms: [
      { name: "Anku", damage: 195.0, fireRate: 1.08, criticalChance: 0.2, criticalMultiplier: 2.0, statusChance: 0.25, triggerType: "Melee" },
      { name: "Anku Incarnon", damage: 390.0, fireRate: 1.08, criticalChance: 0.32, criticalMultiplier: 2.5, statusChance: 0.4, triggerType: "Melee", specialMechanics: { evolutionMode: "Void scythe waves on heavy attack", modeSwitch: "Slide attack kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Ceramic Dagger Incarnon (genesis_melee)
  {
    weaponId: "ceramic_dagger_incarnon",
    weaponName: "Ceramic Dagger Incarnon",
    challenge: "Kill 100 enemies with Finisher Attacks",
    category: "genesis_melee",
    variants: ["ceramic_dagger"],
    forms: [
      { name: "Ceramic Dagger", damage: 110.0, fireRate: 1.0, criticalChance: 0.05, criticalMultiplier: 1.5, statusChance: 0.1, triggerType: "Melee" },
      { name: "Ceramic Dagger Incarnon", damage: 220.0, fireRate: 1.0, criticalChance: 0.18, criticalMultiplier: 2.2, statusChance: 0.25, triggerType: "Melee", specialMechanics: { evolutionMode: "Finisher attacks create void implosion", modeSwitch: "Finisher kills build evolution" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Dual Ichor Incarnon (genesis_melee)
  {
    weaponId: "dual_ichor_incarnon",
    weaponName: "Dual Ichor Incarnon",
    challenge: "Kill 100 enemies with Slide Attacks",
    category: "genesis_melee",
    variants: ["dual_ichor"],
    forms: [
      { name: "Dual Ichor", damage: 175.0, fireRate: 1.0, criticalChance: 0.15, criticalMultiplier: 3.0, statusChance: 0.15, triggerType: "Melee" },
      { name: "Dual Ichor Incarnon", damage: 350.0, fireRate: 1.0, criticalChance: 0.28, criticalMultiplier: 3.5, statusChance: 0.3, triggerType: "Melee", specialMechanics: { evolutionMode: "Toxic void slashes with spreading corrosion", modeSwitch: "Slide attack kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Furax Incarnon (genesis_melee)
  {
    weaponId: "furax_incarnon",
    weaponName: "Furax Incarnon",
    challenge: "Kill 100 enemies with Ground Finishers",
    category: "genesis_melee",
    variants: ["furax", "mk1_furax", "furax_wraith"],
    forms: [
      { name: "Furax", damage: 130.0, fireRate: 1.0, criticalChance: 0.2, criticalMultiplier: 2.0, statusChance: 0.1, triggerType: "Melee" },
      { name: "Furax Incarnon", damage: 260.0, fireRate: 1.0, criticalChance: 0.32, criticalMultiplier: 2.5, statusChance: 0.22, triggerType: "Melee", specialMechanics: { evolutionMode: "Void-charged uppercut with knockback wave", modeSwitch: "Ground finisher kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Hate Incarnon (genesis_melee)
  {
    weaponId: "hate_incarnon",
    weaponName: "Hate Incarnon",
    challenge: "Kill 100 enemies with Slide Attacks",
    category: "genesis_melee",
    variants: ["hate"],
    forms: [
      { name: "Hate", damage: 250.0, fireRate: 1.08, criticalChance: 0.3, criticalMultiplier: 2.5, statusChance: 0.2, triggerType: "Melee" },
      { name: "Hate Incarnon", damage: 500.0, fireRate: 1.08, criticalChance: 0.42, criticalMultiplier: 3.0, statusChance: 0.35, triggerType: "Melee", specialMechanics: { evolutionMode: "Void reaping arc on heavy attack", modeSwitch: "Slide attack kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Magistar Incarnon (genesis_melee)
  {
    weaponId: "magistar_incarnon",
    weaponName: "Magistar Incarnon",
    challenge: "Kill 100 enemies with Heavy Attacks",
    category: "genesis_melee",
    variants: ["magistar", "sancti_magistar"],
    forms: [
      { name: "Magistar", damage: 240.0, fireRate: 0.833, criticalChance: 0.2, criticalMultiplier: 2.0, statusChance: 0.15, triggerType: "Melee" },
      { name: "Magistar Incarnon", damage: 480.0, fireRate: 0.833, criticalChance: 0.32, criticalMultiplier: 2.5, statusChance: 0.3, triggerType: "Melee", specialMechanics: { evolutionMode: "Void slam creates sanctifying ground", modeSwitch: "Heavy attack kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Nami Solo Incarnon (genesis_melee)
  {
    weaponId: "nami_solo_incarnon",
    weaponName: "Nami Solo Incarnon",
    challenge: "Kill 100 enemies with Slide Attacks",
    category: "genesis_melee",
    variants: ["nami_solo"],
    forms: [
      { name: "Nami Solo", damage: 145.0, fireRate: 0.917, criticalChance: 0.1, criticalMultiplier: 1.5, statusChance: 0.2, triggerType: "Melee" },
      { name: "Nami Solo Incarnon", damage: 290.0, fireRate: 0.917, criticalChance: 0.22, criticalMultiplier: 2.2, statusChance: 0.35, triggerType: "Melee", specialMechanics: { evolutionMode: "Void cutlass combos with water slash waves", modeSwitch: "Slide attack kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Okina Incarnon (genesis_melee)
  {
    weaponId: "okina_incarnon",
    weaponName: "Okina Incarnon",
    challenge: "Kill 100 enemies with Slide Attacks",
    category: "genesis_melee",
    variants: ["okina", "okina_prime"],
    forms: [
      { name: "Okina", damage: 160.0, fireRate: 1.17, criticalChance: 0.1, criticalMultiplier: 2.0, statusChance: 0.25, triggerType: "Melee" },
      { name: "Okina Incarnon", damage: 320.0, fireRate: 1.17, criticalChance: 0.22, criticalMultiplier: 2.5, statusChance: 0.4, triggerType: "Melee", specialMechanics: { evolutionMode: "Rapid void stabs with bleeding procs", modeSwitch: "Slide attack kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
  // Sibear Incarnon (genesis_melee)
  {
    weaponId: "sibear_incarnon",
    weaponName: "Sibear Incarnon",
    challenge: "Kill 100 enemies with Heavy Attacks",
    category: "genesis_melee",
    variants: ["sibear"],
    forms: [
      { name: "Sibear", damage: 260.0, fireRate: 0.917, criticalChance: 0.15, criticalMultiplier: 2.0, statusChance: 0.1, triggerType: "Melee" },
      { name: "Sibear Incarnon", damage: 520.0, fireRate: 0.917, criticalChance: 0.28, criticalMultiplier: 2.5, statusChance: 0.25, triggerType: "Melee", specialMechanics: { evolutionMode: "Void frost slam creates ice field", modeSwitch: "Heavy attack kills" } },
    ],
    evolutions: [
      { tier: 1, slot: 0, name: "Incarnon Form", description: "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.", statChanges: {} },
      { tier: 2, slot: 0, name: "Rupture Strike", description: "+50% Status Chance.", statChanges: { statusChance: 0.5 } },
      { tier: 2, slot: 1, name: "Critical Strike", description: "+20% Critical Chance.", statChanges: { criticalChance: 0.2 } },
      { tier: 3, slot: 0, name: "Elemental Excess", description: "+200% Elemental Damage.", statChanges: {} },
      { tier: 3, slot: 1, name: "Swift Transformation", description: "+50% Incarnon Buildup.", statChanges: {} },
      { tier: 4, slot: 0, name: "Extended Strike", description: "+1.5m Range.", statChanges: {} },
      { tier: 4, slot: 1, name: "Finishing Touch", description: "+150% Finisher Damage.", statChanges: {} },
      { tier: 5, slot: 0, name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal +2500% Damage.", statChanges: { criticalChance: -0.3 } },
      { tier: 5, slot: 1, name: "Elemental Flow", description: "Convert 100% of Physical Damage to Elemental.", statChanges: {} },
    ],
  },
];

// Melee weapon IDs (for determining evolution pool)
const MELEE_INCARNON_IDS = new Set([
  "innodem", "praedos", "ruvox",
  "ack_brunt_incarnon", "ack_and_brunt",
  "anku_incarnon", "anku",
  "bo_incarnon", "bo", "bo_prime", "mk1_bo",
  "ceramic_dagger_incarnon", "ceramic_dagger",
  "dual_ichor_incarnon", "dual_ichor",
  "furax_incarnon", "furax", "furax_wraith", "mk1_furax",
  "hate_incarnon", "hate",
  "magistar_incarnon", "magistar", "sancti_magistar",
  "nami_solo_incarnon", "nami_solo",
  "okina_incarnon", "okina", "okina_prime",
  "sibear_incarnon", "sibear",
  "skana_incarnon", "skana", "skana_prime", "prisma_skana",
]);

// Quick lookup: weapon ID → incarnon data
// Overrides evolutions with correct 3-option pools based on weapon type
export const incarnonDataMap = new Map<string, IncarnonWeaponData>();
for (const data of incarnonWeaponData) {
  const isMelee = MELEE_INCARNON_IDS.has(data.weaponId) ||
    data.forms.some((f) => f.triggerType === "Melee");
  const correctedData: IncarnonWeaponData = {
    ...data,
    evolutions: isMelee ? getMeleeEvolutions() : getRangedEvolutions(),
  };
  incarnonDataMap.set(correctedData.weaponId, correctedData);
  if (correctedData.variants) {
    for (const v of correctedData.variants) {
      incarnonDataMap.set(v, correctedData);
    }
  }
}
