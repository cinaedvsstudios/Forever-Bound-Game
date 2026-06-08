const TAU = Math.PI * 2;
const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v)));
const clamp01 = (v) => clamp(v, 0, 1);
const scale = (min, max, v) => min + (max - min) * clamp01(v);
const fract = (v) => v - Math.floor(v);
const hash1 = (v) => fract(Math.sin(v * 127.1) * 43758.5453123);
const hash2 = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
const smoothstep = (a, b, v) => {
  const t = clamp01((v - a) / Math.max(0.0001, b - a));
  return t * t * (3 - 2 * t);
};

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
  let width = tw, height = th;
  if (ir > tr) { height = th; width = height * ir; }
  else { width = tw; height = width / ir; }
  return { x: (tw - width) / 2, y: (th - height) / 2, width, height };
}

export class ShimmerDistortionEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridCanvas = document.createElement('canvas');
    this.grid = this.gridCanvas.getContext('2d');
    this.textureImage = null;
    this.values = {};
    this.gridKey = '';
  }
  setValues(values) { this.values = { ...values }; }
  setTextureImage(image = null) { this.textureImage = image; }
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
    const v = this.values, w = this.canvas.width, h = this.canvas.height;
    const base = Math.min(w, h) * scale(0.08, 0.62, (v.radius ?? 60) / 100);
    const pulse = 1 + Math.sin(t * scale(0.4, 4, (v.pulse ?? 45) / 100)) * 0.035 * ((v.loopIntensity ?? 50) / 100);
    return { w, h, cx: w * ((v.positionX ?? 50) / 100), cy: h * ((v.positionY ?? 50) / 100), base,
      rx: Math.max(0.01, base * ((v.scaleX ?? 100) / 100) * pulse),
      ry: Math.max(0.01, base * ((v.scaleY ?? 100) / 100) * pulse) };
  }
  draw(t = 0) {
    this.resize();
    const g = this.geo(t), v = this.values, ctx = this.ctx;
    ctx.clearRect(0, 0, g.w, g.h);
    ctx.fillStyle = v.backdropColor || '#09080f';
    ctx.fillRect(0, 0, g.w, g.h);
    if (v.showGrid) this.drawGrid(g);
    if (v.type === 'heat') { this.drawShimmer(ctx, g, t); this.drawHeat(ctx, g, t); }
    else if (v.type === 'wormhole') this.drawWormhole(ctx, g, t);
    else if (v.type === 'transition') { this.drawShimmer(ctx, g, t); this.drawTransition(ctx, g, t); }
    else this.drawPortalRing(ctx, g, t);
  }
  drawGrid(g) {
    const v = this.values;
    const key = `${g.w}x${g.h}|${v.coreColor}|${v.rimColor}|${v.accentColor}|${v.backdropColor}`;
    if (this.gridKey !== key) {
      this.gridKey = key;
      const ctx = this.grid;
      ctx.clearRect(0, 0, g.w, g.h);
      const major = Math.max(34, Math.round(g.w / 16)), minor = Math.max(17, Math.round(g.w / 32));
      ctx.lineWidth = Math.max(1, g.w / 900);
      for (let x = 0; x <= g.w; x += minor) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, g.h);
        ctx.strokeStyle = x % major === 0 ? rgba(v.coreColor, 0.18) : rgba(v.coreColor, 0.055); ctx.stroke();
      }
      for (let y = 0; y <= g.h; y += minor) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(g.w, y);
        ctx.strokeStyle = y % major === 0 ? rgba(v.rimColor, 0.14) : rgba(v.rimColor, 0.045); ctx.stroke();
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
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let y = 0; y < g.h; y += step) {
      const ny = (y - g.cy) / Math.max(1, g.ry);
      for (let x = 0; x < g.w; x += step * 2) {
        const nx = (x - g.cx) / Math.max(1, g.rx);
        const d = Math.sqrt(nx * nx + ny * ny);
        const mask = v.type === 'heat' ? Math.max(0, 1 - Math.abs(ny) * 0.9) : 1 - smoothstep(1 - softness, 1.08, d);
        if (mask <= 0.01) continue;
        const wave = v.type === 'heat' ? Math.sin(y * waveSize * 2.8 + t * waveSpeed * 2.2) : Math.sin(d / waveSize + t * waveSpeed + Math.atan2(ny, nx) * 3);
        const alpha = Math.max(0, (strength * 0.16 + refraction * 0.12) * mask);
        ctx.strokeStyle = rgba(v.coreColor, alpha); ctx.lineWidth = Math.max(1, step * 0.25); ctx.beginPath();
        const offset = wave * strength * step * 4 * mask;
        ctx.moveTo(x + offset, y); ctx.lineTo(x + step * 2 + offset, y + wave * step * 0.7); ctx.stroke();
      }
    }
    ctx.restore();
  }
  drawHeat(ctx, g, t) {
    const v = this.values;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 22; i += 1) {
      const y = g.cy - g.ry * 0.9 + (i / 21) * g.ry * 1.8;
      const alpha = 0.035 + 0.04 * Math.sin(i * 0.7 + t);
      ctx.strokeStyle = rgba(v.accentColor, alpha); ctx.lineWidth = Math.max(1, g.h / 540); ctx.beginPath();
      for (let x = 0; x <= g.w; x += 18) {
        const yy = y + Math.sin(x * 0.014 + t * 1.6 + i * 0.4) * g.ry * 0.035;
        if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  drawPortalRing(ctx, g, t) {
    this.drawPortalHaze(g, t);
    this.drawDarkAperture(g);
    this.drawCircularWisps(g, t);
    this.drawPortalSparks(g, t);
    this.drawPortalGlow(g);
  }
  drawPortalHaze(g, t) {
    const ctx = this.ctx, v = this.values, count = Math.round(scale(20, 54, (v.cloudiness ?? 46) / 100));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(10px)';
    for (let i = 0; i < count; i += 1) {
      const seed = i * 5.733, a = TAU * hash1(seed) + t * 0.04 * (i % 2 ? 1 : -1);
      const jitter = (hash2(Math.cos(a) * 4 + seed, Math.sin(a) * 4 - seed + t * 0.08) - 0.5);
      const x = g.cx + Math.cos(a) * (g.rx * 0.78 + jitter * g.base * 0.12);
      const y = g.cy + Math.sin(a) * (g.ry * 0.84 + jitter * g.base * 0.10);
      const size = scale(g.base * 0.025, g.base * 0.09, hash1(seed + 2.5));
      const color = i % 3 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
      ctx.fillStyle = rgba(color, scale(0.025, 0.12, hash1(seed + 4.4)));
      ctx.beginPath(); ctx.arc(x, y, size, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  drawDarkAperture(g) {
    const ctx = this.ctx, v = this.values;
    ctx.save();
    const outer = ctx.createRadialGradient(g.cx, g.cy, g.base * 0.18, g.cx, g.cy, Math.max(g.rx, g.ry) * 1.28);
    outer.addColorStop(0, rgba(v.coreColor, 0.035)); outer.addColorStop(0.58, rgba(v.rimColor, 0.04)); outer.addColorStop(1, rgba(v.rimColor, 0));
    ctx.fillStyle = outer; ctx.beginPath(); ctx.ellipse(g.cx, g.cy, g.rx * 1.18, g.ry * 1.13, 0, 0, TAU); ctx.fill();
    const aperture = ctx.createRadialGradient(g.cx, g.cy, g.base * 0.03, g.cx, g.cy, Math.max(g.rx, g.ry) * 0.70);
    aperture.addColorStop(0, rgba('#000000', 0.92)); aperture.addColorStop(0.58, rgba('#030611', 0.84)); aperture.addColorStop(1, rgba('#06121c', 0.66));
    ctx.fillStyle = aperture; ctx.beginPath(); ctx.ellipse(g.cx, g.cy, g.rx * 0.58, g.ry * 0.63, 0, 0, TAU); ctx.fill();
    if (v.sourceMode === 'texture' && this.textureImage) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(g.cx, g.cy, g.rx * 0.56, g.ry * 0.61, 0, 0, TAU); ctx.clip();
      const rect = cover(this.textureImage.width, this.textureImage.height, g.rx * 1.16, g.ry * 1.22);
      ctx.globalAlpha = scale(0.12, 0.70, (v.textureStrength ?? 70) / 100);
      ctx.drawImage(this.textureImage, g.cx - g.rx * 0.58 + rect.x, g.cy - g.ry * 0.61 + rect.y, rect.width, rect.height);
      ctx.restore();
    }
    ctx.restore();
  }
  drawCircularWisps(g, t) {
    const ctx = this.ctx, v = this.values;
    const layers = 5, strands = Math.round(scale(5, 11, (v.wispAmount ?? 64) / 100));
    const baseAlpha = scale(0.12, 0.64, (v.rimAlpha ?? 68) / 100), glow = scale(8, 30, (v.glow ?? 54) / 100);
    const orbitSpeed = scale(0.18, 1.45, (v.wispSpeed ?? 58) / 100), widthBase = scale(1.1, 4.2, (v.wispSize ?? 54) / 100);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let layer = 0; layer < layers; layer += 1) {
      const layerRadius = scale(0.64, 0.88, layer / Math.max(1, layers - 1));
      const layerPhase = t * orbitSpeed * (layer % 2 ? -0.34 : 0.42) + layer * 1.17;
      for (let i = 0; i < strands; i += 1) {
        const seed = layer * 100 + i * 11.23;
        const start = TAU * (i / strands) + layerPhase + hash1(seed) * 0.28;
        const len = scale(0.24, 0.82, hash1(seed + 2.1));
        const color = i % 4 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
        const pulse = 0.64 + Math.sin(t * 2.2 + seed) * 0.22 + hash1(seed + 3.4) * 0.18;
        ctx.strokeStyle = rgba(color, baseAlpha * scale(0.22, 0.76, hash1(seed + 5.3)) * pulse);
        ctx.lineWidth = widthBase * scale(0.45, 1.4, hash1(seed + 7.7));
        ctx.shadowColor = color; ctx.shadowBlur = glow * scale(0.65, 1.45, hash1(seed + 8.9)); ctx.beginPath();
        for (let s = 0; s <= 24; s += 1) {
          const q = s / 24, a = start + len * q;
          const ripple = Math.sin(q * TAU + t * 1.7 + seed) * g.base * 0.012;
          const rough = (hash2(Math.cos(a) * 8.8 + seed, Math.sin(a) * 9.3 - seed + t * 0.16) - 0.5) * g.base * 0.035;
          const x = g.cx + Math.cos(a) * (g.rx * layerRadius + ripple + rough);
          const y = g.cy + Math.sin(a) * (g.ry * layerRadius + ripple * 0.72 + rough * 0.62);
          if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    for (let i = 0; i < 34; i += 1) {
      const seed = i * 3.19, start = TAU * hash1(seed) + t * 0.08, len = scale(0.025, 0.11, hash1(seed + 4.4));
      const color = i % 3 === 0 ? v.coreColor : v.rimColor;
      ctx.strokeStyle = rgba(color, baseAlpha * 0.38); ctx.lineWidth = scale(0.7, 2.2, hash1(seed + 8.2));
      ctx.shadowColor = color; ctx.shadowBlur = glow; ctx.beginPath();
      for (let s = 0; s <= 5; s += 1) {
        const a = start + len * (s / 5), jitter = (hash2(Math.cos(a) * 12 + seed, Math.sin(a) * 11 + t * 0.2) - 0.5) * g.base * 0.018;
        const x = g.cx + Math.cos(a) * (g.rx * 0.59 + jitter), y = g.cy + Math.sin(a) * (g.ry * 0.64 + jitter * 0.72);
        if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  drawPortalSparks(g, t) {
    const ctx = this.ctx, v = this.values, count = Math.round(scale(0, 55, (v.particleAmount ?? 34) / 100));
    const speed = scale(0.2, 1.9, (v.particleSpeed ?? 68) / 100);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < count; i += 1) {
      const seed = i * 17.17, p = fract(t * speed * 0.15 + hash1(seed));
      const a = TAU * hash1(seed + 1.1) + t * 0.18, r = scale(0.68, 1.08, p) + (hash1(seed + 4.4) - 0.5) * 0.08;
      const x = g.cx + Math.cos(a) * g.rx * r, y = g.cy + Math.sin(a) * g.ry * r;
      const size = scale(0.7, 3.2, (v.particleSize ?? 16) / 100) * scale(0.8, 1.8, hash1(seed + 2.7));
      const alpha = scale(0.10, 0.54, hash1(seed + 3.6)) * Math.sin(p * Math.PI);
      const color = i % 3 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
      ctx.fillStyle = rgba(color, alpha); ctx.shadowColor = color; ctx.shadowBlur = size * 7; ctx.beginPath(); ctx.arc(x, y, size, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  drawPortalGlow(g) {
    const ctx = this.ctx, v = this.values, glow = scale(0.05, 0.34, (v.glow ?? 54) / 100);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(g.cx, g.cy, g.base * 0.32, g.cx, g.cy, Math.max(g.rx, g.ry) * 1.48);
    grad.addColorStop(0, rgba(v.coreColor, glow * 0.035)); grad.addColorStop(0.50, rgba(v.rimColor, glow * 0.09)); grad.addColorStop(1, rgba(v.rimColor, 0));
    ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(g.cx, g.cy, g.rx * 1.42, g.ry * 1.30, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  drawWormhole(ctx, g, t) {
    const v = this.values;
    const strandCount = Math.round(scale(26, 66, (v.cloudiness ?? 58) / 100));
    const turns = scale(2.15, 5.6, (v.swirl + 100) / 200), speed = scale(0.26, 1.85, (v.waveSpeed ?? 58) / 100);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; this.drawWormholeHaze(ctx, g, t);
    for (let i = 0; i < strandCount; i += 1) {
      const seed = i * 4.77, start = TAU * hash1(seed) + t * speed * scale(0.05, 0.22, hash1(seed + 7));
      const color = i % 5 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
      const alpha = scale(0.035, 0.16, hash1(seed + 2.4));
      const width = scale(2.2, 7.8, hash1(seed + 4.9)) * scale(0.7, 1.25, (v.wispSize ?? 58) / 58);
      ctx.save(); ctx.filter = `blur(${scale(0.6, 2.2, hash1(seed + 8.1))}px)`; ctx.strokeStyle = rgba(color, alpha);
      ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = color; ctx.shadowBlur = scale(8, 26, (v.glow ?? 54) / 100); ctx.beginPath();
      const steps = 46, startP = hash1(seed + t * 0.014) * 0.16, endP = scale(0.58, 1.0, hash1(seed + 9.8));
      for (let s = 0; s <= steps; s += 1) {
        const q = startP + (endP - startP) * (s / steps), falloff = Math.pow(1 - q, 1.72);
        const a = start + q * TAU * turns + t * speed * (0.18 + hash1(seed + 6) * 0.24);
        const cloudy = (hash2(Math.cos(a) * 4.8 + seed, Math.sin(a) * 5.4 - seed + t * 0.12) - 0.5) * g.base * 0.05;
        const x = g.cx + Math.cos(a) * (g.rx * falloff + cloudy), y = g.cy + Math.sin(a) * (g.ry * falloff + cloudy * 0.74);
        if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.restore();
    }
    for (let ring = 0; ring < 5; ring += 1) {
      const radius = scale(0.12, 0.96, ring / 4), color = ring % 2 ? v.rimColor : v.coreColor;
      ctx.strokeStyle = rgba(color, 0.045 * (1 - ring / 6)); ctx.lineWidth = Math.max(1.2, g.base * 0.004); ctx.shadowColor = color; ctx.shadowBlur = 12; ctx.beginPath();
      for (let s = 0; s <= 116; s += 1) {
        const a = TAU * (s / 116), wave = Math.sin(a * 4 + t * 1.0 + ring) * g.base * 0.015;
        const x = g.cx + Math.cos(a) * (g.rx * radius + wave), y = g.cy + Math.sin(a) * (g.ry * radius + wave * 0.72);
        if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    const hole = ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, g.base * 0.20);
    hole.addColorStop(0, rgba('#000000', 0.92)); hole.addColorStop(0.50, rgba('#030612', 0.76)); hole.addColorStop(1, rgba(v.coreColor, 0));
    ctx.fillStyle = hole; ctx.beginPath(); ctx.ellipse(g.cx, g.cy, g.rx * 0.15, g.ry * 0.17, 0, 0, TAU); ctx.fill();
    ctx.restore(); this.drawParticles(ctx, g, t, 0.36);
  }
  drawWormholeHaze(ctx, g, t) {
    const v = this.values; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(16px)';
    for (let i = 0; i < 34; i += 1) {
      const seed = i * 9.21, a = TAU * hash1(seed) + t * 0.035 * (i % 2 ? 1 : -1), r = scale(0.55, 1.38, hash1(seed + 3.2));
      const x = g.cx + Math.cos(a) * g.rx * r, y = g.cy + Math.sin(a) * g.ry * r;
      const sx = scale(g.base * 0.035, g.base * 0.20, hash1(seed + 5.5)), sy = scale(g.base * 0.018, g.base * 0.10, hash1(seed + 6.5));
      const color = i % 4 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor), pulse = 0.55 + Math.sin(t * 1.1 + seed) * 0.28;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.sin(seed) * 0.8); ctx.fillStyle = rgba(color, scale(0.018, 0.082, hash1(seed + 7.2)) * pulse); ctx.beginPath(); ctx.ellipse(0, 0, sx, sy, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }
  drawParticles(ctx, g, t, mult = 1) {
    const v = this.values, count = Math.round(scale(0, 70, (v.particleAmount ?? 48) / 100) * mult);
    if (!count) return;
    const speed = scale(0.18, 2.7, (v.particleSpeed ?? 68) / 100), spread = scale(0.12, 2.1, (v.particleSpread ?? 72) / 100), sizeBase = scale(1.1, 6.2, (v.particleSize ?? 20) / 100);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < count; i += 1) {
      const seed = i * 17.17, p = fract(t * speed * 0.2 + hash1(seed + 2.9));
      const a = TAU * hash1(seed + 1.1) + Math.sin(t * 0.7 + seed) * spread;
      const d = scale(g.base * 0.06, g.base * 1.72, p), x = g.cx + Math.cos(a) * d * (g.rx / g.base), y = g.cy + Math.sin(a) * d * (g.ry / g.base);
      const size = sizeBase * (1 - p * 0.58) * (0.7 + hash1(seed + 3.6) * 0.65), alpha = (0.18 + hash1(seed + 4.2) * 0.32) * Math.sin((1 - p) * Math.PI) * mult;
      const color = i % 3 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
      ctx.fillStyle = rgba(color, alpha); ctx.shadowColor = color; ctx.shadowBlur = size * 5; ctx.beginPath(); ctx.arc(x, y, size, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  drawTransition(ctx, g, t) {
    const v = this.values;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const x0 = g.cx + Math.sin(t * 3.1) * g.base * 0.035, height = g.ry * 1.55, width = Math.max(4, g.rx * 0.85);
    const grad = ctx.createLinearGradient(x0 - width, g.cy, x0 + width, g.cy);
    grad.addColorStop(0, rgba(v.rimColor, 0)); grad.addColorStop(0.44, rgba(v.rimColor, 0.12)); grad.addColorStop(0.50, rgba(v.coreColor, 0.34)); grad.addColorStop(0.56, rgba(v.accentColor, 0.20)); grad.addColorStop(1, rgba(v.rimColor, 0));
    ctx.fillStyle = grad; ctx.shadowColor = v.rimColor; ctx.shadowBlur = 24; ctx.beginPath();
    for (let i = 0; i <= 36; i += 1) { const q = i / 36, y = g.cy - height + q * height * 2, x = x0 + Math.sin(q * 20 + t * 5) * width * 0.18 + (hash1(i * 2.1 + Math.floor(t * 14)) - 0.5) * width * 0.25; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    for (let i = 36; i >= 0; i -= 1) { const q = i / 36, y = g.cy - height + q * height * 2, x = x0 + width * 0.38 + Math.sin(q * 16 - t * 4) * width * 0.17 + (hash1(i * 3.7 + 2) - 0.5) * width * 0.22; ctx.lineTo(x, y); }
    ctx.closePath(); ctx.fill();
    for (let i = 0; i < 34; i += 1) { const seed = i * 3.4, y = g.cy - height + hash1(seed) * height * 2, x = x0 + (hash1(seed + 1) - 0.5) * width * 2.2, length = scale(g.base * 0.04, g.base * 0.22, hash1(seed + 2)), color = i % 2 ? v.rimColor : v.accentColor; ctx.strokeStyle = rgba(color, scale(0.07, 0.34, hash1(seed + 3))); ctx.lineWidth = scale(1, 3, hash1(seed + 4)); ctx.shadowColor = color; ctx.shadowBlur = 18; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (hash1(seed + 5) - 0.5) * length, y + (hash1(seed + 6) - 0.5) * length); ctx.stroke(); }
    ctx.restore(); this.drawParticles(ctx, g, t, 0.8); this.drawGlow(ctx, g, 0.3);
  }
  drawGlow(ctx, g, mult = 1) {
    const v = this.values, glow = scale(0, 0.34, (v.glow ?? 62) / 100) * mult;
    if (!glow) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(g.cx, g.cy, g.base * 0.25, g.cx, g.cy, Math.max(g.rx, g.ry) * 1.75);
    grad.addColorStop(0, rgba(v.coreColor, glow * 0.05)); grad.addColorStop(0.55, rgba(v.rimColor, glow * 0.07)); grad.addColorStop(1, rgba(v.rimColor, 0));
    ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(g.cx, g.cy, g.rx * 1.55, g.ry * 1.34, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
}
