/*
 * Artifex Effect Editor texture cache.
 *
 * This is a staged module for the upcoming textureSprite / Custom PNG particle mode.
 * It is intentionally not wired into the live index.html yet. The first refactor pass keeps
 * behaviour stable while preparing clear module boundaries.
 */

const textureCache = new Map();

export function loadTexture(src) {
    if (!src) {
        return Promise.reject(new Error('Texture source is required.'));
    }

    const existing = textureCache.get(src);
    if (existing) {
        return existing.promise;
    }

    const image = new Image();
    image.crossOrigin = 'anonymous';

    const record = {
        src,
        image,
        loaded: false,
        error: null,
        promise: null
    };

    record.promise = new Promise((resolve, reject) => {
        image.onload = () => {
            record.loaded = true;
            resolve(record);
        };

        image.onerror = () => {
            record.error = new Error(`Failed to load texture: ${src}`);
            reject(record.error);
        };

        image.src = src;
    });

    textureCache.set(src, record);
    return record.promise;
}

export function getTexture(src) {
    return textureCache.get(src) || null;
}

export function clearTextureCache() {
    textureCache.clear();
}

export function listCachedTextures() {
    return Array.from(textureCache.values()).map((record) => ({
        src: record.src,
        loaded: record.loaded,
        error: record.error ? record.error.message : null
    }));
}
