import { MODULE_VERSION, DESIGN_WIDTH, DESIGN_HEIGHT } from './module-config.js?v=1.2.7';
import { getBlockType } from './block-types.js?v=1.2.7';

export function createDefaultBlock(type = 'scene', patch = {}) {
  const blockType = getBlockType(type);
  return {
    id: 'block_' + Date.now(),
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

export function createDefaultQuest(patch = {}) {
  return {
    id: 'quest_' + Date.now(),
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
    ...patch
  };
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
