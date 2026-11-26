// 同频 · 阶段0 分享模块
// 三件事：可点击的分享链接（带 ref 归因）、引发好奇的文案、带动物图的分享卡片。
// 红线：文案只制造好奇，不做配对断言、不预测、不出现禁用词（见 docs/07 第7节）。
import { COPY } from '../config/copy.js';
import { track, vid } from './track.js';

const ASSET_BASE = 'assets/animals/';

// 分享链接：当前页面地址 + ref 短码，朋友点开直达测评页，可追来源
export function shareUrl() {
  const base = location.origin + location.pathname;
  const ref = vid().replace(/^v_/, '').replace(/[^A-Za-z0-9]/g, '').slice(0, 8);
  return base + '?ref=' + encodeURIComponent(ref || 'direct');
}

// 好奇文案：随机一条模板，填入动物名与同频占比，只勾好奇心不给结论
export function shareHook(r) {
  const list = COPY.result.hooks;
  const tpl = list[Math.floor(Math.random() * list.length) % list.length];
  return tpl.replace('{animal}', r.animal?.name || '神秘小动物')
            .replace('{resonance}', String(r.resonance));
}

export function shareText(r) {
  return shareHook(r) + '\n' + COPY.result.urlHint + ' ' + shareUrl();
}

// 复制文案+链接；降级到 textarea + execCommand，避免旧浏览器无 clipboard API
export async function copyShare(r) {
  const text = shareText(r);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      track('share_copy');
      return true;
    }
  } catch { /* 降级 */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (ok) track('share_copy');
    return ok;
  } catch {
    return false;
  }
}

function wrap(ctx, text, x, y, maxWidth, lineHeight) {
  let line = '';
  let cy = y;
  for (const ch of text) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = ch;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
  return cy;
}

function drawCard(r, hook) {
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 1120;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff5f8'; ctx.fillRect(0, 0, 640, 1120);
  ctx.fillStyle = '#ff4d8d'; ctx.fillRect(0, 0, 640, 12);

  // 好奇文案：分享卡片的钩子，放大加粗，朋友一眼看到才愿意点
  ctx.fillStyle = '#221c23'; ctx.font = '500 40px sans-serif';
  ctx.fillText(COPY.brand + ' · ' + COPY.slogan, 40, 92);
  ctx.fillStyle = '#e63a77'; ctx.font = 'bold 42px sans-serif';
  const afterHook = wrap(ctx, hook, 40, 176, 560, 58);

  // 同频占比 + 风格词
  ctx.fillStyle = '#e63a77'; ctx.font = '500 46px sans-serif';
  ctx.fillText(`约 ${r.resonance}% 的人与你同频`, 40, afterHook + 76);
  ctx.fillStyle = '#948b93'; ctx.font = '21px sans-serif';
  ctx.fillText(COPY.result.scoreNote, 40, afterHook + 116);
  ctx.fillStyle = '#221c23'; ctx.font = '500 30px sans-serif';
  r.styles.forEach((s, i) => ctx.fillText('· ' + s, 40, afterHook + 176 + i * 48));

  // 动物图：居中圆形玫粉底 + 本地 SVG，说明文字放图片下方用满宽度
  // cy 在风格词之后，避免圆形遮住第三个风格词（最多 3 个，行高 48）
  const cx = 320, cy = afterHook + 360;
  ctx.fillStyle = '#ffd9e6';
  ctx.beginPath(); ctx.arc(cx, cy, 108, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#221c23'; ctx.font = '500 26px sans-serif';
  if (r.animal) {
    const label = r.animal.name + '：' + r.animal.line;
    wrap(ctx, label, 40, cy + 158, 560, 36);
  }
  ctx.fillStyle = '#948b93'; ctx.font = '19px sans-serif';
  ctx.fillText(COPY.result.animalNote, 40, cy + 236);

  // 关系在意点前两条 + 文化短句，压缩行距给底部免责留空间
  ctx.fillStyle = '#221c23'; ctx.font = '26px sans-serif';
  ctx.fillText(r.care[0] || '', 40, cy + 278);
  ctx.fillText(r.care[1] || '', 40, cy + 316);
  if (r.culture?.shareLine) {
    ctx.fillStyle = '#e63a77'; ctx.font = '500 27px sans-serif';
    ctx.fillText(r.culture.shareLine, 40, cy + 364);
  }

  // 底部固定免责
  ctx.fillStyle = '#948b93'; ctx.font = '18px sans-serif';
  const disclaimerTop = Math.min(cy + 410, 1010);
  COPY.disclaimer.split('\n').forEach((line, i) => ctx.fillText(line, 40, disclaimerTop + i * 26));
  return { canvas, animal: r.animal, cx, cy };
}

export function renderShare(r, toast) {
  const hook = shareHook(r);
  const { canvas, animal, cx, cy } = drawCard(r, hook);
  canvas.className = 'share-canvas';
  const old = document.querySelector('.share-canvas');
  if (old) old.remove();
  document.querySelector('#app .card').appendChild(canvas);

  if (animal) {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      const size = 176;
      ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
    };
    img.onerror = () => { /* 图片失败保留文字降级 */ };
    img.src = ASSET_BASE + animal.file;
  }
  toast(COPY.result.shareSaved);
  return hook;
}
