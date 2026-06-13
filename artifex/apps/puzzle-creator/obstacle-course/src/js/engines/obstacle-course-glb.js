import { OC } from './obstacle-course-state.js';
import { THREE } from './obstacle-course-scene.js';
import { buildSliderRow } from './obstacle-course-ui.js';
import { selectObjects } from './obstacle-course-scene.js';
import { signedToFactor, factorToSigned, sliderToOpacity, opacityToSlider, sliderToVisualFactor, visualFactorToSlider, sliderToTint, tintToSlider } from './obstacle-course-utils.js';

export function loadGlbAsset(url) {
  return new Promise((resolve) => {
    if (!OC.gltfLoader) return resolve(false);
    OC.gltfLoader.load(`${url}?v=${OC.cacheVersion}`, (gltf) => { OC.glbTemplates.set(url, gltf); resolve(true); }, undefined, () => resolve(false));
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
  row.innerHTML = `<span>GLB Asset</span><select id="hf-glb-asset-select">${urls.map((url) => `<option value="${url}">${url.split('/').pop()}</option>`).join('')}</select>`;
  host.appendChild(row);
  const select = row.querySelector('select');
  select.value = OC.selectedGlbAssetUrl;
  select.addEventListener('change', (event) => { OC.selectedGlbAssetUrl = event.target.value; createGlbAssetSliders(host); refreshGlbSelection(); });
  const cfg = glbControl(OC.selectedGlbAssetUrl);
  const apply = () => { applyAllGlbAssetControls(); refreshGlbSelection(); };
  buildSliderRow(host, 'hf-glb', 'x', 'X', -100, 100, 1, cfg.x || 0, (v) => { cfg.x = v; apply(); });
  buildSliderRow(host, 'hf-glb', 'y', 'Y', -100, 100, 1, cfg.y || 0, (v) => { cfg.y = v; apply(); });
  buildSliderRow(host, 'hf-glb', 'z', 'Z', -100, 100, 1, cfg.z || 0, (v) => { cfg.z = v; apply(); });
  cfg.scaleOffset = cfg.scaleOffset ?? factorToSigned(cfg.scale);
  buildSliderRow(host, 'hf-glb', 'scaleOffset', 'Scale', -100, 100, 1, cfg.scaleOffset, (v) => { cfg.scaleOffset = v; cfg.scale = signedToFactor(v); apply(); });
  cfg.opacityOffset = cfg.opacityOffset ?? opacityToSlider(cfg.opacity);
  buildSliderRow(host, 'hf-glb', 'opacityOffset', 'Opacity', -100, 100, 1, cfg.opacityOffset, (v) => { cfg.opacityOffset = v; cfg.opacity = sliderToOpacity(v); apply(); });
  cfg.brightnessOffset = cfg.brightnessOffset ?? visualFactorToSlider(cfg.brightness);
  buildSliderRow(host, 'hf-glb', 'brightnessOffset', 'Bright', -100, 100, 1, cfg.brightnessOffset, (v) => { cfg.brightnessOffset = v; cfg.brightness = sliderToVisualFactor(v); apply(); });
  cfg.contrastOffset = cfg.contrastOffset ?? visualFactorToSlider(cfg.contrast);
  buildSliderRow(host, 'hf-glb', 'contrastOffset', 'Contrast', -100, 100, 1, cfg.contrastOffset, (v) => { cfg.contrastOffset = v; cfg.contrast = sliderToVisualFactor(v); apply(); });
  cfg.saturationOffset = cfg.saturationOffset ?? visualFactorToSlider(cfg.saturation);
  buildSliderRow(host, 'hf-glb', 'saturationOffset', 'Saturation', -100, 100, 1, cfg.saturationOffset, (v) => { cfg.saturationOffset = v; cfg.saturation = sliderToVisualFactor(v); apply(); });
  buildSliderRow(host, 'hf-glb', 'tintStrength', 'Tint Amt', -100, 100, 1, tintToSlider(cfg.tintStrength), (v) => { cfg.tintStrength = sliderToTint(v); apply(); });
  buildSliderRow(host, 'hf-glb', 'order', 'Order', -100, 100, 1, cfg.order || 0, (v) => { cfg.order = v; apply(); });
}

function glbControl(url) {
  if (!OC.glbControls.has(url)) OC.glbControls.set(url, { x:0, y:0, z:0, scale:1, opacity:1, brightness:1, contrast:1, saturation:1, tint:'#ffffff', tintStrength:0, order:0 });
  return OC.glbControls.get(url);
}

export function applyAllGlbAssetControls() {
  OC.glbInstances.forEach((obj) => {
    const cfg = glbControl(obj.userData.glbAssetUrl);
    obj.position.copy(obj.userData.basePosition).add(new THREE.Vector3(cfg.x || 0, cfg.y || 0, cfg.z || 0));
    const scale = (obj.userData.baseScaleValue || 1) * (cfg.scale || 1);
    obj.scale.setScalar(scale);
    obj.visible = (cfg.opacity ?? 1) > 0.01;
  });
}

export function refreshGlbSelection() { selectObjects(OC.glbInstances.filter((obj) => obj.userData.glbAssetUrl === OC.selectedGlbAssetUrl)); }
