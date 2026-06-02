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
  frontLayer: true
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
  frontLayer: document.getElementById('front-layer')
};
const outputs = {
  opacity: document.getElementById('opacity-out'),
  density: document.getElementById('density-out'),
  softness: document.getElementById('softness-out'),
  coverage: document.getElementById('coverage-out'),
  layers: document.getElementById('layers-out'),
  turbulence: document.getElementById('turbulence-out'),
  scale: document.getElementById('scale-out'),
  speed: document.getElementById('speed-out'),
  roll: document.getElementById('roll-out')
};

init();

function init() {
  bindControls();
  resizeCanvas();
  applyPreset('ground-fog');
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(tick);
}

function bindControls() {
  controls.preset.addEventListener('change', () => applyPreset(controls.preset.value));
  controls.scene.addEventListener('change', () => {
    state.scene = controls.scene.value;
    updateJson();
  });

  controls.colour.addEventListener('input', () => {
    state.settings.colour = controls.colour.value;
    controls.colourHex.value = controls.colour.value;
    regenerateVolume();
  });
  controls.colourHex.addEventListener('change', () => {
    const colour = normalizeHex(controls.colourHex.value, state.settings.colour);
    controls.colourHex.value = colour;
    controls.colour.value = colour;
    state.settings.colour = colour;
    regenerateVolume();
  });

  bindNumber('opacity', 2, true);
  bindNumber('density', 2, true);
  bindNumber('softness', 0, true);
  bindNumber('coverage', 0, true, '%');
  bindNumber('layers', 0, true);
  bindNumber('turbulence', 2, true);
  bindNumber('scale', 2, true);
  bindNumber('speed', 2, false);
  bindNumber('roll', 2, false);

  controls.blend.addEventListener('change', () => {
    state.settings.blend = controls.blend.value;
    updateJson();
  });
  controls.direction.addEventListener('change', () => {
    state.settings.direction = controls.direction.value;
    updateJson();
  });
  controls.backLayer.addEventListener('change', updateLayerToggles);
  controls.midLayer.addEventListener('change', updateLayerToggles);
  controls.frontLayer.addEventListener('change', updateLayerToggles);

  document.getElementById('regenerate').addEventListener('click', () => {
    state.seed = Math.floor(Math.random() * 1000000);
    regenerateVolume();
    toast('New fog volume generated.');
  });
  document.getElementById('toggle-play').addEventListener('click', togglePlayback);
  document.getElementById('reset-time').addEventListener('click', () => {
    state.time = 0;
    toast('Preview time reset.');
  });
  document.getElementById('snapshot').addEventListener('click', saveSnapshot);
  document.getElementById('copy-json').addEventListener('click', copyJson);
}

function bindNumber(key, decimals, rebuild, suffix = '') {
  controls[key].addEventListener('input', () => {
    const value = Number(controls[key].value);
    state.settings[key] = value;
    outputs[key].textContent = `${value.toFixed(decimals)}${suffix}`;
    if (rebuild) regenerateVolume();
    else updateJson();
  });
}

function applyPreset(name) {
  const preset = PRESETS[name] || PRESETS['ground-fog'];
  state.settings = { ...preset };
  controls.colour.value = preset.colour;
  controls.colourHex.value = preset.colour;
  ['opacity', 'density', 'softness', 'coverage', 'layers', 'turbulence', 'scale', 'speed', 'roll'].forEach((key) => {
    controls[key].value = String(preset[key]);
  });
  controls.blend.value = preset.blend;
  controls.direction.value = preset.direction;
  updateOutputs();
  regenerateVolume();
}

function updateOutputs() {
  outputs.opacity.textContent = state.settings.opacity.toFixed(2);
  outputs.density.textContent = state.settings.density.toFixed(2);
  outputs.softness.textContent = state.settings.softness.toFixed(0);
  outputs.coverage.textContent = `${state.settings.coverage.toFixed(0)}%`;
  outputs.layers.textContent = state.settings.layers.toFixed(0);
  outputs.turbulence.textContent = state.settings.turbulence.toFixed(2);
  outputs.scale.textContent = state.settings.scale.toFixed(2);
  outputs.speed.textContent = state.settings.speed.toFixed(2);
  outputs.roll.textContent = state.settings.roll.toFixed(2);
}

function updateLayerToggles() {
  state.backLayer = controls.backLayer.checked;
  state.midLayer = controls.midLayer.checked;
  state.frontLayer = controls.frontLayer.checked;
  updateJson();
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.max(640, Math.round(rect.width * ratio));
  canvas.height = Math.max(360, Math.round(rect.height * ratio));
}

function tick(now) {
  const delta = Math.min(50, now - state.lastTime);
  state.lastTime = now;
  if (state.playing) state.time += delta / 1000;
  draw();
  requestAnimationFrame(tick);
}

function draw() {
  const box = fitStage(canvas.width, canvas.height, DESIGN_WIDTH, DESIGN_HEIGHT);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#030304';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(box.x, box.y);
  ctx.scale(box.scale, box.scale);

  drawSceneBase(ctx, state.scene);
  if (state.backLayer) drawFogGroup(ctx, 'back');
  drawSceneStructures(ctx, state.scene);
  if (state.midLayer) drawFogGroup(ctx, 'mid');
  drawSceneFigures(ctx, state.scene);
  if (state.frontLayer) drawFogGroup(ctx, 'front');
  drawVignette(ctx);

  ctx.restore();
}

function fitStage(width, height, designWidth, designHeight) {
  const scale = Math.min(width / designWidth, height / designHeight);
  return { scale, x: (width - designWidth * scale) / 2, y: (height - designHeight * scale) / 2 };
}

function regenerateVolume() {
  const random = seededRandom(state.seed);
  state.sheets = [];
  const count = Math.round(state.settings.layers);
  for (let index = 0; index < count; index += 1) {
    state.sheets.push(createFogSheet(index, count, random));
  }
  updateJson();
}

function createFogSheet(index, count, random) {
  const sheet = document.createElement('canvas');
  sheet.width = 1780;
  sheet.height = 480;
  const fog = sheet.getContext('2d');
  const normalizedDepth = count <= 1 ? 1 : index / (count - 1);
  const massCount = Math.round(18 + state.settings.density * 44 + normalizedDepth * 9);
  const scale = state.settings.scale;
  fog.clearRect(0, 0, sheet.width, sheet.height);

  for (let i = 0; i < massCount; i += 1) {
    const x = random() * sheet.width;
    const y = sheet.height * (0.28 + random() * 0.72);
    const radiusX = (58 + random() * 180) * scale * (1 + normalizedDepth * 0.19);
    const radiusY = radiusX * (0.24 + random() * 0.38);
    const localOpacity = (0.035 + random() * 0.105) * (0.52 + state.settings.density * 0.8);
    const gradient = fog.createRadialGradient(x, y, radiusX * 0.03, x, y, radiusX);
    gradient.addColorStop(0, rgba(state.settings.colour, localOpacity));
    gradient.addColorStop(0.4, rgba(state.settings.colour, localOpacity * 0.77));
    gradient.addColorStop(1, rgba(state.settings.colour, 0));
    fog.save();
    fog.scale(1, radiusY / radiusX);
    fog.fillStyle = gradient;
    fog.beginPath();
    fog.arc(x, y * (radiusX / radiusY), radiusX, 0, Math.PI * 2);
    fog.fill();
    fog.restore();
  }

  return {
    image: sheet,
    depth: normalizedDepth,
    phase: random() * Math.PI * 2,
    driftOffset: random() * sheet.width,
    yOffset: (random() - 0.5) * 34
  };
}

function drawFogGroup(context, depthGroup) {
  const count = state.sheets.length;
  state.sheets.forEach((sheet, index) => {
    const group = groupForSheet(index, count);
    if (group !== depthGroup) return;
    const settings = state.settings;
    const direction = Number(settings.direction);
    const coverageHeight = DESIGN_HEIGHT * (settings.coverage / 100);
    const baseY = DESIGN_HEIGHT - coverageHeight;
    const speed = settings.speed * (18 + sheet.depth * 32) * direction;
    const drift = mod(sheet.driftOffset + state.time * speed, sheet.image.width);
    const roll = Math.sin(state.time * settings.roll * (1.2 + sheet.depth) + sheet.phase) * settings.turbulence * 22;
    const drawHeight = coverageHeight + 120;
    const alphaByGroup = depthGroup === 'back' ? 0.4 : depthGroup === 'mid' ? 0.72 : 1;
    const depthAlpha = (0.55 + sheet.depth * 0.45) * settings.opacity * alphaByGroup;

    context.save();
    context.globalCompositeOperation = settings.blend;
    context.globalAlpha = Math.min(1, depthAlpha);
    context.filter = `blur(${Math.max(0, settings.softness * (0.7 + sheet.depth * 0.3))}px)`;
    const y = baseY - 45 + sheet.yOffset + roll;
    const width = sheet.image.width;
    context.drawImage(sheet.image, -drift, y, width, drawHeight);
    context.drawImage(sheet.image, width - drift, y, width, drawHeight);
    context.restore();
  });
}

function groupForSheet(index, count) {
  if (count === 1) return 'front';
  if (count === 2) return index === 0 ? 'back' : 'front';
  if (index === 0) return 'back';
  if (index === count - 1) return 'front';
  return 'mid';
}

function drawSceneBase(context, scene) {
  const palette = scenePalette(scene);
  const sky = context.createLinearGradient(0, 0, 0, DESIGN_HEIGHT);
  sky.addColorStop(0, palette.skyTop);
  sky.addColorStop(0.63, palette.skyBottom);
  sky.addColorStop(1, palette.ground);
  context.fillStyle = sky;
  context.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

  if (scene === 'transparent-check') {
    drawCheckboard(context);
    return;
  }

  context.fillStyle = palette.moon;
  context.globalAlpha = 0.44;
  context.beginPath();
  context.arc(930, 160, scene === 'underworld' ? 88 : 55, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;

  context.fillStyle = palette.farShape;
  context.beginPath();
  context.moveTo(0, 415);
  for (let x = 0; x <= DESIGN_WIDTH; x += 120) {
    const y = 345 + Math.sin(x * 0.018) * 22 + Math.cos(x * 0.009) * 19;
    context.lineTo(x, y);
  }
  context.lineTo(DESIGN_WIDTH, 720);
  context.lineTo(0, 720);
  context.closePath();
  context.fill();

  context.fillStyle = palette.ground;
  context.fillRect(0, 500, DESIGN_WIDTH, 220);
}

function drawSceneStructures(context, scene) {
  if (scene === 'transparent-check') {
    context.fillStyle = 'rgba(12, 10, 12, 0.82)';
    context.fillRect(498, 170, 284, 382);
    context.clearRect(584, 304, 112, 248);
    return;
  }
  const palette = scenePalette(scene);
  context.fillStyle = palette.tree;
  for (const tree of [[80, 215, 44], [155, 175, 55], [1068, 188, 58], [1165, 225, 47]]) {
    const [x, top, width] = tree;
    context.fillRect(x + width * 0.39, top + 100, width * 0.22, 275);
    for (let row = 0; row < 4; row += 1) {
      context.beginPath();
      context.moveTo(x + width / 2, top + row * 42);
      context.lineTo(x - row * 8, top + 125 + row * 45);
      context.lineTo(x + width + row * 8, top + 125 + row * 45);
      context.closePath();
      context.fill();
    }
  }

  context.fillStyle = palette.structure;
  context.fillRect(500, 166, 280, 390);
  context.fillRect(470, 206, 32, 350);
  context.fillRect(780, 206, 32, 350);
  context.fillStyle = palette.edge;
  context.fillRect(490, 185, 300, 22);
  context.fillRect(462, 200, 47, 18);
  context.fillRect(773, 200, 47, 18);

  const arch = context.createRadialGradient(640, 410, 12, 640, 410, 130);
  arch.addColorStop(0, palette.portalCore);
  arch.addColorStop(0.38, palette.portalEdge);
  arch.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = arch;
  context.beginPath();
  context.ellipse(640, 412, 115, 172, 0, Math.PI, 0);
  context.lineTo(755, 556);
  context.lineTo(525, 556);
  context.closePath();
  context.fill();
  context.fillStyle = palette.darkOpening;
  context.beginPath();
  context.ellipse(640, 424, 72, 124, 0, Math.PI, 0);
  context.lineTo(712, 556);
  context.lineTo(568, 556);
  context.closePath();
  context.fill();
}

function drawSceneFigures(context, scene) {
  if (scene === 'transparent-check') return;
  const palette = scenePalette(scene);
  drawFigure(context, 560, 511, 0.92, palette.figureNear);
  drawFigure(context, 735, 495, 1.05, palette.figureFar);
  context.strokeStyle = 'rgba(231, 213, 172, 0.13)';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, 590);
  context.quadraticCurveTo(610, 548, 1280, 610);
  context.stroke();
}

function drawFigure(context, x, y, scale, colour) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = colour;
  context.beginPath();
  context.arc(0, -70, 15, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(-20, -53);
  context.quadraticCurveTo(-29, 7, -39, 66);
  context.lineTo(34, 66);
  context.quadraticCurveTo(24, 10, 20, -53);
  context.closePath();
  context.fill();
  context.restore();
}

function drawVignette(context) {
  const vignette = context.createRadialGradient(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2, DESIGN_WIDTH * 0.22, DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2, DESIGN_WIDTH * 0.67);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.62)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
}

function drawCheckboard(context) {
  const size = 48;
  for (let y = 0; y < DESIGN_HEIGHT; y += size) {
    for (let x = 0; x < DESIGN_WIDTH; x += size) {
      const light = ((x / size) + (y / size)) % 2 === 0;
      context.fillStyle = light ? '#2a2526' : '#171416';
      context.fillRect(x, y, size, size);
    }
  }
}

function scenePalette(scene) {
  const palettes = {
    'forest-gate': {
      skyTop: '#080e13', skyBottom: '#17221e', ground: '#0a0d0a', farShape: '#101813', moon: '#a8bed0',
      tree: '#080b08', structure: '#201a14', edge: '#423326', portalCore: 'rgba(140, 179, 183, 0.25)', portalEdge: 'rgba(84, 112, 107, 0.18)', darkOpening: '#050706', figureNear: '#190f14', figureFar: '#241419'
    },
    'ruined-road': {
      skyTop: '#100c12', skyBottom: '#2b201b', ground: '#15100e', farShape: '#1c1713', moon: '#d2b58a',
      tree: '#100d0c', structure: '#3b3024', edge: '#715537', portalCore: 'rgba(229, 205, 151, 0.24)', portalEdge: 'rgba(182, 106, 60, 0.18)', darkOpening: '#0b0808', figureNear: '#170e10', figureFar: '#221214'
    },
    underworld: {
      skyTop: '#050307', skyBottom: '#19091c', ground: '#090509', farShape: '#0c0610', moon: '#502e5b',
      tree: '#08040a', structure: '#161019', edge: '#33203c', portalCore: 'rgba(41, 227, 108, 0.27)', portalEdge: 'rgba(45, 96, 66, 0.2)', darkOpening: '#010203', figureNear: '#0b070d', figureFar: '#160b18'
    }
  };
  return palettes[scene] || palettes['forest-gate'];
}

function togglePlayback() {
  state.playing = !state.playing;
  const button = document.getElementById('toggle-play');
  button.textContent = state.playing ? '⏸' : '▶';
  button.classList.toggle('active', state.playing);
  toast(state.playing ? 'Preview resumed.' : 'Preview paused.');
}

function saveSnapshot() {
  const link = document.createElement('a');
  link.download = `atmosphere-volume-${controls.preset.value}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  toast('Snapshot downloaded.');
}

async function copyJson() {
  const json = document.getElementById('json-output').textContent;
  try {
    await navigator.clipboard.writeText(json);
    toast('Prototype settings copied as JSON.');
  } catch (error) {
    toast('Clipboard unavailable; copy settings from the output panel.');
  }
}

function updateJson() {
  const prototype = {
    engine: 'atmosphere-volume',
    status: 'debug-prototype-not-runtime-schema',
    preset: controls.preset.value,
    scenePreview: state.scene,
    appearance: {
      colour: state.settings.colour,
      opacity: state.settings.opacity,
      density: state.settings.density,
      softness: state.settings.softness,
      blendMode: state.settings.blend
    },
    volume: {
      groundCoveragePercent: state.settings.coverage,
      layerCount: Math.round(state.settings.layers),
      turbulence: state.settings.turbulence,
      detailScale: state.settings.scale
    },
    motion: {
      driftSpeed: state.settings.speed,
      driftDirection: Number(state.settings.direction),
      rollSpeed: state.settings.roll
    },
    debugLayerVisibility: {
      back: state.backLayer,
      middle: state.midLayer,
      front: state.frontLayer
    }
  };
  document.getElementById('json-output').textContent = JSON.stringify(prototype, null, 2);
}

function normalizeHex(value, fallback) {
  const cleaned = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(cleaned) ? cleaned.toLowerCase() : fallback;
}

function rgba(hex, alpha) {
  const normal = normalizeHex(hex, '#ffffff').slice(1);
  const red = parseInt(normal.slice(0, 2), 16);
  const green = parseInt(normal.slice(2, 4), 16);
  const blue = parseInt(normal.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, alpha))})`;
}

function mod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

let toastTimer;
function toast(message) {
  const element = document.getElementById('toast');
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => element.classList.remove('visible'), 2400);
}
