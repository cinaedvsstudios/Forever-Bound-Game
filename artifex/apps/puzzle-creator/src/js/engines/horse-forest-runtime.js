// Obstacle Course / Horse Forest Runner V13
// Layered 2.5D forest-path runner for Puzzle Creator.
// Visual stack: sky -> low horizon treeline -> moving path/grass -> side treelines/trunks/ferns -> obstacle cards.

const HORSE_VERSION = 'v13-layered-path-forest';
const ASSET_ROOT = './assets/obstacle-course/horse-forest/';

const ASSETS = {
  sky: ['sky/forest_sky_clouds_1920x1080.png'],
  path: ['ground/forest_floor_roots_tile_placeholder_1254.png'],
  grassLeft: ['ground/forest_floor_grass.png', 'ground/forest_floor_roots_tile_placeholder_1254.png'],
  grassRight: ['ground/forest_floor_grass2.png', 'ground/forest_floor_grass.png', 'ground/forest_floor_roots_tile_placeholder_1254.png'],
  horizon: ['trees/treeline_spruce_alpha_2048x1024.png', 'trees/treeline_pine_alpha_625x350.png'],
  sideLine: ['trees/treeline_pine_alpha_625x350.png', 'trees/treeline_spruce_alpha_2048x1024.png'],
  fern: ['ground/fern.png', 'trees/fern.png'],
  trunks: ['trees/treetexture1.png', 'trees/treetexture2.png', 'trees/treetexture3.png'],
  logs: ['obstacles/logs/obstacle_log_bark_01.png', 'obstacles/logs/obstacle_log_branch_01.png', 'obstacles/logs/obstacle_log_cut_01.png'],
  rocks: ['obstacles/rocks/obstacle_rock_flat_01.png', 'obstacles/rocks/obstacle_rock_medium_01.png', 'obstacles/rocks/obstacle_rock_tall_01.png'],
  branches: ['obstacles/branches/obstacle_low_branch_01.png', 'obstacles/branches/obstacle_overhead_branch_placeholder_01.png', 'branches/branch_overhead_leafy_01.png'],
  collectibles: ['collectibles/flowers/collectible_blue_wildflower_01.png', 'collectibles/flowers/collectible_pink_wildflower_01.png', 'collectibles/ingredients/collectible_herb_bundle_01.png', 'collectibles/charms/collectible_forest_charm_01.png'],
};

const Horse = {
  mounted: false,
  active: false,
  running: false,
  raf: null,
  lastTick: 0,
  distance: 0,
  courseLength: 2880,
  speed: 265,
  duration: 80,
  difficulty: 2,
  score: 0,
  hits: 0,
  jumps: 0,
  collected: 0,
  successScore: 20,
  playerX: 0,
  playerY: 0,
  playerVY: 0,
  onGround: true,
  keys: new Set(),
  cards: [],
  scenery: [],
  stage: null,
  panels: null,
  world: null,
  result: null,
};

const $ = (id) => document.getElementById(id);
const asset = (path) => `${ASSET_ROOT}${path}`;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function setBackgroundFromCandidates(element, candidates, fallbackColor = '') {
  if (!element || !Array.isArray(candidates) || !candidates.length) return;
  let index = 0;
  const tryCandidate = () => {
    const path = candidates[index];
    const image = new Image();
    image.onload = () => {
      element.style.backgroundImage = `url("${asset(path)}")`;
    };
    image.onerror = () => {
      index += 1;
      if (index < candidates.length) tryCandidate();
      else if (fallbackColor) element.style.backgroundColor = fallbackColor;
    };
    image.src = asset(path);
  };
  tryCandidate();
}

function injectHorseStyles() {
  if ($('horse-forest-v13-styles')) return;
  const style = document.createElement('style');
  style.id = 'horse-forest-v13-styles';
  style.textContent = `
    .is-horse-forest .right-preview-layout,
    .is-horse-forest .overview-window,
    .is-horse-forest #puzzle-launcher-panel,
    .is-horse-forest #puzzle-module-brief-page{display:none!important}
    .is-horse-forest .left-panel-body>[data-panel-content],
    .is-horse-forest [data-workflow-menu],
    .is-horse-forest [data-workflow-only]{display:none!important}
    .horse13-stage{height:100%;min-height:calc(100vh - 120px);overflow:auto;padding:18px 20px 22px;color:var(--cream,#f4ead4);background:radial-gradient(circle at 50% 0%,rgba(109,181,115,.16),transparent 34%),#06100a}
    .horse13-grid{display:grid;grid-template-columns:minmax(620px,1fr) 300px;gap:14px;align-items:start}
    .horse13-card,.horse13-side{border:1px solid rgba(154,230,164,.25);border-radius:16px;background:rgba(6,18,10,.88);box-shadow:0 14px 36px rgba(0,0,0,.32)}
    .horse13-card{padding:16px;display:flex;flex-direction:column;gap:12px}
    .horse13-head{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(154,230,164,.18);padding-bottom:12px}
    .horse13-head h2{margin:2px 0 0;font-family:'Cinzel',Georgia,serif;font-size:1.36rem;line-height:1.1}
    .horse13-head p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}
    .horse13-pill{align-self:flex-start;border:1px solid rgba(238,196,90,.36);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .horse13-view{position:relative;height:500px;overflow:hidden;border:1px solid rgba(154,230,164,.22);border-radius:18px;background:#101810;isolation:isolate;user-select:none}
    .horse13-sky{position:absolute;left:0;right:0;top:0;height:31%;background-repeat:no-repeat;background-size:cover;background-position:center 28%;z-index:0;filter:brightness(.52) saturate(.75)}
    .horse13-skyshade{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(1,8,6,.18),rgba(1,8,6,.1) 24%,rgba(1,8,6,.5) 38%,transparent 54%),radial-gradient(ellipse at center,transparent 35%,rgba(1,8,5,.45));z-index:1;pointer-events:none}
    .horse13-horizon{position:absolute;left:-10%;right:-10%;top:15%;height:23%;background-repeat:repeat-x;background-size:auto 100%;background-position:center bottom;z-index:2;filter:brightness(.58) saturate(.8);opacity:.95;pointer-events:none}
    .horse13-horizon:after{content:'';position:absolute;left:0;right:0;bottom:-20px;height:48px;background:linear-gradient(to bottom,rgba(4,14,8,.02),rgba(6,17,10,.84),rgba(3,9,5,.24))}
    .horse13-fog{position:absolute;left:0;right:0;top:24%;height:22%;background:linear-gradient(to bottom,rgba(192,216,205,.07),rgba(170,195,183,.2) 40%,rgba(20,45,27,.08) 66%,transparent);z-index:3;pointer-events:none}
    .horse13-ground{position:absolute;left:-8%;right:-8%;top:30%;bottom:-10%;background:#26301f;z-index:4;overflow:hidden;pointer-events:none}
    .horse13-grass-l,.horse13-grass-r{position:absolute;top:-20%;bottom:-18%;width:58%;background-repeat:repeat;background-size:420px 420px;filter:saturate(.9) brightness(.68);transform-origin:center top;transform:perspective(720px) rotateX(57deg) scale(1.2);opacity:.92}
    .horse13-grass-l{left:-15%;clip-path:polygon(0 0,80% 0,100% 100%,0 100%)}
    .horse13-grass-r{right:-15%;clip-path:polygon(20% 0,100% 0,100% 100%,0 100%)}
    .horse13-path{position:absolute;top:-7%;bottom:-25%;left:30%;right:30%;background-color:#4a351f;background-repeat:repeat;background-size:430px 430px;clip-path:polygon(43% 0,57% 0,100% 100%,0 100%);transform-origin:center top;transform:perspective(710px) rotateX(59deg) scale(1.12);filter:saturate(.84) brightness(.82);z-index:2}
    .horse13-pathshade{position:absolute;left:25%;right:25%;top:30%;bottom:-2%;clip-path:polygon(44% 0,56% 0,100% 100%,0 100%);background:linear-gradient(to right,rgba(0,0,0,.18),transparent 15%,rgba(255,220,160,.08) 49%,transparent 67%,rgba(0,0,0,.18)),linear-gradient(to bottom,rgba(10,15,8,.18),transparent 46%,rgba(2,4,2,.62));z-index:6;pointer-events:none}
    .horse13-mid{position:absolute;left:50%;top:33%;bottom:8%;width:1px;background:linear-gradient(to bottom,rgba(235,220,156,.2),rgba(235,220,156,.04) 28%,transparent);box-shadow:-105px 90px 0 rgba(235,220,156,.05),105px 90px 0 rgba(235,220,156,.05);z-index:7;pointer-events:none}
    .horse13-groundshade{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(104,72,43,.08),rgba(5,14,8,.16) 42%,rgba(5,10,6,.68) 90%),linear-gradient(to bottom,rgba(5,15,8,0),rgba(4,8,5,.48));z-index:8;pointer-events:none}
    .horse13-world{position:absolute;inset:0;z-index:9;overflow:hidden;pointer-events:none}
    .horse13-obj{position:absolute;left:50%;top:50%;width:var(--w,90px);height:var(--h,90px);margin-left:calc(var(--w,90px)/-2);margin-top:calc(var(--h,90px)/-2);background-repeat:no-repeat;background-position:center bottom;background-size:contain;transform:translate3d(var(--x,0px),var(--y,0px),0) scale(var(--s,1));transform-origin:center bottom;filter:drop-shadow(0 8px 8px rgba(0,0,0,.42));will-change:transform,opacity}
    .horse13-obj[data-kind='collectible']{filter:drop-shadow(0 0 8px rgba(238,196,90,.85)) drop-shadow(0 4px 6px rgba(0,0,0,.38))}
    .horse13-obj[data-kind='fern']{filter:drop-shadow(0 7px 7px rgba(0,0,0,.44));opacity:.82}
    .horse13-obj[data-kind='side-line']{filter:brightness(.62) saturate(.9) drop-shadow(0 9px 10px rgba(0,0,0,.6))}
    .horse13-obj[data-kind='trunk']{background-size:cover;background-position:center;border-radius:48% 48% 9% 9% / 4% 4% 3% 3%;box-shadow:inset 18px 0 20px rgba(255,255,255,.08),inset -18px 0 26px rgba(0,0,0,.42),0 22px 26px rgba(0,0,0,.55);filter:brightness(.68) saturate(.84)}
    .horse13-horse{position:absolute;left:50%;bottom:-10px;width:230px;height:116px;transform:translateX(-50%);z-index:30;pointer-events:none;opacity:.9}
    .horse13-horse:before,.horse13-horse:after{content:'';position:absolute;bottom:0;width:92px;height:102px;border-radius:48% 48% 30% 30%;background:linear-gradient(135deg,#4a2b1a,#27150d);box-shadow:inset 0 10px 20px rgba(255,255,255,.09)}
    .horse13-horse:before{left:28px;transform:rotate(-10deg);clip-path:polygon(30% 0,60% 0,84% 100%,10% 100%)}
    .horse13-horse:after{right:28px;transform:rotate(10deg);clip-path:polygon(40% 0,70% 0,90% 100%,16% 100%)}
    .horse13-reticle{position:absolute;left:50%;top:64%;width:44px;height:14px;margin-left:-22px;margin-top:-7px;border:1px solid rgba(238,196,90,.72);border-radius:50%;box-shadow:0 0 18px rgba(238,196,90,.24);z-index:31;pointer-events:none}
    .horse13-reticle:after{content:'';position:absolute;left:50%;top:-18px;width:1px;height:52px;background:rgba(238,196,90,.7)}
    .horse13-hud{position:absolute;left:14px;right:14px;bottom:10px;display:flex;justify-content:space-between;gap:12px;z-index:32;color:var(--cream,#f4ead4);font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.9);pointer-events:none}
    .horse13-help{display:flex;justify-content:space-between;gap:12px;color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.35}
    .horse13-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
    .horse13-controls button,.horse13-mini button{min-height:42px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}
    .horse13-side{padding:16px 14px;display:flex;flex-direction:column;gap:11px}.horse13-side h3{margin:0;font-family:'Cinzel',Georgia,serif;font-size:1.03rem}
    .horse13-metric{display:flex;justify-content:space-between;border:1px solid rgba(154,230,164,.2);border-radius:11px;padding:10px;color:var(--muted,#c9bfae);font-size:.76rem}.horse13-metric strong{color:var(--cream,#f4ead4)}
    .horse13-result{min-height:64px;border:1px solid rgba(154,230,164,.22);border-radius:11px;padding:11px;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.4}.horse13-result[data-state='waiting']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}.horse13-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.horse13-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}
    .horse13-copy{margin:0 0 14px;font-size:.73rem;line-height:1.46;color:var(--muted,#c9bfae)}.horse13-list{max-height:220px;overflow:auto;border:1px solid rgba(154,230,164,.17);border-radius:11px;padding:10px;background:rgba(20,35,24,.35);color:var(--muted,#c9bfae);font-size:.7rem;line-height:1.42}.horse13-list code{color:#9ee6a4;word-break:break-all}.horse13-mini{display:grid;grid-template-columns:1fr 1fr;gap:8px}@media(max-width:1080px){.horse13-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function buildHorseDom() {
  const rightPanel = document.querySelector('.right-panel');
  const leftBody = document.querySelector('.left-panel-body');
  if (!rightPanel || !leftBody) return false;

  Horse.stage = document.createElement('section');
  Horse.stage.id = 'horse-forest-v13-stage';
  Horse.stage.className = 'horse13-stage';
  Horse.stage.hidden = true;
  Horse.stage.innerHTML = `<div class="horse13-grid"><section class="horse13-card"><div class="horse13-head"><div><p class="eyebrow">Obstacle Course · Horse Forest Runner V13</p><h2>Horse Forest Ride</h2><p>Ride forward through the forest path. Jump logs and rocks, avoid branches, and collect flowers, herbs and charms.</p></div><span id="horse13-status" class="horse13-pill">Ready</span></div><div id="horse13-view" class="horse13-view"><div id="horse13-sky" class="horse13-sky"></div><div class="horse13-skyshade"></div><div id="horse13-horizon" class="horse13-horizon"></div><div class="horse13-fog"></div><div class="horse13-ground"><div id="horse13-grass-l" class="horse13-grass-l"></div><div id="horse13-grass-r" class="horse13-grass-r"></div><div id="horse13-path" class="horse13-path"></div></div><div class="horse13-pathshade"></div><div class="horse13-mid"></div><div class="horse13-groundshade"></div><div id="horse13-world" class="horse13-world"></div><div class="horse13-horse"></div><div class="horse13-reticle"></div><div class="horse13-hud"><span>WASD / arrows steer · Space jumps</span><span id="horse13-distance">0m / 2880m</span></div></div><div class="horse13-help"><span>Sky → low treeline → moving path/grass → side trees/trunks/ferns → obstacles.</span><span>Designed for the new texture assets.</span></div><div class="horse13-controls"><button id="horse13-start" type="button">Start Test</button><button id="horse13-pause" type="button">Pause</button><button id="horse13-reset" type="button">Reset Run</button></div></section><aside class="horse13-side"><p class="eyebrow">Ride Result</p><h3>Score</h3><div class="horse13-metric"><span>Score</span><strong id="horse13-score">0</strong></div><div class="horse13-metric"><span>Collected</span><strong id="horse13-collected">0</strong></div><div class="horse13-metric"><span>Hits</span><strong id="horse13-hits">0</strong></div><div class="horse13-metric"><span>Jumps</span><strong id="horse13-jumps">0</strong></div><div class="horse13-metric"><span>Target Score</span><strong id="horse13-target">20</strong></div><div id="horse13-result" class="horse13-result" data-state="waiting">Course waiting. Start the test when ready.</div></aside></div>`;
  rightPanel.prepend(Horse.stage);

  Horse.panels = document.createElement('div');
  Horse.panels.id = 'horse-forest-v13-panels';
  Horse.panels.hidden = true;
  Horse.panels.innerHTML = `<section class="panel tool-panel" data-horse13-panel="build"><div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Horse Forest</h2></div><span class="status-pill is-waiting">V13</span></div><p class="horse13-copy">POV horse-riding obstacle course with path, side grass, horizon treeline, passing trunks and ferns.</p><label class="range-row"><span>Course Duration <output id="horse13-duration-out">80s</output></span><input id="horse13-duration" type="range" min="20" max="100" step="5" value="80"></label><label class="range-row"><span>Difficulty <output id="horse13-difficulty-out">2</output></span><input id="horse13-difficulty" type="range" min="1" max="5" value="2"></label><button id="horse13-regenerate" class="wide-button" type="button">Regenerate Forest Ride</button></section><section class="panel tool-panel" data-horse13-panel="display" hidden><div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Scene Layers</h2></div></div><p class="horse13-copy">The new image names are wired. Upload them to the listed folders and hard refresh.</p><div id="horse13-list" class="horse13-list"></div><button id="horse13-apply" class="wide-button" type="button">Re-apply Layer Paths</button></section><section class="panel tool-panel" data-horse13-panel="logic" hidden><div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Scoring + Events</h2></div></div><p class="horse13-copy">Collectible +5. Obstacle hit -1. Finish resolves by target score.</p><label class="range-row"><span>Success Score <output id="horse13-success-score-out">20</output></span><input id="horse13-success-score" type="range" min="0" max="80" step="5" value="20"></label><label class="field-block"><span>Success Event ID</span><input id="horse13-success-event" type="text" value="horse_forest_success"></label><label class="field-block"><span>Failure Event ID</span><input id="horse13-failure-event" type="text" value="horse_forest_failure"></label></section><section class="panel tool-panel" data-horse13-panel="visuals" hidden><div class="panel-title-row"><div><p class="eyebrow">04 · Assets</p><h2>Density</h2></div></div><p class="horse13-copy">Side scenery is generated as moving cards: trunks, fern clumps and distant pine strips.</p><div class="horse13-mini"><button id="horse13-more-obstacles" type="button">More Obstacles</button><button id="horse13-more-scenery" type="button">More Scenery</button></div></section>`;
  leftBody.appendChild(Horse.panels);
  Horse.world = $('horse13-world');
  Horse.result = $('horse13-result');
  bindHorseControls();
  return true;
}

function bindHorseControls() {
  $('horse13-start')?.addEventListener('click', startRun);
  $('horse13-pause')?.addEventListener('click', pauseRun);
  $('horse13-reset')?.addEventListener('click', () => resetRun(false));
  $('horse13-regenerate')?.addEventListener('click', regenerateCourse);
  $('horse13-apply')?.addEventListener('click', () => { applyLayers(); setResult('Layer paths applied.', 'waiting'); });
  $('horse13-more-obstacles')?.addEventListener('click', () => { addObstacles(8); renderCards(); });
  $('horse13-more-scenery')?.addEventListener('click', () => { addScenery(18); renderCards(); });
  $('horse13-duration')?.addEventListener('input', (event) => { Horse.duration = Number(event.target.value); $('horse13-duration-out').textContent = `${Horse.duration}s`; Horse.courseLength = Math.round(Horse.duration * 36); regenerateCourse(); });
  $('horse13-difficulty')?.addEventListener('input', (event) => { Horse.difficulty = Number(event.target.value); $('horse13-difficulty-out').textContent = String(Horse.difficulty); regenerateCourse(); });
  $('horse13-success-score')?.addEventListener('input', (event) => { Horse.successScore = Number(event.target.value); $('horse13-success-score-out').textContent = String(Horse.successScore); updateStats(); });
  window.addEventListener('keydown', (event) => {
    if (!Horse.active) return;
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w','s','A','D','W','S',' '].includes(event.key)) {
      event.preventDefault();
      if (event.key === ' ') jumpHorse();
      else Horse.keys.add(event.key.toLowerCase());
    }
  });
  window.addEventListener('keyup', (event) => Horse.keys.delete(event.key.toLowerCase()));
  document.querySelector('.left-icon-bar')?.addEventListener('click', (event) => {
    if (!Horse.active) return;
    const button = event.target.closest('.panel-nav-button');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showHorsePanel(button.dataset.panel);
  }, true);
}

function ensureHorseMounted() {
  if (Horse.mounted) return true;
  injectHorseStyles();
  if (!buildHorseDom()) return false;
  Horse.mounted = true;
  return true;
}

function openHorseForestRunner() {
  if (!ensureHorseMounted()) return;
  Horse.active = true;
  document.body.classList.add('is-horse-forest');
  document.body.classList.remove('is-obstacle-course','is-pattern-lock','is-potion-match','is-puzzle-chooser','is-puzzle-brief');
  $('puzzle-launcher-panel')?.setAttribute('hidden','');
  $('puzzle-module-brief-page')?.setAttribute('hidden','');
  Horse.stage.hidden = false;
  Horse.panels.hidden = false;
  showHorsePanel('build');
  applyLayers();
  regenerateCourse();
}

function closeHorseForestRunner() {
  if (!Horse.mounted) return;
  pauseRun();
  Horse.active = false;
  Horse.stage.hidden = true;
  Horse.panels.hidden = true;
  document.body.classList.remove('is-horse-forest');
}

function applyLayers() {
  setBackgroundFromCandidates($('horse13-sky'), ASSETS.sky, '#1d2b35');
  setBackgroundFromCandidates($('horse13-horizon'), ASSETS.horizon, '#0b1d10');
  setBackgroundFromCandidates($('horse13-path'), ASSETS.path, '#4a351f');
  setBackgroundFromCandidates($('horse13-grass-l'), ASSETS.grassLeft, '#1d2e16');
  setBackgroundFromCandidates($('horse13-grass-r'), ASSETS.grassRight, '#1d2e16');
  updateAssetList();
}

function regenerateCourse() {
  pauseRun();
  Horse.courseLength = Math.round(Horse.duration * 36);
  Horse.cards = [];
  Horse.scenery = [];
  Horse.world.innerHTML = '';
  addScenery(54 + Horse.difficulty * 18);
  addObstacles(10 + Horse.difficulty * 7);
  addCollectibles(10 + Horse.difficulty * 5);
  resetRun(true);
  setResult('Forest ride regenerated. Start the test when ready.', 'waiting');
  renderCards();
}

function createCard(kind, path, x, z, width, height, options = {}) {
  const el = document.createElement('div');
  el.className = 'horse13-obj';
  el.dataset.kind = kind;
  if (path) el.style.backgroundImage = `url("${asset(path)}")`;
  el.style.setProperty('--w', `${width}px`);
  el.style.setProperty('--h', `${height}px`);
  const card = {
    el,
    kind,
    path,
    x,
    z,
    y: options.y ?? 0,
    width,
    height,
    hit: false,
    collected: false,
    gameplay: Boolean(options.gameplay),
    jumpable: Boolean(options.jumpable),
    duckable: Boolean(options.duckable),
    score: options.score ?? 0,
    penalty: options.penalty ?? 0,
    radius: options.radius ?? 56,
    phase: Math.random() * Math.PI * 2,
    playerFactor: options.playerFactor ?? 0.82,
  };
  Horse.world.appendChild(el);
  return card;
}

function addScenery(count) {
  for (let i = 0; i < count; i += 1) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const z = 70 + Math.random() * (Horse.courseLength + 420);
    const roll = Math.random();
    if (roll < 0.2) {
      Horse.scenery.push(createCard('side-line', ASSETS.sideLine[0], side * (460 + Math.random() * 850), z, 430 + Math.random() * 180, 155 + Math.random() * 60, { y: -26, playerFactor: 0.3 }));
    } else if (roll < 0.55) {
      const near = Math.random() < 0.62;
      const x = side * ((near ? 365 : 600) + Math.random() * 520);
      const width = 44 + Math.random() * 78;
      const height = 320 + Math.random() * 430;
      Horse.scenery.push(createCard('trunk', pick(ASSETS.trunks), x, z, width, height, { y: -128, playerFactor: 0.22 }));
    } else {
      const size = 70 + Math.random() * 110;
      Horse.scenery.push(createCard('fern', ASSETS.fern[0], side * (190 + Math.random() * 520), z, size, size, { y: 40 + Math.random() * 34, playerFactor: 0.52 }));
    }
  }
}

function addObstacles(count) {
  for (let i = 0; i < count; i += 1) {
    const z = 110 + Math.random() * (Horse.courseLength - 80);
    const lane = (Math.floor(Math.random() * 3) - 1) * 155 + (Math.random() - 0.5) * 45;
    const branch = Math.random() < 0.28;
    if (branch) {
      Horse.cards.push(createCard('branch', pick(ASSETS.branches), lane, z, 270, 105, { y: -92, duckable: true, gameplay: true, penalty: -1, radius: 58 }));
    } else {
      const isLog = Math.random() < 0.62;
      Horse.cards.push(createCard('obstacle', isLog ? pick(ASSETS.logs) : pick(ASSETS.rocks), lane, z, isLog ? 250 : 130, isLog ? 105 : 120, { y: 38, jumpable: true, gameplay: true, penalty: -1, radius: 62 }));
    }
  }
}

function addCollectibles(count) {
  for (let i = 0; i < count; i += 1) {
    const z = 90 + Math.random() * (Horse.courseLength - 80);
    const lane = (Math.floor(Math.random() * 3) - 1) * 140 + (Math.random() - 0.5) * 60;
    const path = pick(ASSETS.collectibles);
    const size = path.includes('charm') ? 64 : 58;
    Horse.cards.push(createCard('collectible', path, lane, z, size, size, { y: Math.random() < 0.34 ? -88 : 24, gameplay: true, score: 5, radius: 42 }));
  }
}

function resetRun(quiet = false) {
  Horse.running = false;
  Horse.lastTick = 0;
  Horse.distance = 0;
  Horse.score = 0;
  Horse.hits = 0;
  Horse.jumps = 0;
  Horse.collected = 0;
  Horse.playerX = 0;
  Horse.playerY = 0;
  Horse.playerVY = 0;
  Horse.onGround = true;
  for (const card of [...Horse.cards, ...Horse.scenery]) {
    card.hit = false;
    card.collected = false;
    card.el.style.display = '';
  }
  updateStats();
  updateGroundScroll();
  renderCards();
  if (!quiet) setResult('Course reset. Start the test when ready.', 'waiting');
}

function startRun() {
  if (Horse.running) return;
  Horse.running = true;
  Horse.lastTick = performance.now();
  $('horse13-status').textContent = 'Riding';
  setResult('Ride running. Steer left/right and press Space to jump.', 'waiting');
  Horse.raf = requestAnimationFrame(tickRun);
}

function pauseRun() {
  Horse.running = false;
  if (Horse.raf) cancelAnimationFrame(Horse.raf);
  Horse.raf = null;
  if ($('horse13-status')) $('horse13-status').textContent = 'Paused';
}

function jumpHorse() {
  if (!Horse.running || !Horse.onGround) return;
  Horse.playerVY = 560;
  Horse.onGround = false;
  Horse.jumps += 1;
  updateStats();
}

function tickRun(now) {
  if (!Horse.running) return;
  const dt = Math.min(0.05, (now - Horse.lastTick) / 1000 || 0.016);
  Horse.lastTick = now;
  updateHorse(dt);
  checkCollisions();
  renderCards();
  updateStats();
  if (Horse.distance >= Horse.courseLength) {
    finishRun();
    return;
  }
  Horse.raf = requestAnimationFrame(tickRun);
}

function updateHorse(dt) {
  let steer = 0;
  if (Horse.keys.has('arrowleft') || Horse.keys.has('a')) steer -= 1;
  if (Horse.keys.has('arrowright') || Horse.keys.has('d')) steer += 1;
  let speedMod = 1;
  if (Horse.keys.has('arrowup') || Horse.keys.has('w')) speedMod = 1.18;
  if (Horse.keys.has('arrowdown') || Horse.keys.has('s')) speedMod = 0.76;
  Horse.playerX = clamp(Horse.playerX + steer * 360 * dt, -235, 235);
  Horse.playerVY -= 1100 * dt;
  Horse.playerY += Horse.playerVY * dt;
  if (Horse.playerY <= 0) {
    Horse.playerY = 0;
    Horse.playerVY = 0;
    Horse.onGround = true;
  }
  Horse.distance += Horse.speed * speedMod * dt;
  updateGroundScroll();
}

function updateGroundScroll() {
  const fast = Math.round(Horse.distance * 1.55);
  const slow = Math.round(Horse.distance * 0.62);
  if ($('horse13-path')) $('horse13-path').style.backgroundPosition = `center ${fast}px`;
  if ($('horse13-grass-l')) $('horse13-grass-l').style.backgroundPosition = `${-slow}px ${fast}px`;
  if ($('horse13-grass-r')) $('horse13-grass-r').style.backgroundPosition = `${slow}px ${Math.round(fast * 0.9)}px`;
}

function projectDepth(z) {
  const rel = z - Horse.distance;
  if (rel < -95 || rel > 1180) return null;
  const t = 1 - clamp(rel / 1180, 0, 1);
  return {
    rel,
    t,
    scale: 0.1 + t * 2.12,
    screenY: 164 + t * 320,
    laneSpread: 0.18 + t * 1.78,
  };
}

function renderCards() {
  const sorted = [...Horse.scenery, ...Horse.cards].sort((a, b) => b.z - a.z);
  const now = performance.now();
  for (const card of sorted) {
    if (card.hit || card.collected) {
      card.el.style.display = 'none';
      continue;
    }
    const projected = projectDepth(card.z);
    if (!projected) {
      card.el.style.display = 'none';
      continue;
    }
    card.el.style.display = '';
    const x = (card.x - Horse.playerX * card.playerFactor) * projected.laneSpread;
    const bob = card.kind === 'collectible' ? Math.sin(now * 0.005 + card.phase) * 8 : 0;
    const yFactor = card.kind === 'obstacle' ? 0.32 : card.kind === 'trunk' ? 0.04 : 0.1;
    const y = projected.screenY + card.y - Horse.playerY * yFactor + bob;
    const boost = card.kind === 'trunk' ? 1.2 : card.kind === 'side-line' ? 1.05 : 1;
    card.el.style.setProperty('--x', `${x}px`);
    card.el.style.setProperty('--y', `${y}px`);
    card.el.style.setProperty('--s', `${projected.scale * boost}`);
    card.el.style.opacity = String(card.kind === 'trunk' ? clamp(projected.t * 2.15, 0.12, 0.98) : card.kind === 'side-line' ? clamp(projected.t * 1.8, 0.12, 0.84) : clamp(projected.t * 1.9, 0.16, 1));
    card.el.style.zIndex = String(Math.round(projected.t * 1000));
  }
}

function checkCollisions() {
  for (const card of Horse.cards) {
    if (!card.gameplay || card.hit || card.collected) continue;
    const projected = projectDepth(card.z);
    if (!projected || projected.rel >= 38 || projected.rel <= -20) continue;
    const screenX = (card.x - Horse.playerX * card.playerFactor) * projected.laneSpread;
    if (Math.abs(screenX) >= card.radius * projected.scale) continue;
    if (card.kind === 'collectible') {
      card.collected = true;
      Horse.collected += 1;
      Horse.score += card.score || 5;
      continue;
    }
    const avoided = (card.jumpable && Horse.playerY > 72) || (card.duckable && Horse.playerY < 12);
    if (!avoided) {
      card.hit = true;
      Horse.hits += 1;
      Horse.score += card.penalty || -1;
    }
  }
}

function finishRun() {
  Horse.running = false;
  if (Horse.raf) cancelAnimationFrame(Horse.raf);
  Horse.raf = null;
  if (Horse.score >= Horse.successScore) {
    $('horse13-status').textContent = 'Success';
    setResult(`Success event: ${$('horse13-success-event')?.value || 'horse_forest_success'} · Score ${Horse.score}`, 'success');
  } else {
    $('horse13-status').textContent = 'Failure';
    setResult(`Failure event: ${$('horse13-failure-event')?.value || 'horse_forest_failure'} · Score ${Horse.score}`, 'failure');
  }
}

function updateStats() {
  if (!$('horse13-score')) return;
  $('horse13-score').textContent = String(Horse.score);
  $('horse13-collected').textContent = String(Horse.collected);
  $('horse13-hits').textContent = String(Horse.hits);
  $('horse13-jumps').textContent = String(Horse.jumps);
  $('horse13-target').textContent = String(Horse.successScore);
  $('horse13-distance').textContent = `${Math.round(Horse.distance)}m / ${Horse.courseLength}m`;
}

function setResult(text, state = 'waiting') {
  if (!Horse.result) return;
  Horse.result.textContent = text;
  Horse.result.dataset.state = state;
}

function showHorsePanel(panelId) {
  if (!Horse.panels) return;
  Horse.panels.querySelectorAll('[data-horse13-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.horse13Panel !== panelId;
    panel.classList.toggle('is-active', panel.dataset.horse13Panel === panelId);
  });
  document.querySelectorAll('.panel-nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.panel === panelId));
}

function updateAssetList() {
  const target = $('horse13-list');
  if (!target) return;
  const rows = [
    ['Sky', ASSETS.sky],
    ['Path ground', ASSETS.path],
    ['Side grass', [...ASSETS.grassLeft, ...ASSETS.grassRight]],
    ['Horizon treeline', ASSETS.horizon],
    ['Side treeline', ASSETS.sideLine],
    ['Trunk textures', ASSETS.trunks],
    ['Fern card', ASSETS.fern],
    ['Logs', ASSETS.logs],
    ['Rocks', ASSETS.rocks],
    ['Branches', ASSETS.branches],
    ['Collectibles', ASSETS.collectibles],
  ];
  target.innerHTML = rows.map(([label, values]) => `<strong>${label}</strong><br><code>${values.join('<br>')}</code>`).join('<hr>');
}

function interceptObstacleCourseClick(event) {
  const button = event.target.closest("[data-engine='obstacle-course']");
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach((candidate) => {
    const active = candidate.dataset.engine === 'obstacle-course';
    candidate.classList.toggle('is-active', active);
    candidate.classList.toggle('is-selected', active);
  });
  openHorseForestRunner();
}

function renameObstacleCourseMenu() {
  document.querySelectorAll("[data-engine='obstacle-course']").forEach((button) => {
    button.querySelector('strong, .puzzle-type-title, h3')?.replaceChildren(document.createTextNode('Horse Forest Ride'));
    const small = button.querySelector('small, p');
    if (small) small.textContent = 'Ride through a forest path, jump obstacles and collect ingredients.';
  });
}

function bootHorseForestRunner() {
  document.addEventListener('click', interceptObstacleCourseClick, true);
  renameObstacleCourseMenu();
  setTimeout(renameObstacleCourseMenu, 400);
  setTimeout(renameObstacleCourseMenu, 1200);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootHorseForestRunner, { once: true });
} else {
  bootHorseForestRunner();
}

window.__artifexHorseForestRunner = {
  version: HORSE_VERSION,
  open: openHorseForestRunner,
  close: closeHorseForestRunner,
  regenerate: regenerateCourse,
  getState: () => ({
    version: HORSE_VERSION,
    distance: Horse.distance,
    courseLength: Horse.courseLength,
    score: Horse.score,
    hits: Horse.hits,
    jumps: Horse.jumps,
    collected: Horse.collected,
    successScore: Horse.successScore,
    assetRoot: ASSET_ROOT,
  }),
};
