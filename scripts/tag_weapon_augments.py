#!/usr/bin/env python3
"""Tag weapon/archwing augments with subCategory so they skip warframeId filtering."""
import json
import re
from pathlib import Path

MODS_TS = Path(__file__).resolve().parent.parent / "src/data/mods.ts"

WEAPON_AUGMENT_IDS = {
    "flux_overdrive", "kinetic_ricochet", "nightwatch_napalm", "spring_loaded_broadhead",
    "tether_grenades", "thermagnetic_shells", "winds_of_purity", "blade_of_truth",
    "hunters_bonesaw", "rift_strike", "static_discharge",
    "vulcan_blitz", "gleaming_blight", "stance_gleaming_talent",
    "amalgam_argonak_metal_auger", "amalgam_daikyu_target_acquired",
    "amalgam_furax_body_count", "amalgam_javlok_magazine_warp", "amalgam_ripkas_true_steel",
}

ARCHWING_AUGMENT_IDS = {"cold_snap", "energy_field", "fomorian_accelerant"}


def main() -> None:
    text = MODS_TS.read_text(encoding="utf-8")
    mods = json.loads(re.search(r"export const allMods: Mod\[\] = (\[[\s\S]*?\n\]);", text).group(1))
    for mod in mods:
        if mod["id"] in WEAPON_AUGMENT_IDS or mod["id"].startswith(("amalgam_", "stance_")):
            mod["subCategory"] = "weapon"
            mod.pop("warframeId", None)
        elif mod["id"] in ARCHWING_AUGMENT_IDS:
            mod["subCategory"] = "archwing"
            mod.pop("warframeId", None)

    prefix = 'import { Mod } from "@/lib/types";\n\nexport const allMods: Mod[] = '
    suffix = text[text.index("export const modsMap") :]
    MODS_TS.write_text(prefix + json.dumps(mods, indent=2) + ";\n" + suffix, encoding="utf-8")
    print("Tagged weapon/archwing augments")


if __name__ == "__main__":
    main()
