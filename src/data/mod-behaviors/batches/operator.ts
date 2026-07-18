/**
 * Per-mod verified behaviors — category: operator (54 mods).
 * Generated: python scripts/generate_mod_behavior_batch.py operator
 * Each mod has its own entry; edit lines after individual wiki review.
 */
import type { VerifiedModBehavior, VerifiedItemStatLine } from "@/lib/codex/item-behavior-types";

function line(statKey: string, target: VerifiedItemStatLine['target'], mode: VerifiedItemStatLine['mode'], source: string): VerifiedItemStatLine {
  return { statKey, target, mode, source };
}

function mod(modId: string, stats: VerifiedItemStatLine[], descriptionOnly?: string): VerifiedModBehavior {
  return descriptionOnly ? { modId, stats, descriptionOnly } : { modId, stats };
}

export const MOD_BEHAVIORS_OPERATOR: Record<string, VerifiedModBehavior> = {
  amp_spike: mod("amp_spike", [], "wiki: Amp Spike \u2014 Transfer to Operator with 8x Combo Multiplier to increase AMP damage by 100% for 40s."),
  basilisk_gaze: mod("basilisk_gaze", [], "wiki: Basilisk Gaze \u2014 Increases Void Blast radius by 60%."),
  basilisk_scales: mod("basilisk_scales", [], "wiki: Basilisk Scales \u2014 Increases Operator Armor by 200%."),
  blazing_dash: mod("blazing_dash", [], "wiki: Blazing Dash \u2014 Void Sling leaves a trail of fire that deals 1000 Damage/s over 14s. Void Sling will now stun enemies instead of displacing them."),
  chained_sling: mod("chained_sling", [], "wiki: Chained Sling \u2014 50% Energy Efficiency on Consecutive Void Slings."),
  contamination_wave: mod("contamination_wave", [], "wiki: Contamination Wave \u2014 Second Ability emits a Void wave lasting 2s that drenches enemies with Void Contamination making them 50% more vulnerable to Operator Damage for 20s."),
  crippling_dash: mod("crippling_dash", [], "wiki: Crippling Dash \u2014 Using Void Sling through an enemy will reduce their Damage by 50%."),
  disarming_blast: mod("disarming_blast", [], "wiki: Disarming Blast \u2014 Enemies hit by Void Blast have a 50% chance to be disarmed."),
  disorienting_blast: mod("disorienting_blast", [], "wiki: Disorienting Blast \u2014 Void Blast has a 50% chance of confusing enemies for 16s, causing them to be unable to distinguish friend from foe."),
  enduring_tides: mod("enduring_tides", [], "wiki: Enduring Tides \u2014 Increases Operator Health and Armor by 200%."),
  eternal_gaze: mod("eternal_gaze", [], "wiki: Eternal Gaze \u2014 Increase Energy Regeneration Rate for Amps and Void Beam by 60%."),
  executing_dash: mod("executing_dash", [], "wiki: Executing Dash \u2014 Void Sling no longer displaces enemies, instead it will open them up to Finishers and increase Finisher Damage taken by 35%."),
  far_sling: mod("far_sling", [], "wiki: Far Sling \u2014 Increases maximum Void Sling distance by 30%."),
  flame_blast: mod("flame_blast", [], "wiki: Flame Blast \u2014 Void Blast releases a ball of fire that deals 250% of the Void Blast damage and explodes after 0.6000000238418579s."),
  guardian_blast: mod("guardian_blast", [], "wiki: Guardian Blast \u2014 Void Blast consumes 25 Energy for each ally hit within 8m and grants them 160 Shields."),
  guardian_shell: mod("guardian_shell", [], "wiki: Guardian Shell \u2014 Use your first Ability to manifest a barrier on the Operator and allies in Affinity Range. It is invulnerable for 4s when first created and damage inflicted while it's invulnerable will be added to its base health of 500."),
  inner_gaze: mod("inner_gaze", [], "wiki: Inner Gaze \u2014 Increase Energy for Amps and Void Beam by 40%."),
  last_gasp: mod("last_gasp", [], "wiki: Last Gasp \u2014 Revive your Warframe by transferring to Operator and killing 3 enemies before 15s elapse and the Revive Meter begins to drain."),
  lethal_levitation: mod("lethal_levitation", [], "wiki: Lethal Levitation \u2014 Additional 50% Weapon Damage per Lifted enemy attacked by Operator. Lasts for 60s, stacks up to 4x."),
  magnetic_blast: mod("magnetic_blast", [], "wiki: Magnetic Blast \u2014 Enemies hit by Void Blast are affected by Magnetize for 10s."),
  magnetic_boost: mod("magnetic_boost", [], "wiki: Magnetic Boost \u2014 Void Sling out of a Magnetic Flare to refresh its duration and increase its radius by 100%."),
  meteoric_dash: mod("meteoric_dash", [], "wiki: Meteoric Dash \u2014 Void Sling deals 400 Extra Damage to enemies."),
  mind_sprint: mod("mind_sprint", [], "wiki: Mind Sprint \u2014 Increases Void Sling Speed by 120%."),
  mind_step: mod("mind_step", [], "wiki: Mind Step \u2014 Increases Operator Movement Speed by 30%."),
  no_quarter: mod("no_quarter", [], "wiki: No Quarter \u2014 Killing a disarmed enemy increases Operator energy regen rate by 10% for 10s. 4 Max Stacks."),
  opening_slam: mod("opening_slam", [], "wiki: Opening Slam \u2014 Performing a Slam as Operator switches to Warframe and grants double Combo gain for 20s."),
  phoenix_talons: mod("phoenix_talons", [], "wiki: Phoenix Talons \u2014 Physical Damage and Operator Damage increased by 30%."),
  poise: mod("poise", [], "wiki: Poise \u2014 Gain immunity to slow, stagger, and knockdown effects for 40s after transferring between Operator or Warframe."),
  power_transfer: mod("power_transfer", [], "wiki: Power Transfer \u2014 100% Amp Critical Damage for 20s on switching to Operator. 50% Casting Speed on switching to Warframe."),
  protective_sling: mod("protective_sling", [], "wiki: Protective Sling \u2014 Allies touched by Void Sling are granted immunity from damage for 5s and healed 60% over 5s for 10 energy cost."),
  reinforced_return: mod("reinforced_return", [], "wiki: Reinforced Return \u2014 Warframe is invulnerable for 4s after Operator is downed. Tap <USE> as Operator falls to bring the Warframe to the Operator\\u2019s location."),
  rejuvenating_tides: mod("rejuvenating_tides", [], "wiki: Rejuvenating Tides \u2014 Operator Health Regeneration is increased by 6/s, and is doubled while controlling the Warframe."),
  rising_blast: mod("rising_blast", [], "wiki: Rising Blast \u2014 Increases Void Blast Damage by 200% and it can now be charged to deal additional damage."),
  sling_stun: mod("sling_stun", [], "wiki: Sling Stun \u2014 Second Ability increases the width of the next Void Sling by 200% and enemies hit are vulnerable to Finishers, taking 30% more finisher damage."),
  sonic_dash: mod("sonic_dash", [], "wiki: Sonic Dash \u2014 Void Sling no longer displaces enemies, instead it emits a shockwave 14m wide and travels 8m stunning any enemy it hits."),
  static_purge: mod("static_purge", [], "wiki: Static Purge \u2014 100% chance to clear Transference Static on kill while Reinforced Return is active."),
  stone_skin: mod("stone_skin", [], "wiki: Stone Skin \u2014 Increases Armor for Warframe and Operator by 200."),
  sundering_dash: mod("sundering_dash", [], "wiki: Sundering Dash \u2014 Using Void Sling through an enemy will reduce their Armor by 75%."),
  unairu_wisp: mod("unairu_wisp", [], "wiki: Unairu Wisp \u2014 100% chance to summon an Unairu Wisp per enemy hit by Caustic Strike. The Wisp will seek out the nearest ally within Affinity Range, increasing Operator damage by 100% for 20s."),
  vengeance: mod("vengeance", [], "wiki: Vengeance \u2014 During Last Gasp, Operator Damage is increased by 100% plus an additional 25% per second."),
  void_aegis: mod("void_aegis", [], "wiki: Void Aegis \u2014 Void Mode creates a shield that grows up to 12m over 5s. This ability costs an additional 2 Energy/s."),
  void_chrysalis: mod("void_chrysalis", [], "wiki: Void Chrysalis \u2014 Void Mode reduces damage taken by invisible allies within 25m by 80%. This ability costs an additional 4 Energy/s."),
  void_flow: mod("void_flow", [], "wiki: Void Flow \u2014 Increases Operator Energy by 90%."),
  void_fuel: mod("void_fuel", [], "wiki: Void Fuel \u2014 40% Weapon Efficiency for Operator and Warframe while Void Strike is active."),
  void_hunter: mod("void_hunter", [], "wiki: Void Hunter \u2014 Void Mode reveals enemies within 25m through walls. This range gradually decreases over 5s when the Operator leaves Void Mode. This ability costs an additional 1 Energy/s."),
  void_radiance: mod("void_radiance", [], "wiki: Void Radiance \u2014 Consumes 50 Energy on leaving Void Mode to blind enemies within 10m for 5s."),
  void_regen: mod("void_regen", [], "wiki: Void Regen \u2014 Void Mode starts healing at +10 Health per second, increasing by 10 per second up to a maximum of 50."),
  void_shadow: mod("void_shadow", [], "wiki: Void Shadow \u2014 Void Mode now renders allies within 40m invisible. This ability costs an additional 4 Energy/s per ally cloaked."),
  void_singularity: mod("void_singularity", [], "wiki: Void Singularity \u2014 Void Mode pulls enemies within 20m towards the Operator, and costs an additional 2 Energy/s."),
  void_siphon: mod("void_siphon", [], "wiki: Void Siphon \u2014 Increases Operator Energy Regeneration by 90%."),
  void_snare: mod("void_snare", [], "wiki: Void Snare \u2014 Second Ability Launches a projectile that spins up a vortex trap on impact, or tap <ACTIVATE_ABILITY_1> again to detonate in-flight. Trap lasts 8s. Void Sling through trapped enemies to grant allies within Affinity Range 100 Health."),
  void_stalker: mod("void_stalker", [], "wiki: Void Stalker \u2014 Void Mode increases Critical Chance of melee attacks by up to 50% over 5s. This chance gradually decreases over 20s when the Operator leaves Void Mode. This ability costs an additional 4 Energy/s."),
  void_static: mod("void_static", [], "wiki: Void Static \u2014 Void Mode emits a pulse that deals 500 Damage/s over 15m, and costs an additional 1 Energy/s."),
  voltaic_blast: mod("voltaic_blast", [], "wiki: Voltaic Blast \u2014 Void Blast creates a surge of electricity, zapping enemies within 10m for 200% Damage."),
};
