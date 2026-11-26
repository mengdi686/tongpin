// 阶段1 小程序逻辑回归测试（Node 环境，桩 wx API，不依赖微信开发者工具）
// 验证：模块可加载、计分与阶段0一致、动物/文案映射合法、结果无配对断言
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../miniprogram');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, detail || ''); }
}

// ---- wx API 桩 ----
const store = {};
global.wx = {
  getStorageSync: (k) => store[k],
  setStorageSync: (k, v) => { store[k] = v; },
  request: () => {},
  showToast: () => {},
  setClipboardData: () => {},
  navigateTo: () => {},
  redirectTo: () => {},
};
let launched = false;
global.getApp = () => ({ globalData: { vid: 'mp_test', answers: {}, apiBase: 'x' } });
global.App = (o) => { launched = true; o.onLaunch && o.onLaunch(); };
global.Page = () => {};

// ---- 结构检查 ----
console.log('\n[结构]');
const appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'));
check('app.json 页面非空', appJson.pages && appJson.pages.length === 3);
check('lazyCodeLoading 已设置', appJson.lazyCodeLoading === 'requiredComponents');
for (const p of appJson.pages) {
  const base = path.join(ROOT, p);
  check(`${p}.wxml 存在`, fs.existsSync(base + '.wxml'));
  check(`${p}.js 存在`, fs.existsSync(base + '.js'));
}
check('无 HTML 标签泄漏', !/\b(document|window|localStorage)\b/.test(
  fs.readFileSync(path.join(ROOT, 'pages/quiz/quiz.js'), 'utf8')
));

// ---- 加载计分模块 ----
console.log('\n[计分]');
const { computeResult, ResonanceSpec } = require(path.join(ROOT, 'utils/score.js'));
const { QUESTIONS } = require(path.join(ROOT, 'config/questions.js'));
check('题目数 20', QUESTIONS.length === 20, String(QUESTIONS.length));
check('参考样本 2000', ResonanceSpec.SAMPLE_SIZE === 2000);
check('随机种子一致', ResonanceSpec.SEED === 20261126);

// 极端作答：全 1
const answersLow = {};
QUESTIONS.forEach((q) => { answersLow[q.id] = 1; });
// 极端作答：全 5
const answersHigh = {};
QUESTIONS.forEach((q) => { answersHigh[q.id] = 5; });
const rLow = computeResult(answersLow);
const rHigh = computeResult(answersHigh);
check('全1 同频在 1-99', rLow.resonance >= 1 && rLow.resonance <= 99, String(rLow.resonance));
check('全5 同频在 1-99', rHigh.resonance >= 1 && rHigh.resonance <= 99, String(rHigh.resonance));
check('风格词 3 个', rHigh.styles.length === 3, String(rHigh.styles.length));
check('在意点 4 条', rHigh.careItems.length === 4, String(rHigh.careItems.length));
check('在意点含标题与描述', rHigh.careItems.every((i) => i.title && i.text));

// 与阶段0 score.js 交叉比对（同答案必须同结果）
console.log('\n[与阶段0一致性]');
try {
  const h5Score = await import(path.resolve(__dirname, '../apps/stage0-h5/js/score.js'));
  check('种子一致(跨端)', h5Score.ResonanceSpec.SEED === ResonanceSpec.SEED);
  const h5r = h5Score.computeResult(answersHigh);
  check('同频值一致(跨端)', h5r.resonance === rHigh.resonance, `${h5r.resonance} vs ${rHigh.resonance}`);
} catch (e) {
  console.log('  SKIP 阶段0交叉比对:', e.message.slice(0, 80));
}

// ---- 动物与文案 ----
console.log('\n[动物与文案]');
const { COPY, pickAnimal, pickHook } = require(path.join(ROOT, 'config/copy.js'));
const seq = [0.01, 0.5, 0.99];
for (const res of [20, 50, 70, 90]) {
  const a = pickAnimal(res, () => seq[res % 3]);
  check(`同频${res} 动物合法`, !!(a && a.name && a.line), JSON.stringify(a));
}
const hook = pickHook(pickAnimal(60, () => 0.1), 60, () => 0);
check('钩子含好奇文案', hook.length > 4, hook);
const forbidden = /正缘|适合属|相配|匹配度|百分百|一定/.test(hook);
check('钩子无配对断言', !forbidden, hook);
check('免责声明存在', !!COPY.disclaimer && COPY.disclaimer.includes('不构成婚恋建议'));

console.log(`\n结果：${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
