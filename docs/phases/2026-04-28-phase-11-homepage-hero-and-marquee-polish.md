# Phase 11: Homepage Hero and Marquee Polish

Date: 2026-04-28
Status: Completed

## Objective

Refine the homepage browsing experience by simplifying the hero, removing duplicated category navigation, and making the homepage category and clinic rails feel more dynamic without changing MVP scope.

## Delivered

- Replaced the temporary extra hero typing input with the main structured search bar directly beneath the homepage heading.
- Updated the homepage hero headline to:
  `What Clinic are you looking for?`
- Removed the duplicate homepage category strip so categories only appear once beneath the main search bar.
- Converted the homepage category chips into a single-line slow marquee.
- Converted the Top Clinics row into the same continuous marquee-style pattern while keeping the card UI unchanged.
- Tuned the Top Clinics motion so it is slower than the category strip and moves in the opposite direction.
- Kept the search bar UI improvements in place, including:
  icon-only circular search button,
  location dropdown,
  polished date picker surface and spacing.

## Main Files

- `src/app/page.tsx`
- `src/components/category-search.tsx`
- `src/components/top-clinics-carousel.tsx`
- `src/app/globals.css`

## Technical Notes

- The category strip uses a CSS marquee loop with duplicated content to create a seamless single-line effect.
- The Top Clinics row now uses the same marquee strategy, but with a slower duration and reverse direction.
- Duplicate visual copies in the marquee rows are kept out of keyboard navigation so focus behavior stays reasonable.

## Validation

- `npm run lint`
- `npm run build`

## Product Impact

- The homepage hero is cleaner and easier to understand.
- The homepage now feels more intentional and alive without adding backend complexity.
- Category and featured clinic browsing are more visually distinct while staying within the discovery MVP.
