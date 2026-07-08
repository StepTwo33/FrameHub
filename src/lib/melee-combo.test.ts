import { describe, expect, it } from "vitest";
import { allMods } from "@/data/mods";
import { allWeapons } from "@/data/weapons";
import { calculateWeaponBuild } from "@/lib/calculator";
import {
  getHeavyAttackComboMultiplier,
  getMeleeScalingMultiplier,
  resolveEffectiveComboCount,
} from "@/lib/melee-combo";
import { DEFAULT_SIM_PARAMS } from "@/lib/types";

const galatine = allWeapons.find((w) => w.id === "galatine")!;

describe("melee combo tiers", () => {
  it("reaches 12× heavy and 3.75× scaling at 220 hits", () => {
    expect(getHeavyAttackComboMultiplier(219)).toBe(11);
    expect(getHeavyAttackComboMultiplier(220)).toBe(12);
    expect(getMeleeScalingMultiplier(220)).toBe(3.75);
  });

  it("uses 11-hit cadence and 11× cap for Dex Nikana", () => {
    expect(getHeavyAttackComboMultiplier(110, "dex_nikana")).toBe(11);
    expect(getHeavyAttackComboMultiplier(220, "dex_nikana")).toBe(11);
    expect(getHeavyAttackComboMultiplier(22, "dex_nikana")).toBe(3);
  });

  it("adds Corrupt Charge to effective combo count", () => {
    const modsMap = new Map(allMods.map((m) => [m.id, m]));
    const withCorrupt = resolveEffectiveComboCount(
      200,
      "galatine",
      [{ modId: "corrupt_charge", rank: 3 }],
      modsMap,
    );
    expect(withCorrupt).toBe(215);
    expect(getHeavyAttackComboMultiplier(withCorrupt)).toBe(12);
  });
});

describe("calculateWeaponBuild melee combo", () => {
  it("applies 12× heavy multiplier at 220 sim combo hits", () => {
    const modsMap = new Map(allMods.map((m) => [m.id, m]));
    const stats = calculateWeaponBuild(
      galatine,
      [],
      modsMap,
      undefined,
      { ...DEFAULT_SIM_PARAMS, comboCount: 220 },
    );
    expect(stats.heavyAttackComboMultiplier).toBe(12);
    expect(stats.comboMultiplier).toBe(3.75);
  });

  it("starts Fragor Prime at 2× heavy from innate 30 combo", () => {
    const fragor = allWeapons.find((w) => w.id === "fragor_prime")!;
    const modsMap = new Map(allMods.map((m) => [m.id, m]));
    const stats = calculateWeaponBuild(
      fragor,
      [],
      modsMap,
      undefined,
      { ...DEFAULT_SIM_PARAMS, comboCount: 0 },
    );
    expect(stats.comboCount).toBe(30);
    expect(stats.heavyAttackComboMultiplier).toBe(2);
  });
});
