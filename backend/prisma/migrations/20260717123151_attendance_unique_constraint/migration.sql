/*
  Warnings:

  - A unique constraint covering the columns `[labourId,projectId,date]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Attendance_labourId_projectId_date_key" ON "Attendance"("labourId", "projectId", "date");
