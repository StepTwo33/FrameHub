/** Display labels for weapon picker category filters. */
export const WEAPON_CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  primary: "Primary",
  rifle: "Rifles",
  shotgun: "Shotguns",
  bow: "Bows",
  secondary: "Secondary",
  pistol: "Pistols",
  melee: "Melee",
  launcher: "Launchers",
  archgun: "Archguns",
  archmelee: "Archmelee",
  tektolyst: "Tektolyst",
};

/** Map a weapon's data category onto the mod pool category used by ModPicker. */
export function getModCategory(weaponCategory: string): string {
  if (["rifle", "shotgun", "bow", "primary", "launcher"].includes(weaponCategory)) return "primary";
  if (weaponCategory === "archgun") return "archgun";
  if (["pistol", "secondary", "dual_pistols"].includes(weaponCategory)) return "secondary";
  if (weaponCategory === "archmelee") return "archmelee";
  if (weaponCategory === "melee") return "melee";
  if (weaponCategory === "tektolyst") return "tektolyst";
  return weaponCategory;
}
