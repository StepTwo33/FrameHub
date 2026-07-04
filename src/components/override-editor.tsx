"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ADD_ITEM_TEMPLATES,
  ARCANE_EFFECT_FIELD_KEYS,
  HIDDEN_OVERRIDE_FIELDS,
  TEXTAREA_FIELDS,
  formatOverrideFieldLabel,
  getNestedRecordFields,
  getStructuredOverrideFields,
  getSelectOptions,
  sortFieldsForCategory,
} from "@/lib/override-schemas";
import { buildNestedPatch, flattenRecordFields } from "@/lib/override-merge";
import {
  DataOverride,
  OverrideCategory,
  OVERRIDE_CATEGORIES,
  generateOverrideId,
  getOverrides,
  saveOverride,
  applyModOverrides,
  applyArcaneOverrides,
} from "@/lib/data-overrides";
import { applyArcaneEffectOverrides } from "@/lib/arcane-effect-overrides";
import {
  AbilitiesEditor,
  AbilityDraft,
  ArcaneEffectLineDraft,
  ArcaneEffectsEditor,
  RadialAttackDraft,
  RadialAttacksEditor,
  StatRowsEditor,
  draftToRadialAttack,
  toRadialAttackDrafts,
} from "@/components/override-field-editors";
import { getEffectiveWeapons } from "@/lib/use-data";
import { allWeapons } from "@/data/weapons";
import { allMods } from "@/data/mods";
import { allWarframes } from "@/data/warframes";
import { allCompanions } from "@/data/companions";
import { allArcanes } from "@/data/arcanes";
import { allArchonShards } from "@/data/archon-shards";
import { ARCANE_EFFECTS } from "@/data/arcane-effects";
import { archwings, necramechs } from "@/data/archwing";

const CATEGORY_LABELS: Record<OverrideCategory, string> = {
  weapon: "Weapons",
  mod: "Mods",
  warframe: "Warframes",
  companion: "Companions",
  arcane: "Arcanes (catalog + effect values)",
  arcane_effect: "Arcane effect values only",
  archon_shard: "Archon Shards",
  archwing: "Archwings",
  necramech: "Necramechs",
};

function getAllItems(category: OverrideCategory): { id: string; name: string }[] {
  switch (category) {
    case "weapon": return allWeapons.map((w) => ({ id: w.id, name: w.name }));
    case "mod": return allMods.map((m) => ({ id: m.id, name: m.name }));
    case "warframe": return allWarframes.map((w) => ({ id: w.id, name: w.name }));
    case "companion": return allCompanions.map((c) => ({ id: c.id, name: c.name }));
    case "arcane": return allArcanes.map((a) => ({ id: a.id, name: a.name }));
    case "arcane_effect":
      return Object.entries(ARCANE_EFFECTS).map(([id, def]) => ({ id, name: def.name }));
    case "archon_shard": return allArchonShards.map((s) => ({ id: s.id, name: s.name }));
    case "archwing": return archwings.map((a) => ({ id: a.id, name: a.name }));
    case "necramech": return necramechs.map((n) => ({ id: n.id, name: n.name }));
    default: return [];
  }
}

function getItemData(category: OverrideCategory, id: string): Record<string, unknown> | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: any[];
  switch (category) {
    case "weapon": {
      const weapon = getEffectiveWeapons().find((w) => w.id === id);
      return weapon ? (weapon as unknown as Record<string, unknown>) : null;
    }
    case "mod": {
      const mod = applyModOverrides(allMods).find((m) => m.id === id);
      return mod ? (mod as unknown as Record<string, unknown>) : null;
    }
    case "warframe": items = allWarframes; break;
    case "companion": items = allCompanions; break;
    case "arcane": {
      const arcane = applyArcaneOverrides(allArcanes).find((a) => a.id === id);
      if (!arcane) return null;
      const effectDef = applyArcaneEffectOverrides()[id];
      return {
        ...(arcane as unknown as Record<string, unknown>),
        ...(effectDef
          ? {
              trigger: effectDef.trigger,
              stackCap: effectDef.stackCap,
              effects: effectDef.effects,
            }
          : {}),
      };
    }
    case "arcane_effect": {
      const def = applyArcaneEffectOverrides()[id];
      return def ? (def as unknown as Record<string, unknown>) : null;
    }
    case "archon_shard": items = allArchonShards; break;
    case "archwing": items = archwings; break;
    case "necramech": items = necramechs; break;
    default: return null;
  }
  return items.find((i) => i.id === id) ?? null;
}

function findExistingOverrideId(
  targetType: OverrideCategory,
  targetId: string,
): string | undefined {
  return getOverrides().find(
    (o) => o.action === "modify" && o.targetType === targetType && o.targetId === targetId,
  )?.id;
}

function splitArcaneSaveFields(
  fields: Record<string, unknown>,
): { catalog: Record<string, unknown>; effectDef: Record<string, unknown> } {
  const catalog: Record<string, unknown> = {};
  const effectDef: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (ARCANE_EFFECT_FIELD_KEYS.has(key)) effectDef[key] = value;
    else catalog[key] = value;
  }
  if (catalog.maxRank !== undefined) {
    effectDef.maxRank = catalog.maxRank;
  }
  return { catalog, effectDef };
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number") return a === b;
  return String(a ?? "") === String(b ?? "");
}

function getOriginalAtPath(itemData: Record<string, unknown> | null | undefined, path: string): unknown {
  if (!itemData) return undefined;
  let original: unknown = itemData;
  for (const part of path.split(".")) {
    original = (original as Record<string, unknown> | null)?.[part];
  }
  return original;
}

function inferInputType(key: string, value: unknown): "number" | "boolean" | "text" | "textarea" | "select" {
  if (getSelectOptions(key)) return "select";
  if (TEXTAREA_FIELDS.has(key)) return "textarea";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  return "text";
}

function parseScalarValue(raw: string, original: unknown): unknown {
  if (raw === "") return undefined;
  if (typeof original === "number" || /^-?\d+(\.\d+)?$/.test(raw.trim())) {
    const num = Number(raw);
    if (!Number.isNaN(num)) return num;
  }
  if (typeof original === "boolean" || raw === "true" || raw === "false") {
    return raw === "true";
  }
  return raw;
}

function toEffectDrafts(raw: unknown): ArcaneEffectLineDraft[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((line) => {
    const o = line as Record<string, unknown>;
    return {
      stat: String(o.stat ?? ""),
      maxValue: Number(o.maxValue ?? 0),
      flat: Boolean(o.flat),
      stacking: Boolean(o.stacking),
      constantAtAllRanks: Boolean(o.constantAtAllRanks),
    };
  });
}

function toAbilityDrafts(raw: unknown): AbilityDraft[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((ab) => {
    const o = ab as Record<string, unknown>;
    return {
      name: String(o.name ?? ""),
      energyCost: Number(o.energyCost ?? 0),
      description: String(o.description ?? ""),
      damage: o.damage != null ? Number(o.damage) : undefined,
      range: o.range != null ? Number(o.range) : undefined,
      duration: o.duration != null ? Number(o.duration) : undefined,
      radius: o.radius != null ? Number(o.radius) : undefined,
    };
  });
}

function effectsChanged(original: unknown, draft: ArcaneEffectLineDraft[]): boolean {
  return JSON.stringify(toEffectDrafts(original)) !== JSON.stringify(draft);
}

function radialAttacksChanged(original: unknown, draft: RadialAttackDraft[]): boolean {
  const origDrafts = toRadialAttackDrafts(original);
  return JSON.stringify(origDrafts) !== JSON.stringify(draft);
}

function abilitiesChanged(original: unknown, draft: AbilityDraft[]): boolean {
  return JSON.stringify(toAbilityDrafts(original)) !== JSON.stringify(draft);
}

interface OverrideEditorProps {
  onSave: () => void;
  onCancel: () => void;
  prefill?: {
    existingOverrideId?: string;
    category?: OverrideCategory;
    itemId?: string;
    note?: string;
    action?: "modify" | "add" | "remove";
    fields?: Record<string, unknown>;
  };
}

export function OverrideEditor({ onSave, onCancel, prefill }: OverrideEditorProps) {
  const [category, setCategory] = useState<OverrideCategory>(prefill?.category ?? "mod");
  const [action, setAction] = useState<"modify" | "add" | "remove">(prefill?.action ?? "modify");
  const [selectedItemId, setSelectedItemId] = useState<string>(prefill?.itemId ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [note, setNote] = useState(prefill?.note ?? "");
  const [fieldOverrides, setFieldOverrides] = useState<Record<string, string>>({});
  const [newStatKey, setNewStatKey] = useState("");
  const [effectLines, setEffectLines] = useState<ArcaneEffectLineDraft[]>([]);
  const [radialAttacks, setRadialAttacks] = useState<RadialAttackDraft[]>([]);
  const [abilities, setAbilities] = useState<AbilityDraft[]>([]);
  const [structuredTouched, setStructuredTouched] = useState({
    effects: false,
    abilities: false,
    radialAttacks: false,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const nestedRecordFields = useMemo(() => getNestedRecordFields(category), [category]);
  const structuredFields = useMemo(() => new Set(getStructuredOverrideFields(category)), [category]);

  const items = useMemo(() => getAllItems(category), [category]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
  }, [items, searchQuery]);

  const itemData = useMemo(() => {
    if (action === "add") return ADD_ITEM_TEMPLATES[category] ?? null;
    if (!selectedItemId) return null;
    return getItemData(category, selectedItemId);
  }, [category, selectedItemId, action]);

  const scalarFields = useMemo(() => {
    if (!itemData) return [];
    const nested = new Set(nestedRecordFields);
    const keys = Object.entries(itemData)
      .filter(([key, value]) => {
        if (HIDDEN_OVERRIDE_FIELDS.has(key) || nested.has(key) || structuredFields.has(key)) return false;
        if (Array.isArray(value) || (typeof value === "object" && value !== null)) return false;
        return true;
      })
      .map(([key]) => key);
    return sortFieldsForCategory(category, keys).map((key) => ({
      key,
      currentValue: itemData[key],
      inputType: inferInputType(key, itemData[key]),
    }));
  }, [itemData, nestedRecordFields, structuredFields, category]);

  const nestedStatRows = useMemo(() => {
    if (!itemData) return [];
    const rows: { recordField: string; key: string; path: string; value: unknown }[] = [];
    for (const recordField of nestedRecordFields) {
      const record = itemData[recordField] as Record<string, unknown> | undefined;
      for (const row of flattenRecordFields(recordField, record)) {
        rows.push({ recordField, ...row });
      }
    }
    return rows;
  }, [itemData, nestedRecordFields]);

  useEffect(() => {
    if (!itemData) return;
    queueMicrotask(() => {
      setEffectLines(toEffectDrafts(itemData.effects));
      setAbilities(toAbilityDrafts(itemData.abilities));
      setRadialAttacks(toRadialAttackDrafts(itemData.radialAttacks));
      setStructuredTouched({ effects: false, abilities: false, radialAttacks: false });
    });
  }, [itemData, selectedItemId, category]);

  useEffect(() => {
    const prefillFields = prefill?.fields;
    if (!prefillFields || Object.keys(prefillFields).length === 0) return;
    queueMicrotask(() => {
      const flat: Record<string, string> = {};
      const walk = (obj: Record<string, unknown>, prefix = "") => {
        for (const [key, value] of Object.entries(obj)) {
          const path = prefix ? `${prefix}.${key}` : key;
          if (nestedRecordFields.includes(prefix ? prefix.split(".")[0] : key) && typeof value === "object" && value !== null && !Array.isArray(value)) {
            walk(value as Record<string, unknown>, path);
          } else if (key === "effects" && Array.isArray(value)) {
            setEffectLines(toEffectDrafts(value));
            setStructuredTouched((s) => ({ ...s, effects: true }));
          } else if (key === "abilities" && Array.isArray(value)) {
            setAbilities(toAbilityDrafts(value));
            setStructuredTouched((s) => ({ ...s, abilities: true }));
          } else if (key === "radialAttacks" && Array.isArray(value)) {
            setRadialAttacks(toRadialAttackDrafts(value));
            setStructuredTouched((s) => ({ ...s, radialAttacks: true }));
          } else if (typeof value !== "object" || value === null) {
            flat[path] = String(value);
          }
        }
      };
      walk(prefillFields);
      setFieldOverrides(flat);
    });
  }, [prefill?.fields, nestedRecordFields]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const resetEditorState = () => {
    setFieldOverrides({});
    setNewStatKey("");
    setStructuredTouched({ effects: false, abilities: false, radialAttacks: false });
  };

  const handleCategoryChange = (cat: OverrideCategory) => {
    setCategory(cat);
    setSelectedItemId("");
    setSearchQuery("");
    resetEditorState();
  };

  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    setShowDropdown(false);
    setSearchQuery("");
    if (!prefill?.existingOverrideId) resetEditorState();
  };

  const handleFieldChange = (path: string, value: string) => {
    setFieldOverrides((prev) => {
      const next = { ...prev };
      if (value === "") delete next[path];
      else next[path] = value;
      return next;
    });
  };

  const seedFieldOnFocus = (path: string, current: unknown) => {
    if (fieldOverrides[path] !== undefined) return;
    if (current == null || current === "") return;
    handleFieldChange(path, String(current));
  };

  const handleAddStatKey = (recordField: string) => {
    const key = newStatKey.trim();
    if (!key) return;
    handleFieldChange(`${recordField}.${key}`, fieldOverrides[`${recordField}.${key}`] ?? "0");
    setNewStatKey("");
  };

  const buildFields = (): Record<string, unknown> => {
    const flat: Record<string, unknown> = {};
    for (const [path, rawValue] of Object.entries(fieldOverrides)) {
      if (rawValue === "") continue;
      const original = getOriginalAtPath(itemData, path);
      const parsed = parseScalarValue(rawValue, original);
      if (valuesEqual(parsed, original)) continue;
      flat[path] = parsed;
    }
    const fields = buildNestedPatch(flat);

    if (structuredFields.has("effects") && (structuredTouched.effects || effectsChanged(itemData?.effects, effectLines))) {
      fields.effects = effectLines
        .filter((l) => l.stat.trim())
        .map(({ stat, maxValue, flat, stacking, constantAtAllRanks }) => ({
          stat,
          maxValue,
          ...(flat ? { flat: true } : {}),
          ...(stacking ? { stacking: true } : {}),
          ...(constantAtAllRanks ? { constantAtAllRanks: true } : {}),
        }));
    }
    if (structuredFields.has("abilities") && (structuredTouched.abilities || abilitiesChanged(itemData?.abilities, abilities))) {
      fields.abilities = abilities;
    }
    if (
      structuredFields.has("radialAttacks")
      && (structuredTouched.radialAttacks || radialAttacksChanged(itemData?.radialAttacks, radialAttacks))
    ) {
      fields.radialAttacks = radialAttacks
        .map(draftToRadialAttack)
        .filter((a): a is NonNullable<typeof a> => a != null);
    }
    return fields;
  };

  const handleSave = () => {
    const targetId = action === "add" ? selectedItemId.trim() : selectedItemId;
    if (!targetId?.trim()) {
      alert("Please select an item first.");
      return;
    }

    if (action === "remove") {
      saveOverride({
        id: prefill?.existingOverrideId ?? generateOverrideId(),
        targetType: category,
        targetId: targetId.trim(),
        action,
        fields: {},
        note: note.trim(),
        timestamp: Date.now(),
      });
      onSave();
      return;
    }

    const fields = buildFields();
    if (Object.keys(fields).length === 0) {
      alert("Change at least one field before saving.");
      return;
    }

    const timestamp = Date.now();
    const trimmedNote = note.trim();
    const trimmedId = targetId.trim();

    const persist = (
      targetType: OverrideCategory,
      patch: Record<string, unknown>,
      existingOverrideId?: string,
    ) => {
      saveOverride({
        id: existingOverrideId ?? generateOverrideId(),
        targetType,
        targetId: trimmedId,
        action: "modify",
        fields: patch,
        note: trimmedNote,
        timestamp,
      });
    };

    if (category === "arcane") {
      const { catalog, effectDef } = splitArcaneSaveFields(fields);
      if (Object.keys(catalog).length === 0 && Object.keys(effectDef).length === 0) {
        alert("Change at least one field before saving.");
        return;
      }
      if (Object.keys(catalog).length > 0) {
        persist("arcane", catalog, prefill?.category === "arcane" ? prefill.existingOverrideId : findExistingOverrideId("arcane", trimmedId));
      }
      if (Object.keys(effectDef).length > 0) {
        persist(
          "arcane_effect",
          effectDef,
          prefill?.category === "arcane_effect" ? prefill.existingOverrideId : findExistingOverrideId("arcane_effect", trimmedId),
        );
      }
    } else {
      persist(category, fields, prefill?.existingOverrideId);
    }

    onSave();
  };

  const selectedItemName = items.find((i) => i.id === selectedItemId)?.name ?? "";
  const scalarChangeCount = useMemo(() => {
    let count = 0;
    for (const [path, rawValue] of Object.entries(fieldOverrides)) {
      if (rawValue === "") continue;
      const original = getOriginalAtPath(itemData, path);
      const parsed = parseScalarValue(rawValue, original);
      if (!valuesEqual(parsed, original)) count++;
    }
    return count;
  }, [fieldOverrides, itemData]);
  const structuredChangeCount =
    (structuredFields.has("effects") && (structuredTouched.effects || effectsChanged(itemData?.effects, effectLines)) ? 1 : 0)
    + (structuredFields.has("abilities") && (structuredTouched.abilities || abilitiesChanged(itemData?.abilities, abilities)) ? 1 : 0)
    + (structuredFields.has("radialAttacks") && (structuredTouched.radialAttacks || radialAttacksChanged(itemData?.radialAttacks, radialAttacks)) ? 1 : 0);
  const changedCount = scalarChangeCount + structuredChangeCount;

  const isFieldChanged = (path: string, current: unknown) => {
    const raw = fieldOverrides[path];
    if (raw === undefined || raw === "") return false;
    return !valuesEqual(parseScalarValue(raw, current), current);
  };
  const canEditFields = Boolean(selectedItemId && action !== "remove") || action === "add";

  return (
    <div className="mb-6 rounded-xl border border-purple-500/30 bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-purple-400">
            {prefill?.existingOverrideId ? "Edit data fix" : action === "remove" ? "Hide item from site" : action === "add" ? "Add new item" : "Fix item data"}
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Pick an item, click a field to edit its current value, then save.
          </p>
        </div>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs text-muted-foreground">What do you want to do?</label>
        <div className="flex flex-wrap gap-1.5">
          {([
            { id: "modify" as const, label: "Fix existing data" },
            { id: "add" as const, label: "Add new item" },
            { id: "remove" as const, label: "Hide item" },
          ]).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setAction(id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                action === id ? "border-purple-600 bg-purple-600 text-white" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs text-muted-foreground">Item type</label>
        <div className="flex flex-wrap gap-1.5">
          {OVERRIDE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                category === cat ? "border-purple-600 bg-purple-600 text-white" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {action === "add" && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-muted-foreground">New item ID (internal name, no spaces)</label>
          <input
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            placeholder="e.g. augment_hildryn_pillage"
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-purple-500/50 focus:outline-none"
          />
        </div>
      )}

      {action !== "add" && (
        <div className="mb-4" ref={dropdownRef}>
          <label className="mb-1.5 block text-xs text-muted-foreground">Find item</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex h-9 w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-sm hover:border-purple-500/50"
            >
              <span className={selectedItemName ? "text-foreground" : "text-muted-foreground"}>
                {selectedItemName || "Search and select..."}
              </span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showDropdown && "rotate-180")} />
            </button>
            {showDropdown && (
              <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                <div className="border-b border-border p-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type to search..."
                      className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectItem(item.id)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50",
                        selectedItemId === item.id && "bg-purple-500/10 text-purple-400",
                      )}
                    >
                      <span className="truncate">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {canEditFields && (
        <div className="mb-4 space-y-5">
          {scalarFields.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-foreground">
                {category === "mod" || category === "arcane" ? "Base values" : "Basic info"}
              </p>
              {scalarFields.map(({ key, currentValue, inputType }) => {
                const overrideValue = fieldOverrides[key] ?? "";
                const selectOptions = getSelectOptions(key);
                return (
                  <label key={key} className="block text-[11px]">
                    <span className="text-muted-foreground">{formatOverrideFieldLabel(key)}</span>
                    {inputType === "select" && selectOptions ? (
                      <select
                        value={overrideValue}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="mt-0.5 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
                      >
                        <option value="">Leave as-is ({String(currentValue ?? "—")})</option>
                        {selectOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : inputType === "textarea" ? (
                      <textarea
                        value={overrideValue}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        onFocus={() => seedFieldOnFocus(key, currentValue)}
                        placeholder={String(currentValue ?? "Leave as-is")}
                        rows={3}
                        className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm resize-y"
                      />
                    ) : inputType === "boolean" ? (
                      <select
                        value={overrideValue}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="mt-0.5 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
                      >
                        <option value="">Leave as-is ({String(currentValue)})</option>
                        <option value="true">Yes / True</option>
                        <option value="false">No / False</option>
                      </select>
                    ) : (
                      <input
                        type={inputType === "number" ? "number" : "text"}
                        step={inputType === "number" ? "any" : undefined}
                        value={overrideValue}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        onFocus={() => seedFieldOnFocus(key, currentValue)}
                        placeholder={`Current: ${String(currentValue ?? "—")}`}
                        className="mt-0.5 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
                      />
                    )}
                  </label>
                );
              })}
            </div>
          )}

          {nestedRecordFields.map((recordField) => (
            <StatRowsEditor
              key={recordField}
              title={formatOverrideFieldLabel(recordField)}
              rows={nestedStatRows.filter((r) => r.recordField === recordField)}
              overrideValues={fieldOverrides}
              onChange={handleFieldChange}
              onFocusField={seedFieldOnFocus}
              isFieldChanged={isFieldChanged}
              onAddKey={() => handleAddStatKey(recordField)}
              newKeyValue={newStatKey}
              onNewKeyChange={setNewStatKey}
            />
          ))}

          {structuredFields.has("effects") && (
            <ArcaneEffectsEditor
              lines={effectLines}
              maxRank={Number(itemData?.maxRank ?? 5)}
              onChange={(lines) => {
                setEffectLines(lines);
                setStructuredTouched((s) => ({ ...s, effects: true }));
              }}
            />
          )}

          {structuredFields.has("abilities") && abilities.length > 0 && (
            <AbilitiesEditor
              abilities={abilities}
              onChange={(draft) => {
                setAbilities(draft);
                setStructuredTouched((s) => ({ ...s, abilities: true }));
              }}
            />
          )}

          {structuredFields.has("radialAttacks") && (
            <RadialAttacksEditor
              attacks={radialAttacks}
              onChange={(draft) => {
                setRadialAttacks(draft);
                setStructuredTouched((s) => ({ ...s, radialAttacks: true }));
              }}
            />
          )}
        </div>
      )}

      {selectedItemId && action === "remove" && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">
            <strong>{selectedItemName || selectedItemId}</strong> will be hidden on the site until this fix is removed.
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1.5 block text-xs text-muted-foreground">Note (why you&apos;re changing this)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Wiki says drain should be -2 at rank 0"
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-purple-500/50 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={action !== "add" && !selectedItemId}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {action === "remove" ? "Save hide" : prefill?.existingOverrideId ? "Update fix" : `Save fix${changedCount > 0 ? ` (${changedCount} change${changedCount === 1 ? "" : "s"})` : ""}`}
      </button>
    </div>
  );
}
