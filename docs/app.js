'use strict';
/* Maternacare AI — Pink & White rebuild.
   Local-first: works instantly with no account. All data stays on this device. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- i18n ---------------- */
const T = {
  en: {
    greet_m: 'Good morning', greet_a: 'Good afternoon', greet_e: 'Good evening', hello: 'Hello,',
    edit: 'Edit', daily_tracker: 'Daily tracker', quick_safety: 'Quick safety check',
    quick_desc: "Tell me a symptom — I'll say how urgent it may be and what to do.",
    check: 'Check', up_next: 'Up next', calendar: 'Calendar',
    remember: 'Remember: this app is health education, not a doctor. For anything urgent, seek care immediately.',
    week: 'Week', day: 'Day', trimester: 'Trimester', edd: 'Estimated due date', progress: 'Progress',
    my_pregnancy: 'My pregnancy', postpartum: 'Postpartum recovery', baby_stage: 'Baby & you', planning: 'Planning a pregnancy',
    water: 'Water', sleep: 'Sleep', steps: 'Steps', mood: 'Mood', glasses: 'glasses', hours: 'hrs',
    saved_device: 'Saved on this device', symptom_ph: 'e.g. severe headache and blurred vision',
    baby_profile: 'Baby profile', add_edit: '+ Add / edit', growth: 'Growth', log: '+ Log',
    feeding: 'Feeding log', immunisations: 'Immunisations', baby_empty: 'No baby added yet. Add one to start tracking growth, feeding and vaccines.',
    add_baby: 'Add baby', baby_name: "Baby's name", dob: 'Date of birth', sex: 'Sex', male: 'Boy', female: 'Girl',
    birth_weight: 'Birth weight (g)', age: 'Age', months: 'months', days: 'days', weight: 'Weight', height: 'Length', head_circ: 'Head circ.',
    no_growth: 'No growth records yet.', no_feeds: 'No feeds logged today.', given: 'Given', mark_given: 'Mark given',
    soon: 'Due', overdue: 'Overdue', done: 'Done',
    online: 'Online · evidence-based', clear: 'Clear',
    learn_title: 'Learn', learn_sub: 'Short, practical guidance for your stage — plus tradition vs evidence.',
    for_stage: 'For your stage', tradition: 'Tradition vs evidence',
    tradition_sub: "We respect culture. Here's what evidence says — respectfully, safety first.",
    sources: 'Sources: WHO antenatal & newborn care guidance, UNICEF breastfeeding recommendations, India MoHFW/NHM immunisation schedule and safe-motherhood materials.',
    safety_title: 'Safety', safety_sub: 'Know the danger signs. Acting early saves lives.',
    emergency_now: 'Emergency now? Heavy bleeding, trouble breathing, fits/convulsions, chest pain, reduced baby movement, or thoughts of harming yourself → go to the nearest emergency department or call 102.',
    preg_danger: 'Pregnancy danger signs', baby_danger: 'Newborn & baby danger signs', if_wrong: 'If something is wrong',
    profile_title: 'Your profile', profile_sub: 'Everything is stored privately on this device.',
    care_calendar: 'Care calendar', add: '+ Add', your_data: 'Your data',
    backup: 'Backup my data', backup_desc: 'Download a JSON copy',
    restore: 'Restore backup', restore_desc: 'Load a JSON file',
    reset: 'Reset this device', reset_desc: 'Clear all locally stored data',
    important_note: 'Important: Maternacare AI is an educational prototype. It is not clinically validated, does not diagnose, and must never replace a qualified doctor, nurse or emergency service.',
    edit_profile: 'Edit profile', your_name: 'Your name', stage_lbl: 'Journey stage', lang_lbl: 'Language',
    lmp_lbl: 'First day of last period', edd_lbl: 'Due date (if known)', save: 'Save', cancel: 'Cancel',
    task_title: 'Reminder', task_due: 'Due date', add_task: 'Add reminder',
    toast_saved: 'Saved', toast_reset: 'All local data cleared', toast_imported: 'Backup restored',
    toast_import_fail: 'That file could not be read', toast_feed: 'Feeding logged', toast_growth: 'Growth logged', toast_baby: 'Baby profile saved',
    stage_pregnant: 'Pregnant', stage_postpartum: 'Postpartum', stage_baby: 'Baby / infant', stage_planning: 'Planning',
    baby_hero_t: 'Every movement, a little miracle', baby_hero_s: 'Track growth, feeds and vaccines in one place.',
    call: 'Call 102 ambulance', call108: 'Call 108 emergency',
    chat_ph: 'Ask about symptoms, food, or what\'s due…', send: 'Send',
    disclaim: 'Educational only. Not a diagnosis. In an emergency call 102.',
    chart: 'Recent weight', not_set: 'Not set', you: 'You', assistant: 'Maternacare',
    due: 'Due', baby: 'Baby', nav_home: 'Home', nav_baby: 'Baby', nav_ask: 'Ask', nav_learn: 'Learn', nav_more: 'More',
    welcome_title: 'Welcome 🌸', welcome_sub: 'A few details so the guidance fits you. Everything stays on this device.', start: 'Start',
    agent_title:'Maternacare AI',agent_sub:'Answers your questions · educational only',agent_ph:'Ask anything about pregnancy or baby care…',agent_note:'Educational only. Not a diagnosis. In an emergency call 102.',agent_key:'AI assistant key',agent_key_hint:'Stored only on this device. Anyone with access to this browser can read it.',agent_thinking:'Thinking…',agent_error:'Sorry, I could not reach the AI right now. Try again in a moment.',agent_no_key:'Paste your free API key (Groq recommended) in More → AI assistant key to enable me.',agent_clear:'Clear chat',
    complications:'Complications reference',complications_sub:'Common pregnancy complications, their warning signs and what to do. Educational only.',comp_signs:'Warning signs',comp_do:'What to do',comp_more:'Learn more'
  },
  hi: {
    greet_m: 'सुप्रभात', greet_a: 'नमस्कार', greet_e: 'शुभ संध्या', hello: 'नमस्ते,',
    edit: 'बदलें', daily_tracker: 'दैनिक ट्रैकर', quick_safety: 'तुरंत सुरक्षा जाँच',
    quick_desc: 'अपना लक्षण बताएँ — मैं बताऊँगी कितना तत्काल है और क्या करें।',
    check: 'जाँचें', up_next: 'आगे क्या है', calendar: 'कैलेंडर',
    remember: 'याद रखें: यह ऐप स्वास्थ्य शिक्षा है, डॉक्टर नहीं। कुछ भी तत्काल हो तो फौरन इलाज लें।',
    week: 'सप्ताह', day: 'दिन', trimester: 'तिमाही', edd: 'संभावित प्रसव तिथि', progress: 'प्रगति',
    my_pregnancy: 'मेरी गर्भावस्था', postpartum: 'प्रसव के बाद देखभाल', baby_stage: 'शिशु और आप', planning: 'गर्भावस्था की योजना',
    water: 'पानी', sleep: 'नींद', steps: 'कदम', mood: 'मनोदशा', glasses: 'गिलास', hours: 'घंटे',
    saved_device: 'इस डिवाइस पर सुरक्षित', symptom_ph: 'जैसे तेज़ सिरदर्द और धुंधला दिखना',
    baby_profile: 'शिशु प्रोफ़ाइल', add_edit: '+ जोड़ें / बदलें', growth: 'वृद्धि', log: '+ दर्ज करें',
    feeding: 'आहार लॉग', immunisations: 'टीकाकरण', baby_empty: 'अभी कोई शिशु नहीं जोड़ा। वृद्धि, आहार और टीके ट्रैक करने के लिए जोड़ें।',
    add_baby: 'शिशु जोड़ें', baby_name: 'शिशु का नाम', dob: 'जन्म तिथि', sex: 'लिंग', male: 'लड़का', female: 'लड़की',
    birth_weight: 'जन्म वज़न (ग्राम)', age: 'उम्र', months: 'महीने', days: 'दिन', weight: 'वज़न', height: 'लंबाई', head_circ: 'सिर घेरा',
    no_growth: 'अभी कोई वृद्धि रिकॉर्ड नहीं।', no_feeds: 'आज कोई आहार दर्ज नहीं।', given: 'दिया', mark_given: 'दिया हुआ चिह्नित करें',
    soon: 'देय', overdue: 'बकाया', done: 'पूर्ण',
    online: 'ऑनलाइन · साक्ष्य-आधारित', clear: 'साफ़ करें',
    learn_title: 'जानें', learn_sub: 'आपके चरण के लिए छोटी, व्यावहारिक जानकारी — और परंपरा बनाम साक्ष्य।',
    for_stage: 'आपके चरण के लिए', tradition: 'परंपरा बनाम साक्ष्य',
    tradition_sub: 'हम संस्कृति का सम्मान करते हैं। साक्ष्य क्या कहते हैं — सुरक्षा पहले।',
    sources: 'स्रोत: WHO, UNICEF, भारत MoHFW/NHM टीकाकरण कार्यक्रम।',
    safety_title: 'सुरक्षा', safety_sub: 'खतरे के संकेत पहचानें। जल्दी कार्रवाई जान बचाती है।',
    emergency_now: 'अभी आपातकाल? भारी रक्तस्राव, साँस लेने में तकलीफ़, दौरे, सीने में दर्द, शिशु की हलचल कम, या खुद को नुकसान पहुँचाने के विचार → तुरंत अस्पताल जाएँ या 102 पर कॉल करें।',
    preg_danger: 'गर्भावस्था के खतरे के संकेत', baby_danger: 'नवजात के खतरे के संकेत', if_wrong: 'कुछ गलत लगे तो',
    profile_title: 'आपकी प्रोफ़ाइल', profile_sub: 'सारा डेटा इस डिवाइस पर निजी रूप से सुरक्षित है।',
    care_calendar: 'देखभाल कैलेंडर', add: '+ जोड़ें', your_data: 'आपका डेटा',
    backup: 'डेटा बैकअप', backup_desc: 'JSON कॉपी डाउनलोड करें',
    restore: 'बैकअप बहाल करें', restore_desc: 'JSON फ़ाइल लोड करें',
    reset: 'डिवाइस रीसेट', reset_desc: 'सारा स्थानीय डेटा मिटाएँ',
    important_note: 'महत्वपूर्ण: Maternacare AI एक शैक्षिक प्रोटोटाइप है। यह चिकित्सकीय रूप से प्रमाणित नहीं है, निदान नहीं करता, और डॉक्टर/आपातकालीन सेवा का विकल्प नहीं है।',
    edit_profile: 'प्रोफ़ाइल बदलें', your_name: 'आपका नाम', stage_lbl: 'यात्रा चरण', lang_lbl: 'भाषा',
    lmp_lbl: 'अंतिम माहवारी का पहला दिन', edd_lbl: 'प्रसव तिथि (यदि ज्ञात)', save: 'सहेजें', cancel: 'रद्द करें',
    task_title: 'रिमाइंडर', task_due: 'देय तिथि', add_task: 'रिमाइंडर जोड़ें',
    toast_saved: 'सहेजा गया', toast_reset: 'सारा स्थानीय डेटा मिटा दिया गया', toast_imported: 'बैकअप बहाल हुआ',
    toast_import_fail: 'यह फ़ाइल पढ़ी नहीं जा सकी', toast_feed: 'आहार दर्ज हुआ', toast_growth: 'वृद्धि दर्ज हुई', toast_baby: 'शिशु प्रोफ़ाइल सहेजी गई',
    stage_pregnant: 'गर्भवती', stage_postpartum: 'प्रसवोत्तर', stage_baby: 'शिशु', stage_planning: 'योजना',
    baby_hero_t: 'हर हलचल, एक छोटा चमत्कार', baby_hero_s: 'वृद्धि, आहार और टीके एक जगह ट्रैक करें।',
    call: '102 एम्बुलेंस बुलाएँ', call108: '108 आपातकाल',
    chat_ph: 'लक्षण, खाना या आगे क्या है — पूछें…', send: 'भेजें',
    disclaim: 'केवल शैक्षिक। निदान नहीं। आपातकाल में 102 पर कॉल करें।',
    chart: 'हाल का वज़न', not_set: 'सेट नहीं', you: 'आप', assistant: 'Maternacare',
    due: 'देय', baby: 'शिशु', nav_home: 'होम', nav_baby: 'शिशु', nav_ask: 'पूछें', nav_learn: 'जानें', nav_more: 'और',
    welcome_title: 'स्वागत है 🌸', welcome_sub: 'कुछ जानकारी ताकि सलाह आपके अनुसार हो। सब कुछ इसी डिवाइस पर रहता है।', start: 'शुरू करें',
    agent_title:'Maternacare AI',agent_sub:'Aapke sawalon ke jawab · sirf shiksha',agent_ph:'Garbhavastha ya shishu dekhbhal ke baare mein kuch bhi puchhein…',agent_note:'Sirf shiksha. Nidan nahi. Aapatakal mein 102 par call karein.',agent_key:'AI assistant key',agent_key_hint:'Sirf is device par. Is browser ko access karne wala koi bhi padh sakta hai.',agent_thinking:'Soch rahi hoon…',agent_error:'Maaf kijiye, abhi AI se sampark nahi ho paya. Thodi der baad try karein.',agent_no_key:'Mujhe enable karne ke liye More → AI assistant key mein apna free API key (Groq recommended) paste karein.',agent_clear:'Chat saaf karein',
    complications:'Complications reference',complications_sub:'Aam garbhavastha complications, unke warning signs aur kya karein. Sirf shiksha.',comp_signs:'Warning signs',comp_do:'Kya karein',comp_more:'Aur jaanein'
  },
  bn: {
    greet_m: 'শুভ সকাল', greet_a: 'শুভ অপরাহ্ন', greet_e: 'শুভ সন্ধ্যা', hello: 'নমস্কার,',
    edit: 'সম্পাদনা', daily_tracker: 'দৈনিক ট্র্যাকার', quick_safety: 'দ্রুত নিরাপত্তা যাচাই',
    quick_desc: 'উপসর্গ বলুন — কতটা জরুরি এবং কী করবেন বলব।',
    check: 'যাচাই', up_next: 'পরবর্তী', calendar: 'ক্যালেন্ডার',
    remember: 'মনে রাখুন: এটি স্বাস্থ্য-শিক্ষা, ডাক্তার নয়। জরুরি হলে সাথে সাথে চিকিৎসা নিন।',
    week: 'সপ্তাহ', day: 'দিন', trimester: 'ত্রৈমাসিক', edd: 'সম্ভাব্য প্রসবের তারিখ', progress: 'অগ্রগতি',
    my_pregnancy: 'আমার গর্ভাবস্থা', postpartum: 'প্রসব-পরবর্তী যত্ন', baby_stage: 'শিশু ও আপনি', planning: 'গর্ভাবস্থার পরিকল্পনা',
    water: 'পানি', sleep: 'ঘুম', steps: 'পদক্ষেপ', mood: 'মেজাজ', glasses: 'গ্লাস', hours: 'ঘণ্টা',
    saved_device: 'এই ডিভাইসে সংরক্ষিত', symptom_ph: 'যেমন তীব্র মাথাব্যথা ও ঝাপসা দৃষ্টি',
    baby_profile: 'শিশুর প্রোফাইল', add_edit: '+ যোগ / সম্পাদনা', growth: 'বৃদ্ধি', log: '+ লিখুন',
    feeding: 'খাওয়ানোর লগ', immunisations: 'টিকাদান', baby_empty: 'এখনো শিশু যোগ হয়নি। বৃদ্ধি, খাওয়ানো ও টিকা ট্র্যাক করতে যোগ করুন।',
    add_baby: 'শিশু যোগ করুন', baby_name: 'শিশুর নাম', dob: 'জন্ম তারিখ', sex: 'লিঙ্গ', male: 'ছেলে', female: 'মেয়ে',
    birth_weight: 'জন্ম ওজন (গ্রাম)', age: 'বয়স', months: 'মাস', days: 'দিন', weight: 'ওজন', height: 'উচ্চতা', head_circ: 'মাথার পরিধি',
    no_growth: 'এখনো কোনো বৃদ্ধির রেকর্ড নেই।', no_feeds: 'আজ কোনো খাওয়ানো নেই।', given: 'দেওয়া', mark_given: 'দেওয়া চিহ্নিত করুন',
    soon: 'দেয়', overdue: 'বাকি', done: 'সম্পন্ন',
    online: 'অনলাইন · প্রমাণভিত্তিক', clear: 'মুছুন',
    learn_title: 'জানুন', learn_sub: 'আপনার ধাপের জন্য সংক্ষিপ্ত, ব্যবহারিক পরামর্শ — এবং ঐতিহ্য বনাম প্রমাণ।',
    for_stage: 'আপনার ধাপের জন্য', tradition: 'ঐতিহ্য বনাম প্রমাণ',
    tradition_sub: 'আমরা সংস্কৃতিকে সম্মান করি। প্রমাণ কী বলে — নিরাপত্তা আগে।',
    sources: 'সূত্র: WHO, UNICEF, ভারত MoHFW/NHM টিকাদান সূচি।',
    safety_title: 'নিরাপত্তা', safety_sub: 'বিপদের লক্ষণ জানুন। দ্রুত পদক্ষেপ জীবন বাঁচায়।',
    emergency_now: 'এখনই জরুরি? ভারী রক্তপাত, শ্বাসকষ্ট, খিঁচুনি, বুকে ব্যথা, শিশুর নড়াচড়া কম, বা নিজের ক্ষতি করার ভাবনা → সাথে সাথে হাসপাতালে যান বা 102-এ কল করুন।',
    preg_danger: 'গর্ভাবস্থার বিপদ চিহ্ন', baby_danger: 'নবজাতকের বিপদ চিহ্ন', if_wrong: 'কিছু ভুল মনে হলে',
    profile_title: 'আপনার প্রোফাইল', profile_sub: 'সব তথ্য এই ডিভাইসে ব্যক্তিগতভাবে সংরক্ষিত।',
    care_calendar: 'যত্ন ক্যালেন্ডার', add: '+ যোগ', your_data: 'আপনার ডেটা',
    backup: 'ডেটা ব্যাকআপ', backup_desc: 'JSON কপি ডাউনলোড করুন',
    restore: 'ব্যাকআপ ফিরিয়ে আনুন', restore_desc: 'JSON ফাইল লোড করুন',
    reset: 'ডিভাইস রিসেট', reset_desc: 'সব স্থানীয় ডেটা মুছুন',
    important_note: 'গুরুত্বপূর্ণ: Maternacare AI একটি শিক্ষামূলক প্রোটোটাইপ। এটি ক্লিনিক্যালি যাচাইকৃত নয়, রোগ নির্ণয় করে না, এবং ডাক্তার/জরুরি সেবার বিকল্প নয়।',
    edit_profile: 'প্রোফাইল সম্পাদনা', your_name: 'আপনার নাম', stage_lbl: 'যাত্রার ধাপ', lang_lbl: 'ভাষা',
    lmp_lbl: 'শেষ মাসিকের প্রথম দিন', edd_lbl: 'প্রসবের তারিখ (জানা থাকলে)', save: 'সংরক্ষণ', cancel: 'বাতিল',
    task_title: 'মনে করানো', task_due: 'নির্ধারিত তারিখ', add_task: 'রিমাইন্ডার যোগ',
    toast_saved: 'সংরক্ষিত', toast_reset: 'সব স্থানীয় ডেটা মুছে ফেলা হয়েছে', toast_imported: 'ব্যাকআপ ফিরে এসেছে',
    toast_import_fail: 'ফাইলটি পড়া যায়নি', toast_feed: 'খাওয়ানো লিপিবদ্ধ', toast_growth: 'বৃদ্ধি লিপিবদ্ধ', toast_baby: 'শিশুর প্রোফাইল সংরক্ষিত',
    stage_pregnant: 'গর্ভবতী', stage_postpartum: 'প্রসব-পরবর্তী', stage_baby: 'শিশু', stage_planning: 'পরিকল্পনা',
    baby_hero_t: 'প্রতিটি নড়াচড়া, এক ছোট্ট অলৌকিকতা', baby_hero_s: 'বৃদ্ধি, খাওয়ানো ও টিকা এক জায়গায়।',
    call: '102 অ্যাম্বুলেন্স', call108: '108 জরুরি',
    chat_ph: 'উপসর্গ, খাবার বা পরবর্তী কী — জিজ্ঞাসা করুন…', send: 'পাঠান',
    disclaim: 'শুধু শিক্ষামূলক। রোগ নির্ণয় নয়। জরুরি হলে 102-এ কল করুন।',
    chart: 'সাম্প্রতিক ওজন', not_set: 'সেট নয়', you: 'আপনি', assistant: 'Maternacare',
    due: 'দেয়', baby: 'শিশু', nav_home: 'হোম', nav_baby: 'শিশু', nav_ask: 'জিজ্ঞাসা', nav_learn: 'জানুন', nav_more: 'আরও',
    welcome_title: 'স্বাগতম 🌸', welcome_sub: 'কিছু তথ্য যাতে পরামর্শ আপনার জন্য মানানসই হয়। সবকিছু এই ডিভাইসেই থাকে।', start: 'শুরু করুন',
    agent_title:'Maternacare AI',agent_sub:'আপনার প্রশ্নের উত্তর · শুধু শিক্ষামূলক',agent_ph:'গর্ভাবস্থা বা শিশুর যত্ন সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন…',agent_note:'শুধু শিক্ষামূলক। রোগ নির্ণয় নয়। জরুরিতে 102-এ কল করুন।',agent_key:'AI assistant key',agent_key_hint:'শুধু এই ডিভাইসে। এই ব্রাউজারে প্রবেশ করতে পারে এমন যে কেউ পড়তে পারে।',agent_thinking:'ভাবছি…',agent_error:'দুঃখিত, এই মুহূর্তে AI-এ পৌঁছানো যায়নি। একটু পরে চেষ্টা করুন।',agent_no_key:'Amake chalu korte More → AI assistant key-e apnar free API key (Groq recommended) paste korun.',agent_clear:'চ্যাট মুছুন',
    complications:'জটিলতার রেফারেন্স',complications_sub:'সাধারণ গর্ভাবস্থার জটিলতা, সতর্কতা চিহ্ন ও কী করবেন। শুধু শিক্ষামূলক।',comp_signs:'সতর্কতা চিহ্ন',comp_do:'কী করবেন',comp_more:'আরও জানুন'
  }
};

/* ---------------- state ---------------- */
const KEY = 'mc2_state';
function defaults() {
  return {
    lang: 'en', name: 'Mama', stage: 'pregnant', lmp: '', edd: '', week: 16,
    baby: null, growth: [], feeds: [], imm: {}, tasks: [], chat: [], tracker: {},
    onboarded: false, v: 10
  };
}
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return Object.assign(defaults(), raw);
  } catch (e) { return defaults(); }
}
let state = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } }
function tr(k) { return (T[state.lang] || T.en)[k] || T.en[k] || k; }
const L = (en, hi, bn) => ({ en, hi, bn }[state.lang] || en);

/* ---------------- helpers ---------------- */
function todayISO() { const d = new Date(); return d.toISOString().slice(0, 10); }
function parseD(s) { const d = new Date((s || '') + 'T00:00:00'); return isNaN(d) ? null : d; }
function addDays(s, n) { const d = parseD(s); if (!d) return null; d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function daysBetween(a, b) { const x = parseD(a), y = parseD(b); if (!x || !y) return 0; return Math.round((y - x) / 86400000); }
function fmtDate(s) { const d = parseD(s); if (!d) return tr('not_set'); return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
function ageText(dob) {
  const d = daysBetween(dob, todayISO());
  if (d < 0) return '';
  if (d < 60) return d + ' ' + tr('days');
  const m = Math.floor(d / 30.44);
  if (m < 24) return m + ' ' + tr('months');
  return Math.floor(m / 12) + ' yrs';
}
function toast(msg) {
  const w = $('#toasts'); const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg; w.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; }, 2000);
  setTimeout(() => el.remove(), 2400);
}
function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms || 20); } catch (e) { } }
function dueWeek() {
  if (state.lmp) {
    const d = daysBetween(state.lmp, todayISO());
    if (d >= 0 && d < 320) return Math.min(42, Math.floor(d / 7));
  }
  return Math.max(0, Math.min(42, Number(state.week) || 0));
}
function dueEDD() {
  if (state.edd) return state.edd;
  if (state.lmp) return addDays(state.lmp, 280);
  return '';
}
function trimesterOf(w) { return w < 13 ? 1 : w < 28 ? 2 : 3; }
function stageLabel(s) {
  return { pregnant: tr('stage_pregnant'), postpartum: tr('stage_postpartum'), baby: tr('stage_baby'), planning: tr('stage_planning') }[s] || tr('stage_pregnant');
}
function stageIcon(s) { return { pregnant: '🤰', postpartum: '🌸', baby: '👶', planning: '🌱' }[s] || '🤰'; }

/* ---------------- static translation ---------------- */
function applyLang() {
  document.documentElement.lang = state.lang;
  $$('[data-lang]').forEach(b => b.classList.toggle('active', b.dataset.lang === state.lang));
  $$('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (k) el.textContent = tr(k); });
  const ph = $$('[data-ph]'); ph.forEach(el => { el.placeholder = tr(el.dataset.ph); });
  renderAll();
}

/* ---------------- navigation ---------------- */
function go(id) {
  $$('.screen').forEach(s => s.classList.toggle('on', s.id === 's-' + id));
  $$('.nav button').forEach(b => b.classList.toggle('on', b.dataset.go === id));
  try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  render(id);
}
function render(id) {
  if (id === 'home') renderHome();
  else if (id === 'baby') renderBaby();
  else if (id === 'ask') renderChat();
  else if (id === 'learn') renderLearn();
  else if (id === 'safety') renderSafety();
  else if (id === 'more') renderMore();
}
function renderAll() { ['home', 'baby', 'ask', 'learn', 'safety', 'more'].forEach(render); }

/* ---------------- HOME ---------------- */
function renderHome() {
  const h = new Date().getHours();
  $('#greetLine').textContent = h < 12 ? tr('greet_m') : h < 17 ? tr('greet_a') : tr('greet_e');
  $('#greetName').textContent = tr('hello') + ' ' + (state.name || 'Mama');

  const w = dueWeek();
  const pct = state.stage === 'pregnant' ? Math.min(100, Math.round(w / 40 * 100)) : 100;
  const C = 2 * Math.PI * 38;
  const off = C - (C * pct / 100);
  let title, sub, stat1, stat2;
  if (state.stage === 'pregnant') {
    title = tr('my_pregnancy');
    sub = tr('week') + ' ' + w + ' · ' + tr('trimester') + ' ' + trimesterOf(w);
    stat1 = [tr('edd'), fmtDate(dueEDD())];
    stat2 = [tr('progress'), pct + '%'];
  } else if (state.stage === 'postpartum') {
    title = tr('postpartum'); sub = L('Rest, feed, recover — you are doing enough.', 'आराम, दूध, रिकवरी — आप काफ़ी कर रही हैं।', 'বিশ্রাম, খাওয়ানো, সেরে ওঠা — আপনি যথেষ্ট করছেন।');
    stat1 = [tr('baby'), state.baby ? state.baby.name : tr('not_set')];
    stat2 = [tr('age'), state.baby ? ageText(state.baby.dob) : tr('not_set')];
  } else if (state.stage === 'baby') {
    title = tr('baby_stage'); sub = state.baby ? state.baby.name + ' · ' + ageText(state.baby.dob) : tr('baby_empty');
    stat1 = [tr('weight'), state.baby && state.baby.birthWeight ? (state.baby.birthWeight / 1000).toFixed(2) + ' kg' : tr('not_set')];
    stat2 = [tr('age'), state.baby ? ageText(state.baby.dob) : tr('not_set')];
  } else {
    title = tr('planning'); sub = L('Folic acid, nutrition and timing — one step at a time.', 'फोलिक एसिड, पोषण और समय — एक कदम एक बार।', 'ফলিক অ্যাসিড, পুষ্টি ও সময় — এক ধাপে একবার।');
    stat1 = [tr('edd'), tr('not_set')]; stat2 = [tr('progress'), '—'];
  }
  $('#homeHero').innerHTML = `
    <div class="hero-top">
      <div>
        <span class="stage-badge">${stageIcon(state.stage)} ${esc(stageLabel(state.stage))}</span>
        <h2 style="margin-top:8px">${esc(title)}</h2>
        <p class="sub">${esc(sub)}</p>
      </div>
      <div class="ring-wrap">
        <svg class="ring" viewBox="0 0 92 92" aria-hidden="true">
          <circle class="bg" cx="46" cy="46" r="38"></circle>
          <circle class="fg" cx="46" cy="46" r="38" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"></circle>
        </svg>
        <div class="ring-label"><b>${state.stage === 'pregnant' ? w : '♥'}</b><span>${state.stage === 'pregnant' ? tr('week') : ''}</span></div>
      </div>
    </div>
    <div class="hero-stats">
      <div class="stat"><span>${esc(stat1[0])}</span><b>${esc(stat1[1])}</b></div>
      <div class="stat"><span>${esc(stat2[0])}</span><b>${esc(stat2[1])}</b></div>
    </div>`;

  renderTracker();
  renderTasks('#homeTasks', 3);
}

/* tracker */
function todayTracker() {
  const d = todayISO();
  if (!state.tracker || state.tracker.date !== d) {
    state.tracker = { date: d, water: 0, sleep: 0, steps: 0, mood: '' };
    save();
  }
  return state.tracker;
}
function renderTracker() {
  const t = todayTracker();
  $('#trackDate') && ($('#trackDate').textContent = fmtDate(t.date));
  $('#trackNote') && ($('#trackNote').textContent = tr('saved_device'));
  const moods = ['😞', '😐', '🙂', '😊'];
  $('#trackGrid').innerHTML = `
    <div class="track">
      <div class="track-top"><div class="track-ico">💧</div><span class="track-name">${esc(tr('water'))}</span></div>
      <div class="track-val">${t.water}<small>${esc(tr('glasses'))}</small></div>
      <div class="stepper"><button data-tr="water" data-d="-1" aria-label="less water">−</button><span class="v">${t.water}/8</span><button data-tr="water" data-d="1" aria-label="more water">+</button></div>
    </div>
    <div class="track">
      <div class="track-top"><div class="track-ico">🌙</div><span class="track-name">${esc(tr('sleep'))}</span></div>
      <div class="track-val">${t.sleep}<small>${esc(tr('hours'))}</small></div>
      <div class="stepper"><button data-tr="sleep" data-d="-0.5" aria-label="less sleep">−</button><span class="v">${t.sleep}h</span><button data-tr="sleep" data-d="0.5" aria-label="more sleep">+</button></div>
    </div>
    <div class="track">
      <div class="track-top"><div class="track-ico">👟</div><span class="track-name">${esc(tr('steps'))}</span></div>
      <div class="track-val">${t.steps}<small>steps</small></div>
      <div class="stepper"><button data-tr="steps" data-d="-500" aria-label="fewer steps">−</button><span class="v">${(t.steps / 1000).toFixed(1)}k</span><button data-tr="steps" data-d="500" aria-label="more steps">+</button></div>
    </div>
    <div class="track">
      <div class="track-top"><div class="track-ico">💗</div><span class="track-name">${esc(tr('mood'))}</span></div>
      <div class="mood-row">${moods.map(m => `<button data-mood="${m}" class="${t.mood === m ? 'sel' : ''}" aria-label="mood ${m}">${m}</button>`).join('')}</div>
    </div>`;
}

/* tasks */
function seedTasks() {
  if (state.tasks && state.tasks.length) return;
  const w = dueWeek();
  const t = todayISO();
  const mk = (title, inDays, icon) => ({ id: 't' + Math.random().toString(36).slice(2, 8), title, due: addDays(t, inDays), done: false, icon: icon || '▦' });
  state.tasks = [];
  if (state.stage === 'pregnant') {
    state.tasks.push(mk(L('Antenatal check-up', 'ANC जाँच', 'ANC চেকআপ'), 7, '🩺'));
    state.tasks.push(mk(L('Take iron & folic acid daily', 'आयरन और फोलिक एसिड रोज़', 'আয়রন ও ফলিক অ্যাসিড প্রতিদিন'), 0, '💊'));
    if (w >= 18 && w <= 22) state.tasks.push(mk(L('Anomaly scan (18–22 weeks)', 'एनोमली स्कैन (18–22 सप्ताह)', 'অ্যানোমালি স্ক্যান (১৮–২২ সপ্তাহ)'), 3, '🔍'));
    state.tasks.push(mk(L('Kick count — 10 movements', 'किक काउंट — 10 हलचल', 'কিক কাউন্ট — ১০ নড়াচড়া'), 1, '👣'));
  } else if (state.stage === 'postpartum' || state.stage === 'baby') {
    state.tasks.push(mk(L('Postpartum check-up', 'प्रसवोत्तर जाँच', 'প্রসব-পরবর্তী চেকআপ'), 5, '🩺'));
    state.tasks.push(mk(L('Immunisation visit', 'टीकाकरण यात्रा', 'টিকাদান সফর'), 10, '💉'));
    state.tasks.push(mk(L('Exclusive breastfeeding support', 'केवल स्तनपान सहायता', 'শুধু স্তন্যপান সহায়তা'), 0, '🤱'));
  } else {
    state.tasks.push(mk(L('Start folic acid 400µg daily', 'फोलिक एसिड 400µg रोज़ शुरू करें', 'ফলিক অ্যাসিড ৪০০µg প্রতিদিন শুরু'), 0, '💊'));
  }
  save();
}
function renderTasks(sel, limit) {
  seedTasks();
  const el = $(sel); if (!el) return;
  const list = state.tasks.slice().sort((a, b) => (a.due || '').localeCompare(b.due || ''));
  const show = limit ? list.filter(t => !t.done).slice(0, limit) : list;
  if (!show.length) { el.innerHTML = `<p class="empty">${esc(L('All caught up — great work.', 'सब पूरा — बहुत बढ़िया।', 'সব শেষ — দারুণ।'))}</p>`; return; }
  el.innerHTML = show.map(t => {
    const overdue = !t.done && t.due && t.due < todayISO();
    return `<div class="item">
      <div class="ib">${t.icon || '▦'}</div>
      <div class="im"><b>${esc(t.title)}</b><span>${fmtDate(t.due)}${overdue ? ' · ' + esc(tr('overdue')) : ''}</span></div>
      ${sel === '#allTasks'
        ? `<button class="check ${t.done ? 'on' : ''}" data-task="${t.id}" aria-label="toggle">${t.done ? '✓' : ''}</button>`
        : `<span class="tag ${overdue ? 'over' : 'soon'}">${overdue ? esc(tr('overdue')) : esc(tr('soon'))}</span>`}
    </div>`;
  }).join('');
}

/* ---------------- BABY ---------------- */
const IMM = [
  { key: 'bcg', age: 0, name: { en: 'BCG + OPV-0 + Hep B birth dose', hi: 'BCG + OPV-0 + हेप बी जन्म खुराक', bn: 'BCG + OPV-0 + হেপ বি জন্ম ডোজ' } },
  { key: 'w6', age: 42, name: { en: '6 weeks: DTwP-1, OPV-1, HepB-2, Hib-1, PCV-1, Rota-1', hi: '6 सप्ताह: DTwP-1, OPV-1, HepB-2, Hib-1, PCV-1, Rota-1', bn: '৬ সপ্তাহ: DTwP-1, OPV-1, HepB-2, Hib-1, PCV-1, Rota-1' } },
  { key: 'w10', age: 70, name: { en: '10 weeks: DTwP-2, OPV-2, Hib-2, PCV-2, Rota-2', hi: '10 सप्ताह: DTwP-2, OPV-2, Hib-2, PCV-2, Rota-2', bn: '১০ সপ্তাহ: DTwP-2, OPV-2, Hib-2, PCV-2, Rota-2' } },
  { key: 'w14', age: 98, name: { en: '14 weeks: DTwP-3, OPV-3, HepB-3, Hib-3, PCV-3, Rota-3', hi: '14 सप्ताह: DTwP-3, OPV-3, HepB-3, Hib-3, PCV-3, Rota-3', bn: '১৪ সপ্তাহ: DTwP-3, OPV-3, HepB-3, Hib-3, PCV-3, Rota-3' } },
  { key: 'm9', age: 274, name: { en: '9 months: MR-1, JE-1 (endemic areas), PCV booster', hi: '9 महीने: MR-1, JE-1, PCV बूस्टर', bn: '৯ মাস: MR-1, JE-1, PCV বুস্টার' } },
  { key: 'm12', age: 365, name: { en: '12 months: Hepatitis A-1', hi: '12 महीने: हेपेटाइटिस A-1', bn: '১২ মাস: হেপাটাইটিস A-1' } },
  { key: 'm15', age: 456, name: { en: '15 months: MMR-1, Varicella-1, PCV booster', hi: '15 महीने: MMR-1, वैरिसेला-1, PCV बूस्टर', bn: '১৫ মাস: MMR-1, ভ্যারিসেলা-1, PCV বুস্টার' } },
  { key: 'm18', age: 548, name: { en: '16–24 months: DTwP booster-1, OPV booster, MR-2, JE-2', hi: '16–24 महीने: DTwP बूस्टर-1, OPV बूस्टर, MR-2, JE-2', bn: '১৬–২৪ মাস: DTwP বুস্টার-1, OPV বুস্টার, MR-2, JE-2' } },
  { key: 'y5', age: 1825, name: { en: '5 years: DTwP booster-2, OPV', hi: '5 वर्ष: DTwP बूस्टर-2, OPV', bn: '৫ বছর: DTwP বুস্টার-2, OPV' } },
  { key: 'y10', age: 3650, name: { en: '10 years: Td', hi: '10 वर्ष: Td', bn: '১০ বছর: Td' } }
];

function renderBaby() {
  const b = state.baby;
  $('#babyHero').innerHTML = `
    <div class="hero-top">
      <div>
        <span class="stage-badge">👶 ${esc(L('Baby', 'शिशु', 'শিশু'))}</span>
        <h2 style="margin-top:8px">${esc(tr('baby_hero_t'))}</h2>
        <p class="sub">${esc(b ? esc(b.name) + ' · ' + ageText(b.dob) : tr('baby_hero_s'))}</p>
      </div>
      <div class="ring-wrap"><div class="avatar" style="width:64px;height:64px;font-size:30px;margin:6px auto 0">👶</div></div>
    </div>
    <div class="hero-stats">
      <div class="stat"><span>${esc(tr('weight'))}</span><b>${b && b.birthWeight ? (b.birthWeight / 1000).toFixed(2) + ' kg' : tr('not_set')}</b></div>
      <div class="stat"><span>${esc(tr('age'))}</span><b>${b ? ageText(b.dob) : tr('not_set')}</b></div>
    </div>`;

  if (!b) {
    $('#babyProfile').innerHTML = `<p class="empty">${esc(tr('baby_empty'))}</p><button class="btn primary full" data-sheet="baby">${esc(tr('add_baby'))}</button>`;
  } else {
    $('#babyProfile').innerHTML = `
      <div class="kv"><span>${esc(tr('baby_name'))}</span><b>${esc(b.name)}</b></div>
      <div class="kv"><span>${esc(tr('dob'))}</span><b>${fmtDate(b.dob)}</b></div>
      <div class="kv"><span>${esc(tr('sex'))}</span><b>${esc(b.sex === 'male' ? tr('male') : b.sex === 'female' ? tr('female') : '—')}</b></div>
      <div class="kv"><span>${esc(tr('birth_weight'))}</span><b>${b.birthWeight ? b.birthWeight + ' g' : '—'}</b></div>`;
  }
  renderGrowth();
  renderFeeds();
  renderImm();
}
function renderGrowth() {
  const g = (state.growth || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  if (!state.baby) { $('#growthBody').innerHTML = `<p class="empty">${esc(tr('baby_empty'))}</p>`; return; }
  if (!g.length) { $('#growthBody').innerHTML = `<p class="empty">${esc(tr('no_growth'))}</p><button class="btn soft full" data-sheet="growth">${esc(tr('log'))}</button>`; return; }
  const latest = g[0];
  const max = Math.max(...g.slice(0, 7).map(x => Number(x.weight) || 0), 1);
  const bars = g.slice(0, 7).reverse().map(x => {
    const h = Math.max(8, Math.round((Number(x.weight) || 0) / max * 52));
    return `<div class="bar ${x === latest ? 'hi' : ''}" style="height:${h}px"><span>${(Number(x.weight) / 1000).toFixed(1)}</span></div>`;
  }).join('');
  $('#growthBody').innerHTML = `
    <div class="kv"><span>${esc(tr('weight'))}</span><b>${(Number(latest.weight) || 0) / 1000} kg</b></div>
    <div class="kv"><span>${esc(tr('height'))}</span><b>${latest.height || '—'} cm</b></div>
    <div class="kv"><span>${esc(tr('head_circ'))}</span><b>${latest.head || '—'} cm</b></div>
    <div class="bar-wrap"><div class="bar-chart">${bars}</div></div>
    <div class="legend"><span><i style="background:var(--pink)"></i>${esc(tr('chart'))}</span></div>
    <button class="btn soft full" data-sheet="growth" style="margin-top:12px">${esc(tr('log'))}</button>`;
}
function renderFeeds() {
  const t = todayISO();
  const todayFeeds = (state.feeds || []).filter(f => (f.at || '').slice(0, 10) === t);
  $('#feedToday') && ($('#feedToday').textContent = todayFeeds.length + ' today');
  const last = (state.feeds || []).slice(-5).reverse();
  $('#feedList').innerHTML = last.length ? last.map(f => `
    <div class="item"><div class="ib">${f.type === 'Bottle' ? '🍼' : f.type === 'Solids' ? '🥣' : '🤱'}</div>
    <div class="im"><b>${esc(f.type)}</b><span>${new Date(f.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div></div>`).join('')
    : `<p class="empty">${esc(tr('no_feeds'))}</p>`;
}
function renderImm() {
  if (!state.baby) { $('#immList').innerHTML = `<p class="empty">${esc(tr('baby_empty'))}</p>`; return; }
  const dob = state.baby.dob;
  $('#immList').innerHTML = IMM.map(d => {
    const due = addDays(dob, d.age);
    const done = !!(state.imm || {})[d.key];
    const late = !done && due && due < todayISO();
    return `<div class="item">
      <div class="ib">💉</div>
      <div class="im"><b>${esc(d.name[state.lang] || d.name.en)}</b><span>${esc(tr('due'))}: ${fmtDate(due)}</span></div>
      <button class="check ${done ? 'on' : ''}" data-imm="${d.key}" aria-label="mark given">${done ? '✓' : ''}</button>
      ${late && !done ? `<span class="tag over">${esc(tr('overdue'))}</span>` : ''}
    </div>`;
  }).join('');
}

/* ---------------- CHAT ENGINE ---------------- */
const DANGER = [
  { id: 'bleed', re: /(heavy bleeding|bleeding|blood clot|haemorrhage|hemorrhage|रक्तस्राव|खून|রক্তক্ষরণ|রক্তপাত)/, level: 'er', label: { en: 'vaginal bleeding', hi: 'योनि से रक्तस्राव', bn: 'যোনি থেকে রক্তপাত' } },
  { id: 'spot', re: /(spotting|light bleeding|हल्का रक्तस्राव|হালকা রক্তপাত)/, level: 'ur', label: { en: 'light spotting', hi: 'हल्का रक्तस्राव', bn: 'হালকা রক্তপাত' } },
  { id: 'head', re: /(severe headache|worst headache|blurred vision|vision loss|flashing lights|धुंधला दिख|तेज़ सिरदर्द|तेज सिरदर्द|ঝাপসা|তীব্র মাথাব্যথা)/, level: 'er', label: { en: 'severe headache or vision changes', hi: 'तेज़ सिरदर्द या दृष्टि बदलाव', bn: 'তীব্র মাথাব্যথা বা দৃষ্টি পরিবর্তন' } },
  { id: 'fits', re: /(convulsion|seizure|fits|खिँच|दौरा|খিঁচুনি)/, level: 'er', label: { en: 'fits or convulsions', hi: 'दौरे', bn: 'খিঁচুনি' } },
  { id: 'chest', re: /(chest pain|breathless|shortness of breath|can.?t breathe|सीने में दर्द|साँस|বুকে ব্যথা|শ্বাসকষ্ট)/, level: 'er', label: { en: 'chest pain or difficulty breathing', hi: 'सीने में दर्द या साँस लेने में कठिनाई', bn: 'বুকে ব্যথা বা শ্বাসকষ্ট' } },
  { id: 'move', re: /(reduced (fetal )?movement|baby (is )?not moving|no movement|movement (has )?(reduced|decreased|stopped)|less kicking|हलचल कम|हिलना बंद|নড়াচড়া কম)/, level: 'er', label: { en: 'reduced baby movement', hi: 'शिशु की हलचल कम', bn: 'শিশুর নড়াচড়া কম' } },
  { id: 'water', re: /(waters? (has )?broken|water broke|fluid leak|leaking fluid|पानी की थैली|पानी निकल|পানি ভাঙ|পানি ঝরা)/, level: 'er', label: { en: 'waters breaking / fluid leak', hi: 'पानी की थैली फटना', bn: 'পানি ভাঙা' } },
  { id: 'uncon', re: /(unconscious|fainted|fainting|passed out|बेहोश|অচেতন)/, level: 'er', label: { en: 'fainting or unconsciousness', hi: 'बेहोशी', bn: 'অচেতন' } },
  { id: 'self', re: /(suicid|kill myself|harm myself|end my life|आत्महत्या|खुद को नुकसान|আত্মহত্যা)/, level: 'er', label: { en: 'thoughts of self-harm', hi: 'खुद को नुकसान पहुँचाने के विचार', bn: 'নিজের ক্ষতি করার ভাবনা' } },
  { id: 'pre', re: /(swelling (of|in) (face|hands)|face swelling|hand swelling|सूजन|ফোলা)/, level: 'ur', label: { en: 'sudden swelling of face or hands', hi: 'चेहरे या हाथों में अचानक सूजन', bn: 'মুখ বা হাতে হঠাৎ ফোলা' } },
  { id: 'pain', re: /(severe abdominal pain|severe stomach pain|bad stomach pain|तेज़ पेट दर्द|तेज पेट दर्द|তীব্র পেটে ব্যথা)/, level: 'ur', label: { en: 'severe abdominal pain', hi: 'तेज़ पेट दर्द', bn: 'তীব্র পেটে ব্যথা' } },
  { id: 'fever', re: /(high fever|fever (above|over)|103|104|तेज़ बुखार|तेज बुखार|উচ্চ জ্বর|তীব্র জ্বর)/, level: 'ur', label: { en: 'high fever', hi: 'तेज़ बुखार', bn: 'উচ্চ জ্বর' } },
  { id: 'vomit', re: /(can.?t keep (anything|water) down|vomiting (a lot|blood)|uncontrollable vomit|बार-बार उल्टी|रक्त उल्टी|বারবার বমি|রক্ত বমি)/, level: 'ur', label: { en: 'severe vomiting', hi: 'बार-बार उल्टी', bn: 'তীব্র বমি' } },
  { id: 'babyfeed', re: /(baby (is )?not feeding|baby won.?t feed|not latching|baby very sleepy|शिशु दूध नहीं|শিশু দুধ খাচ্ছে না)/, level: 'er', label: { en: 'baby not feeding', hi: 'शिशु दूध नहीं ले रहा', bn: 'শিশু দুধ খাচ্ছে না' } },
  { id: 'babybreath', re: /(fast breathing|grunting|chest indrawing|blue lips|baby.?s lips? (are )?blue|तेज़ साँस|नीले होंठ|দ্রুত শ্বাস|নীল ঠোঁট)/, level: 'er', label: { en: 'baby breathing difficulty', hi: 'शिशु को साँस लेने में कठिनाई', bn: 'শিশুর শ্বাসকষ্ট' } },
  { id: 'jaundice', re: /(jaundice|yellow (skin|eyes)|पीलिया|পিলে|জন্ডিস)/, level: 'ur', label: { en: 'jaundice (yellow skin/eyes)', hi: 'पीलिया', bn: 'জন্ডিস' } }
];

const EMERGENCY_WORDS = /(ambulance|dying|not breathing|unconscious|collapsed|मर रह|एम्बुलेंस|মরে যাচ্ছি|অ্যাম্বুলেন্স)/i;

function negated(text, m) {
  const i = text.indexOf(m[0]);
  if (i < 0) return false;
  const pre = text.slice(Math.max(0, i - 30), i).toLowerCase();
  return /(no|not|without|never|denies|nahi|nahin|नहीं|ना|নেই|না)\s*$/.test(pre);
}

function triage(text) {
  const s = ' ' + text.toLowerCase() + ' ';
  const hits = [];
  DANGER.forEach(d => {
    const m = s.match(d.re);
    if (m && !negated(s, m)) hits.push(d);
  });
  const er = hits.filter(h => h.level === 'er');
  const ur = hits.filter(h => h.level === 'ur');
  if (EMERGENCY_WORDS.test(s) && !hits.length) return { level: 'er', hits: [], forced: true };
  if (er.length) return { level: 'er', hits: er.concat(ur) };
  if (ur.length) return { level: 'ur', hits: ur };
  if (EMERGENCY_WORDS.test(s)) return { level: 'er', hits: [], forced: true };
  return { level: 'none', hits: [] };
}

function emergencyHTML(hits) {
  let labels = hits.map(h => h.label[state.lang] || h.label.en);
  if (!labels.length) labels = [L('a possible emergency', 'संभावित आपातकाल', 'সম্ভাব্য জরুরি অবস্থা')];
  return `<b>⚠️ This may be an emergency.</b><br>You mentioned <b>${labels.map(esc).join(', ')}</b>.<br><br>
    <b>Do this now:</b>
    <ul>
      <li>Call <b>102</b> (ambulance) or go to the nearest hospital emergency department.</li>
      <li>Do not wait for your next appointment.</li>
      <li>Ask someone to stay with you and take your ANC card and reports.</li>
    </ul><br><i>I can't examine you. Please get real medical help now.</i>`;
}
function urgentHTML(hits) {
  const labels = hits.map(h => h.label[state.lang] || h.label.en);
  return `<b>Please see a doctor today.</b><br>You mentioned <b>${labels.map(esc).join(', ')}</b>. This needs a check-up rather than home remedies.<br><br>
    <b>While you arrange care:</b>
    <ul><li>Rest and keep drinking water.</li><li>Note your temperature and any new symptoms.</li><li>If it gets worse, go to emergency or call <b>102</b>.</li></ul>`;
}

function topicReply(raw) {
  const s = ' ' + raw.toLowerCase() + ' ';
  const w = dueWeek();
  const has = re => re.test(s);

  if (has(/(iron|anaemia|anemia|haemoglobin|hemoglobin|आयरन|खून की कमी|রক্তশূন্য)/)) {
    return { kind: 'info', html: `<b>Iron-rich eating</b><br>Your blood volume rises a lot in pregnancy, so iron matters.<br>
      <ul><li><b>Sources:</b> spinach, lentils/dal, chickpeas, beans, tofu, fortified cereals, eggs, lean meat and fish.</li>
      <li><b>Boost absorption:</b> pair with vitamin C — lemon, orange, amla, tomato, bell pepper.</li>
      <li><b>Avoid:</b> tea or coffee with meals (tannins block iron). Keep a gap of about an hour.</li>
      <li>Take iron tablets with water, not milk. Constipation is common — add fibre and water.</li></ul>
      <i>If you feel very tired, breathless or pale, ask your doctor for a haemoglobin test.</i>` };
  }
  if (has(/(danger|warning|emergency|red flag|खतरा|चेतावनी|বিপদ|সতর্ক)/)) {
    return { kind: 'warn', html: `<b>Warning signs that need care right away</b><br>
      <ul><li>Any vaginal bleeding or fluid leak</li><li>Severe headache, blurred vision, or sudden swelling of face/hands</li>
      <li>Fits, chest pain, or trouble breathing</li><li>Baby's movements reduced or stopped</li>
      <li>High fever, severe abdominal pain, or heavy vomiting</li></ul>
      If any of these happen, go to the nearest hospital or call <b>102</b>. Do not wait.` };
  }
  if (has(/(movement|kick|kicks|हलचल|किक|নড়াচড়া|কিক)/)) {
    return { kind: 'info', html: `<b>Counting baby's movements</b><br>From about 28 weeks, pick a time when your baby is usually active and lie on your left side.<br>
      <ul><li>Count until you feel <b>10 movements</b> — kicks, rolls or flutters.</li>
      <li>Most people reach 10 within 2 hours.</li>
      <li>If movements are clearly less than usual, or stop, <b>call your doctor or go to hospital the same day</b>.</li></ul>
      Never wait overnight to "see if it improves".` };
  }
  if (has(/(nausea|morning sickness|vomit|उल्टी|मतली|বমি|বমি বমি)/)) {
    return { kind: 'info', html: `<b>Nausea and vomiting</b><br>
      <ul><li>Eat small amounts often — an empty stomach makes nausea worse.</li>
      <li>Try dry toast, crackers, banana, rice, or ginger tea before getting out of bed.</li>
      <li>Sip water through the day rather than large amounts at once.</li>
      <li>Avoid strong smells and oily food.</li></ul>
      <b>See a doctor</b> if you cannot keep any food or water down, are losing weight, or vomit blood.` };
  }
  if (has(/(back ?pain|backache|कमर दर्द|পিঠে ব্যথা)/)) {
    return { kind: 'info', html: `<b>Back pain in pregnancy</b><br>
      <ul><li>Keep knees bent when lifting; avoid heavy loads.</li>
      <li>Sleep on your side with a pillow between your knees.</li>
      <li>Warm compress and gentle stretching can help. Avoid very hot packs on the belly.</li>
      <li>Supportive footwear and good posture reduce strain.</li></ul>
      <b>Get urgent care</b> if back pain comes with fever, bleeding, or reduced baby movement.` };
  }
  if (has(/(sleep|insomnia|नींद|ঘুম)/)) {
    return { kind: 'info', html: `<b>Sleep in pregnancy</b><br>
      <ul><li>Sleep on your side, ideally the left, from the second trimester.</li>
      <li>Keep a regular bedtime and dim screens an hour before.</li>
      <li>Leg cramps: stretch your calf gently before bed.</li>
      <li>Heartburn: avoid heavy meals within 2–3 hours of lying down.</li></ul>
      Loud snoring with daytime sleepiness is worth mentioning to your doctor.` };
  }
  if (has(/(exercise|yoga|walk|व्यायाम|योग|টহল|ব্যায়াম|যোগ)/)) {
    return { kind: 'info', html: `<b>Staying active</b><br>If your pregnancy is uncomplicated, about <b>30 minutes of moderate activity</b> most days is good.<br>
      <ul><li>Walking, prenatal yoga and swimming are excellent.</li>
      <li>You should be able to talk while exercising.</li>
      <li>Avoid contact sports, high-altitude activity and lying flat on your back for long.</li></ul>
      Stop and call your doctor for bleeding, contractions, dizziness or fluid leak.` };
  }
  if (has(/(breastfeed|breast feed|feeding|स्तनपान|দুধ|বুকের দুধ)/)) {
    return { kind: 'info', html: `<b>Breastfeeding basics</b><br>
      <ul><li>Start skin-to-skin within the first hour after birth if possible.</li>
      <li>Exclusive breastfeeding for the first <b>6 months</b> — no water needed, even in summer.</li>
      <li>Feed on demand, at least 8–12 times in 24 hours in the early weeks.</li>
      <li>Good latch: wide mouth, chin to breast, no nipple pain after the first few seconds.</li></ul>
      <b>Get help the same day</b> if feeding is painful, the baby is very sleepy, or urine output drops.` };
  }
  if (has(/(formula|top feed|bottle|फॉर्मूला|बोतल|ফর্মুলা|বোতল)/)) {
    return { kind: 'info', html: `<b>If you use formula</b><br>
      <ul><li>Follow the tin's instructions exactly — do not over-dilute.</li>
      <li>Use clean, boiled-then-cooled water and sterilise bottles.</li>
      <li>Hold the baby close during feeds; never prop the bottle.</li>
      <li>Discard leftover milk after one hour.</li></ul>
      Breast milk remains the best first choice where possible. Ask a nurse or lactation counsellor for support.` };
  }
  if (has(/(vaccine|vaccination|immuni|tika|टीका|টিকা)/)) {
    return { kind: 'info', html: `<b>Immunisation</b><br>India's schedule starts at birth (BCG, OPV-0, Hep B) and continues at 6, 10 and 14 weeks, then 9 and 15 months.<br>
      <ul><li>Keep the immunisation card safe and take it to every visit.</li>
      <li>Mild fever or soreness after a shot is common.</li>
      <li>If a dose is missed, it can usually be caught up — ask your health worker.</li></ul>
      Open the <b>Baby</b> tab to see doses timed to your baby's date of birth.` };
  }
  if (has(/(water|hydrat|पानी|পানি)/) && !has(/(break|leak|bag)/)) {
    return { kind: 'info', html: `<b>Hydration</b><br> Aim for about <b>8–10 glasses</b> of water a day, more in heat or with vomiting.<br>
      <ul><li>Pale yellow urine is a good sign of enough fluid.</li>
      <li>Coconut water, lemon water and buttermilk can count.</li>
      <li>Limit sugary drinks and very strong tea/coffee.</li></ul>
      <b>Call your doctor</b> if you cannot keep fluids down or your urine becomes very dark.` };
  }
  if (has(/(weight|वज़न|ওজন)/)) {
    return { kind: 'info', html: `<b>Weight gain</b><br>Healthy gain depends on your starting BMI — commonly about <b>11–16 kg</b> for a normal BMI, less if you start with a higher BMI.<br>
      <ul><li>You do not need to "eat for two". Add roughly 300–350 extra calories a day in the second trimester.</li>
      <li>Quality matters: dal, eggs, milk, fruit, vegetables, whole grains.</li></ul>
      Your doctor will track your own healthy range at antenatal visits.` };
  }
  if (has(/(bp|blood pressure|preeclamp|pre-eclamp|बीपी|रक्तचाप|প্রেশার)/)) {
    return { kind: 'warn', html: `<b>Blood pressure and pre-eclampsia</b><br>Warning signs of pre-eclampsia include:<br>
      <ul><li>Severe headache that won't go away</li><li>Blurred vision or flashing lights</li>
      <li>Sudden swelling of face or hands</li><li>Pain under the ribs on the right</li></ul>
      Any of these need <b>same-day medical assessment</b> — do not wait.` };
  }
  if (has(/(sugar|diabetes|gdm|शुगर|मधुमेह|ডায়াবেটিস|সুগার)/)) {
    return { kind: 'info', html: `<b>Gestational diabetes</b><br>
      <ul><li>Usually checked with a glucose test around 24–28 weeks.</li>
      <li>Plate method: half vegetables, a quarter protein, a quarter whole grains.</li>
      <li>Walk after meals; keep regular meal times.</li>
      <li>Avoid sugary drinks and refined sweets.</li></ul>
      If testing shows high sugar, follow your doctor's plan — it protects you and your baby.` };
  }
  if (has(/(stress|anxiety|depress|mental|तनाव|चिंता|উদ্বেগ|হতাশা|মানসিক)/)) {
    return { kind: 'info', html: `<b>Your mental health matters</b><br>Mood changes are common, but lasting sadness or anxiety deserves support.<br>
      <ul><li>Tell your doctor or a trusted person how you feel.</li>
      <li>Rest when you can, eat regularly, and accept help.</li>
      <li>Gentle movement and daylight help mood.</li></ul>
      <b>If you feel like harming yourself or your baby, get help immediately</b> — call a trusted person and go to emergency. You are not alone.` };
  }
  if (has(/(sex|intercourse|संभोग|যৌন)/)) {
    return { kind: 'info', html: `<b>Sex in pregnancy</b><br>For an uncomplicated pregnancy, sex is generally safe. Avoid it if you have bleeding, a low-lying placenta, or your doctor has advised against it. Never worry about asking your doctor — it is a normal question.` };
  }
  if (has(/(travel|यात्रा|ভ্রমণ)/)) {
    return { kind: 'info', html: `<b>Travel</b><br>
      <ul><li>Usually safest in the second trimester.</li>
      <li>On long trips, walk and stretch every 1–2 hours and drink water.</li>
      <li>Wear a seatbelt with the lap belt under your bump.</li>
      <li>Carry your ANC card and medicines.</li></ul>
      Ask your doctor before travelling after 36 weeks or if you have complications.` };
  }
  if (has(/(saffron|kesar|जाफरान|জাফরান|papaya|पपीता|পেঁপে|ghee|घी|ঘি|honey|शहद|মধু|ghutti|massage|मालिश|ম্যাসাজ)/)) {
    return { kind: 'info', html: `<b>Traditional practices</b><br>Some are harmless, some are not.<br>
      <ul><li><b>Saffron in milk:</b> small culinary amounts are fine, but it does not lighten baby's skin. That claim is a myth.</li>
      <li><b>Raw papaya:</b> avoid — unripe papaya latex can trigger contractions.</li>
      <li><b>Ghee:</b> fine in small amounts; it is high in saturated fat.</li>
      <li><b>Honey for newborns:</b> <b>never</b> under 12 months — risk of infant botulism.</li>
      <li><b>Ghutti/gripe water:</b> avoid; some contain alcohol, honey or unsafe herbs.</li></ul>
      Open <b>Learn → Tradition vs evidence</b> for details.` };
  }
  if (has(/(due|appointment|visit|checkup|next|calendar|अगला|পরবর্তী)/)) {
    const open = state.tasks.filter(t => !t.done).sort((a, b) => (a.due || '').localeCompare(b.due || '')).slice(0, 3);
    return { kind: 'info', html: open.length
      ? `<b>Coming up</b><br><ul>${open.map(t => `<li>${esc(t.title)} — ${fmtDate(t.due)}</li>`).join('')}</ul>Open <b>More → Care calendar</b> to add or mark things done.`
      : `<b>Nothing pending</b><br>You're all caught up. Add reminders in <b>More → Care calendar</b>.` };
  }
  if (has(/(hello|hi|hey|namaste|नमस्ते|নমস্কার)/)) {
    return { kind: 'info', html: `Hello ${esc(state.name || 'Mama')} 👋 I can help with symptoms, food, danger signs, baby feeding, growth, vaccines and traditions.<br>What would you like to know?` };
  }
  if (has(/(week|सप्ताह|সপ্তাহ)/)) {
    return { kind: 'info', html: `<b>Week ${w}</b> — trimester ${trimesterOf(w)}.<br>Your baby is growing steadily. Keep taking iron and folic acid, eat iron-rich foods with vitamin C, and attend your antenatal visits.<br>Ask me about any symptom you are feeling.` };
  }
  return { kind: 'info', html: `<b>I'm not fully sure about that one.</b><br>I can help with:<br>
    <ul><li>Symptoms and danger signs</li><li>Iron, diet and hydration</li><li>Baby movements and kick counting</li>
    <li>Breastfeeding and baby feeding</li><li>Vaccines and check-ups</li><li>Traditions vs evidence</li></ul>
    For a personal medical question, please ask your doctor or nurse. If anything feels urgent, open <b>Safety</b> or call <b>102</b>.` };
}

function reply(raw) {
  const t = triage(raw);
  if (t.level === 'er') return { kind: 'danger', html: emergencyHTML(t.hits) };
  if (t.level === 'ur') return { kind: 'warn', html: urgentHTML(t.hits) };
  return topicReply(raw);
}

/* ---------------- CHAT UI ---------------- */
const CHIPS = {
  en: ['Is spotting normal?', 'Iron-rich foods', 'Baby not moving', 'Safe in pregnancy?', 'Vaccine schedule'],
  hi: ['हल्का रक्तस्राव सामान्य?', 'आयरन वाले खाद्य', 'शिशु हिल नहीं रहा', 'क्या सुरक्षित है?', 'टीका सूची'],
  bn: ['হালকা রক্তপাত স্বাভাবিক?', 'আয়রন-rich খাবার', 'শিশু নড়ছে না', 'কী নিরাপদ?', 'টিকার সূচি']
};
function welcomeMsg() {
  return {
    role: 'ai',
    html: `Hello ${esc(state.name || 'Mama')} 👋 I'm your Maternacare assistant.<br>Ask me about symptoms, food, baby movements or traditions. I check for danger signs first — and I never replace your doctor.`
  };
}
function renderChat() {
  if (!state.chat.length) state.chat.push(welcomeMsg());
  const log = $('#chatLog');
  log.innerHTML = state.chat.map(m => `<div class="msg ${m.role === 'me' ? 'me' : 'ai'} ${m.kind || ''}">${m.role === 'me' ? esc(m.text) : m.html}</div>`).join('');
  $('#chatChips').innerHTML = (CHIPS[state.lang] || CHIPS.en).map(c => `<button class="chip">${esc(c)}</button>`).join('');
  $('#chatInput') && ($('#chatInput').placeholder = tr('chat_ph'));
  requestAnimationFrame(() => { try { window.scrollTo(0, document.body.scrollHeight); } catch (e) { } });
}
function pushMsg(m) { state.chat.push(m); if (state.chat.length > 60) state.chat = state.chat.slice(-60); save(); }
function sendChat(text) {
  text = (text || '').trim(); if (!text) return;
  pushMsg({ role: 'me', text });
  renderChat();
  const log = $('#chatLog');
  const typing = document.createElement('div');
  typing.className = 'typing'; typing.innerHTML = '<i></i><i></i><i></i>';
  log.appendChild(typing);
  try { window.scrollTo(0, document.body.scrollHeight); } catch (e) { }
  const r = reply(text);
  setTimeout(() => {
    typing.remove();
    pushMsg({ role: 'ai', html: r.html, kind: r.kind === 'danger' ? 'alert' : r.kind === 'warn' ? 'warn' : '' });
    renderChat();
    buzz(r.kind === 'danger' ? 120 : 20);
  }, 550 + Math.min(700, text.length * 12));
}

/* ---------------- LEARN / SAFETY ---------------- */
function learnItems() {
  const common = [
    { t: { en: 'Iron & folic acid', hi: 'आयरन और फोलिक एसिड', bn: 'আয়রন ও ফলিক অ্যাসিড' }, b: { en: 'Take your supplement daily, ideally with vitamin C. Avoid tea/coffee with meals. Ask for a haemoglobin check if you feel very tired.', hi: 'रोज़ सप्लीमेंट लें, विटामिन C के साथ। खाने के साथ चाय/कॉफ़ी न लें। बहुत थकान हो तो हीमोग्लोबिन जाँचें।', bn: 'প্রতিদিন সাপ্লিমেন্ট নিন, ভিটামিন C-এর সাথে। খাবারের সাথে চা/কফি নয়। খুব ক্লান্তি হলে হিমোগ্লোবিন পরীক্ষা করুন।' } },
    { t: { en: 'Warning signs', hi: 'खतरे के संकेत', bn: 'বিপদ চিহ্ন' }, b: { en: 'Bleeding, severe headache, blurred vision, fits, chest pain, reduced baby movement or fluid leak → hospital now. Call 102.', hi: 'रक्तस्राव, तेज़ सिरदर्द, धुंधला दिखना, दौरे, सीने में दर्द, हलचल कम या पानी निकलना → तुरंत अस्पताल। 102।', bn: 'রক্তপাত, তীব্র মাথাব্যথা, ঝাপসা দৃষ্টি, খিঁচুনি, বুকে ব্যথা, নড়াচড়া কম বা পানি ঝরা → এখনই হাসপাতাল। 102।' } },
    { t: { en: 'Eating well', hi: 'अच्छा भोजन', bn: 'ভালো খাওয়া' }, b: { en: 'Half your plate vegetables and fruit, a quarter protein (dal, egg, fish), a quarter whole grains. Drink 8–10 glasses of water.', hi: 'आधी थाली सब्ज़ी-फल, एक चौथाई प्रोटीन (दाल, अंडा, मछली), एक चौथाई साबुत अनाज। 8–10 गिलास पानी।', bn: 'অর্ধেক প্লেট সবজি-ফল, এক চতুর্থাংশ প্রোটিন (ডাল, ডিম, মাছ), এক চতুর্থাংশ গোটা শস্য। ৮–১০ গ্লাস পানি।' } }
  ];
  if (state.stage === 'baby' || state.stage === 'postpartum') return [
    { t: { en: 'Exclusive breastfeeding', hi: 'केवल स्तनपान', bn: 'শুধু স্তন্যপান' }, b: { en: 'Only breast milk for the first 6 months — no water, honey or ghutti. Feed 8–12 times a day, on demand.', hi: 'पहले 6 महीने केवल माँ का दूध — पानी, शहद या घुट्टी नहीं। दिन में 8–12 बार, माँगने पर।', bn: 'প্রথম ৬ মাস শুধু মায়ের দুধ — পানি, মধু বা ঘুটি নয়। দিনে ৮–১২ বার, চাহিদামতো।' } },
    { t: { en: 'Newborn danger signs', hi: 'नवजात के खतरे के संकेत', bn: 'নবজাতকের বিপদ চিহ্ন' }, b: { en: 'Not feeding, very sleepy, fast breathing, chest indrawing, blue lips, fever, or yellow skin → see a doctor immediately.', hi: 'दूध न लेना, बहुत सुस्त, तेज़ साँस, सीना धँसना, नीले होंठ, बुखार या पीली त्वचा → तुरंत डॉक्टर।', bn: 'দুধ না খাওয়া, খুব ঘুমন্ত, দ্রুত শ্বাস, বুক ডেবে যাওয়া, নীল ঠোঁট, জ্বর বা হলুদ ত্বক → এখনই ডাক্তার।' } },
    { t: { en: 'Vaccines on time', hi: 'समय पर टीके', bn: 'সময়ে টিকা' }, b: { en: 'Birth: BCG, OPV-0, Hep B. Then 6, 10 and 14 weeks, 9 and 15 months. Keep the card safe.', hi: 'जन्म: BCG, OPV-0, हेप बी। फिर 6, 10, 14 सप्ताह, 9 और 15 महीने। कार्ड संभालें।', bn: 'জন্ম: BCG, OPV-0, হেপ বি। তারপর ৬, ১০, ১৪ সপ্তাহ, ৯ ও ১৫ মাস। কার্ড রাখুন।' } },
    { t: { en: 'Your recovery', hi: 'आपकी रिकवरी', bn: 'আপনার সেরে ওঠা' }, b: { en: 'Rest when the baby sleeps, eat regularly, and accept help. Heavy bleeding, fever or severe headache after birth needs urgent care.', hi: 'जब शिशु सोए तब आराम करें, नियमित खाएँ, मदद लें। प्रसव के बाद भारी रक्तस्राव, बुखार या तेज़ सिरदर्द तत्काल देखभाल चाहता है।', bn: 'শিশু ঘুমালে বিশ্রাম নিন, নিয়মিত খান, সাহায্য নিন। প্রসবের পর ভারী রক্তপাত, জ্বর বা তীব্র মাথাব্যথা জরুরি চিকিৎসা দরকার।' } }
  ];
  return common;
}
const TRAD = [
  { q: { en: 'Saffron (kesar) in milk', hi: 'दूध में केसर', bn: 'দুধে জাফরান' }, a: { en: '<p><b>Belief:</b> makes the baby fair and healthy.</p><p><b>Evidence:</b> no evidence it changes skin colour. Small culinary amounts are not harmful, but it is not a medicine.</p><p><b>Verdict:</b> harmless in small amounts; the fairness claim is a myth.</p>', hi: '<p><b>मान्यता:</b> बच्चा गोरा-स्वस्थ होता है।</p><p><b>साक्ष्य:</b> रंग बदलने का कोई प्रमाण नहीं। थोड़ी मात्रा हानिकारक नहीं, पर दवा नहीं।</p><p><b>निष्कर्ष:</b> थोड़ा ठीक; गोरा होने की बात मिथक है।</p>', bn: '<p><b>বিশ্বাস:</b> শিশু ফর্সা ও সুস্থ হয়।</p><p><b>প্রমাণ:</b> রং বদলায় না। অল্প পরিমাণ ক্ষতিকর নয়, ওষুধও নয়।</p><p><b>সিদ্ধান্ত:</b> অল্প ঠিক; ফর্সা হওয়ার দাবি ভুল।</p>' } },
  { q: { en: 'Raw papaya', hi: 'कच्चा पपीता', bn: 'কাঁচা পেঁপে' }, a: { en: '<p><b>Belief:</b> causes miscarriage / should be avoided.</p><p><b>Evidence:</b> unripe papaya latex contains substances that can stimulate contractions. Ripe papaya in normal amounts is fine.</p><p><b>Verdict:</b> avoid raw/unripe papaya; ripe is okay.</p>', hi: '<p><b>मान्यता:</b> गर्भपात कराता है।</p><p><b>साक्ष्य:</b> कच्चे पपीते के लेटेक्स से संकुचन हो सकता है। पका पपीता सामान्य मात्रा में ठीक।</p><p><b>निष्कर्ष:</b> कच्चा न खाएँ; पका ठीक है।</p>', bn: '<p><b>বিশ্বাস:</b> গর্ভপাত ঘটায়।</p><p><b>প্রমাণ:</b> কাঁচা পেঁপের ল্যাটেক্স সংকোচন ঘটাতে পারে। পাকা পেঁপে ঠিক।</p><p><b>সিদ্ধান্ত:</b> কাঁচা নয়; পাকা ঠিক।</p>' } },
  { q: { en: 'Honey for newborns', hi: 'नवजात को शहद', bn: 'নবজাতককে মধু' }, a: { en: '<p><b>Belief:</b> honey is pure and strengthens the baby.</p><p><b>Evidence:</b> honey can contain botulism spores. Under 12 months it is unsafe.</p><p><b>Verdict:</b> <b>never</b> give honey to a baby under 1 year — not even on the pacifier.</p>', hi: '<p><b>मान्यता:</b> शहद शुद्ध और ताकतवर है।</p><p><b>साक्ष्य:</b> शहद में बोटुलिज़्म के बीजाणु हो सकते हैं। 12 महीने से कम में असुरक्षित।</p><p><b>निष्कर्ष:</b> 1 वर्ष से कम शिशु को शहद <b>कभी नहीं</b>।</p>', bn: '<p><b>বিশ্বাস:</b> মধু পবিত্র ও শক্তি দেয়।</p><p><b>প্রমাণ:</b> মধুতে বোটুলিজম স্পোর থাকতে পারে। ১২ মাসের কমে বিপজ্জনক।</p><p><b>সিদ্ধান্ত:</b> ১ বছরের কম শিশুকে মধু <b>কখনো নয়</b>।</p>' } },
  { q: { en: 'Ghutti / gripe water', hi: 'घुट्टी / ग्राइप वॉटर', bn: 'ঘুটি / গ্রাইপ ওয়াটার' }, a: { en: '<p><b>Belief:</b> helps digestion and colic.</p><p><b>Evidence:</b> no proven benefit; some products contain alcohol, honey or unsafe herbs. Newborns should only take breast milk.</p><p><b>Verdict:</b> avoid. For colic, burp well, hold upright, and ask your doctor.</p>', hi: '<p><b>मान्यता:</b> पाचन और पेट दर्द में मदद।</p><p><b>साक्ष्य:</b> लाभ प्रमाणित नहीं; कुछ में अल्कोहल, शहद या हानिकारक जड़ी-बूटी। नवजात को केवल माँ का दूध।</p><p><b>निष्कर्ष:</b> न दें। कोलिक में डॉक्टर से पूछें।</p>', bn: '<p><b>বিশ্বাস:</b> হজম ও কোলিক ভালো করে।</p><p><b>প্রমাণ:</b> প্রমাণ নেই; কিছুতে অ্যালকোহল, মধু বা ক্ষতিকর ভেষজ। নবজাতকের শুধু মায়ের দুধ।</p><p><b>সিদ্ধান্ত:</b> নয়। কোলিকে ডাক্তারকে জিজ্ঞাসা করুন।</p>' } },
  { q: { en: 'Oil massage for baby', hi: 'शिशु की तेल मालिश', bn: 'শিশুর তেল মালিশ' }, a: { en: '<p><b>Belief:</b> strengthens bones and skin.</p><p><b>Evidence:</b> gentle massage supports bonding and circulation. Use a plain edible oil; avoid harsh or medicated oils and never massage a sick baby.</p><p><b>Verdict:</b> gentle massage is fine and pleasant.</p>', hi: '<p><b>मान्यता:</b> हड्डियाँ मज़बूत।</p><p><b>साक्ष्य:</b> हल्की मालिश जुड़ाव और रक्तसंचार में मदद करती है। सादा खाद्य तेल; बीमार शिशु की मालिश न करें।</p><p><b>निष्कर्ष:</b> हल्की मालिश ठीक है।</p>', bn: '<p><b>বিশ্বাস:</b> হাড় শক্ত হয়।</p><p><b>প্রমাণ:</b> হালকা মালিশ বন্ধন ও রক্তসঞ্চালনে সাহায্য করে। সাধারণ খাদ্য তেল; অসুস্থ শিশুকে নয়।</p><p><b>সিদ্ধান্ত:</b> হালকা মালিশ ঠিক।</p>' } },
  { q: { en: 'Cord care', hi: 'नाभि की देखभाल', bn: 'নাভির যত্ন' }, a: { en: '<p><b>Belief:</b> apply oil, ash or turmeric.</p><p><b>Evidence:</b> anything on the cord increases infection risk. Keep it clean and dry, and let it fall off naturally.</p><p><b>Verdict:</b> clean and dry only. Redness, pus or foul smell → see a doctor.</p>', hi: '<p><b>मान्यता:</b> तेल, राख या हल्दी लगाएँ।</p><p><b>साक्ष्य:</b> कुछ भी लगाने से संक्रमण बढ़ता है। साफ़-सूखा रखें, अपने आप गिरने दें।</p><p><b>निष्कर्ष:</b> केवल साफ़-सूखा। लालिमा/मवाद → डॉक्टर।</p>', bn: '<p><b>বিশ্বাস:</b> তেল, ছাই বা হলুদ লাগান।</p><p><b>প্রমাণ:</b> কিছু লাগালে সংক্রমণ বাড়ে। পরিষ্কার-শুকনো রাখুন।</p><p><b>সিদ্ধান্ত:</b> শুধু পরিষ্কার-শুকনো। লালচে/পুঁজ → ডাক্তার।</p>' } }
];
const PREG_DANGER = [
  { en: 'Any vaginal bleeding', hi: 'योनि से किसी भी तरह का रक्तस्राव', bn: 'যোনি থেকে যেকোনো রক্তপাত' },
  { en: 'Severe headache or blurred vision', hi: 'तेज़ सिरदर्द या धुंधला दिखना', bn: 'তীব্র মাথাব্যথা বা ঝাপসা দৃষ্টি' },
  { en: 'Fits / convulsions', hi: 'दौरे', bn: 'খিঁচুনি' },
  { en: 'Chest pain or trouble breathing', hi: 'सीने में दर्द या साँस की तकलीफ़', bn: 'বুকে ব্যথা বা শ্বাসকষ্ট' },
  { en: 'Reduced or no baby movement', hi: 'शिशु की हलचल कम या बंद', bn: 'শিশুর নড়াচড়া কম বা বন্ধ' },
  { en: 'Fluid leaking from the vagina', hi: 'योनि से पानी निकलना', bn: 'যোনি থেকে পানি ঝরা' },
  { en: 'High fever or severe abdominal pain', hi: 'तेज़ बुखार या तेज़ पेट दर्द', bn: 'উচ্চ জ্বর বা তীব্র পেটে ব্যথা' },
  { en: 'Sudden swelling of face or hands', hi: 'चेहरे या हाथों में अचानक सूजन', bn: 'মুখ বা হাতে হঠাৎ ফোলা' }
];
const BABY_DANGER = [
  { en: 'Not feeding or too sleepy to wake', hi: 'दूध न लेना या बहुत सुस्त', bn: 'দুধ না খাওয়া বা খুব ঘুমন্ত' },
  { en: 'Fast breathing or chest indrawing', hi: 'तेज़ साँस या सीना धँसना', bn: 'দ্রুত শ্বাস বা বুক ডেবে যাওয়া' },
  { en: 'Blue lips or tongue', hi: 'नीले होंठ या जीभ', bn: 'নীল ঠোঁট বা জিহ্বা' },
  { en: 'Fever in a newborn', hi: 'नवजात में बुखार', bn: 'নবজাতকের জ্বর' },
  { en: 'Yellow skin or eyes (jaundice)', hi: 'पीली त्वचा या आँखें (पीलिया)', bn: 'হলুদ ত্বক বা চোখ (জন্ডিস)' },
  { en: 'No urine for many hours', hi: 'कई घंटे पेशाब नहीं', bn: 'অনেক ঘণ্টা প্রস্রাব নেই' },
  { en: 'Convulsions or unusual stiffness', hi: 'दौरे या असामान्य अकड़न', bn: 'খিঁচুনি বা অস্বাভাবিক শক্ত ভাব' }
];

function renderLearn() {
  $('#learnList').innerHTML = learnItems().map(x => `
    <div class="item"><div class="ib">✦</div><div class="im"><b>${esc(x.t[state.lang] || x.t.en)}</b><span>${esc(x.b[state.lang] || x.b.en)}</span></div></div>`).join('');
  $('#tradList').innerHTML = TRAD.map(x => `<details class="acc"><summary>${esc(x.q[state.lang] || x.q.en)}</summary><div class="body">${x.a[state.lang] || x.a.en}</div></details>`).join('');
}
function renderSafety() {
  $('#pregDanger').innerHTML = PREG_DANGER.map(d => `<div class="item"><div class="ib" style="background:var(--red-soft)">!</div><div class="im"><b>${esc(d[state.lang] || d.en)}</b></div></div>`).join('');
  $('#babyDanger').innerHTML = BABY_DANGER.map(d => `<div class="item"><div class="ib" style="background:var(--red-soft)">!</div><div class="im"><b>${esc(d[state.lang] || d.en)}</b></div></div>`).join('');
  renderComplications();
}

const COMPLICATIONS = [
  { name:{en:'Pre-eclampsia',hi:'प्री-एक्लेम्पसिया',bn:'প্রি-এক্লাম্পসিয়া'},
    signs:{en:'Severe headache, blurred vision, sudden swelling of face/hands, pain under the ribs, high blood pressure.',hi:'तेज़ सिरदर्द, धुंधला दिखना, चेहरे/हाथों में अचानक सूजन, पसलियों के नीचे दर्द, उच्च रक्तचाप।',bn:'তীব্র মাথাব্যথা, ঝাপসা দৃষ্টি, মুখ/হাতে হঠাৎ ফোলা, পাঁজরের নিচে ব্যথা, উচ্চ রক্তচাপ।'},
    do:{en:'Go to hospital the same day. Do not wait. Rest on your left side while you travel.',hi:'उसी दिन अस्पताल जाएँ। इंतज़ार न करें। यात्रा के दौरान बाएँ करवट लेटें।',bn:'একই দিনে হাসপাতালে যান। অপেক্ষা করবেন না। যাত্রায় বাম পাশে শুয়ে থাকুন।'},
    more:{en:'Checked at every antenatal visit by blood pressure and urine test.',hi:'हर ANC विज़िट में रक्तचाप और मूत्र जाँच से जाँचा जाता है।',bn:'প্রতিটি ANC ভিজিটে রক্তচাপ ও প্রস্রাব পরীক্ষায় চেক করা হয়।'} },
  { name:{en:'Gestational diabetes',hi:'गेस्टेशनल डायबिटीज़',bn:'গর্ভকালীন ডায়াবেটিস'},
    signs:{en:'Often no symptoms. Sometimes excessive thirst, frequent urination, tiredness.',hi:'अक्सर कोई लक्षण नहीं। कभी-कभी अत्यधिक प्यास, बार-बार पेशाब, थकान।',bn:'প্রায়ই কোনো লক্ষণ নেই। কখনো অতিরিক্ত তৃষ্ণা, বারবার প্রস্রাব, ক্লান্তি।'},
    do:{en:'Screening test around 24–28 weeks. Follow your doctor’s diet and activity plan.',hi:'24–28 सप्ताह में स्क्रीनिंग। डॉक्टर के आहार और गतिविधि प्लान का पालन करें।',bn:'২৪–২৮ সপ্তাহে স্ক্রিনিং। ডাক্তারের খাদ্য ও কার্যকলাপ পরিকল্পনা মেনে চলুন।'},
    more:{en:'Good control protects you and your baby.',hi:'अच्छा नियंत्रण आपको और शिशु को सुरक्षित रखता है।',bn:'ভালো নিয়ন্ত্রণ আপনাকে ও শিশুকে রক্ষা করে।'} },
  { name:{en:'Severe anaemia',hi:'गंभीर एनीमिया',bn:'তীব্র রক্তাল্পতা'},
    signs:{en:'Extreme tiredness, breathlessness, pale skin/lips, fast heartbeat, dizziness.',hi:'अत्यधिक थकान, साँस फूलना, फीकी त्वचा/होंठ, तेज़ दिल की धड़कन, चक्कर।',bn:'অত্যধিক ক্লান্তি, শ্বাসকষ্ট, ফ্যাকাশে ত্বক/ঠোঁট, দ্রুত হৃদস্পন্দন, মাথা ঘোরা।'},
    do:{en:'Ask for a haemoglobin test. Take iron and folic acid as prescribed. Eat iron-rich food with vitamin C.',hi:'हीमोग्लोबिन जाँच माँगें। निर्धारित आयरन और फोलिक एसिड लें। विटामिन C के साथ आयरन युक्त भोजन खाएँ।',bn:'হিমোগ্লোবিন পরীক্ষা চান। নির্ধারিত আয়রন ও ফলিক অ্যাসিড নিন। ভিটামিন C-এর সাথে আয়রন-rich খাবার খান।'},
    more:{en:'Severe anaemia raises risk of preterm birth and low birth weight.',hi:'गंभीर एनीमिया से समय से पहले जन्म और कम वज़न का खतरा बढ़ता है।',bn:'তীব্র রক্তাল্পতা সময়ের আগে জন্ম ও কম ওজনের ঝুঁকি বাড়ায়।'} },
  { name:{en:'Hyperemesis gravidarum',hi:'हाइपरएमेसिस ग्रेविडेरम',bn:'হাইপারেমেসিস গ্র্যাভিডারাম'},
    signs:{en:'Cannot keep any food or water down, weight loss, dizziness, very dark urine.',hi:'कुछ भी खाना-पीना न रुकना, वज़न घटना, चक्कर, बहुत गहरा पेशाब।',bn:'কিছুই ধরে রাখতে না পারা, ওজন কমা, মাথা ঘোরা, খুব গাঢ় প্রস্রাব।'},
    do:{en:'See a doctor the same day. You may need IV fluids. Small frequent sips and bland food may help.',hi:'उसी दिन डॉक्टर से मिलें। IV फ़्लूइड चाहिए हो सकता है। थोड़ा-थोड़ा पानी और ब्लैंड खाना।',bn:'একই দিনে ডাক্তার দেখান। IV ফ্লুইড লাগতে পারে। অল্প অল্প পানি ও হালকা খাবার।'},
    more:{en:'Not just “morning sickness” — it is a medical condition.',hi:'यह सिर्फ “morning sickness” नहीं — एक चिकित्सा स्थिति है।',bn:'এটি শুধু “morning sickness” নয় — একটি চিকিৎসা অবস্থা।'} },
  { name:{en:'Ectopic pregnancy',hi:'एक्टोपिक गर्भावस्था',bn:'এক্টোপিক গর্ভাবস্থা'},
    signs:{en:'Sharp one-sided abdominal pain, vaginal bleeding, shoulder pain, dizziness or fainting in early pregnancy.',hi:'गर्भावस्था की शुरुआत में तेज़ एक तरफ़ा पेट दर्द, योनि से रक्तस्राव, कंधे में दर्द, चक्कर या बेहोशी।',bn:'গর্ভাবস্থার শুরুতে তীব্র একপাশের পেটে ব্যথা, যোনি থেকে রক্তপাত, কাঁধে ব্যথা, মাথা ঘোরা বা অজ্ঞান।'},
    do:{en:'This is an emergency. Go to hospital immediately or call 102.',hi:'यह आपातकाल है। तुरंत अस्पताल जाएँ या 102 पर कॉल करें।',bn:'এটি জরুরি। সাথে সাথে হাসপাতালে যান বা 102-এ কল করুন।'},
    more:{en:'An egg implanted outside the uterus — needs urgent treatment.',hi:'गर्भाशय के बाहर अंडा लगना — तत्काल इलाज ज़रूरी।',bn:'জরায়ুর বাইরে ডিম্ব স্থাপন — তাৎক্ষণিক চিকিৎসা প্রয়োজন।'} },
  { name:{en:'Placenta previa',hi:'प्लेसेंटा प्रिविया',bn:'প্লাসেন্টা প্রিভিয়া'},
    signs:{en:'Painless bright-red bleeding in the second or third trimester.',hi:'दूसरी या तीसरी तिमाही में दर्द रहित चमकीला लाल रक्तस्राव।',bn:'দ্বিতীয় বা তৃতীয় ত্রৈমাসিকে ব্যথাহীন উজ্জ্বল লাল রক্তপাত।'},
    do:{en:'Any bleeding in late pregnancy needs same-day hospital assessment.',hi:'गर्भावस्था के अंत में कोई भी रक्तस्राव उसी दिन अस्पताल जाँच चाहता है।',bn:'গর্ভাবস্থার শেষে যেকোনো রক্তপাত একই দিনে হাসপাতালে পরীক্ষা দরকার।'},
    more:{en:'Placenta covers the cervix; delivery is usually by caesarean.',hi:'प्लेसेंटा गर्भाशय ग्रीवा ढकता है; प्रसव आमतौर पर सिज़ेरियन से।',bn:'প্লাসেন্টা জরায়ুমুখ ঢেকে রাখে; প্রসব সাধারণত সিজারিয়ানে।'} },
  { name:{en:'Preterm labour',hi:'समय से पहले प्रसव',bn:'সময়ের আগে প্রসব'},
    signs:{en:'Regular contractions before 37 weeks, lower back ache, pelvic pressure, fluid leak, bleeding.',hi:'37 सप्ताह से पहले नियमित संकुचन, कमर में दर्द, पेल्विक दबाव, पानी निकलना, रक्तस्राव।',bn:'৩৭ সপ্তাহের আগে নিয়মিত সংকোচন, কোমরে ব্যথা, পেলভিক চাপ, পানি ঝরা, রক্তপাত।'},
    do:{en:'Go to hospital. Lie on your left side and time the contractions.',hi:'अस्पताल जाएँ। बाएँ करवट लेटें और संकुचन का समय नोट करें।',bn:'হাসপাতালে যান। বাম পাশে শুয়ে সংকোচনের সময় নিন।'},
    more:{en:'Early care can delay birth and help the baby’s lungs mature.',hi:'जल्दी इलाज से प्रसव टल सकता है और शिशु के फेफड़े परिपक्व हो सकते हैं।',bn:'দ্রুত চিকিৎসায় প্রসব বিলম্বিত হতে পারে ও শিশুর ফুসফুস পরিপক্ক হতে পারে।'} },
  { name:{en:'Postpartum haemorrhage',hi:'प्रसवोत्तर रक्तस्राव',bn:'প্রসব-পরবর্তী রক্তপাত'},
    signs:{en:'Heavy bleeding after birth — soaking a pad in an hour, large clots, dizziness, fainting.',hi:'प्रसव के बाद भारी रक्तस्राव — एक घंटे में पैड भरना, बड़े थक्के, चक्कर, बेहोशी।',bn:'প্রসবের পর ভারী রক্তপাত — এক ঘণ্টায় প্যাড ভিজে যাওয়া, বড় থক্কা, মাথা ঘোরা, অজ্ঞান।'},
    do:{en:'Call for help immediately. Massage the lower abdomen firmly and keep breastfeeding.',hi:'तुरंत मदद बुलाएँ। निचला पेट मज़बूती से मालिश करें और स्तनपान जारी रखें।',bn:'সাথে সাথে সাহায্য ডাকুন। নিচের পেট শক্তভাবে ম্যাসাজ করুন ও স্তন্যপান চালিয়ে যান।'},
    more:{en:'Most deaths are preventable with quick action.',hi:'जल्दी कार्रवाई से अधिकांश मौतें रोकी जा सकती हैं।',bn:'দ্রুত পদক্ষেপে বেশিরভাগ মৃত্যু প্রতিরোধ করা যায়।'} }
];

function renderComplications(){
  const el = $('#compList'); if(!el) return;
  el.innerHTML = COMPLICATIONS.map(c => `
    <details class="comp">
      <summary>${esc(c.name[state.lang]||c.name.en)}</summary>
      <div class="body">
        <span class="tag2">${esc(tr('comp_signs'))}</span>
        <p>${esc(c.signs[state.lang]||c.signs.en)}</p>
        <span class="tag2" style="background:var(--mint);color:var(--mint-ink)">${esc(tr('comp_do'))}</span>
        <p>${esc(c.do[state.lang]||c.do.en)}</p>
        <p style="font-size:11.5px;color:var(--mut);margin-top:6px"><b>${esc(tr('comp_more'))}:</b> ${esc(c.more[state.lang]||c.more.en)}</p>
      </div>
    </details>`).join('');
}
/* ---------------- MORE ---------------- */
function renderMore() {
  const w = dueWeek();
  const stageName = { pregnant: tr('stage_pregnant'), postpartum: tr('stage_postpartum'), baby: tr('stage_baby'), planning: tr('stage_planning') }[state.stage] || tr('stage_pregnant');
  $('#profileCard').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <div class="avatar">${esc((state.name || 'M').slice(0, 1).toUpperCase())}</div>
      <div><b style="font-size:16px">${esc(state.name || 'Mama')}</b><br><span style="font-size:12px;color:var(--mut)">${esc(stageName)}${state.stage === 'pregnant' ? ' · ' + esc(tr('week')) + ' ' + w : ''}</span></div>
      <button class="btn ghost sm" style="margin-left:auto" data-sheet="profile">${esc(tr('edit'))}</button>
    </div>
    <div class="kv"><span>${esc(tr('stage_lbl'))}</span><b>${esc(stageName)}</b></div>
    <div class="kv"><span>${esc(tr('edd'))}</span><b>${state.stage === 'pregnant' ? fmtDate(dueEDD()) : tr('not_set')}</b></div>
    <div class="kv"><span>${esc(tr('baby'))}</span><b>${state.baby ? esc(state.baby.name) : tr('not_set')}</b></div>
    <div class="kv"><span>${esc(tr('lang_lbl'))}</span><b>${state.lang === 'en' ? 'English' : state.lang === 'hi' ? 'हिन्दी' : 'বাংলা'}</b></div>`;
  renderTasks('#allTasks');
}

/* ---------------- SHEETS ---------------- */
function openSheet(kind) {
  const body = $('#sheetBody'); const title = $('#sheetTitle'); const sub = $('#sheetSub');
  sub.textContent = '';
  if (kind === 'profile') {
    const first = !state.onboarded;
    title.textContent = first ? tr('welcome_title') : tr('edit_profile');
    sub.textContent = first ? tr('welcome_sub') : '';
    body.innerHTML = `
      <div class="field"><label>${esc(tr('your_name'))}</label><input class="inp" id="fName" value="${esc(state.name)}" maxlength="40"/></div>
      <div class="field"><label>${esc(tr('stage_lbl'))}</label><select class="inp" id="fStage">
        <option value="pregnant" ${state.stage === 'pregnant' ? 'selected' : ''}>${esc(tr('stage_pregnant'))}</option>
        <option value="postpartum" ${state.stage === 'postpartum' ? 'selected' : ''}>${esc(tr('stage_postpartum'))}</option>
        <option value="baby" ${state.stage === 'baby' ? 'selected' : ''}>${esc(tr('stage_baby'))}</option>
        <option value="planning" ${state.stage === 'planning' ? 'selected' : ''}>${esc(tr('stage_planning'))}</option></select></div>
      <div id="pregOnly" style="${state.stage === 'pregnant' ? '' : 'display:none'}">
        <div class="row">
          <div class="field"><label>${esc(tr('lmp_lbl'))}</label><input class="inp" type="date" id="fLmp" value="${esc(state.lmp)}"/></div>
          <div class="field"><label>${esc(tr('edd_lbl'))}</label><input class="inp" type="date" id="fEdd" value="${esc(state.edd)}"/></div>
        </div>
        <div class="field"><label>${esc(tr('week'))}</label><input class="inp" type="number" min="1" max="42" id="fWeek" value="${dueWeek()}"/></div>
      </div>
      <div class="field"><label>${esc(tr('lang_lbl'))}</label><select class="inp" id="fLang">
        <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
        <option value="hi" ${state.lang === 'hi' ? 'selected' : ''}>हिन्दी</option>
        <option value="bn" ${state.lang === 'bn' ? 'selected' : ''}>বাংলা</option></select></div>
      <button class="btn primary full" id="fSave">${esc(first ? tr('start') : tr('save'))}</button>`;
    $('#fStage').addEventListener('change', e => { $('#pregOnly').style.display = e.target.value === 'pregnant' ? '' : 'none'; });
    $('#fSave').addEventListener('click', () => {
      state.onboarded = true;
      state.name = ($('#fName').value || 'Mama').trim().slice(0, 40);
      state.stage = $('#fStage').value;
      state.lmp = $('#fLmp') ? $('#fLmp').value : state.lmp;
      state.edd = $('#fEdd') ? $('#fEdd').value : state.edd;
      state.week = $('#fWeek') ? Number($('#fWeek').value) || state.week : state.week;
      const nl = $('#fLang').value; const changed = nl !== state.lang; state.lang = nl;
      save(); closeSheet(); toast(tr('toast_saved')); applyLang(); if (changed) go('home');
    });
  } else if (kind === 'baby') {
    title.textContent = state.baby ? tr('baby_profile') : tr('add_baby');
    const b = state.baby || { name: '', dob: todayISO(), sex: '', birthWeight: '' };
    body.innerHTML = `
      <div class="field"><label>${esc(tr('baby_name'))}</label><input class="inp" id="bName" value="${esc(b.name)}" maxlength="30"/></div>
      <div class="field"><label>${esc(tr('dob'))}</label><input class="inp" type="date" id="bDob" value="${esc(b.dob)}"/></div>
      <div class="row">
        <div class="field"><label>${esc(tr('sex'))}</label><select class="inp" id="bSex">
          <option value="" ${!b.sex ? 'selected' : ''}>—</option>
          <option value="male" ${b.sex === 'male' ? 'selected' : ''}>${esc(tr('male'))}</option>
          <option value="female" ${b.sex === 'female' ? 'selected' : ''}>${esc(tr('female'))}</option></select></div>
        <div class="field"><label>${esc(tr('birth_weight'))}</label><input class="inp" type="number" inputmode="numeric" id="bWeight" value="${b.birthWeight || ''}"/></div>
      </div>
      <button class="btn primary full" id="bSave">${esc(tr('save'))}</button>`;
    $('#bSave').addEventListener('click', () => {
      const name = ($('#bName').value || '').trim();
      if (!name) { toast(tr('baby_name')); return; }
      state.baby = { name, dob: $('#bDob').value || todayISO(), sex: $('#bSex').value, birthWeight: Number($('#bWeight').value) || '' };
      if (state.stage === 'pregnant' || state.stage === 'planning') state.stage = 'baby';
      save(); closeSheet(); toast(tr('toast_baby')); renderAll();
    });
  } else if (kind === 'growth') {
    title.textContent = tr('growth');
    body.innerHTML = `
      <div class="field"><label>${esc(tr('dob'))}</label><input class="inp" type="date" id="gDate" value="${todayISO()}"/></div>
      <div class="row">
        <div class="field"><label>${esc(tr('weight'))} (g)</label><input class="inp" type="number" inputmode="numeric" id="gWeight" required/></div>
        <div class="field"><label>${esc(tr('height'))} (cm)</label><input class="inp" type="number" step="0.1" id="gHeight"/></div>
      </div>
      <div class="field"><label>${esc(tr('head_circ'))} (cm)</label><input class="inp" type="number" step="0.1" id="gHead"/></div>
      <button class="btn primary full" id="gSave">${esc(tr('save'))}</button>`;
    $('#gSave').addEventListener('click', () => {
      const w = Number($('#gWeight').value);
      if (!w) { toast(tr('weight')); return; }
      state.growth.push({ date: $('#gDate').value || todayISO(), weight: w, height: $('#gHeight').value, head: $('#gHead').value });
      save(); closeSheet(); toast(tr('toast_growth')); renderBaby();
    });
  } else if (kind === 'task') {
    title.textContent = tr('add_task');
    body.innerHTML = `
      <div class="field"><label>${esc(tr('task_title'))}</label><input class="inp" id="tTitle" maxlength="60"/></div>
      <div class="field"><label>${esc(tr('task_due'))}</label><input class="inp" type="date" id="tDue" value="${addDays(todayISO(), 7)}"/></div>
      <button class="btn primary full" id="tSave">${esc(tr('save'))}</button>`;
    $('#tSave').addEventListener('click', () => {
      const t = ($('#tTitle').value || '').trim(); if (!t) { toast(tr('task_title')); return; }
      state.tasks.push({ id: 't' + Math.random().toString(36).slice(2, 8), title: t, due: $('#tDue').value || todayISO(), done: false, icon: '▦' });
      save(); closeSheet(); toast(tr('toast_saved')); renderMore(); renderHome();
    });
  }
  $('#mask').classList.add('on'); $('#sheetBox').classList.add('on'); document.body.style.overflow = 'hidden';
}
function closeSheet() {
  $('#mask').classList.remove('on'); $('#sheetBox').classList.remove('on'); document.body.style.overflow = '';
}

/* ---------------- EVENTS ---------------- */
document.addEventListener('click', e => {
  const goEl = e.target.closest('[data-go]');
  if (goEl) { e.preventDefault(); go(goEl.dataset.go); return; }
  const langEl = e.target.closest('[data-lang]');
  if (langEl) { state.lang = langEl.dataset.lang; save(); applyLang(); toast(state.lang === 'en' ? 'English' : state.lang === 'hi' ? 'हिन्दी' : 'বাংলা'); return; }
  const sheetEl = e.target.closest('[data-sheet]');
  if (sheetEl) { openSheet(sheetEl.dataset.sheet); return; }

  // tracker
  const trBtn = e.target.closest('[data-tr]');
  if (trBtn) {
    const t = todayTracker(); const k = trBtn.dataset.tr; const d = Number(trBtn.dataset.d);
    t[k] = Math.max(0, (Number(t[k]) || 0) + d);
    if (k === 'sleep') t[k] = Math.round(t[k] * 2) / 2;
    save(); renderTracker(); return;
  }
  const moodBtn = e.target.closest('[data-mood]');
  if (moodBtn) { todayTracker().mood = moodBtn.dataset.mood; save(); renderTracker(); buzz(); return; }

  // tasks
  const taskBtn = e.target.closest('[data-task]');
  if (taskBtn) {
    const task = state.tasks.find(t => t.id === taskBtn.dataset.task);
    if (task) { task.done = !task.done; save(); renderTasks('#allTasks'); renderHome(); buzz(); }
    return;
  }

  // immunisation
  const immBtn = e.target.closest('[data-imm]');
  if (immBtn) {
    const k = immBtn.dataset.imm; state.imm[k] = !state.imm[k]; save(); renderImm(); buzz(); toast(tr('toast_saved')); return;
  }

  // feeding
  const feedBtn = e.target.closest('[data-feed]');
  if (feedBtn) {
    if (!state.baby) { toast(tr('baby_empty')); openSheet('baby'); return; }
    state.feeds.push({ type: feedBtn.dataset.feed, at: new Date().toISOString() });
    save(); renderFeeds(); buzz(); toast(tr('toast_feed')); return;
  }

  // chat chips
  const chip = e.target.closest('.chip');
  if (chip) { sendChat(chip.textContent); return; }
});

$('#mask').addEventListener('click', closeSheet);
$('#quickCheck').addEventListener('click', () => {
  const v = ($('#quickSymptom').value || '').trim();
  if (!v) return;
  const r = reply(v);
  const cls = r.kind === 'danger' ? 'risk-note red' : r.kind === 'warn' ? 'risk-note amber' : 'risk-note mint';
  $('#quickResult').innerHTML = `<div class="${cls}">${r.html}</div>`;
  buzz(r.kind === 'danger' ? 150 : 30);
});
$('#quickSymptom').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#quickCheck').click(); } });

$('#chatSend').addEventListener('click', () => { const el = $('#chatInput'); sendChat(el.value); el.value = ''; el.style.height = 'auto'; });
$('#chatInput').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#chatSend').click(); } });
$('#chatInput').addEventListener('input', e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(110, e.target.scrollHeight) + 'px'; });
$('#clearChat').addEventListener('click', () => { state.chat = []; save(); renderChat(); toast(tr('toast_reset')); });

$('#exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'maternacare-backup-' + todayISO() + '.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});
$('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const data = JSON.parse(rd.result);
      if (!data || typeof data !== 'object') throw 0;
      state = Object.assign(defaults(), data); save(); applyLang(); toast(tr('toast_imported'));
    } catch (err) { toast(tr('toast_import_fail')); }
  };
  rd.readAsText(f); e.target.value = '';
});
$('#resetBtn').addEventListener('click', () => {
  if (!confirm(tr('reset') + '?\n\n' + tr('reset_desc'))) return;
  localStorage.removeItem(KEY); state = defaults(); save(); applyLang(); toast(tr('toast_reset')); go('home');
});

/* ---------------- boot ---------------- */
// Kill any stale service worker/cache from older builds.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => { });
}
if (typeof caches !== 'undefined') {
  caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))).catch(() => { });
}

/* ---------------- AI AGENT (Gemini) ---------------- */
const DEFAULT_GEMINI_KEY = '';
const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash'];
let agentHistory = [];
let agentBusy = false;

function aiProvider() { try { return localStorage.getItem('mc_ai_provider') || 'openai'; } catch (e) { return 'openai'; } }
function aiKey() { try { return (localStorage.getItem('mc_ai_key') || localStorage.getItem('mc_gemini_key') || DEFAULT_GEMINI_KEY || '').trim(); } catch (e) { return ''; } }
function aiEndpoint() {
  try {
    const v = (localStorage.getItem('mc_ai_endpoint') || '').trim();
    if (!v || !/^https:\/\//.test(v) || !/chat\/completions/.test(v)) return 'https://api.groq.com/openai/v1/chat/completions';
    return v;
  } catch (e) { return 'https://api.groq.com/openai/v1/chat/completions'; }
}
function aiModel() { try { return localStorage.getItem('mc_ai_model') || 'qwen/qwen3.8-27b'; } catch (e) { return 'qwen/qwen3.8-27b'; } }
function setAIConfig(p, k, e, m) {
  try {
    if (p) localStorage.setItem('mc_ai_provider', p);
    if (k) localStorage.setItem('mc_ai_key', k.trim()); else localStorage.removeItem('mc_ai_key');
    if (e) localStorage.setItem('mc_ai_endpoint', e.trim());
    if (m) localStorage.setItem('mc_ai_model', m.trim());
    return true;
  } catch (err) { toast('Could not save: ' + err.message); return false; }
}
// backward compat alias
function geminiKey() { return aiKey(); }
function setGeminiKey(k) { return setAIConfig(null, k, null, null); }

const AGENT_SYSTEM = `You are Maternacare AI, a warm, calm assistant for pregnant people, new mothers and families.
Rules:
- You give health EDUCATION only. Never diagnose. Never prescribe medicines or doses.
- Always answer in the user's language (English, Hindi or Bengali) based on how they write.
- Keep answers short, kind and practical (bullet points when useful).
- For any danger sign (bleeding, severe headache/vision changes, fits, chest pain, breathing trouble, reduced baby movement, fluid leak, high fever, severe vomiting, fainting, thoughts of self-harm, baby not feeding/breathing fast/blue) tell them to seek emergency care NOW and call 102 (India) or go to the nearest hospital. Do not reassure.
- Encourage regular antenatal visits and following their own doctor.
- End with a gentle reminder that you are not a doctor.
- If asked something unrelated to pregnancy/child health, politely steer back.`;

function openAgent() {
  $('#agentOverlay').classList.add('on');
  document.body.style.overflow = 'hidden';
  renderAgentChat();
  renderAgentChips();
  setTimeout(() => { try { $('#agentInput').focus(); } catch (e) { } }, 200);
}
function closeAgent() {
  $('#agentOverlay').classList.remove('on');
  document.body.style.overflow = '';
}

function renderAgentChat() {
  const log = $('#agentLog');
  if (!agentHistory.length) {
    agentHistory.push({ role: 'model', text: `Hello ${state.name || 'Mama'} 👋 I'm your AI assistant. Ask me anything about pregnancy, baby care, food, or traditions.` });
  }
  log.innerHTML = agentHistory.map(m => {
    const isUser = m.role === 'user';
    return `<div class="msg ${isUser ? 'me' : 'ai'}">${isUser ? esc(m.text) : (m.html || esc(m.text))}</div>`;
  }).join('');
  requestAnimationFrame(() => { try { log.scrollTop = log.scrollHeight; } catch (e) { } });
}

async function agentSend(text) {
  text = (text || '').trim();
  if (!text || agentBusy) return;
  const t = triage(text);
  if (t.level === 'er') { agentHistory.push({ role: 'user', text }); agentHistory.push({ role: 'model', html: emergencyHTML(t.hits) }); renderAgentChat(); return; }
  if (t.level === 'ur') { agentHistory.push({ role: 'user', text }); agentHistory.push({ role: 'model', html: urgentHTML(t.hits) }); renderAgentChat(); return; }

  agentHistory.push({ role: 'user', text });
  renderAgentChat();
  const log = $('#agentLog');
  const typing = document.createElement('div');
  typing.className = 'typing'; typing.innerHTML = '<i></i><i></i><i></i>';
  log.appendChild(typing);
  try { log.scrollTop = log.scrollHeight; } catch (e) { }

  const key = geminiKey();
  if (!key) {
    typing.remove();
    agentHistory.push({ role: 'model', html: `${esc(tr('agent_no_key'))}<br><br><button class="btn soft sm" id="agentGoSettings">⚙ Open settings</button>` });
    renderAgentChat();
    setTimeout(() => { const b = $('#agentGoSettings'); if (b) b.addEventListener('click', () => { closeAgent(); go('more'); }); }, 50);
    return;
  }

  agentBusy = true;
  const btn = $('#agentSend'); if (btn) btn.disabled = true;
  const recent = agentHistory.filter(m => m.role === 'user' || m.role === 'model').slice(-10);
  const contents = recent.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text || (m.html ? m.html.replace(/<[^>]+>/g, ' ') : '') }]
  }));

  const provider = aiProvider();
  const recentMsgs = recent.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text || (m.html ? m.html.replace(/<[^>]+>/g, ' ') : '') }));
  let lastErr = '';
  let ok = false;
  if (provider === 'gemini') {
    for (const model of GEMINI_MODELS) {
      if (ok) break;
      for (let attempt = 0; attempt < 2 && !ok; attempt++) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: AGENT_SYSTEM }] },
              contents,
              tools: [{ google_search: {} }],
              generationConfig: { temperature: 0.5, maxOutputTokens: 700 }
            })
          });
          const data = await res.json();
          if (!res.ok) {
            lastErr = (data && data.error && data.error.message) || ('HTTP ' + res.status);
            if (res.status === 503 && attempt === 0) { await new Promise(r => setTimeout(r, 1000)); continue; }
            break;
          }
          const txt = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) || '';
          if (txt) {
            typing.remove();
            agentHistory.push({ role: 'model', html: esc(txt).replace(/\n/g, '<br/>') });
            ok = true;
          } else {
            lastErr = 'Empty response';
            break;
          }
        } catch (e) {
          lastErr = e.message || 'network error';
          if (attempt === 0) { await new Promise(r => setTimeout(r, 1000)); continue; }
          break;
        }
      }
    }
  } else {
    // OpenAI-compatible (Groq, OpenRouter, OpenAI, etc.)
    try {
      const res = await fetch(aiEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key,
          'HTTP-Referer': location.origin || 'https://drvictorbiswas-cmd.github.io',
          'X-Title': 'Maternacare AI'
        },
        body: JSON.stringify({
          model: aiModel(),
          messages: [{ role: 'system', content: AGENT_SYSTEM }].concat(recentMsgs),
          temperature: 0.5,
          max_tokens: 700
        })
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('json')) {
        const body = (await res.text()).slice(0, 120);
        throw new Error('Endpoint ' + aiEndpoint() + ' returned ' + ct + ' (HTTP ' + res.status + '): ' + body);
      }
      const data = await res.json();
      if (!res.ok) {
        lastErr = (data && data.error && (data.error.message || data.error)) || ('HTTP ' + res.status);
      } else {
        const txt = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
        if (txt) {
          typing.remove();
          agentHistory.push({ role: 'model', html: esc(txt).replace(/\n/g, '<br/>') });
          ok = true;
        } else {
          lastErr = 'Empty response';
        }
      }
    } catch (e) {
      lastErr = e.message || 'network error';
    }
  }
  if (!ok) {
    typing.remove();
    if (/quota|429|rate.limit|billing/i.test(lastErr)) {
      agentHistory.push({ role: 'model', html: `<b>Gemini's free quota is finished for now.</b><br><br>
        This is from Google, not a problem in the app. To keep using the AI assistant:<br>
        <ul><li>Wait for the quota to reset (usually next day), or</li>
        <li>Get a new key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">aistudio.google.com</a>, or</li>
        <li>Enable billing on your Google AI project.</li></ul>
        In the meantime, the <b>Ask</b> tab still works fully offline — no key or internet needed.` });
    } else {
      agentHistory.push({ role: 'model', text: tr('agent_error') + (lastErr ? ' (' + lastErr + ')' : '') });
    }
  }
  agentBusy = false;
  if (btn) btn.disabled = false;
  renderAgentChat();
  buzz(ok ? 20 : 60);
}

const AGENT_CHIPS = {
  en: ['Is this normal?', 'Iron-rich foods', 'Baby not moving', 'Vaccine schedule', 'Tradition vs evidence'],
  hi: ['Kya yeh normal hai?', 'Iron-rich foods', 'Baby nahi hil raha', 'Tika schedule', 'Parampara vs evidence'],
  bn: ['Eta ki normal?', 'Iron-rich foods', 'Baby nachchhe na', 'Tika schedule', 'Parampara vs evidence']
};
function renderAgentChips() {
  const el = $('#agentChips'); if (!el) return;
  el.innerHTML = (AGENT_CHIPS[state.lang] || AGENT_CHIPS.en).map(c => `<button class="chip">${esc(c)}</button>`).join('');
}
// Gemini key settings
function refreshGemKeyUI() {
  const prov = $('#aiProvider'); if (prov) prov.value = aiProvider();
  const ep = $('#aiEndpoint'); if (ep) ep.value = localStorage.getItem('mc_ai_endpoint') || 'https://api.groq.com/openai/v1/chat/completions';
  const md = $('#aiModel'); if (md) md.value = localStorage.getItem('mc_ai_model') || 'qwen/qwen3.8-27b';
  const el = $('#gemKey'); if (el) el.value = localStorage.getItem('mc_ai_key') || localStorage.getItem('mc_gemini_key') || '';
  const st = $('#gemStatus'); if (st) st.textContent = aiKey() ? 'Key active (' + aiProvider() + ')' : 'No key set';
  const of = $('#openaiFields'); if (of) of.style.display = aiProvider() === 'openai' ? '' : 'none';
}
$('#aiProvider') && $('#aiProvider').addEventListener('change', () => {
  const of = $('#openaiFields'); if (of) of.style.display = $('#aiProvider').value === 'openai' ? '' : 'none';
});
$('#gemSave') && $('#gemSave').addEventListener('click', () => {
  const p = $('#aiProvider') ? $('#aiProvider').value : 'gemini';
  const k = $('#gemKey') ? $('#gemKey').value : '';
  const e = $('#aiEndpoint') ? $('#aiEndpoint').value : '';
  const m = $('#aiModel') ? $('#aiModel').value : '';
  setAIConfig(p, k, e, m);
  refreshGemKeyUI();
  toast(tr('toast_saved'));
});
$('#gemClear') && $('#gemClear').addEventListener('click', () => { setGeminiKey(''); refreshGemKeyUI(); toast(tr('toast_reset')); });
$('#gemShow') && $('#gemShow').addEventListener('click', () => {
  const el = $('#gemKey'); if (!el) return;
  if (el.type === 'password') { el.type = 'text'; $('#gemShow').textContent = 'Hide key'; }
  else { el.type = 'password'; $('#gemShow').textContent = 'Show key'; }
});

async function testAIKey() {
  const key = aiKey();
  const st = $('#gemStatus');
  if (!key) { if (st) st.textContent = 'No key to test'; return; }
  if (st) st.textContent = 'Testing…';
  const prov = aiProvider();
  try {
    let ok = false, msg = '';
    if (prov === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(key)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Reply with exactly: OK' }] }], generationConfig: { maxOutputTokens: 8 } })
      });
      const data = await res.json();
      ok = res.ok && data.candidates && data.candidates[0];
      msg = ok ? '' : ((data.error && data.error.message) || ('HTTP ' + res.status));
    } else {
      const res = await fetch(aiEndpoint(), {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify({ model: aiModel(), messages: [{ role: 'user', content: 'Reply with exactly: OK' }], max_tokens: 8 })
      });
      const data = await res.json();
      ok = res.ok && data.choices && data.choices[0];
      msg = ok ? '' : ((data.error && (data.error.message || data.error)) || ('HTTP ' + res.status));
    }
    if (ok) { if (st) st.textContent = '✓ Key works!'; toast('Key works!'); }
    else { if (st) st.textContent = '✗ ' + String(msg).slice(0, 60); toast('Key test failed'); }
  } catch (e) {
    if (st) st.textContent = '✗ Network error';
    toast('Network error');
  }
}
$('#gemTest') && $('#gemTest').addEventListener('click', testAIKey);

// Floating agent
$('#fabAgent') && $('#fabAgent').addEventListener('click', openAgent);
$('#agentClose') && $('#agentClose').addEventListener('click', closeAgent);
$('#agentSend') && $('#agentSend').addEventListener('click', () => { const el = $('#agentInput'); agentSend(el.value); el.value = ''; el.style.height = 'auto'; });
$('#agentInput') && $('#agentInput').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#agentSend').click(); } });
$('#agentInput') && $('#agentInput').addEventListener('input', e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(110, e.target.scrollHeight) + 'px'; });
document.addEventListener('click', e => {
  const chip = e.target.closest('#agentChips .chip');
  if (chip) { agentSend(chip.textContent); }
});

// patch renderMore to refresh gem key ui
const _renderMore = renderMore;
renderMore = function() { _renderMore(); refreshGemKeyUI(); };

applyLang();
go('home');
if (!state.onboarded) setTimeout(() => { try { openSheet('profile'); } catch (e) { } }, 450);
if (!localStorage.getItem('mc_agent_hint_shown')) {
  setTimeout(() => { toast('Tap the pink ✦ button to ask the AI anything'); localStorage.setItem('mc_agent_hint_shown', '1'); }, 1400);
}
setInterval(() => { if (state.tracker && state.tracker.date !== todayISO()) renderTracker(); }, 60000);
