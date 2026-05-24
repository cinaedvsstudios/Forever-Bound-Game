/*
 * Phase 2 live UI patch for the Artifex Effect Editor.
 *
 * Load this after the original inline editor script:
 * <script src="./src/ui/phase2-ui-patch.js"></script>
 *
 * This keeps Phase 2 small and reversible while the main index.html is still a giant file.
 */
(function () {
    'use strict';

    var performanceMode = 'full';

    var labelReplacements = [
        ['Layer Diagnostics', 'Active Layer Summary'],
        ['Active View Filters', 'Preview Options'],
        ['Mouse Lock:', 'Emitter Follows Mouse:'],
        ['HUD Reticle:', 'Emitter Guide:'],
        ['Floor Bounce:', 'Preview Floor Collision:'],
        ['Effect Layers', 'Layer Stack'],
        ['Workspace Tools', 'Preview Tools'],
        ['Diagnostics', 'Status'],
        ['Active Grid', 'Preview Grid'],
        ['Target Schema', 'JSON Output'],
        ['Layer Identifier Name', 'Layer Name'],
        ['Engine Architecture', 'Effect Engine'],
        ['Transform Dynamics', 'Motion / Dynamics'],
        ['Projection Angle', 'Direction'],
        ['Visual Configuration', 'Visuals'],
        ['Temporal Duration', 'Timing'],
        ['Interactive Coordinate Grid', 'Preview Grid'],
        ['Toggle Emitter HUD', 'Toggle Emitter Guide'],
        ['Lock Emitter to Mouse', 'Emitter Follows Pointer'],
        ['Toggle Physics Floor', 'Preview Floor Collision']
    ];

    function replaceTextInTextNodes(root) {
        var walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, null);
        var node;
        while ((node = walker.nextNode())) {
            var text = node.nodeValue;
            var next = text;
            labelReplacements.forEach(function (pair) {
                next = next.split(pair[0]).join(pair[1]);
            });
            if (next !== text) node.nodeValue = next;
        }
    }

    function replaceTitleText() {
        var all = document.querySelectorAll('[title]');
        all.forEach(function (el) {
            var title = el.getAttribute('title') || '';
            var next = title
                .replace('Toggle center reticle and aiming vectors.', 'Toggle the emitter guide and direction preview.')
                .replace('Snap the emitter exactly to where your cursor goes.', 'Let the emitter follow your pointer.')
                .replace('Cause falling particles to bounce off the bottom of the grid.', 'Preview floor collision for falling particles.')
                .replace('Viewport Display Filters', 'Viewport Display Options');
            if (next !== title) el.setAttribute('title', next);
        });
    }

    function moveParticleShapeToVisuals() {
        var shapeInput = document.getElementById('param-visual-shape');
        var visualsBody = document.getElementById('card-body-visuals');
        if (!shapeInput || !visualsBody) return;

        var shapeBlock = shapeInput.closest('div[title]');
        if (!shapeBlock) return;

        if (shapeBlock.parentElement && shapeBlock.parentElement.id === 'card-body-visuals') return;

        shapeBlock.setAttribute('title', 'Select the built-in visual particle shape used for this layer.');
        visualsBody.insertBefore(shapeBlock, visualsBody.firstElementChild);
    }

    function addPerformanceModeButton() {
        if (document.getElementById('view-performance-status')) return;

        var viewMenu = null;
        var buttons = Array.from(document.querySelectorAll('.dropdown-parent > button'));
        buttons.some(function (button) {
            if ((button.textContent || '').trim().indexOf('View') === 0) {
                viewMenu = button.parentElement.querySelector('.dropdown-menu');
                return true;
            }
            return false;
        });

        if (!viewMenu) return;

        var divider = document.createElement('div');
        divider.className = 'border-t border-artifex-border my-1';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.onclick = window.togglePerformanceMode;
        btn.className = 'w-full text-left px-4 py-1.5 text-xs hover:bg-artifex-gray hover:text-white transition text-slate-300 flex items-center justify-between';
        btn.title = 'Reduce preview particles, glow, blur, and high-DPI rendering for faster editing.';
        btn.innerHTML = '<span>Low Performance Mode</span> <span id="view-performance-status" class="text-[9px] text-slate-500">OFF</span>';

        viewMenu.insertBefore(divider, viewMenu.lastElementChild);
        viewMenu.insertBefore(btn, viewMenu.lastElementChild);
    }

    function syncPerformanceModeUI() {
        var node = document.getElementById('view-performance-status');
        if (!node) return;
        var isLow = performanceMode === 'low';
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

    function applyPhase2UiPatch() {
        replaceTextInTextNodes(document.body);
        replaceTitleText();
        moveParticleShapeToVisuals();
        addPerformanceModeButton();
        syncPerformanceModeUI();
    }

    var previousOnload = window.onload;
    window.onload = function phase2OnloadWrapper(event) {
        if (typeof previousOnload === 'function') previousOnload.call(window, event);
        setTimeout(applyPhase2UiPatch, 0);
    };

    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(applyPhase2UiPatch, 0);
    });
})();
