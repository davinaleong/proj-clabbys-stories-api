/*
  Warnings:

  - You are about to drop the column `magicLinkToken` on the `Gallery` table. All the data in the column will be lost.
  - You are about to drop the column `pinHash` on the `Gallery` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Gallery_magicLinkToken_key";

-- AlterTable
ALTER TABLE "Gallery" DROP COLUMN "magicLinkToken",
DROP COLUMN "pinHash",
ADD COLUMN     "passphraseHash" TEXT;
