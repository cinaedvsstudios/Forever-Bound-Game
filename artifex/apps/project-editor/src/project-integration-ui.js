import { getLibraryBrowserData } from './project-library-indexes.js?v=0.1.31-tasks';
import { closeProjectMenus, getProjectStorageItem, setProjectStorageItem, wireLibraryMenuTargets, wireProjectMenuBehaviourOnce } from './project-menu-ui.js?v=0.1.31-tasks';
import { getSelectedProjectNode, linkItemToSelectedNode } from './project-asset-linking.js?v=0.1.31-tasks';

// Artifex Project Manager integration UI shell
// Owns Asset Browser workspace integration. Menu wiring and asset linking now live in focused modules.

const INTEGRATION_STORAGE_KEYS = Object.freeze({
  assetBrowserMode: 'artifex_project_asset_browser_mode'
});

const LIBRARY_MODES = Object.freeze([
  { id: 'quests', label: 'Quest Library', icon: 'scroll-text', file: 'quests/quest-index.json', owner: 'Quest Builder' },
  { id: 'sidequests', label: 'Side Quest Library', icon: 'git-branch', file: 'sidequests/sidequest-index.json', owner: 'Quest Builder' },
  { id: 'scenes-screens', label: 'Scenes/Screens Library', icon: 'layout-panel-top', file: 'scenes/scene-index.json + screens/screen-index.json', owner: 'Scene Editor' },
  { id: 'puzzles', label: 'Puzzle Library', icon: 'puzzle', file: 'puzzles/puzzle-index.json', owner: 'Puzzle Creator' },
  { id: 'archetype-objects', label: 'Archetype Object Library', icon: 'boxes', file: 'archetypes/object-index.json', owner: 'Archetype Object Creator' },
  { id: 'archetype-effects', label: 'Archetype Effect Library', icon: 'sparkles', file: 'archetypes/effect-index.json', owner: 'Effect Editor' },
  { id: 'assets', label: 'Asset Browser', icon: 'image', file: 'assets/asset-index.json', owner: 'Asset Library' }
]);

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderSelectedNodeBadge(stateManager) {
  const selectedNode = getSelectedProjectNode(stateManager);
  if (!selectedNode) {
    return `<span class="text-zinc-600">No Flatplan node selected</span>`;
  }

  return `<span class="text-projectGoldGlow">Selected node: ${escapeHtml(selectedNode.properties?.name || selectedNode.id)}</span>`;
}

function renderResultCard(item, activeMode) {
  return `
    <button data-library-item-id="${escapeHtml(item.id)}" class="text-left rounded-xl border border-[#2d2d42] bg-black/25 p-3 hover:border-projectGold/45 hover:bg-accentDark/20 transition">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-accentDark/40 border border-projectGold/25 flex items-center justify-center text-projectGoldGlow">
          <i data-lucide="${escapeHtml(activeMode.icon)}" class="w-5 h-5"></i>
        </div>
        <div class="min-w-0">
          <div class="text-xs font-bold text-zinc-200 truncate">${escapeHtml(item.name)}</div>
          <div class="text-[9px] font-mono text-zinc-600 truncate">${escapeHtml(item.id)}</div>
        </div>
      </div>
      <div class="mt-3 text-[10px] text-zinc-500 line-clamp-2">${escapeHtml(item.description || item.file || 'Imported library item')}</div>
      <div class="mt-3 flex items-center justify-between gap-2 text-[9px] font-mono">
        <span class="text-projectGoldGlow truncate">${escapeHtml(item.type)}</span>
        <span class="text-zinc-600 truncate">${escapeHtml(item.status)}</span>
      </div>
    </button>
  `;
}

function renderEmptyCards(activeMode, browserData) {
  return `
    <div class="col-span-full rounded-xl border border-dashed border-projectGold/25 bg-black/20 p-6 text-center">
      <div class="w-12 h-12 mx-auto rounded-xl bg-accentDark/30 border border-projectGold/25 flex items-center justify-center text-projectGoldGlow">
        <i data-lucide="${escapeHtml(activeMode.icon)}" class="w-6 h-6"></i>
      </div>
      <div class="mt-3 text-sm font-bold text-zinc-200">No imported ${escapeHtml(activeMode.label)} items yet</div>
      <p class="mt-1 text-xs text-zinc-500">Import a project ZIP or index file that contains: <span class="font-mono text-projectGoldGlow">${escapeHtml(browserData.expectedPaths.join(', '))}</span></p>
    </div>
  `;
}

function renderPreview({ preview, item, activeMode, stateManager }) {
  const selectedNode = getSelectedProjectNode(stateManager);
  preview.innerHTML = `
    <h3 class="text-sm font-bold text-projectGoldGlow mb-2">${escapeHtml(item.name)}</h3>
    <div class="rounded-lg border border-[#2d2d42] bg-black/30 p-3 text-[10px] font-mono text-zinc-500 space-y-1">
      <div>id: ${escapeHtml(item.id)}</div>
      <div>type: ${escapeHtml(item.type)}</div>
      <div>source: ${escapeHtml(item.sourceModule)}</div>
      <div>file: ${escapeHtml(item.file)}</div>
      <div>status: ${escapeHtml(item.status)}</div>
      <div>${selectedNode ? `target node: ${escapeHtml(selectedNode.properties?.name || selectedNode.id)}` : 'target node: none selected'}</div>
    </div>
    <p class="mt-3 text-xs text-zinc-500 leading-relaxed">${escapeHtml(item.description || 'No description available.')}</p>
    <button data-link-selected-item="${escapeHtml(item.id)}" class="mt-4 w-full px-3 py-2 rounded-lg border ${selectedNode ? 'border-projectGold/40 text-projectGoldGlow hover:bg-accentDark/50' : 'border-zinc-800 text-zinc-600 cursor-not-allowed'} text-xs transition" ${selectedNode ? '' : 'disabled'}>
      ${selectedNode ? 'Link to selected node' : 'Select a Flatplan node first'}
    </button>
    <p id="assetBrowserLinkStatus" class="mt-3 text-[10px] text-zinc-500 leading-relaxed"></p>
  `;

  preview.querySelector('[data-link-selected-item]')?.addEventListener('click', () => {
    const result = linkItemToSelectedNode({ stateManager, item, modeId: activeMode.id });
    const status = preview.querySelector('#assetBrowserLinkStatus');
    if (status) {
      status.textContent = result.message;
      status.className = `mt-3 text-[10px] leading-relaxed ${result.ok ? 'text-projectGoldGlow' : 'text-red-300'}`;
    }
  });
}

export function renderAssetBrowser({ stateManager, ui }) {
  const container = document.getElementById('assetBrowserWorkspace');
  if (!container) return;

  const activeModeId = getProjectStorageItem(INTEGRATION_STORAGE_KEYS.assetBrowserMode, 'assets');
  const activeMode = LIBRARY_MODES.find((mode) => mode.id === activeModeId) || LIBRARY_MODES.at(-1);
  const browserData = getLibraryBrowserData(stateManager, activeMode.id);
  const items = browserData.items;

  container.innerHTML = `
    <div class="h-full overflow-hidden p-5">
      <div class="h-full max-w-7xl mx-auto bg-cardDark/80 border border-projectGold/25 rounded-2xl shadow-card-glow overflow-hidden grid grid-cols-[76px_1fr]">
        <aside class="bg-black/25 border-r border-[#2d2d42] p-2 flex flex-col gap-2">
          ${LIBRARY_MODES.map((mode) => `
            <button data-asset-browser-mode="${escapeHtml(mode.id)}" title="${escapeHtml(mode.label)}" class="h-12 rounded-xl border ${mode.id === activeMode.id ? 'border-projectGold/70 bg-accentDark/60 text-projectGoldGlow' : 'border-zinc-800 bg-black/20 text-zinc-500 hover:text-projectGoldGlow hover:border-projectGold/40'} flex items-center justify-center transition">
              <i data-lucide="${escapeHtml(mode.icon)}" class="w-5 h-5"></i>
            </button>
          `).join('')}
        </aside>

        <section class="min-w-0 flex flex-col">
          <div class="px-5 py-4 border-b border-[#2d2d42] flex items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold text-zinc-100 tracking-wide">${escapeHtml(activeMode.label)}</h2>
              <p class="text-xs text-zinc-500">Owner: ${escapeHtml(activeMode.owner)} · Loaded: <span class="font-mono text-projectGoldGlow">${browserData.loadedPaths.length || 0}</span> / Expected: <span class="font-mono text-projectGoldGlow">${escapeHtml(browserData.expectedPaths.join(', '))}</span></p>
              <p class="mt-1 text-[10px] font-mono">${renderSelectedNodeBadge(stateManager)}</p>
            </div>
            <button data-return-flatplan class="px-3 py-2 rounded-lg border border-projectGold/30 text-xs text-projectGoldGlow hover:bg-accentDark/50 transition">Return to Flatplan</button>
          </div>

          <div class="p-4 border-b border-[#2d2d42] grid grid-cols-[1fr_auto_auto] gap-3">
            <input id="assetBrowserSearch" placeholder="Search ${escapeHtml(activeMode.label)}..." class="bg-black/40 border border-[#2d2d42] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-projectGold/50">
            <button class="px-3 py-2 rounded-lg border border-[#2d2d42] text-xs text-zinc-500 cursor-default">${items.length} item(s)</button>
            <button data-project-io-action="import" class="px-3 py-2 rounded-lg border border-projectGold/30 text-xs text-projectGoldGlow hover:bg-accentDark/50">Import ZIP / Index</button>
          </div>

          <div class="flex-1 grid grid-cols-[1fr_320px] min-h-0">
            <div class="p-5 overflow-y-auto">
              <div id="assetBrowserResults" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                ${items.length ? items.map((item) => renderResultCard(item, activeMode)).join('') : renderEmptyCards(activeMode, browserData)}
              </div>
            </div>
            <aside id="assetBrowserPreview" class="border-l border-[#2d2d42] bg-black/20 p-4 overflow-y-auto">
              <h3 class="text-sm font-bold text-projectGoldGlow mb-2">Preview / Details</h3>
              <p class="text-xs text-zinc-500 leading-relaxed">Select an imported item to preview its metadata. To link it, first select a Flatplan node, then return to this browser.</p>
              <div class="mt-4 rounded-lg border border-[#2d2d42] bg-black/30 p-3 text-[10px] font-mono text-zinc-500 space-y-1">
                <div>mode: ${escapeHtml(activeMode.id)}</div>
                <div>owner: ${escapeHtml(activeMode.owner)}</div>
                <div>loaded paths: ${escapeHtml(browserData.loadedPaths.join(', ') || 'none')}</div>
                <div>status: ${browserData.hasRealIndex ? 'real imported index' : 'waiting for index import'}</div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-asset-browser-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      setProjectStorageItem(INTEGRATION_STORAGE_KEYS.assetBrowserMode, button.dataset.assetBrowserMode || 'assets');
      renderAssetBrowser({ stateManager, ui });
    });
  });

  container.querySelector('[data-return-flatplan]')?.addEventListener('click', () => ui?.setWorkspace?.('flatplan'));

  container.querySelectorAll('[data-library-item-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = items.find((candidate) => candidate.id === button.dataset.libraryItemId);
      const preview = container.querySelector('#assetBrowserPreview');
      if (!item || !preview) return;
      renderPreview({ preview, item, activeMode, stateManager });
    });
  });

  container.querySelector('#assetBrowserSearch')?.addEventListener('input', (event) => {
    const term = event.target.value.trim().toLowerCase();
    container.querySelectorAll('[data-library-item-id]').forEach((card) => {
      const item = items.find((candidate) => candidate.id === card.dataset.libraryItemId);
      const haystack = `${item?.id || ''} ${item?.name || ''} ${item?.type || ''} ${item?.file || ''}`.toLowerCase();
      card.classList.toggle('hidden', term && !haystack.includes(term));
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

export function createAssetBrowserRenderer({ stateManager, getUI }) {
  return () => renderAssetBrowser({ stateManager, ui: getUI?.() });
}

export function wireProjectIntegrationControls({ ui }) {
  wireProjectMenuBehaviourOnce();
  wireLibraryMenuTargets({ ui, storageKey: INTEGRATION_STORAGE_KEYS.assetBrowserMode });
}

export { closeProjectMenus };
