#!/usr/bin/env python3
"""
Sync mod stats, metadata, and per-mod behaviors from wiki Module:Mods/data.

1. Downloads Module:Mods/data (cached under scripts/_wiki_mods_data.lua)
2. Parses descriptions + UpgradeTypes into per-rank stat keys
3. Updates src/data/mods.ts
4. Regenerates src/data/mod-behaviors/batches/*.ts

Usage: python scripts/sync_mods_from_wiki.py
"""
from __future__ import annotations

import json
import re
import subprocess
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODS_TS = ROOT / "src/data/mods.ts"
WIKI_CACHE = Path(__file__).resolve().parent / "_wiki_mods_data.lua"
UA = {"User-Agent": "FrameHub/1.0 (https://frame-hub.com)"}

# Wiki UpgradeType -> framehub stat key (when not inferable from description element)
UPGRADE_TYPE_STAT: dict[str, str] = {
    "WEAPON_DAMAGE_AMOUNT": "damage",
    "WEAPON_CRIT_CHANCE": "criticalChance",
    "WEAPON_CRIT_DAMAGE": "criticalMultiplier",
    "WEAPON_FIRE_RATE": "fireRate",
    "WEAPON_FIRE_ITERATIONS": "multishot",
    "WEAPON_PROC_CHANCE": "statusChance",
    "WEAPON_MAGAZINE_CAPACITY": "magazine",
    "WEAPON_RELOAD_SPEED": "reloadSpeed",
    "WEAPON_MELEE_DAMAGE": "damage",
    "WEAPON_MELEE_COMBO_DURATION_BONUS": "comboDuration",
    "WEAPON_MELEE_COMBO_BONUS": "initialCombo",
    "WEAPON_MELEE_HEAVY_CHARGE_SPEED": "heavyAttackEfficiency",
    "WEAPON_PUNCTURE_DEPTH": "punchThrough",
    "WEAPON_ZOOM": "zoom",
    "WEAPON_SPREAD": "recoil",
    "WEAPON_HEADSHOT_MULTIPLIER": "headshotMultiplier",
    "AVATAR_ABILITY_STRENGTH": "abilityStrength",
    "AVATAR_ABILITY_DURATION": "abilityDuration",
    "AVATAR_ABILITY_EFFICIENCY": "abilityEfficiency",
    "AVATAR_ABILITY_RANGE": "abilityRange",
    "AVATAR_ARMOUR": "armor",
    "AVATAR_HEALTH_MAX": "health",
    "AVATAR_SHIELD_MAX": "shield",
    "AVATAR_POWER_MAX": "energy",
    "AVATAR_SPRINT_SPEED": "sprintSpeed",
    "AVATAR_PARKOUR_BOOST": "parkourVelocity",
    "AVATAR_SHIELD_RECHARGE_RATE": "shieldRecharge",
    "AVATAR_HEALTH_REGEN": "healthRegen",
    "AVATAR_MOVEMENT_SPEED": "sprintSpeed",
}

DESC_LABEL_TO_STAT: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"fire rate", re.I), "fireRate"),
    (re.compile(r"multishot", re.I), "multishot"),
    (re.compile(r"critical chance|crit chance", re.I), "criticalChance"),
    (re.compile(r"critical damage|crit damage", re.I), "criticalMultiplier"),
    (re.compile(r"status chance", re.I), "statusChance"),
    (re.compile(r"status duration", re.I), "statusDuration"),
    (re.compile(r"magazine", re.I), "magazine"),
    (re.compile(r"reload speed", re.I), "reloadSpeed"),
    (re.compile(r"reload time", re.I), "reloadSpeed"),
    (re.compile(r"attack speed", re.I), "attackSpeed"),
    (re.compile(r"melee damage", re.I), "damage"),
    (re.compile(r"damage(?! reduction)", re.I), "damage"),
    (re.compile(r"ability strength", re.I), "abilityStrength"),
    (re.compile(r"ability duration", re.I), "abilityDuration"),
    (re.compile(r"ability efficiency", re.I), "abilityEfficiency"),
    (re.compile(r"ability range", re.I), "abilityRange"),
    (re.compile(r"health", re.I), "health"),
    (re.compile(r"shield", re.I), "shield"),
    (re.compile(r"armor|armour", re.I), "armor"),
    (re.compile(r"energy", re.I), "energy"),
    (re.compile(r"sprint speed", re.I), "sprintSpeed"),
    (re.compile(r"parkour", re.I), "parkourVelocity"),
    (re.compile(r"accuracy", re.I), "accuracy"),
    (re.compile(r"recoil", re.I), "recoil"),
    (re.compile(r"range(?! per)", re.I), "range"),
    (re.compile(r"punch through", re.I), "punchThrough"),
    (re.compile(r"heat|fire(?! rate)", re.I), "heat"),
    (re.compile(r"cold|freeze", re.I), "cold"),
    (re.compile(r"toxin", re.I), "toxin"),
    (re.compile(r"electric|shock", re.I), "electricity"),
    (re.compile(r"impact", re.I), "impact"),
    (re.compile(r"puncture", re.I), "puncture"),
    (re.compile(r"slash", re.I), "slash"),
    (re.compile(r"radiation", re.I), "radiation"),
    (re.compile(r"viral", re.I), "viral"),
    (re.compile(r"corrosive", re.I), "corrosive"),
    (re.compile(r"gas", re.I), "gas"),
    (re.compile(r"magnetic", re.I), "magnetic"),
    (re.compile(r"blast", re.I), "blast"),
]

ELEMENT_UPGRADE = "WEAPON_PERCENT_BASE_DAMAGE_ADDED"
WIKI_TYPE_WEAPON = {
    "rifle", "shotgun", "pistol", "sniper", "bow", "launcher", "primary",
    "secondary", "melee", "arch-gun", "archgun", "arch-melee", "archmelee",
    "kitgun", "zaw", "companion weapon", "beast", "robotic", "sentinel",
}
WIKI_TYPE_WARFRAME = {"warframe", "aura", "necramech", "archwing", "archwing (mod)"}

# Local catalog name -> wiki Name (verified renames only)
NAME_ALIASES: dict[str, str] = {
    "vigilante offensive": "vigilante offense",
}


def download_wiki_mods() -> str:
    if WIKI_CACHE.exists() and WIKI_CACHE.stat().st_size > 100_000:
        return WIKI_CACHE.read_text(encoding="utf-8")
    url = "https://wiki.warframe.com/w/Module:Mods/data?action=raw"
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        text = r.read().decode("utf-8")
    WIKI_CACHE.write_text(text, encoding="utf-8")
    return text


def strip_wiki_markup(s: str) -> str:
    s = re.sub(r"<[^>]+>", "", s)
    s = s.replace("\\r\\n", "\n").replace("\\n", "\n").replace("\r\n", "\n")
    return s.strip()


def parse_field(block: str, field: str) -> str | None:
    # Anchor to line start so "Name" does not match "InternalName".
    m = re.search(rf"^\s*{re.escape(field)}\s*=\s*(.+)", block, re.MULTILINE)
    if not m:
        return None
    val = m.group(1).strip().rstrip(",")
    if val.startswith('"') and val.endswith('"'):
        return val[1:-1]
    if val.startswith("{") and val.endswith("}"):
        return val
    return val.strip('"')


def parse_upgrade_types(block: str) -> list[str]:
    m = re.search(r"UpgradeTypes\s*=\s*\{([^}]*)\}", block)
    if not m:
        return []
    return re.findall(r'"([^"]+)"', m.group(1))


def parse_lua_mod_entries(text: str) -> dict[str, dict]:
    start = text.find("Mods = {")
    if start < 0:
        raise RuntimeError("Mods table not found")
    chunk = text[start + len("Mods = {") :]
    entries: dict[str, dict] = {}
    i = 0
    n = len(chunk)
    while i < n:
        while i < n and chunk[i] in " \t\n\r,":
            i += 1
        if i >= n or chunk[i] == "}":
            break
        key = None
        if chunk[i] == "[":
            km = re.match(r'\["([^"]+)"\]\s*=\s*\{', chunk[i:])
            if not km:
                break
            key = km.group(1)
            i += km.end()
        else:
            km = re.match(r"([A-Za-z0-9_]+)\s*=\s*\{", chunk[i:])
            if not km:
                i += 1
                continue
            key = km.group(1)
            i += km.end()
        depth = 1
        body_start = i
        in_str = False
        esc = False
        while i < n and depth > 0:
            c = chunk[i]
            if in_str:
                if esc:
                    esc = False
                elif c == "\\":
                    esc = True
                elif c == '"':
                    in_str = False
            elif c == '"':
                in_str = True
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
            i += 1
        body = chunk[body_start : i - 1]
        name = parse_field(body, "Name") or key
        desc = strip_wiki_markup(parse_field(body, "Description") or "")
        max_rank = parse_field(body, "MaxRank")
        base_drain = parse_field(body, "BaseDrain")
        wiki_type = parse_field(body, "Type") or ""
        internal_name = parse_field(body, "InternalName") or ""
        link = parse_field(body, "Link") or name
        entry = {
            "name": name,
            "description": desc,
            "maxRank": int(max_rank) if max_rank and max_rank.isdigit() else None,
            "drain": int(base_drain) if base_drain and str(base_drain).lstrip("-").isdigit() else None,
            "upgradeTypes": parse_upgrade_types(body),
            "isAugment": "IsAbilityAugment = true" in body,
            "wikiType": wiki_type,
            "internalName": internal_name,
            "link": link,
        }
        entries[name.lower()] = entry
        if link.lower() != name.lower():
            entries.setdefault(link.lower(), entry)
    return entries


def build_internal_index(wiki_index: dict[str, dict]) -> dict[str, dict]:
    """Map internal path tail -> entry (first wins)."""
    by_internal: dict[str, dict] = {}
    seen: set[int] = set()
    for entry in wiki_index.values():
        eid = id(entry)
        if eid in seen:
            continue
        seen.add(eid)
        internal = entry.get("internalName") or ""
        if not internal:
            continue
        tail = internal.rstrip("/").split("/")[-1].lower()
        by_internal.setdefault(tail, entry)
        compact = re.sub(r"[^a-z0-9]", "", tail)
        if compact:
            by_internal.setdefault(compact, entry)
    return by_internal


def label_to_stat(label: str) -> str | None:
    label = strip_wiki_markup(label).lower()
    for pat, stat in DESC_LABEL_TO_STAT:
        if pat.search(label):
            return stat
    return None


def parse_description_stats(desc: str, max_rank: int) -> dict[str, float]:
    stats: dict[str, float] = {}
    if not desc:
        return stats
    divisor = max(max_rank + 1, 1)
    for line in desc.split("\n"):
        line = strip_wiki_markup(line)
        for m in re.finditer(r"([+-]?)(\d+(?:\.\d+)?)\s*%\s*(.+)", line):
            sign = -1 if m.group(1) == "-" else 1
            max_val = float(m.group(2)) * sign
            label = m.group(3).strip()
            stat = label_to_stat(label)
            if stat:
                stats[stat] = round(max_val / divisor, 6)
        for m in re.finditer(r"([+-]?)(\d+(?:\.\d+)?)\s*(m|s|seconds?)\b", line, re.I):
            # flat durations / meters — store max at rank
            val = float(m.group(2))
            unit = m.group(3).lower()
            key = "duration" if unit.startswith("s") else "range"
            if "cooldown" in line.lower():
                key = "cooldown"
            stats[key] = round(val / divisor, 6)
    # augment semantic numbers
    m = re.search(r"additional (\d+) max stacks", desc, re.I)
    if m:
        stats["mutationStackBonus"] = round(float(m.group(1)) / divisor, 6)
    m = re.search(r"(\d+)% Resistance.*Stacks up to (\d+)%", desc, re.I)
    if m:
        stats["damageResistancePerStack"] = round(float(m.group(1)) / divisor, 6)
        stats["damageResistanceCap"] = float(m.group(2))
    # Augment-specific phrasing (no standard "+X% Stat" lines on wiki)
    m = re.search(
        r"(?:increases?|grants?|adds?)\s+(?:\w+\s+)*Critical Chance by (\d+(?:\.\d+)?)%",
        desc,
        re.I,
    )
    if m:
        stats["critBonusPerKill"] = round(float(m.group(1)) / divisor, 6)
    m = re.search(r"decays? by (\d+(?:\.\d+)?)%/s", desc, re.I)
    if m:
        stats["critDecayPerSecond"] = round(float(m.group(1)) / divisor, 6)
    m = re.search(r"(?:grants?|gains?|adds?)\s+(?:an?\s+)?additional\s+(\d+)\s+max stacks", desc, re.I)
    if m:
        stats["mutationStackBonus"] = round(float(m.group(1)) / divisor, 6)
    m = re.search(r"\+(\d+(?:\.\d+)?)%\s+Ability Range", desc, re.I)
    if m:
        stats["abilityRange"] = round(float(m.group(1)) / divisor, 6)
    m = re.search(r"take[s]?\s+(\d+(?:\.\d+)?)%\s+(?:more\s+)?Weapon Damage", desc, re.I)
    if m:
        stats["weaponDamageBonus"] = round(float(m.group(1)) / divisor, 6)
    m = re.search(r"Flight Speed increased by (\d+(?:\.\d+)?)%", desc, re.I)
    if m:
        stats["flightSpeed"] = round(float(m.group(1)) / divisor, 6)
    m = re.search(r"Fire Rate increased by (\d+(?:\.\d+)?)%", desc, re.I)
    if m:
        stats["fireRate"] = round(float(m.group(1)) / divisor, 6)
    m = re.search(r"for (\d+(?:\.\d+)?)s\b", desc, re.I)
    if m and "duration" not in stats:
        stats["duration"] = round(float(m.group(1)) / divisor, 6)
    m = re.search(r"(\d+(?:\.\d+)?)s cooldown", desc, re.I)
    if m:
        stats["cooldown"] = round(float(m.group(1)) / divisor, 6)
    m = re.search(r"within (\d+(?:\.\d+)?)m", desc, re.I)
    if m:
        stats["range"] = round(float(m.group(1)) / divisor, 6)
    m = re.search(r"grants?\s+(\d+(?:\.\d+)?)\s+energy", desc, re.I)
    if m:
        stats["energyOnCast"] = round(float(m.group(1)) / divisor, 6)
    return stats


def stats_from_wiki(wiki: dict) -> dict[str, float]:
    max_rank = wiki.get("maxRank") or 0
    stats = parse_description_stats(wiki.get("description") or "", max_rank)
    upgrade_types = wiki.get("upgradeTypes") or []
    desc = wiki.get("description") or ""
    # Element lines paired with WEAPON_PERCENT_BASE_DAMAGE_ADDED
    if ELEMENT_UPGRADE in upgrade_types:
        for line in desc.split("\n"):
            line = strip_wiki_markup(line)
            pm = re.search(r"\+(\d+(?:\.\d+)?)%\s*(.+)", line)
            if not pm:
                continue
            stat = label_to_stat(pm.group(2))
            if stat in {"heat", "cold", "toxin", "electricity", "impact", "puncture", "slash",
                        "radiation", "viral", "corrosive", "gas", "magnetic", "blast"}:
                stats[stat] = round(float(pm.group(1)) / (max_rank + 1), 6)
    for ut in upgrade_types:
        if ut == ELEMENT_UPGRADE:
            continue
        stat = UPGRADE_TYPE_STAT.get(ut)
        if stat and stat not in stats:
            # Try to find matching % in description for this stat
            for line in desc.split("\n"):
                line = strip_wiki_markup(line)
                pm = re.search(r"\+(\d+(?:\.\d+)?)%", line)
                if not pm:
                    continue
                guessed = label_to_stat(line)
                if guessed == stat:
                    stats[stat] = round(float(pm.group(1)) / (max_rank + 1), 6)
                    break
    return stats


def norm_name(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def load_local_mods() -> list[dict]:
    text = MODS_TS.read_text(encoding="utf-8")
    m = re.search(r"export const allMods: Mod\[\] = (\[[\s\S]*?\n\]);", text)
    if not m:
        raise RuntimeError("Could not parse allMods")
    return json.loads(m.group(1))


def write_mods(mods: list[dict]) -> None:
    text = MODS_TS.read_text(encoding="utf-8")
    prefix = 'import { Mod } from "@/lib/types";\n\nexport const allMods: Mod[] = '
    suffix_m = re.search(r";\s*\nexport const modsMap", text)
    if not suffix_m:
        raise RuntimeError("modsMap export not found")
    MODS_TS.write_text(prefix + json.dumps(mods, indent=2) + text[suffix_m.start() :], encoding="utf-8")


def find_wiki(
    wiki_index: dict[str, dict],
    mod: dict,
    wiki_internal: dict[str, dict] | None = None,
) -> dict | None:
    candidates = [
        mod["name"].lower(),
        re.sub(r"\s*\(.*?\)\s*", "", mod["name"]).strip().lower(),
        norm_name(mod["name"]),
    ]
    alias = NAME_ALIASES.get(mod["name"].lower()) or NAME_ALIASES.get(norm_name(mod["name"]))
    if alias:
        candidates.insert(0, alias)
    mod_id = mod.get("id", "")
    if mod_id:
        base_id = re.sub(r"_r\d+$", "", mod_id).replace("_", " ")
        candidates.append(base_id.lower())
        # augment_volt_foo_bar -> try wiki internal tail fragments
        if mod_id.startswith("augment_"):
            parts = mod_id.split("_")[2:]
            candidates.append(" ".join(parts))
            if wiki_internal:
                compact = "".join(parts).lower()
                hit = wiki_internal.get(compact)
                if hit:
                    return hit
    seen: set[str] = set()
    for key in candidates:
        if not key or key in seen:
            continue
        seen.add(key)
        if key in wiki_index:
            return wiki_index[key]
    if wiki_internal and mod_id:
        base = re.sub(r"_r\d+$", "", mod_id)
        compact = re.sub(r"[^a-z0-9]", "", base.replace("augment_", ""))
        for tail, entry in wiki_internal.items():
            if compact and compact in re.sub(r"[^a-z0-9]", "", tail):
                return entry
    return None


def main() -> None:
    wiki_text = download_wiki_mods()
    wiki_index = parse_lua_mod_entries(wiki_text)
    wiki_internal = build_internal_index(wiki_index)
    print(f"Wiki mod entries: {len(wiki_index)}")

    mods = load_local_mods()
    matched = 0
    stats_filled = 0
    stats_updated = 0
    meta_updated = 0

    for mod in mods:
        wiki = find_wiki(wiki_index, mod, wiki_internal)
        if not wiki:
            continue
        matched += 1
        if wiki.get("description") and (not mod.get("description") or len(wiki["description"]) > len(mod["description"])):
            mod["description"] = wiki["description"].replace("\r\n", "\\n").replace("\n", "\\n")
            meta_updated += 1
        if wiki.get("drain") is not None and mod.get("drain") != wiki["drain"]:
            mod["drain"] = wiki["drain"]
            meta_updated += 1
        if wiki.get("maxRank") is not None and mod.get("maxRank") != wiki["maxRank"]:
            mod["maxRank"] = wiki["maxRank"]
            meta_updated += 1

        wiki_stats = stats_from_wiki(wiki)
        if not wiki_stats:
            continue
        current = mod.get("stats") or {}
        if not current:
            mod["stats"] = wiki_stats
            stats_filled += 1
        else:
            changed = False
            merged = dict(current)
            for k, v in wiki_stats.items():
                if k not in merged or abs(merged[k] - v) > 0.01:
                    merged[k] = v
                    changed = True
            if changed:
                mod["stats"] = merged
                stats_updated += 1

    write_mods(mods)

    # Export wiki metadata for behavior generator (mod id -> wiki type / augment flag)
    meta_out: dict[str, dict] = {}
    for mod in mods:
        wiki = find_wiki(wiki_index, mod, wiki_internal)
        if wiki:
            meta_out[mod["id"]] = {
                "wikiType": wiki.get("wikiType", ""),
                "isAugment": wiki.get("isAugment", False),
                "wikiName": wiki.get("name", ""),
            }
    WIKI_META = Path(__file__).resolve().parent / "_mod_wiki_meta.json"
    WIKI_META.write_text(json.dumps(meta_out, indent=2), encoding="utf-8")
    print(f"Wrote wiki meta for {len(meta_out)} mods")
    print(f"Local mods: {len(mods)}")
    print(f"Wiki matched by name: {matched}")
    print(f"Stats filled (was empty): {stats_filled}")
    print(f"Stats updated: {stats_updated}")
    print(f"Metadata updates: {meta_updated}")

    # Regenerate behavior batches
    subprocess.run(["python", str(ROOT / "scripts/generate_all_mod_behavior_batches.py")], check=True)
    print("Regenerated mod behavior batches.")


if __name__ == "__main__":
    main()
