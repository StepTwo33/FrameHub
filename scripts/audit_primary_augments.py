#!/usr/bin/env python3
"""Audit primary weapon-exclusive augments: behaviors, stats, wiki sync, metadata."""
from __future__ import annotations

import importlib.util
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
TAGS_TS = ROOT / "src/data/mod-weapon-tags.ts"
WEAPONS_TS = ROOT / "src/data/weapons.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"

PRIMARY_CATEGORIES = {"primary", "rifle", "shotgun", "bow", "launcher"}

MOD_ALIASES: dict[str, str] = {}


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")


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


def load_weapons() -> list[dict]:
    text = WEAPONS_TS.read_text(encoding="utf-8")
    return json.loads(re.search(r"export const allWeapons: Weapon\[\] = (\[[\s\S]*?\n\]);", text).group(1))


def load_exclusive() -> dict[str, list[str]]:
    text = TAGS_TS.read_text(encoding="utf-8")
    m = re.search(r"export const MOD_EXCLUSIVE_WEAPON_IDS[^=]*=\s*\{([\s\S]*?)\n\};", text)
    if not m:
        return {}
    out: dict[str, list[str]] = {}
    for match in re.finditer(r'"([a-z0-9_]+)":\s*(\[[^\]]*\])', m.group(1)):
        out[match.group(1)] = json.loads(match.group(2))
    return out


def load_behaviors() -> dict[str, dict]:
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


def load_wiki() -> dict[str, dict]:
    path = ROOT / "scripts/_parse_wiki_mod_tags.py"
    spec = importlib.util.spec_from_file_location("p", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.load_wiki_mod_tags()


def wiki_entry(wiki: dict, mod: dict) -> dict | None:
    keys = [
        MOD_ALIASES.get(mod["id"], ""),
        mod["name"].lower(),
        slug(mod["name"]),
    ]
    for key in keys:
        if key and key in wiki:
            return wiki[key]
    return None


def resolve_weapon_ids(wiki_type: str, weapons: list[dict]) -> list[str]:
    key = wiki_type.lower().strip()
    ids: set[str] = set()
    for w in weapons:
        if w["name"].lower() == key:
            ids.add(w["id"])
    base = slug(wiki_type)
    for w in weapons:
        wid = w["id"]
        if wid == base or wid.startswith(base + "_"):
            ids.add(wid)
    return sorted(ids)


def mod_slot_for_weapon_category(category: str) -> str | None:
    cat = category.lower()
    if cat in PRIMARY_CATEGORIES:
        return "primary"
    if cat in {"pistol", "secondary", "dual_pistols"}:
        return "secondary"
    if cat in {"melee", "archmelee", "zaw_strike"}:
        return "melee"
    if cat == "archgun":
        return "archgun"
    return None


def is_warframe_ability_augment(m: dict, exclusive: dict[str, list[str]]) -> bool:
    if m["category"] != "augment":
        return False
    if m.get("subCategory") == "weapon":
        return False
    if m["id"] in exclusive:
        return False
    return bool(m.get("warframeId"))


def is_weapon_augment(m: dict, exclusive: dict[str, list[str]], wiki: dict) -> bool:
    if is_warframe_ability_augment(m, exclusive):
        return False
    if m.get("subCategory") == "weapon":
        return True
    if m["id"] in exclusive:
        entry = wiki_entry(wiki, m)
        if entry and entry.get("isWeaponAugment"):
            return True
    entry = wiki_entry(wiki, m)
    return bool(entry and entry.get("isWeaponAugment"))


def weapon_ids_for_augment(
    m: dict,
    exclusive: dict[str, list[str]],
    wiki: dict,
    weapons: list[dict],
) -> list[str]:
    if m["id"] in exclusive:
        return exclusive[m["id"]]
    entry = wiki_entry(wiki, m)
    if entry and entry.get("wikiType"):
        return resolve_weapon_ids(entry["wikiType"], weapons)
    return []


def is_primary_exclusive_mod(mod_id: str, exclusive: dict[str, list[str]], primary_ids: set[str]) -> bool:
    wids = exclusive.get(mod_id, [])
    return any(w in primary_ids for w in wids)


def is_primary_weapon_augment(
    m: dict,
    exclusive: dict[str, list[str]],
    wiki: dict,
    weapons: list[dict],
    weapon_cat: dict[str, str],
    primary_ids: set[str],
) -> bool:
    """Wiki/classified weapon augments for primary weapons."""
    if not is_weapon_augment(m, exclusive, wiki):
        return False
    wids = weapon_ids_for_augment(m, exclusive, wiki, weapons)
    if wids:
        cats = {weapon_cat.get(wid) for wid in wids}
        cats.discard(None)
        if cats and cats <= PRIMARY_CATEGORIES:
            return True
        if cats and not cats <= PRIMARY_CATEGORIES:
            return False
    if m.get("subCategory") == "weapon" and m["category"] in PRIMARY_CATEGORIES:
        return True
    entry = wiki_entry(wiki, m)
    if entry:
        wt = (entry.get("wikiType") or "").strip().lower()
        if wt in {"rifle", "shotgun", "bow", "launcher", "primary"}:
            return True
    return False


def main() -> int:
    mods = load_mods()
    weapons = load_weapons()
    weapon_cat = {w["id"]: w["category"] for w in weapons}
    primary_ids = {
        w["id"] for w in weapons
        if w.get("category") in PRIMARY_CATEGORIES and not w.get("isExalted")
    }
    exclusive = load_exclusive()
    behaviors = load_behaviors()
    wiki = load_wiki()

    pool = [
        m for m in mods
        if is_primary_exclusive_mod(m["id"], exclusive, primary_ids)
    ]
    wiki_aug_pool = [
        m for m in mods
        if is_primary_weapon_augment(m, exclusive, wiki, weapons, weapon_cat, primary_ids)
    ]

    print("=== Primary weapon-exclusive augment audit ===\n")
    print(f"Primary weapons in catalog: {len(primary_ids)}")
    print(f"Exclusive primary mod pool: {len(pool)}")
    print(f"Wiki/classified weapon augments (subset): {len(wiki_aug_pool)}")
    if pool:
        print(f"By category: {dict(Counter(m['category'] for m in pool))}")
        print(f"subCategory weapon: {sum(1 for m in pool if m.get('subCategory') == 'weapon')}")

    wiki_primary_augments = 0
    for m in mods:
        entry = wiki_entry(wiki, m)
        if not entry or not entry.get("isWeaponAugment"):
            continue
        wtype = (entry.get("wikiType") or "").strip()
        wids = resolve_weapon_ids(wtype, weapons) if wtype else []
        if wids and all(weapon_cat.get(w) in PRIMARY_CATEGORIES for w in wids):
            wiki_primary_augments += 1
    print(f"Wiki IsWeaponAugment entries for primary weapons: {wiki_primary_augments}")

    exclusive_touching = [
        (mod_id, wids)
        for mod_id, wids in exclusive.items()
        if any(w in primary_ids for w in wids)
    ]
    print(f"MOD_EXCLUSIVE_WEAPON_IDS entries for primaries: {len(exclusive_touching)}")
    for mod_id, wids in sorted(exclusive_touching):
        primary_wids = [w for w in wids if w in primary_ids]
        print(f"  {mod_id}: {primary_wids}")

    missing_behavior = [m for m in pool if m["id"] not in behaviors]
    print(f"\nBehavior coverage: {len(pool) - len(missing_behavior)}/{len(pool)}")
    for m in sorted(missing_behavior, key=lambda x: x["name"]):
        print(f"  MISSING: {m['id']} ({m['name']})")

    no_stats = [m for m in pool if not m["stats"] and m.get("maxRank", 0) > 0]
    print(f"\nEmpty stats (ranked): {len(no_stats)}")
    for m in sorted(no_stats, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['name']}")

    desc_only_with_stats: list[str] = []
    stats_no_lines: list[str] = []
    for m in pool:
        beh = behaviors.get(m["id"])
        if not beh:
            continue
        catalog_stats = set(m["stats"].keys())
        if beh["descriptionOnly"] and catalog_stats:
            desc_only_with_stats.append(f"{m['id']}: {sorted(catalog_stats)}")
        missing = catalog_stats - set(beh["statKeys"])
        if missing and not beh["descriptionOnly"]:
            stats_no_lines.append(f"{m['id']}: missing {sorted(missing)}")

    print(f"\nDescription-only behaviors with catalog stats: {len(desc_only_with_stats)}")
    for line in sorted(desc_only_with_stats):
        print(f"  {line}")

    print(f"\nCatalog stats missing behavior lines: {len(stats_no_lines)}")
    for line in sorted(stats_no_lines):
        print(f"  {line}")

    wrong_slot: list[str] = []
    for mod_id, wids in exclusive.items():
        if mod_id not in {m["id"] for m in pool}:
            continue
        for wid in wids:
            if wid not in primary_ids:
                continue
            slot = mod_slot_for_weapon_category(weapon_cat.get(wid, ""))
            if slot != "primary":
                wrong_slot.append(f"{mod_id} -> {wid} ({weapon_cat.get(wid, '?')})")

    not_in_exclusive = [
        m for m in pool
        if m["id"] not in exclusive and m.get("subCategory") == "weapon"
    ]
    if not_in_exclusive:
        print(f"\nWeapon-tagged augments not in MOD_EXCLUSIVE_WEAPON_IDS ({len(not_in_exclusive)}):")
        for m in sorted(not_in_exclusive, key=lambda x: x["name"]):
            wids = weapon_ids_for_augment(m, exclusive, wiki, weapons)
            print(f"  {m['id']}: weapons={wids}")

    metadata_issues: list[str] = []
    for m in pool:
        if m.get("warframeId"):
            metadata_issues.append(f"{m['id']}: has warframeId={m['warframeId']!r}")
        if m["id"] in exclusive and m.get("subCategory") != "weapon":
            metadata_issues.append(
                f"{m['id']}: exclusive primary mod should have subCategory weapon (has {m.get('subCategory')!r})"
            )

    print(f"\nExclusive entries bound to non-primary weapons: {len(wrong_slot)}")
    for line in sorted(wrong_slot):
        print(f"  {line}")

    print(f"\nMetadata issues: {len(metadata_issues)}")
    for line in sorted(metadata_issues):
        print(f"  {line}")

    issues = (
        len(missing_behavior)
        + len(no_stats)
        + len(stats_no_lines)
        + len(desc_only_with_stats)
        + len(metadata_issues)
        + len(wrong_slot)
    )
    print(f"\n--- Summary: {issues} actionable issues ---")
    return issues


if __name__ == "__main__":
    sys.exit(main())
