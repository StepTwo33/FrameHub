#!/usr/bin/env python3
"""Audit regular primary mods: behaviors, stats vs wiki, weapon-type tags (AoE/beam/etc.)."""
from __future__ import annotations

import importlib.util
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
SLOT_TS = ROOT / "src/lib/mod-slot-categories.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"
WIKI_META = ROOT / "scripts/_mod_wiki_meta.json"

PRIMARY_CATEGORIES = {"primary", "rifle", "shotgun", "bow", "launcher"}

# Wiki internal tags -> builder-facing labels
TAG_LABELS = {
    "POWER_WEAPON": "beam",
    "AOE": "aoe",
    "SINGLESHOT": "single-shot",
    "PROJECTILE": "projectile-only",
    "IMPACTEXPLODE": "impact-explode",
    "DEPLOYABLE": "deployable",
    "SECONDARYSHOTGUN": "secondary-shotgun",
    "MITER": "miter",
    "Vectis": "vectis-only",
}

WEAPON_PROFILE_TAGS = {
    "beam": "POWER_WEAPON",
    "aoe": "AOE",
    "single-shot": "SINGLESHOT",
}


def _load_wiki_tags():
    path = ROOT / "scripts/_parse_wiki_mod_tags.py"
    spec = importlib.util.spec_from_file_location("parse_wiki_mod_tags", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.load_wiki_mod_tags()


def load_set_from_ts(const_name: str) -> set[str]:
    text = SLOT_TS.read_text(encoding="utf-8")
    m = re.search(rf"export const {const_name}[^=]*=\s*new Set\(\[([\s\S]*?)\]\)", text)
    if not m:
        return set()
    return set(re.findall(r'"([a-z0-9_]+)"', m.group(1)))


def load_mods() -> list[dict]:
    text = MODS_TS.read_text(encoding="utf-8")
    mods: list[dict] = []
    for chunk in re.split(r"\n  \},\n", text):
        mid = re.search(r'"id":\s*"([^"]+)"', chunk)
        if not mid:
            continue

        def grab(key: str, default: str = "") -> str:
            m = re.search(rf'"{key}":\s*"([^"]*)"', chunk)
            return m.group(1) if m else default

        drain_m = re.search(r'"drain":\s*(-?\d+(?:\.\d+)?)', chunk)
        maxrank_m = re.search(r'"maxRank":\s*(\d+)', chunk)
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
            "drain": float(drain_m.group(1)) if drain_m else 0,
            "maxRank": int(maxrank_m.group(1)) if maxrank_m else 0,
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
            mod_id = m.group(2)
            stats_block = m.group(3)
            stat_keys = re.findall(r'line\("([^"]+)"', stats_block)
            out[mod_id] = {
                "statKeys": stat_keys,
                "descriptionOnly": bool(m.group(4)),
                "file": path.name,
            }
        for m in re.finditer(r'(\w+):\s*mod\("([^"]+)"\s*,\s*\[\s*\]\s*,\s*"([^"]*)"\)', text):
            out[m.group(2)] = {"statKeys": [], "descriptionOnly": True, "file": path.name}
    return out


def find_wiki_entry(wiki: dict[str, dict], mod: dict) -> dict | None:
    for key in (mod["name"].lower(), re.sub(r"_r\d+$", "", mod["id"]).replace("_", " ")):
        if key in wiki:
            return wiki[key]
    slug = re.sub(r"[^a-z0-9]+", "_", mod["name"].lower()).strip("_")
    if slug in {re.sub(r"[^a-z0-9]+", "_", k).strip("_") for k in wiki}:
        for k, v in wiki.items():
            if re.sub(r"[^a-z0-9]+", "_", k).strip("_") == slug:
                return v
    return None


def tag_summary(tags: list[str]) -> str:
    if not tags:
        return "normal"
    labels = []
    for t in tags:
        labels.append(TAG_LABELS.get(t, t.lower()))
    return ", ".join(labels)


def main() -> None:
    mods = load_mods()
    exilus_ids = load_set_from_ts("PRIMARY_WEAPON_EXILUS_MOD_IDS")
    behaviors = load_behavior_map()
    wiki = _load_wiki_tags()
    wiki_meta = json.loads(WIKI_META.read_text(encoding="utf-8")) if WIKI_META.exists() else {}

    pool = [
        m for m in mods
        if m["category"] in PRIMARY_CATEGORIES
        and m["id"] not in exilus_ids
        and m["subCategory"] != "riven"
        and not m["id"].startswith("historic_")
        and m["id"] not in {
            "fass_canticle", "jahu_canticle", "khra_canticle", "lohk_canticle",
            "netra_invocation", "ris_invocation", "vome_invocation", "xata_invocation",
        }
    ]

    print("=== Regular primary mod audit ===\n")
    print(f"Pool size (exilus excluded): {len(pool)}")
    print(f"By category: {dict(Counter(m['category'] for m in pool))}")

    missing_behavior = [m for m in pool if m["id"] not in behaviors]
    print(f"\nBehavior coverage: {len(pool) - len(missing_behavior)}/{len(pool)}")
    for m in sorted(missing_behavior, key=lambda x: x["name"]):
        print(f"  MISSING: {m['id']} ({m['name']})")

    no_stats = [m for m in pool if not m["stats"]]
    print(f"\nEmpty stats (expected for some augments/rivens): {len(no_stats)}")
    for m in sorted(no_stats, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['name']}")

    # Behavior stat keys vs catalog stats
    stat_mismatch: list[str] = []
    desc_only_with_stats: list[str] = []
    stats_no_behavior_line: list[str] = []
    for m in pool:
        beh = behaviors.get(m["id"])
        if not beh:
            continue
        catalog_stats = set(m["stats"].keys())
        beh_stats = set(beh["statKeys"])
        if beh["descriptionOnly"] and catalog_stats:
            desc_only_with_stats.append(f"{m['id']}: catalog has {sorted(catalog_stats)}")
        missing_lines = catalog_stats - beh_stats
        extra_lines = beh_stats - catalog_stats
        if missing_lines and not beh["descriptionOnly"]:
            stats_no_behavior_line.append(
                f"{m['id']}: catalog {sorted(missing_lines)} not in behavior"
            )
        if extra_lines and not beh["descriptionOnly"]:
            stat_mismatch.append(f"{m['id']}: behavior has extra {sorted(extra_lines)}")

    print(f"\nCatalog stats missing behavior lines: {len(stats_no_behavior_line)}")
    for line in stats_no_behavior_line[:20]:
        print(f"  {line}")
    if len(stats_no_behavior_line) > 20:
        print(f"  ... +{len(stats_no_behavior_line) - 20}")

    print(f"\nDescription-only behaviors with catalog stats: {len(desc_only_with_stats)}")
    for line in desc_only_with_stats[:15]:
        print(f"  {line}")
    if len(desc_only_with_stats) > 15:
        print(f"  ... +{len(desc_only_with_stats) - 15}")

    # Wiki weapon-type tags
    tag_buckets: dict[str, list[str]] = defaultdict(list)
    no_wiki: list[str] = []
    for m in pool:
        entry = find_wiki_entry(wiki, m)
        if not entry:
            no_wiki.append(m["id"])
            tag_buckets["normal / unknown"].append(m["id"])
            continue
        inc = entry.get("incompatibilityTags") or []
        comp = entry.get("compatibilityTags") or []
        if comp:
            key = f"requires: {tag_summary(comp)}"
        elif inc:
            key = f"incompatible: {tag_summary(inc)}"
        else:
            key = "normal (no tags)"
        tag_buckets[key].append(m["id"])

    print(f"\nWiki tag coverage: {len(pool) - len(no_wiki)}/{len(pool)} matched")
    if no_wiki:
        print(f"  No wiki match ({len(no_wiki)}): {', '.join(sorted(no_wiki)[:12])}{'...' if len(no_wiki)>12 else ''}")

    print("\nWeapon-type restriction buckets:")
    for key in sorted(tag_buckets.keys()):
        ids = tag_buckets[key]
        print(f"  [{len(ids):3}] {key}")
        if len(ids) <= 6:
            for i in ids:
                name = next(m["name"] for m in pool if m["id"] == i)
                print(f"        {i} — {name}")
        elif key.startswith("incompatible: beam") or key.startswith("incompatible: aoe"):
            for i in sorted(ids)[:8]:
                name = next(m["name"] for m in pool if m["id"] == i)
                print(f"        {i} — {name}")
            if len(ids) > 8:
                print(f"        ... +{len(ids) - 8} more")

    # Weapon-exclusive mods
    tags_ts = (ROOT / "src/data/mod-weapon-tags.ts").read_text(encoding="utf-8")
    ex_block = re.search(
        r"export const MOD_EXCLUSIVE_WEAPON_IDS[^=]*=\s*\{([\s\S]*?)\n\};",
        tags_ts,
    )
    exclusive_block = ex_block.group(1) if ex_block else ""
    exclusive_ids = set(re.findall(r'"([a-z0-9_]+)":\s*\[', exclusive_block))
    pool_exclusive = [m for m in pool if m["id"] in exclusive_ids]
    print(f"\nWeapon-exclusive mods in primary pool: {len(pool_exclusive)}")
    for m in sorted(pool_exclusive, key=lambda x: x["name"])[:20]:
        ex_ids = re.search(rf'"{re.escape(m["id"])}":\s*(\[[^\]]*\])', exclusive_block)
        print(f"  {m['id']}: {m['name']} -> {ex_ids.group(1) if ex_ids else '[]'}")
    if len(pool_exclusive) > 20:
        print(f"  ... +{len(pool_exclusive) - 20}")

    print("\nSpot-check (multishot / beam / AoE / exclusive):")
    checks = [
        "directed_convergence", "split_chamber_r3", "galvanized_chamber", "vigilante_armaments",
        "heavy_caliber", "serration_r3", "primed_shred", "shred",
        "firestorm", "primed_firestorm", "split_flights", "combustion_beam",
        "terminal_velocity", "point_strike_r3", "galvanized_crosshairs",
    ]
    for cid in checks:
        m = next((x for x in mods if x["id"] == cid), None)
        if not m:
            # try without _r3
            base = re.sub(r"_r\d+$", "", cid)
            m = next((x for x in mods if x["id"] == base or x["id"].startswith(base)), None)
        if not m:
            print(f"  {cid}: NOT IN CATALOG")
            continue
        entry = find_wiki_entry(wiki, m)
        inc = entry.get("incompatibilityTags", []) if entry else []
        comp = entry.get("compatibilityTags", []) if entry else []
        beh = behaviors.get(m["id"])
        print(
            f"  {m['id']}: stats={list(m['stats'].keys())} "
            f"wiki_inc={inc or '-'} wiki_req={comp or '-'} "
            f"behavior={'yes' if beh else 'NO'}"
        )


if __name__ == "__main__":
    main()
