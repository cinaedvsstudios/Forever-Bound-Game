import { OC } from './obstacle-course-state.js';
import { buildSliderRow } from './obstacle-course-ui.js';
import { signedToFactor, factorToSigned, sliderToVisualFactor, visualFactorToSlider, clamp } from './obstacle-course-utils.js';
import { renderOnce, selectObjects, applyBackgroundPlate, THREE } from './obstacle-course-scene.js';
import { getLayerDefault } from './obstacle-course-settings.js';

function layerBase(id) { return getLayerDefault(id); }
function offsetFromBase(value, baseValue) { return Math.round(Number(value || 0) - Number(baseValue || 0)); }
function visualOffsetFromBase(value, baseValue) { const base = Number(baseValue || 1); return visualFactorToSlider(Number(value || base) / base); }
function opacityOffsetFromBase(value, baseValue) { return Math.round((Number(value ?? baseValue ?? 1) - Number(baseValue ?? 1)) * 100); }
function tintOffsetFromBase(value, baseValue) { return Math.round((Number(value || 0) - Number(baseValue || 0)) * 100); }

export function makeLayer(id, label, group, cfg = {}) {
  const base = layerBase(id);
  const pending = OC.pendingLayerSettings?.[id] || {};
  const layer = { id, label, group, visible: true, opacity: 1, x: 0, y: 0, z: 0, scale: 1, order: 0, brightness: 1, contrast: 1, saturation: 1, tint: '#ffffff', tintStrength: 0, ...base, ...cfg, ...pending };
  if (id === 'treeShadows') layer.opacity = 1;
  OC.layers.set(id, layer);
  return layer;
}

export function registerEntity(type, object, meta = {}) {
  const entity = { type, object, ...meta };
  OC.entities.push(entity);
  object.userData.ocType = type;
  return entity;
}

function clamp01(value) { return Math.min(1, Math.max(0, Number(value || 0))); }
function safeColor(hex) {
  try { return new THREE.Color(hex || '#ffffff'); }
  catch { return new THREE.Color('#ffffff'); }
}
function transformedColor(baseColor, layer) {
  const color = baseColor.clone();
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  hsl.s = clamp01(hsl.s * Number(layer.saturation ?? 1));
  hsl.l = clamp01(((hsl.l - 0.5) * Number(layer.contrast ?? 1) + 0.5) * Number(layer.brightness ?? 1));
  color.setHSL(hsl.h, hsl.s, hsl.l);
  if (Number(layer.tintStrength || 0) > 0) color.lerp(safeColor(layer.tint || '#ffffff'), clamp01(layer.tintStrength));
  return color;
}
function forceOpaqueMaterial(mat) {
  mat.transparent = false;
  mat.opacity = 1;
  mat.depthWrite = true;
  mat.depthTest = true;
  mat.blending = THREE.NormalBlending;
}
function applyMaterialVisual(mat, layer) {
  if (!mat || mat.userData.ocSkipLayerVisual) return;
  const opacity = clamp(Number(layer.opacity ?? 1), 0, 1);
  const isCutout = Boolean(Number(mat.alphaTest || 0) > 0);

  if (opacity >= 0.995 || isCutout) {
    forceOpaqueMaterial(mat);
    if (isCutout) mat.alphaTest = Math.max(Number(mat.alphaTest || 0), 0.34);
  } else {
    mat.transparent = true;
    mat.opacity = opacity;
    mat.depthWrite = false;
    mat.depthTest = true;
    mat.blending = THREE.NormalBlending;
  }

  if (mat.color) {
    if (!mat.userData.baseColor) mat.userData.baseColor = mat.color.clone();
    mat.color.copy(transformedColor(mat.userData.baseColor, layer));
  }
  mat.needsUpdate = true;
}

export function applyLayer(layer) {
  if (!layer?.group) return;
  if (layer.id === 'treeShadows') layer.opacity = 1;
  layer.group.visible = layer.visible;
  layer.group.position.set(layer.x || 0, layer.y || 0, layer.z || 0);
  const scale = Math.max(0.0001, Number(layer.scale || 1));
  if (layer.id === 'ground') layer.group.scale.set(scale, 1, scale);
  else layer.group.scale.setScalar(scale);
  layer.group.renderOrder = layer.order || 0;
  if (layer.id !== 'treeShadows') {
    layer.group.traverse((node) => {
      if (!node.material) return;
      if (Array.isArray(node.material)) node.material.forEach((mat) => applyMaterialVisual(mat, layer));
      else applyMaterialVisual(node.material, layer);
    });
  }
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
  if (OC.selectedLayerId === 'glbAsset') { if (label) label.textContent = 'Selected: GLB Asset'; createGlbAssetSliders?.(host); return; }
  const layer = OC.layers.get(OC.selectedLayerId);
  if (!layer) { host.innerHTML = '<p class="hint-text">No layer selected.</p>'; return; }
  const base = layerBase(layer.id);
  if (label) label.textContent = `Selected: ${layer.label}`;
  const redraw = () => { applyLayer(layer); refreshOverview?.(); };
  buildSliderRow(host, 'hf-layer', 'x', 'X', -100, 100, 1, offsetFromBase(layer.x, base.x), (v) => { layer.x = Number(base.x || 0) + v; redraw(); });
  buildSliderRow(host, 'hf-layer', 'y', 'Y', -100, 100, 1, offsetFromBase(layer.y, base.y), (v) => { layer.y = Number(base.y || 0) + v; redraw(); });
  buildSliderRow(host, 'hf-layer', 'z', 'Z', -100, 100, 1, offsetFromBase(layer.z, base.z), (v) => { layer.z = Number(base.z || 0) + v; redraw(); });
  buildSliderRow(host, 'hf-layer', 'scaleOffset', 'Scale', -100, 100, 1, factorToSigned((layer.scale || 1) / (base.scale || 1)), (v) => { layer.scale = Number(base.scale || 1) * signedToFactor(v); redraw(); });
  if (layer.id !== 'treeShadows') buildSliderRow(host, 'hf-layer', 'opacityOffset', 'Opacity', -100, 100, 1, opacityOffsetFromBase(layer.opacity, base.opacity), (v) => { layer.opacity = clamp(Number(base.opacity ?? 1) + (v / 100), 0, 1); redraw(); });
  buildSliderRow(host, 'hf-layer', 'brightnessOffset', 'Bright', -100, 100, 1, visualOffsetFromBase(layer.brightness, base.brightness), (v) => { layer.brightness = Number(base.brightness || 1) * sliderToVisualFactor(v); redraw(); });
  buildSliderRow(host, 'hf-layer', 'contrastOffset', 'Contrast', -100, 100, 1, visualOffsetFromBase(layer.contrast, base.contrast), (v) => { layer.contrast = Number(base.contrast || 1) * sliderToVisualFactor(v); redraw(); });
  buildSliderRow(host, 'hf-layer', 'saturationOffset', 'Saturation', -100, 100, 1, visualOffsetFromBase(layer.saturation, base.saturation), (v) => { layer.saturation = Number(base.saturation || 1) * sliderToVisualFactor(v); redraw(); });
  buildSliderRow(host, 'hf-layer', 'tintStrength', 'Tint Amt', -100, 100, 1, tintOffsetFromBase(layer.tintStrength, base.tintStrength), (v) => { layer.tintStrength = clamp(Number(base.tintStrength || 0) + (v / 100), 0, 1); redraw(); });
  buildSliderRow(host, 'hf-layer', 'order', 'Order', -100, 100, 1, offsetFromBase(layer.order, base.order), (v) => { layer.order = Number(base.order || 0) + v; redraw(); });
  const tintRow = document.createElement('label');
  tintRow.className = 'field-block';
  tintRow.innerHTML = `<span>Layer Tint</span><input id="hf-layer-tint" type="color" value="${layer.tint || base.tint || '#ffffff'}">`;
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
