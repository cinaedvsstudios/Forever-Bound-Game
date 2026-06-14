import { OC } from './obstacle-course-state.js';
import { renderOnce } from './obstacle-course-scene.js';
import { getLayerDefault } from './obstacle-course-settings.js';

function layerBase(id) { return getLayerDefault(id); }

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
  if (!mat) return;
  mat.transparent = (layer.opacity ?? 1) < 0.995 || mat.transparent;
  mat.opacity = layer.opacity ?? 1;
  if (mat.color) {
    if (!mat.userData.baseColor) mat.userData.baseColor = mat.color.clone();
    mat.color.copy(mat.userData.baseColor);
  }
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
