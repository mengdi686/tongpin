// 同频 · 静态检查（当前阶段唯一强制检查）
// 用法：node scripts/check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const p = (rel) => path.join(root, rel);
const has = (rel) => fs.existsSync(p(rel));

const REQUIRED = [
  'AGENTS.md',
  'docs/AI_HANDOFF.md',
  'docs/00-mvp-scope.md',
  'docs/01-compliance.md',
  'docs/07-stage0-assessment.md',
  'apps/stage0-h5/index.html',
  'app/match.html',
  'app/match.css',
  'app/match.js',
  // 阶段1 小程序工程
  'miniprogram/app.json',
  'miniprogram/app.js',
  'miniprogram/pages/index/index.wxml',
  'miniprogram/pages/quiz/quiz.wxml',
  'miniprogram/pages/result/result.wxml',
  'scripts/stage1-miniprogram-test.mjs',
  'scripts/stage1-compliance-check.mjs',
];

// 注册/向导/资料卡等由 JS 动态生成的 id，允许不在静态 HTML 中
const DYNAMIC_IDS = new Set([
  'qwStart', 'qwLater', 'qwDone', 'qwRedo', 'pfAdd',
  'onbNext', 'onbY', 'onbM', 'onbD', 'onbBack', 'onbUnknown',
  'onbHour', 'onbMin', 'onbReal', 'onbFace', 'onbName', 'onbId',
  'onbOriginVal', 'onbSave', 'onbCancel', 'onbFinish', 'onbSkip',
  'onbChipCount', 'onbWizard', 'onbLater', 'onbProfile', 'onbGo',
]);

for (const rel of REQUIRED) {
  if (!has(rel)) errors.push(`缺少必需文件：${rel}`);
}

// 1. JS 语法
for (const rel of ['app/match.js', 'app/sw.js']) {
  if (!has(rel)) continue;
  try {
    execFileSync(process.execPath, ['--check', p(rel)], { stdio: 'pipe' });
  } catch (e) {
    errors.push(`JS 语法错误：${rel}\n${e.stderr?.toString() || e.message}`);
  }
}

// 2. CSS 花括号平衡
for (const rel of ['app/match.css']) {
  if (!has(rel)) continue;
  const css = fs.readFileSync(p(rel), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const open = (css.match(/{/g) || []).length;
  const close = (css.match(/}/g) || []).length;
  if (open !== close) errors.push(`CSS 花括号不平衡：${rel}（{ ${open} / } ${close}）`);
}

// 3. HTML id 唯一
const htmlRel = 'app/match.html';
if (has(htmlRel)) {
  const html = fs.readFileSync(p(htmlRel), 'utf8');
  const ids = [...html.matchAll(/(?:^|\s)id="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`HTML id 重复：${id}`);
    seen.add(id);
  }

  // 4. JS 引用的 id 是否存在
  const jsRel = 'app/match.js';
  if (has(jsRel)) {
    const js = fs.readFileSync(p(jsRel), 'utf8');
    const refs = [...js.matchAll(/\$\('#([A-Za-z][A-Za-z0-9_-]*)'\)/g)].map((m) => m[1]);
    for (const id of new Set(refs)) {
      if (!seen.has(id) && !DYNAMIC_IDS.has(id)) {
        errors.push(`JS 引用了不存在的 id：${id}`);
      }
    }
  }
}

// 4b. 小程序 JSON 合法性 + 页面三件套
for (const rel of ['miniprogram/app.json', 'miniprogram/project.config.json', 'miniprogram/sitemap.json',
  'miniprogram/pages/index/index.json', 'miniprogram/pages/quiz/quiz.json', 'miniprogram/pages/result/result.json']) {
  if (!has(rel)) continue;
  try { JSON.parse(fs.readFileSync(p(rel), 'utf8')); }
  catch (e) { errors.push(`小程序 JSON 非法：${rel}（${e.message}）`); }
}
if (has('miniprogram/app.json')) {
  const appJson = JSON.parse(fs.readFileSync(p('miniprogram/app.json'), 'utf8'));
  if (!appJson.pages || !appJson.pages.length) errors.push('小程序 app.json.pages 为空');
  for (const page of appJson.pages || []) {
    for (const ext of ['.wxml', '.js', '.wxss']) {
      if (!has(`miniprogram/${page}${ext}`)) errors.push(`小程序页面缺少 ${page}${ext}`);
    }
  }
  if (appJson.lazyCodeLoading !== 'requiredComponents') errors.push('小程序缺少 lazyCodeLoading: requiredComponents');
}

// 5. 阶段1 提审前合规自查（禁用词/配对断言/诱导分享/社交/支付/导流）
if (has('scripts/stage1-compliance-check.mjs')) {
  try {
    execFileSync(process.execPath, [p('scripts/stage1-compliance-check.mjs')], { stdio: 'pipe' });
  } catch (e) {
    errors.push(`小程序合规自查未通过：\n${e.stdout?.toString() || e.stderr?.toString() || e.message}`);
  }
}

// 6. 文档内 file:/// 链接是否有效
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    return d.isDirectory() ? walk(full) : [full];
  });
}
for (const file of walk(p('docs')).filter((f) => f.endsWith('.md'))) {
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\]\(file:\/\/([^)#]+)(?:#[^)]*)?\)/g)) {
    if (!fs.existsSync(m[1])) {
      warnings.push(`文档链接失效：${path.relative(root, file)} → ${m[1]}`);
    }
  }
}

// 输出
console.log('同频 · 静态检查');
console.log(`  必需文件：${REQUIRED.length} 项`);
for (const w of warnings) console.log(`  WARN ${w}`);
if (errors.length) {
  console.log(`\nFAIL（${errors.length} 项）`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
console.log('\nPASS：JS 语法 / CSS 括号 / id 唯一 / id 引用 / 小程序结构 / 提审合规 / 文档链接');
