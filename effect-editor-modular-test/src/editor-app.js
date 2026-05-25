import { addLayer } from './editor-state.js';
import { initRenderer } from './editor-renderer.js';
import { initUI, showToast } from './editor-ui.js';
import { initLibrary } from './editor-library.js';
import { initSidePanelParity } from './side-panel-parity.js';
import { initAppearanceParity } from './appearance-parity.js';
import { initDynamicsParity } from './dynamics-parity.js';
import { initIOParity } from './io-parity.js';
import { initWorkspaceParity } from './workspace-parity.js';
import { initResolutionParity } from './resolution-parity.js';
import { cloneBasePreset } from './presets/base-effects.js';

const VERSION_LABEL = 'v2.3.11 TEXTURE-RENDER';

window.addEventListener('artifex:toast', (event) => {
  showToast(event.detail.message, event.detail.type);
});

window.addEventListener('DOMContentLoaded', () => {
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge) versionBadge.textContent = VERSION_LABEL;

  initRenderer();
  initUI();
  initLibrary();
  initSidePanelParity(showToast);
  initAppearanceParity(showToast);
  initDynamicsParity(showToast);
  initIOParity(showToast);
  initWorkspaceParity(showToast);
  initResolutionParity(showToast);

  const preset = cloneBasePreset('base', 'standard-particle');
  if (preset) {
    addLayer(preset.config);
  }

  showToast(`${VERSION_LABEL} loaded. Texture render parity pass is active.`, 'success');
});
