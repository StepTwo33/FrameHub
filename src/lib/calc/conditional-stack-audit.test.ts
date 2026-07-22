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
