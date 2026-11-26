# 10 · 阶段1 小程序工程说明

> 个人主体工具版，答题 → 结果卡 → 分享文案 → 预约手机号。功能边界见 `docs/09-stage1-miniapp-boundary.md`。
> 计分逻辑与阶段0 H5 **完全一致**（同一参考样本、同种子、同权重），交叉测试已验证同频值跨端相同。

## 1. 工程结构

```
miniprogram/
  app.js / app.json / app.wxss        入口：生成持久 vid、全局状态、API 基址
  config/
    questions.js                      20 题 + 维度/风格词/在意点文案（阶段0移植）
    copy.js                           全部文案 + 动物配置 + 钩子生成（阶段0移植）
  utils/
    score.js                          确定性计分（阶段0移植，同种子同算法）
    api.js                            wx.request 封装，字段契约与阶段0 track.js 一致
  pages/
    index/                            年龄门 → 知情同意
    quiz/                             20 题逐题作答，5 点量表
    result/                           同频占比 + 风格词 + 4 条在意点 + 动物 + 分享 + 预约
```

数据接自有服务器 `stage0-api`（`https://stage0.tongpin.truthhare.com/api`），复用现有 vid 体系与 SQLite。埋点失败静默，不影响答题主流程。

## 2. 与阶段0 的一致性

| 项 | 阶段0 H5 | 阶段1 小程序 | 一致性 |
|---|---|---|---|
| 题目 | 20 题 5 点量表 | 同 | ✅ 逐题相同 |
| 参考样本 | 2000 固定种子 20261126 | 同 | ✅ |
| 同频算法 | 加权距离 + 平滑核 | 同 | ✅ 交叉测试同值 |
| 风格词 | L1 偏离中位 Top3 | 同 | ✅ |
| 在意点 | L2 四维全出 | 同 | ✅ |
| 动物 | 按分数段随机 | 同（简化为文字，无 SVG） | ⚠️ 见第 5 节 |

## 3. 拿到 AppID 后要做的配置（用户操作）

1. 微信公众平台 → 开发管理 → 开发设置 → 拿到 **AppID**（个人主体，无需认证）。
2. 用 AppID 替换 `miniprogram/project.config.json` 的 `appid` 字段（当前 `touristappid`）。
3. 开发管理 → 开发设置 → **服务器域名** → `request 合法域名` 添加：
   `https://stage0.tongpin.truthhare.com`
   （域名已备案、已配 HTTPS；小程序 request 只接受 https 且备案域名）
4. 类目选 `工具 > 信息查询`，名称建议「同频风格自测」（避开"测试/正缘/婚恋/匹配"）。
5. 提交备案：个人主体只需身份证 + 实名手机号 + 邮箱；工信部短信核验需 24h 内完成。
6. 用微信开发者工具打开 `miniprogram/` 目录，真机预览通过后上传提审。

## 4. 后端需要补的一处（阶段2 再做）

`docs/09` 约定阶段1 用 vid、阶段2 用手机号归并（不静默合并 openid）。因此当前**不需要** `/api/wx-login`。
若将来要拿 openid 作正式身份锚点，再在 `stage0-api` 加：
- `POST /api/wx-login { code }` → 服务端用 appid+secret 换 openid → 返回绑定 vid。
- appsecret 只存服务器环境变量，绝不进小程序包。

## 5. 已知简化与后续

- **动物形象**：阶段0 用 CC0 SVG 画在分享卡片上；小程序版先只出文字名+俏皮话。原因：小程序包体积与审核友好，且动物不承载结论。若要图形，可后续加本地图片到 `miniprogram/assets/` 并用 `<image>` 引用。
- **分享图**：小程序用 `onShareAppMessage` 原生转发卡片（好奇文案做标题），未做 canvas 长图。原生转发是个人主体唯一稳定的分享路径，符合 `docs/09` 第 3.4 节。
- **生辰/文化彩蛋**：阶段1 未接入（属可选白名单）。避免在个人工具版引入过多数据采集面，降低审核风险。阶段2 正式产品再接。

## 6. 验收（已执行）

- `node scripts/check.mjs`：PASS（15 项必需文件 + JSON 合法性 + 页面三件套 + lazyCodeLoading）
- `node scripts/stage1-miniprogram-test.mjs`：**26 PASS / 0 FAIL**（结构 / 计分 / 与阶段0一致 / 动物文案 / 无配对断言）
- `node scripts/stage0-stability.mjs`：200 次稳定性 PASS
- `python3 scripts/stage0-api-test.py`：20 项 API 回归 PASS
- 未执行：微信开发者工具真机编译（本机未安装），需在拿到 AppID 后由用户侧完成。
