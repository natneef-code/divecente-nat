# Handoff

1. Current branch: build/diveos-mvp.
2. Latest relevant commit: ebfe282 (definitions); foundation checkpoint follows.
3. Current working state: Phase 1 app shell, domain commands and public/demo routes implemented. User-created Doc/ and .DS_Store are unrelated and must not be committed.
4. Completed: clone, relocation to /Users/kittipa/Documents/Codex/divecente-nat, branch, repository inspection, full prompt and rules/specification.
5. In progress: Phase 2 connected UI.
6. Exact next task: Connect course details/booking/payment UI, portal, staff list and calendar; browser-test vertical slice.
7. Backlog: see IMPLEMENTATION_PLAN.md; do not expand before deploying and testing slice.
8. Known bugs: none tested; original index is a presentation, not an app.
9. Test results: Production build passed; domain test assertion wording corrected for rerun.
10. Build/preview commands: planned npm ci, npm test, npm run build, npm run dev, npm run test:e2e.
11. Required environment variables: none for demo. Future server-only DATABASE_URL and auth/payment provider values; never record values.
12. External blockers/decisions: no app blocker. Netlify preview and GitHub access need verification. Never merge without approval.
