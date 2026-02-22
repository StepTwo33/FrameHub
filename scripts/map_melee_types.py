#!/usr/bin/env python3
"""Map melee weapon IDs to their stance types based on weapon names/known data."""
import re, json

# Comprehensive mapping based on Warframe wiki weapon categories
# Format: keyword_in_id_or_name -> stance_type
WEAPON_TYPE_MAP = {
    # Swords (single)
    "skana": "sword", "cronus": "sword", "dakra": "sword", "jaw_sword": "sword",
    "heat_sword": "sword", "plasma_sword": "sword", "pangolin": "sword",
    "broken_war": "sword", "mire": "sword", "ether_sword": "sword",
    "krohkur": "sword", "broken_scepter": "staff",  # Override - actually staff
    
    # Dual Swords
    "dual_skana": "dual_swords", "dual_heat": "dual_swords", "dual_ether": "dual_swords",
    "dual_kama": "dual_swords", "dual_cleavers": "dual_swords", "dual_ichor": "dual_swords",
    "dual_raza": "dual_swords", "dual_keres": "dual_swords", "twin_krohkur": "dual_swords",
    "nami_skyla": "dual_swords", "prisma_dual_cleavers": "dual_swords",
    
    # Heavy Blades
    "galatine": "heavy_blade", "gram": "heavy_blade", "scindo": "heavy_blade",
    "war": "heavy_blade", "paracesis": "heavy_blade", "tatsu": "heavy_blade",
    "pennant": "heavy_blade", "vitrica": "heavy_blade", "sevagoth": "heavy_blade",
    
    # Hammers
    "fragor": "hammer", "jat_kittag": "hammer", "heliocor": "hammer",
    "synoid_heliocor": "hammer", "volnus": "hammer", "arca_titron": "hammer",
    "magistar": "hammer", "sancti_magistar": "hammer", "sibear": "hammer",
    
    # Polearms
    "orthos": "polearm", "bo": "polearm", "guandao": "polearm", "lesion": "polearm",
    "tonbo": "polearm", "cassowar": "polearm", "serro": "polearm", "kesheg": "polearm",
    "pupacyst": "polearm", "amphis": "polearm", "sydon": "polearm", "vaykor_sydon": "polearm",
    "plague_kripath": "polearm", "plague_keewar": "polearm", "dehtat": "polearm",
    "cyath": "polearm", "sepfahn": "polearm", "mewan": "polearm", "balla": "polearm",
    "ooltha": "polearm", "kronsh": "polearm",
    
    # Staves
    "broken_scepter": "staff", "tipedo": "staff", "amphis": "staff",
    "bo": "staff", "mk1_bo": "staff",
    
    # Nikana
    "nikana": "nikana", "dragon_nikana": "nikana", "skiajati": "nikana",
    "tatsu": "two_handed_nikana",
    
    # Two-Handed Nikana
    "pennant": "two_handed_nikana", "vitrica": "two_handed_nikana",
    
    # Rapier
    "destreza": "rapier", "endura": "rapier",
    
    # Daggers
    "karyst": "dagger", "ceramic_dagger": "dagger", "dark_dagger": "dagger",
    "heat_dagger": "dagger", "sheev": "dagger", "rakta_dark_dagger": "dagger",
    "stinging_truth": "dagger", "ceramic_dagger": "dagger",
    
    # Dual Daggers
    "fang": "dual_daggers", "ether_daggers": "dual_daggers", "okina": "dual_daggers",
    "twin_basolk": "dual_daggers",
    
    # Machete
    "machete": "machete", "nami_solo": "machete", "gazal_machete": "machete",
    "kama": "machete", "prova": "machete", "prisma_machete": "machete",
    
    # Scythe
    "hate": "scythe", "reaper": "scythe", "anku": "scythe", "caustacyst": "scythe",
    "ether_reaper": "scythe",
    
    # Whip
    "scoliac": "whip", "atterax": "whip", "lecta": "whip", "secura_lecta": "whip",
    "mios": "blade_whip", "lacera": "blade_whip",
    
    # Blade & Whip
    "jat_kusar": "blade_whip",
    
    # Glaive
    "glaive": "glaive", "kestrel": "glaive", "halikar": "glaive", "orvius": "glaive",
    "pathocyst": "glaive", "falcor": "glaive", "xoris": "glaive", "cerata": "glaive",
    
    # Gunblade
    "sarpa": "gunblade", "redeemer": "gunblade", "stropha": "gunblade",
    "vastilok": "gunblade",
    
    # Tonfa
    "ohma": "tonfa", "telos_boltace": "tonfa", "boltace": "tonfa",
    
    # Nunchaku
    "ninkondi": "nunchaku", "shaku": "nunchaku",
    
    # Sparring
    "obex": "sparring", "kogake": "sparring", "hirudo": "sparring",
    "tekko": "sparring", "furax": "sparring", "mk1_furax": "sparring",
    
    # Fist
    "ankyros": "fist", "furax": "fist", "tekko": "fist",
    
    # Claw
    "venka": "claw", "garuda": "claw", "ripkas": "claw",
    
    # Warfan
    "gunsen": "warfan",
}

# Read our TS weapons file
with open("/home/jason/Documents/testing/overframe-web/src/data/weapons.ts") as f:
    content = f.read()

# Find all melee weapon IDs
melee_re = re.compile(r'"id":\s*"([^"]+)"[^}]*?"category":\s*"melee"', re.DOTALL)
melee_ids = []
for m in melee_re.finditer(content):
    melee_ids.append(m.group(1))

print(f"Total melee weapons in TS: {len(melee_ids)}")

# Map each weapon
mapped = {}
unmapped = []

for wid in melee_ids:
    found = False
    # Try exact match first
    for key, stype in WEAPON_TYPE_MAP.items():
        if wid == key or wid == key + "_prime" or wid == "prisma_" + key or wid == "mk1_" + key:
            mapped[wid] = stype
            found = True
            break
    
    if not found:
        # Try partial match - find best (longest) match
        best_key = None
        best_len = 0
        for key, stype in WEAPON_TYPE_MAP.items():
            if key in wid and len(key) > best_len:
                best_key = key
                best_len = len(key)
        if best_key:
            mapped[wid] = WEAPON_TYPE_MAP[best_key]
            found = True
    
    if not found:
        unmapped.append(wid)

print(f"Mapped: {len(mapped)}, Unmapped: {len(unmapped)}")

# Try to infer unmapped from weapon names in the data
name_re = re.compile(r'"id":\s*"([^"]+)"[^}]*?"name":\s*"([^"]+)"', re.DOTALL)
id_to_name = {}
for m in name_re.finditer(content):
    id_to_name[m.group(1)] = m.group(2)

# Name-based inference for unmapped
name_type_hints = {
    "Nikana": "nikana", "Sword": "sword", "Dagger": "dagger", "Machete": "machete",
    "Glaive": "glaive", "Scythe": "scythe", "Hammer": "hammer", "Staff": "staff",
    "Rapier": "rapier", "Tonfa": "tonfa", "Whip": "whip", "Gunblade": "gunblade",
    "Polearm": "polearm", "Claw": "claw", "Nunchaku": "nunchaku",
}

still_unmapped = []
for wid in unmapped:
    name = id_to_name.get(wid, "")
    found = False
    for hint, stype in name_type_hints.items():
        if hint.lower() in name.lower():
            mapped[wid] = stype
            found = True
            break
    if not found:
        still_unmapped.append(f"{wid} ({name})")

if still_unmapped:
    print(f"\nStill unmapped ({len(still_unmapped)}):")
    for s in still_unmapped:
        print(f"  {s}")

# Count by type
from collections import Counter
c = Counter(mapped.values())
print(f"\nBy type:")
for t, n in sorted(c.items()):
    print(f"  {t}: {n}")

# Output the mapping
with open("/tmp/melee_stance_map.json", "w") as f:
    json.dump(mapped, f, indent=2)
print(f"\nWrote /tmp/melee_stance_map.json ({len(mapped)} entries)")
