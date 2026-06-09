const TAU = Math.PI * 2;
const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v)));
const clamp01 = (v) => clamp(v, 0, 1);
const scale = (min, max, v) => min + (max - min) * clamp01(v);
const fract = (v) => v - Math.floor(v);
const lerp = (a, b, t) => a + (b - a) * t;
const hash1 = (v) => fract(Math.sin(v * 127.1) * 43758.5453123);
const hash2 = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
const smoothstep = (a, b, v) => {
  const t = clamp01((v - a) / Math.max(0.0001, b - a));
  return t * t * (3 - 2 * t);
};

function noise2(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = fract(x);
  const fy = fract(y);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}

function fbm(x, y, octaves = 4) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i += 1) {
    value += noise2(x * frequency, y * frequency) * amplitude;
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return norm ? value / norm : 0;
}

function hexToRgb(hex) {
  const safe = String(hex || '#ffffff').replace('#', '').trim();
  const full = safe.length === 3 ? safe.split('').map((c) => c + c).join('') : safe.padEnd(6, '0').slice(0, 6);
  const value = Number.parseInt(full, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}
function rgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function cover(iw, ih, tw, th) {
  const ir = iw / Math.max(1, ih);
  const tr = tw / Math.max(1, th);
  let width = tw;
  let height = th;
  if (ir > tr) {
    height = th;
    width = height * ir;
  } else {
    width = tw;
    height = width / ir;
  }
  return { x: (tw - width) / 2, y: (th - height) / 2, width, height };
}

export class ShimmerDistortionEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridCanvas = document.createElement('canvas');
    this.grid = this.gridCanvas.getContext('2d');
    this.textureImage = null;
    this.overlayImage = null;
    this.values = {};
    this.gridKey = '';
  }

  setValues(values) {
    this.values = { ...values };
  }

  setTextureImage(image = null) {
    this.textureImage = image;
  }

  setOverlayImage(image = null) {
    this.overlayImage = image;
  }

  resize() {
    const ratio = Math.max(1, Math.min(1.6, window.devicePixelRatio || 1));
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(720, Math.round(rect.width * ratio));
    const height = Math.max(405, Math.round(rect.height * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gridCanvas.width = width;
      this.gridCanvas.height = height;
      this.gridKey = '';
    }
  }

  geo(t) {
    const v = this.values;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const base = Math.min(w, h) * scale(0.08, 0.62, (v.radius ?? 60) / 100);
    const pulse = 1 + Math.sin(t * scale(0.4, 4, (v.pulse ?? 45) / 100)) * 0.035 * ((v.loopIntensity ?? 50) / 100);
    return {
      w,
      h,
      cx: w * ((v.positionX ?? 50) / 100),
      cy: h * ((v.positionY ?? 50) / 100),
      base,
      rx: Math.max(0.01, base * ((v.scaleX ?? 100) / 100) * pulse),
      ry: Math.max(0.01, base * ((v.scaleY ?? 100) / 100) * pulse)
    };
  }

  draw(t = 0) {
    this.resize();
    const g = this.geo(t);
    const v = this.values;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, g.w, g.h);
    ctx.fillStyle = v.backdropColor || '#09080f';
    ctx.fillRect(0, 0, g.w, g.h);
    if (v.showGrid) this.drawGrid(g);

    if (v.type === 'heat') {
      this.drawShimmer(ctx, g, t);
      this.drawHeat(ctx, g, t);
    } else if (v.type === 'wormhole') {
      this.drawWormhole(ctx, g, t);
    } else if (v.type === 'transition') {
      this.drawShimmer(ctx, g, t);
      this.drawTransition(ctx, g, t);
    } else {
      this.drawPortalRing(ctx, g, t);
    }

    if (v.showMask && v.type !== 'heat' && v.type !== 'transition' && v.type !== 'ring') {
      ctx.save();
      ctx.strokeStyle = rgba(v.coreColor || '#32f1ff', 0.14);
      ctx.lineWidth = Math.max(1, g.base * 0.006);
      ctx.beginPath();
      ctx.ellipse(g.cx, g.cy, g.rx * 0.95, g.ry * 0.95, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawGrid(g) {
    const v = this.values;
    const key = `${g.w}x${g.h}|${v.coreColor}|${v.rimColor}|${v.accentColor}|${v.backdropColor}`;
    if (this.gridKey !== key) {
      this.gridKey = key;
      const ctx = this.grid;
      ctx.clearRect(0, 0, g.w, g.h);
      const major = Math.max(34, Math.round(g.w / 16));
      const minor = Math.max(17, Math.round(g.w / 32));
      ctx.lineWidth = Math.max(1, g.w / 900);
      for (let x = 0; x <= g.w; x += minor) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, g.h);
        ctx.strokeStyle = x % major === 0 ? rgba(v.coreColor, 0.18) : rgba(v.coreColor, 0.055);
        ctx.stroke();
      }
      for (let y = 0; y <= g.h; y += minor) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(g.w, y);
        ctx.strokeStyle = y % major === 0 ? rgba(v.rimColor, 0.14) : rgba(v.rimColor, 0.045);
        ctx.stroke();
      }
    }
    this.ctx.drawImage(this.gridCanvas, 0, 0);
  }

  drawShimmer(ctx, g, t) {
    const v = this.values;
    const strength = scale(0, 0.24, (v.strength ?? 50) / 100);
    const refraction = scale(0, 0.16, (v.refraction ?? 50) / 100);
    const waveSize = scale(0.006, 0.08, (v.waveSize ?? 40) / 100);
    const waveSpeed = scale(0.15, 4.8, (v.waveSpeed ?? 40) / 100);
    const softness = scale(0.06, 0.55, (v.softness ?? 50) / 100);
    const step = v.type === 'heat' ? Math.max(4, Math.round(g.h / 90)) : Math.max(6, Math.round(g.h / 150));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let y = 0; y < g.h; y += step) {
      const ny = (y - g.cy) / Math.max(1, g.ry);
      for (let x = 0; x < g.w; x += step * 2) {
        const nx = (x - g.cx) / Math.max(1, g.rx);
        const d = Math.sqrt(nx * nx + ny * ny);
        const mask = v.type === 'heat'
          ? Math.max(0, 1 - Math.abs(ny) * 0.9)
          : 1 - smoothstep(1 - softness, 1.08, d);
        if (mask <= 0.01) continue;
        const wave = v.type === 'heat'
          ? Math.sin(y * waveSize * 2.8 + t * waveSpeed * 2.2)
          : Math.sin(d / waveSize + t * waveSpeed + Math.atan2(ny, nx) * 3);
        const alpha = Math.max(0, (strength * 0.16 + refraction * 0.12) * mask);
        ctx.strokeStyle = rgba(v.coreColor, alpha);
        ctx.lineWidth = Math.max(1, step * 0.25);
        ctx.beginPath();
        const offset = wave * strength * step * 4 * mask;
        ctx.moveTo(x + offset, y);
        ctx.lineTo(x + step * 2 + offset, y + wave * step * 0.7);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawHeat(ctx, g, t) {
    const v = this.values;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 22; i += 1) {
      const y = g.cy - g.ry * 0.9 + (i / 21) * g.ry * 1.8;
      const alpha = 0.035 + 0.04 * Math.sin(i * 0.7 + t);
      ctx.strokeStyle = rgba(v.accentColor, alpha);
      ctx.lineWidth = Math.max(1, g.h / 540);
      ctx.beginPath();
      for (let x = 0; x <= g.w; x += 18) {
        const yy = y + Math.sin(x * 0.014 + t * 1.6 + i * 0.4) * g.ry * 0.035;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }


  drawOverlayLayer(ctx, g, t, layer) {
    const v = this.values;
    if (!v.overlayEnabled || !this.overlayImage || (v.overlayLayer || 'over-clouds') !== layer) return;

    const alpha = clamp01((v.overlayOpacity ?? 60) / 100);
    if (alpha <= 0.001) return;

    const scaleValue = scale(0.16, 2.2, (v.overlayScale ?? 100) / 220);
    const pulseSpeed = scale(0, 3.0, (v.overlayPulseSpeed ?? 12) / 100);
    const pulse = pulseSpeed > 0 ? 1 + Math.sin(t * pulseSpeed) * 0.055 : 1;
    const rotation = t * scale(-1.2, 1.2, ((v.overlayRotationSpeed ?? 0) + 100) / 200);
    const maxRadius = Math.max(g.rx, g.ry) * scaleValue * pulse;
    const width = maxRadius * 2;
    const height = maxRadius * 2;
    const image = this.overlayImage;
    const aspect = image.width / Math.max(1, image.height);
    let drawWidth = width;
    let drawHeight = height;
    if (aspect >= 1) drawHeight = drawWidth / aspect;
    else drawWidth = drawHeight * aspect;

    ctx.save();
    if (layer === 'inside-aperture') {
      ctx.beginPath();
      ctx.ellipse(g.cx, g.cy, g.rx * 0.72, g.ry * 0.72, 0, 0, TAU);
      ctx.clip();
    }
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = v.overlayBlendMode || 'source-over';
    ctx.translate(g.cx, g.cy);
    ctx.rotate(rotation);
    ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }

  drawPortalRing(ctx, g, t) {
    this.drawOverlayLayer(ctx, g, t, 'behind-effect');
    this.drawPortalBackdropDistortion(ctx, g, t);
    this.drawPortalOuterGlow(ctx, g);
    this.drawPortalMiddle(ctx, g, t);
    this.drawOverlayLayer(ctx, g, t, 'inside-aperture');
    this.drawPortalOutline(ctx, g, t);
    this.drawPortalCloudRim(ctx, g, t);
    this.drawOverlayLayer(ctx, g, t, 'over-clouds');
    this.drawPortalLoopWisps(ctx, g, t);
    this.drawPortalParticles(ctx, g, t);
    this.drawOverlayLayer(ctx, g, t, 'front');
  }

  drawPortalOutline(ctx, g, t) {
    const v = this.values;
    const alpha = clamp01((v.outlineOpacity ?? 0) / 100);
    const thickness = (v.outlineThickness ?? 0) / 100;
    if (alpha <= 0.001 || thickness <= 0.001) return;

    const radius = (v.outlineRadius ?? 86) / 100;
    const glow = clamp01((v.outlineGlow ?? 0) / 100);
    const lineWidth = Math.max(0.5, g.base * scale(0.0015, 0.052, thickness));

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(v.coreColor || '#32f1ff', alpha * 0.92);
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = v.coreColor || '#32f1ff';
    ctx.shadowBlur = glow * g.base * 0.145;
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, g.rx * radius, g.ry * radius, 0, 0, TAU);
    ctx.stroke();

    if (glow > 0.02) {
      ctx.strokeStyle = rgba(v.rimColor || '#8e4dff', alpha * glow * 0.38);
      ctx.lineWidth = lineWidth * (1 + glow * 2.8);
      ctx.shadowBlur = glow * g.base * 0.24;
      ctx.beginPath();
      ctx.ellipse(g.cx, g.cy, g.rx * radius, g.ry * radius, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawPortalBackdropDistortion(ctx, g, t) {
    const v = this.values;
    const strips = Math.max(50, Math.round(g.ry * 1.7 / 4));
    const strength = scale(0, 16, (v.strength ?? 50) / 100) + scale(0, 10, (v.refraction ?? 50) / 100);
    const clipRx = g.rx * 0.92;
    const clipRy = g.ry * 0.92;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, clipRx, clipRy, 0, 0, TAU);
    ctx.clip();
    ctx.globalAlpha = 0.34;
    for (let i = 0; i < strips; i += 1) {
      const q = i / Math.max(1, strips - 1);
      const y = g.cy - clipRy + q * clipRy * 2;
      const ny = (y - g.cy) / Math.max(1, clipRy);
      const reach = Math.sqrt(Math.max(0, 1 - ny * ny));
      const x = g.cx - clipRx * reach;
      const width = clipRx * 2 * reach;
      const wave = Math.sin(q * TAU * scale(1.8, 4.5, (v.waveSize ?? 50) / 100) + t * scale(0.8, 3.2, (v.waveSpeed ?? 50) / 100));
      const twist = Math.sin(q * 18 + t * 0.7 + (v.swirl ?? 0) * 0.02);
      const offsetX = (wave * 0.7 + twist * 0.3) * strength * (1 - Math.abs(ny));
      const offsetY = Math.cos(q * 14 + t * 0.8) * strength * 0.12;
      ctx.drawImage(this.gridCanvas, x, y, width, 2, x + offsetX, y + offsetY, width, 2);
    }
    ctx.restore();
  }

  drawPortalOuterGlow(ctx, g) {
    const v = this.values;
    const glow = scale(0.05, 0.3, (v.glow ?? 50) / 100);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(g.cx, g.cy, g.base * 0.15, g.cx, g.cy, Math.max(g.rx, g.ry) * 1.48);
    grad.addColorStop(0, rgba(v.coreColor, glow * 0.02));
    grad.addColorStop(0.45, rgba(v.rimColor, glow * 0.06));
    grad.addColorStop(1, rgba(v.rimColor, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, g.rx * 1.35, g.ry * 1.28, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawPortalMiddle(ctx, g, t) {
    const v = this.values;
    const alpha = clamp01((v.middleAlpha ?? 60) / 100);
    const innerRx = g.rx * 0.62;
    const innerRy = g.ry * 0.66;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, innerRx, innerRy, 0, 0, TAU);
    ctx.clip();

    const baseGrad = ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, Math.max(innerRx, innerRy) * 1.18);
    baseGrad.addColorStop(0, rgba(v.middleColor || '#08111f', 0.95 * alpha));
    baseGrad.addColorStop(0.62, rgba(v.middleColor || '#08111f', 0.78 * alpha));
    baseGrad.addColorStop(1, rgba('#000000', 0.94 * alpha));
    ctx.fillStyle = baseGrad;
    ctx.fillRect(g.cx - innerRx - 2, g.cy - innerRy - 2, innerRx * 2 + 4, innerRy * 2 + 4);

    if (v.sourceMode === 'texture' && this.textureImage) {
      const rect = cover(this.textureImage.width, this.textureImage.height, innerRx * 2, innerRy * 2);
      ctx.globalAlpha = scale(0.12, 0.9, (v.textureStrength ?? 70) / 100) * Math.max(0.25, alpha);
      ctx.drawImage(this.textureImage, g.cx - innerRx + rect.x, g.cy - innerRy + rect.y, rect.width, rect.height);
      ctx.globalAlpha = 1;
    }

    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(v.coreColor, 0.11 + alpha * 0.12);
    ctx.lineWidth = Math.max(1, g.base * 0.005);
    for (let i = 0; i < 10; i += 1) {
      const off = (i - 4.5) / 9;
      ctx.beginPath();
      for (let s = 0; s <= 48; s += 1) {
        const q = s / 48;
        const x = g.cx - innerRx + q * innerRx * 2;
        const y = g.cy + off * innerRy * 0.8 + Math.sin(q * TAU * (1.2 + i * 0.15) + t * 1.2 + i) * innerRy * 0.16;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.restore();

    ctx.save();
    const rimGrad = ctx.createRadialGradient(g.cx, g.cy, innerRx * 0.3, g.cx, g.cy, Math.max(innerRx, innerRy) * 1.08);
    rimGrad.addColorStop(0, rgba(v.coreColor, 0));
    rimGrad.addColorStop(0.74, rgba(v.rimColor, 0.08));
    rimGrad.addColorStop(1, rgba('#000000', 0.44));
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, innerRx * 1.02, innerRy * 1.02, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawPortalCloudRim(ctx, g, t) {
    const v = this.values;
    const roughness = (v.cloudiness ?? 70) / 100;
    const thickness = g.base * scale(0.035, 0.18, (v.rimWidth ?? 70) / 100);
    const count = Math.round(scale(28, 88, (v.armAmount ?? v.wispAmount ?? 70) / 100));
    const baseAlpha = scale(0.08, 0.44, (v.rimAlpha ?? 70) / 100);
    const speed = scale(0.05, 0.3, (v.armSpeed ?? v.wispSpeed ?? 50) / 100);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = `blur(${scale(4, 16, (v.blur ?? 20) / 100)}px)`;
    for (let i = 0; i < count; i += 1) {
      const seed = i * 12.431;
      const q = i / Math.max(1, count);
      const angle = q * TAU + t * speed * (i % 2 ? 1 : -1) + (hash1(seed) - 0.5) * 0.45;
      const wobble = (fbm(Math.cos(angle) * 1.6 + t * 0.06 + seed, Math.sin(angle) * 1.6 - seed, 3) - 0.5);
      const radiusScale = 0.76 + wobble * 0.22 * roughness;
      const x = g.cx + Math.cos(angle) * g.rx * radiusScale;
      const y = g.cy + Math.sin(angle) * g.ry * radiusScale;
      const tangent = angle + Math.PI / 2 + wobble * 0.9;
      const major = thickness * scale(0.9, 2.8, hash1(seed + 2.1));
      const minor = thickness * scale(0.35, 1.1, hash1(seed + 4.3));
      const color = i % 5 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
      const alpha = baseAlpha * scale(0.55, 1.2, hash1(seed + 8.2));
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tangent);
      ctx.fillStyle = rgba(color, alpha);
      ctx.beginPath();
      ctx.ellipse(0, 0, major, minor, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = 'blur(2px)';
    for (let i = 0; i < Math.max(4, Math.round(count * 0.18)); i += 1) {
      const seed = i * 8.31;
      const start = TAU * hash1(seed) + t * speed * 1.8;
      const span = scale(0.2, 0.55, hash1(seed + 1.5));
      ctx.strokeStyle = rgba(i % 2 ? v.coreColor : v.rimColor, baseAlpha * 0.65);
      ctx.lineWidth = Math.max(1.5, thickness * scale(0.08, 0.18, hash1(seed + 2.1)));
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let s = 0; s <= 22; s += 1) {
        const p = s / 22;
        const angle = start + span * p;
        const radialJitter = (noise2(Math.cos(angle) * 3 + seed, Math.sin(angle) * 3 + t * 0.4) - 0.5) * thickness * 1.1;
        const x = g.cx + Math.cos(angle) * (g.rx * 0.74 + radialJitter);
        const y = g.cy + Math.sin(angle) * (g.ry * 0.78 + radialJitter * 0.8);
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawPortalLoopWisps(ctx, g, t) {
    const v = this.values;
    const loops = Math.max(3, Math.round(scale(3, 8, (v.armCurl ?? v.wispCurl ?? 70) / 100)));
    const amp = g.base * scale(0.015, 0.055, (v.armThickness ?? v.wispSize ?? 70) / 100);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = 'blur(1px)';
    for (let i = 0; i < loops; i += 1) {
      const seed = i * 13.73;
      const dir = i % 2 ? -1 : 1;
      const radiusX = g.rx * scale(0.68, 0.88, hash1(seed + 1.2));
      const radiusY = g.ry * scale(0.72, 0.92, hash1(seed + 2.6));
      ctx.strokeStyle = rgba(i % 3 === 0 ? v.accentColor : v.coreColor, 0.12 + hash1(seed + 6) * 0.1);
      ctx.lineWidth = Math.max(1.1, g.base * 0.006);
      ctx.beginPath();
      for (let s = 0; s <= 72; s += 1) {
        const p = s / 72;
        const angle = p * TAU + t * scale(0.15, 0.55, (v.armSpeed ?? v.wispSpeed ?? 50) / 100) * dir + seed * 0.02;
        const wobble = Math.sin(p * TAU * (1.6 + hash1(seed + 3) * 2.2) + t * 1.4 + seed) * amp;
        const x = g.cx + Math.cos(angle) * (radiusX + wobble);
        const y = g.cy + Math.sin(angle) * (radiusY + wobble * 0.72);
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawPortalParticles(ctx, g, t) {
    const v = this.values;
    const count = Math.round(scale(0, 140, (v.particleAmount ?? 40) / 100));
    if (!count) return;
    const speed = scale(0.2, 2.2, (v.particleSpeed ?? 50) / 100);
    const spread = scale(0.12, 0.65, (v.particleSpread ?? 70) / 100);
    const sizeBase = scale(0.7, 6.5, (v.particleSize ?? 20) / 100);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < count; i += 1) {
      const seed = i * 19.41;
      const p = fract(t * speed * 0.16 + hash1(seed));
      const angle = TAU * hash1(seed + 1.1) + Math.sin(t * 0.8 + seed) * spread;
      const band = hash1(seed + 2.4);
      const radial = band < 0.7
        ? scale(0.64, 1.04, band / 0.7)
        : scale(0.24, 0.6, (band - 0.7) / 0.3);
      const drift = Math.sin(p * TAU + seed) * g.base * 0.03;
      const x = g.cx + Math.cos(angle) * (g.rx * radial + drift);
      const y = g.cy + Math.sin(angle) * (g.ry * radial + drift * 0.75);
      const size = sizeBase * scale(0.55, 1.9, hash1(seed + 3.7));
      const alpha = (0.12 + hash1(seed + 4.1) * 0.36) * Math.sin(p * Math.PI);
      const color = i % 5 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
      ctx.fillStyle = rgba(color, alpha);
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 7;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }




  drawWormhole(ctx, g, t) {
    this.drawOverlayLayer(ctx, g, t, 'behind-effect');
    this.drawWormholeDarkField(ctx, g, t);
    this.drawWormholeDepthMist(ctx, g, t);
    this.drawWormholeArmLobes(ctx, g, t);
    this.drawWormholeArms(ctx, g, t);
    this.drawWormholeOrbitClouds(ctx, g, t);
    this.drawOverlayLayer(ctx, g, t, 'inside-aperture');
    this.drawWormholePullCore(ctx, g, t);
    this.drawOverlayLayer(ctx, g, t, 'over-clouds');
    this.drawWormholeParticles(ctx, g, t);
    this.drawWormholeEmission(ctx, g, t);
    this.drawOverlayLayer(ctx, g, t, 'front');
  }

  drawWormholeDarkField(ctx, g, t) {
    const v = this.values;
    const dir = (v.swirl ?? 80) >= 0 ? 1 : -1;
    const speed = Math.pow((v.waveSpeed ?? 30) / 100, 2) * 0.22;
    const glowLevel = clamp01((v.glow ?? 28) / 100);

    ctx.save();

    const field = ctx.createRadialGradient(g.cx, g.cy, g.base * 0.05, g.cx, g.cy, Math.max(g.rx, g.ry) * 1.45);
    field.addColorStop(0.00, rgba('#000000', 0.78));
    field.addColorStop(0.16, rgba(v.middleColor || '#07102b', 0.16));
    field.addColorStop(0.42, rgba(v.coreColor, 0.006 + glowLevel * 0.010));
    field.addColorStop(0.70, rgba(v.rimColor, 0.004 + glowLevel * 0.010));
    field.addColorStop(1.00, rgba(v.backdropColor || '#020611', 0));
    ctx.fillStyle = field;
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, g.rx * 1.24, g.ry * 1.04, 0, 0, TAU);
    ctx.fill();

    // Rotating soft nebula wash: this brings back the older visible body without using the old octagonal line nest.
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = `blur(${scale(8, 18, (v.blur ?? 30) / 100)}px)`;
    const armAmountRaw = clamp01((v.armAmount ?? v.wispAmount ?? 52) / 100);
    const armOpacityRaw = clamp01((v.armOpacity ?? v.rimAlpha ?? 52) / 100);
    const armAmountBoost = clamp01(armAmountRaw * 2.0);
    const armOpacityBoost = clamp01(armOpacityRaw * 2.0);
    const armRadius = scale(0.38, 1.55, (v.armRadius ?? 72) / 100);
    const armPulse = 1 + Math.sin(t * scale(0.9, 3.2, (v.armSpeed ?? 36) / 100)) * scale(0, 0.85, (v.armPulseStrength ?? 0) / 100);
    const armLayerEnabled = armOpacityBoost > 0.001 && armAmountBoost > 0.001;
    const washCount = armLayerEnabled ? Math.round(scale(0, 46, armAmountBoost)) : 0;
    for (let i = 0; i < washCount; i += 1) {
      const seed = i * 12.771;
      const a = TAU * (i / washCount) + t * speed * dir * scale(0.35, 1.05, hash1(seed + 2));
      const radius = scale(0.22, 1.04, hash1(seed + 3)) * armRadius;
      const x = g.cx + Math.cos(a) * g.rx * radius;
      const y = g.cy + Math.sin(a) * g.ry * radius * 0.88;
      const major = g.base * scale(0.090, 0.330, hash1(seed + 4)) * scale(0.55, 1.25, (v.cloudiness ?? 70) / 100) * armPulse;
      const minor = major * scale(0.28, 0.54, hash1(seed + 5));
      const colour = i % 3 === 0 ? v.coreColor : (i % 3 === 1 ? v.rimColor : v.accentColor);
      const alpha = scale(0.000, 0.720, hash1(seed + 6)) * scale(0.20, 1.25, (v.cloudiness ?? 70) / 100) * Math.pow(armOpacityBoost, 1.05);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a + Math.PI / 2 + (hash1(seed + 7) - 0.5) * 0.6);
      ctx.fillStyle = rgba(colour, alpha);
      ctx.beginPath();
      ctx.ellipse(0, 0, major, minor, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  drawWormholeDepthMist(ctx, g, t) {
    const v = this.values;
    const dir = (v.swirl ?? 80) >= 0 ? 1 : -1;
    const speed = Math.pow((v.waveSpeed ?? 30) / 100, 2) * 0.20;
    const cloudOpacity = clamp01((v.orbitCloudOpacity ?? 0) / 100);
    const cloudPulse = 1 + Math.sin(t * scale(0.6, 3.0, (v.orbitCloudSpeed ?? 35) / 100)) * scale(0, 0.80, (v.orbitCloudPulseStrength ?? 0) / 100);
    const cloudStagger = scale(0, 0.72, (v.orbitCloudStagger ?? 48) / 100);
    const amount = Math.round(scale(0, 62, (v.cloudiness ?? 70) / 100) * cloudOpacity);
    if (amount <= 0 || cloudOpacity <= 0.001) return;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = `blur(${scale(5, 16, (v.blur ?? 28) / 100)}px)`;

    for (let i = 0; i < amount; i += 1) {
      const seed = i * 17.233;
      const p = hash1(seed + 1);
      const baseAngle = TAU * hash1(seed + 2) + t * speed * dir * scale(0.28, 0.78, hash1(seed + 3));
      const radial = scale(0.16, 1.10, p) * scale(1 - cloudStagger * 0.55, 1 + cloudStagger, hash1(seed + 8));
      const bend = radial * TAU * scale(0.35, 1.45, Math.abs(v.swirl ?? 80) / 100);
      const a = baseAngle + dir * bend;
      const x = g.cx + Math.cos(a) * g.rx * radial;
      const y = g.cy + Math.sin(a) * g.ry * radial * 0.90;
      const major = g.base * scale(0.025, 0.130, (v.cloudiness ?? 70) / 100) * scale(0.55, 1.95, hash1(seed + 4)) * cloudPulse;
      const minor = major * scale(0.22, 0.48, hash1(seed + 5));
      const colour = i % 4 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
      const alpha = scale(0.000, 0.440, hash1(seed + 6)) * Math.pow(cloudOpacity, 1.0) * scale(0.35, 1.25, (v.cloudiness ?? 70) / 100);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a + Math.PI / 2 + (hash1(seed + 7) - 0.5) * 0.9);
      ctx.fillStyle = rgba(colour, alpha);
      ctx.beginPath();
      ctx.ellipse(0, 0, major, minor, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  drawWormholeArmLobes(ctx, g, t) {
    const v = this.values;
    const amountRaw = clamp01((v.armAmount ?? v.wispAmount ?? 52) / 100);
    const opacityRaw = clamp01((v.armOpacity ?? v.rimAlpha ?? 52) / 100);
    const amountBoost = clamp01(amountRaw * 2.0);
    const opacityBoost = clamp01(opacityRaw * 2.0);
    if (amountBoost <= 0 || opacityBoost <= 0) return;

    const amount = Math.round(scale(0, 78, amountBoost));
    const opacity = scale(0, 0.92, opacityBoost);
    const thickness = g.base * scale(0.022, 0.145, (v.armThickness ?? v.rimWidth ?? 64) / 100);
    const softness = scale(4, 19, (v.armSoftness ?? v.blur ?? 46) / 100);
    const speed = Math.pow((v.armSpeed ?? v.wispSpeed ?? 32) / 100, 2) * 0.42;
    const curl = scale(0.8, 3.8, (v.armCurl ?? v.wispCurl ?? 80) / 100);
    const radiusScale = scale(0.38, 1.55, (v.armRadius ?? 72) / 100);
    const pulse = 1 + Math.sin(t * scale(0.8, 3.8, (v.armSpeed ?? 32) / 100)) * scale(0, 0.90, (v.armPulseStrength ?? 0) / 100);
    const dir = (v.swirl ?? 80) >= 0 ? 1 : -1;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = `blur(${softness}px)`;

    for (let i = 0; i < amount; i += 1) {
      const seed = i * 23.719;
      const p = hash1(seed + 1);
      const armIndex = i % Math.max(2, Math.round(scale(2, 10, amountBoost)));
      const start = (armIndex / Math.max(2, Math.round(scale(2, 10, amountBoost)))) * TAU;
      const radial = scale(0.18, 1.04, p) * radiusScale;
      const angle = start + dir * radial * TAU * curl + t * speed * dir * scale(0.55, 1.25, hash1(seed + 2));
      const wobble = (fbm(Math.cos(angle) * 1.7 + seed * 0.05, Math.sin(angle) * 1.7 + t * 0.03, 3) - 0.5) * g.base * 0.05;
      const x = g.cx + Math.cos(angle) * (g.rx * radial + wobble);
      const y = g.cy + Math.sin(angle) * (g.ry * radial * 0.88 + wobble * 0.65);
      const major = thickness * scale(1.3, 5.8, hash1(seed + 3)) * pulse;
      const minor = major * scale(0.28, 0.58, hash1(seed + 4));
      const colour = i % 3 === 0 ? v.coreColor : (i % 3 === 1 ? v.rimColor : v.accentColor);
      const alpha = opacity * scale(0.28, 1.0, hash1(seed + 5));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2 + (hash1(seed + 6) - 0.5) * 0.8);
      ctx.fillStyle = rgba(colour, alpha);
      ctx.beginPath();
      ctx.ellipse(0, 0, major, minor, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  drawWormholeArms(ctx, g, t) {
    const v = this.values;
    const amountRaw = clamp01((v.armAmount ?? v.wispAmount ?? 52) / 100);
    const opacityRaw = clamp01((v.armOpacity ?? v.rimAlpha ?? 52) / 100);
    const amountBoost = clamp01(amountRaw * 2.0);
    const opacityBoost = clamp01(opacityRaw * 2.0);
    const thicknessValue = v.armThickness ?? v.rimWidth ?? 64;
    const softnessValue = v.armSoftness ?? v.blur ?? 46;
    const speedValue = v.armSpeed ?? v.wispSpeed ?? 32;
    const curlValue = v.armCurl ?? v.wispCurl ?? Math.abs(v.swirl ?? 80);
    const armCount = Math.round(scale(0, 22, amountBoost));
    if (armCount <= 0 || opacityBoost <= 0 || thicknessValue <= 0) return;

    const dir = (v.swirl ?? 80) >= 0 ? 1 : -1;
    const speed = Math.pow(speedValue / 100, 2) * 0.46;
    const turns = scale(0.75, 4.80, curlValue / 100);
    const baseThickness = g.base * scale(0.004, 0.130, thicknessValue / 100);
    const opacity = scale(0.00, 1.65, opacityBoost);
    const roughness = scale(0.004, 0.060, (v.noise ?? 24) / 100);
    const softness = scale(0.5, 12, softnessValue / 100);
    const radiusScale = scale(0.38, 1.55, (v.armRadius ?? 72) / 100);
    const pulse = 1 + Math.sin(t * scale(0.7, 3.6, speedValue / 100)) * scale(0, 0.80, (v.armPulseStrength ?? 0) / 100);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const layers = [
      { countMul: 0.45, width: 3.8, blur: softness + 4.5, alpha: 0.75, speed: 0.38, stretch: 1.08 },
      { countMul: 0.70, width: 2.1, blur: softness * 0.7 + 2.2, alpha: 0.88, speed: 0.62, stretch: 1.00 },
      { countMul: 1.00, width: 0.9, blur: softness * 0.35, alpha: 1.00, speed: 0.90, stretch: 0.94 }
    ];

    for (const [layerIndex, layer] of layers.entries()) {
      const count = Math.max(0, Math.round(armCount * layer.countMul));
      if (!count) continue;

      ctx.save();
      ctx.filter = `blur(${layer.blur}px)`;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < count; i += 1) {
        const seed = layerIndex * 500 + i * 21.317;
        const startAngle = (i / count) * TAU + hash1(seed) * 0.55 + t * speed * layer.speed * dir;
        const colour = (i + layerIndex) % 3 === 0 ? v.coreColor : ((i + layerIndex) % 3 === 1 ? v.rimColor : v.accentColor);

        ctx.strokeStyle = rgba(colour, opacity * layer.alpha * 0.92);
        ctx.lineWidth = Math.max(1.2, baseThickness * layer.width * pulse);
        ctx.shadowColor = colour;
        ctx.shadowBlur = baseThickness * layer.width * 2.4;
        ctx.beginPath();

        const steps = 68;
        for (let s = 0; s <= steps; s += 1) {
          const p = s / steps;
          const radial = Math.pow(1 - p, 0.74);
          const angle = startAngle + dir * p * TAU * turns;
          const broken = fbm(Math.cos(angle) * 1.8 + seed * 0.07 + p * 0.8, Math.sin(angle) * 1.8 - seed * 0.03 + t * 0.025, 3);
          const jitter = (broken - 0.5) * g.base * roughness;
          const fadeIn = smoothstep(0.00, 0.18, p);
          const fadeOut = 1 - smoothstep(0.78, 1.00, p);
          ctx.globalAlpha = fadeIn * fadeOut * scale(0.55, 1.0, broken);
          const x = g.cx + Math.cos(angle) * (g.rx * radial * layer.stretch * radiusScale + jitter);
          const y = g.cy + Math.sin(angle) * (g.ry * radial * 0.88 * layer.stretch * radiusScale + jitter * 0.70);
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    }

    ctx.restore();
  }

  drawWormholeOrbitClouds(ctx, g, t) {
    const v = this.values;
    const amount = Math.round(scale(0, 96, (v.orbitCloudAmount ?? 0) / 100));
    if (amount <= 0) return;

    const opacity = scale(0, 1.35, (v.orbitCloudOpacity ?? 0) / 100);
    const sizeValue = (v.orbitCloudSize ?? 60) / 100;
    const radiusValue = (v.orbitCloudRadius ?? 72) / 100;
    const stagger = scale(0, 0.78, (v.orbitCloudStagger ?? 48) / 100);
    const pulse = 1 + Math.sin(t * scale(0.7, 3.3, (v.orbitCloudSpeed ?? 35) / 100)) * scale(0, 0.90, (v.orbitCloudPulseStrength ?? 0) / 100);
    const speed = Math.pow((v.orbitCloudSpeed ?? 35) / 100, 2) * 0.70;
    const dir = (v.swirl ?? 80) >= 0 ? 1 : -1;
    const thickness = g.base * scale(0.010, 0.090, sizeValue);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = `blur(${scale(5, 18, (v.armSoftness ?? v.blur ?? 46) / 100)}px)`;

    for (let i = 0; i < amount; i += 1) {
      const seed = i * 15.913;
      const orbit = TAU * (i / amount) + hash1(seed) * 0.65 + t * speed * dir * scale(0.45, 1.35, hash1(seed + 2));
      const localRadius = scale(0.35, 1.15, radiusValue) * scale(1 - stagger * 0.65, 1 + stagger * 0.95, hash1(seed + 3));
      const wobble = Math.sin(t * speed * 2.4 + seed) * g.base * 0.025;
      const x = g.cx + Math.cos(orbit) * (g.rx * localRadius + wobble);
      const y = g.cy + Math.sin(orbit) * (g.ry * localRadius * 0.88 + wobble * 0.68);
      const major = thickness * scale(1.0, 4.9, hash1(seed + 4)) * pulse;
      const minor = major * scale(0.30, 0.62, hash1(seed + 5));
      const colour = i % 4 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
      const alpha = opacity * scale(0.38, 1.35, hash1(seed + 6));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(orbit + Math.PI / 2 + (hash1(seed + 7) - 0.5) * 0.9);
      ctx.fillStyle = rgba(colour, alpha);
      ctx.beginPath();
      ctx.ellipse(0, 0, major, minor, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  drawWormholePullCore(ctx, g, t) {
    const v = this.values;
    ctx.save();

    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, g.base * 0.32);
    glow.addColorStop(0.00, rgba(v.coreColor, 0.18));
    glow.addColorStop(0.24, rgba(v.coreColor, 0.16));
    glow.addColorStop(0.58, rgba(v.rimColor, 0.040));
    glow.addColorStop(1.00, rgba(v.rimColor, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, g.rx * 0.18, g.ry * 0.14, 0, 0, TAU);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    const hole = ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, g.base * 0.14);
    hole.addColorStop(0.00, rgba('#000000', 0.98));
    hole.addColorStop(0.45, rgba('#020510', 0.92));
    hole.addColorStop(1.00, rgba('#000000', 0));
    ctx.fillStyle = hole;
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, g.rx * 0.075, g.ry * 0.058, 0, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  drawWormholeParticles(ctx, g, t) {
    const v = this.values;
    const count = Math.round(scale(0, 190, (v.particleAmount ?? 38) / 100));
    if (!count) return;

    const opacityMul = scale(0, 2.40, (v.particleOpacity ?? 62) / 100);
    if (opacityMul <= 0.001) return;

    const speed = Math.pow((v.particleSpeed ?? 42) / 100, 2) * 0.52;
    const spread = scale(0.03, 0.88, (v.particleSpread ?? 65) / 100);
    const sizeBase = scale(0.4, 6.2, (v.particleSize ?? 20) / 100);
    const glow = scale(0, 7.0, (v.particleGlow ?? 45) / 100);
    const pulse = 1 + Math.sin(t * scale(0.8, 4.4, (v.particleSpeed ?? 42) / 100)) * scale(0, 0.80, (v.particlePulseStrength ?? 0) / 100);
    const turns = scale(1.0, 4.2, Math.abs(v.swirl ?? 80) / 100);
    const dir = (v.swirl ?? 80) >= 0 ? 1 : -1;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < count; i += 1) {
      const seed = i * 17.17;
      const p = fract(t * speed * 0.36 + hash1(seed + 2.9));
      const inward = Math.pow(1 - p, 1.08);
      const start = TAU * hash1(seed + 1.1);
      const angle = start + dir * p * TAU * turns + Math.sin(t * 0.20 + seed) * spread;
      const x = g.cx + Math.cos(angle) * g.rx * scale(0.08, 1.08, inward);
      const y = g.cy + Math.sin(angle) * g.ry * scale(0.06, 0.95, inward);
      const size = sizeBase * (0.40 + inward * 0.85) * (0.65 + hash1(seed + 3.6) * 0.75) * pulse;
      const alpha = (0.10 + hash1(seed + 4.2) * 0.34) * Math.sin(p * Math.PI) * opacityMul * pulse;
      const colour = i % 3 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);

      ctx.fillStyle = rgba(colour, alpha);
      ctx.shadowColor = colour;
      ctx.shadowBlur = size * glow;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }


  drawWormholeEmission(ctx, g, t) {
    const v = this.values;
    const amount = Math.round(scale(0, 260, (v.emissionAmount ?? 0) / 100));
    const opacity = scale(0, 1.55, (v.emissionOpacity ?? 60) / 100);
    if (amount <= 0 || opacity <= 0.001) return;

    const speed = scale(0.08, 1.95, (v.emissionSpeed ?? 45) / 100);
    const directionDeg = Number(v.emissionDirection ?? 0);
    const vacuum = Boolean(v.emissionVacuum);
    const trailLength = scale(0, 0.34, (v.emissionTrailLength ?? 42) / 100);
    const trailOpacity = scale(0, 1.0, (v.emissionTrailOpacity ?? 48) / 100);
    const sizeBase = scale(0.9, 4.8, (v.particleSize ?? 24) / 100);
    const glow = scale(2, 10, (v.particleGlow ?? 55) / 100);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    for (let i = 0; i < amount; i += 1) {
      const seed = i * 31.731;
      const life = fract(t * speed * scale(0.12, 0.34, hash1(seed + 2)) + hash1(seed + 1));
      const distance = vacuum ? (1 - life) : life;
      const fade = Math.sin(life * Math.PI);
      const spreadAngle = directionDeg === 0
        ? TAU * hash1(seed + 3)
        : (directionDeg * Math.PI / 180) + scale(-0.34, 0.34, hash1(seed + 4));
      const wobble = Math.sin(t * 1.7 + seed) * scale(0.00, 0.14, hash1(seed + 5));
      const angle = spreadAngle + wobble;
      const sx = g.cx;
      const sy = g.cy;
      const maxD = scale(0.18, 1.18, hash1(seed + 6));
      const x = sx + Math.cos(angle) * g.rx * maxD * distance;
      const y = sy + Math.sin(angle) * g.ry * maxD * distance * 0.90;
      const prevDistance = vacuum ? Math.min(1, distance + trailLength) : Math.max(0, distance - trailLength);
      const tx = sx + Math.cos(angle) * g.rx * maxD * prevDistance;
      const ty = sy + Math.sin(angle) * g.ry * maxD * prevDistance * 0.90;
      const colour = i % 3 === 0 ? v.coreColor : (i % 3 === 1 ? v.rimColor : v.accentColor);
      const alpha = opacity * fade * scale(0.38, 0.92, hash1(seed + 7));
      const size = sizeBase * scale(0.65, 1.55, hash1(seed + 8));

      if (trailLength > 0.002 && trailOpacity > 0.001) {
        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, rgba(colour, 0));
        grad.addColorStop(1, rgba(colour, alpha * trailOpacity * 0.55));
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(0.8, size * 0.75);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.fillStyle = rgba(colour, alpha);
      ctx.shadowColor = colour;
      ctx.shadowBlur = size * glow;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  drawTransition(ctx, g, t) {
    const v = this.values;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const x0 = g.cx + Math.sin(t * 3.1) * g.base * 0.035;
    const height = g.ry * 1.55;
    const width = Math.max(4, g.rx * 0.85);
    const grad = ctx.createLinearGradient(x0 - width, g.cy, x0 + width, g.cy);
    grad.addColorStop(0, rgba(v.rimColor, 0));
    grad.addColorStop(0.44, rgba(v.rimColor, 0.12));
    grad.addColorStop(0.50, rgba(v.coreColor, 0.34));
    grad.addColorStop(0.56, rgba(v.accentColor, 0.20));
    grad.addColorStop(1, rgba(v.rimColor, 0));
    ctx.fillStyle = grad;
    ctx.shadowColor = v.rimColor;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    for (let i = 0; i <= 36; i += 1) {
      const q = i / 36;
      const y = g.cy - height + q * height * 2;
      const x = x0 + Math.sin(q * 20 + t * 5) * width * 0.18 + (hash1(i * 2.1 + Math.floor(t * 14)) - 0.5) * width * 0.25;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = 36; i >= 0; i -= 1) {
      const q = i / 36;
      const y = g.cy - height + q * height * 2;
      const x = x0 + width * 0.38 + Math.sin(q * 16 - t * 4) * width * 0.17 + (hash1(i * 3.7 + 2) - 0.5) * width * 0.22;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 34; i += 1) {
      const seed = i * 3.4;
      const y = g.cy - height + hash1(seed) * height * 2;
      const x = x0 + (hash1(seed + 1) - 0.5) * width * 2.2;
      const length = scale(g.base * 0.04, g.base * 0.22, hash1(seed + 2));
      const color = i % 2 ? v.rimColor : v.accentColor;
      ctx.strokeStyle = rgba(color, scale(0.07, 0.34, hash1(seed + 3)));
      ctx.lineWidth = scale(1, 3, hash1(seed + 4));
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (hash1(seed + 5) - 0.5) * length, y + (hash1(seed + 6) - 0.5) * length);
      ctx.stroke();
    }
    ctx.restore();
  }
}
