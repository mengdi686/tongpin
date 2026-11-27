const { COPY } = require('../../config/copy.js');
const api = require('../../utils/api.js');

Page({
  data: {
    copy: COPY,
    step: 'gate',
  },

  onLoad() {
    this.setData({ step: 'gate' });
  },

  onAdult() {
    const vid = getApp().globalData.vid;
    api.track(vid, 'gate_pass', {});
    this.setData({ step: 'consent' });
  },

  onMinor() {
    const vid = getApp().globalData.vid;
    api.track(vid, 'gate_reject', {});
    this.setData({ step: 'reject' });
  },

  onLegal(e) {
    const type = e.currentTarget.dataset.type || 'privacy';
    wx.navigateTo({ url: '/pages/legal/legal?type=' + type });
  },

  onStart() {
    const vid = getApp().globalData.vid;
    api.track(vid, 'consent_agree', {});
    getApp().globalData.answers = {};
    wx.navigateTo({ url: '/pages/quiz/quiz' });
  },
});
