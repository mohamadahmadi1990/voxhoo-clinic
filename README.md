# Voxhoo Clinic

Voxhoo Clinic is a clinic discovery MVP built with Next.js.

The product currently focuses on three things:
- helping users discover clinics by category
- comparing clinics in a list-and-map flow
- collecting lightweight appointment requests for available time slots

This is still an MVP, not a full clinic booking platform.

## Project Overview

The app is built around a lightweight marketplace-style browsing flow:

- Homepage with category-focused search
- Category shortcuts and featured clinics
- Results page with clinic cards plus Google Map
- Mobile map-first bottom-sheet browsing flow
- Clinic detail drawer with availability and appointment request form
- Simple admin request list at `/admin/requests`

Current stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Google Places API
- Google Maps JavaScript API
- Neon Postgres
- Drizzle ORM
- Resend for appointment request email notifications

Project progress reports live in [docs/project-phase-report.md](./docs/project-phase-report.md).

## Repository Status

- Active repository: `mohamadahmadi1990/voxhoo-clinic`
- Primary branch: `main`

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local`, then replace the placeholder values:

```env
GOOGLE_PLACES_API_KEY=your_google_places_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

5. Optional: if you want database-backed availability and appointment requests locally, add `DATABASE_URL` to `.env.local`.

6. Optional: if you want appointment request email notifications, also add `RESEND_API_KEY` to `.env.local`.

7. Historical Drizzle utilities are still available:

```bash
npm run db:push
npm run db:seed
```

## Environment Variables

The tracked example file is [`.env.example`](./.env.example).

| Variable | Required | Purpose |
| --- | --- | --- |
| `GOOGLE_PLACES_API_KEY` | Yes for live clinic search | Used by server-side Google Places Text Search requests |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes for live map pins | Loads the Google Maps JavaScript API in the browser |
| `DATABASE_URL` | Optional for local data-backed flows | Used by Neon/Drizzle reads and writes, including appointment requests |
| `RESEND_API_KEY` | Optional | Sends a notification email after an appointment request is created |

Notes:

- If `GOOGLE_PLACES_API_KEY` is missing or the Places request fails, the app falls back to sample Toronto clinic data so the homepage and category pages keep working.
- If `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is missing, the clinic list still works and the map area shows a friendly placeholder instead of crashing.
- `DATABASE_URL` is not required for basic Google Places browsing, but it is required for local availability-backed results and appointment request storage.
- `RESEND_API_KEY` is optional and email failures do not block appointment request success.
- `.env.local` is intentionally ignored by git and should hold your real local secrets.

## Google Places Setup

1. Create or open a Google Cloud project.
2. Enable the `Places API (New)`.
3. Create a server-side API key.
4. Add the key to `.env.local` as:

```env
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

5. Restart the dev server after updating environment variables.

Recommended:

- Restrict the API key to server-side use before production.
- Keep the Places key separate from your browser maps key when possible.

## Google Maps Setup

1. Create or open a Google Cloud project.
2. Enable the `Maps JavaScript API`.
3. Create an API key.
4. Add the key to `.env.local` as:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

5. Restart the dev server after updating environment variables.

Recommended:

- Restrict the API key to the correct websites before production use.
- Add billing in Google Cloud if your project requires it for Maps usage.

## Neon + Drizzle

This repo now uses Neon + Drizzle for availability-backed clinic results, appointment requests, and the admin request list.

1. Create a Neon Postgres database if you want to use the scripts.
2. Copy the Neon connection string into `.env.local`:

```env
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
```

3. Push the current schema only if you are intentionally managing schema changes in a non-production environment:

```bash
npm run db:push
```

4. Seed the database:

```bash
npm run db:seed
```

5. Import Google Places clinics into Neon:

```bash
npm run db:import:places
```

Drizzle files in this repo:

- `drizzle.config.ts`
- `src/db/schema.ts`
- `src/db/index.ts`
- `src/db/seed.ts`
- `drizzle/`

If you change the schema later, generate a new migration with:

```bash
npm run db:generate
```

## Seed Command

To load the sample Toronto clinic dataset:

```bash
npm run db:seed
```

What it does:

- truncates the `clinics` table
- resets IDs
- inserts the sample clinic dataset used by the MVP

## Current MVP Flow

1. User lands on `/`
2. User starts with a category search or taps a category directly
3. User goes to `/clinics/[category]`
4. User sees a clinic list and a map together on desktop, or a mobile map with a bottom-sheet clinic drawer
5. User clicks a clinic card or map pin to focus a clinic
6. User opens the clinic detail drawer to review availability
7. User can submit an appointment request for an available slot
8. Admin can review requests at `/admin/requests`

Current routes:

- `/` homepage
- `/clinics/[category]` category results page
- `/admin/requests` appointment request admin page

## Current Behavior Notes

- Homepage featured clinics and category results now fetch live Google Places data at request time.
- The homepage search is category search for now, not full clinic-name search.
- Google Places results are enriched with app-layer area and mock availability metadata so the current UI stays intact.
- The UI safely falls back to sample Toronto clinic data for demos or temporary API outages.
- Appointment requests validate required contact info and verify the requested slot is still available before insert.
- Appointment requests do not book or lock a slot yet; this is request capture only.
- Admin request listing is forced dynamic so fresh request data appears on Vercel.
- Mobile results now use a full-screen map with a bottom sheet drawer for clinic browsing.

## Appointment Requests

Current appointment request behavior:

- Uses the `appointment_requests` table
- Validates:
  - patient name required
  - email or phone required
  - basic email format if email is provided
  - slot must exist and still be `available`
- Normalizes `HH:mm` start times to `HH:mm:ss` before DB lookup/insert
- Inserts a request only
- Does not change `clinic_time_slots`
- Does not create booking logic
- Optionally sends a Resend email notification after insert

Current related files:

- `src/db/schema.ts`
- `src/db/index.ts`
- `src/app/actions/create-appointment-request.ts`
- `src/components/clinic-detail-drawer.tsx`

## What Is Intentionally Not Built Yet

To keep this MVP focused, the following are intentionally out of scope:

- Authentication
- Booking confirmation / actual slot reservation
- Payments
- Dashboards
- User accounts
- Clinic management tools
- Advanced admin tooling
- Full SaaS workflows
- Full-text search across all clinics
- Advanced filters and ranking systems

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:generate
npm run db:push
npm run db:seed
npm run db:import:places
```
