import './prototype-adapters/shimmer-control-range-boosts.js?v=059-spread-gamma-size';
import { initEditorCore } from './editor-core.js?v=059-spread-gamma-size';
import { initEditorAppearanceControls } from './editor-appearance-controls.js';
import { initBrushAssetLibrary } from './brush-asset-library.js';
import { initEditorDynamicsControls } from './editor-dynamics-controls.js';
import { initEditorQuickEditControls } from './editor-quick-edit-controls.js';
import { initEditorWorkspaceUI } from './editor-workspace-ui.js';
import { initEditorExport } from './editor-export.js?v=061-export-duration';

const VERSION_LABEL = 'INDEX2-EXPORT-0.2.37';

window.addEventListener('DOMContentLoaded', () => {
  initEditorExport(showToast);
  initEditorCore({ versionLabel: VERSION_LABEL, showToast });
  initEditorAppearanceControls(showToast);
  initBrushAssetLibrary(showToast);
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
