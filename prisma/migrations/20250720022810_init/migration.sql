/*
  Warnings:

  - You are about to drop the column `thumbUrl` on the `Photo` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "GalleryStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "status" "GalleryStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "thumbUrl",
ADD COLUMN     "date" TIMESTAMP(3);
