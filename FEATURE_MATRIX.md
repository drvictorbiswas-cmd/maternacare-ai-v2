# FEATURE MATRIX — Maternacare AI

**Audit date:** 2026-11-24 · **Repo:** `maternacare-full` (local)  
**Legend:** ✅ working · ⚠️ partial/broken · ❌ missing · 🔴 unsafe (must not ship)  
**Status:** Audit only. No code modified. Awaiting your approval before development.

---

## 1. Journey coverage

Product direction: maternal & child healthcare companion for India — pregnancy planning, antenatal care, follow-up, postpartum recovery, breastfeeding, newborn care, vaccination, growth monitoring, reminders, AI-guided health education. Mother and baby are separate records linked through a family relationship.

| Journey / Stage | Status | Evidence | Gap |
|---|---|---|---|
| Preconception / planning | ⚠️ | 1 education item (`planning`); onboarding stage exists | No preconception risk assessment, no checklist, no folic-acid reminder logic |
| First trimester | ⚠️ | `t1` education (1 item), first ANC visit task | Only 1 education item; no investigations tracking |
| Second trimester | ⚠️ | `t2` education (1 item) | No anomaly scan / GDM scheduling logic |
| Third trimester | ⚠️ | `t3` education (1 item) | No birth-plan module, no kick-count tool |
| Labour & delivery | ❌ | none | Entire stage absent |
| Postpartum (0–6 weeks+) | ⚠️ | `postpartum` education (2 items) | No lochia/wound/mood tracking, no visit schedule |
| Breastfeeding | ⚠️ | 1 education bullet | No latch/positioning guidance, no problem triage |
| Newborn care | ⚠️ | `newborn` education (2 items) | No cord/jaundice/temperature tracking tools |
| Infant immunization | ⚠️ | `imm_schedule()` exists; `/api/immunizations` returns schedule + records | No end-to-end UI reminder generation; schedule not MoHFW-clinician-aligned |
| Growth monitoring | ❌ | `growth_measurements` table + `/api/growth` API exist | No WHO growth charts, no percentile tracking UI |
| Child development (0–2y) | ⚠️ | `child` education (1 item) | No milestone checklist |
| Family / baby linkage | ✅ | `mothers`, `babies`, `family_links`, `pregnancies` tables; baby APIs scoped to mother | UI for linking multiple caregivers not built |

---

## 2. Functional modules

| Module | Status | Notes |
|---|---|---|
| Sign-up / sign-in (email, phone+password) | ✅ | JWT + pbkdf2_sha256; **phone unverified (no OTP)** |
| Onboarding + consent flag | ✅ | Consent checkbox captured; consent records table exists |
| EDD / week computation | ⚠️ | Works for valid LMP; **no domain validation** (future LMP, out-of-range weeks accepted) |
| ANC schedule generation | ⚠️ | 8 visits generated once; WHO-aligned but **not risk-adaptive**, no NHM option |
| Appointment/task reminders | ⚠️ | Manual "mark done"; **no notification delivery** (SMS/WhatsApp/push) |
| Education library | ⚠️ | 9 items total, 3 languages, source names only |
| Traditional practice evaluator | ✅ | 10 practices with belief/evidence/verdict/alternative; English-only from API |
| Danger-sign triage | 🔴 | 12 keyword rules with documented false negatives — **must be clinician-rebuilt** |
| Rule-based chat | ⚠️ | Routes danger → schedule → tradition → education → fallback; **no LLM / agentic AI** |
| Dashboard summary | ✅ | Week, EDD, next task, subscription status |
| Subscription paywall | ✅ (server-side) | Server-side entitlement on gated APIs; UI gate cosmetic; **no fake activation** |
| Razorpay checkout | ✅ (fails closed) | Real server-side order + HMAC verify + webhook; **503 if credentials missing** — remove if integration proves problematic |
| Feedback | ⚠️ | Saves text; **no review workflow or notification** |
| PWA install / offline shell | ⚠️ | Shell cached; data requires network; offline claim overstated |
| Animations / micro-interactions | ✅ | Page transitions, stagger, sheets, ripple, toast |
| Localization (en/hi/bn) | ⚠️ | UI strings complete; backend content English-only; divergent duplicate engine |
| Audit trail | ✅ (table exists) | `audit_log` table populated on key actions; coverage to be confirmed complete |
| Clinician review / escalation | ❌ | none |
| Doctor dashboard | ❌ | none |
| Medical records upload | ❌ | none |

---

## 3. Data & identity

| Capability | Status | Notes |
|---|---|---|
| Per-user data isolation | ✅ | `user_id`/mother scope on all queries; isolation test passes |
| Separate mother and baby profiles | ✅ | Structured `mothers` + `babies` tables linked via `family_links` |
| Family relationship linking | ✅ | `family_links` (role, consent_id) exists |
| Multi-caregiver access with consent | ❌ | Not built |
| Data export / deletion (DPDP) | ✅ | `/api/export` and `/api/account` endpoints exist |
| Consent versioning / withdrawal | ⚠️ | `consents` table exists; withdrawal flow not exposed in UI |

---

## 4. Security & compliance

| Control | Status |
|---|---|
| Password hashing | ✅ pbkdf2_sha256, min 8 chars |
| JWT signing secret | ✅ fail-closed (production refuses weak/missing) |
| Token revocation / refresh | ❌ table exists, no endpoint |
| Rate limiting / lockout | ⚠️ fixed-window rate limiting on auth; no lockout |
| CORS restriction | ✅ restricted to explicit origins |
| Security headers | ✅ CSP, HSTS (prod), nosniff, frame-deny, referrer-policy |
| Encryption at rest | ❌ SQLite unencrypted; Render disk must be attached |
| Audit logging | ✅ `audit_log` table; coverage to be confirmed |
| PHI removed from git | ✅ `data/*.db` + `.env*` not tracked |
| DPDP Act: notice/consent/purpose/erasure | ⚠️ export + erasure endpoints; consent capture; no retention policy |

---

## 5. Test coverage

| Area | Status |
|---|---|
| API happy paths | ✅ 34 hardened checks — all pass |
| Negative auth/payment tests | ✅ fake payment rejected (503); order fails closed |
| Engine unit tests | ❌ none |
| Triage false-negative matrix | ❌ none |
| Multilingual content tests | ❌ none |
| Frontend tests | ❌ none |
| Security tests | ❌ none |
| CI pipeline | ❌ none |

---

## 6. Must-fix before any real user

1. Rebuild danger-sign triage as clinician-reviewed rules with ≥95% recall on a 100+ phrase corpus (zero false reassurance).
2. Complete clinician review / clinical governance sign-off for all medical content.
3. Add email verification, password reset, rate limiting/lockout, OTP phone verification.
4. Short-lived tokens + refresh rotation; logout everywhere; inactivity timeout.
5. Remove `maximum-scale=1`; fix accessibility (WCAG 2.1 AA).
6. Provision persistent disk / managed Postgres; encrypt at rest; backups.
7. Razorpay: sandbox + one live end-to-end test — **if integration proves problematic, remove it** (no fake/simulated payments).
8. No PHI/secrets in git; entitlements enforced server-side (verified).

---

*End of feature matrix.*
