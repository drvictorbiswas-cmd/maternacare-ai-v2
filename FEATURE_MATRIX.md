# FEATURE MATRIX — Maternacare AI

**Audit date:** 2026-11-24 · **Repo:** `drvictorbiswas-cmd/maternacare-full`
**Legend:** ✅ working · ⚠️ partial/broken · ❌ missing · 🔴 unsafe (must not ship)

Product direction: maternal & child healthcare companion for India — pregnancy planning, antenatal care, follow-up, postpartum recovery, breastfeeding, newborn care, vaccination, growth monitoring, reminders, AI-guided health education. Mother and baby must be separate linked records.

---

## 1. Journey coverage

| Journey / Stage | Status | Evidence | Gap |
|---|---|---|---|
| Preconception / planning | ⚠️ | 1 education item (`planning`); onboarding stage exists | No preconception risk assessment, no checklist, no folic-acid reminder logic |
| First trimester | ⚠️ | `t1` education (1 item), first ANC visit task | Only 1 education item; no investigations tracking |
| Second trimester | ⚠️ | `t2` education (1 item) | No anomaly scan / GDM scheduling logic |
| Third trimester | ⚠️ | `t3` education (1 item) | No birth-plan module, no kick-count tool |
| Labour & delivery | ❌ | none | Entire stage absent |
| Postpartum (0–6 weeks+) | ⚠️ | `postpartum` education (2 items) | No lochia/wound/mood tracking, no visit schedule |
| Breastfeeding | ⚠️ | 1 education bullet | No latch/positioning guidance, no problem triage |
| Newborn care | ⚠️ | `newnewborn` education (2 items) | No cord/jaundice/temperature tracking tools |
| Infant immunization | ⚠️ | `imm_schedule()` exists in engine but **never called by any API** | No UI, no records, no reminder generation |
| Growth monitoring | ❌ | none | No weight/length/head-circumference, no WHO charts |
| Child development (0–2y) | ⚠️ | `child` education (1 item) | No milestone checklist |
| Family / baby linkage | ❌ | none | No baby record, no relationship table |

## 2. Functional modules

| Module | Status | Notes |
|---|---|---|
| Sign-up / sign-in (email, phone+password) | ✅ | JWT + pbkdf2; phone unverified |
| Onboarding + consent flag | ✅ | Consent is a checkbox; no consent text/version/timestamp record |
| EDD / week computation | ⚠️ | Works for valid LMP; no validation (see TECHNICAL_AUDIT BR-02) |
| ANC schedule generation | ⚠️ | 8 visits generated once; WHO-aligned but not risk-adaptive, no NHM option |
| Appointment/task reminders | ⚠️ | Manual "mark done"; **no notification delivery** |
| Education library | ⚠️ | 9 items total, 3 languages, source names only |
| Traditional practice evaluator | ✅ | 10 practices with belief/evidence/verdict/alternative; English-only from API |
| Danger-sign triage | 🔴 | 12 keyword rules with false negatives (see MEDICAL_SAFETY_AUDIT) |
| Rule-based chat | ⚠️ | Routes danger → schedule → tradition → education → fallback; no LLM |
| Dashboard summary | ✅ | Week, EDD, next task, subscription |
| Subscription paywall | 🔴 | Client-side gate; fake payment activates access |
| Razorpay checkout | 🔴 | No real order; verification bypassable |
| Feedback | ⚠️ | Saves text; no review workflow or notification |
| PWA install / offline shell | ⚠️ | Shell cached; data requires network |
| Animations / micro-interactions | ✅ | Splash (removed), page transitions, stagger, sheets, ripple, toast, haptics |
| Localization (en/hi/bn) | ⚠️ | UI strings complete; backend content English-only; divergent duplicate engine |
| Audit trail | ❌ | none |
| Clinician review / escalation | ❌ | none |
| Doctor dashboard | ❌ | none |
| Medical records upload | ❌ | none |

## 3. Data & identity

| Capability | Status | Notes |
|---|---|---|
| Per-user data isolation | ✅ | `user_id` filters on tasks/chat/profile |
| Separate mother and baby profiles | ❌ | Single JSON profile per user |
| Family relationship linking | ❌ | none |
| Multi-caregiver access with consent | ❌ | none |
| Data export / deletion (DPDP) | ❌ | No endpoint for export or right-to-erasure (only localStorage clear on client) |
| Consent versioning / withdrawal | ❌ | single boolean at signup |

## 4. Security & compliance

| Control | Status |
|---|---|
| Password hashing | ✅ pbkdf2_sha256 |
| JWT signing secret | 🔴 default committed |
| Token revocation / refresh | ❌ |
| Rate limiting / lockout | ❌ |
| CORS restriction | 🔴 wildcard + credentials |
| Security headers | ❌ |
| Encryption at rest | ❌ |
| Audit logging | ❌ |
| PHI removed from git | 🔴 DB with user data is committed |
| DPDP Act: notice, consent, purpose limitation, erasure, breach reporting | ❌ partial consent only |

## 5. Test coverage

| Area | Status |
|---|---|
| API happy paths | ✅ 19 smoke checks |
| Negative auth/payment tests | ❌ (test asserts the insecure bypass) |
| Engine unit tests | ❌ |
| Triage false-negative matrix | ❌ |
| Multilingual content tests | ❌ |
| Frontend tests | ❌ |
| Security tests | ❌ |
| CI pipeline | ❌ |

## 6. Must-fix before any real user

1. Remove DB from repo history; rotate any exposed credentials (including the Google API key shared in chat on 2026-11-24 — value deliberately not recorded here).
2. Require JWT secret; fail startup if missing.
3. Real Razorpay order + webhook verification; remove fake-payment path.
4. Server-side subscription enforcement.
5. Rebuild triage safety with clinician-reviewed rules and regression tests.
6. Add mother/baby/family schema and migrations.
7. Restrict CORS, add headers, rate limiting, audit log.
8. Remove `maximum-scale=1`; correct offline claims.

---

*End of feature matrix.*
