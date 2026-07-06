#!/usr/bin/env python3
"""Regenerate all mod behavior batch files."""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
cats = [
    "general", "augment", "warframe", "companion", "primary", "melee", "secondary",
    "operator", "stance", "archgun", "necramech", "kdrive", "tektolyst", "pistol",
    "archmelee", "companion_weapon", "shotgun", "archwing", "rifle", "set", "evolution",
]
script = ROOT / "scripts/generate_mod_behavior_batch.py"
for cat in cats:
    subprocess.run(["python", str(script), cat], check=True)
