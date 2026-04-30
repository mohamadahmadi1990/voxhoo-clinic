# Phase 18: Canonical Repository Switch and Historical Repo Note

Date: 2026-04-29
Status: Completed

## Objective

Make `mohamadahmadi1990/voxhoo-clinic` the canonical repository in the local workspace and document that `clinic-app` is now historical.

## Delivered

- Switched the workspace `origin` remote to `mohamadahmadi1990/voxhoo-clinic`.
- Renamed the previous `origin` remote to `clinic-app-history`.
- Updated the active README and environment docs so they point at the canonical Voxhoo Clinic repository state.
- Added this final historical note so the old repository name remains documented only in explicit repo-history context.

## Main Files

- `README.md`
- `.env.example`
- `docs/project-phase-report.md`
- `docs/phases/2026-04-29-phase-18-canonical-repository-switch-and-historical-repo-note.md`

## Technical Notes

- The canonical Git remote for ongoing work is now `origin -> https://github.com/mohamadahmadi1990/voxhoo-clinic.git`.
- The former repository remains available as `clinic-app-history -> https://github.com/mohamadahmadi1990/clinic-app.git`.
- `clinic-app` is now a historical repository reference only and should not be used as the active remote for ongoing development.

## Validation

- `npm test`
- `npm run lint`
- `npm run build`

## Product Impact

- Voxhoo Clinic now has one clear active repository identity across code, docs, package metadata, and git remotes.
- The old `clinic-app` repository is preserved as history without conflicting with current development.
