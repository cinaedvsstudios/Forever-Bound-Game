import { OC, GROUND_Y } from './obstacle-course-state.js';
import { GLB_ASSETS } from './obstacle-course-assets.js';
import { THREE } from './obstacle-course-scene.js';
import { buildSliderRow } from './obstacle-course-ui.js';
import { selectObjects } from './obstacle-course-scene.js';
import { signedToFactor, factorToSigned, sliderToVisualFactor, visualFactorToSlider, clamp } from './obstacle-course-utils.js';
import { getGlbDefault } from './obstacle-course-settings.js';

function offsetFromBase(value, baseValue) { return Math.round(Number(value || 0) - Number(baseValue || 0)); }
function visualOffsetFromBase(value, baseValue) { const base = Number(baseValue || 1); return visualFactorToSlider(Number(value || base) / base); }
function opacityOffsetFromBase(value, baseValue) { return Math.round((Number(value ?? baseValue ?? 1) - Number(baseValue ?? 1)) * 100); }
function tintOffsetFromBase(value, baseValue) { return Math.round((Number(value || 0) - Number(baseValue || 0)) * 100); }

export function loadGlbAsset(url) {
  return new Promise((resolve) => {
    if (!OC.gltfLoader) return resolve(false);
    let settled = false;
    const done = (ok) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };
    const timeout = window.setTimeout(() => {
      console.warn('[ObstacleCourse] optional GLB timed out', url);
      done(false);
    }, 4500);
    OC.gltfLoader.load(`${url}?v=${OC.cacheVersion}`, (gltf) => {
      window.clearTimeout(timeout);
      OC.glbTemplates.set(url, gltf);
      done(true);
    }, undefined, () => {
      window.clearTimeout(timeout);
      done(false);
    });
  });
}

export function cloneGlbTemplate(url) {
  const template = OC.glbTemplates.get(url);
  if (!template) return null;
  const root = template.scene.clone(true);
  root.traverse((node) => {
    if (node.isMesh) {
      if (node.geometry) node.geometry = node.geometry.clone();
      if (Array.isArray(node.material)) node.material = node.material.map((mat) => cloneMaterial(mat));
      else if (node.material) node.material = cloneMaterial(node.material);
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  return root;
}

function cloneMaterial(mat) {
  const clone = mat.clone();
  if (clone.color) clone.userData.baseColor = clone.color.clone();
  return clone;
}

export function normalizeObjectToHeight(root, targetHeight = 1) {
  if (!root || !Number.isFinite(Number(targetHeight)) || Number(targetHeight) <= 0) return 1;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (!Number.isFinite(size.y) || size.y <= 0.0001) return 1;
  const factor = Number(targetHeight) / size.y;
  root.scale.multiplyScalar(factor);
  return factor;
}

export function settleObjectOnGround(root, groundY = GROUND_Y) {
  if (!root) return;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (!Number.isFinite(box.min.y)) return;
  root.position.y += groundY - box.min.y;
}

export function makeGlbOrFallback(asset, fallbackFactory) {
  const root = cloneGlbTemplate(asset.url);
  if (root) {
    root.userData.normalizedFactor = normalizeObjectToHeight(root, asset.targetHeight || 1);
    return root;
  }
  return fallbackFactory?.();
}

export function createGlbAssetSliders(host) {
  const urls = Array.from(new Set(OC.glbInstances.map((obj) => obj.userData.glbAssetUrl).filter(Boolean)));
  if (!urls.length) { host.innerHTML = '<p class="hint-text">No optional GLB assets loaded yet.</p>'; return; }
  if (!OC.selectedGlbAssetUrl || !urls.includes(OC.selectedGlbAssetUrl)) OC.selectedGlbAssetUrl = urls[0];
  const row = document.createElement('label');
  row.className = 'field-block';
  row.innerHTML = `<span>GLB Asset</span><div class="hf-glb-select-row"><select id="hf-glb-asset-select">${urls.map((url) => `<option value="${url}">${url.split('/').pop()}</option>`).join('')}</select><button id="hf-glb-open-picker" type="button">Browse</button></div>`;
  host.appendChild(row);
  const select = row.querySelector('select');
  select.value = OC.selectedGlbAssetUrl;
  select.addEventListener('change', (event) => { OC.selectedGlbAssetUrl = event.target.value; host.innerHTML = ''; createGlbAssetSliders(host); refreshGlbSelection(); });
  row.querySelector('#hf-glb-open-picker')?.addEventListener('click', () => openGlbPicker(host));
  const cfg = glbControl(OC.selectedGlbAssetUrl);
  const base = getGlbDefault(OC.selectedGlbAssetUrl);
  const apply = () => { applyAllGlbAssetControls(); refreshGlbSelection(); };
  buildSliderRow(host, 'hf-glb', 'x', 'X', -100, 100, 1, offsetFromBase(cfg.x, base.x), (v) => { cfg.x = Number(base.x || 0) + v; apply(); });
  buildSliderRow(host, 'hf-glb', 'y', 'Y', -100, 100, 1, offsetFromBase(cfg.y, base.y), (v) => { cfg.y = Number(base.y || 0) + v; apply(); });
  buildSliderRow(host, 'hf-glb', 'z', 'Z', -100, 100, 1, offsetFromBase(cfg.z, base.z), (v) => { cfg.z = Number(base.z || 0) + v; apply(); });
  buildSliderRow(host, 'hf-glb', 'scaleOffset', 'Scale', -100, 100, 1, factorToSigned((cfg.scale || 1) / (base.scale || 1)), (v) => { cfg.scale = Number(base.scale || 1) * signedToFactor(v); apply(); });
  buildSliderRow(host, 'hf-glb', 'opacityOffset', 'Opacity', -100, 100, 1, opacityOffsetFromBase(cfg.opacity, base.opacity), (v) => { cfg.opacity = clamp(Number(base.opacity ?? 1) + (v / 100), 0, 1); apply(); });
  buildSliderRow(host, 'hf-glb', 'brightnessOffset', 'Bright', -100, 100, 1, visualOffsetFromBase(cfg.brightness, base.brightness), (v) => { cfg.brightness = Number(base.brightness || 1) * sliderToVisualFactor(v); apply(); });
  buildSliderRow(host, 'hf-glb', 'contrastOffset', 'Contrast', -100, 100, 1, visualOffsetFromBase(cfg.contrast, base.contrast), (v) => { cfg.contrast = Number(base.contrast || 1) * sliderToVisualFactor(v); apply(); });
  buildSliderRow(host, 'hf-glb', 'saturationOffset', 'Saturation', -100, 100, 1, visualOffsetFromBase(cfg.saturation, base.saturation), (v) => { cfg.saturation = Number(base.saturation || 1) * sliderToVisualFactor(v); apply(); });
  buildSliderRow(host, 'hf-glb', 'tintStrength', 'Tint Amt', -100, 100, 1, tintOffsetFromBase(cfg.tintStrength, base.tintStrength), (v) => { cfg.tintStrength = clamp(Number(base.tintStrength || 0) + (v / 100), 0, 1); apply(); });
  buildSliderRow(host, 'hf-glb', 'order', 'Order', -100, 100, 1, offsetFromBase(cfg.order, base.order), (v) => { cfg.order = Number(base.order || 0) + v; apply(); });
}

function openGlbPicker(host) {
  const existing = document.getElementById('hf-glb-picker-modal');
  if (existing) existing.remove();
  const modal = document.createElement('section');
  modal.id = 'hf-glb-picker-modal';
  modal.className = 'hf-glb-picker-modal';
  const loaded = new Set(OC.glbInstances.map((obj) => obj.userData.glbAssetUrl).filter(Boolean));
  modal.innerHTML = `<div class="hf-glb-picker-card"><button type="button" class="hf-glb-picker-close">Close</button><h3>GLB Asset Selector</h3><div class="hf-glb-picker-grid">${GLB_ASSETS.map((asset) => `<button type="button" class="hf-glb-tile ${loaded.has(asset.url) ? 'is-loaded' : 'is-missing'}" data-url="${asset.url}"><span class="hf-glb-thumb">${asset.type === 'rock' ? '◆' : asset.type.includes('Detail') ? '⌁' : asset.type.includes('Tree') ? '▲' : '●'}</span><strong>${asset.label}</strong><small>${asset.url.split('/').pop()} · ${loaded.has(asset.url) ? 'loaded' : 'missing'}</small></button>`).join('')}</div></div>`;
  document.body.appendChild(modal);
  modal.querySelector('.hf-glb-picker-close')?.addEventListener('click', () => modal.remove());
  modal.querySelectorAll('.hf-glb-tile').forEach((tile) => tile.addEventListener('click', () => {
    const url = tile.dataset.url;
    if (!loaded.has(url)) return;
    OC.selectedGlbAssetUrl = url;
    host.innerHTML = '';
    createGlbAssetSliders(host);
    refreshGlbSelection();
    modal.remove();
  }));
}

function glbControl(url) {
  if (!OC.glbControls.has(url)) OC.glbControls.set(url, { ...getGlbDefault(url), ...(OC.pendingGlbControls?.[url] || {}) });
  return OC.glbControls.get(url);
}

function applyGlbMaterialVisual(obj, cfg) {
  obj.traverse?.((node) => {
    const materials = Array.isArray(node.material) ? node.material : node.material ? [node.material] : [];
    materials.forEach((mat) => {
      mat.transparent = (cfg.opacity ?? 1) < 0.995 || mat.transparent;
      mat.opacity = cfg.opacity ?? 1;
      if (mat.color) {
        if (!mat.userData.baseColor) mat.userData.baseColor = mat.color.clone();
        mat.color.copy(mat.userData.baseColor).multiplyScalar(cfg.brightness ?? 1);
      }
      mat.needsUpdate = true;
    });
  });
}

export function applyAllGlbAssetControls() {
  OC.glbInstances.forEach((obj) => {
    const cfg = glbControl(obj.userData.glbAssetUrl);
    obj.position.copy(obj.userData.basePosition).add(new THREE.Vector3(cfg.x || 0, cfg.y || 0, cfg.z || 0));
    const scale = (obj.userData.baseScaleValue || 1) * (cfg.scale || 1);
    obj.scale.setScalar(scale);
    obj.visible = (cfg.opacity ?? 1) > 0.01;
    obj.renderOrder = cfg.order || 0;
    applyGlbMaterialVisual(obj, cfg);
  });
}

export function refreshGlbSelection() { selectObjects(OC.glbInstances.filter((obj) => obj.userData.glbAssetUrl === OC.selectedGlbAssetUrl)); }
