import { describe, expect, it } from "vitest";
import { calculateRailjackBuild } from "@/lib/calc/railjack-calculator";

describe("calculateRailjackBuild", () => {
  it("adds component stats to base hull, shield, speed, and flux", () => {
    const stats = calculateRailjackBuild({
      reactorId: "lavan_reactor_mk3",
      shieldId: "lavan_shield_mk3",
      engineId: "lavan_engine_mk3",
      platingId: "lavan_plating_mk3",
    });

    expect(stats.hull).toBe(3000 + 1500);
    expect(stats.armor).toBe(300 + 100);
    expect(stats.shield).toBe(1500 + 800);
    expect(stats.shieldRecharge).toBe(50); // Lavan Shield Mk III
    expect(stats.speed).toBe(100 + 80);
    expect(stats.boostSpeed).toBe(200 + 100);
    expect(stats.fluxCapacity).toBe(200 + 200);
    expect(stats.avionicsCapacity).toBe(30);
  });

  it("applies ironclad matrix hull, armor, shield, and recharge bonuses", () => {
    const stats = calculateRailjackBuild({
      platingId: "sigma_plating_mk3",
      integratedMods: [{ modId: "ironclad_matrix", rank: 5, slotIndex: 0 }],
    });

    const baseHull = 3000 + 1000;
    const baseArmor = 300 + 150;
    expect(stats.hull).toBe(Math.round(baseHull * (1 + 0.225)));
    expect(stats.armor).toBe(Math.round(baseArmor * (1 + 0.225)));
  });

  it("supports two turret hardpoints and applies turret damage mods", () => {
    const stats = calculateRailjackBuild({
      turretIds: ["zetki_apoc", "vidar_pulsar"],
      integratedMods: [{ modId: "hyperstrike", rank: 5, slotIndex: 0 }],
    });

    expect(stats.turrets).toHaveLength(2);
    expect(stats.turretDamageBonus).toBeGreaterThan(0);
    expect(stats.turrets[0]!.damage).toBeGreaterThan(748);
    expect(stats.turrets[1]!.estimatedDps).toBeGreaterThan(0);
  });

  it("migrates legacy single turretId saves", () => {
    const stats = calculateRailjackBuild({
      turretId: "sigma_apoc",
    });

    expect(stats.turrets).toHaveLength(1);
    expect(stats.turrets[0]!.id).toBe("sigma_apoc");
  });

  it("applies Crimson Fugue stacks only when simulated", () => {
    const without = calculateRailjackBuild({
      integratedMods: [{ modId: "crimson_fugue", rank: 10, slotIndex: 0 }],
      simulation: { crimsonFugueStacks: 0 },
    });
    const withStacks = calculateRailjackBuild({
      integratedMods: [{ modId: "crimson_fugue", rank: 10, slotIndex: 0 }],
      simulation: { crimsonFugueStacks: 5 },
    });

    expect(without.turretDamageBonus).toBe(0);
    expect(withStacks.turretDamageBonus).toBeGreaterThan(1);
  });

  it("applies Cruising Speed only when active", () => {
    const inactive = calculateRailjackBuild({
      engineId: "lavan_engine_mk3",
      integratedMods: [{ modId: "cruising_speed", rank: 10, slotIndex: 0 }],
      simulation: { cruisingSpeedActive: false },
    });
    const active = calculateRailjackBuild({
      engineId: "lavan_engine_mk3",
      integratedMods: [{ modId: "cruising_speed", rank: 10, slotIndex: 0 }],
      simulation: { cruisingSpeedActive: true },
    });

    expect(active.speed).toBeGreaterThan(inactive.speed);
  });

  it("includes Mk IV components and ordnance", () => {
    const stats = calculateRailjackBuild({
      reactorId: "lavan_reactor_mk4",
      ordnanceId: "zetki_tycho_seeker_mk4",
      turretIds: ["zetki_apoc_mk4"],
    });

    expect(stats.fluxCapacity).toBeGreaterThan(200);
    expect(stats.ordnance?.damage).toBeGreaterThan(3400);
    expect(stats.turrets[0]!.damage).toBeGreaterThan(748);
  });

  it("applies elite crew gunnery bonus and battle abilities", () => {
    const stats = calculateRailjackBuild({
      eliteCrewId: "vena",
      reactorId: "zetki_reactor_mk3",
      battleMods: [{ modId: "phoenix_blaze", rank: 0, slotIndex: 0 }],
      simulation: { activeBattleAbilityId: "phoenix_blaze" },
    });

    expect(stats.crewBonuses?.turretDamageBonus).toBeGreaterThan(0);
    expect(stats.battleAbilities).toHaveLength(1);
    expect(stats.battleAbilities![0]!.name).toBe("Phoenix Blaze");
    expect(stats.abilityTurretDamageBonus).toBeGreaterThan(0.5);
  });
});
