# Handoff — approved operational UX checkpoint

1. **Current branch:** `build/diveos-mvp` in `/Users/kittipa/Documents/Codex/divecente-nat`.
2. **Latest relevant commit:** published operational implementation `15e502ece8c076e35bae4ae2c04736c47b392fc1`; local equivalent `a6c1fac`. The next documentation-only checkpoint records live verification.
3. **Current working state:** Phase 1–4 behavior is preserved. Approved Equipment, Month Calendar, daily Staffing and Boat Manifest revisions are complete and verified locally. Backup branch `backup/phase4-verified` exists at exact SHA `343869549deca2fc123b64b485c50e776b0064a0` and must not be deployed or merged.
4. **Completed work:** scalable category/size-model/asset equipment inventory; summaries/search/status filters/pagination/bulk codes; Day/Week/Month/List Calendar; per-session staffing with 12 professionals and employment types; clear activity and session-only assignments; boat groups, participant/professional occupancy, seats, unavailable seats, suggestions, validation, permissions and audit; additive schema revision 4.
5. **In-progress work:** publish this documentation-only live-verification record; implementation and deployment verification are complete.
6. **Exact next task:** owner reviews PR #1 and the preview. Address review findings or begin the first approved Phase 5 item; never merge without explicit approval.
7. **Remaining backlog:** boat crew model/seat policy; availability administration; staff profile/qualification editor; rich session planning; secure documents; accounting/reconciliation; production backend/auth/providers; full manual accessibility/legal/privacy/recovery review.
8. **Known bugs:** none locally. Browser demo lacks concurrency, production authorization, tamper-resistant audit and recovery guarantees. Crew is intentionally unresolved.
9. **Test results:** formatting passed; 45/45 domain tests passed; production build passed; 52/52 desktop/mobile browser cases passed locally in 54.3s and live in 1.1m. Focused visual/accessibility/overflow rerun passed 2/2 after correcting mobile Month filters. Eight screenshots inspected. Actions run 34940591970 passed.
10. **Build and preview commands:** `npm ci`; `npm run dev`; `npm run format:check`; `npm test`; `npm run build`; `npm run test:e2e`. Live: `PLAYWRIGHT_BASE_URL=https://deploy-preview-1--divecente-nat.netlify.app npm run test:e2e`.
11. **Environment variables:** none required for the demo. Optional `PLAYWRIGHT_BASE_URL`. Future server placeholders only: `DATABASE_URL`, `AUTH_SECRET`, `PAYMENT_WEBHOOK_SECRET`; never record values.
12. **External blockers or decisions:** no publication blocker. Boat crew roles and crew-seat policy need operator input before production. Production credentials and legal/privacy review remain future gates. Local HTTPS push lacks credentials; use connected GitHub tools if needed.

Branch: https://github.com/natneef-code/divecente-nat/tree/build/diveos-mvp

PR: https://github.com/natneef-code/divecente-nat/pull/1

Preview: https://deploy-preview-1--divecente-nat.netlify.app

One-click demo roles are available at `/demo`; no password is used. Never merge PR #1 into `main` without explicit user approval.
