// Modular Weapons Data - Kitguns, Zaws, Amps
// Converted from lib/data/modular_weapons.dart

import { Weapon } from "@/lib/types";

// ── KITGUN CHAMBERS ──────────────────────────────────────────────────────
export const kitgunChambers: Weapon[] = [
  { id: "catchmoon_chamber", name: "Catchmoon", category: "kitgun_chamber", damage: 260, impact: 130, puncture: 26, slash: 104, fireRate: 2.33, criticalChance: 0.24, criticalMultiplier: 2.2, statusChance: 0.22, magazine: 13, reloadTime: 1.3, multishot: 1, triggerType: "Semi", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "gaze_chamber", name: "Gaze", category: "kitgun_chamber", damage: 10, impact: 0, puncture: 0, slash: 0, fireRate: 12, criticalChance: 0.32, criticalMultiplier: 2.3, statusChance: 0.26, magazine: 73, reloadTime: 1.2, multishot: 1, triggerType: "Auto", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "rattleguts_chamber", name: "Rattleguts", category: "kitgun_chamber", damage: 25, impact: 8, puncture: 10, slash: 7, fireRate: 9.33, criticalChance: 0.18, criticalMultiplier: 1.8, statusChance: 0.20, magazine: 57, reloadTime: 1.4, multishot: 1, triggerType: "Auto", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "tombfinger_chamber", name: "Tombfinger", category: "kitgun_chamber", damage: 70, impact: 21, puncture: 28, slash: 21, fireRate: 3.33, criticalChance: 0.22, criticalMultiplier: 2.0, statusChance: 0.18, magazine: 33, reloadTime: 1.5, multishot: 1, triggerType: "Charge", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "vermisplicer_chamber", name: "Vermisplicer", category: "kitgun_chamber", damage: 14, impact: 0, puncture: 0, slash: 0, fireRate: 8.33, criticalChance: 0.28, criticalMultiplier: 2.1, statusChance: 0.24, magazine: 61, reloadTime: 1.2, multishot: 1, triggerType: "Auto", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "sporelacer_chamber", name: "Sporelacer", category: "kitgun_chamber", damage: 180, impact: 54, puncture: 72, slash: 54, fireRate: 2.5, criticalChance: 0.20, criticalMultiplier: 1.9, statusChance: 0.28, magazine: 9, reloadTime: 1.6, multishot: 1, triggerType: "Semi", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
];

// ── KITGUN GRIPS ─────────────────────────────────────────────────────────
export interface KitgunGrip {
  id: string;
  name: string;
  damageMultiplier: number;
  fireRateMultiplier: number;
  magazineBonus: number;
  reloadSpeedMultiplier: number;
  type: "primary" | "secondary" | "universal";
}

export const kitgunGrips: KitgunGrip[] = [
  { id: "grip_brash", name: "Brash", damageMultiplier: 0.85, fireRateMultiplier: 1.35, magazineBonus: 0, reloadSpeedMultiplier: 1.0, type: "primary" },
  { id: "grip_gibber", name: "Gibber", damageMultiplier: 0.85, fireRateMultiplier: 1.35, magazineBonus: 0, reloadSpeedMultiplier: 1.0, type: "secondary" },
  { id: "grip_haymaker", name: "Haymaker", damageMultiplier: 1.3, fireRateMultiplier: 0.75, magazineBonus: 0, reloadSpeedMultiplier: 1.0, type: "secondary" },
  { id: "grip_lovetap", name: "Lovetap", damageMultiplier: 1.1, fireRateMultiplier: 0.9, magazineBonus: 8, reloadSpeedMultiplier: 1.0, type: "secondary" },
  { id: "grip_palmaris", name: "Palmaris", damageMultiplier: 1.0, fireRateMultiplier: 1.0, magazineBonus: 0, reloadSpeedMultiplier: 1.0, type: "universal" },
  { id: "grip_ramble", name: "Ramble", damageMultiplier: 0.9, fireRateMultiplier: 1.2, magazineBonus: 0, reloadSpeedMultiplier: 1.0, type: "universal" },
  { id: "grip_shrewd", name: "Shrewd", damageMultiplier: 1.0, fireRateMultiplier: 1.0, magazineBonus: 12, reloadSpeedMultiplier: 0.8, type: "universal" },
  { id: "grip_steadyslam", name: "Steadyslam", damageMultiplier: 1.15, fireRateMultiplier: 0.88, magazineBonus: 4, reloadSpeedMultiplier: 1.0, type: "universal" },
  { id: "grip_tremor", name: "Tremor", damageMultiplier: 1.25, fireRateMultiplier: 0.8, magazineBonus: 16, reloadSpeedMultiplier: 1.0, type: "universal" },
  { id: "grip_zipneedle", name: "Zipneedle", damageMultiplier: 0.75, fireRateMultiplier: 1.45, magazineBonus: 0, reloadSpeedMultiplier: 1.0, type: "universal" },
];

// ── KITGUN LOADERS ───────────────────────────────────────────────────────
export interface KitgunLoader {
  id: string;
  name: string;
  criticalChanceBonus: number;
  statusChanceBonus: number;
  magazineMultiplier: number;
  reloadSpeedMultiplier: number;
}

export const kitgunLoaders: KitgunLoader[] = [
  { id: "loader_arcroid", name: "Arcroid", criticalChanceBonus: 0.0, statusChanceBonus: 0.0, magazineMultiplier: 1.0, reloadSpeedMultiplier: 1.0 },
  { id: "loader_bashrack", name: "Bashrack", criticalChanceBonus: 0.05, statusChanceBonus: -0.08, magazineMultiplier: 1.0, reloadSpeedMultiplier: 1.0 },
  { id: "loader_bellows", name: "Bellows", criticalChanceBonus: 0.0, statusChanceBonus: 0.0, magazineMultiplier: 0.5, reloadSpeedMultiplier: 1.4 },
  { id: "loader_deepbreath", name: "Deepbreath", criticalChanceBonus: 0.0, statusChanceBonus: 0.0, magazineMultiplier: 0.3, reloadSpeedMultiplier: 1.6 },
  { id: "loader_flutterfire", name: "Flutterfire", criticalChanceBonus: -0.08, statusChanceBonus: 0.05, magazineMultiplier: 1.0, reloadSpeedMultiplier: 1.0 },
  { id: "loader_killstream", name: "Killstream", criticalChanceBonus: 0.0, statusChanceBonus: 0.0, magazineMultiplier: 0.7, reloadSpeedMultiplier: 1.1 },
  { id: "loader_macro_arcroid", name: "Macro Arcroid", criticalChanceBonus: 0.0, statusChanceBonus: 0.0, magazineMultiplier: 1.0, reloadSpeedMultiplier: 1.0 },
  { id: "loader_macro_thymoid", name: "Macro Thymoid", criticalChanceBonus: 0.07, statusChanceBonus: 0.07, magazineMultiplier: 1.0, reloadSpeedMultiplier: 1.0 },
  { id: "loader_ramflare", name: "Ramflare", criticalChanceBonus: -0.06, statusChanceBonus: 0.08, magazineMultiplier: 1.0, reloadSpeedMultiplier: 1.0 },
  { id: "loader_slap", name: "Slap", criticalChanceBonus: 0.0, statusChanceBonus: 0.0, magazineMultiplier: 1.3, reloadSpeedMultiplier: 1.0 },
  { id: "loader_slapneedle", name: "Slapneedle", criticalChanceBonus: 0.08, statusChanceBonus: -0.06, magazineMultiplier: 1.2, reloadSpeedMultiplier: 1.0 },
  { id: "loader_sparkfire", name: "Sparkfire", criticalChanceBonus: -0.05, statusChanceBonus: 0.08, magazineMultiplier: 0.6, reloadSpeedMultiplier: 0.8 },
  { id: "loader_splat", name: "Splat", criticalChanceBonus: 0.08, statusChanceBonus: -0.08, magazineMultiplier: 1.0, reloadSpeedMultiplier: 1.0 },
  { id: "loader_stitch", name: "Stitch", criticalChanceBonus: 0.05, statusChanceBonus: -0.08, magazineMultiplier: 0.5, reloadSpeedMultiplier: 1.4 },
  { id: "loader_swiftfire", name: "Swiftfire", criticalChanceBonus: -0.06, statusChanceBonus: 0.08, magazineMultiplier: 1.0, reloadSpeedMultiplier: 1.0 },
  { id: "loader_thunderdrum", name: "Thunderdrum", criticalChanceBonus: -0.06, statusChanceBonus: 0.08, magazineMultiplier: 0.5, reloadSpeedMultiplier: 1.4 },
  { id: "loader_thymoid", name: "Thymoid", criticalChanceBonus: 0.0, statusChanceBonus: 0.0, magazineMultiplier: 0.7, reloadSpeedMultiplier: 1.1 },
  { id: "loader_zip", name: "Zip", criticalChanceBonus: 0.0, statusChanceBonus: 0.0, magazineMultiplier: 1.3, reloadSpeedMultiplier: 0.85 },
  { id: "loader_zipfire", name: "Zipfire", criticalChanceBonus: -0.08, statusChanceBonus: 0.08, magazineMultiplier: 1.0, reloadSpeedMultiplier: 1.0 },
  { id: "loader_zipneedle", name: "Zipneedle", criticalChanceBonus: 0.08, statusChanceBonus: -0.06, magazineMultiplier: 1.2, reloadSpeedMultiplier: 1.0 },
];

// ── ZAW STRIKES ──────────────────────────────────────────────────────────
export const zawStrikes: Weapon[] = [
  { id: "zaw_plague_kripath", name: "Plague Kripath", category: "zaw_strike", damage: 304, impact: 76, puncture: 76, slash: 152, fireRate: 0.917, criticalChance: 0.22, criticalMultiplier: 2.2, statusChance: 0.22, magazine: 0, reloadTime: 0, multishot: 1, triggerType: "Melee", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "zaw_plague_keewar", name: "Plague Keewar", category: "zaw_strike", damage: 312, impact: 46.8, puncture: 78, slash: 187.2, fireRate: 0.833, criticalChance: 0.20, criticalMultiplier: 2.0, statusChance: 0.20, magazine: 0, reloadTime: 0, multishot: 1, triggerType: "Melee", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "zaw_sepfahn", name: "Sepfahn", category: "zaw_strike", damage: 304, impact: 76, puncture: 76, slash: 152, fireRate: 0.917, criticalChance: 0.32, criticalMultiplier: 2.2, statusChance: 0.14, magazine: 0, reloadTime: 0, multishot: 1, triggerType: "Melee", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "zaw_rabvee", name: "Rabvee", category: "zaw_strike", damage: 324, impact: 162, puncture: 48.6, slash: 113.4, fireRate: 0.783, criticalChance: 0.16, criticalMultiplier: 2.0, statusChance: 0.22, magazine: 0, reloadTime: 0, multishot: 1, triggerType: "Melee", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "zaw_ooltha", name: "Ooltha", category: "zaw_strike", damage: 298, impact: 74.5, puncture: 74.5, slash: 149, fireRate: 0.867, criticalChance: 0.18, criticalMultiplier: 2.0, statusChance: 0.18, magazine: 0, reloadTime: 0, multishot: 1, triggerType: "Melee", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "zaw_mewan", name: "Mewan", category: "zaw_strike", damage: 306, impact: 45.9, puncture: 76.5, slash: 183.6, fireRate: 0.833, criticalChance: 0.18, criticalMultiplier: 2.0, statusChance: 0.18, magazine: 0, reloadTime: 0, multishot: 1, triggerType: "Melee", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "zaw_kronsh", name: "Kronsh", category: "zaw_strike", damage: 318, impact: 159, puncture: 47.7, slash: 111.3, fireRate: 0.833, criticalChance: 0.18, criticalMultiplier: 2.0, statusChance: 0.18, magazine: 0, reloadTime: 0, multishot: 1, triggerType: "Melee", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "zaw_dehtat", name: "Dehtat", category: "zaw_strike", damage: 284, impact: 71, puncture: 71, slash: 142, fireRate: 0.967, criticalChance: 0.20, criticalMultiplier: 2.0, statusChance: 0.20, magazine: 0, reloadTime: 0, multishot: 1, triggerType: "Melee", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "zaw_dokrahm", name: "Dokrahm", category: "zaw_strike", damage: 320, impact: 64, puncture: 64, slash: 192, fireRate: 0.767, criticalChance: 0.22, criticalMultiplier: 2.2, statusChance: 0.18, magazine: 0, reloadTime: 0, multishot: 1, triggerType: "Melee", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "zaw_cyath", name: "Cyath", category: "zaw_strike", damage: 296, impact: 88.8, puncture: 88.8, slash: 118.4, fireRate: 0.917, criticalChance: 0.18, criticalMultiplier: 2.0, statusChance: 0.18, magazine: 0, reloadTime: 0, multishot: 1, triggerType: "Melee", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
  { id: "zaw_balla", name: "Balla", category: "zaw_strike", damage: 276, impact: 27.6, puncture: 82.8, slash: 165.6, fireRate: 1.08, criticalChance: 0.20, criticalMultiplier: 2.0, statusChance: 0.20, magazine: 0, reloadTime: 0, multishot: 1, triggerType: "Melee", modSlots: 8, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: true },
];

// ── ZAW GRIPS ────────────────────────────────────────────────────────────
export interface ZawGrip {
  id: string;
  name: string;
  type: "1h" | "2h";
  damageMultiplier: number;
  speedMultiplier: number;
}

export const zawGrips: ZawGrip[] = [
  { id: "zaw_grip_korb", name: "Korb", type: "2h", damageMultiplier: 1.18, speedMultiplier: 0.88 },
  { id: "zaw_grip_jayap", name: "Jayap", type: "1h", damageMultiplier: 0.9, speedMultiplier: 1.1 },
  { id: "zaw_grip_kwath", name: "Kwath", type: "1h", damageMultiplier: 1.0, speedMultiplier: 0.95 },
  { id: "zaw_grip_laka", name: "Laka", type: "1h", damageMultiplier: 0.95, speedMultiplier: 1.05 },
  { id: "zaw_grip_peye", name: "Peye", type: "1h", damageMultiplier: 0.92, speedMultiplier: 1.08 },
  { id: "zaw_grip_plague_akwin", name: "Plague Akwin", type: "1h", damageMultiplier: 0.88, speedMultiplier: 1.12 },
  { id: "zaw_grip_kroostra", name: "Kroostra", type: "2h", damageMultiplier: 1.15, speedMultiplier: 0.9 },
  { id: "zaw_grip_seekalla", name: "Seekalla", type: "2h", damageMultiplier: 0.85, speedMultiplier: 1.15 },
  { id: "zaw_grip_shtung", name: "Shtung", type: "2h", damageMultiplier: 1.2, speedMultiplier: 0.85 },
  { id: "zaw_grip_plague_bokwin", name: "Plague Bokwin", type: "2h", damageMultiplier: 1.1, speedMultiplier: 0.95 },
];

// ── ZAW LINKS ────────────────────────────────────────────────────────────
export interface ZawLink {
  id: string;
  name: string;
  critBonus: number;
  statusBonus: number;
  damageBonus: number;
  speedBonus: number;
}

export const zawLinks: ZawLink[] = [
  { id: "zaw_link_ruhang", name: "Ruhang", critBonus: 0.0, statusBonus: 0.0, damageBonus: 0.07, speedBonus: -0.03 },
  { id: "zaw_link_jai", name: "Jai", critBonus: 0.0, statusBonus: 0.0, damageBonus: -0.07, speedBonus: 0.03 },
  { id: "zaw_link_ruhang_2", name: "Ruhang II", critBonus: 0.0, statusBonus: 0.0, damageBonus: 0.14, speedBonus: -0.06 },
  { id: "zaw_link_jai_2", name: "Jai II", critBonus: 0.0, statusBonus: 0.0, damageBonus: -0.14, speedBonus: 0.06 },
  { id: "zaw_link_vargeet_ruhang", name: "Vargeet Ruhang", critBonus: 0.07, statusBonus: -0.04, damageBonus: 0.07, speedBonus: -0.03 },
  { id: "zaw_link_vargeet_2_ruhang", name: "Vargeet II Ruhang", critBonus: 0.14, statusBonus: -0.08, damageBonus: 0.07, speedBonus: -0.03 },
  { id: "zaw_link_vargeet_ruhang_2", name: "Vargeet Ruhang II", critBonus: 0.07, statusBonus: -0.04, damageBonus: 0.14, speedBonus: -0.06 },
  { id: "zaw_link_ekwana_ruhang", name: "Ekwana Ruhang", critBonus: -0.04, statusBonus: 0.07, damageBonus: 0.07, speedBonus: -0.03 },
  { id: "zaw_link_ekwana_2_ruhang", name: "Ekwana II Ruhang", critBonus: -0.08, statusBonus: 0.14, damageBonus: 0.07, speedBonus: -0.03 },
  { id: "zaw_link_ekwana_ruhang_2", name: "Ekwana Ruhang II", critBonus: -0.04, statusBonus: 0.07, damageBonus: 0.14, speedBonus: -0.06 },
  { id: "zaw_link_vargeet_jai", name: "Vargeet Jai", critBonus: 0.07, statusBonus: -0.04, damageBonus: -0.07, speedBonus: 0.03 },
  { id: "zaw_link_vargeet_2_jai", name: "Vargeet II Jai", critBonus: 0.14, statusBonus: -0.08, damageBonus: -0.07, speedBonus: 0.03 },
  { id: "zaw_link_vargeet_jai_2", name: "Vargeet Jai II", critBonus: 0.07, statusBonus: -0.04, damageBonus: -0.14, speedBonus: 0.06 },
  { id: "zaw_link_ekwana_jai", name: "Ekwana Jai", critBonus: -0.04, statusBonus: 0.07, damageBonus: -0.07, speedBonus: 0.03 },
  { id: "zaw_link_ekwana_2_jai", name: "Ekwana II Jai", critBonus: -0.08, statusBonus: 0.14, damageBonus: -0.07, speedBonus: 0.03 },
  { id: "zaw_link_ekwana_jai_2", name: "Ekwana Jai II", critBonus: -0.04, statusBonus: 0.07, damageBonus: -0.14, speedBonus: 0.06 },
];

// ── AMP PRISMS ───────────────────────────────────────────────────────────
export const ampPrisms: Weapon[] = [
  { id: "amp_raplak", name: "Raplak", category: "amp_prism", damage: 30, impact: 10, puncture: 10, slash: 10, fireRate: 3.33, criticalChance: 0.30, criticalMultiplier: 2.2, statusChance: 0.10, magazine: 100, reloadTime: 2, multishot: 1, triggerType: "Semi", modSlots: 0, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: false },
  { id: "amp_shwaak", name: "Shwaak", category: "amp_prism", damage: 50, impact: 0, puncture: 0, slash: 0, fireRate: 1.67, criticalChance: 0.10, criticalMultiplier: 1.6, statusChance: 0.24, magazine: 100, reloadTime: 2, multishot: 1, triggerType: "Semi", modSlots: 0, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: false },
  { id: "amp_granmu", name: "Granmu", category: "amp_prism", damage: 60, impact: 20, puncture: 20, slash: 20, fireRate: 2.0, criticalChance: 0.15, criticalMultiplier: 1.8, statusChance: 0.20, magazine: 100, reloadTime: 2, multishot: 1, triggerType: "Burst", modSlots: 0, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: false },
  { id: "amp_rahn", name: "Rahn", category: "amp_prism", damage: 35, impact: 12, puncture: 12, slash: 11, fireRate: 4.0, criticalChance: 0.32, criticalMultiplier: 2.3, statusChance: 0.12, magazine: 100, reloadTime: 2, multishot: 1, triggerType: "Semi", modSlots: 0, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: false },
  { id: "amp_cantic", name: "Cantic", category: "amp_prism", damage: 40, impact: 0, puncture: 0, slash: 0, fireRate: 5.0, criticalChance: 0.22, criticalMultiplier: 2.0, statusChance: 0.18, magazine: 100, reloadTime: 2, multishot: 1, triggerType: "Auto", modSlots: 0, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: false },
  { id: "amp_lega", name: "Lega", category: "amp_prism", damage: 25, impact: 0, puncture: 0, slash: 0, fireRate: 8.0, criticalChance: 0.12, criticalMultiplier: 1.6, statusChance: 0.30, magazine: 100, reloadTime: 2, multishot: 1, triggerType: "Auto", modSlots: 0, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: false },
  { id: "amp_klamora", name: "Klamora", category: "amp_prism", damage: 15, impact: 0, puncture: 0, slash: 0, fireRate: 12.0, criticalChance: 0.18, criticalMultiplier: 2.0, statusChance: 0.28, magazine: 100, reloadTime: 2, multishot: 1, triggerType: "Auto", modSlots: 0, hasPrimaryArcaneSlot: false, hasSecondaryArcaneSlot: false, isIncarnon: false, hasRivenSlot: false },
];

// ── AMP SCAFFOLDS ────────────────────────────────────────────────────────
export interface AmpScaffold {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  criticalChance: number;
  criticalMultiplier: number;
  statusChance: number;
  description: string;
}

export const ampScaffolds: AmpScaffold[] = [
  { id: "amp_pencha", name: "Pencha", damage: 200, fireRate: 0.5, criticalChance: 0.10, criticalMultiplier: 1.6, statusChance: 0.20, description: "Charge beam" },
  { id: "amp_shraksun", name: "Shraksun", damage: 150, fireRate: 1.0, criticalChance: 0.12, criticalMultiplier: 1.8, statusChance: 0.24, description: "Explosive projectile" },
  { id: "amp_klebrik", name: "Klebrik", damage: 80, fireRate: 2.0, criticalChance: 0.20, criticalMultiplier: 2.0, statusChance: 0.18, description: "Homing beam" },
  { id: "amp_phahd", name: "Phahd", damage: 510, fireRate: 1.0, criticalChance: 0.34, criticalMultiplier: 2.6, statusChance: 0.12, description: "Bouncing glaive" },
  { id: "amp_exard", name: "Exard", damage: 100, fireRate: 6.67, criticalChance: 0.17, criticalMultiplier: 1.9, statusChance: 0.33, description: "Full-auto" },
  { id: "amp_dissic", name: "Dissic", damage: 600, fireRate: 0.5, criticalChance: 0.03, criticalMultiplier: 1.5, statusChance: 0.37, description: "Lobbed explosive" },
  { id: "amp_propa", name: "Propa", damage: 9000, fireRate: 1.0, criticalChance: 0.30, criticalMultiplier: 2.0, statusChance: 0.05, description: "Deployable mine" },
];

// ── AMP BRACES ───────────────────────────────────────────────────────────
export interface AmpBrace {
  id: string;
  name: string;
  rechargeDelayReduction: number;
  maxEnergyBonus: number;
  rechargeRateBonus: number;
}

export const ampBraces: AmpBrace[] = [
  { id: "amp_juttni", name: "Juttni", rechargeDelayReduction: 0.5, maxEnergyBonus: 0, rechargeRateBonus: 0 },
  { id: "amp_lohrin", name: "Lohrin", rechargeDelayReduction: 0, maxEnergyBonus: 0, rechargeRateBonus: 0.25 },
  { id: "amp_anspatha", name: "Anspatha", rechargeDelayReduction: 0, maxEnergyBonus: 40, rechargeRateBonus: 0 },
  { id: "amp_suo", name: "Suo", rechargeDelayReduction: -1.0, maxEnergyBonus: 100, rechargeRateBonus: 0 },
  { id: "amp_plaga", name: "Plaga", rechargeDelayReduction: 0.5, maxEnergyBonus: 0, rechargeRateBonus: 0 },
  { id: "amp_certus", name: "Certus", rechargeDelayReduction: 0, maxEnergyBonus: 0, rechargeRateBonus: 0 },
  { id: "amp_clapkra", name: "Clapkra", rechargeDelayReduction: 0, maxEnergyBonus: 40, rechargeRateBonus: 0 },
];

// ── HELPER: Build a Kitgun from parts ────────────────────────────────────
export function buildKitgun(chamber: Weapon, grip: KitgunGrip, loader: KitgunLoader): Weapon {
  const baseDmg = chamber.damage * grip.damageMultiplier;
  const ratio = chamber.damage > 0 ? 1 : 0;
  return {
    ...chamber,
    id: `kitgun_${chamber.id}_${grip.id}_${loader.id}`,
    name: `${chamber.name} (${grip.name} / ${loader.name})`,
    category: grip.type === "primary" ? "primary" : "secondary",
    damage: Math.round(baseDmg),
    impact: Math.round(chamber.impact * grip.damageMultiplier),
    puncture: Math.round(chamber.puncture * grip.damageMultiplier),
    slash: Math.round(chamber.slash * grip.damageMultiplier),
    fireRate: +(chamber.fireRate * grip.fireRateMultiplier).toFixed(2),
    criticalChance: +(chamber.criticalChance + loader.criticalChanceBonus).toFixed(4),
    criticalMultiplier: chamber.criticalMultiplier,
    statusChance: +(chamber.statusChance + loader.statusChanceBonus).toFixed(4),
    magazine: Math.round(chamber.magazine + grip.magazineBonus),
    reloadTime: +(chamber.reloadTime * (loader.reloadSpeedMultiplier || 1)).toFixed(2),
    arcaneSlots: 2,
    arcaneType: "kitgun",
  };
}

// ── HELPER: Build a Zaw from parts ───────────────────────────────────────
export function buildZaw(strike: Weapon, grip: ZawGrip, link: ZawLink): Weapon {
  const dmgMult = grip.damageMultiplier * (1 + link.damageBonus);
  return {
    ...strike,
    id: `zaw_${strike.id}_${grip.id}_${link.id}`,
    name: `${strike.name} (${grip.name} / ${link.name})`,
    category: "melee",
    damage: Math.round(strike.damage * dmgMult),
    impact: Math.round(strike.impact * dmgMult),
    puncture: Math.round(strike.puncture * dmgMult),
    slash: Math.round(strike.slash * dmgMult),
    fireRate: +(strike.fireRate * grip.speedMultiplier * (1 + link.speedBonus)).toFixed(3),
    criticalChance: +(strike.criticalChance + link.critBonus).toFixed(4),
    statusChance: +(strike.statusChance + link.statusBonus).toFixed(4),
    arcaneSlots: 2,
    arcaneType: "exodia",
  };
}
