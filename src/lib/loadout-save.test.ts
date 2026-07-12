import { describe, expect, it } from "vitest";
import { calcLoadoutStats } from "@/lib/loadout-stats";
import {
  loadoutFromSavedBuild,
  loadoutToBuildData,
  normalizeLoadoutBuildData,
} from "@/lib/loadouts";
import type { Loadout } from "@/lib/types";
import type { SavedBuild } from "@/lib/build-storage";
import { getEffectiveWeapons } from "@/lib/effective-data";

/** Minimal imported Player Sync shape (Pharaoh Predasite + slots). */
function importedLoadoutFixture(): Loadout {
  return {
    id: "local_1",
    name: "Step-Bro_Prime — Imported Loadout",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    warframeBuild: {
      warframeId: "gara",
      mods: [
        { modId: "steel_fiber", rank: 10, slotIndex: 0 },
        { modId: "vitality", rank: 10, slotIndex: 1 },
      ],
      shards: [null, null, null, null, null],
      arcaneIds: [null, null],
      hasOrokinReactor: false,
      isMR30: true,
      slotPolarities: {},
    },
    primaryBuild: {
      weaponId: "braton_prime",
      mods: [{ modId: "serration", rank: 10, slotIndex: 0 }],
      arcaneIds: [null, null],
      hasOrokinCatalyst: false,
      isMR30: true,
      slotPolarities: {},
    },
    companionBuild: {
      companionId: "pharaoh_predasite",
      customName: "King of Covid",
      mods: [{ modId: "link_health", rank: 10, slotIndex: 0 }],
      weaponId: "pharaoh_claws",
      weaponMods: [{ modId: "claws_ferocity", rank: 10, slotIndex: 0 }],
      hasReactor: false,
      hasCatalyst: false,
      isMR30: true,
    },
  };
}

describe("loadout cloud save round-trip", () => {
  it("normalizes imported slot payloads for JSON POST", () => {
    const data = loadoutToBuildData(importedLoadoutFixture());
    expect(data.companionBuild?.weaponMods).toHaveLength(1);
    expect(data.companionBuild?.hasReactor).toBe(false);
    expect(data.companionBuild?.weaponSlotPolarities).toEqual({});
    expect(() => JSON.stringify(data)).not.toThrow();
  });

  it("survives saved-build round-trip and damage calc", () => {
    const local = importedLoadoutFixture();
    const build: SavedBuild = {
      id: "cloud_1",
      name: local.name,
      type: "loadout",
      createdAt: local.createdAt,
      updatedAt: local.updatedAt,
      data: normalizeLoadoutBuildData(loadoutToBuildData(local)),
    };

    const restored = loadoutFromSavedBuild(build);
    expect(restored.companionBuild?.weaponId).toBe("pharaoh_claws");

    const stats = calcLoadoutStats(
      { ...restored, id: local.id },
      { allWeapons: getEffectiveWeapons() },
    );
    expect(stats.warframe).not.toBeNull();
    expect(stats.companion?.weapon).not.toBeNull();
  });
});
