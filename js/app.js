import { EXERCISES, WORKOUTS, STRETCHES, STRETCH_SECONDS, WEEK, TARGETS, WARMUP, stepTarget, phaseFor } from './plan.js';
import { FEDB } from './fedb.js';
import { ART } from './art.js';

/* ---------- utilities ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mondayOf = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const wd = (x.getDay() + 6) % 7; return addDays(x, -wd); };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (s) => { const d = parseYmd(s); return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const fmtShort = (s) => { const d = parseYmd(s); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const mmss = (sec) => { sec = Math.max(0, Math.round(sec)); return `${Math.floor(sec / 60)}:${pad(sec % 60)}`; };
const num = (v) => { if (v === '' || v == null) return null; const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : null; };
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const ICON = {
  check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  swap: '<svg viewBox="0 0 24 24"><path d="M4 8h14l-4-4M20 16H6l4 4"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
};

/* ---------- storage ---------- */
const KEY = 'comeback-training.v1';
const defaults = () => ({
  settings: { startDate: ymd(mondayOf(new Date())), restCompound: TARGETS.restCompound, restIso: TARGETS.restIso, sound: true, vibrate: true, unit: 'kg' },
  sessions: [], active: null, body: [], daily: {},
});
let S;
function load() {
  try { S = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); S.settings = Object.assign(defaults().settings, S.settings); }
  catch { S = defaults(); }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Could not save: storage is full or blocked'); }
}
load();
if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});

/* ---------- program math ---------- */
function weekNum(dateStr = ymd()) {
  const diff = Math.floor((parseYmd(dateStr) - mondayOf(parseYmd(S.settings.startDate))) / 864e5);
  return Math.max(1, Math.floor(diff / 7) + 1);
}
const doneSets = (slot) => slot.sets.filter((s) => s.done);
const isLift = (w) => ['A', 'B', 'C'].includes(w);
function lastPerformance(exId, beforeId) {
  for (let i = S.sessions.length - 1; i >= 0; i--) {
    const s = S.sessions[i];
    if (s.id === beforeId) continue;
    const slot = s.slots.find((x) => x.ex === exId && doneSets(x).length);
    if (slot) return { date: s.date, sets: doneSets(slot) };
  }
  return null;
}
function lastChoice(workoutId, slotIdx) {
  for (let i = S.sessions.length - 1; i >= 0; i--) {
    const s = S.sessions[i];
    if (s.workout === workoutId && s.slots[slotIdx]) return s.slots[slotIdx].ex;
  }
  return null;
}
function sessionVolume(s) {
  let v = 0;
  for (const sl of s.slots) { const ex = EXERCISES[sl.ex]; if (ex?.type !== 'reps') continue; for (const st of doneSets(sl)) v += (st.w || 0) * (st.r || 0) * (ex.perSide ? 2 : 1); }
  return Math.round(v);
}
const e1rm = (w, r) => (w && r ? w * (1 + r / 30) : 0);
function weekStats() {
  const map = {};
  for (const s of S.sessions) { const k = ymd(mondayOf(parseYmd(s.date))); (map[k] ||= { lift: 0, all: 0 }); map[k].all++; if (isLift(s.workout)) map[k].lift++; }
  return map;
}
function streaks() {
  const map = weekStats();
  const thisMon = mondayOf(new Date());
  let cur = 0; let d = thisMon;
  if ((map[ymd(d)]?.lift || 0) < 3) d = addDays(d, -7);
  while ((map[ymd(d)]?.lift || 0) >= 3) { cur++; d = addDays(d, -7); }
  let best = 0, run = 0;
  const keys = Object.keys(map).sort();
  if (keys.length) {
    for (let w = parseYmd(keys[0]); w <= thisMon; w = addDays(w, 7)) { if ((map[ymd(w)]?.lift || 0) >= 3) { run++; best = Math.max(best, run); } else run = 0; }
  }
  // day streak of any activity (allowing planned rest days Fri/Sun)
  const days = new Set(S.sessions.map((s) => s.date));
  let dayStreak = 0; let x = new Date();
  if (!days.has(ymd(x))) x = addDays(x, -1);
  for (let guard = 0; guard < 400; guard++) {
    const k = ymd(x);
    if (days.has(k)) dayStreak++;
    else if (!WEEK[x.getDay()].w) { /* planned rest day doesn't break the streak */ }
    else break;
    x = addDays(x, -1);
  }
  return { cur, best, dayStreak };
}

/* ---------- media ---------- */
function picHTML(exId, { anim = true, badge = '', info = false } = {}) {
  const ex = EXERCISES[exId];
  let frames;
  if (ex.svg) frames = ART[ex.svg].map((s, i) => s.replace('class="art"', `class="art f${i}"`));
  else frames = [0, 1].map((i) => `<img class="f${i}" src="img/ex/${ex.img}_${i}.jpg" alt="${i ? '' : esc(ex.name)}" loading="lazy" decoding="async">`);
  return `<div class="pic ${anim ? 'anim' : ''}">${frames.join('')}${badge ? `<span class="badge">${badge}</span>` : ''}${info ? `<span class="info"><button class="iconbtn" data-act="detail" data-ex="${exId}" aria-label="How to do it">${ICON.info}</button></span>` : ''}</div>`;
}
function thumbHTML(exId) {
  const ex = EXERCISES[exId];
  if (ex.svg) return `<div class="thumb">${ART[ex.svg][0]}</div>`;
  return `<div class="thumb"><img src="img/ex/${ex.img}_1.jpg" alt="" loading="lazy"></div>`;
}

/* ---------- sound / vibration / wake lock ---------- */
let actx;
function unlockAudio() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} } if (actx?.state === 'suspended') actx.resume(); }
document.addEventListener('pointerdown', unlockAudio, { passive: true });
function beep(times = 3) {
  if (S.settings.vibrate && navigator.vibrate) navigator.vibrate([250, 120, 250, 120, 400]);
  if (!S.settings.sound || !actx) return;
  for (let i = 0; i < times; i++) {
    const o = actx.createOscillator(), g = actx.createGain(); const t = actx.currentTime + i * 0.28;
    o.frequency.value = i === times - 1 ? 1175 : 880; o.type = 'sine';
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.25);
  }
}
let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && !wakeLock && 'wakeLock' in navigator && document.visibilityState === 'visible') { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
    if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch {}
}
document.addEventListener('visibilitychange', () => { if (S.active) keepAwake(true); tickTimer(); });

/* ---------- timer (rest + hold) ---------- */
let T = null; // {kind, end, total, label, onDone}
let timerInt = null;
function startTimer(kind, seconds, label, onDone) {
  T = { kind, end: Date.now() + seconds * 1000, total: seconds, label, onDone, fired: false };
  if (!timerInt) timerInt = setInterval(tickTimer, 250);
  tickTimer();
}
function stopTimer() { T = null; clearInterval(timerInt); timerInt = null; $('#timerbar').hidden = true; }
function tickTimer() {
  const bar = $('#timerbar');
  if (!T) { bar.hidden = true; return; }
  const left = (T.end - Date.now()) / 1000;
  if (left <= 0 && !T.fired) {
    T.fired = true; beep(T.kind === 'hold' ? 2 : 3);
    const cb = T.onDone; if (cb) { T = null; clearInterval(timerInt); timerInt = null; bar.hidden = true; cb(); return; }
  }
  bar.hidden = false;
  bar.className = T.kind === 'hold' ? 'hold' : left <= 0 ? 'over' : '';
  const shown = left > 0 ? mmss(Math.ceil(left)) : '+' + mmss(-left);
  const pct = Math.max(0, Math.min(100, (1 - left / T.total) * 100));
  const btns = T.kind === 'hold'
    ? `<button class="btn sm" data-act="timer-stop">Stop &amp; save</button>`
    : `<button class="btn sm ghost" data-act="timer-add">+15s</button><button class="btn sm primary" data-act="timer-skip">${left > 0 ? 'Skip' : 'Go!'}</button>`;
  bar.innerHTML = `<div><div class="t">${shown}</div></div><div class="grow"><div class="lbl">${T.kind === 'hold' ? 'Hold' : left > 0 ? 'Rest' : 'Rest over — next set'}</div><div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(T.label)}</div></div>${btns}<span class="bar" style="width:${pct}%"></span>`;
}

/* ---------- toast / modal ---------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2600); }
function openModal(html) { const m = $('#modal'); m.innerHTML = `<div class="sheet"><div class="grab"></div>${html}</div>`; m.hidden = false; }
function closeModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; }
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });

/* ---------- routing ---------- */
let tab = 'today';
let progSeg = 'overview';
let progEx = null;
function go(t) { tab = t; render(); window.scrollTo(0, 0); }
function render() {
  document.body.classList.toggle('in-workout', !!S.active && tab === 'workout');
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  const v = { today: viewToday, workout: viewWorkout, plan: viewPlan, progress: viewProgress, body: viewBody, settings: viewSettings }[tab] || viewToday;
  const { top, html } = v();
  $('#topbar').innerHTML = top;
  $('#view').innerHTML = html;
  tickTimer();
}

/* ---------- TODAY ---------- */
function viewToday() {
  const now = new Date(); const today = ymd(now);
  const wk = weekNum(); const ph = phaseFor(wk);
  const plan = WEEK[now.getDay()];
  const doneToday = S.sessions.filter((s) => s.date === today);
  const st = streaks();
  const mon = mondayOf(now);
  const strip = [...Array(7)].map((_, i) => {
    const d = addDays(mon, i); const k = ymd(d); const p = WEEK[d.getDay()];
    const did = S.sessions.some((s) => s.date === k);
    return `<div class="${k === today ? 'today' : ''} ${did ? 'done' : ''}">${DAYS[d.getDay()][0]}<b>${p.w ? (p.w === 'W' ? '🚶' : p.w) : '–'}</b></div>`;
  }).join('');
  const liftsThisWeek = S.sessions.filter((s) => isLift(s.workout) && mondayOf(parseYmd(s.date)).getTime() === mon.getTime()).length;
  const daily = S.daily[today] || {};
  const [stLo, stHi] = stepTarget(wk);

  let hero;
  if (S.active) {
    const w = WORKOUTS[S.active.workout];
    hero = `<div class="card hero stack"><span class="pill green">In progress</span><h2>${esc(w.name)}</h2><p class="muted" style="margin:0">Started ${new Date(S.active.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p><button class="btn primary block" data-act="resume">Resume workout</button></div>`;
  } else if (plan.w) {
    const w = WORKOUTS[plan.w];
    const did = doneToday.find((s) => s.workout === plan.w);
    hero = `<div class="card hero stack">
      <div class="row between"><span class="pill ${did ? 'green' : 'blue'}">${did ? 'Done today ✓' : "Today's plan"}</span><span class="muted" style="font-size:13px">${esc(w.duration)}</span></div>
      <h2>${esc(w.name)}</h2><div class="muted">${esc(w.subtitle)} · ${esc(w.where)}</div>
      <button class="btn ${did ? '' : 'primary'} block" data-act="start" data-w="${plan.w}">${did ? 'Do it again' : 'Start workout'}</button></div>`;
  } else {
    hero = `<div class="card hero stack"><span class="pill">Rest day</span><h2>${esc(plan.label)}</h2><p class="muted" style="margin:0">${esc(plan.note || '')}</p></div>`;
  }

  return {
    top: `<div class="grow"><h1>${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}</h1><div class="sub">Week ${wk} · Phase ${ph.n}: ${esc(ph.name)}</div></div>`,
    html: `${hero}
    <div class="card"><div class="week">${strip}</div>
      <div class="grid2" style="margin-top:12px">
        <div class="stat"><b>${liftsThisWeek}/3</b><span>Gym sessions this week</span></div>
        <div class="stat"><b>${st.cur} 🔥</b><span>Week streak (3+ sessions)</span></div>
      </div></div>
    <div class="card stack"><h3>Phase ${ph.n} tip</h3><div class="muted">${esc(ph.tip)}</div></div>
    <div class="card"><h3>Today's targets</h3>
      <div class="grid2" style="margin-top:10px">
        <label class="field"><span>Steps (goal ${stLo / 1000}–${stHi / 1000}k)</span><input type="number" inputmode="numeric" placeholder="0" value="${daily.steps ?? ''}" data-daily="steps"></label>
        <label class="field"><span>Protein g (goal ${TARGETS.protein.join('–')})</span><input type="number" inputmode="numeric" placeholder="0" value="${daily.protein ?? ''}" data-daily="protein"></label>
      </div>
      <div class="row" style="gap:6px"><button class="btn sm" data-act="protein" data-v="25">+25 g</button><button class="btn sm" data-act="protein" data-v="40">+40 g</button><button class="btn sm" data-act="protein" data-v="50">+50 g</button><span class="muted" style="font-size:12px;margin-left:auto">${TARGETS.kcal.join('–')} kcal</span></div>
      <div class="progress" style="margin-top:12px"><i style="width:${Math.min(100, ((daily.protein || 0) / TARGETS.protein[0]) * 100)}%"></i></div>
    </div>
    <div class="card"><h3>Start another session</h3><div class="choose" style="margin-top:10px">
      ${['A', 'B', 'C', 'W'].map((k) => `<button data-act="start" data-w="${k}"><b>${esc(WORKOUTS[k].name)}</b><small class="muted">${esc(WORKOUTS[k].subtitle)}</small></button>`).join('')}
      </div><button class="btn ghost block" style="margin-top:8px" data-act="start" data-w="S">Stretching only (10–15 min)</button></div>`,
  };
}

/* ---------- WORKOUT ---------- */
function newSession(wid) {
  const now = new Date();
  if (wid === 'S') {
    return { id: uid(), date: ymd(now), workout: 'S', startedAt: Date.now(), warmup: [], stretches: [], slots: [], notes: '' };
  }
  const w = WORKOUTS[wid];
  const slots = w.slots.map((sl, i) => {
    const prev = lastChoice(wid, i);
    const exId = prev && sl.ex.includes(prev) ? prev : sl.ex[0];
    return { ex: exId, sets: makeSets(exId, sl) };
  });
  return { id: uid(), date: ymd(now), workout: wid, startedAt: Date.now(), warmup: [], stretches: [], slots, notes: '' };
}
function makeSets(exId, tpl) {
  const last = lastPerformance(exId);
  return [...Array(tpl.sets)].map((_, i) => {
    const l = last?.sets[i] || last?.sets[last.sets.length - 1];
    return { w: l?.w ?? null, r: null, done: false };
  });
}
function tplFor(sess, i) { return WORKOUTS[sess.workout]?.slots[i]; }
function hintFor(exId, tpl) {
  const ex = EXERCISES[exId]; const last = lastPerformance(exId);
  const wk = weekNum();
  if (!last) return ex.type === 'reps' ? 'First time: pick a weight you could lift 2–3 more reps with.' : '';
  if (ex.type === 'cardio' || ex.type === 'stretch') return '';
  const allTop = last.sets.length >= tpl.sets && last.sets.every((s) => (s.r || 0) >= tpl.max);
  if (!allTop) return wk <= 4 ? '' : `Aim for ${tpl.max} ${ex.type === 'time' ? 's' : 'reps'} on every set, then increase.`;
  if (wk <= 4) return 'Top of range hit — keep the weight, focus on clean form (Phase 1).';
  if (ex.type === 'reps') return 'You hit the top of the range last time → add 2.5 kg today 💪';
  if (ex.type === 'time') return 'Top of range hit → add 5–10 s per set.';
  return 'Top of range hit → add 1–2 reps per set.';
}
function lastLine(exId) {
  const last = lastPerformance(exId, S.active?.id); if (!last) return '';
  const ex = EXERCISES[exId];
  const parts = last.sets.map((s) => ex.type === 'reps' ? `${s.w ?? 0}×${s.r}` : ex.type === 'time' ? `${s.r}s` : ex.type === 'cardio' ? `${s.r} min` : `${s.r}`);
  return `Last (${fmtShort(last.date)}): ${parts.join(', ')}`;
}
function restFor(exId) { const ex = EXERCISES[exId]; return ex.compound ? S.settings.restCompound : S.settings.restIso; }

function exCardHTML(sess, i) {
  const slot = sess.slots[i]; const tpl = tplFor(sess, i); const ex = EXERCISES[slot.ex];
  const done = doneSets(slot).length; const complete = done >= slot.sets.length && slot.sets.length > 0;
  const unit = ex.type === 'time' ? ' s' : ex.type === 'cardio' ? ' min' : '';
  const target = `${tpl.sets > 1 ? tpl.sets + ' × ' : ''}${tpl.min}–${tpl.max}${unit}${ex.perSide ? ' / side' : ''}`;
  const kind = ex.type === 'reps' ? '' : ex.type === 'time' ? 'timed' : 'single';
  const hdr = ex.type === 'reps' ? '<div>#</div><div>kg</div><div>Reps</div><div></div>'
    : ex.type === 'time' ? '<div>#</div><div>Seconds</div><div></div><div></div>'
      : ex.type === 'cardio' ? '<div>#</div><div>Minutes</div><div></div>' : '<div>#</div><div>Reps</div><div></div>';
  const ph = (si) => { const l = lastPerformance(slot.ex, sess.id); const ls = l?.sets[si] || l?.sets.at(-1); return ex.type === 'cardio' ? (ls?.r ?? tpl.min) : (ls?.r ? Math.min(Math.max(ls.r, tpl.min), tpl.max) : tpl.min); };
  const rows = slot.sets.map((s, si) => {
    const repIn = `<input type="number" inputmode="decimal" data-set="r" data-i="${i}" data-s="${si}" value="${s.r ?? ''}" placeholder="${ph(si)}">`;
    if (ex.type === 'reps') return `<div class="set ${s.done ? 'done' : ''}"><div class="n">${si + 1}</div><input type="number" inputmode="decimal" step="0.5" data-set="w" data-i="${i}" data-s="${si}" value="${s.w ?? ''}" placeholder="0">${repIn}<button class="chk" data-act="set-done" data-i="${i}" data-s="${si}" aria-label="Done">${ICON.check}</button></div>`;
    if (ex.type === 'time') return `<div class="set ${s.done ? 'done' : ''}"><div class="n">${si + 1}</div>${repIn}<button class="play" data-act="hold" data-i="${i}" data-s="${si}" aria-label="Start hold timer">${ICON.play}</button><button class="chk" data-act="set-done" data-i="${i}" data-s="${si}" aria-label="Done">${ICON.check}</button></div>`;
    return `<div class="set ${s.done ? 'done' : ''}"><div class="n">${si + 1}</div>${repIn}<button class="chk" data-act="set-done" data-i="${i}" data-s="${si}" aria-label="Done">${ICON.check}</button></div>`;
  }).join('');
  const alts = tpl.ex.length > 1 ? `<button class="btn sm ghost" data-act="swap" data-i="${i}">${ICON.swap.replace('<svg', '<svg style="width:16px;height:16px;vertical-align:-3px;fill:none;stroke:currentColor;stroke-width:2"')} ${esc(EXERCISES[tpl.ex[(tpl.ex.indexOf(slot.ex) + 1) % tpl.ex.length]].name)}</button>` : '';
  const hint = hintFor(slot.ex, tpl);
  return `<section class="card ex ${complete ? 'complete' : ''}" id="ex-${i}">
    ${picHTML(slot.ex, { badge: `${i + 1}/${sess.slots.length}${complete ? ' ✓' : ''}`, info: true })}
    <div class="body">
      <div class="row between" style="align-items:flex-start"><div class="grow"><h2>${esc(ex.name)}</h2><div class="muted" style="font-size:14px">${esc(tpl.purpose)}</div></div><span class="pill ${complete ? 'green' : ''}">${done}/${slot.sets.length}</span></div>
      <div class="row wrap" style="margin-top:8px;gap:6px"><span class="pill blue">${target}</span>${ex.type !== 'cardio' ? `<span class="pill">Rest ${restFor(slot.ex)}s</span>` : ''}</div>
      ${lastLine(slot.ex) ? `<div class="last">${esc(lastLine(slot.ex))}</div>` : ''}
      ${hint ? `<div class="hint">${esc(hint)}</div>` : ''}
      <div class="sets ${kind}"><div class="hdr">${hdr}</div>${rows}</div>
      <div class="addset">${ex.type !== 'cardio' ? `<button class="btn sm ghost" data-act="add-set" data-i="${i}">${'+ Set'}</button>${slot.sets.length > 1 ? `<button class="btn sm ghost" data-act="rm-set" data-i="${i}">− Set</button>` : ''}` : ''}<span class="grow"></span>${alts}</div>
    </div></section>`;
}
function stretchListHTML(sess) {
  return `<div class="card"><div class="row between"><h2>Flexibility</h2><span class="pill">${sess.stretches.length}/${STRETCHES.length}</span></div>
    <div class="muted" style="font-size:14px;margin:4px 0 6px">Hold each stretch ${STRETCH_SECONDS - 5}–60 s, breathing out slowly. Per-side stretches: do both sides.</div>
    ${STRETCHES.map((id) => { const ex = EXERCISES[id]; const d = sess.stretches.includes(id); return `<div class="stretch ${d ? 'done' : ''}">
      <button data-act="detail" data-ex="${id}" style="padding:0;border:0;background:none">${thumbHTML(id)}</button>
      <div><div class="name" style="font-weight:600">${esc(ex.name)}</div><div class="muted" style="font-size:12px">${ex.perSide ? `${STRETCH_SECONDS}s each side` : `${STRETCH_SECONDS}s`}</div></div>
      <div class="row" style="gap:6px"><button class="iconbtn" style="background:#142a45;color:var(--blue)" data-act="stretch-go" data-ex="${id}" aria-label="Start timer">${ICON.play.replace('<svg', '<svg style="fill:currentColor;stroke:none"')}</button><button class="iconbtn" data-act="stretch-done" data-ex="${id}" style="${d ? 'background:var(--accent);color:var(--accent-ink)' : ''}" aria-label="Done">${ICON.check}</button></div></div>`; }).join('')}
  </div>`;
}
function viewWorkout() {
  const sess = S.active; if (!sess) { tab = 'today'; return viewToday(); }
  const w = WORKOUTS[sess.workout] || { name: 'Stretching', subtitle: 'Flexibility routine', stretch: true };
  const showWarm = isLift(sess.workout);
  const totalSets = sess.slots.reduce((a, s) => a + s.sets.length, 0); const doneN = sess.slots.reduce((a, s) => a + doneSets(s).length, 0);
  return {
    top: `<button class="iconbtn" data-act="back-today" aria-label="Back">${ICON.back}</button><div class="grow"><h2>${esc(w.name)}</h2><div class="sub"><span id="elapsed">${mmss((Date.now() - sess.startedAt) / 1000)}</span> · ${doneN}/${totalSets} sets</div></div><button class="btn primary sm" data-act="finish">Finish</button>`,
    html: `${showWarm ? `<div class="card"><div class="row between"><h2>Warm-up · 5 min</h2><span class="pill">${sess.warmup.length}/${WARMUP.length}</span></div><div class="checklist" style="margin-top:6px">
      ${WARMUP.map((t, i) => `<label><input type="checkbox" data-warm="${i}" ${sess.warmup.includes(i) ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}</div></div>` : ''}
      ${sess.workout === 'W' ? `<div class="card stack"><h3>Steps goal this week: ${stepTarget(weekNum()).map((x) => x / 1000 + 'k').join('–')}</h3><div class="muted" style="font-size:14px">Brisk pace; stop if pain is sharp rather than tired. Log your minutes below.</div></div>` : ''}
      ${sess.slots.map((_, i) => exCardHTML(sess, i)).join('')}
      ${w.stretch || sess.workout === 'S' || isLift(sess.workout) ? stretchListHTML(sess) : ''}
      <div class="card"><label class="field" style="margin:0"><span>Notes (how did it feel? any pain?)</span><textarea data-notes>${esc(sess.notes)}</textarea></label></div>
      <button class="btn primary block" data-act="finish">Finish workout</button>
      <button class="btn danger block" style="margin-top:10px" data-act="discard">Discard workout</button>`,
  };
}
setInterval(() => { const el = $('#elapsed'); if (el && S.active) el.textContent = mmss((Date.now() - S.active.startedAt) / 1000); }, 1000);

function completeSet(i, si, auto) {
  const sess = S.active; const slot = sess.slots[i]; const set = slot.sets[si]; const ex = EXERCISES[slot.ex]; const tpl = tplFor(sess, i);
  if (set.done && !auto) { set.done = false; save(); render(); return; }
  if (set.r == null) { const inp = document.querySelector(`input[data-set="r"][data-i="${i}"][data-s="${si}"]`); set.r = num(inp?.placeholder) ?? tpl.min; }
  if (ex.type === 'reps' && set.w == null) set.w = 0;
  set.done = true;
  // carry weight forward to next undone sets that are empty
  if (ex.type === 'reps') slot.sets.slice(si + 1).forEach((s) => { if (!s.done && s.w == null) s.w = set.w; });
  save();
  const allDone = doneSets(slot).length === slot.sets.length;
  const nextIdx = sess.slots.findIndex((s, k) => k > i && doneSets(s).length < s.sets.length);
  if (ex.type !== 'cardio') {
    const nxt = allDone ? (nextIdx >= 0 ? `Next: ${EXERCISES[sess.slots[nextIdx].ex].name}` : 'Last set done — stretch time!') : `${ex.name} — set ${si + 2}/${slot.sets.length}`;
    if (!(allDone && nextIdx < 0)) startTimer('rest', restFor(slot.ex), nxt);
  }
  render();
  if (allDone && nextIdx >= 0) setTimeout(() => document.getElementById('ex-' + nextIdx)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
}
function finishWorkout() {
  const sess = S.active;
  const anything = sess.slots.some((s) => doneSets(s).length) || sess.stretches.length;
  if (!anything && !confirm('No sets are ticked. Save this workout anyway?')) return;
  sess.finishedAt = Date.now();
  // keep only completed sets
  sess.slots = sess.slots.map((s) => ({ ex: s.ex, sets: s.sets.filter((x) => x.done).map(({ w, r }) => ({ w, r, done: true })) }));
  // PR detection
  const prs = [];
  for (const sl of sess.slots) {
    const ex = EXERCISES[sl.ex]; if (ex.type !== 'reps' || !sl.sets.length) continue;
    const best = Math.max(...sl.sets.map((s) => s.w || 0));
    const prev = Math.max(0, ...S.sessions.flatMap((s) => s.slots.filter((x) => x.ex === sl.ex).flatMap((x) => x.sets.map((y) => y.w || 0))));
    if (best > prev && prev > 0) prs.push(`${ex.name}: ${best} kg (was ${prev})`);
  }
  S.sessions.push(sess); S.sessions.sort((a, b) => a.startedAt - b.startedAt);
  S.active = null; save(); stopTimer(); keepAwake(false);
  const mins = Math.round((sess.finishedAt - sess.startedAt) / 60000);
  const sets = sess.slots.reduce((a, s) => a + s.sets.length, 0);
  const st = streaks();
  tab = 'today'; render();
  openModal(`<div class="in stack" style="text-align:center"><div style="font-size:48px">🎉</div><h1>Workout saved</h1>
    <div class="grid2" style="margin-top:12px;text-align:left"><div class="stat"><b>${mins} min</b><span>Duration</span></div><div class="stat"><b>${sets}</b><span>Sets</span></div>
    <div class="stat"><b>${sessionVolume(sess).toLocaleString()} kg</b><span>Volume lifted</span></div><div class="stat"><b>${st.dayStreak}</b><span>Day streak</span></div></div>
    ${prs.length ? `<div class="card" style="text-align:left"><h3>New personal bests 🏆</h3>${prs.map((p) => `<div class="muted">${esc(p)}</div>`).join('')}</div>` : ''}
    ${isLift(sess.workout) ? '<div class="muted">Have a high-protein meal (45–55 g) within the next hour or two.</div>' : ''}
    <button class="btn primary block" data-act="close-modal">Nice</button></div>`);
}

/* ---------- exercise detail ---------- */
function detailHTML(id) {
  const ex = EXERCISES[id]; const db = ex.img ? FEDB[ex.img] : null;
  const usedIn = Object.values(WORKOUTS).filter((w) => w.slots.some((s) => s.ex.includes(id))).map((w) => w.name);
  const hist = S.sessions.filter((s) => s.slots.some((x) => x.ex === id && x.sets.length)).slice(-6).reverse();
  return `<div class="detail">${picHTML(id)}<div class="in stack">
    <div class="row between"><h2>${esc(ex.name)}</h2><button class="iconbtn" data-act="close-modal" aria-label="Close">${ICON.close}</button></div>
    ${db ? `<div class="row wrap" style="gap:6px">${db.primary.map((m) => `<span class="pill green">${esc(m)}</span>`).join('')}${db.secondary.map((m) => `<span class="pill">${esc(m)}</span>`).join('')}</div>` : ''}
    ${usedIn.length ? `<div class="muted" style="font-size:13px">Used in: ${usedIn.map(esc).join(', ')}</div>` : ''}
    <h3>Key cues</h3><ul style="margin:0;padding-left:20px">${ex.cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    ${db ? `<details><summary style="font-weight:600;padding:6px 0">Full step-by-step</summary><ol>${db.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></details>` : ''}
    ${hist.length ? `<h3>Recent</h3>${hist.map((s) => { const sl = s.slots.find((x) => x.ex === id); return `<div class="row between" style="font-size:14px"><span class="muted">${fmtDate(s.date)}</span><span>${sl.sets.map((x) => ex.type === 'reps' ? `${x.w}×${x.r}` : x.r).join(' · ')}</span></div>`; }).join('')}` : ''}
  </div></div>`;
}

/* ---------- PLAN ---------- */
function viewPlan() {
  const wk = weekNum(); const ph = phaseFor(wk); const [lo, hi] = stepTarget(wk);
  const order = [1, 2, 3, 4, 5, 6, 0];
  return {
    top: `<div class="grow"><h1>Your plan</h1><div class="sub">Comeback Fitness &amp; Recomposition</div></div>`,
    html: `<div class="card stack"><div class="row between"><h3>Week ${wk}${wk <= 12 ? " of 12" : ""}</h3><span class="pill green">Phase ${ph.n}</span></div><div class="progress"><i style="width:${Math.min(100, (wk / 12) * 100)}%"></i></div>
      <div><b>${esc(ph.name)}.</b> <span class="muted">${esc(ph.tip)}</span></div></div>
    <div class="card"><h3>Weekly schedule</h3><table class="plan" style="margin-top:6px">${order.map((d) => `<tr><td>${DAYS[d]}</td><td>${esc(WEEK[d].label)}</td></tr>`).join('')}</table>
      <div class="muted" style="font-size:13px;margin-top:8px">Best gym window: 11:00–12:15 before lunch (backup 16:30–17:30). Don't train fasted; coffee before 14:00.</div></div>
    ${['A', 'B', 'C', 'W'].map((k) => { const w = WORKOUTS[k]; return `<div class="card"><div class="row between"><div><h3>${esc(w.name)}</h3><div class="muted" style="font-size:13px">${esc(w.subtitle)} · ${esc(w.duration)}</div></div><button class="btn sm primary" data-act="start" data-w="${k}">Start</button></div>
      <div class="list" style="margin-top:6px">${w.slots.map((s) => { const ex = EXERCISES[s.ex[0]]; const u = ex.type === 'time' ? ' s' : ex.type === 'cardio' ? ' min' : ''; return `<div class="item" data-act="detail" data-ex="${s.ex[0]}">${thumbHTML(s.ex[0]).replace('class="thumb"', 'class="thumb" style="position:relative;width:56px;height:42px;border-radius:8px;overflow:hidden;flex:none;background:#eef1f5"')}<div class="grow"><div style="font-weight:600">${s.ex.map((e) => esc(EXERCISES[e].name)).join(' <span class="muted">or</span> ')}</div><div class="muted" style="font-size:13px">${s.sets > 1 ? s.sets + ' × ' : ''}${s.min}–${s.max}${u} · ${esc(s.purpose)}</div></div></div>`; }).join('')}</div></div>`; }).join('')}
    <div class="card"><h3>Flexibility routine (10–15 min)</h3><div class="list" style="margin-top:6px">${STRETCHES.map((id) => `<div class="item" data-act="detail" data-ex="${id}">${thumbHTML(id).replace('class="thumb"', 'class="thumb" style="position:relative;width:56px;height:42px;border-radius:8px;overflow:hidden;flex:none;background:#eef1f5"')}<div class="grow" style="font-weight:600">${esc(EXERCISES[id].name)}</div></div>`).join('')}</div></div>
    <div class="card stack"><h3>Targets</h3>
      <div class="row between"><span class="muted">Calories</span><b>${TARGETS.kcal.join('–')} kcal/day</b></div>
      <div class="row between"><span class="muted">Protein</span><b>${TARGETS.protein.join('–')} g/day</b></div>
      <div class="row between"><span class="muted">Steps this week</span><b>${lo.toLocaleString()}–${hi.toLocaleString()}</b></div>
      <div class="row between"><span class="muted">Waist (navel)</span><b>−0.5–1 cm every 1–2 wks</b></div>
      <div class="muted" style="font-size:13px">Ignore scale swings in the first 3 weeks. Measure your waist once a week.</div></div>`,
  };
}

/* ---------- charts ---------- */
function lineChart(pts, { unit = '', h = 160, band = null, decimals = 1 } = {}) {
  if (pts.length < 2) return `<div class="muted" style="font-size:14px;padding:16px 0">${pts.length ? 'One entry so far — log more to see a trend.' : 'No data yet.'}</div>`;
  const W = 340, H = h, L = 36, R = 10, Tp = 10, B = 22;
  const ys = pts.map((p) => p.y); let min = Math.min(...ys), max = Math.max(...ys);
  if (band) { min = Math.min(min, band[0]); max = Math.max(max, band[1]); }
  if (min === max) { min -= 1; max += 1; }
  const padY = (max - min) * 0.1; min -= padY; max += padY;
  const x = (i) => L + (i / (pts.length - 1)) * (W - L - R); const y = (v) => Tp + (1 - (v - min) / (max - min)) * (H - Tp - B);
  const f = (v) => (+v.toFixed(decimals)).toString();
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img">
    <line class="ax" x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}"/><line class="ax" x1="${L}" y1="${Tp}" x2="${W - R}" y2="${Tp}" stroke-dasharray="3 4"/>
    ${band ? `<rect class="band" x="${L}" y="${y(band[1])}" width="${W - L - R}" height="${Math.max(0, y(band[0]) - y(band[1]))}"/>` : ''}
    <text x="${L - 6}" y="${Tp + 4}" text-anchor="end">${f(max)}</text><text x="${L - 6}" y="${H - B}" text-anchor="end">${f(min)}</text>
    <polyline class="ln" points="${pts.map((p, i) => `${x(i)},${y(p.y)}`).join(' ')}"/>
    ${pts.map((p, i) => `<circle class="dot" cx="${x(i)}" cy="${y(p.y)}" r="3.5"/>`).join('')}
    <text x="${L}" y="${H - 5}">${esc(pts[0].label)}</text><text x="${W - R}" y="${H - 5}" text-anchor="end">${esc(pts.at(-1).label)}</text>
    <text x="${x(pts.length - 1)}" y="${y(pts.at(-1).y) - 8}" text-anchor="end" style="fill:var(--text);font-weight:700">${f(pts.at(-1).y)}${unit}</text>
  </svg></div>`;
}
function barChart(vals, labels, { h = 140, unit = '', goal = null } = {}) {
  const W = 340, H = h, L = 8, R = 8, Tp = 16, B = 22; const max = Math.max(1, ...vals, goal || 0);
  const bw = (W - L - R) / vals.length;
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}">
    ${goal ? `<line x1="${L}" x2="${W - R}" y1="${Tp + (1 - goal / max) * (H - Tp - B)}" y2="${Tp + (1 - goal / max) * (H - Tp - B)}" stroke="#fbbf24" stroke-dasharray="4 4"/>` : ''}
    ${vals.map((v, i) => { const bh = (v / max) * (H - Tp - B); return `<rect x="${L + i * bw + 3}" y="${H - B - bh}" width="${bw - 6}" height="${bh}" rx="4" fill="${goal && v >= goal ? '#4ade80' : '#2f8a4e'}"/>${v ? `<text x="${L + i * bw + bw / 2}" y="${H - B - bh - 4}" text-anchor="middle">${v}${unit}</text>` : ''}<text x="${L + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle">${esc(labels[i])}</text>`; }).join('')}
  </svg></div>`;
}

/* ---------- PROGRESS ---------- */
function viewProgress() {
  const segs = `<div class="segs">${[['overview', 'Overview'], ['exercises', 'Exercises'], ['history', 'History']].map(([k, l]) => `<button class="${progSeg === k ? 'on' : ''}" data-act="seg" data-seg="${k}">${l}</button>`).join('')}</div>`;
  let html = '';
  if (progSeg === 'overview') {
    const st = streaks(); const ws = weekStats();
    const lifts = S.sessions.filter((s) => isLift(s.workout)).length;
    const mon = mondayOf(new Date()); const weeks = 16;
    const daySet = {}; S.sessions.forEach((s) => { daySet[s.date] = Math.max(daySet[s.date] || 0, isLift(s.workout) ? 3 : 1); });
    let cells = '';
    for (let w = weeks - 1; w >= 0; w--) for (let d = 0; d < 7; d++) { const dt = addDays(mon, -w * 7 + d); const k = ymd(dt); const fut = dt > new Date(); cells += `<i class="${daySet[k] ? 'l' + daySet[k] : ''} ${fut ? 'fut' : ''}" title="${k}"></i>`; }
    const last8 = [...Array(8)].map((_, i) => addDays(mon, -(7 - i) * 7));
    html = `<div class="grid2" style="margin-top:12px">
      <div class="stat"><b>${lifts}</b><span>Gym workouts</span></div><div class="stat"><b>${S.sessions.length}</b><span>All sessions</span></div>
      <div class="stat"><b>${st.cur} 🔥</b><span>Week streak</span></div><div class="stat"><b>${st.best}</b><span>Best week streak</span></div></div>
      <div class="card"><div class="row between"><h3>Last 16 weeks</h3><span class="muted" style="font-size:12px">${st.dayStreak}-day streak</span></div><div class="heat" style="margin-top:10px">${cells}</div>
      <div class="muted" style="font-size:12px;margin-top:6px">Bright = gym day · dim = walk/stretch. Planned rest days don't break the day streak.</div></div>
      <div class="card"><h3>Gym sessions per week</h3>${barChart(last8.map((d) => ws[ymd(d)]?.lift || 0), last8.map((d) => fmtShort(ymd(d)).split(' ')[0]), { goal: 3 })}</div>
      <div class="card"><h3>Volume per gym session (kg)</h3>${lineChart(S.sessions.filter((s) => isLift(s.workout)).slice(-20).map((s) => ({ y: sessionVolume(s), label: fmtShort(s.date) })), { decimals: 0 })}</div>`;
  } else if (progSeg === 'exercises') {
    const used = Object.keys(EXERCISES).filter((id) => ['reps', 'time', 'bw', 'cardio'].includes(EXERCISES[id].type) && S.sessions.some((s) => s.slots.some((x) => x.ex === id && x.sets.length)));
    if (!progEx || !used.includes(progEx)) progEx = used[0];
    if (!used.length) html = '<div class="card muted">Finish a workout to see your progress per exercise.</div>';
    else {
      const ex = EXERCISES[progEx];
      const rows = S.sessions.filter((s) => s.slots.some((x) => x.ex === progEx && x.sets.length)).map((s) => ({ s, sl: s.slots.find((x) => x.ex === progEx) }));
      const pts = rows.map(({ s, sl }) => ({ label: fmtShort(s.date), y: ex.type === 'reps' ? Math.max(...sl.sets.map((x) => x.w || 0)) : Math.max(...sl.sets.map((x) => x.r || 0)) }));
      const e1 = rows.map(({ s, sl }) => ({ label: fmtShort(s.date), y: Math.max(...sl.sets.map((x) => e1rm(x.w, x.r))) }));
      html = `<label class="field" style="margin-top:12px"><span>Exercise</span><select data-progex>${used.map((id) => `<option value="${id}" ${id === progEx ? 'selected' : ''}>${esc(EXERCISES[id].name)}</option>`).join('')}</select></label>
        <div class="card"><h3>${ex.type === 'reps' ? 'Top weight (kg)' : ex.type === 'time' ? 'Longest hold (s)' : ex.type === 'cardio' ? 'Minutes' : 'Best reps'}</h3>${lineChart(pts, { unit: ex.type === 'reps' ? ' kg' : '' })}</div>
        ${ex.type === 'reps' ? `<div class="card"><h3>Estimated 1-rep max (kg)</h3>${lineChart(e1.filter((p) => p.y), { unit: ' kg' })}<div class="muted" style="font-size:12px">Estimated strength from weight × reps — rises as you get stronger even when reps change.</div></div>` : ''}
        <div class="card"><h3>Sessions</h3><div class="list">${rows.slice().reverse().map(({ s, sl }) => `<div class="item"><div class="grow"><div style="font-weight:600">${fmtDate(s.date)}</div><div class="muted" style="font-size:14px">${sl.sets.map((x) => ex.type === 'reps' ? `${x.w} kg × ${x.r}` : ex.type === 'time' ? `${x.r}s` : `${x.r}`).join(' · ')}</div></div></div>`).join('')}</div></div>`;
    }
  } else {
    const list = S.sessions.slice().reverse();
    html = list.length ? `<div class="card list">${list.map((s) => { const w = WORKOUTS[s.workout]; const sets = s.slots.reduce((a, x) => a + x.sets.length, 0); const mins = s.finishedAt ? Math.round((s.finishedAt - s.startedAt) / 60000) : 0; return `<div class="item" data-act="session" data-id="${s.id}"><div class="ico">${s.workout === 'W' ? '🚶' : s.workout === 'S' ? '🧘' : s.workout}</div><div class="grow"><div style="font-weight:600">${esc(w ? w.name : 'Stretching')}</div><div class="muted" style="font-size:13px">${fmtDate(s.date)} · ${mins} min · ${sets} sets${isLift(s.workout) ? ` · ${sessionVolume(s).toLocaleString()} kg` : ''}</div></div></div>`; }).join('')}</div>` : '<div class="card muted">No workouts yet. Your first one will show up here.</div>';
  }
  return { top: `<div class="grow"><h1>Progress</h1></div>`, html: segs + html };
}
function sessionHTML(id) {
  const s = S.sessions.find((x) => x.id === id); if (!s) return '';
  const w = WORKOUTS[s.workout];
  return `<div class="in stack"><div class="row between"><div><h2>${esc(w ? w.name : 'Stretching')}</h2><div class="muted">${fmtDate(s.date)}</div></div><button class="iconbtn" data-act="close-modal">${ICON.close}</button></div>
    ${s.slots.map((sl) => { const ex = EXERCISES[sl.ex]; return sl.sets.length ? `<div><b>${esc(ex.name)}</b><div class="muted">${sl.sets.map((x) => ex.type === 'reps' ? `${x.w} kg × ${x.r}` : ex.type === 'time' ? `${x.r}s` : ex.type === 'cardio' ? `${x.r} min` : x.r).join(' · ')}</div></div>` : ''; }).join('')}
    ${s.stretches?.length ? `<div><b>Stretches</b><div class="muted">${s.stretches.map((x) => esc(EXERCISES[x].name)).join(', ')}</div></div>` : ''}
    ${s.notes ? `<div><b>Notes</b><div class="muted">${esc(s.notes)}</div></div>` : ''}
    <label class="field"><span>Date</span><input type="date" value="${s.date}" data-sessdate="${s.id}"></label>
    <button class="btn danger block" data-act="del-session" data-id="${s.id}">Delete this workout</button></div>`;
}

/* ---------- BODY ---------- */
function viewBody() {
  const today = ymd(); const body = S.body.slice().sort((a, b) => a.date.localeCompare(b.date));
  const last = body.at(-1); const first = body[0];
  const waist = body.filter((b) => b.waist != null).map((b) => ({ y: b.waist, label: fmtShort(b.date) }));
  const weight = body.filter((b) => b.weight != null).map((b) => ({ y: b.weight, label: fmtShort(b.date) }));
  const wDelta = waist.length > 1 ? (waist.at(-1).y - waist[0].y) : null;
  const days14 = [...Array(14)].map((_, i) => ymd(addDays(new Date(), i - 13)));
  const [stLo] = stepTarget(weekNum());
  return {
    top: `<div class="grow"><h1>Body</h1><div class="sub">Measure waist at the navel, once a week</div></div>`,
    html: `<div class="card"><h3>Log measurement</h3>
      <div class="grid2"><label class="field"><span>Waist (cm)</span><input id="bWaist" type="number" step="0.1" inputmode="decimal" placeholder="${last?.waist ?? ''}"></label>
      <label class="field"><span>Weight (kg)</span><input id="bWeight" type="number" step="0.1" inputmode="decimal" placeholder="${last?.weight ?? ''}"></label></div>
      <label class="field"><span>Date</span><input id="bDate" type="date" value="${today}"></label>
      <button class="btn primary block" data-act="log-body">Save</button></div>
    <div class="grid2"><div class="stat"><b>${last?.waist ?? '–'}${last?.waist ? ' cm' : ''}</b><span>Waist ${wDelta != null ? `(${wDelta > 0 ? '+' : ''}${wDelta.toFixed(1)} cm total)` : ''}</span></div>
      <div class="stat"><b>${last?.weight ?? '–'}${last?.weight ? ' kg' : ''}</b><span>Weight ${first?.weight != null && last?.weight != null && first !== last ? `(${(last.weight - first.weight > 0 ? '+' : '')}${(last.weight - first.weight).toFixed(1)})` : ''}</span></div></div>
    <div class="card"><h3>Waist (cm)</h3>${lineChart(waist, { unit: ' cm' })}<div class="muted" style="font-size:12px">Goal: −0.5 to −1 cm every 1–2 weeks while gym weights go up.</div></div>
    <div class="card"><h3>Weight (kg)</h3>${lineChart(weight, { unit: ' kg' })}<div class="muted" style="font-size:12px">Ignore swings in the first 3 weeks — returning muscles hold water.</div></div>
    <div class="card"><h3>Steps — last 14 days</h3>${barChart(days14.map((d) => Math.round((S.daily[d]?.steps || 0) / 100) / 10), days14.map((d) => String(parseYmd(d).getDate())), { goal: stLo / 1000, unit: '' })}<div class="muted" style="font-size:12px">Thousands of steps. Dashed line = this week's goal.</div></div>
    <div class="card"><h3>Protein — last 14 days</h3>${barChart(days14.map((d) => S.daily[d]?.protein || 0), days14.map((d) => String(parseYmd(d).getDate())), { goal: TARGETS.protein[0] })}</div>
    ${body.length ? `<div class="card"><h3>Entries</h3><div class="list">${body.slice().reverse().map((b) => `<div class="item"><div class="grow"><b>${fmtDate(b.date)}</b><div class="muted" style="font-size:14px">${b.waist != null ? b.waist + ' cm' : ''}${b.waist != null && b.weight != null ? ' · ' : ''}${b.weight != null ? b.weight + ' kg' : ''}</div></div><button class="iconbtn" data-act="del-body" data-date="${b.date}" aria-label="Delete">${ICON.close}</button></div>`).join('')}</div></div>` : ''}`,
  };
}

/* ---------- SETTINGS ---------- */
function viewSettings() {
  const st = S.settings;
  return {
    top: `<div class="grow"><h1>Settings</h1></div>`,
    html: `<div class="card"><h3>Program</h3>
      <label class="field"><span>Program start date (week 1)</span><input type="date" value="${st.startDate}" data-setting="startDate"></label>
      <div class="grid2"><label class="field"><span>Rest — compound (s)</span><input type="number" inputmode="numeric" value="${st.restCompound}" data-setting="restCompound"></label>
      <label class="field"><span>Rest — isolation/core (s)</span><input type="number" inputmode="numeric" value="${st.restIso}" data-setting="restIso"></label></div>
      <div class="checklist"><label><input type="checkbox" data-setting="sound" ${st.sound ? 'checked' : ''}><span>Beep when timer ends</span></label>
      <label><input type="checkbox" data-setting="vibrate" ${st.vibrate ? 'checked' : ''}><span>Vibrate when timer ends</span></label></div></div>
    <div class="card stack"><h3>Backup</h3><div class="muted" style="font-size:14px">Your data is stored only on this phone. Export a backup now and then (e.g. save it to Google Drive).</div>
      <button class="btn block" data-act="export">Export backup</button>
      <label class="btn block ghost" style="text-align:center">Import backup<input type="file" accept="application/json,.json" data-import hidden></label>
      <button class="btn danger block" data-act="reset">Erase all data</button></div>
    <div class="card stack"><h3>Install on your phone</h3><div class="muted" style="font-size:14px">In Chrome, open the ⋮ menu → <b>Add to Home screen</b> → <b>Install</b>. The app then opens full-screen and works offline.</div></div>
    <div class="card muted" style="font-size:13px">Exercise photos and instructions: <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener">free-exercise-db</a> (public domain). Plan based on your Comeback Fitness &amp; Recomposition Plan. Not medical advice — stop if you feel sharp pain.</div>`,
  };
}

/* ---------- events ---------- */
document.addEventListener('click', (e) => {
  const tabBtn = e.target.closest('#tabs button'); if (tabBtn) { go(tabBtn.dataset.tab); return; }
  const a = e.target.closest('[data-act]'); if (!a) return;
  const act = a.dataset.act; const i = +a.dataset.i; const si = +a.dataset.s;
  switch (act) {
    case 'start': {
      const wid = a.dataset.w;
      if (S.active) { if (!confirm('A workout is already in progress. Discard it and start a new one?')) { go('workout'); return; } }
      S.active = newSession(wid); save(); keepAwake(true); closeModal(); go('workout'); break;
    }
    case 'resume': keepAwake(true); go('workout'); break;
    case 'back-today': go('today'); break;
    case 'set-done': completeSet(i, si); break;
    case 'add-set': { const sl = S.active.slots[i]; const l = sl.sets.at(-1); sl.sets.push({ w: l?.w ?? null, r: null, done: false }); save(); render(); break; }
    case 'rm-set': { const sl = S.active.slots[i]; if (sl.sets.length > 1) sl.sets.pop(); save(); render(); break; }
    case 'swap': { const sl = S.active.slots[i]; const tpl = tplFor(S.active, i); if (doneSets(sl).length && !confirm('Swap exercise? Sets logged for this one will be cleared.')) return; sl.ex = tpl.ex[(tpl.ex.indexOf(sl.ex) + 1) % tpl.ex.length]; sl.sets = makeSets(sl.ex, tpl); save(); render(); break; }
    case 'hold': {
      const sl = S.active.slots[i]; const inp = document.querySelector(`input[data-set="r"][data-i="${i}"][data-s="${si}"]`);
      const secs = num(inp.value) ?? num(inp.placeholder) ?? 30; const startedAt = Date.now();
      startTimer('hold', secs, `${EXERCISES[sl.ex].name} — set ${si + 1}`, () => { sl.sets[si].r = secs; completeSet(i, si, true); });
      T.holdStart = startedAt; T.holdCtx = { i, si }; break;
    }
    case 'timer-stop': {
      if (T?.holdCtx) { const { i: hi, si: hs } = T.holdCtx; const el = Math.round((Date.now() - T.holdStart) / 1000); stopTimer(); S.active.slots[hi].sets[hs].r = el; completeSet(hi, hs, true); } else stopTimer();
      break;
    }
    case 'timer-add': if (T) { T.end += 15000; T.total += 15; T.fired = false; tickTimer(); } break;
    case 'timer-skip': stopTimer(); break;
    case 'stretch-go': {
      const id = a.dataset.ex; const ex = EXERCISES[id];
      const run = (side) => startTimer('hold', STRETCH_SECONDS, `${ex.name}${side ? ' — ' + side : ''}`, () => {
        if (ex.perSide && side === 'left side') { toast('Switch sides'); setTimeout(() => run('right side'), 600); return; }
        if (!S.active.stretches.includes(id)) S.active.stretches.push(id); save(); render();
      });
      run(ex.perSide ? 'left side' : ''); break;
    }
    case 'stretch-done': { const id = a.dataset.ex; const l = S.active.stretches; const k = l.indexOf(id); k >= 0 ? l.splice(k, 1) : l.push(id); save(); render(); break; }
    case 'finish': finishWorkout(); break;
    case 'discard': if (confirm('Discard this workout? Nothing will be saved.')) { S.active = null; save(); stopTimer(); keepAwake(false); go('today'); } break;
    case 'detail': openModal(detailHTML(a.dataset.ex)); break;
    case 'close-modal': closeModal(); break;
    case 'seg': progSeg = a.dataset.seg; render(); break;
    case 'session': openModal(sessionHTML(a.dataset.id)); break;
    case 'del-session': if (confirm('Delete this workout from your history?')) { S.sessions = S.sessions.filter((s) => s.id !== a.dataset.id); save(); closeModal(); render(); } break;
    case 'protein': { const d = ymd(); S.daily[d] = S.daily[d] || {}; S.daily[d].protein = (S.daily[d].protein || 0) + +a.dataset.v; save(); render(); toast(`Protein today: ${S.daily[d].protein} g`); break; }
    case 'log-body': {
      const waist = num($('#bWaist').value), weight = num($('#bWeight').value), date = $('#bDate').value || ymd();
      if (waist == null && weight == null) { toast('Enter waist and/or weight'); return; }
      const ex = S.body.find((b) => b.date === date);
      if (ex) { if (waist != null) ex.waist = waist; if (weight != null) ex.weight = weight; } else S.body.push({ date, waist, weight });
      save(); render(); toast('Saved'); break;
    }
    case 'del-body': if (confirm('Delete this entry?')) { S.body = S.body.filter((b) => b.date !== a.dataset.date); save(); render(); } break;
    case 'export': {
      const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `training-backup-${ymd()}.json`; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); break;
    }
    case 'reset': if (confirm('Erase ALL workouts, measurements and settings on this phone?') && confirm('Really erase everything? Export a backup first if unsure.')) { S = defaults(); save(); stopTimer(); go('today'); } break;
  }
});
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.set && S.active) { const sl = S.active.slots[+t.dataset.i]; sl.sets[+t.dataset.s][t.dataset.set] = num(t.value); save(); }
  else if (t.dataset.notes !== undefined && S.active) { S.active.notes = t.value; save(); }
  else if (t.dataset.daily) { const d = ymd(); S.daily[d] = S.daily[d] || {}; S.daily[d][t.dataset.daily] = num(t.value); save(); }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset.warm !== undefined && S.active) { const k = +t.dataset.warm; const l = S.active.warmup; t.checked ? l.includes(k) || l.push(k) : l.splice(l.indexOf(k), 1); save(); render(); }
  else if (t.dataset.setting) { const k = t.dataset.setting; S.settings[k] = t.type === 'checkbox' ? t.checked : t.type === 'number' ? (num(t.value) ?? S.settings[k]) : t.value; save(); if (k === 'startDate') toast(`You're in week ${weekNum()}`); }
  else if (t.dataset.progex !== undefined) { progEx = t.value; render(); }
  else if (t.dataset.sessdate) { const s = S.sessions.find((x) => x.id === t.dataset.sessdate); if (s && t.value) { s.date = t.value; save(); render(); toast('Date updated'); } }
  else if (t.dataset.daily) render();
  else if (t.dataset.import !== undefined && t.files[0]) {
    t.files[0].text().then((txt) => { const d = JSON.parse(txt); if (!Array.isArray(d.sessions)) throw new Error(); if (confirm(`Replace current data with backup (${d.sessions.length} workouts)?`)) { S = Object.assign(defaults(), d); save(); go('today'); toast('Backup restored'); } }).catch(() => toast('That file is not a valid backup'));
  }
});
// Enter on a set input jumps to next input
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.matches('.set input')) { e.preventDefault(); const all = [...document.querySelectorAll('.set input')]; const n = all[all.indexOf(e.target) + 1]; n ? n.focus() : e.target.blur(); }
});

/* ---------- boot ---------- */
if (S.active) tab = 'workout';
render();
if (S.active) keepAwake(true);
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
