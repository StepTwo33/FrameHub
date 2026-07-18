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
}

export function encodeBuild(build: ShareableBuild): string {
  try {
    const json = JSON.stringify(build);
    // Use base64url encoding (URL-safe)
    const encoded = btoa(json)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return encoded;
  } catch {
    return "";
  }
}

export function decodeBuild(hash: string): ShareableBuild | null {
  try {
    // Restore base64 padding
    let b64 = hash.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const json = atob(b64);
    return JSON.parse(json) as ShareableBuild;
  } catch {
    return null;
  }
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
