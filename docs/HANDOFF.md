# Handoff

1. **Current branch:** build/diveos-mvp.
2. **Latest relevant commit:** fd3889e (foundation); ebfe282 is the first definitions checkpoint. The Phase 2 checkpoint follows this document. Use git log -5 --oneline for the current tip.
3. **Current working state:** runnable React/TypeScript/Vite demo with connected Phase 1/2 workflows. Repo: /Users/kittipa/Documents/Codex/divecente-nat. Original index retained; user-created Doc/ and .DS_Store left alone/ignored.
4. **Completed:** full Master Prompt, permanent rules, continuity docs; public overview/catalogue/details; four demo roles; booking, participants/equipment/document/terms flow; calculated QR deposit and Wise review; customer portal, staff list/confirmation/check-in; daily/weekly/list calendar; domain tests, browser tests, accessibility fixes and CI.
5. **In progress:** Phase 2 commit, push, PR and Netlify verification.
6. **Exact next task:** commit locally verified Phase 2 changes, push build/diveos-mvp, open PR to main, inspect Netlify status and run browser tests against its actual preview URL. Update this file with PR/preview and test evidence.
7. **Remaining backlog:** Phase 3 CRM, product management, manual instructor assignment/conflicts, training, equipment assets, full document review; Phase 4 management; full Phase 5. Do not present these as completed.
8. **Known bugs/limitations:** device-local storage, no cross-device sync or production authentication; concurrent tabs are not database transactions; demo classes reserve capacity indefinitely; no real legal/medical review. Existing production reference returned HTTP 404 on 2026-09-08, unchanged by this work.
9. **Tests:** nine domain tests passed; initial 16 desktop/mobile workflow tests passed. Axe found label contrast issues, corrected and rerun as part of final 20-case browser suite. Final result: all 20 browser tests passed, including axe. Build, domain tests and formatting passed. See TEST_STATUS.md.
10. **Commands:** npm ci; npm run dev; npm test; npm run build; npm run preview; npm run test:e2e. Local tests use installed Chrome. CI installs Playwright Chromium. For deployed tests: PLAYWRIGHT_BASE_URL=<verified-preview-url> npm run test:e2e.
11. **Environment variables:** none required for demo. PLAYWRIGHT_BASE_URL optional for QA; CI selects bundled Chromium. Future server-only DATABASE_URL/AUTH_SECRET/PAYMENT_WEBHOOK_SECRET placeholders documented, never values.
12. **External blockers/decisions:** GitHub push/Netlify status not yet verified. Netlify must build npm run build, publish dist, Node 22 with SPA fallback. Never merge or replace production until explicit approval after preview testing.
