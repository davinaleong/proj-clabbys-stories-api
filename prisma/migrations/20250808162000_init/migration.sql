/*
  Warnings:

  - You are about to drop the column `userId` on the `Gallery` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Gallery" DROP CONSTRAINT "Gallery_userId_fkey";

-- AlterTable
ALTER TABLE "Gallery" DROP COLUMN "userId";
