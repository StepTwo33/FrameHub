/**
 * Merged per-mod verified behaviors. Manual entries in verified-mods.ts override batch duplicates.
 */
import { VERIFIED_MOD_BEHAVIORS as MANUAL } from "./verified-mods";
import { MOD_BEHAVIORS_GENERAL } from "./batches/general";
import { MOD_BEHAVIORS_AUGMENT } from "./batches/augment";
import { MOD_BEHAVIORS_WARFRAME } from "./batches/warframe";
import { MOD_BEHAVIORS_COMPANION } from "./batches/companion";
import { MOD_BEHAVIORS_PRIMARY } from "./batches/primary";
import { MOD_BEHAVIORS_MELEE } from "./batches/melee";
import { MOD_BEHAVIORS_SECONDARY } from "./batches/secondary";
import { MOD_BEHAVIORS_OPERATOR } from "./batches/operator";
import { MOD_BEHAVIORS_STANCE } from "./batches/stance";
import { MOD_BEHAVIORS_ARCHGUN } from "./batches/archgun";
import { MOD_BEHAVIORS_NECRAMECH } from "./batches/necramech";
import { MOD_BEHAVIORS_KDRIVE } from "./batches/kdrive";
import { MOD_BEHAVIORS_TEKTOLYST } from "./batches/tektolyst";
import { MOD_BEHAVIORS_PISTOL } from "./batches/pistol";
import { MOD_BEHAVIORS_ARCHMELEE } from "./batches/archmelee";
import { MOD_BEHAVIORS_COMPANION_WEAPON } from "./batches/companion_weapon";
import { MOD_BEHAVIORS_SHOTGUN } from "./batches/shotgun";
import { MOD_BEHAVIORS_ARCHWING } from "./batches/archwing";
import { MOD_BEHAVIORS_RIFLE } from "./batches/rifle";
import { MOD_BEHAVIORS_SET } from "./batches/set";
import { MOD_BEHAVIORS_EVOLUTION } from "./batches/evolution";
import type { VerifiedModBehavior } from "@/lib/item-behavior-types";

const BATCHES: Record<string, VerifiedModBehavior>[] = [
  MOD_BEHAVIORS_GENERAL,
  MOD_BEHAVIORS_AUGMENT,
  MOD_BEHAVIORS_WARFRAME,
  MOD_BEHAVIORS_COMPANION,
  MOD_BEHAVIORS_PRIMARY,
  MOD_BEHAVIORS_MELEE,
  MOD_BEHAVIORS_SECONDARY,
  MOD_BEHAVIORS_OPERATOR,
  MOD_BEHAVIORS_STANCE,
  MOD_BEHAVIORS_ARCHGUN,
  MOD_BEHAVIORS_NECRAMECH,
  MOD_BEHAVIORS_KDRIVE,
  MOD_BEHAVIORS_TEKTOLYST,
  MOD_BEHAVIORS_PISTOL,
  MOD_BEHAVIORS_ARCHMELEE,
  MOD_BEHAVIORS_COMPANION_WEAPON,
  MOD_BEHAVIORS_SHOTGUN,
  MOD_BEHAVIORS_ARCHWING,
  MOD_BEHAVIORS_RIFLE,
  MOD_BEHAVIORS_SET,
  MOD_BEHAVIORS_EVOLUTION,
];

export const VERIFIED_MOD_BEHAVIORS: Record<string, VerifiedModBehavior> = {
  ...Object.assign({}, ...BATCHES),
  ...MANUAL,
};

export function countVerifiedMods(): number {
  return Object.keys(VERIFIED_MOD_BEHAVIORS).length;
}
