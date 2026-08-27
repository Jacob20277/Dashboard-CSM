import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BACKUP_PATH = path.join(__dirname, "..", "backups", "db-backup.json");

// Parents before children, mirroring the FK dependencies in prisma/schema.prisma.
// Restore inserts in this order; a full restore deletes in the reverse order first.
const RESTORE_ORDER = [
  "user",
  "kra",
  "kpi",
  "account",
  "activityLog",
  "activityLogKpi",
  "crmDeal",
  "pendingActivityImport",
  "shareToken",
  "csatTemplate",
  "csatTemplateQuestion",
  "csatLink",
  "csatLinkQuestion",
  "csatResponse",
  "csatAnswer",
] as const;

async function main() {
  if (!fs.existsSync(BACKUP_PATH)) {
    console.error(`No backup found at ${BACKUP_PATH}. Run "npm run db:backup" first.`);
    process.exit(1);
  }

  const { generatedAt, data } = JSON.parse(fs.readFileSync(BACKUP_PATH, "utf8")) as {
    generatedAt: string;
    data: Record<string, unknown[]>;
  };

  const rowCounts = Object.fromEntries(RESTORE_ORDER.map((m) => [m, (data[m] ?? []).length]));

  console.log(`Backup file generated at: ${generatedAt}`);
  console.log("Rows that would be restored:", rowCounts);

  const confirmed = process.argv.includes("--yes");
  if (!confirmed) {
    console.log(
      "\nDry run only. Restoring DELETES ALL CURRENT DATA in every table above and replaces it " +
        'with the backup above — this cannot be undone. Re-run with "--yes" to actually do it:\n' +
        "  npm run db:restore -- --yes"
    );
    return;
  }

  console.log("\nRestoring: deleting current data, then reinserting from the backup...");

  await prisma.$transaction(
    async (tx) => {
      for (const model of [...RESTORE_ORDER].reverse()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (tx as any)[model].deleteMany({});
      }
      for (const model of RESTORE_ORDER) {
        const rows = data[model] ?? [];
        if (rows.length === 0) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (tx as any)[model].createMany({ data: rows });
      }
    },
    { timeout: 120_000 }
  );

  console.log("Restore complete.");
  console.log(rowCounts);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
