# 同频 · AI 接手说明书（可直接交给 Codex）

> 本文件是**给 AI 看的施工说明**，不是给你看的教程。
> 目标：换任何 AI 编码工具（Codex / Cursor / Claude Code 等），只要它能读项目文件，就能按本文继续落地，不需要翻旧对话。

---

## 0. 给使用者：三步用法

1. 本文件放在项目里：`docs/AI_HANDOFF.md`（已在仓库中）。
2. 打开 Codex，在**项目根目录**启动，第一条消息原样粘贴：

```text
请先完整阅读 AGENTS.md 和 docs/AI_HANDOFF.md。
然后只执行第 8 节的 S0，不要做其他阶段，不要修改 app/ 原型。
完成后按第 10 节自检，并用中文汇报：改了哪些文件、怎么验收、哪里没把握。
```

3. 每一轮只让它做**一个 S 阶段**。你验收通过后，再让它做下一节。
   你只需要看三件事：能不能打开、主流程能不能走通、页面还是不是原来的样子。

> 不要一次让它"把整个项目做完"，也不要只说"帮我优化一下"。按阶段派活，出错才好回滚。

---

## 1. 项目是什么

「同频」是一个面向 25–35 岁城市青年的**婚恋交友**产品。差异化：
- 认知与兴趣分开测、分开算；
- 注册时用"心动画像"（看照片选择 + 12 道测评）建立偏好；
- 弱化八字，强调"相处参考 / 关系合盘"，不做算命预测；
- 卡片展示籍贯（身份证推算）与当前位置（IP），筛选按当前位置；
- 完善资料卡（2–6 张照片 + 总文案 ≤500 字）赠 500 积分；
- 聊天点头像可回到推荐页当初喜欢 TA 的资料卡。

当前阶段目标（2026-11-26 调整）：**先上线阶段 0 的 H5 测评**，部署在自有域名，验证话题性、朋友圈传播与预约收集；再依次推进娱乐类目测试小程序、婚恋类目交友小程序、App。阶段 0 的题目/计分/结果卡契约见 `docs/07-stage0-assessment.md`，**必须先读该文件再动 H5**。

差异化定位：八字正缘为核心记忆点，但八字仅作文化叙事与传播钩子，**不进入推荐排序、不收费、不作"合不合/命中注定"式判词**。可验证的关系内变量才是匹配的真正依据。

---

## 2. 当前仓库现状（事实，不要假设）

| 项目 | 现状 |
|---|---|
| 主入口 | `app/match.html`（高保真移动端原型，纯静态） |
| 旧版入口 | `app/index.html`（另一套视觉，仅参考，不迁移） |
| 脚本 | `app/match.js` 约 2084 行，单文件；`app/sw.js` 为缓存 |
| 样式 | `app/match.css` 约 1125 行；`:root` 已有品牌变量 |
| 数据 | `PEOPLE`、`EXTRA`、`CHATS_SEED` 全部硬编码在 JS |
| 状态 | `localStorage`（`yq_` 前缀），换设备即丢 |
| 后端 | 无。没有数据库、登录、上传、IM、审核、支付 |
| 工程 | 无 npm、无构建、无测试；仅完成了 `git init`、`.gitignore`、`AGENTS.md`、`docs/00`、`docs/01` |

**结论**：`app/` 只当"视觉与交互参考"，不要在它上面继续堆功能。新工程建在 `apps/miniapp/`。

---

## 3. 已拍板的技术决策（不要重新选型）

| 决策 | 内容 |
|---|---|
| 首发载体 | 阶段 0 自有域名 H5 优先；微信小程序随后；App 后置 |
| 后端 | 自有服务器（已备案+境内）承载业务；微信云开发只做登录/审核/实时监听 |
| 阶段 0 测评 | 三层结构：IPIP 大五 + 关系内变量 + 八字文化层；契约见 `docs/07` |
| 百分比 | 阶段 0 保留并标注"仅供娱乐"；严禁进入推荐排序或付费权益 |
| 前端 | uni-app + Vue3 + TypeScript + Pinia |
| 后端 | 微信云开发（云函数 + 云数据库 + 云存储） |
| 图片 | 前端压缩后上传云存储，数据库只存 fileID |
| 消息 | 首版用云数据库实时监听；DAU > 1000 再换腾讯云 IM |
| 实名 | 腾讯云身份证二要素 + 人脸核身（可跳过） |
| 审核 | 微信 `msgSecCheck` / `mediaCheckAsync`，先审后发 |
| 支付 | 首版不做现金充值、不卖积分 |
| 八字 | 对外统一叫「相处参考 / 关系合盘」，不做排盘、不卖预测 |
| 推荐 | 规则排序：性别 + 当前位置 + 年龄 + 兴趣重合 + 活跃度 |
| 设计 | 沿用现有玫粉→紫体系 |

**首版不做**：直播、短视频、语音/视频通话、算法推荐、自研 IM、双端 App、多语言、会员订阅。

---

## 4. MVP 范围（P0 / P1 / 不做）

### P0（首版必须）
1. 微信登录（openid，换设备可恢复）
2. 注册 7 步：性别 → 生日 → 出生时间（可跳过）→ 实名/人脸（可跳过）→ 兴趣（≥3）→ 心动画像（可跳过）→ 完成
3. 资料卡：照片 2–6 张、封面、文案 ≤500 字、标签
4. 推荐：只展示异性；按当前位置筛选；规则排序
5. 喜欢/跳过：无限次；互相喜欢生成匹配
6. 聊天：会话列表、文本消息、未读、先审后发
7. 安全：举报、拉黑、一键注销、未成年限制
8. 位置标签：籍贯（身份证）+ 当前位置（IP）
9. 内容审核：文本 + 图片

### P1（上线后 30 天）
积分（完善 +500、签到 +10、邀请 +200）、活动入口、心动设置、喜欢页、AI 文案模板、埋点。

### 不做
见第 3 节末尾。

---

## 5. 工程规范（硬性）

### 5.1 目标目录

```text
apps/miniapp/
  src/
    pages/                  页面壳，只做编排
    components/             通用 UI（卡片、评分、弹层、空态）
    features/
      auth/                 登录、实名、人脸
      onboard/              7 步注册
      profile/              资料卡、照片
      match/                推荐、筛选、心动设置
      likes/                喜欢我的 / 我喜欢
      chat/                 会话、消息
      points/               积分、任务、兑换
    services/               业务逻辑唯一入口
    adapters/               api / im / verify / audit / pay
    stores/                 Pinia
    styles/tokens.css      设计令牌
    config/                 文案、规则、开关
    mock/                   假数据（与 adapter 同签名）
    types/                  接口契约
cloudfunctions/             云函数（每个函数一个目录）
scripts/                    检查与冒烟
```

### 5.2 分层与依赖方向

```text
page → store → service → adapter → api/cloud
```

- 页面**禁止**直接调用 `api` 或 `uniCloud`。
- 业务规则放 `services/`，页面只负责展示与跳转。
- 组件 `props` 进、`emit` 出，禁止拼 HTML 字符串。

### 5.3 代码红线

- 单文件 ≤300 行；页面 ≤500 行；超了先拆再提交。
- 颜色、文案、积分规则、筛选条件禁止硬编码。
- 实名/人脸/身份证号不落库、不进日志、不在前端持久化。
- 一个任务只改一个 feature 目录。
- 先写 `types` 和接口，再写页面。

---

## 6. 数据模型（云数据库集合）

| 集合 | 关键字段 |
|---|---|
| `users` | `_id`、`openid`、`gender`(m/f)、`birthday`、`birthTime`(可空)、`createdAt`、`lastActiveAt`、`status`(active/banned/deleted) |
| `profiles` | `userId`、`photos`(2–6 个 fileID)、`coverIndex`、`bio`(≤60)、`about`(≤300)、`expect`(≤140)、`tags`(≤5)、`interests`、`origin`(身份证籍贯)、`ipCity`(当前位置)、`updatedAt` |
| `verifications` | `userId`、`realNameHash`、`idVerified`、`faceVerified`、`verifiedAt`；**不存证件号/原图** |
| `likes` | `from`、`to`、`action`(like/pass)、`createdAt` |
| `matches` | `users`[2]、`createdAt`、`status` |
| `chats` | `_id`、`members`[2]、`lastMessage`、`updatedAt` |
| `messages` | `chatId`、`from`、`type`(text)、`content`、`auditStatus`(pending/pass/reject)、`createdAt` |
| `points_ledger` | `userId`、`delta`、`reason`、`refId`、`createdAt`；余额由账本汇总，不直接改数字 |
| `reports` | `reporter`、`target`、`reason`、`detail`、`status`、`createdAt` |
| `audit_logs` | `scene`、`targetId`、`result`、`provider`、`createdAt` |

索引：`users.openid` 唯一；`likes(from,to)` 唯一；`messages.chatId + createdAt`；`points_ledger.userId + createdAt`。

---

## 7. 接口契约（8 个域）

统一约定：
- 所有写操作从云函数上下文取 `openid`，**不信任前端传的 userId**。
- 返回 `{ ok: true, data }` 或 `{ ok: false, code, message }`。
- 错误码：`401 UNAUTHORIZED`、`403 FORBIDDEN`、`422 VALIDATION`、`429 RATE_LIMITED`、`500 INTERNAL`。

| 域 | 云函数 | 入参 | 出参 |
|---|---|---|---|
| auth | `auth-login` | `{ code }` | `{ openid, isNew, needOnboard }` |
| auth | `auth-refresh` | `{}` | `{ session }` |
| profile | `profile-get` | `{ userId? }` | `{ profile, verification }` |
| profile | `profile-update` | `{ bio, about, expect, tags, photos, coverIndex }` | `{ profile }`（校验 2–6 图、≤500 字） |
| photo | `photo-sign` | `{ ext, size }` | `{ uploadUrl, fileID }` |
| photo | `photo-audit` | `{ fileID }` | `{ pass }` |
| match | `match-list` | `{ cursor?, filters }` | `{ items, nextCursor }` |
| match | `match-detail` | `{ userId }` | `{ card }` |
| like | `like-act` | `{ targetId, action }` | `{ matched, chatId? }` |
| like | `like-list` | `{ mode: who/whoI }` | `{ items }` |
| chat | `chat-list` | `{}` | `{ chats }` |
| chat | `chat-messages` | `{ chatId, cursor? }` | `{ items, nextCursor }` |
| chat | `chat-send` | `{ chatId, content }` | `{ message }`（先审核） |
| points | `points-balance` | `{}` | `{ balance }` |
| points | `points-claim` | `{ taskId }` | `{ balance, delta }` |
| report | `report-create` | `{ targetId, reason, detail }` | `{ ok }` |

**关键校验**
- `match-list`：性别过滤在后端做，前端不可绕过；筛选 `ipCity` 而非籍贯。
- `profile-update`：照片 2–6 张；`bio+about+expect` 总字数 ≤500；标签 ≤5。
- `chat-send`：内容先过 `msgSecCheck`，通过才写库；违规返回 `422`。
- `points-claim`：按 `refId` 幂等，重复请求不重复加分。

---

## 8. 执行顺序（每次只做一个 S 阶段）

### S0 工程骨架（先做这个）
- 用官方 uni-app Vue3 + TS 模板初始化 `apps/miniapp/`；如模板不可用，用 HBuilderX 新建同结构工程。
- 建 `tokens.css`、`types/`、`config/`、`mock/`、空 `services/` 与 `pages/` 壳。
- 把 `app/match.css` 的 `:root` 变量抽到 `tokens.css`（见第 9 节）。
- 建 `scripts/check.mjs`：检查 JS 语法、CSS 括号平衡、HTML id 唯一、文档必需文件存在。
- **验收**：`node scripts/check.mjs` 通过；小程序能空白启动；`app/` 未被修改。

### S1 登录 + 注册 7 步
- 云函数 `auth-login`；Pinia `useUserStore`。
- 迁移注册层：性别/生日/出生时间/实名/兴趣/心动画像/完成。
- 实名可跳过；真实姓名处提示"仅认证使用，不公开"；身份证推算籍贯；IP 定位当前位置。
- **验收**：新用户 3 分钟内走完 7 步；退出再进可续接；换设备能恢复。

### S2 资料卡 + 照片
- 2–6 图上传、封面、删除、压缩；文案 3 段（介绍/关于我/期待）总字数 ≤500。
- `profile-update` 服务端二次校验；图片过审。
- **验收**：上传 2 张可保存；1 张或 7 张被拒绝；文案超 500 被拒绝；积分 +500 只发一次。

### S3 推荐 + 筛选
- 规则排序：性别、`ipCity`、年龄、兴趣重合、活跃度。
- 卡片标签：籍贯 + 当前位置；正缘角标；不再展示合盘分数。
- **验收**：男生只看女生；切换城市筛选结果变化；卡片无溢出。

### S4 喜欢 + 匹配
- 无限次喜欢/跳过；互相喜欢写 `matches` 并建会话。
- **验收**：两个账号互点喜欢后，双方会话列表出现对方。

### S5 聊天
- 会话列表、消息、未读、发送失败重试；消息先审后发。
- 点头像跳转到推荐页对应资料卡（用 `match-detail` 拉取，不依赖本地列表）。
- **验收**：发送敏感词被拦截并有提示；点对方头像能看到当初的资料卡。

### S6 积分 + 活动
- 账本、幂等、任务：完善 +500、签到 +10、邀请 +200。
- 推荐页活动横幅；"我的"资料卡/积分入口。
- **验收**：余额与账本一致；重复领取不叠加；积分不足时兑换按钮禁用。

### S7 合规 + 后台
- 举报、拉黑、一键注销、未成年限制、隐私弹窗。
- 管理后台：审核队列、举报处理、封禁。
- **验收**：每个入口可到达；注销后数据按策略删除/匿名化。

### S8 提审
- 按 `docs/01-compliance.md` 与 `docs/06-launch-checklist.md` 自查。
- **验收**：清单全勾选；测试账号可完整体验。

---

## 9. 设计令牌（从现有原型抽取）

```css
:root {
  --brand-pink: #ff4d8d;
  --brand-pink-soft: #ffe8f0;
  --brand-pink-deep: #e63a77;
  --brand-purple: #8b5cff;
  --brand-grad: linear-gradient(105deg, #ff4d8d 0%, #f858a8 46%, #8b5cff 100%);
  --ink: #221c23;
  --muted: #948b93;
  --line: #f0e9ec;
  --soft: #f7f2f4;
  --card: #ffffff;
  --shadow-card: 0 16px 38px rgba(196, 78, 128, .16);
  --radius-card: 26px;
  --radius-pill: 999px;
  --radius-sheet: 24px;
  --font: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
}
```

- 卡片照片区 `aspect-ratio: 4/4.55`，最大高度 468px，图片 `object-position: center 18%`。
- 主按钮用 `--brand-grad`；次按钮浅底。
- 页面背景保留粉紫径向渐变 + `#f8f4f5`。

---

## 10. 验收与完成定义

每个 S 阶段完成必须同时满足：

1. 只改了本阶段允许的目录（`git diff` 可核对）。
2. `node scripts/check.mjs` 通过。
3. 按本阶段"验收"手工走通，并给出步骤与结果。
4. 没有新增 console 报错。
5. 更新对应 `docs/` 与 `AGENTS.md`（如有新约定）。
6. 用中文汇报：改了什么、为什么、怎么验、剩余风险。

**手工验收的最低标准**
- 微信开发者工具能编译、能预览。
- 首屏 5 秒内出现内容。
- 注册、推荐、聊天三条主流程各有一次完整走通记录。

---

## 11. 禁止事项

- 不要修改 `app/` 原型，除非任务明确要求。
- 不要引入境外服务/SDK（数据合规）。
- 不要在前端保存身份证、人脸原图。
- 不要跳过内容审核直接写消息或图片。
- 不要使用"算命 / 预测 / 命中注定 / 正缘预测"等表述。
- 不要现金售卖积分或虚拟货币。
- 不要一次重写整个项目；按 S 阶段推进。
- 不要编造法规条款；不确定的写"以平台最新要求为准"。

---

## 12. 假设（如果信息缺失，按此继续，不要停下来）

- 地区：中国大陆。
- 主体：企业/个体户可注册；若只有个人身份，先补主体。
- 预算：按省钱版推进（云开发 + AI 自建）。
- 视觉：沿用 `app/match.css` 的玫粉→紫体系。
- 时间：不含资质审批与审核驳回等待。
- 运营：首版免费，不卖积分。

如果现实与以上假设冲突，在汇报里标注，不要自行改架构。

---

## 13. 交接检查清单（换 AI 前 30 秒）

- [ ] `AGENTS.md` 在根目录
- [ ] `docs/AI_HANDOFF.md` 在 `docs/`
- [ ] `docs/00-mvp-scope.md`、`docs/01-compliance.md` 可读
- [ ] `git status` 干净或已提交
- [ ] `app/` 原型能正常打开
- [ ] 新 AI 已被告知"只做 S0"
