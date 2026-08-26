// Artifex shared Asset Library service helpers
//
// Owns final media/generated-media asset-index operations only. This module must not
// register scenes, puzzles, quests, effects, archetype objects, routes, portals, or templates.

export const ASSET_INDEX_PATH = 'assets/asset-index.json';
export const ASSET_INDEX_SCHEMA = 'artifex.assets.index.v1';

export const MEDIA_ASSET_TYPES = Object.freeze([
  'image',
  'sprite',
  'portrait',
  'background',
  'ui-image',
  'texture',
  'overlay',
  'brush',
  'thumbnail',
  'video',
  'animated-image',
  'audio',
  'music',
  'voice',
  'sound',
  'sound-effect'
]);

export const MEDIA_ASSET_KINDS = Object.freeze([
  'image',
  'sprite',
  'portrait',
  'background',
  'ui-image',
  'icon',
  'button',
  'frame',
  'logo',
  'texture',
  'overlay',
  'brush',
  'thumbnail',
  'video',
  'animated-image',
  'audio',
  'music',
  'voice',
  'sound',
  'sound-effect',
  'imported-audio',
  'procedural-synth',
  'generated-mechanical-sound',
  'object-frame'
]);

const NON_AUDIO_TYPES = new Set(MEDIA_ASSET_TYPES.filter((type) => !['audio', 'music', 'voice', 'sound', 'sound-effect'].includes(type)));
const NON_AUDIO_KINDS = new Set(MEDIA_ASSET_KINDS.filter((kind) => !['audio', 'music', 'voice', 'sound', 'sound-effect', 'imported-audio', 'procedural-synth', 'generated-mechanical-sound'].includes(kind)));
const BLOCKED_FINAL_PREFIXES = Object.freeze(['intake/', 'artifex/assets-library/']);
const NON_PROJECT_REFERENCE_PATTERN = /^(?:blob:|data:|file:|https?:|\/)/iu;
const AUTHORED_RECORD_PREFIX_PATTERN = /^(?:archobj|archeffect|scene|screen|puzzle|quest|sidequest|route|portal|template|group)_/iu;

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return String(value ?? '').trim();
}

function normalizePath(value) {
  return text(value).replaceAll('\\', '/').replace(/^\.\//u, '');
}

function isoNow(now = new Date()) {
  return now instanceof Date ? now.toISOString() : text(now) || new Date().toISOString();
}

function uniqueStrings(values) {
  return Array.from(new Set(safeArray(values).map(text).filter(Boolean)));
}

function normalizeAssetTaxonomy(value, fallback = 'image') {
  return text(value || fallback).toLowerCase();
}

export function safeAssetSlug(value, fallback = 'asset') {
  return text(value || fallback)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '_')
    .replace(/^_+|_+$/gu, '')
    .slice(0, 64) || fallback;
}

export function createEmptyAssetIndex(projectId = 'project_unknown') {
  return {
    schemaVersion: ASSET_INDEX_SCHEMA,
    projectId: text(projectId) || 'project_unknown',
    assets: []
  };
}

export function validateAssetIndexShape(indexValue) {
  const errors = [];
  if (!indexValue || typeof indexValue !== 'object' || Array.isArray(indexValue)) errors.push(`${ASSET_INDEX_PATH} must be a JSON object.`);
  if (indexValue?.schemaVersion !== ASSET_INDEX_SCHEMA) errors.push(`Expected schemaVersion ${ASSET_INDEX_SCHEMA}.`);
  if (!Array.isArray(indexValue?.assets)) errors.push('Expected an assets array.');
  return { valid: errors.length === 0, errors };
}

export function validateFinalAssetPath(pathValue) {
  const path = normalizePath(pathValue);
  const errors = [];
  if (!path) errors.push('Final asset file path is required.');
  if (NON_PROJECT_REFERENCE_PATTERN.test(path)) errors.push('Final asset file path must be project-relative, not a data/blob/file/http/absolute reference.');
  if (BLOCKED_FINAL_PREFIXES.some((prefix) => path.startsWith(prefix))) errors.push('Final asset file path must not point to intake staging or the legacy artifex/assets-library catalogue.');
  if (path && !path.startsWith('assets/')) errors.push('Final asset file path must be under assets/.');
  return { valid: errors.length === 0, errors, path };
}

export function validateStagedMediaPath(pathValue) {
  const path = normalizePath(pathValue);
  const errors = [];
  if (!path) errors.push('Source staged media path is required.');
  if (NON_PROJECT_REFERENCE_PATTERN.test(path)) errors.push('Source staged media path must be project-relative, not a data/blob/file/http/absolute reference.');
  if (!path.startsWith('intake/')) errors.push('Source staged media path must be under intake/.');
  if (AUTHORED_RECORD_PREFIX_PATTERN.test(path.split('/').pop() || '')) errors.push('Authored records cannot be promoted as media assets.');
  return { valid: errors.length === 0, errors, path };
}

export function normalizeAssetRecord(record = {}, options = {}) {
  const now = isoNow(options.now);
  const id = text(record.id || record.assetId);
  const type = normalizeAssetTaxonomy(record.type || record.category, 'image');
  const kind = normalizeAssetTaxonomy(record.kind || record.assetKind, type);
  const fileValidation = validateFinalAssetPath(record.file || record.path || record.resourcePath || record.finalPath);
  const errors = [];

  if (!id) errors.push('Asset record requires a stable asset_ ID.');
  else if (!id.startsWith('asset_')) errors.push('Asset record ID must start with asset_.');
  else if (AUTHORED_RECORD_PREFIX_PATTERN.test(id)) errors.push('Authored record IDs cannot be stored as media assets.');

  if (!MEDIA_ASSET_TYPES.includes(type)) errors.push(`Unsupported asset type: ${type}.`);
  if (!MEDIA_ASSET_KINDS.includes(kind)) errors.push(`Unsupported asset kind: ${kind}.`);
  errors.push(...fileValidation.errors);

  if (record.dataUrl || record.dataURL || String(record.file || '').startsWith('data:') || String(record.path || '').startsWith('data:')) {
    errors.push('Final asset records must not contain browser dataUrl values.');
  }

  if (errors.length) {
    const error = new Error(errors.join(' '));
    error.errors = errors;
    throw error;
  }

  const source = record.source && typeof record.source === 'object' && !Array.isArray(record.source) ? { ...record.source } : {};
  const normalized = {
    ...record,
    id,
    name: text(record.name || record.label || id),
    type,
    kind,
    assetKind: kind,
    file: fileValidation.path,
    status: text(record.status || 'ready'),
    tags: uniqueStrings(record.tags),
    source,
    updatedAt: text(record.updatedAt) || now
  };

  delete normalized.assetId;
  delete normalized.path;
  delete normalized.resourcePath;
  delete normalized.finalPath;
  delete normalized.dataUrl;
  delete normalized.dataURL;

  if (!normalized.createdAt) normalized.createdAt = now;
  return normalized;
}

export function normalizeAssetIndex(indexValue, options = {}) {
  const shape = validateAssetIndexShape(indexValue);
  if (!shape.valid) {
    const error = new Error(shape.errors.join(' '));
    error.errors = shape.errors;
    throw error;
  }
  return {
    ...indexValue,
    schemaVersion: ASSET_INDEX_SCHEMA,
    projectId: text(indexValue.projectId) || text(options.projectId) || 'project_unknown',
    assets: indexValue.assets.map((record) => normalizeAssetRecord(record, options))
  };
}

function notFound(error) {
  return error?.name === 'NotFoundError' || error?.code === 'ENOENT' || error?.code === 'NotFoundError';
}

export async function readAssetIndex(client, options = {}) {
  if (!client?.readJson) throw new Error('Asset Library requires a project-folder client with readJson.');
  try {
    return normalizeAssetIndex(await client.readJson(ASSET_INDEX_PATH), options);
  } catch (error) {
    if (notFound(error) && options.createIfMissing) {
      const index = createEmptyAssetIndex(options.projectId);
      await writeAssetIndex(client, index, options);
      return index;
    }
    throw error;
  }
}

export async function writeAssetIndex(client, indexValue, options = {}) {
  if (!client?.writeJson) throw new Error('Asset Library requires a project-folder client with writeJson.');
  const index = normalizeAssetIndex(indexValue, options);
  await client.writeJson(ASSET_INDEX_PATH, index);
  return index;
}

export function allocateAssetId(indexValue, seed = {}) {
  const finalPath = normalizePath(seed.finalPath || seed.file || seed.path || seed.resourcePath);
  const existingForPath = finalPath ? safeArray(indexValue?.assets).find((asset) => normalizePath(asset?.file || asset?.path || asset?.resourcePath) === finalPath && text(asset?.id).startsWith('asset_')) : null;
  if (existingForPath) return existingForPath.id;

  const explicitId = text(seed.id || seed.assetId);
  if (explicitId) {
    if (!explicitId.startsWith('asset_')) throw new Error('Explicit asset ID must start with asset_.');
    return explicitId;
  }

  const used = new Set(safeArray(indexValue?.assets).map((asset) => text(asset?.id)).filter(Boolean));
  const prefix = safeAssetSlug(seed.kind || seed.assetKind || seed.type || 'media');
  const base = `asset_${prefix}_${safeAssetSlug(seed.name || finalPath || 'media')}`.slice(0, 96).replace(/_+$/u, '');
  let candidate = base;
  let counter = 2;
  while (used.has(candidate)) {
    const suffix = `_${counter}`;
    candidate = `${base.slice(0, 96 - suffix.length)}${suffix}`;
    counter += 1;
  }
  return candidate;
}

export function upsertAssetRecord(indexValue, record, options = {}) {
  const index = normalizeAssetIndex(indexValue, options);
  const normalized = normalizeAssetRecord(record, options);
  const existingIndex = index.assets.findIndex((asset) => asset.id === normalized.id);
  if (existingIndex >= 0) index.assets[existingIndex] = { ...index.assets[existingIndex], ...normalized, createdAt: index.assets[existingIndex].createdAt || normalized.createdAt };
  else index.assets.push(normalized);
  return index;
}

async function readStagedBytes(client, path) {
  if (typeof client.readBytes === 'function') return client.readBytes(path);
  if (typeof client.readBlob === 'function') return new Uint8Array(await (await client.readBlob(path)).arrayBuffer());
  throw new Error('Asset Library promotion requires a project-folder client with readBytes or readBlob.');
}

async function writeFinalBytes(client, path, bytes) {
  if (typeof client.writeBytes === 'function') return client.writeBytes(path, bytes);
  if (typeof client.writeBlob === 'function') return client.writeBlob(path, new Blob([bytes]));
  throw new Error('Asset Library promotion requires a project-folder client with writeBytes or writeBlob.');
}

export async function promoteStagedMediaAsset(client, request = {}, options = {}) {
  const sourceValidation = validateStagedMediaPath(request.sourcePath || request.originPath);
  const finalValidation = validateFinalAssetPath(request.finalPath || request.file);
  const errors = [...sourceValidation.errors, ...finalValidation.errors];
  const type = normalizeAssetTaxonomy(request.type, 'image');
  const kind = normalizeAssetTaxonomy(request.kind || request.assetKind, type);

  if (!NON_AUDIO_TYPES.has(type)) errors.push(`Non-audio promotion does not support asset type: ${type}.`);
  if (!NON_AUDIO_KINDS.has(kind)) errors.push(`Non-audio promotion does not support asset kind: ${kind}.`);
  if (request.dataUrl || request.dataURL) errors.push('Promotion source must be staged project media, not a browser dataUrl.');
  if (AUTHORED_RECORD_PREFIX_PATTERN.test(text(request.id || request.name))) errors.push('Authored records cannot be promoted as media assets.');
  if (errors.length) throw new Error(errors.join(' '));

  const index = await readAssetIndex(client, { ...options, createIfMissing: true });
  const now = isoNow(options.now);
  const id = allocateAssetId(index, { ...request, type, kind, finalPath: finalValidation.path });
  const bytes = await readStagedBytes(client, sourceValidation.path);
  if (!bytes?.length) throw new Error(`No staged media bytes found at ${sourceValidation.path}.`);

  const record = normalizeAssetRecord({
    id,
    name: request.name || id,
    type,
    kind,
    file: finalValidation.path,
    status: request.status || 'ready',
    tags: request.tags,
    source: {
      createdBy: request.createdBy || 'asset-library',
      originPath: sourceValidation.path,
      finalPath: finalValidation.path,
      promotedFrom: sourceValidation.path,
      promotionStatus: 'approved',
      ...(request.source && typeof request.source === 'object' ? request.source : {})
    },
    createdAt: request.createdAt || now,
    updatedAt: now
  }, { ...options, now });

  await writeFinalBytes(client, finalValidation.path, bytes);
  const nextIndex = upsertAssetRecord(index, record, { ...options, now });
  await writeAssetIndex(client, nextIndex, { ...options, now });
  return { assetId: record.id, record, index: nextIndex, sourcePath: sourceValidation.path, finalPath: finalValidation.path };
}
