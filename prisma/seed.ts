import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const TAXONOMY = [
  {
    kra: "Retention and Renewals",
    kpis: ["Renewal Rate", "Churn Risk Management"],
  },
  {
    kra: "Product Adoption",
    kpis: ["Feature Adoption", "Adoption Improvement Activities"],
  },
  {
    kra: "EBR and MBR",
    kpis: ["Monthly Business Reviews", "Executive Business Reviews"],
  },
  {
    kra: "Upselling",
    kpis: ["Upsell Opportunities", "Upsell Conversion"],
  },
  {
    kra: "CSAT and Reviews",
    kpis: ["CSAT Score", "Customer Reviews"],
  },
  {
    kra: "Zuper Culture",
    kpis: [
      "Login Hours and Availability",
      "Documentation and Collaboration",
      "CRM Hygiene and Collaboration",
    ],
  },
];

async function seedTaxonomy() {
  for (let kraIndex = 0; kraIndex < TAXONOMY.length; kraIndex++) {
    const { kra, kpis } = TAXONOMY[kraIndex];
    const kraRow = await prisma.kra.upsert({
      where: { name: kra },
      update: { sortOrder: kraIndex },
      create: { name: kra, sortOrder: kraIndex },
    });

    for (let kpiIndex = 0; kpiIndex < kpis.length; kpiIndex++) {
      await prisma.kpi.upsert({
        where: { kraId_name: { kraId: kraRow.id, name: kpis[kpiIndex] } },
        update: { sortOrder: kpiIndex },
        create: { kraId: kraRow.id, name: kpis[kpiIndex], sortOrder: kpiIndex },
      });
    }
  }
  console.log(`Seeded ${TAXONOMY.length} KRAs and ${TAXONOMY.reduce((n, t) => n + t.kpis.length, 0)} KPIs.`);
}

async function seedAdmin() {
  const email = "engage@zuper.co";
  const plaintextPassword = process.env.ADMIN_INITIAL_PASSWORD ?? generateRandomPassword();
  const passwordHash = await bcrypt.hash(plaintextPassword, 10);

  const existing = await prisma.user.findUnique({ where: { email } });

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Admin",
      email,
      passwordHash,
      role: "ADMIN",
      mustChangePassword: false,
    },
  });

  if (!existing) {
    if (!process.env.ADMIN_INITIAL_PASSWORD) {
      console.log(`Created admin ${email} with generated password: ${plaintextPassword}`);
      console.log("Set ADMIN_INITIAL_PASSWORD to control this instead of relying on a generated one.");
    } else {
      console.log(`Created admin ${email} using ADMIN_INITIAL_PASSWORD.`);
    }
  } else {
    console.log(`Admin ${email} already exists, left password unchanged.`);
  }
}

function generateRandomPassword() {
  return randomBytes(9).toString("base64url");
}

async function main() {
  await seedTaxonomy();
  await seedAdmin();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
