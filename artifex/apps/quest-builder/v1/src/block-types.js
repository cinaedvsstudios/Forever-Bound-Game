export const BLOCK_TYPES = {
  scene: {
    name: 'Scene / Screen',
    emoji: '🖼️',
    color: '#a78bfa',
    sourceModule: 'scene-editor',
    requiredFields: ['sceneId'],
    hint: 'Loads, gates, or checks a playable scene.'
  },
  action: {
    name: 'Player Action',
    emoji: '👉',
    color: '#fbbf24',
    sourceModule: 'quest-builder',
    requiredFields: ['action'],
    hint: 'Something the player must do, like speak, use, collect, or trigger.'
  },
  travel: {
    name: 'Travel Section',
    emoji: '🚶',
    color: '#34d399',
    sourceModule: 'project-manager',
    requiredFields: [],
    hint: 'Side-scrolling route or movement challenge.'
  },
  dialogue: {
    name: 'Dialogue Asset',
    emoji: '💬',
    color: '#f87171',
    sourceModule: 'dialogue-library',
    requiredFields: ['dialogueId'],
    hint: 'NPC, companion, or story conversation text/audio.'
  },
  object: {
    name: 'Object Interaction',
    emoji: '🧩',
    color: '#2dd4bf',
    sourceModule: 'archetype-object-creator',
    requiredFields: ['objectId'],
    hint: 'Pick up, use, give, inspect, or activate an object.'
  },
  information: {
    name: 'Information / Clue',
    emoji: '🔎',
    color: '#60a5fa',
    sourceModule: 'quest-builder',
    requiredFields: [],
    hint: 'Talk, inspect, decode, or discover what Mel must know.'
  },
  condition: {
    name: 'Condition / Flag',
    emoji: '🔀',
    color: '#60a5fa',
    sourceModule: 'quest-builder',
    requiredFields: ['condition'],
    hint: 'Checks flags, requirements, world state, or prerequisites.'
  },
  route: {
    name: 'Route / Map Unlock',
    emoji: '🗺️',
    color: '#34d399',
    sourceModule: 'project-manager',
    requiredFields: [],
    hint: 'Opens paths, Stone Markers, doors, bridges, or map nodes.'
  },
  ritual: {
    name: 'Ritual Sequence',
    emoji: '🕯️',
    color: '#e2cca7',
    sourceModule: 'quest-builder',
    requiredFields: [],
    hint: 'Places ingredients, uses Songspells, relics, or ritual order.'
  },
  combat: {
    name: 'Combat / Foe',
    emoji: '⚔️',
    color: '#fb7185',
    sourceModule: 'quest-builder',
    requiredFields: [],
    hint: 'Defeat Foes, Guardians, Castellans, or Bellators.'
  },
  companion: {
    name: 'Companion Assist',
    emoji: '🤝',
    color: '#7ff0bd',
    sourceModule: 'quest-builder',
    requiredFields: [],
    hint: 'Uses Erik, Vitus, Greta, Ivalio, Merdeha, or another helper.'
  },
  cleansing: {
    name: 'Cleanse / Purify',
    emoji: '✨',
    color: '#7ff0bd',
    sourceModule: 'quest-builder',
    requiredFields: [],
    hint: 'Removes Sekhemra, frees a Thrall, or weakens Cursed Ground.'
  },
  capra: {
    name: 'Capra Feedback',
    emoji: '🐐',
    color: '#7ff0bd',
    sourceModule: 'quest-builder',
    requiredFields: [],
    hint: 'Wrong-object hint, reminder, warning, or puzzle feedback.'
  },
  codice: {
    name: 'Codice Update',
    emoji: '📜',
    color: '#e2cca7',
    sourceModule: 'codice-library',
    requiredFields: [],
    hint: 'Adds clues, prophecies, translations, or lore entries.'
  },
  reward: {
    name: 'Reward',
    emoji: '🎁',
    color: '#e2cca7',
    sourceModule: 'quest-builder',
    requiredFields: [],
    hint: 'Silver, supplies, relics, heart rewards, unlocks, or gifts.'
  },
  ui: {
    name: 'UI Overlay',
    emoji: '🪟',
    color: '#7ff0bd',
    sourceModule: 'quest-builder',
    requiredFields: [],
    hint: 'Calling Fulfilled, popup, map, inventory, or custom overlay.'
  },
  completion: {
    name: 'Calling Fulfilled',
    emoji: '✅',
    color: '#fef3c7',
    sourceModule: 'quest-builder',
    requiredFields: ['condition'],
    hint: 'Final Quest completion condition and next unlock.'
  }
};

export function getBlockType(type) {
  return BLOCK_TYPES[type] || {
    name: titleCase(type || 'block'),
    emoji: '◇',
    color: 'rgba(226,204,167,.25)',
    sourceModule: 'quest-builder',
    requiredFields: [],
    hint: 'Custom Quest block.'
  };
}

export function titleCase(value) {
  return String(value || '').replace(/[-_]/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}
