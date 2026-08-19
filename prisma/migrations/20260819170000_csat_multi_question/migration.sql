-- CreateTable
CREATE TABLE "CsatLinkQuestion" (
    "id" TEXT NOT NULL,
    "csatLinkId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "CsatLinkQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CsatAnswer" (
    "id" TEXT NOT NULL,
    "csatResponseId" TEXT NOT NULL,
    "csatLinkQuestionId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "CsatAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CsatTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CsatTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CsatTemplateQuestion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "CsatTemplateQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CsatLinkQuestion_csatLinkId_idx" ON "CsatLinkQuestion"("csatLinkId");

-- CreateIndex
CREATE INDEX "CsatAnswer_csatResponseId_idx" ON "CsatAnswer"("csatResponseId");

-- CreateIndex
CREATE INDEX "CsatAnswer_csatLinkQuestionId_idx" ON "CsatAnswer"("csatLinkQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "CsatTemplate_name_key" ON "CsatTemplate"("name");

-- CreateIndex
CREATE INDEX "CsatTemplateQuestion_templateId_idx" ON "CsatTemplateQuestion"("templateId");

-- DataMigration: give every pre-existing CsatLink a default "Overall satisfaction"
-- question so links generated before this change keep working, and carry each
-- existing CsatResponse's old flat score over as that question's answer.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO "CsatLinkQuestion" ("id", "csatLinkId", "text", "sortOrder")
SELECT gen_random_uuid()::text, "id", 'Overall satisfaction', 0
FROM "CsatLink";

INSERT INTO "CsatAnswer" ("id", "csatResponseId", "csatLinkQuestionId", "score")
SELECT gen_random_uuid()::text, "CsatResponse"."id", "CsatLinkQuestion"."id", "CsatResponse"."score"
FROM "CsatResponse"
JOIN "CsatLinkQuestion"
  ON "CsatLinkQuestion"."csatLinkId" = "CsatResponse"."csatLinkId"
  AND "CsatLinkQuestion"."text" = 'Overall satisfaction'
  AND "CsatLinkQuestion"."sortOrder" = 0;

-- AlterTable
ALTER TABLE "CsatResponse" DROP COLUMN "score";

-- AddForeignKey
ALTER TABLE "CsatLinkQuestion" ADD CONSTRAINT "CsatLinkQuestion_csatLinkId_fkey" FOREIGN KEY ("csatLinkId") REFERENCES "CsatLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsatAnswer" ADD CONSTRAINT "CsatAnswer_csatResponseId_fkey" FOREIGN KEY ("csatResponseId") REFERENCES "CsatResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsatAnswer" ADD CONSTRAINT "CsatAnswer_csatLinkQuestionId_fkey" FOREIGN KEY ("csatLinkQuestionId") REFERENCES "CsatLinkQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsatTemplateQuestion" ADD CONSTRAINT "CsatTemplateQuestion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CsatTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
