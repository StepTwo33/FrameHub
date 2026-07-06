#!/usr/bin/env python3
"""Audit secondary weapon Exilus mods: catalog, stats, behaviors."""
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


def load_mods() -> dict[str, dict]:
    out: dict[str, dict] = {}
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
        out[mid.group(1)] = {
            "id": mid.group(1),
            "name": grab("name"),
            "category": grab("category"),
            "polarity": pol_m.group(1) if pol_m else "",
            "maxRank": int(mr_m.group(1)) if mr_m else 0,
            "stats": stats,
            "description": grab("description"),
        }
    return out


def load_behaviors() -> dict[str, dict]:
    out: dict[str, dict] = {}
    for path in BEHAVIOR_DIR.rglob("*.ts"):
        text = path.read_text(encoding="utf-8")
        for m in re.finditer(
            r'(\w+):\s*mod\("([^"]+)"\s*,\s*\[([\s\S]*?)\](?:\s*,\s*"([^"]*)")?\)',
            text,
        ):
            targets = re.findall(r'line\("([^"]+)",\s*"([^"]+)"', m.group(3))
            out[m.group(2)] = {
                "statKeys": [t[0] for t in targets],
                "targets": {t[0]: t[1] for t in targets},
                "descriptionOnly": bool(m.group(4)),
                "file": path.name,
            }
        for m in re.finditer(r'(\w+):\s*mod\("([^"]+)"\s*,\s*\[\s*\]\s*,\s*"([^"]*)"\)', text):
            out[m.group(2)] = {"statKeys": [], "targets": {}, "descriptionOnly": True, "file": path.name}
    return out


def main() -> None:
    exilus_ids = load_set_from_ts("SECONDARY_WEAPON_EXILUS_MOD_IDS")
    mods = load_mods()
    behaviors = load_behaviors()

    print("=== Secondary weapon Exilus audit ===\n")
    print(f"Pool size (SECONDARY_WEAPON_EXILUS_MOD_IDS): {len(exilus_ids)}")

    missing_catalog = sorted(exilus_ids - mods.keys())
    if missing_catalog:
        print(f"\nMissing from mods.ts: {missing_catalog}")

    no_behavior: list[str] = []
    desc_only: list[str] = []
    weapon_dps: list[str] = []
    mod_panel: list[str] = []
    no_stats: list[str] = []
    wrong_category: list[str] = []

    for mid in sorted(exilus_ids):
        m = mods.get(mid)
        if not m:
            continue
        if m["category"] not in {"secondary", "pistol", "general"}:
            wrong_category.append(f"{mid} ({m['category']})")
        if not m["stats"]:
            no_stats.append(mid)
        b = behaviors.get(mid)
        if not b:
            no_behavior.append(mid)
            continue
        if b.get("descriptionOnly") or not b.get("statKeys"):
            desc_only.append(mid)
            continue
        targets = set(b.get("targets", {}).values())
        if "weapon_dps" in targets:
            weapon_dps.append(mid)
        elif targets <= {"mod_panel"} or "mod_panel" in targets:
            mod_panel.append(mid)
        else:
            mod_panel.append(f"{mid} ({targets})")

    print(f"\nIn catalog: {len(exilus_ids) - len(missing_catalog)}/{len(exilus_ids)}")
    print(f"With verified behavior: {len(exilus_ids) - len(no_behavior) - len(missing_catalog)}/{len(exilus_ids)}")
    print(f"  weapon_dps (calculates in builder): {len(weapon_dps)}")
    print(f"  mod_panel / utility only: {len(mod_panel)}")
    print(f"  description-only behavior: {len(desc_only)}")

    if no_behavior:
        print(f"\nNo behavior entry ({len(no_behavior)}):")
        for x in no_behavior:
            print(f"  {x}")

    if no_stats:
        print(f"\nEmpty stats dict ({len(no_stats)}) — may be utility-only:")
        for x in no_stats:
            print(f"  {x}")

    if wrong_category:
        print(f"\nUnexpected category ({len(wrong_category)}):")
        for x in wrong_category:
            print(f"  {x}")

    print("\n--- weapon_dps (affects calculated stats) ---")
    for x in sorted(weapon_dps):
        b = behaviors[x]
        print(f"  {x}: {b['statKeys']} ({b['file']})")

    print("\n--- mod_panel / pending (display only) ---")
    for x in sorted(mod_panel):
        b = behaviors.get(x.split()[0], {})
        keys = b.get("statKeys", [])
        print(f"  {x}: {keys}")

    if desc_only:
        print("\n--- description-only ---")
        for x in desc_only:
            print(f"  {x}")


if __name__ == "__main__":
    main()
