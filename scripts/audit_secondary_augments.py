#!/usr/bin/env python3
"""Audit secondary weapon-exclusive augments."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
TAGS_TS = ROOT / "src/data/mod-weapon-tags.ts"
WEAPONS_TS = ROOT / "src/data/weapons.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"

SECONDARY_CATS = {"secondary", "pistol", "dual_pistols"}


def load_secondaries() -> set[str]:
    weapons = json.loads(
        re.search(
            r"export const allWeapons: Weapon\[\] = (\[[\s\S]*?\n\]);",
            WEAPONS_TS.read_text(encoding="utf-8"),
        ).group(1)
    )
    return {
        w["id"]
        for w in weapons
        if w.get("category") in SECONDARY_CATS and not w.get("isExalted")
    }


def load_exclusive() -> dict[str, list[str]]:
    text = TAGS_TS.read_text(encoding="utf-8")
    m = re.search(r"export const MOD_EXCLUSIVE_WEAPON_IDS[^=]*=\s*\{([\s\S]*?)\n\};", text)
    out: dict[str, list[str]] = {}
    if not m:
        return out
    for row in re.finditer(
        r'"([a-z0-9_]+)":\s*\[([^\]]*)\]',
        m.group(1),
    ):
        out[row.group(1)] = re.findall(r'"([^"]+)"', row.group(2))
    return out


def load_mod(mid: str) -> dict | None:
    for chunk in re.split(r"\n  \},\n", MODS_TS.read_text(encoding="utf-8")):
        if re.search(rf'"id":\s*"{re.escape(mid)}"', chunk):
            def grab(key: str) -> str:
                m = re.search(rf'"{key}":\s*"([^"]*)"', chunk)
                return m.group(1) if m else ""

            stats: dict[str, float] = {}
            sb = re.search(r'"stats":\s*\{([^}]*)\}', chunk, re.S)
            if sb and sb.group(1).strip():
                for sm in re.finditer(r'"([^"]+)":\s*(-?[\d.]+)', sb.group(1)):
                    stats[sm.group(1)] = float(sm.group(2))
            return {"id": mid, "name": grab("name"), "stats": stats, "category": grab("category")}
    return None


def load_behaviors() -> set[str]:
    out: set[str] = set()
    for path in BEHAVIOR_DIR.rglob("*.ts"):
        text = path.read_text(encoding="utf-8")
        out.update(re.findall(r'mod\("([^"]+)"', text))
    return out


def main() -> None:
    secondaries = load_secondaries()
    exclusive = load_exclusive()
    behaviors = load_behaviors()

    pool: list[tuple[str, str, list[str]]] = []
    for mod_id, weapon_ids in sorted(exclusive.items()):
        if not set(weapon_ids) & secondaries:
            continue
        mod = load_mod(mod_id)
        if not mod:
            continue
        pool.append((mod_id, mod["name"], weapon_ids))

    print("=== Secondary weapon-exclusive augments ===\n")
    print(f"Count: {len(pool)}")
    missing_beh = []
    empty_stats = []
    for mod_id, name, wids in pool:
        beh = mod_id in behaviors
        mod = load_mod(mod_id)
        stats = mod["stats"] if mod else {}
        print(f"  {mod_id}: {name} -> {', '.join(wids)} | behavior={beh} stats={list(stats.keys())}")
        if not beh:
            missing_beh.append(mod_id)
        if not stats:
            empty_stats.append(mod_id)

    if missing_beh:
        print(f"\nMissing behavior ({len(missing_beh)}): {missing_beh}")
    if empty_stats:
        print(f"\nEmpty stats ({len(empty_stats)}): {empty_stats}")


if __name__ == "__main__":
    main()
