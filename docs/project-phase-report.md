# Project Phase Report Index

Last updated: 2026-04-28
Current branch: `codex/category-date-search`

This index links to a separate dated report file for each completed phase of the clinic discovery MVP.

Dates below reflect the recorded delivery or review date captured in the repo history and project notes.

## Phase Files

- [Phase 1: Clinic Discovery MVP](./phases/2026-04-27-phase-1-clinic-discovery-mvp.md)
- [Phase 2: Neon + Drizzle Clinic Storage](./phases/2026-04-27-phase-2-neon-drizzle-clinic-storage.md)
- [Phase 3: UI Refinement and Airbnb-Inspired Direction](./phases/2026-04-27-phase-3-ui-refinement-airbnb-inspired-direction.md)
- [Phase 4: Homepage Refinement and Top Clinics Carousel](./phases/2026-04-28-phase-4-homepage-refinement-top-clinics-carousel.md)
- [Phase 5: Project Review Snapshot](./phases/2026-04-28-phase-5-project-review-snapshot.md)
- [Phase 6: Safe Database Fallback](./phases/2026-04-28-phase-6-safe-database-fallback.md)
- [Phase 7: Homepage Freshness and Search Clarity](./phases/2026-04-28-phase-7-homepage-freshness-search-clarity.md)
- [Phase 8: Documentation and Project Reporting](./phases/2026-04-28-phase-8-documentation-project-reporting.md)
- [Phase 9: Category and Date Availability Search](./phases/2026-04-28-phase-9-category-date-availability-search.md)

## Current Status

- Category-based clinic discovery is working.
- Homepage category + date availability search is working.
- Responsive list + map browsing is working.
- Google Maps integration is working.
- Clinic storage is connected to Neon through Drizzle.
- The app now falls back to sample Toronto clinic data if live DB access fails.
- Homepage featured clinic data refreshes automatically every 60 seconds.
- Clinic detail drawer is working with keyboard and focus handling.
- Results pages can filter clinics by mock available dates from the URL query.

## MVP Scope Still Intentionally Excluded

- Authentication
- Booking
- Payments
- Dashboards
- Clinic management
- Full SaaS workflows

## Recommended Next Steps

- Keep the new date filter but decide whether availability should stay mock-based or move into the database schema next.
- Add basic list sorting such as highest rated or alphabetical.
- Make the results header search controls consistent with the new homepage search experience.
- Add lightweight automated tests around category/date filtering and fallback behavior.
