import { editorState, updateArchetype } from './editor-state.js';
import { GAMEPLAY_ACTIONS, PORTRAIT_ACTIONS } from './templates.js';
import { appendNote, labelFor, WIZARD_DATA_VERSION } from './object-wizard-helpers.js?v=1.33';

export function createObjectWizardBuildRequirements({ renderBuildChecklist, updateProgressOrb }) {
  function buildRequirements(item) {
    const requirements = [];
    (item.animationProfile?.gameplayActions || []).forEach((actionId) => requirements.push({ id: `gameplay:${actionId}`, type: 'gameplay', actionId, label: labelFor(GAMEPLAY_ACTIONS, actionId), defaultMode: 'sprite_sheet' }));
    (item.animationProfile?.portraitActions || []).forEach((actionId) => requirements.push({ id: `portrait:${actionId}`, type: 'portrait', actionId, label: labelFor(PORTRAIT_ACTIONS, actionId), defaultMode: 'sprite_sheet' }));
    if (item.visual?.spriteAssetId !== undefined) requirements.push({ id: 'asset:gameplay_sprite', type: 'asset', actionId: 'gameplay_sprite_asset', label: 'Gameplay sprite asset link', defaultMode: 'metadata' });
    if (item.visual?.portraitAssetId !== undefined) requirements.push({ id: 'asset:dialogue_portrait', type: 'asset', actionId: 'dialogue_portrait_asset', label: 'Dialogue portrait asset link', defaultMode: 'metadata' });
    if (item.behaviour?.flags?.hasCollision) requirements.push({ id: 'runtime:collision', type: 'runtime', actionId: 'collision', label: 'Collision box / bounds', defaultMode: 'metadata' });
    if (item.behaviour?.flags?.interactable) requirements.push({ id: 'runtime:interaction', type: 'runtime', actionId: 'interaction', label: 'Interaction prompt / hotspot', defaultMode: 'metadata' });
    return orderedRequirements(requirements);
  }

  function ensureProductionAssets(requirements) {
    const current = editorState.archetype.productionAssets || {};
    const tasks = { ...(current.tasks || {}) };
    requirements.forEach((req) => {
      if (!tasks[req.id]) tasks[req.id] = { mode: req.defaultMode, frameCount: 0, fps: req.type === 'portrait' ? 10 : 8, frames: [], complete: false, notes: '' };
    });
    const order = mergeOrder(current.order || [], requirements.map((req) => req.id));
    updateArchetype({ productionAssets: { ...current, version: WIZARD_DATA_VERSION, order, tasks } });
  }

  function orderedRequirements(requirements) {
    const order = editorState.archetype.productionAssets?.order || [];
    const map = new Map(requirements.map((req) => [req.id, req]));
    return mergeOrder(order, requirements.map((req) => req.id)).map((id) => map.get(id)).filter(Boolean);
  }

  function mergeOrder(existing, ids) {
    const keep = existing.filter((id) => ids.includes(id));
    ids.forEach((id) => { if (!keep.includes(id)) keep.push(id); });
    return keep;
  }

  function moveRequirement(fromId, toId, requirements) {
    if (!fromId || !toId || fromId === toId) return;
    const ids = orderedRequirements(requirements).map((req) => req.id);
    const from = ids.indexOf(fromId);
    const to = ids.indexOf(toId);
    if (from < 0 || to < 0) return;
    const [id] = ids.splice(from, 1);
    ids.splice(to, 0, id);
    updateArchetype({ productionAssets: { ...(editorState.archetype.productionAssets || {}), order: ids } });
    renderBuildChecklist();
  }

  function getRequirementData(id) { return editorState.archetype.productionAssets?.tasks?.[id] || {}; }

  function setRequirementData(id, data) {
    const productionAssets = editorState.archetype.productionAssets || {};
    updateArchetype({ productionAssets: { ...productionAssets, version: WIZARD_DATA_VERSION, tasks: { ...(productionAssets.tasks || {}), [id]: data } } });
  }

  function syncVisualAssetFromTask(id, data) {
    if (id === 'asset:gameplay_sprite' && data.spriteSheetAssetId) updateArchetype({ visual: { spriteAssetId: data.spriteSheetAssetId } });
    if (id === 'asset:dialogue_portrait' && data.spriteSheetAssetId) updateArchetype({ visual: { portraitAssetId: data.spriteSheetAssetId } });
  }

  function updateRequirement(id, key, value) {
    const data = { ...getRequirementData(id), [key]: value };
    if (key === 'frameCount') data.frameCount = Number(value) || 0;
    if (key === 'fps') data.fps = Number(value) || 0;
    if (key === 'notes') data.notes = value;
    if (key === 'complete' && value) data.notes = appendNote(data.notes, 'Marked complete in Quick Start Wizard.');
    setRequirementData(id, data);
    syncVisualAssetFromTask(id, data);
    updateProgressOrb();
  }

  return { buildRequirements, ensureProductionAssets, orderedRequirements, moveRequirement, getRequirementData, setRequirementData, updateRequirement };
}
