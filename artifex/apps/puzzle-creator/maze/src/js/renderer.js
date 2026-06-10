import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { MATERIAL_PRESETS, FLOOR_PRESETS } from './config.js';
import { state, runtime } from './state.js';
import { dom } from './dom.js';

let scene;
let camera;
let renderer;
let orbitControls;
let wallGroup;
let floorMesh;
let solutionMesh;
let hoverGuide;
let directionalLight;
let ambientLight;
let activeGeometries = [];
let wallMeshes = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

export function initRenderer() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080604);
  scene.fog = new THREE.FogExp2(0x080604, 0.018);

  camera = new THREE.PerspectiveCamera(60, 1, 0.1, 900);
  camera.position.set(24, 24, 32);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  dom.threeContainer.appendChild(renderer.domElement);

  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.055;
  orbitControls.maxPolarAngle = Math.PI / 2 - 0.04;
  orbitControls.minDistance = 3;
  orbitControls.maxDistance = 150;

  ambientLight = new THREE.AmbientLight(0xfff3d0, 0.43);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xfff6dd, 0.92);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 180;
  const span = 60;
  directionalLight.shadow.camera.left = -span;
  directionalLight.shadow.camera.right = span;
  directionalLight.shadow.camera.top = span;
  directionalLight.shadow.camera.bottom = -span;
  directionalLight.shadow.bias = -0.0004;
  scene.add(directionalLight);
  updateLightDirection();

  wallGroup = new THREE.Group();
  scene.add(wallGroup);
  buildHoverGuide();

  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();
  animate();

  runtime.rendererApi = {
    rebuild: build3DWorld,
    solvePath: drawSolutionPath,
    clearSolution: clearSolutionPath,
    zoom: handleZoom,
    setViewMode,
    getWallMeshes: () => wallMeshes,
    raycastFromEvent,
    setCellWall,
    repaintCell,
    setHoverVisible: (visible) => { if (hoverGuide) hoverGuide.visible = visible; }
  };

  return runtime.rendererApi;
}

function buildHoverGuide() {
  const geo = new THREE.BoxGeometry(1.04, 1.5, 1.04);
  const mat = new THREE.MeshBasicMaterial({ color: 0x7fd2cf, wireframe: true, transparent: true, opacity: 0.7 });
  hoverGuide = new THREE.Mesh(geo, mat);
  hoverGuide.visible = false;
  scene.add(hoverGuide);
}

function resizeRenderer() {
  const width = Math.max(1, dom.threeContainer.clientWidth);
  const height = Math.max(1, dom.threeContainer.clientHeight);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function updateLightDirection() {
  const angle = (state.lightAngle * Math.PI) / 180;
  directionalLight.position.set(Math.cos(angle) * 38, 42, Math.sin(angle) * 38);
}

export function getLayoutPosition(x, y) {
  let posX = x;
  let posZ = y;
  if (state.layoutStyle === 1) {
    posX += Math.sin(y * 0.5) * 0.18 + Math.cos(x * 0.5) * 0.12;
    posZ += Math.cos(y * 0.5) * 0.12 + Math.sin(x * 0.5) * 0.18;
  } else if (state.layoutStyle === 2) {
    posX += Math.sin(y * 0.25) * 0.6 + Math.cos(x * 0.2) * 0.3;
    posZ += Math.cos(x * 0.25) * 0.6 + Math.sin(y * 0.2) * 0.3;
  }
  return { x: posX, z: posZ };
}

function createRoundedRectShape(width, depth, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -depth / 2;
  const r = Math.min(radius, width / 2, depth / 2);
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + depth - r);
  shape.quadraticCurveTo(x + width, y + depth, x + width - r, y + depth);
  shape.lineTo(x + r, y + depth);
  shape.quadraticCurveTo(x, y + depth, x, y + depth - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function makeGeometries() {
  activeGeometries.forEach((geo) => geo.dispose());
  activeGeometries = [];

  if (state.edgeStyle === 0) {
    activeGeometries.push(new THREE.BoxGeometry(1, state.wallHeight, 1));
  } else if (state.edgeStyle === 1) {
    for (let i = 0; i < 4; i += 1) {
      const geo = new THREE.BoxGeometry(1, state.wallHeight, 1, 3, 3, 3);
      const pos = geo.attributes.position;
      for (let j = 0; j < pos.count; j += 1) {
        const y = pos.getY(j);
        if (y > -state.wallHeight / 2 + 0.03) {
          pos.setX(j, pos.getX(j) + (Math.random() - 0.5) * 0.11);
          pos.setY(j, pos.getY(j) + (Math.random() - 0.5) * 0.1);
          pos.setZ(j, pos.getZ(j) + (Math.random() - 0.5) * 0.11);
        }
      }
      geo.computeVertexNormals();
      activeGeometries.push(geo);
    }
  } else {
    const shape = createRoundedRectShape(1, 1, 0.18);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.05, state.wallHeight - 0.1),
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.06,
      curveSegments: 8
    });
    geo.center();
    geo.rotateX(Math.PI / 2);
    activeGeometries.push(geo);
  }
}

function makeWallMaterial(row, col) {
  const override = state.colorMatrix?.[row]?.[col];
  const preset = MATERIAL_PRESETS[state.wallMaterialPreset] || MATERIAL_PRESETS.hedge;
  const color = override || state.wallColor;
  const options = {
    color: new THREE.Color(color || preset.color),
    roughness: preset.roughness,
    metalness: preset.metalness
  };
  if (preset.emissive) {
    options.emissive = new THREE.Color(preset.emissive);
    options.emissiveIntensity = state.wallMaterialPreset === 'shadow' ? 0.38 : 0.16;
  }
  return new THREE.MeshStandardMaterial(options);
}

function makeFloorMaterial() {
  const preset = FLOOR_PRESETS[state.floorStyle] || FLOOR_PRESETS.soil;
  const mat = new THREE.MeshStandardMaterial({ ...preset });
  if (state.floorStyle === 'parchment') mat.wireframe = true;
  return mat;
}

export function build3DWorld() {
  updateLightDirection();
  clearSolutionPath();
  while (wallGroup.children.length) {
    const mesh = wallGroup.children.pop();
    if (mesh.material) mesh.material.dispose();
  }
  makeGeometries();

  const size = state.mazeMatrix.length || state.gridSize;
  wallMeshes = Array.from({ length: size }, () => Array(size).fill(null));

  if (floorMesh) {
    scene.remove(floorMesh);
    floorMesh.geometry.dispose();
    floorMesh.material.dispose();
  }

  const floorGeo = new THREE.PlaneGeometry(size + 10, size + 10);
  floorMesh = new THREE.Mesh(floorGeo, makeFloorMaterial());
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(size / 2 - 0.5, 0, size / 2 - 0.5);
  floorMesh.receiveShadow = state.shadows;
  floorMesh.userData = { type: 'floor' };
  scene.add(floorMesh);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (state.mazeMatrix[y]?.[x] === 1) {
        const geo = activeGeometries[Math.floor(Math.random() * activeGeometries.length)];
        const mesh = new THREE.Mesh(geo, makeWallMaterial(y, x));
        const pos = getLayoutPosition(x, y);
        mesh.position.set(pos.x, state.wallHeight / 2, pos.z);
        mesh.scale.set(state.gap, 1, state.gap);
        mesh.castShadow = state.shadows;
        mesh.receiveShadow = state.shadows;
        mesh.userData = { type: 'wall', row: y, col: x };
        wallGroup.add(mesh);
        wallMeshes[y][x] = mesh;
      }
    }
  }

  fitCamera();
}

function fitCamera() {
  const size = state.mazeMatrix.length || state.gridSize || 31;
  orbitControls.target.set(size / 2 - 0.5, state.wallHeight / 2, size / 2 - 0.5);
  if (state.currentViewMode === 'diorama') {
    camera.position.set(size * 0.76, Math.max(11, size * 0.86), size * 1.05);
  }
  orbitControls.update();
}

function clearSolutionPath() {
  if (!solutionMesh) return;
  scene.remove(solutionMesh);
  solutionMesh.geometry.dispose();
  solutionMesh.material.dispose();
  solutionMesh = null;
}

function drawSolutionPath(path) {
  clearSolutionPath();
  if (!path?.length) return;
  const points = path.map((node) => {
    const pos = getLayoutPosition(node.x, node.y);
    return new THREE.Vector3(pos.x, 0.09, pos.z);
  });
  const curve = new THREE.CatmullRomCurve3(points);
  const tube = new THREE.TubeGeometry(curve, Math.max(6, path.length * 4), 0.13, 8, false);
  const mat = new THREE.MeshBasicMaterial({ color: 0x7fd2cf, transparent: true, opacity: 0.86 });
  solutionMesh = new THREE.Mesh(tube, mat);
  scene.add(solutionMesh);
}

function handleZoom(direction) {
  if (state.currentViewMode === 'walk') {
    if (direction === 'in') camera.fov = Math.max(25, camera.fov - 4);
    if (direction === 'out') camera.fov = Math.min(100, camera.fov + 4);
    if (direction === 'fit') camera.fov = 60;
    camera.updateProjectionMatrix();
    return;
  }

  if (direction === 'fit') {
    fitCamera();
    return;
  }
  const vector = new THREE.Vector3().subVectors(camera.position, orbitControls.target).normalize();
  const currentDistance = camera.position.distanceTo(orbitControls.target);
  const nextDistance = direction === 'in' ? Math.max(3, currentDistance * 0.82) : Math.min(160, currentDistance * 1.18);
  camera.position.copy(orbitControls.target).addScaledVector(vector, nextDistance);
  orbitControls.update();
}

function setViewMode(mode) {
  state.currentViewMode = mode;
  if (mode === 'walk') {
    orbitControls.enabled = false;
    const start = getLayoutPosition(state.startNode.x + 0.5, state.startNode.y + 0.5);
    runtime.player.x = start.x;
    runtime.player.z = start.z;
    runtime.player.angle = Math.PI;
    dom.virtualDpad.classList.remove('is-hidden');
    dom.playerStatusIndicator.textContent = 'Walk Test active';
    updateWalkCamera();
  } else {
    orbitControls.enabled = true;
    dom.virtualDpad.classList.add('is-hidden');
    dom.playerStatusIndicator.textContent = 'Diorama camera';
    camera.fov = 60;
    camera.updateProjectionMatrix();
    fitCamera();
  }
}

function checkWallCollision(x, z, radius = 0.34) {
  const size = state.mazeMatrix.length;
  const cx = Math.floor(x);
  const cz = Math.floor(z);
  for (let row = cz - 2; row <= cz + 2; row += 1) {
    for (let col = cx - 2; col <= cx + 2; col += 1) {
      if (row >= 0 && row < size && col >= 0 && col < size && state.mazeMatrix[row][col] === 1) {
        const pos = getLayoutPosition(col, row);
        if (Math.abs(x - pos.x) < 0.5 + radius && Math.abs(z - pos.z) < 0.5 + radius) return true;
      }
    }
  }
  return x < -1 || z < -1 || x > size + 1 || z > size + 1;
}

function updateWalkCamera() {
  const eye = Math.max(0.8, state.wallHeight * 0.67);
  camera.position.set(runtime.player.x, eye, runtime.player.z);
  camera.lookAt(
    runtime.player.x + Math.sin(runtime.player.angle),
    eye,
    runtime.player.z + Math.cos(runtime.player.angle)
  );
}

function handleWalkMovement() {
  if (state.currentViewMode !== 'walk') return;
  const keys = runtime.keys;
  if (keys.a || keys.ArrowLeft) runtime.player.angle += runtime.player.turnSpeed;
  if (keys.d || keys.ArrowRight) runtime.player.angle -= runtime.player.turnSpeed;

  let dx = 0;
  let dz = 0;
  if (keys.w || keys.ArrowUp) {
    dx += Math.sin(runtime.player.angle) * runtime.player.speed;
    dz += Math.cos(runtime.player.angle) * runtime.player.speed;
  }
  if (keys.s || keys.ArrowDown) {
    dx -= Math.sin(runtime.player.angle) * runtime.player.speed;
    dz -= Math.cos(runtime.player.angle) * runtime.player.speed;
  }

  const nx = runtime.player.x + dx;
  const nz = runtime.player.z + dz;
  if (!checkWallCollision(nx, runtime.player.z)) runtime.player.x = nx;
  if (!checkWallCollision(runtime.player.x, nz)) runtime.player.z = nz;
  updateWalkCamera();
}

function animate() {
  requestAnimationFrame(animate);
  if (state.currentViewMode === 'walk') handleWalkMovement();
  else orbitControls.update();

  if (solutionMesh?.material) {
    solutionMesh.material.opacity = 0.68 + Math.sin(Date.now() * 0.003) * 0.18;
  }

  renderer.render(scene, camera);
}

function raycastFromEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const point = event.touches?.[0] || event;
  pointer.x = ((point.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((point.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects([floorMesh, ...wallGroup.children], false);
  if (!hits.length) return null;
  const hit = hits[0];
  if (hit.object.userData.type === 'wall') {
    return { kind: 'wall', row: hit.object.userData.row, col: hit.object.userData.col, point: hit.point };
  }
  const col = Math.round(hit.point.x);
  const row = Math.round(hit.point.z);
  return { kind: 'floor', row, col, point: hit.point };
}

function setCellWall(row, col, value) {
  const size = state.mazeMatrix.length;
  if (row < 0 || col < 0 || row >= size || col >= size) return;
  state.mazeMatrix[row][col] = value;
  build3DWorld();
}

function repaintCell(row, col) {
  const mesh = wallMeshes?.[row]?.[col];
  if (!mesh) return;
  if (mesh.material) mesh.material.dispose();
  mesh.material = makeWallMaterial(row, col);
}
