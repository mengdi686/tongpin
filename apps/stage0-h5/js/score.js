// 同频 · 阶段0 确定性计分逻辑
// 契约见 docs/07-stage0-assessment.md
import { L1_QUESTIONS, L2_QUESTIONS, DIM_LABELS, STYLE_WORDS, CARE_MAP, CARE_DETAILS, ADVICE_MAP } from '../config/questions.js';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const SCALE_MAX = 5; // L1 与 L2 统一为 5 点量表

// 维度原始分 1-5，反向题取 6-x，再归一到 0-100
function dimScores(questions, answers, scaleMax) {
  const groups = {};
  for (const q of questions) (groups[q.dim] ||= []).push(q);
  const out = {};
  for (const [dim, qs] of Object.entries(groups)) {
    let sum = 0;
    for (const q of qs) {
      const raw = answers[q.id];
      const val = q.reverse ? (scaleMax + 1 - raw) : raw;
      sum += val;
    }
    const avg = sum / qs.length;
    out[dim] = Math.round(((avg - 1) / (scaleMax - 1)) * 100);
  }
  return out;
}

// 「与你同频的人占比」参考样本：固定种子合成的 2000 份风格画像。
// 参数取自人格维度的常见分布（L1 中位 50、L2 因正向措辞偏高），非真实用户数据。
// 阶段 2 接入真实用户后，只替换本函数的样本来源，距离与阈值逻辑保持不变。
const SAMPLE_SIZE = 2000;
const SIMILARITY_BANDWIDTH = 28; // 相似度带宽：越大越宽松，避免常见作答落到个位百分比
const W_L1 = 0.35;
const W_L2 = 0.65;
const SEED = 20261126;

function createRng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function gaussian(rng, mean, sd) {
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return clamp(Math.round(mean + z * sd), 0, 100);
}

function buildReference() {
  const rng = createRng(SEED);
  const l1Dims = Object.keys(DIM_LABELS);
  const l2Dims = Object.keys(CARE_MAP);
  const out = [];
  for (let i = 0; i < SAMPLE_SIZE; i++) {
    const l1 = {};
    const l2 = {};
    for (const d of l1Dims) l1[d] = gaussian(rng, 50, 18);
    for (const d of l2Dims) l2[d] = gaussian(rng, 62, 16);
    out.push({ l1, l2 });
  }
  return out;
}

const REFERENCE = buildReference();

// 加权均方根距离：关系层权重更高，因为它对应 PNAS 2020 的高预测变量
function styleDistance(target, sample) {
  let sum = 0;
  const l1Dims = Object.keys(DIM_LABELS);
  const l2Dims = Object.keys(CARE_MAP);
  for (const d of l1Dims) sum += (W_L1 / l1Dims.length) * ((target.l1[d] - sample.l1[d]) / 100) ** 2;
  for (const d of l2Dims) sum += (W_L2 / l2Dims.length) * ((target.l2[d] - sample.l2[d]) / 100) ** 2;
  return Math.sqrt(sum) * 100;
}

// 语义：把参考样本按风格距离折算成占比，表示"与你风格相近的人约有多少"。
// 用平滑核而非硬阈值，避免全高分/全低分等极端作答落到 0%，同时保留相对差异。
// 不是遇到某个人的概率，不是关系结果，永不进入阶段 2 推荐排序。
export function computeResonance(l1, l2) {
  const target = { l1, l2 };
  let affinity = 0;
  for (const sample of REFERENCE) {
    const d = styleDistance(target, sample) / SIMILARITY_BANDWIDTH;
    affinity += Math.exp(-0.5 * d * d);
  }
  return clamp(Math.round((affinity / SAMPLE_SIZE) * 100), 1, 99);
}

export function computeResult(answers) {
  const l1 = dimScores(L1_QUESTIONS, answers, SCALE_MAX);
  const l2 = dimScores(L2_QUESTIONS, answers, SCALE_MAX);

  // 风格词：取 L1 中最偏离中位的 3 个维度
  const sorted = Object.entries(l1)
    .map(([dim, score]) => ({ dim, score, dev: Math.abs(score - 50) }))
    .sort((a, b) => b.dev - a.dev)
    .slice(0, 3);
  const styles = sorted.map(({ dim, score }) => STYLE_WORDS[dim][score >= 50 ? 'high' : 'low']);

  // 关系层：四个维度全部输出，按分数排序，每条按高低给具体描述
  const careItems = Object.entries(l2)
    .sort((a, b) => b[1] - a[1])
    .map(([dim, score]) => ({
      dim,
      score,
      title: CARE_MAP[dim],
      text: CARE_DETAILS[dim][score >= 50 ? 'high' : 'low'],
    }));
  const advice = ADVICE_MAP[careItems[0].dim];

  const resonance = computeResonance(l1, l2);
  return {
    l1,
    l2,
    styles,
    careItems,
    care: careItems.map((item) => item.title),
    advice,
    resonance,
    topCareDim: careItems[0].dim,
    dimLabels: DIM_LABELS,
  };
}

// 供测试与文档核对算法参数，避免硬编码在测试里
export const ResonanceSpec = { SAMPLE_SIZE, SIMILARITY_BANDWIDTH, W_L1, W_L2, SEED };
