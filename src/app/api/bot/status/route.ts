import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import {
  discordConfigured,
  getBotInviteUrl,
  getDiscordClientId,
} from "@/lib/bot/discord-oauth";

export async function GET() {
  const session = await getSession();
  const configured = discordConfigured();
  let link = null;
  if (session?.user?.id) {
    link = await prisma.discordUserLink.findUnique({
      where: { userId: session.user.id },
      select: {
        discordId: true,
        username: true,
        avatar: true,
        updatedAt: true,
      },
    });
  }

  return NextResponse.json({
    configured,
    clientId: getDiscordClientId(),
    inviteUrl: getBotInviteUrl() ?? null,
    authenticated: !!session?.user,
    discordLink: link,
  });
}
