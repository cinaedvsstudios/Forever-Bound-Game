/*
 * Artifex Effect Editor import/export helpers.
 *
 * This file replaces the earlier scattered io helper files. Keep schema export,
 * scene instance helpers, thumbnail capture, and Effekseer draft conversion here.
 */

export const ARTIFEX_FX_SCHEMA_VERSION = 'artifex.fxArchetype.v1';
export const ARTIFEX_EDITOR_PROJECT_SCHEMA_VERSION = 'artifex.fxEditorProject.v1';

export const DEFAULT_THUMBNAIL_OPTIONS = {
    size: 512,
    format: 'image/jpeg',
    quality: 0.86,
    background: '#0f0c0b',
    fit: 'contain',
    padding: 32
};

export const EXPORT_MODES = [
    { id: 'rawComposition', label: 'Export Raw Composition', description: 'Current legacy editor JSON format.' },
    { id: 'editorProject', label: 'Export Editor Project', description: 'Editable FX Editor project wrapper.' },
    { id: 'artifexFxAsset', label: 'Export Artifex FX Asset', description: 'Runtime-facing FX asset for Scene Editor placement.' }
];

export function stripRuntimeParticles(value) {
    return JSON.parse(JSON.stringify(value, (key, nestedValue) => key === '_particles' ? undefined : nestedValue));
}

export function normalizeTags(tags) {
    if (Array.isArray(tags)) return tags.map(String).map((tag) => tag.trim()).filter(Boolean);
    if (typeof tags === 'string') return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    return [];
}

export function createFxId(label) {
    const safe = String(label || 'effect')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'effect';
    return 'fx_' + safe;
}

export function toEditorProject(composition) {
    return stripRuntimeParticles({
        schema: ARTIFEX_EDITOR_PROJECT_SCHEMA_VERSION,
        engine: 'artifex-particle-studio',
        engineVersion: '2.3.0-alpha',
        savedAt: new Date().toISOString(),
        composition
    });
}

export function toArtifexFxAsset(composition, options = {}) {
    const id = options.id || composition?.id || createFxId(options.label || composition?.name || 'effect');
    const label = options.label || composition?.name || 'Untitled Artifex FX';
    return stripRuntimeParticles({
        schema: ARTIFEX_FX_SCHEMA_VERSION,
        id,
        label,
        type: 'compositeParticleEffect',
        scope: options.scope || 'project',
        projectId: options.projectId || 'forever-bound',
        engine: 'artifex-particle-studio',
        engineVersion: '2.3.0-alpha',
        tags: normalizeTags(options.tags || composition?.tags),
        thumbnail: options.thumbnail || composition?.thumbnail || null,
        assets: options.assets || {},
        composition: {
            id: composition?.id || id,
            name: composition?.name || label,
            layers: Array.isArray(composition?.layers) ? composition.layers : []
        },
        conversionNotes: options.conversionNotes || []
    });
}

export function buildExportPayload(composition, exportMode, options = {}) {
    if (exportMode === 'editorProject') return toEditorProject(composition);
    if (exportMode === 'artifexFxAsset') return toArtifexFxAsset(composition, options);
    return stripRuntimeParticles(composition);
}

export function createExportFileName(composition, exportMode) {
    const rawName = composition?.name || composition?.id || 'custom-fx';
    const safeName = String(rawName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'custom-fx';
    if (exportMode === 'editorProject') return safeName + '.fxproject.json';
    if (exportMode === 'artifexFxAsset') return safeName + '.fx.json';
    return safeName + '-config.json';
}

export function downloadJson(payload, fileName) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', fileName);
    anchor.click();
}

export function createSceneFxInstanceFromAsset(fxAsset, placement = {}) {
    if (!fxAsset || !fxAsset.id) throw new Error('A valid FX asset with an id is required.');
    return {
        id: placement.id || fxAsset.id + '_instance_' + Date.now().toString(36),
        type: 'fxInstance',
        archetypeId: fxAsset.id,
        asset: placement.asset || 'data/fx/archetypes/' + fxAsset.id + '.json',
        enabled: placement.enabled !== false,
        x: Number(placement.x) || 0,
        y: Number(placement.y) || 0,
        scale: placement.scale === undefined ? 1 : Number(placement.scale),
        rotation: Number(placement.rotation) || 0,
        opacity: placement.opacity === undefined ? 1 : Number(placement.opacity),
        layer: placement.layer || fxAsset.defaultLayer || 'frontOfCharacters',
        attachTo: placement.attachTo || null,
        trigger: placement.trigger || null,
        overrides: placement.overrides || {}
    };
}

export function appendFxInstanceToScene(sceneJson, fxInstance) {
    const scene = Object.assign({}, sceneJson || {});
    const effects = Array.isArray(scene.effects) ? scene.effects.slice() : [];
    effects.push(fxInstance);
    scene.effects = effects;
    return scene;
}

export function captureSquareThumbnail(sourceCanvas, options = {}) {
    if (!sourceCanvas || typeof sourceCanvas.width !== 'number' || typeof sourceCanvas.height !== 'number') {
        throw new Error('A valid source canvas is required for thumbnail capture.');
    }

    const settings = Object.assign({}, DEFAULT_THUMBNAIL_OPTIONS, options);
    const size = Math.max(64, Number(settings.size) || DEFAULT_THUMBNAIL_OPTIONS.size);
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = size;
    outputCanvas.height = size;

    const ctx = outputCanvas.getContext('2d');
    ctx.save();
    ctx.fillStyle = settings.background || DEFAULT_THUMBNAIL_OPTIONS.background;
    ctx.fillRect(0, 0, size, size);

    const drawBox = calculateDrawBox(sourceCanvas.width, sourceCanvas.height, size, settings.fit, settings.padding);
    ctx.drawImage(sourceCanvas, drawBox.x, drawBox.y, drawBox.width, drawBox.height);
    ctx.restore();

    return {
        canvas: outputCanvas,
        dataUrl: outputCanvas.toDataURL(settings.format, settings.quality),
        width: size,
        height: size,
        format: settings.format,
        quality: settings.quality,
        background: settings.background
    };
}

export function calculateDrawBox(sourceWidth, sourceHeight, targetSize, fit, padding) {
    const safePadding = Math.max(0, Math.min(Number(padding) || 0, targetSize / 3));
    const available = targetSize - safePadding * 2;
    const sourceRatio = sourceWidth / sourceHeight;
    let width;
    let height;

    if (fit === 'cover') {
        if (sourceRatio > 1) {
            height = targetSize;
            width = targetSize * sourceRatio;
        } else {
            width = targetSize;
            height = targetSize / sourceRatio;
        }
    } else if (sourceRatio > 1) {
        width = available;
        height = available / sourceRatio;
    } else {
        height = available;
        width = available * sourceRatio;
    }

    return { x: (targetSize - width) / 2, y: (targetSize - height) / 2, width, height };
}

export function parseEffekseerXmlText(xmlText, options = {}) {
    const result = {
        source: { name: options.sourceName || 'effect.efkproj', format: 'effekseer' },
        output: null,
        referencedTextures: [],
        unsupportedFeatures: [],
        conversionNotes: []
    };

    if (!xmlText || typeof xmlText !== 'string') {
        result.unsupportedFeatures.push('No Effekseer XML text was provided.');
        return result;
    }

    const textureMatches = Array.from(xmlText.matchAll(/Texture\/[^<>'"\s]+\.png/gi)).map((match) => match[0]);
    result.referencedTextures = Array.from(new Set(textureMatches));

    result.output = {
        id: options.id || 'fx_effekseer_import_draft',
        name: options.name || 'Effekseer Import Draft',
        tags: options.tags || 'effekseer, imported, draft',
        layers: [
            {
                layerName: 'Imported Effekseer Approximation',
                isVisible: true,
                effectType: 'particles',
                emitter: { rate: 6, width: 35, widthUnit: 'PX' },
                physics: { speedMin: 1, speedMax: 4, angle: 270, spread: 45, gravityY: -0.05, friction: 0.98, orbitalForce: 0.4 },
                visual: {
                    shapeMode: result.referencedTextures.length ? 'textureSprite' : 'builtInShape',
                    shape: result.referencedTextures.length ? 'texture' : 'circle',
                    texture: result.referencedTextures[0] || null,
                    useTextureAlpha: true,
                    tintMode: 'additive',
                    fitMode: 'contain',
                    sizeStart: 20,
                    sizeEnd: 60,
                    colors: ['#ffffff', '#22c55e', '#14532d'],
                    alphas: [0.0, 0.8, 0.0],
                    edgeBlur: 0,
                    blur: 0,
                    glow: 20,
                    composite: 'lighter'
                },
                life: { durationMin: 30, durationMax: 80 }
            }
        ]
    };

    result.conversionNotes.push(result.referencedTextures.length
        ? 'Referenced PNG textures were detected and assigned as textureSprite particles.'
        : 'No PNG texture references found; built-in shape fallback was used.');
    result.conversionNotes.push('This is an approximation draft. Effekseer node hierarchy, curves, materials, and 3D behaviours still need deeper mapping.');

    return result;
}
