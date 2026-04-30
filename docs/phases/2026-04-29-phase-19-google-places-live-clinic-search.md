# Phase 19: Google Places Live Clinic Search

Date: 2026-04-29
Status: Completed

## Objective

Replace the mock-backed runtime clinic source with real Google Places API data while preserving the current Voxhoo Clinic UI and the mock fallback path.

## Delivered

- Added a server-side Google Places Text Search integration for clinic category results.
- Mapped app categories to simple Places text queries such as `dentist`, `physiotherapist`, and `dermatologist`.
- Used the selected area center for location-based search, or the user's coordinates when `near me` is active.
- Converted Google Places results into the existing clinic list item shape used across the current UI.
- Preserved app-layer metadata by attaching derived area labels and deterministic mock availability dates to live Google places results.
- Kept the mock clinic fallback path when the Places key is missing or the API request fails.
- Left Neon and Drizzle out of the live runtime flow while keeping the scripts in the repo for later phases.

## Main Files

- `src/lib/google-places.ts`
- `src/lib/clinic-list-item.ts`
- `src/lib/mock-clinics.ts`
- `src/lib/clinic-search.ts`
- `src/db/index.ts`
- `src/app/clinics/[category]/page.tsx`
- `src/app/page.tsx`
- `src/components/clinic-detail-drawer.tsx`
- `src/components/clinic-map.tsx`
- `src/components/top-clinics-carousel.tsx`
- `README.md`
- `.env.example`

## Technical Notes

- The implementation uses Google Places Text Search (New) with a field mask for `id`, `displayName`, `formattedAddress`, `location`, and `rating`.
- No caching was added. The homepage and category results now fetch live data at request time.
- Because Google Places search results do not include the existing MVP-only metadata such as area labels and available dates, the app still derives those values in the app layer to avoid breaking the current UI.
- Phone numbers are not fetched yet, so live Google Places clinics intentionally show `Phone unavailable` instead of fake data.

## Validation

- `npm test`
- `npm run lint`
- `npm run build`

## Product Impact

- Voxhoo Clinic now shows real clinic search results tied to category and location.
- The current browse flow, filters, and mobile-friendly UI remain intact.
- The app still works for demos and development even when Google Places is not available because the Toronto mock fallback remains in place.
