#!/usr/bin/env python3
"""同频 阶段0 数据采集服务。

零第三方业务依赖（加密用 cryptography，服务器已装）：
数据全部落在独立目录 /srv/tongpin-data/，与其他项目隔离。
生辰经 Fernet 加密落库；人脸只存结论不存原图；身份证一律不碰。
"""

import json
import os
import re
import sqlite3
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse
from cryptography.fernet import Fernet

DATA_DIR = os.environ.get("TP_DATA_DIR", "/srv/tongpin-data")
DB_PATH = os.path.join(DATA_DIR, "stage0.db")
KEY_PATH = os.path.join(DATA_DIR, ".fernet.key")
HOST = os.environ.get("TP_HOST", "127.0.0.1")
PORT = int(os.environ.get("TP_PORT", "8766"))
RULES_VERSION = "2026-11-26.1"
PHONE_RE = re.compile(r"^1\d{10}$")
ALLOWED_EVENTS = {
    "visit", "gate_pass", "gate_reject", "consent_agree",
    "birth_submit", "q_answer", "q_back", "result_view",
    "share_click", "reserve_submit", "again",
}


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
    for k in ("index", "total", "qid", "value", "resonance", "animal", "step"):
        if k in raw:
            v = raw[k]
            if isinstance(v, (int, float, str, bool)) and len(str(v)) < 80:
                safe[k] = v
    return safe


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        pass

    def _send(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def _body(self):
        try:
            n = int(self.headers.get("Content-Length", "0"))
            if n <= 0 or n > 262144:
                return {}
            return json.loads(self.rfile.read(n).decode("utf-8"))
        except Exception:
            return {}

    def do_OPTIONS(self):
        self._send(204, {})

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/health":
            return self._send(200, {"ok": True, "ts": int(time.time())})
        if path == "/api/stats":
            return self._stats()
        self._send(404, {"error": "not found"})

    def do_POST(self):
        path = urlparse(self.path).path
        data = self._body()
        vid = str(data.get("vid", ""))[:64]
        if not vid:
            return self._send(400, {"error": "missing vid"})

        if path == "/api/event":
            etype = str(data.get("type", ""))[:40]
            if etype not in ALLOWED_EVENTS:
                return self._send(400, {"error": "bad event type"})
            touch(vid)
            with db() as c:
                c.execute("INSERT INTO events(vid,type,payload,ts) VALUES(?,?,?,?)",
                          (vid, etype, json.dumps(clean_payload(data.get("payload")), ensure_ascii=False), int(time.time())))
            return self._send(200, {"ok": True})

        if path == "/api/profile":
            touch(vid)
            resonance = data.get("resonance")
            if not isinstance(resonance, int) or not 0 <= resonance <= 100:
                return self._send(400, {"error": "bad resonance"})
            with db() as c:
                c.execute(
                    "INSERT INTO profiles(vid,resonance,styles,care_top,animal,ts) VALUES(?,?,?,?,?,?) "
                    "ON CONFLICT(vid) DO UPDATE SET resonance=excluded.resonance,styles=excluded.styles,"
                    "care_top=excluded.care_top,animal=excluded.animal,ts=excluded.ts",
                    (vid, resonance, json.dumps(data.get("styles", []), ensure_ascii=False)[:2000],
                     json.dumps(data.get("careTop", []), ensure_ascii=False)[:2000],
                     str(data.get("animal", ""))[:40], int(time.time())))
            return self._send(200, {"ok": True})

        if path == "/api/result":
            # 存原始答案与规则版本，供后续补填生辰时可复现
            answers = data.get("answers")
            if not isinstance(answers, dict) or len(answers) > 60:
                return self._send(400, {"error": "bad answers"})
            touch(vid)
            with db() as c:
                c.execute(
                    "INSERT INTO result_snapshots(vid,rules_version,answers,resonance,styles,care_top,animal,ts) "
                    "VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(vid,rules_version) DO UPDATE SET "
                    "answers=excluded.answers,resonance=excluded.resonance,styles=excluded.styles,"
                    "care_top=excluded.care_top,animal=excluded.animal,ts=excluded.ts",
                    (vid, RULES_VERSION, json.dumps(answers, ensure_ascii=False)[:4000],
                     data.get("resonance"), json.dumps(data.get("styles", []), ensure_ascii=False)[:2000],
                     json.dumps(data.get("careTop", []), ensure_ascii=False)[:2000],
                     str(data.get("animal", ""))[:40], int(time.time())))
            return self._send(200, {"ok": True, "rulesVersion": RULES_VERSION})

        if path == "/api/birth":
            # 生辰加密落库；派生结果明文用于后续匹配；须带单独同意标记
            if not data.get("consent"):
                return self._send(403, {"error": "consent required"})
            date_val = str(data.get("date", ""))[:20]
            time_val = str(data.get("time", ""))[:10]
            if not re.match(r"^\d{4}-\d{2}-\d{2}$", date_val):
                return self._send(400, {"error": "bad date"})
            touch(vid)
            now = int(time.time())
            with db() as c:
                c.execute(
                    "INSERT INTO births(vid,date_enc,time_enc,gender,day_master,elements,zodiac,consent_at,created_at,updated_at) "
                    "VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(vid) DO UPDATE SET "
                    "date_enc=excluded.date_enc,time_enc=excluded.time_enc,gender=excluded.gender,"
                    "day_master=excluded.day_master,elements=excluded.elements,zodiac=excluded.zodiac,updated_at=excluded.updated_at",
                    (vid, enc(date_val), enc(time_val), str(data.get("gender", ""))[:2],
                     str(data.get("dayMaster", ""))[:4],
                     json.dumps(data.get("elements", {}), ensure_ascii=False)[:1000],
                     str(data.get("zodiac", ""))[:8], now, now, now))
            return self._send(200, {"ok": True})

        if path == "/api/birth/delete":
            with db() as c:
                c.execute("DELETE FROM births WHERE vid=?", (vid,))
            return self._send(200, {"ok": True})

        if path == "/api/backfill":
            # 后补匹配：取回原始答案 + 派生结果，前端按同规则重算
            with db() as c:
                snap = c.execute(
                    "SELECT answers,rules_version,resonance,styles,care_top,animal FROM result_snapshots "
                    "WHERE vid=? ORDER BY ts DESC LIMIT 1", (vid,)).fetchone()
                birth = c.execute(
                    "SELECT day_master,elements,zodiac,time_enc IS NOT NULL AS has_time FROM births WHERE vid=?",
                    (vid,)).fetchone()
            return self._send(200, {
                "ok": True,
                "snapshot": dict(snap) if snap else None,
                "birth": dict(birth) if birth else None,
            })

        if path == "/api/face-check":
            # 只存检测结论与风险分，原图从不上传、不落库
            score = data.get("riskScore")
            if not isinstance(score, int) or not 0 <= score <= 100:
                return self._send(400, {"error": "bad riskScore"})
            verdict = str(data.get("verdict", "pass"))[:20]
            with db() as c:
                c.execute("INSERT INTO face_checks(vid,risk_score,verdict,ts) VALUES(?,?,?,?)",
                          (vid, score, verdict, int(time.time())))
            return self._send(200, {"ok": True})

        if path == "/api/reserve":
            phone = str(data.get("phone", "")).strip()
            if not PHONE_RE.match(phone):
                return self._send(400, {"error": "bad phone"})
            touch(vid)
            with db() as c:
                c.execute("INSERT OR IGNORE INTO reservations(vid,phone,created_at) VALUES(?,?,?)",
                          (vid, phone, int(time.time())))
            return self._send(200, {"ok": True})

        if path == "/api/link":
            phone = str(data.get("phone", "")).strip()
            if not PHONE_RE.match(phone):
                return self._send(400, {"error": "bad phone"})
            with db() as c:
                c.execute("UPDATE reservations SET linked_at=? WHERE phone=? AND vid=?",
                          (int(time.time()), phone, vid))
            return self._send(200, {"ok": True})

        self._send(404, {"error": "not found"})

    def _stats(self):
        with db() as c:
            def count(t):
                return c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
            by_type = {r["type"]: r["n"] for r in c.execute(
                "SELECT type, COUNT(*) n FROM events GROUP BY type")}
            self._send(200, {
                "ok": True, "visitors": count("visitors"), "events": count("events"),
                "profiles": count("profiles"), "reservations": count("reservations"),
                "births": count("births"), "snapshots": count("result_snapshots"),
                "faceChecks": count("face_checks"), "byType": by_type,
            })


if __name__ == "__main__":
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"stage0-api listening on {HOST}:{PORT}, data={DB_PATH}", flush=True)
    server.serve_forever()
