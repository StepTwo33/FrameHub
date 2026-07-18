import type { Mod, Weapon } from "@/lib/types";
import { primaryArcanes, secondaryArcanes, meleeArcanes, kitgunArcanes, ampArcanes, exodiaArcanes, tektolystArcanes } from "@/data/arcanes";

/** Arcane picker options for a weapon (standalone or modular-built). */
export function getWeaponArcanes(weapon: Weapon): { arcanes: Mod[]; slots: number; label: string } {
  const cat = weapon.category;
  if (cat === "kitgun_chamber" || weapon.arcaneType === "kitgun") {
    const isPrimary = weapon.category === "primary";
    return {
      arcanes: isPrimary ? [...primaryArcanes, ...kitgunArcanes] : [...secondaryArcanes, ...kitgunArcanes],
      slots: 2,
      label: "Kitgun Arcane",
    };
  }
  if (cat === "zaw_strike" || weapon.arcaneType === "exodia") {
    return { arcanes: [...meleeArcanes, ...exodiaArcanes], slots: 2, label: "Zaw Arcane" };
  }
  if (cat === "amp_prism" || weapon.arcaneType === "amp") {
    return { arcanes: ampArcanes, slots: 2, label: "Amp Arcane" };
  }
  if (cat === "archgun") return { arcanes: primaryArcanes, slots: 2, label: "Archgun Arcane" };
  if (weapon.isExalted) {
    if (weapon.triggerType === "Melee" || cat === "melee" || cat === "archmelee") {
      return { arcanes: meleeArcanes, slots: 1, label: "Melee Arcane" };
    }
    if (["pistol", "secondary", "dual_pistols"].includes(cat)) {
      return { arcanes: secondaryArcanes, slots: 1, label: "Secondary Arcane" };
    }
    return { arcanes: primaryArcanes, slots: 1, label: "Primary Arcane" };
  }
  if (["rifle", "shotgun", "bow", "primary", "launcher"].includes(cat)) {
    return { arcanes: primaryArcanes, slots: 1, label: "Primary Arcane" };
  }
  if (["pistol", "secondary"].includes(cat)) return { arcanes: secondaryArcanes, slots: 1, label: "Secondary Arcane" };
  if (cat === "melee") return { arcanes: meleeArcanes, slots: 1, label: "Melee Arcane" };
  if (cat === "tektolyst") return { arcanes: tektolystArcanes, slots: 1, label: "Tektolyst Arcane" };
  return { arcanes: [], slots: 0, label: "" };
}
