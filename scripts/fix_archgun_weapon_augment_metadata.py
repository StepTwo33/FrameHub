#!/usr/bin/env python3
"""Fix archgun weapon-augment metadata and miscategorized archgun pool entries."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
TAGS_TS = ROOT / "src/data/mod-weapon-tags.ts"
ARCHGUN_BEHAVIOR = ROOT / "src/data/mod-behaviors/batches/archgun.ts"
GENERAL_BEHAVIOR = ROOT / "src/data/mod-behaviors/batches/general.ts"

# Conclave polearm stance mis-tagged as archgun (wiki Type = Polearms).
MOD_FIXES: dict[str, dict] = {
    "argent_scourge": {"category": "general"},
}

REMOVE_COMPAT_TAGS = {"argent_scourge"}


def fix_mods() -> int:
    text = MODS_TS.read_text(encoding="utf-8")
    mods = json.loads(re.search(r"export const allMods: Mod\[\] = (\[[\s\S]*?\n\]);", text).group(1))
    updated = 0
    for mod in mods:
        fix = MOD_FIXES.get(mod["id"])
        if not fix:
            continue
        for key, val in fix.items():
            mod[key] = val
        updated += 1
    prefix = 'import { Mod } from "@/lib/types";\n\nexport const allMods: Mod[] = '
    suffix_m = re.search(r";\s*\nexport const modsMap", text)
    MODS_TS.write_text(prefix + json.dumps(mods, indent=2) + text[suffix_m.start():], encoding="utf-8")
    return updated


def fix_weapon_tags() -> int:
    text = TAGS_TS.read_text(encoding="utf-8")
    removed = 0
    for mid in REMOVE_COMPAT_TAGS:
        pattern = rf'\n  "{re.escape(mid)}": \[[^\]]*\],?'
        new_text, n = re.subn(pattern, "", text)
        if n:
            text = new_text
            removed += 1
    if removed:
        TAGS_TS.write_text(text, encoding="utf-8")
    return removed


def move_behavior() -> bool:
    arch_text = ARCHGUN_BEHAVIOR.read_text(encoding="utf-8")
    m = re.search(
        r"  argent_scourge: mod\(\"argent_scourge\", \[\], \"[^\"]*\"\),\n",
        arch_text,
    )
    if not m:
        return False
    entry = m.group(0)
    arch_text = arch_text.replace(entry, "")
    ARCHGUN_BEHAVIOR.write_text(arch_text, encoding="utf-8")

    general_text = GENERAL_BEHAVIOR.read_text(encoding="utf-8")
    if "argent_scourge:" in general_text:
        return True
    insert_at = general_text.find("  atlantis_vulcan:")
    if insert_at == -1:
        insert_at = general_text.find("export const MOD_BEHAVIORS_GENERAL")
    if insert_at == -1:
        return False
    general_text = general_text[:insert_at] + entry + general_text[insert_at:]
    GENERAL_BEHAVIOR.write_text(general_text, encoding="utf-8")
    return True


def main() -> None:
    n_mods = fix_mods()
    n_tags = fix_weapon_tags()
    moved = move_behavior()
    print(f"Recategorized {n_mods} miscategorized archgun mods")
    print(f"Removed {n_tags} wrong MOD_COMPATIBILITY_TAGS entries")
    print(f"Moved argent_scourge behavior to general batch: {moved}")


if __name__ == "__main__":
    main()
