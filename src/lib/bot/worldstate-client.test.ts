import { describe, expect, it } from "vitest";
import {
  addedFingerprintIds,
  fingerprintEvent,
  type WorldstateSnapshot,
} from "@/lib/bot/worldstate-client";
import { BOT_EVENT_TYPE_IDS } from "@/lib/bot/alert-types";
import {
  embedAlerts,
  embedArchimedea,
  embedBaro,
  embedBounties,
  embedConstruction,
  embedDarvo,
  embedFissures,
  embedInvasions,
  embedNews,
  embedSentientOutpost,
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
  zarimanCycle: { state: "corpus" },
  alerts: [
    {
      id: "alert-1",
      expiry: "2030-01-01T00:00:00.000Z",
      mission: {
        description: "Gift From The Lotus",
        node: "Apollo (Lua)",
        type: "Disruption",
        faction: "Corpus",
        reward: { items: ["Orokin Catalyst Blueprint"], credits: 25000 },
        minEnemyLevel: 10,
        maxEnemyLevel: 15,
      },
    },
  ],
  invasions: [
    {
      id: "inv-1",
      node: "Acheron (Pluto)",
      desc: "Grineer Offensive",
      attacker: { faction: "Grineer", reward: { countedItems: [{ count: 3, type: "Detonite Injector" }] } },
      defender: { faction: "Corpus", reward: { countedItems: [{ count: 3, type: "Fieldron" }] } },
      completed: false,
      completion: 42,
    },
    {
      id: "inv-done",
      node: "Ose (Europa)",
      completed: true,
    },
  ],
  fissures: [
    {
      id: "fis-1",
      node: "Hepit (Void)",
      missionType: "Capture",
      tier: "Lith",
      tierNum: 1,
      expiry: "2030-01-01T00:30:00.000Z",
    },
    {
      id: "fis-2",
      node: "Mot (Void)",
      missionType: "Survival",
      tier: "Axi",
      tierNum: 4,
      isHard: true,
      expiry: "2030-01-01T00:45:00.000Z",
    },
  ],
  events: [
    {
      id: "event-1",
      description: "Thermia Fractures",
      tooltip: "Seal fractures across the Orb Vallis",
      node: "Orb Vallis (Venus)",
      currentScore: 10,
      maximumScore: 100,
      rewards: [{ items: ["Opticor Vandal"] }],
      expiry: "2030-01-14T00:00:00.000Z",
    },
  ],
  news: [
    {
      id: "news-old",
      message: "Evergreen link",
      date: "1970-01-01T00:00:00.000Z",
    },
    {
      id: "news-1",
      message: "Update 40 is live!",
      link: "https://forums.warframe.com",
      date: "2026-07-01T00:00:00.000Z",
      update: true,
    },
  ],
  archimedeas: [
    {
      id: "arch-1",
      type: "Deep Archimedea",
      expiry: "2030-01-08T00:00:00.000Z",
      missions: [
        {
          missionType: "Extermination",
          deviation: { name: "Sealed Armor" },
          risks: [{ name: "Bolstered Belligerents" }],
        },
      ],
    },
  ],
  sentientOutposts: {
    id: "outpost-1",
    active: true,
    mission: { node: "H-2 Cloud (Veil)", faction: "Grineer", type: "Skirmish" },
  },
  constructionProgress: { fomorianProgress: "40.35", razorbackProgress: "79.99" },
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

  it("list fingerprints diff to only newly added ids", () => {
    const before = fingerprintEvent("fissures", sample)!;
    const withNew = {
      ...sample,
      fissures: [
        ...sample.fissures,
        { id: "fis-3", node: "Ukko (Void)", missionType: "Capture", tier: "Meso", tierNum: 2 },
      ],
    };
    const after = fingerprintEvent("fissures", withNew)!;
    expect(addedFingerprintIds(before, after)).toEqual(["fis-3"]);
    // Pure expiry (removal) adds nothing → poller stays silent
    const withRemoval = { ...sample, fissures: sample.fissures.slice(1) };
    const removed = fingerprintEvent("fissures", withRemoval)!;
    expect(addedFingerprintIds(before, removed)).toEqual([]);
  });

  it("excludes completed invasions and undated news from fingerprints", () => {
    expect(fingerprintEvent("invasions", sample)).toBe("invasions:inv-1");
    expect(fingerprintEvent("news", sample)).toBe("news:news-1");
  });

  it("construction fingerprints round to 10% milestones", () => {
    expect(fingerprintEvent("construction", sample)).toBe("construction:fomorian40:razorback70");
    const bumped = {
      ...sample,
      constructionProgress: { fomorianProgress: "49.9", razorbackProgress: "79.99" },
    };
    // Same 10% bucket → same fingerprint (no notification churn)
    expect(fingerprintEvent("construction", bumped)).toBe(fingerprintEvent("construction", sample));
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

  it("builds alert/invasion/fissure/news embeds", () => {
    const alerts = embedAlerts(sample.alerts);
    expect(alerts.fields?.[0]?.name).toContain("Apollo");
    expect(alerts.fields?.[0]?.value).toContain("Orokin Catalyst");

    const inv = embedInvasions(sample.invasions);
    expect(inv.fields?.length).toBe(1); // completed invasion excluded
    expect(inv.fields?.[0]?.value).toContain("Fieldron");

    const fis = embedFissures(sample.fissures);
    expect(fis.description).toContain("Lith");
    expect(fis.description).toContain("Steel Path");

    // Highlight-only-new mode
    const onlyNew = embedFissures(sample.fissures, ["fis-2"]);
    expect(onlyNew.description).not.toContain("Hepit");
    expect(onlyNew.description).toContain("Mot");

    const news = embedNews(sample.news.filter((n) => n.id === "news-1"));
    expect(news.description).toContain("Update 40");

    expect(embedArchimedea(sample.archimedeas).fields?.[0]?.value).toContain("Sealed Armor");
    expect(embedSentientOutpost(sample.sentientOutposts).fields?.[0]?.value).toContain("H-2 Cloud");
    expect(embedConstruction(sample.constructionProgress).fields?.length).toBe(2);
  });
});
