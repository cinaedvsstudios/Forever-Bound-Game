export const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value || 0)));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (min, max) => min + Math.random() * (max - min);
export const pick = (items) => items[Math.floor(Math.random() * items.length)];
export const $ = (id) => document.getElementById(id);

export function formatNumber(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return '0';
  return Math.abs(n % 1) < 0.001 ? String(Math.round(n)) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export function signedToFactor(value) {
  const v = Number(value || 0);
  return v >= 0 ? clamp(1 + (v / 100) * 3, 1, 4) : clamp(1 + (v / 100) * 0.95, 0.05, 1);
}
export function factorToSigned(value) {
  const f = Number(value || 1);
  return Math.round(f >= 1 ? ((f - 1) / 3) * 100 : ((f - 1) / 0.95) * 100);
}
export function sliderToVisualFactor(value) { return clamp(1 + Number(value || 0) / 100, 0, 2.5); }
export function visualFactorToSlider(value) { return Math.round((Number(value || 1) - 1) * 100); }
export function sliderToGlobalBrightness(value) { return sliderToVisualFactor(value); }
export function sliderToGlobalContrast(value) { return sliderToVisualFactor(value); }
export function sliderToGlobalSaturation(value) { return sliderToVisualFactor(value); }
export function sliderToOpacity(value) { return clamp(1 + Math.min(Number(value || 0), 0) / 100, 0, 1); }
export function opacityToSlider(value) { return Math.round((Number(value ?? 1) - 1) * 100); }
export function sliderToTint(value) { return clamp(Number(value || 0) / 100, 0, 1); }
export function tintToSlider(value) { return Math.round(clamp(Number(value || 0), 0, 1) * 100); }

export function isTextEntryTarget(event) {
  const target = event.target;
  if (!target) return false;
  if (target.isContentEditable) return true;
  const tag = String(target.tagName || '').toLowerCase();
  if (tag === 'textarea' || tag === 'select') return true;
  if (tag !== 'input') return false;
  const type = String(target.type || 'text').toLowerCase();
  return !['range', 'button', 'checkbox', 'color', 'radio', 'number'].includes(type);
}
