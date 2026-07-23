/**
 * Phase 2a — high-use primary / secondary / shotgun mod apply goldens.
 * Each case is wiki-checked for that mod ID (max rank).
 */
import { describe, expect, it } from "vitest";
import { allMods } from "@/data/mods";
import { allWeapons } from "@/data/weapons";
import { calculateWeaponBuild, quantizeDamageValue } from "@/lib/calc/calculator";
import { quantizeBaseCritMultiplier } from "@/lib/calc/crit-utils";
import { DEFAULT_SIM_PARAMS } from "@/lib/types";

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

function withMod(weaponId: string, modId: string, sim = DEFAULT_SIM_PARAMS) {
  const weapon = requireWeapon(weaponId);
  const mod = requireMod(modId);
  return calculateWeaponBuild(
    weapon,
    [{ modId, rank: mod.maxRank, slotIndex: 0 }],
    modsMap(),
    undefined,
    sim,
  );
}

describe("primary rifle mods (wiki max rank)", () => {
  it("Serration R10: +165% damage → Braton modded base 24×2.65", () => {
    const stats = withMod("braton", "serration_r3");
    expect(stats.moddedBaseDamage).toBeCloseTo(24 * 2.65, 8);
  });

  it("Split Chamber R5: +90% multishot", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "split_chamber_r3");
    expect(stats.multishot).toBeCloseTo(weapon.multishot * 1.9, 8);
  });

  it("Point Strike R5: +150% crit chance (additive on base)", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "point_strike_r3");
    expect(stats.criticalChance).toBeCloseTo(weapon.criticalChance * 2.5, 8);
  });

  it("Vital Sense R5: +120% crit damage after CM quantize", () => {
    const weapon = requireWeapon("braton");
    const cmq = quantizeBaseCritMultiplier(weapon.criticalMultiplier);
    const stats = withMod("braton", "vital_sense_r3");
    expect(stats.criticalMultiplier).toBeCloseTo(cmq * 2.2, 8);
  });

  it("Hellfire R5: +90% heat from base, then damage quantize", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "hellfire_r3");
    const rawHeat = weapon.damage * 0.9;
    const scale = stats.moddedBaseDamage / 32;
    const expected = quantizeDamageValue(rawHeat, scale);
    const heat = stats.elements.find((e) => e.type === "heat");
    expect(heat?.value).toBeCloseTo(expected, 8);
  });

  it("Stormbringer / Cryo Rounds / Infected Clip: ±90% elementals from base", () => {
    for (const [modId, type] of [
      ["stormbringer_r3", "electricity"],
      ["cryo_rounds_r3", "cold"],
      ["infected_clip_r3", "toxin"],
    ] as const) {
      const weapon = requireWeapon("braton");
      const stats = withMod("braton", modId);
      const scale = stats.moddedBaseDamage / 32;
      const expected = quantizeDamageValue(weapon.damage * 0.9, scale);
      expect(stats.elements.find((e) => e.type === type)?.value).toBeCloseTo(expected, 8);
    }
  });

  it("Primed Bane of Grineer: ×1.55 paper DPS when targetFaction=grineer", () => {
    const bare = calculateWeaponBuild(requireWeapon("braton"), [], modsMap(), undefined, {
      ...DEFAULT_SIM_PARAMS,
      targetFaction: "grineer",
    });
    const modded = withMod("braton", "primed_bane_of_grineer", {
      ...DEFAULT_SIM_PARAMS,
      targetFaction: "grineer",
    });
    expect(modded.factionBonuses?.grineer).toBeCloseTo(0.55, 8);
    expect(modded.burstDps / bare.burstDps).toBeCloseTo(1.55, 8);
  });
});

describe("secondary pistol mods (wiki max rank)", () => {
  it("Hornet Strike R10: +220% damage", () => {
    const stats = withMod("lex", "hornet_strike_r3");
    expect(stats.moddedBaseDamage).toBeCloseTo(130 * 3.2, 8);
  });

  it("Barrel Diffusion R5: +120% multishot", () => {
    const weapon = requireWeapon("lex");
    const stats = withMod("lex", "barrel_diffusion_r3");
    expect(stats.multishot).toBeCloseTo(weapon.multishot * 2.2, 8);
  });

  it("Pistol Gambit R5: +120% crit chance", () => {
    const weapon = requireWeapon("lex");
    const stats = withMod("lex", "pistol_gambit_r3");
    expect(stats.criticalChance).toBeCloseTo(weapon.criticalChance * 2.2, 8);
  });

  it("Target Cracker R5: +60% crit damage after CM quantize", () => {
    const weapon = requireWeapon("lex");
    const cmq = quantizeBaseCritMultiplier(weapon.criticalMultiplier);
    const stats = withMod("lex", "target_cracker_r3");
    expect(stats.criticalMultiplier).toBeCloseTo(cmq * 1.6, 8);
  });

  it("Primed Target Cracker R10: +110% crit damage", () => {
    const weapon = requireWeapon("lex");
    const cmq = quantizeBaseCritMultiplier(weapon.criticalMultiplier);
    const stats = withMod("lex", "primed_target_cracker");
    expect(stats.criticalMultiplier).toBeCloseTo(cmq * 2.1, 8);
  });

  it("Primed Pistol Gambit R10: +187% crit chance", () => {
    const weapon = requireWeapon("lex");
    const stats = withMod("lex", "primed_pistol_gambit");
    expect(stats.criticalChance).toBeCloseTo(weapon.criticalChance * (1 + 1.87), 8);
  });

  it("Primed Heated Charge R10: +165% heat from base", () => {
    const weapon = requireWeapon("lex");
    const stats = withMod("lex", "primed_heated_charge");
    const scale = stats.moddedBaseDamage / 32;
    const expected = quantizeDamageValue(weapon.damage * 1.65, scale);
    expect(stats.elements.find((e) => e.type === "heat")?.value).toBeCloseTo(expected, 8);
  });
});

describe("shotgun mods (wiki max rank)", () => {
  it("Point Blank R5: +90% damage", () => {
    const weapon = requireWeapon("strun");
    const stats = withMod("strun", "point_blank_r3");
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 1.9, 8);
  });

  it("Primed Point Blank R10: +165% damage", () => {
    const weapon = requireWeapon("strun");
    const stats = withMod("strun", "primed_point_blank");
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 2.65, 8);
  });

  it("Hell's Chamber R5: +120% multishot", () => {
    const weapon = requireWeapon("strun");
    const stats = withMod("strun", "hells_chamber");
    expect(stats.multishot).toBeCloseTo(weapon.multishot * 2.2, 8);
  });

  it("Blaze R3: +60% damage and +60% heat from modded base", () => {
    const weapon = requireWeapon("strun");
    const stats = withMod("strun", "blaze");
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 1.6, 8);
    const scale = stats.moddedBaseDamage / 32;
    // Wiki: elemental % applies to modded base (includes Blaze's own +damage)
    const expectedHeat = quantizeDamageValue(stats.moddedBaseDamage * 0.6, scale);
    expect(stats.elements.find((e) => e.type === "heat")?.value).toBeCloseTo(expectedHeat, 8);
  });

  it("Shotgun Spazz R5: +90% fire rate", () => {
    const weapon = requireWeapon("strun");
    const stats = withMod("strun", "shotgun_spazz");
    expect(stats.fireRate).toBeCloseTo(weapon.fireRate * 1.9, 8);
  });

  it("Vicious Spread R5: +90% damage (spread panel-only)", () => {
    const weapon = requireWeapon("strun");
    const stats = withMod("strun", "vicious_spread");
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 1.9, 8);
  });
});

describe("primary remainder (wiki max rank, Phase M1)", () => {
  it("Heavy Caliber R10: +165% damage (accuracy panel-only)", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "heavy_caliber");
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 2.65, 8);
  });

  it("Amalgam Serration R10: +155% damage (cross-check amalgam-serration.test.ts)", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "amalgam_serration");
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 2.55, 4);
  });

  it("Hunter Munitions R5: +30% slash-on-crit chance", () => {
    const stats = withMod("braton", "hunter_munitions");
    expect(stats.slashOnCritChance).toBeCloseTo(0.3, 8);
  });

  it("Primed Cryo Rounds R10: +165% cold from base", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "primed_cryo_rounds");
    const scale = stats.moddedBaseDamage / 32;
    expect(stats.elements.find((e) => e.type === "cold")?.value).toBeCloseTo(
      quantizeDamageValue(weapon.damage * 1.65, scale),
      8,
    );
  });

  it("Speed Trigger R5: +60% fire rate", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "speed_trigger_r3");
    expect(stats.fireRate).toBeCloseTo(weapon.fireRate * 1.6, 8);
  });

  it("Hammer Shot R3: +60% crit damage, +80% status", () => {
    const weapon = requireWeapon("braton");
    const cmq = quantizeBaseCritMultiplier(weapon.criticalMultiplier);
    const stats = withMod("braton", "hammer_shot");
    expect(stats.criticalMultiplier).toBeCloseTo(cmq * 1.6, 8);
    expect(stats.statusChance).toBeCloseTo(weapon.statusChance * 1.8, 8);
  });

  it("Critical Delay R5: +200% crit chance, −20% fire rate", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "critical_delay");
    expect(stats.criticalChance).toBeCloseTo(weapon.criticalChance * 3, 4);
    expect(stats.fireRate).toBeCloseTo(weapon.fireRate * 0.8, 4);
  });

  it("High Voltage / Rime Rounds / Malignant Force / Thermite: 60/60 dual-stat", () => {
    for (const [modId, type] of [
      ["high_voltage_r3", "electricity"],
      ["rime_rounds_r3", "cold"],
      ["malignant_force_r3", "toxin"],
      ["thermite_rounds_nightmare", "heat"],
    ] as const) {
      const weapon = requireWeapon("braton");
      const stats = withMod("braton", modId);
      expect(stats.statusChance).toBeCloseTo(weapon.statusChance * 1.6, 8);
      const scale = stats.moddedBaseDamage / 32;
      expect(stats.elements.find((e) => e.type === type)?.value).toBeCloseTo(
        quantizeDamageValue(weapon.damage * 0.6, scale),
        8,
      );
    }
  });
});

describe("secondary remainder (wiki max rank, Phase M1)", () => {
  it("Lethal Torrent R5: +60% fire rate and +60% multishot", () => {
    const weapon = requireWeapon("lex");
    const stats = withMod("lex", "lethal_torrent");
    expect(stats.fireRate).toBeCloseTo(weapon.fireRate * 1.6, 8);
    expect(stats.multishot).toBeCloseTo(weapon.multishot * 1.6, 8);
  });

  it("Anemic Agility R5: +90% fire rate, −15% damage", () => {
    const weapon = requireWeapon("lex");
    const stats = withMod("lex", "anemic_agility");
    expect(stats.fireRate).toBeCloseTo(weapon.fireRate * 1.9, 8);
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 0.85, 8);
  });

  it("Gunslinger R5: +72% fire rate", () => {
    const weapon = requireWeapon("lex");
    const stats = withMod("lex", "gunslinger_r3");
    expect(stats.fireRate).toBeCloseTo(weapon.fireRate * 1.72, 8);
  });

  it("Heated Charge / Pathogen / Deep Freeze / Convulsion: ±90% elementals", () => {
    for (const [modId, type] of [
      ["heated_charge_r3", "heat"],
      ["pathogen_rounds_r3", "toxin"],
      ["deep_freeze_r3", "cold"],
      ["convulsion_r3", "electricity"],
    ] as const) {
      const weapon = requireWeapon("lex");
      const stats = withMod("lex", modId);
      const scale = stats.moddedBaseDamage / 32;
      expect(stats.elements.find((e) => e.type === type)?.value).toBeCloseTo(
        quantizeDamageValue(weapon.damage * 0.9, scale),
        8,
      );
    }
  });

  it("Frostbite / Pistol Pestilence / Jolt / Scorch: 60/60 dual-stat", () => {
    for (const [modId, type] of [
      ["frostbite_r3", "cold"],
      ["pistol_pestilence_r3", "toxin"],
      ["jolt_r3", "electricity"],
      ["scorch_r3", "heat"],
    ] as const) {
      const weapon = requireWeapon("lex");
      const stats = withMod("lex", modId);
      expect(stats.statusChance).toBeCloseTo(weapon.statusChance * 1.6, 8);
      const scale = stats.moddedBaseDamage / 32;
      expect(stats.elements.find((e) => e.type === type)?.value).toBeCloseTo(
        quantizeDamageValue(weapon.damage * 0.6, scale),
        8,
      );
    }
  });
});

describe("shotgun remainder (wiki max rank, Phase M1)", () => {
  it("Primed Ravage R10: +110% crit damage", () => {
    const weapon = requireWeapon("strun");
    const cmq = quantizeBaseCritMultiplier(weapon.criticalMultiplier);
    const stats = withMod("strun", "primed_ravage");
    expect(stats.criticalMultiplier).toBeCloseTo(cmq * 2.1, 8);
  });

  it("Contagious Spread R5: +90% toxin from base", () => {
    const weapon = requireWeapon("strun");
    const stats = withMod("strun", "contagious_spread_r3");
    const scale = stats.moddedBaseDamage / 32;
    expect(stats.elements.find((e) => e.type === "toxin")?.value).toBeCloseTo(
      quantizeDamageValue(weapon.damage * 0.9, scale),
      8,
    );
  });

  it("Incendiary Coat / Charged Shell / Chilling Grasp: ±90% elementals", () => {
    for (const [modId, type] of [
      ["incendiary_coat_r3", "heat"],
      ["charged_shell_r3", "electricity"],
      ["chilling_grasp_r3", "cold"],
    ] as const) {
      const weapon = requireWeapon("strun");
      const stats = withMod("strun", modId);
      const scale = stats.moddedBaseDamage / 32;
      expect(stats.elements.find((e) => e.type === type)?.value).toBeCloseTo(
        quantizeDamageValue(weapon.damage * 0.9, scale),
        8,
      );
    }
  });

  it("Frigid Blast / Shell Shock / Scattering Inferno / Toxic Barrage: 60/60", () => {
    for (const [modId, type] of [
      ["frigid_blast_r3", "cold"],
      ["shell_shock_r3", "electricity"],
      ["scattering_inferno_r3", "heat"],
      ["toxic_barrage_r3", "toxin"],
    ] as const) {
      const weapon = requireWeapon("strun");
      const stats = withMod("strun", modId);
      expect(stats.statusChance).toBeCloseTo(weapon.statusChance * 1.6, 8);
      const scale = stats.moddedBaseDamage / 32;
      expect(stats.elements.find((e) => e.type === type)?.value).toBeCloseTo(
        quantizeDamageValue(weapon.damage * 0.6, scale),
        8,
      );
    }
  });
});

describe("primary cores (wiki max rank, Phase M5)", () => {
  it("Shred R5: +30% fire rate", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "shred");
    expect(stats.fireRate).toBeCloseTo(weapon.fireRate * 1.3, 8);
  });

  it("Primed Shred R10: +55% fire rate", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "primed_shred");
    expect(stats.fireRate).toBeCloseTo(weapon.fireRate * 1.55, 8);
  });

  it("Vigilante Armaments R5: +60% multishot", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "vigilante_armaments");
    expect(stats.multishot).toBeCloseTo(weapon.multishot * 1.6, 8);
  });

  it("Vigilante Fervor R5: +45% fire rate", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "vigilante_fervor");
    expect(stats.fireRate).toBeCloseTo(weapon.fireRate * 1.45, 8);
  });

  it("Vile Acceleration R5: +90% fire rate, −15% damage", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "vile_acceleration");
    expect(stats.fireRate).toBeCloseTo(weapon.fireRate * 1.9, 8);
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 0.85, 8);
  });

  it("Frail Momentum R5: +90% fire rate, −15% damage", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "frail_momentum");
    expect(stats.fireRate).toBeCloseTo(weapon.fireRate * 1.9, 8);
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 0.85, 8);
  });

  it("Rifle Aptitude R5: +90% status chance", () => {
    const weapon = requireWeapon("braton");
    const stats = withMod("braton", "rifle_aptitude_r3");
    expect(stats.statusChance).toBeCloseTo(weapon.statusChance * 1.9, 8);
  });

  it("Sawtooth Clip / Piercing Hit / Rupture: +90% Slash/Puncture/Impact", () => {
    const weapon = requireWeapon("braton");
    const slash = withMod("braton", "sawtooth_clip");
    const puncture = withMod("braton", "piercing_hit");
    const impact = withMod("braton", "rupture");
    expect(slash.slash).toBeCloseTo(
      quantizeDamageValue(weapon.slash * 1.9, slash.moddedBaseDamage / 32),
      8,
    );
    expect(puncture.puncture).toBeCloseTo(
      quantizeDamageValue(weapon.puncture * 1.9, puncture.moddedBaseDamage / 32),
      8,
    );
    expect(impact.impact).toBeCloseTo(
      quantizeDamageValue(weapon.impact * 1.9, impact.moddedBaseDamage / 32),
      8,
    );
  });

  it("Fanged Fusillade / Piercing Caliber / Crash Course: +120% Slash/Puncture/Impact", () => {
    const weapon = requireWeapon("braton");
    const slash = withMod("braton", "fanged_fusillade");
    const puncture = withMod("braton", "piercing_caliber");
    const impact = withMod("braton", "crash_course");
    expect(slash.slash).toBeCloseTo(
      quantizeDamageValue(weapon.slash * 2.2, slash.moddedBaseDamage / 32),
      8,
    );
    expect(puncture.puncture).toBeCloseTo(
      quantizeDamageValue(weapon.puncture * 2.2, puncture.moddedBaseDamage / 32),
      8,
    );
    expect(impact.impact).toBeCloseTo(
      quantizeDamageValue(weapon.impact * 2.2, impact.moddedBaseDamage / 32),
      8,
    );
  });

  it("Primed Bane of Corpus: ×1.55 paper DPS when targetFaction=corpus", () => {
    const bare = calculateWeaponBuild(requireWeapon("braton"), [], modsMap(), undefined, {
      ...DEFAULT_SIM_PARAMS,
      targetFaction: "corpus",
    });
    const modded = withMod("braton", "primed_bane_of_corpus", {
      ...DEFAULT_SIM_PARAMS,
      targetFaction: "corpus",
    });
    expect(modded.factionBonuses?.corpus).toBeCloseTo(0.55, 8);
    expect(modded.burstDps / bare.burstDps).toBeCloseTo(1.55, 8);
  });
});

describe("secondary cores (wiki max rank, Phase M5)", () => {
  it("Magnum Force R10: +165% damage (accuracy panel-only)", () => {
    const weapon = requireWeapon("lex");
    const stats = withMod("lex", "magnum_force");
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 2.65, 8);
  });

  it("Augur Pact (augur_breach) R5: +90% damage", () => {
    const weapon = requireWeapon("lex");
    const stats = withMod("lex", "augur_breach");
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 1.9, 8);
  });

  it("Creeping Bullseye R5: +200% crit chance, −20% fire rate", () => {
    const weapon = requireWeapon("lex");
    const stats = withMod("lex", "creeping_bullseye");
    expect(stats.criticalChance).toBeCloseTo(weapon.criticalChance * 3, 4);
    expect(stats.fireRate).toBeCloseTo(weapon.fireRate * 0.8, 4);
  });

  it("Hollow Point R5: +60% crit damage, −15% damage", () => {
    const weapon = requireWeapon("lex");
    const cmq = quantizeBaseCritMultiplier(weapon.criticalMultiplier);
    const stats = withMod("lex", "hollow_point");
    expect(stats.criticalMultiplier).toBeCloseTo(cmq * 1.6, 8);
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 0.85, 8);
  });

  it("Primed Convulsion R10: +165% electricity from base", () => {
    const weapon = requireWeapon("lex");
    const stats = withMod("lex", "primed_convulsion");
    const scale = stats.moddedBaseDamage / 32;
    expect(stats.elements.find((e) => e.type === "electricity")?.value).toBeCloseTo(
      quantizeDamageValue(weapon.damage * 1.65, scale),
      8,
    );
  });

  it("Bore / Maim / Pummel: +120% Puncture/Slash/Impact", () => {
    const weapon = requireWeapon("lex");
    const puncture = withMod("lex", "bore");
    const slash = withMod("lex", "maim");
    const impact = withMod("lex", "pummel");
    expect(puncture.puncture).toBeCloseTo(
      quantizeDamageValue(weapon.puncture * 2.2, puncture.moddedBaseDamage / 32),
      8,
    );
    expect(slash.slash).toBeCloseTo(
      quantizeDamageValue(weapon.slash * 2.2, slash.moddedBaseDamage / 32),
      8,
    );
    expect(impact.impact).toBeCloseTo(
      quantizeDamageValue(weapon.impact * 2.2, impact.moddedBaseDamage / 32),
      8,
    );
  });

  it("Concussion Rounds / No Return / Razor Shot: +90% Impact/Puncture/Slash", () => {
    const weapon = requireWeapon("lex");
    const impact = withMod("lex", "concussion_rounds");
    const puncture = withMod("lex", "no_return");
    const slash = withMod("lex", "razor_shot");
    expect(impact.impact).toBeCloseTo(
      quantizeDamageValue(weapon.impact * 1.9, impact.moddedBaseDamage / 32),
      8,
    );
    expect(puncture.puncture).toBeCloseTo(
      quantizeDamageValue(weapon.puncture * 1.9, puncture.moddedBaseDamage / 32),
      8,
    );
    expect(slash.slash).toBeCloseTo(
      quantizeDamageValue(weapon.slash * 1.9, slash.moddedBaseDamage / 32),
      8,
    );
  });
});

describe("shotgun cores (wiki max rank, Phase M5)", () => {
  it("Primed Charged Shell R10: +165% electricity from base", () => {
    const weapon = requireWeapon("strun");
    const stats = withMod("strun", "primed_charged_shell");
    const scale = stats.moddedBaseDamage / 32;
    expect(stats.elements.find((e) => e.type === "electricity")?.value).toBeCloseTo(
      quantizeDamageValue(weapon.damage * 1.65, scale),
      8,
    );
  });

  it("Primed Chilling Grasp R10: +165% cold from base", () => {
    const weapon = requireWeapon("strun");
    const stats = withMod("strun", "primed_chilling_grasp");
    const scale = stats.moddedBaseDamage / 32;
    expect(stats.elements.find((e) => e.type === "cold")?.value).toBeCloseTo(
      quantizeDamageValue(weapon.damage * 1.65, scale),
      8,
    );
  });
});
