# DiveOS

Natneef Diving fictional demo. The public overview stays at `/`; `/demo` provides customer, front-desk, instructor and manager entry. All data and role access are browser-local simulations, not a secure production backend.

## Local development
Node.js 22 and npm are required.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

No environment variables are required. Use only fictional data. Original `index` is retained as the source reference for the prior Thai overview.

## Deployment
Netlify: install using npm lockfile (`npm ci`), build `npm run build`, publish `dist`, Node 22. `netlify.toml` handles SPA deep links and security headers. Push `build/diveos-mvp`, open a PR to `main`, and inspect Netlify's PR Deploy Preview status. Test direct `/demo`, `/courses/open-water`, `/portal`, `/app` and `/app/calendar` URLs. Do not merge or replace production without user approval.

## Continuity
Read AGENTS.md and docs/ before changes. Scope and next tasks are in IMPLEMENTATION_PLAN.md. MASTER_PROMPT.md preserves the full product brief; PROGRESS.md distinguishes implemented behavior from future work. ARCHITECTURE.md describes relational relationships and production migration.

## Browser QA

`npm run test:e2e` runs desktop and mobile-emulated Chrome workflows plus axe checks. Local runs use installed Google Chrome. CI installs Chromium. To test a deployed preview: `PLAYWRIGHT_BASE_URL=https://<verified-preview-host> npm run test:e2e`. See docs/REVIEW_GUIDE.md for the manual walkthrough and docs/SECURITY_REVIEW.md for production gates.

## Verified Phase 1–2 preview

- [Live demo](https://deploy-preview-1--divecente-nat.netlify.app)
- [Pull request #1](https://github.com/natneef-code/divecente-nat/pull/1) — unmerged, awaiting explicit approval
- [Passing CI](https://github.com/natneef-code/divecente-nat/actions/runs/34308107016)

Select any of the four roles at `/demo` without a password. The complete Open Water → booking → 10% demo deposit → portal → staff → calendar journey is working with fictional browser-local data. The wider Phase 3–5 MVP is documented backlog, not completed functionality.
