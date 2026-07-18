-- AlterTable
ALTER TABLE "User" ADD COLUMN "newsletterOptIn" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN "adminReply" TEXT NOT NULL DEFAULT '';
