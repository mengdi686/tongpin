// 同频 · 阶段1 数据接口封装
// 接自有服务器 stage0-api；所有埋点失败静默，不阻断测评主流程。
// 字段契约与 apps/stage0-h5/js/track.js 完全一致，见 docs/08-data-governance.md

function base() {
  const app = getApp();
  return (app && app.globalData.apiBase) || 'https://stage0.tongpin.truthhare.com/api';
}

function post(path, payload) {
  const app = getApp();
  const vid = (app && app.globalData.vid) || '';
  return new Promise((resolve) => {
    wx.request({
      url: base() + '/' + path,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: Object.assign({ vid }, payload),
      timeout: 6000,
      success: (res) => resolve(res && res.statusCode === 200 ? res.data : null),
      fail: () => resolve(null),
    });
  });
}

// 与阶段0 track(type, payload) 对齐：后端事件白名单见 server.py ALLOWED_EVENTS
function track(vid, type, payload) {
  return post('event', { type, payload: payload || {} });
}

function saveResult(vid, answers, result) {
  return post('result', {
    answers,
    resonance: result.resonance,
    styles: result.styles,
    careTop: result.care,
    animal: '',
  });
}

function saveProfile(vid, resonance, styles, careTop, animalId) {
  return post('profile', {
    resonance,
    styles,
    careTop,
    animal: animalId,
  });
}

function reserve(vid, phone) {
  return post('reserve', { phone });
}

module.exports = { track, saveResult, saveProfile, reserve, post };
