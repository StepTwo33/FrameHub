// One-shot: fetch current wiki stats for all archguns — both Archwing (space)
// and Atmosphere (Gravimag) infobox JSON blobs from each weapon page.
import fs from "fs";
import path from "path";
const __dirname = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const PAGES = {
  imperator: "Imperator",
  imperator_vandal: "Imperator_Vandal",
  phaedra: "Phaedra",
  corvas: "Corvas",
  corvas_prime: "Corvas_Prime",
  cyngas: "Cyngas",
  velocitus: "Velocitus",
  grattler: "Grattler",
  kuva_grattler: "Kuva_Grattler",
  fluctus: "Fluctus",
  larkspur: "Larkspur",
  larkspur_prime: "Larkspur_Prime",
  mausolon: "Mausolon",
  morgha: "Morgha",
  arquebex: "Arquebex",
  cortege: "Cortege",
  kuva_ayanga: "Kuva_Ayanga",
  dual_decurion: "Dual_Decurion",
  prisma_dual_decurions: "Prisma_Dual_Decurions",
  mandonel: "Mandonel",
};

function extractBlobs(html) {
  // Anchor on the Slot field, then walk back to the top-level opening brace
  // (depth-balanced backwards) and forward to the closing brace.
  const blobs = [];
  const seen = new Set();
  let idx = 0;
  while (true) {
    const anchor = html.indexOf('"Slot":"Archgun', idx);
    if (anchor === -1) break;
    idx = anchor + 1;
    // Walk backwards to find the enclosing top-level '{'
    let depth = 0, start = -1;
    for (let i = anchor; i >= 0; i--) {
      const c = html[i];
      if (c === "}") depth++;
      else if (c === "{") {
        if (depth === 0) { start = i; break; }
        depth--;
      }
      if (anchor - i > 20000) break;
    }
    if (start === -1 || seen.has(start)) continue;
    seen.add(start);
    depth = 0;
    let end = -1;
    for (let i = start; i < html.length; i++) {
      if (html[i] === "{") depth++;
      else if (html[i] === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    if (end === -1) continue;
    try {
      blobs.push(JSON.parse(html.slice(start, end)));
    } catch { /* skip malformed */ }
  }
  return blobs;
}

const out = {};
for (const [id, page] of Object.entries(PAGES)) {
  try {
    const res = await fetch(`https://wiki.warframe.com/w/${page}`);
    const html = await res.text();
    const blobs = extractBlobs(html);
    const space = blobs.find((b) => !/atmosphere/i.test((b.Slot ?? "") + (b.Name ?? "")) && /archgun/i.test(b.Slot ?? ""));
    const atmos = blobs.find((b) => /atmosphere/i.test((b.Slot ?? "") + (b.Name ?? "")));
    out[id] = { space, atmosphere: atmos };
    console.log(
      (space ? "OK " : "?? "), id.padEnd(22),
      "space:", space ? "yes" : "NO",
      "atmos:", atmos ? "yes" : "NO",
      "| blobs:", blobs.length,
    );
  } catch (e) {
    console.log("ERR", id, e.message);
  }
  await new Promise((r) => setTimeout(r, 250));
}
fs.writeFileSync(path.join(__dirname, "_archgun_wiki.json"), JSON.stringify(out, null, 1));
