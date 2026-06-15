// Obstacle Course V3.0.27 / Modular Horse Forest Runner
import { OC } from './obstacle-course-state.js';
import { ensureHeader, injectStyles, mountLayout, mountLeftPanel, enhanceStaticRangeSteppers, setResult } from './obstacle-course-ui.js';
import { applyDefaultSettings } from './obstacle-course-settings.js';
import { exportJsonSettings, importJsonSettings } from './obstacle-course-export-import.js';
import { initScene, renderOnce, applyBackgroundPlate, updateWorldTransform } from './obstacle-course-scene.js';
import { loadRequiredAssets, loadOptionalAssets } from './obstacle-course-loader.js';
import { bindKeyboard } from './obstacle-course-input.js';
import { buildGroundAndPath, clearWorld, playerWorldX } from './obstacle-course-ground-path.js?v=3.0.27';
import { scatterScenery } from './obstacle-course-scenery.js?v=3.0.27';
import { addCollectibles } from './obstacle-course-collectibles.js';
import { addObstacles } from './obstacle-course-obstacles.js';
import { updateMovement, resetRun } from './obstacle-course-movement.js?v=3.0.27';
import { updateHud, showSpinner } from './obstacle-course-hud.js';
import { updateHorseSprite } from './obstacle-course-horse.js';
import { applyAllLayers } from './obstacle-course-layers.js';
import { populateLayerSelect, createLayerSliders } from './obstacle-course-layer-controls.js?v=3.0.27';
import { scheduleOverviewDraw, drawOverview } from './obstacle-course-overview.js?v=3.0.27';
import { loadGlbAsset, applyAllGlbAssetControls } from './obstacle-course-glb.js';
import { createGlbAssetSliders } from './obstacle-course-glb-controls.js?v=3.0.27';
import { bindObstacleCourseControls, setInteractionLocked } from './obstacle-course-controls.js?v=3.0.27';
import { installButtonFeedback } from './obstacle-course-button-feedback.js';
import { installOverviewLayout } from './obstacle-course-overview-layout.js';
import { installHorseAspectFix } from './obstacle-course-horse-aspect.js';

export function openObstacleCourseWorkflow() { ensureMounted(); }

function ensureMounted() {
  if (OC.mounted) return;
  OC.mounted = true;
  OC.leftPanel = document.querySelector('.left-panel-body') || document.querySelector('.left-panel') || document.body;
  OC.rightPanel = document.querySelector('.right-panel') || document.body;
  applyDefaultSettings();
  ensureHeader();
  injectStyles();
  installButtonFeedback();
  installOverviewLayout();
  installHorseAspectFix();
  mountLayout();
  mountLeftPanel({ onRegenerate: rebuildCourse, onExport: exportJsonSettings, onImport: (event) => importJsonSettings(event, { rebuild: rebuildCourse }) });
  setInteractionLocked(true);
  enhanceStaticRangeSteppers();
  bindObstacleCourseControls({ rebuildCourse, refreshLayerPanel });
  bindKeyboard();
  initScene(updateFrame);
  loadRequiredAssets({ onFirstReady: () => { applyBackgroundPlate(); showSpinner(true); updateHorseSprite(); renderOnce(); } }).then(() => {
    if (!OC.requiredReady) {
      showSpinner(true, 'Required assets missing');
      setResult(`Required asset failure: ${OC.failures.join(', ')}`, 'failure');
      updateHud();
      return;
    }
    rebuildCourse();
    populateLayerSelect();
    refreshLayerPanel();
    updateHud();
    scheduleOverviewDraw();
    showSpinner(false);
    setInteractionLocked(false);
    setResult('Required obstacle course assets loaded. Test controls are ready. Optional 3D/audio assets are loading in the background.', 'success');
    import('./obstacle-course-asset-debug.js?v=3.0.27').catch(() => {});
    loadOptionalAssets({ loadGlbAsset }).then(() => {
      rebuildCourse();
      populateLayerSelect();
      refreshLayerPanel();
      updateHud();
      scheduleOverviewDraw();
      const loadedGlbs = OC.glbTemplates?.size || 0;
      const optionalMessage = OC.optionalFailures?.length
        ? `Optional assets finished with ${OC.optionalFailures.length} missing/late asset(s). ${loadedGlbs} GLB model(s) loaded and used.`
        : `All obstacle course assets loaded. ${loadedGlbs} GLB model(s) loaded and used.`;
      setResult(optionalMessage, OC.optionalFailures?.length ? 'failure' : 'success');
      import('./obstacle-course-asset-debug.js?v=3.0.27').catch(() => {});
    }).catch((error) => {
      console.warn('[ObstacleCourse] optional assets did not finish', error);
      setResult('Optional 3D/audio assets did not finish, but required test controls remain ready.', 'failure');
    });
  });
}

function rebuildCourse() {
  if (!OC.world || !OC.requiredReady) return;
  resetRun(true);
  clearWorld();
  buildGroundAndPath();
  scatterScenery();
  addObstacles(Math.max(4, Math.round(7 + OC.difficulty * 4)));
  addCollectibles(Math.max(3, 5 + OC.difficulty * 2));
  populateLayerSelect();
  refreshLayerPanel();
  applyAllLayers();
  applyAllGlbAssetControls();
  updateWorldTransform(playerWorldX());
  updateHud();
  drawOverview();
  renderOnce();
}

function refreshLayerPanel() {
  createLayerSliders({ refreshOverview: scheduleOverviewDraw, createGlbAssetSliders });
}

function updateFrame(dt) { updateMovement(dt); }