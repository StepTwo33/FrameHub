#!/usr/bin/env python3
import re
from pathlib import Path

IDS = [
    "astral_autopsy",
    "astral_cut",
    "astral_slash",
    "blazing_steel",
    "bleeding_edge",
    "cutting_edge",
    "extend",
    "furor",
    "glacial_edge",
    "infectious_injection",
    "ion_infusion",
    "meteor_crash",
    "nebula_bore",
    "poisonous_sting",
    "searing_steel",
    "sudden_impact",
    "tempered_blade",
]

path = Path(__file__).resolve().parents[1] / "src" / "data" / "mods.ts"
text = path.read_text(encoding="utf-8")
for mod_id in IDS:
    pattern = rf'("id": "{mod_id}",.*?"category": )"[^"]+"'
    new_text, n = re.subn(pattern, r'\1"archmelee"', text, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f"WARN {mod_id}: {n} replacements")
    text = new_text
    print(f"OK {mod_id}")
path.write_text(text, encoding="utf-8")
print(f"Updated {len(IDS)} mods to category archmelee")
