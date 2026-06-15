import { OC } from './obstacle-course-state.js';
import { buildSliderRow } from './obstacle-course-ui.js';
import { signedToFactor, factorToSigned, sliderToVisualFactor, visualFactorToSlider, clamp } from './obstacle-course-utils.js';
import { renderOnce, selectObjects, applyBackgroundPlate } from './obstacle-course-scene.js';
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
  OC.layers.set(id, layer);
  return layer;
}

export function registerEntity(type, object, meta = {}) {
  const entity = { type, object, ...meta };
  OC.entities.push(entity);
  object.userData.ocType = type;
  return entity;
}

function installMaterialVisualShader(mat) {
  if (!mat || mat.userData.ocVisualShaderInstalled) return;
  mat.userData.ocVisualShaderInstalled = true;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.ocBrightness = { value: 1 };
    shader.uniforms.ocContrast = { value: 1 };
    shader.uniforms.ocSaturation = { value: 1 };
    shader.uniforms.ocTint = { value: [1, 1, 1] };
    shader.uniforms.ocTintStrength = { value: 0 };
    shader.fragmentShader = shader.fragmentShader.replace('void main() {', 'uniform float ocBrightness;\nuniform float ocContrast;\nuniform float ocSaturation;\nuniform vec3 ocTint;\nuniform float ocTintStrength;\nvoid main() {');
    shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', 'vec3 ocColor = gl_FragColor.rgb;\nfloat ocLuma = dot(ocColor, vec3(0.299, 0.587, 0.114));\nocColor = mix(vec3(ocLuma), ocColor, ocSaturation);\nocColor = (ocColor - 0.5) * ocContrast + 0.5;\nocColor *= ocBrightness;\nocColor = mix(ocColor, ocTint, ocTintStrength);\ngl_FragColor.rgb = clamp(ocColor, 0.0, 1.0);\n#include <dithering_fragment>');
    mat.userData.ocShader = shader;
    updateShaderUniforms(mat, mat.userData.ocVisualConfig || {});
  };
}
function hexToRgb01(hex) {
  const value = String(hex || '#ffffff').replace('#', '');
  const num = Number.parseInt(value.length === 3 ? value.split('').map((c) => c + c).join('') : value, 16);
  if (!Number.isFinite(num)) return [1, 1, 1];
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}
function updateShaderUniforms(mat, cfg) {
  const shader = mat.userData.ocShader;
  if (!shader) return;
  shader.uniforms.ocBrightness.value = cfg.brightness ?? 1;
  shader.uniforms.ocContrast.value = cfg.contrast ?? 1;
  shader.uniforms.ocSaturation.value = cfg.saturation ?? 1;
  shader.uniforms.ocTint.value = hexToRgb01(cfg.tint || '#ffffff');
  shader.uniforms.ocTintStrength.value = cfg.tintStrength ?? 0;
}
function applyMaterialVisual(mat, layer) {
  if (!mat || mat.userData.ocSkipLayerVisual) return;
  mat.transparent = (layer.opacity ?? 1) < 0.995 || mat.transparent;
  mat.opacity = layer.opacity ?? 1;
  if (mat.color) { if (!mat.userData.baseColor) mat.userData.baseColor = mat.color.clone(); mat.color.copy(mat.userData.baseColor); }
  const cfg = { brightness: layer.brightness ?? 1, contrast: layer.contrast ?? 1, saturation: layer.saturation ?? 1, tint: layer.tint || '#ffffff', tintStrength: layer.tintStrength || 0 };
  mat.userData.ocVisualConfig = cfg;
  installMaterialVisualShader(mat);
  updateShaderUniforms(mat, cfg);
  mat.needsUpdate = true;
}

export function applyLayer(layer) {
  if (!layer?.group) return;
  layer.group.visible = layer.visible;
  layer.group.position.set(layer.x || 0, layer.y || 0, layer.z || 0);
  const scale = Math.max(0.0001, Number(layer.scale || 1));
  if (layer.id === 'ground') layer.group.scale.set(scale, 1, scale);
  else layer.group.scale.setScalar(scale);
  layer.group.renderOrder = layer.order || 0;
  if (layer.id !== 'treeShadows') {
    layer.group.traverse((node) => {
      if (node.material) {
        if (Array.isArray(node.material)) node.material.forEach((mat) => applyMaterialVisual(mat, layer));
        else applyMaterialVisual(node.material, layer);
      }
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
  buildSliderRow(host, 'hf-layer', 'opacityOffset', 'Opacity', -100, 100, 1, opacityOffsetFromBase(layer.opacity, base.opacity), (v) => { layer.opacity = clamp(Number(base.opacity ?? 1) + (v / 100), 0, 1); redraw(); });
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
