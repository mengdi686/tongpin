// 同频 · 阶段0 稳定性测试（200 次）
// 用法：node scripts/stage0-stability.mjs
// 契约见 docs/07-stage0-assessment.md 第 7 节
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vendor = path.join(root, 'apps/stage0-h5/vendor/lunar.js');
const Lunar = (await import(pathToFileURL(vendor).href)).default.Lunar;

const { computeResult, computeResonance } = await import(pathToFileURL(path.join(root, 'apps/stage0-h5/js/score.js')).href);
const { computeCulture } = await import(pathToFileURL(path.join(root, 'apps/stage0-h5/js/bazi.js')).href);
const { COPY } = await import(pathToFileURL(path.join(root, 'apps/stage0-h5/config/copy.js')).href);
const { pickAnimal, bandFor, ANIMALS, ANIMAL_BANDS } = await import(pathToFileURL(path.join(root, 'apps/stage0-h5/config/animals.js')).href);

const BANNED = ['算命', '测算', '预测', '命中注定', '正缘预测', '天作之合', '克夫', '克妻', '化解', '改运', '转运', '保证脱单', '准确率', '一定', '必然', '注定', '诊断', '治疗', '心理疾病'];
// 文化彩蛋延伸段不得出现配对断言
const PAIRING_CLAIMS = ['另一半属', '更适合你', '对你更好', '相配', '相克', '最佳配对', '命定'];
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

const ids = ['n1', 'n2', 'e1', 'e2', 'o1', 'o2', 'a1', 'a2', 'c1', 'c2', 's1', 's2', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8'];
// 4 种作答模式轮换，覆盖常见分布；所有值均在 5 点量表范围内
const ANSWER_PATTERNS = [
  (list) => Object.fromEntries(list.map((id, i) => [id, i % 2 === 0 ? 4 : 5])),
  (list) => Object.fromEntries(list.map((id) => [id, 3])),
  (list) => Object.fromEntries(list.map((id, i) => [id, i % 3 === 0 ? 2 : 4])),
  (list) => Object.fromEntries(list.map((id) => [id, 5])),
];

const errors = [];
let runs = 0;

for (let ci = 0; ci < CASES.length; ci++) {
  const c = CASES[ci];
  const answers = ANSWER_PATTERNS[ci % ANSWER_PATTERNS.length](ids);
  const baseline = computeCulture({ date: c.date, time: c.time, timeSkipped: c.skipped, Lunar });
  const baselineResult = computeResult(answers);

  for (let n = 0; n < 10; n++) {
    runs++;
    const r = computeResult(answers);
    const culture = computeCulture({ date: c.date, time: c.time, timeSkipped: c.skipped, Lunar });

    // 排盘确定性
    if (!baseline.available) errors.push(`${c.date} 排盘不可用`);
    if (JSON.stringify(culture.pillars) !== JSON.stringify(baseline.pillars)) {
      errors.push(`${c.date} 第${n}次四柱漂移`);
    }

    // 同频占比确定性与数值范围
    if (!Number.isInteger(r.resonance) || r.resonance < 1 || r.resonance > 99) {
      errors.push(`${c.date} 第${n}次同频占比越界：${r.resonance}`);
    }
    if (r.resonance !== baselineResult.resonance) errors.push(`${c.date} 第${n}次同频占比漂移`);
    if (r.resonance !== computeResonance(r.l1, r.l2)) errors.push(`${c.date} 第${n}次占比与公式不符`);

    // 5 点量表归一后各维度必须在 0-100
    for (const [dim, v] of Object.entries({ ...r.l1, ...r.l2 })) {
      if (!Number.isInteger(v) || v < 0 || v > 100) errors.push(`${c.date} 第${n}次维度 ${dim} 越界：${v}`);
    }

    // 关系层必须恰好 4 条，且每条有具体描述
    if (r.careItems.length !== 4) errors.push(`${c.date} 第${n}次关系层条数不是 4`);
    if (r.care.length !== 4 || r.care.some((x) => !x)) errors.push(`${c.date} 第${n}次关系层标题缺失`);
    for (const item of r.careItems) {
      if (!item.text || item.text.length < 12) errors.push(`${c.date} 第${n}次「${item.dim}」缺少具体描述`);
    }

    // 文化彩蛋确定性、五行延伸段存在、不得泄露生辰或出现配对断言
    if (culture.shareLine !== baseline.shareLine) errors.push(`${c.date} 第${n}次文化短句漂移`);
    if (culture.shareLine && /\d{4}[-/年]/.test(culture.shareLine)) errors.push(`${c.date} 第${n}次文化短句含生辰`);
    if (!culture.extended || !culture.extended.includes('五行')) errors.push(`${c.date} 第${n}次五行延伸段缺失`);
    if (culture.extended && culture.extended !== baseline.extended) errors.push(`${c.date} 第${n}次五行延伸段漂移`);
    for (const claim of PAIRING_CLAIMS) {
      if (culture.extended && culture.extended.includes(claim)) errors.push(`${c.date} 第${n}次五行延伸段命中配对断言「${claim}」`);
    }

    // 同频小动物：落在占比对应分数段，素材文件存在
    const animal = pickAnimal(r.resonance, () => 0.999999);
    const band = bandFor(r.resonance);
    if (!band.ids.includes(animal.id)) errors.push(`${c.date} 第${n}次动物 ${animal.id} 不属于 ${r.resonance}% 对应分数段`);
    if (!ANIMALS[animal.id]) errors.push(`${c.date} 第${n}次动物 ${animal.id} 无配置`);
    const asset = path.join(root, 'apps/stage0-h5/assets/animals', animal.file);
    if (!fs.existsSync(asset)) errors.push(`${c.date} 第${n}次动物素材缺失：${animal.file}`);
    if (animal.line && PAIRING_CLAIMS.some((claim) => animal.line.includes(claim))) errors.push(`${c.date} 第${n}次动物文案命中配对断言`);

    // 缺时辰降级
    if (c.skipped && !culture.note) errors.push(`${c.date} 缺时辰未标注信息不足`);
    if (!c.skipped && culture.note) errors.push(`${c.date} 有时辰却标注信息不足`);

    // 禁用词检查覆盖结果卡全部可见文案
    const text = [
      r.styles.join(''), r.care.join(''), r.careItems.map((x) => x.text).join(''),
      r.advice, COPY.result.scoreNote, COPY.result.scoreFootnote, COPY.result.animalNote,
      culture.text, culture.extended, culture.shareLine, culture.note, animal.line,
    ].join('');
    for (const w of BANNED) {
      if (text.includes(w)) errors.push(`${c.date} 第${n}次命中禁用词「${w}」`);
    }
  }
}

console.log(`同频 · 阶段0 稳定性测试：${runs} 次`);
console.log(`  用例：${CASES.length} 组（含早晚子时、节气交界、夏令时年份、缺时辰）× 4 种作答模式`);
if (errors.length) {
  console.log(`\nFAIL（${errors.length} 项）`);
  for (const e of [...new Set(errors)].slice(0, 30)) console.log(`  - ${e}`);
  process.exit(1);
}
console.log('\nPASS：四柱确定性 / 同频占比一致 / 5点量表归一 / 关系层4条 / 文化彩蛋无配对断言 / 动物段位与素材 / 缺时辰降级 / 禁用词零命中');
