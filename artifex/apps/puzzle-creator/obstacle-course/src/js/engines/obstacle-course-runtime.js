// Obstacle Course V2.5 / Horse Forest Runner V29
// Clean consolidated live engine: no layout/control patch stack.
// Features: horse POV, modular transparent WEBP path segments, forest_floor_grass2 ground,
// hold-to-move forward/backward, Ctrl duck, hold-extended jump, and off-path slow-trot penalty.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

const ASSET_BASE = './assets/';
const GROUND_Y = -1.62;
const SEGMENT_HEIGHT_PX = 2000;
const SEGMENT_OVERLAP_PX = 250;
const SEGMENT_STEP_PX = SEGMENT_HEIGHT_PX - SEGMENT_OVERLAP_PX;
const SEGMENT_WORLD_LENGTH = 80;
const SEGMENT_WORLD_OVERLAP = 10;
const SEGMENT_WORLD_STEP = SEGMENT_WORLD_LENGTH - SEGMENT_WORLD_OVERLAP;
const PATH_POSITIONS = { left: -6.3, centre: 0, center: 0, right: 6.3 };
const BASE_SPEED = 34;
const BACK_SPEED = -7;
const SLOW_TROT_SPEED = 8;
const ACCEL = 22;
const DECEL = 24;

const ASSETS = {
  horse: `${ASSET_BASE}foreground/horse.png`,
  background: `${ASSET_BASE}backgrounds/horseridebg.jpg`,
  ground: `${ASSET_BASE}ground/forest_floor_grass2.png`,
  pathSegments: {
    straight: { id: 'pathstraight', label: 'Straight', file: `${ASSET_BASE}path-segments/pathstraight.webp`, start: 'centre', end: 'centre' },
    kink: { id: 'pathkink', label: 'Kink', file: `${ASSET_BASE}path-segments/pathkink.webp`, start: 'centre', end: 'centre' },
    left: { id: 'pathleft', label: 'Move left', file: `${ASSET_BASE}path-segments/pathleft.webp`, start: 'centre', end: 'left' },
    right: { id: 'pathright', label: 'Move right', file: `${ASSET_BASE}path-segments/pathright.webp`, start: 'centre', end: 'right' },
    leftToStraight: { id: 'pathlefttostraight', label: 'Left to centre', file: `${ASSET_BASE}path-segments/pathlefttostraight.webp`, start: 'left', end: 'centre' },
    rightToStraight: { id: 'righttostraight', label: 'Right to centre', file: `${ASSET_BASE}path-segments/righttostraight.webp`, start: 'right', end: 'centre' },
  },
  trees: [
    `${ASSET_BASE}3d/tree.glb`,
    `${ASSET_BASE}3d/tree_low-poly.glb`,
    `${ASSET_BASE}3d/hill_top_tree.glb`,
    `${ASSET_BASE}3d/small_pine.glb`,
    `${ASSET_BASE}3d/pine_with_awkward_teenage_face.glb`,
  ],
};

const TEMPLATES = {
  horse_forest_easy: { label: 'Obstacle Course', obstacleRate: 1 },
  horse_forest_dense: { label: 'Dense Forest Ride', obstacleRate: 1.35 },
  horse_forest_night: { label: 'Moonlit Forest Ride', obstacleRate: 1.15 },
};

const OC = {
  mounted: false,
  active: false,
  running: false,
  complete: false,
  templateId: 'horse_forest_easy',
  difficulty: 2,
  duration: 45,
  maxDuration: 300,
  speed: BASE_SPEED,
  currentSpeed: 0,
  targetSpeed: 0,
  steerSpeed: 9,
  laneWidth: 2.7,
  distance: 0,
  courseLength: 1530,
  score: 0,
  hits: 0,
  jumps: 0,
  collected: 0,
  successScore: 20,
  bumpStrength: 0.12,
  displacementStrength: 0.035,
  keys: new Set(),
  player: {
    x: 0,
    y: 0,
    vy: 0,
    grounded: true,
    jumpingHeld: false,
    jumpHoldTime: 0,
    maxJumpHoldTime: 0.68,
  },
  pathSequence: [],
  objects: [],
  placed: [],
  treeModels: [],
  treeLoadStarted: false,
  selectedLayerId: 'path',
  soloLayerId: null,
  paintMode: 'path-alpha',
  brushSize: 18,
  brushStrength: 0.5,
  isPainting: false,
  host: null,
  stage: null,
  panels: null,
  scene: null,
  camera: null,
  renderer: null,
  world: null,
  clock: null,
  frame: null,
  textureLoader: null,
  textureCache: new Map(),
  pathMaterialCache: new Map(),
  gltfLoader: null,
  groundMaterial: null,
  layers: new Map(),
};

const oc$ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function pathCenterAt(distance) {
  if (!OC.pathSequence.length) return 0;
  const index = clamp(Math.floor(distance / SEGMENT_WORLD_STEP), 0, OC.pathSequence.length - 1);
  const seg = OC.pathSequence[index];
  const t = clamp((distance - seg.distance) / SEGMENT_WORLD_LENGTH, 0, 1);
  const eased = t * t * (3 - 2 * t);
  return seg.startX + (seg.endX - seg.startX) * eased;
}

function playerWorldX() {
  return pathCenterAt(OC.distance) + OC.player.x;
}

function pathStatus() {
  const abs = Math.abs(OC.player.x);
  if (abs > OC.laneWidth * 0.95) return 'off';
  if (abs > OC.laneWidth * 0.70) return 'edge';
  return 'on';
}

function isLayerDisplayed(layer) {
  if (!layer) return false;
  if (OC.soloLayerId) return layer.id === OC.soloLayerId;
  return layer.visible;
}

function makeLayer(id, label, group, options = {}) {
  const layer = {
    id,
    label,
    group,
    visible: options.visible ?? true,
    opacity: options.opacity ?? 1,
    order: options.order ?? 0,
    x: 0,
    y: 0,
    z: 0,
    scale: 1,
  };
  OC.layers.set(id, layer);
  applyLayer(layer);
  return layer;
}

function applyLayer(layer) {
  if (!layer || !layer.group) return;
  layer.group.visible = isLayerDisplayed(layer);
  layer.group.position.set(layer.x, layer.y, layer.z);
  layer.group.scale.setScalar(layer.scale || 1);
  layer.group.traverse((node) => {
    node.renderOrder = layer.order;
    if (!node.material) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((mat) => {
      mat.transparent = layer.opacity < 1 || mat.transparent;
      mat.opacity = layer.opacity;
      mat.needsUpdate = true;
    });
  });
}

function applyAllLayers() {
  OC.layers.forEach((layer) => applyLayer(layer));
  populateLayerSelect();
  drawFrame();
  drawOverview();
}

function injectStyles() {
  if (oc$('obstacle-course-pov-styles')) return;
  const style = document.createElement('style');
  style.id = 'obstacle-course-pov-styles';
  style.textContent = `
    .is-obstacle-course .right-preview-layout,.is-obstacle-course .overview-window{display:none!important}
    .is-obstacle-course .left-panel-body>[data-panel-content],.is-obstacle-course #puzzle-launcher-panel{display:none!important}
    .is-obstacle-course [data-workflow-menu],.is-obstacle-course [data-workflow-only]{display:none!important}
    .obstacle-course-stage{height:calc(100vh - 92px);overflow:hidden;padding:12px 14px 14px;background:#05080d;color:var(--cream,#f4ead4);box-sizing:border-box}
    .obstacle-workspace{display:grid;grid-template-columns:minmax(560px,1fr) 320px;gap:14px;align-items:stretch;height:100%;min-height:0}
    .obstacle-view-card,.obstacle-side-card{border:1px solid rgba(124,202,210,.24);border-radius:16px;background:rgba(7,14,22,.84);box-shadow:0 12px 34px rgba(0,0,0,.28)}
    .obstacle-view-card{min-height:0;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}.obstacle-side-card{min-height:0;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
    .obstacle-header-line{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(124,202,210,.18);padding-bottom:12px}.obstacle-header-line h2{font-family:'Cinzel',serif;margin:3px 0 0;font-size:1.38rem}.obstacle-header-line p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}.obstacle-status-pill{border:1px solid rgba(238,196,90,.34);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .obstacle-three-wrap{position:relative;aspect-ratio:16/9;border:1px solid rgba(124,202,210,.18);border-radius:18px;overflow:hidden;background:#07101c;flex:0 0 auto}.obstacle-three-wrap canvas{display:block;width:100%!important;height:100%!important}.obstacle-three-wrap:after{content:'';position:absolute;left:0;right:0;bottom:0;height:72px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(10,8,5,.34));pointer-events:none;z-index:2}
    .obstacle-horse-overlay{position:absolute;left:50%;bottom:-26px;z-index:5;width:330px;height:190px;margin-left:-165px;pointer-events:none;filter:drop-shadow(0 7px 9px rgba(0,0,0,.72));opacity:.98;background:url('${ASSETS.horse}') center bottom / contain no-repeat}.obstacle-hud{position:absolute;left:14px;right:14px;bottom:12px;z-index:6;display:flex;justify-content:space-between;gap:12px;pointer-events:none;color:var(--cream,#f4ead4);font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.8)}.obstacle-reticle{position:absolute;left:50%;top:50%;z-index:4;width:34px;height:34px;margin:-17px 0 0 -17px;border:1px solid rgba(238,196,90,.35);border-radius:50%;box-shadow:0 0 16px rgba(238,196,90,.16);pointer-events:none}
    .obstacle-control-row,.hf-button-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.obstacle-control-row button,.hf-button-row button,.hf-layer-panel button,#horse-run-controls-left-slot button{min-height:34px;border:1px solid rgba(124,202,125,.28);border-radius:9px;background:rgba(20,72,37,.58);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.obstacle-control-row{display:none!important}#horse-run-controls-left-slot{display:grid;grid-template-columns:1fr;gap:8px;margin:10px 0 12px;padding:10px;border:1px solid rgba(238,196,90,.28);border-radius:12px;background:rgba(82,55,10,.18)}
    .obstacle-help-strip{display:flex;justify-content:space-between;gap:10px;color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.35}.obstacle-side-card h3{font-family:'Cinzel',serif;margin:0;font-size:1rem}.obstacle-metric{display:flex;justify-content:space-between;border:1px solid rgba(124,202,210,.2);border-radius:11px;padding:8px;color:var(--muted,#c9bfae);font-size:.73rem}.obstacle-metric strong{color:var(--cream,#f4ead4)}.obstacle-result{min-height:46px;border:1px solid rgba(124,202,210,.22);border-radius:11px;padding:9px;color:var(--muted,#c9bfae);font-size:.74rem;line-height:1.35}.obstacle-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.obstacle-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}.obstacle-result[data-state='warn']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}
    .hf-overview-middle{flex:0 0 auto;min-height:300px;display:block;margin-top:10px;padding:10px;border:1px solid rgba(238,196,90,.42);border-radius:14px;background:rgba(0,0,0,.18);box-sizing:border-box;overflow:hidden}.hf-overview-row{display:grid;grid-template-columns:78px 1fr;gap:8px;align-items:start}.hf-key{border:1px solid rgba(238,196,90,.35);border-radius:10px;padding:7px;background:rgba(0,0,0,.24);font-size:.61rem;color:var(--muted,#c9bfae);line-height:1.35}.hf-overview-scroll{width:100%;height:280px;overflow-y:auto;overflow-x:hidden;border:1px solid rgba(238,196,90,.55);border-radius:12px;background:#111914}.hf-overview{display:block;width:100%;min-height:280px;background:#111914;touch-action:none;cursor:crosshair}.hf-layer-panel{border:1px solid rgba(124,202,210,.2);border-radius:12px;padding:10px;background:rgba(0,0,0,.20)}.hf-layer-panel label{display:block;color:var(--muted,#c9bfae);font-size:.68rem;margin:6px 0 3px}.hf-layer-panel select,.hf-layer-panel input{width:100%;box-sizing:border-box;background:#0b1219;color:var(--cream,#f4ead4);border:1px solid rgba(124,202,210,.25);border-radius:8px;padding:6px}.hf-slider-row{display:grid;grid-template-columns:58px 1fr 48px;align-items:center;gap:6px;font-size:.66rem;color:var(--muted,#c9bfae)}.hf-slider-row output{text-align:right;color:#eec45a}.hf-small-note{font-size:.66rem;line-height:1.35;color:var(--muted,#c9bfae);margin:0}.hf-export-json-button{min-height:34px;border:1px solid rgba(238,196,90,.45);border-radius:9px;background:rgba(82,55,10,.72);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}
    @media(max-width:1120px){.obstacle-workspace{grid-template-columns:1fr}.obstacle-side-card{height:360px}.obstacle-course-stage{height:auto;overflow:auto}}
  `;
  document.head.appendChild(style);
}

export function openObstacleCourseWorkflow() {
  ensureMounted();
  OC.active = true;
  document.body.classList.add('is-obstacle-course');
  document.body.classList.remove('is-puzzle-brief', 'is-puzzle-chooser');
  oc$('puzzle-launcher-panel')?.setAttribute('hidden', '');
  OC.stage.hidden = false;
  OC.panels.hidden = false;
  showObstaclePanel('build');
  resizeRenderer();
  regenerateCourse();
  drawFrame();
}

export function closeObstacleCourseWorkflow() {
  if (!OC.mounted) return;
  OC.active = false;
  pauseRun();
  document.body.classList.remove('is-obstacle-course');
  OC.stage.hidden = true;
  OC.panels.hidden = true;
}

function ensureMounted() {
  if (OC.mounted) return;
  injectStyles();
  const rightPanel = document.querySelector('.right-panel');
  const leftBody = document.querySelector('.left-panel-body');
  if (!rightPanel || !leftBody) return;

  OC.stage = document.createElement('section');
  OC.stage.id = 'obstacle-course-stage';
  OC.stage.className = 'obstacle-course-stage';
  OC.stage.hidden = true;
  OC.stage.innerHTML = `
    <div class="obstacle-workspace">
      <section class="obstacle-view-card">
        <div class="obstacle-header-line"><div><p class="eyebrow">Obstacle Course · V2.5</p><h2 id="obstacle-title">Obstacle Course</h2><p id="obstacle-objective">Horse forest obstacle course using modular transparent WEBP path segments over forest_floor_grass2.</p></div><span id="obstacle-status" class="obstacle-status-pill">Ready</span></div>
        <div id="obstacle-three-host" class="obstacle-three-wrap"><div class="obstacle-reticle"></div><div class="obstacle-horse-overlay"></div><div class="obstacle-hud"><span>Hold ↑/W move · ↓/S back · Ctrl duck · Space jump</span><span id="obstacle-course-summary">0m / 0m</span></div></div>
        <div class="obstacle-help-strip"><span>Path pieces use 1000×2000 WEBP with 250px overlap. Off path slows to trot.</span><span id="hf-tree-status">GLB trees: loading…</span></div>
        <div class="obstacle-control-row"><button id="obstacle-start" type="button">Start Test</button><button id="obstacle-pause" type="button">Pause</button><button id="obstacle-reset-run" type="button">Reset Run</button></div>
        <div id="hf-overview-middle-shell" class="hf-overview-middle"><div class="hf-overview-row"><div class="hf-key"><b>Key</b><br>Path<br>Tree<br>Rock<br>Collectible<br>Obstacle</div><div id="hf-overview-scroll" class="hf-overview-scroll"><canvas id="hf-overview" class="hf-overview" width="360" height="300"></canvas></div></div></div>
      </section>
      <aside class="obstacle-side-card">
        <div class="hf-button-row"><button id="hf-view-ride" type="button">Ride View</button><button id="hf-view-overview" type="button">Overview</button><button id="hf-redraw" type="button">Redraw</button></div>
        <section class="hf-layer-panel"><h3>Layer Controls</h3><label>Selected layer</label><select id="hf-layer-select"></select><div class="hf-button-row"><button id="hf-layer-visible" type="button">Hide/Show</button><button id="hf-layer-solo" type="button">Solo</button><button id="hf-layer-clear-solo" type="button">All</button></div><div class="hf-button-row"><button id="hf-layer-up" type="button">Above</button><button id="hf-layer-down" type="button">Below</button><button id="hf-bg-white" type="button">BG White</button></div><div id="hf-layer-sliders"></div></section>
        <section class="hf-layer-panel"><h3>Paint / Place</h3><label>Tool</label><select id="hf-paint-mode"><option value="path-alpha">Alpha paint: path edge</option><option value="tree">Place GLB tree</option><option value="rock">Place rock</option><option value="collectible">Place collectible</option><option value="obstacle">Place obstacle</option><option value="erase">Erase nearby item</option></select><div class="hf-slider-row"><span>Size</span><input id="hf-brush-size" type="range" min="4" max="80" value="18"><output id="hf-brush-size-out">18</output></div><div class="hf-slider-row"><span>Alpha</span><input id="hf-brush-strength" type="range" min="0" max="1" step="0.05" value="0.5"><output id="hf-brush-strength-out">0.50</output></div><p class="hf-small-note">Route pieces obey entry/exit positions and are placed with 250px-style overlaps.</p></section>
        <button id="hf-export-json" class="hf-export-json-button" type="button">Download JSON</button>
        <div class="obstacle-metric"><span>Score</span><strong id="obstacle-score">0</strong></div><div class="obstacle-metric"><span>Collected</span><strong id="obstacle-collected">0</strong></div><div class="obstacle-metric"><span>Hits</span><strong id="obstacle-hits">0</strong></div><div class="obstacle-metric"><span>Target</span><strong id="obstacle-target-score">20</strong></div><div id="obstacle-result" class="obstacle-result">Ride waiting. Start the test when ready.</div>
      </aside>
    </div>`;
  rightPanel.prepend(OC.stage);

  OC.panels = document.createElement('div');
  OC.panels.id = 'obstacle-course-panels';
  OC.panels.hidden = true;
  OC.panels.innerHTML = `
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="build"><div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Horse Ride</h2></div><span class="status-pill is-waiting">V29</span></div><p class="obstacle-panel-copy">Course editor controls use transparent path segment WEBPs over forest_floor_grass2.</p><label class="field-block"><span>Course Template</span><select id="obstacle-template"><option value="horse_forest_easy">Obstacle Course</option><option value="horse_forest_dense">Dense Forest Ride</option><option value="horse_forest_night">Moonlit Forest Ride</option></select></label><label class="range-row"><span>Difficulty <output id="obstacle-difficulty-out">2</output></span><input id="obstacle-difficulty" type="range" min="1" max="5" value="2" /></label><label class="range-row"><span>Course Duration <output id="obstacle-duration-out">45s</output></span><input id="obstacle-duration" type="range" min="20" max="300" step="5" value="45" /></label><button id="obstacle-regenerate" class="wide-button" type="button">Regenerate Course</button><div id="horse-run-controls-left-slot"><button id="obstacle-start-left" type="button">Start Test</button><button id="obstacle-pause-left" type="button">Pause</button><button id="obstacle-reset-run-left" type="button">Reset Run</button></div></section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="display" hidden><div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Ground Relief</h2></div></div><label class="range-row"><span>Bump Strength <output id="obstacle-bump-out">0.12</output></span><input id="obstacle-bump" type="range" min="0" max="0.45" step="0.01" value="0.12" /></label><label class="range-row"><span>Displacement Strength <output id="obstacle-displacement-out">0.035</output></span><input id="obstacle-displacement" type="range" min="0" max="0.18" step="0.005" value="0.035" /></label><label class="range-row"><span>Horse Speed <output id="obstacle-speed-out">34</output></span><input id="obstacle-speed" type="range" min="18" max="64" step="2" value="34" /></label><label class="range-row"><span>Lane Width <output id="obstacle-lane-width-out">2.7</output></span><input id="obstacle-lane-width" type="range" min="1.8" max="5" step="0.1" value="2.7" /></label></section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="logic" hidden><div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Scoring</h2></div></div><label class="range-row"><span>Success Score <output id="obstacle-success-score-out">20</output></span><input id="obstacle-success-score" type="range" min="0" max="80" step="5" value="20" /></label></section>`;
  leftBody.appendChild(OC.panels);
  OC.host = oc$('obstacle-three-host');
  setupThreeScene();
  bindControls();
  OC.mounted = true;
}

function setupThreeScene() {
  OC.textureLoader = new THREE.TextureLoader();
  OC.gltfLoader = new GLTFLoader();
  OC.scene = new THREE.Scene();
  OC.scene.fog = new THREE.Fog(0x102018, 60, 520);
  OC.camera = new THREE.PerspectiveCamera(66, 16 / 9, 0.1, 1200);
  OC.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  OC.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  OC.host.prepend(OC.renderer.domElement);
  OC.clock = new THREE.Clock();
  OC.scene.add(new THREE.HemisphereLight(0xd8f0ff, 0x20301c, 1.15));
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.15);
  sun.position.set(-8, 16, 12);
  OC.scene.add(sun);
  OC.world = new THREE.Group();
  OC.scene.add(OC.world);
  buildMaterials();
  loadTreeModels();
  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();
  OC.frame = requestAnimationFrame(loop);
}

function bindControls() {
  oc$('obstacle-template').addEventListener('change', (e) => { OC.templateId = e.target.value; regenerateCourse(); });
  oc$('obstacle-difficulty').addEventListener('input', (e) => { OC.difficulty = Number(e.target.value); oc$('obstacle-difficulty-out').textContent = String(OC.difficulty); regenerateCourse(); });
  oc$('obstacle-duration').addEventListener('input', (e) => { OC.duration = Math.min(OC.maxDuration, Number(e.target.value)); oc$('obstacle-duration-out').textContent = `${OC.duration}s`; regenerateCourse(); });
  oc$('obstacle-speed').addEventListener('input', (e) => { OC.speed = Number(e.target.value); oc$('obstacle-speed-out').textContent = String(OC.speed); regenerateCourse(); });
  oc$('obstacle-lane-width').addEventListener('input', (e) => { OC.laneWidth = Number(e.target.value); oc$('obstacle-lane-width-out').textContent = OC.laneWidth.toFixed(1); regenerateCourse(); });
  oc$('obstacle-bump').addEventListener('input', (e) => { OC.bumpStrength = Number(e.target.value); oc$('obstacle-bump-out').textContent = OC.bumpStrength.toFixed(2); updateGroundRelief(); });
  oc$('obstacle-displacement').addEventListener('input', (e) => { OC.displacementStrength = Number(e.target.value); oc$('obstacle-displacement-out').textContent = OC.displacementStrength.toFixed(3); updateGroundRelief(); });
  oc$('obstacle-success-score')?.addEventListener('input', (e) => { OC.successScore = Number(e.target.value); oc$('obstacle-success-score-out').textContent = String(OC.successScore); oc$('obstacle-target-score').textContent = String(OC.successScore); });
  oc$('obstacle-regenerate').addEventListener('click', regenerateCourse);
  oc$('obstacle-start').addEventListener('click', startRun);
  oc$('obstacle-pause').addEventListener('click', pauseRun);
  oc$('obstacle-reset-run').addEventListener('click', () => resetRun(false));
  oc$('obstacle-start-left').addEventListener('click', startRun);
  oc$('obstacle-pause-left').addEventListener('click', pauseRun);
  oc$('obstacle-reset-run-left').addEventListener('click', () => resetRun(false));
  oc$('hf-view-ride').addEventListener('click', drawFrame);
  oc$('hf-view-overview').addEventListener('click', () => { drawOverview(); drawFrame(); });
  oc$('hf-redraw').addEventListener('click', () => { drawOverview(); drawFrame(); });
  oc$('hf-export-json').addEventListener('click', downloadJson);
  bindLayerControls();
  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('keyup', handleKeyUp, true);
}

function handleKeyDown(event) {
  if (!OC.active) return;
  const key = event.key.toLowerCase();
  if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's', ' ', 'control'].includes(key)) {
    event.preventDefault();
    OC.keys.add(key);
    if ((key === ' ' || event.code === 'Space') && !event.repeat) startJump();
  }
}
function handleKeyUp(event) {
  if (!OC.active) return;
  const key = event.key.toLowerCase();
  OC.keys.delete(key);
  if (key === ' ' || event.code === 'Space') OC.player.jumpingHeld = false;
}

function bindLayerControls() {
  oc$('hf-layer-select').addEventListener('change', (e) => { OC.selectedLayerId = e.target.value; syncLayerControls(); });
  oc$('hf-layer-visible').addEventListener('click', () => { const l = OC.layers.get(OC.selectedLayerId); if (!l) return; l.visible = !l.visible; applyAllLayers(); });
  oc$('hf-layer-solo').addEventListener('click', () => { OC.soloLayerId = OC.selectedLayerId; applyAllLayers(); });
  oc$('hf-layer-clear-solo').addEventListener('click', () => { OC.soloLayerId = null; applyAllLayers(); });
  oc$('hf-bg-white').addEventListener('click', () => { if (OC.scene) OC.scene.background = new THREE.Color(0xffffff); });
  oc$('hf-layer-up').addEventListener('click', () => { const l = OC.layers.get(OC.selectedLayerId); if (!l) return; l.order += 1; applyLayer(l); syncLayerControls(); drawFrame(); });
  oc$('hf-layer-down').addEventListener('click', () => { const l = OC.layers.get(OC.selectedLayerId); if (!l) return; l.order -= 1; applyLayer(l); syncLayerControls(); drawFrame(); });
  oc$('hf-paint-mode').addEventListener('change', (e) => { OC.paintMode = e.target.value; });
  oc$('hf-brush-size').addEventListener('input', (e) => { OC.brushSize = Number(e.target.value); oc$('hf-brush-size-out').textContent = String(OC.brushSize); });
  oc$('hf-brush-strength').addEventListener('input', (e) => { OC.brushStrength = Number(e.target.value); oc$('hf-brush-strength-out').textContent = OC.brushStrength.toFixed(2); });
}

function resizeRenderer() {
  if (!OC.renderer || !OC.host || !OC.camera) return;
  const width = Math.max(1, OC.host.clientWidth);
  const height = Math.max(300, Math.round(width * 9 / 16));
  OC.camera.aspect = width / height;
  OC.camera.updateProjectionMatrix();
  OC.renderer.setSize(width, height);
}

function loadTexture(url, options = {}) {
  const key = `${url}::${options.repeat ? options.repeat.join('x') : 'single'}`;
  if (OC.textureCache.has(key)) return OC.textureCache.get(key);
  const texture = OC.textureLoader.load(`${url}?v=29`, undefined, undefined, () => console.warn('[HorseForest] texture failed', url));
  if ('colorSpace' in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  else texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  if (options.repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(options.repeat[0], options.repeat[1]);
  }
  OC.textureCache.set(key, texture);
  return texture;
}

function buildMaterials() {
  const groundMap = loadTexture(ASSETS.ground, { repeat: [12, 44] });
  OC.scene.background = loadTexture(ASSETS.background);
  OC.groundMaterial = new THREE.MeshStandardMaterial({ map: groundMap, bumpMap: groundMap, displacementMap: groundMap, bumpScale: OC.bumpStrength, displacementScale: OC.displacementStrength, roughness: 1, metalness: 0 });
}
function updateGroundRelief() {
  if (OC.groundMaterial) {
    OC.groundMaterial.bumpScale = OC.bumpStrength;
    OC.groundMaterial.displacementScale = OC.displacementStrength;
    OC.groundMaterial.needsUpdate = true;
  }
  drawFrame();
}

function getPathMaterial(def) {
  if (OC.pathMaterialCache.has(def.id)) return OC.pathMaterialCache.get(def.id);
  const texture = loadTexture(def.file);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.03, depthWrite: false, side: THREE.DoubleSide });
  OC.pathMaterialCache.set(def.id, material);
  return material;
}

function createLayerSliders() {
  const host = oc$('hf-layer-sliders');
  if (!host) return;
  host.innerHTML = '';
  [['x', 'X', -30, 30, 0.1], ['z', 'Z', -80, 80, 0.5], ['y', 'Y', -10, 10, 0.1], ['scale', 'Scale', 0.1, 4, 0.05], ['opacity', 'Alpha', 0, 1, 0.05], ['order', 'Order', -20, 40, 1]].forEach(([prop, label, min, max, step]) => {
    const row = document.createElement('div');
    row.className = 'hf-slider-row';
    row.innerHTML = `<span>${label}</span><input id="hf-layer-${prop}" type="range" min="${min}" max="${max}" step="${step}"><output id="hf-layer-${prop}-out"></output>`;
    host.appendChild(row);
    row.querySelector('input').addEventListener('input', (e) => {
      const l = OC.layers.get(OC.selectedLayerId);
      if (!l) return;
      l[prop] = Number(e.target.value);
      applyLayer(l);
      syncLayerOutputs();
      drawFrame();
      drawOverview();
    });
  });
}
function populateLayerSelect() {
  const select = oc$('hf-layer-select');
  if (!select) return;
  const previous = select.value || OC.selectedLayerId;
  select.innerHTML = '';
  [...OC.layers.values()].sort((a, b) => a.order - b.order).forEach((l) => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = `${l.label}${OC.soloLayerId === l.id ? ' (solo)' : l.visible ? '' : ' (hidden)'}`;
    select.appendChild(opt);
  });
  if (OC.layers.has(previous)) OC.selectedLayerId = previous;
  select.value = OC.selectedLayerId;
  createLayerSliders();
  syncLayerControls();
}
function syncLayerOutputs() {
  const l = OC.layers.get(OC.selectedLayerId);
  if (!l) return;
  ['x', 'z', 'y', 'scale', 'opacity', 'order'].forEach((prop) => {
    const out = oc$(`hf-layer-${prop}-out`);
    if (out) out.textContent = prop === 'order' ? String(l[prop]) : Number(l[prop]).toFixed(2);
  });
}
function syncLayerControls() {
  const l = OC.layers.get(OC.selectedLayerId);
  if (!l) return;
  ['x', 'z', 'y', 'scale', 'opacity', 'order'].forEach((prop) => {
    const input = oc$(`hf-layer-${prop}`);
    if (input) input.value = l[prop];
  });
  syncLayerOutputs();
}

function generatePathSequence() {
  OC.pathSequence = [];
  let pos = 'centre';
  const defs = Object.values(ASSETS.pathSegments);
  const count = Math.ceil((OC.courseLength + 420) / SEGMENT_WORLD_STEP);
  for (let i = 0; i < count; i += 1) {
    const forcedReturn = pos === 'left' ? ASSETS.pathSegments.leftToStraight : pos === 'right' ? ASSETS.pathSegments.rightToStraight : null;
    let def;
    if (forcedReturn) def = Math.random() < 0.62 ? forcedReturn : (pos === 'left' ? ASSETS.pathSegments.right : ASSETS.pathSegments.left);
    else def = pick([ASSETS.pathSegments.straight, ASSETS.pathSegments.straight, ASSETS.pathSegments.kink, ASSETS.pathSegments.left, ASSETS.pathSegments.right]);
    const distance = i * SEGMENT_WORLD_STEP;
    const startX = PATH_POSITIONS[def.start] ?? 0;
    const endX = PATH_POSITIONS[def.end] ?? 0;
    OC.pathSequence.push({ ...def, distance, startX, endX });
    pos = def.end;
  }
}

function regenerateCourse() {
  if (!OC.world) return;
  clearWorld();
  OC.layers.clear();
  OC.duration = Math.min(OC.maxDuration, OC.duration);
  OC.courseLength = Math.max(900, OC.duration * OC.speed);
  resetRun(true);
  buildWorld();
  addObstacles(Math.round((8 + OC.difficulty * 5) * (TEMPLATES[OC.templateId]?.obstacleRate || 1)));
  addCollectibles(8 + OC.difficulty * 3);
  updateTemplateText();
  populateLayerSelect();
  applyAllLayers();
  drawFrame();
  drawOverview();
}
function disposeGroup(group) {
  while (group?.children?.length) {
    const child = group.children.pop();
    child.traverse?.((node) => {
      node.geometry?.dispose?.();
      if (Array.isArray(node.material)) node.material.forEach((mat) => mat.dispose?.());
      else node.material?.dispose?.();
    });
  }
}
function clearWorld() {
  disposeGroup(OC.world);
  OC.objects = [];
  OC.placed = [];
}
function updateTemplateText() {
  const t = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  oc$('obstacle-title').textContent = t.label;
  oc$('obstacle-target-score').textContent = String(OC.successScore);
}
function buildWorld() {
  const groundLayer = new THREE.Group();
  const pathLayer = new THREE.Group();
  const treeLayer = new THREE.Group();
  const rockLayer = new THREE.Group();
  const collectibleLayer = new THREE.Group();
  const obstacleLayer = new THREE.Group();
  const paintLayer = new THREE.Group();
  OC.world.add(groundLayer, pathLayer, treeLayer, rockLayer, collectibleLayer, obstacleLayer, paintLayer);
  makeLayer('ground', 'Forest floor grass2', groundLayer, { order: 0 });
  makeLayer('path', 'Transparent path segments', pathLayer, { order: 3 });
  makeLayer('paint-decals', 'Paint / alpha decals', paintLayer, { order: 11 });
  makeLayer('trees', 'GLB trees', treeLayer, { order: 12 });
  makeLayer('rocks', 'Rocks', rockLayer, { order: 13 });
  makeLayer('collectibles', 'Collectibles', collectibleLayer, { order: 15 });
  makeLayer('obstacles', 'Obstacles', obstacleLayer, { order: 16 });
  generatePathSequence();
  buildGround(groundLayer);
  buildPathSegments(pathLayer);
  buildTreeCorridor(treeLayer);
  scatterForestFloorDetail(rockLayer);
}
function buildGround(parent) {
  const mat = OC.groundMaterial || new THREE.MeshStandardMaterial({ color: 0x4c653f, roughness: 1 });
  for (let d = 0; d < OC.courseLength + 360; d += SEGMENT_WORLD_STEP) {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(70, SEGMENT_WORLD_STEP + 2, 28, 18), mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, GROUND_Y, -d - SEGMENT_WORLD_STEP / 2);
    parent.add(ground);
  }
}
function buildPathSegments(parent) {
  OC.pathSequence.forEach((seg) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(24, SEGMENT_WORLD_LENGTH, 1, 1), getPathMaterial(seg));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set((seg.startX + seg.endX) / 2, GROUND_Y + 0.048, -seg.distance - SEGMENT_WORLD_LENGTH / 2);
    mesh.renderOrder = 4;
    parent.add(mesh);
  });
}
function buildTreeCorridor(parent) {
  const step = OC.templateId === 'horse_forest_dense' ? 18 : 24;
  for (let d = 30; d < OC.courseLength + 230; d += step) [-1, 1].forEach((side) => addTreeAt(parent, d + rand(-3, 8), side, rand(8, 15), rand(3, 9)));
}
function addTreeAt(parent, distance, side, height, extra) {
  const tree = createModelTree(height);
  if (!tree) return;
  const x = pathCenterAt(distance) + side * (OC.laneWidth * 1.45 + extra + rand(0.3, 1.2));
  tree.position.set(x, GROUND_Y, -distance);
  tree.rotation.y = rand(0, Math.PI * 2);
  parent.add(tree);
  OC.placed.push({ type: 'tree', x, z: -distance, mesh: tree });
}
function createModelTree(targetHeight) {
  if (!OC.treeModels.length) return null;
  const root = pick(OC.treeModels).clone(true);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  root.scale.multiplyScalar(targetHeight / Math.max(size.y, 0.001));
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  const wrapper = new THREE.Group();
  wrapper.add(root);
  root.position.set(-(box2.min.x + box2.max.x) / 2, -box2.min.y, -(box2.min.z + box2.max.z) / 2);
  return wrapper;
}
function scatterForestFloorDetail(parent) {
  for (let d = 18; d < OC.courseLength + 260; d += rand(9, 15)) {
    [-1, 1].forEach((side) => addSceneryRock(parent, pathCenterAt(d) + side * rand(5, 12), d + rand(-4, 4)));
  }
}
function addSceneryRock(parent, x, distance) {
  const rock = createRock();
  rock.position.set(x, GROUND_Y + 0.18, -distance);
  rock.scale.multiplyScalar(rand(0.55, 0.95));
  parent.add(rock);
  OC.placed.push({ type: 'rock', x, z: -distance, mesh: rock });
}
function createRock() {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rand(0.45, 0.75), 0), new THREE.MeshLambertMaterial({ color: Math.random() < 0.5 ? 0x62655c : 0x3e443a, flatShading: true }));
  rock.scale.set(rand(0.8, 1.4), rand(0.45, 0.9), rand(0.75, 1.3));
  rock.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
  return rock;
}
function createLog() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 3.6, 14), new THREE.MeshLambertMaterial({ color: 0x5a3519 }));
  body.rotation.z = Math.PI / 2;
  group.add(body);
  return group;
}
function addObstacles(count) {
  const parent = OC.layers.get('obstacles')?.group || OC.world;
  for (let i = 0; i < count; i += 1) {
    const distance = 70 + Math.random() * (OC.courseLength - 120);
    const center = pathCenterAt(distance);
    const x = center + pick([-1, 0, 1]) * OC.laneWidth * 0.55;
    const obj = Math.random() < 0.72 ? createLog() : createRock();
    obj.position.set(x, GROUND_Y + 0.35, -distance);
    obj.userData = { kind: 'obstacle', hit: false, radiusX: 0.9, needsJump: true };
    parent.add(obj);
    OC.objects.push(obj);
    OC.placed.push({ type: 'log', x: obj.position.x, z: obj.position.z, mesh: obj });
  }
}
function addCollectibles(count) {
  const parent = OC.layers.get('collectibles')?.group || OC.world;
  const geo = new THREE.OctahedronGeometry(0.32, 0);
  for (let i = 0; i < count; i += 1) {
    const distance = 45 + Math.random() * (OC.courseLength - 90);
    const center = pathCenterAt(distance);
    const obj = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xeec45a, transparent: true, opacity: 0.9 }));
    obj.position.set(center + pick([-1, 0, 1]) * OC.laneWidth * 0.55, rand(-0.4, 1.6), -distance);
    obj.userData = { kind: 'collectible', collected: false, radius: 0.85 };
    parent.add(obj);
    OC.objects.push(obj);
    OC.placed.push({ type: 'collectible', x: obj.position.x, z: obj.position.z, mesh: obj });
  }
}

function startRun() {
  OC.running = true;
  OC.complete = false;
  OC.clock?.start();
  oc$('obstacle-status').textContent = 'Riding';
  setResult('Hold ↑/W to move. Stay on the transparent path or the horse slows to a trot.', 'waiting');
}
function pauseRun() {
  OC.running = false;
  OC.targetSpeed = 0;
  if (oc$('obstacle-status')) oc$('obstacle-status').textContent = 'Paused';
}
function resetRun(quiet = false) {
  OC.running = false;
  OC.complete = false;
  OC.distance = 0;
  OC.currentSpeed = 0;
  OC.targetSpeed = 0;
  OC.score = 0;
  OC.hits = 0;
  OC.jumps = 0;
  OC.collected = 0;
  OC.player.x = 0;
  OC.player.y = 0;
  OC.player.vy = 0;
  OC.player.grounded = true;
  OC.player.jumpingHeld = false;
  OC.player.jumpHoldTime = 0;
  OC.objects.forEach((obj) => { obj.visible = true; if (obj.userData) { obj.userData.hit = false; obj.userData.collected = false; } });
  updateStats();
  if (!quiet) setResult('Course reset. Start the test when ready.', 'waiting');
  drawFrame();
  drawOverview();
}
function startJump() {
  if (!OC.active || !OC.player.grounded) return;
  OC.player.vy = 7.6;
  OC.player.grounded = false;
  OC.player.jumpingHeld = true;
  OC.player.jumpHoldTime = 0;
  OC.jumps += 1;
  updateStats();
}
function loop() {
  if (OC.active) {
    const dt = Math.min(0.05, OC.clock?.getDelta?.() || 0.016);
    drawFrame(dt);
  }
  OC.frame = requestAnimationFrame(loop);
}
function drawFrame(dt = 0) {
  if (!OC.renderer || !OC.scene || !OC.camera) return;
  if (OC.running && !OC.complete) updateRun(dt);
  updateCamera();
  OC.renderer.render(OC.scene, OC.camera);
}
function updateRun(dt) {
  let steer = 0;
  if (OC.keys.has('arrowleft') || OC.keys.has('a')) steer -= 1;
  if (OC.keys.has('arrowright') || OC.keys.has('d')) steer += 1;
  OC.player.x = clamp(OC.player.x + steer * OC.steerSpeed * dt, -OC.laneWidth * 1.8, OC.laneWidth * 1.8);

  if (OC.keys.has('arrowup') || OC.keys.has('w')) OC.targetSpeed = OC.speed;
  else if (OC.keys.has('arrowdown') || OC.keys.has('s')) OC.targetSpeed = BACK_SPEED;
  else OC.targetSpeed = 0;

  const status = pathStatus();
  let cappedTarget = OC.targetSpeed;
  if (status === 'off' && cappedTarget > SLOW_TROT_SPEED) cappedTarget = SLOW_TROT_SPEED;
  if (status === 'edge' && cappedTarget > OC.speed * 0.55) cappedTarget = OC.speed * 0.55;
  const rate = Math.abs(cappedTarget) > Math.abs(OC.currentSpeed) ? ACCEL : DECEL;
  OC.currentSpeed += clamp(cappedTarget - OC.currentSpeed, -rate * dt, rate * dt);
  OC.distance = Math.max(0, OC.distance + OC.currentSpeed * dt);
  if (status === 'off' && OC.targetSpeed > 0) setResult('Off path: horse slowed to a trot. Steer back onto the road.', 'warn');
  if (status === 'edge' && OC.targetSpeed > 0) setResult('Path edge: horse slowing. Steer toward the centre.', 'warn');

  updatePhysics(dt);
  updateObjects();
  OC.score += dt * (status === 'off' ? 0.15 : 0.6);
  updateStats();
  if (OC.distance >= OC.courseLength) {
    OC.complete = true;
    pauseRun();
    setResult(OC.score >= OC.successScore ? 'Course complete.' : 'Course complete, but score is below target.', OC.score >= OC.successScore ? 'success' : 'failure');
  }
}
function updatePhysics(dt) {
  if (OC.player.jumpingHeld && !OC.player.grounded && OC.player.jumpHoldTime < OC.player.maxJumpHoldTime) {
    OC.player.vy += 9.5 * dt;
    OC.player.jumpHoldTime += dt;
  }
  if (OC.player.jumpHoldTime >= OC.player.maxJumpHoldTime) OC.player.jumpingHeld = false;
  if (!OC.player.grounded) {
    OC.player.vy -= 22 * dt;
    OC.player.y += OC.player.vy * dt;
    if (OC.player.y <= 0) {
      OC.player.y = 0;
      OC.player.vy = 0;
      OC.player.grounded = true;
      OC.player.jumpingHeld = false;
      OC.player.jumpHoldTime = 0;
    }
  }
}
function updateObjects() {
  const x = playerWorldX();
  OC.objects.forEach((obj) => {
    const distance = -obj.position.z;
    const delta = distance - OC.distance;
    if (delta < -8 || delta > 8 || !obj.visible) return;
    if (obj.userData.kind === 'collectible' && !obj.userData.collected && Math.hypot(obj.position.x - x, obj.position.y - (OC.player.y + 0.3)) < obj.userData.radius) {
      obj.userData.collected = true;
      obj.visible = false;
      OC.collected += 1;
      OC.score += 4;
    }
    if (obj.userData.kind === 'obstacle' && !obj.userData.hit && Math.abs(obj.position.x - x) < obj.userData.radiusX && Math.abs(delta) < 1.4 && OC.player.y < 0.75) {
      obj.userData.hit = true;
      OC.hits += 1;
      OC.score = Math.max(0, OC.score - 3);
      setResult('Hit obstacle. Jump with Space.', 'warn');
    }
  });
}
function updateCamera() {
  const center = pathCenterAt(OC.distance);
  const x = center + OC.player.x;
  OC.world.position.z = OC.distance;
  OC.camera.position.set(x * 0.16, 1.8 + OC.player.y * 0.55, 8.4);
  OC.camera.lookAt(x * 0.35, 0.35 + OC.player.y * 0.35, -28);
}
function updateStats() {
  oc$('obstacle-score').textContent = String(Math.round(OC.score));
  oc$('obstacle-collected').textContent = String(OC.collected);
  oc$('obstacle-hits').textContent = String(OC.hits);
  oc$('obstacle-course-summary').textContent = `${Math.round(OC.distance)}m / ${Math.round(OC.courseLength)}m`;
}
function setResult(text, state = 'waiting') {
  const result = oc$('obstacle-result');
  if (!result) return;
  result.textContent = text;
  result.dataset.state = state;
}

function loadTreeModels() {
  if (OC.treeLoadStarted) return;
  OC.treeLoadStarted = true;
  ASSETS.trees.forEach((url) => OC.gltfLoader.load(`${url}?v=29`, (gltf) => {
    if (!gltf.scene) return;
    gltf.scene.traverse((node) => { if (node.isMesh) node.receiveShadow = true; });
    OC.treeModels.push(gltf.scene);
    if (oc$('hf-tree-status')) oc$('hf-tree-status').textContent = `GLB trees: ${OC.treeModels.length} loaded`;
    if (OC.active) regenerateCourse();
  }, undefined, (error) => console.warn('[HorseForest] GLB tree failed:', url, error)));
}

function worldToOverview(x, z) {
  const c = oc$('hf-overview');
  return { x: (x + 24) / 48 * c.width, y: (-z) / (OC.courseLength + 300) * c.height };
}
function drawOverview() {
  const c = oc$('hf-overview');
  if (!c) return;
  const wantedHeight = Math.max(300, Math.min(2200, Math.round((OC.courseLength + 300) / 3.2)));
  if (c.height !== wantedHeight) c.height = wantedHeight;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#111914';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#d09a55';
  ctx.lineWidth = 6;
  ctx.beginPath();
  for (let d = 0; d < OC.courseLength; d += 18) {
    const point = worldToOverview(pathCenterAt(d), -d);
    if (d === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
  OC.placed.forEach((obj) => {
    const point = worldToOverview(obj.x, obj.z);
    ctx.fillStyle = obj.type === 'tree' ? '#48a24a' : obj.type === 'rock' ? '#aaa' : obj.type === 'collectible' ? '#eec45a' : '#b04b35';
    ctx.beginPath();
    ctx.arc(point.x, point.y, obj.type === 'tree' ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.strokeStyle = '#eec45a';
  ctx.strokeRect(1, 1, c.width - 2, c.height - 2);
}

function downloadJson() {
  const payload = window.__artifexObstacleCourse.getState();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `obstacle-course-settings-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function showObstaclePanel(panelId) {
  document.querySelectorAll('[data-obstacle-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.obstaclePanel !== panelId;
    panel.classList.toggle('is-active', panel.dataset.obstaclePanel === panelId);
  });
}

function installOpenIntercept() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest("[data-engine='obstacle-course']");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach((candidate) => {
      const active = candidate.dataset.engine === 'obstacle-course';
      candidate.classList.toggle('is-active', active);
      candidate.classList.toggle('is-selected', active);
    });
    openObstacleCourseWorkflow();
  }, true);
}
function boot() {
  installOpenIntercept();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

window.__artifexObstacleCourse = {
  version: 'V29-clean-path-segments',
  open: openObstacleCourseWorkflow,
  close: closeObstacleCourseWorkflow,
  regenerate: regenerateCourse,
  getState: () => ({
    version: 'V29-clean-path-segments',
    runtimeStructure: 'single live obstacle-course-runtime.js plus separate asset debug helper',
    distance: OC.distance,
    courseLength: OC.courseLength,
    score: OC.score,
    hits: OC.hits,
    collected: OC.collected,
    jumps: OC.jumps,
    movement: { speed: OC.speed, currentSpeed: OC.currentSpeed, targetSpeed: OC.targetSpeed, pathStatus: pathStatus() },
    pathSegmentPixels: { height: SEGMENT_HEIGHT_PX, overlap: SEGMENT_OVERLAP_PX, step: SEGMENT_STEP_PX },
    pathSegments: OC.pathSequence.map((seg) => ({ id: seg.id, start: seg.start, end: seg.end, distance: seg.distance })),
    groundTexture: 'forest_floor_grass2.png',
    importedTrees: OC.treeModels.length,
  }),
};
