const { COPY } = require('../../config/copy.js');
const api = require('../../utils/api.js');

const TIME_OPTIONS = ['跳过时辰（信息不足，结果会标注）', '子 (23-1点)', '丑 (1-3点)', '寅 (3-5点)', '卯 (5-7点)', '辰 (7-9点)', '巳 (9-11点)', '午 (11-13点)', '未 (13-15点)', '申 (15-17点)', '酉 (17-19点)', '戌 (19-21点)', '亥 (21-23点)'];

Page({
  data: {
    copy: COPY.birth,
    date: '',
    maxDate: '',
    timeIndex: 0,
    timeOptions: TIME_OPTIONS,
    timeLabel: TIME_OPTIONS[0],
    gender: 'f',
    consented: false,
  },

  onLoad() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    this.setData({ maxDate: `${y}-${m}-${d}` });
  },

  onDate(e) { this.setData({ date: e.detail.value }); },

  onTime(e) {
    const i = Number(e.detail.value);
    this.setData({ timeIndex: i, timeLabel: TIME_OPTIONS[i] });
  },

  onGender(e) { this.setData({ gender: e.currentTarget.dataset.g }); },

  onConsent() { this.setData({ consented: !this.data.consented }); },

  onLegal(e) {
    const type = e.currentTarget.dataset.type || 'privacy';
    wx.navigateTo({ url: '/pages/legal/legal?type=' + type });
  },

  onNext() {
    const { date, timeIndex, gender, consented } = this.data;
    if (!date) {
      wx.showToast({ title: '请选择出生日期', icon: 'none' });
      return;
    }
    if (!consented) {
      wx.showToast({ title: '请勾选单独同意后再继续', icon: 'none' });
      return;
    }
    const app = getApp();
    // timeIndex 0=跳过；1..12 对应子..亥，hour=(index-1)*2（子时按 0 点）
    const skipped = timeIndex === 0;
    const hour = skipped ? null : (timeIndex - 1) * 2;
    app.globalData.birth = {
      date,
      time: skipped ? '' : String(hour).padStart(2, '0') + ':00',
      timeSkipped: skipped,
      gender,
    };
    // 只记"是否跳过时辰"布尔值，绝不上传日期/时辰本身
    api.track(app.globalData.vid, 'birth_submit', { step: skipped ? 'no_time' : 'with_time' });
    wx.navigateTo({ url: '/pages/quiz/quiz' });
  },
});
