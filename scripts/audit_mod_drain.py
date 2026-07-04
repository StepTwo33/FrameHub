#!/usr/bin/env python3
"""Find mods with suspicious drain (likely stat values copied into drain field)."""

import re
from pathlib import Path

MODS_TS = Path(__file__).resolve().parents[1] / "src" / "data" / "mods.ts"
AURA_IDS = {
    "aura_steel_charge", "aura_energy_siphon", "aura_corrosive_projection",
    "aura_rejuvenation", "aura_enemy_radar", "aura_physique",
    "aura_rifle_amplification", "aura_shotgun_amplification", "aura_pistol_amplification",
    "dead_eye", "aura_infested_impedance", "loot_detector", "aura_shield_disruption",
    "aura_speed_holster", "aura_sprint_boost", "aura_sprint_speed", "aura_looters",
    "aura_emp_auras", "aura_toxin_resistance", "stand_united", "growing_power",
    "brief_respite", "aerodynamic", "power_donation_r5", "combat_discipline", "shepherd",
}


def load_mods() -> list[dict]:
    text = MODS_TS.read_text(encoding="utf-8")
    mods: list[dict] = []
    for chunk in re.split(r"\n  \},\n", text):
        if '"id":' not in chunk:
            continue
        mid = re.search(r'"id":\s*"([^"]+)"', chunk)
        name = re.search(r'"name":\s*"([^"]+)"', chunk)
        drain = re.search(r'"drain":\s*(-?\d+(?:\.\d+)?)', chunk)
        maxrank = re.search(r'"maxRank":\s*(\d+)', chunk)
        cat = re.search(r'"category":\s*"([^"]+)"', chunk)
        if not all([mid, name, drain, maxrank, cat]):
            continue
        stats_block = re.search(r'"stats":\s*\{([^}]*)\}', chunk, re.S)
        stat_vals: list[float] = []
        if stats_block and stats_block.group(1).strip():
            stat_vals = [float(x) for x in re.findall(r":\s*([\d.]+)", stats_block.group(1))]
        mods.append({
            "id": mid.group(1),
            "name": name.group(1),
            "drain": float(drain.group(1)),
            "maxRank": int(maxrank.group(1)),
            "category": cat.group(1),
            "stats": stat_vals,
        })
    return mods


def main() -> None:
    mods = load_mods()
    print(f"Parsed {len(mods)} mods\n")

    # Negative drain (auras)
    neg = [m for m in mods if m["drain"] < 0]
    neg_aura = [m for m in neg if m["id"] in AURA_IDS or m["id"].startswith("aura_")]
    neg_other = [m for m in neg if m not in neg_aura]
    print(f"Negative drain: {len(neg)} total ({len(neg_aura)} known/suspected auras, {len(neg_other)} other)")
    for m in neg_other[:20]:
        print(f"  ! {m['drain']:4} {m['name']} ({m['id']})")

    # High drain augments (almost all augments are 6 at R0)
    aug_high = [
        m for m in mods
        if m["category"] == "augment" and m["drain"] > 9
    ]
    print(f"\nAugments with drain > 9: {len(aug_high)}")
    for m in sorted(aug_high, key=lambda x: -x["drain"]):
        match = m["drain"] in m["stats"]
        print(
            f"  {m['drain']:6.0f} -> should be 6?  {m['name']:35} stats={m['stats']}"
            + ("  **DRAIN=STAT**" if match else "")
        )

    # Other high drain non-aura
    other_high = [
        m for m in mods
        if m["drain"] > 14 and m["category"] != "augment" and m["drain"] > 0
    ]
    print(f"\nNon-augment mods with drain > 14: {len(other_high)}")
    for m in sorted(other_high, key=lambda x: -x["drain"])[:30]:
        print(f"  {m['drain']:6.0f} {m['category']:12} {m['name']} ({m['id']})")


if __name__ == "__main__":
    main()
