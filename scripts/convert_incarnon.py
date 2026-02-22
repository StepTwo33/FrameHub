#!/usr/bin/env python3
"""Convert incarnon_data_complete.dart to TypeScript incarnon data."""

import re
import json

DART_FILE = "/home/jason/Documents/testing/overframe-app/lib/data/incarnon_data_complete.dart"
TS_FILE = "/home/jason/Documents/testing/overframe-web/src/data/incarnon.ts"

def parse_dart():
    with open(DART_FILE, 'r') as f:
        content = f.read()

    # Parse standard perk options for each weapon type
    # We'll extract the tier functions manually since they use weaponType branching
    
    # Parse all IncarnonEvolution entries
    weapons = []
    
    # Match IncarnonEvolution blocks
    evo_pattern = re.compile(
        r"IncarnonEvolution\(\s*"
        r"weaponId:\s*'([^']+)',\s*"
        r"weaponName:\s*'([^']+)',\s*"
        r"challenge:\s*'([^']+)',\s*"
        r"category:\s*'([^']+)',\s*"
        r"compatibleVariants:\s*\[([^\]]*)\],\s*"
        r"forms:\s*\[(.*?)\],\s*"
        r"perks:\s*getStandardEvolutionPerks\('([^']+)',\s*'([^']+)'\)",
        re.DOTALL
    )
    
    for m in evo_pattern.finditer(content):
        weapon_id = m.group(1)
        weapon_name = m.group(2)
        challenge = m.group(3)
        category = m.group(4)
        variants_str = m.group(5).strip()
        forms_str = m.group(6)
        perk_id = m.group(7)
        weapon_type = m.group(8)
        
        # Parse variants
        variants = []
        if variants_str:
            variants = [v.strip().strip("'") for v in variants_str.split(",") if v.strip()]
        
        # Parse forms
        forms = []
        form_pattern = re.compile(
            r"IncarnonForm\(\s*name:\s*'([^']+)',\s*"
            r"damage:\s*([\d.]+),\s*"
            r"fireRate:\s*([\d.]+),\s*"
            r"criticalChance:\s*([\d.]+),\s*"
            r"criticalMultiplier:\s*([\d.]+),\s*"
            r"statusChance:\s*([\d.]+),\s*"
            r"triggerType:\s*'([^']+)'"
            r"(?:,\s*magazine:\s*(\d+))?"
            r"(?:,\s*reloadTime:\s*([\d.]+))?"
            r"(?:,\s*specialMechanics:\s*\{([^}]*)\})?",
            re.DOTALL
        )
        
        for fm in form_pattern.finditer(forms_str):
            form = {
                "name": fm.group(1),
                "damage": float(fm.group(2)),
                "fireRate": float(fm.group(3)),
                "criticalChance": float(fm.group(4)),
                "criticalMultiplier": float(fm.group(5)),
                "statusChance": float(fm.group(6)),
                "triggerType": fm.group(7),
            }
            if fm.group(8):
                form["magazine"] = int(fm.group(8))
            if fm.group(9):
                form["reloadTime"] = float(fm.group(9))
            if fm.group(10):
                # Parse special mechanics
                mechs = {}
                mech_str = fm.group(10)
                for mp in re.finditer(r"'(\w+)':\s*'([^']*)'", mech_str):
                    mechs[mp.group(1)] = mp.group(2)
                if mechs:
                    form["specialMechanics"] = mechs
            forms.append(form)
        
        weapons.append({
            "weaponId": weapon_id,
            "weaponName": weapon_name,
            "challenge": challenge,
            "category": category,
            "compatibleVariants": variants,
            "forms": forms,
            "weaponType": weapon_type,
        })
    
    return weapons

def get_standard_perks(weapon_type):
    """Return standard evolution perks based on weapon type."""
    perks = []
    
    # Tier 1 - always incarnon form unlock
    perks.append({
        "tier": 1, "slot": 0,
        "name": "Incarnon Form",
        "description": "Weakpoint hits charge Incarnon Transmutation. Alt-fire to transform.",
        "statChanges": {}
    })
    
    # Tier 2
    if weapon_type == "melee":
        perks.extend([
            {"tier": 2, "slot": 0, "name": "Rupture Strike", "description": "+50% Status Chance.", "statChanges": {"statusChance": 0.50}},
            {"tier": 2, "slot": 1, "name": "Critical Strike", "description": "+20% Critical Chance.", "statChanges": {"criticalChance": 0.20}},
        ])
    else:
        perks.extend([
            {"tier": 2, "slot": 0, "name": "Ready Retaliation", "description": "+100% Damage when wielding Melee weapon.", "statChanges": {}},
            {"tier": 2, "slot": 1, "name": "Lone Gun", "description": "+60% Damage when no Primary equipped.", "statChanges": {}},
        ])
    
    # Tier 3
    perks.extend([
        {"tier": 3, "slot": 0, "name": "Elemental Excess", "description": "+200% Elemental Damage.", "statChanges": {}},
        {"tier": 3, "slot": 1, "name": "Swift Transformation", "description": "+50% Incarnon Buildup.", "statChanges": {}},
    ])
    
    # Tier 4
    if weapon_type == "melee":
        perks.extend([
            {"tier": 4, "slot": 0, "name": "Extended Strike", "description": "+1.5m Range.", "statChanges": {}},
            {"tier": 4, "slot": 1, "name": "Finishing Touch", "description": "+150% Finisher Damage.", "statChanges": {}},
        ])
    else:
        perks.extend([
            {"tier": 4, "slot": 0, "name": "Long Shot", "description": "+100% Damage Falloff Range.", "statChanges": {}},
            {"tier": 4, "slot": 1, "name": "Status Surge", "description": "+50% Status Chance.", "statChanges": {"statusChance": 0.50}},
        ])
    
    # Tier 5
    perks.extend([
        {"tier": 5, "slot": 0, "name": "Devouring Attrition", "description": "-30% Critical Chance, but Critical Hits deal +2500% Damage.", "statChanges": {"criticalChance": -0.30}},
        {"tier": 5, "slot": 1, "name": "Elemental Flow", "description": "Convert 100% of Physical Damage to Elemental.", "statChanges": {}},
    ])
    
    return perks

def generate_ts(weapons):
    lines = []
    lines.append('// ==========================================================================')
    lines.append('// INCARNON EVOLUTION DATA')
    lines.append('// ==========================================================================')
    lines.append('// Converted from lib/data/incarnon_data_complete.dart')
    lines.append(f'// {len(weapons)} Incarnon weapons with full evolution data')
    lines.append('// ==========================================================================')
    lines.append('')
    lines.append('export interface IncarnonEvolution {')
    lines.append('  tier: number;')
    lines.append('  slot: number;')
    lines.append('  name: string;')
    lines.append('  description: string;')
    lines.append('  statChanges: Record<string, number>;')
    lines.append('}')
    lines.append('')
    lines.append('export interface IncarnonForm {')
    lines.append('  name: string;')
    lines.append('  damage: number;')
    lines.append('  fireRate: number;')
    lines.append('  criticalChance: number;')
    lines.append('  criticalMultiplier: number;')
    lines.append('  statusChance: number;')
    lines.append('  triggerType: string;')
    lines.append('  magazine?: number;')
    lines.append('  reloadTime?: number;')
    lines.append('  specialMechanics?: Record<string, string>;')
    lines.append('}')
    lines.append('')
    lines.append('export interface IncarnonWeaponData {')
    lines.append('  weaponId: string;')
    lines.append('  weaponName: string;')
    lines.append('  challenge: string;')
    lines.append('  category: string;')
    lines.append('  variants?: string[];')
    lines.append('  forms: IncarnonForm[];')
    lines.append('  evolutions: IncarnonEvolution[];')
    lines.append('}')
    lines.append('')
    
    # Collect all weapon IDs for the INCARNON_WEAPON_IDS set
    all_ids = set()
    for w in weapons:
        all_ids.add(w["weaponId"])
        for v in w.get("compatibleVariants", []):
            all_ids.add(v)
    
    lines.append('export const INCARNON_WEAPON_IDS = new Set([')
    sorted_ids = sorted(all_ids)
    for i, wid in enumerate(sorted_ids):
        comma = "," if i < len(sorted_ids) - 1 else ","
        lines.append(f'  "{wid}"{comma}')
    lines.append(']);')
    lines.append('')
    
    lines.append('export const incarnonWeaponData: IncarnonWeaponData[] = [')
    
    for w in weapons:
        perks = get_standard_perks(w["weaponType"])
        lines.append(f'  // {w["weaponName"]} ({w["category"]})')
        lines.append('  {')
        lines.append(f'    weaponId: "{w["weaponId"]}",')
        lines.append(f'    weaponName: "{w["weaponName"]}",')
        lines.append(f'    challenge: "{w["challenge"]}",')
        lines.append(f'    category: "{w["category"]}",')
        if w["compatibleVariants"]:
            variants_str = ", ".join(f'"{v}"' for v in w["compatibleVariants"])
            lines.append(f'    variants: [{variants_str}],')
        lines.append('    forms: [')
        for form in w["forms"]:
            parts = [f'name: "{form["name"]}"']
            parts.append(f'damage: {form["damage"]}')
            parts.append(f'fireRate: {form["fireRate"]}')
            parts.append(f'criticalChance: {form["criticalChance"]}')
            parts.append(f'criticalMultiplier: {form["criticalMultiplier"]}')
            parts.append(f'statusChance: {form["statusChance"]}')
            parts.append(f'triggerType: "{form["triggerType"]}"')
            if "magazine" in form:
                parts.append(f'magazine: {form["magazine"]}')
            if "reloadTime" in form:
                parts.append(f'reloadTime: {form["reloadTime"]}')
            if "specialMechanics" in form:
                mechs = ", ".join(f'{k}: "{v}"' for k, v in form["specialMechanics"].items())
                parts.append(f'specialMechanics: {{ {mechs} }}')
            lines.append(f'      {{ {", ".join(parts)} }},')
        lines.append('    ],')
        lines.append('    evolutions: [')
        for perk in perks:
            sc = json.dumps(perk["statChanges"])
            sc = sc.replace('"', '').replace('{', '{ ').replace('}', ' }')
            if sc.strip() == '{  }':
                sc = '{}'
            lines.append(f'      {{ tier: {perk["tier"]}, slot: {perk["slot"]}, name: "{perk["name"]}", description: "{perk["description"]}", statChanges: {sc} }},')
        lines.append('    ],')
        lines.append('  },')
    
    lines.append('];')
    lines.append('')
    
    # Quick lookup map
    lines.append('// Quick lookup: weapon ID → incarnon data')
    lines.append('export const incarnonDataMap = new Map<string, IncarnonWeaponData>();')
    lines.append('for (const data of incarnonWeaponData) {')
    lines.append('  incarnonDataMap.set(data.weaponId, data);')
    lines.append('  if (data.variants) {')
    lines.append('    for (const v of data.variants) {')
    lines.append('      incarnonDataMap.set(v, data);')
    lines.append('    }')
    lines.append('  }')
    lines.append('}')
    lines.append('')
    
    return '\n'.join(lines)

if __name__ == '__main__':
    weapons = parse_dart()
    print(f"Parsed {len(weapons)} incarnon weapons")
    for w in weapons:
        print(f"  {w['weaponName']} ({w['category']}) - {len(w['forms'])} forms, {len(w.get('compatibleVariants', []))} variants")
    
    ts = generate_ts(weapons)
    with open(TS_FILE, 'w') as f:
        f.write(ts)
    print(f"\nWrote to {TS_FILE}")
