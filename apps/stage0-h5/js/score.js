// 同频 · 阶段0 确定性计分逻辑
// 契约见 docs/07-stage0-assessment.md
import { L1_QUESTIONS, L2_QUESTIONS, DIM_LABELS, STYLE_WORDS, CARE_MAP, ADVICE_MAP } from '../config/questions.js';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// 维度原始分：1-7（L1）/ 1-5（L2），反向题取 8-x / 6-x，再归一到 0-100
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

export function computeResult(answers) {
  const l1 = dimScores(L1_QUESTIONS, answers, 7);
  const l2 = dimScores(L2_QUESTIONS, answers, 5);

  // 风格词：取 L1 中最偏离中位的 3 个维度
  const sorted = Object.entries(l1)
    .map(([dim, score]) => ({ dim, score, dev: Math.abs(score - 50) }))
    .sort((a, b) => b.dev - a.dev)
    .slice(0, 3);
  const styles = sorted.map(({ dim, score }) => STYLE_WORDS[dim][score >= 50 ? 'high' : 'low']);

  // 关系层：取最高的 2 个维度作为「最在意」
  const care = Object.entries(l2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([dim]) => CARE_MAP[dim]);
  const topCareDim = Object.entries(l2).sort((a, b) => b[1] - a[1])[0][0];
  const advice = ADVICE_MAP[topCareDim];

  // 百分比：L1 弱权重 0.15，L2 主权重 0.45，L3 权重恒为 0
  const l1avg = Object.values(l1).reduce((a, b) => a + b, 0) / Object.keys(l1).length;
  const l2avg = Object.values(l2).reduce((a, b) => a + b, 0) / Object.keys(l2).length;
  const score = clamp(Math.round(40 + l1avg * 0.15 + l2avg * 0.45), 0, 100);

  return { l1, l2, styles, care, advice, score, topCareDim, dimLabels: DIM_LABELS };
}
