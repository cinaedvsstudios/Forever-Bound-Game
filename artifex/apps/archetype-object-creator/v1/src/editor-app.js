import './template-card-patch.js?v=1.02';
import './right-panel-layout-patch.js?v=1.02';
import './square-icon-cards-patch.js?v=1.05';
import './icon-atlas-crop-patch.js?v=1.06';
import './object-build-checklist-wizard-patch.js?v=1.06';
import { initRenderer } from './editor-renderer.js';
import { initUI, showToast } from './editor-ui.js';
import { validateCurrentArchetype } from './editor-state.js';

const VERSION_LABEL = 'V1.06';

window.addEventListener('artifex:toast', (event) => {
  showToast(event.detail.message, event.detail.type);
});

window.addEventListener('DOMContentLoaded', () => {
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge) versionBadge.textContent = VERSION_LABEL;

  validateCurrentArchetype();
  initRenderer();
  initUI();
  showToast(`Archetype Object Creator ${VERSION_LABEL} loaded.`, 'success');
});