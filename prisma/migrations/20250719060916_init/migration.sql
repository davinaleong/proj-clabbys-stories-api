/*
  Warnings:

  - You are about to drop the column `passphraseHash` on the `Gallery` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AdminActivityLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[magicLinkToken]` on the table `Gallery` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "LightboxMode" AS ENUM ('BLACK', 'BLURRED');

-- CreateEnum
CREATE TYPE "SortOrder" AS ENUM ('ALPHABETICAL_ASC', 'ALPHABETICAL_DESC', 'NEWEST', 'OLDEST');

-- DropForeignKey
ALTER TABLE "AdminActivityLog" DROP CONSTRAINT "AdminActivityLog_adminId_fkey";

-- AlterTable
ALTER TABLE "Gallery" DROP COLUMN "passphraseHash",
ADD COLUMN     "magicLinkToken" TEXT,
ADD COLUMN     "pinHash" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "role";

-- DropTable
DROP TABLE "AdminActivityLog";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL,
    "applicationName" TEXT NOT NULL,
    "lightboxMode" "LightboxMode" NOT NULL DEFAULT 'BLACK',
    "defaultSortOrder" "SortOrder" NOT NULL DEFAULT 'NEWEST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gallery_magicLinkToken_key" ON "Gallery"("magicLinkToken");
