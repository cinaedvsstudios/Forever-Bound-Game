import './index2-clean-controller.js';
import { initAppearanceParity } from './appearance-parity.js';
import { initEditorWorkspaceUI } from './editor-workspace-ui.js';

const VERSION_LABEL = 'INDEX2-CLEAN-0.2.1';

window.addEventListener('DOMContentLoaded', () => {
  initAppearanceParity(showToast);
  initEditorWorkspaceUI({ versionLabel: VERSION_LABEL, showToast });
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
