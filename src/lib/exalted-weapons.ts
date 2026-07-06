import type { Weapon } from "@/lib/types";

/** Ability names that summon an exalted weapon (normalized lowercase). */
const ABILITY_EXALTED_ALIASES: Record<string, string[]> = {
  "exalted blade": ["exalted blade", "slash dash"],
  "peacemaker": ["peacemaker"],
  "artemis bow": ["artemis bow"],
  "hysteria": ["hysteria"],
  "primal fury": ["primal fury"],
  "razorwing": ["razorwing"],
  "balefire": ["balefire"],
  "serene storm": ["serene storm"],
  "exalted shadow": ["exalted shadow"],
  "noctua": ["noctua"],
  "neutralize": ["neutralize"],
  "glory on high": ["glory on high"],
  "guard mode": ["guard mode"],
  "exalted ironbride": ["exalted ironbride"],
  "blade storm": ["blade storm"],
  "landslide": ["landslide"],
  "shattered lash": ["shattered lash"],
  "whipclaw": ["whipclaw"],
  "exalted solo": ["exalted solo"],
  "slash dash": ["slash dash"],
  "passive": ["passive"],
};

function normalizeLabel(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

/** All exalted / signature weapons tied to a specific warframe id. */
export function getExaltedWeaponsForWarframe(warframeId: string, weapons: Weapon[]): Weapon[] {
  return weapons
    .filter((w) => w.isExalted && w.warframeId === warframeId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Primary exalted weapon shown in the warframe builder mod section. */
export function getPrimaryExaltedWeapon(warframeId: string, weapons: Weapon[]): Weapon | null {
  const owned = getExaltedWeaponsForWarframe(warframeId, weapons);
  if (owned.length === 0) return null;
  if (owned.length === 1) return owned[0];

  const preferId: Partial<Record<string, string>> = {
    excalibur: "exalted_blade",
    excalibur_prime: "exalted_blade_prime",
    excalibur_umbra: "exalted_blade_umbra",
    titania: "dex_pixia",
    titania_prime: "dex_pixia_prime",
    ash: "shadow_clones",
    ash_prime: "shadow_clones_prime",
    atlas: "landslide_fists",
    atlas_prime: "landslide_fists_prime",
    gara: "shattered_lash",
    gara_prime: "shattered_lash_prime",
    khora: "whipclaw",
    khora_prime: "whipclaw_prime",
    temple: "lizzie",
    garuda: "garuda_talons",
    garuda_prime: "garuda_prime_talons",
  };
  const preferred = preferId[warframeId];
  if (preferred) {
    const match = owned.find((w) => w.id === preferred);
    if (match) return match;
  }
  return owned[0];
}

/** Match an ability name to its exalted weapon, if any. */
export function getExaltedWeaponForAbility(
  warframeId: string,
  abilityName: string,
  weapons: Weapon[],
): Weapon | null {
  const normalizedAbility = normalizeLabel(abilityName);
  const frameWeapons = getExaltedWeaponsForWarframe(warframeId, weapons);

  for (const weapon of frameWeapons) {
    if (!weapon.abilityName) continue;
    const normalizedWeaponAbility = normalizeLabel(weapon.abilityName);
    if (normalizedWeaponAbility === normalizedAbility) return weapon;
    const aliases = ABILITY_EXALTED_ALIASES[normalizedWeaponAbility];
    if (aliases?.includes(normalizedAbility)) return weapon;
  }

  for (const weapon of frameWeapons) {
    if (!weapon.abilityName) continue;
    const normalizedWeaponAbility = normalizeLabel(weapon.abilityName);
    if (
      normalizedAbility.includes(normalizedWeaponAbility) ||
      normalizedWeaponAbility.includes(normalizedAbility)
    ) {
      return weapon;
    }
  }

  return null;
}

export function warframeHasExaltedWeapons(warframeId: string, weapons: Weapon[]): boolean {
  return getExaltedWeaponsForWarframe(warframeId, weapons).length > 0;
}
