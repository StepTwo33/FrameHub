import { allHelminthAbilities } from "@/data/helminth";
import { allArchonShards } from "@/data/archon-shards";
import { companionsMap } from "@/data/companions";
import { modsMap } from "@/data/mods";
import { weaponsMap } from "@/data/weapons";
import { warframesMap } from "@/data/warframes";
import { resolveArcaneById } from "@/lib/build-storage";
import type { WarframeBuildData } from "@/lib/build-storage";
import { dualFormModCountSummary } from "@/lib/dual-form-warframes";
import { getCompanionImage, getWarframeImage, getWeaponImage } from "@/lib/images";
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

function modChipsFromSlots(mods: ModSlot[] | undefined): BuildPreviewChip[] {
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
    case "archwing":
    case "railjack": {
      const modChips = modChipsFromSlots(d.mods as ModSlot[]);
      const count = modChips.length;
      return {
        itemName: type === "archwing" ? "Archwing / Necramech" : "Railjack",
        itemImage: null,
        typeLabel: type === "archwing" ? "Archwing" : "Railjack",
        modChips,
        arcaneChips: [],
        extraLines,
        modSummary: count === 0 ? "No mods equipped" : `${count} mod${count === 1 ? "" : "s"}`,
      };
    }
    default:
      return fallback;
  }
}
