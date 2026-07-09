/**
 * Verified ability stat scaling rules.
 *
 * Each entry is confirmed against https://wiki.warframe.com ability pages
 * (see `scripts/verify-ability-scaling.py` to re-fetch wikitext).
 *
 * Only stats listed here are scaled with the build. Everything else shows
 * base values until verified for that specific ability.
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

/**
 * Misc stat scaling keyed by `warframeFamily::Ability Name` → stat key.
 *
 * Wiki sources (verified 2026-07-01):
 * - Sirius & Orion: wiki.warframe.com/w/Sirius_&_Orion/Abilities
 * - Other frames: individual ability pages on wiki.warframe.com
 */
const VERIFIED_MISC_SCALING: Record<string, MiscScalingTable> = {
  // wiki: Gravitic Slash — strip scales STR (cap 100%); arc is fixed 67.5°
  "sirius_orion::Gravitic Slash": {
    shieldStrip: { scale: "strength", cap: 1 },
    armorStrip: { scale: "strength", cap: 1 },
  },
  // wiki: Astral Shell — decoy duration/damage/radius scale DUR/STR/RNG
  "sirius_orion::Astral Shell": {
    decoyDuration: { scale: "duration" },
    decoyDamage: { scale: "strength" },
    decoyRadius: { scale: "range" },
  },
  // wiki: Light's Sanctuary — DR scales STR; cap 75% (drCap in miscStats)
  "sirius_orion::Light's Sanctuary": {
    minRadius: { scale: "range" },
    maxRadius: { scale: "range" },
    healthRegen: { scale: "strength" },
    damageReduction: { scale: "strength", useSiblingDrCap: true },
  },
  // wiki: Event Horizon — explosion radius scales RNG
  "sirius_orion::Event Horizon": {
    explosionRadius: { scale: "range" },
  },

  // wiki: Plein Air — defense reduction STR; splash radius RNG
  "follie::Plein Air": {
    defenseReduction: { scale: "strength", cap: 1 },
    splashRadius: { scale: "range" },
  },

  // wiki: Peacemaker — innate damage bonus scales STR
  "mesa::Peacemaker": {
    damageBonus: { scale: "strength" },
  },

  // wiki: Virulence — length scales RNG; width is fixed 4 m (not listed)

  // wiki: Parasitic Link
  "nidus::Parasitic Link": {
    strengthBonus: { scale: "strength" },
    enemyLinkRange: { scale: "range" },
  },
  // wiki: Ravenous — regen STR, explosion RNG; maggot count fixed at 9
  "nidus::Ravenous": {
    healthRegen: { scale: "strength" },
    explosionRadius: { scale: "range" },
  },

  // wiki: Psychic Bolts — defense strip STR, cap 100%
  "nyx::Psychic Bolts": {
    "Defense strip": { scale: "strength", cap: 1 },
  },

  // wiki: Iron Skin — armor multiplier in overguard formula scales STR
  "rhino::Iron Skin": {
    armorMultiplier: { scale: "strength" },
  },

  // wiki: Molt — movement speed buff scales STR
  "saryn::Molt": {
    speedBuff: { scale: "strength", cap: 1 },
  },
  // wiki: Toxic Lash — added toxin damage scales STR
  "saryn::Toxic Lash": {
    gunDamage: { scale: "strength", cap: 1 },
    meleeDamage: { scale: "strength", cap: 1 },
  },

  // wiki: Tharros Strike
  "styanax::Tharros Strike": {
    shieldStrip: { scale: "strength", cap: 1 },
    armorStrip: { scale: "strength", cap: 1 },
    healthPerHit: { scale: "strength" },
  },
  // wiki: Rally Point — energy regen and shields/kill scale STR
  "styanax::Rally Point": {
    energyRegen: { scale: "strength" },
    shieldsPerKill: { scale: "strength" },
  },
  // wiki: Final Stand — javelin count scales DUR (not STR); ~50% status unverified
  "styanax::Final Stand": {
    javelins: { scale: "duration" },
  },

  // wiki: Speed — reload buff scales STR; movement buff scales STR (ally move cap is separate)
  "volt::Speed": {
    speedBuff: { scale: "strength", cap: 1 },
    reloadBuff: { scale: "strength", cap: 1 },
  },
  // wiki: Electric Shield — +50% ele / +100% crit are fixed (not Ability Strength)

  // wiki: Cloud Walker
  "wukong::Cloud Walker": {
    stunRadius: { scale: "range" },
    healPerMeter: { scale: "strength" },
  },
  // wiki: Defy — damage/armor multipliers scale STR; armor bonus cap 1500 is fixed
  "wukong::Defy": {
    armorDuration: { scale: "duration" },
    damageMultiplier: { scale: "strength" },
  },

  // wiki: Gloom (Helminth subsume)
  "helminth::Gloom": {
    slowPercent: { scale: "strength", useSiblingSlowCap: true },
    lifeStealPercent: { scale: "strength" },
    minRadius: { scale: "range" },
    maxRadius: { scale: "range" },
  },

  // wiki: Voruna — Shroud of Dynar
  "voruna::Shroud Of Dynar": {
    speedBuff: { scale: "strength", cap: 1 },
    durationExtension: { scale: "duration" },
  },
  // wiki: Voruna — Lycath's Hunt
  "voruna::Lycath's Hunt": {
    durationExtension: { scale: "duration" },
  },
  // wiki: Voruna — Ulfrun's Descent
  "voruna::Ulfrun's Descent": {
    speedBuff: { scale: "strength", cap: 1 },
  },

  // wiki: Citrine — Fractured Blast (orb drop chances scale STR)
  "citrine::Fractured Blast": {
    healthOrbChance: { scale: "strength" },
    energyOrbChance: { scale: "strength" },
  },
  // wiki: Citrine — Preserving Shell (per-kill/assist DR scales STR)
  "citrine::Preserving Shell": {
    drPerKill: { scale: "strength" },
    drPerAssist: { scale: "strength" },
    minDamageReduction: { scale: "strength" },
  },
  // wiki: Citrine — Prismatic Gem (status buffs scale STR/DUR; aurora radius scales RNG)
  "citrine::Prismatic Gem": {
    statusChanceBonus: { scale: "strength" },
    statusDurationBonus: { scale: "duration" },
    placementDistance: { scale: "range" },
  },
};

/** Top-level ability field scaling (damageReduction, damageBuff on the Ability object). */
const VERIFIED_FIELD_SCALING: Record<string, VerifiedAbilityFields> = {
  // wiki: Self Portrait — DR grows with kills; max 50% at 180% STR, hard cap 90%
  "follie::Self Portrait": {
    damageReduction: { scale: "strength", useSiblingDrCap: true },
  },
  // wiki: Eclipse — DR cap 90%, weapon buff scales STR
  "gara::Eclipse": {
    damageReduction: { scale: "strength", cap: 0.9 },
    damageBuff: { scale: "strength" },
  },
  // wiki: Roar — weapon damage bonus scales STR
  "rhino::Roar": {
    damageBuff: { scale: "strength" },
  },
  // wiki: Shooting Gallery — ally weapon damage scales STR
  "mesa::Shooting Gallery": {
    damageBuff: { scale: "strength" },
  },
  // wiki: Shatter Shield — DR cap 95%
  "mesa::Shatter Shield": {
    damageReduction: { scale: "strength", useSiblingDrCap: true },
  },
  // wiki: Parasitic Link — weapon buff and enemy damage redirection scale STR
  "nidus::Parasitic Link": {
    damageBuff: { scale: "strength" },
    damageReduction: { scale: "strength", cap: 1 },
  },
  // wiki: Preserving Shell — initial DR scales STR; cap 90%
  "citrine::Preserving Shell": {
    damageReduction: { scale: "strength", useSiblingDrCap: true },
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
