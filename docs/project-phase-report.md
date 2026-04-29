# Project Phase Report Index

Last updated: 2026-04-29
Current branch: `codex/business-plan-baseline`

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
- [Phase 10: Search UX Polish and Near-Me Discovery](./phases/2026-04-28-phase-10-search-ux-polish-and-near-me-discovery.md)
- [Phase 11: Homepage Hero and Marquee Polish](./phases/2026-04-28-phase-11-homepage-hero-and-marquee-polish.md)
- [Phase 12: Location-Aware Results and Header Search Refinement](./phases/2026-04-29-phase-12-location-aware-results-and-header-search-refinement.md)
- [Phase 13: Mobile-Friendly Responsive Pass](./phases/2026-04-29-phase-13-mobile-friendly-responsive-pass.md)
- [Phase 14: Lightweight Results and Fallback Test Coverage](./phases/2026-04-29-phase-14-lightweight-results-and-fallback-test-coverage.md)
- [Phase 15: Business Plan Readiness Baseline](./phases/2026-04-29-phase-15-business-plan-readiness-baseline.md)

## Current Status

- Category-based clinic discovery is working.
- Homepage category + date availability search is working.
- Homepage search now supports optional near-me behavior and a location dropdown.
- Homepage hero now leads directly into the main search bar without duplicate category rails.
- Responsive list + map browsing is working.
- Google Maps integration is working.
- Clinic storage is connected to Neon through Drizzle.
- The app now falls back to sample Toronto clinic data if live DB access fails.
- Homepage featured clinic data refreshes automatically every 60 seconds.
- Clinic detail drawer is working with keyboard and focus handling.
- Results pages can filter clinics by mock available dates from the URL query.
- Results pages can sort clinics by distance and show a user marker when location is shared.
- Results pages can now prioritize clinics by named area and gracefully fall back when an area has no exact matches.
- The results header now uses a compact working search bar with the current category, date, and location prefilled.
- Homepage and results browsing now adapt more cleanly to smaller screens with a mobile-focused refine-search flow.
- Homepage categories and top clinics now use single-line marquee-style motion.
- Lightweight automated coverage now validates results refinement behavior and missing-database fallback handling.
- A clean continuation branch and validation baseline are now recorded for ongoing Codex work.

## MVP Scope Still Intentionally Excluded

- Authentication
- Booking
- Payments
- Dashboards
- Clinic management
- Full SaaS workflows

## Recommended Next Steps

- Decide whether area metadata should stay mock/app-layer only or move into the database schema next.
- Add basic list sorting such as highest rated or alphabetical.
- Expand coverage beyond core helpers into broader route or user-flow tests when the MVP behavior stabilizes further.
- Consider whether named-area filtering should eventually connect to richer geographic or clinic-level metadata.
