import { describe, expect, it } from "vitest";
import { getArcaneEffectDef } from "@/lib/arcane-calculator";
import {
  bigCritProcRate,
  estimateEnervateCritStacks,
  getArcaneProcUptime,
} from "@/lib/arcane-proc-model";
import { avgCritMultiplier } from "@/lib/calculator";
import { calculateWeaponBuildWithArcanes } from "@/lib/calculator";
import { allArcanes } from "@/data/arcanes";
import { allWeapons } from "@/data/weapons";
import { DEFAULT_SIM_PARAMS } from "@/lib/types";

const braton = allWeapons.find((w) => w.id === "braton")!;
const merciless = allArcanes.find((a) => a.id === "arcane_secondary_merciless")!;
const tempo = allArcanes.find((a) => a.id === "virtuos_tempo")!;

describe("crit tiers (big / super crits)", () => {
  it("blends yellow and orange above 100% crit", () => {
    const cm = 2.0;
    const at150 = avgCritMultiplier(1.5, cm);
    const yellowOnly = 1 + 1.0 * (cm - 1);
    const orangeOnly = 2 * (cm - 1) + 1;
    expect(at150).toBeGreaterThan(yellowOnly);
    expect(at150).toBeLessThan(orangeOnly);
    expect(at150).toBeCloseTo(0.5 * yellowOnly + 0.5 * orangeOnly, 5);
  });

  it("big crit rate increases above 100% total crit", () => {
    expect(bigCritProcRate(0.8)).toBe(0);
    expect(bigCritProcRate(1.5)).toBeCloseTo(0.5, 5);
    expect(bigCritProcRate(2.0)).toBe(1);
  });
});

describe("proc uptime", () => {
  it("Virtuos Tempo uses proc chance not full uptime", () => {
    const def = getArcaneEffectDef("virtuos_tempo")!;
    const uptime = getArcaneProcUptime(def, 3, 6, braton.fireRate);
    expect(uptime).toBeGreaterThan(0.2);
    expect(uptime).toBeLessThan(1);
  });

  it("onHit arcanes apply full uptime when sim active", () => {
    const def = getArcaneEffectDef("virtuos_surge")!;
    expect(getArcaneProcUptime(def, 3, 6, 1)).toBe(1);
    expect(getArcaneProcUptime(def, 3, 0, 1)).toBe(0);
  });
});

describe("arcane DPS integration", () => {
  it("Secondary Merciless scales damage with sim stacks", () => {
    const noArc = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    const fullStacks = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [merciless],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 12 },
    );
    expect(fullStacks.totalDamage).toBeGreaterThan(noArc.totalDamage * 3.5);
    expect(fullStacks.burstDps).toBeGreaterThan(noArc.burstDps * 3.5);
  });

  it("Virtuos Tempo increases fire rate with partial proc uptime", () => {
    const base = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 6 },
    );
    const withTempo = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [tempo],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 6 },
    );
    expect(withTempo.fireRate).toBeGreaterThan(base.fireRate);
    expect(withTempo.fireRate).toBeLessThan(base.fireRate * 1.6);
  });
});

describe("Enervate stack estimate", () => {
  it("returns stacks when sim is active", () => {
    const stacks = estimateEnervateCritStacks(1.5, 10, 6, 6);
    expect(stacks).toBeGreaterThan(0);
    expect(stacks).toBeLessThanOrEqual(10);
  });
});
