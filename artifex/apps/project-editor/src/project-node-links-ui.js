// Artifex Project Manager node link inspector
// Shows and manages library links on the currently selected Flatplan node.

const NODE_LINK_KEYS_BY_MODE = Object.freeze({
  quests: { idKey: 'linkedQuestId', labelKey: 'linkedQuestName' },
  sidequests: { idKey: 'linkedSideQuestId', labelKey: 'linkedSideQuestName' },
  'scenes-screens': { idKey: 'linkedSceneId', labelKey: 'linkedSceneName' },
  puzzles: { idKey: 'linkedPuzzleId', labelKey: 'linkedPuzzleName' },
  'archetype-objects': { idKey: 'linkedArchetypeObjectId', labelKey: 'linkedArchetypeObjectName' },
  'archetype-effects': { idKey: 'linkedArchetypeEffectId', labelKey: 'linkedArchetypeEffectName' },
  assets: { idKey: 'linkedAssetId', labelKey: 'linkedAssetName' }
});

const MODE_LABELS = Object.freeze({
  quests: 'Quest',
  sidequests: 'Side Quest',
  'scenes-screens': 'Scene/Screen',
  puzzles: 'Puzzle',
  'archetype-objects': 'Archetype Object',
  'archetype-effects': 'Archetype Effect',
  assets: 'Asset'
});

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getSelectedNode(stateManager) {
  return stateManager.selectedNodeId ? stateManager.getNode?.(stateManager.selectedNodeId) : null;
}

function getNodeLinks(node) {
  return Array.isArray(node?.properties?.libraryLinks) ? node.properties.libraryLinks : [];
}

function renderLinks(node) {
  const links = getNodeLinks(node);

  if (!links.length) {
    return `
      <div class="rounded-lg border border-dashed border-projectGold/20 bg-black/20 p-3 text-[10px] text-zinc-500 leading-relaxed">
        No library items linked yet. Select this node, open a library, choose an item, then link it back here.
      </div>
    `;
  }

  return links.map((link) => `
    <div class="rounded-lg border border-[#2d2d42] bg-black/25 p-2 space-y-1" data-node-link-row="${escapeHtml(link.modeId)}:${escapeHtml(link.itemId)}">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="text-[10px] font-bold text-zinc-200 truncate">${escapeHtml(link.itemName || link.itemId)}</div>
          <div class="text-[9px] font-mono text-projectGoldGlow truncate">${escapeHtml(MODE_LABELS[link.modeId] || link.modeId)}</div>
        </div>
        <button data-unlink-node-item="${escapeHtml(link.modeId)}:${escapeHtml(link.itemId)}" class="text-[9px] text-zinc-600 hover:text-red-300 transition">unlink</button>
      </div>
      <div class="text-[9px] font-mono text-zinc-600 truncate">${escapeHtml(link.file || link.itemType || '')}</div>
    </div>
  `).join('');
}

function removeNodeLink({ stateManager, node, token }) {
  const [modeId, itemId] = String(token || '').split(':');
  if (!modeId || !itemId || !node?.properties) return;

  const linkConfig = NODE_LINK_KEYS_BY_MODE[modeId];
  node.properties.libraryLinks = getNodeLinks(node).filter((link) => !(link.modeId === modeId && link.itemId === itemId));

  if (linkConfig && node.properties[linkConfig.idKey] === itemId) {
    delete node.properties[linkConfig.idKey];
    delete node.properties[linkConfig.labelKey];
    delete node.properties[`${modeId}LinkFile`];
  }

  stateManager.saveToStorage?.();
}

export function renderNodeLinksInspectorSection({ ui, stateManager }) {
  const node = getSelectedNode(stateManager);
  if (!node) return;

  const panel = document.getElementById('splitInspectorPreview');
  if (!panel || panel.querySelector('[data-node-links-panel]')) return;

  const footer = Array.from(panel.children).find((child) => child.classList?.contains('border-t')) || null;
  const section = document.createElement('div');
  section.setAttribute('data-node-links-panel', 'true');
  section.className = 'px-3 pb-3 space-y-2';
  section.innerHTML = `
    <div class="flex items-center justify-between gap-2 pt-1">
      <div class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Linked Libraries</div>
      <button data-open-node-link-browser class="text-[9px] font-mono text-projectGoldGlow hover:text-projectParchment transition">open browser</button>
    </div>
    <div class="space-y-2">${renderLinks(node)}</div>
  `;

  if (footer) panel.insertBefore(section, footer);
  else panel.appendChild(section);

  section.querySelector('[data-open-node-link-browser]')?.addEventListener('click', () => ui.setWorkspace?.('assetbrowser'));
  section.querySelectorAll('[data-unlink-node-item]').forEach((button) => {
    button.addEventListener('click', () => {
      removeNodeLink({ stateManager, node, token: button.dataset.unlinkNodeItem });
      ui.renderInspectorPreview?.();
      ui.renderJsonPreview?.();
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

export function createNodeLinksInspectorExtension({ stateManager, getUI }) {
  return () => renderNodeLinksInspectorSection({ ui: getUI?.(), stateManager });
}
