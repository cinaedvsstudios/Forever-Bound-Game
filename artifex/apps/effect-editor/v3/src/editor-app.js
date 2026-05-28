import { addLayer, editorState } from './editor-state.js';
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
import { initV322TextControls } from './v322-text-controls.js';
import { initV326LeftPanelSearch } from './v326-left-panel-search.js';
import { initV330BootRecovery } from './v330-boot-recovery.js';
import { cloneBasePreset } from './presets/base-effects.js';

const VERSION_LABEL = 'V3.30';

window.addEventListener('artifex:toast', (event) => {
  showToast(event.detail.message, event.detail.type);
});

window.addEventListener('DOMContentLoaded', () => {
  document.title = `Artifex Effect Editor ${VERSION_LABEL}`;
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge) versionBadge.textContent = VERSION_LABEL;

  safeInit('renderer', initRenderer);
  safeInit('core UI', initUI);
  safeInit('library', initLibrary);
  safeInit('V3.30 boot recovery', () => initV330BootRecovery(showToast));
  ensureStarterLayer();

  const optionalModules = [
    ['side panel parity', () => initSidePanelParity(showToast)],
    ['appearance parity', () => initAppearanceParity(showToast)],
    ['brush asset library', () => initBrushAssetLibrary(showToast)],
    ['brush render controls', () => initBrushRenderControls(showToast)],
    ['dynamics parity', () => initDynamicsParity(showToast)],
    ['effect specific controls', () => initEffectSpecificControls(showToast)],
    ['IO parity', () => initIOParity(showToast)],
    ['workspace parity', () => initWorkspaceParity(showToast)],
    ['resolution parity', () => initResolutionParity(showToast)],
    ['layer order parity', () => initLayerOrderParity(showToast)],
    ['menu cleanup parity', () => initMenuCleanupParity(showToast)],
    ['workflow polish', () => initWorkflowPolish(showToast)],
    ['UI polish v2', () => initUIPolishV2(showToast)],
    ['V3.12 polish', () => initV312Polish(showToast)],
    ['V3.14 polish', () => initV314Polish(showToast)],
    ['V3.15 polish', () => initV315Polish(showToast)],
    ['V3.17 polish', () => initV317Polish(showToast)],
    ['V3.20 file menu', () => initV320FileMenu(showToast)],
    ['V3.22 text controls', () => initV322TextControls(showToast)],
    ['V3.26 left panel search', () => initV326LeftPanelSearch()]
  ];

  optionalModules.forEach(([name, init]) => safeInit(name, init));
  safeInit('V3.30 boot recovery final pass', () => initV330BootRecovery(showToast));
  ensureStarterLayer();

  showToast(`${VERSION_LABEL} loaded. Menu and starter layer recovery are active.`, 'success');
});

function safeInit(name, init) {
  try {
    init();
  } catch (error) {
    console.error(`[Effect Editor] ${name} failed`, error);
    showToast(`${name} failed, but the editor kept loading.`, 'warn');
  }
}

function ensureStarterLayer() {
  if (editorState.composition.layers.length) return;
  const preset = cloneBasePreset('base', 'standard-particle');
  if (preset?.config) addLayer(preset.config);
}
