#!/usr/bin/env python3
"""同频 阶段0 数据采集服务。

零第三方依赖：Python 标准库 http.server + sqlite3。
数据全部落在独立目录 /srv/tongpin-data/，与其他项目隔离。
隐私红线：生辰、时辰、人脸、身份证一律不落库、不进日志。
"""

import json
import os
import re
import sqlite3
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get("TP_DATA_DIR", "/srv/tongpin-data")
DB_PATH = os.path.join(DATA_DIR, "stage0.db")
HOST = os.environ.get("TP_HOST", "127.0.0.1")
PORT = int(os.environ.get("TP_PORT", "8766"))
PHONE_RE = re.compile(r"^1\d{10}$")
ALLOWED_EVENTS = {
    "visit", "gate_pass", "gate_reject", "consent_agree",
    "birth_submit", "q_answer", "q_back", "result_view",
    "share_click", "reserve_submit", "again",
}


def db():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with db() as c:
        c.executescript("""
        PRAGMA journal_mode=WAL;
        CREATE TABLE IF NOT EXISTS visitors (
            vid TEXT PRIMARY KEY,
            created_at INTEGER NOT NULL,
            last_seen INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vid TEXT NOT NULL,
            type TEXT NOT NULL,
            payload TEXT NOT NULL DEFAULT '{}',
            ts INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_events_vid ON events(vid);
        CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
        CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
        CREATE TABLE IF NOT EXISTS profiles (
            vid TEXT PRIMARY KEY,
            resonance INTEGER NOT NULL,
            styles TEXT NOT NULL,
            care_top TEXT NOT NULL,
            animal TEXT NOT NULL,
            ts INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vid TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            created_at INTEGER NOT NULL,
            linked_at INTEGER
        );
        CREATE INDEX IF NOT EXISTS idx_res_vid ON reservations(vid);
        """)


def touch(vid):
    now = int(time.time())
    with db() as c:
        c.execute(
            "INSERT INTO visitors(vid,created_at,last_seen) VALUES(?,?,?) "
            "ON CONFLICT(vid) DO UPDATE SET last_seen=excluded.last_seen",
            (vid, now, now),
        )


def clean_payload(raw):
    """只保留安全字段，杜绝生辰/时辰等敏感信息意外入库。"""
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
        # 默认日志不写请求体，避免敏感信息进日志
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
            if n <= 0 or n > 65536:
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
                c.execute(
                    "INSERT INTO events(vid,type,payload,ts) VALUES(?,?,?,?)",
                    (vid, etype, json.dumps(clean_payload(data.get("payload")), ensure_ascii=False), int(time.time())),
                )
            return self._send(200, {"ok": True})

        if path == "/api/profile":
            touch(vid)
            resonance = data.get("resonance")
            if not isinstance(resonance, int) or not 0 <= resonance <= 100:
                return self._send(400, {"error": "bad resonance"})
            with db() as c:
                c.execute(
                    "INSERT INTO profiles(vid,resonance,styles,care_top,animal,ts) "
                    "VALUES(?,?,?,?,?,?) ON CONFLICT(vid) DO UPDATE SET "
                    "resonance=excluded.resonance, styles=excluded.styles, "
                    "care_top=excluded.care_top, animal=excluded.animal, ts=excluded.ts",
                    (
                        vid, resonance,
                        json.dumps(data.get("styles", []), ensure_ascii=False)[:2000],
                        json.dumps(data.get("careTop", []), ensure_ascii=False)[:2000],
                        str(data.get("animal", ""))[:40],
                        int(time.time()),
                    ),
                )
            return self._send(200, {"ok": True})

        if path == "/api/reserve":
            phone = str(data.get("phone", "")).strip()
            if not PHONE_RE.match(phone):
                return self._send(400, {"error": "bad phone"})
            touch(vid)
            with db() as c:
                c.execute(
                    "INSERT OR IGNORE INTO reservations(vid,phone,created_at) VALUES(?,?,?)",
                    (vid, phone, int(time.time())),
                )
            return self._send(200, {"ok": True})

        if path == "/api/link":
            # 后续注册时调用：把手机号对应的预约记录标记为已关联
            phone = str(data.get("phone", "")).strip()
            if not PHONE_RE.match(phone):
                return self._send(400, {"error": "bad phone"})
            with db() as c:
                c.execute(
                    "UPDATE reservations SET linked_at=? WHERE phone=? AND vid=?",
                    (int(time.time()), phone, vid),
                )
            return self._send(200, {"ok": True})

        self._send(404, {"error": "not found"})

    def _stats(self):
        with db() as c:
            visitors = c.execute("SELECT COUNT(*) FROM visitors").fetchone()[0]
            events = c.execute("SELECT COUNT(*) FROM events").fetchone()[0]
            profiles = c.execute("SELECT COUNT(*) FROM profiles").fetchone()[0]
            reserves = c.execute("SELECT COUNT(*) FROM reservations").fetchone()[0]
            by_type = {
                r["type"]: r["n"]
                for r in c.execute("SELECT type, COUNT(*) n FROM events GROUP BY type")
            }
        self._send(200, {
            "ok": True, "visitors": visitors, "events": events,
            "profiles": profiles, "reservations": reserves, "byType": by_type,
        })


if __name__ == "__main__":
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"stage0-api listening on {HOST}:{PORT}, data={DB_PATH}", flush=True)
    server.serve_forever()
