import { UI_STORAGE_KEYS, escapeHtml, getById, readBooleanPreference, writeBooleanPreference } from './project-ui-helpers.js?v=0.1.29-json-preview';

// Artifex Project Manager split-state preview UI
// Owns the optional JSON / split state preview panel and View menu label state.

export function createProjectJsonPreviewUI({
  canvasElement,
  stateManager,
  onRefresh
}) {
  let splitStatePreviewVisible = readBooleanPreference(UI_STORAGE_KEYS.splitStatePreviewVisible, false);

  function getCanvas() {
    return canvasElement || getById('flatplanCanvas');
  }

  function updateSplitPreviewMenuLabel() {
    const toggle = getById('toggleSplitStatePreview');
    if (!toggle) return;
    toggle.textContent = splitStatePreviewVisible ? 'Hide Split State Preview' : 'Show Split State Preview';
  }

  function renderJsonPreview() {
    const existing = getById('splitDataPreview');
    if (existing) existing.remove();
    updateSplitPreviewMenuLabel();
    const canvas = getCanvas();
    if (!canvas || !splitStatePreviewVisible) return;

    const panel = document.createElement('div');
    panel.id = 'splitDataPreview';
    panel.className = 'absolute bottom-4 right-4 z-30 w-[360px] max-h-[280px] overflow-hidden bg-cardDark/85 backdrop-blur-md border border-projectGold/30 rounded-lg shadow-card-glow';
    panel.innerHTML = `
      <div class="flex items-center justify-between px-3 py-2 border-b border-[#2d2d42]">
        <span class="text-xs font-bold text-projectGoldGlow">Split State Preview</span>
        <div class="flex items-center gap-3">
          <button id="hideSplitStatePreviewBtn" class="text-[9px] font-mono text-zinc-500 hover:text-projectGoldGlow transition">hide</button>
          <button id="resetSplitStateBtn" class="text-[9px] font-mono text-zinc-500 hover:text-projectGoldGlow transition">reset</button>
        </div>
      </div>
      <pre class="p-3 text-[9px] leading-relaxed text-emerald-300 overflow-auto max-h-[220px]">${escapeHtml(JSON.stringify(stateManager.exportSnapshot(), null, 2))}</pre>
    `;
    canvas.appendChild(panel);
    panel.querySelector('#hideSplitStatePreviewBtn')?.addEventListener('click', () => {
      splitStatePreviewVisible = false;
      writeBooleanPreference(UI_STORAGE_KEYS.splitStatePreviewVisible, splitStatePreviewVisible);
      renderJsonPreview();
    });
    panel.querySelector('#resetSplitStateBtn')?.addEventListener('click', () => {
      stateManager.resetToDefaults();
      onRefresh?.();
    });
  }

  function toggleSplitStatePreview() {
    splitStatePreviewVisible = !splitStatePreviewVisible;
    writeBooleanPreference(UI_STORAGE_KEYS.splitStatePreviewVisible, splitStatePreviewVisible);
    renderJsonPreview();
  }

  return {
    renderJsonPreview,
    toggleSplitStatePreview,
    updateSplitPreviewMenuLabel
  };
}
