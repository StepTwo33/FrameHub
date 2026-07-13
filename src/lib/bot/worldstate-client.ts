/**
 * Worldstate client — warframestat.us (WFCD).
 * https://docs.warframestat.us/
 *
 * Prefer a single `/{platform}?language=en` fetch (full worldstate blob).
 */

import { OPEN_WORLD_BOUNTY_SYNDICATES } from "./alert-types";

export type WorldstatePlatform = "pc" | "ps4" | "xb1" | "swi";

const BASE = "https://api.warframestat.us";
const DEFAULT_PLATFORM: WorldstatePlatform = "pc";

export interface SortieMission {
  node?: string;
  modifier?: string;
  modifierDescription?: string;
  missionType?: string;
}

export interface SortieData {
  id?: string;
  boss?: string;
  faction?: string;
  expiry?: string;
  variants?: SortieMission[];
  missions?: SortieMission[];
}

export interface ArchonHuntData {
  id?: string;
  boss?: string;
  faction?: string;
  expiry?: string;
  missions?: SortieMission[];
}

export interface ArbitrationData {
  id?: string;
  node?: string;
  type?: string;
  enemy?: string;
  expiry?: string;
  activation?: string;
}

export interface BaroInventoryItem {
  item?: string;
  ducats?: number;
  credits?: number;
}

export interface BaroData {
  id?: string;
  active?: boolean;
  character?: string;
  location?: string;
  activation?: string;
  expiry?: string;
  inventory?: BaroInventoryItem[];
}

/** Varzia / Prime Resurgence (vaultTrader). */
export interface VaultTraderData {
  id?: string;
  character?: string;
  location?: string;
  activation?: string;
  expiry?: string;
  inventory?: { item?: string; ducats?: number; credits?: number | null }[];
}

/** Darvo daily deal. */
export interface DailyDeal {
  id?: string;
  item?: string;
  originalPrice?: number;
  salePrice?: number;
  total?: number;
  sold?: number;
  discount?: number;
  activation?: string;
  expiry?: string;
}

export interface SteelPathReward {
  name?: string;
  cost?: number;
}

export interface SteelPathData {
  currentReward?: SteelPathReward;
  activation?: string;
  expiry?: string;
  remaining?: string;
  rotation?: SteelPathReward[];
  evergreens?: SteelPathReward[];
  incursions?: { id?: string; activation?: string; expiry?: string };
}

export interface NightwaveChallenge {
  id?: string;
  title?: string;
  desc?: string;
  reputation?: number;
  isDaily?: boolean;
  isElite?: boolean;
  expiry?: string;
}

export interface NightwaveData {
  id?: string;
  season?: number;
  tag?: string;
  phase?: number;
  activation?: string;
  expiry?: string;
  activeChallenges?: NightwaveChallenge[];
}

export interface SyndicateJob {
  id?: string;
  type?: string;
  enemyLevels?: number[];
  standingStages?: number[];
  minEnemyLevel?: number;
  maxEnemyLevel?: number;
  rewardPool?: string[];
  expiry?: string;
}

export interface SyndicateMission {
  id?: string;
  syndicate?: string;
  syndicateKey?: string;
  activation?: string;
  expiry?: string;
  jobs?: SyndicateJob[];
  nodes?: string[];
}

export interface SimarisData {
  target?: string;
  isTargetActive?: boolean;
}

export interface CycleData {
  id?: string;
  state?: string;
  expiry?: string;
  timeLeft?: string;
  isDay?: boolean;
  isWarm?: boolean;
  active?: string;
}

export interface WorldstateSnapshot {
  platform: WorldstatePlatform;
  fetchedAt: string;
  sortie: SortieData | null;
  archonHunt: ArchonHuntData | null;
  arbitration: ArbitrationData | null;
  voidTrader: BaroData | null;
  voidTraders: BaroData[];
  vaultTrader: VaultTraderData | null;
  dailyDeals: DailyDeal[];
  steelPath: SteelPathData | null;
  nightwave: NightwaveData | null;
  syndicateMissions: SyndicateMission[];
  simaris: SimarisData | null;
  cetusCycle: CycleData | null;
  vallisCycle: CycleData | null;
  cambionCycle: CycleData | null;
  duviriCycle: CycleData | null;
  earthCycle: CycleData | null;
}

type RawWorldstate = Record<string, unknown>;

async function fetchJson<T>(path: string): Promise<T | null> {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "FrameHub-Bot/0.1 (https://frame-hub.com)",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function asObj<T>(v: unknown): T | null {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as T;
  return null;
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/**
 * Fetch a compact worldstate snapshot used by embeds and fingerprints.
 */
export async function fetchWorldstateSnapshot(
  platform: WorldstatePlatform = DEFAULT_PLATFORM,
): Promise<WorldstateSnapshot> {
  const p = platform || DEFAULT_PLATFORM;
  const full = await fetchJson<RawWorldstate>(`/${p}?language=en`);

  if (full) {
    return {
      platform: p,
      fetchedAt: new Date().toISOString(),
      sortie: asObj<SortieData>(full.sortie),
      archonHunt: asObj<ArchonHuntData>(full.archonHunt),
      arbitration: asObj<ArbitrationData>(full.arbitration),
      voidTrader: asObj<BaroData>(full.voidTrader),
      voidTraders: asArray<BaroData>(full.voidTraders),
      vaultTrader: asObj<VaultTraderData>(full.vaultTrader),
      dailyDeals: asArray<DailyDeal>(full.dailyDeals),
      steelPath: asObj<SteelPathData>(full.steelPath),
      nightwave: asObj<NightwaveData>(full.nightwave),
      syndicateMissions: asArray<SyndicateMission>(full.syndicateMissions),
      simaris: asObj<SimarisData>(full.simaris),
      cetusCycle: asObj<CycleData>(full.cetusCycle),
      vallisCycle: asObj<CycleData>(full.vallisCycle),
      cambionCycle: asObj<CycleData>(full.cambionCycle),
      duviriCycle: asObj<CycleData>(full.duviriCycle),
      earthCycle: asObj<CycleData>(full.earthCycle),
    };
  }

  return emptySnapshot(p);
}

function emptySnapshot(p: WorldstatePlatform): WorldstateSnapshot {
  return {
    platform: p,
    fetchedAt: new Date().toISOString(),
    sortie: null,
    archonHunt: null,
    arbitration: null,
    voidTrader: null,
    voidTraders: [],
    vaultTrader: null,
    dailyDeals: [],
    steelPath: null,
    nightwave: null,
    syndicateMissions: [],
    simaris: null,
    cetusCycle: null,
    vallisCycle: null,
    cambionCycle: null,
    duviriCycle: null,
    earthCycle: null,
  };
}

/** Open-world bounty boards we care about for alerts. */
export function openWorldBounties(snap: WorldstateSnapshot): SyndicateMission[] {
  return snap.syndicateMissions.filter((s) => {
    const name = s.syndicate ?? s.syndicateKey ?? "";
    return OPEN_WORLD_BOUNTY_SYNDICATES.has(name);
  });
}

/** Stable fingerprint string for transition detection. */
export function fingerprintEvent(
  eventType: string,
  snap: WorldstateSnapshot,
): string | null {
  switch (eventType) {
    case "sortie": {
      const s = snap.sortie;
      if (!s) return null;
      return `sortie:${s.id ?? s.boss ?? ""}:${s.expiry ?? ""}`;
    }
    case "archon": {
      const a = snap.archonHunt;
      if (!a) return null;
      return `archon:${a.id ?? a.boss ?? ""}:${a.expiry ?? ""}`;
    }
    case "arbitration": {
      const a = snap.arbitration;
      if (!a) return null;
      return `arb:${a.node ?? ""}:${a.type ?? ""}:${a.expiry ?? a.id ?? ""}`;
    }
    case "baro": {
      const traders =
        snap.voidTraders.length > 0
          ? snap.voidTraders
          : snap.voidTrader
            ? [snap.voidTrader]
            : [];
      if (!traders.length) return null;
      return (
        "baro:" +
        traders
          .map((b) => `${b.location ?? ""}:${b.activation ?? ""}:${b.expiry ?? ""}`)
          .sort()
          .join("|")
      );
    }
    case "varzia": {
      const v = snap.vaultTrader;
      if (!v) return null;
      const items = (v.inventory ?? [])
        .map((i) => i.item ?? "")
        .filter(Boolean)
        .sort()
        .join(",");
      return `varzia:${v.activation ?? ""}:${v.expiry ?? ""}:${items}`;
    }
    case "darvo": {
      if (!snap.dailyDeals.length) return null;
      return (
        "darvo:" +
        snap.dailyDeals
          .map((d) => `${d.id ?? d.item ?? ""}:${d.salePrice ?? ""}:${d.sold ?? ""}`)
          .join("|")
      );
    }
    case "teshin": {
      const sp = snap.steelPath;
      if (!sp) return null;
      return `teshin:${sp.currentReward?.name ?? ""}:${sp.activation ?? ""}:${sp.incursions?.id ?? ""}`;
    }
    case "nightwave": {
      const nw = snap.nightwave;
      if (!nw) return null;
      const acts = (nw.activeChallenges ?? [])
        .map((c) => c.id ?? c.title ?? "")
        .sort()
        .join(",");
      return `nw:${nw.season ?? ""}:${nw.phase ?? ""}:${acts}`;
    }
    case "bounties": {
      const boards = openWorldBounties(snap);
      if (!boards.length) return null;
      return (
        "bounties:" +
        boards
          .map((b) => {
            const jobs = (b.jobs ?? []).map((j) => j.id ?? "").join("+");
            return `${b.syndicate ?? ""}:${b.id ?? ""}:${jobs}`;
          })
          .sort()
          .join("|")
      );
    }
    case "simaris": {
      const s = snap.simaris;
      if (!s) return null;
      return `simaris:${s.target ?? ""}:${s.isTargetActive ? "1" : "0"}`;
    }
    case "cetus": {
      const c = snap.cetusCycle;
      if (!c) return null;
      return `cetus:${c.state ?? (c.isDay ? "day" : "night")}`;
    }
    case "vallis": {
      const c = snap.vallisCycle;
      if (!c) return null;
      return `vallis:${c.state ?? (c.isWarm ? "warm" : "cold")}`;
    }
    case "cambion": {
      const c = snap.cambionCycle;
      if (!c) return null;
      return `cambion:${c.active ?? c.state ?? ""}`;
    }
    case "duviri": {
      const c = snap.duviriCycle;
      if (!c) return null;
      return `duviri:${c.state ?? c.active ?? c.id ?? ""}`;
    }
    case "earth": {
      const c = snap.earthCycle;
      if (!c) return null;
      return `earth:${c.state ?? (c.isDay ? "day" : "night")}`;
    }
    default:
      return null;
  }
}

export function allEventFingerprints(
  snap: WorldstateSnapshot,
  eventTypes: string[],
): { eventType: string; fingerprint: string }[] {
  const out: { eventType: string; fingerprint: string }[] = [];
  for (const eventType of eventTypes) {
    const fp = fingerprintEvent(eventType, snap);
    if (fp) out.push({ eventType, fingerprint: fp });
  }
  return out;
}
