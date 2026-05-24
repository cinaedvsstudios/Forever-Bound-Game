/* Canvas blend mode definitions for Artifex Effect Editor. */

export const CANVAS_BLEND_MODES = [
    {
        id: 'source-over',
        label: 'Source Over',
        description: 'Standard normal drawing. Best for opaque or subtle particles.'
    },
    {
        id: 'lighter',
        label: 'Lighter / Additive Glow',
        description: 'Bright additive stacking. Best for magic, fire, sparks, photons, and energy.'
    },
    {
        id: 'screen',
        label: 'Screen',
        description: 'Soft light blending. Best for smoke, aura, glow, and overlays.'
    },
    {
        id: 'multiply',
        label: 'Multiply',
        description: 'Darkening blend. Best for shadows, grime, corruption, and vignettes.'
    },
    {
        id: 'overlay',
        label: 'Overlay',
        description: 'Contrast blend for stylised colour and light effects.'
    },
    {
        id: 'soft-light',
        label: 'Soft Light',
        description: 'Gentler overlay-style blend for atmospheric effects.'
    }
];

export function getBlendMode(id) {
    return CANVAS_BLEND_MODES.find(function(mode) { return mode.id === id; }) || CANVAS_BLEND_MODES[0];
}

export function normalizeBlendMode(id) {
    return getBlendMode(id).id;
}
