import ArsenalData, { type BaseArsenalData } from "@wfcd/arsenal-parser";
import {
  WARFRAME_ARSENAL_LOADOUT_URL,
  type WarframePlatform,
} from "@/lib/warframe-arsenal/platforms";
import { loadoutHasImportableContent, mapArsenalToImportPayload } from "@/lib/warframe-arsenal/map-import";

const FETCH_TIMEOUT_MS = 20_000;

export class ArsenalFetchError extends Error {
  constructor(
    message: string,
    readonly code: "invalid_request" | "not_shared" | "not_found" | "upstream",
  ) {
    super(message);
    this.name = "ArsenalFetchError";
  }
}

function normalizeAccount(account: string): string {
  return account.trim().toLowerCase();
}

export async function fetchAndMapWarframeArsenal(platform: WarframePlatform, account: string) {
  const normalized = normalizeAccount(account);
  if (!normalized || normalized.length < 1 || normalized.length > 64) {
    throw new ArsenalFetchError("Enter a valid in-game account name.", "invalid_request");
  }

  const base = WARFRAME_ARSENAL_LOADOUT_URL[platform];
  const url = `${base}?account=${encodeURIComponent(normalized)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let raw: unknown;
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "FrameHub/1.0 (Warframe Arsenal Twitch Extension)",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new ArsenalFetchError(
        `Warframe servers returned ${res.status}. Try again in a moment.`,
        res.status === 404 ? "not_found" : "upstream",
      );
    }
    raw = await res.json();
  } catch (err) {
    if (err instanceof ArsenalFetchError) throw err;
    throw new ArsenalFetchError(
      "Could not reach Warframe loadout servers. Check your connection and try again.",
      "upstream",
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!raw || typeof raw !== "object") {
    throw new ArsenalFetchError("Unexpected response from Warframe servers.", "upstream");
  }

  const payload = raw as Record<string, unknown>;
  if (payload.errors) {
    const message = String(payload.errors);
    if (/no auth header/i.test(message)) {
      throw new ArsenalFetchError(
        "This account has not enabled loadout sharing. In Warframe account settings, turn on “Share Loadout Information with the Warframe Arsenal Twitch Extension”.",
        "not_shared",
      );
    }
    throw new ArsenalFetchError(message, "upstream");
  }

  if (!payload.loadOuts || !payload.accountInfo) {
    throw new ArsenalFetchError("No loadout data returned for this account.", "not_found");
  }

  const arsenal = new ArsenalData(payload as unknown as BaseArsenalData);
  const mapped = mapArsenalToImportPayload(arsenal, { loadOuts: payload.loadOuts as never });

  if (!loadoutHasImportableContent(mapped.loadout)) {
    throw new ArsenalFetchError(
      "Loadout data was retrieved but could not be mapped to FrameHub items.",
      "not_found",
    );
  }

  return mapped;
}
