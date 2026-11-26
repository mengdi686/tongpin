// 同频 · 八字文化层（确定性排盘，仅作文化叙事，不参与计分与排序）
// 引擎：lunar-javascript（MIT），本地 vendor，运行时零网络依赖
import { COPY } from '../config/copy.js';

const WUXING = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
const ZODIAC = { 子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龙', 巳: '蛇', 午: '马', 未: '羊', 申: '猴', 酉: '鸡', 戌: '狗', 亥: '猪' };
const TIME_BRANCH = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const BRANCH_WUXING = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
const ALL_WUXING = ['金', '木', '水', '火', '土'];

// 统计四柱五行分布，只用于生成文化描述，不参与任何评分与匹配判断
function countWuxing(pillars) {
  const counts = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
  for (const p of pillars) {
    for (const ch of p) {
      const w = WUXING[ch] || BRANCH_WUXING[ch];
      if (w) counts[w]++;
    }
  }
  return counts;
}

// C 档诙谐文案：只讲五行倾向，明确"传统说法没定论"，不做任何配对断言
function buildExtended(counts) {
  const sorted = ALL_WUXING.slice().sort((a, b) => counts[a] - counts[b]);
  const low = sorted.filter((w) => counts[w] === counts[sorted[0]]);
  const label = counts[sorted[0]] === 0 ? '几乎没有' : '偏少';
  const parts = low.length >= 3 ? ALL_WUXING.join('') : low.join('');
  return `你的五行里${parts}${label}。至于另一半该配什么五行？传统说法自己都没吵明白——互补派和相似派谁也不服谁。当个聊天梗挺好，别当择偶标准。`;
}

// 五行对应的短句，纯文化描述，不含任何吉凶与关系结论
const WUXING_TRAIT = {
  木: '向上生长，认准了就认真',
  火: '自带热度，靠近了就知道',
  土: '稳稳当当，适合慢慢相处',
  金: '有棱有角，也很护短',
  水: '心思通透，相处不费劲',
};

// 时辰索引：23:00-01:00 子，01:00-03:00 丑 ...
export function timeBranchIndex(hour) {
  return Math.floor(((hour + 1) % 24) / 2);
}

export function getLunarAPI() {
  if (typeof window !== 'undefined' && window.Lunar) return window.Lunar;
  return null;
}

// 生成文化层结果；缺时辰时降级为三柱并标注信息不足
export function computeCulture({ date, time, timeSkipped, Lunar }) {
  if (!Lunar) return { available: false, note: COPY.result.insufficient };
  const [y, m, d] = date.split('-').map(Number);
  const hour = timeSkipped ? null : Number(time.split(':')[0]);
  const solar = Lunar.fromDate(new Date(y, m - 1, d, hour ?? 12, 0, 0));
  const ec = solar.getEightChar();

  const yearGan = ec.getYear().slice(0, 1);
  const dayGan = ec.getDay().slice(0, 1);
  const yearZhi = ec.getYear().slice(-1);
  const dayMaster = WUXING[dayGan] || '—';
  const yearWu = WUXING[yearGan] || '—';
  const zodiac = ZODIAC[yearZhi] || '—';
  const trait = WUXING_TRAIT[dayMaster] || '有自己的节奏';

  const note = timeSkipped ? COPY.result.insufficient : '';
  const pillars = timeSkipped ? [ec.getYear(), ec.getMonth(), ec.getDay()] : [ec.getYear(), ec.getMonth(), ec.getDay(), ec.getTime()];
  const counts = countWuxing(pillars);
  const text = `你的日主属「${dayMaster}」，${zodiac}年出生。传统说法里，${dayMaster}旺的人往往更有自己的主意——当个聊天开场白就好。`;
  const extended = buildExtended(counts); // 五行倾向延伸文案，C 档诙谐版，无配对断言
  // 分享图文案：只含日主、生肖与性格化短句，不含生辰与任何结论性判断
  const shareLine = `${dayMaster}日主 · ${zodiac}年｜${trait}`;
  return {
    available: true,
    timeSkipped,
    pillars,
    counts,
    dayMaster,
    yearWu,
    zodiac,
    trait,
    note,
    text,
    extended,
    shareLine,
  };
}

export const BaziMeta = { WUXING, ZODIAC, TIME_BRANCH, WUXING_TRAIT };
