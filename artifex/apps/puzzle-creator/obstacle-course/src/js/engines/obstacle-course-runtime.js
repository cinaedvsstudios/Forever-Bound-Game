// Obstacle Course V2.7.1 / Horse Forest Runner
// Consolidated runtime: no post-load patch stack.
// The obstacle-course UI, generation, alpha-path logic, GLB controls, overview, HUD, and JSON settings live here.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

const VERSION = 'V2.7.1';
const CACHE_VERSION = '2.7.1';
const ASSET_BASE = './assets/';
const SHARED_UI_BASE = '../../../shared/ui/';
const GROUND_Y = -1.62;
const SEGMENT_WORLD_LENGTH = 80;
const SEGMENT_WORLD_OVERLAP = 10;
const SEGMENT_WORLD_STEP = SEGMENT_WORLD_LENGTH - SEGMENT_WORLD_OVERLAP;
const PATH_POSITIONS = { left: -6.3, centre: 0, center: 0, right: 6.3 };
const BASE_SPEED = 34;
const BACK_SPEED = -7;
const SLOW_TROT_SPEED = 8;
const ACCEL = 24;
const DECEL = 26;

const ASSETS = {
  horse: `${ASSET_BASE}foreground/horse.png`,
  background: `${ASSET_BASE}backgrounds/horseridebg.jpg`,
  ground: `${ASSET_BASE}ground/forest_ground.webp`,
  powerbars: `${ASSET_BASE}ui/powerbars.png`,
  arrows: `${SHARED_UI_BASE}defaultarrows.webp`,
  pathSegments: {
    straight: { key: 'straight', id: 'pathstraight', label: 'Straight', file: `${ASSET_BASE}path-segments/pathstraight.webp`, start: 'centre', end: 'centre' },
    kink: { key: 'kink', id: 'pathkink', label: 'Kink', file: `${ASSET_BASE}path-segments/pathkink.webp`, start: 'centre', end: 'centre' },
    left: { key: 'left', id: 'pathleft', label: 'Move left', file: `${ASSET_BASE}path-segments/pathleft.webp`, start: 'centre', end: 'left' },
    right: { key: 'right', id: 'pathright', label: 'Move right', file: `${ASSET_BASE}path-segments/pathright.webp`, start: 'centre', end: 'right' },
    leftToStraight: { key: 'leftToStraight', id: 'pathlefttostraight', label: 'Left to centre', file: `${ASSET_BASE}path-segments/pathlefttostraight.webp`, start: 'left', end: 'centre' },
    rightToStraight: { key: 'rightToStraight', id: 'righttostraight', label: 'Right to centre', file: `${ASSET_BASE}path-segments/righttostraight.webp`, start: 'right', end: 'centre' },
  },
  audio: {
    snort: `${ASSET_BASE}audio/horse_snort.wav`,
    neigh: `${ASSET_BASE}audio/horse_neigh.mp3`,
    gallopSlow: `${ASSET_BASE}audio/horse_gallop_slow.mp3`,
    gallopFull: `${ASSET_BASE}audio/horse_gallop_full.mp3`,
    land: `${ASSET_BASE}audio/horse_land.mp3`,
    forest: `${ASSET_BASE}audio/forest_ambience.mp3`,
    bush: `${ASSET_BASE}audio/bush.mp3`,
  }
};

const GLB_ASSETS = [
  { url: `${ASSET_BASE}3d/dead_tree.glb`, label: 'Dead tree', type: 'tree', scale: 10, density: 0.55 },
  { url: `${ASSET_BASE}3d/hill_top_tree.glb`, label: 'Hill top tree', type: 'tree', scale: 9, density: 0.45 },
  { url: `${ASSET_BASE}3d/low_poly_fern.glb`, label: 'Low poly fern', type: 'detail', scale: 1.6, density: 0.75 },
  { url: `${ASSET_BASE}3d/fern.glb`, label: 'Fern', type: 'detail', scale: 1.5, density: 0.75, optional: true },
  { url: `${ASSET_BASE}3d/tall_bush.glb`, label: 'Tall bush', type: 'detail', scale: 2.2, density: 0.65, optional: true },
  { url: `${ASSET_BASE}3d/oak_trees.glb`, label: 'Oak trees', type: 'tree', scale: 11, density: 0.55 },
  { url: `${ASSET_BASE}3d/pine_tree.glb`, label: 'Pine tree', type: 'tree', scale: 13, density: 0.85 },
  { url: `${ASSET_BASE}3d/pine_tree__ps1_low_poly.glb`, label: 'Pine tree PS1', type: 'tree', scale: 12, density: 0.6 },
  { url: `${ASSET_BASE}3d/pine_with_awkward_teenage_face.glb`, label: 'Pine face', type: 'tree', scale: 12, density: 0.25 },
  { url: `${ASSET_BASE}3d/small_pine.glb`, label: 'Small pine', type: 'tree', scale: 7, density: 0.8 },
  { url: `${ASSET_BASE}3d/tree.glb`, label: 'Tree', type: 'tree', scale: 10, density: 0.75 },
  { url: `${ASSET_BASE}3d/tree_gn.glb`, label: 'Tree gn', type: 'tree', scale: 11, density: 0.45 },
  { url: `${ASSET_BASE}3d/tree_low-poly.glb`, label: 'Low poly tree', type: 'tree', scale: 10, density: 0.75 },
  { url: `${ASSET_BASE}3d/rock_low-poly.glb`, label: 'Rock', type: 'rock', scale: 1.25, density: 0.8 },
  { url: `${ASSET_BASE}3d/stone_low-poly.glb`, label: 'Stone', type: 'rock', scale: 1.1, density: 0.75 },
  { url: `${ASSET_BASE}3d/stylized_glowing_mushrooms.glb`, label: 'Glowing mushrooms', type: 'collectible', scale: 1.55, density: 0.38, value: 3 },
  { url: `${ASSET_BASE}3d/moneysack.glb`, label: 'Money sack', type: 'collectible', scale: 1.35, density: 0.24, value: 7, optional: true },
];

const TEMPLATES = {
  horse_forest_easy: { label: 'Obstacle Course', obstacleRate: 1, treeRate: 1, rockRate: 1, detailRate: 1 },
  horse_forest_dense: { label: 'Dense Forest Course', obstacleRate: 1.35, treeRate: 1.65, rockRate: 1.15, detailRate: 1.4 },
  horse_forest_night: { label: 'Moonlit Forest Course', obstacleRate: 1.15, treeRate: 1.25, rockRate: 1.1, detailRate: 1.2 },
};

const OC = {
  version: VERSION,
  mounted: false,
  active: false,
  running: false,
  paused: false,
  complete: false,
  templateId: 'horse_forest_easy',
  difficulty: 2,
  courseLength: 1500,
  speed: BASE_SPEED,
  currentSpeed: 0,
  targetSpeed: 0,
  startAssistTime: 0,
  distance: 0,
  score: 0,
  hits: 0,
  jumps: 0,
  collected: 0,
  successScore: 20,
  offPathTime: 0,
  pathHintDirection: 'right',
  pathAlphaThreshold: 96,
  collectibleAlphaThreshold: 150,
  pathVisualWidth: 31.8,
  laneWidth: 2.7,
  groundVisualWidth: 220,
  groundTextureWorldSize: 220,
  sceneryDistance: 1.6,
  steerSpeed: 18,
  bumpStrength: 0.12,
  displacementStrength: 0.035,
  vanishX: 0,
  vanishY: 0.35,
  gridEnabled: false,
  overviewPathOverlay: true,
  whiteBackground: false,
  screenBrightness: 1,
  screenContrast: 1,
  screenSaturation: 1,
  screenTint: '#000000',
  screenTintStrength: 0,
  keys: new Set(),
  player: { x: 0, y: 0, vy: 0, grounded: true, jumpingHeld: false, jumpHoldTime: 0, maxJumpHoldTime: 0.68 },
  pathSequence: [],
  objects: [],
  placed: [],
  glbInstances: [],
  glbTemplates: new Map(),
  glbAssetUrls: GLB_ASSETS.map((asset) => asset.url),
  glbControls: new Map(),
  selectedGlbAssetUrl: '',
  selectionBoxes: [],
  selectedLayerId: 'path',
  soloLayerId: null,
  layers: new Map(),
  pathAlphaMaps: new Map(),
  pathAlphaPromises: new Map(),
  requiredAssetFailures: [],
  requiredReady: false,
  loadingDone: false,
  renderLoopRunning: false,
  renderLoopTick: false,
  loadingTotal: 0,
  loadingCount: 0,
  textureLoader: null,
  gltfLoader: null,
  textureCache: new Map(),
  pathMaterialCache: new Map(),
  audioReady: false,
  audioClips: new Map(),
  lastVoiceAt: 0,
  lastBushAt: 0,
  wasForwardMoving: false,
  host: null,
  leftPanel: null,
  rightPanel: null,
  stage: null,
  scene: null,
  camera: null,
  renderer: null,
  world: null,
  grid: null,
  clock: null,
  frame: null,
  groundMaterial: null,
};

const $ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const signedToFactor = (value) => clamp(1 + (Number(value || 0) / 10), 0.05, 8);
const factorToSigned = (value) => Math.round((Number(value || 1) - 1) * 10);

export function openObstacleCourseWorkflow() {
  ensureMounted();
}

function ensureMounted() {
  if (OC.mounted) return;
  OC.mounted = true;
  OC.leftPanel = document.querySelector('.left-panel-body') || document.querySelector('.left-panel') || document.body;
  OC.rightPanel = document.querySelector('.right-panel') || document.body;
  updateDocumentVersion();
  injectStyles();
  mountLayout();
  bindInputs();
  initThree();
  preloadAssets().then(() => {
    if (!OC.requiredReady) {
      updateStats();
      return;
    }
    regenerateCourse();
    updateStats();
    setResult('Obstacle course ready.', 'success');
  });
}

function updateDocumentVersion() {
  document.title = `Obstacle Course · Puzzle Creator ${VERSION} · Forever Bound`;
  document.querySelectorAll('.version-pill,.status-pill').forEach((node) => {
    if (/V\d/.test(node.textContent || '')) node.textContent = VERSION;
  });
}

function injectStyles() {
  if ($('oc-consolidated-styles')) return;
  const style = document.createElement('style');
  style.id = 'oc-consolidated-styles';
  style.textContent = `
    .obstacle-app{height:100%;display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:12px;padding:14px;overflow:hidden}
    .obstacle-main-card,.obstacle-side-card{min-height:0;border:1px solid rgba(238,196,90,.32);border-radius:16px;background:rgba(5,10,16,.9);box-shadow:0 20px 70px rgba(0,0,0,.34);padding:16px;overflow:auto}
    .obstacle-header-line{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;border-bottom:1px solid rgba(238,196,90,.22);padding-bottom:12px;margin-bottom:14px}
    .obstacle-header-line h2{font-family:Cinzel,Georgia,serif;margin:.2rem 0;font-size:1.35rem}.obstacle-header-line .eyebrow{font-size:.66rem;color:#9ee6a4;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .obstacle-header-line p{margin:.3rem 0;color:#c9bfae;font-size:.78rem}.obstacle-status-pill{border:1px solid rgba(238,196,90,.55);border-radius:999px;padding:8px 10px;color:#eec45a;font-weight:900;font-size:.72rem}
    .obstacle-three-wrap{position:relative;width:100%;aspect-ratio:16/9;min-height:360px;border:1px solid rgba(124,202,125,.24);border-radius:14px;overflow:hidden;background:#05080d}
    .obstacle-three-wrap canvas{display:block;width:100%!important;height:100%!important;filter:brightness(var(--oc-brightness,1)) contrast(var(--oc-contrast,1)) saturate(var(--oc-saturation,1))!important}
    .obstacle-tint-overlay{position:absolute;inset:0;z-index:6;pointer-events:none;background:var(--oc-tint,#000);opacity:var(--oc-tint-opacity,0);mix-blend-mode:color}
    .obstacle-horse-overlay{position:absolute;left:50%;bottom:-38px;z-index:7;width:430px;height:247px;margin-left:-215px;pointer-events:none;filter:drop-shadow(0 7px 9px rgba(0,0,0,.72));opacity:.98;background-image:url('${ASSETS.horse}');background-repeat:no-repeat;background-size:700% 100%;background-position:50% 100%;transition:background-position .08s linear}
    .obstacle-hud{position:absolute;left:14px;right:14px;bottom:12px;z-index:8;display:flex;justify-content:space-between;gap:12px;pointer-events:none;color:#f4ead4;font-size:.75rem;text-shadow:0 2px 5px rgba(0,0,0,.8)}
    .obstacle-speed-badge{position:absolute;right:14px;top:12px;z-index:9;width:260px;background:transparent;border:0;padding:0;color:#f4ead4;pointer-events:none}
    .oc-powerbar-wrap{position:relative;width:230px;height:73px;margin:0 auto 4px;overflow:visible}
    .oc-powerbar-empty,.oc-powerbar-full,.oc-powerbar-full-clip{position:absolute;left:0;top:0;width:230px;height:73px;background-image:url('${ASSETS.powerbars}');background-repeat:no-repeat;background-size:230px auto;pointer-events:none}
    .oc-powerbar-empty{background-position:0 -175px}.oc-powerbar-full-clip{overflow:hidden;width:0;background:none;transition:width .08s linear}.oc-powerbar-full{background-position:0 -104px}
    .oc-powerbar-emoji{position:absolute;left:14px;top:19px;z-index:3;font-size:24px;line-height:1;filter:drop-shadow(0 2px 2px rgba(0,0,0,.8))}
    .oc-speed-label{display:flex;gap:8px;justify-content:flex-end;align-items:center;font-size:.72rem;font-weight:900;color:#eec45a}
    .oc-offpath-label{font-size:.72rem;font-weight:900;color:#ff7373;text-align:right}
    .oc-offpath-arrow{position:absolute;left:50%;top:42%;z-index:10;width:104px;height:104px;margin:-52px 0 0 -52px;display:none;background-image:url('${ASSETS.arrows}');background-repeat:no-repeat;background-size:200% 200%;background-color:transparent;border:0;border-radius:0;color:transparent;text-shadow:none;box-shadow:none;filter:drop-shadow(0 7px 10px rgba(0,0,0,.78));animation:ocPulseArrow .9s ease-in-out infinite;pointer-events:none}
    .oc-offpath-arrow.is-visible{display:block}.oc-offpath-arrow.dir-left{background-position:0% 100%}.oc-offpath-arrow.dir-right{background-position:100% 100%}@keyframes ocPulseArrow{0%,100%{transform:translateY(0) scale(.92)}50%{transform:translateY(-11px) scale(1.12)}}
    .hf-run-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.hf-run-controls button,.wide-button,.hf-export-json-button{min-height:36px;border:1px solid rgba(124,202,125,.35);border-radius:10px;background:rgba(20,72,37,.64);color:#f4ead4;font-weight:900;cursor:pointer}.hf-run-controls button:hover,.wide-button:hover,.hf-export-json-button:hover{border-color:rgba(238,196,90,.75)}
    .hf-run-controls button.is-running{border-color:rgba(158,230,164,.95);background:rgba(36,120,62,.9);box-shadow:0 0 0 2px rgba(158,230,164,.22),0 0 18px rgba(158,230,164,.2)}.hf-run-controls button.is-paused{border-color:rgba(238,196,90,.95);background:rgba(95,63,9,.88)}
    .hf-layer-panel,.hf-control-section{border:1px solid rgba(124,202,125,.22);border-radius:14px;padding:12px;background:rgba(7,14,22,.72);margin-bottom:12px}.hf-layer-panel h3,.hf-control-section h3{font-family:Cinzel,Georgia,serif;margin:.1rem 0 .75rem;font-size:.95rem}
    label.field-block,.range-row{display:block;color:#c9bfae;font-size:.72rem;font-weight:800;margin:9px 0}.field-block span,.range-row span{display:flex;justify-content:space-between;gap:8px;margin-bottom:5px}.field-block select,.field-block input,.range-row input{width:100%;min-width:0}.field-block select{background:#0b1219;color:#f4ead4;border:1px solid rgba(124,202,125,.28);border-radius:10px;padding:8px}.range-row output{color:#eec45a}
    .hf-button-row{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.hf-button-row button{min-height:34px;border:1px solid rgba(124,202,125,.35);border-radius:9px;background:rgba(20,72,37,.62);color:#f4ead4;font-weight:900}
    .field-check{display:flex;align-items:center;gap:8px;color:#c9bfae;font-size:.72rem;font-weight:800;margin:8px 0}.field-check input{width:auto}
    .hf-overview-wrap{margin-top:12px;border:1px solid rgba(238,196,90,.25);border-radius:12px;overflow:auto;background:#101914;max-height:390px}.hf-overview{display:block;width:100%;height:auto;min-height:250px}
    .hf-key-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;color:#c9bfae;font-size:.72rem}.hf-key-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px}.hf-key-path{background:#eec45a}.hf-key-tree{background:#48a24a}.hf-key-rock{background:#aaa}.hf-key-collectible{background:#5be5ff}.hf-key-obstacle{background:#b04b35}
    .oc-result{min-height:24px;margin:8px 0;color:#eec45a;font-size:.75rem}.oc-result.failure{color:#ff9a9a}.oc-result.success{color:#9ee6a4}
    .oc-loading{color:#eec45a;font-size:.72rem;font-weight:900;margin-top:8px}.right-preview-layout,.overview-window,.render-viewport{display:none!important}
  `;
  document.head.appendChild(style);
}

function mountLayout() {
  OC.rightPanel.innerHTML = `
    <div class="obstacle-app">
      <section class="obstacle-main-card">
        <div class="obstacle-header-line">
          <div><p class="eyebrow">Obstacle Course · ${VERSION}</p><h2 id="obstacle-title">Obstacle Course</h2><p id="obstacle-objective">Horse forest obstacle course using alpha-tested transparent path segments over forest_ground.webp.</p></div>
          <span id="obstacle-status" class="obstacle-status-pill">Loading</span>
        </div>
        <div id="obstacle-stage" class="obstacle-three-wrap">
          <div class="obstacle-tint-overlay"></div>
          <div id="obstacle-speed-badge" class="obstacle-speed-badge"></div>
          <div id="oc-offpath-arrow" class="oc-offpath-arrow dir-right"></div>
          <div id="obstacle-horse" class="obstacle-horse-overlay"></div>
          <div class="obstacle-hud"><span id="obstacle-distance-readout">Distance 0 / ${OC.courseLength}</span><span id="obstacle-score-readout">Score 0</span></div>
        </div>
        <div class="hf-run-controls">
          <button id="obstacle-start" type="button">Start Test</button>
          <button id="obstacle-pause" type="button">Pause</button>
          <button id="obstacle-reset-run" type="button">Reset Run</button>
        </div>
        <div id="obstacle-result" class="oc-result"></div>
        <div id="oc-loading" class="oc-loading">Loading assets 0 / 0</div>
        <section class="hf-overview-wrap"><canvas id="hf-overview" class="hf-overview" width="280" height="500"></canvas></section>
      </section>
      <aside class="obstacle-side-card">
        <section class="hf-control-section"><h3>Construction</h3>
          <label class="field-block"><span>Course Template</span><select id="obstacle-template"><option value="horse_forest_easy">Obstacle Course</option><option value="horse_forest_dense">Dense Forest Course</option><option value="horse_forest_night">Moonlit Forest Course</option></select></label>
          <label class="range-row"><span>Difficulty <output id="obstacle-difficulty-out">${OC.difficulty}</output></span><input id="obstacle-difficulty" type="range" min="1" max="5" step="1" value="${OC.difficulty}"></label>
          <label class="range-row"><span>Course Distance <output id="obstacle-distance-out">${OC.courseLength}</output></span><input id="obstacle-distance" type="range" min="700" max="3000" step="50" value="${OC.courseLength}"></label>
          <label class="range-row"><span>Forest Distance From Path Edge <output id="obstacle-scenery-distance-out">${OC.sceneryDistance.toFixed(1)}</output></span><input id="obstacle-scenery-distance" type="range" min="0.2" max="10" step="0.1" value="${OC.sceneryDistance}"></label>
          <button id="obstacle-regenerate" class="wide-button" type="button">Regenerate Obstacle Course</button>
        </section>
        <section class="hf-layer-panel"><h3>View Helpers</h3>
          <label class="field-check"><input id="oc-ground-grid-toggle" type="checkbox"> Show ground grid</label>
          <label class="field-check"><input id="oc-overview-path-overlay" type="checkbox" checked> Show path alpha on overview</label>
          <label class="range-row"><span>Vanishing Point X <output id="oc-vp-x-out">0.0</output></span><input id="oc-vp-x" type="range" min="-50" max="50" step="0.5" value="0"></label>
          <label class="range-row"><span>Vanishing Point Y <output id="oc-vp-y-out">0.35</output></span><input id="oc-vp-y" type="range" min="-50" max="50" step="0.5" value="0.35"></label>
        </section>
        <section class="hf-layer-panel"><h3>Global Visual</h3>
          <div id="hf-global-sliders"></div>
        </section>
        <section class="hf-layer-panel"><h3>Layer Controls</h3>
          <label class="field-block"><span>Selected layer</span><select id="hf-layer-select"></select></label>
          <div class="hf-button-row"><button id="hf-layer-visible" type="button">Hide/Show</button><button id="hf-layer-solo" type="button">Solo</button><button id="hf-layer-all" type="button">All</button></div>
          <div class="hf-button-row" style="margin-top:7px"><button id="hf-layer-above" type="button">Above</button><button id="hf-layer-below" type="button">Below</button><button id="hf-white-bg" type="button">BG White</button></div>
          <div id="hf-layer-sliders"></div>
        </section>
        <section class="hf-control-section"><h3>Overview Key</h3><div class="hf-key-list"><div><span class="hf-key-dot hf-key-path"></span>Path</div><div><span class="hf-key-dot hf-key-tree"></span>Tree</div><div><span class="hf-key-dot hf-key-rock"></span>Rock</div><div><span class="hf-key-dot hf-key-collectible"></span>Collectible</div><div><span class="hf-key-dot hf-key-obstacle"></span>Obstacle</div></div></section>
        <section class="hf-control-section"><h3>Settings</h3><button id="hf-export-json" class="hf-export-json-button" type="button">Download JSON</button><input id="hf-import-json-file" type="file" accept="application/json,.json" hidden><button id="hf-import-json" class="hf-export-json-button" type="button" style="margin-top:8px">Import JSON Settings</button></section>
      </aside>
    </div>
  `;
  OC.stage = $('obstacle-stage');
  mountLeftPanel();
  populateLayerSelect();
  createGlobalSliders();
  createLayerSliders();
  updateStats();
}

function mountLeftPanel() {
  if (!OC.leftPanel) return;
  OC.leftPanel.innerHTML = `
    <section class="panel tool-panel obstacle-panel"><div class="panel-title-row"><div><p class="eyebrow">Obstacle Course · ${VERSION}</p><h2>Obstacle Course</h2></div><span class="status-pill">${VERSION}</span></div><p class="obstacle-panel-copy">Course editor controls use transparent path segment WEBPs over forest_ground.webp.</p><p class="hint-text">Forest Distance From Path Edge controls X distance from the visible path edge, not forward Z distance.</p></section>
  `;
}

function bindInputs() {
  $('obstacle-template')?.addEventListener('change', (event) => { OC.templateId = event.target.value; regenerateCourse(); });
  $('obstacle-difficulty')?.addEventListener('input', (event) => { OC.difficulty = Number(event.target.value); $('obstacle-difficulty-out').textContent = OC.difficulty; });
  $('obstacle-distance')?.addEventListener('input', (event) => { OC.courseLength = Number(event.target.value); $('obstacle-distance-out').textContent = OC.courseLength; updateStats(); });
  $('obstacle-scenery-distance')?.addEventListener('input', (event) => { OC.sceneryDistance = Number(event.target.value); $('obstacle-scenery-distance-out').textContent = OC.sceneryDistance.toFixed(1); });
  $('obstacle-regenerate')?.addEventListener('click', regenerateCourse);
  $('obstacle-start')?.addEventListener('click', startRun);
  $('obstacle-pause')?.addEventListener('click', pauseRun);
  $('obstacle-reset-run')?.addEventListener('click', () => resetRun(false));
  $('hf-layer-select')?.addEventListener('change', (event) => { OC.selectedLayerId = event.target.value; createLayerSliders(); refreshGlbSelectionBoxes(); drawOverview(); });
  $('hf-layer-visible')?.addEventListener('click', toggleSelectedLayerVisible);
  $('hf-layer-solo')?.addEventListener('click', toggleSelectedLayerSolo);
  $('hf-layer-all')?.addEventListener('click', () => { OC.soloLayerId = null; applyAllLayers(); drawOverview(); });
  $('hf-layer-above')?.addEventListener('click', () => nudgeSelectedOrder(1));
  $('hf-layer-below')?.addEventListener('click', () => nudgeSelectedOrder(-1));
  $('hf-white-bg')?.addEventListener('click', toggleWhiteBackground);
  $('oc-ground-grid-toggle')?.addEventListener('change', (event) => { OC.gridEnabled = event.target.checked; if (OC.grid) OC.grid.visible = OC.gridEnabled; drawFrame(); });
  $('oc-overview-path-overlay')?.addEventListener('change', (event) => { OC.overviewPathOverlay = event.target.checked; drawOverview(); });
  $('oc-vp-x')?.addEventListener('input', (event) => { OC.vanishX = Number(event.target.value); $('oc-vp-x-out').textContent = OC.vanishX.toFixed(1); applyCamera(); drawFrame(); });
  $('oc-vp-y')?.addEventListener('input', (event) => { OC.vanishY = Number(event.target.value); $('oc-vp-y-out').textContent = OC.vanishY.toFixed(2); applyCamera(); drawFrame(); });
  $('hf-export-json')?.addEventListener('click', exportJsonSettings);
  $('hf-import-json')?.addEventListener('click', () => $('hf-import-json-file')?.click());
  $('hf-import-json-file')?.addEventListener('change', importJsonSettings);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('resize', resizeRenderer);
}

function initThree() {
  OC.textureLoader = new THREE.TextureLoader();
  OC.gltfLoader = new GLTFLoader();
  OC.scene = new THREE.Scene();
  OC.camera = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 5000);
  OC.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  OC.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  OC.renderer.outputEncoding = THREE.sRGBEncoding;
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
  applyCamera();
  resizeRenderer();
  drawFrame();
}

function applyCamera() {
  if (!OC.camera) return;
  const camX = (OC.vanishX || 0) * 0.04;
  const lookX = (OC.vanishX || 0) * 0.08;
  const lookY = GROUND_Y + (OC.vanishY || 0) * 0.06;
  OC.camera.position.set(camX, 4.4, 10.8);
  OC.camera.lookAt(lookX, lookY, -92);
  OC.camera.updateProjectionMatrix();
}

function resizeRenderer() {
  if (!OC.renderer || !OC.stage || !OC.camera) return;
  const width = Math.max(1, OC.stage.clientWidth);
  const height = Math.max(300, Math.round(width * 9 / 16));
  OC.camera.aspect = width / height;
  OC.camera.updateProjectionMatrix();
  OC.renderer.setSize(width, height);
}

function loadTexture(url, options = {}) {
  const key = `${url}|${JSON.stringify(options)}`;
  if (OC.textureCache.has(key)) return OC.textureCache.get(key);
  const texture = OC.textureLoader.load(`${url}?v=${CACHE_VERSION}`, undefined, undefined, () => console.warn('[ObstacleCourse] texture failed', url));
  texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  if (options.repeat) {
    texture.wrapS = options.repeatX === false ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    texture.wrapT = options.repeatY === false ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    texture.repeat.set(options.repeat[0], options.repeat[1]);
  }
  OC.textureCache.set(key, texture);
  return texture;
}

function setLoading(count, total) {
  OC.loadingCount = count;
  OC.loadingTotal = total;
  const node = $('oc-loading');
  if (node) node.textContent = `Loading assets ${count} / ${total}`;
}

async function preloadAssets() {
  const requiredImages = [
    ASSETS.horse,
    ASSETS.background,
    ASSETS.ground,
    ASSETS.powerbars,
    ASSETS.arrows,
    ...Object.values(ASSETS.pathSegments).map((item) => item.file),
  ];
  const requiredAlpha = Object.values(ASSETS.pathSegments);
  const optionalGlb = GLB_ASSETS;
  const total = requiredImages.length + requiredAlpha.length + optionalGlb.length;
  let count = 0;
  OC.requiredAssetFailures = [];
  setLoading(0, total);

  await Promise.all(requiredImages.map((url) => preloadImage(url).then((ok) => {
    count += 1;
    setLoading(count, total);
    if (!ok) OC.requiredAssetFailures.push(url);
  })));

  await Promise.all(requiredAlpha.map((def) => loadPathAlphaMap(def).then((ok) => {
    count += 1;
    setLoading(count, total);
    if (!ok) OC.requiredAssetFailures.push(def.file);
  })));

  await Promise.all(optionalGlb.map((asset) => loadGlbAsset(asset).finally(() => {
    count += 1;
    setLoading(count, total);
  })));

  OC.loadingDone = true;
  OC.requiredReady = OC.requiredAssetFailures.length === 0;
  const node = $('oc-loading');
  if (node) {
    node.textContent = OC.requiredReady
      ? `Loading assets ${count} / ${total} complete`
      : `Missing required assets: ${OC.requiredAssetFailures.length}`;
  }
  if (!OC.requiredReady) {
    setResult(`Required asset failure: ${OC.requiredAssetFailures.join(', ')}`, 'failure');
  }
}

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => {
      console.warn('[ObstacleCourse] required image failed', url);
      resolve(false);
    };
    img.src = `${url}?v=${CACHE_VERSION}`;
  });
}

function loadGlbAsset(asset) {
  return new Promise((resolve) => {
    OC.gltfLoader.load(`${asset.url}?v=${CACHE_VERSION}`, (gltf) => {
      const scene = gltf.scene || gltf.scenes?.[0];
      if (scene) {
        normalizeGlbTemplate(scene);
        OC.glbTemplates.set(asset.url, { asset, scene });
      }
      resolve(true);
    }, undefined, (error) => {
      if (!asset.optional) console.warn('[ObstacleCourse] GLB failed', asset.url, error);
      resolve(false);
    });
  });
}

function normalizeGlbTemplate(root) {
  root.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = false;
      node.receiveShadow = true;
      if (node.material) {
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach((mat) => {
          if (mat.map) mat.map.encoding = THREE.sRGBEncoding;
          mat.transparent = mat.transparent || false;
        });
      }
    }
  });
}

function makeLayer(id, label, group, options = {}) {
  const layer = {
    id, label, group,
    visible: options.visible ?? true,
    opacity: options.opacity ?? 1,
    x: options.x ?? 0,
    y: options.y ?? 0,
    z: options.z ?? 0,
    scale: options.scale ?? 1,
    brightness: options.brightness ?? 1,
    contrast: options.contrast ?? 1,
    saturation: options.saturation ?? 1,
    tint: options.tint ?? '#ffffff',
    tintStrength: options.tintStrength ?? 0,
    order: options.order ?? 0,
  };
  OC.layers.set(id, layer);
  return layer;
}

function isLayerDisplayed(layer) {
  if (!layer) return false;
  if (OC.soloLayerId) return layer.id === OC.soloLayerId;
  return layer.visible;
}

function rememberBaseScale(node) {
  if (!node?.userData) return;
  if (!node.userData.baseScale) node.userData.baseScale = node.scale.clone();
}

function rememberBaseMaterial(mat) {
  if (!mat?.userData) mat.userData = {};
  if (mat.color && !mat.userData.baseColor) mat.userData.baseColor = mat.color.clone();
}

function applyVisualToMaterial(mat, cfg) {
  if (!mat) return;
  rememberBaseMaterial(mat);
  const opacity = cfg.opacity ?? 1;
  mat.transparent = opacity < 0.995 || mat.transparent;
  mat.opacity = opacity;
  if (mat.color && mat.userData.baseColor) {
    const color = mat.userData.baseColor.clone();
    const brightness = cfg.brightness ?? 1;
    const saturation = cfg.saturation ?? 1;
    color.multiplyScalar(brightness);
    if (saturation !== 1) {
      const hsl = {};
      color.getHSL(hsl);
      color.setHSL(hsl.h, clamp(hsl.s * saturation, 0, 1), clamp(hsl.l, 0, 1));
    }
    if (cfg.tint && cfg.tint !== '#ffffff' && (cfg.tintStrength || 0) > 0) {
      color.lerp(new THREE.Color(cfg.tint), clamp(cfg.tintStrength, 0, 1));
    }
    mat.color.copy(color);
  }
  mat.needsUpdate = true;
}

function applyLayer(layer) {
  if (!layer?.group) return;
  layer.group.visible = isLayerDisplayed(layer);
  layer.group.position.set(layer.x || 0, layer.y || 0, layer.z || 0);
  layer.group.scale.setScalar(['ground'].includes(layer.id) ? (layer.scale || 1) : 1);
  layer.group.children.forEach((child) => {
    rememberBaseScale(child);
    if (!['ground'].includes(layer.id)) {
      const base = child.userData.baseScale || child.scale;
      child.scale.copy(base).multiplyScalar(layer.scale || 1);
    }
  });
  layer.group.traverse((node) => {
    node.renderOrder = layer.order || 0;
    if (!node.material) return;
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    mats.forEach((mat) => applyVisualToMaterial(mat, layer));
  });
}

function applyAllLayers() {
  OC.layers.forEach(applyLayer);
  applyAllGlbAssetControls();
}

function populateLayerSelect() {
  const select = $('hf-layer-select');
  if (!select) return;
  const selected = OC.selectedLayerId;
  const options = [
    ['ground', 'Forest ground'],
    ['path', 'Path'],
    ['trees', 'Trees'],
    ['rocks', 'Rocks'],
    ['details', 'Ferns / bushes'],
    ['collectibles', 'Collectibles'],
    ['obstacles', 'Obstacles'],
    ['glbAsset', 'GLB Asset'],
  ];
  select.innerHTML = options.map(([id, label]) => `<option value="${id}">${label}</option>`).join('');
  select.value = options.some(([id]) => id === selected) ? selected : 'path';
  OC.selectedLayerId = select.value;
}

function buildSliderRow(host, prefix, prop, label, min, max, step, value, handler) {
  const row = document.createElement('label');
  row.className = 'range-row';
  row.innerHTML = `<span>${label} <output id="${prefix}-${prop}-out">${formatNumber(value)}</output></span><input id="${prefix}-${prop}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;
  host.appendChild(row);
  row.querySelector('input').addEventListener('input', (event) => {
    const v = Number(event.target.value || 0);
    row.querySelector('output').textContent = formatNumber(v);
    handler(v);
  });
}

function formatNumber(v) {
  return Number.isInteger(Number(v)) ? String(Number(v)) : Number(v).toFixed(2);
}

function createGlobalSliders() {
  const host = $('hf-global-sliders');
  if (!host) return;
  host.innerHTML = '';
  buildSliderRow(host, 'hf-global', 'brightness', 'Brightness', -50, 50, 1, factorToSigned(OC.screenBrightness), (v) => { OC.screenBrightness = signedToFactor(v); updateScreenFilters(); });
  buildSliderRow(host, 'hf-global', 'contrast', 'Contrast', -50, 50, 1, factorToSigned(OC.screenContrast), (v) => { OC.screenContrast = signedToFactor(v); updateScreenFilters(); });
  buildSliderRow(host, 'hf-global', 'saturation', 'Saturation', -50, 50, 1, factorToSigned(OC.screenSaturation), (v) => { OC.screenSaturation = signedToFactor(v); updateScreenFilters(); });
  buildSliderRow(host, 'hf-global', 'tintStrength', 'Tint Amt', 0, 1, 0.02, OC.screenTintStrength, (v) => { OC.screenTintStrength = v; updateScreenFilters(); });
  const tintRow = document.createElement('label');
  tintRow.className = 'field-block';
  tintRow.innerHTML = `<span>Screen Tint</span><input id="hf-global-tint" type="color" value="${OC.screenTint}">`;
  host.appendChild(tintRow);
  tintRow.querySelector('input').addEventListener('input', (event) => { OC.screenTint = event.target.value; updateScreenFilters(); });
}

function createLayerSliders() {
  const host = $('hf-layer-sliders');
  if (!host) return;
  host.innerHTML = '';
  if (OC.selectedLayerId === 'glbAsset') {
    createGlbAssetSliders(host);
    return;
  }
  const layer = OC.layers.get(OC.selectedLayerId);
  if (!layer) {
    host.innerHTML = '<p class="hint-text">No layer selected.</p>';
    return;
  }
  layer.scaleOffset = layer.scaleOffset ?? factorToSigned(layer.scale);
  layer.brightnessOffset = layer.brightnessOffset ?? factorToSigned(layer.brightness);
  layer.contrastOffset = layer.contrastOffset ?? factorToSigned(layer.contrast);
  layer.saturationOffset = layer.saturationOffset ?? factorToSigned(layer.saturation);

  buildSliderRow(host, 'hf-layer', 'x', 'X', -50, 50, 0.5, layer.x || 0, (v) => { layer.x = v; applyLayer(layer); drawFrame(); drawOverview(); });
  buildSliderRow(host, 'hf-layer', 'z', 'Z', -50, 50, 0.5, layer.z || 0, (v) => { layer.z = v; applyLayer(layer); drawFrame(); drawOverview(); });
  buildSliderRow(host, 'hf-layer', 'y', 'Y', -50, 50, 0.5, layer.y || 0, (v) => { layer.y = v; applyLayer(layer); drawFrame(); });
  buildSliderRow(host, 'hf-layer', 'scaleOffset', 'Scale', -50, 50, 1, layer.scaleOffset, (v) => { layer.scaleOffset = v; layer.scale = signedToFactor(v); applyLayer(layer); drawFrame(); drawOverview(); });
  buildSliderRow(host, 'hf-layer', 'opacity', 'Opacity', 0, 1, 0.02, layer.opacity ?? 1, (v) => { layer.opacity = v; applyLayer(layer); drawFrame(); });
  buildSliderRow(host, 'hf-layer', 'brightnessOffset', 'Bright', -50, 50, 1, layer.brightnessOffset, (v) => { layer.brightnessOffset = v; layer.brightness = signedToFactor(v); applyLayer(layer); drawFrame(); });
  buildSliderRow(host, 'hf-layer', 'contrastOffset', 'Contrast', -50, 50, 1, layer.contrastOffset, (v) => { layer.contrastOffset = v; layer.contrast = signedToFactor(v); applyLayer(layer); drawFrame(); });
  buildSliderRow(host, 'hf-layer', 'saturationOffset', 'Saturation', -50, 50, 1, layer.saturationOffset, (v) => { layer.saturationOffset = v; layer.saturation = signedToFactor(v); applyLayer(layer); drawFrame(); });
  buildSliderRow(host, 'hf-layer', 'tintStrength', 'Tint Amt', 0, 1, 0.02, layer.tintStrength || 0, (v) => { layer.tintStrength = v; applyLayer(layer); drawFrame(); });
  buildSliderRow(host, 'hf-layer', 'order', 'Order', -50, 50, 1, layer.order || 0, (v) => { layer.order = v; applyLayer(layer); drawFrame(); });
  const tintRow = document.createElement('label');
  tintRow.className = 'field-block';
  tintRow.innerHTML = `<span>Layer Tint</span><input id="hf-layer-tint" type="color" value="${layer.tint || '#ffffff'}">`;
  host.appendChild(tintRow);
  tintRow.querySelector('input').addEventListener('input', (event) => { layer.tint = event.target.value; applyLayer(layer); drawFrame(); });
}

function glbControl(url) {
  if (!url) return null;
  if (!OC.glbControls.has(url)) {
    OC.glbControls.set(url, { x: 0, y: 0, z: 0, scale: 1, scaleOffset: 0, opacity: 1, brightness: 1, brightnessOffset: 0, contrast: 1, contrastOffset: 0, saturation: 1, saturationOffset: 0, tint: '#ffffff', tintStrength: 0, order: 0 });
  }
  return OC.glbControls.get(url);
}

function createGlbAssetSliders(host) {
  const urls = Array.from(new Set([...OC.glbAssetUrls, ...OC.glbInstances.map((obj) => obj.userData.glbAssetUrl).filter(Boolean)]));
  if (!OC.selectedGlbAssetUrl && urls.length) OC.selectedGlbAssetUrl = urls[0];
  const row = document.createElement('label');
  row.className = 'field-block';
  row.innerHTML = `<span>GLB Asset</span><select id="hf-glb-asset-select">${urls.map((url) => `<option value="${url}">${url.split('/').pop()}</option>`).join('')}</select>`;
  host.appendChild(row);
  const select = row.querySelector('select');
  select.value = OC.selectedGlbAssetUrl;
  select.addEventListener('change', (event) => {
    OC.selectedGlbAssetUrl = event.target.value;
    refreshGlbSelectionBoxes();
    createLayerSliders();
    drawOverview();
  });
  const cfg = glbControl(OC.selectedGlbAssetUrl);
  if (!cfg) return;
  buildSliderRow(host, 'hf-glb', 'x', 'X', -50, 50, 0.5, cfg.x || 0, (v) => { cfg.x = v; applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'z', 'Z', -50, 50, 0.5, cfg.z || 0, (v) => { cfg.z = v; applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'y', 'Y', -50, 50, 0.5, cfg.y || 0, (v) => { cfg.y = v; applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'scaleOffset', 'Scale', -50, 50, 1, cfg.scaleOffset || 0, (v) => { cfg.scaleOffset = v; cfg.scale = signedToFactor(v); applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'opacity', 'Opacity', 0, 1, 0.02, cfg.opacity ?? 1, (v) => { cfg.opacity = v; applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'brightnessOffset', 'Bright', -50, 50, 1, cfg.brightnessOffset || 0, (v) => { cfg.brightnessOffset = v; cfg.brightness = signedToFactor(v); applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'contrastOffset', 'Contrast', -50, 50, 1, cfg.contrastOffset || 0, (v) => { cfg.contrastOffset = v; cfg.contrast = signedToFactor(v); applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'saturationOffset', 'Saturation', -50, 50, 1, cfg.saturationOffset || 0, (v) => { cfg.saturationOffset = v; cfg.saturation = signedToFactor(v); applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'tintStrength', 'Tint Amt', 0, 1, 0.02, cfg.tintStrength || 0, (v) => { cfg.tintStrength = v; applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'order', 'Order', -50, 50, 1, cfg.order || 0, (v) => { cfg.order = v; applyAllGlbAssetControls(); });
  const tintRow = document.createElement('label');
  tintRow.className = 'field-block';
  tintRow.innerHTML = `<span>GLB Tint</span><input id="hf-glb-tint" type="color" value="${cfg.tint || '#ffffff'}">`;
  host.appendChild(tintRow);
  tintRow.querySelector('input').addEventListener('input', (event) => { cfg.tint = event.target.value; applyAllGlbAssetControls(); });
  refreshGlbSelectionBoxes();
}

function toggleSelectedLayerVisible() {
  const layer = OC.layers.get(OC.selectedLayerId);
  if (!layer) return;
  layer.visible = !layer.visible;
  applyAllLayers();
  drawOverview();
}

function toggleSelectedLayerSolo() {
  if (!OC.layers.has(OC.selectedLayerId)) return;
  OC.soloLayerId = OC.soloLayerId === OC.selectedLayerId ? null : OC.selectedLayerId;
  applyAllLayers();
  drawOverview();
}

function nudgeSelectedOrder(delta) {
  const layer = OC.layers.get(OC.selectedLayerId);
  if (!layer) return;
  layer.order = (layer.order || 0) + delta;
  applyLayer(layer);
  createLayerSliders();
  drawFrame();
}

function toggleWhiteBackground() {
  OC.whiteBackground = !OC.whiteBackground;
  if (OC.scene) {
    OC.scene.background = OC.whiteBackground ? new THREE.Color(0xffffff) : loadTexture(ASSETS.background);
  }
  if (OC.stage) OC.stage.style.background = OC.whiteBackground ? '#fff' : '#05080d';
  drawFrame();
}

function updateScreenFilters() {
  const canvas = OC.renderer?.domElement;
  const filter = `brightness(${OC.screenBrightness || 1}) contrast(${OC.screenContrast || 1}) saturate(${OC.screenSaturation || 1})`;
  if (canvas) canvas.style.filter = filter;
  if (OC.host) {
    OC.host.style.setProperty('--oc-brightness', String(OC.screenBrightness || 1));
    OC.host.style.setProperty('--oc-contrast', String(OC.screenContrast || 1));
    OC.host.style.setProperty('--oc-saturation', String(OC.screenSaturation || 1));
  }
  const tint = document.querySelector('.obstacle-tint-overlay');
  if (tint) {
    tint.style.setProperty('--oc-tint', OC.screenTint || '#000000');
    tint.style.setProperty('--oc-tint-opacity', String(OC.screenTintStrength || 0));
  }
}

function generatePathSequence() {
  OC.pathSequence = [];
  let pos = 'centre';
  const count = Math.ceil((OC.courseLength + 420) / SEGMENT_WORLD_STEP);
  for (let i = 0; i < count; i += 1) {
    let choices;
    if (pos === 'left') choices = [ASSETS.pathSegments.straight, ASSETS.pathSegments.kink, ASSETS.pathSegments.leftToStraight, ASSETS.pathSegments.leftToStraight];
    else if (pos === 'right') choices = [ASSETS.pathSegments.straight, ASSETS.pathSegments.kink, ASSETS.pathSegments.rightToStraight, ASSETS.pathSegments.rightToStraight];
    else choices = [ASSETS.pathSegments.straight, ASSETS.pathSegments.straight, ASSETS.pathSegments.kink, ASSETS.pathSegments.left, ASSETS.pathSegments.right];
    let def = pick(choices);
    if (pos !== 'centre' && def.start === 'centre') def = pos === 'left' ? ASSETS.pathSegments.leftToStraight : ASSETS.pathSegments.rightToStraight;
    const distance = i * SEGMENT_WORLD_STEP;
    const startX = PATH_POSITIONS[def.start] ?? PATH_POSITIONS[pos] ?? 0;
    const endX = PATH_POSITIONS[def.end] ?? startX;
    OC.pathSequence.push({ ...def, distance, startX, endX });
    pos = def.end;
  }
}

function clearWorld() {
  if (!OC.world) return;
  while (OC.world.children.length) {
    const child = OC.world.children.pop();
    child.traverse?.((node) => {
      node.geometry?.dispose?.();
      if (Array.isArray(node.material)) node.material.forEach((mat) => mat.dispose?.());
      else node.material?.dispose?.();
    });
  }
  OC.objects = [];
  OC.placed = [];
  OC.glbInstances = [];
  clearSelectionBoxes();
}

function regenerateCourse() {
  if (!OC.world || !OC.scene) return;
  clearWorld();
  OC.layers.clear();
  OC.distance = 0;
  resetRun(true);
  buildMaterials();
  buildWorld();
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  addObstacles(Math.round((7 + OC.difficulty * 4) * template.obstacleRate));
  addCollectibles(5 + OC.difficulty * 2);
  populateLayerSelect();
  createLayerSliders();
  applyAllLayers();
  refreshGlbSelectionBoxes();
  updateTemplateText();
  updateStats();
  drawOverview();
  renderOnce();
}

function buildMaterials() {
  const length = Math.max(OC.courseLength + 780, SEGMENT_WORLD_STEP * 6);
  const groundMap = loadTexture(ASSETS.ground, { repeat: [1, Math.max(1, length / OC.groundTextureWorldSize)], repeatX: false });
  groundMap.wrapS = THREE.ClampToEdgeWrapping;
  groundMap.wrapT = THREE.RepeatWrapping;
  if (!OC.whiteBackground) OC.scene.background = loadTexture(ASSETS.background);
  OC.groundMaterial = new THREE.MeshStandardMaterial({
    map: groundMap,
    bumpMap: groundMap,
    displacementMap: groundMap,
    bumpScale: OC.bumpStrength,
    displacementScale: OC.displacementStrength,
    roughness: 1,
    metalness: 0,
    transparent: true,
    alphaTest: 0.01,
    opacity: 1,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}

function buildWorld() {
  const groundLayer = new THREE.Group();
  const pathLayer = new THREE.Group();
  const treeLayer = new THREE.Group();
  const rockLayer = new THREE.Group();
  const detailLayer = new THREE.Group();
  const collectibleLayer = new THREE.Group();
  const obstacleLayer = new THREE.Group();
  OC.world.add(groundLayer, pathLayer, treeLayer, rockLayer, detailLayer, collectibleLayer, obstacleLayer);
  makeLayer('ground', 'Forest ground', groundLayer, { order: 0 });
  makeLayer('path', 'Path', pathLayer, { order: 4 });
  makeLayer('trees', 'Trees', treeLayer, { order: 12 });
  makeLayer('rocks', 'Rocks', rockLayer, { order: 13 });
  makeLayer('details', 'Ferns / bushes', detailLayer, { order: 14 });
  makeLayer('collectibles', 'Collectibles', collectibleLayer, { order: 15 });
  makeLayer('obstacles', 'Obstacles', obstacleLayer, { order: 16 });
  generatePathSequence();
  buildGround(groundLayer);
  buildPathSegments(pathLayer);
  buildTreeCorridor(treeLayer);
  scatterForestFloorDetail(rockLayer);
  scatterPathEdgeDetails(detailLayer);
}

function buildGround(parent) {
  const length = Math.max(OC.courseLength + 780, SEGMENT_WORLD_STEP * 6);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(OC.groundVisualWidth, length, 36, 96), OC.groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, GROUND_Y, -length / 2 + 120);
  ground.renderOrder = 0;
  parent.add(ground);
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

function buildPathSegments(parent) {
  OC.pathSequence.forEach((seg) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(OC.pathVisualWidth, SEGMENT_WORLD_LENGTH, 1, 1), getPathMaterial(seg));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set((seg.startX + seg.endX) / 2, GROUND_Y + 0.052, -seg.distance - SEGMENT_WORLD_LENGTH / 2);
    mesh.renderOrder = 4;
    mesh.userData.pathSegment = seg;
    parent.add(mesh);
  });
}

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

function ensurePathAlphaMaps() {
  return Promise.all(Object.values(ASSETS.pathSegments).map(loadPathAlphaMap));
}

function loadPathAlphaMap(def) {
  if (!def) return Promise.resolve(false);
  if (OC.pathAlphaMaps.has(def.id)) return Promise.resolve(Boolean(OC.pathAlphaMaps.get(def.id)));
  if (OC.pathAlphaPromises.has(def.id)) return OC.pathAlphaPromises.get(def.id);

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        OC.pathAlphaMaps.set(def.id, {
          width: canvas.width,
          height: canvas.height,
          data: ctx.getImageData(0, 0, canvas.width, canvas.height).data
        });
        resolve(true);
      } catch (error) {
        console.warn('[ObstacleCourse] path alpha map failed', def.id, error);
        OC.pathAlphaMaps.set(def.id, null);
        resolve(false);
      }
    };
    img.onerror = () => {
      console.warn('[ObstacleCourse] path alpha map image failed', def.file);
      OC.pathAlphaMaps.set(def.id, null);
      resolve(false);
    };
    img.src = `${def.file}?v=${CACHE_VERSION}`;
  });

  OC.pathAlphaPromises.set(def.id, promise);
  return promise;
}

function alphaSegmentAt(distance) {
  if (!OC.pathSequence.length) return null;
  const index = clamp(Math.floor(distance / SEGMENT_WORLD_STEP), 0, OC.pathSequence.length - 1);
  return OC.pathSequence[index] || null;
}

function sampleAlpha(map, u, v, radius = 1) {
  if (!map?.data) return null;
  const cx = clamp(Math.round(u * (map.width - 1)), 0, map.width - 1);
  const cy = clamp(Math.round(v * (map.height - 1)), 0, map.height - 1);
  let maxAlpha = 0;
  for (let yy = -radius; yy <= radius; yy += 1) {
    const py = clamp(cy + yy, 0, map.height - 1);
    for (let xx = -radius; xx <= radius; xx += 1) {
      const px = clamp(cx + xx, 0, map.width - 1);
      maxAlpha = Math.max(maxAlpha, map.data[(py * map.width + px) * 4 + 3] || 0);
    }
  }
  return maxAlpha;
}

function pathAlphaAtWorld(worldX, distance) {
  const seg = alphaSegmentAt(distance);
  if (!seg) return null;
  const map = OC.pathAlphaMaps.get(seg.id);
  if (!map) return null;
  const width = OC.pathVisualWidth;
  const meshCenterX = (seg.startX + seg.endX) / 2;
  const u = clamp(((worldX - meshCenterX) / width) + 0.5, 0, 1);
  const t = clamp((distance - seg.distance) / SEGMENT_WORLD_LENGTH, 0, 1);
  return Math.max(sampleAlpha(map, u, t, 2) || 0, sampleAlpha(map, u, 1 - t, 2) || 0);
}

function nearestVisiblePathX(distance, fromX) {
  const seg = alphaSegmentAt(distance);
  if (!seg) return pathCenterAt(distance);
  const width = OC.pathVisualWidth;
  const meshCenterX = (seg.startX + seg.endX) / 2;
  let best = null;
  const step = Math.max(0.35, width / 48);
  for (let x = meshCenterX - width * 0.49; x <= meshCenterX + width * 0.49; x += step) {
    const alpha = pathAlphaAtWorld(x, distance) || 0;
    if (alpha >= OC.pathAlphaThreshold) {
      const dist = Math.abs(x - fromX);
      if (!best || dist < best.dist) best = { x, dist, alpha };
    }
  }
  return best?.x ?? pathCenterAt(distance);
}

function visibleCollectiblePathX(distance) {
  const centre = pathCenterAt(distance);
  const seg = alphaSegmentAt(distance);
  if (!seg) return centre;
  const width = OC.pathVisualWidth;
  const meshCenterX = (seg.startX + seg.endX) / 2;
  const candidates = [];
  const step = Math.max(0.35, width / 44);
  for (let x = meshCenterX - width * 0.48; x <= meshCenterX + width * 0.48; x += step) {
    const alpha = pathAlphaAtWorld(x, distance) || 0;
    if (alpha >= OC.collectibleAlphaThreshold) candidates.push({ x, alpha, bias: Math.abs(x - centre) });
  }
  if (!candidates.length) {
    for (let x = meshCenterX - width * 0.48; x <= meshCenterX + width * 0.48; x += step) {
      const alpha = pathAlphaAtWorld(x, distance) || 0;
      if (alpha >= OC.pathAlphaThreshold) candidates.push({ x, alpha, bias: Math.abs(x - centre) });
    }
  }
  if (!candidates.length) return centre;
  candidates.sort((a, b) => (a.bias - b.bias) || (b.alpha - a.alpha));
  return pick(candidates.slice(0, Math.min(8, candidates.length))).x;
}

function pathStatus() {
  const worldX = playerWorldX();
  const alpha = pathAlphaAtWorld(worldX, OC.distance);
  if (alpha === null) {
    const abs = Math.abs(OC.player.x);
    return abs > OC.laneWidth * 0.95 ? 'off' : abs > OC.laneWidth * 0.7 ? 'edge' : 'on';
  }
  if (alpha >= OC.pathAlphaThreshold) return 'on';
  const nearest = nearestVisiblePathX(OC.distance, worldX);
  OC.pathHintDirection = nearest < worldX ? 'left' : 'right';
  return 'off';
}

function createGlbModel(type, targetHeight) {
  const assets = GLB_ASSETS.filter((asset) => asset.type === type && OC.glbTemplates.has(asset.url));
  if (!assets.length) return null;
  const asset = pick(assets);
  const template = OC.glbTemplates.get(asset.url);
  const root = template.scene.clone(true);
  const wrapper = new THREE.Group();
  wrapper.add(root);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = (targetHeight || asset.scale || 1) / Math.max(size.y, 0.001);
  root.scale.multiplyScalar(scale);
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  root.position.set(-(box2.min.x + box2.max.x) / 2, -box2.min.y, -(box2.min.z + box2.max.z) / 2);
  wrapper.userData.glbAssetUrl = asset.url;
  wrapper.userData.glbAssetLabel = asset.label;
  wrapper.userData.ocType = asset.type;
  wrapper.userData.baseScale = wrapper.scale.clone();
  return wrapper;
}

function registerGlbInstance(obj, assetType, x, z) {
  obj.userData.basePosition = obj.position.clone();
  obj.userData.baseScale = obj.scale.clone();
  obj.userData.ocType = assetType || obj.userData.ocType || 'glb';
  OC.glbInstances.push(obj);
  OC.placed.push({ type: obj.userData.ocType, x, z, mesh: obj });
}

function buildTreeCorridor(parent) {
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  const step = Math.max(11, 22 / template.treeRate);
  for (let d = 26; d < OC.courseLength + 250; d += step) {
    [-1, 1].forEach((side) => {
      for (let row = 0; row < 5; row += 1) {
        if (Math.random() > 0.78 && row > 1) continue;
        const offset = (OC.pathVisualWidth * 0.5) + OC.sceneryDistance + row * rand(2.6, 4.8) + rand(0.2, 1.6);
        addTreeAt(parent, d + rand(-6, 9), side, offset, rand(6.5, 15));
      }
    });
  }
}

function addTreeAt(parent, distance, side, offset, height) {
  const tree = createGlbModel('tree', height);
  if (!tree) return;
  const x = pathCenterAt(distance) + side * offset;
  tree.position.set(x, GROUND_Y, -distance);
  tree.rotation.y = rand(0, Math.PI * 2);
  parent.add(tree);
  registerGlbInstance(tree, 'tree', x, -distance);
}

function scatterForestFloorDetail(parent) {
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  for (let d = 18; d < OC.courseLength + 260; d += rand(10, 18) / template.rockRate) {
    [-1, 1].forEach((side) => addSceneryRock(parent, pathCenterAt(d) + side * rand(OC.pathVisualWidth * 0.5 + 0.8, OC.pathVisualWidth * 0.5 + OC.sceneryDistance + 5), d + rand(-4, 4)));
  }
}

function addSceneryRock(parent, x, distance) {
  const rock = createGlbModel('rock', rand(0.7, 1.6)) || new THREE.Mesh(new THREE.DodecahedronGeometry(rand(0.35, 0.9), 0), new THREE.MeshStandardMaterial({ color: 0x6d665a, roughness: 1 }));
  rock.position.set(x, GROUND_Y + 0.15, -distance);
  rock.rotation.y = rand(0, Math.PI * 2);
  parent.add(rock);
  registerGlbInstance(rock, 'rock', x, -distance);
}

function scatterPathEdgeDetails(parent) {
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  for (let d = 22; d < OC.courseLength + 230; d += rand(8, 14) / template.detailRate) {
    [-1, 1].forEach((side) => {
      if (Math.random() > 0.68) return;
      const detail = createGlbModel('detail', rand(0.9, 2.2));
      if (!detail) return;
      const x = pathCenterAt(d) + side * rand(OC.pathVisualWidth * 0.38, OC.pathVisualWidth * 0.54);
      detail.position.set(x, GROUND_Y + 0.02, -d);
      detail.rotation.y = rand(0, Math.PI * 2);
      parent.add(detail);
      registerGlbInstance(detail, 'detail', x, -d);
    });
  }
}

function addObstacles(count) {
  const parent = OC.layers.get('obstacles')?.group || OC.world;
  for (let i = 0; i < count; i += 1) {
    const distance = 85 + Math.random() * Math.max(80, OC.courseLength - 170);
    const x = visibleCollectiblePathX(distance) + rand(-1.2, 1.2);
    const obj = createGlbModel('rock', rand(1.4, 2.8)) || new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x55423d, roughness: 1 }));
    obj.position.set(x, GROUND_Y + 0.3, -distance);
    obj.rotation.y = rand(0, Math.PI * 2);
    obj.userData.kind = 'obstacle';
    obj.userData.radius = 1.25;
    parent.add(obj);
    OC.objects.push(obj);
    registerGlbInstance(obj, 'obstacle', x, -distance);
  }
}

function addCollectibles(count) {
  const parent = OC.layers.get('collectibles')?.group || OC.world;
  const total = Math.max(3, Math.round(count * 0.7));
  for (let i = 0; i < total; i += 1) {
    const distance = 65 + Math.random() * Math.max(80, OC.courseLength - 120);
    const x = visibleCollectiblePathX(distance);
    const obj = createGlbModel('collectible', Math.random() < 0.55 ? rand(1.3, 1.8) : rand(0.9, 1.35)) || new THREE.Mesh(new THREE.OctahedronGeometry(0.46, 0), new THREE.MeshBasicMaterial({ color: 0xeec45a, transparent: true, opacity: 0.95 }));
    obj.position.set(x, GROUND_Y + rand(0.22, 0.62), -distance);
    obj.rotation.y = rand(0, Math.PI * 2);
    obj.userData.kind = 'collectible';
    obj.userData.collected = false;
    obj.userData.radius = 1.15;
    obj.userData.value = GLB_ASSETS.find((asset) => asset.url === obj.userData.glbAssetUrl)?.value || 1;
    obj.userData.visiblePathOnly = true;
    parent.add(obj);
    OC.objects.push(obj);
    registerGlbInstance(obj, 'collectible', x, -distance);
  }
}

function glbConfigFor(url) {
  return url ? glbControl(url) : null;
}

function applyAllGlbAssetControls() {
  OC.glbInstances.forEach((obj) => {
    const cfg = glbConfigFor(obj.userData.glbAssetUrl);
    if (!cfg) return;
    const basePos = obj.userData.basePosition || obj.position;
    const baseScale = obj.userData.baseScale || obj.scale;
    obj.position.set(basePos.x + (cfg.x || 0), basePos.y + (cfg.y || 0), basePos.z + (cfg.z || 0));
    obj.scale.copy(baseScale).multiplyScalar(cfg.scale || 1);
    obj.traverse((node) => {
      node.renderOrder = cfg.order || 0;
      if (!node.material) return;
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((mat) => applyVisualToMaterial(mat, cfg));
    });
  });
  refreshGlbSelectionBoxes();
  drawFrame();
  drawOverview();
}

function clearSelectionBoxes() {
  OC.selectionBoxes.forEach((box) => {
    box.parent?.remove(box);
    box.dispose?.();
  });
  OC.selectionBoxes = [];
}

function refreshGlbSelectionBoxes() {
  clearSelectionBoxes();
  if (OC.selectedLayerId !== 'glbAsset' || !OC.selectedGlbAssetUrl || !OC.scene) return;
  OC.glbInstances.filter((obj) => obj.userData.glbAssetUrl === OC.selectedGlbAssetUrl).forEach((obj) => {
    const helper = new THREE.BoxHelper(obj, 0xeec45a);
    helper.renderOrder = 999;
    OC.scene.add(helper);
    OC.selectionBoxes.push(helper);
  });
}

function startRun() {
  if (!OC.requiredReady) {
    setResult('Cannot start: required obstacle-course assets are missing.', 'failure');
    return;
  }
  OC.active = true;
  OC.running = true;
  OC.paused = false;
  OC.complete = false;
  OC.startAssistTime = 1.2;
  ensureAudioReady();
  playRandomHorseVoice(true);
  updateStats();
}

function pauseRun() {
  OC.running = !OC.running;
  OC.paused = !OC.running;
  if (!OC.running) stopMotionLoops();
  updateStats();
}

function resetRun(silent = false) {
  OC.running = false;
  OC.paused = false;
  OC.complete = false;
  OC.currentSpeed = 0;
  OC.targetSpeed = 0;
  OC.distance = 0;
  OC.score = 0;
  OC.hits = 0;
  OC.jumps = 0;
  OC.collected = 0;
  OC.offPathTime = 0;
  OC.player.x = 0;
  OC.player.y = 0;
  OC.player.vy = 0;
  OC.player.grounded = true;
  OC.objects.forEach((obj) => {
    if (obj.userData.kind === 'collectible') {
      obj.visible = true;
      obj.userData.collected = false;
    }
  });
  stopMotionLoops();
  if (!silent) setResult('Run reset.', 'success');
  updateStats();
  drawFrame();
  drawOverview();
}

function handleKeyDown(event) {
  const key = normalizeKey(event);
  if (!key) return;
  OC.keys.add(key);
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Control'].includes(event.key)) event.preventDefault();
  if (key === 'jump') OC.player.jumpingHeld = true;
}

function handleKeyUp(event) {
  const key = normalizeKey(event);
  if (!key) return;
  OC.keys.delete(key);
  if (key === 'jump') OC.player.jumpingHeld = false;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Control'].includes(event.key)) event.preventDefault();
}

function normalizeKey(event) {
  const key = event.key.toLowerCase();
  if (key === 'w' || key === 'arrowup') return 'forward';
  if (key === 's' || key === 'arrowdown') return 'back';
  if (key === 'a' || key === 'arrowleft') return 'left';
  if (key === 'd' || key === 'arrowright') return 'right';
  if (key === ' ' || key === 'spacebar') return 'jump';
  if (key === 'control' || key === 'ctrl') return 'duck';
  return null;
}

function updateRun(dt) {
  if (!OC.active) return;
  const steer = (OC.keys.has('right') ? 1 : 0) - (OC.keys.has('left') ? 1 : 0);
  if (steer) OC.player.x += steer * OC.steerSpeed * dt;
  OC.player.x = clamp(OC.player.x, -OC.pathVisualWidth * 0.55, OC.pathVisualWidth * 0.55);

  if (OC.player.grounded && OC.keys.has('jump')) {
    OC.player.grounded = false;
    OC.player.vy = 8.5;
    OC.player.jumpHoldTime = 0;
    OC.jumps += 1;
    playClip('land', { volume: 0.2 });
  }
  if (!OC.player.grounded) {
    const holdBoost = OC.keys.has('jump') && OC.player.jumpHoldTime < OC.player.maxJumpHoldTime ? 3.3 : 0;
    OC.player.jumpHoldTime += dt;
    OC.player.vy += (-18 + holdBoost) * dt;
    OC.player.y += OC.player.vy * dt;
    if (OC.player.y <= 0) {
      OC.player.y = 0;
      OC.player.vy = 0;
      OC.player.grounded = true;
      playClip('land', { volume: 0.5 });
    }
  }

  const status = pathStatus();
  if (status === 'off') OC.offPathTime += dt;
  else OC.offPathTime = 0;

  let desired = 0;
  if (OC.keys.has('forward')) desired = OC.speed;
  if (OC.keys.has('back')) desired = BACK_SPEED;
  if (OC.startAssistTime > 0) {
    desired = Math.max(desired, OC.speed * 0.72);
    OC.startAssistTime -= dt;
  }
  if (status === 'off' && desired > SLOW_TROT_SPEED) desired = SLOW_TROT_SPEED;
  if (status === 'edge' && desired > OC.speed * 0.65) desired = OC.speed * 0.65;
  OC.targetSpeed = desired;
  const rate = Math.abs(OC.targetSpeed) > Math.abs(OC.currentSpeed) ? ACCEL : DECEL;
  const diff = OC.targetSpeed - OC.currentSpeed;
  OC.currentSpeed += clamp(diff, -rate * dt, rate * dt);
  if (Math.abs(OC.currentSpeed) < 0.05) OC.currentSpeed = 0;
  if (OC.running && !OC.paused) {
    OC.distance += OC.currentSpeed * dt;
  }
  if (OC.distance >= OC.courseLength) completeRun();

  checkInteractions();
  updateRideAudio();
  updateOffPathWarning(status);
  updateHorseFrame(steer);
  updateStats();
}

function checkInteractions() {
  const px = playerWorldX();
  const pz = -OC.distance;
  const py = OC.player.y;
  OC.objects.forEach((obj) => {
    if (!obj.visible) return;
    const dx = obj.position.x - px;
    const dz = obj.position.z - pz;
    const dy = obj.position.y - (GROUND_Y + py);
    const radius = obj.userData.radius || 1;
    const dist = Math.sqrt(dx * dx + dz * dz + dy * dy);
    if (obj.userData.kind === 'collectible' && !obj.userData.collected && dist < radius + 0.9) {
      obj.userData.collected = true;
      obj.visible = false;
      OC.collected += 1;
      OC.score += obj.userData.value || 1;
      playClip('snort', { volume: 0.38 });
    } else if (obj.userData.kind === 'obstacle' && dist < radius + 0.7 && !obj.userData.hit) {
      obj.userData.hit = true;
      OC.hits += 1;
      OC.score = Math.max(0, OC.score - 1);
      playBushRustle();
    }
  });
}

function completeRun() {
  OC.complete = true;
  OC.running = false;
  OC.currentSpeed = 0;
  OC.targetSpeed = 0;
  stopMotionLoops();
  setResult(`Complete. Score ${OC.score}, collectibles ${OC.collected}, hits ${OC.hits}.`, 'success');
}

function updateOffPathWarning(status) {
  const arrow = $('oc-offpath-arrow');
  const label = $('oc-offpath-label');
  const show = status === 'off' && OC.offPathTime >= 2;
  if (arrow) {
    arrow.classList.toggle('is-visible', show);
    arrow.classList.toggle('dir-left', OC.pathHintDirection === 'left');
    arrow.classList.toggle('dir-right', OC.pathHintDirection !== 'left');
  }
  if (label) {
    label.textContent = show ? (OC.pathHintDirection === 'left' ? '← Off Path' : 'Off Path →') : '';
  }
}

function updateHorseFrame(steer) {
  const horse = $('obstacle-horse');
  if (!horse) return;
  let frame = 3;
  if (steer < 0) frame = OC.currentSpeed > 8 ? 1 : 2;
  if (steer > 0) frame = OC.currentSpeed > 8 ? 5 : 4;
  horse.style.backgroundPosition = `${(frame / 6) * 100}% 100%`;
}

function updateStats() {
  const speed = Math.max(0, Math.round(OC.currentSpeed));
  const max = Math.max(1, Math.round(OC.speed));
  const status = pathStatus();
  const gait = status === 'off' ? 'Off Path' : speed < 3 ? 'Stopped' : speed < max * 0.45 ? 'Trot' : speed < max * 0.75 ? 'Canter' : 'Gallop';
  const clip = document.querySelector('.oc-powerbar-full-clip');
  if (clip) clip.style.width = `${clamp(speed / max, 0, 1) * 100}%`;
  const state = $('oc-speed-state');
  const value = $('oc-speed-value');
  if (!state || !value) {
    const badge = $('obstacle-speed-badge');
    if (badge) {
      badge.innerHTML = `<div class="oc-powerbar-wrap"><div class="oc-powerbar-emoji">🐴</div><div class="oc-powerbar-empty"></div><div class="oc-powerbar-full-clip"><div class="oc-powerbar-full"></div></div></div><div class="oc-speed-label"><span id="oc-speed-state"></span><b id="oc-speed-value"></b></div><div id="oc-offpath-label" class="oc-offpath-label"></div>`;
      const newClip = document.querySelector('.oc-powerbar-full-clip');
      if (newClip) newClip.style.width = `${clamp(speed / max, 0, 1) * 100}%`;
    }
  }
  if ($('oc-speed-state')) $('oc-speed-state').textContent = gait;
  if ($('oc-speed-value')) $('oc-speed-value').textContent = `${speed}/${max}`;
  if ($('obstacle-distance-readout')) $('obstacle-distance-readout').textContent = `Distance ${Math.max(0, Math.round(OC.distance))} / ${Math.round(OC.courseLength)}`;
  if ($('obstacle-score-readout')) $('obstacle-score-readout').textContent = `Score ${OC.score} · Collected ${OC.collected} · Hits ${OC.hits}`;
  const statusNode = $('obstacle-status');
  if (statusNode) statusNode.textContent = OC.complete ? 'Complete' : OC.running ? 'Running' : OC.paused ? 'Paused' : OC.requiredReady ? 'Ready' : 'Loading';
  $('obstacle-start')?.classList.toggle('is-running', OC.running);
  $('obstacle-pause')?.classList.toggle('is-paused', OC.paused);
}

function updateTemplateText() {
  const title = $('obstacle-title');
  const objective = $('obstacle-objective');
  if (title) title.textContent = TEMPLATES[OC.templateId]?.label || 'Obstacle Course';
  if (objective) objective.textContent = 'Horse forest obstacle course using visible path alpha, GLB scenery, and collectible scoring.';
}

function setResult(message, type = '') {
  const node = $('obstacle-result');
  if (!node) return;
  node.textContent = message;
  node.className = `oc-result ${type || ''}`;
}

function ensureAudioReady() {
  if (OC.audioReady || typeof Audio === 'undefined') return;
  OC.audioReady = true;
  Object.entries(ASSETS.audio).forEach(([key, src]) => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.loop = ['forest', 'gallopSlow', 'gallopFull'].includes(key);
    audio.volume = key === 'forest' ? 0.16 : 0.45;
    OC.audioClips.set(key, audio);
  });
}

function playClip(id, options = {}) {
  ensureAudioReady();
  const clip = OC.audioClips.get(id);
  if (!clip) return;
  try {
    if (!options.allowOverlap) clip.currentTime = 0;
    if (options.volume !== undefined) clip.volume = options.volume;
    const play = clip.play();
    if (play?.catch) play.catch(() => {});
  } catch (_) {}
}

function setLoop(id, active, volume) {
  ensureAudioReady();
  const clip = OC.audioClips.get(id);
  if (!clip) return;
  if (volume !== undefined) clip.volume = volume;
  if (active) {
    const play = clip.play();
    if (play?.catch) play.catch(() => {});
  } else clip.pause();
}

function stopMotionLoops() {
  setLoop('gallopSlow', false);
  setLoop('gallopFull', false);
}

function playRandomHorseVoice(force = false) {
  const now = performance.now();
  if (!force && now - OC.lastVoiceAt < 6500) return;
  OC.lastVoiceAt = now;
  playClip(Math.random() < 0.58 ? 'neigh' : 'snort');
}

function playBushRustle() {
  const now = performance.now();
  if (now - OC.lastBushAt < 900) return;
  OC.lastBushAt = now;
  playClip('bush');
}

function updateRideAudio() {
  const forward = OC.running && !OC.complete && OC.currentSpeed > 1.2;
  const fast = forward && OC.currentSpeed > OC.speed * 0.62;
  if (forward && !OC.wasForwardMoving) playRandomHorseVoice();
  OC.wasForwardMoving = forward;
  setLoop('forest', OC.active, 0.16);
  setLoop('gallopSlow', forward && !fast, 0.34);
  setLoop('gallopFull', fast, 0.44);
}

function renderOnce() {
  if (!OC.renderer || !OC.scene || !OC.camera) return;
  OC.selectionBoxes.forEach((box) => box.update());
  OC.renderer.render(OC.scene, OC.camera);
}

function drawFrame() {
  if (!OC.renderer || !OC.scene || !OC.camera) return;
  if (OC.renderLoopRunning && !OC.renderLoopTick) {
    renderOnce();
    return;
  }
  OC.renderLoopRunning = true;
  OC.renderLoopTick = true;
  const dt = Math.min(0.033, OC.clock?.getDelta?.() || 0.016);
  if (OC.active) updateRun(dt);
  renderOnce();
  OC.renderLoopTick = false;
  OC.frame = requestAnimationFrame(drawFrame);
}

function worldToOverview(x, z) {
  const c = $('hf-overview');
  const width = c?.width || 280;
  const height = c?.height || 500;
  const ox = width / 2 + x * 5.1;
  const oy = height - 28 + z * 0.17;
  return { x: ox, y: oy };
}

function drawOverview() {
  const c = $('hf-overview');
  if (!c) return;
  const height = Math.max(340, Math.min(2400, Math.round((OC.courseLength + 300) / 3.0)));
  if (c.height !== height) c.height = height;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#101914';
  ctx.fillRect(0, 0, c.width, c.height);

  if (OC.overviewPathOverlay) {
    ctx.fillStyle = 'rgba(238,196,90,.26)';
    for (let d = 0; d < OC.courseLength; d += 9) {
      const seg = alphaSegmentAt(d);
      if (!seg) continue;
      const meshCenterX = (seg.startX + seg.endX) / 2;
      for (let x = meshCenterX - OC.pathVisualWidth * 0.50; x <= meshCenterX + OC.pathVisualWidth * 0.50; x += 1.1) {
        if ((pathAlphaAtWorld(x, d) || 0) >= OC.pathAlphaThreshold) {
          const p = worldToOverview(x, -d);
          ctx.fillRect(p.x - 1.2, p.y - 1.2, 2.4, 2.4);
        }
      }
    }
  }

  ctx.strokeStyle = '#d09a55';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let d = 0; d < OC.courseLength; d += 18) {
    const p = worldToOverview(pathCenterAt(d), -d);
    if (d === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  const seen = new Set();
  const markers = [];
  [...OC.placed, ...OC.objects.map((obj) => ({ type: obj.userData.kind || obj.userData.ocType, x: obj.position.x, z: obj.position.z, mesh: obj }))].forEach((item) => {
    const key = item.mesh?.uuid || `${item.type}:${item.x}:${item.z}`;
    if (seen.has(key)) return;
    seen.add(key);
    markers.push(item);
  });

  markers.forEach((item) => {
    const p = worldToOverview(item.x, item.z);
    const type = item.type;
    ctx.fillStyle = type === 'tree' ? '#48a24a' : type === 'rock' ? '#aaa' : type === 'detail' ? '#73c470' : type === 'collectible' ? '#5be5ff' : '#b04b35';
    ctx.beginPath();
    ctx.arc(p.x, p.y, type === 'tree' ? 4 : 3.3, 0, Math.PI * 2);
    ctx.fill();
  });

  const player = worldToOverview(playerWorldX(), -OC.distance);
  ctx.fillStyle = '#f4ead4';
  ctx.beginPath();
  ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#eec45a';
  ctx.strokeRect(1, 1, c.width - 2, c.height - 2);
}

function exportJsonSettings() {
  const config = {
    engine: 'obstacle-course',
    version: VERSION,
    templateId: OC.templateId,
    difficulty: OC.difficulty,
    courseLength: OC.courseLength,
    speed: OC.speed,
    sceneryDistance: OC.sceneryDistance,
    pathVisualWidth: OC.pathVisualWidth,
    vanishX: OC.vanishX,
    vanishY: OC.vanishY,
    visual: {
      brightness: OC.screenBrightness,
      contrast: OC.screenContrast,
      saturation: OC.screenSaturation,
      tint: OC.screenTint,
      tintStrength: OC.screenTintStrength,
    },
    pathSegments: OC.pathSequence.map((seg) => ({ id: seg.key || seg.id, start: seg.start, end: seg.end, distance: seg.distance })),
    layers: Object.fromEntries(Array.from(OC.layers).map(([id, layer]) => [id, { visible: layer.visible, opacity: layer.opacity, x: layer.x, y: layer.y, z: layer.z, scale: layer.scale, order: layer.order, brightness: layer.brightness, contrast: layer.contrast, saturation: layer.saturation, tint: layer.tint, tintStrength: layer.tintStrength }])),
    glbControls: Object.fromEntries(OC.glbControls),
  };
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `obstacle-course-settings-${VERSION.toLowerCase().replace(/\./g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importJsonSettings(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.templateId) OC.templateId = data.templateId;
    if (data.difficulty) OC.difficulty = Number(data.difficulty);
    if (data.courseLength) OC.courseLength = Number(data.courseLength);
    if (data.sceneryDistance !== undefined) OC.sceneryDistance = Number(data.sceneryDistance);
    if (data.pathVisualWidth) OC.pathVisualWidth = Number(data.pathVisualWidth);
    if (data.vanishX !== undefined) OC.vanishX = Number(data.vanishX);
    if (data.vanishY !== undefined) OC.vanishY = Number(data.vanishY);
    if (data.visual) {
      OC.screenBrightness = data.visual.brightness ?? OC.screenBrightness;
      OC.screenContrast = data.visual.contrast ?? OC.screenContrast;
      OC.screenSaturation = data.visual.saturation ?? OC.screenSaturation;
      OC.screenTint = data.visual.tint ?? OC.screenTint;
      OC.screenTintStrength = data.visual.tintStrength ?? OC.screenTintStrength;
    }
    if (data.glbControls) {
      OC.glbControls = new Map(Object.entries(data.glbControls));
    }
    regenerateCourse();
    updateScreenFilters();
    setResult('Imported obstacle course JSON settings.', 'success');
  } catch (error) {
    setResult(`JSON import failed: ${error.message}`, 'failure');
  } finally {
    event.target.value = '';
  }
}
