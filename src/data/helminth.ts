// ==========================================================================
// HELMINTH ABILITY DATA
// ==========================================================================
// Each warframe can subsume one specific ability to the Helminth system.
// Players can then inject any subsumed ability (or Helminth-unique ability)
// into one of their warframe's 4 ability slots.
//
// Sources: https://wiki.warframe.com/w/Helminth
// Last verified: 2025-02
// ==========================================================================

export interface HelminthAbility {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  source: string; // "helminth" for unique, or warframe id for subsumed
  sourceWarframe?: string; // Display name of source warframe
  abilitySlot?: number; // Which slot (1-4) this comes from on the source warframe
  // Optional numeric fields for stat preview (mirrors Ability interface)
  damage?: number;
  damageBuff?: number;
  damageReduction?: number;
  duration?: number;
  range?: number;
  radius?: number;
  castTime?: number;
  miscStats?: Record<string, unknown>;
}

// ── Helminth Unique Abilities (not from any warframe) ────────────────────
const helminthUnique: HelminthAbility[] = [
  {
    id: "helminth_empower",
    name: "Empower",
    // Wiki: +50% Ability Strength on the next cast (not a weapon damage buff). Strength N/A.
    description: "Increase the Ability Strength of your next ability by 50%.",
    energyCost: 25,
    source: "helminth",
    miscStats: { strengthBonus: 0.5 },
  },
  {
    id: "helminth_infested_mobility",
    name: "Infested Mobility",
    description: "Increase sprint speed by 60% and parkour velocity by 30% for 8s.",
    energyCost: 50,
    source: "helminth",
    duration: 8,
  },
  {
    id: "helminth_masters_summons",
    name: "Master's Summons",
    description: "Fully heal and revive your companion, teleporting it to your side.",
    energyCost: 50,
    source: "helminth",
  },
  {
    id: "helminth_rebuild_shields",
    name: "Rebuild Shields",
    description: "Instantly restore shields to full. 12s cooldown.",
    energyCost: 50,
    source: "helminth",
  },
  {
    id: "helminth_perspicacity",
    name: "Perspicacity",
    description: "Your next hack will be automatic.",
    energyCost: 25,
    source: "helminth",
  },
  {
    id: "helminth_energized_munitions",
    name: "Energized Munitions",
    description: "75% ammo efficiency on all weapons for 5s.",
    energyCost: 50,
    source: "helminth",
    duration: 5,
  },
  {
    id: "helminth_marked_for_death",
    name: "Marked For Death",
    description: "Stun an enemy; 75% of next damage dealt to it spreads to nearby enemies.",
    energyCost: 50,
    source: "helminth",
    duration: 4, radius: 15,
  },
  {
    id: "helminth_golden_instinct",
    name: "Golden Instinct",
    description: "Send out a pulse that highlights the nearest rare item or loot.",
    energyCost: 50,
    source: "helminth",
  },
];

// ── Subsumed Abilities (one per warframe) ────────────────────────────────
// Format: { source warframe id, ability name, slot # on original frame }
const subsumedAbilities: HelminthAbility[] = [
  { id: "subsume_ash", name: "Shuriken", description: "Launch spinning blades that seek enemies, dealing damage and stripping armor.", energyCost: 25, source: "ash", sourceWarframe: "Ash", abilitySlot: 1, damage: 500 },
  { id: "subsume_atlas", name: "Petrify", description: "Enemies who meet Atlas's gaze are turned to stone.", energyCost: 75, source: "atlas", sourceWarframe: "Atlas", abilitySlot: 3, duration: 20, range: 14 },
  { id: "subsume_banshee", name: "Silence", description: "Stun nearby enemies and prevent them from using abilities.", energyCost: 75, source: "banshee", sourceWarframe: "Banshee", abilitySlot: 3, duration: 30, range: 20 },
  { id: "subsume_baruuk", name: "Lull", description: "A calming wave slows enemies until they fall into a slumber. Waking enemies are confused and forget prior alertness.", energyCost: 50, frame: "baruuk", sourceWarframe: "Baruuk", abilitySlot: 2, duration: 20, range: 25, miscStats: { waveDuration: 5, finisherDamageVulnerability: 1 } },
  { id: "subsume_caliban", name: "Sentient Wrath", description: "Smash the ground sending out a Tau wave that lifts enemies and applies damage vulnerability.", energyCost: 50, frame: "caliban", sourceWarframe: "Caliban", abilitySlot: 2, damage: 2000, duration: 10, range: 22, miscStats: { damageVulnerability: 0.35 } },
  {
    id: "subsume_chroma",
    name: "Elemental Ward",
    description: "Depending on Chroma's elemental alignment, an aura grants buffs.",
    energyCost: 50,
    source: "chroma",
    sourceWarframe: "Chroma",
    abilitySlot: 2,
    duration: 25,
    radius: 12,
    miscStats: {
      auraRadius: 12,
      heatHealthBonus: 0.55,
      heatDps: 100,
      electricShieldBonus: 0.3,
      electricReflectMult: 10,
      toxinReloadBonus: 0.35,
      toxinHolsterDamage: 0.35,
      toxinProcChance: 0.5,
      coldArmorBonus: 1.45,
      coldReflectMult: 3,
    },
  },
  { id: "subsume_citrine", name: "Preserving Shell", description: "Crystallize around allies, granting damage reduction.", energyCost: 50, source: "citrine", sourceWarframe: "Citrine", abilitySlot: 2, damageReduction: 0.4, duration: 25, range: 50, radius: 8, miscStats: { drCap: 0.9, minDamageReduction: 0.25, drPerKill: 0.03, drPerAssist: 0.01 } },
  { id: "subsume_cyte_09", name: "Resupply", description: "Throw two Elemental Ammo Packs that instantly refill the active weapon's magazine, while granting the weapon an additional instance of the selected Elemental Damage and Status Effect.", energyCost: 50, source: "cyte_09", sourceWarframe: "Cyte-09", abilitySlot: 2, range: 30, radius: 8 },
  { id: "subsume_dagath", name: "Wyrd Scythes", description: "Whirl spectral sickles that inflict Viral damage and slow. Subsumed slow is reduced (26% at max rank).", energyCost: 25, frame: "dagath", sourceWarframe: "Dagath", abilitySlot: 1, damage: 500, duration: 5, range: 15, miscStats: { slowPercent: 0.26, slowCap: 0.95, throwDamage: 1000, sickleCount: 7, minSpinRadius: 1, maxSpinRadius: 5 } },
  { id: "subsume_dante", name: "Dark Verse", description: "Draw blood from nearby enemies, inflicting Slash Damage in a cone.", energyCost: 25, source: "dante", sourceWarframe: "Dante", abilitySlot: 3, damage: 1250, range: 20, miscStats: { coneAngle: 50, slashStatuses: 2 } },
  { id: "subsume_ember", name: "Fire Blast", description: "Slam the ground creating a ring of fire that expands outward, stripping armor.", energyCost: 75, source: "ember", sourceWarframe: "Ember", abilitySlot: 3, damage: 200, radius: 15 },
  { id: "subsume_equinox", name: "Rest & Rage", description: "Put enemies to sleep (Night) or enrage them taking more damage (Day).", energyCost: 25, source: "equinox", sourceWarframe: "Equinox", abilitySlot: 2, duration: 22, range: 20 },
  { id: "subsume_excalibur", name: "Radial Blind", description: "Emit a bright flash that blinds all nearby enemies, opening them to finishers.", energyCost: 50, source: "excalibur", sourceWarframe: "Excalibur", abilitySlot: 2, duration: 15, range: 25 },
  { id: "subsume_frost", name: "Ice Wave", description: "Send a wave of ice that damages and slows enemies.", energyCost: 50, source: "frost", sourceWarframe: "Frost", abilitySlot: 2, damage: 700, range: 20 },
  { id: "subsume_gara", name: "Spectrorage", description: "Trap enemies in a carousel of mirrors that damages and confuses them.", energyCost: 50, source: "gara", sourceWarframe: "Gara", abilitySlot: 3, duration: 15, radius: 8 },
  { id: "subsume_garuda", name: "Blood Altar", description: "Impale an enemy on an altar of talons and siphon health for you and allies.", energyCost: 50, frame: "garuda", sourceWarframe: "Garuda", abilitySlot: 2, duration: 20, range: 30, radius: 8, miscStats: { healthPerSecond: 0.25, damagePerSecond: 0.01, maxAltars: 3, staggerRadius: 8 } },
  { id: "subsume_gauss", name: "Thermal Sunder", description: "Siphon kinetic energy to deal Cold or Heat damage in an area (subsumed damage equals 50% of Gauss full-battery values).", energyCost: 50, source: "gauss", sourceWarframe: "Gauss", abilitySlot: 3, damage: 450, duration: 15, radius: 12, miscStats: { heatDamage: 900, minRadius: 6, maxRadius: 12, areasPerElement: 4, statusDurationMin: 4, statusDurationMax: 8 } },
  { id: "subsume_grendel", name: "Nourish", description: "Buff yourself and allies with Viral damage on weapons and increased energy gain from orbs.", energyCost: 50, range: "grendel", sourceWarframe: "Grendel", abilitySlot: 2, duration: 35, miscStats: { viralDamageBonus: 0.45 } },
  { id: "subsume_gyre", name: "Coil Horizon", description: "Throw forward a Gyratory Sphere that will implode after a few seconds or can be manually triggered.", energyCost: 50, source: "gyre", sourceWarframe: "Gyre", abilitySlot: 2, damage: 1250, radius: 12, miscStats: { contactDamagePerSecond: 1500, sphereLifetime: 2, implosionLifetime: 2 } },
  { id: "subsume_harrow", name: "Condemn", description: "Cast a wave of shackles that immobilizes enemies and restores shields.", energyCost: 25, frame: "harrow", sourceWarframe: "Harrow", abilitySlot: 1, duration: 6, range: 20, miscStats: { shieldsPerEnemy: 150, waveWidth: 2.5 } },
  { id: "subsume_hildryn", name: "Pillage", description: "Emit a pulse that strips enemy shields and armor, restoring your own.", energyCost: 50, source: "hildryn", sourceWarframe: "Hildryn", abilitySlot: 2, range: 8, duration: 2, miscStats: { shieldStrip: 0.25, armorStrip: 0.25, statusCleanse: true } },
  { id: "subsume_hydroid", name: "Tempest Barrage", description: "Bombard an area with a barrage of water projectiles.", energyCost: 25, source: "hydroid", sourceWarframe: "Hydroid", abilitySlot: 1, damage: 150, duration: 5, radius: 10 },
  { id: "subsume_inaros", name: "Desiccation", description: "Blast enemies with a wave of sand, blinding and damaging them.", energyCost: 25, source: "inaros", sourceWarframe: "Inaros", abilitySlot: 1, damage: 150, range: 15, duration: 8 },
  { id: "subsume_ivara", name: "Quiver", description: "Cycle through special arrows: Cloak, Dashwire, Noise, Sleep.", energyCost: 25, source: "ivara", sourceWarframe: "Ivara", abilitySlot: 1, duration: 12 },
  { id: "subsume_jade", name: "Ophanim Eyes", description: "Cone gaze that slows enemies, strips armor and shields with Heat damage over time. Subsumed version cannot revive allies from bleedout.", energyCost: 50, source: "jade", sourceWarframe: "Jade", abilitySlot: 3, damage: 50, duration: 30, range: 20, miscStats: { armorStripPerSecond: 0.1, shieldStripPerSecond: 0.1, slowPerSecond: 0.15, slowCap: 0.9, coneAngle: 70, tickInterval: 0.5 } },
  { id: "subsume_khora", name: "Ensnare", description: "Bind a target in chains, pulling nearby enemies toward it.", energyCost: 50, source: "khora", sourceWarframe: "Khora", abilitySlot: 2, duration: 15, range: 10 },
  { id: "subsume_kullervo", name: "Wrathful Advance", description: "Teleport to a target and strike with a Heavy Attack, granting flat final Melee Critical Chance. Subsumed: reduced teleport range and crit bonus.", energyCost: 25, source: "kullervo", sourceWarframe: "Kullervo", abilitySlot: 1, duration: 10, range: 12.5, castTime: 0.5, miscStats: { criticalChanceBonus: 1, castingCooldown: 1 } },
  { id: "subsume_lavos", name: "Vial Rush", description: "Dash forward, crashing through enemies and leaving an icy trail of broken vials. Costs 0 energy with a 5s cooldown (no Cold imbuement hold-cast).", energyCost: 0, source: "lavos", sourceWarframe: "Lavos", abilitySlot: 2, damage: 250, duration: 8, range: 30, radius: 9, castTime: 0.4, miscStats: { vialCharges: 24, residueRadius: 2, chargeSpeed: 30, castingCooldown: 5 } },
  { id: "subsume_limbo", name: "Banish", description: "Send enemies to or from the Rift plane.", energyCost: 25, source: "limbo", sourceWarframe: "Limbo", abilitySlot: 1, duration: 25 },
  { id: "subsume_loki", name: "Decoy", description: "Deploy a holographic copy of Loki that draws enemy fire.", energyCost: 25, source: "loki", sourceWarframe: "Loki", abilitySlot: 1, duration: 25 },
  { id: "subsume_mag", name: "Pull", description: "Magnetically pull enemies toward you, ragdolling them.", energyCost: 25, source: "mag", sourceWarframe: "Mag", abilitySlot: 1, damage: 300, range: 25 },
  { id: "subsume_mesa", name: "Shooting Gallery", description: "Buff yourself and an ally with +25% damage; jams nearby enemy guns.", energyCost: 50, source: "mesa", sourceWarframe: "Mesa", abilitySlot: 2, damageBuff: 0.25, duration: 30, range: 16 },
  { id: "subsume_mirage", name: "Eclipse", description: "(TAP) Lunar Eclipse: Reduce incoming damage by 75% (cap 75%). (HOLD) Solar Eclipse: +30% weapon damage.", energyCost: 50, source: "mirage", sourceWarframe: "Mirage", abilitySlot: 3, damageBuff: 0.3, damageReduction: 0.75, duration: 30 },
  { id: "subsume_nekros", name: "Terrify", description: "Cast fear into nearby enemies, causing them to flee while stripping armor.", energyCost: 75, frame: "nekros", sourceWarframe: "Nekros", abilitySlot: 2, range: 15, duration: 25, miscStats: { armorStrip: 0.6, affectedEnemies: 20 } },
  { id: "subsume_nezha", name: "Fire Walker", description: "Blaze a trail of flames that damages enemies, cleanses status, and boosts movement speed. Teleport blast deals Heat explosion damage.", energyCost: 25, frame: "nezha", sourceWarframe: "Nezha", abilitySlot: 1, damage: 200, duration: 30, radius: 6, miscStats: { explosionDamage: 1250, flameDuration: 10, speedBuff: 0.25, statusChance: 0.75, damageInterval: 0.5 } },
  { id: "subsume_nidus", name: "Larva", description: "Spawn an infested pod that pulls enemies toward it. Recasting removes the previous pod.", energyCost: 50, source: "nidus", sourceWarframe: "Nidus", abilitySlot: 2, duration: 7, radius: 8 },
  { id: "subsume_nova", name: "Null Star", description: "Create orbiting particles that strike enemies and reduce incoming damage (5% DR per particle, 6 particles).", energyCost: 25, source: "nova", sourceWarframe: "Nova", abilitySlot: 1, damageReduction: 0.05 },
  { id: "subsume_nyx", name: "Mind Control", description: "Absorb an enemy, converting it into an ally.", energyCost: 25, source: "nyx", sourceWarframe: "Nyx", abilitySlot: 1, duration: 30 },
  { id: "subsume_oberon", name: "Smite", description: "Focus a bolt of energy on a target, dealing damage and radiating projectiles.", energyCost: 25, source: "oberon", sourceWarframe: "Oberon", abilitySlot: 1, damage: 500, range: 50 },
  { id: "subsume_octavia", name: "Resonator", description: "Deploy a rolling ball that charms enemies and lures them to follow.", energyCost: 50, source: "octavia", sourceWarframe: "Octavia", abilitySlot: 2, duration: 20, range: 6 },
  { id: "subsume_protea", name: "Dispensary", description: "Deploy a device that generates health, energy, and ammo pickups. Subsumed duration is reduced to 12.5s at max rank.", energyCost: 75, source: "protea", sourceWarframe: "Protea", abilitySlot: 3, duration: 12.5, miscStats: { extraPickupChance: 0.25, spawnInterval: 2, empoweredHealthRestore: 100, maxCaches: 1 } },
  { id: "subsume_qorvex", name: "Chyrinka Pillar", description: "Summon a Chyrinka Pillar that slows enemies and pulses Radiation Damage with a guaranteed Status Effect.", energyCost: 25, source: "qorvex", sourceWarframe: "Qorvex", abilitySlot: 1, damage: 1000, duration: 35, radius: 8, miscStats: { empoweredDuration: 5, pillarHeight: 3, maxPillars: 2, pulseInterval: 1.5, slowPercent: 0.35, empoweredPulseInterval: 0.75 } },
  { id: "subsume_revenant", name: "Reave", description: "Dash through enemies as a wave of energy, stealing shields and health.", energyCost: 50, source: "revenant", sourceWarframe: "Revenant", abilitySlot: 3, range: 15 },
  { id: "subsume_rhino", name: "Roar", description: "Buff damage for yourself and nearby allies by +30% (Helminth-reduced from Rhino's 50%).", energyCost: 50, source: "rhino", sourceWarframe: "Rhino", abilitySlot: 3, damageBuff: 0.3, duration: 30, radius: 25 },
  { id: "subsume_saryn", name: "Molt", description: "Shed your skin, leaving a decoy that draws fire and explodes.", energyCost: 50, source: "saryn", sourceWarframe: "Saryn", abilitySlot: 2, duration: 10 },
  { id: "subsume_sevagoth", name: "Gloom", description: "Summon a channeled radial aura that slows enemies and grants life steal to you and allies within range. Drain 0.75 energy/s per enemy (cap 10).", energyCost: 50, source: "sevagoth", sourceWarframe: "Sevagoth", abilitySlot: 3, miscStats: { slowPercent: 0.35, lifeStealPercent: 0.05, slowCap: 0.95, minRadius: 4, maxRadius: 16, rangeGrowthPerSecond: 2, energyDrainPerEnemy: 0.75, energyDrainEnemyCap: 10, deathWellGainPerSecond: 0.001, channeled: true } },
  { id: "subsume_follie", name: "Self Portrait", description: "Draw an ink effigy that absorbs damage for you and allies while spreading Inkblot.", energyCost: 50, source: "follie", sourceWarframe: "Follie", abilitySlot: 3, duration: 30, radius: 20, damageReduction: 0.5 },
  { id: "subsume_koumei", name: "Omamori", description: "Summon protective charms that can negate incoming damage and heal you.", energyCost: 50, source: "koumei", sourceWarframe: "Koumei", abilitySlot: 3, duration: 30 },
  { id: "subsume_nokko", name: "Brightbonnet", description: "Deploy a mushroom that pulses Energy and Ability Strength to allies.", energyCost: 50, source: "nokko", sourceWarframe: "Nokko", abilitySlot: 2, duration: 20, radius: 15 },
  { id: "subsume_oraxia", name: "Webbed Embrace", description: "Throw a web that ensnares enemies and increases their damage vulnerability.", energyCost: 50, source: "oraxia", sourceWarframe: "Oraxia", abilitySlot: 2, duration: 15, radius: 12 },
  { id: "subsume_sirius_orion", name: "Jade Stars", description: "Conjure Jade Light motes that regenerate over time; attacking enemies launches them for Heat damage.", energyCost: 50, source: "sirius_orion", sourceWarframe: "Sirius & Orion", abilitySlot: 3, duration: 20, radius: 4, damage: 350 },
  { id: "subsume_styanax", name: "Tharros Strike", description: "Swing a fan of shields that deals Impact damage, strips 50% defenses, and restores health per hit.", energyCost: 25, frame: "styanax", sourceWarframe: "Styanax", abilitySlot: 2, damage: 1000, range: 9, miscStats: { shieldStrip: 0.5, armorStrip: 0.5, healthPerHit: 100, shieldCount: 9, horizontalSpread: 135, verticalSpread: 160 } },
  { id: "subsume_temple", name: "Pyrotechnics", description: "Blast enemies with pillars of Heat damage; Backbeat timing enhances the effect.", energyCost: 25, source: "temple", sourceWarframe: "Temple", abilitySlot: 1, damage: 300, range: 25 },
  { id: "subsume_titania", name: "Tribute", description: "Extract buffs from enemies: Thorns, Dust, Full Moon, or Entangle.", energyCost: 50, source: "titania", sourceWarframe: "Titania", abilitySlot: 2, duration: 12 },
  { id: "subsume_trinity", name: "Well of Life", description: "Trap an enemy in stasis, converting it into a healing source.", energyCost: 25, source: "trinity", sourceWarframe: "Trinity", abilitySlot: 1, duration: 12 },
  { id: "subsume_uriel", name: "Remedium", description: "Heal yourself and your demons; resurrects fallen demons.", energyCost: 50, source: "uriel", sourceWarframe: "Uriel", abilitySlot: 2, duration: 12 },
  { id: "subsume_valkyr", name: "Warcry", description: "Buff attack speed and armor for yourself and allies; slow nearby enemies.", energyCost: 50, source: "valkyr", sourceWarframe: "Valkyr", abilitySlot: 2, duration: 15, radius: 25 },
  { id: "subsume_vauban", name: "Tesla Nervos", description: "Deploy rolling drones that electrocute nearby enemies.", energyCost: 25, source: "vauban", sourceWarframe: "Vauban", abilitySlot: 1, damage: 150 },
  { id: "subsume_volt", name: "Shock", description: "Launch an electric bolt that chains between enemies.", energyCost: 25, source: "volt", sourceWarframe: "Volt", abilitySlot: 1, damage: 200, range: 15 },
  { id: "subsume_voruna", name: "Lycath's Hunt", description: "Melee kills drop Health Orbs and headshot kills drop Energy Orbs. Subsumed orb drop rate is reduced to 50%; cannot activate the wolf passive.", energyCost: 75, frame: "voruna", sourceWarframe: "Voruna", abilitySlot: 3, duration: 20, miscStats: { healthOrbChance: 0.5, energyOrbChance: 0.5, durationExtension: 5, maxDuration: 60 } },
  { id: "subsume_wisp", name: "Breach Surge", description: "Open a dimensional breach that blinds and creates surge sparks on hit enemies.", energyCost: 50, source: "wisp", sourceWarframe: "Wisp", abilitySlot: 3, range: 12, duration: 16 },
  { id: "subsume_wukong", name: "Defy", description: "Enter a defensive stance absorbing damage, then release it in a burst.", energyCost: 50, source: "wukong", sourceWarframe: "Wukong", abilitySlot: 3, duration: 2 },
  { id: "subsume_xaku", name: "Xata's Whisper", description: "Imbue weapons with a Void Extra Hit equal to 26% of weapon damage.", energyCost: 25, duration: 35, source: "xaku", sourceWarframe: "Xaku", abilitySlot: 1, miscStats: { voidDamageBonus: 0.26 } },
  { id: "subsume_yareli", name: "Aquablades", description: "Summon a spinning water blade that orbits and slashes nearby enemies.", energyCost: 50, source: "yareli", sourceWarframe: "Yareli", abilitySlot: 3, damage: 500, duration: 20 },
  { id: "subsume_zephyr", name: "Airburst", description: "Launch a burst of air that pulls or pushes enemies.", energyCost: 25, source: "zephyr", sourceWarframe: "Zephyr", abilitySlot: 2, damage: 500, range: 8 },
];

export const allHelminthAbilities: HelminthAbility[] = [
  ...helminthUnique,
  ...subsumedAbilities,
];

export const helminthAbilitiesMap = new Map<string, HelminthAbility>(
  allHelminthAbilities.map((a) => [a.id, a])
);

// Lookup: which ability does each warframe subsume?
export const subsumeMap = new Map<string, HelminthAbility>(
  subsumedAbilities.map((a) => [a.source, a])
);
