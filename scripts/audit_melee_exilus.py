#!/usr/bin/env python3
"""Audit melee weapon Exilus mods: stats, behaviors."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
SLOT_TS = ROOT / "src/lib/mod-slot-categories.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"


def load_set_from_ts(const_name: str) -> set[str]:
    text = SLOT_TS.read_text(encoding="utf-8")
    m = re.search(rf"export const {const_name}[^=]*=\s*new Set\(\[([\s\S]*?)\]\)", text)
    if not m:
        return set()
    return set(re.findall(r'"([a-z0-9_]+)"', m.group(1)))


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
        pol_m = re.search(r'"polarity":\s*"([^"]+)"', chunk)
        stats_block = re.search(r'"stats":\s*\{([^}]*)\}', chunk, re.S)
        stats: dict[str, float] = {}
        if stats_block and stats_block.group(1).strip():
            for sm in re.finditer(r'"([^"]+)":\s*(-?[\d.]+)', stats_block.group(1)):
                stats[sm.group(1)] = float(sm.group(2))
        mods.append({
            "id": mid.group(1),
            "name": grab("name"),
            "category": grab("category"),
            "polarity": pol_m.group(1) if pol_m else "",
            "maxRank": int(mr_m.group(1)) if mr_m else 0,
            "stats": stats,
            "description": grab("description"),
        })
    return mods


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


def main() -> None:
    exilus_ids = load_set_from_ts("MELEE_WEAPON_EXILUS_MOD_IDS")
    mods = load_mods()
    by_id = {m["id"]: m for m in mods}
    behaviors = load_behaviors()

    pool = [by_id[mid] for mid in sorted(exilus_ids) if mid in by_id]
    missing_catalog = sorted(exilus_ids - by_id.keys())

    print("=== Melee weapon Exilus audit ===\n")
    print(f"Pool size (MELEE_WEAPON_EXILUS_MOD_IDS): {len(exilus_ids)}")
    print(f"  In catalog: {len(pool)}")
    if missing_catalog:
        print(f"  Missing from catalog: {missing_catalog}")

    print("\nBy category:")
    from collections import Counter
    print(dict(Counter(m["category"] for m in pool)))

    missing_behavior = [m for m in pool if m["id"] not in behaviors]
    print(f"\nBehavior coverage: {len(pool) - len(missing_behavior)}/{len(pool)}")
    for m in sorted(missing_behavior, key=lambda x: x["name"]):
        print(f"  MISSING: {m['id']} ({m['name']}) [{m['category']}]")

    no_stats = [
        m for m in pool
        if not m["stats"] and m.get("maxRank", 0) > 0
    ]
    print(f"\nEmpty stats (ranked): {len(no_stats)}")
    for m in sorted(no_stats, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['name']}")

    desc_only = [m for m in pool if behaviors.get(m["id"], {}).get("descriptionOnly")]
    print(f"\nDescription-only behaviors: {len(desc_only)}")
    for m in sorted(desc_only, key=lambda x: x["name"]):
        print(f"  {m['id']}: stats={list(m['stats'].keys()) or 'none'}")

    stats_no_lines = []
    for m in pool:
        beh = behaviors.get(m["id"])
        if not beh or beh.get("descriptionOnly"):
            continue
        missing = set(m["stats"]) - set(beh["statKeys"])
        if missing:
            stats_no_lines.append(f"{m['id']}: missing {sorted(missing)}")
    print(f"\nCatalog stats missing behavior lines: {len(stats_no_lines)}")
    for line in sorted(stats_no_lines):
        print(f"  {line}")

    wrong_cat = [
        m for m in pool
        if m["category"] not in ("melee", "warframe", "augment", "general")
    ]
    if wrong_cat:
        print(f"\nUnexpected category in melee exilus set:")
        for m in wrong_cat:
            print(f"  {m['id']}: {m['category']}")


if __name__ == "__main__":
    main()
