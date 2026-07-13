-- CreateTable
CREATE TABLE "DiscordUserLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "username" TEXT,
    "discriminator" TEXT,
    "avatar" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiscordUserLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscordGuild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DiscordGuildConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'pc',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    CONSTRAINT "DiscordGuildConfig_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "DiscordGuild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AlertRoute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "mentionRoleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AlertRoute_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "DiscordGuild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorldstateFingerprint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordUserLink_userId_key" ON "DiscordUserLink"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordUserLink_discordId_key" ON "DiscordUserLink"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordGuildConfig_guildId_key" ON "DiscordGuildConfig"("guildId");

-- CreateIndex
CREATE INDEX "AlertRoute_guildId_eventType_enabled_idx" ON "AlertRoute"("guildId", "eventType", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "AlertRoute_guildId_channelId_eventType_key" ON "AlertRoute"("guildId", "channelId", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "WorldstateFingerprint_platform_eventType_key" ON "WorldstateFingerprint"("platform", "eventType");
