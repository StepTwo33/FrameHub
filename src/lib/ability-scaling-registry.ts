/**
 * Verified ability stat scaling rules.
 *
 * Only stats listed here are scaled with the build. Everything else is shown at
 * base values until we confirm behavior (and caps) for that specific ability.
 *
 * Keys use `warframeFamily::Ability Name` where warframeFamily strips `_prime`.
 */

export type AbilityScaleAttribute = "strength" | "duration" | "range";

export interface VerifiedStatScaling {
  scale: AbilityScaleAttribute;
  /** Hard cap after scaling, as a fraction (1 = 100%). */
  cap?: number;
  /** Read `drCap` from the ability's miscStats for this stat. */
  useSiblingDrCap?: boolean;
  /** Read `slowCap` from miscStats (percent or fraction). */
  useSiblingSlowCap?: boolean;
}

export type VerifiedAbilityFields = Partial<
  Record<"damageReduction" | "damageBuff", VerifiedStatScaling>
>;

type MiscScalingTable = Record<string, VerifiedStatScaling>;

function familyId(warframeId: string): string {
  return warframeId.replace(/_prime$/, "");
}

function abilityKey(warframeId: string, abilityName: string): string {
  return `${familyId(warframeId)}::${abilityName}`;
}

/** Misc stat scaling keyed by `warframeFamily::Ability Name` → stat key. */
const VERIFIED_MISC_SCALING: Record<string, MiscScalingTable> = {
  // —— Sirius & Orion ——
  "sirius_orion::Gravitic Slash": {
    shieldStrip: { scale: "strength", cap: 1 },
    armorStrip: { scale: "strength", cap: 1 },
    arc: { scale: "range" },
  },
  "sirius_orion::Astral Shell": {
    decoyDuration: { scale: "duration" },
    decoyDamage: { scale: "strength" },
    decoyRadius: { scale: "range" },
  },
  "sirius_orion::Light's Sanctuary": {
    minRadius: { scale: "range" },
    maxRadius: { scale: "range" },
    healthRegen: { scale: "strength" },
    damageReduction: { scale: "strength", cap: 0.9 },
  },
  "sirius_orion::Event Horizon": {
    explosionRadius: { scale: "range" },
  },

  // —— Follie ——
  "follie::Plein Air": {
    defenseReduction: { scale: "strength", cap: 1 },
    splashRadius: { scale: "range" },
  },

  // —— Mesa ——
  "mesa::Peacemaker": {
    damageBonus: { scale: "strength" },
  },

  // —— Nidus ——
  "nidus::Virulence": {
    width: { scale: "range" },
  },
  "nidus::Parasitic Link": {
    strengthBonus: { scale: "strength" },
    enemyLinkRange: { scale: "range" },
  },
  "nidus::Ravenous": {
    healthRegen: { scale: "strength" },
    explosionRadius: { scale: "range" },
    maggots: { scale: "strength" },
  },

  // —— Nyx ——
  "nyx::Psychic Bolts": {
    "Defense strip": { scale: "strength", cap: 1 },
  },

  // —— Rhino ——
  "rhino::Iron Skin": {
    armorMultiplier: { scale: "strength" },
  },

  // —— Saryn ——
  "saryn::Molt": {
    speedBuff: { scale: "strength", cap: 1 },
  },
  "saryn::Toxic Lash": {
    gunDamage: { scale: "strength", cap: 1 },
    meleeDamage: { scale: "strength", cap: 1 },
  },

  // —— Styanax ——
  "styanax::Tharros Strike": {
    shieldStrip: { scale: "strength", cap: 1 },
    armorStrip: { scale: "strength", cap: 1 },
    healthPerHit: { scale: "strength" },
  },
  "styanax::Rally Point": {
    energyRegen: { scale: "strength" },
    shieldsPerKill: { scale: "strength" },
  },
  "styanax::Final Stand": {
    javelins: { scale: "strength" },
    statusChance: { scale: "strength", cap: 1 },
  },

  // —— Volt ——
  "volt::Speed": {
    speedBuff: { scale: "strength", cap: 1 },
    reloadBuff: { scale: "strength", cap: 1 },
  },
  "volt::Electric Shield": {
    electricDamageBonus: { scale: "strength" },
    critDamageBonus: { scale: "strength" },
  },

  // —— Wukong ——
  "wukong::Cloud Walker": {
    stunRadius: { scale: "range" },
    healPerMeter: { scale: "strength" },
  },
  "wukong::Defy": {
    armorCap: { scale: "strength" },
    armorDuration: { scale: "duration" },
    damageMultiplier: { scale: "strength" },
  },

  // —— Helminth ——
  "helminth::Gloom": {
    slowPercent: { scale: "strength", useSiblingSlowCap: true },
    lifeStealPercent: { scale: "strength" },
    minRadius: { scale: "range" },
    maxRadius: { scale: "range" },
  },
};

/** Top-level ability field scaling (damageReduction, damageBuff on the Ability object). */
const VERIFIED_FIELD_SCALING: Record<string, VerifiedAbilityFields> = {
  "follie::Self Portrait": {
    damageReduction: { scale: "strength", useSiblingDrCap: true },
  },
  "gara::Eclipse": {
    damageReduction: { scale: "strength", cap: 0.9 },
    damageBuff: { scale: "strength" },
  },
  "mesa::Shatter Shield": {
    damageReduction: { scale: "strength", useSiblingDrCap: true },
  },
  "nidus::Parasitic Link": {
    damageBuff: { scale: "strength" },
  },
};

export function resolveAbilityScalingKey(
  warframeId: string | undefined,
  abilityName: string,
  helminth?: boolean,
): string | null {
  if (helminth) return `helminth::${abilityName}`;
  if (!warframeId) return null;
  return abilityKey(warframeId, abilityName);
}

export function getVerifiedMiscScaling(
  warframeId: string | undefined,
  abilityName: string,
  statKey: string,
  helminth?: boolean,
): VerifiedStatScaling | null {
  const key = resolveAbilityScalingKey(warframeId, abilityName, helminth);
  if (!key) return null;
  return VERIFIED_MISC_SCALING[key]?.[statKey] ?? null;
}

export function getVerifiedFieldScaling(
  warframeId: string | undefined,
  abilityName: string,
  field: keyof VerifiedAbilityFields,
): VerifiedStatScaling | null {
  if (!warframeId) return null;
  const key = abilityKey(warframeId, abilityName);
  return VERIFIED_FIELD_SCALING[key]?.[field] ?? null;
}

/** Whether this ability has any verified misc-stat scaling entries. */
export function abilityHasVerifiedMiscScaling(
  warframeId: string | undefined,
  abilityName: string,
  helminth?: boolean,
): boolean {
  const key = resolveAbilityScalingKey(warframeId, abilityName, helminth);
  if (!key) return false;
  const table = VERIFIED_MISC_SCALING[key];
  return table != null && Object.keys(table).length > 0;
}
