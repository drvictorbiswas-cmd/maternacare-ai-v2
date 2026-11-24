# IMPLEMENTATION ROADMAP — Maternacare AI

**Audit date:** 2026-11-24 · **Repo:** `drvictorbiswas-cmd/maternacare-full`
This roadmap is a proposal for review. **No development has started.** Do not begin implementation until the audit is approved.

---

## Guiding constraints

1. Upgrade the existing app; do not replace it with a new project.
2. Preserve working features (FastAPI + JS PWA, auth, per-user data, education, traditions, triage, chat, animations, PWA shell).
3. Never activate a subscription without verified payment.
4. No fake auth, fake payments, or simulated production functionality.
5. Do not claim clinical validation without evidence.
6. No API secrets in frontend code.
7. Mother and baby are separate records linked through a family relationship.
8. Content must be based on current authoritative Indian/WHO guidance, clinician-reviewed, and clearly labelled as education, not medical advice.

---

## Phase 0 — Containment (before any feature work) · 1–2 days

| Task | Acceptance |
|---|---|
| Rotate the Google API key disclosed on 2026-11-24; restrict by API/referrer/IP and quota | Key rotated; old key revoked; no key value in repo/chat-visible files |
| Remove `backend/data/maternacare.db` from working tree and git history (filter-repo/BFG) | `git log --all -- '*.db'` empty; forces secret/data rotation |
| Require `JWT_SECRET` at startup; reject weak defaults in production | App refuses to boot without a strong secret; test added |
| Remove fake-payment activation path from `/payments/verify` | Unverified payment → 400; test asserts failure |
| Remove client-side demo checkout in `frontend/app.js` | No code path calls verify with `demo_`/`PLACEHOLDER` |
| Restrict CORS to exact origins; add security headers middleware | No wildcard+credentials; headers verified by test |
| Add a persistent disclaimer that cannot be dismissed on clinical screens | UI shows "education, not medical advice" on triage/chat/education |

**Gate:** no real users until Phase 0 is complete.

---

## Phase 1 — Data model, migrations, entitlement · 1–2 weeks

| Task | Acceptance |
|---|---|
| Add Alembic (or versioned SQL runner) and baseline migration | `alembic upgrade head` on current DB shape succeeds; rollback tested |
| Normalize schema: mothers, babies, family_links, pregnancies, consents, care_plan_items, growth_measurements, immunization_records, audit_log, plans, payment_events (see DATABASE_DESIGN.md) | Foreign keys on; row-level authorization by user/family |
| Consent records with purpose/version/timestamp/withdrawal; export + delete endpoints | DPDP-aligned; tests for export and erasure |
| Move to managed Postgres (Render) with encryption/backups | No SQLite on ephemeral FS; backup restore drill documented |
| Real Razorpay integration: server-side order creation, webhook verification, idempotency, price catalog from DB, plan validation | Payment cannot be activated without valid signature; webhook replay-safe; no plan injection |
| Server-side entitlement dependency on all gated APIs | Unsubscribed user gets 403 on gated endpoints; UI gate is cosmetic only |
| Audit log for every health-data create/update/read of sensitive records | Entries include actor, action, entity, timestamp |

**Gate:** payment and entitlement tests pass; migration tested on production-shaped copy.

---

## Phase 2 — Clinical safety rebuild · 2–3 weeks

| Task | Acceptance |
|---|---|
| Rebuild `triage()` with clinician-reviewed rules, synonyms (en/hi/bn/Hinglish), negation, combination flags, hard emergency override | ≥95% recall on a 100+ phrase clinician-created corpus; zero false reassurance; false-positive rate measured |
| Case-based regression tests for all red flags (pregnancy, postpartum, newborn) | CI blocks deploy on any regression |
| Validate EDD inputs (LMP not future, weeks 0–45, parse errors → 400) | Fuzz tests; no 500s |
| Risk-adaptive ANC schedules (WHO 8-contact and Indian NHM options; high-risk override) | User-visible plan choice; clinician override field |
| Enable immunization tracking end-to-end (baby_id, due/given dates, records) | UI + API + tests |
| Mother/baby separation applied to triage, chat, tasks, education | Newborn signs scoped to baby record |
| Persistent "education vs advice" labelling and emergency escalation | UX review sign-off |

**Gate:** clinician review of rules and corpus; documented sign-off before release.

---

## Phase 3 — Auth hardening & product completion · 2–3 weeks

| Task | Acceptance |
|---|---|
| Short-lived access tokens + refresh rotation, logout everywhere, inactivity timeout | Revocation works; tests |
| Email verification, password reset, rate limiting, lockout, password strength | Negative tests pass |
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
- Phase 0 must precede everything (containment of exposed credentials/data and unsafe payment path).
- The user must supply/host: Render account + Postgres, Razorpay keys, SMS/notification provider, and clinician reviewers. These are external dependencies, not code tasks.
- The Google API key mentioned by the user is **not** an implementation dependency for the current scope (no LLM in product direction); if later used for AI-guided education, it must be server-side only, with grounding, guardrails, and clinical review.

## Definition of done for "app is safe to pilot"
- Phase 0–2 complete.
- Zero critical findings open in SECURITY_AUDIT and MEDICAL_SAFETY_AUDIT.
- Clinician sign-off recorded.
- Real payment verified end-to-end (sandbox + one live test).
- No PHI in git; entitlements enforced server-side.

---

*End of implementation roadmap. Awaiting audit approval before development.*
