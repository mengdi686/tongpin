// 阶段0 行为采集：匿名 ID + 事件上报。绝不上报生辰、时辰、人脸等敏感信息。
const VID_KEY = 'tp_s0_vid';
// 独立子域名用 /api/；挂在主域名 /stage0/ 子路径时用 /stage0/api/
const API = location.pathname.startsWith('/stage0/') ? '/stage0/api/' : '/api/';

function getVid() {
  try {
    let v = localStorage.getItem(VID_KEY);
    if (!v) {
      v = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(VID_KEY, v);
    }
    return v;
  } catch {
    return 'tmp_' + Math.random().toString(36).slice(2);
  }
}

function post(path, payload) {
  try {
    fetch(API + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vid: getVid(), ...payload }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* 采集失败不影响主流程 */ }
}

export function track(type, payload = {}) {
  post('event', { type, payload });
}

export function trackProfile(resonance, styles, careTop, animal) {
  post('profile', { resonance, styles, careTop, animal });
}

export function trackResult(answers, resonance, styles, careTop, animal) {
  post('result', { answers, resonance, styles, careTop, animal });
}

export function trackBirth(birthInfo, culture, onDone) {
  // 生辰经 HTTPS 传服务端加密落库；consent 为用户单独勾选取证
  fetch(API + 'birth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vid: getVid(), consent: true,
      date: birthInfo.date, time: birthInfo.time, gender: birthInfo.gender,
      dayMaster: culture.dayMaster, elements: culture.counts, zodiac: culture.zodiac,
    }),
  }).then((r) => r.ok).then((ok) => onDone && onDone(ok)).catch(() => onDone && onDone(false));
}

export function requestBackfill(onData) {
  fetch(API + 'backfill', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vid: getVid() }),
  }).then((r) => r.json()).then(onData).catch(() => {});
}

export function submitReserve(phone, onDone) {
  try {
    fetch(API + 'reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vid: getVid(), phone }),
    }).then((r) => r.ok).then(onDone).catch(() => onDone(false));
  } catch { onDone(false); }
}

// 删除权：一次清空该 vid 全部记录；返回删除结果供 UI 反馈
export function deleteAll(onDone) {
  try {
    fetch(API + 'delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vid: getVid() }),
    }).then((r) => r.ok).then(onDone).catch(() => onDone && onDone(false));
  } catch { onDone && onDone(false); }
}

export const vid = getVid;
