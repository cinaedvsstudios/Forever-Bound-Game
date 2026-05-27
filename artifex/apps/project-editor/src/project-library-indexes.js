// Artifex Project Manager library index adapter
// Normalizes imported library index files for the shared Asset Browser.

export const LIBRARY_INDEX_PATHS = Object.freeze({
  quests: ['quests/quest-index.json'],
  sidequests: ['sidequests/sidequest-index.json'],
  'scenes-screens': ['scenes/scene-index.json', 'screens/screen-index.json'],
  puzzles: ['puzzles/puzzle-index.json'],
  'archetype-objects': ['archetypes/object-index.json'],
  'archetype-effects': ['archetypes/effect-index.json'],
  assets: ['assets/asset-index.json']
});

const MODE_TYPE_LABELS = Object.freeze({
  quests: 'quest',
  sidequests: 'sidequest',
  'scenes-screens': 'scene/screen',
  puzzles: 'puzzle',
  'archetype-objects': 'archetype-object',
  'archetype-effects': 'archetype-effect',
  assets: 'asset'
});

function normalizePath(path = '') {
  return String(path || '').replaceAll('\\', '/').replace(/^\/+/, '').toLowerCase();
}

function getIndexStore(stateManager = {}) {
  return stateManager.state?.libraryIndexes || stateManager.libraryIndexes || {};
}

function getIndexByPath(stateManager, expectedPath) {
  const store = getIndexStore(stateManager);
  const wanted = normalizePath(expectedPath);
  return store[wanted] || store[expectedPath] || null;
}

function arrayFromAnyIndex(index) {
  if (!index) return [];
  if (Array.isArray(index)) return index;

  const preferredKeys = [
    'items',
    'records',
    'entries',
    'quests',
    'sidequests',
    'sideQuests',
    'scenes',
    'screens',
    'puzzles',
    'objects',
    'objectArchetypes',
    'effects',
    'effectArchetypes',
    'assets',
    'groups'
  ];

  for (const key of preferredKeys) {
    if (Array.isArray(index[key])) return index[key];
  }

  return Object.values(index).find(Array.isArray) || [];
}

function getName(item, fallbackId) {
  return item.name || item.title || item.label || item.displayName || item.caption || fallbackId || 'Untitled item';
}

function getId(item, modeId, number) {
  return item.id || item.assetId || item.sceneId || item.screenId || item.questId || item.sidequestId || item.sideQuestId || item.puzzleId || item.archetypeId || item.effectId || `${modeId}_imported_${number}`;
}

function getType(item, modeId, expectedPath) {
  if (item.type) return item.type;
  if (expectedPath.includes('/screens/')) return 'screen';
  if (expectedPath.includes('/scenes/')) return 'scene';
  return MODE_TYPE_LABELS[modeId] || modeId;
}

function normalizeItem(item, { modeId, sourcePath, sourceIndex, number }) {
  const id = getId(item, modeId, number);
  const file = item.file || item.path || item.sourceFile || item.href || sourcePath;

  return {
    id,
    type: getType(item, modeId, sourcePath),
    name: getName(item, id),
    sourceModule: item.sourceModule || item.owner || item.createdBy || sourceIndex?.sourceModule || sourceIndex?.owner || 'unknown',
    file,
    tags: Array.isArray(item.tags) ? item.tags : [],
    status: item.status || item.readiness || 'imported',
    description: item.description || item.summary || item.notes || '',
    raw: item
  };
}

export function getLibraryBrowserData(stateManager, modeId) {
  const expectedPaths = LIBRARY_INDEX_PATHS[modeId] || [];
  const indexes = expectedPaths
    .map((path) => ({ path, index: getIndexByPath(stateManager, path) }))
    .filter((entry) => Boolean(entry.index));

  const items = indexes.flatMap((entry) => {
    return arrayFromAnyIndex(entry.index).map((item, index) => normalizeItem(item, {
      modeId,
      sourcePath: entry.path,
      sourceIndex: entry.index,
      number: index + 1
    }));
  });

  return {
    modeId,
    expectedPaths,
    loadedPaths: indexes.map((entry) => entry.path),
    hasRealIndex: indexes.length > 0,
    items
  };
}

export function createEmptyIndex(path, projectId = 'project_unknown') {
  return {
    schemaVersion: 'artifex.libraryIndex.v1',
    projectId,
    sourcePath: path,
    items: []
  };
}
