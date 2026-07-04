import { OverrideCategory } from "@/lib/data-overrides";

/** Record fields edited as individual stat rows (mods, arcanes, shards). */
export const NESTED_RECORD_FIELDS: Partial<Record<OverrideCategory, string[]>> = {
  mod: ["stats"],
  arcane: ["stats"],
  archon_shard: ["statBonuses"],
};

/** Fields edited with dedicated form components (not raw JSON). */
export const STRUCTURED_OVERRIDE_FIELDS: Partial<Record<OverrideCategory, string[]>> = {
  warframe: ["abilities"],
  arcane_effect: ["effects"],
};

/** Hidden from the editor — too complex for moderators; use a report instead. */
export const HIDDEN_OVERRIDE_FIELDS = new Set([
  "id",
  "incarnonEvolutions",
  "radialAttacks",
]);

/** Long text fields use a textarea instead of a single-line input. */
export const TEXTAREA_FIELDS = new Set([
  "description",
  "passive",
  "note",
]);

export const SELECT_FIELD_OPTIONS: Record<string, { value: string; label: string }[]> = {
  polarity: [
    { value: "madurai", label: "Madurai (V)" },
    { value: "vazarin", label: "Vazarin (D)" },
    { value: "naramon", label: "Naramon (Dash)" },
    { value: "zenurik", label: "Zenurik (—)" },
    { value: "penjaga", label: "Penjaga (Y)" },
    { value: "unairu", label: "Unairu" },
    { value: "umbra", label: "Umbra" },
    { value: "exilus", label: "Exilus" },
    { value: "universal", label: "Universal" },
    { value: "any", label: "Any" },
    { value: "none", label: "None" },
  ],
  rarity: [
    { value: "common", label: "Common" },
    { value: "uncommon", label: "Uncommon" },
    { value: "rare", label: "Rare" },
    { value: "legendary", label: "Legendary" },
    { value: "peculiar", label: "Peculiar" },
  ],
  trigger: [
    { value: "passive", label: "Passive" },
    { value: "stacks", label: "Stacks" },
    { value: "onKill", label: "On kill" },
    { value: "onHeadshot", label: "On headshot" },
    { value: "onDamaged", label: "When damaged" },
    { value: "onReload", label: "On reload" },
    { value: "onAbilityCast", label: "On ability cast" },
    { value: "onMeleeKill", label: "On melee kill" },
    { value: "onFinisher", label: "On finisher" },
    { value: "onStatus", label: "On status proc" },
    { value: "onPickup", label: "On pickup" },
    { value: "onVoidSling", label: "On Void Sling" },
    { value: "onMovement", label: "On movement" },
    { value: "onHit", label: "On hit" },
    { value: "onFreeze", label: "On freeze" },
    { value: "conditional", label: "Conditional" },
  ],
  color: [
    { value: "crimson", label: "Crimson" },
    { value: "azure", label: "Azure" },
    { value: "amber", label: "Amber" },
    { value: "violet", label: "Violet" },
    { value: "topaz", label: "Topaz" },
    { value: "emerald", label: "Emerald" },
  ],
};

/** Friendly labels moderators understand. */
export const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  drain: "Drain (base at rank 0)",
  maxRank: "Max rank",
  polarity: "Polarity",
  rarity: "Rarity",
  category: "Category",
  subCategory: "Sub-category",
  description: "Description",
  warframeId: "Warframe (augments)",
  trigger: "Trigger type",
  stackCap: "Stack cap",
  health: "Health",
  shield: "Shield",
  armor: "Armor",
  energy: "Energy",
  sprintSpeed: "Sprint speed",
  passive: "Passive description",
  damage: "Damage",
  fireRate: "Fire rate",
  criticalChance: "Crit chance",
  criticalMultiplier: "Crit multiplier",
  statusChance: "Status chance",
  magazine: "Magazine size",
  reloadTime: "Reload time",
  multishot: "Multishot",
  modSlots: "Mod slots",
  tier: "Tier",
  color: "Shard color",
  isCoalescent: "Coalescent variant",
  stats: "Mod stats",
  statBonuses: "Shard stat options",
  effects: "Effect lines",
  abilities: "Abilities",
};

export const ADD_ITEM_TEMPLATES: Partial<Record<OverrideCategory, Record<string, unknown>>> = {
  mod: {
    id: "",
    name: "New Mod",
    polarity: "madurai",
    drain: 6,
    maxRank: 5,
    category: "warframe",
    stats: {},
    description: "",
    rarity: "common",
  },
  weapon: {
    id: "",
    name: "New Weapon",
    category: "rifle",
    damage: 100,
    impact: 0,
    puncture: 0,
    slash: 0,
    fireRate: 1,
    criticalChance: 0.05,
    criticalMultiplier: 1.5,
    statusChance: 0.05,
    magazine: 30,
    reloadTime: 2,
    multishot: 1,
    triggerType: "auto",
    modSlots: 8,
    hasPrimaryArcaneSlot: true,
    hasSecondaryArcaneSlot: false,
    isIncarnon: false,
    hasRivenSlot: true,
  },
  warframe: {
    id: "",
    name: "New Warframe",
    health: 100,
    shield: 100,
    armor: 100,
    energy: 100,
    sprintSpeed: 1,
    description: "",
    passive: "",
    abilities: [],
  },
  arcane: {
    id: "",
    name: "New Arcane",
    polarity: "zenurik",
    drain: 0,
    maxRank: 5,
    category: "arcane",
    stats: {},
    description: "",
    rarity: "common",
  },
  arcane_effect: {
    name: "Arcane name",
    trigger: "passive",
    maxRank: 5,
    effects: [],
  },
  archon_shard: {
    id: "",
    name: "New Shard",
    color: "crimson",
    tier: 1,
    statBonuses: {},
    description: "",
    isCoalescent: false,
  },
  companion: {
    id: "",
    name: "New Companion",
    category: "sentinel",
    health: 100,
    shield: 100,
    armor: 100,
    description: "",
  },
  archwing: {
    id: "",
    name: "New Archwing",
    health: 400,
    shield: 400,
    armor: 100,
    energy: 100,
    sprintSpeed: 1,
    description: "",
  },
  necramech: {
    id: "",
    name: "New Necramech",
    health: 1000,
    shield: 500,
    armor: 500,
    energy: 100,
    description: "",
  },
};

export function getNestedRecordFields(category: OverrideCategory): string[] {
  return NESTED_RECORD_FIELDS[category] ?? [];
}

export function getStructuredOverrideFields(category: OverrideCategory): string[] {
  return STRUCTURED_OVERRIDE_FIELDS[category] ?? [];
}

export function formatOverrideFieldLabel(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ");
}

export function getSelectOptions(fieldKey: string): { value: string; label: string }[] | null {
  return SELECT_FIELD_OPTIONS[fieldKey] ?? null;
}

/** Preferred field order per category (most-edited first). */
export const FIELD_ORDER: Partial<Record<OverrideCategory, string[]>> = {
  mod: ["name", "drain", "maxRank", "polarity", "rarity", "category", "description", "warframeId"],
  arcane: ["name", "drain", "maxRank", "polarity", "rarity", "description"],
  arcane_effect: ["name", "trigger", "maxRank", "stackCap"],
  archon_shard: ["name", "color", "tier", "description", "isCoalescent"],
  warframe: ["name", "health", "shield", "armor", "energy", "sprintSpeed", "passive", "description"],
  weapon: ["name", "damage", "fireRate", "criticalChance", "criticalMultiplier", "statusChance", "magazine", "reloadTime", "multishot"],
};

export function sortFieldsForCategory(category: OverrideCategory, keys: string[]): string[] {
  const order = FIELD_ORDER[category] ?? [];
  const rank = new Map(order.map((k, i) => [k, i]));
  return [...keys].sort((a, b) => (rank.get(a) ?? 999) - (rank.get(b) ?? 999) || a.localeCompare(b));
}

/** Human-readable summary of saved override fields (no JSON). */
export function formatOverrideFieldsSummary(fields: Record<string, unknown>): string[] {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(fields)) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      for (const [subKey, subVal] of Object.entries(value as Record<string, unknown>)) {
        lines.push(`${formatOverrideFieldLabel(key)} → ${formatOverrideFieldLabel(subKey)}: ${subVal}`);
      }
    } else if (Array.isArray(value)) {
      lines.push(`${formatOverrideFieldLabel(key)}: ${value.length} entries updated`);
    } else {
      lines.push(`${formatOverrideFieldLabel(key)}: ${String(value)}`);
    }
  }
  return lines;
}
