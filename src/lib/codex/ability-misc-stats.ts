import type { Ability } from "@/lib/types";
import {
  getVerifiedFieldScaling,
  getVerifiedMiscScaling,
  type AbilityScaleAttribute,
  type VerifiedStatScaling,
} from "@/lib/codex/ability-scaling-registry";

export interface AbilityScaleContext {
  strength: number;
  duration: number;
  range: number;
}

export interface AbilityDisplayContext {
  warframeId?: string;
  abilityName: string;
  helminth?: boolean;
}

export interface ScaledMiscStatLine {
  label: string;
  base: string;
  scaled: string;
  modified: boolean;
  positive?: boolean;
  /** When wiki-verified scaling applies, which stat drives it. */
  scaleAttr?: AbilityScaleAttribute;
}

const SKIP_KEYS = new Set(["drCap", "slowCap", "channeled", "maxDuration", "damageRedirectionCap"]);

const LABELS: Record<string, string> = {
  shieldStrip: "Shield Strip",
  armorStrip: "Armor Strip",
  armorStripPerSecond: "Armor Strip/s",
  shieldStripPerSecond: "Shield Strip/s",
  slowPerSecond: "Slow/s",
  coneAngle: "Cone Angle",
  tickInterval: "Tick Interval",
  shieldRegen: "Shield Regen",
  shieldRechargeDelayReduction: "Shield Recharge Delay Red.",
  affinityRange: "Affinity Range",
  wellsLimit: "Wells Limit",
  judgmentVulnerability: "Judgment Vulnerability",
  judgmentChance: "Judgment Chance",
  altFireExplosion: "Alt-Fire Explosion",
  altFireEnergy: "Alt-Fire Energy",
  dashDistance: "Dash Distance",
  batteryChargeOnCast: "Battery Charge on Cast",
  batteryCharge: "Battery Charge",
  batteryDrain: "Battery Drain",
  batteryDrainPerSecond: "Battery Drain/s",
  energyRestorePerHit: "Energy Restore per Hit",
  emptyBatteryDrCap: "Empty-Battery DR Cap",
  areasPerElement: "Areas per Element",
  statusDurationMin: "Status Duration Min",
  statusDurationMax: "Status Duration Max",
  heatDamage: "Heat Damage",
  fireRateBuff: "Fire Rate Buff",
  attackSpeedBuff: "Attack Speed Buff",
  castSpeedBuff: "Cast Speed Buff",
  fieldDamagePerSecond: "Field Damage/s",
  fieldRadius: "Field Radius",
  maxSpheres: "Max Spheres",
  multiHitDamageMultiplier: "Multi-Hit Damage Mult.",
  contactDamagePerSecond: "Contact Damage/s",
  sphereLifetime: "Sphere Lifetime",
  implosionLifetime: "Implosion Lifetime",
  abilityCritChance: "Ability Crit Chance",
  durationCap: "Duration Cap",
  castingCooldown: "Casting Cooldown",
  dischargeDamage: "Discharge Damage",
  dischargeRange: "Discharge Range",
  moveSpeedMultiplier: "Move Speed Mult.",
  dischargeTargets: "Discharge Targets",
  simultaneousDischarges: "Simultaneous Discharges",
  dischargeCooldown: "Discharge Cooldown",
  shieldRestore: "Shield Restore",
  shieldsPerSecond: "Shields/s",
  shrapnelGrenades: "Shrapnel Grenades",
  shieldGrenades: "Shield Grenades",
  staggerChance: "Stagger Chance",
  shieldGateExtension: "Shield Gate Extension",
  shotsPerSecond: "Shots/s",
  firingArc: "Firing Arc",
  maxTurrets: "Max Turrets",
  damageBonusPerHit: "Damage Bonus per Hit",
  extraPickupChance: "Extra Pickup Chance",
  spawnInterval: "Spawn Interval",
  empoweredHealthRestore: "Empowered Health Orb",
  maxCaches: "Max Caches",
  damageConversion: "Damage Conversion",
  invulnerabilityDuration: "Invulnerability",
  rewindCountdown: "Rewind Countdown",
  lethalHealthRestore: "Lethal Health Restore",
  energyPerShot: "Energy per Shot",
  altFireDamage: "Alt-Fire Damage",
  pageFragments: "Page Fragments",
  seekAngle: "Seek Angle",
  seekDistance: "Seek Distance",
  overguardGain: "Overguard Gain",
  overguardCap: "Overguard Cap",
  healthHealPercent: "Health Heal",
  slashStatuses: "Slash Statuses",
  overguardRegenPerSecond: "Overguard Regen/s",
  overguardRegenTimer: "Overguard Regen Timer",
  statusDetonationMultiplier: "Status Detonation Mult.",
  damageCopied: "Damage Copied",
  noctuaCopyLimit: "Noctua Copies per Ally",
  pageflightDamage: "Pageflight Damage",
  statusChanceVulnerability: "Status Chance Vulnerability",
  statusDamageIncrease: "Status Damage Increase",
  statusVulnerabilityDuration: "Status Vulnerability Duration",
  paragrimmLimit: "Paragrimm Limit",
  paragrimmAttackRange: "Paragrimm Attack Range",
  empoweredDuration: "Empowered Duration",
  pillarHeight: "Pillar Height",
  maxPillars: "Max Pillars",
  pulseInterval: "Pulse Interval",
  empoweredPulseInterval: "Empowered Pulse Interval",
  radiationDamagePerTick: "Radiation Damage/Tick",
  damageVulnerability: "Damage Vulnerability",
  wallsGap: "Walls Gap",
  assemblyTime: "Assembly Time",
  damageInterval: "Damage Interval",
  radiationTicks: "Radiation Ticks",
  initialStatusStacks: "Initial Status Stacks",
  maxStatusStacks: "Max Status Stacks",
  damageRadius: "Damage Radius",
  stackChancePerStatus: "Stack Chance per Status",
  stackChanceCap: "Stack Chance Cap",
  explosionDamage: "Explosion Damage",
  explosionDamagePerStatus: "Explosion Damage per Status",
  beamRadius: "Beam Radius",
  beamTicksPerSecond: "Beam Ticks/s",
  beamDuration: "Beam Duration",
  healthConversion: "Damage to Health",
  vialCharges: "Vial Charges",
  residueRadius: "Residue Radius",
  chargeSpeed: "Charge Speed",
  probeSpeed: "Probe Speed",
  probeDuration: "Probe Duration",
  cooldownReduction: "Cooldown Reduction",
  haltDelay: "Halt Delay",
  probeCount: "Probe Count",
  travelTime: "Travel Time",
  gelMistReach: "Gel Mist Reach",
  damagePerStatus: "Damage per Status",
  missDrain: "Miss Drain",
  daggerCount: "Daggers",
  daggerAirtime: "Dagger Airtime",
  maxDaggersPerEnemy: "Max Daggers per Enemy",
  damageRedirection: "Damage Redirection",
  maxStorms: "Max Storms",
  ticksPerSecond: "Ticks/s",
  arc: "Arc",
  minRadius: "Min Radius",
  maxRadius: "Max Radius",
  rangeGrowthPerSecond: "Range Growth/s",
  energyDrainPerEnemy: "Energy Drain per Enemy",
  energyDrainEnemyCap: "Energy Drain Enemy Cap",
  deathWellGain: "Death Well Gain",
  deathWellGainPerSecond: "Death Well Gain/s",
  deathWellThreshold: "Death Well Threshold",
  deathWellDrain: "Death Well Drain",
  radialDamagePercent: "Radial Damage",
  radialDamageRange: "Radial Damage Range",
  debuffDuration: "Debuff Duration",
  throwDamage: "Throw Damage",
  sickleCount: "Sickles",
  minSpinRadius: "Min Spin Radius",
  maxSpinRadius: "Max Spin Radius",
  phantomWrathStored: "Phantom Wrath Stored",
  doomCritDamageBonus: "Doom Crit Damage",
  kaitheCount: "Kaithes",
  summonRadius: "Summon Radius",
  chargeVelocity: "Charge Velocity",
  wrathDamagePerSecond: "Wrath-Raised Damage/s",
  energyRestorePercent: "Energy Restore",
  dashDuration: "Dash Duration",
  shieldRestorePerSecond: "Shield Restore/s",
  maxConculysts: "Max Conculysts",
  maxOrtholysts: "Max Ortholysts",
  maxSummulysts: "Max Summulysts",
  detonationDamage: "Detonation Damage",
  streamCount: "Streams",
  enemyExplosionRadius: "Enemy Explosion Radius",
  evasionAngle: "Evasion Angle",
  restraintErosion: "Restraint Erosion",
  waveDuration: "Wave Duration",
  finisherDamageVulnerability: "Finisher Damage Vulnerability",
  daggerCharges: "Dagger Charges",
  damageReductionPerDagger: "Damage Reduction per Dagger",
  restraintRestoreOnCast: "Restraint Restore on Cast",
  restraintRestorePerSecond: "Restraint Restore/s",
  shieldsPerEnemy: "Shields per Enemy",
  waveWidth: "Wave Width",
  initialHealPercent: "Initial Heal",
  durationPer100Shields: "Duration per 100 Shields",
  energyConvert: "Energy Convert",
  headshotMultiplier: "Headshot Multiplier",
  baseCriticalChance: "Base Critical Chance",
  critChancePer100Damage: "Crit Chance per 100 Damage",
  critChanceDuration: "Crit Chance Duration",
  bodyshotCritChanceCap: "Bodyshot Crit Chance Cap",
  headshotCritChanceCap: "Headshot Crit Chance Cap",
  damageCaptureMultiplier: "Damage Capture Mult.",
  instantKillThreshold: "Instant Kill Threshold",
  staggerRadius: "Stagger Radius",
  mirrorContactDamage: "Mirror Contact Damage",
  healthPerSecond: "Health/s",
  damagePerSecond: "Damage/s",
  maxAltars: "Max Altars",
  energyGainPercent: "Energy Gain",
  healthDeducted: "Health Deducted",
  minimumHealth: "Minimum Health",
  slashStatusChance: "Slash Status Chance",
  maxRange: "Max Range",
  minChargeAngle: "Min Charge Angle",
  maxChargeAngle: "Max Charge Angle",
  initialProjectiles: "Initial Projectiles",
  knockbackRadius: "Knockback Radius",
  flameDuration: "Flame Duration",
  boostedDamage: "Boosted Damage",
  unchargedThrowDistance: "Uncharged Throw Distance",
  chargedThrowDistance: "Charged Throw Distance",
  haloHealth: "Halo Health",
  absorptionMultiplier: "Absorption Multiplier",
  breakInvulnerabilityDuration: "Break Invulnerability",
  slamDamage: "Slam Damage",
  shieldCount: "Shields",
  horizontalSpread: "Horizontal Spread",
  verticalSpread: "Vertical Spread",
  projectileDamage: "Projectile Damage",
  markDuration: "Mark Duration",
  energyPerCorpse: "Energy per Corpse",
  dropTableChance: "Drop Table Chance",
  shieldBonus: "Shield Bonus",
  healthBonus: "Health Bonus",
  healthDecayPerSecond: "Health Decay/s",
  shadowCopies: "Shadow Copies",
  spawnRadius: "Spawn Radius",
  statusDamageBonus: "Status Damage Bonus",
  critDamagePerKill: "Crit Damage per Kill",
  decoyDamage: "Decoy Damage",
  decoyRadius: "Decoy Radius",
  decoyDuration: "Decoy Duration",
  decoyCooldown: "Decoy Cooldown",
  damageReduction: "Damage Reduction",
  healthRegen: "Health Regen",
  reviveCooldown: "Revive Cooldown",
  criticalChanceBonus: "Crit Chance Bonus",
  maxConstellationStars: "Max Stars",
  durationExtension: "Duration Extension",
  slowPercent: "Slow",
  lifeStealPercent: "Life Steal",
  defenseReduction: "Defense Reduction",
  defenseStrip: "Defense Strip",
  splashRadius: "Splash Radius",
  javelins: "Javelins",
  maggots: "Maggots",
  affectedEnemies: "Affected Enemies",
  energyRegen: "Energy Regen",
  shieldsPerKill: "Shields per Kill",
  healthPerHit: "Health per Hit",
  speedBuff: "Speed Buff",
  reloadBuff: "Reload Buff",
  gunDamage: "Gun Damage",
  meleeDamage: "Melee Damage",
  contagionCloudDps: "Contagion Cloud DPS",
  contagionCloudRange: "Contagion Cloud Range",
  contagionCloudDuration: "Contagion Cloud Duration",
  contagionCloudMeleeMult: "Contagion Melee Mult.",
  damageBonus: "Damage Bonus",
  strengthBonus: "Strength Bonus",
  enemyLinkRange: "Link Range",
  explosionRadius: "Explosion Radius",
  armorMultiplier: "Armor Multiplier",
  damageGrowth: "Damage Growth",
  electricDamageBonus: "Electric Damage Bonus",
  critDamageBonus: "Crit Damage Bonus",
  viralDamageBonus: "Viral Damage Bonus",
  voidDamageBonus: "Void Damage Bonus",
  energyDrain: "Energy Drain",
  energyRefundPerHit: "Energy per Hit",
  width: "Width",
  mutationStackChance: "Mutation Chance",
  mutationStackCost: "Mutation Cost",
  statusCleanse: "Status Cleanse",
  statusChance: "Status Chance",
  healthMultiplier: "Health Multiplier",
  damageMultiplier: "Damage Multiplier",
  sparkDamageMultiplier: "Spark Damage Mult.",
  markDamageMultiplier: "Mark Damage Mult.",
  sporesDamageMultiplier: "Spores Damage Mult.",
  healPerMeter: "Heal per Meter",
  stunRadius: "Stun Radius",
  armorCap: "Armor Cap",
  parkourVelocity: "Parkour Velocity",
  meleeBuffDuration: "Melee Buff Duration",
  statusTypes: "Status Types",
  statusStacks: "Stacks per Status",
  healthOrbChance: "Health Orb Chance",
  energyOrbChance: "Energy Orb Chance",
  charges: "Charges",
  heavyAttackEfficiency: "Heavy Attack Efficiency",
  killDamageBonus: "Kill Damage Bonus",
  critChancePerKill: "Crit Chance per Kill",
  critDamagePerKill: "Crit Damage per Kill",
  drPerKill: "DR per Kill",
  drPerAssist: "DR per Assist",
  minDamageReduction: "Min Damage Reduction",
  initialDamageReduction: "Initial Damage Reduction",
  initialDecayDelay: "Initial Decay Delay",
  killAssistDecayDelay: "Kill/Assist Decay Delay",
  statusChanceBonus: "Status Chance Bonus",
  statusDurationBonus: "Status Duration Bonus",
  placementDistance: "Placement Distance",
  beamsPerAlly: "Beams per Ally",
  retargetDelay: "Retarget Delay",
  gemLimit: "Gem Limit",
  sightCone: "Sight Cone",
  growthsPerEnemy: "Growths per Enemy",
  absoluteCritChance: "Growth Crit Chance",
  auraRadius: "Aura Radius",
  heatHealthBonus: "Heat Health Bonus",
  heatDps: "Heat DPS",
  electricShieldBonus: "Electric Shield Bonus",
  electricReflectMult: "Electric Reflect Mult.",
  toxinReloadBonus: "Toxin Reload Bonus",
  toxinHolsterDamage: "Toxin Holster Damage",
  toxinProcChance: "Toxin Proc Chance",
  coldArmorBonus: "Cold Armor Bonus",
  coldReflectMult: "Cold Reflect Mult.",
  scornMax: "Scorn Max",
  furyMax: "Fury Max",
  sentryArmor: "Sentry Armor",
  creditPickupRadius: "Credit Pickup Radius",
};

/** Fraction keys where 1 = 100% and values may exceed 1 (Cold Ward, Vex caps). */
function isFractionPercentKey(key: string): boolean {
  return (
    key.endsWith("Bonus") ||
    key.endsWith("Max") ||
    key === "damageBonus" ||
    key === "abilityCritChance" ||
    key === "damageBonusPerHit" ||
    key === "extraPickupChance" ||
    key === "damageConversion" ||
    key === "lethalHealthRestore" ||
    key === "staggerChance" ||
    key === "healthHealPercent" ||
    key === "damageCopied" ||
    key === "statusChanceVulnerability" ||
    key === "statusDamageIncrease" ||
    key === "damageVulnerability" ||
    key === "stackChancePerStatus" ||
    key === "stackChanceCap" ||
    key === "healthConversion" ||
    key === "damagePerStatus" ||
    key === "damageRedirection" ||
    key === "toxinHolsterDamage" ||
    key === "toxinProcChance" ||
    key === "mutationStackChance"
  );
}

function humanizeKey(key: string): string {
  return LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function parsePercentValue(value: unknown): number | null {
  if (typeof value === "number") return value <= 1 ? value : value / 100;
  if (typeof value === "string") {
    const match = value.match(/^([\d.]+)\s*%/);
    if (match) return parseFloat(match[1]) / 100;
  }
  return null;
}

function parseRangePercent(value: string): { min: number; max: number } | null {
  const match = value.match(/^([\d.]+)\s*[–-]\s*([\d.]+)\s*%/);
  if (!match) return null;
  return { min: parseFloat(match[1]) / 100, max: parseFloat(match[2]) / 100 };
}

function parseRangePerSecond(value: string): { min: number; max: number } | null {
  const match = value.match(/^([\d.]+)\s*[–-]\s*([\d.]+)\/s$/);
  if (!match) return null;
  return { min: parseFloat(match[1]), max: parseFloat(match[2]) };
}

function parseSinglePerSecond(value: string): number | null {
  const match = value.match(/^([\d.]+)\/s$/);
  if (!match) return null;
  return parseFloat(match[1]);
}

function parseNumeric(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = parseFloat(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseMeters(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const match = value.match(/([\d.]+)\s*m\b/i);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

function parseSeconds(value: unknown): number | null {
  // Only accept explicit "Xs" strings. Bare numbers are often multipliers (e.g. 2× health).
  if (typeof value === "string") {
    const match = value.match(/^([\d.]+)s$/);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

/** Keys that store duration as a bare number of seconds (not a "5s" string). */
function isDurationSecondsKey(key: string): boolean {
  return /duration|Duration|delay|Delay|Cooldown|Interval|tickInterval|Lifetime|Countdown|travelTime|Airtime/.test(
    key,
  );
}

function parseDurationSeconds(key: string, value: unknown): number | null {
  if (typeof value === "number" && isDurationSecondsKey(key)) return value;
  return parseSeconds(value);
}

function parseDegrees(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const match = value.match(/^([\d.]+)\s*°/);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

function fmtPct(fraction: number): string {
  return `${(fraction * 100).toFixed(0)}%`;
}

function scaleMultiplier(ctx: AbilityScaleContext, attr: AbilityScaleAttribute): number {
  if (attr === "strength") return ctx.strength;
  if (attr === "duration") return ctx.duration;
  return ctx.range;
}

function resolveCap(
  rule: VerifiedStatScaling,
  miscStats: Record<string, unknown>,
): number | undefined {
  if (rule.useSiblingDrCap) {
    const cap = miscStats.drCap;
    if (typeof cap === "number") return cap <= 1 ? cap : cap / 100;
  }
  if (rule.useSiblingSlowCap) {
    const cap = miscStats.slowCap;
    if (typeof cap === "number") return cap <= 1 ? cap : cap / 100;
  }
  return rule.cap;
}

function applyCap(value: number, cap: number | undefined): number {
  return cap != null ? Math.min(value, cap) : value;
}

function formatBaseValue(key: string, value: unknown): string {
  if (typeof value === "boolean") return String(value);
  if (key === "arc" || key === "coneAngle" || key === "firingArc" || key === "seekAngle") {
    const deg = parseDegrees(value);
    if (deg != null) return `${deg.toFixed(1)}°`;
  }
  if (typeof value === "number" && key === "shieldGateExtension") {
    return `${value.toFixed(0)}x`;
  }
  if (typeof value === "number" && (key === "probeSpeed" || key === "chargeSpeed")) {
    return `${value.toFixed(2)}m/s`;
  }
  if (typeof value === "number" && key === "cooldownReduction") {
    return `${value.toFixed(1)}s`;
  }
  const meters = parseMeters(value);
  if (
    meters != null &&
    (key.includes("adius") ||
      key.includes("ange") ||
      key === "width" ||
      key === "arc" ||
      key === "altFireExplosion" ||
      key === "dashDistance" ||
      key === "seekDistance" ||
      key === "paragrimmAttackRange" ||
      key === "pillarHeight" ||
      key === "wallsGap" ||
      key === "damageRadius" ||
      key === "beamRadius" ||
      key === "residueRadius" ||
      key === "gelMistReach")
  ) {
    return `${meters.toFixed(1)}m`;
  }
  const seconds = parseDurationSeconds(key, value);
  if (seconds != null) return `${seconds.toFixed(1)}s`;
  // Multipliers like Celestial Twin 2× must not go through percent parsing (2 → 2%).
  if (
    typeof value === "number" &&
    (key.endsWith("Multiplier") || key.endsWith("Mult") || key === "damageGrowth")
  ) {
    return value <= 1 ? `${value.toFixed(2)}x` : `${value.toFixed(1)}x`;
  }
  // Shroud of Dynar-style flat melee crit damage (not a 200% bonus).
  if (typeof value === "number" && key === "critDamageBonus") {
    return `+${value.toFixed(1)}x`;
  }
  // Flat counts / heal amounts must not go through percent parsing (250 → 250%).
  if (
    typeof value === "number" &&
    (key === "javelins" ||
      key === "maggots" ||
      key === "affectedEnemies" ||
      key === "healthPerHit" ||
      key === "shieldsPerKill" ||
      key === "energyRegen" ||
      key === "contagionCloudDps" ||
      key === "heatDps" ||
      key === "heatDamage" ||
      key === "fieldDamagePerSecond" ||
      key === "contactDamagePerSecond" ||
      key === "dischargeDamage" ||
      key === "energyDrain" ||
      key === "energyRegen" ||
      key === "altFireEnergy" ||
      key === "wellsLimit" ||
      key === "charges" ||
      key === "areasPerElement" ||
      key === "maxSpheres" ||
      key === "dischargeTargets" ||
      key === "simultaneousDischarges" ||
      key === "shrapnelGrenades" ||
      key === "shieldGrenades" ||
      key === "maxTurrets" ||
      key === "maxCaches" ||
      key === "shotsPerSecond" ||
      key === "shieldRestore" ||
      key === "shieldsPerSecond" ||
      key === "empoweredHealthRestore" ||
      key === "energyPerShot" ||
      key === "altFireDamage" ||
      key === "pageFragments" ||
      key === "overguardGain" ||
      key === "overguardCap" ||
      key === "slashStatuses" ||
      key === "overguardRegenPerSecond" ||
      key === "noctuaCopyLimit" ||
      key === "pageflightDamage" ||
      key === "paragrimmLimit" ||
      key === "maxPillars" ||
      key === "radiationDamagePerTick" ||
      key === "radiationTicks" ||
      key === "initialStatusStacks" ||
      key === "maxStatusStacks" ||
      key === "explosionDamage" ||
      key === "explosionDamagePerStatus" ||
      key === "beamTicksPerSecond" ||
      key === "vialCharges" ||
      key === "probeCount" ||
      key === "missDrain" ||
      key === "daggerCount" ||
      key === "maxDaggersPerEnemy" ||
      key === "maxStorms" ||
      key === "ticksPerSecond" ||
      key === "sentryArmor" ||
      key === "statusTypes" ||
      key === "statusStacks")
  ) {
    return key === "contagionCloudDps" ||
      key === "heatDps" ||
      key === "energyDrain" ||
      key === "energyRegen" ||
      key === "fieldDamagePerSecond" ||
      key === "contactDamagePerSecond" ||
      key === "shotsPerSecond" ||
      key === "shieldsPerSecond" ||
      key === "overguardRegenPerSecond" ||
      key === "beamTicksPerSecond" ||
      key === "ticksPerSecond"
      ? `${Number.isInteger(value) ? value : value.toFixed(1)}/s`
      : Number.isInteger(value)
        ? String(value)
        : value.toFixed(2);
  }
  // Fraction percents may exceed 100% (e.g. coldArmorBonus 1.45 → 145%).
  if (typeof value === "number" && isFractionPercentKey(key)) {
    return fmtPct(value);
  }
  const pct = parsePercentValue(value);
  if (pct != null) return fmtPct(pct);
  if (typeof value === "string") {
    const range = parseRangePercent(value);
    if (range) return `${fmtPct(range.min)}–${fmtPct(range.max)}`;
    const perSec = parseRangePerSecond(value);
    if (perSec) return `${perSec.min}–${perSec.max}/s`;
    const single = parseSinglePerSecond(value);
    if (single != null) return `${single}/s`;
    return value;
  }
  if (typeof value === "number") {
    if (value > 1 && value <= 10 && (key.endsWith("Bonus") || key === "damageBonus")) {
      return `${(value * 100).toFixed(0)}%`;
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  return String(value);
}

function scaleVerifiedValue(
  key: string,
  value: unknown,
  rule: VerifiedStatScaling,
  ctx: AbilityScaleContext,
  miscStats: Record<string, unknown>,
): { scaled: string; modified: boolean; positive: boolean } | null {
  const mult = scaleMultiplier(ctx, rule.scale);
  const cap = resolveCap(rule, miscStats);

  if (key === "arc" || key === "coneAngle" || key === "firingArc" || key === "seekAngle") {
    const base = parseDegrees(value);
    if (base == null) return null;
    const scaled = applyCap(base * mult, cap);
    return {
      scaled: `${scaled.toFixed(1)}°`,
      modified: mult !== 1,
      positive: mult >= 1,
    };
  }

  const meters = parseMeters(value);
  if (
    meters != null &&
    (key.includes("adius") ||
      key.includes("ange") ||
      key === "width" ||
      key === "stunRadius" ||
      key === "enemyLinkRange" ||
      key === "explosionRadius" ||
      key === "splashRadius" ||
      key === "decoyRadius" ||
      key === "altFireExplosion" ||
      key === "dashDistance" ||
      key === "seekDistance" ||
      key === "paragrimmAttackRange" ||
      key === "pillarHeight" ||
      key === "wallsGap" ||
      key === "damageRadius" ||
      key === "beamRadius" ||
      key === "residueRadius" ||
      key === "gelMistReach")
  ) {
    const scaled = applyCap(meters * mult, cap);
    return {
      scaled: `${scaled.toFixed(1)}m`,
      modified: mult !== 1,
      positive: mult >= 1,
    };
  }

  if (typeof value === "number" && (key === "probeSpeed" || key === "chargeSpeed")) {
    const scaled = applyCap(value * mult, cap);
    return {
      scaled: `${scaled.toFixed(2)}m/s`,
      modified: mult !== 1,
      positive: mult >= 1,
    };
  }
  if (typeof value === "number" && key === "cooldownReduction") {
    const scaled = applyCap(value * mult, cap);
    return {
      scaled: `${scaled.toFixed(1)}s`,
      modified: mult !== 1,
      positive: mult >= 1,
    };
  }

  const seconds = parseDurationSeconds(key, value);
  if (seconds != null) {
    const scaled = applyCap(seconds * mult, cap);
    return {
      scaled: `${scaled.toFixed(1)}s`,
      modified: mult !== 1,
      positive: mult >= 1,
    };
  }

  if (typeof value === "string" && key === "damageReduction") {
    const range = parseRangePercent(value);
    if (range) {
      const minScaled = applyCap(range.min * mult, cap);
      const maxScaled = applyCap(range.max * mult, cap);
      return {
        scaled: `${fmtPct(minScaled)}–${fmtPct(maxScaled)}`,
        modified: mult !== 1,
        positive: mult >= 1,
      };
    }
  }

  if (typeof value === "string" && key === "healthRegen") {
    const range = parseRangePerSecond(value);
    if (range) {
      return {
        scaled: `${Math.round(range.min * mult)}–${Math.round(range.max * mult)}/s`,
        modified: mult !== 1,
        positive: mult >= 1,
      };
    }
    const single = parseSinglePerSecond(value);
    if (single != null) {
      return {
        scaled: `${Math.round(single * mult)}/s`,
        modified: mult !== 1,
        positive: mult >= 1,
      };
    }
  }

  const numEarly = parseNumeric(value);
  if (
    numEarly != null &&
    (key.endsWith("Multiplier") || key.endsWith("Mult") || key === "damageGrowth")
  ) {
    const scaledNum = applyCap(numEarly * mult, cap);
    return {
      scaled: scaledNum <= 1 ? `${scaledNum.toFixed(2)}x` : `${scaledNum.toFixed(1)}x`,
      modified: mult !== 1,
      positive: mult >= 1,
    };
  }
  if (numEarly != null && key === "critDamageBonus") {
    const scaledNum = applyCap(numEarly * mult, cap);
    return {
      scaled: `+${scaledNum.toFixed(1)}x`,
      modified: mult !== 1,
      positive: mult >= 1,
    };
  }

  const num = parseNumeric(value);
  if (
    num != null &&
    (key === "javelins" ||
      key === "maggots" ||
      key === "affectedEnemies" ||
      key === "healthPerHit" ||
      key === "shieldsPerKill" ||
      key === "energyRegen" ||
      key === "contagionCloudDps" ||
      key === "heatDps" ||
      key === "heatDamage" ||
      key === "fieldDamagePerSecond" ||
      key === "contactDamagePerSecond" ||
      key === "dischargeDamage" ||
      key === "energyDrain" ||
      key === "energyRegen" ||
      key === "wellsLimit" ||
      key === "charges" ||
      key === "areasPerElement" ||
      key === "maxSpheres" ||
      key === "dischargeTargets" ||
      key === "simultaneousDischarges" ||
      key === "shrapnelGrenades" ||
      key === "shieldGrenades" ||
      key === "maxTurrets" ||
      key === "maxCaches" ||
      key === "shotsPerSecond" ||
      key === "shieldRestore" ||
      key === "shieldsPerSecond" ||
      key === "empoweredHealthRestore" ||
      key === "energyPerShot" ||
      key === "altFireDamage" ||
      key === "pageFragments" ||
      key === "overguardGain" ||
      key === "overguardCap" ||
      key === "slashStatuses" ||
      key === "overguardRegenPerSecond" ||
      key === "noctuaCopyLimit" ||
      key === "pageflightDamage" ||
      key === "paragrimmLimit" ||
      key === "maxPillars" ||
      key === "radiationDamagePerTick" ||
      key === "radiationTicks" ||
      key === "initialStatusStacks" ||
      key === "maxStatusStacks" ||
      key === "explosionDamage" ||
      key === "explosionDamagePerStatus" ||
      key === "beamTicksPerSecond" ||
      key === "vialCharges" ||
      key === "probeCount" ||
      key === "missDrain" ||
      key === "daggerCount" ||
      key === "maxDaggersPerEnemy" ||
      key === "maxStorms" ||
      key === "ticksPerSecond" ||
      key === "altFireEnergy" ||
      key === "sentryArmor" ||
      key === "statusTypes" ||
      key === "statusStacks")
  ) {
    const scaledNum =
      key === "energyRegen" ? Math.round(num * mult * 100) / 100 : Math.round(num * mult);
    return {
      scaled:
        key === "contagionCloudDps" ||
        key === "heatDps" ||
        key === "energyDrain" ||
        key === "energyRegen" ||
        key === "fieldDamagePerSecond" ||
        key === "contactDamagePerSecond" ||
        key === "shotsPerSecond" ||
        key === "shieldsPerSecond" ||
        key === "overguardRegenPerSecond" ||
        key === "beamTicksPerSecond" ||
        key === "ticksPerSecond"
          ? `${scaledNum}/s`
          : String(scaledNum),
      modified: Math.abs(scaledNum - num) > 0.001,
      positive: scaledNum >= num,
    };
  }

  if (num != null && isFractionPercentKey(key)) {
    const scaled = applyCap(num * mult, cap);
    return {
      scaled: fmtPct(scaled),
      modified: Math.abs(scaled - num) > 0.001,
      positive: scaled >= num,
    };
  }

  const pct = parsePercentValue(value);
  if (pct != null) {
    const scaled = applyCap(pct * mult, cap);
    return {
      scaled: fmtPct(scaled),
      modified: Math.abs(scaled - pct) > 0.001,
      positive: scaled >= pct,
    };
  }

  if (num != null) {
    const scaledNum = applyCap(num * mult, cap);
    return {
      scaled: String(Math.round(scaledNum)),
      modified: Math.round(scaledNum) !== Math.round(num),
      positive: scaledNum >= num,
    };
  }

  return null;
}

/** Scale misc stats only where verified in the scaling registry. */
export function scaleAbilityMiscStats(
  miscStats: Record<string, unknown>,
  ctx: AbilityScaleContext,
  display?: AbilityDisplayContext,
): ScaledMiscStatLine[] {
  const lines: ScaledMiscStatLine[] = [];

  for (const [key, value] of Object.entries(miscStats)) {
    if (SKIP_KEYS.has(key)) continue;

    const base = formatBaseValue(key, value);
    const rule = display
      ? getVerifiedMiscScaling(display.warframeId, display.abilityName, key, display.helminth)
      : null;

    if (!rule) {
      lines.push({
        label: humanizeKey(key),
        base,
        scaled: base,
        modified: false,
      });
      continue;
    }

    const result = scaleVerifiedValue(key, value, rule, ctx, miscStats);
    lines.push({
      label: humanizeKey(key),
      base,
      scaled: result?.scaled ?? base,
      modified: result?.modified ?? false,
      positive: result?.positive ?? true,
      scaleAttr: rule.scale,
    });
  }

  return lines;
}

/** Effective energy cost with 175% efficiency cap (matches in-game builder cards).
 * Negative efficiency (e.g. Overextended without Streamline) pushes costs above 2× base. */
export function scaledAbilityEnergyCost(baseCost: number, efficiency: number): number {
  const clampedEff = Math.min(efficiency, 1.75);
  return Math.max(baseCost * 0.25, baseCost * (2 - clampedEff));
}

/** Treat stored DR/buff as 0–1 fraction when ≤1, else already a percent value 0–100. */
export function abilityPercentFraction(value: number): number {
  return value <= 1 ? value : value / 100;
}

export function scaledDamageReduction(
  base: number,
  strength: number,
  cap?: number,
): number {
  const fraction = abilityPercentFraction(base) * strength;
  return cap != null ? Math.min(fraction, cap) : fraction;
}

export function scaledDamageBuff(base: number, strength: number): number {
  return abilityPercentFraction(base) * strength;
}

/** Scale top-level DR only when verified for this ability. */
export function scaledAbilityDamageReduction(
  base: number,
  strength: number,
  display: AbilityDisplayContext,
  miscStats?: Record<string, unknown>,
): { value: number; modified: boolean } {
  const rule = getVerifiedFieldScaling(display.warframeId, display.abilityName, "damageReduction");
  if (!rule) {
    return { value: abilityPercentFraction(base), modified: false };
  }
  const cap = rule.useSiblingDrCap && miscStats
    ? resolveCap(rule, miscStats)
    : rule.cap;
  return {
    value: scaledDamageReduction(base, strength, cap),
    modified: strength !== 1,
  };
}

/** Scale top-level damage buff only when verified for this ability. */
export function scaledAbilityDamageBuff(
  base: number,
  strength: number,
  display: AbilityDisplayContext,
): { value: number; modified: boolean } {
  const rule = getVerifiedFieldScaling(display.warframeId, display.abilityName, "damageBuff");
  if (!rule) {
    return { value: abilityPercentFraction(base), modified: false };
  }
  const cap = rule.cap;
  const scaled = abilityPercentFraction(base) * strength;
  return {
    value: cap != null ? Math.min(scaled, cap) : scaled,
    modified: strength !== 1,
  };
}

/** @deprecated Use scaledAbilityDamageReduction — returns cap only when drCap is set on the ability. */
export function getAbilityDrCap(miscStats?: Record<string, unknown>): number | null {
  if (!miscStats || miscStats.drCap == null) return null;
  const cap = miscStats.drCap;
  return typeof cap === "number" ? (cap <= 1 ? cap : cap / 100) : null;
}

export function abilityHasScaledMisc(miscStats?: Record<string, unknown>): boolean {
  if (!miscStats) return false;
  return Object.keys(miscStats).some((k) => !SKIP_KEYS.has(k));
}

export function countAbilityStatLines(ability: Ability): number {
  let n = 0;
  if (ability.damage) n++;
  if (ability.miscStats) n += Object.keys(ability.miscStats).filter((k) => !SKIP_KEYS.has(k)).length;
  return n;
}
