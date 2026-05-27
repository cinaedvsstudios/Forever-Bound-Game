import './template-card-enhancements.js?v=1.14';
import './object-creator-workflows-stable.js?v=1.12';
import { initStep5ColumnLayout } from './object-wizard-step5-layout.js?v=1.22';
import { initRenderer } from './editor-renderer.js';
import { initUI, showToast } from './editor-ui.js';
import { validateCurrentArchetype } from './editor-state.js';

const VERSION_LABEL = 'V1.22';

window.addEventListener('artifex:toast', (event) => {
  showToast(event.detail.message, event.detail.type);
});

window.addEventListener('DOMContentLoaded', () => {
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge) versionBadge.textContent = VERSION_LABEL;

  validateCurrentArchetype();
  initRenderer();
  initUI();
  initStep5ColumnLayout();
  showToast(`Archetype Object Creator ${VERSION_LABEL} loaded.`, 'success');
});