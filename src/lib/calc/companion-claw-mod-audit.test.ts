/**
 * Phase M11 — beast claw (companion_weapon) always-on apply goldens.
 * Host: Chesa Claws from custom-items (not in weapons.ts).
 */
import { describe, expect, it } from "vitest";
import { customWeapons } from "@/data/custom-items";
import { allMods } from "@/data/mods";
import { calculateWeaponBuild, quantizeDamageValue } from "@/lib/calc/calculator";
import { quantizeBaseCritMultiplier } from "@/lib/calc/crit-utils";
import { VERIFIED_MOD_BEHAVIORS } from "@/data/mod-behaviors";
import { DEFAULT_SIM_PARAMS } from "@/lib/types";

const modsMap = () => new Map(allMods.map((m) => [m.id, m]));

function requireMod(id: string) {
  const mod = allMods.find((m) => m.id === id);
  expect(mod, `missing mod ${id}`).toBeDefined();
  return mod!;
}

function requireClaws(id: string) {
  const weapon = customWeapons.find((w) => w.id === id);
  expect(weapon, `missing claws ${id}`).toBeDefined();
  return weapon!;
}

function withMod(modId: string) {
  const weapon = requireClaws("chesa_claws");
  const mod = requireMod(modId);
  return calculateWeaponBuild(
    weapon,
    [{ modId, rank: mod.maxRank, slotIndex: 0 }],
    modsMap(),
    undefined,
    DEFAULT_SIM_PARAMS,
  );
}

describe("beast claw cores (wiki max rank, Phase M11)", () => {
  it("Maul (Claws) R10: +330% damage", () => {
    const weapon = requireClaws("chesa_claws");
    expect(withMod("claw_maul").moddedBaseDamage).toBeCloseTo(weapon.damage * 4.3, 5);
  });

  it("Bite (Claws) R10: +330% CC / +220% CM", () => {
    const weapon = requireClaws("chesa_claws");
    const cmq = quantizeBaseCritMultiplier(weapon.criticalMultiplier);
    const stats = withMod("claw_bite");
    expect(stats.criticalChance).toBeCloseTo(weapon.criticalChance * 4.3, 8);
    expect(stats.criticalMultiplier).toBeCloseTo(cmq * 3.2, 8);
  });

  it("Fury (Claws) R5: +30% attack speed", () => {
    const weapon = requireClaws("chesa_claws");
    expect(withMod("claw_fury").fireRate).toBeCloseTo(weapon.fireRate * 1.3, 8);
  });

  it("Shred (Claws) R5: +30% fire rate (AS)", () => {
    const weapon = requireClaws("chesa_claws");
    expect(withMod("claw_shred").fireRate).toBeCloseTo(weapon.fireRate * 1.3, 8);
  });

  it("Flame / Frost Claws R5: +90% heat / cold from base", () => {
    const weapon = requireClaws("chesa_claws");
    for (const [modId, type] of [
      ["claw_heat", "heat"],
      ["claw_cold", "cold"],
    ] as const) {
      const stats = withMod(modId);
      const scale = stats.moddedBaseDamage / 32;
      expect(stats.elements.find((e) => e.type === type)?.value).toBeCloseTo(
        quantizeDamageValue(weapon.damage * 0.9, scale),
        8,
      );
    }
  });

  it("Magnetic Claws R3: +60% magnetic from base", () => {
    const weapon = requireClaws("chesa_claws");
    const stats = withMod("claw_magnetic");
    const scale = stats.moddedBaseDamage / 32;
    expect(stats.elements.find((e) => e.type === "magnetic")?.value).toBeCloseTo(
      quantizeDamageValue(weapon.damage * 0.6, scale),
      8,
    );
  });

  it("Radon Claws R3: +60% damage / +80% CM / +60% radiation", () => {
    const weapon = requireClaws("chesa_claws");
    const cmq = quantizeBaseCritMultiplier(weapon.criticalMultiplier);
    const stats = withMod("radon_claws");
    expect(stats.moddedBaseDamage).toBeCloseTo(weapon.damage * 1.6, 5);
    expect(stats.criticalMultiplier).toBeCloseTo(cmq * 1.8, 8);
    const scale = stats.moddedBaseDamage / 32;
    // Elemental % is of pre-mod base; IPS quantize uses modded base as scale.
    expect(stats.elements.find((e) => e.type === "radiation")?.value).toBeCloseTo(
      quantizeDamageValue(weapon.damage * 0.6 * 1.6, scale),
      8,
    );
  });

  it("Cull the Weak: conditional damage is panel-only", () => {
    const beh = VERIFIED_MOD_BEHAVIORS.cull_the_weak;
    expect(beh).toBeDefined();
    expect(beh!.stats.every((s) => s.target === "mod_panel")).toBe(true);
  });
});
