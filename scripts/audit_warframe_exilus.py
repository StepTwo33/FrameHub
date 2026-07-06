#!/usr/bin/env python3
"""Audit warframe Exilus mods: catalog pool, stats, behaviors."""
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
    exilus_ids = load_set_from_ts("WARFRAME_EXILUS_MOD_IDS")
    mods = load_mods()
    by_id = {m["id"]: m for m in mods}
    behaviors = load_behaviors()

    pool = [by_id[mid] for mid in sorted(exilus_ids) if mid in by_id]
    missing_catalog = sorted(exilus_ids - by_id.keys())

    no_behavior = []
    no_stats = []
    desc_only = []
    stats_no_lines = []

    for m in pool:
        beh = behaviors.get(m["id"])
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

    # Augment + exilus polarity (also eligible for warframe exilus slot)
    augment_exilus = [
        m for m in mods
        if m["category"] == "augment" and m["polarity"] == "exilus" and m["id"] not in exilus_ids
    ]

    print(f"Warframe Exilus pool (WARFRAME_EXILUS_MOD_IDS): {len(exilus_ids)}")
    print(f"  In catalog: {len(pool)}")
    if missing_catalog:
        print(f"  Missing from catalog: {missing_catalog}")
    print(f"\nMissing behavior: {len(no_behavior)}")
    for m in no_behavior:
        print(f"  {m['id']}: {m['name']}")
    print(f"\nEmpty stats: {len(no_stats)}")
    for m in sorted(no_stats, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['name']}")
    print(f"\nDescription-only behaviors: {len(desc_only)}")
    for m in sorted(desc_only, key=lambda x: x["name"]):
        print(f"  {m['id']}: stats={list(m['stats'].keys()) or 'none'}")
    print(f"\nStats not in behavior lines: {len(stats_no_lines)}")
    for m in sorted(stats_no_lines, key=lambda x: x["name"]):
        if isinstance(m.get("missing"), list):
            print(f"  {m['id']}: missing lines for {m['missing']}")
        else:
            print(f"  {m['id']}: has stats {list(m['stats'].keys())} but desc-only behavior")
    if augment_exilus:
        print(f"\nAugment+exilus polarity (not in ID set): {len(augment_exilus)}")
        for m in sorted(augment_exilus, key=lambda x: x["name"])[:20]:
            beh = behaviors.get(m["id"])
            print(
                f"  {m['id']}: behavior={'yes' if beh else 'NO'}, "
                f"stats={list(m['stats'].keys()) or 'none'}, descOnly={beh and beh['descriptionOnly']}"
            )


if __name__ == "__main__":
    main()
