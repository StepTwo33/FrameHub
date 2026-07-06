#!/usr/bin/env python3
"""Audit primary weapon Exilus mods: catalog, stats, behaviors, wiki gaps."""
from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
SLOT_TS = ROOT / "src/lib/mod-slot-categories.ts"
TAGS_TS = ROOT / "src/data/mod-weapon-tags.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"

PRIMARY_CATEGORIES = {"primary", "rifle", "shotgun", "bow", "launcher", "general", "melee"}

# Wiki Category:Exilus_Weapon_Mods — primary bucket from mapping script
WIKI_PRIMARY_NAMES = {
    "Adhesive Blast", "Aerial Ace", "Aero Periphery", "Ambush Optics", "Ammo Drum",
    "Arrow Mutation", "Broad Eye", "Cautious Shot", "Counterbalance", "Fomorian Accelerant",
    "Guided Ordnance", "Gun Glide", "Kinetic Ricochet", "Lock and Load", "Mending Shot",
    "Narrow Barrel", "Overview", "Primed Counterbalance", "Primed Rifle Ammo Mutation",
    "Primed Shotgun Ammo Mutation", "Primed Sniper Ammo Mutation", "Primed Stabilizer",
    "Rifle Ammo Mutation", "Shell Compression", "Shotgun Ammo Mutation",
    "Silent Battery", "Sniper Ammo Mutation", "Sinister Reach", "Stabilizer",
    "Terminal Velocity", "Tether Grenades",
}


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


def load_compat_tags() -> dict[str, list[str]]:
    text = TAGS_TS.read_text(encoding="utf-8")
    m = re.search(r"export const MOD_COMPATIBILITY_TAGS[^=]*=\s*\{([\s\S]*?)\n\};", text)
    if not m:
        return {}
    out: dict[str, list[str]] = {}
    for row in re.finditer(r'"([a-z0-9_]+)":\s*\[([^\]]+)\]', m.group(1)):
        out[row.group(1)] = re.findall(r'"([^"]+)"', row.group(2))
    return out


def wiki_primary_ids(mods_by_name: dict[str, str]) -> set[str]:
    aliases = {
        "shotgun ammo mutation": "ammo_mutation",
        "sinister reach": "sinister_reach",
    }
    ids: set[str] = set()
    for name in WIKI_PRIMARY_NAMES:
        key = name.lower()
        mid = aliases.get(key) or mods_by_name.get(key)
        if not mid:
            slug = re.sub(r"[^a-z0-9]+", "_", key).strip("_")
            mid = slug if slug in mods_by_name.values() else None
        if mid:
            ids.add(mid)
        else:
            print(f"  [wiki map warn] no id for {name}")
    return ids


def stat_behavior_mismatch(mod: dict, behavior: dict) -> list[str]:
    issues: list[str] = []
    stat_keys = set(mod["stats"].keys())
    behavior_keys = set(behavior.get("statKeys", []))
    for sk in stat_keys - behavior_keys:
        if sk in {"ammoPickup"}:
            continue
        issues.append(f"stat {sk!r} in mods.ts but not in behavior")
    for bk in behavior_keys - stat_keys:
        if bk in {"duration", "blastRange", "ammoMaximum", "ammoPickup"}:
            continue
        issues.append(f"behavior stat {bk!r} missing from mods.ts stats")
    return issues


def main() -> None:
    exilus_ids = load_set_from_ts("PRIMARY_WEAPON_EXILUS_MOD_IDS")
    mods = load_mods()
    behaviors = load_behaviors()
    compat = load_compat_tags()
    by_name = {m["name"].lower(): m["id"] for m in mods.values()}

    print("=== Primary weapon Exilus audit ===\n")
    print(f"Pool size (PRIMARY_WEAPON_EXILUS_MOD_IDS): {len(exilus_ids)}")

    wiki_ids = wiki_primary_ids(by_name)
    missing_from_list = sorted(wiki_ids - exilus_ids)
    extra_in_list = sorted(exilus_ids - wiki_ids - {
        # melee exilus also in primary list intentionally
        "directed_convergence", "focused_acceleration", "snap_shot", "soft_hands",
        "tactical_reload_r3", "twitch", "hush_r3", "vile_precision",
    })

    if missing_from_list:
        print(f"\nWiki primary Exilus missing from allowlist ({len(missing_from_list)}):")
        for x in missing_from_list:
            print(f"  {x}: {mods.get(x, {}).get('name', '?')}")

    if extra_in_list:
        print(f"\nIn allowlist but not wiki primary bucket ({len(extra_in_list)}):")
        for x in extra_in_list:
            print(f"  {x}")

    missing_catalog = sorted(exilus_ids - mods.keys())
    if missing_catalog:
        print(f"\nMissing from mods.ts: {missing_catalog}")

    no_behavior: list[str] = []
    desc_only: list[str] = []
    weapon_dps: list[str] = []
    mod_panel: list[str] = []
    no_stats: list[str] = []
    mismatches: list[tuple[str, list[str]]] = []
    beam_only_not_tagged: list[str] = []

    for mid in sorted(exilus_ids):
        m = mods.get(mid)
        if not m:
            continue
        if m["category"] not in PRIMARY_CATEGORIES:
            print(f"  [category] {mid}: {m['category']}")
        if not m["stats"]:
            no_stats.append(mid)
        b = behaviors.get(mid)
        if not b:
            no_behavior.append(mid)
        elif b.get("descriptionOnly") or not b.get("statKeys"):
            desc_only.append(mid)
        else:
            mm = stat_behavior_mismatch(m, b)
            if mm:
                mismatches.append((mid, mm))
            targets = set(b.get("targets", {}).values())
            if "weapon_dps" in targets:
                weapon_dps.append(mid)
            else:
                mod_panel.append(mid)
        if mid in {"sinister_reach", "combustion_beam"} and mid not in compat:
            beam_only_not_tagged.append(mid)

    print(f"\nIn catalog: {len(exilus_ids) - len(missing_catalog)}/{len(exilus_ids)}")
    print(f"With verified behavior: {len(exilus_ids) - len(no_behavior) - len(missing_catalog)}/{len(exilus_ids)}")
    print(f"  weapon_dps: {len(weapon_dps)}")
    print(f"  mod_panel / other: {len(mod_panel)}")
    print(f"  description-only: {len(desc_only)}")

    if no_behavior:
        print(f"\nNo behavior entry ({len(no_behavior)}):")
        for x in no_behavior:
            print(f"  {x}")

    if mismatches:
        print(f"\nStat / behavior mismatches ({len(mismatches)}):")
        for mid, issues in mismatches:
            print(f"  {mid}:")
            for i in issues:
                print(f"    - {i}")

    if no_stats:
        print(f"\nEmpty stats dict ({len(no_stats)}):")
        for x in no_stats:
            print(f"  {x}")

    print("\n--- weapon_dps ---")
    for x in sorted(weapon_dps):
        b = behaviors[x]
        print(f"  {x}: {b['statKeys']} ({b['file']})")

    print("\n--- mod_panel / utility ---")
    for x in sorted(mod_panel):
        b = behaviors.get(x, {})
        print(f"  {x}: {b.get('statKeys', [])} -> {set(b.get('targets', {}).values())}")


if __name__ == "__main__":
    main()
