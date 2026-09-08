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

Netlify Deploy Preview, direct deployed routes and external CI: verification pending push/PR. Do not claim a verified deployment until checks are recorded here.
