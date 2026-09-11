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
