import { execSync } from "node:child_process";

const MAX_ATTEMPTS = 5;
const DELAY_MS = 8000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      return;
    } catch {
      if (attempt === MAX_ATTEMPTS) {
        console.error(`prisma migrate deploy failed after ${MAX_ATTEMPTS} attempts, giving up.`);
        process.exit(1);
      }
      console.warn(
        `prisma migrate deploy failed (attempt ${attempt}/${MAX_ATTEMPTS}) — likely the database waking up from idle. Retrying in ${DELAY_MS / 1000}s...`
      );
      await sleep(DELAY_MS);
    }
  }
}

main();
