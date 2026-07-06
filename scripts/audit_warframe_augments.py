#!/usr/bin/env python3
"""Audit warframe ability augments: behaviors, stats, metadata."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
TAGS_TS = ROOT / "src/data/mod-weapon-tags.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"

COMPANION_WF_AUGMENT_IDS = {
    "augment_khora_venari_bodyguard",
    "prismatic_companion",
    "repair_dispensary",
}


def load_exclusive_ids() -> set[str]:
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
            "warframeId": grab("warframeId"),
            "maxRank": int(mr_m.group(1)) if mr_m else 0,
            "stats": stats,
            "description": grab("description"),
        })
    return mods


def load_behaviors() -> dict[str, dict]:
    out: dict[str, dict] = {}
    key_re = r'(?:"[^"]+"|\w+)'
    for path in BEHAVIOR_DIR.rglob("*.ts"):
        text = path.read_text(encoding="utf-8")
        for m in re.finditer(
            rf'({key_re}):\s*mod\("([^"]+)"\s*,\s*\[([\s\S]*?)\](?:\s*,\s*"([^"]*)")?\)',
            text,
        ):
            out[m.group(2)] = {
                "statKeys": re.findall(r'line\("([^"]+)"', m.group(3)),
                "descriptionOnly": bool(m.group(4)),
                "file": path.name,
            }
        for m in re.finditer(
            rf'({key_re}):\s*mod\("([^"]+)"\s*,\s*\[\s*\]\s*,\s*"([^"]*)"\)',
            text,
        ):
            out[m.group(2)] = {"statKeys": [], "descriptionOnly": True, "file": path.name}
    return out


def is_warframe_ability_augment(m: dict, exclusive: set[str]) -> bool:
    if m["category"] != "augment":
        return False
    if m["subCategory"] == "weapon":
        return False
    if m["id"] in exclusive:
        return False
    return bool(m["warframeId"])


def main() -> None:
    exclusive = load_exclusive_ids()
    mods = load_mods()
    behaviors = load_behaviors()
    pool = [m for m in mods if is_warframe_ability_augment(m, exclusive)]

    print("=== Warframe ability augment audit ===\n")
    print(f"Pool size: {len(pool)}")
    print(f"  Companion-affecting: {sum(1 for m in pool if m['id'] in COMPANION_WF_AUGMENT_IDS)}")
    print(f"  Universal warframeId: {sum(1 for m in pool if m['warframeId'] == 'universal')}")

    missing_behavior = [m for m in pool if m["id"] not in behaviors]
    print(f"\nBehavior coverage: {len(pool) - len(missing_behavior)}/{len(pool)}")
    for m in sorted(missing_behavior, key=lambda x: x["name"]):
        print(f"  MISSING: {m['id']} ({m['name']}) [{m['warframeId']}]")

    no_stats = [m for m in pool if not m["stats"] and m.get("maxRank", 0) > 0]
    print(f"\nEmpty stats (ranked): {len(no_stats)}")
    for m in sorted(no_stats, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['name']}")

    no_wf_id = [
        m for m in mods
        if m["category"] == "augment"
        and m["subCategory"] != "weapon"
        and m["id"] not in exclusive
        and not m["warframeId"]
    ]
    print(f"\nAbility augments missing warframeId: {len(no_wf_id)}")
    for m in sorted(no_wf_id, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['name']}")

    wrong_cat = [
        m for m in mods
        if m["warframeId"]
        and m["warframeId"] != "universal"
        and m["category"] != "augment"
        and m["subCategory"] != "weapon"
        and "Augment:" in m["description"]
        and m["id"] not in exclusive
    ]
    print(f"\nLikely augments wrong category (has warframeId + Augment: desc): {len(wrong_cat)}")
    for m in sorted(wrong_cat, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['category']} ({m['name']}) -> {m['warframeId']}")

    miscat_warframe = [
        m for m in mods
        if m["id"].startswith("augment_")
        and m["category"] != "augment"
        and m["subCategory"] != "weapon"
    ]
    print(f"\naugment_* id prefix but not augment category: {len(miscat_warframe)}")
    for m in sorted(miscat_warframe, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['category']}")

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
    for line in sorted(stats_no_lines)[:40]:
        print(f"  {line}")
    if len(stats_no_lines) > 40:
        print(f"  ... and {len(stats_no_lines) - 40} more")


if __name__ == "__main__":
    main()
