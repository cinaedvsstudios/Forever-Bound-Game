/*
 * Artifex Effect Editor particle runtime extraction target.
 *
 * Split stage 2: this file documents and prepares the runtime seam. The live
 * renderer still uses the proven inlined implementation in index.html until the
 * app passes the staged module-wiring tests.
 */

export const SHAPE_IDS = Object.freeze([
    'circle',
    'spark',
    'square',
    'triangle',
    'star',
    'cross-star',
    'capsule',
    'spear',
    'shard',
    'ring',
    'hexagon',
    'diamond'
]);

export function clampNumber(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.max(min, Math.min(max, number));
}

export function interpolateColorAlpha(color1 = '#ffffff', a1 = 1, color2 = '#ffffff', a2 = 1, factor = 0) {
    const clean = (color) => String(color || '#ffffff').replace('#', '').padEnd(6, 'f').slice(0, 6);
    const c1 = clean(color1);
    const c2 = clean(color2);

    const r1 = parseInt(c1.substring(0, 2), 16) || 255;
    const g1 = parseInt(c1.substring(2, 4), 16) || 255;
    const b1 = parseInt(c1.substring(4, 6), 16) || 255;
    const r2 = parseInt(c2.substring(0, 2), 16) || 255;
    const g2 = parseInt(c2.substring(2, 4), 16) || 255;
    const b2 = parseInt(c2.substring(4, 6), 16) || 255;

    const t = clampNumber(factor, 0, 1);
    const r = Math.round(r1 + t * (r2 - r1));
    const g = Math.round(g1 + t * (g2 - g1));
    const b = Math.round(b1 + t * (b2 - b1));
    const alpha = clampNumber(a1 + t * (a2 - a1), 0, 1);

    return { color: `rgb(${r}, ${g}, ${b})`, alpha };
}

export function interpolateColorsMulti(colors = ['#ffffff'], alphas = [1], factor = 0) {
    if (!Array.isArray(colors) || colors.length === 0) return { color: '#ffd23f', alpha: 1 };
    const safeAlphas = colors.map((_, index) => Array.isArray(alphas) && alphas[index] !== undefined ? alphas[index] : 1);

    if (colors.length === 1) return { color: colors[0], alpha: safeAlphas[0] };
    if (colors.length === 2) return interpolateColorAlpha(colors[0], safeAlphas[0], colors[1], safeAlphas[1], factor);

    const segments = colors.length - 1;
    const scaledFactor = clampNumber(factor, 0, 1) * segments;
    const index = Math.min(Math.floor(scaledFactor), segments - 1);
    const segmentFactor = scaledFactor - index;
    return interpolateColorAlpha(colors[index], safeAlphas[index], colors[index + 1], safeAlphas[index + 1], segmentFactor);
}
