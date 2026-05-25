import {
  emergencyBackupSave,
  exportEditorProject,
  exportEffectArchetypeAsset,
  exportLocalBundle,
  exportSceneFXInstance
} from './editor-io.js';

export function initIOParity(showToast = () => {}) {
  promoteExportMenuItems(showToast);
  injectIOStyles();
}

function promoteExportMenuItems(showToast) {
  renameButton('Raw Layer Composition', 'Export Raw Composition JSON');
  renameButton('Editor Project', 'Export Editor Project JSON');
  renameButton('Effect Archetype Asset', 'Export Effect Archetype JSON');
  renameButton('Scene FX Instance', 'Export Scene FX Instance JSON');
  renameButton('Save to Local Storage', 'Save Locally in Browser');
  renameButton('View Local Files', 'Manage Local Effects');
  renameButton('Settings', 'Settings');

  bindMenuButton('Export Editor Project JSON', exportEditorProject);
  bindMenuButton('Export Effect Archetype JSON', exportEffectArchetypeAsset);
  bindMenuButton('Export Scene FX Instance JSON', exportSceneFXInstance);
  bindMenuButton('Settings', () => showToast('Scene / FX Resolution settings are available lower in this File menu.', 'info'));

  const filePanel = document.getElementById('menu-file');
  if (!filePanel || document.getElementById('export-local-bundle-menu-button')) return;
  filePanel.insertAdjacentHTML('beforeend', `
    <button id="export-local-bundle-menu-button" type="button">Export All Local Effects</button>
    <button id="emergency-backup-menu-button" type="button">Emergency Backup JSON</button>
  `);
  document.getElementById('export-local-bundle-menu-button')?.addEventListener('click', exportLocalBundle);
  document.getElementById('emergency-backup-menu-button')?.addEventListener('click', emergencyBackupSave);
}

function renameButton(oldLabel, newLabel) {
  const buttons = Array.from(document.querySelectorAll('#menu-file button'));
  const button = buttons.find((candidate) => candidate.textContent.trim() === oldLabel);
  if (button) button.textContent = newLabel;
}

function bindMenuButton(label, handler) {
  const buttons = Array.from(document.querySelectorAll('#menu-file button'));
  const button = buttons.find((candidate) => candidate.textContent.trim() === label);
  if (!button) return;
  button.classList.remove('is-placeholder');
  button.removeAttribute('data-toast-message');
  button.addEventListener('click', handler);
}

function injectIOStyles() {
  if (document.getElementById('io-parity-style')) return;
  const style = document.createElement('style');
  style.id = 'io-parity-style';
  style.textContent = `
    #export-local-bundle-menu-button,
    #emergency-backup-menu-button {
      color: var(--gold-bright);
      border-color: rgba(226,204,167,.34);
    }
  `;
  document.head.append(style);
}
