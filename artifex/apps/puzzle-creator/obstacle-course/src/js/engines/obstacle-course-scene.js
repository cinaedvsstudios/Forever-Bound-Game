import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { OC, GROUND_Y } from './obstacle-course-state.js';
import { ASSETS } from './obstacle-course-assets.js?v=3.0.44';
import { clamp } from './obstacle-course-utils.js';

export { THREE, GLTFLoader };

const MAX_INSTANCE_SELECTION_MARKERS = 140;

function effectiveVanishY() {
  return Number(OC.vanishY || 0) + 100;
}

function stripCacheVersion(url = '') {
  return String(url).replace(/([?&])v=[^&]+(&)?/, (match, prefix, suffix) => (prefix === '?' && suffix ? '?' : ''));
}

function textureUrlWithCache(url = '') {
  if (!url) return '';
  if (/[?&]v=/.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${OC.cacheVersion}`;
}

export function initScene(updateFrame) {
  OC.textureLoader = new THREE.TextureLoader();
  OC.gltfLoader = new GLTFLoader();
  OC.scene = new THREE.Scene();
  OC.camera = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 5000);
  OC.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  OC.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  OC.renderer.outputEncoding = THREE.sRGBEncoding;
  OC.stage.tabIndex = 0;
  OC.renderer.domElement.tabIndex = 0;
  OC.stage.appendChild(OC.renderer.domElement);
  OC.world = new THREE.Group();
  OC.scene.add(OC.world);
  OC.scene.add(new THREE.HemisphereLight(0xffffff, 0x203020, 1.25));
  const sun = new THREE.DirectionalLight(0xffffff, 1.05);
  sun.position.set(-8, 16, 8);
  OC.scene.add(sun);
  OC.grid = new THREE.GridHelper(140, 70, 0xeec45a, 0x2d5b42);
  OC.grid.position.y = GROUND_Y + 0.08;
  OC.grid.visible = false;
  OC.scene.add(OC.grid);
  OC.clock = new THREE.Clock();
  OC.updateFrame = updateFrame;
  applyCamera();
  resizeRenderer();
  applyBackgroundPlate();
  window.addEventListener('resize', resizeRenderer);
  startRenderLoop();
}

export function loadTexture(url, options = {}) {
  const key = `${url}|${JSON.stringify(options)}`;
  if (OC.textures.has(key)) return OC.textures.get(key);
  const plainUrl = stripCacheVersion(url);
  const preloadedImage = OC.images.get(url) || OC.images.get(plainUrl);
  const texture = preloadedImage ? new THREE.Texture(preloadedImage) : OC.textureLoader.load(textureUrlWithCache(url));
  texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  if (preloadedImage) texture.needsUpdate = true;
  if (options.repeat) {
    texture.wrapS = options.repeatX === false ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    texture.wrapT = options.repeatY === false ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    texture.repeat.set(options.repeat[0], options.repeat[1]);
  }
  OC.textures.set(key, texture);
  return texture;
}

export function resizeRenderer() {
  if (!OC.renderer || !OC.stage || !OC.camera) return;
  const width = Math.max(1, OC.stage.clientWidth);
  const height = Math.max(300, Math.round(width * 9 / 16));
  OC.camera.aspect = width / height;
  OC.camera.updateProjectionMatrix();
  OC.renderer.setSize(width, height);
  renderOnce();
}

export function applyCamera() {
  if (!OC.camera) return;
  const vpY = effectiveVanishY();
  const camX = (OC.vanishX || 0) * 0.035;
  const lookX = (OC.vanishX || 0) * 0.07;
  const lookY = GROUND_Y + vpY * 0.05;
  OC.camera.position.set(camX, 4.4, 10.8);
  OC.camera.lookAt(lookX, lookY, -92);
  OC.camera.rotation.z += (OC.cameraAngle || 0) * 0.0035;
  OC.camera.updateProjectionMatrix();
  applyBackgroundPlate();
}

export function applyBackgroundPlate() {
  if (!OC.stage) return;
  if (OC.whiteBackground) {
    OC.stage.style.setProperty('--oc-bg-image', 'none');
    OC.stage.style.backgroundColor = '#fff';
    return;
  }
  const vpY = effectiveVanishY();
  const x = 50 + (OC.vanishX || 0) * 0.18;
  const y = 50 + vpY * 0.18 + (OC.backgroundJumpShift || 0);
  const zoom = Math.max(100, Math.round((OC.backgroundZoom || 1.1) * 100));
  OC.stage.style.backgroundColor = '#05080d';
  OC.stage.style.setProperty('--oc-bg-image', `url("${ASSETS.background}?v=${OC.cacheVersion}")`);
  OC.stage.style.setProperty('--oc-bg-size', `${zoom}%`);
  OC.stage.style.setProperty('--oc-bg-x', `${clamp(x, -25, 125)}%`);
  OC.stage.style.setProperty('--oc-bg-y', `${clamp(y, -25, 125)}%`);
}

export function updateWorldTransform(playerWorldX) {
  if (!OC.world) return;
  const jumpOffset = Number(OC.player?.y || 0);
  OC.world.position.x = -playerWorldX;
  OC.world.position.y = -jumpOffset;
  OC.world.position.z = OC.distance;
  if (OC.grid) OC.grid.position.y = GROUND_Y + 0.08 - jumpOffset;
}

export function renderOnce() {
  if (!OC.renderer || !OC.scene || !OC.camera) return;
  OC.selectionBoxes.forEach((box) => box.update?.());
  OC.renderer.render(OC.scene, OC.camera);
}

export function startRenderLoop() {
  if (OC.renderLoopRunning) return;
  OC.renderLoopRunning = true;
  OC.clock?.getDelta?.();
  OC.animationFrame = requestAnimationFrame(animateFrame);
}

function animateFrame() {
  if (!OC.renderLoopRunning) return;
  const dt = Math.min(0.033, OC.clock?.getDelta?.() || 0.016);
  if (Array.isArray(OC.frameCallbacks)) {
    OC.frameCallbacks.forEach((callback) => {
      try { callback(dt); } catch (error) { console.warn('[ObstacleCourse] frame callback failed', error); }
    });
  }
  if (OC.active) OC.updateFrame?.(dt);
  renderOnce();
  OC.animationFrame = requestAnimationFrame(animateFrame);
}

function removeSelectionObject(object) {
  if (!object) return;
  object.parent?.remove?.(object);
  OC.scene?.remove?.(object);
  object.geometry?.dispose?.();
  object.material?.dispose?.();
  object.children?.forEach?.((child) => {
    child.geometry?.dispose?.();
    child.material?.dispose?.();
  });
}

function instanceSelectionMaterial() {
  const mat = new THREE.LineBasicMaterial({ color: 0xeec45a, depthTest: false, transparent: false });
  mat.userData.ocSkipLayerVisual = true;
  return mat;
}

function addInstancedSelectionMarkers(group) {
  const placements = Array.isArray(group?.userData?.placements) ? group.userData.placements : [];
  if (!placements.length) return false;
  const markerGroup = new THREE.Group();
  markerGroup.name = 'SelectedGLBInstanceMarkers';
  markerGroup.userData.ocSkipLayerVisual = true;
  markerGroup.renderOrder = 999;
  const material = instanceSelectionMaterial();
  const sorted = [...placements].sort((a, b) => Math.abs((-a.z) - OC.distance) - Math.abs((-b.z) - OC.distance)).slice(0, MAX_INSTANCE_SELECTION_MARKERS);
  sorted.forEach((placement) => {
    const radius = clamp(Math.abs(Number(placement.scale || 1)) * 1.8, 0.75, 3.2);
    const ringGeometry = new THREE.RingGeometry(radius * 0.82, radius, 24);
    const ring = new THREE.LineLoop(new THREE.EdgesGeometry(ringGeometry), material);
    ring.position.set(placement.x, placement.y + 0.09, placement.z);
    ring.rotation.x = -Math.PI / 2;
    ring.renderOrder = 999;
    markerGroup.add(ring);
    const poleGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, radius * 2.4, 0)]);
    const pole = new THREE.Line(poleGeometry, material);
    pole.position.set(placement.x, placement.y + 0.1, placement.z);
    pole.renderOrder = 999;
    markerGroup.add(pole);
  });
  group.add(markerGroup);
  OC.selectionBoxes.push(markerGroup);
  return true;
}

export function selectObjects(objects = []) {
  OC.selectionBoxes.forEach(removeSelectionObject);
  OC.selectionBoxes = [];
  objects.filter(Boolean).slice(0, 20).forEach((obj) => {
    if (obj.userData?.isInstancedAssetGroup && addInstancedSelectionMarkers(obj)) return;
    const helper = new THREE.BoxHelper(obj, 0xeec45a);
    helper.userData.ocSkipLayerVisual = true;
    helper.renderOrder = 999;
    OC.scene.add(helper);
    OC.selectionBoxes.push(helper);
  });
  renderOnce();
}
