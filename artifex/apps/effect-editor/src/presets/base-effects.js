/* Artifex Effect Editor base effect preset registry. */

/*
 * Temporary viewport guard for current inline editor script.
 * This protects startup from stale UI sizes and missing globals while the editor is
 * still mostly inline inside index.html. The consolidation pass should move this
 * into the editor bootstrap.
 */
var snapNode = document.getElementById('view-snap-status');
var helperIcon = document.getElementById('helper-toggle-icon');

(function () {
    'use strict';

    const UI_STATE_KEY = 'artifex_fx_editor_ui_state_v1';

    function clampNumber(value, min, max, fallback) {
        const number = Number(value);
        if (!Number.isFinite(number)) return fallback;
        return Math.max(min, Math.min(max, number));
    }

    function sanitizeStoredUiState() {
        try {
            const raw = JSON.parse(localStorage.getItem(UI_STATE_KEY) || '{}') || {};
            const maxSidebar = Math.max(260, Math.min(window.innerWidth - 360, 520));
            const maxLower = Math.max(160, Math.floor((window.innerHeight - 68) * 0.45));
            let changed = false;

            if (raw.sidebarWidth !== undefined) {
                const next = clampNumber(raw.sidebarWidth, 240, maxSidebar, 320);
                if (next !== raw.sidebarWidth) changed = true;
                raw.sidebarWidth = next;
            }

            if (raw.lowerPanelHeight !== undefined) {
                const next = clampNumber(raw.lowerPanelHeight, 140, maxLower, 220);
                if (next !== raw.lowerPanelHeight) changed = true;
                raw.lowerPanelHeight = next;
            }

            if (changed) localStorage.setItem(UI_STATE_KEY, JSON.stringify(raw));
        } catch (err) {
            try { localStorage.removeItem(UI_STATE_KEY); } catch (ignore) {}
        }
    }

    function forceSafePanelSizes() {
        const sidebar = document.getElementById('sidebar-panel');
        const lower = document.getElementById('lower-panel');
        const main = document.querySelector('main');
        const right = document.querySelector('section.bg-artifex-dark');

        if (sidebar && main) {
            const mainW = main.getBoundingClientRect().width || window.innerWidth;
            const current = sidebar.getBoundingClientRect().width || 320;
            const max = Math.max(260, mainW - 360);
            const next = clampNumber(current, 240, max, 320);
            sidebar.style.width = next + 'px';
            sidebar.style.minWidth = next + 'px';
        }

        if (lower && right) {
            const rightH = right.getBoundingClientRect().height || (window.innerHeight - 68);
            const current = lower.getBoundingClientRect().height || 220;
            const max = Math.max(160, Math.floor(rightH * 0.45));
            const next = clampNumber(current, 140, max, 220);
            lower.style.height = next + 'px';
            lower.style.minHeight = '140px';
        }
    }

    function canvasLooksBlank() {
        const cvs = document.getElementById('fx-canvas');
        if (!cvs || cvs.width < 10 || cvs.height < 10) return true;
        try {
            const context = cvs.getContext('2d');
            const samples = [
                [Math.floor(cvs.width * 0.5), Math.floor(cvs.height * 0.5)],
                [Math.floor(cvs.width * 0.35), Math.floor(cvs.height * 0.35)],
                [Math.floor(cvs.width * 0.65), Math.floor(cvs.height * 0.65)]
            ];
            return samples.every(([x, y]) => {
                const pixel = context.getImageData(x, y, 1, 1).data;
                return pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] === 0;
            });
        } catch (err) {
            return false;
        }
    }

    function installFallbackResizers() {
        if (window.__artifexFallbackResizersInstalled) return;
        window.__artifexFallbackResizersInstalled = true;

        const sideSplit = document.getElementById('sidebar-splitter');
        const canvasSplit = document.getElementById('canvas-splitter');
        const sidebar = document.getElementById('sidebar-panel');
        const lower = document.getElementById('lower-panel');
        const right = document.querySelector('section.bg-artifex-dark');
        let mode = null;
        let startX = 0;
        let startY = 0;
        let startW = 0;
        let startH = 0;

        function beginSide(event) {
            mode = 'side';
            startX = event.clientX;
            startW = sidebar ? sidebar.getBoundingClientRect().width : 320;
            document.body.style.cursor = 'col-resize';
            event.preventDefault();
        }

        function beginLower(event) {
            mode = 'lower';
            startY = event.clientY;
            startH = lower ? lower.getBoundingClientRect().height : 220;
            document.body.style.cursor = 'row-resize';
            event.preventDefault();
        }

        function move(event) {
            if (!mode) return;
            if (mode === 'side' && sidebar) {
                const max = Math.max(260, (document.querySelector('main')?.getBoundingClientRect().width || window.innerWidth) - 360);
                const next = clampNumber(startW + event.clientX - startX, 240, max, 320);
                sidebar.style.width = next + 'px';
                sidebar.style.minWidth = next + 'px';
            }
            if (mode === 'lower' && lower && right) {
                const max = Math.max(160, Math.floor((right.getBoundingClientRect().height || window.innerHeight) * 0.55));
                const next = clampNumber(startH + startY - event.clientY, 140, max, 220);
                lower.style.height = next + 'px';
                lower.style.minHeight = '140px';
            }
            if (typeof window.resizeCanvas === 'function') window.resizeCanvas();
            event.preventDefault();
        }

        function end() {
            if (!mode) return;
            mode = null;
            document.body.style.cursor = '';
            if (typeof window.resizeCanvas === 'function') window.resizeCanvas();
        }

        sideSplit?.addEventListener('mousedown', beginSide);
        canvasSplit?.addEventListener('mousedown', beginLower);
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', end);
    }

    function recoverViewport() {
        snapNode = document.getElementById('view-snap-status');
        helperIcon = document.getElementById('helper-toggle-icon');
        forceSafePanelSizes();
        installFallbackResizers();

        if (typeof window.resizeCanvas === 'function') {
            try { window.resizeCanvas(); } catch (err) { console.warn('Artifex fallback resize failed', err); }
        }

        if (canvasLooksBlank() && typeof window.tick === 'function' && !window.__artifexFallbackTickStarted) {
            window.__artifexFallbackTickStarted = true;
            try { window.tick(); } catch (err) { console.warn('Artifex fallback tick failed', err); }
        }
    }

    sanitizeStoredUiState();
    window.addEventListener('load', function () {
        sanitizeStoredUiState();
        setTimeout(recoverViewport, 120);
        setTimeout(recoverViewport, 700);
        setTimeout(recoverViewport, 1500);
    });
})();

(function () {
    'use strict';
    window.ARTIFEX_FX_PRESETS = {
        particles: [{ id: "electric-sparks", effectType: "particles", subType: "electric-sparks", name: "Base · Electric Sparks", description: "Fast additive spark particles with downward gravity and warm yellow-to-red glow.", tags: "base, particles, sparks, electric, warm, additive", emitter: { rate: 6, width: 2, widthUnit: "PX" }, physics: { speedMin: 4, speedMax: 10, angle: 270, spread: 55, gravityY: 0.28, friction: 0.98, orbitalForce: 0 }, visual: { sourceType: "shape", shapeMode: "shape", shape: "spark", sizeStart: 6, sizeEnd: 1, colors: ["#ffd23f", "#ee4266"], alphas: [1.0, 1.0], alphaStarts: [1.0, 0.8], alphaEnds: [0.65, 0.0], blur: 0, glow: 20, composite: "lighter" }, life: { durationMin: 25, durationMax: 50 } }],
        lightning: [{ id: "tesla-bolt", effectType: "lightning", subType: "tesla-bolt", name: "Base · Electric Discharge", description: "Short-lived blue-white spark particles with high glow and chaotic spread.", tags: "base, lightning, electric, blue, additive", emitter: { rate: 5, width: 2, widthUnit: "PX" }, physics: { speedMin: 6, speedMax: 12, angle: 90, spread: 360, gravityY: 0, friction: 0.9, orbitalForce: 0 }, visual: { sourceType: "shape", shapeMode: "shape", shape: "spark", sizeStart: 4, sizeEnd: 1, colors: ["#00a1d7", "#ffffff"], alphas: [1.0, 1.0], alphaStarts: [0.8, 1.0], alphaEnds: [0.4, 0.0], blur: 0, glow: 35, composite: "lighter" }, life: { durationMin: 10, durationMax: 20 } }],
        projectile: [{ id: "fireball", effectType: "projectile", subType: "fireball", name: "Base · Fireball Core", description: "Warm glowing projectile core travelling horizontally with a small floating lift.", tags: "base, projectile, fire, core, orange, additive", emitter: { rate: 8, width: 1, widthUnit: "PX" }, physics: { speedMin: 4, speedMax: 6, angle: 180, spread: 5, gravityY: -0.05, friction: 0.99, orbitalForce: 0 }, visual: { sourceType: "shape", shapeMode: "shape", shape: "circle", sizeStart: 12, sizeEnd: 2, colors: ["#ef4444", "#ffd23f"], alphas: [1.0, 1.0], alphaStarts: [0.9, 1.0], alphaEnds: [0.35, 0.0], blur: 0, glow: 30, composite: "lighter" }, life: { durationMin: 20, durationMax: 40 } }],
        lensflare: [{ id: "anamorphic-streak", effectType: "lensflare", subType: "anamorphic-streak", name: "Base · Lens Flare Spark", description: "Blue-white optical spark/glare placeholder. Needs final line/sprite flare tuning.", tags: "base, lensflare, flare, optical, blue, additive, needs-improvement", emitter: { rate: 2, width: 1, widthUnit: "PX" }, physics: { speedMin: 0.1, speedMax: 0.5, angle: 0, spread: 360, gravityY: 0, friction: 0.95, orbitalForce: 0 }, visual: { sourceType: "shape", shapeMode: "shape", shape: "star", sizeStart: 1, sizeEnd: 30, colors: ["#00a1d7", "#ffffff"], alphas: [1.0, 1.0], alphaStarts: [0.35, 0.75], alphaEnds: [0.0, 0.0], blur: 0, glow: 40, composite: "lighter" }, life: { durationMin: 20, durationMax: 45 } }]
    };
})();

(function () {
    'use strict';
    const THUMBNAIL_FOLDER = 'assets/archetype-thumbnails/';
    function safeId(value, fallback = 'fx-archetype') { return String(value || fallback).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || fallback; }
    function archetypeId() { return safeId(document.getElementById('comp-prop-id')?.value || document.getElementById('modal-variation-name')?.value || 'fx-archetype'); }
    function thumbName() { return archetypeId() + '.jpg'; }
    function thumbPath() { return THUMBNAIL_FOLDER + thumbName(); }
    function currentThumb() { const img = document.getElementById('comp-thumbnail-img'); return img && !img.classList.contains('hidden') && /^data:image\//.test(img.src || '') ? img.src : ''; }
    function downloadThumb() { const dataUrl = currentThumb(); if (!dataUrl) { if (typeof window.showToast === 'function') window.showToast('Capture a thumbnail first.', 'error'); return; } const a = document.createElement('a'); a.href = dataUrl; a.download = thumbName(); document.body.appendChild(a); a.click(); a.remove(); if (typeof window.showToast === 'function') window.showToast('Thumbnail downloaded as ' + thumbName() + '. Put it in ' + THUMBNAIL_FOLDER, 'success'); }
    function installThumbButton() { const panel = document.getElementById('comp-thumbnail-panel'); if (!panel || document.getElementById('download-archetype-thumbnail')) return; const button = document.createElement('button'); button.id = 'download-archetype-thumbnail'; button.type = 'button'; button.className = 'w-full py-1.5 bg-artifex-gray hover:bg-artifex-darkGray text-artifex-gold transition rounded-lg text-[10px] font-semibold border border-artifex-border focus:outline-none'; button.title = 'Download the captured JPEG as the current archetype ID'; button.textContent = '💾 Save Thumbnail JPG'; button.addEventListener('click', downloadThumb); panel.appendChild(button); }
    window.ArtifexThumbnailFilenameHelper = { folder: THUMBNAIL_FOLDER, thumbnailFileName: thumbName, thumbnailRepoPath: thumbPath, downloadCurrentThumbnail: downloadThumb, installThumbnailFilenameHelper: installThumbButton };
    window.addEventListener('load', function () { setTimeout(installThumbButton, 80); });
})();

(function () {
    'use strict';
    function prettyName(key) { return ({ particles: 'Standard Particle', lightning: 'Electric Discharge', projectile: 'Projectile Core', lensflare: 'Lens Flare / Optic' })[key] || (key.charAt(0).toUpperCase() + key.slice(1) + ' Engine'); }
    function addText(node, text, className) { const span = document.createElement('span'); span.textContent = text; if (className) span.className = className; node.appendChild(span); return span; }
    function restoreInsertMenuLayout() {
        const baseAcc = document.getElementById('acc-base');
        const compAcc = document.getElementById('acc-comp');
        const customAcc = document.getElementById('acc-cust');
        if (!baseAcc || !compAcc) return;
        const registry = window.ARTIFEX_FX_PRESETS || {};
        const keys = Object.keys(registry).filter(key => Array.isArray(registry[key]) && registry[key].length);
        baseAcc.innerHTML = '';
        if (!keys.length) {
            const empty = document.createElement('div');
            empty.className = 'text-center py-2 text-rose-300 text-[10px] italic';
            empty.textContent = 'Base preset registry did not load.';
            baseAcc.appendChild(empty);
        } else {
            keys.forEach(key => {
                const preset = registry[key][0] || {};
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'w-full text-left px-3 py-1.5 rounded hover:bg-artifex-dark text-gray-300 hover:text-white transition flex flex-col focus:outline-none shadow-sm border border-transparent hover:border-artifex-border/50';
                btn.title = preset.description || 'Add base layer';
                const row = document.createElement('div'); row.className = 'flex justify-between gap-2 items-center w-full';
                addText(row, '+ ' + prettyName(key), 'font-bold text-[10px] text-artifex-gold truncate');
                addText(row, 'Base', 'text-[8px] bg-artifex-purple/40 px-1 rounded text-purple-100 shrink-0');
                btn.appendChild(row);
                addText(btn, preset.name || key, 'text-[8px] text-gray-500 line-clamp-1');
                btn.addEventListener('click', function () { if (typeof window.selectEngineCategory === 'function') window.selectEngineCategory(key); });
                baseAcc.appendChild(btn);
            });
        }
        compAcc.classList.remove('hidden');
        compAcc.innerHTML = '';
        const lib = document.createElement('button');
        lib.type = 'button';
        lib.className = 'w-full text-left px-3 py-2 rounded-xl hover:bg-artifex-dark text-emerald-200 hover:text-white transition flex justify-between items-center focus:outline-none shadow-sm border border-emerald-900/50 bg-emerald-950/20';
        addText(lib, 'Open Effect Archetype', 'font-bold text-[10px] text-emerald-300');
        addText(lib, 'LIBRARY', 'text-[8px] bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-100');
        lib.addEventListener('click', function () { if (typeof window.openArchetypeAssetsModal === 'function') window.openArchetypeAssetsModal(); if (typeof window.closeAllDropdowns === 'function') window.closeAllDropdowns(); });
        compAcc.appendChild(lib);
        const customButton = customAcc?.previousElementSibling;
        if (customButton) customButton.classList.add('hidden');
        if (customAcc) customAcc.classList.add('hidden');
        const badge = Array.from(document.querySelectorAll('span')).find(node => /v2\.3\./.test(node.textContent || ''));
        if (badge) badge.textContent = 'v2.3.6 ALPHA';
    }
    window.ArtifexInsertMenuGuard = { restoreInsertMenuLayout };
    window.addEventListener('load', function () { setTimeout(restoreInsertMenuLayout, 90); setTimeout(restoreInsertMenuLayout, 400); });
})();
