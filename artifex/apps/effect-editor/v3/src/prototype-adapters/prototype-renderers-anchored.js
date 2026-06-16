import {
  drawPrototypeLayer as drawFallbackPrototypeLayer,
  isPrototypeRenderableLayer
} from './prototype-renderers.js';

export { isPrototypeRenderableLayer };

const TAU = Math.PI * 2;
const DESIGN_W = 1280;
const DESIGN_H = 720;

export function drawPrototypeLayer(ctx, layer, scaleValue = 1, timeMs = 0, stage = {}) {
  if (layer?.visible === false) return;
  if (layer?.engine === 'prototype-smoke' || layer?.prototypeFolder === 'smoke-engine') {
    drawAnchoredSmoke(ctx, layer, scaleValue, (Number(timeMs) || 0) / 1000, Number(stage.width) || DESIGN_W, Number(stage.height) || DESIGN_H);
    return;
  }
  drawFallbackPrototypeLayer(ctx, layer, scaleValue, timeMs, stage);
}

function drawAnchoredSmoke(ctx, layer, scale, t, stageWidth, stageHeight) {
  const state = smokeState(layer, stageWidth, stageHeight);
  const passes = state.doubleLayer ? 2 : 1;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.imageSmoothingEnabled = true;
  for (let pass = 0; pass < passes; pass += 1) {
    const phase = pass ? 1.73 : 0;
    const alpha = pass ? 0.82 : 1;
    const shiftX = pass ? 8 : 0;
    const shiftY = pass ? -5 : 0;
    const seed = state.seed + pass * 7919;
    drawSmokePass(ctx, state, seed, t, phase, alpha, shiftX, shiftY, scale, stageWidth, stageHeight);
  }
  if (state.mode === 'vignette') cutAnchoredVignetteCentre(ctx, state, scale);
  ctx.restore();

  if (state.mode === 'emission' && state.showMarker) {
    drawSmokeOriginMarker(ctx, state.anchorX * scale, state.anchorY * scale, state.sourceWidth * scale, scale);
  }
}

function smokeState(layer, stageWidth, stageHeight) {
  const mode = layer.prototypeMode || layer.mode || inferSmokeMode(layer.name) || 'rising';
  const anchorX = mode === 'emission'
    ? percentToPoint(layer.sourceX, 50, stageWidth)
    : clamp(finite(layer.emitterX, stageWidth * 0.5), 0, stageWidth);
  const anchorY = mode === 'emission'
    ? percentToPoint(layer.sourceY, 76, stageHeight)
    : clamp(finite(layer.emitterY, stageHeight * 0.64), 0, stageHeight);
  return {
    mode,
    anchorX,
    anchorY,
    colour: layer.colour || layer.colourHex || layer.colorA || '#dce2e7',
    mistOpacity: clamp(finite(layer.mistOpacity, 0.36), 0, 1),
    density: clamp(finite(layer.density, 0.86), 0, 1),
    puffSize: clamp(finite(layer.puffSize, 1.73), 0.25, 2),
    definition: clamp(finite(layer.definition, 0.82), 0, 1),
    wispCount: Math.round(clamp(finite(layer.wispCount, 13), 0, 50)),
    wispBrightness: clamp(finite(layer.wispBrightness, 0.09), 0, 1.5),
    wispLength: clamp(finite(layer.wispLength, 0.95), 0.15, 1),
    wispWidth: clamp(finite(layer.wispWidth, 0.42), 0.05, 1),
    tailFade: clamp(finite(layer.tailFade, 0.98), 0.05, 1),
    curl: clamp(finite(layer.curl, 0.94), 0, 1),
    rotation: clamp(finite(layer.rotation, 0.91), 0, 1),
    duration: clamp(finite(layer.duration, 8.6), 1.5, 12),
    gravity: clamp(finite(layer.gravity, 0.31), 0, 3),
    gravityAngle: clamp(finite(layer.gravityAngle, -90), -180, 180),
    drift: clamp(finite(layer.drift, 0.13), -1, 1),
    turbulence: clamp(finite(layer.turbulence, 0.54), 0, 1),
    clear: clamp(finite(layer.clear, 0.54), 0.18, 0.9),
    edge: clamp(finite(layer.edge, 0.64), 0.1, 1),
    bias: clamp(finite(layer.bias, 0), -1, 1),
    sourceWidth: clamp(finite(layer.sourceWidth, 34), 4, 260),
    height: clamp(finite(layer.height, 400), 60, 680),
    showMarker: layer.showMarker !== false,
    doubleLayer: layer.doubleLayer !== false,
    seed: seedFromString(`${layer.id || layer.name || 'smoke'}|${mode}`)
  };
}

function drawSmokePass(ctx, state, seed, t, phase, layerAlpha, shiftX, shiftY, scale, stageWidth, stageHeight) {
  const basePuffs = { rising: 9, wispy: 2, vignette: 18, fullscreen: 22, emission: 6 }[state.mode] || 8;
  const puffCount = Math.min(34, Math.round(basePuffs + state.density * (state.mode === 'wispy' ? 5 : 12)));
  ctx.save();
  ctx.translate(shiftX * scale, shiftY * scale);
  for (let index = 0; index < puffCount; index += 1) {
    const puff = makePuff(state, seed, index, t, stageWidth, stageHeight);
    drawPuff(ctx, state, puff, phase, layerAlpha, t, scale);
  }
  for (let index = 0; index < state.wispCount; index += 1) {
    const ribbon = makeRibbon(state, seed, index, t, stageWidth, stageHeight);
    drawRibbon(ctx, state, ribbon, phase, layerAlpha, t, scale);
  }
  ctx.restore();
}

function makePuff(state, seed, index, t, stageWidth, stageHeight) {
  const lifeRand = seeded(seed + index * 101 + 17);
  const life = 4.8 + lifeRand() * 5.4;
  const ageSeed = lifeRand();
  const cycle = Math.floor(ageSeed + t / life);
  const rand = seeded(seed + index * 101 + cycle * 9973 + 31);
  const puff = {
    age: (ageSeed + t / life) % 1,
    life,
    radius: (76 + rand() * 138) * state.puffSize,
    phase: rand() * TAU,
    spin: (rand() - 0.5) * 0.12,
    alpha: 0.20 + rand() * 0.30
  };
  positionSmoke(state, puff, rand, false, stageWidth, stageHeight);
  return puff;
}

function makeRibbon(state, seed, index, t, stageWidth, stageHeight) {
  const lifeRand = seeded(seed + index * 151 + 71);
  const life = state.duration * (0.78 + lifeRand() * 0.42);
  const ageSeed = lifeRand();
  const cycle = Math.floor(ageSeed + t / life);
  const rand = seeded(seed + index * 151 + cycle * 11939 + 83);
  const ribbon = {
    age: (ageSeed + t / life) % 1,
    life,
    phase: rand() * TAU,
    angleOffset: (rand() - 0.5) * (state.mode === 'wispy' || state.mode === 'fullscreen' ? 1.55 : 0.58),
    swayA: (22 + rand() * 44) * (0.35 + state.curl),
    swayB: (18 + rand() * 62) * (0.35 + state.curl),
    turnA: rand() > 0.5 ? 1 : -1,
    turnB: rand() > 0.5 ? 1 : -1,
    foldSpeed: 0.45 + rand() * 0.92,
    width: (3.5 + rand() * 7.5) * (0.32 + state.wispWidth),
    maxLength: (180 + rand() * 320) * state.wispLength,
    alpha: 0.48 + rand() * 0.42
  };
  positionSmoke(state, ribbon, rand, true, stageWidth, stageHeight);
  return ribbon;
}

function positionSmoke(state, item, rand, ribbon, stageWidth, stageHeight) {
  if (state.mode === 'emission') {
    item.originX = state.anchorX + (rand() - 0.5) * state.sourceWidth;
    item.originY = state.anchorY;
    item.plume = state.height * (0.74 + rand() * 0.28);
    return;
  }
  if (state.mode === 'vignette') {
    const edgeX = state.anchorX + (rand() - 0.5) * (360 + state.edge * 520);
    const edgeY = state.anchorY + (rand() - 0.5) * (220 + state.edge * 360) + state.bias * 82;
    const side = Math.floor(rand() * 4);
    item.originX = side < 2 ? edgeX : state.anchorX + (side === 2 ? -1 : 1) * (210 + state.edge * 260 + rand() * 120);
    item.originY = side < 2 ? state.anchorY + (side === 0 ? -1 : 1) * (130 + state.edge * 180 + rand() * 90) + state.bias * 82 : edgeY;
    item.plume = 170 + rand() * 180;
    return;
  }
  if (state.mode === 'fullscreen') {
    item.originX = state.anchorX + (rand() - 0.5) * stageWidth * 1.05;
    item.originY = state.anchorY + (rand() - 0.5) * stageHeight * 1.05;
    item.plume = 120 + rand() * 180;
    return;
  }
  if (state.mode === 'wispy') {
    item.originX = state.anchorX + (rand() - 0.5) * (ribbon ? 420 : 260);
    item.originY = state.anchorY + (rand() - 0.5) * (ribbon ? 260 : 180);
    item.plume = 230 + rand() * 370;
    return;
  }
  item.originX = state.anchorX + (rand() - 0.5) * 460;
  item.originY = state.anchorY + (rand() - 0.5) * 140;
  item.plume = 250 + rand() * 320;
}

function drawPuff(ctx, state, puff, phase, layerAlpha, t, scale) {
  const fade = smoothEnvelope(puff.age, 0.18, 0.32);
  const travel = smokeGravityVector(state, puff.age * (puff.plume || 330));
  let x = puff.originX + travel.x + state.drift * puff.age * 116 + Math.sin(puff.phase + phase + t * 0.36) * state.turbulence * 17;
  let y = puff.originY + travel.y;
  if (state.mode === 'vignette' || state.mode === 'fullscreen') {
    x = puff.originX + state.drift * puff.age * 90 + Math.sin(puff.phase + phase + t * 0.36) * state.turbulence * 17;
    y = puff.originY + Math.sin(t * 0.23 + phase + puff.phase) * state.turbulence * 10;
  }
  const modeAlpha = state.mode === 'wispy' ? 0.36 : state.mode === 'rising' ? 0.65 : 1;
  const radius = puff.radius * (0.82 + puff.age * 0.72) * scale;
  ctx.save();
  ctx.translate(x * scale, y * scale);
  ctx.rotate(puff.spin * (t + phase));
  ctx.globalAlpha = state.mistOpacity * puff.alpha * fade * modeAlpha * layerAlpha;
  drawSmokeBrush(ctx, state, radius);
  ctx.restore();
}

function drawSmokeBrush(ctx, state, radius) {
  const rand = seeded(seedFromString(`${state.colour}|${state.definition}|brush`));
  for (let index = 0; index < 12; index += 1) {
    const x = -radius * 0.28 + rand() * radius * 0.56;
    const y = -radius * 0.31 + rand() * radius * 0.62;
    const r = radius * (0.18 + rand() * 0.3);
    const gradient = ctx.createRadialGradient(x, y, 1, x, y, r);
    const alpha = 0.018 + rand() * (0.028 + state.definition * 0.032);
    gradient.addColorStop(0, rgba(state.colour, alpha));
    gradient.addColorStop(0.40, rgba(state.colour, alpha * 0.68));
    gradient.addColorStop(1, rgba(state.colour, 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.55 + rand() * 0.34), rand() * Math.PI, 0, TAU);
    ctx.fill();
  }
}

function drawRibbon(ctx, state, ribbon, phase, layerAlpha, t, scale) {
  const growth = easeOutCubic(clamp(ribbon.age / 0.42, 0, 1));
  const lifeFade = smoothEnvelope(ribbon.age, 0.12, 0.30);
  const length = ribbon.maxLength * growth;
  if (length < 3 || lifeFade <= 0) return;
  const geometry = makeRibbonPath(state, ribbon, length, phase, t);
  const brightness = ribbon.alpha * state.wispBrightness * lifeFade * layerAlpha;
  const gradient = ctx.createLinearGradient(geometry.start.x * scale, geometry.start.y * scale, geometry.end.x * scale, geometry.end.y * scale);
  const fadeSpan = 0.12 + state.tailFade * 0.10;
  gradient.addColorStop(0, rgba(state.colour, 0));
  gradient.addColorStop(fadeSpan, rgba(state.colour, brightness * 0.54));
  gradient.addColorStop(0.42, rgba(state.colour, brightness));
  gradient.addColorStop(0.72, rgba(state.colour, brightness * 0.68));
  gradient.addColorStop(1, rgba(state.colour, 0));
  strokeScaledPath(ctx, geometry.commands, gradient, ribbon.width * (8.2 + state.wispWidth * 3.6) * scale, 0.20, 'blur(5px)');
  strokeScaledPath(ctx, geometry.commands, gradient, ribbon.width * (2.4 + state.wispWidth * 1.5) * scale, 0.57, 'blur(1.3px)');
  strokeScaledPath(ctx, geometry.commands, gradient, Math.max(0.7, ribbon.width * (0.44 + state.wispWidth * 0.32)) * scale, 0.48 + state.definition * 0.25, 'none');
}

function makeRibbonPath(state, ribbon, length, phaseOffset, t) {
  const motion = (t + phaseOffset) * (0.34 + state.rotation * ribbon.foldSpeed);
  const baseAngle = state.gravityAngle * Math.PI / 180;
  const turn = Math.sin(ribbon.phase + motion * 0.38) * state.rotation * 0.46;
  const angle = baseAngle + ribbon.angleOffset + turn;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const nx = -dy;
  const ny = dx;
  const gravityPush = smokeGravityVector(state, ribbon.age * (ribbon.plume || 260) * 0.42);
  const baseDrift = state.drift * ribbon.age * length * 0.33;
  const baseWave = Math.sin(ribbon.phase + (t + phaseOffset) * 0.30) * state.turbulence * 9;
  let start = { x: ribbon.originX + gravityPush.x + baseDrift + nx * baseWave, y: ribbon.originY + gravityPush.y + ny * baseWave };
  if (state.mode === 'vignette' || state.mode === 'fullscreen') start = { x: ribbon.originX + baseDrift + nx * baseWave, y: ribbon.originY + ny * baseWave };
  const side1 = Math.sin(ribbon.phase + motion) * ribbon.swayA * ribbon.turnA;
  const side2 = Math.sin(ribbon.phase * 1.4 - motion * 0.72) * ribbon.swayB * ribbon.turnB;
  const side3 = Math.cos(ribbon.phase * 0.8 + motion * 1.05) * (ribbon.swayA * 0.74);
  const a = pointAlong(start, dx, dy, nx, ny, length * 0.32, side1);
  const b = pointAlong(start, dx, dy, nx, ny, length * 0.67, side2);
  const end = pointAlong(start, dx, dy, nx, ny, length, side3);
  const c1 = pointAlong(start, dx, dy, nx, ny, length * 0.12, side1 * 0.48);
  const c2 = pointAlong(a, dx, dy, nx, ny, -length * 0.09, side1 * 0.18);
  const c3 = pointAlong(a, dx, dy, nx, ny, length * 0.11, side2 * 0.26);
  const c4 = pointAlong(b, dx, dy, nx, ny, -length * 0.12, side2 * 0.20);
  const c5 = pointAlong(b, dx, dy, nx, ny, length * 0.12, side3 * 0.30);
  const c6 = pointAlong(end, dx, dy, nx, ny, -length * 0.11, side3 * 0.08);
  return { start, end, commands: [['M', start], ['C', c1, c2, a], ['C', c3, c4, b], ['C', c5, c6, end]] };
}

function strokeScaledPath(ctx, commands, strokeStyle, lineWidth, alpha, filter) {
  const path = new Path2D();
  commands.forEach((command) => {
    if (command[0] === 'M') path.moveTo(command[1].x, command[1].y);
    else path.bezierCurveTo(command[1].x, command[1].y, command[2].x, command[2].y, command[3].x, command[3].y);
  });
  ctx.save();
  ctx.strokeStyle = strokeStyle;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = lineWidth;
  ctx.filter = filter;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(path);
  ctx.restore();
}

function cutAnchoredVignetteCentre(ctx, state, scale) {
  const inner = DESIGN_H * state.clear * 0.46 * scale;
  const outer = inner + (80 + state.edge * 180) * scale;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const mask = ctx.createRadialGradient(state.anchorX * scale, (state.anchorY + state.bias * 92) * scale, inner, state.anchorX * scale, (state.anchorY + state.bias * 92) * scale, outer);
  mask.addColorStop(0, 'rgba(0,0,0,1)');
  mask.addColorStop(0.67, 'rgba(0,0,0,0.97)');
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, DESIGN_W * scale, DESIGN_H * scale);
  ctx.restore();
}

function smokeGravityVector(state, multiplier) {
  const angle = state.gravityAngle * Math.PI / 180;
  const strength = multiplier * (0.45 + state.gravity * 0.72);
  return { x: Math.cos(angle) * strength, y: Math.sin(angle) * strength };
}

function drawSmokeOriginMarker(ctx, x, y, width, scale) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,202,102,0.82)';
  ctx.lineWidth = Math.max(1, 1.4 * scale);
  ctx.beginPath();
  ctx.moveTo(x - width / 2, y);
  ctx.lineTo(x + width / 2, y);
  ctx.moveTo(x, y - 8 * scale);
  ctx.lineTo(x, y + 8 * scale);
  ctx.stroke();
  ctx.restore();
}

function pointAlong(origin, dx, dy, nx, ny, longitudinal, sideways) {
  return { x: origin.x + dx * longitudinal + nx * sideways, y: origin.y + dy * longitudinal + ny * sideways };
}

function inferSmokeMode(name = '') {
  const lower = String(name).toLowerCase();
  if (lower.includes('wispy') || lower.includes('incense')) return 'wispy';
  if (lower.includes('vignette')) return 'vignette';
  if (lower.includes('full')) return 'fullscreen';
  if (lower.includes('chimney') || lower.includes('emission')) return 'emission';
  if (lower.includes('rising')) return 'rising';
  return '';
}

function smoothEnvelope(age, fadeIn, fadeOut) {
  const inValue = clamp(age / Math.max(0.0001, fadeIn), 0, 1);
  const outValue = clamp((1 - age) / Math.max(0.0001, fadeOut), 0, 1);
  return easeOutCubic(Math.min(inValue, outValue));
}

function easeOutCubic(value) { return 1 - Math.pow(1 - clamp(value, 0, 1), 3); }
function percentToPoint(value, fallback, full) { return clamp(finite(value, fallback), 0, 100) / 100 * full; }
function rgba(color, alpha) { const c = parseColor(color); return `rgba(${c.r}, ${c.g}, ${c.b}, ${clamp(alpha, 0, 1)})`; }
function parseColor(color) { const string = String(color || '').trim(); const hex = string.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/iu); if (!hex) return { r: 255, g: 255, b: 255 }; let value = hex[1]; if (value.length === 3) value = value.split('').map((char) => char + char).join(''); return { r: parseInt(value.slice(0, 2), 16), g: parseInt(value.slice(2, 4), 16), b: parseInt(value.slice(4, 6), 16) }; }
function seeded(seed) { let value = seed >>> 0; return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; }; }
function seedFromString(value) { const string = String(value || 'seed'); let seed = 2166136261; for (let index = 0; index < string.length; index += 1) { seed ^= string.charCodeAt(index); seed = Math.imul(seed, 16777619) >>> 0; } return seed >>> 0; }
function finite(value, fallback) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
