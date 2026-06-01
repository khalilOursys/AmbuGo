-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COMMERCIAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telephone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "cin" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'COMMERCIAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
