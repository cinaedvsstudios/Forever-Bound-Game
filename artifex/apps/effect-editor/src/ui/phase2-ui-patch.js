/*
 * Phase 2 live UI patch for the Artifex Effect Editor.
 *
 * Load this after the original inline editor script:
 * <script src="./src/ui/phase2-ui-patch.js"></script>
 *
 * This keeps Phase 2 small and reversible while the main index.html is still a giant file.
 * It will be folded into the final clean files when index.html is split properly.
 */
(function () {
    'use strict';

    var performanceMode = 'full';
    var brandLogoPath = '../../artifexlogo.png';
    var brandTitlePath = '../../artifextitle.png';

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

    function replaceHeaderBranding() {
        var header = document.querySelector('header');
        if (!header) return;

        var oldBrandBlock = header.querySelector('div.flex.items-center.gap-4');
        if (!oldBrandBlock || oldBrandBlock.dataset.fxBrandPatched === 'true') return;

        oldBrandBlock.dataset.fxBrandPatched = 'true';
        oldBrandBlock.className = 'flex items-center gap-3';
        oldBrandBlock.innerHTML = [
            '<img src="' + brandLogoPath + '" alt="Artifex logo" class="h-11 w-11 object-contain drop-shadow-[0_0_10px_rgba(158,1,206,0.55)]">',
            '<div class="flex flex-col justify-center min-w-0">',
            '  <img src="' + brandTitlePath + '" alt="Artifex" class="h-7 object-contain object-left max-w-[180px]">',
            '  <div class="flex items-center gap-2 mt-0.5">',
            '    <p class="text-[9px] text-artifex-goldMuted font-semibold tracking-wider uppercase font-serif">Visual Effects Editor</p>',
            '    <span class="bg-artifex-purpleAccent/20 border border-artifex-purpleAccent text-purple-200 text-[8px] font-bold px-1.5 py-0.5 rounded-full font-sans tracking-normal shadow-[0_2px_5px_rgba(0,0,0,0.6)]">v2.3.0 ALPHA</span>',
            '  </div>',
            '</div>'
        ].join('');
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

    function getDisplayValueNodeForSlider(slider) {
        if (!slider || !slider.id) return null;
        var id = slider.id.replace(/^param-/, 'val-');
        var direct = document.getElementById(id);
        if (direct) return direct;

        var container = slider.closest('div[title], .p-2, .p-2\.5, .space-y-2, .space-y-3, .space-y-4');
        if (!container) return null;
        return container.querySelector('[id^="val-"]');
    }

    function precisionFromStep(step) {
        var raw = String(step || '1');
        if (raw.indexOf('.') === -1) return 0;
        return raw.split('.')[1].length;
    }

    function formatNumberForSlider(value, slider) {
        var precision = precisionFromStep(slider.step);
        var numeric = Number(value);
        if (!Number.isFinite(numeric)) numeric = Number(slider.value || 0);
        if (precision <= 0) return String(Math.round(numeric));
        return String(Number(numeric.toFixed(precision)));
    }

    function clampValueForSlider(value, slider) {
        var min = slider.min === '' ? -Infinity : Number(slider.min);
        var max = slider.max === '' ? Infinity : Number(slider.max);
        var numeric = Number(value);
        if (!Number.isFinite(numeric)) return Number(slider.value || 0);
        return Math.min(max, Math.max(min, numeric));
    }

    function replaceDisplayWithNumber(displayNode, slider) {
        if (!displayNode || !slider || displayNode.tagName === 'INPUT') return displayNode;

        var input = document.createElement('input');
        input.type = 'number';
        input.id = displayNode.id;
        input.min = slider.min || '';
        input.max = slider.max || '';
        input.step = slider.step || '1';
        input.value = formatNumberForSlider(slider.value, slider);
        input.className = 'w-16 bg-artifex-dark border border-artifex-border rounded-md px-1 py-0.5 text-artifex-gold font-mono text-xs text-right focus:outline-none focus:border-artifex-purpleAccent shadow-inner';
        input.title = 'Click and type a value, then press Enter or leave the field.';
        displayNode.replaceWith(input);
        return input;
    }

    function bindSliderNumber(slider) {
        if (!slider || slider.dataset.fxNumberBound === 'true') return;
        var displayNode = getDisplayValueNodeForSlider(slider);
        if (!displayNode) return;

        var number = replaceDisplayWithNumber(displayNode, slider);
        if (!number || number.tagName !== 'INPUT') return;

        slider.dataset.fxNumberBound = 'true';
        number.dataset.fxNumberBound = 'true';

        var syncFromSlider = function () {
            number.value = formatNumberForSlider(slider.value, slider);
        };

        var syncFromNumber = function () {
            var next = clampValueForSlider(number.value, slider);
            slider.value = formatNumberForSlider(next, slider);
            number.value = formatNumberForSlider(next, slider);
            slider.dispatchEvent(new Event('input', { bubbles: true }));
            slider.dispatchEvent(new Event('change', { bubbles: true }));
        };

        slider.addEventListener('input', syncFromSlider);
        slider.addEventListener('change', syncFromSlider);
        number.addEventListener('change', syncFromNumber);
        number.addEventListener('blur', syncFromNumber);
        number.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') number.blur();
            if (event.key === 'Escape') {
                number.value = formatNumberForSlider(slider.value, slider);
                number.blur();
            }
        });

        syncFromSlider();
    }

    function bindAllSliderNumbers() {
        document.querySelectorAll('input[type="range"][id^="param-"]').forEach(bindSliderNumber);
    }

    function applyPhase2UiPatch() {
        replaceHeaderBranding();
        replaceTextInTextNodes(document.body);
        replaceTitleText();
        moveParticleShapeToVisuals();
        addPerformanceModeButton();
        syncPerformanceModeUI();
        bindAllSliderNumbers();
    }

    var previousOnload = window.onload;
    window.onload = function phase2OnloadWrapper(event) {
        if (typeof previousOnload === 'function') previousOnload.call(window, event);
        setTimeout(applyPhase2UiPatch, 0);
    };

    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(applyPhase2UiPatch, 0);
    });

    window.addEventListener('artifex:render', function () {
        setTimeout(bindAllSliderNumbers, 0);
    });

    setInterval(function () {
        bindAllSliderNumbers();
    }, 1500);
})();
