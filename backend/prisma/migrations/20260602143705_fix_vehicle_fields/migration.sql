/*
  Warnings:

  - You are about to drop the column `equipment` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceExpiry` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceNumber` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `nextMaintenance` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `nextTechnicalInspection` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `permitExpiry` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `permitNumber` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `registrationNumber` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `technicalInspectionDate` on the `Vehicle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[licensePlate]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `licensePlate` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Vehicle_registrationNumber_key";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "equipment",
DROP COLUMN "insuranceExpiry",
DROP COLUMN "insuranceNumber",
DROP COLUMN "nextMaintenance",
DROP COLUMN "nextTechnicalInspection",
DROP COLUMN "permitExpiry",
DROP COLUMN "permitNumber",
DROP COLUMN "registrationNumber",
DROP COLUMN "technicalInspectionDate",
ADD COLUMN     "insuranceExpiryDate" TIMESTAMP(3),
ADD COLUMN     "insurancePolicyNo" TEXT,
ADD COLUMN     "licensePlate" TEXT NOT NULL,
ADD COLUMN     "maintenancePlan" TEXT,
ADD COLUMN     "medicalEquipment" TEXT,
ADD COLUMN     "nextTechnicalControl" TIMESTAMP(3),
ADD COLUMN     "sanitaryApprovalNo" TEXT,
ADD COLUMN     "sanitaryExpiryDate" TIMESTAMP(3),
ADD COLUMN     "technicalControlDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");
