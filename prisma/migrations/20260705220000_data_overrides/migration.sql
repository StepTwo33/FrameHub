-- Shared staff data overrides (one row per target; visible site-wide)
CREATE TABLE "DataOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fields" JSON NOT NULL DEFAULT '{}',
    "note" TEXT NOT NULL DEFAULT '',
    "authorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DataOverride_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "DataOverride_targetType_targetId_key" ON "DataOverride"("targetType", "targetId");
CREATE INDEX "DataOverride_targetType_idx" ON "DataOverride"("targetType");
