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
    description: "Increase the strength of your next ability by 50%.",
    energyCost: 25,
    source: "helminth",
    damageBuff: 0.5,
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
  { id: "subsume_baruuk", name: "Lull", description: "A calming wave slows enemies and puts them to sleep.", energyCost: 50, source: "baruuk", sourceWarframe: "Baruuk", abilitySlot: 2, duration: 15, range: 25 },
  { id: "subsume_caliban", name: "Sentient Wrath", description: "Smash the ground sending out a wave that lifts and damages enemies.", energyCost: 50, source: "caliban", sourceWarframe: "Caliban", abilitySlot: 2, damage: 1000, range: 15 },
  { id: "subsume_chroma", name: "Elemental Ward", description: "Depending on Chroma's elemental alignment, an aura grants buffs.", energyCost: 50, source: "chroma", sourceWarframe: "Chroma", abilitySlot: 2, duration: 25, radius: 12 },
  { id: "subsume_citrine", name: "Preserving Shell", description: "Crystallize around allies, granting damage reduction.", energyCost: 50, source: "citrine", sourceWarframe: "Citrine", abilitySlot: 2, damageReduction: 0.25, duration: 20 },
  { id: "subsume_dagath", name: "Doom", description: "Curse enemies; after a delay, cursed enemies take heavy damage.", energyCost: 50, source: "dagath", sourceWarframe: "Dagath", abilitySlot: 2, damage: 250, duration: 12, range: 15 },
  { id: "subsume_dante", name: "Noctua", description: "Summon Noctua to attack enemies.", energyCost: 25, source: "dante", sourceWarframe: "Dante", abilitySlot: 1, damage: 200 },
  { id: "subsume_ember", name: "Fire Blast", description: "Slam the ground creating a ring of fire that expands outward, stripping armor.", energyCost: 75, source: "ember", sourceWarframe: "Ember", abilitySlot: 3, damage: 200, radius: 15 },
  { id: "subsume_equinox", name: "Rest & Rage", description: "Put enemies to sleep (Night) or enrage them taking more damage (Day).", energyCost: 25, source: "equinox", sourceWarframe: "Equinox", abilitySlot: 2, duration: 22, range: 20 },
  { id: "subsume_excalibur", name: "Radial Blind", description: "Emit a bright flash that blinds all nearby enemies, opening them to finishers.", energyCost: 50, source: "excalibur", sourceWarframe: "Excalibur", abilitySlot: 2, duration: 15, range: 25 },
  { id: "subsume_frost", name: "Ice Wave", description: "Send a wave of ice that damages and slows enemies.", energyCost: 50, source: "frost", sourceWarframe: "Frost", abilitySlot: 2, damage: 700, range: 20 },
  { id: "subsume_gara", name: "Spectrorage", description: "Trap enemies in a carousel of mirrors that damages and confuses them.", energyCost: 50, source: "gara", sourceWarframe: "Gara", abilitySlot: 3, duration: 15, radius: 8 },
  { id: "subsume_garuda", name: "Blood Altar", description: "Impale an enemy on an altar that heals nearby allies.", energyCost: 50, source: "garuda", sourceWarframe: "Garuda", abilitySlot: 2, duration: 20, radius: 8 },
  { id: "subsume_gauss", name: "Thermal Sunder", description: "Siphon kinetic energy to deal Cold or Heat damage in an area.", energyCost: 75, source: "gauss", sourceWarframe: "Gauss", abilitySlot: 3, damage: 800, radius: 12 },
  { id: "subsume_grendel", name: "Nourish", description: "Buff yourself and allies with +25% Toxin damage and energy generation.", energyCost: 50, source: "grendel", sourceWarframe: "Grendel", abilitySlot: 2, damageBuff: 0.25, duration: 35 },
  { id: "subsume_harrow", name: "Condemn", description: "Cast a wave of shackles that immobilizes enemies and restores shields.", energyCost: 25, source: "harrow", sourceWarframe: "Harrow", abilitySlot: 1, duration: 6, range: 20 },
  { id: "subsume_hildryn", name: "Pillage", description: "Emit a pulse that strips enemy shields and armor, restoring your own.", energyCost: 50, source: "hildryn", sourceWarframe: "Hildryn", abilitySlot: 2, range: 8 },
  { id: "subsume_hydroid", name: "Tempest Barrage", description: "Bombard an area with a barrage of water projectiles.", energyCost: 25, source: "hydroid", sourceWarframe: "Hydroid", abilitySlot: 1, damage: 150, duration: 5, radius: 10 },
  { id: "subsume_inaros", name: "Desiccation", description: "Blast enemies with a wave of sand, blinding and damaging them.", energyCost: 25, source: "inaros", sourceWarframe: "Inaros", abilitySlot: 1, damage: 150, range: 15, duration: 8 },
  { id: "subsume_ivara", name: "Quiver", description: "Cycle through special arrows: Cloak, Dashwire, Noise, Sleep.", energyCost: 25, source: "ivara", sourceWarframe: "Ivara", abilitySlot: 1, duration: 12 },
  { id: "subsume_jade", name: "Ophanim Eyes", description: "Cone gaze that slows enemies, strips armor and shields with Heat damage over time. Subsumed version cannot revive allies from bleedout.", energyCost: 50, source: "jade", sourceWarframe: "Jade", abilitySlot: 3, damage: 50, duration: 30, range: 20 },
  { id: "subsume_khora", name: "Ensnare", description: "Bind a target in chains, pulling nearby enemies toward it.", energyCost: 50, source: "khora", sourceWarframe: "Khora", abilitySlot: 2, duration: 15, range: 10 },
  { id: "subsume_kullervo", name: "Wrathful Advance", description: "Dash forward and stab the first enemy hit, dealing heavy damage.", energyCost: 50, source: "kullervo", sourceWarframe: "Kullervo", abilitySlot: 1, damage: 2000 },
  { id: "subsume_lavos", name: "Vial Rush", description: "Dash forward leaving a trail of damaging liquid.", energyCost: 0, source: "lavos", sourceWarframe: "Lavos", abilitySlot: 1, damage: 250 },
  { id: "subsume_limbo", name: "Banish", description: "Send enemies to or from the Rift plane.", energyCost: 25, source: "limbo", sourceWarframe: "Limbo", abilitySlot: 1, duration: 25 },
  { id: "subsume_loki", name: "Decoy", description: "Deploy a holographic copy of Loki that draws enemy fire.", energyCost: 25, source: "loki", sourceWarframe: "Loki", abilitySlot: 1, duration: 25 },
  { id: "subsume_mag", name: "Pull", description: "Magnetically pull enemies toward you, ragdolling them.", energyCost: 25, source: "mag", sourceWarframe: "Mag", abilitySlot: 1, damage: 300, range: 25 },
  { id: "subsume_mesa", name: "Shooting Gallery", description: "Buff yourself and an ally with +25% damage; jams nearby enemy guns.", energyCost: 50, source: "mesa", sourceWarframe: "Mesa", abilitySlot: 2, damageBuff: 0.25, duration: 30, range: 16 },
  { id: "subsume_mirage", name: "Eclipse", description: "(TAP) Lunar Eclipse: Reduce incoming damage by 75% (cap 75%). (HOLD) Solar Eclipse: +30% weapon damage.", energyCost: 50, source: "mirage", sourceWarframe: "Mirage", abilitySlot: 3, damageBuff: 0.3, damageReduction: 0.75, duration: 30 },
  { id: "subsume_nekros", name: "Terrify", description: "Enemies are terrified and flee, their armor is reduced.", energyCost: 50, source: "nekros", sourceWarframe: "Nekros", abilitySlot: 2, range: 25, duration: 25 },
  { id: "subsume_nezha", name: "Fire Walker", description: "Blaze a trail of fire that damages enemies and boosts movement speed.", energyCost: 25, source: "nezha", sourceWarframe: "Nezha", abilitySlot: 1, duration: 30 },
  { id: "subsume_nidus", name: "Larva", description: "Spawn an infested pod that pulls enemies toward it.", energyCost: 50, source: "nidus", sourceWarframe: "Nidus", abilitySlot: 2, radius: 8 },
  { id: "subsume_nova", name: "Null Star", description: "Create orbiting particles that strike enemies and reduce incoming damage (5% DR per particle, 6 particles).", energyCost: 25, source: "nova", sourceWarframe: "Nova", abilitySlot: 1, damageReduction: 0.05 },
  { id: "subsume_nyx", name: "Mind Control", description: "Absorb an enemy, converting it into an ally.", energyCost: 25, source: "nyx", sourceWarframe: "Nyx", abilitySlot: 1, duration: 30 },
  { id: "subsume_oberon", name: "Smite", description: "Focus a bolt of energy on a target, dealing damage and radiating projectiles.", energyCost: 25, source: "oberon", sourceWarframe: "Oberon", abilitySlot: 1, damage: 500, range: 50 },
  { id: "subsume_octavia", name: "Resonator", description: "Deploy a rolling ball that charms enemies and lures them to follow.", energyCost: 50, source: "octavia", sourceWarframe: "Octavia", abilitySlot: 3, duration: 20, range: 6 },
  { id: "subsume_protea", name: "Dispensary", description: "Deploy a device that generates health, energy, and ammo pickups.", energyCost: 75, source: "protea", sourceWarframe: "Protea", abilitySlot: 3, duration: 25 },
  { id: "subsume_qorvex", name: "Containment Wall", description: "Erect a barrier that damages and slows enemies passing through.", energyCost: 50, source: "qorvex", sourceWarframe: "Qorvex", abilitySlot: 2, damage: 500, duration: 10 },
  { id: "subsume_revenant", name: "Reave", description: "Dash through enemies as a wave of energy, stealing shields and health.", energyCost: 50, source: "revenant", sourceWarframe: "Revenant", abilitySlot: 3, range: 15 },
  { id: "subsume_rhino", name: "Roar", description: "Buff damage for yourself and nearby allies by +50%.", energyCost: 50, source: "rhino", sourceWarframe: "Rhino", abilitySlot: 3, damageBuff: 0.5, duration: 30, radius: 25 },
  { id: "subsume_saryn", name: "Molt", description: "Shed your skin, leaving a decoy that draws fire and explodes.", energyCost: 50, source: "saryn", sourceWarframe: "Saryn", abilitySlot: 2, duration: 10 },
  { id: "subsume_sevagoth", name: "Gloom", description: "Summon a channeled radial aura that slows enemies and grants life steal to you and allies within range.", energyCost: 50, source: "sevagoth", sourceWarframe: "Sevagoth", abilitySlot: 3, radius: 4, range: 16, miscStats: { slowPercent: 35, slowCap: 95, lifeStealPercent: 5, minRadius: 4, maxRadius: 16, channeled: true } },
  { id: "subsume_styanax", name: "Rally Point", description: "Buff nearby allies with energy regeneration and status immunity.", energyCost: 75, source: "styanax", sourceWarframe: "Styanax", abilitySlot: 3, duration: 12, radius: 20 },
  { id: "subsume_titania", name: "Tribute", description: "Extract buffs from enemies: Thorns, Dust, Full Moon, or Entangle.", energyCost: 50, source: "titania", sourceWarframe: "Titania", abilitySlot: 2, duration: 12 },
  { id: "subsume_trinity", name: "Well of Life", description: "Trap an enemy in stasis, converting it into a healing source.", energyCost: 25, source: "trinity", sourceWarframe: "Trinity", abilitySlot: 1, duration: 12 },
  { id: "subsume_valkyr", name: "Warcry", description: "Buff attack speed and armor for yourself and allies; slow nearby enemies.", energyCost: 50, source: "valkyr", sourceWarframe: "Valkyr", abilitySlot: 2, duration: 15, radius: 25 },
  { id: "subsume_vauban", name: "Tesla Nervos", description: "Deploy rolling drones that electrocute nearby enemies.", energyCost: 25, source: "vauban", sourceWarframe: "Vauban", abilitySlot: 1, damage: 150 },
  { id: "subsume_volt", name: "Shock", description: "Launch an electric bolt that chains between enemies.", energyCost: 25, source: "volt", sourceWarframe: "Volt", abilitySlot: 1, damage: 200, range: 15 },
  { id: "subsume_voruna", name: "Shroud of Dynar", description: "Become invisible and gain energy on melee kills.", energyCost: 50, source: "voruna", sourceWarframe: "Voruna", abilitySlot: 2, duration: 18 },
  { id: "subsume_wisp", name: "Breach Surge", description: "Open a dimensional breach that blinds and creates surge sparks on hit enemies.", energyCost: 50, source: "wisp", sourceWarframe: "Wisp", abilitySlot: 3, range: 12, duration: 16 },
  { id: "subsume_wukong", name: "Defy", description: "Enter a defensive stance absorbing damage, then release it in a burst.", energyCost: 50, source: "wukong", sourceWarframe: "Wukong", abilitySlot: 2, duration: 2 },
  { id: "subsume_xaku", name: "Xata's Whisper", description: "Imbue weapons with +26% Void damage.", energyCost: 25, source: "xaku", sourceWarframe: "Xaku", abilitySlot: 1, damageBuff: 0.26, duration: 35 },
  { id: "subsume_yareli", name: "Aquablade", description: "Summon a spinning water blade that orbits and slashes nearby enemies.", energyCost: 50, source: "yareli", sourceWarframe: "Yareli", abilitySlot: 2, damage: 500, duration: 20 },
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
