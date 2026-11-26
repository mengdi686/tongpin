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

export function submitReserve(phone, onDone) {
  try {
    fetch(API + 'reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vid: getVid(), phone }),
    }).then((r) => r.ok).then(onDone).catch(() => onDone(false));
  } catch { onDone(false); }
}

export const vid = getVid;
