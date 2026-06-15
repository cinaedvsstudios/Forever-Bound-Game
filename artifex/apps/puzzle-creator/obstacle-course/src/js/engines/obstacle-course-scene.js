import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { OC, GROUND_Y } from './obstacle-course-state.js';
import { ASSETS } from './obstacle-course-assets.js';
import { clamp } from './obstacle-course-utils.js';

export { THREE, GLTFLoader };

function effectiveVanishY() {
  return Number(OC.vanishY || 0) + 100;
}

export function initScene(updateFrame) {
  OC.textureLoader = new THREE.TextureLoader();
  OC.gltfLoader = new GLTFLoader();
  OC.scene = new THREE.Scene();
  OC.camera = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 5000);
  OC.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  OC.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
  const preloadedImage = OC.images.get(url);
  const texture = preloadedImage ? new THREE.Texture(preloadedImage) : OC.textureLoader.load(`${url}?v=${OC.cacheVersion}`);
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
  OC.selectionBoxes.forEach((box) => box.update());
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
  if (OC.active) OC.updateFrame?.(dt);
  renderOnce();
  OC.animationFrame = requestAnimationFrame(animateFrame);
}

export function selectObjects(objects = []) {
  OC.selectionBoxes.forEach((box) => OC.scene?.remove(box));
  OC.selectionBoxes = [];
  objects.filter(Boolean).slice(0, 20).forEach((obj) => {
    const helper = new THREE.BoxHelper(obj, 0xeec45a);
    OC.scene.add(helper);
    OC.selectionBoxes.push(helper);
  });
  renderOnce();
}
