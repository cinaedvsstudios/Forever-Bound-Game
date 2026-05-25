/*
 * Artifex Effect Editor import/export helper extraction target.
 *
 * Split stage 3: pure data helpers only. The live editor still uses the proven
 * inlined import/export code in index.html until the wiring pass is tested.
 */

export function stripRuntimeParticles(value) {
    return JSON.parse(JSON.stringify(value, (key, item) => {
        if (key === '_particles') return undefined;
        return item;
    }));
}

export function serializeComposition(composition) {
    return JSON.stringify(stripRuntimeParticles(composition), null, 2);
}

export function parseCompositionJson(jsonText) {
    const parsed = JSON.parse(jsonText);
    if (parsed && parsed.emitter && parsed.physics && !parsed.layers) {
        return {
            id: parsed.id || `fx-${Math.random().toString(36).substring(2, 10)}`,
            name: parsed.name || 'Legacy Imported Preset',
            tags: parsed.tags || 'legacy',
            layers: [{ ...parsed, layerName: parsed.layerName || 'Imported Layer' }]
        };
    }
    return parsed;
}

export function isValidCompositionShape(value) {
    return !!(value && Array.isArray(value.layers));
}

export function buildDownloadFilename(composition, suffix = 'config') {
    const rawName = composition?.name || 'custom-fx';
    const safeName = String(rawName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'custom-fx';
    return `${safeName}-${suffix}.json`;
}

export function createJsonDataUrl(data) {
    return `data:text/json;charset=utf-8,${encodeURIComponent(typeof data === 'string' ? data : JSON.stringify(data, null, 2))}`;
}
