# Phase 6: Safe Database Fallback

Date: 2026-04-28
Status: Completed

## Objective

Prevent the homepage and category pages from crashing when the live clinic database is missing, unavailable, or returns an error.

## Delivered

- Added a shared mock clinic dataset for reuse across fallback and seed flows.
- Added safe clinic fetch helpers in `src/db/index.ts`.
- Added graceful fallback behavior for:
  missing `DATABASE_URL`,
  unavailable Neon connection,
  failed clinic queries.
- Updated the homepage to keep rendering even when live DB access fails.
- Updated category pages to keep rendering even when live DB access fails.
- Added a small reusable warning component that appears only when fallback is active.
- Updated the seed script to reuse the same mock clinic source.

## Main Files

- `src/lib/mock-clinics.ts`
- `src/db/index.ts`
- `src/components/data-notice.tsx`
- `src/app/page.tsx`
- `src/app/clinics/[category]/page.tsx`
- `src/db/seed.ts`

## Behavior After This Phase

- If `DATABASE_URL` is missing, the UI still works with sample Toronto clinics.
- If Neon is unavailable, the UI still works with sample Toronto clinics.
- If a DB query throws, the UI still works with sample Toronto clinics.
- A friendly warning is shown only when useful.

## Validation

- `npm run lint`
- `npm run build`
- Build verified with `DATABASE_URL` removed
- Build verified with an invalid `DATABASE_URL`
- Safe fetch helpers verified directly with fallback responses

## Outcome

The app is now much more resilient for demo and MVP usage because a database outage no longer breaks the main browsing flow.
