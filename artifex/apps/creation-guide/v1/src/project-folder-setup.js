const PROJECT_FOLDER_SETUP_VERSION = 'V1.1.11';
let projectFolderSetupObserver = null;
let projectFolderSetupInstalled = false;
let projectFolderStructureWrittenThisSession = false;
let projectFolderStructureCreating = false;

window.addEventListener('DOMContentLoaded', () => window.setTimeout(installProjectFolderSetup, 0));

function installProjectFolderSetup() {
  if (projectFolderSetupInstalled) return;
  projectFolderSetupInstalled = true;
  injectProjectFolderSetupStyles();
  installProjectFolderLegacyControlOverrides();
  addProjectFolderToolbarButton();
  polishProjectFolderFacingLabels();
  renderProjectFolderSetupSection();
  window.addEventListener('artifex:project-folder-state', () => {
    renderProjectFolderSetupSection(true);
    if (typeof queueHealthRender === 'function') queueHealthRender();
  });
  const overview = document.getElementById('project-overview-panel');
  if (overview) {
    projectFolderSetupObserver = new MutationObserver(() => {
      installProjectFolderLegacyControlOverrides();
      addProjectFolderToolbarButton();
      polishProjectFolderFacingLabels();
      renderProjectFolderSetupSection();
    });
    projectFolderSetupObserver.observe(overview, { childList: true, subtree: true });
  }
}

function installProjectFolderLegacyControlOverrides() {
  const chooseButton = document.getElementById('choose-local-folder-button');
  if (chooseButton && chooseButton.dataset.projectFolderRouted !== 'true') {
    chooseButton.dataset.projectFolderRouted = 'true';
    chooseButton.textContent = 'Go to Project Folder Section';
    chooseButton.title = 'Use the connected project folder controls in Project Overview';
    chooseButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      document.getElementById('project-folder-setup-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, true);
  }
  const quickStart = document.getElementById('quick-start-button');
  if (quickStart && quickStart.dataset.projectFolderRouted !== 'true') {
    quickStart.dataset.projectFolderRouted = 'true';
    quickStart.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (typeof closeMenus === 'function') closeMenus();
      if (typeof showHelp === 'function') showHelp('Quick Start Guide', '<p>Enter the project name, ID and creator, then open <strong>Project Folder</strong> and connect the real writable project folder. Click <strong>Create Starter Structure</strong> to write the canonical project files there. Use <strong>Export ZIP</strong> only as backup or fallback, then click <strong>Set Active</strong>.</p>');
    }, true);
  }
}

function updateTextIfChanged(element, text) {
  if (element && element.textContent !== text) element.textContent = text;
}

function polishProjectFolderFacingLabels() {
  const cardText = {
    storage: ['Connect Project Folder', 'Connect or re-authorise the real writable project root folder.'],
    'project-index': ['Create Primary Project File', 'Create project.json as the top-level pointer file.'],
    folders: ['Create Folder Structure', 'Create the starter project, asset, build, health and backup folders.'],
    manifest: ['Create Logic Shell', 'Create logic.json for starter structure and route logic.'],
    flatplan: ['Create Layout Shell', 'Create layout.json for editor layout and map placement state.'],
    indexes: ['Create Index Files', 'Create scene, screen, quest, archetype and asset indexes.']
  };
  Object.entries(cardText).forEach(([id, values]) => {
    const card = document.querySelector(`[data-gate="${id}"]`);
    const title = card?.querySelector('strong');
    const details = card?.querySelector('em');
    const status = details?.querySelector('small');
    if (!card || !title || !details || !status) return;
    updateTextIfChanged(title, values[0]);
    const statusText = card.classList.contains('complete')
      ? 'Marked created or supplied as a backup package.'
      : id === 'storage' ? 'Use the Connected Project Folder controls above.' : 'Click Create Starter Structure after connecting a folder.';
    updateTextIfChanged(status, statusText);
    if (details.childNodes[0]?.textContent !== values[1]) details.childNodes[0].textContent = values[1];
  });
  document.querySelectorAll('.project-facts article').forEach(article => {
    const label = article.querySelector('span');
    const value = article.querySelector('strong');
    if (!label || !value) return;
    if (label.textContent === 'Primary index') updateTextIfChanged(value, 'project.json');
    if (label.textContent === 'Manifest') { updateTextIfChanged(label, 'Logic'); updateTextIfChanged(value, 'logic.json'); }
    if (label.textContent === 'Flatplan') { updateTextIfChanged(label, 'Layout'); updateTextIfChanged(value, 'layout.json'); }
  });
}

function projectFolderClientAvailable() { return Boolean(window.ArtifexProjectFolder && window.ArtifexProjectStructure); }
function currentProjectFolderState() {
  return window.ArtifexProjectFolder?.getState?.() || { folderStatus: 'loading', saveStatus: 'No Folder Connected', folderName: null, supported: typeof window.showDirectoryPicker === 'function', lastError: null };
}
function readProjectFolderSetupInput() {
  const title = String(document.getElementById('game-title-input')?.value || 'Untitled Artifex Adventure').trim();
  return {
    gameTitle: title,
    projectName: title,
    projectSlug: String(document.getElementById('project-id-input')?.value || '').trim(),
    creator: String(document.getElementById('creator-input')?.value || '').trim(),
    version: '0.1.0',
    enabledModules: ['creation-guide', 'project-editor', 'scene-editor', 'quest-builder', 'puzzle-creator', 'archetype-object-creator', 'effect-editor', 'asset-library', 'build-game']
  };
}

function addProjectFolderToolbarButton() {
  if (document.getElementById('connect-project-folder-toolbar-button')) return;
  const newOpenButton = document.getElementById('project-flow-toolbar-button');
  if (!newOpenButton) return;
  const button = document.createElement('button');
  button.id = 'connect-project-folder-toolbar-button';
  button.type = 'button';
  button.textContent = '📁 Project Folder';
  button.title = 'Connect or initialise the real project folder';
  button.addEventListener('click', () => document.getElementById('project-folder-setup-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  newOpenButton.insertAdjacentElement('afterend', button);
}

function renderProjectFolderSetupSection(force = false) {
  const gatesHeader = document.querySelector('#project-overview-panel .setup-gates-header');
  if (!gatesHeader) return;
  let section = document.getElementById('project-folder-setup-section');
  if (!section) {
    section = document.createElement('section');
    section.id = 'project-folder-setup-section';
    section.className = 'project-folder-setup-section';
    gatesHeader.insertAdjacentElement('beforebegin', section);
  }
  const folderState = currentProjectFolderState();
  const supported = folderState.supported !== false;
  const connected = folderState.folderStatus === 'connected';
  const needsPermission = folderState.folderStatus === 'permission-required';
  const stateClass = projectFolderStructureCreating ? 'working' : connected ? 'connected' : needsPermission ? 'warn' : folderState.folderStatus === 'error' ? 'error' : 'empty';
  const visibleState = projectFolderStructureCreating ? 'Writing Starter Files…' : connected ? (projectFolderStructureWrittenThisSession ? 'Saved to Project Folder' : 'Folder Connected') : folderState.saveStatus || 'No Folder Connected';
  const description = !supported
    ? 'Direct project-folder access is not supported in this browser. Export ZIP remains available as backup/fallback.'
    : projectFolderStructureCreating ? 'Creating the starter project files and folders. Approve the browser save request if it appears.'
    : connected ? `Connected to “${safeFolderText(folderState.folderName || 'project folder')}”. Creation Guide can create the starter structure directly in this folder.`
    : needsPermission ? `“${safeFolderText(folderState.folderName || 'Project folder')}” is remembered, but write access must be re-authorised before saving.`
    : 'Connect the real project root folder. It will become the normal saved location for project files; ZIP export remains a backup/fallback option.';
  const html = `<header class="project-folder-setup-header"><div><p class="project-folder-eyebrow">Project storage</p><h3>Connected Project Folder</h3></div><span class="project-folder-state ${stateClass}">${safeFolderText(visibleState)}</span></header><p class="project-folder-copy">${description}</p><div class="project-folder-actions"><button type="button" id="connect-real-project-folder-button" ${supported && !projectFolderStructureCreating ? '' : 'disabled'}>${connected ? 'Change Project Folder' : 'Connect Project Folder'}</button><button type="button" id="reauthorise-project-folder-button" ${needsPermission && !projectFolderStructureCreating ? '' : 'disabled'}>Re-authorise Folder</button><button type="button" id="initialise-project-structure-button" ${connected && !projectFolderStructureCreating ? '' : 'disabled'}>${projectFolderStructureCreating ? 'Creating Starter Structure…' : 'Create Starter Structure'}</button></div><p class="project-folder-footnote">This creates canonical starter files and folders without overwriting existing files. The separate <strong>intake/</strong> explanation and media-readiness step is the next Creation Guide feature.</p>${folderState.lastError ? `<p class="project-folder-error">${safeFolderText(folderState.lastError)}</p>` : ''}`;
  if (!force && section.dataset.lastHtml === html) return;
  section.dataset.lastHtml = html;
  section.innerHTML = html;
  section.querySelector('#connect-real-project-folder-button')?.addEventListener('click', connectRealProjectFolder);
  section.querySelector('#reauthorise-project-folder-button')?.addEventListener('click', reauthoriseRealProjectFolder);
  section.querySelector('#initialise-project-structure-button')?.addEventListener('click', initialiseRealProjectStructure);
}

async function connectRealProjectFolder() {
  if (!projectFolderClientAvailable()) return showProjectFolderToast('Project-folder service has not loaded.', 'warn');
  try {
    const folderState = await window.ArtifexProjectFolder.connectProjectFolder(readProjectFolderSetupInput().projectSlug || null);
    if (folderState.folderStatus !== 'connected') return;
    projectFolderStructureWrittenThisSession = false;
    updateProjectFolderNameField(folderState.folderName);
    showProjectFolderToast(`Connected project folder: ${folderState.folderName}.`);
    renderProjectFolderSetupSection(true);
  } catch (error) { showProjectFolderToast(error.message || 'Could not connect the project folder.', 'warn'); }
}
async function reauthoriseRealProjectFolder() {
  try {
    const folderState = await window.ArtifexProjectFolder.reauthoriseProjectFolder();
    if (folderState.folderStatus === 'connected') { updateProjectFolderNameField(folderState.folderName); showProjectFolderToast('Project folder write access restored.'); }
    else showProjectFolderToast('Project folder permission is still required.', 'warn');
    renderProjectFolderSetupSection(true);
  } catch (error) { showProjectFolderToast(error.message || 'Could not re-authorise the project folder.', 'warn'); }
}
async function initialiseRealProjectStructure() {
  if (projectFolderStructureCreating) return;
  if (currentProjectFolderState().folderStatus !== 'connected') return showProjectFolderToast('Connect a writable project folder first.', 'warn');
  projectFolderStructureCreating = true;
  renderProjectFolderSetupSection(true);
  showProjectFolderToast('Creating starter structure in the connected project folder…', 'success');
  try {
    const result = await window.ArtifexProjectStructure.initialiseProjectStructure(readProjectFolderSetupInput(), { includeIntake: false });
    projectFolderStructureWrittenThisSession = true;
    markConnectedStructureGatesComplete();
    showProjectFolderToast(`Starter structure ready: ${result.createdFiles.length} new file(s) created; existing files were left unchanged.`);
  } catch (error) {
    showProjectFolderToast(error.message || 'Could not initialise the project structure.', 'warn');
  } finally {
    projectFolderStructureCreating = false;
    renderProjectFolderSetupSection(true);
  }
}
function markConnectedStructureGatesComplete() {
  try {
    if (typeof state !== 'undefined' && state.project?.gates && typeof STRUCTURAL_GATES !== 'undefined') {
      STRUCTURAL_GATES.forEach(gateId => { state.project.gates[gateId] = true; });
      if (typeof updateProjectStatusFromGates === 'function') updateProjectStatusFromGates();
      if (typeof render === 'function') render();
      polishProjectFolderFacingLabels();
      renderProjectFolderSetupSection(true);
      if (typeof queueHealthRender === 'function') queueHealthRender();
    }
  } catch (error) { console.warn('Starter files were written, but the setup gate UI could not be refreshed.', error); }
}
function updateProjectFolderNameField(folderName) { const input = document.getElementById('project-folder-input'); if (input && folderName) { input.value = folderName; input.dispatchEvent(new Event('input', { bubbles: true })); } }
function showProjectFolderToast(message, type = 'success') { if (typeof toast === 'function') toast(message, type); }
function safeFolderText(value) { return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character])); }
function injectProjectFolderSetupStyles() {
  if (document.getElementById('project-folder-setup-style')) return;
  const style = document.createElement('style');
  style.id = 'project-folder-setup-style';
  style.textContent = `.project-folder-setup-section{margin:16px 0;padding:16px;border:1px solid rgba(226,204,167,.18);border-radius:12px;background:rgba(19,14,13,.88)}.project-folder-setup-header{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:9px}.project-folder-setup-header h3{margin:2px 0 0;font-size:16px;color:#f4dfc4}.project-folder-eyebrow{margin:0;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#a98f72}.project-folder-state{flex:none;padding:6px 10px;border-radius:999px;border:1px solid rgba(226,204,167,.2);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.project-folder-state.connected{color:#7ed496;border-color:rgba(72,192,113,.42);background:rgba(72,192,113,.12)}.project-folder-state.working{color:#f1d885;border-color:rgba(241,216,133,.46);background:rgba(241,216,133,.12)}.project-folder-state.warn{color:#e6bb62;border-color:rgba(230,187,98,.45);background:rgba(230,187,98,.11)}.project-folder-state.error{color:#ec8178;border-color:rgba(236,129,120,.4);background:rgba(236,129,120,.1)}.project-folder-state.empty{color:#b7a48c;background:rgba(255,255,255,.025)}.project-folder-copy{margin:0 0 12px;color:#cbbda9;font-size:12px;line-height:1.55}.project-folder-actions{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}.project-folder-actions button{min-height:33px}.project-folder-actions button:disabled{opacity:.42;cursor:not-allowed}.project-folder-footnote{margin:0;color:#948572;font-size:11px;line-height:1.45}.project-folder-error{margin:10px 0 0;color:#ec8178;font-size:11px}`;
  document.head.appendChild(style);
}
