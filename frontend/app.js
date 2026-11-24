/* Maternacare AI — animated, API-driven frontend. */
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
  if(tab==='trad'&&!TRAD.length) loadTrad();
  if(tab==='learn'&&!EDU.length) loadEdu();
}
$$('.tab,[data-tab]').forEach(b=>b.addEventListener('click',e=>{ e.preventDefault(); go(b.dataset.tab); }));

/* Ripple pointer tracking */
document.addEventListener('pointerdown',e=>{ const b=e.target.closest('.ripple'); if(!b)return; const r=b.getBoundingClientRect(); b.style.setProperty('--rx',(e.clientX-r.left)+'px'); b.style.setProperty('--ry',(e.clientY-r.top)+'px'); });
window.addEventListener('scroll',()=>$('#tabs')?.classList.toggle('scrolled',scrollY>10));
function closeSheet(id){ $('#'+id).style.display='none'; }

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
$('#accountBtn').addEventListener('click',()=>{ if(USER&&confirm(USER.email||USER.phone||'')+' — '+tr('sign_out')+'?'){ TOKEN='';USER=null;localStorage.removeItem('mc_token');localStorage.removeItem('mc_user');showAuth(); } else if(!USER) showAuth(); });

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
window.tog=i=>{ const b=$('#tb'+i); b.classList.toggle('open'); buzz(8); };

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
function planHTML(){ return plans.map(p=>`<div class="plan" onclick="startPay('${p.id}')"><div><b>${esc(p.label)}</b><small>INR ${p.price.toLocaleString('en-IN')}</small></div><div class="amt">₹${p.price.toLocaleString('en-IN')}</div></div>`).join(''); }
window.startPay=async id=>{
  let order; try{ order=await api('/payments/order?plan='+id); }catch(e){toast(e.message);return;}
  const key=order.key_id;
  if(!key||key.includes('PLACEHOLDER')){
    await post('/payments/verify',{razorpay_payment_id:'demo_'+Date.now(),razorpay_order_id:'order_demo',razorpay_signature:'demo',plan:id});
    closeSheet('gate'); toast(tr('payment_success')); buzz(40); await refreshAll(); renderSub(); return;
  }
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

/* Feedback */
$('#fbSend').addEventListener('click',async ()=>{const t=$('#fbText').value.trim();if(!t)return;await post('/feedback',{text:t});$('#fbText').value='';closeSheet('feedbackSheet');toast(tr('feedback_saved'));});
$('.footer').addEventListener('click',e=>{ if(e.target.id==='foot')return; });

/* Rendering */
function eduHTML(items){ if(!items||!items.length)return `<p class="empty">${esc(tr('education_none'))}</p>`; return items.map(i=>`<div class="edu-item"><h3>${esc(i.title)}</h3><p>${esc(i.body)}</p><div class="src">${esc(i.source)}</div></div>`).join(''); }
function renderTasks(){
  const list=$('#taskList');
  if(!TASKS.length){list.innerHTML=`<p class="empty">${esc(tr('all_done'))}</p>`;return;}
  list.innerHTML=TASKS.map(t=>`<div class="task"><button class="tk ${t.done?'done':''}" onclick="toggleTask('${t.id}')">${t.done?'✓':''}</button><div class="tm"><div class="tt ${t.done?'done':''}">${esc(t.title)}</div><div class="tmeta"><span class="pill ${t.status}">${esc(tr(t.status))}</span><span>${esc(t.due)}</span>${t.week?`<span>${tr('week')} ${t.week}</span>`:''}</div></div>${t.custom?`<button class="tdel" onclick="delTask('${t.id}')">×</button>`:''}</div>`).join('');
}
function renderTrad(){
  const q=$('#tradSearch').value.toLowerCase().trim();
  const items=TRAD.filter(x=>!q||x.name.toLowerCase().includes(q));
  $('#tradList').innerHTML=items.map((x,i)=>`<div class="trad"><div class="trad-h" onclick="tog(${i})"><h3>${esc(x.name)}</h3><span class="badge ${x.verdict}">${esc((Engine.VERDICT[x.verdict]||Engine.VERDICT.insufficient)[{en:0,hi:1,bn:2}[LANG]])}</span></div><div class="trad-b" id="tb${i}"><div class="trow"><b>${tr('belief')}</b><p>${esc(x.belief)}</p></div><div class="trow"><b>${tr('why')}</b><p>${esc(x.why)}</p></div><div class="trow"><b>${tr('evidence')}</b><p>${esc(x.evidence)}</p></div><div class="trow"><b>${tr('benefit')}</b><p>${esc(x.benefit)}</p></div><div class="trow"><b>${tr('risk')}</b><p>${esc(x.risk)}</p></div><div class="trow"><b>${tr('alternative')}</b><p>${esc(x.alternative)}</p></div><div class="trow doc"><b>${tr('when_doctor')}</b><p>${esc(x.doctor)}</p></div><div class="trow"><b>${tr('sources')}</b><p class="muted">${esc(x.source)}</p></div></div></div>`).join('');
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
  applyLang();
  setTimeout(()=>$('#splash').classList.add('out'),900);
  if(TOKEN){
    try{ USER=await api('/me'); localStorage.setItem('mc_user',JSON.stringify(USER)); await refreshAll();
      const p=await api('/profile').catch(()=>null);
      go(p?'home':'onboarding');
    }catch(_){ TOKEN='';USER=null;localStorage.removeItem('mc_token');showAuth(); }
  } else showAuth();
})();
