#!/usr/bin/env python3
"""Audit primary weapons: base stats, passives, radial/AoE, alt-fire hints."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEAPONS_TS = ROOT / "src/data/weapons.ts"
PASSIVES_TS = ROOT / "src/data/weapon-passives.ts"
RADIAL_TS = ROOT / "src/data/weapon-radial-attacks.ts"

PRIMARY_CATEGORIES = {"rifle", "shotgun", "bow", "launcher", "primary"}

REQUIRED_STATS = (
    "damage",
    "impact",
    "puncture",
    "slash",
    "fireRate",
    "criticalChance",
    "criticalMultiplier",
    "statusChance",
    "magazine",
    "reloadTime",
    "multishot",
    "triggerType",
    "modSlots",
)

ALT_AOE_HINTS = (
    "alt-fire",
    "alt fire",
    "alternate fire",
    "explodes in",
    "explosion",
    "radius",
    "radial",
    "aoe",
    "grenade",
    "bomblet",
    "detonat",
)

PASSIVE_WIKI_ARTIFACTS = ("|}", "{|", "wikitable", "|-", "! style=")


def load_weapons() -> list[dict]:
    text = WEAPONS_TS.read_text(encoding="utf-8")
    weapons = json.loads(re.search(r"export const allWeapons: Weapon\[\] = (\[[\s\S]*?\n\]);", text).group(1))
    return weapons


def load_passives() -> dict[str, str]:
    text = PASSIVES_TS.read_text(encoding="utf-8")
    out: dict[str, str] = {}

    def store(key: str, raw: str) -> None:
        val = raw.replace("\\n", "\n")
        val = val.replace("${PROGENITOR_LINE}", "Progenitor bonus: extra elemental damage (typically 25–60% of base damage).")
        out[key] = val.strip()

    for m in re.finditer(r'^\s+([a-z0-9_&]+):\s*"((?:[^"\\]|\\.)*)"', text, re.M):
        store(m.group(1), m.group(2))
    for m in re.finditer(r"^\s+([a-z0-9_&]+):\s*`([^`]*)`", text, re.M):
        store(m.group(1), m.group(2))
    progenitor = "Progenitor bonus: extra elemental damage (typically 25–60% of base damage)."
    for m in re.finditer(r"^\s+([a-z0-9_&]+):\s*PROGENITOR_LINE\s*,?", text, re.M):
        store(m.group(1), progenitor)
    return out


def load_radial_ids() -> dict[str, int]:
    text = RADIAL_TS.read_text(encoding="utf-8")
    out: dict[str, int] = {}
    for m in re.finditer(r'"([a-z0-9_&]+)":\s*\[', text):
        wid = m.group(1)
        block = text[m.start() : text.find("]", m.end()) + 1]
        out[wid] = block.count('"name"')
    return out


def is_primary(w: dict) -> bool:
    if w.get("category") not in PRIMARY_CATEGORIES:
        return False
    if w.get("isExalted") or w.get("warframeId"):
        return False
    return True


def passive_for(w: dict, passives: dict[str, str]) -> str | None:
    if w.get("passive"):
        return w["passive"]
    return passives.get(w["id"])


def hints_alt_aoe(passive: str) -> bool:
    low = passive.lower()
    return any(h in low for h in ALT_AOE_HINTS)


def passive_corrupted(passive: str) -> bool:
    return any(a in passive for a in PASSIVE_WIKI_ARTIFACTS)


def audit() -> int:
    weapons = load_weapons()
    passives = load_passives()
    radial = load_radial_ids()
    pool = [w for w in weapons if is_primary(w)]

    print("=== Primary weapon audit ===\n")
    print(f"Pool size: {len(pool)}")
    print(f"By category: {dict(__import__('collections').Counter(w['category'] for w in pool))}")

    missing_stats: list[str] = []
    zero_damage: list[str] = []
    for w in pool:
        wid = w["id"]
        missing = [k for k in REQUIRED_STATS if k not in w or w[k] is None]
        if missing:
            missing_stats.append(f"{wid}: missing {missing}")
        if w.get("damage", 0) <= 0:
            zero_damage.append(wid)

    print(f"\nMissing required stat fields: {len(missing_stats)}")
    for line in sorted(missing_stats)[:25]:
        print(f"  {line}")
    if len(missing_stats) > 25:
        print(f"  ... +{len(missing_stats) - 25}")

    if zero_damage:
        print(f"\nZero damage: {len(zero_damage)}")
        for wid in sorted(zero_damage):
            print(f"  {wid}")

    no_passive = [w for w in pool if not passive_for(w, passives)]
    print(f"\nMissing passive: {len(no_passive)}")
    for w in sorted(no_passive, key=lambda x: x["name"]):
        print(f"  {w['id']}: {w['name']}")

    corrupted = [
        w for w in pool
        if (p := passive_for(w, passives)) and passive_corrupted(p)
    ]
    print(f"\nCorrupted passive text (wiki markup): {len(corrupted)}")
    for w in sorted(corrupted, key=lambda x: x["name"]):
        print(f"  {w['id']}")

    with_radial = [w for w in pool if w["id"] in radial or w.get("radialAttacks")]
    print(f"\nRadial/AoE profiles: {len(with_radial)}/{len(pool)}")

    alt_hint_no_radial = []
    for w in pool:
        p = passive_for(w, passives)
        if not p or not hints_alt_aoe(p):
            continue
        if w["id"] not in radial and not w.get("radialAttacks"):
            alt_hint_no_radial.append(w)

    print(f"\nPassive hints alt-fire/AoE but no radial profile: {len(alt_hint_no_radial)}")
    for w in sorted(alt_hint_no_radial, key=lambda x: x["name"])[:40]:
        print(f"  {w['id']}: {w['name']}")
    if len(alt_hint_no_radial) > 40:
        print(f"  ... +{len(alt_hint_no_radial) - 40}")

    radial_no_hint = [
        w for w in pool
        if w["id"] in radial
        and not (p := passive_for(w, passives) or "")
        or (w["id"] in radial and p and not hints_alt_aoe(p))
    ]
    # radial without passive mention — informational only
    radial_only = [
        w for w in pool
        if w["id"] in radial
        and not ((p := passive_for(w, passives)) and hints_alt_aoe(p))
    ]
    print(f"\nRadial profile without alt/AoE passive mention: {len(radial_only)} (may be incarnon/slam)")

    issues = len(missing_stats) + len(zero_damage) + len(corrupted)
    print(f"\n--- Summary ---")
    print(f"  With passive: {len(pool) - len(no_passive)}/{len(pool)}")
    print(f"  With radial/AoE data: {len(with_radial)}/{len(pool)}")
    print(f"  Actionable issues (stats/corruption): {issues}")
    return issues


if __name__ == "__main__":
    sys.exit(1 if audit() else 0)
