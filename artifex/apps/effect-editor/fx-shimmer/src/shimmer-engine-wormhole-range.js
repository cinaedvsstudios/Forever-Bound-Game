import { ShimmerDistortionEngine as BaseShimmerDistortionEngine } from './shimmer-engine.js?v=1.40';

const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value)));
const clamp01 = (value) => clamp(value, 0, 1);
const scale = (min, max, value) => min + (max - min) * clamp01(value);
const fract = (value) => value - Math.floor(value);
const hash1 = (value) => fract(Math.sin(value * 127.1) * 43758.5453123);

function hexToRgb(hex) {
  const safe = String(hex || '#ffffff').replace('#', '').trim();
  const full = safe.length === 3 ? safe.split('').map((char) => char + char).join('') : safe.padEnd(6, '0').slice(0, 6);
  const value = Number.parseInt(full, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha)})`;
}

export class ShimmerDistortionEngine extends BaseShimmerDistortionEngine {
  drawOrbitClouds(ctx, g, t, mode) {
    if (mode !== 'wormhole') return super.drawOrbitClouds(ctx, g, t, mode);

    const v = this.values;
    const amountValue = clamp(Number(v.orbitCloudAmount ?? 0), 0, 200) / 200;
    const opacityValue = clamp(Number(v.orbitCloudOpacity ?? 0), 0, 200) / 200;
    const sizeValue = clamp(Number(v.orbitCloudSize ?? 60), 0, 200) / 200;
    const speedRaw = clamp(Number(v.orbitCloudSpeed ?? 35), 0, 200);
    const speedBase = Math.pow(Math.min(speedRaw, 100) / 100, 2) * 0.48;
    const speedMultiplier = speedRaw <= 100 ? 1 : 1 + ((speedRaw - 100) / 100);
    const scaleX = clamp(Number(v.orbitCloudScaleX ?? 100), 20, 220) / 100;
    const scaleY = clamp(Number(v.orbitCloudScaleY ?? 100), 20, 220) / 100;
    const amount = Math.round(scale(0, 128, amountValue));
    const gammaBoost = scale(1, 3.0, (v.orbitCloudGamma ?? 0) / 100);
    const opacity = scale(0, 2.24, opacityValue) * gammaBoost;
    if (amount <= 0 || opacity <= 0.001) return;

    const radiusValue = (v.orbitCloudRadius ?? 72) / 100;
    const stagger = scale(0, 1.65, (v.orbitCloudStagger ?? 48) / 100);
    const pulse = 1 + Math.sin(t * scale(0.7, 3.0, speedRaw / 100)) * scale(0, 0.55, (v.orbitCloudPulseStrength ?? 0) / 100);
    const speed = speedBase * speedMultiplier;
    const dir = (v.swirl ?? 80) >= 0 ? 1 : -1;
    const thickness = g.base * scale(0.010, 0.220, sizeValue);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = `blur(${scale(3, 11, (v.armSoftness ?? v.blur ?? 40) / 100) + scale(0, 32, (v.orbitCloudExtraBlur ?? 0) / 100)}px)`;
    for (let i = 0; i < amount; i += 1) {
      const seed = i * 15.913;
      const orbit = TAU * (i / amount) + hash1(seed) * 0.65 + t * speed * dir * scale(0.45, 1.35, hash1(seed + 2));
      const localRadius = scale(0.25, 1.32, radiusValue) * scale(Math.max(0.03, 1 - stagger * 0.80), 1 + stagger * 1.45, hash1(seed + 3));
      const wobble = Math.sin(t * speed * 2.4 + seed) * g.base * scale(0.015, 0.090, (v.orbitCloudStagger ?? 48) / 100);
      const x = g.cx + Math.cos(orbit) * (g.rx * scaleX * localRadius + wobble);
      const y = g.cy + Math.sin(orbit) * (g.ry * scaleY * localRadius * 0.88 + wobble * 0.68);
      const major = thickness * scale(1.0, 4.4, hash1(seed + 4)) * pulse;
      const minor = major * scale(0.30, 0.62, hash1(seed + 5));
      const colour = i % 4 === 0 ? v.accentColor : (i % 2 === 0 ? v.coreColor : v.rimColor);
      const alpha = Math.min(1, opacity * scale(0.34, 1.1, hash1(seed + 6)));
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(orbit + Math.PI / 2 + (hash1(seed + 7) - 0.5) * 0.9);
      ctx.scale(scaleX, scaleY);
      ctx.fillStyle = rgba(colour, alpha);
      ctx.beginPath();
      ctx.ellipse(0, 0, major, minor, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  drawWormholeParticles(ctx, g, t) {
    const v = this.values;
    const count = Math.round(scale(0, 70, (v.particleAmount ?? 24) / 100));
    const opacityMul = scale(0, 1.40, clamp(Number(v.particleOpacity ?? 24), 0, 200) / 200);
    const gamma = scale(1, 3.0, (v.particleGamma ?? 0) / 100);
    if (count <= 0 || opacityMul <= 0.001) return;
    const speed = Math.pow((v.particleSpeed ?? 28) / 100, 2) * 0.42;
    const spread = scale(0.03, 1.52, clamp(Number(v.particleSpread ?? 48), 0, 200) / 200);
    const sizeBase = scale(0.4, 5.0, (v.particleSize ?? 18) / 100);
    const glow = scale(0, 5.0, (v.particleGlow ?? 20) / 100) * gamma;
    const pulse = 1 + Math.sin(t * scale(0.8, 3.2, (v.particleSpeed ?? 28) / 100)) * scale(0, 0.42, (v.particlePulseStrength ?? 0) / 100);
    const turns = scale(1.0, 3.6, Math.abs(v.swirl ?? 80) / 100);
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
      const alpha = Math.min(1, (0.10 + hash1(seed + 4.2) * 0.24) * Math.sin(p * Math.PI) * opacityMul * pulse * gamma);
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
    const opacity = scale(0, 1.24, clamp(Number(v.emissionOpacity ?? 0), 0, 200) / 200);
    const gamma = scale(1, 3.0, (v.emissionGamma ?? 0) / 100);
    if (amount <= 0 || opacity <= 0.001) return;
    const speed = scale(0.18, 2.40, (v.emissionSpeed ?? 45) / 100);
    const directionDeg = Number(v.emissionDirection ?? 0);
    const vacuum = Boolean(v.emissionVacuum);
    const trailLength = scale(0, 0.46, (v.emissionTrailLength ?? 42) / 100);
    const trailOpacity = scale(0, 1.30, clamp(Number(v.emissionTrailOpacity ?? 48), 0, 200) / 200) * gamma;
    const sizeBase = scale(0.9, 5.4, (v.particleSize ?? 24) / 100);
    const glow = scale(2, 7, (v.particleGlow ?? 55) / 100) * gamma;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
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
      const alpha = Math.min(1, opacity * fade * scale(0.44, 1.08, hash1(seed + 7)) * gamma);
      const size = sizeBase * scale(0.65, 1.45, hash1(seed + 8));
      if (trailLength > 0.002 && trailOpacity > 0.001) {
        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, rgba(colour, 0));
        grad.addColorStop(1, rgba(colour, Math.min(1, alpha * trailOpacity)));
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
}
