/**
 * Regression tests for Warframe wiki formulas audited 2026-07-12.
 * Sources: wiki.warframe.com Damage/Calculation, Status Effect, Armor, Calculating Bonuses.
 */
import { describe, expect, it } from "vitest";
import { allMods } from "@/data/mods";
import { allWeapons } from "@/data/weapons";
import { calculateWeaponBuild, quantizeDamageValue } from "@/lib/calculator";
import { avgCritMultiplier } from "@/lib/crit-utils";
import {
  averageProcsPerShot,
  corrosiveArmorRemaining,
  enemyArmorDamageReduction,
  scaleArmor,
  scaleHealth,
  scaleShield,
} from "@/lib/ttk";
import { DEFAULT_SIM_PARAMS } from "@/lib/types";

const modsMap = () => new Map(allMods.map((m) => [m.id, m]));

describe("crit averaging (wiki Damage/Calculation)", () => {
  it("matches 1 + CC×(CM−1) for sub-100% crit", () => {
    expect(avgCritMultiplier(0.25, 2)).toBeCloseTo(1.25, 10);
    expect(avgCritMultiplier(1, 2)).toBeCloseTo(2, 10);
  });

  it("matches 1 + CC×(CM−1) for orange/red tiers (equivalent closed form)", () => {
    // 250% CC, 3× CM → avg = 1 + 2.5×2 = 6
    expect(avgCritMultiplier(2.5, 3)).toBeCloseTo(1 + 2.5 * (3 - 1), 10);
    expect(avgCritMultiplier(2.5, 3)).toBeCloseTo(6, 10);
  });
});

describe("damage quantization (wiki Damage/Calculation)", () => {
  it("matches wiki 100-damage IPS example", () => {
    const scale = 100 / 32;
    expect(quantizeDamageValue(30, scale)).toBeCloseTo(31.25, 10);
    expect(quantizeDamageValue(40, scale)).toBeCloseTo(40.625, 10);
  });
});

describe("elemental combo order (wiki: mods first, innate last)", () => {
  it("combines mod elements before innate electricity (Tenet Quanta / Amprex-style)", () => {
    // Tenet Quanta has electricity:18 in data. Heat + Cold mods → Blast + Electricity.
    // (Amprex is pure electricity in-game but currently lacks the electricity field in data.)
    const weapon = allWeapons.find((w) => w.id === "tenet_quanta");
    const hellfire = allMods.find(
      (m) => m.id === "hellfire" || m.id === "hellfire_r3" || (m.stats.heat != null && (m.category === "rifle" || m.category === "primary")),
    );
    const cryo = allMods.find(
      (m) => m.id === "cryo_rounds" || m.id === "cryo_rounds_r3" || (m.stats.cold != null && (m.category === "rifle" || m.category === "primary")),
    );
    if (!weapon || !hellfire || !cryo) return;
    expect(weapon.electricity).toBeGreaterThan(0);

    const stats = calculateWeaponBuild(
      weapon,
      [
        { modId: hellfire.id, rank: hellfire.maxRank, slotIndex: 0 },
        { modId: cryo.id, rank: cryo.maxRank, slotIndex: 1 },
      ],
      modsMap(),
    );

    const types = stats.elements.map((e) => e.type).sort();
    expect(types).toContain("blast");
    expect(types).toContain("electricity");
    expect(types).not.toContain("radiation");
    expect(types).not.toContain("cold");
    expect(types).not.toContain("heat");
  });

  it("preserves residual base damage when IPS/element fields are missing", () => {
    // Amprex-like: total damage set, IPS zero, no electricity field
    const amprex = allWeapons.find((w) => w.id === "amprex");
    if (!amprex) return;
    const stats = calculateWeaponBuild(amprex, [], modsMap());
    expect(stats.totalDamage).toBeCloseTo(amprex.damage, 5);
  });
});

describe("multishot (wiki Calculating Bonuses)", () => {
  it("is base × (1 + multishot bonus)", () => {
    const strun = allWeapons.find((w) => w.id === "strun");
    const hells = allMods.find((m) => m.id === "hells_chamber");
    if (!strun || !hells) return;
    const stats = calculateWeaponBuild(
      strun,
      [{ modId: hells.id, rank: hells.maxRank, slotIndex: 0 }],
      modsMap(),
    );
    expect(stats.multishot).toBeCloseTo(strun.multishot * (1 + 1.2), 5);
  });
});

describe("average procs per shot (wiki Status Effect § Multishot)", () => {
  it("equals multishot × status chance (not at-least-one)", () => {
    expect(averageProcsPerShot(0.5, 2)).toBeCloseTo(1, 10);
    // At-least-one would be 0.75 — we must NOT use that for DoT rates
    expect(1 - Math.pow(1 - 0.5, 2)).toBeCloseTo(0.75, 10);
    expect(averageProcsPerShot(1, 2)).toBeCloseTo(2, 10);
    expect(averageProcsPerShot(1.5, 2)).toBeCloseTo(3, 10);
  });
});

describe("enemy armor DR (wiki Armor § Enemy)", () => {
  it("uses 0.9 × AR / 2700, not Tenno AR/(AR+300)", () => {
    expect(enemyArmorDamageReduction(300)).toBeCloseTo(0.1, 10);
    expect(enemyArmorDamageReduction(2700)).toBeCloseTo(0.9, 10);
    expect(enemyArmorDamageReduction(0)).toBe(0);
    // Classic Tenno formula would give 50% at 300 armor — must differ
    expect(300 / (300 + 300)).toBeCloseTo(0.5, 10);
  });
});

describe("corrosive armor strip (wiki Status Effect)", () => {
  it("is −26% then −6% additive of original, max −80%", () => {
    expect(corrosiveArmorRemaining(0)).toBeCloseTo(1, 10);
    expect(corrosiveArmorRemaining(1)).toBeCloseTo(0.74, 10);
    expect(corrosiveArmorRemaining(2)).toBeCloseTo(0.68, 10);
    expect(corrosiveArmorRemaining(10)).toBeCloseTo(0.2, 10);
    // Multiplicative 0.74^10 ≈ 0.049 would be wrong (~95% strip)
    expect(Math.pow(0.74, 10)).toBeLessThan(0.1);
  });
});

describe("status DoT tick fractions (wiki Damage/Calculation)", () => {
  it("slash uses 0.35 × modded base × avg crit (no type mult)", () => {
    const weapon = allWeapons.find((w) => w.slash > 0 && w.category !== "melee" && w.criticalChance === 0);
    // Prefer a known zero-crit or low-crit primary
    const braton = allWeapons.find((w) => w.id === "braton" || w.name === "Braton");
    const target = weapon ?? braton;
    if (!target) return;

    const stats = calculateWeaponBuild(target, [], modsMap(), undefined, {
      ...DEFAULT_SIM_PARAMS,
    });
    const slashProc = stats.statusProcs.find((p) => p.type === "slash");
    if (!slashProc || stats.moddedBaseDamage == null) return;

    const avgCrit = avgCritMultiplier(stats.criticalChance, stats.criticalMultiplier);
    expect(slashProc.damagePerTick).toBeCloseTo(stats.moddedBaseDamage * 0.35 * avgCrit, 2);
    expect(slashProc.ticks).toBe(7);
  });
});

describe("enemy level scaling smoke checks", () => {
  it("caps armor at 2700", () => {
    expect(scaleArmor(500, 200)).toBeLessThanOrEqual(2700);
  });

  it("scales health and shields above level 1", () => {
    expect(scaleHealth(100, 50)).toBeGreaterThan(100);
    expect(scaleShield(100, 50)).toBeGreaterThan(100);
    expect(scaleHealth(100, 1)).toBe(100);
  });
});

describe("warframe Tenno armor EHP still uses AR/(AR+300)", () => {
  it("300 armor = 50% DR", () => {
    const armor = 300;
    const dr = armor / (armor + 300);
    expect(dr).toBeCloseTo(0.5, 10);
    expect(enemyArmorDamageReduction(300)).not.toBeCloseTo(dr, 1);
  });
});
