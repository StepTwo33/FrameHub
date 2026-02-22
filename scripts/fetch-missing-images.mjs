/**
 * Fetch missing item images from the Warframe Wiki (warframe.fandom.com)
 * Uses the MediaWiki API to resolve image URLs, then downloads them.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const WIKI_API = "https://warframe.fandom.com/api.php";
const DELAY_MS = 300; // polite delay between requests

// ── Helpers ──────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractNames(file, onlyFirst = false) {
  const data = readFileSync(join(ROOT, file), "utf8");
  if (onlyFirst) {
    // For warframes: only first "name" per object block (split on top-level object boundaries)
    const blocks = data.split(/\n  \{/);
    const names = [];
    for (const block of blocks) {
      const m = block.match(/"name":\s*"([^"]+)"/);
      if (m) names.push(m[1]);
    }
    return names;
  }
  return [...data.matchAll(/"name":\s*"([^"]+)"/g)].map((m) => m[1]);
}

function getMissing(names, category) {
  const dir = join(ROOT, "public/images", category);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const existing = new Set(readdirSync(dir).map((f) => f.replace(".png", "")));
  return names.filter((n) => !existing.has(n.replace(/ /g, "_")));
}

async function queryWikiImageUrl(fileTitle) {
  const params = new URLSearchParams({
    action: "query",
    titles: `File:${fileTitle}`,
    prop: "imageinfo",
    iiprop: "url",
    format: "json",
  });
  const resp = await fetch(`${WIKI_API}?${params}`);
  const data = await resp.json();
  const pages = data?.query?.pages;
  if (!pages) return null;
  for (const page of Object.values(pages)) {
    if (page.missing !== undefined) continue;
    const url = page.imageinfo?.[0]?.url;
    if (url) return url;
  }
  return null;
}

async function downloadImage(url, destPath) {
  const resp = await fetch(url);
  if (!resp.ok) return false;
  const buffer = Buffer.from(await resp.arrayBuffer());
  writeFileSync(destPath, buffer);
  return true;
}

// ── Filename patterns to try on the wiki ─────────────────────────────────

function warframePatterns(name) {
  const clean = name.replace(/ /g, "").replace(/-/g, "");
  const cleanHyphen = name.replace(/ /g, "");
  return [
    `${clean}Icon.png`,
    `${cleanHyphen}Icon.png`,
    `${clean}DE.png`,
    `${clean}.png`,
    `${clean}Portrait.png`,
    `Warframe${clean}Icon.png`,
  ];
}

function weaponPatterns(name) {
  // Handle names with parentheses: "Regulators (Mesa)" → "RegulatorsMesa"
  const clean = name.replace(/[() ]/g, "").replace(/&/g, "And").replace(/-/g, "");
  const underscored = name.replace(/ /g, "_");
  return [
    `${clean}.png`,
    `${underscored}.png`,
    `${clean}DEIcon.png`,
    `${clean}Icon.png`,
    `DEWeapon${clean}.png`,
    `${name.replace(/ /g, "")}.png`,
  ];
}

function companionPatterns(name) {
  const clean = name.replace(/ /g, "");
  return [
    `${clean}Icon.png`,
    `${clean}.png`,
    `${clean}DEIcon.png`,
    `Companion${clean}Icon.png`,
  ];
}

// ── Main ─────────────────────────────────────────────────────────────────

async function fetchCategory(missingNames, category, patternsFn) {
  const dir = join(ROOT, "public/images", category);
  let downloaded = 0;
  let failed = 0;
  const failures = [];

  for (const name of missingNames) {
    const patterns = patternsFn(name);
    let found = false;

    for (const pattern of patterns) {
      const url = await queryWikiImageUrl(pattern);
      if (url) {
        const dest = join(dir, name.replace(/ /g, "_") + ".png");
        const ok = await downloadImage(url, dest);
        if (ok) {
          console.log(`  ✓ ${name} (via ${pattern})`);
          downloaded++;
          found = true;
          break;
        }
      }
      await sleep(DELAY_MS);
    }

    if (!found) {
      console.log(`  ✗ ${name} (no match found)`);
      failed++;
      failures.push(name);
    }
  }

  return { downloaded, failed, failures };
}

async function main() {
  console.log("Fetching missing images from Warframe Wiki...\n");

  // Gather missing items
  const wfNames = extractNames("src/data/warframes.ts", true);
  const weaponNames = extractNames("src/data/weapons.ts");
  const compNames = extractNames("src/data/companions.ts");

  const missingWf = getMissing(wfNames, "warframes");
  const missingW = getMissing(weaponNames, "weapons");
  const missingC = getMissing(compNames, "companions");

  console.log(`Missing: ${missingWf.length} warframes, ${missingW.length} weapons, ${missingC.length} companions\n`);

  // Warframes
  if (missingWf.length > 0) {
    console.log("── Warframes ──");
    const r = await fetchCategory(missingWf, "warframes", warframePatterns);
    console.log(`   ${r.downloaded} downloaded, ${r.failed} failed\n`);
    if (r.failures.length) console.log("   Failed:", r.failures.join(", "), "\n");
  }

  // Weapons
  if (missingW.length > 0) {
    console.log("── Weapons ──");
    const r = await fetchCategory(missingW, "weapons", weaponPatterns);
    console.log(`   ${r.downloaded} downloaded, ${r.failed} failed\n`);
    if (r.failures.length) console.log("   Failed:", r.failures.join(", "), "\n");
  }

  // Companions
  if (missingC.length > 0) {
    console.log("── Companions ──");
    const r = await fetchCategory(missingC, "companions", companionPatterns);
    console.log(`   ${r.downloaded} downloaded, ${r.failed} failed\n`);
    if (r.failures.length) console.log("   Failed:", r.failures.join(", "), "\n");
  }

  console.log("Done!");
}

main().catch(console.error);
