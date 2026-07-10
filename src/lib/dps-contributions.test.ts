import { describe, expect, it } from "vitest";
import { computeDpsContributions } from "@/lib/dps-contributions";
import { calculateWeaponBuild } from "@/lib/calculator";
import { allMods } from "@/data/mods";
import type { ModSlot, Weapon } from "@/lib/types";
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

describe("computeDpsContributions", () => {
  it("shows diminishing returns for stacked damage mods", () => {
    // Use verified secondary damage mods (fake IDs have no mod-behavior entry).
    const hornet = modsMap.get("hornet_strike") ?? modsMap.get("hornet_strike_r3");
    const augur = modsMap.get("augur_pact") ?? modsMap.get("augur_pact_r3");
    // Fallback: any two verified secondary damage mods
    const dmgMods = allMods.filter(
      (m) =>
        (m.category === "secondary" || m.category === "pistol") &&
        m.stats.damage != null &&
        m.id !== "shrapnel_rounds",
    );
    const modA = hornet ?? dmgMods[0];
    const modB = augur ?? dmgMods.find((m) => m.id !== modA?.id);
    expect(modA).toBeDefined();
    expect(modB).toBeDefined();

    const slots: ModSlot[] = [
      { modId: modA!.id, rank: modA!.maxRank, slotIndex: 0 },
      { modId: modB!.id, rank: modB!.maxRank, slotIndex: 1 },
    ];

    const contributions = computeDpsContributions({
      baseWeapon: testPistol,
      modSlots: slots,
      allMods: modsMap,
      simParams: DEFAULT_SIM_PARAMS,
    });

    const modBContrib = contributions.find((c) => c.id.includes(modB!.id));
    expect(modBContrib).toBeDefined();
    // Second damage mod is strictly less valuable than stacking on empty (diminishing returns).
    expect(modBContrib!.burstMarginalPct).toBeGreaterThan(0);
    const alone = computeDpsContributions({
      baseWeapon: testPistol,
      modSlots: [{ modId: modB!.id, rank: modB!.maxRank, slotIndex: 0 }],
      allMods: modsMap,
      simParams: DEFAULT_SIM_PARAMS,
    });
    const alonePct = alone.find((c) => c.id.includes(modB!.id))?.burstMarginalPct ?? 0;
    expect(modBContrib!.burstMarginalPct).toBeLessThan(alonePct);
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
