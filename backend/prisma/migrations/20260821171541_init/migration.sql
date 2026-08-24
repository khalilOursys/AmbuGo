/*
  Warnings:

  - You are about to drop the column `hospitalId` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the `Hospital` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('HOSPITAL', 'CLINIC', 'MEDICAL_CENTER', 'PHARMACY', 'NURSING_HOME', 'RESIDENCE', 'OTHER');

-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_hospitalId_fkey";

-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "hospitalId",
ADD COLUMN     "locationId" TEXT;

-- DropTable
DROP TABLE "Hospital";

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL DEFAULT 'HOSPITAL',
    "phone" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "website" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Location_name_idx" ON "Location"("name");

-- CreateIndex
CREATE INDEX "Location_type_idx" ON "Location"("type");

-- CreateIndex
CREATE INDEX "Location_latitude_longitude_idx" ON "Location"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Mission_locationId_idx" ON "Mission"("locationId");

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
