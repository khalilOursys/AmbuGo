/*
  Warnings:

  - The values [COMMERCIAL] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [IN_SERVICE,IN_MAINTENANCE] on the enum `VehicleStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[cin]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `firstName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'DISPATCHER', 'SUPERVISOR', 'DRIVER', 'PARAMEDIC', 'DOCTOR');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'DRIVER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "VehicleStatus_new" AS ENUM ('AVAILABLE', 'ASSIGNED', 'ON_MISSION', 'MAINTENANCE', 'OUT_OF_SERVICE');
ALTER TABLE "Vehicle" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Vehicle" ALTER COLUMN "status" TYPE "VehicleStatus_new" USING ("status"::text::"VehicleStatus_new");
ALTER TYPE "VehicleStatus" RENAME TO "VehicleStatus_old";
ALTER TYPE "VehicleStatus_new" RENAME TO "VehicleStatus";
DROP TYPE "VehicleStatus_old";
ALTER TABLE "Vehicle" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'DRIVER';

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "model" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_cin_key" ON "User"("cin");
