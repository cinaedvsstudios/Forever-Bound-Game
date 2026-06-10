// Obstacle Course / Horse Forest Runner V27
// Adds background layer toggle/solo, scrollable overview with key, and 5-minute maximum course length.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

const ASSET_BASE = './assets/obstacle-course/horse-forest/';
const GROUND_Y = -1.62;
const SEGMENT = 8;

const ASSETS = {
  horse: `${ASSET_BASE}foreground/horse.png`,
  background: `${ASSET_BASE}backgrounds/horseridebg.jpg`,
  path: `${ASSET_BASE}ground/forest_floor_roots_tile_placeholder_1254.png`,
  grassA: `${ASSET_BASE}ground/forest_floor_grass.png`,
  grassB: `${ASSET_BASE}ground/forest_floor_grass2.png`,
  trees: [
    `${ASSET_BASE}3d/tree.glb`,
    `${ASSET_BASE}3d/tree_low-poly.glb`,
    `${ASSET_BASE}3d/hill_top_tree.glb`,
    `${ASSET_BASE}3d/small_pine.glb`,
    `${ASSET_BASE}3d/pine_with_awkward_teenage_face.glb`,
  ],
};

const TEMPLATES = {
  horse_forest_easy: { label: 'Horse Forest Ride', fog: 0x102018, clear: 0x7fa7b8, obstacleRate: 1 },
  horse_forest_dense: { label: 'Dense Forest Ride', fog: 0x07130d, clear: 0x6d93a7, obstacleRate: 1.35 },
  horse_forest_night: { label: 'Moonlit Forest Ride', fog: 0x060914, clear: 0x101832, obstacleRate: 1.15 },
};

const OC = {
  mounted: false,
  active: false,
  running: false,
  complete: false,
  viewMode: 'ride',
  templateId: 'horse_forest_easy',
  difficulty: 2,
  duration: 45,
  maxDuration: 300,
  speed: 34,
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
  player: { x: 0, y: 0, vy: 0, grounded: true },
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
  overviewCamera: null,
  renderer: null,
  world: null,
  clock: null,
  frame: null,
  textureLoader: null,
  textureCache: new Map(),
  gltfLoaderPromise: null,
  groundMaterial: null,
  pathMaterial: null,
  featherInnerMaterial: null,
  featherOuterMaterial: null,
  groundEdgeMaterial: null,
  layers: new Map(),
};

const oc$ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function pathCenterAt(distance) {
  return Math.sin(distance * 0.0048) * 2.1 + Math.sin(distance * 0.0125) * 0.85 + Math.sin(distance * 0.021) * 0.35;
}

function playerWorldX() {
  return pathCenterAt(OC.distance) + OC.player.x;
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
  if (!layer) return;
  if (layer.id === 'background') {
    if (!OC.scene) return;
    OC.scene.background = isLayerDisplayed(layer) ? loadTexture(ASSETS.background) : new THREE.Color(0xffffff);
    if (OC.renderer) OC.renderer.setClearColor(isLayerDisplayed(layer) ? 0x7fa7b8 : 0xffffff, 1);
    return;
  }
  if (!layer.group) return;
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
    .obstacle-course-stage{height:100%;overflow:auto;padding:18px 20px 22px;background:#05080d;color:var(--cream,#f4ead4)}
    .obstacle-workspace{display:grid;grid-template-columns:minmax(620px,1fr) 348px;gap:14px;align-items:start}
    .obstacle-view-card,.obstacle-side-card{border:1px solid rgba(124,202,210,.24);border-radius:16px;background:rgba(7,14,22,.84);box-shadow:0 12px 34px rgba(0,0,0,.28)}
    .obstacle-view-card{padding:16px;display:flex;flex-direction:column;gap:12px}.obstacle-header-line{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(124,202,210,.18);padding-bottom:12px}.obstacle-header-line h2{font-family:'Cinzel',serif;margin:3px 0 0;font-size:1.38rem}.obstacle-header-line p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}.obstacle-status-pill{border:1px solid rgba(238,196,90,.34);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .obstacle-three-wrap{position:relative;aspect-ratio:16/9;border:1px solid rgba(124,202,210,.18);border-radius:18px;overflow:hidden;background:#07101c}.obstacle-three-wrap canvas{display:block;width:100%!important;height:100%!important;cursor:crosshair}.obstacle-three-wrap:after{content:'';position:absolute;left:0;right:0;bottom:0;height:72px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(10,8,5,.34));pointer-events:none;z-index:2}
    .obstacle-horse-overlay{position:absolute;left:50%;bottom:-26px;z-index:5;width:330px;height:190px;margin-left:-165px;pointer-events:none;filter:drop-shadow(0 7px 9px rgba(0,0,0,.72));opacity:.98;background:url('${ASSETS.horse}') center bottom / contain no-repeat}.obstacle-hud{position:absolute;left:14px;right:14px;bottom:12px;z-index:6;display:flex;justify-content:space-between;gap:12px;pointer-events:none;color:var(--cream,#f4ead4);font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.8)}.obstacle-reticle{position:absolute;left:50%;top:50%;z-index:4;width:34px;height:34px;margin:-17px 0 0 -17px;border:1px solid rgba(238,196,90,.35);border-radius:50%;box-shadow:0 0 16px rgba(238,196,90,.16);pointer-events:none}.obstacle-reticle:before,.obstacle-reticle:after{content:'';position:absolute;background:rgba(238,196,90,.45)}.obstacle-reticle:before{left:50%;top:-8px;width:1px;height:50px}.obstacle-reticle:after{top:50%;left:-8px;width:50px;height:1px}
    .obstacle-control-row,.hf-button-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.obstacle-control-row button,.hf-button-row button,.hf-layer-panel button{min-height:34px;border:1px solid rgba(124,202,125,.28);border-radius:9px;background:rgba(20,72,37,.58);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.obstacle-help-strip{display:flex;justify-content:space-between;gap:10px;color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.35}.obstacle-side-card{padding:14px;display:flex;flex-direction:column;gap:10px}.obstacle-side-card h3{font-family:'Cinzel',serif;margin:0;font-size:1rem}.obstacle-metric{display:flex;justify-content:space-between;border:1px solid rgba(124,202,210,.2);border-radius:11px;padding:8px;color:var(--muted,#c9bfae);font-size:.73rem}.obstacle-metric strong{color:var(--cream,#f4ead4)}.obstacle-result{min-height:46px;border:1px solid rgba(124,202,210,.22);border-radius:11px;padding:9px;color:var(--muted,#c9bfae);font-size:.74rem;line-height:1.35}.obstacle-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.obstacle-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}.obstacle-result[data-state='warn']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}
    .hf-overview-row{display:grid;grid-template-columns:78px 1fr;gap:8px;align-items:start}.hf-key{border:1px solid rgba(238,196,90,.35);border-radius:10px;padding:7px;background:rgba(0,0,0,.24);font-size:.61rem;color:var(--muted,#c9bfae);line-height:1.35}.hf-key b{display:block;color:#eec45a;margin-bottom:4px}.hf-key span{display:flex;align-items:center;gap:4px;margin:3px 0}.hf-dot{width:9px;height:9px;border-radius:50%;display:inline-block;flex:0 0 auto}.hf-dot.path{background:#d09a55}.hf-dot.tree{background:#48a24a}.hf-dot.rock{background:#aaa}.hf-dot.fern{background:#64c04d}.hf-dot.collectible{background:#eec45a}.hf-dot.obstacle{background:#b04b35}.hf-overview-scroll{width:100%;height:280px;overflow-y:auto;overflow-x:hidden;border:1px solid rgba(238,196,90,.55);border-radius:12px;background:#111914}.hf-overview{display:block;width:100%;min-height:280px;background:#111914;touch-action:none;cursor:crosshair}.hf-layer-panel{border:1px solid rgba(124,202,210,.2);border-radius:12px;padding:10px;background:rgba(0,0,0,.20)}.hf-layer-panel label{display:block;color:var(--muted,#c9bfae);font-size:.68rem;margin:6px 0 3px}.hf-layer-panel select,.hf-layer-panel input{width:100%;box-sizing:border-box;background:#0b1219;color:var(--cream,#f4ead4);border:1px solid rgba(124,202,210,.25);border-radius:8px;padding:6px}.hf-slider-row{display:grid;grid-template-columns:58px 1fr 48px;align-items:center;gap:6px;font-size:.66rem;color:var(--muted,#c9bfae)}.hf-slider-row output{text-align:right;color:#eec45a}.hf-small-note{font-size:.66rem;line-height:1.35;color:var(--muted,#c9bfae);margin:0}.asset-list-code{font-size:.62rem;line-height:1.45;white-space:pre-wrap;word-break:break-word;color:#c8e6ca;background:rgba(0,0,0,.28);border:1px solid rgba(124,202,125,.18);border-radius:10px;padding:9px}
    @media(max-width:1120px){.obstacle-workspace{grid-template-columns:1fr}.obstacle-side-card{min-height:220px}}
  `;
  document.head.appendChild(style);
}

export function openObstacleCourseWorkflow() {
  ensureMounted();
  OC.active = true;
  document.body.classList.add('is-obstacle-course');
  document.body.classList.remove('is-puzzle-brief', 'is-puzzle-chooser');
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
        <div class="obstacle-header-line"><div><p class="eyebrow">Obstacle Course · Horse Forest Runner V27</p><h2 id="obstacle-title">Horse Forest Ride</h2><p id="obstacle-objective">Layer editor + overview/paint controls are active.</p></div><span id="obstacle-status" class="obstacle-status-pill">Ready</span></div>
        <div id="obstacle-three-host" class="obstacle-three-wrap"><div class="obstacle-reticle"></div><div class="obstacle-horse-overlay"></div><div class="obstacle-hud"><span>A/D or arrows steer · Space/W/Up jumps · S/Down ducks</span><span id="obstacle-course-summary">0m / 0m</span></div></div>
        <div class="obstacle-help-strip"><span>Use overview to place/paint. Background can be hidden or soloed like any other layer.</span><span id="hf-tree-status">GLB trees: loading…</span></div>
        <div class="obstacle-control-row"><button id="obstacle-start" type="button">Start Test</button><button id="obstacle-pause" type="button">Pause</button><button id="obstacle-reset-run" type="button">Reset Run</button></div>
      </section>
      <aside class="obstacle-side-card">
        <div class="hf-button-row"><button id="hf-view-ride">Ride View</button><button id="hf-view-overview">Overview</button><button id="hf-redraw">Redraw</button></div>
        <div class="hf-overview-row"><div class="hf-key"><b>Key</b><span><i class="hf-dot path"></i>Path</span><span><i class="hf-dot tree"></i>Tree</span><span><i class="hf-dot rock"></i>Rock</span><span><i class="hf-dot fern"></i>Fern</span><span><i class="hf-dot collectible"></i>Collect</span><span><i class="hf-dot obstacle"></i>Obstacle</span></div><div id="hf-overview-scroll" class="hf-overview-scroll"><canvas id="hf-overview" class="hf-overview" width="360" height="300"></canvas></div></div>
        <section class="hf-layer-panel"><h3>Layer Controls</h3><label>Selected layer</label><select id="hf-layer-select"></select><div class="hf-button-row"><button id="hf-layer-visible">Hide/Show</button><button id="hf-layer-solo">Solo</button><button id="hf-layer-clear-solo">All</button></div><div class="hf-button-row"><button id="hf-layer-up">Above</button><button id="hf-layer-down">Below</button><button id="hf-bg-white">BG White</button></div><div id="hf-layer-sliders"></div></section>
        <section class="hf-layer-panel"><h3>Paint / Place</h3><label>Tool</label><select id="hf-paint-mode"><option value="path-alpha">Alpha paint: path edge</option><option value="ground-alpha">Alpha paint: ground edge</option><option value="path">Paint path texture</option><option value="grass-a">Paint grass A</option><option value="grass-b">Paint grass B</option><option value="tree">Place GLB tree</option><option value="rock">Place rock</option><option value="fern">Place fern</option><option value="collectible">Place collectible</option><option value="obstacle">Place obstacle</option><option value="erase">Erase nearby item</option></select><div class="hf-slider-row"><span>Size</span><input id="hf-brush-size" type="range" min="4" max="80" value="18"><output id="hf-brush-size-out">18</output></div><div class="hf-slider-row"><span>Alpha</span><input id="hf-brush-strength" type="range" min="0" max="1" step="0.05" value="0.5"><output id="hf-brush-strength-out">0.50</output></div><p class="hf-small-note">The overview scrolls vertically when the course is long. Course duration is capped at 5 minutes.</p></section>
        <div class="obstacle-metric"><span>Score</span><strong id="obstacle-score">0</strong></div><div class="obstacle-metric"><span>Collected</span><strong id="obstacle-collected">0</strong></div><div class="obstacle-metric"><span>Hits</span><strong id="obstacle-hits">0</strong></div><div class="obstacle-metric"><span>Target</span><strong id="obstacle-target-score">20</strong></div><div id="obstacle-result" class="obstacle-result">Ride waiting. Start the test when ready.</div>
      </aside>
    </div>`;
  rightPanel.prepend(OC.stage);

  OC.panels = document.createElement('div');
  OC.panels.id = 'obstacle-course-panels';
  OC.panels.hidden = true;
  OC.panels.innerHTML = `<section class="panel tool-panel obstacle-panel" data-obstacle-panel="build"><div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Horse Ride</h2></div><span class="status-pill is-waiting">V27</span></div><p class="obstacle-panel-copy">Course editor controls are in the right panel: layers, overview, paint, alpha paint, and placement.</p><label class="field-block"><span>Course Template</span><select id="obstacle-template"><option value="horse_forest_easy">Horse Forest Ride</option><option value="horse_forest_dense">Dense Forest Ride</option><option value="horse_forest_night">Moonlit Forest Ride</option></select></label><label class="range-row"><span>Difficulty <output id="obstacle-difficulty-out">2</output></span><input id="obstacle-difficulty" type="range" min="1" max="5" value="2" /></label><label class="range-row"><span>Course Duration <output id="obstacle-duration-out">45s</output></span><input id="obstacle-duration" type="range" min="20" max="300" step="5" value="45" /></label><button id="obstacle-regenerate" class="wide-button" type="button">Regenerate Horse Course</button></section><section class="panel tool-panel obstacle-panel" data-obstacle-panel="display" hidden><div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Ground Relief</h2></div></div><label class="range-row"><span>Bump Strength <output id="obstacle-bump-out">0.12</output></span><input id="obstacle-bump" type="range" min="0" max="0.45" step="0.01" value="0.12" /></label><label class="range-row"><span>Displacement Strength <output id="obstacle-displacement-out">0.035</output></span><input id="obstacle-displacement" type="range" min="0" max="0.18" step="0.005" value="0.035" /></label><label class="range-row"><span>Horse Speed <output id="obstacle-speed-out">34</output></span><input id="obstacle-speed" type="range" min="18" max="64" step="2" value="34" /></label><label class="range-row"><span>Lane Width <output id="obstacle-lane-width-out">2.7</output></span><input id="obstacle-lane-width" type="range" min="1.8" max="5" step="0.1" value="2.7" /></label></section><section class="panel tool-panel obstacle-panel" data-obstacle-panel="logic" hidden><div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Scoring</h2></div></div><label class="range-row"><span>Success Score <output id="obstacle-success-score-out">20</output></span><input id="obstacle-success-score" type="range" min="0" max="80" step="5" value="20" /></label></section>`;
  leftBody.appendChild(OC.panels);

  OC.host = oc$('obstacle-three-host');
  setupThreeScene();
  bindControls();
  OC.mounted = true;
}

function setupThreeScene() {
  OC.textureLoader = new THREE.TextureLoader();
  OC.scene = new THREE.Scene();
  OC.camera = new THREE.PerspectiveCamera(66, 16 / 9, 0.1, 1000);
  OC.overviewCamera = new THREE.OrthographicCamera(-28, 28, 80, -8, 0.1, 2200);
  OC.overviewCamera.position.set(0, 120, -OC.courseLength / 2);
  OC.overviewCamera.lookAt(0, GROUND_Y, -OC.courseLength / 2);
  OC.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  OC.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  OC.host.prepend(OC.renderer.domElement);
  OC.clock = new THREE.Clock();
  OC.scene.add(new THREE.AmbientLight(0xd8f0ff, 0.84));
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.0);
  sun.position.set(-8, 16, 12);
  OC.scene.add(sun);
  OC.world = new THREE.Group();
  OC.scene.add(OC.world);
  buildGroundMaterial();
  loadTreeModels();
  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();
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
  oc$('hf-view-ride').addEventListener('click', () => { OC.viewMode = 'ride'; drawFrame(); });
  oc$('hf-view-overview').addEventListener('click', () => { OC.viewMode = 'overview'; drawFrame(); drawOverview(); });
  oc$('hf-redraw').addEventListener('click', () => { drawOverview(); drawFrame(); });
  oc$('hf-layer-select').addEventListener('change', (e) => { OC.selectedLayerId = e.target.value; syncLayerControls(); });
  oc$('hf-layer-visible').addEventListener('click', () => { const l = OC.layers.get(OC.selectedLayerId); if (!l) return; l.visible = !l.visible; applyAllLayers(); });
  oc$('hf-layer-solo').addEventListener('click', () => { OC.soloLayerId = OC.selectedLayerId; applyAllLayers(); });
  oc$('hf-layer-clear-solo').addEventListener('click', () => { OC.soloLayerId = null; applyAllLayers(); });
  oc$('hf-bg-white').addEventListener('click', () => { const l = OC.layers.get('background'); if (!l) return; l.visible = false; OC.selectedLayerId = 'background'; OC.soloLayerId = null; applyAllLayers(); });
  oc$('hf-layer-up').addEventListener('click', () => { const l = OC.layers.get(OC.selectedLayerId); if (!l) return; l.order += 1; applyLayer(l); syncLayerControls(); drawFrame(); });
  oc$('hf-layer-down').addEventListener('click', () => { const l = OC.layers.get(OC.selectedLayerId); if (!l) return; l.order -= 1; applyLayer(l); syncLayerControls(); drawFrame(); });
  oc$('hf-paint-mode').addEventListener('change', (e) => { OC.paintMode = e.target.value; });
  oc$('hf-brush-size').addEventListener('input', (e) => { OC.brushSize = Number(e.target.value); oc$('hf-brush-size-out').textContent = String(OC.brushSize); });
  oc$('hf-brush-strength').addEventListener('input', (e) => { OC.brushStrength = Number(e.target.value); oc$('hf-brush-strength-out').textContent = OC.brushStrength.toFixed(2); });
  const overview = oc$('hf-overview');
  overview.addEventListener('pointerdown', (e) => { OC.isPainting = true; handleOverviewPaint(e); });
  overview.addEventListener('pointermove', (e) => { if (OC.isPainting) handleOverviewPaint(e); });
  window.addEventListener('pointerup', () => { OC.isPainting = false; });
  window.addEventListener('keydown', (event) => {
    if (!OC.active) return;
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) {
      event.preventDefault(); OC.keys.add(key); if (['arrowup', 'w', ' '].includes(key)) jumpHorse();
    }
  });
  window.addEventListener('keyup', (event) => OC.keys.delete(event.key.toLowerCase()));
  document.querySelector('.left-icon-bar')?.addEventListener('click', (event) => { if (!OC.active) return; const button = event.target.closest('.panel-nav-button'); if (!button) return; event.preventDefault(); event.stopImmediatePropagation(); showObstaclePanel(button.dataset.panel); }, true);
}

function createLayerSliders() {
  const host = oc$('hf-layer-sliders');
  if (!host) return;
  host.innerHTML = '';
  [['x', 'X', -30, 30, 0.1], ['z', 'Z', -80, 80, 0.5], ['y', 'Y', -10, 10, 0.1], ['scale', 'Scale', 0.1, 4, 0.05], ['opacity', 'Alpha', 0, 1, 0.05], ['order', 'Order', -20, 40, 1]].forEach(([prop, label, min, max, step]) => {
    const row = document.createElement('div'); row.className = 'hf-slider-row'; row.innerHTML = `<span>${label}</span><input id="hf-layer-${prop}" type="range" min="${min}" max="${max}" step="${step}"><output id="hf-layer-${prop}-out"></output>`; host.appendChild(row);
    row.querySelector('input').addEventListener('input', (e) => { const l = OC.layers.get(OC.selectedLayerId); if (!l) return; l[prop] = Number(e.target.value); applyLayer(l); syncLayerOutputs(); drawFrame(); drawOverview(); });
  });
}

function populateLayerSelect() {
  const select = oc$('hf-layer-select'); if (!select) return;
  const previous = select.value || OC.selectedLayerId;
  select.innerHTML = '';
  [...OC.layers.values()].sort((a, b) => a.order - b.order).forEach((l) => { const opt = document.createElement('option'); opt.value = l.id; opt.textContent = `${l.label}${OC.soloLayerId === l.id ? ' (solo)' : l.visible ? '' : ' (hidden)'}`; select.appendChild(opt); });
  if (OC.layers.has(previous)) OC.selectedLayerId = previous;
  select.value = OC.selectedLayerId;
  createLayerSliders();
  syncLayerControls();
}

function syncLayerOutputs() { const l = OC.layers.get(OC.selectedLayerId); if (!l) return; ['x', 'z', 'y', 'scale', 'opacity', 'order'].forEach((prop) => { const out = oc$(`hf-layer-${prop}-out`); if (out) out.textContent = prop === 'order' ? String(l[prop]) : Number(l[prop]).toFixed(2); }); }
function syncLayerControls() { const l = OC.layers.get(OC.selectedLayerId); if (!l) return; ['x', 'z', 'y', 'scale', 'opacity', 'order'].forEach((prop) => { const input = oc$(`hf-layer-${prop}`); if (input) input.value = l[prop]; }); syncLayerOutputs(); }

function loadTexture(url, options = {}) { const key = `${url}::${options.repeat ? options.repeat.join('x') : 'single'}`; if (OC.textureCache.has(key)) return OC.textureCache.get(key); const texture = OC.textureLoader.load(url, undefined, undefined, () => {}); if ('colorSpace' in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace; else texture.encoding = THREE.sRGBEncoding; texture.minFilter = THREE.LinearFilter; texture.magFilter = THREE.LinearFilter; if (options.repeat) { texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(options.repeat[0], options.repeat[1]); } OC.textureCache.set(key, texture); return texture; }
function resizeRenderer() { if (!OC.renderer || !OC.host || !OC.camera) return; const width = Math.max(1, OC.host.clientWidth), height = Math.max(300, Math.round(width * 9 / 16)); OC.camera.aspect = width / height; OC.camera.updateProjectionMatrix(); OC.renderer.setSize(width, height); }
function smoothstep(a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
function noise(x, y, seed = 0) { const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123; return n - Math.floor(n); }
function valueNoise(x, y, seed = 0) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = noise(xi, yi, seed), b = noise(xi + 1, yi, seed), c = noise(xi, yi + 1, seed), d = noise(xi + 1, yi + 1, seed); return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v; }
function fbm(x, y, seed = 0) { let value = 0, amp = 0.5, freq = 1; for (let i = 0; i < 5; i += 1) { value += valueNoise(x * freq, y * freq, seed + i * 13.1) * amp; freq *= 2; amp *= 0.5; } return clamp(value, 0, 1); }
function loadImage(url) { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = url; }); }
function getImageData(img, size) { const c = document.createElement('canvas'); c.width = size; c.height = size; const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, size, size); return ctx.getImageData(0, 0, size, size).data; }
function sample(data, size, x, y) { const px = ((Math.floor(y) % size + size) % size) * size + ((Math.floor(x) % size + size) % size); const i = px * 4; return [data[i], data[i + 1], data[i + 2]]; }
function makeAlphaTexture() { const size = 128, canvas = document.createElement('canvas'); canvas.width = canvas.height = size; const ctx = canvas.getContext('2d'); const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2); g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(.55, 'rgba(255,255,255,.26)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, size, size); const t = new THREE.CanvasTexture(canvas); t.needsUpdate = true; return t; }

async function buildGroundMaterial() {
  try {
    const size = 512;
    const [pathImg, grassAImg, grassBImg] = await Promise.all([loadImage(ASSETS.path), loadImage(ASSETS.grassA), loadImage(ASSETS.grassB)]);
    const pathData = getImageData(pathImg, size), grassAData = getImageData(grassAImg, size), grassBData = getImageData(grassBImg, size);
    const colorCanvas = document.createElement('canvas'), bumpCanvas = document.createElement('canvas'); colorCanvas.width = bumpCanvas.width = size; colorCanvas.height = bumpCanvas.height = size;
    const colorCtx = colorCanvas.getContext('2d'), bumpCtx = bumpCanvas.getContext('2d'); const colorImage = colorCtx.createImageData(size, size), bumpImage = bumpCtx.createImageData(size, size);
    for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) { const u = x / size, v = y / size; const n1 = fbm(u * 7, v * 7, 1), n2 = fbm(u * 18, v * 18, 5); const rootPatch = smoothstep(0.66, 0.94, fbm(u * 4.4 + 12, v * 4.4 - 3, 21)) * 0.22; const sideMix = smoothstep(0.18, 0.82, fbm(u * 5.5 + 31, v * 5.5 - 8, 9)); const sx = (u * size * 2.8 + n2 * 18) % size, sy = (v * size * 2.8 + n1 * 18) % size; const pathCol = sample(pathData, size, sx, sy), grassA = sample(grassAData, size, sx * 1.2, sy * 1.2), grassB = sample(grassBData, size, sx * 1.1 + 80, sy * 1.1 + 40); const sideCol = grassA.map((c, i) => c * (1 - sideMix) + grassB[i] * sideMix); const idx = (y * size + x) * 4; [0, 1, 2].forEach((i) => { colorImage.data[idx + i] = clamp(pathCol[i] * 0.92 * rootPatch + sideCol[i] * (0.84 + n1 * 0.18) * (1 - rootPatch), 0, 255); }); colorImage.data[idx + 3] = 255; const bump = clamp(70 + n1 * 115 + n2 * 70 + rootPatch * 24, 0, 255); bumpImage.data[idx] = bumpImage.data[idx + 1] = bumpImage.data[idx + 2] = bump; bumpImage.data[idx + 3] = 255; }
    colorCtx.putImageData(colorImage, 0, 0); bumpCtx.putImageData(bumpImage, 0, 0);
    const map = new THREE.CanvasTexture(colorCanvas), bumpMap = new THREE.CanvasTexture(bumpCanvas); [map, bumpMap].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; if ('colorSpace' in t && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; else t.encoding = THREE.sRGBEncoding; });
    const pathMap = loadTexture(ASSETS.path, { repeat: [1.15, 2.6] });
    OC.groundMaterial = new THREE.MeshStandardMaterial({ map, bumpMap, displacementMap: bumpMap, bumpScale: OC.bumpStrength, displacementScale: OC.displacementStrength, roughness: 0.98, metalness: 0 });
    OC.pathMaterial = new THREE.MeshStandardMaterial({ map: pathMap, roughness: 0.96, metalness: 0, color: 0xffffff });
    OC.featherInnerMaterial = new THREE.MeshStandardMaterial({ map: pathMap, roughness: 0.98, metalness: 0, transparent: true, opacity: 0.30, depthWrite: false, color: 0xffffff });
    OC.featherOuterMaterial = new THREE.MeshStandardMaterial({ map: pathMap, roughness: 1, metalness: 0, transparent: true, opacity: 0.14, depthWrite: false, color: 0xffffff });
    OC.groundEdgeMaterial = new THREE.MeshBasicMaterial({ color: 0x182011, transparent: true, opacity: 0.36, alphaMap: makeAlphaTexture(), depthWrite: false, side: THREE.DoubleSide });
    if (OC.active) regenerateCourse();
  } catch (error) { console.warn('[HorseForest] Ground texture generation failed.', error); }
}

function updateGroundRelief() { if (OC.groundMaterial) { OC.groundMaterial.bumpScale = OC.bumpStrength; OC.groundMaterial.displacementScale = OC.displacementStrength; OC.groundMaterial.needsUpdate = true; } drawFrame(); }

async function loadTreeModels() { if (OC.treeLoadStarted) return; OC.treeLoadStarted = true; try { if (!OC.gltfLoaderPromise) OC.gltfLoaderPromise = import('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js'); const { GLTFLoader } = await OC.gltfLoaderPromise; const loader = new GLTFLoader(); ASSETS.trees.forEach((url) => loader.load(`${url}?v=27`, (gltf) => { if (!gltf.scene) return; gltf.scene.traverse((n) => { if (n.isMesh) n.receiveShadow = true; }); OC.treeModels.push(gltf.scene); oc$('hf-tree-status').textContent = `GLB trees: ${OC.treeModels.length} loaded`; if (OC.active) regenerateCourse(); }, undefined, (err) => console.warn('[HorseForest] GLB tree failed:', url, err))); } catch (error) { console.warn('[HorseForest] GLB tree loader failed.', error); oc$('hf-tree-status').textContent = 'GLB trees failed to load'; } }

function regenerateCourse() {
  if (!OC.world) return;
  clearWorld(); OC.layers.clear();
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  OC.duration = Math.min(OC.maxDuration, OC.duration);
  OC.courseLength = Math.max(900, OC.duration * OC.speed);
  resetRun(true); buildWorld(); addObstacles(Math.round((8 + OC.difficulty * 5) * template.obstacleRate)); addCollectibles(8 + OC.difficulty * 3); updateTemplateText(); updateWorldPositions(); populateLayerSelect(); applyAllLayers(); drawFrame(); drawOverview();
}

function disposeGroup(group) { while (group?.children?.length) { const child = group.children.pop(); child.traverse?.((n) => { n.geometry?.dispose?.(); if (Array.isArray(n.material)) n.material.forEach((m) => m.dispose?.()); else n.material?.dispose?.(); }); } }
function clearWorld() { disposeGroup(OC.world); OC.objects = []; OC.placed = []; }
function updateTemplateText() { const t = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy; oc$('obstacle-title').textContent = t.label; oc$('obstacle-target-score').textContent = String(OC.successScore); }

function buildWorld() {
  const groundLayer = new THREE.Group(), edgeLayer = new THREE.Group(), pathLayer = new THREE.Group(), treeLayer = new THREE.Group(), rockLayer = new THREE.Group(), fernLayer = new THREE.Group(), collectibleLayer = new THREE.Group(), obstacleLayer = new THREE.Group(), paintLayer = new THREE.Group();
  OC.world.add(groundLayer, edgeLayer, pathLayer, treeLayer, rockLayer, fernLayer, collectibleLayer, obstacleLayer, paintLayer);
  makeLayer('background', 'Background image', null, { order: -5 });
  makeLayer('ground', 'Base ground', groundLayer, { order: 0 }); makeLayer('ground-edge-alpha', 'Ground edge alpha', edgeLayer, { order: 8, opacity: 1 }); makeLayer('path', 'Path texture', pathLayer, { order: 3 }); makeLayer('paint-decals', 'Paint / alpha decals', paintLayer, { order: 11 }); makeLayer('trees', 'GLB trees', treeLayer, { order: 12 }); makeLayer('rocks', 'Rocks', rockLayer, { order: 13 }); makeLayer('ferns', 'Ferns', fernLayer, { order: 14 }); makeLayer('collectibles', 'Collectibles', collectibleLayer, { order: 15 }); makeLayer('obstacles', 'Obstacles', obstacleLayer, { order: 16 });
  buildGroundChunks(groundLayer); buildGroundEdgeFeathers(edgeLayer); buildVisiblePath(pathLayer); buildTreeCorridor(treeLayer); scatterForestFloorDetail(rockLayer, fernLayer); OC.layerGroups = { groundLayer, edgeLayer, pathLayer, treeLayer, rockLayer, fernLayer, collectibleLayer, obstacleLayer, paintLayer };
}

function buildGroundChunks(parent) { const mat = OC.groundMaterial || new THREE.MeshStandardMaterial({ color: 0x27311f, roughness: 1 }); for (let d = 0; d < OC.courseLength + 300; d += SEGMENT) { const center = pathCenterAt(d + SEGMENT / 2); const ground = new THREE.Mesh(new THREE.PlaneGeometry(46, SEGMENT + 1.2, 36, 10), mat); ground.rotation.x = -Math.PI / 2; ground.position.set(center, GROUND_Y, -d - SEGMENT / 2); parent.add(ground); } }
function buildGroundEdgeFeathers(parent) { if (!OC.groundEdgeMaterial) return; for (let d = 0; d < OC.courseLength + 300; d += SEGMENT) { const center = pathCenterAt(d + SEGMENT / 2); [-1, 1].forEach((side) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(8.2, SEGMENT + 1.4, 4, 4), OC.groundEdgeMaterial.clone()); f.rotation.x = -Math.PI / 2; f.position.set(center + side * 19, GROUND_Y + 0.052, -d - SEGMENT / 2); f.renderOrder = 8; parent.add(f); }); } }
function addPathPiece(parent, width, material, d, yOffset, lateralOffset = 0, order = 2) { const c0 = pathCenterAt(d), c1 = pathCenterAt(d + SEGMENT), mid = (c0 + c1) / 2; const angle = Math.atan2(c1 - c0, SEGMENT); const nx = Math.cos(angle), nz = Math.sin(angle); const z = -d - SEGMENT / 2; const piece = new THREE.Mesh(new THREE.PlaneGeometry(width, SEGMENT + 1.15, 8, 8), material); piece.rotation.x = -Math.PI / 2; piece.rotation.z = angle; piece.position.set(mid + nx * lateralOffset, GROUND_Y + yOffset, z - nz * lateralOffset); piece.renderOrder = order; parent.add(piece); }
function buildVisiblePath(parent) { const centerMat = OC.pathMaterial || new THREE.MeshStandardMaterial({ color: 0x9a6640 }); const inner = OC.featherInnerMaterial || centerMat; const outer = OC.featherOuterMaterial || inner; const centerW = OC.laneWidth * 1.55, innerW = OC.laneWidth * 0.56, outerW = OC.laneWidth * 0.78; for (let d = 0; d < OC.courseLength + 300; d += SEGMENT) { addPathPiece(parent, centerW, centerMat, d, 0.034, 0, 3); [-1, 1].forEach((side) => { addPathPiece(parent, innerW, inner, d, 0.036, side * (centerW / 2 + innerW / 2), 4); addPathPiece(parent, outerW, outer, d, 0.038, side * (centerW / 2 + innerW + outerW / 2), 5); }); } }
function buildTreeCorridor(parent) { if (!OC.treeModels.length) return; const mainStep = OC.templateId === 'horse_forest_dense' ? 18 : 24; const outerStep = OC.templateId === 'horse_forest_dense' ? 28 : 34; for (let d = 30; d < OC.courseLength + 230; d += mainStep) [-1, 1].forEach((side) => addTreeAt(parent, d + rand(-3, 8), side, rand(8, 15), rand(0.8, 3.2))); for (let d = 20; d < OC.courseLength + 280; d += outerStep) [-1, 1].forEach((side) => { addTreeAt(parent, d + rand(0, 12), side, rand(10, 18), rand(4, 9)); addTreeAt(parent, d + rand(8, 20), side, rand(8, 14), rand(9, 15)); }); }
function addTreeAt(parent, distance, side, height, extra) { const tree = createModelTree(height); if (!tree) return; const x = pathCenterAt(distance) + side * (OC.laneWidth * 1.25 + extra + rand(.3, 1.2)); tree.position.set(x, GROUND_Y, -distance); tree.rotation.y = rand(0, Math.PI * 2); parent.add(tree); OC.placed.push({ type: 'tree', x, z: -distance, mesh: tree }); }
function createModelTree(targetHeight) { if (!OC.treeModels.length) return null; const root = pick(OC.treeModels).clone(true); root.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(root), size = new THREE.Vector3(); box.getSize(size); root.scale.multiplyScalar(targetHeight / Math.max(size.y, 0.001)); root.updateMatrixWorld(true); const box2 = new THREE.Box3().setFromObject(root); const wrapper = new THREE.Group(); wrapper.add(root); root.position.set(-(box2.min.x + box2.max.x) / 2, -box2.min.y, -(box2.min.z + box2.max.z) / 2); return wrapper; }
function scatterForestFloorDetail(rockParent, fernParent) { for (let d = 18; d < OC.courseLength + 260; d += rand(8, 14)) [-1, 1].forEach((side) => { const x = pathCenterAt(d) + side * (OC.laneWidth * 1.22 + rand(.7, 7.2)); if (Math.random() < .55) addFern(fernParent, x, d + rand(-3, 4)); if (Math.random() < .38) addSceneryRock(rockParent, x + rand(-1, 1), d + rand(-4, 4)); }); }
function addFern(parent, x, distance) { const group = new THREE.Group(); const mat = new THREE.MeshLambertMaterial({ color: Math.random() < .5 ? 0x2d6d2e : 0x3f8a3e, side: THREE.DoubleSide }); for (let i = 0; i < 6; i++) { const leaf = new THREE.Mesh(new THREE.PlaneGeometry(.12, rand(.55, .95)), mat); leaf.position.y = .25; leaf.rotation.x = rand(-.4, .15); leaf.rotation.y = (Math.PI * 2 * i) / 6; leaf.rotation.z = rand(-.18, .18); leaf.position.x = Math.sin(leaf.rotation.y) * .18; leaf.position.z = Math.cos(leaf.rotation.y) * .18; group.add(leaf); } group.position.set(x, GROUND_Y + .02, -distance); group.scale.setScalar(rand(.65, 1.15)); parent.add(group); OC.placed.push({ type: 'fern', x, z: -distance, mesh: group }); }
function addSceneryRock(parent, x, distance) { const rock = createRock(); rock.position.set(x, GROUND_Y + .18, -distance); rock.scale.multiplyScalar(rand(.55, .95)); parent.add(rock); OC.placed.push({ type: 'rock', x, z: -distance, mesh: rock }); }
function createLog() { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.CylinderGeometry(.28, .32, 3.6, 14), new THREE.MeshLambertMaterial({ color: 0x5a3519 })); body.rotation.z = Math.PI / 2; g.add(body); return g; }
function createRock() { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(rand(.45, .75), 0), new THREE.MeshLambertMaterial({ color: Math.random() < .5 ? 0x62655c : 0x3e443a, flatShading: true })); r.scale.set(rand(.8, 1.4), rand(.45, .9), rand(.75, 1.3)); r.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI)); return r; }
function createBranch() { const b = new THREE.Mesh(new THREE.CylinderGeometry(.08, .13, 4.4, 8), new THREE.MeshLambertMaterial({ color: 0x4a2b14 })); b.rotation.z = Math.PI / 2 + rand(-.12, .12); return b; }
function createStream() { const g = new THREE.Group(); const w = new THREE.Mesh(new THREE.PlaneGeometry(OC.laneWidth * 3.2, 3.4), new THREE.MeshBasicMaterial({ color: 0x376d87, transparent: true, opacity: .82, depthWrite: false })); w.rotation.x = -Math.PI / 2; g.add(w); return g; }
function addObstacles(count) { const parent = OC.layers.get('obstacles')?.group || OC.world; for (let i = 0; i < count; i++) { const d = 70 + Math.random() * (OC.courseLength - 120); const roll = Math.random(); const center = pathCenterAt(d); const x = center + (roll < .34 ? 0 : roll < .67 ? -OC.laneWidth * .55 : OC.laneWidth * .55); const kind = pick(['log', 'log', 'rock', 'branch', 'stream']); const obj = kind === 'log' ? createLog() : kind === 'rock' ? createRock() : kind === 'stream' ? createStream() : createBranch(); const isBranch = kind === 'branch', isStream = kind === 'stream'; obj.position.set(isStream ? center : x, isBranch ? 1.55 : isStream ? GROUND_Y + .035 : GROUND_Y + .35, -d); obj.userData = { kind: 'obstacle', obstacleType: kind, hit: false, radiusX: isBranch ? 2.2 : isStream ? OC.laneWidth * 1.42 : .85, needsJump: !isBranch, needsDuck: isBranch }; parent.add(obj); OC.objects.push(obj); OC.placed.push({ type: kind, x: obj.position.x, z: obj.position.z, mesh: obj }); } }
function addCollectibles(count) { const parent = OC.layers.get('collectibles')?.group || OC.world; const geo = new THREE.OctahedronGeometry(.32, 0); for (let i = 0; i < count; i++) { const d = 45 + Math.random() * (OC.courseLength - 90); const roll = Math.random(); const center = pathCenterAt(d); const x = center + (roll < .34 ? 0 : roll < .67 ? -OC.laneWidth * .55 : OC.laneWidth * .55); const y = Math.random() < .65 ? -.55 + Math.random() * 1.2 : 1.2 + Math.random() * 1.2; const obj = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xeec45a, transparent: true, opacity: .9 })); obj.position.set(x, y, -d); obj.userData = { kind: 'collectible', collected: false, radius: .85, baseScale: 1 }; obj.add(new THREE.PointLight(0xeec45a, .75, 9)); parent.add(obj); OC.objects.push(obj); OC.placed.push({ type: 'collectible', x, z: -d, mesh: obj }); } }

function worldToOverview(x, z) { const c = oc$('hf-overview'); return { x: (x + 24) / 48 * c.width, y: (-z) / (OC.courseLength + 300) * c.height }; }
function overviewToWorld(e) { const c = oc$('hf-overview'), r = c.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width * c.width, py = (e.clientY - r.top) / r.height * c.height; return { x: px / c.width * 48 - 24, d: py / c.height * (OC.courseLength + 300), px, py }; }
function drawOverview() { const c = oc$('hf-overview'); if (!c) return; const wantedHeight = Math.max(300, Math.min(2200, Math.round((OC.courseLength + 300) / 3.2))); if (c.height !== wantedHeight) c.height = wantedHeight; const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); ctx.fillStyle = '#111914'; ctx.fillRect(0, 0, c.width, c.height); if (OC.layers.get('path')?.visible || OC.soloLayerId === 'path') { ctx.strokeStyle = '#d09a55'; ctx.lineWidth = 6; ctx.beginPath(); for (let d = 0; d < OC.courseLength; d += 18) { const p = worldToOverview(pathCenterAt(d), -d); if (d === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); } ctx.stroke(); } ctx.lineWidth = 1.5; OC.placed.forEach((o) => { const layerFor = o.type === 'tree' ? 'trees' : o.type === 'rock' ? 'rocks' : o.type === 'fern' ? 'ferns' : o.type === 'collectible' ? 'collectibles' : ['log', 'branch', 'stream'].includes(o.type) ? 'obstacles' : 'paint-decals'; const layer = OC.layers.get(layerFor); if (OC.soloLayerId && OC.soloLayerId !== layerFor) return; if (layer && !layer.visible) return; const p = worldToOverview(o.x, o.z); ctx.fillStyle = o.type === 'tree' ? '#48a24a' : o.type === 'rock' ? '#aaa' : o.type === 'fern' ? '#64c04d' : o.type === 'collectible' ? '#eec45a' : ['log', 'branch', 'stream'].includes(o.type) ? '#b04b35' : '#d09a55'; ctx.beginPath(); ctx.arc(p.x, p.y, o.type === 'tree' ? 4 : 3, 0, Math.PI * 2); ctx.fill(); }); ctx.strokeStyle = '#eec45a'; ctx.strokeRect(1, 1, c.width - 2, c.height - 2); }
function handleOverviewPaint(e) { const p = overviewToWorld(e); const mode = OC.paintMode; if (mode === 'erase') { eraseNear(p.x, -p.d, OC.brushSize / 7); drawOverview(); drawFrame(); return; } if (mode === 'tree') return addManualTree(p.x, p.d); if (mode === 'rock') return addManualRock(p.x, p.d); if (mode === 'fern') return addManualFern(p.x, p.d); if (mode === 'collectible') return addManualCollectible(p.x, p.d); if (mode === 'obstacle') return addManualObstacle(p.x, p.d); addPaintDecal(p.x, p.d, mode, OC.brushSize / 5, OC.brushStrength); }
function addPaintDecal(x, distance, mode, radius, strength) { const parent = OC.layers.get('paint-decals')?.group || OC.world; let color = mode === 'grass-a' ? 0x2f5b2e : mode === 'grass-b' ? 0x547145 : 0x9a6640; const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: mode.includes('alpha') ? strength * .38 : strength * .65, alphaMap: makeAlphaTexture(), depthWrite: false, side: THREE.DoubleSide }); const mesh = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2, 12, 12), mat); mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, GROUND_Y + .07, -distance); mesh.renderOrder = 20; parent.add(mesh); OC.placed.push({ type: mode, x, z: -distance, mesh }); drawOverview(); drawFrame(); }
function eraseNear(x, z, radius) { OC.placed = OC.placed.filter((o) => { const keep = Math.hypot(o.x - x, o.z - z) > radius; if (!keep) o.mesh?.parent?.remove(o.mesh); return keep; }); }
function addManualTree(x, d) { const p = OC.layers.get('trees')?.group || OC.world; const tree = createModelTree(rand(8, 15)); if (!tree) return; tree.position.set(x, GROUND_Y, -d); p.add(tree); OC.placed.push({ type: 'tree', x, z: -d, mesh: tree }); drawOverview(); drawFrame(); }
function addManualRock(x, d) { addSceneryRock(OC.layers.get('rocks')?.group || OC.world, x, d); drawOverview(); drawFrame(); }
function addManualFern(x, d) { addFern(OC.layers.get('ferns')?.group || OC.world, x, d); drawOverview(); drawFrame(); }
function addManualCollectible(x, d) { const parent = OC.layers.get('collectibles')?.group || OC.world; const obj = new THREE.Mesh(new THREE.OctahedronGeometry(.32, 0), new THREE.MeshBasicMaterial({ color: 0xeec45a, transparent: true, opacity: .9 })); obj.position.set(x, .6, -d); obj.userData = { kind: 'collectible', collected: false, radius: .85, baseScale: 1 }; parent.add(obj); OC.objects.push(obj); OC.placed.push({ type: 'collectible', x, z: -d, mesh: obj }); drawOverview(); drawFrame(); }
function addManualObstacle(x, d) { const parent = OC.layers.get('obstacles')?.group || OC.world; const obj = createLog(); obj.position.set(x, GROUND_Y + .35, -d); obj.userData = { kind: 'obstacle', obstacleType: 'log', hit: false, radiusX: .85, needsJump: true, needsDuck: false }; parent.add(obj); OC.objects.push(obj); OC.placed.push({ type: 'log', x, z: -d, mesh: obj }); drawOverview(); drawFrame(); }

function resetRun(keepMessage = false) { OC.running = false; OC.complete = false; OC.distance = 0; OC.score = 0; OC.hits = 0; OC.jumps = 0; OC.collected = 0; OC.player = { x: 0, y: 0, vy: 0, grounded: true }; OC.objects.forEach((o) => { o.visible = true; o.userData.hit = false; o.userData.collected = false; }); updateWorldPositions(); updateStats(); if (!keepMessage) setResult('Ride reset. Start the test when ready.', 'warn'); }
function startRun() { if (OC.complete) resetRun(true); OC.running = true; OC.clock.getDelta(); oc$('obstacle-status').textContent = 'Riding'; setResult('Horse ride running.', 'warn'); if (!OC.frame) OC.frame = requestAnimationFrame(tickRun); }
function pauseRun() { OC.running = false; if (oc$('obstacle-status')) oc$('obstacle-status').textContent = 'Paused'; if (OC.frame) cancelAnimationFrame(OC.frame); OC.frame = null; }
function tickRun() { OC.frame = null; if (!OC.active) return; const dt = Math.min(.05, OC.clock.getDelta() || .016); if (OC.running) { updatePlayer(dt); OC.distance += OC.speed * dt; checkCollisions(); if (OC.distance >= OC.courseLength) finishRun(); updateStats(); } drawFrame(); if (OC.running) OC.frame = requestAnimationFrame(tickRun); }
function jumpHorse() { if (!OC.running || !OC.player.grounded) return; OC.player.vy = 7.8; OC.player.grounded = false; OC.jumps += 1; }
function updatePlayer(dt) { let dx = 0; if (OC.keys.has('arrowleft') || OC.keys.has('a')) dx -= 1; if (OC.keys.has('arrowright') || OC.keys.has('d')) dx += 1; OC.player.x = clamp(OC.player.x + dx * OC.steerSpeed * dt, -OC.laneWidth, OC.laneWidth); OC.player.vy -= 18 * dt; OC.player.y += OC.player.vy * dt; if (OC.player.y <= 0) { OC.player.y = 0; OC.player.vy = 0; OC.player.grounded = true; } updateWorldPositions(); }
function isDucking() { return OC.keys.has('arrowdown') || OC.keys.has('s'); }
function updateWorldPositions() { if (!OC.camera) return; const bob = OC.running ? Math.sin(performance.now() * .012) * .035 : 0; const duck = isDucking() && OC.player.grounded ? -.28 : 0; const curve = pathCenterAt(OC.distance); const camX = curve + OC.player.x * .42; const lookX = pathCenterAt(OC.distance + 46) + OC.player.x * .14; OC.camera.position.set(camX, 1.48 + OC.player.y + bob + duck, 7.8); OC.camera.lookAt(lookX, .12 + OC.player.y * .25 + duck * .25, -44); OC.overviewCamera.position.set(0, 120, -OC.courseLength / 2); OC.overviewCamera.lookAt(0, GROUND_Y, -OC.courseLength / 2); if (OC.world) OC.world.position.z = OC.viewMode === 'ride' ? OC.distance : 0; }
function checkCollisions() { const px = playerWorldX(), py = .6 + OC.player.y; OC.objects.forEach((o) => { if (!o.visible) return; const wz = o.position.z + OC.world.position.z; if (Math.abs(wz + 14) > 1.45) return; const dx = Math.abs(o.position.x - px); if (o.userData.kind === 'obstacle' && !o.userData.hit) { const jump = o.userData.needsJump && OC.player.y > .65, duck = o.userData.needsDuck && isDucking(); if (dx < o.userData.radiusX && !jump && !duck) { o.userData.hit = true; o.visible = false; OC.hits++; OC.score--; } } if (o.userData.kind === 'collectible' && !o.userData.collected && dx < o.userData.radius && Math.abs(o.position.y - py) < o.userData.radius + .45) { o.userData.collected = true; o.visible = false; OC.collected++; OC.score += 5; } }); }
function finishRun() { OC.running = false; OC.complete = true; OC.distance = OC.courseLength; updateStats(); drawFrame(); if (OC.score >= OC.successScore) { oc$('obstacle-status').textContent = 'Success'; setResult('Success event: obstacle_course_success · Quest outcome: horse_forest_success', 'success'); } else { oc$('obstacle-status').textContent = 'Failure'; setResult('Failure event: obstacle_course_failure · Quest outcome: horse_forest_failure', 'failure'); } }
function updateStats() { if (!oc$('obstacle-score')) return; oc$('obstacle-score').textContent = String(OC.score); oc$('obstacle-collected').textContent = String(OC.collected); oc$('obstacle-hits').textContent = String(OC.hits); oc$('obstacle-course-summary').textContent = `${Math.round(OC.distance)}m / ${Math.round(OC.courseLength)}m`; }
function setResult(text, state = 'warn') { const t = oc$('obstacle-result'); if (!t) return; t.textContent = text; t.dataset.state = state; }
function drawFrame() { if (!OC.renderer || !OC.scene) return; const now = performance.now(); OC.objects.forEach((o) => { if (o.userData.kind === 'collectible' && o.visible) { o.rotation.y = now * .002 + o.position.z; o.scale.setScalar((o.userData.baseScale ?? 1) + Math.sin(now * .006 + o.position.z) * .08); } }); OC.renderer.render(OC.scene, OC.viewMode === 'overview' ? OC.overviewCamera : OC.camera); }
function showObstaclePanel(panelId) { OC.panels.querySelectorAll('[data-obstacle-panel]').forEach((p) => { p.hidden = p.dataset.obstaclePanel !== panelId; p.classList.toggle('is-active', p.datasetObstablePanel === panelId); }); document.querySelectorAll('.panel-nav-button').forEach((b) => b.classList.toggle('is-active', b.dataset.panel === panelId)); }
function closeOtherPuzzleWorkflows() { window.__artifexPatternLock?.close?.(); window.__artifexPotionMatch?.close?.(); window.__artifexHorseForestRunner?.close?.(); document.body.classList.remove('is-pattern-lock', 'is-potion-match', 'is-horse-forest'); }
function interceptClicks(event) { const button = event.target.closest("[data-engine='obstacle-course']"); if (!button) return; event.preventDefault(); event.stopImmediatePropagation(); closeOtherPuzzleWorkflows(); document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach((c) => { c.classList.toggle('is-active', c.dataset.engine === 'obstacle-course'); c.classList.toggle('is-selected', c.dataset.engine === 'obstacle-course'); }); document.getElementById('puzzle-launcher-panel')?.setAttribute('hidden', ''); document.getElementById('puzzle-module-brief-page')?.setAttribute('hidden', ''); openObstacleCourseWorkflow(); }
function boot() { document.addEventListener('click', interceptClicks, true); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
window.__artifexObstacleCourse = { open: openObstacleCourseWorkflow, close: closeObstacleCourseWorkflow, getState: () => ({ templateId: OC.templateId, difficulty: OC.difficulty, duration: OC.duration, speed: OC.speed, laneWidth: OC.laneWidth, bumpStrength: OC.bumpStrength, displacementStrength: OC.displacementStrength, score: OC.score, hits: OC.hits, jumps: OC.jumps, collected: OC.collected, assetBase: ASSET_BASE }) };
