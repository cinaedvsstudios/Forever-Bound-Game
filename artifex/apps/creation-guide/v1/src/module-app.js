const VERSION = 'V1.0.3';

const MODULES = {
  'effect-editor': { label: 'Effect Editor', color: '#31d7ff', soft: 'rgba(49,215,255,.18)', icon: '✹' },
  'scene-editor': { label: 'Scene Editor', color: '#8f6dff', soft: 'rgba(143,109,255,.18)', icon: '▣' },
  'project-editor': { label: 'Project Editor', color: '#e5c84a', soft: 'rgba(229,200,74,.18)', icon: '⌘' },
  'quest-builder': { label: 'Quest Builder', color: '#43d36f', soft: 'rgba(67,211,111,.18)', icon: '✦' },
  'object-creator': { label: 'Object Creator', color: '#d94a4a', soft: 'rgba(217,74,74,.18)', icon: '◆' },
  unassigned: { label: 'Unassigned / General', color: '#8a7465', soft: 'rgba(138,116,101,.18)', icon: '◇' }
};

const STATES = ['unassigned', 'assigned', 'started', 'snoozing', 'blocked', 'review', 'done', 'archived'];
const FILTERS = ['undone', 'all', ...STATES];

const TEMPLATES = [
  { title: 'Create First Forest Scene', primaryModule: 'scene-editor', state: 'unassigned', owner: '', priority: 4, effort: 3, milestone: 'First Playable', zone: 'forest / first route', notes: 'Build the first playable scene shell and confirm it can be tested.', subtasks: ['Add background or placeholder', 'Place Mel start position', 'Add at least one exit', 'Place one searchable cache', 'Test scene JSON import'] },
  { title: 'Define First Calling Completion Condition', primaryModule: 'quest-builder', state: 'unassigned', owner: '', priority: 5, effort: 2, milestone: 'First Quest', zone: 'Chronicle 0 / Quest 0', notes: 'Create the first clear completion condition for a Quest or Calling.', subtasks: ['Write Calling text', 'Define final completion flag', 'Add Codice update note', 'Confirm Calling Fulfilled text'] },
  { title: 'Connect First Route on Flatplan', primaryModule: 'project-editor', state: 'unassigned', owner: '', priority: 5, effort: 3, milestone: 'First Route', zone: 'Flatplan', notes: 'Place the first playable route into the project structure.', subtasks: ['Add start screen to Flatplan', 'Add first route screen', 'Connect route to endpoint', 'Confirm playable path'] },
  { title: 'Create Searchable Cache Object', primaryModule: 'object-creator', state: 'unassigned', owner: '', priority: 4, effort: 2, milestone: 'First Interaction', zone: 'starter scene', notes: 'Define a reusable object archetype for scavenging and rewards.', subtasks: ['Choose object type', 'Set interaction name', 'Set reward placeholder', 'Confirm icon and category'] },
  { title: 'Add Fog Overlay Effect', primaryModule: 'effect-editor', state: 'unassigned', owner: '', priority: 3, effort: 2, milestone: 'First Scene', zone: 'forest', notes: 'Create a reusable atmospheric effect for a scene or gameplay state.', subtasks: ['Create placeholder FX settings', 'Preview on dark and light backgrounds', 'Export effect JSON', 'Link effect to scene assignment'] }
];

const state = {
  setup: { gameTitle: 'Untitled Artifex Adventure', creatorName: '', projectFolder: '', startingCharacter: 'Mel', buildTarget: 'Chronicle 0' },
  assignments: [],
  active: 0,
  filter: 'undone',
  sort: 'easy-wins',
  zoom: 1
};

window.addEventListener('DOMContentLoaded', () => {
  injectFallbackStyles();
  try {
    boot();
  } catch (error) {
    console.error(error);
    document.body.innerHTML = `<main class="boot-error"><h1>Creation Guide failed to start</h1><p>${escapeHtml(error.message || error)}</p></main>`;
  }
});

function boot() {
  setText('module-label', 'Creation Guide');
  setText('version-badge', VERSION);
  populateSelects();
  wireMenus();
  wireInputs();
  wireActions();
  addAssignment(TEMPLATES[0]);
  render();
  toast(`Creation Guide ${VERSION} loaded.`);
}

function addAssignment(template = {}) {
  const module = MODULES[template.primaryModule] || MODULES.unassigned;
  state.assignments.push({
    id: `assignment_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: template.title || 'New Assignment',
    primaryModule: template.primaryModule || 'unassigned',
    icon: template.icon || module.icon,
    state: template.state || 'unassigned',
    owner: template.owner || '',
    priority: Number(template.priority || 3),
    effort: Number(template.effort || 3),
    milestone: template.milestone || '',
    zone: template.zone || '',
    notes: template.notes || '',
    subtasks: (template.subtasks || []).map((text) => ({ id: `subtask_${Math.random().toString(36).slice(2, 9)}`, text, status: 'open' })),
    updatedAt: new Date().toISOString()
  });
  state.active = state.assignments.length - 1;
}

function activeAssignment() { return state.assignments[state.active] || null; }

function completion(item) {
  if (!item) return 0;
  if (item.state === 'done') return 100;
  if (!item.subtasks.length) return item.state === 'started' ? 25 : item.state === 'review' ? 85 : 0;
  return Math.round(item.subtasks.filter((task) => ['complete', 'confirmed', 'not-needed'].includes(task.status)).length / item.subtasks.length * 100);
}

function visibleAssignments() {
  let items = [...state.assignments];
  if (state.filter === 'undone') items = items.filter((item) => !['done', 'archived'].includes(item.state));
  else if (state.filter !== 'all') items = items.filter((item) => item.state === state.filter);
  if (state.sort === 'easy-wins') items.sort((a, b) => a.effort - b.effort || b.priority - a.priority);
  if (state.sort === 'most-important') items.sort((a, b) => b.priority - a.priority);
  if (state.sort === 'almost-complete') items.sort((a, b) => completion(b) - completion(a));
  if (state.sort === 'by-module') items.sort((a, b) => a.primaryModule.localeCompare(b.primaryModule));
  if (state.sort === 'not-touched') items.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
  return items;
}

function render() {
  syncInputs();
  renderTabs();
  renderTemplates();
  renderList();
  renderSubtasks();
  renderCanvas();
  setText('assignment-count', `${state.assignments.length} assignments`);
  setText('status-text', activeAssignment() ? `Editing ${activeAssignment().title}` : 'Ready.');
}

function syncInputs() {
  const setupPercent = Math.round([state.setup.gameTitle && state.setup.gameTitle !== 'Untitled Artifex Adventure', state.setup.creatorName, state.setup.projectFolder, state.setup.startingCharacter, state.setup.buildTarget].filter(Boolean).length / 5 * 100);
  setText('setup-percent', `${setupPercent}%`);
  setValue('game-title-input', state.setup.gameTitle);
  setValue('creator-input', state.setup.creatorName);
  setValue('project-folder-input', state.setup.projectFolder);
  setValue('starting-character-input', state.setup.startingCharacter);
  setValue('build-target-input', state.setup.buildTarget);
  const item = activeAssignment();
  setText('assignment-percent', `${completion(item)}%`);
  setValue('assignment-title-input', item?.title || '');
  setValue('assignment-module-input', item?.primaryModule || 'unassigned');
  setValue('assignment-state-input', item?.state || 'unassigned');
  setValue('assignment-owner-input', item?.owner || '');
  setValue('assignment-priority-input', item?.priority || '');
  setValue('assignment-effort-input', item?.effort || '');
  setValue('assignment-milestone-input', item?.milestone || '');
  setValue('assignment-zone-input', item?.zone || '');
  setValue('assignment-notes-input', item?.notes || '');
  setText('zoom-readout', `${Math.round(state.zoom * 100)}%`);
}

function renderTabs() {
  const target = byId('assignment-tabs');
  if (!target) return;
  target.innerHTML = FILTERS.map((filter) => `<button type="button" data-filter="${filter}" class="${filter === state.filter ? 'active' : ''}">${filter}</button>`).join('');
  target.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => { state.filter = button.dataset.filter; render(); }));
}

function renderTemplates() {
  const target = byId('template-list');
  if (!target || target.dataset.ready) return;
  target.dataset.ready = 'true';
  target.innerHTML = TEMPLATES.map((template, index) => `<button type="button" data-template="${index}"><strong>${escapeHtml(MODULES[template.primaryModule].label)}</strong><br><small>${escapeHtml(template.title)}</small></button>`).join('');
  target.querySelectorAll('[data-template]').forEach((button) => button.addEventListener('click', () => { addAssignment(TEMPLATES[Number(button.dataset.template)]); closeMenus(); render(); toast('Template assignment added.'); }));
}

function renderList() {
  const target = byId('assignment-list');
  if (!target) return;
  target.innerHTML = '';
  visibleAssignments().forEach((item) => {
    const realIndex = state.assignments.indexOf(item);
    const module = MODULES[item.primaryModule] || MODULES.unassigned;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `assignment-item ${realIndex === state.active ? 'selected' : ''}`;
    button.style.setProperty('--assignment-accent', module.color);
    button.style.setProperty('--assignment-accent-soft', module.soft);
    button.innerHTML = `<span class="assignment-icon">${escapeHtml(item.icon)}</span><span class="assignment-main"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(module.label)} · ${escapeHtml(item.state)} · P${item.priority} · E${item.effort}</span></span><span class="assignment-progress">${completion(item)}%</span>`;
    button.addEventListener('click', () => { state.active = realIndex; render(); });
    button.addEventListener('dblclick', showDetail);
    target.appendChild(button);
  });
}

function renderSubtasks() {
  const target = byId('subtask-list');
  const item = activeAssignment();
  if (!target) return;
  if (!item) { target.innerHTML = '<p class="empty-note">Select an assignment to edit subtasks.</p>'; return; }
  if (!item.subtasks.length) { target.innerHTML = '<p class="empty-note">No subtasks yet.</p>'; return; }
  target.innerHTML = '';
  item.subtasks.forEach((task) => {
    const row = document.createElement('article');
    row.className = `subtask-row ${task.status}`;
    row.innerHTML = `<div><strong>${escapeHtml(task.text)}</strong><span>${escapeHtml(task.status)}</span></div><div class="subtask-actions"></div>`;
    const actions = row.querySelector('.subtask-actions');
    ['open', 'complete', 'confirmed', 'blocked', 'not-needed'].forEach((status) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = status === 'not-needed' ? 'skip' : status;
      btn.addEventListener('click', () => { task.status = status; item.updatedAt = new Date().toISOString(); render(); });
      actions.appendChild(btn);
    });
    target.appendChild(row);
  });
}

function renderCanvas() {
  const canvas = byId('module-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#050405';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff0ce';
  ctx.font = '700 28px Georgia, serif';
  ctx.fillText('Creation Guide', 44, 58);
  ctx.fillStyle = '#c7b8ff';
  ctx.font = '600 15px Arial, sans-serif';
  ctx.fillText(`${state.assignments.length} assignments · ${state.filter} · ${state.sort}`, 44, 88);
  visibleAssignments().slice(0, 8).forEach((item, i) => {
    const module = MODULES[item.primaryModule] || MODULES.unassigned;
    const x = 44 + (i % 4) * 295;
    const y = 130 + Math.floor(i / 4) * 155;
    roundRect(ctx, x, y, 260, 125, 18);
    ctx.fillStyle = '#171210';
    ctx.fill();
    ctx.strokeStyle = module.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = module.color;
    ctx.fillRect(x, y, 8, 125);
    ctx.fillStyle = '#fff0ce';
    ctx.font = '700 14px Arial, sans-serif';
    ctx.fillText(truncate(item.title, 28), x + 22, y + 30);
    ctx.fillStyle = module.color;
    ctx.font = '600 11px Arial, sans-serif';
    ctx.fillText(module.label, x + 22, y + 54);
    ctx.fillStyle = '#d9c3ac';
    ctx.fillText(`${item.state} · P${item.priority} · E${item.effort}`, x + 22, y + 76);
    ctx.fillStyle = '#2f261f';
    ctx.fillRect(x + 22, y + 102, 210, 7);
    ctx.fillStyle = module.color;
    ctx.fillRect(x + 22, y + 102, Math.max(4, 210 * completion(item) / 100), 7);
  });
}

function populateSelects() {
  const moduleInput = byId('assignment-module-input');
  if (moduleInput) moduleInput.innerHTML = Object.entries(MODULES).map(([key, module]) => `<option value="${key}">${module.label}</option>`).join('');
  const stateInput = byId('assignment-state-input');
  if (stateInput) stateInput.innerHTML = STATES.map((item) => `<option value="${item}">${item}</option>`).join('');
}

function wireInputs() {
  bind('game-title-input', (value) => state.setup.gameTitle = value || 'Untitled Artifex Adventure');
  bind('creator-input', (value) => state.setup.creatorName = value);
  bind('project-folder-input', (value) => state.setup.projectFolder = value);
  bind('starting-character-input', (value) => state.setup.startingCharacter = value || 'Mel');
  bind('build-target-input', (value) => state.setup.buildTarget = value);
  bind('assignment-title-input', (value) => activeAssignment() && (activeAssignment().title = value || 'New Assignment'));
  bind('assignment-module-input', (value) => { const item = activeAssignment(); if (item) { item.primaryModule = value; item.icon = MODULES[value].icon; } });
  bind('assignment-state-input', (value) => activeAssignment() && (activeAssignment().state = value));
  bind('assignment-owner-input', (value) => activeAssignment() && (activeAssignment().owner = value));
  bind('assignment-priority-input', (value) => activeAssignment() && (activeAssignment().priority = Math.max(1, Math.min(5, Number(value) || 3))));
  bind('assignment-effort-input', (value) => activeAssignment() && (activeAssignment().effort = Math.max(1, Math.min(5, Number(value) || 3))));
  bind('assignment-milestone-input', (value) => activeAssignment() && (activeAssignment().milestone = value));
  bind('assignment-zone-input', (value) => activeAssignment() && (activeAssignment().zone = value));
  bind('assignment-notes-input', (value) => activeAssignment() && (activeAssignment().notes = value));
}

function wireActions() {
  byId('add-assignment-button')?.addEventListener('click', () => { addAssignment(); closeMenus(); render(); toast('Assignment added.'); });
  byId('duplicate-assignment-button')?.addEventListener('click', () => { const item = activeAssignment(); if (item) { addAssignment(JSON.parse(JSON.stringify(item))); activeAssignment().title += ' Copy'; render(); toast('Assignment duplicated.'); } });
  byId('delete-assignment-button')?.addEventListener('click', () => { if (activeAssignment()) { state.assignments.splice(state.active, 1); state.active = Math.max(0, state.active - 1); render(); toast('Assignment deleted.', 'warn'); } });
  byId('open-detail-button')?.addEventListener('click', showDetail);
  byId('add-subtask-button')?.addEventListener('click', () => { const input = byId('subtask-text-input'); const item = activeAssignment(); if (input?.value.trim() && item) { item.subtasks.push({ id: `subtask_${Math.random().toString(36).slice(2, 9)}`, text: input.value.trim(), status: 'open' }); input.value = ''; render(); } });
  byId('todo-sort-input')?.addEventListener('change', (event) => { state.sort = event.target.value; render(); });
  byId('zoom-in-button')?.addEventListener('click', () => { state.zoom = Math.min(2, state.zoom + .1); setZoom(); });
  byId('zoom-out-button')?.addEventListener('click', () => { state.zoom = Math.max(.5, state.zoom - .1); setZoom(); });
  byId('zoom-reset-button')?.addEventListener('click', () => { state.zoom = 1; setZoom(); });
  byId('export-json-button')?.addEventListener('click', () => download(`${slug(state.setup.gameTitle)}-creation-guide.json`, JSON.stringify(state, null, 2), 'application/json'));
  byId('snapshot-button')?.addEventListener('click', () => { const canvas = byId('module-canvas'); const link = document.createElement('a'); link.href = canvas.toDataURL('image/png'); link.download = 'creation-guide-snapshot.png'; link.click(); });
  byId('quick-start-button')?.addEventListener('click', () => showHelp('Quick Start Guide', '<p>Add assignment cards from Insert, then move them through unassigned, assigned, started, blocked, review, and done.</p><p>The card stripe shows the owning Artifex app. Workflow state is separate.</p>'));
  byId('about-button')?.addEventListener('click', () => showHelp('About Creation Guide', '<p>Creation Guide is the assignment planner, production dashboard, checklist, milestone tracker, and health-check surface for Artifex.</p>'));
}

function wireMenus() {
  document.querySelectorAll('.menu-button').forEach((button) => button.addEventListener('click', (event) => {
    event.stopPropagation();
    const panel = byId(`menu-${button.dataset.menu}`);
    const open = panel?.classList.contains('open');
    closeMenus();
    if (panel && !open) panel.classList.add('open');
  }));
  document.addEventListener('click', closeMenus);
  document.querySelectorAll('.menu-panel').forEach((panel) => panel.addEventListener('click', (event) => event.stopPropagation()));
}

function showDetail() {
  const item = activeAssignment();
  const dialog = byId('assignment-dialog');
  if (!item || !dialog) return;
  const module = MODULES[item.primaryModule] || MODULES.unassigned;
  dialog.style.setProperty('--dialog-accent', module.color);
  setText('assignment-dialog-title', item.title);
  byId('assignment-dialog-body').innerHTML = `<section class="assignment-detail" style="--assignment-accent:${module.color};--assignment-accent-soft:${module.soft}"><div class="detail-badge"><span>${escapeHtml(item.icon)}</span><strong>${escapeHtml(module.label)}</strong></div><p>${escapeHtml(item.notes || 'No notes yet.')}</p><div class="detail-grid"><span>State</span><strong>${escapeHtml(item.state)}</strong><span>Owner</span><strong>${escapeHtml(item.owner || 'Unassigned')}</strong><span>Priority</span><strong>${item.priority}/5</strong><span>Effort</span><strong>${item.effort}/5</strong><span>Milestone</span><strong>${escapeHtml(item.milestone || 'None')}</strong><span>Zone / Scene</span><strong>${escapeHtml(item.zone || 'None')}</strong><span>Progress</span><strong>${completion(item)}%</strong></div><h3>Subtasks</h3><ul>${item.subtasks.map((task) => `<li>${escapeHtml(task.status)} — ${escapeHtml(task.text)}</li>`).join('') || '<li>No subtasks yet.</li>'}</ul></section>`;
  dialog.showModal();
}

function showHelp(title, html) {
  setText('help-dialog-title', title);
  byId('help-dialog-body').innerHTML = html;
  byId('help-dialog').showModal();
}

function setZoom() {
  const canvas = byId('module-canvas');
  if (canvas) canvas.style.transform = `scale(${state.zoom})`;
  setText('zoom-readout', `${Math.round(state.zoom * 100)}%`);
}

function bind(id, handler) {
  byId(id)?.addEventListener('input', (event) => { handler(event.target.value); activeAssignment() && (activeAssignment().updatedAt = new Date().toISOString()); render(); });
}
function closeMenus() { document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open')); }
function injectFallbackStyles() { const style = document.createElement('style'); style.textContent = `body{background:#0f0c0b!important;color:#f2eee9!important}.boot-error{padding:20px;background:#171210;color:#fff0ce}.menu-panel:not(.open){display:none}`; document.head.appendChild(style); }
function toast(message, type = 'success') { const area = byId('toast-area'); if (!area) return; const div = document.createElement('div'); div.className = `toast ${type}`; div.textContent = message; area.appendChild(div); setTimeout(() => div.remove(), 2600); }
function download(filename, content, type) { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type })); link.download = filename; link.click(); URL.revokeObjectURL(link.href); }
function byId(id) { return document.getElementById(id); }
function setText(id, value) { const el = byId(id); if (el) el.textContent = value; }
function setValue(id, value) { const el = byId(id); if (el && el.value !== String(value ?? '')) el.value = value ?? ''; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); }
function slug(value) { return String(value || 'creation-guide').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'creation-guide'; }
function truncate(value, max) { const text = String(value || ''); return text.length > max ? `${text.slice(0, max - 1)}…` : text; }
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
