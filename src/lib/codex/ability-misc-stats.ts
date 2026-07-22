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
  /** Ability Efficiency multiplier (1 = 100%). Defaults to 1 when omitted. */
  efficiency?: number;
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
  waveRange: "Wave Range",
  meleeRange: "Melee Range",
  slideEnergyCost: "Slide Energy Cost",
  maxReservoirs: "Max Reservoirs",
  vitalityHealth: "Vitality Health",
  vitalityHealPerSecond: "Vitality Heal/s",
  hasteMoveSpeed: "Haste Move Speed",
  hasteAttackSpeed: "Haste Attack Speed",
  hasteFireRate: "Haste Fire Rate",
  shockDamage: "Shock Damage",
  shockRange: "Shock Range",
  shockTargets: "Shock Targets",
  shockCooldown: "Shock Cooldown",
  teleportInvulnerability: "Teleport Invulnerability",
  radiationStatusChance: "Radiation Status Chance",
  sparkSeekRange: "Spark Seek Range",
  sparkChanceOnHit: "Spark Chance on Hit",
  sparkCritMultiplier: "Spark Crit Multiplier",
  reservoirSurgeRangeBonus: "Reservoir Surge Range Bonus",
  boostedDamagePerSecond: "Boosted Damage/s",
  boostedEnergyDrain: "Boosted Energy Drain",
  damageRampCap: "Damage Ramp Cap",
  boostedMoveSpeedPenalty: "Boosted Move Speed Penalty",
  diveBombDamage: "Dive Bomb Damage",
  airSpeed: "Air Speed",
  airborneEnergyCost: "Airborne Energy Cost",
  travelDistance: "Travel Distance",
  damageGrowthPerEnemy: "Damage Growth per Enemy",
  pullForceDuration: "Pull Force Duration",
  tickDamage: "Tick Damage",
  tornadoCount: "Tornadoes",
  pullRadius: "Pull Radius",
  tornadoHeight: "Tornado Height",
  stunDuration: "Stun Duration",
  initialDamageBonus: "Initial Damage Bonus",
  damageConversionRate: "Damage Conversion Rate",
  damageConversionDuration: "Damage Conversion Duration",
  maxTargets: "Max Targets",
  boltCount: "Bolts",
  boltsOnKill: "Bolts on Kill",
  targetingRange: "Targeting Range",
  infestedSlow: "Infested Slow",
  armorSteal: "Armor Steal",
  shieldSteal: "Shield Steal",
  overguardSteal: "Overguard Steal",
  armorStealCap: "Armor Steal Cap",
  overguardStealCap: "Overguard Steal Cap",
  armorStealDuration: "Armor Steal Duration",
  radiationStacks: "Radiation Stacks",
  absorbDuration: "Absorb Duration",
  weaponDamageConvert: "Weapon Damage Convert",
  weaponDamageCap: "Weapon Damage Cap",
  invulnAbsorbThreshold: "Invuln Absorb Threshold",
  invulnDurationBoost: "Invuln Duration Boost",
  invulnDurationCap: "Invuln Duration Cap",
  damagePercentage: "Damage Percentage",
  maxDamagePerInstance: "Max Damage per Instance",
  maxStoredDamage: "Max Stored Damage",
  stunTargets: "Stun Targets",
  stunInterval: "Stun Interval",
  rampUpDamageBonus: "Ramp-Up Damage Bonus",
  maxShootingDistance: "Max Shooting Distance",
  minFov: "Min FoV",
  hologramCount: "Holograms",
  cloneMeleeDamage: "Clone Melee Damage",
  cloneRangedDamage: "Clone Ranged Damage",
  blindDuration: "Blind Duration",
  jewelCharmRadius: "Jewel Charm Radius",
  blindRadius: "Blind Radius",
  jewelCastRange: "Jewel Cast Range",
  jewelDuration: "Jewel Duration",
  laserCount: "Lasers",
  prismSpeed: "Prism Speed",
  tickRate: "Tick Rate",
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
  absorptionMultiplier: "Absorption Mult.",
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
  barrageRadius: "Barrage Radius",
  salvosPerSecond: "Salvos/s",
  recastEnergyDiscount: "Recast Energy Discount",
  armorPerEnemy: "Armor per Enemy",
  armorPerCorrosiveStatus: "Armor per Corrosive Status",
  armorCap: "Armor Cap",
  corrosiveBonusPerEnemy: "Corrosive Bonus per Enemy",
  corrosiveBonusPerStatus: "Corrosive Bonus per Status",
  corrosiveBonusCap: "Corrosive Bonus Cap",
  tentacleCount: "Tentacles",
  overguardContactDamage: "Overguard Contact Damage",
  transitionalDamage: "Transitional Damage",
  coneInitialRadius: "Cone Initial Radius",
  spreadAngle: "Spread Angle",
  gunfireObjectLimit: "Gunfire Object Limit",
  banishDuration: "Banish Duration",
  finalRadius: "Final Radius",
  collapseDamageBonus: "Collapse Damage Bonus",
  healthShieldAbsorb: "Health/Shield Absorb",
  decoyShields: "Decoy Shields",
  decoyHealth: "Decoy Health",
  radialPull: "Radial Pull",
  pullAngle: "Pull Angle",
  magneticPull: "Magnetic Pull",
  damageAbsorption: "Damage Absorption",
  explosionDamageMultiplier: "Explosion Damage Mult.",
  shardDamage: "Shard Damage",
  shardPickupRadius: "Shard Pickup Radius",
  magnetizeExtraDamage: "Magnetize Extra Damage",
  shieldsPerHit: "Shields per Hit",
  shieldsPerHitCap: "Shields per Hit Cap",
  areaDamage: "Area Damage",
  waveAngle: "Wave Angle",
  initialWidth: "Initial Width",
  breakDamage: "Break Damage",
  globeLimit: "Globe Limit",
  healthCap: "Health Cap",
  shatterDamage: "Shatter Damage",
  shatterRadius: "Shatter Radius",
  sweepArc: "Sweep Arc",
  bladeRadius: "Blade Radius",
  absorbedDamage: "Absorbed Damage",
  collapseDamage: "Collapse Damage",
  mirrorCount: "Mirrors",
  collapseThreshold: "Collapse Threshold",
  charmRadius: "Charm Radius",
  castRange: "Cast Range",
  segmentHealth: "Segment Health",
  expansionTime: "Expansion Time",
  ringInitialRadius: "Ring Initial Radius",
  ringExpansionRate: "Ring Expansion Rate",
  explosionRange: "Explosion Range",
  crystallizationTime: "Crystallization Time",
  ringSegments: "Ring Segments",
  nightArmor: "Night Armor",
  nightShields: "Night Shields",
  dayDamageBonus: "Day Damage Bonus",
  daySpeedBonus: "Day Speed Bonus",
  enemySpeedBonus: "Enemy Speed Bonus",
  wakeupHealthThreshold: "Wakeup Health Threshold",
  pacifyDamageReduction: "Pacify Damage Reduction",
  abilityStrengthBonus: "Ability Strength Bonus",
  abilityStrengthBonusCap: "Ability Strength Bonus Cap",
  energyPerAbility: "Energy per Ability",
  hitpointConversion: "Hitpoint Conversion",
  noiseRadius: "Noise Radius",
  sleepDuration: "Sleep Duration",
  sleepRadius: "Sleep Radius",
  sleepHealthThreshold: "Sleep Health Threshold",
  maxCloakBubbles: "Max Cloak Bubbles",
  maxZiplines: "Max Ziplines",
  ziplineRange: "Zipline Range",
  maxDamageMultiplier: "Max Damage Multiplier",
  multiplierGrowth: "Multiplier Growth",
  energyDrainGrowth: "Energy Drain Growth",
  headshotBonus: "Headshot Bonus",
  lootChance: "Loot Chance",
  stealTime: "Steal Time",
  movementSpeedPenalty: "Movement Speed Penalty",
  energyDrainMoving: "Energy Drain (Moving)",
  meleeEnergyCost: "Melee Energy Cost",
  damageEnergyCost: "Damage Energy Cost",
  arrowCount: "Arrow Count",
  shurikenCount: "Shuriken Count",
  autoTargetRadius: "Auto-Target Radius",
  homingAngle: "Homing Angle",
  finisherDamageBonus: "Finisher Damage Bonus",
  energyRefund: "Energy Refund",
  energyPerMark: "Energy per Mark",
  invisibleMarkDiscount: "Invisible Mark Discount",
  shadowClones: "Shadow Clones",
  hitsPerMark: "Hits per Mark",
  hit2Radius: "2nd Hit Radius",
  hit3Radius: "3rd Hit Radius",
  comboWindow: "Combo Window",
  rollDamage: "Roll Damage",
  rollDistance: "Roll Distance",
  slashHealthMultiplier: "Slash Health Multiplier",
  rumblerHeal: "Rumbler Heal",
  rockDamage: "Rock Damage",
  blastDamage: "Blast Damage",
  rumblerCount: "Rumblers",
  speedMultiplier: "Speed Multiplier",
  stoneDuration: "Stone Duration",
  propagationSpeed: "Propagation Speed",
  pillarDuration: "Pillar Duration",
  pillarRadius: "Pillar Radius",
  projectileSeekRange: "Projectile Seek Range",
  maxThralls: "Max Thralls",
  hitpointsDrain: "Hitpoints Drain",
  thrallHitpointsDrain: "Thrall Hitpoints Drain",
  travelSpeed: "Travel Speed",
  boostedBeamRadius: "Boosted Beam Radius",
  beamCount: "Beams",
  sweepArea: "Sweep Area",
  boostedStatusChance: "Boosted Status Chance",
  percentageDamage: "Percentage Damage",
  aoePercentageDamage: "AoE Percentage Damage",
  percentageDamageCap: "Percentage Damage Cap",
  aoePercentageDamageCap: "AoE Percentage Damage Cap",
  groundCap: "Ground Cap",
  armorBuff: "Armor Buff",
  armorBuffCap: "Armor Buff Cap",
  initialHeal: "Initial Heal",
  bleedoutSlow: "Bleedout Slow",
  bleedoutSlowCap: "Bleedout Slow Cap",
  allyArmorMultiplier: "Ally Armor Multiplier",
  radiationBonusDamage: "Radiation Bonus Damage",
  bonusArmorPerEnemy: "Bonus Armor per Enemy",
  bonusArmorPerRadiation: "Bonus Armor per Radiation",
  maxCharmRadius: "Max Charm Radius",
  enemiesToMaxRadius: "Enemies to Max Radius",
  armorBonus: "Armor Bonus",
  speedBonus: "Speed Bonus",
  multishotBonus: "Multishot Bonus",
  meleeDamageBonus: "Melee Damage Bonus",
  buffDuration: "Buff Duration",
  maxDamageBuff: "Max Damage Buff",
  malletRangeBonus: "Mallet Range Bonus",
  lifesteal: "Lifesteal",
  healingRadius: "Healing Radius",
  energyPerPulse: "Energy per Pulse",
  pulseRadius: "Pulse Radius",
  damageHealthThreshold: "Damage Health Threshold",
  healthShieldRestore: "Health/Shield Restore",
  particles: "Particles",
  damageReductionPerParticle: "DR per Particle",
  attackInterval: "Attack Interval",
  absorbMultiplier: "Absorb Multiplier",
  contactDamage: "Contact Damage",
  maxHitsAbsorbed: "Max Hits Absorbed",
  absorbedDamageCap: "Absorbed Damage Cap",
  maxPortals: "Max Portals",
  portalUses: "Portal Uses",
  startingWaveRadius: "Starting Wave Radius",
  waveSpeed: "Wave Speed",
  allySpeedCap: "Ally Speed Cap",
  shieldLimit: "Shield Limit",
  pulseDuration: "Pulse Duration",
  damageDelay: "Damage Delay",
  decoyDamage: "Decoy Damage",
  decoyRadius: "Decoy Radius",
  decoyDuration: "Decoy Duration",
  decoyCooldown: "Decoy Cooldown",
  damageReduction: "Damage Reduction",
  healthRegen: "Health Regen",
  reviveCooldown: "Revive Cooldown",
  criticalChanceBonus: "Crit Chance Bonus",
  maxConstellationStars: "Max Constellation Stars",
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
  releaseDelay: "Release Delay",
  maggotHealth: "Maggot Health",
  maggotDamage: "Maggot Damage",
  dashSpeed: "Dash Speed",
  terrainPullSpeed: "Terrain Pull Speed",
  enemyPullSpeed: "Enemy Pull Speed",
  meleeDamageVulnerability: "Melee Damage Vulnerability",
  warcryArmorMultiplier: "Warcry Armor Mult.",
  strengthBonus: "Strength Bonus",
  enemyLinkRange: "Link Range",
  explosionRadius: "Explosion Radius",
  armorMultiplier: "Armor Mult.",
  damageGrowth: "Damage Growth",
  electricDamageBonus: "Electric Damage Bonus",
  critDamageBonus: "Crit Damage Bonus",
  viralDamageBonus: "Viral Damage Bonus",
  voidDamageBonus: "Void Damage Bonus",
  energyMultiplier: "Energy Multiplier",
  selfHeal: "Self Heal",
  viralDamage: "Viral Damage",
  digestionDamage: "Digestion Damage",
  viralStacks: "Viral Stacks",
  maxEnemies: "Max Enemies",
  vomitConeRange: "Vomit Cone Range",
  mawOpenDuration: "Maw Open Duration",
  minCollisionDamage: "Min Collision Damage",
  healPerSecond: "Heal/s",
  toxinDamagePerSecond: "Toxin Damage/s",
  minSlamRadius: "Min Slam Radius",
  collisionRadius: "Collision Radius",
  slowDuration: "Slow Duration",
  shieldCost: "Shield Cost",
  minDamage: "Min Damage",
  allyShieldBonus: "Ally Shields",
  shieldRechargeRate: "Shield Recharge Rate",
  shieldDrainPerAlly: "Shield Drain/Ally",
  shieldDrainPerEnemy: "Shield Drain/Enemy",
  deactivationDamage: "Deactivation Damage",
  shieldDrain: "Shield Drain",
  maxAltitude: "Max Altitude",
  auraDuration: "Aura Duration",
  maxLanterns: "Max Lanterns",
  droneDamage: "Drone Damage",
  evasion: "Evasion",
  razorflies: "Razorflies",
  vacuumRadius: "Vacuum Radius",
  spreadRadius: "Spread Radius",
  resetDecay: "Reset Decay",
  damageDecayRate: "Damage Decay Rate",
  growthEnemyCap: "Growth Enemy Cap",
  initialSpores: "Initial Spores",
  miasmaDamageMultiplier: "Miasma Damage Mult.",
  speedBuffDuration: "Speed Buff Duration",
  decoyInvulnerability: "Decoy Invulnerability",
  moveSpeedBonus: "Move Speed Bonus",
  moveSpeedPenalty: "Move Speed Penalty",
  armorDuration: "Armor Duration",
  minArmorBonus: "Min Armor Bonus",
  rangePerCombo: "Range per Combo",
  targetRange: "Target Range",
  accuseMaxTargets: "Accuse Max Targets",
  accuseDuration: "Accuse Duration",
  accuseRange: "Accuse Range",
  gazeDefenseStrip: "Gaze Defense Strip",
  gazeDuration: "Gaze Duration",
  gazeCastRange: "Gaze Cast Range",
  gazeAuraRadius: "Gaze Aura Radius",
  gazeMaxTargets: "Gaze Max Targets",
  denyRange: "Deny Range",
  denyDuration: "Deny Duration",
  voidDamageVulnerability: "Void Damage Vulnerability",
  dodgeChance: "Dodge Chance",
  areaDamageReduction: "Area Damage Reduction",
  damageGrowthPerSecond: "Damage Growth/s",
  globules: "Globules",
  globuleLifetime: "Globule Lifetime",
  globuleTargetRadius: "Globule Target Radius",
  activeGlobuleCap: "Active Globule Cap",
  merulinaHealth: "Merulina Health",
  initialInvulnerability: "Initial Invulnerability",
  dismountInvulnerability: "Dismount Invulnerability",
  blades: "Blades",
  hitsPerInterval: "Hits per Interval",
  intervalTime: "Interval Time",
  attackCooldown: "Attack Cooldown",
  burstDamage: "Burst Damage",
  vortexRadius: "Vortex Radius",
  extraDamagePerEnemy: "Extra Damage per Enemy",
  ensnareDamageMultiplier: "Ensnare Damage Mult.",
  spreadDelay: "Spread Delay",
  snareDamage: "Snare Damage",
  respawnTime: "Respawn Time",
  healAuraRadius: "Heal Aura Radius",
  grabRadius: "Grab Radius",
  maxDomes: "Max Domes",
  vertices: "Vertices",
  healthPerEnemy: "Health per Enemy",
  totalHealthCost: "Total Health Cost",
  statusProtectionCost: "Status Protection Cost",
  minHealthThreshold: "Min Health Threshold",
  healthAsDamage: "Health as Damage",
  spreadRange: "Spread Range",
  swarmKavatLimit: "Swarm Kavat Limit",
  swarmKavatLifespan: "Swarm Kavat Lifespan",
  streamLinkRange: "Stream Link Range",
  scornPerMeleeKill: "Scorn per Melee Kill",
  furyPerRangedKill: "Fury per Ranged Kill",
  armorReduction: "Armor Reduction",
  knockbackDamage: "Knockback Damage",
  creditChance: "Credit Chance",
  creditBonus: "Credit Bonus",
  charges: "Charges",
  dischargeInterval: "Discharge Interval",
  maxDrones: "Max Drones",
  capsuleDamage: "Capsule Damage",
  flechetteDamage: "Flechette Damage",
  tetherMaxTargets: "Tether Max Targets",
  flechetteTargetRadius: "Flechette Target Radius",
  maxOrbs: "Max Orbs",
  vectorSpeed: "Vector Speed",
  weaponDamageBonus: "Weapon Damage Bonus",
  maxPads: "Max Pads",
  overguardDamageMultiplier: "Overguard Damage Mult.",
  strikeDelay: "Strike Delay",
  armorBuffRate: "Armor Buff Rate",
  armorBuffDuration: "Armor Buff Duration",
  vortexDamagePerSecond: "Vortex Damage/s",
  vortexDuration: "Vortex Duration",
  vortexStatusChance: "Vortex Status Chance",
  maxBastilles: "Max Bastilles",
  maxVortices: "Max Vortices",
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
  parkourVelocity: "Parkour Velocity",
  meleeBuffDuration: "Melee Buff Duration",
  statusTypes: "Status Types",
  statusStacks: "Stacks per Status",
  healthOrbChance: "Health Orb Chance",
  energyOrbChance: "Energy Orb Chance",
  heavyAttackEfficiency: "Heavy Attack Efficiency",
  killDamageBonus: "Kill Damage Bonus",
  critChancePerKill: "Crit Chance per Kill",
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
  pillars: "Pillars",
  heatStatusChance: "Heat Status Chance",
  wailDurationBonus: "Wail Duration Bonus",
  backbeatPillarMultiplier: "Backbeat Pillars",
  criticalChanceVulnerability: "Crit Chance Vulnerability",
  backbeatCritMultiplier: "Backbeat Crit Mult.",
  heatDamageBonus: "Heat Damage Bonus",
  heatDamageCap: "Heat Damage Cap",
  healthRestore: "Health Restore",
  healthRestorePerSecond: "Health Restore/s",
  backbeatInvulnerabilityBonus: "Backbeat Invuln Bonus",
  backbeatBonus: "Backbeat Bonus",
  maxBuffDuration: "Max Buff Duration",
  backbeatAmmoCost: "Backbeat Ammo Cost",
  backbeatStatusBonus: "Backbeat Status Stacks",
  bounceRadius: "Bounce Radius",
  threadLength: "Thread Length",
  threads: "Threads",
  maxThreads: "Max Threads",
  tripleSixBounceDamage: "Triple Six Bounce Damage",
  rareDecreeChance: "Rare Decree Chance",
  unluckyThreshold: "Unlucky Roll Threshold",
  cooldownCap: "Cooldown Cap",
  allyKillWindow: "Ally Kill Window",
  healMultiplier: "Heal Multiplier",
  blockChance: "Block Chance",
  healCooldown: "Heal Cooldown",
  recastThreshold: "Recast Threshold",
  statusDurationPause: "Status Duration Pause",
  minCharms: "Min Charms",
  maxCharms: "Max Charms",
  finisherPromptDuration: "Finisher Prompt",
  maxWebs: "Max Webs",
  toxinStatusChance: "Toxin Status Chance",
  darts: "Darts",
  forcedToxinStacks: "Forced Toxin Stacks",
  scuttlerDuration: "Scuttler Duration",
  maxScuttlers: "Max Scuttlers",
  scuttlerDamage: "Scuttler Damage",
  recallRadius: "Recall Radius",
  toxinWeaponDamage: "Toxin Weapon Damage",
  wallLatchToxinWeaponDamage: "Wall-Latch Toxin Damage",
  dodgeRange: "Dodge Range",
  explosionRadiusCap: "Explosion Radius Cap",
  parkourVelocityBonus: "Parkour Velocity Bonus",
  statusImmunity: "Status Immunity",
  flightSpeed: "Flight Speed",
  catenachChainDamage: "Catenach Chain DPS",
  catenachSlow: "Catenach Slow",
  catenachSlowCap: "Catenach Slow Cap",
  catenachChainDuration: "Catenach Chain Duration",
  catenachChainRange: "Catenach Chain Range",
  catenachMaxTargets: "Catenach Max Targets",
  gulphagorDamage: "Gulphagor Damage/Tick",
  gulphagorHealthOrbChance: "Gulphagor Health Orb Chance",
  gulphagorEnergyOrbChance: "Gulphagor Energy Orb Chance",
  gulphagorFieldDamage: "Gulphagor Field DPS",
  gulphagorFieldDuration: "Gulphagor Field Duration",
  gulphagorFieldRadius: "Gulphagor Field Radius",
  demonHealthDrain: "Demon Health Drain",
  maxProjectiles: "Max Projectiles",
  vythelasFireRate: "Vythelas Fire Rate",
  vythelasHeatDamage: "Vythelas Heat Damage",
  vythelasDuration: "Vythelas Duration",
  maxRunes: "Max Runes",
  damageGrowthPercent: "Damage Growth",
  damageGrowthInterval: "Damage Growth Interval",
  damageMultiplierCap: "Damage Mult Cap",
  objectTypes: "Object Types",
  maxBrushLayers: "Max Brush Layers",
  startingDamageReduction: "Starting Damage Reduction",
  durationBonusPerKill: "Duration per Kill",
  minFallDamage: "Min Fall Damage",
  motes: "Motes",
  moteRecoveryPerSecond: "Mote Recovery/s",
  maxAttackRange: "Max Attack Range",
  tauntRadius: "Taunt Radius",
  minHealthRegen: "Min Health Regen",
  maxHealthRegen: "Max Health Regen",
  sanctuaryLimit: "Sanctuary Limit",
  blackHoleLimit: "Black Hole Limit",
  matchedDamageBonus: "Matched Damage Bonus",
  finisherVulnerability: "Finisher Vulnerability",
  maxMushrooms: "Max Mushrooms",
  invigoratedPulseInterval: "Invigorated Pulse Interval",
  viralStatusChance: "Viral Status Chance",
  energyRestore: "Energy Restore",
  strengthBonusDuration: "Strength Bonus Duration",
  strengthBonusCap: "Strength Bonus Cap",
  invigoratedStrengthBonusCap: "Invigorated STR Cap",
  sproutDamage: "Sprout Damage",
  sproutRadius: "Sprout Radius",
  healthShieldPerSecond: "Health/Shields/s",
  pickupHeal: "Pickup Heal",
  fungalSpores: "Fungal Spores",
  sporeSpawnRadius: "Spore Spawn Radius",
  moveSpeedBonusDuration: "Move Speed Bonus Duration",
  baseMoveSpeed: "Base Move Speed",
  bounces: "Bounces",
  bounceDistance: "Bounce Distance",
  bounceDamageMultiplier: "Bounce Damage Mult.",
  initialCriticalChance: "Initial Crit Chance",
  criticalChancePerBounce: "Crit Chance per Bounce",
  maxSporesprings: "Max Sporesprings",
  shroudHealth: "Shroud Health",
  reflectChance: "Reflect Chance",
  selfDetonationTime: "Self-Detonation Time",
  healthDrainPerSecond: "Health Drain/s",
  explosionHealthPercent: "Explosion Health %",
  impactStatusChance: "Impact Status Chance",
  shieldHealth: "Shield Health",
  reflectMultiplier: "Reflect Mult.",
  blockAngle: "Block Angle",
  augmentBlockAngle: "Augment Block Angle",
  breakCooldown: "Break Cooldown",
  kissEnergyCost: "Maiden's Kiss Energy",
  sweepSpeed: "Sweep Speed",
  sprintSpeedBonus: "Sprint Speed Bonus",
  ammoEfficiency: "Ammo Efficiency",
  damageSpread: "Damage Spread",
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
    key === "mutationStackChance" ||
    key === "hasteMoveSpeed" ||
    key === "hasteAttackSpeed" ||
    key === "hasteFireRate" ||
    key === "radiationStatusChance" ||
    key === "sparkChanceOnHit" ||
    key === "boostedMoveSpeedPenalty" ||
    key === "damageGrowthPerEnemy" ||
    key === "radiationStatusChance" ||
    key === "infestedSlow" ||
    key === "weaponDamageCap" ||
    key === "damagePercentage" ||
    key === "rampUpDamageBonus" ||
    key === "cloneMeleeDamage" ||
    key === "cloneRangedDamage" ||
    key === "damageBonusPerHit" ||
    key === "slowPercent" ||
    key === "armorBuff" ||
    key === "meleeDamageVulnerability" ||
    key === "attackSpeedBuff" ||
    key === "digestionDamage" ||
    key === "evasion" ||
    key === "armorStrip" ||
    key === "shieldStrip" ||
    key === "resetDecay" ||
    key === "damageDecayRate" ||
    key === "healPerMeter" ||
    key === "moveSpeedPenalty" ||
    key === "gazeDefenseStrip" ||
    key === "voidDamageVulnerability" ||
    key === "dodgeChance" ||
    key === "areaDamageReduction" ||
    key === "moveSpeedBonus" ||
    key === "speedBuff" ||
    key === "moveSpeedBuff" ||
    key === "weaponDamageBonus" ||
    key === "armorReduction" ||
    key === "creditChance" ||
    key === "creditBonus" ||
    key === "vortexStatusChance" ||
    key === "scornPerMeleeKill" ||
    key === "furyPerRangedKill" ||
    key === "healthOrbChance" ||
    key === "energyOrbChance" ||
    key === "criticalChanceVulnerability" ||
    key === "blockChance" ||
    key === "heatDamageCap" ||
    key === "heatStatusChance" ||
    key === "toxinStatusChance" ||
    key === "toxinWeaponDamage" ||
    key === "wallLatchToxinWeaponDamage" ||
    key === "healthRestore" ||
    key === "healthRestorePerSecond" ||
    key === "rareDecreeChance" ||
    key === "instantKillThreshold" ||
    key === "parkourVelocityBonus" ||
    key === "catenachSlow" ||
    key === "demonHealthDrain" ||
    key === "vythelasFireRate" ||
    key === "vythelasHeatDamage" ||
    key === "damageGrowthPercent" ||
    key === "gulphagorHealthOrbChance" ||
    key === "gulphagorEnergyOrbChance" ||
    key === "startingDamageReduction" ||
    key === "defenseReduction" ||
    key === "minDamageReduction" ||
    key === "matchedDamageBonus" ||
    key === "criticalChanceBonus" ||
    key === "finisherVulnerability" ||
    key === "viralStatusChance" ||
    key === "strengthBonusCap" ||
    key === "invigoratedStrengthBonusCap" ||
    key === "initialCriticalChance" ||
    key === "criticalChancePerBounce" ||
    key === "slow" ||
    key === "reflectChance" ||
    key === "healthDrainPerSecond" ||
    key === "lifesteal" ||
    key === "explosionHealthPercent" ||
    key === "impactStatusChance" ||
    key === "ammoEfficiency" ||
    key === "damageSpread" ||
    key === "sprintSpeedBonus"
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
  return /duration|Duration|delay|Delay|Cooldown|Interval|tickInterval|Lifetime|Countdown|travelTime|Airtime|Invulnerability|stealTime/.test(
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
  if (attr === "efficiency") return ctx.efficiency ?? 1;
  return ctx.range;
}

/** Effective scale factor; inverse rules divide by the attribute (e.g. interval ÷ DUR). */
function scaleFactor(ctx: AbilityScaleContext, rule: VerifiedStatScaling): number {
  const mult = scaleMultiplier(ctx, rule.scale);
  if (!rule.inverse) return mult;
  return mult > 0 ? 1 / mult : Number.POSITIVE_INFINITY;
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

function applyBounds(value: number, cap: number | undefined, floor: number | undefined): number {
  let next = applyCap(value, cap);
  if (floor != null) next = Math.max(next, floor);
  return next;
}

function formatBaseValue(key: string, value: unknown): string {
  if (typeof value === "boolean") return String(value);
  if (key === "arc" || key === "coneAngle" || key === "firingArc" || key === "seekAngle" || key === "minFov") {
    const deg = parseDegrees(value);
    if (deg != null) return `${deg.toFixed(1)}°`;
  }
  if (typeof value === "number" && key === "shieldGateExtension") {
    return `${value.toFixed(0)}x`;
  }
  // Wiki card rates already in percent points (e.g. 0.025% convert, 0.06% Mind Control).
  if (typeof value === "number" && (key === "weaponDamageConvert" || key === "damageConversionRate")) {
    return `${value}%`;
  }
  if (
    typeof value === "number" &&
    (key === "probeSpeed" ||
      key === "chargeSpeed" ||
      key === "waveSpeed" ||
      key === "airSpeed" ||
      key === "prismSpeed" ||
      key === "dashSpeed")
  ) {
    return key === "waveSpeed" ||
      key === "airSpeed" ||
      key === "prismSpeed" ||
      key === "dashSpeed"
      ? `${value.toFixed(0)}m/s`
      : `${value.toFixed(2)}m/s`;
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
      key === "gelMistReach" ||
      key === "tornadoHeight" ||
      key === "travelDistance" ||
      key === "maxShootingDistance")
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
  // Crystallize-style absolute crit (3 → 300%).
  if (typeof value === "number" && key === "absoluteCritChance") {
    return `${(value * 100).toFixed(0)}%`;
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
      key === "energyDrainPerEnemy" ||
      key === "energyDrainEnemyCap" ||
      key === "energyDrainMoving" ||
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
      key === "statusStacks" ||
      key === "maxReservoirs" ||
      key === "vitalityHealth" ||
      key === "vitalityHealPerSecond" ||
      key === "shockDamage" ||
      key === "shockTargets" ||
      key === "boostedDamagePerSecond" ||
      key === "boostedEnergyDrain" ||
      key === "damageRampCap" ||
      key === "slideEnergyCost" ||
      key === "diveBombDamage" ||
      key === "airborneEnergyCost" ||
      key === "meleeEnergyCost" ||
      key === "damageEnergyCost" ||
      key === "kissEnergyCost" ||
      key === "energyPerMark" ||
      key === "energyPerAbility" ||
      key === "energyPerCorpse" ||
      key === "energyPerPulse" ||
      key === "energyDrainGrowth" ||
      key === "mutationStackCost" ||
      key === "backbeatAmmoCost" ||
      key === "tickDamage" ||
      key === "tornadoCount" ||
      key === "travelDistance" ||
      key === "boltCount" ||
      key === "boltsOnKill" ||
      key === "maxTargets" ||
      key === "armorSteal" ||
      key === "shieldSteal" ||
      key === "overguardSteal" ||
      key === "armorStealCap" ||
      key === "overguardStealCap" ||
      key === "radiationStacks" ||
      key === "invulnAbsorbThreshold" ||
      key === "maxDamagePerInstance" ||
      key === "maxStoredDamage" ||
      key === "stunTargets" ||
      key === "maxShootingDistance" ||
      key === "hologramCount" ||
      key === "laserCount" ||
      key === "healthRegen" ||
      key === "maggotHealth" ||
      key === "maggotDamage" ||
      key === "selfHeal" ||
      key === "viralDamage" ||
      key === "viralStacks" ||
      key === "maxEnemies" ||
      key === "minCollisionDamage" ||
      key === "slamDamage" ||
      key === "healPerSecond" ||
      key === "toxinDamagePerSecond" ||
      key === "shieldCost" ||
      key === "minDamage" ||
      key === "allyShieldBonus" ||
      key === "shieldDrainPerAlly" ||
      key === "shieldDrainPerEnemy" ||
      key === "deactivationDamage" ||
      key === "shieldDrain" ||
      key === "maxAltitude" ||
      key === "maxLanterns" ||
      key === "droneDamage" ||
      key === "razorflies" ||
      key === "meleeDamage" ||
      key === "growthEnemyCap" ||
      key === "initialSpores" ||
      key === "decoyShields" ||
      key === "decoyHealth" ||
      key === "minArmorBonus" ||
      key === "accuseMaxTargets" ||
      key === "gazeMaxTargets" ||
      key === "damageGrowthPerSecond" ||
      key === "globules" ||
      key === "activeGlobuleCap" ||
      key === "merulinaHealth" ||
      key === "blades" ||
      key === "hitsPerInterval" ||
      key === "burstDamage" ||
      key === "snareDamage" ||
      key === "maxDomes" ||
      key === "vertices" ||
      key === "healthPerEnemy" ||
      key === "armorBonus" ||
      key === "totalHealthCost" ||
      key === "minHealthThreshold" ||
      key === "swarmKavatLimit" ||
      key === "charges" ||
      key === "maxDrones" ||
      key === "capsuleDamage" ||
      key === "flechetteDamage" ||
      key === "tetherMaxTargets" ||
      key === "maxOrbs" ||
      key === "maxPads" ||
      key === "knockbackDamage" ||
      key === "armorBuffRate" ||
      key === "vortexDamagePerSecond" ||
      key === "maxBastilles" ||
      key === "maxVortices" ||
      key === "areaDamage" ||
      key === "comboDamageCap" ||
      key === "minRingDamagePerSecond" ||
      key === "energyPerEnemy" ||
      key === "maxEnergyTargets" ||
      key === "energyRestore" ||
      key === "pickupHeal" ||
      key === "haloHealth" ||
      key === "shroudHealth" ||
      key === "shieldHealth" ||
      key === "segmentHealth" ||
      key === "healthShieldPerSecond" ||
      key === "fungalSpores" ||
      key === "maxMushrooms" ||
      key === "maxSporesprings" ||
      key === "bounces" ||
      key === "sproutDamage" ||
      key === "minHealthRegen" ||
      key === "maxHealthRegen")
  ) {
    return key === "contagionCloudDps" ||
      key === "heatDps" ||
      key === "energyDrain" ||
      key === "energyDrainPerEnemy" ||
      key === "energyDrainMoving" ||
      key === "energyDrainGrowth" ||
      key === "energyRegen" ||
      key === "fieldDamagePerSecond" ||
      key === "contactDamagePerSecond" ||
      key === "shotsPerSecond" ||
      key === "shieldsPerSecond" ||
      key === "overguardRegenPerSecond" ||
      key === "beamTicksPerSecond" ||
      key === "ticksPerSecond" ||
      key === "vitalityHealPerSecond" ||
      key === "boostedDamagePerSecond" ||
      key === "boostedEnergyDrain" ||
      key === "healthRegen" ||
      key === "healthShieldPerSecond" ||
      key === "minHealthRegen" ||
      key === "maxHealthRegen" ||
      key === "healPerSecond" ||
      key === "toxinDamagePerSecond" ||
      key === "shieldDrain" ||
      key === "shieldDrainPerAlly" ||
      key === "shieldDrainPerEnemy" ||
      key === "vortexDamagePerSecond"
      ? `${
          Number.isInteger(value)
            ? value
            : key === "energyDrainPerEnemy"
              ? value.toFixed(2)
              : value.toFixed(1)
        }/s`
      : key === "damageRampCap"
        ? `${value.toFixed(0)}x`
      : key === "travelDistance"
        ? `${value.toFixed(0)}m`
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
  const attrMult = scaleMultiplier(ctx, rule.scale);
  const mult = scaleFactor(ctx, rule);
  const cap = resolveCap(rule, miscStats);
  const floor = rule.floor;
  const modified = Math.abs(attrMult - 1) > 0.001;
  // Tint by whether the driving attribute is above baseline (inverse stats may shrink).
  const positive = attrMult >= 1;

  if (rule.formula === "one_minus_base_over_attr") {
    const base = parsePercentValue(value);
    if (base == null || attrMult <= 0) return null;
    const scaled = applyBounds(1 - base / attrMult, cap, floor);
    return {
      scaled: fmtPct(scaled),
      modified,
      positive,
    };
  }

  if (rule.formula === "channeled_drain") {
    const base = parseNumeric(value);
    if (base == null) return null;
    const eff = ctx.efficiency ?? 1;
    const dur = ctx.duration > 0 ? ctx.duration : 1;
    const factor = Math.max((2 - eff) / dur, 0.25);
    const scaled = applyBounds(base * factor, cap, floor);
    const fmt =
      Math.abs(scaled - Math.round(scaled)) < 0.05
        ? String(Math.round(scaled))
        : scaled < 1
          ? scaled.toFixed(2)
          : scaled.toFixed(1);
    return {
      scaled: `${fmt}/s`,
      modified: Math.abs(factor - 1) > 0.001,
      // Lower drain is better once EFF/DUR reduce the factor.
      positive: factor <= 1,
    };
  }

  // wiki cast/activation cost (energy or shields): base × max(2 − min(EFF, 1.75), 0.25)
  if (rule.formula === "cast_cost") {
    const base = parseNumeric(value);
    if (base == null) return null;
    const scaled = applyBounds(scaledAbilityEnergyCost(base, ctx.efficiency ?? 1), cap, floor);
    const fmt =
      Math.abs(scaled - Math.round(scaled)) < 0.05 ? String(Math.round(scaled)) : scaled.toFixed(1);
    return {
      scaled: fmt,
      modified: Math.abs(scaled - base) > 0.001,
      // Lower cast cost is better.
      positive: scaled <= base,
    };
  }

  // wiki Nourish: 1 + ((storedMultiplier − 1) × STR); Helminth 1.6 → 1.78 at 130% STR
  if (rule.formula === "one_plus_bonus_times_attr") {
    const base = parseNumeric(value);
    if (base == null) return null;
    const scaled = applyBounds(1 + (base - 1) * attrMult, cap, floor);
    return {
      scaled: scaled <= 1 ? `${scaled.toFixed(2)}x` : `${scaled.toFixed(1)}x`,
      modified,
      positive,
    };
  }

  // Wiki card percent-points (Absorb 0.025%, Mind Control 0.06%) — not 0–1 fractions.
  if (
    typeof value === "number" &&
    (key === "weaponDamageConvert" || key === "damageConversionRate")
  ) {
    const scaled = applyBounds(value * mult, cap, floor);
    const fmt = Number.parseFloat(scaled.toPrecision(6)).toString();
    return {
      scaled: `${fmt}%`,
      modified,
      positive,
    };
  }

  if (key === "arc" || key === "coneAngle" || key === "firingArc" || key === "seekAngle") {
    const base = parseDegrees(value);
    if (base == null) return null;
    const scaled = applyBounds(base * mult, cap, floor);
    return {
      scaled: `${scaled.toFixed(1)}°`,
      modified,
      positive,
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
      key === "gelMistReach" ||
      key === "tornadoHeight" ||
      key === "travelDistance")
  ) {
    const scaled = applyBounds(meters * mult, cap, floor);
    return {
      scaled: `${scaled.toFixed(1)}m`,
      modified,
      positive,
    };
  }

  if (
    typeof value === "number" &&
    (key === "probeSpeed" || key === "chargeSpeed" || key === "waveSpeed" || key === "airSpeed")
  ) {
    const scaled = applyBounds(value * mult, cap, floor);
    const fmt = key === "waveSpeed" || key === "airSpeed" ? scaled.toFixed(0) : scaled.toFixed(2);
    return {
      scaled: `${fmt}m/s`,
      modified,
      positive,
    };
  }
  if (typeof value === "number" && key === "cooldownReduction") {
    const scaled = applyBounds(value * mult, cap, floor);
    return {
      scaled: `${scaled.toFixed(1)}s`,
      modified,
      positive,
    };
  }

  const seconds = parseDurationSeconds(key, value);
  if (seconds != null) {
    const scaled = applyBounds(seconds * mult, cap, floor);
    return {
      scaled: `${scaled.toFixed(1)}s`,
      modified,
      positive,
    };
  }

  if (typeof value === "string" && key === "damageReduction") {
    const range = parseRangePercent(value);
    if (range) {
      const minScaled = applyBounds(range.min * mult, cap, floor);
      const maxScaled = applyBounds(range.max * mult, cap, floor);
      return {
        scaled: `${fmtPct(minScaled)}–${fmtPct(maxScaled)}`,
        modified,
        positive,
      };
    }
  }

  if (typeof value === "string" && key === "healthRegen") {
    const range = parseRangePerSecond(value);
    if (range) {
      return {
        scaled: `${Math.round(range.min * mult)}–${Math.round(range.max * mult)}/s`,
        modified,
        positive,
      };
    }
    const single = parseSinglePerSecond(value);
    if (single != null) {
      return {
        scaled: `${Math.round(single * mult)}/s`,
        modified,
        positive,
      };
    }
  }

  const numEarly = parseNumeric(value);
  if (
    numEarly != null &&
    (key.endsWith("Multiplier") || key.endsWith("Mult") || key === "damageGrowth")
  ) {
    const scaledNum = applyBounds(numEarly * mult, cap, floor);
    return {
      scaled: scaledNum <= 1 ? `${scaledNum.toFixed(2)}x` : `${scaledNum.toFixed(1)}x`,
      modified,
      positive,
    };
  }
  if (numEarly != null && key === "critDamageBonus") {
    const scaledNum = applyBounds(numEarly * mult, cap, floor);
    return {
      scaled: `+${scaledNum.toFixed(1)}x`,
      modified,
      positive,
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
      key === "energyDrainPerEnemy" ||
      key === "energyDrainEnemyCap" ||
      key === "energyDrainMoving" ||
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
      key === "statusStacks" ||
      key === "maxReservoirs" ||
      key === "vitalityHealth" ||
      key === "vitalityHealPerSecond" ||
      key === "shockDamage" ||
      key === "shockTargets" ||
      key === "boostedDamagePerSecond" ||
      key === "boostedEnergyDrain" ||
      key === "damageRampCap" ||
      key === "slideEnergyCost" ||
      key === "diveBombDamage" ||
      key === "airborneEnergyCost" ||
      key === "meleeEnergyCost" ||
      key === "damageEnergyCost" ||
      key === "kissEnergyCost" ||
      key === "energyPerMark" ||
      key === "energyPerAbility" ||
      key === "energyPerCorpse" ||
      key === "energyPerPulse" ||
      key === "energyDrainGrowth" ||
      key === "mutationStackCost" ||
      key === "backbeatAmmoCost" ||
      key === "tickDamage" ||
      key === "tornadoCount" ||
      key === "travelDistance" ||
      key === "boltCount" ||
      key === "boltsOnKill" ||
      key === "maxTargets" ||
      key === "armorSteal" ||
      key === "shieldSteal" ||
      key === "overguardSteal" ||
      key === "armorStealCap" ||
      key === "overguardStealCap" ||
      key === "radiationStacks" ||
      key === "invulnAbsorbThreshold" ||
      key === "maxDamagePerInstance" ||
      key === "maxStoredDamage" ||
      key === "stunTargets" ||
      key === "maxShootingDistance" ||
      key === "hologramCount" ||
      key === "laserCount" ||
      key === "healthRegen" ||
      key === "maggotHealth" ||
      key === "maggotDamage" ||
      key === "selfHeal" ||
      key === "viralDamage" ||
      key === "viralStacks" ||
      key === "maxEnemies" ||
      key === "minCollisionDamage" ||
      key === "slamDamage" ||
      key === "healPerSecond" ||
      key === "toxinDamagePerSecond" ||
      key === "shieldCost" ||
      key === "minDamage" ||
      key === "allyShieldBonus" ||
      key === "shieldDrainPerAlly" ||
      key === "shieldDrainPerEnemy" ||
      key === "deactivationDamage" ||
      key === "shieldDrain" ||
      key === "maxAltitude" ||
      key === "maxLanterns" ||
      key === "droneDamage" ||
      key === "razorflies" ||
      key === "meleeDamage" ||
      key === "growthEnemyCap" ||
      key === "initialSpores" ||
      key === "decoyShields" ||
      key === "decoyHealth" ||
      key === "minArmorBonus" ||
      key === "accuseMaxTargets" ||
      key === "gazeMaxTargets" ||
      key === "damageGrowthPerSecond" ||
      key === "globules" ||
      key === "activeGlobuleCap" ||
      key === "merulinaHealth" ||
      key === "blades" ||
      key === "hitsPerInterval" ||
      key === "burstDamage" ||
      key === "snareDamage" ||
      key === "maxDomes" ||
      key === "vertices" ||
      key === "healthPerEnemy" ||
      key === "armorBonus" ||
      key === "totalHealthCost" ||
      key === "minHealthThreshold" ||
      key === "swarmKavatLimit" ||
      key === "charges" ||
      key === "maxDrones" ||
      key === "capsuleDamage" ||
      key === "flechetteDamage" ||
      key === "tetherMaxTargets" ||
      key === "maxOrbs" ||
      key === "maxPads" ||
      key === "knockbackDamage" ||
      key === "armorBuffRate" ||
      key === "vortexDamagePerSecond" ||
      key === "maxBastilles" ||
      key === "maxVortices" ||
      key === "areaDamage" ||
      key === "comboDamageCap" ||
      key === "minRingDamagePerSecond" ||
      key === "energyPerEnemy" ||
      key === "maxEnergyTargets" ||
      key === "energyRestore" ||
      key === "pickupHeal" ||
      key === "haloHealth" ||
      key === "shroudHealth" ||
      key === "shieldHealth" ||
      key === "segmentHealth" ||
      key === "healthShieldPerSecond" ||
      key === "fungalSpores" ||
      key === "maxMushrooms" ||
      key === "maxSporesprings" ||
      key === "bounces" ||
      key === "sproutDamage" ||
      key === "minHealthRegen" ||
      key === "maxHealthRegen")
  ) {
    const scaledNum =
      key === "energyRegen" ? Math.round(num * mult * 100) / 100 : Math.round(num * mult);
    return {
      scaled:
        key === "contagionCloudDps" ||
        key === "heatDps" ||
        key === "energyDrain" ||
        key === "energyDrainPerEnemy" ||
        key === "energyDrainMoving" ||
        key === "energyDrainGrowth" ||
        key === "energyRegen" ||
        key === "fieldDamagePerSecond" ||
        key === "contactDamagePerSecond" ||
        key === "shotsPerSecond" ||
        key === "shieldsPerSecond" ||
        key === "overguardRegenPerSecond" ||
        key === "beamTicksPerSecond" ||
        key === "ticksPerSecond" ||
        key === "vitalityHealPerSecond" ||
        key === "boostedDamagePerSecond" ||
        key === "boostedEnergyDrain" ||
        key === "healthRegen" ||
        key === "healPerSecond" ||
        key === "toxinDamagePerSecond" ||
        key === "shieldDrain" ||
        key === "shieldDrainPerAlly" ||
        key === "shieldDrainPerEnemy" ||
        key === "vortexDamagePerSecond"
          ? `${
              key === "energyDrainPerEnemy" && !Number.isInteger(scaledNum)
                ? Number(scaledNum).toFixed(2)
                : scaledNum
            }/s`
          : key === "damageRampCap"
            ? `${scaledNum}x`
          : key === "travelDistance"
            ? `${scaledNum}m`
          : String(scaledNum),
      modified: Math.abs(scaledNum - num) > 0.001,
      positive: scaledNum >= num,
    };
  }

  if (num != null && isFractionPercentKey(key)) {
    const scaled = applyBounds(num * mult, cap, floor);
    return {
      scaled: fmtPct(scaled),
      modified: Math.abs(scaled - num) > 0.001,
      positive,
    };
  }

  const pct = parsePercentValue(value);
  if (pct != null) {
    const scaled = applyBounds(pct * mult, cap, floor);
    return {
      scaled: fmtPct(scaled),
      modified: Math.abs(scaled - pct) > 0.001,
      positive,
    };
  }

  if (num != null) {
    const scaledNum = applyBounds(num * mult, cap, floor);
    return {
      scaled: String(Math.round(scaledNum)),
      modified: Math.round(scaledNum) !== Math.round(num),
      positive,
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

/**
 * Wiki Iron Skin / Snow Globe (pre-absorb) pool:
 * (base + armorMultiplier × totalArmor) × Ability Strength.
 */
export function computeArmorScaledPool(
  base: number,
  armorMultiplier: number,
  totalArmor: number,
  strength: number,
): number {
  return (base + armorMultiplier * Math.max(0, totalArmor)) * strength;
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
