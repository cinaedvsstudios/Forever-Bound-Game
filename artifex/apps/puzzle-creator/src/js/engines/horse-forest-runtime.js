// Obstacle Course / Horse Forest Runner V11
// 2.5D ground-only runner for Puzzle Creator.
// Sky and repeated forest photo-card layers have been removed because they created visible pasted rectangles.

const HORSE_VERSION = 'v11-ground-only';
const ASSET_ROOT = './assets/obstacle-course/horse-forest/';

const HORSE_ASSETS = {
  ground: 'ground/forest_floor_roots_tile_placeholder_1254.png',
  logs: [
    'obstacles/logs/obstacle_log_bark_01.png',
    'obstacles/logs/obstacle_log_branch_01.png',
    'obstacles/logs/obstacle_log_cut_01.png',
  ],
  rocks: [
    'obstacles/rocks/obstacle_rock_flat_01.png',
    'obstacles/rocks/obstacle_rock_medium_01.png',
    'obstacles/rocks/obstacle_rock_tall_01.png',
  ],
  branches: [
    'obstacles/branches/obstacle_low_branch_01.png',
    'branches/branch_overhead_leafy_01.png',
  ],
  collectibles: [
    'collectibles/flowers/collectible_blue_wildflower_01.png',
    'collectibles/flowers/collectible_pink_wildflower_01.png',
    'collectibles/ingredients/collectible_herb_bundle_01.png',
    'collectibles/charms/collectible_forest_charm_01.png',
  ],
};

const Horse = {
  mounted: false,
  active: false,
  running: false,
  raf: null,
  lastTime: 0,
  distance: 0,
  courseLength: 1600,
  speed: 250,
  difficulty: 2,
  duration: 45,
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
  stage: null,
  panels: null,
  viewport: null,
  ground: null,
  world: null,
  result: null,
};

const $ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const asset = (path) => `${ASSET_ROOT}${path}`;
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function injectHorseStyles() {
  if ($('horse-forest-v11-styles')) return;
  const style = document.createElement('style');
  style.id = 'horse-forest-v11-styles';
  style.textContent = `
    .is-horse-forest .right-preview-layout,.is-horse-forest .overview-window,.is-horse-forest #puzzle-launcher-panel,.is-horse-forest #puzzle-module-brief-page{display:none!important}
    .is-horse-forest .left-panel-body>[data-panel-content],.is-horse-forest [data-workflow-menu],.is-horse-forest [data-workflow-only]{display:none!important}
    .horse-v11-stage{height:100%;min-height:calc(100vh - 120px);overflow:auto;padding:18px 20px 22px;color:var(--cream,#f4ead4);background:radial-gradient(circle at 50% 0%,rgba(109,181,115,.16),transparent 34%),#06100a}
    .horse-v11-workspace{display:grid;grid-template-columns:minmax(620px,1fr) 300px;gap:14px;align-items:start}
    .horse-v11-view-card,.horse-v11-side-card{border:1px solid rgba(154,230,164,.25);border-radius:16px;background:rgba(6,18,10,.88);box-shadow:0 14px 36px rgba(0,0,0,.32)}
    .horse-v11-view-card{padding:16px;display:flex;flex-direction:column;gap:12px}.horse-v11-header{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(154,230,164,.18);padding-bottom:12px}.horse-v11-header h2{margin:2px 0 0;font-family:'Cinzel',Georgia,serif;font-size:1.36rem;line-height:1.1}.horse-v11-header p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}.horse-v11-pill{align-self:flex-start;border:1px solid rgba(238,196,90,.36);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .horse-v11-viewport{position:relative;height:500px;overflow:hidden;border:1px solid rgba(154,230,164,.22);border-radius:18px;background:#172016;isolation:isolate;user-select:none}
    .horse-v11-ground{position:absolute;inset:-12% -22% -26% -22%;background-color:#26301f;background-repeat:repeat;background-size:360px 360px;background-position:center 0;transform-origin:center 40%;transform:perspective(780px) rotateX(48deg) scale(1.22);z-index:1;filter:saturate(.82) brightness(.78)}
    .horse-v11-ground-fill{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(76,63,39,.15),rgba(5,14,8,.72) 72%),linear-gradient(to bottom,rgba(20,32,20,.7),rgba(16,18,11,.24) 34%,rgba(7,12,7,.62));z-index:2;pointer-events:none}
    .horse-v11-distance-fog{position:absolute;left:0;right:0;top:0;height:48%;background:linear-gradient(to bottom,rgba(19,32,23,.92),rgba(64,75,56,.44) 58%,rgba(64,75,56,.04));z-index:3;pointer-events:none}
    .horse-v11-path{position:absolute;left:35%;right:35%;top:18%;height:92%;transform-origin:top center;transform:perspective(640px) rotateX(54deg);background:linear-gradient(to right,transparent,rgba(58,38,22,.2) 9%,rgba(58,38,22,.42) 50%,rgba(58,38,22,.2) 91%,transparent),repeating-linear-gradient(to bottom,rgba(255,255,255,.05) 0 2px,transparent 2px 34px);z-index:4;opacity:.7;pointer-events:none}
    .horse-v11-world{position:absolute;inset:0;z-index:5;overflow:hidden;pointer-events:none}.horse-v11-card{position:absolute;left:50%;top:50%;width:var(--w,90px);height:var(--h,90px);margin-left:calc(var(--w,90px)/-2);margin-top:calc(var(--h,90px)/-2);background-repeat:no-repeat;background-position:center bottom;background-size:contain;transform:translate3d(var(--x,0px),var(--y,0px),0) scale(var(--s,1));transform-origin:center bottom;filter:drop-shadow(0 8px 8px rgba(0,0,0,.42));will-change:transform,opacity}.horse-v11-card[data-kind='collectible']{filter:drop-shadow(0 0 8px rgba(238,196,90,.85)) drop-shadow(0 4px 6px rgba(0,0,0,.38))}.horse-v11-card[data-kind='branch']{transform-origin:center center}
    .horse-v11-horse{position:absolute;left:50%;bottom:-10px;width:230px;height:116px;transform:translateX(-50%);z-index:30;pointer-events:none;opacity:.9}.horse-v11-horse:before,.horse-v11-horse:after{content:'';position:absolute;bottom:0;width:92px;height:102px;border-radius:48% 48% 30% 30%;background:linear-gradient(135deg,#4a2b1a,#27150d);box-shadow:inset 0 10px 20px rgba(255,255,255,.09)}.horse-v11-horse:before{left:28px;transform:rotate(-10deg);clip-path:polygon(30% 0,60% 0,84% 100%,10% 100%)}.horse-v11-horse:after{right:28px;transform:rotate(10deg);clip-path:polygon(40% 0,70% 0,90% 100%,16% 100%)}.horse-v11-reticle{position:absolute;left:50%;top:66%;width:44px;height:14px;margin-left:-22px;margin-top:-7px;border:1px solid rgba(238,196,90,.72);border-radius:50%;box-shadow:0 0 18px rgba(238,196,90,.24);z-index:31;pointer-events:none}.horse-v11-reticle:after{content:'';position:absolute;left:50%;top:-18px;width:1px;height:52px;background:rgba(238,196,90,.7)}.horse-v11-hud{position:absolute;left:14px;right:14px;bottom:10px;display:flex;justify-content:space-between;gap:12px;z-index:32;color:var(--cream,#f4ead4);font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.9);pointer-events:none}
    .horse-v11-help{display:flex;justify-content:space-between;gap:12px;color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.35}.horse-v11-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.horse-v11-controls button,.horse-v11-mini-grid button{min-height:42px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.horse-v11-side-card{padding:16px 14px;display:flex;flex-direction:column;gap:11px}.horse-v11-side-card h3{margin:0;font-family:'Cinzel',Georgia,serif;font-size:1.03rem}.horse-v11-metric{display:flex;justify-content:space-between;border:1px solid rgba(154,230,164,.2);border-radius:11px;padding:10px;color:var(--muted,#c9bfae);font-size:.76rem}.horse-v11-metric strong{color:var(--cream,#f4ead4)}.horse-v11-result{min-height:64px;border:1px solid rgba(154,230,164,.22);border-radius:11px;padding:11px;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.4}.horse-v11-result[data-state='waiting']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}.horse-v11-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.horse-v11-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}.horse-v11-panel-copy{margin:0 0 14px;font-size:.73rem;line-height:1.46;color:var(--muted,#c9bfae)}.horse-v11-asset-list{max-height:220px;overflow:auto;border:1px solid rgba(154,230,164,.17);border-radius:11px;padding:10px;background:rgba(20,35,24,.35);color:var(--muted,#c9bfae);font-size:.7rem;line-height:1.42}.horse-v11-asset-list code{color:#9ee6a4;word-break:break-all}.horse-v11-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}@media(max-width:1080px){.horse-v11-workspace{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function buildHorseDom() {
  const rightPanel = document.querySelector('.right-panel');
  const leftBody = document.querySelector('.left-panel-body');
  if (!rightPanel || !leftBody) {
    console.warn('[HorseForestV11] Missing Puzzle Creator panels.');
    return false;
  }

  Horse.stage = document.createElement('section');
  Horse.stage.id = 'horse-forest-v11-stage';
  Horse.stage.className = 'horse-v11-stage';
  Horse.stage.hidden = true;
  Horse.stage.innerHTML = `<div class="horse-v11-workspace"><section class="horse-v11-view-card"><div class="horse-v11-header"><div><p class="eyebrow">Obstacle Course · Horse Forest Runner V11</p><h2>Horse Forest Ride</h2><p>Ride forward across the forest floor. Jump logs and rocks, avoid branches, and collect flowers, herbs and charms.</p></div><span id="horse-v11-status" class="horse-v11-pill">Ready</span></div><div id="horse-v11-viewport" class="horse-v11-viewport"><div id="horse-v11-ground" class="horse-v11-ground"></div><div class="horse-v11-ground-fill"></div><div class="horse-v11-distance-fog"></div><div class="horse-v11-path"></div><div id="horse-v11-world" class="horse-v11-world"></div><div class="horse-v11-horse"></div><div class="horse-v11-reticle"></div><div class="horse-v11-hud"><span>WASD / arrows steer · Space jumps</span><span id="horse-v11-distance">0m / 1600m</span></div></div><div class="horse-v11-help"><span>Ground-only renderer: sky and repeated forest-photo cards are removed.</span><span>Only the forest floor tile, obstacles and collectibles render now.</span></div><div class="horse-v11-controls"><button id="horse-v11-start" type="button">Start Test</button><button id="horse-v11-pause" type="button">Pause</button><button id="horse-v11-reset" type="button">Reset Run</button></div></section><aside class="horse-v11-side-card"><p class="eyebrow">Ride Result</p><h3>Score</h3><div class="horse-v11-metric"><span>Score</span><strong id="horse-v11-score">0</strong></div><div class="horse-v11-metric"><span>Collected</span><strong id="horse-v11-collected">0</strong></div><div class="horse-v11-metric"><span>Hits</span><strong id="horse-v11-hits">0</strong></div><div class="horse-v11-metric"><span>Jumps</span><strong id="horse-v11-jumps">0</strong></div><div class="horse-v11-metric"><span>Target Score</span><strong id="horse-v11-target">20</strong></div><div id="horse-v11-result" class="horse-v11-result" data-state="waiting">Course waiting. Start the test when ready.</div></aside></div>`;
  rightPanel.prepend(Horse.stage);

  Horse.panels = document.createElement('div');
  Horse.panels.id = 'horse-forest-v11-panels';
  Horse.panels.hidden = true;
  Horse.panels.innerHTML = `<section class="panel tool-panel horse-v11-panel" data-horse-v11-panel="build"><div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Horse Forest</h2></div><span class="status-pill is-waiting">V11</span></div><p class="horse-v11-panel-copy">POV horse-riding Obstacle Course. Logs and rocks are jump obstacles; branches are upper hazards; flowers, herbs and charms are collectibles.</p><label class="range-row"><span>Course Duration <output id="horse-v11-duration-out">45s</output></span><input id="horse-v11-duration" type="range" min="20" max="80" step="5" value="45"></label><label class="range-row"><span>Difficulty <output id="horse-v11-difficulty-out">2</output></span><input id="horse-v11-difficulty" type="range" min="1" max="5" value="2"></label><button id="horse-v11-regenerate" class="wide-button" type="button">Regenerate Forest Ride</button></section><section class="panel tool-panel horse-v11-panel" data-horse-v11-panel="display" hidden><div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Ground Layer</h2></div></div><p class="horse-v11-panel-copy">The sky and horizon/tree photo layers are intentionally removed. This isolates the horse ride to one repeated forest-floor texture so the rectangular-card issue is gone.</p><label class="field-block"><span>Ground tile</span><input id="horse-v11-ground-path" type="text" value="${HORSE_ASSETS.ground}"></label><button id="horse-v11-apply-assets" class="wide-button" type="button">Apply Ground Path</button></section><section class="panel tool-panel horse-v11-panel" data-horse-v11-panel="logic" hidden><div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Scoring + Events</h2></div></div><p class="horse-v11-panel-copy">Collectible +5. Obstacle hit -1. Finish resolves by target score. Quest Builder should decide inventory rewards/removals from the outcome key.</p><label class="range-row"><span>Success Score <output id="horse-v11-success-score-out">20</output></span><input id="horse-v11-success-score" type="range" min="0" max="80" step="5" value="20"></label><label class="field-block"><span>Success Event ID</span><input id="horse-v11-success-event" type="text" value="horse_forest_success"></label><label class="field-block"><span>Failure Event ID</span><input id="horse-v11-failure-event" type="text" value="horse_forest_failure"></label></section><section class="panel tool-panel horse-v11-panel" data-horse-v11-panel="visuals" hidden><div class="panel-title-row"><div><p class="eyebrow">04 · Assets</p><h2>Object Cards</h2></div></div><p class="horse-v11-panel-copy">Only gameplay objects are rendered as transparent PNG cards. Background photo cards are not used.</p><div id="horse-v11-asset-list" class="horse-v11-asset-list"></div><div class="horse-v11-mini-grid"><button id="horse-v11-more-obstacles" type="button">More Obstacles</button><button id="horse-v11-more-collectibles" type="button">More Collectibles</button></div></section>`;
  leftBody.appendChild(Horse.panels);

  Horse.viewport = $('horse-v11-viewport');
  Horse.ground = $('horse-v11-ground');
  Horse.world = $('horse-v11-world');
  Horse.result = $('horse-v11-result');
  bindHorseControls();
  return true;
}

function bindHorseControls() {
  $('horse-v11-start')?.addEventListener('click', startHorseRun);
  $('horse-v11-pause')?.addEventListener('click', pauseHorseRun);
  $('horse-v11-reset')?.addEventListener('click', () => resetHorseRun(false));
  $('horse-v11-regenerate')?.addEventListener('click', regenerateHorseCourse);
  $('horse-v11-apply-assets')?.addEventListener('click', () => { applySceneLayers(); setResult('Ground tile path applied.', 'waiting'); });
  $('horse-v11-duration')?.addEventListener('input', (event) => { Horse.duration = Number(event.target.value); $('horse-v11-duration-out').textContent = `${Horse.duration}s`; Horse.courseLength = Math.round(Horse.duration * 36); regenerateHorseCourse(); });
  $('horse-v11-difficulty')?.addEventListener('input', (event) => { Horse.difficulty = Number(event.target.value); $('horse-v11-difficulty-out').textContent = String(Horse.difficulty); regenerateHorseCourse(); });
  $('horse-v11-success-score')?.addEventListener('input', (event) => { Horse.successScore = Number(event.target.value); $('horse-v11-success-score-out').textContent = String(Horse.successScore); updateStats(); });
  $('horse-v11-more-obstacles')?.addEventListener('click', () => { addObstacleCards(8); renderCards(); });
  $('horse-v11-more-collectibles')?.addEventListener('click', () => { addCollectibleCards(8); renderCards(); });

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
  applySceneLayers();
  regenerateHorseCourse();
}

function closeHorseForestRunner() {
  if (!Horse.mounted) return;
  pauseHorseRun();
  Horse.active = false;
  Horse.stage.hidden = true;
  Horse.panels.hidden = true;
  document.body.classList.remove('is-horse-forest');
}

function applySceneLayers() {
  const groundPath = $('horse-v11-ground-path')?.value || HORSE_ASSETS.ground;
  const groundUrl = `url("${asset(groundPath)}")`;
  Horse.ground.style.backgroundImage = groundUrl;
  Horse.viewport.style.backgroundImage = groundUrl;
  Horse.viewport.style.backgroundSize = '420px 420px';
  Horse.viewport.style.backgroundRepeat = 'repeat';
  updateAssetList();
}

function regenerateHorseCourse() {
  pauseHorseRun();
  Horse.courseLength = Math.round(Horse.duration * 36);
  Horse.cards = [];
  Horse.world.innerHTML = '';
  addObstacleCards(10 + Horse.difficulty * 7);
  addCollectibleCards(10 + Horse.difficulty * 5);
  resetHorseRun(true);
  setResult('Forest ride regenerated. Start the test when ready.', 'waiting');
  renderCards();
}

function createCard(kind, path, x, z, width, height, options = {}) {
  const el = document.createElement('div');
  el.className = 'horse-v11-card';
  el.dataset.kind = kind;
  el.style.backgroundImage = `url("${asset(path)}")`;
  el.style.setProperty('--w', `${width}px`);
  el.style.setProperty('--h', `${height}px`);
  const card = { el, kind, path, x, z, y: options.y ?? 0, width, height, hit: false, collected: false, jumpable: Boolean(options.jumpable), duckable: Boolean(options.duckable), score: options.score ?? 0, penalty: options.penalty ?? 0, radius: options.radius ?? 56, phase: Math.random() * Math.PI * 2 };
  Horse.world.appendChild(el);
  return card;
}

function addObstacleCards(count) {
  for (let i = 0; i < count; i += 1) {
    const z = 110 + Math.random() * (Horse.courseLength - 80);
    const lane = (Math.floor(Math.random() * 3) - 1) * 155 + (Math.random() - 0.5) * 45;
    const branch = Math.random() < 0.28;
    let path, width, height, options;
    if (branch) {
      path = pick(HORSE_ASSETS.branches);
      width = 270; height = 105; options = { y: -92, duckable: true, penalty: -1, radius: 58 };
    } else {
      const isLog = Math.random() < 0.62;
      path = isLog ? pick(HORSE_ASSETS.logs) : pick(HORSE_ASSETS.rocks);
      width = isLog ? 250 : 130; height = isLog ? 105 : 120; options = { y: 38, jumpable: true, penalty: -1, radius: 62 };
    }
    Horse.cards.push(createCard(branch ? 'branch' : 'obstacle', path, lane, z, width, height, options));
  }
}

function addCollectibleCards(count) {
  for (let i = 0; i < count; i += 1) {
    const z = 90 + Math.random() * (Horse.courseLength - 80);
    const lane = (Math.floor(Math.random() * 3) - 1) * 140 + (Math.random() - 0.5) * 60;
    const path = pick(HORSE_ASSETS.collectibles);
    const size = path.includes('charm') ? 64 : 58;
    const y = Math.random() < 0.34 ? -88 : 24;
    Horse.cards.push(createCard('collectible', path, lane, z, size, size, { y, score: 5, radius: 42 }));
  }
}

function resetHorseRun(quiet = false) {
  Horse.running = false;
  Horse.lastTime = 0;
  Horse.distance = 0;
  Horse.score = 0;
  Horse.hits = 0;
  Horse.jumps = 0;
  Horse.collected = 0;
  Horse.playerX = 0;
  Horse.playerY = 0;
  Horse.playerVY = 0;
  Horse.onGround = true;
  for (const card of Horse.cards) {
    card.hit = false;
    card.collected = false;
    card.el.style.display = '';
  }
  updateStats();
  renderCards();
  if (!quiet) setResult('Course reset. Start the test when ready.', 'waiting');
}

function startHorseRun() {
  if (Horse.running) return;
  Horse.running = true;
  Horse.lastTime = performance.now();
  $('horse-v11-status').textContent = 'Riding';
  setResult('Ride running. Steer left/right and press Space to jump.', 'waiting');
  Horse.raf = requestAnimationFrame(tickHorse);
}

function pauseHorseRun() {
  Horse.running = false;
  if (Horse.raf) cancelAnimationFrame(Horse.raf);
  Horse.raf = null;
  if ($('horse-v11-status')) $('horse-v11-status').textContent = 'Paused';
}

function jumpHorse() {
  if (!Horse.running || !Horse.onGround) return;
  Horse.playerVY = 560;
  Horse.onGround = false;
  Horse.jumps += 1;
  updateStats();
}

function tickHorse(now) {
  if (!Horse.running) return;
  const dt = Math.min(0.05, (now - Horse.lastTime) / 1000 || 0.016);
  Horse.lastTime = now;
  updateHorse(dt);
  checkHorseCollisions();
  renderCards();
  updateStats();
  if (Horse.distance >= Horse.courseLength) {
    finishHorseRun();
    return;
  }
  Horse.raf = requestAnimationFrame(tickHorse);
}

function updateHorse(dt) {
  let steer = 0;
  if (Horse.keys.has('arrowleft') || Horse.keys.has('a')) steer -= 1;
  if (Horse.keys.has('arrowright') || Horse.keys.has('d')) steer += 1;
  let speedMod = 1;
  if (Horse.keys.has('arrowup') || Horse.keys.has('w')) speedMod = 1.22;
  if (Horse.keys.has('arrowdown') || Horse.keys.has('s')) speedMod = 0.74;
  Horse.playerX = clamp(Horse.playerX + steer * 360 * dt, -235, 235);
  Horse.playerVY -= 1100 * dt;
  Horse.playerY += Horse.playerVY * dt;
  if (Horse.playerY <= 0) {
    Horse.playerY = 0;
    Horse.playerVY = 0;
    Horse.onGround = true;
  }
  Horse.distance += Horse.speed * speedMod * dt;
  const groundScroll = Math.round(Horse.distance * 1.6);
  Horse.ground.style.backgroundPosition = `center ${groundScroll}px`;
  Horse.viewport.style.backgroundPosition = `center ${Math.round(groundScroll * 0.38)}px`;
}

function depthProjection(z) {
  const rel = z - Horse.distance;
  if (rel < -90 || rel > 980) return null;
  const t = 1 - clamp(rel / 980, 0, 1);
  const scale = 0.18 + t * 1.95;
  const screenY = 140 + t * 342;
  const laneSpread = 0.18 + t * 1.58;
  return { rel, t, scale, screenY, laneSpread };
}

function renderCards() {
  const sorted = [...Horse.cards].sort((a, b) => b.z - a.z);
  for (const card of sorted) {
    if (card.hit || card.collected) {
      card.el.style.display = 'none';
      continue;
    }
    const projected = depthProjection(card.z);
    if (!projected) {
      card.el.style.display = 'none';
      continue;
    }
    card.el.style.display = '';
    const x = (card.x - Horse.playerX * 0.82) * projected.laneSpread;
    const bob = card.kind === 'collectible' ? Math.sin(performance.now() * 0.005 + card.phase) * 8 : 0;
    const y = projected.screenY + card.y - Horse.playerY * (card.kind === 'obstacle' ? 0.32 : 0.1) + bob;
    card.el.style.setProperty('--x', `${x}px`);
    card.el.style.setProperty('--y', `${y}px`);
    card.el.style.setProperty('--s', `${projected.scale}`);
    card.el.style.opacity = String(clamp(projected.t * 1.9, 0.18, 1));
    card.el.style.zIndex = String(Math.round(projected.t * 1000));
  }
}

function checkHorseCollisions() {
  const playerScreenX = 0;
  const jumpClear = Horse.playerY > 72;
  const duckClear = Horse.playerY < 12;
  for (const card of Horse.cards) {
    if (card.hit || card.collected) continue;
    const projected = depthProjection(card.z);
    if (!projected) continue;
    const inCollisionDepth = projected.rel < 38 && projected.rel > -20;
    if (!inCollisionDepth) continue;
    const cardScreenX = (card.x - Horse.playerX * 0.82) * projected.laneSpread;
    const hitX = Math.abs(cardScreenX - playerScreenX) < card.radius * projected.scale;
    if (!hitX) continue;
    if (card.kind === 'collectible') {
      card.collected = true;
      Horse.collected += 1;
      Horse.score += card.score || 5;
      continue;
    }
    if (card.kind === 'obstacle' || card.kind === 'branch') {
      const avoided = (card.jumpable && jumpClear) || (card.duckable && duckClear);
      if (!avoided) {
        card.hit = true;
        Horse.hits += 1;
        Horse.score += card.penalty || -1;
      }
    }
  }
}

function finishHorseRun() {
  Horse.running = false;
  if (Horse.raf) cancelAnimationFrame(Horse.raf);
  Horse.raf = null;
  if (Horse.score >= Horse.successScore) {
    $('horse-v11-status').textContent = 'Success';
    setResult(`Success event: ${$('horse-v11-success-event')?.value || 'horse_forest_success'} · Score ${Horse.score}`, 'success');
  } else {
    $('horse-v11-status').textContent = 'Failure';
    setResult(`Failure event: ${$('horse-v11-failure-event')?.value || 'horse_forest_failure'} · Score ${Horse.score}`, 'failure');
  }
}

function updateStats() {
  $('horse-v11-score').textContent = String(Horse.score);
  $('horse-v11-collected').textContent = String(Horse.collected);
  $('horse-v11-hits').textContent = String(Horse.hits);
  $('horse-v11-jumps').textContent = String(Horse.jumps);
  $('horse-v11-target').textContent = String(Horse.successScore);
  $('horse-v11-distance').textContent = `${Math.round(Horse.distance)}m / ${Horse.courseLength}m`;
}

function setResult(text, state = 'waiting') {
  if (!Horse.result) return;
  Horse.result.textContent = text;
  Horse.result.dataset.state = state;
}

function showHorsePanel(panelId) {
  if (!Horse.panels) return;
  Horse.panels.querySelectorAll('[data-horse-v11-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.horseV11Panel !== panelId;
    panel.classList.toggle('is-active', panel.dataset.horseV11Panel === panelId);
  });
  document.querySelectorAll('.panel-nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.panel === panelId));
}

function updateAssetList() {
  const target = $('horse-v11-asset-list');
  if (!target) return;
  const rows = [
    ['Ground', $('horse-v11-ground-path')?.value || HORSE_ASSETS.ground],
    ['Logs', HORSE_ASSETS.logs.join('<br>')],
    ['Rocks', HORSE_ASSETS.rocks.join('<br>')],
    ['Branches', HORSE_ASSETS.branches.join('<br>')],
    ['Collectibles', HORSE_ASSETS.collectibles.join('<br>')],
  ];
  target.innerHTML = rows.map(([label, value]) => `<strong>${label}</strong><br><code>${value}</code>`).join('<hr>');
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
  const buttons = document.querySelectorAll("[data-engine='obstacle-course']");
  buttons.forEach((button) => {
    button.querySelector('strong, .puzzle-type-title, h3')?.replaceChildren(document.createTextNode('Horse Forest Ride'));
    const small = button.querySelector('small, p');
    if (small) small.textContent = 'Ride through a ground-only forest route, jump obstacles and collect ingredients.';
  });
}

function bootHorseForestRunner() {
  document.addEventListener('click', interceptObstacleCourseClick, true);
  renameObstacleCourseMenu();
  setTimeout(renameObstacleCourseMenu, 400);
  setTimeout(renameObstacleCourseMenu, 1200);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootHorseForestRunner, { once: true });
else bootHorseForestRunner();

window.__artifexHorseForestRunner = {
  version: HORSE_VERSION,
  open: openHorseForestRunner,
  close: closeHorseForestRunner,
  regenerate: regenerateHorseCourse,
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
