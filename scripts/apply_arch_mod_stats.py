#!/usr/bin/env python3
"""Fill/fix archgun and archmelee mod stats."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"

STATS_BY_ID: dict[str, dict[str, float]] = {
    "astral_cut": {"slashSize": 20.0},
    "archgun_ace": {
        "fireRate": 8.333333,
        "reloadSpeed": 16.666667,
        "duration": 1.5,
    },
}


def main() -> None:
    text = MODS_TS.read_text(encoding="utf-8")
    mods = json.loads(re.search(r"export const allMods: Mod\[\] = (\[[\s\S]*?\n\]);", text).group(1))
    updated = 0
    for mod in mods:
        stats = STATS_BY_ID.get(mod["id"])
        if not stats:
            continue
        mod["stats"] = stats
        updated += 1
    prefix = 'import { Mod } from "@/lib/types";\n\nexport const allMods: Mod[] = '
    suffix_m = re.search(r";\s*\nexport const modsMap", text)
    MODS_TS.write_text(prefix + json.dumps(mods, indent=2) + text[suffix_m.start():], encoding="utf-8")
    print(f"Updated stats on {updated} archgun/archmelee mods")


if __name__ == "__main__":
    main()
