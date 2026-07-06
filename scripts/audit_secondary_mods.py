#!/usr/bin/env python3
"""Audit regular secondary mods: behaviors, stats, wiki sync."""
from __future__ import annotations

import importlib.util
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
SLOT_TS = ROOT / "src/lib/mod-slot-categories.ts"
TAGS_TS = ROOT / "src/data/mod-weapon-tags.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"

SECONDARY_CATEGORIES = {"secondary", "pistol", "dual_pistols"}
TOME_IDS = {
    "fass_canticle", "jahu_canticle", "khra_canticle", "lohk_canticle",
    "netra_invocation", "ris_invocation", "vome_invocation", "xata_invocation",
}


def load_set_from_ts(const_name: str) -> set[str]:
    text = SLOT_TS.read_text(encoding="utf-8")
    m = re.search(rf"export const {const_name}[^=]*=\s*new Set\(\[([\s\S]*?)\]\)", text)
    if not m:
        return set()
    return set(re.findall(r'"([a-z0-9_]+)"', m.group(1)))


def load_exclusive_weapon_mod_ids() -> set[str]:
    text = TAGS_TS.read_text(encoding="utf-8")
    m = re.search(r"export const MOD_EXCLUSIVE_WEAPON_IDS[^=]*=\s*\{([\s\S]*?)\n\};", text)
    if not m:
        return set()
    return set(re.findall(r'"([a-z0-9_]+)":\s*\[', m.group(1)))


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
            "stats": stats,
            "description": grab("description"),
        })
    return mods


def load_behavior_map() -> dict[str, dict]:
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


def main() -> None:
    mods = load_mods()
    exilus_ids = load_set_from_ts("SECONDARY_WEAPON_EXILUS_MOD_IDS")
    exclusive_weapon_mod_ids = load_exclusive_weapon_mod_ids()
    behaviors = load_behavior_map()

    pool = [
        m for m in mods
        if m["category"] in SECONDARY_CATEGORIES
        and m["id"] not in exilus_ids
        and m["id"] not in TOME_IDS
        and m["subCategory"] != "riven"
        and m["subCategory"] != "weapon"
        and not m["id"].startswith("historic_")
    ]

    print("=== Regular secondary mod audit ===\n")
    print(f"Pool size (exilus + tome + riven + weapon-augments excluded): {len(pool)}")
    print(f"By category: {dict(Counter(m['category'] for m in pool))}")

    missing_behavior = [m for m in pool if m["id"] not in behaviors]
    print(f"\nBehavior coverage: {len(pool) - len(missing_behavior)}/{len(pool)}")
    for m in sorted(missing_behavior, key=lambda x: x["name"]):
        print(f"  MISSING: {m['id']} ({m['name']})")

    no_stats = [m for m in pool if not m["stats"]]
    print(f"\nEmpty stats: {len(no_stats)}")
    for m in sorted(no_stats, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['name']}")

    desc_only_with_stats: list[str] = []
    stats_no_behavior_line: list[str] = []
    for m in pool:
        beh = behaviors.get(m["id"])
        if not beh:
            continue
        catalog_stats = set(m["stats"].keys())
        beh_stats = set(beh["statKeys"])
        if beh["descriptionOnly"] and catalog_stats:
            desc_only_with_stats.append(f"{m['id']}: {sorted(catalog_stats)}")
        missing_lines = catalog_stats - beh_stats
        if missing_lines and not beh["descriptionOnly"]:
            stats_no_behavior_line.append(f"{m['id']}: missing {sorted(missing_lines)}")

    print(f"\nDescription-only behaviors with catalog stats: {len(desc_only_with_stats)}")
    for line in sorted(desc_only_with_stats):
        print(f"  {line}")

    print(f"\nCatalog stats missing behavior lines: {len(stats_no_behavior_line)}")
    for line in sorted(stats_no_behavior_line):
        print(f"  {line}")

    exclusive_in_pool = [m for m in pool if m["id"] in exclusive_weapon_mod_ids]
    print(f"\nWeapon-exclusive mods in regular secondary pool: {len(exclusive_in_pool)}")
    no_stat_exclusive = [m for m in exclusive_in_pool if not m["stats"]]
    if no_stat_exclusive:
        print(f"  Exclusive with empty stats: {len(no_stat_exclusive)}")
        for m in sorted(no_stat_exclusive, key=lambda x: x["name"]):
            print(f"    {m['id']}")


if __name__ == "__main__":
    main()
