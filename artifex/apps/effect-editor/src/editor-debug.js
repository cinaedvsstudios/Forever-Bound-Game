/*
 * Artifex Effect Editor debug panel.
 *
 * This is designed to be loaded after the live single-file editor. It injects a
 * Help-menu debug entry and records runtime errors, unhandled promise errors,
 * module import status, registry counts, canvas status, and localStorage state.
 */

const DEBUG_STATE = {
    errors: [],
    warnings: [],
    installedAt: new Date().toISOString()
};

function safeText(value) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value); }
    catch { return String(value); }
}

function pushDebugMessage(type, message, detail = '') {
    const entry = {
        type,
        message: safeText(message),
        detail: safeText(detail),
        time: new Date().toLocaleTimeString()
    };
    if (type === 'error') DEBUG_STATE.errors.push(entry);
    else DEBUG_STATE.warnings.push(entry);
    renderDebugPanel();
}

function collectDebugSnapshot() {
    const moduleRoot = window.ArtifexEffectEditorModules || null;
    const canvas = document.getElementById('fx-canvas');
    const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
    const baseRegistry = moduleRoot?.Library?.PRESETS_REGISTRY || window.PRESETS_REGISTRY || null;
    const compositeRegistry = moduleRoot?.Library?.COMPOSITES_REGISTRY || window.COMPOSITES_REGISTRY || null;

    let localStorageKeys = [];
    try {
        localStorageKeys = Object.keys(localStorage).filter((key) => key.startsWith('artifex'));
    } catch (error) {
        localStorageKeys = [`localStorage unavailable: ${error.message}`];
    }

    return {
        page: location.href,
        installedAt: DEBUG_STATE.installedAt,
        userAgent: navigator.userAgent,
        moduleBootstrapLoaded: !!moduleRoot,
        moduleGroups: moduleRoot ? Object.keys(moduleRoot) : [],
        baseEffectCategoryCount: baseRegistry ? Object.keys(baseRegistry).length : 0,
        compositePresetCount: Array.isArray(compositeRegistry) ? compositeRegistry.length : 0,
        canvasFound: !!canvas,
        canvasClientSize: canvasRect ? `${Math.round(canvasRect.width)} × ${Math.round(canvasRect.height)}` : 'missing',
        canvasBackingSize: canvas ? `${canvas.width} × ${canvas.height}` : 'missing',
        devicePixelRatio: window.devicePixelRatio || 1,
        dropdownCount: document.querySelectorAll('.dropdown-menu').length,
        layerRowCount: document.querySelectorAll('.layer-item').length,
        localStorageKeys,
        errorCount: DEBUG_STATE.errors.length,
        warningCount: DEBUG_STATE.warnings.length
    };
}

function ensureDebugPanel() {
    let panel = document.getElementById('artifex-debug-panel');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = 'artifex-debug-panel';
    panel.className = 'hidden fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm p-4 overflow-auto';
    panel.innerHTML = `
        <div class="mx-auto max-w-4xl rounded-2xl border border-artifex-border bg-artifex-panel shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden">
            <div class="flex items-center justify-between gap-3 border-b border-artifex-border bg-artifex-darkGray px-5 py-3">
                <div>
                    <h2 class="serif-font text-artifex-gold text-lg font-bold tracking-wide">Debug Console</h2>
                    <p class="text-[11px] text-artifex-goldMuted">Runtime status, browser errors, module import checks, and editor diagnostics.</p>
                </div>
                <div class="flex items-center gap-2">
                    <button id="artifex-debug-copy" class="rounded-full border border-artifex-border bg-artifex-gray px-3 py-1.5 text-xs text-artifex-gold hover:text-white">Copy Report</button>
                    <button id="artifex-debug-refresh" class="rounded-full border border-artifex-border bg-artifex-gray px-3 py-1.5 text-xs text-artifex-gold hover:text-white">Refresh</button>
                    <button id="artifex-debug-close" class="rounded-full border border-artifex-purpleAccent bg-artifex-purple px-3 py-1.5 text-xs text-white hover:bg-artifex-purpleAccent">Close</button>
                </div>
            </div>
            <div class="grid gap-4 p-5 md:grid-cols-[1fr_1fr]">
                <section class="rounded-xl border border-artifex-border bg-artifex-dark p-4">
                    <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-artifex-gold">System Snapshot</h3>
                    <pre id="artifex-debug-snapshot" class="max-h-[420px] overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-slate-200"></pre>
                </section>
                <section class="rounded-xl border border-artifex-border bg-artifex-dark p-4">
                    <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-artifex-gold">Errors & Warnings</h3>
                    <pre id="artifex-debug-errors" class="max-h-[420px] overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-slate-200"></pre>
                </section>
            </div>
        </div>
    `;

    document.body.appendChild(panel);

    panel.querySelector('#artifex-debug-close')?.addEventListener('click', closeDebugPanel);
    panel.querySelector('#artifex-debug-refresh')?.addEventListener('click', renderDebugPanel);
    panel.querySelector('#artifex-debug-copy')?.addEventListener('click', copyDebugReport);

    return panel;
}

function formatEntries(entries) {
    if (!entries.length) return 'No captured errors or warnings yet.';
    return entries.map((entry) => `[${entry.time}] ${entry.type.toUpperCase()}: ${entry.message}\n${entry.detail}`).join('\n\n');
}

function buildDebugReport() {
    const snapshot = collectDebugSnapshot();
    const messages = [...DEBUG_STATE.errors, ...DEBUG_STATE.warnings];
    return [
        'ARTIFEX EFFECT EDITOR DEBUG REPORT',
        '',
        'SNAPSHOT',
        JSON.stringify(snapshot, null, 2),
        '',
        'MESSAGES',
        formatEntries(messages)
    ].join('\n');
}

function renderDebugPanel() {
    const panel = document.getElementById('artifex-debug-panel');
    if (!panel) return;
    const snapshotNode = panel.querySelector('#artifex-debug-snapshot');
    const errorNode = panel.querySelector('#artifex-debug-errors');
    if (snapshotNode) snapshotNode.textContent = JSON.stringify(collectDebugSnapshot(), null, 2);
    if (errorNode) errorNode.textContent = formatEntries([...DEBUG_STATE.errors, ...DEBUG_STATE.warnings]);
}

function openDebugPanel() {
    const panel = ensureDebugPanel();
    panel.classList.remove('hidden');
    renderDebugPanel();
}

function closeDebugPanel() {
    document.getElementById('artifex-debug-panel')?.classList.add('hidden');
}

async function copyDebugReport() {
    const report = buildDebugReport();
    try {
        await navigator.clipboard.writeText(report);
        window.showToast?.('Debug report copied to clipboard.', 'success');
    } catch {
        const textarea = document.createElement('textarea');
        textarea.value = report;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        window.showToast?.('Debug report copied to clipboard.', 'success');
    }
}

function injectHelpMenuEntry() {
    const helpMenus = [...document.querySelectorAll('.dropdown-parent .dropdown-menu')];
    const helpMenu = helpMenus.find((menu) => menu.textContent.includes('Quick Start Guide') || menu.textContent.includes('About Artifex Studio'));
    if (!helpMenu || document.getElementById('artifex-debug-help-entry')) return;

    const divider = document.createElement('div');
    divider.className = 'border-t border-artifex-border my-1';

    const button = document.createElement('button');
    button.id = 'artifex-debug-help-entry';
    button.className = 'w-full text-left px-4 py-2 text-xs hover:bg-artifex-gray hover:text-white transition text-slate-300 flex items-center gap-2';
    button.innerHTML = '<span>🧪</span> Debug Console';
    button.title = 'Open module, canvas, localStorage, and runtime error diagnostics.';
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        openDebugPanel();
    });

    helpMenu.appendChild(divider);
    helpMenu.appendChild(button);
}

function installGlobalErrorHooks() {
    window.addEventListener('error', (event) => {
        pushDebugMessage('error', event.message || 'Unknown runtime error', `${event.filename || ''}:${event.lineno || ''}:${event.colno || ''}\n${event.error?.stack || ''}`);
    });

    window.addEventListener('unhandledrejection', (event) => {
        pushDebugMessage('error', 'Unhandled Promise Rejection', event.reason?.stack || event.reason || 'No reason provided');
    });

    const originalConsoleError = console.error.bind(console);
    console.error = (...args) => {
        pushDebugMessage('error', args.map(safeText).join(' '));
        originalConsoleError(...args);
    };

    const originalConsoleWarn = console.warn.bind(console);
    console.warn = (...args) => {
        pushDebugMessage('warning', args.map(safeText).join(' '));
        originalConsoleWarn(...args);
    };
}

export function installArtifexDebugPanel() {
    installGlobalErrorHooks();
    ensureDebugPanel();
    injectHelpMenuEntry();
    window.openArtifexDebugPanel = openDebugPanel;
    window.copyArtifexDebugReport = copyDebugReport;
    return { openDebugPanel, copyDebugReport, collectDebugSnapshot };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installArtifexDebugPanel);
} else {
    installArtifexDebugPanel();
}
