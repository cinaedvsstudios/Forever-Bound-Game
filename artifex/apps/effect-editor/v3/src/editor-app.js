import { addLayer } from './editor-state.js';
import { initRenderer } from './editor-renderer.js';
import { initUI, showToast } from './editor-ui.js';
import { initLibrary } from './editor-library.js';
import { initSidePanelParity } from './side-panel-parity.js';
import { initAppearanceParity } from './appearance-parity.js';
import { initBrushAssetLibrary } from './brush-asset-library.js';
import { initBrushRenderControls } from './brush-render-controls.js';
import { initDynamicsParity } from './dynamics-parity.js';
import { initEffectSpecificControls } from './effect-specific-controls.js';
import { initIOParity } from './io-parity.js';
import { initWorkspaceParity } from './workspace-parity.js';
import { initResolutionParity } from './resolution-parity.js';
import { initLayerOrderParity } from './layer-order-parity.js';
import { initMenuCleanupParity } from './menu-cleanup-parity.js';
import { initWorkflowPolish } from './workflow-polish.js';
import { initUIPolishV2 } from './ui-polish-v2.js';
import { initV312Polish } from './v312-polish.js';
import { initV314Polish } from './v314-polish.js';
import { initV315Polish } from './v315-polish.js';
import { initV317Polish } from './v317-polish.js';
import { initV320FileMenu } from './v320-file-menu.js';
import { cloneBasePreset } from './presets/base-effects.js';

const VERSION_LABEL = 'V3.20';

window.addEventListener('artifex:toast', (event) => {
  showToast(event.detail.message, event.detail.type);
});

window.addEventListener('DOMContentLoaded', () => {
  document.title = `Artifex Effect Editor ${VERSION_LABEL}`;
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge) versionBadge.textContent = VERSION_LABEL;

  initRenderer();
  initUI();
  initLibrary();
  initSidePanelParity(showToast);
  initAppearanceParity(showToast);
  initBrushAssetLibrary(showToast);
  initBrushRenderControls(showToast);
  initDynamicsParity(showToast);
  initEffectSpecificControls(showToast);
  initIOParity(showToast);
  initWorkspaceParity(showToast);
  initResolutionParity(showToast);
  initLayerOrderParity(showToast);
  initMenuCleanupParity(showToast);
  initWorkflowPolish(showToast);
  initUIPolishV2(showToast);
  initV312Polish(showToast);
  initV314Polish(showToast);
  initV315Polish(showToast);
  initV317Polish(showToast);
  initV320FileMenu(showToast);

  const preset = cloneBasePreset('base', 'standard-particle');
  if (preset) {
    addLayer(preset.config);
  }

  showToast(`${VERSION_LABEL} loaded.`, 'success');
});
