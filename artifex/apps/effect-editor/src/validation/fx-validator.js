/* Validation helpers for Artifex Effect Editor compositions and FX assets. */

export function validateComposition(composition) {
    const issues = [];

    if (!composition || typeof composition !== 'object') {
        return [{ level: 'error', field: 'composition', message: 'Composition must be an object.' }];
    }

    if (!composition.id) {
        issues.push({ level: 'warning', field: 'id', message: 'Composition has no ID.' });
    }

    if (!composition.name) {
        issues.push({ level: 'warning', field: 'name', message: 'Composition has no display name.' });
    }

    if (!Array.isArray(composition.layers)) {
        issues.push({ level: 'error', field: 'layers', message: 'Composition layers must be an array.' });
        return issues;
    }

    if (composition.layers.length === 0) {
        issues.push({ level: 'warning', field: 'layers', message: 'Composition has no layers.' });
    }

    composition.layers.forEach(function(layer, index) {
        issues.push.apply(issues, validateLayer(layer, index));
    });

    return issues;
}

export function validateLayer(layer, index) {
    const prefix = 'layers[' + index + ']';
    const issues = [];

    if (!layer || typeof layer !== 'object') {
        return [{ level: 'error', field: prefix, message: 'Layer must be an object.' }];
    }

    if (!layer.layerName) {
        issues.push({ level: 'warning', field: prefix + '.layerName', message: 'Layer has no readable name.' });
    }

    if (!layer.effectType) {
        issues.push({ level: 'error', field: prefix + '.effectType', message: 'Layer needs an effectType.' });
    }

    if (!layer.emitter) {
        issues.push({ level: 'error', field: prefix + '.emitter', message: 'Layer is missing emitter settings.' });
    }

    if (!layer.physics) {
        issues.push({ level: 'warning', field: prefix + '.physics', message: 'Layer is missing physics settings.' });
    }

    if (!layer.visual) {
        issues.push({ level: 'error', field: prefix + '.visual', message: 'Layer is missing visual settings.' });
    } else {
        issues.push.apply(issues, validateVisual(layer.visual, prefix + '.visual'));
    }

    if (!layer.life) {
        issues.push({ level: 'warning', field: prefix + '.life', message: 'Layer is missing lifespan settings.' });
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
    return Array.isArray(issues) && issues.some(function(issue) { return issue.level === 'error'; });
}
