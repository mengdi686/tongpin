// 同频 · 阶段1 确定性计分逻辑（从 apps/stage0-h5/js/score.js 移植）
// 契约见 docs/07-stage0-assessment.md；与阶段0完全同参，保证结果一致
const {
  L1_QUESTIONS, L2_QUESTIONS, DIM_LABELS, STYLE_WORDS, CARE_MAP, CARE_DETAILS, ADVICE_MAP,
} = require('../config/questions.js');

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const SCALE_MAX = 5;

function dimScores(questions, answers, scaleMax) {
  const groups = {};
  for (const q of questions) (groups[q.dim] || (groups[q.dim] = [])).push(q);
  const out = {};
  for (const dim of Object.keys(groups)) {
    const qs = groups[dim];
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

// 固定种子合成参考样本（2000 份），与阶段0同种子同算法
const SAMPLE_SIZE = 2000;
const SIMILARITY_BANDWIDTH = 28;
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

function styleDistance(target, sample) {
  let sum = 0;
  const l1Dims = Object.keys(DIM_LABELS);
  const l2Dims = Object.keys(CARE_MAP);
  for (const d of l1Dims) sum += (W_L1 / l1Dims.length) * ((target.l1[d] - sample.l1[d]) / 100) ** 2;
  for (const d of l2Dims) sum += (W_L2 / l2Dims.length) * ((target.l2[d] - sample.l2[d]) / 100) ** 2;
  return Math.sqrt(sum) * 100;
}

function computeResonance(l1, l2) {
  const target = { l1, l2 };
  let affinity = 0;
  for (const sample of REFERENCE) {
    const d = styleDistance(target, sample) / SIMILARITY_BANDWIDTH;
    affinity += Math.exp(-0.5 * d * d);
  }
  return clamp(Math.round((affinity / SAMPLE_SIZE) * 100), 1, 99);
}

function computeResult(answers) {
  const l1 = dimScores(L1_QUESTIONS, answers, SCALE_MAX);
  const l2 = dimScores(L2_QUESTIONS, answers, SCALE_MAX);

  const sorted = Object.keys(l1)
    .map((dim) => ({ dim, score: l1[dim], dev: Math.abs(l1[dim] - 50) }))
    .sort((a, b) => b.dev - a.dev)
    .slice(0, 3);
  const styles = sorted.map(({ dim, score }) => STYLE_WORDS[dim][score >= 50 ? 'high' : 'low']);

  const careItems = Object.keys(l2)
    .sort((a, b) => l2[b] - l2[a])
    .map((dim) => ({
      dim,
      score: l2[dim],
      title: CARE_MAP[dim],
      text: CARE_DETAILS[dim][l2[dim] >= 50 ? 'high' : 'low'],
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

module.exports = { computeResult, computeResonance, ResonanceSpec: { SAMPLE_SIZE, SIMILARITY_BANDWIDTH, W_L1, W_L2, SEED } };
