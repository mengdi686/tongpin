// 同频 · 阶段0 稳定性测试（200 次）
// 用法：node scripts/stage0-stability.mjs
// 契约见 docs/07-stage0-assessment.md 第 7 节
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vendor = path.join(root, 'apps/stage0-h5/vendor/lunar.js');
const Lunar = (await import(pathToFileURL(vendor).href)).default.Lunar;

const { computeResult } = await import(pathToFileURL(path.join(root, 'apps/stage0-h5/js/score.js')).href);
const { computeCulture } = await import(pathToFileURL(path.join(root, 'apps/stage0-h5/js/bazi.js')).href);

const BANNED = ['算命', '测算', '预测', '命中注定', '正缘预测', '天作之合', '克夫', '克妻', '化解', '改运', '转运', '保证脱单', '准确率', '必然', '注定', '诊断', '治疗'];
const CASES = [
  { date: '1990-05-15', time: '10:00', skipped: false },
  { date: '1990-05-15', time: '23:30', skipped: false },
  { date: '1990-05-15', time: '00:30', skipped: false },
  { date: '1992-08-08', time: '20:00', skipped: false },
  { date: '1986-07-15', time: '09:00', skipped: false },
  { date: '1995-02-04', time: '12:00', skipped: false },
  { date: '2000-01-01', time: '06:00', skipped: false },
  { date: '1988-12-31', time: '22:00', skipped: false },
  { date: '1993-03-21', time: '14:00', skipped: false },
  { date: '1997-11-11', time: '18:00', skipped: false },
  { date: '1985-06-06', time: '', skipped: true },
  { date: '1999-09-09', time: '', skipped: true },
  { date: '1978-04-12', time: '08:00', skipped: false },
  { date: '2001-12-25', time: '16:00', skipped: false },
  { date: '1991-01-06', time: '11:00', skipped: false },
  { date: '1989-08-19', time: '15:00', skipped: false },
  { date: '1994-10-03', time: '07:00', skipped: false },
  { date: '1996-03-17', time: '13:00', skipped: false },
  { date: '1987-05-29', time: '21:00', skipped: false },
  { date: '2002-07-07', time: '05:00', skipped: false },
];

const answers = Object.fromEntries(
  [...Array.from({ length: 12 }, (_, i) => ['n' + (i % 2 + 1) + (i > 1 ? i : ''), 4]),
   ...Array.from({ length: 8 }, (_, i) => ['r' + (i + 1), 3])]
);
// 用真实题 id 覆盖，保证计分链路完整
const ids = ['n1','n2','e1','e2','o1','o2','a1','a2','c1','c2','s1','s2','r1','r2','r3','r4','r5','r6','r7','r8'];
ids.forEach((id, i) => { answers[id] = i % 2 === 0 ? 4 : 5; });

const errors = [];
let runs = 0;

for (const c of CASES) {
  const baseline = computeCulture({ date: c.date, time: c.time, timeSkipped: c.skipped, Lunar });

  for (let n = 0; n < 10; n++) {
    runs++;
    const r = computeResult(answers);
    const culture = computeCulture({ date: c.date, time: c.time, timeSkipped: c.skipped, Lunar });

    if (!baseline.available) errors.push(`${c.date} 排盘不可用`);
    if (JSON.stringify(culture.pillars) !== JSON.stringify(baseline.pillars)) {
      errors.push(`${c.date} 第${n}次四柱漂移`);
    }
    if (r.score !== 40 + Math.round(((Object.values(r.l1).reduce((a, b) => a + b, 0) / 6) * 0.15 + (Object.values(r.l2).reduce((a, b) => a + b, 0) / 4) * 0.45))) {
      errors.push(`${c.date} 第${n}次百分比与公式不符`);
    }
    if (c.skipped && !culture.note) errors.push(`${c.date} 缺时辰未标注信息不足`);
    if (!c.skipped && culture.note) errors.push(`${c.date} 有时辰却标注信息不足`);

    const text = [r.styles.join(''), r.care.join(''), r.advice, culture.text, culture.note].join('');
    for (const w of BANNED) {
      if (text.includes(w)) errors.push(`${c.date} 第${n}次命中禁用词「${w}」`);
    }
  }
}

console.log(`同频 · 阶段0 稳定性测试：${runs} 次`);
console.log(`  用例：${CASES.length} 组（含早晚子时、节气交界、夏令时年份、缺时辰）`);
if (errors.length) {
  console.log(`\nFAIL（${errors.length} 项）`);
  for (const e of [...new Set(errors)].slice(0, 30)) console.log(`  - ${e}`);
  process.exit(1);
}
console.log('\nPASS：四柱确定性 / 百分比一致 / 缺时辰降级 / 禁用词零命中');
