import { Mod } from "@/lib/types";
import { isAuraMod } from "@/lib/mods/aura-mods";
import { isArchmeleeMod } from "@/lib/mods/archmelee-mods";
import { getModSlotCategory } from "@/lib/mods/mod-slot-categories";
import { getModCodexBrowserCategories } from "@/lib/mods/weapon-exclusive-mods";
import { isWeaponExclusiveMod } from "@/lib/mods/weapon-mod-tags";
import { isCompanionAffectingWarframeAugment } from "@/lib/mods/companion-augment-mods";
import { isArchwingAugment } from "@/lib/mods/archwing-augment-mods";
import { isWarframeAugment, isWarframeSpecificAugment } from "@/lib/mods/warframe-augment-mods";
import { isSetBonusMod } from "@/lib/mods/set-mod-catalog";

export type ModBrowserCategoryId =
  | "all"
  | "aura"
  | "exilus"
  | "historic"
  | "tome"
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
  | "kdrive"
  | "set";

/** Standard equipment-type filters (game-like order). */
export const MOD_BROWSER_CATEGORIES: { id: ModBrowserCategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "aura", label: "Aura" },
  { id: "exilus", label: "Exilus" },
  { id: "historic", label: "Historic" },
  { id: "tome", label: "Tome" },
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
  { id: "set", label: "Set Bonus" },
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

/** Internal calculator placeholders — not equippable mods (e.g. Incarnon evolutions live on weapons). */
export function isCodexListedMod(mod: Mod): boolean {
  return mod.category !== "evolution";
}

/** Mods that belong to a dedicated special slot (Aura / Exilus / Tome / Historic). */
function hasSpecialSlot(mod: Mod): boolean {
  return isAuraMod(mod) || getModSlotCategory(mod) !== null;
}

export function matchesModBrowserCategory(mod: Mod, category: ModBrowserCategoryId): boolean {
  if (category === "all") return true;

  switch (category) {
    case "aura":
      return isAuraMod(mod);
    case "exilus":
      return getModSlotCategory(mod) === "exilus";
    case "historic":
      return getModSlotCategory(mod) === "historic";
    case "tome":
      return getModSlotCategory(mod) === "tome";
    case "primary":
      return (
        (["primary", "rifle", "shotgun", "bow", "launcher"].includes(mod.category) && !hasSpecialSlot(mod))
        || getModCodexBrowserCategories(mod.id).includes("primary")
      );
    case "secondary":
      return (
        (["secondary", "pistol", "dual_pistols"].includes(mod.category) && !hasSpecialSlot(mod))
        || getModCodexBrowserCategories(mod.id).includes("secondary")
      );
    case "melee":
      return (
        (mod.category === "melee" && !isArchmeleeMod(mod) && !hasSpecialSlot(mod))
        || getModCodexBrowserCategories(mod.id).includes("melee")
      );
    case "warframe":
      return (
        (mod.category === "warframe" && !hasSpecialSlot(mod))
        || isWarframeAugment(mod)
      );
    case "augment":
      return mod.category === "augment" && !hasSpecialSlot(mod);
    case "companion":
      return (
        mod.category === "companion"
        || mod.category === "companion_weapon"
        || isCompanionAffectingWarframeAugment(mod)
      );
    case "archwing":
      return mod.category === "archwing" || isArchwingAugment(mod);
    case "archgun":
      return mod.category === "archgun";
    case "archmelee":
      return isArchmeleeMod(mod);
    case "necramech":
      return mod.category === "necramech";
    case "kdrive":
      return mod.category === "kdrive" || isKDriveMod(mod);
    case "set":
      return isSetBonusMod(mod);
    default:
      return false;
  }
}

export function modBrowserCategoryLabel(mod: Mod): string {
  if (isSetBonusMod(mod)) return "Set bonus";
  const slot = getModSlotCategory(mod);
  if (slot) {
    return slot === "exilus" ? "Exilus" : slot === "tome" ? "Tome" : "Historic";
  }
  if (isAuraMod(mod)) return "Aura";
  if (mod.category === "kdrive" || isKDriveMod(mod)) return "K-Drive";
  if (mod.category === "archgun") return "Archgun";
  if (isArchmeleeMod(mod)) return "Arch Melee";
  if (mod.category === "necramech") return "Necramech";
  if (mod.category === "archwing" || isArchwingAugment(mod)) return "Archwing";
  if (mod.category === "companion_weapon") return "Companion";
  if (["primary", "rifle", "shotgun", "bow", "launcher"].includes(mod.category)) return "Primary";
  if (["secondary", "pistol", "dual_pistols"].includes(mod.category)) return "Secondary";
  if (mod.category === "melee") return "Melee";
  if (mod.category === "warframe") return "Warframe";
  if (isWarframeSpecificAugment(mod)) return "Warframe augment";
  if (mod.category === "augment") return "Augment";
  if (isCompanionAffectingWarframeAugment(mod)) return "Companion augment";
  if (mod.category === "companion") return "Companion";
  if (mod.category === "tektolyst") return "Historic";
  if (isWeaponExclusiveMod(mod.id)) return "Weapon mod";
  return mod.category || "—";
}
