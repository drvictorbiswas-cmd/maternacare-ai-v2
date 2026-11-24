"""Maternacare AI — FastAPI backend.

Real auth (JWT + hashed passwords), SQLite per-user data, Razorpay signature
verification, and all clinical APIs. Serves the animated PWA from ../frontend.

Run: uvicorn main:app --host 0.0.0.0 --port 8000
"""
import hashlib
import hmac
import json
import os
import sqlite3
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path

import jwt
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from passlib.context import CryptContext
from pydantic import BaseModel

import engine as eg

BASE = Path(__file__).parent
DB_PATH = Path(os.environ.get('DATABASE_PATH', str(BASE / 'data' / 'maternacare.db')))
SECRET = os.environ.get('JWT_SECRET', 'dev-only-change-this-secret')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
FRONTEND = BASE.parent / 'frontend'

pwd = CryptContext(schemes=['pbkdf2_sha256'], deprecated='auto')
app = FastAPI(title='Maternacare AI API')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with db() as c:
        c.execute('''CREATE TABLE IF NOT EXISTS users(
            id TEXT PRIMARY KEY, email TEXT UNIQUE, phone TEXT UNIQUE,
            password TEXT NOT NULL, created_at TEXT NOT NULL)''')
        c.execute('''CREATE TABLE IF NOT EXISTS profiles(
            user_id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT NOT NULL)''')
        c.execute('''CREATE TABLE IF NOT EXISTS tasks(
            id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT, title TEXT,
            due TEXT, week INTEGER, note TEXT, custom INTEGER DEFAULT 0,
            done INTEGER DEFAULT 0, done_at TEXT)''')
        c.execute('''CREATE TABLE IF NOT EXISTS chat(
            id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL,
            role TEXT, text TEXT, kind TEXT, created_at TEXT NOT NULL)''')
        c.execute('''CREATE TABLE IF NOT EXISTS subscriptions(
            user_id TEXT PRIMARY KEY, plan TEXT, payment_id TEXT,
            activated_at TEXT, expires_at TEXT)''')
        c.execute('''CREATE TABLE IF NOT EXISTS feedback(
            id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, text TEXT, created_at TEXT)''')
        c.commit()

init_db()


def make_token(uid):
    return jwt.encode({'sub': uid, 'exp': datetime.utcnow() + timedelta(days=90)}, SECRET, algorithm='HS256')


def current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, 'Not authenticated')
    try:
        payload = jwt.decode(authorization[7:], SECRET, algorithms=['HS256'])
    except Exception:
        raise HTTPException(401, 'Invalid token')
    return payload['sub']


class AuthIn(BaseModel):
    identifier: str
    password: str


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


class TaskIn(BaseModel):
    title: str
    due: str
    type: str = 'custom'


class TextIn(BaseModel):
    text: str
    language: str = 'en'


class VerifyIn(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    plan: str = 'monthly'


@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'maternacare-ai'}


@app.post('/api/auth/signup')
def signup(body: AuthIn):
    ident = body.identifier.strip().lower()
    if '@' in ident:
        if ident.count('@') != 1 or '.' not in ident.split('@')[1]:
            raise HTTPException(400, 'Invalid email')
        col = 'email'
    else:
        if len(ident) < 8: raise HTTPException(400, 'Invalid phone')
        col = 'phone'
    if len(body.password) < 6: raise HTTPException(400, 'Password must be 6+ characters')
    uid = str(uuid.uuid4())
    with db() as c:
        try:
            c.execute(f'INSERT INTO users(id,{col},password,created_at) VALUES(?,?,?,?)',
                      (uid, ident, pwd.hash(body.password), datetime.now().isoformat()))
        except sqlite3.IntegrityError:
            raise HTTPException(400, 'Account already exists')
        c.commit()
    return {'token': make_token(uid), 'user': {'id': uid, col: ident}}


@app.post('/api/auth/login')
def login(body: AuthIn):
    ident = body.identifier.strip().lower()
    with db() as c:
        row = c.execute('SELECT * FROM users WHERE email=? OR phone=?', (ident, ident)).fetchone()
    if not row or not pwd.verify(body.password, row['password']):
        raise HTTPException(401, 'Wrong credentials')
    return {'token': make_token(row['id']), 'user': {'id': row['id']}}


@app.get('/api/me')
def me(uid=Depends(current_user)):
    with db() as c:
        row = c.execute('SELECT id,email,phone,created_at FROM users WHERE id=?', (uid,)).fetchone()
    if not row: raise HTTPException(404, 'User not found')
    return dict(row)


@app.post('/api/profile')
def save_profile(body: ProfileIn, uid=Depends(current_user)):
    if not body.consent: raise HTTPException(400, 'Consent required')
    d = body.dict()
    edd, days = eg.compute_edd(d.get('lmp'), d.get('edd'), d.get('weeks'))
    d['computed_edd'] = edd
    d['days'] = days
    stage = d['stage']
    d['stage'] = 'pregnancy' if stage == 'pregnant' else stage
    with db() as c:
        c.execute('INSERT INTO profiles(user_id,data,updated_at) VALUES(?,?,?) '
                  'ON CONFLICT(user_id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at',
                  (uid, json.dumps(d), datetime.now().isoformat()))
        existing = c.execute('SELECT COUNT(*) c FROM tasks WHERE user_id=? AND custom=0', (uid,)).fetchone()['c']
        if existing == 0 and d['stage'] == 'pregnancy' and edd:
            for t in eg.anc_schedule(edd):
                c.execute('INSERT INTO tasks(id,user_id,type,title,due,week) VALUES(?,?,?,?,?,?)',
                          (t['id'], uid, t['type'], t['title'], t['due'], t['week']))
        c.commit()
    return {'ok': True, 'profile': d, 'tasks': get_tasks(uid)}


@app.get('/api/profile')
def get_profile(uid=Depends(current_user)):
    with db() as c:
        row = c.execute('SELECT data FROM profiles WHERE user_id=?', (uid,)).fetchone()
    return json.loads(row['data']) if row else None


def task_dict(r):
    return {'id': r['id'], 'type': r['type'], 'title': r['title'], 'due': r['due'],
            'week': r['week'], 'done': bool(r['done']), 'custom': bool(r['custom']),
            'status': 'done' if r['done'] else ('overdue' if r['due'] < date.today().isoformat() else 'upcoming')}


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
        c.execute('INSERT INTO tasks(id,user_id,type,title,due,custom) VALUES(?,?,?,?,?,1)',
                  (tid, uid, body.type, body.title, body.due))
        c.commit()
    return {'ok': True, 'tasks': get_tasks(uid)}


@app.post('/api/tasks/{tid}/done')
def toggle_task(tid: str, uid=Depends(current_user)):
    with db() as c:
        row = c.execute('SELECT done FROM tasks WHERE id=? AND user_id=?', (tid, uid)).fetchone()
        if not row: raise HTTPException(404, 'Not found')
        new = 0 if row['done'] else 1
        c.execute('UPDATE tasks SET done=?,done_at=? WHERE id=?', (new, datetime.now().isoformat(), tid))
        c.commit()
    return {'ok': True, 'tasks': get_tasks(uid)}


@app.delete('/api/tasks/{tid}')
def del_task(tid: str, uid=Depends(current_user)):
    with db() as c:
        c.execute('DELETE FROM tasks WHERE id=? AND user_id=?', (tid, uid))
        c.commit()
    return {'ok': True, 'tasks': get_tasks(uid)}


@app.get('/api/education')
def education(language: str = 'en', uid=Depends(current_user)):
    with db() as c:
        row = c.execute('SELECT data FROM profiles WHERE user_id=?', (uid,)).fetchone()
    p = json.loads(row['data']) if row else {'stage': 'pregnancy'}
    items = eg.education_for(p.get('stage', 'pregnancy'), p.get('days'))
    return {'stage': p.get('stage'), 'week': (p.get('days') or 0) // 7,
            'items': [{'title': i['title'].get(language, i['title']['en']),
                       'body': i['body'].get(language, i['body']['en']), 'source': i['source']} for i in items]}


@app.get('/api/traditions')
def traditions(language: str = 'en', q: str = '', uid=Depends(current_user)):
    out = []
    for t in eg.TRADITIONS:
        if q and q.lower() not in t['name'].lower(): continue
        out.append({'id': t['id'], 'name': t['name'], 'belief': t['belief'], 'why': t['why'],
                    'evidence': t['evidence'], 'benefit': t['benefit'], 'risk': t['risk'],
                    'verdict': t['verdict'], 'alternative': t['alternative'],
                    'doctor': t['doctor'], 'source': t['source']})
    return out


@app.post('/api/triage')
def triage(body: TextIn, uid=Depends(current_user)):
    with db() as c:
        row = c.execute('SELECT data FROM profiles WHERE user_id=?', (uid,)).fetchone()
    stage = json.loads(row['data']).get('stage', 'pregnancy') if row else 'pregnancy'
    a = eg.triage(body.text, stage)
    if not a: return {'alert': False}
    return {'alert': True, 'urgency': a['urgency'],
            'reason': a['reason'].get(body.language, a['reason']['en']),
            'action': a['action'].get(body.language, a['action']['en']),
            'steps': a['steps'], 'emergency_line': 'In India: call 102 for ambulance.'}


@app.post('/api/chat')
def chat(body: TextIn, uid=Depends(current_user)):
    with db() as c:
        row = c.execute('SELECT data FROM profiles WHERE user_id=?', (uid,)).fetchone()
    stage = json.loads(row['data']).get('stage', 'pregnancy') if row else 'pregnancy'
    tasks = get_tasks(uid)
    r = eg.chat_reply(body.text, stage, tasks, body.language)
    with db() as c:
        c.execute('INSERT INTO chat(user_id,role,text,kind,created_at) VALUES(?,?,?,?,?)',
                  (uid, 'user', body.text, None, datetime.now().isoformat()))
        c.execute('INSERT INTO chat(user_id,role,text,kind,created_at) VALUES(?,?,?,?,?)',
                  (uid, 'assistant', r['text'], r['kind'], datetime.now().isoformat()))
        c.commit()
    return {'reply': r['text'], 'kind': r['kind']}


@app.get('/api/chat')
def chat_history(uid=Depends(current_user)):
    with db() as c:
        rows = c.execute('SELECT role,text,kind FROM chat WHERE user_id=? ORDER BY id DESC LIMIT 40', (uid,)).fetchall()
    return [dict(r) for r in rows][::-1]


@app.get('/api/summary')
def summary(uid=Depends(current_user)):
    with db() as c:
        prow = c.execute('SELECT data FROM profiles WHERE user_id=?', (uid,)).fetchone()
        srow = c.execute('SELECT plan,expires_at FROM subscriptions WHERE user_id=?', (uid,)).fetchone()
    p = json.loads(prow['data']) if prow else {}
    tasks = get_tasks(uid)
    open_t = sorted([t for t in tasks if not t['done']], key=lambda x: x['due'])
    edd = p.get('computed_edd')
    return {'stage': p.get('stage', 'pregnancy'), 'week': (p.get('days') or 0) // 7,
            'edd': edd, 'days_left': (date.fromisoformat(edd) - date.today()).days if edd else None,
            'next': open_t[0] if open_t else None, 'open_count': len(open_t),
            'done_count': len(tasks) - len(open_t),
            'subscription': {'active': bool(srow and srow['expires_at'] > datetime.now().isoformat()),
                             'plan': srow['plan'] if srow else None,
                             'expires_at': srow['expires_at'] if srow else None}}


@app.post('/api/payments/order')
def create_order(plan: str, uid=Depends(current_user)):
    amount = {'monthly': 990, 'yearly': 7990}.get(plan, 990)
    # In production: create a Razorpay order via their API using RAZORPAY_KEY_ID/SECRET.
    # Here we return client-side checkout params; verification happens on /verify.
    return {'key_id': RAZORPAY_KEY_ID or 'rzp_test_PLACEHOLDER', 'amount': amount * 100,
            'currency': 'INR', 'plan': plan, 'order_id': 'order_' + uuid.uuid4().hex[:10]}


@app.post('/api/payments/verify')
def verify_payment(body: VerifyIn, uid=Depends(current_user)):
    if not RAZORPAY_KEY_SECRET:
        # Demo mode: activate without verification (clearly unsafe for real revenue).
        pass
    else:
        msg = f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode()
        expected = hmac.new(RAZORPAY_KEY_SECRET.encode(), msg, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, body.razorpay_signature):
            raise HTTPException(400, 'Invalid payment signature')
    now = datetime.now()
    expires = now + (timedelta(days=365) if body.plan == 'yearly' else timedelta(days=30))
    with db() as c:
        c.execute('INSERT INTO subscriptions(user_id,plan,payment_id,activated_at,expires_at) '
                  'VALUES(?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET plan=excluded.plan,'
                  'payment_id=excluded.payment_id,activated_at=excluded.activated_at,expires_at=excluded.expires_at',
                  (uid, body.plan, body.razorpay_payment_id, now.isoformat(), expires.isoformat()))
        c.commit()
    return {'ok': True, 'plan': body.plan, 'expires_at': expires.isoformat()}


@app.post('/api/feedback')
def feedback(body: TextIn, uid=Depends(current_user)):
    with db() as c:
        c.execute('INSERT INTO feedback(user_id,text,created_at) VALUES(?,?,?)',
                  (uid, body.text, datetime.now().isoformat()))
        c.commit()
    return {'ok': True}


app.mount('/', StaticFiles(directory=str(FRONTEND), html=True), name='frontend')
