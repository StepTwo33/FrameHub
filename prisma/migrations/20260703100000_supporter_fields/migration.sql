-- AlterTable
ALTER TABLE "User" ADD COLUMN "supporterAt" DATETIME;

-- CreateTable
CREATE TABLE "DonationEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'buymeacoffee',
    "supporterEmail" TEXT NOT NULL,
    "userId" TEXT,
    "amount" TEXT,
    "eventType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DonationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DonationEvent_externalId_key" ON "DonationEvent"("externalId");
CREATE INDEX "DonationEvent_userId_idx" ON "DonationEvent"("userId");
CREATE INDEX "DonationEvent_supporterEmail_idx" ON "DonationEvent"("supporterEmail");
