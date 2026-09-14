# Progress

Phase 1–3 remains verified. The approved, feedback-independent Phase 4 scope is published to PR #1 and verified on its Netlify Deploy Preview. The full original five-phase MVP is not yet complete.

| Module | Classification | Current behavior / remaining work |
| --- | --- | --- |
| Prompt/rules/continuity | Complete and working | Original prompt and amendment preserved; recovery checkpoint before implementation |
| Foundation/public overview | Working with demo data | React SPA, public homepage, courses and Fun Dive, Netlify configuration |
| Five demo roles | Working with demo data | Customer, Front Desk, Instructor, Divemaster, Manager; route and command checks |
| Booking/portal | Working with demo data | Shared staff/customer booking, calculated deposit, persisted lines, customer training/profile |
| QR/Wise/manual payments | Simulated integration | Approved/pending/rejected records, balances, manual deposits; no money movement |
| Rental/course equipment pricing | Working with demo data | No customer fitting controls; five in-water items included; Fun Dive package/category daily prices |
| Fun Dive/Refresher | Working with demo data | Certification/experience, automatic requirement/fee, schedule/completion gate, audited Manager override |
| Staffing/capacity | Working with demo data | Manual teams and session overrides, qualified Instructor/DM ratios, strictest rules, independent limits, overlaps/readiness |
| Equipment assets | Working with demo data | Professional fitting, conflict protection, checkout/return/damage, corrected reservation history, Manager inventory/service |
| CRM/enquiries | Working with demo data | Profile editing, search/create customer, enquiry conversion, manual booking entry |
| Training | Working with demo data | Assigned Instructor attendance/milestones/notes/completion; DM denied; no Fun Dive enrolments or official certification |
| Documents | Partially complete | Placeholder acknowledgements, staff review/status/version/expiry; real document-type workflows/uploads remain |
| Product/course management | Working with demo data | Manager create/edit/duplicate, pricing, deposit, capacity, inclusions and publication controls; booked financial snapshots remain fixed |
| Dive sites and boats | Working with demo data | Manager create/edit, active state, capacity and notes; assignment UX remains unchanged pending feedback |
| General settings | Working with demo data | Contact, language, booking prefix, deposit/tax defaults and simulated-channel configuration; THB/Bangkok are locked |
| Manager dashboard | Working with demo data | Live booking, payment, training, document, enquiry and notification summaries; staffing/equipment widgets explicitly deferred |
| MVP reports | Working with demo data | Product/status/date filters with bookings, participants, booked value, deposits, receipts and outstanding balances |
| Audit history | Working with demo data | Searchable actor/date event ledger covering Phase 4 mutations; device-local and non-tamper-resistant |
| Notifications | Simulated integration | Manager-generated internal/channel message previews, unread state and audit events; nothing is sent |
| Feedback-dependent operational UX | Pending user-approved UX revision | Equipment/maintenance UI; calendar including Month View; staffing assignment; Activity default team; readiness/workload indicators; dependent dashboard widgets |
| Browser migration | Complete and working | Additive revision 3, IDs and old financial snapshots retained; no reset required |
| QA | Complete and working | 39 domain checks and all 40 desktop/mobile browser cases passed locally, including Phase 1–3 regression and Phase 4 accessibility |
| PR/preview | Complete and working | PR #1 updated and unmerged; GitHub Actions run 34817419820 and Netlify Deploy Preview passed for 3438695 |
| Production database/auth/integrations | Recommended after MVP | Requires server implementation, credentials and operator/legal/privacy decisions; demo does not depend on credentials |

Next: await user review of the Phase 4 preview or continue only with an approved backlog item. No merge is authorized.
