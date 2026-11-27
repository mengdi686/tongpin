const { COPY } = require('../../config/copy.js');
const api = require('../../utils/api.js');

Page({
  data: {
    copy: COPY,
    step: 'gate',
  },

  onLoad(options) {
    this.setData({ step: 'gate' });
    // 分享归因：朋友点转发卡片进入时带 ref（分享者 vid），只记事件不落地社交关系
    const ref = (options && options.ref) || '';
    if (ref && ref !== getApp().globalData.vid) {
      api.track(getApp().globalData.vid, 'ref_in', { ref: ref.slice(0, 64) });
    }
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
    getApp().globalData.birth = null;
    wx.navigateTo({ url: '/pages/birth/birth' });
  },
});
