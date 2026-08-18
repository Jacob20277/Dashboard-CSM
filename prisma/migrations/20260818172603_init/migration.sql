-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isStrategic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kra" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "Kra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kpi" (
    "id" TEXT NOT NULL,
    "kraId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "Kpi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "activityDate" DATE NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "notes" TEXT,
    "isUnmatched" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLogKpi" (
    "activityLogId" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLogKpi_pkey" PRIMARY KEY ("activityLogId","kpiId")
);

-- CreateTable
CREATE TABLE "ShareToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "label" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "ShareToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_name_key" ON "Account"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Kra_name_key" ON "Kra"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Kpi_kraId_name_key" ON "Kpi"("kraId", "name");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_activityDate_idx" ON "ActivityLog"("userId", "activityDate");

-- CreateIndex
CREATE INDEX "ActivityLog_accountId_idx" ON "ActivityLog"("accountId");

-- CreateIndex
CREATE INDEX "ActivityLog_isUnmatched_idx" ON "ActivityLog"("isUnmatched");

-- CreateIndex
CREATE UNIQUE INDEX "ShareToken_token_key" ON "ShareToken"("token");

-- AddForeignKey
ALTER TABLE "Kpi" ADD CONSTRAINT "Kpi_kraId_fkey" FOREIGN KEY ("kraId") REFERENCES "Kra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogKpi" ADD CONSTRAINT "ActivityLogKpi_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "ActivityLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogKpi" ADD CONSTRAINT "ActivityLogKpi_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "Kpi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareToken" ADD CONSTRAINT "ShareToken_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
