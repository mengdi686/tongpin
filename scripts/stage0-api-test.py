#!/usr/bin/env python3
"""阶段0 API 回归测试：临时目录起服务，覆盖鉴权/删除/白名单。

用法：python3 scripts/stage0-api-test.py
不连接线上数据库，测试结束自动清理临时目录。
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API_DIR = os.path.join(ROOT, "apps", "stage0-api")
TOKEN = "test-token-20261126"
BASE = "http://127.0.0.1:{port}"
fails = []


def call(port, path, data=None, headers=None, method=None):
    url = BASE.format(port=port) + path
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, method=method or ("POST" if body else "GET"))
    req.add_header("Content-Type", "application/json")
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def check(label, actual, expected):
    if actual != expected:
        fails.append(f"{label}: 期望 {expected}，实际 {actual}")
    else:
        print(f"  OK {label}")


def main():
    tmp = tempfile.mkdtemp(prefix="tp-api-test-")
    # 本机可能没有 cryptography（服务器上有）。注入最小桩，测试自包含，不改生产代码。
    stub = os.path.join(tmp, "cryptography")
    os.makedirs(stub)
    with open(os.path.join(stub, "__init__.py"), "w") as f:
        f.write("")
    with open(os.path.join(stub, "fernet.py"), "w") as f:
        f.write(
            "import base64,os\n"
            "class Fernet:\n"
            "    def __init__(self,k): self.k=k\n"
            "    @staticmethod\n"
            "    def generate_key(): return base64.urlsafe_b64encode(os.urandom(32))\n"
            "    def encrypt(self,d): return base64.urlsafe_b64encode(b'TP'+bytes(d))\n"
            "    def decrypt(self,t): return base64.urlsafe_b64decode(t)[2:]\n"
        )
    port = 18766
    env = dict(os.environ, TP_DATA_DIR=tmp, TP_HOST="127.0.0.1",
               TP_PORT=str(port), TP_STATS_TOKEN=TOKEN)
    env["PYTHONPATH"] = tmp + os.pathsep + env.get("PYTHONPATH", "")
    proc = subprocess.Popen([sys.executable, os.path.join(API_DIR, "server.py")],
                            env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(40):
            try:
                s, _ = call(port, "/api/health")
                if s == 200:
                    break
            except Exception:
                time.sleep(0.1)
        else:
            print("FAIL：服务未启动")
            return 1

        print("阶段0 API 回归测试")
        s, _ = call(port, "/api/stats")
        check("stats 无令牌拒绝", s, 403)
        s, body = call(port, "/api/stats", headers={"X-Stats-Token": TOKEN})
        check("stats 带令牌放行", s, 200)
        check("stats 初始访客为 0", body.get("visitors"), 0)

        vid = "v_test_001"
        check("event 上报", call(port, "/api/event", {"vid": vid, "type": "visit"})[0], 200)
        check("非法事件拒绝", call(port, "/api/event", {"vid": vid, "type": "evil"})[0], 400)
        check("画像上报", call(port, "/api/profile", {
            "vid": vid, "resonance": 72, "styles": ["a"], "careTop": ["b"], "animal": "cat"})[0], 200)
        check("结果快照", call(port, "/api/result", {
            "vid": vid, "answers": {"q1": 3}, "resonance": 72})[0], 200)
        check("生辰无同意拒绝", call(port, "/api/birth", {
            "vid": vid, "date": "1990-05-15"})[0], 403)
        check("生辰加密落库", call(port, "/api/birth", {
            "vid": vid, "date": "1990-05-15", "time": "10:00",
            "consent": True, "dayMaster": "火", "elements": {"金": 1}, "zodiac": "马"})[0], 200)
        check("人脸结论", call(port, "/api/face-check", {
            "vid": vid, "riskScore": 5, "verdict": "pass"})[0], 200)
        check("预约", call(port, "/api/reserve", {"vid": vid, "phone": "13800138000"})[0], 200)
        # wx-login：测试环境未配置 AppID，必须优雅降级且返回 200（不阻断小程序主流程）
        s, body = call(port, "/api/wx-login", {"vid": vid, "code": "fake_code_123"})
        check("wx-login 未配置降级", s, 200)
        check("wx-login 降级原因", body.get("reason"), "not_configured")
        check("wx-login 缺 code 拒绝", call(port, "/api/wx-login", {"vid": vid})[0], 400)

        s, body = call(port, "/api/stats", headers={"X-Stats-Token": TOKEN})
        check("stats 访客计数", body.get("visitors"), 1)
        check("stats 生辰计数", body.get("births"), 1)

        # 校验密文不泄露明文
        db_file = os.path.join(tmp, "stage0.db")
        import sqlite3
        with sqlite3.connect(db_file) as c:
            raw = c.execute("SELECT date_enc FROM births WHERE vid=?", (vid,)).fetchone()[0]
        check("生辰密文非明文", "1990-05-15" not in raw, True)

        # 删除通道：全表清空
        check("全量删除", call(port, "/api/delete", {"vid": vid})[0], 200)
        s, body = call(port, "/api/stats", headers={"X-Stats-Token": TOKEN})
        check("删除后访客归零", body.get("visitors"), 0)
        check("删除后预约归零", body.get("reservations"), 0)
        check("删除后生辰归零", body.get("births"), 0)

        # CORS 白名单
        req = urllib.request.Request(BASE.format(port=port) + "/api/health", method="OPTIONS")
        req.add_header("Origin", "https://evil.example.com")
        try:
            urllib.request.urlopen(req, timeout=5)
            check("恶意 Origin 预检拒绝", "未拒绝", 403)
        except urllib.error.HTTPError as e:
            check("恶意 Origin 预检拒绝", e.code, 403)
        req = urllib.request.Request(BASE.format(port=port) + "/api/health", method="OPTIONS")
        req.add_header("Origin", "https://stage0.tongpin.truthhare.com")
        with urllib.request.urlopen(req, timeout=5) as r:
            check("白名单 Origin 放行", r.status, 204)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
        shutil.rmtree(tmp, ignore_errors=True)

    if fails:
        print(f"\nFAIL（{len(fails)} 项）")
        for f in fails:
            print("  -", f)
        return 1
    print("\nPASS：鉴权 / 漏斗 / 加密 / 删除 / CORS 全部通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())
