/**
 * Phase 2b — high-use melee mod apply goldens + biting_frost coverage.
 * Each case is wiki-checked for that mod ID (max rank).
 */
import { describe, expect, it } from "vitest";
import { allMods } from "@/data/mods";
import { allWeapons } from "@/data/weapons";
import { VERIFIED_MOD_BEHAVIORS } from "@/data/mod-behaviors";
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

function withMod(modId: string, sim = DEFAULT_SIM_PARAMS) {
  const weapon = requireWeapon("skana");
  const mod = requireMod(modId);
  return calculateWeaponBuild(
    weapon,
    [{ modId, rank: mod.maxRank, slotIndex: 0 }],
    modsMap(),
    undefined,
    sim,
  );
}

describe("melee damage / crit / status mods (wiki max rank)", () => {
  it("Pressure Point R5: +120% damage", () => {
    const weapon = requireWeapon("skana");
    const stats = withMod("pressure_point_r3");
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 2.2, 8);
  });

  it("Primed Pressure Point R10: +165% damage", () => {
    const weapon = requireWeapon("skana");
    const stats = withMod("primed_pressure_point");
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 2.65, 8);
  });

  it("True Steel R5: +120% crit chance", () => {
    const weapon = requireWeapon("skana");
    const stats = withMod("true_steel_r3");
    expect(stats.criticalChance).toBeCloseTo(weapon.criticalChance * 2.2, 8);
  });

  it("Organ Shatter R5: +90% crit damage after CM quantize", () => {
    const weapon = requireWeapon("skana");
    const cmq = quantizeBaseCritMultiplier(weapon.criticalMultiplier);
    const stats = withMod("organ_shatter_r3");
    expect(stats.criticalMultiplier).toBeCloseTo(cmq * 1.9, 8);
  });

  it("North Wind / Shocking Touch / Fever Strike: +90% elemental from base", () => {
    for (const [modId, type] of [
      ["north_wind_r3", "cold"],
      ["shocking_touch_r3", "electricity"],
      ["fever_strike_r3", "toxin"],
    ] as const) {
      const weapon = requireWeapon("skana");
      const stats = withMod(modId);
      const scale = stats.moddedBaseDamage / 32;
      const expected = quantizeDamageValue(weapon.damage * 0.9, scale);
      expect(stats.elements.find((e) => e.type === type)?.value).toBeCloseTo(expected, 8);
    }
  });

  it("Volcanic Edge R3: +60% heat and +60% status (manual override must keep heat)", () => {
    const weapon = requireWeapon("skana");
    const behavior = VERIFIED_MOD_BEHAVIORS.volcanic_edge;
    expect(behavior?.stats.some((s) => s.statKey === "heat" && s.target === "weapon_dps")).toBe(true);

    const stats = withMod("volcanic_edge");
    expect(stats.statusChance).toBeCloseTo(weapon.statusChance * 1.6, 8);
    const scale = stats.moddedBaseDamage / 32;
    const expectedHeat = quantizeDamageValue(weapon.damage * 0.6, scale);
    expect(stats.elements.find((e) => e.type === "heat")?.value).toBeCloseTo(expectedHeat, 8);
  });

  it("Vicious Frost / Voltaic Strike / Virulent Scourge: 60/60 dual-stat", () => {
    for (const [modId, type] of [
      ["vicious_frost", "cold"],
      ["voltaic_strike", "electricity"],
      ["virulent_scourge", "toxin"],
    ] as const) {
      const weapon = requireWeapon("skana");
      const stats = withMod(modId);
      expect(stats.statusChance).toBeCloseTo(weapon.statusChance * 1.6, 8);
      const scale = stats.moddedBaseDamage / 32;
      expect(stats.elements.find((e) => e.type === type)?.value).toBeCloseTo(
        quantizeDamageValue(weapon.damage * 0.6, scale),
        8,
      );
    }
  });
});

describe("melee remainder (wiki max rank, Phase M2)", () => {
  it("Primed Fever Strike R10: +165% toxin from base", () => {
    const weapon = requireWeapon("skana");
    const stats = withMod("primed_fever_strike");
    const scale = stats.moddedBaseDamage / 32;
    expect(stats.elements.find((e) => e.type === "toxin")?.value).toBeCloseTo(
      quantizeDamageValue(weapon.damage * 1.65, scale),
      8,
    );
  });

  it("Molten Impact R5: +90% heat from base", () => {
    const weapon = requireWeapon("skana");
    const stats = withMod("molten_impact_r3");
    const scale = stats.moddedBaseDamage / 32;
    expect(stats.elements.find((e) => e.type === "heat")?.value).toBeCloseTo(
      quantizeDamageValue(weapon.damage * 0.9, scale),
      8,
    );
  });

  it("Primed Fury R10: +55% attack speed", () => {
    const weapon = requireWeapon("skana");
    const stats = withMod("primed_fury");
    expect(stats.fireRate).toBeCloseTo(weapon.fireRate * 1.55, 8);
  });

  it("Primed Reach R10: catalog +3 range (panel / arsenal; not paper DPS)", () => {
    const mod = requireMod("primed_reach");
    expect(mod.stats.range! * (mod.maxRank + 1)).toBeCloseTo(3, 5);
    expect(VERIFIED_MOD_BEHAVIORS.primed_reach?.stats.every((s) => s.target === "mod_panel")).toBe(
      true,
    );
  });

  it("Berserker Fury R5: +35% AS per kill stack (cap 2) via killStacks", () => {
    const weapon = requireWeapon("skana");
    const bare = withMod("berserker_fury", { ...DEFAULT_SIM_PARAMS, killStacks: 0 });
    expect(bare.fireRate).toBeCloseTo(weapon.fireRate, 8);

    const stacked = withMod("berserker_fury", { ...DEFAULT_SIM_PARAMS, killStacks: 2 });
    expect(stacked.fireRate).toBeCloseTo(weapon.fireRate * 1.7, 5);
  });

  it("Sacrificial Steel R10: +220% crit chance", () => {
    const weapon = requireWeapon("skana");
    const stats = withMod("sacrificial_steel");
    expect(stats.criticalChance).toBeCloseTo(weapon.criticalChance * 3.2, 8);
  });

  it("Sacrificial Pressure R10: +110% damage", () => {
    const weapon = requireWeapon("skana");
    const stats = withMod("sacrificial_pressure");
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 2.1, 8);
  });

  it("Primed Smite Grineer: ×1.55 paper DPS when targetFaction=grineer", () => {
    const bare = calculateWeaponBuild(requireWeapon("skana"), [], modsMap(), undefined, {
      ...DEFAULT_SIM_PARAMS,
      targetFaction: "grineer",
    });
    const modded = withMod("primed_smite_grineer", {
      ...DEFAULT_SIM_PARAMS,
      targetFaction: "grineer",
    });
    expect(modded.factionBonuses?.grineer).toBeCloseTo(0.55, 8);
    expect(modded.burstDps / bare.burstDps).toBeCloseTo(1.55, 8);
  });
});

describe("biting_frost coverage (wiki Passive Augment)", () => {
  it("catalog matches wiki max rank table (+200% CC/CD, R3)", () => {
    const mod = requireMod("biting_frost");
    expect(mod.maxRank).toBe(3);
    expect(mod.warframeId).toBe("frost");
    expect(mod.stats.criticalChance! * (mod.maxRank + 1)).toBeCloseTo(200, 8);
    expect(mod.stats.criticalMultiplier! * (mod.maxRank + 1)).toBeCloseTo(200, 8);
  });

  it("has per-item mod_panel behavior (conditional frozen — not paper DPS)", () => {
    const behavior = VERIFIED_MOD_BEHAVIORS.biting_frost;
    expect(behavior).toBeDefined();
    expect(behavior!.stats.map((s) => s.statKey).sort()).toEqual([
      "criticalChance",
      "criticalMultiplier",
    ]);
    expect(behavior!.stats.every((s) => s.target === "mod_panel")).toBe(true);
  });

  it("push_&_pull remains registered (quoted id with &)", () => {
    expect(VERIFIED_MOD_BEHAVIORS["push_&_pull"]).toBeDefined();
  });
});
