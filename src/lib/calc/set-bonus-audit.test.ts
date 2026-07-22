/**
 * Set-bonus accuracy goldens (wiki Augur / Hunter / Mecha / Umbral).
 */
import { describe, expect, it } from "vitest";
import { allMods } from "@/data/mods";
import { allWarframes } from "@/data/warframes";
import { calculateWarframeBuild } from "@/lib/calc/calculator";
import {
  augurShieldsFromEnergySpent,
  buildWarframeSetBonusSummary,
  countAugurSetPieces,
  countHunterSetPieces,
} from "@/lib/calc/set-bonuses";
import { scaledAbilityEnergyCost } from "@/lib/codex/ability-misc-stats";
import { resolveWeaponExternalBuffs } from "@/lib/weapons/weapon-external-buffs";
import type { Ability, SimulationParams, WarframeCalculatedStats, Weapon } from "@/lib/types";
import { DEFAULT_SIM_PARAMS } from "@/lib/types";

const modsMap = () => new Map(allMods.map((m) => [m.id, m]));

describe("Augur set (wiki: +40% energy→shields per piece)", () => {
  it("scales panel percent with piece count (not only at 6)", () => {
    const excal = allWarframes.find((w) => w.id === "excalibur")!;
    const pieces = ["augur_message", "augur_reach", "augur_secrets"].map((id, i) => {
      const m = allMods.find((x) => x.id === id)!;
      return { modId: id, rank: m.maxRank, slotIndex: i };
    });
    expect(countAugurSetPieces(pieces)).toBe(3);

    const stats = calculateWarframeBuild(excal, pieces, modsMap());
    expect(stats.augurEnergyToShieldsPercent).toBe(120);

    const summary = buildWarframeSetBonusSummary(pieces);
    const aug = summary.find((s) => s.setId === "augur")!;
    expect(aug.active).toBe(true);
    expect(aug.pieces).toBe(3);
  });

  it("reaches 240% at 6 pieces including Augur Pact + Augur Seeker on secondary", () => {
    // Wiki: 4 Warframe + 2 pistol (Pact=`augur_breach`, Seeker=`augur_seeker`).
    const wfMods = ["augur_message", "augur_reach", "augur_secrets", "augur_accord"].map((id, i) => ({
      modId: id,
      rank: 3,
      slotIndex: i,
    }));
    const secondary = [
      { modId: "augur_breach", rank: 5, slotIndex: 0 },
      { modId: "augur_seeker", rank: 5, slotIndex: 1 },
    ];
    expect(countAugurSetPieces(wfMods, secondary)).toBe(6);
    const excal = allWarframes.find((w) => w.id === "excalibur")!;
    const stats = calculateWarframeBuild(excal, wfMods, modsMap(), {
      secondaryMods: secondary,
    });
    expect(stats.augurEnergyToShieldsPercent).toBe(240);
  });

  it("converts spent energy to shields at 40%/piece after Ability Efficiency", () => {
    // 3 pieces × 25 energy (100% EFF) → 30 shields; with 130% EFF cost drops to 17.5 → 21 shields
    expect(augurShieldsFromEnergySpent(25, 3)).toBe(30);
    expect(augurShieldsFromEnergySpent(0, 3)).toBe(0);
    expect(augurShieldsFromEnergySpent(25, 0)).toBe(0);
    const spent = scaledAbilityEnergyCost(25, 1.3);
    expect(spent).toBeCloseTo(17.5, 5);
    expect(augurShieldsFromEnergySpent(spent, 3)).toBeCloseTo(21, 5);
    expect(augurShieldsFromEnergySpent(scaledAbilityEnergyCost(25, 1), 6)).toBe(60);
  });
});

describe("Hunter set (wiki: +25% companion dmg per piece)", () => {
  it("scales with piece count", () => {
    const excal = allWarframes.find((w) => w.id === "excalibur")!;
    const hunterAdrenaline = allMods.find((m) => m.id === "hunter_adrenaline")!;
    const slots = [{ modId: "hunter_adrenaline", rank: hunterAdrenaline.maxRank, slotIndex: 0 }];
    expect(countHunterSetPieces(undefined, slots)).toBe(1);
    const stats = calculateWarframeBuild(excal, slots, modsMap());
    expect(stats.hunterCompanionVsStatusDamagePercent).toBe(25);
  });
});

describe("Mecha set summary (wiki: mark + status spread, not explosion DPS)", () => {
  it("describes mark/spread, not +150% explosion", () => {
    const slots = [{ modId: "mecha_pulse_r3", rank: 3, slotIndex: 0 }];
    const line = buildWarframeSetBonusSummary(slots).find((s) => s.setId === "mecha")!;
    expect(line.active).toBe(true);
    expect(line.description.toLowerCase()).toMatch(/mark/);
    expect(line.description.toLowerCase()).not.toMatch(/explode/);
  });
});

describe("weapon damageBuff gating (verified abilities only)", () => {
  const rifle: Weapon = {
    id: "t",
    name: "T",
    category: "rifle",
    damage: 100,
    impact: 100,
    puncture: 0,
    slash: 0,
    fireRate: 1,
    criticalChance: 0.2,
    criticalMultiplier: 2,
    statusChance: 0,
    magazine: 30,
    reloadTime: 2,
    multishot: 1,
    triggerType: "Auto",
    modSlots: 8,
    hasPrimaryArcaneSlot: false,
    hasSecondaryArcaneSlot: false,
    isIncarnon: false,
    hasRivenSlot: true,
  };

  const wfStats = {
    abilityStrength: 2,
  } as WarframeCalculatedStats;

  it("does not treat Breach Surge spark mult as a weapon damage buff", () => {
    const surge: Ability = {
      name: "Breach Surge",
      energyCost: 50,
      description: "sparks",
      // legacy mistaken field — must not apply even if present
      damageBuff: 2,
    };
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Breach Surge"],
    };
    const buffs = resolveWeaponExternalBuffs(
      rifle,
      { warframeId: "wisp", warframeStats: wfStats, warframeAbilities: [surge] },
      sim,
    );
    expect(buffs.filter((b) => b.label === "Breach Surge")).toHaveLength(0);
  });

  it("still applies verified Roar", () => {
    const roar: Ability = { name: "Roar", energyCost: 75, description: "", damageBuff: 0.5 };
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Roar"],
    };
    const buffs = resolveWeaponExternalBuffs(
      rifle,
      { warframeId: "rhino", warframeStats: wfStats, warframeAbilities: [roar] },
      sim,
    );
    expect(buffs).toHaveLength(1);
    expect(buffs[0]!.damageMultBonus).toBeCloseTo(1.0, 5);
  });
});
