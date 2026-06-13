import { OC } from './obstacle-course-state.js';
import { buildSliderRow } from './obstacle-course-ui.js';
import { signedToFactor, factorToSigned, sliderToVisualFactor, visualFactorToSlider, sliderToTint, tintToSlider, sliderToOpacity, opacityToSlider } from './obstacle-course-utils.js';
import { renderOnce, selectObjects, applyBackgroundPlate } from './obstacle-course-scene.js';

export function makeLayer(id, label, group, cfg = {}) {
  const layer = { id, label, group, visible: true, opacity: 1, x: 0, y: 0, z: 0, scale: 1, order: 0, brightness: 1, contrast: 1, saturation: 1, tint: '#ffffff', tintStrength: 0, ...cfg };
  OC.layers.set(id, layer);
  return layer;
}

export function registerEntity(type, object, meta = {}) {
  const entity = { type, object, ...meta };
  OC.entities.push(entity);
  object.userData.ocType = type;
  return entity;
}

function applyMaterialVisual(mat, layer) {
  if (!mat) return;
  mat.transparent = (layer.opacity ?? 1) < 0.995 || mat.transparent;
  mat.opacity = layer.opacity ?? 1;
  if (mat.color) {
    mat.color.set(layer.tint || '#ffffff');
    mat.color.multiplyScalar(layer.brightness ?? 1);
  }
  mat.needsUpdate = true;
}

export function applyLayer(layer) {
  if (!layer?.group) return;
  layer.group.visible = layer.visible;
  layer.group.position.set(layer.x || 0, layer.y || 0, layer.z || 0);
  layer.group.scale.setScalar(layer.scale || 1);
  layer.group.renderOrder = layer.order || 0;
  layer.group.traverse((node) => {
    if (node.material) {
      if (Array.isArray(node.material)) node.material.forEach((mat) => applyMaterialVisual(mat, layer));
      else applyMaterialVisual(node.material, layer);
    }
  });
  renderOnce();
}

export function applyAllLayers() { OC.layers.forEach(applyLayer); }

export function populateLayerSelect() {
  const select = document.getElementById('hf-layer-select');
  if (!select) return;
  const existing = OC.selectedLayerId || 'path';
  select.innerHTML = `${Array.from(OC.layers.values()).map((layer) => `<option value="${layer.id}">${layer.label}</option>`).join('')}<option value="glbAsset">GLB Asset</option>`;
  select.value = OC.layers.has(existing) ? existing : 'path';
  OC.selectedLayerId = select.value;
}

export function createLayerSliders({ refreshOverview, createGlbAssetSliders }) {
  const host = document.getElementById('hf-layer-sliders');
  const label = document.getElementById('hf-layer-selected-label');
  if (!host) return;
  host.innerHTML = '';
  if (OC.selectedLayerId === 'glbAsset') {
    if (label) label.textContent = 'Selected: GLB Asset';
    createGlbAssetSliders?.(host);
    return;
  }
  const layer = OC.layers.get(OC.selectedLayerId);
  if (!layer) { host.innerHTML = '<p class="hint-text">No layer selected.</p>'; return; }
  if (label) label.textContent = `Selected: ${layer.label}`;
  layer.scaleOffset = layer.scaleOffset ?? factorToSigned(layer.scale);
  layer.opacityOffset = layer.opacityOffset ?? opacityToSlider(layer.opacity);
  layer.brightnessOffset = layer.brightnessOffset ?? visualFactorToSlider(layer.brightness);
  layer.contrastOffset = layer.contrastOffset ?? visualFactorToSlider(layer.contrast);
  layer.saturationOffset = layer.saturationOffset ?? visualFactorToSlider(layer.saturation);
  const redraw = () => { applyLayer(layer); refreshOverview?.(); };
  buildSliderRow(host, 'hf-layer', 'x', 'X', -100, 100, 1, layer.x || 0, (v) => { layer.x = v; redraw(); });
  buildSliderRow(host, 'hf-layer', 'y', 'Y', -100, 100, 1, layer.y || 0, (v) => { layer.y = v; redraw(); });
  buildSliderRow(host, 'hf-layer', 'z', 'Z', -100, 100, 1, layer.z || 0, (v) => { layer.z = v; redraw(); });
  buildSliderRow(host, 'hf-layer', 'scaleOffset', 'Scale', -100, 100, 1, layer.scaleOffset, (v) => { layer.scaleOffset = v; layer.scale = signedToFactor(v); redraw(); });
  buildSliderRow(host, 'hf-layer', 'opacityOffset', 'Opacity', -100, 100, 1, layer.opacityOffset, (v) => { layer.opacityOffset = v; layer.opacity = sliderToOpacity(v); redraw(); });
  buildSliderRow(host, 'hf-layer', 'brightnessOffset', 'Bright', -100, 100, 1, layer.brightnessOffset, (v) => { layer.brightnessOffset = v; layer.brightness = sliderToVisualFactor(v); redraw(); });
  buildSliderRow(host, 'hf-layer', 'contrastOffset', 'Contrast', -100, 100, 1, layer.contrastOffset, (v) => { layer.contrastOffset = v; layer.contrast = sliderToVisualFactor(v); redraw(); });
  buildSliderRow(host, 'hf-layer', 'saturationOffset', 'Saturation', -100, 100, 1, layer.saturationOffset, (v) => { layer.saturationOffset = v; layer.saturation = sliderToVisualFactor(v); redraw(); });
  buildSliderRow(host, 'hf-layer', 'tintStrength', 'Tint Amt', -100, 100, 1, tintToSlider(layer.tintStrength), (v) => { layer.tintStrength = sliderToTint(v); redraw(); });
  buildSliderRow(host, 'hf-layer', 'order', 'Order', -100, 100, 1, layer.order || 0, (v) => { layer.order = v; redraw(); });
  const tintRow = document.createElement('label');
  tintRow.className = 'field-block';
  tintRow.innerHTML = `<span>Layer Tint</span><input id="hf-layer-tint" type="color" value="${layer.tint || '#ffffff'}">`;
  host.appendChild(tintRow);
  tintRow.querySelector('input').addEventListener('input', (e) => { layer.tint = e.target.value; redraw(); });
  selectObjects([layer.group]);
}

export function bindLayerButtons({ refreshOverview, createLayerSliders }) {
  document.getElementById('hf-layer-select')?.addEventListener('change', (event) => { OC.selectedLayerId = event.target.value; createLayerSliders(); });
  document.getElementById('hf-layer-visible')?.addEventListener('click', () => { const l = OC.layers.get(OC.selectedLayerId); if (l) { l.visible = !l.visible; applyLayer(l); refreshOverview?.(); } });
  document.getElementById('hf-layer-solo')?.addEventListener('click', () => { const id = OC.selectedLayerId; OC.layers.forEach((l) => { l.visible = l.id === id; applyLayer(l); }); refreshOverview?.(); });
  document.getElementById('hf-layer-all')?.addEventListener('click', () => { OC.layers.forEach((l) => { l.visible = true; applyLayer(l); }); refreshOverview?.(); });
  document.getElementById('hf-layer-above')?.addEventListener('click', () => { const l = OC.layers.get(OC.selectedLayerId); if (l) { l.order = (l.order || 0) + 1; applyLayer(l); refreshOverview?.(); } });
  document.getElementById('hf-layer-below')?.addEventListener('click', () => { const l = OC.layers.get(OC.selectedLayerId); if (l) { l.order = (l.order || 0) - 1; applyLayer(l); refreshOverview?.(); } });
  document.getElementById('hf-white-bg')?.addEventListener('click', () => { OC.whiteBackground = !OC.whiteBackground; applyBackgroundPlate(); renderOnce(); });
}
