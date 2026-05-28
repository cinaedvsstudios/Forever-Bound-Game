// Artifex Project Manager asset linking helpers
// Owns linking imported library/index items to the selected Flatplan node.

const NODE_LINK_KEYS_BY_MODE = Object.freeze({
  quests: { idKey: 'linkedQuestId', labelKey: 'linkedQuestName' },
  sidequests: { idKey: 'linkedSideQuestId', labelKey: 'linkedSideQuestName' },
  'scenes-screens': { idKey: 'linkedSceneId', labelKey: 'linkedSceneName' },
  puzzles: { idKey: 'linkedPuzzleId', labelKey: 'linkedPuzzleName' },
  'archetype-objects': { idKey: 'linkedArchetypeObjectId', labelKey: 'linkedArchetypeObjectName' },
  'archetype-effects': { idKey: 'linkedArchetypeEffectId', labelKey: 'linkedArchetypeEffectName' },
  assets: { idKey: 'linkedAssetId', labelKey: 'linkedAssetName' }
});

export function getSelectedProjectNode(stateManager) {
  return stateManager.selectedNodeId ? stateManager.getNode?.(stateManager.selectedNodeId) : null;
}

function getLinkConfig(modeId) {
  return NODE_LINK_KEYS_BY_MODE[modeId] || NODE_LINK_KEYS_BY_MODE.assets;
}

function ensureNodeLinks(node) {
  node.properties ||= {};
  if (!Array.isArray(node.properties.libraryLinks)) node.properties.libraryLinks = [];
  return node.properties.libraryLinks;
}

export function linkItemToSelectedNode({ stateManager, item, modeId }) {
  const node = getSelectedProjectNode(stateManager);
  if (!node || !item) return { ok: false, message: 'Select a Flatplan node first, then return here to link this item.' };

  const linkConfig = getLinkConfig(modeId);
  const links = ensureNodeLinks(node);
  const linkRecord = {
    modeId,
    itemId: item.id,
    itemName: item.name,
    itemType: item.type,
    sourceModule: item.sourceModule,
    file: item.file,
    linkedAt: new Date().toISOString()
  };

  const existingIndex = links.findIndex((link) => link.modeId === modeId && link.itemId === item.id);
  if (existingIndex >= 0) links[existingIndex] = linkRecord;
  else links.push(linkRecord);

  stateManager.updateNode?.(node.id, {
    properties: {
      [linkConfig.idKey]: item.id,
      [linkConfig.labelKey]: item.name,
      [`${modeId}LinkFile`]: item.file,
      libraryLinks: links
    }
  });

  return { ok: true, message: `Linked ${item.name} to ${node.properties?.name || node.id}.` };
}
