# Security and privacy review — Phase 1/2

This is a fictional browser demo, not a production booking service. One-click identity and localStorage are user-editable and provide no secrecy. Do not enter real names, contact data, medical answers or payments. Instructor rendering excludes financial details, but all browser fixture data is inspectable; production requires server-side filtered responses.

Controls implemented: domain role/ownership checks, integer currency calculations, aggregate capacity validation, duplicate-payment protection, validated status transitions, immutable commands, persist-before-success, HTML escaping through React, no HTML injection API, versioned storage, explicit reset confirmation, payment rejection confirmation, restrictive production CSP/security headers, ignored secret files, no actual provider credentials. Audit events contain fictional identity references only.

Production gates: verified authentication; server validation/authorization on every command; transactional capacity and payment idempotency; database isolation and least privilege; restricted encrypted document storage; webhook signature verification; backups; logs without private payloads; monitoring; legal consent/retention/deletion procedures. Real provider integrations must remain disabled until separately implemented and tested.

Legal/operational questions for production: approved Thai terms and waiver wording; medical clearance/review responsibility; age/guardian rules; prerequisites and agency standards; booking expiry/cancellation/refund policy; tax and receipt requirements; instructor qualifications; equipment inspection and maintenance intervals; privacy retention/consent policy. None blocks the fictional Phase 2 preview.

## Amended operational scope
Command checks now distinguish assigned Instructor and Divemaster from financial staff. Instructor/DM financial/admin routes remain hidden/denied. Only qualified assigned Instructor approves training; Manager external processing follows an approved internal handoff. Equipment and operational-note writes require an assigned professional or Front Desk/Manager. Customer inputs cannot select physical assets/sizes. Reservation corrections retain history with reasons; Manager Refresher override retains required record/fee and actor/time/reason audit. Qualification/availability overlap, staff deficits, document flags and Refresher gates are rechecked at operational actions.

All of these are demo behavior controls, not a server security boundary: localStorage and one-click role access can be manipulated by the browser user. Certification data are fictional self-declarations, not externally verified qualifications. Do not use real medical, identity or payment information. Production requires authenticated server checks, transactional reservations, verified staff credentials and operator-reviewed Refresher/document procedures. No additional credentials were introduced or committed.

## Operational UX revision
Manifest mutations require Front Desk or Manager. Assigned Instructor/DM visibility is read only and limited to their activities; customers are denied. Financial and medical details are absent. Seat, capacity and group commands validate current state and append audit events. Equipment bulk creation remains Manager-only and rejects code collisions.

These remain browser-demo controls. Production requires authenticated server filtering, transactional booking/staff/equipment/seat locks, tamper-resistant audit and a reviewed crew/seat policy. No new credential or real personal-data dependency was added.
