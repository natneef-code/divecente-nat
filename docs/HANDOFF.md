# Handoff

1. **Current branch:** build/diveos-mvp.
2. **Latest relevant commit:** 5f3345b (published Phase 2 implementation); aa4c5d7 is foundation and e8a9c12 is the first definitions checkpoint. Use git log -5 --oneline for the current tip.
3. **Current working state:** runnable React/TypeScript/Vite demo with connected Phase 1/2 workflows. Repo: /Users/kittipa/Documents/Codex/divecente-nat. Original index retained; user-created Doc/ and .DS_Store left alone/ignored.
4. **Completed:** full Master Prompt, permanent rules, continuity docs; public overview/catalogue/details; four demo roles; booking, participants/equipment/document/terms flow; calculated QR deposit and Wise review; customer portal, staff list/confirmation/check-in; daily/weekly/list calendar; domain tests, browser tests, accessibility fixes and CI.
5. **In progress:** CI timing fix and final documentation checkpoint. PR #1 is open; Netlify preview verified on 2026-09-09.
6. **Exact next task:** publish the Wise test navigation-wait fix through GitHub plugin; verify CI; record final handoff. After Phase 2 delivery, resume Phase 3 CRM and manual instructor assignment, never merge without approval.
7. **Remaining backlog:** Phase 3 CRM, product management, manual instructor assignment/conflicts, training, equipment assets, full document review; Phase 4 management; full Phase 5. Do not present these as completed.
8. **Known bugs/limitations:** device-local storage, no cross-device sync or production authentication; concurrent tabs are not database transactions; demo classes reserve capacity indefinitely; no real legal/medical review. Existing production reference returned HTTP 404 on 2026-09-08, unchanged by this work.
9. **Tests:** nine domain tests passed; initial 16 desktop/mobile workflow tests passed. Axe found label contrast issues, corrected and rerun as part of final 20-case browser suite. Final result: all 20 browser tests passed, including axe. Build, domain tests and formatting passed. See TEST_STATUS.md.
10. **Commands:** npm ci; npm run dev; npm test; npm run build; npm run preview; npm run test:e2e. Local tests use installed Chrome. CI installs Playwright Chromium. For deployed tests: PLAYWRIGHT_BASE_URL=<verified-preview-url> npm run test:e2e.
11. **Environment variables:** none required for demo. PLAYWRIGHT_BASE_URL optional for QA; CI selects bundled Chromium. Future server-only DATABASE_URL/AUTH_SECRET/PAYMENT_WEBHOOK_SECRET placeholders documented, never values.
12. **External blockers/decisions:** Local HTTPS Git push has no credentials; GitHub plugin publishes tree/commit/ref checkpoints. Original local commits are preserved on codex/local-checkpoint-5e750d2; current branch tracks the identical published tree. No active deployment blocker. Netlify must build npm run build, publish dist, Node 22 with SPA fallback. Never merge or replace production until explicit approval after preview testing.

## Published resources
- Branch: https://github.com/natneef-code/divecente-nat/tree/build/diveos-mvp
- PR: https://github.com/natneef-code/divecente-nat/pull/1 (unmerged)
- Verified preview: https://deploy-preview-1--divecente-nat.netlify.app
- Live preview test result: 20 passed in 29.3 seconds on 2026-09-09.
