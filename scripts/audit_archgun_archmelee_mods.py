#!/usr/bin/env python3
"""Audit archgun + archmelee mods: behaviors, stats."""
from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"

CATEGORIES = {"archgun", "archmelee"}
BEHAVIOR_FILES = {"archgun": "archgun.ts", "archmelee": "archmelee.ts"}
RIVEN_SUFFIX = "_riven_mod"


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


def audit_category(label: str, pool: list[dict], behaviors: dict[str, dict]) -> int:
    print(f"=== {label} mod audit ===\n")
    print(f"Pool size: {len(pool)}")
    if not pool:
        print()
        return 0

    missing_behavior = [m for m in pool if m["id"] not in behaviors]
    print(f"Behavior coverage: {len(pool) - len(missing_behavior)}/{len(pool)}")
    for m in sorted(missing_behavior, key=lambda x: x["name"]):
        print(f"  MISSING: {m['id']} ({m['name']})")

    no_stats = [
        m for m in pool
        if not m["stats"]
        and m.get("maxRank", 0) > 0
        and not m["id"].endswith(RIVEN_SUFFIX)
        and "conclave" not in m.get("description", "").lower()
        and "fighting form" not in m.get("description", "").lower()
    ]
    print(f"\nEmpty stats (ranked, ex riven/stance): {len(no_stats)}")
    for m in sorted(no_stats, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['name']}")

    rank0_empty = [
        m for m in pool
        if not m["stats"]
        and (m.get("maxRank", 0) == 0 or m["id"].endswith(RIVEN_SUFFIX))
    ]
    if rank0_empty:
        print(f"\nRiven / FX mods without stats: {len(rank0_empty)}")
        for m in sorted(rank0_empty, key=lambda x: x["name"]):
            print(f"  {m['id']}: {m['name']}")

    desc_only = [m for m in pool if behaviors.get(m["id"], {}).get("descriptionOnly")]
    print(f"\nDescription-only behaviors: {len(desc_only)}")
    for m in sorted(desc_only, key=lambda x: x["name"]):
        print(f"  {m['id']}: stats={list(m['stats'].keys()) or 'none'}")

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
        f"{m['id']}: {behaviors[m['id']]['file']}"
        for m in pool
        if m["id"] in behaviors
        and behaviors[m["id"]]["file"] != BEHAVIOR_FILES.get(m["category"], "")
    ]
    if wrong_file:
        print(f"\nBehaviors in unexpected batch file: {len(wrong_file)}")
        for line in sorted(wrong_file):
            print(f"  {line}")

    print()
    return len(missing_behavior) + len(no_stats) + len(stats_no_behavior_line)


def main() -> None:
    category_filter = sys.argv[1] if len(sys.argv) > 1 else None
    mods = load_mods()
    behaviors = load_behavior_map()

    pools: list[tuple[str, list[dict]]] = []
    for cat in ("archgun", "archmelee"):
        if category_filter and category_filter != cat:
            continue
        pool = [
            m for m in mods
            if m["category"] == cat
            and m["subCategory"] != "riven"
            and not m["id"].startswith("historic_")
        ]
        pools.append((cat.capitalize(), pool))

    issues = sum(audit_category(label, pool, behaviors) for label, pool in pools)
    if issues:
        sys.exit(1)


if __name__ == "__main__":
    main()
