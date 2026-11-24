/* Maternacare AI — animated, API-driven frontend. */
window.addEventListener('error',e=>{ let d=document.getElementById('jserr'); if(!d){d=document.createElement('div');d.id='jserr';d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:300;background:#b0454f;color:#fff;padding:10px;font:12px monospace';document.body.appendChild(d);} d.textContent='Error: '+(e.message||'unknown'); });
window.addEventListener('unhandledrejection',e=>{ let d=document.getElementById('jserr'); if(!d){d=document.createElement('div');d.id='jserr';d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:300;background:#b0454f;color:#fff;padding:10px;font:12px monospace';document.body.appendChild(d);} d.textContent='Async error: '+((e.reason&&e.reason.message)||e.reason||'unknown'); });
let LANG = localStorage.getItem('mc_lang') || 'en';
let TOKEN = localStorage.getItem('mc_token') || '';
let USER = JSON.parse(localStorage.getItem('mc_user') || 'null');
let SUMMARY = null, TASKS = [], EDU = [], TRAD = [], CHAT = [];
let DEST_AFTER_AUTH = 'home';
let busy = false;

const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const tr = k => Engine.t(LANG,k);
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const buzz = (ms=10)=>{ try{ navigator.vibrate?.(ms); }catch(_){} };
const toast = msg => { const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2600); };

async function api(path, opts={}){
  const headers={'Content-Type':'application/json'};
  if(TOKEN) headers['Authorization']='Bearer '+TOKEN;
  const res=await fetch('/api'+path,{headers,...opts});
  let data={}; try{ data=await res.json(); }catch(_){}
  if(res.status===403 && !path.includes('payments')){ showGate(); throw new Error('Subscription required'); }
  if(!res.ok) throw new Error(data.detail||('Request failed ('+res.status+')'));
  return data;
}
const post=(p,d)=>api(p,{method:'POST',body:JSON.stringify(d||{})});

function applyLang(){
  document.documentElement.lang=LANG;
  $('#lang').value=LANG;
  $$('[data-i18n]').forEach(el=>el.textContent=tr(el.dataset.i18n));
  $$('[data-ph]').forEach(el=>el.placeholder=tr(el.dataset.ph));
  $('#disclaimerText').textContent=tr('disclaimer');
  $('#emerBanner').textContent=tr('emergency_banner');
  $('#emerLine').textContent=tr('call102');
  $('#foot').textContent=tr('footer_note');
  if(USER && $('#main .page:not(.hidden)')!==$('#authPage')) refreshAll();
}
$('#lang').addEventListener('change',async e=>{ LANG=e.target.value; localStorage.setItem('mc_lang',LANG); await applyLang(); });

function go(tab, skipAuth=false){
  if(!USER && !skipAuth){ DEST_AFTER_AUTH=tab; showAuth(); return; }
  if(!USER) return;
  $$('.page').forEach(p=>p.classList.add('hidden'));
  const el=$('#'+tab); if(el){ el.classList.remove('hidden'); el.style.animation='none'; void el.offsetWidth; el.style.animation=''; }
  $$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  window.scrollTo({top:0,behavior:'smooth'}); buzz(8);
  if(tab==='chat') renderChat();
  if(tab==='sub') renderSub();
  if(tab==='baby') loadBabies();
  if(tab==='trad'&&!TRAD.length) loadTrad();
  if(tab==='learn'&&!EDU.length) loadEdu();
}
$$('.tab,[data-tab]').forEach(b=>b.addEventListener('click',e=>{ e.preventDefault(); go(b.dataset.tab); }));

/* Ripple pointer tracking */
document.addEventListener('pointerdown',e=>{ const b=e.target.closest('.ripple'); if(!b)return; const r=b.getBoundingClientRect(); b.style.setProperty('--rx',(e.clientX-r.left)+'px'); b.style.setProperty('--ry',(e.clientY-r.top)+'px'); });
window.addEventListener('scroll',()=>$('#tabs')?.classList.toggle('scrolled',scrollY>10));
function closeSheet(id){ $('#'+id).style.display='none'; }
$('#disclaimerClose').addEventListener('click',()=>$('#disclaimer').classList.add('hide'));
document.addEventListener('click',e=>{
  const close=e.target.closest('[data-close-sheet]');
  if(close){ closeSheet(close.dataset.closeSheet); return; }
  const act=e.target.closest('[data-act]');
  if(!act) return;
  const {act:a,id:i,plan:p}=act.dataset;
  if(a==='toggle') toggleTask(i);
  else if(a==='del') delTask(i);
  else if(a==='trad'){ const b=$('#tb'+i); if(b){b.classList.toggle('open'); buzz(8);} }
  else if(a==='pay') startPay(p);
});

/* Auth */
let authMode='login';
function showAuth(){ $('#authPage').classList.remove('hidden'); $$('.page').forEach(p=>{if(p.id!=='authPage')p.classList.add('hidden');}); $$('.tab').forEach(b=>b.classList.remove('active')); $('#authId').focus(); }
function setAuthMode(m){ authMode=m; $('#segLogin').classList.toggle('active',m==='login'); $('#segSignup').classList.toggle('active',m==='signup'); $('#authGo').textContent=tr(m==='login'?'sign_in':'sign_up'); $('#authErr').textContent=''; }
$('#segLogin').addEventListener('click',()=>setAuthMode('login'));
$('#segSignup').addEventListener('click',()=>setAuthMode('signup'));
$('#authGo').addEventListener('click',async ()=>{
  const ident=$('#authId').value.trim(), pass=$('#authPass').value;
  if(!ident||pass.length<6){ $('#authErr').textContent=tr('email_required'); return; }
  busy=true; $('#authGo').textContent='…';
  try{
    const data=await post(authMode==='login'?'/auth/login':'/auth/signup',{identifier:ident,password:pass});
    TOKEN=data.token; USER=data.user; localStorage.setItem('mc_token',TOKEN); localStorage.setItem('mc_user',JSON.stringify(USER));
    buzz(30); $('#authPage').classList.add('hidden');
    await refreshAll();
    const hasProfile=await api('/profile').catch(()=>null);
    go(hasProfile?DEST_AFTER_AUTH:'onboarding');
    toast(tr('welcome'));
  }catch(e){ $('#authErr').textContent=e.message; buzz(60); }
  finally{ busy=false; $('#authGo').textContent=tr(authMode==='login'?'sign_in':'sign_up'); }
});
$('#accountBtn').addEventListener('click',()=>{ if(USER&&confirm((USER.email||USER.phone||'')+' — '+tr('sign_out')+'?')){ TOKEN='';USER=null;localStorage.removeItem('mc_token');localStorage.removeItem('mc_user');showAuth(); } else if(!USER) showAuth(); });

/* OTP phone auth */
let otpStep='phone', otpPhone='', otpResendLeft=0, otpResendTimer=null;
function setAuthTab(tab){
  $('#atPassword').classList.toggle('active',tab==='password');
  $('#atOtp').classList.toggle('active',tab==='otp');
  $('#authModePassword').classList.toggle('hidden',tab!=='password');
  $('#authModeOtpPhone').classList.toggle('hidden',tab!=='otp'||otpStep!=='phone');
  $('#authModeOtpCode').classList.toggle('hidden',tab!=='otp'||otpStep!=='code');
  $('#authErr').textContent=''; $('#otpErr').textContent=''; $('#otpCodeErr').textContent='';
}
$('#atPassword').addEventListener('click',()=>{otpStep='phone';setAuthTab('password');});
$('#atOtp').addEventListener('click',()=>{otpStep='phone';setAuthTab('otp');$('#otpPhone').focus();});

function buildOtpInputs(){
  const c=$('#otpInputs'); c.innerHTML='';
  for(let i=0;i<6;i++){
    const inp=document.createElement('input');
    inp.className='otp-input'; inp.maxLength=1; inp.inputMode='numeric';
    inp.addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,''); if(e.target.value&&i<5)c.children[i+1].focus();});
    inp.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!e.target.value&&i>0)c.children[i-1].focus();});
    c.appendChild(inp);
  }
}
buildOtpInputs();
function getOtpCode(){return[...$('#otpInputs').children].map(i=>i.value).join('');}
function clearOtp(){[...$('#otpInputs').children].forEach(i=>{i.value='';i.classList.remove('error','filled');});$('#otpInputs').children[0]?.focus();}
function startResendTimer(){
  otpResendLeft=60; const link=$('#otpResendLink');
  link.textContent=tr('otp_resend_link')+` (${otpResendLeft}s)`; link.style.pointerEvents='none'; link.style.opacity='.5';
  if(otpResendTimer)clearInterval(otpResendTimer);
  otpResendTimer=setInterval(()=>{otpResendLeft--;link.textContent=tr('otp_resend_link')+` (${otpResendLeft}s)`;if(otpResendLeft<=0){clearInterval(otpResendTimer);link.style.pointerEvents='auto';link.style.opacity='1';link.textContent=tr('otp_resend_link');}},1000);
}
$('#otpSend').addEventListener('click',async()=>{
  const phone=$('#otpPhone').value.trim().replace(/\s/g,'');
  if(!phone){$('#otpErr').textContent=tr('phone_required');return;}
  if(!/^\+?\d{8,15}$/.test(phone)){$('#otpErr').textContent='Invalid phone number';return;}
  busy=true;$('#otpSend').textContent='…';
  try{
    const r=await post('/auth/send-otp',{phone,purpose:'login'});
    otpPhone=phone;otpStep='code';setAuthTab('otp');startResendTimer();
  }catch(e){$('#otpErr').textContent=e.message;buzz(60);}
  finally{busy=false;$('#otpSend').textContent=tr('send_otp');}
});
$('#otpResendLink').addEventListener('click',async()=>{
  if(otpResendLeft>0)return;busy=true;
  try{await post('/auth/send-otp',{phone:otpPhone,purpose:'login'});startResendTimer();toast('Code resent');}catch(e){toast(e.message);}finally{busy=false;}
});
$('#otpVerify').addEventListener('click',async()=>{
  const code=getOtpCode();
  if(code.length!==6){$('#otpCodeErr').textContent='Enter the 6-digit code';return;}
  busy=true;$('#otpVerify').textContent='…';
  try{
    const data=await post('/auth/verify-otp',{phone:otpPhone,code,purpose:'login'});
    TOKEN=data.token;USER=data.user;localStorage.setItem('mc_token',TOKEN);localStorage.setItem('mc_user',JSON.stringify(USER));
    buzz(30);$('#authPage').classList.add('hidden');
    await refreshAll();
    const hasProfile=await api('/profile').catch(()=>null);
    go(hasProfile?DEST_AFTER_AUTH:'onboarding');
    toast(tr('welcome'));
  }catch(e){$('#otpCodeErr').textContent=e.message;[...$('#otpInputs').children].forEach(i=>i.classList.add('error'));buzz(60);}
  finally{busy=false;$('#otpVerify').textContent=tr('verify_otp');}
});
$('#otpBack').addEventListener('click',()=>{otpStep='phone';setAuthTab('otp');clearOtp();});
$('#otpInputs').addEventListener('input',e=>{
  if(e.target.classList.contains('otp-input')){[...$('#otpInputs').children].forEach((i)=>{i.classList.toggle('filled',!!i.value);i.classList.remove('error');});}
});

/* Onboarding */
$('#sStage').addEventListener('change',e=>$('#pregFields').style.display=e.target.value==='pregnant'?'block':'none');
$('#setup').addEventListener('submit',async e=>{
  e.preventDefault();
  if(!$('#sConsent').checked){ toast(tr('consent_required')); return; }
  const payload={consent:true,language:LANG,stage:$('#sStage').value,
    lmp:$('#sLmp').value||null,edd:$('#sEdd').value||null,weeks:$('#sWeeks').value?+$('#sWeeks').value:null,
    first_pregnancy:$('#sFirst').checked,high_risk:$('#sRisk').checked,
    conditions:$('#sCond').value,medicines:$('#sMed').value,allergies:$('#sAllergy').value,
    doctor:$('#sDoc').value,emergency_contact:$('#sEmer').value};
  try{ await post('/profile',payload); buzz(30);await refreshAll(); const sub=await api('/summary'); if(!sub.subscription?.active) showGate(); else go('home'); }
  catch(err){ toast(err.message); }
});

/* Triage */
function runTriage(inputSel,outSel){
  const text=$(inputSel).value.trim(); if(!text)return;
  const out=$(outSel); out.innerHTML='<div class="typing"><i></i><i></i><i></i></div>';
  post('/triage',{text,language:LANG}).then(r=>{
    if(!r.alert){ out.innerHTML=`<div class="result ok"><b>✓</b>${esc(tr('no_answer'))}</div>`; return; }
    const cls=r.urgency==='emergency'?'em':'ur', label=r.urgency==='emergency'?'🚨 '+tr('open_emergency'):'⚠️';
    out.innerHTML=`<div class="result ${cls}"><b>${esc(label)}</b><p>${esc(r.reason)}</p><p><b>${esc(r.action)}</b></p><ul>${(r.steps||[]).map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p class="muted" style="margin-top:10px">${esc(r.emergency_line)}</p></div>`;
    buzz(r.urgency==='emergency'?[80,40,80]:40);
  }).catch(e=>out.innerHTML='<div class="result ok">'+esc(e.message)+'</div>');
  $(inputSel).value='';
}
$('#quickF').addEventListener('submit',e=>{e.preventDefault();runTriage('#quickIn','#quickOut');});
$('#safetyF').addEventListener('submit',e=>{e.preventDefault();runTriage('#safetyIn','#safetyOut');});

/* Tasks */
$('#addBtn').addEventListener('click',async ()=>{
  const title=$('#newTask').value.trim(),due=$('#newDue').value;
  if(!title||!due){toast(tr('task_name'));return;}
  TASKS=(await post('/tasks',{title,due})).tasks; $('#newTask').value='';$('#newDue').value='';renderTasks();buzz(15);
});
function toggleTask(id){ post('/tasks/'+id+'/done').then(r=>{TASKS=r.tasks;renderTasks();buzz(15);}); }
function delTask(id){ api('/tasks/'+id,{method:'DELETE'}).then(r=>{TASKS=r.tasks;renderTasks();}); }
window.toggleTask=toggleTask; window.delTask=delTask;

/* Trad */
$('#tradSearch').addEventListener('input',()=>renderTrad());
function loadTrad(){ api('/traditions?q='+encodeURIComponent($('#tradSearch').value)).then(d=>{TRAD=d;renderTrad();}); }


/* Chat */
$('#chatF').addEventListener('submit',async e=>{
  e.preventDefault(); const text=$('#chatIn').value.trim(); if(!text)return;
  $('#chatIn').value='';
  appendMsg('user',text);
  const typing=document.createElement('div'); typing.className='typing'; typing.id='typing'; typing.innerHTML='<i></i><i></i><i></i>'; $('#log').appendChild(typing); scrollLog();
  try{ const r=await post('/chat',{text,language:LANG}); typing.remove(); appendMsg('assistant',r.reply,r.kind); buzz(10); }
  catch(err){ typing.remove(); appendMsg('assistant',err.message); }
});
function appendMsg(role,text,kind){ const log=$('#log'); const t=document.getElementById('typing'); if(t)t.remove(); const d=document.createElement('div'); d.className='msg '+role+(kind==='danger'?' danger':''); d.innerHTML=`<small>${role==='user'?tr('you'):tr('assistant')}</small>${esc(text)}`; log.appendChild(d); scrollLog(); }
function scrollLog(){ const l=$('#log'); l.scrollTop=l.scrollHeight; }

/* Subscriptions */
const plans=[{id:'monthly',price:990,label:'Monthly'},{id:'yearly',price:7990,label:'Yearly (save 32%)'}];
function planHTML(){ return plans.map(p=>`<div class="plan" data-act="pay" data-plan="${p.id}" role="button" tabindex="0"><div><b>${esc(p.label)}</b><small>INR ${p.price.toLocaleString('en-IN')}</small></div><div class="amt">₹${p.price.toLocaleString('en-IN')}</div></div>`).join(''); }
window.startPay=async id=>{
  let order; try{ order=await api('/payments/order?plan='+id); }catch(e){toast(e.message);return;}
  const key=order.key_id;
  if(!key||key.includes('PLACEHOLDER')){ toast('Payments are not configured on this server.'); return; }
  if(typeof Razorpay==='undefined'){ toast('Razorpay checkout unavailable'); return; }
  const rzp=new Razorpay({key,amount:order.amount,currency:'INR',name:'Maternacare AI',description:'Full access — '+id,
    notes:{user_id:USER.id},theme:{color:'#0d5c63'},
    handler:async res=>{ try{ await post('/payments/verify',{razorpay_payment_id:res.razorpay_payment_id,razorpay_order_id:res.razorpay_order_id||order.order_id,razorpay_signature:res.razorpay_signature,plan:id}); closeSheet('gate'); toast(tr('payment_success')); await refreshAll(); renderSub(); }catch(e){toast(e.message);} },
    modal:{ondismiss:()=>toast(tr('payment_failed'))}});
  rzp.open();
};
function showGate(){ $('#gatePlans').innerHTML=planHTML(); $('#gate').style.display='block'; }
function renderSub(){
  const s=SUMMARY?.subscription;
  $('#subStatus').innerHTML=s?.active?`<div class="sub-status active"><h2>${esc(tr('subscribed'))}</h2><div class="big">${esc(s.plan||'')}</div><p class="muted">${esc(tr('active_until'))}: ${new Date(s.expires_at).toLocaleDateString()}</p></div>`:`<div class="sub-status"><h2>${esc(tr('not_subscribed'))}</h2><p class="muted">${esc(tr('sub_desc'))}</p></div>`;
  $('#subPlans').innerHTML=planHTML();
}
$('#signOutBtn').addEventListener('click',()=>{TOKEN='';USER=null;localStorage.removeItem('mc_token');localStorage.removeItem('mc_user');showAuth();});

/* Baby: growth / feeding / immunization */
let BABIES = [], BABY_ID = '', IMM = [], GROWTH = [], FEEDING = [];
function setBaby(id){ BABY_ID=id; renderBabyDetail(); }
async function loadBabies(){
  BABIES = await api('/babies').catch(()=>[]);
  renderBabyList();
  if(BABIES.length && !BABY_ID) BABY_ID = BABIES[0].id;
  renderBabyDetail();
}
function renderBabyList(){
  const el=$('#babyList');
  if(!BABIES.length){ el.innerHTML=`<p class="empty">${esc(tr('no_babies'))}</p>`; return; }
  el.innerHTML=BABIES.map(b=>`<div class="task" style="cursor:pointer" data-act="baby" data-id="${esc(b.id)}"><div class="tm"><div class="tt">${esc(b.name||tr('baby'))}</div><div class="tmeta"><span>${esc(b.date_of_birth)}</span>${b.birth_weight_g?`<span>${b.birth_weight_g} g</span>`:''}</div></div>${BABY_ID===b.id?'<span class="pill upcoming">✓</span>':''}</div>`).join('');
}
function renderBabyDetail(){
  const detail=$('#babyDetail');
  if(!BABY_ID){ detail.classList.add('hidden'); return; }
  detail.classList.remove('hidden');
  $('#gDate').value=new Date().toISOString().slice(0,10);
  $('#fDate').value=new Date().toISOString().slice(0,10);
  loadGrowth(); loadFeeding(); loadImm();
}
async function loadGrowth(){
  GROWTH=await api('/growth/'+BABY_ID).catch(()=>[]);
  $('#growthList').innerHTML=GROWTH.length?GROWTH.map(g=>`<div class="task"><div class="tm"><div class="tt">${esc(g.measured_at)}</div><div class="tmeta"><span>${g.weight_g?g.weight_g+' g':''}</span>${g.length_cm?`<span>${g.length_cm} cm</span>`:''}${g.head_circ_cm?`<span>HC ${g.head_circ_cm} cm</span>`:''}</div></div></div>`).join(''):`<p class="empty">—</p>`;
}
async function loadFeeding(){
  FEEDING=await api('/feeding/'+BABY_ID).catch(()=>[]);
  $('#feedingList').innerHTML=FEEDING.length?FEEDING.map(f=>`<div class="task"><div class="tm"><div class="tt">${esc(f.started_at)}</div><div class="tmeta"><span class="pill upcoming">${esc(f.type)}</span>${f.notes?`<span>${esc(f.notes)}</span>`:''}</div></div></div>`).join(''):`<p class="empty">—</p>`;
}
async function loadImm(){
  IMM=await api('/immunizations/'+BABY_ID).catch(()=>[]);
  $('#immList').innerHTML=IMM.length?IMM.map((v,i)=>`<div class="task"><button class="tk ${v.given?'done':''}" data-act="imm" data-i="${i}" aria-label="Toggle vaccine">${v.given?'✓':''}</button><div class="tm"><div class="tt ${v.given?'done':''}">${esc(v.title)}</div><div class="tmeta"><span>${esc(v.due)}</span><span class="pill ${v.given?'done':'upcoming'}">${v.given?tr('given_on'):tr('mark_given')}</span></div></div></div>`).join(''):`<p class="empty">—</p>`;
}
$('#addBabyBtn').addEventListener('click',()=>{$('#babySheet').style.display='block';$('#bName').value='';$('#bDob').value='';$('#bWeight').value='';});
$('#saveBaby').addEventListener('click',async()=>{
  const name=$('#bName').value.trim(), dob=$('#bDob').value;
  if(!name||!dob){toast(tr('baby_name')+' / '+tr('dob'));return;}
  try{
    const r=await post('/babies',{name,date_of_birth:dob,sex:$('#bSex').value||null,birth_weight_g:$('#bWeight').value?+$('#bWeight').value:null});
    closeSheet('babySheet');buzz(30);BABY_ID=r.id;await loadBabies();toast(tr('add_baby'));
  }catch(e){toast(e.message);}
});
$('#addGrowth').addEventListener('click',async()=>{
  if(!BABY_ID){toast(tr('select_baby'));return;}
  const d=$('#gDate').value;if(!d){toast(tr('dob'));return;}
  try{await post('/growth',{baby_id:BABY_ID,measured_at:d,weight_g:$('#gWeight').value?+$('#gWeight').value:null,length_cm:$('#gLength').value?+$('#gLength').value:null,head_circ_cm:$('#gHead').value?+$('#gHead').value:null});$('#gWeight').value='';$('#gLength').value='';$('#gHead').value='';await loadGrowth();buzz(15);}catch(e){toast(e.message);}
});
$('#addFeeding').addEventListener('click',async()=>{
  if(!BABY_ID){toast(tr('select_baby'));return;}
  try{await post('/feeding',{baby_id:BABY_ID,started_at:$('#fDate').value,type:$('#fType').value,notes:$('#fNote').value||null});$('#fNote').value='';await loadFeeding();buzz(15);}catch(e){toast(e.message);}
});
document.addEventListener('click',async e=>{
  const a=e.target.closest('[data-act]');if(!a)return;
  if(a.dataset.act==='baby'){setBaby(a.dataset.id);}
  else if(a.dataset.act==='imm'){
    const v=IMM[+a.dataset.i];if(!v)return;
    if(v.given){toast(tr('given_on'));return;}
    const code=v.title.split(',')[0].trim().split(' ')[0];
    try{await post('/immunizations',{baby_id:BABY_ID,vaccine_code:code,due_date:v.due,given_date:new Date().toISOString().slice(0,10)});toast(tr('given_on'));await loadImm();buzz(20);}catch(err){toast(err.message);}
  }
});

/* Feedback */
$('#fbSend').addEventListener('click',async ()=>{const t=$('#fbText').value.trim();if(!t)return;await post('/feedback',{text:t});$('#fbText').value='';closeSheet('feedbackSheet');toast(tr('feedback_saved'));});
$('.footer').addEventListener('click',e=>{ if(e.target.id==='foot')return; });

/* Rendering */
function eduHTML(items){ if(!items||!items.length)return `<p class="empty">${esc(tr('education_none'))}</p>`; return items.map(i=>`<div class="edu-item"><h3>${esc(i.title)}</h3><p>${esc(i.body)}</p><div class="src">${esc(i.source)}</div></div>`).join(''); }
function renderTasks(){
  const list=$('#taskList');
  if(!TASKS.length){list.innerHTML=`<p class="empty">${esc(tr('all_done'))}</p>`;return;}
  list.innerHTML=TASKS.map(t=>`<div class="task"><button class="tk ${t.done?'done':''}" data-act="toggle" data-id="${esc(t.id)}" aria-label="Toggle task">${t.done?'✓':''}</button><div class="tm"><div class="tt ${t.done?'done':''}">${esc(t.title)}</div><div class="tmeta"><span class="pill ${t.status}">${esc(tr(t.status))}</span><span>${esc(t.due)}</span>${t.week?`<span>${tr('week')} ${t.week}</span>`:''}</div></div>${t.custom?`<button class="tdel" data-act="del" data-id="${esc(t.id)}" aria-label="Remove">×</button>`:''}</div>`).join('');
}
function renderTrad(){
  const q=$('#tradSearch').value.toLowerCase().trim();
  const items=TRAD.filter(x=>!q||x.name.toLowerCase().includes(q));
  $('#tradList').innerHTML=items.map((x,i)=>`<div class="trad"><div class="trad-h" data-act="trad" data-i="${i}" role="button" tabindex="0"><h3>${esc(x.name)}</h3><span class="badge ${x.verdict}">${esc((Engine.VERDICT[x.verdict]||Engine.VERDICT.insufficient)[{en:0,hi:1,bn:2}[LANG]])}</span></div><div class="trad-b" id="tb${i}"><div class="trow"><b>${tr('belief')}</b><p>${esc(x.belief)}</p></div><div class="trow"><b>${tr('why')}</b><p>${esc(x.why)}</p></div><div class="trow"><b>${tr('evidence')}</b><p>${esc(x.evidence)}</p></div><div class="trow"><b>${tr('benefit')}</b><p>${esc(x.benefit)}</p></div><div class="trow"><b>${tr('risk')}</b><p>${esc(x.risk)}</p></div><div class="trow"><b>${tr('alternative')}</b><p>${esc(x.alternative)}</p></div><div class="trow doc"><b>${tr('when_doctor')}</b><p>${esc(x.doctor)}</p></div><div class="trow"><b>${tr('sources')}</b><p class="muted">${esc(x.source)}</p></div></div></div>`).join('');
}
async function loadEdu(){ EDU=(await api('/education?language='+LANG)).items; $('#eduList').innerHTML=eduHTML(EDU); }
function renderHome(){
  if(!SUMMARY)return;
  const s=SUMMARY, stage=s.stage, week=s.week;
  const triKey=stage==='pregnancy'?(week<14?'trimester_1':week<28?'trimester_2':'trimester_3'):stage;
  $('#hStage').textContent=stage==='pregnancy'?tr(triKey):tr(stage==='postpartum'?'stage_postpartum_s':'stage_baby_s');
  $('#hWeek').textContent=stage==='pregnancy'?`${tr('week')} ${week}`:tr(stage==='postpartum'?'stage_postpartum_s':'stage_baby_s');
  $('#hTri').textContent=stage==='pregnancy'?`${week} / 40`:'';
  $('#hEdd').textContent=s.edd||tr('not_set');
  $('#hNext').textContent=s.next?s.next.title+' · '+s.next.due:tr('all_done');
  const pct=stage==='pregnancy'?Math.min(100,Math.round(week/40*100)):100;
  $('#hPct').textContent=pct+'%';
  $('#hRing').style.background=`conic-gradient(#ffd98a ${pct}%, rgba(255,255,255,.22) 0)`;
  const ok=s.subscription?.active;
  $('#subChipText').textContent=ok?`${tr('subscribed')} · ${tr('plan')}: ${s.subscription.plan}`:tr('subscribe');
  $('#subChipText').className=ok?'on':'';
  const open=TASKS.filter(t=>!t.done).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,2);
  $('#homeTasks').innerHTML=open.length?open.map(t=>`<div class="task"><div class="tm"><div class="tt">${esc(t.title)}</div><div class="tmeta"><span>${esc(t.due)}</span></div></div></div>`).join(''):`<p class="empty">${esc(tr('all_done'))}</p>`;
}
async function refreshAll(){
  if(!TOKEN)return;
  try{
    [SUMMARY,TASKS]=await Promise.all([api('/summary'),api('/tasks')]);
    CHAT=await api('/chat').catch(()=>[]);
    renderHome();renderTasks();renderSub();
    const e=await api('/education?language='+LANG).catch(()=>null); if(e){EDU=e.items;$('#homeEdu').innerHTML=eduHTML(EDU.slice(0,2));$('#learnLine').textContent=SUMMARY.stage==='pregnancy'?`${tr('week')} ${SUMMARY.week}`:'';}
    if(!TRAD.length) await loadTrad();
    renderChat();
  }catch(e){ if(e.message.includes('auth')){TOKEN='';USER=null;localStorage.removeItem('mc_token');showAuth();} }
}

/* PWA SW */
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

(async function init(){
  try{
    applyLang();
    showAuth(); // show login immediately — never block the UI on network calls
    if(TOKEN){
      try{
        USER=await api('/me'); localStorage.setItem('mc_user',JSON.stringify(USER));
        await refreshAll();
        const p=await api('/profile').catch(()=>null);
        if(p) go('home'); else go('onboarding');
      }catch(_){ TOKEN='';USER=null;localStorage.removeItem('mc_token');localStorage.removeItem('mc_user'); }
    }
  }catch(err){ toast('Startup issue: '+err.message); showAuth(); }
})();
