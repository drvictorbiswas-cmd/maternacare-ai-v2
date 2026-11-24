# MEDICAL SAFETY AUDIT — Maternacare AI

**Audit date:** 2026-11-24 · **Repo:** `drvictorbiswas-cmd/maternacare-full`
**Scope:** clinical content, danger-sign logic, scheduling, chat safety, claims and governance.
Audit-only; no code or content was changed. **This application is not clinically validated.**

---

## 1. Verdict

The app contains a **safety-critical defect**: its danger-sign engine misses several common, high-risk presentations. Because the app is intended to guide pregnant women, postpartum mothers and caretakers of newborns, a false negative can delay emergency care. This must be fixed and clinically reviewed before any real-user deployment.

No content in the repository has been reviewed by a qualified clinician; there is no evidence of clinical governance, no publication dates, no evidence grades, and no guideline-update process.

---

## 2. Danger-sign triage — false negatives (🔴 critical)

`backend/engine.py::triage()` lowercases free text and matches substrings from `DANGER[i]['m']` keyword lists, filtered by stage. Empirically tested against the running implementation:

| User phrase | Stage | Expected | Actual |
|---|---|---|---|
| "not feeling baby move today" | pregnancy | urgent (reduced movements) | **NO MATCH** |
| "baby is not moving much" | pregnancy | urgent | **NO MATCH** |
| "severe pain in abdomen" | pregnancy | urgent/emergency | **NO MATCH** |
| "mere pet mein bahut dard hai" (Hindi: severe abdominal pain) | pregnancy | urgent | **NO MATCH** |
| "I have fits" | pregnancy | emergency (convulsions) | **NO MATCH** |
| "missed period and pain" | pregnancy | urgent (ectopic risk) | **NO MATCH** |
| "baby is blue" | newborn | emergency | **NO MATCH** |
| "baby has difficulty breathing" | newborn | emergency | ✅ emergency |
| "heavy bleeding" / "bleeding heavily" | pregnancy | emergency | ✅ emergency |
| "water broke" | pregnancy | urgent | ✅ urgent |
| "fever" | newborn | urgent | ✅ urgent |

**Root causes:**
- Exact-substring keyword lists; no stemming, synonyms, fuzzy matching, or negation handling.
- Missing terms: "not feeling/moving", "severe pain/abdominal pain", "fits", "blue/lips", "missed period".
- Hindi/Bengali coverage is sparse and uses a mix of scripts/romanization; " mere pet mein dard" is common Hinglish and is missed.
- No combination logic: "pain + bleeding", "headache + swelling", "fever + rash" require multiple flags.
- Stage scoping `pregnancy|postpartum|newborn` means a postpartum heavy bleeding phrase ("heavy bleeding") maps to the `ppbleed` rule only if stage is postpartum; if the user's profile still says `pregnancy`, the emergency bleeding rule fires (safe), but the reverse mismatch can mis-triage.

**Positive observations:** danger signs are checked before general chat replies; emergency urgency outranks urgent; the UI shows an emergency banner and "call 102" line; steps are immediate-action oriented and do not ask the user to complete a questionnaire first. These design principles are correct and must be preserved.

---

## 3. Content inventory and quality

| Content set | Count | Languages | Source tag | Date / version | Evidence grade | Clinician sign-off |
|---|---|---|---|---|---|---|
| Education items | 9 | en/hi/bn | organization name only | ❌ | ❌ | ❌ |
| Danger signs | 12 | en/hi/bn reasons | none in data | ❌ | ❌ | ❌ |
| Traditions | 10 | en only from API | organization/topic | ❌ | ❌ | ❌ |

Examples of source tags: `WHO / MoHFW`, `WHO ANC / NHM`, `WHO ANC / FOGSI`, `CDC / WHO`, `Limited research`. These identify an organization but not a **document, edition, publication date, or URL**. They cannot be audited or kept current.

**Content gaps versus product direction:**
- Labour & delivery education: absent.
- Postpartum danger signs beyond bleeding/fever: wound infection, DVT, severe headache/visual changes (present in rules but no education), mental health (rules only).
- Newborn: no jaundice thresholds, no temperature measurement guidance, no feeding frequency, no safe-sleep positioning education beyond one bullet.
- Immunization: `imm_schedule()` exists but is never exposed through any API or UI.
- Growth monitoring and developmental milestones: absent.
- No risk-stratified guidance: the `high_risk` boolean is collected but never changes education or schedules (a high-risk user gets the same 8-visit generic plan).

---

## 4. Traditional-practice evaluator

10 practices are covered with a respectful structure (belief / why / evidence / benefit / risk / verdict / alternative / doctor-when). This is a good pattern.

Safety observations:
- Verdicts are reasonable for the sampled cases (honey → `contraindicated`, abdominal binding and cord substances → `harmful`, saffron → `insufficient`).
- **TR-01:** verdict taxonomy in the data (`safe`, `insufficient`, `harmful`, `contraindicated`, `unknown`) does not include the `supported` label used by the frontend `Engine.VERDICT`, so well-evidenced practices cannot be represented.
- **TR-02:** "Oil massage" is labelled `safe` while the evidence text says growth claims are unproven and herbal oils can harm newborns — borderline; needs clinician wording and context.
- **TR-03:** "Milk with ghee" risk note mentions "excess calories; problematic in gestational diabetes" but lacks quantitative guidance — acceptable only as education, must not become a dietary prescription.
- **TR-04:** no emergency escalation for practices associated with acute harm beyond generic "see doctor" text.
- No sources with document dates or URLs; no mechanism to update or clinically review.

---

## 5. Clinical logic defects (non-triage)

| ID | Issue | Consequence |
|---|---|---|
| CL-01 | EDD from `weeks` allows negative and >45; future LMP accepted; unparseable date raises 500 | Wrong gestational age → wrong education, wrong ANC due dates |
| CL-02 | `anc_schedule()` hardcodes weeks [12,20,26,30,34,36,38,40] independent of `high_risk` and local protocol | Contradicts the stated requirement to support WHO and Indian NHM schedules rather than one universal plan |
| CL-03 | `imm_schedule()` is dead code — no API/UI | Families cannot track vaccinations despite product goal |
| CL-04 | Chat `dw` keyword "test"/"visit" returns schedule info from tasks only; if no tasks, gives generic advice | May mislead about due investigations |
| CL-05 | Chat education branch returns only the **first** education item for the stage | Narrow, potentially incomplete guidance |
| CL-06 | `chat_reply()` fallback is generic; no "emergency" phrase detection outside the danger engine | A user saying "it's an emergency" with no keyword gets the fallback, not escalation |
| CL-07 | No negation handling: "no bleeding" matches the bleeding rule | False emergency alarm (annoyance, alarm fatigue) |
| CL-08 | Triage returns only one best match; co-occurring red flags are not surfaced | Under-triage of complex presentations |

---

## 6. Claims, disclaimers and governance

- The README carries a prototype disclaimer; the frontend displays a disclaimer banner (dismissible). Good.
- **GV-01:** README says "server-side verification with Razorpay signature (HMAC SHA256)" and "Real auth", but default config bypasses verification — the claim overstates actual behavior (see SECURITY_AUDIT).
- **GV-02:** `frontend/manifest.json` description says "offline ... safety triage and care reminders" — offline triage is not available; misleading.
- **GV-03:** No clinician review process, no medical advisory board, no content-change approval workflow, no versioning, no incident reporting path for unsafe advice (the feedback form has no review pipeline).
- **GV-04:** No compliance review against India's DPDP Act or clinical/legal requirements.
- **GV-05:** No distinction in the UI between "educational information" and "medical advice" beyond a single dismissible banner. Requirement explicitly asks for a clear distinction.

---

## 7. Required remediation (clinical)

1. **Rebuild triage as a reviewed rule set**: symptom → red-flag mapping with synonyms in en/hi/bn + Hinglish, negation handling, combination rules, and severity scoring. Validate with a clinician-created test corpus of at least 100 phrases including false-positive cases.
2. **Never downgrade an emergency**: on any ambiguity, classify as emergency/urgent and instruct to seek care; never reassure.
3. **Add a hard emergency override**: phrases like "emergency", "ambulance", "dying", "unconscious" trigger emergency regardless of keyword match.
4. **Versioned, reviewed content**: store document title, edition, publication date, URL, evidence grade, reviewer name/date, next-review date. Block display of unreviewed content in production.
5. **Risk-adaptive schedules**: implement WHO 8-contact and Indian NHM schedules as selectable/adaptive plans; never hardcode one universal schedule; require clinician override controls.
6. **Enable immunization tracking** end-to-end using the current MoHFW schedule with dose dates and records.
7. **Add mother/baby separation** so newborn signs and vaccines are scoped to a baby record.
8. **Withdraw misleading claims** and make the educational-vs-advice distinction persistent (not dismissible) on clinical screens.
9. **Establish clinical governance** before deployment: qualified reviewer sign-off, incident reporting, content update SLA, audit trail.

---

*End of medical safety audit. This document is an engineering audit, not a medical review.*
