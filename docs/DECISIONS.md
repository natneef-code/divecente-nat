# Decisions and assumptions

- 2026-09-08: Existing repository is not empty: commit 2c7a34d contains a Thai overview named index. Preserve it; rebuild the public overview around the same connected dive-center vision.
- React/Vite chosen over a server framework for straightforward Netlify static deployment with no credentials. Shared domain commands permit later API enforcement. Browser demo is explicitly not production security.
- Netlify hosting is explicitly requested, overriding any generic Sites hosting workflow.
- Current scope is Phase 1 and Phase 2. Implement and verify this slice before independent operational modules.
- Demo persistence: one browser/localStorage, version 1, fictional data only. One-click roles rather than fake password security. No public environment secrets.
- Assumed course durations: Open Water 3 days, Advanced 2 days, Nitrox 1 day. Prerequisites are generic demo acknowledgements requiring operator review, never official agency content.
- Assumed demo dates generated relative to current Bangkok date; course slots at 09:00 local. Capacity four across all active bookings; bookings reserve capacity while awaiting payment. Expiry policy is Phase 3.
- Included basic rental set; optional dive computer priced at THB 250 per participant for the activity. No tax or discount in initial slice; pricing model reserved for later configuration.
- Deposits apply to total including optional equipment. QR graphic is a non-scannable demo placeholder. Wise uses fictional proof references, no file upload or real bank details.
- Demo documents record acknowledgements only; they do not establish medical clearance, legally binding consent or certification.
- Production reference returned HTTP 404 during direct network inspection on 2026-09-08. Preserve index as the content reference and do not modify production.

- 2026-09-09: User requested continuation after verified Phase 2 delivery. Proceed to Phase 3; retain the same branch/PR and never merge without approval. Expand stored data with an additive migration that preserves existing bookings. Course blocks reserve full inclusive days for conservative instructor/boat/equipment overlap checks.

## 2026-09-10 — Confirmed operating-rule amendment
- Preserved and repaired the unfinished Phase 3 work; baseline build, 9 domain and 20 browser checks passed before local recovery commit 67143e2. No Phase 1–2 rebuild.
- The user's amendment overrides fixed class-size four and customer fitting choices. Four is the default professional ratio unit; old activity capacities remain explicit editable values rather than being silently enlarged.
- Reused React/TypeScript and browser adapter. Additive schema revision 3 preserves old money/IDs/history. Historical extras retain their original amount; no silent refund or repricing.
- Calendar-month Refresher calculation is strict “greater than”; end-of-month clamps to valid anniversary date. Requirement/price/threshold are snapshots. Manager settings affect new bookings. Audited overrides retain required status and fee.
- Fictional assumptions: Fun Dive THB 2,500/trip, Refresher 1,000, full package 500/day, computer 250/day, wetsuit 150/day, fins 100/day, regulator 200/day, mask 50/day. Rental days count inclusive Bangkok activity dates. No real prices have been confirmed.
- Seed session model uses one daily 09:00–16:00 block, preserving existing dates and one template per product. Nitrox defaults dry. Site/boat capacities and staff qualifications are fictional, not safety guidance.
- Activity team defaults and explicit Session overrides support manual Instructor/DM staffing. The strictest scope wins; capacity, stock and professional counts are separate. Groups above the default ratio unit require staffing before reservation; smaller bookings can await staffing but cannot check in unstaffed. This conservative demo reservation policy can be refined with the operator.
- Equipment corrections only replace Reserved items, require a reason, retain the old Returned record and audit. Checked-out items must be returned first. Full-package contents are snapshotted when booking.
- Refresher completion is an assigned professional's demo attestation. No real Refresher teaching content or linked instructional scheduling engine is claimed. Calendar-date scheduling allows same-day Refresher; precise before-dive timing and operator evidence remain post-MVP review.
- Instructor owns training approval. Manager can record external processing only after Ready for SSI processing. DM has operational notes/fitting/check-in access and no course completion approval.
- Demo medical acknowledgement remains distinct from actual clearance. Review-required/expired statuses block operations. Legal and safety review and real document workflows remain production gates.
