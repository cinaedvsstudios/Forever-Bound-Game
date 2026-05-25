/*
 * Artifex Effect Editor state helpers.
 *
 * Split stage 2: pure state helpers only. This file is intentionally safe to add
 * before wiring because it does not touch the live single-file editor runtime.
 */

export const DEFAULT_EMITTER_RATIO = Object.freeze({ x: 0.5, y: 0.8 });
export const DEFAULT_VIEW_FEATURES = Object.freeze({
    'emitter-follow-mouse': false,
    'show-emitter-hud': true,
    'collision-bounce': false
});

export function generateEffectId(prefix = 'fx') {
    return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
}

export function createEmptyComposition(id = generateEffectId()) {
    return {
        id,
        name: '',
        tags: '',
        layers: []
    };
}

export function clonePlainData(value) {
    return JSON.parse(JSON.stringify(value, (key, item) => {
        if (key === '_particles') return undefined;
        return item;
    }));
}

export function prepareRuntimeComposition(composition) {
    const cloned = clonePlainData(composition || createEmptyComposition());
    if (!Array.isArray(cloned.layers)) cloned.layers = [];
    cloned.layers.forEach((layer) => {
        layer._particles = [];
        if (layer.isVisible === undefined) layer.isVisible = true;
    });
    return cloned;
}

export function getActiveLayer(composition, activeLayerIndex) {
    if (!composition || !Array.isArray(composition.layers)) return null;
    if (activeLayerIndex < 0 || activeLayerIndex >= composition.layers.length) return null;
    return composition.layers[activeLayerIndex] || null;
}

export function removeRuntimeParticles(composition) {
    if (!composition || !Array.isArray(composition.layers)) return composition;
    composition.layers.forEach((layer) => {
        layer._particles = [];
    });
    return composition;
}
