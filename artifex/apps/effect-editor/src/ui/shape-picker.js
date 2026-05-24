/* Shape picker scaffold for Artifex Effect Editor. */

import { BUILT_IN_SHAPES } from '../engine/shape-renderer.js';

export const SHAPE_MODE_BUILT_IN = 'builtInShape';
export const SHAPE_MODE_TEXTURE = 'textureSprite';

export function createDefaultVisualShape() {
    return {
        shapeMode: SHAPE_MODE_BUILT_IN,
        shape: 'circle',
        texture: null,
        useTextureAlpha: true,
        tintMode: 'additive',
        fitMode: 'contain',
        edgeBlur: 0
    };
}

export function setBuiltInShape(visual, shapeId) {
    const next = Object.assign({}, createDefaultVisualShape(), visual || {});
    next.shapeMode = SHAPE_MODE_BUILT_IN;
    next.shape = shapeId || 'circle';
    next.texture = null;
    return next;
}

export function setTextureSprite(visual, texturePath) {
    const next = Object.assign({}, createDefaultVisualShape(), visual || {});
    next.shapeMode = SHAPE_MODE_TEXTURE;
    next.shape = 'texture';
    next.texture = texturePath || null;
    next.useTextureAlpha = true;
    next.tintMode = next.tintMode || 'additive';
    next.fitMode = next.fitMode || 'contain';
    return next;
}

export function isTextureSprite(visual) {
    return Boolean(visual && visual.shapeMode === SHAPE_MODE_TEXTURE);
}

export function getShapePickerOptions() {
    return {
        modes: [
            { id: SHAPE_MODE_BUILT_IN, label: 'Built-In Shape' },
            { id: SHAPE_MODE_TEXTURE, label: 'Custom PNG Texture Sprite' }
        ],
        builtInShapes: BUILT_IN_SHAPES,
        tintModes: ['none', 'multiply', 'additive'],
        fitModes: ['contain', 'cover', 'stretch']
    };
}
