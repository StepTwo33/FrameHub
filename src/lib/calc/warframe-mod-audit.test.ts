/**
 * Phase 2c — high-use warframe power / survivability mod goldens (wiki max rank).
 */
import { describe, expect, it } from "vitest";
import { allMods } from "@/data/mods";
import { allWarframes } from "@/data/warframes";
import { calculateWarframeBuild } from "@/lib/calc/calculator";

const modsMap = () => new Map(allMods.map((m) => [m.id, m]));

function requireMod(id: string) {
  const mod = allMods.find((m) => m.id === id);
  expect(mod, `missing mod ${id}`).toBeDefined();
  return mod!;
}

function requireFrame(id: string) {
  const wf = allWarframes.find((w) => w.id === id);
  expect(wf, `missing warframe ${id}`).toBeDefined();
  return wf!;
}

function withMod(modId: string) {
  const wf = requireFrame("excalibur");
  const mod = requireMod(modId);
  return calculateWarframeBuild(
    wf,
    [{ modId, rank: mod.maxRank, slotIndex: 0 }],
    modsMap(),
  );
}

describe("ability power mods (wiki max rank)", () => {
  it("Intensify R5: +30% strength", () => {
    expect(withMod("intensify_r3").abilityStrength).toBeCloseTo(1.3, 8);
  });

  it("Blind Rage R10: +99% strength, −55% efficiency", () => {
    const stats = withMod("blind_rage");
    expect(stats.abilityStrength).toBeCloseTo(1.99, 8);
    expect(stats.abilityEfficiency).toBeCloseTo(0.45, 8);
  });

  it("Transient Fortitude R10: +55% strength, −27.5% duration", () => {
    const stats = withMod("transient_fortitude");
    expect(stats.abilityStrength).toBeCloseTo(1.55, 8);
    expect(stats.abilityDuration).toBeCloseTo(0.725, 8);
  });

  it("Continuity R5: +30% duration", () => {
    expect(withMod("continuity_r3").abilityDuration).toBeCloseTo(1.3, 8);
  });

  it("Primed Continuity R10: +55% duration", () => {
    expect(withMod("primed_continuity").abilityDuration).toBeCloseTo(1.55, 8);
  });

  it("Narrow Minded R10: +99% duration, −66% range", () => {
    const stats = withMod("narrow_minded");
    expect(stats.abilityDuration).toBeCloseTo(1.99, 8);
    expect(stats.abilityRange).toBeCloseTo(0.34, 8);
  });

  it("Stretch R5: +45% range", () => {
    expect(withMod("stretch_r3").abilityRange).toBeCloseTo(1.45, 8);
  });

  it("Overextended R5: +90% range, −60% strength", () => {
    const stats = withMod("overextended_r5");
    expect(stats.abilityRange).toBeCloseTo(1.9, 8);
    expect(stats.abilityStrength).toBeCloseTo(0.4, 8);
  });

  it("Streamline R5: +30% efficiency", () => {
    expect(withMod("streamline_r3").abilityEfficiency).toBeCloseTo(1.3, 8);
  });

  it("Fleeting Expertise R5: +60% efficiency, −60% duration", () => {
    const stats = withMod("fleeting_expertise_r5");
    expect(stats.abilityEfficiency).toBeCloseTo(1.6, 8);
    expect(stats.abilityDuration).toBeCloseTo(0.4, 8);
  });
});

describe("survivability mods post-U34 (wiki max rank)", () => {
  it("Vitality R10: +100% health on rank-30 pool", () => {
    const bare = calculateWarframeBuild(requireFrame("excalibur"), [], modsMap());
    const stats = withMod("vitality_r3");
    expect(stats.totalHealth).toBeCloseTo(bare.totalHealth * 2, 5);
  });

  it("Redirection R10: +100% shields", () => {
    const bare = calculateWarframeBuild(requireFrame("excalibur"), [], modsMap());
    const stats = withMod("redirection_r3");
    expect(stats.totalShield).toBeCloseTo(bare.totalShield * 2, 5);
  });

  it("Steel Fiber R10: +100% armor", () => {
    const bare = calculateWarframeBuild(requireFrame("excalibur"), [], modsMap());
    const stats = withMod("steel_fiber_r3");
    expect(stats.totalArmor).toBeCloseTo(bare.totalArmor * 2, 5);
  });

  it("Flow R5: +100% energy", () => {
    const bare = calculateWarframeBuild(requireFrame("excalibur"), [], modsMap());
    const stats = withMod("flow_r3");
    expect(stats.totalEnergy).toBeCloseTo(bare.totalEnergy * 2, 5);
  });

  it("Primed Flow R10: +185% energy (16.8182% × 11)", () => {
    const bare = calculateWarframeBuild(requireFrame("excalibur"), [], modsMap());
    const mod = requireMod("primed_flow");
    const bonus = (mod.stats.energy! * (mod.maxRank + 1)) / 100;
    const stats = withMod("primed_flow");
    expect(stats.totalEnergy).toBeCloseTo(bare.totalEnergy * (1 + bonus), 4);
  });
});
