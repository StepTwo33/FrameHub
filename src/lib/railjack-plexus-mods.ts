import type { Mod } from "@/lib/types";
import { isRailjackMod, type RailjackModRef } from "@/data/railjack";

export type PlexusModTab = "integrated" | "battle" | "tactical";

/** Battle Plexus abilities (Forward Artillery is an Integrated mod in-game). */
export const RAILJACK_BATTLE_MOD_IDS = new Set([
  "munitions_vortex",
  "particle_ram",
  "phoenix_blaze",
  "blackout_pulse",
  "void_hole",
  "tether",
  "seeker_volley",
  "shatter_burst",
  "countermeasures",
]);

/** Tactical Plexus abilities. */
export const RAILJACK_TACTICAL_MOD_IDS = new Set([
  "death_blossom",
  "intruder_stasis",
  "void_cloak",
  "flow_burn",
  "form_up",
  "fire_suppression",
  "battle_stations",
  "squad_renew",
  "breach_quanta",
  "battle_forge",
]);

export function getPlexusModTab(mod: Pick<Mod, "id">): PlexusModTab {
  if (RAILJACK_BATTLE_MOD_IDS.has(mod.id)) return "battle";
  if (RAILJACK_TACTICAL_MOD_IDS.has(mod.id)) return "tactical";
  return "integrated";
}

export function plexusModAllowedInTab(mod: Pick<Mod, "id">, tab: PlexusModTab): boolean {
  return getPlexusModTab(mod) === tab;
}

export function filterRailjackModsForTab(mods: Mod[], tab: PlexusModTab): Mod[] {
  return mods.filter((m) => plexusModAllowedInTab(m, tab));
}

export function isRailjackPlexusMod(mod: RailjackModRef): boolean {
  return isRailjackMod(mod);
}
