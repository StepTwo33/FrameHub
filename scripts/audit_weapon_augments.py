#!/usr/bin/env python3
"""Audit weapon augments: stats, behaviors, wiki sync."""
from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
TAGS_TS = ROOT / "src/data/mod-weapon-tags.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"


def load_mods() -> list[dict]:
    mods = []
    for chunk in re.split(r"\n  \},\n", MODS_TS.read_text(encoding="utf-8")):
        mid = re.search(r'"id":\s*"([^"]+)"', chunk)
        if not mid:
            continue

        def grab(key: str, default: str = "") -> str:
            m = re.search(rf'"{key}":\s*"([^"]*)"', chunk)
            return m.group(1) if m else default

        stats_block = re.search(r'"stats":\s*\{([^}]*)\}', chunk, re.S)
        stats: dict[str, float] = {}
        if stats_block and stats_block.group(1).strip():
            for sm in re.finditer(r'"([^"]+)":\s*(-?[\d.]+)', stats_block.group(1)):
                stats[sm.group(1)] = float(sm.group(2))
        mods.append({
            "id": mid.group(1),
            "name": grab("name"),
            "category": grab("category"),
            "subCategory": grab("subCategory"),
            "description": grab("description"),
            "stats": stats,
        })
    return mods


def load_exclusive_ids() -> set[str]:
    text = TAGS_TS.read_text(encoding="utf-8")
    m = re.search(r"export const MOD_EXCLUSIVE_WEAPON_IDS[^=]*=\s*\{([\s\S]*?)\n\};", text)
    if not m:
        return set()
    return set(re.findall(r'"([a-z0-9_]+)":\s*\[', m.group(1)))


def load_behaviors() -> dict[str, dict]:
    out: dict[str, dict] = {}
    for path in BEHAVIOR_DIR.rglob("*.ts"):
        text = path.read_text(encoding="utf-8")
        for m in re.finditer(
            r'(\w+):\s*mod\("([^"]+)"\s*,\s*\[([\s\S]*?)\](?:\s*,\s*"([^"]*)")?\)',
            text,
        ):
            out[m.group(2)] = {
                "statKeys": re.findall(r'line\("([^"]+)"', m.group(3)),
                "descriptionOnly": bool(m.group(4)),
                "file": path.name,
            }
        for m in re.finditer(r'(\w+):\s*mod\("([^"]+)"\s*,\s*\[\s*\]\s*,\s*"([^"]*)"\)', text):
            out[m.group(2)] = {"statKeys": [], "descriptionOnly": True, "file": path.name}
    return out


def load_wiki() -> dict[str, dict]:
    path = ROOT / "scripts/_parse_wiki_mod_tags.py"
    spec = importlib.util.spec_from_file_location("p", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.load_wiki_mod_tags()


MOD_ALIASES: dict[str, str] = {}


def wiki_entry(wiki: dict, mod: dict) -> dict | None:
    for key in (MOD_ALIASES.get(mod["id"], ""), mod["name"].lower()):
        if key and key in wiki:
            return wiki[key]
    return None


def main() -> None:
    mods = load_mods()
    exclusive = load_exclusive_ids()
    behaviors = load_behaviors()
    wiki = load_wiki()

    augments = [
        m for m in mods
        if m["subCategory"] == "weapon" or m["id"] in exclusive
    ]
    wiki_augments = {m["id"] for m in augments if (e := wiki_entry(wiki, m)) and e.get("isWeaponAugment")}

    no_behavior = []
    no_stats = []
    desc_only = []
    stats_no_lines = []
    not_wiki_aug = []

    for m in augments:
        beh = behaviors.get(m["id"])
        entry = wiki_entry(wiki, m)
        is_aug = m["subCategory"] == "weapon" or (entry and entry.get("isWeaponAugment"))
        if not beh:
            no_behavior.append(m)
        elif beh["descriptionOnly"]:
            desc_only.append(m)
            if m["stats"]:
                stats_no_lines.append(m)
        elif m["stats"]:
            missing = set(m["stats"]) - set(beh["statKeys"])
            if missing:
                stats_no_lines.append({**m, "missing": sorted(missing)})

        if not m["stats"]:
            no_stats.append(m)
        if m["id"] in exclusive and m["id"] not in wiki_augments and m["subCategory"] != "weapon":
            not_wiki_aug.append(m)

    print(f"Weapon augments (exclusive + subCategory weapon): {len(augments)}")
    print(f"  subCategory weapon: {sum(1 for m in augments if m['subCategory']=='weapon')}")
    print(f"  exclusive-only: {sum(1 for m in augments if m['id'] in exclusive and m['subCategory']!='weapon')}")
    print(f"\nMissing behavior: {len(no_behavior)}")
    for m in sorted(no_behavior, key=lambda x: x["name"])[:30]:
        print(f"  {m['id']}: {m['name']}")
    print(f"\nEmpty stats: {len(no_stats)}")
    for m in sorted(no_stats, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['name']} [{m['category']}]")
    print(f"\nDescription-only behaviors: {len(desc_only)}")
    for m in sorted(desc_only, key=lambda x: x["name"])[:25]:
        print(f"  {m['id']}: stats={list(m['stats'].keys()) or 'none'}")
    if len(desc_only) > 25:
        print(f"  ... +{len(desc_only)-25}")
    print(f"\nStats not in behavior lines: {len(stats_no_lines)}")
    for m in sorted(stats_no_lines, key=lambda x: x["name"])[:20]:
        if isinstance(m.get("missing"), list):
            print(f"  {m['id']}: missing lines for {m['missing']}")
        else:
            print(f"  {m['id']}: has stats {list(m['stats'].keys())} but desc-only behavior")


if __name__ == "__main__":
    main()
