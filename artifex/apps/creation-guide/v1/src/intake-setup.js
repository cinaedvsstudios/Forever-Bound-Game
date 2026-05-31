const INTAKE_SETUP_VERSION = 'V1.1.12';
const INTAKE_SETUP_KEY_PREFIX = 'artifex.creationGuide.intakeSetup.';
let intakeSetupInstalled = false;
let intakeStructureCreating = false;

window.addEventListener('DOMContentLoaded', () => window.setTimeout(installInitialAssetIntakeSetup, 0));

function installInitialAssetIntakeSetup() {
  if (intakeSetupInstalled) return;
  intakeSetupInstalled = true;
  injectInitialAssetIntakeStyles();
  renderInitialAssetIntakeSection();
  window.addEventListener('artifex:project-folder-state', () => { renderInitialAssetIntakeSection(true); if (typeof queueHealthRender === 'function') queueHealthRender(); });
  window.addEventListener('creation-guide:overview-rendered', () => renderInitialAssetIntakeSection(true));
}

function getCurrentIntakeSetupState() {
  const id = String(document.getElementById('project-id-input')?.value || 'untitled-artifex-adventure').trim() || 'untitled-artifex-adventure';
  return localStorage.getItem(`${INTAKE_SETUP_KEY_PREFIX}${id}`) || 'pending';
}
function setCurrentIntakeSetupState(value) {
  const id = String(document.getElementById('project-id-input')?.value || 'untitled-artifex-adventure').trim() || 'untitled-artifex-adventure';
  localStorage.setItem(`${INTAKE_SETUP_KEY_PREFIX}${id}`, value);
  renderInitialAssetIntakeSection(true);
  if (typeof queueHealthRender === 'function') queueHealthRender();
}
window.getCreationGuideIntakeSetupState = getCurrentIntakeSetupState;

function renderInitialAssetIntakeSection(force = false) {
  const storage = document.getElementById('project-folder-setup-section');
  if (!storage) return;
  let section = document.getElementById('initial-asset-intake-section');
  if (!section) { section = document.createElement('section'); section.id = 'initial-asset-intake-section'; section.className = 'project-folder-setup-section intake-setup-section'; storage.insertAdjacentElement('afterend', section); }
  const connected = window.ArtifexProjectFolder?.getState?.().folderStatus === 'connected';
  const state = getCurrentIntakeSetupState();
  const working = intakeStructureCreating;
  const label = working ? 'Creating Intake Folders…' : state === 'ready' ? 'Intake Folders Ready' : state === 'skipped' ? 'Skipped For Now' : 'Not Set Up';
  const tone = working ? 'working' : state === 'ready' ? 'connected' : state === 'skipped' ? 'warn' : 'empty';
  const copy = state === 'ready' ? 'Your source-material drop folders are ready. Approved files must still be promoted before final project content references them.' : state === 'skipped' ? 'You skipped intake setup for now. You can return and create these folders later.' : 'Create optional source-material drop folders now, or skip this step until you are ready to gather art and audio.';
  const folders = [['backgrounds/','Scene backgrounds, interiors, landscapes and environmental art.'],['characters/','Player, NPC, interactive character and sprite or portrait art.'],['objects/','Props, pickups, doors, transitions and interactable objects.'],['icons-ui/','Project logo, title mark, icons, HUD and menu pieces.'],['music/','Music tracks and stingers.'],['dialogue-sfx/','Dialogue, voice, ambience and sound effects.']];
  const items = folders.map(([path, text]) => `<li><code>${path}</code><span>${text}</span></li>`).join('');
  const html = `<header class="project-folder-setup-header"><div><p class="project-folder-eyebrow">Optional setup step</p><h3>Initial Asset Intake Setup</h3></div><span class="project-folder-state ${tone}">${label}</span></header><p class="project-folder-copy">${copy}</p><div class="intake-folder-root"><strong>intake/</strong><ul>${items}</ul></div><p class="intake-storage-rule"><strong>Source material only.</strong> Final game content must use approved files promoted into <code>assets/</code>, not source files inside <code>intake/</code>.</p><div class="project-folder-actions"><button type="button" id="create-intake-folders-button" ${connected && !working ? '' : 'disabled'}>${working ? 'Creating Intake Folders…' : state === 'ready' ? 'Verify Intake Folders' : 'Create Intake Folders'}</button><button type="button" id="skip-intake-setup-button" ${working ? 'disabled' : ''}>${state === 'skipped' ? 'Skipped For Now' : 'Skip for Now'}</button></div>${connected ? '' : '<p class="project-folder-footnote">Connect a writable project folder before creating intake folders.</p>'}`;
  if (!force && section.dataset.lastHtml === html) return;
  section.dataset.lastHtml = html; section.innerHTML = html;
  section.querySelector('#create-intake-folders-button')?.addEventListener('click', createIntakeFolders);
  section.querySelector('#skip-intake-setup-button')?.addEventListener('click', skipIntakeSetup);
}

async function createIntakeFolders() {
  if (intakeStructureCreating) return;
  if (!window.ArtifexProjectStructure?.initialiseIntakeOnly) return showIntakeToast('Intake folder service has not loaded.', 'warn');
  if (window.ArtifexProjectFolder?.getState?.().folderStatus !== 'connected') return showIntakeToast('Connect a writable project folder before creating intake folders.', 'warn');
  intakeStructureCreating = true; renderInitialAssetIntakeSection(true); showIntakeToast('Creating intake source-material folders in the connected project folder…');
  try {
    const title = String(document.getElementById('game-title-input')?.value || 'Untitled Artifex Adventure').trim();
    const result = await window.ArtifexProjectStructure.initialiseIntakeOnly({ gameTitle: title, projectName: title, projectSlug: String(document.getElementById('project-id-input')?.value || '').trim(), creator: String(document.getElementById('creator-input')?.value || '').trim(), version: '0.1.0' });
    setCurrentIntakeSetupState('ready');
    showIntakeToast(`Intake folders ready. ${result.files?.[0]?.status === 'created' ? 'README created.' : 'Existing README left unchanged.'}`);
  } catch (error) { showIntakeToast(error.message || 'Could not create intake folders.', 'warn'); }
  finally { intakeStructureCreating = false; renderInitialAssetIntakeSection(true); }
}
function skipIntakeSetup() { setCurrentIntakeSetupState('skipped'); showIntakeToast('Intake setup skipped for now. You can create these folders later.'); }
function showIntakeToast(message, type = 'success') { if (typeof toast === 'function') toast(message, type); }
function injectInitialAssetIntakeStyles() {
  if (document.getElementById('creation-guide-intake-setup-style')) return;
  const style = document.createElement('style'); style.id = 'creation-guide-intake-setup-style';
  style.textContent = `.intake-setup-section{margin-top:12px}.intake-folder-root{margin:10px 0;padding:12px 14px;border:1px solid rgba(226,204,167,.13);border-radius:10px;background:rgba(0,0,0,.15)}.intake-folder-root>strong{color:#f4dfc4;font-size:13px}.intake-folder-root ul{display:grid;grid-template-columns:repeat(2,minmax(220px,1fr));gap:8px 14px;margin:10px 0 0;padding:0;list-style:none}.intake-folder-root li{display:flex;align-items:flex-start;gap:8px;color:#bcae9c;font-size:11px;line-height:1.4}.intake-folder-root code,.intake-storage-rule code{color:#f0d08b;font-size:11px}.intake-folder-root li code{min-width:92px}.intake-storage-rule{margin:12px 0;color:#bcae9c;font-size:11px;line-height:1.55}.intake-storage-rule strong{color:#f4dfc4}@media(max-width:850px){.intake-folder-root ul{grid-template-columns:1fr}}`;
  document.head.appendChild(style);
}
