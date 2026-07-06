#!/usr/bin/env python3
"""Audit mod stat keys in data vs calculator and registry coverage."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
mods_text = (ROOT / "src/data/mods.ts").read_text(encoding="utf-8")
mod_stats: set[str] = set()
for block in re.findall(r'"stats":\s*\{([^}]+)\}', mods_text):
    mod_stats.update(re.findall(r'"(\w+)":', block))

calc = (ROOT / "src/lib/calculator.ts").read_text(encoding="utf-8")
handled = set(re.findall(r"case ['\"](\w+)['\"]:", calc))

catalog = (ROOT / "src/lib/override-stat-catalog.ts").read_text(encoding="utf-8")
fallback_m = re.search(r"MOD_STAT_FALLBACK_KEYS = \[([\s\S]*?)\]", catalog)
fallback_keys = set(re.findall(r'"(\w+)"', fallback_m.group(1) if fallback_m else ""))

WEAPON = {
    "damage", "criticalChance", "criticalMultiplier", "fireRate", "attackSpeed",
    "multishot", "statusChance", "magazine", "reloadSpeed", "comboDuration",
    "heavyAttackEfficiency", "impact", "puncture", "slash", "meleeDamage",
}
WARFRAME = {
    "health", "shield", "armor", "energy", "energyMax", "abilityStrength",
    "abilityDuration", "abilityEfficiency", "abilityRange", "sprintSpeed",
    "flow", "flowEnergyMax", "parkourVelocity",
}
CONDITIONAL = {"criticalChancePerCombo", "statusChancePerCombo", "damagePerStatus", "multishotOnKill"}
ELEMENTS = {"heat", "cold", "toxin", "electricity", "blast", "radiation", "gas", "magnetic", "viral", "corrosive"}
VISUAL = {
    "accuracy", "recoil", "zoom", "range", "slideAttack", "slideFriction", "aimGlideDuration",
    "bulletJump", "holsterRate", "lootDetection", "enemyRadar", "flightSpeed", "channelingDamage",
    "channelingEfficiency", "disposition", "punchThrough", "meleeRange", "finisherDamage",
    "shieldRecharge", "healthRegen", "tauResistance", "initialCombo",
}
ALIASES = {"critDamage": "criticalMultiplier", "criticalDamage": "criticalMultiplier", "critChance": "criticalChance"}


def classify(stat: str) -> str:
    norm = ALIASES.get(stat, stat)
    if stat in WEAPON or norm in WEAPON:
        return "weapon-build"
    if norm in WARFRAME:
        return "warframe-build"
    if stat in {"meleeDamage", "criticalDamage", "critDamage"}:
        return "companion-build"
    if stat in CONDITIONAL:
        return "conditional"
    if norm in ELEMENTS:
        return "elemental"
    if stat in VISUAL:
        return "visual-only"
    if (
        stat.startswith("ability")
        or stat.startswith("ally")
        or stat.startswith("companion")
        or stat.startswith("operator")
        or stat.startswith("turret")
        or stat.startswith("faction")
        or "Duration" in stat
        or stat.endswith("Chance")
        or stat.endswith("OnKill")
        or stat.endswith("PerHit")
    ):
        return "ability-companion"
    return "unclassified"


by_tag: dict[str, list[str]] = {}
for s in sorted(mod_stats):
    by_tag.setdefault(classify(s), []).append(s)

print(f"Unique mod stat keys in data: {len(mod_stats)}")
print(f"Calculator switch cases: {len(handled)}")
print(f"MOD_STAT_FALLBACK keys: {len(fallback_keys)}")
print("\nBy apply tag:")
for tag, keys in sorted(by_tag.items()):
    print(f"  {tag}: {len(keys)}")

unclassified = by_tag.get("unclassified", [])
print(f"\nUnclassified ({len(unclassified)}) — review if any should enter build math:")
for s in unclassified[:40]:
    print(f"  {s}")
if len(unclassified) > 40:
    print(f"  ... and {len(unclassified) - 40} more")

missing_fallback = sorted(mod_stats - fallback_keys)
print(f"\nIn data but not MOD_STAT_FALLBACK ({len(missing_fallback)}) — picker still includes via collectRecordKeys")
in_calc_not_registry = sorted(handled - WEAPON - WARFRAME - ELEMENTS - CONDITIONAL - VISUAL)
if in_calc_not_registry:
    print(f"\nCalculator cases not in registry weapon/warframe sets: {in_calc_not_registry}")

