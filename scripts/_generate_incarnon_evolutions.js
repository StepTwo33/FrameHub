// One-shot: generate src/data/incarnon-genesis-evolutions.ts from parsed wiki
// evolution tables (scripts/_wiki_incarnon/_parsed.json).
import fs from "fs";
import path from "path";
const __dirname = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const parsed = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_wiki_incarnon", "_parsed.json"), "utf8"),
);

// parsed key → weaponId in incarnon.ts
const KEY_TO_ID = {
  boar: "boar_incarnon", boltor: "boltor_incarnon", braton: "braton_incarnon",
  burston: "burston_incarnon", dera: "dera_incarnon", dread: "dread_incarnon",
  gorgon: "gorgon_incarnon", latron: "latron_incarnon", paris: "paris_incarnon",
  soma: "soma_incarnon", strun: "strun_incarnon", sybaris: "sybaris_incarnon",
  miter: "miter_incarnon", torid: "torid_incarnon", vasto: "vasto_incarnon",
  lex: "lex_incarnon", lato: "lato_incarnon", angstrum: "angstrum_incarnon",
  atomos: "atomos_incarnon", bronco: "bronco_incarnon", cestra: "cestra_incarnon",
  despair: "despair_incarnon", dual_toxocyst: "dual_toxocyst_incarnon",
  furis: "furis_incarnon", gammacor: "gammacor_incarnon", kunai: "kunai_incarnon",
  sicarus: "sicarus_incarnon", zylok: "zylok_incarnon", bo: "bo_incarnon",
  skana: "skana_incarnon", ack_brunt: "ack_brunt_incarnon", anku: "anku_incarnon",
  ceramic_dagger: "ceramic_dagger_incarnon", dual_ichor: "dual_ichor_incarnon",
  furax: "furax_incarnon", hate: "hate_incarnon", magistar: "magistar_incarnon",
  nami_solo: "nami_solo_incarnon", okina: "okina_incarnon", sibear: "sibear_incarnon",
  vectis: "vectis_incarnon", stug: "stug_incarnon", ballistica: "ballistica_incarnon",
  destreza: "destreza_incarnon", obex: "obex_incarnon",
  native_felarx: "felarx", native_innodem: "innodem", native_laetum: "laetum",
  native_phenmor: "phenmor", native_praedos: "praedos", native_onos: "onos",
  native_ruvox: "ruvox", native_thalys: "thalys",
};

function wikiNameToId(name) {
  return name
    .replace(/&amp;/g, "&")
    .toLowerCase()
    .replace(/ & /g, "_&_")
    .replace(/[ -]+/g, "_");
}

const CONDITIONAL =
  /\bOn [A-Z]|\bWith .+?(?::|Equipped|[Oo]ver|[Bb]elow)|\bWhen\b|\bwhen\b|\bwhile\b|\bafter\b|\bchance (?:to|for)\b|Stacks|for \d+ ?s|below half|Below \d|Enemies suffering|Headshots? [Bb]uild|Doubles in|Resets|Incarnon Form:|for Incarnon Form|per (?:projectile|shot|kill|hit)|scales with|no enemies|[Ff]rom Empty|On Shield Break|On Reload/;

function parseCell(cell) {
  // "X = 12% Y = 12%" or "X = +150" or "-"
  const map = {};
  let m;
  const re = /([A-Z])\s*=\s*([+-]?\d+(?:\.\d+)?)\s*(%|x)?/g;
  while ((m = re.exec(cell))) {
    map[m[1]] = { value: Number(m[2]), unit: m[3] ?? "" };
  }
  return map;
}

function substitute(bullets, letterMap) {
  return bullets.map((b) =>
    b.replace(/([+-])([XYZ])(?=[%x\s.,)]|$)/g, (full, sign, letter) => {
      const e = letterMap[letter];
      if (!e) return full;
      return sign + Math.abs(e.value) + (e.unit === "%" ? "" : e.unit === "x" ? "x" : "");
    }),
  );
}

function deriveStats(bullets) {
  const stats = {};
  const add = (k, v) => { stats[k] = (stats[k] ?? 0) + v; };
  for (const b of bullets) {
    // Calculator halves this value (assumes 50% proc chance), so emit
    // 2 × chance × damageFraction: 50% / +2000% → 20.
    const attr = /(\d+)% chance to deal \+?(\d+)% damage on non-critical hits/i.exec(b);
    if (attr) { add("devouringAttrition", 2 * (Number(attr[1]) / 100) * (Number(attr[2]) / 100)); continue; }
    if (CONDITIONAL.test(b)) continue;
    let m;
    const re = /([+-]\d+(?:\.\d+)?)%\s*(?:Base )?(Critical Chance|Status Chance|Fire Rate|Attack Speed|Reload Speed|Magazine Capacity|Multishot|Melee Damage)/gi;
    while ((m = re.exec(b))) {
      const v = Number(m[1]) / 100;
      const key = m[2].toLowerCase();
      if (key === "critical chance") add("criticalChance", v);
      else if (key === "status chance") add("statusChance", v);
      else if (key === "fire rate" || key === "attack speed") add("fireRate", v);
      else if (key === "reload speed") add("reloadSpeed", v);
      else if (key === "magazine capacity") add("magazine", v);
      else if (key === "multishot") add("multishot", v);
      // melee damage from EVO1 handled elsewhere (form bonus, not a perk)
    }
    // % is optional: some wiki cells omit it (e.g. "Y = 18" → "+18")
    const reBase = /Increase Base (Critical Chance|Status Chance|Status) by ([+-]\d+(?:\.\d+)?)%?/gi;
    while ((m = reBase.exec(b))) {
      const v = Number(m[2]) / 100;
      if (/critical/i.test(m[1])) add("criticalChance", v);
      else add("statusChance", v);
    }
    const critMult =
      /Increase Base Critical Damage Multiplier by \+(\d+(?:\.\d+)?)x/i.exec(b) ??
      /\+(\d+(?:\.\d+)?)x Critical (?:Damage|Multiplier)/i.exec(b);
    if (critMult) add("criticalMultiplier", Number(critMult[1]));
    const flat = /Increase Base Damage by \+(\d+(?:\.\d+)?)(?!\s*[%x])/i.exec(b);
    if (flat) add("flatBaseDamage", Number(flat[1]));
  }
  // dedupe crit/status captured by both regexes: reBase lines also match re
  // (both contain "% ... Critical Chance"); halve if doubled
  return stats;
}

// Guard against the double-count noted above: run on a sample and verify.
// The `re` pattern requires the % right before the stat name — "Increase Base
// Critical Chance by +17%." has the percent AFTER, so only reBase matches. OK.

const lines = [];
lines.push("// AUTO-GENERATED by scripts/_generate_incarnon_evolutions.js");
lines.push("// Source: wiki.warframe.com \"<Weapon> Incarnon Genesis\" pages and native");
lines.push("// incarnon weapon pages (Special:Export wikitext), parsed evolution tables.");
lines.push("// Do not hand-edit perk names/descriptions; re-run the generator instead.");
lines.push('import type { IncarnonEvolution } from "./incarnon";');
lines.push("");
lines.push("export const WIKI_INCARNON_EVOLUTIONS: Record<string, IncarnonEvolution[]> = {");

const ids = Object.entries(KEY_TO_ID);
ids.sort((a, b) => a[1].localeCompare(b[1]));
for (const [key, id] of ids) {
  const entry = parsed[key];
  if (!entry || entry.evos.length === 0) { console.error("missing:", key); continue; }
  const variantIds = (entry.variants ?? []).map(wikiNameToId);
  lines.push(`  ${JSON.stringify(id)}: [`);
  for (const e of entry.evos) {
    let stats = {};
    let variantStats = null;
    let description = e.description;
    if (e.tier > 1) {
      const cells = (e.variantCells ?? []).map(parseCell);
      const hasPlaceholders = /[+-][XYZ]\b/.test(e.description);
      if (hasPlaceholders && cells.length > 0 && variantIds.length > 0) {
        variantStats = {};
        for (let vi = 0; vi < variantIds.length; vi++) {
          const letterMap = cells[vi] ?? {};
          const subs = substitute(e.bullets, letterMap);
          variantStats[variantIds[vi]] = deriveStats(subs);
        }
        stats = variantStats[variantIds[0]] ?? {};
        description = substitute(e.bullets, cells[0] ?? {}).join(" ");
        // Collapse if all variants identical
        const uniq = new Set(Object.values(variantStats).map((s) => JSON.stringify(s)));
        if (uniq.size === 1) variantStats = null;
      } else {
        stats = deriveStats(e.bullets);
      }
    }
    const parts = [
      `tier: ${e.tier}`,
      `slot: ${e.slot}`,
      `name: ${JSON.stringify(e.name)}`,
      `description: ${JSON.stringify(description)}`,
      `statChanges: ${JSON.stringify(stats)}`,
    ];
    if (variantStats) parts.push(`variantStatChanges: ${JSON.stringify(variantStats)}`);
    lines.push(`    { ${parts.join(", ")} },`);
  }
  lines.push("  ],");
}
lines.push("};");
lines.push("");

fs.writeFileSync(path.join(__dirname, "..", "src", "data", "incarnon-genesis-evolutions.ts"), lines.join("\n"));
console.log("wrote", ids.length, "weapons");
