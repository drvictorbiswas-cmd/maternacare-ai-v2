# TECHNICAL AUDIT — Maternacare AI

**Repository:** `maternacare-full` (local)  
**Audit date:** 2026-11-24  
**Scope:** Audit only. No code was modified. Target is the existing FastAPI + HTML/CSS/JavaScript application — an upgrade of the existing app, not a replacement.  
**Auditor:** Senior full-stack engineer / software architect / healthcare application security engineer (AI-assisted audit).  
**Status of this audit:** Awaiting your review and approval before any development begins.

---

## 1. Executive summary

`maternacare-full` is a coherent full-stack prototype: a hardened FastAPI + SQLite backend (`backend/`) and a vanilla-JavaScript installable PWA frontend (`frontend/`), with Docker/Render deployment files.

**Containment (Phase 0 + 1) is already implemented in code and verified.** The backend fails closed on missing secrets, performs real Razorpay order creation + HMAC signature verification (no fake-payment activation), restricts CORS, applies rate limiting and security headers/CSP, enforces server-side subscription entitlement, keeps an audit log, and runs versioned SQLite migrations. All 34 hardened tests pass.

It is **not yet production-ready for a maternal-health product.** The most serious remaining findings are safety-critical:

| Severity | Finding | Ref |
|---|---|---|
| 🔴 Critical | Danger-sign triage misses common high-risk presentations (false negatives) — can delay emergency care | MS-01 |
| 🔴 Critical | No clinician review / clinical governance for any medical content; no evidence grades, dates, or sign-off | MS-02 |
| 🟠 High | Chat is rule-based, not agentic AI; no LLM grounding/guardrails | BR-04 |
| 🟠 High | No notification/reminder delivery (SMS/WhatsApp/push) despite reminder positioning | BR-03 |
| 🟠 High | JWT: 60-min non-revocable access token in `localStorage`; no refresh-token rotation in endpoints | AU-03 |
| 🟠 High | No email verification, password reset, account lockout, or brute-force protection beyond fixed-window rate limiting | AU-05 |
| 🟡 Medium | EDD input validation: future LMP / out-of-range weeks accepted; unparseable date → 500 | BR-02, SEC-10 |
| 🟡 Medium | Content source-titled but no version/date/evidence grade; not clinician-reviewed | MS-02 |
| 🟡 Medium | Duplicate clinical engine in frontend `engine.js` can drift from backend `engine.py` | FU-08 |

---

## 2. Repository inventory

| Path | Purpose |
|---|---|
| `backend/main.py` | FastAPI app: config, DB bootstrap/migration, JWT auth, ~24 endpoints, payment verify, static frontend mount |
| `backend/config.py` | Central config; fails closed on weak/missing JWT secret and missing `ALLOWED_ORIGINS` in production |
| `backend/security.py` | Rate limiting, audit logging, security headers/CSP, server-side entitlement check |
| `backend/engine.py` | Clinical rules: education, 12 danger-sign rules, 10 traditions, EDD/ANC/immunization schedules, rule-based chat |
| `backend/payments.py` | Real Razorpay integration: server-side order, HMAC verify, webhook recording; fails closed without credentials |
| `backend/migrations.py` | Ordered, idempotent SQLite migrations via `PRAGMA user_version` (v1 + v2) |
| `backend/requirements.txt` | Pinned dependencies: fastapi, uvicorn, pyjwt, passlib, pydantic, requests, python-multipart |
| `backend/test_hardened.py` | 34-check hardened API test (all pass) |
| `backend/test_api.py` | Obsolete smoke test; asserts the insecure fake-payment bypass — do not use |
| `frontend/index.html` | SPA shell: 8 page sections, auth + subscription-gating UI |
| `frontend/app.js` | UI controller, API client, animations, localStorage token |
| `frontend/engine.js` | Duplicate clinical rules + i18n (en/hi/bn); partially dead data |
| `frontend/style.css` | Mobile-first styles + animations/micro-interactions |
| `frontend/sw.js` | Service worker: app-shell cache; API excluded |
| `frontend/manifest.json`, `frontend/icon.svg` | PWA install metadata |
| `Dockerfile`, `render.yaml`, `.gitignore`, `README.md` | Deploy/config/docs |
| *(six audit documents)* | `TECHNICAL_AUDIT.md`, `FEATURE_MATRIX.md`, `DATABASE_DESIGN.md`, `SECURITY_AUDIT.md`, `MEDICAL_SAFETY_AUDIT.md`, `IMPLEMENTATION_ROADMAP.md` |

Git history present; working tree clean. No `data/*.db` or `.env` is tracked (removed per Phase 0 containment).

---

## 3. Backend architecture & API endpoints

**Structure:** single-file FastAPI app with module-level `sqlite3` helper. No ORM, no service layer, minimal DI beyond `Depends(current_user)`, no structured logging, no error-handling middleware. Migrations run on import/startup.

### Endpoints

| Method | Path | Auth | Purpose | Notes |
|---|---|---|---|---|
| GET | `/health` | none | Liveness | Returns `{"status":"ok"}` |
| POST | `/api/auth/signup` | none | Email or phone + password | Identifier classified by `@`; pbkdf2_sha256 |
| POST | `/api/auth/login` | none | Login | `WHERE email=? OR phone=?` |
| GET | `/api/me` | JWT | Current user | id, email/phone, created_at |
| POST | `/api/profile` | JWT | Save profile + generate ANC tasks | Consent required; EDD computed; 8 ANC tasks |
| GET | `/api/profile` | JWT | Read profile | `null` if absent |
| GET/POST | `/api/tasks` | JWT | List / add reminders | Ownership-checked |
| POST | `/api/tasks/{id}/done` | JWT | Toggle done | Ownership-checked |
| DELETE | `/api/tasks/{id}` | JWT | Delete task | Ownership-checked |
| GET | `/api/babies` | JWT | List mother's babies | Linked via `mothers`/`family_links` |
| POST | `/api/babies` | JWT | Add baby | Requires completed profile |
| GET/POST | `/api/growth` | JWT | Growth measurements per baby | Ownership-checked |
| GET/POST | `/api/immunizations` | JWT | Immunization schedule + records | `imm_schedule()` generated |
| GET | `/api/education` | JWT | Stage education | Gated by entitlement (403 if unsubscribed) |
| GET | `/api/traditions` | JWT | Practice evaluator | English-only from API |
| POST | `/api/triage` | JWT | Danger-sign triage | Keyword engine; gated |
| POST/GET | `/api/chat` | JWT | Rule-based chat + history (last 40) | Gated; no LLM |
| GET | `/api/summary` | JWT | Dashboard summary | Week, EDD, next task, subscription |
| POST | `/api/payments/order` | JWT | Create Razorpay order | Fails closed (503) if no credentials |
| POST | `/api/payments/verify` | JWT | Verify payment + activate subscription | HMAC verify; fails closed; no fake activation |
| POST | `/api/payments/webhook` | none | Razorpay webhook | Signature-verified; records event only |
| POST | `/api/feedback` | JWT | Save feedback | No review/notification workflow |
| GET | `/api/export` | JWT | DPDP data export | JSON attachment |
| DELETE | `/api/account` | JWT | DPDP erasure | Anonymizes payment records for audit |

### Endpoint-level issues
- `GET /api/traditions?language=hi` ignores `language` — content English-only from backend; frontend renders its own localized data. Two divergent content sources.
- No pagination on `/api/chat` (fixed 40) or `/api/tasks`.
- `app.mount('/', StaticFiles(..., html=True))` serves `frontend/`; any file in that folder is exposed.
- No endpoint for clinician escalation, clinician dashboard, or medical-records upload.

---

## 4. Frontend architecture & user journeys

**Structure:** one SPA in `index.html` with 8 `<section class="page">` views toggled by `go(tab)`. No build system, framework, or bundler. State in module-level globals (`SUMMARY`, `TASKS`, `EDU`, `TRAD`, `CHAT`).

### Journeys present
1. Auth: sign-up / sign-in → token in `localStorage` → profile or home.
2. Onboarding: stage, LMP/EDD/week, risk, conditions, medicines, allergies, doctor, emergency contact, consent → profile saved.
3. Home: week/EDD/progress, safety check, education preview, task preview, subscription chip.
4. Learn / Traditions / Safety / Calendar / Chat / Subscription tabs.
5. Subscription gate sheet shown after onboarding if not subscribed.

### Journey / UX defects
- `FU-01` — Gate dismissible by backdrop click (`closeSheet('gate')`); all tabs remain usable. Gating is display-only (server now enforces entitlement, but UI gate is cosmetic).
- `FU-03` — `maximum-scale=1` in viewport meta prevents pinch-zoom — **WCAG 1.4.4 accessibility violation**, harmful for low-vision users of a health app.
- `FU-04` — Revoked/expired token only detected on next API call → flash of authenticated UI.
- `FU-05` — `onclick="toggleTask('${t.id}')"` interpolates a server-generated ID into a JS string context (low exploitability; IDs are server-generated).
- `FU-06` — Offline claim overstated: `sw.js` caches the app shell only; data endpoints need network + auth. Offline shows a shell with no data.
- `FU-07` — Several views lack `.catch()` error/empty states for failed API calls (`loadEdu`, `loadTrad`).
- `FU-08` — Frontend ships its own copy of clinical rules (`engine.js`, 53.9 KB); only `Engine.t()` and `Engine.VERDICT` used. Duplicate DANGER/EDUCATION/TRADITIONS data is dead code that can drift from `backend/engine.py`.

Animations/micro-interactions are present (page transitions, stagger, sheets, ripple, toast). Localization strings exist for en/hi/bn.

---

## 5. Authentication & authorization

- Passwords hashed with `pbkdf2_sha256` via passlib. Minimum length 8 (Pydantic validator). No breach check, no reset flow, no email/phone verification.
- JWT HS256, 60-min default expiry, `iss`/`aud` claims. **No refresh/rotation endpoint** — `refresh_tokens` table exists but is unused by endpoints.
- `JWT_SECRET`: fail-closed — production refuses to boot without a strong (32+ char) secret; development has a weak default that must never reach production.
- Phone login is phone + password only — **no OTP verification**, so it is not proof of phone ownership (a stated product requirement).
- Token stored in `localStorage` → XSS-exposed; no inactivity timeout or logout-everywhere.
- Authorization is consistent: task/chat/profile/baby queries filter by `user_id` (or mother scope). Isolation verified by test.
- No role model (mother / caregiver / clinician / admin) — future clinician features cannot be safely authorized yet.

---

## 6. SQLite database & migration requirements

**Current schema** (versioned via `PRAGMA user_version`, migrations v1+v2):

`users`, `profiles` (JSON blob), `tasks`, `chat`, `subscriptions`, `feedback`, `mothers`, `babies`, `family_links`, `pregnancies`, `consents`, `care_plan_items`, `growth_measurements`, `immunization_records`, `feeding_sessions`, `plans`, `payment_events`, `audit_log`, `refresh_tokens`.

- `PRAGMA foreign_keys=ON` is enabled. Indexes on `user_id`, `mother_id`, `baby_id`, `due_date`, audit actor.
- **Mother/baby separation IS represented:** `mothers`, `babies`, `family_links`, `pregnancies` tables exist; baby APIs enforce mother scope.
- `profiles.data` remains a JSON blob for the mother's clinical profile (not individually queryable at the DB layer).
- `subscriptions.plan` is a free-form string referencing `plans` only at validation time.
- No data-retention policy; export (`/api/export`) and erasure (`/api/account`) endpoints exist (DPDP-aligned).
- No encryption at rest; Render disk persistence must be provisioned via `render.yaml`/managed Postgres.

### Migration requirements (remaining)
- Test the v0→v1→v2 migration path on a production-shaped copy; document a PHI-scrubbing step.
- Add a startup check failing closed if schema is behind.
- Add indexes for query performance at scale (`user_id`, `due`, `baby_id`).

---

## 7. Payment & subscription implementation

- **No fake-payment activation.** `verify_payment()` requires `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`; otherwise returns 503. HMAC signature verified with constant-time compare. Client-supplied `plan` is validated against the `plans` table (no plan injection).
- `/api/payments/order` creates a **real Razorpay order** server-side and persists the `order_id` in `payment_events` before returning the key to the frontend. No order is ever fabricated.
- Webhook handler (`/api/payments/webhook`) verifies Razorpay signature and records the event; does **not** by itself activate access.
- Subscription entitlement is enforced **server-side** via `sec.require_entitlement()` on education, traditions, triage, and chat. UI gate is cosmetic only.
- Price catalog lives in the `plans` table (monthly ₹990 / 30d, yearly ₹7,990 / 365d), not hardcoded in frontend.
- Remaining: idempotency keys, capture/refund reconciliation, sandbox + one live end-to-end test, "restore purchase" flow.

---

## 8. Maternal healthcare content & safety logic

- Clinical rules in `backend/engine.py`: `EDUCATION` (9 items), `DANGER` (12 sign rules), `TRADITIONS` (10 practices), `compute_edd`, `anc_schedule`, `imm_schedule`, `chat_reply`.
- Duplicated (partially stale) copy in `frontend/engine.js`.
- Triage is substring keyword matching with stage scoping; **no negation handling, no fuzzy/synonym matching, no severity scoring, no red-flag combination logic**. Documented false negatives (e.g., "not feeling baby move", "severe abdominal pain", "I have fits", "baby is blue") → **safety-critical**.
- Content is source-tagged (organization names only) with **no publication date, version, evidence grade, or clinician sign-off**. Not clinically validated.
- `high_risk` boolean collected but never changes education or schedules (one generic 8-visit plan for all).
- `imm_schedule()` exists but immunization is scoped to baby records; end-to-end UI tracking is present via APIs but needs clinician-reviewed MoHFW schedule alignment.

---

## 9. PWA & offline functionality

- Valid manifest; installable ("Add to Home screen"), fullscreen.
- `sw.js` cache-first for the app shell; `/api/` excluded; cache name `v2` (stale-shell risk after security fixes unless version bumped).
- No background sync / offline request queue; API failures not queued.
- Offline renders a shell with no user data — "offline-capable" claim overstated.
- iOS: `icon.svg` is not supported for `apple-touch-icon` (needs PNG 180×180).
- `maximum-scale=1` blocks zoom (accessibility violation, see FU-03).

---

## 10. Deployment configuration

- `Dockerfile`: `python:3.12-slim`, installs pinned requirements, copies `backend` + `frontend`, runs uvicorn on port 10000 from `/app/backend`.
- `render.yaml`: Docker web service; generates `JWT_SECRET`; explicit `ALLOWED_ORIGINS`; empty Razorpay secrets to fill in the Render dashboard. **No persistent disk declared** → SQLite data lost on redeploy unless a disk is attached or managed Postgres is used.
- No CI/CD, no lint/test stage in deploy, no staging/production separation, no structured logging/metrics.
- HTTPS enforcement delegated to the platform.

---

## 11. Security & privacy risks

Full detail in `SECURITY_AUDIT.md`. Highest risks:

- JWT non-revocable, long-lived, in `localStorage`; no refresh rotation in endpoints (AU-03 / SEC-07).
- Phone auth without OTP (no proof of ownership) — SEC-04 / AU-04.
- No email verification, password reset, or lockout (AU-05 / SEC-05).
- PHI/PII in browser `localStorage` and SQLite; no encryption at rest (SEC-09).
- No audit trail for all sensitive reads (audit_log exists; coverage should be confirmed complete) — SEC-08.
- Consent is captured but versioning/withdrawal flow to be hardened (SEC-02 area).
- Third-party Razorpay checkout script loaded from CDN — pin with SRI (SEC-13).
- XSS-adjacent `innerHTML` with interpolated IDs (low exploitability) — SEC-12.
- No API secrets in frontend code (compliant). Razorpay `key_id` is passed from server at order creation.

---

## 12. Automated tests

- `backend/test_hardened.py`: **34 checks — all pass** (health + headers, weak-password rejection, signup/login, auth required, invalid JWT, EDD validation, consent enforced, entitlement 403s, fake-payment 503, order fails closed, baby/isolation, growth, immunization, export, auth rate limiting).
- `backend/test_api.py`: **obsolete** — asserts insecure fake-payment activation; superseded by `test_hardened.py`.

**Gaps:** no engine unit tests (EDD edge cases, triage false-negative matrix), no frontend tests, no security/penetration tests, no migration tests, no CI pipeline, no e2e tests. The existing test suite currently **enshrines insecure behavior** in `test_api.py` and must not be used as a gate.

---

## 13. Dependency / implementation map

Recommended order (detail in `IMPLEMENTATION_ROADMAP.md`):

1. Phase 0 containment — already implemented in code; confirm no secrets/DB in git, JWT fail-closed, no fake-payment path. ✅ done
2. Phase 1 — migrations tested on production-shaped copy, managed Postgres, real Razorpay webhook + idempotency, server-side entitlement, export/erasure, audit log. (schema exists; wiring partially done)
3. Phase 2 — clinician-reviewed triage rebuild (≥95% recall on 100+ phrase corpus), EDD validation, risk-adaptive WHO/NHM schedules, immunization tracking end-to-end, mother/baby scoping, persistent education-vs-advice labelling.
4. Phase 3 — short-lived tokens + refresh rotation, logout everywhere, email verification, password reset, rate limiting/lockout, caregiver/clinician roles, notifications, growth charts, remove duplicate frontend engine, accessibility fix (`maximum-scale=1`).
5. Phase 4 — CI, dependency pinning + scanning, structured logging/metrics, staging/prod, secret manager, DPDP legal review, load testing.

External dependencies you must supply: Render account (+ Postgres), Razorpay keys, SMS/notification provider, and qualified clinician reviewers.

---

*End of technical audit. No files were changed during this audit. Do not begin development until you review and approve.*
