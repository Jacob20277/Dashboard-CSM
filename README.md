# Dashboard-CSM

Internal tool for the Zuper Customer Success team to log daily activity, tag it against a fixed
KPI/KRA taxonomy, and view rollups per account, per person, or for the whole team. Includes a
public read-only share link for managers/SLT.

## Stack

Next.js (App Router) + TypeScript, Prisma (Postgres), Auth.js (Credentials + JWT), shadcn/ui,
Recharts.

## Local setup

1. `npm install`
2. Set `DATABASE_URL` in `.env.local` (a Postgres connection string).
3. Set `AUTH_SECRET` (generate with `npx auth secret`) and `NEXTAUTH_URL=http://localhost:3000`.
4. Set `ADMIN_INITIAL_PASSWORD` — the password for the shared admin login (`engage@zuper.co`).
5. `npx prisma migrate dev`
6. `npm run db:seed` — seeds the 6 KRAs / 12 KPIs and the admin account.
7. `npm run dev`

Log in as `engage@zuper.co` with `ADMIN_INITIAL_PASSWORD`, then use **Users** in the nav to create
the actual team members.

## Roles

- **Admin** (`engage@zuper.co`, shared login) — manages accounts, users, and taxonomy labels; can
  edit or delete any member's activity log entries.
- **Members** — log their own activity and view dashboards; can edit/delete only their own entries.

## Deploying

The `vercel-build` script runs `prisma generate && prisma migrate deploy && next build`, so
migrations apply automatically on deploy. Set `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` (the
production URL), and `ADMIN_INITIAL_PASSWORD` as environment variables on the Vercel project, then
run `npm run db:seed` once against production (e.g. via `vercel env pull` + `dotenv -e
.env.production.local -- npx prisma db seed`) to create the taxonomy and the admin login.
