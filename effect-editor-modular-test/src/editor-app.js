import { addLayer } from './editor-state.js';
import { initRenderer } from './editor-renderer.js';
import { initUI, showToast } from './editor-ui.js';
import { initLibrary } from './editor-library.js';
import { cloneBasePreset } from './presets/base-effects.js';

const VERSION_LABEL = 'v2.3.2 UI-PARITY';

window.addEventListener('artifex:toast', (event) => {
  showToast(event.detail.message, event.detail.type);
});

window.addEventListener('DOMContentLoaded', () => {
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge) versionBadge.textContent = VERSION_LABEL;

  initRenderer();
  initUI();
  initLibrary();

  const preset = cloneBasePreset('base', 'standard-particle');
  if (preset) {
    addLayer(preset.config);
  }

  showToast(`${VERSION_LABEL} loaded. UI parity styling pass is active.`, 'success');
});
