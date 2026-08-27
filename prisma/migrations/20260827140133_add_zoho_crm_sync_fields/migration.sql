-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "annualRecurringRevenue" DECIMAL(14,2),
ADD COLUMN     "churnNote" TEXT,
ADD COLUMN     "churnReason" TEXT,
ADD COLUMN     "healthBucket" TEXT,
ADD COLUMN     "healthStatus" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "projectStatus" TEXT,
ADD COLUMN     "recoveryPlanNotes" TEXT,
ADD COLUMN     "renewalDateOverride" DATE,
ADD COLUMN     "tier" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "workflowsEnabledCount" INTEGER,
ADD COLUMN     "workflowsEnabledList" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "zohoAccountId" TEXT;

-- CreateTable
CREATE TABLE "CrmDeal" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "zohoRecordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pipeline" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "dealType" TEXT,
    "renewalStatus" TEXT,
    "renewalType" TEXT,
    "renewalDate" DATE,
    "isRenewal" BOOLEAN NOT NULL DEFAULT false,
    "amount" DECIMAL(14,2),
    "closingDate" DATE,
    "renewalOutreachAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmDeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrmDeal_zohoRecordId_key" ON "CrmDeal"("zohoRecordId");

-- CreateIndex
CREATE INDEX "CrmDeal_accountId_idx" ON "CrmDeal"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_zohoAccountId_key" ON "Account"("zohoAccountId");

-- AddForeignKey
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

