"""Security helpers: rate limiting, audit logging, security headers, entitlements."""
import hashlib
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
            "script-src 'self' https://checkout.razorpay.com; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "connect-src 'self' https://api.razorpay.com; "
            "frame-src https://checkout.razorpay.com; "
            "object-src 'none'; base-uri 'self'"
        )
        if PRODUCTION:
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        return response
