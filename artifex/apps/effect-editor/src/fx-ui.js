/*
 * Artifex Effect Editor UI helpers.
 *
 * This file replaces scattered UI helper files. It holds label cleanup,
 * Shape Mode helpers, and the temporary Phase 2 patch until the live index.html
 * is split properly.
 */

export const SHAPE_MODE_BUILT_IN = 'builtInShape';
export const SHAPE_MODE_TEXTURE = 'textureSprite';

export const UI_LABEL_REPLACEMENTS = {
    'Tactical HUD': 'Preview Guides',
    'Active Grid': 'Preview Grid',
    'Layer Diagnostics': 'Active Layer Summary',
    'HUD Reticle': 'Emitter Guide',
    'Projection Angle': 'Direction',
    'Target Schema': 'JSON Output',
    'Interactive Coordinate Grid': 'Preview Grid',
    'Engine Architecture': 'Effect Engine',
    'Layer Identifier Name': 'Layer Name',
    'Transform Dynamics': 'Motion / Dynamics',
    'Visual Configuration': 'Visuals',
    'Temporal Duration': 'Timing',
    'Mouse Lock': 'Emitter Follows Mouse',
    'Floor Bounce': 'Preview Floor Collision'
};

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

export function cleanUiLabel(label) {
    return UI_LABEL_REPLACEMENTS[label] || label;
}

export function installPhase2UiPatch() {
    if (typeof window === 'undefined' || !window.document) return;
    if (window.__ARTIFEX_PHASE2_UI_PATCH_INSTALLED__) return;
    window.__ARTIFEX_PHASE2_UI_PATCH_INSTALLED__ = true;

    let performanceMode = 'full';
    const labelReplacements = Object.entries(UI_LABEL_REPLACEMENTS).concat([
        ['Active View Filters', 'Preview Options'],
        ['Mouse Lock:', 'Emitter Follows Mouse:'],
        ['HUD Reticle:', 'Emitter Guide:'],
        ['Floor Bounce:', 'Preview Floor Collision:'],
        ['Effect Layers', 'Layer Stack'],
        ['Workspace Tools', 'Preview Tools'],
        ['Diagnostics', 'Status'],
        ['Toggle Emitter HUD', 'Toggle Emitter Guide'],
        ['Lock Emitter to Mouse', 'Emitter Follows Pointer'],
        ['Toggle Physics Floor', 'Preview Floor Collision']
    ]);

    function replaceTextInTextNodes(root) {
        const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, null);
        let node;
        while ((node = walker.nextNode())) {
            const text = node.nodeValue;
            let next = text;
            labelReplacements.forEach(([from, to]) => {
                next = next.split(from).join(to);
            });
            if (next !== text) node.nodeValue = next;
        }
    }

    function replaceTitleText() {
        document.querySelectorAll('[title]').forEach((el) => {
            const title = el.getAttribute('title') || '';
            const next = title
                .replace('Toggle center reticle and aiming vectors.', 'Toggle the emitter guide and direction preview.')
                .replace('Snap the emitter exactly to where your cursor goes.', 'Let the emitter follow your pointer.')
                .replace('Cause falling particles to bounce off the bottom of the grid.', 'Preview floor collision for falling particles.')
                .replace('Viewport Display Filters', 'Viewport Display Options');
            if (next !== title) el.setAttribute('title', next);
        });
    }

    function moveParticleShapeToVisuals() {
        const shapeInput = document.getElementById('param-visual-shape');
        const visualsBody = document.getElementById('card-body-visuals');
        if (!shapeInput || !visualsBody) return;
        const shapeBlock = shapeInput.closest('div[title]');
        if (!shapeBlock) return;
        if (shapeBlock.parentElement && shapeBlock.parentElement.id === 'card-body-visuals') return;
        shapeBlock.setAttribute('title', 'Select the built-in visual particle shape used for this layer.');
        visualsBody.insertBefore(shapeBlock, visualsBody.firstElementChild);
    }

    function addPerformanceModeButton() {
        if (document.getElementById('view-performance-status')) return;
        let viewMenu = null;
        Array.from(document.querySelectorAll('.dropdown-parent > button')).some((button) => {
            if ((button.textContent || '').trim().indexOf('View') === 0) {
                viewMenu = button.parentElement.querySelector('.dropdown-menu');
                return true;
            }
            return false;
        });
        if (!viewMenu) return;

        const divider = document.createElement('div');
        divider.className = 'border-t border-artifex-border my-1';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.onclick = window.togglePerformanceMode;
        btn.className = 'w-full text-left px-4 py-1.5 text-xs hover:bg-artifex-gray hover:text-white transition text-slate-300 flex items-center justify-between';
        btn.title = 'Reduce preview particles, glow, blur, and high-DPI rendering for faster editing.';
        btn.innerHTML = '<span>Low Performance Mode</span> <span id="view-performance-status" class="text-[9px] text-slate-500">OFF</span>';

        viewMenu.insertBefore(divider, viewMenu.lastElementChild);
        viewMenu.insertBefore(btn, viewMenu.lastElementChild);
    }

    function syncPerformanceModeUI() {
        const node = document.getElementById('view-performance-status');
        if (!node) return;
        const isLow = performanceMode === 'low';
        node.innerText = isLow ? 'ON' : 'OFF';
        node.className = isLow ? 'text-[9px] text-green-500' : 'text-[9px] text-slate-500';
    }

    window.togglePerformanceMode = function togglePerformanceMode() {
        performanceMode = performanceMode === 'low' ? 'full' : 'low';
        window.ARTIFEX_PERFORMANCE_MODE = performanceMode;
        syncPerformanceModeUI();
        if (typeof window.showToast === 'function') {
            window.showToast(
                performanceMode === 'low'
                    ? 'Low Performance Mode enabled for faster preview.'
                    : 'Full Quality preview restored.',
                'info'
            );
        }
    };

    function applyPatch() {
        replaceTextInTextNodes(document.body);
        replaceTitleText();
        moveParticleShapeToVisuals();
        addPerformanceModeButton();
        syncPerformanceModeUI();
    }

    const previousOnload = window.onload;
    window.onload = function phase2OnloadWrapper(event) {
        if (typeof previousOnload === 'function') previousOnload.call(window, event);
        setTimeout(applyPatch, 0);
    };

    document.addEventListener('DOMContentLoaded', () => setTimeout(applyPatch, 0));
}
