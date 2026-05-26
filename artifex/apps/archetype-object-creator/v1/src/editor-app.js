import './template-card-enhancements.js?v=1.08';
import './object-creator-workflows.js?v=1.07';
import { initRenderer } from './editor-renderer.js';
import { initUI, showToast } from './editor-ui.js';
import { validateCurrentArchetype } from './editor-state.js';

const VERSION_LABEL = 'V1.08';

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