/*
 * Artifex Effect Editor engine helpers.
 *
 * This file replaces the earlier scattered engine/runtime helper files.
 * Keep preview performance modes, texture cache, built-in shape definitions,
 * blend modes, and the small runtime adapter here until the main renderer is extracted.
 */

export const PERFORMANCE_MODES = {
    full: {
        id: 'full',
        label: 'Full Quality',
        description: 'Normal editor preview quality.',
        particleRateMultiplier: 1,
        maxParticlesPerLayer: Infinity,
        glowMultiplier: 1,
        blurMultiplier: 1,
        drawGridEveryFrame: true,
        showHud: true,
        frameSkip: 0,
        useDevicePixelRatio: true
    },
    low: {
        id: 'low',
        label: 'Low Performance Mode',
        description: 'Faster preview mode for weaker devices. Does not change exported FX data.',
        particleRateMultiplier: 0.45,
        maxParticlesPerLayer: 450,
        glowMultiplier: 0.45,
        blurMultiplier: 0,
        drawGridEveryFrame: false,
        showHud: false,
        frameSkip: 1,
        useDevicePixelRatio: false
    }
};

export const CANVAS_BLEND_MODES = [
    { id: 'source-over', label: 'Source Over', description: 'Standard normal drawing.' },
    { id: 'lighter', label: 'Lighter / Additive Glow', description: 'Bright additive stacking for magic, fire, sparks, photons, and energy.' },
    { id: 'screen', label: 'Screen', description: 'Soft light blending for smoke, aura, glow, and overlays.' },
    { id: 'multiply', label: 'Multiply', description: 'Darkening blend for shadows, grime, corruption, and vignettes.' },
    { id: 'overlay', label: 'Overlay', description: 'Contrast blend for stylised colour and light effects.' },
    { id: 'soft-light', label: 'Soft Light', description: 'Gentler overlay-style blend for atmospheric effects.' }
];

export const BUILT_IN_SHAPES = [
    { id: 'circle', label: 'Circle', category: 'basic' },
    { id: 'ring', label: 'Ring', category: 'basic' },
    { id: 'square', label: 'Square', category: 'basic' },
    { id: 'rounded-square', label: 'Rounded Square', category: 'basic' },
    { id: 'triangle', label: 'Triangle', category: 'basic' },
    { id: 'right-triangle', label: 'Right Triangle', category: 'basic' },
    { id: 'hexagon', label: 'Hexagon', category: 'polygon' },
    { id: 'flat-hexagon', label: 'Flat Hexagon', category: 'polygon' },
    { id: 'octagon', label: 'Octagon', category: 'polygon' },
    { id: 'pentagon', label: 'Pentagon', category: 'polygon' },
    { id: 'diamond', label: 'Diamond', category: 'polygon' },
    { id: 'thin-diamond', label: 'Thin Diamond', category: 'polygon' },
    { id: 'flat-gem', label: 'Flat Gem', category: 'polygon' },
    { id: 'trapezoid', label: 'Trapezoid', category: 'polygon' },
    { id: 'parallelogram', label: 'Parallelogram', category: 'polygon' },
    { id: 'star', label: 'Star', category: 'magic' },
    { id: 'soft-star', label: 'Soft Star', category: 'magic' },
    { id: 'cross-star', label: 'Cross Star', category: 'magic' },
    { id: 'four-point-glint', label: 'Four Point Glint', category: 'magic' },
    { id: 'jagged-burst', label: 'Jagged Burst', category: 'magic' },
    { id: 'scalloped-circle', label: 'Scalloped Circle', category: 'organic' },
    { id: 'rough-blob', label: 'Rough Blob', category: 'organic' },
    { id: 'cloth-ragged-square', label: 'Ragged Square', category: 'organic' },
    { id: 'flame', label: 'Flame', category: 'organic' },
    { id: 'teardrop', label: 'Teardrop', category: 'organic' },
    { id: 'water-drop', label: 'Water Drop', category: 'organic' },
    { id: 'map-pin-drop', label: 'Map Pin Drop', category: 'organic' },
    { id: 'cloud-blob', label: 'Cloud Blob', category: 'organic' },
    { id: 'heart', label: 'Heart', category: 'symbol' },
    { id: 'gear', label: 'Gear', category: 'symbol' },
    { id: 'lightning-bolt', label: 'Lightning Bolt', category: 'symbol' },
    { id: 'scribble-stroke', label: 'Scribble Stroke', category: 'stroke' },
    { id: 'energy-scribble', label: 'Energy Scribble', category: 'stroke' },
    { id: 'swirl', label: 'Swirl', category: 'stroke' },
    { id: 'spear', label: 'Spear', category: 'weapon' },
    { id: 'three-point-shard', label: 'Three Point Shard', category: 'weapon' },
    { id: 'shard', label: 'Shard', category: 'weapon' },
    { id: 'capsule', label: 'Capsule', category: 'beam' },
    { id: 'cone', label: 'Cone', category: 'beam' }
];

const textureCache = new Map();

export function getPerformanceMode(modeId) {
    return PERFORMANCE_MODES[modeId] || PERFORMANCE_MODES.full;
}

export function trimLayerParticlesForPerformance(layer, modeId) {
    const mode = getPerformanceMode(modeId);
    if (!layer || !Array.isArray(layer._particles)) return;
    if (!Number.isFinite(mode.maxParticlesPerLayer)) return;
    if (layer._particles.length > mode.maxParticlesPerLayer) {
        layer._particles.splice(0, layer._particles.length - mode.maxParticlesPerLayer);
    }
}

export function getBlendMode(id) {
    return CANVAS_BLEND_MODES.find((mode) => mode.id === id) || CANVAS_BLEND_MODES[0];
}

export function getShapeDefinition(shapeId) {
    return BUILT_IN_SHAPES.find((shape) => shape.id === shapeId) || BUILT_IN_SHAPES[0];
}

export function applyEdgeBlur(ctx, edgeBlur = 0) {
    if (!ctx) return;
    ctx.filter = edgeBlur > 0 ? `blur(${edgeBlur}px)` : 'none';
}

export function resetCanvasFilter(ctx) {
    if (!ctx) return;
    ctx.filter = 'none';
}

export function loadTexture(src) {
    if (!src) return Promise.reject(new Error('Texture source is required.'));
    const existing = textureCache.get(src);
    if (existing) return existing.promise;

    const image = new Image();
    image.crossOrigin = 'anonymous';

    const record = { src, image, loaded: false, error: null, promise: null };
    record.promise = new Promise((resolve, reject) => {
        image.onload = () => {
            record.loaded = true;
            resolve(record);
        };
        image.onerror = () => {
            record.error = new Error(`Failed to load texture: ${src}`);
            reject(record.error);
        };
        image.src = src;
    });

    textureCache.set(src, record);
    return record.promise;
}

export function getTexture(src) {
    return textureCache.get(src) || null;
}

export function clearTextureCache() {
    textureCache.clear();
}

export class ArtifexFxRuntimeAdapter {
    constructor(canvas, options) {
        this.canvas = canvas;
        this.options = options || {};
        this.effectAsset = null;
        this.composition = null;
        this.isPlaying = false;
        this.time = 0;
    }

    loadEffectAsset(effectAsset) {
        this.effectAsset = effectAsset;
        this.composition = effectAsset && effectAsset.composition ? effectAsset.composition : effectAsset;
        this.time = 0;
        return this;
    }

    play() { this.isPlaying = true; return this; }
    pause() { this.isPlaying = false; return this; }
    stop() { this.isPlaying = false; this.time = 0; return this; }

    update(deltaSeconds) {
        if (!this.isPlaying) return;
        this.time += Number(deltaSeconds) || 0;
    }

    draw() {
        return {
            canvas: this.canvas,
            effectId: this.effectAsset && this.effectAsset.id,
            layerCount: this.composition && Array.isArray(this.composition.layers) ? this.composition.layers.length : 0,
            time: this.time
        };
    }
}
