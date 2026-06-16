import { OC, GROUND_Y } from './obstacle-course-state.js';
import { THREE } from './obstacle-course-scene.js';
import { getGlbDefault } from './obstacle-course-settings.js';

const GLB_LOAD_TIMEOUT_MS = 10000;
const PLANT_ALPHA_TEST = 0.46;
const instancedPartCache = new Map();
const dummy = new THREE.Object3D();

export function loadGlbAsset(url) {
  return new Promise((resolve) => {
    if (!OC.gltfLoader) return resolve(false);
    if (OC.glbTemplates.has(url)) return resolve(true);
    let settled = false;
    const done = (ok, reason = '') => {
      if (settled) return;
      settled = true;
      OC.optionalAssetStatus?.set?.(url, { url, type: 'glb', status: ok ? 'loaded' : 'failed', reason });
      resolve(ok);
    };
    const timeout = window.setTimeout(() => { console.warn('[ObstacleCourse] optional GLB timed out', url); done(false, 'timeout'); }, GLB_LOAD_TIMEOUT_MS);
    OC.gltfLoader.load(`${url}?v=${OC.cacheVersion}`, (gltf) => {
      window.clearTimeout(timeout);
      OC.glbTemplates.set(url, gltf);
      instancedPartCache.delete(url);
      done(true);
    }, undefined, (error) => {
      window.clearTimeout(timeout);
      console.warn('[ObstacleCourse] optional GLB failed', url, error);
      done(false, 'load-error');
    });
  });
}

export function cloneGlbTemplate(url) {
  const template = OC.glbTemplates.get(url);
  if (!template) return null;
  const root = template.scene.clone(true);
  root.traverse((node) => {
    if (!node.isMesh) return;
    if (node.geometry) node.geometry = node.geometry.clone();
    if (Array.isArray(node.material)) node.material = node.material.map((mat) => cloneMaterial(mat, node, url));
    else if (node.material) node.material = cloneMaterial(node.material, node, url);
    node.castShadow = true;
    node.receiveShadow = true;
    node.frustumCulled = false;
  });
  return root;
}

function cloneMaterial(mat, node = null, assetUrl = '') {
  const clone = mat.clone();
  clone.userData.ocGlbAssetUrl = assetUrl || mat.userData?.ocGlbAssetUrl || '';
  if (clone.color) clone.userData.baseColor = clone.color.clone();
  hardenGlbMaterial(clone, isCutoutMaterial(clone, node, clone.userData.ocGlbAssetUrl));
  return clone;
}

function isPlantAssetUrl(assetUrl = '') {
  const value = String(assetUrl).toLowerCase();
  return ['tree', 'pine', 'oak', 'fern', 'bush', 'geranium', 'leaf', 'grass', 'spruce'].some((word) => value.includes(word));
}

function materialHasAlphaIntent(mat) {
  return Boolean(mat?.alphaMap || mat?.transparent || Number(mat?.opacity ?? 1) < 0.995 || Number(mat?.alphaTest || 0) > 0);
}

function isCutoutMaterial(mat, node = null, assetUrl = '') {
  const materialName = String(mat?.name || '').toLowerCase();
  const nodeName = String(node?.name || '').toLowerCase();
  const nameHit = ['leaf', 'leaves', 'plant', 'branch', 'needle', 'canopy', 'crown', 'fern', 'bush', 'grass', 'foliage'].some((word) => materialName.includes(word) || nodeName.includes(word));
  const plantTexture = isPlantAssetUrl(assetUrl) && Boolean(mat?.map);
  return Boolean(nameHit || plantTexture || materialHasAlphaIntent(mat));
}

function hardenGlbMaterial(mat, cutout = false) {
  if (!mat) return;
  mat.userData.ocSkipLayerVisual = true;
  mat.userData.ocGlbSolidMaterial = true;
  mat.transparent = false;
  mat.opacity = 1;
  mat.depthWrite = true;
  mat.depthTest = true;
  mat.blending = THREE.NormalBlending;
  mat.premultipliedAlpha = false;
  if ('alphaToCoverage' in mat) mat.alphaToCoverage = true;
  if (cutout) {
    mat.alphaTest = Math.max(Number(mat.alphaTest || 0), PLANT_ALPHA_TEST);
    mat.side = THREE.DoubleSide;
  } else {
    mat.alphaTest = 0;
  }
  if (mat.map) mat.map.needsUpdate = true;
  if (mat.alphaMap) mat.alphaMap.needsUpdate = true;
  mat.needsUpdate = true;
}

function clamp01(value) { return Math.min(1, Math.max(0, Number(value || 0))); }

function safeColor(hex) {
  try { return new THREE.Color(hex || '#ffffff'); }
  catch { return new THREE.Color('#ffffff'); }
}

function getVisualUniforms(mat) {
  if (!mat.userData.ocVisualUniforms) {
    mat.userData.ocVisualUniforms = {
      brightness: { value: 1 },
      contrast: { value: 1 },
      saturation: { value: 1 },
      tint: { value: new THREE.Color('#ffffff') },
      tintStrength: { value: 0 },
    };
  }
  return mat.userData.ocVisualUniforms;
}

function installRgbVisualShader(mat) {
  if (!mat || mat.userData.ocRgbVisualShaderInstalled) return;
  const previousOnBeforeCompile = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, renderer) => {
    if (typeof previousOnBeforeCompile === 'function') previousOnBeforeCompile.call(mat, shader, renderer);
    const uniforms = getVisualUniforms(mat);
    shader.uniforms.ocVisualBrightness = uniforms.brightness;
    shader.uniforms.ocVisualContrast = uniforms.contrast;
    shader.uniforms.ocVisualSaturation = uniforms.saturation;
    shader.uniforms.ocVisualTint = uniforms.tint;
    shader.uniforms.ocVisualTintStrength = uniforms.tintStrength;
    const header = `
uniform float ocVisualBrightness;
uniform float ocVisualContrast;
uniform float ocVisualSaturation;
uniform vec3 ocVisualTint;
uniform float ocVisualTintStrength;
vec3 ocApplyRgbVisual(vec3 color) {
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  vec3 adjusted = mix(vec3(luma), color, ocVisualSaturation);
  adjusted = ((adjusted - vec3(0.5)) * ocVisualContrast) + vec3(0.5);
  adjusted *= ocVisualBrightness;
  adjusted = mix(adjusted, ocVisualTint, ocVisualTintStrength);
  return clamp(adjusted, 0.0, 1.0);
}
`;
    if (!shader.fragmentShader.includes('ocApplyRgbVisual')) shader.fragmentShader = shader.fragmentShader.replace('void main() {', `${header}\nvoid main() {`);
    if (shader.fragmentShader.includes('#include <dithering_fragment>')) {
      shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', 'gl_FragColor.rgb = ocApplyRgbVisual(gl_FragColor.rgb);\n#include <dithering_fragment>');
    } else {
      shader.fragmentShader = shader.fragmentShader.replace(/}\s*$/, '  gl_FragColor.rgb = ocApplyRgbVisual(gl_FragColor.rgb);\n}');
    }
  };
  mat.customProgramCacheKey = () => 'oc-rgb-visual-v3';
  mat.userData.ocRgbVisualShaderInstalled = true;
  mat.needsUpdate = true;
}

function setRgbVisualUniforms(mat, cfg) {
  installRgbVisualShader(mat);
  const uniforms = getVisualUniforms(mat);
  uniforms.brightness.value = Number(cfg.brightness ?? 1);
  uniforms.contrast.value = Number(cfg.contrast ?? 1);
  uniforms.saturation.value = Number(cfg.saturation ?? 1);
  uniforms.tint.value.copy(safeColor(cfg.tint || '#ffffff'));
  uniforms.tintStrength.value = clamp01(cfg.tintStrength || 0);
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

function getInstancedParts(asset) {
  if (!asset?.url || !OC.glbTemplates.has(asset.url)) return [];
  if (instancedPartCache.has(asset.url)) return instancedPartCache.get(asset.url);
  const root = cloneGlbTemplate(asset.url);
  if (!root) return [];
  normalizeObjectToHeight(root, asset.targetHeight || 1);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const groundShift = Number.isFinite(box.min.y) ? -box.min.y : 0;
  const parts = [];
  root.traverse((node) => {
    if (!node.isMesh || !node.geometry || !node.material) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    const geometry = node.geometry.clone();
    geometry.applyMatrix4(node.matrixWorld);
    geometry.translate(0, groundShift, 0);
    materials.forEach((mat) => parts.push({ geometry: geometry.clone(), material: cloneMaterial(mat, node, asset.url) }));
  });
  instancedPartCache.set(asset.url, parts);
  return parts;
}

export function createInstancedAssetGroup(asset, placements = []) {
  const parts = getInstancedParts(asset);
  if (!parts.length || !placements.length) return null;
  const group = new THREE.Group();
  group.userData.glbAssetUrl = asset.url;
  group.userData.basePosition = new THREE.Vector3(0, 0, 0);
  group.userData.baseScaleValue = 1;
  group.userData.isInstancedAssetGroup = true;
  group.userData.placements = placements.map((placement) => {
    const x = Number(placement.x || 0);
    return { x, y: Number(placement.y ?? GROUND_Y), z: Number(placement.z || 0), side: placement.side || (x < 0 ? 'left' : 'right'), rotationY: Number(placement.rotationY || 0), scale: Number(placement.scale || 1) };
  });
  parts.forEach((part) => {
    const mesh = new THREE.InstancedMesh(part.geometry, cloneMaterial(part.material, null, asset.url), group.userData.placements.length);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.userData.glbAssetUrl = asset.url;
    mesh.userData.placements = group.userData.placements;
    group.add(mesh);
  });
  updateInstancedGroupMatrices(group, { scale: 1 });
  OC.glbInstances.push(group);
  return group;
}

function sideOffset(cfg, side) {
  const prefix = side === 'left' ? 'left' : 'right';
  return { x: Number(cfg[`${prefix}X`] || 0), y: Number(cfg[`${prefix}Y`] || 0), z: Number(cfg[`${prefix}Z`] || 0) };
}

function updateInstancedGroupMatrices(group, cfg = {}) {
  if (!group?.userData?.isInstancedAssetGroup) return;
  const placements = group.userData.placements || [];
  const scaleMultiplier = Number(cfg.scale || 1);
  group.children.forEach((mesh) => {
    if (!mesh.isInstancedMesh) return;
    placements.forEach((placement, index) => {
      const side = placement.side || (placement.x < 0 ? 'left' : 'right');
      const offset = sideOffset(cfg, side);
      dummy.position.set(placement.x + offset.x, placement.y + offset.y, placement.z + offset.z);
      dummy.rotation.set(0, placement.rotationY, 0);
      const s = Math.max(0.001, placement.scale * scaleMultiplier);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
}

function glbControl(url) {
  if (!OC.glbControls.has(url)) OC.glbControls.set(url, { ...getGlbDefault(url), ...(OC.pendingGlbControls?.[url] || {}) });
  return OC.glbControls.get(url);
}

function applyGlbMaterialVisual(obj, cfg) {
  obj.traverse?.((node) => {
    const assetUrl = node?.userData?.glbAssetUrl || obj?.userData?.glbAssetUrl || '';
    const materials = Array.isArray(node.material) ? node.material : node.material ? [node.material] : [];
    materials.forEach((mat) => {
      const cutout = isCutoutMaterial(mat, node, assetUrl);
      hardenGlbMaterial(mat, cutout);
      if (mat.color) {
        if (!mat.userData.baseColor) mat.userData.baseColor = mat.color.clone();
        mat.color.copy(mat.userData.baseColor);
      }
      setRgbVisualUniforms(mat, cfg);
      mat.needsUpdate = true;
    });
  });
}

function sideForObject(obj) {
  const x = Number(obj?.userData?.basePosition?.x ?? obj?.position?.x ?? 0);
  return x < 0 ? 'left' : 'right';
}

export function applyAllGlbAssetControls() {
  OC.glbInstances.forEach((obj) => {
    const cfg = glbControl(obj.userData.glbAssetUrl);
    const opacity = Number(cfg.opacity ?? 1);
    if (obj.userData.isInstancedAssetGroup) {
      obj.position.copy(obj.userData.basePosition).add(new THREE.Vector3(cfg.x || 0, cfg.y || 0, cfg.z || 0));
      obj.scale.setScalar(1);
      obj.visible = opacity > 0.01;
      obj.renderOrder = cfg.order || 0;
      updateInstancedGroupMatrices(obj, cfg);
      applyGlbMaterialVisual(obj, cfg);
      return;
    }
    const side = sideForObject(obj);
    const offset = sideOffset(cfg, side);
    obj.position.copy(obj.userData.basePosition).add(new THREE.Vector3((cfg.x || 0) + offset.x, (cfg.y || 0) + offset.y, (cfg.z || 0) + offset.z));
    const scale = (obj.userData.baseScaleValue || 1) * (cfg.scale || 1);
    obj.scale.setScalar(scale);
    obj.visible = opacity > 0.01;
    obj.renderOrder = cfg.order || 0;
    applyGlbMaterialVisual(obj, cfg);
  });
}
