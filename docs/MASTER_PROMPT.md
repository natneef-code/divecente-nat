# DiveOS — Master End-to-End Build Prompt

You are the lead product architect, UX designer, senior full-stack engineer, QA lead, security reviewer, GitHub maintainer, and deployment manager for my project called “DiveOS.”

Your responsibility is to take DiveOS from its current empty source repository to a complete, usable, deployed MVP that I can open in a browser, test with realistic demo data, and show to dive-school owners and potential collaborators.

Do not stop after giving me advice, an audit, wireframes, or a development plan. Inspect the available resources, make reasonable reversible decisions, implement the application, test it, commit it to GitHub, create a pull request, and verify the Netlify Deploy Preview.

## 1. Authorized resources

You are authorized to access and manage this GitHub repository:

[https://github.com/natneef-code/divecente-nat](https://github.com/natneef-code/divecente-nat)

Repository details:

- Repository: `natneef-code/divecente-nat`
- Default branch: `main`
- The repository is currently empty
- Netlify continuous deployment is already connected to this repository
- Existing production reference: [https://divecente-nat.netlify.app](https://divecente-nat.netlify.app)

Use the GitHub repository as the single source of truth for all new DiveOS source code and documentation.

You may:

- Read the repository
- Create a development branch
- Create and edit files
- Commit implementation work
- Push commits
- Inspect CI or deployment results
- Open and update a pull request
- Fix build failures
- Review the completed change

Do not commit directly to `main` during initial development.

Create a branch named:

`build/diveos-mvp`

Open a pull request into `main` when the working MVP is ready for review.

Do not merge the pull request or replace the production site until the Deploy Preview has been tested and I have approved it.

Never expose or commit passwords, API keys, GitHub tokens, Netlify tokens, database credentials, payment credentials, or other secrets.

## 2. Existing website requirement

The current website at:

[https://divecente-nat.netlify.app](https://divecente-nat.netlify.app)

must remain conceptually represented as the public DiveOS overview.

The existing deployed page may not have source code in the repository. Use it as a visual and content reference where accessible.

You may recreate, improve, or redesign the page, but do not replace the public homepage with an internal dashboard.

The final application structure should be:

- `/` — DiveOS product overview and presentation
- `/demo` — Demo-role selection and guided demo entry
- `/portal` — Customer/student portal
- `/app` — Staff, instructor, and manager application
- `/login` — Authentication or demo login
- `/courses` — Public course catalogue
- `/courses/:courseId` — Public course details and booking entry

The homepage must include prominent calls to action:

- “Try DiveOS”
- “View Courses”
- “Sign In”

“Try DiveOS” must lead to `/demo`.

## 3. Product vision

DiveOS is an operating system for real dive schools and dive centers.

The first version should follow workflows suitable for an SSI-affiliated dive school, while keeping the data model and architecture flexible enough to support PADI or other training organizations later.

DiveOS should eventually help a dive center manage:

- Public website
- Customer enquiries
- Customer accounts
- Diver profiles
- Course discovery
- Course bookings
- Try-diving bookings
- Fun dives
- Dive trips
- Training progress
- Instructor assignments
- Operational schedules
- Boats
- Dive sites
- Equipment rental
- Equipment inventory
- Equipment maintenance
- Medical-declaration status
- Waivers and documents
- Deposits
- Payments
- Refunds
- Customer communication
- Staff operations
- Reports and business performance
- Certification-processing workflows

The MVP must demonstrate a connected customer journey from discovering a course through booking, deposit status, scheduling, document preparation, training progress, and course completion.

Do not copy protected SSI branding, copyrighted training content, proprietary course materials, logos, certification data, or internal systems.

Do not claim that DiveOS is officially integrated with SSI.

For the MVP, use internal training workflows and a final status called:

`Ready for SSI processing`

## 4. Demo dive-center configuration

Use the fictional demo brand:

**Natneef Diving**

Initial settings:

- Country: Thailand
- Currency: Thai baht (`THB`)
- Time zone: `Asia/Bangkok`
- Default language: English
- Architecture should be ready for Thai localization later
- Maximum class size: four students
- Instructor assignment: manual selection by authorized staff
- Default booking deposit: 10% of total booking price

Initial courses:

| Course | Price | Deposit | Remaining balance |
| --- | ---: | ---: | ---: |
| Open Water | THB 8,500 | THB 850 | THB 7,650 |
| Advanced | THB 9,500 | THB 950 | THB 8,550 |
| Nitrox Specialty | THB 3,500 | THB 350 | THB 3,150 |

The system must calculate the deposit and remaining balance rather than relying only on hard-coded display values.

Course duration, prerequisites, capacity, included equipment, and schedule must be configurable.

Create sensible demo values for fields that have not yet been decided, but label them as assumptions.

## 5. User roles

Implement role-based navigation and permissions for at least four roles.

### Customer or student

Customers should be able to:

- Browse courses and activities
- Create or access an account
- Maintain a diver profile
- Record certification level
- Record approximate logged-dive count
- Record last-dive date
- Add an emergency contact
- Create a booking
- Add participants
- Select equipment
- Review prerequisites
- View required documents
- Complete mock forms
- Select a payment method
- Perform a clearly labelled demo payment
- View booking confirmation
- View upcoming activities
- View payment and document status
- View training progress
- View previous bookings

### Front-desk staff

Front-desk staff should be able to:

- Manage enquiries
- Search customers
- Create customers
- Edit permitted customer data
- Create bookings manually
- Add booking participants
- Check prerequisites
- Review document status
- Review payment status
- Confirm manual payments
- Check customers in
- Assign rental equipment
- View the operational calendar
- Change booking statuses

### Instructor or divemaster

Instructors should be able to:

- View assigned activities
- View assigned students
- View relevant participant information
- Record attendance
- Update training milestones
- Add instructor notes
- Report problems
- Mark training ready for completion processing

Instructor access must exclude unnecessary financial, administrative, and sensitive medical details.

### Manager or administrator

Managers should be able to:

- Manage products and courses
- Manage prices and deposits
- Publish schedules and availability
- Manage customers
- Manage bookings
- Manage staff
- Manage instructor qualifications
- Manage dive sites and boats
- Manage equipment
- Review payments
- Review document status
- Configure system settings
- View dashboards and reports
- View operational conflicts
- View audit history

## 6. Public overview website

Build a polished, responsive DiveOS overview at `/`.

It should communicate:

- What DiveOS is
- Who it is for
- Problems it solves
- Customer experience
- Staff operations
- Training management
- Equipment management
- Payment tracking
- Reporting
- Example workflow
- Current MVP status
- Which integrations are simulated
- How to try the demo

Use a professional ocean-inspired visual direction without copying SSI branding.

The site should feel:

- Modern
- Trustworthy
- Calm
- Professional
- Easy for non-technical dive-center owners to understand
- Responsive on mobile, tablet, and desktop
- Accessible in contrast, structure, and interaction

Reuse useful ideas from the current overview where practical.

## 7. Demo entry

Create a guided demo page at `/demo`.

Provide four clear demo entry options:

- Continue as Customer
- Continue as Front Desk
- Continue as Instructor
- Continue as Manager

For the initial preview, one-click demo login is acceptable.

Clearly display that:

- The environment contains fictional data
- Payments are simulated
- Messages are not actually sent
- Medical and waiver content is placeholder content
- SSI connectivity is not active

Provide conventional demo credentials as an alternative if useful.

## 8. Customer CRM

Implement a connected customer and diver profile containing:

- Full name
- Preferred name
- Email
- Phone
- Date of birth
- Nationality
- Preferred language
- Emergency contact
- Certification organization
- Certification level
- Certification number when applicable
- Approximate logged-dive count
- Last-dive date
- Relevant operational notes
- Booking history
- Document status
- Medical-declaration status
- Created and updated timestamps

Do not expose detailed sensitive medical information across all staff roles.

For the MVP, the main operational medical state can be represented using statuses such as:

- Not started
- Submitted
- Review required
- Cleared
- Expired

## 9. Products and course catalogue

Support:

- Courses
- Specialty courses
- Try dives
- Fun dives
- Dive trips
- Equipment rental
- Add-ons
- Deposits
- Full payments
- Discounts
- Taxes and fees

Each product should support:

- Name
- Description
- Category
- Price
- Deposit rule
- Duration
- Capacity
- Prerequisites
- Included items
- Optional add-ons
- Published status
- Available dates

Seed the catalogue with Open Water, Advanced, and Nitrox Specialty.

## 10. Booking workflow

Implement this connected customer journey:

1. Browse courses
2. Open course details
3. Select an available date
4. Select number of participants
5. Enter participant information
6. Select rental equipment or add-ons
7. Review prerequisites
8. Review required documents
9. Accept terms
10. Select QR or Wise
11. Complete a demo/manual payment step
12. Receive confirmation
13. View the booking in the customer portal
14. View the same booking in the staff application
15. View the activity in the operations calendar

Use booking statuses including:

- Enquiry
- Pending
- Awaiting payment
- Payment verification
- Deposit paid
- Confirmed
- Checked in
- In progress
- Completed
- Cancelled
- Refunded
- No-show

Every displayed booking status must be backed by actual application state, not visual-only buttons.

Enforce the maximum class capacity of four students.

## 11. Payment workflows

The MVP payment options are:

### QR payment

Implement a clearly labelled demo QR flow:

- Display the deposit amount
- Display a demo QR image or safe generated placeholder
- Include a `Simulate successful payment` action
- Create a payment record
- Change the booking status to `Deposit paid`
- Recalculate the remaining balance
- Show the transaction to authorized staff

Do not present the QR as a real payment unless valid payment credentials are configured.

The architecture should allow PromptPay or a supported Thai payment gateway to be integrated later.

### Wise transfer

Implement Wise as a manual-transfer workflow:

- Display placeholder transfer instructions
- Allow the customer to mark the transfer as submitted
- Allow a mock proof-of-payment record or placeholder upload
- Change the status to `Payment verification`
- Allow authorized staff to approve or reject the payment
- Update the booking balance after approval

Do not claim a Wise API integration without real credentials and verified support.

## 12. Operations calendar

Create useful daily, weekly, and list views for:

- Courses
- Pool sessions
- Confined-water sessions
- Open-water sessions
- Fun dives
- Dive trips
- Boats
- Dive sites
- Instructors
- Students
- Capacity

Detect and surface:

- Over-capacity activities
- Missing instructor assignments
- Instructor schedule conflicts
- Boat schedule conflicts
- Equipment conflicts
- Missing customer documents

Instructor assignment must be manual.

The system may suggest available instructors, but authorized staff must make the final selection.

## 13. Training management

Support:

- Course enrolment
- Course prerequisites
- Assigned instructor
- Training sessions
- Attendance
- Training milestones
- Instructor notes
- Completion status
- Certification-processing status

Suggested enrolment states:

- Enrolled
- Scheduled
- In training
- Additional training required
- Training complete
- Ready for SSI processing
- Processed externally

Do not issue or simulate an official SSI certification.

## 14. Equipment management

Create configurable demo inventory for:

- Mask
- Snorkel
- Fins: XS, S, M, L, XL
- Wetsuit 3 mm: XS, S, M, L, XL, XXL
- BCD: XXS, XS, S, M, L, XL
- Regulator set
- Dive computer
- Air tank
- Weight belt
- Weight blocks
- SMB
- Compass
- Dive torch
- Dive bag

Each individual inventory item should support:

- Asset ID
- Category
- Brand
- Model
- Size
- Serial number when applicable
- Availability status
- Current allocation
- Last inspection date
- Next maintenance date
- Damage notes
- Lost status
- Out-of-service status
- Retirement status

Support:

- Assignment to participants
- Check-out
- Return
- Damage reporting
- Maintenance records
- Availability checking
- Conflict detection

Prevent an individual item from being allocated to overlapping activities.

## 15. Staff management

Support:

- Staff profiles
- Roles
- Contact information
- Qualifications
- Qualification expiry
- Availability
- Assigned activities
- Workload
- Active or inactive state

Display alerts for:

- Missing qualifications
- Expiring qualifications
- Schedule conflicts
- Excessive or overlapping assignments

## 16. Documents and forms

Track:

- Medical declaration
- Liability release or waiver
- Terms and conditions
- Parent or guardian consent
- Certification evidence
- Identification

Each record should support:

- Document type
- Status
- Version
- Signed or submitted date
- Review status
- Expiry date when applicable
- Reviewer
- Notes

Use realistic placeholder forms for the MVP.

Clearly label all legal wording as:

`Demo content — requires review by a qualified Thai legal and diving-safety professional before production use.`

## 17. Notifications

Create an internal Notification Center and notification-event model for:

- Booking confirmation
- Deposit reminder
- Outstanding balance reminder
- Course reminder
- Missing documents
- Schedule changes
- Cancellation
- Equipment return
- Training update

Prepare channel configuration for:

- LINE
- WhatsApp
- Facebook
- Instagram

Until business accounts, approvals, and credentials are available:

- Do not send real messages
- Record simulated notification events
- Display message previews
- Mark the integrations as simulated

Design the notification layer so real providers can be connected later without rewriting booking logic.

## 18. Manager dashboard and reports

The manager dashboard should show:

- Today’s activities
- Upcoming bookings
- New enquiries
- Students currently in training
- Capacity utilization
- Revenue summary
- Deposits received
- Outstanding balances
- Missing documents
- Instructor conflicts
- Unassigned sessions
- Equipment conflicts
- Maintenance due
- Recent operational activity

Provide useful filters and states for:

- Loading
- Empty
- Success
- Validation error
- Permission denied
- System error

## 19. Core data model

Design a consistent relational model covering at least:

- Users
- Roles
- Permissions
- Customers
- Emergency contacts
- Staff
- Instructor qualifications
- Products
- Courses
- Course templates
- Availability
- Activities
- Sessions
- Trips
- Dive sites
- Boats
- Bookings
- Booking participants
- Payments
- Payment verification
- Refunds
- Training enrolments
- Training milestones
- Attendance
- Documents
- Medical-declaration status
- Equipment categories
- Equipment items
- Equipment allocations
- Maintenance records
- Enquiries
- Notifications
- Audit events
- System settings

Avoid unnecessarily duplicating user, customer, diver, and participant data.

Use:

- Stable IDs
- Created and updated timestamps
- Explicit ownership
- Validation
- Status histories
- Audit-friendly events
- Currency-safe financial values

Document important relationships and state transitions.

## 20. Technical implementation

First inspect the repository and the existing deployment reference.

Because the repository is empty, initialize a maintainable modern web application.

Choose a stack that:

- Works reliably on Netlify
- Supports responsive React-based UI
- Can support a relational database
- Supports authentication
- Supports role-based authorization
- Supports server-side validation
- Uses secure environment variables
- Is straightforward for another developer to maintain
- Can be upgraded from demo mode to production integrations

Avoid unnecessary complexity.

Create at least:

- `README.md`
- `.gitignore`
- `.env.example`
- Application source code
- Database schema or documented equivalent
- Migration strategy
- Seed/demo data
- Architecture documentation
- Setup instructions
- Netlify configuration
- SPA redirects or framework-specific routing configuration
- Test configuration
- Deployment instructions

If no database or authentication credentials are available, do not block the MVP.

Create a clearly separated demo data layer that persists sufficiently for a browser demo, then document the exact steps needed to replace it with a real database.

Do not make visual-only pages appear functional. Every enabled action should update real application state.

## 21. UX requirements

Prioritize:

- Simple navigation
- Clear status badges
- Minimal repetitive data entry
- Search and filters
- Helpful validation
- Confirmation before destructive actions
- Strong mobile responsiveness
- Accessible controls
- Accessible contrast
- Keyboard usability
- Clear distinction between customer and staff areas
- Realistic demo content
- Useful empty states
- Consistent date, currency, and status formatting

Use Thai baht and the `Asia/Bangkok` time zone consistently.

## 22. Required end-to-end tests

Test complete workflows rather than only rendering pages.

### Customer journey

Course discovery → course selection → booking → participant information → equipment → documents → payment selection → demo deposit → confirmation → customer portal

### Front-desk journey

New enquiry → customer creation → booking management → document check → payment verification → scheduling → instructor assignment → equipment allocation → check-in

### Instructor journey

View assignment → view students → record attendance → update milestones → add notes → mark training complete → ready for SSI processing

### Manager journey

Create or edit product → publish availability → review booking → inspect payments → identify conflicts → review equipment maintenance → review reports

Also verify:

- Route protection
- Role permissions
- Form validation
- Capacity limit of four
- Deposit calculations
- Remaining-balance calculations
- Instructor conflicts
- Equipment conflicts
- Mobile layout
- Empty states
- Invalid routes
- Error states
- Refresh and state persistence
- Production build
- Netlify routing

Fix critical problems before requesting approval.

## 23. GitHub workflow

Use this workflow:

1. Inspect the repository
2. Create `build/diveos-mvp`
3. Initialize the project
4. Commit the foundation
5. Commit the overview and demo entry
6. Commit the connected booking vertical slice
7. Commit operational modules
8. Commit tests and documentation
9. Push the branch
10. Open a pull request into `main`
11. Inspect the Netlify Deploy Preview
12. Fix build or routing errors
13. Verify the deployed preview
14. Provide the preview URL and test instructions
15. Wait for my approval before merging

Use logical, descriptive commit messages.

Do not force-push unless absolutely necessary.

Do not rewrite unrelated repository history.

Do not merge into `main` without my explicit approval.

## 24. Deployment requirements

Netlify is already linked to the GitHub repository.

Configure the project so Netlify can detect and build it correctly.

Verify:

- Install command
- Build command
- Publish directory
- Framework detection
- Client-side routing
- Environment-variable expectations
- Deploy Preview
- Production build
- Direct route loading
- Mobile behavior

Do not claim deployment succeeded until you open or otherwise verify the deployed URL.

If Netlify does not generate a Deploy Preview automatically, inspect the repository and Netlify configuration, identify the cause, and provide the exact corrective action.

## 25. Final deliverables

At completion provide:

1. GitHub branch URL
2. Pull request URL
3. Verified Netlify Deploy Preview URL
4. Demo customer access
5. Demo front-desk access
6. Demo instructor access
7. Demo manager access
8. Feature-completion checklist
9. Architecture summary
10. Data-model summary
11. Test report
12. Known issues
13. Simulated integrations
14. Required production credentials
15. Security and privacy review
16. Legal and operational questions
17. Prioritized post-MVP roadmap
18. Instructions for reviewing and approving the pull request

Classify every major feature as:

- Complete and working
- Working with demo data
- Simulated integration
- Partially complete
- Blocked by credentials or decision
- Recommended after MVP

## 26. Implementation priority

Do not attempt to build every module independently before demonstrating value.

Build in this order:

### Phase 1 — Repository and architecture

- Inspect resources
- Initialize the project
- Configure Netlify
- Create documentation
- Create application shell
- Create demo data model
- Create role-based navigation

### Phase 2 — First working vertical slice

Build one fully connected journey:

Public Open Water course → booking → 10% deposit → booking confirmation → customer portal → staff booking list → operations calendar

Deploy and test this vertical slice before expanding.

### Phase 3 — Core operations

- CRM
- Course management
- Calendar
- Instructor assignment
- Training progress
- Equipment allocation
- Documents
- Payment verification

### Phase 4 — Management experience

- Manager dashboard
- Reports
- Maintenance alerts
- Conflict detection
- Notification previews
- System settings

### Phase 5 — Quality and handover

- Responsive QA
- Permission testing
- Workflow testing
- Accessibility review
- Error-state testing
- Documentation
- Pull request
- Verified Deploy Preview

## 27. Working rules

- Do not only redesign the landing page.
- Do not stop after the audit or plan.
- Do not claim mock buttons are complete features.
- Do not hide missing backend behavior.
- Do not invent official SSI APIs.
- Do not claim real messaging integrations.
- Do not claim real payments without credentials.
- Do not use real medical or payment information.
- Preserve the public overview as the primary homepage.
- Keep the application accessible through “Try DiveOS.”
- Keep an explicit assumptions list.
- Keep the project runnable after each major phase.
- Verify work before reporting completion.
- Prefer safe, reversible decisions.
- Ask me only about genuine blockers.
- Continue autonomously through implementation when the choice is reversible and within this scope.

Begin now.

First inspect the GitHub repository and existing deployed reference. Then create the `build/diveos-mvp` branch and proceed through implementation.

Your first response should briefly report:

- What you found
- Your selected stack
- Your phase plan
- Any genuine blockers

After that, continue building. Do not stop and wait merely because the repository started empty.

#### Long-running work and continuity protocol

This project is expected to require multiple sessions. Never rely only on conversation history for project continuity.

Create and maintain these repository files:

- `AGENTS.md` — permanent project rules and working instructions
- `docs/PROJECT_SPEC.md` — agreed product scope and business rules
- `docs/ARCHITECTURE.md` — selected stack, application structure, data flow, and important technical decisions
- `docs/IMPLEMENTATION_PLAN.md` — phased checklist with acceptance criteria
- `docs/DECISIONS.md` — decisions made, alternatives considered, and reasons
- `docs/PROGRESS.md` — current completion status for every module
- `docs/HANDOFF.md` — exact continuation instructions for the next agent or session
- `docs/TEST_STATUS.md` — tests performed, results, failures, and remaining QA

Update `docs/PROGRESS.md` and `docs/HANDOFF.md`:

- After every meaningful implementation milestone
- Before switching phases
- Before requesting user input
- Before ending a session
- Whenever the remaining context may be getting low

`docs/HANDOFF.md` must always contain:

1. Current branch
2. Latest relevant commit
3. Current working state
4. Completed work
5. In-progress work
6. Exact next task
7. Remaining backlog
8. Known bugs
9. Test results
10. Build and preview commands
11. Required environment variables without secret values
12. External blockers or decisions needed

Commit working checkpoints frequently using logical commit messages.

Each checkpoint must leave the repository in a runnable state whenever reasonably possible.

Before ending a session:

1. Run the relevant build and tests
2. Update progress and handoff files
3. Commit the checkpoint
4. Push the current working branch
5. Report the exact next continuation step

If work is interrupted, token limits are reached, context is compacted, or a new agent/session takes over, recover state by:

1. Reading `AGENTS.md`
2. Reading all files in `docs/`
3. Inspecting `git status`
4. Inspecting the current branch
5. Reviewing recent commits
6. Running the current tests and build
7. Continuing from the first incomplete task in `docs/IMPLEMENTATION_PLAN.md`

Do not restart the project, replace working architecture, or repeat completed work unless repository evidence shows that a change is necessary.

Never record passwords, tokens, credentials, private keys, customer data, or other secrets in documentation or Git commits.

Begin now.

Start with Phase 1 and Phase 2. Work directly in the authorized GitHub repository.

Create the `build/diveos-mvp` branch, save the complete project specification and continuity documentation, and commit the documentation checkpoint first.

Then implement the first complete vertical slice:

Public Open Water course → booking → 10% demo deposit → booking confirmation → customer portal → staff booking list → operations calendar.

Run the build and relevant tests, commit all working changes, push the branch, open a pull request, and return the verified Netlify Deploy Preview URL.

Continue autonomously unless there is a genuine blocker. Do not merge into `main` without my explicit approval.


# Confirmed business-rule amendment — 2026-09-10

This user-approved amendment supersedes conflicting original equipment, role, capacity and staffing requirements above. The original prompt is retained for history.

Continue the DiveOS project from the current local workspace and repository state.

Phase 1–2 is already implemented, tested, published to `build/diveos-mvp`, and available through PR #1. Do not rebuild or replace the verified Phase 1–2 vertical slice.

Phase 3 contains unfinished local changes. Before modifying files:

1. Read `AGENTS.md` and all project documents in `docs/`.
2. Inspect the current branch, `git status`, local uncommitted files, and recent commits.
3. Preserve all recoverable Phase 3 work.
4. Fix the existing JSX syntax error in `CRM.tsx`.
5. Run the build and relevant tests to establish the current baseline.
6. Create a safe checkpoint before continuing major implementation.

Apply the following confirmed business-rule corrections and additions.

## 1. Customer equipment selection

Customers must not select equipment sizes or individual equipment asset numbers during a course or Fun Dive booking.

Remove customer-facing controls that ask customers to select:

* Wetsuit size
* Fin size
* Mask size or model
* Regulator asset
* Dive Computer asset
* Any individual equipment code or inventory number

Customers may select only the rental category or rental package when applicable. They must never reserve a specific physical asset themselves.

Exact equipment fitting and allocation are operational staff responsibilities.

## 2. Equipment assignment responsibility

Instructor or Divemaster must be able to select and assign:

* Equipment category
* Size
* Individual asset code or asset number
* Participant receiving the equipment
* Check-out status
* Return status
* Damage or maintenance notes

Front Desk must be able to view and correct equipment assignments.

Example:

* Participant: Alex Morgan
* Equipment: Fins
* Size: M
* Asset number: FIN-010

Use stable and unique asset identifiers.

Prevent the same physical item from being assigned to overlapping active activities.

Maintain assignment history rather than replacing previous records without an audit event.

## 3. Course equipment rules

For courses containing in-water training sessions, the standard required equipment is included in the course price:

* Wetsuit
* Fins
* Regulator
* Mask
* Dive Computer

The customer does not choose sizes or assets during booking.

Instructor or Divemaster fits and assigns the individual items later.

Equipment inclusion must be configurable by Course Template or Session so future courses without in-water training can use different rules.

Do not charge a separate Dive Computer rental fee when it is included in an in-water course.

## 4. Fun Dive definition

Add Fun Dive as a distinct product/activity type.

A Fun Dive is recreational diving for a customer who already holds a recognized diving certification. It is not a training course.

Fun Dive bookings must collect or confirm:

* Certification agency
* Certification level
* Certification number
* Number of logged dives
* Date of last dive

The system must distinguish Fun Dive participants from course students.

Fun Dive activities do not create course-training milestones or certification-processing records.

## 5. Fun Dive equipment options

For a Fun Dive, customers may select:

* No rental equipment
* Full Equipment Package
* Individual rental categories

The Full Equipment Package includes:

* Wetsuit
* Fins
* Regulator
* Mask
* Dive Computer

Customers selecting individual rentals may separately select Dive Computer rental.

Dive Computer is not automatically included in the base Fun Dive price.

Dive Computer rental is charged per day.

The rental price is not yet confirmed. Make it Manager-configurable and use a clearly labelled fictional demo price until the real price is provided.

Customers select only the package or equipment category. Instructor/Divemaster later assigns the exact size and physical asset number.

## 6. Refresher rule

If the customer’s last recorded dive was more than three months before the Fun Dive date, a Refresher becomes mandatory.

The customer must still be allowed to create the Fun Dive booking.

The system must automatically:

1. Detect the gap between the last-dive date and Fun Dive date.
2. Add a mandatory Refresher requirement to the booking.
3. Display the requirement clearly to the customer.
4. Display it to Front Desk, Instructor, Divemaster, and Manager.
5. Add the Refresher as a required booking line item or linked required activity.
6. Mark the Fun Dive booking as requiring Refresher completion.
7. Prevent Fun Dive check-in or operational clearance until the required Refresher is scheduled and completed.

The three-month threshold must be configurable by Manager, with three months as the default.

The Refresher price is not yet confirmed. Make it Manager-configurable and use a clearly labelled fictional demo price.

Record any Manager override as an audit event; do not silently remove the requirement.

## 7. Staff roles

Support these distinct operational roles:

* Instructor
* Divemaster
* Front Desk
* Manager

Instructor and Divemaster are not interchangeable in every workflow.

### Course rules

Every in-water course Session must have at least one assigned Instructor.

A Divemaster may:

* Assist the Instructor
* Help manage students
* Prepare participants
* Fit and allocate equipment
* Assist with operational check-in
* Record permitted operational notes

A Divemaster must not be the only responsible training professional for an in-water course Session.

Only an appropriately authorized Instructor may own or approve course-training completion.

### Fun Dive rules

A qualified Instructor or Divemaster may lead a Fun Dive.

The lead and assisting professionals must appear in the operational schedule.

## 8. Staffing ratio

Use a default staffing ratio of one qualified dive professional per four participants.

For courses:

* One to four students require at least one Instructor.
* Five to eight students require at least one Instructor plus one additional Instructor or Divemaster.
* Every additional group of up to four students requires another qualified Instructor or Divemaster.
* At least one Instructor remains mandatory for every in-water course Session.

For Fun Dives:

* One to four divers require one qualified Instructor or Divemaster.
* Five to eight divers require two qualified Instructors/Divemasters.
* Continue using one professional for every additional group of up to four divers.

Manager must be able to override or configure staffing requirements separately for:

* Course Template
* Individual Session
* Fun Dive Trip
* Dive Site

A stricter configured requirement must override the default ratio.

The system must calculate and display:

* Required professional count
* Assigned professional count
* Missing staff count
* Whether the activity is operationally ready

Do not allow an activity to be marked operationally ready if staffing is below the effective requirement.

Detect overlapping Instructor and Divemaster assignments.

## 9. Capacity model correction

Do not treat four participants as a permanent universal maximum.

Separate:

* Participant capacity
* Staffing coverage
* Boat capacity
* Equipment availability
* Course or Trip configured maximum

An activity may contain more than four participants when sufficient qualified professionals and operational capacity are assigned.

For example:

* Six course students may be accepted when at least one Instructor and one additional Instructor or Divemaster are assigned, provided the Course/Session maximum, boat capacity, and equipment availability permit it.
* Six Fun Dive customers require at least two qualified leaders or assistants under the default 4:1 ratio.

The Manager may configure a lower or higher maximum for a specific Course, Session, Trip, or Dive Site.

## 10. Required UI changes

Update or add connected UI for:

### Customer booking

* Remove customer equipment-size selection.
* Remove customer asset-number selection.
* For in-water courses, show standard equipment as included.
* For Fun Dive, allow Full Equipment Package or individual rental-category selection.
* Show Dive Computer rental as per-day when selected individually.
* Collect certification and dive-experience information for Fun Dive.
* Show mandatory Refresher clearly when triggered.

### Equipment workspace

Allow Instructor, Divemaster, and Front Desk to:

* View participants requiring equipment
* Select equipment type
* Select size
* Assign a unique asset number
* Detect conflicts
* Mark checked out
* Mark returned
* Record damage or maintenance issues

### Staffing workspace

Allow authorized staff to:

* Assign Instructor
* Assign Divemaster
* See the effective staffing ratio
* See assigned versus required staff
* Detect schedule overlaps
* See missing-Instructor errors for courses
* See whether the activity is operationally ready

### Manager configuration

Allow Manager to configure:

* Default staffing ratio
* Course-specific staffing requirement
* Session-specific staffing requirement
* Trip-specific staffing requirement
* Dive Site-specific requirement
* Refresher threshold
* Refresher price
* Equipment-package contents
* Dive Computer daily rental price
* Activity participant maximum

## 11. Data migration

Preserve existing fictional bookings and browser-local demo data where reasonably possible.

Use additive versioned migration for the existing localStorage data.

Do not break the verified Phase 1–2 booking, QR, Wise, portal, staff-list, calendar, document, capacity, or route-permission behavior.

Where the previous fixed four-person capacity conflicts with the new staffing-based capacity rules, migrate to the new model while retaining four as the default ratio unit rather than the universal maximum.

## 12. Tests

Add or update tests for at least:

1. Course customer cannot select equipment size or asset number.
2. Course containing in-water training includes Dive Computer without a separate rental charge.
3. Fun Dive base price excludes Dive Computer.
4. Fun Dive Full Equipment Package includes Dive Computer.
5. Individual Fun Dive Dive Computer rental is charged per day.
6. Instructor/DM assigns exact equipment size and asset number.
7. Front Desk can correct an equipment assignment.
8. An equipment asset cannot be assigned to overlapping activities.
9. Fun Dive requires certification information.
10. More than three months since last dive automatically adds Refresher.
11. A Refresher-required customer may create a booking.
12. Fun Dive check-in is blocked until the required Refresher is completed.
13. One to four course students require one Instructor.
14. Six course students require one Instructor plus one Instructor or Divemaster.
15. A course Session cannot be operationally ready with only a Divemaster.
16. Six Fun Dive customers require two qualified professionals under the default rule.
17. Manager-configured Course/Session/Trip/Dive Site rules override defaults.
18. Instructor and Divemaster schedule overlaps are detected.
19. Existing Phase 1–2 workflows continue to pass.
20. Desktop and mobile layouts remain functional.

## 13. Documentation and continuity

Update:

* `docs/MASTER_PROMPT.md`
* `docs/PROJECT_SPEC.md`
* `docs/ARCHITECTURE.md`
* `docs/DECISIONS.md`
* `docs/IMPLEMENTATION_PLAN.md`
* `docs/PROGRESS.md`
* `docs/HANDOFF.md`
* `docs/TEST_STATUS.md`
* `docs/SECURITY_REVIEW.md` when applicable

Record all fictional placeholder prices and unresolved operational assumptions clearly.

## 14. Completion workflow

After fixing and implementing this scope:

1. Run formatting checks.
2. Run domain/unit tests.
3. Run the production build.
4. Run desktop and mobile browser tests.
5. Inspect the resulting UI.
6. Update all continuity documents.
7. Commit safe working checkpoints.
8. Push to the existing `build/diveos-mvp` branch.
9. Update PR #1.
10. Verify the Netlify Deploy Preview.
11. Return the PR URL, verified Preview URL, test results, completed features, unresolved assumptions, and remaining Phase 3 backlog.

Do not merge PR #1 into `main` without my explicit approval.
