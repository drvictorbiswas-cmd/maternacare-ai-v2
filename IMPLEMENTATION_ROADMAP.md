# IMPLEMENTATION ROADMAP — Maternacare AI

**Audit date:** 2026-11-24 · **Repo:** `maternacare-full` (local)  
**Status:** Proposal for review. **No development has started.** Do not begin implementation until you review and approve the audit.

---

## Guiding constraints

1. Upgrade the existing app; do not replace it with a new project.
2. Preserve working features (FastAPI + JS PWA, auth, per-user data, education, traditions, triage, chat, animations, PWA shell).
3. Never activate a subscription without verified payment.
4. No fake auth, fake payments, or simulated production functionality.
5. Do not claim clinical validation without evidence.
6. No API secrets in frontend code.
7. Mother and baby are separate records linked through a family relationship.
8. Content based on current authoritative Indian/WHO guidance, clinician-reviewed, clearly labelled as education (not medical advice).
9. **If Razorpay creates problems, remove it — ship no broken or simulated payment path.**

---

## Phase 0 — Containment (before any feature work) · 1–2 days

**Already implemented in code and verified.** Confirm each before proceeding:

| Task | Acceptance |
|---|---|
| Confirm no API keys/secrets or `data/*.db` in git or frontend | `git log --all -- '*.db'` empty; grep for keys clean |
| Require `JWT_SECRET` at startup; reject weak defaults in production | App refuses to boot without a strong secret; test added |
| Confirm no fake-payment activation path | Unverified payment → 400/503; test asserts failure |
| Confirm no client-side demo checkout (`demo_`/`PLACEHOLDER`) | No code path calls verify with fake data |
| Confirm CORS restricted to exact origins; security headers present | No wildcard+credentials; headers verified by test |
| Persistent, non-dismissible disclaimer on clinical screens | Shows "education, not medical advice" on triage/chat/education |

**Gate:** no real users until Phase 0 is complete.

---

## Phase 1 — Data model, migrations, entitlement · 1–2 weeks

| Task | Acceptance |
|---|---|
| Test v0→v1→v2 migration on a production-shaped copy; document PHI-scrubbing step | `alembic`-style upgrade succeeds; rollback tested |
| Confirm schema: mothers, babies, family_links, pregnancies, consents, care_plan_items, growth_measurements, immunization_records, audit_log, plans, payment_events | Foreign keys on; row-level authorization by user/family |
| Consent records with purpose/version/timestamp/withdrawal; export + delete endpoints | DPDP-aligned; tests for export and erasure |
| Move to managed Postgres (Render) with encryption/backups; attach persistent disk | No SQLite on ephemeral FS; backup-restore drill documented |
| Real Razorpay: server-side order, HMAC webhook verification, idempotency, price catalog from DB, plan validation | Payment cannot activate without valid signature; webhook replay-safe; **if integration proves problematic, remove it** |
| Server-side entitlement dependency on all gated APIs | Unsubscribed user gets 403 on gated endpoints; UI gate cosmetic only |
| Audit log for every sensitive health-data create/update/read | Entries include actor, action, entity, timestamp |

**Gate:** payment and entitlement tests pass; migration tested on production-shaped copy.

---

## Phase 2 — Clinical safety rebuild · 2–3 weeks

| Task | Acceptance |
|---|---|
| Rebuild `triage()` with clinician-reviewed rules, synonyms (en/hi/bn/Hinglish), negation, combination flags, hard emergency override | ≥95% recall on 100+ phrase clinician-created corpus; zero false reassurance; false-positive rate measured |
| Case-based regression tests for all red flags (pregnancy, postpartum, newborn) | CI blocks deploy on any regression |
| Validate EDD inputs (LMP not future, weeks 0–45, parse errors → 400) | Fuzz tests; no 500s |
| Risk-adaptive ANC schedules (WHO 8-contact and Indian NHM options; high-risk override) | User-visible plan choice; clinician override field |
| Enable immunization tracking end-to-end (baby_id, due/given dates, records) | UI + API + tests |
| Apply mother/baby separation to triage, chat, tasks, education | Newborn signs scoped to baby record |
| Persistent "education vs advice" labelling and emergency escalation | UX review sign-off |

**Gate:** clinician review of rules and corpus; documented sign-off before release.

---

## Phase 3 — Auth hardening & product completion · 2–3 weeks

| Task | Acceptance |
|---|---|
| Short-lived access tokens + refresh rotation, logout everywhere, inactivity timeout | Revocation works; tests |
| Email verification, password reset, rate limiting, lockout, password strength | Negative tests pass |
| **OTP phone verification** (true phone authentication) | OTP flow end-to-end |
| Caregiver/family access with consent; clinician role (read-only by default) | RBAC tests |
| Notifications/reminders (SMS/WhatsApp/push) with consent and quiet hours | Delivery + opt-out tests |
| Growth monitoring with WHO charts and milestone checklist (0–2y) | Data entry + chart rendering |
| Breastfeeding/postpartum tracking modules | Basic logging + education |
| Remove duplicate frontend clinical engine; frontend consumes server content/versioned rules | Single source of truth |
| Fix accessibility (`maximum-scale=1`, focus states, screen-reader labels) | WCAG 2.1 AA spot-check |

**Gate:** full journey walkthrough from planning to 2-year child health.

---

## Phase 4 — Quality, governance, deployment · ongoing

| Task | Acceptance |
|---|---|
| Unit + integration + security + e2e tests; CI pipeline (lint, test, build, scan) | Green CI; no deploy on red |
| Dependency pinning and vulnerability scanning (pip-audit) | No unpatched high/critical |
| Structured logging, metrics, error tracking, uptime/health checks | Dashboards + alerts |
| Staging and production environments; secret manager for all keys | No secrets in repo/env files |
| Clinical governance: reviewer sign-off workflow, content versioning, update SLA, incident reporting | Documented SOP; content audit trail |
| DPDP compliance review, privacy notice, data retention policy | Legal review completed |
| Load testing and DB query optimization (indexes on user_id, due) | Acceptable p95 latency |

---

## Dependencies & sequencing notes

- Phase 1 must precede Phase 2 (baby records needed for newborn/immunization logic).
- Phase 0 must precede everything (containment of credentials/data and unsafe payment path).
- External dependencies you must supply: Render account (+ Postgres), Razorpay keys (or confirm removal if problematic), SMS/notification provider, and qualified clinician reviewers.
- No LLM is in the current product direction; if one is added later for AI-guided education, it must be server-side only, with grounding, guardrails, and clinical review.

## Definition of done for "app is safe to pilot"

- Phase 0–2 complete.
- Zero critical findings open in SECURITY_AUDIT and MEDICAL_SAFETY_AUDIT.
- Clinician sign-off recorded.
- Real payment verified end-to-end (sandbox + one live test) — **or payment gateway removed**.
- No PHI in git; entitlements enforced server-side.

---

*End of implementation roadmap. Awaiting audit approval before development.*
