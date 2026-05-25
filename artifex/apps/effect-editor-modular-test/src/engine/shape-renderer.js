/*
 * Artifex Effect Editor shape renderer scaffold.
 *
 * This module defines the intended built-in procedural/SVG particle shape bank.
 * It is staged for the next pass, where the live Particle.draw() switch statement should
 * be replaced with calls into this renderer.
 */

export const BUILT_IN_SHAPES = [
    { id: 'circle', label: 'Circle', category: 'basic' },
    { id: 'ring', label: 'Ring', category: 'basic' },
    { id: 'square', label: 'Square', category: 'basic' },
    { id: 'rounded-square', label: 'Rounded Square', category: 'basic' },
    { id: 'triangle', label: 'Triangle', category: 'basic' },
    { id: 'right-triangle', label: 'Right Triangle', category: 'basic' },
    { id: 'hexagon', label: 'Hexagon', category: 'polygon' },
    { id: 'flat-hexagon', label: 'Flat Hexagon', category: 'polygon' },
    { id: 'octagon', label: 'Octagon', category: 'polygon' },
    { id: 'pentagon', label: 'Pentagon', category: 'polygon' },
    { id: 'diamond', label: 'Diamond', category: 'polygon' },
    { id: 'thin-diamond', label: 'Thin Diamond', category: 'polygon' },
    { id: 'flat-gem', label: 'Flat Gem', category: 'polygon' },
    { id: 'trapezoid', label: 'Trapezoid', category: 'polygon' },
    { id: 'parallelogram', label: 'Parallelogram', category: 'polygon' },
    { id: 'star', label: 'Star', category: 'magic' },
    { id: 'soft-star', label: 'Soft Star', category: 'magic' },
    { id: 'cross-star', label: 'Cross Star', category: 'magic' },
    { id: 'four-point-glint', label: 'Four Point Glint', category: 'magic' },
    { id: 'jagged-burst', label: 'Jagged Burst', category: 'magic' },
    { id: 'scalloped-circle', label: 'Scalloped Circle', category: 'organic' },
    { id: 'rough-blob', label: 'Rough Blob', category: 'organic' },
    { id: 'cloth-ragged-square', label: 'Ragged Square', category: 'organic' },
    { id: 'flame', label: 'Flame', category: 'organic' },
    { id: 'teardrop', label: 'Teardrop', category: 'organic' },
    { id: 'water-drop', label: 'Water Drop', category: 'organic' },
    { id: 'map-pin-drop', label: 'Map Pin Drop', category: 'organic' },
    { id: 'cloud-blob', label: 'Cloud Blob', category: 'organic' },
    { id: 'heart', label: 'Heart', category: 'symbol' },
    { id: 'heart-variant', label: 'Heart Variant', category: 'symbol' },
    { id: 'gear', label: 'Gear', category: 'symbol' },
    { id: 'lightning-bolt', label: 'Lightning Bolt', category: 'symbol' },
    { id: 'scribble-stroke', label: 'Scribble Stroke', category: 'stroke' },
    { id: 'energy-scribble', label: 'Energy Scribble', category: 'stroke' },
    { id: 'swirl', label: 'Swirl', category: 'stroke' },
    { id: 'spear', label: 'Spear', category: 'weapon' },
    { id: 'three-point-shard', label: 'Three Point Shard', category: 'weapon' },
    { id: 'shard', label: 'Shard', category: 'weapon' },
    { id: 'capsule', label: 'Capsule', category: 'beam' },
    { id: 'cone', label: 'Cone', category: 'beam' }
];

export function getShapeDefinition(shapeId) {
    return BUILT_IN_SHAPES.find((shape) => shape.id === shapeId) || BUILT_IN_SHAPES[0];
}

export function applyEdgeBlur(ctx, edgeBlur = 0) {
    if (!ctx) return;
    ctx.filter = edgeBlur > 0 ? `blur(${edgeBlur}px)` : 'none';
}

export function resetCanvasFilter(ctx) {
    if (!ctx) return;
    ctx.filter = 'none';
}

export function renderBuiltInShape(ctx, shapeId, x, y, size) {
    // Staged placeholder. The existing live renderer still draws shapes inline.
    // The next pass should move each canvas path implementation here.
    const safeSize = Math.max(0.1, Number(size) || 1);

    ctx.beginPath();

    switch (shapeId) {
        case 'ring':
            ctx.arc(x, y, safeSize, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'square':
            ctx.rect(x - safeSize / 2, y - safeSize / 2, safeSize, safeSize);
            ctx.fill();
            break;
        case 'triangle':
            ctx.moveTo(x, y - safeSize);
            ctx.lineTo(x + safeSize, y + safeSize);
            ctx.lineTo(x - safeSize, y + safeSize);
            ctx.closePath();
            ctx.fill();
            break;
        default:
            ctx.arc(x, y, safeSize, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
}
