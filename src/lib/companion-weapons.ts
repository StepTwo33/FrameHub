import type { Companion, Weapon } from "./types";

/** Map companion names to their specific claw weapon IDs (wiki Module:Companions/data). */
export const COMPANION_CLAW_MAP: Record<string, string> = {
  "Chesa Kubrow": "chesa_claws",
  "Huras Kubrow": "huras_claws",
  "Raksa Kubrow": "raksa_claws",
  "Sahasa Kubrow": "sahasa_claws",
  "Sunika Kubrow": "sunika_claws",
  "Helminth Charger": "helminth_claws",
  "Adarza Kavat": "adarza_claws",
  "Smeeta Kavat": "smeeta_claws",
  "Vasca Kavat": "vasca_claws",
  "Venari": "venari_claws",
  "Venari Prime": "venari_prime_claws",
  "Vizier Predasite": "vizier_claws",
  "Pharaoh Predasite": "pharaoh_claws",
  "Medjay Predasite": "medjay_claws",
  "Sly Vulpaphyla": "sly_claws",
  "Crescent Vulpaphyla": "crescent_claws",
  "Panzer Vulpaphyla": "panzer_claws",
};

export function getCompanionWeapons(companion: Companion, weaponList: Weapon[]): Weapon[] {
  const type = companion.type;
  if (type === "sentinel") {
    return weaponList.filter((w) => w.category === "sentinel_weapon");
  }
  if (type === "kubrow" || type === "predasite" || type === "kavat" || type === "vulpaphyla") {
    const specificClawId = COMPANION_CLAW_MAP[companion.name];
    const allClaws = weaponList.filter((w) => w.category === "beast_claw");
    if (specificClawId) {
      const specific = allClaws.filter((w) => w.id === specificClawId);
      const others = allClaws.filter((w) => w.id !== specificClawId && w.companionType === type);
      return [...specific, ...others];
    }
    return allClaws.filter((w) => w.companionType === type || w.companionType === "kubrow");
  }
  if (type === "moa") {
    return weaponList.filter(
      (w) => w.category === "sentinel_weapon" && !w.name.toLowerCase().includes("deconstructor"),
    );
  }
  if (type === "hound") {
    return weaponList.filter((w) => w.category === "hound_weapon" || w.companionType === "hound");
  }
  return [];
}

/** Default weapon used for DPS when companion build has weapon mods but no explicit weapon id. */
export function resolveDefaultCompanionWeapon(companion: Companion, weaponList: Weapon[]): Weapon | null {
  const candidates = getCompanionWeapons(companion, weaponList);
  return candidates[0] ?? null;
}
