(() => {
  const START = '2026-10-21';
  const KEY = 'missionTracker_v1';
  const categories = [
    { id: 'ai', label: 'AI course & coding', color: '#4263eb' },
    { id: 'ssb', label: 'SSB preparation', color: '#15966a' },
    { id: 'cds', label: 'CDS written prep', color: '#d97706' },
    { id: 'job', label: 'Job search & career', color: '#8b5cf6' },
    { id: 'fitness', label: 'Fitness & recovery', color: '#e05a7b' },
    { id: 'life', label: 'Routine & reflection', color: '#64748b' }
  ];
  const tasks = [
    { id: 'wake', time: '5:30–5:45', title: 'Wake up, hydrate and get ready', cat: 'life', detail: 'Avoid phone scrolling at the start of the day.' },
    { id: 'run', time: '5:45–6:30', title: 'Running / fitness session', cat: 'fitness', detail: 'Follow the progressive run-walk plan; recovery walk or mobility on easy days.' },
    { id: 'breakfast', time: '6:30–7:00', title: 'Bath and breakfast', cat: 'life', detail: 'Get ready for focused study.' },
    { id: 'ssbpsych', time: '7:00–8:00', title: 'SSB psychology practice', cat: 'ssb', detail: 'Rotate OIR, PPDT, TAT, WAT, SRT and self-description.' },
    { id: 'course', time: '8:00–10:00', title: 'Generative AI course lessons', cat: 'ai', detail: 'Follow the planned course modules and take concise notes.' },
    { id: 'break1', time: '10:00–10:15', title: 'Screen break and stretch', cat: 'life', detail: 'Step away from your desk.' },
    { id: 'coding', time: '10:15–11:30', title: 'Hands-on coding / AI project', cat: 'ai', detail: 'Reproduce examples, solve Python exercises or improve the AI Tutor.' },
    { id: 'revision', time: '11:30–12:00', title: 'AI recall and revision', cat: 'ai', detail: 'Explain what you learned without notes; record doubts.' },
    { id: 'lunch', time: '12:00–1:00', title: 'Lunch and rest', cat: 'life', detail: 'Eat and recharge.' },
    { id: 'cds', time: '1:00–2:00', title: 'CDS written preparation', cat: 'cds', detail: 'Rotate English, Mathematics and General Knowledge.' },
    { id: 'break2', time: '2:00–2:15', title: 'Short break', cat: 'life', detail: 'Move around and reset.' },
    { id: 'jobs', time: '2:15–3:00', title: 'Job applications and follow-ups', cat: 'job', detail: 'Apply to relevant full-stack, Python backend and AI application roles.' },
    { id: 'portfolio', time: '3:00–4:30', title: 'Portfolio / technical interview practice', cat: 'ai', detail: 'Improve a project, practise SQL/Python or revise MERN fundamentals.' },
    { id: 'break3', time: '4:30–5:00', title: 'Refreshment break', cat: 'life', detail: 'Take a genuine break.' },
    { id: 'ssbinterview', time: '5:00–6:00', title: 'SSB interview / communication', cat: 'ssb', detail: 'Personal interview, current affairs, narration or group discussion.' },
    { id: 'recovery', time: '6:00–6:45', title: 'Walk, strength or recovery', cat: 'fitness', detail: 'Strength on selected days; easy walk or mobility otherwise.' },
    { id: 'dinner', time: '6:45–7:30', title: 'Dinner and family time', cat: 'life', detail: 'Take a proper break from work.' },
    { id: 'lightreview', time: '7:30–8:15', title: 'Light revision / current affairs', cat: 'cds', detail: 'Review notes, flashcards or mistakes; avoid heavy new topics.' },
    { id: 'review', time: '8:15–8:45', title: 'Daily review and plan tomorrow', cat: 'life', detail: 'Record progress, blockers and three priorities for tomorrow.' },
    { id: 'relax', time: '8:45–9:30', title: 'Relax and disconnect', cat: 'life', detail: 'Family, reading or a relaxing activity; avoid endless scrolling.' },
    { id: 'sleep', time: '9:30–10:00', title: 'Prepare for sleep', cat: 'life', detail: 'Set up tomorrow’s materials and wind down.' }
  ];
  let db = loadDB();
  let selectedDate = localDate(new Date());
  let activeFilter = 'all';
  let showAll = false;
  const $ = id => document.getElementById(id);
  function localDate(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
  function parseDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12) }
  function addDays(s, n) { const d = parseDate(s); d.setDate(d.getDate() + n); return localDate(d) }
  function pretty(s) { return parseDate(s).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }
  function loadDB() { try { return JSON.parse(localStorage.getItem(KEY)) || { days: {}, weeks: {} } } catch (e) { return { days: {}, weeks: {} } } }
  function saveDB() { localStorage.setItem(KEY, JSON.stringify(db)) }
  function blankDay() { return { checks: {}, notes: '' } }
  function dayData(date = selectedDate) { if (!db.days[date]) db.days[date] = blankDay(); return db.days[date] }
  function isTouched(date, data) { return Object.values(data.checks || {}).some(Boolean) || !!(data.notes || '').trim() || !!(data.reflection || '').trim() }
  function record(date) { return db.days[date] || { checks: {}, notes: '' } }
  function completedCount(data) { return tasks.filter(t => data.checks?.[t.id]).length }
  function pct(data) { return Math.round(completedCount(data) / tasks.length * 100) }
  function dateRange(end, count) { let arr = []; for (let i = count - 1; i >= 0; i--)arr.push(addDays(end, -i)); return arr }
  function weekKey(date) { let d = parseDate(date); let day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return localDate(d) }
  function weekData(date) { let key = weekKey(date); if (!db.weeks[key]) db.weeks[key] = { reflection: '', blocker: '' }; return db.weeks[key] }
  function render() {
    $('datePicker').value = selectedDate;
    $('prettyDate').textContent = pretty(selectedDate);
    const daysSince = Math.floor((parseDate(selectedDate) - parseDate(START)) / 86400000) + 1;
    $('dayNumber').textContent = daysSince > 0 && daysSince <= 90 ? `Day ${daysSince} of 90 · Started ${pretty(START)}` : 'Daily tracker · Outside the original 90-day window';
    renderMetrics(); renderTasks(); renderAnalysis(); renderChart(); renderHistory(); renderWeekly();
  }
  function renderMetrics() {
    const d = record(selectedDate), done = completedCount(d), p = pct(d);
    $('completionMetric').textContent = p + '%'; $('completionHint').textContent = `${done} of ${tasks.length} tasks complete`;
    const ai = tasks.filter(t => t.cat === 'ai'), def = tasks.filter(t => t.cat === 'ssb' || t.cat === 'cds');
    const calc = arr => Math.round(arr.filter(t => d.checks?.[t.id]).length / arr.length * 100);
    $('aiMetric').textContent = calc(ai) + '%'; $('defenceMetric').textContent = calc(def) + '%';
    const last = dateRange(selectedDate, 7).filter(dt => isTouched(dt, record(dt)));
    $('averageMetric').textContent = last.length ? Math.round(last.reduce((s, dt) => s + pct(record(dt)), 0) / last.length) + '%' : '—';
    $('dailyProgressFill').style.width = p + '%'; $('progressText').textContent = `${done} completed · ${tasks.length - done} remaining · ${p}% complete`;
  }
  function renderTasks() {
    const data = record(selectedDate), list = $('taskList'); list.innerHTML = '';
    const visible = tasks.filter(t => activeFilter === 'all' || (activeFilter === 'done' ? !!data.checks?.[t.id] : !data.checks?.[t.id]));
    let current = '';
    visible.forEach(t => {
      if (t.time !== current) { current = t.time; const group = document.createElement('div'); group.className = 'task-group'; group.innerHTML = `<div class="group-title">${escapeHTML(t.time)}</div>`; list.appendChild(group) }
      const group = list.lastElementChild;
      const el = document.createElement('label'); el.className = 'task' + (data.checks?.[t.id] ? ' done' : '');
      el.innerHTML = `<input type="checkbox" ${data.checks?.[t.id] ? 'checked' : ''} aria-label="Mark ${escapeHTML(t.title)} complete"><div class="task-body"><div class="task-title">${escapeHTML(t.title)}</div><div class="task-meta">${escapeHTML(t.detail)}</div></div><span class="task-time">${escapeHTML(catLabel(t.cat))}</span>`;
      el.querySelector('input').addEventListener('change', e => { const d = dayData(); d.checks[t.id] = e.target.checked; saveDB(); render() });
      group.appendChild(el);
    });
    if (!visible.length) list.innerHTML = '<div class="empty">No tasks in this filter. Nice work or switch to another view.</div>';
    $('dailyNotes').value = data.notes || '';
  }
  function catLabel(id) { return categories.find(c => c.id === id)?.label || id }
  function renderAnalysis() {
    const data = record(selectedDate); $('categoryAnalysis').innerHTML = '';
    categories.forEach(c => {
      const ts = tasks.filter(t => t.cat === c.id); if (!ts.length) return;
      const done = ts.filter(t => data.checks?.[t.id]).length; const percent = Math.round(done / ts.length * 100);
      const el = document.createElement('div'); el.innerHTML = `<div class="category-row"><span>${escapeHTML(c.label)}</span><strong>${done}/${ts.length} · ${percent}%</strong></div><div class="mini-track"><div class="mini-fill" style="width:${percent}%;background:${c.color}"></div></div>`;
      $('categoryAnalysis').appendChild(el);
    });
    const done = completedCount(data); $('missedCount').textContent = tasks.length - done;
    let streak = 0, d = selectedDate;
    while (isTouched(d, record(d)) && pct(record(d)) >= 70 && streak < 365) { streak++; d = addDays(d, -1) }
    $('streakCount').textContent = streak + ' day' + (streak === 1 ? '' : 's');
    const saved = dateRange(selectedDate, 7).filter(dt => isTouched(dt, record(dt)));
    $('consistencyScore').textContent = saved.length ? Math.round(saved.filter(dt => pct(record(dt)) >= 70).length / saved.length * 100) + '%' : '0%';
  }
  function renderWeekly() { const w = weekData(selectedDate); $('weeklyReflection').value = w.reflection || ''; $('weeklyBlocker').value = w.blocker || '' }
  function renderChart() {
    const canvas = $('progressChart'), ctx = canvas.getContext('2d'); const rect = canvas.getBoundingClientRect(); const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, rect.width * ratio); canvas.height = Math.max(1, rect.height * ratio); ctx.scale(ratio, ratio);
    const W = rect.width, H = rect.height; ctx.clearRect(0, 0, W, H);
    const n = Number($('chartRange').value) || 30, dates = dateRange(selectedDate, n);
    const pad = { l: 35, r: 12, t: 18, b: 34 }, cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
    ctx.font = '11px system-ui'; ctx.lineWidth = 1; ctx.strokeStyle = '#e7ebf3'; ctx.fillStyle = '#7b8496';
    [0, 25, 50, 75, 100].forEach(v => { let y = pad.t + ch - (v / 100) * ch; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(v + '%', pad.l - 7, y + 4) });
    const vals = dates.map(dt => isTouched(dt, record(dt)) ? pct(record(dt)) : null);
    const avg = vals.map((v, i) => { const a = vals.slice(Math.max(0, i - 6), i + 1).filter(x => x !== null); return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null });
    function drawLine(arr, color, width) {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); let started = false;
      arr.forEach((v, i) => { if (v === null) { started = false; return } const x = pad.l + (n === 1 ? cw / 2 : i * cw / (n - 1)), y = pad.t + ch - v / 100 * ch; if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y) }); ctx.stroke();
    }
    drawLine(vals, '#4263eb', 2.5); drawLine(avg, '#15966a', 2);
    vals.forEach((v, i) => { if (v === null) return; const x = pad.l + (n === 1 ? cw / 2 : i * cw / (n - 1)), y = pad.t + ch - v / 100 * ch; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = '#4263eb'; ctx.fill() });
    const ticks = Math.min(n, 7); for (let j = 0; j < ticks; j++) { const i = Math.round(j * (n - 1) / Math.max(1, ticks - 1)); const x = pad.l + (n === 1 ? cw / 2 : i * cw / (n - 1)); ctx.textAlign = j === 0 ? 'left' : j === ticks - 1 ? 'right' : 'center'; ctx.fillStyle = '#7b8496'; ctx.fillText(dates[i].slice(5), x, H - 10) }
    if (!vals.some(v => v !== null)) { ctx.textAlign = 'center'; ctx.fillStyle = '#7b8496'; ctx.font = '13px system-ui'; ctx.fillText('Complete tasks to start your progress graph', W / 2, H / 2) }
  }
  function renderHistory() {
    const tbody = $('historyBody'); tbody.innerHTML = '';
    const dates = Object.keys(db.days).filter(dt => isTouched(dt, record(dt))).sort((a, b) => b.localeCompare(a));
    const shown = showAll ? dates : dates.slice(0, 10);
    if (!shown.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty">No saved daily records yet. Check off a task to begin tracking.</td></tr>'; return }
    shown.forEach(dt => {
      const d = record(dt), done = completedCount(d), p = pct(d), missed = tasks.filter(t => !d.checks?.[t.id]).map(t => t.title);
      const status = p >= 70 ? 'status-good' : p >= 40 ? 'status-mid' : 'status-low';
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><button class="small-btn" data-date="${dt}">${dt}</button></td><td>${done}</td><td>${tasks.length}</td><td class="${status}">${p}%</td><td title="${escapeHTML(missed.join(', '))}">${tasks.length - done}</td><td>${escapeHTML((d.notes || '').slice(0, 90)) || '—'}</td>`;
      tr.querySelector('button').addEventListener('click', () => { selectedDate = dt; render(); window.scrollTo({ top: 0, behavior: 'smooth' }) });
      tbody.appendChild(tr);
    });
    $('showAllBtn').textContent = showAll ? 'Show recent 10' : 'Show all records';
  }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) }
  function csvCell(v) { return '"' + String(v ?? '').replace(/"/g, '""') + '"' }
  function exportCSV() {
    const dates = Object.keys(db.days).filter(dt => isTouched(dt, record(dt))).sort();
    const headers = ['Date', ...tasks.map(t => t.title + ' (completed)'), ...tasks.map(t => t.title + ' (missed)'), 'Completed count', 'Total tasks', 'Completion %', 'Daily notes'];
    const rows = [headers];
    dates.forEach(dt => { const d = record(dt), done = completedCount(d); rows.push([dt, ...tasks.map(t => d.checks?.[t.id] ? 'Yes' : 'No'), ...tasks.map(t => d.checks?.[t.id] ? 'No' : 'Yes'), done, tasks.length, pct(d), d.notes || '']) });
    const blob = new Blob(['\ufeff' + rows.map(r => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, 'mission-tracker-data.csv');
  }
  function downloadBlob(blob, name) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
  $('datePicker').addEventListener('change', e => { if (e.target.value) { selectedDate = e.target.value; render() } });
  $('prevDay').addEventListener('click', () => { selectedDate = addDays(selectedDate, -1); render() });
  $('nextDay').addEventListener('click', () => { selectedDate = addDays(selectedDate, 1); render() });
  $('todayBtn').addEventListener('click', () => { selectedDate = localDate(new Date()); render() });
  $('filters').addEventListener('click', e => { const b = e.target.closest('button[data-filter]'); if (!b) return; activeFilter = b.dataset.filter;[...$('filters').querySelectorAll('button')].forEach(x => x.classList.toggle('active', x === b)); renderTasks() });
  $('dailyNotes').addEventListener('input', e => { dayData().notes = e.target.value; saveDB(); renderMetrics(); renderChart(); renderHistory() });
  $('weeklyReflection').addEventListener('input', e => { weekData(selectedDate).reflection = e.target.value; saveDB() });
  $('weeklyBlocker').addEventListener('input', e => { weekData(selectedDate).blocker = e.target.value; saveDB() });
  $('chartRange').addEventListener('change', renderChart);
  $('resetDayBtn').addEventListener('click', () => { if (confirm('Reset all task checkboxes and notes for ' + selectedDate + '?')) { db.days[selectedDate] = blankDay(); saveDB(); render() } });
  $('exportBtn').addEventListener('click', exportCSV);
  $('backupBtn').addEventListener('click', () => downloadBlob(new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data: db, tasks }, null, 2)], { type: 'application/json' }), 'mission-tracker-backup.json'));
  $('showAllBtn').addEventListener('click', () => { showAll = !showAll; renderHistory() });
  window.addEventListener('resize', () => { clearTimeout(window.__chartResize); window.__chartResize = setTimeout(renderChart, 100) });
  render();
})();
