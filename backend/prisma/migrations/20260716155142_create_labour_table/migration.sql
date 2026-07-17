-- CreateTable
CREATE TABLE "Labour" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "aadhaarNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "dailyWage" DOUBLE PRECISION NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Labour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Labour_mobileNumber_key" ON "Labour"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Labour_aadhaarNumber_key" ON "Labour"("aadhaarNumber");
