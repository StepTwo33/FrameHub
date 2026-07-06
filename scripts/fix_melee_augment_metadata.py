#!/usr/bin/env python3
"""Fix melee weapon augment metadata and mod-weapon-tags exclusive entries."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
TAGS_TS = ROOT / "src/data/mod-weapon-tags.ts"

# subCategory weapon; warframeId None removes the field
MOD_FIXES: dict[str, dict] = {
    "electromagnetic_shielding": {"subCategory": "weapon", "warframeId": None},
    "burning_hate": {"subCategory": "weapon"},
    "amanata_pressure": {"subCategory": "weapon"},
}

# Stances incorrectly scraped as weapon-exclusive augments.
REMOVE_EXCLUSIVE_IDS = {"atlantis_vulcan", "mafic_rain"}


def fix_mods() -> int:
    text = MODS_TS.read_text(encoding="utf-8")
    mods = json.loads(re.search(r"export const allMods: Mod\[\] = (\[[\s\S]*?\n\]);", text).group(1))
    updated = 0
    for mod in mods:
        fix = MOD_FIXES.get(mod["id"])
        if not fix:
            continue
        for key, val in fix.items():
            if val is None:
                mod.pop(key, None)
            else:
                mod[key] = val
        updated += 1
    prefix = 'import { Mod } from "@/lib/types";\n\nexport const allMods: Mod[] = '
    suffix_m = re.search(r";\s*\nexport const modsMap", text)
    MODS_TS.write_text(prefix + json.dumps(mods, indent=2) + text[suffix_m.start():], encoding="utf-8")
    return updated


def fix_weapon_tags() -> int:
    text = TAGS_TS.read_text(encoding="utf-8")
    m = re.search(
        r"(export const MOD_EXCLUSIVE_WEAPON_IDS[^=]*=\s*\{)([\s\S]*?)(\n\};)",
        text,
    )
    if not m:
        return 0
    block = m.group(2)
    removed = 0
    for mid in REMOVE_EXCLUSIVE_IDS:
        new_block, n = re.subn(rf'\n  "{re.escape(mid)}": \[[^\]]*\],?', "", block)
        if n:
            block = new_block
            removed += 1
    if removed:
        TAGS_TS.write_text(text[: m.start(2)] + block + text[m.end(2) :], encoding="utf-8")
    return removed


def main() -> None:
    n_mods = fix_mods()
    n_tags = fix_weapon_tags()
    print(f"Fixed metadata on {n_mods} melee augments")
    print(f"Removed {n_tags} stance entries from MOD_EXCLUSIVE_WEAPON_IDS")


if __name__ == "__main__":
    main()
