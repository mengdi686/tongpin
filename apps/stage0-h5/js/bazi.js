// 同频 · 八字文化层（确定性排盘，仅作文化叙事，不参与计分与排序）
// 引擎：lunar-javascript（MIT），本地 vendor，运行时零网络依赖
import { COPY } from '../config/copy.js';

const WUXING = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
const ZODIAC = { 子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龙', 巳: '蛇', 午: '马', 未: '羊', 申: '猴', 酉: '鸡', 戌: '狗', 亥: '猪' };
const TIME_BRANCH = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

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
  const text = `你的日主属「${dayMaster}」，${zodiac}年出生。传统说法里，${dayMaster}旺的人往往更有自己的主意——当个聊天开场白就好。`;
  // 便于转发的文化名片：只含日主、生肖与性格化短句，不含生辰与任何结论性判断
  const shareLine = `${dayMaster}日主 · ${zodiac}年｜${trait}`;
  return {
    available: true,
    timeSkipped,
    pillars: timeSkipped ? [ec.getYear(), ec.getMonth(), ec.getDay()] : [ec.getYear(), ec.getMonth(), ec.getDay(), ec.getTime()],
    dayMaster,
    yearWu,
    zodiac,
    trait,
    note,
    text,
    shareLine,
  };
}

export const BaziMeta = { WUXING, ZODIAC, TIME_BRANCH, WUXING_TRAIT };
