# SECURITY & PRIVACY AUDIT — Maternacare AI

**Audit date:** 2026-11-24 · **Repo:** `drvictorbiswas-cmd/maternacare-full` (public)
No credential values are recorded in this document.

**UPDATE (2026-11-24, Phase 0+1 implemented):** SEC-01, SEC-02, SEC-03, SEC-04, SEC-05,
SEC-06, SEC-08, SEC-11, SEC-12 and SEC-13 are remediated in code (fail-closed JWT, DB removed
from git, real Razorpay verification, restricted CORS, rate limiting, security headers/CSP,
audit log, server-side entitlement, event-delegation instead of inline handlers, SRI pending).
SEC-07 (short-lived tokens/refresh rotation), SEC-09 (managed Postgres encryption), SEC-10
(input validation — partially addressed), SEC-14 (zoom — fixed), SEC-15 (rotate disclosed
Google key — user action) and SEC-16 (version pinning — done) remain tracked. Re-audit required
before production.

---

## 1. Severity summary

| ID | Severity | Finding |
|---|---|---|
| SEC-01 | 🔴 Critical | JWT signing secret has a committed default; forging tokens is trivial if unset |
| SEC-02 | 🔴 Critical | Production-like SQLite DB with PII/PHI committed to a public repo |
| SEC-03 | 🔴 Critical | Subscription activated with unverified/fabricated payment data |
| SEC-04 | 🟠 High | Wildcard CORS with `allow_credentials=True` |
| SEC-05 | 🟠 High | No rate limiting, lockout, or brute-force protection on auth endpoints |
| SEC-06 | 🟠 High | No security headers (HSTS, CSP, X-Content-Type-Options, etc.) |
| SEC-07 | 🟠 High | JWT stored in `localStorage` with 90-day life, no revocation/refresh |
| SEC-08 | 🟠 High | No audit trail for health-data access/changes |
| SEC-09 | 🟠 High | No encryption at rest; ephemeral hosting filesystem |
| SEC-10 | 🟡 Medium | Unvalidated inputs → 500 errors (e.g. `compute_edd('not-a-date')`) |
| SEC-11 | 🟡 Medium | Client-side subscription gate bypass; no server-side entitlement check |
| SEC-12 | 🟡 Medium | XSS-adjacent `innerHTML` with interpolated IDs in event handlers |
| SEC-13 | 🟡 Medium | Third-party scripts (Razorpay checkout) loaded from CDN without SRI |
| SEC-14 | 🟡 Medium | `maximum-scale=1` harms accessibility (not security, but compliance) |
| SEC-15 | 🟠 High | **Credential exposure in chat**: a Google API key was pasted by the user on 2026-11-24 during this audit. It must be rotated/restricted immediately. Value intentionally not stored here. |
| SEC-16 | 🟡 Medium | No dependency pinning or vulnerability scanning; loose version ranges |

---

## 2. Authentication & session security

- **SEC-01 (critical):** `main.py:29` — `SECRET = os.environ.get('JWT_SECRET', 'dev-only-change-this-secret')`. Empirically verified: a token signed with this default secret decodes successfully. Any deployment that misses the env var lets an attacker forge `sub` for any user and read/modify all maternal health data. Fix: fail startup when `JWT_SECRET` is absent or shorter than 32 bytes in production.
- Passwords: pbkdf2_sha256 (acceptable), but minimum length 6 and no breach check, no reset flow, no email/phone verification.
- **SEC-05:** no throttling on `/auth/login` or `/auth/signup`; unlimited guessing.
- **SEC-07:** 90-day non-revocable JWT in `localStorage`; XSS would steal a long-lived credential. Prefer short-lived access tokens + refresh token rotation, or server-side sessions with secure cookies.
- Phone login does not verify ownership (no OTP), so it is not true phone authentication.

## 3. Authorization

- Task/chat/profile queries correctly filter by `user_id` — verified by isolation test.
- **SEC-11:** entitlement is not an authorization concern at the API layer because **no endpoint checks it at all**; all data APIs work for free users. The UI gate is decorative and dismissible via backdrop click.
- No role model (mother / caregiver / clinician / admin), so future clinician features cannot be authorized safely.

## 4. Payment security

- **SEC-03 (critical):** `/api/payments/verify` performs HMAC verification **only if** `RAZORPAY_KEY_SECRET` is configured; the default is empty, and `render.yaml` sets it to `""`. Verified live: `payment_id=FAKE`, `signature=FAKE`, `plan=yearly` activated a 1-year subscription; arbitrary `plan=free999` was also accepted.
- `/payments/order` fabricates `order_<hex>` and never creates a Razorpay order; no order id is persisted, so verification cannot bind a payment to a real order and is replay-prone.
- No webhook handler, no idempotency, no capture/refund reconciliation, no server-side price catalog.

## 5. Data protection & privacy

- **SEC-02 (critical):** `backend/data/maternacare.db` is in git (public). Contains email addresses, a phone number, health profile (JSON), tasks, chat text and subscription rows. Remove from tree and history; rotate/notify as appropriate.
- **SEC-09:** SQLite file unencrypted; Render free plan has no disk in `render.yaml`, so persistence is accidental/undefined. Use managed Postgres with encryption at rest and backups.
- **SEC-08:** no audit log of who read/changed health data — fails DPDP accountability expectations.
- Consent is a single boolean with no purpose, version, timestamp, or withdrawal; no data export or erasure endpoint (DPDP rights).
- No data minimization: profile collects emergency contact, conditions, medicines, allergies in one blob without access controls.

## 6. Transport, CORS & headers

- **SEC-04:** `allow_origins=['*']` with `allow_credentials=True` — any site can make credentialed cross-origin requests. Restrict to exact frontend origin(s), or remove credentials if using bearer tokens.
- **SEC-06:** no HSTS, CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.Health data in a browser needs a strict CSP (also mitigates SEC-07/SEC-12).
- **SEC-13:** `checkout.razorpay.com/v1/checkout.js` loaded without `integrity`/`crossorigin`; supply-chain risk. Pin + SRI.

## 7. Input handling & error behavior

- Pydantic models validate types but not domains: dates are strings, `weeks` unbounded, `text` unbounded.
- `compute_edd('not-a-date')` raises `ValueError` → HTTP 500 (information/DoS vector). `weeks=-3` produces negative days.
- `triage()` uses substring matching; an attacker/user cannot inject code (output escaped in frontend via `esc()`), but `onclick="toggleTask('${t.id}')"` interpolates an unescaped JS string context (SEC-12) — server-generated IDs keep exploitability low today.
- No payload size limits; chat/feedback tables can be flooded by any authenticated user (no rate limit).

## 8. PWA/offline exposure

- `sw.js` caches the app shell but not PHI; good. However cached JS could serve stale auth/payment logic after a security fix unless cache version is bumped (currently `v2`).
- Tokens in `localStorage` persist on shared devices; no auto-logout on tab close or inactivity.

## 9. Credential handling (user-side)

- **SEC-15:** A Google API key was disclosed in this chat on 2026-11-24. Treat as compromised: revoke/recreate it, restrict by API and by HTTP referrer/IP, set quota limits, and never place it in frontend code or git. Use a server-side proxy with the key in environment/secret manager. This audit deliberately does not record the key value.

## 10. Priority remediation order

1. Rotate exposed Google key; purge DB from git history; rotate JWT secret.
2. Fail-closed JWT config; real Razorpay order + webhook verification; server-side entitlement.
3. Restrict CORS; add security headers; rate limiting and account lockout.
4. Migrate to managed Postgres with encryption, backups, audit log, and deletion/export endpoints.
5. Add input/domain validation and structured error handling; pin dependencies; add SRI for CDN scripts.
6. Short-lived tokens/refresh rotation, logout everywhere, CSP.
7. Automated security tests in CI; periodic dependency scanning and clinician review of content.

---

*End of security audit. No credential values appear in this document.*
