import { getEffectiveModsMap } from "@/lib/weapons/effective-data";
import type { Archwing, Necramech } from "@/data/archwing";
import {
  applyVerifiedModStatToArchwing,
  applyVerifiedModStatToNecramech,
  type ArchwingModAccumulators,
} from "@/lib/mods/mod-behavior-registry";
import type { ArchwingCalculatedStats, Mod, ModSlot } from "@/lib/types";

type EquippedArchwingMod = Pick<ModSlot, "modId" | "rank">;

function emptyAccumulators(): ArchwingModAccumulators {
  return {
    healthBonus: 0,
    shieldBonus: 0,
    armorBonus: 0,
    energyBonus: 0,
    sprintSpeedBonus: 0,
    slideSpeedBonus: 0,
    flowBonus: 0,
    parkourVelocityBonus: 0,
    abilityStrength: 0,
    abilityDuration: 0,
    abilityEfficiency: 0,
    abilityRange: 0,
    flightSpeedBonus: 0,
    kineticDiversionPercent: 0,
  };
}

function modStatFraction(perRank: number, rank: number): number {
  return (perRank * (rank + 1)) / 100;
}

function applyArchwingMods(
  equippedMods: EquippedArchwingMod[],
  allMods: Map<string, Mod>,
): { acc: ArchwingModAccumulators; panel: { modBonuses?: Record<string, number> } } {
  const acc = emptyAccumulators();
  const panel: { modBonuses?: Record<string, number> } = {};

  for (const em of equippedMods) {
    const mod = allMods.get(em.modId);
    if (!mod?.stats || mod.category !== "archwing") continue;

    const rank = Math.min(Math.max(em.rank ?? 0, 0), mod.maxRank);
    for (const [statKey, perRank] of Object.entries(mod.stats)) {
      const modValue = modStatFraction(perRank, rank);
      applyVerifiedModStatToArchwing(panel, mod.id, statKey, modValue, acc);
    }
  }

  return { acc, panel };
}

export function calculateArchwingBuild(
  archwing: Archwing,
  equippedMods: EquippedArchwingMod[],
  allMods: Map<string, Mod> = getEffectiveModsMap(),
): ArchwingCalculatedStats {
  const { acc, panel } = applyArchwingMods(equippedMods, allMods);

  const totalHealth = archwing.health * (1 + acc.healthBonus);
  const totalShield = archwing.shield * (1 + acc.shieldBonus);
  const totalArmor = archwing.armor * (1 + acc.armorBonus);
  const totalEnergy = archwing.energy * (1 + acc.energyBonus);
  const totalFlightSpeed = archwing.speed * (1 + acc.flightSpeedBonus);
  const armorDR = totalArmor > 0 ? totalArmor / (totalArmor + 300) : 0;

  return {
    baseHealth: archwing.health,
    baseShield: archwing.shield,
    baseArmor: archwing.armor,
    baseEnergy: archwing.energy,
    baseFlightSpeed: archwing.speed,
    healthBonus: acc.healthBonus,
    shieldBonus: acc.shieldBonus,
    armorBonus: acc.armorBonus,
    energyBonus: acc.energyBonus,
    flightSpeedBonus: acc.flightSpeedBonus,
    abilityStrength: 1 + acc.abilityStrength,
    abilityDuration: 1 + acc.abilityDuration,
    abilityEfficiency: 1 + acc.abilityEfficiency,
    abilityRange: 1 + acc.abilityRange,
    totalHealth,
    totalShield,
    totalArmor,
    totalEnergy,
    totalFlightSpeed,
    effectiveHealth: totalHealth / (1 - armorDR) + totalShield,
    damageReduction: armorDR * 100,
    kineticDiversionPercent: acc.kineticDiversionPercent,
    modBonuses: panel.modBonuses,
  };
}

function applyNecramechMods(
  equippedMods: EquippedArchwingMod[],
  allMods: Map<string, Mod>,
): { acc: ArchwingModAccumulators; panel: { modBonuses?: Record<string, number> } } {
  const acc = emptyAccumulators();
  const panel: { modBonuses?: Record<string, number> } = {};

  for (const em of equippedMods) {
    const mod = allMods.get(em.modId);
    if (!mod?.stats || mod.category !== "necramech") continue;

    const rank = Math.min(Math.max(em.rank ?? 0, 0), mod.maxRank);
    for (const [statKey, perRank] of Object.entries(mod.stats)) {
      const modValue = modStatFraction(perRank, rank);
      applyVerifiedModStatToNecramech(panel, mod.id, statKey, modValue, acc);
    }
  }

  return { acc, panel };
}

export function calculateNecramechBuild(
  necramech: Necramech,
  equippedMods: EquippedArchwingMod[],
  allMods: Map<string, Mod> = getEffectiveModsMap(),
): ArchwingCalculatedStats {
  const { acc, panel } = applyNecramechMods(equippedMods, allMods);

  const totalHealth = necramech.health * (1 + acc.healthBonus);
  const totalShield = necramech.shield * (1 + acc.shieldBonus);
  const totalArmor = necramech.armor * (1 + acc.armorBonus);
  const totalEnergy = necramech.energy * (1 + acc.energyBonus);
  const armorDR = totalArmor > 0 ? totalArmor / (totalArmor + 300) : 0;

  return {
    baseHealth: necramech.health,
    baseShield: necramech.shield,
    baseArmor: necramech.armor,
    baseEnergy: necramech.energy,
    baseFlightSpeed: 0,
    healthBonus: acc.healthBonus,
    shieldBonus: acc.shieldBonus,
    armorBonus: acc.armorBonus,
    energyBonus: acc.energyBonus,
    flightSpeedBonus: 0,
    abilityStrength: 1 + acc.abilityStrength,
    abilityDuration: 1 + acc.abilityDuration,
    abilityEfficiency: 1 + acc.abilityEfficiency,
    abilityRange: 1 + acc.abilityRange,
    totalHealth,
    totalShield,
    totalArmor,
    totalEnergy,
    totalFlightSpeed: 0,
    effectiveHealth: totalHealth / (1 - armorDR) + totalShield,
    damageReduction: armorDR * 100,
    kineticDiversionPercent: 0,
    modBonuses: panel.modBonuses,
  };
}
