#!/usr/bin/env python3
"""
Robust Dart → TypeScript data converter for Overframe web.
Reads ALL Dart data files directly, validates output, and reports discrepancies.

Paths (override with env if your checkout layout differs):
  OVERFRAME_TS_DIR   — default: <this-repo>/src/data
  OVERFRAME_DART_DIR — default: <parent-of-repo>/overframe-app/lib/data

Warning: this overwrites generated TS under src/data. Web-only additions that
are not yet in the Dart app (e.g. new patch weapons) must be re-applied or
merged into overframe-app first. Do not run with OVERFRAME_SYNC_DATA=1 on
deploy unless you intend to regenerate from Dart.
"""

import re
import json
import os
import sys

_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_REPO_ROOT = os.path.dirname(_SCRIPT_DIR)


def _default_dart_dir() -> str:
    """Sibling checkout: <parent-of-overframe-web>/overframe-app/lib/data"""
    return os.path.join(os.path.dirname(_REPO_ROOT), "overframe-app", "lib", "data")


# Override with OVERFRAME_DART_DIR / OVERFRAME_TS_DIR when layouts differ from the default.
TS_DIR = os.path.normpath(os.environ.get("OVERFRAME_TS_DIR") or os.path.join(_REPO_ROOT, "src", "data"))
DART_DIR = os.path.normpath(os.environ.get("OVERFRAME_DART_DIR") or _default_dart_dir())
os.makedirs(TS_DIR, exist_ok=True)

errors = []
warnings = []

def warn(msg):
    warnings.append(msg)
    print(f"  WARN: {msg}")

def error(msg):
    errors.append(msg)
    print(f"  ERROR: {msg}")

def read_dart(filename):
    path = os.path.join(DART_DIR, filename)
    if not os.path.exists(path):
        warn(f"File not found: {filename}")
        return None
    with open(path, 'r') as f:
        return f.read()

def extract_blocks(content, class_name):
    """Extract all Constructor(...) blocks from content, handling nested parens."""
    blocks = []
    pattern = re.compile(re.escape(class_name) + r'\(')
    for m in pattern.finditer(content):
        start = m.start()
        paren_start = m.end() - 1  # position of opening (
        depth = 0
        i = paren_start
        while i < len(content):
            if content[i] == '(':
                depth += 1
            elif content[i] == ')':
                depth -= 1
                if depth == 0:
                    blocks.append(content[paren_start+1:i])
                    break
            i += 1
    return blocks

def get_str(block, key, default=''):
    """Extract a string field from a Dart constructor block."""
    # Try double quotes first, then single
    m = re.search(rf"""{key}:\s*"((?:[^"\\]|\\.)*)"\s*""", block)
    if m:
        return m.group(1).replace('\\"', '"').replace("\\'", "'")
    m = re.search(rf"""{key}:\s*'((?:[^'\\]|\\.)*)'\s*""", block)
    if m:
        return m.group(1).replace("\\'", "'").replace('\\"', '"')
    return default

def get_num(block, key, default=0):
    m = re.search(rf'{key}:\s*(-?[\d.]+)', block)
    if m:
        val = float(m.group(1))
        return int(val) if val == int(val) else val
    return default

def get_bool(block, key, default=False):
    m = re.search(rf'{key}:\s*(true|false)', block)
    return m.group(1) == 'true' if m else default

def get_map(block, key):
    """Extract a Dart map like stats: {'key': value, ...}"""
    m = re.search(rf"{key}:\s*\{{([^}}]*)\}}", block)
    if not m:
        return {}
    result = {}
    for pm in re.finditer(r"'([^']+)':\s*(-?[\d.]+)", m.group(1)):
        val = float(pm.group(2))
        result[pm.group(1)] = int(val) if val == int(val) else val
    return result

# ============================================================
# MODS
# ============================================================
def convert_mods():
    print("=== CONVERTING MODS ===")
    mod_files = [
        'rifle_mods.dart', 'pistol_mods.dart', 'shotgun_mods.dart',
        'melee_mods.dart', 'warframe_mods.dart', 'companion_mods.dart',
        'augment_mods.dart', 'set_mods.dart', 'stance_mods.dart',
        'additional_mods.dart',
    ]
    
    all_mods = []
    seen_ids = set()
    
    for filename in mod_files:
        content = read_dart(filename)
        if content is None:
            continue
        
        blocks = extract_blocks(content, 'Mod')
        count = 0
        for block in blocks:
            mod_id = get_str(block, 'id')
            if not mod_id:
                continue
            if mod_id in seen_ids:
                continue
            seen_ids.add(mod_id)
            
            name = get_str(block, 'name')
            if not name:
                warn(f"Mod {mod_id} has no name in {filename}")
                continue
            
            polarity = get_str(block, 'polarity', 'naramon')
            drain = get_num(block, 'drain', 0)
            max_rank = get_num(block, 'maxRank', 5)
            category = get_str(block, 'category', '').lower()
            sub_category = get_str(block, 'subCategory', '').lower()
            rarity = get_str(block, 'rarity', 'common').lower()
            stats = get_map(block, 'stats')
            description = get_str(block, 'description', '')
            
            # Validation
            if max_rank < 0 or max_rank > 10:
                warn(f"Mod {name} ({mod_id}): maxRank={max_rank} seems wrong")
            if drain < -20 or drain > 20:
                warn(f"Mod {name} ({mod_id}): drain={drain} seems wrong")
            
            mod = {
                'id': mod_id,
                'name': name,
                'polarity': polarity,
                'drain': drain,
                'maxRank': max_rank,
                'category': category,
                'subCategory': sub_category,
                'stats': stats,
                'description': description,
                'rarity': rarity,
            }
            all_mods.append(mod)
            count += 1
        
        print(f"  {filename}: {count} mods")
    
    # Remove hallucinated / invalid mods
    HALLUCINATED_MODS = {
        'empowered_auras', 'umbral_set_bonus',
        'archon_shard_crimson', 'archon_shard_amber', 'archon_shard_cyan',
        'empowered_aura',
    }
    HALLUCINATED_NAME_PATTERNS = ['Empowered Aura', 'Umbral Set Bonus']
    # Also remove any mod whose id starts with 'archon_shard'
    before = len(all_mods)
    all_mods = [m for m in all_mods
                if m['id'] not in HALLUCINATED_MODS
                and not m['id'].startswith('archon_shard')
                and m['name'] not in HALLUCINATED_NAME_PATTERNS]
    removed = before - len(all_mods)
    if removed:
        print(f"  Removed {removed} hallucinated/invalid mods")
    
    # Fix known incorrect values from Dart source (verified against in-game data)
    MOD_CORRECTIONS = {
        # Primary
        'split_chamber_r3': {'drain': 7},
        'serration_r3': {'drain': 4, 'maxRank': 10},
        'point_strike_r3': {'drain': 4, 'maxRank': 5},
        'vital_sense_r3': {'drain': 4, 'maxRank': 5},
        'hells_chamber': {'drain': 7},
        # Secondary
        'hornet_strike_r3': {'drain': 4, 'maxRank': 10},
        'barrel_diffusion_r3': {'drain': 6, 'maxRank': 5},
        # Melee
        'pressure_point_r3': {'maxRank': 5, 'stats': {'damage': 20}},
        'condition_overload': {'drain': 4},
        'blood_rush': {'maxRank': 5},
        # Warframe - base mods
        'continuity_r3': {'drain': 4, 'maxRank': 5},
        'intensify_r3': {'maxRank': 5},
        'streamline_r3': {'drain': 4, 'maxRank': 5},
        'stretch_r3': {'maxRank': 5},
        'redirection_r3': {'drain': 4, 'maxRank': 10},
        'vitality_r3': {'drain': 4, 'maxRank': 10},
        'steel_fiber_r3': {'maxRank': 10},
        'flow_r3': {'drain': 4, 'maxRank': 5},
        # Warframe - corrupted mods (negative drain = aura-like)
        'fleeting_expertise_r5': {'drain': -6},
        'narrow_minded': {'drain': -6},
        'blind_rage': {'drain': -6},
        'overextended_r5': {'drain': -6},
        'transient_fortitude': {'drain': -4},
        # Primed mods
        'primed_continuity': {'drain': 6},
        'primed_flow': {'drain': 6},
    }
    corrections_applied = 0
    mod_map_tmp = {m['id']: m for m in all_mods}
    for mod_id, corrections in MOD_CORRECTIONS.items():
        if mod_id in mod_map_tmp:
            for key, val in corrections.items():
                old_val = mod_map_tmp[mod_id].get(key)
                if old_val != val:
                    mod_map_tmp[mod_id][key] = val
                    corrections_applied += 1
                    print(f"  Fixed {mod_map_tmp[mod_id]['name']}: {key} {old_val} -> {val}")
    if corrections_applied:
        print(f"  Applied {corrections_applied} mod corrections")
    
    # Add warframeId to augment mods based on ID pattern
    # Pattern: augment_{warframename}_{modname}
    # Fix known misspellings in Dart source
    AUGMENT_WF_RENAMES = {'ivar': 'ivara'}
    
    # Load warframe IDs for matching
    wf_content = read_dart('warframes.dart')
    wf_blocks = extract_blocks(wf_content, 'WarframeData')
    wf_ids = set()
    for block in wf_blocks:
        wid = get_str(block, 'id')
        if wid: wf_ids.add(wid)
    
    augment_mapped = 0
    for mod in all_mods:
        if mod['category'] != 'augment':
            continue
        rid = mod['id'].replace('augment_', '')
        parts = rid.split('_')
        matched_wf = None
        for length in range(1, len(parts)):
            prefix = '_'.join(parts[:length])
            # Check rename first
            if prefix in AUGMENT_WF_RENAMES:
                prefix = AUGMENT_WF_RENAMES[prefix]
            if prefix in wf_ids:
                matched_wf = prefix
                break
        if matched_wf:
            mod['warframeId'] = matched_wf
            augment_mapped += 1
        elif rid.startswith('universal_'):
            mod['warframeId'] = 'universal'
            augment_mapped += 1
    print(f"  Mapped {augment_mapped}/{len([m for m in all_mods if m['category']=='augment'])} augments to warframes")
    
    print(f"  TOTAL MODS: {len(all_mods)}")
    
    # Write TypeScript
    with open(os.path.join(TS_DIR, 'mods.ts'), 'w') as f:
        f.write('import { Mod } from "@/lib/types";\n\n')
        f.write(f'export const allMods: Mod[] = {json.dumps(all_mods, indent=2)};\n\n')
        f.write('export const modsMap = new Map<string, Mod>(allMods.map(m => [m.id, m]));\n')
    
    return all_mods

# ============================================================
# WEAPONS
# ============================================================
def convert_weapons():
    print("\n=== CONVERTING WEAPONS ===")
    weapon_files = [
        'rifle_weapons.dart', 'pistol_weapons.dart', 'shotgun_weapons.dart',
        'melee_weapons.dart', 'special_weapons.dart', 'exalted_weapons.dart',
        'companion_weapons.dart', 'modular_weapons.dart', 'incarnon_weapons.dart',
        'additional_primary_weapons.dart', 'additional_secondary_weapons.dart',
        'additional_melee_weapons.dart', 'additional_archguns.dart',
        'archwing_data.dart',
    ]
    
    all_weapons = []
    seen_ids = set()
    
    for filename in weapon_files:
        content = read_dart(filename)
        if content is None:
            continue
        
        # Extract both Weapon(...) and ExaltedWeapon(...) and CompanionWeapon(...)
        blocks = []
        for cls in ['Weapon', 'ExaltedWeapon', 'CompanionWeapon']:
            blocks.extend(extract_blocks(content, cls))
        
        count = 0
        for block in blocks:
            wid = get_str(block, 'id')
            if not wid:
                continue
            if wid in seen_ids:
                continue
            seen_ids.add(wid)
            
            name = get_str(block, 'name')
            if not name:
                warn(f"Weapon {wid} has no name in {filename}")
                continue
            
            category = get_str(block, 'category', 'rifle').lower()
            
            weapon = {
                'id': wid,
                'name': name,
                'category': category,
                'damage': get_num(block, 'damage', 0),
                'impact': get_num(block, 'impact', 0),
                'puncture': get_num(block, 'puncture', 0),
                'slash': get_num(block, 'slash', 0),
                'fireRate': get_num(block, 'fireRate', 1),
                'criticalChance': get_num(block, 'criticalChance', 0.1),
                'criticalMultiplier': get_num(block, 'criticalMultiplier', 1.5),
                'statusChance': get_num(block, 'statusChance', 0.1),
                'magazine': int(get_num(block, 'magazine', 30)),
                'reloadTime': get_num(block, 'reloadTime', 2.0),
                'multishot': get_num(block, 'multishot', 1),
                'triggerType': get_str(block, 'triggerType', 'Auto'),
                'modSlots': int(get_num(block, 'modSlots', 8)),
                'hasPrimaryArcaneSlot': get_bool(block, 'hasPrimaryArcaneSlot'),
                'hasSecondaryArcaneSlot': get_bool(block, 'hasSecondaryArcaneSlot'),
                'isIncarnon': get_bool(block, 'isIncarnon'),
                'hasRivenSlot': get_bool(block, 'hasRivenSlot', True),
            }
            
            # Extra fields for exalted weapons
            warframe_id = get_str(block, 'warframeId')
            if warframe_id:
                weapon['warframeId'] = warframe_id
                weapon['abilityName'] = get_str(block, 'abilityName', '')
                weapon['isExalted'] = True
            
            # Extra fields for companion weapons
            companion_type = get_str(block, 'companionType')
            if companion_type:
                weapon['companionType'] = companion_type
                weapon['weaponCategory'] = get_str(block, 'weaponCategory', '')
            
            # Rename hallucinated/incorrect weapon names
            WEAPON_RENAMES = {
                'Feral Kubrow Claws': 'Kubrow Claws',
                'Feral Kavat Claws': 'Kavat Claws',
                'Celeritas': 'Celerita',
            }
            if weapon['name'] in WEAPON_RENAMES:
                weapon['name'] = WEAPON_RENAMES[weapon['name']]
            
            # Remove weapons that don't exist in-game
            HALLUCINATED_WEAPONS = {'prisma_grattler', 'moa_taktis', 'zaw', 'sepfahn', 'kubrow_feral_claws', 'kavat_feral_claws'}
            if wid in HALLUCINATED_WEAPONS:
                continue
            
            # Fix companion weapon stats (Dart source has pre-rework / hallucinated values)
            # All stats verified against https://wiki.warframe.com (Feb 2025)
            WEAPON_STAT_CORRECTIONS = {
                'laser_rifle': {
                    'damage': 45, 'impact': 4.5, 'puncture': 36, 'slash': 4.5,
                    'criticalChance': 0.17, 'criticalMultiplier': 1.75,
                    'statusChance': 0.075, 'fireRate': 5.0,
                    'magazine': 60, 'reloadTime': 1.2,
                },
                'prime_laser_rifle': {
                    'damage': 55, 'impact': 5.5, 'puncture': 38.5, 'slash': 11,
                    'criticalChance': 0.20, 'criticalMultiplier': 2.0,
                    'statusChance': 0.10, 'fireRate': 5.0,
                    'magazine': 60, 'reloadTime': 1.2,
                },
                'sweeper': {
                    'damage': 42, 'impact': 25.2, 'puncture': 4.2, 'slash': 12.6,
                    'criticalChance': 0.05, 'criticalMultiplier': 1.5,
                    'statusChance': 0.14, 'fireRate': 1.17,
                    'magazine': 10, 'reloadTime': 2.3, 'multishot': 3,
                },
                'sweeper_prime': {
                    'damage': 48, 'impact': 28.8, 'puncture': 4.8, 'slash': 14.4,
                    'criticalChance': 0.08, 'criticalMultiplier': 1.6,
                    'statusChance': 0.20, 'fireRate': 1.33,
                    'magazine': 10, 'reloadTime': 2.0, 'multishot': 3,
                },
                'stinger': {
                    'damage': 40, 'impact': 4, 'puncture': 4, 'slash': 4,
                    'criticalChance': 0.05, 'criticalMultiplier': 1.5,
                    'statusChance': 0.20, 'fireRate': 3.33,
                    'magazine': 10, 'reloadTime': 2.0,
                },
                'artax': {
                    'damage': 6, 'impact': 0, 'puncture': 0, 'slash': 0,
                    'criticalChance': 0.05, 'criticalMultiplier': 1.5,
                    'statusChance': 0.30, 'fireRate': 5.0,
                    'magazine': 50, 'reloadTime': 1.0,
                },
                'cryotra': {
                    'damage': 26, 'impact': 0, 'puncture': 0, 'slash': 0,
                    'criticalChance': 0.08, 'criticalMultiplier': 2.0,
                    'statusChance': 0.34, 'fireRate': 12.0,
                    'magazine': 60, 'reloadTime': 2.2,
                },
                'verglas': {
                    'damage': 26, 'impact': 0, 'puncture': 0, 'slash': 0,
                    'criticalChance': 0.08, 'criticalMultiplier': 2.0,
                    'statusChance': 0.34, 'fireRate': 12.0,
                    'magazine': 60, 'reloadTime': 2.2,
                },
                'tazicor': {
                    'damage': 30, 'impact': 3, 'puncture': 24, 'slash': 3,
                    'criticalChance': 0.10, 'criticalMultiplier': 2.0,
                    'statusChance': 0.25, 'fireRate': 1.5,
                    'magazine': 10, 'reloadTime': 2.0,
                },
                'vulklok': {
                    'damage': 85, 'impact': 17, 'puncture': 8.5, 'slash': 59.5,
                    'criticalChance': 0.25, 'criticalMultiplier': 2.5,
                    'statusChance': 0.25, 'fireRate': 0.17,
                    'magazine': 10, 'reloadTime': 2.0,
                },
                'deconstructor': {
                    'damage': 75, 'impact': 7.5, 'puncture': 7.5, 'slash': 60,
                    'criticalChance': 0.10, 'criticalMultiplier': 2.0,
                    'statusChance': 0.15, 'fireRate': 1.33,
                    'magazine': 0, 'reloadTime': 1.0,
                },
                'deconstructor_prime': {
                    'damage': 100, 'impact': 10, 'puncture': 10, 'slash': 80,
                    'criticalChance': 0.15, 'criticalMultiplier': 2.5,
                    'statusChance': 0.20, 'fireRate': 1.33,
                    'magazine': 0, 'reloadTime': 1.0,
                },
            }
            if wid in WEAPON_STAT_CORRECTIONS:
                weapon.update(WEAPON_STAT_CORRECTIONS[wid])
            
            # Flag Incarnon weapons (from wiki.warframe.com/w/Incarnon)
            INCARNON_WEAPON_IDS = {
                # Zariman
                'felarx', 'innodem', 'laetum', 'phenmor', 'praedos',
                # Sanctum Anatomica
                'onos', 'ruvox',
                # Isleweaver
                'thalys',
                # Genesis Primary
                'boar', 'boar_prime', 'boltor', 'telos_boltor', 'boltor_prime',
                'braton', 'mk1_braton', 'braton_prime', 'braton_vandal',
                'burston', 'burston_prime', 'dera', 'dera_vandal', 'dread',
                'gorgon', 'gorgon_wraith', 'prisma_gorgon',
                'latron', 'latron_prime', 'latron_wraith', 'miter',
                'paris', 'mk1_paris', 'paris_prime',
                'soma', 'soma_prime', 'strun', 'mk1_strun', 'strun_prime', 'strun_wraith',
                'sybaris', 'dex_sybaris', 'sybaris_prime', 'torid',
                'vectis', 'vectis_prime',
                # Genesis Secondary
                'angstrum', 'prisma_angstrum', 'atomos', 'ballistica', 'ballistica_prime', 'rakta_ballistica',
                'bronco', 'bronco_prime',
                'cestra', 'despair', 'dual_toxocyst', 'furis', 'mk1_furis',
                'gammacor', 'synoid_gammacor', 'kunai', 'mk1_kunai',
                'lato', 'lato_prime', 'lato_vandal', 'lex', 'lex_prime',
                'sicarus', 'sicarus_prime', 'stug', 'vasto', 'vasto_prime',
                'zylok', 'zylok_prime',
                # Genesis Melee
                'ack_and_brunt', 'anku', 'bo', 'mk1_bo', 'bo_prime',
                'ceramic_dagger', 'destreza', 'destreza_prime', 'dual_ichor', 'furax', 'mk1_furax', 'furax_wraith',
                'hate', 'magistar', 'sancti_magistar', 'nami_solo',
                'obex', 'prisma_obex', 'okina', 'okina_prime', 'sibear', 'skana', 'skana_prime', 'prisma_skana',
            }
            if wid in INCARNON_WEAPON_IDS:
                weapon['isIncarnon'] = True
            
            # Validation
            if weapon['damage'] == 0 and weapon['category'] not in ('amp', 'amp_prism', 'zaw_strike'):
                warn(f"Weapon {name} ({wid}): damage=0")
            
            all_weapons.append(weapon)
            count += 1
        
        print(f"  {filename}: {count} weapons")
    
    # NOTE: Hound/MOA/missing companion weapons are now in src/data/custom-items.ts
    # with wiki-verified stats. No more hallucinated weapons here.
    
    print(f"  TOTAL WEAPONS: {len(all_weapons)}")
    
    with open(os.path.join(TS_DIR, 'weapons.ts'), 'w') as f:
        f.write('import { Weapon } from "@/lib/types";\n\n')
        f.write(f'export const allWeapons: Weapon[] = {json.dumps(all_weapons, indent=2)};\n\n')
        f.write('export const weaponsMap = new Map<string, Weapon>(allWeapons.map(w => [w.id, w]));\n')
    
    return all_weapons

# ============================================================
# WARFRAMES
# ============================================================
def convert_warframes():
    print("\n=== CONVERTING WARFRAMES ===")
    content = read_dart('warframes.dart')
    if content is None:
        return []
    
    warframes = []
    blocks = extract_blocks(content, 'WarframeData')
    
    for block in blocks:
        wf_id = get_str(block, 'id')
        name = get_str(block, 'name')
        if not wf_id or not name:
            continue
        
        wf = {
            'id': wf_id,
            'name': name,
            'health': get_num(block, 'health', 100),
            'shield': get_num(block, 'shield', 100),
            'armor': get_num(block, 'armor', 100),
            'energy': get_num(block, 'energy', 100),
            'sprintSpeed': get_num(block, 'sprintSpeed', 1.0),
            'description': get_str(block, 'description', ''),
            'passive': get_str(block, 'passive', ''),
            'abilities': [],
        }
        
        # Extract abilities from within this block
        ability_blocks = extract_blocks(block, 'Ability')
        for ab in ability_blocks:
            ability = {
                'name': get_str(ab, 'name', 'Unknown'),
                'energyCost': get_num(ab, 'energyCost', 0),
                'description': get_str(ab, 'description', ''),
            }
            
            # Optional numeric stats
            for stat in ['damage', 'range', 'duration', 'radius', 'health', 'armor',
                        'shield', 'damageReduction', 'damageBuff', 'statusChance',
                        'castTime', 'cooldown']:
                val = get_num(ab, stat, None)
                if val is not None and val != 0:
                    # Check it was actually in the block (not just default 0)
                    if re.search(rf'{stat}:\s*-?[\d.]+', ab):
                        ability[stat] = val
            
            dt = get_str(ab, 'damageType')
            if dt:
                ability['damageType'] = dt
            
            wf['abilities'].append(ability)
        
        warframes.append(wf)
    
    print(f"  TOTAL WARFRAMES: {len(warframes)}")
    
    with open(os.path.join(TS_DIR, 'warframes.ts'), 'w') as f:
        f.write('import { Warframe } from "@/lib/types";\n\n')
        f.write(f'export const allWarframes: Warframe[] = {json.dumps(warframes, indent=2)};\n\n')
        f.write('export const warframesMap = new Map<string, Warframe>(allWarframes.map(w => [w.id, w]));\n')
    
    return warframes

# ============================================================
# ARCHON SHARDS
# ============================================================
def convert_archon_shards():
    print("\n=== CONVERTING ARCHON SHARDS ===")
    content = read_dart('archon_shards.dart')
    if content is None:
        return []
    
    shards = []
    blocks = extract_blocks(content, 'ArchonShard')
    
    for block in blocks:
        shard_id = get_str(block, 'id')
        name = get_str(block, 'name')
        if not shard_id or not name:
            continue
        
        is_coalescent = get_bool(block, 'isCoalescent')
        if is_coalescent:
            continue  # Skip coalescent shards for now
        
        bonuses = get_map(block, 'statBonuses')
        
        shards.append({
            'id': shard_id,
            'name': name,
            'color': get_str(block, 'color', ''),
            'tier': int(get_num(block, 'tier', 1)),
            'statBonuses': bonuses,
            'description': get_str(block, 'description', ''),
            'isCoalescent': False,
        })
    
    print(f"  TOTAL ARCHON SHARDS: {len(shards)}")
    
    with open(os.path.join(TS_DIR, 'archon-shards.ts'), 'w') as f:
        f.write('import { ArchonShard } from "@/lib/types";\n\n')
        f.write(f'export const allArchonShards: ArchonShard[] = {json.dumps(shards, indent=2)};\n')
    
    return shards

# ============================================================
# COMPANIONS
# ============================================================
def convert_companions():
    print("\n=== CONVERTING COMPANIONS ===")
    content = read_dart('companions.dart')
    if content is None:
        return []
    
    companions = []
    
    # Sentinels
    for block in extract_blocks(content, 'SentinelData'):
        cid = get_str(block, 'id')
        name = get_str(block, 'name')
        if not cid or not name:
            continue
        companions.append({
            'id': cid,
            'name': name,
            'type': 'sentinel',
            'health': get_num(block, 'health', 560),
            'shield': get_num(block, 'shield', 250),
            'armor': get_num(block, 'armor', 80),
            'description': get_str(block, 'description', ''),
            'precept': get_str(block, 'uniquePrecept', ''),
        })
    
    # Kubrows
    for block in extract_blocks(content, 'KubrowData'):
        cid = get_str(block, 'id')
        name = get_str(block, 'name')
        if not cid or not name:
            continue
        companions.append({
            'id': cid,
            'name': name,
            'type': 'kubrow',
            'health': get_num(block, 'health', 100),
            'shield': get_num(block, 'shield', 50),
            'armor': get_num(block, 'armor', 50),
            'description': get_str(block, 'description', ''),
            'precept': get_str(block, 'precept', ''),
        })
    
    # Kavats
    for block in extract_blocks(content, 'KavatData'):
        cid = get_str(block, 'id')
        name = get_str(block, 'name')
        if not cid or not name:
            continue
        companions.append({
            'id': cid,
            'name': name,
            'type': 'kavat',
            'health': get_num(block, 'health', 80),
            'shield': get_num(block, 'shield', 60),
            'armor': get_num(block, 'armor', 40),
            'description': get_str(block, 'description', ''),
            'precept': get_str(block, 'precept', ''),
        })
    
    # MOAs
    for block in extract_blocks(content, 'MoaData'):
        cid = get_str(block, 'id')
        name = get_str(block, 'name')
        if not cid or not name:
            continue
        companions.append({
            'id': cid,
            'name': name,
            'type': 'moa',
            'health': get_num(block, 'health', 150),
            'shield': get_num(block, 'shield', 100),
            'armor': get_num(block, 'armor', 25),
            'description': get_str(block, 'description', ''),
            'precept': get_str(block, 'precept', ''),
        })
    
    # Predasites
    for block in extract_blocks(content, 'PredasiteData'):
        cid = get_str(block, 'id')
        name = get_str(block, 'name')
        if not cid or not name:
            continue
        companions.append({
            'id': cid,
            'name': name,
            'type': 'predasite',
            'health': get_num(block, 'health', 710),
            'shield': get_num(block, 'shield', 0),
            'armor': get_num(block, 'armor', 300),
            'description': get_str(block, 'description', ''),
            'precept': '',
        })
    
    # Vulpaphylas
    for block in extract_blocks(content, 'VulpaphylaData'):
        cid = get_str(block, 'id')
        name = get_str(block, 'name')
        if not cid or not name:
            continue
        companions.append({
            'id': cid,
            'name': name,
            'type': 'vulpaphyla',
            'health': get_num(block, 'health', 680),
            'shield': get_num(block, 'shield', 0),
            'armor': get_num(block, 'armor', 300),
            'description': get_str(block, 'description', ''),
            'precept': '',
        })
    
    # Hounds
    for block in extract_blocks(content, 'HoundData'):
        cid = get_str(block, 'id')
        name = get_str(block, 'name')
        if not cid or not name:
            continue
        companions.append({
            'id': cid,
            'name': name,
            'type': 'hound',
            'health': get_num(block, 'health', 450),
            'shield': get_num(block, 'shield', 150),
            'armor': get_num(block, 'armor', 200),
            'description': get_str(block, 'description', ''),
            'precept': '',
        })
    
    # Remove hallucinated companions
    HALLUCINATED_COMPANIONS = {'targis'}  # Targis Moa doesn't exist in-game
    before = len(companions)
    companions = [c for c in companions if c['id'] not in HALLUCINATED_COMPANIONS]
    removed = before - len(companions)
    if removed:
        print(f"  Removed {removed} hallucinated companions")
    
    print(f"  TOTAL COMPANIONS: {len(companions)}")
    type_counts = {}
    for c in companions:
        type_counts[c['type']] = type_counts.get(c['type'], 0) + 1
    for t, count in sorted(type_counts.items()):
        print(f"    {t}: {count}")
    
    with open(os.path.join(TS_DIR, 'companions.ts'), 'w') as f:
        f.write('import { Companion } from "@/lib/types";\n\n')
        f.write(f'export const allCompanions: Companion[] = {json.dumps(companions, indent=2)};\n\n')
        f.write('export const companionsMap = new Map<string, Companion>(allCompanions.map(c => [c.id, c]));\n')
    
    return companions

# ============================================================
# AUDIT
# ============================================================
def audit(all_mods, all_weapons, all_warframes, all_shards, all_companions):
    print("\n" + "=" * 60)
    print("AUDIT REPORT")
    print("=" * 60)
    
    # Check for duplicate IDs
    mod_ids = [m['id'] for m in all_mods]
    weapon_ids = [w['id'] for w in all_weapons]
    wf_ids = [w['id'] for w in all_warframes]
    
    dup_mods = [x for x in mod_ids if mod_ids.count(x) > 1]
    dup_weapons = [x for x in weapon_ids if weapon_ids.count(x) > 1]
    if dup_mods:
        error(f"Duplicate mod IDs: {set(dup_mods)}")
    if dup_weapons:
        error(f"Duplicate weapon IDs: {set(dup_weapons)}")
    
    # Check key mods exist and are correct
    key_mods = {
        'serration': {'name': 'Serration', 'drain': 4, 'maxRank': 10},
        'split_chamber': {'name': 'Split Chamber', 'drain': 7, 'maxRank': 5},
        'point_strike': {'name': 'Point Strike', 'drain': 4, 'maxRank': 5},
        'vital_sense': {'name': 'Vital Sense', 'drain': 4, 'maxRank': 5},
        'hornet_strike': {'name': 'Hornet Strike', 'drain': 4, 'maxRank': 10},
        'barrel_diffusion': {'name': 'Barrel Diffusion', 'drain': 6, 'maxRank': 5},
        'pressure_point': {'name': 'Pressure Point', 'drain': 4, 'maxRank': 5},
    }
    
    mod_map = {m['id']: m for m in all_mods}
    print("\n--- Key Mod Verification ---")
    for mid, expected in key_mods.items():
        # Try exact id first, then search by name
        mod = mod_map.get(mid)
        if not mod:
            # Search by name
            matches = [m for m in all_mods if m['name'] == expected['name']]
            if matches:
                mod = matches[0]
                print(f"  {expected['name']}: found as '{mod['id']}' (not '{mid}')")
            else:
                error(f"  KEY MOD MISSING: {expected['name']} ({mid})")
                continue
        
        issues = []
        if mod.get('maxRank') != expected.get('maxRank'):
            issues.append(f"maxRank={mod['maxRank']} (expected {expected['maxRank']})")
        if mod.get('drain') != expected.get('drain'):
            issues.append(f"drain={mod['drain']} (expected {expected['drain']})")
        
        if issues:
            warn(f"  {mod['name']}: {', '.join(issues)}")
        else:
            print(f"  {mod['name']}: OK")
    
    # Weapon category breakdown
    print("\n--- Weapon Categories ---")
    cat_counts = {}
    for w in all_weapons:
        cat = w['category']
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
    for cat, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")
    
    # Summary
    print("\n--- Summary ---")
    print(f"  Mods: {len(all_mods)}")
    print(f"  Weapons: {len(all_weapons)}")
    print(f"  Warframes: {len(all_warframes)}")
    print(f"  Archon Shards: {len(all_shards)}")
    print(f"  Companions: {len(all_companions)}")
    
    if errors:
        print(f"\n  ERRORS: {len(errors)}")
        for e in errors:
            print(f"    - {e}")
    if warnings:
        print(f"\n  WARNINGS: {len(warnings)}")
        for w in warnings[:20]:
            print(f"    - {w}")
        if len(warnings) > 20:
            print(f"    ... and {len(warnings) - 20} more")

if __name__ == '__main__':
    mods = convert_mods()
    weapons = convert_weapons()
    warframes = convert_warframes()
    shards = convert_archon_shards()
    companions = convert_companions()
    audit(mods, weapons, warframes, shards, companions)
    print("\nDone!")
