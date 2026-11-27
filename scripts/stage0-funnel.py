#!/usr/bin/env python3
"""阶段0 漏斗快照：从线上拉 stats，算转化率，输出可读报告。

用法：
  python3 scripts/stage0-funnel.py            # 本地通过 SSH 拉线上
  python3 scripts/stage0-funnel.py --local    # 在服务器上直接跑
  python3 scripts/stage0-funnel.py --file X   # 从 JSON 文件读（离线分析）

令牌在服务器本地 /root/tongpin-stats-token.txt，不进 git、不经命令行传递。
"""
import json
import subprocess
import sys
import urllib.request

API = "http://127.0.0.1:8766/api/stats"
REMOTE = "root@154.8.173.24"


def fetch(mode, arg):
    if mode == "--file":
        with open(arg, encoding="utf-8") as f:
            return json.load(f)
    if mode == "--local":
        with open("/root/tongpin-stats-token.txt", encoding="utf-8") as f:
            token = f.read().strip().split("=", 1)[-1]
        req = urllib.request.Request(API, headers={"X-Stats-Token": token})
        with urllib.request.urlopen(req, timeout=8) as r:
            return json.loads(r.read())
    # 默认：本地 SSH 到服务器执行 remote 拉取
    script = (
        "TOKEN=$(cut -d= -f2 /root/tongpin-stats-token.txt); "
        "curl -s -H \"X-Stats-Token: ${TOKEN}\" " + API
    )
    out = subprocess.run(
        ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=8", REMOTE, script],
        capture_output=True, text=True, timeout=20, check=True).stdout
    return json.loads(out)


def rate(n, base):
    return f"{100.0 * n / base:.1f}%" if base else "n/a"


def report(d):
    if not d.get("ok"):
        print("拉取失败：", d)
        return 1
    bt = d.get("byType", {})
    g = lambda k: bt.get(k, 0)
    print("同频 · 阶段0 漏斗快照")
    print(f"  访客 {d['visitors']} · 事件 {d['events']} · 画像 {d['profiles']} · "
          f"预约 {d['reservations']} · 生辰 {d['births']} · 快照 {d['snapshots']}")
    print("  ── 漏斗 ──")
    print(f"  年龄门通过     {g('gate_pass'):>4}  / visit {g('visit'):<4} = {rate(g('gate_pass'), g('visit'))}")
    print(f"  同意测评       {g('consent_agree'):>4}")
    print(f"  查看结果       {g('result_view'):>4}  / 年龄门 {g('gate_pass'):<4} = {rate(g('result_view'), g('gate_pass'))}")
    print(f"  点分享         {g('share_click'):>4}  / 结果   {g('result_view'):<4} = {rate(g('share_click'), g('result_view'))}")
    print(f"  复制分享       {g('share_copy'):>4}")
    print(f"  分享带来新访客 {g('ref_in'):>4}  ← 传播闭环指标")
    print(f"  预约手机号     {g('reserve_submit'):>4}")
    print("  ── 阶段2 触发条件 ──")
    print(f"  预约 ≥100：{d['reservations']}/100 "
          f"{'✅' if d['reservations'] >= 100 else '未达'}")
    enough = g('result_view') >= 20
    print(f"  分享率 ≥15%：{'样本不足(<20 结果view)' if not enough else rate(g('share_click'), g('result_view'))}")
    return 0


if __name__ == "__main__":
    args = sys.argv[1:]
    mode = args[0] if args and args[0].startswith("--") else ""
    arg = args[1] if mode == "--file" and len(args) > 1 else ""
    sys.exit(report(fetch(mode, arg)))
