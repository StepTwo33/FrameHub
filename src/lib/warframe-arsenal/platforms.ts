export type WarframePlatform = "pc" | "ps4" | "xb1" | "swi";

export const WARFRAME_PLATFORM_LABELS: Record<WarframePlatform, string> = {
  pc: "PC",
  ps4: "PlayStation",
  xb1: "Xbox",
  swi: "Switch",
};

/** Official Digital Extremes Twitch extension loadout endpoints (per wiki). */
export const WARFRAME_ARSENAL_LOADOUT_URL: Record<WarframePlatform, string> = {
  pc: "https://content.warframe.com/dynamic/twitch/getActiveLoadout.php",
  ps4: "https://content-ps4.warframe.com/dynamic/twitch/getActiveLoadout.php",
  xb1: "https://content-xb1.warframe.com/dynamic/twitch/getActiveLoadout.php",
  swi: "https://content-swi.warframe.com/dynamic/twitch/getActiveLoadout.php",
};

export const WARFRAME_ACCOUNT_SETTINGS_URL = "https://www.warframe.com/user#gdprSettings";
