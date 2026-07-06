#!/usr/bin/env python3
"""Audit regular warframe mods: behaviors, stats (excludes aura, exilus, augments)."""
from __future__ import annotations

import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
SLOT_TS = ROOT / "src/lib/mod-slot-categories.ts"
AURA_TS = ROOT / "src/lib/aura-mods.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"


def load_set_from_ts(path: Path, const_name: str) -> set[str]:
    text = path.read_text(encoding="utf-8")
    m = re.search(rf"export const {const_name}[^=]*=\s*new Set\(\[([\s\S]*?)\]\)", text)
    if not m:
        return set()
    return set(re.findall(r'"([a-z0-9_]+)"', m.group(1)))


def load_aura_ids() -> set[str]:
    text = AURA_TS.read_text(encoding="utf-8")
    m = re.search(r"AURA_MOD_IDS[^=]*=\s*new Set\(\[([\s\S]*?)\]\)", text)
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

        pol_m = re.search(r'"polarity":\s*"([^"]+)"', chunk)
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
            "polarity": pol_m.group(1) if pol_m else "",
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
    exilus_ids = load_set_from_ts(SLOT_TS, "WARFRAME_EXILUS_MOD_IDS")
    aura_ids = load_aura_ids()
    behaviors = load_behavior_map()

    pool = [
        m for m in mods
        if m["category"] == "warframe"
        and m["id"] not in exilus_ids
        and m["id"] not in aura_ids
        and m["polarity"] != "exilus"
        and m["id"] != "parry_r3"  # melee Exilus (warframe block)
        and not m["id"].startswith("historic_")
    ]

    print("=== Regular warframe mod audit ===\n")
    print(f"Pool size (aura + exilus excluded): {len(pool)}")

    missing_behavior = [m for m in pool if m["id"] not in behaviors]
    print(f"\nBehavior coverage: {len(pool) - len(missing_behavior)}/{len(pool)}")
    for m in sorted(missing_behavior, key=lambda x: x["name"]):
        print(f"  MISSING: {m['id']} ({m['name']})")

    no_stats = [m for m in pool if not m["stats"] and m.get("maxRank", 0) > 0]
    print(f"\nEmpty stats (ranked mods only): {len(no_stats)}")
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

    umbra = [m for m in pool if m["polarity"] == "umbra"]
    print(f"\nUmbral mods in pool: {len(umbra)}")


if __name__ == "__main__":
    main()
