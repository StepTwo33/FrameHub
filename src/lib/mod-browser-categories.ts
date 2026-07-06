import { Mod } from "@/lib/types";
import { isAuraMod } from "@/lib/aura-mods";
import { isArchmeleeMod } from "@/lib/archmelee-mods";

export type ModBrowserCategoryId =
  | "all"
  | "aura"
  | "primary"
  | "secondary"
  | "melee"
  | "warframe"
  | "augment"
  | "companion"
  | "archwing"
  | "archgun"
  | "archmelee"
  | "necramech"
  | "kdrive";

export const MOD_BROWSER_CATEGORIES: { id: ModBrowserCategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "aura", label: "Aura" },
  { id: "primary", label: "Primary" },
  { id: "secondary", label: "Secondary" },
  { id: "melee", label: "Melee" },
  { id: "warframe", label: "Warframe" },
  { id: "augment", label: "Augment" },
  { id: "companion", label: "Companion" },
  { id: "archwing", label: "Archwing" },
  { id: "archgun", label: "Archgun" },
  { id: "archmelee", label: "Arch Melee" },
  { id: "necramech", label: "Necramech" },
  { id: "kdrive", label: "K-Drive" },
];

/** Known K-Drive mod ids (legacy fallback if category not yet set). */
const KDRIVE_MOD_IDS = new Set([
  "air_time",
  "bomb_the_landin",
  "cold_arrival",
  "extreme_velocity",
  "inertia_dampeners",
  "juice",
  "kinetic_friction",
  "mad_stack",
  "mag_locks",
  "nitro_boost",
  "perfect_balance",
  "pop_top",
  "poppin_vert",
  "primo_flair",
  "quick_escape",
  "rail_guards",
  "slay_board",
  "sonic_boost",
  "thrash_landing",
  "trail_blazer",
  "vapor_trail",
  "venerdo_hoverdrive",
]);

export function isKDriveMod(mod: Mod): boolean {
  return mod.category === "kdrive" || KDRIVE_MOD_IDS.has(mod.id) || /k-drive/i.test(mod.description);
}

export function matchesModBrowserCategory(mod: Mod, category: ModBrowserCategoryId): boolean {
  if (category === "all") return true;

  switch (category) {
    case "aura":
      return isAuraMod(mod);
    case "primary":
      return ["primary", "rifle", "shotgun", "bow", "launcher"].includes(mod.category);
    case "secondary":
      return ["secondary", "pistol", "dual_pistols"].includes(mod.category);
    case "melee":
      return mod.category === "melee" && !isArchmeleeMod(mod);
    case "warframe":
      return mod.category === "warframe";
    case "augment":
      return mod.category === "augment";
    case "companion":
      return mod.category === "companion" || mod.category === "companion_weapon";
    case "archwing":
      return mod.category === "archwing";
    case "archgun":
      return mod.category === "archgun";
    case "archmelee":
      return isArchmeleeMod(mod);
    case "necramech":
      return mod.category === "necramech";
    case "kdrive":
      return mod.category === "kdrive" || isKDriveMod(mod);
    default:
      return false;
  }
}

export function modBrowserCategoryLabel(mod: Mod): string {
  if (isAuraMod(mod)) return "Aura";
  if (mod.category === "kdrive" || isKDriveMod(mod)) return "K-Drive";
  if (mod.category === "archgun") return "Archgun";
  if (isArchmeleeMod(mod)) return "Arch Melee";
  if (mod.category === "necramech") return "Necramech";
  if (mod.category === "archwing") return "Archwing";
  if (mod.category === "companion_weapon") return "Companion";
  if (["primary", "rifle", "shotgun", "bow", "launcher"].includes(mod.category)) return "Primary";
  if (["secondary", "pistol", "dual_pistols"].includes(mod.category)) return "Secondary";
  if (mod.category === "melee") return "Melee";
  if (mod.category === "warframe") return "Warframe";
  if (mod.category === "augment") return "Augment";
  if (mod.category === "companion") return "Companion";
  return mod.category || "—";
}
