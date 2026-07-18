// Shareable Build URL Encoder/Decoder
// Encodes build state into a compact URL hash and decodes it back

export interface ShareableBuild {
  type: "weapon" | "warframe" | "companion" | "modular" | "archwing" | "railjack";
  itemId: string;
  mods: { id: string; rank: number; slotIndex?: number }[];
  arcanes?: string[];
  progenitorElement?: string;
  progenitorBonusPercent?: number;
  // Modular-specific
  modularType?: string;
  parts?: Record<string, string>;
  hasOrokinCatalyst?: boolean;
  isMR30?: boolean;
  slotPolarities?: Record<string, string>;
  // Warframe-specific
  shards?: { id: string; bonus: string }[];
  // Incarnon (weapon builder share codes)
  incarnonEvolutions?: Record<number, number>;
}

export function encodeJsonPayload(data: unknown): string {
  try {
    return btoa(JSON.stringify(data))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch {
    return "";
  }
}

export function decodeJsonPayload(hash: string): unknown | null {
  try {
    let b64 = hash.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

export function encodeBuild(build: ShareableBuild): string {
  return encodeJsonPayload(build);
}

export function decodeBuild(hash: string): ShareableBuild | null {
  const parsed = decodeJsonPayload(hash);
  if (!parsed || typeof parsed !== "object") return null;
  return parsed as ShareableBuild;
}

export function buildShareUrl(build: ShareableBuild): string {
  const encoded = encodeBuild(build);
  const path = build.type === "weapon" ? "/weapon-builder"
    : build.type === "warframe" ? "/warframe-builder"
    : build.type === "companion" ? "/companion-builder"
    : build.type === "modular" ? "/modular-builder"
    : build.type === "railjack" ? "/railjack-builder"
    : "/archwing-builder";
  return `${path}?build=${encoded}`;
}

export function extractBuildFromUrl(searchParams: URLSearchParams): ShareableBuild | null {
  const param = searchParams.get("build");
  if (!param) return null;
  return decodeBuild(param);
}

const BUILDER_PATHS: Record<string, string> = {
  weapon: "/weapon-builder",
  warframe: "/warframe-builder",
  companion: "/companion-builder",
  modular: "/modular-builder",
  archwing: "/archwing-builder",
  railjack: "/railjack-builder",
  loadout: "/loadouts",
};

/** Link from `/build/[id]` into the correct builder with full cloud build data. */
export function buildOpenUrl(type: string, buildId: string): string {
  const path = BUILDER_PATHS[type];
  if (!path) return "#";
  return `${path}?buildId=${encodeURIComponent(buildId)}`;
}

/** Open a locally saved build in the matching builder. */
export function localBuildOpenUrl(type: string, buildId: string): string {
  const path = BUILDER_PATHS[type] ?? "/loadouts";
  if (type === "loadout") return "/loadouts";
  return `${path}?localBuild=${encodeURIComponent(buildId)}`;
}

export { BUILDER_PATHS };
