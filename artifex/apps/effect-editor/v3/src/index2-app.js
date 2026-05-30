import { initEditorCore } from './editor-core.js?v=024-feedback';
import { initEditorAppearanceControls } from './editor-appearance-controls.js';
import { initEditorDynamicsControls } from './editor-dynamics-controls.js';
import { initEditorQuickEditControls } from './editor-quick-edit-controls.js';
import { initEditorRestoredMotionControls } from './editor-restored-motion-controls.js?v=024-feedback';
import { initEditorWorkspaceUI } from './editor-workspace-ui.js?v=024-feedback';

const VERSION_LABEL = 'INDEX2-CLEAN-0.2.4';

window.addEventListener('DOMContentLoaded', () => {
  initEditorCore({ versionLabel: VERSION_LABEL, showToast });
  initEditorAppearanceControls(showToast);
  initEditorWorkspaceUI({ versionLabel: VERSION_LABEL, showToast });
  initEditorDynamicsControls();
  initEditorQuickEditControls(showToast);
  initEditorRestoredMotionControls(showToast);
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
