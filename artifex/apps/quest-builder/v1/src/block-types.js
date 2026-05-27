export const BLOCK_TYPES = {
  scene: {
    name: 'Scene / Screen',
    emoji: '🖼️',
    color: '#a78bfa',
    category: 'location',
    sourceModule: 'scene-editor',
    primaryField: 'sceneId',
    linkedFields: ['sceneId'],
    requiredFields: ['sceneId'],
    hint: 'Loads, gates, or checks a playable scene.'
  },
  action: {
    name: 'Player Action',
    emoji: '👉',
    color: '#fbbf24',
    category: 'gameplay',
    sourceModule: 'quest-builder',
    primaryField: 'action',
    linkedFields: ['action', 'sceneId', 'objectId', 'dialogueId', 'audioId'],
    requiredFields: ['action'],
    hint: 'Something the player must do, like speak, use, collect, or trigger.'
  },
  travel: {
    name: 'Travel Section',
    emoji: '🚶',
    color: '#34d399',
    category: 'movement',
    sourceModule: 'project-manager',
    primaryField: 'action',
    linkedFields: ['action', 'sceneId'],
    requiredFields: ['action'],
    hint: 'Side-scrolling route or movement challenge.'
  },
  dialogue: {
    name: 'Dialogue Asset',
    emoji: '💬',
    color: '#f87171',
    category: 'content-link',
    sourceModule: 'dialogue-library',
    primaryField: 'dialogueId',
    linkedFields: ['dialogueId', 'audioId', 'objectId'],
    requiredFields: ['dialogueId'],
    hint: 'NPC, companion, or story conversation text/audio.'
  },
  object: {
    name: 'Object Interaction',
    emoji: '🧩',
    color: '#2dd4bf',
    category: 'content-link',
    sourceModule: 'archetype-object-creator',
    primaryField: 'objectId',
    linkedFields: ['objectId', 'action', 'sceneId'],
    requiredFields: ['objectId', 'action'],
    hint: 'Pick up, use, give, inspect, or activate an object.'
  },
  information: {
    name: 'Information / Clue',
    emoji: '🔎',
    color: '#60a5fa',
    category: 'discovery',
    sourceModule: 'quest-builder',
    primaryField: 'action',
    linkedFields: ['action', 'dialogueId', 'sceneId', 'objectId'],
    requiredFields: ['action'],
    hint: 'Talk, inspect, decode, or discover what Mel must know.'
  },
  condition: {
    name: 'Condition / Flag',
    emoji: '🔀',
    color: '#60a5fa',
    category: 'logic',
    sourceModule: 'quest-builder',
    primaryField: 'condition',
    linkedFields: ['condition'],
    requiredFields: ['condition'],
    hint: 'Checks flags, requirements, world state, or prerequisites.'
  },
  route: {
    name: 'Route / Map Unlock',
    emoji: '🗺️',
    color: '#34d399',
    category: 'unlock',
    sourceModule: 'project-manager',
    primaryField: 'action',
    linkedFields: ['action', 'sceneId'],
    requiredFields: ['action'],
    hint: 'Opens paths, Stone Markers, doors, bridges, or map nodes.'
  },
  ritual: {
    name: 'Ritual Sequence',
    emoji: '🕯️',
    color: '#e2cca7',
    category: 'gameplay',
    sourceModule: 'quest-builder',
    primaryField: 'action',
    linkedFields: ['action', 'objectId', 'condition'],
    requiredFields: ['action'],
    hint: 'Places ingredients, uses Songspells, relics, or ritual order.'
  },
  combat: {
    name: 'Combat / Foe',
    emoji: '⚔️',
    color: '#fb7185',
    category: 'gameplay',
    sourceModule: 'quest-builder',
    primaryField: 'action',
    linkedFields: ['action', 'objectId', 'sceneId'],
    requiredFields: ['action'],
    hint: 'Defeat Foes, Guardians, Castellans, or Bellators.'
  },
  companion: {
    name: 'Companion Assist',
    emoji: '🤝',
    color: '#7ff0bd',
    category: 'gameplay',
    sourceModule: 'quest-builder',
    primaryField: 'objectId',
    linkedFields: ['objectId', 'action', 'dialogueId'],
    requiredFields: ['objectId', 'action'],
    hint: 'Uses Erik, Vitus, Greta, Ivalio, Merdeha, or another helper.'
  },
  cleansing: {
    name: 'Cleanse / Purify',
    emoji: '✨',
    color: '#7ff0bd',
    category: 'gameplay',
    sourceModule: 'quest-builder',
    primaryField: 'action',
    linkedFields: ['action', 'objectId', 'condition'],
    requiredFields: ['action'],
    hint: 'Removes Sekhemra, frees a Thrall, or weakens Cursed Ground.'
  },
  capra: {
    name: 'Capra Feedback',
    emoji: '🐐',
    color: '#7ff0bd',
    category: 'ui-feedback',
    sourceModule: 'quest-builder',
    primaryField: 'capraFeedback',
    linkedFields: ['capraFeedback', 'uiOverlay', 'condition'],
    requiredFields: ['capraFeedback'],
    hint: 'Wrong-object hint, reminder, warning, or puzzle feedback.'
  },
  codice: {
    name: 'Codice Update',
    emoji: '📜',
    color: '#e2cca7',
    category: 'unlock',
    sourceModule: 'codice-library',
    primaryField: 'action',
    linkedFields: ['action', 'condition'],
    requiredFields: ['action'],
    hint: 'Adds clues, prophecies, translations, or lore entries.'
  },
  reward: {
    name: 'Reward',
    emoji: '🎁',
    color: '#e2cca7',
    category: 'unlock',
    sourceModule: 'quest-builder',
    primaryField: 'action',
    linkedFields: ['action', 'condition'],
    requiredFields: ['action'],
    hint: 'Silver, supplies, relics, heart rewards, unlocks, or gifts.'
  },
  ui: {
    name: 'UI Overlay',
    emoji: '🪟',
    color: '#7ff0bd',
    category: 'ui-feedback',
    sourceModule: 'quest-builder',
    primaryField: 'uiOverlay',
    linkedFields: ['uiOverlay', 'condition'],
    requiredFields: ['uiOverlay'],
    hint: 'Calling Fulfilled, popup, map, inventory, or custom overlay.'
  },
  completion: {
    name: 'Calling Fulfilled',
    emoji: '✅',
    color: '#fef3c7',
    category: 'completion',
    sourceModule: 'quest-builder',
    primaryField: 'condition',
    linkedFields: ['condition', 'uiOverlay', 'action'],
    requiredFields: ['condition'],
    hint: 'Final Quest completion condition and next unlock.'
  }
};

export function getBlockType(type) {
  return BLOCK_TYPES[type] || {
    name: titleCase(type || 'block'),
    emoji: '◇',
    color: 'rgba(226,204,167,.25)',
    category: 'custom',
    sourceModule: 'quest-builder',
    primaryField: 'action',
    linkedFields: ['action', 'sceneId', 'objectId', 'dialogueId', 'condition', 'uiOverlay'],
    requiredFields: [],
    hint: 'Custom Quest block.'
  };
}

export function primaryFieldFor(type) {
  return getBlockType(type).primaryField || 'action';
}

export function requiredFieldsFor(type) {
  return getBlockType(type).requiredFields || [];
}

export function titleCase(value) {
  return String(value || '').replace(/[-_]/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}
