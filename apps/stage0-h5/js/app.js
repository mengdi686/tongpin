// 同频 · 阶段0 H5 主流程
import { COPY } from '../config/copy.js';
import { L1_QUESTIONS, L2_QUESTIONS } from '../config/questions.js';
import { computeResult } from './score.js';
import { computeCulture } from './bazi.js';
import { pickAnimal } from '../config/animals.js';
import { track, trackProfile, trackResult, trackBirth, submitReserve, deleteAll } from './track.js';
import { renderShare, copyShare } from './share.js';

const ALL = [...L1_QUESTIONS, ...L2_QUESTIONS];
const $ = (s) => document.querySelector(s);
const state = { stage: 'gate', ageOk: false, consentOk: false, birth: {}, answers: {}, index: 0, result: null };
const ASSET_BASE = 'assets/animals/';

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
  track('visit');
  $('#ageYes').onclick = () => { state.ageOk = true; track('gate_pass'); renderConsent(); };
  $('#ageNo').onclick = () => { track('gate_reject'); toast(COPY.ageGate.reject); };
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
  $('#consentYes').onclick = () => { state.consentOk = true; track('consent_agree'); renderBirth(); };
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
      <label class="consent-check"><input type="checkbox" id="birthConsent"><span>${COPY.birth.separateConsent}</span></label>
      <button class="btn btn-primary" id="birthNext">${COPY.birth.next}</button>
    </div>`;
  $('#birthNext').onclick = () => {
    const date = $('#birthDate').value;
    if (!date) return toast(COPY.errors.needDate);
    const consented = !!$('#birthConsent').checked;
    state.birth = { date, time: $('#birthTime').value, gender: $('#birthGender').value, timeSkipped: !$('#birthTime').value, consented };
    // 只记录"是否跳过时辰"这一布尔值，绝不上传日期/时辰本身
    track('birth_submit', { step: state.birth.timeSkipped ? 'no_time' : 'with_time' });
    state.index = 0;
    renderQuestion();
  };
}

function renderQuestion() {
  state.stage = 'question';
  const i = state.index;
  const q = ALL[i];
  const isL1 = i < L1_QUESTIONS.length;
  // L1 与 L2 统一 5 点量表，缩短作答路径
  const scale = COPY.scale.all;
  const sectionTitle = isL1 ? COPY.section.l1 : COPY.section.l2;
  const sectionSub = isL1 ? COPY.section.l1sub : COPY.section.l2sub;
  const localIndex = isL1 ? i : i - L1_QUESTIONS.length;
  const total = isL1 ? L1_QUESTIONS.length : L2_QUESTIONS.length;
  const opts = scale.map((label, n) => `<button class="opt ${state.answers[q.id] === n + 1 ? 'selected' : ''}" data-v="${n + 1}"><span class="opt-dot">${n + 1}</span>${label}</button>`).join('');

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
      track('q_answer', { index: i + 1, total: ALL.length, qid: q.id, value: Number(b.dataset.v) });
      document.querySelectorAll('.opt').forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
    };
  });
  if ($('#prev')) $('#prev').onclick = () => { state.index--; track('q_back'); renderQuestion(); };
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
  const animal = pickAnimal(r.resonance);
  state.result = { ...r, culture, animal };
  track('result_view', { resonance: r.resonance, animal: animal.name });
  // 留存原始答案与结果快照，供后续补填生辰时按同一规则版本复现
  trackResult(state.answers, r.resonance, r.styles, r.careItems.map((c) => c.title), animal.name);
  trackProfile(r.resonance, r.styles, r.careItems.map((c) => c.title), animal.name);
  // 生辰单独同意后加密落库（文化用途，不进排序）；跳过时不上报
  if (!state.birth.timeSkipped && culture.available && state.birth.consented) {
    trackBirth(state.birth, culture);
  }
  const cultureHtml = culture.timeSkipped
    ? `<p class="notice">${culture.note}</p><p>${culture.text}</p>`
    : `<p>${culture.text}</p>`;
  const extendedHtml = culture.extended ? `<div class="culture-extended">${culture.extended}</div>` : '';
  const loreHtml = culture.lore
    ? `<div class="culture-lore"><span>五行小知识</span>${culture.lore}</div>`
    : '';

  $('#app').innerHTML = `
    <div class="brand"><span class="brand-mark"></span>${COPY.brand}</div>
    <div class="card">
      <h2>${COPY.result.title}</h2>
      <div class="score-hero">
        <div class="score-ring"><b>${r.resonance}%</b><small>${COPY.result.scoreLabel}</small></div>
        <div class="animal-box">
          <img class="animal-img" src="${ASSET_BASE}${animal.file}" alt="${animal.name}">
          <span class="animal-name">${animal.name}</span>
          <span class="animal-line">${animal.line}</span>
        </div>
      </div>
      <div class="score-note">${COPY.result.scoreNote}</div>
      <p class="footnote">${COPY.result.scoreFootnote}</p>
      <p class="footnote">${COPY.result.animalNote}</p>
      <h2 style="margin-top:22px">${COPY.result.styleTitle}</h2>
      <div class="tags">${r.styles.map((s) => `<span class="tag">${s}</span>`).join('')}</div>
      <h2 style="margin-top:22px">${COPY.result.careTitle}</h2>
      <p class="sub">${COPY.result.careSub}</p>
      ${r.careItems.map((c, i) => `<div class="list-item"><b>${i + 1}. ${c.title}</b><span>${c.text}</span></div>`).join('')}
      <h2 style="margin-top:22px">${COPY.result.adviceTitle}</h2>
      <p>${r.advice}</p>
      <h2 style="margin-top:22px">${COPY.result.cultureTitle}</h2>
      ${cultureHtml}
      ${extendedHtml}
      ${loreHtml}
      <pre class="disclaimer">${COPY.disclaimer}</pre>
      <div class="share-preview" id="shareHook"></div>
      <button class="btn btn-primary" id="share">${COPY.result.share}</button>
      <button class="btn btn-line" id="shareCopy">${COPY.result.shareCopy}</button>
      <div class="field" style="margin-top:18px"><input id="phone" placeholder="${COPY.result.reservePlaceholder}" inputmode="numeric" maxlength="11"></div>
      <button class="btn btn-line" id="reserve">${COPY.result.reserve}</button>
      <button class="btn btn-line" id="again">${COPY.result.again}</button>
      <div class="delete-entry" id="deleteData">${COPY.result.deleteData}</div>
    </div>`;

  $('#share').onclick = () => { track('share_click'); const hook = renderShare(state.result, toast); $('#shareHook').textContent = hook; };
  $('#shareCopy').onclick = async () => {
    const ok = await copyShare(state.result);
    toast(ok ? COPY.result.shareCopied : COPY.result.shareFailed);
  };
  $('#again').onclick = () => { track('again'); renderGate(); };
  $('#deleteData').onclick = () => {
    if (!window.confirm(COPY.result.deleteConfirm)) return;
    deleteAll((ok) => {
      if (!ok) return toast(COPY.result.deleteFail);
      toast(COPY.result.deleteDone);
      setTimeout(renderGate, 1200);
    });
  };
  $('#reserve').onclick = () => {
    const v = $('#phone').value.trim();
    if (!/^1\d{10}$/.test(v)) return toast(COPY.errors.badPhone);
    $('#reserve').disabled = true;
    $('#reserve').textContent = COPY.result.reserveDone;
    // 手机号经用户主动提交后入库，与匿名 ID 绑定，供后续注册匹配
    submitReserve(v, (ok) => {
      if (!ok) { $('#reserve').disabled = false; $('#reserve').textContent = COPY.result.reserve; toast('提交失败，请重试'); return; }
      track('reserve_submit');
      try { localStorage.setItem('tp_s0_reserved', '1'); } catch { /* 隐私模式忽略 */ }
    });
  };
}

// 进入页面时记录分享来源 ref（朋友点开链接带来的新访客）
function trackReferrer() {
  try {
    const ref = new URLSearchParams(location.search).get('ref');
    if (ref && /^[A-Za-z0-9_-]{1,16}$/.test(ref)) track('ref_in', { ref });
  } catch { /* 无 search 参数时忽略 */ }
}

window.addEventListener('DOMContentLoaded', () => { trackReferrer(); renderGate(); });
