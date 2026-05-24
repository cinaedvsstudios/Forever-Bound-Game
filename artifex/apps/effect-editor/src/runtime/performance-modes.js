/*
 * Performance mode settings for Artifex Effect Editor.
 *
 * Intended UI location:
 * View > Performance Mode
 * - Full Quality
 * - Low Performance Mode
 *
 * Low Performance Mode should keep the editor usable on weaker laptops, mobile webviews,
 * and Android WebShell builds by reducing expensive visual/rendering work without changing
 * the saved effect JSON itself.
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

export function getPerformanceMode(modeId) {
    return PERFORMANCE_MODES[modeId] || PERFORMANCE_MODES.full;
}

export function applyPerformanceModeToLayer(layer, mode) {
    const settings = getPerformanceMode(mode);
    if (!layer || !layer.visual || !layer.emitter) return layer;

    const previewLayer = JSON.parse(JSON.stringify(layer, function(key, value) {
        if (key === '_particles') return undefined;
        return value;
    }));

    previewLayer.emitter.rate = Math.max(0, Math.round((previewLayer.emitter.rate || 0) * settings.particleRateMultiplier));
    previewLayer.visual.glow = Math.max(0, (previewLayer.visual.glow || 0) * settings.glowMultiplier);
    previewLayer.visual.blur = Math.max(0, (previewLayer.visual.blur || 0) * settings.blurMultiplier);

    return previewLayer;
}

export function trimLayerParticlesForPerformance(layer, mode) {
    const settings = getPerformanceMode(mode);
    if (!layer || !Array.isArray(layer._particles)) return;
    if (!Number.isFinite(settings.maxParticlesPerLayer)) return;

    if (layer._particles.length > settings.maxParticlesPerLayer) {
        layer._particles.splice(0, layer._particles.length - settings.maxParticlesPerLayer);
    }
}
