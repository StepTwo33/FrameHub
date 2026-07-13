/**
 * FrameHub bot alert event types (worldstate / vendors / cycles).
 * Used by dashboard, API, and bot poller.
 */

export type BotEventCategory = "missions" | "vendors" | "cycles" | "other";

export interface BotEventTypeDef {
  id: string;
  label: string;
  category: BotEventCategory;
  description: string;
}

export const BOT_EVENT_TYPES: BotEventTypeDef[] = [
  // Missions
  {
    id: "sortie",
    label: "Sortie",
    category: "missions",
    description: "Daily sortie rotation changes",
  },
  {
    id: "archon",
    label: "Archon Hunt",
    category: "missions",
    description: "Weekly Archon Hunt changes",
  },
  {
    id: "arbitration",
    label: "Arbitration",
    category: "missions",
    description: "Current arbitration node changes",
  },
  // Vendors
  {
    id: "baro",
    label: "Baro Ki'Teer",
    category: "vendors",
    description: "Void Trader arrival, departure, location, and inventory",
  },
  {
    id: "varzia",
    label: "Varzia (Prime Resurgence)",
    category: "vendors",
    description: "Prime Vault / Aya offerings at Maroo's Bazaar",
  },
  {
    id: "darvo",
    label: "Darvo's Daily Deal",
    category: "vendors",
    description: "Darvo flash sale item, discount, and stock",
  },
  {
    id: "teshin",
    label: "Teshin (Steel Path Honors)",
    category: "vendors",
    description: "Weekly Steel Path shop reward rotation",
  },
  {
    id: "nightwave",
    label: "Nightwave (Nora)",
    category: "vendors",
    description: "Season and daily/weekly Nightwave act rotations",
  },
  {
    id: "bounties",
    label: "Open-world bounties",
    category: "vendors",
    description:
      "Syndicate bounty boards: Ostrons, Solaris, Entrati, Cavia, Holdfasts, Hex, Kahl, and more",
  },
  {
    id: "simaris",
    label: "Cephalon Simaris",
    category: "vendors",
    description: "Synthesis target changes in any Relay",
  },
  // Cycles
  {
    id: "cetus",
    label: "Cetus / Plains",
    category: "cycles",
    description: "Day ↔ night transitions on the Plains of Eidolon",
  },
  {
    id: "vallis",
    label: "Orb Vallis",
    category: "cycles",
    description: "Warm ↔ cold transitions",
  },
  {
    id: "cambion",
    label: "Cambion Drift",
    category: "cycles",
    description: "Fass ↔ Vome transitions",
  },
  {
    id: "duviri",
    label: "Duviri",
    category: "cycles",
    description: "Duviri mood / spiral changes",
  },
  {
    id: "earth",
    label: "Earth cycle",
    category: "cycles",
    description: "Earth day/night cycle",
  },
];

export const BOT_EVENT_TYPE_IDS = BOT_EVENT_TYPES.map((e) => e.id);

export function isBotEventType(id: string): boolean {
  return BOT_EVENT_TYPE_IDS.includes(id);
}

export function botEventsByCategory(): Record<BotEventCategory, BotEventTypeDef[]> {
  const out: Record<BotEventCategory, BotEventTypeDef[]> = {
    missions: [],
    vendors: [],
    cycles: [],
    other: [],
  };
  for (const e of BOT_EVENT_TYPES) out[e.category].push(e);
  return out;
}

export const CATEGORY_LABELS: Record<BotEventCategory, string> = {
  missions: "Missions",
  vendors: "Vendors & offerings",
  cycles: "Open-world cycles",
  other: "Other",
};

/** Syndicates whose bounty boards we track for the `bounties` alert. */
export const OPEN_WORLD_BOUNTY_SYNDICATES = new Set([
  "Ostrons",
  "Solaris United",
  "Entrati",
  "Cavia",
  "The Holdfasts",
  "The Hex",
  "Kahl's Garrison",
  "Necraloid",
  "Quills",
  "Vox Solaris",
  "Vent Kids",
]);
