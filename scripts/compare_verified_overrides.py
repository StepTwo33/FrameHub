#!/usr/bin/env python3
"""Compare axel-shade verified override export against repo static arcane/mod data."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from stat_label_map import normalize_arcane_effect_fields

ROOT = Path(__file__).resolve().parent.parent
EFFECTS_TS = ROOT / "src/data/arcane-effects.ts"
MANUAL_JSON = ROOT / "src/data/arcane-manual-overrides.json"
ARCANES_TS = ROOT / "src/data/arcanes.ts"
MODS_TS = ROOT / "src/data/mods.ts"
DEFAULT_EXPORT = Path.home() / "Downloads/message.txt"


def load_arcane_effects() -> dict:
    text = EFFECTS_TS.read_text(encoding="utf-8")
    start = text.index("{", text.index("ARCANE_EFFECTS"))
    end = text.rindex(";")
    effects = json.loads(text[start:end])
    manual = json.loads(MANUAL_JSON.read_text(encoding="utf-8"))
    for aid, entry in manual.items():
        if aid not in effects:
            continue
        eff_lines = entry.get("effects", entry if isinstance(entry, list) else [])
        if isinstance(entry, dict) and entry.get("replace"):
            effects[aid]["effects"] = eff_lines
        elif isinstance(entry, dict):
            by_stat = {e["stat"]: e for e in effects[aid]["effects"]}
            for e in eff_lines:
                by_stat[e["stat"]] = e
            effects[aid]["effects"] = list(by_stat.values())
        if isinstance(entry, dict) and entry.get("trigger"):
            effects[aid]["trigger"] = entry["trigger"]
        if isinstance(entry, dict) and "stackCap" in entry:
            effects[aid]["stackCap"] = entry["stackCap"]
    return effects


def load_arcanes() -> dict[str, dict]:
    content = ARCANES_TS.read_text(encoding="utf-8")
    out: dict[str, dict] = {}
    for m in re.finditer(
        r'id:\s*"([^"]+)".*?name:\s*"([^"]*)".*?maxRank:\s*(\d+).*?stats:\s*(\{[^}]*\}|{}).*?description:\s*"((?:[^"\\]|\\.)*)"',
        content,
        re.S,
    ):
        stats_raw = m.group(4).strip()
        try:
            stats = json.loads(stats_raw.replace("'", '"'))
        except json.JSONDecodeError:
            stats = {}
        desc = m.group(5).replace("\\ ", " ").replace("\\n", "\n")
        out[m.group(1)] = {
            "name": m.group(2),
            "maxRank": int(m.group(3)),
            "stats": stats,
            "description": desc,
        }
    return out


def load_mods() -> dict[str, dict]:
    content = MODS_TS.read_text(encoding="utf-8")
    out: dict[str, dict] = {}
    for m in re.finditer(
        r'"id":\s*"([^"]+)".*?"name":\s*"([^"]*)".*?"maxRank":\s*(\d+).*?"category":\s*"([^"]*)".*?"description":\s*"((?:[^"\\]|\\.)*)"',
        content,
        re.S,
    ):
        desc = m.group(5).replace("\\n", "\n")
        out[m.group(1)] = {
            "name": m.group(2),
            "maxRank": int(m.group(3)),
            "category": m.group(4),
            "description": desc,
        }
    return out


def norm_effect_line(e: dict) -> dict:
    keep = ("stat", "maxValue", "baseValue", "flat", "stacking", "constantAtAllRanks", "valuesByRank")
    return {k: e[k] for k in keep if k in e}


def effects_match(expected: list, actual: list) -> tuple[bool, list[str]]:
    issues: list[str] = []
    exp_by = {e["stat"]: norm_effect_line(e) for e in expected}
    act_by = {e["stat"]: norm_effect_line(e) for e in actual}
    for stat, exp in exp_by.items():
        if stat not in act_by:
            issues.append(f"missing effect stat {stat!r}")
            continue
        act = act_by[stat]
        for key in ("maxValue", "baseValue", "flat", "stacking", "constantAtAllRanks"):
            if key in exp and exp.get(key) != act.get(key):
                issues.append(f"{stat}.{key}: have {act.get(key)!r}, verified {exp.get(key)!r}")
    for stat in act_by:
        if stat not in exp_by:
            issues.append(f"extra effect stat {stat!r} in repo")
    return len(issues) == 0, issues


def stats_match(expected: dict, actual: dict) -> tuple[bool, list[str]]:
    issues: list[str] = []
    for k, v in expected.items():
        if actual.get(k) != v:
            issues.append(f"stats.{k}: have {actual.get(k)!r}, verified {v!r}")
    for k in actual:
        if k not in expected and actual[k] != 0:
            issues.append(f"extra stats.{k}={actual[k]!r} in repo")
    return len(issues) == 0, issues


def main() -> None:
    export_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_EXPORT
    if not export_path.exists():
        print(f"Export not found: {export_path}")
        sys.exit(1)

    verified = json.loads(export_path.read_text(encoding="utf-8"))
    effects = load_arcane_effects()
    arcanes = load_arcanes()
    mods = load_mods()

    effect_mismatch: list[tuple[str, list[str]]] = []
    effect_missing: list[str] = []
    arcane_mismatch: list[tuple[str, list[str]]] = []
    arcane_missing: list[str] = []
    mod_mismatch: list[tuple[str, list[str]]] = []
    effect_match = 0
    arcane_match = 0

    for o in verified:
        tid = o["targetId"]
        fields = o.get("fields") or {}
        if o["targetType"] == "arcane_effect":
            if tid not in effects:
                effect_missing.append(tid)
                continue
            cur = effects[tid]
            fields = normalize_arcane_effect_fields(fields, tid)
            issues: list[str] = []
            if fields.get("trigger") and fields["trigger"] != cur.get("trigger"):
                issues.append(f"trigger: have {cur.get('trigger')!r}, verified {fields['trigger']!r}")
            if fields.get("maxRank") and fields["maxRank"] != cur.get("maxRank"):
                issues.append(f"maxRank: have {cur.get('maxRank')!r}, verified {fields['maxRank']!r}")
            if "stackCap" in fields and fields.get("stackCap") != cur.get("stackCap"):
                issues.append(f"stackCap: have {cur.get('stackCap')!r}, verified {fields['stackCap']!r}")
            exp_fx = fields.get("effects") or []
            act_fx = cur.get("effects") or []
            ok, fx_issues = effects_match(exp_fx, act_fx)
            issues.extend(fx_issues)
            if issues:
                effect_mismatch.append((tid, issues))
            else:
                effect_match += 1
        elif o["targetType"] == "arcane":
            if tid not in arcanes:
                arcane_missing.append(tid)
                continue
            cur = arcanes[tid]
            issues = []
            if "description" in fields and fields["description"] != cur.get("description"):
                issues.append("description differs")
            if "stats" in fields:
                ok, st_issues = stats_match(fields["stats"], cur.get("stats") or {})
                issues.extend(st_issues)
            if "name" in fields and fields["name"] != cur.get("name"):
                issues.append(f"name: have {cur.get('name')!r}, verified {fields['name']!r}")
            if issues:
                arcane_mismatch.append((tid, issues))
            else:
                arcane_match += 1
        elif o["targetType"] == "mod":
            if tid not in mods:
                mod_mismatch.append((tid, ["mod id not in mods.ts"]))
                continue
            cur = mods[tid]
            issues = []
            for key in ("description", "name", "category", "maxRank"):
                if key in fields and fields[key] != cur.get(key):
                    issues.append(f"{key}: have {cur.get(key)!r}, verified {fields[key]!r}")
            if issues:
                mod_mismatch.append((tid, issues))

    print(f"Verified export: {len(verified)} overrides from {export_path.name}")
    print()
    print("=== arcane_effect vs repo (arcane-effects.ts + manual overrides) ===")
    print(f"  match: {effect_match}")
    print(f"  mismatch: {len(effect_mismatch)}")
    print(f"  arcane id missing in repo: {len(effect_missing)}")
    print()
    print("=== arcane catalog vs repo (arcanes.ts) ===")
    print(f"  match: {arcane_match}")
    print(f"  mismatch: {len(arcane_mismatch)}")
    print(f"  arcane id missing in repo: {len(arcane_missing)}")
    print()
    print("=== mod overrides ===")
    print(f"  mismatch: {len(mod_mismatch)}")

    if effect_mismatch:
        print("\n--- arcane_effect mismatches (first 25) ---")
        for tid, issues in effect_mismatch[:25]:
            print(f"  {tid}:")
            for i in issues[:6]:
                print(f"    - {i}")
        if len(effect_mismatch) > 25:
            print(f"  ... and {len(effect_mismatch) - 25} more")

    if arcane_mismatch:
        print("\n--- arcane catalog mismatches (first 25) ---")
        for tid, issues in arcane_mismatch[:25]:
            cur_desc = (arcanes.get(tid) or {}).get("description", "")[:70]
            print(f"  {tid}:")
            for i in issues[:4]:
                print(f"    - {i}")
            if "description differs" in issues:
                vf = next(x for x in verified if x["targetId"] == tid and x["targetType"] == "arcane")
                print(f"    repo: {cur_desc!r}...")
                print(f"    verified: {vf['fields'].get('description', '')[:70]!r}...")
        if len(arcane_mismatch) > 25:
            print(f"  ... and {len(arcane_mismatch) - 25} more")

    # Stat key alignment: verified uses human labels vs repo catalog keys
    catalog_stats = set()
    label_stats = set()
    for o in verified:
        if o["targetType"] != "arcane_effect":
            continue
        for e in (o.get("fields") or {}).get("effects") or []:
            s = e.get("stat", "")
            if re.match(r"^[a-z]", s):
                catalog_stats.add(s)
            else:
                label_stats.add(s)
    print(f"\n=== effect stat key style in verified export ===")
    print(f"  catalog-style keys: {len(catalog_stats)}")
    print(f"  human label keys: {len(label_stats)} (need mapping for calculator)")

    if mod_mismatch:
        print("\n--- mod mismatches ---")
        for tid, issues in mod_mismatch:
            print(f"  {tid}: {issues}")


if __name__ == "__main__":
    main()
