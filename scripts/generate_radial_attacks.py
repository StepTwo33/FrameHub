#!/usr/bin/env python3
"""Generate src/data/weapon-radial-attacks.ts from wiki Module:Weapons/data/*."""

from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
OUT = REPO / "src" / "data" / "weapon-radial-attacks.ts"
WEAPONS_TS = REPO / "src" / "data" / "weapons.ts"
SLOTS = ("primary", "secondary", "melee", "archwing", "companion", "modular", "misc")
HEADERS = {"User-Agent": "FrameHub/1.0 (radial attack generator)"}
DAMAGE_KEYS = (
    "impact", "puncture", "slash", "heat", "cold", "toxin", "electricity",
    "radiation", "viral", "corrosive", "blast", "gas", "magnetic", "tau",
)


def slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_")


def fetch_slot(slot: str) -> str:
    page = f"Module:Weapons/data/{slot}"
    params = {"action": "parse", "page": page, "prop": "wikitext", "format": "json"}
    url = "https://wiki.warframe.com/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=180) as r:
        data = json.loads(r.read())
    return data["parse"]["wikitext"]["*"]


def parse_lua_table(text: str) -> dict[str, list[dict]]:
    """Extract weapons with AoE / radial attacks from Lua module text."""
    results: dict[str, list[dict]] = {}
    weapon_pattern = re.compile(r'\["([^"]+)"\]\s*=\s*\{', re.MULTILINE)

    for m in weapon_pattern.finditer(text):
        name = m.group(1)
        start = m.end() - 1
        depth = 0
        i = start
        while i < len(text):
            ch = text[i]
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    block = text[start : i + 1]
                    attacks = extract_aoe_attacks(block)
                    if attacks:
                        wid = slugify(name)
                        results[wid] = attacks
                    break
            i += 1
    return results


def extract_aoe_attacks(block: str) -> list[dict]:
    attacks_match = re.search(r"Attacks\s*=\s*\{", block)
    if not attacks_match:
        return []

    attacks: list[dict] = []
    # Split individual attack tables inside Attacks = { ... },
    attack_blocks = re.findall(
        r"\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}",
        block[attacks_match.end() : block.find("Class", attacks_match.end())],
    )
    for ab in attack_blocks:
        shot_type = re.search(r'ShotType\s*=\s*"([^"]+)"', ab)
        attack_name = re.search(r'AttackName\s*=\s*"([^"]+)"', ab)
        if not shot_type:
            continue
        st = shot_type.group(1)
        an = attack_name.group(1) if attack_name else "Radial Attack"
        if st != "AoE" and "Explosion" not in an and "Radial" not in an:
            continue

        entry: dict = {"name": an}
        dmg = parse_damage(ab)
        entry.update(dmg)
        entry["totalDamage"] = round(sum(dmg.values()), 4)

        range_m = re.search(r"Range\s*=\s*([\d.]+)", ab)
        if range_m:
            entry["radius"] = float(range_m.group(1))

        falloff = re.search(
            r"Falloff\s*=\s*\{[^}]*Reduction\s*=\s*([\d.]+)", ab, re.DOTALL
        )
        if falloff:
            entry["falloffReduction"] = float(falloff.group(1))

        delay = re.search(r"ExplosionDelay\s*=\s*([\d.]+)", ab)
        if delay:
            entry["explosionDelay"] = float(delay.group(1))

        if entry.get("totalDamage", 0) > 0 and entry.get("radius"):
            attacks.append(entry)
    return attacks


def parse_damage(block: str) -> dict[str, float]:
    dmg_match = re.search(r"Damage\s*=\s*\{([^}]+)\}", block)
    if not dmg_match:
        return {}
    out: dict[str, float] = {}
    for key, val in re.findall(r"(\w+)\s*=\s*([\d.]+)", dmg_match.group(1)):
        lk = key.lower()
        if lk in DAMAGE_KEYS or lk == "impact":
            out[lk] = float(val)
    return out


def load_weapon_ids() -> set[str]:
    text = WEAPONS_TS.read_text(encoding="utf-8")
    return set(re.findall(r'"id":\s*"([^"]+)"', text))


def to_ts(data: dict[str, list[dict]]) -> str:
    lines = [
        "/**",
        " * Radial / AoE attack profiles sourced from https://wiki.warframe.com Module:Weapons/data.",
        " * Merged onto weapons in use-data.ts and loadout-stats.ts.",
        " * Regenerate: python scripts/generate_radial_attacks.py",
        " */",
        "",
        "import type { WeaponRadialAttack } from \"@/lib/types\";",
        "",
        "export const WEAPON_RADIAL_ATTACKS: Record<string, WeaponRadialAttack[]> = ",
        json.dumps(data, indent=2),
        ";",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    known_ids = load_weapon_ids()
    merged: dict[str, list[dict]] = {}
    unmatched: list[str] = []

    for slot in SLOTS:
        print(f"Fetching {slot}...")
        text = fetch_slot(slot)
        slot_data = parse_lua_table(text)
        for wid, attacks in slot_data.items():
            if wid in known_ids:
                merged[wid] = attacks
            else:
                unmatched.append(wid)

    OUT.write_text(to_ts(merged), encoding="utf-8")
    print(f"Wrote {len(merged)} weapons with radial attacks to {OUT}")
    if unmatched:
        sample = sorted(set(unmatched))[:20]
        print(f"Skipped {len(set(unmatched))} wiki weapons not in weapons.ts (sample: {sample})")


if __name__ == "__main__":
    main()
