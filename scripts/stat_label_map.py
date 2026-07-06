"""Map in-game / human arcane effect stat labels to catalog stat keys."""
from __future__ import annotations

import copy
import re

# Global human label -> catalog key
STAT_LABEL_MAP: dict[str, str] = {
    "Void Damage to Viral Damage": "voidConversion",
    "Void Damage to Electricity Damage": "voidConversion",
    "Void Damage to Puncture Damage": "voidConversion",
    "Void Damage to Heat Damage": "voidConversion",
    "Range": "procAuraRadius",
    "Big Critical Hit": "bigCritThreshold",
    "Toxin Damage/s": "zoneDamagePerSec",
    "effect Duration": "zoneDuration",
    "Effect Duration": "buffDuration",
    "Electricity Damage": "zoneDamage",
    "Effect Range": "zoneRadius",
    "Cold Damage": "zoneDamagePerSec",
    "Volatile Hive Duration": "zoneDuration",
    "Heat Damage": "zoneDamage",
    "Area of Effect": "zoneRadius",
    "Chance to Inflict": "statusProcChance",
    "Accuracy while Airborn": "airborneAccuracy",
    "Weapon Recoil": "airborneRecoilReduction",
    "Aim Glide/Wall Latch Duration": "aimGlideDuration",
    "Projectiles": "kitgunHoming",
    "Corrosive Damage": "corrosiveDamage",
    "Restore Max Shields": "shieldRestorePercent",
    "Trap Radius": "voidTrapRadius",
    "K-Drive Speed": "kdDriveSpeed",
    "Void Sling Radius": "voidSlingRadius",
    "Reduce Enemy Resistance": "enemyResistanceReduction",
    "Damage to Primary Weapons": "holsterDamage",
    "Health Orb Pulse": "healthOrbPulse",
    "Movement Speed:": "dodgeSpeed",
    "chance to resist a slash status effect": "statusResistance",
    "On Reload:": "holsterDamage",
}

# Per-arcane overrides when the same label maps differently by context.
CONTEXT_STAT_MAP: dict[tuple[str, str], str] = {
    ("magus_melt", "Heat Damage"): "operatorHeatDamage",
    ("residual_boils", "Heat Damage"): "zoneDamage",
    ("residual_malodor", "Cold Damage"): "zoneDamagePerSec",
    ("melee_exposure", "Corrosive Damage"): "corrosiveDamage",
}

_RECOIL_STATS = frozenset({"airborneRecoilReduction", "recoilReduction"})


def normalize_stat_key(stat: str, arcane_id: str) -> str:
    if (arcane_id, stat) in CONTEXT_STAT_MAP:
        return CONTEXT_STAT_MAP[(arcane_id, stat)]
    if stat in STAT_LABEL_MAP:
        return STAT_LABEL_MAP[stat]
    return stat


def normalize_effect_line(line: dict, arcane_id: str) -> dict:
    out = copy.deepcopy(line)
    out["stat"] = normalize_stat_key(out.get("stat", ""), arcane_id)
    if out["stat"] in _RECOIL_STATS:
        if out.get("maxValue") is not None and out["maxValue"] < 0:
            out["maxValue"] = abs(out["maxValue"])
        if out.get("baseValue") is not None and out["baseValue"] < 0:
            out["baseValue"] = abs(out["baseValue"])
    return out


def normalize_effects(effects: list[dict], arcane_id: str) -> list[dict]:
    return [normalize_effect_line(e, arcane_id) for e in effects]


def normalize_arcane_effect_fields(fields: dict, arcane_id: str) -> dict:
    out = copy.deepcopy(fields)
    if "effects" in out:
        out["effects"] = normalize_effects(out["effects"], arcane_id)
    return out


def is_catalog_stat_key(stat: str) -> bool:
    return bool(re.match(r"^[a-z]", stat))
