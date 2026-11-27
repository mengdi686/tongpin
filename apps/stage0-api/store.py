#!/usr/bin/env python3
"""同频阶段0 数据层：加密、建表、脱敏与删除。

只负责数据落地，不含 HTTP 逻辑。与 server.py 同目录部署，
systemd 以 WorkingDirectory=/srv/tongpin-data 启动，import 走脚本目录。
"""
import os
import sqlite3
import time
from cryptography.fernet import Fernet

DATA_DIR = os.environ.get("TP_DATA_DIR", "/srv/tongpin-data")
DB_PATH = os.path.join(DATA_DIR, "stage0.db")
KEY_PATH = os.path.join(DATA_DIR, ".fernet.key")
TABLES = ("visitors", "events", "profiles", "reservations",
          "births", "result_snapshots", "face_checks", "identities")


def cipher():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(KEY_PATH):
        with open(KEY_PATH, "wb") as f:
            f.write(Fernet.generate_key())
        os.chmod(KEY_PATH, 0o600)
    with open(KEY_PATH, "rb") as f:
        return Fernet(f.read())


CIPHER = cipher()


def db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    with db() as c:
        c.executescript("""
        PRAGMA journal_mode=WAL;
        CREATE TABLE IF NOT EXISTS visitors (
            vid TEXT PRIMARY KEY, created_at INTEGER NOT NULL, last_seen INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT, vid TEXT NOT NULL, type TEXT NOT NULL,
            payload TEXT NOT NULL DEFAULT '{}', ts INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_events_vid ON events(vid);
        CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
        CREATE TABLE IF NOT EXISTS profiles (
            vid TEXT PRIMARY KEY, resonance INTEGER NOT NULL, styles TEXT NOT NULL,
            care_top TEXT NOT NULL, animal TEXT NOT NULL, ts INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT, vid TEXT NOT NULL, phone TEXT UNIQUE NOT NULL,
            created_at INTEGER NOT NULL, linked_at INTEGER
        );
        CREATE TABLE IF NOT EXISTS births (
            vid TEXT PRIMARY KEY, date_enc TEXT, time_enc TEXT, gender TEXT,
            day_master TEXT, elements TEXT, zodiac TEXT,
            consent_at INTEGER, created_at INTEGER, updated_at INTEGER
        );
        CREATE TABLE IF NOT EXISTS result_snapshots (
            vid TEXT NOT NULL, rules_version TEXT NOT NULL, answers TEXT NOT NULL,
            resonance INTEGER, styles TEXT, care_top TEXT, animal TEXT, ts INTEGER,
            PRIMARY KEY (vid, rules_version)
        );
        CREATE TABLE IF NOT EXISTS face_checks (
            id INTEGER PRIMARY KEY AUTOINCREMENT, vid TEXT NOT NULL,
            risk_score INTEGER NOT NULL, verdict TEXT NOT NULL, ts INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS identities (
            vid TEXT PRIMARY KEY, openid_enc TEXT, unionid_enc TEXT,
            created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
        );
        """)


def touch(vid):
    now = int(time.time())
    with db() as c:
        c.execute(
            "INSERT INTO visitors(vid,created_at,last_seen) VALUES(?,?,?) "
            "ON CONFLICT(vid) DO UPDATE SET last_seen=excluded.last_seen",
            (vid, now, now))


def enc(value):
    return CIPHER.encrypt(str(value).encode()).decode() if value else None


def dec(value):
    return CIPHER.decrypt(value.encode()).decode() if value else None


def clean_payload(raw):
    if not isinstance(raw, dict):
        return {}
    safe = {}
    for k in ("index", "total", "qid", "value", "resonance", "animal", "step", "ref"):
        if k in raw:
            v = raw[k]
            if isinstance(v, (int, float, str, bool)) and len(str(v)) < 80:
                safe[k] = v
    return safe


def bind_identity(vid, openid, unionid=""):
    """绑定小程序身份锚点。openid/unionid 加密留存，session_key 永不落库。"""
    now = int(time.time())
    with db() as c:
        c.execute(
            "INSERT INTO identities(vid,openid_enc,unionid_enc,created_at,updated_at) "
            "VALUES(?,?,?,?,?) ON CONFLICT(vid) DO UPDATE SET "
            "openid_enc=excluded.openid_enc,unionid_enc=excluded.unionid_enc,updated_at=excluded.updated_at",
            (vid, enc(openid), enc(unionid) if unionid else None, now, now))


def delete_all(vid):
    """按 vid 删除全部个人信息，履行删除权（预约手机号一并清除）。"""
    with db() as c:
        for table in TABLES:
            c.execute(f"DELETE FROM {table} WHERE vid=?", (vid,))
