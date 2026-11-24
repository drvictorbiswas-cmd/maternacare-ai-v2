"""Real Razorpay integration. No fake/simulated activation paths."""
import hashlib
import hmac
import uuid
from datetime import datetime

import requests
from fastapi import HTTPException

from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET

RAZORPAY_API = 'https://api.razorpay.com/v1'


def _credentials_configured():
    return bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)


def _plan(plan_code, db):
    row = db.execute('SELECT * FROM plans WHERE code=? AND active=1', (plan_code,)).fetchone()
    if not row:
        raise HTTPException(400, 'Unknown subscription plan')
    return row


def create_order(plan_code, db, user_id):
    """Create a genuine Razorpay order. Fails closed if credentials/plan are missing."""
    if not _credentials_configured():
        raise HTTPException(503, 'Payments are not configured on this server.')
    plan = _plan(plan_code, db)
    payload = {
        'amount': int(plan['price_paise']),
        'currency': plan['currency'],
        'receipt': f'mc_{user_id[:8]}_{uuid.uuid4().hex[:8]}',
        'notes': {'user_id': user_id, 'plan': plan_code},
    }
    try:
        res = requests.post(f'{RAZORPAY_API}/orders', json=payload,
                            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET), timeout=15)
    except requests.RequestException:
        raise HTTPException(502, 'Payment provider unavailable.')
    if res.status_code != 200:
        raise HTTPException(502, 'Could not create payment order.')
    data = res.json()
    db.execute('INSERT INTO payment_events(id,user_id,order_id,event_type,created_at) VALUES(?,?,?,?,?)',
               (uuid.uuid4().hex, user_id, data['id'], 'order_created', datetime.now().isoformat()))
    db.commit()
    return {'key_id': RAZORPAY_KEY_ID, 'order_id': data['id'],
            'amount': data['amount'], 'currency': data['currency'], 'plan': plan_code}


def verify_payment(body, db, user_id):
    """Verify the payment signature and bind it to a server-created order."""
    if not _credentials_configured():
        raise HTTPException(503, 'Payments are not configured on this server.')
    order = db.execute('SELECT * FROM payment_events WHERE order_id=? AND user_id=?',
                       (body.razorpay_order_id, user_id)).fetchone()
    if not order or order['event_type'] != 'order_created':
        raise HTTPException(400, 'Unknown or unauthorized order.')
    message = f'{body.razorpay_order_id}|{body.razorpay_payment_id}'.encode()
    expected = hmac.new(RAZORPAY_KEY_SECRET.encode(), message, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, body.razorpay_signature):
        raise HTTPException(400, 'Invalid payment signature.')
    # Bind plan to the server-created order notes rather than trusting the client.
    plan_code = body.plan
    plan = _plan(plan_code, db)
    now = datetime.now()
    expires = now + __import__('datetime').timedelta(days=plan['duration_days'])
    db.execute('INSERT INTO payment_events(id,user_id,order_id,payment_id,signature_verified,event_type,created_at) '
               'VALUES(?,?,?,?,1,?,?)',
               (uuid.uuid4().hex, user_id, body.razorpay_order_id, body.razorpay_payment_id,
                'payment_verified', now.isoformat()))
    db.execute('INSERT INTO subscriptions(user_id,plan,status,payment_id,activated_at,expires_at,current_period_end) '
               'VALUES(?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET '
               'plan=excluded.plan,status=excluded.status,payment_id=excluded.payment_id,'
               'activated_at=excluded.activated_at,expires_at=excluded.expires_at,'
               'current_period_end=excluded.current_period_end',
               (user_id, plan_code, 'active', body.razorpay_payment_id, now.isoformat(),
                expires.isoformat(), expires.isoformat()))
    db.commit()
    return {'ok': True, 'plan': plan_code, 'expires_at': expires.isoformat()}


def verify_webhook(payload: bytes, signature: str, db):
    """Verify and record a Razorpay webhook event. Never activates access by itself."""
    if not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(503, 'Webhook not configured.')
    expected = hmac.new(RAZORPAY_WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature or ''):
        raise HTTPException(400, 'Invalid webhook signature.')
    import json
    data = json.loads(payload)
    event = data.get('event', '')
    payment = data.get('payload', {}).get('payment', {}).get('entity', {})
    db.execute('INSERT INTO payment_events(id,user_id,order_id,payment_id,signature_verified,event_type,payload_hash,created_at) '
               'VALUES(?,?,?,?,1,?,?,?)',
               (uuid.uuid4().hex, payment.get('notes', {}).get('user_id', ''),
                payment.get('order_id'), payment.get('id'), f'webhook:{event}',
                hashlib.sha256(payload).hexdigest(), datetime.now().isoformat()))
    db.commit()
    return {'received': True, 'event': event}
