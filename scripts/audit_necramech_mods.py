#!/usr/bin/env python3
"""Audit Necramech mods: behaviors, stats, batch placement."""
from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"
EXPECTED_BATCH = "necramech.ts"

NECRAMECH_CATEGORIES = {"necramech"}


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
    key_re = r'(?:"[^"]+"|\w+)'
    for path in BEHAVIOR_DIR.rglob("*.ts"):
        text = path.read_text(encoding="utf-8")
        for m in re.finditer(
            rf"({key_re}):\s*mod\(\"([^\"]+)\"\s*,\s*\[([\s\S]*?)\](?:\s*,\s*\"([^\"]*)\")?\)",
            text,
        ):
            out[m.group(2)] = {
                "statKeys": re.findall(r'line\("([^"]+)"', m.group(3)),
                "descriptionOnly": bool(m.group(4)),
                "file": path.name,
            }
        for m in re.finditer(
            rf"({key_re}):\s*mod\(\"([^\"]+)\"\s*,\s*\[\s*\]\s*,\s*\"([^\"]*)\"\)",
            text,
        ):
            out[m.group(2)] = {"statKeys": [], "descriptionOnly": True, "file": path.name}
    return out


def main() -> int:
    mods = load_mods()
    behaviors = load_behavior_map()
    pool = [m for m in mods if m["category"] in NECRAMECH_CATEGORIES]

    print("=== Necramech mod audit ===\n")
    print(f"Pool size: {len(pool)}")
    print(f"By category: {dict(Counter(m['category'] for m in pool))}")

    missing_behavior = [m for m in pool if m["id"] not in behaviors]
    print(f"\nBehavior coverage: {len(pool) - len(missing_behavior)}/{len(pool)}")
    for m in sorted(missing_behavior, key=lambda x: x["name"]):
        print(f"  MISSING: {m['id']} ({m['name']})")

    no_stats = [
        m for m in pool
        if not m["stats"]
        and m.get("maxRank", 0) > 0
        and not behaviors.get(m["id"], {}).get("descriptionOnly")
    ]
    print(f"\nEmpty stats (ranked, not description-only): {len(no_stats)}")
    for m in sorted(no_stats, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['name']}")

    desc_only = [m for m in pool if behaviors.get(m["id"], {}).get("descriptionOnly")]
    print(f"\nDescription-only behaviors: {len(desc_only)}")
    for m in sorted(desc_only, key=lambda x: x["name"]):
        print(f"  {m['id']}: stats={list(m['stats'].keys()) or 'none'}")

    desc_only_with_stats: list[str] = []
    stats_no_behavior_line: list[str] = []
    behavior_extra_lines: list[str] = []
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
        extra_lines = beh_stats - catalog_stats
        if extra_lines and not beh["descriptionOnly"]:
            behavior_extra_lines.append(f"{m['id']}: behavior-only {sorted(extra_lines)}")

    print(f"\nDescription-only behaviors with catalog stats: {len(desc_only_with_stats)}")
    for line in sorted(desc_only_with_stats):
        print(f"  {line}")

    print(f"\nCatalog stats missing behavior lines: {len(stats_no_behavior_line)}")
    for line in sorted(stats_no_behavior_line):
        print(f"  {line}")

    print(f"\nBehavior lines without catalog stats: {len(behavior_extra_lines)}")
    for line in sorted(behavior_extra_lines):
        print(f"  {line}")

    wrong_file = [
        f"{m['id']}: {behaviors[m['id']]['file']} (expected {EXPECTED_BATCH})"
        for m in pool
        if m["id"] in behaviors and behaviors[m["id"]]["file"] != EXPECTED_BATCH
    ]
    if wrong_file:
        print(f"\nBehaviors in unexpected batch file: {len(wrong_file)}")
        for line in sorted(wrong_file):
            print(f"  {line}")

    wrong_sub = [m for m in pool if m.get("subCategory")]
    if wrong_sub:
        print(f"\nUnexpected subCategory: {len(wrong_sub)}")
        for m in sorted(wrong_sub, key=lambda x: x["name"]):
            print(f"  {m['id']}: {m['subCategory']!r}")

    behaviors_not_in_pool = sorted(
        mid for mid, beh in behaviors.items()
        if mid.startswith("necramech_") and mid not in {m["id"] for m in pool}
    )
    if behaviors_not_in_pool:
        print(f"\nNecramech behaviors not in catalog: {len(behaviors_not_in_pool)}")
        for mid in behaviors_not_in_pool:
            print(f"  {mid}")

    print()
    issues = (
        len(missing_behavior)
        + len(no_stats)
        + len(stats_no_behavior_line)
        + len(desc_only_with_stats)
        + len(wrong_file)
        + len(behaviors_not_in_pool)
    )
    print(f"--- Summary ---")
    print(f"  Behavior coverage: {len(pool) - len(missing_behavior)}/{len(pool)}")
    print(f"  Description-only: {len(desc_only)}")
    print(f"  Actionable issues: {issues}")
    return issues


if __name__ == "__main__":
    sys.exit(1 if main() else 0)
