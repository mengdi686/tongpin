// 同频 · 阶段1 小程序入口
const api = require('./utils/api.js');

const API_BASE = 'https://stage0.tongpin.truthhare.com/api';

App({
  onLaunch() {
    // 身份锚点：阶段1 用本地持久 vid；拿到 AppID 后由 /api/wx-login 归并到 openid
    let vid = wx.getStorageSync('tp_vid');
    if (!vid) {
      vid = 'mp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
      wx.setStorageSync('tp_vid', vid);
    }
    this.globalData.vid = vid;
    this.globalData.apiBase = API_BASE;
    api.track(vid, 'visit', {});
  },
  globalData: {
    vid: '',
    answers: {},
    result: null,
    apiBase: API_BASE,
  },
});
