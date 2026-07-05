import { archwings, necramechs } from "@/data/archwing";
import { companionsMap } from "@/data/companions";
import {
  ampPrisms,
  kitgunChambers,
  zawStrikes,
} from "@/data/modular-weapons";
import { reactors } from "@/data/railjack";
import { warframesMap } from "@/data/warframes";
import { weaponsMap } from "@/data/weapons";
import { getCompanionImage, getWarframeImage, getWeaponImage } from "@/lib/images";

export interface BuildItemDisplay {
  itemName: string | null;
  itemImage: string | null;
  typeLabel: string;
}

const TYPE_LABELS: Record<string, string> = {
  weapon: "Weapon",
  warframe: "Warframe",
  companion: "Companion",
  modular: "Modular",
  archwing: "Archwing",
  railjack: "Railjack",
};

const MODULAR_TYPE_LABELS: Record<string, string> = {
  kitgun: "Kitgun",
  zaw: "Zaw",
  amp: "Amp",
};

function resolveModularDisplay(itemId: string): BuildItemDisplay {
  const [modType, partId] = itemId.includes(":")
    ? (itemId.split(":", 2) as [string, string])
    : [itemId, ""];

  let partName: string | null = null;
  if (partId) {
    if (modType === "kitgun") {
      partName = kitgunChambers.find((p) => p.id === partId)?.name ?? null;
    } else if (modType === "zaw") {
      partName = zawStrikes.find((p) => p.id === partId)?.name ?? null;
    } else if (modType === "amp") {
      partName = ampPrisms.find((p) => p.id === partId)?.name ?? null;
    }
  }

  const typeLabel = MODULAR_TYPE_LABELS[modType] ?? "Modular";
  const itemName = partName ?? typeLabel;

  const weapon = partId ? weaponsMap.get(partId) : undefined;
  const itemImage = weapon
    ? getWeaponImage(weapon.name, { category: weapon.category })
    : null;

  return { itemName, itemImage, typeLabel };
}

/** Resolve display name and thumbnail for a public build from denormalized type + itemId. */
export function resolveBuildItemDisplay(type: string, itemId: string): BuildItemDisplay {
  const typeLabel = TYPE_LABELS[type] ?? type.replace(/_/g, " ");

  if (!itemId) {
    return { itemName: null, itemImage: null, typeLabel };
  }

  switch (type) {
    case "weapon": {
      const weapon = weaponsMap.get(itemId);
      return {
        itemName: weapon?.name ?? null,
        itemImage: weapon ? getWeaponImage(weapon.name, { category: weapon.category }) : null,
        typeLabel,
      };
    }
    case "warframe": {
      const wf = warframesMap.get(itemId);
      return {
        itemName: wf?.name ?? null,
        itemImage: wf ? getWarframeImage(wf.name) : null,
        typeLabel,
      };
    }
    case "companion": {
      const companion = companionsMap.get(itemId);
      return {
        itemName: companion?.name ?? null,
        itemImage: companion ? getCompanionImage(companion.name) : null,
        typeLabel,
      };
    }
    case "modular":
      return resolveModularDisplay(itemId);
    case "archwing": {
      const frame =
        archwings.find((a) => a.id === itemId) ?? necramechs.find((n) => n.id === itemId);
      if (frame) {
        return {
          itemName: frame.name,
          itemImage: getWarframeImage(frame.name),
          typeLabel: necramechs.some((n) => n.id === itemId) ? "Necramech" : typeLabel,
        };
      }
      const weapon = weaponsMap.get(itemId);
      if (weapon) {
        return {
          itemName: weapon.name,
          itemImage: getWeaponImage(weapon.name, { category: weapon.category }),
          typeLabel,
        };
      }
      return { itemName: null, itemImage: null, typeLabel };
    }
    case "railjack": {
      if (itemId === "railjack") {
        return { itemName: "Railjack", itemImage: null, typeLabel };
      }
      const reactor = reactors.find((r) => r.id === itemId);
      return {
        itemName: reactor?.name ?? "Railjack",
        itemImage: null,
        typeLabel,
      };
    }
    default:
      return { itemName: null, itemImage: null, typeLabel };
  }
}
