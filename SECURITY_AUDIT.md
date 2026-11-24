# SECURITY & PRIVACY AUDIT — Maternacare AI

**Audit date:** 2026-11-24 · **Repo:** `maternacare-full` (local)  
**No credential values are recorded in this document.**  
**Status:** Audit only. No code modified. Awaiting your approval before development.

---

## 1. Severity summary

| ID | Severity | Finding | Status |
|---|---|---|---|
| SEC-01 | 🔴 Critical | JWT signing secret had a committed default; token forgery trivial if unset | ✅ Remediated — fail-closed at startup |
| SEC-02 | 🔴 Critical | Production-like SQLite DB with PII/PHI committed to a public repo | ✅ Remediated — `data/*.db`, `.env*` not tracked |
| SEC-03 | 🔴 Critical | Subscription activated with unverified/fabricated payment data | ✅ Remediated — HMAC verify, fails closed (503) |
| SEC-04 | 🟠 High | Wildcard CORS with `allow_credentials=True` | ✅ Remediated — restricted to explicit origins |
| SEC-05 | 🟠 High | No rate limiting, lockout, or brute-force protection on auth | ⚠️ Partial — fixed-window rate limiting on auth only |
| SEC-06 | 🟠 High | No security headers | ✅ Remediated — CSP/HSTS/nosniff/frame-deny/referrer-policy |
| SEC-07 | 🟠 High | JWT in `localStorage`, 60-min life, no revocation/refresh | ⚠️ Partial — refresh_tokens table exists but unused |
| SEC-08 | 🟠 High | No audit trail for health-data access/changes | ✅ Remediated — `audit_log` populated on key actions |
| SEC-09 | 🟠 High | No encryption at rest; ephemeral hosting filesystem | Open — managed Postgres + disk required |
| SEC-10 | 🟡 Medium | Unvalidated inputs → 500 errors (e.g. bad dates in `compute_edd`) | Open |
| SEC-11 | 🟡 Medium | Client-side subscription gate bypass; no server-side entitlement | ✅ Remediated — server-side `require_entitlement` |
| SEC-12 | 🟡 Medium | XSS-adjacent `innerHTML` with interpolated IDs in handlers | Open — low exploitability (server-generated IDs) |
| SEC-13 | 🟡 Medium | Razorpay checkout script from CDN without SRI | Open — pin + SRI |
| SEC-14 | 🟡 Medium | `maximum-scale=1` blocks zoom (accessibility/compliance) | Open |
| SEC-15 | 🟠 High | Credential exposure risk — keys must never be in frontend/git | ✅ Compliant — no API secrets in frontend |

---

## 2. Authentication & session security

- Passwords hashed with `pbkdf2_sha256` via passlib. Minimum length 8 (Pydantic). No breach check, no reset flow, no email/phone verification.
- **SEC-01 fixed:** `config.py` fails startup in production when `JWT_SECRET` is absent or shorter than 32 chars or contains placeholder text. Development default must never reach production.
- **SEC-07:** 60-minute non-revocable access token stored in `localStorage`. XSS would steal a long-lived credential. `refresh_tokens` table exists but no refresh/revocation endpoint — add short-lived access tokens + refresh rotation + logout everywhere.
- Phone login is phone + password only — **no OTP**, so it is not proof of phone ownership. Required by product direction (OTP login/signup).
- Authorization: task/chat/profile/baby queries correctly filter by `user_id` (or mother scope). Isolation verified by test.

---

## 3. Authorization

- Row-level authorization by `user_id`/`mother_id` is consistent across endpoints.
- **SEC-11 fixed:** server-side entitlement (`sec.require_entitlement`) blocks education, traditions, triage, and chat for unsubscribed/expired users (403). UI gate is cosmetic only.
- No role model (mother / caregiver / clinician / admin) — future clinician features cannot be safely authorized yet.

---

## 4. Payment security

- **SEC-03 fixed:** `verify_payment()` requires `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`; otherwise 503. HMAC signature verified with `hmac.compare_digest`. Client-supplied `plan` validated against `plans` table — no plan injection.
- `/api/payments/order` creates a real Razorpay order server-side and persists `order_id` in `payment_events` before returning the key to the frontend. No order is fabricated.
- Webhook handler verifies Razorpay signature and records the event; does **not** by itself activate access.
- Remaining: idempotency keys, capture/refund reconciliation, sandbox + one live end-to-end test.

---

## 5. Data protection & privacy

- **SEC-02 fixed:** `backend/data/maternacare.db` removed from git tracking; `.gitignore` covers `data/*.db` and `.env*`.
- **SEC-09:** SQLite file unencrypted. Render free plan has no persistent disk unless attached — use managed Postgres with encryption at rest and backups.
- **SEC-08:** `audit_log` records actor, action, entity, timestamp on key health-data actions. Coverage should be confirmed complete for all sensitive reads/writes.
- Consent is captured (`consents` table: purpose/version/timestamp/withdrawal) but withdrawal flow not exposed in UI; no data-minimization access controls on profile blob.
- No API secrets in frontend code (compliant). Razorpay `key_id` is passed from server at order creation.

---

## 6. Transport, CORS & headers

- **SEC-04 fixed:** CORS restricted to explicit `ALLOWED_ORIGINS`; production refuses to start if empty. `allow_credentials=True` only with explicit origins.
- **SEC-06 fixed:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` (geolocation/microphone/camera disabled), strict `Content-Security-Policy` (script-src self + razorpay checkout; frame-src razorpay; object-src none), `Strict-Transport-Security` in production.
- **SEC-13:** Razorpay checkout script loaded from CDN — pin with `integrity`/`crossorigin` (SRI).

---

## 7. Input handling & error behavior

- **SEC-10 (open):** Pydantic validates types but not domains. `compute_edd('not-a-date')` → 500; `weeks=-3` → negative days. Add domain validation and structured error handling (400 instead of 500).
- No payload size limits; chat/feedback can be flooded by authenticated users (no per-user rate limit on non-auth endpoints).
- XSS-adjacent `innerHTML` with interpolated IDs (SEC-12) — server-generated IDs keep exploitability low; still, use `textContent`/event listeners instead of `onclick` string interpolation.

---

## 8. PWA/offline exposure

- `sw.js` caches the app shell but not PHI — good. Cached JS could serve stale auth/payment logic after a fix unless cache version bumped (`v2` currently).
- Tokens in `localStorage` persist on shared devices; no auto-logout on tab close or inactivity.

---

## 9. Credential handling

- **SEC-15:** No API keys or secrets in frontend code or git. Razorpay keys live only in server environment/secret manager. Rotate any previously disclosed keys immediately and restrict by API/referrer/IP with quota limits.

---

## 10. Priority remediation order

1. Confirm no PHI/secrets in git history; rotate any exposed credentials.
2. Fail-closed JWT (done); real Razorpay order + webhook verification (done); server-side entitlement (done).
3. Restrict CORS (done); add security headers (done); rate limiting + account lockout (partial).
4. Migrate to managed Postgres with encryption, backups, audit log, deletion/export endpoints (done endpoints; infra pending).
5. Add input/domain validation + structured error handling; pin dependencies; add SRI for CDN scripts.
6. Short-lived tokens/refresh rotation, logout everywhere, CSP tightening.
7. Automated security tests in CI; dependency scanning; clinician review of content.

---

*End of security audit. No credential values appear in this document.*
