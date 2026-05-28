import { escapeHtml } from './project-ui-helpers.js?v=0.1.27-sidebar';

// Artifex Project Manager sidebar/catalog UI
// Owns the Flatplan Catalog and add-node behaviour.

export function renderProjectCatalog({ sidebar, stateManager, getTypeStyle, onRefresh }) {
  if (!sidebar) return;

  const placeholders = stateManager.catalog.placeholders;
  const realAssets = stateManager.catalog.realAssets;

  const placeholderCards = placeholders.map((item) => {
    const style = getTypeStyle(item.type);
    return `
      <button class="bg-black/25 hover:bg-accentDark/40 border border-projectGold/20 hover:border-projectGold/60 p-2 rounded text-left transition" data-catalog-type="${escapeHtml(item.type)}">
        <i data-lucide="${escapeHtml(style.icon || item.icon || 'box')}" class="w-4 h-4 mb-1 ${escapeHtml(style.color)}"></i>
        <span class="text-[11px] font-semibold text-zinc-200 block truncate">${escapeHtml(item.label)}</span>
      </button>
    `;
  }).join('');

  const realAssetCards = realAssets.map((item) => `
    <div class="flex items-center space-x-3 bg-black/25 hover:bg-black/50 border border-zinc-800 hover:border-projectGold/50 p-2 rounded transition">
      <div class="w-10 h-10 bg-accentDark/40 rounded flex items-center justify-center border border-projectGold/20">
        <i data-lucide="${escapeHtml(item.icon || 'image')}" class="w-5 h-5 text-projectGoldGlow"></i>
      </div>
      <div class="flex-1 min-w-0">
        <span class="text-xs font-semibold text-zinc-200 block truncate">${escapeHtml(item.name)}</span>
        <span class="text-[9px] text-zinc-500 block truncate">${escapeHtml(item.file)}</span>
      </div>
    </div>
  `).join('');

  sidebar.innerHTML = `
    <div class="border border-[#2d2d42] rounded-lg overflow-hidden bg-cardDark">
      <button class="w-full flex items-center justify-between p-3 bg-black/25 font-semibold text-sm hover:bg-black/40 transition text-zinc-200">
        <div class="flex items-center space-x-2">
          <i data-lucide="library" class="w-4 h-4 text-projectGoldGlow"></i>
          <span>Flatplan Catalog</span>
        </div>
      </button>
      <div class="p-3 border-t border-[#1d1d2b] space-y-3">
        <div>
          <div class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Placeholders</div>
          <div class="grid grid-cols-2 gap-2">${placeholderCards}</div>
        </div>
        <div>
          <div class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Real Assets</div>
          <div class="space-y-2">${realAssetCards}</div>
        </div>
      </div>
    </div>
  `;

  sidebar.querySelectorAll('[data-catalog-type]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.catalogType || 'Station';
      const camera = stateManager.camera;
      stateManager.addNode({
        type,
        position: {
          x: Math.round((180 - camera.panX) / camera.zoom + stateManager.logic.nodes.length * 24),
          y: Math.round((160 - camera.panY) / camera.zoom + stateManager.logic.nodes.length * 18)
        }
      });
      onRefresh?.();
    });
  });

  if (window.lucide) window.lucide.createIcons();
}
