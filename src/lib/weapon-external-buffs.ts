import { getVerifiedFieldScaling } from "@/lib/ability-scaling-registry";
import { weaponSupportsPrimaryStyleSets } from "@/lib/set-bonuses";
import type {
  Ability,
  SimulationParams,
  WarframeCalculatedStats,
  Weapon,
  WeaponExternalBuff,
} from "@/lib/types";

export interface WeaponBuffContext {
  warframeId?: string;
  warframeStats?: WarframeCalculatedStats;
  warframeAbilities?: Ability[];
}

function isPrimaryWeapon(weapon: Weapon): boolean {
  return weaponSupportsPrimaryStyleSets(weapon);
}

function isSecondaryWeapon(weapon: Weapon): boolean {
  return ["pistol", "secondary", "dual_pistols"].includes(weapon.category);
}

function isMeleeWeapon(weapon: Weapon): boolean {
  return weapon.category === "melee" || weapon.triggerType === "Melee";
}

function scaledAbilityDamageBuff(
  warframeId: string,
  abilityName: string,
  baseBuff: number,
  abilityStrength: number,
): number {
  const rule =
    getVerifiedFieldScaling(warframeId, abilityName, "damageBuff") ??
    getVerifiedFieldScaling("rhino", abilityName, "damageBuff");
  const mult = !rule || rule.scale === "strength" ? abilityStrength : 1;
  let value = baseBuff * mult;
  if (rule?.cap != null) value = Math.min(value, rule.cap);
  return value;
}

function resolveAbilityBuffs(
  ctx: WeaponBuffContext,
  simParams: SimulationParams,
): WeaponExternalBuff[] {
  const active = simParams.activeWeaponAbilityBuffs ?? [];
  if (active.length === 0 || !ctx.warframeId || !ctx.warframeStats || !ctx.warframeAbilities) return [];

  const strength = ctx.warframeStats.abilityStrength;
  const buffs: WeaponExternalBuff[] = [];

  for (const ability of ctx.warframeAbilities) {
    if (ability.damageBuff == null || ability.damageBuff <= 0) continue;
    if (!active.includes(ability.name)) continue;

    const bonus = scaledAbilityDamageBuff(ctx.warframeId, ability.name, ability.damageBuff, strength);
    if (bonus <= 0) continue;

    buffs.push({
      id: `ability:${ability.name}`,
      label: ability.name,
      category: "ability",
      damageBonus: bonus,
      nominal: `+${(ability.damageBuff * 100).toFixed(0)}% weapon damage`,
    });
  }

  return buffs;
}

function resolveShardBuffs(weapon: Weapon, ctx: WeaponBuffContext): WeaponExternalBuff[] {
  const stats = ctx.warframeStats;
  if (!stats) return [];

  const buffs: WeaponExternalBuff[] = [];

  if (isMeleeWeapon(weapon) && stats.meleeCritDamageBonus > 0) {
    buffs.push({
      id: "shard:melee-crit-damage",
      label: "Archon Shard (Melee Crit)",
      category: "shard",
      critMultBonus: stats.meleeCritDamageBonus / 100,
      nominal: `+${stats.meleeCritDamageBonus}% melee crit damage`,
    });
  }

  if (isPrimaryWeapon(weapon) && stats.primaryShardBonus > 0) {
    buffs.push({
      id: "shard:primary-status",
      label: "Archon Shard (Primary Status)",
      category: "shard",
      statusBonus: stats.primaryShardBonus / 100,
      nominal: `+${stats.primaryShardBonus}% primary status chance`,
    });
  }

  if (isSecondaryWeapon(weapon) && stats.secondaryShardBonus > 0) {
    buffs.push({
      id: "shard:secondary-crit",
      label: "Archon Shard (Secondary Crit)",
      category: "shard",
      critChanceBonus: stats.secondaryShardBonus / 100,
      nominal: `+${stats.secondaryShardBonus}% secondary crit chance`,
    });
  }

  return buffs;
}

export function resolveWeaponExternalBuffs(
  weapon: Weapon,
  ctx: WeaponBuffContext | undefined,
  simParams: SimulationParams,
): WeaponExternalBuff[] {
  if (!ctx) return [];
  return [...resolveAbilityBuffs(ctx, simParams), ...resolveShardBuffs(weapon, ctx)];
}

/** Abilities on a warframe that grant a top-level weapon damage buff. */
export function weaponDamageBuffAbilities(abilities: Ability[] | undefined): Ability[] {
  if (!abilities) return [];
  return abilities.filter((a) => a.damageBuff != null && a.damageBuff > 0);
}

export function mergeWeaponCalcOptions(
  existing: { progenitorElement?: string; progenitorBonusPercent?: number } | undefined,
  externalBuffs: WeaponExternalBuff[],
): import("@/lib/types").WeaponCalculationOptions | undefined {
  const hasProgenitor =
    existing?.progenitorElement &&
    existing.progenitorBonusPercent != null &&
    existing.progenitorBonusPercent > 0;
  if (!hasProgenitor && externalBuffs.length === 0) return undefined;
  return {
    ...(hasProgenitor
      ? {
          progenitorElement: existing!.progenitorElement,
          progenitorBonusPercent: existing!.progenitorBonusPercent,
        }
      : {}),
    ...(externalBuffs.length > 0 ? { externalBuffs } : {}),
  };
}
