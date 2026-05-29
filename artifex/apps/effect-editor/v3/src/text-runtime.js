import { Particle } from './fx-runtime.js';

const textRuntimeState = new Map();
const SAFE_FONTS = new Map([
  ['Cinzel, Georgia, serif', 'Cinzel, Georgia, serif'],
  ['Georgia, serif', 'Georgia, serif'],
  ['Garamond, serif', 'Garamond, serif'],
  ['Arial, sans-serif', 'Arial, sans-serif'],
  ['monospace', 'Consolas, Menlo, monospace']
]);
const EMISSION_MODES = new Set(['once', 'loop', 'continuous']);
const REVEAL_MODES = new Set(['all', 'line', 'character']);
const lineLayoutCache = new Map();
const LINE_LAYOUT_CACHE_LIMIT = 160;

export function isTextLayer(layer) {
  return Boolean(layer && ((layer.appearanceMode === 'shape' && layer.particleShape === 'text') || layer.engine === 'text'));
}

export function spawnTextParticlesForLayer(layer, densityScale = 1) {
  if (!layer?.visible) return [];
  const state = getTextRuntimeState(layer);
  const emissionMode = normalizeEmissionMode(layer.textEmissionMode);
  const reveal = normalizeRevealMode(layer.textRevealMode);
  syncRuntimeKeys(state, layer, emissionMode, reveal);
  state.frame = (state.frame || 0) + 1;

  if (emissionMode === 'once' && state.onceCompleted) return [];
  if (state.nextEmissionFrame && state.frame < state.nextEmissionFrame) return [];

  const density = Math.max(0, Math.min(10, finite(layer.textDensity, finite(layer.spawnRate, 4)))) * Math.max(0, densityScale);
  const token = chooseTextToken(layer, state, reveal);
  const count = getTextParticleCount(density, emissionMode, reveal);
  const particles = [];
  for (let index = 0; index < count; index += 1) {
    particles.push(createTextParticle(layer, state, token.text));
  }

  scheduleNextEmission(layer, state, emissionMode, reveal, token.completedCycle);
  return particles;
}

export function drawTextParticle(ctx, particle, layer, scale) {
  const t = Math.min(1, particle.age / Math.max(1, particle.life));
  const ramp = sampleAppearanceRamp(layer, easeOut(t));
  const alpha = ramp.opacity * finite(layer.textureAlpha, 1);
  if (alpha <= 0.005) return;

  const x = particle.x * scale;
  const y = particle.y * scale;
  const baseSize = Math.max(4, ramp.size) * scale;
  const textSize = finite(layer.textSizeOverride, 0) > 0 ? finite(layer.textSizeOverride, 0) * scale : baseSize;
  const safeSize = Math.max(6, Math.min(160 * scale, textSize));
  const textRotation = degreesToRadians(finite(layer.textRotation, 0));
  const color = rgbaFromHex(ramp.color, 1);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(layer.textKeepUpright !== false ? textRotation : particle.rotation + textRotation);
  ctx.globalCompositeOperation = layer.blendMode || 'lighter';
  ctx.globalAlpha *= alpha;
  if (ramp.glow > 0) {
    ctx.shadowBlur = ramp.glow * scale;
    ctx.shadowColor = ramp.color;
  }

  const font = safeFont(layer.textFont);
  ctx.font = `${safeWeight(layer.textWeight)} ${safeSize}px ${font}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = layer.textAlign || 'center';

  const rawText = String(particle.textToken ?? layer.textContent ?? 'AETHERA').slice(0, 420);
  const blockWidth = Math.max(0, finite(layer.textBlockWidth, 0)) * scale;
  const maxLines = normalizeEmissionMode(layer.textEmissionMode) === 'continuous' ? 6 : 10;
  const lines = prepareLinesCached(ctx, rawText, blockWidth, maxLines).slice(0, maxLines);
  const lineHeight = safeSize * Math.max(0.7, Math.min(3, finite(layer.textLineSpacing, 1.2)));
  const letterSpacing = Math.max(0, Math.min(32 * scale, finite(layer.textLetterSpacing, 0) * scale));
  const startY = -((lines.length - 1) * lineHeight) / 2;
  const originX = textOriginX(ctx.textAlign, blockWidth);

  ctx.fillStyle = color;
  if (layer.textStroke) {
    ctx.lineWidth = Math.max(0.5, finite(layer.textStrokeWidth, 2) * scale);
    ctx.strokeStyle = 'rgba(0,0,0,0.68)';
  }

  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    if (layer.textStroke) drawTextLine(ctx, line, originX, y, letterSpacing, true);
    drawTextLine(ctx, line, originX, y, letterSpacing, false);
  });

  ctx.restore();
}

function createTextParticle(layer, state, textToken) {
  const particle = new Particle(applyTextMotionProfile(layer));
  const scatter = Math.max(0, finite(layer.textScatter, 0));
  const keepTogether = layer.textKeepBlockTogether !== false;
  const direction = layer.textDirection || 'rise';

  if (!keepTogether && scatter > 0) {
    particle.x += randomRange(-scatter, scatter);
    particle.y += randomRange(-scatter, scatter);
    particle.vx += randomRange(-scatter, scatter) * 0.01;
    particle.vy += randomRange(-scatter, scatter) * 0.01;
  }

  if (direction === 'rise') particle.vy = -Math.abs(particle.vy || 0.25) - 0.08;
  else if (direction === 'fall') particle.vy = Math.abs(particle.vy || 0.25) + 0.08;
  else if (direction === 'static') {
    particle.vx *= 0.08;
    particle.vy *= 0.08;
  } else if (direction === 'drift') {
    particle.vx += randomRange(-0.25, 0.25);
    particle.vy += randomRange(-0.12, 0.12);
  }

  const speed = getTextGeneralSpeed(layer);
  particle.vx *= speed;
  particle.vy *= speed;

  const bias = layer.textLifetimeBias || 'normal';
  const lifetimeMultiplier = bias === 'short' ? 0.62 : bias === 'long' ? 1.65 : 1;
  particle.life = Math.max(10, (particle.life * lifetimeMultiplier) / Math.sqrt(speed));
  particle.textToken = textToken;
  return particle;
}

function applyTextMotionProfile(layer) {
  const direction = layer.textDirection || 'rise';
  const patch = { ...layer };
  if (direction === 'rise') {
    patch.angle = -90;
    patch.spread = Math.min(finite(layer.spread, 18), 40);
  } else if (direction === 'fall') {
    patch.angle = 90;
    patch.spread = Math.min(finite(layer.spread, 18), 40);
  } else if (direction === 'static') {
    patch.speedMin = 0;
    patch.speedMax = Math.min(finite(layer.speedMax, 0.5), 0.5);
    patch.gravity = 0;
  }
  return patch;
}

function chooseTextToken(layer, state, reveal) {
  const text = String(layer.textContent || 'AETHERA').slice(0, 600);
  if (reveal === 'line') {
    const lines = text.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return { text, completedCycle: true };
    const index = Math.min(lines.length - 1, state.nextLineIndex || 0);
    const completedCycle = index >= lines.length - 1;
    state.nextLineIndex = completedCycle ? 0 : index + 1;
    return { text: lines[index], completedCycle };
  }
  if (reveal === 'character') {
    const chars = Array.from(text.replace(/\s+/gu, ' ').trim()).filter((char) => char !== ' ');
    if (!chars.length) return { text, completedCycle: true };
    const index = Math.min(chars.length - 1, state.nextCharIndex || 0);
    const completedCycle = index >= chars.length - 1;
    state.nextCharIndex = completedCycle ? 0 : index + 1;
    return { text: chars[index], completedCycle };
  }
  return { text, completedCycle: true };
}

function normalizeEmissionMode(value) {
  const mode = String(value || '').trim().toLowerCase();
  return EMISSION_MODES.has(mode) ? mode : 'loop';
}

function normalizeRevealMode(value) {
  const reveal = String(value || '').trim().toLowerCase();
  return REVEAL_MODES.has(reveal) ? reveal : 'all';
}

function syncRuntimeKeys(state, layer, mode, reveal) {
  const signature = `${mode}|${reveal}|${String(layer.textContent || '').slice(0, 600)}`;
  if (state.signature === signature) return;
  state.signature = signature;
  state.emissionMode = mode;
  state.reveal = reveal;
  state.frame = 0;
  state.nextEmissionFrame = 0;
  state.onceCompleted = false;
  state.nextLineIndex = 0;
  state.nextCharIndex = 0;
}

function scheduleNextEmission(layer, state, mode, reveal, completedCycle) {
  if (mode === 'once' && completedCycle) {
    state.onceCompleted = true;
    return;
  }
  const delay = getDelayForNextEmission(layer, reveal, completedCycle);
  state.nextEmissionFrame = (state.frame || 0) + delay;
}

function getDelayForNextEmission(layer, reveal, completedCycle) {
  const spawnDelay = getFrameDelay(layer.textSpawnDelay, 0, 0, 240);
  if (completedCycle) return Math.max(spawnDelay, getFrameDelay(layer.textBlockDelay, 72, 1, 240));
  if (reveal === 'line') return Math.max(spawnDelay, getFrameDelay(layer.textLineDelay, 12, 1, 120));
  if (reveal === 'character') return Math.max(spawnDelay, getFrameDelay(layer.textCharacterDelay, 4, 1, 90));
  return Math.max(spawnDelay, getFrameDelay(layer.textBlockDelay, 72, 1, 240));
}

function getFrameDelay(value, fallback, min, max) {
  return Math.max(min, Math.min(max, Math.round(finite(value, fallback))));
}

function getTextParticleCount(density, mode, reveal) {
  if (reveal === 'line' || reveal === 'character') return 1;
  if (mode === 'continuous') return getContinuousTextCount(density);
  return getBurstTextCount(density);
}

function getTextGeneralSpeed(layer) {
  return Math.max(0.25, Math.min(3, finite(layer.textGeneralSpeed, 1)));
}

function getBurstTextCount(density) {
  return Math.max(1, Math.min(3, Math.ceil(density / 3.25)));
}

function getContinuousTextCount(density) {
  const scaled = Math.min(3, density) / 8;
  const count = Math.floor(scaled);
  const chance = scaled - count;
  return count + (Math.random() < chance ? 1 : 0);
}

function getTextRuntimeState(layer) {
  if (!textRuntimeState.has(layer.id)) textRuntimeState.set(layer.id, {});
  return textRuntimeState.get(layer.id);
}


function prepareLinesCached(ctx, text, blockWidth, maxLines) {
  const normalizedText = String(text || '').slice(0, 420);
  const normalizedWidth = Math.round(Number(blockWidth) || 0);
  const key = `${ctx.font}|${normalizedWidth}|${maxLines}|${normalizedText}`;
  const cached = lineLayoutCache.get(key);
  if (cached) return cached;
  const lines = prepareLines(ctx, normalizedText, normalizedWidth).slice(0, maxLines).map((line) => String(line).slice(0, 120));
  lineLayoutCache.set(key, lines);
  if (lineLayoutCache.size > LINE_LAYOUT_CACHE_LIMIT) {
    const firstKey = lineLayoutCache.keys().next().value;
    lineLayoutCache.delete(firstKey);
  }
  return lines;
}

function prepareLines(ctx, text, blockWidth) {
  const sourceLines = String(text || '').split(/\r?\n/u);
  if (!blockWidth || blockWidth < 40) return sourceLines.length ? sourceLines : [''];
  const wrapped = [];
  sourceLines.forEach((line) => {
    const words = line.split(/\s+/u).filter(Boolean);
    if (!words.length) {
      wrapped.push('');
      return;
    }
    let current = '';
    words.forEach((word) => {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width > blockWidth && current) {
        wrapped.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });
    if (current) wrapped.push(current);
  });
  return wrapped.length ? wrapped : [''];
}

function drawTextLine(ctx, text, x, y, letterSpacing, stroke = false) {
  if (!letterSpacing) {
    if (stroke) ctx.strokeText(text, x, y);
    else ctx.fillText(text, x, y);
    return;
  }
  const chars = Array.from(String(text).slice(0, 120));
  const widths = chars.map((char) => ctx.measureText(char).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, chars.length - 1) * letterSpacing;
  let cursor = x;
  if (ctx.textAlign === 'center') cursor -= total / 2;
  if (ctx.textAlign === 'right') cursor -= total;
  const originalAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((char, index) => {
    if (stroke) ctx.strokeText(char, cursor, y);
    else ctx.fillText(char, cursor, y);
    cursor += widths[index] + letterSpacing;
  });
  ctx.textAlign = originalAlign;
}

function textOriginX(align, blockWidth) {
  if (!blockWidth) return 0;
  if (align === 'left') return -blockWidth / 2;
  if (align === 'right') return blockWidth / 2;
  return 0;
}

function sampleAppearanceRamp(layer, t) {
  const stops = getAppearanceStops(layer);
  if (stops.length === 1) return stops[0];
  const sampleT = layer.reverseColor ? 1 - t : t;
  let left = stops[0];
  let right = stops[stops.length - 1];
  for (let index = 0; index < stops.length - 1; index += 1) {
    if (sampleT >= stops[index].position && sampleT <= stops[index + 1].position) {
      left = stops[index];
      right = stops[index + 1];
      break;
    }
  }
  const span = Math.max(0.0001, right.position - left.position);
  const localT = Math.min(1, Math.max(0, (sampleT - left.position) / span));
  return {
    color: mixHexRaw(left.color, right.color, localT),
    opacity: lerp(left.opacity, right.opacity, localT),
    size: lerp(left.size, right.size, localT),
    glow: lerp(left.glow, right.glow, localT)
  };
}

function getAppearanceStops(layer) {
  if (Array.isArray(layer.appearanceStops) && layer.appearanceStops.length) {
    return layer.appearanceStops.map((stop, index) => ({
      position: Math.min(1, Math.max(0, finite(stop.position, index))),
      color: normalizeHex(stop.color || layer.colorA || '#ffcc66'),
      opacity: Math.min(1, Math.max(0, finite(stop.opacity, index === 0 ? layer.alphaStart : layer.alphaEnd))),
      size: Math.max(0.5, finite(stop.size, index === 0 ? layer.sizeStart : layer.sizeEnd)),
      glow: Math.max(0, finite(stop.glow, index === 0 ? layer.glow : 0))
    })).sort((a, b) => a.position - b.position);
  }
  return [
    { position: 0, color: layer.colorA || '#ffcc66', opacity: finite(layer.alphaStart, 1), size: finite(layer.sizeStart, 20), glow: finite(layer.glow, 12) },
    { position: 1, color: layer.colorB || '#ff6600', opacity: finite(layer.alphaEnd, 0), size: finite(layer.sizeEnd, 4), glow: 0 }
  ];
}

function safeFont(value) {
  return SAFE_FONTS.get(String(value || '').trim()) || 'Cinzel, Georgia, serif';
}

function safeWeight(value) {
  const weight = String(value || '700');
  return ['400', '500', '700', '900'].includes(weight) ? weight : '700';
}

function mixHexRaw(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = Math.round(lerp(ca.r, cb.r, t));
  const g = Math.round(lerp(ca.g, cb.g, t));
  const blue = Math.round(lerp(ca.b, cb.b, t));
  return `#${toHex(r)}${toHex(g)}${toHex(blue)}`;
}

function rgbaFromHex(hex, alpha = 1) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function hexToRgb(hex) {
  const normalized = normalizeHex(hex).replace('#', '').trim();
  const number = Number.parseInt(normalized, 16);
  return { r: (number >> 16) & 255, g: (number >> 8) & 255, b: number & 255 };
}

function normalizeHex(value) {
  const string = String(value || '').trim();
  if (/^#[0-9a-f]{6}$/iu.test(string)) return string;
  if (/^#[0-9a-f]{3}$/iu.test(string)) return `#${string.slice(1).split('').map((char) => char + char).join('')}`;
  return '#ffcc66';
}

function toHex(value) {
  return Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0');
}

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 2);
}

function lerp(a, b, t) {
  return Number(a) + (Number(b) - Number(a)) * t;
}

function randomRange(min, max) {
  return Number(min) + Math.random() * (Number(max) - Number(min));
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}
