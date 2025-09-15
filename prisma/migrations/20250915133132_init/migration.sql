/*
  Warnings:

  - You are about to drop the column `lightboxMode` on the `AppSetting` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "LightboxMode" ADD VALUE 'SLIDESHOW';

-- AlterTable
ALTER TABLE "AppSetting" DROP COLUMN "lightboxMode";

-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN     "lightboxMode" "LightboxMode" NOT NULL DEFAULT 'BLACK';
