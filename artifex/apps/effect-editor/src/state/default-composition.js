/* Default composition and layer factories for Artifex Effect Editor. */

export function createDefaultComposition(overrides) {
    overrides = overrides || {};
    const id = overrides.id || createId('composition');
    return {
        id: id,
        name: overrides.name || 'New Magical Effect',
        tags: overrides.tags || '',
        thumbnail: overrides.thumbnail || null,
        layers: overrides.layers || [createDefaultLayer({ layerName: 'Base Particles' })],
        createdAt: overrides.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

export function createDefaultLayer(overrides) {
    overrides = overrides || {};
    return {
        id: overrides.id || createId('layer'),
        layerName: overrides.layerName || 'New Layer',
        isVisible: overrides.isVisible !== false,
        effectType: overrides.effectType || 'particles',
        emitter: Object.assign({
            rate: 5,
            width: 100,
            widthUnit: 'PX',
            x: null,
            y: null
        }, overrides.emitter || {}),
        physics: Object.assign({
            speedMin: 2,
            speedMax: 6,
            angle: 270,
            spread: 45,
            gravityY: 0.15,
            friction: 0.99,
            orbitalForce: 0
        }, overrides.physics || {}),
        visual: Object.assign({
            shapeMode: 'builtInShape',
            shape: 'circle',
            texture: null,
            useTextureAlpha: true,
            tintMode: 'additive',
            fitMode: 'contain',
            sizeStart: 5,
            sizeEnd: 1,
            colors: ['#ffffff', '#00a1d7'],
            alphas: [1, 0],
            edgeBlur: 0,
            blur: 0,
            glow: 15,
            composite: 'lighter'
        }, overrides.visual || {}),
        life: Object.assign({
            durationMin: 30,
            durationMax: 60
        }, overrides.life || {})
    };
}

export function normalizeComposition(input) {
    const composition = createDefaultComposition(input || {});
    composition.layers = Array.isArray(input && input.layers)
        ? input.layers.map(function(layer) { return normalizeLayer(layer); })
        : composition.layers;
    composition.updatedAt = new Date().toISOString();
    return composition;
}

export function normalizeLayer(input) {
    return createDefaultLayer(input || {});
}

export function createId(prefix) {
    return prefix + '_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now().toString(36);
}
