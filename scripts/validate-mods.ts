/**
 * Mod Data Validation Script
 * Run: npx tsx scripts/validate-mods.ts
 */

import { allMods } from "../src/data/mods";

const VALID_POLARITIES = ["madurai", "vazarin", "naramon", "zenurik", "penjaga", "unairu", "universal", "umbra", "exilus", "any", "none", ""];
const VALID_CATEGORIES = ["rifle", "shotgun", "pistol", "melee", "warframe", "companion", "sentinel", "general", "aura", "stance", "exilus", "parazon", "archgun", "archmelee", "archwing", "necramech", "arcane", "primary", "secondary", "augment", "operator", "companion_weapon", "set", "evolution"];
const VALID_RARITIES = ["common", "uncommon", "rare", "legendary", "peculiar", "riven", "amalgam", "primed", "galvanized", ""];

// Stat keys the calculator actually reads
const KNOWN_STATS = new Set([
  "damage", "multishot", "criticalChance", "criticalMultiplier", "statusChance",
  "fireRate", "magazine", "reloadSpeed", "accuracy", "punchThrough", "projectileSpeed",
  "impact", "puncture", "slash",
  "heat", "cold", "toxin", "electricity", "blast", "corrosive", "gas", "magnetic", "radiation", "viral",
  "range", "attackSpeed", "comboDuration", "heavyAttack", "heavyAttackWindUp",
  "heavyAttackEfficiency", "channeling", "slideAttack", "finisherDamage",
  "comboEfficiency", "initialCombo",
  "health", "shield", "armor", "energy", "sprintSpeed",
  "abilityStrength", "abilityDuration", "abilityEfficiency", "abilityRange",
  "healthRegen", "energyRegen", "shieldRegen",
  "parkourVelocity", "aimGlide", "wallLatch",
  "knockdownResist", "knockdownRecovery",
  "castingSpeed", "holsterRate",
  "meleeDamage", "companionHealth", "companionShield", "companionArmor",
  "conditionOverload", "bloodRush", "weavingFrame", "gladiatorMight",
  "vigilanteSet", "gladiatorSet",
  "ammoMax", "ammoEfficiency", "recoil", "zoom", "statusDuration",
  "enemyArmor", "shieldGating", "overshield", "tauResist",
]);

let errors = 0, warns = 0, infos = 0;

function err(id: string, msg: string) { errors++; console.log(`  ❌ ERROR  [${id}] ${msg}`); }
function warn(id: string, msg: string) { warns++; console.log(`  ⚠️  WARN   [${id}] ${msg}`); }
function info(id: string, msg: string) { infos++; console.log(`  ℹ️  INFO   [${id}] ${msg}`); }

console.log(`\n🔍 Validating ${allMods.length} mods...\n`);

// Duplicate IDs
const idMap = new Map<string, string>();
const nameMap = new Map<string, string>();
for (const mod of allMods) {
  if (idMap.has(mod.id)) err(mod.id, `Duplicate ID — also used by "${idMap.get(mod.id)}"`);
  idMap.set(mod.id, mod.name);
  if (nameMap.has(mod.name)) warn(mod.id, `Duplicate name "${mod.name}" — also ID "${nameMap.get(mod.name)}"`);
  nameMap.set(mod.name, mod.id);
}

// Per-mod checks
for (const mod of allMods) {
  if (!mod.id?.trim()) err("???", `Missing ID for mod named "${mod.name}"`);
  if (!mod.name?.trim()) err(mod.id, "Missing name");
  if (!mod.description?.trim()) warn(mod.id, "Missing description");

  if (!VALID_POLARITIES.includes(mod.polarity)) err(mod.id, `Invalid polarity "${mod.polarity}"`);
  if (!VALID_CATEGORIES.includes(mod.category)) err(mod.id, `Invalid category "${mod.category}"`);
  if (!VALID_RARITIES.includes(mod.rarity)) warn(mod.id, `Unknown rarity "${mod.rarity}"`);

  if (mod.drain < 0 || mod.drain > 20) warn(mod.id, `Unusual drain: ${mod.drain}`);
  if (mod.maxRank < 0 || mod.maxRank > 10) warn(mod.id, `Unusual maxRank: ${mod.maxRank}`);

  const keys = Object.keys(mod.stats);
  // These categories legitimately may have no calculator stats
  const noStatsOk = ["parazon", "stance", "arcane", "operator", "set", "evolution", "companion_weapon", "companion", "augment"];
  if (keys.length === 0 && !noStatsOk.includes(mod.category)) {
    warn(mod.id, `Empty stats (category: ${mod.category}) — no effect in calculator`);
  }

  for (const key of keys) {
    if (!KNOWN_STATS.has(key)) info(mod.id, `Unknown stat key "${key}" — may not affect calculator`);
    if (mod.stats[key] === 0) warn(mod.id, `Stat "${key}" is 0`);
    if (typeof mod.stats[key] !== "number") err(mod.id, `Stat "${key}" is not a number: ${mod.stats[key]}`);
  }
}

// Summary
console.log(`\n${"─".repeat(60)}`);
console.log(`📊 SUMMARY: ${allMods.length} mods checked`);
console.log(`   ❌ ${errors} errors   ⚠️  ${warns} warnings   ℹ️  ${infos} info`);
if (errors === 0 && warns === 0) console.log(`   ✅ All mods look clean!`);
console.log();
