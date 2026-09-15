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

## 2026-09-10 amended Phase 3 validation
Recovery baseline: production build, 9 domain and 20 desktop/mobile tests passed before checkpoint 67143e2. Amended suite: 33 domain tests passed. Original 20 browser cases passed after updating the obsolete computer-upsell expectation. Five new desktop/mobile scenarios exercise Fun Dive/Refresher, professional fitting/correction/damage, Manager capacity + six-student staffing, staff manual booking + Instructor training, and operational accessibility/mobile reflow.

Initial new-test failures were incorrect exact select-label locators and an outdated manual-deposit button label; corrected to accessible combobox roles/current labels. An operational-note import omission was caught by TypeScript and corrected before final build. No failed run is represented as a successful build. Final complete suite and deployed results are recorded below when verified.

Final local verification: formatting passed; 33 domain tests passed; TypeScript/Vite production build passed; all 30 desktop/mobile browser cases passed in 24.1 seconds, including axe checks on public and operational routes and zero horizontal overflow checks. Mobile staffing screenshot inspected: navigation wraps, cards and forms fit, controls remain readable. No unresolved test failures. Final overview copy is checked with the public accessibility suite before publication.

Published verification on 2026-09-12: GitHub Actions `Verify DiveOS` run 34554247296 completed successfully for commit f3dcf65. Netlify reported a successful Deploy Preview for that commit. The complete 30-case Playwright suite then passed against `https://deploy-preview-1--divecente-nat.netlify.app` in 40.7 seconds on desktop and mobile, including QR/Wise persistence, Fun Dive/Refresher, equipment correction/damage, six-student staffing, manual booking/training, route permissions, accessibility and horizontal-overflow checks. Direct route loading is exercised by the deployed suite. No unresolved failures.

## 2026-09-13 Phase 4 local validation
- Formatting: passed.
- Domain: 39/39 passed, including six new management cases for permissions, validation, stable-ID updates, immutable booked totals, settings preservation and simulated notification records.
- Production build: passed with TypeScript and Vite.
- Browser: 40/40 passed in 35.9 seconds across desktop and mobile. Ten new cases exercise dashboard/report filters, product publication and persistence, site/boat/settings management, Front Desk denial, notification preview/read/audit flow, seven direct Phase 4 routes, automated WCAG A/AA checks and horizontal overflow.
- Regression: the original 30 browser cases passed unchanged after the Manager dashboard retained pending transfer review and calendar entry points.
- Visual QA: desktop and mobile Manager Dashboard screenshots inspected. Navigation, actions, metric cards, empty states and deferred-work notice remain readable and contained at both widths.
- One first full run exposed an obsolete Manager-home expectation after the dashboard became the role landing page; the established transfer-review metric and calendar link were restored. The final complete run passed. No application failure is reported as passing.
- Published verification: GitHub Actions `Verify DiveOS` run 34817419820 passed for PR head `3438695`. The full 40-case desktop/mobile Playwright suite passed against `https://deploy-preview-1--divecente-nat.netlify.app` in 42.4 seconds. The live run includes all Phase 1–3 regression, Phase 4 management workflows, direct routes, permissions, responsiveness and automated accessibility checks. No unresolved test failures.

## 2026-09-15 operational UX revision — local
- Formatting and TypeScript/Vite production build passed.
- Domain: 45/45 passed, covering large unique inventory, employment types/session staffing, Instructor requirements, configurable boats, seat validation, occupancy-safe capacity reduction, non-destructive suggestions, permissions and audit.
- Browser: 52/52 passed in 54.3 seconds across desktop and mobile. New cases cover equipment drilldown/search/pagination/bulk creation, Month navigation, daily staffing, manifests, professional read-only access, customer denial, WCAG A/AA and horizontal overflow.
- Visual QA: desktop/mobile Equipment, Month Calendar, Staffing and Boat Manifest captures inspected. Crowded mobile Month labels were corrected to a two-column labelled grid; the focused accessibility/overflow check then passed 2/2.
- Published verification: GitHub Actions `Verify DiveOS` run 34940591970 passed for operational commit `15e502e`. All 52 desktop/mobile Playwright cases passed against `https://deploy-preview-1--divecente-nat.netlify.app` in 1.1 minutes, verifying direct routes, revised operations, retained journeys, permissions, persistence, accessibility and responsive layout. PR #1 remains open and unmerged.
