"""Maternacare clinical rules engine (server-side). Ported from the PWA.
Safety: danger signs triaged first, never diagnoses, never reassures serious symptoms.
"""
from datetime import date, timedelta

EDUCATION = {
    'planning': [
        {'title': {'en':'Start folic acid early','hi':'Folic acid pehle shuru karein','bn':'ফলিক অ্যাসিড আগে শুরু করুন'},
         'body': {'en':'Ask your doctor about folic acid before pregnancy and the right dose for you — do not self-dose.','hi':'Doctor se folic acid aur sahi dose ke baare mein poochhein — khud se na lein.','bn':'গর্ভের আগে ফলিক অ্যাসিড ও সঠিক ডোজ ডাক্তারের কাছে জিজ্ঞাসা করুন।'},'source':'WHO / MoHFW'},
    ],
    't1': [
        {'title': {'en':'Your first antenatal visit','hi':'Pehli antenatal visit','bn':'প্রথম প্রসব-পূর্ব সাক্ষাৎ'},
         'body': {'en':'Book the first antenatal appointment. Expect blood/urine tests and an early ultrasound.','hi':'Pehli antenatal appointment book karein. Blood, urine aur early ultrasound hote hain.','bn':'প্রথম সাক্ষাৎ নির্ধারণ করুন। রক্ত, প্রস্রাব ও early ultrasound হয়।'},'source':'WHO ANC / NHM'},
    ],
    't2': [
        {'title': {'en':'Screening tests come due','hi':'Screening tests ka samay','bn':'স্ক্রিনিং পরীক্ষার সময়'},
         'body': {'en':'Ask about anaemia, blood pressure, gestational diabetes screening and anomaly ultrasound.','hi':'Anaemia, BP, gestational diabetes aur anomaly ultrasound ke baare mein poochhein.','bn':'অ্যানিমিয়া, রক্তচাপ, গেস্টেশনাল ডায়াবেটিস ও আল্ট্রাসাউন্ড সম্পর্কে জিজ্ঞাসা করুন।'},'source':'WHO ANC / FOGSI'},
    ],
    't3': [
        {'title': {'en':'Plan your birth','hi':'Janam ki yojana','bn':'প্রসবের পরিকল্পনা'},
         'body': {'en':'Decide hospital, transport, support person, and what to do if labour starts.','hi':'Hospital, transport, saath wale vyakti aur labour par kya karna hai tay karein.','bn':'হাসপাতাল, পরিবহন, সঙ্গে কে থাকবেন ও প্রসব শুরু হলে কী করবেন ঠিক করুন।'},'source':'WHO birth preparedness'},
    ],
    'postpartum': [
        {'title': {'en':'Rest & recovery','hi':'Aaram aur recovery','bn':'বিশ্রাম ও পুনরুদ্ধার'},
         'body': {'en':'Your body needs time. Accept help, sleep when baby sleeps, eat and drink regularly.','hi':'Sharir ko samay chahiye. Madad lein, baby soye to soyein, khana-pani regular.','bn':'শরীরের সময় লাগে। সাহায্য নিন, শিশু ঘুমালে ঘুমান, নিয়মিত খান।'},'source':'WHO postnatal care'},
        {'title': {'en':'Breastfeeding support is normal','hi':'Breastfeeding mein madad normal hai','bn':'বুকের দুধে সাহায্য স্বাভাবিক'},
         'body': {'en':'Early skin-to-skin helps. Sore nipples are common — a counsellor can help. Fever with breast redness needs care.','hi':'Jaldi skin-to-skin madad karta hai. Nipple dard aam hai. Bukhar + lalima ho to care lein.','bn':'স্কিন-টু-স্কিন সাহায্য করে। জ্বর ও লালচে ভাব হলে যত্ন নিন।'},'source':'WHO infant feeding'},
    ],
    'newborn': [
        {'title': {'en':'Keep baby warm','hi':'Baby ko garam rakhein','bn':'শিশুকে উষ্ণ রাখুন'},
         'body': {'en':'Newborns cannot regulate temperature well. Use skin-to-skin and warm clothing; avoid overheating.','hi':'Naye baby tapta control nahi karte. Skin-to-skin aur garam kapde — zyada garam na karein.','bn':'নবজাতক তাপ নিয়ন্ত্রণ করতে পারে না। স্কিন-টু-স্কিন ও উষ্ণ পোশাক — অতি উত্তাপ এড়ান।'},'source':'WHO newborn care'},
        {'title': {'en':'Cord care: clean & dry','hi':'Nabhi: saaf aur sukha','bn':'নাভি: পরিষ্কার ও শুকনো'},
         'body': {'en':'Keep the cord clean and dry. Do not apply oil, powder or herbs. Seek care for redness, pus or smell with fever.','hi':'Nabhi saaf aur sukha rakhein. Tel, powder ya jadi na lagayein. Lalima/pus + bukhar ho to care lein.','bn':'নাভি পরিষ্কার ও শুকনো রাখুন। তেল বা ভেষজ দেবেন না। লালচে ভাব বা পুঁজ হলে যত্ন নিন।'},'source':'WHO newborn care'},
    ],
    'child': [
        {'title': {'en':'Complementary feeding ~6 months','hi':'6 mahine ke aas-paas khana','bn':'প্রায় ৬ মাসে পরিপূরক খাবার'},
         'body': {'en':'Around 6 months start nutritious foods with continued breastfeeding. Vary foods; avoid added salt/sugar.','hi':'6 mahine par breastfeeding ke saath poshtik khana shuru karein. Namak-cheeni na daalein.','bn':'৬ মাসে বুকের দুধের সাথে পুষ্টিকর খাবার শুরু করুন। লবণ-চিনি এড়ান।'},'source':'WHO infant feeding'},
    ],
}

DANGER = [
    {'id':'bleed','m':['bleeding','blood','missed period','মিস্ড পিরিযড','मिस्ड पीरियড','खून','খ़ून','রক্ত','spotting','abdominal pain','stomach pain','pet mein dard','পেটে ব্যথা','পেটের ব্যথা','পেটে দর্দ','abdomen','pet mein','পেটে ব্যথা র�'],'s':'pregnancy','u':'emergency',
     'r':{'en':'Bleeding in pregnancy can mean miscarriage, ectopic pregnancy or placental problems.','hi':'Pregnancy mein bleeding gambhir samasya ka sanket hai.','bn':'গর্ভে রক্তপাত গুরুতর সমস্যার লক্ষণ।'},
     'a':{'en':'Go to an emergency department now. Do not wait.','hi':'Abhi emergency department jayein.','bn':'এখনই জরুরি বিভাগে যান।'},
     'steps':['Sit or lie down','Note amount & timing','Take pregnancy records','Do not self-medicate']},
    {'id':'headache','m':['severe headache','blurred vision','dhundhla','धुँधला','ঝাপসা','sir dard','মাথাব্যথা'],'s':'pregnancy,postpartum','u':'emergency',
     'r':{'en':'Severe headache with blurred vision can be pre-eclampsia.','hi':'Tez sir dard + dhundhla pre-eclampsia ka sanket hai.','bn':'তীব্র মাথাব্যথা ও ঝাপসা দৃষ্টি প্রি-ইক্ল্যাম্পসিয়া।'},
     'a':{'en':'Seek emergency assessment now. Do not drive if vision is blurred.','hi':'Abhi emergency jaanch.','bn':'এখনই জরুরি পরীক্ষা।'},'steps':['Sit down','Check BP if possible','Note symptoms','Go to emergency care']},
    {'id':'convulsion','m':['convulsion','seizure','jhatka','झटके','খিঁচুনি','fits','fit','epilepsy'],'s':'pregnancy,postpartum,newborn','u':'emergency',
     'r':{'en':'Convulsions can indicate eclampsia or another serious condition.','hi':'Jhatke gambhir samasya ka sanket hain.','bn':'খিঁচুনি গুরুতর সমস্যার লক্ষণ।'},
     'a':{'en':'Call an ambulance NOW. Nothing in mouth. Place on side.','hi':'Abhi ambulance call. Side par litayein.','bn':'এখনই অ্যাম্বুলেন্স কল। পাশে শুইয়ে দিন।'},'steps':['Call emergency','Do not restrain','Turn on side','Time the seizure']},
    {'id':'breath','m':['breath','breathing','saans','साँस','শ্বাস','chest pain','blue','নীল','नीला','cyanosis','লিপস ব্লু','নীল ঠোঁট'],'s':'pregnancy,postpartum,newborn','u':'emergency',
     'r':{'en':'Difficulty breathing or chest pain can be life-threatening.','hi':'Saans lene mein dikkat jaanleva hai.','bn':'শ্বাসকষ্ট বা বুকে ব্যথা জীবন-হুমকি।'},
     'a':{'en':'Call emergency services now. Sit upright.','hi':'Abhi emergency call. Seedhe baithein.','bn':'এখনই জরুরি কল। সোজা বসুন।'},'steps':['Call emergency','Sit upright','Loosen clothing','Do not leave alone']},
    {'id':'movement','m':['reduced movement','less movement','no movement','baby not moving','hulchul','নড়াচড়া','कम हलचल','not moving','not feel','not feeling','kick count','বাচ্চা হলচল','শিশু নড়াচড়ा','शिशु हलचल'],'s':'pregnancy','u':'urgent',
     'r':{'en':'Reduced fetal movements can mean the baby is unwell.','hi':'Baby ki hulchul kam hona bimaari ka sanket hai.','bn':'শিশুর নড়াচড়া কমা অসুস্থতার লক্ষণ।'},
     'a':{'en':'Contact your maternity unit today.','hi':'Aaj hi maternity unit se sampark karein.','bn':'আজই ম্যাটার্নিটি ইউনিটে যোগাযোগ করুন।'},'steps':['Note last movements','Drink & lie on left','Count 2 hours','Call with result']},
    {'id':'fluid','m':['water broke','fluid leaking','leaking','paani','पानी','জল'],'s':'pregnancy','u':'urgent',
     'r':{'en':'Fluid leakage may mean the waters have broken.','hi':'Pani phat sakta hai.','bn':'জল ভেঙে যেতে পারে।'},
     'a':{'en':'Call maternity unit now and go for assessment.','hi':'Abhi call karein aur jaanch ke liye jayein.','bn':'এখনই কল করে পরীক্ষার জন্য যান।'},'steps':['Note time & colour','Use a clean pad','Do not bathe','Go to hospital']},
    {'id':'ppbleed','m':['heavy bleeding','soaking','clots','प्रबल रक্তপাত'],'s':'postpartum','u':'emergency',
     'r':{'en':'Very heavy bleeding after birth can be postpartum haemorrhage.','hi':'Janam ke baad tez bleeding gambhir hai.','bn':'প্রসবের পর প্রবল রক্তপাত গুরুতর।'},
     'a':{'en':'Call emergency services now.','hi':'Abhi emergency call.','bn':'এখনই জরুরি কল।'},'steps':['Call emergency','Lie flat, legs raised','Do not stand suddenly','Keep baby with you']},
    {'id':'fever','m':['fever','chills','bukhar','बुखार','জ্বর'],'s':'postpartum,newborn','u':'urgent',
     'r':{'en':'Fever after birth can mean infection in mother or newborn.','hi':'Bukhar infection ka sanket hai.','bn':'জ্বর সংক্রমণের লক্ষণ।'},
     'a':{'en':'Contact doctor today; newborn fever → hospital immediately.','hi':'Aaj hi doctor; baby ko bukhar → hospital.','bn':'আজই ডাক্তার; নবজাতকের জ্বর → হাসপাতাল।'},'steps':['Record temperature','Note symptoms','Keep baby warm','Same-day care']},
    {'id':'mental','m':['suicidal','harm myself','harm the baby','নিজের ক্ষতি','শিশুর ক্ষতি'],'s':'pregnancy,postpartum','u':'emergency',
     'r':{'en':'Thoughts of harm are a psychiatric emergency. Help is available.','hi':'Nuksan ke vichaar psychiatric emergency hain.','bn':'ক্ষতির চিন্তা মানসিক জরুরি।'},
     'a':{'en':'Call emergency/helpline NOW. Tell someone you trust.','hi':'Abhi emergency call. Bharose wale ko batayein.','bn':'এখনই জরুরি কল। বিশ্বস্ত কাউকে বলুন।'},'steps':['Call emergency','Tell a trusted person','Do not stay alone','Remove harmful means']},
    {'id':'nbfeed','m':['not feeding','poor feeding','stops feeding','খেতে না'],'s':'newborn','u':'urgent',
     'r':{'en':'A newborn who will not feed needs same-day assessment.','hi':'Baby feed na kare to aaj hi jaanch.','bn':'নবজাতক খাচ্ছে না হলে আজই পরীক্ষা।'},
     'a':{'en':'Contact paediatrician today. Continue skin-to-skin.','hi':'Aaj hi pediatrician. Skin-to-skin continue.','bn':'আজই শিশু বিশেষজ্ঞ। স্কিন-টু-স্কিন চালিয়ে যান।'},'steps':['Try skin-to-skin','Offer breast often','Count wet nappies','Same-day review']},
    {'id':'jaundice','m':['jaundice','yellow','peela','पीला','হলুদ'],'s':'newborn','u':'urgent',
     'r':{'en':'Jaundice in first 24h or worsening needs urgent assessment.','hi':'24h mein peeliya turant jaanch chahiye.','bn':'প্রথম ২৪ ঘণ্টায় হলুদ জরুরি।'},
     'a':{'en':'Contact paediatrician today.','hi':'Aaj hi pediatrician.','bn':'আজই বিশেষজ্ঞ।'},'steps':['Note onset','Check spread','Feed frequently','Same-day care']},
    {'id':'cord','m':['cord','navel','pus','নাভি','नाभि'],'s':'newborn','u':'urgent',
     'r':{'en':'Redness/pus around cord with fever can mean infection.','hi':'Nabhi ke paas lalima/pus infection hai.','bn':'নাভির চারপাশে লালচে ভাব সংক্রমণ।'},
     'a':{'en':'Contact paediatrician today. Keep clean & dry.','hi':'Aaj hi pediatrician. Saaf sukha rakhein.','bn':'আজই বিশেষজ্ঞ। পরিষ্কার ও শুকনো রাখুন।'},'steps':['Keep clean/dry','No oil/powder','Note fever','Same-day care']},
]

TRADITIONS = [
    {'id':'saffron','name':'Saffron for a fairer baby','belief':'Eating saffron makes the baby fairer.','why':'Skin colour is valued; saffron is prized.','evidence':'Skin colour is genetic. No food changes it. Food amounts are generally safe.','benefit':'No proven benefit.','risk':'Wasted money; high-dose supplements unsafe.','verdict':'insufficient','alternative':'Enjoy saffron as flavouring; colour is genetic.','doctor':'Before any concentrated supplement in pregnancy.','source':'Genetics / food safety'},
    {'id':'ghee','name':'Milk with ghee','belief':'Builds strength and a healthy baby.','why':'Traditional nourishing foods.','evidence':'Milk gives protein/calcium; ghee is fat. Safe in a balanced diet; no special benefit.','benefit':'Nutritious as food.','risk':'Excess calories; problematic in gestational diabetes.','verdict':'safe','alternative':'Milk/yogurt in a balanced diet; limit ghee if advised.','doctor':'If you have gestational diabetes.','source':'Nutrition evidence'},
    {'id':'papaya','name':'Avoid papaya & pineapple','belief':'They cause miscarriage.','why':'Belief that fruits are “hot”.','evidence':'Ripe fruit is safe. Raw papaya latex in large amounts best limited.','benefit':'No proven benefit.','risk':'Unnecessary restriction.','verdict':'safe','alternative':'Eat ripe fruit in moderation.','doctor':'After a previous miscarriage.','source':'Food-safety guidance'},
    {'id':'binding','name':'Abdominal binding after birth','belief':'Restores the figure.','why':'Believed to reshape the body.','evidence':'No good evidence. Tight binding restricts breathing and circulation.','benefit':'No proven benefit.','risk':'Breathing restriction, impaired circulation.','verdict':'harmful','alternative':'Gentle movement, pelvic-floor exercises when advised.','doctor':'Before any binder after caesarean.','source':'Postpartum safety'},
    {'id':'honey','name':'Honey / ghutti for newborn','belief':'A drop cleanses the baby.','why':'Traditional “opening” ritual.','evidence':'Honey can contain botulism spores causing fatal illness in babies under 12 months.','benefit':'No proven benefit.','risk':'Infant botulism — life-threatening.','verdict':'contraindicated','alternative':'Breastfeed as soon as possible; only doctor-prescribed medicines.','doctor':'Immediately if a baby given honey is unwell.','source':'CDC / WHO'},
    {'id':'cordsub','name':'Substances on the cord','belief':'Oil/powder applied to dry/protect.','why':'Traditional drying.','evidence':'Cord heals best clean and dry; substances can cause infection.','benefit':'No proven benefit.','risk':'Infection, tetanus risk.','verdict':'harmful','alternative':'Clean, dry cord care.','doctor':'If redness, pus or fever.','source':'WHO newborn care'},
    {'id':'bath','name':'Delaying first bath','belief':'Baby should not be bathed for days.','why':'Fear of chilling.','evidence':'WHO suggests delaying ~24h; gentle warm bathing after is fine.','benefit':'Short delay supported.','risk':'Poor hygiene if avoided entirely.','verdict':'safe','alternative':'Delay ~24h, then warm bath with drying.','doctor':'If low temperature or jaundice.','source':'WHO newborn'},
    {'id':'massage','name':'Oil massage','belief':'Strengthens and improves sleep/growth.','why':'Bonding ritual.','evidence':'Promotes relaxation; growth claims unproven; avoid strong oils on newborns.','benefit':'Relaxation supported.','risk':'Skin reaction.','verdict':'safe','alternative':'Plain oil if tolerated.','doctor':'If a rash appears.','source':'Limited research'},
    {'id':'rest','name':'Restricting movement','belief':'Pregnant women should rest and avoid activity.','why':'Fear of harm.','evidence':'Moderate activity is generally safe; complete inactivity can be harmful.','benefit':'Moderate activity beneficial.','risk':'Deconditioning.','verdict':'safe','alternative':'Walking and gentle activity within comfort.','doctor':'If high-risk or bleeding.','source':'WHO activity guidance'},
    {'id':'kadha','name':'Herbal kadhas / medicines','belief':'Prevent illness or ease labour.','why':'Trust in traditional medicine.','evidence':'Many untested for safety; some harmful or interact with medicines.','benefit':'Not proven.','risk':'Unknown toxicity, interactions.','verdict':'unknown','alternative':'Discuss any herbal product with your doctor.','doctor':'Always before herbal medicine.','source':'Traditional medicine safety'},
]

def compute_edd(lmp=None, edd=None, weeks=None):
    today = date.today()
    if edd:
        e = date.fromisoformat(edd)
        return e.isoformat(), max(0, (today - e).days + 280)
    if lmp:
        l = date.fromisoformat(lmp)
        return (l + timedelta(days=280)).isoformat(), max(0, (today - l).days)
    if weeks is not None:
        return (today + timedelta(days=max(0, 280 - int(float(weeks)) * 7))).isoformat(), int(float(weeks)) * 7
    return None, None

def stage_from_days(days):
    w = (days or 0) / 7
    return 't1' if w < 14 else ('t2' if w < 28 else 't3')

def education_for(stage, days=None):
    if stage == 'pregnancy': return EDUCATION.get(stage_from_days(days), EDUCATION['t1'])
    if stage == 'postpartum': return EDUCATION['postpartum']
    if stage == 'baby': return EDUCATION['newborn'] + EDUCATION['child']
    return EDUCATION['planning']

# Negation words that suppress a danger keyword when nearby (CL-07: no false alarms).
NEGATION = ['no ', 'not ', 'dont', "don't", 'do not', 'never', 'without', 'none', 'denies', 'denied',
            'nahin', 'नहीं', 'নেই', 'না', 'no bleeding', 'not bleeding']

# Hard emergency override phrases — always emergency regardless of keyword match (CL-06).
EMERGENCY_OVERRIDE = ['emergency', 'ambulance', 'dying', 'unconscious', 'collapse', 'collapsed',
                      'help me', 'মদদ', 'সাহায্য', 'मदद', 'turant', 'अभी', 'এখন']


def _has_negation(s, keyword):
    """Return True if a negation word appears within ~25 chars before the keyword (CL-07)."""
    idx = s.find(keyword)
    if idx < 0:
        return False
    before = s[max(0, idx - 25):idx]
    return any(n in before for n in NEGATION)


def triage(text, stage):
    if not text or not text.strip():
        return None
    s = text.lower()
    stages = 'pregnancy' if stage == 'pregnancy' else ('postpartum,newborn' if stage == 'postpartum' else 'newborn,child')

    # Hard emergency override (CL-06)
    if any(k in s for k in EMERGENCY_OVERRIDE):
        return {
            'urgency': 'emergency', 'id': 'override_emergency',
            'reason': {'en': 'You mentioned an emergency. Treat this as urgent until assessed by a clinician.',
                       'hi': 'आपने आपातकालीन स्थिति बताई है. डॉक्टर से जांच तक इसे आपातकालीन मानें.',
                       'bn': 'আপনি জরুরি অবস্থার কথা বলেছেন. চিকিৎসকের পরীক্ষা পর্যন্ত এটি জরুরি মনে করুন।'},
            'action': {'en': 'Go to an emergency department now. Do not wait.',
                       'hi': 'अब ही आपातकालीन विभाग जाएं. इंतजार न करें.',
                       'bn': 'এখনই জরুরি বিভাগে যান। অপেক্ষা করবেন না।'},
            'steps': ['Go to emergency now', 'Call 102 for ambulance in India', 'Do not drive yourself'],
            'all': [],
        }

    rank = {'emergency': 0, 'urgent': 1}
    found = []
    for d in DANGER:
        if not any(x in stages for x in d['s'].split(',')):
            continue
        # Keyword match with negation suppression (CL-07)
        if not any(k.lower() in s and not _has_negation(s, k.lower()) for k in d['m']):
            continue
        found.append(d)

    if not found:
        return None

    found.sort(key=lambda d: rank.get(d['u'], 2))
    primary = found[0]
    return {
        'urgency': primary['u'], 'id': primary['id'],
        'reason': primary['r'], 'action': primary['a'], 'steps': primary['steps'],
        'all': [{'id': d['id'], 'urgency': d['u'], 'reason': d['r'], 'action': d['a'], 'steps': d['steps']} for d in found],
    }

def anc_schedule(edd):
    if not edd: return []
    e = date.fromisoformat(edd)
    return [{'id': f'anc_{i+1}', 'type': 'anc', 'title': f'Antenatal visit #{i+1}',
             'due': (e - timedelta(days=(40 - w) * 7)).isoformat(), 'week': w}
            for i, w in enumerate([12, 20, 26, 30, 34, 36, 38, 40])]

def imm_schedule(birth):
    if not birth: return []
    b = date.fromisoformat(birth)
    items = [(0,'BCG, OPV-0, Hep B'),(42,'OPV-1, Rotavirus-1'),(70,'OPV-2, Rotavirus-2'),
             (84,'OPV-3, Rotavirus-3, DTaP-1'),(180,'Measles/MR-1, JE-1'),(270,'Measles/MR-2, booster'),(365,'Boosters')]
    return [{'id': f'imm_{i}', 'type': 'vaccination', 'title': t, 'due': (b + timedelta(days=d)).isoformat()}
            for i, (d, t) in enumerate(items)]

def chat_reply(text, stage, tasks, lang):
    s = (text or '').lower()
    a = triage(text, stage)
    if a:
        if a.get('all') and len(a['all']) > 1:
            # Multiple red flags — surface all of them (CL-08)
            parts = []
            for d in a['all']:
                r = d['reason'].get(lang, d['reason']['en'])
                ac = d['action'].get(lang, d['action']['en'])
                parts.append(f"⚠️ {r} {ac} Steps: " + ' • '.join(d['steps']))
            label = '🚨 EMERGENCY — ' if a['urgency'] == 'emergency' else '⚠️ URGENT — '
            return {'kind': 'danger', 'text': label + ' | '.join(parts)}
        label = '🚨 EMERGENCY — ' if a['urgency'] == 'emergency' else '⚠️ URGENT — '
        r = a['reason'].get(lang, a['reason']['en']); ac = a['action'].get(lang, a['action']['en'])
        return {'kind': 'danger', 'text': f"{label}{r} {ac} Steps: " + ' • '.join(a['steps'])}

    tw = ['saffron','papaya','ghee','honey','cord','bind','kadha','tradition','parampara','जाफরান','পেঁপে']
    if any(w in s for w in tw):
        return {'kind':'tradition','text':'See the Traditions tab for belief, evidence, verdict and safer alternatives.'}

    dw = ['due','next','appointment','visit','test','vaccine','calendar','reminder','টিকা','ভ্যাকসিন']
    if any(w in s for w in dw):
        open_t = sorted([t for t in tasks if not t.get('done')], key=lambda x: x['due'])[:3]
        if open_t:
            return {'kind':'schedule','text':'Coming up: ' + '; '.join(f"{t['title']} ({t['due']})" for t in open_t)}
        # CL-04: no tasks — suggest general ANC schedule
        return {'kind':'schedule','text':'No open reminders. You can add tasks in Calendar, or ask about your next antenatal visit.'}

    ew = ['eat','food','diet','exercise','breastfeed','sleep','week','baby','normal']
    if any(w in s for w in ew):
        items = education_for(stage)
        if items:
            # CL-05: return up to 2 education items instead of just 1
            parts = []
            for it in items[:2]:
                parts.append(f"{it['title'].get(lang, it['title']['en'])} — {it['body'].get(lang, it['body']['en'])}")
            return {'kind':'education','text': ' '.join(parts)}

    return {'kind':'fallback','text':"I don't have a verified answer for that. Ask your doctor or nurse. This is educational information, not medical advice. If urgent, use the Safety page now."}
