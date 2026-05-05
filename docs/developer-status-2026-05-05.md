# Voxhoo Clinic Developer Status

Date: 2026-05-05

## Purpose

This document is a practical handoff/report for developers who want to continue the current MVP safely without rediscovering the project shape from scratch.

It covers:
- what the app does today
- current architecture boundaries
- how appointment requests work
- how slot holding works
- how email notifications work
- what manual Neon steps have been used so far
- what is still intentionally out of scope

## Product State

Voxhoo Clinic is currently a clinic discovery MVP with lightweight appointment-request capture.

The main user-facing flows are:
- homepage category discovery
- category results page with list + map
- mobile map-first browsing with a bottom-sheet clinic list
- clinic detail drawer with time-slot selection
- appointment request submission
- admin request review and status updates

## Main Routes

- `/`
- `/clinics/[category]`
- `/admin/requests`

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Google Places API
- Google Maps JavaScript API
- Neon Postgres
- Drizzle ORM
- Resend

## Current Architecture

### Database layer

Main DB files:
- `src/db/schema.ts`
- `src/db/index.ts`

Current DB responsibilities:
- schema definition
- clinic and time-slot reads
- appointment request creation
- slot hold mutation
- admin request query
- admin request status update

### Server actions

Current actions:
- `src/app/actions/create-appointment-request.ts`
- `src/app/actions/update-appointment-request-status.ts`

Current action pattern:
- actions stay thin
- validation and persistence are handled in the DB layer
- email orchestration is delegated to a helper

### Email helper

- `src/lib/appointment-request-email.ts`

This helper sends:
- admin notification email
- patient confirmation email

Email sending is best-effort and does not block request success.

## Appointment Request Flow

Current request flow:

1. User opens a clinic drawer
2. User selects an available slot
3. User opens `Request this time`
4. User submits:
   - name
   - email
   - phone
   - note
5. Server validates:
   - name required
   - email or phone required
   - email format if email exists
   - slot must still be `available`
   - `HH:mm` start time normalized to `HH:mm:ss`
6. DB performs an atomic SQL operation:
   - update matching slot from `available` to `pending`
   - insert row into `appointment_requests`
7. App sends:
   - admin notification email
   - patient confirmation email if patient email exists
8. Admin can review the request in `/admin/requests`

## Slot Lifecycle

Current `clinic_time_slots.status` lifecycle:

- `available`
- `pending`
- `booked`
- `cancelled`

Current meaning:
- `available`: visible in the UI and requestable
- `pending`: temporarily held after request submit
- `booked`: reserved/final state for a later checkout flow
- `cancelled`: unavailable

Important:
- the UI currently only treats `available` as selectable
- `pending` is intentionally hidden from future users
- there is not yet a release flow for abandoned pending holds
- there is not yet a `pending -> booked` checkout completion flow

## Admin Request Lifecycle

Current `appointment_requests.status` values:

- `pending`
- `contacted`
- `closed`

Admin behavior today:
- `/admin/requests` is forced dynamic
- requests join with clinic names
- newest items show first
- status is editable inline
- status saves immediately

## Email Configuration

Required env vars for email:

```env
RESEND_API_KEY=...
RESEND_FROM_EMAIL=notifications@yourdomain.com
APPOINTMENT_REQUEST_NOTIFICATION_EMAIL=inbox@yourdomain.com
```

Current behavior:
- admin notification goes to `APPOINTMENT_REQUEST_NOTIFICATION_EMAIL`
- patient confirmation goes to submitted patient email
- email failures are logged but do not block appointment request success

## Manual Neon / SQL Notes

There have been intentional manual DB steps in this MVP.

### 1. `appointment_requests` table

This table was created with a safe manual SQL migration rather than relying on `drizzle push`.

### 2. Slot status enum

The `pending` value must exist in Neon:

```sql
ALTER TYPE clinic_time_slot_status ADD VALUE IF NOT EXISTS 'pending';
```

### 3. Index

There is also a manual index recommendation for request lookups:

```sql
CREATE INDEX IF NOT EXISTS idx_appointment_requests_clinic_date
ON appointment_requests (clinic_id, slot_date);
```

## Local Setup Checklist

1. Install dependencies
```bash
npm install
```

2. Configure `.env.local`
```env
GOOGLE_PLACES_API_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
DATABASE_URL=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
APPOINTMENT_REQUEST_NOTIFICATION_EMAIL=...
```

3. Make sure Neon includes the manual SQL changes above

4. Start dev server
```bash
npm run dev
```

5. Validate production build
```bash
npm run build
```

## Current UI Notes

### Mobile

- mobile results use a full-screen map
- clinic list is a bottom sheet over the map
- search is available through the hamburger menu
- clinic drawer works on mobile with scroll fixes

### Desktop / tablet

- results page remains list + map
- top area has been simplified
- admin requests page is intentionally minimal

## What Is Working

- category discovery
- results list + map flow
- mobile bottom-sheet browsing
- typed category and location search suggestions
- clinic drawer availability UI
- appointment request validation
- temporary slot hold on request submit
- admin request list
- inline admin status updates
- admin notification email
- patient confirmation email

## What Is Not Built Yet

Still intentionally out of scope:
- auth
- payments
- checkout
- final booking completion
- automatic expiration/release of `pending` slots
- clinic dashboards
- advanced admin tooling
- filters/search expansion beyond current MVP needs

## Recommended Next Steps

### Highest-value product steps

1. Define the checkout transition:
   - `pending -> booked`

2. Define abandoned hold behavior:
   - `pending -> available`

3. Add lightweight tests for:
   - appointment request validation
   - slot hold behavior
   - admin status updates

### Operational cleanup

1. Convert manual schema changes into an explicit migration history
2. Decide whether `appointment_requests.status` should also become a DB enum
3. Add small docs whenever slot lifecycle rules change

## Recommended Working Rules For Future Devs

- Do not use `db:push` casually against production-like data
- Prefer safe manual SQL or explicit migrations for schema changes
- Keep server actions thin
- Keep DB logic centralized in `src/db/index.ts`
- Keep email logic in `src/lib/appointment-request-email.ts`
- Treat slot state and request state as separate concepts

## Quick Commands

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:seed
npm run db:import:places
```
