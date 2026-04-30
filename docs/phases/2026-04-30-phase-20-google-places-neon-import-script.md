# Phase 20: Google Places Neon Import Script

Date: 2026-04-30
Status: Completed

## Objective

Add one minimal database script that fetches Google Places clinics by category and area, then inserts new rows into the existing Neon `clinics` table.

## Delivered

- Added `src/db/import-google-places.ts`.
- Added the `db:import:places` package script.
- Reused the existing Drizzle DB connection and clinic schema.
- Added `google_place_id` to the Drizzle schema for imported rows.
- Skipped already imported rows by checking existing `google_place_id` values before insert.
- Kept all changes server-side with no UI changes and no API route.

## Main Files

- `src/db/import-google-places.ts`
- `src/db/schema.ts`
- `package.json`

## Validation

- `npm test`
- `npm run lint`
- `npm run build`
