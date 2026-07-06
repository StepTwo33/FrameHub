#!/usr/bin/env python3
"""Passive coverage for secondary weapons vs wiki Weapons/Passives."""
from __future__ import annotations

import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location(
    "audit_passives",
    ROOT / "scripts/audit_weapon_passives.py",
)
ap = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ap)

WEAPONS_TS = ROOT / "src/data/weapons.ts"
PASSIVES_TS = ROOT / "src/data/weapon-passives.ts"
SECONDARY_CATS = {"secondary", "pistol", "dual_pistols"}


def load_secondaries() -> list[dict]:
    text = WEAPONS_TS.read_text(encoding="utf-8")
    weapons = json.loads(
        re.search(r"export const allWeapons: Weapon\[\] = (\[[\s\S]*?\n\]);", text).group(1)
    )
    return [
        w
        for w in weapons
        if w.get("category") in SECONDARY_CATS
        and not w.get("isExalted")
        and not w.get("warframeId")
    ]


def load_passives() -> dict[str, str]:
    text = PASSIVES_TS.read_text(encoding="utf-8")
    out: dict[str, str] = {}
    for m in re.finditer(r'^\s+([a-z0-9_&]+):\s*"((?:[^"\\]|\\.)*)"', text, re.M):
        out[m.group(1)] = m.group(2).replace("\\n", "\n")
    for m in re.finditer(r"^\s+([a-z0-9_&]+):\s*PROGENITOR_LINE\s*,?", text, re.M):
        out[m.group(1)] = "Progenitor bonus: extra elemental damage (typically 25–60% of base damage)."
    return out


def main() -> int:
    pool = load_secondaries()
    passives = load_passives()
    catalog = {w["id"]: w["name"] for w in pool}
    our_keys = load_passives().keys() & catalog.keys()

    try:
        wiki_text = ap.fetch_wiki_wikitext()
        wiki_entries = ap.parse_wiki_weapon_names(wiki_text)
    except Exception as e:
        print(f"Wiki fetch failed: {e}")
        return 1

    wiki_by_id: dict[str, str] = {}
    for _section, name in wiki_entries:
        wid = ap.wiki_name_to_id(name)
        if wid in catalog:
            wiki_by_id[wid] = name

    print("=== Secondary passive audit ===\n")
    print(f"Pool: {len(pool)}")
    print(f"With passive in weapon-passives.ts: {len(our_keys)}/{len(pool)}")

    no_passive = sorted(w["id"] for w in pool if w["id"] not in passives and not w.get("passive"))
    wiki_has_no_ours = sorted(wid for wid in wiki_by_id if wid not in passives)
    ours_not_wiki = sorted(wid for wid in passives if wid in catalog and wid not in wiki_by_id)

    print(f"\nNo passive entry ({len(no_passive)}):")
    for wid in no_passive:
        wiki = "wiki has passive" if wid in wiki_by_id else "no wiki passive"
        print(f"  {wid}: {catalog[wid]} ({wiki})")

    print(f"\nWiki passive but missing from weapon-passives.ts ({len(wiki_has_no_ours)}):")
    for wid in wiki_has_no_ours:
        if wid in no_passive:
            print(f"  {wid}: {wiki_by_id[wid]}")

    print(f"\nOur passive but not on wiki passives page ({len(ours_not_wiki)}):")
    for wid in ours_not_wiki[:15]:
        print(f"  {wid}")
    if len(ours_not_wiki) > 15:
        print(f"  ... +{len(ours_not_wiki) - 15}")

    return len(wiki_has_no_ours)


if __name__ == "__main__":
    sys.exit(1 if main() else 0)
