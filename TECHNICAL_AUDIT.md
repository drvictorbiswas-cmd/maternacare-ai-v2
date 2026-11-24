# TECHNICAL AUDIT — Maternacare AI

**Repository:** `drvictorbiswas-cmd/maternacare-full` (public)
**Audit date:** 2026-11-24
**Scope:** Audit only. No code was modified. Target is the existing FastAPI + HTML/CSS/JS application, not a replacement.
**Auditor:** Senior full-stack engineer / architect / healthcare application security engineer (AI-assisted audit).

---

## 1. Executive summary

The repository is a small, coherent full-stack prototype: FastAPI + SQLite backend (`backend/main.py`, `backend/engine.py`) and a vanilla-JS PWA frontend (`frontend/`), with Docker/Render deployment files. It runs: all 19 smoke tests pass locally.

It is **not production-ready for a maternal-health product**. The most serious findings are:

| Severity | Finding |
|---|---|
| 🔴 Critical | Payment verification can be bypassed entirely; subscriptions are activated with arbitrary/fake payment data (PV-01). |
| 🔴 Critical | Default JWT signing secret committed in source; tokens forgeable in any deployment that doesn't override it (AU-01). |
| 🔴 Critical | Database containing real user PII/PHI (emails, phone number, profile, chat) is committed to the public repo (DB-01). |
| 🔴 Critical | Medical danger-sign triage has dangerous false negatives — serious symptoms are missed by the keyword engine (MS-01). |
| 🟠 High | Mother and baby are not separate records; no family relationship exists (DB-02, BR-01). |
| 🟠 High | No database migrations; schema changes will break or silently corrupt deployed data (DB-03). |
| 🟠 High | Wildcard CORS with credentials, no rate limiting, no security headers, no audit trail (SEC-01..04). |
| 🟠 High | Frontend "subscription gate" is purely client-side and trivially bypassable (PV-02). |
| 🟡 Medium | EDD computation accepts invalid/future dates and out-of-range weeks (BR-02). |
| 🟡 Medium | No notification/reminder delivery despite "reminder agent" positioning (BR-03). |
| 🟡 Medium | Content is source-tagged but has no version/date/evidence grade and is not clinician-reviewed (MS-02). |

---

## 2. Repository inventory

| Path | Size | Purpose |
|---|---|---|
| `backend/main.py` | 14.5 KB | FastAPI app: config, DB bootstrap, JWT auth, 20 endpoints, payment verify, static mount |
| `backend/engine.py` | 21.7 KB | Clinical rules: education, 12 danger signs, 10 traditions, EDD/schedules, chat router |
| `backend/test_api.py` | 4.0 KB | 19-check HTTP smoke test |
| `backend/requirements.txt` | 117 B | 7 pinned-range dependencies |
| `backend/data/maternacare.db` | 57 KB | **SQLite DB with live test user data — committed** |
| `frontend/index.html` | 9.6 KB | Single-page shell, 8 sections, auth + gating UI |
| `frontend/app.js` | 16.1 KB | All UI logic, API client, animations, localStorage token |
| `frontend/engine.js` | 53.9 KB | Duplicate of clinical rules + i18n (en/hi/bn) in JavaScript |
| `frontend/style.css` | 15.7 KB | Mobile-first styles + animations |
| `frontend/sw.js` | 818 B | Service worker (app-shell cache, API excluded) |
| `frontend/manifest.json`, `icon.svg` | — | PWA metadata |
| `Dockerfile`, `render.yaml`, `README.md`, `.gitignore` | — | Deploy/config/docs |

Git history: 2 commits (`d42ba84` initial, `816f4c1` splash fix). Working tree clean.

---

## 3. Backend architecture & API endpoints

**Structure:** single-file FastAPI app with module-level `sqlite3` helper. No service layer, no ORM, no dependency-injection beyond `Depends(current_user)`, no error-handling middleware, no structured logging.

### Endpoints (all under `/api` unless noted)

| Method | Path | Auth | Purpose | Notes |
|---|---|---|---|---|
| GET | `/health` | none | Liveness | Added after first server start |
| POST | `/auth/signup` | none | Email or phone + password | Identifier classified by presence of `@` |
| POST | `/auth/login` | none | Login | Query `WHERE email=? OR phone=?` |
| GET | `/me` | JWT | Current user | Returns id, email/phone, created_at |
| POST | `/profile` | JWT | Save profile + generate ANC tasks | Consent flag required; tasks generated once |
| GET | `/profile` | JWT | Read profile | Returns `null` if absent |
| GET/POST | `/tasks` | JWT | List / add reminders | Custom tasks only on POST |
| POST | `/tasks/{id}/done` | JWT | Toggle done | Ownership checked |
| DELETE | `/tasks/{id}` | JWT | Delete task | Ownership checked |
| GET | `/education` | JWT | Stage education | Localized via query `language` |
| GET | `/traditions` | JWT | Practice evaluator | `q` filters by English name only |
| POST | `/triage` | JWT | Danger-sign triage | Keyword engine |
| POST/GET | `/chat` | JWT | Rule-based chat + history | History limited to 40 rows |
| GET | `/summary` | JWT | Dashboard summary | Includes subscription status |
| POST | `/payments/order` | JWT | Checkout params | **No Razorpay order created** |
| POST | `/payments/verify` | JWT | Activate subscription | **Bypassable (PV-01)** |
| POST | `/feedback` | JWT | Save feedback | No moderation/notification |

**Endpoint-level issues:**
- `POST /api/payments/order` does not call Razorpay; it fabricates `order_<hex>` and returns a placeholder key. A real checkout cannot work end-to-end without server-side order creation.
- `POST /api/payments/verify` trusts client-supplied `plan` and (when no secret configured) all payment fields.
- `GET /api/traditions?language=hi` ignores `language` — content is English-only from the backend (the frontend renders its own localized `engine.js` data instead). Two divergent content sources.
- No endpoint for baby records, family links, growth data, immunization records, or clinician escalation.
- No pagination on `/chat` history beyond fixed 40; no pagination on `/tasks`.
- `app.mount('/', StaticFiles(..., html=True))` serves the frontend but also exposes any file in `frontend/`.

---

## 4. Frontend architecture & user journeys

**Structure:** one SPA in `index.html` with 8 `<section class="page">` views toggled by `go(tab)`. No build system, no framework, no bundler. All state in module-level globals (`SUMMARY`, `TASKS`, `EDU`, `TRAD`, `CHAT`).

**Journeys present:**
1. Auth: sign-up / sign-in → token in `localStorage` → profile or home.
2. Onboarding: stage, LMP/EDD/week, risk, conditions, medicines, consent → profile saved.
3. Home: week/EDD/progress, safety check, education preview, task preview, subscription chip.
4. Learn / Traditions / Safety / Calendar / Chat / Subscription tabs.
5. Subscription gate sheet shown after onboarding if not subscribed.

**Journey/UX defects:**
- `FU-01` — **Gate bypass**: `closeSheet('gate')` (backdrop click) dismisses the subscription gate; all tabs remain usable. Gating is display-only; no server endpoint checks subscription.
- `FU-02` — **Subscription chip `data-tab="sub"`** is handled by the global tab listener, so it routes correctly, but there is no "restore purchase"/receipt flow.
- `FU-03` — `maximum-scale=1` in viewport meta prevents pinch-zoom — an **accessibility violation** (WCAG 1.4.4) especially harmful for low-vision users of a health app.
- `FU-04` — `go()` calls `showAuth()` when `!USER`, but `USER` is cached in localStorage; a revoked/expired token is only detected on the next API call, causing a flash of authenticated UI.
- `FU-05` — `renderTasks()` and `renderTrad()` inject server-derived strings into `innerHTML` via `esc()`. Escaping is present (good), but `onclick="toggleTask('${t.id}')"` interpolates an ID into a JS string context without JS-escaping — a task id containing a quote could break out (low exploitability because IDs are server-generated).
- `FU-06` — Offline claim is misleading: `sw.js` caches the app shell only; all data endpoints require network and auth. Offline the app renders a shell with no data and errors on refresh.
- `FU-07` — No error/empty states for failed API calls in several views (`loadEdu`, `loadTrad` have no `.catch()`).
- `FU-08` — The frontend ships its **own copy** of the clinical rules in `engine.js` (53.9 KB) but only uses `Engine.t()` and `Engine.VERDICT` from it; the duplicate DANGER/EDUCATION/TRADITIONS data is dead code that can drift from the backend.

---

## 5. Authentication & authorization

- Passwords hashed with `pbkdf2_sha256` via passlib — reasonable. No password strength policy beyond length ≥ 6 (AU-02).
- JWT HS256 with 90-day expiry, no refresh/revocation, no `iat`/`iss`/`aud`, no token version (AU-03).
- **AU-01 — default secret**: `SECRET = os.environ.get('JWT_SECRET', 'dev-only-change-this-secret')`. Verified in testing: a token signed with the default secret decodes successfully. If any deployment forgets the env var, any attacker can forge tokens for any user (or arbitrary `sub`) and read/modify all health data.
- Phone "authentication" is only phone+password; no OTP verification means no proof of phone ownership (AU-04).
- No email verification, password reset, account lockout, or brute-force protection (AU-05).
- Authorization is otherwise consistent: task and chat queries filter by `user_id`.
- Token stored in `localStorage` (XSS-exposed; see SEC-05).

---

## 6. SQLite database & migration requirements

Tables: `users`, `profiles` (JSON blob), `tasks`, `chat`, `subscriptions`, `feedback`.

- **DB-01 — PHI in public repo**: `backend/data/maternacare.db` is tracked by git and contains 4 users (emails + a phone number), 1 profile, 9 tasks, 2 chat messages, 2 subscriptions. This is a privacy incident regardless of whether the data is "test" data. Must be removed from git history and rotated.
- **DB-02 — No mother/baby separation**: `profiles.data` is one JSON blob keyed by user. A single user cannot have a mother record plus linked baby records. No `babies` table, no `family_relationships` table, no `baby_id` on tasks/chat/schedules.
- **DB-03 — No migrations**: `init_db()` uses `CREATE TABLE IF NOT EXISTS` only. Adding columns or changing the JSON schema will silently break existing rows; no `user_version`, Alembic, or migration runner.
- **DB-04 — JSON blob for profile**: prevents querying/validating individual fields, complicates growth tracking and clinical decision support, and has no schema enforcement.
- **DB-05 — No constraints on task `due`/`type`**, no indexes on `user_id`, `due` (performance at scale), no foreign keys (`PRAGMA foreign_keys` not enabled).
- **DB-06 — No audit trail**: no record of who changed health data or when (DPDP Act accountability requirement).
- **DB-07 — No backup/encryption at rest**; SQLite file on the app filesystem (Render free tier is ephemeral unless a disk is attached — `render.yaml` declares none).

---

## 7. Payment & subscription implementation

- **PV-01 — Bypassable verification (critical)**: `verify_payment()` skips signature validation entirely when `RAZORPAY_KEY_SECRET` is unset (the default in both source and `render.yaml`). Verified live: posting `payment_id=FAKE`, `signature=FAKE`, `plan=yearly` activated a 1-year subscription. Arbitrary `plan` strings are accepted.
- **PV-02 — Client-side gate**: subscription status is enforced only by the UI (`showGate()`); no API checks it. All clinical APIs work for unsubscribed users.
- **PV-03 — No real order**: `/payments/order` fabricates an order id and never contacts Razorpay; no `razorpay_order_id` is persisted or matched at verification, so replay is possible.
- **PV-04 — No webhook**: no Razorpay webhook handler, no idempotency key, no payment capture/Refund reconciliation.
- **PV-05 — Price/plan in frontend**: plans and prices are hardcoded in `frontend/app.js`; no server-side source of truth for pricing.
- **PV-06 — Key ID placeholder**: frontend uses `key_id` from `/payments/order`; if it contains `PLACEHOLDER`, `startPay()` calls `/payments/verify` with fake data and grants access (client-side demo path).

---

## 8. Maternal healthcare content & safety logic

See `MEDICAL_SAFETY_AUDIT.md`. Key technical points:
- Clinical rules live in `backend/engine.py` and are duplicated (stale) in `frontend/engine.js`.
- Triage is naive substring matching over multilingual keyword lists; no negation handling, no fuzzy matching, no severity scoring, no red-flag combination logic.
- Content has source *names* but no publication dates, versions, evidence grades, or clinician sign-off.
- No guideline update mechanism, no content review workflow.

---

## 9. PWA & offline functionality

- Manifest is valid; service worker caches the app shell and excludes `/api/`.
- `sw.js` uses cache-first for shell; no versioned asset hashing, so updates rely on cache-name bumps (`v2` currently).
- Service worker registers a single global scope; API failures are not queued (no background sync).
- Offline mode shows the shell but no user data — the "offline-capable" claim in README/manifest is overstated.
- iOS: `apple-touch-icon` is an SVG, which iOS does not support for home-screen icons (needs PNG 180×180).
- `maximum-scale=1` blocks zoom (accessibility).

---

## 10. Deployment configuration

- `Dockerfile`: python:3.12-slim, installs backend requirements, copies backend + frontend, runs uvicorn on 10000 from `/app/backend`. Correct path layout (`FRONTEND = BASE.parent/'frontend'`).
- `render.yaml`: Docker web service, free plan, Singapore region, `JWT_SECRET` generated, Razorpay keys empty. **No persistent disk** → SQLite data lost on redeploy/restart. No `PYTHONUNBUFFERED`/health-check path configured (Render defaults to `/`; `/` is the SPA, returns 200 — acceptable but misleading).
- No CI/CD, no linting, no test stage in deploy, no staging/production separation.
- No HTTPS enforcement at app level (relies on platform).
- `requirements.txt` ranges are loose (`fastapi>=0.100,<0.116`, `pydantic>=1.10,<3`) — a pydantic v2 resolution could break models written for v1 style on some environments; pin exact versions for reproducibility.

---

## 11. Security & privacy risks

See `SECURITY_AUDIT.md`. Summary of highest risks: wildcard CORS with credentials, default JWT secret, PHI in git, no rate limiting, no security headers, no input length limits, no audit logging, no encryption at rest, client-side XSS surfaces via innerHTML, no CSRF consideration (bearer token in localStorage is not automatically sent, so CSRF risk is low).

---

## 12. Automated tests

`backend/test_api.py`: 19 checks using `urllib` against a running server. Covers health, signup/login, auth requirement, EDD, ANC tasks, summary, triage (one positive/negative), traditions search, education, chat danger routing, task toggle, **fake-payment subscription activation**, and user isolation.

**Gaps:** no unit tests for `engine.py` (EDD edge cases, triage false-negative matrix, multilingual content), no tests for invalid JWT/tampering, no negative payment tests (the existing test *asserts* the bypass), no frontend tests, no security tests, no migration tests, no CI. The test suite currently **enshrines insecure behavior** (it verifies that a fake payment activates a subscription) and must be rewritten during remediation.

---

## 13. Dependency/map for implementation

Recommended order (detailed in `IMPLEMENTATION_ROADMAP.md`):
1. Remove DB from git + rotate credentials + secure JWT/payment verification.
2. Add migrations and normalized mother/baby/family schema.
3. Rebuild safety triage with clinician-reviewed rule sets and tests.
4. Server-side subscription enforcement + real Razorpay order/webhook.
5. Harden auth, CORS, headers, rate limiting, audit log.
6. Rework frontend to consume server-side content, fix gate and accessibility.
7. Add reminders/notification delivery, growth tracking, clinician review workflow.
8. CI/CD, staging, observability.

---

*End of technical audit. No files were changed during this audit.*
