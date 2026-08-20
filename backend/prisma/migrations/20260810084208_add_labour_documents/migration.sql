-- CreateTable
CREATE TABLE "LabourDocument" (
    "id" SERIAL NOT NULL,
    "labourId" INTEGER NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabourDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LabourDocument" ADD CONSTRAINT "LabourDocument_labourId_fkey" FOREIGN KEY ("labourId") REFERENCES "Labour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
