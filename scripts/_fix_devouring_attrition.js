// One-shot: replace the fabricated Devouring Attrition model (-30% CC, +CM)
// with the real in-game effect: 50% chance for non-critical hits to deal
// +2000% damage (wiki: Laetum/Phenmor Evolution V).
import fs from "fs";
const path = "src/data/incarnon.ts";
let src = fs.readFileSync(path, "utf8");

const NEW =
  'name: "Devouring Attrition", description: "50% chance to deal +2000% Damage on non-critical hits.", statChanges: { devouringAttrition: 20 } }';

const OLD_25 =
  /name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal \+2500% Damage\.", statChanges: \{ criticalChance: -0\.3, criticalMultiplier: 25(?:\.0)? \} \}/g;
const OLD_2_5 =
  /name: "Devouring Attrition", description: "-30% Critical Chance, but Critical Hits deal \+250% Damage\.", statChanges: \{ criticalChance: -0\.3, criticalMultiplier: 2\.5 \} \}/g;
const OLD_EMPTY =
  /name: "Devouring Attrition", description: "50% chance to deal \+2000% Damage on non-critical hits\.", statChanges: \{\} \}/g;
const OLD_DEVASTATING =
  /name: "Devastating Attrition", description: "50% chance to deal \+2000% damage on non-critical hits\.", statChanges: \{\} \}/g;

let n = 0;
src = src.replace(OLD_25, () => (n++, NEW));
src = src.replace(OLD_2_5, () => (n++, NEW));
src = src.replace(OLD_EMPTY, () => (n++, NEW));
src = src.replace(OLD_DEVASTATING, () =>
  (n++, NEW.replace("Devouring", "Devastating")));

fs.writeFileSync(path, src);
console.log("replaced:", n);
