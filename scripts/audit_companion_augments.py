#!/usr/bin/env python3
"""Audit companion augments: penjaga precepts + warframe augments affecting companions."""
from __future__ import annotations

import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"

COMPANION_WARFRAME_AUGMENT_IDS = {
    "augment_khora_venari_bodyguard",
    "prismatic_companion",
    "repair_dispensary",
}


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


def is_precept(m: dict) -> bool:
    return m["category"] == "companion" and m["polarity"] == "penjaga"


def is_warframe_companion_augment(m: dict) -> bool:
    return m["id"] in COMPANION_WARFRAME_AUGMENT_IDS


def main() -> None:
    mods = load_mods()
    behaviors = load_behavior_map()

    precepts = [
        m for m in mods
        if is_precept(m)
        and m["subCategory"] != "riven"
        and not m["id"].startswith("historic_")
    ]
    wf_augments = [m for m in mods if is_warframe_companion_augment(m)]
    pool = precepts + wf_augments

    print("=== Companion augment audit ===\n")
    print(f"Pool size: {len(pool)} ({len(precepts)} precepts + {len(wf_augments)} warframe augments)")
    print(f"Precepts by subCategory: {dict(Counter(m['subCategory'] or '(none)' for m in precepts))}")

    missing_behavior = [m for m in pool if m["id"] not in behaviors]
    print(f"\nBehavior coverage: {len(pool) - len(missing_behavior)}/{len(pool)}")
    for m in sorted(missing_behavior, key=lambda x: x["name"]):
        print(f"  MISSING: {m['id']} ({m['name']})")

    no_stats = [m for m in pool if not m["stats"] and m.get("maxRank", 0) > 0]
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

    miscat = [m for m in wf_augments if m["category"] != "augment"]
    if miscat:
        print(f"\nWarframe companion augments wrong category: {len(miscat)}")
        for m in miscat:
            print(f"  {m['id']}: {m['category']}")


if __name__ == "__main__":
    main()
