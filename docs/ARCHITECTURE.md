# Architecture

## Selected stack
React + TypeScript + Vite SPA, React Router, Vitest domain tests and Playwright browser workflow tests. Netlify builds npm run build and publishes dist. SPA fallback serves direct routes. Demo needs no environment variables or backend credentials.

## Structure and flow
src/domain: typed model, fictional seed data, pure validated commands and permission checks. src/data: versioned localStorage persistence adapter and React context. src/pages and shared UI: public and role-scoped views. All writes go through domain commands, persist before reporting success, and produce audit events. No real messaging, authentication, medical records or money movement.

## Relational equivalent
User → role and optional customer/staff identity. Customer → emergency contact and diver attributes. Product/course → availability/activity; activity → course, instructor, boat, site, start/end. Booking → customer + activity + immutable financial snapshot; participants → booking. Payments → booking with method, verification state, amount, timestamps and reference. Documents → participant/type/version/status. Events → actor/entity/action/timestamp. IDs are stable and generated using crypto.randomUUID for new records. Seed IDs are deterministic.

Future tables: roles/permissions; qualifications; course templates; sessions/trips; training enrolments/milestones/attendance; refunds; equipment categories/items/allocations/maintenance; enquiries; notification events/channel settings; system settings. Full field intent lives in MASTER_PROMPT sections 8–19. These are planned, not implemented storage tables.

## State transitions
Awaiting payment → Deposit paid by one successful QR simulation, or → Payment verification by Wise submission. Staff approves pending Wise → Deposit paid, rejects → Awaiting payment. Deposit paid → Confirmed → Checked in. Terminal cancellation policy and refunds follow in Phase 3. A payment cannot be applied twice. Outstanding balance uses approved records only.

## Production migration
1. Introduce managed PostgreSQL and SQL migrations with entity foreign keys, check constraints for currency/status, transaction locking for capacity and unique payment idempotency keys.
2. Add Netlify Functions/API endpoints that invoke shared validation and obtain identity only from verified authentication sessions. Replace browser adapter with API adapter.
3. Configure authentication provider, HttpOnly secure sessions, server role/ownership checks and database row-level policies. Never trust client role or price fields.
4. Import approved seed/demo fixtures into a separate non-production database; do not import browser personal data. Version migrations and test rollback/backups in staging.
5. Add payment gateway signed webhooks, provider idempotency and reconciliation; activate Wise only after supported workflow verification.
6. Add audited restricted document storage, retention/consent/deletion policy, legal review and provider notification adapters. Disable one-click demo access in production.

Browser localStorage offers single-browser continuity, not concurrent transactional capacity, cross-device synchronization, or secure authorization. Production is blocked until the above controls are implemented.
