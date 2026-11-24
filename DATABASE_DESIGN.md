# DATABASE DESIGN & MIGRATION AUDIT — Maternacare AI

**Audit date:** 2026-11-24 · **Repo:** `drvictorbiswas-cmd/maternacare-full`
Audit-only; no schema changes were applied.

---

## 1. Current schema (as built)

`init_db()` in `backend/main.py` creates six tables with `CREATE TABLE IF NOT EXISTS`:

| Table | Columns | Notes |
|---|---|---|
| `users` | `id TEXT PK`, `email TEXT UNIQUE`, `phone TEXT UNIQUE`, `password TEXT`, `created_at TEXT` | Identifier type inferred by `@` in signup |
| `profiles` | `user_id TEXT PK`, `data TEXT` (JSON blob), `updated_at TEXT` | All clinical/profile fields in one unstructured blob |
| `tasks` | `id TEXT PK`, `user_id TEXT`, `type TEXT`, `title TEXT`, `due TEXT`, `week INT`, `note TEXT`, `custom INT`, `done INT`, `done_at TEXT` | No FK, no index |
| `chat` | `id INTEGER PK AUTOINCREMENT`, `user_id TEXT`, `role TEXT`, `text TEXT`, `kind TEXT`, `created_at TEXT` | No FK, unbounded growth |
| `subscriptions` | `user_id TEXT PK`, `plan TEXT`, `payment_id TEXT`, `activated_at TEXT`, `expires_at TEXT` | Plan is free-form string |
| `feedback` | `id INTEGER PK`, `user_id TEXT`, `text TEXT`, `created_at TEXT` | No status/moderation |

`PRAGMA foreign_keys` is **not** enabled. No indexes exist beyond primary keys and UNIQUE constraints.

### Critical data-exposure finding
`backend/data/maternacare.db` is **tracked by git** in a **public** repository. Inspection found: 4 users (including an email and a 10-digit phone number), 1 profile, 9 tasks, 2 chat messages, 2 subscriptions. This must be removed from the working tree and from git history; treat every value in it as leaked. No code change was made during this audit.

---

## 2. What is missing for the product direction

The stated direction requires mother and baby to be **separate records linked through a family relationship**. The current schema cannot represent this:

| Required concept | Current support | Needed |
|---|---|---|
| Mother record | Single JSON blob in `profiles` | Structured `mothers` table |
| Baby record | ❌ | `babies` table with DOB, name, sex, birth weight, mother_id |
| Family relationship | ❌ | `family_members` / `relationships` table with role + consent |
| Baby-specific tasks/immunizations | ❌ | `baby_id` on tasks; immunization records table |
| Growth measurements | ❌ | `growth_measurements` (date, weight, length, head circumference, source) |
| Milestone tracking | ❌ | `milestone_observations` |
| Breastfeeding sessions | ❌ | `feeding_sessions` |
| Clinical risk flags | ❌ | `risk_assessments` with reviewer + date |
| Consent records | single boolean in profile | `consents` (purpose, version, timestamp, withdrawal) |
| Audit trail | ❌ | `audit_log` (actor, action, entity, timestamp) |
| Appointment/investigation catalog | ⚠️ generated tasks only | `care_plan_items` with status and clinician override |
| Subscription/payment events | one row per user | `payment_events` with order id, signature status, webhook payload |

---

## 3. Proposed target schema (for review — not implemented)

```
users(id PK, email UNIQUE, phone UNIQUE, password_hash, created_at, last_login_at,
      status, failed_attempts, locked_until)

mothers(id PK, user_id FK→users, date_of_birth, blood_group, height_cm, weight_kg,
        high_risk, risk_notes, created_at, updated_at)

babies(id PK, mother_id FK→mothers, name, date_of_birth, sex, birth_weight_g,
       gestation_at_birth_weeks, created_at, updated_at)

family_links(id PK, user_id FK→users, baby_id FK→babies, role, consent_id, created_at)

pregnancies(id PK, mother_id FK→mothers, lmp, edd, parity, status, created_at, updated_at)

consents(id PK, user_id FK→users, purpose, version, granted_at, withdrawn_at, text_hash)

care_plan_items(id PK, user_id FK, baby_id FK NULL, mother_id FK NULL, type, title,
                due_date, status, clinician_override, created_at, completed_at)

growth_measurements(id PK, baby_id FK, measured_at, weight_g, length_cm, head_circ_cm,
                    source, recorded_by)

immunization_records(id PK, baby_id FK, vaccine_code, due_date, given_date, status,
                     batch_no, facility)

feeding_sessions(id PK, baby_id FK, started_at, ended_at, type, notes)

chat_messages(id PK, user_id FK, baby_id FK NULL, role, text, kind, created_at)

subscriptions(id PK, user_id FK, plan_id FK, status, current_period_end, cancelled_at)

payment_events(id PK, user_id FK, order_id UNIQUE, payment_id, signature_verified,
               event_type, payload_hash, created_at)

audit_log(id PK, actor_id, action, entity_type, entity_id, created_at, ip_hash)

plans(id PK, code UNIQUE, price_paise, currency, duration_days, active)
```

**Key design rules:**
- Every PHI table carries `user_id`/`mother_id`/`baby_id` for row-level authorization; queries must filter by the authenticated user's family scope.
- Use foreign keys with `PRAGMA foreign_keys=ON` and `ON DELETE` behaviors defined.
- Store dates as ISO-8601 strings consistently; store money in paise integers.
- Never store raw Razorpay webhook payloads; store a hash and only needed fields.
- Do not put medical values in JSON blobs — they need validation, querying, and audit.

---

## 4. Migration requirements

**Current state:** none. `CREATE TABLE IF NOT EXISTS` cannot evolve schema.

Required before any further development:
1. Introduce a migration mechanism (Alembic is standard with SQLAlchemy; a minimal in-house runner with `PRAGMA user_version` and ordered SQL files is acceptable for this size).
2. Version every schema change; migrations must be idempotent and tested against a copy of production-shaped data.
3. Migration policy: additive columns first (nullable), backfill, then constraints — never destructive in a single deploy.
4. Add a startup check that fails closed if the DB schema version is behind.
5. Provide a tested migration path from the current 6-table schema (including the committed DB's shape) to the target schema, with a documented PHI-scrubbing step.
6. **Operational requirement:** attach a persistent volume/disk in Render (or use managed Postgres) — the current `render.yaml` has no disk, so any SQLite data is lost on redeploy.

---

## 5. Data quality & validation issues

- `profiles.data` JSON has no schema; `stage` normalization (`pregnant` → `pregnancy`) happens in application code and is not enforced at the DB layer.
- `compute_edd()` accepts arbitrary `weeks` (negative, >45), future LMP dates, and unparseable dates (raises `ValueError` → unhandled 500). Needs domain validation: LMP not in future, weeks 0–45, EDD reasonable relative to LMP.
- `tasks.due` is an unvalidated string; comparisons with `date.today().isoformat()` rely on ISO format.
- `subscriptions.plan` is any string; must reference a `plans` table.
- No uniqueness constraint preventing duplicate generated ANC tasks beyond the application-level `COUNT(*)==0` check (race-prone).

---

## 6. Retention, deletion & portability (DPDP Act)

- No data-retention policy or deletion endpoint. Right-to-erasure is not implemented.
- No data export (user cannot retrieve their records).
- No consent withdrawal affecting processing.
- Chat messages and feedback are retained indefinitely.
- Backups/encryption at rest are unspecified.

---

*End of database design audit.*
