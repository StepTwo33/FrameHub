/**
 * Arch weapons accuracy (B13) — non-exalted archgun/archmelee Space bare paper.
 * Arbucep (6-mode cycler mag/MS convention) deferred.
 * Wiki Module:Weapons/data/archwing locked in ARCH_BARE_GOLDENS.
 */
import { describe, expect, it } from "vitest";
import { allMods } from "@/data/mods";
import { allWeapons } from "@/data/weapons";
import { calculateWeaponBuild } from "@/lib/calc/calculator";
import { ARCH_BARE_GOLDENS } from "@/lib/calc/arch-bare-goldens";
import type { Mod, Weapon } from "@/lib/types";

const ARCH_CATS = new Set(["archgun", "archmelee"]);

/** Multi-element cycler mag/MS convention not wiki-locked this pass. */
const DEFERRED_ARCH_IDS = new Set(["arbucep"]);

function modsMap(): Map<string, Mod> {
  return new Map(allMods.map((m) => [m.id, m]));
}

function archPool(): Weapon[] {
  return allWeapons.filter(
    (w) => ARCH_CATS.has(w.category) && !w.isExalted && !DEFERRED_ARCH_IDS.has(w.id),
  );
}

describe("arch weapon inventory (B13)", () => {
  const pool = archPool();

  it("has a non-empty archgun + archmelee pool", () => {
    expect(pool.length).toBeGreaterThanOrEqual(25);
    expect(pool.some((w) => w.category === "archgun")).toBe(true);
    expect(pool.some((w) => w.category === "archmelee")).toBe(true);
  });

  it("every locked-pool arch weapon has damage > 0 and required paper fields", () => {
    for (const w of pool) {
      expect(w.damage, w.id).toBeGreaterThan(0);
      expect(w.criticalChance, w.id).toBeGreaterThanOrEqual(0);
      expect(w.criticalMultiplier, w.id).toBeGreaterThan(0);
      expect(w.statusChance, w.id).toBeGreaterThanOrEqual(0);
      expect(w.fireRate, w.id).toBeGreaterThan(0);
      expect(w.multishot, w.id).toBeGreaterThan(0);
    }
  });

  it("deferred cycler rows are excluded from goldens", () => {
    for (const id of DEFERRED_ARCH_IDS) {
      expect(ARCH_BARE_GOLDENS.some((g) => g.id === id), id).toBe(false);
      expect(allWeapons.some((w) => w.id === id), `deferred ${id} still in catalog`).toBe(true);
    }
  });
});

describe("arch bare wiki goldens", () => {
  it("locks every non-deferred arch weapon against wiki-matched catalog", () => {
    expect(ARCH_BARE_GOLDENS.length).toBeGreaterThanOrEqual(25);
  });

  it.each(ARCH_BARE_GOLDENS)("$id catalog bare paper", (g) => {
    const w = allWeapons.find((x) => x.id === g.id);
    expect(w, g.id).toBeDefined();
    expect(w!.damage).toBeCloseTo(g.damage, 4);
    expect(w!.criticalChance).toBeCloseTo(g.criticalChance, 4);
    expect(w!.criticalMultiplier).toBeCloseTo(g.criticalMultiplier, 4);
    expect(w!.statusChance).toBeCloseTo(g.statusChance, 4);
    expect(w!.fireRate).toBeCloseTo(g.fireRate, 4);
    expect(w!.multishot).toBeCloseTo(g.multishot, 4);
    for (const key of [
      "impact",
      "puncture",
      "slash",
      "heat",
      "cold",
      "toxin",
      "electricity",
      "radiation",
      "viral",
      "corrosive",
      "blast",
      "gas",
      "magnetic",
    ] as const) {
      const expected = (g as Record<string, number | undefined>)[key];
      if (expected != null) {
        expect(w![key] ?? 0, `${g.id}.${key}`).toBeCloseTo(expected, 4);
      }
    }
  });

  it("Imperator bare calc smoke", () => {
    const w = allWeapons.find((x) => x.id === "imperator")!;
    const stats = calculateWeaponBuild(w, [], modsMap());
    expect(stats.moddedBaseDamage).toBeCloseTo(50, 3);
  });

  it("Cortege / Larkspur keep innate elements on bare calc", () => {
    for (const [id, type] of [
      ["cortege", "heat"],
      ["larkspur", "radiation"],
      ["velocitus", "magnetic"],
    ] as const) {
      const w = allWeapons.find((x) => x.id === id)!;
      const stats = calculateWeaponBuild(w, [], modsMap());
      expect(stats.elements.some((e) => e.type === type), id).toBe(true);
    }
  });
});
