import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { patternPaletteColor } from './pattern-lock-templates.js';

const DEFAULT_EMPTY = '#d5dbd6';
const DEFAULT_GLOW = '#9ee6a4';
const BASE_SIZE = 0.36;
const MIN_CAMERA_DISTANCE = 5.3;
const MAX_CAMERA_DISTANCE = 15;

export class PatternLockRenderer {
  constructor(host, callbacks = {}) {
    this.host = host;
    this.callbacks = callbacks;
    this.emptyColor = DEFAULT_EMPTY;
    this.glowColor = DEFAULT_GLOW;
    this.pointScale = 1;
    this.pointShape = 'sphere';
    this.pointTexture = null;
    this.nodes = [];
    this.active = false;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.pointerStart = null;
    this.dragState = null;
    this.cameraDistance = 10.8;
    this.buildScene();
  }

  buildScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06100a);
    this.scene.fog = new THREE.FogExp2(0x06100a, 0.038);
    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.host.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.AmbientLight(0xfff0dc, 0.7));
    const key = new THREE.DirectionalLight(0xfff2d9, 1.05);
    key.position.set(6, 9, 10);
    key.castShadow = true;
    this.scene.add(key);
    const fill = new THREE.PointLight(0x7fd2cf, 0.72, 28);
    fill.position.set(-7, 4, 6);
    this.scene.add(fill);
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.resetView();
    this.bindPointerEvents();
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.host);
    }
    this.resize();
  }

  bindPointerEvents() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', (event) => {
      canvas.setPointerCapture(event.pointerId);
      this.pointerStart = { x: event.clientX, y: event.clientY };
      this.dragState = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startRotationX: this.group.rotation.x,
        startRotationY: this.group.rotation.y
      };
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!this.dragState || this.dragState.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - this.dragState.x;
      const deltaY = event.clientY - this.dragState.y;
      this.group.rotation.y = this.dragState.startRotationY + deltaX * 0.009;
      this.group.rotation.x = THREE.MathUtils.clamp(this.dragState.startRotationX + deltaY * 0.009, -Math.PI * 0.48, Math.PI * 0.48);
    });
    canvas.addEventListener('pointerup', (event) => {
      if (!this.pointerStart) return;
      const moved = Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y);
      this.pointerStart = null;
      this.dragState = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      if (moved < 5) this.pickNode(event);
    });
    canvas.addEventListener('pointercancel', (event) => {
      this.pointerStart = null;
      this.dragState = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    });
    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.cameraDistance = THREE.MathUtils.clamp(this.cameraDistance + Math.sign(event.deltaY) * 0.55, MIN_CAMERA_DISTANCE, MAX_CAMERA_DISTANCE);
      this.updateCameraDistance();
    }, { passive: false });
  }

  pickNode(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.nodes, false)[0];
    if (hit && this.callbacks.onPointClick) this.callbacks.onPointClick(hit.object.userData.index);
  }

  createGeometry() {
    if (this.pointShape === 'cube') return new THREE.BoxGeometry(BASE_SIZE * 1.7, BASE_SIZE * 1.7, BASE_SIZE * 1.7, 1, 1, 1);
    if (this.pointShape === 'gem') return new THREE.OctahedronGeometry(BASE_SIZE * 1.12, 0);
    return new THREE.SphereGeometry(BASE_SIZE, 14, 14);
  }

  createMaterial() {
    return new THREE.MeshStandardMaterial({
      color: this.emptyColor,
      map: this.pointTexture,
      roughness: 0.34,
      metalness: 0.06
    });
  }

  load(points, placements, isComplete = false) {
    this.clear();
    points.forEach((point, index) => {
      const mesh = new THREE.Mesh(this.createGeometry(), this.createMaterial());
      mesh.position.set(point.x, point.y, point.z);
      mesh.castShadow = true;
      mesh.userData = { index, expected: point.expected, zone: point.zone, emoji: null, sprite: null };
      mesh.scale.setScalar(this.pointScale);
      this.group.add(mesh);
      this.nodes.push(mesh);
    });
    this.paint(placements, isComplete);
    this.resetView();
  }

  clear() {
    this.nodes.forEach((node) => {
      if (node.userData.sprite) this.disposeSprite(node.userData.sprite);
      node.geometry.dispose();
      node.material.dispose();
      this.group.remove(node);
    });
    this.nodes = [];
  }

  paint(placements, isComplete = false) {
    this.nodes.forEach((node) => {
      const emoji = placements.get(node.userData.index) || null;
      node.userData.emoji = emoji;
      node.material.map = this.pointTexture;
      node.material.needsUpdate = true;
      if (node.userData.sprite) {
        node.remove(node.userData.sprite);
        this.disposeSprite(node.userData.sprite);
        node.userData.sprite = null;
      }
      if (isComplete) {
        node.material.color.set('#79c97b');
        node.material.emissive.set('#173e20');
        node.material.emissiveIntensity = 0.54;
      } else if (emoji) {
        node.material.color.set(patternPaletteColor(emoji));
        node.material.emissive.set('#07130b');
        node.material.emissiveIntensity = 0.13;
      } else {
        node.material.color.set(this.emptyColor);
        node.material.emissive.set('#000000');
        node.material.emissiveIntensity = 0;
      }
      if (emoji) {
        const sprite = this.createEmojiSprite(emoji);
        node.add(sprite);
        node.userData.sprite = sprite;
      }
    });
  }

  createEmojiSprite(emoji) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = '76px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    context.fillText(emoji, 64, 68);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.56, 0.56, 0.56);
    sprite.renderOrder = 4;
    return sprite;
  }

  disposeSprite(sprite) {
    sprite.material.map?.dispose();
    sprite.material.dispose();
  }

  setPointScale(percent) {
    this.pointScale = percent / 100;
    this.nodes.forEach((node) => node.scale.setScalar(this.pointScale));
  }

  setPointShape(shape) {
    this.pointShape = ['sphere', 'cube', 'gem'].includes(shape) ? shape : 'sphere';
    this.nodes.forEach((node) => {
      node.geometry.dispose();
      node.geometry = this.createGeometry();
    });
  }

  setEmptyColor(color, placements, complete) {
    this.emptyColor = color;
    this.paint(placements, complete);
  }

  setGlowColor(color) {
    this.glowColor = color;
  }

  async setPointTexture(file, placements, complete) {
    const dataUrl = await readFileAsDataUrl(file);
    const nextTexture = await loadTexture(dataUrl);
    nextTexture.colorSpace = THREE.SRGBColorSpace || undefined;
    const previousTexture = this.pointTexture;
    this.pointTexture = nextTexture;
    this.paint(placements, complete);
    previousTexture?.dispose();
  }

  clearPointTexture(placements, complete) {
    const previousTexture = this.pointTexture;
    this.pointTexture = null;
    this.paint(placements, complete);
    previousTexture?.dispose();
  }

  resetView() {
    if (!this.camera || !this.group) return;
    this.cameraDistance = 10.8;
    this.camera.position.set(0, 0, this.cameraDistance);
    this.camera.lookAt(0, 0, 0);
    this.group.rotation.set(-0.34, 0.64, 0);
  }

  updateCameraDistance() {
    this.camera.position.setLength(this.cameraDistance);
    this.camera.lookAt(0, 0, 0);
  }

  resize() {
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  start() {
    if (this.active) return;
    this.active = true;
    const draw = () => {
      if (!this.active) return;
      this.renderer.render(this.scene, this.camera);
      this.frame = window.requestAnimationFrame(draw);
    };
    draw();
  }

  stop() {
    this.active = false;
    if (this.frame) window.cancelAnimationFrame(this.frame);
    this.frame = null;
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Unable to read the texture file.'));
    reader.readAsDataURL(file);
  });
}

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, resolve, undefined, reject);
  });
}
