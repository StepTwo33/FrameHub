#!/usr/bin/env python3
"""Fill warframe ability augment stats (per-rank increments)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"

# per-rank increments; total at max rank = value * (maxRank + 1)
STATS_BY_ID: dict[str, dict[str, float]] = {
    "discharge_strike": {"energyLeech": 6.25},
    "divebomb_vortex": {"range": 3.0},
    "firequake": {"knockdownChance": 25.0},
    "funnel_clouds": {"abilityProjectileCount": 2.0},
    "hallowed_eruption": {"abilityDuration": 50.0},
    "immolated_radiance": {"damageReduction": 12.5},
    "insatiable": {"mutationStackChance": 15.0},
    "jet_stream": {"sprintSpeed": 10.0, "flightSpeed": 25.0},
    "sapping_reach": {"energyLeech": 6.25},
    "shattered_storm": {"abilityStrength": 25.0},
    "ward_recovery": {"abilityEfficiency": 12.5},
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
    print(f"Updated stats on {updated} warframe augments")


if __name__ == "__main__":
    main()
