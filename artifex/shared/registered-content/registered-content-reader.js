// Artifex shared registered-content reader
//
// Reads only final project-backed indexes defined by the Artifex project-file contract.
// It deliberately does not treat intake files, browser-only uploads, or the legacy
// artifex/assets-library catalogue as completed project links.

export const REGISTERED_CONTENT_STATUS = Object.freeze({
  READY: 'ready',
  EMPTY: 'empty',
  PARTIALLY_REJECTED: 'partially-rejected',
  INVALID_INDEX: 'invalid-index',
  INDEX_NOT_FOUND: 'index-not-found',
  READER_UNAVAILABLE: 'reader-unavailable',
  READ_FAILED: 'read-failed'
});

export const REGISTERED_CONTENT_DEFINITIONS = Object.freeze({
  assets: Object.freeze({
    kind: 'assets',
    label: 'Final Assets',
    indexPath: 'assets/asset-index.json',
    schemaVersion: 'artifex.assets.index.v1',
    collection: 'assets',
    idPrefix: 'asset_',
    recordPathPrefix: 'assets/',
    referenceKey: 'assetId',
    emptyMessage: 'No final registered assets are available in this project yet.'
  }),
  'archetype-objects': Object.freeze({
    kind: 'archetype-objects',
    label: 'Archetype Objects',
    indexPath: 'archetypes/object-index.json',
    schemaVersion: 'artifex.archetypes.objects.index.v1',
    collection: 'objects',
    idPrefix: 'archobj_',
    recordPathPrefix: 'archetypes/objects/',
    referenceKey: 'archetypeObjectId',
    emptyMessage: 'No registered Archetype Objects are available in this project yet.'
  }),
  'archetype-effects': Object.freeze({
    kind: 'archetype-effects',
    label: 'Archetype Effects',
    indexPath: 'archetypes/effect-index.json',
    schemaVersion: 'artifex.archetypes.effects.index.v1',
    collection: 'effects',
    idPrefix: 'archeffect_',
    recordPathPrefix: 'archetypes/effects/',
    referenceKey: 'archetypeEffectId',
    emptyMessage: 'No registered Archetype Effects are available in this project yet.'
  })
});

const BLOCKED_PATH_PREFIXES = Object.freeze(['intake/', 'artifex/assets-library/']);
const NON_PROJECT_REFERENCE_PATTERN = /^(?:blob:|data:|file:|https?:|\/)/iu;

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return String(value ?? '').trim();
}

function normalizePath(value) {
  return text(value).replaceAll('\\', '/').replace(/^\.\//u, '');
}

function getRecordPath(record = {}) {
  return normalizePath(record.file || record.path || record.exportTarget || record.fileRef || '');
}

function getRecordId(record = {}) {
  return text(record.id || record.assetId || record.archetypeId || record.effectId);
}

function readErrorCode(error) {
  return error?.name || error?.code || '';
}

export function getRegisteredContentDefinition(kind) {
  const definition = REGISTERED_CONTENT_DEFINITIONS[kind];
  if (!definition) throw new Error(`Unknown registered-content kind: ${kind}.`);
  return definition;
}

export function validateRegisteredContentRecord(kind, record = {}) {
  const definition = getRegisteredContentDefinition(kind);
  const id = getRecordId(record);
  const path = getRecordPath(record);
  const errors = [];

  if (!id) errors.push('Record has no stable ID.');
  else if (!id.startsWith(definition.idPrefix)) errors.push(`ID must start with ${definition.idPrefix}.`);

  if (!path) {
    errors.push(`Record has no final project-relative file path under ${definition.recordPathPrefix}.`);
  } else {
    if (NON_PROJECT_REFERENCE_PATTERN.test(path)) errors.push('Record points outside the connected project folder.');
    if (BLOCKED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) errors.push('Record points to staging or legacy unpromoted content.');
    if (!path.startsWith(definition.recordPathPrefix)) errors.push(`File path must be under ${definition.recordPathPrefix}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    id,
    path,
    kind,
    definition
  };
}

export function normalizeRegisteredContentRecord(kind, record = {}) {
  const validation = validateRegisteredContentRecord(kind, record);
  if (!validation.valid) return null;

  return {
    id: validation.id,
    kind,
    name: text(record.name || record.title || record.label || validation.id),
    type: text(record.type || record.category || kind),
    file: validation.path,
    tags: safeArray(record.tags).map((tag) => text(tag)).filter(Boolean),
    status: text(record.status || record.readiness || 'registered'),
    description: text(record.description || record.summary || record.notes),
    thumbnailAssetId: text(record.thumbnailAssetId || ''),
    raw: record
  };
}

export function buildRegisteredContentIndex(kind, indexValue) {
  const definition = getRegisteredContentDefinition(kind);
  const source = indexValue && typeof indexValue === 'object' ? indexValue : null;

  if (!source || source.schemaVersion !== definition.schemaVersion || !Array.isArray(source[definition.collection])) {
    return {
      kind,
      definition,
      path: definition.indexPath,
      status: REGISTERED_CONTENT_STATUS.INVALID_INDEX,
      items: [],
      rejected: [],
      message: `Expected ${definition.indexPath} with schema ${definition.schemaVersion} and a ${definition.collection} array.`
    };
  }

  const items = [];
  const rejected = [];
  for (const record of source[definition.collection]) {
    const validation = validateRegisteredContentRecord(kind, record);
    if (!validation.valid) {
      rejected.push({ id: validation.id || '(missing id)', errors: validation.errors, raw: record });
      continue;
    }
    items.push(normalizeRegisteredContentRecord(kind, record));
  }

  const status = rejected.length
    ? REGISTERED_CONTENT_STATUS.PARTIALLY_REJECTED
    : items.length
      ? REGISTERED_CONTENT_STATUS.READY
      : REGISTERED_CONTENT_STATUS.EMPTY;

  const message = status === REGISTERED_CONTENT_STATUS.EMPTY
    ? definition.emptyMessage
    : status === REGISTERED_CONTENT_STATUS.PARTIALLY_REJECTED
      ? `${items.length} registered item(s) available; ${rejected.length} invalid or unpromoted record(s) were excluded.`
      : `${items.length} registered item(s) available.`;

  return {
    kind,
    definition,
    path: definition.indexPath,
    projectId: text(source.projectId),
    status,
    items,
    rejected,
    message
  };
}

function resolveReadJson(readJson, projectFolderClient) {
  if (typeof readJson === 'function') return readJson;
  if (typeof projectFolderClient?.readJson === 'function') return projectFolderClient.readJson.bind(projectFolderClient);
  if (typeof window !== 'undefined' && typeof window.ArtifexProjectFolder?.readJson === 'function') {
    return window.ArtifexProjectFolder.readJson.bind(window.ArtifexProjectFolder);
  }
  return null;
}

export async function loadRegisteredContentIndex(kind, options = {}) {
  const definition = getRegisteredContentDefinition(kind);
  const readJson = resolveReadJson(options.readJson, options.projectFolderClient);
  if (!readJson) {
    return {
      kind,
      definition,
      path: definition.indexPath,
      status: REGISTERED_CONTENT_STATUS.READER_UNAVAILABLE,
      items: [],
      rejected: [],
      message: 'A connected project-folder reader is required before final registered content can be selected.'
    };
  }

  try {
    return buildRegisteredContentIndex(kind, await readJson(definition.indexPath));
  } catch (error) {
    const notFound = readErrorCode(error) === 'NotFoundError';
    return {
      kind,
      definition,
      path: definition.indexPath,
      status: notFound ? REGISTERED_CONTENT_STATUS.INDEX_NOT_FOUND : REGISTERED_CONTENT_STATUS.READ_FAILED,
      items: [],
      rejected: [],
      message: notFound
        ? `${definition.indexPath} does not exist in the connected project.`
        : `Unable to read ${definition.indexPath}: ${error?.message || String(error)}`,
      error
    };
  }
}

export async function loadAllRegisteredContent(options = {}) {
  const kinds = safeArray(options.kinds).length ? options.kinds : Object.keys(REGISTERED_CONTENT_DEFINITIONS);
  const results = await Promise.all(kinds.map((kind) => loadRegisteredContentIndex(kind, options)));
  return Object.fromEntries(results.map((result) => [result.kind, result]));
}

export function searchRegisteredContent(indexResult, query = '') {
  const term = text(query).toLowerCase();
  if (!term) return safeArray(indexResult?.items);
  return safeArray(indexResult?.items).filter((item) => [
    item.id,
    item.name,
    item.type,
    item.file,
    item.status,
    ...item.tags
  ].join(' ').toLowerCase().includes(term));
}

export function createRegisteredReference(kind, item) {
  const definition = getRegisteredContentDefinition(kind);
  const normalized = normalizeRegisteredContentRecord(kind, item?.raw || item);
  if (!normalized) throw new Error(`Cannot create a ${kind} reference from an invalid or unpromoted record.`);
  return {
    [definition.referenceKey]: normalized.id,
    referenceSource: definition.indexPath
  };
}
