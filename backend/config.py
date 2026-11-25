"""Central configuration. Fails closed on missing secrets in production."""
import os
from pathlib import Path

BASE = Path(__file__).parent
ENV = os.environ.get('APP_ENV', 'development').lower()
PRODUCTION = ENV in ('production', 'prod', 'staging')


def _secret(name, default=None, min_len=32):
    value = os.environ.get(name, default)
    if PRODUCTION and (not value or len(value) < min_len or 'change' in value.lower() or 'placeholder' in value.lower()):
        raise RuntimeError(f'{name} must be set to a strong value ({min_len}+ chars) in {ENV}')
    return value or default


JWT_SECRET = _secret('JWT_SECRET', None if PRODUCTION else 'dev-only-secret-change-me-please-32chars')
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
RAZORPAY_WEBHOOK_SECRET = os.environ.get('RAZORPAY_WEBHOOK_SECRET', '')
DATABASE_PATH = Path(os.environ.get('DATABASE_PATH', str(BASE / 'data' / 'maternacare.db')))
FRONTEND = BASE.parent / 'docs'
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get('ALLOWED_ORIGINS', '').split(',') if o.strip()]
if PRODUCTION and not ALLOWED_ORIGINS:
    raise RuntimeError('ALLOWED_ORIGINS must be set in production')
JWT_EXPIRE_MINUTES = int(os.environ.get('JWT_EXPIRE_MINUTES', '60'))
REFRESH_EXPIRE_DAYS = int(os.environ.get('REFRESH_EXPIRE_DAYS', '30'))
