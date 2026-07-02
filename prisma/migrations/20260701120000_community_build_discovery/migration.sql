-- AlterTable
ALTER TABLE "Build" ADD COLUMN "itemId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Build" ADD COLUMN "upvoteCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BuildVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BuildVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BuildVote_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Build_isPublic_type_updatedAt_idx" ON "Build"("isPublic", "type", "updatedAt");
CREATE INDEX "Build_isPublic_type_upvoteCount_idx" ON "Build"("isPublic", "type", "upvoteCount");
CREATE INDEX "Build_isPublic_itemId_idx" ON "Build"("isPublic", "itemId");
CREATE UNIQUE INDEX "BuildVote_userId_buildId_key" ON "BuildVote"("userId", "buildId");
CREATE INDEX "BuildVote_buildId_idx" ON "BuildVote"("buildId");

-- Backfill itemId from existing build data JSON
UPDATE "Build" SET "itemId" = json_extract("data", '$.weaponId') WHERE "type" = 'weapon' AND "itemId" = '';
UPDATE "Build" SET "itemId" = json_extract("data", '$.warframeId') WHERE "type" = 'warframe' AND "itemId" = '';
UPDATE "Build" SET "itemId" = json_extract("data", '$.companionId') WHERE "type" = 'companion' AND "itemId" = '';
UPDATE "Build" SET "itemId" = COALESCE(
  json_extract("data", '$.modularType') || ':' || COALESCE(
    json_extract("data", '$.parts.chamber'),
    json_extract("data", '$.parts.strike'),
    json_extract("data", '$.parts.prism'),
    ''
  ),
  json_extract("data", '$.modularType'),
  ''
) WHERE "type" = 'modular' AND "itemId" = '';
UPDATE "Build" SET "itemId" = COALESCE(json_extract("data", '$.frameId'), json_extract("data", '$.weaponId'), '') WHERE "type" = 'archwing' AND "itemId" = '';
UPDATE "Build" SET "itemId" = COALESCE(json_extract("data", '$.reactorId'), 'railjack') WHERE "type" = 'railjack' AND "itemId" = '';
