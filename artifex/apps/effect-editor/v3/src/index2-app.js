import { initEditorCore } from './editor-core.js';
import { initAppearanceParity } from './appearance-parity.js?v=022-ramp-drag';
import { initEditorDynamicsControls } from './editor-dynamics-controls.js';
import { initEditorQuickEditControls } from './editor-quick-edit-controls.js';
import { initEditorWorkspaceUI } from './editor-workspace-ui.js';

const VERSION_LABEL = 'INDEX2-WORK-0.2.3-INTEGRATION';

window.addEventListener('DOMContentLoaded', () => {
  initEditorCore({ versionLabel: VERSION_LABEL, showToast });
  initAppearanceParity(showToast);
  initEditorWorkspaceUI({ versionLabel: VERSION_LABEL, showToast });
  initEditorDynamicsControls();
  initEditorQuickEditControls(showToast);
});

function showToast(message, type = 'info') {
  const area = document.getElementById('toast-area');
  if (!area) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  area.append(toast);
  window.setTimeout(() => toast.remove(), 3200);
}
