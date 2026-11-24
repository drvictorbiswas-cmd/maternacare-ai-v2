# DATABASE DESIGN & MIGRATION AUDIT — Maternacare AI

**Audit date:** 2026-11-24 · **Repo:** `maternacare-full` (local)  
**Status:** Audit only. No schema changes were applied. Awaiting your approval before development.

---

## 1. Current schema (as built)

Schema is versioned via `PRAGMA user_version` with two idempotent migrations (`backend/migrations.py`, v1 + v2). `PRAGMA foreign_keys=ON` is enabled.

| Table | Key columns | Notes |
|---|---|---|
| `users` | `id PK`, `email UNIQUE`, `phone UNIQUE`, `password`, `created_at` | Identifier type inferred by `@` at signup |
| `profiles` | `user_id PK`, `data` (JSON blob), `updated_at` | Mother's clinical profile in one unstructured blob |
| `tasks` | `id PK`, `user_id`, `type`, `title`, `due`, `due_date`, `week`, `custom`, `done`, `done_at` | Index on `user_id`, `due_date` |
| `chat` | `id PK AUTOINCREMENT`, `user_id`, `role`, `text`, `kind`, `created_at` | No FK; unbounded growth |
| `subscriptions` | `user_id PK`, `plan`, `payment_id`, `activated_at`, `expires_at`, `status`, `current_period_end` | Plan validated against `plans` at verification time |
| `feedback` | `id PK`, `user_id`, `text`, `created_at` | No status/moderation |
| `mothers` | `id PK`, `user_id FK`, `date_of_birth`, `blood_group`, `height_cm`, `weight_kg`, `high_risk`, `risk_notes`, `created_at`, `updated_at` | Mother record |
| `babies` | `id PK`, `mother_id FK`, `name`, `date_of_birth`, `sex`, `birth_weight_g`, `gestation_weeks`, `created_at`, `updated_at` | Baby record |
| `family_links` | `id PK`, `user_id FK`, `baby_id FK`, `role`, `consent_id`, `created_at` | Family relationship link |
| `pregnancies` | `id PK`, `mother_id FK`, `lmp`, `edd`, `parity`, `status`, `created_at`, `updated_at` | Pregnancy record |
| `consents` | `id PK`, `user_id FK`, `purpose`, `version`, `granted_at`, `withdrawn_at`, `text_hash` | Consent records |
| `care_plan_items` | `id PK`, `user_id FK`, `mother_id FK`, `baby_id FK`, `type`, `title`, `due_date`, `status`, `clinician_override`, `created_at`, `completed_at` | Appointment/investigation catalog |
| `growth_measurements` | `id PK`, `baby_id FK`, `measured_at`, `weight_g`, `length_cm`, `head_circ_cm`, `source`, `recorded_by` | Growth tracking |
| `immunization_records` | `id PK`, `baby_id FK`, `vaccine_code`, `due_date`, `given_date`, `status`, `batch_no`, `facility` | Immunization records |
| `feeding_sessions` | `id PK`, `baby_id FK`, `started_at`, `ended_at`, `type`, `notes` | Feeding logging |
| `plans` | `code PK`, `price_paise`, `currency`, `duration_days`, `active` | Price catalog (monthly ₹990/30d, yearly ₹7,990/365d) |
| `payment_events` | `id PK`, `user_id FK`, `order_id UNIQUE`, `payment_id`, `signature_verified`, `event_type`, `payload_hash`, `created_at` | Payment audit |
| `audit_log` | `id PK`, `actor_id`, `action`, `entity_type`, `entity_id`, `detail`, `created_at` | Audit trail |
| `refresh_tokens` | `token_hash PK`, `user_id FK`, `expires_at`, `revoked`, `created_at` | Unused by endpoints yet |

Indexes: `idx_tasks_user`, `idx_tasks_due`, `idx_babies_mother`, `idx_care_user`, `idx_growth_baby`, `idx_imm_baby`, `idx_audit_actor`.

---

## 2. Mother/baby separation & family relationship (product requirement met in schema)

The stated direction requires mother and baby to be **separate records linked through a family relationship**. The schema now supports this:

| Required concept | Schema support |
|---|---|
| Mother record | ✅ `mothers` table |
| Baby record | ✅ `babies` table (DOB, name, sex, birth weight, gestation weeks, mother_id) |
| Family relationship | ✅ `family_links` (role + consent_id) |
| Baby-specific tasks/immunizations | ✅ `baby_id` on growth/immunization; care_plan_items allows `baby_id` NULL |
| Growth measurements | ✅ `growth_measurements` |
| Feeding sessions | ✅ `feeding_sessions` |
| Consent records | ✅ `consents` (purpose/version/timestamp/withdrawal) |
| Audit trail | ✅ `audit_log` |
| Subscription/payment events | ✅ `payment_events` |

---

## 3. Migration requirements (remaining work)

Current state: migrations v1 (baseline, all tables) + v2 (additive columns: `due_date`, `subscriptions.status/current_period_end`) exist and run on startup.

Required before further development:
1. Test the migration path on a production-shaped copy of the database; document a PHI-scrubbing step.
2. Add a startup check that fails closed if the DB schema version is behind expected.
3. Migration policy: additive columns first (nullable), backfill, then constraints — never destructive in a single deploy.
4. Provide a tested migration path from the legacy 6-table schema to the current normalized schema.
5. **Operational:** attach a persistent volume/disk in Render (or use managed Postgres) — without this, SQLite data is lost on redeploy.

---

## 4. Data quality & validation issues

- `profiles.data` JSON has no DB-level schema; stage normalization (`pregnant` → `pregnancy`) happens in application code, not enforced at the DB layer.
- `compute_edd()` accepts negative/`>45` weeks and future LMP dates; unparseable dates raise `ValueError` → 500. Needs domain validation: LMP not in future, weeks 0–45, EDD reasonable relative to LMP.
- `tasks.due` is an unvalidated string; comparisons rely on ISO format.
- `subscriptions.plan` is any string; must reference `plans.code` at the DB or strict application layer.
- No uniqueness constraint preventing duplicate generated ANC tasks beyond the application-level `COUNT(*)==0` check (race-prone).

---

## 5. Retention, deletion & portability (DPDP Act)

- Data-retention policy not defined.
- `/api/export` (right to access/portability) and `/api/account` (right to erasure) endpoints exist.
- Erasure anonymizes `payment_events` for audit but deletes user data; chat/feedback otherwise retained indefinitely.
- No consent-withdrawal effect on processing enforced at the API layer.
- Backups/encryption at rest unspecified — managed Postgres recommended.

---

*End of database design audit.*
