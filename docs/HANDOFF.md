# Handoff — amended Phase 3

1. **Branch:** build/diveos-mvp in /Users/kittipa/Documents/Codex/divecente-nat.
2. **Latest relevant commits:** 67143e2 local recovery checkpoint; eb26aab last published Phase 2 checkpoint. Run git log -5 for newer checkpoints. Recovery includes the full user amendment and repaired CRM.
3. **Working state:** amended rules implemented in existing React/TypeScript app; finishing QA/publication. Do not restart or replace architecture.
4. **Completed:** customers no longer fit/select assets; course included computer; Fun Dive certification/rentals; mandatory Refresher; Instructor/DM distinction; ratio/capacity overrides; equipment history/correction; CRM/training/docs; manager settings/audit; additive migration.
5. **In progress:** final formatting/build/domain/browser run, current documentation, GitHub publication, latest preview verification.
6. **Exact next task:** inspect the active test results and git status; fix only evidenced failures, then commit/publish on the existing branch. Update PR #1 and run all browser checks against its Netlify preview. Do not merge.
7. **Backlog:** full product/availability creation UI, staff qualification editing, richer sessions/attendance, document-specific review/uploads, broader financial states/reports/providers and production backend. See IMPLEMENTATION_PLAN.
8. **Known limits:** fictional device-local demo; no production authorization or concurrent DB locks; in-water daily session assumptions; Refresher date/attestation is not real training evidence; legacy prices retained; original four-seat capacities and older inventory retained until Manager edits.
9. **Tests:** recovery build + 9 domain/20 browser passed; amended domain suite 33 passed; operational tests cover five additional scenarios on desktop/mobile, with original 20 regression cases. See TEST_STATUS for final actual run results.
10. **Commands:** npm ci; npm run dev; npm run format:check; npm test; npm run build; npm run test:e2e. Local Playwright uses Chrome; CI installs Chromium. Live: PLAYWRIGHT_BASE_URL=https://deploy-preview-1--divecente-nat.netlify.app npm run test:e2e.
11. **Environment:** no demo secrets/env required. Optional PLAYWRIGHT_BASE_URL; future server placeholders DATABASE_URL/AUTH_SECRET/PAYMENT_WEBHOOK_SECRET only, never values.
12. **External blockers:** no feature credential blocker. Local HTTPS push has no auth; publish via connected GitHub tree/commit/ref tools, preserving commit order and no force push. Before aligning local HEAD, fetch and compare identical trees, retain a backup local checkpoint branch, then reset --keep only on clean state. Repository is outside this task's writable roots; authorized shell mutations require escalation.

Branch: https://github.com/natneef-code/divecente-nat/tree/build/diveos-mvp
PR: https://github.com/natneef-code/divecente-nat/pull/1
Preview: https://deploy-preview-1--divecente-nat.netlify.app
Five one-click roles at /demo, no password. Never merge into main without explicit user approval after preview review.
