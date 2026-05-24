/*
 * Composite effect presets for Artifex Effect Editor.
 *
 * This is a staged extraction target. The live app still owns its inlined registry
 * until the full module pass is completed.
 */

export const COMPOSITE_EFFECT_PRESETS = [
    {
        id: 'magic-cold',
        name: 'Magic Cold Crystals',
        tags: 'ice, cold, magic, snow',
        layers: [
            {
                layerName: 'Icy Mist Base',
                isVisible: true,
                effectType: 'gas',
                emitter: { rate: 8, width: 40, widthUnit: '%' },
                physics: { speedMin: 0.5, speedMax: 1.5, angle: 270, spread: 30, gravityY: -0.02, friction: 0.99, orbitalForce: 0.05 },
                visual: { shapeMode: 'builtInShape', shape: 'circle', sizeStart: 10, sizeEnd: 30, colors: ['#00a1d7', '#ffffff', '#0f0d0e'], alphas: [0.0, 0.7, 0.0], edgeBlur: 8, blur: 8, glow: 15, composite: 'screen' },
                life: { durationMin: 50, durationMax: 90 }
            },
            {
                layerName: 'Rising Snowflakes',
                isVisible: true,
                effectType: 'particles',
                emitter: { rate: 5, width: 30, widthUnit: '%' },
                physics: { speedMin: 3, speedMax: 7, angle: 270, spread: 45, gravityY: 0.05, friction: 0.98, orbitalForce: 0 },
                visual: { shapeMode: 'builtInShape', shape: 'star', sizeStart: 6, sizeEnd: 2, colors: ['#ffffff', '#00a1d7'], alphas: [0.0, 1.0, 0.0], edgeBlur: 0, blur: 0, glow: 20, composite: 'lighter' },
                life: { durationMin: 30, durationMax: 60 }
            }
        ]
    },
    {
        id: 'magic-tornade-ribbon',
        name: 'Cyclone Wind Ribbons',
        tags: 'wind, tornado, cyclone, green, effekseer-conversion-candidate',
        layers: [
            {
                layerName: 'Swirling Winds',
                isVisible: true,
                effectType: 'ribbon',
                emitter: { rate: 15, width: 45, widthUnit: 'PX' },
                physics: { speedMin: 3, speedMax: 7, angle: 270, spread: 30, gravityY: -0.15, friction: 0.98, orbitalForce: 3.0 },
                visual: { shapeMode: 'builtInShape', shape: 'spark', sizeStart: 10, sizeEnd: 1, colors: ['#ccfbf1', '#22c55e', '#14532d'], alphas: [0.0, 1.0, 0.0], edgeBlur: 0, blur: 0, glow: 20, composite: 'lighter' },
                life: { durationMin: 30, durationMax: 60 }
            },
            {
                layerName: 'Debris',
                isVisible: true,
                effectType: 'particles',
                emitter: { rate: 5, width: 35, widthUnit: 'PX' },
                physics: { speedMin: 1, speedMax: 3, angle: 270, spread: 45, gravityY: 0.05, friction: 0.98, orbitalForce: 1.5 },
                visual: { shapeMode: 'builtInShape', shape: 'square', sizeStart: 3, sizeEnd: 0, colors: ['#d1d5db', '#78716c'], alphas: [0.0, 1.0, 0.0], edgeBlur: 0, blur: 0, glow: 0, composite: 'source-over' },
                life: { durationMin: 20, durationMax: 50 }
            }
        ]
    },
    {
        id: 'magic-fire-1',
        name: "Cursed Pharaoh's Fog",
        tags: 'egyptian, dark, smoke, cursed, forever-bound',
        layers: [
            {
                layerName: 'Ominous Smoke',
                isVisible: true,
                effectType: 'gas',
                emitter: { rate: 8, width: 35, widthUnit: 'PX' },
                physics: { speedMin: 1, speedMax: 3.5, angle: 270, spread: 30, gravityY: -0.08, friction: 0.97, orbitalForce: 0.1 },
                visual: { shapeMode: 'builtInShape', shape: 'circle', sizeStart: 10, sizeEnd: 30, colors: ['#16a34a', '#dc2626', '#0f0d0e'], alphas: [0.0, 0.6, 0.0], edgeBlur: 8, blur: 8, glow: 10, composite: 'lighter' },
                life: { durationMin: 30, durationMax: 70 }
            },
            {
                layerName: 'Corrupted Runes',
                isVisible: true,
                effectType: 'particles',
                emitter: { rate: 3, width: 30, widthUnit: 'PX' },
                physics: { speedMin: 0.5, speedMax: 2, angle: 270, spread: 10, gravityY: -0.05, friction: 0.99, orbitalForce: 0 },
                visual: { shapeMode: 'builtInShape', shape: 'diamond', sizeStart: 12, sizeEnd: 4, colors: ['#22c55e', '#ef4444'], alphas: [0.0, 1.0, 0.0], edgeBlur: 0, blur: 0, glow: 20, composite: 'lighter' },
                life: { durationMin: 40, durationMax: 80 }
            }
        ]
    }
];

export function getCompositeEffectPreset(presetId) {
    return COMPOSITE_EFFECT_PRESETS.find((preset) => preset.id === presetId) || null;
}

export function cloneCompositeEffectPreset(presetId) {
    const preset = getCompositeEffectPreset(presetId);
    return preset ? JSON.parse(JSON.stringify(preset)) : null;
}
