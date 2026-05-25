/*
 * Artifex Effect Editor UI helper extraction target.
 *
 * Split stage 3: pure UI helper definitions only. The live editor still uses
 * the proven inlined functions in index.html until the wiring pass is tested.
 */

export const VIEW_FEATURE_IDS = Object.freeze([
    'emitter-follow-mouse',
    'show-emitter-hud',
    'collision-bounce'
]);

export function setHidden(element, hidden = true) {
    if (!element) return;
    if (hidden) element.classList.add('hidden');
    else element.classList.remove('hidden');
}

export function toggleHidden(element) {
    if (!element) return false;
    element.classList.toggle('hidden');
    return !element.classList.contains('hidden');
}

export function closeDropdownMenus(root = document) {
    root.querySelectorAll('.dropdown-menu').forEach((menu) => menu.classList.add('hidden'));
    root.querySelectorAll('.dropdown-parent button').forEach((button) => {
        button.classList.remove('bg-artifex-purpleAccent/25', 'border-artifex-purpleAccent', 'text-white');
    });
}

export function setAccordionOpen(contentElement, iconElement, isOpen) {
    if (!contentElement) return;
    setHidden(contentElement, !isOpen);
    if (iconElement) iconElement.innerText = isOpen ? '▼' : '▶';
}

export function formatEngineLabel(effectType = '') {
    return String(effectType || 'unknown').toUpperCase();
}

export function formatParticleCount(count = 0) {
    const value = Number(count);
    return Number.isFinite(value) ? String(Math.max(0, Math.round(value))) : '0';
}

export function sanitizeIdLabel(value = '') {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'custom-fx';
}
