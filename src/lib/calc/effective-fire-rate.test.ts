import { describe, expect, it } from "vitest";
import { allMods } from "@/data/mods";
import { allWeapons } from "@/data/weapons";
import { calculateWeaponBuild } from "@/lib/calc/calculator";
import {
  moddedChargeTime,
  resolveEffectiveFireRate,
} from "@/lib/calc/effective-fire-rate";
import { enrichWeapon } from "@/lib/weapon-enrich";

const modsMap = () => new Map(allMods.map((m) => [m.id, m]));

describe("moddedChargeTime", () => {
  it("halves charge time at +100% fire rate", () => {
    expect(moddedChargeTime(1, 1)).toBeCloseTo(0.5, 10);
  });

  it("caps slow charge at 10× base", () => {
    expect(moddedChargeTime(1, -0.95)).toBeCloseTo(10, 10);
  });
});

describe("resolveEffectiveFireRate", () => {
  it("returns modded FR for auto weapons", () => {
    expect(
      resolveEffectiveFireRate({
        triggerType: "Auto",
        baseFireRate: 10,
        moddedFireRate: 19,
        fireRateBonus: 0.9,
        reloadTime: 2,
      }),
    ).toBeCloseTo(19, 10);
  });

  it("uses 1/CT for Lanka mode", () => {
    // +0% FR, 1s charge → 1 shot/s
    expect(
      resolveEffectiveFireRate({
        triggerType: "Sniper",
        baseFireRate: 0,
        moddedFireRate: 0,
        fireRateBonus: 0,
        reloadTime: 2,
        chargeTime: 1,
        chargeMode: "lanka",
        weaponId: "lanka",
      }),
    ).toBeCloseTo(1, 10);
    // +100% FR → 0.5s charge → 2 shots/s
    expect(
      resolveEffectiveFireRate({
        triggerType: "Sniper",
        baseFireRate: 0,
        moddedFireRate: 0,
        fireRateBonus: 1,
        reloadTime: 2,
        chargeTime: 1,
        chargeMode: "lanka",
        weaponId: "lanka",
      }),
    ).toBeCloseTo(2, 10);
  });

  it("uses 1/(CT+reload) for bows", () => {
    // CT 0.5 + reload 0.6 = 1.1s → ~0.909/s
    expect(
      resolveEffectiveFireRate({
        triggerType: "Bow",
        baseFireRate: 1,
        moddedFireRate: 1,
        fireRateBonus: 0,
        reloadTime: 0.6,
        chargeTime: 0.5,
        chargeMode: "bow",
      }),
    ).toBeCloseTo(1 / 1.1, 5);
  });

  it("uses 1/(CT+1/FR) for standard charge", () => {
    // CT 2 + 1/1 = 3s → 1/3 shots/s
    expect(
      resolveEffectiveFireRate({
        triggerType: "Charge",
        baseFireRate: 1,
        moddedFireRate: 1,
        fireRateBonus: 0,
        reloadTime: 2,
        chargeTime: 2,
        chargeMode: "standard",
      }),
    ).toBeCloseTo(1 / 3, 5);
  });

  it("burst: BurstCount / (1/FR + (n-1)*delay)", () => {
    // 3-round, FR=10, delay=0.04 → 3 / (0.1 + 0.08) = 3/0.18
    expect(
      resolveEffectiveFireRate({
        triggerType: "Burst",
        baseFireRate: 10,
        moddedFireRate: 10,
        fireRateBonus: 0,
        reloadTime: 2,
        burstCount: 3,
        burstDelay: 0.04,
      }),
    ).toBeCloseTo(3 / 0.18, 5);
  });
});

describe("calculateWeaponBuild charge integration", () => {
  it("gives Lanka positive effective fire rate and DPS", () => {
    const lanka = allWeapons.find((w) => w.id === "lanka");
    if (!lanka) return;
    const stats = calculateWeaponBuild(lanka, [], modsMap());
    expect(stats.effectiveFireRate).toBeGreaterThan(0.5);
    expect(stats.burstDps).toBeGreaterThan(0);
    expect(stats.totalDamage).toBeCloseTo(lanka.damage, 0);
  });

  it("scales Paris bow effective FR with fire rate mods", () => {
    const paris = allWeapons.find((w) => w.id === "paris");
    const speed = allMods.find(
      (m) =>
        (m.id === "speed_trigger" || m.id === "speed_trigger_r3" || m.stats.fireRate) &&
        (m.category === "rifle" || m.category === "primary" || m.category === "bow"),
    );
    if (!paris || !speed) return;
    const base = calculateWeaponBuild(paris, [], modsMap());
    const modded = calculateWeaponBuild(
      paris,
      [{ modId: speed.id, rank: speed.maxRank, slotIndex: 0 }],
      modsMap(),
    );
    expect(modded.effectiveFireRate!).toBeGreaterThan(base.effectiveFireRate!);
  });

  it("fills pure-element Amprex electricity via enrich", () => {
    const amprex = enrichWeapon(allWeapons.find((w) => w.id === "amprex")!);
    expect(amprex.electricity).toBeGreaterThan(0);
    const stats = calculateWeaponBuild(amprex, [], modsMap());
    expect(stats.elements.some((e) => e.type === "electricity")).toBe(true);
    expect(stats.totalDamage).toBeCloseTo(amprex.damage, 5);
  });
});
