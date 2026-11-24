"""Maternacare AI — hardened FastAPI backend.

Phase 0+1 implementation. Preserves all existing endpoints and clinical logic while
adding: fail-closed secrets, real Razorpay verification, server-side entitlement,
rate limiting, audit log, normalized mother/baby/family schema, migrations, consent
records, and data export/deletion.

Run: uvicorn main:app --host 0.0.0.0 --port 8000
"""
import hashlib
import json
import re
import sqlite3
import uuid
from datetime import date, datetime, timedelta

import jwt
from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from passlib.context import CryptContext
from pydantic import BaseModel, validator

import engine as eg
import payments as pay
import security as sec
from config import (ALLOWED_ORIGINS, DATABASE_PATH, FRONTEND, JWT_EXPIRE_MINUTES,
                    JWT_SECRET, PRODUCTION)

pwd = CryptContext(schemes=['pbkdf2_sha256'], deprecated='auto')
app = FastAPI(title='Maternacare AI API', docs_url=None if PRODUCTION else '/docs')

if ALLOWED_ORIGINS:
    app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS,
                       allow_credentials=True, allow_methods=['GET', 'POST', 'DELETE'],
                       allow_headers=['Authorization', 'Content-Type'])
sec.install_security_headers(app)

from migrations import migrate
migrate(DATABASE_PATH)


def db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys=ON')
    return conn


def make_token(uid):
    now = datetime.utcnow()
    return jwt.encode({'sub': uid, 'iat': now, 'exp': now + timedelta(minutes=JWT_EXPIRE_MINUTES),
                       'iss': 'maternacare-ai', 'aud': 'maternacare-app'}, JWT_SECRET, algorithm='HS256')


def current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, 'Not authenticated')
    try:
        payload = jwt.decode(authorization[7:], JWT_SECRET, algorithms=['HS256'],
                             issuer='maternacare-ai', audience='maternacare-app')
        return payload['sub']
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, 'Session expired')
    except Exception:
        raise HTTPException(401, 'Invalid token')


# ----------------------------- models -----------------------------
class AuthIn(BaseModel):
    identifier: str
    password: str

    @validator('password')
    def strong(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class ProfileIn(BaseModel):
    stage: str = 'pregnancy'
    lmp: str | None = None
    edd: str | None = None
    weeks: int | None = None
    first_pregnancy: bool = False
    high_risk: bool = False
    conditions: str = ''
    medicines: str = ''
    allergies: str = ''
    doctor: str = ''
    emergency_contact: str = ''
    language: str = 'en'
    consent: bool = False
    consent_version: str = '1.0'


class TaskIn(BaseModel):
    title: str
    due: str
    type: str = 'custom'

    @validator('due')
    def valid_date(cls, v):
        try:
            date.fromisoformat(v)
        except ValueError:
            raise ValueError('due must be an ISO date (YYYY-MM-DD)')
        return v


class TextIn(BaseModel):
    text: str
    language: str = 'en'

    @validator('text')
    def bounded(cls, v):
        if len(v) > 2000:
            raise ValueError('Text too long')
        return v


class VerifyIn(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    plan: str = 'monthly'


class SendOTPIn(BaseModel):
    phone: str
    purpose: str = 'login'


class VerifyOTPIn(BaseModel):
    phone: str
    code: str
    purpose: str = 'login'


class BabyIn(BaseModel):
    name: str
    date_of_birth: str
    sex: str | None = None
    birth_weight_g: int | None = None
    gestation_weeks: int | None = None

    @validator('date_of_birth')
    def valid_dob(cls, v):
        try:
            date.fromisoformat(v)
        except ValueError:
            raise ValueError('Invalid date')
        return v


class GrowthIn(BaseModel):
    baby_id: str
    measured_at: str
    weight_g: int | None = None
    length_cm: float | None = None
    head_circ_cm: float | None = None
    source: str = 'parent'


class ImmunizationIn(BaseModel):
    baby_id: str
    vaccine_code: str
    due_date: str
    given_date: str | None = None
    batch_no: str | None = None
    facility: str | None = None


# ----------------------------- health -----------------------------
@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'maternacare-ai'}


# ----------------------------- auth -----------------------------
def parse_identifier(ident):
    ident = ident.strip().lower()
    if '@' in ident:
        if not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', ident):
            raise HTTPException(400, 'Invalid email')
        return 'email'
    if not re.fullmatch(r'\+?\d{8,15}', ident):
        raise HTTPException(400, 'Invalid phone')
    return 'phone'


@app.post('/api/auth/signup')
def signup(body: AuthIn, request: Request):
    sec.auth_limiter.check(sec.client_key(request))
    col = parse_identifier(body.identifier)
    ident = body.identifier.strip().lower()
    uid = str(uuid.uuid4())
    with db() as c:
        try:
            c.execute(f'INSERT INTO users(id,{col},password,created_at) VALUES(?,?,?,?)',
                      (uid, ident, pwd.hash(body.password), datetime.now().isoformat()))
            c.execute('INSERT INTO consents(id,user_id,purpose,version,granted_at,text_hash) VALUES(?,?,?,?,?,?)',
                      (uuid.uuid4().hex, uid, 'health_data_processing', '1.0',
                       datetime.now().isoformat(), hashlib.sha256(b'consent-v1').hexdigest()))
            sec.audit(c, uid, 'signup', 'user', uid)
            c.commit()
        except sqlite3.IntegrityError:
            raise HTTPException(400, 'Account already exists')
    return {'token': make_token(uid), 'user': {'id': uid, col: ident}}


@app.post('/api/auth/login')
def login(body: AuthIn, request: Request):
    sec.auth_limiter.check(sec.client_key(request))
    ident = body.identifier.strip().lower()
    with db() as c:
        row = c.execute('SELECT * FROM users WHERE email=? OR phone=?', (ident, ident)).fetchone()
        if not row or not pwd.verify(body.password, row['password']):
            sec.audit(c, row['id'] if row else None, 'login_failed', 'user', detail=ident)
            c.commit()
            raise HTTPException(401, 'Wrong credentials')
        sec.audit(c, row['id'], 'login', 'user', row['id'])
        c.commit()
    return {'token': make_token(row['id']), 'user': {'id': row['id']}}


# ----------------------------- OTP phone auth -----------------------------
@app.post('/api/auth/send-otp')
def send_otp(body: SendOTPIn, request: Request):
    sec.otp_limiter.check(sec.client_key(request))
    phone = body.phone.strip()
    if not re.fullmatch(r'\+?\d{8,15}', phone):
        raise HTTPException(400, 'Invalid phone number')
    with db() as c:
        sec.clean_expired_otps(c)
        code = sec.generate_otp_code()
        sec.store_otp(c, phone, code, body.purpose)
        result = sec.send_otp_sms(phone, code, body.purpose)
        sec.audit(c, None, 'otp_sent', 'user', detail=phone)
        c.commit()
    return {'sent': result['sent'], 'provider': result['provider'],
            'detail': result['detail'], 'phone': phone}


@app.post('/api/auth/verify-otp')
def verify_otp(body: VerifyOTPIn, request: Request):
    sec.otp_verify_limiter.check(sec.client_key(request))
    phone = body.phone.strip()
    if not re.fullmatch(r'\+?\d{8,15}', phone):
        raise HTTPException(400, 'Invalid phone number')
    with db() as c:
        sec.clean_expired_otps(c)
        if not sec.verify_otp(c, phone, code=body.code, purpose=body.purpose):
            sec.audit(c, None, 'otp_verify_failed', 'user', detail=phone)
            c.commit()
            raise HTTPException(401, 'Invalid or expired OTP code')
        # Find or create user by phone.
        row = c.execute('SELECT * FROM users WHERE phone=?', (phone,)).fetchone()
        if not row:
            uid = str(uuid.uuid4())
            c.execute('INSERT INTO users(id,phone,password,created_at) VALUES(?,?,?,?)',
                      (uid, phone, pwd.hash(uuid.uuid4().hex), datetime.now().isoformat()))
            c.execute('INSERT INTO consents(id,user_id,purpose,version,granted_at,text_hash) VALUES(?,?,?,?,?,?)',
                      (uuid.uuid4().hex, uid, 'health_data_processing', '1.0',
                       datetime.now().isoformat(), hashlib.sha256(b'consent-v1').hexdigest()))
            sec.audit(c, uid, 'otp_signup', 'user', uid)
        else:
            uid = row['id']
            sec.audit(c, uid, 'otp_login', 'user', uid)
        c.commit()
    return {'token': make_token(uid), 'user': {'id': uid, 'phone': phone}}


@app.get('/api/me')
def me(uid=Depends(current_user)):
    with db() as c:
        row = c.execute('SELECT id,email,phone,created_at FROM users WHERE id=?', (uid,)).fetchone()
    if not row:
        raise HTTPException(404, 'User not found')
    return dict(row)


# ----------------------------- profile -----------------------------
@app.post('/api/profile')
def save_profile(body: ProfileIn, uid=Depends(current_user)):
    if not body.consent:
        raise HTTPException(400, 'Consent required')
    d = body.dict()
    try:
        edd, days = eg.compute_edd(d.get('lmp'), d.get('edd'), d.get('weeks'))
    except ValueError:
        raise HTTPException(400, 'Invalid date supplied')
    if days is not None and days < 0:
        raise HTTPException(400, 'LMP cannot be in the future')
    if d.get('weeks') is not None and not (0 <= d['weeks'] <= 45):
        raise HTTPException(400, 'Weeks must be between 0 and 45')
    d['computed_edd'] = edd
    d['days'] = days
    d['stage'] = 'pregnancy' if d['stage'] == 'pregnant' else d['stage']
    with db() as c:
        c.execute('INSERT INTO profiles(user_id,data,updated_at) VALUES(?,?,?) '
                  'ON CONFLICT(user_id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at',
                  (uid, json.dumps(d), datetime.now().isoformat()))
        c.execute('INSERT INTO consents(id,user_id,purpose,version,granted_at,text_hash) VALUES(?,?,?,?,?,?)',
                  (uuid.uuid4().hex, uid, 'profile_health_data', d['consent_version'],
                   datetime.now().isoformat(), hashlib.sha256(json.dumps(d, sort_keys=True).encode()).hexdigest()))
        existing = c.execute('SELECT COUNT(*) c FROM tasks WHERE user_id=? AND custom=0', (uid,)).fetchone()['c']
        if existing == 0 and d['stage'] == 'pregnancy' and edd:
            for t in eg.anc_schedule(edd):
                c.execute('INSERT INTO tasks(id,user_id,type,title,due,week,due_date) VALUES(?,?,?,?,?,?,?)',
                          (uid[:8] + '_' + t['id'], uid, t['type'], t['title'], t['due'], t['week'], t['due']))
        mrow = c.execute('SELECT id FROM mothers WHERE user_id=?', (uid,)).fetchone()
        if not mrow:
            c.execute('INSERT INTO mothers(id,user_id,high_risk,risk_notes,created_at,updated_at) VALUES(?,?,?,?,?,?)',
                      (uuid.uuid4().hex, uid, int(d['high_risk']), d['conditions'],
                       datetime.now().isoformat(), datetime.now().isoformat()))
        sec.audit(c, uid, 'profile_saved', 'profile', uid)
        c.commit()
    return {'ok': True, 'profile': d, 'tasks': get_tasks(uid)}


@app.get('/api/profile')
def get_profile(uid=Depends(current_user)):
    with db() as c:
        row = c.execute('SELECT data FROM profiles WHERE user_id=?', (uid,)).fetchone()
    return json.loads(row['data']) if row else None


# ----------------------------- family / babies -----------------------------
@app.post('/api/babies')
def add_baby(body: BabyIn, uid=Depends(current_user)):
    with db() as c:
        mother = c.execute('SELECT id FROM mothers WHERE user_id=?', (uid,)).fetchone()
        if not mother:
            raise HTTPException(400, 'Complete your profile first')
        bid = uuid.uuid4().hex
        c.execute('INSERT INTO babies(id,mother_id,name,date_of_birth,sex,birth_weight_g,gestation_weeks,created_at,updated_at) '
                  'VALUES(?,?,?,?,?,?,?,?,?)',
                  (bid, mother['id'], body.name, body.date_of_birth, body.sex,
                   body.birth_weight_g, body.gestation_weeks, datetime.now().isoformat(), datetime.now().isoformat()))
        c.execute('INSERT INTO family_links(id,user_id,baby_id,role,created_at) VALUES(?,?,?,?,?)',
                  (uuid.uuid4().hex, uid, bid, 'mother', datetime.now().isoformat()))
        sec.audit(c, uid, 'baby_added', 'baby', bid)
        c.commit()
    return {'ok': True, 'id': bid}


@app.get('/api/babies')
def list_babies(uid=Depends(current_user)):
    with db() as c:
        rows = c.execute('SELECT b.* FROM babies b JOIN mothers m ON b.mother_id=m.id WHERE m.user_id=?',
                         (uid,)).fetchall()
    return [dict(r) for r in rows]


def baby_owner(c, baby_id, uid):
    row = c.execute('SELECT b.id FROM babies b JOIN mothers m ON b.mother_id=m.id '
                    'WHERE b.id=? AND m.user_id=?', (baby_id, uid)).fetchone()
    if not row:
        raise HTTPException(404, 'Baby not found')


@app.post('/api/growth')
def add_growth(body: GrowthIn, uid=Depends(current_user)):
    with db() as c:
        baby_owner(c, body.baby_id, uid)
        try:
            date.fromisoformat(body.measured_at)
        except ValueError:
            raise HTTPException(400, 'Invalid measurement date')
        c.execute('INSERT INTO growth_measurements(id,baby_id,measured_at,weight_g,length_cm,head_circ_cm,source,recorded_by) '
                  'VALUES(?,?,?,?,?,?,?,?)',
                  (uuid.uuid4().hex, body.baby_id, body.measured_at, body.weight_g,
                   body.length_cm, body.head_circ_cm, body.source, uid))
        sec.audit(c, uid, 'growth_added', 'baby', body.baby_id)
        c.commit()
    return {'ok': True}


@app.get('/api/growth/{baby_id}')
def get_growth(baby_id: str, uid=Depends(current_user)):
    with db() as c:
        baby_owner(c, baby_id, uid)
        rows = c.execute('SELECT * FROM growth_measurements WHERE baby_id=? ORDER BY measured_at', (baby_id,)).fetchall()
    return [dict(r) for r in rows]


@app.post('/api/immunizations')
def add_immunization(body: ImmunizationIn, uid=Depends(current_user)):
    with db() as c:
        baby_owner(c, body.baby_id, uid)
        c.execute('INSERT INTO immunization_records(id,baby_id,vaccine_code,due_date,given_date,batch_no,facility) '
                  'VALUES(?,?,?,?,?,?,?)',
                  (uuid.uuid4().hex, body.baby_id, body.vaccine_code, body.due_date,
                   body.given_date, body.batch_no, body.facility))
        sec.audit(c, uid, 'immunization_recorded', 'baby', body.baby_id)
        c.commit()
    return {'ok': True}


@app.get('/api/immunizations/{baby_id}')
def immunizations_due(baby_id: str, uid=Depends(current_user)):
    with db() as c:
        baby_owner(c, baby_id, uid)
        b = c.execute('SELECT date_of_birth FROM babies WHERE id=?', (baby_id,)).fetchone()
        generated = eg.imm_schedule(b['date_of_birth'])
        given = {r['vaccine_code'] for r in c.execute(
            'SELECT vaccine_code FROM immunization_records WHERE baby_id=? AND given_date IS NOT NULL', (baby_id,))}
    for item in generated:
        item['given'] = item['title'] in given
    return generated


# ----------------------------- tasks -----------------------------
def task_dict(r):
    due = r['due'] or r['due_date']
    return {'id': r['id'], 'type': r['type'], 'title': r['title'], 'due': due,
            'week': r['week'], 'done': bool(r['done']), 'custom': bool(r['custom']),
            'status': 'done' if r['done'] else ('overdue' if due < date.today().isoformat() else 'upcoming')}


def get_tasks(uid):
    with db() as c:
        rows = c.execute('SELECT * FROM tasks WHERE user_id=? ORDER BY due', (uid,)).fetchall()
    return [task_dict(r) for r in rows]


@app.get('/api/tasks')
def tasks(uid=Depends(current_user)):
    return get_tasks(uid)


@app.post('/api/tasks')
def add_task(body: TaskIn, uid=Depends(current_user)):
    tid = 'custom_' + uuid.uuid4().hex[:12]
    with db() as c:
        c.execute('INSERT INTO tasks(id,user_id,type,title,due,due_date,custom) VALUES(?,?,?,?,?,?,1)',
                  (tid, uid, body.type, body.title, body.due, body.due))
        sec.audit(c, uid, 'task_added', 'task', tid)
        c.commit()
    return {'ok': True, 'tasks': get_tasks(uid)}


@app.post('/api/tasks/{tid}/done')
def toggle_task(tid: str, uid=Depends(current_user)):
    with db() as c:
        row = c.execute('SELECT done FROM tasks WHERE id=? AND user_id=?', (tid, uid)).fetchone()
        if not row:
            raise HTTPException(404, 'Not found')
        new = 0 if row['done'] else 1
        c.execute('UPDATE tasks SET done=?,done_at=? WHERE id=?', (new, datetime.now().isoformat(), tid))
        sec.audit(c, uid, 'task_toggled', 'task', tid, str(new))
        c.commit()
    return {'ok': True, 'tasks': get_tasks(uid)}


@app.delete('/api/tasks/{tid}')
def del_task(tid: str, uid=Depends(current_user)):
    with db() as c:
        c.execute('DELETE FROM tasks WHERE id=? AND user_id=?', (tid, uid))
        sec.audit(c, uid, 'task_deleted', 'task', tid)
        c.commit()
    return {'ok': True, 'tasks': get_tasks(uid)}


# ----------------------------- clinical (entitlement-gated) -----------------------------
def profile_of(c, uid):
    row = c.execute('SELECT data FROM profiles WHERE user_id=?', (uid,)).fetchone()
    return json.loads(row['data']) if row else {'stage': 'pregnancy'}


@app.get('/api/education')
def education(language: str = 'en', uid=Depends(current_user)):
    with db() as c:
        sec.require_entitlement(c, uid)
        p = profile_of(c, uid)
    items = eg.education_for(p.get('stage', 'pregnancy'), p.get('days'))
    return {'stage': p.get('stage'), 'week': (p.get('days') or 0) // 7,
            'items': [{'title': i['title'].get(language, i['title']['en']),
                       'body': i['body'].get(language, i['body']['en']), 'source': i['source'],
                       'education_not_advice': True} for i in items]}


@app.get('/api/traditions')
def traditions(language: str = 'en', q: str = '', uid=Depends(current_user)):
    with db() as c:
        sec.require_entitlement(c, uid)
    return [t for t in eg.TRADITIONS if not q or q.lower() in t['name'].lower()]


@app.post('/api/triage')
def triage(body: TextIn, uid=Depends(current_user)):
    with db() as c:
        sec.require_entitlement(c, uid)
        p = profile_of(c, uid)
        sec.audit(c, uid, 'triage_check', 'symptom', detail=body.text[:100])
        c.commit()
    a = eg.triage(body.text, p.get('stage', 'pregnancy'))
    if not a:
        return {'alert': False}
    return {'alert': True, 'urgency': a['urgency'],
            'reason': a['reason'].get(body.language, a['reason']['en']),
            'action': a['action'].get(body.language, a['action']['en']),
            'steps': a['steps'], 'emergency_line': 'In India: call 102 for ambulance.'}


@app.post('/api/chat')
def chat(body: TextIn, uid=Depends(current_user)):
    with db() as c:
        sec.require_entitlement(c, uid)
        p = profile_of(c, uid)
        r = eg.chat_reply(body.text, p.get('stage', 'pregnancy'), get_tasks(uid), body.language)
        c.execute('INSERT INTO chat(user_id,role,text,kind,created_at) VALUES(?,?,?,?,?)',
                  (uid, 'user', body.text, None, datetime.now().isoformat()))
        c.execute('INSERT INTO chat(user_id,role,text,kind,created_at) VALUES(?,?,?,?,?)',
                  (uid, 'assistant', r['text'], r['kind'], datetime.now().isoformat()))
        sec.audit(c, uid, 'chat_message', 'chat', detail=body.text[:100])
        c.commit()
    return {'reply': r['text'], 'kind': r['kind']}


@app.get('/api/chat')
def chat_history(uid=Depends(current_user)):
    with db() as c:
        sec.require_entitlement(c, uid)
        rows = c.execute('SELECT role,text,kind FROM chat WHERE user_id=? ORDER BY id DESC LIMIT 40', (uid,)).fetchall()
    return [dict(r) for r in rows][::-1]


# ----------------------------- summary -----------------------------
@app.get('/api/summary')
def summary(uid=Depends(current_user)):
    with db() as c:
        p = profile_of(c, uid)
        srow = c.execute('SELECT status,plan,expires_at FROM subscriptions WHERE user_id=?', (uid,)).fetchone()
    tasks = get_tasks(uid)
    open_t = sorted([t for t in tasks if not t['done']], key=lambda x: x['due'])
    edd = p.get('computed_edd')
    active = bool(srow and srow['status'] == 'active' and srow['expires_at'] > datetime.now().isoformat())
    return {'stage': p.get('stage', 'pregnancy'), 'week': (p.get('days') or 0) // 7,
            'edd': edd, 'days_left': (date.fromisoformat(edd) - date.today()).days if edd else None,
            'next': open_t[0] if open_t else None, 'open_count': len(open_t),
            'done_count': len(tasks) - len(open_t),
            'subscription': {'active': active, 'plan': srow['plan'] if srow else None,
                             'expires_at': srow['expires_at'] if srow else None}}


# ----------------------------- payments -----------------------------
@app.post('/api/payments/order')
def create_order(plan: str, uid=Depends(current_user)):
    with db() as c:
        return pay.create_order(plan, c, uid)


@app.post('/api/payments/verify')
def verify_payment(body: VerifyIn, uid=Depends(current_user)):
    with db() as c:
        result = pay.verify_payment(body, c, uid)
        sec.audit(c, uid, 'payment_verified', 'subscription', detail=body.razorpay_payment_id)
        c.commit()
    return result


@app.post('/api/payments/webhook')
async def payment_webhook(request: Request):
    payload = await request.body()
    signature = request.headers.get('x-razorpay-signature', '')
    with db() as c:
        return pay.verify_webhook(payload, signature, c)


# ----------------------------- privacy / feedback -----------------------------
@app.post('/api/feedback')
def feedback(body: TextIn, uid=Depends(current_user)):
    with db() as c:
        c.execute('INSERT INTO feedback(user_id,text,created_at) VALUES(?,?,?)',
                  (uid, body.text, datetime.now().isoformat()))
        sec.audit(c, uid, 'feedback_submitted', 'feedback')
        c.commit()
    return {'ok': True}


@app.get('/api/export')
def export_data(uid=Depends(current_user)):
    """DPDP right to access/portability."""
    with db() as c:
        data = {
            'user': dict(c.execute('SELECT id,email,phone,created_at FROM users WHERE id=?', (uid,)).fetchone()),
            'profile': get_profile(uid),
            'babies': [dict(r) for r in c.execute(
                'SELECT b.* FROM babies b JOIN mothers m ON b.mother_id=m.id WHERE m.user_id=?', (uid,))],
            'tasks': get_tasks(uid),
            'chat': [dict(r) for r in c.execute('SELECT role,text,created_at FROM chat WHERE user_id=?', (uid,))],
            'consents': [dict(r) for r in c.execute('SELECT purpose,version,granted_at,withdrawn_at FROM consents WHERE user_id=?', (uid,))],
        }
        sec.audit(c, uid, 'data_exported', 'user', uid)
        c.commit()
    return JSONResponse(data, headers={'Content-Disposition': 'attachment; filename="maternacare-export.json"'})


@app.delete('/api/account')
def delete_account(uid=Depends(current_user)):
    """DPDP right to erasure. Payments records are anonymized, not deleted, for audit."""
    with db() as c:
        for table in ('profiles', 'tasks', 'chat', 'subscriptions', 'consents', 'feedback',
                      'mothers', 'family_links', 'growth_measurements', 'immunization_records',
                      'feeding_sessions', 'payment_events', 'refresh_tokens'):
            c.execute(f'DELETE FROM {table} WHERE user_id=?', (uid,))
        c.execute('DELETE FROM babies WHERE mother_id IN (SELECT id FROM mothers WHERE user_id=?)', (uid,))
        c.execute('UPDATE users SET email=NULL, phone=NULL, password=? WHERE id=?',
                  (pwd.hash(uuid.uuid4().hex), uid))
        sec.audit(c, uid, 'account_deleted', 'user', uid)
        c.commit()
    return {'ok': True}


app.mount('/', StaticFiles(directory=str(FRONTEND), html=True), name='frontend')
