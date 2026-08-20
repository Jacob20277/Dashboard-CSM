-- CreateTable
CREATE TABLE "PendingActivityImport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rawAccountName" TEXT NOT NULL,
    "activityDate" DATE NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "notes" TEXT,
    "kpiIds" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingActivityImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingActivityImport_userId_idx" ON "PendingActivityImport"("userId");

-- AddForeignKey
ALTER TABLE "PendingActivityImport" ADD CONSTRAINT "PendingActivityImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
