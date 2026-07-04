#!/usr/bin/env python3
"""Parse wiki augment ModBox emodtable stats — Cost is always the last column."""
from __future__ import annotations

import re


def parse_emodtable_costs(content: str) -> dict | None:
    """Return {drain: R0 cost, maxRank, costs: [all rank costs]} from ==Stats== table."""
    table = re.search(r'\{\|\s*class="emodtable"[\s\S]*?\|\}', content)
    if not table:
        return None

    rows: list[tuple[int, int]] = []
    for line in table.group(0).splitlines():
        line = line.strip()
        if not line.startswith("|") or line.startswith("|-") or line.startswith("!"):
            continue
        # Data row: | 0 || stat || stat || 6
        body = line.lstrip("|").strip()
        if not body or body[0] not in "0123456789":
            continue
        cells = [c.strip() for c in body.split("||")]
        if len(cells) < 2:
            continue
        rank_str = re.sub(r"[^\d]", "", cells[0])
        if not rank_str.isdigit():
            continue
        rank = int(rank_str)
        cost_str = re.sub(r"[^\d]", "", cells[-1])
        if not cost_str.isdigit():
            continue
        rows.append((rank, int(cost_str)))

    if not rows:
        return None

    rows.sort(key=lambda x: x[0])
    ranks = [r for r, _ in rows]
    costs = [c for _, c in rows]
    base_drain = costs[0] if ranks[0] == 0 else costs[0] - ranks[0]
    return {"drain": base_drain, "maxRank": max(ranks), "costs": costs}


def parse_infobox_drain(content: str) -> int | None:
    for field in ("mod_drain", "drain"):
        m = re.search(rf"\|{field}\s*=\s*(\d+)", content, re.I)
        if m:
            return int(m.group(1))
    return None


def parse_modbox(content: str) -> dict:
    info: dict = {}
    table = parse_emodtable_costs(content)
    if table:
        info.update(table)

    drain = parse_infobox_drain(content)
    if drain is not None and "drain" not in info:
        info["drain"] = drain

    wf_names = re.findall(r"\{\{WF\|([^}|]+)", content)
    if wf_names:
        info["warframeId"] = re.sub(r"[^a-z0-9]+", "_", wf_names[0].lower()).strip("_")

    if re.search(r"Warframe Augment Mod", content, re.I):
        info["kind"] = "warframe"
    elif re.search(r"Weapon Augment Mod|Amalgam Mod", content, re.I):
        info["kind"] = "weapon"
    elif re.search(r"Exilus Mod", content, re.I):
        info["kind"] = "exilus"
        info["polarity"] = "exilus"

    return info
