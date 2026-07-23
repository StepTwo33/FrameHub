/**
 * Phase 3 — Galvanized / Condition Overload / Blood Rush / Weeping Wounds
 * paper vs stacked sim params (wiki mod pages).
 */
import { describe, expect, it } from "vitest";
import { allMods } from "@/data/mods";
import { allWeapons } from "@/data/weapons";
import { calculateWeaponBuild } from "@/lib/calc/calculator";
import { DEFAULT_SIM_PARAMS, type SimulationParams } from "@/lib/types";

const modsMap = () => new Map(allMods.map((m) => [m.id, m]));

function requireMod(id: string) {
  const mod = allMods.find((m) => m.id === id);
  expect(mod, `missing mod ${id}`).toBeDefined();
  return mod!;
}

function requireWeapon(id: string) {
  const weapon = allWeapons.find((w) => w.id === id);
  expect(weapon, `missing weapon ${id}`).toBeDefined();
  return weapon!;
}

function build(
  weaponId: string,
  modId: string,
  sim: Partial<SimulationParams>,
) {
  const weapon = requireWeapon(weaponId);
  const mod = requireMod(modId);
  return calculateWeaponBuild(
    weapon,
    [{ modId, rank: mod.maxRank, slotIndex: 0 }],
    modsMap(),
    undefined,
    { ...DEFAULT_SIM_PARAMS, ...sim },
  );
}

describe("Galvanized Chamber (wiki: +80% MS, +30% MS/kill stack, cap 5)", () => {
  it("paper (0 stacks): only base +80% multishot", () => {
    const weapon = requireWeapon("braton");
    const stats = build("braton", "galvanized_chamber", { killStacks: 0 });
    expect(stats.multishot).toBeCloseTo(weapon.multishot * 1.8, 5);
  });

  it("fullRamp (5 stacks): +80% + 5×30% = +230% multishot", () => {
    const weapon = requireWeapon("braton");
    const stats = build("braton", "galvanized_chamber", { killStacks: 5 });
    expect(stats.multishot).toBeCloseTo(weapon.multishot * 3.3, 5);
  });

  it("caps kill stacks at 5 even if sim asks for more", () => {
    const at5 = build("braton", "galvanized_chamber", { killStacks: 5 });
    const at9 = build("braton", "galvanized_chamber", { killStacks: 9 });
    expect(at9.multishot).toBeCloseTo(at5.multishot, 8);
  });
});

describe("Galvanized Aptitude (wiki: +80% SC; +40% dmg per status type per kill stack, cap 2)", () => {
  it("paper: status chance only, no conditional damage", () => {
    const weapon = requireWeapon("braton");
    const stats = build("braton", "galvanized_aptitude", {
      killStacks: 0,
      statusTypesOnTarget: 0,
    });
    expect(stats.statusChance).toBeCloseTo(weapon.statusChance * 1.8, 5);
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage, 5);
  });

  it("2 kill stacks × 3 status types: +240% conditional damage", () => {
    const weapon = requireWeapon("braton");
    const stats = build("braton", "galvanized_aptitude", {
      killStacks: 2,
      statusTypesOnTarget: 3,
    });
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * (1 + 0.4 * 2 * 3), 4);
  });
});

describe("Condition Overload (wiki: +80% melee damage per status type)", () => {
  it("paper (0 statuses): no bonus", () => {
    const weapon = requireWeapon("skana");
    const stats = build("skana", "condition_overload", { statusTypesOnTarget: 0 });
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage, 5);
  });

  it("3 status types: ×(1 + 0.8×3)", () => {
    const weapon = requireWeapon("skana");
    const mod = requireMod("condition_overload");
    const perStatus = (mod.stats.damagePerStatus! * (mod.maxRank + 1)) / 100;
    const stats = build("skana", "condition_overload", { statusTypesOnTarget: 3 });
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * (1 + perStatus * 3), 4);
  });
});

describe("Weeping Wounds (wiki: +40% status per combo multiplier tier above 1×)", () => {
  it("paper (1× combo): no WW bonus", () => {
    const weapon = requireWeapon("skana");
    const stats = build("skana", "weeping_wounds_r5", { comboCount: 0 });
    expect(stats.comboMultiplier).toBe(1);
    expect(stats.statusChance).toBeCloseTo(weapon.statusChance, 5);
  });

  it("4× combo (60 hits): +120% status → ×2.2", () => {
    const weapon = requireWeapon("skana");
    const stats = build("skana", "weeping_wounds_r5", { comboCount: 60 });
    expect(stats.comboMultiplier).toBe(4);
    expect(stats.statusChance).toBeCloseTo(weapon.statusChance * 2.2, 5);
  });
});

describe("Blood Rush (wiki: +40% crit per combo multiplier tier above 1×)", () => {
  it("paper: no BR bonus", () => {
    const weapon = requireWeapon("skana");
    const stats = build("skana", "blood_rush", { comboCount: 0 });
    expect(stats.criticalChance).toBeCloseTo(weapon.criticalChance, 5);
  });

  it("12× combo: +440% crit → ×5.4", () => {
    const weapon = requireWeapon("skana");
    const stats = build("skana", "blood_rush", { comboCount: 220 });
    expect(stats.comboMultiplier).toBe(12);
    expect(stats.criticalChance).toBeCloseTo(weapon.criticalChance * 5.4, 5);
  });
});

describe("Galvanized Steel (wiki: +110% CC; +30% CD/kill stack, cap 4)", () => {
  it("paper (0 stacks): +110% CC only — no CD", () => {
    const weapon = requireWeapon("skana");
    const bare = calculateWeaponBuild(weapon, [], modsMap());
    const stats = build("skana", "galvanized_steel", { killStacks: 0 });
    expect(stats.criticalChance).toBeCloseTo(weapon.criticalChance * 2.1, 5);
    expect(stats.criticalMultiplier).toBeCloseTo(bare.criticalMultiplier, 5);
  });

  it("4 kill stacks: +120% Critical Damage", () => {
    const at0 = build("skana", "galvanized_steel", { killStacks: 0 });
    const at4 = build("skana", "galvanized_steel", { killStacks: 4 });
    expect(at4.criticalMultiplier).toBeCloseTo(at0.criticalMultiplier * 2.2, 4);
  });

  it("caps kill stacks at 4", () => {
    const at4 = build("skana", "galvanized_steel", { killStacks: 4 });
    const at9 = build("skana", "galvanized_steel", { killStacks: 9 });
    expect(at9.criticalMultiplier).toBeCloseTo(at4.criticalMultiplier, 8);
  });
});

describe("Galvanized Elementalist (wiki: +80% status dmg; +30% SC/kill stack, cap 4)", () => {
  it("paper: +80% status damage, no SC", () => {
    const weapon = requireWeapon("skana");
    const stats = build("skana", "galvanized_elementalist", { killStacks: 0 });
    expect(stats.statusDamageBonus).toBeCloseTo(0.8, 5);
    expect(stats.statusChance).toBeCloseTo(weapon.statusChance, 5);
  });

  it("4 kill stacks: +120% Status Chance", () => {
    const weapon = requireWeapon("skana");
    const stats = build("skana", "galvanized_elementalist", { killStacks: 4 });
    expect(stats.statusChance).toBeCloseTo(weapon.statusChance * 2.2, 5);
  });
});

describe("Melee Elementalist (wiki: +90% status dmg; +60% heavy wind-up speed)", () => {
  it("shortens wind-up and adds status damage", () => {
    const weapon = requireWeapon("skana");
    const empty = calculateWeaponBuild(weapon, [], modsMap());
    const stats = build("skana", "melee_elementalist", {});
    expect(stats.statusDamageBonus).toBeCloseTo(0.9, 5);
    expect(stats.heavyAttackWindUp).toBeCloseTo(empty.heavyAttackWindUp / 1.6, 5);
  });
});

describe("on-kill / trigger conditionals (wiki max rank, Phase M16)", () => {
  it("Secondary Wind: paper reload unchanged; killStacks>0 → +50% reload", () => {
    const weapon = requireWeapon("lex");
    const paper = build("lex", "secondary_wind", { killStacks: 0 });
    expect(paper.reloadTime).toBeCloseTo(weapon.reloadTime, 5);
    const active = build("lex", "secondary_wind", { killStacks: 1 });
    expect(active.reloadTime).toBeCloseTo(weapon.reloadTime / 1.5, 5);
  });

  it("Bladed Rounds / Sharpened Bullets: paper CM unchanged; kill → +120% / +75% CD", () => {
    const braton = requireWeapon("braton");
    const lex = requireWeapon("lex");
    const bratonBare = calculateWeaponBuild(braton, [], modsMap());
    const lexBare = calculateWeaponBuild(lex, [], modsMap());
    expect(build("braton", "bladed_rounds", { killStacks: 0 }).criticalMultiplier).toBeCloseTo(
      bratonBare.criticalMultiplier,
      5,
    );
    expect(build("braton", "bladed_rounds", { killStacks: 1 }).criticalMultiplier).toBeCloseTo(
      bratonBare.criticalMultiplier * 2.2,
      4,
    );
    expect(build("lex", "sharpened_bullets", { killStacks: 0 }).criticalMultiplier).toBeCloseTo(
      lexBare.criticalMultiplier,
      5,
    );
    expect(build("lex", "sharpened_bullets", { killStacks: 1 }).criticalMultiplier).toBeCloseTo(
      lexBare.criticalMultiplier * 1.75,
      4,
    );
  });

  it("Lie In Wait: paper FR unchanged; applyTriggerBuffs → +20% FR", () => {
    const weapon = requireWeapon("braton");
    expect(build("braton", "lie_in_wait", {}).fireRate).toBeCloseTo(weapon.fireRate, 5);
    expect(build("braton", "lie_in_wait", { applyTriggerBuffs: true }).fireRate).toBeCloseTo(
      weapon.fireRate * 1.2,
      5,
    );
  });

  it("Argon Scope / Hydraulic Crosshairs: paper no CC; applyHeadshots → +135% CC", () => {
    const braton = requireWeapon("braton");
    const lex = requireWeapon("lex");
    expect(build("braton", "argon_scope", {}).criticalChance).toBeCloseTo(braton.criticalChance, 5);
    expect(build("braton", "argon_scope", { applyHeadshots: true }).criticalChance).toBeCloseTo(
      braton.criticalChance * 2.35,
      5,
    );
    expect(build("lex", "hydraulic_crosshairs", {}).criticalChance).toBeCloseTo(lex.criticalChance, 5);
    expect(build("lex", "hydraulic_crosshairs", { applyHeadshots: true }).criticalChance).toBeCloseTo(
      lex.criticalChance * 2.35,
      5,
    );
  });

  it("Galvanized Scope / Crosshairs: paper no CC; headshot +0 stacks +120%; +5 stacks +320%", () => {
    const braton = requireWeapon("braton");
    const lex = requireWeapon("lex");
    expect(build("braton", "galvanized_scope", {}).criticalChance).toBeCloseTo(
      braton.criticalChance,
      5,
    );
    expect(
      build("braton", "galvanized_scope", { applyHeadshots: true, killStacks: 0 }).criticalChance,
    ).toBeCloseTo(braton.criticalChance * 2.2, 4);
    expect(
      build("braton", "galvanized_scope", { applyHeadshots: true, killStacks: 5 }).criticalChance,
    ).toBeCloseTo(braton.criticalChance * (1 + 1.2 + 0.4 * 5), 4);
    expect(
      build("lex", "galvanized_crosshairs", { applyHeadshots: true, killStacks: 5 }).criticalChance,
    ).toBeCloseTo(lex.criticalChance * (1 + 1.2 + 0.4 * 5), 4);
  });

  it("Pistol Acuity: +350% weak-point damage always; WP CC only with applyHeadshots", () => {
    const weapon = requireWeapon("lex");
    const paper = build("lex", "pistol_acuity", {});
    expect(paper.headshotDamageBonus).toBeCloseTo(3.5, 4);
    expect(paper.criticalChance).toBeCloseTo(weapon.criticalChance, 5);
    const hs = build("lex", "pistol_acuity", { applyHeadshots: true });
    expect(hs.criticalChance).toBeCloseTo(weapon.criticalChance * 4.5, 4);
  });

  it("Hemorrhage: Impact procs can force Slash (same model as Internal Bleeding)", () => {
    const weapon = requireWeapon("lex");
    const stats = build("lex", "hemorrhage", {});
    const impact = stats.statusProcs.find((p) => p.type === "impact");
    const forced = stats.statusProcs.find((p) => p.description.includes("Slash on Impact proc"));
    expect(impact).toBeDefined();
    expect(forced).toBeDefined();
    const rateMult = stats.fireRate < 2.5 ? 2 : 1;
    expect(forced!.chance).toBeCloseTo(impact!.chance * Math.min(0.35 * rateMult, 1), 5);
  });
});

describe("remaining trigger/on-kill conditionals (wiki max rank, Phase M17)", () => {
  it("Emergent Aftermath / Gorgon Frenzy: paper unchanged; kill → +50% reload / +30% FR", () => {
    const weapon = requireWeapon("braton");
    expect(build("braton", "emergent_aftermath", {}).reloadTime).toBeCloseTo(weapon.reloadTime, 5);
    expect(build("braton", "emergent_aftermath", { killStacks: 1 }).reloadTime).toBeCloseTo(
      weapon.reloadTime / 1.5,
      5,
    );
    expect(build("braton", "gorgon_frenzy", {}).fireRate).toBeCloseTo(weapon.fireRate, 5);
    expect(build("braton", "gorgon_frenzy", { killStacks: 1 }).fireRate).toBeCloseTo(
      weapon.fireRate * 1.3,
      5,
    );
  });

  it("Catalyzer Link / Embedded Catalyzer: paper SC unchanged; trigger → +60% / +90% SC", () => {
    const braton = requireWeapon("braton");
    const lex = requireWeapon("lex");
    expect(build("braton", "catalyzer_link", {}).statusChance).toBeCloseTo(braton.statusChance, 5);
    expect(
      build("braton", "catalyzer_link", { applyTriggerBuffs: true }).statusChance,
    ).toBeCloseTo(braton.statusChance * 1.6, 5);
    expect(build("lex", "embedded_catalyzer", {}).statusChance).toBeCloseTo(lex.statusChance, 5);
    expect(
      build("lex", "embedded_catalyzer", { applyTriggerBuffs: true }).statusChance,
    ).toBeCloseTo(lex.statusChance * 1.9, 5);
  });

  it("Spring-Loaded Chamber / Pressurized Magazine: paper FR unchanged; trigger → +75% / +90% FR", () => {
    const braton = requireWeapon("braton");
    const lex = requireWeapon("lex");
    expect(build("braton", "spring_loaded_chamber", {}).fireRate).toBeCloseTo(braton.fireRate, 5);
    expect(
      build("braton", "spring_loaded_chamber", { applyTriggerBuffs: true }).fireRate,
    ).toBeCloseTo(braton.fireRate * 1.75, 5);
    expect(build("lex", "pressurized_magazine", {}).fireRate).toBeCloseTo(lex.fireRate, 5);
    expect(
      build("lex", "pressurized_magazine", { applyTriggerBuffs: true }).fireRate,
    ).toBeCloseTo(lex.fireRate * 1.9, 5);
  });

  it("Proton Jet: paper CC/SC unchanged; trigger → +120% CC and SC", () => {
    const weapon = requireWeapon("braton");
    const paper = build("braton", "proton_jet", {});
    expect(paper.criticalChance).toBeCloseTo(weapon.criticalChance, 5);
    expect(paper.statusChance).toBeCloseTo(weapon.statusChance, 5);
    const active = build("braton", "proton_jet", { applyTriggerBuffs: true });
    expect(active.criticalChance).toBeCloseTo(weapon.criticalChance * 2.2, 5);
    expect(active.statusChance).toBeCloseTo(weapon.statusChance * 2.2, 5);
  });
});

describe("Sim1 trigger-gated exclusives (wiki max rank)", () => {
  it("Spectral Serration / Soaring Strike / Measured Burst: paper unchanged; trigger applies", () => {
    const weapon = requireWeapon("braton");
    expect(build("braton", "spectral_serration", {}).moddedBaseDamage).toBeCloseTo(
      weapon.damage,
      5,
    );
    expect(
      build("braton", "spectral_serration", { applyTriggerBuffs: true }).moddedBaseDamage,
    ).toBeCloseTo(weapon.damage * 4.3, 5);

    expect(build("braton", "soaring_strike", {}).fireRate).toBeCloseTo(weapon.fireRate, 5);
    expect(
      build("braton", "soaring_strike", { applyTriggerBuffs: true }).fireRate,
    ).toBeCloseTo(weapon.fireRate * 1.5, 5);

    const paperMb = build("braton", "measured_burst", {});
    expect(paperMb.moddedBaseDamage).toBeCloseTo(weapon.damage, 5);
    expect(paperMb.fireRate).toBeCloseTo(weapon.fireRate, 5);
    const activeMb = build("braton", "measured_burst", { applyTriggerBuffs: true });
    expect(activeMb.moddedBaseDamage).toBeCloseTo(weapon.damage * 1.3, 5);
    expect(activeMb.fireRate).toBeCloseTo(weapon.fireRate * 0.4, 5);
  });

  it("Aero Agility / Combat Reload / Motus Setup: paper unchanged; trigger applies", () => {
    const weapon = requireWeapon("braton");
    expect(build("braton", "aero_agility", {}).reloadTime).toBeCloseTo(weapon.reloadTime, 5);
    expect(
      build("braton", "aero_agility", { applyTriggerBuffs: true }).reloadTime,
    ).toBeCloseTo(weapon.reloadTime / 2, 5);

    expect(build("braton", "combat_reload", {}).reloadTime).toBeCloseTo(weapon.reloadTime, 5);
    expect(
      build("braton", "combat_reload", { applyTriggerBuffs: true }).reloadTime,
    ).toBeCloseTo(weapon.reloadTime / 2.2, 5);

    const paper = build("braton", "motus_setup", {});
    expect(paper.criticalChance).toBeCloseTo(weapon.criticalChance, 5);
    expect(paper.statusChance).toBeCloseTo(weapon.statusChance, 5);
    const active = build("braton", "motus_setup", { applyTriggerBuffs: true });
    expect(active.criticalChance).toBeCloseTo(weapon.criticalChance * 2, 5);
    expect(active.statusChance).toBeCloseTo(weapon.statusChance * 2, 5);
  });

  it("Laser Sight / Nano-Applicator / Repeater Clip / Shrapnel Shot: paper unchanged; trigger applies", () => {
    const braton = requireWeapon("braton");
    expect(build("braton", "laser_sight", {}).criticalChance).toBeCloseTo(
      braton.criticalChance,
      5,
    );
    expect(
      build("braton", "laser_sight", { applyTriggerBuffs: true }).criticalChance,
    ).toBeCloseTo(braton.criticalChance * 2.2, 5);

    expect(build("braton", "nano_applicator", {}).statusChance).toBeCloseTo(
      braton.statusChance,
      5,
    );
    expect(
      build("braton", "nano_applicator", { applyTriggerBuffs: true }).statusChance,
    ).toBeCloseTo(braton.statusChance * 1.9, 5);

    expect(build("braton", "repeater_clip", {}).fireRate).toBeCloseTo(braton.fireRate, 5);
    expect(
      build("braton", "repeater_clip", { applyTriggerBuffs: true }).fireRate,
    ).toBeCloseTo(braton.fireRate * 2.05, 5);

    const bareCm = calculateWeaponBuild(braton, [], modsMap()).criticalMultiplier;
    expect(build("braton", "shrapnel_shot", {}).criticalMultiplier).toBeCloseTo(bareCm, 5);
    expect(
      build("braton", "shrapnel_shot", { applyTriggerBuffs: true }).criticalMultiplier,
    ).toBeCloseTo(bareCm * 1.99, 4);
  });

  it("Lasting Purity: paper damage unchanged; syndicate panel; trigger → +60% damage", () => {
    const weapon = requireWeapon("braton");
    expect(build("braton", "lasting_purity", {}).moddedBaseDamage).toBeCloseTo(
      weapon.damage,
      5,
    );
    expect(
      build("braton", "lasting_purity", { applyTriggerBuffs: true }).moddedBaseDamage,
    ).toBeCloseTo(weapon.damage * 1.6, 5);
  });

  it("Hit-window taps: paper unchanged; trigger → Double Tap +400% / Triple +40% / Final +100% / Sudden +30% FR", () => {
    const weapon = requireWeapon("braton");
    expect(build("braton", "double_tap", {}).moddedBaseDamage).toBeCloseTo(weapon.damage, 5);
    expect(
      build("braton", "double_tap", { applyTriggerBuffs: true }).moddedBaseDamage,
    ).toBeCloseTo(weapon.damage * 5, 5);

    expect(build("braton", "triple_tap", {}).moddedBaseDamage).toBeCloseTo(weapon.damage, 5);
    expect(
      build("braton", "triple_tap", { applyTriggerBuffs: true }).moddedBaseDamage,
    ).toBeCloseTo(weapon.damage * 1.4, 5);

    expect(build("braton", "final_tap", {}).moddedBaseDamage).toBeCloseTo(weapon.damage, 5);
    expect(
      build("braton", "final_tap", { applyTriggerBuffs: true }).moddedBaseDamage,
    ).toBeCloseTo(weapon.damage * 2, 5);

    expect(build("braton", "sudden_justice", {}).fireRate).toBeCloseTo(weapon.fireRate, 5);
    expect(
      build("braton", "sudden_justice", { applyTriggerBuffs: true }).fireRate,
    ).toBeCloseTo(weapon.fireRate * 1.3, 5);
  });
});

describe("Sim2 weak-point / situational exclusives (wiki max rank)", () => {
  it("Biotic Rounds: paper unchanged; kill → +150% Viral, Magnetic, SC", () => {
    const weapon = requireWeapon("braton");
    const paper = build("braton", "biotic_rounds", { killStacks: 0 });
    expect(paper.statusChance).toBeCloseTo(weapon.statusChance, 5);
    expect(paper.elements.find((e) => e.type === "viral")).toBeUndefined();
    expect(paper.elements.find((e) => e.type === "magnetic")).toBeUndefined();

    const active = build("braton", "biotic_rounds", { killStacks: 1 });
    expect(active.statusChance).toBeCloseTo(weapon.statusChance * 2.5, 5);
    expect(active.elements.find((e) => e.type === "viral")?.value).toBeCloseTo(
      weapon.damage * 1.5,
      5,
    );
    expect(active.elements.find((e) => e.type === "magnetic")?.value).toBeCloseTo(
      weapon.damage * 1.5,
      5,
    );
  });

  it("Leaded Gas: paper unchanged; trigger → +300% Gas and SC", () => {
    const weapon = requireWeapon("lex");
    const paper = build("lex", "leaded_gas", {});
    expect(paper.statusChance).toBeCloseTo(weapon.statusChance, 5);
    expect(paper.elements.find((e) => e.type === "gas")).toBeUndefined();

    const active = build("lex", "leaded_gas", { applyTriggerBuffs: true });
    expect(active.statusChance).toBeCloseTo(weapon.statusChance * 4, 5);
    expect(active.elements.find((e) => e.type === "gas")?.value).toBeCloseTo(
      weapon.damage * 3,
      5,
    );
  });

  it("Kill Switch: paper reload unchanged; kill → +50% reload", () => {
    const weapon = requireWeapon("braton");
    expect(build("braton", "kill_switch", { killStacks: 0 }).reloadTime).toBeCloseTo(
      weapon.reloadTime,
      5,
    );
    expect(build("braton", "kill_switch", { killStacks: 1 }).reloadTime).toBeCloseTo(
      weapon.reloadTime / 1.5,
      5,
    );
  });

  it("Eximus / Range Advantage / Deadly Maneuvers: paper unchanged; trigger applies", () => {
    const lex = requireWeapon("lex");
    expect(build("lex", "eximus_advantage", {}).moddedBaseDamage).toBeCloseTo(lex.damage, 5);
    expect(
      build("lex", "eximus_advantage", { applyTriggerBuffs: true }).moddedBaseDamage,
    ).toBeCloseTo(lex.damage * 7, 5);

    expect(build("lex", "range_advantage", {}).moddedBaseDamage).toBeCloseTo(lex.damage, 5);
    expect(
      build("lex", "range_advantage", { applyTriggerBuffs: true }).moddedBaseDamage,
    ).toBeCloseTo(lex.damage * 4, 5);

    expect(build("lex", "deadly_maneuvers", {}).criticalChance).toBeCloseTo(
      lex.criticalChance,
      5,
    );
    expect(
      build("lex", "deadly_maneuvers", { applyTriggerBuffs: true }).criticalChance,
    ).toBeCloseTo(lex.criticalChance * 5, 5);
  });
});

describe("Sim3 AE + max-stack exclusives (wiki max rank)", () => {
  it("Brain Storm / Skull Shots / Zazvat-Kar: paper AE 0; trigger → +100% / +100% / +75% AE", () => {
    expect(build("braton", "brain_storm", {}).ammoEfficiency ?? 0).toBeCloseTo(0, 5);
    expect(
      build("braton", "brain_storm", { applyTriggerBuffs: true }).ammoEfficiency,
    ).toBeCloseTo(1, 5);

    expect(build("lex", "skull_shots", {}).ammoEfficiency ?? 0).toBeCloseTo(0, 5);
    expect(
      build("lex", "skull_shots", { applyTriggerBuffs: true }).ammoEfficiency,
    ).toBeCloseTo(1, 5);

    expect(build("lex", "zazvat_kar", {}).ammoEfficiency ?? 0).toBeCloseTo(0, 5);
    expect(
      build("lex", "zazvat_kar", { applyTriggerBuffs: true }).ammoEfficiency,
    ).toBeCloseTo(0.75, 5);
  });

  it("Critical Mutation: paper CC/CD unchanged; trigger → +300% CC and CD", () => {
    const lex = requireWeapon("lex");
    const bareCm = calculateWeaponBuild(lex, [], modsMap()).criticalMultiplier;
    const paper = build("lex", "critical_mutation", {});
    expect(paper.criticalChance).toBeCloseTo(lex.criticalChance, 5);
    expect(paper.criticalMultiplier).toBeCloseTo(bareCm, 5);
    const active = build("lex", "critical_mutation", { applyTriggerBuffs: true });
    expect(active.criticalChance).toBeCloseTo(lex.criticalChance * 4, 5);
    expect(active.criticalMultiplier).toBeCloseTo(bareCm * 4, 4);
  });

  it("Pain Points: paper WP bonus 0; trigger → +600% weak-point damage", () => {
    expect(build("lex", "pain_points", {}).headshotDamageBonus ?? 0).toBeCloseTo(0, 5);
    expect(
      build("lex", "pain_points", { applyTriggerBuffs: true }).headshotDamageBonus,
    ).toBeCloseTo(6, 5);
  });

  it("Split Flights: paper MS unchanged; killStacks 4 → +400% multishot", () => {
    const weapon = requireWeapon("paris");
    expect(build("paris", "split_flights", { killStacks: 0 }).multishot).toBeCloseTo(
      weapon.multishot,
      5,
    );
    expect(build("paris", "split_flights", { killStacks: 4 }).multishot).toBeCloseTo(
      weapon.multishot * 5,
      5,
    );
    expect(build("paris", "split_flights", { killStacks: 9 }).multishot).toBeCloseTo(
      weapon.multishot * 5,
      5,
    );
  });

  it("Critical Precision: paper CC unchanged; trigger → +500% CC", () => {
    const weapon = requireWeapon("braton");
    expect(build("braton", "critical_precision", {}).criticalChance).toBeCloseTo(
      weapon.criticalChance,
      5,
    );
    expect(
      build("braton", "critical_precision", { applyTriggerBuffs: true }).criticalChance,
    ).toBeCloseTo(weapon.criticalChance * 6, 5);
  });
});
