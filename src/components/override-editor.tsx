"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DataOverride,
  OverrideCategory,
  OVERRIDE_CATEGORIES,
  generateOverrideId,
  saveOverride,
} from "@/lib/data-overrides";
import { allWeapons } from "@/data/weapons";
import { allMods } from "@/data/mods";
import { allWarframes } from "@/data/warframes";
import { allCompanions } from "@/data/companions";
import { allArcanes } from "@/data/arcanes";
import { allArchonShards } from "@/data/archon-shards";
import { archwings, necramechs } from "@/data/archwing";

// Category display labels
const CATEGORY_LABELS: Record<OverrideCategory, string> = {
  weapon: "Weapons",
  mod: "Mods",
  warframe: "Warframes",
  companion: "Companions",
  arcane: "Arcanes",
  archon_shard: "Archon Shards",
  archwing: "Archwings",
  necramech: "Necramechs",
};

// Fields to skip in the editor (internal/computed/complex)
const SKIP_FIELDS = new Set(["id", "abilities", "incarnonEvolutions"]);

// Fields that should be shown as JSON sub-editor
const JSON_FIELDS = new Set(["stats", "statBonuses", "miscStats"]);

function getAllItems(category: OverrideCategory): { id: string; name: string }[] {
  switch (category) {
    case "weapon": return allWeapons.map((w) => ({ id: w.id, name: w.name }));
    case "mod": return allMods.map((m) => ({ id: m.id, name: m.name }));
    case "warframe": return allWarframes.map((w) => ({ id: w.id, name: w.name }));
    case "companion": return allCompanions.map((c) => ({ id: c.id, name: c.name }));
    case "arcane": return allArcanes.map((a) => ({ id: a.id, name: a.name }));
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
    case "weapon": items = allWeapons; break;
    case "mod": items = allMods; break;
    case "warframe": items = allWarframes; break;
    case "companion": items = allCompanions; break;
    case "arcane": items = allArcanes; break;
    case "archon_shard": items = allArchonShards; break;
    case "archwing": items = archwings; break;
    case "necramech": items = necramechs; break;
    default: return null;
  }
  return items.find((i) => i.id === id) ?? null;
}

function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ");
}

function inferType(value: unknown): "string" | "number" | "boolean" | "json" {
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "object" && value !== null) return "json";
  return "string";
}

interface OverrideEditorProps {
  onSave: () => void;
  onCancel: () => void;
  prefill?: {
    category?: OverrideCategory;
    itemId?: string;
    note?: string;
    action?: "modify" | "add" | "remove";
    fields?: Record<string, unknown>;
  };
}

export function OverrideEditor({ onSave, onCancel, prefill }: OverrideEditorProps) {
  const [category, setCategory] = useState<OverrideCategory>(prefill?.category ?? "weapon");
  const [action, setAction] = useState<"modify" | "add" | "remove">(prefill?.action ?? "modify");
  const [selectedItemId, setSelectedItemId] = useState<string>(prefill?.itemId ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [note, setNote] = useState(prefill?.note ?? "");
  // Field overrides: key -> new value as string
  const [fieldOverrides, setFieldOverrides] = useState<Record<string, string>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get items for current category
  const items = useMemo(() => getAllItems(category), [category]);

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
  }, [items, searchQuery]);

  // Get selected item data
  const itemData = useMemo(() => {
    if (!selectedItemId) return null;
    return getItemData(category, selectedItemId);
  }, [category, selectedItemId]);

  // Get editable fields from item data
  const editableFields = useMemo(() => {
    if (!itemData) return [];
    return Object.entries(itemData)
      .filter(([key]) => !SKIP_FIELDS.has(key))
      .map(([key, value]) => ({
        key,
        currentValue: value,
        type: JSON_FIELDS.has(key) ? "json" as const : inferType(value),
      }));
  }, [itemData]);

  // Pre-fill field overrides from prefill prop
  useEffect(() => {
    if (prefill?.fields && Object.keys(prefill.fields).length > 0) {
      const overrides: Record<string, string> = {};
      for (const [key, value] of Object.entries(prefill.fields)) {
        if (typeof value === "object") {
          overrides[key] = JSON.stringify(value, null, 2);
        } else {
          overrides[key] = String(value);
        }
      }
      setFieldOverrides(overrides);
    }
  }, [prefill?.fields]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset selection when category changes
  const handleCategoryChange = (cat: OverrideCategory) => {
    setCategory(cat);
    setSelectedItemId("");
    setSearchQuery("");
    setFieldOverrides({});
  };

  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    setShowDropdown(false);
    setSearchQuery("");
    setFieldOverrides({});
  };

  const handleFieldChange = (key: string, value: string) => {
    setFieldOverrides((prev) => {
      const next = { ...prev };
      if (value === "") {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!selectedItemId.trim()) return;

    // Build fields from overrides
    const fields: Record<string, unknown> = {};
    for (const [key, rawValue] of Object.entries(fieldOverrides)) {
      if (rawValue === "") continue;
      // Get the original type to cast properly
      const original = itemData?.[key];
      const originalType = inferType(original);
      if (originalType === "number" || JSON_FIELDS.has(key) ? false : typeof original === "number") {
        const num = Number(rawValue);
        if (!isNaN(num)) { fields[key] = num; continue; }
      }
      if (originalType === "boolean") {
        fields[key] = rawValue === "true";
        continue;
      }
      if (originalType === "json" || JSON_FIELDS.has(key)) {
        try { fields[key] = JSON.parse(rawValue); continue; } catch { /* treat as string */ }
      }
      fields[key] = rawValue;
    }

    if (action !== "remove" && Object.keys(fields).length === 0) {
      alert("No fields changed. Modify at least one value.");
      return;
    }

    const ovr: DataOverride = {
      id: generateOverrideId(),
      targetType: category,
      targetId: selectedItemId,
      action,
      fields,
      note: note.trim(),
      timestamp: Date.now(),
    };
    saveOverride(ovr);
    onSave();
  };

  const selectedItemName = items.find((i) => i.id === selectedItemId)?.name ?? "";
  const changedCount = Object.keys(fieldOverrides).filter((k) => fieldOverrides[k] !== "").length;

  return (
    <div className="border border-purple-500/30 rounded-xl p-5 bg-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-purple-400">
          {action === "remove" ? "REMOVE ITEM" : action === "add" ? "ADD NEW ITEM" : "MODIFY ITEM DATA"}
        </h2>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Action selector */}
      <div className="mb-4">
        <label className="text-xs text-muted-foreground mb-1.5 block">Action</label>
        <div className="flex gap-1.5">
          {(["modify", "add", "remove"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAction(a)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg border capitalize transition-colors",
                action === a ? "bg-purple-600 border-purple-600 text-white" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Category selector */}
      <div className="mb-4">
        <label className="text-xs text-muted-foreground mb-1.5 block">Category</label>
        <div className="flex gap-1.5 flex-wrap">
          {OVERRIDE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={cn(
                "px-2.5 py-1.5 text-xs rounded-lg border transition-colors",
                category === cat ? "bg-purple-600 border-purple-600 text-white" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Item picker */}
      <div className="mb-4" ref={dropdownRef}>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Select Item ({items.length} available)
        </label>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full h-9 px-3 flex items-center justify-between bg-background border border-border rounded-lg text-sm hover:border-purple-500/50 transition-colors"
          >
            <span className={selectedItemName ? "text-foreground" : "text-muted-foreground"}>
              {selectedItemName || "Choose an item..."}
            </span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showDropdown && "rotate-180")} />
          </button>

          {showDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full h-8 pl-8 pr-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredItems.length === 0 && (
                  <div className="p-3 text-xs text-muted-foreground text-center">No items found</div>
                )}
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between",
                      selectedItemId === item.id && "bg-purple-500/10 text-purple-400"
                    )}
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono ml-2 flex-shrink-0">{item.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Field editor */}
      {selectedItemId && action !== "remove" && editableFields.length > 0 && (
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1.5 block">
            Fields — edit values to override ({changedCount} changed)
          </label>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_1fr] text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 px-3 py-1.5">
              <span>Field</span>
              <span>Current Value</span>
              <span>New Value</span>
            </div>
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {editableFields.map(({ key, currentValue, type }) => {
                const currentStr = type === "json"
                  ? JSON.stringify(currentValue, null, 2)
                  : String(currentValue ?? "");
                const overrideValue = fieldOverrides[key] ?? "";
                const isChanged = overrideValue !== "";
                return (
                  <div
                    key={key}
                    className={cn(
                      "grid grid-cols-[1fr_1fr_1fr] items-start px-3 py-2 gap-2",
                      isChanged && "bg-purple-500/5"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{formatFieldLabel(key)}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{key}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono break-all">
                      {type === "json" ? (
                        <pre className="text-[10px] whitespace-pre-wrap max-h-20 overflow-y-auto">{currentStr}</pre>
                      ) : type === "boolean" ? (
                        <span className={cn(currentValue ? "text-green-400" : "text-red-400")}>
                          {String(currentValue)}
                        </span>
                      ) : (
                        <span>{currentStr}</span>
                      )}
                    </div>
                    <div>
                      {type === "boolean" ? (
                        <select
                          value={overrideValue}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          className={cn(
                            "w-full h-7 px-2 bg-background border rounded text-xs",
                            isChanged ? "border-purple-500 text-purple-300" : "border-border text-muted-foreground"
                          )}
                        >
                          <option value="">No change</option>
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : type === "json" ? (
                        <textarea
                          value={overrideValue}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          placeholder="No change"
                          className={cn(
                            "w-full h-20 px-2 py-1 bg-background border rounded text-[10px] font-mono resize-none",
                            isChanged ? "border-purple-500 text-purple-300" : "border-border"
                          )}
                        />
                      ) : (
                        <input
                          type={type === "number" ? "number" : "text"}
                          step={type === "number" ? "any" : undefined}
                          value={overrideValue}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          placeholder="No change"
                          className={cn(
                            "w-full h-7 px-2 bg-background border rounded text-xs",
                            isChanged ? "border-purple-500 text-purple-300" : "border-border"
                          )}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Remove confirmation */}
      {selectedItemId && action === "remove" && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">
            This will remove <strong>{selectedItemName}</strong> from the {category} data.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            The item will be filtered out wherever it appears. This override can be deleted later to restore it.
          </p>
        </div>
      )}

      {/* Note */}
      <div className="mb-4">
        <label className="text-xs text-muted-foreground mb-1.5 block">Note (optional)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why this override exists..."
          className="w-full h-8 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!selectedItemId}
        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Save className="h-4 w-4" />
        {action === "remove" ? "Save Remove Override" : `Save Override (${changedCount} field${changedCount === 1 ? "" : "s"})`}
      </button>
    </div>
  );
}
