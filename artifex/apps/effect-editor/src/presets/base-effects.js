/*
 * Base effect presets for Artifex Effect Editor.
 *
 * These are extracted from the original single-file prototype so they can become
 * one-file-per-effect later without changing the live app yet.
 */

export const BASE_EFFECT_PRESETS = {
    particles: [
        {
            id: 'electric-sparks',
            effectType: 'particles',
            subType: 'electric-sparks',
            name: 'Basic Sparks',
            description: 'Fast-projecting, bouncing electric sparks',
            tags: 'base, sparks',
            emitter: { rate: 6, width: 2, widthUnit: 'PX' },
            physics: { speedMin: 4, speedMax: 10, angle: 270, spread: 55, gravityY: 0.28, friction: 0.98, orbitalForce: 0 },
            visual: { shapeMode: 'builtInShape', shape: 'spark', sizeStart: 6, sizeEnd: 1, colors: ['#ffd23f', '#ee4266'], alphas: [1.0, 1.0], edgeBlur: 0, blur: 0, glow: 20, composite: 'lighter' },
            life: { durationMin: 25, durationMax: 50 }
        }
    ],
    ribbon: [
        {
            id: 'sword-slash',
            effectType: 'ribbon',
            subType: 'sword-slash',
            name: 'Basic Ribbon',
            description: 'Vibrant glowing ribbon trail',
            tags: 'base, ribbon',
            emitter: { rate: 12, width: 1, widthUnit: 'PX' },
            physics: { speedMin: 0.1, speedMax: 0.5, angle: 0, spread: 0, gravityY: 0, friction: 1.0, orbitalForce: 0 },
            visual: { shapeMode: 'builtInShape', shape: 'spark', sizeStart: 12, sizeEnd: 0.1, colors: ['#00a1d7', '#ffffff'], alphas: [1.0, 1.0], edgeBlur: 0, blur: 0, glow: 25, composite: 'lighter' },
            life: { durationMin: 15, durationMax: 20 }
        }
    ],
    ring: [
        {
            id: 'shockwave',
            effectType: 'ring',
            subType: 'shockwave',
            name: 'Basic Ring',
            description: 'Rapidly expanding circular ring',
            tags: 'base, ring',
            emitter: { rate: 0, width: 1, widthUnit: 'PX' },
            physics: { speedMin: 5, speedMax: 8, angle: 0, spread: 360, gravityY: 0, friction: 0.95, orbitalForce: 0 },
            visual: { shapeMode: 'builtInShape', shape: 'circle', sizeStart: 2, sizeEnd: 25, colors: ['#ffffff', '#00a1d7'], alphas: [1.0, 1.0], edgeBlur: 0, blur: 0, glow: 20, composite: 'lighter' },
            life: { durationMin: 30, durationMax: 50 }
        }
    ],
    lightning: [
        {
            id: 'tesla-bolt',
            effectType: 'lightning',
            subType: 'tesla-bolt',
            name: 'Basic Lightning',
            description: 'Crackling electrical discharge',
            tags: 'base, lightning',
            emitter: { rate: 5, width: 2, widthUnit: 'PX' },
            physics: { speedMin: 6, speedMax: 12, angle: 90, spread: 360, gravityY: 0, friction: 0.9, orbitalForce: 0 },
            visual: { shapeMode: 'builtInShape', shape: 'spark', sizeStart: 4, sizeEnd: 1, colors: ['#00a1d7', '#ffffff'], alphas: [1.0, 1.0], edgeBlur: 0, blur: 0, glow: 35, composite: 'lighter' },
            life: { durationMin: 10, durationMax: 20 }
        }
    ],
    projectile: [
        {
            id: 'fireball',
            effectType: 'projectile',
            subType: 'fireball',
            name: 'Basic Projectile',
            description: 'Flying core trailing sparks',
            tags: 'base, projectile',
            emitter: { rate: 8, width: 1, widthUnit: 'PX' },
            physics: { speedMin: 4, speedMax: 6, angle: 180, spread: 5, gravityY: -0.05, friction: 0.99, orbitalForce: 0 },
            visual: { shapeMode: 'builtInShape', shape: 'circle', sizeStart: 12, sizeEnd: 2, colors: ['#ef4444', '#ffd23f'], alphas: [1.0, 1.0], edgeBlur: 0, blur: 0, glow: 30, composite: 'lighter' },
            life: { durationMin: 20, durationMax: 40 }
        }
    ],
    gas: [
        {
            id: 'generic-fog',
            effectType: 'gas',
            subType: 'generic-fog',
            name: 'Misty Clouds',
            description: 'Generic, dense rolling white/grey fog',
            tags: 'base, fog, mist, clouds, weather',
            emitter: { rate: 3, width: 100, widthUnit: '%' },
            physics: { speedMin: 0.1, speedMax: 0.5, angle: 0, spread: 360, gravityY: -0.01, friction: 0.98, orbitalForce: 0 },
            visual: { shapeMode: 'builtInShape', shape: 'circle', sizeStart: 40, sizeEnd: 90, colors: ['#f8fafc', '#94a3b8', '#334155'], alphas: [0.0, 0.6, 0.0], edgeBlur: 15, blur: 15, glow: 30, composite: 'screen' },
            life: { durationMin: 100, durationMax: 180 }
        },
        {
            id: 'toxic-bubble-fog',
            effectType: 'gas',
            subType: 'toxic-bubble-fog',
            name: 'Basic Gas Cloud',
            description: 'Expanding, low-friction gaseous bubbles',
            tags: 'base, gas',
            emitter: { rate: 3, width: 10, widthUnit: '%' },
            physics: { speedMin: 0.5, speedMax: 1.8, angle: 270, spread: 20, gravityY: -0.06, friction: 0.99, orbitalForce: 0.05 },
            visual: { shapeMode: 'builtInShape', shape: 'circle', sizeStart: 8, sizeEnd: 24, colors: ['#22c55e', '#0f0d0e'], alphas: [1.0, 1.0], edgeBlur: 0, blur: 0, glow: 15, composite: 'screen' },
            life: { durationMin: 50, durationMax: 110 }
        }
    ],
    refraction: [
        {
            id: 'heat-shimmer',
            effectType: 'refraction',
            subType: 'heat-shimmer',
            name: 'Basic Refraction',
            description: 'Refractive hot air wave rising',
            tags: 'base, refraction',
            emitter: { rate: 3, width: 15, widthUnit: '%' },
            physics: { speedMin: 0.8, speedMax: 2.2, angle: 270, spread: 15, gravityY: -0.04, friction: 0.99, orbitalForce: 0 },
            visual: { shapeMode: 'builtInShape', shape: 'circle', sizeStart: 12, sizeEnd: 32, colors: ['#00a1d7', '#ffffff'], alphas: [0.0, 0.8, 0.0], edgeBlur: 0, blur: 0, glow: 8, composite: 'screen' },
            life: { durationMin: 40, durationMax: 85 }
        }
    ],
    lensflare: [
        {
            id: 'anamorphic-streak',
            effectType: 'lensflare',
            subType: 'anamorphic-streak',
            name: 'Basic Lensflare',
            description: 'Horizontal flare glare beams',
            tags: 'base, lensflare',
            emitter: { rate: 2, width: 1, widthUnit: 'PX' },
            physics: { speedMin: 0.1, speedMax: 0.5, angle: 0, spread: 360, gravityY: 0, friction: 0.95, orbitalForce: 0 },
            visual: { shapeMode: 'builtInShape', shape: 'star', sizeStart: 1, sizeEnd: 30, colors: ['#00a1d7', '#ffffff'], alphas: [1.0, 1.0], edgeBlur: 0, blur: 0, glow: 40, composite: 'lighter' },
            life: { durationMin: 20, durationMax: 45 }
        }
    ]
};

export function getBaseEffectCategories() {
    return Object.keys(BASE_EFFECT_PRESETS);
}

export function getBaseEffectPreset(effectType, presetId) {
    const list = BASE_EFFECT_PRESETS[effectType] || [];
    return list.find((preset) => preset.id === presetId) || null;
}

export function cloneBaseEffectPreset(effectType, presetId) {
    const preset = getBaseEffectPreset(effectType, presetId);
    return preset ? JSON.parse(JSON.stringify(preset)) : null;
}
