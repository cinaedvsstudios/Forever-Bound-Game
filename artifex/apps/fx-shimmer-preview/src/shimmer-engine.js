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
  return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha)})`;
}
function mixRgb(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return `rgb(${Math.round(lerp(ca.r, cb.r, t))}, ${Math.round(lerp(ca.g, cb.g, t))}, ${Math.round(lerp(ca.b, cb.b, t))})`;
}
function cover(iw, ih, tw, th) {
  const ir = iw / Math.max(1, ih);
  const tr = tw / Math.max(1, th);
  let width = tw;
  let height = th;
  if (ir > tr) width = height * ir;
  else height = width / ir;
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
    this.outlineImage = null;
    this.values = {};
    this.gridKey = '';
  }

  setValues(values) { this.values = { ...values }; }
  setTextureImage(image = null) { this.textureImage = image; }
  setOverlayImage(image = null) { this.overlayImage = image; }
  setOutlineImage(image = null) { this.outlineImage = image; }

  resize() {
    const ratio = Math.max(1, Math.min(1.6, window.devicePixelRatio || 1));
    const rect = this.canvas.getBoundingClientRect();
    const renderScale = clamp((this.values.renderScale ?? 100) / 100, 0.5, 1);
    const width = Math.max(640, Math.round(rect.width * ratio * renderScale));
    const height = Math.max(360, Math.round(rect.height * ratio * renderScale));
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
      w, h,
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

    if (v.showMask && v.type !== 'heat' && v.type !== 'transition') {
      ctx.save();
      ctx.strokeStyle = rgba(v.coreColor || '#32f1ff', 0.12);
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
    ctx.globalCompositeOperation = 'screen';
    for (let y = 0; y < g.h; y += step) {
      const ny = (y - g.cy) / Math.max(1, g.ry);
      for (let x = 0; x < g.w; x += step * 2) {
        const nx = (x - g.cx) / Math.max(1, g.rx);
        const d = Math.sqrt(nx * nx + ny * ny);
        const mask = v.type === 'heat' ? Math.max(0, 1 - Math.abs(ny) * 0.9) : 1 - smoothstep(1 - softness, 1.08, d);
        if (mask <= 0.01) continue;
        const wave = v.type === 'heat'
          ? Math.sin(y * waveSize * 2.8 + t * waveSpeed * 2.2)
          : Math.sin(d / waveSize + t * waveSpeed + Math.atan2(ny, nx) * 3);
        const alpha = Math.max(0, (strength * 0.12 + refraction * 0.08) * mask);
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
    ctx.globalCompositeOperation = 'screen';
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
    const jobs = [];
    const add = (layer, draw) => jobs.push({ layer, draw });
    add('behind-effect', () => this.drawOverlayLayer(ctx, g, t, 'behind-effect'));
    add('inside-aperture', () => this.drawPortalBackdropDistortion(ctx, g, t));
    add('inside-aperture', () => this.drawPortalOuterGlow(ctx, g));
    add('inside-aperture', () => this.drawPortalMiddle(ctx, g, t));
    add('inside-aperture', () => this.drawOverlayLayer(ctx, g, t, 'inside-aperture'));
    add(vlayer(this.values.wispLayer, 'over-clouds'), () => this.drawPortalInnerWisps(ctx, g, t));
    add('over-clouds', () => this.drawPortalCloudRim(ctx, g, t));
    add('over-clouds', () => this.drawOrbitClouds(ctx, g, t, 'portal'));
    add('over-particles', () => this.drawPortalParticles(ctx, g, t));
    add(vlayer(this.values.outlineLayer, 'front'), () => this.drawPortalOutline(ctx, g, t));
    add('over-clouds', () => this.drawOverlayLayer(ctx, g, t, 'over-clouds'));
    add('front', () => this.drawOverlayLayer(ctx, g, t, 'front'));
    this.runLayerJobs(jobs);
  }

  runLayerJobs(jobs) {
    const order = ['behind-effect', 'inside-aperture', 'behind-rim', 'over-clouds', 'over-particles', 'front'];
    const rank = new Map(order.map((name, index) => [name, index]));
    jobs.sort((a, b) => (rank.get(a.layer) ?? 3) - (rank.get(b.layer) ?? 3));
    jobs.forEach((job) => job.draw());
  }

  portalOutlineStyle(ctx, g, t, alpha = 1) {
    const v = this.values;
    const mode = v.outlineColorMode || 'solid';
    const colorA = v.outlineColorA || v.coreColor || '#32f1ff';
    const colorB = v.outlineColorB || v.rimColor || '#8e4dff';
    if (mode === 'image' && this.outlineImage) {
      const pattern = ctx.createPattern(this.outlineImage, 'repeat');
      if (pattern && pattern.setTransform) {
        const scaleValue = Math.max(0.08, g.base / Math.max(1, Math.min(this.outlineImage.width, this.outlineImage.height)) * 0.65);
        const matrix = new DOMMatrix()
          .translateSelf(g.cx, g.cy)
          .rotateSelf((t * scale(-20, 20, ((v.outlinePulseSpeed ?? 40) / 100))) % 360)
          .scaleSelf(scaleValue, scaleValue)
          .translateSelf(-this.outlineImage.width / 2, -this.outlineImage.height / 2);
        pattern.setTransform(matrix);
      }
      return pattern || rgba(colorA, alpha);
    }
    if (mode === 'radial') {
      if (typeof ctx.createConicGradient === 'function') {
        const grad = ctx.createConicGradient(t * 0.45, g.cx, g.cy);
        grad.addColorStop(0, rgba(colorA, alpha));
        grad.addColorStop(0.5, rgba(colorB, alpha));
        grad.addColorStop(1, rgba(colorA, alpha));
        return grad;
      }
    }
    let grad = null;
    if (mode === 'horizontal') grad = ctx.createLinearGradient(g.cx - g.rx, g.cy, g.cx + g.rx, g.cy);
    else if (mode === 'vertical') grad = ctx.createLinearGradient(g.cx, g.cy - g.ry, g.cx, g.cy + g.ry);
    else if (mode === 'diagonal' || mode === 'radial') grad = ctx.createLinearGradient(g.cx - g.rx, g.cy - g.ry, g.cx + g.rx, g.cy + g.ry);
    if (grad) {
      grad.addColorStop(0, rgba(colorA, alpha));
      grad.addColorStop(1, rgba(colorB, alpha));
      return grad;
    }
    return rgba(colorA, alpha);
  }

  drawPortalOutline(ctx, g, t) {
    const v = this.values;
    const alphaBase = clamp01((v.outlineOpacity ?? 0) / 100);
    const thickness = (v.outlineThickness ?? 0) / 300;
    if (alphaBase <= 0.001 || thickness <= 0.001) return;
    const radius = (v.outlineRadius ?? 86) / 100;
    const glow = clamp01((v.outlineGlow ?? 0) / 100);
    const pulseStrength = clamp01((v.outlinePulseStrength ?? 0) / 100);
    const pulseSpeed = scale(0.25, 7.0, (v.outlinePulseSpeed ?? 40) / 100);
    const pulse = 1 + Math.sin(t * pulseSpeed) * 0.55 * pulseStrength;
    const alpha = clamp01(alphaBase * (1 + Math.sin(t * pulseSpeed + Math.PI * 0.5) * 0.40 * pulseStrength));
    const lineWidth = Math.max(0.5, g.base * scale(0.0015, 0.22, thickness) * pulse);
    const colorB = v.outlineColorB || v.rimColor || '#8e4dff';
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = this.portalOutlineStyle(ctx, g, t, alpha * 0.98);
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = colorB;
    ctx.shadowBlur = glow * g.base * 0.20 * (1 + pulseStrength);
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, g.rx * radius, g.ry * radius, 0, 0, TAU);
    ctx.stroke();
    if (glow > 0.02) {
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = this.portalOutlineStyle(ctx, g, t + 0.37, alpha * glow * 0.36);
      ctx.lineWidth = lineWidth * (1 + glow * 2.6);
      ctx.shadowColor = colorB;
      ctx.shadowBlur = glow * g.base * 0.24 * (1 + pulseStrength);
      ctx.beginPath();
      ctx.ellipse(g.cx, g.cy, g.rx * radius, g.ry * radius, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawPortalBackdropDistortion(ctx, g, t) {
    const v = this.values;
    const strips = Math.max(36, Math.round(g.ry * 1.5 / 5));
    const strength = scale(0, 14, (v.strength ?? 50) / 100) + scale(0, 8, (v.refraction ?? 50) / 100);
    const clipRx = g.rx * 0.92;
    const clipRy = g.ry * 0.92;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, clipRx, clipRy, 0, 0, TAU);
    ctx.clip();
    ctx.globalAlpha = 0.30;
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
    const glow = scale(0.03, 0.24, (v.glow ?? 50) / 100);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
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
    if (alpha <= 0.001) return;
    const innerRx = g.rx * 0.62;
    const innerRy = g.ry * 0.66;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, innerRx, innerRy, 0, 0, TAU);
    ctx.clip();
    const baseGrad = ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, Math.max(innerRx, innerRy) * 1.18);
    baseGrad.addColorStop(0, rgba(v.middleColor || '#08111f', 0.90 * alpha));
    baseGrad.addColorStop(0.62, rgba(v.middleColor || '#08111f', 0.70 * alpha));
    baseGrad.addColorStop(1, rgba('#000000', 0.88 * alpha));
    ctx.fillStyle = baseGrad;
    ctx.fillRect(g.cx - innerRx - 2, g.cy - innerRy - 2, innerRx * 2 + 4, innerRy * 2 + 4);
    if (v.sourceMode === 'texture' && this.textureImage) {
      const rect = cover(this.textureImage.width, this.textureImage.height, innerRx * 2, innerRy * 2);
      ctx.globalAlpha = scale(0.12, 0.9, (v.textureStrength ?? 70) / 100) * Math.max(0.25, alpha);
      ctx.drawImage(this.textureImage, g.cx - innerRx + rect.x, g.cy - innerRy + rect.y, rect.width, rect.height);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    ctx.save();
    const rimGrad = ctx.createRadialGradient(g.cx, g.cy, innerRx * 0.3, g.cx, g.cy, Math.max(innerRx, innerRy) * 1.08);
    rimGrad.addColorStop(0, rgba(v.coreColor, 0));
    rimGrad.addColorStop(0.74, rgba(v.rimColor, 0.07));
    rimGrad.addColorStop(1, rgba('#000000', 0.38));
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
    const count = Math.round(scale(18, 72, (v.cloudiness ?? 70) / 100));
    const baseAlpha = scale(0.04, 0.34, (v.rimAlpha ?? 70) / 100);
    const speed = scale(0.05, 0.22, (v.waveSpeed ?? 50) / 100);
    if (baseAlpha <= 0.001 || thickness <= 0.1) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = `blur(${scale(3, 12, (v.blur ?? 20) / 100)}px)`;
    for (let i = 0; i < count; i += 1) {
      const seed = i * 12.431;
      const q = i / Math.max(1, count);
      const angle = q * TAU + t * speed * (i % 2 ? 1 : -1) + (hash1(seed) - 0.5) * 0.45;
      const wobble = (fbm(Math.cos(angle) * 1.6 + t * 0.06 + seed, Math.sin(angle) * 1.6 - seed, 3) - 0.5);
      const radiusScale = 0.76 + wobble * 0.22 * roughness;
      const x = g.cx + Math.cos(angle) * g.rx * radiusScale;
      const y = g.cy + Math.sin(angle) * g.ry * radiusScale;
      const tangent = angle + Math.PI / 2 + wobble * 0.9;
      const major = thickness * scale(0.8, 2.4, hash1(seed + 2.1));
      const minor = thickness * scale(0.30, 0.9, hash1(seed + 4.3));
      const color = i % 5 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
      const alpha = Math.min(0.36, baseAlpha * scale(0.45, 1.0, hash1(seed + 8.2)));
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
  }

  drawPortalInnerWisps(ctx, g, t) {
    const v = this.values;
    const amount = Math.round(scale(0, 12, (v.wispAmount ?? 0) / 100));
    const opacity = clamp01((v.wispOpacity ?? 0) / 100);
    if (amount <= 0 || opacity <= 0.001) return;
    const amp = g.base * scale(0.006, 0.062, (v.wispCurl ?? 50) / 100);
    const thickness = g.base * scale(0.0015, 0.018, (v.wispThickness ?? v.wispSize ?? 45) / 100);
    const spread = g.ry * scale(0.15, 1.05, (v.wispVerticalSpread ?? 54) / 100);
    const speed = scale(0.08, 0.74, (v.wispSpeed ?? 46) / 100);
    const glow = scale(0, 0.14, (v.wispGlow ?? 30) / 100) * g.base;
    const colorA = v.wispColorA || v.coreColor || '#32f1ff';
    const colorB = v.wispColorB || v.accentColor || '#ffca66';
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.filter = 'blur(0.6px)';
    ctx.shadowBlur = glow;
    for (let i = 0; i < amount; i += 1) {
      const seed = i * 13.73;
      const yBase = g.cy + ((i / Math.max(1, amount - 1)) - 0.5) * spread + (hash1(seed) - 0.5) * spread * 0.20;
      const phase = t * speed * (i % 2 ? -1 : 1) + seed * 0.03;
      ctx.strokeStyle = rgba(mixRgb(colorA, colorB, hash1(seed + 3)), Math.min(0.62, opacity * scale(0.42, 0.86, hash1(seed + 6))));
      ctx.shadowColor = i % 2 ? colorA : colorB;
      ctx.lineWidth = Math.max(0.6, thickness * scale(0.55, 1.3, hash1(seed + 2)));
      ctx.beginPath();
      for (let s = 0; s <= 54; s += 1) {
        const p = s / 54;
        const x = g.cx - g.rx * 0.72 + p * g.rx * 1.44;
        const wave = Math.sin(p * TAU * scale(1.0, 3.2, (v.wispCurl ?? 50) / 100) + phase + i);
        const y = yBase + wave * amp * scale(0.7, 1.45, hash1(seed + 4));
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawPortalParticles(ctx, g, t) {
    const v = this.values;
    const count = Math.round(scale(0, 90, (v.particleAmount ?? 40) / 100));
    if (!count) return;
    const opacityMul = scale(0, 0.92, (v.particleOpacity ?? 40) / 100);
    if (opacityMul <= 0.001) return;
    const speed = scale(0.2, 2.2, (v.particleSpeed ?? 50) / 100);
    const spread = scale(0.12, 0.65, (v.particleSpread ?? 70) / 100);
    const sizeBase = scale(0.7, 6.2, (v.particleSize ?? 20) / 100);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < count; i += 1) {
      const seed = i * 19.41;
      const p = fract(t * speed * 0.16 + hash1(seed));
      const angle = TAU * hash1(seed + 1.1) + Math.sin(t * 0.8 + seed) * spread;
      const band = hash1(seed + 2.4);
      const radial = band < 0.7 ? scale(0.64, 1.04, band / 0.7) : scale(0.24, 0.6, (band - 0.7) / 0.3);
      const drift = Math.sin(p * TAU + seed) * g.base * 0.03;
      const x = g.cx + Math.cos(angle) * (g.rx * radial + drift);
      const y = g.cy + Math.sin(angle) * (g.ry * radial + drift * 0.75);
      const size = sizeBase * scale(0.55, 1.9, hash1(seed + 3.7));
      const alpha = (0.10 + hash1(seed + 4.1) * 0.30) * Math.sin(p * Math.PI) * opacityMul;
      const color = i % 5 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
      ctx.fillStyle = rgba(color, Math.min(0.46, alpha));
      ctx.shadowColor = color;
      ctx.shadowBlur = size * scale(0, 5, (v.particleGlow ?? 30) / 100);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawOrbitClouds(ctx, g, t, mode) {
    const v = this.values;
    const maxCount = mode === 'wormhole' ? 46 : 54;
    const amount = Math.round(scale(0, maxCount, (v.orbitCloudAmount ?? 0) / 100));
    const opacity = scale(0, mode === 'wormhole' ? 0.28 : 0.42, (v.orbitCloudOpacity ?? 0) / 100);
    if (amount <= 0 || opacity <= 0.001) return;
    const sizeValue = (v.orbitCloudSize ?? 60) / 100;
    const radiusValue = (v.orbitCloudRadius ?? 72) / 100;
    const stagger = scale(0, 1.65, (v.orbitCloudStagger ?? 48) / 100);
    const pulse = 1 + Math.sin(t * scale(0.7, 3.0, (v.orbitCloudSpeed ?? 35) / 100)) * scale(0, 0.55, (v.orbitCloudPulseStrength ?? 0) / 100);
    const speed = Math.pow((v.orbitCloudSpeed ?? 35) / 100, 2) * 0.48;
    const dir = (v.swirl ?? 80) >= 0 ? 1 : -1;
    const thickness = g.base * scale(0.010, 0.080, sizeValue);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = `blur(${scale(4, 13, (v.armSoftness ?? v.blur ?? 40) / 100)}px)`;
    for (let i = 0; i < amount; i += 1) {
      const seed = i * 15.913;
      const orbit = TAU * (i / amount) + hash1(seed) * 0.65 + t * speed * dir * scale(0.45, 1.35, hash1(seed + 2));
      const localRadius = scale(0.25, 1.32, radiusValue) * scale(Math.max(0.03, 1 - stagger * 0.80), 1 + stagger * 1.45, hash1(seed + 3));
      const wobble = Math.sin(t * speed * 2.4 + seed) * g.base * scale(0.015, 0.090, (v.orbitCloudStagger ?? 48) / 100);
      const x = g.cx + Math.cos(orbit) * (g.rx * localRadius + wobble);
      const y = g.cy + Math.sin(orbit) * (g.ry * localRadius * 0.88 + wobble * 0.68);
      const major = thickness * scale(1.0, 4.4, hash1(seed + 4)) * pulse;
      const minor = major * scale(0.30, 0.62, hash1(seed + 5));
      const colour = i % 4 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
      const alpha = Math.min(mode === 'wormhole' ? 0.22 : 0.34, opacity * scale(0.34, 1.1, hash1(seed + 6)));
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

  drawWormhole(ctx, g, t) {
    this.drawOverlayLayer(ctx, g, t, 'behind-effect');
    this.drawWormholeDarkField(ctx, g, t);
    this.drawWormholeArms(ctx, g, t);
    this.drawOrbitClouds(ctx, g, t, 'wormhole');
    this.drawOverlayLayer(ctx, g, t, 'inside-aperture');
    this.drawWormholePullCore(ctx, g, t);
    this.drawOverlayLayer(ctx, g, t, 'over-clouds');
    this.drawWormholeParticles(ctx, g, t);
    this.drawWormholeEmission(ctx, g, t);
    this.drawOverlayLayer(ctx, g, t, 'front');
  }

  drawWormholeDarkField(ctx, g, t) {
    const v = this.values;
    const glowLevel = clamp01((v.glow ?? 12) / 100);
    ctx.save();
    const field = ctx.createRadialGradient(g.cx, g.cy, g.base * 0.04, g.cx, g.cy, Math.max(g.rx, g.ry) * 1.45);
    field.addColorStop(0.00, rgba('#000000', 0.84));
    field.addColorStop(0.18, rgba(v.middleColor || '#07102b', 0.18));
    field.addColorStop(0.48, rgba(v.coreColor, 0.004 + glowLevel * 0.020));
    field.addColorStop(0.76, rgba(v.rimColor, 0.003 + glowLevel * 0.014));
    field.addColorStop(1.00, rgba(v.backdropColor || '#020611', 0));
    ctx.fillStyle = field;
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, g.rx * 1.24, g.ry * 1.04, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawWormholeArms(ctx, g, t) {
    const v = this.values;
    const amount = clamp01((v.armAmount ?? 0) / 100);
    const opacity = clamp01((v.armOpacity ?? 0) / 100);
    const thicknessValue = clamp01((v.armThickness ?? 0) / 100);
    if (amount <= 0.001 || opacity <= 0.001 || thicknessValue <= 0.001) return;

    const dir = (v.swirl ?? 80) >= 0 ? 1 : -1;
    const speedControl = clamp01((v.armSpeed ?? 30) / 100);
    const speed = Math.pow(speedControl, 2) * 0.62;
    const turns = scale(0.55, 5.25, clamp01((v.armCurl ?? 62) / 100));
    const radiusScale = scale(0.18, 1.72, clamp01((v.armRadius ?? 60) / 100));
    const softness = scale(1.0, 12.0, clamp01((v.armSoftness ?? 34) / 100));
    const definition = clamp01((v.armDefinition ?? 50) / 100);
    const pulse = 1 + Math.sin(t * scale(0.65, 3.6, speedControl)) * scale(0, 0.55, clamp01((v.armPulseStrength ?? 0) / 100));
    const noiseStrength = scale(0.002, 0.048, clamp01((v.noise ?? 20) / 100));
    const baseThickness = g.base * scale(0.012, 0.118, thicknessValue) * pulse;
    const colourFor = (i) => (i % 3 === 0 ? v.coreColor : (i % 3 === 1 ? v.rimColor : v.accentColor));

    // Soft body: this is deliberately driven by the arm controls, so Amount/Opacity/Thickness are visibly testable.
    const lobeCount = Math.round(scale(0, 54, amount));
    if (lobeCount > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.filter = `blur(${softness + scale(2, 9, 1 - definition)}px)`;
      for (let i = 0; i < lobeCount; i += 1) {
        const seed = i * 18.713;
        const armIndex = i % Math.max(2, Math.round(scale(2, 8, amount)));
        const baseAngle = (armIndex / Math.max(2, Math.round(scale(2, 8, amount)))) * TAU;
        const local = hash1(seed + 1.2);
        const radial = scale(0.20, 1.05, local) * radiusScale;
        const angle = baseAngle + dir * radial * TAU * turns * 0.35 + t * speed * dir * scale(0.35, 1.05, hash1(seed + 2.4));
        const x = g.cx + Math.cos(angle) * g.rx * radial;
        const y = g.cy + Math.sin(angle) * g.ry * radial * 0.88;
        const major = baseThickness * scale(2.2, 7.5, hash1(seed + 3.6));
        const minor = major * scale(0.28, 0.52, hash1(seed + 4.8));
        const alpha = Math.min(0.26, opacity * scale(0.10, 0.38, hash1(seed + 5.9)) * scale(0.55, 1.15, amount));
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2 + (hash1(seed + 6.2) - 0.5) * 0.8);
        ctx.fillStyle = rgba(colourFor(i), alpha);
        ctx.beginPath();
        ctx.ellipse(0, 0, major, minor, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    // Defined spiral bands: these make curl/radius/speed/definition visibly change the shape of the wormhole.
    const bandCount = Math.max(0, Math.round(scale(0, 18, amount)));
    if (!bandCount) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < bandCount; i += 1) {
      const seed = i * 24.317;
      const startAngle = (i / bandCount) * TAU + hash1(seed) * 0.45 + t * speed * dir;
      const colour = colourFor(i);
      const lineAlpha = Math.min(0.42, opacity * scale(0.18, 0.62, definition) * scale(0.65, 1.0, hash1(seed + 1.1)));
      ctx.save();
      ctx.filter = `blur(${scale(0.15, 2.8, 1 - definition)}px)`;
      ctx.strokeStyle = rgba(colour, lineAlpha);
      ctx.lineWidth = Math.max(0.9, baseThickness * scale(0.45, 1.35, definition));
      ctx.shadowColor = colour;
      ctx.shadowBlur = baseThickness * scale(1.0, 3.8, opacity);
      ctx.beginPath();
      const steps = 58;
      for (let s = 0; s <= steps; s += 1) {
        const p = s / steps;
        const radial = Math.pow(1 - p, 0.72) * radiusScale;
        const angle = startAngle + dir * p * TAU * turns;
        const broken = fbm(Math.cos(angle) * 1.8 + seed * 0.07 + p * 0.8, Math.sin(angle) * 1.8 - seed * 0.03 + t * 0.025, 3);
        const jitter = (broken - 0.5) * g.base * noiseStrength;
        const fadeIn = smoothstep(0.00, 0.16, p);
        const fadeOut = 1 - smoothstep(0.78, 1.00, p);
        ctx.globalAlpha = fadeIn * fadeOut * scale(0.55, 1.0, broken);
        const x = g.cx + Math.cos(angle) * (g.rx * radial + jitter);
        const y = g.cy + Math.sin(angle) * (g.ry * radial * 0.88 + jitter * 0.70);
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    ctx.restore();
  }

  drawWormholePullCore(ctx, g, t) {
    const v = this.values;
    const glowLevel = clamp01((v.glow ?? 12) / 100);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const glow = ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, g.base * 0.28);
    glow.addColorStop(0.00, rgba(v.coreColor, 0.06 + glowLevel * 0.10));
    glow.addColorStop(0.24, rgba(v.coreColor, 0.05 + glowLevel * 0.08));
    glow.addColorStop(0.58, rgba(v.rimColor, 0.028));
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
    const count = Math.round(scale(0, 70, (v.particleAmount ?? 24) / 100));
    const opacityMul = scale(0, 0.70, (v.particleOpacity ?? 24) / 100);
    if (count <= 0 || opacityMul <= 0.001) return;
    const speed = Math.pow((v.particleSpeed ?? 28) / 100, 2) * 0.42;
    const spread = scale(0.03, 0.76, (v.particleSpread ?? 48) / 100);
    const sizeBase = scale(0.4, 5.0, (v.particleSize ?? 18) / 100);
    const glow = scale(0, 5.0, (v.particleGlow ?? 20) / 100);
    const pulse = 1 + Math.sin(t * scale(0.8, 3.2, (v.particleSpeed ?? 28) / 100)) * scale(0, 0.42, (v.particlePulseStrength ?? 0) / 100);
    const turns = scale(1.0, 3.6, Math.abs(v.swirl ?? 80) / 100);
    const dir = (v.swirl ?? 80) >= 0 ? 1 : -1;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < count; i += 1) {
      const seed = i * 17.17;
      const p = fract(t * speed * 0.36 + hash1(seed + 2.9));
      const inward = Math.pow(1 - p, 1.08);
      const start = TAU * hash1(seed + 1.1);
      const angle = start + dir * p * TAU * turns + Math.sin(t * 0.20 + seed) * spread;
      const x = g.cx + Math.cos(angle) * g.rx * scale(0.08, 1.08, inward);
      const y = g.cy + Math.sin(angle) * g.ry * scale(0.06, 0.95, inward);
      const size = sizeBase * (0.40 + inward * 0.85) * (0.65 + hash1(seed + 3.6) * 0.75) * pulse;
      const alpha = Math.min(0.32, (0.10 + hash1(seed + 4.2) * 0.24) * Math.sin(p * Math.PI) * opacityMul * pulse);
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
    const amount = Math.round(scale(0, 80, (v.emissionAmount ?? 0) / 100));
    const opacity = scale(0, 0.62, (v.emissionOpacity ?? 0) / 100);
    if (amount <= 0 || opacity <= 0.001) return;
    const speed = scale(0.18, 2.40, (v.emissionSpeed ?? 45) / 100);
    const directionDeg = Number(v.emissionDirection ?? 0);
    const vacuum = Boolean(v.emissionVacuum);
    const trailLength = scale(0, 0.46, (v.emissionTrailLength ?? 42) / 100);
    const trailOpacity = scale(0, 0.65, (v.emissionTrailOpacity ?? 48) / 100);
    const sizeBase = scale(0.9, 5.4, (v.particleSize ?? 24) / 100);
    const glow = scale(2, 7, (v.particleGlow ?? 55) / 100);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.lineCap = 'round';
    for (let i = 0; i < amount; i += 1) {
      const seed = i * 31.731;
      const life = fract(t * speed * scale(0.12, 0.34, hash1(seed + 2)) + hash1(seed + 1));
      const distance = vacuum ? (1 - life) : life;
      const fade = Math.sin(life * Math.PI);
      const spreadAngle = directionDeg === 0 ? TAU * hash1(seed + 3) : (directionDeg * Math.PI / 180) + scale(-0.34, 0.34, hash1(seed + 4));
      const wobble = Math.sin(t * 1.7 + seed) * scale(0.00, 0.14, hash1(seed + 5));
      const angle = spreadAngle + wobble;
      const maxD = scale(0.28, 1.42, hash1(seed + 6));
      const x = g.cx + Math.cos(angle) * g.rx * maxD * distance;
      const y = g.cy + Math.sin(angle) * g.ry * maxD * distance * 0.90;
      const prevDistance = vacuum ? Math.min(1, distance + trailLength) : Math.max(0, distance - trailLength);
      const tx = g.cx + Math.cos(angle) * g.rx * maxD * prevDistance;
      const ty = g.cy + Math.sin(angle) * g.ry * maxD * prevDistance * 0.90;
      const colour = i % 3 === 0 ? v.coreColor : (i % 3 === 1 ? v.rimColor : v.accentColor);
      const alpha = Math.min(0.38, opacity * fade * scale(0.44, 1.08, hash1(seed + 7)));
      const size = sizeBase * scale(0.65, 1.45, hash1(seed + 8));
      if (trailLength > 0.002 && trailOpacity > 0.001) {
        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, rgba(colour, 0));
        grad.addColorStop(1, rgba(colour, alpha * trailOpacity));
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(1.0, size * 1.05);
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
    ctx.globalCompositeOperation = 'screen';
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
    for (let i = 0; i < Math.round(scale(0, 48, (v.particleAmount ?? 48) / 100)); i += 1) {
      const seed = i * 3.4;
      const y = g.cy - height + hash1(seed) * height * 2;
      const x = x0 + (hash1(seed + 1) - 0.5) * width * 2.2;
      const length = scale(g.base * 0.04, g.base * 0.22, hash1(seed + 2));
      const color = i % 2 ? v.rimColor : v.accentColor;
      ctx.strokeStyle = rgba(color, scale(0.04, 0.28, hash1(seed + 3)) * clamp01((v.particleOpacity ?? 50) / 100));
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

function vlayer(value, fallback) {
  return value || fallback;
}
