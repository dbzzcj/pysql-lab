/* PySQL Lab — 数据开发版 Python 闯关
   纯前端：Pyodide 在浏览器里跑真 CPython + pandas，SQL 侧用同一份数据的 sqlite3。 */

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const LS_PROG = 'pysql.progress.v1';
const LS_CODE = 'pysql.code.v1';

const LEVELS = window.LEVELS || [];
const STAGE_NAMES = window.STAGE_NAMES || {};

let pyodide = null;
let bootPromise = null;
let execFn = null;
let current = 0;

/* ---------------- 状态 ---------------- */
const P = loadLS(LS_PROG, { done: {}, xp: 0 });
const CODES = loadLS(LS_CODE, {});

function loadLS(k, d) { try { return { ...d, ...JSON.parse(localStorage.getItem(k) || '{}') }; } catch { return d; } }
function saveProg() { localStorage.setItem(LS_PROG, JSON.stringify(P)); }
function saveCodes() { localStorage.setItem(LS_CODE, JSON.stringify(CODES)); }
const isDone = id => !!P.done[id];

/* ---------------- 小工具 ---------------- */
const $ = s => document.querySelector(s);
function setStatus(state, txt) {
  const dot = $('#engine .dot');
  dot.className = 'dot ' + (state || '');
  $('#engineTxt').textContent = txt;
  $('#engine').title = txt;
}
function toast(msg, bad) {
  let el = $('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.className = 'toast show' + (bad ? ' bad' : '');
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = 'toast' + (bad ? ' bad' : ''); }, 2600);
}
function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* markdown-ish：[[code]] 行内代码，~~~ 代码块，## 小标题，> 提示，- 列表 */
function renderMd(src) {
  const inline = t => esc(t)
    .replace(/\[\[(.+?)\]\]/g, (m, p) => '<code>' + p + '</code>')
    .replace(/\*\*(.+?)\*\*/g, (m, p) => '<strong>' + p + '</strong>');
  const lines = String(src || '').split('\n');
  let html = '', inFence = false, buf = [], inList = false;
  const closeList = () => { if (inList) { html += '</ul>'; inList = false; } };
  for (const raw of lines) {
    if (raw.trim().startsWith('~~~')) {
      if (!inFence) { closeList(); inFence = true; buf = []; }
      else { html += '<pre><code>' + esc(buf.join('\n')) + '</code></pre>'; inFence = false; }
      continue;
    }
    if (inFence) { buf.push(raw); continue; }
    if (!raw.trim()) { closeList(); continue; }
    if (raw.startsWith('## ')) { closeList(); html += '<h4>' + inline(raw.slice(3)) + '</h4>'; continue; }
    if (raw.startsWith('> ')) { closeList(); html += '<div class="tip">' + inline(raw.slice(2)) + '</div>'; continue; }
    if (raw.startsWith('- ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += '<li>' + inline(raw.slice(2)) + '</li>'; continue;
    }
    closeList(); html += '<p>' + inline(raw) + '</p>';
  }
  closeList();
  if (inFence) html += '<pre><code>' + esc(buf.join('\n')) + '</code></pre>';
  return html;
}

/* ---------------- 引擎 ---------------- */
async function boot() {
  if (pyodide) return pyodide;
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    try {
      setStatus('loading', '正在加载 Python 引擎（首次约 10MB）…');
      pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
      setStatus('loading', '引擎就绪，正在加载 pandas / sqlite3…');
      await pyodide.loadPackage(['pandas', 'sqlite3']);
      setStatus('loading', '正在准备演示数据集…');
      await prepareData();
      execFn = pyodide.runPython("__import__('builtins').exec");
      const ver = pyodide.runPython("import sys; sys.version.split()[0]");
      setStatus('ready', 'Python ' + ver + ' + pandas 就绪');
      return pyodide;
    } catch (e) {
      setStatus('error', '引擎加载失败，检查网络后刷新重试');
      bootPromise = null;
      throw e;
    }
  })();
  return bootPromise;
}

async function prepareData() {
  const csv = await (await fetch('data/orders.csv', { cache: 'no-store' })).text();
  pyodide.FS.writeFile('/home/pyodide/orders.csv', csv);
  pyodide.runPython(`
import sqlite3, csv, os, shutil
os.makedirs('/home/pyodide/data', exist_ok=True)
shutil.copyfile('/home/pyodide/orders.csv', '/home/pyodide/data/orders.csv')

rows = list(csv.reader(open('/home/pyodide/orders.csv', encoding='utf-8')))
data = rows[1:]
conn = sqlite3.connect('/home/pyodide/demo.db')
conn.execute('DROP TABLE IF EXISTS orders')
conn.execute('CREATE TABLE orders (order_id INTEGER, user_id INTEGER, city TEXT, amount REAL, status TEXT, created_at TEXT)')
conn.executemany('INSERT INTO orders VALUES (?,?,?,?,?,?)', [
    (int(r[0]), int(r[1]), r[2], None if r[3] == '' else float(r[3]), r[4], r[5]) for r in data
])
conn.execute('DROP TABLE IF EXISTS users')
conn.execute('CREATE TABLE users (user_id INTEGER, name TEXT, city TEXT, vip INTEGER)')
conn.executemany('INSERT INTO users VALUES (?,?,?,?)', [
    (1,'张伟','深圳',1),(2,'李娜','深圳',0),(3,'王强','广州',1),(4,'陈静','上海',0),(5,'刘洋','北京',1)
])
conn.commit(); conn.close()
`);
}

/* ---------------- 执行 ---------------- */
const PREAMBLE = `_captured = []
_ps_orig_print = print
def print(*args, **kwargs):
    _captured.append(' '.join(str(x) for x in args))
    return _ps_orig_print(*args, **kwargs)
`;

/* 第 37 关之后的 pandas 关卡，编辑器里预置好 df / conn，避免每关都重写一遍读取代码 */
function preludeFor(lv) {
  if (lv.stage === 7 && lv.id !== 'p37') {
    return "import pandas as pd\ndf = pd.read_csv('/home/pyodide/orders.csv')\n";
  }
  if (lv.stage === 8 || lv.stage === 9) {
    return "import pandas as pd\ndf = pd.read_csv('/home/pyodide/orders.csv')\nimport sqlite3\nconn = sqlite3.connect('/home/pyodide/demo.db')\ncur = conn.cursor()\n";
  }
  return '';
}

function cleanErr(e) {
  let m = (e && e.message) || String(e);
  m = m.replace(/^Traceback \(most recent call last\):\s*/m, '');
  const lines = m.split('\n').filter(l => {
    const t = l.trim();
    if (!t) return false;
    if (t.startsWith('Traceback')) return false;
    if (/^File "/.test(t)) return false;
    if (/^\^+$/.test(t)) return false;
    if (/^The above exception/.test(t)) return false;
    return true;
  });
  return lines.slice(-4).join('\n').trim();
}

async function execIn(ns, code) {
  const out = [], errs = [];
  pyodide.setStdout({ batched: s => out.push(s) });
  pyodide.setStderr({ batched: s => errs.push(s) });
  let status = 'ok', message = '';
  try {
    execFn(code, ns);
  } catch (e) {
    status = 'error';
    message = cleanErr(e);
  } finally {
    pyodide.setStdout({});
    pyodide.setStderr({});
  }
  return { out: out.join('\n').trim(), err: errs.join('\n').trim(), status, message };
}

async function runCode(code, withCheck) {
  await boot();
  const lv = LEVELS[current];
  const ns = pyodide.runPython('{}');
  try {
    const full = PREAMBLE + preludeFor(lv) + code;
    const r = await execIn(ns, full);
    if (r.status === 'error') return { ok: false, stage: 'code', out: r.out, message: r.message };
    if (!withCheck) return { ok: true, stage: 'run', out: r.out };
    const c = await execIn(ns, lv.check);
    if (c.status === 'ok') return { ok: true, stage: 'check', out: r.out };
    let msg = c.message.replace(/^AssertionError:\s*/m, '');
    return { ok: false, stage: 'check', out: r.out, message: msg || '断言失败' };
  } finally {
    try { ns.destroy(); } catch { }
  }
}

/* ---------------- SQL 侧 ---------------- */
async function runSql(sql) {
  await boot();
  const py = `
import sqlite3, json
conn = sqlite3.connect('/home/pyodide/demo.db')
cur = conn.cursor()
cur.execute(${JSON.stringify(sql)})
rows = cur.fetchall()
cols = [d[0] for d in cur.description] if cur.description else []
json.dumps({'cols': cols, 'rows': [list(r) for r in rows]}, ensure_ascii=False, default=str)
`.trim();
  const raw = pyodide.runPython(py);
  return JSON.parse(raw);
}

function renderTable(data) {
  if (!data.cols.length) return '<p style="color:var(--dim);font-size:12px">（这条语句没有返回结果集）</p>';
  let h = '<table><thead><tr>' + data.cols.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>';
  for (const r of data.rows) {
    h += '<tr>' + r.map(v => v === null ? '<td class="null-cell">NULL</td>' : '<td>' + esc(v) + '</td>').join('') + '</tr>';
  }
  h += '</tbody></table>';
  h += '<p style="color:var(--dim);font-size:11px;margin:6px 0 0">' + data.rows.length + ' 行</p>';
  return h;
}

/* ---------------- 侧栏 ---------------- */
function renderSidebar() {
  const stages = [...new Set(LEVELS.map(l => l.stage))].sort((a, b) => a - b);
  $('#stageList').innerHTML = stages.map(st => {
    const items = LEVELS.map((l, i) => ({ l, i })).filter(o => o.l.stage === st);
    const doneN = items.filter(o => isDone(o.l.id)).length;
    return '<div class="stage-group"><div class="stage-title">' + esc(STAGE_NAMES[st] || ('阶段 ' + st)) +
      '<span class="stage-count">' + doneN + '/' + items.length + '</span><span class="bar"></span></div>' +
      items.map(o => '<button class="lv' + (o.i === current ? ' active' : '') + '" data-i="' + o.i + '">' +
        '<span class="idx">' + String(o.i + 1).padStart(2, '0') + '</span>' +
        '<span class="nm">' + esc(o.l.title) + '</span>' +
        '<span class="tick">' + (isDone(o.l.id) ? '✓' : '') + '</span></button>').join('') +
      '</div>';
  }).join('');
  document.querySelectorAll('.lv').forEach(b => b.onclick = () => openLevel(+b.dataset.i));
  const total = LEVELS.length, done = Object.keys(P.done).length;
  $('#doneNum').textContent = done + '/' + total;
  $('#xpNum').textContent = P.xp;
  const pct = total ? Math.round(done / total * 100) : 0;
  $('#progBar').style.width = pct + '%';
  $('#progTxt').textContent = pct + '% · ' + done + ' 关';
}

/* ---------------- 关卡 ---------------- */
function openLevel(i) {
  if (i < 0 || i >= LEVELS.length) return;
  current = i;
  const lv = LEVELS[i];
  $('#crumbs').textContent = (STAGE_NAMES[lv.stage] || '') + ' · 第 ' + (i + 1) + ' 关 / 共 ' + LEVELS.length + ' 关';
  $('#levelTitle').textContent = lv.title;
  $('#levelSub').textContent = lv.goal || '';
  $('#lessonBody').innerHTML = renderMd(lv.lesson);
  $('#taskBody').innerHTML = renderMd(lv.task);
  $('#sqlCode').textContent = lv.sql || '-- 本关没有可直接执行的对照 SQL';
  $('#pyCode').textContent = lv.py || '';
  $('#compareNote').textContent = lv.note || '';
  $('#sqlResult').innerHTML = '';
  $('#code').value = CODES[lv.id] != null ? CODES[lv.id] : lv.starter;
  $('#hintBox').className = 'hint-box hidden';
  $('#answerBox').className = 'answer-box hidden';
  $('#hintBox').innerHTML = renderMd(lv.hint || '本关没有额外提示。');
  $('#answerBox').innerHTML = '<b style="color:var(--accent);font-size:12.5px">参考实现</b><pre>' + esc(lv.answer) + '</pre>';
  setConsole('', '就绪');
  syncGutter();
  saveCodes();
  renderSidebar();
  document.querySelector('.lv.active')?.scrollIntoView({ block: 'nearest' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  switchTab('sql');
  $('#stage').dataset.idx = i;
  $('.kbd-hint').textContent = (preludeFor(lv) ? '已预置 df / conn · ' : '') + 'Ctrl + Enter 运行 / 提交';
  localStorage.setItem('pysql.last', i);
}

function setConsole(text, state, cls) {
  $('#consoleOut').innerHTML = text ? esc(text) : '';
  const st = $('#consoleState');
  st.textContent = state || '就绪';
  st.className = (cls || '').replace('bad', 'bad').replace('ok', 'ok').replace('busy', 'busy');
}

function syncGutter() {
  const n = $('#code').value.split('\n').length;
  $('#gutter').textContent = Array.from({ length: Math.max(n, 12) }, (_, i) => i + 1).join('\n');
}

async function doRun(submit) {
  const lv = LEVELS[current];
  const code = $('#code').value;
  CODES[lv.id] = code; saveCodes();
  const btn = submit ? $('#submitBtn') : $('#runBtn');
  const old = btn.textContent;
  btn.disabled = true; btn.textContent = submit ? '判题中…' : '运行中…';
  setConsole('', submit ? '正在执行并判题…' : '正在执行…', 'busy');
  try {
    if (!pyodide) { setStatus('loading', '首次加载 Python 引擎，请稍等…'); }
    const r = await runCode(code, submit);
    if (submit) {
      if (r.ok) {
        const first = !isDone(lv.id);
        if (first) { P.done[lv.id] = true; P.xp += 10; saveProg(); renderSidebar(); }
        setConsole((r.out ? r.out + '\n\n' : '') + '✅ 通过：' + lv.title, '判题通过', 'ok');
        toast(first ? '通关 +10 经验 · 下一关已解锁' : '又过了一遍，稳');
        if (first && current < LEVELS.length - 1) setTimeout(() => { }, 0);
      } else if (r.stage === 'code') {
        setConsole('❌ 代码报错（先看这一行）：\n' + r.message + (r.out ? '\n\n输出：\n' + r.out : ''), '运行出错', 'bad');
      } else {
        setConsole('❌ 还没通过：' + r.message + (r.out ? '\n\n你的输出：\n' + r.out : ''), '断言未通过', 'bad');
      }
    } else {
      if (r.ok) setConsole(r.out || '（没有输出，记得用 print 打印结果）', '运行成功', 'ok');
      else setConsole('❌ 运行出错：\n' + r.message, '运行出错', 'bad');
    }
  } catch (e) {
    setConsole('❌ ' + (e.message || e), '出错了', 'bad');
  } finally {
    btn.disabled = false; btn.textContent = old;
  }
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  $('#paneSql').classList.toggle('hidden', name !== 'sql');
  $('#panePy').classList.toggle('hidden', name !== 'py');
}

/* ---------------- 事件 ---------------- */
function bind() {
  $('#runBtn').onclick = () => doRun(false);
  $('#submitBtn').onclick = () => doRun(true);
  $('#hintBtn').onclick = () => $('#hintBox').classList.toggle('hidden');
  $('#answerBtn').onclick = () => $('#answerBox').classList.toggle('hidden');
  $('#resetBtn').onclick = () => {
    const lv = LEVELS[current];
    $('#code').value = lv.starter; CODES[lv.id] = lv.starter; saveCodes(); syncGutter();
    setConsole('', '已重置为本关起始代码');
  };
  $('#clearConsole').onclick = () => setConsole('', '就绪');
  $('#prevBtn').onclick = () => openLevel(current - 1);
  $('#nextBtn').onclick = () => openLevel(current + 1);
  $('#resetAll').onclick = () => {
    if (!confirm('清空本机所有通关进度和已保存代码？')) return;
    localStorage.removeItem(LS_PROG); localStorage.removeItem(LS_CODE);
    P.done = {}; P.xp = 0; Object.keys(CODES).forEach(k => delete CODES[k]);
    renderSidebar(); openLevel(0); toast('已清空');
  };
  document.querySelectorAll('.tab').forEach(t => t.onclick = () => switchTab(t.dataset.tab));

  $('#runSqlBtn').onclick = async () => {
    const btn = $('#runSqlBtn'); const old = btn.textContent;
    btn.disabled = true; btn.textContent = '执行中…';
    try {
      const data = await runSql($('#sqlCode').textContent);
      $('#sqlResult').innerHTML = renderTable(data);
    } catch (e) {
      $('#sqlResult').innerHTML = '<p style="color:var(--bad);font-size:12px">SQL 出错：' + esc(cleanErr(e)) + '</p>';
    } finally { btn.disabled = false; btn.textContent = old; }
  };

  const ta = $('#code');
  ta.addEventListener('input', () => { syncGutter(); CODES[LEVELS[current].id] = ta.value; saveCodes(); });
  ta.addEventListener('scroll', () => { $('#gutter').scrollTop = ta.scrollTop; });
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, v = ta.value;
      ta.value = v.slice(0, s) + '    ' + v.slice(ta.selectionEnd);
      ta.selectionStart = ta.selectionEnd = s + 4;
      syncGutter();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      doRun(ta.value.trim() !== LEVELS[current].starter.trim());
    }
  });

  document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'ArrowLeft') openLevel(current - 1);
    if (e.altKey && e.key === 'ArrowRight') openLevel(current + 1);
  });
}

function renderSchema() {
  $('#schema').innerHTML =
    '<b>orders</b>（21 行）order_id INTEGER · user_id INTEGER · city TEXT · amount REAL（2 行 NULL）· status TEXT(paid/refunded/pending) · created_at TEXT<br>' +
    '<b>users</b>（5 行）user_id · name · city · vip<br>' +
    '<span style="color:var(--dim)">SQL 侧：demo.db 里的同名表；Python 侧：[[pd.read_csv(\'/home/pyodide/orders.csv\')]]</span>';
}

/* ---------------- 启动 ---------------- */
(function init() {
  if (!LEVELS.length) {
    document.body.innerHTML = '<p style="padding:40px;color:#f87171">关卡数据未加载（content-*.js 缺失）</p>';
    return;
  }
  bind();
  renderSidebar();
  renderSchema();
  const savedIdx = +(localStorage.getItem('pysql.last') || 0);
  openLevel(Math.max(0, Math.min(savedIdx, LEVELS.length - 1)));
  window.__lab = { levels: LEVELS, open: openLevel, state: () => ({ cur: current, done: Object.keys(P.done).length, xp: P.xp }) };
  setTimeout(boot, 400);
})();
