/*
 * Effekseer to Artifex converter scaffold.
 *
 * First target: visual approximation conversion.
 * The converter should parse readable .efkproj data where possible and produce an
 * editable Artifex FX composition using built-in shapes or textureSprite PNGs.
 */

export function createEmptyEffekseerConversionResult(sourceName) {
    return {
        source: {
            name: sourceName || 'unknown-effekseer-source',
            format: 'effekseer'
        },
        output: null,
        referencedTextures: [],
        unsupportedFeatures: [],
        conversionNotes: []
    };
}

export function parseEffekseerXmlText(xmlText, options) {
    options = options || {};
    const result = createEmptyEffekseerConversionResult(options.sourceName || 'effect.efkproj');

    if (!xmlText || typeof xmlText !== 'string') {
        result.unsupportedFeatures.push('No Effekseer XML text was provided.');
        return result;
    }

    const textureMatches = Array.from(xmlText.matchAll(/Texture\/[^<>'"\s]+\.png/gi)).map(function(match) {
        return match[0];
    });

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

    if (result.referencedTextures.length) {
        result.conversionNotes.push('Referenced PNG textures were detected and assigned as textureSprite particles.');
    } else {
        result.conversionNotes.push('No PNG texture references found; built-in shape fallback was used.');
    }

    result.conversionNotes.push('This is an approximation draft. Effekseer node hierarchy, curves, materials, and 3D behaviours still need deeper mapping.');

    return result;
}
