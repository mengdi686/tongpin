// 同频 · 阶段0 H5 主流程
import { COPY } from '../config/copy.js';
import { L1_QUESTIONS, L2_QUESTIONS } from '../config/questions.js';
import { computeResult } from './score.js';
import { computeCulture } from './bazi.js';

const ALL = [...L1_QUESTIONS, ...L2_QUESTIONS];
const $ = (s) => document.querySelector(s);
const state = { stage: 'gate', ageOk: false, consentOk: false, birth: {}, answers: {}, index: 0, result: null };

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

function progress(cur, total) {
  const pct = Math.round((cur / total) * 100);
  return `<div class="progress-wrap"><div class="progress-bar"><span style="width:${pct}%"></span></div><div class="progress-text">${COPY.progress(cur, total)}</div></div>`;
}

function renderGate() {
  state.stage = 'gate';
  $('#app').innerHTML = `
    <div class="brand"><span class="brand-mark"></span>${COPY.brand}<em>${COPY.slogan}</em></div>
    <div class="card">
      <h2>${COPY.ageGate.title}</h2>
      <button class="btn btn-primary" id="ageYes">${COPY.ageGate.yes}</button>
      <button class="btn btn-line" id="ageNo">${COPY.ageGate.no}</button>
    </div>`;
  $('#ageYes').onclick = () => { state.ageOk = true; renderConsent(); };
  $('#ageNo').onclick = () => toast(COPY.ageGate.reject);
}

function renderConsent() {
  state.stage = 'consent';
  $('#app').innerHTML = `
    <div class="brand"><span class="brand-mark"></span>${COPY.brand}</div>
    <div class="card">
      <h2>${COPY.consent.title}</h2>
      <ul class="consent-list">${COPY.consent.items.map((x) => `<li>${x}</li>`).join('')}</ul>
      <pre class="disclaimer">${COPY.disclaimer}</pre>
      <button class="btn btn-primary" id="consentYes">${COPY.consent.agree}</button>
    </div>`;
  $('#consentYes').onclick = () => { state.consentOk = true; renderBirth(); };
}

function renderBirth() {
  state.stage = 'birth';
  const hours = Array.from({ length: 24 }, (_, i) => `<option value="${String(i).padStart(2, '0')}:00">${String(i).padStart(2, '0')}:00</option>`).join('');
  $('#app').innerHTML = `
    <div class="brand"><span class="brand-mark"></span>${COPY.brand}</div>
    <div class="card">
      <h2>${COPY.birth.title}</h2>
      <p>${COPY.birth.desc}</p>
      <div class="field"><label>${COPY.birth.dateLabel}</label><input type="date" id="birthDate" max="${new Date().toISOString().slice(0, 10)}"></div>
      <div class="row">
        <div class="field"><label>${COPY.birth.timeLabel}</label><select id="birthTime"><option value="">${COPY.birth.timeSkip}</option>${hours}</select></div>
        <div class="field"><label>${COPY.birth.genderLabel}</label><select id="birthGender"><option value="f">${COPY.birth.female}</option><option value="m">${COPY.birth.male}</option></select></div>
      </div>
      <button class="btn btn-primary" id="birthNext">${COPY.birth.next}</button>
    </div>`;
  $('#birthNext').onclick = () => {
    const date = $('#birthDate').value;
    if (!date) return toast(COPY.errors.needDate);
    state.birth = { date, time: $('#birthTime').value, gender: $('#birthGender').value, timeSkipped: !$('#birthTime').value };
    state.index = 0;
    renderQuestion();
  };
}

function renderQuestion() {
  state.stage = 'question';
  const i = state.index;
  const q = ALL[i];
  const isL1 = i < L1_QUESTIONS.length;
  const scale = isL1 ? COPY.scale.l1 : COPY.scale.l2;
  const sectionTitle = isL1 ? COPY.section.l1 : COPY.section.l2;
  const sectionSub = isL1 ? COPY.section.l1sub : COPY.section.l2sub;
  const localIndex = isL1 ? i : i - L1_QUESTIONS.length;
  const total = isL1 ? L1_QUESTIONS.length : L2_QUESTIONS.length;
  const opts = scale.map((label, n) => `<button class="opt ${state.answers[q.id] === n + 1 ? 'selected' : ''}" data-v="${n + 1}">${n + 1}. ${label}</button>`).join('');

  $('#app').innerHTML = `
    <div class="brand"><span class="brand-mark"></span>${COPY.brand}</div>
    ${progress(i + 1, ALL.length)}
    <div class="card">
      <div class="q-head">${sectionTitle} · ${sectionSub} (${localIndex + 1}/${total})</div>
      <div class="q-text">${q.text}</div>
      <div class="options">${opts}</div>
      <div class="nav">
        ${i > 0 ? '<button class="btn btn-line" id="prev">上一题</button>' : ''}
        <button class="btn btn-primary" id="next">${i === ALL.length - 1 ? '看结果' : '下一题'}</button>
      </div>
    </div>`;

  document.querySelectorAll('.opt').forEach((b) => {
    b.onclick = () => {
      state.answers[q.id] = Number(b.dataset.v);
      document.querySelectorAll('.opt').forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
    };
  });
  if ($('#prev')) $('#prev').onclick = () => { state.index--; renderQuestion(); };
  $('#next').onclick = () => {
    if (!state.answers[q.id]) return toast(COPY.errors.needAll);
    if (i === ALL.length - 1) return renderResult();
    state.index++;
    renderQuestion();
  };
}

function renderResult() {
  state.stage = 'result';
  const r = computeResult(state.answers);
  const culture = computeCulture({ ...state.birth, Lunar: window.Lunar });
  state.result = { ...r, culture };
  const cultureHtml = culture.timeSkipped
    ? `<p class="notice">${culture.note}</p><p>${culture.text}</p>`
    : `<p>${culture.text}</p>`;

  $('#app').innerHTML = `
    <div class="brand"><span class="brand-mark"></span>${COPY.brand}</div>
    <div class="card">
      <h2>${COPY.result.title}</h2>
      <div class="score-ring"><b>${r.score}%</b><small>${COPY.result.scoreLabel}</small></div>
      <div class="score-note">${COPY.result.scoreNote}</div>
      <h2>${COPY.result.styleTitle}</h2>
      <div class="tags">${r.styles.map((s) => `<span class="tag">${s}</span>`).join('')}</div>
      <h2 style="margin-top:22px">${COPY.result.careTitle}</h2>
      ${r.care.map((c) => `<div class="list-item">${c}</div>`).join('')}
      <h2 style="margin-top:22px">${COPY.result.adviceTitle}</h2>
      <p>${r.advice}</p>
      <h2 style="margin-top:22px">${COPY.result.cultureTitle}</h2>
      ${cultureHtml}
      <pre class="disclaimer">${COPY.disclaimer}</pre>
      <button class="btn btn-primary" id="share">${COPY.result.share}</button>
      <div class="field" style="margin-top:18px"><input id="phone" placeholder="${COPY.result.reservePlaceholder}" inputmode="numeric" maxlength="11"></div>
      <button class="btn btn-line" id="reserve">${COPY.result.reserve}</button>
      <button class="btn btn-line" id="again">${COPY.result.again}</button>
    </div>`;

  $('#share').onclick = renderShare;
  $('#again').onclick = renderGate;
  $('#reserve').onclick = () => {
    const v = $('#phone').value.trim();
    if (!/^1\d{10}$/.test(v)) return toast(COPY.errors.badPhone);
    $('#reserve').disabled = true;
    $('#reserve').textContent = COPY.result.reserveDone;
    // 预约仅存本地演示；正式接入自有服务器需用户单独同意
    try { localStorage.setItem('tp_stage0_reserve', v); } catch { /* 隐私模式下忽略 */ }
  };
}

function renderShare() {
  const r = state.result;
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 900;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff5f8'; ctx.fillRect(0, 0, 640, 900);
  ctx.fillStyle = '#ff4d8d'; ctx.fillRect(0, 0, 640, 12);
  ctx.fillStyle = '#221c23'; ctx.font = '500 40px sans-serif';
  ctx.fillText(COPY.brand + ' · ' + COPY.slogan, 48, 100);
  ctx.font = '500 32px sans-serif';
  r.styles.forEach((s, i) => ctx.fillText('· ' + s, 48, 190 + i * 60));
  ctx.fillStyle = '#e63a77'; ctx.font = '500 80px sans-serif';
  ctx.fillText(r.score + '%', 48, 460);
  ctx.fillStyle = '#948b93'; ctx.font = '22px sans-serif';
  ctx.fillText(COPY.result.scoreNote, 48, 510);
  ctx.fillStyle = '#221c23'; ctx.font = '26px sans-serif';
  ctx.fillText(r.care[0] || '', 48, 610);
  ctx.fillStyle = '#948b93'; ctx.font = '20px sans-serif';
  const lines = COPY.disclaimer.split('\n');
  lines.forEach((line, i) => ctx.fillText(line, 48, 740 + i * 32));

  canvas.className = 'share-canvas';
  const old = $('.share-canvas');
  if (old) old.remove();
  $('#app .card').appendChild(canvas);
  toast('长按图片保存分享');
}

window.addEventListener('DOMContentLoaded', renderGate);
