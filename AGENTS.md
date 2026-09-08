# DiveOS permanent repository instructions

## Authority and scope
Read docs/MASTER_PROMPT.md and every document in docs/ before continuing. The Master Prompt is the user-supplied product brief, not proof that a feature exists. Current user instructions take precedence. Work in this repository; retain the original index reference. Initial authorized delivery is Phase 1 and Phase 2; deploy and verify the vertical slice before expanding.

## Product and safety
- Keep / a public overview; Try DiveOS links to /demo. Support the routes in PROJECT_SPEC.
- Natneef Diving is fictional. Use English, THB integer satang, Asia/Bangkok, maximum four students, computed 10% deposit, manual instructor assignment.
- Browser demo data is fictional and device-local. Demo role selection is not secure authentication. Never collect real personal, medical, payment, or credential data.
- Enforce role and ownership checks in application commands; production needs server authentication, authorization, validation, transactions, and row-level access.
- Payments and notifications are simulations; no money movement or real messages. No official SSI integration or certification. Use Ready for SSI processing only for internal training status.
- Legal placeholders must say: Demo content — requires review by a qualified Thai legal and diving-safety professional before production use.
- No passwords, tokens, private keys, credentials, private customer data, or secrets in source, docs, logs, commits, or browser bundles. Keep local env files ignored. Only safe placeholder names in .env.example.
- Enabled controls must work. Label incomplete features honestly. Preserve existing unrelated files and history. Confirm destructive user actions; prefer reversible changes.

## Git and deployment
- Work on build/diveos-mvp, never commit directly to main.
- Logical, frequent runnable checkpoints. First checkpoint is project definitions before implementation.
- Run relevant tests and production build before delivery checkpoints. Push current branch; open/update a PR targeting main.
- No force push/history rewrite unless necessary and explicitly justified. Never merge or replace production without explicit user approval after tested preview.
- Netlify is the requested hosting platform. Verify the actual Deploy Preview URL and direct routes; never infer success from a build alone.

## Continuity
At session start read AGENTS.md and all docs; inspect git status, branch, recent commits; run current tests/build; resume the first incomplete IMPLEMENTATION_PLAN item. Do not restart working architecture without evidence.
Update PROGRESS.md and HANDOFF.md after each meaningful milestone, before changing phase, before input requests, before ending, and when context is low. HANDOFF must contain branch, latest relevant commit, working state, completed/in-progress work, exact next task, backlog, bugs, tests, commands, environment variable names, and blockers.
Before ending: run relevant build/tests, update docs, commit, push, and report the exact continuation step. Record failures and limitations honestly. Keep assumptions in DECISIONS.md and module classifications in PROGRESS.md.
