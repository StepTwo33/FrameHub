import { BookOpen, Sparkles, Gem, Crosshair, User, PawPrint, Plane, Bot } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MOD_BROWSER_CATEGORIES, type ModBrowserCategoryId } from "@/lib/mods/mod-browser-categories";
import { ARCANE_SLOT_FILTERS } from "@/lib/codex/arcane-browser-meta";

export type CodexSection =
  | "mods"
  | "arcanes"
  | "shards"
  | "weapons"
  | "warframes"
  | "companions"
  | "archwings"
  | "necramechs";

export interface CodexSectionDef {
  id: CodexSection;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const CODEX_SECTIONS: CodexSectionDef[] = [
  {
    id: "mods",
    label: "Mods",
    icon: BookOpen,
    description: "Warframe, weapon, companion, and aura mods",
  },
  {
    id: "arcanes",
    label: "Arcanes",
    icon: Sparkles,
    description: "Arcane effect definitions and calculator wiring",
  },
  {
    id: "shards",
    label: "Archon Shards",
    icon: Gem,
    description: "Shard colors, tiers, and stat bonuses",
  },
  {
    id: "weapons",
    label: "Weapons",
    icon: Crosshair,
    description: "Primary, secondary, melee, and special weapons",
  },
  {
    id: "warframes",
    label: "Warframes",
    icon: User,
    description: "Warframe stats, passives, and abilities",
  },
  {
    id: "companions",
    label: "Companions",
    icon: PawPrint,
    description: "Sentinels, Kubrows, Kavats, MOAs, and more",
  },
  {
    id: "archwings",
    label: "Archwings",
    icon: Plane,
    description: "Archwing frames and base stats",
  },
  {
    id: "necramechs",
    label: "Necramechs",
    icon: Bot,
    description: "Necramech frames and base stats",
  },
];

/** Mod sub-categories for codex sidebar (game-like grouping). */
export const CODEX_MOD_CATEGORIES: { id: ModBrowserCategoryId; label: string }[] = [
  { id: "all", label: "All Mods" },
  ...MOD_BROWSER_CATEGORIES.filter((c) => c.id !== "all").map((c) => ({
    id: c.id as ModBrowserCategoryId,
    label: c.label,
  })),
];

/** Arcane slot filters without "all" for sidebar. */
export const CODEX_ARCANE_SLOTS = ARCANE_SLOT_FILTERS.filter((f) => f.id !== "all");

export function parseCodexSection(value: string | null): CodexSection {
  const valid: CodexSection[] = [
    "mods",
    "arcanes",
    "shards",
    "weapons",
    "warframes",
    "companions",
    "archwings",
    "necramechs",
  ];
  if (value && valid.includes(value as CodexSection)) return value as CodexSection;
  return "mods";
}

/** Sections that use the `category` URL param for sub-filtering. */
export const CODEX_CATEGORY_SECTIONS = new Set<CodexSection>(["mods", "weapons", "companions"]);
