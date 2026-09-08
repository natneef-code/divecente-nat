# Security and privacy review — Phase 1/2

This is a fictional browser demo, not a production booking service. One-click identity and localStorage are user-editable and provide no secrecy. Do not enter real names, contact data, medical answers or payments. Instructor rendering excludes financial details, but all browser fixture data is inspectable; production requires server-side filtered responses.

Controls implemented: domain role/ownership checks, integer currency calculations, aggregate capacity validation, duplicate-payment protection, validated status transitions, immutable commands, persist-before-success, HTML escaping through React, no HTML injection API, versioned storage, explicit reset confirmation, payment rejection confirmation, restrictive production CSP/security headers, ignored secret files, no actual provider credentials. Audit events contain fictional identity references only.

Production gates: verified authentication; server validation/authorization on every command; transactional capacity and payment idempotency; database isolation and least privilege; restricted encrypted document storage; webhook signature verification; backups; logs without private payloads; monitoring; legal consent/retention/deletion procedures. Real provider integrations must remain disabled until separately implemented and tested.

Legal/operational questions for production: approved Thai terms and waiver wording; medical clearance/review responsibility; age/guardian rules; prerequisites and agency standards; booking expiry/cancellation/refund policy; tax and receipt requirements; instructor qualifications; equipment inspection and maintenance intervals; privacy retention/consent policy. None blocks the fictional Phase 2 preview.
