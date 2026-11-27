const app = getApp();
const { computeResult } = require('../../utils/score.js');
const { COPY, pickAnimal, pickHook, pickShareTitle } = require('../../config/copy.js');
const api = require('../../utils/api.js');
const { renderShareCard } = require('../../utils/share-card.js');
const { computeCulture } = require('../../utils/bazi.js');

Page({
  data: {
    copy: COPY,
    result: null,
    animal: null,
    animalImgOk: true,
    culture: null,
    hook: '',
    shareTitle: '',
    shareImage: '',
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
    const shareTitle = pickShareTitle();
    const birth = app.globalData.birth;
    const culture = birth ? computeCulture(birth) : { available: false };
    app.globalData.result = result;
    this.setData({ result, animal, hook, shareTitle, culture });

    const vid = app.globalData.vid;
    api.track(vid, 'result_view', { resonance: result.resonance });
    api.saveResult(vid, answers, result);
    api.saveProfile(vid, result.resonance, result.styles, result.care, animal.id);
    // 生辰加密落库（用户已在生日页单独同意）
    if (birth && culture.available) api.saveBirth(birth, culture);

    // 生成分享卡图；失败时 imageUrl 留空，微信自动截图，不影响分享主流程
    renderShareCard(this, result, hook, animal, culture).then((imageUrl) => {
      if (imageUrl) this.setData({ shareImage: imageUrl });
    });
  },

  onShareAppMessage() {
    return {
      title: this.data.shareTitle || this.data.hook,
      path: '/pages/index/index?ref=' + (app.globalData.vid || ''),
      imageUrl: this.data.shareImage || '',
    };
  },

  onCopy() {
    // 复制文案带可点击 H5 链接 + ref 短码（与分享卡片同源），朋友点开可追来源
    const ref = String(app.globalData.vid || '').replace(/^v_/, '').replace(/[^A-Za-z0-9]/g, '').slice(0, 8) || 'direct';
    const url = 'https://stage0.tongpin.truthhare.com/?ref=' + ref;
    const text = this.data.hook + '\n' + COPY.result.urlHint + ' ' + url;
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: COPY.result.shareSaved, icon: 'none' });
        api.track(app.globalData.vid, 'share_copy', {});
      },
    });
  },

  // 部分真机不支持 SVG image：失败时隐藏图片，动物名与描述文字照常显示
  onAnimalImgError() {
    this.setData({ animalImgOk: false });
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
    api.reserve(app.globalData.vid, phone).then((ok) => {
      // api.post 在网络失败时 resolve(null)；不能把失败误报成预约成功
      if (!ok) {
        wx.showToast({ title: '提交失败，请稍后重试', icon: 'none' });
        return;
      }
      this.setData({ reserved: true });
      api.track(app.globalData.vid, 'reserve_submit', {});
    });
  },

  onLegal(e) {
    const type = e.currentTarget.dataset.type || 'privacy';
    wx.navigateTo({ url: '/pages/legal/legal?type=' + type });
  },

  onDeleteData() {
    wx.showModal({
      title: COPY.result.deleteData,
      content: COPY.result.deleteConfirm,
      confirmText: '确定删除',
      confirmColor: '#e63a77',
      success: (res) => {
        if (!res.confirm) return;
        api.deleteAll().then((ok) => {
          if (!ok) {
            wx.showToast({ title: COPY.result.deleteFail, icon: 'none' });
            return;
          }
          app.globalData.answers = {};
          app.globalData.result = null;
          wx.showToast({ title: COPY.result.deleteDone, icon: 'none' });
          setTimeout(() => wx.redirectTo({ url: '/pages/index/index' }), 1200);
        });
      },
    });
  },

  onAgain() {
    app.globalData.answers = {};
    app.globalData.result = null;
    api.track(app.globalData.vid, 'again', {});
    wx.redirectTo({ url: '/pages/index/index' });
  },
});
