import { OC } from './obstacle-course-state.js';
import { $, visualFactorToSlider, sliderToGlobalBrightness, sliderToGlobalContrast, sliderToGlobalSaturation, sliderToTint, tintToSlider } from './obstacle-course-utils.js';
import { buildSliderRow } from './obstacle-course-ui.js';
import { renderOnce, applyCamera, applyBackgroundPlate } from './obstacle-course-scene.js';
import { scheduleOverviewDraw } from './obstacle-course-overview.js?v=3.0.19';
import { updateHud } from './obstacle-course-hud.js';
import { startRun, pauseRun, resetRun } from './obstacle-course-movement.js?v=3.0.19';
import { bindLayerButtons } from './obstacle-course-layer-controls.js';

function resetVanishingPointYControl() {
  const input = $('oc-vp-y');
  const out = $('oc-vp-y-out');
  if (!input) return;
  input.min = '0';
  input.max = '200';
  input.step = '1';
  input.value = String(OC.vanishY);
  if (out) out.textContent = OC.vanishY;
  const number = input.closest('.range-row')?.querySelector('.oc-range-value');
  if (number) {
    number.min = '0';
    number.max = '200';
    number.step = '1';
    number.value = String(OC.vanishY);
  }
}

export function setInteractionLocked(locked) {
  ['obstacle-start', 'obstacle-pause', 'obstacle-reset-run', 'obstacle-regenerate'].forEach((id) => {
    const node = $(id);
    if (node) node.disabled = locked;
  });
}

export function bindObstacleCourseControls({ rebuildCourse, refreshLayerPanel }) {
  resetVanishingPointYControl();
  $('obstacle-start')?.addEventListener('click', startRun);
  $('obstacle-pause')?.addEventListener('click', pauseRun);
  $('obstacle-reset-run')?.addEventListener('click', () => resetRun(false));
  $('obstacle-template')?.addEventListener('change', (event) => {
    OC.templateId = event.target.value;
    rebuildCourse?.();
  });
  $('obstacle-difficulty')?.addEventListener('input', (event) => {
    OC.difficulty = Number(event.target.value);
    const out = $('obstacle-difficulty-out');
    if (out) out.textContent = OC.difficulty;
  });
  $('obstacle-distance')?.addEventListener('input', (event) => {
    OC.courseLength = Number(event.target.value);
    const out = $('obstacle-distance-out');
    if (out) out.textContent = OC.courseLength;
    updateHud();
  });
  $('obstacle-scenery-distance')?.addEventListener('input', (event) => {
    OC.sceneryDistance = Number(event.target.value);
    const out = $('obstacle-scenery-distance-out');
    if (out) out.textContent = OC.sceneryDistance;
    rebuildCourse?.();
  });
  $('oc-ground-grid-toggle')?.addEventListener('change', (event) => {
    if (OC.grid) OC.grid.visible = event.target.checked;
    renderOnce();
  });
  $('oc-overview-path-overlay')?.addEventListener('change', (event) => {
    OC.overviewPathOverlay = event.target.checked;
    scheduleOverviewDraw();
  });
  $('oc-vp-x')?.addEventListener('input', (event) => {
    OC.vanishX = Number(event.target.value);
    const out = $('oc-vp-x-out');
    if (out) out.textContent = OC.vanishX;
    applyCamera();
  });
  $('oc-vp-y')?.addEventListener('input', (event) => {
    OC.vanishY = Number(event.target.value);
    const out = $('oc-vp-y-out');
    if (out) out.textContent = OC.vanishY;
    applyCamera();
  });
  $('oc-vp-angle')?.addEventListener('input', (event) => {
    OC.cameraAngle = Number(event.target.value);
    const out = $('oc-vp-angle-out');
    if (out) out.textContent = OC.cameraAngle;
    applyCamera();
  });
  bindLayerButtons({ refreshOverview: scheduleOverviewDraw, createLayerSliders: refreshLayerPanel });
  createGlobalSliders();
}

function createGlobalSliders() {
  const host = $('hf-global-sliders');
  if (!host) return;
  host.innerHTML = '';
  buildSliderRow(host, 'hf-global', 'brightness', 'Brightness', -100, 100, 1, visualFactorToSlider(OC.screenBrightness), (value) => {
    OC.screenBrightness = sliderToGlobalBrightness(value);
    updateGlobalVisuals();
  });
  buildSliderRow(host, 'hf-global', 'contrast', 'Contrast', -100, 100, 1, visualFactorToSlider(OC.screenContrast), (value) => {
    OC.screenContrast = sliderToGlobalContrast(value);
    updateGlobalVisuals();
  });
  buildSliderRow(host, 'hf-global', 'saturation', 'Saturation', -100, 100, 1, visualFactorToSlider(OC.screenSaturation), (value) => {
    OC.screenSaturation = sliderToGlobalSaturation(value);
    updateGlobalVisuals();
  });
  buildSliderRow(host, 'hf-global', 'tintStrength', 'Tint Amt', -100, 100, 1, tintToSlider(OC.screenTintStrength), (value) => {
    OC.screenTintStrength = sliderToTint(value);
    updateGlobalVisuals();
  });
  const tintRow = document.createElement('label');
  tintRow.className = 'field-block';
  tintRow.innerHTML = `<span>Screen Tint</span><input id="hf-global-tint" type="color" value="${OC.screenTint}">`;
  host.appendChild(tintRow);
  tintRow.querySelector('input').addEventListener('input', (event) => {
    OC.screenTint = event.target.value;
    updateGlobalVisuals();
  });
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
  applyBackgroundPlate();
  renderOnce();
}
