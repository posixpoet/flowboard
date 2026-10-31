#!/usr/bin/env node
/* Nightly Joy × Responsibility evaluation for a board served by flowboard-server.js.

   Evaluates open tasks that have no scores yet, or whose content changed since they were scored, one at a
   time, inside a time window (default 00:00–06:00 Europe/Zurich). Run it from cron every hour; outside the
   window it exits without doing anything, and a lock keeps two runs from overlapping.

   The prompt, JSON schema, validation and change detection are not copied here: they are loaded from the
   board's own flowboard.html (the deployed page, or --html FILE), so scores written at night are exactly what
   the 🧭 view would have written and are not shown as "changed".

   Each result is written into a freshly loaded state and read back; if a browser saved in between, the write
   is retried. Only task.motivation and task.updatedAt change, nothing else on the board.

   Needs a machine that reaches both the board and Ollama. Node 18+, standard library only.

     FB_URL=http://localhost:8765 FB_KEY_FILE=/app/flowboard-key.txt OLLAMA=http://ovas01.xtremnet.de:7869 \
     JR_MODEL=qwen3.5:9b node tools/jr-nightly.mjs            # respects the window
     ... node tools/jr-nightly.mjs --dry-run                  # list what would be evaluated, send nothing
     ... node tools/jr-nightly.mjs --now                      # ignore the window once

   Environment: FB_URL, FB_KEY or FB_KEY_FILE (master key), OLLAMA, JR_MODEL,
                JR_TZ (Europe/Zurich), JR_FROM (00:00), JR_TO (06:00), JR_LOCK (tmpdir/flowboard-jr-nightly.lock)
*/
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';

const args = new Set(process.argv.slice(2));
const argVal = name => { const a = process.argv.slice(2); const i = a.indexOf(name); return i >= 0 ? a[i + 1] : undefined; };
const env = process.env;
const FB_URL = (env.FB_URL || 'http://localhost:8765').replace(/\/+$/, '');
const KEY = (env.FB_KEY || (env.FB_KEY_FILE ? fs.readFileSync(env.FB_KEY_FILE, 'utf8') : '')).trim();
const OLLAMA = (env.OLLAMA || '').replace(/\/+$/, '');
const MODEL = env.JR_MODEL || '';
const TZ = env.JR_TZ || 'Europe/Zurich';
const FROM = env.JR_FROM || '00:00', TO = env.JR_TO || '06:00';
const LOCK = env.JR_LOCK || path.join(os.tmpdir(), 'flowboard-jr-nightly.lock');
const DRY = args.has('--dry-run'), NOW = args.has('--now'), HTML = argVal('--html');
const log = (...a) => console.log(new Date().toISOString(), ...a);
const die = msg => { log('error:', msg); process.exit(2); };

/* ---- window ---- */
const minutesOf = hhmm => { const m = /^(\d\d?):(\d\d)$/.exec(hhmm); if (!m) die('bad time ' + hhmm); return +m[1] * 60 + +m[2]; };
function localMinutes(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d).map(x => [x.type, x.value]));
  return +p.hour * 60 + +p.minute;
}
const inWindow = (m = localMinutes()) => { const f = minutesOf(FROM), t = minutesOf(TO); return f <= t ? m >= f && m < t : m >= f || m < t; };
const msLeft = () => { const m = localMinutes(), t = minutesOf(TO); return ((t - m + 1440) % 1440 || 1440) * 60000 - new Date().getSeconds() * 1000; };

/* ---- board API ---- */
const hdr = json => Object.assign({ 'x-board-key': KEY }, json ? { 'Content-Type': 'application/json' } : {});
async function getState() {
  const r = await fetch(FB_URL + '/api/state', { headers: hdr(), cache: 'no-store' });
  if (!r.ok) throw new Error('GET /api/state → HTTP ' + r.status);
  const d = await r.json();
  if (!d || !Array.isArray(d.boards)) throw new Error('unexpected state');
  return d;
}
async function postState(s) {
  /* no "timer" key: the server keeps each person's timer as it is */
  const r = await fetch(FB_URL + '/api/state', { method: 'POST', headers: hdr(true), body: JSON.stringify({ updatedAt: s.updatedAt, boards: s.boards }) });
  if (!r.ok) throw new Error('POST /api/state → HTTP ' + r.status);
}

/* ---- the page's own Joy × Responsibility code, run in a sandbox ---- */
async function loadJr() {
  const html = HTML ? fs.readFileSync(HTML, 'utf8') : await fetch(FB_URL + '/', { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('GET / → HTTP ' + r.status); return r.text(); });
  const script = (html.match(/<script>([\s\S]*?)<\/script>/g) || []).pop() || '';
  const cut = (from, to) => { const a = script.indexOf(from), b = script.indexOf(to, a); if (a < 0 || b < 0) die('this flowboard.html has no Joy × Responsibility code (missing "' + from.slice(0, 40) + '")'); return script.slice(a, b); };
  const code = cut('const JR_CONF=', '/* repair/sanitise any loaded state')
    + cut('/* ================= joy × responsibility ================= */', '/* ---- evaluation runs');
  const ls = { 'flowboard.ollama.url': OLLAMA, 'flowboard.ollama.model': MODEL };
  const ctx = {
    console, fetch, AbortController, setTimeout, clearTimeout, URL,
    location: { protocol: 'http:', origin: 'jr-nightly' },
    localStorage: { getItem: k => (k in ls ? ls[k] : null), setItem() {}, removeItem() {} },
    board: null, state: { settings: {} },
    localDateKey: ms => { const d = new Date(ms); return d.toLocaleDateString('sv-SE', { timeZone: TZ }); },
    findTask: () => null, touchTask: t => { t.updatedAt = Date.now(); }, save: () => {},
  };
  vm.createContext(ctx);
  vm.runInContext(code + '\n;globalThis.__jr={jrInput,jrHash,jrStale,jrEvaluate,JR_FATAL};', ctx);
  return { ctx, ...ctx.__jr };
}

const isOpen = (b, t) => !(b.columns || []).some(c => c && c.id === t.colId && c.done);
function candidates(s, jr) {
  const out = [];
  for (const b of s.boards) for (const t of b.tasks || []) {
    if (!t || !t.id || !isOpen(b, t)) continue;
    jr.ctx.board = b;
    if (!t.motivation) out.push({ id: t.id, board: b.id, title: t.title, why: 'unrated' });
    else if (jr.jrStale(t)) out.push({ id: t.id, board: b.id, title: t.title, why: 'changed' });
  }
  return out.sort((a, b) => (a.why === 'unrated' ? 0 : 1) - (b.why === 'unrated' ? 0 : 1));
}

/* write one result into fresh state and verify it stuck (a browser may save at the same moment) */
async function store(id, motivation) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const s = await getState();
    let t = null;
    for (const b of s.boards) { t = (b.tasks || []).find(x => x && x.id === id); if (t) break; }
    if (!t) return 'gone';
    t.motivation = motivation; t.updatedAt = Date.now();
    s.updatedAt = Math.max(Date.now(), (s.updatedAt || 0) + 1);
    await postState(s);
    const v = await getState();
    const back = v.boards.flatMap(b => b.tasks || []).find(x => x && x.id === id);
    if (back && back.motivation && back.motivation.evaluatedAt === motivation.evaluatedAt) return 'ok';
    await new Promise(r => setTimeout(r, 1500 * attempt));
  }
  return 'lost';
}

async function main() {
  if (!NOW && !DRY && !inWindow()) return; /* hourly cron: quiet outside the window */
  if (!KEY) die('set FB_KEY or FB_KEY_FILE (the board master key)');
  if (!DRY && (!OLLAMA || !MODEL)) die('set OLLAMA and JR_MODEL');
  try { fs.writeFileSync(LOCK, String(process.pid), { flag: 'wx' }); }
  catch (e) {
    const pid = +fs.readFileSync(LOCK, 'utf8');
    try { process.kill(pid, 0); log('another run is active (pid ' + pid + '), exiting'); return; } catch { fs.writeFileSync(LOCK, String(process.pid)); }
  }
  try {
    const jr = await loadJr();
    const todo = candidates(await getState(), jr);
    log(`${todo.length} task(s) to evaluate` + (DRY ? ' (dry run)' : ` with ${MODEL} at ${OLLAMA}, window ${FROM}–${TO} ${TZ}`));
    if (DRY) { todo.forEach(c => log(' ', c.why.padEnd(8), c.title)); return; }
    let ok = 0, failed = 0;
    for (const c of todo) {
      if (!NOW && !inWindow()) { log('window over, stopping'); break; }
      const s = await getState();
      const b = s.boards.find(x => x.id === c.board), t = b && (b.tasks || []).find(x => x.id === c.id);
      if (!t || !isOpen(b, t)) continue;
      jr.ctx.board = b;
      if (t.motivation && !jr.jrStale(t)) continue; /* evaluated in a browser meanwhile */
      const ctl = new AbortController(), stop = setTimeout(() => ctl.abort(), NOW ? 2 ** 30 : msLeft());
      try {
        const res = await jr.jrEvaluate(c.id, ctl.signal);
        const st = await store(c.id, JSON.parse(JSON.stringify(res.motivation)));
        if (st === 'ok') { ok++; log('ok  ', `A ${res.motivation.attraction} R ${res.motivation.responsibility}`, '·', c.title); }
        else { failed++; log(st.padEnd(4), c.title); }
      } catch (e) {
        if (jr.JR_FATAL.has(e.kind)) { log('stopping:', e.message); break; }
        failed++; log('skip', c.title, '·', e.message);
      } finally { clearTimeout(stop); }
    }
    log(`done: ${ok} evaluated, ${failed} not`);
  } finally { try { if (+fs.readFileSync(LOCK, 'utf8') === process.pid) fs.unlinkSync(LOCK); } catch {} }
}
main().catch(e => die(e.message));
