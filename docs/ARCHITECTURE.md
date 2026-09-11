# Architecture

## Stack and flow
React 19 + TypeScript + Vite SPA, React Router, Vitest and Playwright/axe. Netlify builds `npm run build`, publishes `dist`, Node 22, SPA redirects and security headers. No demo credentials/environment variables required.

`src/domain/model.ts` is the documented relational equivalent. `seed.ts` and `records.ts` supply fictional fixtures and additive migration. `policies.ts` calculates pricing, staffing, capacities, qualification conflicts, equipment demand and readiness. `commands.ts`, `operations.ts`, and `staffing.ts` enforce roles and state transitions. `src/data/store.tsx` persists a successful command before exposing success. Pages use the same commands across customer and staff entry paths.

## Relationships
User/demo Actor → role and customer or staff ID. Customer holds diver profile/emergency contact; Booking references Customer and Activity. Participant holds booking-specific name, certification/rental/Refresher snapshots. Product/Course acts as Course Template; Fun Dive uses a distinct kind. Activity references template, boat, site and manually selected lead/team. Session references Activity and can override team, lead, staffing and equipment inclusion.

Booking owns immutable currency line items, calculated deposit, status history and participants. Payments/refunds reference Booking. Document records reference Booking + Participant with type/version/reviewer/status/expiry. Course-only Enrolment references Booking + Participant, with internal attendance/milestones/notes/status. No Fun Dive enrolments. Equipment Item has a stable unique asset ID; Allocation references item, activity, booking and participant with retained reservation/return history. Maintenance references item and actor. Enquiries can convert to Customer. Notification previews and Audit Events reference affected entities. System settings contain future-booking price/rental/refresher defaults. Staff stores role, qualifications, expiry and availability; production should normalize qualifications and attendance into separate relational tables.

## State and migration
The existing `diveos-demo-v1` localStorage key and version 1 envelope remain. `schemaRevision: 3` adds sessions, boats, sites, professional teams, Fun Dive, rental/Refresher/settings fields without clearing prior arrays. Legacy single-instructor assignments become default teams. Existing bookings, participants, documents, allocations and financial amounts are retained. Missing old line items receive a clearly labelled historical total; old computer surcharges are not silently refunded or repriced. Original explicit four-seat activity capacities are retained, independently of the new ratio. Older inventory is not overwritten; add assets if increasing class size requires stock. Repeated migration does not duplicate fixtures or enrolments.

Booking: Awaiting payment → QR Deposit paid or Wise Payment verification → approved Deposit paid / rejected Awaiting payment. Front Desk confirms, then check-in validates operational gates. Training proceeds through internal states to Ready for SSI processing; Manager can record Processed externally. Cancellation retains history and releases reserved equipment; recorded refunds never exceed approved payments. Refresher: Required → Scheduled → Completed, or reasoned Manager Overridden; requirement and charge persist. Equipment: Reserved → Checked out → Returned; correction returns the old reservation and creates a new one atomically in a cloned state. Damage blocks future use until Manager service.

Staffing is evaluated for every session using Bangkok intervals (half-open time boundaries). Effective capacity, professional coverage and equipment demand are separate. A persisted Ready label is never sufficient: action guards recalculate readiness. Training completion requires an assigned qualified Instructor, not merely an administrative role.

## Production migration
1. Introduce managed PostgreSQL migrations with foreign keys, currency/status checks, payment idempotency, transactional capacity locks and interval exclusion constraints for staff/assets.
2. Add authenticated Netlify Functions/API and replace the browser adapter. Share validation but derive identity and prices on the server; never trust browser role/state.
3. Normalize role permissions, qualifications, session attendance/milestones and status histories. Use least-privilege row policies and restricted document storage.
4. Stage migrations with fictional fixtures, rollback/backup exercises and concurrency tests; never import unreviewed personal browser data.
5. Implement payment provider webhooks, signatures, reconciliation and notification adapters only after credentials/support are verified. Disable demo-role selection in production.
6. Complete privacy, legal, operational, retention and recovery reviews before real use.

Browser persistence is neither a secure authorization boundary nor a multi-user transactional database. Real authentication, database and integrations remain production work.
