import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Every model in prisma/schema.prisma, mapped to its PrismaClient delegate name.
const MODELS = [
  "user",
  "account",
  "kra",
  "kpi",
  "activityLog",
  "pendingActivityImport",
  "activityLogKpi",
  "crmDeal",
  "shareToken",
  "csatLink",
  "csatLinkQuestion",
  "csatResponse",
  "csatAnswer",
  "csatTemplate",
  "csatTemplateQuestion",
] as const;

async function main() {
  const data: Record<string, unknown[]> = {};

  for (const model of MODELS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data[model] = await (prisma as any)[model].findMany();
  }

  const outDir = path.join(__dirname, "..", "backups");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "db-backup.json");

  fs.writeFileSync(
    outPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), data }, null, 2)
  );

  const rowCounts = Object.fromEntries(
    Object.entries(data).map(([model, rows]) => [model, rows.length])
  );
  console.log(`Backup written to ${outPath}`);
  console.log(rowCounts);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
