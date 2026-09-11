# Test status

## Phase 1/2 local verification — 2026-09-08
- Production build: passed (TypeScript and Vite).
- Domain tests: 9 passed. Currency arithmetic for all courses/add-ons, aggregate capacity, validation, immutable commands, duplicate deposits, Wise approval/rejection/resubmission, ownership/role checks, missing document check-in gate, past/unpublished activities.
- Initial browser journeys: 16 passed across desktop Chrome and mobile Chrome emulation after correcting ambiguous test selectors.
- Final expanded browser suite: 20 passed (17.1 seconds). Includes the above journeys plus manager calendar filtering and automated axe WCAG A/AA checks.
- Accessibility: first scan identified low-contrast small labels on homepage and booking; colors darkened. Final desktop/mobile scans passed with zero violations for the selected WCAG tags on the inspected pages.
- Visual inspection: desktop and mobile homepage screenshots inspected; small mobile illustration clipping corrected. Functional overflow assertions cover public routes.
- npm install audit: zero known vulnerabilities reported at install time.
- Existing production reference: HTTP 404 at https://divecente-nat.netlify.app (not changed).

## Coverage limits
Browser suite covers Open Water booking → demo deposit → confirmation → portal → staff → calendar; Wise staff approval; document acknowledgement gating; capacity four; optional equipment prices; refresh persistence; customer/staff/instructor route separation; search empty state; malformed saved-data reset; invalid routes; manager date/course filters.

No full manual screen-reader audit or real-device Safari test. No real authentication, database, money, messages, medical clearance, file uploads, SSI certification, instructor/boat/equipment overlap or full manager/training workflows tested; those implementations remain later-phase work.

## Deployed verification — 2026-09-09

Preview: https://deploy-preview-1--divecente-nat.netlify.app

All 20 desktop/mobile Playwright checks passed against the live Netlify deployment in 29.3 seconds. This verifies direct routes, QR/Wise journeys, persistence, role restrictions, capacity, calendar filters and axe checks on the deployed asset bundle for commit 5f3345b.

GitHub Actions initial run 34210584831: install, domain tests and build passed; browser tests were 18 passed, 2 failed because the Wise test queried a balance before route navigation completed. An explicit URL and heading wait fixes the test race; CI rerun 34308107016 passed all steps on d4205ba, including all 20 browser checks. No application behavior change was required.

The first attempted live test run was blocked by automatic approval review due to exhausted workspace credits. The authorized retry succeeded on 2026-09-09.

## Final deployment evidence

On 2026-09-09, all eight required direct routes returned HTTP 200 from the rebuilt preview. The JavaScript bundle was byte-identical to the local production build. CSP and X-Content-Type-Options: nosniff headers were verified.

- PR: https://github.com/natneef-code/divecente-nat/pull/1
- Passing CI: https://github.com/natneef-code/divecente-nat/actions/runs/34308107016
- Preview: https://deploy-preview-1--divecente-nat.netlify.app

No critical issue remains in the tested Phase 2 scope. Remaining overall-MVP functionality and production limitations are documented in PROGRESS.md and SECURITY_REVIEW.md.

## Recovery baseline — 2026-09-10
Fixed CRM JSX syntax. Production build passed; 9 domain tests passed; 20 desktop/mobile checks passed in 20.8s. This baseline precedes the confirmed staffing/Fun Dive/equipment amendment; superseded assertions will be updated explicitly.
