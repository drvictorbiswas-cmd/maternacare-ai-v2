"""Ordered, idempotent SQLite migrations using PRAGMA user_version.

Fresh databases are created from scratch; existing v0 databases (the old six-table
schema) are migrated forward without dropping data.
"""
import sqlite3
from pathlib import Path

MIGRATIONS = [
    # v1 — normalize identity, consent, family, care, payments, audit
    """
    -- Legacy/base tables (created on fresh DBs; tolerated on existing ones)
    CREATE TABLE IF NOT EXISTS users(
        id TEXT PRIMARY KEY, email TEXT UNIQUE, phone TEXT UNIQUE,
        password TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profiles(
        user_id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks(
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT, title TEXT,
        due TEXT, week INTEGER, note TEXT, custom INTEGER DEFAULT 0,
        done INTEGER DEFAULT 0, done_at TEXT
    );
    CREATE TABLE IF NOT EXISTS chat(
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL,
        role TEXT, text TEXT, kind TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS subscriptions(
        user_id TEXT PRIMARY KEY, plan TEXT, payment_id TEXT,
        activated_at TEXT, expires_at TEXT
    );
    CREATE TABLE IF NOT EXISTS feedback(
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, text TEXT, created_at TEXT
    );
    -- Normalized schema
    CREATE TABLE IF NOT EXISTS mothers(
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL, date_of_birth TEXT,
        blood_group TEXT, height_cm REAL, weight_kg REAL, high_risk INTEGER DEFAULT 0,
        risk_notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS babies(
        id TEXT PRIMARY KEY, mother_id TEXT NOT NULL, name TEXT, date_of_birth TEXT NOT NULL,
        sex TEXT, birth_weight_g INTEGER, gestation_weeks INTEGER,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS family_links(
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL, baby_id TEXT NOT NULL,
        role TEXT NOT NULL, consent_id TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pregnancies(
        id TEXT PRIMARY KEY, mother_id TEXT NOT NULL, lmp TEXT, edd TEXT, parity INTEGER,
        status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS consents(
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL, purpose TEXT NOT NULL, version TEXT NOT NULL,
        granted_at TEXT NOT NULL, withdrawn_at TEXT, text_hash TEXT
    );
    CREATE TABLE IF NOT EXISTS care_plan_items(
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL, mother_id TEXT, baby_id TEXT,
        type TEXT, title TEXT, due_date TEXT, status TEXT DEFAULT 'pending',
        clinician_override INTEGER DEFAULT 0, created_at TEXT NOT NULL, completed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS growth_measurements(
        id TEXT PRIMARY KEY, baby_id TEXT NOT NULL, measured_at TEXT NOT NULL,
        weight_g INTEGER, length_cm REAL, head_circ_cm REAL, source TEXT, recorded_by TEXT
    );
    CREATE TABLE IF NOT EXISTS immunization_records(
        id TEXT PRIMARY KEY, baby_id TEXT NOT NULL, vaccine_code TEXT, due_date TEXT,
        given_date TEXT, status TEXT DEFAULT 'pending', batch_no TEXT, facility TEXT
    );
    CREATE TABLE IF NOT EXISTS feeding_sessions(
        id TEXT PRIMARY KEY, baby_id TEXT NOT NULL, started_at TEXT NOT NULL,
        ended_at TEXT, type TEXT, notes TEXT
    );
    CREATE TABLE IF NOT EXISTS plans(
        code TEXT PRIMARY KEY, price_paise INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'INR',
        duration_days INTEGER NOT NULL, active INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS payment_events(
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL, order_id TEXT UNIQUE, payment_id TEXT,
        signature_verified INTEGER DEFAULT 0, event_type TEXT, payload_hash TEXT,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_log(
        id INTEGER PRIMARY KEY AUTOINCREMENT, actor_id TEXT, action TEXT NOT NULL,
        entity_type TEXT, entity_id TEXT, detail TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS refresh_tokens(
        token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at TEXT NOT NULL,
        revoked INTEGER DEFAULT 0, created_at TEXT NOT NULL
    );
    INSERT OR IGNORE INTO plans(code, price_paise, currency, duration_days) VALUES
        ('monthly', 99000, 'INR', 30), ('yearly', 799000, 'INR', 365);
    CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_babies_mother ON babies(mother_id);
    CREATE INDEX IF NOT EXISTS idx_care_user ON care_plan_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_growth_baby ON growth_measurements(baby_id);
    CREATE INDEX IF NOT EXISTS idx_imm_baby ON immunization_records(baby_id);
    CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
    """,
    # v2 — legacy table shape alignment (additive, nullable columns)
    """
    ALTER TABLE tasks ADD COLUMN due_date TEXT;
    UPDATE tasks SET due_date = due WHERE due_date IS NULL;
    ALTER TABLE subscriptions ADD COLUMN status TEXT;
    ALTER TABLE subscriptions ADD COLUMN current_period_end TEXT;
    UPDATE subscriptions SET status = 'active', current_period_end = expires_at WHERE status IS NULL;
    CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
    """,
    # v3 — OTP phone verification codes (time-bound, single-use)
    """
    CREATE TABLE IF NOT EXISTS otp_codes(
        id TEXT PRIMARY KEY, phone TEXT NOT NULL, code TEXT NOT NULL,
        purpose TEXT NOT NULL DEFAULT 'login', attempts INTEGER DEFAULT 0,
        expires_at TEXT NOT NULL, used_at TEXT, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone);
    CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);
    """,
]


def migrate(db_path: Path):
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.execute('PRAGMA foreign_keys=ON')
    current = conn.execute('PRAGMA user_version').fetchone()[0]
    for index, sql in enumerate(MIGRATIONS, start=1):
        if index <= current:
            continue
        cleaned = '\n'.join(line for line in sql.splitlines() if not line.strip().startswith('--'))
        for statement in cleaned.split(';'):
            s = statement.strip()
            if not s:
                continue
            try:
                conn.execute(s)
            except sqlite3.OperationalError as exc:
                # Tolerates already-existing columns/tables on partially migrated DBs.
                if 'duplicate column name' not in str(exc).lower() and 'already exists' not in str(exc).lower():
                    raise
        conn.execute(f'PRAGMA user_version={index}')
        conn.commit()
    conn.close()
