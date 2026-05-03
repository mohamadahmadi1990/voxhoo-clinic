# Voxhoo Clinic Developer Status

Date: 2026-05-02

## Current Product State

Voxhoo Clinic is a working MVP for clinic discovery and appointment request capture.

The main shipped pieces are:
- homepage category discovery
- category results page with list + map
- mobile-first Airbnb-style map browsing with a bottom-sheet clinic list
- clinic detail drawer with availability display
- appointment request submission flow
- admin request review page

## Key User Flows

### 1. Discovery
- User lands on `/`
- User chooses a clinic category and optional date/location
- User navigates to `/clinics/[category]`

### 2. Results Browsing
- Desktop/tablet:
  - split list + map layout remains active
- Mobile:
  - full-screen map
  - bottom-sheet clinic drawer with collapsed / mid / expanded states
  - mobile search moved into hamburger menu
  - top category rail hidden on mobile

### 3. Clinic Detail
- User opens `Check availability`
- Drawer shows clinic details, date, time slots, and request form

### 4. Appointment Request
- User selects an available slot
- User opens `Request this time`
- User submits:
  - name
  - email
  - phone
  - note
- App validates and inserts into `appointment_requests`
- Request does not book or lock the slot

### 5. Admin Review
- Admin visits `/admin/requests`
- Page joins request rows with clinic names
- Page is forced dynamic to avoid stale Vercel cache

## Database State

Current relevant tables:
- `clinics`
- `clinic_time_slots`
- `appointment_requests`

Current appointment request rules:
- `patientName` required
- `patientEmail` or `patientPhone` required
- basic email validation when email exists
- slot must exist and have `status = available`
- `startTime` normalized from `HH:mm` to `HH:mm:ss`
- insert only, no slot mutation

## Email Notification State

Appointment request email notification is wired through Resend:
- file: `src/app/actions/create-appointment-request.ts`
- env var: `RESEND_API_KEY`
- current behavior:
  - DB insert happens first
  - email send is best-effort
  - email failures do not block success

Important:
- notification recipient is still a temporary hardcoded address in the action file
- this should be replaced with a real destination or environment variable before production

## Mobile UI State

Current mobile results behavior:
- map uses full width with no side padding
- map uses `100dvh` shell to reduce viewport/keyboard glitches
- bottom sheet overlays the map
- drawer can be minimized and restored
- sort control is inside the mobile drawer
- back button lives in the mobile header

Known caveat:
- mobile viewport behavior is improved, but should still be tested on real iPhone/Android hardware before production release

## Vercel / Caching State

`/admin/requests` is configured to fetch fresh data:
- `export const dynamic = "force-dynamic"`
- `export const revalidate = 0`

## Files Most Recently Touched

- `src/app/clinics/[category]/page.tsx`
- `src/components/site-header.tsx`
- `src/components/category-rail.tsx`
- `src/components/clinic-results-view.tsx`
- `src/components/clinic-detail-drawer.tsx`
- `src/components/results-sort-select.tsx`
- `src/components/category-search.tsx`
- `src/app/actions/create-appointment-request.ts`
- `src/db/index.ts`
- `src/db/schema.ts`

## What Is Intentionally Not Built

Still out of scope:
- auth
- payments
- real booking / slot reservation
- clinic-side dashboards
- advanced filtering and search
- notifications beyond the basic Resend email
- full admin tooling

## Recommended Next Steps

1. Replace the temporary Resend recipient with a real config value
2. Add explicit DB migrations for schema changes rather than relying on `db:push`
3. Test mobile drawer behavior on physical devices
4. Add lightweight tests for:
   - appointment request validation
   - admin request rendering
   - mobile results interactions
5. Decide whether appointment requests should later reserve slots or remain inquiry-only

## Quick Commands

```bash
npm run dev
npm run build
npm run lint
```
