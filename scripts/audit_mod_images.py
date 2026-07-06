#!/usr/bin/env python3
"""Audit mod display names vs local PNG filenames in public/images/mods."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
MODS_DIR = ROOT / "public/images/mods"

MOD_IMAGE_STEM_BY_NAME = {
    "Endless Lull": "Endless_Lullaby",
    "Flame Claws": "Heated_Charge",
    "Frost Claws": "Chilling_Claws",
    "Looters": "Looter",
    "ReactivStorm": "Reactive_Storm",
}
MOD_STEM_SMALL_WORDS = {"of", "the", "and"}


def load_mods() -> list[dict]:
    text = MODS_TS.read_text(encoding="utf-8")
    return json.loads(re.search(r"export const allMods: Mod\[\] = (\[[\s\S]*?\n\]);", text).group(1))


def mod_png_stem(name: str) -> str:
    if name in MOD_IMAGE_STEM_BY_NAME:
        return MOD_IMAGE_STEM_BY_NAME[name]

    set_bonus = re.match(r"^(\w+) Set Bonus$", name)
    if set_bonus:
        return f"{set_bonus.group(1)}setmod"

    riven = re.match(r"^Riven Mod \((.+)\)$", name)
    if riven:
        return f"{riven.group(1).replace(' ', '_')}_Riven_Mod"

    claw = re.match(r"^(.+) \(Claws\)$", name)
    if claw:
        return claw.group(1).replace(" ", "_")

    parts = name.replace(" ", "_").split("_")
    out: list[str] = []
    for index, word in enumerate(parts):
        if not word:
            out.append(word)
            continue
        if index > 0 and word.lower() in MOD_STEM_SMALL_WORDS:
            out.append(word[0].upper() + word[1:].lower())
        elif word == word.upper() and len(word) <= 4:
            out.append(word[0] + word[1:].lower())
        else:
            out.append(word)
    return "_".join(out)


def main() -> int:
    mods = load_mods()
    existing = {p.stem for p in MODS_DIR.glob("*.png")}

    missing = [m for m in mods if mod_png_stem(m["name"]) not in existing]
    naive_missing = [m for m in mods if m["name"].replace(" ", "_") not in existing]

    print("=== Mod image audit ===\n")
    print(f"Mods: {len(mods)} | PNG files: {len(existing)}")
    print(f"Missing with image stem rules: {len(missing)}")
    print(f"Missing with naive space-to-underscore: {len(naive_missing)}")
    print(f"Fixed by stem rules: {len(naive_missing) - len(missing)}\n")

    if missing:
        print("Still missing:")
        for mod in sorted(missing, key=lambda m: m["name"])[:50]:
            print(f"  {mod['name']!r} ({mod['id']}) -> {mod_png_stem(mod['name'])}.png")
        if len(missing) > 50:
            print(f"  ... +{len(missing) - 50} more")

    return len(missing)


if __name__ == "__main__":
    raise SystemExit(main())
