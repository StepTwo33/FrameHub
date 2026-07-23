/**
 * Melee weapons accuracy (B12) — non-exalted melee bare paper.
 * Dual-mode Dark Split-Sword + Zaw stub Rabvee deferred.
 * Wiki Module:Weapons/data/melee locked in MELEE_BARE_GOLDENS.
 */
import { describe, expect, it } from "vitest";
import { allMods } from "@/data/mods";
import { allWeapons } from "@/data/weapons";
import { calculateWeaponBuild } from "@/lib/calc/calculator";
import { MELEE_BARE_GOLDENS } from "@/lib/calc/melee-bare-goldens";
import type { Mod, Weapon } from "@/lib/types";

/** Dual-form / zaw-component stubs intentionally not wiki-locked this pass. */
const DEFERRED_MELEE_IDS = new Set(["dark_split_sword", "rabvee"]);

function modsMap(): Map<string, Mod> {
  return new Map(allMods.map((m) => [m.id, m]));
}

function meleePool(): Weapon[] {
  return allWeapons.filter(
    (w) =>
      w.category === "melee" &&
      !w.isExalted &&
      w.triggerType !== "Zaw Component" &&
      !DEFERRED_MELEE_IDS.has(w.id),
  );
}

describe("melee weapon inventory (B12)", () => {
  const pool = meleePool();

  it("has a non-empty melee pool excluding exalteds and deferred stubs", () => {
    expect(pool.length).toBeGreaterThan(200);
  });

  it("every locked-pool melee has damage > 0 and required paper fields", () => {
    for (const w of pool) {
      expect(w.damage, w.id).toBeGreaterThan(0);
      expect(w.criticalChance, w.id).toBeGreaterThanOrEqual(0);
      expect(w.criticalMultiplier, w.id).toBeGreaterThan(0);
      expect(w.statusChance, w.id).toBeGreaterThanOrEqual(0);
      expect(w.fireRate, w.id).toBeGreaterThan(0);
      expect(w.multishot, w.id).toBeGreaterThan(0);
    }
  });

  it("deferred dual-mode / zaw stub rows are excluded from goldens", () => {
    for (const id of DEFERRED_MELEE_IDS) {
      expect(
        MELEE_BARE_GOLDENS.some((g) => g.id === id),
        id,
      ).toBe(false);
      expect(
        allWeapons.some((w) => w.id === id),
        `deferred ${id} still in catalog`,
      ).toBe(true);
    }
  });
});

describe("melee bare wiki goldens", () => {
  it("locks every non-deferred melee against wiki-matched catalog", () => {
    expect(MELEE_BARE_GOLDENS.length).toBeGreaterThanOrEqual(210);
  });

  it.each(MELEE_BARE_GOLDENS)("$id catalog bare paper", (g) => {
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

  it("Skana + Pressure Point still scales modded base (smoke)", () => {
    const skana = allWeapons.find((w) => w.id === "skana")!;
    const pp = allMods.find((m) => m.id === "pressure_point_r3")!;
    const stats = calculateWeaponBuild(
      skana,
      [{ modId: pp.id, rank: pp.maxRank, slotIndex: 0 }],
      modsMap(),
    );
    expect(stats.moddedBaseDamage).toBeCloseTo(skana.damage * 2.2, 3);
  });

  it("Silva & Aegis / Dark Sword keep innate elements on bare calc", () => {
    for (const [id, type] of [
      ["silva_&_aegis", "heat"],
      ["silva_&_aegis_prime", "heat"],
      ["dark_sword", "radiation"],
    ] as const) {
      const w = allWeapons.find((x) => x.id === id)!;
      const stats = calculateWeaponBuild(w, [], modsMap());
      expect(stats.elements.some((e) => e.type === type), id).toBe(true);
    }
  });
});
