/**
 * Per-mod verified behaviors — category: archgun (37 mods).
 * Generated: python scripts/generate_mod_behavior_batch.py archgun
 * Each mod has its own entry; edit lines after individual wiki review.
 */
import type { VerifiedModBehavior, VerifiedItemStatLine } from "@/lib/item-behavior-types";

function line(statKey: string, target: VerifiedItemStatLine['target'], mode: VerifiedItemStatLine['mode'], source: string): VerifiedItemStatLine {
  return { statKey, target, mode, source };
}

function mod(modId: string, stats: VerifiedItemStatLine[], descriptionOnly?: string): VerifiedModBehavior {
  return descriptionOnly ? { modId, stats, descriptionOnly } : { modId, stats };
}

export const MOD_BEHAVIORS_ARCHGUN: Record<string, VerifiedModBehavior> = {
  ammo_chain: mod("ammo_chain", [
    line("ammoMaximum", "mod_panel", "multiplicative_percent", "Ammo Chain: ammoMaximum \u2014 +100% Ammo Maximum"),
  ]),
  archgun_ace: mod("archgun_ace", [
    line("duration", "mod_panel", "multiplicative_percent", "Archgun Ace: duration \u2014 On Headshot Kill: +50% Fire/Charge Rate, +100% Reload Speed for 9s"),
    line("fireRate", "weapon_dps", "multiplicative_percent", "Archgun Ace: fireRate \u2014 On Headshot Kill: +50% Fire/Charge Rate, +100% Reload Speed for 9s"),
    line("reloadSpeed", "weapon_dps", "multiplicative_percent", "Archgun Ace: reloadSpeed \u2014 On Headshot Kill: +50% Fire/Charge Rate, +100% Reload Speed for 9s"),
  ]),
  archgun_riven_mod: mod("archgun_riven_mod", [], "wiki: Archgun Riven Mod \u2014 You will need to prove yourself before I reveal the beauty within this work."),
  automatic_trigger: mod("automatic_trigger", [
    line("fireRate", "weapon_dps", "multiplicative_percent", "Automatic Trigger: fireRate \u2014 +60% Fire Rate"),
  ]),
  ballista_measure: mod("ballista_measure", [
    line("range", "mod_panel", "multiplicative_percent", "Ballista Measure: range \u2014 +20% Range (arsenal display only)"),
  ]),
  charged_bullets: mod("charged_bullets", [
    line("electricity", "weapon_dps", "elemental_from_base_damage", "Charged Bullets: electricity \u2014 +60% <DT_ELECTRICITY_COLOR>Electricity, +60% Status Chance"),
    line("statusChance", "weapon_dps", "multiplicative_percent", "Charged Bullets: statusChance \u2014 +60% <DT_ELECTRICITY_COLOR>Electricity, +60% Status Chance"),
  ]),
  combustion_rounds: mod("combustion_rounds", [
    line("heat", "weapon_dps", "elemental_from_base_damage", "Combustion Rounds: heat \u2014 +120% <DT_FIRE_COLOR>Heat"),
  ]),
  comet_blast: mod("comet_blast", [
    line("impact", "weapon_dps", "multiplicative_percent", "Comet Blast: impact \u2014 +90% <DT_IMPACT_COLOR>Impact"),
  ]),
  containment_breach: mod("containment_breach", [
    line("multishot", "weapon_dps", "multiplicative_percent", "Containment Breach: multishot \u2014 +60% <DT_RADIATION_COLOR>Radiation, +30% Multishot"),
    line("radiation", "weapon_dps", "elemental_from_base_damage", "Containment Breach: radiation \u2014 +60% <DT_RADIATION_COLOR>Radiation, +30% Multishot"),
  ]),
  contamination_casing: mod("contamination_casing", [
    line("statusChance", "weapon_dps", "multiplicative_percent", "Contamination Casing: statusChance \u2014 +60% <DT_POISON_COLOR>Toxin, +60% Status Chance"),
    line("toxin", "weapon_dps", "elemental_from_base_damage", "Contamination Casing: toxin \u2014 +60% <DT_POISON_COLOR>Toxin, +60% Status Chance"),
  ]),
  critical_focus: mod("critical_focus", [
    line("criticalChance", "weapon_dps", "multiplicative_percent", "Critical Focus: criticalChance \u2014 +60% Critical Chance and Damage when Aiming"),
    line("criticalMultiplier", "weapon_dps", "multiplicative_percent", "Critical Focus: criticalMultiplier \u2014 +60% Critical Chance and Damage when Aiming"),
  ]),
  deadly_efficiency: mod("deadly_efficiency", [
    line("damage", "weapon_dps", "multiplicative_percent", "Deadly Efficiency: damage \u2014 On Reload From Empty:\\\\n+120% Damage for 9s"),
    line("duration", "mod_panel", "multiplicative_percent", "Deadly Efficiency: duration \u2014 On Reload From Empty:\\\\n+120% Damage for 9s"),
  ]),
  dual_rounds: mod("dual_rounds", [
    line("multishot", "weapon_dps", "multiplicative_percent", "Dual Rounds: multishot \u2014 +60% Multishot"),
  ]),
  electrified_barrel: mod("electrified_barrel", [
    line("electricity", "weapon_dps", "elemental_from_base_damage", "Electrified Barrel: electricity \u2014 +120% <DT_ELECTRICITY_COLOR>Electricity"),
  ]),
  hollowed_bullets: mod("hollowed_bullets", [
    line("criticalMultiplier", "weapon_dps", "multiplicative_percent", "Hollowed Bullets: criticalMultiplier \u2014 +80% Critical Damage"),
  ]),
  hypothermic_shell: mod("hypothermic_shell", [
    line("cold", "weapon_dps", "elemental_from_base_damage", "Hypothermic Shell: cold \u2014 +60% <DT_FREEZE_COLOR>Cold, +60% Status Chance"),
    line("statusChance", "weapon_dps", "multiplicative_percent", "Hypothermic Shell: statusChance \u2014 +60% <DT_FREEZE_COLOR>Cold, +60% Status Chance"),
  ]),
  magazine_extension: mod("magazine_extension", [
    line("magazine", "weapon_dps", "multiplicative_percent", "Magazine Extension: magazine \u2014 +60% Magazine Capacity"),
  ]),
  magma_chamber: mod("magma_chamber", [
    line("heat", "weapon_dps", "elemental_from_base_damage", "Magma Chamber: heat \u2014 +60% <DT_FIRE_COLOR>Heat, +60% Status Chance"),
    line("statusChance", "weapon_dps", "multiplicative_percent", "Magma Chamber: statusChance \u2014 +60% <DT_FIRE_COLOR>Heat, +60% Status Chance"),
  ]),
  magnetized_cycle: mod("magnetized_cycle", [
    line("fireRate", "weapon_dps", "multiplicative_percent", "Magnetized Cycle: fireRate \u2014 +60% <DT_MAGNETIC_COLOR>Magnetic, +30% Fire Rate"),
    line("magnetic", "weapon_dps", "elemental_from_base_damage", "Magnetized Cycle: magnetic \u2014 +60% <DT_MAGNETIC_COLOR>Magnetic, +30% Fire Rate"),
  ]),
  marked_target: mod("marked_target", [
    line("statusChance", "weapon_dps", "multiplicative_percent", "Marked Target: statusChance \u2014 +120% Status Chance when Aiming"),
  ]),
  modified_munitions: mod("modified_munitions", [
    line("statusChance", "weapon_dps", "multiplicative_percent", "Modified Munitions: statusChance \u2014 +60% Status Chance"),
  ]),
  parallax_scope: mod("parallax_scope", [
    line("criticalChance", "weapon_dps", "multiplicative_percent", "Parallax Scope: criticalChance \u2014 +100% Critical Chance"),
  ]),
  polar_magazine: mod("polar_magazine", [
    line("cold", "weapon_dps", "elemental_from_base_damage", "Polar Magazine: cold \u2014 +120% <DT_FREEZE_COLOR>Cold"),
  ]),
  primed_ammo_chain: mod("primed_ammo_chain", [
    line("ammoMaximum", "mod_panel", "multiplicative_percent", "Primed Ammo Chain: ammoMaximum \u2014 +165% Ammo Maximum"),
  ]),
  primed_combustion_rounds: mod("primed_combustion_rounds", [
    line("heat", "weapon_dps", "elemental_from_base_damage", "Primed Combustion Rounds: heat \u2014 +187% <DT_FIRE_COLOR>Heat"),
  ]),
  primed_deadly_efficiency: mod("primed_deadly_efficiency", [
    line("damage", "weapon_dps", "multiplicative_percent", "Primed Deadly Efficiency: damage \u2014 On Reload From Empty:\\\\n+220% Damage for 16.5s"),
    line("duration", "mod_panel", "multiplicative_percent", "Primed Deadly Efficiency: duration \u2014 On Reload From Empty:\\\\n+220% Damage for 16.5s"),
  ]),
  primed_dual_rounds: mod("primed_dual_rounds", [
    line("multishot", "weapon_dps", "multiplicative_percent", "Primed Dual Rounds: multishot \u2014 +110% Multishot"),
  ]),
  primed_rubedo_lined_barrel: mod("primed_rubedo_lined_barrel", [
    line("damage", "weapon_dps", "multiplicative_percent", "Primed Rubedo-Lined Barrel: damage \u2014 +187% Damage"),
  ]),
  primed_venomous_clip: mod("primed_venomous_clip", [
    line("toxin", "weapon_dps", "elemental_from_base_damage", "Primed Venomous Clip: toxin \u2014 +187% <DT_POISON_COLOR>Toxin"),
  ]),
  quasar_drill: mod("quasar_drill", [
    line("puncture", "weapon_dps", "multiplicative_percent", "Quasar Drill: puncture \u2014 +90% <DT_PUNCTURE_COLOR>Puncture"),
  ]),
  quick_reload: mod("quick_reload", [
    line("reloadSpeed", "weapon_dps", "multiplicative_percent", "Quick Reload: reloadSpeed \u2014 +100% Reload Speed"),
  ]),
  resolute_focus: mod("resolute_focus", [
    line("accuracy", "mod_panel", "multiplicative_percent", "Resolute Focus: accuracy \u2014 +100% Chance to Resist Staggers/Knockdowns when Aiming, +50% Accuracy when Aimin\u2026 (arsenal display only)"),
  ]),
  rubedo_lined_barrel: mod("rubedo_lined_barrel", [
    line("damage", "weapon_dps", "multiplicative_percent", "Rubedo-Lined Barrel: damage \u2014 +100% Damage"),
  ]),
  sabot_rounds: mod("sabot_rounds", [
    line("damage", "weapon_dps", "multiplicative_percent", "Sabot Rounds: damage \u2014 +60% Damage, +3 Punch Through"),
    line("punchThrough", "mod_panel", "multiplicative_percent", "Sabot Rounds: punchThrough \u2014 +60% Damage, +3 Punch Through (arsenal display only)"),
  ]),
  shell_rush: mod("shell_rush", [
    line("fireRate", "weapon_dps", "multiplicative_percent", "Shell Rush: fireRate \u2014 +50% Charge Rate"),
  ]),
  venomous_clip: mod("venomous_clip", [
    line("toxin", "weapon_dps", "elemental_from_base_damage", "Venomous Clip: toxin \u2014 +120% <DT_POISON_COLOR>Toxin"),
  ]),
  zodiac_shred: mod("zodiac_shred", [
    line("slash", "weapon_dps", "multiplicative_percent", "Zodiac Shred: slash \u2014 +90% <DT_SLASH_COLOR>Slash"),
  ]),
};
