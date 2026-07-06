#!/usr/bin/env python3
"""Audit companion + companion_weapon mods: behaviors, stats."""
from __future__ import annotations

import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"

COMPANION_CATEGORIES = {"companion", "companion_weapon"}


def load_mods() -> list[dict]:
    mods = []
    for chunk in re.split(r"\n  \},\n", MODS_TS.read_text(encoding="utf-8")):
        mid = re.search(r'"id":\s*"([^"]+)"', chunk)
        if not mid:
            continue

        def grab(key: str, default: str = "") -> str:
            m = re.search(rf'"{key}":\s*"([^"]*)"', chunk)
            return m.group(1) if m else default

        mr_m = re.search(r'"maxRank":\s*(\d+)', chunk)
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
            "maxRank": int(mr_m.group(1)) if mr_m else 0,
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
    behaviors = load_behavior_map()

    pool = [
        m for m in mods
        if m["category"] in COMPANION_CATEGORIES
        and m["subCategory"] != "riven"
        and not m["id"].startswith("historic_")
        and not m["id"].startswith("set_bonus_")
    ]

    print("=== Companion mod audit ===\n")
    print(f"Pool size: {len(pool)}")
    print(f"By category: {dict(Counter(m['category'] for m in pool))}")
    print(f"By subCategory: {dict(Counter(m['subCategory'] or '(none)' for m in pool))}")

    missing_behavior = [m for m in pool if m["id"] not in behaviors]
    print(f"\nBehavior coverage: {len(pool) - len(missing_behavior)}/{len(pool)}")
    for m in sorted(missing_behavior, key=lambda x: x["name"]):
        print(f"  MISSING: {m['id']} ({m['name']}) [{m['category']}]")

    no_stats = [m for m in pool if not m["stats"] and m.get("maxRank", 0) > 0]
    print(f"\nEmpty stats (ranked mods only): {len(no_stats)}")
    for m in sorted(no_stats, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['name']} ({m['category']})")

    rank0_empty = [m for m in pool if not m["stats"] and m.get("maxRank", 0) == 0]
    if rank0_empty:
        print(f"\nRank-0 / FX mods without stats: {len(rank0_empty)}")
        for m in sorted(rank0_empty, key=lambda x: x["name"]):
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

    wrong_file = [
        f"{mid}: {behaviors[mid]['file']}"
        for mid in (m["id"] for m in pool)
        if mid in behaviors and behaviors[mid]["file"] not in ("companion.ts", "companion_weapon.ts")
    ]
    if wrong_file:
        print(f"\nBehaviors in unexpected batch file: {len(wrong_file)}")
        for line in sorted(wrong_file)[:15]:
            print(f"  {line}")


if __name__ == "__main__":
    main()
