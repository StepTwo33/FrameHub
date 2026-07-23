/**
 * Phase M13 — Railjack integrated always-on mod apply goldens (wiki max rank).
 */
import { describe, expect, it } from "vitest";
import { VERIFIED_MOD_BEHAVIORS } from "@/data/mod-behaviors";
import { calculateRailjackBuild } from "@/lib/calc/railjack-calculator";

describe("railjack integrated cores (wiki max rank, Phase M13)", () => {
  it("Hyperstrike R5: +75% turret damage (no alias double-count)", () => {
    const stats = calculateRailjackBuild({
      turretIds: ["zetki_apoc"],
      integratedMods: [{ modId: "hyperstrike", rank: 5, slotIndex: 0 }],
    });
    expect(stats.turretDamageBonus).toBeCloseTo(0.75, 5);
  });

  it("Predator R5: +50% turret crit chance", () => {
    const stats = calculateRailjackBuild({
      integratedMods: [{ modId: "predator", rank: 5, slotIndex: 0 }],
    });
    // Catalog 8.333%/rank leaves ~2e-5 residue vs exact wiki +50%
    expect(stats.turretCritBonus).toBeCloseTo(0.5, 3);
  });

  it("Section Density R5: +50% turret crit damage", () => {
    const stats = calculateRailjackBuild({
      integratedMods: [{ modId: "section_density", rank: 5, slotIndex: 0 }],
    });
    expect(stats.turretCritDmgBonus).toBeCloseTo(0.5, 3);
  });

  it("Warhead R10: +100% ordnance damage (not turret)", () => {
    const stats = calculateRailjackBuild({
      ordnanceId: "zetki_tycho_seeker_mk4",
      integratedMods: [{ modId: "warhead", rank: 10, slotIndex: 0 }],
    });
    expect(stats.ordnanceDamageBonus).toBeCloseTo(1, 3);
    expect(stats.turretDamageBonus).toBeCloseTo(0, 8);
  });

  it("Forward Artillery R10: +100% artillery damage (not turret)", () => {
    const stats = calculateRailjackBuild({
      integratedMods: [{ modId: "forward_artillery", rank: 10, slotIndex: 0 }],
    });
    expect(stats.artilleryDamageBonus).toBeCloseTo(1, 3);
    expect(stats.turretDamageBonus).toBeCloseTo(0, 8);
  });

  it("Fortifying/Defensive Fire / Onslaught Matrix: conditional are panel-only", () => {
    for (const id of ["fortifying_fire", "defensive_fire", "onslaught_matrix"]) {
      const beh = VERIFIED_MOD_BEHAVIORS[id];
      expect(beh, id).toBeDefined();
      expect(
        beh!.stats.every((s) => s.target === "mod_panel"),
        id,
      ).toBe(true);
    }
  });
});
