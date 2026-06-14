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

function hexToRgb(hex) {
  const value = String(hex || '#ffffff').replace('#', '');
  const expanded = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  const num = Number.parseInt(expanded, 16);
  if (!Number.isFinite(num)) return null;
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

function applyMaterialVisual(mat, layer) {
  if (!mat) return;
  const opacity = layer.opacity ?? 1;
  mat.transparent = opacity < 0.995 || mat.transparent;
  mat.opacity = opacity;
  if (mat.color) {
    if (!mat.userData.baseColor) mat.userData.baseColor = mat.color.clone();
    mat.color.copy(mat.userData.baseColor);
    const tint = hexToRgb(layer.tint || '#ffffff');
    const tintStrength = Math.max(0, Math.min(1, Number(layer.tintStrength || 0)));
    const brightness = Number(layer.brightness || 1);
    if (tint && tintStrength > 0) {
      mat.color.r = mat.color.r * (1 - tintStrength) + tint.r * tintStrength;
      mat.color.g = mat.color.g * (1 - tintStrength) + tint.g * tintStrength;
      mat.color.b = mat.color.b * (1 - tintStrength) + tint.b * tintStrength;
    }
    mat.color.multiplyScalar(brightness);
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
    node.renderOrder = layer.order || 0;
    if (node.material) {
      if (Array.isArray(node.material)) node.material.forEach((mat) => applyMaterialVisual(mat, layer));
      else applyMaterialVisual(node.material, layer);
    }
  });
  renderOnce();
}

export function applyAllLayers() { OC.layers.forEach(applyLayer); }
