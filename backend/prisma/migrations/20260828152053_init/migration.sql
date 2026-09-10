-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "companyId" TEXT;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "companyId" TEXT;

-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "companyId" TEXT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "companyId" TEXT;

-- CreateIndex
CREATE INDEX "Contract_companyId_idx" ON "Contract"("companyId");

-- CreateIndex
CREATE INDEX "Location_companyId_idx" ON "Location"("companyId");

-- CreateIndex
CREATE INDEX "Mission_companyId_idx" ON "Mission"("companyId");

-- CreateIndex
CREATE INDEX "Patient_companyId_idx" ON "Patient"("companyId");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
