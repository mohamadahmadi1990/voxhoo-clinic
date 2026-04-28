# Phase 2: Neon + Drizzle Clinic Storage

Date: 2026-04-27
Status: Completed

## Objective

Replace clinic mock usage in the category results flow with a simple hosted database setup using Neon and Drizzle.

## Scope for This Phase

- Add database infrastructure only for clinics
- Keep the schema minimal
- No auth tables
- No user records
- No booking or management workflows

## Delivered

- Added `drizzle.config.ts`.
- Added the Drizzle schema in `src/db/schema.ts`.
- Added the DB client and query helpers in `src/db/index.ts`.
- Added a seed script in `src/db/seed.ts`.
- Created a single `clinics` table with:
  `id`, `name`, `category`, `address`, `lat`, `lng`, `rating`, `phone`, `createdAt`.
- Generated a migration under `drizzle/`.
- Seeded sample Toronto clinic data.
- Updated `/clinics/[category]` to fetch clinics from the database instead of the old mock-only flow.

## Main Files

- `drizzle.config.ts`
- `src/db/schema.ts`
- `src/db/index.ts`
- `src/db/seed.ts`
- `drizzle/0000_happy_ma_gnuci.sql`
- `src/app/clinics/[category]/page.tsx`

## Outcome

Clinic content moved from local-only mock behavior to a hosted PostgreSQL-backed source while preserving the same MVP user experience.

## Notes

This phase deliberately kept persistence narrow:
one table, one seed path, and no expansion into wider SaaS features.
