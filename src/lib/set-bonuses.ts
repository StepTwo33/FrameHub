import type { ModSlot, SetBonusLinkage, SetBonusSummaryLine } from "./types";

export const VIGILANTE_MOD_IDS = [
  "vigilante_armaments",
  "vigilante_fervor",
  "vigilante_offense",
  "vigilante_pursuit",
  "vigilante_supplies",
  "vigilante_vigor",
] as const;

/** Primary / rifle / shotgun / bow / launcher / archgun — not secondary or melee. */
export function weaponSupportsPrimaryStyleSets(weapon: { category: string; triggerType?: string }): boolean {
  const c = weapon.category;
  if (c === "melee" || weapon.triggerType === "Melee") return false;
  if (c === "pistol" || c === "secondary" || c === "dual_pistols") return false;
  return (
    c === "primary" ||
    c === "rifle" ||
    c === "shotgun" ||
    c === "bow" ||
    c === "launcher" ||
    c === "archgun"
  );
}

/** Warframe + pistol — Augur Pact is secondary-only. */
export const AUGUR_SET_MOD_IDS = [
  "augur_message",
  "augur_seeker",
  "augur_reach",
  "augur_accord",
  "augur_secrets",
  "augur_breach",
] as const;

export const HUNTER_SET_MOD_IDS = [
  "hunter_adrenaline",
  "hunter_munitions",
  "hunter_track",
  "hunter_recovery",
  "hunter_command",
  "hunter_synergy",
] as const;

export const MECHA_SET_MOD_IDS = [
  "mecha_pulse_r3",
  "mecha_empowered",
  "mecha_recharge",
  "mecha_overdrive",
] as const;

export const SYNTH_SET_MOD_IDS = [
  "synth_deconstruct",
  "synth_fiber",
  "synth_charge_r3",
  "synth_reflex_r3",
] as const;

/** Tek Enhance (Kavat) is in-game piece #4 — add when present in data. */
export const TEK_SET_MOD_IDS = [
  "tek_collateral_r3",
  "tek_assault_r3",
  "tek_gravity_r3",
  "tek_enhance",
] as const;

const AUGUR_SET = new Set<string>(AUGUR_SET_MOD_IDS);
const HUNTER_SET = new Set<string>(HUNTER_SET_MOD_IDS);
const MECHA_SET = new Set<string>(MECHA_SET_MOD_IDS);
const SYNTH_SET = new Set<string>(SYNTH_SET_MOD_IDS);
const TEK_SET = new Set<string>(TEK_SET_MOD_IDS);

export function countSetModsInSlots(slots: ModSlot[] | undefined, setMembers: Set<string>): number {
  if (!slots?.length) return 0;
  return slots.reduce((n, s) => n + (setMembers.has(s.modId) ? 1 : 0), 0);
}

function concatSlots(...groups: (ModSlot[] | undefined)[]): ModSlot[] {
  const out: ModSlot[] = [];
  for (const g of groups) {
    if (g?.length) out.push(...g);
  }
  return out;
}

/** Augur pieces only count from Warframe + secondary (Augur Pact). */
export function countAugurSetPieces(warframeMods?: ModSlot[], secondaryMods?: ModSlot[]): number {
  return countSetModsInSlots(concatSlots(warframeMods, secondaryMods), AUGUR_SET);
}

/** Hunter set spans frame, weapons, and companion. */
export function countHunterSetPieces(linkage: SetBonusLinkage | undefined, warframeMods: ModSlot[]): number {
  return countSetModsInSlots(
    concatSlots(
      warframeMods,
      linkage?.primaryMods,
      linkage?.secondaryMods,
      linkage?.meleeMods,
      linkage?.companionMods,
    ),
    HUNTER_SET,
  );
}

export function countMechaSetPieces(warframeMods: ModSlot[], companionMods?: ModSlot[]): number {
  return countSetModsInSlots(concatSlots(warframeMods, companionMods), MECHA_SET);
}

export function countSynthSetPieces(linkage: SetBonusLinkage | undefined, localWeaponMods: ModSlot[]): number {
  return countSetModsInSlots(
    concatSlots(
      localWeaponMods,
      linkage?.warframeMods,
      linkage?.primaryMods,
      linkage?.secondaryMods,
      linkage?.meleeMods,
      linkage?.companionMods,
    ),
    SYNTH_SET,
  );
}

export function countTekSetPieces(linkage: SetBonusLinkage | undefined, localWeaponMods: ModSlot[]): number {
  return countSetModsInSlots(
    concatSlots(
      localWeaponMods,
      linkage?.warframeMods,
      linkage?.primaryMods,
      linkage?.secondaryMods,
      linkage?.meleeMods,
      linkage?.companionMods,
    ),
    TEK_SET,
  );
}

export function weaponAcceptsSynthReloadBonus(weapon: { category: string }): boolean {
  const c = weapon.category;
  return c === "pistol" || c === "secondary" || c === "dual_pistols";
}

export function buildWeaponSetBonusSummary(
  weapon: { category: string; triggerType?: string },
  localMods: ModSlot[],
  linkage: SetBonusLinkage | undefined,
  sim: {
    extraVigilanteModsFromWarframe?: number;
    extraSynthSetPiecesOffWeapon?: number;
    extraTekSetPiecesOffWeapon?: number;
    applyTekSetVsMarkedDamage?: boolean;
  },
): SetBonusSummaryLine[] {
  const vigSet = new Set<string>(VIGILANTE_MOD_IDS);
  const vigilanteWeaponCount = countSetModsInSlots(localMods, vigSet);
  const vigFromWf = linkage ? countSetModsInSlots(linkage.warframeMods, vigSet) : (sim.extraVigilanteModsFromWarframe ?? 0);
  const vigPieces = vigilanteWeaponCount + vigFromWf;

  const synthPieces = linkage
    ? countSynthSetPieces(linkage, localMods)
    : countSynthSetPieces(undefined, localMods) + (sim.extraSynthSetPiecesOffWeapon ?? 0);

  const tekPieces = linkage
    ? countTekSetPieces(linkage, localMods)
    : countTekSetPieces(undefined, localMods) + (sim.extraTekSetPiecesOffWeapon ?? 0);

  const primaryStyle = weaponSupportsPrimaryStyleSets(weapon);

  return [
    {
      setId: "vigilante",
      label: "Vigilante",
      pieces: vigPieces,
      required: 6,
      active: vigPieces > 0 && primaryStyle,
      description: "Each piece: +5% chance to improve primary crit tier (stacks with all equipped Vigilante mods)",
    },
    {
      setId: "synth",
      label: "Synth",
      pieces: synthPieces,
      required: 4,
      active: synthPieces >= 4 && weaponAcceptsSynthReloadBonus(weapon),
      description: "4-piece: +15% Pistol Reload Speed",
    },
    {
      setId: "tek",
      label: "Tek",
      pieces: tekPieces,
      required: 4,
      active:
        tekPieces >= 4 &&
        !!sim.applyTekSetVsMarkedDamage &&
        primaryStyle,
      description: "4-piece: +60% damage to marked enemies (optional DPS toggle)",
    },
  ];
}

export function buildWarframeSetBonusSummary(
  warframeMods: ModSlot[],
  linkage?: SetBonusLinkage,
): SetBonusSummaryLine[] {
  const augur = countAugurSetPieces(warframeMods, linkage?.secondaryMods);
  const hunter = countHunterSetPieces(linkage, warframeMods);
  const mecha = countMechaSetPieces(warframeMods, linkage?.companionMods);
  const synth = countSynthSetPieces(linkage, warframeMods);
  const tek = countTekSetPieces(linkage, warframeMods);

  return [
    {
      setId: "augur",
      label: "Augur",
      pieces: augur,
      required: 6,
      active: augur >= 6,
      description: "6-piece: 40% of Energy spent becomes Shields",
    },
    {
      setId: "hunter",
      label: "Hunter",
      pieces: hunter,
      required: 6,
      active: hunter >= 6,
      description: "6-piece: Companion deals +150% damage to status-affected enemies",
    },
    {
      setId: "mecha",
      label: "Mecha",
      pieces: mecha,
      required: 4,
      active: mecha >= 4,
      description: "4-piece: Marked enemies explode for +150% damage",
    },
    {
      setId: "synth",
      label: "Synth",
      pieces: synth,
      required: 4,
      active: synth >= 4,
      description: "4-piece: +15% Pistol Reload Speed; companion reloads secondary",
    },
    {
      setId: "tek",
      label: "Tek",
      pieces: tek,
      required: 4,
      active: tek >= 4,
      description: "4-piece: Kavat marks +10s; +60% damage to marked enemies",
    },
  ];
}
