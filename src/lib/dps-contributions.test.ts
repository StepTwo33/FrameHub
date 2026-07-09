import { describe, expect, it } from "vitest";
import { computeDpsContributions } from "@/lib/dps-contributions";
import { calculateWeaponBuild } from "@/lib/calculator";
import { allMods } from "@/data/mods";
import type { Mod, ModSlot, Weapon } from "@/lib/types";
import { DEFAULT_SIM_PARAMS } from "@/lib/types";

const modsMap = new Map(allMods.map((m) => [m.id, m]));

const testPistol: Weapon = {
  id: "test_pistol",
  name: "Test Pistol",
  category: "secondary",
  damage: 100,
  impact: 100,
  puncture: 0,
  slash: 0,
  fireRate: 1,
  criticalChance: 0,
  criticalMultiplier: 1.5,
  statusChance: 0,
  magazine: 0,
  reloadTime: 0,
  multishot: 1,
  triggerType: "Semi-Auto",
  modSlots: 8,
  hasPrimaryArcaneSlot: false,
  hasSecondaryArcaneSlot: true,
  isIncarnon: false,
  hasRivenSlot: true,
};

function fakeDamageMod(id: string, name: string, perRank: number, maxRank: number): Mod {
  return {
    id,
    name,
    polarity: "madurai",
    drain: 4,
    maxRank,
    category: "secondary",
    stats: { damage: perRank },
    description: `+${perRank * (maxRank + 1)}% Damage`,
    rarity: "uncommon",
  };
}

describe("computeDpsContributions", () => {
  it("shows diminishing returns for stacked damage mods", () => {
    const modA = fakeDamageMod("dmg_a", "Damage A", 9, 9); // +90% at rank 9
    const modB = fakeDamageMod("dmg_b", "Damage B", 6, 9); // +60% at rank 9
    const localMap = new Map(modsMap);
    localMap.set(modA.id, modA);
    localMap.set(modB.id, modB);

    const slots: ModSlot[] = [
      { modId: modA.id, rank: 9, slotIndex: 0 },
      { modId: modB.id, rank: 9, slotIndex: 1 },
    ];

    const contributions = computeDpsContributions({
      baseWeapon: testPistol,
      modSlots: slots,
      allMods: localMap,
      simParams: DEFAULT_SIM_PARAMS,
    });

    const modBContrib = contributions.find((c) => c.id.includes("dmg_b"));
    expect(modBContrib).toBeDefined();
    // 250% / 190% - 1 ≈ 31.6%
    expect(modBContrib!.burstMarginalPct).toBeCloseTo(31.58, 0);
  });

  it("matches full minus without recalculation for a single mod", () => {
    const serration = modsMap.get("serration_r3")!;
    const slots: ModSlot[] = [{ modId: serration.id, rank: 10, slotIndex: 0 }];
    const ctx = {
      baseWeapon: testPistol,
      modSlots: slots,
      allMods: modsMap,
      simParams: DEFAULT_SIM_PARAMS,
    };
    const full = calculateWeaponBuild(testPistol, slots, modsMap, undefined, DEFAULT_SIM_PARAMS);
    const without = calculateWeaponBuild(testPistol, [], modsMap, undefined, DEFAULT_SIM_PARAMS);
    const expected = ((full.burstDps - without.burstDps) / without.burstDps) * 100;

    const contributions = computeDpsContributions(ctx);
    expect(contributions[0]?.burstMarginalPct).toBeCloseTo(expected, 1);
  });
});
