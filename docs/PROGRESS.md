# Progress

Phase 1–2 remains verified. The 2026-09-10 amended Phase 3 scope is implemented, published to PR #1 and verified on its Netlify Deploy Preview. The full original five-phase MVP is not yet complete.

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
| Course/availability administration | Partially complete | Existing price/deposit/publication/capacity and template/session inclusion editing; full creation/publishing UI remains |
| Boats/sites/qualifications | Partially complete | Configurable capacities/rules and qualified staff fixtures/conflicts; full administration/workload UI remains |
| Reports/audit | Working with demo data | Basic payment/balance/training totals, operational alerts, audit history; richer reports remain |
| Notifications | Simulated integration | Internal event/message previews; real providers and complete event coverage remain |
| Browser migration | Complete and working | Additive revision 3, IDs and old financial snapshots retained; no reset required |
| QA | Complete and working | 33 domain checks passed locally; all 30 desktop/mobile cases passed locally and against the deployed preview |
| PR/preview | Complete and working | PR #1 updated and unmerged; GitHub Actions and Netlify Deploy Preview passed for f3dcf65 |
| Production database/auth/integrations | Recommended after MVP | Requires server implementation, credentials and operator/legal/privacy decisions; demo does not depend on credentials |

Next: user reviews PR #1 and its Deploy Preview. Continue the remaining Phase 3 backlog after feedback. No merge is authorized.
