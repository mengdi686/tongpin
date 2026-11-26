# 08 · 数据治理契约（阶段 0 及后续）

> 服务器为多项目共用（同机已有 `shengwang-lab`，占用 8765 端口）。
> 本文定义同频数据的**独立存储、隔离边界、留存策略与身份关联**，所有阶段必须遵守。

---

## 0. 现状与问题（2026-11-26）

阶段 0 上线初期，预约手机号只写浏览器 `localStorage`，行为数据完全没有采集。
后果：用户换设备即丢、无法统计漏斗、后续注册无法匹配历史数据。**本契约即为修复方案。**

---

## 1. 隔离边界（硬性）

| 项 | 同频 | 其他项目 |
|---|---|---|
| 数据目录 | `/srv/tongpin-data/` | `/opt/shengwang-lab/` 等 |
| 数据库 | `/srv/tongpin-data/stage0.db` | 各自独立 |
| 监听端口 | `127.0.0.1:8766` | 8765 等 |
| systemd 服务 | `tongpin-stage0.service` | 各自独立 |
| 对外入口 | Caddy `/api/*` 反代至 8766 | 各自域名/路径 |

- 禁止在不同项目间共享数据库文件、表、端口或数据目录。
- 后端服务只监听 `127.0.0.1`，不直接暴露公网；公网入口统一走 Caddy。
- 数据目录权限 `700`，数据库文件 `600`。

---

## 2. 数据表与字段

| 表 | 字段 | 用途 | 敏感级别 |
|---|---|---|---|
| `visitors` | vid, created_at, last_seen | 匿名访问者 | 低（随机 ID） |
| `events` | id, vid, type, payload, ts | 行为漏斗 | 低（不含生辰） |
| `profiles` | vid, resonance, styles, care_top, animal, ts | 风格画像 | 中（可验证维度） |
| `reservations` | id, vid, phone, created_at, linked_at | 内测预约 | **高（手机号）** |

**绝不入表/入日志**：生日、出生时辰、身份证号、人脸、精确地理位置。
`payload` 经过白名单过滤，只允许 `index/total/qid/value/resonance/animal/step`。

---

## 3. 事件类型（漏斗）

`visit` → `gate_pass` / `gate_reject` → `consent_agree` → `birth_submit` →
`q_answer`（每题一条）→ `q_back`（可选）→ `result_view` → `share_click` / `again` → `reserve_submit`

关键转化指标：
- 门禁通过率 = gate_pass / visit
- 完答率 = result_view / gate_pass
- 分享率 = share_click / result_view
- 预约率 = reserve_submit / result_view

---

## 4. 身份关联（为后续手机号注册准备）

1. 首次访问生成随机 `vid`（`v_时间戳_随机`），存 `localStorage`，仅标识浏览器。
2. 所有事件与画像以 `vid` 串联；预约时提交手机号，写入 `reservations`，`linked_at` 为空。
3. **阶段 1/2 用户注册时**：前端读取同一个 `vid`，调用 `POST /api/link`（vid + phone），
   把该手机号的历史行为、画像、预约记录一次性归并到正式用户。
4. 因此：**先测后注册的用户，历史数据不丢**；这是阶段 0 必须先埋点再放量的根本原因。

隐私约束：手机号仅在用户主动提交预约时收集，用于内测邀请，不用于其他营销；
用户注销时按 `vid` 与 `phone` 删除 `reservations`、`profiles`、`events`、`visitors` 对应行。

---

## 5. 留存与备份

- 行为事件（`events`）：保留 **180 天**，到期脚本清理。
- 画像（`profiles`）：保留至用户注销或阶段 2 账号归并后转为正式用户数据。
- 预约（`reservations`）：内测结束后 30 天清理未关联的手机号。
- 备份：`stage0.db` 每日一次，保留 7 份，存放 `/srv/tongpin-data/backups/`，不同机同步另议。

---

## 6. 访问权限

- `/api/stats` 仅供内部查看漏斗，部署后如公网可访问须加 token（当前阶段先仅限内网/本机）。
- 数据库文件仅 `root` 可读；禁止 Web 目录直接映射到 `/srv/tongpin-data/`。
- 导出数据走 `scripts/stage0-export.mjs`，导出文件含手机号，属敏感文件，不得提交 git。

---

## 7. 验收标准

- [ ] 后端服务独立于 8765，绑定 127.0.0.1:8766
- [ ] 事件与画像入库，日志与表中无生辰/时辰
- [ ] 预约手机号入库并与 vid 绑定，可通过 `/api/link` 归并
- [ ] `/api/stats` 可查漏斗计数
- [ ] 数据目录与数据库权限达标
- [ ] 前端埋点失败不影响测评主流程
