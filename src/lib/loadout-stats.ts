import { modsMap } from "@/data/mods";
import { WEAPON_PASSIVES } from "@/data/weapon-passives";
import { warframesMap } from "@/data/warframes";
import { weaponsMap, allWeapons as allWeaponsData } from "@/data/weapons";
import { companionsMap } from "@/data/companions";
import { incarnonDataMap } from "@/data/incarnon";
import type { WarframeBuildData } from "@/lib/build-storage";
import { allDualFormMods, getDualFormConfig } from "@/lib/dual-form-warframes";
import { resolveSavedArcaneSlots } from "@/lib/build-storage";
import { resolveDefaultCompanionWeapon } from "@/lib/companion-weapons";
import { weaponFromModularData } from "@/lib/modular-resolve";
import {
  applyWarframeShardsAndArcanes,
  calculateWarframeBuild,
  calculateWeaponBuild,
  calculateWeaponBuildWithArcanes,
} from "@/lib/calculator";
import { calculateTTK, ENEMY_TYPES, type EnemyType, type TTKResult } from "@/lib/ttk";
import type {
  CalculatedStats,
  Companion,
  CompanionCalculatedStats,
  Loadout,
  Mod,
  ModSlot,
  SetBonusLinkage,
  SimulationParams,
  WarframeCalculatedStats,
  Weapon,
  WeaponCalculationOptions,
} from "@/lib/types";
import { DEFAULT_SIM_PARAMS } from "@/lib/types";

export type DamageScenario = "paper" | "midFight" | "fullRamp" | "vsEnemy";

export const SCENARIO_PRESETS: Record<Exclude<DamageScenario, "vsEnemy">, SimulationParams> = {
  paper: {
    ...DEFAULT_SIM_PARAMS,
    comboCount: 0,
    killStacks: 0,
    statusTypesOnTarget: 0,
    arcaneStacks: 0,
  },
  midFight: {
    ...DEFAULT_SIM_PARAMS,
    comboCount: 40,
    killStacks: 3,
    statusTypesOnTarget: 2,
    arcaneStacks: 6,
  },
  fullRamp: {
    ...DEFAULT_SIM_PARAMS,
    comboCount: 120,
    killStacks: 5,
    statusTypesOnTarget: 4,
    arcaneStacks: 12,
  },
};

export function scenarioSimParams(scenario: DamageScenario): SimulationParams {
  if (scenario === "vsEnemy") return { ...SCENARIO_PRESETS.midFight };
  return { ...SCENARIO_PRESETS[scenario] };
}

export interface LoadoutWeaponSlotStats {
  name: string;
  stats: CalculatedStats;
  ttk?: TTKResult;
  isMelee: boolean;
}

export interface LoadoutWarframeStats {
  name: string;
  stats: WarframeCalculatedStats;
  /** Per-form stats when the warframe has separate mod setups (e.g. Sirius & Orion). */
  forms?: { id: string; label: string; stats: WarframeCalculatedStats }[];
}

export interface LoadoutStatsResult {
  warframe: LoadoutWarframeStats | null;
  primary: LoadoutWeaponSlotStats | null;
  secondary: LoadoutWeaponSlotStats | null;
  melee: LoadoutWeaponSlotStats | null;
  exalted: LoadoutWeaponSlotStats | null;
  companion: {
    name: string;
    bodyStats: CompanionCalculatedStats;
    weapon: LoadoutWeaponSlotStats | null;
  } | null;
}

export interface CalcLoadoutStatsOptions {
  simParams?: SimulationParams;
  enemy?: EnemyType | null;
  enemyLevel?: number;
  allWeapons?: Weapon[];
}

function weaponWithPassive(w: Weapon): Weapon {
  if (w.passive) return w;
  const p = WEAPON_PASSIVES[w.id];
  return p ? { ...w, passive: p } : w;
}

export function setBonusLinkageFromLoadout(loadout: Loadout): SetBonusLinkage {
  const m = loadout.modularBuild;
  const wfMods = loadout.warframeBuild
    ? allDualFormMods(loadout.warframeBuild as WarframeBuildData)
    : undefined;
  return {
    warframeMods: wfMods,
    primaryMods: loadout.primaryBuild?.mods ?? (m?.slot === "primary" ? m.mods : undefined),
    secondaryMods: loadout.secondaryBuild?.mods ?? (m?.slot === "secondary" ? m.mods : undefined),
    meleeMods: loadout.meleeBuild?.mods ?? (m?.slot === "melee" ? m.mods : undefined),
    companionMods: loadout.companionBuild?.mods,
  };
}

function getIncarnonStatChanges(
  weaponId: string,
  evolutions?: Record<number, number>,
): Record<string, number> | undefined {
  const data = incarnonDataMap.get(weaponId);
  if (!data || !evolutions || Object.keys(evolutions).length === 0) return undefined;
  const merged: Record<string, number> = {};
  for (const [tierStr, slot] of Object.entries(evolutions)) {
    const tier = Number(tierStr);
    const evo = data.evolutions.find((e) => e.tier === tier && e.slot === slot);
    if (!evo) continue;
    for (const [stat, val] of Object.entries(evo.statChanges)) {
      merged[stat] = (merged[stat] ?? 0) + val;
    }
  }
  return Object.keys(merged).length > 0 ? merged : undefined;
}

function calculateCompanionBodyStats(
  companion: Companion,
  equippedMods: ModSlot[],
): CompanionCalculatedStats {
  const stats: CompanionCalculatedStats = {
    baseHealth: companion.health,
    baseShield: companion.shield,
    baseArmor: companion.armor,
    totalHealth: companion.health,
    totalShield: companion.shield,
    totalArmor: companion.armor,
    healthBonus: 0,
    shieldBonus: 0,
    armorBonus: 0,
    meleeDamageBonus: 0,
    attackSpeedBonus: 0,
    critChanceBonus: 0,
    critDamageBonus: 0,
    effectiveHealth: 0,
    damageReduction: 0,
  };

  for (const em of equippedMods) {
    const mod = modsMap.get(em.modId);
    if (!mod) continue;
    const multiplier = Math.min(Math.max(em.rank ?? 0, 0), mod.maxRank) + 1;
    for (const [statName, value] of Object.entries(mod.stats)) {
      const modValue = (value * multiplier) / 100;
      switch (statName) {
        case "health":
          stats.healthBonus += modValue;
          break;
        case "shield":
          stats.shieldBonus += modValue;
          break;
        case "armor":
          stats.armorBonus += modValue;
          break;
        case "meleeDamage":
          stats.meleeDamageBonus += modValue;
          break;
        case "attackSpeed":
          stats.attackSpeedBonus += modValue;
          break;
        case "criticalChance":
          stats.critChanceBonus += modValue;
          break;
        case "criticalDamage":
          stats.critDamageBonus += modValue;
          break;
      }
    }
  }

  stats.totalHealth = stats.baseHealth * (1 + stats.healthBonus);
  stats.totalShield = stats.baseShield * (1 + stats.shieldBonus);
  stats.totalArmor = stats.baseArmor * (1 + stats.armorBonus);
  const armor = stats.totalArmor;
  stats.damageReduction = armor > 0 ? (armor / (armor + 300)) * 100 : 0;
  stats.effectiveHealth = stats.totalHealth * (1 + armor / 300) + stats.totalShield;
  return stats;
}

type WeaponBuildPayload = {
  weaponId: string;
  mods: ModSlot[];
  arcaneIds?: (string | null)[];
  progenitorElement?: string;
  progenitorBonusPercent?: number;
  incarnonEvolutions?: Record<number, number>;
};

function calcWeaponSlotStats(
  build: WeaponBuildPayload | undefined,
  simParams: SimulationParams,
  setLinkage: SetBonusLinkage,
  enemy?: EnemyType | null,
  enemyLevel?: number,
): LoadoutWeaponSlotStats | null {
  if (!build) return null;
  const w = weaponsMap.get(build.weaponId);
  if (!w) return null;
  const base = weaponWithPassive(w);
  const calcOptions: WeaponCalculationOptions | undefined =
    build.progenitorElement &&
    build.progenitorBonusPercent != null &&
    build.progenitorBonusPercent > 0
      ? { progenitorElement: build.progenitorElement, progenitorBonusPercent: build.progenitorBonusPercent }
      : undefined;
  const incarnonChanges = getIncarnonStatChanges(build.weaponId, build.incarnonEvolutions);
  const arcaneMods = resolveSavedArcaneSlots(build.arcaneIds, 2).filter((m): m is Mod => m != null);
  const modSlots = build.mods || [];
  const stats =
    arcaneMods.length > 0
      ? calculateWeaponBuildWithArcanes(
          base,
          modSlots,
          modsMap,
          arcaneMods,
          incarnonChanges,
          simParams,
          calcOptions,
          setLinkage,
        )
      : calculateWeaponBuild(
          base,
          modSlots,
          modsMap,
          incarnonChanges,
          simParams,
          calcOptions,
          setLinkage,
        );
  const isMelee = base.category === "melee" || base.triggerType === "Melee";
  const ttk =
    enemy && enemyLevel != null && enemyLevel > 0 ? calculateTTK(stats, enemy, enemyLevel) : undefined;
  return { name: base.name, stats, ttk, isMelee };
}

function calcModularSlotStats(
  loadout: Loadout,
  slot: "primary" | "secondary" | "melee",
  simParams: SimulationParams,
  setLinkage: SetBonusLinkage,
  enemy?: EnemyType | null,
  enemyLevel?: number,
): LoadoutWeaponSlotStats | null {
  if (loadout.modularBuild?.slot !== slot) return null;
  const data = loadout.modularBuild;
  let w = weaponFromModularData(data);
  if (!w) return null;
  w = weaponWithPassive(w);
  const modSlots = data.mods || [];
  const arcaneMods = resolveSavedArcaneSlots(data.arcaneIds, 2).filter((m): m is Mod => m != null);
  const stats =
    arcaneMods.length > 0
      ? calculateWeaponBuildWithArcanes(w, modSlots, modsMap, arcaneMods, undefined, simParams, undefined, setLinkage)
      : calculateWeaponBuild(w, modSlots, modsMap, undefined, simParams, undefined, setLinkage);
  const isMelee = w.category === "melee" || w.triggerType === "Melee";
  const ttk =
    enemy && enemyLevel != null && enemyLevel > 0 ? calculateTTK(stats, enemy, enemyLevel) : undefined;
  return { name: w.name, stats, ttk, isMelee };
}

export function calcLoadoutStats(loadout: Loadout, options: CalcLoadoutStatsOptions = {}): LoadoutStatsResult {
  const simParams = options.simParams ?? scenarioSimParams("midFight");
  const enemy = options.enemy ?? null;
  const enemyLevel = options.enemyLevel ?? 100;
  const weaponList = options.allWeapons ?? allWeaponsData;
  const setLinkage = setBonusLinkageFromLoadout(loadout);

  const result: LoadoutStatsResult = {
    warframe: null,
    primary: null,
    secondary: null,
    melee: null,
    exalted: null,
    companion: null,
  };

  if (loadout.warframeBuild) {
    const wf = warframesMap.get(loadout.warframeBuild.warframeId);
    if (wf) {
      // `arcaneRanks` isn't declared on Loadout["warframeBuild"] but survives the
      // save round-trip (payload spread from WarframeBuildData).
      const wb = loadout.warframeBuild as NonNullable<Loadout["warframeBuild"]> &
        Pick<WarframeBuildData, "arcaneRanks">;
      const shards = wb.shards;
      const dualConfig = getDualFormConfig(loadout.warframeBuild.warframeId);
      if (dualConfig) {
        const formStats = dualConfig.forms.map((form) => {
          const isDefault = form.id === dualConfig.defaultFormId;
          const slice = isDefault ? undefined : wb.dualFormBuilds?.[form.id];
          const mods = isDefault ? wb.mods || [] : slice?.mods || [];
          // Arcanes are per-form; archon shards are shared across forms.
          const sliceWithArcanes = slice as
            | (typeof slice & Pick<WarframeBuildData, "arcaneIds" | "arcaneRanks">)
            | undefined;
          const arcaneIds = isDefault ? wb.arcaneIds : sliceWithArcanes?.arcaneIds;
          const arcaneRanks = isDefault ? wb.arcaneRanks : sliceWithArcanes?.arcaneRanks;
          const stats = calculateWarframeBuild(wf, mods, modsMap, setLinkage);
          return {
            id: form.id,
            label: form.label,
            stats: applyWarframeShardsAndArcanes(
              stats,
              shards,
              resolveSavedArcaneSlots(arcaneIds, 2),
              arcaneRanks,
            ),
          };
        });
        result.warframe = {
          name: wf.name,
          stats: formStats.find((f) => f.id === dualConfig.defaultFormId)!.stats,
          forms: formStats,
        };
      } else {
        const stats = applyWarframeShardsAndArcanes(
          calculateWarframeBuild(wf, wb.mods || [], modsMap, setLinkage),
          shards,
          resolveSavedArcaneSlots(wb.arcaneIds, 2),
          wb.arcaneRanks,
        );
        result.warframe = { name: wf.name, stats };
      }

      const exaltedWeapon = weaponList.find(
        (w) => w.isExalted && w.warframeId === loadout.warframeBuild!.warframeId,
      );
      if (exaltedWeapon && (loadout.warframeBuild.exaltedMods?.length ?? 0) > 0) {
        const base = weaponWithPassive(exaltedWeapon);
        const statsEx = calculateWeaponBuild(
          base,
          loadout.warframeBuild.exaltedMods || [],
          modsMap,
          undefined,
          simParams,
          undefined,
          setLinkage,
        );
        const isMelee = base.category === "melee" || base.triggerType === "Melee";
        const ttk =
          enemy && enemyLevel > 0 ? calculateTTK(statsEx, enemy, enemyLevel) : undefined;
        result.exalted = { name: base.name, stats: statsEx, ttk, isMelee };
      }
    }
  }

  result.primary =
    calcModularSlotStats(loadout, "primary", simParams, setLinkage, enemy, enemyLevel) ??
    calcWeaponSlotStats(loadout.primaryBuild, simParams, setLinkage, enemy, enemyLevel);
  result.secondary =
    calcModularSlotStats(loadout, "secondary", simParams, setLinkage, enemy, enemyLevel) ??
    calcWeaponSlotStats(loadout.secondaryBuild, simParams, setLinkage, enemy, enemyLevel);
  result.melee =
    calcModularSlotStats(loadout, "melee", simParams, setLinkage, enemy, enemyLevel) ??
    calcWeaponSlotStats(loadout.meleeBuild, simParams, setLinkage, enemy, enemyLevel);

  if (loadout.companionBuild) {
    const c = companionsMap.get(loadout.companionBuild.companionId);
    if (c) {
      const bodyStats = calculateCompanionBodyStats(c, loadout.companionBuild.mods || []);
      let weapon: LoadoutWeaponSlotStats | null = null;
      const weaponMods = loadout.companionBuild.weaponMods || [];
      if (weaponMods.length > 0) {
        const companionWeapon = resolveDefaultCompanionWeapon(c, weaponList);
        if (companionWeapon) {
          const base = weaponWithPassive(companionWeapon);
          const stats = calculateWeaponBuild(
            base,
            weaponMods,
            modsMap,
            undefined,
            simParams,
            undefined,
            setLinkage,
          );
          const isMelee = base.category === "melee" || base.triggerType === "Melee";
          const ttk =
            enemy && enemyLevel > 0 ? calculateTTK(stats, enemy, enemyLevel) : undefined;
          weapon = { name: base.name, stats, ttk, isMelee };
        }
      }
      result.companion = { name: c.name, bodyStats, weapon };
    }
  }

  return result;
}

export function bestSustainedDps(stats: LoadoutStatsResult): {
  slot: string;
  name: string;
  sustainedDps: number;
} | null {
  const slots: { slot: string; entry: LoadoutWeaponSlotStats | null }[] = [
    { slot: "Primary", entry: stats.primary },
    { slot: "Secondary", entry: stats.secondary },
    { slot: "Melee", entry: stats.melee },
    { slot: "Exalted", entry: stats.exalted },
  ];
  let best: { slot: string; name: string; sustainedDps: number } | null = null;
  for (const { slot, entry } of slots) {
    if (!entry) continue;
    const dps = entry.ttk?.sustainedDps ?? entry.stats.sustainedDps;
    if (!best || dps > best.sustainedDps) {
      best = { slot, name: entry.name, sustainedDps: dps };
    }
  }
  return best;
}

export function fmtDamageNum(n: number, decimals = 0): string {
  if (!Number.isFinite(n)) return "–";
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(decimals);
}

export { ENEMY_TYPES };
