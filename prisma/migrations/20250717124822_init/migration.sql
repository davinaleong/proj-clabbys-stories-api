/*
  Warnings:

  - You are about to drop the column `passphrase` on the `Gallery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gallery" DROP COLUMN "passphrase",
ADD COLUMN     "passphraseHash" TEXT;
