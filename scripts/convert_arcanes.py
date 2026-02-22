#!/usr/bin/env python3
"""Convert Dart arcane data to TypeScript."""
import re
import json
import os

DART_DIR = os.path.expanduser("~/Documents/testing/overframe-app/lib/data")

def extract_mods(content):
    """Extract Mod(...) blocks from Dart content."""
    mods = []
    pattern = re.compile(r'Mod\(')
    for m in pattern.finditer(content):
        start = m.start()
        paren_start = m.end() - 1
        depth = 0
        i = paren_start
        while i < len(content):
            if content[i] == '(':
                depth += 1
            elif content[i] == ')':
                depth -= 1
                if depth == 0:
                    block = content[paren_start+1:i]
                    mods.append(block)
                    break
            i += 1
    return mods

def parse_mod(block):
    """Parse a Mod block into a dict."""
    mod = {}
    # id
    m = re.search(r"id:\s*'([^']+)'", block)
    if m: mod['id'] = m.group(1)
    # name
    m = re.search(r"name:\s*'([^']+)'", block)
    if m: mod['name'] = m.group(1)
    # category
    m = re.search(r"category:\s*'([^']+)'", block)
    if m: mod['category'] = m.group(1)
    # subCategory
    m = re.search(r"subCategory:\s*'([^']+)'", block)
    if m: mod['subCategory'] = m.group(1)
    # polarity
    m = re.search(r"polarity:\s*'([^']+)'", block)
    if m: mod['polarity'] = m.group(1)
    # drain
    m = re.search(r"drain:\s*(\d+)", block)
    if m: mod['drain'] = int(m.group(1))
    # maxRank
    m = re.search(r"maxRank:\s*(\d+)", block)
    if m: mod['maxRank'] = int(m.group(1))
    # rarity
    m = re.search(r"rarity:\s*'([^']+)'", block)
    if m: mod['rarity'] = m.group(1)
    # description - Dart uses single-quoted strings, some contain literal [\' ... \'] wrappers
    m = re.search(r"description:\s*'((?:[^'\\]|\\.)*)'", block)
    if m:
        desc = m.group(1)
        desc = desc.replace("\\'", "'")  # unescape Dart quotes
    else:
        m = re.search(r'description:\s*"((?:[^"\\]|\\.)*)"', block)
        desc = m.group(1) if m else ''
    # Strip array wrapper if present: ['text', 'text'] -> text text
    desc = desc.strip()
    if desc.startswith('[') and desc.endswith(']'):
        inner = desc[1:-1].strip()
        parts = re.findall(r"'((?:[^'\\]|\\.)*?)'", inner)
        if parts:
            desc = ' '.join(p.replace("\\'", "'").strip() for p in parts if p.strip())
        else:
            desc = inner
    # Clean up
    desc = desc.replace('\\n', ' ').replace('\n', ' ').strip()
    mod['description'] = desc
    # stats
    m = re.search(r"stats:\s*\{([^}]*)\}", block)
    if m:
        stats = {}
        for pair in re.finditer(r"'(\w+)':\s*([\d.]+)", m.group(1)):
            stats[pair.group(1)] = float(pair.group(2))
        mod['stats'] = stats
    else:
        mod['stats'] = {}
    return mod

# Subcategory fixes for additional_arcanes.dart
SUBCATEGORY_FIXES = {
    # Pax arcanes -> kitgun
    'pax_charge': 'kitgun', 'pax_seeker': 'kitgun', 'pax_bolt': 'kitgun', 'pax_soar': 'kitgun',
    # Exodia arcanes -> exodia (zaw)
    'exodia_brave': 'exodia', 'exodia_contagion': 'exodia', 'exodia_epidemic': 'exodia',
    'exodia_force': 'exodia', 'exodia_hunt': 'exodia', 'exodia_might': 'exodia',
    'exodia_triumph': 'exodia', 'exodia_valor': 'exodia',
    # Residual -> kitgun
    'residual_boils': 'kitgun', 'residual_malodor': 'kitgun',
    'residual_shock': 'kitgun', 'residual_vengeance': 'kitgun',
    # Magus -> operator
    'magus_replenish': 'operator', 'magus_vigor': 'operator', 'magus_husk': 'operator',
    'magus_cloud': 'operator', 'magus_cadence': 'operator', 'magus_anomaly': 'operator',
    'magus_lockdown': 'operator', 'magus_elevate': 'operator', 'magus_nourish': 'operator',
    'magus_overload': 'operator', 'magus_melt': 'operator', 'magus_firewall': 'operator',
    'magus_glace': 'operator', 'magus_impulse': 'operator', 'magus_drive': 'operator',
    'magus_accelerant': 'operator', 'magus_destroyer': 'operator',
    # Virtuos -> amp
    'virtuos_strike': 'amp', 'virtuos_fury': 'amp', 'virtuos_ghost': 'amp',
    'virtuos_tempo': 'amp', 'virtuos_trojan': 'amp', 'virtuos_shatter': 'amp',
    'virtuos_surge': 'amp', 'virtuos_shadow': 'amp', 'virtuos_spike': 'amp',
    'virtuos_forge': 'amp', 'virtuos_blast': 'amp',
    # Primary weapon arcanes
    'arcane_primary_merciless': 'primary', 'arcane_primary_deadhead': 'primary',
    'arcane_primary_dexterity': 'primary',
    'primary_merciless': 'primary', 'primary_deadhead': 'primary', 'primary_dexterity': 'primary',
    # Secondary weapon arcanes
    'arcane_secondary_merciless': 'secondary', 'arcane_secondary_deadhead': 'secondary',
    'arcane_secondary_dexterity': 'secondary',
    'secondary_merciless': 'secondary', 'secondary_deadhead': 'secondary', 'secondary_dexterity': 'secondary',
    # Melee arcanes
    'arcane_melee_merciless': 'melee', 'arcane_melee_deadhead': 'melee',
    'arcane_melee_gladiator': 'melee', 'arcane_melee_rage': 'melee',
    'arcane_melee_fortitude': 'melee', 'arcane_melee_animosity': 'melee',
    'melee_merciless': 'melee', 'melee_deadhead': 'melee',
    'melee_gladiator': 'melee', 'melee_rage': 'melee',
    'melee_fortitude': 'melee', 'melee_animosity': 'melee',
}

# Name-based subcategory detection
def fix_subcategory(mod):
    mid = mod.get('id', '')
    sub = mod.get('subCategory', '')
    
    # Use explicit fix table first
    if mid in SUBCATEGORY_FIXES:
        mod['subCategory'] = SUBCATEGORY_FIXES[mid]
        return mod
    
    # Name-based detection for entries with wrong/generic subCategory
    if sub in ('arcane', '', 'evolving', 'magus', 'virtuos'):
        name = mod.get('name', '').lower()
        if name.startswith('pax ') or 'residual' in name:
            mod['subCategory'] = 'kitgun'
        elif name.startswith('exodia '):
            mod['subCategory'] = 'exodia'
        elif name.startswith('magus '):
            mod['subCategory'] = 'operator'
        elif name.startswith('virtuos '):
            mod['subCategory'] = 'amp'
        elif 'primary' in name:
            mod['subCategory'] = 'primary'
        elif 'secondary' in name:
            mod['subCategory'] = 'secondary'
        elif 'melee' in name:
            mod['subCategory'] = 'melee'
        else:
            mod['subCategory'] = 'warframe'  # Default: warframe arcane
    
    return mod

def main():
    all_arcanes = {}
    
    # Read arcanes.dart (well-categorized)
    with open(os.path.join(DART_DIR, "arcanes.dart"), "r") as f:
        content = f.read()
    blocks = extract_mods(content)
    for block in blocks:
        mod = parse_mod(block)
        if not mod.get('id'):
            continue
        # Skip precepts (they're companion mods, not arcanes)
        if mod.get('category') == 'precept':
            continue
        mod['category'] = 'arcane'
        mod = fix_subcategory(mod)
        all_arcanes[mod['id']] = mod
    
    # Read additional_arcanes.dart
    with open(os.path.join(DART_DIR, "additional_arcanes.dart"), "r") as f:
        content = f.read()
    blocks = extract_mods(content)
    for block in blocks:
        mod = parse_mod(block)
        if not mod.get('id'):
            continue
        # Skip generic placeholder
        if mod['id'] == 'arcane' and mod.get('name') == 'Arcane':
            continue
        mod['category'] = 'arcane'
        mod = fix_subcategory(mod)
        # Only add if not already present (arcanes.dart has better data)
        if mod['id'] not in all_arcanes:
            all_arcanes[mod['id']] = mod
    
    arcanes = sorted(all_arcanes.values(), key=lambda x: (x.get('subCategory', ''), x.get('name', '')))
    
    # Count by subCategory
    cats = {}
    for a in arcanes:
        sc = a.get('subCategory', 'unknown')
        cats[sc] = cats.get(sc, 0) + 1
    print(f"  TOTAL ARCANES: {len(arcanes)}")
    for cat, count in sorted(cats.items()):
        print(f"    {cat}: {count}")
    
    # Generate TypeScript
    lines = []
    lines.append('import { Mod } from "@/lib/types";')
    lines.append('')
    lines.append('export const allArcanes: Mod[] = [')
    for a in arcanes:
        stats_str = json.dumps(a.get('stats', {}))
        desc = a.get('description', '').replace('"', '\\"').replace('\n', '\\n')
        lines.append(f'  {{')
        lines.append(f'    id: "{a["id"]}",')
        lines.append(f'    name: "{a["name"]}",')
        lines.append(f'    polarity: "{a.get("polarity", "zenurik")}",')
        lines.append(f'    drain: {a.get("drain", 0)},')
        lines.append(f'    maxRank: {a.get("maxRank", 5)},')
        lines.append(f'    category: "arcane",')
        lines.append(f'    subCategory: "{a.get("subCategory", "warframe")}",')
        lines.append(f'    stats: {stats_str},')
        lines.append(f'    description: "{desc}",')
        lines.append(f'    rarity: "{a.get("rarity", "common")}",')
        lines.append(f'  }},')
    lines.append('];')
    lines.append('')
    lines.append('// Quick lookup maps')
    lines.append('export const arcanesMap = new Map(allArcanes.map(a => [a.id, a]));')
    lines.append('export const warframeArcanes = allArcanes.filter(a => a.subCategory === "warframe");')
    lines.append('export const primaryArcanes = allArcanes.filter(a => a.subCategory === "primary");')
    lines.append('export const secondaryArcanes = allArcanes.filter(a => a.subCategory === "secondary");')
    lines.append('export const meleeArcanes = allArcanes.filter(a => a.subCategory === "melee");')
    lines.append('export const kitgunArcanes = allArcanes.filter(a => a.subCategory === "kitgun");')
    lines.append('export const exodiaArcanes = allArcanes.filter(a => a.subCategory === "exodia");')
    lines.append('export const operatorArcanes = allArcanes.filter(a => a.subCategory === "operator");')
    lines.append('export const ampArcanes = allArcanes.filter(a => a.subCategory === "amp");')
    lines.append('')
    
    out_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "data", "arcanes.ts")
    with open(out_path, "w") as f:
        f.write('\n'.join(lines))
    print(f"  Written to {out_path}")

if __name__ == '__main__':
    main()
