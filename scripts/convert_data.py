#!/usr/bin/env python3
"""Convert Dart data files to TypeScript for the Next.js web app."""

import re
import json
import os

DART_DIR = '/home/jason/Documents/testing/overframe-app/lib/data'
TS_DIR = '/home/jason/Documents/testing/overframe-web/src/data'

os.makedirs(TS_DIR, exist_ok=True)

def parse_dart_string(s):
    """Remove quotes from a Dart string."""
    s = s.strip()
    if (s.startswith("'") and s.endswith("'")) or (s.startswith('"') and s.endswith('"')):
        return s[1:-1]
    return s

def parse_dart_map(s):
    """Parse a Dart map literal like {'key': value, ...} into a Python dict."""
    s = s.strip()
    if s == '{}':
        return {}
    # Remove outer braces
    inner = s[1:-1].strip()
    if not inner:
        return {}
    result = {}
    # Match 'key': value pairs
    for m in re.finditer(r"'([^']+)':\s*(-?[\d.]+)", inner):
        key = m.group(1)
        val = float(m.group(2))
        if val == int(val):
            val = int(val)
        result[key] = val
    return result

def parse_dart_list(s):
    """Parse a simple Dart list of strings."""
    s = s.strip()
    if s == '[]' or s == 'const []':
        return []
    items = re.findall(r"'([^']*)'|\"([^\"]*)\"", s)
    return [a or b for a, b in items]

def convert_mods():
    """Convert all mod data files to a single TypeScript file."""
    mod_files = [
        'additional_mods.dart',
        'rifle_mods.dart',
        'pistol_mods.dart',
        'shotgun_mods.dart',
        'melee_mods.dart',
        'warframe_mods.dart',
        'companion_mods.dart',
        'set_mods.dart',
        'augment_mods.dart',
        'stance_mods.dart',
    ]
    
    all_mods = []
    seen_ids = set()
    
    for filename in mod_files:
        filepath = os.path.join(DART_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  Skipping {filename} (not found)")
            continue
        
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Match Mod(...) blocks
        pattern = re.compile(
            r'Mod\(\s*'
            r'id:\s*[\'\"]([^\'\"]+)[\'\"]\s*,\s*'
            r'name:\s*[\'\"]([^\'\"]+)[\'\"]\s*,\s*'
            r'(?:category:\s*[\'\"]([^\'\"]+)[\'\"]\s*,\s*)?'
            r'polarity:\s*[\'\"]([^\'\"]+)[\'\"]\s*,\s*'
            r'drain:\s*(-?\d+)\s*,\s*'
            r'maxRank:\s*(\d+)\s*,\s*'
            r'(?:category:\s*[\'\"]([^\'\"]+)[\'\"]\s*,\s*)?'
            r'(?:rarity:\s*[\'\"]([^\'\"]+)[\'\"]\s*,\s*)?'
            r'stats:\s*(\{[^}]*\})\s*,\s*'
            r'description:\s*(?:\"([^\"]*?)\"|\'([^\']*?)\')',
            re.DOTALL
        )
        
        count = 0
        for m in pattern.finditer(content):
            mod_id = m.group(1)
            if mod_id in seen_ids:
                continue
            seen_ids.add(mod_id)
            
            name = m.group(2)
            category = m.group(3) or m.group(7) or ''
            polarity = m.group(4)
            drain = int(m.group(5))
            max_rank = int(m.group(6))
            rarity = m.group(8) or 'common'
            stats = parse_dart_map(m.group(9))
            desc = m.group(10) or m.group(11) or ''
            
            all_mods.append({
                'id': mod_id,
                'name': name,
                'polarity': polarity,
                'drain': drain,
                'maxRank': max_rank,
                'category': category.lower(),
                'stats': stats,
                'description': desc,
                'rarity': rarity.lower(),
            })
            count += 1
        
        print(f"  {filename}: {count} mods")
    
    # Also try a more flexible pattern for mods where field order varies
    for filename in mod_files:
        filepath = os.path.join(DART_DIR, filename)
        if not os.path.exists(filepath):
            continue
        
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Find all Mod blocks
        blocks = re.findall(r'Mod\((.*?)\)\s*[,;]', content, re.DOTALL)
        for block in blocks:
            id_m = re.search(r"id:\s*'([^']+)'", block)
            if not id_m or id_m.group(1) in seen_ids:
                continue
            
            mod_id = id_m.group(1)
            seen_ids.add(mod_id)
            
            name_m = re.search(r"name:\s*'([^']+)'", block)
            cat_m = re.search(r"category:\s*'([^']+)'", block)
            pol_m = re.search(r"polarity:\s*'([^']+)'", block)
            drain_m = re.search(r"drain:\s*(-?\d+)", block)
            rank_m = re.search(r"maxRank:\s*(\d+)", block)
            rarity_m = re.search(r"rarity:\s*'([^']+)'", block)
            stats_m = re.search(r"stats:\s*(\{[^}]*\})", block)
            desc_m = re.search(r"description:\s*['\"]([^'\"]*)['\"]", block)
            
            if not (name_m and pol_m and stats_m):
                continue
            
            all_mods.append({
                'id': mod_id,
                'name': name_m.group(1),
                'polarity': pol_m.group(1),
                'drain': int(drain_m.group(1)) if drain_m else 0,
                'maxRank': int(rank_m.group(1)) if rank_m else 5,
                'category': cat_m.group(1).lower() if cat_m else '',
                'stats': parse_dart_map(stats_m.group(1)),
                'description': desc_m.group(1) if desc_m else '',
                'rarity': rarity_m.group(1).lower() if rarity_m else 'common',
            })
    
    print(f"\nTotal mods: {len(all_mods)}")
    
    # Write TypeScript
    with open(os.path.join(TS_DIR, 'mods.ts'), 'w') as f:
        f.write('import { Mod } from "@/lib/types";\n\n')
        f.write(f'export const allMods: Mod[] = {json.dumps(all_mods, indent=2)};\n\n')
        f.write('export const modsMap = new Map<string, Mod>(allMods.map(m => [m.id, m]));\n')

def convert_weapons():
    """Convert weapon data files to TypeScript."""
    weapon_files = [
        'rifle_weapons.dart',
        'pistol_weapons.dart',
        'shotgun_weapons.dart',
        'melee_weapons.dart',
        'additional_primary_weapons.dart',
        'additional_secondary_weapons.dart',
        'additional_melee_weapons.dart',
    ]
    
    all_weapons = []
    seen_ids = set()
    
    for filename in weapon_files:
        filepath = os.path.join(DART_DIR, filename)
        if not os.path.exists(filepath):
            print(f"  Skipping {filename} (not found)")
            continue
        
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Find all Weapon blocks
        blocks = re.findall(r'Weapon\((.*?)\)\s*[,;]', content, re.DOTALL)
        count = 0
        for block in blocks:
            id_m = re.search(r"id:\s*'([^']+)'", block)
            if not id_m or id_m.group(1) in seen_ids:
                continue
            
            wid = id_m.group(1)
            seen_ids.add(wid)
            
            def get_str(key, default=''):
                m = re.search(rf"{key}:\s*'([^']+)'", block)
                return m.group(1) if m else default
            
            def get_num(key, default=0):
                m = re.search(rf"{key}:\s*(-?[\d.]+)", block)
                return float(m.group(1)) if m else default
            
            def get_bool(key, default=False):
                m = re.search(rf"{key}:\s*(true|false)", block)
                return m.group(1) == 'true' if m else default
            
            weapon = {
                'id': wid,
                'name': get_str('name'),
                'category': get_str('category'),
                'damage': get_num('damage'),
                'impact': get_num('impact'),
                'puncture': get_num('puncture'),
                'slash': get_num('slash'),
                'fireRate': get_num('fireRate'),
                'criticalChance': get_num('criticalChance'),
                'criticalMultiplier': get_num('criticalMultiplier'),
                'statusChance': get_num('statusChance'),
                'magazine': int(get_num('magazine')),
                'reloadTime': get_num('reloadTime'),
                'multishot': get_num('multishot', 1),
                'triggerType': get_str('triggerType', 'Auto'),
                'modSlots': int(get_num('modSlots', 8)),
                'hasPrimaryArcaneSlot': get_bool('hasPrimaryArcaneSlot'),
                'hasSecondaryArcaneSlot': get_bool('hasSecondaryArcaneSlot'),
                'isIncarnon': get_bool('isIncarnon'),
                'hasRivenSlot': get_bool('hasRivenSlot', True),
            }
            
            all_weapons.append(weapon)
            count += 1
        
        print(f"  {filename}: {count} weapons")
    
    print(f"\nTotal weapons: {len(all_weapons)}")
    
    with open(os.path.join(TS_DIR, 'weapons.ts'), 'w') as f:
        f.write('import { Weapon } from "@/lib/types";\n\n')
        f.write(f'export const allWeapons: Weapon[] = {json.dumps(all_weapons, indent=2)};\n\n')
        f.write('export const weaponsMap = new Map<string, Weapon>(allWeapons.map(w => [w.id, w]));\n')

def convert_warframes():
    """Convert warframe data to TypeScript."""
    filepath = os.path.join(DART_DIR, 'warframes.dart')
    with open(filepath, 'r') as f:
        content = f.read()
    
    warframes = []
    
    # Match WarframeData blocks
    wf_pattern = re.compile(
        r'WarframeData\(\s*'
        r'id:\s*"([^"]+)"\s*,\s*'
        r'name:\s*"([^"]+)"\s*,\s*'
        r'health:\s*([\d.]+)\s*,\s*'
        r'shield:\s*([\d.]+)\s*,\s*'
        r'armor:\s*([\d.]+)\s*,\s*'
        r'energy:\s*([\d.]+)\s*,\s*'
        r'sprintSpeed:\s*([\d.]+)\s*,',
        re.DOTALL
    )
    
    for m in wf_pattern.finditer(content):
        wf = {
            'id': m.group(1),
            'name': m.group(2),
            'health': float(m.group(3)),
            'shield': float(m.group(4)),
            'armor': float(m.group(5)),
            'energy': float(m.group(6)),
            'sprintSpeed': float(m.group(7)),
            'abilities': [],
            'description': '',
            'passive': '',
        }
        
        # Find description and passive after this warframe's data
        pos = m.end()
        # Find the next WarframeData or end of list
        next_wf = wf_pattern.search(content, pos)
        block_end = next_wf.start() if next_wf else len(content)
        block = content[pos:block_end]
        
        # Extract description
        desc_m = re.search(r'description:\s*"([^"]*)"', block)
        if desc_m:
            wf['description'] = desc_m.group(1)
        
        # Extract passive
        pass_m = re.search(r'passive:\s*"([^"]*)"', block)
        if pass_m:
            wf['passive'] = pass_m.group(1)
        
        # Extract abilities
        ability_blocks = re.findall(r'Ability\((.*?)\)\s*,', block, re.DOTALL)
        for ab in ability_blocks:
            ability = {}
            
            name_m = re.search(r'name:\s*"([^"]+)"', ab)
            if name_m:
                ability['name'] = name_m.group(1)
            else:
                continue
            
            cost_m = re.search(r'energyCost:\s*([\d.]+)', ab)
            ability['energyCost'] = float(cost_m.group(1)) if cost_m else 0
            
            desc_m = re.search(r'description:\s*"([^"]*)"', ab)
            ability['description'] = desc_m.group(1) if desc_m else ''
            
            # Optional numeric stats
            for stat in ['damage', 'range', 'duration', 'radius', 'health', 'armor', 'shield', 
                        'damageReduction', 'damageBuff', 'statusChance', 'castTime', 'cooldown']:
                stat_m = re.search(rf'{stat}:\s*([\d.]+)', ab)
                if stat_m:
                    ability[stat] = float(stat_m.group(1))
            
            dt_m = re.search(r'damageType:\s*"([^"]+)"', ab)
            if dt_m:
                ability['damageType'] = dt_m.group(1)
            
            wf['abilities'].append(ability)
        
        warframes.append(wf)
    
    print(f"Total warframes: {len(warframes)}")
    
    with open(os.path.join(TS_DIR, 'warframes.ts'), 'w') as f:
        f.write('import { Warframe } from "@/lib/types";\n\n')
        f.write(f'export const allWarframes: Warframe[] = {json.dumps(warframes, indent=2)};\n\n')
        f.write('export const warframesMap = new Map<string, Warframe>(allWarframes.map(w => [w.id, w]));\n')

def convert_archon_shards():
    """Convert archon shard data to TypeScript."""
    filepath = os.path.join(DART_DIR, 'archon_shards.dart')
    with open(filepath, 'r') as f:
        content = f.read()
    
    shards = []
    blocks = re.findall(r'ArchonShard\((.*?)\)\s*,', content, re.DOTALL)
    
    for block in blocks:
        id_m = re.search(r"id:\s*'([^']+)'", block)
        name_m = re.search(r"name:\s*'([^']+)'", block)
        color_m = re.search(r"color:\s*'([^']+)'", block)
        tier_m = re.search(r"tier:\s*(\d+)", block)
        desc_m = re.search(r"description:\s*'([^']*)'", block)
        coal_m = re.search(r"isCoalescent:\s*(true|false)", block)
        stats_m = re.search(r"statBonuses:\s*\{([^}]*)\}", block)
        
        bonuses = {}
        if stats_m:
            for pm in re.finditer(r"'([^']+)':\s*(-?[\d.]+)", stats_m.group(1)):
                bonuses[pm.group(1)] = float(pm.group(2))
        
        if id_m and name_m:
            shards.append({
                'id': id_m.group(1),
                'name': name_m.group(1),
                'color': color_m.group(1) if color_m else '',
                'tier': int(tier_m.group(1)) if tier_m else 1,
                'statBonuses': bonuses,
                'description': desc_m.group(1) if desc_m else '',
                'isCoalescent': coal_m.group(1) == 'true' if coal_m else False,
            })
    
    print(f"Total archon shards: {len(shards)}")
    
    with open(os.path.join(TS_DIR, 'archon-shards.ts'), 'w') as f:
        f.write('import { ArchonShard } from "@/lib/types";\n\n')
        f.write(f'export const allArchonShards: ArchonShard[] = {json.dumps(shards, indent=2)};\n')

if __name__ == '__main__':
    print("=== Converting Mods ===")
    convert_mods()
    print("\n=== Converting Weapons ===")
    convert_weapons()
    print("\n=== Converting Warframes ===")
    convert_warframes()
    print("\n=== Converting Archon Shards ===")
    convert_archon_shards()
    print("\nDone!")
