/*
 * Thumbnail capture helpers for Artifex Effect Editor.
 *
 * Purpose:
 * Capture a square preview image from the live FX canvas so saved effects can show
 * a library thumbnail/card image.
 *
 * Notes:
 * - JPEG has no alpha channel, so transparent FX must be composited onto a background.
 * - PNG export can be used later when transparent thumbnails are needed.
 */

export const DEFAULT_THUMBNAIL_OPTIONS = {
    size: 512,
    format: 'image/jpeg',
    quality: 0.86,
    background: '#0f0c0b',
    fit: 'contain',
    padding: 32
};

export function captureSquareThumbnail(sourceCanvas, options) {
    if (!sourceCanvas || typeof sourceCanvas.width !== 'number' || typeof sourceCanvas.height !== 'number') {
        throw new Error('A valid source canvas is required for thumbnail capture.');
    }

    const settings = Object.assign({}, DEFAULT_THUMBNAIL_OPTIONS, options || {});
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
    } else {
        if (sourceRatio > 1) {
            width = available;
            height = available / sourceRatio;
        } else {
            height = available;
            width = available * sourceRatio;
        }
    }

    return {
        x: (targetSize - width) / 2,
        y: (targetSize - height) / 2,
        width,
        height
    };
}

export function downloadThumbnail(dataUrl, fileName) {
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = fileName || 'fx-thumbnail.jpg';
    anchor.click();
}

export function createThumbnailFileName(effectIdOrName) {
    const safeName = String(effectIdOrName || 'fx-thumbnail')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'fx-thumbnail';
    return safeName + '-thumbnail.jpg';
}
