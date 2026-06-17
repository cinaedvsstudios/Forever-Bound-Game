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
    const amount = Math.round(scale(0, 104, amountValue));
    const gammaBoost = scale(1, 3.0, (v.orbitCloudGamma ?? 0) / 100);
    const opacity = scale(0, 1.12, opacityValue) * gammaBoost;
    if (amount <= 0 || opacity <= 0.001) return;

    const radiusValue = (v.orbitCloudRadius ?? 72) / 100;
    const stagger = scale(0, 1.65, (v.orbitCloudStagger ?? 48) / 100);
    const pulse = 1 + Math.sin(t * scale(0.7, 3.0, (v.orbitCloudSpeed ?? 35) / 100)) * scale(0, 0.55, (v.orbitCloudPulseStrength ?? 0) / 100);
    const speed = Math.pow((v.orbitCloudSpeed ?? 35) / 100, 2) * 0.48;
    const dir = (v.swirl ?? 80) >= 0 ? 1 : -1;
    const thickness = g.base * scale(0.010, 0.190, sizeValue);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = `blur(${scale(4, 13, (v.armSoftness ?? v.blur ?? 40) / 100) + scale(0, 32, (v.orbitCloudExtraBlur ?? 0) / 100)}px)`;
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
      const alpha = Math.min(1, opacity * scale(0.34, 1.1, hash1(seed + 6)));
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
}
