// Stance mod to melee weapon type mapping
// Based on Warframe wiki stance categories

export const STANCE_WEAPON_TYPE: Record<string, string> = {
  // Sword
  "stance_iron_phoenix": "sword",
  "stance_crimson_dervish": "sword",
  "stance_vengeful_revenant": "sword",
  "stance_swooping_falcon": "sword",
  // Dual Swords
  "stance_crossing_snakes": "dual_swords",
  "stance_swirling_tiger": "dual_swords",
  "stance_carving_mantis": "dual_swords",
  // Heavy Blade
  "stance_cleaving_whirlwind": "heavy_blade",
  "stance_temporal_royale": "heavy_blade",
  "stance_rumbling_vault": "heavy_blade",
  // Polearm
  "stance_shimmering_blight": "polearm",
  "stance_bleeding_willow": "polearm",
  "stance_twirling_spire": "polearm",
  // Whip
  "stance_burning_wasp": "whip",
  "stance_coiling_viper": "whip",
  // Fist
  "stance_frictional_strike": "fist",
  "stance_seismic_palm": "fist",
  // Claw
  "stance_vermillion_storm": "claw",
  "stance_buzzing_sting": "claw",
  // Nikana
  "stance_decisive_judgement": "nikana",
  "stance_transcending_recut": "nikana",
  // Rapier
  "stance_vulpine_mask": "rapier",
  "stance_fencing_stance": "rapier",
  // Gunblade
  "stance_high_noon": "gunblade",
  "stance_bullet_dance": "gunblade",
  // Glaive
  "stance_aurora_rush": "glaive",
  "stance_gleaming_talent": "glaive",
  // Dagger
  "stance_pointed_wind": "dagger",
  "stance_stinging_thorn": "dagger",
  "stance_homing_fang": "dagger",
  // Machete
  "stance_sundering_weave": "machete",
  // Scythe
  "stance_reaping_spiral": "scythe",
  "stance_stalking_fan": "scythe",
  // Staff
  "stance_clashing_forest": "staff",
  "stance_flailing_branch": "staff",
  // Tonfa
  "stance_gnashing_payara": "tonfa",
  "stance_sinking_talon": "tonfa",
  // Sparring
  "stance_grim_fury_sparring": "sparring",
  // Warfan
  "stance_war_fan": "warfan",
  // Two-Handed Nikana
  "stance_wise_razor": "two_handed_nikana",
  // Dual Daggers
  "stance_spinning_needle": "dual_daggers",
  // Blade & Whip
  "stance_defiled_snapdragon": "blade_whip",
};

// Melee weapon type labels for display
export const MELEE_TYPE_LABELS: Record<string, string> = {
  sword: "Sword",
  dual_swords: "Dual Swords",
  heavy_blade: "Heavy Blade",
  polearm: "Polearm",
  whip: "Whip",
  fist: "Fist",
  claw: "Claw",
  nikana: "Nikana",
  rapier: "Rapier",
  gunblade: "Gunblade",
  glaive: "Glaive",
  dagger: "Dagger",
  machete: "Machete",
  scythe: "Scythe",
  staff: "Staff",
  tonfa: "Tonfa",
  sparring: "Sparring",
  warfan: "Warfan",
  two_handed_nikana: "Two-Handed Nikana",
  dual_daggers: "Dual Daggers",
  blade_whip: "Blade & Whip",
  hammer: "Hammer",
  nunchaku: "Nunchaku",
};

// Get stance weapon type from stance mod id
export function getStanceType(stanceId: string): string {
  return STANCE_WEAPON_TYPE[stanceId] || "unknown";
}

// Get all stance types present in the data
export function getAvailableStanceTypes(): string[] {
  return [...new Set(Object.values(STANCE_WEAPON_TYPE))].sort();
}
