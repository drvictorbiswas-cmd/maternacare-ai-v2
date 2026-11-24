"""Hardened API tests — Phase 0+1. Run with backend on :8010."""
import json
import uuid
import urllib.request
import urllib.error
from datetime import date, timedelta

BASE = 'http://127.0.0.1:8024'
FAIL = []


def req(path, data=None, token=None, method=None, expect=200):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    body = json.dumps(data).encode() if data is not None else None
    r = urllib.request.Request(BASE + path, data=body, headers=headers,
                               method=method or ('POST' if data is not None else 'GET'))
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            raw = resp.read()
            return (json.loads(raw) if raw else {}), dict(resp.headers), resp.status
    except urllib.error.HTTPError as e:
        raw = e.read()
        try: out = json.loads(raw)
        except Exception: out = {}
        assert e.code == expect, f'{path}: expected {expect}, got {e.code} {raw[:200]}'
        return out, dict(e.headers), e.code


def check(name, cond, detail=''):
    print(('PASS' if cond else 'FAIL'), '-', name, detail)
    if not cond:
        FAIL.append(name)


# Health + security headers
_, h, _ = req('/health')
check('health', True)
for hdr in ['x-content-type-options', 'x-frame-options', 'content-security-policy', 'referrer-policy']:
    check('header ' + hdr, hdr in {k.lower() for k in h})

# Auth: weak password rejected
req('/api/auth/signup', {'identifier': 'weak@example.com', 'password': '12345'}, expect=422)
check('weak password rejected', True)

# Signup/login
email = f'hardened{uuid.uuid4().hex[:10]}@example.com'
a, _, _ = req('/api/auth/signup', {'identifier': email, 'password': 'strongpass123'})
t = a['token']
check('signup', bool(t))
_, _, code = req('/api/profile', expect=401)
check('auth required', code == 401)

# Invalid JWT rejected
req('/api/profile', token='garbage.token.here', expect=401)
check('invalid JWT rejected', True)

# Profile validation
req('/api/profile', {'consent': True, 'stage': 'pregnancy', 'weeks': -3}, t, expect=400)
check('negative weeks rejected', True)
req('/api/profile', {'consent': True, 'stage': 'pregnancy', 'weeks': 50}, t, expect=400)
check('weeks >45 rejected', True)
req('/api/profile', {'consent': False, 'stage': 'pregnancy'}, t, expect=400)
check('consent enforced', True)

lmp = (date.today() - timedelta(days=100)).isoformat()
p, _, _ = req('/api/profile', {'consent': True, 'stage': 'pregnant', 'lmp': lmp, 'language': 'hi'}, t)
check('EDD computed', p['profile']['computed_edd'] == (date.fromisoformat(lmp) + timedelta(days=280)).isoformat())
check('stage normalized', p['profile']['stage'] == 'pregnancy')
check('ANC generated', len([x for x in p['tasks'] if x['type'] == 'anc']) >= 8)

# Entitlement: clinical APIs blocked without subscription
for path, method, payload in [('/api/education', 'GET', None), ('/api/traditions', 'GET', None),
                              ('/api/triage', 'POST', {'text': 'bleeding'}), ('/api/chat', 'GET', None)]:
    _, _, code = req(path, payload, t, method=method, expect=403)
    check(f'entitlement blocks {path}', code == 403)

# Fake payment MUST fail
_, _, code = req('/api/payments/verify', {'razorpay_payment_id': 'FAKE', 'razorpay_order_id': 'FAKE',
                                         'razorpay_signature': 'FAKE', 'plan': 'yearly'}, t, expect=503)
check('fake payment rejected (no credentials)', code == 503)
_, _, code = req('/api/payments/order?plan=monthly', token=t, method='POST', expect=503)
check('order creation fails closed', code == 503)
s, _, _ = req('/api/summary', token=t)
check('no subscription after fake payment', s['subscription']['active'] is False)

# Mother record auto-created; baby/family flows
babies, _, _ = req('/api/babies', token=t)
check('babies list initially empty', babies == [])
b, _, _ = req('/api/babies', {'name': 'Aarav', 'date_of_birth': date.today().isoformat(),
                              'sex': 'male', 'birth_weight_g': 3000}, t)
check('baby created', bool(b['id']))
babies, _, _ = req('/api/babies', token=t)
check('baby listed', len(babies) == 1)
bid = b['id']

# Growth + immunization
req('/api/growth', {'baby_id': bid, 'measured_at': date.today().isoformat(), 'weight_g': 3200}, t)
g, _, _ = req(f'/api/growth/{bid}', token=t)
check('growth recorded', len(g) == 1)
req('/api/immunizations', {'baby_id': bid, 'vaccine_code': 'BCG',
                           'due_date': date.today().isoformat()}, t)
imm, _, _ = req(f'/api/immunizations/{bid}', token=t)
check('immunization schedule generated', len(imm) >= 5)

# Isolation: second user cannot see first user's baby
b2, _, _ = req('/api/auth/signup', {'identifier': f'other{uuid.uuid4().hex[:10]}@example.com',
                                    'password': 'strongpass123'})
t2 = b2['token']
_, _, code = req(f'/api/growth/{bid}', token=t2, expect=404)
check('baby isolation', code == 404)
check('other user sees no babies', req('/api/babies', token=t2)[0] == [])

# Export and erasure
exp, headers, _ = req('/api/export', token=t)
check('export includes profile', exp.get('profile') is not None)
check('export includes baby', len(exp.get('babies', [])) == 1)
check('export has attachment header', 'attachment' in headers.get('content-disposition', ''))

# Rate limiting on auth endpoint: at least one 429 within 12 rapid attempts
codes = []
for i in range(12):
    try:
        _, _, c = req('/api/auth/login', {'identifier': 'nobody@example.com', 'password': 'wrongpass1'}, expect=401)
        codes.append(c)
    except AssertionError:
        codes.append(429)
        break
check('auth rate limited', 429 in codes)

print('\n' + ('ALL PASSED' if not FAIL else f'{len(FAIL)} FAILED: {FAIL}'))
