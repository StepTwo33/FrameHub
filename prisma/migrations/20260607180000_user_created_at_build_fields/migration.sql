-- AlterTable
ALTER TABLE "User" ADD COLUMN "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Build" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Build" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Build_isPublic_idx" ON "Build"("isPublic");
