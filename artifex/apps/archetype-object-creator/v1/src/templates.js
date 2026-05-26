export const CATEGORIES = [
  { value: 'character', label: 'Character / Person' },
  { value: 'npc', label: 'NPC' },
  { value: 'enemy', label: 'Enemy / Foe' },
  { value: 'creature', label: 'Creature / Animal' },
  { value: 'boss', label: 'Boss / Bellator' },
  { value: 'prop', label: 'Prop' },
  { value: 'door_exit', label: 'Door / Exit' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'marker', label: 'Marker / Stone Marker' },
  { value: 'interactable', label: 'Interactable Object' },
  { value: 'searchable_cache', label: 'Searchable Cache' },
  { value: 'hazard', label: 'Hazard' }
];

export const GAMEPLAY_ACTIONS = [
  { id: 'idle', label: 'Idle' },
  { id: 'turn', label: 'Turn / Face Direction' },
  { id: 'walk', label: 'Walk' },
  { id: 'patrol_walk', label: 'Patrol / Walk' },
  { id: 'move', label: 'Move' },
  { id: 'jump', label: 'Jump' },
  { id: 'crouch_hide', label: 'Crouch / Hide' },
  { id: 'pickup', label: 'Pick Up' },
  { id: 'hold_carry', label: 'Hold / Carry' },
  { id: 'throw', label: 'Throw' },
  { id: 'use_item', label: 'Use Item' },
  { id: 'gesture', label: 'Gesture' },
  { id: 'give_item', label: 'Give Item' },
  { id: 'receive_item', label: 'Receive Item' },
  { id: 'interact_assist', label: 'Interact / Assist' },
  { id: 'sing_cast', label: 'Sing / Magic Cast' },
  { id: 'cast_ritual', label: 'Cast / Ritual' },
  { id: 'channel', label: 'Channel' },
  { id: 'attack', label: 'Attack' },
  { id: 'special_attack', label: 'Special Attack' },
  { id: 'take_damage', label: 'Take Damage' },
  { id: 'stunned', label: 'Stunned' },
  { id: 'phase_change', label: 'Phase Change' },
  { id: 'death', label: 'Death / Disappear' },
  { id: 'enter_door', label: 'Enter Door' },
  { id: 'exit_door', label: 'Exit Door' },
  { id: 'open', label: 'Open' },
  { id: 'close', label: 'Close' },
  { id: 'locked', label: 'Locked' },
  { id: 'collect', label: 'Collect' },
  { id: 'searched_open', label: 'Searched / Opened' },
  { id: 'activate', label: 'Activate' },
  { id: 'trigger', label: 'Trigger' },
  { id: 'reset', label: 'Reset' },
  { id: 'land_break', label: 'Land / Break' },
  { id: 'possession_overlay', label: 'Possession Overlay' }
];

export const PORTRAIT_ACTIONS = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'mouth_loop', label: 'Mouth Loop' },
  { id: 'blink', label: 'Blink' },
  { id: 'happy', label: 'Happy' },
  { id: 'angry', label: 'Angry' },
  { id: 'worried', label: 'Worried' },
  { id: 'shocked', label: 'Shocked' },
  { id: 'sad', label: 'Sad' },
  { id: 'green_eye_overlay', label: 'Green Eye Overlay' },
  { id: 'custom_expression', label: 'Custom Expression' }
];

export const RUNTIME_FLAGS = [
  { key: 'placeable', label: 'Placeable in Scene Editor' },
  { key: 'interactable', label: 'Can be Invoked / interacted with' },
  { key: 'collectible', label: 'Can be collected into inventory' },
  { key: 'hostile', label: 'Hostile / damages Mel' },
  { key: 'mobile', label: 'Can move' },
  { key: 'blocksPlayer', label: 'Blocks player movement' },
  { key: 'damageable', label: 'Can take damage' },
  { key: 'questRelevant', label: 'Quest / Calling relevant' },
  { key: 'usesPortrait', label: 'Uses dialogue portrait set' },
  { key: 'hasCollision', label: 'Has collision box' }
];

export const ROLE_TEMPLATES = {
  person_static: {
    label: 'Static Background Person', category: 'character', subtype: 'background_person',
    gameplayActions: ['idle'], portraitActions: [],
    flags: { placeable: true, interactable: false, collectible: false, hostile: false, mobile: false, blocksPlayer: false, damageable: false, questRelevant: false, usesPortrait: false, hasCollision: false },
    size: { width: 80, height: 160 }, collision: { type: 'none', hitbox: { x: 20, y: 72, width: 40, height: 88 }, interactionRadius: 0 }, behaviourPreset: 'static_display'
  },
  person_npc_basic: {
    label: 'Basic NPC', category: 'npc', subtype: 'npc_basic',
    gameplayActions: ['idle', 'turn'], portraitActions: ['neutral', 'mouth_loop', 'blink'],
    flags: { placeable: true, interactable: true, collectible: false, hostile: false, mobile: false, blocksPlayer: true, damageable: false, questRelevant: false, usesPortrait: true, hasCollision: true },
    size: { width: 88, height: 168 }, collision: { type: 'box', hitbox: { x: 22, y: 84, width: 44, height: 80 }, interactionRadius: 72 }, behaviourPreset: 'npc_basic'
  },
  person_npc_moving: {
    label: 'Moving NPC', category: 'npc', subtype: 'npc_moving',
    gameplayActions: ['idle', 'walk', 'turn'], portraitActions: ['neutral', 'mouth_loop', 'blink'],
    flags: { placeable: true, interactable: true, collectible: false, hostile: false, mobile: true, blocksPlayer: true, damageable: false, questRelevant: false, usesPortrait: true, hasCollision: true },
    size: { width: 88, height: 168 }, collision: { type: 'box', hitbox: { x: 22, y: 84, width: 44, height: 80 }, interactionRadius: 72 }, behaviourPreset: 'npc_wander'
  },
  person_vendor_job: {
    label: 'Vendor / Job NPC', category: 'npc', subtype: 'vendor_job',
    gameplayActions: ['idle', 'turn', 'gesture', 'give_item', 'receive_item'], portraitActions: ['neutral', 'mouth_loop', 'blink', 'happy', 'worried'],
    flags: { placeable: true, interactable: true, collectible: false, hostile: false, mobile: false, blocksPlayer: true, damageable: false, questRelevant: true, usesPortrait: true, hasCollision: true },
    size: { width: 92, height: 168 }, collision: { type: 'box', hitbox: { x: 22, y: 84, width: 48, height: 80 }, interactionRadius: 86 }, behaviourPreset: 'job_vendor'
  },
  person_companion: {
    label: 'Major NPC / Companion', category: 'npc', subtype: 'companion',
    gameplayActions: ['idle', 'walk', 'turn', 'gesture', 'give_item', 'receive_item', 'interact_assist', 'take_damage'], portraitActions: ['neutral', 'mouth_loop', 'blink', 'happy', 'angry', 'worried', 'shocked', 'sad'],
    flags: { placeable: true, interactable: true, collectible: false, hostile: false, mobile: true, blocksPlayer: true, damageable: true, questRelevant: true, usesPortrait: true, hasCollision: true },
    size: { width: 96, height: 176 }, collision: { type: 'box', hitbox: { x: 24, y: 88, width: 48, height: 84 }, interactionRadius: 86 }, behaviourPreset: 'companion_assist'
  },
  person_player_full: {
    label: 'Player / Mel-Type', category: 'character', subtype: 'player_full',
    gameplayActions: ['idle', 'walk', 'jump', 'crouch_hide', 'pickup', 'hold_carry', 'throw', 'use_item', 'sing_cast', 'take_damage', 'death', 'enter_door', 'exit_door'], portraitActions: ['neutral', 'mouth_loop', 'blink', 'happy', 'angry', 'worried', 'shocked', 'sad'],
    flags: { placeable: true, interactable: false, collectible: false, hostile: false, mobile: true, blocksPlayer: true, damageable: true, questRelevant: true, usesPortrait: true, hasCollision: true },
    size: { width: 100, height: 180 }, collision: { type: 'box', hitbox: { x: 28, y: 92, width: 44, height: 84 }, interactionRadius: 78 }, behaviourPreset: 'player_character'
  },
  person_foe_human: {
    label: 'Human Foe / Guard / Bandit', category: 'enemy', subtype: 'human_foe',
    gameplayActions: ['idle', 'patrol_walk', 'attack', 'take_damage', 'death'], portraitActions: [],
    flags: { placeable: true, interactable: false, collectible: false, hostile: true, mobile: true, blocksPlayer: true, damageable: true, questRelevant: false, usesPortrait: false, hasCollision: true },
    size: { width: 96, height: 176 }, collision: { type: 'box', hitbox: { x: 24, y: 88, width: 48, height: 84 }, interactionRadius: 0 }, behaviourPreset: 'foe_human_patrol'
  },
  person_thrall: {
    label: 'Possessed NPC / Thrall', category: 'enemy', subtype: 'thrall',
    gameplayActions: ['idle', 'walk', 'attack', 'take_damage', 'death', 'possession_overlay'], portraitActions: ['neutral', 'mouth_loop', 'blink', 'green_eye_overlay'],
    flags: { placeable: true, interactable: false, collectible: false, hostile: true, mobile: true, blocksPlayer: true, damageable: true, questRelevant: true, usesPortrait: true, hasCollision: true },
    size: { width: 94, height: 174 }, collision: { type: 'box', hitbox: { x: 24, y: 88, width: 46, height: 82 }, interactionRadius: 0 }, behaviourPreset: 'thrall_possessed'
  },
  person_caster: {
    label: 'Caster / Ritualist', category: 'enemy', subtype: 'caster',
    gameplayActions: ['idle', 'cast_ritual', 'channel', 'take_damage', 'death'], portraitActions: ['neutral', 'mouth_loop', 'blink', 'angry', 'shocked'],
    flags: { placeable: true, interactable: false, collectible: false, hostile: true, mobile: false, blocksPlayer: true, damageable: true, questRelevant: true, usesPortrait: true, hasCollision: true },
    size: { width: 100, height: 180 }, collision: { type: 'box', hitbox: { x: 25, y: 90, width: 50, height: 86 }, interactionRadius: 0 }, behaviourPreset: 'ritual_caster'
  },
  creature_foe: {
    label: 'Creature Foe', category: 'creature', subtype: 'creature_foe',
    gameplayActions: ['idle', 'move', 'attack', 'take_damage', 'death'], portraitActions: [],
    flags: { placeable: true, interactable: false, collectible: false, hostile: true, mobile: true, blocksPlayer: true, damageable: true, questRelevant: false, usesPortrait: false, hasCollision: true },
    size: { width: 120, height: 92 }, collision: { type: 'box', hitbox: { x: 20, y: 42, width: 80, height: 44 }, interactionRadius: 0 }, behaviourPreset: 'creature_foe'
  },
  boss_bellator: {
    label: 'Boss / Bellator', category: 'boss', subtype: 'bellator',
    gameplayActions: ['idle', 'move', 'attack', 'special_attack', 'take_damage', 'stunned', 'phase_change', 'death'], portraitActions: [],
    flags: { placeable: true, interactable: false, collectible: false, hostile: true, mobile: true, blocksPlayer: true, damageable: true, questRelevant: true, usesPortrait: false, hasCollision: true },
    size: { width: 220, height: 260 }, collision: { type: 'box', hitbox: { x: 42, y: 120, width: 136, height: 124 }, interactionRadius: 0 }, behaviourPreset: 'boss_bellator'
  },
  static_prop: {
    label: 'Static Prop', category: 'prop', subtype: 'static_prop',
    gameplayActions: ['idle'], portraitActions: [],
    flags: { placeable: true, interactable: false, collectible: false, hostile: false, mobile: false, blocksPlayer: true, damageable: false, questRelevant: false, usesPortrait: false, hasCollision: true },
    size: { width: 120, height: 120 }, collision: { type: 'box', hitbox: { x: 12, y: 72, width: 96, height: 42 }, interactionRadius: 0 }, behaviourPreset: 'prop_static'
  },
  door_exit: {
    label: 'Door / Exit', category: 'door_exit', subtype: 'door_exit',
    gameplayActions: ['idle', 'open', 'close', 'locked'], portraitActions: [],
    flags: { placeable: true, interactable: true, collectible: false, hostile: false, mobile: false, blocksPlayer: true, damageable: false, questRelevant: true, usesPortrait: false, hasCollision: true },
    size: { width: 130, height: 190 }, collision: { type: 'box', hitbox: { x: 10, y: 40, width: 110, height: 150 }, interactionRadius: 90 }, behaviourPreset: 'door_transition'
  },
  pickup: {
    label: 'Pickup Item', category: 'pickup', subtype: 'pickup',
    gameplayActions: ['idle', 'collect'], portraitActions: [],
    flags: { placeable: true, interactable: true, collectible: true, hostile: false, mobile: false, blocksPlayer: false, damageable: false, questRelevant: false, usesPortrait: false, hasCollision: false },
    size: { width: 64, height: 64 }, collision: { type: 'none', hitbox: { x: 0, y: 0, width: 64, height: 64 }, interactionRadius: 58 }, behaviourPreset: 'pickup_collect'
  },
  searchable_cache: {
    label: 'Searchable Cache', category: 'searchable_cache', subtype: 'searchable_cache',
    gameplayActions: ['idle', 'searched_open'], portraitActions: [],
    flags: { placeable: true, interactable: true, collectible: false, hostile: false, mobile: false, blocksPlayer: true, damageable: false, questRelevant: false, usesPortrait: false, hasCollision: true },
    size: { width: 116, height: 98 }, collision: { type: 'box', hitbox: { x: 12, y: 54, width: 92, height: 36 }, interactionRadius: 72 }, behaviourPreset: 'searchable_cache'
  },
  throwable_object: {
    label: 'Throwable Object', category: 'interactable', subtype: 'throwable_object',
    gameplayActions: ['idle', 'pickup', 'hold_carry', 'throw', 'land_break'], portraitActions: [],
    flags: { placeable: true, interactable: true, collectible: false, hostile: false, mobile: true, blocksPlayer: true, damageable: true, questRelevant: false, usesPortrait: false, hasCollision: true },
    size: { width: 82, height: 82 }, collision: { type: 'box', hitbox: { x: 8, y: 42, width: 66, height: 34 }, interactionRadius: 64 }, behaviourPreset: 'throwable_object'
  },
  marker: {
    label: 'Stone Marker / Map Marker', category: 'marker', subtype: 'stone_marker',
    gameplayActions: ['idle', 'activate'], portraitActions: [],
    flags: { placeable: true, interactable: true, collectible: false, hostile: false, mobile: false, blocksPlayer: true, damageable: false, questRelevant: true, usesPortrait: false, hasCollision: true },
    size: { width: 96, height: 150 }, collision: { type: 'box', hitbox: { x: 18, y: 72, width: 60, height: 70 }, interactionRadius: 92 }, behaviourPreset: 'stone_marker'
  },
  hazard: {
    label: 'Hazard', category: 'hazard', subtype: 'hazard',
    gameplayActions: ['idle', 'trigger', 'reset'], portraitActions: [],
    flags: { placeable: true, interactable: false, collectible: false, hostile: true, mobile: false, blocksPlayer: false, damageable: false, questRelevant: false, usesPortrait: false, hasCollision: true },
    size: { width: 180, height: 60 }, collision: { type: 'box', hitbox: { x: 0, y: 0, width: 180, height: 60 }, interactionRadius: 0 }, behaviourPreset: 'environment_hazard'
  }
};

export const PEOPLE_TEMPLATE_IDS = [
  'person_static', 'person_npc_basic', 'person_npc_moving', 'person_vendor_job', 'person_companion',
  'person_player_full', 'person_foe_human', 'person_thrall', 'person_caster', 'creature_foe', 'boss_bellator'
];

export const OBJECT_TEMPLATE_IDS = [
  'static_prop', 'door_exit', 'pickup', 'searchable_cache', 'throwable_object', 'marker', 'hazard'
];
