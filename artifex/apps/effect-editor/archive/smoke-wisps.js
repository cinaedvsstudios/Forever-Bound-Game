const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;
const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');
const preset = document.getElementById('preset');
const smokePanel = document.getElementById('smoke-controls');
const stageDescription = document.querySelector('.stage-note span');
const depthToggles = ['back-layer', 'mid-layer', 'front-layer'].map((id) => document.getElementById(id));
const defaultStageDescription = 'debug preview · generated cloud-sheet test, not particle smoke';

const smoke = {
  active: false,
  playing: true,
  time: 0,
  lastTime: performance.now(),
  colour: '#bbb6ae',
  opacity: 0.48,
  wispThinness: 0.66,
  verticalStretch: 0.78,
  breakup: 0.52,
  curl: 0.62,
  riseSpeed: 0.48,
  sourceWidth: 150,
  fadeHeight: 0.74,
  windPush: 0.24,
  tendrils: []
};

const controls = {
  colour: document.getElementById('smoke-colour'),
  opacity: document.getElementById('smoke-opacity'),
  wispThinness: document.getElementById('smoke-thinness'),
  verticalStretch: document.getElementById('smoke-stretch'),
  breakup: document.getElementById('smoke-breakup'),
  curl: document.getElementById('smoke-curl'),
  riseSpeed: document.getElementById('smoke-rise'),
  sourceWidth: document.getElementById('smoke-source-width'),
  fadeHeight: document.getElementById('smoke-fade-height'),
  windPush: document.getElementById('smoke-wind')
};

const outputIds = {
  opacity: 'smoke-opacity-out',
  wispThinness: 'smoke-thinness-out',
  verticalStretch: 'smoke-stretch-out',
  breakup: 'smoke-breakup-out',
  curl: 'smoke-curl-out',
  riseSpeed: 'smoke-rise-out',
  sourceWidth: 'smoke-source-width-out',
  fadeHeight: 'smoke-fade-height-out',
  windPush: 'smoke-wind-out'
};

initSmokePrototype();

function initSmokePrototype() {
  buildTendrils();
  preset.addEventListener('change', applyPresetMode);
  Object.entries(controls).forEach(([property, element]) => {
    element?.addEventListener('input', () => {
      smoke[property] = property === 'colour' ? element.value : Number(element.value);
      updateOutputs();
      updateSmokeJson();
    });
  });
  document.getElementById('smoke-regenerate')?.addEventListener('click', () => {
    buildTendrils();
    showToast('New smoke tendrils generated.');
  });
  document.getElementById('toggle-play')?.addEventListener('click', () => {
    smoke.playing = !smoke.playing;
  });
  document.getElementById('reset-time')?.addEventListener('click', () => {
    smoke.time = 0;
  });
  ['scene', 'blend', 'colour', 'opacity', 'density', 'softness', 'coverage', 'layers', 'turbulence', 'scale', 'speed', 'direction', 'roll']
    .forEach((id) => document.getElementById(id)?.addEventListener('input', () => queueMicrotask(updateSmokeJson)));
  applyPresetMode();
  requestAnimationFrame(tickSmoke);
}

function applyPresetMode() {
  smoke.active = preset.value === 'smoke';
  smokePanel.hidden = !smoke.active;
  if (smoke.active) {
    depthToggles.forEach((toggle) => {
      toggle.dataset.previousChecked = String(toggle.checked);
      toggle.checked = false;
      toggle.disabled = true;
      toggle.dispatchEvent(new Event('change', { bubbles: true }));
    });
    stageDescription.textContent = 'debug preview · rising wispy smoke test, not particle smoke';
    buildTendrils();
  } else {
    depthToggles.forEach((toggle) => {
      toggle.disabled = false;
      toggle.checked = toggle.dataset.previousChecked ? toggle.dataset.previousChecked === 'true' : true;
      delete toggle.dataset.previousChecked;
      toggle.dispatchEvent(new Event('change', { bubbles: true }));
    });
    stageDescription.textContent = defaultStageDescription;
  }
  updateOutputs();
  queueMicrotask(updateSmokeJson);
}

function tickSmoke(now) {
  const delta = Math.min(50, now - smoke.lastTime);
  smoke.lastTime = now;
  if (smoke.active && smoke.playing) smoke.time += delta / 1000;
  if (smoke.active) drawSmokeOverlay();
  requestAnimationFrame(tickSmoke);
}

function drawSmokeOverlay() {
  const box = fitStage(canvas.width, canvas.height, DESIGN_WIDTH, DESIGN_HEIGHT);
  ctx.save();
  ctx.translate(box.x, box.y);
  ctx.scale(box.scale, box.scale);
  ctx.globalCompositeOperation = 'source-over';

  const originY = 620;
  const lift = 230 + smoke.verticalStretch * 245;
  const baseWidth = 25 + (1 - smoke.wispThinness) * 68;
  smoke.tendrils.forEach((tendril, index) => {
    const age = mod(smoke.time * (0.18 + smoke.riseSpeed * 0.6) + tendril.ageOffset, 1.28);
    const lifecycle = Math.max(0, Math.min(1, age / 1.05));
    const riseOffset = lifecycle * (105 + lift * 0.46);
    const xBase = 640 + tendril.originOffset + smoke.windPush * riseOffset * tendril.windBias;
    const yBase = originY - riseOffset * 0.18;
    const segments = 16;
    const points = [];

    for (let segment = 0; segment <= segments; segment += 1) {
      const progress = segment / segments;
      const y = yBase - progress * lift;
      const coil = Math.sin(smoke.time * (0.54 + smoke.curl * 0.9) + tendril.phase + progress * (3.2 + smoke.curl * 8.5));
      const secondary = Math.sin(tendril.phase * 1.7 - smoke.time * 0.32 + progress * 16) * smoke.breakup * 11;
      const spread = (18 + progress * 45) * smoke.curl;
      const x = xBase + coil * spread + secondary + smoke.windPush * progress * 150;
      points.push({ x, y, progress });
    }

    const fade = smoke.opacity * tendril.alpha * envelope(lifecycle);
    drawWispStroke(points, baseWidth * tendril.width, fade, smoke.colour, 26 + (1 - smoke.wispThinness) * 22);
    drawWispStroke(points, baseWidth * tendril.width * 0.37, fade * 0.34, '#ede9e1', 9);

    if (smoke.breakup > 0.14) {
      drawBrokenPuffs(points, tendril, fade);
    }
  });
  ctx.restore();
}

function drawWispStroke(points, width, opacity, colour, blur) {
  if (opacity <= 0.002) return;
  ctx.save();
  ctx.strokeStyle = rgba(colour, opacity);
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.filter = `blur(${blur}px)`;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index];
    const next = points[index + 1];
    ctx.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
  ctx.restore();
}

function drawBrokenPuffs(points, tendril, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity * smoke.breakup * 0.54;
  ctx.fillStyle = smoke.colour;
  ctx.filter = `blur(${18 + smoke.wispThinness * 15}px)`;
  for (let index = 4; index < points.length; index += 3) {
    const point = points[index];
    const gapChance = Math.sin(index * 4.28 + tendril.phase * 3.1);
    if (gapChance < 0.05 - smoke.breakup * 0.95) continue;
    const radius = (12 + index * 1.8) * tendril.width * (0.55 + smoke.breakup);
    ctx.beginPath();
    ctx.ellipse(point.x, point.y, radius, radius * (0.7 + smoke.verticalStretch * 0.35), tendril.phase, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function buildTendrils() {
  const count = 4 + Math.round(smoke.breakup * 5);
  smoke.tendrils = Array.from({ length: count }, (_, index) => {
    const offsetRatio = count === 1 ? 0 : index / (count - 1) - 0.5;
    return {
      originOffset: offsetRatio * smoke.sourceWidth + randomBetween(-18, 18),
      ageOffset: Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      width: randomBetween(0.62, 1.27),
      alpha: randomBetween(0.55, 1),
      windBias: randomBetween(0.72, 1.25)
    };
  });
}

function updateOutputs() {
  Object.entries(outputIds).forEach(([property, id]) => {
    const output = document.getElementById(id);
    if (!output) return;
    const value = smoke[property];
    output.textContent = property === 'sourceWidth' ? `${Math.round(value)}px` : Number(value).toFixed(2);
  });
}

function updateSmokeJson() {
  const output = document.getElementById('json-output');
  if (!output) return;
  let prototype;
  try {
    prototype = JSON.parse(output.textContent || '{}');
  } catch (error) {
    return;
  }
  if (smoke.active) {
    prototype.preset = 'smoke';
    prototype.formMode = 'wispy-smoke';
    prototype.smokeWisp = {
      colour: smoke.colour,
      opacity: smoke.opacity,
      wispThinness: smoke.wispThinness,
      verticalStretch: smoke.verticalStretch,
      breakup: smoke.breakup,
      curlAmount: smoke.curl,
      riseSpeed: smoke.riseSpeed,
      sourceWidth: smoke.sourceWidth,
      fadeHeight: smoke.fadeHeight,
      windPush: smoke.windPush
    };
  } else {
    delete prototype.formMode;
    delete prototype.smokeWisp;
  }
  output.textContent = JSON.stringify(prototype, null, 2);
}

function envelope(lifecycle) {
  const fadeIn = Math.min(1, lifecycle / 0.17);
  const fadeStart = smoke.fadeHeight;
  const fadeOut = lifecycle < fadeStart ? 1 : Math.max(0, 1 - (lifecycle - fadeStart) / Math.max(0.05, 1 - fadeStart));
  return fadeIn * fadeOut;
}

function fitStage(width, height, designWidth, designHeight) {
  const scale = Math.min(width / designWidth, height / designHeight);
  return { scale, x: (width - designWidth * scale) / 2, y: (height - designHeight * scale) / 2 };
}

function rgba(hex, alpha) {
  const cleaned = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : 'ffffff';
  const red = parseInt(cleaned.slice(0, 2), 16);
  const green = parseInt(cleaned.slice(2, 4), 16);
  const blue = parseInt(cleaned.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, alpha))})`;
}

function mod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

let toastTimer;
function showToast(message) {
  const element = document.getElementById('toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => element.classList.remove('visible'), 2400);
}
