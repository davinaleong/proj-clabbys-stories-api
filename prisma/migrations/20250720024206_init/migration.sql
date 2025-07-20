-- CreateEnum
CREATE TYPE "DateFormat" AS ENUM ('EEE_DD_MMM_YYYY', 'EEEE_DD_MMM_YYYY', 'EEEE_DD_MMMM_YYYY', 'DD_MMM_YYYY', 'DD_MMMM_YYYY', 'DD_MMM', 'DD_MMMM');

-- AlterTable
ALTER TABLE "AppSetting" ADD COLUMN     "defaultDateFormat" "DateFormat" NOT NULL DEFAULT 'EEE_DD_MMM_YYYY';
