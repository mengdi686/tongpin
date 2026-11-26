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
| `births` | vid, date_enc, time_enc, gender, day_master, elements, zodiac, consent_at | 生辰与派生结果 | **高（敏感，加密）** |
| `result_snapshots` | vid, answers, resonance, styles, care_top, animal, rules_version, ts | 可复现结果 | 中 |
| `face_checks` | id, vid, risk_score, verdict, ts | 图片检测结果 | 中（**无原图**） |

**绝不入表/入日志**：身份证号、人脸原图、精确地理位置。
生辰时辰**加密后**入 `births` 表；派生结果（日主/五行/生肖）明文，用于后续匹配。
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
5. **生辰后补匹配**：用户阶段 0 跳过生辰、后续注册补填时，凭同一 `vid` 取回 `result_snapshots.answers`，
   按 `rules_version` 对应规则重新计算 L1/L2 风格分与占比，再叠加 `births` 的派生结果（日主/五行/生肖）。
   用户真正要的是**可匹配的衍生结论**，不是生日数字本身；故快照必须存原始答案与规则版本。
6. **人脸合规**：图片审核只写 `face_checks`（风险分 + 结论 + 时间），原图即时丢弃、不上传留存、不建人脸库。
   若未来启用需单独同意 + 事前个人信息保护影响评估（报告保存 3 年），并遵守《人脸识别技术应用安全管理办法》第 8 条。

隐私约束：手机号仅在用户主动提交预约时收集，用于内测邀请，不用于其他营销；
用户注销时按 `vid` 与 `phone` 删除全部相关行，包括 `births` 与 `face_checks`；
生辰的单独同意与删除请求走同一 vid 通道，删除后派生结果一并清除。

---

## 5. 留存与备份

- 行为事件（`events`）：保留 **180 天**，到期脚本清理。
- 画像与结果快照（`profiles`、`result_snapshots`）：保留至用户注销或阶段 2 账号归并后转为正式用户数据。
- 生辰（`births`）：加密保存至用户注销或账号归并；用户可随时单独删除。
- 图片检测（`face_checks`）：只存结论，保留 90 天；原图从不落库。
- 预约（`reservations`）：内测结束后 30 天清理未关联的手机号。
- 备份：`stage0.db` 每日一次，保留 7 份，存放 `/srv/tongpin-data/backups/`，不同机同步另议。

---

## 6. 访问权限（2026-11-26 加固）

- `/api/stats` 必须带 `X-Stats-Token` 请求头，令牌由服务端环境变量 `TP_STATS_TOKEN` 注入；
  **未设置令牌时一律返回 403（fail-closed）**，避免公网直读漏斗数据。
- CORS 改为白名单：只允许 `ALLOWED_ORIGINS` 中的同源域名；OPTIONS 预检对白名单外 Origin 返回 403。
  前端通过 Caddy 同域反代调用 `/api/`，正常路径不触发预检。
- 数据库文件仅 `root` 可读；禁止 Web 目录直接映射到 `/srv/tongpin-data/`。
- 导出走 `scripts/stage0-export.mjs`（服务器无 `sqlite3` CLI，脚本用 Python 标准库）；
  导出文件含手机号，属敏感文件，`.gitignore` 已排除 `stage0-export*.csv`，不得提交 git。

### 6.1 用户删除权（已实现）

- `POST /api/delete` `{vid}`：一次性删除该 vid 在全部 7 张表中的记录（含预约手机号、加密生辰、人脸结论、结果快照）。
- `POST /api/birth/delete` `{vid}`：仅删除生辰及其派生结果，保留测评画像。
- 数据层见 `apps/stage0-api/store.py` 的 `delete_all()`，新增表必须同步加入 `TABLES` 元组，否则删除会漏表。
- 回归测试：`python3 scripts/stage0-api-test.py`，覆盖鉴权、漏斗、加密、全量删除、CORS 白名单共 20 项断言。

---

## 6.2 个人信息清单（盘点底稿，新增字段须同步）

| 字段 | 分类 | 收集场景 | 合法性基础 | 单独同意 | 留存 | 共享/出境 |
|---|---|---|---|---|---|---|
| `vid` | 一般（去标识化） | 首次访问自动生成 | 同意（隐私告知） | 否 | 至删除 | 不共享、不出境 |
| 行为事件 | 一般 | 答题/分享漏斗 | 同意 | 否 | 180 天 | 不共享、不出境 |
| 风格画像 | 一般 | 结果生成 | 同意 | 否 | 至注销 | 不共享、不出境 |
| 手机号 | 一般（高敏） | 主动预约提交 | 同意（主动填写） | 否（主动提交即同意） | 内测后 30 天 | 不共享、不出境 |
| 出生日期/时辰 | **敏感（行踪/特定身份类）** | 文化彩蛋 | 同意 | **是**（`consent` 标记） | 至删除 | 不共享、不出境 |
| 日主/五行/生肖 | 一般（派生） | 排盘结果 | 同意 | 随生辰 | 至删除 | 不共享、不出境 |
| 人脸检测结论 | 敏感（生物识别衍生） | 图片审核 | 同意 | **是**（启用前补） | 90 天 | 不共享、不出境 |
| 人脸原图 | — | **不采集、不落库、不建库** | — | — | — | — |
| 身份证号 | — | **不采集** | — | — | — | — |
| 精确地理位置 | — | **不采集** | — | — | — | — |

规则：
- 新增任何字段，必须先在本表登记分类、合法性基础与留存，再改代码；未登记不得上线。
- 生辰、人脸结论属敏感个人信息，处理前须做个人信息保护影响评估（PIA），报告留存 3 年。
- 不满 14 周岁用户信息不采集（阶段 0 已设 18+ 门禁）。
- 全部数据存放在境内自有服务器 `/srv/tongpin-data/`，无第三方 SDK 回传，无跨境传输。

---

## 7. 验收标准

- [ ] 后端服务独立于 8765，绑定 127.0.0.1:8766
- [ ] 事件与画像入库，日志与表中无生辰/时辰
- [ ] 预约手机号入库并与 vid 绑定，可通过 `/api/link` 归并
- [ ] `/api/stats` 带令牌可查漏斗，无令牌 403
- [ ] CORS 白名单外 Origin 被拒
- [ ] `/api/delete` 可一次清空该 vid 全部 7 张表
- [ ] `python3 scripts/stage0-api-test.py` 20 项断言全过
- [ ] 数据目录与数据库权限达标
- [ ] 前端埋点失败不影响测评主流程
