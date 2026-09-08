# Test status

Definitions checkpoint: no app or test runner yet. Repository branch/status inspected. Existing public reference failed web fetch; browser verification pending.

Required Phase 1/2 checks: domain financial/capacity/ownership/status validation; booking/payment integration; refresh persistence; customer and staff same-booking visibility; instructor financial exclusion; mobile layout; empty/error/404 states; production build; direct Netlify routes.

Later phase suites remain unrun: CRM enquiry creation; full training completion; equipment overlap; instructor scheduling; manager product publishing and maintenance/reporting.

Phase 1: production build passed. Nine domain tests cover calculated totals, full deposit/check-in state flow, aggregate capacity, validation, duplicate payments, Wise verification/rejection, role/ownership, immutable commands, missing acknowledgements and past/unpublished activity rejection. First run had one assertion substring mismatch (documents vs document acknowledgements), corrected before rerun.
