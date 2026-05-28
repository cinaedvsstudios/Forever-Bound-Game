import { UI_STORAGE_KEYS, escapeHtml, getById, readBooleanPreference, writeBooleanPreference } from './project-ui-helpers.js?v=0.1.30-preview-fix';

// Artifex Project Manager split-state preview UI
// Owns the optional JSON / split state preview panel and View menu label state.

export function createProjectJsonPreviewUI({
  stateManager,
  onRefresh
}) {
  let splitStatePreviewVisible = readBooleanPreference(UI_STORAGE_KEYS.splitStatePreviewVisible, false);
  let fallbackClickWired = false;

  function updateSplitPreviewMenuLabel() {
    const toggle = getById('toggleSplitStatePreview');
    if (!toggle) return;
    toggle.textContent = splitStatePreviewVisible ? 'Hide Split State Preview' : 'Show Split State Preview';
  }

  function renderJsonPreview() {
    const existing = getById('splitDataPreview');
    if (existing) existing.remove();
    updateSplitPreviewMenuLabel();
    if (!splitStatePreviewVisible) return;

    const panel = document.createElement('div');
    panel.id = 'splitDataPreview';
    panel.className = 'fixed bottom-5 right-5 z-[120] w-[420px] max-h-[360px] overflow-hidden bg-cardDark/95 backdrop-blur-md border border-projectGold/40 rounded-xl shadow-card-glow';
    panel.innerHTML = `
      <div class="flex items-center justify-between px-3 py-2 border-b border-[#2d2d42] bg-black/25">
        <div>
          <span class="text-xs font-bold text-projectGoldGlow block">Split State Preview</span>
          <span class="text-[9px] font-mono text-zinc-500">Live Project Manager state snapshot</span>
        </div>
        <div class="flex items-center gap-3">
          <button id="hideSplitStatePreviewBtn" class="text-[9px] font-mono text-zinc-500 hover:text-projectGoldGlow transition">hide</button>
          <button id="resetSplitStateBtn" class="text-[9px] font-mono text-zinc-500 hover:text-red-300 transition">reset</button>
        </div>
      </div>
      <pre class="p-3 text-[9px] leading-relaxed text-emerald-300 overflow-auto max-h-[290px]">${escapeHtml(JSON.stringify(stateManager.exportSnapshot(), null, 2))}</pre>
    `;
    document.body.appendChild(panel);
    panel.querySelector('#hideSplitStatePreviewBtn')?.addEventListener('click', () => {
      splitStatePreviewVisible = false;
      writeBooleanPreference(UI_STORAGE_KEYS.splitStatePreviewVisible, splitStatePreviewVisible);
      renderJsonPreview();
    });
    panel.querySelector('#resetSplitStateBtn')?.addEventListener('click', () => {
      stateManager.resetToDefaults();
      onRefresh?.();
      renderJsonPreview();
    });
  }

  function toggleSplitStatePreview() {
    splitStatePreviewVisible = !splitStatePreviewVisible;
    writeBooleanPreference(UI_STORAGE_KEYS.splitStatePreviewVisible, splitStatePreviewVisible);
    renderJsonPreview();
  }

  function wireSplitStatePreviewToggle({ closeMenus } = {}) {
    const button = getById('toggleSplitStatePreview');
    if (button && button.dataset.splitPreviewWired !== 'true') {
      button.dataset.splitPreviewWired = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleSplitStatePreview();
        closeMenus?.();
      });
    }

    if (!fallbackClickWired) {
      fallbackClickWired = true;
      document.addEventListener('click', (event) => {
        const target = event.target?.closest?.('#toggleSplitStatePreview');
        if (!target || target.dataset.splitPreviewWired === 'true') return;
        event.preventDefault();
        event.stopPropagation();
        toggleSplitStatePreview();
        closeMenus?.();
      });
    }

    updateSplitPreviewMenuLabel();
  }

  return {
    renderJsonPreview,
    toggleSplitStatePreview,
    updateSplitPreviewMenuLabel,
    wireSplitStatePreviewToggle
  };
}
