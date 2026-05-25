/* Artifex FX schema helpers. */

export const ARTIFEX_FX_SCHEMA_VERSION = 'artifex.fxArchetype.v1';
export const ARTIFEX_EDITOR_PROJECT_SCHEMA_VERSION = 'artifex.fxEditorProject.v1';

export function stripRuntimeParticles(value) {
    return JSON.parse(JSON.stringify(value, function(key, nestedValue) {
        if (key === '_particles') return undefined;
        return nestedValue;
    }));
}

export function normalizeTags(tags) {
    if (Array.isArray(tags)) return tags.map(String).map(function(tag) { return tag.trim(); }).filter(Boolean);
    if (typeof tags === 'string') return tags.split(',').map(function(tag) { return tag.trim(); }).filter(Boolean);
    return [];
}

export function createFxId(label) {
    var raw = String(label || 'effect').toLowerCase();
    var output = '';
    var previousUnderscore = false;
    for (var i = 0; i < raw.length; i++) {
        var ch = raw[i];
        var isAlphaNum = (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9');
        if (isAlphaNum) {
            output += ch;
            previousUnderscore = false;
        } else if (!previousUnderscore && output.length > 0) {
            output += '_';
            previousUnderscore = true;
        }
    }
    while (output.endsWith('_')) output = output.slice(0, -1);
    return 'fx_' + (output || 'effect');
}

export function toEditorProject(composition) {
    return stripRuntimeParticles({
        schema: ARTIFEX_EDITOR_PROJECT_SCHEMA_VERSION,
        engine: 'artifex-particle-studio',
        engineVersion: '2.3.0-alpha',
        savedAt: new Date().toISOString(),
        composition: composition
    });
}

export function toArtifexFxAsset(composition, options) {
    options = options || {};
    var id = options.id || (composition && composition.id) || createFxId(options.label || (composition && composition.name) || 'effect');
    var label = options.label || (composition && composition.name) || 'Untitled Artifex FX';
    return stripRuntimeParticles({
        schema: ARTIFEX_FX_SCHEMA_VERSION,
        id: id,
        label: label,
        type: 'compositeParticleEffect',
        scope: options.scope || 'project',
        projectId: options.projectId || 'forever-bound',
        engine: 'artifex-particle-studio',
        engineVersion: '2.3.0-alpha',
        tags: normalizeTags(options.tags || (composition && composition.tags)),
        assets: options.assets || {},
        composition: {
            id: (composition && composition.id) || id,
            name: (composition && composition.name) || label,
            layers: Array.isArray(composition && composition.layers) ? composition.layers : []
        },
        conversionNotes: options.conversionNotes || []
    });
}

export function createSceneFxInstance(fxAsset, overrides) {
    overrides = overrides || {};
    return {
        id: overrides.id || fxAsset.id + '_instance_01',
        archetypeId: fxAsset.id,
        asset: overrides.asset || 'data/fx/archetypes/' + fxAsset.id + '.json',
        enabled: overrides.enabled !== false,
        layer: overrides.layer || 'frontOfCharacters',
        x: overrides.x || 0,
        y: overrides.y || 0,
        scale: overrides.scale || 1,
        rotation: overrides.rotation || 0,
        opacity: overrides.opacity === undefined ? 1 : overrides.opacity,
        trigger: overrides.trigger || null,
        overrides: overrides.overrides || {}
    };
}
