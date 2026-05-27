const PROJECT_FLOW_VERSION = 'V1.1.7';
const PROJECT_LIBRARY_KEY_FLOW = 'artifex.projectLibrary';
const ACTIVE_PROJECT_KEY_FLOW = 'artifex.activeProjectId';
let projectFlowBypassNativeNew = false;
let currentProjectFlowTab = 'new';
let healthRenderQueued = false;
let lastHealthHtml = '';

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    installProjectFlow();
    applyProjectFlowVersion();
  }, 0);
});

function installProjectFlow() {
  injectProjectFlowStyles();
  polishOverviewToolbar();
  addProjectFlowToolbarButton();
  addHealthToolbarButton();
  wireProjectFlowInterceptors();
  queueHealthRender();

  const observer = new MutationObserver(() => {
    applyProjectFlowVersion();
    polishOverviewToolbar();
    addProjectFlowToolbarButton();
    addHealthToolbarButton();
    queueHealthRender();
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

function applyProjectFlowVersion() {
  const badge = document.getElementById('version-badge');
  if (badge && badge.textContent !== PROJECT_FLOW_VERSION) badge.textContent = PROJECT_FLOW_VERSION;
  if (document.title !== `Artifex Creation Guide ${PROJECT_FLOW_VERSION}`) document.title = `Artifex Creation Guide ${PROJECT_FLOW_VERSION}`;
}

function polishOverviewToolbar() {
  const title = document.querySelector('.workspace-toolbar .toolbar-title');
  if (title) title.remove();
  setToolbarButton('set-active-project-button', '✅ Set Active');
  setToolbarButton('export-project-files-button', '📦 Export ZIP');
  setToolbarButton('open-assignments-toolbar-button', '📋 Assignments');
  setToolbarButton('clear-project-data-toolbar-button', '🧹 Clear Test Data');
}

function setToolbarButton(id, text) {
  const button = document.getElementById(id);
  if (button && button.textContent !== text) button.textContent = text;
}

function addProjectFlowToolbarButton() {
  if (document.getElementById('project-flow-toolbar-button')) return;
  const toolbar = document.querySelector('.workspace-toolbar');
  const setActive = document.getElementById('set-active-project-button');
  if (!toolbar || !setActive) return;
  const button = document.createElement('button');
  button.id = 'project-flow-toolbar-button';
  button.type = 'button';
  button.textContent = '🗂️ New / Open';
  button.addEventListener('click', () => showProjectFlow('new'));
  toolbar.insertBefore(button, setActive);
}

function addHealthToolbarButton() {
  if (document.getElementById('project-health-toolbar-button')) return;
  const toolbar = document.querySelector('.workspace-toolbar');
  const assignments = document.getElementById('open-assignments-toolbar-button');
  if (!toolbar || !assignments) return;
  const button = document.createElement('button');
  button.id = 'project-health-toolbar-button';
  button.type = 'button';
  button.textContent = '🩺 Health';
  button.addEventListener('click', () => {
    queueHealthRender();
    setTimeout(() => document.getElementById('project-health-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 40);
  });
  toolbar.insertBefore(button, assignments.nextSibling);
}

function wireProjectFlowInterceptors() {
  const interceptNew = (event) => {
    if (projectFlowBypassNativeNew) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showProjectFlow('new');
  };
  const interceptOpen = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    showProjectFlow('open');
  };

  document.getElementById('new-guide-button')?.addEventListener('click', interceptNew, true);
  document.getElementById('view-local-button')?.addEventListener('click', interceptOpen, true);
  document.getElementById('open-project-library-button')?.addEventListener('click', interceptOpen, true);
}

function showProjectFlow(tab = 'new') {
  currentProjectFlowTab = tab;
  const dialog = ensureProjectFlowDialog();
  renderProjectFlowDialog();
  if (!dialog.open) dialog.showModal();
}

function ensureProjectFlowDialog() {
  let dialog = document.getElementById('project-flow-dialog');
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.id = 'project-flow-dialog';
  dialog.className = 'project-flow-dialog';
  document.body.appendChild(dialog);
  return dialog;
}

function renderProjectFlowDialog() {
  const dialog = ensureProjectFlowDialog();
  const library = readProjectFlowLibrary();
  const entries = Object.values(library).sort((a, b) => String(b.lastOpenedAt || b.updatedAt || '').localeCompare(String(a.lastOpenedAt || a.updatedAt || '')));
  const projectName = document.getElementById('game-title-input')?.value || 'Untitled Artifex Adventure';
  const suggested = slugFlow(projectName === 'Untitled Artifex Adventure' ? '' : projectName);

  dialog.innerHTML = `
    <form method="dialog" class="project-flow-shell">
      <header class="project-flow-header">
        <div>
          <p class="project-flow-eyebrow">Project flow</p>
          <h2>New / Open Project</h2>
        </div>
        <button class="project-flow-close" value="close">×</button>
      </header>
      <div class="project-flow-tabs">
        <button type="button" class="${currentProjectFlowTab === 'new' ? 'active' : ''}" data-project-flow-tab="new">New project</button>
        <button type="button" class="${currentProjectFlowTab === 'open' ? 'active' : ''}" data-project-flow-tab="open">Open existing</button>
      </div>
      ${currentProjectFlowTab === 'new' ? newProjectFlowHtml(suggested) : openProjectFlowHtml(entries)}
    </form>`;

  dialog.querySelectorAll('[data-project-flow-tab]').forEach((button) => button.addEventListener('click', () => {
    currentProjectFlowTab = button.dataset.projectFlowTab;
    renderProjectFlowDialog();
  }));

  dialog.querySelector('#flow-project-name')?.addEventListener('input', () => updateNewProjectPreview());
  dialog.querySelector('#flow-project-id')?.addEventListener('input', () => updateNewProjectPreview(false));
  dialog.querySelector('#flow-use-suggested-slug')?.addEventListener('click', () => {
    const name = dialog.querySelector('#flow-project-name')?.value || '';
    dialog.querySelector('#flow-project-id').value = slugFlow(name);
    updateNewProjectPreview(false);
  });
  dialog.querySelector('#flow-use-github')?.addEventListener('change', updateNewProjectPreview);
  dialog.querySelector('#flow-github-username')?.addEventListener('input', updateNewProjectPreview);
  dialog.querySelector('#flow-create-project')?.addEventListener('click', createProjectFromFlow);
  dialog.querySelectorAll('[data-open-project-id]').forEach((button) => button.addEventListener('click', () => openProjectFromFlow(button.dataset.openProjectId)));
  dialog.querySelector('#flow-open-current-library')?.addEventListener('click', () => {
    dialog.close();
    document.getElementById('open-project-library-button')?.click();
  });

  updateNewProjectPreview(false);
}

function newProjectFlowHtml(suggested) {
  return `
    <section class="project-flow-body">
      <article class="project-flow-note">
        <strong>What this does</strong>
        <p>This starts a clean project setup instead of instantly wiping the current screen. After creating it, the guide opens the left panel and takes you through the fields.</p>
      </article>
      <div class="project-flow-grid">
        <label>Project name<input id="flow-project-name" value="" placeholder="Forever Bound" /></label>
        <label>Project ID / slug<input id="flow-project-id" value="${safeFlow(suggested)}" placeholder="forever-bound" /></label>
      </div>
      <button type="button" id="flow-use-suggested-slug" class="project-flow-helper">Use suggested slug from project name</button>
      <div class="project-flow-grid">
        <label>Creator / Studio<input id="flow-creator" placeholder="Cinaedvs Studios" /></label>
        <label>Local folder / planned path<input id="flow-local-path" placeholder="Forever-Bound-Game" /></label>
      </div>
      <label class="project-flow-check"><input id="flow-use-github" type="checkbox" /> Use GitHub repo path</label>
      <div class="project-flow-grid">
        <label>GitHub username<input id="flow-github-username" placeholder="cinaedvsstudios" /></label>
        <label>Online path preview<input id="flow-online-path" readonly placeholder="Auto-fills if GitHub is enabled" /></label>
      </div>
      <label>Optional deployed URL<input id="flow-deployed-url" placeholder="https://cinaedvsstudios.github.io/Forever-Bound-Game/" /></label>
      <footer class="project-flow-actions">
        <button type="button" id="flow-create-project">Create project and start guide</button>
        <button value="close">Cancel</button>
      </footer>
    </section>`;
}

function openProjectFlowHtml(entries) {
  return `
    <section class="project-flow-body">
      <article class="project-flow-note">
        <strong>Open existing project</strong>
        <p>This sets the selected project as <code>artifex.activeProjectId</code> and reloads the page, so the Creation Guide opens into that project cleanly.</p>
      </article>
      <div class="project-flow-list">
        ${entries.length ? entries.map((project) => `
          <button type="button" class="project-flow-project" data-open-project-id="${safeFlow(project.projectId)}">
            <strong>${safeFlow(project.projectName || project.projectId)}</strong>
            <span>${safeFlow(project.projectId)} · ${safeFlow(project.status || 'setup')} · ${safeFlow(project.lastOpenedAt || project.updatedAt || '')}</span>
          </button>`).join('') : '<p class="project-flow-empty">No saved projects in this browser yet. Create a project first, then click Set Active Project.</p>'}
      </div>
    </section>`;
}

function updateNewProjectPreview(autoSlug = true) {
  const dialog = document.getElementById('project-flow-dialog');
  if (!dialog) return;
  const nameInput = dialog.querySelector('#flow-project-name');
  const idInput = dialog.querySelector('#flow-project-id');
  const githubInput = dialog.querySelector('#flow-github-username');
  const onlineInput = dialog.querySelector('#flow-online-path');
  const useGithub = dialog.querySelector('#flow-use-github')?.checked;
  if (autoSlug && nameInput && idInput && !idInput.value.trim()) idInput.value = slugFlow(nameInput.value);
  if (onlineInput) onlineInput.value = useGithub && githubInput?.value && idInput?.value ? `https://github.com/${githubInput.value.trim()}/${slugFlow(idInput.value)}` : '';
}

function createProjectFromFlow() {
  const dialog = document.getElementById('project-flow-dialog');
  if (!dialog) return;

  const projectName = dialog.querySelector('#flow-project-name')?.value.trim() || 'Untitled Artifex Adventure';
  const projectId = slugFlow(dialog.querySelector('#flow-project-id')?.value || projectName);
  const creator = dialog.querySelector('#flow-creator')?.value.trim() || '';
  const localPath = dialog.querySelector('#flow-local-path')?.value.trim() || '';
  const useGithub = Boolean(dialog.querySelector('#flow-use-github')?.checked);
  const githubUsername = dialog.querySelector('#flow-github-username')?.value.trim() || '';
  const onlinePath = dialog.querySelector('#flow-online-path')?.value.trim() || '';
  const deployedUrl = dialog.querySelector('#flow-deployed-url')?.value.trim() || '';

  dialog.close();
  projectFlowBypassNativeNew = true;
  document.getElementById('new-guide-button')?.click();
  projectFlowBypassNativeNew = false;

  setTimeout(() => {
    setFlowField('game-title-input', projectName);
    setFlowField('project-id-input', projectId);
    setFlowField('creator-input', creator);
    setFlowField('project-folder-input', localPath);
    setFlowField('github-username-input', githubUsername);
    setFlowCheckbox('use-github-input', useGithub);
    setFlowField('online-path-input', onlinePath);
    setFlowField('deployed-url-input', deployedUrl);
    document.getElementById('left-panel')?.classList.remove('collapsed');
    if (typeof startSetupGuide === 'function') startSetupGuide();
    const projectNameField = document.getElementById('game-title-input');
    projectNameField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    projectNameField?.focus({ preventScroll: true });
    queueHealthRender();
  }, 80);
}

function openProjectFromFlow(projectId) {
  const library = readProjectFlowLibrary();
  if (!library[projectId]) return;
  localStorage.setItem(ACTIVE_PROJECT_KEY_FLOW, projectId);
  library[projectId].lastOpenedAt = new Date().toISOString();
  localStorage.setItem(PROJECT_LIBRARY_KEY_FLOW, JSON.stringify(library, null, 2));
  window.location.href = `${window.location.pathname}?fresh=creation-guide-1.1.7-open-${Date.now()}`;
}

function setFlowField(id, value) {
  const field = document.getElementById(id);
  if (!field) return;
  field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

function setFlowCheckbox(id, checked) {
  const field = document.getElementById(id);
  if (!field) return;
  field.checked = checked;
  field.dispatchEvent(new Event('change', { bubbles: true }));
}

function readProjectFlowLibrary() {
  try { return JSON.parse(localStorage.getItem(PROJECT_LIBRARY_KEY_FLOW) || '{}') || {}; }
  catch { return {}; }
}

function queueHealthRender() {
  if (healthRenderQueued) return;
  healthRenderQueued = true;
  setTimeout(() => {
    healthRenderQueued = false;
    renderProjectHealthPanel();
  }, 80);
}

function renderProjectHealthPanel() {
  const panel = document.getElementById('project-overview-panel');
  if (!panel) return;
  const checks = getProjectHealthChecks();
  const blocking = checks.filter(check => check.weight > 0);
  const ready = blocking.filter(check => check.state === 'ready').length;
  const percent = blocking.length ? Math.round((ready / blocking.length) * 100) : 0;
  const critical = checks.filter(check => check.state === 'missing' && check.weight > 0).length;
  const warnings = checks.filter(check => check.state === 'warning').length;
  const healthState = critical ? 'Needs setup' : warnings ? 'Ready with notes' : 'Ready';
  const activeName = getCurrentProjectNameForHealth();

  const html = `
    <section id="project-health-panel" class="project-health-panel">
      <header class="project-health-header">
        <div>
          <p>Project readiness</p>
          <h2>🩺 Health Check</h2>
          <span>${safeFlow(activeName)} · ${healthState}</span>
        </div>
        <div class="project-health-score ${critical ? 'missing' : warnings ? 'warning' : 'ready'}">
          <strong>${percent}%</strong>
          <small>${ready}/${blocking.length} required</small>
        </div>
      </header>
      <div class="project-health-summary">
        <span class="ready">✅ ${ready} ready</span>
        <span class="missing">⚠️ ${critical} required missing</span>
        <span class="warning">⭕ ${warnings} optional notes</span>
      </div>
      <div class="project-health-grid">
        ${checks.map(renderHealthCheckCard).join('')}
      </div>
      <footer class="project-health-footer">
        This panel is a Creation Guide readiness view. The deeper cross-app project loading work is now tracked globally in <code>todo_all_apps_active_project_runtime_integration</code>.
      </footer>
    </section>`;

  let existing = document.getElementById('project-health-panel');
  if (!existing) {
    existing = document.createElement('section');
    existing.id = 'project-health-panel';
    panel.appendChild(existing);
  }
  if (html !== lastHealthHtml || existing.className !== 'project-health-panel') {
    lastHealthHtml = html;
    existing.outerHTML = html;
  }
}

function renderHealthCheckCard(check) {
  const icons = { ready: '✅', missing: '⚠️', warning: '⭕' };
  return `
    <article class="project-health-card ${check.state}">
      <strong>${icons[check.state] || '•'} ${safeFlow(check.title)}</strong>
      <p>${safeFlow(check.description)}</p>
      <small>${safeFlow(check.owner)}</small>
    </article>`;
}

function getProjectHealthChecks() {
  const projectName = valueFlow('game-title-input');
  const projectId = valueFlow('project-id-input');
  const creator = valueFlow('creator-input');
  const localPath = valueFlow('project-folder-input');
  const onlinePath = valueFlow('online-path-input');
  const deployedUrl = valueFlow('deployed-url-input');
  const useGithub = Boolean(document.getElementById('use-github-input')?.checked);
  const library = readProjectFlowLibrary();
  const activeId = localStorage.getItem(ACTIVE_PROJECT_KEY_FLOW);
  const gatesComplete = ['project-index', 'folders', 'manifest', 'flatplan', 'indexes'].every(id => document.querySelector(`[data-gate="${id}"]`)?.classList.contains('complete'));
  const assignmentText = document.getElementById('assignment-count')?.textContent || '';
  const assignmentCount = Number((assignmentText.match(/\d+/) || ['0'])[0]);

  return [
    {
      title: 'Project identity',
      state: projectName && projectName !== 'Untitled Artifex Adventure' && validSlugFlow(projectId) ? 'ready' : 'missing',
      description: projectName && validSlugFlow(projectId) ? `${projectName} / ${projectId}` : 'Set a proper project name and safe project ID slug.',
      owner: 'Creation Guide',
      weight: 1
    },
    {
      title: 'Creator metadata',
      state: creator ? 'ready' : 'warning',
      description: creator ? creator : 'Creator/studio is useful for exported README and project metadata.',
      owner: 'Creation Guide',
      weight: 0
    },
    {
      title: 'Local project folder',
      state: localPath ? 'ready' : 'missing',
      description: localPath || 'Choose or type where the starter project folder will be unzipped.',
      owner: 'Creation Guide',
      weight: 1
    },
    {
      title: 'GitHub repo path',
      state: !useGithub ? 'warning' : validUrlFlow(onlinePath) ? 'ready' : 'missing',
      description: !useGithub ? 'Optional: not using GitHub for this project yet.' : validUrlFlow(onlinePath) ? onlinePath : 'Use GitHub is enabled, but the repo URL is missing or invalid.',
      owner: 'Creation Guide / Hub',
      weight: useGithub ? 1 : 0
    },
    {
      title: 'Deployed URL',
      state: !deployedUrl ? 'warning' : validUrlFlow(deployedUrl) ? 'ready' : 'missing',
      description: deployedUrl ? deployedUrl : 'Optional: add a GitHub Pages/live URL later.',
      owner: 'Build Game later',
      weight: deployedUrl ? 1 : 0
    },
    {
      title: 'Starter files exported',
      state: gatesComplete ? 'ready' : 'missing',
      description: gatesComplete ? 'Primary index, folders, manifest, flatplan, and indexes are marked complete.' : 'Export Project Folder ZIP has not completed all required setup gates yet.',
      owner: 'Creation Guide',
      weight: 1
    },
    {
      title: 'Active project saved',
      state: projectId && activeId === projectId && library[projectId] ? 'ready' : 'missing',
      description: projectId && activeId === projectId && library[projectId] ? `${projectId} is active in the Project Library.` : 'Click Set Active Project so Hub and apps know which project to open.',
      owner: 'Creation Guide / Hub',
      weight: 1
    },
    {
      title: 'Assignments started',
      state: assignmentCount > 0 ? 'ready' : 'warning',
      description: assignmentCount > 0 ? `${assignmentCount} assignment records are available.` : 'No assignments are visible yet. Add starter assignments when setup is stable.',
      owner: 'Creation Guide',
      weight: 0
    },
    {
      title: 'Cross-app project loading',
      state: 'warning',
      description: 'Global task added: other apps must map the active project into their real internal state, not just show the pill.',
      owner: 'All app owners',
      weight: 0
    }
  ];
}

function getCurrentProjectNameForHealth() {
  const projectName = valueFlow('game-title-input');
  const projectId = valueFlow('project-id-input');
  return projectName || projectId || 'Untitled Artifex Adventure';
}

function valueFlow(id) {
  return String(document.getElementById(id)?.value || '').trim();
}

function validSlugFlow(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ''));
}

function validUrlFlow(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function slugFlow(value) {
  return String(value || 'untitled-artifex-adventure').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'untitled-artifex-adventure';
}

function safeFlow(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function injectProjectFlowStyles() {
  if (document.getElementById('project-flow-style')) return;
  const style = document.createElement('style');
  style.id = 'project-flow-style';
  style.textContent = `
    .workspace-toolbar { gap: 7px; }
    .workspace-toolbar button, .workspace-toolbar select { font-size: 11px !important; padding: 6px 10px !important; min-height: 30px; white-space: nowrap; }
    .workspace-toolbar #status-text { font-size: 11px; }
    .project-flow-dialog { width: min(860px, calc(100vw - 32px)); max-height: min(86vh, 820px); border: 1px solid rgba(143,109,255,.48); border-radius: 26px; padding: 0; color: #f2eee9; background: linear-gradient(145deg, rgba(32,23,34,.98), rgba(14,10,9,.98)); box-shadow: 0 24px 80px rgba(0,0,0,.88), 0 0 44px rgba(143,109,255,.34); }
    .project-flow-dialog::backdrop { background: rgba(0,0,0,.66); }
    .project-flow-shell { padding: 22px; }
    .project-flow-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; border-bottom: 1px solid rgba(226,204,167,.16); padding-bottom: 14px; margin-bottom: 14px; }
    .project-flow-eyebrow { margin: 0; color: #c7b8ff; font-size: 10px; text-transform: uppercase; letter-spacing: .16em; font-weight: 900; }
    .project-flow-header h2 { margin: 4px 0 0; color: #fff0ce; font-family: Cinzel, Georgia, serif; font-size: clamp(24px, 3vw, 36px); letter-spacing: .06em; }
    .project-flow-close { border-radius: 999px; }
    .project-flow-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
    .project-flow-tabs button { border-radius: 999px; }
    .project-flow-tabs button.active { border-color: #8f6dff; color: white; background: rgba(143,109,255,.22); box-shadow: 0 0 18px rgba(143,109,255,.38); }
    .project-flow-body { display: grid; gap: 12px; }
    .project-flow-note { padding: 13px; border: 1px solid rgba(226,204,167,.18); border-radius: 16px; background: rgba(15,12,11,.48); }
    .project-flow-note strong { color: #fff0ce; text-transform: uppercase; letter-spacing: .1em; font-size: 11px; }
    .project-flow-note p { margin: 6px 0 0; color: #e2cca7; line-height: 1.45; }
    .project-flow-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .project-flow-body label { margin: 0; }
    .project-flow-helper { justify-self: start; font-size: 11px; }
    .project-flow-check { display: flex; align-items: center; gap: 9px; }
    .project-flow-check input { width: auto; }
    .project-flow-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 9px; margin-top: 4px; }
    .project-flow-list { display: grid; gap: 9px; max-height: 46vh; overflow: auto; padding-right: 4px; }
    .project-flow-project { text-align: left; display: grid; gap: 4px; }
    .project-flow-project strong { color: #fff0ce; }
    .project-flow-project span, .project-flow-empty { color: #8a7465; font-size: 12px; }
    .project-health-panel { margin: 18px 0 0; padding: 18px; border: 1px solid rgba(143,109,255,.38); border-radius: 24px; background: linear-gradient(135deg, rgba(26,18,29,.92), rgba(15,10,9,.88)); box-shadow: 0 18px 48px rgba(0,0,0,.42), inset 0 0 32px rgba(143,109,255,.08); }
    .project-health-header { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin-bottom: 12px; }
    .project-health-header p { margin: 0 0 4px; color: #c7b8ff; font-size: 10px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; }
    .project-health-header h2 { margin: 0; color: #fff0ce; font-family: Cinzel, Georgia, serif; letter-spacing: .08em; font-size: clamp(20px, 2.2vw, 30px); }
    .project-health-header span { display: block; margin-top: 4px; color: #a98f72; font-size: 12px; }
    .project-health-score { width: 104px; height: 104px; border-radius: 999px; display: grid; place-items: center; align-content: center; border: 10px solid rgba(80,64,52,.72); background: rgba(8,5,7,.72); box-shadow: 0 0 28px rgba(143,109,255,.25); text-align: center; }
    .project-health-score.ready { border-color: rgba(67,211,111,.78); }
    .project-health-score.warning { border-color: rgba(217,164,65,.78); }
    .project-health-score.missing { border-color: rgba(217,74,74,.78); }
    .project-health-score strong { color: #fff0ce; font-size: 25px; font-family: Cinzel, Georgia, serif; }
    .project-health-score small { color: #a98f72; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; }
    .project-health-summary { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 12px; }
    .project-health-summary span { padding: 5px 9px; border-radius: 999px; background: rgba(15,12,11,.55); border: 1px solid rgba(226,204,167,.16); font-size: 11px; font-weight: 800; }
    .project-health-summary .ready { color: #9af0ff; }
    .project-health-summary .missing { color: #ff9a9a; }
    .project-health-summary .warning { color: #d9a441; }
    .project-health-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; }
    .project-health-card { padding: 12px; border-radius: 16px; border: 1px solid rgba(226,204,167,.14); background: rgba(15,12,11,.46); }
    .project-health-card.ready { border-color: rgba(67,211,111,.35); }
    .project-health-card.missing { border-color: rgba(217,74,74,.45); }
    .project-health-card.warning { border-color: rgba(217,164,65,.38); }
    .project-health-card strong { display: block; color: #fff0ce; font-size: 12px; }
    .project-health-card p { margin: 7px 0; color: #f2eee9; font-size: 12px; line-height: 1.45; }
    .project-health-card small { color: #a98f72; font-size: 10px; text-transform: uppercase; letter-spacing: .1em; }
    .project-health-footer { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(226,204,167,.12); color: #a98f72; font-size: 11px; line-height: 1.45; }
    .project-health-footer code { color: #c7b8ff; }
    @media (max-width: 760px) { .project-flow-grid { grid-template-columns: 1fr; } .project-flow-actions { justify-content: flex-start; } .project-health-header { align-items: flex-start; flex-direction: column; } .project-health-score { width: 88px; height: 88px; } }
  `;
  document.head.appendChild(style);
}
