const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

const PRESETS = {
  'ground-fog': {
    colour: '#d9e2dd', opacity: 0.42, density: 0.64, softness: 32,
    coverage: 46, layers: 3, turbulence: 0.44, scale: 1.10,
    speed: 0.28, direction: '1', roll: 0.26, blend: 'screen'
  },
  'forest-mist': {
    colour: '#cad8cf', opacity: 0.34, density: 0.52, softness: 39,
    coverage: 64, layers: 4, turbulence: 0.66, scale: 1.27,
    speed: 0.19, direction: '-1', roll: 0.30, blend: 'screen'
  },
  'corruption-haze': {
    colour: '#29e36c', opacity: 0.38, density: 0.71, softness: 26,
    coverage: 50, layers: 4, turbulence: 0.72, scale: 0.91,
    speed: 0.34, direction: '-1', roll: 0.56, blend: 'lighter'
  },
  'dream-veil': {
    colour: '#87dfff', opacity: 0.29, density: 0.45, softness: 48,
    coverage: 78, layers: 5, turbulence: 0.56, scale: 1.45,
    speed: 0.14, direction: '1', roll: 0.17, blend: 'screen'
  },
  'smoke-bank': {
    colour: '#b0aaa2', opacity: 0.57, density: 0.83, softness: 23,
    coverage: 55, layers: 4, turbulence: 0.78, scale: 0.83,
    speed: 0.39, direction: '1', roll: 0.48, blend: 'source-over'
  }
};

const SMOKE_DEFAULTS = {
  mode: 'rising', layer: 'front', colour: '#e4e2de', opacity: 0.46,
  density: 0.64, contrast: 0.61, softness: 0.42, scale: 1,
  layers: 4, turbulence: 0.66, curl: 0.54, drift: 0.22, rise: 0.42,
  clear: 0.51, edge: 0.63, bias: 0,
  sourceX: 50, sourceY: 72, sourceWidth: 42, height: 360, showMarker: true
};

const state = {
  playing: true,
  time: 0,
  lastTime: performance.now(),
  seed: Math.floor(Math.random() * 1000000),
  sheets: [],
  settings: { ...PRESETS['ground-fog'] },
  scene: 'forest-gate',
  backLayer: true,
  midLayer: true,
  frontLayer: true,
  smoke: { ...SMOKE_DEFAULTS, particles: [], brush: null }
};

const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d', { alpha: false });
const controls = {
  preset: document.getElementById('preset'),
  scene: document.getElementById('scene'),
  colour: document.getElementById('colour'),
  colourHex: document.getElementById('colour-hex'),
  opacity: document.getElementById('opacity'),
  density: document.getElementById('density'),
  softness: document.getElementById('softness'),
  blend: document.getElementById('blend'),
  coverage: document.getElementById('coverage'),
  layers: document.getElementById('layers'),
  turbulence: document.getElementById('turbulence'),
  scale: document.getElementById('scale'),
  speed: document.getElementById('speed'),
  direction: document.getElementById('direction'),
  roll: document.getElementById('roll'),
  backLayer: document.getElementById('back-layer'),
  midLayer: document.getElementById('mid-layer'),
  frontLayer: document.getElementById('front-layer'),
  smokeMode: document.getElementById('smoke-mode'),
  smokeLayer: document.getElementById('smoke-layer'),
  smokeColour: document.getElementById('smoke-colour'),
  smokeColourHex: document.getElementById('smoke-colour-hex'),
  smokeOpacity: document.getElementById('smoke-opacity'),
  smokeDensity: document.getElementById('smoke-density'),
  smokeContrast: document.getElementById('smoke-contrast'),
  smokeSoftness: document.getElementById('smoke-softness'),
  smokeScale: document.getElementById('smoke-scale'),
  smokeLayers: document.getElementById('smoke-layers'),
  smokeTurbulence: document.getElementById('smoke-turbulence'),
  smokeCurl: document.getElementById('smoke-curl'),
  smokeDrift: document.getElementById('smoke-drift'),
  smokeRise: document.getElementById('smoke-rise'),
  smokeClear: document.getElementById('smoke-clear'),
  smokeEdge: document.getElementById('smoke-edge'),
  smokeBias: document.getElementById('smoke-bias'),
  smokeSourceX: document.getElementById('smoke-source-x'),
  smokeSourceY: document.getElementById('smoke-source-y'),
  smokeSourceWidth: document.getElementById('smoke-source-width'),
  smokeHeight: document.getElementById('smoke-height'),
  smokeSourceMarker: document.getElementById('smoke-source-marker')
};
const outputs = {
  opacity: document.getElementById('opacity-out'), density: document.getElementById('density-out'),
  softness: document.getElementById('softness-out'), coverage: document.getElementById('coverage-out'),
  layers: document.getElementById('layers-out'), turbulence: document.getElementById('turbulence-out'),
  scale: document.getElementById('scale-out'), speed: document.getElementById('speed-out'), roll: document.getElementById('roll-out'),
  smokeOpacity: document.getElementById('smoke-opacity-out'), smokeDensity: document.getElementById('smoke-density-out'),
  smokeContrast: document.getElementById('smoke-contrast-out'), smokeSoftness: document.getElementById('smoke-softness-out'),
  smokeScale: document.getElementById('smoke-scale-out'), smokeLayers: document.getElementById('smoke-layers-out'),
  smokeTurbulence: document.getElementById('smoke-turbulence-out'), smokeCurl: document.getElementById('smoke-curl-out'),
  smokeDrift: document.getElementById('smoke-drift-out'), smokeRise: document.getElementById('smoke-rise-out'),
  smokeClear: document.getElementById('smoke-clear-out'), smokeEdge: document.getElementById('smoke-edge-out'),
  smokeBias: document.getElementById('smoke-bias-out'), smokeSourceX: document.getElementById('smoke-source-x-out'),
  smokeSourceY: document.getElementById('smoke-source-y-out'), smokeSourceWidth: document.getElementById('smoke-source-width-out'),
  smokeHeight: document.getElementById('smoke-height-out')
};

init();

function init() {
  bindControls();
  resizeCanvas();
  applyPreset('ground-fog');
  resetSmoke();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(tick);
}

function bindControls() {
  controls.preset.addEventListener('change', () => applyPreset(controls.preset.value));
  controls.scene.addEventListener('change', () => { state.scene = controls.scene.value; updateJson(); });
  controls.colour.addEventListener('input', () => {
    state.settings.colour = controls.colour.value; controls.colourHex.value = controls.colour.value; regenerateVolume();
  });
  controls.colourHex.addEventListener('change', () => {
    const colour = normalizeHex(controls.colourHex.value, state.settings.colour);
    controls.colourHex.value = colour; controls.colour.value = colour; state.settings.colour = colour; regenerateVolume();
  });
  bindNumber('opacity', 2, true); bindNumber('density', 2, true); bindNumber('softness', 0, true);
  bindNumber('coverage', 0, true, '%'); bindNumber('layers', 0, true); bindNumber('turbulence', 2, true);
  bindNumber('scale', 2, true); bindNumber('speed', 2, false); bindNumber('roll', 2, false);
  controls.blend.addEventListener('change', () => { state.settings.blend = controls.blend.value; updateJson(); });
  controls.direction.addEventListener('change', () => { state.settings.direction = controls.direction.value; updateJson(); });
  controls.backLayer.addEventListener('change', updateLayerToggles);
  controls.midLayer.addEventListener('change', updateLayerToggles);
  controls.frontLayer.addEventListener('change', updateLayerToggles);
  document.getElementById('regenerate').addEventListener('click', () => {
    state.seed = Math.floor(Math.random() * 1000000); regenerateVolume(); toast('New fog volume generated.');
  });
  document.getElementById('toggle-play').addEventListener('click', togglePlayback);
  document.getElementById('reset-time').addEventListener('click', () => { state.time = 0; resetSmoke(); toast('Preview time reset.'); });
  document.getElementById('snapshot').addEventListener('click', saveSnapshot);
  document.getElementById('copy-json').addEventListener('click', copyJson);

  controls.smokeMode.addEventListener('change', () => { state.smoke.mode = controls.smokeMode.value; toggleSmokeSubcontrols(); resetSmoke(); updateJson(); });
  controls.smokeLayer.addEventListener('change', () => { state.smoke.layer = controls.smokeLayer.value; updateJson(); });
  controls.smokeColour.addEventListener('input', () => {
    state.smoke.colour = controls.smokeColour.value; controls.smokeColourHex.value = state.smoke.colour; buildSmokeBrush(); updateJson();
  });
  controls.smokeColourHex.addEventListener('change', () => {
    state.smoke.colour = normalizeHex(controls.smokeColourHex.value, state.smoke.colour);
    controls.smokeColour.value = state.smoke.colour; controls.smokeColourHex.value = state.smoke.colour; buildSmokeBrush(); updateJson();
  });
  bindSmokeNumber('Opacity', 'opacity', 2, false); bindSmokeNumber('Density', 'density', 2, true);
  bindSmokeNumber('Contrast', 'contrast', 2, true); bindSmokeNumber('Softness', 'softness', 2, true);
  bindSmokeNumber('Scale', 'scale', 2, true); bindSmokeNumber('Layers', 'layers', 0, true);
  bindSmokeNumber('Turbulence', 'turbulence', 2, false); bindSmokeNumber('Curl', 'curl', 2, false);
  bindSmokeNumber('Drift', 'drift', 2, false); bindSmokeNumber('Rise', 'rise', 2, false);
  bindSmokeNumber('Clear', 'clear', 2, true); bindSmokeNumber('Edge', 'edge', 2, true);
  bindSmokeNumber('Bias', 'bias', 2, true); bindSmokeNumber('SourceX', 'sourceX', 0, true, '%');
  bindSmokeNumber('SourceY', 'sourceY', 0, true, '%'); bindSmokeNumber('SourceWidth', 'sourceWidth', 0, true, 'px');
  bindSmokeNumber('Height', 'height', 0, true, 'px');
  controls.smokeSourceMarker.addEventListener('change', () => { state.smoke.showMarker = controls.smokeSourceMarker.checked; updateJson(); });
  document.getElementById('smoke-regenerate').addEventListener('click', () => { resetSmoke(); toast('New smoke pattern generated.'); });
}

function bindNumber(key, decimals, rebuild, suffix = '') {
  controls[key].addEventListener('input', () => {
    const value = Number(controls[key].value); state.settings[key] = value;
    outputs[key].textContent = `${value.toFixed(decimals)}${suffix}`;
    if (rebuild) regenerateVolume(); else updateJson();
  });
}

function bindSmokeNumber(controlSuffix, property, decimals, rebuild, suffix = '') {
  const control = controls[`smoke${controlSuffix}`];
  control.addEventListener('input', () => {
    state.smoke[property] = Number(control.value);
    outputs[`smoke${controlSuffix}`].textContent = `${state.smoke[property].toFixed(decimals)}${suffix}`;
    if (rebuild) resetSmoke(); else updateJson();
  });
}

function applyPreset(name) {
  const isSmoke = name === 'smoke';
  document.getElementById('smoke-controls').hidden = !isSmoke;
  ['fog-appearance', 'fog-shape', 'fog-motion', 'fog-depth'].forEach((id) => { document.getElementById(id).hidden = isSmoke; });
  document.getElementById('stage-description').textContent = isSmoke
    ? 'debug preview · layered textured smoke test based on reference look'
    : 'debug preview · generated cloud-sheet test, not particle smoke';
  if (isSmoke) {
    toggleSmokeSubcontrols(); resetSmoke(); updateJson(); return;
  }
  const preset = PRESETS[name] || PRESETS['ground-fog'];
  state.settings = { ...preset };
  controls.colour.value = preset.colour; controls.colourHex.value = preset.colour;
  ['opacity', 'density', 'softness', 'coverage', 'layers', 'turbulence', 'scale', 'speed', 'roll'].forEach((key) => { controls[key].value = String(preset[key]); });
  controls.blend.value = preset.blend; controls.direction.value = preset.direction;
  updateOutputs(); regenerateVolume();
}

function toggleSmokeSubcontrols() {
  const mode = state.smoke.mode;
  document.getElementById('smoke-vignette-controls').hidden = mode !== 'vignette';
  document.getElementById('smoke-emission-controls').hidden = mode !== 'emission';
}

function updateOutputs() {
  outputs.opacity.textContent = state.settings.opacity.toFixed(2); outputs.density.textContent = state.settings.density.toFixed(2);
  outputs.softness.textContent = state.settings.softness.toFixed(0); outputs.coverage.textContent = `${state.settings.coverage.toFixed(0)}%`;
  outputs.layers.textContent = state.settings.layers.toFixed(0); outputs.turbulence.textContent = state.settings.turbulence.toFixed(2);
  outputs.scale.textContent = state.settings.scale.toFixed(2); outputs.speed.textContent = state.settings.speed.toFixed(2); outputs.roll.textContent = state.settings.roll.toFixed(2);
  outputs.smokeOpacity.textContent = state.smoke.opacity.toFixed(2); outputs.smokeDensity.textContent = state.smoke.density.toFixed(2);
  outputs.smokeContrast.textContent = state.smoke.contrast.toFixed(2); outputs.smokeSoftness.textContent = state.smoke.softness.toFixed(2);
  outputs.smokeScale.textContent = state.smoke.scale.toFixed(2); outputs.smokeLayers.textContent = state.smoke.layers.toFixed(0);
  outputs.smokeTurbulence.textContent = state.smoke.turbulence.toFixed(2); outputs.smokeCurl.textContent = state.smoke.curl.toFixed(2);
  outputs.smokeDrift.textContent = state.smoke.drift.toFixed(2); outputs.smokeRise.textContent = state.smoke.rise.toFixed(2);
  outputs.smokeClear.textContent = state.smoke.clear.toFixed(2); outputs.smokeEdge.textContent = state.smoke.edge.toFixed(2);
  outputs.smokeBias.textContent = state.smoke.bias.toFixed(2); outputs.smokeSourceX.textContent = `${state.smoke.sourceX.toFixed(0)}%`;
  outputs.smokeSourceY.textContent = `${state.smoke.sourceY.toFixed(0)}%`; outputs.smokeSourceWidth.textContent = `${state.smoke.sourceWidth.toFixed(0)}px`;
  outputs.smokeHeight.textContent = `${state.smoke.height.toFixed(0)}px`;
}

function updateLayerToggles() { state.backLayer = controls.backLayer.checked; state.midLayer = controls.midLayer.checked; state.frontLayer = controls.frontLayer.checked; updateJson(); }
function resizeCanvas() { const rect = canvas.getBoundingClientRect(); const ratio = Math.min(2, window.devicePixelRatio || 1); canvas.width = Math.max(640, Math.round(rect.width * ratio)); canvas.height = Math.max(360, Math.round(rect.height * ratio)); }
function tick(now) { const delta = Math.min(50, now - state.lastTime); state.lastTime = now; if (state.playing) { state.time += delta / 1000; updateSmoke(delta / 1000); } draw(); requestAnimationFrame(tick); }
function isSmokeActive() { return controls.preset.value === 'smoke'; }

function draw() {
  const box = fitStage(canvas.width, canvas.height, DESIGN_WIDTH, DESIGN_HEIGHT);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#030304'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(box.x, box.y); ctx.scale(box.scale, box.scale);
  drawSceneBase(ctx, state.scene);
  if (isSmokeActive()) {
    if (state.smoke.layer === 'back') drawTexturedSmoke(ctx);
  } else if (state.backLayer) drawFogGroup(ctx, 'back');
  drawSceneStructures(ctx, state.scene);
  if (isSmokeActive()) { if (state.smoke.layer === 'mid') drawTexturedSmoke(ctx); }
  else if (state.midLayer) drawFogGroup(ctx, 'mid');
  drawSceneFigures(ctx, state.scene);
  if (isSmokeActive()) { if (state.smoke.layer === 'front') drawTexturedSmoke(ctx); }
  else if (state.frontLayer) drawFogGroup(ctx, 'front');
  if (isSmokeActive() && state.smoke.mode === 'emission' && state.smoke.showMarker) drawEmissionMarker(ctx);
  drawVignette(ctx); ctx.restore();
}

function resetSmoke() {
  const random = seededRandom(Math.floor(Math.random() * 1000000));
  state.smoke.particles = [];
  buildSmokeBrush();
  const targetCount = 34 + Math.round(state.smoke.density * 62) * Math.max(1, Math.round(state.smoke.layers * 0.62));
  for (let index = 0; index < targetCount; index += 1) state.smoke.particles.push(createSmokeParticle(random, true));
  updateOutputs(); updateJson();
}

function createSmokeParticle(random, initial = false) {
  const smoke = state.smoke; const mode = smoke.mode;
  const particle = {
    seed: random() * 100, age: initial ? random() : 0, life: 4.5 + random() * 6,
    size: (52 + random() * 145) * smoke.scale, alpha: 0.4 + random() * 0.6,
    spin: (random() - 0.5) * 0.28, rotation: random() * Math.PI * 2,
    curlPhase: random() * Math.PI * 2, depth: Math.floor(random() * Math.max(1, smoke.layers))
  };
  if (mode === 'vignette') {
    const side = Math.floor(random() * 4); particle.side = side;
    if (side === 0) { particle.x = random() * DESIGN_WIDTH; particle.y = random() * 125; }
    if (side === 1) { particle.x = random() * DESIGN_WIDTH; particle.y = DESIGN_HEIGHT - random() * 125; }
    if (side === 2) { particle.x = random() * 105; particle.y = random() * DESIGN_HEIGHT; }
    if (side === 3) { particle.x = DESIGN_WIDTH - random() * 105; particle.y = random() * DESIGN_HEIGHT; }
    particle.y += smoke.bias * 95;
  } else if (mode === 'fullscreen') {
    particle.x = random() * DESIGN_WIDTH; particle.y = random() * DESIGN_HEIGHT;
    particle.size *= 1.35;
  } else if (mode === 'emission') {
    particle.x = DESIGN_WIDTH * smoke.sourceX / 100 + (random() - 0.5) * smoke.sourceWidth;
    particle.y = DESIGN_HEIGHT * smoke.sourceY / 100;
    particle.maxRise = smoke.height * (0.72 + random() * 0.42);
    particle.size *= 0.42 + random() * 0.45;
  } else {
    particle.x = DESIGN_WIDTH * (0.18 + random() * 0.64);
    particle.y = DESIGN_HEIGHT * (0.62 + random() * 0.34);
    particle.maxRise = 310 + random() * 300;
  }
  particle.originX = particle.x; particle.originY = particle.y;
  return particle;
}

function updateSmoke(delta) {
  if (!isSmokeActive()) return;
  const smoke = state.smoke; const random = Math.random;
  smoke.particles.forEach((particle, index) => {
    particle.age += delta / particle.life;
    if (particle.age >= 1) smoke.particles[index] = createSmokeParticle(random);
  });
}

function buildSmokeBrush() {
  const brush = document.createElement('canvas'); brush.width = 256; brush.height = 256;
  const b = brush.getContext('2d'); const random = seededRandom(Math.floor(Math.random() * 1000000));
  for (let i = 0; i < 30; i += 1) {
    const x = 48 + random() * 160; const y = 35 + random() * 184; const radius = 24 + random() * 58;
    const gradient = b.createRadialGradient(x, y, radius * 0.04, x, y, radius);
    const alpha = (0.035 + random() * 0.095) * (0.65 + state.smoke.contrast * 0.75);
    gradient.addColorStop(0, rgba(state.smoke.colour, alpha));
    gradient.addColorStop(0.37, rgba(state.smoke.colour, alpha * 0.82));
    gradient.addColorStop(0.72, rgba(state.smoke.colour, alpha * 0.23));
    gradient.addColorStop(1, rgba(state.smoke.colour, 0));
    b.fillStyle = gradient; b.beginPath(); b.ellipse(x, y, radius, radius * (0.48 + random() * 0.42), random() * Math.PI, 0, Math.PI * 2); b.fill();
  }
  b.save(); b.globalCompositeOperation = 'screen'; b.filter = `blur(${Math.max(0, 7 - state.smoke.contrast * 6)}px)`;
  b.strokeStyle = rgba(state.smoke.colour, 0.03 + state.smoke.contrast * 0.11); b.lineWidth = 3 + state.smoke.contrast * 7; b.lineCap = 'round';
  for (let i = 0; i < 4; i += 1) { b.beginPath(); b.moveTo(30 + random() * 70, 205 + random() * 25); b.bezierCurveTo(30 + random() * 180, 145, 40 + random() * 180, 105, 50 + random() * 160, 32); b.stroke(); }
  b.restore(); state.smoke.brush = brush;
}

function drawTexturedSmoke(context) {
  const smoke = state.smoke;
  context.save(); context.globalCompositeOperation = smoke.mode === 'fullscreen' || smoke.mode === 'vignette' ? 'screen' : 'source-over';
  smoke.particles.slice().sort((a, b) => a.depth - b.depth).forEach((particle) => {
    const p = particle.age; const envelope = Math.sin(Math.min(1, p) * Math.PI) * particle.alpha;
    const depthAlpha = (0.35 + (particle.depth + 1) / Math.max(1, smoke.layers) * 0.62);
    const wobble = Math.sin(state.time * (0.55 + smoke.turbulence) + particle.curlPhase + p * 8) * (10 + smoke.curl * 45);
    const drift = state.time * smoke.drift * (10 + particle.depth * 3);
    let x = particle.originX + drift + wobble; let y = particle.originY;
    let size = particle.size * (0.75 + p * (0.8 + smoke.turbulence * 0.5));
    if (smoke.mode === 'rising' || smoke.mode === 'emission') {
      const maxRise = particle.maxRise || 400; y -= p * maxRise * (0.8 + smoke.rise * 0.6); x += p * smoke.drift * 130;
    } else { y += Math.sin(state.time * 0.3 + particle.seed) * 11 * smoke.turbulence; }
    context.save(); context.translate(x, y); context.rotate(particle.rotation + state.time * particle.spin * 0.08);
    context.filter = `blur(${state.smoke.softness * 9}px)`;
    context.globalAlpha = smoke.opacity * envelope * depthAlpha;
    context.drawImage(smoke.brush, -size / 2, -size / 2, size, size);
    context.restore();
  });
  if (smoke.mode === 'vignette') clearVignetteCentre(context);
  context.restore();
}

function clearVignetteCentre(context) {
  const smoke = state.smoke; const cx = DESIGN_WIDTH / 2; const cy = DESIGN_HEIGHT / 2 + smoke.bias * 80;
  const radius = Math.min(DESIGN_WIDTH, DESIGN_HEIGHT) * smoke.clear;
  context.save(); context.globalCompositeOperation = 'destination-out';
  const mask = context.createRadialGradient(cx, cy, radius * 0.18, cx, cy, radius * (0.78 + smoke.edge * 0.32));
  mask.addColorStop(0, 'rgba(0,0,0,1)'); mask.addColorStop(Math.max(0.2, smoke.clear * 0.78), 'rgba(0,0,0,0.9)'); mask.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = mask; context.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT); context.restore();
}

function drawEmissionMarker(context) {
  const x = DESIGN_WIDTH * state.smoke.sourceX / 100; const y = DESIGN_HEIGHT * state.smoke.sourceY / 100;
  context.save(); context.strokeStyle = '#25d6ff'; context.fillStyle = 'rgba(0,174,234,0.18)'; context.lineWidth = 2;
  context.beginPath(); context.arc(x, y, Math.max(8, state.smoke.sourceWidth / 2), 0, Math.PI * 2); context.fill(); context.stroke();
  context.beginPath(); context.moveTo(x - 17, y); context.lineTo(x + 17, y); context.moveTo(x, y - 17); context.lineTo(x, y + 17); context.stroke(); context.restore();
}

function fitStage(width, height, designWidth, designHeight) { const scale = Math.min(width / designWidth, height / designHeight); return { scale, x: (width - designWidth * scale) / 2, y: (height - designHeight * scale) / 2 }; }
function regenerateVolume() { const random = seededRandom(state.seed); state.sheets = []; const count = Math.round(state.settings.layers); for (let index = 0; index < count; index += 1) state.sheets.push(createFogSheet(index, count, random)); updateJson(); }
function createFogSheet(index, count, random) {
  const sheet = document.createElement('canvas'); sheet.width = 1780; sheet.height = 480; const fog = sheet.getContext('2d');
  const depth = count <= 1 ? 1 : index / (count - 1); const massCount = Math.round(18 + state.settings.density * 44 + depth * 9); const scale = state.settings.scale;
  for (let i = 0; i < massCount; i += 1) { const x = random() * sheet.width; const y = sheet.height * (0.28 + random() * 0.72); const rx = (58 + random() * 180) * scale * (1 + depth * 0.19); const ry = rx * (0.24 + random() * 0.38); const alpha = (0.035 + random() * 0.105) * (0.52 + state.settings.density * 0.8); const g = fog.createRadialGradient(x, y, rx * 0.03, x, y, rx); g.addColorStop(0, rgba(state.settings.colour, alpha)); g.addColorStop(0.4, rgba(state.settings.colour, alpha * 0.77)); g.addColorStop(1, rgba(state.settings.colour, 0)); fog.save(); fog.scale(1, ry / rx); fog.fillStyle = g; fog.beginPath(); fog.arc(x, y * (rx / ry), rx, 0, Math.PI * 2); fog.fill(); fog.restore(); }
  return { image: sheet, depth, phase: random() * Math.PI * 2, driftOffset: random() * sheet.width, yOffset: (random() - 0.5) * 34 };
}
function drawFogGroup(context, group) {
  const count = state.sheets.length;
  state.sheets.forEach((sheet, index) => { if (groupForSheet(index, count) !== group) return; const s = state.settings; const coverage = DESIGN_HEIGHT * s.coverage / 100; const drift = mod(sheet.driftOffset + state.time * s.speed * (18 + sheet.depth * 32) * Number(s.direction), sheet.image.width); const roll = Math.sin(state.time * s.roll * (1.2 + sheet.depth) + sheet.phase) * s.turbulence * 22; const alpha = (0.55 + sheet.depth * 0.45) * s.opacity * (group === 'back' ? 0.4 : group === 'mid' ? 0.72 : 1); context.save(); context.globalCompositeOperation = s.blend; context.globalAlpha = Math.min(1, alpha); context.filter = `blur(${Math.max(0, s.softness * (0.7 + sheet.depth * 0.3))}px)`; const y = DESIGN_HEIGHT - coverage - 45 + sheet.yOffset + roll; context.drawImage(sheet.image, -drift, y, sheet.image.width, coverage + 120); context.drawImage(sheet.image, sheet.image.width - drift, y, sheet.image.width, coverage + 120); context.restore(); });
}
function groupForSheet(index, count) { if (count === 1) return 'front'; if (count === 2) return index === 0 ? 'back' : 'front'; if (index === 0) return 'back'; if (index === count - 1) return 'front'; return 'mid'; }

function drawSceneBase(context, scene) {
  const palette = scenePalette(scene); const sky = context.createLinearGradient(0, 0, 0, DESIGN_HEIGHT); sky.addColorStop(0, palette.skyTop); sky.addColorStop(0.63, palette.skyBottom); sky.addColorStop(1, palette.ground); context.fillStyle = sky; context.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  if (scene === 'transparent-check') { drawCheckboard(context); return; }
  context.fillStyle = palette.moon; context.globalAlpha = 0.44; context.beginPath(); context.arc(930, 160, scene === 'underworld' ? 88 : 55, 0, Math.PI * 2); context.fill(); context.globalAlpha = 1;
  context.fillStyle = palette.farShape; context.beginPath(); context.moveTo(0, 415); for (let x = 0; x <= DESIGN_WIDTH; x += 120) context.lineTo(x, 345 + Math.sin(x * 0.018) * 22 + Math.cos(x * 0.009) * 19); context.lineTo(DESIGN_WIDTH, 720); context.lineTo(0, 720); context.closePath(); context.fill(); context.fillStyle = palette.ground; context.fillRect(0, 500, DESIGN_WIDTH, 220);
}
function drawSceneStructures(context, scene) {
  if (scene === 'transparent-check') { context.fillStyle = 'rgba(12, 10, 12, 0.82)'; context.fillRect(498, 170, 284, 382); context.clearRect(584, 304, 112, 248); return; }
  const p = scenePalette(scene); context.fillStyle = p.tree;
  [[80, 215, 44], [155, 175, 55], [1068, 188, 58], [1165, 225, 47]].forEach(([x, top, width]) => { context.fillRect(x + width * 0.39, top + 100, width * 0.22, 275); for (let row = 0; row < 4; row += 1) { context.beginPath(); context.moveTo(x + width / 2, top + row * 42); context.lineTo(x - row * 8, top + 125 + row * 45); context.lineTo(x + width + row * 8, top + 125 + row * 45); context.closePath(); context.fill(); } });
  context.fillStyle = p.structure; context.fillRect(500, 166, 280, 390); context.fillRect(470, 206, 32, 350); context.fillRect(780, 206, 32, 350); context.fillStyle = p.edge; context.fillRect(490, 185, 300, 22); context.fillRect(462, 200, 47, 18); context.fillRect(773, 200, 47, 18);
  const arch = context.createRadialGradient(640, 410, 12, 640, 410, 130); arch.addColorStop(0, p.portalCore); arch.addColorStop(0.38, p.portalEdge); arch.addColorStop(1, 'rgba(0,0,0,0)'); context.fillStyle = arch; context.beginPath(); context.ellipse(640, 412, 115, 172, 0, Math.PI, 0); context.lineTo(755, 556); context.lineTo(525, 556); context.closePath(); context.fill(); context.fillStyle = p.darkOpening; context.beginPath(); context.ellipse(640, 424, 72, 124, 0, Math.PI, 0); context.lineTo(712, 556); context.lineTo(568, 556); context.closePath(); context.fill();
}
function drawSceneFigures(context, scene) { if (scene === 'transparent-check') return; const p = scenePalette(scene); drawFigure(context, 560, 511, 0.92, p.figureNear); drawFigure(context, 735, 495, 1.05, p.figureFar); context.strokeStyle = 'rgba(231, 213, 172, 0.13)'; context.lineWidth = 2; context.beginPath(); context.moveTo(0, 590); context.quadraticCurveTo(610, 548, 1280, 610); context.stroke(); }
function drawFigure(context, x, y, scale, colour) { context.save(); context.translate(x, y); context.scale(scale, scale); context.fillStyle = colour; context.beginPath(); context.arc(0, -70, 15, 0, Math.PI * 2); context.fill(); context.beginPath(); context.moveTo(-20, -53); context.quadraticCurveTo(-29, 7, -39, 66); context.lineTo(34, 66); context.quadraticCurveTo(24, 10, 20, -53); context.closePath(); context.fill(); context.restore(); }
function drawVignette(context) { const v = context.createRadialGradient(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2, DESIGN_WIDTH * 0.22, DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2, DESIGN_WIDTH * 0.67); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.62)'); context.fillStyle = v; context.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT); }
function drawCheckboard(context) { const size = 48; for (let y = 0; y < DESIGN_HEIGHT; y += size) for (let x = 0; x < DESIGN_WIDTH; x += size) { context.fillStyle = ((x / size + y / size) % 2 === 0) ? '#2a2526' : '#171416'; context.fillRect(x, y, size, size); } }
function scenePalette(scene) { const p = { 'forest-gate': { skyTop:'#080e13', skyBottom:'#17221e', ground:'#0a0d0a', farShape:'#101813', moon:'#a8bed0', tree:'#080b08', structure:'#201a14', edge:'#423326', portalCore:'rgba(140,179,183,0.25)', portalEdge:'rgba(84,112,107,0.18)', darkOpening:'#050706', figureNear:'#190f14', figureFar:'#241419' }, 'ruined-road': { skyTop:'#100c12', skyBottom:'#2b201b', ground:'#15100e', farShape:'#1c1713', moon:'#d2b58a', tree:'#100d0c', structure:'#3b3024', edge:'#715537', portalCore:'rgba(229,205,151,0.24)', portalEdge:'rgba(182,106,60,0.18)', darkOpening:'#0b0808', figureNear:'#170e10', figureFar:'#221214' }, underworld: { skyTop:'#050307', skyBottom:'#19091c', ground:'#090509', farShape:'#0c0610', moon:'#502e5b', tree:'#08040a', structure:'#161019', edge:'#33203c', portalCore:'rgba(41,227,108,0.27)', portalEdge:'rgba(45,96,66,0.2)', darkOpening:'#010203', figureNear:'#0b070d', figureFar:'#160b18' }, 'transparent-check': { skyTop:'#000000', skyBottom:'#000000', ground:'#000000' } }; return p[scene] || p['forest-gate']; }
function togglePlayback() { state.playing = !state.playing; const button = document.getElementById('toggle-play'); button.textContent = state.playing ? '⏸' : '▶'; button.classList.toggle('active', state.playing); toast(state.playing ? 'Preview resumed.' : 'Preview paused.'); }
function saveSnapshot() { const link = document.createElement('a'); link.download = `${isSmokeActive() ? `smoke-${state.smoke.mode}` : `atmosphere-volume-${controls.preset.value}`}.png`; link.href = canvas.toDataURL('image/png'); link.click(); toast('Snapshot downloaded.'); }
async function copyJson() { try { await navigator.clipboard.writeText(document.getElementById('json-output').textContent); toast('Prototype settings copied as JSON.'); } catch (error) { toast('Clipboard unavailable; copy settings from the output panel.'); } }
function updateJson() {
  const data = isSmokeActive() ? { engine:'atmosphere-volume', status:'debug-prototype-not-runtime-schema', preset:'smoke', smokeMode:state.smoke.mode, previewLayer:state.smoke.layer, smoke:{ colour:state.smoke.colour, opacity:state.smoke.opacity, density:state.smoke.density, contrast:state.smoke.contrast, softness:state.smoke.softness, textureScale:state.smoke.scale, layerCount:state.smoke.layers, turbulence:state.smoke.turbulence, curl:state.smoke.curl, driftSpeed:state.smoke.drift, riseSpeed:state.smoke.rise, vignette:{ centreOpening:state.smoke.clear, edgeThickness:state.smoke.edge, verticalBias:state.smoke.bias }, emission:{ xPercent:state.smoke.sourceX, yPercent:state.smoke.sourceY, sourceWidth:state.smoke.sourceWidth, plumeHeight:state.smoke.height } } } : { engine:'atmosphere-volume', status:'debug-prototype-not-runtime-schema', preset:controls.preset.value, scenePreview:state.scene, appearance:{ colour:state.settings.colour, opacity:state.settings.opacity, density:state.settings.density, softness:state.settings.softness, blendMode:state.settings.blend }, volume:{ groundCoveragePercent:state.settings.coverage, layerCount:Math.round(state.settings.layers), turbulence:state.settings.turbulence, detailScale:state.settings.scale }, motion:{ driftSpeed:state.settings.speed, driftDirection:Number(state.settings.direction), rollSpeed:state.settings.roll }, debugLayerVisibility:{ back:state.backLayer, middle:state.midLayer, front:state.frontLayer } };
  document.getElementById('json-output').textContent = JSON.stringify(data, null, 2);
}
function normalizeHex(value, fallback) { const cleaned = String(value || '').trim(); return /^#[0-9a-f]{6}$/i.test(cleaned) ? cleaned.toLowerCase() : fallback; }
function rgba(hex, alpha) { const normal = normalizeHex(hex, '#ffffff').slice(1); return `rgba(${parseInt(normal.slice(0,2),16)}, ${parseInt(normal.slice(2,4),16)}, ${parseInt(normal.slice(4,6),16)}, ${Math.max(0, Math.min(1, alpha))})`; }
function mod(value, divisor) { return ((value % divisor) + divisor) % divisor; }
function seededRandom(seed) { let value = seed >>> 0; return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; }; }
let toastTimer; function toast(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = window.setTimeout(() => el.classList.remove('visible'), 2400); }
