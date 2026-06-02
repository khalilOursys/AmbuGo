-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('AMBULANCE', 'VSL', 'TPMR', 'MEDICAL_MOTORBIKE');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'IN_SERVICE', 'IN_MAINTENANCE', 'OUT_OF_SERVICE');

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "permitNumber" TEXT,
    "permitExpiry" TIMESTAMP(3),
    "technicalInspectionDate" TIMESTAMP(3),
    "nextTechnicalInspection" TIMESTAMP(3),
    "insuranceNumber" TEXT,
    "insuranceCompany" TEXT,
    "insuranceExpiry" TIMESTAMP(3),
    "equipment" JSONB,
    "mileage" INTEGER,
    "nextMaintenance" TIMESTAMP(3),
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_registrationNumber_key" ON "Vehicle"("registrationNumber");
