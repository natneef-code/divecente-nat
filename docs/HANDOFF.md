# Handoff — amended Phase 3

1. **Branch:** build/diveos-mvp in /Users/kittipa/Documents/Codex/divecente-nat.
2. **Latest relevant commits:** f3dcf65 published amended Phase 3 implementation; 454675d published recovery checkpoint; eb26aab Phase 2 verification. Run git log -5 for any newer documentation checkpoint. Recovery includes the full user amendment and repaired CRM.
3. **Working state:** amended rules implemented, published and verified in the existing React/TypeScript app. Do not restart or replace architecture.
4. **Completed:** customers no longer fit/select assets; course included computer; Fun Dive certification/rentals; mandatory Refresher; Instructor/DM distinction; ratio/capacity overrides; equipment history/correction; CRM/training/docs; manager settings/audit; additive migration.
5. **In progress:** no incomplete amended-scope work. Await user review; remaining original Phase 3 backlog is listed below.
6. **Exact next task:** review PR #1 and the verified preview using REVIEW_GUIDE. If continuing implementation, begin full product/availability creation UI and staff qualification administration. Do not merge without explicit approval.
7. **Backlog:** full product/availability creation UI, staff qualification editing, richer sessions/attendance, document-specific review/uploads, broader financial states/reports/providers and production backend. See IMPLEMENTATION_PLAN.
8. **Known limits:** fictional device-local demo; no production authorization or concurrent DB locks; in-water daily session assumptions; Refresher date/attestation is not real training evidence; legacy prices retained; original four-seat capacities and older inventory retained until Manager edits.
9. **Tests:** formatting/build passed; amended domain suite 33 passed. All 30 desktop/mobile browser cases passed locally and against the deployed preview. GitHub Actions run 34554247296 passed. See TEST_STATUS.
10. **Commands:** npm ci; npm run dev; npm run format:check; npm test; npm run build; npm run test:e2e. Local Playwright uses Chrome; CI installs Chromium. Live: PLAYWRIGHT_BASE_URL=https://deploy-preview-1--divecente-nat.netlify.app npm run test:e2e.
11. **Environment:** no demo secrets/env required. Optional PLAYWRIGHT_BASE_URL; future server placeholders DATABASE_URL/AUTH_SECRET/PAYMENT_WEBHOOK_SECRET only, never values.
12. **External blockers:** no demo feature or deployment blocker. Production authentication, database, payment/messaging credentials, operator pricing, legal review and operational decisions remain future gates. Local HTTPS push has no auth; use connected GitHub tools for future publication. Repository is outside this task's writable roots; authorized shell mutations require escalation.

Branch: https://github.com/natneef-code/divecente-nat/tree/build/diveos-mvp
PR: https://github.com/natneef-code/divecente-nat/pull/1
Preview: https://deploy-preview-1--divecente-nat.netlify.app
Five one-click roles at /demo, no password. Never merge into main without explicit user approval after preview review.

## Verified published state
Commit f3dcf65 is the PR head verified on 2026-09-12. Netlify status succeeded, GitHub Actions run 8 succeeded, and the deployed 30-case suite passed in 40.7 seconds. PR #1 remains open, mergeable and unmerged.
