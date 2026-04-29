# Voxhoo Clinic

Voxhoo Clinic is a healthcare clinic discovery MVP built with Next.js.

The current goal is simple:
help users discover clinics by category, compare them in a list, and see them on a map.

This is not a full SaaS product yet. It is a focused discovery experience only.

## Project Overview

The app is built around a lightweight marketplace-style browsing flow:

- Homepage with category-focused search
- Category shortcuts and featured clinics
- Results page with clinic cards on the left
- Google Map with pins on the right

Current stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Google Maps JavaScript API
- Neon Postgres
- Drizzle ORM

Project progress reports live in [docs/project-phase-report.md](./docs/project-phase-report.md).

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file values into `.env.local`:

```env
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

3. Push the schema to Neon:

```bash
npm run db:push
```

4. Seed the sample Toronto clinics:

```bash
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

The app currently uses two environment variables.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes for live clinic data | Connects Drizzle and Neon to the `clinics` table |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes for live map pins | Loads the Google Maps JavaScript API in the browser |

Notes:

- If `DATABASE_URL` is missing or Neon is temporarily unavailable, the app falls back to sample Toronto clinic data so the homepage and category pages keep working.
- If `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is missing, the clinic list still works and the map area shows a friendly placeholder instead of crashing.

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

## Neon + Drizzle Setup

1. Create a Neon Postgres database.
2. Copy the Neon connection string into `.env.local`:

```env
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
```

3. Push the current schema:

```bash
npm run db:push
```

4. Seed the database:

```bash
npm run db:seed
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
4. User sees a clinic list and a map together
5. User clicks a clinic card to focus it on the map
6. User can compare nearby clinics without leaving the browse flow

Current routes:

- `/` homepage
- `/clinics/[category]` category results page

## Current Behavior Notes

- The homepage top-clinics content revalidates every 60 seconds.
- The homepage search is category search for now, not full clinic-name search.
- Clinic data is stored in Neon, but the UI can safely fall back to sample data for demos or temporary outages.

## What Is Intentionally Not Built Yet

To keep this MVP focused, the following are intentionally out of scope:

- Authentication
- Booking
- Payments
- Dashboards
- User accounts
- Clinic management tools
- Admin panels
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
```
