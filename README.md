# Maternacare AI — Full-stack app

A real app: **FastAPI backend + SQLite database + JWT auth + Razorpay verification + animated offline-capable PWA frontend.**

> ⚠️ Prototype — health education/navigation only, not clinically validated, not for diagnosis or emergencies.

## What's real vs the old static PWA

| Feature | Old static PWA | This full app |
|---|---|---|
| Backend | none | FastAPI + SQLite |
| Accounts | browser-only demo | JWT + hashed passwords, email or phone |
| Per-person data | localStorage namespace | server-side rows keyed by user id |
| Payments | client-side only | server-side verification with Razorpay signature (HMAC SHA256) |
| API | none | 20+ REST endpoints |
| Animation | none | page transitions, staggered lists, bottom sheets, ripple, toasts, typing dots, progress ring, haptics |

## Run locally

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
# open http://localhost:8000
```
The backend serves the frontend from `../frontend` automatically.

## Test

```bash
cd backend && python3 test_api.py   # 19 checks, all pass
```

## Deploy (Render free tier)

1. Sign up at https://render.com with GitHub.
2. Push this folder as a GitHub repo.
3. New → Blueprint → connect the repo → `render.yaml` is detected → Apply.
4. Set real `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` in Render env vars.
5. You get a public HTTPS URL.

Docker alternative: `docker build -t maternacare . && docker run -p 10000:10000 maternacare`.

## Config (env vars)

| Var | Default | Purpose |
|---|---|---|
| `JWT_SECRET` | dev-only… | **Set a strong random secret in production** |
| `RAZORPAY_KEY_ID` | empty | Client-side checkout key ID |
| `RAZORPAY_KEY_SECRET` | empty | Server-side signature verification; if empty, verification is skipped (demo mode) |
| `DATABASE_PATH` | backend/data/maternacare.db | SQLite file — put on a persistent volume |

## API overview
- `POST /api/auth/signup`, `/api/auth/login`, `GET /api/me`
- `GET/POST /api/profile`, `/api/tasks`, `/api/tasks/{id}/done`, `DELETE /api/tasks/{id}`
- `GET /api/education`, `/api/traditions`, `/api/triage`, `POST /api/chat`, `GET /api/chat`
- `GET /api/summary`, `POST /api/payments/order`, `/api/payments/verify`, `/api/feedback`
- `GET /health`

## Safety
Danger signs are triaged before any general chat response, over-trigger by design, and never reassure a serious symptom. No dosages are invented. Sources are tagged.

## Files
- `backend/main.py` — FastAPI app, auth, DB, payments, APIs
- `backend/engine.py` — clinical rules engine
- `frontend/` — animated PWA (index.html, style.css, app.js, engine.js, sw.js, manifest.json, icon.svg)
- `Dockerfile`, `render.yaml` — deploy configs
