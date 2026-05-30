const PROJECT_FLOW_VERSION = 'V1.1.12';
const PROJECT_LIBRARY_KEY_FLOW = 'artifex.projectLibrary';
const ACTIVE_PROJECT_KEY_FLOW = 'artifex.activeProjectId';
const HEALTH_ACTIONS_KEY_PREFIX = 'artifex.creationGuide.healthAssignmentsCreated.';
let projectFlowBypassNativeNew = false;
let currentProjectFlowTab = 'new';
let projectFlowInstalled = false;

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    installProjectFlow();
    applyProjectFlowVersion();
  }, 0);
});

function installProjectFlow() {
  if (projectFlowInstalled) return;
  projectFlowInstalled = true;
  injectProjectFlowStyles();
  polishOverviewToolbar();
  addProjectFlowToolbarButton();
  if (typeof addHealthToolbarButton === 'function') addHealthToolbarButton();
  wireProjectFlowInterceptors();
  if (typeof queueHealthRender === 'function') queueHealthRender();

  const observer = new MutationObserver(() => {
    applyProjectFlowVersion();
    polishOverviewToolbar();
    addProjectFlowToolbarButton();
    if (typeof addHealthToolbarButton === 'function') addHealthToolbarButton();
    if (typeof queueHealthRender === 'function') queueHealthRender();
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

function applyProjectFlowVersion() {
  const badge = document.getElementById('version-badge');
  if (badge && badge.textContent !== PROJECT_FLOW_VERSION) badge.textContent = PROJECT_FLOW_VERSION;
  const wantedTitle = `Artifex Creation Guide ${PROJECT_FLOW_VERSION}`;
  if (document.title !== wantedTitle) document.title = wantedTitle;
}

function polishOverviewToolbar() {
  document.querySelector('.workspace-toolbar .toolbar-title')?.remove();
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
      <header class="project-flow-header"><div><p class="project-flow-eyebrow">Project flow</p><h2>New / Open Project</h2></div><button class="project-flow-close" value="close">×</button></header>
      <div class="project-flow-tabs">
        <button type="button" class="${currentProjectFlowTab === 'new' ? 'active' : ''}" data-project-flow-tab="new">New project</button>
        <button type="button" class="${currentProjectFlowTab === 'open' ? 'active' : ''}" data-project-flow-tab="open">Open existing</button>
      </div>
      ${currentProjectFlowTab === 'new' ? newProjectFlowHtml(suggested) : openProjectFlowHtml(entries)}
    </form>`;
  dialog.querySelectorAll('[data-project-flow-tab]').forEach(button => button.addEventListener('click', () => {
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
  dialog.querySelectorAll('[data-open-project-id]').forEach(button => button.addEventListener('click', () => openProjectFromFlow(button.dataset.openProjectId)));
  updateNewProjectPreview(false);
}

function newProjectFlowHtml(suggested) {
  return `
    <section class="project-flow-body">
      <article class="project-flow-note"><strong>What this does</strong><p>This starts a Blank Starter Project setup. After creating it, connect a real folder and create the starter structure directly there. You can then create optional intake drop folders for source media, or skip that step until later. ZIP export remains backup/fallback.</p></article>
      <div class="project-flow-grid">
        <label>Project name<input id="flow-project-name" value="" placeholder="Forever Bound" /></label>
        <label>Project ID / slug<input id="flow-project-id" value="${safeFlow(suggested)}" placeholder="forever-bound" /></label>
      </div>
      <button type="button" id="flow-use-suggested-slug" class="project-flow-helper">Use suggested slug from project name</button>
      <div class="project-flow-grid">
        <label>Creator / Studio<input id="flow-creator" placeholder="Cinaedvs Studios" /></label>
        <label>Project folder name<input id="flow-local-path" placeholder="Forever-Bound-Game" /></label>
      </div>
      <label class="project-flow-check"><input id="flow-use-github" type="checkbox" /> Use GitHub repo path</label>
      <div class="project-flow-grid">
        <label>GitHub username<input id="flow-github-username" placeholder="cinaedvsstudios" /></label>
        <label>Online path preview<input id="flow-online-path" readonly placeholder="Auto-fills if GitHub is enabled" /></label>
      </div>
      <label>Optional deployed URL<input id="flow-deployed-url" placeholder="https://cinaedvsstudios.github.io/Forever-Bound-Game/" /></label>
      <footer class="project-flow-actions"><button type="button" id="flow-create-project">Create project and start guide</button><button value="close">Cancel</button></footer>
    </section>`;
}

function openProjectFlowHtml(entries) {
  return `
    <section class="project-flow-body">
      <article class="project-flow-note"><strong>Open existing project</strong><p>This selects a project already stored in this browser. Re-authorise its connected project folder if the browser asks for write access again.</p></article>
      <div class="project-flow-list">
        ${entries.length ? entries.map(project => `<button type="button" class="project-flow-project" data-open-project-id="${safeFlow(project.projectId)}"><strong>${safeFlow(project.projectName || project.projectId)}</strong><span>${safeFlow(project.projectId)} · ${safeFlow(project.status || 'setup')} · ${safeFlow(project.lastOpenedAt || project.updatedAt || '')}</span></button>`).join('') : '<p class="project-flow-empty">No saved projects in this browser yet. Create a project first, then click Set Active Project.</p>'}
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
    document.getElementById('game-title-input')?.focus({ preventScroll: true });
    if (typeof queueHealthRender === 'function') queueHealthRender();
  }, 80);
}

function openProjectFromFlow(projectId) {
  const library = readProjectFlowLibrary();
  if (!library[projectId]) return;
  localStorage.setItem(ACTIVE_PROJECT_KEY_FLOW, projectId);
  library[projectId].lastOpenedAt = new Date().toISOString();
  localStorage.setItem(PROJECT_LIBRARY_KEY_FLOW, JSON.stringify(library, null, 2));
  window.location.href = `${window.location.pathname}?fresh=creation-guide-1.1.12-open-${Date.now()}`;
}
