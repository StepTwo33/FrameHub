import { Warframe } from "@/lib/types";

export const allWarframes: Warframe[] = [
  {
    "id": "ash",
    "name": "Ash",
    "health": 455,
    "shield": 270,
    "armor": 105,
    "energy": 100,
    "sprintSpeed": 1.15,
    "description": "Launches 2 seeking shuriken that deal Slash damage and pin enemies to walls.",
    "passive": "<DT_SLASH_COLOR>Slash Status Effects inflicted on enemies do |DAMAGE|% increased damage and last |DURATION|% longer.",
    "abilities": [
      {
        "name": "Shuriken",
        "energyCost": 25,
        "description": "Launches 2 seeking shuriken that deal Slash damage and pin enemies to walls.",
        "damage": 250,
        "range": 60,
        "statusChance": 1,
        "castTime": 0.3,
        "damageType": "Slash"
      },
      {
        "name": "Smoke Screen",
        "energyCost": 35,
        "description": "Drop a smoke bomb that stuns enemies and grants Ash invisibility.",
        "range": 10,
        "duration": 8,
        "castTime": 0.2
      },
      {
        "name": "Teleport",
        "energyCost": 25,
        "description": "Teleport to target and perform a Finisher. Kill refunds energy.",
        "range": 60,
        "castTime": 0.3
      },
      {
        "name": "Blade Storm",
        "energyCost": 0,
        "description": "Mark enemies for death by Shadow Clones. Clones attack marked targets dealing massive damage.",
        "damage": 2000,
        "range": 50,
        "castTime": 0.5,
        "damageType": "Finisher"
      }
    ]
  },
  {
    "id": "ash_prime",
    "name": "Ash Prime",
    "health": 455,
    "shield": 365,
    "armor": 185,
    "energy": 100,
    "sprintSpeed": 1.2,
    "description": "Launches 2 seeking shuriken that deal Slash damage and pin enemies to walls.",
    "passive": "<DT_SLASH>Slash Status Effects inflicted on enemies do |DAMAGE|% increased damage and last |DURATION|% longer.",
    "abilities": [
      {
        "name": "Shuriken",
        "energyCost": 25,
        "description": "Launches 2 seeking shuriken that deal Slash damage and pin enemies to walls.",
        "damage": 250,
        "range": 60,
        "statusChance": 1,
        "castTime": 0.3,
        "damageType": "Slash"
      },
      {
        "name": "Smoke Screen",
        "energyCost": 35,
        "description": "Drop a smoke bomb that stuns enemies and grants Ash invisibility.",
        "range": 10,
        "duration": 8,
        "castTime": 0.2
      },
      {
        "name": "Teleport",
        "energyCost": 25,
        "description": "Teleport to target and perform a Finisher. Kill refunds energy.",
        "range": 60,
        "castTime": 0.3
      },
      {
        "name": "Blade Storm",
        "energyCost": 0,
        "description": "Mark enemies for death by Shadow Clones. Clones attack marked targets dealing massive damage.",
        "damage": 2000,
        "range": 50,
        "castTime": 0.5,
        "damageType": "Finisher"
      }
    ]
  },
  {
    "id": "atlas",
    "name": "Atlas",
    "health": 270,
    "shield": 270,
    "armor": 475,
    "energy": 175,
    "sprintSpeed": 0.89999998,
    "description": "Bash enemies with an explosive sliding punch, repeat up to three times for a combo attack. Each hit in the three-punch combo increases the radius of the attack. Energy cost is reduced for each successive punch.",
    "passive": "Becomes immune to Knockdown effects while on the ground.",
    "abilities": [
      {
        "name": "Landslide",
        "energyCost": 25,
        "description": "Bash enemies with an explosive sliding punch, repeat up to three times for a combo attack. Each hit in the three-punch combo increases the radius of the attack. Energy cost is reduced for each successive punch.",
        "damage": 350,
        "range": 8,
        "radius": 4,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Tectonics",
        "energyCost": 50,
        "description": "Summon a Bulwark rock-wall, activate again to send the rocks crashing toward the enemy. Bulwarks attacked by enemies release an area-of-effect Slash powered by the Health it has left.",
        "damage": 250,
        "range": 10,
        "radius": 5,
        "health": 3500,
        "castTime": 0.8,
        "damageType": "Puncture"
      },
      {
        "name": "Petrify",
        "energyCost": 75,
        "description": "Atlas\" hardened gaze will fossilize foes increasing the damage they take, heal Rumblers, and create Petrified Bulwarks. When shattered, petrified enemies drop healing Rubble for Atlas.",
        "range": 15,
        "duration": 15,
        "castTime": 0.5
      },
      {
        "name": "Rumblers",
        "energyCost": 100,
        "description": "Summon two elemental stone brawlers to the melee. Summoning petrifies enemies in close proximity to Atlas. When finished, Rumblers collapse into a pile of healing Rubble.",
        "damage": 250,
        "range": 15,
        "duration": 45,
        "radius": 5,
        "health": 2500,
        "armor": 500,
        "castTime": 1,
        "damageType": "Impact"
      }
    ]
  },
  {
    "id": "atlas_prime",
    "name": "Atlas Prime",
    "health": 550,
    "shield": 455,
    "armor": 500,
    "energy": 215,
    "sprintSpeed": 1,
    "description": "Bash enemies with an explosive sliding punch, repeat up to three times for a combo attack. Each hit in the three-punch combo increases the radius of the attack. Energy cost is reduced for each successive punch.",
    "passive": "Becomes immune to Knockdown effects while on the ground.",
    "abilities": [
      {
        "name": "Landslide",
        "energyCost": 25,
        "description": "Bash enemies with an explosive sliding punch, repeat up to three times for a combo attack. Each hit in the three-punch combo increases the radius of the attack. Energy cost is reduced for each successive punch.",
        "damage": 350,
        "range": 8,
        "radius": 4,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Tectonics",
        "energyCost": 50,
        "description": "Summon a Bulwark rock-wall, activate again to send the rocks crashing toward the enemy. Bulwarks attacked by enemies release an area-of-effect Slash powered by the Health it has left.",
        "damage": 250,
        "range": 10,
        "radius": 5,
        "health": 3500,
        "castTime": 0.8,
        "damageType": "Puncture"
      },
      {
        "name": "Petrify",
        "energyCost": 75,
        "description": "Atlas\" hardened gaze will fossilize foes increasing the damage they take, heal Rumblers, and create Petrified Bulwarks. When shattered, petrified enemies drop healing Rubble for Atlas.",
        "range": 15,
        "duration": 15,
        "castTime": 0.5
      },
      {
        "name": "Rumblers",
        "energyCost": 100,
        "description": "Summon two elemental stone brawlers to the melee. Summoning petrifies enemies in close proximity to Atlas. When finished, Rumblers collapse into a pile of healing Rubble.",
        "damage": 250,
        "range": 15,
        "duration": 45,
        "radius": 5,
        "health": 2500,
        "armor": 500,
        "castTime": 1,
        "damageType": "Impact"
      }
    ]
  },
  {
    "id": "banshee",
    "name": "Banshee",
    "health": 270,
    "shield": 270,
    "armor": 105,
    "energy": 175,
    "sprintSpeed": 1.1,
    "description": "Banshee emits a sonic shockwave that pushes targets in range with enough force to incapacitate or kill attackers.",
    "passive": "Weapon noises are hushed so that enemies cannot hear them.",
    "abilities": [
      {
        "name": "Sonic Boom",
        "energyCost": 25,
        "description": "Banshee emits a sonic shockwave that pushes targets in range with enough force to incapacitate or kill attackers.",
        "damage": 250,
        "range": 15,
        "radius": 15,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Sonar",
        "energyCost": 50,
        "description": "Using acoustic location, Banshee's Sonar power finds and tracks enemies, and exposes critical weak spots to everyone in your squad.",
        "range": 50,
        "duration": 15,
        "castTime": 0.6
      },
      {
        "name": "Silence",
        "energyCost": 75,
        "description": "Using Silence surrounds Banshee in an aura that stuns enemies and will limit their perceptions and tactical response to gunfire and Warframe attacks.",
        "range": 20,
        "duration": 20,
        "radius": 20,
        "castTime": 0.5
      },
      {
        "name": "Sound Quake",
        "energyCost": 25,
        "description": "Channeling all of her acoustic energy into the environment, Banshee uses ultrasonic reverberations to violently shake the ground.",
        "damage": 250,
        "range": 25,
        "duration": 15,
        "radius": 25,
        "castTime": 1,
        "damageType": "Blast"
      }
    ]
  },
  {
    "id": "banshee_prime",
    "name": "Banshee Prime",
    "health": 270,
    "shield": 270,
    "armor": 135,
    "energy": 215,
    "sprintSpeed": 1.15,
    "description": "Banshee emits a sonic shockwave that pushes targets in range with enough force to incapacitate or kill attackers.",
    "passive": "Weapon noises are hushed so that enemies cannot hear them.",
    "abilities": [
      {
        "name": "Sonic Boom",
        "energyCost": 25,
        "description": "Banshee emits a sonic shockwave that pushes targets in range with enough force to incapacitate or kill attackers.",
        "damage": 250,
        "range": 15,
        "radius": 15,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Sonar",
        "energyCost": 50,
        "description": "Using acoustic location, Banshee's Sonar power finds and tracks enemies, and exposes critical weak spots to everyone in your squad.",
        "range": 50,
        "duration": 15,
        "castTime": 0.6
      },
      {
        "name": "Silence",
        "energyCost": 75,
        "description": "Using Silence surrounds Banshee in an aura that stuns enemies and will limit their perceptions and tactical response to gunfire and Warframe attacks.",
        "range": 20,
        "duration": 20,
        "radius": 20,
        "castTime": 0.5
      },
      {
        "name": "Sound Quake",
        "energyCost": 25,
        "description": "Channeling all of her acoustic energy into the environment, Banshee uses ultrasonic reverberations to violently shake the ground.",
        "damage": 250,
        "range": 25,
        "duration": 15,
        "radius": 25,
        "castTime": 1,
        "damageType": "Blast"
      }
    ]
  },
  {
    "id": "baruuk",
    "name": "Baruuk",
    "health": 180,
    "shield": 270,
    "armor": 185,
    "energy": 200,
    "sprintSpeed": 1.2,
    "description": "Dodge all incoming projectiles, but only while not attacking. Use again to deactivate this ability.",
    "passive": "Each projectile dodged, each enemy lulled or disarmed, erodes Baruuk's restraint and fuels the storm within. As Baruuk's restraint is diminished he becomes up to |PERCENT|% more resistant to damage.",
    "abilities": [
      {
        "name": "Elude",
        "energyCost": 25,
        "description": "Dodge all incoming projectiles, but only while not attacking. Use again to deactivate this ability.",
        "range": 10,
        "duration": 15,
        "castTime": 0.4
      },
      {
        "name": "Lull",
        "energyCost": 50,
        "description": "A calming wave slows enemies until they fall into a slumber. Enemies woken by damage will be confused and disoriented. Short-term amnesia means all waking enemies forget anything that happened before the nap.",
        "range": 20,
        "duration": 10,
        "radius": 20,
        "castTime": 0.8
      },
      {
        "name": "Desolate Hands",
        "energyCost": 75,
        "description": "Summon a bevy of orbiting daggers to seek out enemy guns, destroying them with a small explosion. Combine with Elude to double the range.",
        "damage": 150,
        "range": 15,
        "duration": 20,
        "castTime": 0.5,
        "damageType": "Slash"
      },
      {
        "name": "Serene Storm",
        "energyCost": 0,
        "description": "With his Restraint eroded, Baruuk commands the Desert Wind to deliver powerful radial strikes with his fists and feet. Each moment commanding the storm restores his Restraint.",
        "damage": 200,
        "range": 8,
        "castTime": 0.5,
        "damageType": "Impact"
      }
    ]
  },
  {
    "id": "baruuk_prime",
    "name": "Baruuk Prime",
    "health": 180,
    "shield": 365,
    "armor": 240,
    "energy": 200,
    "sprintSpeed": 1.2,
    "description": "Dodge all incoming projectiles, but only while not attacking. Use again to deactivate this ability.",
    "passive": "Each projectile dodged, each enemy lulled or disarmed, erodes Baruuk's restraint and fuels the storm within. As Baruuk's restraint is diminished he becomes up to |PERCENT|% more resistant to damage.",
    "abilities": [
      {
        "name": "Elude",
        "energyCost": 25,
        "description": "Dodge all incoming projectiles, but only while not attacking. Use again to deactivate this ability.",
        "range": 10,
        "duration": 15,
        "castTime": 0.4
      },
      {
        "name": "Lull",
        "energyCost": 50,
        "description": "A calming wave slows enemies until they fall into a slumber. Enemies woken by damage will be confused and disoriented. Short-term amnesia means all waking enemies forget anything that happened before the nap.",
        "range": 20,
        "duration": 10,
        "radius": 20,
        "castTime": 0.8
      },
      {
        "name": "Desolate Hands",
        "energyCost": 75,
        "description": "Summon a bevy of orbiting daggers to seek out enemy guns, destroying them with a small explosion. Combine with Elude to double the range.",
        "damage": 150,
        "range": 15,
        "duration": 20,
        "castTime": 0.5,
        "damageType": "Slash"
      },
      {
        "name": "Serene Storm",
        "energyCost": 0,
        "description": "With his Restraint eroded, Baruuk commands the Desert Wind to deliver powerful radial strikes with his fists and feet. Each moment commanding the storm restores his Restraint.",
        "damage": 200,
        "range": 8,
        "castTime": 0.5,
        "damageType": "Impact"
      }
    ]
  },
  {
    "id": "bonewidow",
    "name": "Bonewidow",
    "health": 1880,
    "shield": 430,
    "armor": 480,
    "energy": 175,
    "sprintSpeed": 1.1,
    "description": "Skewer and hold a target, siphoning their health. Use again to hurl the victim damaging them and anyone near the impact site.",
    "passive": "",
    "abilities": [
      {
        "name": "Meathook",
        "energyCost": 25,
        "description": "Skewer and hold a target, siphoning their health. Use again to hurl the victim damaging them and anyone near the impact site.",
        "damage": 400,
        "range": 20,
        "castTime": 0.5,
        "damageType": "Puncture"
      },
      {
        "name": "Shield Maiden",
        "energyCost": 50,
        "description": "Raise Bonewidow's shield to block incoming forward damage, reflecting it back at attackers. While active, bash enemies with a Maiden's Kiss.",
        "damage": 300,
        "range": 15,
        "castTime": 0.4,
        "damageType": "Impact"
      },
      {
        "name": "Firing Line",
        "energyCost": 75,
        "description": "Sweep surrounding enemies into the line of fire and suspend them in air with a force beam.",
        "damage": 500,
        "range": 25,
        "duration": 10,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Magnetic"
      },
      {
        "name": "Exalted Ironbride",
        "energyCost": 0,
        "description": "Summon a devastating exalted blade.",
        "damage": 300,
        "range": 10,
        "castTime": 0.5,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "caliban",
    "name": "Caliban",
    "health": 270,
    "shield": 550,
    "armor": 290,
    "energy": 140,
    "sprintSpeed": 1.1,
    "description": "Dash forward in a spinning vortex of death. Struck enemies are inflicted with <DT_SENTIENT_COLOR>Tau Status Effect, making them more vulnerable to all other status effects.",
    "passive": "Allies within Affinity range gain up to |PCT|% resistance to the types of damage they are currently taking.",
    "abilities": [
      {
        "name": "Razor Gyre",
        "energyCost": 25,
        "description": "Dash forward in a spinning vortex of death. Struck enemies are inflicted with <DT_SENTIENT_COLOR>Tau Status Effect, making them more vulnerable to all other status effects.",
        "damage": 300,
        "range": 15,
        "duration": 5,
        "castTime": 0.5,
        "damageType": "Tau"
      },
      {
        "name": "Sentient Wrath",
        "energyCost": 50,
        "description": "Smash the ground sending out a radial wave of destruction. Those not killed by the initial blast are helplessly raised into the air, where they take amplified damage for a short duration.",
        "damage": 400,
        "range": 20,
        "duration": 6,
        "radius": 20,
        "castTime": 0.6,
        "damageType": "Blast"
      },
      {
        "name": "Lethal Progeny",
        "energyCost": 75,
        "description": "Cycle through Sentient unit types, then summon them to Caliban's side. Conculysts focus on raw melee damage. Ortholysts specialize in ranged attacks and inflict <DT_SENTIENT_COLOR>Tau Status.",
        "range": 10,
        "duration": 30,
        "castTime": 0.8
      },
      {
        "name": "Fusion Strike",
        "energyCost": 100,
        "description": "Converge three streams of raw energy upon a single point, causing a massive explosion. The streams strip armor and shields, and each enemy struck detonates on stream convergence.",
        "damage": 1500,
        "range": 40,
        "radius": 12,
        "castTime": 1,
        "damageType": "Blast"
      }
    ]
  },
  {
    "id": "caliban_prime",
    "name": "Caliban Prime",
    "health": 270,
    "shield": 640,
    "armor": 290,
    "energy": 175,
    "sprintSpeed": 1.1,
    "description": "Dash forward in a spinning vortex of death. Struck enemies are inflicted with <DT_SENTIENT_COLOR>Tau Status Effect, making them more vulnerable to all other status effects.",
    "passive": "Allies within Affinity range gain up to |PCT|% resistance to the types of damage they are currently taking.",
    "abilities": [
      {
        "name": "Razor Gyre",
        "energyCost": 25,
        "description": "Dash forward in a spinning vortex of death. Struck enemies are inflicted with <DT_SENTIENT_COLOR>Tau Status Effect, making them more vulnerable to all other status effects.",
        "damage": 300,
        "range": 15,
        "duration": 5,
        "castTime": 0.5,
        "damageType": "Tau"
      },
      {
        "name": "Sentient Wrath",
        "energyCost": 50,
        "description": "Smash the ground sending out a radial wave of destruction. Those not killed by the initial blast are helplessly raised into the air, where they take amplified damage for a short duration.",
        "damage": 400,
        "range": 20,
        "duration": 6,
        "radius": 20,
        "castTime": 0.6,
        "damageType": "Blast"
      },
      {
        "name": "Lethal Progeny",
        "energyCost": 75,
        "description": "Cycle through Sentient unit types, then summon them to Caliban's side. Conculysts focus on raw melee damage. Ortholysts specialize in ranged attacks and inflict <DT_SENTIENT_COLOR>Tau Status.",
        "range": 10,
        "duration": 30,
        "castTime": 0.8
      },
      {
        "name": "Fusion Strike",
        "energyCost": 100,
        "description": "Converge three streams of raw energy upon a single point, causing a massive explosion. The streams strip armor and shields, and each enemy struck detonates on stream convergence.",
        "damage": 1500,
        "range": 40,
        "radius": 12,
        "castTime": 1,
        "damageType": "Blast"
      }
    ]
  },
  {
    "id": "chroma",
    "name": "Chroma",
    "health": 270,
    "shield": 270,
    "armor": 370,
    "energy": 175,
    "sprintSpeed": 1,
    "description": "Exhale a deep breath of elemental destruction. Tap to cycle through elements, hold to cast. The chosen element applies to all of Chroma's abilities.",
    "passive": "Wings sprout for an additional jump and bullet jump.",
    "abilities": [
      {
        "name": "Spectral Scream",
        "energyCost": 10,
        "description": "Exhale a deep breath of elemental destruction. Tap to cycle through elements, hold to cast. The chosen element applies to all of Chroma's abilities.",
        "damagePerSecond": 400,
        "range": 10,
        "castTime": 0.5,
        "statusChance": 1,
        "damageType": "Elemental (Heat / Cold / Toxin / Electricity)",
        "subAbilities": [
          "Channeled: 3 energy/s while active (after the 10 energy cast).",
          "Cone reach scales weakly with Ability Range (effective length scales with the cube root of Range).",
          "Elemental stream can chain to one enemy within 10 m of targets hit by the cone."
        ],
        "miscStats": {
          "Channel drain": "3/s",
          "Stream link range": "10 m"
        }
      },
      {
        "name": "Elemental Ward",
        "energyCost": 50,
        "description": "Depending on Chroma's elemental alignment, an offensive area-of-effect is created. Chroma and nearby allies are imbued with defensive energy.",
        "range": 12,
        "duration": 25,
        "castTime": 1,
        "subAbilities": [
          "Heat: +55% max Health; aura deals 100 Heat/s in 5 m (10% status). Inner 5 m radius does not scale with Range.",
          "Electric: +30% max Shields; incoming damage can arc to an enemy within 10 m (25% status, min 200 damage).",
          "Toxin: +35% reload speed and holster damage (3 s buff); 50% chance per second for a toxin hit in 5 m (100% status on proc).",
          "Cold: +145% base Armor; reflects damage as Cold (300% reflected multiplier, 25% status)."
        ],
        "miscStats": {
          "Aura radius": "12 m (scales with Range)"
        }
      },
      {
        "name": "Vex Armor",
        "energyCost": 75,
        "description": "Chroma fortifies squad Armor when his Shields are damaged or he kills an enemy with a melee weapon. He increases squad Weapon Damage when he loses Health or he kills an enemy with a ranged weapon.",
        "range": 18,
        "duration": 25,
        "radius": 18,
        "castTime": 0.5,
        "subAbilities": [
          "Scorn builds to +350% armor from shield damage taken or melee kills.",
          "Fury builds to +275% weapon damage from health damage taken or ranged kills (headshots build faster).",
          "Buffs apply to allies in aura range; percentages scale with Ability Strength."
        ],
        "miscStats": {
          "Aura radius": "18 m (scales with Range)"
        }
      },
      {
        "name": "Effigy",
        "energyCost": 50,
        "description": "Chroma turns his pelt into a massive sentry that strengthens nearby allies and engulfs enemies in elemental attacks.",
        "damage": 400,
        "damagePerSecond": 2000,
        "health": 8000,
        "armor": 200,
        "range": 20,
        "castTime": 1,
        "damageType": "Elemental (matches alignment)",
        "subAbilities": [
          "Sentry fires in 20 m at 5 ticks/s; costs 10 energy/s while active.",
          "Chroma: +20% movement speed and −50% total armor while the pelt is out.",
          "Roar stuns in 30 m (15 s cooldown). Wing flap: 200 elemental damage in 5 m (5 s cooldown).",
          "Kills by the sentry have a chance for bonus credits; pickups within 10 m gain +25–100% credits."
        ],
        "miscStats": {
          "Sentry armor": "200",
          "Energy drain": "10/s",
          "Stun radius": "30 m",
          "Credit pickup radius": "10 m"
        }
      }
    ]
  },
  {
    "id": "chroma_prime",
    "name": "Chroma Prime",
    "health": 270,
    "shield": 270,
    "armor": 450,
    "energy": 200,
    "sprintSpeed": 1,
    "description": "Exhale a deep breath of elemental destruction. Tap to cycle through elements, hold to cast. The chosen element applies to all of Chroma's abilities.",
    "passive": "Wings sprout for an additional jump and bullet jump.",
    "abilities": [
      {
        "name": "Spectral Scream",
        "energyCost": 10,
        "description": "Exhale a deep breath of elemental destruction. Tap to cycle through elements, hold to cast. The chosen element applies to all of Chroma's abilities.",
        "damagePerSecond": 400,
        "range": 10,
        "castTime": 0.5,
        "statusChance": 1,
        "damageType": "Elemental (Heat / Cold / Toxin / Electricity)",
        "subAbilities": [
          "Channeled: 3 energy/s while active (after the 10 energy cast).",
          "Cone reach scales weakly with Ability Range (effective length scales with the cube root of Range).",
          "Elemental stream can chain to one enemy within 10 m of targets hit by the cone."
        ],
        "miscStats": {
          "Channel drain": "3/s",
          "Stream link range": "10 m"
        }
      },
      {
        "name": "Elemental Ward",
        "energyCost": 50,
        "description": "Depending on Chroma's elemental alignment, an offensive area-of-effect is created. Chroma and nearby allies are imbued with defensive energy.",
        "range": 12,
        "duration": 25,
        "castTime": 1,
        "subAbilities": [
          "Heat: +55% max Health; aura deals 100 Heat/s in 5 m (10% status). Inner 5 m radius does not scale with Range.",
          "Electric: +30% max Shields; incoming damage can arc to an enemy within 10 m (25% status, min 200 damage).",
          "Toxin: +35% reload speed and holster damage (3 s buff); 50% chance per second for a toxin hit in 5 m (100% status on proc).",
          "Cold: +145% base Armor; reflects damage as Cold (300% reflected multiplier, 25% status)."
        ],
        "miscStats": {
          "Aura radius": "12 m (scales with Range)"
        }
      },
      {
        "name": "Vex Armor",
        "energyCost": 75,
        "description": "Chroma fortifies squad Armor when his Shields are damaged or he kills an enemy with a melee weapon. He increases squad Weapon Damage when he loses Health or he kills an enemy with a ranged weapon.",
        "range": 18,
        "duration": 25,
        "radius": 18,
        "castTime": 0.5,
        "subAbilities": [
          "Scorn builds to +350% armor from shield damage taken or melee kills.",
          "Fury builds to +275% weapon damage from health damage taken or ranged kills (headshots build faster).",
          "Buffs apply to allies in aura range; percentages scale with Ability Strength."
        ],
        "miscStats": {
          "Aura radius": "18 m (scales with Range)"
        }
      },
      {
        "name": "Effigy",
        "energyCost": 50,
        "description": "Chroma turns his pelt into a massive sentry that strengthens nearby allies and engulfs enemies in elemental attacks.",
        "damage": 400,
        "damagePerSecond": 2000,
        "health": 8000,
        "armor": 200,
        "range": 20,
        "castTime": 1,
        "damageType": "Elemental (matches alignment)",
        "subAbilities": [
          "Sentry fires in 20 m at 5 ticks/s; costs 10 energy/s while active.",
          "Chroma: +20% movement speed and −50% total armor while the pelt is out.",
          "Roar stuns in 30 m (15 s cooldown). Wing flap: 200 elemental damage in 5 m (5 s cooldown).",
          "Kills by the sentry have a chance for bonus credits; pickups within 10 m gain +25–100% credits."
        ],
        "miscStats": {
          "Sentry armor": "200",
          "Energy drain": "10/s",
          "Stun radius": "30 m",
          "Credit pickup radius": "10 m"
        }
      }
    ]
  },
  {
    "id": "citrine",
    "name": "Citrine",
    "health": 400,
    "shield": 270,
    "armor": 265,
    "energy": 130,
    "sprintSpeed": 1,
    "description": "Slash and stagger enemies with a crystal blast that inflicts <DT_SLASH_COLOR>Slash Status. Enemies afflicted with this Status Effect have an increased chance of dropping Health Orbs.",
    "passive": "Citrine grants nearby allies |BASE| health regeneration per second. Pick up a Health Orb to increase regeneration by |HPS|, up to a maximum of |MAX|.",
    "abilities": [
      {
        "name": "Fractured Blast",
        "energyCost": 25,
        "description": "Slash and stagger enemies with a crystal blast that inflicts <DT_SLASH_COLOR>Slash Status. Enemies afflicted with this Status Effect have an increased chance of dropping Health Orbs.",
        "damage": 300,
        "range": 20,
        "radius": 5,
        "statusChance": 0.5,
        "castTime": 0.4,
        "damageType": "Slash"
      },
      {
        "name": "Preserving Shell",
        "energyCost": 50,
        "description": "Citrine guards herself and nearby allies with a crystalline shell that gradually decays. Kills and assists increase the defensive power of the shell.",
        "range": 15,
        "duration": 30,
        "radius": 15,
        "castTime": 0.5
      },
      {
        "name": "Prismatic Gem",
        "energyCost": 75,
        "description": "Deploy a gem that shoots prismatic beams. The gem targets enemies that are taking weapon damage from Citrine and her allies. Its beams inflict Heat, Cold, Toxin, and Electricity status.",
        "damage": 150,
        "range": 30,
        "duration": 25,
        "radius": 15,
        "castTime": 0.6
      },
      {
        "name": "Crystallize",
        "energyCost": 100,
        "description": "Citrine summons crystal fractals. The fractals rush forward, seeking enemies. Enemies touched by the fractals are paralyzed by crystalline growths. Hit the growths to deal Critical Damage.",
        "damage": 400,
        "range": 30,
        "duration": 10,
        "radius": 10,
        "statusChance": 1,
        "castTime": 0.8,
        "damageType": "Puncture"
      }
    ]
  },
  {
    "id": "cyte_09",
    "name": "Cyte-09",
    "health": 225,
    "shield": 135,
    "armor": 150,
    "energy": 180,
    "sprintSpeed": 1.1,
    "description": "Plant an antenna that projects a forward wave scan. Detected enemies take increased Weak Point Damage, and become visible through walls. Weapons gain Punch through.",
    "passive": "Weak Point Kills increase Cyte-09's Weak Point Critical Chance by |INCREASE|% up to |CAP|% for the duration of the current mission.",
    "abilities": [
      {
        "name": "Seek",
        "energyCost": 25,
        "description": "Plant an antenna that projects a forward wave scan. Detected enemies take increased Weak Point Damage, and become visible through walls. Weapons gain Punch through.",
        "range": 40,
        "duration": 30,
        "radius": 20,
        "castTime": 0.5
      },
      {
        "name": "Resupply",
        "energyCost": 50,
        "description": "Throw two Elemental Ammo Packs that instantly refill the active weapon's magazine, while granting the weapon an additional instance of the selected Elemental Damage and Status Effect.",
        "range": 30,
        "radius": 8,
        "castTime": 0.6
      },
      {
        "name": "Evade",
        "energyCost": 50,
        "description": "Jump backwards and become invisible for a short duration. Killing enemies on their Weak Points extends the duration and heals Cyte-09.",
        "range": 10,
        "duration": 8,
        "castTime": 0.3
      },
      {
        "name": "Neutralize",
        "energyCost": 100,
        "description": "Summon the Neutralizer, Cyte-09's exalted Sniper Rifle. Bullets ricochet off Weak Points to seek out other nearby Weak Points. Alt fire lobs a Cold grenade that freezes enemies.",
        "damage": 400,
        "range": 100,
        "castTime": 0.8,
        "damageType": "Cold"
      }
    ]
  },
  {
    "id": "dagath",
    "name": "Dagath",
    "health": 566,
    "shield": 150,
    "armor": 125,
    "energy": 175,
    "sprintSpeed": 1.1,
    "description": "Wyrd Scythes surround Dagath and seek out nearby enemies. Those struck are slowed and suffer <DT_VIRAL_COLOR>Viral Damage with a guaranteed Status Effect.",
    "passive": "There is a |PERCENT|% chance that Energy and Health Orbs will be |ENERGY|% more effective on Dagath.",
    "abilities": [
      {
        "name": "Wyrd Scythes",
        "energyCost": 25,
        "description": "Wyrd Scythes surround Dagath and seek out nearby enemies. Those struck are slowed and suffer <DT_VIRAL_COLOR>Viral Damage with a guaranteed Status Effect.",
        "damage": 250,
        "range": 15,
        "duration": 20,
        "statusChance": 1,
        "castTime": 0.5,
        "damageType": "Viral"
      },
      {
        "name": "Doom",
        "energyCost": 50,
        "description": "Condemn nearby enemies to their doom. A portion of the damage Dagath deals is revisited upon them by a Wyrd Scythe. They also suffer <DT_VIRAL_COLOR>Viral Damage.",
        "range": 20,
        "duration": 15,
        "radius": 20,
        "castTime": 0.6
      },
      {
        "name": "Grave Spirit",
        "energyCost": 75,
        "description": "Supercharge Dagath's weapons with extra Critical Damage. The effects are doubled on Doomed enemies. Escape fatal blows by briefly assuming a spectral form.",
        "duration": 20,
        "castTime": 0.5
      },
      {
        "name": "Rakhali's Cavalry",
        "energyCost": 100,
        "description": "Phantom Kaithes charge forth, inflicting <DT_VIRAL_COLOR>Viral Damage upon all in their path. Their attack strips the defenses of Doomed enemies.",
        "damage": 500,
        "range": 40,
        "radius": 5,
        "statusChance": 1,
        "castTime": 0.8,
        "damageType": "Viral"
      }
    ]
  },
  {
    "id": "dante",
    "name": "Dante",
    "health": 300,
    "shield": 150,
    "armor": 145,
    "energy": 200,
    "sprintSpeed": 1.15,
    "description": "Open Noctua, Dante's Exalted Tome, and unleash a tale of woe upon his enemies.",
    "passive": "Noctua scans targets, recording information for your Codex. Status Chance increases by |CHANCE|% on fully scanned targets.",
    "abilities": [
      {
        "name": "Noctua",
        "energyCost": 25,
        "description": "Open Noctua, Dante's Exalted Tome, and unleash a tale of woe upon his enemies.",
        "damage": 250,
        "range": 30,
        "castTime": 0.5,
        "damageType": "Void"
      },
      {
        "name": "Light Verse",
        "energyCost": 50,
        "description": "Dante's vitalizing composition grants him and his allies Overguard and increases their Health.",
        "range": 20,
        "duration": 30,
        "radius": 20,
        "castTime": 0.6
      },
      {
        "name": "Dark Verse",
        "energyCost": 50,
        "description": "Dante's composition draws blood from nearby enemies, inflicting <DT_SLASH_COLOR>Slash Damage upon them.",
        "damage": 400,
        "range": 20,
        "radius": 15,
        "statusChance": 1,
        "castTime": 0.5,
        "damageType": "Slash"
      },
      {
        "name": "Final Verse",
        "energyCost": 100,
        "description": "Dante must compose two other Verses before his Final Verse. TRIUMPH: Two Light Verses cast in succession invigorate allies. TRAGEDY: Two Dark Verses cast in succession devastate enemies.",
        "damage": 800,
        "range": 25,
        "duration": 20,
        "radius": 15,
        "castTime": 1,
        "damageType": "Void"
      }
    ]
  },
  {
    "id": "ember",
    "name": "Ember",
    "health": 270,
    "shield": 270,
    "armor": 135,
    "energy": 175,
    "sprintSpeed": 1.1,
    "description": "Launch a fiery projectile dealing Heat damage. Can be combo-chained for increased damage. Immolation Heat adds bonus combo multiplier.",
    "passive": "Receive |STRENGTH|% Ability Strength for every enemy within <AFFINITY_SHARE>Affinity Range affected by <DT_FIRE_COLOR>Heat.",
    "abilities": [
      {
        "name": "Fireball",
        "energyCost": 25,
        "description": "Launch a fiery projectile dealing Heat damage. Can be combo-chained for increased damage. Immolation Heat adds bonus combo multiplier.",
        "radius": 3,
        "statusChance": 1,
        "castTime": 0.5,
        "damageType": "Heat"
      },
      {
        "name": "Immolation",
        "energyCost": 0,
        "description": "Ignite Ember with protective flames. Passively grants armor and increases Fireball damage. Drains energy when Heat meter is full.",
        "armor": 250,
        "damageReduction": 0.5
      },
      {
        "name": "Fire Blast",
        "energyCost": 50,
        "description": "Create a ring of fire that knocks back enemies and strips up to 100% of their armor over time.",
        "damage": 400,
        "range": 15,
        "radius": 5,
        "statusChance": 1,
        "castTime": 0.8,
        "damageType": "Heat"
      },
      {
        "name": "Inferno",
        "energyCost": 100,
        "description": "Summon meteors that crash down and create pools of fire. Enemies in the fire take Heat damage and the fire can spread to nearby enemies.",
        "damage": 250,
        "range": 25,
        "duration": 7,
        "radius": 5,
        "statusChance": 1,
        "damageType": "Heat"
      }
    ]
  },
  {
    "id": "ember_prime",
    "name": "Ember Prime",
    "health": 270,
    "shield": 365,
    "armor": 160,
    "energy": 175,
    "sprintSpeed": 1.1,
    "description": "Launch a fiery projectile dealing Heat damage. Can be combo-chained for increased damage. Immolation Heat adds bonus combo multiplier.",
    "passive": "Receive |STRENGTH|% Ability Strength for every enemy within <AFFINITY_SHARE>Affinity Range affected by <DT_FIRE_COLOR>Heat.",
    "abilities": [
      {
        "name": "Fireball",
        "energyCost": 25,
        "description": "Launch a fiery projectile dealing Heat damage. Can be combo-chained for increased damage. Immolation Heat adds bonus combo multiplier.",
        "radius": 3,
        "statusChance": 1,
        "castTime": 0.5,
        "damageType": "Heat"
      },
      {
        "name": "Immolation",
        "energyCost": 0,
        "description": "Ignite Ember with protective flames. Passively grants armor and increases Fireball damage. Drains energy when Heat meter is full.",
        "armor": 250,
        "damageReduction": 0.5
      },
      {
        "name": "Fire Blast",
        "energyCost": 50,
        "description": "Create a ring of fire that knocks back enemies and strips up to 100% of their armor over time.",
        "damage": 400,
        "range": 15,
        "radius": 5,
        "statusChance": 1,
        "castTime": 0.8,
        "damageType": "Heat"
      },
      {
        "name": "Inferno",
        "energyCost": 100,
        "description": "Summon meteors that crash down and create pools of fire. Enemies in the fire take Heat damage and the fire can spread to nearby enemies.",
        "damage": 250,
        "range": 25,
        "duration": 7,
        "radius": 5,
        "statusChance": 1,
        "damageType": "Heat"
      }
    ]
  },
  {
    "id": "equinox",
    "name": "Equinox",
    "health": 270,
    "shield": 270,
    "armor": 135,
    "energy": 175,
    "sprintSpeed": 1.15,
    "description": "Switch forms, temporarily gaining bonus Shields and Armor in Night-Form, or bonus Damage and Speed in Day-Form.",
    "passive": "|PERCENT|% of Health Orbs are converted into Energy, and |PERCENT|% of Energy Orbs are converted into Health.",
    "abilities": [
      {
        "name": "Metamorphosis",
        "energyCost": 25,
        "description": "Switch forms, temporarily gaining bonus Shields and Armor in Night-Form, or bonus Damage and Speed in Day-Form.",
        "castTime": 0.5
      },
      {
        "name": "Rest & Rage",
        "energyCost": 50,
        "description": "In Night-Form, targets are put to sleep. In Day-Form, targets become more vulnerable to damage.",
        "damage": 200,
        "range": 25,
        "duration": 15,
        "radius": 15,
        "castTime": 0.6,
        "damageType": "Impact"
      },
      {
        "name": "Pacify & Provoke",
        "energyCost": 75,
        "description": "In Night-Form, reduces damage inflicted by nearby enemies. In Day-Form, increases Ability Strength of nearby allies.",
        "range": 20,
        "duration": 30,
        "radius": 20,
        "castTime": 0.5
      },
      {
        "name": "Mend & Maim",
        "energyCost": 100,
        "description": "In Night-Form, allies\" Shields are replenished with each nearby enemy killed. In Day-Form, enemies are inflicted with Slash Status Effect. Deactivate while in Night-Form to heal allies.",
        "damage": 400,
        "range": 25,
        "duration": 20,
        "radius": 20,
        "castTime": 0.8,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "equinox_prime",
    "name": "Equinox Prime",
    "health": 365,
    "shield": 270,
    "armor": 160,
    "energy": 200,
    "sprintSpeed": 1.15,
    "description": "Switch forms, temporarily gaining bonus Shields and Armor in Night-Form, or bonus Damage and Speed in Day-Form.",
    "passive": "|PERCENT|% of Health Orbs are converted into Energy, and |PERCENT|% of Energy Orbs are converted into Health.",
    "abilities": [
      {
        "name": "Metamorphosis",
        "energyCost": 25,
        "description": "Switch forms, temporarily gaining bonus Shields and Armor in Night-Form, or bonus Damage and Speed in Day-Form.",
        "castTime": 0.5
      },
      {
        "name": "Rest & Rage",
        "energyCost": 50,
        "description": "In Night-Form, targets are put to sleep. In Day-Form, targets become more vulnerable to damage.",
        "damage": 200,
        "range": 25,
        "duration": 15,
        "radius": 15,
        "castTime": 0.6,
        "damageType": "Impact"
      },
      {
        "name": "Pacify & Provoke",
        "energyCost": 75,
        "description": "In Night-Form, reduces damage inflicted by nearby enemies. In Day-Form, increases Ability Strength of nearby allies.",
        "range": 20,
        "duration": 30,
        "radius": 20,
        "castTime": 0.5
      },
      {
        "name": "Mend & Maim",
        "energyCost": 100,
        "description": "In Night-Form, allies\" Shields are replenished with each nearby enemy killed. In Day-Form, enemies are inflicted with Slash Status Effect. Deactivate while in Night-Form to heal allies.",
        "damage": 400,
        "range": 25,
        "duration": 20,
        "radius": 20,
        "castTime": 0.8,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "excalibur",
    "name": "Excalibur",
    "health": 270,
    "shield": 270,
    "armor": 240,
    "energy": 100,
    "sprintSpeed": 1,
    "description": "Slash and dash through enemies alongside a radial specter. The powerful Exalted Blade's slashes inflict Slash Status.",
    "passive": "Excalibur deals |DAMAGE|% increased damage and attacks |SPEED|% faster when wielding swords.",
    "abilities": [
      {
        "name": "Slash Dash",
        "energyCost": 25,
        "description": "Slash and dash through enemies alongside a radial specter. The powerful Exalted Blade's slashes inflict Slash Status.",
        "damage": 300,
        "range": 20,
        "statusChance": 1,
        "castTime": 0.3,
        "damageType": "Slash"
      },
      {
        "name": "Radial Blind",
        "energyCost": 50,
        "description": "Emit a bright flash of light, blinding all nearby enemies. Blinded enemies are vulnerable to melee finishers and susceptible to stealth damage bonus.",
        "range": 25,
        "duration": 15,
        "castTime": 0.5
      },
      {
        "name": "Radial Javelin",
        "energyCost": 75,
        "description": "Radial javelins impale nearby enemies, inflicting Slash Status and pinning them to walls.",
        "damage": 1000,
        "range": 25,
        "statusChance": 1,
        "castTime": 0.8,
        "damageType": "Slash"
      },
      {
        "name": "Exalted Blade",
        "energyCost": 25,
        "description": "Summon a sword of pure light and immense power. Wield Excalibur Exalted Blade for devastating melee attacks with extended reach.",
        "damage": 250,
        "range": 10,
        "castTime": 0.5,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "excalibur_prime",
    "name": "Excalibur Prime",
    "health": 270,
    "shield": 270,
    "armor": 315,
    "energy": 175,
    "sprintSpeed": 1,
    "description": "Slash and dash through enemies alongside a radial specter. The powerful Exalted Blade's slashes inflict Slash Status.",
    "passive": "Excalibur Prime deals |DAMAGE|% increased damage and attacks |SPEED|% faster when wielding swords.",
    "abilities": [
      {
        "name": "Slash Dash",
        "energyCost": 25,
        "description": "Slash and dash through enemies alongside a radial specter. The powerful Exalted Blade's slashes inflict Slash Status.",
        "damage": 300,
        "range": 20,
        "statusChance": 1,
        "castTime": 0.3,
        "damageType": "Slash"
      },
      {
        "name": "Radial Blind",
        "energyCost": 50,
        "description": "Emit a bright flash of light, blinding all nearby enemies. Blinded enemies are vulnerable to melee finishers and susceptible to stealth damage bonus.",
        "range": 25,
        "duration": 15,
        "castTime": 0.5
      },
      {
        "name": "Radial Javelin",
        "energyCost": 75,
        "description": "Radial javelins impale nearby enemies, inflicting Slash Status and pinning them to walls.",
        "damage": 1000,
        "range": 25,
        "statusChance": 1,
        "castTime": 0.8,
        "damageType": "Slash"
      },
      {
        "name": "Exalted Blade",
        "energyCost": 25,
        "description": "Summon a sword of pure light and immense power. Wield Excalibur Exalted Blade for devastating melee attacks with extended reach.",
        "damage": 250,
        "range": 10,
        "castTime": 0.5,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "excalibur_umbra",
    "name": "Excalibur Umbra",
    "health": 270,
    "shield": 270,
    "armor": 315,
    "energy": 175,
    "sprintSpeed": 1,
    "description": "Slash and dash through enemies alongside a radial specter. The powerful Exalted Blade\u2019s slashes inflict <DT_SLASH_COLOR>Slash Status.",
    "passive": "Umbra exhibits sentience in combat without Transference control. Attacks |SPEED|% faster and deals |DAMAGE|% more damage while wielding swords.",
    "abilities": [
      {
        "name": "Slash Dash",
        "energyCost": 25,
        "description": "Slash and dash through enemies alongside a radial specter. The powerful Exalted Blade\u2019s slashes inflict <DT_SLASH_COLOR>Slash Status."
      },
      {
        "name": "Radial Howl",
        "energyCost": 50,
        "description": "Let out ferocious howl that stuns nearby enemies and causes Sentients to shed any built up resistances.",
        "damage": 200,
        "range": 25,
        "duration": 15,
        "radius": 20,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Radial Javelin",
        "energyCost": 75,
        "description": "Radial javelins impale nearby enemies, inflicting Slash Status and pinning them to walls.",
        "damage": 1000,
        "range": 25,
        "statusChance": 1,
        "castTime": 0.8,
        "damageType": "Slash"
      },
      {
        "name": "Exalted Blade",
        "energyCost": 25,
        "description": "Summon a sword of pure light and immense power. Wield Excalibur Exalted Blade for devastating melee attacks with extended reach.",
        "damage": 250,
        "range": 10,
        "castTime": 0.5,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "follie",
    "name": "Follie",
    "health": 485,
    "shield": 225,
    "armor": 325,
    "energy": 175,
    "sprintSpeed": 0.95,
    "description": "Drop through an inky frame and emerge invulnerable at the aimed location in a splash of ink that inflicts Inkblot on nearby enemies.",
    "passive": "INKBLOT: Follie's abilities splatter thick viscous ink onto enemies, applying a 50% slow for 10 seconds. While coated in ink, slain foes have a 20% chance to congeal an ink balloon that pops, dropping a random mixture of 3 Health and Energy Orbs.",
    "abilities": [
      {
        "name": "Forced Perspective",
        "energyCost": 15,
        "description": "Drop through an inky frame and emerge invulnerable at the aimed location in a splash of ink that inflicts Inkblot on nearby enemies.",
        "damage": 750,
        "range": 100,
        "radius": 5,
        "duration": 3.5,
        "castTime": 0.4,
        "damageType": "Corrosive"
      },
      {
        "name": "Shadowgraph",
        "energyCost": 25,
        "description": "Bring shadowgraphs from Follie's sketchbook to life as items that can be used for tactical advantage. Shadowgraphs splash Inkblot onto nearby enemies when created.",
        "damage": 250,
        "range": 50,
        "duration": 20,
        "radius": 4,
        "castTime": 0.5
      },
      {
        "name": "Self Portrait",
        "energyCost": 50,
        "description": "Draw an ink effigy to absorb the damage dealt to Follie and allies. A pool of ink spreads Inkblot; kill enemies inside the pool to grow the effigy and its ink puddle.",
        "damage": 550,
        "range": 50,
        "duration": 30,
        "radius": 20,
        "damageReduction": 0.5,
        "castTime": 0.6,
        "miscStats": { "drCap": 0.9, "maxDuration": 60 }
      },
      {
        "name": "Plein Air",
        "energyCost": 75,
        "description": "Tie nearby enemies to floating balloons that douse them with Inkblot. Pop the balloons to send them crashing to the ground, splashing Corrosive damage on nearby enemies.",
        "damage": 25000,
        "range": 18,
        "duration": 25,
        "radius": 18,
        "castTime": 0.8,
        "damageType": "Corrosive",
        "miscStats": { "defenseReduction": 0.5, "splashRadius": 4 }
      }
    ]
  },
  {
    "id": "frost",
    "name": "Frost",
    "health": 270,
    "shield": 455,
    "armor": 315,
    "energy": 100,
    "sprintSpeed": 0.94999999,
    "description": "Launch a freezing projectile that deals Cold damage and freezes solid on impact.",
    "passive": "Cold Status Effects from Frost's Abilities last |DURATION|% longer. Frost gains |ARMOR| Armor for each enemy afflicted with <DT_FREEZE_COLOR>Cold within <AFFINITY_SHARE>Affinity Range.",
    "abilities": [
      {
        "name": "Freeze",
        "energyCost": 25,
        "description": "Launch a freezing projectile that deals Cold damage and freezes solid on impact.",
        "damage": 500,
        "range": 30,
        "statusChance": 1,
        "castTime": 0.3,
        "damageType": "Cold"
      },
      {
        "name": "Ice Wave",
        "energyCost": 50,
        "description": "Create a wave of ice crystals that deals Cold damage to all enemies in its path.",
        "damage": 1000,
        "range": 40,
        "statusChance": 1,
        "castTime": 0.5,
        "damageType": "Cold"
      },
      {
        "name": "Snow Globe",
        "energyCost": 50,
        "description": "Create a protective dome of ice that blocks enemy fire and slows enemies inside.",
        "duration": 30,
        "radius": 10,
        "health": 3500,
        "castTime": 0.5
      },
      {
        "name": "Avalanche",
        "energyCost": 100,
        "description": "Summon an avalanche that freezes all enemies in radius then shatters them for massive damage.",
        "damage": 2000,
        "range": 25,
        "statusChance": 1,
        "castTime": 0.8,
        "damageType": "Cold"
      }
    ]
  },
  {
    "id": "frost_prime",
    "name": "Frost Prime",
    "health": 270,
    "shield": 550,
    "armor": 315,
    "energy": 100,
    "sprintSpeed": 0.94999999,
    "description": "Launch a freezing projectile that deals Cold damage and freezes solid on impact.",
    "passive": "Cold Status Effects from Frost's Abilities last |DURATION|% longer. Frost gains |ARMOR| Armor for each enemy afflicted with <DT_FREEZE_COLOR>Cold within <AFFINITY_SHARE>Affinity Range.",
    "abilities": [
      {
        "name": "Freeze",
        "energyCost": 25,
        "description": "Launch a freezing projectile that deals Cold damage and freezes solid on impact.",
        "damage": 500,
        "range": 30,
        "statusChance": 1,
        "castTime": 0.3,
        "damageType": "Cold"
      },
      {
        "name": "Ice Wave",
        "energyCost": 50,
        "description": "Create a wave of ice crystals that deals Cold damage to all enemies in its path.",
        "damage": 1000,
        "range": 40,
        "statusChance": 1,
        "castTime": 0.5,
        "damageType": "Cold"
      },
      {
        "name": "Snow Globe",
        "energyCost": 50,
        "description": "Create a protective dome of ice that blocks enemy fire and slows enemies inside.",
        "duration": 30,
        "radius": 10,
        "health": 3500,
        "castTime": 0.5
      },
      {
        "name": "Avalanche",
        "energyCost": 100,
        "description": "Summon an avalanche that freezes all enemies in radius then shatters them for massive damage.",
        "damage": 2000,
        "range": 25,
        "statusChance": 1,
        "castTime": 0.8,
        "damageType": "Cold"
      }
    ]
  },
  {
    "id": "gara",
    "name": "Gara",
    "health": 270,
    "shield": 270,
    "armor": 160,
    "energy": 175,
    "sprintSpeed": 1.15,
    "description": "Lash out with stream of shattered glass, or hold for an arcing strike. Stats are boosted by the equipped mods on Shattered Lash.",
    "passive": "A chance to create a radial blind lasting |DURATION|s when Gara casts Abilities.",
    "abilities": [
      {
        "name": "Shattered Lash",
        "energyCost": 25,
        "description": "Lash out with stream of shattered glass, or hold for an arcing strike. Stats are boosted by the equipped mods on Shattered Lash.",
        "damage": 350,
        "range": 25,
        "castTime": 0.4,
        "damageType": "Puncture"
      },
      {
        "name": "Splinter Storm",
        "energyCost": 50,
        "description": "Gara's armor splinters into a maelstrom of shattered glass. Allies who contact the cloud are fortified against damage.",
        "damage": 200,
        "range": 20,
        "duration": 25,
        "radius": 15,
        "castTime": 0.5,
        "damageType": "Slash"
      },
      {
        "name": "Spectrorage",
        "energyCost": 75,
        "description": "Trap enemies in a carousel of mirrors, forcing them to attack visions of their true selves. Destroyed mirrors damage their attackers, as does the collapse of the carousel.",
        "damage": 300,
        "range": 20,
        "duration": 20,
        "radius": 12,
        "castTime": 0.6,
        "damageType": "Slash"
      },
      {
        "name": "Mass Vitrify",
        "energyCost": 100,
        "description": "Create an expanding ring of molten glass that slowly crystallizes enemies who enter. When the expansion is complete, the ring hardens to block weapons fire. The ring draws extra strength from the health and shields of crystallized enemies.",
        "damage": 400,
        "range": 30,
        "duration": 30,
        "radius": 15,
        "castTime": 1,
        "damageType": "Cold"
      }
    ]
  },
  {
    "id": "gara_prime",
    "name": "Gara Prime",
    "health": 345,
    "shield": 270,
    "armor": 200,
    "energy": 175,
    "sprintSpeed": 1.15,
    "description": "Lash out with stream of shattered glass, or hold for an arcing strike. Stats are boosted by the equipped mods on Shattered Lash.",
    "passive": "A chance to create a radial blind lasting |DURATION|s when Gara casts Abilities.",
    "abilities": [
      {
        "name": "Shattered Lash",
        "energyCost": 25,
        "description": "Lash out with stream of shattered glass, or hold for an arcing strike. Stats are boosted by the equipped mods on Shattered Lash.",
        "damage": 350,
        "range": 25,
        "castTime": 0.4,
        "damageType": "Puncture"
      },
      {
        "name": "Splinter Storm",
        "energyCost": 50,
        "description": "Gara's armor splinters into a maelstrom of shattered glass. Allies who contact the cloud are fortified against damage.",
        "damage": 200,
        "range": 20,
        "duration": 25,
        "radius": 15,
        "castTime": 0.5,
        "damageType": "Slash"
      },
      {
        "name": "Spectrorage",
        "energyCost": 75,
        "description": "Trap enemies in a carousel of mirrors, forcing them to attack visions of their true selves. Destroyed mirrors damage their attackers, as does the collapse of the carousel.",
        "damage": 300,
        "range": 20,
        "duration": 20,
        "radius": 12,
        "castTime": 0.6,
        "damageType": "Slash"
      },
      {
        "name": "Mass Vitrify",
        "energyCost": 100,
        "description": "Create an expanding ring of molten glass that slowly crystallizes enemies who enter. When the expansion is complete, the ring hardens to block weapons fire. The ring draws extra strength from the health and shields of crystallized enemies.",
        "damage": 400,
        "range": 30,
        "duration": 30,
        "radius": 15,
        "castTime": 1,
        "damageType": "Cold"
      }
    ]
  },
  {
    "id": "garuda",
    "name": "Garuda",
    "health": 270,
    "shield": 270,
    "armor": 315,
    "energy": 140,
    "sprintSpeed": 1,
    "description": "Rip the life force from an enemy and use it as a shield that captures damage, this kills significantly weakened enemies instantly. Charge to channel the captured damage into an explosive projectile.",
    "passive": "Garuda's damage temporarily increases with each enemy she kills, to a maximum of |DAMAGE|%.  Slashes with her talons if no melee weapon is equipped.",
    "abilities": [
      {
        "name": "Dread Mirror",
        "energyCost": 25,
        "description": "Rip the life force from an enemy and use it as a shield that captures damage, this kills significantly weakened enemies instantly. Charge to channel the captured damage into an explosive projectile.",
        "damage": 300,
        "range": 15,
        "castTime": 0.5,
        "damageType": "Puncture"
      },
      {
        "name": "Blood Altar",
        "energyCost": 50,
        "description": "Impale an enemy on an altar of talons and siphon health for Garuda and her allies.",
        "damage": 200,
        "range": 30,
        "duration": 20,
        "radius": 5,
        "castTime": 0.8,
        "damageType": "Puncture"
      },
      {
        "name": "Bloodletting",
        "energyCost": 0,
        "description": "Garuda sacrifices her health to generate energy and clear Status Effects.",
        "castTime": 0.5
      },
      {
        "name": "Seeking Talons",
        "energyCost": 100,
        "description": "Charge to expand the targeting area, release to send Garuda's talons careening toward each target in area. Surviving enemies are prone to <DT_SLASH_COLOR>Slash Status.",
        "damage": 500,
        "range": 20,
        "radius": 15,
        "statusChance": 1,
        "castTime": 0.6,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "garuda_prime",
    "name": "Garuda Prime",
    "health": 270,
    "shield": 270,
    "armor": 420,
    "energy": 220,
    "sprintSpeed": 1,
    "description": "Rip the life force from an enemy and use it as a shield that captures damage, this kills significantly weakened enemies instantly. Charge to channel the captured damage into an explosive projectile.",
    "passive": "Garuda's damage temporarily increases with each enemy she kills, to a maximum of |DAMAGE|%.  Slashes with her talons if no melee weapon is equipped.",
    "abilities": [
      {
        "name": "Dread Mirror",
        "energyCost": 25,
        "description": "Rip the life force from an enemy and use it as a shield that captures damage, this kills significantly weakened enemies instantly. Charge to channel the captured damage into an explosive projectile.",
        "damage": 300,
        "range": 15,
        "castTime": 0.5,
        "damageType": "Puncture"
      },
      {
        "name": "Blood Altar",
        "energyCost": 50,
        "description": "Impale an enemy on an altar of talons and siphon health for Garuda and her allies.",
        "damage": 200,
        "range": 30,
        "duration": 20,
        "radius": 5,
        "castTime": 0.8,
        "damageType": "Puncture"
      },
      {
        "name": "Bloodletting",
        "energyCost": 0,
        "description": "Garuda sacrifices her health to generate energy and clear Status Effects.",
        "castTime": 0.5
      },
      {
        "name": "Seeking Talons",
        "energyCost": 100,
        "description": "Charge to expand the targeting area, release to send Garuda's talons careening toward each target in area. Surviving enemies are prone to <DT_SLASH_COLOR>Slash Status.",
        "damage": 500,
        "range": 20,
        "radius": 15,
        "statusChance": 1,
        "castTime": 0.6,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "gauss",
    "name": "Gauss",
    "health": 270,
    "shield": 455,
    "armor": 185,
    "energy": 175,
    "sprintSpeed": 1.4,
    "description": "Burst into a hyper-sprint bowling over enemies and charging the battery. Crashing into solid objects generates a powerful shockwave. Hold to rush continuously.",
    "passive": "Moving generates an electrical current that fills Gauss\" battery. Shields recharge up to |SPEED|% faster while the Recharge Delay is up to |DELAY|% shorter, based on the battery level.",
    "abilities": [
      {
        "name": "Mach Rush",
        "energyCost": 25,
        "description": "Burst into a hyper-sprint bowling over enemies and charging the battery. Crashing into solid objects generates a powerful shockwave. Hold to rush continuously.",
        "damage": 200,
        "range": 20,
        "radius": 5,
        "castTime": 0.3,
        "damageType": "Impact"
      },
      {
        "name": "Kinetic Plating",
        "energyCost": 50,
        "description": "Generate armor plating that converts a portion of absorbed Kinetic Damage (Physical, Heat, Cold, and Blast) into Energy. Also protects Gauss from being staggered or knocked down.",
        "range": 15,
        "duration": 25,
        "radius": 15,
        "castTime": 0.5
      },
      {
        "name": "Thermal Sunder",
        "energyCost": 50,
        "description": "Siphon kinetic energy from the area, charging the battery and inflicting Cold Status on nearby enemies. Hold reverses the process, draining the battery and inflicting Heat Status.",
        "damage": 300,
        "range": 15,
        "duration": 8,
        "radius": 10,
        "statusChance": 1,
        "castTime": 0.5,
        "damageType": "Cold"
      },
      {
        "name": "Redline",
        "energyCost": 100,
        "description": "Push Gauss\" battery beyond the redline, supercharging his Abilities and setting Fire Rate, Attack Speed, Reload Speed, and Casting Speed into overdrive. When past the redline, bolts of energy will periodically strike from Gauss.",
        "damage": 500,
        "range": 20,
        "duration": 30,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Electricity"
      }
    ]
  },
  {
    "id": "gauss_prime",
    "name": "Gauss Prime",
    "health": 270,
    "shield": 550,
    "armor": 185,
    "energy": 175,
    "sprintSpeed": 1.5,
    "description": "Burst into a hyper-sprint bowling over enemies and charging the battery. Crashing into solid objects generates a powerful shockwave. Hold to rush continuously.",
    "passive": "Moving generates an electrical current that fills Gauss\" battery. Shields recharge up to |SPEED|% faster while the Recharge Delay is up to |DELAY|% shorter, based on the battery level.",
    "abilities": [
      {
        "name": "Mach Rush",
        "energyCost": 25,
        "description": "Burst into a hyper-sprint bowling over enemies and charging the battery. Crashing into solid objects generates a powerful shockwave. Hold to rush continuously.",
        "damage": 200,
        "range": 20,
        "radius": 5,
        "castTime": 0.3,
        "damageType": "Impact"
      },
      {
        "name": "Kinetic Plating",
        "energyCost": 50,
        "description": "Generate armor plating that converts a portion of absorbed Kinetic Damage (Physical, Heat, Cold, and Blast) into Energy. Also protects Gauss from being staggered or knocked down.",
        "range": 15,
        "duration": 25,
        "radius": 15,
        "castTime": 0.5
      },
      {
        "name": "Thermal Sunder",
        "energyCost": 50,
        "description": "Siphon kinetic energy from the area, charging the battery and inflicting Cold Status on nearby enemies. Hold reverses the process, draining the battery and inflicting Heat Status.",
        "damage": 300,
        "range": 15,
        "duration": 8,
        "radius": 10,
        "statusChance": 1,
        "castTime": 0.5,
        "damageType": "Cold"
      },
      {
        "name": "Redline",
        "energyCost": 100,
        "description": "Push Gauss\" battery beyond the redline, supercharging his Abilities and setting Fire Rate, Attack Speed, Reload Speed, and Casting Speed into overdrive. When past the redline, bolts of energy will periodically strike from Gauss.",
        "damage": 500,
        "range": 20,
        "duration": 30,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Electricity"
      }
    ]
  },
  {
    "id": "grendel",
    "name": "Grendel",
    "health": 1095,
    "shield": 95,
    "armor": 370,
    "energy": 175,
    "sprintSpeed": 0.94999999,
    "description": "Swallow enemies whole and store them in Grendel's gut. Hold to vomit out stored enemies, covering them in toxic bile.",
    "passive": "Each enemy consumed grants |ARMOUR| bonus armor.",
    "abilities": [
      {
        "name": "Feast",
        "energyCost": 25,
        "description": "Swallow enemies whole and store them in Grendel's gut. Hold to vomit out stored enemies, covering them in toxic bile.",
        "range": 15,
        "radius": 10,
        "castTime": 0.4
      },
      {
        "name": "Nourish",
        "energyCost": 50,
        "description": "Regenerate health as Grendel absorbs nourishment from enemies in his gut. While he digests, enemies that attack or are attacked by Grendel suffer Viral Damage and Status.",
        "range": 15,
        "duration": 20,
        "castTime": 0.5
      },
      {
        "name": "Pulverize",
        "energyCost": 0,
        "description": "Grendel curls into a ball. He heals over time as he rolls, knocking over anyone in his path. Jumping slams Grendel into the ground and generates a damaging shockwave.",
        "damage": 400,
        "range": 10,
        "radius": 8,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Regurgitate",
        "energyCost": 0,
        "description": "Violently puke out a bile soaked enemy from Grendel's gut, turning the consumed into a toxic projectile. Nearby enemies are slowed and have their armor dissolved by the bile.",
        "damage": 600,
        "range": 30,
        "radius": 8,
        "castTime": 0.3,
        "damageType": "Toxin"
      }
    ]
  },
  {
    "id": "grendel_prime",
    "name": "Grendel Prime",
    "health": 1095,
    "shield": 95,
    "armor": 400,
    "energy": 200,
    "sprintSpeed": 0.94999999,
    "description": "Swallow enemies whole and store them in Grendel's gut. Hold to vomit out stored enemies, covering them in toxic bile.",
    "passive": "Each enemy consumed grants |ARMOUR| bonus armor.",
    "abilities": [
      {
        "name": "Feast",
        "energyCost": 25,
        "description": "Swallow enemies whole and store them in Grendel's gut. Hold to vomit out stored enemies, covering them in toxic bile.",
        "range": 15,
        "radius": 10,
        "castTime": 0.4
      },
      {
        "name": "Nourish",
        "energyCost": 50,
        "description": "Regenerate health as Grendel absorbs nourishment from enemies in his gut. While he digests, enemies that attack or are attacked by Grendel suffer Viral Damage and Status.",
        "range": 15,
        "duration": 20,
        "castTime": 0.5
      },
      {
        "name": "Pulverize",
        "energyCost": 0,
        "description": "Grendel curls into a ball. He heals over time as he rolls, knocking over anyone in his path. Jumping slams Grendel into the ground and generates a damaging shockwave.",
        "damage": 400,
        "range": 10,
        "radius": 8,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Regurgitate",
        "energyCost": 0,
        "description": "Violently puke out a bile soaked enemy from Grendel's gut, turning the consumed into a toxic projectile. Nearby enemies are slowed and have their armor dissolved by the bile.",
        "damage": 600,
        "range": 30,
        "radius": 8,
        "castTime": 0.3,
        "damageType": "Toxin"
      }
    ]
  },
  {
    "id": "gyre",
    "name": "Gyre",
    "health": 270,
    "shield": 550,
    "armor": 105,
    "energy": 190,
    "sprintSpeed": 1,
    "description": "Launch a Gyratory Sphere that will deal high damage on impact and periodically deal electrical shocks to nearby enemies. Hit multiple enemies at once with the initial launch to enhance damage.",
    "passive": "Gyre's abilities have a 10% chance to deal critical damage for each Electrical status that affects the enemy.",
    "abilities": [
      {
        "name": "Arcsphere",
        "energyCost": 25,
        "description": "Launch a Gyratory Sphere that will deal high damage on impact and periodically deal electrical shocks to nearby enemies. Hit multiple enemies at once with the initial launch to enhance damage.",
        "damage": 400,
        "range": 30,
        "duration": 20,
        "radius": 6,
        "castTime": 0.5,
        "damageType": "Electricity"
      },
      {
        "name": "Coil Horizon",
        "energyCost": 50,
        "description": "Throw forward a Gyratory Sphere that will implode after a few seconds or can be manually triggered.",
        "damage": 600,
        "range": 40,
        "duration": 3,
        "radius": 12,
        "castTime": 0.6,
        "damageType": "Electricity"
      },
      {
        "name": "Cathode Grace",
        "energyCost": 50,
        "description": "Gain a brief burst of increased Critical Chance and Energy Regen, with each kill extending duration of Cathode Grace. Casting is on a cooldown.",
        "duration": 15,
        "castTime": 0.5
      },
      {
        "name": "Rotorswell",
        "energyCost": 100,
        "description": "Gyre's mechanisms spin at incredible speeds, generating an Electric Field that shocks nearby enemies. When Gyre gets a critical hit, a large electrical discharge will chain from the target to nearby enemies.",
        "damage": 300,
        "range": 15,
        "duration": 25,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Electricity"
      }
    ]
  },
  {
    "id": "gyre_prime",
    "name": "Gyre Prime",
    "health": 345,
    "shield": 640,
    "armor": 105,
    "energy": 190,
    "sprintSpeed": 1.05,
    "description": "Launch a Gyratory Sphere that will deal high damage on impact and periodically deal electrical shocks to nearby enemies. Hit multiple enemies at once with the initial launch to enhance damage.",
    "passive": "Gyre's abilities have a 10% chance to deal critical damage for each Electrical status that affects the enemy.",
    "abilities": [
      {
        "name": "Arcsphere",
        "energyCost": 25,
        "description": "Launch a Gyratory Sphere that will deal high damage on impact and periodically deal electrical shocks to nearby enemies. Hit multiple enemies at once with the initial launch to enhance damage.",
        "damage": 400,
        "range": 30,
        "duration": 20,
        "radius": 6,
        "castTime": 0.5,
        "damageType": "Electricity"
      },
      {
        "name": "Coil Horizon",
        "energyCost": 50,
        "description": "Throw forward a Gyratory Sphere that will implode after a few seconds or can be manually triggered.",
        "damage": 600,
        "range": 40,
        "duration": 3,
        "radius": 12,
        "castTime": 0.6,
        "damageType": "Electricity"
      },
      {
        "name": "Cathode Grace",
        "energyCost": 50,
        "description": "Gain a brief burst of increased Critical Chance and Energy Regen, with each kill extending duration of Cathode Grace. Casting is on a cooldown.",
        "duration": 15,
        "castTime": 0.5
      },
      {
        "name": "Rotorswell",
        "energyCost": 100,
        "description": "Gyre's mechanisms spin at incredible speeds, generating an Electric Field that shocks nearby enemies. When Gyre gets a critical hit, a large electrical discharge will chain from the target to nearby enemies.",
        "damage": 300,
        "range": 15,
        "duration": 25,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Electricity"
      }
    ]
  },
  {
    "id": "harrow",
    "name": "Harrow",
    "health": 270,
    "shield": 455,
    "armor": 185,
    "energy": 100,
    "sprintSpeed": 1,
    "description": "Cast a wave of energy that chains them where they stand. Each enemy held reinforces Harrow's shields.",
    "passive": "Overshield capacity doubled. Start missions at maximum energy.",
    "abilities": [
      {
        "name": "Condemn",
        "energyCost": 25,
        "description": "Cast a wave of energy that chains them where they stand. Each enemy held reinforces Harrow's shields.",
        "damage": 200,
        "range": 20,
        "duration": 8,
        "radius": 15,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Penance",
        "energyCost": 50,
        "description": "Sacrifice Shields to boost Reload Speed, and Fire Rate while converting damage inflicted on enemies into health for Harrow and nearby allies.",
        "range": 15,
        "duration": 20,
        "radius": 15,
        "castTime": 0.5
      },
      {
        "name": "Thurible",
        "energyCost": 25,
        "description": "Channel Harrow's energy into the Thurible to generate a buff. Once finished, kill enemies to bestow nearby allies with bursts of energy. The more energy channeled the greater the reward.",
        "range": 20,
        "duration": 30,
        "radius": 20,
        "castTime": 1
      },
      {
        "name": "Covenant",
        "energyCost": 100,
        "description": "Protect nearby allies with an energy force that absorbs all damage and converts it to a Critical Chance bonus for all those under the Covenant. Headshots are amplified even further.",
        "range": 15,
        "duration": 8,
        "radius": 15,
        "castTime": 0.8
      }
    ]
  },
  {
    "id": "harrow_prime",
    "name": "Harrow Prime",
    "health": 270,
    "shield": 640,
    "armor": 185,
    "energy": 140,
    "sprintSpeed": 1,
    "description": "Cast a wave of energy that chains them where they stand. Each enemy held reinforces Harrow's shields.",
    "passive": "Overshield capacity doubled. Start missions at maximum energy.",
    "abilities": [
      {
        "name": "Condemn",
        "energyCost": 25,
        "description": "Cast a wave of energy that chains them where they stand. Each enemy held reinforces Harrow's shields.",
        "damage": 200,
        "range": 20,
        "duration": 8,
        "radius": 15,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Penance",
        "energyCost": 50,
        "description": "Sacrifice Shields to boost Reload Speed, and Fire Rate while converting damage inflicted on enemies into health for Harrow and nearby allies.",
        "range": 15,
        "duration": 20,
        "radius": 15,
        "castTime": 0.5
      },
      {
        "name": "Thurible",
        "energyCost": 25,
        "description": "Channel Harrow's energy into the Thurible to generate a buff. Once finished, kill enemies to bestow nearby allies with bursts of energy. The more energy channeled the greater the reward.",
        "range": 20,
        "duration": 30,
        "radius": 20,
        "castTime": 1
      },
      {
        "name": "Covenant",
        "energyCost": 100,
        "description": "Protect nearby allies with an energy force that absorbs all damage and converts it to a Critical Chance bonus for all those under the Covenant. Headshots are amplified even further.",
        "range": 15,
        "duration": 8,
        "radius": 15,
        "castTime": 0.8
      }
    ]
  },
  {
    "id": "helminth",
    "name": "Helminth",
    "health": 0,
    "shield": 0,
    "armor": 0,
    "energy": 0,
    "sprintSpeed": 1,
    "description": "Increase the efficiency of your ammo consumption.",
    "passive": "",
    "abilities": [
      {
        "name": "Energized Munitions",
        "energyCost": 25,
        "description": "Increase the efficiency of your ammo consumption."
      },
      {
        "name": "Master's Summons",
        "energyCost": 25,
        "description": "Heal your companion and call it to your side."
      },
      {
        "name": "Voracious Metastasis",
        "energyCost": 25,
        "description": "Consume Energy to heal yourself and grant matching Energy to each ally."
      },
      {
        "name": "Perspicacity",
        "energyCost": 25,
        "description": "Automatically succeed at your next hack attempt."
      }
    ]
  },
  {
    "id": "hildryn",
    "name": "Hildryn",
    "health": 180,
    "shield": 1280,
    "armor": 315,
    "energy": 0,
    "sprintSpeed": 1,
    "description": "Charge and launch devastating bolts of electricity.",
    "passive": "Hildryn's full Shield Gate is high. After her Shields are depleted, she is invulnerable to damage up to 3.5s.",
    "abilities": [
      {
        "name": "Balefire",
        "energyCost": 0,
        "description": "Charge and launch devastating bolts of electricity.",
        "damage": 500,
        "range": 40,
        "castTime": 0.5,
        "damageType": "Electricity"
      },
      {
        "name": "Pillage",
        "energyCost": 0,
        "description": "Pillage a percentage of Shields and Armor of nearby enemies to replenish Hildryn's own Shields and Overshields. Also removes Status Effects from Hildryn and her allies.",
        "range": 15,
        "radius": 15,
        "castTime": 0.8
      },
      {
        "name": "Haven",
        "energyCost": 0,
        "description": "Create a shield aura around allies. Enemies that approach shielded allies will take damage.",
        "damage": 200,
        "range": 15,
        "radius": 10,
        "castTime": 0.6,
        "damageType": "Electricity"
      },
      {
        "name": "Aegis Storm",
        "energyCost": 0,
        "description": "Take the skies and rain Balefire rockets down on the enemy. Nearby enemies are blasted into the air where they will create an Energy Orb every few seconds. When shields run out the enemies are slammed into the ground.",
        "damage": 800,
        "range": 20,
        "duration": 15,
        "radius": 15,
        "castTime": 1,
        "damageType": "Electricity"
      }
    ]
  },
  {
    "id": "hildryn_prime",
    "name": "Hildryn Prime",
    "health": 270,
    "shield": 1380,
    "armor": 315,
    "energy": 0,
    "sprintSpeed": 1.05,
    "description": "Charge and launch devastating bolts of electricity.",
    "passive": "Hildryn's full Shield Gate is high. After her Shields are depleted, she is invulnerable to damage up to 3.5s.",
    "abilities": [
      {
        "name": "Balefire",
        "energyCost": 0,
        "description": "Charge and launch devastating bolts of electricity.",
        "damage": 500,
        "range": 40,
        "castTime": 0.5,
        "damageType": "Electricity"
      },
      {
        "name": "Pillage",
        "energyCost": 0,
        "description": "Pillage a percentage of Shields and Armor of nearby enemies to replenish Hildryn's own Shields and Overshields. Also removes Status Effects from Hildryn and her allies.",
        "range": 15,
        "radius": 15,
        "castTime": 0.8
      },
      {
        "name": "Haven",
        "energyCost": 0,
        "description": "Create a shield aura around allies. Enemies that approach shielded allies will take damage.",
        "damage": 200,
        "range": 15,
        "radius": 10,
        "castTime": 0.6,
        "damageType": "Electricity"
      },
      {
        "name": "Aegis Storm",
        "energyCost": 0,
        "description": "Take the skies and rain Balefire rockets down on the enemy. Nearby enemies are blasted into the air where they will create an Energy Orb every few seconds. When shields run out the enemies are slammed into the ground.",
        "damage": 800,
        "range": 20,
        "duration": 15,
        "radius": 15,
        "castTime": 1,
        "damageType": "Electricity"
      }
    ]
  },
  {
    "id": "hydroid",
    "name": "Hydroid",
    "health": 270,
    "shield": 365,
    "armor": 240,
    "energy": 140,
    "sprintSpeed": 1.05,
    "description": "Summon a tempest to rain down upon a target area.",
    "passive": "Enemies damaged by Hydroid are more vulnerable to Corrosive Status, with initial Status reducing Armor by |PCT|%.",
    "abilities": [
      {
        "name": "Tempest Barrage",
        "energyCost": 25,
        "description": "Summon a tempest to rain down upon a target area.",
        "damage": 300,
        "range": 40,
        "duration": 10,
        "radius": 8,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Tidal Surge",
        "energyCost": 50,
        "description": "Crash through enemies in a ferocious wall of water.",
        "damage": 400,
        "range": 25,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Plunder",
        "energyCost": 50,
        "description": "Plunder Armor from nearby enemies and increase Corrosive Damage on your Abilities and weapons. Enemies affected by Corrosive Status offer greater rewards.",
        "range": 20,
        "radius": 15,
        "castTime": 0.8
      },
      {
        "name": "Tentacle Swarm",
        "energyCost": 100,
        "description": "Summon a creature from the depths. Its watery tentacles emerge from nearby surfaces to wreak havoc.",
        "damage": 350,
        "range": 30,
        "duration": 20,
        "radius": 15,
        "castTime": 1,
        "damageType": "Impact"
      }
    ]
  },
  {
    "id": "hydroid_prime",
    "name": "Hydroid Prime",
    "health": 270,
    "shield": 550,
    "armor": 290,
    "energy": 175,
    "sprintSpeed": 1.05,
    "description": "Summon a tempest to rain down upon a target area.",
    "passive": "Enemies damaged by Hydroid are more vulnerable to Corrosive Status, with initial Status reducing Armor by |PCT|%.",
    "abilities": [
      {
        "name": "Tempest Barrage",
        "energyCost": 25,
        "description": "Summon a tempest to rain down upon a target area.",
        "damage": 300,
        "range": 40,
        "duration": 10,
        "radius": 8,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Tidal Surge",
        "energyCost": 50,
        "description": "Crash through enemies in a ferocious wall of water.",
        "damage": 400,
        "range": 25,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Plunder",
        "energyCost": 50,
        "description": "Plunder Armor from nearby enemies and increase Corrosive Damage on your Abilities and weapons. Enemies affected by Corrosive Status offer greater rewards.",
        "range": 20,
        "radius": 15,
        "castTime": 0.8
      },
      {
        "name": "Tentacle Swarm",
        "energyCost": 100,
        "description": "Summon a creature from the depths. Its watery tentacles emerge from nearby surfaces to wreak havoc.",
        "damage": 350,
        "range": 30,
        "duration": 20,
        "radius": 15,
        "castTime": 1,
        "damageType": "Impact"
      }
    ]
  },
  {
    "id": "inaros",
    "name": "Inaros",
    "health": 2110,
    "shield": 0,
    "armor": 240,
    "energy": 100,
    "sprintSpeed": 1,
    "description": "Blast enemies with a wave of cursed sand that blinds them and steals their health.",
    "passive": "When Inaros takes lethal damage, he entombs himself in a sarcophagus and incarnates as sand to attack enemies, draining their lifeforce to revive himself.",
    "abilities": [
      {
        "name": "Desiccation",
        "energyCost": 25,
        "description": "Blast enemies with a wave of cursed sand that blinds them and steals their health."
      },
      {
        "name": "Sandstorm",
        "energyCost": 25,
        "description": "Become a sandstorm. Inaros devours enemies pulled into his whirlwind, healing himself."
      },
      {
        "name": "Scarab Shell",
        "energyCost": 25,
        "description": "Activate to form Armor by draining Inaros\" Health. Activate again to stop the formation early. The protective layer reduces incoming Damage and absorbs Status Effects."
      },
      {
        "name": "Scarab Swarm",
        "energyCost": 25,
        "description": "Summon a Scarab Swarm to attack enemies with guaranteed <DT_CORROSIVE_COLOR>Corrosive Status. Damage scales with Inaros\" Health. Enemies killed while immersed in the swarm summ..."
      }
    ]
  },
  {
    "id": "inaros_prime",
    "name": "Inaros Prime",
    "health": 2215,
    "shield": 0,
    "armor": 240,
    "energy": 140,
    "sprintSpeed": 1.05,
    "description": "Blast enemies with a wave of cursed sand that blinds them and steals their health.",
    "passive": "When Inaros takes lethal damage, he entombs himself in a sarcophagus and incarnates as sand to attack enemies, draining their lifeforce to revive himself.",
    "abilities": [
      {
        "name": "Desiccation",
        "energyCost": 25,
        "description": "Blast enemies with a wave of cursed sand that blinds them and steals their health."
      },
      {
        "name": "Sandstorm",
        "energyCost": 25,
        "description": "Become a sandstorm. Inaros devours enemies pulled into his whirlwind, healing himself."
      },
      {
        "name": "Scarab Shell",
        "energyCost": 25,
        "description": "Activate to form Armor by draining Inaros\" Health. Activate again to stop the formation early. The protective layer reduces incoming Damage and absorbs Status Effects."
      },
      {
        "name": "Scarab Swarm",
        "energyCost": 25,
        "description": "Summon a Scarab Swarm to attack enemies with guaranteed <DT_CORROSIVE_COLOR>Corrosive Status. Damage scales with Inaros\" Health. Enemies killed while immersed in the swarm summ..."
      }
    ]
  },
  {
    "id": "ivara",
    "name": "Ivara",
    "health": 180,
    "shield": 270,
    "armor": 105,
    "energy": 215,
    "sprintSpeed": 1.15,
    "description": "Cycle through and shoot one of four tactical arrows. Cloak creates a stationary bubble that cloaks Ivara and allies. Dashwire creates a traversable zipline. Noise emits a high-pitched sound to attract enemies. Sleep puts enemies to sleep.",
    "passive": "Senses nearby enemies within |RADIUS|m.",
    "abilities": [
      {
        "name": "Quiver",
        "energyCost": 25,
        "description": "Cycle through and shoot one of four tactical arrows. Cloak creates a stationary bubble that cloaks Ivara and allies. Dashwire creates a traversable zipline. Noise emits a high-pitched sound to attract enemies. Sleep puts enemies to sleep.",
        "damage": 200,
        "range": 30,
        "duration": 15,
        "radius": 8,
        "castTime": 0.4,
        "damageType": "Impact"
      },
      {
        "name": "Navigator",
        "energyCost": 25,
        "description": "Assume control of any projectile launched by Ivara and guide it to the target.",
        "range": 100,
        "castTime": 0.5
      },
      {
        "name": "Prowl",
        "energyCost": 25,
        "description": "Become invisible and steal loot from unsuspecting enemies or take out prey with deadly headshots.",
        "range": 20,
        "castTime": 0.5
      },
      {
        "name": "Artemis Bow",
        "energyCost": 50,
        "description": "Summon a mighty bow and unleash a volley of devastating arrows.",
        "damage": 400,
        "range": 50,
        "castTime": 0.8,
        "damageType": "Puncture"
      }
    ]
  },
  {
    "id": "ivara_prime",
    "name": "Ivara Prime",
    "health": 180,
    "shield": 455,
    "armor": 135,
    "energy": 250,
    "sprintSpeed": 1.2,
    "description": "Cycle through and shoot one of four tactical arrows. Cloak creates a stationary bubble that cloaks Ivara and allies. Dashwire creates a traversable zipline. Noise emits a high-pitched sound to attract enemies. Sleep puts enemies to sleep.",
    "passive": "Senses nearby enemies within |RADIUS|m.",
    "abilities": [
      {
        "name": "Quiver",
        "energyCost": 25,
        "description": "Cycle through and shoot one of four tactical arrows. Cloak creates a stationary bubble that cloaks Ivara and allies. Dashwire creates a traversable zipline. Noise emits a high-pitched sound to attract enemies. Sleep puts enemies to sleep.",
        "damage": 200,
        "range": 30,
        "duration": 15,
        "radius": 8,
        "castTime": 0.4,
        "damageType": "Impact"
      },
      {
        "name": "Navigator",
        "energyCost": 25,
        "description": "Assume control of any projectile launched by Ivara and guide it to the target.",
        "range": 100,
        "castTime": 0.5
      },
      {
        "name": "Prowl",
        "energyCost": 25,
        "description": "Become invisible and steal loot from unsuspecting enemies or take out prey with deadly headshots.",
        "range": 20,
        "castTime": 0.5
      },
      {
        "name": "Artemis Bow",
        "energyCost": 50,
        "description": "Summon a mighty bow and unleash a volley of devastating arrows.",
        "damage": 400,
        "range": 50,
        "castTime": 0.8,
        "damageType": "Puncture"
      }
    ]
  },
  {
    "id": "jade",
    "name": "Jade",
    "health": 365,
    "shield": 450,
    "armor": 135,
    "energy": 150,
    "sprintSpeed": 1,
    "description": "Create a well of light that heals allies and hurts enemies. Those who enter the well will be highlighted by Judgments.",
    "passive": "Jade's profound understanding of the relationship between life and death grants her two Aura Mod Slots. Some of her Abilities apply Judgments, increasing enemy damage vulnerability by |CHANCE|% for |DURATION|s.",
    "abilities": [
      {
        "name": "Light's Judgment",
        "energyCost": 25,
        "description": "Create a well of light that heals allies and hurts enemies. Those who enter the well will be highlighted by Judgments.",
        "damage": 300,
        "range": 25,
        "duration": 20,
        "radius": 12,
        "castTime": 0.6,
        "damageType": "Radiation"
      },
      {
        "name": "Symphony Of Mercy",
        "energyCost": 50,
        "description": "Cycle through three songs that strengthen allies. Power of The Seven increases Ability Strength. Deathbringer increases Weapon Damage. Spirit of Resilience increases Shield Efficiency.",
        "range": 30,
        "duration": 30,
        "radius": 30,
        "castTime": 0.5
      },
      {
        "name": "Ophanim Eyes",
        "energyCost": 75,
        "description": "Jade summons an accusatory gaze that slows nearby enemies and dissolves their Shields and Armor. When the gaze falls upon allies, they can be revived from a distance.",
        "range": 40,
        "duration": 25,
        "radius": 15,
        "castTime": 0.8
      },
      {
        "name": "Glory On High",
        "energyCost": 100,
        "description": "Soar with destructive power. Use alternate-fire to detonate Judgments, causing an explosion of Jade Light. Enemies inside the Light's Judgment radius empower the explosion.",
        "damage": 800,
        "range": 50,
        "duration": 30,
        "radius": 20,
        "castTime": 1,
        "damageType": "Radiation"
      }
    ]
  },
  {
    "id": "khora",
    "name": "Khora",
    "health": 365,
    "shield": 270,
    "armor": 290,
    "energy": 140,
    "sprintSpeed": 1.05,
    "description": "Send enemies reeling with a deafening whipcrack. Stats are boosted by the equipped mods on Whipclaw.",
    "passive": "The ferocious kavat, Venari, fights by Khora's side and provides her with a |SPEED|% speed boost while active. If killed, Venari will reappear after |RESPAWN|s.",
    "abilities": [
      {
        "name": "Whipclaw",
        "energyCost": 25,
        "description": "Send enemies reeling with a deafening whipcrack. Stats are boosted by the equipped mods on Whipclaw.",
        "damage": 400,
        "range": 20,
        "radius": 8,
        "castTime": 0.4,
        "damageType": "Slash"
      },
      {
        "name": "Ensnare",
        "energyCost": 50,
        "description": "Bind a hapless target in living metal, entangling others who stray too close. Whipclaw will refresh the trap allowing it to capture more enemies.",
        "range": 30,
        "duration": 15,
        "radius": 10,
        "castTime": 0.5
      },
      {
        "name": "Venari",
        "energyCost": 0,
        "description": "Command Venari to focus on a target. Hold to cycle between Attack, Protect, and Heal postures. If Venari is killed, use this ability to revive her instantly.",
        "range": 40,
        "castTime": 0.3
      },
      {
        "name": "Strangledome",
        "energyCost": 100,
        "description": "Weave a dome of living chain that ensnares and strangles any enemy within, and any foolish enough to approach. Foes outside the trap will try to hasten their comrade's deaths by shooting them.",
        "damage": 200,
        "range": 25,
        "duration": 20,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "khora_prime",
    "name": "Khora Prime",
    "health": 365,
    "shield": 365,
    "armor": 345,
    "energy": 175,
    "sprintSpeed": 1.05,
    "description": "Send enemies reeling with a deafening whipcrack. Stats are boosted by the equipped mods on Whipclaw.",
    "passive": "The ferocious kavat, Venari, fights by Khora's side and provides her with a |SPEED|% speed boost while active. If killed, Venari will reappear after |RESPAWN|s.",
    "abilities": [
      {
        "name": "Whipclaw",
        "energyCost": 25,
        "description": "Send enemies reeling with a deafening whipcrack. Stats are boosted by the equipped mods on Whipclaw.",
        "damage": 400,
        "range": 20,
        "radius": 8,
        "castTime": 0.4,
        "damageType": "Slash"
      },
      {
        "name": "Ensnare",
        "energyCost": 50,
        "description": "Bind a hapless target in living metal, entangling others who stray too close. Whipclaw will refresh the trap allowing it to capture more enemies.",
        "range": 30,
        "duration": 15,
        "radius": 10,
        "castTime": 0.5
      },
      {
        "name": "Venari",
        "energyCost": 0,
        "description": "Command Venari to focus on a target. Hold to cycle between Attack, Protect, and Heal postures. If Venari is killed, use this ability to revive her instantly.",
        "range": 40,
        "castTime": 0.3
      },
      {
        "name": "Strangledome",
        "energyCost": 100,
        "description": "Weave a dome of living chain that ensnares and strangles any enemy within, and any foolish enough to approach. Foes outside the trap will try to hasten their comrade's deaths by shooting them.",
        "damage": 200,
        "range": 25,
        "duration": 20,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "koumei",
    "name": "Koumei",
    "health": 344,
    "shield": 122,
    "armor": 444,
    "energy": 122,
    "sprintSpeed": 1,
    "description": "Weave the threads of destiny. Enemies who touch the threads suffer a random Elemental Status Effect. A roll of triple sixes creates threads that inflict one of every Elemental Status at once.",
    "passive": "Every |DURATION| seconds, one of Koumei's weapons will inflict random Status Effects for |DURATION| seconds.",
    "abilities": [
      {
        "name": "Kumihimo",
        "energyCost": 25,
        "description": "Weave the threads of destiny. Enemies who touch the threads suffer a random Elemental Status Effect. A roll of triple sixes creates threads that inflict one of every Elemental Status at once.",
        "damage": 250,
        "range": 25,
        "duration": 20,
        "radius": 5,
        "castTime": 0.5,
        "damageType": "Elemental"
      },
      {
        "name": "Omikuji",
        "energyCost": 50,
        "description": "Koumei glimpses a favorable future and the precise steps needed to reach it. Complete the challenge to earn a Decree. Unlucky rolls add a debuff, but you can hold the ability to reroll.",
        "range": 30,
        "castTime": 0.6
      },
      {
        "name": "Omamori",
        "energyCost": 75,
        "description": "Surround yourself with Omamori Charms, each with a chance to have enemy attacks heal you instead of damage you. The number of charms is determined by Koumei's dice roll. A roll of triple sixes grants maximum charms.",
        "range": 20,
        "duration": 30,
        "castTime": 0.8
      },
      {
        "name": "Bunraku",
        "energyCost": 100,
        "description": "Wield your foe's fate threads like the strings of marionettes. Koumei's dice determine how many Status Effects foes in front of Koumei will suffer. A roll of triple sixes causes enemies to become allies temporarily.",
        "damage": 400,
        "range": 30,
        "duration": 15,
        "radius": 15,
        "castTime": 1,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "kullervo",
    "name": "Kullervo",
    "health": 1005,
    "shield": 0,
    "armor": 550,
    "energy": 175,
    "sprintSpeed": 1.1,
    "description": "(TAP) Kullervo charges a Heavy Attack, then teleports to his target and strikes. His rage-filled focus temporarily increases his Melee Critical Chance. (HOLD) Teleport to any marked target.",
    "passive": "Kullervo boasts +|EFFICIENCY|% Heavy Attack Efficiency and +|WINDUP|% Heavy Attack Wind Up Speed on all melee weapons.",
    "abilities": [
      {
        "name": "Wrathful Advance",
        "energyCost": 25,
        "description": "(TAP) Kullervo charges a Heavy Attack, then teleports to his target and strikes. His rage-filled focus temporarily increases his Melee Critical Chance. (HOLD) Teleport to any marked target.",
        "damage": 500,
        "range": 40,
        "castTime": 0.5,
        "damageType": "Slash"
      },
      {
        "name": "Recompense",
        "energyCost": 50,
        "description": "Kullervo surrounds himself with daggers. Each dagger that strikes an enemy restores his health, but each dagger that misses an enemy strikes Kullervo, dealing a bit of damage. When below 35% health, dagger hits deal extra damage and provide extra healing.",
        "range": 15,
        "duration": 20,
        "radius": 10,
        "castTime": 0.6
      },
      {
        "name": "Collective Curse",
        "energyCost": 75,
        "description": "Kullervo sends forth a curse that binds enemies. When a cursed enemy takes damage from him, every other cursed enemy also suffers a portion of that damage.",
        "range": 30,
        "duration": 25,
        "radius": 15,
        "castTime": 0.5
      },
      {
        "name": "Storm Of Ukko",
        "energyCost": 100,
        "description": "The Void answers Kullervo's invocation with a storm of daggers that rain down upon his enemies.",
        "damage": 600,
        "range": 40,
        "duration": 10,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Void"
      }
    ]
  },
  {
    "id": "lavos",
    "name": "Lavos",
    "health": 540,
    "shield": 270,
    "armor": 575,
    "energy": 0,
    "sprintSpeed": 1.15,
    "description": "Lash out with a toxic serpentine strike, consuming the target to heal Lavos. Hold to imbue all abilities with Toxin.",
    "passive": "Energy and Universal Orbs give Lavos status immunity for |DURATION|s. Hold any ability to imbue the next cast with additional Elemental Damage and Status.",
    "abilities": [
      {
        "name": "Ophidian Bite",
        "energyCost": 0,
        "description": "Lash out with a toxic serpentine strike, consuming the target to heal Lavos. Hold to imbue all abilities with Toxin.",
        "damage": 400,
        "range": 15,
        "castTime": 0.5,
        "damageType": "Toxin"
      },
      {
        "name": "Vial Rush",
        "energyCost": 0,
        "description": "Dash forward, crashing through enemies and leaving an icy trail of broken vials. Hold to imbue the next ability cast with Cold.",
        "damage": 300,
        "range": 25,
        "castTime": 0.4,
        "damageType": "Cold"
      },
      {
        "name": "Transmutation Probe",
        "energyCost": 0,
        "description": "Launch a probe that converts Health and Energy Orbs into Universal Orbs that provide both, and ammo pickups into Universal Ammo Pickups. The probe shocks enemies in close proximity.",
        "damage": 200,
        "range": 30,
        "duration": 20,
        "radius": 8,
        "castTime": 0.6,
        "damageType": "Electricity"
      },
      {
        "name": "Catalyze",
        "energyCost": 0,
        "description": "Catalyst Probes erupt from Lavos and douse combatants in a fiery gel. Damage is doubled for each element afflicting an enemy. Hold to imbue the next ability cast with Heat.",
        "damage": 800,
        "range": 40,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Heat"
      }
    ]
  },
  {
    "id": "lavos_prime",
    "name": "Lavos Prime",
    "health": 600,
    "shield": 310,
    "armor": 575,
    "energy": 0,
    "sprintSpeed": 1.15,
    "description": "Lash out with a toxic serpentine strike, consuming the target to heal Lavos. Hold to imbue all abilities with Toxin.",
    "passive": "Energy and Universal Orbs give Lavos status immunity for |DURATION|s. Hold any ability to imbue the next cast with additional Elemental Damage and Status.",
    "abilities": [
      {
        "name": "Ophidian Bite",
        "energyCost": 0,
        "description": "Lash out with a toxic serpentine strike, consuming the target to heal Lavos. Hold to imbue all abilities with Toxin.",
        "damage": 400,
        "range": 15,
        "castTime": 0.5,
        "damageType": "Toxin"
      },
      {
        "name": "Vial Rush",
        "energyCost": 0,
        "description": "Dash forward, crashing through enemies and leaving an icy trail of broken vials. Hold to imbue the next ability cast with Cold.",
        "damage": 300,
        "range": 25,
        "castTime": 0.4,
        "damageType": "Cold"
      },
      {
        "name": "Transmutation Probe",
        "energyCost": 0,
        "description": "Launch a probe that converts Health and Energy Orbs into Universal Orbs that provide both, and ammo pickups into Universal Ammo Pickups. The probe shocks enemies in close proximity.",
        "damage": 200,
        "range": 30,
        "duration": 20,
        "radius": 8,
        "castTime": 0.6,
        "damageType": "Electricity"
      },
      {
        "name": "Catalyze",
        "energyCost": 0,
        "description": "Catalyst Probes erupt from Lavos and douse combatants in a fiery gel. Damage is doubled for each element afflicting an enemy. Hold to imbue the next ability cast with Heat.",
        "damage": 800,
        "range": 40,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Heat"
      }
    ]
  },
  {
    "id": "limbo",
    "name": "Limbo",
    "health": 270,
    "shield": 180,
    "armor": 105,
    "energy": 175,
    "sprintSpeed": 1.15,
    "description": "Casts a wave of Rift energy that damages hostiles while pushing enemies and allies out of Limbo's current plane of existence.",
    "passive": "Dodge to enter and exit the Rift. Entering leaves behind a small Rift portal lasting |DURATION|s. Energy slowly recharges in the Rift, and each enemy killed in there also gives |ENERGY| Energy.",
    "abilities": [
      {
        "name": "Banish",
        "energyCost": 25,
        "description": "Casts a wave of Rift energy that damages hostiles while pushing enemies and allies out of Limbo's current plane of existence.",
        "damage": 200,
        "range": 25,
        "castTime": 0.4,
        "damageType": "Void"
      },
      {
        "name": "Stasis",
        "energyCost": 50,
        "description": "Freezes Rift-bound enemies. While active, enemy projectiles are arrested in mid-air, resuming its trajectory when stasis ends.",
        "range": 30,
        "duration": 30,
        "radius": 25,
        "castTime": 0.5
      },
      {
        "name": "Rift Surge",
        "energyCost": 50,
        "description": "Surges nearby Rift-bound enemies with Rift energy. When killed the Rift Surge is transferred to a nearby enemy outside the rift. Surged enemies that leave the Rift perform a radial blast.",
        "range": 25,
        "duration": 40,
        "radius": 20,
        "castTime": 0.6
      },
      {
        "name": "Cataclysm",
        "energyCost": 100,
        "description": "A violent blast of Void energy tears open a pocket of rift plane which can sustain itself for a short period before collapsing in another lethal blast.",
        "damage": 500,
        "range": 30,
        "duration": 30,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Void"
      }
    ]
  },
  {
    "id": "limbo_prime",
    "name": "Limbo Prime",
    "health": 270,
    "shield": 270,
    "armor": 135,
    "energy": 215,
    "sprintSpeed": 1.15,
    "description": "Casts a wave of Rift energy that damages hostiles while pushing enemies and allies out of Limbo's current plane of existence.",
    "passive": "Dodge to enter and exit the Rift. Entering leaves behind a small Rift portal lasting |DURATION|s. Energy slowly recharges in the Rift, and each enemy killed in there also gives |ENERGY| Energy.",
    "abilities": [
      {
        "name": "Banish",
        "energyCost": 25,
        "description": "Casts a wave of Rift energy that damages hostiles while pushing enemies and allies out of Limbo's current plane of existence.",
        "damage": 200,
        "range": 25,
        "castTime": 0.4,
        "damageType": "Void"
      },
      {
        "name": "Stasis",
        "energyCost": 50,
        "description": "Freezes Rift-bound enemies. While active, enemy projectiles are arrested in mid-air, resuming its trajectory when stasis ends.",
        "range": 30,
        "duration": 30,
        "radius": 25,
        "castTime": 0.5
      },
      {
        "name": "Rift Surge",
        "energyCost": 50,
        "description": "Surges nearby Rift-bound enemies with Rift energy. When killed the Rift Surge is transferred to a nearby enemy outside the rift. Surged enemies that leave the Rift perform a radial blast.",
        "range": 25,
        "duration": 40,
        "radius": 20,
        "castTime": 0.6
      },
      {
        "name": "Cataclysm",
        "energyCost": 100,
        "description": "A violent blast of Void energy tears open a pocket of rift plane which can sustain itself for a short period before collapsing in another lethal blast.",
        "damage": 500,
        "range": 30,
        "duration": 30,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Void"
      }
    ]
  },
  {
    "id": "loki",
    "name": "Loki",
    "health": 180,
    "shield": 180,
    "armor": 105,
    "energy": 175,
    "sprintSpeed": 1.25,
    "description": "Loki deploys a holographic copy of himself that draws enemy fire and absorbs a portion of nearby enemy health and shields.",
    "passive": "Able to hang from walls |MULT|x longer than normal.",
    "abilities": [
      {
        "name": "Decoy",
        "energyCost": 25,
        "description": "Loki deploys a holographic copy of himself that draws enemy fire and absorbs a portion of nearby enemy health and shields.",
        "range": 20,
        "duration": 20,
        "castTime": 0.4
      },
      {
        "name": "Invisibility",
        "energyCost": 50,
        "description": "Loki camouflages himself, becoming invisible to enemies.",
        "range": 10,
        "duration": 30,
        "castTime": 0.5
      },
      {
        "name": "Switch Teleport",
        "energyCost": 25,
        "description": "Loki instantaneously swaps positions with a target, confusing the enemy.",
        "range": 40,
        "castTime": 0.3
      },
      {
        "name": "Radial Disarm",
        "energyCost": 100,
        "description": "Lets forth a wave of energy, disrupting the projectile weapons of enemies in range and forcing them to revert to melee combat.",
        "range": 25,
        "radius": 25,
        "castTime": 0.8
      }
    ]
  },
  {
    "id": "loki_prime",
    "name": "Loki Prime",
    "health": 180,
    "shield": 180,
    "armor": 135,
    "energy": 215,
    "sprintSpeed": 1.25,
    "description": "Loki deploys a holographic copy of himself that draws enemy fire and absorbs a portion of nearby enemy health and shields.",
    "passive": "Able to hang from walls |MULT|x longer than normal.",
    "abilities": [
      {
        "name": "Decoy",
        "energyCost": 25,
        "description": "Loki deploys a holographic copy of himself that draws enemy fire and absorbs a portion of nearby enemy health and shields.",
        "range": 20,
        "duration": 20,
        "castTime": 0.4
      },
      {
        "name": "Invisibility",
        "energyCost": 50,
        "description": "Loki camouflages himself, becoming invisible to enemies.",
        "range": 10,
        "duration": 30,
        "castTime": 0.5
      },
      {
        "name": "Switch Teleport",
        "energyCost": 25,
        "description": "Loki instantaneously swaps positions with a target, confusing the enemy.",
        "range": 40,
        "castTime": 0.3
      },
      {
        "name": "Radial Disarm",
        "energyCost": 100,
        "description": "Lets forth a wave of energy, disrupting the projectile weapons of enemies in range and forcing them to revert to melee combat.",
        "range": 25,
        "radius": 25,
        "castTime": 0.8
      }
    ]
  },
  {
    "id": "mag",
    "name": "Mag",
    "health": 180,
    "shield": 455,
    "armor": 105,
    "energy": 140,
    "sprintSpeed": 1,
    "description": "Mag stuns enemies as she manifests a magnetic vortex. The vortex pulls in Polarize Shards and stunned enemies to place them directly in front of her.",
    "passive": "Nearby items gravitate toward Mag for easy collection.",
    "abilities": [
      {
        "name": "Pull",
        "energyCost": 25,
        "description": "Mag stuns enemies as she manifests a magnetic vortex. The vortex pulls in Polarize Shards and stunned enemies to place them directly in front of her.",
        "damage": 300,
        "range": 25,
        "radius": 15,
        "castTime": 0.4,
        "damageType": "Magnetic"
      },
      {
        "name": "Magnetize",
        "energyCost": 50,
        "description": "(TAP) Enclose a target in a magnetic field that ensnares nearby enemies and deals damage over time. The field pulls Polarize Shards that orbited Mag and shrapnel into the deadly center. (HOLD) Detonate all active Magnetize bubbles.",
        "damage": 400,
        "range": 30,
        "duration": 20,
        "radius": 12,
        "castTime": 0.5,
        "damageType": "Magnetic"
      },
      {
        "name": "Polarize",
        "energyCost": 75,
        "description": "Emit an energy pulse that depletes enemy shields and armor as it restores ally shields. Debris left over from the pulse becomes Polarize Shards. Nearby Polarize Shards orbit Mag and act as ammunition for Magnetize.",
        "damage": 500,
        "range": 25,
        "radius": 20,
        "castTime": 0.6,
        "damageType": "Magnetic"
      },
      {
        "name": "Crush",
        "energyCost": 100,
        "description": "Magnetize the bones of nearby enemies, causing them to collapse upon themselves.",
        "damage": 800,
        "range": 20,
        "radius": 20,
        "castTime": 0.8,
        "damageType": "Magnetic"
      }
    ]
  },
  {
    "id": "mag_prime",
    "name": "Mag Prime",
    "health": 270,
    "shield": 455,
    "armor": 135,
    "energy": 215,
    "sprintSpeed": 1,
    "description": "Mag stuns enemies as she manifests a magnetic vortex. The vortex pulls in Polarize Shards and stunned enemies to place them directly in front of her.",
    "passive": "Nearby items gravitate toward Mag for easy collection.",
    "abilities": [
      {
        "name": "Pull",
        "energyCost": 25,
        "description": "Mag stuns enemies as she manifests a magnetic vortex. The vortex pulls in Polarize Shards and stunned enemies to place them directly in front of her.",
        "damage": 300,
        "range": 25,
        "radius": 15,
        "castTime": 0.4,
        "damageType": "Magnetic"
      },
      {
        "name": "Magnetize",
        "energyCost": 50,
        "description": "(TAP) Enclose a target in a magnetic field that ensnares nearby enemies and deals damage over time. The field pulls Polarize Shards that orbited Mag and shrapnel into the deadly center. (HOLD) Detonate all active Magnetize bubbles.",
        "damage": 400,
        "range": 30,
        "duration": 20,
        "radius": 12,
        "castTime": 0.5,
        "damageType": "Magnetic"
      },
      {
        "name": "Polarize",
        "energyCost": 75,
        "description": "Emit an energy pulse that depletes enemy shields and armor as it restores ally shields. Debris left over from the pulse becomes Polarize Shards. Nearby Polarize Shards orbit Mag and act as ammunition for Magnetize.",
        "damage": 500,
        "range": 25,
        "radius": 20,
        "castTime": 0.6,
        "damageType": "Magnetic"
      },
      {
        "name": "Crush",
        "energyCost": 100,
        "description": "Magnetize the bones of nearby enemies, causing them to collapse upon themselves.",
        "damage": 800,
        "range": 20,
        "radius": 20,
        "castTime": 0.8,
        "damageType": "Magnetic"
      }
    ]
  },
  {
    "id": "mesa",
    "name": "Mesa",
    "health": 365,
    "shield": 180,
    "armor": 105,
    "energy": 100,
    "sprintSpeed": 1.1,
    "description": "When activated, this power stores damage caused by guns. When triggered again, that damage is channelled through the next gunshot.",
    "passive": "Shoot dual-wielded sidearms |SPEED|% faster and reload single-handed sidearms |RELOAD|% more rapidly. Gain |HEALTH| Bonus Health when not using Melee Weapons.",
    "abilities": [
      {
        "name": "Ballistic Battery",
        "energyCost": 25,
        "description": "When activated, this power stores damage caused by guns. When triggered again, that damage is channelled through the next gunshot.",
        "range": 20,
        "castTime": 0.4
      },
      {
        "name": "Shooting Gallery",
        "energyCost": 50,
        "description": "Gives an ally Extra Damage while jamming the guns of nearby enemies. This power shifts between team members.",
        "damageBuff": 0.25,
        "range": 16,
        "duration": 30,
        "radius": 16,
        "castTime": 0.5
      },
      {
        "name": "Shatter Shield",
        "energyCost": 75,
        "description": "Envelops Mesa in a barrier of energy, reflecting back incoming bullet damage.",
        "damageReduction": 0.8,
        "range": 11,
        "duration": 25,
        "radius": 11,
        "castTime": 0.6,
        "miscStats": { "drCap": 0.95 }
      },
      {
        "name": "Peacemaker",
        "energyCost": 25,
        "description": "With intense focus, Mesa draws her Regulator pistols, shooting down her foes in rapid succession.",
        "damage": 50,
        "range": 50,
        "castTime": 0.5,
        "damageType": "Puncture",
        "miscStats": { "energyDrain": 15, "damageBonus": 1.5 }
      }
    ]
  },
  {
    "id": "mesa_prime",
    "name": "Mesa Prime",
    "health": 400,
    "shield": 180,
    "armor": 135,
    "energy": 140,
    "sprintSpeed": 1.1,
    "description": "When activated, this power stores damage caused by guns. When triggered again, that damage is channelled through the next gunshot.",
    "passive": "Shoot dual-wielded sidearms |SPEED|% faster and reload single-handed sidearms |RELOAD|% more rapidly. Gain |HEALTH| Bonus Health when not using Melee Weapons.",
    "abilities": [
      {
        "name": "Ballistic Battery",
        "energyCost": 25,
        "description": "When activated, this power stores damage caused by guns. When triggered again, that damage is channelled through the next gunshot.",
        "range": 20,
        "castTime": 0.4
      },
      {
        "name": "Shooting Gallery",
        "energyCost": 50,
        "description": "Gives an ally Extra Damage while jamming the guns of nearby enemies. This power shifts between team members.",
        "damageBuff": 0.25,
        "range": 16,
        "duration": 30,
        "radius": 16,
        "castTime": 0.5
      },
      {
        "name": "Shatter Shield",
        "energyCost": 75,
        "description": "Envelops Mesa in a barrier of energy, reflecting back incoming bullet damage.",
        "damageReduction": 0.8,
        "range": 11,
        "duration": 25,
        "radius": 11,
        "castTime": 0.6,
        "miscStats": { "drCap": 0.95 }
      },
      {
        "name": "Peacemaker",
        "energyCost": 25,
        "description": "With intense focus, Mesa draws her Regulator pistols, shooting down her foes in rapid succession.",
        "damage": 50,
        "range": 50,
        "castTime": 0.5,
        "damageType": "Puncture",
        "miscStats": { "energyDrain": 15, "damageBonus": 1.5 }
      }
    ]
  },
  {
    "id": "mirage",
    "name": "Mirage",
    "health": 200,
    "shield": 200,
    "armor": 105,
    "energy": 175,
    "sprintSpeed": 1.2,
    "description": "Mirage creates an entourage of doppelgangers to confuse and distract the enemy.",
    "passive": "Sliding lasts |DURATION|% longer and acrobatic maneuvers are |SPEED|% faster.",
    "abilities": [
      {
        "name": "Hall Of Mirrors",
        "energyCost": 25,
        "description": "Mirage creates an entourage of doppelgangers to confuse and distract the enemy.",
        "range": 15,
        "duration": 20,
        "castTime": 0.6
      },
      {
        "name": "Sleight Of Hand",
        "energyCost": 50,
        "description": "Booby trap nearby objects while conjuring an irresistible jewel that bursts with radial blind when touched in darkness, or a radial explosion in light. Conjure multiple smaller jewels by charging the ability.",
        "damage": 500,
        "range": 20,
        "duration": 15,
        "radius": 15,
        "castTime": 0.5,
        "damageType": "Radiation"
      },
      {
        "name": "Eclipse",
        "energyCost": 25,
        "description": "(TAP) Lunar Eclipse: Reduce incoming damage by 75% (cap 90%). (HOLD) Solar Eclipse: +200% weapon damage.",
        "damageBuff": 2.0,
        "damageReduction": 0.75,
        "range": 20,
        "duration": 30,
        "castTime": 0.4
      },
      {
        "name": "Prism",
        "energyCost": 50,
        "description": "Fires an energy prism that shoots lasers in all directions. Activating again detonates the prism, blinding nearby foes.",
        "damage": 250,
        "range": 30,
        "duration": 15,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Radiation"
      }
    ]
  },
  {
    "id": "mirage_prime",
    "name": "Mirage Prime",
    "health": 200,
    "shield": 310,
    "armor": 185,
    "energy": 175,
    "sprintSpeed": 1.2,
    "description": "Mirage creates an entourage of doppelgangers to confuse and distract the enemy.",
    "passive": "Sliding lasts |DURATION|% longer and acrobatic maneuvers are |SPEED|% faster.",
    "abilities": [
      {
        "name": "Hall Of Mirrors",
        "energyCost": 25,
        "description": "Mirage creates an entourage of doppelgangers to confuse and distract the enemy.",
        "range": 15,
        "duration": 20,
        "castTime": 0.6
      },
      {
        "name": "Sleight Of Hand",
        "energyCost": 50,
        "description": "Booby trap nearby objects while conjuring an irresistible jewel that bursts with radial blind when touched in darkness, or a radial explosion in light. Conjure multiple smaller jewels by charging the ability.",
        "damage": 500,
        "range": 20,
        "duration": 15,
        "radius": 15,
        "castTime": 0.5,
        "damageType": "Radiation"
      },
      {
        "name": "Eclipse",
        "energyCost": 25,
        "description": "(TAP) Lunar Eclipse: Reduce incoming damage by 75% (cap 90%). (HOLD) Solar Eclipse: +200% weapon damage.",
        "damageBuff": 2.0,
        "damageReduction": 0.75,
        "range": 20,
        "duration": 30,
        "castTime": 0.4
      },
      {
        "name": "Prism",
        "energyCost": 50,
        "description": "Fires an energy prism that shoots lasers in all directions. Activating again detonates the prism, blinding nearby foes.",
        "damage": 250,
        "range": 30,
        "duration": 15,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Radiation"
      }
    ]
  },
  {
    "id": "nekros",
    "name": "Nekros",
    "health": 270,
    "shield": 235,
    "armor": 105,
    "energy": 100,
    "sprintSpeed": 1.1,
    "description": "A blow so powerful, it turns the enemy's very soul into a deadly projectile, damaging all in its path. Enemies that survive the blow are Marked for Harvest and become one of Nekros's shadows if killed.",
    "passive": "Restore |HEALTH| Health with every enemy death within |RADIUS|m.",
    "abilities": [
      {
        "name": "Soul Punch",
        "energyCost": 25,
        "description": "A blow so powerful, it turns the enemy's very soul into a deadly projectile, damaging all in its path. Enemies that survive the blow are Marked for Harvest and become one of Nekros's shadows if killed.",
        "damage": 500,
        "range": 50,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Terrify",
        "energyCost": 75,
        "description": "Cast fear into the hearts of nearby enemies, causing them to run away in terror and stripping their armor.",
        "range": 25,
        "duration": 15,
        "radius": 20,
        "castTime": 0.6
      },
      {
        "name": "Desecrate",
        "energyCost": 10,
        "description": "Forces fallen enemies around you to drop additional loot.",
        "range": 15,
        "radius": 15,
        "castTime": 0.4
      },
      {
        "name": "Shadows Of The Dead",
        "energyCost": 100,
        "description": "Summon shadow versions of vanquished enemies to fight alongside you for a short period.",
        "range": 25,
        "duration": 25,
        "castTime": 1
      }
    ]
  },
  {
    "id": "nekros_prime",
    "name": "Nekros Prime",
    "health": 270,
    "shield": 455,
    "armor": 135,
    "energy": 140,
    "sprintSpeed": 1.1,
    "description": "A blow so powerful, it turns the enemy's very soul into a deadly projectile, damaging all in its path. Enemies that survive the blow are Marked for Harvest and become one of Nekros's shadows if killed.",
    "passive": "Restore |HEALTH| Health with every enemy death within |RADIUS|m.",
    "abilities": [
      {
        "name": "Soul Punch",
        "energyCost": 25,
        "description": "A blow so powerful, it turns the enemy's very soul into a deadly projectile, damaging all in its path. Enemies that survive the blow are Marked for Harvest and become one of Nekros's shadows if killed.",
        "damage": 500,
        "range": 50,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Terrify",
        "energyCost": 75,
        "description": "Cast fear into the hearts of nearby enemies, causing them to run away in terror and stripping their armor.",
        "range": 25,
        "duration": 15,
        "radius": 20,
        "castTime": 0.6
      },
      {
        "name": "Desecrate",
        "energyCost": 10,
        "description": "Forces fallen enemies around you to drop additional loot.",
        "range": 15,
        "radius": 15,
        "castTime": 0.4
      },
      {
        "name": "Shadows Of The Dead",
        "energyCost": 100,
        "description": "Summon shadow versions of vanquished enemies to fight alongside you for a short period.",
        "range": 25,
        "duration": 25,
        "castTime": 1
      }
    ]
  },
  {
    "id": "nezha",
    "name": "Nezha",
    "health": 365,
    "shield": 135,
    "armor": 200,
    "energy": 175,
    "sprintSpeed": 1.15,
    "description": "Blaze a trail of flames, scorching enemies and cleansing allies. Teleporting blasts the landing area with a ring of fire.",
    "passive": "Slide |SPEED|% faster and go |RANGE|% farther.",
    "abilities": [
      {
        "name": "Fire Walker",
        "energyCost": 25,
        "description": "Blaze a trail of flames, scorching enemies and cleansing allies. Teleporting blasts the landing area with a ring of fire.",
        "damage": 250,
        "range": 20,
        "duration": 25,
        "castTime": 0.4,
        "damageType": "Heat"
      },
      {
        "name": "Blazing Chakram",
        "energyCost": 25,
        "description": "Hurl a flaming ring that sets enemies ablaze making them vulnerable to any damage. Flaming enemies drop Restorative Orbs on death. Charge to amplify the power of the ring, and reactivate to teleport to the ring.",
        "damage": 350,
        "range": 50,
        "castTime": 0.5,
        "damageType": "Heat"
      },
      {
        "name": "Warding Halo",
        "energyCost": 75,
        "description": "Create a protective ring of fire, that also stuns and damages enemies who get too close.",
        "damage": 500,
        "range": 5,
        "radius": 3,
        "castTime": 0.6,
        "damageType": "Heat"
      },
      {
        "name": "Divine Spears",
        "energyCost": 100,
        "description": "Impale nearby enemies on spears that erupt from the below. Activate again to slam surviving enemies back into the ground.",
        "damage": 400,
        "range": 25,
        "duration": 10,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Puncture"
      }
    ]
  },
  {
    "id": "nezha_prime",
    "name": "Nezha Prime",
    "health": 365,
    "shield": 135,
    "armor": 265,
    "energy": 175,
    "sprintSpeed": 1.2,
    "description": "Blaze a trail of flames, scorching enemies and cleansing allies. Teleporting blasts the landing area with a ring of fire.",
    "passive": "Slide |SPEED|% faster and go |RANGE|% farther.",
    "abilities": [
      {
        "name": "Fire Walker",
        "energyCost": 25,
        "description": "Blaze a trail of flames, scorching enemies and cleansing allies. Teleporting blasts the landing area with a ring of fire.",
        "damage": 250,
        "range": 20,
        "duration": 25,
        "castTime": 0.4,
        "damageType": "Heat"
      },
      {
        "name": "Blazing Chakram",
        "energyCost": 25,
        "description": "Hurl a flaming ring that sets enemies ablaze making them vulnerable to any damage. Flaming enemies drop Restorative Orbs on death. Charge to amplify the power of the ring, and reactivate to teleport to the ring.",
        "damage": 350,
        "range": 50,
        "castTime": 0.5,
        "damageType": "Heat"
      },
      {
        "name": "Warding Halo",
        "energyCost": 75,
        "description": "Create a protective ring of fire, that also stuns and damages enemies who get too close.",
        "damage": 500,
        "range": 5,
        "radius": 3,
        "castTime": 0.6,
        "damageType": "Heat"
      },
      {
        "name": "Divine Spears",
        "energyCost": 100,
        "description": "Impale nearby enemies on spears that erupt from the below. Activate again to slam surviving enemies back into the ground.",
        "damage": 400,
        "range": 25,
        "duration": 10,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Puncture"
      }
    ]
  },
  {
    "id": "nidus",
    "name": "Nidus",
    "health": 675,
    "shield": 0,
    "armor": 350,
    "energy": 100,
    "sprintSpeed": 1,
    "description": "Command the Infestation with Mutation Stacks that fuel his abilities. Virulence ruptures the ground with fungal growth; Larva, Parasitic Link, and Ravenous build and spend stacks for crowd control and healing.",
    "passive": "If Nidus is killed with at least 15 stacks of Mutation, those stacks are consumed; this grants 5s of invulnerability and restores Health to 50%. Mutation stacks cap at 200.",
    "abilities": [
      {
        "name": "Virulence",
        "energyCost": 40,
        "description": "Rupture the ground with a damaging fungal growth that steals energy from each enemy it strikes. Initial hits and damage over time both build Mutation Stacks.",
        "damage": 200,
        "duration": 5,
        "range": 16,
        "radius": 4,
        "castTime": 0.4,
        "damageType": "Corrosive",
        "miscStats": { "energyRefundPerHit": 10, "width": "4m" }
      },
      {
        "name": "Larva",
        "energyCost": 25,
        "description": "Spawn an Infested pod that erupts with tendrils, latches onto nearby enemies and pulls them in. Recasting removes the previous Larva. Enemies killed while held can generate Mutation stacks; chance scales with Ability Strength up to 100%.",
        "duration": 7,
        "radius": 12,
        "castTime": 0.6,
        "miscStats": { "mutationStackChance": "50% (100% at 200% Str)" }
      },
      {
        "name": "Parasitic Link",
        "energyCost": 25,
        "description": "Bind to a target with parasitic link. When cast on an ally or Companion, both receive Ability Strength and weapon damage bonuses. Linked enemies redirect damage to themselves. Recast to retarget or refresh duration.",
        "range": 40,
        "duration": 60,
        "castTime": 0.4,
        "damageBuff": 0.25,
        "damageReduction": 0.5,
        "miscStats": { "strengthBonus": "25%", "enemyLinkRange": 20 }
      },
      {
        "name": "Ravenous",
        "energyCost": 0,
        "description": "Expend 3 Mutation stacks to spawn gluttonous maggots and an infestation zone. Allies inside regenerate health and are cleansed of status effects. Recasting on the zone refreshes duration and detonates maggots.",
        "damage": 150,
        "duration": 40,
        "radius": 8,
        "castTime": 0.8,
        "damageType": "Corrosive",
        "miscStats": { "mutationStackCost": 3, "healthRegen": "75/s", "explosionRadius": 4, "maggots": 9, "statusCleanse": true }
      }
    ]
  },
  {
    "id": "nidus_prime",
    "name": "Nidus Prime",
    "health": 825,
    "shield": 0,
    "armor": 425,
    "energy": 140,
    "sprintSpeed": 1,
    "description": "Command the Infestation with Mutation Stacks that fuel his abilities. Virulence ruptures the ground with fungal growth; Larva, Parasitic Link, and Ravenous build and spend stacks for crowd control and healing.",
    "passive": "If Nidus is killed with at least 15 stacks of Mutation, those stacks are consumed; this grants 5s of invulnerability and restores Health to 50%. Mutation stacks cap at 200.",
    "abilities": [
      {
        "name": "Virulence",
        "energyCost": 40,
        "description": "Rupture the ground with a damaging fungal growth that steals energy from each enemy it strikes. Initial hits and damage over time both build Mutation Stacks.",
        "damage": 200,
        "duration": 5,
        "range": 16,
        "radius": 4,
        "castTime": 0.4,
        "damageType": "Corrosive",
        "miscStats": { "energyRefundPerHit": 10, "width": "4m" }
      },
      {
        "name": "Larva",
        "energyCost": 25,
        "description": "Spawn an Infested pod that erupts with tendrils, latches onto nearby enemies and pulls them in. Recasting removes the previous Larva. Enemies killed while held can generate Mutation stacks; chance scales with Ability Strength up to 100%.",
        "duration": 7,
        "radius": 12,
        "castTime": 0.6,
        "miscStats": { "mutationStackChance": "50% (100% at 200% Str)" }
      },
      {
        "name": "Parasitic Link",
        "energyCost": 25,
        "description": "Bind to a target with parasitic link. When cast on an ally or Companion, both receive Ability Strength and weapon damage bonuses. Linked enemies redirect damage to themselves. Recast to retarget or refresh duration.",
        "range": 40,
        "duration": 60,
        "castTime": 0.4,
        "damageBuff": 0.25,
        "damageReduction": 0.5,
        "miscStats": { "strengthBonus": "25%", "enemyLinkRange": 20 }
      },
      {
        "name": "Ravenous",
        "energyCost": 0,
        "description": "Expend 3 Mutation stacks to spawn gluttonous maggots and an infestation zone. Allies inside regenerate health and are cleansed of status effects. Recasting on the zone refreshes duration and detonates maggots.",
        "damage": 150,
        "duration": 40,
        "radius": 8,
        "castTime": 0.8,
        "damageType": "Corrosive",
        "miscStats": { "mutationStackCost": 3, "healthRegen": "75/s", "explosionRadius": 4, "maggots": 9, "statusCleanse": true }
      }
    ]
  },
  {
    "id": "nokko",
    "name": "Nokko",
    "health": 150,
    "shield": 300,
    "armor": 135,
    "energy": 130,
    "sprintSpeed": 1.25,
    "description": "Throw a mushroom that periodically sheds poisonous spores, inflicting Viral Damage and Status Effect upon nearby enemies while also lulling them to sleep.",
    "passive": "Upon receiving fatal damage, Nokko reverts to his Sprodling form and his active mushrooms will glow, reviving Nokko when touched. Orbs spawned will grant a speed boost but not healing. If a glowing mushroom is not reached in time, Nokko will automatically use a self-revive.",
    "abilities": [
      {
        "name": "Stinkbrain",
        "energyCost": 25,
        "description": "Throw a mushroom that periodically sheds poisonous spores, inflicting Viral Damage and Status Effect upon nearby enemies while also lulling them to sleep.",
        "damage": 200,
        "range": 25,
        "duration": 15,
        "radius": 12,
        "castTime": 0.4,
        "damageType": "Viral"
      },
      {
        "name": "Brightbonnet",
        "energyCost": 50,
        "description": "Release a rejuvenating mushroom that emits a radial pulse, giving Nokko and his allies Energy and applying a buff to Ability Strength that lasts for a short time.",
        "range": 20,
        "duration": 20,
        "radius": 15,
        "castTime": 0.5
      },
      {
        "name": "Reroot",
        "energyCost": 25,
        "description": "Revert to Sprodling form, spawning orbs that heal Nokko and grant a speed boost. While in this state, Nokko is untargetable and heals gradually.",
        "range": 10,
        "duration": 10,
        "castTime": 0.3
      },
      {
        "name": "Sporespring",
        "energyCost": 100,
        "description": "Unleash a chaotic ballistic mushroom that seeks enemies and bounces explosively off whatever it touches. Contact with any of Nokko's mushrooms invigorates them, doubling their potency.",
        "damage": 600,
        "range": 40,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Blast"
      }
    ]
  },
  {
    "id": "nova",
    "name": "Nova",
    "health": 270,
    "shield": 180,
    "armor": 105,
    "energy": 175,
    "sprintSpeed": 1.2,
    "description": "Creates antimatter particles that orbit Nova and attack nearby targets. Each active particle reduces damage to Nova's Health and Shields.",
    "passive": "Enemies killed while slowed down have |CHANCE|% to drop health orbs. Enemies killed while sped up have |CHANCE|% to drop energy orbs.",
    "abilities": [
      {
        "name": "Null Star",
        "energyCost": 25,
        "description": "Creates antimatter particles that orbit Nova and attack nearby targets. Each active particle reduces damage to Nova's Health and Shields.",
        "damage": 150,
        "range": 20,
        "castTime": 0.4,
        "damageType": "Radiation"
      },
      {
        "name": "Antimatter Drop",
        "energyCost": 50,
        "description": "Launch a large particle of charged antimatter that will detonate on contact. Direct the particle by aiming, shoot it to charge it further.",
        "damage": 400,
        "range": 60,
        "radius": 15,
        "castTime": 0.5,
        "damageType": "Blast"
      },
      {
        "name": "Wormhole",
        "energyCost": 75,
        "description": "Creates a wormhole allowing instantaneous travel. Hold the ability to visualize placement.",
        "range": 50,
        "duration": 20,
        "castTime": 0.3
      },
      {
        "name": "Molecular Prime",
        "energyCost": 100,
        "description": "Primes all enemies in an expanding radius with volatile antimatter. Press the ability to slow down enemy movement, hold the ability to speed them up.",
        "damage": 800,
        "range": 35,
        "duration": 15,
        "radius": 35,
        "castTime": 0.8,
        "damageType": "Blast"
      }
    ]
  },
  {
    "id": "nova_prime",
    "name": "Nova Prime",
    "health": 270,
    "shield": 270,
    "armor": 135,
    "energy": 215,
    "sprintSpeed": 1.2,
    "description": "Creates antimatter particles that orbit Nova and attack nearby targets. Each active particle reduces damage to Nova's Health and Shields.",
    "passive": "Enemies killed while slowed down have |CHANCE|% to drop health orbs. Enemies killed while sped up have |CHANCE|% to drop energy orbs.",
    "abilities": [
      {
        "name": "Null Star",
        "energyCost": 25,
        "description": "Creates antimatter particles that orbit Nova and attack nearby targets. Each active particle reduces damage to Nova's Health and Shields.",
        "damage": 150,
        "range": 20,
        "castTime": 0.4,
        "damageType": "Radiation"
      },
      {
        "name": "Antimatter Drop",
        "energyCost": 50,
        "description": "Launch a large particle of charged antimatter that will detonate on contact. Direct the particle by aiming, shoot it to charge it further.",
        "damage": 400,
        "range": 60,
        "radius": 15,
        "castTime": 0.5,
        "damageType": "Blast"
      },
      {
        "name": "Wormhole",
        "energyCost": 75,
        "description": "Creates a wormhole allowing instantaneous travel. Hold the ability to visualize placement.",
        "range": 50,
        "duration": 20,
        "castTime": 0.3
      },
      {
        "name": "Molecular Prime",
        "energyCost": 100,
        "description": "Primes all enemies in an expanding radius with volatile antimatter. Press the ability to slow down enemy movement, hold the ability to speed them up.",
        "damage": 800,
        "range": 35,
        "duration": 15,
        "radius": 35,
        "castTime": 0.8,
        "damageType": "Blast"
      }
    ]
  },
  {
    "id": "nyx",
    "name": "Nyx",
    "health": 270,
    "shield": 270,
    "armor": 105,
    "energy": 175,
    "sprintSpeed": 1.1,
    "description": "Nyx seizes control of a target's mind, compelling them to fight for the Tenno cause. Controlled enemies have increased Radiation Status Chance. When Nyx shoots the controlled enemy, a percentage of that damage is transferred to the target.",
    "passive": "Nyx gains +|CRITICAL|% Critical Chance on Primary and Secondary weapons per Confused enemy within Affinity Range, up to +|MAX|%.",
    "abilities": [
      {
        "name": "Mind Control",
        "energyCost": 25,
        "description": "Nyx seizes control of a target's mind, compelling them to fight for the Tenno cause. Controlled enemies have increased Radiation Status Chance. When Nyx shoots the controlled enemy, a percentage of that damage is transferred to the target.",
        "range": 50,
        "duration": 30,
        "castTime": 0.5
      },
      {
        "name": "Psychic Bolts",
        "energyCost": 50,
        "description": "Nyx unleashes a volley of psychic bolts that track and strike nearby enemies with telekinetic precision. When enemies are slain, additional bolts scatter to new targets. Striking an enemy with a bolt temporarily removes their defenses.",
        "damage": 200,
        "range": 60,
        "castTime": 0.4,
        "damageType": "Puncture"
      },
      {
        "name": "Chaos",
        "energyCost": 75,
        "description": "Nyx releases a devastating psychic pulse, disorienting enemies in a wide radius and forcing them to turn on each other. Confused foes lash out at random factions.",
        "range": 25,
        "duration": 25,
        "radius": 25,
        "castTime": 0.6
      },
      {
        "name": "Absorb",
        "energyCost": 25,
        "description": "Nyx draws in and contains the damage dealt to her and the damage confused enemies deal to each other then converts it into a devastating radial blast. Following the blast, she expels an aura that grants her and nearby allies incoming damage reduction.",
        "damage": 1000,
        "range": 20,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Magnetic"
      }
    ]
  },
  {
    "id": "nyx_prime",
    "name": "Nyx Prime",
    "health": 270,
    "shield": 365,
    "armor": 135,
    "energy": 175,
    "sprintSpeed": 1.125,
    "description": "Nyx seizes control of a target's mind, compelling them to fight for the Tenno cause. Controlled enemies have increased Radiation Status Chance. When Nyx shoots the controlled enemy, a percentage of that damage is transferred to the target.",
    "passive": "Nyx gains +|CRITICAL|% Critical Chance on Primary and Secondary weapons per Confused enemy within Affinity Range, up to +|MAX|%.",
    "abilities": [
      {
        "name": "Mind Control",
        "energyCost": 25,
        "description": "Nyx seizes control of a target's mind, compelling them to fight for the Tenno cause. Controlled enemies have increased Radiation Status Chance. When Nyx shoots the controlled enemy, a percentage of that damage is transferred to the target.",
        "range": 50,
        "duration": 30,
        "castTime": 0.5
      },
      {
        "name": "Psychic Bolts",
        "energyCost": 50,
        "description": "Nyx unleashes a volley of psychic bolts that track and strike nearby enemies with telekinetic precision. When enemies are slain, additional bolts scatter to new targets. Striking an enemy with a bolt temporarily removes their defenses.",
        "damage": 200,
        "range": 60,
        "castTime": 0.4,
        "damageType": "Puncture"
      },
      {
        "name": "Chaos",
        "energyCost": 75,
        "description": "Nyx releases a devastating psychic pulse, disorienting enemies in a wide radius and forcing them to turn on each other. Confused foes lash out at random factions.",
        "range": 25,
        "duration": 25,
        "radius": 25,
        "castTime": 0.6
      },
      {
        "name": "Absorb",
        "energyCost": 25,
        "description": "Nyx draws in and contains the damage dealt to her and the damage confused enemies deal to each other then converts it into a devastating radial blast. Following the blast, she expels an aura that grants her and nearby allies incoming damage reduction.",
        "damage": 1000,
        "range": 20,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Magnetic"
      }
    ]
  },
  {
    "id": "oberon",
    "name": "Oberon",
    "health": 365,
    "shield": 270,
    "armor": 385,
    "energy": 175,
    "sprintSpeed": 1,
    "description": "Focuses deadly energy within a target, dealing massive damage and removing all of its defenses, including Overguard. Enemies near the target also take a portion of the damage.",
    "passive": "Oberon grants Righteous Negation to himself and his allies in Affinity Range when he collects Health Orbs, protecting players against the next instance of damage. Stacks up to |STACKS| times.",
    "abilities": [
      {
        "name": "Smite",
        "energyCost": 25,
        "description": "Focuses deadly energy within a target, dealing massive damage and removing all of its defenses, including Overguard. Enemies near the target also take a portion of the damage.",
        "damage": 500,
        "range": 40,
        "radius": 15,
        "castTime": 0.4,
        "damageType": "Radiation"
      },
      {
        "name": "Hallowed Ground",
        "energyCost": 50,
        "description": "Sanctifies the ground around Oberon, inflicting Radiation Damage to all enemies within the radius. Also grants protection against Status Effects for Oberon and his allies.",
        "damage": 250,
        "range": 15,
        "duration": 20,
        "radius": 15,
        "castTime": 0.6,
        "damageType": "Radiation"
      },
      {
        "name": "Renewal",
        "energyCost": 75,
        "description": "Generates a protective aura that grants bonus Armor to Oberon and his allies and restores allies Health over time. Healing is doubled while within the radius of Hallowed Ground.",
        "range": 25,
        "duration": 25,
        "radius": 25,
        "castTime": 0.5
      },
      {
        "name": "Reckoning",
        "energyCost": 100,
        "description": "Lifts enemies into the air and then hurls them down with conviction, removing their Armor. Enemies hit by this ability will grant Oberon additional Armor and have a chance to spawn Health Orbs.",
        "damage": 800,
        "range": 25,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Radiation"
      }
    ]
  },
  {
    "id": "oberon_prime",
    "name": "Oberon Prime",
    "health": 365,
    "shield": 270,
    "armor": 450,
    "energy": 215,
    "sprintSpeed": 1,
    "description": "Focuses deadly energy within a target, dealing massive damage and removing all of its defenses, including Overguard. Enemies near the target also take a portion of the damage.",
    "passive": "Oberon grants Righteous Negation to himself and his allies in Affinity Range when he collects Health Orbs, protecting players against the next instance of damage. Stacks up to |STACKS| times.",
    "abilities": [
      {
        "name": "Smite",
        "energyCost": 25,
        "description": "Focuses deadly energy within a target, dealing massive damage and removing all of its defenses, including Overguard. Enemies near the target also take a portion of the damage.",
        "damage": 500,
        "range": 40,
        "radius": 15,
        "castTime": 0.4,
        "damageType": "Radiation"
      },
      {
        "name": "Hallowed Ground",
        "energyCost": 50,
        "description": "Sanctifies the ground around Oberon, inflicting Radiation Damage to all enemies within the radius. Also grants protection against Status Effects for Oberon and his allies.",
        "damage": 250,
        "range": 15,
        "duration": 20,
        "radius": 15,
        "castTime": 0.6,
        "damageType": "Radiation"
      },
      {
        "name": "Renewal",
        "energyCost": 75,
        "description": "Generates a protective aura that grants bonus Armor to Oberon and his allies and restores allies Health over time. Healing is doubled while within the radius of Hallowed Ground.",
        "range": 25,
        "duration": 25,
        "radius": 25,
        "castTime": 0.5
      },
      {
        "name": "Reckoning",
        "energyCost": 100,
        "description": "Lifts enemies into the air and then hurls them down with conviction, removing their Armor. Enemies hit by this ability will grant Oberon additional Armor and have a chance to spawn Health Orbs.",
        "damage": 800,
        "range": 25,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Radiation"
      }
    ]
  },
  {
    "id": "octavia",
    "name": "Octavia",
    "health": 270,
    "shield": 180,
    "armor": 160,
    "energy": 175,
    "sprintSpeed": 1.05,
    "description": "Rhythmically beats damage into nearby enemies and draws their fire. Damage inflicted on the Mallet increases its lethality.",
    "passive": "Replenish |ENERGY| energy over |DURATION|s for Octavia and allies within |RANGE|m when abilities are activated.",
    "abilities": [
      {
        "name": "Mallet",
        "energyCost": 25,
        "description": "Rhythmically beats damage into nearby enemies and draws their fire. Damage inflicted on the Mallet increases its lethality.",
        "damage": 150,
        "range": 15,
        "duration": 20,
        "radius": 10,
        "castTime": 0.5,
        "damageType": "Blast"
      },
      {
        "name": "Resonator",
        "energyCost": 50,
        "description": "Launches a rollerball that charms foes to follow it. Combines with the Mallet to create a roving ball of sonic destruction.",
        "damage": 100,
        "range": 20,
        "duration": 25,
        "radius": 8,
        "castTime": 0.5,
        "damageType": "Blast"
      },
      {
        "name": "Metronome",
        "energyCost": 75,
        "description": "Grants buffs to those who consistently perform actions in time to Octavia's music. Timed jumps offer the Vivace speed buff. Crouching on the beat grants cloaking with the Nocturne buff. Firing on beat grants the Opera buff for multishot. Melee on beat grants the Forte buff for melee damage.",
        "range": 20,
        "duration": 30,
        "radius": 20,
        "castTime": 0.6
      },
      {
        "name": "Amp",
        "energyCost": 100,
        "description": "Draws power from the decibel level of sound in the area and uses it to amplify a damage buff for Octavia and her allies. It also doubles the damage and range of nearby Mallets.",
        "range": 25,
        "duration": 30,
        "radius": 25,
        "castTime": 0.8
      }
    ]
  },
  {
    "id": "octavia_prime",
    "name": "Octavia Prime",
    "health": 270,
    "shield": 270,
    "armor": 160,
    "energy": 215,
    "sprintSpeed": 1.05,
    "description": "Rhythmically beats damage into nearby enemies and draws their fire. Damage inflicted on the Mallet increases its lethality.",
    "passive": "Replenish |ENERGY| energy over |DURATION|s for Octavia and allies within |RANGE|m when abilities are activated.",
    "abilities": [
      {
        "name": "Mallet",
        "energyCost": 25,
        "description": "Rhythmically beats damage into nearby enemies and draws their fire. Damage inflicted on the Mallet increases its lethality.",
        "damage": 150,
        "range": 15,
        "duration": 20,
        "radius": 10,
        "castTime": 0.5,
        "damageType": "Blast"
      },
      {
        "name": "Resonator",
        "energyCost": 50,
        "description": "Launches a rollerball that charms foes to follow it. Combines with the Mallet to create a roving ball of sonic destruction.",
        "damage": 100,
        "range": 20,
        "duration": 25,
        "radius": 8,
        "castTime": 0.5,
        "damageType": "Blast"
      },
      {
        "name": "Metronome",
        "energyCost": 75,
        "description": "Grants buffs to those who consistently perform actions in time to Octavia's music. Timed jumps offer the Vivace speed buff. Crouching on the beat grants cloaking with the Nocturne buff. Firing on beat grants the Opera buff for multishot. Melee on beat grants the Forte buff for melee damage.",
        "range": 20,
        "duration": 30,
        "radius": 20,
        "castTime": 0.6
      },
      {
        "name": "Amp",
        "energyCost": 100,
        "description": "Draws power from the decibel level of sound in the area and uses it to amplify a damage buff for Octavia and her allies. It also doubles the damage and range of nearby Mallets.",
        "range": 25,
        "duration": 30,
        "radius": 25,
        "castTime": 0.8
      }
    ]
  },
  {
    "id": "oraxia",
    "name": "Oraxia",
    "health": 575,
    "shield": 125,
    "armor": 125,
    "energy": 150,
    "sprintSpeed": 1,
    "description": "Leap onto an enemy and pierce them with Oraxia\u2019s spider legs, dealing <DT_POISON_COLOR>Toxin Damage. Enemies defeated by this attack have a chance to drop Health or Energy Orbs.",
    "passive": "Wall Latching grants Predator's Lurk, rendering Oraxia invisible for |DURATION|s.",
    "abilities": [
      {
        "name": "Mercy's Kiss",
        "energyCost": 25,
        "description": "Leap onto an enemy and pierce them with Oraxia\u2019s spider legs, dealing <DT_POISON_COLOR>Toxin Damage. Enemies defeated by this attack have a chance to drop Health or Energy Orbs."
      },
      {
        "name": "Webbed Embrace",
        "energyCost": 25,
        "description": "Oraxia throws a creeping web to ensnare her prey. Enemies caught within the widening radius are trapped inside a cocoon that increases their Damage Vulnerability."
      },
      {
        "name": "Widow's Brood",
        "energyCost": 25,
        "description": "Oraxia launches a barrage of stinging darts in front of her that applies <DT_POISON_COLOR> Toxin Status Effect. Poisoned enemies spawn Scuttlers when killed."
      },
      {
        "name": "Silken Stride",
        "energyCost": 25,
        "description": "Unfurl Oraxia\u2019s spider legs and go on the prowl. Oraxia is immune to Status Effects and has increased Maximum Health. Ranged Weapons are imbued with <DT_POISON_COLOR> Toxin Dama..."
      }
    ]
  },
  {
    "id": "protea",
    "name": "Protea",
    "health": 270,
    "shield": 455,
    "armor": 135,
    "energy": 175,
    "sprintSpeed": 1.2,
    "description": "Throw out grenades in an arc.  (TAP) SHRAPNEL VORTEX Creates a slashing, staggering swirl of shrapnel.  (HOLD) SHIELD SATELLITES Protea reconfigures Grenades to work as overchar...",
    "passive": "Every |CASTS|th Power Cast is granted +|STRENGTH|% Ability Strength.",
    "abilities": [
      {
        "name": "Grenade Fan",
        "energyCost": 25,
        "description": "Throw out grenades in an arc.  (TAP) SHRAPNEL VORTEX Creates a slashing, staggering swirl of shrapnel.  (HOLD) SHIELD SATELLITES Protea reconfigures Grenades to work as overchar..."
      },
      {
        "name": "Blaze Artillery",
        "energyCost": 25,
        "description": "Deploys an artillery unit to blast plasma charges at enemies it faces. Each enemy hit increases the power of subsequent plasma attacks."
      },
      {
        "name": "Dispensary",
        "energyCost": 25,
        "description": "Deploys a device that generates 3 pickups after a short delay: empowered health orb, universal ammo pack and energy orb."
      },
      {
        "name": "Temporal Anchor",
        "energyCost": 25,
        "description": "Drops a Temporal Anchor which, after a short duration, Protea rewinds to trigger a temporal implosion. Implosion damage increases based on damage dealt between anchor drop and r..."
      }
    ]
  },
  {
    "id": "protea_prime",
    "name": "Protea Prime",
    "health": 270,
    "shield": 455,
    "armor": 185,
    "energy": 200,
    "sprintSpeed": 1.2,
    "description": "Throw out grenades in an arc.  (TAP) SHRAPNEL VORTEX Creates a slashing, staggering swirl of shrapnel.  (HOLD) SHIELD SATELLITES Protea reconfigures Grenades to work as overchar...",
    "passive": "Every |CASTS|th Power Cast is granted +|STRENGTH|% Ability Strength.",
    "abilities": [
      {
        "name": "Grenade Fan",
        "energyCost": 25,
        "description": "Throw out grenades in an arc.  (TAP) SHRAPNEL VORTEX Creates a slashing, staggering swirl of shrapnel.  (HOLD) SHIELD SATELLITES Protea reconfigures Grenades to work as overchar..."
      },
      {
        "name": "Blaze Artillery",
        "energyCost": 25,
        "description": "Deploys an artillery unit to blast plasma charges at enemies it faces. Each enemy hit increases the power of subsequent plasma attacks."
      },
      {
        "name": "Dispensary",
        "energyCost": 25,
        "description": "Deploys a device that generates 3 pickups after a short delay: empowered health orb, universal ammo pack and energy orb."
      },
      {
        "name": "Temporal Anchor",
        "energyCost": 25,
        "description": "Drops a Temporal Anchor which, after a short duration, Protea rewinds to trigger a temporal implosion. Implosion damage increases based on damage dealt between anchor drop and r..."
      }
    ]
  },
  {
    "id": "qorvex",
    "name": "Qorvex",
    "health": 600,
    "shield": 200,
    "armor": 875,
    "energy": 150,
    "sprintSpeed": 0.89999998,
    "description": "Summon a Chyrinka Pillar that slows enemies. It pulses <DT_RADIATION_COLOR>Radiation Damage with a guaranteed Status Effect.",
    "passive": "Weapons wielded by Qorvex have an additional +|PUNCH_THROUGH| Punch Through.",
    "abilities": [
      {
        "name": "Chyrinka Pillar",
        "energyCost": 25,
        "description": "Summon a Chyrinka Pillar that slows enemies. It pulses <DT_RADIATION_COLOR>Radiation Damage with a guaranteed Status Effect."
      },
      {
        "name": "Containment Wall",
        "energyCost": 25,
        "description": "Contain the threat. Qorvex summons walls that slam together, damaging all enemies caught between them and inflicting <DT_RADIATION_COLOR>Radiation Status."
      },
      {
        "name": "Disometric Guard",
        "energyCost": 25,
        "description": "Guard yourself and nearby allies against Status Effects. Each time Qorvex kills or assists in killing an enemy affected by <DT_RADIATION_COLOR>Radiation Status, the number of St..."
      },
      {
        "name": "Crucible Blast",
        "energyCost": 25,
        "description": "Release a beam from Qorvex's Crucible Core. Each enemy struck suffers <DT_RADIATION_COLOR>Radiation Damage with a guaranteed Status Effect. Enemies affected by <DT_RADIATION_CO..."
      }
    ]
  },
  {
    "id": "revenant",
    "name": "Revenant",
    "health": 270,
    "shield": 635,
    "armor": 135,
    "energy": 140,
    "sprintSpeed": 1,
    "description": "Convert a target into a zealous thrall. Thralls turn on their allies and enthrall through damage. On death, they disintegrate into a damaging pillar of energy.",
    "passive": "Shield depletion smashes enemies within |RADIUS|m with a |DAMAGE| Damage knockdown shockwave.",
    "abilities": [
      {
        "name": "Enthrall",
        "energyCost": 25,
        "description": "Convert a target into a zealous thrall. Thralls turn on their allies and enthrall through damage. On death, they disintegrate into a damaging pillar of energy.",
        "damage": 250,
        "range": 30,
        "duration": 25,
        "castTime": 0.4,
        "damageType": "Sentient"
      },
      {
        "name": "Mesmer Skin",
        "energyCost": 50,
        "description": "Become enveloped in Sentient energy, redirecting damage and stunning all those who dare attack. Stunned enemies can be Enthralled at no energy cost.",
        "range": 10,
        "castTime": 0.6
      },
      {
        "name": "Reave",
        "energyCost": 75,
        "description": "Dash through enemies as a wall of sentient energy, leeching shields and health from any encountered, enhanced for thralls.",
        "damage": 300,
        "range": 40,
        "castTime": 0.5,
        "damageType": "Sentient"
      },
      {
        "name": "Danse Macabre",
        "energyCost": 25,
        "description": "Erupt with a multitude of Eidolon energy beams and sweep a circle of death around Revenant. The beams will modify their Damage Type to target select defenses, while incoming damage is redirected.",
        "damage": 500,
        "range": 25,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Adaptive"
      }
    ]
  },
  {
    "id": "revenant_prime",
    "name": "Revenant Prime",
    "health": 270,
    "shield": 825,
    "armor": 135,
    "energy": 175,
    "sprintSpeed": 1.1,
    "description": "Convert a target into a zealous thrall. Thralls turn on their allies and enthrall through damage. On death, they disintegrate into a damaging pillar of energy.",
    "passive": "Shield depletion smashes enemies within |RADIUS|m with a |DAMAGE| Damage knockdown shockwave.",
    "abilities": [
      {
        "name": "Enthrall",
        "energyCost": 25,
        "description": "Convert a target into a zealous thrall. Thralls turn on their allies and enthrall through damage. On death, they disintegrate into a damaging pillar of energy.",
        "damage": 250,
        "range": 30,
        "duration": 25,
        "castTime": 0.4,
        "damageType": "Sentient"
      },
      {
        "name": "Mesmer Skin",
        "energyCost": 50,
        "description": "Become enveloped in Sentient energy, redirecting damage and stunning all those who dare attack. Stunned enemies can be Enthralled at no energy cost.",
        "range": 10,
        "castTime": 0.6
      },
      {
        "name": "Reave",
        "energyCost": 75,
        "description": "Dash through enemies as a wall of sentient energy, leeching shields and health from any encountered, enhanced for thralls.",
        "damage": 300,
        "range": 40,
        "castTime": 0.5,
        "damageType": "Sentient"
      },
      {
        "name": "Danse Macabre",
        "energyCost": 25,
        "description": "Erupt with a multitude of Eidolon energy beams and sweep a circle of death around Revenant. The beams will modify their Damage Type to target select defenses, while incoming damage is redirected.",
        "damage": 500,
        "range": 25,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Adaptive"
      }
    ]
  },
  {
    "id": "rhino",
    "name": "Rhino",
    "health": 270,
    "shield": 455,
    "armor": 240,
    "energy": 100,
    "sprintSpeed": 0.94999999,
    "description": "Rhino charges towards a target, clobbering any in his path and goring his victim.",
    "passive": "Emit a shockwave dealing |DAMAGE| damage after landing from a great height.",
    "abilities": [
      {
        "name": "Rhino Charge",
        "energyCost": 25,
        "description": "Rhino charges towards a target, clobbering any in his path and goring his victim.",
        "damage": 650,
        "range": 30,
        "castTime": 0.4,
        "damageType": "Impact"
      },
      {
        "name": "Iron Skin",
        "energyCost": 50,
        "description": "Rhino hardens his skin, insulating himself from all damage and gaining Overguard.",
        "armor": 1200,
        "range": 10,
        "castTime": 0.6,
        "miscStats": { "armorMultiplier": 2.5 }
      },
      {
        "name": "Roar",
        "energyCost": 75,
        "description": "Grants all nearby Warframes increased damage for a short duration.",
        "damageBuff": 0.5,
        "range": 25,
        "duration": 30,
        "radius": 25,
        "castTime": 0.5
      },
      {
        "name": "Rhino Stomp",
        "energyCost": 100,
        "description": "Rhino stomps with force sufficient to disrupt time, tumbling enemies around him in stasis.",
        "damage": 800,
        "range": 25,
        "duration": 8,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Blast"
      }
    ]
  },
  {
    "id": "rhino_prime",
    "name": "Rhino Prime",
    "health": 270,
    "shield": 455,
    "armor": 290,
    "energy": 100,
    "sprintSpeed": 1,
    "description": "Rhino charges towards a target, clobbering any in his path and goring his victim.",
    "passive": "Emit a shockwave dealing |DAMAGE| damage after landing from a great height.",
    "abilities": [
      {
        "name": "Rhino Charge",
        "energyCost": 25,
        "description": "Rhino charges towards a target, clobbering any in his path and goring his victim.",
        "damage": 650,
        "range": 30,
        "castTime": 0.4,
        "damageType": "Impact"
      },
      {
        "name": "Iron Skin",
        "energyCost": 50,
        "description": "Rhino hardens his skin, insulating himself from all damage and gaining Overguard.",
        "armor": 1200,
        "range": 10,
        "castTime": 0.6,
        "miscStats": { "armorMultiplier": 2.5 }
      },
      {
        "name": "Roar",
        "energyCost": 75,
        "description": "Grants all nearby Warframes increased damage for a short duration.",
        "damageBuff": 0.5,
        "range": 25,
        "duration": 30,
        "radius": 25,
        "castTime": 0.5
      },
      {
        "name": "Rhino Stomp",
        "energyCost": 100,
        "description": "Rhino stomps with force sufficient to disrupt time, tumbling enemies around him in stasis.",
        "damage": 800,
        "range": 25,
        "duration": 8,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Blast"
      }
    ]
  },
  {
    "id": "saryn",
    "name": "Saryn",
    "health": 365,
    "shield": 270,
    "armor": 240,
    "energy": 175,
    "sprintSpeed": 0.94999999,
    "description": "Inflict a target with a pox of Corrosive spores. Spread spores to nearby enemies by destroying them or killing their host. The longer the Spore spreads, its damage increases.",
    "passive": "Status Effects inflicted upon enemies last |DURATION|% longer.",
    "abilities": [
      {
        "name": "Spores",
        "energyCost": 25,
        "description": "Inflict a target with a pox of Corrosive spores. Spread spores to nearby enemies by destroying them or killing their host. The longer the Spore spreads, its damage increases.",
        "damagePerSecond": 10,
        "range": 60,
        "castTime": 0.5,
        "damageType": "Corrosive",
        "miscStats": { "damageGrowth": 2 }
      },
      {
        "name": "Molt",
        "energyCost": 50,
        "description": "Shedding her skin like a snake, Saryn leaves a decoy behind to draw fire from enemies.",
        "health": 500,
        "range": 10,
        "duration": 40,
        "castTime": 0.6,
        "miscStats": { "speedBuff": 0.5 }
      },
      {
        "name": "Toxic Lash",
        "energyCost": 50,
        "description": "While active, attacks deal additional Toxin Damage; this effect is doubled for Melee Strikes. Instantly burst spores when attacking afflicted enemies.",
        "range": 10,
        "duration": 45,
        "castTime": 0.4,
        "miscStats": { "gunDamage": 0.3, "meleeDamage": 0.6 }
      },
      {
        "name": "Miasma",
        "energyCost": 75,
        "description": "Release a poisonous miasma that deals Viral Damage to enemies in range. Foes afflicted by spores are more susceptible to the mist.",
        "damagePerSecond": 150,
        "range": 20,
        "duration": 6,
        "radius": 20,
        "castTime": 0.8,
        "damageType": "Viral"
      }
    ]
  },
  {
    "id": "saryn_prime",
    "name": "Saryn Prime",
    "health": 365,
    "shield": 270,
    "armor": 315,
    "energy": 200,
    "sprintSpeed": 1,
    "description": "Inflict a target with a pox of Corrosive spores. Spread spores to nearby enemies by destroying them or killing their host. The longer the Spore spreads, its damage increases.",
    "passive": "Status Effects inflicted upon enemies last |DURATION|% longer.",
    "abilities": [
      {
        "name": "Spores",
        "energyCost": 25,
        "description": "Inflict a target with a pox of Corrosive spores. Spread spores to nearby enemies by destroying them or killing their host. The longer the Spore spreads, its damage increases.",
        "damagePerSecond": 10,
        "range": 60,
        "castTime": 0.5,
        "damageType": "Corrosive",
        "miscStats": { "damageGrowth": 2 }
      },
      {
        "name": "Molt",
        "energyCost": 50,
        "description": "Shedding her skin like a snake, Saryn leaves a decoy behind to draw fire from enemies.",
        "health": 500,
        "range": 10,
        "duration": 40,
        "castTime": 0.6,
        "miscStats": { "speedBuff": 0.5 }
      },
      {
        "name": "Toxic Lash",
        "energyCost": 50,
        "description": "While active, attacks deal additional Toxin Damage; this effect is doubled for Melee Strikes. Instantly burst spores when attacking afflicted enemies.",
        "range": 10,
        "duration": 45,
        "castTime": 0.4,
        "miscStats": { "gunDamage": 0.3, "meleeDamage": 0.6 }
      },
      {
        "name": "Miasma",
        "energyCost": 75,
        "description": "Release a poisonous miasma that deals Viral Damage to enemies in range. Foes afflicted by spores are more susceptible to the mist.",
        "damagePerSecond": 150,
        "range": 20,
        "duration": 6,
        "radius": 20,
        "castTime": 0.8,
        "damageType": "Viral"
      }
    ]
  },
  {
    "id": "sevagoth",
    "name": "Sevagoth",
    "health": 270,
    "shield": 235,
    "armor": 160,
    "energy": 140,
    "sprintSpeed": 0.94999999,
    "description": "Sevagoth's Shadow flies outward ravaging enemies in his path. Survivors are damaged by Death\u2019s Harvest over time. The souls of the dead fill the Death Well.",
    "passive": "On death, become Sevagoth's Shadow and fight to resurrect him by collecting the souls needed to rebuild his tombstone.",
    "abilities": [
      {
        "name": "Reap",
        "energyCost": 25,
        "description": "Sevagoth's Shadow flies outward ravaging enemies in his path. Survivors are damaged by Death\u2019s Harvest over time. The souls of the dead fill the Death Well."
      },
      {
        "name": "Sow",
        "energyCost": 25,
        "description": "Plant a death seed in nearby targets to drain their lifeforce. Reap what has been sown to detonate afflicted enemies, dealing a percentage of their health as radial damage. The ..."
      },
      {
        "name": "Gloom",
        "energyCost": 25,
        "description": "Summon a radial pulse wave that ensnares and slows enemies, siphoning their lifeforce for the Death Well. Allies within the wave steal health with each attack."
      },
      {
        "name": "Exalted Shadow",
        "energyCost": 25,
        "description": "When the Death Well fills, Sevagoth's Shadow form is ready to be released. Tear the enemy asunder with a collection of melee-focused abilities."
      }
    ]
  },
  {
    "id": "sevagoth_prime",
    "name": "Sevagoth Prime",
    "health": 270,
    "shield": 270,
    "armor": 185,
    "energy": 175,
    "sprintSpeed": 0.94999999,
    "description": "Sevagoth's Shadow flies outward ravaging enemies in his path. Survivors are damaged by Death\u2019s Harvest over time. The souls of the dead fill the Death Well.",
    "passive": "On death, become Sevagoth's Shadow and fight to resurrect him by collecting the souls needed to rebuild his tombstone.",
    "abilities": [
      {
        "name": "Reap",
        "energyCost": 25,
        "description": "Sevagoth's Shadow flies outward ravaging enemies in his path. Survivors are damaged by Death\u2019s Harvest over time. The souls of the dead fill the Death Well."
      },
      {
        "name": "Sow",
        "energyCost": 25,
        "description": "Plant a death seed in nearby targets to drain their lifeforce. Reap what has been sown to detonate afflicted enemies, dealing a percentage of their health as radial damage. The ..."
      },
      {
        "name": "Gloom",
        "energyCost": 25,
        "description": "Summon a radial pulse wave that ensnares and slows enemies, siphoning their lifeforce for the Death Well. Allies within the wave steal health with each attack."
      },
      {
        "name": "Exalted Shadow",
        "energyCost": 25,
        "description": "When the Death Well fills, Sevagoth's Shadow form is ready to be released. Tear the enemy asunder with a collection of melee-focused abilities."
      }
    ]
  },
  {
    "id": "styanax",
    "name": "Styanax",
    "health": 270,
    "shield": 825,
    "armor": 265,
    "energy": 175,
    "sprintSpeed": 1,
    "description": "Throw an Axios Javelin. When the javelin impales an enemy against a wall, surrounding enemies are pulled into the area and suffer a burst of damage.",
    "passive": "Styanax's critical chance increases with his shields and doubles for spearguns.",
    "abilities": [
      {
        "name": "Axios Javelin",
        "energyCost": 15,
        "description": "Throw an Axios Javelin. When the javelin impales an enemy against a wall, surrounding enemies are pulled into the area and suffer a burst of damage.",
        "directDamage": 1250,
        "aoeDamage": 1250,
        "range": 50,
        "radius": 15,
        "duration": 8,
        "castTime": 0.5
      },
      {
        "name": "Tharros Strike",
        "energyCost": 25,
        "description": "Summon Tharros, the shield of Styanax. Swing Tharros to repel enemies and reduce their shields and armor. Styanax regenerates health for every enemy struck.",
        "range": 9,
        "castTime": 0.75,
        "miscStats": { "shieldStrip": "100%", "armorStrip": "50%", "healthPerHit": "250" }
      },
      {
        "name": "Rally Point",
        "energyCost": 75,
        "description": "Draw enemy attention to Styanax. His resolve uplifts him and nearby allies, regenerating the squad's energy over time. Styanax and his allies also regenerate shields for every kill assist.",
        "duration": 30,
        "radius": 30,
        "miscStats": { "energyRegen": 3, "shieldsPerKill": 50 }
      },
      {
        "name": "Final Stand",
        "energyCost": 100,
        "description": "Exude might and valor. Rise into the air and throw a barrage of Axios Javelins. The javelins deal damage to nearby enemies wherever they land. Direct hits to enemies deal greater damage.",
        "directDamage": 1500,
        "aoeDamage": 1500,
        "duration": 2.5,
        "radius": 6,
        "miscStats": { "javelins": 30, "statusChance": "50%" }
      }
    ]
  },
  {
    "id": "styanax_prime",
    "name": "Styanax Prime",
    "health": 270,
    "shield": 925,
    "armor": 265,
    "energy": 215,
    "sprintSpeed": 1,
    "description": "Shield of the innocent. Spear of justice. Styanax Prime holds the line in defiance of tyranny.",
    "passive": "Styanax's critical chance increases with his shields and doubles for spearguns.",
    "abilities": [
      {
        "name": "Axios Javelin",
        "energyCost": 15,
        "description": "Throw an Axios Javelin. When the javelin impales an enemy against a wall, surrounding enemies are pulled into the area and suffer a burst of damage.",
        "directDamage": 1250,
        "aoeDamage": 1250,
        "range": 50,
        "radius": 15,
        "duration": 8,
        "castTime": 0.5
      },
      {
        "name": "Tharros Strike",
        "energyCost": 25,
        "description": "Summon Tharros, the shield of Styanax. Swing Tharros to repel enemies and reduce their shields and armor. Styanax regenerates health for every enemy struck.",
        "range": 9,
        "castTime": 0.75,
        "miscStats": { "shieldStrip": "100%", "armorStrip": "50%", "healthPerHit": "250" }
      },
      {
        "name": "Rally Point",
        "energyCost": 75,
        "description": "Draw enemy attention to Styanax. His resolve uplifts him and nearby allies, regenerating the squad's energy over time. Styanax and his allies also regenerate shields for every kill assist.",
        "duration": 30,
        "radius": 30,
        "miscStats": { "energyRegen": 3, "shieldsPerKill": 50 }
      },
      {
        "name": "Final Stand",
        "energyCost": 100,
        "description": "Exude might and valor. Rise into the air and throw a barrage of Axios Javelins. The javelins deal damage to nearby enemies wherever they land. Direct hits to enemies deal greater damage.",
        "directDamage": 1500,
        "aoeDamage": 1500,
        "duration": 2.5,
        "radius": 6,
        "miscStats": { "javelins": 30, "statusChance": "50%" }
      }
    ]
  },
  {
    "id": "sirius_orion",
    "name": "Sirius & Orion",
    "health": 475,
    "shield": 355,
    "armor": 160,
    "energy": 200,
    "sprintSpeed": 1.15,
    "description": "Wield the power of the stars in a constant battle for supremacy. Swap between Sirius and Orion during combat to rain cosmic destruction upon foes.",
    "passive": "Swapping between Sirius and Orion grants 45% Ability Efficiency for the next 2 casts. When below 50 energy, they steal energy from each other.",
    "abilities": [
      {
        "name": "Coronal Ejection",
        "energyCost": 15,
        "description": "Hurl Sirius' Jade Light infused scythe, dealing Heat damage while collecting any pickups in its path. (HOLD) Swap to Orion and cast Gravitic Slash.",
        "damage": 750,
        "radius": 3,
        "statusChance": 1,
        "castTime": 0.5,
        "damageType": "Heat"
      },
      {
        "name": "Gravitic Slash",
        "energyCost": 15,
        "description": "Repel enemies with Orion's scythe, dealing Slash damage while reducing shields and armor. (HOLD) Swap to Sirius and cast Coronal Ejection.",
        "damage": 1250,
        "radius": 6,
        "statusChance": 1,
        "castTime": 0.6,
        "damageType": "Slash",
        "miscStats": { "shieldStrip": "35%", "armorStrip": "35%", "arc": "67.5°" }
      },
      {
        "name": "Jade Stars",
        "energyCost": 50,
        "description": "Sirius conjures Jade Light motes that slowly regenerate over time. Attacking enemies launches the motes, dealing Heat damage. (HOLD) Swap to Orion and cast Astral Shell.",
        "damage": 350,
        "duration": 20,
        "radius": 4,
        "statusChance": 0.3,
        "castTime": 0.5,
        "damageType": "Heat"
      },
      {
        "name": "Astral Shell",
        "energyCost": 50,
        "description": "Envelop Orion in an Astral Shell. Upon taking damage the shell becomes a decoy that draws fire until it is destroyed. (HOLD) Swap to Sirius and cast Jade Stars.",
        "duration": 20,
        "castTime": 0.4,
        "miscStats": { "decoyDuration": "5s", "decoyDamage": 50, "decoyRadius": 5, "decoyCooldown": "5s" }
      },
      {
        "name": "Light's Sanctuary",
        "energyCost": 50,
        "description": "Sirius creates a well of light that heals and revives allies, while reducing incoming damage. The well slowly grows in size and power. (HOLD) Swap to Orion and cast Event Horizon.",
        "duration": 25,
        "radius": 10,
        "castTime": 0.6,
        "miscStats": { "minRadius": 5, "maxRadius": 10, "healthRegen": "10-40/s", "damageReduction": "15-45%", "reviveCooldown": "60s" }
      },
      {
        "name": "Event Horizon",
        "energyCost": 50,
        "description": "Orion forms a drifting black hole, trapping enemies within its gravity. Enemies killed within the black hole empower it. (HOLD) Swap to Sirius and cast Light's Sanctuary.",
        "castTime": 0.7,
        "miscStats": { "durationExtension": "+5s per kill in radius" }
      },
      {
        "name": "Celestial Clash",
        "energyCost": 100,
        "description": "Sirius and Orion take to the skies in a cosmic clash. Each attack consumes a Constellation Star to inflict colossal Blast damage. Match the star color for +55% Critical Chance.",
        "damage": 7000,
        "radius": 20,
        "castTime": 1,
        "damageType": "Blast",
        "miscStats": { "criticalChanceBonus": "55%", "maxConstellationStars": 7 }
      }
    ]
  },
  {
    "id": "temple",
    "name": "Temple",
    "health": 405,
    "shield": 225,
    "armor": 325,
    "energy": 165,
    "sprintSpeed": 1,
    "description": "Blast targeted enemies with pillars of <DT_FIRE_COLOR>Heat Damage.   Backbeat Timing: Ignite even more pillars. Increases the Duration and <DT_FIRE_COLOR>Heat Damage of Ripper\"...",
    "passive": "Play abilities in sync with the Backbeat metronome to invigorate ability effects while increasing Ability Efficiency by |COST|%.",
    "abilities": [
      {
        "name": "Pyrotechnics",
        "energyCost": 25,
        "description": "Blast targeted enemies with pillars of <DT_FIRE_COLOR>Heat Damage.   Backbeat Timing: Ignite even more pillars. Increases the Duration and <DT_FIRE_COLOR>Heat Damage of Ripper\"..."
      },
      {
        "name": "Overdrive",
        "energyCost": 25,
        "description": "Drive loudspeakers into epic distortion to create a damaging wave of <DT_FIRE_COLOR>Heat Damage while also increasing vulnerability to Critical Chance.   Backbeat Timing: Double..."
      },
      {
        "name": "Ripper's Wail",
        "energyCost": 25,
        "description": "Rip on the guitar to make Temple briefly invulnerable while healing them. Ally\u2019s weapons in <AFFINITY_SHARE>Affinity Range are lit-up with extra <DT_FIRE_COLOR>Heat Damage each ..."
      },
      {
        "name": "Exalted Solo",
        "energyCost": 25,
        "description": "Once a charge has been built up on the Backbeat metronome, set Lizzie aflame and torch enemies with <DT_FIRE_COLOR>Heat. While aimed, Lizzie blasts enemies with thunderous eleme..."
      }
    ]
  },
  {
    "id": "titania",
    "name": "Titania",
    "health": 270,
    "shield": 270,
    "armor": 105,
    "energy": 175,
    "sprintSpeed": 1,
    "description": "Enemies fumble their weapons as they are whisked into the air. Nearby allies become immune to Status Effects. Hold the ability to cast the immunity onto Titania.",
    "passive": "Titania generates Health for herself and nearby allies every time she casts an Ability.",
    "abilities": [
      {
        "name": "Spellbind",
        "energyCost": 25,
        "description": "Enemies fumble their weapons as they are whisked into the air. Nearby allies become immune to Status Effects. Hold the ability to cast the immunity onto Titania.",
        "range": 30,
        "duration": 15,
        "radius": 15,
        "castTime": 0.4
      },
      {
        "name": "Tribute",
        "energyCost": 50,
        "description": "Cycle through and extract one of the four Buffs when cast on an enemy. Thorns reduces incoming damage. Dust degrades enemy accuracy. Full Moon increases companion damage. Entangle slows enemies.",
        "range": 25,
        "duration": 120,
        "castTime": 0.5
      },
      {
        "name": "Lantern",
        "energyCost": 75,
        "description": "Create a swarm of razorflies that transform an enemy into an irresistible floating beacon, attracting witless comrades before exploding on command.",
        "damage": 300,
        "range": 30,
        "duration": 20,
        "radius": 15,
        "castTime": 0.6,
        "damageType": "Slash"
      },
      {
        "name": "Razorwing",
        "energyCost": 25,
        "description": "Shrink down and take flight, while razorflies attack nearby enemies and amplify the damage they take.",
        "damage": 150,
        "range": 20,
        "radius": 20,
        "castTime": 0.8,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "titania_prime",
    "name": "Titania Prime",
    "health": 365,
    "shield": 270,
    "armor": 135,
    "energy": 215,
    "sprintSpeed": 1,
    "description": "Enemies fumble their weapons as they are whisked into the air. Nearby allies become immune to Status Effects. Hold the ability to cast the immunity onto Titania.",
    "passive": "Titania generates Health for herself and nearby allies every time she casts an Ability.",
    "abilities": [
      {
        "name": "Spellbind",
        "energyCost": 25,
        "description": "Enemies fumble their weapons as they are whisked into the air. Nearby allies become immune to Status Effects. Hold the ability to cast the immunity onto Titania.",
        "range": 30,
        "duration": 15,
        "radius": 15,
        "castTime": 0.4
      },
      {
        "name": "Tribute",
        "energyCost": 50,
        "description": "Cycle through and extract one of the four Buffs when cast on an enemy. Thorns reduces incoming damage. Dust degrades enemy accuracy. Full Moon increases companion damage. Entangle slows enemies.",
        "range": 25,
        "duration": 120,
        "castTime": 0.5
      },
      {
        "name": "Lantern",
        "energyCost": 75,
        "description": "Create a swarm of razorflies that transform an enemy into an irresistible floating beacon, attracting witless comrades before exploding on command.",
        "damage": 300,
        "range": 30,
        "duration": 20,
        "radius": 15,
        "castTime": 0.6,
        "damageType": "Slash"
      },
      {
        "name": "Razorwing",
        "energyCost": 25,
        "description": "Shrink down and take flight, while razorflies attack nearby enemies and amplify the damage they take.",
        "damage": 150,
        "range": 20,
        "radius": 20,
        "castTime": 0.8,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "trinity",
    "name": "Trinity",
    "health": 270,
    "shield": 270,
    "armor": 105,
    "energy": 175,
    "sprintSpeed": 1,
    "description": "Create a well of life on an enemy who will absorb Status Effect damage intended for nearby allies. Allies gain additional Health when they attack the target. If allies die, enemies in the area will be resurrected.",
    "passive": "Allies in Affinity Range gain |BUFF|% of Trinity's Max Energy as Health.",
    "abilities": [
      {
        "name": "Well Of Life",
        "energyCost": 25,
        "description": "Create a well of life on an enemy who will absorb Status Effect damage intended for nearby allies. Allies gain additional Health when they attack the target. If allies die, enemies in the area will be resurrected.",
        "damage": 100,
        "range": 30,
        "duration": 12,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Energy Vampire",
        "energyCost": 50,
        "description": "Allies will gain energy over time when enemies are marked with Energy Vampire.",
        "damage": 150,
        "range": 40,
        "duration": 9,
        "castTime": 0.4,
        "damageType": "Puncture"
      },
      {
        "name": "Link",
        "energyCost": 75,
        "description": "Any damage taken while Link is active will be channeled to a nearby enemy.",
        "range": 25,
        "duration": 20,
        "radius": 20,
        "castTime": 0.6
      },
      {
        "name": "Blessing",
        "energyCost": 100,
        "description": "Restore the health and shields of allies within Affinity Range while reducing the damage they take from enemies.",
        "range": 50,
        "radius": 50,
        "castTime": 0.8
      }
    ]
  },
  {
    "id": "trinity_prime",
    "name": "Trinity Prime",
    "health": 270,
    "shield": 455,
    "armor": 135,
    "energy": 175,
    "sprintSpeed": 1.1,
    "description": "Create a well of life on an enemy who will absorb Status Effect damage intended for nearby allies. Allies gain additional Health when they attack the target. If allies die, enemies in the area will be resurrected.",
    "passive": "Allies in Affinity Range gain |BUFF|% of Trinity's Max Energy as Health.",
    "abilities": [
      {
        "name": "Well Of Life",
        "energyCost": 25,
        "description": "Create a well of life on an enemy who will absorb Status Effect damage intended for nearby allies. Allies gain additional Health when they attack the target. If allies die, enemies in the area will be resurrected.",
        "damage": 100,
        "range": 30,
        "duration": 12,
        "castTime": 0.5,
        "damageType": "Impact"
      },
      {
        "name": "Energy Vampire",
        "energyCost": 50,
        "description": "Allies will gain energy over time when enemies are marked with Energy Vampire.",
        "damage": 150,
        "range": 40,
        "duration": 9,
        "castTime": 0.4,
        "damageType": "Puncture"
      },
      {
        "name": "Link",
        "energyCost": 75,
        "description": "Any damage taken while Link is active will be channeled to a nearby enemy.",
        "range": 25,
        "duration": 20,
        "radius": 20,
        "castTime": 0.6
      },
      {
        "name": "Blessing",
        "energyCost": 100,
        "description": "Restore the health and shields of allies within Affinity Range while reducing the damage they take from enemies.",
        "range": 50,
        "radius": 50,
        "castTime": 0.8
      }
    ]
  },
  {
    "id": "uriel",
    "name": "Uriel",
    "health": 566,
    "shield": 566,
    "armor": 105,
    "energy": 100,
    "sprintSpeed": 1.1,
    "description": "Manifest an aura of flames inflicting <DT_FIRE_COLOR>Heat Damage and Status Effect on nearby enemies.  Tap Dodge while airborne to take flight as a flaming meteor of destruction.",
    "passive": "Uriel commands, empowers, and protects three unique demons.  CATENACH: Snares and slows enemies chaining them together. Damage dealt to any target in the chain is inflicted on all snared enemies. (Unlocks with Infernalis)  GULPHAGOR : Latches onto foes dealing damage over time. If killed, a circle of pain is spawned. (Unlocks with Remedium)  VYTHELAS: Inscribes demonic runes upon fallen foes that add Fire Rate and <DT_FIRE_COLOR>Heat Damage when collected. (Unlocks with Demonium)",
    "abilities": [
      {
        "name": "Infernalis",
        "energyCost": 25,
        "description": "Manifest an aura of flames inflicting <DT_FIRE_COLOR>Heat Damage and Status Effect on nearby enemies.  Tap Dodge while airborne to take flight as a flaming meteor of destruction."
      },
      {
        "name": "Remedium",
        "energyCost": 25,
        "description": "Uriel heals himself and his demons. If his demons are dead, they are resurrected."
      },
      {
        "name": "Demonium",
        "energyCost": 25,
        "description": "Uriel rips out the souls of his demons, draining their health, and sends them in search of new victims. Souls explode on contact with an enemy, rendering it vulnerable to Damage."
      },
      {
        "name": "Brimstone",
        "energyCost": 25,
        "description": "Uriel and his demons create a growing ring of flaming brimstone. Charge the ability by utilizing demon abilities. Damage inflicted increases with each consecutive hit."
      }
    ]
  },
  {
    "id": "valkyr",
    "name": "Valkyr",
    "health": 650,
    "shield": 135,
    "armor": 855,
    "energy": 100,
    "sprintSpeed": 1.1,
    "description": "Valkyr hurls forth a hook and pulls herself to whatever it hits. If it hits an enemy, nearby foes are pulled in as she unleashes a coordinated Melee attack.",
    "passive": "Valkyr accumulates Rage when hitting or killing enemies with melee weapons, increasing her Melee Damage up to |PERCENT|%. Taking fatal damage when the Rage meter is above |CONSUME|% consumes the meter, preventing death and granting |DURATION|s of invulnerability.",
    "abilities": [
      {
        "name": "Rip Line",
        "energyCost": 25,
        "description": "Valkyr hurls forth a hook and pulls herself to whatever it hits. If it hits an enemy, nearby foes are pulled in as she unleashes a coordinated Melee attack.",
        "damage": 300,
        "range": 60,
        "castTime": 0.4,
        "damageType": "Slash"
      },
      {
        "name": "Warcry",
        "energyCost": 75,
        "description": "Valkyr lets out a rallying cry that bolsters Armor and Attack Speed for allies while in Affinity Range.",
        "range": 25,
        "duration": 15,
        "radius": 25,
        "castTime": 0.5
      },
      {
        "name": "Paralysis",
        "energyCost": 75,
        "description": "Unleash a damaging blast, slowing its victims while increasing their Melee Damage Vulnerability.",
        "damage": 250,
        "range": 15,
        "duration": 10,
        "radius": 15,
        "castTime": 0.3,
        "damageType": "Impact"
      },
      {
        "name": "Hysteria",
        "energyCost": 25,
        "description": "Valkyr bares her deadly claws, unleashing devastating attacks that also heal her. Valkyr becomes immune to Status Effects and her Armor bonus from Warcry is multiplied while using Hysteria.",
        "damage": 400,
        "range": 10,
        "castTime": 0.8,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "valkyr_prime",
    "name": "Valkyr Prime",
    "health": 650,
    "shield": 135,
    "armor": 1000,
    "energy": 175,
    "sprintSpeed": 1.1,
    "description": "Valkyr hurls forth a hook and pulls herself to whatever it hits. If it hits an enemy, nearby foes are pulled in as she unleashes a coordinated Melee attack.",
    "passive": "Valkyr accumulates Rage when hitting or killing enemies with melee weapons, increasing her Melee Damage up to |PERCENT|%. Taking fatal damage when the Rage meter is above |CONSUME|% consumes the meter, preventing death and granting |DURATION|s of invulnerability.",
    "abilities": [
      {
        "name": "Rip Line",
        "energyCost": 25,
        "description": "Valkyr hurls forth a hook and pulls herself to whatever it hits. If it hits an enemy, nearby foes are pulled in as she unleashes a coordinated Melee attack.",
        "damage": 300,
        "range": 60,
        "castTime": 0.4,
        "damageType": "Slash"
      },
      {
        "name": "Warcry",
        "energyCost": 75,
        "description": "Valkyr lets out a rallying cry that bolsters Armor and Attack Speed for allies while in Affinity Range.",
        "range": 25,
        "duration": 15,
        "radius": 25,
        "castTime": 0.5
      },
      {
        "name": "Paralysis",
        "energyCost": 75,
        "description": "Unleash a damaging blast, slowing its victims while increasing their Melee Damage Vulnerability.",
        "damage": 250,
        "range": 15,
        "duration": 10,
        "radius": 15,
        "castTime": 0.3,
        "damageType": "Impact"
      },
      {
        "name": "Hysteria",
        "energyCost": 25,
        "description": "Valkyr bares her deadly claws, unleashing devastating attacks that also heal her. Valkyr becomes immune to Status Effects and her Armor bonus from Warcry is multiplied while using Hysteria.",
        "damage": 400,
        "range": 10,
        "castTime": 0.8,
        "damageType": "Slash"
      }
    ]
  },
  {
    "id": "vauban",
    "name": "Vauban",
    "health": 270,
    "shield": 180,
    "armor": 160,
    "energy": 175,
    "sprintSpeed": 1,
    "description": "Deploy a roller drone that attaches itself to enemies and delivers bursts of arcing electricity to anything in the immediate area.",
    "passive": "Deal |DAMAGE|% Extra Damage to incapacitated enemies.",
    "abilities": [
      {
        "name": "Tesla Nervos",
        "energyCost": 25,
        "description": "Deploy a roller drone that attaches itself to enemies and delivers bursts of arcing electricity to anything in the immediate area.",
        "damage": 150,
        "range": 15,
        "duration": 25,
        "radius": 10,
        "castTime": 0.4,
        "damageType": "Electricity"
      },
      {
        "name": "Minelayer",
        "energyCost": 50,
        "description": "Cycle through four deployable mines. Tether Coil immobilizes and groups enemies together. Flechette Orb fires out deadly nails in all directions. Vector Pad accelerates enemies in a chosen direction. Overdriver grants weapon damage to allies.",
        "damage": 200,
        "range": 25,
        "duration": 30,
        "radius": 12,
        "castTime": 0.5,
        "damageType": "Puncture"
      },
      {
        "name": "Photon Strike",
        "energyCost": 75,
        "description": "Drop a targeting beacon that calls in a devastating laser artillery strike.",
        "damage": 800,
        "range": 40,
        "radius": 15,
        "castTime": 0.6,
        "damageType": "Radiation"
      },
      {
        "name": "Bastille",
        "energyCost": 100,
        "description": "Erect a containment field to capture enemies and suspended them in stasis, stripping their armor. Hold to collapse all Bastilles into a single damaging vortex.",
        "range": 30,
        "duration": 15,
        "radius": 10,
        "castTime": 0.8
      }
    ]
  },
  {
    "id": "vauban_prime",
    "name": "Vauban Prime",
    "health": 270,
    "shield": 270,
    "armor": 210,
    "energy": 175,
    "sprintSpeed": 1,
    "description": "Deploy a roller drone that attaches itself to enemies and delivers bursts of arcing electricity to anything in the immediate area.",
    "passive": "Deal |DAMAGE|% Extra Damage to incapacitated enemies.",
    "abilities": [
      {
        "name": "Tesla Nervos",
        "energyCost": 25,
        "description": "Deploy a roller drone that attaches itself to enemies and delivers bursts of arcing electricity to anything in the immediate area.",
        "damage": 150,
        "range": 15,
        "duration": 25,
        "radius": 10,
        "castTime": 0.4,
        "damageType": "Electricity"
      },
      {
        "name": "Minelayer",
        "energyCost": 50,
        "description": "Cycle through four deployable mines. Tether Coil immobilizes and groups enemies together. Flechette Orb fires out deadly nails in all directions. Vector Pad accelerates enemies in a chosen direction. Overdriver grants weapon damage to allies.",
        "damage": 200,
        "range": 25,
        "duration": 30,
        "radius": 12,
        "castTime": 0.5,
        "damageType": "Puncture"
      },
      {
        "name": "Photon Strike",
        "energyCost": 75,
        "description": "Drop a targeting beacon that calls in a devastating laser artillery strike.",
        "damage": 800,
        "range": 40,
        "radius": 15,
        "castTime": 0.6,
        "damageType": "Radiation"
      },
      {
        "name": "Bastille",
        "energyCost": 100,
        "description": "Erect a containment field to capture enemies and suspended them in stasis, stripping their armor. Hold to collapse all Bastilles into a single damaging vortex.",
        "range": 30,
        "duration": 15,
        "radius": 10,
        "castTime": 0.8
      }
    ]
  },
  {
    "id": "voidrig",
    "name": "Voidrig",
    "health": 1400,
    "shield": 850,
    "armor": 385,
    "energy": 175,
    "sprintSpeed": 1,
    "description": "Hurl a canister of graviton fluids to create a wide mire that will significantly slow enemies traveling across it. Alternatively, the canister can be shot in mid-air to create a...",
    "passive": "",
    "abilities": [
      {
        "name": "Necraweb",
        "energyCost": 25,
        "description": "Hurl a canister of graviton fluids to create a wide mire that will significantly slow enemies traveling across it. Alternatively, the canister can be shot in mid-air to create a..."
      },
      {
        "name": "Storm Shroud",
        "energyCost": 25,
        "description": "Swathe the Necramech in a powerful electrical field that greatly enhances survivability in close combat. Enemies that strike the shroud will suffer for their impudence."
      },
      {
        "name": "Gravemines",
        "energyCost": 25,
        "description": "Launch a pattern of charged mines all around you. Each mine detonates in a violent blast when touched, damaging enemies in a three-meter radius."
      },
      {
        "name": "Guard Mode",
        "energyCost": 25,
        "description": "Take a stationary stance to deploy maximum firepower and gain increased structural integrity for a time."
      }
    ]
  },
  {
    "id": "volt",
    "name": "Volt",
    "health": 270,
    "shield": 455,
    "armor": 105,
    "energy": 100,
    "sprintSpeed": 1,
    "description": "Launch a voltaic projectile that stuns and damages its target. A chain of electricity extends from the target to shock nearby enemies.",
    "passive": "Grounded movement generates an electrical charge building up |DAMAGE| Damage per meter that is unleashed with the next attack.",
    "abilities": [
      {
        "name": "Shock",
        "energyCost": 15,
        "description": "Launch a voltaic projectile that stuns and damages its target. A chain of electricity extends from the target to shock nearby enemies.",
        "damage": 200,
        "range": 40,
        "radius": 15,
        "castTime": 0.4,
        "damageType": "Electricity",
        "chainLinks": 3,
        "chainRange": 15
      },
      {
        "name": "Speed",
        "energyCost": 25,
        "description": "Embody an electric current. Volt and his allies receive a brief movement speed boost and a reload speed buff.",
        "range": 25,
        "duration": 12,
        "radius": 25,
        "castTime": 0.5,
        "miscStats": { "speedBuff": 0.75, "reloadBuff": 0.25 }
      },
      {
        "name": "Electric Shield",
        "energyCost": 50,
        "description": "Volt deploys an electric shield that blocks projectiles and amplifies damage of allied shots that pass through.",
        "range": 20,
        "duration": 25,
        "castTime": 0.4,
        "miscStats": { "electricDamageBonus": 0.5, "critDamageBonus": 1.0 }
      },
      {
        "name": "Discharge",
        "energyCost": 100,
        "description": "Volt discharges the electricity that courses through him. The shockwave paralyzes and damages nearby enemies. Enemies on the edge of the shockwave are stunned.",
        "damage": 1200,
        "range": 20,
        "duration": 6,
        "radius": 8,
        "castTime": 0.8,
        "damageType": "Electricity"
      }
    ]
  },
  {
    "id": "volt_prime",
    "name": "Volt Prime",
    "health": 270,
    "shield": 455,
    "armor": 135,
    "energy": 200,
    "sprintSpeed": 1,
    "description": "Launch a voltaic projectile that stuns and damages its target. A chain of electricity extends from the target to shock nearby enemies.",
    "passive": "Grounded movement generates an electrical charge building up |DAMAGE| Damage per meter that is unleashed with the next attack.",
    "abilities": [
      {
        "name": "Shock",
        "energyCost": 15,
        "description": "Launch a voltaic projectile that stuns and damages its target. A chain of electricity extends from the target to shock nearby enemies.",
        "damage": 200,
        "range": 40,
        "radius": 15,
        "castTime": 0.4,
        "damageType": "Electricity",
        "chainLinks": 3,
        "chainRange": 15
      },
      {
        "name": "Speed",
        "energyCost": 25,
        "description": "Embody an electric current. Volt and his allies receive a brief movement speed boost and a reload speed buff.",
        "range": 25,
        "duration": 12,
        "radius": 25,
        "castTime": 0.5,
        "miscStats": { "speedBuff": 0.75, "reloadBuff": 0.25 }
      },
      {
        "name": "Electric Shield",
        "energyCost": 50,
        "description": "Volt deploys an electric shield that blocks projectiles and amplifies damage of allied shots that pass through.",
        "range": 20,
        "duration": 25,
        "castTime": 0.4,
        "miscStats": { "electricDamageBonus": 0.5, "critDamageBonus": 1.0 }
      },
      {
        "name": "Discharge",
        "energyCost": 100,
        "description": "Volt discharges the electricity that courses through him. The shockwave paralyzes and damages nearby enemies. Enemies on the edge of the shockwave are stunned.",
        "damage": 1200,
        "range": 20,
        "duration": 6,
        "radius": 8,
        "castTime": 0.8,
        "damageType": "Electricity"
      }
    ]
  },
  {
    "id": "voruna",
    "name": "Voruna",
    "health": 455,
    "shield": 270,
    "armor": 200,
    "energy": 100,
    "sprintSpeed": 0.94999999,
    "description": "(TAP) Dynar shrouds Voruna with invisibility and accelerates her speed. Invisibility ends when Voruna attacks. For a short time after invisibility ends, melee attacks have incre...",
    "passive": "Voruna never fights alone. In mission, hold Abilities to call upon each wolf\u2019s unique Passive power.",
    "abilities": [
      {
        "name": "Shroud Of Dynar",
        "energyCost": 25,
        "description": "(TAP) Dynar shrouds Voruna with invisibility and accelerates her speed. Invisibility ends when Voruna attacks. For a short time after invisibility ends, melee attacks have incre..."
      },
      {
        "name": "Fangs Of Raksh",
        "energyCost": 25,
        "description": "(TAP) Raksh's fangs tear into your enemies. 5 random Status Effects are applied at 10 Stacks each on an enemy. On target's death, spread the Status Effects to other nearby ene..."
      },
      {
        "name": "Lycath's Hunt",
        "energyCost": 25,
        "description": "(TAP) Lycath hunts to sustain the pack. Enemies killed by melee attacks drop health orbs and enemies killed by headshots drop energy orbs. Increase the duration of Lycath\u2019s hunt..."
      },
      {
        "name": "Ulfrun's Descent",
        "energyCost": 25,
        "description": "(TAP) Voruna drops to all fours and prepares 5 brutal charges that lock onto enemies. Ulfrun, the most powerful wolf, leads the attack as Voruna dashes toward her target. The pa..."
      }
    ]
  },
  {
    "id": "voruna_prime",
    "name": "Voruna Prime",
    "health": 455,
    "shield": 270,
    "armor": 265,
    "energy": 130,
    "sprintSpeed": 1.2,
    "description": "Splendor and ferocity reach their savage apex in Voruna Prime. Though exalted by Orokin gold, she is more feral than ever.",
    "passive": "Voruna never fights alone. In mission, hold Abilities to call upon each wolf\u2019s unique Passive power.",
    "abilities": [
      {
        "name": "Shroud Of Dynar",
        "energyCost": 25,
        "description": "(TAP) Dynar shrouds Voruna with invisibility and accelerates her speed. Invisibility ends when Voruna attacks. For a short time after invisibility ends, melee attacks have incre..."
      },
      {
        "name": "Fangs Of Raksh",
        "energyCost": 25,
        "description": "(TAP) Raksh's fangs tear into your enemies. 5 random Status Effects are applied at 10 Stacks each on an enemy. On target's death, spread the Status Effects to other nearby ene..."
      },
      {
        "name": "Lycath's Hunt",
        "energyCost": 25,
        "description": "(TAP) Lycath hunts to sustain the pack. Enemies killed by melee attacks drop health orbs and enemies killed by headshots drop energy orbs. Increase the duration of Lycath\u2019s hunt..."
      },
      {
        "name": "Ulfrun's Descent",
        "energyCost": 25,
        "description": "(TAP) Voruna drops to all fours and prepares 5 brutal charges that lock onto enemies. Ulfrun, the most powerful wolf, leads the attack as Voruna dashes toward her target. The pa..."
      }
    ]
  },
  {
    "id": "wisp",
    "name": "Wisp",
    "health": 270,
    "shield": 180,
    "armor": 185,
    "energy": 200,
    "sprintSpeed": 1.2,
    "description": "Choose and summon a Reservoir filled with Motes that attach to and aid Wisp and her allies. Haste Mote grants increased movement and attack speed. Vitality Mote increases maximum Health and heals over time. Shock Mote stuns nearby enemies.",
    "passive": "Flowing between dimensions, Wisp becomes invisible to enemies while in the air.",
    "abilities": [
      {
        "name": "Reservoirs",
        "energyCost": 25,
        "description": "Choose and summon a Reservoir filled with Motes that attach to and aid Wisp and her allies. Haste Mote grants increased movement and attack speed. Vitality Mote increases maximum Health and heals over time. Shock Mote stuns nearby enemies.",
        "range": 30,
        "duration": 30,
        "radius": 15,
        "castTime": 0.5
      },
      {
        "name": "Wil-O-Wisp",
        "energyCost": 35,
        "description": "Cast forward a spectral image of Wisp to confuse and distract enemies. Reactivate to travel to its position. Hold to have the image travel faster and teleport to its position on release.",
        "range": 40,
        "duration": 4,
        "castTime": 0.4
      },
      {
        "name": "Breach Surge",
        "energyCost": 50,
        "description": "Open a dimensional breach to overwhelm nearby enemies and cause them to release aggressive Surge sparks when damaged. Wisp may also target a Reservoir to teleport to it and double the range of the surge.",
        "damage": 200,
        "range": 18,
        "duration": 16,
        "radius": 18,
        "damageBuff": 2,
        "castTime": 0.6,
        "damageType": "Radiation"
      },
      {
        "name": "Sol Gate",
        "energyCost": 25,
        "description": "Open a portal to the sun to irradiate enemies with a devastating beam of pure solar plasma. Hold fire to double Damage at the cost of increased energy consumption. For the duration of the attack, Wisp is immune to damage and Status Effects and gains an infinite ammo Multishot buff.",
        "damage": 1500,
        "range": 40,
        "castTime": 0.8,
        "damageType": "Radiation",
        "miscStats": { "energyDrain": 12 }
      }
    ]
  },
  {
    "id": "wisp_prime",
    "name": "Wisp Prime",
    "health": 270,
    "shield": 270,
    "armor": 210,
    "energy": 200,
    "sprintSpeed": 1.25,
    "description": "Choose and summon a Reservoir filled with Motes that attach to and aid Wisp and her allies. Haste Mote grants increased movement and attack speed. Vitality Mote increases maximum Health and heals over time. Shock Mote stuns nearby enemies.",
    "passive": "Flowing between dimensions, Wisp becomes invisible to enemies while in the air.",
    "abilities": [
      {
        "name": "Reservoirs",
        "energyCost": 25,
        "description": "Choose and summon a Reservoir filled with Motes that attach to and aid Wisp and her allies. Haste Mote grants increased movement and attack speed. Vitality Mote increases maximum Health and heals over time. Shock Mote stuns nearby enemies.",
        "range": 30,
        "duration": 30,
        "radius": 15,
        "castTime": 0.5
      },
      {
        "name": "Wil-O-Wisp",
        "energyCost": 35,
        "description": "Cast forward a spectral image of Wisp to confuse and distract enemies. Reactivate to travel to its position. Hold to have the image travel faster and teleport to its position on release.",
        "range": 40,
        "duration": 4,
        "castTime": 0.4
      },
      {
        "name": "Breach Surge",
        "energyCost": 50,
        "description": "Open a dimensional breach to overwhelm nearby enemies and cause them to release aggressive Surge sparks when damaged. Wisp may also target a Reservoir to teleport to it and double the range of the surge.",
        "damage": 200,
        "range": 18,
        "duration": 16,
        "radius": 18,
        "damageBuff": 2,
        "castTime": 0.6,
        "damageType": "Radiation"
      },
      {
        "name": "Sol Gate",
        "energyCost": 25,
        "description": "Open a portal to the sun to irradiate enemies with a devastating beam of pure solar plasma. Hold fire to double Damage at the cost of increased energy consumption. For the duration of the attack, Wisp is immune to damage and Status Effects and gains an infinite ammo Multishot buff.",
        "damage": 1500,
        "range": 40,
        "castTime": 0.8,
        "damageType": "Radiation",
        "miscStats": { "energyDrain": 12 }
      }
    ]
  },
  {
    "id": "wukong",
    "name": "Wukong",
    "health": 455,
    "shield": 270,
    "armor": 265,
    "energy": 130,
    "sprintSpeed": 1,
    "description": "Shedding part of himself, Wukong creates a twin to fight by his side. Attack at range and the twin will melee, pull a blade and the twin will lay down covering fire. Use again to command the twin to attack a target with increased damage.",
    "passive": "After taking fatal damage Wukong automatically uses one of his mastered survival techniques. These techniques can only be invoked three times per mission.",
    "abilities": [
      {
        "name": "Celestial Twin",
        "energyCost": 25,
        "description": "Shedding part of himself, Wukong creates a twin to fight by his side. Attack at range and the twin will melee, pull a blade and the twin will lay down covering fire. Use again to command the twin to attack a target with increased damage.",
        "range": 50,
        "castTime": 0.5,
        "miscStats": { "healthMultiplier": 2, "damageMultiplier": 0.5, "markDamageMultiplier": 3 }
      },
      {
        "name": "Cloud Walker",
        "energyCost": 25,
        "description": "Evaporate into a cloud of mist and float through the battlefield, dazing any enemies encountered, while healing Wukong and his twin.",
        "range": 30,
        "duration": 2,
        "castTime": 0.4,
        "miscStats": { "healPerMeter": 0.01, "stunRadius": 8 }
      },
      {
        "name": "Defy",
        "energyCost": 50,
        "description": "Wukong and his twin become invulnerable and defy enemies to attack. All damage is captured, stored, and dealt back in a single furious strike of Wukong's staff. Bonus Armor is then granted based on damage absorbed.",
        "range": 12,
        "duration": 2,
        "castTime": 0.6,
        "miscStats": { "armorCap": 1500, "armorDuration": 25, "damageMultiplier": 7.5 }
      },
      {
        "name": "Primal Fury",
        "energyCost": 10,
        "description": "Summon the iron staff and unleash fury.",
        "damage": 300,
        "range": 3.5,
        "castTime": 0.8,
        "damageType": "Impact",
        "miscStats": { "energyDrain": 5 }
      }
    ]
  },
  {
    "id": "wukong_prime",
    "name": "Wukong Prime",
    "health": 455,
    "shield": 345,
    "armor": 290,
    "energy": 145,
    "sprintSpeed": 1.05,
    "description": "Shedding part of himself, Wukong creates a twin to fight by his side. Attack at range and the twin will melee, pull a blade and the twin will lay down covering fire. Use again to command the twin to attack a target with increased damage.",
    "passive": "After taking fatal damage Wukong automatically uses one of his mastered survival techniques. These techniques can only be invoked three times per mission.",
    "abilities": [
      {
        "name": "Celestial Twin",
        "energyCost": 25,
        "description": "Shedding part of himself, Wukong creates a twin to fight by his side. Attack at range and the twin will melee, pull a blade and the twin will lay down covering fire. Use again to command the twin to attack a target with increased damage.",
        "range": 50,
        "castTime": 0.5,
        "miscStats": { "healthMultiplier": 2, "damageMultiplier": 0.5, "markDamageMultiplier": 3 }
      },
      {
        "name": "Cloud Walker",
        "energyCost": 25,
        "description": "Evaporate into a cloud of mist and float through the battlefield, dazing any enemies encountered, while healing Wukong and his twin.",
        "range": 30,
        "duration": 2,
        "castTime": 0.4,
        "miscStats": { "healPerMeter": 0.01, "stunRadius": 8 }
      },
      {
        "name": "Defy",
        "energyCost": 50,
        "description": "Wukong and his twin become invulnerable and defy enemies to attack. All damage is captured, stored, and dealt back in a single furious strike of Wukong's staff. Bonus Armor is then granted based on damage absorbed.",
        "range": 12,
        "duration": 2,
        "castTime": 0.6,
        "miscStats": { "armorCap": 1500, "armorDuration": 25, "damageMultiplier": 7.5 }
      },
      {
        "name": "Primal Fury",
        "energyCost": 10,
        "description": "Summon the iron staff and unleash fury.",
        "damage": 300,
        "range": 3.5,
        "castTime": 0.8,
        "damageType": "Impact",
        "miscStats": { "energyDrain": 5 }
      }
    ]
  },
  {
    "id": "xaku",
    "name": "Xaku",
    "health": 269,
    "shield": 239,
    "armor": 146,
    "energy": 160,
    "sprintSpeed": 1.02,
    "description": "Wield Void Damage for all attacks from equipped weapons when activated.",
    "passive": "|CHANCE|% Damage Reduction on AOE attacks and chance to avoid incoming weapon damage.",
    "abilities": [
      {
        "name": "Xata's Whisper",
        "energyCost": 25,
        "description": "Wield Void Damage for all attacks from equipped weapons when activated.",
        "range": 20,
        "duration": 30,
        "castTime": 0.4
      },
      {
        "name": "Grasp Of Lohk",
        "energyCost": 50,
        "description": "Void Tendrils steal weapons from nearby enemies to use as your own floating, auto-targeting armament. Damage output increases based on enemy level. The number of weapons grabbed is limited by your Ability Strength.",
        "damage": 150,
        "range": 30,
        "duration": 20,
        "radius": 20,
        "castTime": 0.5,
        "damageType": "Void"
      },
      {
        "name": "The Lost",
        "energyCost": 75,
        "description": "Cycle through a trio of lost Warframe powers. Accuse manifests a Void fissure to corrupt enemies into allies. Gaze grasps targets in Void tendrils that capture damage and inflict it all at once. Deny denies death for enemies in a range.",
        "damage": 300,
        "range": 25,
        "duration": 10,
        "radius": 15,
        "castTime": 0.6,
        "damageType": "Void"
      },
      {
        "name": "The Vast Untime",
        "energyCost": 100,
        "description": "Temporarily shed the outer pieces of Xaku in a destructive blast, then stalk the battlefield in a new, swifter skeletal form. Enemies damaged by the body shrapnel are rendered vulnerable to Void Damage.",
        "damage": 500,
        "range": 25,
        "duration": 15,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Void"
      }
    ]
  },
  {
    "id": "xaku_prime",
    "name": "Xaku Prime",
    "health": 269,
    "shield": 263,
    "armor": 167,
    "energy": 181,
    "sprintSpeed": 1.0700001,
    "description": "Wield Void Damage for all attacks from equipped weapons when activated.",
    "passive": "|CHANCE|% Damage Reduction on AOE attacks and chance to avoid incoming weapon damage.",
    "abilities": [
      {
        "name": "Xata's Whisper",
        "energyCost": 25,
        "description": "Wield Void Damage for all attacks from equipped weapons when activated.",
        "range": 20,
        "duration": 30,
        "castTime": 0.4
      },
      {
        "name": "Grasp Of Lohk",
        "energyCost": 50,
        "description": "Void Tendrils steal weapons from nearby enemies to use as your own floating, auto-targeting armament. Damage output increases based on enemy level. The number of weapons grabbed is limited by your Ability Strength.",
        "damage": 150,
        "range": 30,
        "duration": 20,
        "radius": 20,
        "castTime": 0.5,
        "damageType": "Void"
      },
      {
        "name": "The Lost",
        "energyCost": 75,
        "description": "Cycle through a trio of lost Warframe powers. Accuse manifests a Void fissure to corrupt enemies into allies. Gaze grasps targets in Void tendrils that capture damage and inflict it all at once. Deny denies death for enemies in a range.",
        "damage": 300,
        "range": 25,
        "duration": 10,
        "radius": 15,
        "castTime": 0.6,
        "damageType": "Void"
      },
      {
        "name": "The Vast Untime",
        "energyCost": 100,
        "description": "Temporarily shed the outer pieces of Xaku in a destructive blast, then stalk the battlefield in a new, swifter skeletal form. Enemies damaged by the body shrapnel are rendered vulnerable to Void Damage.",
        "damage": 500,
        "range": 25,
        "duration": 15,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Void"
      }
    ]
  },
  {
    "id": "yareli",
    "name": "Yareli",
    "health": 270,
    "shield": 455,
    "armor": 105,
    "energy": 200,
    "sprintSpeed": 1,
    "description": "Form five water globules that seek out enemies and expand on contact, simultaneously damaging and immobilizing their victims. Enemies hit by the globules take increased damage from all sources.",
    "passive": "Yareli gains +|CHANCE|% Critical Chance for Secondary weapons when she has been moving for at least |TIME|s.",
    "abilities": [
      {
        "name": "Sea Snares",
        "energyCost": 25,
        "description": "Form five water globules that seek out enemies and expand on contact, simultaneously damaging and immobilizing their victims. Enemies hit by the globules take increased damage from all sources.",
        "damage": 200,
        "range": 30,
        "duration": 8,
        "radius": 8,
        "castTime": 0.5,
        "damageType": "Cold"
      },
      {
        "name": "Merulina",
        "energyCost": 25,
        "description": "Summon Merulina, a rideable creature of the waves, and the inspiration for K-Driving. Merulina protects Yareli by absorbing a large portion of incoming damage.",
        "range": 10,
        "duration": 60,
        "castTime": 0.4
      },
      {
        "name": "Aquablades",
        "energyCost": 50,
        "description": "Tear through foes with a trio of orbiting aquatic blades.",
        "damage": 300,
        "range": 10,
        "duration": 20,
        "radius": 8,
        "castTime": 0.6,
        "damageType": "Slash"
      },
      {
        "name": "Riptide",
        "energyCost": 100,
        "description": "Drag enemies into a crushing maelstrom and then blow them away in a watery burst. Each enemy trapped in the vortex increases the burst's damage.",
        "damage": 500,
        "range": 25,
        "duration": 5,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Cold"
      }
    ]
  },
  {
    "id": "yareli_prime",
    "name": "Yareli Prime",
    "health": 270,
    "shield": 550,
    "armor": 105,
    "energy": 215,
    "sprintSpeed": 1.1,
    "description": "Form five water globules that seek out enemies and expand on contact, simultaneously damaging and immobilizing their victims. Enemies hit by the globules take increased damage from all sources.",
    "passive": "Yareli gains +|CHANCE|% Critical Chance for Secondary weapons when she has been moving for at least |TIME|s.",
    "abilities": [
      {
        "name": "Sea Snares",
        "energyCost": 25,
        "description": "Form five water globules that seek out enemies and expand on contact, simultaneously damaging and immobilizing their victims. Enemies hit by the globules take increased damage from all sources.",
        "damage": 200,
        "range": 30,
        "duration": 8,
        "radius": 8,
        "castTime": 0.5,
        "damageType": "Cold"
      },
      {
        "name": "Merulina",
        "energyCost": 25,
        "description": "Summon Merulina, a rideable creature of the waves, and the inspiration for K-Driving. Merulina protects Yareli by absorbing a large portion of incoming damage.",
        "range": 10,
        "duration": 60,
        "castTime": 0.4
      },
      {
        "name": "Aquablades",
        "energyCost": 50,
        "description": "Tear through foes with a trio of orbiting aquatic blades.",
        "damage": 300,
        "range": 10,
        "duration": 20,
        "radius": 8,
        "castTime": 0.6,
        "damageType": "Slash"
      },
      {
        "name": "Riptide",
        "energyCost": 100,
        "description": "Drag enemies into a crushing maelstrom and then blow them away in a watery burst. Each enemy trapped in the vortex increases the burst's damage.",
        "damage": 500,
        "range": 25,
        "duration": 5,
        "radius": 15,
        "castTime": 0.8,
        "damageType": "Cold"
      }
    ]
  },
  {
    "id": "zephyr",
    "name": "Zephyr",
    "health": 455,
    "shield": 455,
    "armor": 105,
    "energy": 100,
    "sprintSpeed": 1.1,
    "description": "Hold while airborne to hover Zephyr with reduced movement. From the air, tap to dash forward, or aim down to dive bomb enemies below.",
    "passive": "Zephyr moves faster and falls slower while airborne. Also gain |CRIT|% Critical Hit chance with weapons while airborne.",
    "abilities": [
      {
        "name": "Tail Wind",
        "energyCost": 25,
        "description": "Hold while airborne to hover Zephyr with reduced movement. From the air, tap to dash forward, or aim down to dive bomb enemies below.",
        "damage": 300,
        "range": 30,
        "castTime": 0.3,
        "damageType": "Impact"
      },
      {
        "name": "Airburst",
        "energyCost": 50,
        "description": "Launch a burst of massively dense air. Hold to send enemies flying, tap to pull them toward the burst. Damage increases per enemy hit.",
        "damage": 400,
        "range": 25,
        "radius": 15,
        "castTime": 0.4,
        "damageType": "Impact"
      },
      {
        "name": "Turbulence",
        "energyCost": 75,
        "description": "Creates a wind shield around Zephyr, redirecting all incoming projectiles.",
        "range": 10,
        "duration": 30,
        "radius": 10,
        "castTime": 0.5
      },
      {
        "name": "Tornado",
        "energyCost": 100,
        "description": "Create deadly tornadoes that seek out and engulf enemies. Tornadoes deal the elemental Damage Type they absorb the most. Shoot engulfed enemies to inflict extra damage. Hold for stationary tornadoes.",
        "damage": 200,
        "range": 40,
        "duration": 20,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Impact"
      }
    ]
  },
  {
    "id": "zephyr_prime",
    "name": "Zephyr Prime",
    "health": 455,
    "shield": 455,
    "armor": 135,
    "energy": 175,
    "sprintSpeed": 1.15,
    "description": "Hold while airborne to hover Zephyr with reduced movement. From the air, tap to dash forward, or aim down to dive bomb enemies below.",
    "passive": "Zephyr moves faster and falls slower while airborne. Also gain |CRIT|% Critical Hit chance with weapons while airborne.",
    "abilities": [
      {
        "name": "Tail Wind",
        "energyCost": 25,
        "description": "Hold while airborne to hover Zephyr with reduced movement. From the air, tap to dash forward, or aim down to dive bomb enemies below.",
        "damage": 300,
        "range": 30,
        "castTime": 0.3,
        "damageType": "Impact"
      },
      {
        "name": "Airburst",
        "energyCost": 50,
        "description": "Launch a burst of massively dense air. Hold to send enemies flying, tap to pull them toward the burst. Damage increases per enemy hit.",
        "damage": 400,
        "range": 25,
        "radius": 15,
        "castTime": 0.4,
        "damageType": "Impact"
      },
      {
        "name": "Turbulence",
        "energyCost": 75,
        "description": "Creates a wind shield around Zephyr, redirecting all incoming projectiles.",
        "range": 10,
        "duration": 30,
        "radius": 10,
        "castTime": 0.5
      },
      {
        "name": "Tornado",
        "energyCost": 100,
        "description": "Create deadly tornadoes that seek out and engulf enemies. Tornadoes deal the elemental Damage Type they absorb the most. Shoot engulfed enemies to inflict extra damage. Hold for stationary tornadoes.",
        "damage": 200,
        "range": 40,
        "duration": 20,
        "radius": 25,
        "castTime": 0.8,
        "damageType": "Impact"
      }
    ]
  }
];

export const warframesMap = new Map<string, Warframe>(allWarframes.map(w => [w.id, w]));
