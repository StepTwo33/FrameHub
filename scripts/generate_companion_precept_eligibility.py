#!/usr/bin/env python3
"""Generate src/lib/companion-precept-eligibility.ts from companions + mod names."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMPANIONS_TS = ROOT / "src/data/companions.ts"
MODS_TS = ROOT / "src/data/mods.ts"
OUT = ROOT / "src/lib/companion-precept-eligibility.ts"

# Sentinel precepts equippable on any sentinel.
SENTINEL_UNIVERSAL = {
    "anti_grav_array", "auto_omni", "calculated_shot", "coolant_leak", "crowd_dispersion",
    "detect_vulnerability", "electro_pulse", "energy_generator", "fatal_attraction",
    "guardian", "looter", "martyr_symbiosis", "medi_ray", "melee_prowess_sentinel",
    "molecular_conversion", "negate", "null_audit", "odomedic", "primed_regen", "reawaken",
    "regen", "sacrifice", "scan_matter", "scan_organic", "shield_charger", "stasis_field",
    "target_acquisition", "targeting_receptor", "tease", "thumper", "tractor_beam", "vacuum",
    "vaporize",
}

# Precept mod id -> companion type (family). Non-sentinel families share all precepts within type.
FAMILY: dict[str, str] = {
    # Kubrow
    "dig": "kubrow", "ferocity": "kubrow", "howl": "kubrow", "hunt": "kubrow",
    "neutralize": "kubrow", "protect": "kubrow", "retrieve": "kubrow", "savagery": "kubrow",
    "stalk": "kubrow", "hunt": "kubrow", "trample": "kubrow", "unleashed": "kubrow",
    "volatile_parasite": "kubrow", "helminth_ferocity": "kubrow", "helminth_hunt": "kubrow",
    "scavenge": "kubrow",
    # Kavat
    "cats_eye": "kavat", "charm": "kavat", "draining_bite": "kavat", "fear_sense": "kavat",
    "reflect": "kavat", "transfusion": "kavat", "pounce": "kavat", "sense_danger": "kavat",
    "mischief": "kavat", "proboscis": "kavat", "territorial_aggression_r3": "kavat",
    # MOA
    "anti_grav_grenade": "moa", "hard_engag": "moa", "security_override": "moa",
    "shockwave_actuators": "moa", "shockwave_actuators_r3": "moa", "whiplash_mine": "moa",
    "whiplash_mine_r3": "moa",
    # Hound
    "aerial_prospectus": "hound", "diversified_denial": "hound", "equilibrium_audit": "hound",
    "evasive_denial": "hound", "focused_prospectus": "hound", "reflex_denial": "hound",
    "synergized_prospectus": "hound", "repo_audit": "hound",
    # Predasite
    "acidic_spittle": "predasite", "anabolic_pollination": "predasite", "blast_shield": "predasite",
    "endoparasitic_vector": "predasite", "iatric_mycelium": "predasite", "paralytic_spores": "predasite",
    "meditation": "predasite", "ocular_sentry": "predasite",
    # Vulpaphyla
    "crescent_charge": "vulpaphyla", "crescent_devolution": "vulpaphyla",
    "infectious_bite": "vulpaphyla", "panzer_devolution": "vulpaphyla",
    "sly_devolution": "vulpaphyla", "survival_instinct": "vulpaphyla", "viral_quills": "vulpaphyla",
}


MANUAL_SENTINEL_EXCLUSIVE: dict[str, list[str]] = {
    "botanist": ["oxylus"],
}


def load_companions() -> list[dict]:
    text = COMPANIONS_TS.read_text(encoding="utf-8")
    return json.loads(re.search(r"export const allCompanions: Companion\[\] = (\[[\s\S]*?\n\]);", text).group(1))


def load_mods() -> list[dict]:
    text = MODS_TS.read_text(encoding="utf-8")
    return json.loads(re.search(r"export const allMods: Mod\[\] = (\[[\s\S]*?\n\]);", text).group(1))


def name_to_id(name: str, mods_by_name: dict[str, str]) -> str | None:
    key = name.strip().lower()
    if key in mods_by_name:
        return mods_by_name[key]
    for n, mid in mods_by_name.items():
        if n.startswith(key) or key.startswith(n):
            return mid
    return None


def main() -> None:
    mods = load_mods()
    companions = load_companions()
    mods_by_name = {m["name"].lower(): m["id"] for m in mods}
    precepts = [
        m for m in mods
        if m.get("category") == "companion"
        and m.get("polarity") == "penjaga"
        and m.get("subCategory") != "riven"
        and not m["id"].startswith("historic_")
    ]

    ids_by_type: dict[str, list[str]] = {}
    for c in companions:
        ids_by_type.setdefault(c["type"], []).append(c["id"])

    # Sentinel breed-specific defaults from companion data.
    sentinel_exclusive: dict[str, set[str]] = {}
    for c in companions:
        if c["type"] != "sentinel":
            continue
        precept_str = c.get("precept") or ""
        for part in re.split(r"\s+and\s+|\s*,\s*", precept_str):
            name = part.split(" - ")[0].strip()
            if not name:
                continue
            mid = name_to_id(name, mods_by_name)
            if mid:
                sentinel_exclusive.setdefault(mid, set()).add(c["id"])

    for mid, ids in MANUAL_SENTINEL_EXCLUSIVE.items():
        sentinel_exclusive[mid] = set(ids)

    eligibility: dict[str, list[str]] = {}
    unmapped: list[str] = []

    for m in precepts:
        mid = m["id"]
        fam = FAMILY.get(mid)

        if fam == "sentinel_exclusive":
            if mid in sentinel_exclusive:
                eligibility[mid] = sorted(sentinel_exclusive[mid])
            else:
                unmapped.append(mid)
            continue

        if fam and fam != "sentinel":
            type_ids = ids_by_type.get(fam, [])
            if type_ids:
                eligibility[mid] = sorted(type_ids)
            else:
                unmapped.append(mid)
            continue

        if mid in SENTINEL_UNIVERSAL:
            eligibility[mid] = sorted(ids_by_type.get("sentinel", []))
            continue

        if mid in sentinel_exclusive:
            eligibility[mid] = sorted(sentinel_exclusive[mid])
            continue

        # Infer sentinel breed-specific from subCategory robotic + companion defaults overlap
        if m.get("subCategory") == "robotic":
            eligibility[mid] = sorted(ids_by_type.get("sentinel", []))
            continue

        unmapped.append(mid)

    lines = [
        "/**",
        " * Which companions can equip each penjaga precept in the builder.",
        " * Codex lists all precepts regardless — only the builder filters by this map.",
        " *",
        " * Regenerate: python scripts/generate_companion_precept_eligibility.py",
        " */",
        "",
        'import type { Companion, Mod } from "@/lib/types";',
        'import { isCompanionPrecept } from "@/lib/companion-augment-mods";',
        "",
        "/** Companion ids that may equip each precept mod in the builder. */",
        "export const COMPANION_PRECEPT_COMPANION_IDS: Readonly<Record<string, readonly string[]>> = {",
    ]
    for mid in sorted(eligibility.keys()):
        ids = eligibility[mid]
        lines.append(f'  "{mid}": {json.dumps(ids)},')
    lines.append("} as const;")
    lines.extend([
        "",
        "const preceptCompanionIdSet = new Map<string, ReadonlySet<string>>(",
        "  Object.entries(COMPANION_PRECEPT_COMPANION_IDS).map(([id, ids]) => [id, new Set(ids)]),",
        ");",
        "",
        "/** True when a penjaga precept can be equipped on this companion in the builder. */",
        "export function companionPreceptEligibleForCompanion(",
        '  companion: Pick<Companion, "id" | "type">,',
        '  mod: Pick<Mod, "id" | "category" | "polarity">,',
        "): boolean {",
        "  if (!isCompanionPrecept(mod)) return true;",
        "  const allowed = preceptCompanionIdSet.get(mod.id);",
        "  if (!allowed) return true;",
        "  return allowed.has(companion.id);",
        "}",
        "",
        "/** Filter companion mods for the builder (excludes ineligible precepts). */",
        "export function companionModEligibleInBuilder(",
        '  companion: Pick<Companion, "id" | "type">,',
        "  mod: Mod,",
        "  subCategories: readonly string[],",
        "): boolean {",
        '  if (mod.category !== "companion") return false;',
        "  if (!companionPreceptEligibleForCompanion(companion, mod)) return false;",
        "  if (preceptCompanionIdSet.has(mod.id)) return true;",
        "  return !mod.subCategory || subCategories.includes(mod.subCategory);",
        "}",
        "",
    ])

    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({len(eligibility)} precepts mapped)")
    if unmapped:
        print(f"UNMAPPED ({len(unmapped)}):")
        for mid in sorted(unmapped):
            m = next(x for x in precepts if x["id"] == mid)
            print(f"  {mid}: {m['name']}")


if __name__ == "__main__":
    main()
