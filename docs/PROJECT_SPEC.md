# Project specification

The complete original brief and confirmed 2026-09-10 amendment are preserved in MASTER_PROMPT.md. The amendment supersedes the original universal four-person maximum and customer size/computer-upsell controls. Phase 1–2 remains intact; this checkpoint implements the amended Phase 3 scope. The full five-phase MVP is not yet complete.

## Business rules
Natneef Diving is fictional, based in Thailand. English UI, THB integer satang, Asia/Bangkok dates. Course prices: Open Water THB 8,500, Advanced 9,500, Nitrox 3,500. Deposit uses each product's basis points (default 10%); remaining balance uses approved payments. Existing booking financial snapshots never change when settings change.

Customers select rental categories/packages only, never sizes or assets. Every in-water course includes Wetsuit, Fins, Regulator, Mask and Dive Computer with no surcharge. Course Template and Session fields configure in-water status and included equipment for future dry activities. Any in-water session keeps all five standard items included.

Fun Dive is recreational, requires certification agency/level/number, logged dives and last-dive date, and creates no training enrolment. Base price excludes rental. Options: own equipment, full package (default five standard items) or individual categories. Rentals charge per activity calendar day, inclusively. Package contents are snapshotted on new bookings.

A last-dive gap strictly greater than three calendar months triggers a mandatory priced Refresher. Calendar anniversaries clamp to month-end. The threshold and fee are Manager-configurable for new bookings. Booking remains allowed. Check-in/readiness is blocked until scheduled and completed, or explicitly overridden by Manager with reason, actor, timestamp and audit. The required record and fee remain after override.

Default staffing is one qualified professional per four participants. Each in-water course session requires an Instructor as responsible lead; DM may assist. Qualified Instructor or DM may lead Fun Dive. Effective ratio is the strictest (lowest) of default/template/activity/session/site, minimum count is the highest, and participant maximum is the lowest of template/activity/session/site/boat limits. Six participants require two professionals. Groups exceeding the default ratio unit must have their team assigned before booking; smaller bookings may await assignment, but never pass readiness with missing coverage. Activity readiness is revalidated against staffing, qualification expiry/availability/overlap, Refresher, document acknowledgement/review, equipment stock and boat conflicts. Maximum capacity is configurable independently; original activities retain their explicit four-seat default until changed.

Assigned Instructor/DM fits and allocates physical assets. Front Desk/Manager can correct reservations with a meaningful reason, retaining old allocation records and audit history. Checked-out items must be returned before correction. Overlapping asset reservations are rejected; return with damage removes an item from availability. Instructor/DM may add operational notes and assist check-in. Only qualified assigned Instructor approves training completion; Manager may subsequently record external processing.

## Routes
Public: /, /demo, /login, /courses, /courses/:courseId (including fun-dive).
Customer: /portal, /portal/bookings/:bookingId, /portal/profile, /portal/training.
Staff: /app, /app/calendar, /app/staffing, /app/equipment, /app/boats (Front Desk/Manager edit; assigned Instructor/DM read only).
Front Desk/Manager: /app/customers, /app/enquiries, /app/new-booking.
Instructor/Manager: /app/training (command-level completion restrictions still apply).
Manager: /app/settings, /app/reports.

## Assumptions and simulation boundaries
Fictional prices: Fun Dive THB 2,500/trip; Refresher 1,000; full equipment package 500/day; computer 250/day; wetsuit 150/day; fins 100/day; regulator 200/day; mask 50/day. These require operator confirmation. Seed sessions are daily 09:00–16:00 and capacities/sites/boats/qualifications are illustrative. Refresher completion is a demo operational attestation, not proof of training. No medical answers, official certification, legal advice, actual payments or messages are provided. See DECISIONS and SECURITY_REVIEW.

## Operational UX revision
Equipment is browsed category → size/model → individual asset. Each asset keeps its stable code and history; bulk creation produces unique sequential codes. Calendar has Day, Week, Month and List views. Month entries show participant and professional coverage plus Ready/Warning/Blocked state. Daily staffing shows all sessions, manual coverage and staff employment type.

Boat capacity includes every booking participant and assigned professional. Booking groups may move between manifests for the same activity. Seats must be within capacity, unique and available. Consecutive suggestions fill only empty seats and preserve confirmed assignments. Crew roles and crew-seat policy require operator approval before production.
