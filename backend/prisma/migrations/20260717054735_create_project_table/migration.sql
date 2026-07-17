/*
  Warnings:

  - You are about to drop the column `joiningDate` on the `Labour` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Labour` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Labour" DROP COLUMN "joiningDate",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "projectName" TEXT NOT NULL,
    "siteAddress" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
