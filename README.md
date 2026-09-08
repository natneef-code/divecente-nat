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
