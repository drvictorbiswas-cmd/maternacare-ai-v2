# Maternacare AI — Hardened full-stack app (Phase 0 + 1)

FastAPI + SQLite/Postgres-ready backend, animated PWA frontend, JWT auth, real Razorpay
verification, server-side entitlement, audit log, mother/baby/family records, and versioned
migrations.

> ⚠️ **Prototype.** Health education & navigation only. Not clinically validated, not medical
> advice, not for diagnosis or emergencies. See `MEDICAL_SAFETY_AUDIT.md`.

## What changed in Phase 0 + 1

**Containment**
- Removed the SQLite DB from git tracking and added `data/*.db`, `.env*` to `.gitignore`.
- `JWT_SECRET` must be a strong value in production; weak/missing secrets fail at startup.
- Removed **all** fake/simulated payment paths. `/payments/verify` fails closed (503) unless
  Razorpay credentials are configured and rejects unknown orders / bad signatures.
- Subscription entitlement is enforced **server-side** on education, traditions, triage and chat.
- CORS restricted to explicit origins; security headers (CSP, HSTS, nosniff, frame deny) added.
- Rate limiting on auth endpoints; strong password policy; invalid JWTs rejected.
- Persistent "education only — not medical advice" labels; pinch-zoom re-enabled (accessibility).
- No inline JS handlers — compatible with a strict Content-Security-Policy.

**Data model**
- Versioned migrations (`backend/migrations.py`, `PRAGMA user_version`), applied on startup.
- New tables: `mothers`, `babies`, `family_links`, `pregnancies`, `consents`, `care_plan_items`,
  `growth_measurements`, `immunization_records`, `feeding_sessions`, `plans`, `payment_events`,
  `audit_log`, `refresh_tokens`.
- APIs for babies, growth measurements and immunization schedules/records.
- Consent records, data export (`GET /api/export`) and account erasure (`DELETE /api/account`).
- Per-user task IDs (fixes cross-user PK collisions).

## Run locally

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
# open http://localhost:8000
```

For development, set `APP_ENV=development` (default) and optionally `JWT_SECRET`.
For production set: `APP_ENV=production`, `JWT_SECRET` (32+ chars), `ALLOWED_ORIGINS`,
`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `DATABASE_PATH`.

## Tests

```bash
cd backend && python3 test_hardened.py   # 34 checks — all pass
```
Note: the old `test_api.py` asserted the insecure fake-payment bypass and is obsolete; use
`test_hardened.py`.

## Deploy

`render.yaml` provisions a Docker web service with a persistent 1 GB disk at `/app/data`,
`healthCheckPath: /health`, generated `JWT_SECRET`, explicit `ALLOWED_ORIGINS`, and empty
Razorpay secrets to be filled in the Render dashboard.

`docker build -t maternacare . && docker run -p 10000:10000 -v $PWD/data:/app/data maternacare`

## Remaining work (from approved roadmap)

- Phase 2: clinician-reviewed triage rebuild, false-negative regression corpus, risk-adaptive
  WHO/NHM schedules, immunization UI, content versioning.
- Phase 3: refresh-token rotation, email verification, notifications, caregiver/clinician roles,
  growth charts, remove duplicate frontend clinical engine, accessibility pass.
- Phase 4: CI, managed Postgres, observability, clinical governance, DPDP legal review.

## Audit documents

`TECHNICAL_AUDIT.md`, `FEATURE_MATRIX.md`, `DATABASE_DESIGN.md`, `SECURITY_AUDIT.md`,
`MEDICAL_SAFETY_AUDIT.md`, `IMPLEMENTATION_ROADMAP.md`.
