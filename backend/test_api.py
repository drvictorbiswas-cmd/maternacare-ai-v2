"""Full API smoke test — run with backend on :8000."""
import json
from datetime import date, timedelta
import urllib.request, urllib.error

BASE = 'http://127.0.0.1:8000'
FAIL = []


def req(path, data=None, method=None, token=None, expect=200):
    headers = {'Content-Type': 'application/json'}
    if token: headers['Authorization'] = 'Bearer ' + token
    body = json.dumps(data).encode() if data is not None else None
    r = urllib.request.Request(BASE + path, data=body, headers=headers, method=method or ('POST' if data is not None else 'GET'))
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            p = json.loads(resp.read()); assert resp.status == expect; return p
    except urllib.error.HTTPError as e:
        raw = e.read()
        assert e.code == expect, f'{path}: expected {expect}, got {e.code}: {raw[:200]}'
        try: return json.loads(raw)
        except Exception: return {}


def check(name, cond, detail=''):
    print(('PASS' if cond else 'FAIL'), '-', name, detail)
    if not cond: FAIL.append(name)


check('health', req('/health')['status'] == 'ok')

# Signup
email = f'test{date.today().toordinal()}@example.com'
a = req('/api/auth/signup', {'identifier': email, 'password': 'secret123'})
token = a['token']
check('signup returns token', bool(token))
check('wrong credential rejected', req('/api/auth/signup', {'identifier': email, 'password': 'secret123'}, expect=400) is not None)
l = req('/api/auth/login', {'identifier': email, 'password': 'secret123'})
check('login works', bool(l['token']))

# Auth required
req('/api/profile', expect=401)
check('auth required', True)

# Profile
lmp = (date.today() - timedelta(days=100)).isoformat()
p = req('/api/profile', {'consent': True, 'stage': 'pregnant', 'lmp': lmp, 'language': 'hi', 'high_risk': False}, token=token)
check('EDD computed', p['profile']['computed_edd'] == (date.fromisoformat(lmp) + timedelta(days=280)).isoformat())
check('stage normalized', p['profile']['stage'] == 'pregnancy')
check('ANC tasks generated', len([t for t in p['tasks'] if t['type'] == 'anc']) >= 8)

# Summary
s = req('/api/summary', token=token)
check('summary week 14', s['week'] == 14, str(s['week']))
check('subscription inactive', s['subscription']['active'] is False)

# Triage
r = req('/api/triage', {'text': 'heavy bleeding', 'language': 'en'}, token=token)
check('triage emergency', r['alert'] and r['urgency'] == 'emergency')
r = req('/api/triage', {'text': 'what should I eat', 'language': 'en'}, token=token)
check('no false alert', r['alert'] is False)

# Traditions
tr = req('/api/traditions?q=honey', token=token)
check('honey found', any(t['id'] == 'honey' and t['verdict'] == 'contraindicated' for t in tr))

# Education
e = req('/api/education?language=hi', token=token)
check('education localized', len(e['items']) >= 1 and e['items'][0]['title'] != '')

# Chat
c = req('/api/chat', {'text': 'severe headache and blurred vision', 'language': 'en'}, token=token)
check('chat danger first', c['kind'] == 'danger')

# Tasks
t = req('/api/tasks', {'title': 'Blood test', 'due': (date.today() + timedelta(days=3)).isoformat()}, token=token)
tid = [x for x in t['tasks'] if x['custom']][-1]['id']
req(f'/api/tasks/{tid}/done', {}, token=token)
check('task toggled', any(x['id'] == tid and x['done'] for x in req('/api/tasks', token=token)))

# Subscription verify (demo mode — no secret configured)
v = req('/api/payments/verify', {'razorpay_payment_id': 'demo_1', 'razorpay_order_id': 'order_1', 'razorpay_signature': 'x', 'plan': 'monthly'}, token=token)
check('subscription activated', v['ok'])
s = req('/api/summary', token=token)
check('subscription now active', s['subscription']['active'] is True)

# Data isolation: second user sees no tasks
b = req('/api/auth/signup', {'identifier': f'other{date.today().toordinal()}@example.com', 'password': 'secret123'})
check('user isolation', len(req('/api/tasks', token=b['token'])) == 0)

print('\n' + ('ALL PASSED' if not FAIL else f'{len(FAIL)} FAILED: {FAIL}'))
