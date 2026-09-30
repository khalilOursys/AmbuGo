/*
  Warnings:

  - The values [PER_KM,DISTANCE_RANGE] on the enum `PricingType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `logoId` on the `Company` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "PricingType_new" AS ENUM ('FIXED', 'HOURLY', 'DISTANCE', 'CUSTOM');
ALTER TABLE "Company" ALTER COLUMN "pricingType" DROP DEFAULT;
ALTER TABLE "Company" ALTER COLUMN "pricingType" TYPE "PricingType_new" USING ("pricingType"::text::"PricingType_new");
ALTER TYPE "PricingType" RENAME TO "PricingType_old";
ALTER TYPE "PricingType_new" RENAME TO "PricingType";
DROP TYPE "PricingType_old";
ALTER TABLE "Company" ALTER COLUMN "pricingType" SET DEFAULT 'FIXED';
COMMIT;

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_logoId_fkey";

-- DropIndex
DROP INDEX "Company_logoId_key";

-- DropIndex
DROP INDEX "Company_name_key";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "logoId",
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'TN',
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "defaultPaymentTerms" INTEGER DEFAULT 30,
ADD COLUMN     "deletedById" TEXT,
ADD COLUMN     "fax" TEXT,
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "invoicePrefix" TEXT DEFAULT 'INV-',
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'fr-TN',
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "plan" TEXT DEFAULT 'free',
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "settings" JSONB DEFAULT '{}',
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3),
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Africa/Tunis',
ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ADD COLUMN     "updatedById" TEXT,
ADD COLUMN     "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "website" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Company_slug_idx" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_email_idx" ON "Company"("email");

-- CreateIndex
CREATE INDEX "Company_phone_idx" ON "Company"("phone");

-- CreateIndex
CREATE INDEX "Company_matriculeFiscale_idx" ON "Company"("matriculeFiscale");

-- CreateIndex
CREATE INDEX "Company_status_idx" ON "Company"("status");

-- CreateIndex
CREATE INDEX "Company_createdAt_idx" ON "Company"("createdAt");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
