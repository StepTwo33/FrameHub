import { BookOpen, Sparkles, Gem } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MOD_BROWSER_CATEGORIES, type ModBrowserCategoryId } from "@/lib/mod-browser-categories";
import { ARCANE_SLOT_FILTERS } from "@/lib/arcane-browser-meta";

export type CodexSection = "mods" | "arcanes" | "shards";

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
  if (value === "arcanes" || value === "shards") return value;
  return "mods";
}
