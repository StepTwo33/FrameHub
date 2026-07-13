import { prisma } from "@/lib/prisma";
import {
  canManageGuild,
  fetchBotGuilds,
  fetchUserGuilds,
  refreshDiscordToken,
  type DiscordPartialGuild,
} from "@/lib/bot/discord-oauth";

export async function getValidDiscordAccessToken(userId: string): Promise<string | null> {
  const link = await prisma.discordUserLink.findUnique({ where: { userId } });
  if (!link?.accessToken) return null;

  const expires = link.tokenExpiresAt?.getTime() ?? 0;
  const stillValid = expires > Date.now() + 60_000;
  if (stillValid) return link.accessToken;

  if (!link.refreshToken) return link.accessToken; // best effort

  const refreshed = await refreshDiscordToken(link.refreshToken);
  if (!refreshed?.access_token) return null;

  await prisma.discordUserLink.update({
    where: { userId },
    data: {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? link.refreshToken,
      tokenExpiresAt: new Date(Date.now() + (refreshed.expires_in ?? 604800) * 1000),
    },
  });
  return refreshed.access_token;
}

export interface ManageableGuild {
  id: string;
  name: string;
  icon: string | null;
  botInstalled: boolean;
  canManage: boolean;
}

export async function listManageableGuilds(userId: string): Promise<ManageableGuild[]> {
  const token = await getValidDiscordAccessToken(userId);
  if (!token) return [];

  const [userGuilds, botGuilds] = await Promise.all([
    fetchUserGuilds(token),
    fetchBotGuilds(),
  ]);
  const botIds = new Set(botGuilds.map((g) => g.id));

  const manageable = userGuilds.filter(
    (g) => g.owner || canManageGuild(g.permissions),
  );

  // Persist bot-installed guilds we know about
  for (const g of botGuilds) {
    await prisma.discordGuild.upsert({
      where: { id: g.id },
      create: { id: g.id, name: g.name, icon: g.icon },
      update: { name: g.name, icon: g.icon },
    });
  }

  return manageable.map((g: DiscordPartialGuild) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    botInstalled: botIds.has(g.id),
    canManage: true,
  }));
}

export function guildIconUrl(guildId: string, icon: string | null): string | null {
  if (!icon) return null;
  return `https://cdn.discordapp.com/icons/${guildId}/${icon}.png`;
}
