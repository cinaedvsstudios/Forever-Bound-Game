/*
 * Artifex FX Runtime v1
 * Extracted from the Effect Editor so Scene Editor / Playtest / final game can
 * eventually render FX assets without loading the whole editor UI.
 */
(function () {
    'use strict';

    // Define Custom Shapes SVGs for picker
    const SHAPE_DEFS = [
        { id: 'circle', name: 'Circle', svg: '<circle cx="12" cy="12" r="8" fill="currentColor"/>' },
        { id: 'ring', name: 'Ring', svg: '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"/>' },
        { id: 'spark', name: 'Spark', svg: '<path d="M12 4 L12 20 M4 12 L20 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
        { id: 'square', name: 'Square', svg: '<rect x="6" y="6" width="12" height="12" fill="currentColor"/>' },
        { id: 'rounded-square', name: 'Rounded Square', svg: '<rect x="5" y="5" width="14" height="14" rx="4" fill="currentColor"/>' },
        { id: 'triangle', name: 'Triangle', svg: '<polygon points="12,4 4,20 20,20" fill="currentColor"/>' },
        { id: 'right-triangle', name: 'Right Triangle', svg: '<polygon points="5,5 5,19 19,19" fill="currentColor"/>' },
        { id: 'pentagon', name: 'Pentagon', svg: '<polygon points="12,3 21,10 18,21 6,21 3,10" fill="currentColor"/>' },
        { id: 'hexagon', name: 'Hexagon', svg: '<polygon points="12,3 20,7 20,17 12,21 4,17 4,7" fill="currentColor"/>' },
        { id: 'flat-hexagon', name: 'Flat Hex', svg: '<polygon points="5,6 19,6 23,12 19,18 5,18 1,12" fill="currentColor"/>' },
        { id: 'octagon', name: 'Octagon', svg: '<polygon points="8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8" fill="currentColor"/>' },
        { id: 'diamond', name: 'Diamond', svg: '<polygon points="12,3 21,12 12,21 3,12" fill="currentColor"/>' },
        { id: 'thin-diamond', name: 'Thin Diamond', svg: '<polygon points="12,2 17,12 12,22 7,12" fill="currentColor"/>' },
        { id: 'flat-gem', name: 'Flat Gem', svg: '<polygon points="7,4 17,4 22,10 12,21 2,10" fill="currentColor"/>' },
        { id: 'trapezoid', name: 'Trapezoid', svg: '<polygon points="7,6 17,6 21,19 3,19" fill="currentColor"/>' },
        { id: 'parallelogram', name: 'Parallelogram', svg: '<polygon points="8,5 22,5 16,19 2,19" fill="currentColor"/>' },
        { id: 'star', name: 'Star', svg: '<polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="currentColor"/>' },
        { id: 'soft-star', name: 'Soft Star', svg: '<path d="M12 2 C14 8 16 10 22 12 C16 14 14 16 12 22 C10 16 8 14 2 12 C8 10 10 8 12 2Z" fill="currentColor"/>' },
        { id: 'cross-star', name: 'Cross-Star', svg: '<path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2" fill="currentColor"/>' },
        { id: 'four-point-glint', name: 'Glint', svg: '<polygon points="12,1 15,9 23,12 15,15 12,23 9,15 1,12 9,9" fill="currentColor"/>' },
        { id: 'jagged-burst', name: 'Jagged Burst', svg: '<polygon points="12,1 14,8 21,4 17,11 23,14 16,15 18,23 12,18 6,23 8,15 1,14 7,11 3,4 10,8" fill="currentColor"/>' },
        { id: 'scalloped-circle', name: 'Scallop', svg: '<path d="M12 3 C14 5 17 4 18 7 C21 8 20 12 21 14 C19 16 20 20 17 20 C15 23 12 20 10 21 C8 19 4 20 4 17 C1 15 4 12 3 10 C5 8 4 4 7 5 C9 2 11 5 12 3Z" fill="currentColor"/>' },
        { id: 'rough-blob', name: 'Rough Blob', svg: '<path d="M12 3 C17 2 21 6 20 11 C23 15 18 21 13 20 C8 23 2 18 4 12 C1 7 7 2 12 3Z" fill="currentColor"/>' },
        { id: 'cloth-ragged-square', name: 'Ragged Square', svg: '<polygon points="5,4 19,5 20,10 18,20 12,18 5,20 4,13 6,9" fill="currentColor"/>' },
        { id: 'flame', name: 'Flame', svg: '<path d="M12 22 C7 19 5 15 7 11 C8 8 11 7 10 2 C15 6 20 10 17 16 C16 19 14 21 12 22Z" fill="currentColor"/>' },
        { id: 'teardrop', name: 'Teardrop', svg: '<path d="M12 2 C18 9 20 13 18 17 C16 21 8 21 6 17 C4 13 6 9 12 2Z" fill="currentColor"/>' },
        { id: 'water-drop', name: 'Water Drop', svg: '<path d="M12 2 C17 8 20 12 18 17 C16 22 8 22 6 17 C4 12 7 8 12 2Z" fill="currentColor"/>' },
        { id: 'map-pin-drop', name: 'Pin Drop', svg: '<path d="M12 22 C12 22 5 14 5 9 C5 5 8 2 12 2 C16 2 19 5 19 9 C19 14 12 22 12 22Z" fill="currentColor"/><circle cx="12" cy="9" r="3" fill="#0f0c0b"/>' },
        { id: 'cloud-blob', name: 'Cloud Blob', svg: '<path d="M6 18 C3 18 2 15 4 13 C4 10 7 9 9 10 C10 7 14 6 16 9 C19 9 22 11 21 15 C21 17 19 18 17 18Z" fill="currentColor"/>' },
        { id: 'heart', name: 'Heart', svg: '<path d="M12 21 C5 15 3 11 5 7 C7 3 11 5 12 8 C13 5 17 3 19 7 C21 11 19 15 12 21Z" fill="currentColor"/>' },
        { id: 'gear', name: 'Gear', svg: '<path d="M10 2 H14 L15 5 L18 4 L20 8 L18 10 L22 12 L18 14 L20 16 L18 20 L15 19 L14 22 H10 L9 19 L6 20 L4 16 L6 14 L2 12 L6 10 L4 8 L6 4 L9 5Z" fill="currentColor"/><circle cx="12" cy="12" r="4" fill="#0f0c0b"/>' },
        { id: 'lightning-bolt', name: 'Lightning', svg: '<polygon points="13,1 4,13 11,13 9,23 20,9 13,9" fill="currentColor"/>' },
        { id: 'scribble-stroke', name: 'Scribble', svg: '<path d="M4 14 C7 4 10 22 13 9 C15 1 18 18 21 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' },
        { id: 'energy-scribble', name: 'Energy Scribble', svg: '<path d="M3 12 C6 6 8 18 11 12 C14 6 16 18 21 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
        { id: 'swirl', name: 'Swirl', svg: '<path d="M19 12 C19 7 15 4 11 5 C6 6 4 11 7 15 C10 19 17 18 18 12 C19 8 14 7 12 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>' },
        { id: 'capsule', name: 'Capsule', svg: '<rect x="10" y="4" width="4" height="16" rx="2" fill="currentColor"/>' },
        { id: 'cone', name: 'Cone', svg: '<path d="M12 3 L21 21 H3Z" fill="currentColor"/>' },
        { id: 'spear', name: 'Spear', svg: '<polygon points="12,22 8,4 16,4" fill="currentColor"/>' },
        { id: 'three-point-shard', name: 'Three Shard', svg: '<polygon points="12,2 15,13 22,20 12,17 2,20 9,13" fill="currentColor"/>' },
        { id: 'shard', name: 'Shard', svg: '<polygon points="12,2 20,10 16,22 6,18" fill="currentColor"/>' }
    ];

    const TEXTURE_CACHE = new Map();
    const TEXTURE_FALLBACK_SHAPE = 'circle';



    function getCachedTexture(src) {
        if (!src) return null;
        if (TEXTURE_CACHE.has(src)) return TEXTURE_CACHE.get(src);
        const img = new Image();
        const record = { image: img, loaded: false, failed: false, src };
        img.onload = () => { record.loaded = true; };
        img.onerror = () => { record.failed = true; };
        img.src = src;
        TEXTURE_CACHE.set(src, record);
        return record;
    }

    function drawRegularPolygon(ctx, x, y, radius, sides, rotation = -Math.PI / 2) {
        const safeRadius = Math.max(0.1, radius);
        ctx.moveTo(x + Math.cos(rotation) * safeRadius, y + Math.sin(rotation) * safeRadius);
        for (let i = 1; i < sides; i++) {
            const angle = rotation + (i * Math.PI * 2) / sides;
            ctx.lineTo(x + Math.cos(angle) * safeRadius, y + Math.sin(angle) * safeRadius);
        }
        ctx.closePath();
    }

    function drawStarPolygon(ctx, x, y, outerRadius, innerRadius, points = 5) {
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / points;
        ctx.moveTo(x, y - outerRadius);
        for (let i = 0; i < points; i++) {
            ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.closePath();
    }

    function drawPathShape(ctx, particle, shape) {
        const x = particle.x;
        const y = particle.y;
        const size = Math.max(0.1, particle.size);

        switch (shape) {
            case 'circle':
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'ring':
                ctx.lineWidth = Math.max(1, size / 5);
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'spark':
                ctx.lineWidth = Math.max(1, size / 2);
                ctx.lineCap = 'round';
                ctx.moveTo(x, y);
                ctx.lineTo(x - particle.vx * 1.5, y - particle.vy * 1.5);
                ctx.stroke();
                break;
            case 'square':
                ctx.rect(x - size / 2, y - size / 2, size, size);
                ctx.fill();
                break;
            case 'rounded-square':
                if (ctx.roundRect) {
                    ctx.roundRect(x - size / 2, y - size / 2, size, size, Math.max(2, size * 0.18));
                    ctx.fill();
                } else {
                    ctx.rect(x - size / 2, y - size / 2, size, size);
                    ctx.fill();
                }
                break;
            case 'triangle':
            case 'cone':
                ctx.moveTo(x, y - size);
                ctx.lineTo(x + size, y + size);
                ctx.lineTo(x - size, y + size);
                ctx.closePath();
                ctx.fill();
                break;
            case 'right-triangle':
                ctx.moveTo(x - size, y - size);
                ctx.lineTo(x - size, y + size);
                ctx.lineTo(x + size, y + size);
                ctx.closePath();
                ctx.fill();
                break;
            case 'pentagon':
                drawRegularPolygon(ctx, x, y, size, 5);
                ctx.fill();
                break;
            case 'hexagon':
                drawRegularPolygon(ctx, x, y, size, 6, 0);
                ctx.fill();
                break;
            case 'flat-hexagon':
                drawRegularPolygon(ctx, x, y, size, 6, Math.PI / 6);
                ctx.fill();
                break;
            case 'octagon':
                drawRegularPolygon(ctx, x, y, size, 8, Math.PI / 8);
                ctx.fill();
                break;
            case 'diamond':
                ctx.moveTo(x, y - size);
                ctx.lineTo(x + size * 0.7, y);
                ctx.lineTo(x, y + size);
                ctx.lineTo(x - size * 0.7, y);
                ctx.closePath();
                ctx.fill();
                break;
            case 'thin-diamond':
                ctx.moveTo(x, y - size * 1.25);
                ctx.lineTo(x + size * 0.38, y);
                ctx.lineTo(x, y + size * 1.25);
                ctx.lineTo(x - size * 0.38, y);
                ctx.closePath();
                ctx.fill();
                break;
            case 'flat-gem':
                ctx.moveTo(x - size * 0.6, y - size * 0.75);
                ctx.lineTo(x + size * 0.6, y - size * 0.75);
                ctx.lineTo(x + size, y - size * 0.15);
                ctx.lineTo(x, y + size);
                ctx.lineTo(x - size, y - size * 0.15);
                ctx.closePath();
                ctx.fill();
                break;
            case 'trapezoid':
                ctx.moveTo(x - size * 0.45, y - size);
                ctx.lineTo(x + size * 0.45, y - size);
                ctx.lineTo(x + size, y + size);
                ctx.lineTo(x - size, y + size);
                ctx.closePath();
                ctx.fill();
                break;
            case 'parallelogram':
                ctx.moveTo(x - size * 0.35, y - size);
                ctx.lineTo(x + size, y - size);
                ctx.lineTo(x + size * 0.35, y + size);
                ctx.lineTo(x - size, y + size);
                ctx.closePath();
                ctx.fill();
                break;
            case 'star':
                drawStarPolygon(ctx, x, y, size, size * 0.4, 5);
                ctx.fill();
                break;
            case 'soft-star':
            case 'cross-star':
                ctx.moveTo(x, y - size * 1.25);
                ctx.quadraticCurveTo(x, y, x + size * 1.25, y);
                ctx.quadraticCurveTo(x, y, x, y + size * 1.25);
                ctx.quadraticCurveTo(x, y, x - size * 1.25, y);
                ctx.quadraticCurveTo(x, y, x, y - size * 1.25);
                ctx.fill();
                break;
            case 'four-point-glint':
                drawStarPolygon(ctx, x, y, size * 1.35, size * 0.2, 4);
                ctx.fill();
                break;
            case 'jagged-burst':
                drawStarPolygon(ctx, x, y, size * 1.25, size * 0.55, 8);
                ctx.fill();
                break;
            case 'scalloped-circle':
            case 'rough-blob':
            case 'cloud-blob':
                for (let i = 0; i < 7; i++) {
                    const angle = (Math.PI * 2 * i) / 7;
                    const wobble = shape === 'cloud-blob' ? 0.65 + (i % 3) * 0.18 : 0.82 + (i % 2) * 0.22;
                    const px = x + Math.cos(angle) * size * 0.35;
                    const py = y + Math.sin(angle) * size * 0.25;
                    ctx.moveTo(px + size * wobble, py);
                    ctx.arc(px, py, size * wobble, 0, Math.PI * 2);
                }
                ctx.fill();
                break;
            case 'cloth-ragged-square':
                ctx.moveTo(x - size, y - size * 0.9);
                ctx.lineTo(x + size * 0.9, y - size * 0.8);
                ctx.lineTo(x + size * 0.75, y - size * 0.2);
                ctx.lineTo(x + size, y + size);
                ctx.lineTo(x + size * 0.2, y + size * 0.75);
                ctx.lineTo(x - size * 0.8, y + size);
                ctx.lineTo(x - size, y + size * 0.1);
                ctx.lineTo(x - size * 0.7, y - size * 0.35);
                ctx.closePath();
                ctx.fill();
                break;
            case 'flame':
                ctx.moveTo(x, y + size);
                ctx.bezierCurveTo(x - size, y + size * 0.2, x - size * 0.45, y - size * 0.45, x - size * 0.1, y - size);
                ctx.bezierCurveTo(x + size * 0.65, y - size * 0.25, x + size * 0.9, y + size * 0.3, x, y + size);
                ctx.fill();
                break;
            case 'teardrop':
            case 'water-drop':
            case 'map-pin-drop':
                ctx.moveTo(x, y - size * 1.25);
                ctx.bezierCurveTo(x + size, y - size * 0.2, x + size, y + size, x, y + size);
                ctx.bezierCurveTo(x - size, y + size, x - size, y - size * 0.2, x, y - size * 1.25);
                ctx.fill();
                break;
            case 'heart':
                ctx.moveTo(x, y + size);
                ctx.bezierCurveTo(x - size * 1.5, y, x - size, y - size, x, y - size * 0.35);
                ctx.bezierCurveTo(x + size, y - size, x + size * 1.5, y, x, y + size);
                ctx.fill();
                break;
            case 'gear':
                drawStarPolygon(ctx, x, y, size, size * 0.72, 10);
                ctx.fill();
                ctx.save();
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                break;
            case 'lightning-bolt':
                ctx.moveTo(x + size * 0.2, y - size * 1.2);
                ctx.lineTo(x - size * 0.8, y + size * 0.1);
                ctx.lineTo(x - size * 0.05, y + size * 0.1);
                ctx.lineTo(x - size * 0.3, y + size * 1.2);
                ctx.lineTo(x + size * 0.85, y - size * 0.2);
                ctx.lineTo(x + size * 0.1, y - size * 0.2);
                ctx.closePath();
                ctx.fill();
                break;
            case 'scribble-stroke':
            case 'energy-scribble':
            case 'swirl':
                ctx.lineWidth = Math.max(1, size / 4);
                ctx.lineCap = 'round';
                if (shape === 'swirl') {
                    for (let a = 0; a < Math.PI * 2.2; a += 0.35) {
                        const r = (a / (Math.PI * 2.2)) * size;
                        const px = x + Math.cos(a + particle.age * 0.08) * r;
                        const py = y + Math.sin(a + particle.age * 0.08) * r;
                        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                    }
                } else {
                    ctx.moveTo(x - size, y);
                    ctx.bezierCurveTo(x - size * 0.5, y - size, x, y + size, x + size * 0.45, y);
                    ctx.bezierCurveTo(x + size * 0.65, y - size * 0.6, x + size, y - size * 0.2, x + size * 1.25, y - size * 0.55);
                }
                ctx.stroke();
                break;
            case 'capsule':
                ctx.lineWidth = Math.max(2, size / 2);
                ctx.lineCap = 'round';
                ctx.moveTo(x, y - size);
                ctx.lineTo(x, y + size);
                ctx.stroke();
                break;
            case 'spear':
                ctx.moveTo(x, y + size * 1.4);
                ctx.lineTo(x - size * 0.45, y - size * 1.2);
                ctx.lineTo(x + size * 0.45, y - size * 1.2);
                ctx.closePath();
                ctx.fill();
                break;
            case 'three-point-shard':
                ctx.moveTo(x, y - size * 1.25);
                ctx.lineTo(x + size * 0.35, y + size * 0.25);
                ctx.lineTo(x + size, y + size);
                ctx.lineTo(x, y + size * 0.55);
                ctx.lineTo(x - size, y + size);
                ctx.lineTo(x - size * 0.35, y + size * 0.25);
                ctx.closePath();
                ctx.fill();
                break;
            case 'shard':
                ctx.moveTo(x, y - size);
                ctx.lineTo(x + size * 0.8, y + size * 0.2);
                ctx.lineTo(x - size * 0.4, y + size);
                ctx.closePath();
                ctx.fill();
                break;
            default:
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
        }
    }

    function drawTextureSprite(ctx, particle, color) {
        const record = getCachedTexture(particle.textureSrc);
        if (!record || !record.loaded || !record.image || record.failed) {
            ctx.beginPath();
            drawPathShape(ctx, particle, TEXTURE_FALLBACK_SHAPE);
            return;
        }

        const size = Math.max(0.1, particle.size * 2);
        const img = record.image;
        let drawW = size;
        let drawH = size;

        if (particle.fitMode === 'contain') {
            const ratio = img.width && img.height ? img.width / img.height : 1;
            if (ratio > 1) drawH = size / ratio;
            else drawW = size * ratio;
        } else if (particle.fitMode === 'cover') {
            const ratio = img.width && img.height ? img.width / img.height : 1;
            if (ratio > 1) drawW = size * ratio;
            else drawH = size / ratio;
        }

        const dx = -drawW / 2;
        const dy = -drawH / 2;
        const rotation = ((particle.rotation || 0) * Math.PI) / 180;

        ctx.save();
        ctx.translate(particle.x, particle.y);
        if (rotation) ctx.rotate(rotation);
        ctx.drawImage(img, dx, dy, drawW, drawH);

        if (particle.tintMode && particle.tintMode !== 'none') {
            const previousComposite = ctx.globalCompositeOperation;
            ctx.globalCompositeOperation = particle.tintMode;
            ctx.fillStyle = color;
            ctx.fillRect(dx, dy, drawW, drawH);
            ctx.globalCompositeOperation = previousComposite;
        }
        ctx.restore();
    }

    const SOFT_SPRITE_CACHE = new Map();

    function createSoftSprite(key, stops) {
        if (SOFT_SPRITE_CACHE.has(key)) return SOFT_SPRITE_CACHE.get(key);
        const size = 96;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const gctx = c.getContext('2d');
        const gradient = gctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        (stops || [
            [0.0, 'rgba(255,255,255,0.70)'],
            [0.35, 'rgba(255,255,255,0.35)'],
            [1.0, 'rgba(255,255,255,0.0)']
        ]).forEach(([pos, color]) => gradient.addColorStop(pos, color));
        gctx.fillStyle = gradient;
        gctx.fillRect(0, 0, size, size);
        SOFT_SPRITE_CACHE.set(key, c);
        return c;
    }

    function drawSoftParticleSprite(ctx, particle, color, alphaMultiplier = 1) {
        const sprite = createSoftSprite('soft-smoke-v1');
        const size = Math.max(2, particle.size * 2.8);
        ctx.save();
        ctx.globalAlpha *= alphaMultiplier;
        ctx.drawImage(sprite, particle.x - size / 2, particle.y - size / 2, size, size);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = color;
        ctx.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
        ctx.restore();
    }

    function clamp01(value) {
        return Math.max(0, Math.min(1, value));
    }

    function drawProceduralShockwave(ctx, layer, state) {
        const visual = layer.visual || {};
        const life = layer.life || {};
        const duration = Math.max(20, life.durationMax || life.durationMin || 70);
        const colors = visual.colors || ['#ffffff', '#00a1d7', '#000000'];
        const alphas = visual.alphas || [0, 0.85, 0];
        const pulseCount = Math.max(1, Math.min(4, Math.round(layer.emitter?.rate || 1) || 1));
        const start = Number(visual.sizeStart || 4);
        const end = Number(visual.sizeEnd || 80);
        const maxRadius = Math.max(start, end) * 2.2;
        const minRadius = Math.max(1, Math.min(start, end));
        const now = state.time || performance.now();
        const cx = state.emitterPos.x;
        const cy = state.emitterPos.y;

        ctx.save();
        ctx.globalCompositeOperation = visual.composite || 'screen';
        ctx.lineCap = 'round';
        for (let i = 0; i < pulseCount; i++) {
            const phase = ((now / (duration * 18)) + i / pulseCount) % 1;
            const eased = 1 - Math.pow(1 - phase, 2.2);
            const radius = minRadius + eased * maxRadius;
            const width = Math.max(1.5, (1 - phase) * Math.max(2, (visual.glow || 16) / 5));
            const sample = interpolateColorsMulti(colors, alphas, phase);
            const alpha = clamp01(sample.alpha * (1 - phase));
            if (alpha <= 0.01) continue;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = sample.color;
            ctx.shadowColor = sample.color;
            ctx.shadowBlur = Math.min(35, visual.glow || 18);
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
        return true;
    }

    function drawProceduralRibbon(ctx, layer, state) {
        const visual = layer.visual || {};
        const physics = layer.physics || {};
        const colors = visual.colors || ['#ffffff', '#00a1d7'];
        const now = state.time || performance.now();
        const cx = state.emitterPos.x;
        const cy = state.emitterPos.y;
        const strands = Math.max(1, Math.min(5, Math.round((layer.emitter?.rate || 10) / 5)));
        const length = Math.max(60, (physics.speedMax || 5) * 24 + (visual.sizeStart || 8) * 8);
        const amp = Math.max(8, Math.abs(physics.orbitalForce || 1.4) * 8 + (physics.spread || 25) * 0.18);
        const baseAngle = ((physics.angle ?? 270) * Math.PI) / 180;

        ctx.save();
        ctx.globalCompositeOperation = visual.composite || 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = Math.min(40, visual.glow || 22);

        for (let s = 0; s < strands; s++) {
            const offset = (s - (strands - 1) / 2) * 7;
            const phase = now * 0.006 + s * 1.7;
            const colour = colors[s % colors.length] || colors[0];
            ctx.strokeStyle = colour;
            ctx.shadowColor = colour;
            ctx.globalAlpha = 0.48 / strands + 0.24;
            ctx.lineWidth = Math.max(2, (visual.sizeStart || 8) * (0.55 - s * 0.035));

            ctx.beginPath();
            for (let i = 0; i <= 22; i++) {
                const t = i / 22;
                const taper = 1 - t;
                const along = t * length;
                const wave = Math.sin(phase + t * Math.PI * 3.2) * amp * taper;
                const px = cx + Math.cos(baseAngle) * along + Math.cos(baseAngle + Math.PI / 2) * (wave + offset * taper);
                const py = cy + Math.sin(baseAngle) * along + Math.sin(baseAngle + Math.PI / 2) * (wave + offset * taper);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
        ctx.restore();
        return true;
    }

    function drawProceduralLensFlare(ctx, layer, state) {
        const visual = layer.visual || {};
        const colours = visual.colors || ['#ffffff', '#00a1d7'];
        const now = state.time || performance.now();
        const cx = state.emitterPos.x;
        const cy = state.emitterPos.y;
        const pulse = 0.72 + Math.sin(now * 0.004) * 0.18;
        const width = Math.max(90, (visual.sizeEnd || 30) * 8);
        const height = Math.max(3, (visual.sizeStart || 2) * 2.5);

        ctx.save();
        ctx.globalCompositeOperation = visual.composite || 'lighter';
        ctx.shadowBlur = Math.min(45, visual.glow || 35);
        ctx.shadowColor = colours[0] || '#ffffff';
        const gradient = ctx.createLinearGradient(cx - width / 2, cy, cx + width / 2, cy);
        gradient.addColorStop(0, 'rgba(255,255,255,0)');
        gradient.addColorStop(0.45, colours[1] || '#00a1d7');
        gradient.addColorStop(0.5, colours[0] || '#ffffff');
        gradient.addColorStop(0.55, colours[1] || '#00a1d7');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = pulse;
        ctx.fillStyle = gradient;
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(cx - width / 2, cy - height / 2, width, height, height / 2);
            ctx.fill();
        } else {
            ctx.fillRect(cx - width / 2, cy - height / 2, width, height);
        }
        ctx.globalAlpha = 0.5 * pulse;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(8, height * 3), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
    }

    function drawProceduralHeatShimmer(ctx, layer, state) {
        const visual = layer.visual || {};
        const now = state.time || performance.now();
        const cx = state.emitterPos.x;
        const cy = state.emitterPos.y;
        const w = Math.max(40, (layer.emitter?.width || 20) * 2.2);
        const h = Math.max(90, (visual.sizeEnd || 35) * 3.5);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.lineCap = 'round';
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(255, 235, 190, 0.18)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 200, 120, 0.35)';
        for (let line = 0; line < 6; line++) {
            const xBase = cx - w / 2 + (w * line) / 5;
            const phase = now * 0.003 + line * 1.2;
            ctx.beginPath();
            for (let i = 0; i <= 18; i++) {
                const t = i / 18;
                const x = xBase + Math.sin(phase + t * 7) * 7 * (1 - t * 0.35);
                const y = cy - t * h;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        ctx.restore();
        return true;
    }

    function renderProceduralLayer(ctx, layer, state) {
        if (!layer || layer.isVisible === false) return false;
        const type = layer.effectType || '';
        if (type === 'ring') return drawProceduralShockwave(ctx, layer, state);
        if (type === 'ribbon') return drawProceduralRibbon(ctx, layer, state);
        if (type === 'lensflare') return drawProceduralLensFlare(ctx, layer, state);
        if (type === 'refraction') return drawProceduralHeatShimmer(ctx, layer, state);
        return false;
    }

    class Particle {
        constructor(x, y, config, initialBurstAngle = null) {
            this.x = x;
            this.y = y;
        
            const p = config.physics || {};
            const v = config.visual || {};
            const l = config.life || {};
            this.effectType = config.effectType || 'particles';

            const speed = (p.speedMin || 0) + Math.random() * ((p.speedMax || 0) - (p.speedMin || 0));
        
            let angleDeg;
            if (initialBurstAngle !== null) {
                angleDeg = initialBurstAngle;
            } else {
                const minAngle = (p.angle || 0) - ((p.spread || 0) / 2);
                angleDeg = minAngle + Math.random() * (p.spread || 0);
            }
            const angleRad = (angleDeg * Math.PI) / 180;

            this.vx = Math.cos(angleRad) * speed;
            this.vy = Math.sin(angleRad) * speed;

            let dur = Math.round((l.durationMin || 10) + Math.random() * ((l.durationMax || 20) - (l.durationMin || 10)));
            this.duration = Math.max(1, dur); // PREVENT INFINITY CRASH
            this.age = 0;

            this.sizeStart = v.sizeStart || 5;
            this.sizeEnd = v.sizeEnd || 1;
            this.size = this.sizeStart;

            this.colors = v.colors || [v.colorStart || "#ffffff", v.colorEnd || "#ffffff"];
            this.alphaStarts = v.alphaStarts || v.alphas || new Array(this.colors.length).fill(1.0);
            this.alphaEnds = v.alphaEnds || v.alphas || new Array(this.colors.length).fill(1.0);
            this.alphas = v.alphas || this.alphaEnds;
            this.useCustomAlphaCurve = this.alphaStarts.some(a => a < 1.0) || this.alphaEnds.some(a => a < 1.0) || this.alphas.some(a => a < 1.0);
        
            this.glow = v.glow || 0;
            this.blur = Math.max(0, Math.min(5, Number(v.blur || 0)));
            this.edgeBlur = 0;
            this.rotation = Number(v.rotation || 0);
            this.shapeMode = v.shapeMode || 'builtInShape';
            this.shape = v.shape || 'circle';
            this.textureSrc = v.textureDataUrl || v.texture || null;
            this.textureName = v.textureName || '';
            this.useTextureAlpha = v.useTextureAlpha !== false;
            this.tintMode = v.tintMode || 'none';
            this.fitMode = v.fitMode || 'contain';
            if (this.shapeMode === 'textureSprite' && this.textureSrc) getCachedTexture(this.textureSrc);

            this.orbitalForce = p.orbitalForce || 0;
            this.emitterOriginX = x;
            this.emitterOriginY = y;
        
            this.physicsRef = p;
        }

        update(canvasWidth, canvasHeight, enableBounce, gridBoundsArg) {
            this.age++;
            const p = this.physicsRef;
        
            this.vx *= (p?.friction || 1);
            this.vy *= (p?.friction || 1);

            if (this.orbitalForce !== 0) {
                const dx = this.x - this.emitterOriginX;
                const dy = this.y - this.emitterOriginY;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
                const tx = -dy / dist;
                const ty = dx / dist;

                this.vx += tx * this.orbitalForce * 0.45;
                this.vy += ty * this.orbitalForce * 0.45;
            }

            this.vy += (p?.gravityY || 0);
            this.x += this.vx;
            this.y += this.vy;

            if (enableBounce) {
                const bounds = gridBoundsArg || { bottom: canvasHeight };
                const radius = this.size / 2;
                if (this.y + radius >= bounds.bottom) {
                    this.y = bounds.bottom - radius;
                    this.vy = -this.vy * 0.65;
                    this.vx *= 0.8;
                }
            }

            const ratio = this.age / this.duration;
            this.size = this.sizeStart + ratio * (this.sizeEnd - this.sizeStart);
            if (this.size < 0) this.size = 0;
        }

        draw(ctx) {
            if (!isFinite(this.x) || !isFinite(this.y) || !isFinite(this.size)) return;
        
            const ratio = this.age / this.duration;
            const { color, alpha: colorAlpha } = interpolateColorsMulti(this.colors, this.alphas, ratio, this.alphaStarts, this.alphaEnds);
        
            let finalAlpha = 1.0;
            if (this.useCustomAlphaCurve) {
                finalAlpha = colorAlpha;
            } else {
                finalAlpha = Math.max(0, 1 - ratio);
            }
        
            ctx.save();
            ctx.globalAlpha = finalAlpha;
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
        
            if (this.glow > 0) {
                ctx.shadowBlur = this.glow;
                ctx.shadowColor = color;
            }
        
            const shouldUseSoftSprite = this.effectType === 'gas' || this.shape === 'soft-smoke' || this.shape === 'cloud-blob';
            if (!shouldUseSoftSprite && this.blur > 0 && this.blur <= 5) {
                ctx.filter = `blur(${this.blur}px)`;
            }

            ctx.beginPath();

            if (shouldUseSoftSprite && this.shapeMode !== 'textureSprite') {
                drawSoftParticleSprite(ctx, this, color, 0.95);
            } else if (this.shapeMode === 'textureSprite' && this.textureSrc) {
                drawTextureSprite(ctx, this, color);
            } else {
                const rotation = ((this.rotation || 0) * Math.PI) / 180;
                if (rotation) {
                    ctx.translate(this.x, this.y);
                    ctx.rotate(rotation);
                    const localParticle = { ...this, x: 0, y: 0 };
                    drawPathShape(ctx, localParticle, this.shape);
                } else {
                    drawPathShape(ctx, this, this.shape);
                }
            }

            ctx.restore();
        }

        isDead() {
            return this.age >= this.duration || this.size <= 0;
        }
    }

    function interpolateColorAlpha(color1, a1, color2, a2, factor) {
        if (!color1) color1 = "#ffffff";
        if (!color2) color2 = "#ffffff";
    
        const hex = c => c.replace('#', '');
        const r1 = parseInt(hex(color1).substring(0, 2), 16) || 255;
        const g1 = parseInt(hex(color1).substring(2, 4), 16) || 255;
        const b1 = parseInt(hex(color1).substring(4, 6), 16) || 255;

        const r2 = parseInt(hex(color2).substring(0, 2), 16) || 255;
        const g2 = parseInt(hex(color2).substring(2, 4), 16) || 255;
        const b2 = parseInt(hex(color2).substring(4, 6), 16) || 255;

        const r = Math.round(r1 + factor * (r2 - r1));
        const g = Math.round(g1 + factor * (g2 - g1));
        const b = Math.round(b1 + factor * (b2 - b1));
        const a = a1 + factor * (a2 - a1);

        return { color: `rgb(${r}, ${g}, ${b})`, alpha: Math.max(0, Math.min(1, a)) };
    }

    function interpolateColorsMulti(colors, alphas, factor, alphaStarts = null, alphaEnds = null) {
        if (!colors || colors.length === 0) return { color: '#ffd23f', alpha: 1.0 };
    
        const safeAlphas = colors.map((_, i) => alphas && alphas[i] !== undefined ? Number(alphas[i]) : 1.0);
        const starts = colors.map((_, i) => alphaStarts && alphaStarts[i] !== undefined ? Number(alphaStarts[i]) : safeAlphas[i]);
        const ends = colors.map((_, i) => alphaEnds && alphaEnds[i] !== undefined ? Number(alphaEnds[i]) : safeAlphas[i]);

        if (colors.length === 1) {
            const a = starts[0] + factor * (ends[0] - starts[0]);
            return { color: colors[0], alpha: Math.max(0, Math.min(1, a)) };
        }

        const segments = colors.length - 1;
        const scaledFactor = factor * segments;
        const index = Math.min(Math.floor(scaledFactor), segments - 1);
        const segmentFactor = scaledFactor - index;
        const a1 = starts[index] !== undefined ? starts[index] : safeAlphas[index];
        const a2 = ends[index] !== undefined ? ends[index] : (starts[index + 1] !== undefined ? starts[index + 1] : safeAlphas[index + 1]);

        return interpolateColorAlpha(colors[index], a1, colors[index + 1], a2, segmentFactor);
    }


    window.ArtifexFxRuntime = {
        SHAPE_DEFS,
        TEXTURE_CACHE,
        TEXTURE_FALLBACK_SHAPE,
        getCachedTexture,
        drawRegularPolygon,
        drawStarPolygon,
        drawPathShape,
        drawTextureSprite,
        createSoftSprite,
        drawSoftParticleSprite,
        renderProceduralLayer,
        Particle,
        interpolateColorAlpha,
        interpolateColorsMulti
    };
})();
