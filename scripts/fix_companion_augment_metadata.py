#!/usr/bin/env python3
"""Fix miscategorized companion-related warframe augments."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"

FIXES: dict[str, dict] = {
    "prismatic_companion": {
        "category": "augment",
        "warframeId": "mirage",
    },
    "repair_dispensary": {
        "stats": {"health": 5.0, "incapacitationTimerReduction": 3.0},
    },
}


def main() -> None:
    text = MODS_TS.read_text(encoding="utf-8")
    mods = json.loads(re.search(r"export const allMods: Mod\[\] = (\[[\s\S]*?\n\]);", text).group(1))
    updated = 0
    for mod in mods:
        fix = FIXES.get(mod["id"])
        if not fix:
            continue
        for key, val in fix.items():
            mod[key] = val
        updated += 1
    prefix = 'import { Mod } from "@/lib/types";\n\nexport const allMods: Mod[] = '
    suffix_m = re.search(r";\s*\nexport const modsMap", text)
    MODS_TS.write_text(prefix + json.dumps(mods, indent=2) + text[suffix_m.start():], encoding="utf-8")
    print(f"Fixed metadata on {updated} companion-related augments")


if __name__ == "__main__":
    main()
