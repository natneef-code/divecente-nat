# Progress

Phase 1–4 and the approved operational UX revision are published to PR #1 and verified on its Netlify Deploy Preview. The production system still depends on backend, provider and operator decisions.

| Module | Classification | Current behavior / remaining work |
| --- | --- | --- |
| Prompt/rules/continuity | Complete and working | Original prompt and amendment preserved; recovery checkpoint before implementation |
| Foundation/public overview | Working with demo data | React SPA, public homepage, courses and Fun Dive, Netlify configuration |
| Five demo roles | Working with demo data | Customer, Front Desk, Instructor, Divemaster, Manager; route and command checks |
| Booking/portal | Working with demo data | Shared staff/customer booking, calculated deposit, persisted lines, customer training/profile |
| QR/Wise/manual payments | Simulated integration | Approved/pending/rejected records, balances, manual deposits; no money movement |
| Rental/course equipment pricing | Working with demo data | No customer fitting controls; five in-water items included; Fun Dive package/category daily prices |
| Fun Dive/Refresher | Working with demo data | Certification/experience, automatic requirement/fee, schedule/completion gate, audited Manager override |
| Staffing/capacity | Complete and working | Daily session coverage, 12 staff with employment types, clearly labelled activity team and session-only overrides; qualification/ratio/conflict rules preserved |
| Equipment assets | Complete and working | Category/size-model/asset drilldown, summaries, search/filter/pagination, sequential bulk creation plus allocation and history |
| CRM/enquiries | Working with demo data | Profile editing, search/create customer, enquiry conversion, manual booking entry |
| Training | Working with demo data | Assigned Instructor attendance/milestones/notes/completion; DM denied; no Fun Dive enrolments or official certification |
| Documents | Partially complete | Placeholder acknowledgements, staff review/status/version/expiry; real document-type workflows/uploads remain |
| Product/course management | Working with demo data | Manager create/edit/duplicate, pricing, deposit, capacity, inclusions and publication controls; booked financial snapshots remain fixed |
| Dive sites and boats | Complete and working | Manager resources plus group manifests, professional occupancy, configurable/unavailable seats, suggestions and audited edits |
| General settings | Working with demo data | Contact, language, booking prefix, deposit/tax defaults and simulated-channel configuration; THB/Bangkok are locked |
| Manager dashboard | Working with demo data | Live booking, payment, training, document, enquiry and notification summaries; staffing/equipment widgets explicitly deferred |
| MVP reports | Working with demo data | Product/status/date filters with bookings, participants, booked value, deposits, receipts and outstanding balances |
| Audit history | Working with demo data | Searchable actor/date event ledger covering Phase 4 mutations; device-local and non-tamper-resistant |
| Notifications | Simulated integration | Manager-generated internal/channel message previews, unread state and audit events; nothing is sent |
| Operations calendar | Complete and working | Day/Week/Month/List, occupancy and professional coverage, status, links, filters and mobile reflow |
| Browser migration | Complete and working | Additive revision 4; prior IDs, bookings, money, documents, training, allocations and events retained |
| QA | Complete and working | 45 domain checks, production build and 52 desktop/mobile browser cases pass locally; eight screenshots inspected |
| PR/preview | Complete and working | Operational commit 15e502e, Actions run 34940591970 and all 52 live browser cases passed; backup branch remains at 3438695; PR #1 unmerged |
| Production database/auth/integrations | Recommended after MVP | Requires server implementation, credentials and operator/legal/privacy decisions; demo does not depend on credentials |

Next: owner review of PR #1 and the verified preview. Resolve review findings or continue Phase 5; no merge is authorized.
