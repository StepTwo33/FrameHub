import { describe, expect, it } from "vitest";
import {
  fingerprintEvent,
  type WorldstateSnapshot,
} from "@/lib/bot/worldstate-client";
import { BOT_EVENT_TYPE_IDS } from "@/lib/bot/alert-types";
import {
  embedBaro,
  embedBounties,
  embedDarvo,
  embedSortie,
  embedTeshin,
  embedVarzia,
  embedWorldstate,
} from "@/lib/bot/embeds";

const sample: WorldstateSnapshot = {
  platform: "pc",
  fetchedAt: new Date().toISOString(),
  sortie: {
    id: "sortie-1",
    boss: "Kela De Thaym",
    faction: "Grineer",
    expiry: "2030-01-01T00:00:00.000Z",
    missions: [{ node: "Sedna", missionType: "Exterminate", modifier: "Energy Reduction" }],
  },
  archonHunt: { id: "archon-1", boss: "Archon Nira", expiry: "2030-01-08T00:00:00.000Z" },
  arbitration: {
    node: "Hydron",
    type: "Defense",
    enemy: "Grineer",
    expiry: "2030-01-01T01:00:00.000Z",
  },
  voidTrader: {
    active: true,
    location: "Larunda Relay",
    activation: "2029-12-01T00:00:00.000Z",
    expiry: "2030-01-02T00:00:00.000Z",
    inventory: [{ item: "Primed Chamber", ducats: 1000, credits: 100000 }],
  },
  voidTraders: [],
  vaultTrader: {
    character: "Varzia",
    location: "Maroo's Bazaar (Mars)",
    activation: "2029-12-01T00:00:00.000Z",
    expiry: "2030-02-01T00:00:00.000Z",
    inventory: [{ item: "Titania Prime", ducats: 6 }],
  },
  dailyDeals: [
    {
      id: "deal-1",
      item: "Vauban",
      originalPrice: 300,
      salePrice: 150,
      discount: 50,
      total: 100,
      sold: 10,
      expiry: "2030-01-01T12:00:00.000Z",
    },
  ],
  steelPath: {
    currentReward: { name: "Shotgun Riven Mod", cost: 75 },
    activation: "2030-01-01T00:00:00.000Z",
    expiry: "2030-01-08T00:00:00.000Z",
    remaining: "6d",
    incursions: { id: "spi:1" },
  },
  nightwave: {
    season: 17,
    tag: "Intermission",
    phase: 0,
    activeChallenges: [
      { id: "d1", title: "Warning Shot", desc: "Kill 200 Enemies", isDaily: true, reputation: 1000 },
    ],
  },
  syndicateMissions: [
    {
      id: "ostron-1",
      syndicate: "Ostrons",
      expiry: "2030-01-01T02:00:00.000Z",
      jobs: [{ id: "job-a", minEnemyLevel: 5, maxEnemyLevel: 15, standingStages: [100, 200] }],
    },
    {
      id: "solaris-1",
      syndicate: "Solaris United",
      expiry: "2030-01-01T02:00:00.000Z",
      jobs: [{ id: "job-b", minEnemyLevel: 10, maxEnemyLevel: 20 }],
    },
  ],
  simaris: { target: "Guardsman", isTargetActive: true },
  cetusCycle: { state: "day", isDay: true, timeLeft: "30m" },
  vallisCycle: { state: "cold", isWarm: false },
  cambionCycle: { active: "fass", state: "fass" },
  duviriCycle: { state: "joy" },
  earthCycle: { state: "night", isDay: false },
};

describe("fingerprintEvent", () => {
  it("changes when cycle state flips", () => {
    const day = fingerprintEvent("cetus", sample)!;
    const nightSnap = {
      ...sample,
      cetusCycle: { state: "night", isDay: false },
    };
    const night = fingerprintEvent("cetus", nightSnap)!;
    expect(day).not.toBe(night);
  });

  it("tracks vendor transitions separately", () => {
    expect(fingerprintEvent("darvo", sample)).toContain("deal-1");
    expect(fingerprintEvent("varzia", sample)).toContain("Titania");
    expect(fingerprintEvent("teshin", sample)).toContain("Shotgun Riven");
    expect(fingerprintEvent("bounties", sample)).toContain("Ostrons");
    expect(fingerprintEvent("simaris", sample)).toContain("Guardsman");
  });

  it("covers all bot event types on sample data", () => {
    for (const id of BOT_EVENT_TYPE_IDS) {
      expect(fingerprintEvent(id, sample), id).toBeTruthy();
    }
  });
});

describe("embeds", () => {
  it("builds sortie, baro, and vendor titles", () => {
    expect(embedSortie(sample.sortie).title).toContain("Kela");
    expect(embedBaro(sample.voidTrader).title).toContain("Baro");
    expect(embedVarzia(sample.vaultTrader).title).toContain("Varzia");
    expect(embedDarvo(sample.dailyDeals).title).toContain("Darvo");
    expect(embedTeshin(sample.steelPath).title).toContain("Teshin");
    expect(embedBounties(sample).fields?.length).toBeGreaterThan(0);
    expect(embedWorldstate(sample).fields?.length).toBeGreaterThan(0);
  });
});
