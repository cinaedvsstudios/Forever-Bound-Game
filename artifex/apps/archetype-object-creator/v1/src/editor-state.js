import { ROLE_TEMPLATES } from './templates.js';

export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;
export const STORAGE_PREFIX = 'artifex.objectArchetype.';
export const OBJECT_ARCHETYPE_PREFIX = 'archobj_';
export const AUTHORING_STATUS = Object.freeze({ IN_PROGRESS: 'in_progress', READY: 'ready' });
export const OBJECT_INDEX_TARGET = 'archetypes/object-index.json';

export const editorState = {
  archetype: createEmptyArchetype(),
  selectedGameplayAction: '',
  showGrid: true,
  showHelpers: true,
  workspaceMode: 'dark',
  zoom: 1,
  validation: []
};

let listeners = [];

export function createEmptyArchetype() {
  const template = ROLE_TEMPLATES.person_npc_basic;
  const id = makeObjectArchetypeId();
  return normalizeArchetype({
    schemaVersion: 'artifex.objectArchetype.v1',
    id,
    name: 'Untitled Object Archetype',
    category: template.category,
    role: 'person_npc_basic',
    subtype: template.subtype,
    tags: [],
    visual: {
      spriteAssetId: '',
      portraitAssetId: '',
      width: template.size.width,
      height: template.size.height,
      scale: 1,
      anchor: 'bottom-center',
      defaultSceneLayer: 10
    },
    collision: template.collision,
    behaviour: {
      preset: template.behaviourPreset,
      flags: { ...template.flags }
    },
    animationProfile: {
      gameplayActions: [...template.gameplayActions],
      portraitActions: [...template.portraitActions]
    },
    placement: {
      facingDirections: ['left', 'right'],
      snapToGround: true,
      defaultFacing: 'right'
    },
    productionAssets: {
      version: '1.36',
      requirements: {},
      requirementOrder: []
    },
    authoringStatus: AUTHORING_STATUS.IN_PROGRESS,
    exportTarget: objectExportTarget(id),
    exportPaths: createExportPaths(id),
    notes: ''
  });
}

export function normalizeArchetype(input = {}) {
  const role = input.role || 'person_npc_basic';
  const template = ROLE_TEMPLATES[role] || ROLE_TEMPLATES.person_npc_basic;
  const visual = input.visual || {};
  const collision = input.collision || template.collision;
  const behaviour = input.behaviour || {};
  const animationProfile = input.animationProfile || {};
  const id = normalizeObjectArchetypeId(input.id || makeObjectArchetypeId());

  return {
    schemaVersion: 'artifex.objectArchetype.v1',
    id,
    name: String(input.name || template.label || 'Object Archetype'),
    category: input.category || template.category,
    role,
    subtype: String(input.subtype || template.subtype || ''),
    tags: normalizeTags(input.tags),
    visual: {
      spriteAssetId: String(visual.spriteAssetId || ''),
      portraitAssetId: String(visual.portraitAssetId || ''),
      width: clampNumber(visual.width, template.size.width, 8, 1024),
      height: clampNumber(visual.height, template.size.height, 8, 1024),
      scale: clampNumber(visual.scale, 1, 0.1, 8),
      anchor: visual.anchor || 'bottom-center',
      defaultSceneLayer: clampNumber(visual.defaultSceneLayer, 10, 0, 999)
    },
    collision: {
      type: ['box', 'circle', 'none'].includes(collision.type) ? collision.type : template.collision.type,
      hitbox: {
        x: finiteNumber(collision.hitbox?.x, template.collision.hitbox.x),
        y: finiteNumber(collision.hitbox?.y, template.collision.hitbox.y),
        width: clampNumber(collision.hitbox?.width, template.collision.hitbox.width, 0, 2048),
        height: clampNumber(collision.hitbox?.height, template.collision.hitbox.height, 0, 2048)
      },
      interactionRadius: clampNumber(collision.interactionRadius, template.collision.interactionRadius, 0, 512)
    },
    behaviour: {
      preset: String(behaviour.preset || template.behaviourPreset || role),
      flags: { ...template.flags, ...(behaviour.flags || {}) }
    },
    animationProfile: {
      gameplayActions: normalizeActionList(animationProfile.gameplayActions || template.gameplayActions),
      portraitActions: normalizeActionList(animationProfile.portraitActions || template.portraitActions)
    },
    placement: {
      facingDirections: Array.isArray(input.placement?.facingDirections) ? input.placement.facingDirections : ['left', 'right'],
      snapToGround: input.placement?.snapToGround !== false,
      defaultFacing: input.placement?.defaultFacing || 'right'
    },
    productionAssets: normalizeProductionAssets(input.productionAssets),
    authoringStatus: normalizeAuthoringStatus(input),
    exportTarget: objectExportTarget(id),
    exportPaths: createExportPaths(id),
    notes: String(input.notes || ''),
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function loadArchetype(input) {
  editorState.archetype = normalizeArchetype(input);
  editorState.selectedGameplayAction = '';
  validateCurrentArchetype();
  notifyChange();
}

export function resetArchetype() {
  editorState.archetype = createEmptyArchetype();
  editorState.selectedGameplayAction = '';
  validateCurrentArchetype();
  notifyChange();
}

export function applyRoleTemplate(roleId) {
  const template = ROLE_TEMPLATES[roleId];
  if (!template) return;
  const current = editorState.archetype;
  editorState.archetype = normalizeArchetype({
    ...current,
    role: roleId,
    category: template.category,
    subtype: template.subtype,
    visual: { ...current.visual, width: template.size.width, height: template.size.height },
    collision: template.collision,
    behaviour: { preset: template.behaviourPreset, flags: { ...template.flags } },
    animationProfile: { gameplayActions: [...template.gameplayActions], portraitActions: [...template.portraitActions] },
    productionAssets: { version: '1.36', requirements: {}, requirementOrder: [] }
  });
  validateCurrentArchetype();
  notifyChange();
}

export function updateArchetype(patch) {
  editorState.archetype = normalizeArchetype(deepMerge(editorState.archetype, patch));
  validateCurrentArchetype();
  notifyChange();
}

export function updateIdentity(fields) {
  const next = { ...editorState.archetype, ...fields };
  if (fields.id) next.id = normalizeObjectArchetypeId(fields.id);
  if (fields.tags !== undefined) next.tags = normalizeTags(fields.tags);
  editorState.archetype = normalizeArchetype(next);
  validateCurrentArchetype();
  notifyChange();
}

export function updateFlag(flagKey, value) { updateArchetype({ behaviour: { flags: { [flagKey]: Boolean(value) } } }); }

export function toggleGameplayAction(actionId) {
  const actions = new Set(editorState.archetype.animationProfile.gameplayActions);
  if (actions.has(actionId)) actions.delete(actionId); else actions.add(actionId);
  updateArchetype({ animationProfile: { gameplayActions: [...actions] } });
}

export function togglePortraitAction(actionId) {
  const actions = new Set(editorState.archetype.animationProfile.portraitActions);
  if (actions.has(actionId)) actions.delete(actionId); else actions.add(actionId);
  updateArchetype({ animationProfile: { portraitActions: [...actions] } });
}

export function selectGameplayAction(actionId) {
  editorState.selectedGameplayAction = editorState.selectedGameplayAction === actionId ? '' : actionId;
  notifyChange();
}

export function duplicateSelectedGameplayAction() {
  const action = editorState.selectedGameplayAction;
  if (!action) return false;
  const customAction = `${action}_variant`;
  const actions = new Set(editorState.archetype.animationProfile.gameplayActions);
  actions.add(customAction);
  updateArchetype({ animationProfile: { gameplayActions: [...actions] } });
  editorState.selectedGameplayAction = customAction;
  notifyChange();
  return true;
}

export function deleteSelectedGameplayAction() {
  const action = editorState.selectedGameplayAction;
  if (!action) return false;
  const actions = editorState.archetype.animationProfile.gameplayActions.filter((item) => item !== action);
  editorState.selectedGameplayAction = '';
  updateArchetype({ animationProfile: { gameplayActions: actions } });
  return true;
}

export function resetBounds() {
  const template = ROLE_TEMPLATES[editorState.archetype.role] || ROLE_TEMPLATES.person_npc_basic;
  updateArchetype({ visual: { width: template.size.width, height: template.size.height }, collision: template.collision });
}

export function setWorkspaceMode(mode) { editorState.workspaceMode = ['dark', 'white', 'scene'].includes(mode) ? mode : 'dark'; notifyChange(); }
export function toggleGrid() { editorState.showGrid = !editorState.showGrid; notifyChange(); }
export function toggleHelpers() { editorState.showHelpers = !editorState.showHelpers; notifyChange(); }
export function setZoom(value) { editorState.zoom = Math.min(3, Math.max(0.4, Number(value) || 1)); notifyChange(); }

export function validateCurrentArchetype() {
  const item = editorState.archetype;
  const warnings = [];
  if (!item.id) warnings.push({ type: 'error', message: 'Missing archetype ID.' });
  if (!item.id.startsWith(OBJECT_ARCHETYPE_PREFIX)) warnings.push({ type: 'error', message: `Object archetype IDs must start with ${OBJECT_ARCHETYPE_PREFIX}.` });
  if (item.exportTarget !== objectExportTarget(item.id)) warnings.push({ type: 'warn', message: 'Export target was normalised to the canonical archetypes/objects/ path.' });
  if (!item.name) warnings.push({ type: 'error', message: 'Missing display name.' });
  if (!item.category) warnings.push({ type: 'error', message: 'Missing category.' });
  if (item.animationProfile.gameplayActions.includes('talk')) warnings.push({ type: 'error', message: 'Gameplay action “talk” is not allowed. Dialogue belongs to portrait actions.' });
  if (item.behaviour.flags.usesPortrait && !item.animationProfile.portraitActions.length) warnings.push({ type: 'warn', message: 'This archetype uses portraits but has no portrait actions selected.' });
  if (item.behaviour.flags.hasCollision && item.collision.type === 'none') warnings.push({ type: 'warn', message: 'Collision flag is enabled, but collision type is none.' });
  if (item.behaviour.flags.collectible && !item.behaviour.flags.interactable) warnings.push({ type: 'warn', message: 'Collectible objects usually need interaction enabled.' });
  if (item.behaviour.flags.hostile && !item.animationProfile.gameplayActions.includes('attack')) warnings.push({ type: 'warn', message: 'Hostile archetype has no attack action.' });
  if (item.behaviour.flags.damageable && !item.animationProfile.gameplayActions.includes('take_damage')) warnings.push({ type: 'warn', message: 'Damageable archetype has no take damage action.' });
  if (!item.visual.spriteAssetId) warnings.push({ type: 'info', message: 'No gameplay sprite asset linked yet. Placeholder preview is being used.' });
  editorState.validation = warnings;
  return warnings;
}

export function serializeArchetype() { return JSON.stringify(editorState.archetype, null, 2); }
export function onStateChange(listener) { listeners.push(listener); return () => { listeners = listeners.filter((item) => item !== listener); }; }
export function notifyChange() { editorState.archetype.updatedAt = new Date().toISOString(); for (const listener of listeners) listener(editorState); }
export function objectExportTarget(id) { return `archetypes/objects/${normalizeObjectArchetypeId(id)}.json`; }
export function createExportPaths(id) { const normalizedId = normalizeObjectArchetypeId(id); return { objectIndex: OBJECT_INDEX_TARGET, objectFile: objectExportTarget(normalizedId) }; }
export function makeObjectArchetypeId(seed = Date.now().toString(36)) { return `${OBJECT_ARCHETYPE_PREFIX}${safeId(seed)}`; }
export function normalizeObjectArchetypeId(value) {
  const safe = safeId(value || makeObjectArchetypeId());
  if (safe.startsWith(OBJECT_ARCHETYPE_PREFIX)) return safe;
  if (safe.startsWith('object_')) return `${OBJECT_ARCHETYPE_PREFIX}${safe.slice('object_'.length)}`;
  return `${OBJECT_ARCHETYPE_PREFIX}${safe}`;
}

function normalizeTags(tags) { if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean); return String(tags || '').split(',').map((tag) => tag.trim()).filter(Boolean); }
function normalizeActionList(actions) { return [...new Set((Array.isArray(actions) ? actions : []).map((item) => String(item).trim()).filter(Boolean).filter((item) => item !== 'talk'))]; }
function normalizeProductionAssets(value) {
  const source = value && typeof value === 'object' ? value : {};
  const rawRequirements = source.requirements && typeof source.requirements === 'object' && !Array.isArray(source.requirements) ? source.requirements : {};
  const requirements = {};
  Object.entries(rawRequirements).forEach(([id, raw]) => {
    const requirement = raw && typeof raw === 'object' && !Array.isArray(raw) ? { ...raw } : {};
    const frames = Array.isArray(requirement.frames) ? requirement.frames.map((frame) => ({ ...(frame || {}) })) : [];
    requirement.frames = frames;
    requirement.frameCorrections = normalizeFrameCorrections(requirement, frames.length);
    delete requirement.correction;
    requirements[id] = requirement;
  });
  const requirementOrder = Array.isArray(source.requirementOrder) ? source.requirementOrder.map((id) => String(id)).filter(Boolean) : [];
  return { version: String(source.version || '1.36'), requirements, requirementOrder };
}
function normalizeFrameCorrections(requirement, frameCount) {
  const output = {};
  const source = requirement.frameCorrections && typeof requirement.frameCorrections === 'object' && !Array.isArray(requirement.frameCorrections) ? requirement.frameCorrections : {};
  Object.entries(source).forEach(([index, value]) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    output[String(Math.max(0, Number(index) || 0))] = normalizeCorrection(value);
  });
  if (Object.keys(output).length) return output;
  if (requirement.correction && typeof requirement.correction === 'object' && !Array.isArray(requirement.correction)) {
    const correction = normalizeCorrection(requirement.correction);
    const count = Math.max(1, Number(frameCount) || 0);
    for (let index = 0; index < count; index += 1) output[String(index)] = { ...correction };
  }
  return output;
}
function normalizeCorrection(value = {}) {
  return {
    scale: finiteNumber(value.scale, 0),
    x: finiteNumber(value.x, 0),
    y: finiteNumber(value.y, 0),
    brightness: finiteNumber(value.brightness, 0)
  };
}
function normalizeAuthoringStatus(input = {}) {
  const requested = input.authoringStatus === AUTHORING_STATUS.READY ? AUTHORING_STATUS.READY : AUTHORING_STATUS.IN_PROGRESS;
  return hasUnresolvedAuthoringMedia(input) ? AUTHORING_STATUS.IN_PROGRESS : requested;
}
function hasUnresolvedAuthoringMedia(input = {}) {
  const requirements = input.productionAssets?.requirements || {};
  return Object.values(requirements).some((requirement) => Array.isArray(requirement?.frames) && requirement.frames.some((frame) => {
    if (!frame || typeof frame !== 'object') return false;
    if (frame.previewOnly || frame.draftSourceName || frame.dataUrl || frame.staging?.path) return true;
    if ('assetId' in frame && !String(frame.assetId || '').startsWith('asset_')) return true;
    return false;
  }));
}
function safeId(value) { return String(value || 'object_archetype').trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '') || 'object_archetype'; }
function finiteNumber(value, fallback) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }
function clampNumber(value, fallback, min, max) { return Math.min(max, Math.max(min, finiteNumber(value, fallback))); }
function deepMerge(target, patch) {
  const output = Array.isArray(target) ? [...target] : { ...target };
  for (const [key, value] of Object.entries(patch || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value)) output[key] = deepMerge(output[key] || {}, value);
    else output[key] = value;
  }
  return output;
}
