-- CreateTable
CREATE TABLE "Payroll" (
    "id" SERIAL NOT NULL,
    "labourId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "presentDays" INTEGER NOT NULL,
    "halfDays" INTEGER NOT NULL,
    "absentDays" INTEGER NOT NULL,
    "totalSalary" DOUBLE PRECISION NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paidDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payroll_labourId_projectId_month_year_key" ON "Payroll"("labourId", "projectId", "month", "year");

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_labourId_fkey" FOREIGN KEY ("labourId") REFERENCES "Labour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
