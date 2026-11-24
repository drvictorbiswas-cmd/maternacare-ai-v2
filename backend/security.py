"""Security helpers: rate limiting, audit logging, security headers, entitlements, OTP."""
import hashlib
import os
import random
import time
import uuid
from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import HTTPException, Request

from config import PRODUCTION

class RateLimiter:
    """Minimal in-memory fixed-window limiter. Use Redis in multi-worker production."""
    def __init__(self, max_requests=10, window_seconds=60):
        self.max = max_requests
        self.window = window_seconds
        self.hits = defaultdict(list)

    def check(self, key: str):
        now = time.time()
        entries = [t for t in self.hits[key] if now - t < self.window]
        self.hits[key] = entries
        if len(entries) >= self.max:
            raise HTTPException(429, 'Too many requests. Try again later.')
        entries.append(now)


auth_limiter = RateLimiter(max_requests=8, window_seconds=60)
api_limiter = RateLimiter(max_requests=120, window_seconds=60)
otp_limiter = RateLimiter(max_requests=5, window_seconds=60)   # OTP sends per phone/min
otp_verify_limiter = RateLimiter(max_requests=10, window_seconds=60)  # OTP verify attempts/min


def generate_otp_code(length: int = 6) -> str:
    return ''.join(random.choice('0123456789') for _ in range(length))


def store_otp(db, phone: str, code: str, purpose: str = 'login', ttl_minutes: int = 10):
    """Store an OTP code, invalidating any previous unused code for the same phone/purpose."""
    now = datetime.now()
    expires = now + timedelta(minutes=ttl_minutes)
    # Invalidate previous unused OTPs for this phone/purpose (single-use flow).
    db.execute(
        'UPDATE otp_codes SET used_at=? WHERE phone=? AND purpose=? AND used_at IS NULL',
        (now.isoformat(), phone, purpose))
    db.execute(
        'INSERT INTO otp_codes(id,phone,code,purpose,expires_at,created_at) VALUES(?,?,?,?,?,?)',
        (uuid.uuid4().hex, phone, code, purpose, expires.isoformat(), now.isoformat()))
    db.commit()


def verify_otp(db, phone: str, code: str, purpose: str = 'login') -> bool:
    """Verify an OTP code. Returns True if valid and marks it used. Single-use."""
    row = db.execute(
        'SELECT id,code,expires_at,used_at,attempts FROM otp_codes '
        'WHERE phone=? AND purpose=? AND used_at IS NULL '
        'ORDER BY created_at DESC LIMIT 1',
        (phone, purpose)).fetchone()
    if not row:
        return False
    now = datetime.now()
    if now > datetime.fromisoformat(row['expires_at']):
        return False  # expired
    if row['code'] != code:
        db.execute('UPDATE otp_codes SET attempts=attempts+1 WHERE id=?', (row['id'],))
        db.commit()
        return False  # wrong code
    db.execute('UPDATE otp_codes SET used_at=? WHERE id=?', (now.isoformat(), row['id']))
    db.commit()
    return True


def clean_expired_otps(db):
    """Mark expired OTPs as used so they cannot be reused."""
    now = datetime.now().isoformat()
    db.execute('UPDATE otp_codes SET used_at=? WHERE used_at IS NULL AND expires_at < ?',
               (now, now))
    db.commit()


def send_otp_sms(phone: str, code: str, purpose: str = 'login') -> dict:
    """Send an OTP via SMS. Configured provider in production; dev mode logs to console.

    Returns {sent: True, provider, detail}. Never returns the code in production.
    """
    provider = os.environ.get('OTP_SMS_PROVIDER', 'dev').lower()
    account_sid = os.environ.get('OTP_SMS_ACCOUNT_SID', '')
    auth_token = os.environ.get('OTP_SMS_AUTH_TOKEN', '')
    from_number = os.environ.get('OTP_SMS_FROM_NUMBER', '')

    if provider == 'dev' or not (account_sid and auth_token and from_number):
        # Development mode: log the OTP so it can be read from server logs.
        print(f'[OTP DEV] {purpose} code for {phone}: {code}')
        return {'sent': True, 'provider': 'dev', 'detail': 'OTP logged to server console (dev mode).'}

    # Production: Twilio example. Wire your provider here.
    try:
        from twilio.rest import Client  # type: ignore
        client = Client(account_sid, auth_token)
        client.messages.create(
            body=f'Your Maternacare AI OTP is {code}. Valid for 10 minutes.',
            from_=from_number,
            to=phone,
        )
        return {'sent': True, 'provider': 'twilio', 'detail': 'SMS sent.'}
    except Exception as exc:  # noqa: BLE001
        return {'sent': False, 'provider': 'twilio', 'detail': str(exc)}


def client_key(request: Request):
    return (request.headers.get('x-forwarded-for', '').split(',')[0].strip()
            or request.client.host if request.client else 'unknown')


def audit(db, actor_id, action, entity_type=None, entity_id=None, detail=None):
    db.execute(
        'INSERT INTO audit_log(actor_id,action,entity_type,entity_id,detail,created_at) '
        'VALUES(?,?,?,?,?,?)',
        (actor_id, action, entity_type, entity_id, detail, datetime.now().isoformat()))


def require_entitlement(db, user_id):
    """Server-side subscription check — never trust the UI."""
    row = db.execute('SELECT status,current_period_end FROM subscriptions WHERE user_id=?',
                     (user_id,)).fetchone()
    if not row or row['status'] != 'active' or not row['current_period_end']:
        raise HTTPException(403, 'An active subscription is required for this feature.')
    if row['current_period_end'] <= datetime.now().isoformat():
        raise HTTPException(403, 'Subscription has expired.')
    return True


def install_security_headers(app):
    @app.middleware('http')
    async def security_headers(request, call_next):
        response = await call_next(request)
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Referrer-Policy'] = 'no-referrer'
        response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com; "
            "frame-src https://checkout.razorpay.com; "
            "object-src 'none'; base-uri 'self'"
        )
        if PRODUCTION:
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        return response
