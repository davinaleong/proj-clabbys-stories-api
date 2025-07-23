/*
  Warnings:

  - The values [EEE_DD_MMM_YYYY,EEEE_DD_MMM_YYYY,EEEE_DD_MMMM_YYYY,DD_MMM_YYYY,DD_MMMM_YYYY,DD_MMM,DD_MMMM] on the enum `DateFormat` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DateFormat_new" AS ENUM ('EEE_D_MMM_YYYY', 'EEEE_D_MMM_YYYY', 'EEEE_D_MMMM_YYYY', 'D_MMM_YYYY', 'D_MMMM_YYYY', 'D_MMM', 'D_MMMM');
ALTER TABLE "AppSetting" ALTER COLUMN "defaultDateFormat" DROP DEFAULT;
ALTER TABLE "AppSetting" ALTER COLUMN "defaultDateFormat" TYPE "DateFormat_new" USING ("defaultDateFormat"::text::"DateFormat_new");
ALTER TYPE "DateFormat" RENAME TO "DateFormat_old";
ALTER TYPE "DateFormat_new" RENAME TO "DateFormat";
DROP TYPE "DateFormat_old";
ALTER TABLE "AppSetting" ALTER COLUMN "defaultDateFormat" SET DEFAULT 'EEE_D_MMM_YYYY';
COMMIT;

-- AlterTable
ALTER TABLE "AppSetting" ALTER COLUMN "defaultDateFormat" SET DEFAULT 'EEE_D_MMM_YYYY';
