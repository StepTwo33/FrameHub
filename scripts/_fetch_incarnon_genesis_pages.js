// One-shot: download wikitext for every "<Weapon> Incarnon Genesis" page.
import fs from "fs";
import path from "path";
const __dirname = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const NAMES = [
  "Boar", "Boltor", "Braton", "Burston", "Dera", "Dread", "Gorgon", "Latron",
  "Paris", "Soma", "Strun", "Sybaris", "Miter", "Torid", "Vasto", "Lex",
  "Lato", "Angstrum", "Atomos", "Bronco", "Cestra", "Despair",
  "Dual Toxocyst", "Furis", "Gammacor", "Kunai", "Sicarus", "Zylok", "Bo",
  "Skana", "Ack & Brunt", "Anku", "Ceramic Dagger", "Dual Ichor", "Furax",
  "Hate", "Magistar", "Nami Solo", "Okina", "Sibear", "Vectis", "Stug",
  "Ballistica", "Destreza", "Obex",
];

// Native incarnon weapons keep evolutions on the weapon page itself.
const NATIVE = ["Felarx", "Innodem", "Laetum", "Phenmor", "Praedos", "Onos", "Ruvox", "Thalys"];

const OUT = path.join(__dirname, "_wiki_incarnon");
fs.mkdirSync(OUT, { recursive: true });

async function main() {
  for (const name of process.argv[2] === "native" ? NATIVE : NAMES) {
    const page = (process.argv[2] === "native" ? name : `${name} Incarnon Genesis`).replace(/ /g, "_");
    const url = `https://wiki.warframe.com/w/Special:Export/${encodeURIComponent(page)}`;
    const prefix = process.argv[2] === "native" ? "native_" : "";
    const file = path.join(OUT, prefix + name.replace(/[^a-z0-9]+/gi, "_").toLowerCase() + ".xml");
    try {
      const res = await fetch(url);
      const text = await res.text();
      fs.writeFileSync(file, text);
      const ok = text.includes("<text");
      console.log((ok ? "OK  " : "MISS"), name, text.length);
    } catch (e) {
      console.log("ERR ", name, e.message);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}
main();
