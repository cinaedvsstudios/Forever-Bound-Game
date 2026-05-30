import { MODULE_VERSION, DESIGN_WIDTH, DESIGN_HEIGHT } from './module-config.js?v=1.2.12';
import { getBlockType } from './block-types.js?v=1.2.12';

export const START_NODE_ID = 'START';
export const END_NODE_ID = 'END';

let localIdCounter = 0;

function makeId(prefix) {
  localIdCounter += 1;
  return `${prefix}_${Date.now()}_${localIdCounter}`;
}

export function createDefaultBlock(type = 'scene', patch = {}) {
  const blockType = getBlockType(type);
  return {
    id: makeId('block'),
    name: blockType.name,
    type,
    thumbnail: blockType.emoji,
    sceneId: '',
    objectId: '',
    dialogueId: '',
    audioId: '',
    condition: '',
    action: '',
    uiOverlay: '',
    capraFeedback: '',
    notes: '',
    ...patch
  };
}

export function createDefaultConnection(sourceNodeId, targetNodeId, patch = {}) {
  return {
    id: makeId('connection'),
    sourceNodeId,
    targetNodeId,
    routingMode: 'smart-shortest',
    condition: '',
    label: '',
    ...patch
  };
}

function normaliseBlocks(blocks = []) {
  return blocks.map((block) => createDefaultBlock(block.type || 'scene', block));
}

function normaliseConnections(connections = []) {
  return connections.map((connection) => createDefaultConnection(connection.sourceNodeId, connection.targetNodeId, connection));
}

export function createDefaultQuest(patch = {}) {
  const next = {
    id: makeId('quest'),
    thumbnail: '📜',
    name: 'New Quest',
    type: 'main',
    chronicleId: 'chronicle_01',
    callingText: 'Define the Calling text for this Quest.',
    sceneIds: [],
    objectIds: [],
    completionFlag: '',
    rewards: [],
    codiceUpdates: [],
    notes: '',
    blocks: [],
    connections: [],
    ...patch
  };
  next.blocks = normaliseBlocks(patch.blocks || next.blocks);
  next.connections = normaliseConnections(patch.connections || next.connections);
  return next;
}

export function createDemoQuestFile() {
  return {
    id: 'quest_file_demo',
    name: 'Untitled Quest File',
    moduleKind: 'quest-builder',
    version: MODULE_VERSION,
    designWidth: DESIGN_WIDTH,
    designHeight: DESIGN_HEIGHT,
    defaultChronicleId: 'chronicle_01',
    quests: [
      createDefaultQuest({
        id: 'quest_demo',
        thumbnail: '🏆',
        name: 'Recover the Chalice',
        type: 'main',
        chronicleId: 'chronicle_01',
        callingText: 'Find the true chalice and bring it to the altar.',
        sceneIds: ['scene_church', 'scene_crypt'],
        objectIds: ['npc_vitus', 'relic_chalice', 'altar'],
        completionFlag: 'chalice_delivered',
        rewards: ['silver:20', 'unlock:route_bridge'],
        codiceUpdates: ['codice_chalice_truth'],
        blocks: [
          createDefaultBlock('scene', { id: 'b1', name: 'Enter Church', thumbnail: '🖼️', sceneId: 'scene_church', action: 'set_flag:church_entered' }),
          createDefaultBlock('action', { id: 'b2', name: 'Speak With Vitus', thumbnail: '👉', objectId: 'npc_vitus', dialogueId: 'ch01_q03_vitus_warning', action: 'speak:npc_vitus' }),
          createDefaultBlock('object', { id: 'b3', name: 'Collect Chalice', thumbnail: '🧩', objectId: 'relic_chalice', action: 'set_flag:chalice_collected' }),
          createDefaultBlock('capra', { id: 'b4', name: 'Wrong Cup Warning', thumbnail: '🐐', condition: 'wrong_item_used', uiOverlay: 'capra_popup', capraFeedback: 'That is not the vessel the Calling seeks.' }),
          createDefaultBlock('codice', { id: 'b5', name: 'Update Codice', thumbnail: '📜', action: 'unlock_codice:codice_chalice_truth' }),
          createDefaultBlock('completion', { id: 'b6', name: 'Calling Fulfilled', thumbnail: '✅', condition: 'flag_true:chalice_delivered', uiOverlay: 'calling_fulfilled' })
        ],
        connections: [
          createDefaultConnection(START_NODE_ID, 'b1', { id: 'c_start_enter' }),
          createDefaultConnection('b1', 'b2', { id: 'c_enter_speak' }),
          createDefaultConnection('b2', 'b3', { id: 'c_speak_collect' }),
          createDefaultConnection('b3', 'b5', { id: 'c_collect_codice' }),
          createDefaultConnection('b3', 'b4', { id: 'c_collect_warning', condition: 'wrong_item_used', label: 'wrong item' }),
          createDefaultConnection('b4', 'b3', { id: 'c_warning_return', label: 'try again' }),
          createDefaultConnection('b5', 'b6', { id: 'c_codice_complete' }),
          createDefaultConnection('b6', END_NODE_ID, { id: 'c_complete_end' })
        ]
      })
    ]
  };
}

export function parseList(value) {
  return Array.isArray(value) ? value : String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}
