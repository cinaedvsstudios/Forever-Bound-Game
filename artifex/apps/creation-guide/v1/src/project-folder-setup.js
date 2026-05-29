const PROJECT_FOLDER_SETUP_VERSION = 'V1.1.11';
let projectFolderSetupObserver = null;
let projectFolderSetupInstalled = false;

window.addEventListener('DOMContentLoaded', () => {
  window.setTimeout(() => installProjectFolderSetup(), 0);
});

function installProjectFolderSetup() {
  if (projectFolderSetupInstalled) return;
  projectFolderSetupInstalled = true;
  injectProjectFolderSetupStyles();
  addProjectFolderToolbarButton();
  renderProjectFolderSetupSection();
  window.addEventListener('artifex:project-folder-state', () => renderProjectFolderSetupSection(true));

  const overview = document.getElementById('project-overview-panel');
  if (overview && !projectFolderSetupObserver) {
    projectFolderSetupObserver = new MutationObserver(() => {
      addProjectFolderToolbarButton();
      renderProjectFolderSetupSection();
    });
    projectFolderSetupObserver.observe(overview, { childList: true, subtree: true });
  }
}

function projectFolderClientAvailable() {
  return Boolean(window.ArtifexProjectFolder && window.ArtifexProjectStructure);
}

function readProjectFolderSetupInput() {
  const title = String(document.getElementById('game-title-input')?.value || 'Untitled Artifex Adventure').trim();
  const projectSlug = String(document.getElementById('project-id-input')?.value || '').trim();
  const creator = String(document.getElementById('creator-input')?.value || '').trim();
  return {
    gameTitle: title,
    projectName: title,
    projectSlug,
    creator,
    version: '0.1.0',
    enabledModules: ['creation-guide', 'project-editor', 'scene-editor', 'quest-builder', 'puzzle-creator', 'archetype-object-creator', 'effect-editor', 'asset-library', 'build-game']
  };
}

function currentProjectFolderState() {
  if (!window.ArtifexProjectFolder) {
    return {
      folderStatus: 'loading',
      saveStatus: 'No Folder Connected',
      folderName: null,
      supported: typeof window.showDirectoryPicker === 'function',
      lastError: null
    };
  }
  return window.ArtifexProjectFolder.getState();
}

function addProjectFolderToolbarButton() {
  if (document.getElementById('connect-project-folder-toolbar-button')) return;
  const toolbar = document.querySelector('.workspace-toolbar');
  const newOpenButton = document.getElementById('project-flow-toolbar-button');
  if (!toolbar || !newOpenButton) return;
  const button = document.createElement('button');
  button.id = 'connect-project-folder-toolbar-button';
  button.type = 'button';
  button.textContent = '📁 Project Folder';
  button.title = 'Connect or initialise the real project folder';
  button.addEventListener('click', () => {
    document.getElementById('project-folder-setup-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  newOpenButton.insertAdjacentElement('afterend', button);
}

function renderProjectFolderSetupSection(force = false) {
  const overview = document.getElementById('project-overview-panel');
  const gatesHeader = overview?.querySelector('.setup-gates-header');
  if (!overview || !gatesHeader) return;

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
  const stateClass = connected ? 'connected' : needsPermission ? 'warn' : folderState.folderStatus === 'error' ? 'error' : 'empty';
  const description = !supported
    ? 'Direct project-folder access is not supported in this browser. Export ZIP remains available as backup/fallback.'
    : connected
      ? `Connected to “${safeFolderText(folderState.folderName || 'project folder')}”. Creation Guide can now create the starter structure there.`
      : needsPermission
        ? `“${safeFolderText(folderState.folderName || 'Project folder')}” is remembered, but write access must be re-authorised before saving.`
        : 'Connect the real project root folder. It will become the normal saved location for project files; ZIP export remains a backup/fallback option.';

  const html = `
    <header class="project-folder-setup-header">
      <div>
        <p class="project-folder-eyebrow">Project storage</p>
        <h3>Connected Project Folder</h3>
      </div>
      <span class="project-folder-state ${stateClass}">${safeFolderText(folderState.saveStatus || 'No Folder Connected')}</span>
    </header>
    <p class="project-folder-copy">${description}</p>
    <div class="project-folder-actions">
      <button type="button" id="connect-real-project-folder-button" ${supported ? '' : 'disabled'}>${connected ? 'Change Project Folder' : 'Connect Project Folder'}</button>
      <button type="button" id="reauthorise-project-folder-button" ${needsPermission ? '' : 'disabled'}>Re-authorise Folder</button>
      <button type="button" id="initialise-project-structure-button" ${connected ? '' : 'disabled'}>Create Starter Structure</button>
    </div>
    <p class="project-folder-footnote">This creates the canonical starter project files and folders without overwriting existing files. The separate <strong>intake/</strong> explanation and media-readiness step is the next Creation Guide feature.</p>
    ${folderState.lastError ? `<p class="project-folder-error">${safeFolderText(folderState.lastError)}</p>` : ''}`;

  if (!force && section.dataset.lastHtml === html) return;
  section.dataset.lastHtml = html;
  section.innerHTML = html;
  section.querySelector('#connect-real-project-folder-button')?.addEventListener('click', connectRealProjectFolder);
  section.querySelector('#reauthorise-project-folder-button')?.addEventListener('click', reauthoriseRealProjectFolder);
  section.querySelector('#initialise-project-structure-button')?.addEventListener('click', initialiseRealProjectStructure);
}

async function connectRealProjectFolder() {
  if (!projectFolderClientAvailable()) {
    showProjectFolderToast('Project-folder service has not loaded.', 'warn');
    return;
  }
  try {
    const current = readProjectFolderSetupInput();
    const folderState = await window.ArtifexProjectFolder.connectProjectFolder(current.projectSlug || null);
    if (folderState.folderStatus !== 'connected') return;
    updateProjectFolderNameField(folderState.folderName);
    showProjectFolderToast(`Connected project folder: ${folderState.folderName}.`, 'success');
    renderProjectFolderSetupSection(true);
  } catch (error) {
    showProjectFolderToast(error.message || 'Could not connect the project folder.', 'warn');
    renderProjectFolderSetupSection(true);
  }
}

async function reauthoriseRealProjectFolder() {
  if (!projectFolderClientAvailable()) return;
  try {
    const folderState = await window.ArtifexProjectFolder.reauthoriseProjectFolder();
    if (folderState.folderStatus === 'connected') {
      updateProjectFolderNameField(folderState.folderName);
      showProjectFolderToast('Project folder write access restored.', 'success');
    } else {
      showProjectFolderToast('Project folder permission is still required.', 'warn');
    }
    renderProjectFolderSetupSection(true);
  } catch (error) {
    showProjectFolderToast(error.message || 'Could not re-authorise the project folder.', 'warn');
  }
}

async function initialiseRealProjectStructure() {
  if (!projectFolderClientAvailable()) return;
  const folderState = currentProjectFolderState();
  if (folderState.folderStatus !== 'connected') {
    showProjectFolderToast('Connect a writable project folder first.', 'warn');
    return;
  }
  try {
    const result = await window.ArtifexProjectStructure.initialiseProjectStructure(readProjectFolderSetupInput(), { includeIntake: false });
    markConnectedStructureGatesComplete();
    showProjectFolderToast(`Starter structure ready: ${result.createdFiles.length} new file(s) created; existing files were left unchanged.`, 'success');
    renderProjectFolderSetupSection(true);
  } catch (error) {
    showProjectFolderToast(error.message || 'Could not initialise the project structure.', 'warn');
    renderProjectFolderSetupSection(true);
  }
}

function markConnectedStructureGatesComplete() {
  if (typeof window.markCreationGuideStructuralGatesComplete === 'function') {
    window.markCreationGuideStructuralGatesComplete('Saved starter structure to connected project folder.');
  }
}

function updateProjectFolderNameField(folderName) {
  const input = document.getElementById('project-folder-input');
  if (!input || !folderName) return;
  input.value = folderName;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function showProjectFolderToast(message, type = 'success') {
  if (typeof window.toast === 'function') window.toast(message, type);
  else {
    const area = document.getElementById('toast-area');
    if (!area) return;
    const toastNode = document.createElement('div');
    toastNode.className = `toast ${type}`;
    toastNode.textContent = message;
    area.appendChild(toastNode);
    window.setTimeout(() => toastNode.remove(), 3000);
  }
}

function safeFolderText(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}

function injectProjectFolderSetupStyles() {
  if (document.getElementById('project-folder-setup-style')) return;
  const style = document.createElement('style');
  style.id = 'project-folder-setup-style';
  style.textContent = `
    .project-folder-setup-section { margin: 16px 0; padding: 16px; border: 1px solid rgba(226,204,167,.18); border-radius: 12px; background: rgba(19,14,13,.88); }
    .project-folder-setup-header { display:flex; justify-content:space-between; align-items:flex-start; gap:14px; margin-bottom:9px; }
    .project-folder-setup-header h3 { margin:2px 0 0; font-size:16px; color:#f4dfc4; }
    .project-folder-eyebrow { margin:0; font-size:10px; font-weight:700; letter-spacing:.18em; text-transform:uppercase; color:#a98f72; }
    .project-folder-state { flex:none; padding:6px 10px; border-radius:999px; border:1px solid rgba(226,204,167,.2); font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
    .project-folder-state.connected { color:#7ed496; border-color:rgba(72,192,113,.42); background:rgba(72,192,113,.12); }
    .project-folder-state.warn { color:#e6bb62; border-color:rgba(230,187,98,.45); background:rgba(230,187,98,.11); }
    .project-folder-state.error { color:#ec8178; border-color:rgba(236,129,120,.4); background:rgba(236,129,120,.1); }
    .project-folder-state.empty { color:#b7a48c; background:rgba(255,255,255,.025); }
    .project-folder-copy { margin:0 0 12px; color:#cbbda9; font-size:12px; line-height:1.55; }
    .project-folder-actions { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px; }
    .project-folder-actions button { min-height:33px; }
    .project-folder-actions button:disabled { opacity:.42; cursor:not-allowed; }
    .project-folder-footnote { margin:0; color:#948572; font-size:11px; line-height:1.45; }
    .project-folder-error { margin:10px 0 0; color:#ec8178; font-size:11px; }
  `;
  document.head.appendChild(style);
}
