import { allHelminthAbilities } from "@/data/helminth";
import { allArchonShards } from "@/data/archon-shards";
import {
  getEffectiveCompanionsMap,
  getEffectiveModsMap,
  getEffectiveWarframesMap,
  getEffectiveWeaponsMap,
} from "@/lib/effective-data";
import { resolveArcaneById } from "@/lib/builds/build-storage";
import type { WarframeBuildData } from "@/lib/builds/build-storage";
import { dualFormModCountSummary } from "@/lib/builds/dual-form-warframes";
import { getCompanionImage, getWarframeImage, getWeaponImage } from "@/lib/display/images";
import type { EquippedArchonShard, ModSlot } from "@/lib/types";

export interface BuildPreviewChip {
  label: string;
  sublabel?: string;
}

export interface BuildPreviewData {
  itemName: string;
  itemImage: string | null;
  typeLabel: string;
  modChips: BuildPreviewChip[];
  arcaneChips: BuildPreviewChip[];
  extraLines: string[];
  modSummary: string;
}

function modChipsFromSlots(mods: ModSlot[] | undefined, modsMap = getEffectiveModsMap()): BuildPreviewChip[] {
  const chips: BuildPreviewChip[] = [];
  for (const m of mods ?? []) {
    const mod = modsMap.get(m.modId);
    if (!mod) continue;
    chips.push(m.rank > 0 ? { label: mod.name, sublabel: `R${m.rank}` } : { label: mod.name });
  }
  return chips;
}

function arcaneChipsFromIds(ids: (string | null)[] | undefined): BuildPreviewChip[] {
  const chips: BuildPreviewChip[] = [];
  for (const id of ids ?? []) {
    if (!id) continue;
    const arcane = resolveArcaneById(id);
    chips.push({ label: arcane?.name ?? id });
  }
  return chips;
}

function shardSummary(shards: (EquippedArchonShard | null)[] | undefined): string | null {
  const equipped = (shards ?? []).filter((s): s is EquippedArchonShard => s != null);
  if (equipped.length === 0) return null;
  const parts = equipped.map((s) => {
    const def = allArchonShards.find((sh) => sh.id === s.shardId);
    const name = def?.color ?? s.shardColor;
    const tier = s.shardTier === 2 ? " τ" : "";
    return `${name}${tier}`;
  });
  return `Archon shards: ${parts.join(", ")}`;
}

export function summarizeBuildPreview(type: string, data: unknown): BuildPreviewData {
  const modsMap = getEffectiveModsMap();
  const weaponsMap = getEffectiveWeaponsMap();
  const warframesMap = getEffectiveWarframesMap();
  const companionsMap = getEffectiveCompanionsMap();
  const fallback: BuildPreviewData = {
    itemName: "Unknown item",
    itemImage: null,
    typeLabel: type,
    modChips: [],
    arcaneChips: [],
    extraLines: [],
    modSummary: "No mods equipped",
  };

  if (!data || typeof data !== "object") return fallback;
  const d = data as Record<string, unknown>;
  const extraLines: string[] = [];

  switch (type) {
    case "warframe": {
      const wb = data as WarframeBuildData;
      const wf = warframesMap.get(String(wb.warframeId ?? ""));
      const modChips = modChipsFromSlots(wb.mods);
      const arcaneChips = arcaneChipsFromIds(wb.arcaneIds);
      if (wb.dualFormBuilds && Object.keys(wb.dualFormBuilds).length > 0) {
        extraLines.push(dualFormModCountSummary(wb));
      }
      const shards = shardSummary(wb.shards);
      if (shards) extraLines.push(shards);
      if (wb.helminthAbilityId) {
        const helminth = allHelminthAbilities.find((a) => a.id === wb.helminthAbilityId);
        extraLines.push(`Helminth: ${helminth?.name ?? wb.helminthAbilityId}`);
      }
      const count = modChips.length;
      return {
        itemName: wf?.name ?? "Warframe",
        itemImage: wf ? getWarframeImage(wf.name) : null,
        typeLabel: "Warframe",
        modChips,
        arcaneChips,
        extraLines,
        modSummary: count === 0 ? "No mods on default form" : `${count} mod${count === 1 ? "" : "s"} shown (default form)`,
      };
    }
    case "weapon": {
      const w = weaponsMap.get(String(d.weaponId ?? ""));
      const modChips = modChipsFromSlots(d.mods as ModSlot[]);
      const arcaneChips = arcaneChipsFromIds(d.arcaneIds as (string | null)[]);
      if (d.stanceModId) {
        const stance = modsMap.get(String(d.stanceModId));
        if (stance) modChips.unshift({ label: stance.name, sublabel: "Stance" });
      }
      const count = modChips.length;
      return {
        itemName: w?.name ?? "Weapon",
        itemImage: w ? getWeaponImage(w.name, { category: w.category }) : null,
        typeLabel: "Weapon",
        modChips,
        arcaneChips,
        extraLines,
        modSummary: count === 0 ? "No mods equipped" : `${count} mod${count === 1 ? "" : "s"}`,
      };
    }
    case "companion": {
      const c = companionsMap.get(String(d.companionId ?? ""));
      const bodyMods = modChipsFromSlots(d.mods as ModSlot[]);
      const weaponMods = modChipsFromSlots(d.weaponMods as ModSlot[]);
      const arcaneChips = arcaneChipsFromIds(d.arcaneIds as (string | null)[]);
      if (weaponMods.length > 0) {
        extraLines.push(`Companion weapon: ${weaponMods.length} mod${weaponMods.length === 1 ? "" : "s"}`);
      }
      const count = bodyMods.length;
      return {
        itemName: c?.name ?? "Companion",
        itemImage: c ? getCompanionImage(c.name) : null,
        typeLabel: "Companion",
        modChips: bodyMods,
        arcaneChips,
        extraLines,
        modSummary: count === 0 ? "No body mods" : `${count} body mod${count === 1 ? "" : "s"}`,
      };
    }
    case "modular": {
      const parts = d.parts as Record<string, string> | undefined;
      const modChips = modChipsFromSlots(d.mods as ModSlot[]);
      const arcaneChips = arcaneChipsFromIds(d.arcaneIds as (string | null)[]);
      if (parts) {
        const partNames = Object.entries(parts)
          .map(([slot, id]) => `${slot}: ${weaponsMap.get(id)?.name ?? id}`)
          .join(" · ");
        if (partNames) extraLines.push(partNames);
      }
      const count = modChips.length;
      return {
        itemName: String(d.modularType ?? "Modular").replace(/_/g, " "),
        itemImage: null,
        typeLabel: "Modular",
        modChips,
        arcaneChips,
        extraLines,
        modSummary: count === 0 ? "No mods equipped" : `${count} mod${count === 1 ? "" : "s"}`,
      };
    }
    case "archwing": {
      const modChips = modChipsFromSlots(d.frameMods as ModSlot[] | undefined);
      const weaponChips = modChipsFromSlots(d.weaponMods as ModSlot[] | undefined);
      if (weaponChips.length > 0) {
        extraLines.push(`Weapon: ${weaponChips.length} mod${weaponChips.length === 1 ? "" : "s"}`);
      }
      const count = modChips.length;
      return {
        itemName: "Archwing / Necramech",
        itemImage: null,
        typeLabel: "Archwing",
        modChips,
        arcaneChips: [],
        extraLines,
        modSummary: count === 0 ? "No mods equipped" : `${count} mod${count === 1 ? "" : "s"}`,
      };
    }
    case "railjack": {
      const modChips = modChipsFromSlots(d.integratedMods as ModSlot[] | undefined);
      const battleChips = modChipsFromSlots(d.battleMods as ModSlot[] | undefined);
      const tacticalChips = modChipsFromSlots(d.tacticalMods as ModSlot[] | undefined);
      if (battleChips.length > 0) {
        extraLines.push(`Battle: ${battleChips.length} mod${battleChips.length === 1 ? "" : "s"}`);
      }
      if (tacticalChips.length > 0) {
        extraLines.push(`Tactical: ${tacticalChips.length} mod${tacticalChips.length === 1 ? "" : "s"}`);
      }
      const count = modChips.length;
      return {
        itemName: "Railjack",
        itemImage: null,
        typeLabel: "Railjack",
        modChips,
        arcaneChips: [],
        extraLines,
        modSummary: count === 0 ? "No mods equipped" : `${count} mod${count === 1 ? "" : "s"}`,
      };
    }
    case "loadout": {
      const ld = data as Record<string, unknown>;
      const wfBuild = ld.warframeBuild as WarframeBuildData | undefined;
      const wf = wfBuild ? warframesMap.get(wfBuild.warframeId) : undefined;
      const slots: string[] = [];
      if (wfBuild) {
        const wfMods = wfBuild.mods?.length ?? 0;
        slots.push(`Warframe: ${wf?.name ?? wfBuild.warframeId} (${wfMods} mods)`);
      }
      const countWeaponMods = (b: { mods?: ModSlot[] } | undefined) => b?.mods?.length ?? 0;
      if (ld.primaryBuild) slots.push(`Primary: ${countWeaponMods(ld.primaryBuild as { mods?: ModSlot[] })} mods`);
      if (ld.secondaryBuild) slots.push(`Secondary: ${countWeaponMods(ld.secondaryBuild as { mods?: ModSlot[] })} mods`);
      if (ld.meleeBuild) slots.push(`Melee: ${countWeaponMods(ld.meleeBuild as { mods?: ModSlot[] })} mods`);
      if (ld.modularBuild) slots.push(`Modular (${(ld.modularBuild as { slot?: string }).slot ?? "weapon"}): ${countWeaponMods(ld.modularBuild as { mods?: ModSlot[] })} mods`);
      const comp = ld.companionBuild as { companionId?: string; mods?: ModSlot[] } | undefined;
      if (comp?.companionId) {
        const c = companionsMap.get(comp.companionId);
        slots.push(`Companion: ${c?.name ?? comp.companionId} (${comp.mods?.length ?? 0} mods)`);
      }
      extraLines.push(...slots);
      const filledSlots = slots.length;
      return {
        itemName: wf?.name ?? (filledSlots > 0 ? "Full loadout" : "Loadout"),
        itemImage: wf ? getWarframeImage(wf.name) : null,
        typeLabel: "Loadout",
        modChips: wfBuild ? modChipsFromSlots(wfBuild.mods) : [],
        arcaneChips: wfBuild ? arcaneChipsFromIds(wfBuild.arcaneIds) : [],
        extraLines,
        modSummary:
          filledSlots === 0
            ? "No slots filled"
            : `${filledSlots} slot${filledSlots === 1 ? "" : "s"} configured`,
      };
    }
    default:
      return fallback;
  }
}
