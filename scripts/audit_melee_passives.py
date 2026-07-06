#!/usr/bin/env python3
"""Passive coverage for melee weapons vs wiki Weapons/Passives."""
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
MELEE_CATS = {"melee"}


def load_melee() -> list[dict]:
    text = WEAPONS_TS.read_text(encoding="utf-8")
    weapons = json.loads(
        re.search(r"export const allWeapons: Weapon\[\] = (\[[\s\S]*?\n\]);", text).group(1)
    )
    return [
        w
        for w in weapons
        if w.get("category") in MELEE_CATS
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
    ktc = re.search(
        r"const KUVA_TENET_CODA: Record<string, string> = \{([\s\S]*?)\n\};",
        text,
    )
    if ktc:
        for m in re.finditer(
            r"^\s+([a-z0-9_&]+):\s*(?:`\$\{PROGENITOR_LINE\}([^`]*)`|PROGENITOR_LINE)\s*,?",
            ktc.group(1),
            re.M,
        ):
            extra = m.group(2) or ""
            out[m.group(1)] = (
                "Progenitor bonus: extra elemental damage (typically 25–60% of base damage)."
                + extra
            )
    return out


def main() -> int:
    pool = load_melee()
    passives = load_passives()
    catalog = {w["id"]: w["name"] for w in pool}
    our_keys = set(passives.keys()) & catalog.keys()

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

    print("=== Melee passive audit ===\n")
    print(f"Pool: {len(pool)}")
    print(f"With passive in weapon-passives.ts: {len(our_keys)}/{len(pool)}")

    no_passive = sorted(w["id"] for w in pool if w["id"] not in passives and not w.get("passive"))
    wiki_has_no_ours = sorted(wid for wid in wiki_by_id if wid not in passives)
    ours_not_wiki = sorted(wid for wid in passives if wid in catalog and wid not in wiki_by_id)

    print(f"\nNo passive entry ({len(no_passive)}):")
    for wid in no_passive[:50]:
        wiki = "wiki has passive" if wid in wiki_by_id else "no wiki passive"
        print(f"  {wid}: {catalog[wid]} ({wiki})")
    if len(no_passive) > 50:
        print(f"  ... +{len(no_passive) - 50}")

    print(f"\nWiki passive but missing from weapon-passives.ts ({len(wiki_has_no_ours)}):")
    for wid in wiki_has_no_ours[:40]:
        print(f"  {wid}: {wiki_by_id[wid]}")
    if len(wiki_has_no_ours) > 40:
        print(f"  ... +{len(wiki_has_no_ours) - 40}")

    print(f"\nOur passive not on wiki page ({len(ours_not_wiki)}):")
    for wid in ours_not_wiki[:30]:
        print(f"  {wid}: {catalog[wid]}")
    if len(ours_not_wiki) > 30:
        print(f"  ... +{len(ours_not_wiki) - 30}")

    issues = len(wiki_has_no_ours)
    print(f"\nActionable wiki sync gaps: {issues}")
    return issues


if __name__ == "__main__":
    sys.exit(main())
