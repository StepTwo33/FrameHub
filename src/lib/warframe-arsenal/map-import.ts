import type ArsenalData from "@wfcd/arsenal-parser";
import type { ModUnion } from "@wfcd/items";
import type { Loadout, ModSlot, ModularBuildData } from "@/lib/types";
import {
  findArcaneByName,
  findCompanionByName,
  findModByName,
  findWarframeByName,
  findWeaponByName,
  labelFromUnknown,
  parseCustomItemName,
} from "@/lib/warframe-arsenal/catalog-match";
import {
  findArchwingByLotusPath,
  findCompanionByLotusPath,
  findNecramechByLotusPath,
  findWarframeByLotusPath,
  findWeaponByLotusPath,
  mapModularPartsFromArsenal,
  parseProgenitorFromRawWeapon,
  readAbilityOverride,
  readRawWeaponFields,
  resolveHelminthOverride,
} from "@/lib/warframe-arsenal/lotus-resolve";

export interface ArsenalImportWarning {
  kind: "warframe" | "weapon" | "companion" | "mod" | "arcane" | "helminth" | "modular" | "archwing";
  label: string;
}

export interface ArsenalImportPayload {
  account: {
    playerName: string;
    masteryRank: number;
    lastUpdated: string;
    focusSchool?: string;
  };
  loadout: Omit<Loadout, "id" | "createdAt" | "updatedAt">;
  warnings: ArsenalImportWarning[];
}

type RawLoadouts = {
  NORMAL?: {
    warframe?: unknown;
    primary?: unknown;
    secondary?: unknown;
    melee?: unknown;
    heavy?: unknown;
  };
};

function modRank(mod: ModUnion): number {
  const rank = (mod as { rank?: number }).rank;
  return typeof rank === "number" ? rank : 0;
}

function mapUpgradeMods(
  mods: ModUnion[],
  warnings: ArsenalImportWarning[],
): { mods: ModSlot[]; stanceModId?: string } {
  const slots: ModSlot[] = [];
  let stanceModId: string | undefined;
  let slotIndex = 0;

  for (const entry of mods) {
    const name = labelFromUnknown(entry);
    if (!name) continue;

    const fhMod = findModByName(name);
    if (!fhMod) {
      warnings.push({ kind: "mod", label: name });
      continue;
    }

    if (fhMod.category === "stance" && !stanceModId) {
      stanceModId = fhMod.id;
      continue;
    }

    slots.push({
      modId: fhMod.id,
      rank: Math.min(modRank(entry), fhMod.maxRank),
      slotIndex,
    });
    slotIndex += 1;
  }

  return { mods: slots, stanceModId };
}

function mapArcaneIds(
  arcanes: Array<{ name?: string; rank?: number }>,
  warnings: ArsenalImportWarning[],
): { arcaneIds: (string | null)[]; arcaneRanks: number[] } {
  const arcaneIds: (string | null)[] = [null, null];
  const arcaneRanks: number[] = [0, 0];

  arcanes.slice(0, 2).forEach((arcane, index) => {
    const name = arcane.name;
    if (!name) return;
    const fh = findArcaneByName(name);
    if (!fh) {
      warnings.push({ kind: "arcane", label: name });
      return;
    }
    arcaneIds[index] = fh.id;
    const rank = typeof arcane.rank === "number" ? arcane.rank : fh.maxRank;
    arcaneRanks[index] = Math.min(rank, fh.maxRank);
  });

  return { arcaneIds, arcaneRanks };
}

type ArsenalWeapon = {
  name?: string;
  weapon?: unknown;
  parts?: Record<string, unknown>;
  upgrades: { mods: ModUnion[]; arcanes: Array<{ name?: string; rank?: number }> };
  xp?: number;
  uniqueName?: string;
};

function resolveWeaponId(
  weapon: ArsenalWeapon,
  raw?: ReturnType<typeof readRawWeaponFields>,
): { weaponId?: string; label: string; customName?: string } {
  const customName = raw?.itemName ? parseCustomItemName(raw.itemName) : undefined;

  const fromLotus = findWeaponByLotusPath(
    raw?.uniqueName ?? (typeof weapon.uniqueName === "string" ? weapon.uniqueName : undefined),
    raw?.itemName,
  );
  if (fromLotus) {
    return { weaponId: fromLotus.id, label: fromLotus.name, customName };
  }

  const label =
    customName ||
    weapon.name ||
    labelFromUnknown(weapon.weapon) ||
    labelFromUnknown(weapon) ||
    "Unknown weapon";
  const fh = findWeaponByName(label);
  return { weaponId: fh?.id, label, customName };
}

function weaponBuildFromArsenal(
  weapon: ArsenalWeapon | undefined,
  rawWeapon: unknown,
  warnings: ArsenalImportWarning[],
) {
  if (!weapon) return undefined;

  const raw = readRawWeaponFields(rawWeapon);
  const modularFromParts =
    mapModularPartsFromArsenal(weapon.parts) ??
    mapModularPartsFromArsenal(raw.modularParts);

  if (modularFromParts) {
    const { mods, stanceModId } = mapUpgradeMods(weapon.upgrades.mods, warnings);
    const { arcaneIds } = mapArcaneIds(weapon.upgrades.arcanes, warnings);
    const customName = raw.itemName ? parseCustomItemName(raw.itemName) : weapon.name;
    const build: ModularBuildData & { slot: "primary" | "secondary" | "melee" } = {
      ...modularFromParts.data,
      slot: modularFromParts.slot,
      mods,
      arcaneIds,
      customName: customName || undefined,
      isMR30: (weapon.xp ?? raw.xp ?? 0) >= 900_000,
    };
    if (stanceModId && modularFromParts.slot === "melee") {
      // Stance is tracked on melee weapon builds; modular zaws use stance in mods list.
    }
    return { kind: "modular" as const, build };
  }

  const { weaponId, label } = resolveWeaponId(weapon, raw);
  if (!weaponId) {
    warnings.push({ kind: "weapon", label });
    return undefined;
  }

  const { mods, stanceModId } = mapUpgradeMods(weapon.upgrades.mods, warnings);
  const { arcaneIds } = mapArcaneIds(weapon.upgrades.arcanes, warnings);
  const progenitor = parseProgenitorFromRawWeapon(raw);

  return {
    kind: "weapon" as const,
    build: {
      weaponId,
      mods,
      stanceModId,
      arcaneIds,
      hasOrokinCatalyst: false,
      isMR30: (weapon.xp ?? raw.xp ?? 0) >= 900_000,
      slotPolarities: {},
      ...progenitor,
    },
  };
}

function mapArchwingBuild(
  arsenal: ArsenalData,
  warnings: ArsenalImportWarning[],
): Loadout["archwingBuild"] {
  const vehicles = arsenal.loadout.vechiles;
  if (!vehicles) return undefined;

  if (vehicles.necramech?.mech) {
    const mech = vehicles.necramech.mech;
    const fhMech = findNecramechByLotusPath(mech.uniqueName);
    if (!fhMech) {
      warnings.push({ kind: "archwing", label: labelFromUnknown(mech.mech) ?? "Necramech" });
      return undefined;
    }

    const frameMods = mapUpgradeMods(mech.upgrades.mods, warnings).mods;
    const heavy = weaponBuildFromArsenal(vehicles.necramech.heavy, undefined, warnings);

    return {
      mode: "necramech",
      necramechId: fhMech.id,
      frameMods,
      weaponId: heavy?.kind === "weapon" ? heavy.build.weaponId : undefined,
      weaponMods: heavy?.kind === "weapon" ? heavy.build.mods : [],
      hasReactor: false,
      hasCatalyst: false,
    };
  }

  if (vehicles.archwing) {
    const aw = vehicles.archwing;
    const fhArch = findArchwingByLotusPath(aw.uniqueName) ?? findArchwingByLotusPath(labelFromUnknown(aw.archwing) ?? "");
    if (!fhArch) {
      warnings.push({ kind: "archwing", label: labelFromUnknown(aw.archwing) ?? "Archwing" });
      return undefined;
    }

    const frameMods = mapUpgradeMods(aw.upgrades.mods, warnings).mods;
    const gun =
      weaponBuildFromArsenal(vehicles.primary, undefined, warnings) ??
      weaponBuildFromArsenal(vehicles.melee, undefined, warnings);

    return {
      mode: "archwing",
      archwingId: fhArch.id,
      frameMods,
      weaponId: gun?.kind === "weapon" ? gun.build.weaponId : undefined,
      weaponMods: gun?.kind === "weapon" ? gun.build.mods : [],
      hasReactor: false,
      hasCatalyst: false,
    };
  }

  return undefined;
}

function assignWeaponSlot(
  loadout: Omit<Loadout, "id" | "createdAt" | "updatedAt">,
  slot: "primary" | "secondary" | "melee",
  mapped: ReturnType<typeof weaponBuildFromArsenal>,
) {
  if (!mapped) return;
  if (mapped.kind === "modular") {
    if (!loadout.modularBuild) {
      loadout.modularBuild = mapped.build;
    }
    return;
  }
  if (slot === "primary") loadout.primaryBuild = mapped.build;
  else if (slot === "secondary") loadout.secondaryBuild = mapped.build;
  else loadout.meleeBuild = mapped.build;
}

/** Map parsed Twitch arsenal data into a FrameHub loadout import payload. */
export function mapArsenalToImportPayload(
  arsenal: ArsenalData,
  rawPayload?: { loadOuts?: RawLoadouts },
): ArsenalImportPayload {
  const warnings: ArsenalImportWarning[] = [];
  const { loadout, account } = arsenal;
  const rawNormal = rawPayload?.loadOuts?.NORMAL;

  const wfLabel =
    labelFromUnknown(loadout.warframe.warframe) ||
    labelFromUnknown(loadout.warframe) ||
    "Warframe";
  const fhWarframe =
    findWarframeByLotusPath(loadout.warframe.uniqueName) ?? findWarframeByName(wfLabel);
  if (!fhWarframe) {
    warnings.push({ kind: "warframe", label: wfLabel });
  }

  const wfMapped = mapUpgradeMods(loadout.warframe.upgrades.mods, warnings);
  const wfArcanes = mapArcaneIds(loadout.warframe.upgrades.arcanes, warnings);

  const helminthOverride = readAbilityOverride(rawNormal?.warframe);
  const helminth = resolveHelminthOverride(helminthOverride);
  if (helminthOverride?.ability && !helminth) {
    warnings.push({
      kind: "helminth",
      label: helminthOverride.ability.split("/").pop() ?? "Helminth ability",
    });
  }

  let companionBuild: Loadout["companionBuild"];
  if (loadout.companion) {
    const companionRaw = rawPayload?.loadOuts as { SENTINEL?: { companion?: unknown } } | undefined;
    const rawCompanion = companionRaw?.SENTINEL?.companion;
    const rawFields = readRawWeaponFields(rawCompanion);

    const fhCompanion =
      findCompanionByLotusPath(
        loadout.companion.uniqueName ?? rawFields.uniqueName,
        loadout.companion.name ?? rawFields.itemName,
      ) ??
      findCompanionByName(
        loadout.companion.name ||
          labelFromUnknown(loadout.companion.companion) ||
          labelFromUnknown(loadout.companion) ||
          "Companion",
      );

    if (!fhCompanion) {
      warnings.push({
        kind: "companion",
        label: loadout.companion.name || labelFromUnknown(loadout.companion.companion) || "Companion",
      });
    } else {
      const body = mapUpgradeMods(loadout.companion.upgrades.mods, warnings);
      const weaponMods = loadout.roboticweapon
        ? mapUpgradeMods(loadout.roboticweapon.upgrades.mods, warnings).mods
        : [];
      const companionArcanes = mapArcaneIds(loadout.companion.upgrades.arcanes, warnings);
      companionBuild = {
        companionId: fhCompanion.id,
        mods: body.mods,
        weaponMods,
        arcaneIds: companionArcanes.arcaneIds,
        hasReactor: false,
        hasCatalyst: false,
        isMR30: (loadout.companion.xp ?? 0) >= 900_000,
      };
    }
  }

  const playerName = account.name;
  const loadoutName = `${playerName} — Imported Loadout`;

  const resultLoadout: Omit<Loadout, "id" | "createdAt" | "updatedAt"> = {
    name: loadoutName,
    warframeBuild: fhWarframe
      ? {
          warframeId: fhWarframe.id,
          mods: wfMapped.mods,
          shards: [null, null, null, null, null],
          arcaneIds: wfArcanes.arcaneIds,
          arcaneRanks: wfArcanes.arcaneRanks,
          hasOrokinReactor: false,
          isMR30: (loadout.warframe.xp ?? 0) >= 900_000,
          slotPolarities: {},
          ...(helminth
            ? { helminthSlot: helminth.helminthSlot, helminthAbilityId: helminth.helminthAbilityId }
            : {}),
        }
      : undefined,
    companionBuild,
  };

  assignWeaponSlot(
    resultLoadout,
    "primary",
    weaponBuildFromArsenal(loadout.primary, rawNormal?.primary, warnings),
  );
  assignWeaponSlot(
    resultLoadout,
    "secondary",
    weaponBuildFromArsenal(loadout.secondary, rawNormal?.secondary, warnings),
  );
  assignWeaponSlot(
    resultLoadout,
    "melee",
    weaponBuildFromArsenal(loadout.melee, rawNormal?.melee, warnings),
  );

  // Archgun (heavy) — import as primary when no primary is set.
  if (!resultLoadout.primaryBuild && !resultLoadout.modularBuild?.slot && loadout.heavy) {
    const heavyMapped = weaponBuildFromArsenal(loadout.heavy, rawNormal?.heavy, warnings);
    if (heavyMapped?.kind === "weapon") {
      resultLoadout.primaryBuild = heavyMapped.build;
    }
  }

  const archwingBuild = mapArchwingBuild(arsenal, warnings);
  if (archwingBuild) {
    resultLoadout.archwingBuild = archwingBuild;
  }

  return {
    account: {
      playerName,
      masteryRank: account.masteryRank,
      lastUpdated: account.lastUpdated.toISOString(),
      focusSchool: account.focusSchool,
    },
    loadout: resultLoadout,
    warnings,
  };
}

export function loadoutHasImportableContent(loadout: ArsenalImportPayload["loadout"]): boolean {
  return !!(
    loadout.warframeBuild ||
    loadout.primaryBuild ||
    loadout.secondaryBuild ||
    loadout.meleeBuild ||
    loadout.modularBuild ||
    loadout.companionBuild ||
    loadout.archwingBuild
  );
}
