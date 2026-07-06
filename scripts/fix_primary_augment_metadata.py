#!/usr/bin/env python3
"""Tag weapon-exclusive primary mods with subCategory weapon for consistent filtering."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
TAGS_TS = ROOT / "src/data/mod-weapon-tags.ts"
WEAPONS_TS = ROOT / "src/data/weapons.ts"

PRIMARY_CATEGORIES = {"primary", "rifle", "shotgun", "bow", "launcher"}


def load_primary_weapon_ids() -> set[str]:
    text = WEAPONS_TS.read_text(encoding="utf-8")
    weapons = json.loads(
        re.search(r"export const allWeapons: Weapon\[\] = (\[[\s\S]*?\n\]);", text).group(1)
    )
    return {
        w["id"]
        for w in weapons
        if w.get("category") in PRIMARY_CATEGORIES and not w.get("isExalted")
    }


def load_exclusive() -> dict[str, list[str]]:
    text = TAGS_TS.read_text(encoding="utf-8")
    m = re.search(r"export const MOD_EXCLUSIVE_WEAPON_IDS[^=]*=\s*\{([\s\S]*?)\n\};", text)
    if not m:
        return {}
    out: dict[str, list[str]] = {}
    for match in re.finditer(r'"([a-z0-9_]+)":\s*(\[[^\]]*\])', m.group(1)):
        out[match.group(1)] = json.loads(match.group(2))
    return out


def main() -> None:
    primary_ids = load_primary_weapon_ids()
    exclusive = load_exclusive()
    primary_exclusive_ids = {
        mod_id
        for mod_id, wids in exclusive.items()
        if any(w in primary_ids for w in wids)
    }

    text = MODS_TS.read_text(encoding="utf-8")
    mods = json.loads(re.search(r"export const allMods: Mod\[\] = (\[[\s\S]*?\n\]);", text).group(1))
    updated: list[str] = []
    for mod in mods:
        if mod["id"] not in primary_exclusive_ids:
            continue
        if mod.get("subCategory") == "weapon":
            continue
        mod["subCategory"] = "weapon"
        mod.pop("warframeId", None)
        updated.append(mod["id"])

    if updated:
        prefix = 'import { Mod } from "@/lib/types";\n\nexport const allMods: Mod[] = '
        suffix_m = re.search(r";\s*\nexport const modsMap", text)
        MODS_TS.write_text(prefix + json.dumps(mods, indent=2) + text[suffix_m.start():], encoding="utf-8")

    print(f"Tagged subCategory weapon on {len(updated)} primary-exclusive mods")
    for mid in sorted(updated):
        print(f"  {mid}")


if __name__ == "__main__":
    main()
