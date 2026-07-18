import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { getBotInviteUrl } from "@/lib/bot/discord-oauth";
import { listManageableGuilds, guildIconUrl } from "@/lib/bot/discord-link-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const link = await prisma.discordUserLink.findUnique({
    where: { userId: session.user.id },
  });
  if (!link) {
    return NextResponse.json({ error: "Discord not linked", guilds: [] }, { status: 400 });
  }

  const guilds = await listManageableGuilds(session.user.id);
  return NextResponse.json({
    guilds: guilds.map((g) => ({
      ...g,
      iconUrl: guildIconUrl(g.id, g.icon),
      inviteUrl: getBotInviteUrl(g.id),
    })),
  });
}
