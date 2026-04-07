// Core data types for Overframe

export interface Mod {
  id: string;
  name: string;
  polarity: string;
  drain: number;
  maxRank: number;
  category: string;
  stats: Record<string, number>;
  description: string;
  rarity: string;
  imagePath?: string;
  subCategory?: string;
  warframeId?: string; // For augments: which warframe this augment belongs to ('universal' = any)
}

export interface Weapon {
  id: string;
  name: string;
  category: string;
  damage: number;
  impact: number;
  puncture: number;
  slash: number;
  heat?: number;
  cold?: number;
  toxin?: number;
  electricity?: number;
  radiation?: number;
  viral?: number;
  corrosive?: number;
  fireRate: number;
  criticalChance: number;
  criticalMultiplier: number;
  statusChance: number;
  magazine: number;
  reloadTime: number;
  multishot: number;
  triggerType: string;
  modSlots: number;
  hasPrimaryArcaneSlot: boolean;
  hasSecondaryArcaneSlot: boolean;
  isIncarnon: boolean;
  incarnonEvolutions?: string[];
  hasRivenSlot: boolean;
  // Arcane configuration
  arcaneSlots?: number; // Number of arcane slots (default: 1 for weapons, 2 for warframes/archguns/kitguns/zaws)
  arcaneType?: string; // 'primary' | 'secondary' | 'melee' | 'kitgun' | 'exodia' | 'archgun' | 'amp'
  // Stance (melee only)
  stanceType?: string; // e.g. 'sword', 'heavy_blade', 'dual_swords', etc. Used to filter stance mods
  // Exalted weapon fields
  warframeId?: string;
  abilityName?: string;
  isExalted?: boolean;
  // Companion weapon fields
  companionType?: string;
  weaponCategory?: string;
  // Tektolyst Artifact fields
  focusSchool?: string; // 'Zenurik' | 'Naramon' | 'Madurai' | 'Unairu' | 'Vazarin'
  /** Kitgun chamber category — used for arsenal-parity status display. */
  kitgunChamberCategory?: "projectile_shotgun" | "projectile_rifle" | "hitscan_auto" | "beam";
}

export interface Warframe {
  id: string;
  name: string;
  health: number;
  shield: number;
  armor: number;
  energy: number;
  sprintSpeed: number;
  abilities: Ability[];
  description: string;
  passive: string;
}

export interface Ability {
  name: string;
  energyCost: number;
  description: string;
  subAbilities?: string[];
  damage?: number;
  directDamage?: number;
  aoeDamage?: number;
  damagePerSecond?: number;
  range?: number;
  duration?: number;
  radius?: number;
  health?: number;
  armor?: number;
  shield?: number;
  damageReduction?: number;
  damageBuff?: number;
  statusChance?: number;
  damageType?: string;
  castTime?: number;
  cooldown?: number;
  maxTargets?: number;
  chainRange?: number;
  chainLinks?: number;
  comboMultiplier?: number;
  miscStats?: Record<string, unknown>;
}

export interface ArchonShard {
  id: string;
  name: string;
  color: string;
  tier: number; // 1 = standard, 2 = tauforged
  statBonuses: Record<string, number>;
  description: string;
  isCoalescent: boolean;
}

export interface ModSlot {
  modId: string;
  rank: number;
  slotIndex: number;
}

export interface EquippedMod {
  modId: string;
  modName: string;
  rank: number;
  slotIndex: number;
  polarity?: string;
  drain?: number;
}

export interface EquippedArchonShard {
  shardId: string;
  shardColor: string;
  shardTier: number;
  selectedBonus: string;
  bonusValue: number;
  slotIndex: number;
}

export interface ElementalDamage {
  type: string; // 'heat' | 'cold' | 'toxin' | 'electricity' | 'blast' | 'corrosive' | 'gas' | 'magnetic' | 'radiation' | 'viral'
  value: number;
}

export interface StatusProc {
  type: string;
  chance: number; // weighted chance for this element
  damagePerTick: number;
  duration: number;
  ticks: number;
  totalDamage: number;
  description: string;
}

export interface SimulationParams {
  comboCount: number;         // melee combo hit count (default 0)
  killStacks: number;         // Galvanized / Berserker on-kill stacks (0-5)
  statusTypesOnTarget: number; // Condition Overload / Galvanized Aptitude (0-5)
  arcaneStacks: number;       // arcane stack count (0 to max, usually 0-5)
  extraGladiatorMods: number; // Gladiator mods on warframe (0-3, adds to weapon-side count)
}

export const DEFAULT_SIM_PARAMS: SimulationParams = {
  comboCount: 0,
  killStacks: 0,
  statusTypesOnTarget: 0,
  arcaneStacks: 0,
  extraGladiatorMods: 0,
};

export interface CalculatedStats {
  totalDamage: number;
  impact: number;
  puncture: number;
  slash: number;
  // Elemental damage breakdown
  elements: ElementalDamage[];
  rawElements: { type: string; value: number }[]; // before combo resolution, for UI ordering
  // Core stats
  fireRate: number;
  criticalChance: number;
  criticalMultiplier: number;
  statusChance: number;
  statusChancePerShot: number;
  magazine: number;
  reloadTime: number;
  multishot: number;
  // DPS
  burstDps: number;
  sustainedDps: number;
  // Status procs
  statusProcs: StatusProc[];
  // Heavy attack / combo (melee)
  heavyAttackDamage: number;
  heavyAttackWindUp: number;
  comboCount: number;
  comboDuration: number;
  heavyAttackEfficiency: number; // from mods like Killing Blow
  comboMultiplier: number; // derived from comboCount
  // Conditional mod tracking
  conditionOverloadBonus: number; // per unique status
  bloodRushStacks: number; // crit from combo
  weavingFrameBonus: number;
  // Simulation state (for UI display)
  simParams: SimulationParams;
  galvanizedMultishotOnKill: number; // per-stack bonus from Galvanized Chamber/Hell/Diffusion
  galvanizedDamagePerStatus: number; // per-status bonus from Galvanized Aptitude/Savvy/Shot
  berserkerFuryBonus: number; // per-stack attack speed bonus
  weepingWoundsBonus: number; // status chance bonus per combo tier
  vigilanteCritBonus?: number; // Vigilante set: chance to enhance crit tier (0.05 per mod)
}

export interface WarframeCalculatedStats {
  baseHealth: number;
  baseShield: number;
  baseArmor: number;
  /** Unmodded max energy at rank 30 — Flow / +% energy mods multiply this (wiki Energymax). */
  baseEnergy: number;
  baseSprint: number;
  healthBonus: number;
  shieldBonus: number;
  armorBonus: number;
  energyBonus: number;
  sprintSpeedBonus: number;
  flowBonus: number;
  // Flat additions from Archon Shards (Azure, Topaz)
  flatHealthBonus: number;
  flatShieldBonus: number;
  flatArmorBonus: number;
  flatEnergyBonus: number;
  abilityStrength: number;
  abilityDuration: number;
  abilityEfficiency: number;
  abilityRange: number;
  totalHealth: number;
  totalShield: number;
  totalArmor: number;
  totalEnergy: number;
  totalSprint: number;
  effectiveHealth: number;
  damageReduction: number;
  // Shard-specific display stats
  castingSpeedBonus: number;
  parkourVelocityBonus: number;
  healthRegenPerSec: number;
  elementalResistance: number;
  primaryShardBonus: number;
  secondaryShardBonus: number;
  meleeCritDamageBonus: number;
  healingBonus: number;
  statusDurationBonus: number;
  energyCostReduction: number;
}

export interface Companion {
  id: string;
  name: string;
  type: string; // 'sentinel' | 'kubrow' | 'kavat' | 'moa' | 'predasite' | 'vulpaphyla' | 'hound'
  health: number;
  shield: number;
  armor: number;
  description: string;
  precept: string;
}

export interface CompanionCalculatedStats {
  baseHealth: number;
  baseShield: number;
  baseArmor: number;
  totalHealth: number;
  totalShield: number;
  totalArmor: number;
  healthBonus: number;
  shieldBonus: number;
  armorBonus: number;
  meleeDamageBonus: number;
  attackSpeedBonus: number;
  critChanceBonus: number;
  critDamageBonus: number;
  effectiveHealth: number;
  damageReduction: number;
}

export interface Loadout {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  warframeBuild?: {
    warframeId: string;
    mods: ModSlot[];
    shards: (EquippedArchonShard | null)[];
    hasOrokinReactor: boolean;
  };
  primaryBuild?: {
    weaponId: string;
    mods: ModSlot[];
    hasOrokinCatalyst: boolean;
  };
  secondaryBuild?: {
    weaponId: string;
    mods: ModSlot[];
    hasOrokinCatalyst: boolean;
  };
  meleeBuild?: {
    weaponId: string;
    mods: ModSlot[];
    hasOrokinCatalyst: boolean;
  };
  companionBuild?: {
    companionId: string;
    mods: ModSlot[];
    weaponMods: ModSlot[];
    hasReactor: boolean;
    hasCatalyst: boolean;
  };
  modularBuild?: {
    type: string; // 'kitgun' | 'zaw' | 'amp'
    parts: Record<string, string>; // part slot -> part id
    mods: ModSlot[];
    hasOrokinCatalyst: boolean;
    name?: string; // custom name for the modular weapon
  };
  archwingBuild?: {
    archwingId?: string;
    necramechId?: string;
    mode: string; // 'archwing' | 'necramech'
    frameMods: ModSlot[];
    weaponId?: string;
    weaponMods: ModSlot[];
    hasReactor: boolean;
    hasCatalyst: boolean;
  };
}

export interface RivenMod {
  weaponName: string;
  stats: Record<string, number>; // e.g. { damage: 0.25, criticalChance: 0.15, statusChance: -0.10 }
  mastery: number;
  rolls: number;
}

// Riven stat definition with calculator key mapping
export interface RivenStatDef {
  key: string;       // calculator key (e.g. "damage", "criticalChance")
  label: string;     // display name
  isPercent: boolean; // whether value is entered as %
}

// Stats available per weapon category for rivens
const RIVEN_RANGED_COMMON: RivenStatDef[] = [
  { key: "damage", label: "Damage", isPercent: true },
  { key: "criticalChance", label: "Critical Chance", isPercent: true },
  { key: "criticalMultiplier", label: "Critical Damage", isPercent: true },
  { key: "statusChance", label: "Status Chance", isPercent: true },
  { key: "multishot", label: "Multishot", isPercent: true },
  { key: "fireRate", label: "Fire Rate", isPercent: true },
  { key: "magazine", label: "Magazine Capacity", isPercent: true },
  { key: "reloadSpeed", label: "Reload Speed", isPercent: true },
  { key: "toxin", label: "Toxin Damage", isPercent: true },
  { key: "cold", label: "Cold Damage", isPercent: true },
  { key: "heat", label: "Heat Damage", isPercent: true },
  { key: "electricity", label: "Electricity Damage", isPercent: true },
  { key: "impact", label: "Impact", isPercent: true },
  { key: "puncture", label: "Puncture", isPercent: true },
  { key: "slash", label: "Slash", isPercent: true },
  { key: "projectileSpeed", label: "Projectile Speed", isPercent: true },
];

const RIVEN_RIFLE: RivenStatDef[] = [
  ...RIVEN_RANGED_COMMON,
  { key: "zoom", label: "Zoom", isPercent: true },
  { key: "punchThrough", label: "Punch Through", isPercent: false },
  { key: "ammoMax", label: "Ammo Maximum", isPercent: true },
  { key: "recoil", label: "Recoil", isPercent: true },
];

const RIVEN_SHOTGUN: RivenStatDef[] = [
  ...RIVEN_RANGED_COMMON,
  { key: "ammoMax", label: "Ammo Maximum", isPercent: true },
];

const RIVEN_PISTOL: RivenStatDef[] = [
  ...RIVEN_RANGED_COMMON,
  { key: "zoom", label: "Zoom", isPercent: true },
  { key: "ammoMax", label: "Ammo Maximum", isPercent: true },
  { key: "recoil", label: "Recoil", isPercent: true },
];

const RIVEN_MELEE: RivenStatDef[] = [
  { key: "damage", label: "Damage", isPercent: true },
  { key: "criticalChance", label: "Critical Chance", isPercent: true },
  { key: "criticalMultiplier", label: "Critical Damage", isPercent: true },
  { key: "statusChance", label: "Status Chance", isPercent: true },
  { key: "fireRate", label: "Attack Speed", isPercent: true },
  { key: "range", label: "Range", isPercent: true },
  { key: "toxin", label: "Toxin Damage", isPercent: true },
  { key: "cold", label: "Cold Damage", isPercent: true },
  { key: "heat", label: "Heat Damage", isPercent: true },
  { key: "electricity", label: "Electricity Damage", isPercent: true },
  { key: "impact", label: "Impact", isPercent: true },
  { key: "puncture", label: "Puncture", isPercent: true },
  { key: "slash", label: "Slash", isPercent: true },
  { key: "slideAttack", label: "Slide Attack", isPercent: true },
  { key: "finisherDamage", label: "Finisher Damage", isPercent: true },
  { key: "comboDuration", label: "Combo Duration", isPercent: false },
];

const RIVEN_ARCHGUN: RivenStatDef[] = [
  ...RIVEN_RANGED_COMMON.filter(s => s.key !== "impact" && s.key !== "puncture" && s.key !== "slash"),
  { key: "ammoMax", label: "Ammo Maximum", isPercent: true },
];

// Get riven stats filtered by weapon category
export function getRivenStatsForCategory(weaponCategory: string): RivenStatDef[] {
  const cat = weaponCategory.toLowerCase();
  if (cat === "melee" || cat === "zaw_strike" || cat === "archmelee") return RIVEN_MELEE;
  if (cat === "shotgun") return RIVEN_SHOTGUN;
  if (cat === "pistol" || cat === "secondary" || cat === "dual_pistols" || cat === "kitgun_chamber" || cat === "sentinel_weapon") return RIVEN_PISTOL;
  if (cat === "archgun") return RIVEN_ARCHGUN;
  // rifle, bow, launcher, primary, etc.
  return RIVEN_RIFLE;
}

// Legacy: flat list for backward compat
export const RIVEN_STATS = RIVEN_RIFLE;

export type WeaponCategory = 'rifle' | 'pistol' | 'shotgun' | 'bow' | 'melee' | 'secondary' | 'primary';
export type ModCategory = 'primary' | 'secondary' | 'melee' | 'warframe' | 'companion' | 'archwing';
export type ShardColor = 'crimson' | 'azure' | 'amber' | 'violet' | 'topaz' | 'emerald';
