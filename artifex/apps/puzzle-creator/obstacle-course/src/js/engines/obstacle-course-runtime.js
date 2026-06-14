// Obstacle Course V3.0.4 / Modular Horse Forest Runner
import { OC } from './obstacle-course-state.js';
import { $, visualFactorToSlider, sliderToGlobalBrightness, sliderToGlobalContrast, sliderToGlobalSaturation, sliderToTint, tintToSlider } from './obstacle-course-utils.js';
import { ensureHeader, injectStyles, mountLayout, mountLeftPanel, enhanceStaticRangeSteppers, buildSliderRow, setResult } from './obstacle-course-ui.js';
import { applyDefaultSettings } from './obstacle-course-settings.js';
import { exportJsonSettings, importJsonSettings } from './obstacle-course-export-import.js';
import { initScene, renderOnce, applyCamera, applyBackgroundPlate, updateWorldTransform } from './obstacle-course-scene.js';
import { loadRequiredAssets, loadOptionalAssets } from './obstacle-course-loader.js';
import { bindKeyboard } from './obstacle-course-input.js';
import { buildGroundAndPath, clearWorld, playerWorldX } from './obstacle-course-ground-path.js';
import { scatterScenery } from './obstacle-course-scenery.js';
import { addCollectibles } from './obstacle-course-collectibles.js';
import { addObstacles } from './obstacle-course-obstacles.js';
import { updateMovement, startRun, pauseRun, resetRun } from './obstacle-course-movement.js';
import { updateHud, showSpinner } from './obstacle-course-hud.js';
import { updateHorseSprite } from './obstacle-course-horse.js';
import { populateLayerSelect, createLayerSliders, bindLayerButtons, applyAllLayers } from './obstacle-course-layers.js';
import { scheduleOverviewDraw, drawOverview } from './obstacle-course-overview.js';
import { loadGlbAsset, createGlbAssetSliders, applyAllGlbAssetControls } from './obstacle-course-glb.js';
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
  mountLeftPanel({ onRegenerate: rebuildCourse, onExport: exportJsonSettings, onImport: (e) => importJsonSettings(e, { rebuild: rebuildCourse }) });
  setInteractionLocked(true);
  enhanceStaticRangeSteppers();
  bindUi();
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
    import('./obstacle-course-asset-debug.js?v=3.0.4').catch(() => {});
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
      import('./obstacle-course-asset-debug.js?v=3.0.4').catch(() => {});
    }).catch((error) => {
      console.warn('[ObstacleCourse] optional assets did not finish', error);
      setResult('Optional 3D/audio assets did not finish, but required test controls remain ready.', 'failure');
    });
  });
}

function setInteractionLocked(locked) {
  ['obstacle-start', 'obstacle-pause', 'obstacle-reset-run', 'obstacle-regenerate'].forEach((id) => {
    const node = $(id);
    if (node) node.disabled = locked;
  });
}

function bindUi() {
  $('obstacle-start')?.addEventListener('click', startRun);
  $('obstacle-pause')?.addEventListener('click', pauseRun);
  $('obstacle-reset-run')?.addEventListener('click', () => resetRun(false));
  $('obstacle-template')?.addEventListener('change', (e) => { OC.templateId = e.target.value; rebuildCourse(); });
  $('obstacle-difficulty')?.addEventListener('input', (e) => { OC.difficulty = Number(e.target.value); $('obstacle-difficulty-out').textContent = OC.difficulty; });
  $('obstacle-distance')?.addEventListener('input', (e) => { OC.courseLength = Number(e.target.value); $('obstacle-distance-out').textContent = OC.courseLength; updateHud(); });
  $('obstacle-scenery-distance')?.addEventListener('input', (e) => { OC.sceneryDistance = Number(e.target.value); $('obstacle-scenery-distance-out').textContent = OC.sceneryDistance; rebuildCourse(); });
  $('oc-ground-grid-toggle')?.addEventListener('change', (e) => { if (OC.grid) OC.grid.visible = e.target.checked; renderOnce(); });
  $('oc-overview-path-overlay')?.addEventListener('change', (e) => { OC.overviewPathOverlay = e.target.checked; scheduleOverviewDraw(); });
  $('oc-vp-x')?.addEventListener('input', (e) => { OC.vanishX = Number(e.target.value); $('oc-vp-x-out').textContent = OC.vanishX; applyCamera(); });
  $('oc-vp-y')?.addEventListener('input', (e) => { OC.vanishY = Number(e.target.value); $('oc-vp-y-out').textContent = OC.vanishY; applyCamera(); });
  $('oc-vp-angle')?.addEventListener('input', (e) => { OC.cameraAngle = Number(e.target.value); $('oc-vp-angle-out').textContent = OC.cameraAngle; applyCamera(); });
  bindLayerButtons({ refreshOverview: scheduleOverviewDraw, createLayerSliders: refreshLayerPanel });
  createGlobalSliders();
}

function createGlobalSliders() {
  const host = $('hf-global-sliders');
  if (!host) return;
  host.innerHTML = '';
  buildSliderRow(host, 'hf-global', 'brightness', 'Brightness', -100, 100, 1, visualFactorToSlider(OC.screenBrightness), (v) => { OC.screenBrightness = sliderToGlobalBrightness(v); updateGlobalVisuals(); });
  buildSliderRow(host, 'hf-global', 'contrast', 'Contrast', -100, 100, 1, visualFactorToSlider(OC.screenContrast), (v) => { OC.screenContrast = sliderToGlobalContrast(v); updateGlobalVisuals(); });
  buildSliderRow(host, 'hf-global', 'saturation', 'Saturation', -100, 100, 1, visualFactorToSlider(OC.screenSaturation), (v) => { OC.screenSaturation = sliderToGlobalSaturation(v); updateGlobalVisuals(); });
  buildSliderRow(host, 'hf-global', 'tintStrength', 'Tint Amt', -100, 100, 1, tintToSlider(OC.screenTintStrength), (v) => { OC.screenTintStrength = sliderToTint(v); updateGlobalVisuals(); });
  const tintRow = document.createElement('label');
  tintRow.className = 'field-block';
  tintRow.innerHTML = `<span>Screen Tint</span><input id="hf-global-tint" type="color" value="${OC.screenTint}">`;
  host.appendChild(tintRow);
  tintRow.querySelector('input').addEventListener('input', (event) => { OC.screenTint = event.target.value; updateGlobalVisuals(); });
}

function updateGlobalVisuals() {
  if (OC.stage) {
    OC.stage.style.setProperty('--oc-screen-brightness', String(OC.screenBrightness || 1));
    OC.stage.style.setProperty('--oc-screen-contrast', String(OC.screenContrast || 1));
    OC.stage.style.setProperty('--oc-screen-saturation', String(OC.screenSaturation || 1));
  }
  const horse = $('obstacle-horse');
  if (horse) horse.style.filter = 'drop-shadow(0 7px 9px rgba(0,0,0,.72))';
  const canvas = OC.renderer?.domElement;
  if (canvas) canvas.style.filter = '';
  const tint = document.querySelector('.obstacle-tint-overlay');
  if (tint) {
    tint.style.setProperty('--oc-tint', OC.screenTint || '#000000');
    tint.style.setProperty('--oc-tint-opacity', String(OC.screenTintStrength || 0));
    tint.style.opacity = String(OC.screenTintStrength || 0);
  }
  renderOnce();
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

function refreshLayerPanel() { createLayerSliders({ refreshOverview: scheduleOverviewDraw, createGlbAssetSliders }); }
function updateFrame(dt) { updateMovement(dt); }
