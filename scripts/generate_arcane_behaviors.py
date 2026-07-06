#!/usr/bin/env python3
"""
Generate finalized per-arcane behavior entries from wiki-verified arcane-effects.ts.
Each arcane / effect line is its own record — no runtime blanket stat-key policy.

Output: src/data/arcane-behaviors.ts
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EFFECTS = ROOT / "src/data/arcane-effects.ts"
HANDLERS = ROOT / "src/lib/arcane-handlers.ts"
ARCANES = ROOT / "src/data/arcanes.ts"
CALC = ROOT / "src/lib/arcane-calculator.ts"
OUT = ROOT / "src/data/arcane-behaviors.ts"

effects_text = EFFECTS.read_text(encoding="utf-8")
handlers_text = HANDLERS.read_text(encoding="utf-8")
arcanes_text = ARCANES.read_text(encoding="utf-8")
calc_text = CALC.read_text(encoding="utf-8")

weapon_custom = set(re.findall(r'"([a-z0-9_]+)"', handlers_text.split("WEAPON_CUSTOM_ARCANE_IDS")[1].split("]")[0]))
wf_custom = set(re.findall(r'"([a-z0-9_]+)"', handlers_text.split("WARFRAME_CUSTOM_ARCANE_IDS")[1].split("]")[0]))
all_custom = weapon_custom | wf_custom

weapon_build_stats = set(
    re.findall(r'case "(\w+)":', calc_text.split("function applyWeaponStatToBuild")[1].split("function applyWarframeStatToBuild")[0])
)
wf_build_stats = set(
    re.findall(r'case "(\w+)":', calc_text.split("function applyWarframeStatToBuild")[1].split("function applyArcaneEffectsToWeapon")[0])
)

arcane_meta: dict[str, dict] = {}
for m in re.finditer(
    r'"id":\s*"([^"]+)"[\s\S]*?"name":\s*"([^"]+)"[\s\S]*?"subCategory":\s*"([^"]*)"[\s\S]*?"description":\s*"([^"]*)"',
    arcanes_text,
):
    arcane_meta[m.group(1)] = {"name": m.group(2), "subCategory": m.group(3), "description": m.group(4)}

WEAPON_SUBS = {"primary", "secondary", "melee", "kitgun", "exodia", "amp", "zaw", "archgun", "tektolyst", "pax"}


def is_weapon_arcane(arcane_id: str) -> bool:
    sub = arcane_meta.get(arcane_id, {}).get("subCategory", "")
    if sub in WEAPON_SUBS:
        return True
    if sub in ("warframe", "operator", "mechanic"):
        return False
    return any(
        arcane_id.startswith(p)
        for p in (
            "primary_", "secondary_", "melee_", "exodia_", "virtuos_", "pax_",
            "cascadia_", "tek_", "zid_an_", "akimbo_", "conjunction_",
        )
    )


TRIGGER_LABEL = {
    "passive": "always active while equipped",
    "stacks": "stacking — applies at sim stack count",
    "onKill": "on kill proc",
    "onHeadshot": "on headshot proc",
    "onDamaged": "when damaged proc",
    "onReload": "on reload proc",
    "onAbilityCast": "on ability cast proc",
    "onMeleeKill": "on melee kill proc",
    "onFinisher": "on finisher proc",
    "onStatus": "on status proc",
    "onPickup": "on pickup proc",
    "onVoidSling": "on void sling proc",
    "onMovement": "on movement proc",
    "onHit": "on hit proc",
    "onFreeze": "on freeze proc",
    "conditional": "conditional proc",
}


def classify_line(
    arcane_id: str,
    arcane_name: str,
    trigger: str,
    stat: str,
    flat: bool,
) -> tuple[str, str, str]:
    if arcane_id in all_custom:
        return (
            "arcane_panel",
            "custom",
            f"{arcane_name}: custom handler",
        )

    weapon = is_weapon_arcane(arcane_id)
    trig_note = TRIGGER_LABEL.get(trigger, trigger)

    if trigger == "passive":
        if weapon and stat in weapon_build_stats:
            mode = "flat" if flat else "multiplicative_percent"
            return (
                "weapon_dps",
                mode,
                f"{arcane_name}: {stat} ({trig_note})",
            )
        if not weapon and stat in wf_build_stats:
            mode = "flat" if flat else "multiplicative_percent"
            return (
                "warframe_totals",
                mode,
                f"{arcane_name}: {stat} ({trig_note})",
            )

    if trigger == "stacks":
        if weapon and stat in weapon_build_stats:
            mode = "flat" if flat else "multiplicative_percent"
            return (
                "weapon_dps",
                mode,
                f"{arcane_name}: {stat} ({trig_note})",
            )
        if not weapon and stat in wf_build_stats:
            mode = "flat" if flat else "multiplicative_percent"
            return (
                "warframe_totals",
                mode,
                f"{arcane_name}: {stat} ({trig_note})",
            )

    return (
        "arcane_panel",
        "multiplicative_percent",
        f"{arcane_name}: {stat} ({trig_note})",
    )


body = effects_text.split("export const ARCANE_EFFECTS")[1]
arcane_blocks = re.findall(
    r'"([a-z0-9_]+)":\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}',
    body,
)

entries: dict[str, dict] = {}
for arcane_id, block in arcane_blocks:
    if arcane_id == "Record":
        continue
    name_m = re.search(r'"name":\s*"([^"]+)"', block)
    trig_m = re.search(r'"trigger":\s*"([^"]+)"', block)
    arcane_name = name_m.group(1) if name_m else arcane_meta.get(arcane_id, {}).get("name", arcane_id)
    trigger = trig_m.group(1) if trig_m else "passive"

    effect_matches = re.finditer(
        r'\{\s*"stat":\s*"([^"]+)"[\s\S]*?"flat":\s*(true|false)',
        block,
    )
    effects = []
    for em in effect_matches:
        stat = em.group(1)
        flat = em.group(2) == "true"
        target, mode, source = classify_line(arcane_id, arcane_name, trigger, stat, flat)
        effects.append({"statKey": stat, "target": target, "mode": mode, "source": source})

    if not effects:
        continue

    entry: dict = {"arcaneId": arcane_id, "effects": effects}
    if arcane_id in all_custom:
        entry["customHandler"] = arcane_id
    entries[arcane_id] = entry

header = """/**
 * Per-arcane effect apply rules — one entry per arcane, one line per effect stat.
 * Regenerate: python scripts/generate_arcane_behaviors.py
 *
 * Edit individual lines here only — no blanket stat rules.
 */
import type { VerifiedArcaneBehavior } from "@/lib/item-behavior-types";

export const VERIFIED_ARCANE_BEHAVIORS: Record<string, VerifiedArcaneBehavior> = {
"""

parts = [header]
for arcane_id in sorted(entries.keys()):
    entry = entries[arcane_id]
    parts.append(f'  "{arcane_id}": {{')
    parts.append(f'    arcaneId: "{arcane_id}",')
    if entry.get("customHandler"):
        parts.append(f'    customHandler: "{entry["customHandler"]}",')
    parts.append("    effects: [")
    for line in entry["effects"]:
        parts.append(f"      {json.dumps(line, ensure_ascii=False)},")
    parts.append("    ],")
    parts.append("  },")
parts.append("};\n")

OUT.write_text("\n".join(parts), encoding="utf-8")

weapon_dps = sum(1 for e in entries.values() for l in e["effects"] if l["target"] == "weapon_dps")
wf = sum(1 for e in entries.values() for l in e["effects"] if l["target"] == "warframe_totals")
panel = sum(1 for e in entries.values() for l in e["effects"] if l["target"] == "arcane_panel")
custom = sum(1 for e in entries.values() for l in e["effects"] if l["mode"] == "custom")
print(f"Wrote {len(entries)} arcanes to {OUT}")
print(f"  weapon_dps lines: {weapon_dps}")
print(f"  warframe_totals lines: {wf}")
print(f"  arcane_panel lines: {panel}")
print(f"  custom handler lines: {custom}")
