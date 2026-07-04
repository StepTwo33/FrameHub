import { Mod } from "@/lib/types";
import { ARCANE_EFFECTS, ArcaneEffectDef, ArcaneTrigger } from "@/data/arcane-effects";
import { getPersistenceDamageCap, scaleArcaneEffectValue } from "@/lib/arcane-utils";

export interface ArcaneEffectLine {
  label: string;
  value: string;
  active?: boolean;
  note?: string;
}

export interface ArcaneDisplayInfo {
  name: string;
  rank: number;
  maxRank: number;
  description: string;
  applied: ArcaneEffectLine[];
  conditional: ArcaneEffectLine[];
}

const STAT_LABELS: Record<string, string> = {
  armor: "Armor",
  flatArmorBonus: "Armor",
  armorBonusAmount: "Armor",
  abilityStrength: "Ability Strength",
  abilityDuration: "Ability Duration",
  abilityEfficiency: "Ability Efficiency",
  abilityRange: "Ability Range",
  flowEnergyMax: "Max Energy",
  health: "Health",
  healthFlat: "Health",
  shield: "Shield",
  energy: "Energy",
  sprintSpeed: "Sprint Speed",
  sprintSpeedBonus: "Sprint Speed",
  parkourVelocity: "Parkour Velocity",
  healthOrbEffectiveness: "Health Orb Effectiveness",
  healthFromOrbs: "Health from Orbs",
  energyOrbBonus: "Energy from Orbs",
  allyEnergy: "Ally Energy Share",
  healthRegenAmount: "Health Regen/s",
  healthRegenPerSec: "Health Regen/s",
  healthRegen: "Health Regen/s",
  healthRegenChance: "Proc Chance",
  armorBonusChance: "Proc Chance",
  shieldRegenAmount: "Shield Regen/s",
  shieldRegenChance: "Proc Chance",
  meleeDamageBonus: "Melee Damage",
  meleeDamageChance: "Proc Chance",
  attackSpeedChance: "Proc Chance",
  attackSpeedBonus: "Attack Speed",
  critChanceOnDamaged: "Crit Chance",
  fireRateOnCrit: "Fire Rate",
  fireRateOnHeadshot: "Fire Rate",
  fireRate: "Fire Rate",
  criticalChance: "Crit Chance",
  criticalMultiplier: "Crit Damage",
  multishot: "Multishot",
  damage: "Damage",
  reloadSpeed: "Reload Speed",
  reloadSpeedBonus: "Reload Speed",
  statusChance: "Status Chance",
  statusResistance: "Status Resistance",
  coldResistance: "Cold Resistance",
  damageReduction: "Damage Reduction",
  energyRegen: "Energy Regen/s",
  energyPerArmor: "Energy per Armor",
  abilityStrengthToShield: "Shield → Strength",
  abilityStrengthPerHealth: "Strength per Health",
  ammoEfficiency: "Ammo Efficiency",
  holsterDamage: "Holster Damage",
  holsterSpeed: "Holster Speed",
  headshotDamage: "Headshot Damage",
  finisherDamage: "Finisher Damage",
  bonusDamageOnStatus: "Bonus Damage on Status",
  enemyResistanceReduction: "Enemy Resistance Reduction",
  operatorToWarframeHeal: "Operator → Warframe Heal",
  operatorHealth: "Operator Health",
  operatorArmor: "Operator Armor",
  voidConversion: "Void Conversion",
  utilityEffect: "Special Effect",
  knockdownChance: "Knockdown Chance",
  escapistStackCap: "Escapist Stack Cap",
  invulnerabilityDuration: "Invulnerability Duration",
  freeAbilityCastChance: "Free Ability Cast Chance",
  overguardThreshold: "Overguard Threshold",
  radialAttackRadius: "Radial Attack Radius",
  dissipateRadius: "Dissipate Radius",
  voidMoteEnergy: "Void Mote Energy",
  lethalInvulnDuration: "Lethal Invuln Duration",
  lethalHealPercent: "Lethal Heal",
  projectileOnAimGlide: "Aim Glide Projectile",
  shockwaveOnSlam: "Slam Shockwave",
  pullChance: "Pull Chance",
  pullRadius: "Pull Radius",
  revertWindow: "Revert Window",
  revertHeal: "Revert Heal",
  debilitateStackThreshold: "Debilitate Stack Threshold",
  weaponJamRadius: "Weapon Jam Radius",
  weaponJamCooldown: "Weapon Jam Cooldown",
  statusChancePerHit: "Status Chance per Hit",
  tauronStrikeCharge: "Tauron Strike Charge",
  headshotHealthRegen: "Headshot Health Regen",
};

const PASSIVE_TRIGGERS = new Set<ArcaneTrigger>(["passive"]);

function isProcStat(stat: string, trigger: ArcaneTrigger): boolean {
  if (PASSIVE_TRIGGERS.has(trigger) || trigger === "stacks") return false;
  if (stat.endsWith("Chance")) return true;
  return true;
}

function fmtPct(n: number, decimals = 0): string {
  return `${n.toFixed(decimals)}%`;
}

function fmtStatValue(stat: string, scaled: number, flat?: boolean): string {
  if (flat) {
    if (["healthFlat", "health", "shield", "energy", "energyOrbBonus"].includes(stat)) {
      return `+${scaled.toFixed(0)}`;
    }
    if (stat === "energyPerArmor") return `${scaled.toFixed(2)}/armor`;
    return scaled % 1 !== 0 ? scaled.toFixed(1) : scaled.toFixed(0);
  }
  const isFlatResource = ["health", "shield", "energy"].includes(stat);
  if (isFlatResource) return `+${scaled.toFixed(0)}`;
  return fmtPct(scaled, scaled % 1 !== 0 ? 1 : 0);
}

function triggerNote(trigger: ArcaneTrigger, stackCap?: number | null): string | undefined {
  switch (trigger) {
    case "passive":
      return undefined;
    case "stacks":
      return stackCap ? `Stacks up to ${stackCap}x` : "Stacking";
    case "onKill":
      return "On kill";
    case "onHeadshot":
      return "On headshot";
    case "onDamaged":
      return "When damaged";
    case "onReload":
      return "On reload";
    case "onAbilityCast":
      return "On ability cast";
    case "onMeleeKill":
      return "On melee kill";
    case "onFinisher":
      return "On finisher";
    case "onStatus":
      return "On status proc";
    case "onPickup":
      return "On orb pickup";
    case "onVoidSling":
      return "On Void Sling";
    case "onMovement":
      return "On movement";
    case "onHit":
      return "On hit";
    case "onFreeze":
      return "On freeze";
    case "conditional":
      return "Conditional";
    default:
      return undefined;
  }
}

function buildLinesFromDef(
  def: ArcaneEffectDef,
  rank: number,
  context?: { totalArmor?: number; persistenceActive?: boolean },
  arcaneId?: string,
): Pick<ArcaneDisplayInfo, "applied" | "conditional"> {
  const applied: ArcaneEffectLine[] = [];
  const conditional: ArcaneEffectLine[] = [];
  const note = triggerNote(def.trigger, def.stackCap);

  if (arcaneId === "arcane_persistence") {
    const cap = getPersistenceDamageCap(rank, def.maxRank);
    applied.push({ label: "Shields", value: "Removed", active: true });
    const armorMet = (context?.totalArmor ?? 0) >= 700;
    conditional.push({
      label: "Damage cap",
      value: `${cap}/s`,
      active: armorMet && (context?.persistenceActive ?? false),
      note: armorMet ? "Active (Armor ≥ 700)" : "Requires Armor ≥ 700",
    });
    return { applied, conditional };
  }

  for (const line of def.effects) {
    if (line.stat === "removeShields" || line.stat === "persistenceDamageCapPerSecond") continue;
    if (line.stat === "abilityStrengthPerHealthStep") continue;

    const scaled = scaleArcaneEffectValue(line.maxValue, rank, def.maxRank);
    const label = STAT_LABELS[line.stat] ?? line.stat;
    const value = fmtStatValue(line.stat, scaled, line.flat);
    const proc = isProcStat(line.stat, def.trigger);

    if (proc) {
      conditional.push({
        label,
        value,
        note: note ?? "Proc / conditional",
      });
    } else {
      applied.push({
        label,
        value,
        active: true,
        note: def.trigger === "stacks" && def.stackCap ? `Per stack (max ${def.stackCap})` : note,
      });
    }
  }

  return { applied, conditional };
}

export function getArcaneDisplayInfo(
  arcane: Mod,
  rank: number,
  context?: { totalArmor?: number; persistenceActive?: boolean },
): ArcaneDisplayInfo {
  const cleanDesc = arcane.description.replace(/<[^>]+>/g, "").replace(/\\ /g, " ").trim();
  const def = ARCANE_EFFECTS[arcane.id];

  if (def && def.effects.length > 0) {
    const { applied, conditional } = buildLinesFromDef(def, rank, context, arcane.id);
    return {
      name: arcane.name,
      rank,
      maxRank: arcane.maxRank,
      description: cleanDesc,
      applied,
      conditional,
    };
  }

  // Fallback to legacy arcane.stats on Mod record
  const applied: ArcaneEffectLine[] = [];
  const conditional: ArcaneEffectLine[] = [];

  for (const [key, maxVal] of Object.entries(arcane.stats)) {
    const scaled = scaleArcaneEffectValue(maxVal, rank, arcane.maxRank);
    const label = STAT_LABELS[key] ?? key;
    const value = fmtStatValue(key, scaled);
    if (key.endsWith("Chance")) {
      conditional.push({ label, value, note: "On proc" });
    } else {
      applied.push({ label, value, active: true });
    }
  }

  if (Object.keys(arcane.stats).length === 0) {
    conditional.push({
      label: "Effect",
      value: cleanDesc.length > 120 ? `${cleanDesc.slice(0, 117)}…` : cleanDesc,
      note: "Proc / conditional",
    });
  }

  return { name: arcane.name, rank, maxRank: arcane.maxRank, description: cleanDesc, applied, conditional };
}
