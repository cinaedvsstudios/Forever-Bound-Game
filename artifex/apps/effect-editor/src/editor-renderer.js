/*
 * Artifex Effect Editor renderer extraction target.
 *
 * Split stage 4: renderer constants and pure geometry helpers only. The live
 * canvas, grid, resize, devicePixelRatio, emitter, and particle render loop are
 * still the proven inlined implementation inside index.html.
 */

export const DEFAULT_GRID_COLUMNS = 16;
export const DEFAULT_GRID_ROWS = 9;
export const DEFAULT_GRID_MARGIN = Object.freeze({ left: 40, top: 40, right: 40, bottom: 40 });

export function calculateGridBounds(canvasWidth, canvasHeight, options = {}) {
    const cols = options.columns || DEFAULT_GRID_COLUMNS;
    const rows = options.rows || DEFAULT_GRID_ROWS;
    const margin = { ...DEFAULT_GRID_MARGIN, ...(options.margin || {}) };

    const availW = canvasWidth - margin.left - margin.right;
    const availH = canvasHeight - margin.top - margin.bottom;

    if (availW <= 0 || availH <= 0) {
        return { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0, cellSize: 0 };
    }

    const cellSize = Math.min(availW / cols, availH / rows);
    const width = cellSize * cols;
    const height = cellSize * rows;
    const left = margin.left + (availW - width) / 2;
    const top = margin.top + (availH - height) / 2;

    return {
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
        cellSize
    };
}

export function clampPointToBounds(point, bounds) {
    if (!point || !bounds) return { x: 0, y: 0 };
    return {
        x: Math.max(bounds.left, Math.min(bounds.right, point.x)),
        y: Math.max(bounds.top, Math.min(bounds.bottom, point.y))
    };
}

export function pointFromBoundsRatio(bounds, ratio) {
    return clampPointToBounds({
        x: bounds.left + ratio.x * bounds.width,
        y: bounds.top + ratio.y * bounds.height
    }, bounds);
}

export function ratioFromBoundsPoint(bounds, point) {
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) return { x: 0.5, y: 0.8 };
    return {
        x: (point.x - bounds.left) / bounds.width,
        y: (point.y - bounds.top) / bounds.height
    };
}

export function clampPanOffset(panOffset, bounds, padding = 100) {
    const limitX = (bounds?.width || 0) + padding;
    const limitY = (bounds?.height || 0) + padding;
    return {
        x: Math.max(-limitX, Math.min(limitX, panOffset?.x || 0)),
        y: Math.max(-limitY, Math.min(limitY, panOffset?.y || 0))
    };
}
