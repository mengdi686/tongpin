const { QUESTIONS, L1_QUESTIONS, SCALE_OPTIONS } = require('../../config/questions.js');
const { COPY } = require('../../config/copy.js');
const api = require('../../utils/api.js');

const TOTAL = QUESTIONS.length;
const L1_COUNT = L1_QUESTIONS.length;
const OPTIONS = SCALE_OPTIONS.map((label, i) => ({ label, value: i + 1 }));

Page({
  data: {
    index: 0,
    total: TOTAL,
    question: QUESTIONS[0],
    options: OPTIONS,
    answer: 0,
    percent: 0,
    isLast: false,
    sectionTitle: COPY.section.l1,
    sectionSub: COPY.section.l1sub,
  },

  onLoad() {
    this.render(0);
  },

  render(index) {
    const q = QUESTIONS[index];
    const app = getApp();
    const answer = app.globalData.answers[q.id] || 0;
    this.setData({
      index,
      question: q,
      answer,
      percent: Math.round(((index + 1) / TOTAL) * 100),
      isLast: index === TOTAL - 1,
      sectionTitle: index < L1_COUNT ? COPY.section.l1 : COPY.section.l2,
      sectionSub: index < L1_COUNT ? COPY.section.l1sub : COPY.section.l2sub,
    });
  },

  onChoose(e) {
    const value = Number(e.currentTarget.dataset.value);
    const idx = this.data.index;
    const q = QUESTIONS[idx];
    getApp().globalData.answers[q.id] = value;
    this.setData({ answer: value });
    api.track(getApp().globalData.vid, 'q_answer', { qid: q.id, value });
    // 点选即自动前进：先让用户看到选中态，再切下一题；最后一题直接出结果。
    // 防重入：正在切换时忽略后续点击。
    if (this._advancing) return;
    this._advancing = true;
    const go = () => {
      this._advancing = false;
      if (idx === TOTAL - 1) {
        wx.redirectTo({ url: '/pages/result/result' });
      } else {
        this.render(idx + 1);
      }
    };
    if (this._advanceTimer) clearTimeout(this._advanceTimer);
    this._advanceTimer = setTimeout(go, 220);
  },

  onBack() {
    if (this._advanceTimer) { clearTimeout(this._advanceTimer); this._advanceTimer = null; }
    this._advancing = false;
    if (this.data.index > 0) this.render(this.data.index - 1);
  },
});
