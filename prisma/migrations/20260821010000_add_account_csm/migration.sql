-- AlterTable
ALTER TABLE "Account" ADD COLUMN "csmUserId" TEXT;

-- CreateIndex
CREATE INDEX "Account_csmUserId_idx" ON "Account"("csmUserId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_csmUserId_fkey" FOREIGN KEY ("csmUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
