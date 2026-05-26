import { DESIGN_WIDTH, DESIGN_HEIGHT, MODULE_KIND, MODULE_VERSION } from './module-config.js';

export const state = {
  document: createEmptyDocument(),
  activeQuestIndex: -1,
  activeBlockIndex: -1,
  workspaceMode: 'dark'
};

export function createEmptyDocument() {
  const now = new Date().toISOString();
  return {
    id: `quest_file_${cryptoRandom()}`,
    name: 'Untitled Quest File',
    moduleKind: MODULE_KIND,
    version: MODULE_VERSION,
    designWidth: DESIGN_WIDTH,
    designHeight: DESIGN_HEIGHT,
    createdAt: now,
    updatedAt: now,
    defaultChronicleId: 'chronicle_01',
    quests: []
  };
}

export function createQuest(patch = {}) {
  return normalizeQuest({
    id: `quest_${cryptoRandom()}`,
    name: 'New Quest',
    type: 'main',
    chronicleId: state.document.defaultChronicleId || 'chronicle_01',
    callingText: 'Define the Calling text for this Quest.',
    sceneIds: [],
    objectIds: [],
    completionFlag: '',
    rewards: [],
    codiceUpdates: [],
    notes: '',
    blocks: [],
    ...patch
  });
}

export function createBlock(type = 'scene', patch = {}) {
  return normalizeBlock({
    id: `block_${cryptoRandom()}`,
    name: `${titleCase(type)} Block`,
    type,
    sceneId: '',
    objectId: '',
    dialogueId: '',
    condition: '',
    action: '',
    uiOverlay: '',
    capraFeedback: '',
    notes: '',
    ...patch
  });
}

export function normalizeDocument(input = {}) {
  const base = createEmptyDocument();
  const quests = Array.isArray(input.quests) ? input.quests : [];
  return {
    ...base,
    ...input,
    quests: quests.map(normalizeQuest)
  };
}

export function normalizeQuest(input = {}) {
  return {
    id: stringOr(input.id, `quest_${cryptoRandom()}`),
    name: stringOr(input.name, 'New Quest'),
    type: stringOr(input.type, 'main'),
    chronicleId: stringOr(input.chronicleId, state.document?.defaultChronicleId || 'chronicle_01'),
    callingText: stringOr(input.callingText, ''),
    sceneIds: list(input.sceneIds),
    objectIds: list(input.objectIds),
    completionFlag: stringOr(input.completionFlag, ''),
    rewards: list(input.rewards),
    codiceUpdates: list(input.codiceUpdates),
    notes: stringOr(input.notes, ''),
    blocks: Array.isArray(input.blocks) ? input.blocks.map(normalizeBlock) : []
  };
}

export function normalizeBlock(input = {}) {
  return {
    id: stringOr(input.id, `block_${cryptoRandom()}`),
    name: stringOr(input.name, 'Quest Block'),
    type: stringOr(input.type, 'scene'),
    sceneId: stringOr(input.sceneId, ''),
    objectId: stringOr(input.objectId, ''),
    dialogueId: stringOr(input.dialogueId, ''),
    condition: stringOr(input.condition, ''),
    action: stringOr(input.action, ''),
    uiOverlay: stringOr(input.uiOverlay, ''),
    capraFeedback: stringOr(input.capraFeedback, ''),
    notes: stringOr(input.notes, '')
  };
}

export function loadDocument(doc) {
  state.document = normalizeDocument(doc);
  state.activeQuestIndex = state.document.quests.length ? 0 : -1;
  state.activeBlockIndex = getActiveQuest()?.blocks.length ? 0 : -1;
  notify();
}

export function resetDocument() {
  state.document = createEmptyDocument();
  state.activeQuestIndex = -1;
  state.activeBlockIndex = -1;
  notify();
}

export function updateDocument(patch) {
  Object.assign(state.document, patch);
  touch();
}

export function addQuest(patch = {}) {
  const quest = createQuest(patch);
  state.document.quests.push(quest);
  state.activeQuestIndex = state.document.quests.length - 1;
  state.activeBlockIndex = -1;
  touch();
  return quest;
}

export function deleteQuest() {
  if (state.activeQuestIndex < 0) return;
  state.document.quests.splice(state.activeQuestIndex, 1);
  state.activeQuestIndex = Math.min(state.activeQuestIndex, state.document.quests.length - 1);
  state.activeBlockIndex = getActiveQuest()?.blocks.length ? 0 : -1;
  touch();
}

export function selectQuest(index) {
  if (index < 0 || index >= state.document.quests.length) return;
  state.activeQuestIndex = index;
  state.activeBlockIndex = getActiveQuest()?.blocks.length ? 0 : -1;
  notify();
}

export function getActiveQuest() {
  return state.document.quests[state.activeQuestIndex] || null;
}

export function updateQuest(patch) {
  const quest = getActiveQuest();
  if (!quest) return;
  Object.assign(quest, patch);
  if ('sceneIds' in patch) quest.sceneIds = list(patch.sceneIds);
  if ('objectIds' in patch) quest.objectIds = list(patch.objectIds);
  if ('rewards' in patch) quest.rewards = list(patch.rewards);
  if ('codiceUpdates' in patch) quest.codiceUpdates = list(patch.codiceUpdates);
  touch();
}

export function addBlock(type = 'scene', patch = {}) {
  let quest = getActiveQuest();
  if (!quest) quest = addQuest();
  const block = createBlock(type, patch);
  quest.blocks.push(block);
  state.activeBlockIndex = quest.blocks.length - 1;
  touch();
  return block;
}

export function deleteBlock() {
  const quest = getActiveQuest();
  if (!quest || state.activeBlockIndex < 0) return;
  quest.blocks.splice(state.activeBlockIndex, 1);
  state.activeBlockIndex = Math.min(state.activeBlockIndex, quest.blocks.length - 1);
  touch();
}

export function selectBlock(index) {
  const quest = getActiveQuest();
  if (!quest || index < 0 || index >= quest.blocks.length) return;
  state.activeBlockIndex = index;
  notify();
}

export function getActiveBlock() {
  const quest = getActiveQuest();
  return quest?.blocks[state.activeBlockIndex] || null;
}

export function updateBlock(patch) {
  const block = getActiveBlock();
  if (!block) return;
  Object.assign(block, patch);
  touch();
}

export function serializeDocument() {
  return JSON.stringify(state.document, null, 2);
}

let listeners = [];
export function onStateChange(listener) { listeners.push(listener); return () => { listeners = listeners.filter((item) => item !== listener); }; }
function notify() { for (const listener of listeners) listener(state); }
function touch() { state.document.updatedAt = new Date().toISOString(); notify(); }
function list(value) { if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean); return String(value || '').split(',').map((v) => v.trim()).filter(Boolean); }
function stringOr(value, fallback) { const string = String(value ?? '').trim(); return string || fallback; }
function titleCase(value) { return String(value || '').replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()); }
function cryptoRandom() { if (globalThis.crypto?.getRandomValues) { const buffer = new Uint32Array(1); crypto.getRandomValues(buffer); return buffer[0].toString(36); } return Math.random().toString(36).slice(2); }
