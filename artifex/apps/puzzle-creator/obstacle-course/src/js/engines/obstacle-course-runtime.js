// Obstacle Course V2.6.2 / Horse Forest Runner V29.2
// Clean consolidated live engine: no layout/control patch stack.
// Features: horse POV, modular transparent WEBP path segments, forest_ground WEBP ground,
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
  ground: `${ASSET_BASE}ground/forest_ground.webp`,
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


const AUDIO_ASSETS = {
  snort: `${ASSET_BASE}audio/horse_snort.wav`,
  neigh: `${ASSET_BASE}audio/horse_neigh.mp3`,
  gallopSlow: `${ASSET_BASE}audio/horse_gallop_slow.mp3`,
  gallopFull: `${ASSET_BASE}audio/horse_gallop_full.mp3`,
  land: `${ASSET_BASE}audio/horse_land.mp3`,
  forest: `${ASSET_BASE}audio/forest_ambience.mp3`,
  bush: `${ASSET_BASE}audio/bush.mp3`,
};

const AUDIO = {
  ready: false,
  clips: new Map(),
  lastVoiceAt: 0,
  lastBushAt: 0,
  wasForwardMoving: false,
};

const TEMPLATES = {
  horse_forest_easy: { label: 'Obstacle Course', obstacleRate: 1 },
  horse_forest_dense: { label: 'Dense Forest Course', obstacleRate: 1.35 },
  horse_forest_night: { label: 'Moonlit Forest Course', obstacleRate: 1.15 },
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
  startAssistTime: 0,
  screenBrightness: 1,
  screenTint: '#000000',
  screenTintStrength: 0,
  sceneryDistance: 1.6,
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


function audioSupported() {
  return typeof Audio !== 'undefined';
}

function makeAudio(src, options = {}) {
  if (!audioSupported()) return null;
  const audio = new Audio(src);
  audio.preload = options.preload || 'auto';
  audio.loop = Boolean(options.loop);
  audio.volume = options.volume ?? 0.8;
  return audio;
}

function ensureAudioReady() {
  if (AUDIO.ready) return;
  AUDIO.ready = true;
  AUDIO.clips.set('snort', makeAudio(AUDIO_ASSETS.snort, { volume: 0.72 }));
  AUDIO.clips.set('neigh', makeAudio(AUDIO_ASSETS.neigh, { volume: 0.72 }));
  AUDIO.clips.set('land', makeAudio(AUDIO_ASSETS.land, { volume: 0.55 }));
  AUDIO.clips.set('bush', makeAudio(AUDIO_ASSETS.bush, { volume: 0.46 }));
  AUDIO.clips.set('forest', makeAudio(AUDIO_ASSETS.forest, { loop: true, volume: 0.18 }));
  AUDIO.clips.set('gallopSlow', makeAudio(AUDIO_ASSETS.gallopSlow, { loop: true, volume: 0.38 }));
  AUDIO.clips.set('gallopFull', makeAudio(AUDIO_ASSETS.gallopFull, { loop: true, volume: 0.46 }));
}

function playClip(id, options = {}) {
  ensureAudioReady();
  const clip = AUDIO.clips.get(id);
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
  const clip = AUDIO.clips.get(id);
  if (!clip) return;
  if (volume !== undefined) clip.volume = volume;
  if (active) {
    const play = clip.play();
    if (play?.catch) play.catch(() => {});
  } else {
    clip.pause();
  }
}

function stopMotionLoops() {
  setLoop('gallopSlow', false);
  setLoop('gallopFull', false);
}

function stopAllAudio() {
  ['forest', 'gallopSlow', 'gallopFull'].forEach((id) => setLoop(id, false));
}

function playRandomHorseVoice(force = false) {
  ensureAudioReady();
  const now = performance.now();
  if (!force && now - AUDIO.lastVoiceAt < 6500) return;
  AUDIO.lastVoiceAt = now;
  playClip(Math.random() < 0.58 ? 'neigh' : 'snort');
}

function playBushRustle() {
  const now = performance.now();
  if (now - AUDIO.lastBushAt < 900) return;
  AUDIO.lastBushAt = now;
  playClip('bush');
}

function updateRideAudio() {
  if (!OC.active) return;
  const forward = OC.running && !OC.complete && OC.currentSpeed > 1.2;
  const fast = forward && OC.currentSpeed > OC.speed * 0.62;
  const slow = forward && !fast;
  if (forward && !AUDIO.wasForwardMoving) playRandomHorseVoice();
  AUDIO.wasForwardMoving = forward;
  setLoop('forest', OC.running || OC.active, 0.16);
  setLoop('gallopSlow', slow, 0.34);
  setLoop('gallopFull', fast, 0.44);
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
    tint: '#ffffff',
  };
  OC.layers.set(id, layer);
  applyLayer(layer);
  return layer;
}

function rememberBaseScale(node) {
  if (!node?.userData) return;
  if (!node.userData.__ocBaseScale) node.userData.__ocBaseScale = node.scale.clone();
}

function applyLayerObjectScale(layer, node) {
  rememberBaseScale(node);
  const base = node.userData?.__ocBaseScale;
  if (!base) return;
  const s = layer.scale || 1;
  if (layer.id === 'path') node.scale.set(base.x * s, base.y, base.z);
  else if (['trees', 'rocks', 'collectibles', 'obstacles'].includes(layer.id)) node.scale.copy(base).multiplyScalar(s);
}

function applyLayer(layer) {
  if (!layer || !layer.group) return;
  layer.group.visible = isLayerDisplayed(layer);
  layer.group.position.set(layer.x, layer.y, layer.z);
  layer.group.scale.setScalar(['trees', 'rocks', 'collectibles', 'obstacles', 'path'].includes(layer.id) ? 1 : (layer.scale || 1));
  layer.group.children.forEach((child) => applyLayerObjectScale(layer, child));
  layer.group.traverse((node) => {
    node.renderOrder = layer.order;
    if (!node.material) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((mat) => {
      mat.transparent = layer.opacity < 1 || mat.transparent;
      mat.opacity = layer.opacity;
      if (mat.color && layer.tint && layer.tint !== '#ffffff') mat.color.multiply(new THREE.Color(layer.tint));
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
    .obstacle-horse-overlay{position:absolute;left:50%;bottom:-38px;z-index:5;width:430px;height:247px;margin-left:-215px;pointer-events:none;filter:drop-shadow(0 7px 9px rgba(0,0,0,.72));opacity:.98;background-image:url('${ASSETS.horse}');background-repeat:no-repeat;background-size:700% 100%;background-position:50% 100%;transition:background-position .08s linear}.obstacle-hud{position:absolute;left:14px;right:14px;bottom:12px;z-index:6;display:flex;justify-content:space-between;gap:12px;pointer-events:none;color:var(--cream,#f4ead4);font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.8)}.obstacle-speed-badge{position:absolute;right:14px;top:12px;z-index:7;border:1px solid rgba(238,196,90,.5);border-radius:999px;background:rgba(5,8,13,.74);color:var(--gold,#eec45a);padding:7px 10px;font-size:.72rem;font-weight:900;text-shadow:0 2px 5px rgba(0,0,0,.8)}.obstacle-tint-overlay{position:absolute;inset:0;z-index:6;pointer-events:none;background:var(--oc-tint,#000);opacity:var(--oc-tint-opacity,0);mix-blend-mode:soft-light}.wide-button.is-running,#obstacle-start.is-running,#obstacle-start-left.is-running{border-color:rgba(158,230,164,.95);background:rgba(36,120,62,.9);box-shadow:0 0 0 2px rgba(158,230,164,.22),0 0 18px rgba(158,230,164,.2)}#obstacle-pause.is-paused,#obstacle-pause-left.is-paused{border-color:rgba(238,196,90,.9);background:rgba(95,63,9,.88)}.obstacle-reticle{position:absolute;left:50%;top:50%;z-index:4;width:34px;height:34px;margin:-17px 0 0 -17px;border:1px solid rgba(238,196,90,.35);border-radius:50%;box-shadow:0 0 16px rgba(238,196,90,.16);pointer-events:none}
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
  stopAllAudio();
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
        <div class="obstacle-header-line"><div><p class="eyebrow">Obstacle Course · V2.6.2</p><h2 id="obstacle-title">Obstacle Course</h2><p id="obstacle-objective">Horse forest obstacle course using modular transparent WEBP path segments over forest_ground.webp.</p></div><span id="obstacle-status" class="obstacle-status-pill">Ready</span></div>
        <div id="obstacle-three-host" class="obstacle-three-wrap"><div class="obstacle-reticle"></div><div class="obstacle-horse-overlay"></div><div class="obstacle-tint-overlay"></div><div id="obstacle-speed-badge" class="obstacle-speed-badge">Speed 0</div><div class="obstacle-hud"><span>Start Test = begin run · Hold ↑/W move · ↓/S back · Ctrl duck · Space jump</span><span id="obstacle-course-summary">0m / 0m</span></div></div>
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
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="build"><div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Obstacle Course</h2></div><span class="status-pill is-waiting">V2.6.2</span></div><p class="obstacle-panel-copy">Course editor controls use transparent path segment WEBPs over forest_ground.webp.</p><label class="field-block"><span>Course Template</span><select id="obstacle-template"><option value="horse_forest_easy">Obstacle Course</option><option value="horse_forest_dense">Dense Forest Course</option><option value="horse_forest_night">Moonlit Forest Course</option></select></label><label class="range-row"><span>Difficulty <output id="obstacle-difficulty-out">2</output></span><input id="obstacle-difficulty" type="range" min="1" max="5" value="2" /></label><label class="range-row"><span>Course Duration <output id="obstacle-duration-out">45s</output></span><input id="obstacle-duration" type="range" min="20" max="300" step="5" value="45" /></label><button id="obstacle-regenerate" class="wide-button" type="button">Regenerate Obstacle Course</button><label class="range-row"><span>Forest Edge Distance <output id="obstacle-scenery-distance-out">1.6</output></span><input id="obstacle-scenery-distance" type="range" min="0.6" max="6" step="0.1" value="1.6" /></label><section class="hf-key-panel"><h3>Overview Key</h3><div class="hf-key-list"><div><span class="hf-key-dot hf-key-path"></span>Path</div><div><span class="hf-key-dot hf-key-tree"></span>Tree</div><div><span class="hf-key-dot hf-key-rock"></span>Rock</div><div><span class="hf-key-dot hf-key-collectible"></span>Collectible</div><div><span class="hf-key-dot hf-key-obstacle"></span>Obstacle</div></div></section><div id="horse-run-controls-left-slot"><button id="obstacle-start-left" type="button">Start Test</button><button id="obstacle-pause-left" type="button">Pause</button><button id="obstacle-reset-run-left" type="button">Reset Run</button></div></section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="display" hidden><div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Ground Relief</h2></div></div><label class="range-row"><span>Bump Strength <output id="obstacle-bump-out">0.12</output></span><input id="obstacle-bump" type="range" min="0" max="0.45" step="0.01" value="0.12" /></label><label class="range-row"><span>Displacement Strength <output id="obstacle-displacement-out">0.035</output></span><input id="obstacle-displacement" type="range" min="0" max="0.18" step="0.005" value="0.035" /></label><label class="range-row"><span>Horse Speed <output id="obstacle-speed-out">34</output></span><input id="obstacle-speed" type="range" min="18" max="64" step="2" value="34" /></label><label class="range-row"><span>Overall Brightness <output id="obstacle-brightness-out">100%</output></span><input id="obstacle-brightness" type="range" min="55" max="150" step="5" value="100" /></label><label class="field-block"><span>Screen Tint</span><input id="obstacle-tint" type="color" value="#000000" /></label><label class="range-row"><span>Tint Strength <output id="obstacle-tint-strength-out">0%</output></span><input id="obstacle-tint-strength" type="range" min="0" max="65" step="5" value="0" /></label><label class="range-row"><span>Lane Width <output id="obstacle-lane-width-out">2.7</output></span><input id="obstacle-lane-width" type="range" min="1.8" max="5" step="0.1" value="2.7" /></label></section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="logic" hidden><div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Scoring</h2></div></div><label class="range-row"><span>Success Score <output id="obstacle-success-score-out">20</output></span><input id="obstacle-success-score" type="range" min="0" max="80" step="5" value="20" /></label></section>`;
  leftBody.appendChild(OC.panels);
  OC.host = oc$('obstacle-three-host');
  setupThreeScene();
  bindControls();
  updateScreenFilters();
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
  oc$('obstacle-scenery-distance')?.addEventListener('input', (e) => { OC.sceneryDistance = Number(e.target.value); oc$('obstacle-scenery-distance-out').textContent = OC.sceneryDistance.toFixed(1); regenerateCourse(); });
  oc$('obstacle-brightness')?.addEventListener('input', (e) => { OC.screenBrightness = Number(e.target.value) / 100; oc$('obstacle-brightness-out').textContent = `${e.target.value}%`; updateScreenFilters(); });
  oc$('obstacle-tint')?.addEventListener('input', (e) => { OC.screenTint = e.target.value; updateScreenFilters(); });
  oc$('obstacle-tint-strength')?.addEventListener('input', (e) => { OC.screenTintStrength = Number(e.target.value) / 100; oc$('obstacle-tint-strength-out').textContent = `${e.target.value}%`; updateScreenFilters(); });
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

function normaliseGameKey(event) {
  const key = String(event.key || '').toLowerCase();
  const code = String(event.code || '').toLowerCase();
  if (key === 'arrowup' || key === 'w' || code === 'keyw') return 'forward';
  if (key === 'arrowdown' || key === 's' || code === 'keys') return 'back';
  if (key === 'arrowleft' || key === 'a' || code === 'keya') return 'left';
  if (key === 'arrowright' || key === 'd' || code === 'keyd') return 'right';
  if (key === 'control' || code === 'controlleft' || code === 'controlright') return 'duck';
  if (key === ' ' || code === 'space') return 'jump';
  return null;
}

function handleKeyDown(event) {
  if (!OC.active) return;
  const gameKey = normaliseGameKey(event);
  if (!gameKey) return;
  event.preventDefault();
  event.stopPropagation();
  OC.keys.add(gameKey);
  if (gameKey === 'jump' && !event.repeat) startJump();
}
function handleKeyUp(event) {
  if (!OC.active) return;
  const gameKey = normaliseGameKey(event);
  if (!gameKey) return;
  event.preventDefault();
  event.stopPropagation();
  OC.keys.delete(gameKey);
  if (gameKey === 'jump') OC.player.jumpingHeld = false;
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
    texture.wrapS = options.repeatX === false ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(options.repeat[0], options.repeat[1]);
  }
  OC.textureCache.set(key, texture);
  return texture;
}

function buildMaterials() {
  const groundMap = loadTexture(ASSETS.ground, { repeat: [1, 44], repeatX: false });
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
  [['x', 'X', -30, 30, 0.1], ['z', 'Z', -80, 80, 0.5], ['y', 'Y', -10, 10, 0.1], ['scale', 'Object Size', 0.1, 4, 0.05], ['opacity', 'Alpha', 0, 1, 0.05], ['order', 'Order', -20, 40, 1]].forEach(([prop, label, min, max, step]) => {
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
  makeLayer('ground', 'Forest ground', groundLayer, { order: 0 });
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
  const x = pathCenterAt(distance) + side * (OC.laneWidth * 0.85 + OC.sceneryDistance + extra * 0.28 + rand(0.25, 0.9));
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
    [-1, 1].forEach((side) => addSceneryRock(parent, pathCenterAt(d) + side * rand(OC.laneWidth + 0.8, OC.laneWidth + OC.sceneryDistance + 3.0), d + rand(-4, 4)));
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

function syncRunButtons() {
  const running = OC.running && !OC.complete;
  ['obstacle-start', 'obstacle-start-left'].forEach((id) => oc$(id)?.classList.toggle('is-running', running));
  ['obstacle-pause', 'obstacle-pause-left'].forEach((id) => oc$(id)?.classList.toggle('is-paused', !running && OC.distance > 0 && !OC.complete));
}

function updateHorseSprite() {
  const horse = document.querySelector('.obstacle-horse-overlay');
  if (!horse) return;
  let frame = 3;
  if (OC.keys.has('left')) frame = 1;
  if (OC.keys.has('right')) frame = 5;
  if (OC.keys.has('left') && OC.keys.has('right')) frame = 3;
  horse.style.backgroundPosition = `${(frame / 6) * 100}% 100%`;
}

function updateScreenFilters() {
  if (OC.host) OC.host.style.setProperty('--oc-brightness', String(OC.screenBrightness || 1));
  const tint = document.querySelector('.obstacle-tint-overlay');
  if (tint) {
    tint.style.setProperty('--oc-tint', OC.screenTint || '#000000');
    tint.style.setProperty('--oc-tint-opacity', String(OC.screenTintStrength || 0));
  }
}

function startRun() {
  ensureAudioReady();
  playRandomHorseVoice(true);
  setLoop('forest', true, 0.16);
  OC.running = true;
  OC.complete = false;
  OC.startAssistTime = 1.2;
  if (OC.currentSpeed < 2.4) OC.currentSpeed = 2.4;
  OC.clock?.start();
  oc$('obstacle-status').textContent = 'Riding';
  setResult('Run started. The horse walks forward briefly on its own; hold ↑/W to keep moving and speed up.', 'waiting');
  syncRunButtons();
}
function pauseRun() {
  OC.running = false;
  OC.targetSpeed = 0;
  OC.startAssistTime = 0;
  AUDIO.wasForwardMoving = false;
  stopMotionLoops();
  if (oc$('obstacle-status')) oc$('obstacle-status').textContent = 'Paused';
  syncRunButtons();
}
function resetRun(quiet = false) {
  OC.running = false;
  stopMotionLoops();
  AUDIO.wasForwardMoving = false;
  OC.complete = false;
  OC.distance = 0;
  OC.currentSpeed = 0;
  OC.targetSpeed = 0;
  OC.startAssistTime = 0;
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
  syncRunButtons();
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
  updateHorseSprite();
  updateCamera();
  OC.renderer.render(OC.scene, OC.camera);
}
function updateRun(dt) {
  let steer = 0;
  if (OC.keys.has('left')) steer -= 1;
  if (OC.keys.has('right')) steer += 1;
  OC.player.x = clamp(OC.player.x + steer * OC.steerSpeed * dt, -OC.laneWidth * 1.8, OC.laneWidth * 1.8);

  if (OC.keys.has('forward')) OC.targetSpeed = OC.speed;
  else if (OC.keys.has('back')) OC.targetSpeed = BACK_SPEED;
  else if (OC.startAssistTime > 0) {
    OC.targetSpeed = Math.max(6, Math.min(12, OC.speed * 0.35));
    OC.startAssistTime = Math.max(0, OC.startAssistTime - dt);
  } else OC.targetSpeed = 0;

  const status = pathStatus();
  let cappedTarget = OC.targetSpeed;
  if (status === 'off' && cappedTarget > SLOW_TROT_SPEED) cappedTarget = SLOW_TROT_SPEED;
  if (status === 'edge' && cappedTarget > OC.speed * 0.55) cappedTarget = OC.speed * 0.55;
  const rate = Math.abs(cappedTarget) > Math.abs(OC.currentSpeed) ? ACCEL : DECEL;
  OC.currentSpeed += clamp(cappedTarget - OC.currentSpeed, -rate * dt, rate * dt);
  OC.distance = Math.max(0, OC.distance + OC.currentSpeed * dt);
  updateRideAudio();
  if (status === 'off' && OC.targetSpeed > 0) {
    playBushRustle();
    setResult('Off path: horse slowed to a trot. Steer back onto the road.', 'warn');
  }
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
      const landed = !OC.player.grounded;
      OC.player.y = 0;
      OC.player.vy = 0;
      OC.player.grounded = true;
      OC.player.jumpingHeld = false;
      OC.player.jumpHoldTime = 0;
      if (landed) playClip('land', { volume: 0.48 });
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
      playBushRustle();
      if (Math.random() < 0.38) playRandomHorseVoice();
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
  const speedBadge = oc$('obstacle-speed-badge');
  if (speedBadge) {
    const speed = Math.max(0, Math.round(OC.currentSpeed));
    const gait = speed < 3 ? 'Stopped' : speed < OC.speed * 0.45 ? 'Trot' : speed < OC.speed * 0.75 ? 'Canter' : 'Gallop';
    speedBadge.textContent = `${gait} · ${speed}`;
  }
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
    groundTexture: 'forest_ground.webp',
    importedTrees: OC.treeModels.length,
  }),
};

// --- V2.6 obstacle-course final control/asset patch ---
(function installObstacleCourseV26FinalPatch(){
  if (OC.__v26FinalPatchInstalled) return;
  OC.__v26FinalPatchInstalled = true;

  ASSETS.trees = [
    `${ASSET_BASE}3d/tree.glb`,
    `${ASSET_BASE}3d/tree_low-poly.glb`,
    `${ASSET_BASE}3d/tree_gn.glb`,
    `${ASSET_BASE}3d/hill_top_tree.glb`,
    `${ASSET_BASE}3d/oak_trees.glb`,
    `${ASSET_BASE}3d/pine_tree.glb`,
    `${ASSET_BASE}3d/pine_tree__ps1_low_poly.glb`,
    `${ASSET_BASE}3d/small_pine.glb`,
    `${ASSET_BASE}3d/dead_tree.glb`,
    `${ASSET_BASE}3d/pine_with_awkward_teenage_face.glb`,
  ];
  ASSETS.rocks = [
    `${ASSET_BASE}3d/rock_low-poly.glb`,
    `${ASSET_BASE}3d/stone_low-poly.glb`,
  ];
  ASSETS.details = [
    `${ASSET_BASE}3d/low_poly_fern.glb`,
    `${ASSET_BASE}3d/stylized_glowing_mushrooms.glb`,
  ];
  ASSETS.sharedArrows = '../../../shared/ui/defaultarrows.webp';
  ASSETS.sharedIcons = '../../../shared/ui/defaulticons.webp';

  OC.laneWidth = Math.max(3.1, OC.laneWidth * 1.15);
  OC.pathVisualWidth = 27.6;
  OC.sceneryDistance = 1.1;
  OC.offPathTime = 0;
  OC.lastPathStatus = 'on';
  OC.gridEnabled = false;
  OC.gridOffsetX = 0;
  OC.gridOffsetZ = 0;
  OC.layerDefaults = { brightness: 1, contrast: 1, saturation: 1, tintStrength: 0, tint: '#ffffff' };
  OC.rockModels = [];
  OC.detailModels = [];
  OC.assetPreloadStarted = false;
  OC.assetsEssentialReady = false;
  OC.assetLoadTotal = 0;
  OC.assetLoadDone = 0;
  OC.assetLoadFailed = 0;

  const oldEnsureMounted = ensureMounted;
  ensureMounted = function ensureMountedPatched(){
    oldEnsureMounted();
    installFinalUiPatch();
    createGridOverlay();
    preloadEssentialAssets();
  };

  const oldMakeLayer = makeLayer;
  makeLayer = function makeLayerPatched(id, label, group, options = {}) {
    const layer = oldMakeLayer(id, label, group, options);
    layer.brightness = options.brightness ?? 1;
    layer.contrast = options.contrast ?? 1;
    layer.saturation = options.saturation ?? 1;
    layer.tintStrength = options.tintStrength ?? 0;
    layer.tint = options.tint ?? '#ffffff';
    return layer;
  };

  pathStatus = function pathStatusPatched() {
    const abs = Math.abs(OC.player.x);
    const playableWidth = OC.laneWidth * 1.12;
    if (abs > playableWidth) return 'off';
    if (abs > playableWidth * 0.78) return 'edge';
    return 'on';
  };

  generatePathSequence = function generatePathSequencePatched() {
    OC.pathSequence = [];
    let pos = 'centre';
    const count = Math.ceil((OC.courseLength + 420) / SEGMENT_WORLD_STEP);
    for (let i = 0; i < count; i += 1) {
      let choices;
      if (pos === 'left') choices = [ASSETS.pathSegments.leftToStraight];
      else if (pos === 'right') choices = [ASSETS.pathSegments.rightToStraight];
      else choices = [ASSETS.pathSegments.straight, ASSETS.pathSegments.straight, ASSETS.pathSegments.kink, ASSETS.pathSegments.left, ASSETS.pathSegments.right];
      const def = pick(choices);
      const distance = i * SEGMENT_WORLD_STEP;
      const startX = PATH_POSITIONS[def.start] ?? 0;
      const endX = PATH_POSITIONS[def.end] ?? 0;
      OC.pathSequence.push({ ...def, distance, startX, endX });
      pos = def.end;
    }
  };

  buildPathSegments = function buildPathSegmentsPatched(parent) {
    OC.pathSequence.forEach((seg) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(OC.pathVisualWidth || 27.6, SEGMENT_WORLD_LENGTH, 1, 1), getPathMaterial(seg));
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set((seg.startX + seg.endX) / 2, GROUND_Y + 0.048, -seg.distance - SEGMENT_WORLD_LENGTH / 2);
      mesh.renderOrder = 4;
      parent.add(mesh);
    });
  };

  buildTreeCorridor = function buildTreeCorridorPatched(parent) {
    const step = OC.templateId === 'horse_forest_dense' ? 13 : 17;
    for (let d = 24; d < OC.courseLength + 250; d += step) {
      [-1, 1].forEach((side) => {
        for (let row = 0; row < 5; row += 1) {
          const edge = OC.laneWidth + OC.sceneryDistance + row * rand(2.2, 4.3);
          const height = row < 1 ? rand(5.5, 9.5) : rand(8, 17);
          addTreeAt(parent, d + rand(-7, 9), side, height, edge);
        }
      });
    }
  };

  addTreeAt = function addTreeAtPatched(parent, distance, side, height, extra) {
    const tree = createModelFromBucket(OC.treeModels, height) || createFallbackTree(height);
    if (!tree) return;
    const x = pathCenterAt(distance) + side * extra;
    tree.position.set(x, GROUND_Y, -distance);
    tree.rotation.y = rand(0, Math.PI * 2);
    tree.rotation.x = rand(-0.04, 0.04);
    tree.rotation.z = rand(-0.025, 0.025);
    tree.scale.multiplyScalar(rand(0.86, 1.18));
    parent.add(tree);
    OC.placed.push({ type: 'tree', x, z: -distance, mesh: tree });
  };

  createModelTree = function createModelTreePatched(targetHeight) {
    return createModelFromBucket(OC.treeModels, targetHeight) || createFallbackTree(targetHeight);
  };

  createRock = function createRockPatched() {
    const model = createModelFromBucket(OC.rockModels, rand(0.9, 1.8));
    if (model) return model;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rand(0.45, 0.75), 0), new THREE.MeshLambertMaterial({ color: Math.random() < 0.5 ? 0x62655c : 0x3e443a, flatShading: true }));
    rock.scale.set(rand(0.8, 1.4), rand(0.45, 0.9), rand(0.75, 1.3));
    rock.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    return rock;
  };

  scatterForestFloorDetail = function scatterForestFloorDetailPatched(parent) {
    for (let d = 14; d < OC.courseLength + 260; d += rand(6, 12)) {
      [-1, 1].forEach((side) => {
        addSceneryRock(parent, pathCenterAt(d) + side * rand(OC.laneWidth + 0.55, OC.laneWidth + 4.5), d + rand(-4, 4));
        if (Math.random() < 0.66) addDetailAt(parent, d + rand(-4, 4), side, rand(OC.laneWidth + 0.4, OC.laneWidth + 5.6));
      });
    }
  };

  loadTreeModels = function loadTreeModelsPatched() {
    if (OC.treeLoadStarted) return;
    OC.treeLoadStarted = true;
    loadModelLibrary(ASSETS.trees, OC.treeModels, 'GLB trees');
    loadModelLibrary(ASSETS.rocks, OC.rockModels, 'GLB rocks');
    loadModelLibrary(ASSETS.details, OC.detailModels, 'GLB details');
  };

  createLayerSliders = function createLayerSlidersPatched() {
    const host = oc$('hf-layer-sliders');
    if (!host) return;
    host.innerHTML = '';
    [
      ['x', 'X', -30, 30, 0.1, 0],
      ['z', 'Z', -80, 80, 0.5, 0],
      ['y', 'Y', -10, 10, 0.1, 0],
      ['scale', 'Object Size', 0.1, 4, 0.05, 1],
      ['opacity', 'Alpha', 0, 1, 0.05, 1],
      ['brightness', 'Bright', 0.35, 2.0, 0.05, 1],
      ['contrast', 'Contrast', 0.5, 1.8, 0.05, 1],
      ['saturation', 'Saturation', 0, 2.2, 0.05, 1],
      ['tintStrength', 'Tint Amt', 0, 1, 0.05, 0],
      ['order', 'Order', -20, 40, 1, 0],
    ].forEach(([prop, label, min, max, step, fallback]) => {
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
      const layer = OC.layers.get(OC.selectedLayerId);
      if (layer && layer[prop] === undefined) layer[prop] = fallback;
    });
    const tintRow = document.createElement('label');
    tintRow.className = 'field-block';
    tintRow.innerHTML = `<span>Layer Tint</span><input id="hf-layer-tint" type="color" value="#ffffff">`;
    host.appendChild(tintRow);
    tintRow.querySelector('input').addEventListener('input', (e) => {
      const l = OC.layers.get(OC.selectedLayerId);
      if (!l) return;
      l.tint = e.target.value;
      applyLayer(l);
      drawFrame();
    });
  };

  syncLayerOutputs = function syncLayerOutputsPatched() {
    const l = OC.layers.get(OC.selectedLayerId);
    if (!l) return;
    ['x', 'z', 'y', 'scale', 'opacity', 'brightness', 'contrast', 'saturation', 'tintStrength', 'order'].forEach((prop) => {
      const out = oc$(`hf-layer-${prop}-out`);
      if (!out) return;
      const value = l[prop] ?? (['scale','opacity','brightness','contrast','saturation'].includes(prop) ? 1 : 0);
      out.textContent = prop === 'order' ? String(value) : Number(value).toFixed(2);
    });
  };

  syncLayerControls = function syncLayerControlsPatched() {
    const l = OC.layers.get(OC.selectedLayerId);
    if (!l) return;
    ['x', 'z', 'y', 'scale', 'opacity', 'brightness', 'contrast', 'saturation', 'tintStrength', 'order'].forEach((prop) => {
      const input = oc$(`hf-layer-${prop}`);
      if (!input) return;
      const value = l[prop] ?? (['scale','opacity','brightness','contrast','saturation'].includes(prop) ? 1 : 0);
      input.value = value;
    });
    const tint = oc$('hf-layer-tint');
    if (tint) tint.value = l.tint || '#ffffff';
    syncLayerOutputs();
  };

  applyLayer = function applyLayerPatched(layer) {
    if (!layer || !layer.group) return;
    layer.visible = layer.visible !== false;
    layer.opacity = layer.opacity ?? 1;
    layer.scale = layer.scale ?? 1;
    layer.brightness = layer.brightness ?? 1;
    layer.contrast = layer.contrast ?? 1;
    layer.saturation = layer.saturation ?? 1;
    layer.tintStrength = layer.tintStrength ?? 0;
    layer.tint = layer.tint || '#ffffff';
    layer.group.visible = isLayerDisplayed(layer);
    layer.group.position.set(layer.x || 0, layer.y || 0, layer.z || 0);
    layer.group.scale.setScalar(['trees', 'rocks', 'collectibles', 'obstacles', 'path'].includes(layer.id) ? 1 : (layer.scale || 1));
    layer.group.children.forEach((child) => applyLayerObjectScale(layer, child));
    layer.group.traverse((node) => {
      node.renderOrder = layer.order || 0;
      if (!node.material) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((mat) => applyMaterialVisuals(mat, layer));
    });
  };

  updateRun = function updateRunPatched(dt) {
    let steer = 0;
    if (OC.keys.has('left')) steer -= 1;
    if (OC.keys.has('right')) steer += 1;
    const sideStep = OC.currentSpeed < 1.5 ? 1.45 : 1;
    OC.player.x = clamp(OC.player.x + steer * OC.steerSpeed * sideStep * dt, -OC.laneWidth * 1.95, OC.laneWidth * 1.95);

    if (OC.keys.has('forward')) OC.targetSpeed = OC.speed;
    else if (OC.keys.has('back')) OC.targetSpeed = BACK_SPEED;
    else if (OC.startAssistTime > 0) {
      OC.targetSpeed = Math.max(6, Math.min(12, OC.speed * 0.35));
      OC.startAssistTime = Math.max(0, OC.startAssistTime - dt);
    } else OC.targetSpeed = 0;

    const status = pathStatus();
    if (status === 'off') OC.offPathTime += dt;
    else OC.offPathTime = 0;
    let cappedTarget = OC.targetSpeed;
    if (status === 'off' && cappedTarget > SLOW_TROT_SPEED) cappedTarget = SLOW_TROT_SPEED;
    if (status === 'edge' && cappedTarget > OC.speed * 0.62) cappedTarget = OC.speed * 0.62;
    const rate = Math.abs(cappedTarget) > Math.abs(OC.currentSpeed) ? ACCEL : DECEL;
    OC.currentSpeed += clamp(cappedTarget - OC.currentSpeed, -rate * dt, rate * dt);
    OC.distance = Math.max(0, OC.distance + OC.currentSpeed * dt);
    updateRideAudio();

    if (status === 'off' && OC.targetSpeed > 0) {
      playBushRustle();
      setResult('Off path: steer back toward the road.', 'warn');
    } else if (status === 'edge' && OC.targetSpeed > 0) {
      setResult('Path edge: horse slowing. Steer toward the centre.', 'warn');
    } else if (OC.lastPathStatus !== 'on' && status === 'on') {
      setResult('Back on path. Hold ↑/W to accelerate.', 'waiting');
    }
    OC.lastPathStatus = status;
    updateOffPathWarning(status);

    updatePhysics(dt);
    updateObjects();
    OC.score += dt * (status === 'off' ? 0.15 : 0.6);
    updateStats();
    if (OC.distance >= OC.courseLength) {
      OC.complete = true;
      pauseRun();
      setResult(OC.score >= OC.successScore ? 'Course complete.' : 'Course complete, but score is below target.', OC.score >= OC.successScore ? 'success' : 'failure');
    }
  };

  updateCamera = function updateCameraPatched() {
    const center = pathCenterAt(OC.distance);
    const x = center + OC.player.x;
    OC.world.position.x = -(OC.gridOffsetX || 0);
    OC.world.position.z = OC.distance - (OC.gridOffsetZ || 0);
    if (OC.grid) {
      OC.grid.visible = Boolean(OC.gridEnabled);
      OC.grid.position.set(OC.gridOffsetX || 0, GROUND_Y + 0.075, -(OC.gridOffsetZ || 0));
    }
    OC.camera.position.set(x * 0.16, 1.8 + OC.player.y * 0.55, 8.4);
    OC.camera.lookAt(x * 0.35, 0.35 + OC.player.y * 0.35, -28);
  };

  updateStats = function updateStatsPatched() {
    oc$('obstacle-score').textContent = String(Math.round(OC.score));
    oc$('obstacle-collected').textContent = String(OC.collected);
    oc$('obstacle-hits').textContent = String(OC.hits);
    oc$('obstacle-course-summary').textContent = `${Math.round(OC.distance)}m / ${Math.round(OC.courseLength)}m`;
    const speedBadge = oc$('obstacle-speed-badge');
    if (speedBadge) {
      const speed = Math.max(0, Math.round(OC.currentSpeed));
      const max = Math.max(1, OC.speed);
      const pct = clamp(speed / max, 0, 1) * 100;
      const status = pathStatus();
      const gait = status === 'off' ? 'Off Path' : speed < 3 ? 'Stopped' : speed < max * 0.45 ? 'Trot' : speed < max * 0.75 ? 'Canter' : 'Gallop';
      if (!speedBadge.querySelector('.oc-speed-fill')) {
        speedBadge.innerHTML = `<div class="oc-speed-label"><span id="oc-speed-state">Stopped</span><b id="oc-speed-value">0</b></div><div class="oc-speed-track"><div class="oc-speed-fill"></div></div><div id="oc-offpath-label" class="oc-offpath-label"></div>`;
      }
      speedBadge.querySelector('#oc-speed-state').textContent = gait;
      speedBadge.querySelector('#oc-speed-value').textContent = `${speed}/${Math.round(max)}`;
      speedBadge.querySelector('.oc-speed-fill').style.width = `${pct}%`;
    }
  };

  resetRun = function resetRunPatched(quiet = false) {
    OC.running = false;
    stopMotionLoops();
    AUDIO.wasForwardMoving = false;
    OC.complete = false;
    OC.offPathTime = 0;
    OC.lastPathStatus = 'on';
    OC.distance = 0;
    OC.currentSpeed = 0;
    OC.targetSpeed = 0;
    OC.startAssistTime = 0;
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
    updateOffPathWarning('on');
    updateStats();
    if (!quiet) setResult('Course reset. Start the test when ready.', 'waiting');
    syncRunButtons();
    drawFrame();
    drawOverview();
  };

  drawOverview = function drawOverviewPatched() {
    const c = oc$('hf-overview');
    if (!c) return;
    const wantedHeight = Math.max(300, Math.min(2200, Math.round((OC.courseLength + 300) / 3.2)));
    if (c.height !== wantedHeight) c.height = wantedHeight;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#111914';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#d09a55';
    ctx.lineWidth = 8;
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
  };

  function installFinalUiPatch() {
    injectFinalStyles();
    const overviewRow = document.querySelector('.hf-overview-row');
    if (overviewRow) overviewRow.style.gridTemplateColumns = '1fr';
    document.querySelectorAll('.hf-overview-row > .hf-key').forEach((node) => node.remove());
    const keyPanel = document.querySelector('.hf-key-panel .hf-key-list');
    if (keyPanel) {
      keyPanel.innerHTML = `<div><span class="hf-key-dot hf-key-path"></span>Path</div><div><span class="hf-key-dot hf-key-tree"></span>Tree</div><div><span class="hf-key-dot hf-key-rock"></span>Rock</div><div><span class="hf-key-dot hf-key-collectible"></span>Collectible</div><div><span class="hf-key-dot hf-key-obstacle"></span>Obstacle</div>`;
    }
    if (OC.host && !oc$('oc-offpath-arrow')) {
      const arrow = document.createElement('div');
      arrow.id = 'oc-offpath-arrow';
      arrow.className = 'oc-offpath-arrow';
      arrow.textContent = '➜';
      OC.host.appendChild(arrow);
    }
    const displayPanel = document.querySelector('[data-obstacle-panel="display"]');
    if (displayPanel && !oc$('obstacle-contrast')) {
      displayPanel.insertAdjacentHTML('beforeend', `<label class="range-row"><span>Overall Contrast <output id="obstacle-contrast-out">100%</output></span><input id="obstacle-contrast" type="range" min="55" max="160" step="5" value="100" /></label><label class="range-row"><span>Overall Saturation <output id="obstacle-saturation-out">100%</output></span><input id="obstacle-saturation" type="range" min="0" max="180" step="5" value="100" /></label><section class="hf-grid-panel"><h3>Overlay Grid</h3><label class="field-check"><input id="oc-grid-toggle" type="checkbox"> Show ground zero grid</label><label class="range-row"><span>Grid X Origin <output id="oc-grid-x-out">0.0</output></span><input id="oc-grid-x" type="range" min="-20" max="20" step="0.5" value="0"></label><label class="range-row"><span>Grid Z Origin <output id="oc-grid-z-out">0.0</output></span><input id="oc-grid-z" type="range" min="-80" max="80" step="1" value="0"></label></section>`);
      bindFinalUiControls();
    }
  }

  function bindFinalUiControls() {
    oc$('obstacle-contrast')?.addEventListener('input', (e) => { OC.screenContrast = Number(e.target.value) / 100; oc$('obstacle-contrast-out').textContent = `${e.target.value}%`; updateScreenFilters(); });
    oc$('obstacle-saturation')?.addEventListener('input', (e) => { OC.screenSaturation = Number(e.target.value) / 100; oc$('obstacle-saturation-out').textContent = `${e.target.value}%`; updateScreenFilters(); });
    oc$('oc-grid-toggle')?.addEventListener('change', (e) => { OC.gridEnabled = e.target.checked; drawFrame(); });
    oc$('oc-grid-x')?.addEventListener('input', (e) => { OC.gridOffsetX = Number(e.target.value); oc$('oc-grid-x-out').textContent = OC.gridOffsetX.toFixed(1); drawFrame(); });
    oc$('oc-grid-z')?.addEventListener('input', (e) => { OC.gridOffsetZ = Number(e.target.value); oc$('oc-grid-z-out').textContent = OC.gridOffsetZ.toFixed(1); drawFrame(); });
  }

  function injectFinalStyles() {
    if (oc$('oc-v26-final-styles')) return;
    const style = document.createElement('style');
    style.id = 'oc-v26-final-styles';
    style.textContent = `
      .obstacle-three-wrap canvas{filter:brightness(var(--oc-brightness,1)) contrast(var(--oc-contrast,1)) saturate(var(--oc-saturation,1));}
      .obstacle-horse-overlay{width:340px!important;height:388px!important;margin-left:-170px!important;bottom:-116px!important;background-size:700% 100%!important;background-position:50% 100%;}
      .obstacle-speed-badge{width:190px!important;border-radius:16px!important;padding:8px 10px!important;background:rgba(7,8,12,.84)!important;}
      .oc-speed-label{display:flex;justify-content:space-between;gap:8px;font-size:.68rem;color:#f4ead4;margin-bottom:4px}.oc-speed-label b{color:#eec45a}.oc-speed-track{height:17px;border:2px solid rgba(238,196,90,.5);border-radius:999px;background:rgba(65,12,12,.7);overflow:hidden;box-shadow:inset 0 0 7px rgba(0,0,0,.85)}.oc-speed-fill{height:100%;width:0%;border-radius:999px;background:linear-gradient(90deg,#ff1f14,#ff7a1c,#ffd35b);box-shadow:0 0 10px rgba(255,104,32,.78);transition:width .08s linear}.oc-offpath-label{min-height:16px;margin-top:3px;font-size:.72rem;font-weight:900;color:#ff4b36;text-align:center;letter-spacing:.04em}.oc-offpath-arrow{position:absolute;left:50%;top:42%;z-index:8;width:80px;height:80px;margin:-40px 0 0 -40px;display:none;place-items:center;border-radius:50%;font-size:4.4rem;font-weight:900;color:#ff3b24;text-shadow:0 2px 8px rgba(0,0,0,.9);background-image:url('../../../shared/ui/defaultarrows.webp');background-size:cover;background-position:center;animation:ocPulseArrow 0.9s ease-in-out infinite;pointer-events:none}.oc-offpath-arrow.is-visible{display:grid}.oc-offpath-arrow.is-left{transform:scaleX(-1)}@keyframes ocPulseArrow{0%,100%{translate:0 0;scale:.92}50%{translate:0 -11px;scale:1.12}}
      .hf-overview-row{grid-template-columns:1fr!important}.hf-overview-row>.hf-key{display:none!important}.hf-key-panel{border:1px solid rgba(238,196,90,.3);border-radius:12px;padding:10px;margin:10px 0;background:rgba(0,0,0,.22)}.hf-key-panel h3{margin:0 0 8px;font-family:'Cinzel',serif;font-size:.95rem}.hf-key-list{display:grid;gap:5px;font-size:.78rem}.hf-key-list div{display:flex;align-items:center;gap:8px}.hf-key-dot{width:13px;height:13px;border-radius:50%;display:inline-block;border:1px solid rgba(255,255,255,.4)}.hf-key-path{background:#d09a55}.hf-key-tree{background:#48a24a}.hf-key-rock{background:#aaa}.hf-key-collectible{background:#eec45a}.hf-key-obstacle{background:#b04b35}.hf-grid-panel{border:1px solid rgba(124,202,210,.2);border-radius:12px;padding:10px;margin-top:10px;background:rgba(0,0,0,.2)}.field-check{display:flex!important;gap:8px;align-items:center;color:var(--muted,#c9bfae);font-size:.72rem}.field-check input{width:auto!important}.oc-loading-assets{position:absolute;left:14px;top:12px;z-index:7;border:1px solid rgba(124,202,210,.35);border-radius:999px;background:rgba(5,8,13,.74);padding:7px 10px;font-size:.7rem;font-weight:900;color:#9ee6a4;pointer-events:none}.oc-loading-assets.is-ready{color:#eec45a;border-color:rgba(238,196,90,.45)}
    `;
    document.head.appendChild(style);
  }

  function createGridOverlay() {
    if (!OC.scene || OC.grid) return;
    OC.grid = new THREE.GridHelper(80, 40, 0xeec45a, 0x4c7f55);
    OC.grid.position.set(0, GROUND_Y + 0.075, 0);
    OC.grid.material.transparent = true;
    OC.grid.material.opacity = 0.55;
    OC.grid.visible = false;
    OC.scene.add(OC.grid);
  }

  function preloadEssentialAssets() {
    if (OC.assetPreloadStarted || !OC.host) return;
    OC.assetPreloadStarted = true;
    const urls = [ASSETS.horse, ASSETS.background, ASSETS.ground, ...Object.values(ASSETS.pathSegments).map((seg) => seg.file)];
    OC.assetLoadTotal = urls.length;
    OC.assetLoadDone = 0;
    OC.assetLoadFailed = 0;
    const badge = document.createElement('div');
    badge.id = 'oc-loading-assets';
    badge.className = 'oc-loading-assets';
    badge.textContent = `Loading assets 0 / ${OC.assetLoadTotal}`;
    OC.host.appendChild(badge);
    setStartButtonsDisabled(true);
    urls.forEach((url) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (img.naturalWidth < 1) OC.assetLoadFailed += 1;
        OC.assetLoadDone += 1;
        badge.textContent = `Loading assets ${OC.assetLoadDone} / ${OC.assetLoadTotal}`;
        if (OC.assetLoadDone >= OC.assetLoadTotal) {
          OC.assetsEssentialReady = true;
          badge.classList.add('is-ready');
          badge.textContent = OC.assetLoadFailed ? `Assets loaded (${OC.assetLoadFailed} missing)` : 'Assets loaded';
          setStartButtonsDisabled(false);
          setTimeout(() => badge.remove(), 2600);
        }
      };
      img.src = `${url}?preload=${Date.now()}`;
    });
  }

  function setStartButtonsDisabled(disabled) {
    ['obstacle-start','obstacle-start-left'].forEach((id) => {
      const button = oc$(id);
      if (button) {
        button.disabled = disabled;
        button.textContent = disabled ? 'Loading Assets…' : 'Start Test';
      }
    });
  }

  function loadModelLibrary(urls, bucket, label) {
    urls.forEach((url) => OC.gltfLoader.load(`${url}?v=29.2`, (gltf) => {
      if (!gltf.scene) return;
      gltf.scene.traverse((node) => { if (node.isMesh) node.receiveShadow = true; });
      bucket.push(gltf.scene);
      if (oc$('hf-tree-status')) oc$('hf-tree-status').textContent = `${label}: ${bucket.length} loaded`;
      if (OC.active) regenerateCourse();
    }, undefined, (error) => console.warn('[HorseForest] GLB failed:', url, error)));
  }

  function createModelFromBucket(bucket, targetHeight) {
    if (!bucket?.length) return null;
    const root = pick(bucket).clone(true);
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
    wrapper.rotation.y = rand(0, Math.PI * 2);
    wrapper.scale.multiplyScalar(rand(0.82, 1.18));
    return wrapper;
  }

  function createFallbackTree(targetHeight) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, targetHeight * 0.45, 8), new THREE.MeshLambertMaterial({ color: 0x4f2e18 }));
    trunk.position.y = targetHeight * 0.225;
    const crown = new THREE.Mesh(new THREE.ConeGeometry(targetHeight * 0.18, targetHeight * 0.65, 9), new THREE.MeshLambertMaterial({ color: 0x183c1d }));
    crown.position.y = targetHeight * 0.72;
    group.add(trunk, crown);
    return group;
  }

  function addDetailAt(parent, distance, side, extra) {
    const detail = createModelFromBucket(OC.detailModels, rand(0.45, 1.1));
    if (!detail) return;
    const x = pathCenterAt(distance) + side * extra;
    detail.position.set(x, GROUND_Y, -distance);
    detail.rotation.y = rand(0, Math.PI * 2);
    parent.add(detail);
    OC.placed.push({ type: 'rock', x, z: -distance, mesh: detail });
  }

  function applyMaterialVisuals(mat, layer) {
    if (!mat.userData) mat.userData = {};
    if (mat.color && !mat.userData.__ocBaseColor) mat.userData.__ocBaseColor = mat.color.clone();
    mat.transparent = layer.opacity < 1 || mat.transparent;
    mat.opacity = layer.opacity;
    if (mat.color && mat.userData.__ocBaseColor) {
      const base = mat.userData.__ocBaseColor.clone();
      const hsl = { h: 0, s: 0, l: 0 };
      base.getHSL(hsl);
      hsl.s = clamp(hsl.s * (layer.saturation ?? 1), 0, 1);
      hsl.l = clamp(((hsl.l - 0.5) * (layer.contrast ?? 1)) + 0.5, 0, 1);
      base.setHSL(hsl.h, hsl.s, hsl.l);
      base.multiplyScalar(layer.brightness ?? 1);
      if (layer.tint && layer.tintStrength > 0) base.lerp(new THREE.Color(layer.tint), layer.tintStrength);
      mat.color.copy(base);
    }
    mat.needsUpdate = true;
  }

  function updateOffPathWarning(status) {
    const arrow = oc$('oc-offpath-arrow');
    const label = oc$('oc-offpath-label');
    if (!arrow || !label) return;
    if (status === 'off' && OC.offPathTime >= 5) {
      const goRight = OC.player.x < 0;
      arrow.classList.add('is-visible');
      arrow.classList.toggle('is-left', !goRight);
      label.textContent = goRight ? 'Off Path 👉' : '👈 Off Path';
    } else {
      arrow.classList.remove('is-visible');
      label.textContent = status === 'off' ? 'Off Path' : '';
    }
  }

  const oldUpdateScreenFilters = updateScreenFilters;
  updateScreenFilters = function updateScreenFiltersPatched() {
    oldUpdateScreenFilters();
    if (OC.host) {
      OC.host.style.setProperty('--oc-contrast', String(OC.screenContrast || 1));
      OC.host.style.setProperty('--oc-saturation', String(OC.screenSaturation || 1));
    }
  };
})();


// --- V2.6.2 obstacle-course view, GLB asset, collectible, and arrow patch ---
(function installObstacleCourseV262Patch(){
  if (OC.__v262PatchInstalled) return;
  OC.__v262PatchInstalled = true;

  OC.versionLabel = 'V2.6.2';
  OC.vanishX = OC.vanishX ?? 0;
  OC.vanishY = OC.vanishY ?? 0.35;
  OC.whiteBackground = false;
  OC.glbAssetControls = OC.glbAssetControls || new Map();
  OC.glbInstances = OC.glbInstances || [];
  OC.glbSelectionHelpers = OC.glbSelectionHelpers || [];
  OC.selectedGlbAssetUrl = OC.selectedGlbAssetUrl || '';
  OC.collectibleModels = OC.collectibleModels || [];

  ASSETS.collectibleModels = [
    `${ASSET_BASE}3d/stylized_glowing_mushrooms.glb`,
    `${ASSET_BASE}3d/moneysack.glb`,
  ];
  ASSETS.details = [
    `${ASSET_BASE}3d/low_poly_fern.glb`,
  ];

  const GLB_ASSET_URLS = [
    ...(ASSETS.trees || []),
    ...(ASSETS.rocks || []),
    ...(ASSETS.details || []),
    ...(ASSETS.collectibleModels || []),
  ];

  const fileName = (url) => String(url || '').split('/').pop() || String(url || 'GLB asset');

  function glbControl(url) {
    const key = url || '__none__';
    if (!OC.glbAssetControls.has(key)) {
      OC.glbAssetControls.set(key, {
        x: 0,
        y: 0,
        z: 0,
        scale: 1,
        opacity: 1,
        brightness: 1,
        contrast: 1,
        saturation: 1,
        tintStrength: 0,
        tint: '#ffffff',
        order: 18,
      });
    }
    return OC.glbAssetControls.get(key);
  }

  function makeModelEntry(url, gltf) {
    return { url, name: fileName(url), scene: gltf.scene };
  }

  function loadCatalog(urls, bucket, label) {
    urls.forEach((url) => {
      if (bucket.some((entry) => entry.url === url)) return;
      OC.gltfLoader.load(`${url}?v=2.6.2`, (gltf) => {
        if (!gltf.scene) return;
        gltf.scene.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            if (node.material) {
              const mats = Array.isArray(node.material) ? node.material : [node.material];
              mats.forEach((mat) => {
                if (mat.color && !mat.userData?.__ocBaseColor) {
                  mat.userData = mat.userData || {};
                  mat.userData.__ocBaseColor = mat.color.clone();
                }
              });
            }
          }
        });
        bucket.push(makeModelEntry(url, gltf));
        if (oc$('hf-tree-status')) oc$('hf-tree-status').textContent = `${label}: ${bucket.length} loaded`;
        refreshGlbAssetSelectOptions();
        if (OC.active) regenerateCourse();
      }, undefined, (error) => console.warn('[HorseForest] GLB failed:', url, error));
    });
  }

  loadTreeModels = function loadTreeModelsV262() {
    if (OC.treeLoadStarted) return;
    OC.treeLoadStarted = true;
    loadCatalog(ASSETS.trees || [], OC.treeModels, 'GLB trees');
    loadCatalog(ASSETS.rocks || [], OC.rockModels, 'GLB rocks');
    loadCatalog(ASSETS.details || [], OC.detailModels, 'GLB ferns');
    loadCatalog(ASSETS.collectibleModels || [], OC.collectibleModels, 'GLB collectibles');
  };

  function createGlbModel(bucket, targetHeight) {
    if (!bucket?.length) return null;
    const entry = pick(bucket);
    const root = entry.scene.clone(true);
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const scale = targetHeight / Math.max(size.y, 0.001);
    root.scale.multiplyScalar(scale);
    root.updateMatrixWorld(true);
    const box2 = new THREE.Box3().setFromObject(root);
    const wrapper = new THREE.Group();
    wrapper.userData.glbAssetUrl = entry.url;
    wrapper.userData.glbAssetName = entry.name;
    wrapper.add(root);
    root.position.set(-(box2.min.x + box2.max.x) / 2, -box2.min.y, -(box2.min.z + box2.max.z) / 2);
    wrapper.rotation.y = rand(0, Math.PI * 2);
    wrapper.scale.multiplyScalar(rand(0.88, 1.15));
    wrapper.traverse((node) => {
      node.userData = node.userData || {};
      node.userData.glbAssetUrl = entry.url;
      node.userData.glbAssetName = entry.name;
    });
    return wrapper;
  }

  function createSimpleTree(targetHeight) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, targetHeight * 0.45, 8), new THREE.MeshLambertMaterial({ color: 0x4f2e18 }));
    trunk.position.y = targetHeight * 0.225;
    const crown = new THREE.Mesh(new THREE.ConeGeometry(targetHeight * 0.18, targetHeight * 0.65, 9), new THREE.MeshLambertMaterial({ color: 0x183c1d }));
    crown.position.y = targetHeight * 0.72;
    group.add(trunk, crown);
    return group;
  }

  function registerGlbInstance(obj, type, x, z) {
    if (!obj) return;
    obj.userData = obj.userData || {};
    obj.userData.ocType = type;
    obj.userData.basePosition = obj.position.clone();
    obj.userData.baseScale = obj.scale.clone();
    if (obj.userData.glbAssetUrl) OC.glbInstances.push(obj);
    OC.placed.push({ type, x, z, mesh: obj });
    applyGlbAssetControls(obj);
  }

  function applyGlbAssetControls(obj) {
    const url = obj?.userData?.glbAssetUrl;
    if (!url) return;
    const cfg = glbControl(url);
    const basePosition = obj.userData.basePosition || obj.position.clone();
    const baseScale = obj.userData.baseScale || obj.scale.clone();
    obj.position.set(basePosition.x + cfg.x, basePosition.y + cfg.y, basePosition.z + cfg.z);
    obj.scale.copy(baseScale).multiplyScalar(cfg.scale || 1);
    obj.renderOrder = cfg.order || 0;
    obj.traverse((node) => {
      node.renderOrder = cfg.order || 0;
      if (!node.material) return;
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((mat) => applyMaterialVisuals(mat, cfg));
    });
  }

  function applyAllGlbAssetControls() {
    (OC.glbInstances || []).forEach((obj) => applyGlbAssetControls(obj));
    refreshGlbSelectionBoxes();
  }

  const priorClearWorld = clearWorld;
  clearWorld = function clearWorldV262() {
    clearGlbSelectionBoxes();
    OC.glbInstances = [];
    priorClearWorld();
  };

  createModelTree = function createModelTreeV262(targetHeight) {
    return createGlbModel(OC.treeModels, targetHeight) || createSimpleTree(targetHeight);
  };

  createRock = function createRockV262() {
    const model = createGlbModel(OC.rockModels, rand(0.9, 1.8));
    if (model) return model;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rand(0.45, 0.75), 0), new THREE.MeshLambertMaterial({ color: Math.random() < 0.5 ? 0x62655c : 0x3e443a, flatShading: true }));
    rock.scale.set(rand(0.8, 1.4), rand(0.45, 0.9), rand(0.75, 1.3));
    rock.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    return rock;
  };

  addTreeAt = function addTreeAtV262(parent, distance, side, height, extra) {
    const tree = createModelTree(height);
    if (!tree) return;
    const x = pathCenterAt(distance) + side * extra;
    tree.position.set(x, GROUND_Y, -distance);
    tree.rotation.y = rand(0, Math.PI * 2);
    tree.rotation.x = rand(-0.04, 0.04);
    tree.rotation.z = rand(-0.025, 0.025);
    tree.scale.multiplyScalar(rand(0.86, 1.18));
    parent.add(tree);
    registerGlbInstance(tree, 'tree', x, -distance);
  };

  function addFernAt(parent, distance, side, extra) {
    const fern = createGlbModel(OC.detailModels, rand(0.65, 1.25));
    if (!fern) return;
    const x = pathCenterAt(distance) + side * extra;
    fern.position.set(x, GROUND_Y + 0.02, -distance);
    fern.rotation.y = rand(0, Math.PI * 2);
    parent.add(fern);
    registerGlbInstance(fern, 'rock', x, -distance);
  }

  scatterForestFloorDetail = function scatterForestFloorDetailV262(parent) {
    for (let d = 12; d < OC.courseLength + 260; d += rand(5, 9)) {
      [-1, 1].forEach((side) => {
        if (Math.random() < 0.42) {
          addSceneryRock(parent, pathCenterAt(d) + side * rand(OC.laneWidth + 1.0, OC.laneWidth + 5.2), d + rand(-4, 4));
        }
        if (Math.random() < 0.92) {
          addFernAt(parent, d + rand(-4, 4), side, rand(OC.laneWidth * 0.96, OC.laneWidth * 1.32));
        }
      });
    }
  };

  const priorAddSceneryRock = addSceneryRock;
  addSceneryRock = function addSceneryRockV262(parent, x, distance) {
    const rock = createRock();
    rock.position.set(x, GROUND_Y + 0.18, -distance);
    rock.scale.multiplyScalar(rand(0.55, 0.95));
    parent.add(rock);
    registerGlbInstance(rock, 'rock', x, -distance);
  };

  addCollectibles = function addCollectiblesV262(count) {
    const parent = OC.layers.get('collectibles')?.group || OC.world;
    const targetCount = Math.max(4, Math.round(count * 0.55));
    const fallbackGeo = new THREE.OctahedronGeometry(0.42, 0);
    for (let i = 0; i < targetCount; i += 1) {
      const distance = 45 + Math.random() * Math.max(30, OC.courseLength - 90);
      const center = pathCenterAt(distance);
      const obj = createGlbModel(OC.collectibleModels, Math.random() < 0.56 ? rand(1.2, 1.8) : rand(0.75, 1.25)) || new THREE.Mesh(fallbackGeo, new THREE.MeshBasicMaterial({ color: 0xeec45a, transparent: true, opacity: 0.9 }));
      const x = center + pick([-0.22, 0, 0.22]) * OC.laneWidth;
      obj.position.set(x, GROUND_Y + rand(0.12, 0.55), -distance);
      obj.rotation.y = rand(0, Math.PI * 2);
      obj.userData.kind = 'collectible';
      obj.userData.collected = false;
      obj.userData.radius = 1.15;
      parent.add(obj);
      OC.objects.push(obj);
      registerGlbInstance(obj, 'collectible', obj.position.x, obj.position.z);
    }
  };

  function clearGlbSelectionBoxes() {
    (OC.glbSelectionHelpers || []).forEach((helper) => {
      helper.parent?.remove(helper);
      helper.geometry?.dispose?.();
      helper.material?.dispose?.();
    });
    OC.glbSelectionHelpers = [];
  }

  function refreshGlbSelectionBoxes() {
    clearGlbSelectionBoxes();
    if (!OC.scene || !OC.selectedGlbAssetUrl) return;
    (OC.glbInstances || []).forEach((obj) => {
      if (!obj?.visible || obj.userData?.glbAssetUrl !== OC.selectedGlbAssetUrl) return;
      const helper = new THREE.BoxHelper(obj, 0xeec45a);
      helper.userData.isGlbSelectionHelper = true;
      OC.scene.add(helper);
      OC.glbSelectionHelpers.push(helper);
    });
  }

  function updateGlbSelectionBoxes() {
    (OC.glbSelectionHelpers || []).forEach((helper) => helper.update?.());
  }

  const priorDrawFrame = drawFrame;
  drawFrame = function drawFrameV262(dt = 0) {
    priorDrawFrame(dt);
    updateGlbSelectionBoxes();
  };

  function buildGlbAssetControls(host) {
    host.innerHTML = '';
    const selector = document.createElement('label');
    selector.className = 'field-block';
    selector.innerHTML = `<span>GLB Asset</span><select id="hf-glb-asset-select"></select>`;
    host.appendChild(selector);
    refreshGlbAssetSelectOptions();
    const select = selector.querySelector('select');
    select.addEventListener('change', (event) => {
      OC.selectedGlbAssetUrl = event.target.value;
      syncLayerControls();
      applyAllGlbAssetControls();
      drawFrame();
    });
    if (!OC.selectedGlbAssetUrl && select.options.length) OC.selectedGlbAssetUrl = select.value;
    select.value = OC.selectedGlbAssetUrl;

    [
      ['x', 'X', -30, 30, 0.1, 0],
      ['z', 'Z', -80, 80, 0.5, 0],
      ['y', 'Y', -10, 10, 0.1, 0],
      ['scale', 'Object Size', 0.1, 8, 0.05, 1],
      ['opacity', 'Alpha', 0, 1, 0.05, 1],
      ['brightness', 'Bright', 0.1, 10, 0.05, 1],
      ['contrast', 'Contrast', 0.1, 4, 0.05, 1],
      ['saturation', 'Saturation', 0, 6, 0.05, 1],
      ['tintStrength', 'Tint Amt', 0, 1, 0.05, 0],
      ['order', 'Order', -20, 80, 1, 18],
    ].forEach(([prop, label, min, max, step, fallback]) => {
      const row = document.createElement('div');
      row.className = 'hf-slider-row';
      row.innerHTML = `<span>${label}</span><input id="hf-glb-${prop}" type="range" min="${min}" max="${max}" step="${step}"><output id="hf-glb-${prop}-out"></output>`;
      host.appendChild(row);
      row.querySelector('input').addEventListener('input', (event) => {
        const cfg = glbControl(OC.selectedGlbAssetUrl);
        cfg[prop] = Number(event.target.value);
        syncGlbOutputs();
        applyAllGlbAssetControls();
        drawFrame();
        drawOverview();
      });
      const cfg = glbControl(OC.selectedGlbAssetUrl);
      if (cfg[prop] === undefined) cfg[prop] = fallback;
    });
    const tintRow = document.createElement('label');
    tintRow.className = 'field-block';
    tintRow.innerHTML = `<span>GLB Tint</span><input id="hf-glb-tint" type="color" value="#ffffff">`;
    host.appendChild(tintRow);
    tintRow.querySelector('input').addEventListener('input', (event) => {
      const cfg = glbControl(OC.selectedGlbAssetUrl);
      cfg.tint = event.target.value;
      applyAllGlbAssetControls();
      drawFrame();
    });
    syncGlbControls();
    refreshGlbSelectionBoxes();
  }

  function refreshGlbAssetSelectOptions() {
    const select = oc$('hf-glb-asset-select');
    if (!select) return;
    const urls = Array.from(new Set([...GLB_ASSET_URLS, ...(OC.glbInstances || []).map((obj) => obj.userData.glbAssetUrl).filter(Boolean)]));
    const previous = select.value || OC.selectedGlbAssetUrl || urls[0] || '';
    select.innerHTML = '';
    urls.forEach((url) => {
      const opt = document.createElement('option');
      opt.value = url;
      opt.textContent = fileName(url);
      select.appendChild(opt);
    });
    OC.selectedGlbAssetUrl = urls.includes(previous) ? previous : (urls[0] || '');
    select.value = OC.selectedGlbAssetUrl;
  }

  function syncGlbOutputs() {
    const cfg = glbControl(OC.selectedGlbAssetUrl);
    ['x', 'z', 'y', 'scale', 'opacity', 'brightness', 'contrast', 'saturation', 'tintStrength', 'order'].forEach((prop) => {
      const out = oc$(`hf-glb-${prop}-out`);
      if (!out) return;
      const value = cfg[prop] ?? (['scale','opacity','brightness','contrast','saturation'].includes(prop) ? 1 : 0);
      out.textContent = prop === 'order' ? String(value) : Number(value).toFixed(2);
    });
  }

  function syncGlbControls() {
    const cfg = glbControl(OC.selectedGlbAssetUrl);
    ['x', 'z', 'y', 'scale', 'opacity', 'brightness', 'contrast', 'saturation', 'tintStrength', 'order'].forEach((prop) => {
      const input = oc$(`hf-glb-${prop}`);
      if (!input) return;
      input.value = cfg[prop] ?? (['scale','opacity','brightness','contrast','saturation'].includes(prop) ? 1 : 0);
    });
    const tint = oc$('hf-glb-tint');
    if (tint) tint.value = cfg.tint || '#ffffff';
    syncGlbOutputs();
  }

  const priorCreateLayerSliders = createLayerSliders;
  createLayerSliders = function createLayerSlidersV262() {
    const host = oc$('hf-layer-sliders');
    if (!host) return;
    if (OC.selectedLayerId === 'glbAsset') return buildGlbAssetControls(host);
    priorCreateLayerSliders();
  };

  populateLayerSelect = function populateLayerSelectV262() {
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
    const glbOpt = document.createElement('option');
    glbOpt.value = 'glbAsset';
    glbOpt.textContent = 'GLB Asset';
    select.appendChild(glbOpt);
    OC.selectedLayerId = previous === 'glbAsset' || OC.layers.has(previous) ? previous : 'path';
    select.value = OC.selectedLayerId;
    createLayerSliders();
    syncLayerControls();
  };

  const priorSyncLayerControls = syncLayerControls;
  syncLayerControls = function syncLayerControlsV262() {
    if (OC.selectedLayerId === 'glbAsset') return syncGlbControls();
    clearGlbSelectionBoxes();
    priorSyncLayerControls();
  };

  const priorSyncLayerOutputs = syncLayerOutputs;
  syncLayerOutputs = function syncLayerOutputsV262() {
    if (OC.selectedLayerId === 'glbAsset') return syncGlbOutputs();
    priorSyncLayerOutputs();
  };

  const priorUpdateCamera = updateCamera;
  updateCamera = function updateCameraV262() {
    const center = pathCenterAt(OC.distance);
    const x = center + OC.player.x;
    OC.world.position.x = -(OC.gridOffsetX || 0);
    OC.world.position.z = OC.distance - (OC.gridOffsetZ || 0);
    if (OC.grid) {
      OC.grid.visible = Boolean(OC.gridEnabled);
      OC.grid.position.set(OC.gridOffsetX || 0, GROUND_Y + 0.075, -(OC.gridOffsetZ || 0));
    }
    OC.camera.position.set(x * 0.16, 1.8 + OC.player.y * 0.55, 8.4);
    OC.camera.lookAt((x * 0.35) + (OC.vanishX || 0), (OC.vanishY ?? 0.35) + OC.player.y * 0.35, -28);
  };

  updateOffPathWarning = function updateOffPathWarningV262(status) {
    const arrow = oc$('oc-offpath-arrow');
    const label = oc$('oc-offpath-label');
    if (!arrow || !label) return;
    arrow.textContent = '';
    if (status === 'off' && OC.offPathTime >= 2) {
      const goRight = OC.player.x < 0;
      arrow.classList.add('is-visible');
      arrow.classList.toggle('dir-right', goRight);
      arrow.classList.toggle('dir-left', !goRight);
      label.textContent = goRight ? 'Off Path →' : '← Off Path';
    } else {
      arrow.classList.remove('is-visible', 'dir-right', 'dir-left');
      label.textContent = status === 'off' ? 'Off Path' : '';
    }
  };

  const priorEnsureMounted = ensureMounted;
  ensureMounted = function ensureMountedV262() {
    priorEnsureMounted();
    installV262Ui();
  };

  function installV262Ui() {
    injectV262Styles();
    document.querySelectorAll('.obstacle-reticle').forEach((node) => node.remove());
    const title = document.querySelector('.obstacle-header-line .eyebrow');
    if (title) title.textContent = 'Obstacle Course · V2.6.2';
    document.querySelectorAll('.status-pill').forEach((node) => { if (/V2\.6/.test(node.textContent)) node.textContent = 'V2.6.2'; });
    if (OC.host) {
      const arrow = oc$('oc-offpath-arrow') || document.createElement('div');
      arrow.id = 'oc-offpath-arrow';
      arrow.className = 'oc-offpath-arrow';
      arrow.textContent = '';
      if (!arrow.parentElement) OC.host.appendChild(arrow);
    }
    const displayPanel = document.querySelector('[data-obstacle-panel="display"]');
    if (displayPanel && !oc$('oc-vanish-x')) {
      displayPanel.insertAdjacentHTML('beforeend', `<section class="hf-grid-panel"><h3>Vanishing Point</h3><label class="range-row"><span>VP X <output id="oc-vanish-x-out">0.0</output></span><input id="oc-vanish-x" type="range" min="-12" max="12" step="0.1" value="0"></label><label class="range-row"><span>VP Y <output id="oc-vanish-y-out">0.35</output></span><input id="oc-vanish-y" type="range" min="-3" max="8" step="0.05" value="0.35"></label></section>`);
      oc$('oc-vanish-x')?.addEventListener('input', (event) => { OC.vanishX = Number(event.target.value); oc$('oc-vanish-x-out').textContent = OC.vanishX.toFixed(1); drawFrame(); });
      oc$('oc-vanish-y')?.addEventListener('input', (event) => { OC.vanishY = Number(event.target.value); oc$('oc-vanish-y-out').textContent = OC.vanishY.toFixed(2); drawFrame(); });
    }
    const bright = oc$('obstacle-brightness');
    if (bright) {
      bright.max = '1000';
      if (Number(bright.value) > 1000) bright.value = '1000';
    }
    const bgButton = oc$('hf-bg-white');
    if (bgButton && !bgButton.dataset.ocV262Bound) {
      bgButton.dataset.ocV262Bound = '1';
      bgButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        OC.whiteBackground = !OC.whiteBackground;
        if (OC.scene) OC.scene.background = OC.whiteBackground ? new THREE.Color(0xffffff) : loadTexture(ASSETS.background);
        bgButton.classList.toggle('is-running', OC.whiteBackground);
        drawFrame();
      }, true);
    }
    const layerSelect = oc$('hf-layer-select');
    if (layerSelect && ![...layerSelect.options].some((opt) => opt.value === 'glbAsset')) populateLayerSelect();
  }

  function injectV262Styles() {
    if (oc$('oc-v262-styles')) return;
    const style = document.createElement('style');
    style.id = 'oc-v262-styles';
    style.textContent = `
      .obstacle-reticle{display:none!important}
      .oc-offpath-arrow{position:absolute!important;left:50%!important;top:42%!important;z-index:8!important;width:148px!important;height:148px!important;margin:-74px 0 0 -74px!important;display:none;background-image:url('../../../shared/ui/defaultarrows.webp')!important;background-repeat:no-repeat!important;background-size:200% 200%!important;background-color:transparent!important;border:0!important;border-radius:0!important;color:transparent!important;text-shadow:none!important;filter:drop-shadow(0 9px 12px rgba(0,0,0,.82));animation:ocPulseArrowClean .9s ease-in-out infinite;pointer-events:none!important}.oc-offpath-arrow.is-visible{display:block!important}.oc-offpath-arrow.dir-left{background-position:0% 100%!important}.oc-offpath-arrow.dir-right{background-position:100% 100%!important}@keyframes ocPulseArrowClean{0%,100%{transform:translateY(0) scale(.92)}50%{transform:translateY(-11px) scale(1.12)}}
      .hf-glb-selected-note{margin:7px 0 0;color:#eec45a;font-size:.68rem;line-height:1.25}.hf-layer-panel option[value="glbAsset"]{font-weight:900;color:#eec45a}.obstacle-three-wrap canvas{filter:brightness(var(--oc-brightness,1)) contrast(var(--oc-contrast,1)) saturate(var(--oc-saturation,1))!important;}
    `;
    document.head.appendChild(style);
  }

  const priorUpdateScreenFilters2 = updateScreenFilters;
  updateScreenFilters = function updateScreenFiltersV262() {
    priorUpdateScreenFilters2();
    if (OC.host) {
      OC.host.style.setProperty('--oc-contrast', String(OC.screenContrast || 1));
      OC.host.style.setProperty('--oc-saturation', String(OC.screenSaturation || 1));
    }
  };
})();
