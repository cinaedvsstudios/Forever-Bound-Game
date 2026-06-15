const TAU = Math.PI * 2;

export function isPrototypeRenderableLayer(layer) {
  return Boolean(layer && layer.visible !== false && (layer.engine === 'prototype-smoke' || layer.engine === 'prototype-shimmer' || layer.prototypeFolder));
}

export function drawPrototypeLayer(ctx, layer, scaleValue = 1, timeMs = 0, stage = {}) {
  if (!isPrototypeRenderableLayer(layer)) return;
  const t = (Number(timeMs) || 0) / 1000;
  const stageWidth = Number(stage.width) || 1280;
  const stageHeight = Number(stage.height) || 720;
  if (layer.engine === 'prototype-smoke' || layer.prototypeFolder === 'smoke-engine') {
    drawPrototypeSmoke(ctx, layer, scaleValue, t, stageWidth, stageHeight);
    return;
  }
  drawPrototypeShimmer(ctx, layer, scaleValue, t, stageWidth, stageHeight);
}

function drawPrototypeSmoke(ctx, layer, scale, t, stageWidth, stageHeight) {
  const mode = layer.mode || layer.prototypeMode || 'rising';
  if (mode === 'vignette') return drawSmokeVignette(ctx, layer, scale, t, stageWidth, stageHeight);
  if (mode === 'fullscreen') return drawFullScreenSmoke(ctx, layer, scale, t, stageWidth, stageHeight);
  if (mode === 'emission') return drawEmissionSmoke(ctx, layer, scale, t, stageWidth, stageHeight);
  if (mode === 'wispy') return drawWispySmoke(ctx, layer, scale, t, stageWidth, stageHeight);
  return drawRisingSmoke(ctx, layer, scale, t, stageWidth, stageHeight);
}

function drawRisingSmoke(ctx, layer, scale, t, stageWidth, stageHeight) {
  const x = finite(layer.emitterX, stageWidth * 0.5) * scale;
  const y = finite(layer.emitterY, stageHeight * 0.72) * scale;
  drawSmokeBody(ctx, layer, x, y, scale, t, { width: 260 * scale, height: 330 * scale, rise: true, countBias: 1 });
  drawSmokeWisps(ctx, layer, x, y, scale, t, { width: 220 * scale, height: 310 * scale, countBias: 1 });
}

function drawWispySmoke(ctx, layer, scale, t, stageWidth, stageHeight) {
  const x = finite(layer.emitterX, stageWidth * 0.5) * scale;
  const y = finite(layer.emitterY, stageHeight * 0.7) * scale;
  drawSmokeBody(ctx, layer, x, y, scale, t, { width: 180 * scale, height: 280 * scale, rise: true, countBias: 0.45, alphaBias: 0.55 });
  drawSmokeWisps(ctx, layer, x, y, scale, t, { width: 190 * scale, height: 330 * scale, countBias: 1.25, thin: true });
}

function drawEmissionSmoke(ctx, layer, scale, t, stageWidth, stageHeight) {
  const x = percentPoint(layer.sourceX, 50, stageWidth) * scale;
  const y = percentPoint(layer.sourceY, 76, stageHeight) * scale;
  const width = finite(layer.sourceWidth, 34) * scale;
  const height = finite(layer.height, 400) * scale;
  drawSmokeBody(ctx, layer, x, y, scale, t, { width: Math.max(width * 4, 160 * scale), height, rise: true, countBias: 1.15 });
  drawSmokeWisps(ctx, layer, x, y, scale, t, { width: Math.max(width * 3, 120 * scale), height, countBias: 1.05 });
  if (layer.showMarker) drawSmokeOriginMarker(ctx, x, y, width, scale);
}

function drawFullScreenSmoke(ctx, layer, scale, t, stageWidth, stageHeight) {
  const tint = layer.colour || layer.colourHex || layer.colorA || '#dce2e7';
  const opacity = clamp(finite(layer.mistOpacity, 0.36), 0, 1) * 0.42;
  const amount = Math.round(28 + clamp(finite(layer.density, 0.86), 0, 1) * 58);
  const puff = clamp(finite(layer.puffSize, 1.73), 0.25, 2) * 105 * scale;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(8, puff * 0.08)}px)`;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i * 2.13);
    const phase = (t * (0.035 + h * 0.025) + h) % 1;
    const x = ((hash(i + 10) * stageWidth + Math.sin(t * 0.17 + i) * 60) % stageWidth) * scale;
    const y = ((phase * stageHeight * 1.35) - stageHeight * 0.18 + hash(i + 20) * 80) * scale;
    softBlob(ctx, x, y, puff * (0.45 + h * 1.4), tint, opacity * (0.18 + h * 0.36));
  }
  ctx.restore();
}

function drawSmokeVignette(ctx, layer, scale, t, stageWidth, stageHeight) {
  const tint = layer.colour || layer.colourHex || layer.colorA || '#dce2e7';
  const opacity = clamp(finite(layer.mistOpacity, 0.36), 0, 1) * 0.65;
  const edge = clamp(finite(layer.edge, 0.64), 0.1, 1);
  const clear = clamp(finite(layer.clear, 0.54), 0.18, 0.9);
  const bias = clamp(finite(layer.bias, 0), -1, 1);
  const width = stageWidth * scale;
  const height = stageHeight * scale;
  const amount = Math.round(36 + edge * 68);
  const puff = (55 + edge * 125) * scale;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(10, puff * 0.1)}px)`;
  for (let i = 0; i < amount; i += 1) {
    const side = i % 4;
    const h = hash(i + 31);
    const wobble = Math.sin(t * 0.35 + i * 1.9) * 28 * scale;
    let x = hash(i + 4) * width;
    let y = hash(i + 8) * height;
    if (side === 0) y = -puff * 0.25 + wobble + bias * 90 * scale;
    if (side === 1) x = width + puff * 0.12 + wobble;
    if (side === 2) y = height + puff * 0.12 + wobble + bias * 90 * scale;
    if (side === 3) x = -puff * 0.12 + wobble;
    softBlob(ctx, x, y, puff * (0.55 + h * 1.2), tint, opacity * (0.12 + h * 0.34));
  }
  ctx.globalCompositeOperation = 'destination-out';
  const center = ctx.createRadialGradient(width / 2, height * (0.5 + bias * 0.16), 0, width / 2, height * (0.5 + bias * 0.16), Math.min(width, height) * clear * 0.55);
  center.addColorStop(0, 'rgba(0,0,0,0.8)');
  center.addColorStop(0.68, 'rgba(0,0,0,0.32)');
  center.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = center;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawSmokeBody(ctx, layer, x, y, scale, t, options = {}) {
  const tint = layer.colour || layer.colourHex || layer.colorA || '#dce2e7';
  const opacity = clamp(finite(layer.mistOpacity, 0.36), 0, 1) * finite(options.alphaBias, 1);
  const density = clamp(finite(layer.density, 0.86), 0, 1);
  const definition = clamp(finite(layer.definition, 0.82), 0, 1);
  const amount = Math.round((10 + density * 28) * finite(options.countBias, 1));
  const puff = clamp(finite(layer.puffSize, 1.73), 0.25, 2) * 48 * scale;
  const width = finite(options.width, 240 * scale);
  const height = finite(options.height, 300 * scale);
  const gravityAngle = finite(layer.gravityAngle, -90) * Math.PI / 180;
  const drift = finite(layer.drift, 0.13) * 45 * scale;
  const turbulence = clamp(finite(layer.turbulence, 0.54), 0, 1);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(4, puff * (0.08 + (1 - definition) * 0.12))}px)`;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 1.51);
    const life = (t * (0.045 + h * 0.035) + h) % 1;
    const rise = life * height;
    const angleX = Math.cos(gravityAngle) * rise * 0.25;
    const angleY = Math.sin(gravityAngle) * rise;
    const wave = Math.sin(t * (0.45 + h) + i * 2.1) * width * turbulence * 0.28;
    const px = x + angleX + (h - 0.5) * width + wave + drift * life;
    const py = y + angleY - (options.rise === false ? 0 : rise * 0.05);
    const alpha = opacity * (0.12 + h * 0.22) * Math.sin(life * Math.PI);
    softBlob(ctx, px, py, puff * (0.55 + h * 1.45) * (0.75 + life * 0.55), tint, alpha);
  }
  ctx.restore();
}

function drawSmokeWisps(ctx, layer, x, y, scale, t, options = {}) {
  const count = Math.round(clamp(finite(layer.wispCount, 13), 0, 50) * finite(options.countBias, 1));
  if (count <= 0) return;
  const tint = layer.colour || layer.colourHex || layer.colorA || '#dce2e7';
  const opacity = clamp(finite(layer.wispBrightness, 0.09), 0, 1.5);
  const length = clamp(finite(layer.wispLength, 0.95), 0.15, 1);
  const widthFactor = clamp(finite(layer.wispWidth, 0.42), 0.05, 1);
  const curl = clamp(finite(layer.curl, 0.94), 0, 1);
  const rotation = clamp(finite(layer.rotation, 0.91), 0, 1);
  const tailFade = clamp(finite(layer.tailFade, 0.98), 0.05, 1);
  const width = finite(options.width, 220 * scale);
  const height = finite(options.height, 300 * scale) * length;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = tint;
  ctx.shadowBlur = (options.thin ? 5 : 9) * scale;
  for (let i = 0; i < count; i += 1) {
    const h = hash(i + 80);
    const phase = t * (0.28 + rotation * 0.45 + h * 0.2) + h * TAU;
    const baseX = x + (h - 0.5) * width;
    const baseY = y - hash(i + 2) * height * 0.18;
    const lineWidth = Math.max(0.5, (options.thin ? 1.3 : 3.8) * scale * widthFactor * (0.55 + h));
    ctx.strokeStyle = withAlpha(tint, opacity * (0.18 + h * 0.28));
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let s = 0; s <= 22; s += 1) {
      const u = s / 22;
      const fade = Math.sin(Math.min(1, u / tailFade) * Math.PI);
      const px = baseX + Math.sin(u * TAU * (1.1 + curl * 2.6) + phase) * width * 0.16 * fade;
      const py = baseY - u * height + Math.cos(phase + u * TAU) * height * 0.035;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
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

function drawPrototypeShimmer(ctx, layer, scale, t, stageWidth, stageHeight) {
  const type = resolveShimmerRenderType(layer);
  if (type === 'wormhole') return drawBasicWormhole(ctx, layer, scale, t, stageWidth, stageHeight);
  if (type === 'heat') return drawBasicHeatShimmer(ctx, layer, scale, t, stageWidth, stageHeight);
  if (type === 'transition') return drawBasicTransitionTear(ctx, layer, scale, t, stageWidth, stageHeight);
  return drawBasicPortalRing(ctx, layer, scale, t, stageWidth, stageHeight);
}

function resolveShimmerRenderType(layer) {
  const modeType = modeToType(layer.prototypeMode);
  if (modeType !== 'ring' && (!layer.type || layer.type === 'ring')) return modeType;
  if (['ring', 'wormhole', 'heat', 'transition'].includes(layer.type)) return layer.type;
  return modeType;
}

function drawBasicPortalRing(ctx, layer, scale, t, stageWidth, stageHeight) {
  const g = shimmerGeometry(layer, scale, stageWidth, stageHeight);
  const core = layer.coreColor || layer.colorA || '#32f1ff';
  const rim = layer.rimColor || layer.colorB || '#8e4dff';
  const accent = layer.accentColor || '#ffca66';
  const opacity = percent100(layer.rimAlpha, 58);
  const middleAlpha = percent100(layer.middleAlpha, 62);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(0, finite(layer.blur, 16) * 0.12 * scale)}px)`;
  const aperture = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.radius * 0.9);
  aperture.addColorStop(0, withAlpha(layer.middleColor || '#0b1731', middleAlpha * 0.75));
  aperture.addColorStop(0.72, withAlpha(core, middleAlpha * 0.24));
  aperture.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aperture;
  ctx.beginPath();
  ctx.ellipse(g.x, g.y, g.radius * 0.72 * g.scaleX, g.radius * 0.62 * g.scaleY, finite(layer.apertureRotation, 0) * Math.PI / 180, 0, TAU);
  ctx.fill();
  const clouds = Math.round(clamp(finite(layer.orbitCloudAmount, 24), 0, 80));
  for (let i = 0; i < clouds; i += 1) {
    const h = hash(i + 13);
    const a = h * TAU + t * finite(layer.orbitCloudSpeed, 35) * 0.018;
    const r = g.radius * (0.72 + hash(i + 9) * 0.42);
    const x = g.x + Math.cos(a) * r * g.scaleX;
    const y = g.y + Math.sin(a) * r * g.scaleY;
    softBlob(ctx, x, y, g.radius * (0.08 + h * 0.18), h > 0.55 ? rim : core, opacity * 0.18);
  }
  ctx.filter = 'none';
  drawRingStroke(ctx, g, rim, percent100(layer.outlineOpacity, 90), finite(layer.outlineThickness, 70) * 0.035 * scale, finite(layer.outlineGlow, 58) * 0.32 * scale, t, layer);
  drawPortalWisps(ctx, layer, g, t, core, accent);
  drawShimmerParticles(ctx, layer, g, t, accent, 'ring');
  ctx.restore();
}

function drawBasicWormhole(ctx, layer, scale, t, stageWidth, stageHeight) {
  const g = shimmerGeometry(layer, scale, stageWidth, stageHeight);
  const core = layer.coreColor || '#28dfff';
  const rim = layer.rimColor || '#255bff';
  const accent = layer.accentColor || '#9d5cff';
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  softBlob(ctx, g.x, g.y, g.radius * 1.35, rim, 0.12);
  softBlob(ctx, g.x, g.y, g.radius * 0.72, core, 0.18);
  drawRingStroke(ctx, g, rim, 0.5, Math.max(1, 2.2 * scale), 18 * scale, t, { outlinePulseSpeed: 18, outlinePulseStrength: 8 });
  const coreRadius = g.radius * 0.3;
  const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, coreRadius * 3.6);
  grad.addColorStop(0, withAlpha('#ffffff', 0.42));
  grad.addColorStop(0.22, withAlpha(core, 0.42));
  grad.addColorStop(0.62, withAlpha(rim, 0.18));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(g.x, g.y, coreRadius * (1 + Math.sin(t * 2.2) * 0.08), 0, TAU);
  ctx.fill();
  const arms = Math.round(clamp(finite(layer.armAmount, 64), 18, 96));
  const opacity = Math.max(0.42, percent100(layer.armOpacity, 68));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.filter = `blur(${Math.max(0.4, finite(layer.armExtraBlur, 0) * 0.25 * scale)}px)`;
  for (let i = 0; i < arms; i += 1) {
    const h = hash(i + 101);
    const start = h * TAU + t * finite(layer.armSpeed, 34) * 0.025;
    const curl = finite(layer.armCurl, 72) / 100 * 5.4;
    const length = g.radius * (0.42 + finite(layer.armRadius, 72) / 100 * 1.12) * (0.45 + h * 0.75);
    const color = h > 0.56 ? rim : h > 0.24 ? accent : core;
    ctx.strokeStyle = withAlpha(color, opacity * (0.12 + h * 0.24));
    ctx.shadowColor = color;
    ctx.shadowBlur = Math.max(8, finite(layer.glow, 12) * 0.42 * scale);
    ctx.lineWidth = Math.max(1.4, finite(layer.armThickness, 58) * 0.12 * scale * (0.42 + h));
    ctx.beginPath();
    for (let s = 0; s <= 30; s += 1) {
      const u = s / 30;
      const a = start + u * curl + Math.sin(t + u * 4 + h) * 0.18;
      const r = length * u;
      const x = g.x + Math.cos(a) * r * g.scaleX;
      const y = g.y + Math.sin(a) * r * g.scaleY;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.filter = 'none';
  drawShimmerParticles(ctx, layer, g, t, core, 'wormhole');
  ctx.restore();
}

function drawBasicHeatShimmer(ctx, layer, scale, t, stageWidth, stageHeight) {
  const g = shimmerGeometry(layer, scale, stageWidth, stageHeight);
  const core = layer.coreColor || '#ffe0a3';
  const rim = layer.rimColor || '#ff8a3d';
  const strength = clamp(finite(layer.strength, 36), 0, 100) / 100;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(2, finite(layer.blur, 42) * 0.09 * scale)}px)`;
  const height = g.radius * 0.58 * g.scaleY;
  const width = g.radius * 2.25 * g.scaleX;
  const lines = 18;
  ctx.lineCap = 'round';
  for (let i = 0; i < lines; i += 1) {
    const u = i / Math.max(1, lines - 1);
    const y = g.y - height / 2 + u * height;
    ctx.strokeStyle = withAlpha(i % 2 ? core : rim, 0.08 + strength * 0.12);
    ctx.lineWidth = Math.max(1, (1.2 + strength * 4) * scale);
    ctx.beginPath();
    for (let s = 0; s <= 26; s += 1) {
      const p = s / 26;
      const x = g.x - width / 2 + p * width;
      const wave = Math.sin(p * TAU * (2.5 + finite(layer.waveSize, 24) / 28) + t * finite(layer.waveSpeed, 58) * 0.06 + i) * (8 + strength * 26) * scale;
      if (s === 0) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }
  softBlob(ctx, g.x, g.y, width * 0.35, core, 0.08 + strength * 0.1);
  ctx.restore();
}

function drawBasicTransitionTear(ctx, layer, scale, t, stageWidth, stageHeight) {
  const g = shimmerGeometry(layer, scale, stageWidth, stageHeight);
  const core = layer.coreColor || '#d7f7ff';
  const rim = layer.rimColor || '#8e4dff';
  const accent = layer.accentColor || '#ff2538';
  const strength = Math.max(0.72, clamp(finite(layer.strength, 76), 0, 100) / 100);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${Math.max(0.6, finite(layer.blur, 18) * 0.06 * scale)}px)`;
  softBlob(ctx, g.x, g.y, g.radius * 0.72, accent, 0.16);
  softBlob(ctx, g.x, g.y, g.radius * 0.34, core, 0.34);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const height = g.radius * 2.1 * g.scaleY;
  const slices = 13;
  for (let i = 0; i < slices; i += 1) {
    const h = hash(i + 300);
    const side = i - slices / 2;
    const color = i % 3 === 0 ? core : i % 2 ? rim : accent;
    ctx.strokeStyle = withAlpha(color, 0.24 + strength * 0.32);
    ctx.shadowBlur = 22 * scale;
    ctx.shadowColor = color;
    ctx.lineWidth = Math.max(1.2, (2.4 + h * 7) * scale);
    ctx.beginPath();
    for (let s = 0; s <= 22; s += 1) {
      const u = s / 22;
      const y = g.y - height / 2 + u * height;
      const x = g.x + side * 8 * scale + Math.sin(u * TAU * (1.2 + h) + t * 8 + i) * g.radius * (0.1 + strength * 0.3);
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.filter = 'none';
  drawTearCrack(ctx, g, core, rim, accent, t, scale);
  drawShimmerParticles(ctx, layer, g, t, core, 'transition');
  ctx.restore();
}

function drawTearCrack(ctx, g, core, rim, accent, t, scale) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  ctx.shadowBlur = 30 * scale;
  ctx.shadowColor = core;
  ctx.strokeStyle = withAlpha(core, 0.86);
  ctx.lineWidth = Math.max(1.5, 3.2 * scale);
  ctx.beginPath();
  for (let s = 0; s <= 28; s += 1) {
    const u = s / 28;
    const y = g.y - g.radius * 1.05 + u * g.radius * 2.1;
    const x = g.x + Math.sin(u * TAU * 1.65 + t * 5) * g.radius * 0.13 + Math.sin(u * TAU * 4.2) * g.radius * 0.05;
    if (s === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowColor = accent;
  ctx.strokeStyle = withAlpha(accent, 0.42);
  ctx.lineWidth = Math.max(0.8, 1.6 * scale);
  ctx.beginPath();
  ctx.moveTo(g.x - g.radius * 0.32, g.y - g.radius * 0.58);
  ctx.lineTo(g.x + g.radius * 0.22, g.y - g.radius * 0.24);
  ctx.moveTo(g.x + g.radius * 0.28, g.y + g.radius * 0.18);
  ctx.lineTo(g.x - g.radius * 0.24, g.y + g.radius * 0.56);
  ctx.stroke();
  ctx.shadowColor = rim;
  drawRingStroke(ctx, g, rim, 0.34, Math.max(0.8, 1.1 * scale), 16 * scale, t, { outlinePulseSpeed: 36, outlinePulseStrength: 22 });
  ctx.restore();
}

function drawPortalWisps(ctx, layer, g, t, colorA, colorB) {
  const amount = Math.round(clamp(finite(layer.wispAmount, 44), 0, 72));
  const opacity = percent100(layer.wispOpacity, 42);
  if (amount <= 0 || opacity <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  ctx.shadowBlur = finite(layer.wispGlow, 38) * 0.18 * g.scale;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 70);
    const color = h > 0.5 ? colorA : colorB;
    ctx.shadowColor = color;
    ctx.strokeStyle = withAlpha(color, opacity * (0.09 + h * 0.2));
    ctx.lineWidth = Math.max(0.6, finite(layer.wispThickness, 42) * 0.035 * g.scale * (0.4 + h));
    const yBase = g.y + (h - 0.5) * g.radius * 1.1;
    ctx.beginPath();
    for (let s = 0; s <= 24; s += 1) {
      const u = s / 24;
      const x = g.x - g.radius * 0.9 + u * g.radius * 1.8;
      const y = yBase + Math.sin(u * TAU * (1.1 + finite(layer.wispCurl, 62) / 38) + t * finite(layer.wispSpeed, 46) * 0.04 + i) * g.radius * 0.14;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawShimmerParticles(ctx, layer, g, t, color, mode) {
  const amount = Math.round(clamp(finite(layer.particleAmount, mode === 'transition' ? 34 : 36), 0, 90));
  const opacity = Math.max(mode === 'transition' ? 0.38 : 0.14, percent100(layer.particleOpacity, mode === 'wormhole' ? 28 : 48));
  if (amount <= 0 || opacity <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.shadowColor = color;
  ctx.shadowBlur = finite(layer.particleGlow, 28) * 0.22 * g.scale;
  for (let i = 0; i < amount; i += 1) {
    const h = hash(i + 41);
    const a = h * TAU + t * finite(layer.particleSpeed, 40) * 0.025;
    const r = g.radius * (0.2 + hash(i + 2) * (finite(layer.particleSpread, 72) / 70));
    const size = Math.max(0.8, finite(layer.particleSize, 22) * 0.08 * g.scale * (0.5 + h));
    ctx.fillStyle = withAlpha(color, opacity * (0.18 + h * 0.4));
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(a) * r * g.scaleX, g.y + Math.sin(a) * r * g.scaleY, size, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawRingStroke(ctx, g, color, opacity, thickness, glow, t, layer) {
  if (opacity <= 0) return;
  const pulse = 1 + Math.sin(t * finite(layer.outlinePulseSpeed, 48) * 0.06) * percent100(layer.outlinePulseStrength, 18) * 0.08;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = withAlpha(color, opacity);
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;
  ctx.lineWidth = Math.max(0.5, thickness);
  ctx.beginPath();
  ctx.ellipse(g.x, g.y, g.radius * pulse * g.scaleX, g.radius * pulse * g.scaleY, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function shimmerGeometry(layer, scale, stageWidth, stageHeight) {
  const x = percentPoint(layer.positionX, 50, stageWidth) * scale;
  const y = percentPoint(layer.positionY, 50, stageHeight) * scale;
  const baseRadius = Math.min(stageWidth, stageHeight) * 0.33 * scale;
  const radius = baseRadius * clamp(finite(layer.radius, 50), 4, 120) / 100 * clamp(finite(layer.renderScale, 100), 20, 220) / 100;
  return {
    x,
    y,
    radius,
    scale,
    scaleX: clamp(finite(layer.scaleX, 100), 10, 250) / 100,
    scaleY: clamp(finite(layer.scaleY, 100), 10, 250) / 100
  };
}

function modeToType(mode) {
  if (mode === 'wormhole-tunnel') return 'wormhole';
  if (mode === 'heat-shimmer') return 'heat';
  if (mode === 'transition-tear') return 'transition';
  return 'ring';
}

function softBlob(ctx, x, y, radius, color, alpha) {
  if (radius <= 0 || alpha <= 0) return;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, withAlpha(color, alpha));
  gradient.addColorStop(0.55, withAlpha(color, alpha * 0.38));
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
}

function percentPoint(value, fallback, full) {
  return clamp(finite(value, fallback), 0, 100) / 100 * full;
}

function percent100(value, fallback) {
  return clamp(finite(value, fallback), 0, 100) / 100;
}

function withAlpha(color, alpha) {
  const rgba = parseColor(color);
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${clamp(alpha, 0, 1)})`;
}

function parseColor(color) {
  const string = String(color || '').trim();
  const hex = string.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/iu);
  if (!hex) return { r: 255, g: 255, b: 255 };
  let value = hex[1];
  if (value.length === 3) value = value.split('').map((char) => char + char).join('');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function hash(value) {
  const x = Math.sin((Number(value) || 0) * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
