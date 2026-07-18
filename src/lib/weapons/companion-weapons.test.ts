import { describe, expect, it } from "vitest";
import { allCompanions } from "@/data/companions";
import { getCompanionWeapons } from "@/lib/weapons/companion-weapons";
import type { Weapon } from "@/lib/types";

const beastClaws: Weapon[] = [
  {
    id: "vizier_claws",
    name: "Vizier Claws",
    category: "beast_claw",
    companionType: "predasite",
    damage: 100,
    fireRate: 1,
    criticalChance: 0.1,
    criticalMultiplier: 2,
    statusChance: 0.1,
    triggerType: "Melee",
  },
  {
    id: "pharaoh_claws",
    name: "Pharaoh Claws",
    category: "beast_claw",
    companionType: "predasite",
    damage: 100,
    fireRate: 1,
    criticalChance: 0.1,
    criticalMultiplier: 2,
    statusChance: 0.1,
    triggerType: "Melee",
  },
  {
    id: "medjay_claws",
    name: "Medjay Claws",
    category: "beast_claw",
    companionType: "predasite",
    damage: 100,
    fireRate: 1,
    criticalChance: 0.1,
    criticalMultiplier: 2,
    statusChance: 0.1,
    triggerType: "Melee",
  },
];

describe("getCompanionWeapons", () => {
  it("returns only the matching predasite claws per breed", () => {
    const vizier = allCompanions.find((c) => c.id === "vizier_predasite")!;
    const pharaoh = allCompanions.find((c) => c.id === "pharaoh_predasite")!;
    const medjay = allCompanions.find((c) => c.id === "medjay_predasite")!;

    expect(getCompanionWeapons(vizier, beastClaws).map((w) => w.id)).toEqual(["vizier_claws"]);
    expect(getCompanionWeapons(pharaoh, beastClaws).map((w) => w.id)).toEqual(["pharaoh_claws"]);
    expect(getCompanionWeapons(medjay, beastClaws).map((w) => w.id)).toEqual(["medjay_claws"]);
  });
});
