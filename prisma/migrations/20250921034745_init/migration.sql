/*
  Warnings:

  - The `status` column on the `Gallery` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lightboxMode` column on the `Gallery` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN     "spotifyPlaylistUrl" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT',
DROP COLUMN "lightboxMode",
ADD COLUMN     "lightboxMode" TEXT NOT NULL DEFAULT 'BLACK';
