/*
  Warnings:

  - You are about to drop the column `isPublished` on the `Gallery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gallery" DROP COLUMN "isPublished";

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;
