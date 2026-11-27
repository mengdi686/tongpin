// 阶段1 小程序提审前合规自查
// 扫描 miniprogram/ 全部源码，拦截微信审核红线。
// 用法：node scripts/stage1-compliance-check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'miniprogram');
const errors = [];
let scanned = 0;

// 规则：{ 名称, 正则, 说明 }。命中即失败（除非在豁免行）。
const RULES = [
  {
    name: '算命/预测类禁用词',
    re: /算命|测算|预测|命中注定|天作之合|克夫|克妻|化解|改运|转运|保证脱单|准确率|必然|注定|诊断|治疗|心理疾病/g,
    hint: '见 docs/07 禁用词表，用"相处参考"替代',
  },
  {
    name: '正缘/配对断言',
    re: /正缘|匹配度\s*\d|你适合(属|生|某)|某五行相配|灵魂伴侣|天生一对|真命天子/g,
    hint: '阶段1 禁止任何配对/婚恋断言，见 docs/09 第 3.3 节',
  },
  {
    name: '诱导分享',
    re: /转发后(查看|解锁|获得)|分享(后|得)(解锁|积分|奖励|获得)|分享给\d|邀请\d+(人|位).*(解锁|获得)/g,
    hint: '强制/利益交换分享属违规，引导自愿分享可用',
  },
  {
    name: '社交/UGC 功能',
    re: /私聊|发消息|加好友|陌生人|聊天室|评论|留言板|发帖子|朋友圈|加群|加微信/g,
    hint: '个人主体禁止社交与 UGC，见 docs/09 第 2 节',
  },
  {
    name: '支付/手机号组件',
    re: /wx\.requestPayment|getPhoneNumber|openType=["']getPhoneNumber|微信支付/g,
    hint: '个人主体无支付与手机号组件权限',
  },
  {
    name: '导流外链',
    re: /关注公众号|其他小程序|点击关注|复制链接到浏览器/g,
    hint: '规范 2.5.10 禁止推荐/导流其他主体',
  },
];

// 豁免：这些文件里的词是合规说明/测试数据，不是面向用户的文案
const EXEMPT = new Set([
  path.join(srcDir, 'utils', 'api.js'), // 接口字段名 getPhoneNumber 等可能出现在注释
]);

// 逐行扫描时，跳过纯注释行（// 开头）和含"禁止/不得/禁用/不含"的说明行
function isExemptLine(line) {
  const t = line.trim();
  if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return true;
  if (/禁止|不得|禁用|不能|不含|避免|违规|红线|不允许/.test(t)) return true;
  return false;
}

// 命中词前 4 字内若有否定词，则为免责声明的"明确否认"，属正确合规表述
function isNegated(line, index) {
  const before = line.slice(Math.max(0, index - 4), index);
  return /不是|非|不构成|不代表|不做|并非|无$|不/.test(before);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    return d.isDirectory() ? walk(full) : [full];
  });
}

const exts = new Set(['.js', '.wxml', '.wxss', '.json']);
for (const file of walk(srcDir)) {
  if (!exts.has(path.extname(file))) continue;
  if (EXEMPT.has(file)) continue;
  scanned++;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (isExemptLine(line)) return;
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      const m = rule.re.exec(line);
      if (m && !isNegated(line, m.index)) {
        errors.push(`${path.relative(root, file)}:${i + 1} 命中「${rule.name}」→ ${m[0]}（${rule.hint}）`);
      }
    }
  });
}

console.log('同频 · 阶段1 小程序提审前合规自查');
console.log(`  扫描文件：${scanned} 个，规则：${RULES.length} 条`);
if (errors.length) {
  console.log(`\nFAIL（${errors.length} 项）`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
console.log('\nPASS：禁用词 / 配对断言 / 诱导分享 / 社交UGC / 支付组件 / 导流外链 零命中');
