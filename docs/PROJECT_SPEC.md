# DiveOS project specification

Authoritative full scope: MASTER_PROMPT.md. Phase 1/2 was delivered and preview-verified. The user requested continuation on 2026-09-09; Phase 3 core operations is active under the same unmerged PR.

## Experience
Public overview at /; course catalogue /courses; details /courses/:courseId; demo selection /demo and /login; customer /portal; staff /app. Booking flow collects date, 1–4 named participants, equipment preferences, prerequisite acknowledgement, placeholder document acknowledgements, terms, and QR or Wise method. A booking created by the customer must appear in the same browser's customer portal, authorized staff list, and calendar. QR simulation records a deposit exactly once. Wise submission remains unpaid pending staff review.

## Business invariants
Natneef Diving, Thailand, English, THB, Asia/Bangkok. Monetary values are integer satang. Open Water 850000, Advanced 950000, Nitrox 350000 satang per person. Deposit = rounded total × basis points / 10000 (default 1000). Balance = total minus approved payments. Capacity across all active bookings for an activity must not exceed min(configured capacity, 4). Cancelled/refunded/no-show bookings release capacity. Assignment is manual. No automatic certification.

## Permissions
Customer: own bookings/profile only. Front desk: booking/payment operations and all operational activities. Instructor: assigned roster and operational document status, no payment details. Manager: front-desk access plus aggregate reporting; full administration follows in later phases. Demo identities and storage are public fictional data, not a security boundary.

## Acceptance for this delivery
One connected Open Water booking with a THB 850 deposit per student; refresh persistence; cross-role visibility; capacity rejection; proper protected/invalid routes; responsive UI; tested build; PR and verified preview without merge. Broader CRM, training, equipment assets, document review, reports and real providers remain explicit later-phase backlog.
