const VERSION = 'V1.1.12';
const PROJECT_LIBRARY_KEY = 'artifex.projectLibrary';
const ACTIVE_PROJECT_KEY = 'artifex.activeProjectId';

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
const STRUCTURAL_GATES = ['project-index', 'folders', 'logic', 'layout', 'indexes'];

const SETUP_GATES = [
  { id: 'identity', icon: '🪪', title: 'Define Project Identity', description: 'Project name, ID, creator, version, template, and description.' },
  { id: 'storage', icon: '📁', title: 'Connect Project Folder', description: 'Connect or re-authorise the real writable project root folder.' },
  { id: 'project-index', icon: '🧭', title: 'Create Primary Project File', description: 'Create project.json as the top-level pointer file.' },
  { id: 'folders', icon: '🗃️', title: 'Create Folder Structure', description: 'Create the starter project, asset, build, health, backup and todo folders.' },
  { id: 'logic', icon: '📜', title: 'Create Logic Shell', description: 'Create logic.json for starter structure and route logic.' },
  { id: 'layout', icon: '🕸️', title: 'Create Layout Shell', description: 'Create layout.json for editor layout and map placement state.' },
  { id: 'indexes', icon: '📚', title: 'Create Index Files', description: 'Create scene, screen, quest, sidequest, puzzle, archetype and asset indexes.' },
  { id: 'modules', icon: '🧰', title: 'Choose Enabled Modules', description: 'Confirm which Artifex apps are active for this project.' },
  { id: 'active-project', icon: '⭐', title: 'Set Active Project', description: 'Save the project to Project Library and make all apps open into it.' },
  { id: 'readiness', icon: '✅', title: 'Run Project Readiness Check', description: 'Confirm the project has enough structure to start production.' }
];

const TEMPLATES = [
  { title: 'Create First Forest Scene', primaryModule: 'scene-editor', state: 'unassigned', owner: '', priority: 4, effort: 3, milestone: 'First Playable', zone: 'forest / first route', notes: 'Build the first playable scene shell and confirm it can be tested.', subtasks: ['Add background or placeholder', 'Place Mel start position', 'Add at least one exit', 'Place one searchable cache', 'Test scene JSON import'] },
  { title: 'Define First Calling Completion Condition', primaryModule: 'quest-builder', state: 'unassigned', owner: '', priority: 5, effort: 2, milestone: 'First Quest', zone: 'Chronicle 0 / Quest 0', notes: 'Create the first clear completion condition for a Quest or Calling.', subtasks: ['Write Calling text', 'Define final completion flag', 'Add Codice update note', 'Confirm Calling Fulfilled text'] },
  { title: 'Connect First Route on Flatplan', primaryModule: 'project-editor', state: 'unassigned', owner: '', priority: 5, effort: 3, milestone: 'First Route', zone: 'Flatplan', notes: 'Place the first playable route into the project structure.', subtasks: ['Add start screen to Flatplan', 'Add first route screen', 'Connect route to endpoint', 'Confirm playable path'] },
  { title: 'Create Searchable Cache Object', primaryModule: 'object-creator', state: 'unassigned', owner: '', priority: 4, effort: 2, milestone: 'First Interaction', zone: 'starter scene', notes: 'Define a reusable object archetype for scavenging and rewards.', subtasks: ['Choose object type', 'Set interaction name', 'Set reward placeholder', 'Confirm icon and category'] },
  { title: 'Add Fog Overlay Effect', primaryModule: 'effect-editor', state: 'unassigned', owner: '', priority: 3, effort: 2, milestone: 'First Scene', zone: 'forest', notes: 'Create a reusable atmospheric effect for a scene or gameplay state.', subtasks: ['Create placeholder FX settings', 'Preview on dark and light backgrounds', 'Export effect JSON', 'Link effect to scene assignment'] }
];

const state = {
  project: createProject(),
  assignments: [],
  active: 0,
  filter: 'undone',
  sort: 'easy-wins'
};

window.addEventListener('DOMContentLoaded', () => {
  injectFallbackStyles();
  try { boot(); }
  catch (error) {
    console.error(error);
    document.body.innerHTML = `<main class="boot-error"><h1>Creation Guide failed to start</h1><p>${escapeHtml(error.message || error)}</p></main>`;
  }
});

function boot() {
  setText('module-label', 'Creation Guide');
  setText('version-badge', VERSION);
  loadActiveProject();
  populateSelects();
  wireMenus();
  wireInputs();
  wireActions();
  window.addEventListener('artifex:project-folder-state', () => render());
  if (!state.assignments.length) addAssignment(TEMPLATES[0]);
  render();
  toast(`Creation Guide ${VERSION} loaded.`);
}

function createProject(patch = {}) {
  const now = new Date().toISOString();
  const migratedGates = {
    ...(patch.gates || {})
  };
  if (migratedGates.manifest && !migratedGates.logic) migratedGates.logic = migratedGates.manifest;
  if (migratedGates.flatplan && !migratedGates.layout) migratedGates.layout = migratedGates.flatplan;
  delete migratedGates.manifest;
  delete migratedGates.flatplan;
  return {
    projectId: 'untitled-artifex-adventure',
    projectName: 'Untitled Artifex Adventure',
    status: 'setup',
    version: '0.1.0',
    creatorName: '',
    localProjectPath: '',
    onlineProjectPath: '',
    deployedUrl: '',
    useGithub: false,
    githubUsername: '',
    primaryIndexFile: 'project.json',
    logicFile: 'logic.json',
    layoutFile: 'layout.json',
    registryFile: 'registry.json',
    libraryLinksFile: 'library-links.json',
    inputMapFile: 'input-map.json',
    assetRoot: 'assets/',
    healthRoot: 'health/',
    backupRoot: 'backups/',
    buildRoot: 'build/',
    todosRoot: 'todos/',
    activeChronicleId: 'ch00',
    activeQuestId: 'q00',
    startSceneId: null,
    enabledModules: ['creation-guide', 'project-editor', 'scene-editor', 'quest-builder', 'object-creator', 'effect-editor'],
    gates: {
      ...Object.fromEntries(SETUP_GATES.map((gate) => [gate.id, false])),
      ...migratedGates
    },
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    ...patch,
    logicFile: patch.logicFile || 'logic.json',
    layoutFile: patch.layoutFile || 'layout.json',
    gates: {
      ...Object.fromEntries(SETUP_GATES.map((gate) => [gate.id, false])),
      ...migratedGates
    }
  };
}

function slug(value) { return String(value || 'untitled-artifex-adventure').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'untitled-artifex-adventure'; }
function suggestedSlug() { return slug(state.project.projectName); }
function suggestedGithubUrl() { return state.project.githubUsername ? `https://github.com/${state.project.githubUsername}/${state.project.projectId}` : `https://github.com/new`; }
function activeAssignment() { return state.assignments[state.active] || null; }
function completion(item) { if (!item) return 0; if (item.state === 'done') return 100; if (!item.subtasks.length) return item.state === 'started' ? 25 : item.state === 'review' ? 85 : 0; return Math.round(item.subtasks.filter((task) => ['complete', 'confirmed', 'not-needed'].includes(task.status)).length / item.subtasks.length * 100); }

function isRealProjectName() { return Boolean(state.project.projectName && state.project.projectName !== 'Untitled Artifex Adventure'); }
function hasIdentity() { return Boolean(isRealProjectName() && state.project.projectId && state.project.creatorName); }
function hasConnectedProjectFolder() { return window.ArtifexProjectFolder?.getState?.().folderStatus === 'connected'; }
function hasModules() { return Array.isArray(state.project.enabledModules) && state.project.enabledModules.length > 0; }
function isActiveProjectSaved() { const activeId = localStorage.getItem(ACTIVE_PROJECT_KEY); const library = readProjectLibrary(); return Boolean(activeId && activeId === state.project.projectId && library[state.project.projectId]); }
function requiredGatesWithoutReadinessComplete() { return SETUP_GATES.filter((gate) => gate.id !== 'readiness').every((gate) => gateStatus(gate.id).complete); }

function gateStatus(id) {
  const manual = Boolean(state.project.gates?.[id]);
  if (id === 'identity') return { complete: hasIdentity(), source: 'auto', text: hasIdentity() ? 'Auto-complete: project name, ID, and creator are set.' : 'Needs project name, project ID, and creator.' };
  if (id === 'storage') return { complete: hasConnectedProjectFolder(), source: 'auto', text: hasConnectedProjectFolder() ? 'Project folder is connected.' : 'Connect or re-authorise the writable project folder.' };
  if (id === 'modules') return { complete: hasModules(), source: 'auto', text: hasModules() ? 'Auto-complete: enabled modules are defined.' : 'Needs at least one enabled module.' };
  if (id === 'active-project') return { complete: isActiveProjectSaved(), source: 'auto', text: isActiveProjectSaved() ? 'Active project is saved in Project Library.' : 'Click Set Active Project to save this project.' };
  if (id === 'readiness') return { complete: manual || requiredGatesWithoutReadinessComplete(), source: manual ? 'manual' : 'auto', text: (manual || requiredGatesWithoutReadinessComplete()) ? 'Readiness check passed.' : `Needs: ${missingGateLabels().join(', ') || 'nothing'}.` };
  return { complete: manual, source: 'manual', text: manual ? 'Marked created/exported.' : 'Click when created, or use Export Project Folder ZIP.' };
}

function missingGateLabels() { return SETUP_GATES.filter((gate) => gate.id !== 'readiness' && !gateStatus(gate.id).complete).map((gate) => gate.title.replace(/^Create |^Choose |^Define |^Set /, '')); }
function projectCompletion() { return Math.round(SETUP_GATES.filter((gate) => gateStatus(gate.id).complete).length / SETUP_GATES.length * 100); }
function updateProjectStatusFromGates() { state.project.status = projectCompletion() >= 100 ? 'ready' : projectCompletion() >= 70 ? 'setup-review' : 'setup'; }

function readProjectLibrary() { try { return JSON.parse(localStorage.getItem(PROJECT_LIBRARY_KEY) || '{}') || {}; } catch { return {}; } }
function writeProjectLibrary(library) { localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(library, null, 2)); }
function saveProjectToLibrary(setActive = true) {
  const library = readProjectLibrary();
  state.project.updatedAt = new Date().toISOString();
  state.project.lastOpenedAt = state.project.updatedAt;
  if (setActive) {
    state.project.gates['active-project'] = true;
    localStorage.setItem(ACTIVE_PROJECT_KEY, state.project.projectId);
  }
  updateProjectStatusFromGates();
  library[state.project.projectId] = { ...state.project };
  writeProjectLibrary(library);
  toast(setActive ? 'Saved and set as active project.' : 'Saved to Project Library.');
  render();
}
function loadActiveProject() { const activeId = localStorage.getItem(ACTIVE_PROJECT_KEY); const library = readProjectLibrary(); if (activeId && library[activeId]) state.project = createProject(library[activeId]); }

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
  updateProjectStatusFromGates();
  syncInputs();
  updateFieldStatuses();
  renderProjectOverview();
  window.dispatchEvent(new CustomEvent('creation-guide:overview-rendered'));
  renderTabs();
  renderTemplates();
  renderList();
  renderSubtasks();
  renderCanvas();
  setText('assignment-count', `${state.assignments.length} assignments`);
  setText('status-text', `${state.project.projectName} · ${projectCompletion()}% setup`);
}

function syncInputs() {
  setText('setup-percent', `${projectCompletion()}%`);
  setValue('game-title-input', state.project.projectName);
  setValue('project-id-input', state.project.projectId);
  setValue('creator-input', state.project.creatorName);
  setValue('project-folder-input', state.project.localProjectPath);
  setValue('online-path-input', state.project.onlineProjectPath);
  setValue('deployed-url-input', state.project.deployedUrl);
  setValue('github-username-input', state.project.githubUsername || '');
  const useGithub = byId('use-github-input');
  if (useGithub) useGithub.checked = Boolean(state.project.useGithub);
  setValue('build-target-input', state.project.activeChronicleId === 'ch00' ? 'Chronicle 0' : state.project.activeChronicleId);
  setText('slug-suggestion-text', isRealProjectName() ? `Suggested slug: ${suggestedSlug()}` : 'Suggested slug appears after you type a project name.');
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
}

function fieldState(value, validator = Boolean) {
  if (!value) return { icon: '⭕', cls: 'empty' };
  return validator(value) ? { icon: '✅', cls: 'valid' } : { icon: '⚠️', cls: 'warn' };
}
function setStatus(id, status) { const el = byId(id); if (!el) return; el.textContent = status.icon; el.className = `field-status ${status.cls}`; }
function validSlug(value) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || '')); }
function validUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; } }
function validGithubUsername(value) { return /^[a-zA-Z0-9-]{1,39}$/.test(String(value || '')) && !String(value).startsWith('-') && !String(value).endsWith('-'); }
function validLocalPath(value) { return Boolean(String(value || '').trim()); }
function updateFieldStatuses() {
  setStatus('project-name-status', fieldState(isRealProjectName() ? state.project.projectName : '', Boolean));
  setStatus('project-id-status', fieldState(state.project.projectId, validSlug));
  setStatus('creator-status', fieldState(state.project.creatorName, Boolean));
  setStatus('local-path-status', fieldState(state.project.localProjectPath, validLocalPath));
  setStatus('github-username-status', fieldState(state.project.githubUsername, validGithubUsername));
  setStatus('online-path-status', fieldState(state.project.onlineProjectPath, validUrl));
  setStatus('deployed-url-status', fieldState(state.project.deployedUrl, validUrl));
}

function renderProjectOverview() {
  const target = byId('project-overview-panel');
  if (!target) return;
  const pct = projectCompletion();
  const gatesDone = SETUP_GATES.filter((gate) => gateStatus(gate.id).complete).length;
  target.innerHTML = `
    <section class="project-hero">
      <div>
        <p class="eyebrow">Active Project Overview</p>
        <h2>${escapeHtml(state.project.projectName)}</h2>
        <p>${escapeHtml(state.project.projectId)} · ${escapeHtml(state.project.status)} · ${escapeHtml(state.project.version)}</p>
      </div>
      <div class="setup-ring" style="--p:${pct}"><strong>${pct}%</strong><span>setup</span></div>
    </section>
    <section class="overview-instructions">
      <h3>What this screen is doing</h3>
      <p>First, define the project identity and where it lives. Then use <strong>Project Folder</strong> to connect the real writable project root and click <strong>Create Starter Structure</strong>. Creation Guide writes the canonical blank starter files (<strong>project.json</strong>, <strong>logic.json</strong>, <strong>layout.json</strong>, <strong>registry.json</strong>, <strong>library-links.json</strong>, <strong>input-map.json</strong> and empty library indexes). <strong>Export ZIP</strong> remains a backup/fallback package, then click <strong>Set Active Project</strong> so the Hub and other Artifex apps know which project to open.</p>
    </section>
    <section class="project-facts">
      ${fact('Local file path', state.project.localProjectPath || 'Not set')}
      ${fact('Online file path', state.project.onlineProjectPath || 'Not set')}
      ${fact('Primary index', state.project.primaryIndexFile)}
      ${fact('Logic', state.project.logicFile)}
      ${fact('Layout', state.project.layoutFile)}
      ${fact('Active target', `${state.project.activeChronicleId} / ${state.project.activeQuestId}`)}
    </section>
    <section id="project-folder-setup-mount" class="project-overview-mount" aria-label="Connected Project Folder"></section>
    <section id="initial-asset-intake-mount" class="project-overview-mount" aria-label="Initial Asset Intake Setup"></section>
    <section class="setup-gates-header"><h3>Setup gates</h3><p>${gatesDone}/${SETUP_GATES.length} complete. Identity, connected folder, modules, active project, and readiness can complete automatically.</p></section>
    <section class="setup-gates">
      ${SETUP_GATES.map((gate) => {
        const status = gateStatus(gate.id);
        return `<button type="button" class="setup-gate ${status.complete ? 'complete' : ''} ${status.source}" data-gate="${gate.id}"><span>${gate.icon}</span><strong>${gate.title}</strong><em>${gate.description}<br><small>${escapeHtml(status.text)}</small></em></button>`;
      }).join('')}
    </section>
    <section id="project-health-mount" class="project-overview-mount" aria-label="Health"></section>
  `;
  target.querySelectorAll('[data-gate]').forEach((button) => button.addEventListener('click', () => handleGateClick(button.dataset.gate)));
}
function fact(label, value) { return `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`; }

function handleGateClick(id) {
  if (STRUCTURAL_GATES.includes(id)) {
    state.project.gates[id] = !state.project.gates[id];
    toast(state.project.gates[id] ? 'Setup gate marked created.' : 'Setup gate reopened.', state.project.gates[id] ? 'success' : 'warn');
  } else if (id === 'active-project') {
    saveProjectToLibrary(true);
    return;
  } else if (id === 'readiness') {
    if (requiredGatesWithoutReadinessComplete()) {
      state.project.gates.readiness = true;
      toast('Project readiness check passed.');
    } else {
      state.project.gates.readiness = false;
      toast(`Readiness blocked: ${missingGateLabels().join(', ')}`, 'warn');
    }
  } else {
    if (!gateStatus(id).complete) byId('left-panel')?.classList.remove('collapsed');
    toast(gateStatus(id).text, gateStatus(id).complete ? 'success' : 'warn');
  }
  render();
}

function renderTabs() { const target = byId('assignment-tabs'); if (!target) return; target.innerHTML = FILTERS.map((filter) => `<button type="button" data-filter="${filter}" class="${filter === state.filter ? 'active' : ''}">${filter}</button>`).join(''); target.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => { state.filter = button.dataset.filter; render(); })); }
function renderTemplates() { const target = byId('template-list'); if (!target || target.dataset.ready) return; target.dataset.ready = 'true'; target.innerHTML = TEMPLATES.map((template, index) => `<button type="button" data-template="${index}"><strong>${escapeHtml(MODULES[template.primaryModule].label)}</strong><br><small>${escapeHtml(template.title)}</small></button>`).join(''); target.querySelectorAll('[data-template]').forEach((button) => button.addEventListener('click', () => { addAssignment(TEMPLATES[Number(button.dataset.template)]); closeMenus(); render(); toast('Template assignment added.'); showAssignments(); })); }
function renderList() { const target = byId('assignment-list'); if (!target) return; target.innerHTML = ''; visibleAssignments().forEach((item) => { const realIndex = state.assignments.indexOf(item); const module = MODULES[item.primaryModule] || MODULES.unassigned; const button = document.createElement('button'); button.type = 'button'; button.className = `assignment-item ${realIndex === state.active ? 'selected' : ''}`; button.style.setProperty('--assignment-accent', module.color); button.style.setProperty('--assignment-accent-soft', module.soft); button.innerHTML = `<span class="assignment-icon">${escapeHtml(item.icon)}</span><span class="assignment-main"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(module.label)} · ${escapeHtml(item.state)} · P${item.priority} · E${item.effort}</span></span><span class="assignment-progress">${completion(item)}%</span>`; button.addEventListener('click', () => { state.active = realIndex; render(); }); button.addEventListener('dblclick', showDetail); target.appendChild(button); }); }
function renderSubtasks() { const target = byId('subtask-list'); const item = activeAssignment(); if (!target) return; if (!item) { target.innerHTML = '<p class="empty-note">Select an assignment to edit subtasks.</p>'; return; } if (!item.subtasks.length) { target.innerHTML = '<p class="empty-note">No subtasks yet.</p>'; return; } target.innerHTML = ''; item.subtasks.forEach((task) => { const row = document.createElement('article'); row.className = `subtask-row ${task.status}`; row.innerHTML = `<div><strong>${escapeHtml(task.text)}</strong><span>${escapeHtml(task.status)}</span></div><div class="subtask-actions"></div>`; const actions = row.querySelector('.subtask-actions'); ['open', 'complete', 'confirmed', 'blocked', 'not-needed'].forEach((status) => { const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = status === 'not-needed' ? 'skip' : status; btn.addEventListener('click', () => { task.status = status; item.updatedAt = new Date().toISOString(); render(); }); actions.appendChild(btn); }); target.appendChild(row); }); }
function renderCanvas() { const canvas = byId('module-canvas'); if (!canvas) return; const ctx = canvas.getContext('2d'); const w = canvas.width; const h = canvas.height; ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#050405'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#15100e'; for (let i=0;i<12;i++){ctx.fillRect(i*120,0,1,h);ctx.fillRect(0,i*80,w,1);} }
function populateSelects() { const moduleInput = byId('assignment-module-input'); if (moduleInput) moduleInput.innerHTML = Object.entries(MODULES).map(([key, module]) => `<option value="${key}">${module.label}</option>`).join(''); const stateInput = byId('assignment-state-input'); if (stateInput) stateInput.innerHTML = STATES.map((item) => `<option value="${item}">${item}</option>`).join(''); }

function maybeAutoGithubUrl() { if (state.project.useGithub && state.project.githubUsername && state.project.projectId) state.project.onlineProjectPath = `https://github.com/${state.project.githubUsername}/${state.project.projectId}`; }

function wireInputs() {
  bind('game-title-input', (value) => { state.project.projectName = value || 'Untitled Artifex Adventure'; if (!byId('project-id-input')?.value || state.project.projectId === 'untitled-artifex-adventure') state.project.projectId = suggestedSlug(); maybeAutoGithubUrl(); });
  bind('project-id-input', (value) => { state.project.projectId = slug(value); maybeAutoGithubUrl(); });
  bind('creator-input', (value) => state.project.creatorName = value);
  bind('project-folder-input', (value) => state.project.localProjectPath = value);
  bind('online-path-input', (value) => state.project.onlineProjectPath = value);
  bind('deployed-url-input', (value) => state.project.deployedUrl = value);
  bind('github-username-input', (value) => { state.project.githubUsername = value.trim(); maybeAutoGithubUrl(); });
  byId('use-github-input')?.addEventListener('change', (event) => { state.project.useGithub = event.target.checked; maybeAutoGithubUrl(); render(); });
  bind('build-target-input', (value) => state.project.activeChronicleId = value === 'Chronicle 0' ? 'ch00' : value);
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
  byId('new-guide-button')?.addEventListener('click', () => { state.project = createProject(); state.assignments = []; addAssignment(TEMPLATES[0]); closeMenus(); render(); toast('New project overview created.'); });
  byId('use-suggested-slug-button')?.addEventListener('click', () => { state.project.projectId = suggestedSlug(); maybeAutoGithubUrl(); render(); });
  byId('choose-local-folder-button')?.addEventListener('click', async () => chooseLocalFolder());
  byId('local-folder-picker')?.addEventListener('change', (event) => { const first = event.target.files?.[0]; const root = first?.webkitRelativePath?.split('/')?.[0] || first?.name || ''; if (root) { state.project.localProjectPath = root; render(); toast('Folder selected. Browser only provides the folder name here.'); } });
  byId('open-online-path-button')?.addEventListener('click', () => window.open(state.project.onlineProjectPath || suggestedGithubUrl(), '_blank', 'noopener'));
  byId('check-deployed-url-button')?.addEventListener('click', () => { if (validUrl(state.project.deployedUrl)) window.open(state.project.deployedUrl, '_blank', 'noopener'); else toast('Enter a deployed URL first.', 'warn'); });
  byId('save-local-button')?.addEventListener('click', () => { saveProjectToLibrary(true); closeMenus(); });
  byId('set-active-project-button')?.addEventListener('click', () => saveProjectToLibrary(true));
  byId('export-project-files-button')?.addEventListener('click', exportProjectFiles);
  byId('export-json-button')?.addEventListener('click', () => { exportProjectFiles(); closeMenus(); });
  byId('project-flow-toolbar-button')?.addEventListener('click', () => { if (typeof showProjectFlow === 'function') showProjectFlow('new'); });
  byId('connect-project-folder-toolbar-button')?.addEventListener('click', () => document.getElementById('project-folder-setup-mount')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  byId('project-health-toolbar-button')?.addEventListener('click', () => { if (typeof queueHealthRender === 'function') queueHealthRender(); setTimeout(() => document.getElementById('project-health-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 40); });
  byId('view-local-button')?.addEventListener('click', () => { closeMenus(); if (typeof showProjectFlow === 'function') showProjectFlow('open'); else showProjectLibrary(); });
  byId('open-project-library-button')?.addEventListener('click', () => { if (typeof showProjectFlow === 'function') showProjectFlow('open'); else showProjectLibrary(); });
  byId('toggle-left-panel-button')?.addEventListener('click', toggleLeftPanel);
  byId('side-panel-toggle-button')?.addEventListener('click', toggleLeftPanel);
  byId('add-assignment-button')?.addEventListener('click', () => { addAssignment(); closeMenus(); render(); toast('Assignment added.'); showAssignments(); });
  byId('duplicate-assignment-button')?.addEventListener('click', () => { const item = activeAssignment(); if (item) { addAssignment(JSON.parse(JSON.stringify(item))); activeAssignment().title += ' Copy'; render(); toast('Assignment duplicated.'); showAssignments(); } });
  byId('delete-assignment-button')?.addEventListener('click', () => { if (activeAssignment()) { state.assignments.splice(state.active, 1); state.active = Math.max(0, state.active - 1); render(); toast('Assignment deleted.', 'warn'); } });
  byId('open-detail-button')?.addEventListener('click', showDetail);
  byId('open-detail-menu-button')?.addEventListener('click', () => { closeMenus(); showDetail(); });
  byId('open-assignments-button')?.addEventListener('click', showAssignments);
  byId('open-assignments-menu-button')?.addEventListener('click', () => { closeMenus(); showAssignments(); });
  byId('open-assignments-toolbar-button')?.addEventListener('click', showAssignments);
  byId('add-subtask-button')?.addEventListener('click', () => { const input = byId('subtask-text-input'); const item = activeAssignment(); if (input?.value.trim() && item) { item.subtasks.push({ id: `subtask_${Math.random().toString(36).slice(2, 9)}`, text: input.value.trim(), status: 'open' }); input.value = ''; render(); } });
  byId('todo-sort-input')?.addEventListener('change', (event) => { state.sort = event.target.value; render(); });
  byId('snapshot-button')?.addEventListener('click', () => { const canvas = byId('module-canvas'); const link = document.createElement('a'); link.href = canvas.toDataURL('image/png'); link.download = 'creation-guide-snapshot.png'; link.click(); });
  byId('quick-start-button')?.addEventListener('click', () => showHelp('Quick Start Guide', '<p>Type a project name, use the suggested slug, choose a local folder, and optionally tick Use GitHub to auto-fill the repo URL. Then open Project Folder, connect the writable project root, create the starter structure, and set the project active. Export ZIP is backup/fallback only.</p>'));
  byId('clear-project-data-button')?.addEventListener('click', clearCreationGuideTestData);
  byId('clear-project-data-toolbar-button')?.addEventListener('click', clearCreationGuideTestData);
  byId('about-button')?.addEventListener('click', () => showHelp('About Creation Guide', '<p>Creation Guide creates/selects the active project, tracks setup gates, and then manages assignments for production.</p>'));
}

async function chooseLocalFolder() {
  if ('showDirectoryPicker' in window) {
    try {
      const handle = await window.showDirectoryPicker();
      state.project.localProjectPath = handle.name;
      render();
      toast('Folder selected. Browser security exposes the folder name, not the full path.');
      return;
    } catch (error) {
      if (error?.name !== 'AbortError') toast('Could not open folder picker.', 'warn');
      return;
    }
  }
  byId('local-folder-picker')?.click();
}

function exportProjectFiles() {
  let files;
  try {
    files = buildCanonicalStarterFiles();
  } catch (error) {
    toast(error.message || 'Canonical starter exporter is not available yet.', 'warn');
    return;
  }
  STRUCTURAL_GATES.forEach((gateId) => state.project.gates[gateId] = true);
  updateProjectStatusFromGates();
  if (window.JSZip) exportZipWithLibrary(files);
  else download(`${state.project.projectId}-starter-package.json`, JSON.stringify(files, null, 2), 'application/json');
  render();
  toast('Backup ZIP prepared from the same canonical starter builders used by connected-folder creation. Use Project Folder as the normal saved-data source of truth.');
}

async function exportZipWithLibrary(files) {
  const zip = new JSZip();
  Object.entries(files).forEach(([path, content]) => zip.file(path, content));
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(`${state.project.projectId}-project-folder.zip`, blob);
}

function clearCreationGuideTestData() {
  if (!confirm('Clear Artifex project test data from this browser?')) return;
  localStorage.removeItem(PROJECT_LIBRARY_KEY);
  localStorage.removeItem(ACTIVE_PROJECT_KEY);
  Object.keys(localStorage).filter((key) => key.startsWith('artifex.creationGuide.intakeSetup.') || key.startsWith('artifex.creationGuide.healthAssignmentsCreated.')).forEach((key) => localStorage.removeItem(key));
  location.reload();
}

function buildStarterProjectInput() {
  return {
    gameTitle: state.project.projectName,
    projectName: state.project.projectName,
    projectSlug: state.project.projectId,
    creator: state.project.creatorName,
    version: state.project.version,
    projectLogo: state.project.projectLogo || null,
    enabledModules: state.project.enabledModules
  };
}

function canonicalStructureService() {
  return window.ArtifexProjectStructure || null;
}

function buildCanonicalStarterFiles() {
  const service = canonicalStructureService();
  if (!service?.normalizeProjectInput || !service?.starterFilePackage) {
    throw new Error('Canonical project-structure initializer has not loaded yet.');
  }
  const project = service.normalizeProjectInput(buildStarterProjectInput());
  return Object.fromEntries(Object.entries(service.starterFilePackage(project)).map(([path, value]) => [
    path,
    typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  ]));
}

window.getCreationGuideStarterProjectInput = buildStarterProjectInput;


function showProjectLibrary() { const library = readProjectLibrary(); const target = byId('project-library-list'); if (!target) return; const entries = Object.values(library); target.innerHTML = entries.length ? entries.map((project) => `<button type="button" class="project-library-item" data-project="${escapeHtml(project.projectId)}"><strong>${escapeHtml(project.projectName)}</strong><span>${escapeHtml(project.projectId)} · ${escapeHtml(project.status || 'setup')} · ${escapeHtml(project.lastOpenedAt || '')}</span></button>`).join('') : '<p class="empty-note">No saved projects yet. Use Set Active Project to add one.</p>'; target.querySelectorAll('[data-project]').forEach((button) => button.addEventListener('click', () => { const project = library[button.dataset.project]; if (project) { state.project = createProject(project); localStorage.setItem(ACTIVE_PROJECT_KEY, state.project.projectId); byId('project-library-dialog')?.close(); render(); toast('Active project changed.'); } })); byId('project-library-dialog')?.showModal(); }
function showAssignments() { render(); byId('assignments-dialog')?.showModal(); }
function showDetail() { const item = activeAssignment(); const dialog = byId('assignment-dialog'); if (!item || !dialog) return; const module = MODULES[item.primaryModule] || MODULES.unassigned; dialog.style.setProperty('--dialog-accent', module.color); setText('assignment-dialog-title', item.title); byId('assignment-dialog-body').innerHTML = `<section class="assignment-detail" style="--assignment-accent:${module.color};--assignment-accent-soft:${module.soft}"><div class="detail-badge"><span>${escapeHtml(item.icon)}</span><strong>${escapeHtml(module.label)}</strong></div><p>${escapeHtml(item.notes || 'No notes yet.')}</p><div class="detail-grid"><span>State</span><strong>${escapeHtml(item.state)}</strong><span>Owner</span><strong>${escapeHtml(item.owner || 'Unassigned')}</strong><span>Priority</span><strong>${item.priority}/5</strong><span>Effort</span><strong>${item.effort}/5</strong><span>Milestone</span><strong>${escapeHtml(item.milestone || 'None')}</strong><span>Zone / Scene</span><strong>${escapeHtml(item.zone || 'None')}</strong><span>Progress</span><strong>${completion(item)}%</strong></div><h3>Subtasks</h3><ul>${item.subtasks.map((task) => `<li>${escapeHtml(task.status)} — ${escapeHtml(task.text)}</li>`).join('') || '<li>No subtasks yet.</li>'}</ul></section>`; dialog.showModal(); }
function showHelp(title, html) { setText('help-dialog-title', title); byId('help-dialog-body').innerHTML = html; byId('help-dialog').showModal(); }
function toggleLeftPanel() { byId('left-panel')?.classList.toggle('collapsed'); }

function wireMenus() { document.querySelectorAll('.menu-button').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); const panel = byId(`menu-${button.dataset.menu}`); const open = panel?.classList.contains('open'); closeMenus(); if (panel && !open) panel.classList.add('open'); })); document.addEventListener('click', closeMenus); document.querySelectorAll('.menu-panel').forEach((panel) => panel.addEventListener('click', (event) => event.stopPropagation())); }
function bind(id, handler) { byId(id)?.addEventListener('input', (event) => { handler(event.target.value); state.project.updatedAt = new Date().toISOString(); activeAssignment() && (activeAssignment().updatedAt = new Date().toISOString()); render(); }); }
function closeMenus() { document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open')); }
function injectFallbackStyles() { const style = document.createElement('style'); style.textContent = `body{background:#0f0c0b!important;color:#f2eee9!important}.boot-error{padding:20px;background:#171210;color:#fff0ce}.menu-panel:not(.open){display:none}`; document.head.appendChild(style); }
function toast(message, type = 'success') { const area = byId('toast-area'); if (!area) return; const div = document.createElement('div'); div.className = `toast ${type}`; div.textContent = message; area.appendChild(div); setTimeout(() => div.remove(), 2600); }
function download(filename, content, type) { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type })); link.download = filename; link.click(); URL.revokeObjectURL(link.href); }
function downloadBlob(filename, blob) { const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); URL.revokeObjectURL(link.href); }
function byId(id) { return document.getElementById(id); }
function setText(id, value) { const el = byId(id); if (el) el.textContent = value; }
function setValue(id, value) { const el = byId(id); if (el && el.value !== String(value ?? '')) el.value = value ?? ''; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); }