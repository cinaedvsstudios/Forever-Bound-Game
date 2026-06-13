// Obstacle Course V3.0.0 / Modular Horse Forest Runner
import { OC } from './obstacle-course-state.js';
import { $, visualFactorToSlider, sliderToGlobalBrightness, sliderToGlobalContrast, sliderToGlobalSaturation, sliderToTint, tintToSlider } from './obstacle-course-utils.js';
import { ensureHeader, injectStyles, mountLayout, mountLeftPanel, enhanceStaticRangeSteppers, buildSliderRow, setResult } from './obstacle-course-ui.js';
import { applyDefaultSettings } from './obstacle-course-settings.js';
import { exportJsonSettings, importJsonSettings } from './obstacle-course-export-import.js';
import { initScene, renderOnce, applyCamera, applyBackgroundPlate, updateWorldTransform } from './obstacle-course-scene.js';
import { loadRequiredAssets, loadOptionalAssets } from './obstacle-course-loader.js';
import { bindKeyboard } from './obstacle-course-input.js';
import { rebuildGroundPathAndScenery, playerWorldX } from './obstacle-course-ground-path.js';
import { addCollectibles } from './obstacle-course-collectibles.js';
import { addObstacles } from './obstacle-course-obstacles.js';
import { updateMovement, startRun, pauseRun, resetRun } from './obstacle-course-movement.js';
import { updateHud, showSpinner } from './obstacle-course-hud.js';
import { updateHorseSprite } from './obstacle-course-horse.js';
import { populateLayerSelect, createLayerSliders, bindLayerButtons, applyAllLayers } from './obstacle-course-layers.js';
import { scheduleOverviewDraw, drawOverview } from './obstacle-course-overview.js';
import { loadGlbAsset, createGlbAssetSliders } from './obstacle-course-glb.js';

export function openObstacleCourseWorkflow() { ensureMounted(); }

function ensureMounted() {
  if (OC.mounted) return;
  OC.mounted = true;
  OC.leftPanel = document.querySelector('.left-panel-body') || document.querySelector('.left-panel') || document.body;
  OC.rightPanel = document.querySelector('.right-panel') || document.body;
  applyDefaultSettings();
  ensureHeader();
  injectStyles();
  mountLayout();
  mountLeftPanel({ onRegenerate: rebuildCourse, onExport: exportJsonSettings, onImport: (e) => importJsonSettings(e, { rebuild: rebuildCourse }) });
  enhanceStaticRangeSteppers();
  bindUi();
  bindKeyboard();
  initScene(updateFrame);
  loadRequiredAssets({ onFirstReady: () => { applyBackgroundPlate(); showSpinner(true); updateHorseSprite(); renderOnce(); } }).then(() => {
    if (!OC.requiredReady) { showSpinner(true, 'Required assets missing'); setResult(`Required asset failure: ${OC.failures.join(', ')}`, 'failure'); updateHud(); return; }
    rebuildCourse();
    if ($('obstacle-start')) $('obstacle-start').disabled = false;
    setResult('Required obstacle course assets ready. Optional 3D assets are still loading.', 'success');
    loadOptionalAssets({ loadGlbAsset }).then(() => { showSpinner(false); populateLayerSelect(); refreshLayerPanel(); updateHud(); scheduleOverviewDraw(); setResult('Obstacle course ready.', 'success'); });
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
  const canvas = OC.renderer?.domElement;
  if (canvas) canvas.style.filter = `brightness(${OC.screenBrightness}) contrast(${OC.screenContrast}) saturate(${OC.screenSaturation})`;
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
  rebuildGroundPathAndScenery();
  addObstacles(Math.max(4, Math.round(7 + OC.difficulty * 4)));
  addCollectibles(Math.max(3, 5 + OC.difficulty * 2));
  populateLayerSelect();
  refreshLayerPanel();
  applyAllLayers();
  updateWorldTransform(playerWorldX());
  updateHud();
  drawOverview();
  renderOnce();
}

function refreshLayerPanel() { createLayerSliders({ refreshOverview: scheduleOverviewDraw, createGlbAssetSliders }); }
function updateFrame(dt) { updateMovement(dt); }
