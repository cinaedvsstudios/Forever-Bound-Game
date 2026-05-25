/*
 * Artifex Effect Editor library access layer.
 *
 * Split stage 1: this module wraps the extracted preset files without changing
 * the live single-file editor yet. The next wiring pass can replace the inlined
 * registries in index.html with these helpers after the current baseline is
 * re-tested.
 */

import { BASE_EFFECT_PRESETS, getBaseEffectCategories, getBaseEffectPreset, cloneBaseEffectPreset } from './presets/base-effects.js';
import { COMPOSITE_EFFECT_PRESETS, getCompositeEffectPreset, cloneCompositeEffectPreset } from './presets/composite-effects.js';

export const PRESETS_REGISTRY = BASE_EFFECT_PRESETS;
export const COMPOSITES_REGISTRY = COMPOSITE_EFFECT_PRESETS;

export const EFFECT_CATEGORY_LABELS = {
    particles: 'Standard Particle',
    ribbon: 'Ribbon / Slash Engine',
    ring: 'Ring / Shockwave Engine',
    lightning: 'Lightning / Beam Engine',
    projectile: 'Projectile / Trail Engine',
    gas: 'Gas / Smoke / Dust Engine',
    refraction: 'Refraction / Distortion Engine',
    lensflare: 'Lens Flare / Optical Engine'
};

export function getEffectCategoryLabel(categoryKey) {
    return EFFECT_CATEGORY_LABELS[categoryKey] || `${categoryKey.charAt(0).toUpperCase()}${categoryKey.slice(1)} Engine`;
}

export function listBaseEffectMenuItems() {
    return getBaseEffectCategories().map((categoryKey) => {
        const firstPreset = BASE_EFFECT_PRESETS[categoryKey]?.[0] || null;
        return {
            categoryKey,
            label: getEffectCategoryLabel(categoryKey),
            firstPresetId: firstPreset?.id || null,
            firstPresetName: firstPreset?.name || null,
            count: BASE_EFFECT_PRESETS[categoryKey]?.length || 0
        };
    });
}

export function listCompositeEffectMenuItems() {
    return COMPOSITE_EFFECT_PRESETS.map((preset) => ({
        id: preset.id,
        name: preset.name,
        tags: preset.tags || '',
        layerCount: Array.isArray(preset.layers) ? preset.layers.length : 0
    }));
}

export {
    BASE_EFFECT_PRESETS,
    COMPOSITE_EFFECT_PRESETS,
    getBaseEffectCategories,
    getBaseEffectPreset,
    cloneBaseEffectPreset,
    getCompositeEffectPreset,
    cloneCompositeEffectPreset
};
