/* Maternacare AI — browser engine. Ported clinical rules + i18n.
   SAFETY: danger signs triaged first; never reassures a serious symptom. */

const STRINGS = {
  en: {
    app_name:'Maternacare AI', tagline:'Companion from pregnancy to baby’s first years',
    disclaimer:'Health education & navigation tool, not a doctor. No diagnosis, no emergency replacement. If it may be an emergency, seek medical care now.',
    nav_home:'Home',nav_learn:'Learn',nav_traditional:'Traditions',nav_safety:'Safety',nav_calendar:'Calendar',nav_chat:'Ask',
    setup_title:'Set up your journey',setup_subtitle:'A few questions so guidance fits you. Your data stays on this device.',
    consent:'I consent to storing my health info locally on this device.',consent_required:'Please give consent to continue.',
    stage:'I am…',stage_pregnant:'Pregnant',stage_postpartum:'Postpartum (after birth)',stage_baby:'Baby / infant care',stage_planning:'Planning a pregnancy',
    lmp:'First day of last period (LMP)',edd:'Expected delivery date (if known)',weeks:'Current week (if known)',edd_info:'With LMP we calculate your date (EDD = LMP + 280 days).',
    first_pregnancy:'First pregnancy?',high_risk:'Has a doctor said this is high-risk?',risk_note:'High-risk pregnancies need a personal plan from your doctor. This tool only gives general education.',
    conditions:'Existing conditions',medicines:'Current medicines',allergies:'Known allergies',doctor:'Doctor / hospital',emergency_contact:'Emergency contact',language:'Language',save_start:'Save & Start',
    week:'Week',trimester:'Trimester',edd_label:'Estimated delivery date',next_visit:'Next suggested visit',not_set:'Not set',all_done:'All caught up — great work.',
    education:'For your stage',update:'Update profile',quick_check:'Quick safety check',quick_check_desc:'Tell us a symptom — we’ll say how urgent it may be and what to do.',
    symptom:'What are you feeling?',check_now:'Check now',emergency_banner:'Severe bleeding, trouble breathing, convulsions, chest pain, or thoughts of harming yourself or your baby: go to an emergency department NOW. Do not wait.',
    trad_title:'Tradition vs Evidence',trad_desc:'We respect cultural practices. Here is what evidence says — respectfully, safety first.',trad_search:'Search a practice (saffron, papaya, honey…)',trad_all:'All practices',
    belief:'The belief',why:'Why people follow it',evidence:'What evidence says',benefit:'Proven benefit?',risk:'Potential risk',verdict:'Verdict',alternative:'Evidence-based alternative',when_doctor:'When to see a doctor',
    calendar_title:'Your care calendar',calendar_desc:'Suggested visits & immunizations. Always follow your own doctor — this is a guide, not a prescription.',
    mark_done:'Mark done',done:'Done',overdue:'Overdue',upcoming:'Upcoming',remove:'Remove',add_task:'Add a reminder',task_name:'Reminder name',due_date:'Due date',add:'Add',
    chat_title:'Ask Maternacare',chat_desc:'Ask about symptoms, food, traditions or what’s due. For emergencies, get medical care immediately.',
    chat_placeholder:'Type your question…',send:'Send',you:'You',assistant:'Maternacare',no_answer:'I don’t have a verified answer. Ask your doctor or nurse. If urgent, use the Safety page now.',
    saved:'Saved on this device',profile:'Profile',clear:'Clear data',yes:'Yes',no:'No',unknown:'Not sure',sources:'Based on WHO, UNICEF, MoHFW/NHM & Indian immunization schedule.',
    stage_pregnancy:'Pregnancy',stage_postpartum_s:'Postpartum',stage_baby_s:'Baby',trimester_1:'First trimester',trimester_2:'Second trimester',trimester_3:'Third trimester',
    education_only:'Educational information only — not medical advice. Always consult a qualified clinician.',footer_note:'Maternacare AI is a prototype. Not clinically validated or approved. Do not rely on it for diagnosis or emergencies.',
    open_emergency:'Emergency help',call102:'In India: call 102 for ambulance (108 in some states). Go to the nearest emergency department.',
    custom_task:'Custom reminder',anc_visit:'Antenatal visit',investigation:'Investigation',vaccination:'Vaccination',postpartum_visit:'Postpartum visit',ultrasound:'Ultrasound',
    education_none:'Education for this stage is being prepared.',report_issue:'Report a safety concern',report_desc:'Tell us if guidance seems unsafe or wrong. (Prototype: saved locally.)',send_feedback:'Send feedback',feedback_saved:'Feedback saved. Thank you.',
    install:'Install app',install_hint:'Add to Home screen for a full-screen, offline app',offline:'Available offline',baby_age:'Baby’s age',months:'months',immunizations:'Immunizations',milestone:'Watch for',
    sub_title:'Unlock full access',sub_desc:'Maternacare AI is a subscription app. Subscribe to use all features on this device.',
    subscribe:'Subscribe',subscribed:'Subscribed',plan:'Plan',expires:'Expires',days_left:'days left',device_id:'Device ID',
    choose_plan:'Choose a plan',pay_now:'Pay now',payment_demo:'Demo mode — no real payment',payment_note:'Payments are verified on this device only. Client-side subscription can be reset by clearing browser data.',
    manage_sub:'Subscription',renew:'Renew',restore:'Restore purchase',not_subscribed:'Not subscribed',subscribe_first:'Please subscribe to use this feature.',
    payment_success:'Payment successful — full access unlocked!',payment_failed:'Payment could not be completed.',active_until:'Active until',free_limited:'Limited preview',
    sign_in:'Sign in',sign_up:'Sign up',sign_out:'Sign out',email:'Email',password:'Password',phone:'Phone number',
    have_account:'Already have an account?',no_account:'New here?',send_code:'Send code',verify:'Verify',
    otp_code:'6-digit code',auth_demo:'Demo mode — accounts are stored only in this browser',auth_failed:'Could not sign in. Check your details.',
    otp_phone_hint:'Enter your mobile number — we’ll send a 6-digit code.',otp_code_hint:'Enter the 6-digit code sent to your phone.',otp_resend:"Didn't receive it?",otp_resend_link:'Resend code',back:'Back',verify_otp:'Verify OTP',send_otp:'Send OTP',
    welcome:'Welcome',email_required:'Enter a valid email and a password of 6+ characters.',phone_required:'Enter phone with country code, e.g. +919876543210',
    nav_baby:'Baby',baby_title:'My Baby',add_baby:'+ Add baby',baby_name:"Baby's name",dob:'Date of birth',sex:'Sex',male:'Male',female:'Female',birth_weight:'Birth weight (g)',
    growth:'Growth monitoring',growth_desc:'Record weight, length and head circumference. Track over time.',weight_g:'Weight (g)',length_cm:'Length (cm)',head_circ_cm:'Head circ. (cm)',
    feeding:'Feeding log',feeding_desc:'Log a feeding session. Supports breastfeeding and more.',feed_breast:'Breast',feed_bottle:'Bottle',feed_mixed:'Mixed',feed_solids:'Solids',notes:'Notes',
    imm_desc:'MoHFW-aligned schedule based on date of birth. Mark doses as given.',mark_given:'Mark given',given_on:'Given on',no_babies:'No babies yet. Add one to start tracking.',select_baby:'Select a baby first.',
    nav_baby:'Baby',baby_title:'Mera Baby',add_baby:'+ Baby add karein',baby_name:"Baby ka naam",dob:'Janam ki tareekh',sex:'Ling',male:'Ladka',female:'Ladki',birth_weight:'Janam ka weight (g)',
    growth:'Growth tracking',growth_desc:'Weight, length aur head circumference record karein. Samay ke saath track karein.',weight_g:'Weight (g)',length_cm:'Length (cm)',head_circ_cm:'Head circ. (cm)',
    feeding:'Feeding log',feeding_desc:'Feeding session record karein. Breastfeeding aur zyada support karta hai.',feed_breast:'Breast',feed_bottle:'Bottle',feed_mixed:'Mixed',feed_solids:'Solids',notes:'Note',
    imm_desc:'Janam tareekh par aadharit MoHFW schedule. Doses ko given mark karein.',mark_given:'Given mark karein',given_on:'Diya gaya',no_babies:'Abhi koi baby nahi. Track karne ke liye ek add karein.',select_baby:'Pehle ek baby chunein.',
    daily_tracker:'Daily Tracker',daily_tracker_desc:"Log your Mood, Sleep, Water, Steps And See How You're Progressing",my_pregnancy:'My Pregnancy',day:'Day',
    baby_hero_title:'Every Movement as Your Little Miracle',height:'Height',symptoms:'Symptoms',mood:'Mood',activity:'Activity',recent_symptoms:'Recent Symptoms',logged:'logged',symptom:'Symptom',mild:'Mild',moderate:'Moderate',strong:'Strong',prenatal_vitamins:'Prenatal Vitamins',kick_count:'Kick Count Session',
    daily_tracker:'Daily Tracker',daily_tracker_desc:'Apna Mood, Neend, Pani, Steps log karein aur progress dekhein',my_pregnancy:'Meri Pregnancy',day:'Din',
    baby_hero_title:'Har Harkat Aapke Chhote Chamatkar Ki Tarah',height:'Lambai',symptoms:'Lakshan',mood:'Mood',activity:'Activity',recent_symptoms:'Haal ke Lakshan',logged:'darz',symptom:'Lakshan',mild:'Halka',moderate:'Madhya',strong:'Tez',prenatal_vitamins:'Prenatal Vitamins',kick_count:'Kick Count Session',
    sign_in_password:'Sign in with password',sign_in_otp:'Continue with OTP',password_min8:'Password must be at least 8 characters.',account_exists:'An account with this email or phone already exists. Please sign in.',wrong_credentials:'Wrong email/phone or password.',
    sign_in_password:'Password se sign in',sign_in_otp:'OTP se aage badhein',password_min8:'Password kam se kam 8 akshar ka hona chahiye.',account_exists:'Is email ya phone se account pehle se hai. Sign in karein.',wrong_credentials:'Email/phone ya password galat hai.',
    tap_to_signup:'Tap here to create your account instead →',
    tap_to_signup:'इसके बजाय account banane ke liye yahan tap karein →',
    new_here:'New here?',
    new_here:'Naye hain?',
    account:'Account',demo_note:'Configure Firebase in fbcfg.js for real accounts.',
  },
  hi: {
    app_name:'Maternacare AI',tagline:'Pregnancy se baby ke pehle saalon tak saath',
    disclaimer:'Ye health education tool hai, doctor nahi. Diagnosis nahi aur emergency care ki jagah nahi. Emergency ho to turant medical madad lein.',
    nav_home:'Home',nav_learn:'Seekhein',nav_traditional:'Parampara',nav_safety:'Suraksha',nav_calendar:'Calendar',nav_chat:'Poochhein',
    setup_title:'Aapki journey shuru karein',setup_subtitle:'Kuch sawal taaki guidance aapke hisaab se mile. Data isi device par rehta hai.',
    consent:'Main apni health jaankari is device par store karne ki ijazat deta/ deti hoon.',consent_required:'Aage badhne ke liye ijazat dein.',
    stage:'Main…',stage_pregnant:'Pregnant hoon',stage_postpartum:'Postpartum (janam ke baad)',stage_baby:'Baby / infant care',stage_planning:'Pregnancy planning',
    lmp:'Pichhle period ki pehli tareekh (LMP)',edd:'Expected delivery date (agar pata ho)',weeks:'Current week (agar pata ho)',edd_info:'LMP se hum date nikal dete hain (EDD = LMP + 280 din).',
    first_pregnancy:'Pehli pregnancy hai?',high_risk:'Doctor ne kaha high-risk hai?',risk_note:'High-risk ke liye doctor ki apni plan chahiye. Ye tool sirf general jaankari deta hai.',
    conditions:'Mojooda bimari',medicines:'Dawayein',allergies:'Allergy',doctor:'Doctor / hospital',emergency_contact:'Emergency contact',language:'Bhasha',save_start:'Save karke shuru karein',
    week:'Week',trimester:'Trimester',edd_label:'Anumanit delivery date',next_visit:'Agli visit',not_set:'Nahi bataya',all_done:'Sab ho gaya — badhiya!',
    education:'Is stage ke liye',update:'Profile edit',quick_check:'Jaldi safety check',quick_check_desc:'Koi symptom batayein — batayenge kitna urgent hai aur kya karna hai.',
    symptom:'Aap kaisa mehsoos kar rahi hain?',check_now:'Abhi check',emergency_banner:'Tez bleeding, saans lene mein dikkat, jhatke, seene mein dard, ya khud/baby ko nuksan ke vichaar — abhi emergency department jayein. Intelzaar na karein.',
    trad_title:'Parampara aur Vijnan',trad_desc:'Hum parampar ka samman karte hain. Yahan evidence kya kehta hai — izzat ke saath, suraksha pehle.',trad_search:'Practice khojein (saffron, papaya, honey…)',trad_all:'Sab practices',
    belief:'Paramparic vichaar',why:'Log kyun karte hain',evidence:'Evidence kya kehta hai',benefit:'Sabit fayda?',risk:'Sambhavit nuksan',verdict:'Nirnay',alternative:'Sahi vikalp',when_doctor:'Doctor se kab milein',
    calendar_title:'Aapka care calendar',calendar_desc:'Suggested visits aur immunizations. Apne doctor ki plan hamesha manein — ye guide hai.',
    mark_done:'Done',done:'Ho gaya',overdue:'Late',upcoming:'Aage',remove:'Hataayein',add_task:'Reminder add karein',task_name:'Reminder ka naam',due_date:'Due date',add:'Add karein',
    chat_title:'Maternacare se poochhein',chat_desc:'Symptom, khana, parampar ya kya due hai — poochhein. Emergency mein turant madad lein.',
    chat_placeholder:'Sawal likhein…',send:'Bhejein',you:'Aap',assistant:'Maternacare',no_answer:'Verified jawab nahi hai. Doctor se poochhein. Urgent ho to Safety page abhi istemal karein.',
    saved:'Device par save',profile:'Profile',clear:'Data mitayein',yes:'Haan',no:'Nahi',unknown:'Pata nahi',sources:'WHO, UNICEF, MoHFW/NHM aur Indian schedule par aadharit.',
    stage_pregnancy:'Pregnancy',stage_postpartum_s:'Postpartum',stage_baby_s:'Baby',trimester_1:'Pehla trimester',trimester_2:'Dusra trimester',trimester_3:'Teesra trimester',
    education_only:'Sirf shiksha jaankari — medical advice nahi. Hamesha yogy clinician se poochhein.',footer_note:'Maternacare AI prototype hai. Clinical validation nahi. Diagnosis ya emergency ke liye bharosa na karein.',
    open_emergency:'Emergency madad',call102:'Bharat mein 102 (kuch states mein 108) call karein. Najdiki emergency department jayein.',
    custom_task:'Apna reminder',anc_visit:'Antenatal visit',investigation:'Test',vaccination:'Vaccination',postpartum_visit:'Postpartum visit',ultrasound:'Ultrasound',
    education_none:'Is stage ki jaankari taiyar ho rahi hai.',report_issue:'Suraksha concern report',report_desc:'Guidance unsafe lage to batayein. (Feedback locally save.)',send_feedback:'Feedback bhejein',feedback_saved:'Feedback save ho gaya. Dhanyavaad.',
    install:'App install karein',install_hint:'Home screen par add karein — full-screen, offline',offline:'Offline available',baby_age:'Baby ki umar',months:'mahine',immunizations:'Immunization',milestone:'Dhyan dein',
    sub_title:'Full access unlock karein',sub_desc:'Maternacare AI subscription app hai. Is device par sab features ke liye subscribe karein.',
    subscribe:'Subscribe karein',subscribed:'Subscribed',plan:'Plan',expires:'Expiry',days_left:'din bache',device_id:'Device ID',
    choose_plan:'Plan chunein',pay_now:'Abhi pay karein',payment_demo:'Demo mode — asli payment nahi',payment_note:'Payment is device par hi verify hota hai. Browser data mitaane se subscription reset ho sakta hai.',
    manage_sub:'Subscription',renew:'Renew',restore:'Purchase restore karein',not_subscribed:'Subscribe nahi kiya',subscribe_first:'Is feature ke liye pehle subscribe karein.',
    payment_success:'Payment safal — full access unlock!',payment_failed:'Payment pura nahi ho paaya.',active_until:'Is tak active',free_limited:'Limited preview',
    sign_in:'Sign in',sign_up:'Sign up',sign_out:'Sign out',email:'Email',password:'Password',phone:'Phone number',
    have_account:'Account hai?',no_account:'Naye hain?',send_code:'Code bhejein',verify:'Verify',
    otp_code:'6-anka code',auth_demo:'Demo mode — accounts isi browser mein stored hain',auth_failed:'Sign in nahi ho paaya. Details check karein.',
    otp_phone_hint:'Apna mobile number daalein — hum 6-anka code bhenge.',otp_code_hint:'Apne phone par aaya 6-anka code daalein.',otp_resend:'Code nahi mila?',otp_resend_link:'Code dobara bhejein',back:'Wapas',verify_otp:'OTP verify karein',send_otp:'OTP bhejein',
    welcome:'Swagat',email_required:'Valid email aur 6+ akshar ka password daalein.',phone_required:'Country code ke saath number daalein, jaise +919876543210',
    account:'Account',demo_note:'Asli accounts ke liye fbcfg.js mein Firebase set karein.',
  },
  bn: {
    app_name:'Maternacare AI',tagline:'গর্ভধারণ থেকে শিশুর প্রথম বছর — সঙ্গে আপনার',
    disclaimer:'এটি স্বাস্থ্য শিক্ষা টুল, ডাক্তার নয়। রোগ নির্ণয় বা জরুরি চিকিৎসার বিকল্প নয়। জরুরি হলে সঙ্গে সঙ্গে চিকিৎসা নিন।',
    nav_home:'হোম',nav_learn:'শিখুন',nav_traditional:'ঐতিহ্য',nav_safety:'নিরাপত্তা',nav_calendar:'ক্যালেন্ডার',nav_chat:'জিজ্ঞাসা',
    setup_title:'আপনার যাত্রা শুরু করি',setup_subtitle:'কয়েকটি প্রশ্ন — তথ্য এই ডিভাইসেই থাকে।',
    consent:'আমি আমার স্বাস্থ্য তথ্য এই ডিভাইসে সংরক্ষণে সম্মতি দিচ্ছি।',consent_required:'এগিয়ে যেতে সম্মতি দিন।',
    stage:'আমি…',stage_pregnant:'গর্ভবতী',stage_postpartum:'প্রসব-পরবর্তী',stage_baby:'শিশু যত্ন',stage_planning:'পরিকল্পনা',
    lmp:'শেষ মাসিকের প্রথম তারিখ (LMP)',edd:'প্রসবের তারিখ (জানলে)',weeks:'বর্তমান সপ্তাহ (জানলে)',edd_info:'LMP থেকে তারিখ বের করি (EDD = LMP + ২৮০ দিন)।',
    first_pregnancy:'প্রথম গর্ভধারণ?',high_risk:'ডাক্তার কি উচ্চ-ঝুকি বলেছেন?',risk_note:'উচ্চ-ঝুকিতে ডাক্তারের নিজস্ব পরিকল্পনা দরকার। এটি সাধারণ তথ্য দেয়।',
    conditions:'বর্তমান রোগ',medicines:'ওষুধ',allergies:'অ্যালার্জি',doctor:'ডাক্তার / হাসপাতাল',emergency_contact:'জরুরি যোগাযোগ',language:'ভাষা',save_start:'সংরক্ষণ করুন',
    week:'সপ্তাহ',trimester:'ট্রাইমিস্টার',edd_label:'আনুমানিক প্রসব তারিখ',next_visit:'পরবর্তী সাক্ষাৎ',not_set:'বলা হয়নি',all_done:'সব শেষ — শুভেচ্ছা!',
    education:'এই পর্যায়ের জন্য',update:'প্রোফাইল সম্পাদনা',quick_check:'দ্রুত নিরাপত্তা যাচাই',quick_check_desc:'লক্ষণ বলুন — কতটা জরুরি ও কী করণীয় তা জানব।',
    symptom:'কেমন অনুভব করছেন?',check_now:'এখন যাচাই',emergency_banner:'প্রবল রক্তপাত, শ্বাসকষ্ট, খিঁচুনি, বুকে ব্যথা বা নিজের/শিশুর ক্ষতির চিন্তা — এখনই জরুরি বিভাগে যান।',
    trad_title:'ঐতিহ্য বনাম প্রমাণ',trad_desc:'ঐতিহ্যকে শ্রদ্ধা করি। এখানে প্রমাণ কী বলে — শ্রদ্ধার সাথে, নিরাপত্তা প্রথম।',trad_search:'প্রথা খুঁজুন (জাফরান, পেঁপে, মধু…)',trad_all:'সব প্রথা',
    belief:'বিশ্বাস',why:'কেন মানা হয়',evidence:'প্রমাণ কী বলে',benefit:'প্রমাণিত উপকার?',risk:'সম্ভাব্য ক্ষতি',verdict:'সিদ্ধান্ত',alternative:'প্রমাণভিত্তিক বিকল্প',when_doctor:'ডাক্তারের কাছে কখন',
    calendar_title:'যত্ন ক্যালেন্ডার',calendar_desc:'প্রস্তাবিত সাক্ষাৎ ও টিকাদান। ডাক্তারের পরিকল্পনাই প্রধান।',
    mark_done:'সম্পন্ন',done:'সম্পন্ন',overdue:'বিলম্বিত',upcoming:'আগামী',remove:'সরান',add_task:'রিমাইন্ডার যোগ',task_name:'নাম',due_date:'তারিখ',add:'যোগ করুন',
    chat_title:'Maternacare-এ জিজ্ঞাসা',chat_desc:'লক্ষণ, খাবার, ঐতিহ্য বা কী বাকি — জিজ্ঞাসা করুন। জরুরিতে চিকিৎসা নিন।',
    chat_placeholder:'প্রশ্ন লিখুন…',send:'পাঠান',you:'আপনি',assistant:'Maternacare',no_answer:'সঠিক উত্তর নেই। ডাক্তারের সাথে কথা বলুন। জরুরি হলে নিরাপত্তা পৃষ্ঠা ব্যবহার করুন।',
    saved:'ডিভাইসে সংরক্ষিত',profile:'প্রোফাইল',clear:'তথ্য মুছুন',yes:'হ্যাঁ',no:'না',unknown:'জানি না',sources:'WHO, UNICEF, MoHFW/NHM ও ভারতীয় টিকাদান তালিকা ভিত্তিক।',
    stage_pregnancy:'গর্ভকাল',stage_postpartum_s:'প্রসব-পরবর্তী',stage_baby_s:'শিশু',trimester_1:'প্রথম ট্রাইমিস্টার',trimester_2:'দ্বিতীয় ট্রাইমিস্টার',trimester_3:'তৃতীয় ট্রাইমিস্টার',
    education_only:'শুধু শিক্ষামূলক তথ্য — চিকিৎসা পরামর্শ নয়। সবসময় যোগ্য ক্লিনিশিয়ানের সাথে কথা বলুন।',footer_note:'Maternacare AI প্রোটোটাইপ। ক্লিনিক্যাল বৈধতা নেই। রোগ নির্ণয় বা জরুরির জন্য নির্ভর করবেন না।',
    open_emergency:'জরুরি সহায়তা',call102:'ভারতে 102 (কিছু রাজ্যে 108) কল করুন। নিকটতম জরুরি বিভাগে যান।',
    custom_task:'নিজের রিমাইন্ডার',anc_visit:'প্রসব-পূর্ব সাক্ষাৎ',investigation:'পরীক্ষা',vaccination:'টিকাদান',postpartum_visit:'প্রসব-পরবর্তী সাক্ষাৎ',ultrasound:'আল্ট্রাসাউন্ড',
    education_none:'এই পর্যায়ের তথ্য প্রস্তুত হচ্ছে।',report_issue:'নিরাপত্তা সমস্যা জানান',report_desc:'অনিরাপদ মনে হলে জানান (স্থানীয়ভাবে সংরক্ষিত)।',send_feedback:'মতামত দিন',feedback_saved:'সংরক্ষিত। ধন্যবাদ।',
    install:'অ্যাপ ইনস্টল',install_hint:'হোম স্ক্রিনে যোগ করুন — ফুলস্ক্রিন, অফলাইন',offline:'অফলাইনে চলে',baby_age:'শিশুর বয়স',months:'মাস',immunizations:'টিকাদান',milestone:'নজর রাখুন',
    sub_title:'সম্পূর্ণ অ্যাক্সেস আনলক',sub_desc:'Maternacare AI একটি সাবস্ক্রিপশন অ্যাপ। এই ডিভাইসে সব ফিচারের জন্য সাবস্ক্রাইব করুন।',
    subscribe:'সাবস্ক্রাইব',subscribed:'সাবস্ক্রাইব করা',plan:'প্ল্যান',expires:'মেয়াদ',days_left:'দিন বাকি',device_id:'ডিভাইস আইডি',
    choose_plan:'প্ল্যান বেছে নিন',pay_now:'এখন পেমেন্ট',payment_demo:'ডেমো মোড — কোনো বাস্তব পেমেন্ট নেই',payment_note:'পেমেন্ট শুধু এই ডিভাইসে যাচাই হয়। ব্রাউজার ডেটা মুছলে সাবস্ক্রিপশন রিসেট হতে পারে।',
    manage_sub:'সাবস্ক্রিপশন',renew:'নবায়ন',restore:'ক্রয় পুনরুদ্ধার',not_subscribed:'সাবস্ক্রাইব করা নেই',subscribe_first:'এই ফিচারের জন্য আগে সাবস্ক্রাইব করুন।',
    payment_success:'পেমেন্ট সফল — সম্পূর্ণ অ্যাক্সেস!',payment_failed:'পেমেন্ট সম্পন্ন হয়নি।',active_until:'এই তারিখ পর্যন্ত',free_limited:'সীমিত প্রিভিউ',
    sign_in:'সাইন ইন',sign_up:'সাইন আপ',sign_out:'সাইন আউট',email:'ইমেইল',password:'পাসওয়ার্ড',phone:'ফোন নম্বর',
    have_account:'অ্যাকাউন্ট আছে?',no_account:'নতুন?',send_code:'কোড পাঠান',verify:'যাচাই',
    otp_code:'৬-ডিজিট কোড',auth_demo:'ডেমো মোড — অ্যাকাউন্ট শুধু এই ব্রাউজারে থাকে',auth_failed:'সাইন ইন হয়নি। তথ্য যাচাই করুন।',
    otp_phone_hint:'আপনার মোবাইল নম্বর দিন — আমরা ৬-ডিজিট কোড পাঠাব।',otp_code_hint:'আপনার ফোনে পাঠানো ৬-ডিজিট কোড দিন।',otp_resend:'কোড পাননি?',otp_resend_link:'কোড আবার পাঠান',back:'ফিরে যান',verify_otp:'OTP যাচাই করুন',send_otp:'OTP পাঠান',
    welcome:'স্বাগতম',email_required:'বৈধ ইমেইল ও ৬+ অক্ষরের পাসওয়ার্ড দিন।',phone_required:'কান্ট্রি কোডসহ নম্বর দিন, যেমন +৯১৯৮৭৬৫৪৩২১০',
    nav_baby:'শিশু',baby_title:'আমার শিশু',add_baby:'+ শিশু যোগ',baby_name:'শিশুর নাম',dob:'জন্ম তারিখ',sex:'লিঙ্গ',male:'ছেলে',female:'মেয়ে',birth_weight:'জন্ম ওজন (গ্রাম)',
    growth:'বৃদ্ধি পর্যবেক্ষণ',growth_desc:'ওজন, দৈর্ঘ্য ও মাথার পরিধি রেকর্ড করুন। সময়ের সাথে ট্র্যাক করুন।',weight_g:'ওজন (গ্রাম)',length_cm:'দৈর্ঘ্য (সেমি)',head_circ_cm:'মাথার পরিধি (সেমি)',
    feeding:'খাওয়ানোর রেকর্ড',feeding_desc:'খাওয়ানোর সময় রেকর্ড করুন। বুকের দুধ ও অন্য সাহায্য করে।',feed_breast:'বুকের দুধ',feed_bottle:'বোতল',feed_mixed:'মিশ্র',feed_solids:'কঠিন খাবার',notes:'নোট',
    imm_desc:'জন্ম তারিখ ভিত্তিক MoHFW তালিকা। ডোজ গৃহীত হিসেবে চিহ্নিত করুন।',mark_given:'গৃহীত চিহ্নিত',given_on:'দেওয়া হয়েছে',no_babies:'এখনো কোনো শিশু নেই। ট্র্যাক শুরু করতে একজন যোগ করুন।',select_baby:'প্রথমে একটি শিশু বেছে নিন।',
    daily_tracker:'ডেইলি ট্র্যাকার',daily_tracker_desc:'মood, ঘুম, পানি, পদক্ষেপ রেকর্ড করে অগ্রগতি দেখুন',my_pregnancy:'আমার গর্ভ',day:'দিন',
    baby_hero_title:'প্রতিটি নড়াচড়া আপনার ছোট্ট অলৌকিকতা',height:'উচ্চতা',symptoms:'লক্ষণ',mood:'মood',activity:'কার্যকলাপ',recent_symptoms:'সাম্প্রতিক লক্ষণ',logged:'রেকর্ড',symptom:'লক্ষণ',mild:'হালকা',moderate:'মাঝারি',strong:'শক্ত',prenatal_vitamins:'প্রসব-পূর্ব ভিটামিন',kick_count:'কিক কাউন্ট সেশন',
    sign_in_password:'পাসওয়ার্ড দিয়ে সাইন ইন',sign_in_otp:'OTP দিয়ে এগিয়ে যান',password_min8:'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।',account_exists:'এই ইমেইল বা ফোনে অ্যাকাউন্ট আছে। সাইন ইন করুন।',wrong_credentials:'ইমেইল/ফোন বা পাসওয়ার্ড ভুল।',
    tap_to_signup:'এর পরিবর্তে অ্যাকাউন্ট তৈরি করতে এখানে ট্যাপ করুন →',
    new_here:'নতুন?',
    account:'অ্যাকাউন্ট',demo_note:'বাস্তব অ্যাকাউন্টের জন্য fbcfg.js-এ Firebase সেট করুন।',
  },
};

const EDU = {
  planning:[
    {title:{en:'Start folic acid early',hi:'Folic acid pehle shuru karein',bn:'ফলিক অ্যাসিড আগে শুরু করুন'},body:{en:'Your doctor may recommend folic acid before pregnancy. Ask for the right dose — do not self-dose.',hi:'Doctor pregnancy se pehle folic acid suggest kar sakte hain. Sahi dose unse poochhein — khud se na lein.',bn:'ডাক্তার গর্ভের আগে ফলিক অ্যাসিড সুপারিশ করতে পারেন। সঠিক ডোজ তাদের জিজ্ঞাসা করুন।'},source:'WHO / MoHFW preconception'},
    {title:{en:'Review medicines & conditions',hi:'Dawayein aur bimariyon ki samiksha',bn:'ওষুধ ও রোগের পর্যালোচনা'},body:{en:'Diabetes, hypertension, thyroid or regular medicines? Talk to a doctor before pregnancy.',hi:'Diabetes, BP, thyroid ya roz ki dawayein? Pregnancy se pehle doctor se baat karein.',bn:'ডায়াবেটিস, উচ্চ রক্তচাপ বা নিয়মিত ওষুধ? গর্ভের আগে ডাক্তারের সাথে কথা বলুন।'},source:'WHO preconception care'},
  ],
  t1:[
    {title:{en:'Your first antenatal visit',hi:'Pehli antenatal visit',bn:'প্রথম প্রসব-পূর্ব সাক্ষাৎ'},body:{en:'Book your first antenatal appointment. Expect blood/urine tests and an early ultrasound.',hi:'Pehli antenatal appointment book karein. Blood, urine tests aur early ultrasound hote hain.',bn:'প্রথম সাক্ষাৎ নির্ধারণ করুন। রক্ত, প্রস্রাব পরীক্ষা ও early ultrasound হয়।'},source:'WHO ANC / NHM'},
    {title:{en:'Nausea is common',hi:'Matli aam baat hai',bn:'বমি ভাব সাধারণ'},body:{en:'Small frequent meals and fluids may help. If you cannot keep fluids down, contact your doctor.',hi:'Chhote baar baar khane aur pani madad karte hain. Pani na tik paaye to doctor se sampark karein.',bn:'ছোট ঘন ঘন খাবার ও তরল সাহায্য করে। পানি ধরে না রাখলে ডাক্তারের সাথে কথা বলুন।'},source:'WHO / FIGO'},
  ],
  t2:[
    {title:{en:'Screening tests come due',hi:'Screening tests ka samay',bn:'স্ক্রিনিং পরীক্ষার সময়'},body:{en:'Ask about anaemia, blood pressure, gestational diabetes screening and anomaly ultrasound.',hi:'Anaemia, BP, gestational diabetes aur anomaly ultrasound ke baare mein poochhein.',bn:'অ্যানিমিয়া, রক্তচাপ, গেস্টেশনাল ডায়াবেটিস ও আল্ট্রাসাউন্ড সম্পর্কে জিজ্ঞাসা করুন।'},source:'WHO ANC / FOGSI'},
    {title:{en:'Notice fetal movements',hi:'Baby ki hulchul par dhyan',bn:'শিশুর নড়াচড়া লক্ষ্য করুন'},body:{en:'Many feel movements at 18–25 weeks. Know your baby’s normal pattern; if it reduces later, contact your unit same day.',hi:'Anni 18–25 weeks mein hulchul mehsoos karti hain. Normal pattern pehchanein; baad mein kam ho to aaj hi sampark karein.',bn:'অনেকে ১৮–২৫ সপ্তাহে নড়াচড়া অনুভব করেন। স্বাভাবিক রীতি জানুন; পরে কমলে আজই যোগাযোগ করুন।'},source:'WHO / FIGO'},
  ],
  t3:[
    {title:{en:'Plan your birth',hi:'Janam ki yojana',bn:'প্রসবের পরিকল্পনা'},body:{en:'Decide hospital, transport, support person and what to do if labour starts. Pack documents early.',hi:'Hospital, transport, saath wale vyakti aur labour par kya karna hai — pehle tay karein. Documents pehle pack karein.',bn:'হাসপাতাল, পরিবহন, সঙ্গে কে থাকবেন ও প্রসব শুরু হলে কী করবেন — আগে ঠিক করুন।'},source:'WHO birth preparedness'},
    {title:{en:'When to go to hospital',hi:'Hospital kab jayein',bn:'কখন হাসপাতালে যাবেন'},body:{en:'Go if waters break, strong regular contractions, bleeding, reduced movements or severe headache/vision changes.',hi:'Pani phate, tez contractions, bleeding, hulchul kam ya tez sir dard/dhundhla ho — hospital jayein.',bn:'জল ভাঙলে, শক্ত সংকোচন, রক্তপাত, নড়াচড়া কম বা মাথাব্যথা/ঝাপসা দৃষ্টি হলে হাসপাতালে যান।'},source:'WHO / MoHFW'},
  ],
  postpartum:[
    {title:{en:'Rest & recovery',hi:'Aaram aur recovery',bn:'বিশ্রাম ও পুনরুদ্ধার'},body:{en:'Your body needs time. Accept help, sleep when baby sleeps, eat and drink regularly. Ask about C-section recovery.',hi:'Sharir ko samay chahiye. Madad lein, baby soye to aap soyein, khana-pani regular. C-section ke baare mein poochhein.',bn:'শরীরের সময় লাগে। সাহায্য নিন, শিশু ঘুমালে ঘুমান, নিয়মিত খান। সিজার সম্পর্কে জিজ্ঞাসা করুন।'},source:'WHO postnatal care'},
    {title:{en:'Breastfeeding support is normal',hi:'Breastfeeding mein madad normal hai',bn:'বুকের দুধে সাহায্য স্বাভাবিক'},body:{en:'Early skin-to-skin helps. Sore nipples or engorgement are common — a lactation counsellor can help. Fever + breast redness needs care.',hi:'Jaldi skin-to-skin madad karta hai. Nipple dard aam hai — counsellor madad kar sakta hai. Bukhar + lalima ho to care lein.',bn:'early স্কিন-টু-স্কিন সাহায্য করে। ব্যথা সাধারণ — পরামর্শদাতা সাহায্য করেন। জ্বর + লালচে ভাব হলে যত্ন নিন।'},source:'WHO infant feeding'},
    {title:{en:'Emotional health matters',hi:'Maanasik sehat zaroori',bn:'মানসিক স্বাস্থ্য গুরুত্বপূর্ণ'},body:{en:'Tearful or anxious weeks are common. But persistent sadness or thoughts of harming yourself/baby need help now — treatable.',hi:'Bhavuk ya chinta aam hai. Lekin gambhir vichaar ya lagataar dukh ho to abhi madad lein — ilaaj hai.',bn:'কাঁদা সাধারণ। কিন্তু ক্রমাগত দুঃখ বা ক্ষতির চিন্তা হলে এখনই সাহায্য নিন — এর চিকিৎসা আছে।'},source:'WHO maternal mental health'},
  ],
  newborn:[
    {title:{en:'Keep baby warm',hi:'Baby ko garam rakhein',bn:'শিশুকে উষ্ণ রাখুন'},body:{en:'Newborns can’t regulate temperature. Use skin-to-skin, a warm room and clothing — avoid overheating.',hi:'Naye baby tapta control nahi karte. Skin-to-skin, garam kamra, kapde — zyada garam na karein.',bn:'নবজাতক তাপ নিয়ন্ত্রণ করতে পারে না। স্কিন-টু-স্কিন, উষ্ণ ঘর, পোশাক — অতি উত্তাপ এড়ান।'},source:'WHO newborn care'},
    {title:{en:'Cord care: clean & dry',hi:'Nabhi: saaf aur sukha',bn:'নাভি: পরিষ্কার ও শুকনো'},body:{en:'Keep cord clean and dry. Do not apply oil, powder or herbs. Seek care for redness, pus or smell with fever.',hi:'Nabhi saaf aur sukha rakhein. Tel, powder ya jadi na lagayein. Lalima, pus ya gand + bukhar ho to care lein.',bn:'নাভি পরিষ্কার ও শুকনো রাখুন। তেল, গুঁড়ো বা ভেষজ দেবেন না। লালচে ভাব বা পুঁজ হলে যত্ন নিন।'},source:'WHO newborn care'},
    {title:{en:'Safe sleep',hi:'Surakshit neend',bn:'নিরাপদ ঘুম'},body:{en:'Place baby on their back on a firm flat surface. Keep pillows, loose blankets and toys away from the face.',hi:'Baby ko peeth ke bal pakki satah par litayein. Takhiya, dhile kambal, khilaune chehre se door.',bn:'শিশুকে পিঠের দিকে শক্ত সমতলে শুইয়ে দিন। বালিশ, আলগা কম্বল, খেলনা মুখ থেকে দূরে।'},source:'UNICEF / WHO'},
  ],
  child:[
    {title:{en:'Complementary feeding ~6 months',hi:'6 mahine ke aas-paas khana',bn:'প্রায় ৬ মাসে পরিপূরক খাবার'},body:{en:'Around 6 months start nutritious foods with continued breastfeeding. Vary foods; avoid added salt/sugar.',hi:'6 mahine par breastfeeding ke saath poshtik khana shuru karein. Vibhinnata rakhein; namak-cheeni na daalein.',bn:'৬ মাসে বুকের দুধের সাথে পুষ্টিকর খাবার শুরু করুন। বৈচিত্র্য রাখুন; লবণ-চিনি এড়ান।'},source:'WHO infant feeding'},
    {title:{en:'Watch milestones',hi:'Vikas ke sanket',bn:'বিকাশের লক্ষণ'},body:{en:'If baby loses a skill or misses milestones, ask your paediatrician. Early support helps; asking is always okay.',hi:'Baby koi seekhi cheez bhool jaye ya milestones na paye to pediatrician se poochhein. Jaldi madad milti hai.',bn:'শিশু শেখা ক্ষমতা হারালে বা মাইলস্টোন না পেলে শিশু বিশেষজ্ঞের সাথে কথা বলুন।'},source:'WHO / CDC'},
  ],
};

const TRADITIONS = [
  {name:'Saffron for a fairer baby',key:'saffron kesar जाफरान জাফরান',belief:'Eating saffron makes the baby fairer.',why:'Skin colour is valued; saffron is prized.',evidence:'Skin colour is genetic. No food changes it. Food amounts are generally safe; high-dose supplements are not recommended.',benefit:'No proven benefit.',risk:'Wasted money; high-dose supplements may be unsafe.',verdict:'insufficient',alternative:'Enjoy saffron as a flavouring; accept colour is genetic.',doctor:'Before any concentrated supplement in pregnancy.',source:'Genetics / food safety'},
  {name:'Milk with ghee',key:'ghee घी ঘি milk doodh দুধ',belief:'Milk with ghee builds strength and a healthy baby.',why:'Traditional nourishing foods.',evidence:'Milk gives protein/calcium; ghee is fat. Safe in a balanced diet, but no special benefit; excess calories can be unhelpful.',benefit:'Nutritious as food, not a treatment.',risk:'Excess saturated fat; problematic in gestational diabetes.',verdict:'safe',alternative:'Milk/yogurt in a balanced diet; limit ghee if advised.',doctor:'If you have gestational diabetes or high cholesterol.',source:'General nutrition evidence'},
  {name:'Avoid papaya & pineapple',key:'papaya पपीता পেঁপে pineapple',belief:'These must be avoided or they cause miscarriage.',why:'Belief that fruits are “hot”.',evidence:'Ripe fruit is safe in a varied diet. Raw papaya latex in large amounts is best limited. No good evidence normal amounts cause miscarriage.',benefit:'Avoidance has no proven benefit.',risk:'Unnecessary restriction; limit large amounts of raw papaya.',verdict:'safe',alternative:'Eat ripe fruit in moderation.',doctor:'After a previous miscarriage or high-risk pregnancy.',source:'Food-safety guidance'},
  {name:'Abdominal binding after birth',key:'bind बांধা বাঁধা pet bandhna abdomen',belief:'Binding the abdomen restores the figure.',why:'Believed to reshape and support the body.',evidence:'No good evidence. Tight binding can restrict breathing, circulation, worsen pain, and hinder healing after caesarean.',benefit:'No proven benefit.',risk:'Breathing restriction, impaired circulation, pain.',verdict:'harmful',alternative:'Gentle movement, pelvic-floor exercises when advised; a supportive (not tight) band only if approved.',doctor:'Before any binder after caesarean or with pain/bleeding.',source:'Postpartum safety reasoning'},
  {name:'Honey / ghutti for newborn',key:'honey शहद মধু ghutti ঘুট্টি',belief:'A drop before breastfeeding cleanses the baby.',why:'Traditional “opening” ritual.',evidence:'Honey can contain botulism spores causing serious, fatal illness in babies under 12 months. No benefit. Only breast milk unless a doctor prescribes.',benefit:'No proven benefit.',risk:'Infant botulism — life-threatening.',verdict:'contraindicated',alternative:'Breastfeed as soon as possible after birth; only doctor-prescribed medicines.',doctor:'Immediately if a baby given honey has poor feeding or weakness.',source:'CDC / WHO — honey & infant botulism'},
  {name:'Substances on the cord',key:'cord nabhi नाभি নাভি oil powder',belief:'Oil, powder or herbal paste applied to dry/protect the cord.',why:'Traditional drying/protection.',evidence:'Cord heals best clean and dry. Applying substances can introduce bacteria, delay healing, cause infection; some linked to neonatal tetanus.',benefit:'No proven benefit.',risk:'Infection, delayed healing, tetanus risk.',verdict:'harmful',alternative:'Clean, dry cord care; sponge bath until it falls off.',doctor:'If redness, pus, smell or fever.',source:'WHO newborn care'},
  {name:'Delaying first bath',key:'bath delay naamпани স্নান nahana',belief:'Newborn should not be bathed for days.',why:'Fear of chilling or jaundice.',evidence:'WHO suggests delaying first bath ~24h (helps temperature and breastfeeding). After that gentle warm bathing is fine.',benefit:'Short delay supported; longer not proven.',risk:'Poor hygiene if avoided entirely.',verdict:'safe',alternative:'Delay ~24h, then warm bath with thorough drying.',doctor:'If baby has low temperature, jaundice or feeding problems.',source:'WHO newborn recommendations'},
  {name:'Oil massage',key:'massage मालिश ম্যাসাজ tel তেল',belief:'Massage strengthens the body and improves sleep/growth.',why:'Bonding and self-care ritual.',evidence:'Promotes relaxation/bonding. Some preterm benefits in small studies; limited evidence in healthy babies. Avoid strong herbal oils on newborn skin.',benefit:'Relaxation supported; growth claims unproven.',risk:'Skin reaction to herbal/essential oils.',verdict:'safe',alternative:'Gentle massage with plain oil if tolerated; stop if skin reacts.',doctor:'If a rash appears or before using herbal oils.',source:'Limited research / skin safety'},
  {name:'Restricting movement',key:'rest आराम বিশ্রাম exercise vyayam',belief:'Pregnant women should rest and avoid activity.',why:'Fear of harm to the baby.',evidence:'Moderate activity is generally safe in uncomplicated pregnancy; complete inactivity can worsen fitness, constipation, glucose. High-risk may need restriction.',benefit:'Moderate activity beneficial; rest not routinely needed.',risk:'Deconditioning with complete inactivity.',verdict:'safe',alternative:'Walking and gentle activity within comfort; stop for bleeding/pain/contractions.',doctor:'If high-risk, bleeding or preterm labour symptoms.',source:'WHO physical activity in pregnancy'},
  {name:'Herbal kadhas / medicines',key:'kadha काढ़া কাড়া herbal jadi जड़ी',belief:'Herbal decoctions prevent illness or ease labour.',why:'Trust in traditional medicine.',evidence:'Many herbal products are untested for safety in pregnancy/breastfeeding; some harmful or interact with medicines; doses unstandardised.',benefit:'Not proven.',risk:'Unknown toxicity, interactions, contamination.',verdict:'unknown',alternative:'Discuss any herbal product with your doctor first.',doctor:'Always before herbal medicine while pregnant/breastfeeding.',source:'Traditional medicine safety'},
];

const VERDICT = {
  supported:['Supported by evidence','प्रमाण से समर्थित','প্রমাণ দ্বারা সমর্থিত'],
  safe:['Generally safe, not proven','सामान्यतः सुरक्षित','সাধারণত নিরাপদ'],
  insufficient:['Insufficient evidence','पर्याप्त प्रमाण नहीं','পর্যাপ্ত প্রমাণ নেই'],
  harmful:['Potentially harmful','संभावित हानिकारक','সম্ভাব্যভাবে ক্ষতিকারক'],
  contraindicated:['Contraindicated','वर्जित','নিষিদ্ধ'],
};

const DANGER = [
  {id:'bleed',m:['bleeding','blood','खून','ख़ून','রক্ত','ব্লিডিং','spotting'],s:'pregnancy',u:'emergency',
   r:{en:'Bleeding in pregnancy can mean miscarriage, ectopic pregnancy or placental problems.',hi:'Pregnancy mein bleeding miscarriage, ectopic ya placenta ki samasya ho sakti hai.',bn:'গর্ভে রক্তপাত গর্ভপাত বা প্লাসেন্টা সমস্যার লক্ষণ।'},
   a:{en:'Go to an emergency department now. Do not wait.',hi:'Abhi emergency department jayein. Wait na karein.',bn:'এখনই জরুরি বিভাগে যান।'},steps:['Sit or lie down','Note amount & timing','Take pregnancy records','Do not self-medicate']},
  {id:'headache',m:['severe headache','blurred vision','dhundhla','धुँधला','ঝাপসা','sir dard','মাথাব্যথা'],s:'pregnancy,postpartum',u:'emergency',
   r:{en:'Severe headache with blurred vision or upper abdominal pain can be pre-eclampsia.',hi:'Tez sir dard + dhundhla dikhna pre-eclampsia ka sanket ho sakta hai.',bn:'তীব্র মাথাব্যথা ও ঝাপসা দৃষ্টি প্রি-ইক্ল্যাম্পসিয়ার লক্ষণ।'},
   a:{en:'Seek emergency assessment now. Do not drive if vision is blurred.',hi:'Abhi emergency jaanch. Dhundhla ho to khud na chalayein.',bn:'এখনই জরুরি পরীক্ষা। দৃষ্টি ঝাপসা হলে নিজে চালাবেন না।'},steps:['Sit down','Check BP if possible','Note symptoms','Go to emergency care']},
  {id:'convulsion',m:['convulsion','seizure','jhatka','झटके','খিঁচুনি'],s:'pregnancy,postpartum,newborn',u:'emergency',
   r:{en:'Convulsions can indicate eclampsia or another serious condition.',hi:'Jhatke eclampsia ya gambhir samasya ka sanket hain.',bn:'খিঁচুনি ইক্ল্যাম্পসিয়া বা গুরুতর সমস্যার লক্ষণ।'},
   a:{en:'Call an ambulance NOW. Nothing in the mouth. Place on side.',hi:'Abhi ambulance call. Muh mein kuch na daalein. Side par litayein.',bn:'এখনই অ্যাম্বুলেন্স কল। মুখে কিছু দেবেন না। পাশে শুইয়ে দিন।'},steps:['Call emergency','Do not restrain','Turn on side','Time the seizure']},
  {id:'breath',m:['breath','breathing','saans','साँस','শ্বাস','chest pain','চেস্ট'],s:'pregnancy,postpartum,newborn',u:'emergency',
   r:{en:'Difficulty breathing or chest pain can be life-threatening.',hi:'Saans lene mein dikkat ya seene mein dard jaanleva ho sakta hai.',bn:'শ্বাসকষ্ট বা বুকে ব্যথা জীবন-হুমকি।'},
   a:{en:'Call emergency services now. Sit upright.',hi:'Abhi emergency call. Seedhe baithein.',bn:'এখনই জরুরি কল। সোজা বসুন।'},steps:['Call emergency','Sit upright','Loosen clothing','Do not leave alone']},
  {id:'movement',m:['reduced movement','less movement','no movement','baby not moving','hulchul','নড়াচড়া','कम हलचल'],s:'pregnancy',u:'urgent',
   r:{en:'Reduced fetal movements can mean the baby is unwell.',hi:'Baby ki hulchul kam hona baby ke bimaar hone ka sanket hai.',bn:'শিশুর নড়াচড়া কমা অসুস্থতার লক্ষণ।'},
   a:{en:'Contact your maternity unit today. Do not wait.',hi:'Aaj hi maternity unit se sampark karein. Wait na karein.',bn:'আজই ম্যাটার্নিটি ইউনিটে যোগাযোগ করুন।'},steps:['Note last movements','Drink & lie on left','Count 2 hours','Call with result']},
  {id:'fluid',m:['water broke','fluid leaking','leaking','paani','पानी','জল'],s:'pregnancy',u:'urgent',
   r:{en:'Fluid leakage may mean the waters have broken.',hi:'Fluid nikalna matlab pani phat sakta hai.',bn:'তরল বের হওয়া মানে জল ভেঙে যেতে পারে।'},
   a:{en:'Call maternity unit now and go for assessment.',hi:'Abhi maternity unit ko call karein aur jaanch ke liye jayein.',bn:'এখনই কল করুন ও পরীক্ষার জন্য যান।'},steps:['Note time & colour','Use a clean pad','Do not bathe','Go to hospital']},
  {id:'ppbleed',m:['heavy bleeding','soaking','clots','भारी','প্রবল রক্তপাত'],s:'postpartum',u:'emergency',
   r:{en:'Very heavy bleeding after birth can be postpartum haemorrhage.',hi:'Janam ke baad tez bleeding postpartum haemorrhage ho sakti hai.',bn:'প্রসবের পর প্রবল রক্তপাত গুরুতর রক্তস্রাব।'},
   a:{en:'Call emergency services now.',hi:'Abhi emergency call karein.',bn:'এখনই জরুরি কল করুন।'},steps:['Call emergency','Lie flat, legs raised','Do not stand suddenly','Keep baby with you']},
  {id:'fever',m:['fever','chills','bukhar','बुखार','জ্বর'],s:'postpartum,newborn',u:'urgent',
   r:{en:'Fever after birth can mean infection in mother or newborn.',hi:'Janam ke baad bukhar infection ka sanket hai.',bn:'প্রসবের পর জ্বর সংক্রমণের লক্ষণ।'},
   a:{en:'Contact doctor today; newborn fever → hospital immediately.',hi:'Aaj hi doctor; baby ko bukhar → turant hospital.',bn:'আজই ডাক্তার; নবজাতকের জ্বর → সঙ্গে সঙ্গে হাসপাতাল।'},steps:['Record temperature','Note symptoms','Keep baby warm','Same-day care']},
  {id:'leg',m:['leg swelling','one leg','leg pain','पैर','পা ফোলা'],s:'postpartum',u:'emergency',
   r:{en:'One-sided leg swelling can be a blood clot (DVT).',hi:'Ek pair mein sujan blood clot (DVT) ho sakta hai.',bn:'এক পা ফোলা রক্ত জমাট (DVT) হতে পারে।'},
   a:{en:'Go to emergency now. Do not massage the leg.',hi:'Abhi emergency jayein. Pair massage na karein.',bn:'এখনই জরুরি যান। পা ম্যাসাজ করবেন না।'},steps:['Go to emergency','Do not massage','Note onset','Avoid travel']},
  {id:'mental',m:['suicidal','harm myself','harm the baby','खुद को','বাচ্চার ক্ষতি','নিজের ক্ষতি'],s:'pregnancy,postpartum',u:'emergency',
   r:{en:'Thoughts of harm are a psychiatric emergency. Help is available.',hi:'Khud/baby ko nuksan ke vichaar psychiatric emergency hain. Madad mil sakti hai.',bn:'ক্ষতির চিন্তা মানসিক জরুরি অবস্থা। সাহায্য পাওয়া যায়।'},
   a:{en:'Call emergency/helpline NOW. Tell someone you trust. You are not alone.',hi:'Abhi emergency/helpline call. Bharose wale ko batayein. Aap akeli nahi hain.',bn:'এখনই জরুরি/হেল্পলাইন কল। বিশ্বস্ত কাউকে বলুন। আপনি একা নন।'},steps:['Call emergency','Tell a trusted person','Do not stay alone','Remove harmful means']},
  {id:'nbbreath',m:['baby not breathing','baby blue','blue lips','শিশুর শ্বাস','নীল'],s:'newborn',u:'emergency',
   r:{en:'A newborn struggling to breathe or blue is critical.',hi:'Naye baby ko saans mein dikkat ya neele hoth gambhir hai.',bn:'নবজাতকের শ্বাসকষ্ট বা নীল হওয়া জরুরি।'},
   a:{en:'Call emergency immediately. Keep warm, on side. Nothing by mouth.',hi:'Turant emergency call. Garam rakhein, side par. Muh se kuch na dein.',bn:'সঙ্গে সঙ্গে জরুরি কল। উষ্ণ রাখুন, পাশে শুইয়ে দিন। মুখে কিছু দেবেন না।'},steps:['Call emergency','Keep warm','Place on side','Nothing by mouth']},
  {id:'nbfeed',m:['not feeding','won’t feed','poor feeding','stops feeding','খেতে না','খাওয়া না'],s:'newborn',u:'urgent',
   r:{en:'A newborn who will not feed needs same-day assessment.',hi:'Naya baby feed na kare to aaj hi jaanch chahiye.',bn:'নবজাতক খাচ্ছে না হলে আজই পরীক্ষা দরকার।'},
   a:{en:'Contact paediatrician today. Continue skin-to-skin.',hi:'Aaj hi pediatrician se sampark. Skin-to-skin continue karein.',bn:'আজই শিশু বিশেষজ্ঞের সাথে কথা বলুন। স্কিন-টু-স্কিন চালিয়ে যান।'},steps:['Try skin-to-skin','Offer breast often','Count wet nappies','Same-day review']},
  {id:'jaundice',m:['jaundice','yellow','peela','पीला','হলুদ'],s:'newborn',u:'urgent',
   r:{en:'Jaundice in first 24h or worsening needs urgent assessment.',hi:'24 ghante mein peeliya ya badhta peeliya turant jaanch chahiye.',bn:'প্রথম ২৪ ঘণ্টায় হলুদ বা বৃদ্ধি জরুরি পরীক্ষা।'},
   a:{en:'Contact paediatrician today; within 24h is an emergency.',hi:'Aaj hi pediatrician; 24h ke andar emergency hai.',bn:'আজই বিশেষজ্ঞ; ২৪ ঘণ্টার মধ্যে জরুরি।'},steps:['Note onset','Check spread','Feed frequently','Same-day care']},
  {id:'cord',m:['cord','navel','pus',' redness','নাভি','नाभि'],s:'newborn',u:'urgent',
   r:{en:'Redness/pus around cord with fever can mean infection.',hi:'Nabhi ke paas lalima/pus + bukhar infection hai.',bn:'নাভির চারপাশে লালচে ভাব বা পুঁজ সংক্রমণ।'},
   a:{en:'Contact paediatrician today. Keep clean & dry.',hi:'Aaj hi pediatrician. Saaf aur sukha rakhein.',bn:'আজই বিশেষজ্ঞ। পরিষ্কার ও শুকনো রাখুন।'},steps:['Keep clean/dry','No oil/powder','Note fever','Same-day care']},
];

function t(lang,key){ return (STRINGS[lang]||STRINGS.en)[key] || STRINGS.en[key] || key; }
function eddFrom(p){
  const today=new Date(); today.setHours(0,0,0,0);
  if(p.edd) return {edd:new Date(p.edd), days:280-Math.round((new Date(p.edd)-today)/86400000)};
  if(p.lmp) return {edd:new Date(new Date(p.lmp).getTime()+280*86400000), days:Math.round((today-new Date(p.lmp))/86400000)};
  if(p.weeks) return {edd:new Date(today.getTime()+(280-p.weeks*7)*86400000), days:p.weeks*7};
  return {edd:null,days:null};
}
function stageKey(p){
  if(p.stage==='pregnancy'){ const d=p.days||0,w=d/7; return w<14?'t1':w<28?'t2':'t3'; }
  return p.stage;
}
function educationFor(p){ const k=stageKey(p); if(p.stage==='pregnancy') return EDU[k]||EDU.t1; if(p.stage==='postpartum') return EDU.postpartum; if(p.stage==='baby') return EDU.newborn.concat(EDU.child); return EDU.planning; }
function triage(text,stage){
  if(!text||!text.trim()) return null;
  const s=text.toLowerCase();
  const stages=stage==='pregnancy'?'pregnancy':stage==='postpartum'?'postpartum,newborn':'newborn,child';
  const rank={emergency:0,urgent:1};
  let found=DANGER.filter(d=>d.s.split(',').some(x=>stages.includes(x))&&d.m.some(k=>s.includes(k.toLowerCase())));
  found.sort((a,b)=>(rank[a.u]??2)-(rank[b.u]??2));
  if(!found.length) return null;
  const d=found[0];
  return {urgency:d.u,id:d.id,reason:d.r,action:d.a,steps:d.steps};
}
function ancSchedule(p){
  if(!p.edd) return [];
  const edd=new Date(p.edd); const weeks=[12,20,26,30,34,36,38,40];
  return weeks.map((w,i)=>{
    const due=new Date(edd.getTime()-(40-w)*7*86400000);
    return {id:'anc_'+(i+1),type:'anc',title:'Antenatal visit #'+(i+1),due:due.toISOString().slice(0,10),week:w};
  });
}
function immSchedule(birth){
  if(!birth) return [];
  const b=new Date(birth);
  const items=[[0,'BCG, OPV-0, Hep B birth dose'],[42,'OPV-1, Rotavirus-1'],[70,'OPV-2, Rotavirus-2'],[84,'OPV-3, Rotavirus-3, DTaP-1'],[180,'Measles/MR-1, JE-1'],[270,'Measles/MR-2, JE-2, booster'],[365,'Booster doses']];
  return items.map((x,i)=>({id:'imm_'+i,type:'vaccination',title:x[1],due:new Date(b.getTime()+x[0]*86400000).toISOString().slice(0,10)}));
}
function chatReply(text,p,tasks,lang){
  const s=(text||'').toLowerCase();
  const st=p?.stage||'pregnancy';
  const triageStage=st==='pregnancy'?'pregnancy':st==='postpartum'?'postpartum,newborn':'newborn,child';
  const alert=triage(text,triageStage);
  if(alert){
    const label=alert.urgency==='emergency'?'🚨 '+t(lang,'open_emergency')+' — ':'⚠️ ';
    const reason=alert.reason[lang]||alert.reason.en, action=alert.action[lang]||alert.action.en;
    return {kind:'danger',text:label+reason+' '+action+' Immediate steps: '+alert.steps.join(' • ')};
  }
  const tw=['saffron','kesar','जाफरान','জাফরান','papaya','पपीता','পেঁপে','ghee','घी','ঘি','honey','शहद','মধু','cord','nabhi','नाभि','নাভি','bind','bandh','बांध','বাঁধা','kadha','काढ़ा','কাড়া','tradition','parampara','परंपरा','ঐতিহ্য','massage','मालिश','ম্যাসাজ','ghutti'];
  if(tw.some(w=>s.includes(w))) return {kind:'tradition',text:t(lang,'trad_desc')+' → Traditions tab.'};
  const dw=['due','next','appointment','visit','test','checkup','vaccine','immunization','calendar','reminder','अगला','পরবর্তী','টিকা','ভ্যাকসিন'];
  if(dw.some(w=>s.includes(w))){
    const open=(tasks||[]).filter(x=>!x.done).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,3);
    return {kind:'schedule',text:open.length?'Coming up: '+open.map(x=>x.title+' ('+x.due+')').join('; ')+'. Open Calendar to mark done.':t(lang,'all_done')+'. Open Calendar for suggested visits.'};
  }
  const ew=['eat','food','diet','खाना','আহার','exercise','vyayam','व्यायाम','breastfeed','दूध','বুক','sleep','नींद','ঘুম','week','सप्ताह','সপ্তাহ','baby','बेबी','শিশু','normal','सामान्य','স্বাভাবিক'];
  if(ew.some(w=>s.includes(w))){
    const items=educationFor(p||{stage:'pregnancy'});
    if(items.length){ const it=items[0]; return {kind:'education',text:(it.title[lang]||it.title.en)+' — '+(it.body[lang]||it.body.en)}; }
  }
  return {kind:'fallback',text:t(lang,'no_answer')};
}

const Engine={STRINGS,t,EDU,TRADITIONS,VERDICT,DANGER,eddFrom,stageKey,educationFor,triage,ancSchedule,immSchedule,chatReply};
if(typeof module!=='undefined') module.exports=Engine;
