import { DESIGN_WIDTH, DESIGN_HEIGHT, MODULE_KIND, MODULE_VERSION } from './module-config.js';

export const moduleState = {
  document: createEmptyDocument(),
  activeRecordIndex: -1,
  showGrid: true,
  showHelpers: true,
  workspaceMode: 'dark',
  zoom: 1
};

export function createEmptyDocument() {
  const now = new Date().toISOString();

  return {
    id: `module_${cryptoRandom()}`,
    name: 'Untitled Module Data',
    moduleKind: MODULE_KIND,
    version: MODULE_VERSION,
    designWidth: DESIGN_WIDTH,
    designHeight: DESIGN_HEIGHT,
    createdAt: now,
    updatedAt: now,
    settings: {},
    records: []
  };
}

export function createEmptyRecord(patch = {}) {
  return normalizeRecord({
    id: `record_${cryptoRandom()}`,
    name: 'New Record',
    type: 'generic',
    category: 'uncategorised',
    tags: [],
    notes: '',
    properties: {},
    ...patch
  });
}

export function normalizeDocument(input = {}) {
  const base = createEmptyDocument();
  const records = Array.isArray(input.records) ? input.records : [];

  return {
    ...base,
    ...input,
    designWidth: finiteNumber(input.designWidth, DESIGN_WIDTH),
    designHeight: finiteNumber(input.designHeight, DESIGN_HEIGHT),
    settings: isPlainObject(input.settings) ? input.settings : {},
    records: records.map(normalizeRecord)
  };
}

export function normalizeRecord(input = {}) {
  return {
    id: input.id || `record_${cryptoRandom()}`,
    name: stringOr(input.name, 'New Record'),
    type: stringOr(input.type, 'generic'),
    category: stringOr(input.category, 'uncategorised'),
    tags: normalizeTags(input.tags),
    notes: stringOr(input.notes, ''),
    properties: isPlainObject(input.properties) ? input.properties : {}
  };
}

export function resetDocument() {
  moduleState.document = createEmptyDocument();
  moduleState.activeRecordIndex = -1;
  notifyChange();
}

export function loadDocument(document) {
  moduleState.document = normalizeDocument(document);
  moduleState.activeRecordIndex = moduleState.document.records.length ? 0 : -1;
  notifyChange();
}

export function updateDocument(patch) {
  Object.assign(moduleState.document, patch);
  moduleState.document.updatedAt = new Date().toISOString();
  notifyChange();
}

export function addRecord(recordPatch = {}) {
  const record = createEmptyRecord(recordPatch);
  moduleState.document.records.push(record);
  moduleState.activeRecordIndex = moduleState.document.records.length - 1;
  moduleState.document.updatedAt = new Date().toISOString();
  notifyChange();
  return record;
}

export function getActiveRecord() {
  return moduleState.document.records[moduleState.activeRecordIndex] || null;
}

export function selectRecord(index) {
  if (index < 0 || index >= moduleState.document.records.length) return;
  moduleState.activeRecordIndex = index;
  notifyChange();
}

export function updateActiveRecord(patch) {
  const record = getActiveRecord();
  if (!record) return;
  Object.assign(record, patch);
  if ('tags' in patch) record.tags = normalizeTags(patch.tags);
  if ('properties' in patch && !isPlainObject(record.properties)) record.properties = {};
  moduleState.document.updatedAt = new Date().toISOString();
  notifyChange();
}

export function duplicateActiveRecord() {
  const record = getActiveRecord();
  if (!record) return;
  const clone = normalizeRecord(JSON.parse(JSON.stringify(record)));
  clone.id = `record_${cryptoRandom()}`;
  clone.name = `${record.name} Copy`;
  moduleState.document.records.splice(moduleState.activeRecordIndex + 1, 0, clone);
  moduleState.activeRecordIndex += 1;
  moduleState.document.updatedAt = new Date().toISOString();
  notifyChange();
}

export function deleteActiveRecord() {
  if (moduleState.activeRecordIndex < 0) return;
  moduleState.document.records.splice(moduleState.activeRecordIndex, 1);
  moduleState.activeRecordIndex = Math.min(moduleState.activeRecordIndex, moduleState.document.records.length - 1);
  moduleState.document.updatedAt = new Date().toISOString();
  notifyChange();
}

export function setActiveRecordProperty(key, value) {
  const record = getActiveRecord();
  const cleanKey = String(key || '').trim();
  if (!record || !cleanKey) return false;
  record.properties = {
    ...(record.properties || {}),
    [cleanKey]: coercePropertyValue(value)
  };
  moduleState.document.updatedAt = new Date().toISOString();
  notifyChange();
  return true;
}

export function removeActiveRecordProperty(key) {
  const record = getActiveRecord();
  const cleanKey = String(key || '').trim();
  if (!record || !cleanKey || !Object.prototype.hasOwnProperty.call(record.properties || {}, cleanKey)) return false;
  delete record.properties[cleanKey];
  moduleState.document.updatedAt = new Date().toISOString();
  notifyChange();
  return true;
}

export function setWorkspaceMode(mode) {
  moduleState.workspaceMode = ['dark', 'white'].includes(mode) ? mode : 'dark';
  notifyChange();
}

export function toggleGrid() {
  moduleState.showGrid = !moduleState.showGrid;
  notifyChange();
}

export function toggleHelpers() {
  moduleState.showHelpers = !moduleState.showHelpers;
  notifyChange();
}

export function setZoom(value) {
  moduleState.zoom = clamp(Number(value), 0.4, 3);
  notifyChange();
}

export function serializeDocument() {
  return JSON.stringify(moduleState.document, null, 2);
}

let changeListeners = [];

export function onStateChange(listener) {
  changeListeners.push(listener);
  return () => {
    changeListeners = changeListeners.filter((item) => item !== listener);
  };
}

export function notifyChange() {
  for (const listener of changeListeners) {
    listener(moduleState);
  }
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function coercePropertyValue(value) {
  const string = String(value ?? '').trim();

  if (string === 'true') return true;
  if (string === 'false') return false;
  if (string === 'null') return null;

  const number = Number(string);
  if (string !== '' && Number.isFinite(number)) return number;

  try {
    if ((string.startsWith('{') && string.endsWith('}')) || (string.startsWith('[') && string.endsWith(']'))) {
      return JSON.parse(string);
    }
  } catch {
    return string;
  }

  return string;
}

function stringOr(value, fallback) {
  const string = String(value ?? '').trim();
  return string || fallback;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cryptoRandom() {
  if (globalThis.crypto?.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0].toString(36);
  }
  return Math.random().toString(36).slice(2);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
