const app = getApp();
const { computeResult } = require('../../utils/score.js');
const { COPY, pickAnimal, pickHook } = require('../../config/copy.js');
const api = require('../../utils/api.js');

Page({
  data: {
    copy: COPY,
    result: null,
    animal: null,
    hook: '',
    phone: '',
    agreed: false,
    reserved: false,
  },

  onLoad() {
    const answers = app.globalData.answers;
    if (!answers || Object.keys(answers).length === 0) {
      wx.redirectTo({ url: '/pages/index/index' });
      return;
    }
    const result = computeResult(answers);
    const animal = pickAnimal(result.resonance);
    const hook = pickHook(animal, result.resonance);
    app.globalData.result = result;
    this.setData({ result, animal, hook });

    const vid = app.globalData.vid;
    api.track(vid, 'result_view', { resonance: result.resonance });
    api.saveResult(vid, answers, result);
    api.saveProfile(vid, result.resonance, result.styles, result.care, animal.id);
  },

  onShareAppMessage() {
    const r = this.data.result;
    return {
      title: this.data.hook,
      path: '/pages/index/index',
      imageUrl: '',
    };
  },

  onCopy() {
    const text = this.data.hook + '\n搜索小程序「' + COPY.brand + '」或点我发你的卡片，一起测测。';
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: COPY.result.shareSaved, icon: 'none' });
        api.track(app.globalData.vid, 'share_copy', {});
      },
    });
  },

  onPhone(e) {
    this.setData({ phone: e.detail.value });
  },

  onToggleAgree() {
    this.setData({ agreed: !this.data.agreed });
  },

  onReserve() {
    const phone = this.data.phone;
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入 11 位手机号', icon: 'none' });
      return;
    }
    if (!this.data.agreed) {
      wx.showToast({ title: '请先勾选同意', icon: 'none' });
      return;
    }
    api.reserve(app.globalData.vid, phone).then(() => {
      this.setData({ reserved: true });
      api.track(app.globalData.vid, 'reserve_submit', {});
    });
  },

  onAgain() {
    app.globalData.answers = {};
    app.globalData.result = null;
    api.track(app.globalData.vid, 'again', {});
    wx.redirectTo({ url: '/pages/index/index' });
  },
});
