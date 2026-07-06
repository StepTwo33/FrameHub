#!/usr/bin/env python3
"""
Generate per-mod verified behavior batch for one category.
Each mod gets its own entry with stat lines sourced from that mod's description.

Usage: python scripts/generate_mod_behavior_batch.py general
Output: src/data/mod-behaviors/batches/{category}.ts
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODS = ROOT / "src/data/mods.ts"
OUT_DIR = ROOT / "src/data/mod-behaviors/batches"

WEAPON_CATS = {
    "primary", "secondary", "melee", "rifle", "pistol", "shotgun",
    "archgun", "archmelee", "companion_weapon", "tektolyst", "kdrive",
}
WARFRAME_CATS = {"warframe", "necramech", "archwing"}
COMPANION_CATS = {"companion"}

WEAPON_DPS_STATS = {
    "damage", "criticalChance", "criticalMultiplier", "fireRate", "attackSpeed",
    "multishot", "statusChance", "magazine", "reloadSpeed", "comboDuration",
    "heavyAttackEfficiency", "impact", "puncture", "slash", "meleeDamage",
    "heat", "cold", "toxin", "electricity", "blast", "radiation", "gas",
    "magnetic", "viral", "corrosive",
}
WF_TOTALS_STATS = {
    "health", "shield", "armor", "energy", "energyMax", "abilityStrength",
    "abilityDuration", "abilityEfficiency", "abilityRange", "sprintSpeed",
    "flow", "flowEnergyMax", "parkourVelocity",
}
COMPANION_STATS = {
    "meleeDamage", "criticalDamage", "critDamage", "attackSpeed",
    "criticalChance", "health", "shield", "armor",
}

WIKI_META = Path(__file__).resolve().parent / "_mod_wiki_meta.json"

WIKI_TYPE_WEAPON = {
    "rifle", "shotgun", "pistol", "sniper", "bow", "launcher", "primary",
    "secondary", "melee", "arch-gun", "archgun", "arch-melee", "archmelee",
    "kitgun", "zaw", "companion weapon", "beast", "robotic", "sentinel",
    "modular", "throwing", "exalted", "claws",
}

CONDITIONAL_MODS = {
    "blood_rush": ("criticalChancePerCombo", "conditional_combo_crit"),
    "condition_overload": ("damagePerStatus", "conditional_damage_per_status"),
    "weeping_wounds_r5": ("statusChance", "conditional_combo_status"),
    "berserker_fury": ("attackSpeed", "conditional_attack_speed_on_kill"),
}


def load_wiki_meta() -> dict[str, dict]:
    if WIKI_META.exists():
        return json.loads(WIKI_META.read_text(encoding="utf-8"))
    return {}


def infer_weapon_category(category: str, wiki_type: str, stats: dict) -> bool:
    if category in WEAPON_CATS:
        return True
    wt = (wiki_type or "").lower()
    if wt in WIKI_TYPE_WEAPON:
        return True
    if any(k in WEAPON_DPS_STATS for k in stats):
        return category in {"general", "set"} and "warframe" not in wt
    return False


def infer_warframe_category(category: str, wiki_type: str, stats: dict) -> bool:
    if category in WARFRAME_CATS:
        return True
    wt = (wiki_type or "").lower()
    if wt in {"warframe", "aura"}:
        return True
    return any(k in WF_TOTALS_STATS for k in stats)


def extract_mod_objects(text: str) -> list[str]:
    """Extract top-level mod object strings from allMods array via brace matching."""
    start = text.find("export const allMods")
    if start < 0:
        return []
    chunk = text[start:]
    array_m = re.search(r"=\s*\[", chunk)
    if not array_m:
        return []
    i = array_m.end()
    objects: list[str] = []
    n = len(chunk)
    while i < n:
        while i < n and chunk[i] not in "{]":
            i += 1
        if i >= n or chunk[i] == "]":
            break
        if chunk[i] != "{":
            i += 1
            continue
        depth = 0
        obj_start = i
        in_str = False
        esc = False
        while i < n:
            c = chunk[i]
            if in_str:
                if esc:
                    esc = False
                elif c == "\\":
                    esc = True
                elif c == '"':
                    in_str = False
            elif c == '"':
                in_str = True
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    objects.append(chunk[obj_start : i + 1])
                    i += 1
                    break
            i += 1
    return objects


def parse_mods(category: str) -> list[dict]:
    text = MODS.read_text(encoding="utf-8")
    mods = []
    for obj in extract_mod_objects(text):
        if f'"category": "{category}"' not in obj:
            continue
        id_m = re.search(r'"id":\s*"([^"]+)"', obj)
        name_m = re.search(r'"name":\s*"([^"]+)"', obj)
        desc_m = re.search(r'"description":\s*"([^"]*)"', obj)
        if not id_m:
            continue
        stats_m = re.search(r'"stats":\s*\{([^}]*)\}', obj)
        stats: dict[str, float] = {}
        if stats_m:
            for sk, sv in re.findall(r'"(\w+)":\s*(-?\d+(?:\.\d+)?)', stats_m.group(1)):
                stats[sk] = float(sv)
        desc = desc_m.group(1) if desc_m else ""
        mods.append({
            "id": id_m.group(1),
            "name": name_m.group(1) if name_m else id_m.group(1),
            "description": desc,
            "stats": stats,
        })
    return sorted(mods, key=lambda m: m["id"])


def classify_stat(
    mod_id: str,
    mod_name: str,
    desc: str,
    category: str,
    stat: str,
    wiki_meta: dict | None = None,
) -> tuple[str, str, str]:
    short_desc = (desc[:80] + "…") if len(desc) > 80 else desc
    source = f"{mod_name}: {stat}" + (f" — {short_desc}" if short_desc else "")
    meta = (wiki_meta or {}).get(mod_id, {})
    wiki_type = meta.get("wikiType", "")
    is_augment = meta.get("isAugment", False) or category == "augment"

    if mod_id in CONDITIONAL_MODS:
        spec = CONDITIONAL_MODS[mod_id]
        if spec and stat == spec[0]:
            return "weapon_dps", spec[1], source
    if mod_id.startswith("galvanized_"):
        if stat == "multishot":
            return "weapon_dps", "multiplicative_percent", source
        if stat == "multishotOnKill":
            return "weapon_dps", "conditional_multishot_on_kill", source
        if stat == "statusChance":
            return "weapon_dps", "conditional_damage_per_status_on_kill", source
        if stat == "damagePerStatus":
            return "weapon_dps", "conditional_damage_per_status_on_kill", source

    if is_augment or category in {"stance", "operator", "set", "evolution"}:
        return "mod_panel", "multiplicative_percent", source

    weapon = infer_weapon_category(category, wiki_type, {stat: 1})
    warframe = infer_warframe_category(category, wiki_type, {stat: 1})

    if weapon and stat in WEAPON_DPS_STATS:
        mode = (
            "elemental_from_base_damage"
            if stat in {
                "heat", "cold", "toxin", "electricity", "blast", "radiation",
                "gas", "magnetic", "viral", "corrosive",
            }
            else "multiplicative_percent"
        )
        return "weapon_dps", mode, source
    if warframe and stat in WF_TOTALS_STATS:
        return "warframe_totals", "multiplicative_percent", source
    if category in COMPANION_CATS and stat in COMPANION_STATS:
        return "companion_totals", "multiplicative_percent", source
    if stat in {"accuracy", "recoil", "zoom", "range", "punchThrough", "flightSpeed", "holsterRate"}:
        return "mod_panel", "multiplicative_percent", source + " (arsenal display only)"

    return "mod_panel", "multiplicative_percent", source


def ts_id(mod_id: str) -> str:
    if re.match(r"^[A-Za-z_]\w*$", mod_id):
        return mod_id
    return json.dumps(mod_id)


def generate_batch(category: str) -> None:
    mods = parse_mods(category)
    wiki_meta = load_wiki_meta()
    if not mods:
        print(f"No mods with stats for category {category}")
        return

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{category.replace('-', '_')}.ts"
    const = f"MOD_BEHAVIORS_{category.upper().replace('-', '_')}"

    lines = [
        "/**",
        f" * Per-mod verified behaviors — category: {category} ({len(mods)} mods).",
        f" * Generated: python scripts/generate_mod_behavior_batch.py {category}",
        " * Each mod has its own entry; edit lines after individual wiki review.",
        " */",
        'import type { VerifiedModBehavior, VerifiedItemStatLine } from "@/lib/item-behavior-types";',
        "",
        "function line(statKey: string, target: VerifiedItemStatLine['target'], mode: VerifiedItemStatLine['mode'], source: string): VerifiedItemStatLine {",
        "  return { statKey, target, mode, source };",
        "}",
        "",
        "function mod(modId: string, stats: VerifiedItemStatLine[], descriptionOnly?: string): VerifiedModBehavior {",
        "  return descriptionOnly ? { modId, stats, descriptionOnly } : { modId, stats };",
        "}",
        "",
        f"export const {const}: Record<string, VerifiedModBehavior> = {{",
    ]

    for m in mods:
        key = ts_id(m["id"])
        if m["stats"]:
            lines.append(f"  {key}: mod({json.dumps(m['id'])}, [")
            for stat in sorted(m["stats"].keys()):
                target, mode, source = classify_stat(
                    m["id"], m["name"], m["description"], category, stat, wiki_meta,
                )
                lines.append(
                    f"    line({json.dumps(stat)}, {json.dumps(target)}, {json.dumps(mode)}, {json.dumps(source)}),"
                )
            lines.append("  ]),")
        else:
            src = f"wiki: {m['name']} — {m['description']}" if m["description"] else f"wiki: {m['name']} — catalog entry (stats in ability logic)"
            lines.append(f"  {key}: mod({json.dumps(m['id'])}, [], {json.dumps(src)}),")

    lines.append("};")
    lines.append("")
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(mods)} mods to {out}")


if __name__ == "__main__":
    cats = sys.argv[1:] if len(sys.argv) > 1 else ["general"]
    for c in cats:
        generate_batch(c)
