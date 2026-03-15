// Railjack data: components, armaments, and base stats

export interface RailjackComponent {
  id: string;
  name: string;
  type: "reactor" | "shield" | "engine" | "plating";
  tier: "mk1" | "mk2" | "mk3" | "sigma" | "lavan" | "vidar" | "zetki";
  stats: Record<string, number>;
  description: string;
}

export interface RailjackArmament {
  id: string;
  name: string;
  type: "turret" | "ordnance";
  house: "sigma" | "lavan" | "vidar" | "zetki";
  damage: number;
  critChance: number;
  critMultiplier: number;
  statusChance: number;
  fireRate: number;
  description: string;
}

export const railjackBaseStats = {
  hull: 3000,
  armor: 300,
  shield: 1500,
  speed: 100,
  boostSpeed: 200,
  boostCost: 25,
  fluxCapacity: 200,
};

// ── Reactors ───────────────────────────────────────────────────────
export const reactors: RailjackComponent[] = [
  { id: "sigma_reactor_mk1", name: "Sigma Reactor Mk I", type: "reactor", tier: "sigma", stats: { fluxCapacity: 50, avionicsCapacity: 20 }, description: "Basic Sigma-series reactor" },
  { id: "sigma_reactor_mk2", name: "Sigma Reactor Mk II", type: "reactor", tier: "sigma", stats: { fluxCapacity: 100, avionicsCapacity: 30 }, description: "Improved Sigma-series reactor" },
  { id: "sigma_reactor_mk3", name: "Sigma Reactor Mk III", type: "reactor", tier: "sigma", stats: { fluxCapacity: 150, avionicsCapacity: 40 }, description: "Advanced Sigma-series reactor" },
  { id: "lavan_reactor_mk3", name: "Lavan Reactor Mk III", type: "reactor", tier: "lavan", stats: { fluxCapacity: 200, avionicsCapacity: 30 }, description: "High flux capacity Lavan reactor" },
  { id: "vidar_reactor_mk3", name: "Vidar Reactor Mk III", type: "reactor", tier: "vidar", stats: { fluxCapacity: 150, avionicsCapacity: 50 }, description: "High avionics capacity Vidar reactor" },
  { id: "zetki_reactor_mk3", name: "Zetki Reactor Mk III", type: "reactor", tier: "zetki", stats: { fluxCapacity: 180, avionicsCapacity: 40 }, description: "Balanced Zetki reactor with combat bonuses" },
];

// ── Shield Arrays ──────────────────────────────────────────────────
export const shieldArrays: RailjackComponent[] = [
  { id: "sigma_shield_mk1", name: "Sigma Shield Array Mk I", type: "shield", tier: "sigma", stats: { shieldCapacity: 200, shieldRecharge: 20 }, description: "Basic Sigma shield array" },
  { id: "sigma_shield_mk2", name: "Sigma Shield Array Mk II", type: "shield", tier: "sigma", stats: { shieldCapacity: 400, shieldRecharge: 35 }, description: "Improved Sigma shield array" },
  { id: "sigma_shield_mk3", name: "Sigma Shield Array Mk III", type: "shield", tier: "sigma", stats: { shieldCapacity: 600, shieldRecharge: 50 }, description: "Advanced Sigma shield array" },
  { id: "lavan_shield_mk3", name: "Lavan Shield Array Mk III", type: "shield", tier: "lavan", stats: { shieldCapacity: 800, shieldRecharge: 40 }, description: "High capacity Lavan shield array" },
  { id: "vidar_shield_mk3", name: "Vidar Shield Array Mk III", type: "shield", tier: "vidar", stats: { shieldCapacity: 600, shieldRecharge: 70 }, description: "Fast recharging Vidar shield array" },
  { id: "zetki_shield_mk3", name: "Zetki Shield Array Mk III", type: "shield", tier: "zetki", stats: { shieldCapacity: 700, shieldRecharge: 55 }, description: "Balanced Zetki shield array" },
];

// ── Engines ────────────────────────────────────────────────────────
export const engines: RailjackComponent[] = [
  { id: "sigma_engine_mk1", name: "Sigma Engines Mk I", type: "engine", tier: "sigma", stats: { speed: 20, boostSpeed: 40, boostCostReduction: 0 }, description: "Basic Sigma engines" },
  { id: "sigma_engine_mk2", name: "Sigma Engines Mk II", type: "engine", tier: "sigma", stats: { speed: 40, boostSpeed: 80, boostCostReduction: 5 }, description: "Improved Sigma engines" },
  { id: "sigma_engine_mk3", name: "Sigma Engines Mk III", type: "engine", tier: "sigma", stats: { speed: 60, boostSpeed: 120, boostCostReduction: 10 }, description: "Advanced Sigma engines" },
  { id: "lavan_engine_mk3", name: "Lavan Engines Mk III", type: "engine", tier: "lavan", stats: { speed: 80, boostSpeed: 100, boostCostReduction: 15 }, description: "High cruise speed Lavan engines" },
  { id: "vidar_engine_mk3", name: "Vidar Engines Mk III", type: "engine", tier: "vidar", stats: { speed: 60, boostSpeed: 160, boostCostReduction: 5 }, description: "High boost speed Vidar engines" },
  { id: "zetki_engine_mk3", name: "Zetki Engines Mk III", type: "engine", tier: "zetki", stats: { speed: 70, boostSpeed: 140, boostCostReduction: 10 }, description: "Balanced Zetki engines" },
];

// ── Plating ────────────────────────────────────────────────────────
export const plating: RailjackComponent[] = [
  { id: "sigma_plating_mk1", name: "Sigma Plating Mk I", type: "plating", tier: "sigma", stats: { hullBonus: 300, armorBonus: 50 }, description: "Basic Sigma hull plating" },
  { id: "sigma_plating_mk2", name: "Sigma Plating Mk II", type: "plating", tier: "sigma", stats: { hullBonus: 600, armorBonus: 100 }, description: "Improved Sigma hull plating" },
  { id: "sigma_plating_mk3", name: "Sigma Plating Mk III", type: "plating", tier: "sigma", stats: { hullBonus: 1000, armorBonus: 150 }, description: "Advanced Sigma hull plating" },
  { id: "lavan_plating_mk3", name: "Lavan Plating Mk III", type: "plating", tier: "lavan", stats: { hullBonus: 1500, armorBonus: 100 }, description: "High hull Lavan plating" },
  { id: "vidar_plating_mk3", name: "Vidar Plating Mk III", type: "plating", tier: "vidar", stats: { hullBonus: 1000, armorBonus: 250 }, description: "High armor Vidar plating" },
  { id: "zetki_plating_mk3", name: "Zetki Plating Mk III", type: "plating", tier: "zetki", stats: { hullBonus: 1200, armorBonus: 200 }, description: "Balanced Zetki hull plating" },
];

// ── Turrets ────────────────────────────────────────────────────────
export const turrets: RailjackArmament[] = [
  { id: "sigma_apoc", name: "Sigma Apoc", type: "turret", house: "sigma", damage: 200, critChance: 0.14, critMultiplier: 1.6, statusChance: 0.05, fireRate: 6.7, description: "Rapid-fire ballistic turret" },
  { id: "vidar_apoc", name: "Vidar Apoc", type: "turret", house: "vidar", damage: 280, critChance: 0.18, critMultiplier: 1.8, statusChance: 0.06, fireRate: 6.7, description: "Enhanced Vidar ballistic turret" },
  { id: "zetki_apoc", name: "Zetki Apoc", type: "turret", house: "zetki", damage: 350, critChance: 0.22, critMultiplier: 2.0, statusChance: 0.04, fireRate: 6.7, description: "High-damage Zetki ballistic turret" },
  { id: "lavan_apoc", name: "Lavan Apoc", type: "turret", house: "lavan", damage: 240, critChance: 0.16, critMultiplier: 1.6, statusChance: 0.10, fireRate: 6.7, description: "Status-focused Lavan ballistic turret" },
  { id: "sigma_carcinnox", name: "Sigma Carcinnox", type: "turret", house: "sigma", damage: 90, critChance: 0.10, critMultiplier: 1.4, statusChance: 0.25, fireRate: 12, description: "Rapid-fire status turret" },
  { id: "vidar_carcinnox", name: "Vidar Carcinnox", type: "turret", house: "vidar", damage: 130, critChance: 0.12, critMultiplier: 1.6, statusChance: 0.30, fireRate: 12, description: "Enhanced Vidar rapid turret" },
  { id: "zetki_carcinnox", name: "Zetki Carcinnox", type: "turret", house: "zetki", damage: 160, critChance: 0.14, critMultiplier: 1.8, statusChance: 0.20, fireRate: 12, description: "High-damage Zetki rapid turret" },
  { id: "lavan_carcinnox", name: "Lavan Carcinnox", type: "turret", house: "lavan", damage: 110, critChance: 0.08, critMultiplier: 1.4, statusChance: 0.35, fireRate: 12, description: "High-status Lavan rapid turret" },
  { id: "sigma_photor", name: "Sigma Photor", type: "turret", house: "sigma", damage: 150, critChance: 0.05, critMultiplier: 1.2, statusChance: 0.30, fireRate: 1, description: "Continuous beam turret" },
  { id: "vidar_photor", name: "Vidar Photor", type: "turret", house: "vidar", damage: 210, critChance: 0.08, critMultiplier: 1.4, statusChance: 0.35, fireRate: 1, description: "Enhanced Vidar beam turret" },
  { id: "zetki_photor", name: "Zetki Photor", type: "turret", house: "zetki", damage: 270, critChance: 0.10, critMultiplier: 1.6, statusChance: 0.25, fireRate: 1, description: "High-damage Zetki beam turret" },
  { id: "sigma_pulsar", name: "Sigma Pulsar", type: "turret", house: "sigma", damage: 250, critChance: 0.20, critMultiplier: 2.0, statusChance: 0.10, fireRate: 4, description: "Precision crit turret" },
  { id: "vidar_pulsar", name: "Vidar Pulsar", type: "turret", house: "vidar", damage: 340, critChance: 0.26, critMultiplier: 2.2, statusChance: 0.12, fireRate: 4, description: "Enhanced Vidar precision turret" },
  { id: "zetki_pulsar", name: "Zetki Pulsar", type: "turret", house: "zetki", damage: 420, critChance: 0.30, critMultiplier: 2.4, statusChance: 0.08, fireRate: 4, description: "High-crit Zetki precision turret" },
  { id: "sigma_talyn", name: "Sigma Talyn", type: "turret", house: "sigma", damage: 180, critChance: 0.15, critMultiplier: 1.8, statusChance: 0.15, fireRate: 5, description: "Balanced burst turret" },
  { id: "vidar_talyn", name: "Vidar Talyn", type: "turret", house: "vidar", damage: 250, critChance: 0.18, critMultiplier: 2.0, statusChance: 0.18, fireRate: 5, description: "Enhanced Vidar burst turret" },
  { id: "zetki_talyn", name: "Zetki Talyn", type: "turret", house: "zetki", damage: 310, critChance: 0.22, critMultiplier: 2.2, statusChance: 0.12, fireRate: 5, description: "High-damage Zetki burst turret" },
];

// ── Ordnance ───────────────────────────────────────────────────────
export const ordnance: RailjackArmament[] = [
  { id: "sigma_milati", name: "Sigma Milati", type: "ordnance", house: "sigma", damage: 3000, critChance: 0.10, critMultiplier: 2.0, statusChance: 0.20, fireRate: 0.5, description: "Lock-on guided missile" },
  { id: "vidar_milati", name: "Vidar Milati", type: "ordnance", house: "vidar", damage: 4200, critChance: 0.14, critMultiplier: 2.2, statusChance: 0.22, fireRate: 0.5, description: "Enhanced Vidar guided missile" },
  { id: "zetki_milati", name: "Zetki Milati", type: "ordnance", house: "zetki", damage: 5000, critChance: 0.18, critMultiplier: 2.4, statusChance: 0.15, fireRate: 0.5, description: "High-damage Zetki guided missile" },
  { id: "sigma_tycho_seeker", name: "Sigma Tycho Seeker", type: "ordnance", house: "sigma", damage: 2000, critChance: 0.08, critMultiplier: 1.6, statusChance: 0.30, fireRate: 1.5, description: "Swarm missile launcher" },
  { id: "vidar_tycho_seeker", name: "Vidar Tycho Seeker", type: "ordnance", house: "vidar", damage: 2800, critChance: 0.10, critMultiplier: 1.8, statusChance: 0.35, fireRate: 1.5, description: "Enhanced Vidar swarm missiles" },
  { id: "zetki_tycho_seeker", name: "Zetki Tycho Seeker", type: "ordnance", house: "zetki", damage: 3400, critChance: 0.12, critMultiplier: 2.0, statusChance: 0.25, fireRate: 1.5, description: "High-damage Zetki swarm missiles" },
  { id: "sigma_galvarc", name: "Sigma Galvarc", type: "ordnance", house: "sigma", damage: 4000, critChance: 0.25, critMultiplier: 2.5, statusChance: 0.05, fireRate: 0.3, description: "Chain lightning ordnance" },
  { id: "vidar_galvarc", name: "Vidar Galvarc", type: "ordnance", house: "vidar", damage: 5500, critChance: 0.30, critMultiplier: 2.8, statusChance: 0.06, fireRate: 0.3, description: "Enhanced Vidar chain lightning" },
  { id: "zetki_galvarc", name: "Zetki Galvarc", type: "ordnance", house: "zetki", damage: 6500, critChance: 0.35, critMultiplier: 3.0, statusChance: 0.04, fireRate: 0.3, description: "High-damage Zetki chain lightning" },
];

// Helper to identify Railjack-relevant mods from the "general" category
// In-game these map to Integrated, Battle, and Tactical Plexus mods
export const RAILJACK_MOD_KEYWORDS = [
  "railjack", "turret", "hull", "breach", "flux",
  "ordnance", "crew", "shield recharge", "boost speed",
  "battle", "tactical", "archwing slingshot", "void cloak",
  "fire suppression", "necraweb", "shatter burst", "seeker volley",
  "munitions vortex", "particle ram", "tether", "blackout pulse",
  "void hole", "form up", "recall", "command link", "overseer",
  "flow burn", "intruder stasis", "death blossom", "firestorm",
  "forward artillery",
];

export function isRailjackMod(description: string): boolean {
  const lower = description.toLowerCase();
  return RAILJACK_MOD_KEYWORDS.some((kw) => lower.includes(kw));
}
