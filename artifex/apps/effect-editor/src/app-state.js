/*
 * Artifex Effect Editor state helpers.
 *
 * This file replaces the earlier scattered state/validation helper files.
 * Keep composition shape, layer defaults, IDs, and validation here.
 */

export function createId(prefix) {
    return String(prefix || 'id') + '_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now().toString(36);
}

export function createDefaultComposition(overrides) {
    overrides = overrides || {};
    const id = overrides.id || createId('composition');
    return {
        id,
        name: overrides.name || 'New Magical Effect',
        tags: overrides.tags || '',
        thumbnail: overrides.thumbnail || null,
        layers: Array.isArray(overrides.layers) && overrides.layers.length
            ? overrides.layers.map(normalizeLayer)
            : [createDefaultLayer({ layerName: 'Base Particles' })],
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
    return createDefaultComposition(input || {});
}

export function normalizeLayer(input) {
    return createDefaultLayer(input || {});
}

export function validateComposition(composition) {
    const issues = [];

    if (!composition || typeof composition !== 'object') {
        return [{ level: 'error', field: 'composition', message: 'Composition must be an object.' }];
    }

    if (!composition.id) issues.push({ level: 'warning', field: 'id', message: 'Composition has no ID.' });
    if (!composition.name) issues.push({ level: 'warning', field: 'name', message: 'Composition has no display name.' });

    if (!Array.isArray(composition.layers)) {
        issues.push({ level: 'error', field: 'layers', message: 'Composition layers must be an array.' });
        return issues;
    }

    if (composition.layers.length === 0) {
        issues.push({ level: 'warning', field: 'layers', message: 'Composition has no layers.' });
    }

    composition.layers.forEach((layer, index) => {
        issues.push(...validateLayer(layer, index));
    });

    return issues;
}

export function validateLayer(layer, index) {
    const prefix = 'layers[' + index + ']';
    const issues = [];

    if (!layer || typeof layer !== 'object') {
        return [{ level: 'error', field: prefix, message: 'Layer must be an object.' }];
    }

    if (!layer.layerName) issues.push({ level: 'warning', field: prefix + '.layerName', message: 'Layer has no readable name.' });
    if (!layer.effectType) issues.push({ level: 'error', field: prefix + '.effectType', message: 'Layer needs an effectType.' });
    if (!layer.emitter) issues.push({ level: 'error', field: prefix + '.emitter', message: 'Layer is missing emitter settings.' });
    if (!layer.physics) issues.push({ level: 'warning', field: prefix + '.physics', message: 'Layer is missing physics settings.' });
    if (!layer.life) issues.push({ level: 'warning', field: prefix + '.life', message: 'Layer is missing lifespan settings.' });

    if (!layer.visual) {
        issues.push({ level: 'error', field: prefix + '.visual', message: 'Layer is missing visual settings.' });
    } else {
        issues.push(...validateVisual(layer.visual, prefix + '.visual'));
    }

    return issues;
}

export function validateVisual(visual, fieldPrefix) {
    const issues = [];
    const shapeMode = visual.shapeMode || 'builtInShape';

    if (shapeMode === 'textureSprite' && !visual.texture) {
        issues.push({ level: 'warning', field: fieldPrefix + '.texture', message: 'Texture sprite mode needs a texture file path.' });
    }

    if (shapeMode === 'builtInShape' && !visual.shape) {
        issues.push({ level: 'warning', field: fieldPrefix + '.shape', message: 'Built-in shape mode needs a shape ID.' });
    }

    if (!Array.isArray(visual.colors) || visual.colors.length === 0) {
        issues.push({ level: 'warning', field: fieldPrefix + '.colors', message: 'Visual settings should include at least one colour.' });
    }

    if (!Array.isArray(visual.alphas) || visual.alphas.length === 0) {
        issues.push({ level: 'warning', field: fieldPrefix + '.alphas', message: 'Visual settings should include at least one alpha value.' });
    }

    return issues;
}

export function hasBlockingErrors(issues) {
    return Array.isArray(issues) && issues.some((issue) => issue.level === 'error');
}
