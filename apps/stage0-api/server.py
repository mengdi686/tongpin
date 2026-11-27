#!/usr/bin/env python3
"""同频 阶段0 数据采集服务（HTTP 层）。

数据落地见同目录 store.py。生辰加密、人脸只存结论、身份证一律不碰。
"""
import json
import os
import re
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

from store import DATA_DIR, DB_PATH, db, init_db, touch, enc, clean_payload, delete_all, bind_identity

HOST = os.environ.get("TP_HOST", "127.0.0.1")
PORT = int(os.environ.get("TP_PORT", "8766"))
RULES_VERSION = "2026-11-26.1"
PHONE_RE = re.compile(r"^1\d{10}$")
# stats 鉴权：未设置令牌一律拒绝（fail-closed），避免公网直读漏斗数据
STATS_TOKEN = os.environ.get("TP_STATS_TOKEN", "")
# 小程序 code2session 凭据：未配置时 wx-login 返回降级，不阻断测评
WX_APPID = os.environ.get("TP_WX_APPID", "")
WX_SECRET = os.environ.get("TP_WX_SECRET", "")
# 同源反代下浏览器不会预检；白名单仅用于将来前端独立域名时放行
ALLOWED_ORIGINS = {
    "https://stage0.tongpin.truthhare.com",
    "https://www.truthhare.com",
}
ALLOWED_EVENTS = {
    "visit", "gate_pass", "gate_reject", "consent_agree",
    "birth_submit", "q_answer", "q_back", "result_view",
    "share_click", "share_copy", "ref_in", "reserve_submit", "again",
}


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        pass

    def _send(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
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
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
            self.send_header("Access-Control-Max-Age", "600")
            self.send_header("Content-Length", "0")
        else:
            self.send_response(403)
            self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/health":
            return self._send(200, {"ok": True, "ts": int(time.time())})
        if path == "/api/stats":
            if not STATS_TOKEN or self.headers.get("X-Stats-Token") != STATS_TOKEN:
                return self._send(403, {"error": "forbidden"})
            return self._stats()
        self._send(404, {"error": "not found"})

    def do_POST(self):
        path = urlparse(self.path).path
        data = self._body()
        vid = str(data.get("vid", ""))[:64]
        if not vid:
            return self._send(400, {"error": "missing vid"})

        if path == "/api/wx-login":
            code = str(data.get("code", ""))[:64]
            if not code:
                return self._send(400, {"error": "missing code"})
            if not WX_APPID or not WX_SECRET:
                return self._send(200, {"ok": False, "reason": "not_configured"})
            qs = urllib.parse.urlencode({
                "appid": WX_APPID, "secret": WX_SECRET,
                "js_code": code, "grant_type": "authorization_code",
            })
            try:
                with urllib.request.urlopen(
                        "https://api.weixin.qq.com/sns/jscode2session?" + qs, timeout=6) as resp:
                    wxdata = json.loads(resp.read().decode("utf-8"))
            except Exception:
                return self._send(200, {"ok": False, "reason": "wx_unreachable"})
            openid = str(wxdata.get("openid", ""))[:64]
            if not openid:
                return self._send(200, {"ok": False, "reason": "invalid_code"})
            bind_identity(vid, openid, str(wxdata.get("unionid", ""))[:64])
            # session_key 只用于本次解密，绝不返回、绝不落库
            return self._send(200, {"ok": True, "openidTail": openid[-6:]})

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

        if path == "/api/delete":
            delete_all(vid)
            return self._send(200, {"ok": True})

        if path == "/api/backfill":
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
