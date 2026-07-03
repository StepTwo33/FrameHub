/**
 * Radial / AoE attack profiles sourced from https://wiki.warframe.com Module:Weapons/data.
 * Merged onto weapons in use-data.ts and loadout-stats.ts.
 * Regenerate: python scripts/generate_radial_attacks.py
 */

import type { WeaponRadialAttack } from "@/lib/types";

export const WEAPON_RADIAL_ATTACKS: Record<string, WeaponRadialAttack[]> = 
{
  "acceltra_prime": [
    {
      "name": "Rocket Explosion",
      "puncture": 42.4,
      "slash": 10.6,
      "totalDamage": 53.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    }
  ],
  "alternox_prime": [
    {
      "name": "Alt-Fire Explosion",
      "electricity": 140.0,
      "totalDamage": 140.0,
      "radius": 6.0,
      "falloffReduction": 0.6,
      "explosionDelay": 10.0
    }
  ],
  "artemis_bow": [
    {
      "name": "Concentrated Arrow Uncharged Headshot Explosion",
      "blast": 500.0,
      "totalDamage": 500.0,
      "radius": 7.0,
      "falloffReduction": 0.0
    },
    {
      "name": "Concentrated Arrow Uncharged Headshot Explosion",
      "blast": 500.0,
      "totalDamage": 500.0,
      "radius": 7.0,
      "falloffReduction": 0.0
    }
  ],
  "artemis_bow_prime": [
    {
      "name": "Concentrated Arrow Uncharged Headshot Explosion",
      "blast": 500.0,
      "totalDamage": 500.0,
      "radius": 7.0,
      "falloffReduction": 0.0
    },
    {
      "name": "Concentrated Arrow Uncharged Headshot Explosion",
      "blast": 500.0,
      "totalDamage": 500.0,
      "radius": 7.0,
      "falloffReduction": 0.0
    }
  ],
  "astilla_prime": [
    {
      "name": "Glass Explosion",
      "puncture": 49.0,
      "slash": 91.0,
      "totalDamage": 140.0,
      "radius": 2.4,
      "falloffReduction": 0.3
    }
  ],
  "braton_prime": [
    {
      "name": "Incarnon Form AoE",
      "heat": 70.0,
      "totalDamage": 70.0,
      "radius": 3.0,
      "falloffReduction": 0.1
    }
  ],
  "braton_vandal": [
    {
      "name": "Incarnon Form AoE",
      "heat": 65.0,
      "totalDamage": 65.0,
      "radius": 3.0,
      "falloffReduction": 0.1
    }
  ],
  "burston_prime": [
    {
      "name": "Incarnon Form Radial Attack",
      "heat": 13.0,
      "totalDamage": 13.0,
      "radius": 2.0,
      "falloffReduction": 1.0
    }
  ],
  "carmine_penta": [
    {
      "name": "Grenade Detonation",
      "blast": 350.0,
      "totalDamage": 350.0,
      "radius": 4.0,
      "falloffReduction": 0.5
    }
  ],
  "cedo_prime": [
    {
      "name": "Glaive Radial Attack",
      "blast": 10.0,
      "totalDamage": 10.0,
      "radius": 6.0,
      "falloffReduction": 0.0
    }
  ],
  "coda_bubonico": [
    {
      "name": "Radial Attack",
      "viral": 143.0,
      "totalDamage": 143.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    }
  ],
  "coda_sporothrix": [
    {
      "name": "AoE",
      "slash": 25.0,
      "viral": 23.0,
      "totalDamage": 48.0,
      "radius": 2.0,
      "falloffReduction": 0.1,
      "explosionDelay": 0.9
    }
  ],
  "corinth_prime": [
    {
      "name": "Air Burst Explosion",
      "blast": 2200.0,
      "totalDamage": 2200.0,
      "radius": 9.8,
      "falloffReduction": 0.9
    }
  ],
  "gorgon_wraith": [
    {
      "name": "Incarnon Form AoE",
      "heat": 750.0,
      "totalDamage": 750.0,
      "radius": 5.0,
      "falloffReduction": 0.1,
      "explosionDelay": 0.9
    }
  ],
  "kuva_bramma": [
    {
      "name": "Radial Attack",
      "blast": 839.0,
      "totalDamage": 839.0,
      "radius": 8.3,
      "falloffReduction": 0.9
    },
    {
      "name": "Cluster Bomb Explosion",
      "blast": 57.0,
      "totalDamage": 57.0,
      "radius": 3.5,
      "falloffReduction": 0.5
    }
  ],
  "kuva_chakkhurr": [
    {
      "name": "Explosion",
      "blast": 25.0,
      "puncture": 52.0,
      "slash": 29.0,
      "totalDamage": 106.0,
      "radius": 2.9,
      "falloffReduction": 0.3
    }
  ],
  "kuva_ogris": [
    {
      "name": "Rocket Explosion",
      "blast": 349.0,
      "puncture": 183.0,
      "slash": 155.0,
      "totalDamage": 687.0,
      "radius": 7.9,
      "falloffReduction": 0.8
    }
  ],
  "kuva_tonkor": [
    {
      "name": "Grenade Explosion",
      "blast": 302.0,
      "puncture": 168.0,
      "slash": 204.0,
      "totalDamage": 674.0,
      "radius": 7.0,
      "falloffReduction": 0.7
    }
  ],
  "kuva_zarr": [
    {
      "name": "Cannon Mode Explosion",
      "blast": 673.0,
      "totalDamage": 673.0,
      "radius": 7.0,
      "falloffReduction": 0.7
    },
    {
      "name": "Cannon Mode Cluster Bomb Explosion",
      "blast": 50.0,
      "totalDamage": 50.0,
      "radius": 3.0,
      "falloffReduction": 0.1
    }
  ],
  "latron_prime": [
    {
      "name": "Incarnon Form AoE",
      "heat": 70.0,
      "puncture": 70.0,
      "totalDamage": 140.0,
      "radius": 4.0,
      "falloffReduction": 0.2
    }
  ],
  "latron_wraith": [
    {
      "name": "Incarnon Form AoE",
      "heat": 50.0,
      "puncture": 50.0,
      "totalDamage": 100.0,
      "radius": 4.0,
      "falloffReduction": 0.2
    }
  ],
  "mk1_braton": [
    {
      "name": "Incarnon Form AoE",
      "heat": 50.0,
      "totalDamage": 50.0,
      "radius": 3.0,
      "falloffReduction": 0.1
    }
  ],
  "mk1_strun": [
    {
      "name": "Incarnon Form AoE",
      "blast": 45.0,
      "puncture": 25.0,
      "slash": 60.0,
      "totalDamage": 130.0,
      "radius": 4.0,
      "falloffReduction": 0.2
    }
  ],
  "mutalist_cernos": [
    {
      "name": "Toxin Cloud",
      "toxin": 5.0,
      "totalDamage": 5.0,
      "radius": 2.5,
      "falloffReduction": 0.0,
      "explosionDelay": 0.25
    }
  ],
  "mutalist_quanta": [
    {
      "name": "Orb Explosion",
      "toxin": 100.0,
      "totalDamage": 100.0,
      "radius": 4.4,
      "falloffReduction": 0.5
    }
  ],
  "opticor_vandal": [
    {
      "name": "Quick Shot AoE",
      "magnetic": 100.0,
      "totalDamage": 100.0,
      "radius": 4.6,
      "falloffReduction": 0.6
    }
  ],
  "panthera_prime": [
    {
      "name": "Radial Attack",
      "slash": 20.0,
      "totalDamage": 20.0,
      "radius": 1.6,
      "falloffReduction": 0.2
    }
  ],
  "phantasma_prime": [
    {
      "name": "Plasma Bomb Explosion",
      "radiation": 73.0,
      "totalDamage": 73.0,
      "radius": 4.8,
      "falloffReduction": 0.5
    },
    {
      "name": "Cluster Bombs Explosion",
      "radiation": 18.0,
      "totalDamage": 18.0,
      "radius": 2.0
    }
  ],
  "prisma_gorgon": [
    {
      "name": "Incarnon Form AoE",
      "heat": 700.0,
      "totalDamage": 700.0,
      "radius": 5.0,
      "falloffReduction": 0.1,
      "explosionDelay": 0.8
    }
  ],
  "prisma_lenz": [
    {
      "name": "Initial Blast",
      "cold": 10.0,
      "totalDamage": 10.0,
      "radius": 7.2,
      "falloffReduction": 0.7
    },
    {
      "name": "Bubble Collapse",
      "blast": 740.0,
      "totalDamage": 740.0,
      "radius": 7.2,
      "falloffReduction": 0.7,
      "explosionDelay": 1.3
    }
  ],
  "proboscis_cernos": [
    {
      "name": "Appendages",
      "slash": 50.625,
      "viral": 39.375,
      "totalDamage": 90.0,
      "radius": 9.0,
      "falloffReduction": 0.0
    },
    {
      "name": "Charged Shot Explosion",
      "viral": 1003.0,
      "totalDamage": 1003.0,
      "radius": 7.0,
      "falloffReduction": 0.5,
      "explosionDelay": 1.7
    }
  ],
  "quanta_vandal": [
    {
      "name": "Cube Explosion",
      "blast": 150.0,
      "totalDamage": 150.0,
      "radius": 0.5,
      "falloffReduction": 0.0
    }
  ],
  "scourge_prime": [
    {
      "name": "Explosion",
      "corrosive": 60.0,
      "totalDamage": 60.0,
      "radius": 1.7,
      "falloffReduction": 0.3
    },
    {
      "name": "Spear Explosion",
      "corrosive": 55.0,
      "totalDamage": 55.0,
      "radius": 7.0,
      "falloffReduction": 0.6
    }
  ],
  "secura_penta": [
    {
      "name": "Grenade Detonation",
      "blast": 300.0,
      "totalDamage": 300.0,
      "radius": 6.0,
      "falloffReduction": 0.6
    }
  ],
  "strun_prime": [
    {
      "name": "Incarnon Form AoE",
      "blast": 60.0,
      "puncture": 40.0,
      "slash": 100.0,
      "totalDamage": 200.0,
      "radius": 4.0,
      "falloffReduction": 0.2
    }
  ],
  "strun_wraith": [
    {
      "name": "Incarnon Form AoE",
      "blast": 70.0,
      "puncture": 40.0,
      "slash": 90.0,
      "totalDamage": 200.0,
      "radius": 4.0,
      "falloffReduction": 0.2
    }
  ],
  "synoid_simulor": [
    {
      "name": "Orb Merging Damage",
      "magnetic": 125.0,
      "totalDamage": 125.0,
      "radius": 4.0,
      "falloffReduction": 0.0
    },
    {
      "name": "Orb Explosion",
      "magnetic": 240.0,
      "totalDamage": 240.0,
      "radius": 5.0,
      "falloffReduction": 1.0
    }
  ],
  "tenet_envoy": [
    {
      "name": "Rocket Explosion",
      "cold": 640.0,
      "totalDamage": 640.0,
      "radius": 8.0,
      "falloffReduction": 0.8
    }
  ],
  "tenet_ferrox": [
    {
      "name": "Radial Attack",
      "impact": 6.0,
      "puncture": 42.0,
      "slash": 12.0,
      "totalDamage": 60.0,
      "radius": 4.0,
      "falloffReduction": 0.3
    },
    {
      "name": "Attraction Field",
      "electricity": 150.0,
      "totalDamage": 150.0,
      "radius": 10.0
    }
  ],
  "tenet_quanta": [
    {
      "name": "Cube Explosion",
      "blast": 150.0,
      "totalDamage": 150.0,
      "radius": 0.5,
      "falloffReduction": 0.0
    }
  ],
  "tenet_tetra": [
    {
      "name": "Grenade AoE",
      "blast": 1000.0,
      "totalDamage": 1000.0,
      "radius": 8.0,
      "falloffReduction": 0.6
    }
  ],
  "trumna_prime": [
    {
      "name": "Auto AoE",
      "heat": 50.0,
      "totalDamage": 50.0,
      "radius": 1.6,
      "falloffReduction": 0.15
    },
    {
      "name": "Grenade Bounce AoE",
      "heat": 1150.0,
      "totalDamage": 1150.0,
      "radius": 6.0,
      "falloffReduction": 0.4
    }
  ],
  "vectis_prime": [
    {
      "name": "Incarnon Form Headshot AoE",
      "cold": 150.0,
      "totalDamage": 150.0,
      "radius": 6.7,
      "falloffReduction": 0.0
    },
    {
      "name": "Incarnon Form Embed AoE",
      "cold": 25.0,
      "totalDamage": 25.0,
      "radius": 0.15,
      "falloffReduction": 0.0
    }
  ],
  "zhuge_prime": [
    {
      "name": "Arrow Explosion",
      "impact": 11.2,
      "puncture": 4.0,
      "slash": 24.8,
      "totalDamage": 40.0,
      "radius": 2.6,
      "falloffReduction": 0.3,
      "explosionDelay": 0.6
    }
  ],
  "akarius_prime": [
    {
      "name": "Rocket Detonation",
      "blast": 509.0,
      "totalDamage": 509.0,
      "radius": 7.8,
      "falloffReduction": 0.7
    }
  ],
  "coda_catabolyst": [
    {
      "name": "Partial Reload Explosion",
      "corrosive": 74.0,
      "totalDamage": 74.0,
      "radius": 3.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Reload From Empty Explosion",
      "corrosive": 658.0,
      "totalDamage": 658.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    }
  ],
  "coda_pox": [
    {
      "name": "Poison Cloud",
      "toxin": 35.0,
      "totalDamage": 35.0,
      "radius": 2.8,
      "falloffReduction": 0.0
    }
  ],
  "efv_8_mars": [
    {
      "name": "Alt-Fire AoE",
      "corrosive": 313.0,
      "totalDamage": 313.0,
      "radius": 3.0,
      "falloffReduction": 0.8
    }
  ],
  "epitaph_prime": [
    {
      "name": "Uncharged AoE",
      "blast": 30.0,
      "totalDamage": 30.0,
      "radius": 10.0,
      "falloffReduction": 0.8
    }
  ],
  "kompressa_prime": [
    {
      "name": "Explosion",
      "viral": 46.0,
      "totalDamage": 46.0,
      "radius": 2.8,
      "falloffReduction": 0.2,
      "explosionDelay": 0.6
    }
  ],
  "kuva_seer": [
    {
      "name": "Explosion",
      "corrosive": 69.0,
      "totalDamage": 69.0,
      "radius": 2.3,
      "falloffReduction": 0.3
    }
  ],
  "prisma_angstrum": [
    {
      "name": "Single Rocket Explosion",
      "blast": 250.0,
      "totalDamage": 250.0,
      "radius": 3.6,
      "falloffReduction": 0.4
    }
  ],
  "riot_848": [
    {
      "name": "Radial Attack",
      "blast": 48.0,
      "totalDamage": 48.0,
      "radius": 1.5,
      "falloffReduction": 0.5
    }
  ],
  "sancti_castanas": [
    {
      "name": "Embedded Detonation",
      "electricity": 300.0,
      "totalDamage": 300.0,
      "radius": 3.6,
      "falloffReduction": 0.4
    }
  ],
  "synoid_gammacor": [
    {
      "name": "Incarnon Form Radial Attack",
      "cold": 800.0,
      "totalDamage": 800.0,
      "radius": 5.0,
      "falloffReduction": 0.3,
      "explosionDelay": 1.2
    }
  ],
  "tenet_plinx": [
    {
      "name": "Alt-Fire AoE",
      "radiation": 100.0,
      "totalDamage": 100.0,
      "radius": 6.0,
      "falloffReduction": 0.4
    }
  ],
  "tenet_spirex": [
    {
      "name": "Explosion",
      "heat": 80.0,
      "totalDamage": 80.0,
      "radius": 2.0,
      "falloffReduction": 0.2
    }
  ],
  "zakti_prime": [
    {
      "name": "Gas Cloud",
      "gas": 100.0,
      "totalDamage": 100.0,
      "radius": 3.8,
      "falloffReduction": 0.0
    }
  ],
  "zylok_prime": [
    {
      "name": "Incarnon Form Radial Attack",
      "heat": 700.0,
      "totalDamage": 700.0,
      "radius": 6.0,
      "falloffReduction": 0.6
    }
  ],
  "ankyros_prime": [
    {
      "name": "Slam Attack",
      "impact": 256.0,
      "totalDamage": 256.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 384.0,
      "totalDamage": 384.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "arca_titron": [
    {
      "name": "Slam Attack",
      "electricity": 720.0,
      "totalDamage": 720.0,
      "radius": 9.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "electricity": 1080.0,
      "totalDamage": 1080.0,
      "radius": 10.0,
      "falloffReduction": 0.3
    }
  ],
  "arum_spinosa": [
    {
      "name": "Slam Attack",
      "impact": 594.0,
      "totalDamage": 594.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 891.0,
      "totalDamage": 891.0,
      "radius": 6.0,
      "falloffReduction": 0.3
    }
  ],
  "bo_prime": [
    {
      "name": "Slam Attack",
      "impact": 352.0,
      "totalDamage": 352.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 528.0,
      "totalDamage": 528.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "broken_scepter": [
    {
      "name": "Slam Attack",
      "impact": 358.0,
      "totalDamage": 358.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 537.0,
      "totalDamage": 537.0,
      "radius": 7.0,
      "falloffReduction": 0.3
    }
  ],
  "broken_war": [
    {
      "name": "Slam Attack",
      "impact": 374.0,
      "totalDamage": 374.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 561.0,
      "totalDamage": 561.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "ceramic_dagger": [
    {
      "name": "Spectral Dagger Explosion",
      "heat": 350.0,
      "totalDamage": 350.0,
      "radius": 4.0,
      "falloffReduction": 0.3
    },
    {
      "name": "Slam Attack",
      "impact": 280.0,
      "totalDamage": 280.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 420.0,
      "totalDamage": 420.0,
      "radius": 6.0,
      "falloffReduction": 0.3
    }
  ],
  "ceti_lacera": [
    {
      "name": "Slam Attack",
      "electricity": 432.0,
      "totalDamage": 432.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "electricity": 648.0,
      "totalDamage": 648.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "coda_caustacyst": [
    {
      "name": "Slam Attack",
      "impact": 570.0,
      "totalDamage": 570.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 855.0,
      "totalDamage": 855.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "coda_hirudo": [
    {
      "name": "Slam Attack",
      "impact": 350.0,
      "totalDamage": 350.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 525.0,
      "totalDamage": 525.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "coda_mire": [
    {
      "name": "Slam Attack",
      "toxin": 470.0,
      "totalDamage": 470.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "toxin": 705.0,
      "totalDamage": 705.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "coda_motovore": [
    {
      "name": "Slam Attack",
      "impact": 166.5,
      "puncture": 166.5,
      "slash": 167.0,
      "totalDamage": 500.0,
      "radius": 9.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "impact": 249.75,
      "puncture": 249.75,
      "slash": 250.5,
      "totalDamage": 750.0,
      "radius": 10.0,
      "falloffReduction": 0.3
    }
  ],
  "coda_pathocyst": [
    {
      "name": "Throw Bounce Explosion",
      "viral": 405.0,
      "totalDamage": 405.0,
      "radius": 4.9,
      "falloffReduction": 0.5
    },
    {
      "name": "Throw Recall Explosion",
      "viral": 810.0,
      "totalDamage": 810.0,
      "radius": 4.9,
      "falloffReduction": 0.0
    },
    {
      "name": "Charged Throw Bounce Explosion",
      "viral": 810.0,
      "totalDamage": 810.0,
      "radius": 4.9,
      "falloffReduction": 0.5
    },
    {
      "name": "Charged Throw Recall Explosion",
      "viral": 1620.0,
      "totalDamage": 1620.0,
      "radius": 4.9,
      "falloffReduction": 0.0
    },
    {
      "name": "Slam Attack",
      "viral": 540.0,
      "totalDamage": 540.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "viral": 810.0,
      "totalDamage": 810.0,
      "radius": 6.0,
      "falloffReduction": 0.3
    }
  ],
  "dakra_prime": [
    {
      "name": "Slam Attack",
      "impact": 340.0,
      "totalDamage": 340.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 510.0,
      "totalDamage": 510.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "dark_dagger": [
    {
      "name": "Slam Attack",
      "impact": 308.0,
      "totalDamage": 308.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "radiation": 462.0,
      "totalDamage": 462.0,
      "radius": 6.0,
      "falloffReduction": 0.3
    }
  ],
  "dark_sword": [
    {
      "name": "Slam Attack",
      "toxin": 520.0,
      "totalDamage": 520.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "toxin": 780.0,
      "totalDamage": 780.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "desert_wind": [
    {
      "name": "Slam Attack",
      "impact": 500.0,
      "totalDamage": 500.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 750.0,
      "totalDamage": 750.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "desert_wind_prime": [
    {
      "name": "Slam Attack",
      "impact": 500.0,
      "totalDamage": 500.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 750.0,
      "totalDamage": 750.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "destreza_prime": [
    {
      "name": "Slam Attack",
      "impact": 340.0,
      "totalDamage": 340.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 510.0,
      "totalDamage": 510.0,
      "radius": 7.0,
      "falloffReduction": 0.3
    }
  ],
  "dex_dakra": [
    {
      "name": "Slam Attack",
      "blast": 284.0,
      "totalDamage": 284.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 426.0,
      "totalDamage": 426.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "dex_nikana": [
    {
      "name": "Slam Attack",
      "impact": 336.0,
      "totalDamage": 336.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 504.0,
      "totalDamage": 504.0,
      "radius": 7.0,
      "falloffReduction": 0.3
    }
  ],
  "dragon_nikana": [
    {
      "name": "Slam Attack",
      "impact": 376.0,
      "totalDamage": 376.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 564.0,
      "totalDamage": 564.0,
      "radius": 7.0,
      "falloffReduction": 0.3
    }
  ],
  "dual_cleavers": [
    {
      "name": "Slam Attack",
      "impact": 314.0,
      "totalDamage": 314.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 471.0,
      "totalDamage": 471.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "dual_ether": [
    {
      "name": "Slam Attack",
      "impact": 360.0,
      "totalDamage": 360.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 540.0,
      "totalDamage": 540.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "dual_heat_swords": [
    {
      "name": "Slam Attack",
      "heat": 294.0,
      "totalDamage": 294.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "heat": 441.0,
      "totalDamage": 441.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "dual_ichor": [
    {
      "name": "Slam Attack",
      "impact": 244.0,
      "totalDamage": 244.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 366.0,
      "totalDamage": 366.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "dual_kamas": [
    {
      "name": "Slam Attack",
      "impact": 192.0,
      "totalDamage": 192.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 288.0,
      "totalDamage": 288.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "dual_kamas_prime": [
    {
      "name": "Slam Attack",
      "impact": 320.0,
      "totalDamage": 320.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 480.0,
      "totalDamage": 480.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "dual_keres": [
    {
      "name": "Slam Attack",
      "impact": 230.0,
      "totalDamage": 230.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 345.0,
      "totalDamage": 345.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "dual_keres_prime": [
    {
      "name": "Slam Attack",
      "impact": 360.0,
      "totalDamage": 360.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 540.0,
      "totalDamage": 540.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "dual_raza": [
    {
      "name": "Slam Attack",
      "impact": 220.0,
      "totalDamage": 220.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 330.0,
      "totalDamage": 330.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "dual_skana": [
    {
      "name": "Slam Attack",
      "impact": 240.0,
      "totalDamage": 240.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 360.0,
      "totalDamage": 360.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "dual_viciss": [
    {
      "name": "Slam Attack",
      "gas": 510.0,
      "totalDamage": 510.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "gas": 765.0,
      "totalDamage": 765.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "dual_zoren": [
    {
      "name": "Slam Attack",
      "impact": 140.0,
      "totalDamage": 140.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 210.0,
      "totalDamage": 210.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "dual_zoren_prime": [
    {
      "name": "Slam Attack",
      "impact": 280.0,
      "totalDamage": 280.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 420.0,
      "totalDamage": 420.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "ether_daggers": [
    {
      "name": "Slam Attack",
      "impact": 448.0,
      "totalDamage": 448.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 672.0,
      "totalDamage": 672.0,
      "radius": 7.0,
      "falloffReduction": 0.3
    }
  ],
  "ether_reaper": [
    {
      "name": "Slam Attack",
      "impact": 360.0,
      "totalDamage": 360.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 540.0,
      "totalDamage": 540.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "ether_sword": [
    {
      "name": "Slam Attack",
      "radiation": 384.0,
      "totalDamage": 384.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "radiation": 576.0,
      "totalDamage": 576.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "exalted_blade": [
    {
      "name": "Slam Attack",
      "impact": 500.0,
      "totalDamage": 500.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 750.0,
      "totalDamage": 750.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "fang_prime": [
    {
      "name": "Slam Attack",
      "impact": 356.0,
      "totalDamage": 356.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 534.0,
      "totalDamage": 534.0,
      "radius": 7.0,
      "falloffReduction": 0.3
    }
  ],
  "fragor_prime": [
    {
      "name": "Slam Attack",
      "impact": 540.0,
      "totalDamage": 540.0,
      "radius": 9.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 810.0,
      "totalDamage": 810.0,
      "radius": 10.0,
      "falloffReduction": 0.3
    }
  ],
  "galariak_prime": [
    {
      "name": "Slam Attack",
      "impact": 702.0,
      "totalDamage": 702.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 1170.0,
      "totalDamage": 1170.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "galatine_prime": [
    {
      "name": "Slam Attack",
      "impact": 560.0,
      "totalDamage": 560.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 840.0,
      "totalDamage": 840.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "gazal_machete": [
    {
      "name": "Slam Attack",
      "impact": 356.0,
      "totalDamage": 356.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 534.0,
      "totalDamage": 534.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "glaive_prime": [
    {
      "name": "Throw Bounce Explosion",
      "blast": 296.0,
      "totalDamage": 296.0,
      "radius": 4.8,
      "falloffReduction": 0.4
    },
    {
      "name": "Throw Recall Explosion",
      "blast": 592.0,
      "totalDamage": 592.0,
      "radius": 4.8,
      "falloffReduction": 0.0
    },
    {
      "name": "Charged Throw Bounce Explosion",
      "blast": 592.0,
      "totalDamage": 592.0,
      "radius": 4.8,
      "falloffReduction": 0.4
    },
    {
      "name": "Charged Throw Recall Explosion",
      "blast": 1184.0,
      "totalDamage": 1184.0,
      "radius": 4.8,
      "falloffReduction": 0.0
    },
    {
      "name": "Slam Attack",
      "impact": 328.0,
      "totalDamage": 328.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 492.0,
      "totalDamage": 492.0,
      "radius": 6.0,
      "falloffReduction": 0.3
    }
  ],
  "gram_prime": [
    {
      "name": "Slam Attack",
      "impact": 600.0,
      "totalDamage": 600.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 900.0,
      "totalDamage": 900.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "guandao_prime": [
    {
      "name": "Slam Attack",
      "impact": 480.0,
      "totalDamage": 480.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 720.0,
      "totalDamage": 720.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "gunsen_prime": [
    {
      "name": "Slam Attack",
      "impact": 450.0,
      "totalDamage": 450.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 675.0,
      "totalDamage": 675.0,
      "radius": 6.0,
      "falloffReduction": 0.3
    }
  ],
  "halikar_wraith": [
    {
      "name": "Throw Bounce Explosion",
      "blast": 329.0,
      "totalDamage": 329.0,
      "radius": 5.1,
      "falloffReduction": 0.4
    },
    {
      "name": "Throw Recall Explosion",
      "blast": 658.0,
      "totalDamage": 658.0,
      "radius": 5.1,
      "falloffReduction": 0.0
    },
    {
      "name": "Charged Throw Bounce Explosion",
      "blast": 657.0,
      "totalDamage": 657.0,
      "radius": 5.1,
      "falloffReduction": 0.4
    },
    {
      "name": "Charged Throw Recall Explosion",
      "blast": 1314.0,
      "totalDamage": 1314.0,
      "radius": 5.1,
      "falloffReduction": 0.0
    },
    {
      "name": "Slam Attack",
      "magnetic": 450.0,
      "totalDamage": 450.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "magnetic": 675.0,
      "totalDamage": 675.0,
      "radius": 6.0,
      "falloffReduction": 0.3
    }
  ],
  "heat_dagger": [
    {
      "name": "Slam Attack",
      "heat": 416.0,
      "totalDamage": 416.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "heat": 624.0,
      "totalDamage": 624.0,
      "radius": 6.0,
      "falloffReduction": 0.3
    }
  ],
  "heat_sword": [
    {
      "name": "Slam Attack",
      "heat": 294.0,
      "totalDamage": 294.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "heat": 441.0,
      "totalDamage": 441.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "iron_staff": [
    {
      "name": "Slam Attack",
      "impact": 600.0,
      "totalDamage": 600.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 900.0,
      "totalDamage": 900.0,
      "radius": 10.0,
      "falloffReduction": 0.3
    }
  ],
  "iron_staff_prime": [
    {
      "name": "Slam Attack",
      "impact": 600.0,
      "totalDamage": 600.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 900.0,
      "totalDamage": 900.0,
      "radius": 10.0,
      "falloffReduction": 0.3
    }
  ],
  "jat_kittag": [
    {
      "name": "Slam Attack",
      "blast": 400.0,
      "totalDamage": 400.0,
      "radius": 9.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 600.0,
      "totalDamage": 600.0,
      "radius": 10.0,
      "falloffReduction": 0.3
    }
  ],
  "jat_kusar": [
    {
      "name": "Slam Attack",
      "heat": 436.0,
      "totalDamage": 436.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "heat": 654.0,
      "totalDamage": 654.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "jaw_sword": [
    {
      "name": "Slam Attack",
      "impact": 240.0,
      "totalDamage": 240.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 360.0,
      "totalDamage": 360.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "karyst_prime": [
    {
      "name": "Slam Attack",
      "impact": 688.0,
      "totalDamage": 688.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "toxin": 1032.0,
      "totalDamage": 1032.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "kestrel_prime": [
    {
      "name": "Throw Bounce Explosion",
      "blast": 315.0,
      "totalDamage": 315.0,
      "radius": 3.6,
      "falloffReduction": 0.4
    },
    {
      "name": "Throw Recall Explosion",
      "blast": 630.0,
      "totalDamage": 630.0,
      "radius": 3.6,
      "falloffReduction": 0.0
    },
    {
      "name": "Charged Throw Bounce Explosion",
      "blast": 630.0,
      "totalDamage": 630.0,
      "radius": 4.0,
      "falloffReduction": 0.4
    },
    {
      "name": "Charged Throw Recall Explosion",
      "blast": 1260.0,
      "totalDamage": 1260.0,
      "radius": 4.0,
      "falloffReduction": 0.0
    },
    {
      "name": "Slam Attack",
      "magnetic": 420.0,
      "totalDamage": 420.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "magnetic": 630.0,
      "totalDamage": 630.0,
      "radius": 6.0,
      "falloffReduction": 0.3
    }
  ],
  "kogake_prime": [
    {
      "name": "Slam Attack",
      "impact": 484.0,
      "totalDamage": 484.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 726.0,
      "totalDamage": 726.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "kronen_prime": [
    {
      "name": "Slam Attack",
      "impact": 424.0,
      "totalDamage": 424.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 636.0,
      "totalDamage": 636.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "kuva_ghoulsaw": [
    {
      "name": "Slam Attack",
      "impact": 422.0,
      "totalDamage": 422.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 633.0,
      "totalDamage": 633.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "kuva_shildeg": [
    {
      "name": "Slam Attack",
      "impact": 410.0,
      "totalDamage": 410.0,
      "radius": 9.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 615.0,
      "totalDamage": 615.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "machete_wraith": [
    {
      "name": "Slam Attack",
      "impact": 240.0,
      "totalDamage": 240.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 360.0,
      "totalDamage": 360.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "masseter_prime": [
    {
      "name": "Slam Attack",
      "impact": 520.0,
      "totalDamage": 520.0,
      "radius": 10.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 780.0,
      "totalDamage": 780.0,
      "radius": 10.0,
      "falloffReduction": 0.3
    }
  ],
  "mk1_bo": [
    {
      "name": "Slam Attack",
      "impact": 180.0,
      "totalDamage": 180.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 270.0,
      "totalDamage": 270.0,
      "radius": 7.0,
      "falloffReduction": 0.3
    }
  ],
  "mk1_furax": [
    {
      "name": "Slam Attack",
      "impact": 180.0,
      "totalDamage": 180.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 270.0,
      "totalDamage": 270.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "nami_skyla": [
    {
      "name": "Slam Attack",
      "impact": 250.0,
      "totalDamage": 250.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 375.0,
      "totalDamage": 375.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "nami_skyla_prime": [
    {
      "name": "Slam Attack",
      "impact": 360.0,
      "totalDamage": 360.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 540.0,
      "totalDamage": 540.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "nami_solo": [
    {
      "name": "Slam Attack",
      "impact": 344.0,
      "totalDamage": 344.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 516.0,
      "totalDamage": 516.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "nikana_prime": [
    {
      "name": "Slam Attack",
      "impact": 396.0,
      "totalDamage": 396.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 594.0,
      "totalDamage": 594.0,
      "radius": 7.0,
      "falloffReduction": 0.3
    }
  ],
  "ninkondi_prime": [
    {
      "name": "Slam Attack",
      "electricity": 468.0,
      "totalDamage": 468.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "electricity": 702.0,
      "totalDamage": 702.0,
      "radius": 7.0,
      "falloffReduction": 0.3
    }
  ],
  "okina_prime": [
    {
      "name": "Spectral Dagger Explosion",
      "cold": 184.0,
      "totalDamage": 184.0,
      "radius": 4.0,
      "falloffReduction": 0.0
    },
    {
      "name": "Slam Attack",
      "impact": 368.0,
      "totalDamage": 368.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 552.0,
      "totalDamage": 552.0,
      "radius": 7.0,
      "falloffReduction": 0.3
    }
  ],
  "orthos_prime": [
    {
      "name": "Slam Attack",
      "blast": 468.0,
      "totalDamage": 468.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 702.0,
      "totalDamage": 702.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "pangolin_prime": [
    {
      "name": "Slam Attack",
      "impact": 496.0,
      "totalDamage": 496.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 744.0,
      "totalDamage": 744.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "pangolin_sword": [
    {
      "name": "Slam Attack",
      "puncture": 300.0,
      "totalDamage": 300.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 450.0,
      "totalDamage": 450.0,
      "radius": 7.0,
      "falloffReduction": 0.3
    }
  ],
  "plasma_sword": [
    {
      "name": "Slam Attack",
      "electricity": 400.0,
      "totalDamage": 400.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "electricity": 600.0,
      "totalDamage": 600.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "prisma_dual_cleavers": [
    {
      "name": "Slam Attack",
      "impact": 266.0,
      "totalDamage": 266.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 399.0,
      "totalDamage": 399.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "prisma_machete": [
    {
      "name": "Slam Attack",
      "impact": 386.0,
      "totalDamage": 386.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 579.0,
      "totalDamage": 579.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "prisma_obex": [
    {
      "name": "Slam Attack",
      "electricity": 300.0,
      "totalDamage": 300.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "electricity": 450.0,
      "totalDamage": 450.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "prisma_ohma": [
    {
      "name": "Slam Attack",
      "electricity": 500.0,
      "totalDamage": 500.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 750.0,
      "totalDamage": 750.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "prisma_skana": [
    {
      "name": "Slam Attack",
      "impact": 340.0,
      "totalDamage": 340.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 510.0,
      "totalDamage": 510.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "prova_vandal": [
    {
      "name": "Slam Attack",
      "electricity": 396.0,
      "totalDamage": 396.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 594.0,
      "totalDamage": 594.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "quassus_prime": [
    {
      "name": "Slam Attack",
      "impact": 520.0,
      "totalDamage": 520.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 780.0,
      "totalDamage": 780.0,
      "radius": 6.0,
      "falloffReduction": 0.3
    }
  ],
  "rakta_dark_dagger": [
    {
      "name": "Slam Attack",
      "impact": 492.0,
      "totalDamage": 492.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "radiation": 738.0,
      "totalDamage": 738.0,
      "radius": 6.0,
      "falloffReduction": 0.3
    }
  ],
  "reaper_prime": [
    {
      "name": "Slam Attack",
      "impact": 400.0,
      "totalDamage": 400.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 600.0,
      "totalDamage": 600.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "redeemer_prime": [
    {
      "name": "Slam Attack",
      "impact": 424.0,
      "totalDamage": 424.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 636.0,
      "totalDamage": 636.0,
      "radius": 6.0,
      "falloffReduction": 0.3
    }
  ],
  "sancti_magistar": [
    {
      "name": "Slam Attack",
      "impact": 480.0,
      "totalDamage": 480.0,
      "radius": 9.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 720.0,
      "totalDamage": 720.0,
      "radius": 10.0,
      "falloffReduction": 0.3
    }
  ],
  "sarofang_prime": [
    {
      "name": "Slam Attack",
      "impact": 440.0,
      "totalDamage": 440.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 660.0,
      "totalDamage": 660.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "scindo_prime": [
    {
      "name": "Slam Attack",
      "impact": 500.0,
      "totalDamage": 500.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 750.0,
      "totalDamage": 750.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "secura_lecta": [
    {
      "name": "Slam Attack",
      "electricity": 352.0,
      "totalDamage": 352.0,
      "radius": 5.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "electricity": 528.0,
      "totalDamage": 528.0,
      "radius": 6.0,
      "falloffReduction": 0.3
    }
  ],
  "shadow_claws": [
    {
      "name": "Slam Attack",
      "impact": 500.0,
      "totalDamage": 500.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 750.0,
      "totalDamage": 750.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "shadow_claws_prime": [
    {
      "name": "Slam Attack",
      "impact": 500.0,
      "totalDamage": 500.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 750.0,
      "totalDamage": 750.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "skana_prime": [
    {
      "name": "Slam Attack",
      "impact": 420.0,
      "totalDamage": 420.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 630.0,
      "totalDamage": 630.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "synoid_heliocor": [
    {
      "name": "Slam Attack",
      "impact": 560.0,
      "totalDamage": 560.0,
      "radius": 9.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 840.0,
      "totalDamage": 840.0,
      "radius": 10.0,
      "falloffReduction": 0.3
    }
  ],
  "tatsu_prime": [
    {
      "name": "Slam Attack",
      "impact": 460.0,
      "totalDamage": 460.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 690.0,
      "totalDamage": 690.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "tekko_prime": [
    {
      "name": "Slam Attack",
      "impact": 360.0,
      "totalDamage": 360.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 540.0,
      "totalDamage": 540.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "telos_boltace": [
    {
      "name": "Slam Attack",
      "impact": 420.0,
      "totalDamage": 420.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 630.0,
      "totalDamage": 630.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "tenet_agendus": [
    {
      "name": "Slam Attack",
      "electricity": 520.0,
      "totalDamage": 520.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "electricity": 780.0,
      "totalDamage": 780.0,
      "radius": 10.0,
      "falloffReduction": 0.3
    }
  ],
  "tenet_exec": [
    {
      "name": "Slam Attack",
      "impact": 380.0,
      "totalDamage": 380.0,
      "radius": 4.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "impact": 570.0,
      "totalDamage": 570.0,
      "radius": 4.0,
      "falloffReduction": 0.3
    }
  ],
  "tenet_grigori": [
    {
      "name": "Slam Attack",
      "impact": 456.0,
      "totalDamage": 456.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 684.0,
      "totalDamage": 684.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "tenet_livia": [
    {
      "name": "Slam Attack",
      "impact": 396.0,
      "totalDamage": 396.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 594.0,
      "totalDamage": 594.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "tipedo_prime": [
    {
      "name": "Slam Attack",
      "impact": 340.0,
      "totalDamage": 340.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 510.0,
      "totalDamage": 510.0,
      "radius": 7.0,
      "falloffReduction": 0.3
    }
  ],
  "twin_basolk": [
    {
      "name": "Slam Attack",
      "heat": 420.0,
      "totalDamage": 420.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "heat": 630.0,
      "totalDamage": 630.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "twin_krohkur": [
    {
      "name": "Slam Attack",
      "impact": 500.0,
      "totalDamage": 500.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 750.0,
      "totalDamage": 750.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "vaykor_sydon": [
    {
      "name": "Slam Attack",
      "blast": 426.0,
      "totalDamage": 426.0,
      "radius": 7.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 639.0,
      "totalDamage": 639.0,
      "radius": 8.0,
      "falloffReduction": 0.3
    }
  ],
  "venato_prime": [
    {
      "name": "Slam Attack",
      "impact": 490.0,
      "totalDamage": 490.0,
      "radius": 8.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 735.0,
      "totalDamage": 735.0,
      "radius": 9.0,
      "falloffReduction": 0.3
    }
  ],
  "venka_prime": [
    {
      "name": "Slam Attack",
      "impact": 376.0,
      "totalDamage": 376.0,
      "radius": 6.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 564.0,
      "totalDamage": 564.0,
      "radius": 7.0,
      "falloffReduction": 0.3
    }
  ],
  "volnus_prime": [
    {
      "name": "Slam Attack",
      "slash": 500.0,
      "totalDamage": 500.0,
      "radius": 10.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "slash": 750.0,
      "totalDamage": 750.0,
      "radius": 10.0,
      "falloffReduction": 0.3
    }
  ],
  "wolf_sledge": [
    {
      "name": "Throw Bounce Explosion",
      "blast": 777.0,
      "totalDamage": 777.0,
      "radius": 5.0,
      "falloffReduction": 0.4
    },
    {
      "name": "Throw Recall Explosion",
      "blast": 1554.0,
      "totalDamage": 1554.0,
      "radius": 5.0,
      "falloffReduction": 0.0
    },
    {
      "name": "Slam Attack",
      "impact": 518.0,
      "totalDamage": 518.0,
      "radius": 9.0,
      "falloffReduction": 0.5
    },
    {
      "name": "Heavy Slam Attack",
      "blast": 777.0,
      "totalDamage": 777.0,
      "radius": 10.0,
      "falloffReduction": 0.3
    }
  ]
}
;
