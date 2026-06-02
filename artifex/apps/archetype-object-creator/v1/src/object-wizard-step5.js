import { editorState, updateArchetype } from './editor-state.js';
import { openSoundGeneratorModal } from '../../../../shared/sound-generator/sound-generator-window.js?v=0.1.0';

const VERSION = '1.36';

const ACTION_INFO = {
  idle: 'Default resting state. Usually loops and is returned to after short one-shot actions finish.',
  turn_face: 'Used when the object changes facing direction without changing position. Helps the engine select left/right/up/down variants.',
  walk: 'Used when the object moves under player input, AI patrol, scripted movement, or pathfinding. Often triggers repeated footstep audio events.',
  patrol_walk: 'Used for autonomous route movement. Usually maps to AI patrol state instead of direct player input.',
  move: 'General movement action for objects that slide, drift, push, float, or translate without a character walk cycle.',
  jump: 'Used for launch, air, and landing movement. Needs frame markers for launch sound, airborne state, and landing sound if used.',
  crouch_hide: 'Used for hiding, lowering profile, sneaking, or cover behaviour. May change collision height or visibility flags.',
  pickup: 'Used when an object is grabbed from the scene. Needs a pickup/grab frame marker and optional inventory completion marker.',
  hold_carry: 'Used while an object is being held, carried, or displayed in hands. Often loops until released or used.',
  throw: 'Used when a carried item or projectile is released. Needs a release frame marker and optional projectile spawn settings.',
  use_item: 'Used when an item activates an effect. It may trigger scene changes, inventory effects, sounds, or puzzle-state updates.',
  gesture: 'Non-combat body animation such as point, wave, warn, beckon, or react. Usually one-shot then returns to idle.',
  attack: 'Combat action. Needs hit-frame windows, optional weapon/projectile spawn frame, and impact audio/effect markers.',
  open: 'Object changes to open state. Usually one-shot, then holds final state or switches to an opened variant.',
  close: 'Object changes to closed state. Usually one-shot, then holds final state or switches to a closed variant.',
  collect: 'Used when the object is picked up/collected by contact or interaction. Often removes the object after completion.',
  activate: 'Object begins or performs an active state, such as lever on, rune lit, mechanism running.',
  trigger: 'Object fires a scene event, trap, puzzle signal, or script action.',
  reset: 'Object returns to default state after activation, failure, timer, or puzzle reset.'
};

const DEFAULT_PLAYBACK = { loop: false, pingPong: false, holdLastFrame: false, returnToIdle: true, interruptible: true, priority: 5, blendFrames: 0 };
const DEFAULT_TRIGGER = { source: 'auto', inputAction: '', keyboard: '', gamepad: '', touch: '', aiState: '', sceneEvent: '' };
const FRAME_EVENT_TYPES = ['play_sound', 'hitbox_on', 'hitbox_off', 'spawn_object', 'release_projectile', 'complete_action', 'transition', 'custom'];
const TRIGGER_SOURCES = ['auto', 'player_input', 'ai_state', 'interaction_button', 'collision_contact', 'quest_event', 'scene_script', 'timer', 'cutscene'];

export function initObjectWizardStep5() {
  injectStep5CoreStyles();
}

export function bindObjectWizardStep5Detail(container, requirementId) {
  if (!container || !requirementId) return;
  enhanceActionTitle(container, requirementId);
  bindActionBehaviour(container, requirementId);
  bindSoundEvents(container, requirementId);
}

function injectStep5CoreStyles() {
  if (document.getElementById('object-wizard-step5-core-styles')) return;
  const style = document.createElement('style');
  style.id = 'object-wizard-step5-core-styles';
  style.textContent = `
    #quickstart-dialog .wizard-step5-toolbar{display:flex!important;flex-wrap:wrap!important;gap:6px!important;margin:0 0 10px!important}
    #quickstart-dialog .wizard-step5-toolbar button{min-height:28px!important;padding:4px 9px!important;font-size:11px!important;white-space:nowrap!important}
    #quickstart-dialog .wizard-build-shell{grid-template-columns:minmax(210px,300px) minmax(0,1fr)!important;gap:12px!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important}
    #quickstart-dialog .wizard-build-left{min-width:0!important;max-width:100%!important;box-sizing:border-box!important}
    #quickstart-dialog .wizard-build-nav button{grid-template-columns:auto auto minmax(0,1fr) auto!important;gap:7px!important;padding:7px 8px!important;min-width:0!important;font-size:11px!important}
    #quickstart-dialog .wizard-task-copy{display:block!important;min-width:0!important;overflow:hidden!important}
    #quickstart-dialog .wizard-task-copy strong,#quickstart-dialog .wizard-task-copy small{display:block!important;white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.25}
    #quickstart-dialog .wizard-task-copy strong{font-size:11px!important}
    #quickstart-dialog .wizard-task-copy small{margin-top:2px!important;color:rgba(255,240,206,.58)!important;font-size:9px!important}
    #quickstart-dialog .wizard-build-nav em{white-space:nowrap!important;align-self:center!important;font-size:9px!important}
    #quickstart-dialog .wizard-build-detail-panel{display:grid!important;grid-template-columns:minmax(250px,.82fr) minmax(330px,1.18fr)!important;grid-auto-rows:min-content!important;align-items:start!important;align-content:start!important;gap:10px 12px!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;overflow:visible!important}
    #quickstart-dialog .wizard-step5-left,#quickstart-dialog .wizard-step5-right{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-auto-rows:min-content!important;align-content:start!important;gap:8px!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;margin:0!important;position:static!important}
    #quickstart-dialog .wizard-step5-left{grid-column:1!important;grid-row:1!important}
    #quickstart-dialog .wizard-step5-right{grid-column:2!important;grid-row:1!important}
    #quickstart-dialog .wizard-step5-right>.wizard-build-title{grid-column:1!important;grid-row:auto!important;display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:8px!important;min-width:0!important;max-width:100%!important;margin:0 0 4px!important;position:static!important}
    #quickstart-dialog .wizard-step5-right>.wizard-action-info-text{grid-column:1!important;grid-row:auto!important;display:block!important;position:static!important;float:none!important;clear:both!important;min-width:0!important;max-width:100%!important;margin:0 0 4px!important;color:rgba(255,240,206,.72)!important;font-size:11px!important;line-height:1.35!important}
    #quickstart-dialog .wizard-step5-right .wizard-right-stack,#quickstart-dialog .wizard-step5-right .wizard-build-fields,#quickstart-dialog .wizard-step5-right .wizard-action-behaviour-panel,#quickstart-dialog .wizard-step5-right .wizard-sound-list,#quickstart-dialog .wizard-step5-right .wizard-notes-field{grid-column:1!important;grid-row:auto!important;display:block;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;margin-left:0!important;margin-right:0!important;position:static!important;float:none!important;clear:both!important}
    #quickstart-dialog .wizard-right-stack{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:8px!important;margin:0!important;min-width:0!important;align-content:start!important}
    #quickstart-dialog .wizard-step5-right .wizard-build-fields{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;margin:0!important}
    #quickstart-dialog .wizard-field-asset-path,#quickstart-dialog .wizard-notes-field{grid-column:1/-1!important}
    #quickstart-dialog .wizard-step5-right label{min-width:0!important;max-width:100%!important;box-sizing:border-box!important;font-size:11px!important}
    #quickstart-dialog .wizard-step5-right input:not([type='checkbox']):not([type='range']),#quickstart-dialog .wizard-step5-right select,#quickstart-dialog .wizard-step5-right textarea{width:100%!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;padding:5px 7px!important;font-size:11px!important}
    #quickstart-dialog .wizard-step5-right textarea{resize:vertical!important}
    #quickstart-dialog .wizard-title-complete{margin-left:auto!important;min-width:0!important;display:inline-flex!important;align-items:center!important;gap:8px!important;padding:6px 10px!important;border:1px solid rgba(126,212,150,.38)!important;border-radius:999px!important;background:rgba(72,192,113,.12)!important;font-size:11px!important;letter-spacing:0!important;text-transform:none!important}
    #quickstart-dialog .wizard-title-complete span{font-size:11px!important;font-weight:700!important;white-space:nowrap!important}
    #quickstart-dialog .wizard-sound-list,#quickstart-dialog .wizard-action-behaviour-panel{border:1px solid rgba(226,204,167,.18);border-radius:14px;background:rgba(0,0,0,.14);padding:8px 10px!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important}
    #quickstart-dialog .wizard-sound-list summary,#quickstart-dialog .wizard-action-behaviour-panel summary{display:block!important;position:static!important;cursor:pointer;color:#fff0ce;font-weight:800;margin:0!important;padding:0!important;line-height:1.35!important}
    #quickstart-dialog .wizard-sound-list summary{display:flex!important;align-items:center!important;gap:7px!important;min-width:0!important}
    #quickstart-dialog .wizard-sound-summary-label{flex:1;min-width:0}
    #quickstart-dialog .wizard-create-sound-button{flex:none;display:inline-flex;align-items:center;justify-content:center;width:29px!important;min-width:29px!important;height:29px!important;min-height:29px!important;padding:0!important;border-radius:8px!important;font-size:14px!important}
    #quickstart-dialog .wizard-behaviour-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px 10px!important;margin-top:8px!important;min-width:0!important}
    #quickstart-dialog .wizard-check-line{display:flex!important;flex-direction:row!important;align-items:center!important;gap:8px!important}
    #quickstart-dialog .wizard-action-behaviour-panel h4{margin:12px 0 6px!important}
    #quickstart-dialog .wizard-action-behaviour-panel .wizard-add-frame-event{margin-top:8px!important}
    #quickstart-dialog .wizard-empty-events{margin:6px 0 0!important;color:rgba(255,240,206,.62)!important;font-size:11px!important}
    #quickstart-dialog .wizard-sound-row,#quickstart-dialog .wizard-frame-event-row{display:grid!important;grid-template-columns:20px minmax(0,1.35fr) minmax(64px,.72fr) repeat(3,minmax(45px,.48fr)) 27px!important;gap:4px!important;align-items:center!important;margin-top:7px!important;min-width:0!important}
    #quickstart-dialog .wizard-frame-event-row{grid-template-columns:20px minmax(48px,.42fr) minmax(78px,.72fr) minmax(0,1fr) 27px!important}
    #quickstart-dialog .wizard-sound-row>*,#quickstart-dialog .wizard-frame-event-row>*{min-width:0!important;max-width:100%!important;box-sizing:border-box!important}
    #quickstart-dialog .wizard-step5-left .wizard-preview-stage{grid-column:1!important;grid-row:auto!important;width:100%!important;max-width:none!important;height:clamp(250px,34vh,330px)!important;min-height:250px!important;max-height:330px!important;margin:0!important;align-self:start!important}
    #quickstart-dialog .wizard-step5-left .wizard-preview-controls{grid-column:1!important;grid-row:auto!important;display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:8px!important;margin:2px 0 0!important;position:relative!important;min-width:0!important}
    #quickstart-dialog .wizard-step5-left .wizard-reference-panel{grid-column:1!important;grid-row:auto!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;margin:2px 0 0!important;padding-top:8px!important;border-top:1px solid rgba(226,204,167,.18)!important}
    #quickstart-dialog .wizard-correction-popover{position:relative;z-index:4;width:min(100%,620px);border:1px solid rgba(226,204,167,.22);border-radius:16px;background:rgba(18,13,11,.98);box-shadow:0 14px 32px rgba(0,0,0,.55);padding:10px}
    #quickstart-dialog .wizard-correction-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}.wizard-correction-title{flex:1;color:#fff0ce;font-weight:800}
    #quickstart-dialog .wizard-correction-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px 12px!important;border-radius:14px!important;padding:10px!important}
    #quickstart-dialog .wizard-correction-grid input[type='range']{width:100%!important}.wizard-correction-grid button[data-match-brightness]{grid-column:1/-1;width:100%}
    #quickstart-dialog .wizard-correction-control{display:grid;grid-template-columns:52px;gap:6px;align-items:center;justify-content:center;margin:6px auto 0}.wizard-correction-control output{text-align:center;color:#fff0ce;border:1px solid rgba(226,204,167,.18);border-radius:999px;padding:3px 7px;background:rgba(0,0,0,.22)}
    @media(max-width:1100px){#quickstart-dialog .wizard-build-shell{grid-template-columns:1fr!important}#quickstart-dialog .wizard-build-detail-panel{grid-template-columns:1fr!important}#quickstart-dialog .wizard-step5-left,#quickstart-dialog .wizard-step5-right{grid-column:1!important;grid-row:auto!important}}
    @media(max-width:680px){#quickstart-dialog .wizard-step5-right .wizard-build-fields,#quickstart-dialog .wizard-behaviour-grid,#quickstart-dialog .wizard-sound-row,#quickstart-dialog .wizard-frame-event-row{grid-template-columns:1fr!important}}
  `;
  document.head.appendChild(style);
}

function enhanceActionTitle(container, requirementId) {
  const h3 = container.querySelector('.wizard-build-title');
  if (!h3) return;
  const readyField = container.querySelector('[data-build="complete"]')?.closest('label');
  if (readyField) {
    readyField.classList.add('wizard-title-complete');
    readyField.title = 'Mark only this selected task as ready. This does not save the project or mark the object ready.';
    const label = readyField.querySelector('span');
    if (label) label.textContent = 'Mark Task Ready';
    if (!h3.contains(readyField)) h3.appendChild(readyField);
  }
  const info = container.querySelector('.wizard-action-info-text');
  if (info) info.textContent = ACTION_INFO[actionIdFromRequirement(requirementId)] || `Defines how ${humanize(actionIdFromRequirement(requirementId))} behaves, what triggers it, how it plays back, which sounds fire, and which frame events affect gameplay.`;
}

function bindSoundEvents(container, requirementId) {
  const details = container.querySelector('.wizard-sound-list');
  const soundField = container.querySelector('[data-build="soundAssetId"]');
  const rows = container.querySelector('.wizard-sound-rows');
  if (!details || !soundField || !rows) return;
  const data = getRequirementData(requirementId);
  const soundEvents = Array.isArray(data.soundEvents)
    ? data.soundEvents
    : splitSoundValues(soundField.value).map((assetId) => ({ assetId, trigger: 'frame', frame: '', volume: 1, pitchVariance: 0, spatial: false, loop: false, stopOnEnd: true, cooldown: 0 }));
  renderSoundRows(rows, soundField, requirementId, soundEvents);
  details.querySelector('.wizard-add-sound-button')?.addEventListener('click', () => {
    const current = readSoundRows(rows);
    current.push({ assetId: '', trigger: 'frame', frame: '', volume: 1, pitchVariance: 0, spatial: false, loop: false, stopOnEnd: true, cooldown: 0 });
    writeRequirementData(requirementId, { soundEvents: current });
    renderSoundRows(rows, soundField, requirementId, current);
  });
  details.querySelector('.wizard-create-sound-button')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const target = captureSoundTarget(rows, requirementId);
    openSoundGeneratorModal({ sourceLabel: `Archetype Object Creator > ${humanize(actionIdFromRequirement(requirementId))} > Sound Events`, onAssign: ({ assetId }) => assignGeneratedSound(target, assetId) });
  });
}

function renderSoundRows(rows, soundField, requirementId, soundEvents) {
  rows.innerHTML = '';
  (soundEvents.length ? soundEvents : [{ assetId: '', trigger: 'frame', frame: '', volume: 1, pitchVariance: 0, spatial: false, loop: false, stopOnEnd: true, cooldown: 0 }]).forEach((event, index) => addSoundRow(rows, soundField, requirementId, event, index));
}

function captureSoundTarget(rows, requirementId) {
  const index = Array.from(rows.querySelectorAll('[data-sound="assetId"]')).findIndex((field) => !field.value.trim());
  return { requirementId, rowIndex: index >= 0 ? index : rows.querySelectorAll('.wizard-sound-row').length };
}

function assignGeneratedSound(target, assetId) {
  if (!assetId || !target?.requirementId) return;
  const data = getRequirementData(target.requirementId);
  const events = Array.isArray(data.soundEvents) ? [...data.soundEvents] : [];
  while (events.length <= target.rowIndex) events.push({ assetId: '', trigger: 'frame', frame: '', volume: 1, pitchVariance: 0, spatial: false, loop: false, stopOnEnd: true, cooldown: 0 });
  events[target.rowIndex] = { ...events[target.rowIndex], assetId };
  writeRequirementData(target.requirementId, { soundEvents: events, soundAssetId: events.map((item) => item.assetId).filter(Boolean).join(', ') });
  toast(`Assigned generated sound to ${humanize(actionIdFromRequirement(target.requirementId))}: ${assetId}`, 'success');
}

function addSoundRow(rows, soundField, requirementId, event, index) {
  const row = document.createElement('div');
  row.className = 'wizard-sound-row';
  row.innerHTML = `<span>${index + 1}</span><input data-sound="assetId" value="${escapeHtml(event.assetId || event.path || '')}" placeholder="asset_sfx_object_action" title="Registered sound asset ID" /><select data-sound="trigger" title="When this sound plays"><option value="frame">frame</option><option value="start">start</option><option value="end">end</option><option value="loop">loop</option><option value="random">random</option></select><input data-sound="frame" type="number" min="0" value="${escapeHtml(event.frame ?? '')}" placeholder="Frame" title="Frame number" /><input data-sound="volume" type="number" min="0" max="2" step="0.05" value="${escapeHtml(event.volume ?? 1)}" title="Volume" /><input data-sound="pitchVariance" type="number" min="0" max="1" step="0.01" value="${escapeHtml(event.pitchVariance ?? 0)}" title="Pitch variance" /><button type="button" title="Remove this sound row">×</button>`;
  row.querySelector('[data-sound="trigger"]').value = event.trigger || 'frame';
  row.querySelectorAll('[data-sound]').forEach((input) => input.addEventListener('input', () => syncSoundRows(rows, soundField, requirementId)));
  row.querySelectorAll('select[data-sound]').forEach((input) => input.addEventListener('change', () => syncSoundRows(rows, soundField, requirementId)));
  row.querySelector('button')?.addEventListener('click', () => { row.remove(); syncSoundRows(rows, soundField, requirementId); });
  rows.appendChild(row);
}

function readSoundRows(rows) {
  return Array.from(rows.querySelectorAll('.wizard-sound-row')).map((row) => ({
    assetId: row.querySelector('[data-sound="assetId"]')?.value.trim() || '',
    trigger: row.querySelector('[data-sound="trigger"]')?.value || 'frame',
    frame: row.querySelector('[data-sound="frame"]')?.value || '',
    volume: Number(row.querySelector('[data-sound="volume"]')?.value || 1),
    pitchVariance: Number(row.querySelector('[data-sound="pitchVariance"]')?.value || 0),
    spatial: false, loop: false, stopOnEnd: true, cooldown: 0
  })).filter((item) => item.assetId || item.frame);
}

function syncSoundRows(rows, soundField, requirementId) {
  const values = readSoundRows(rows);
  soundField.value = values.map((item) => item.assetId).filter(Boolean).join(', ');
  writeRequirementData(requirementId, { soundEvents: values, soundAssetId: soundField.value });
  soundField.dispatchEvent(new Event('input', { bubbles: true }));
  soundField.dispatchEvent(new Event('change', { bubbles: true }));
}

function bindActionBehaviour(container, requirementId) {
  const section = container.querySelector('.wizard-action-behaviour-panel');
  if (!section) return;
  const data = getRequirementData(requirementId);
  const playback = { ...DEFAULT_PLAYBACK, ...(data.playbackRules || {}) };
  const trigger = { ...DEFAULT_TRIGGER, ...(data.triggerMapping || {}) };
  const frameEvents = Array.isArray(data.frameEvents) ? data.frameEvents : [];
  section.innerHTML = `<summary>🎮 Action Behaviour</summary><div class="wizard-behaviour-grid"><label>Trigger source<select data-trigger="source" title="What starts this action">${TRIGGER_SOURCES.map((item) => `<option value="${item}">${humanize(item)}</option>`).join('')}</select></label><label>Input/action name<input data-trigger="inputAction" value="${escapeHtml(trigger.inputAction)}" placeholder="move_left, interact, attack" /></label><label>Keyboard<input data-trigger="keyboard" value="${escapeHtml(trigger.keyboard)}" placeholder="WASD, Space, E" /></label><label>Gamepad<input data-trigger="gamepad" value="${escapeHtml(trigger.gamepad)}" placeholder="Left stick, A, RT" /></label><label>Touch<input data-trigger="touch" value="${escapeHtml(trigger.touch)}" placeholder="Swipe, tap, hold" /></label><label>AI / scene state<input data-trigger="aiState" value="${escapeHtml(trigger.aiState)}" placeholder="patrol, alert, scripted" /></label><label class="wizard-check-line"><input type="checkbox" data-playback="loop" ${playback.loop ? 'checked' : ''}/> Loop</label><label class="wizard-check-line"><input type="checkbox" data-playback="returnToIdle" ${playback.returnToIdle ? 'checked' : ''}/> Return to idle</label><label class="wizard-check-line"><input type="checkbox" data-playback="interruptible" ${playback.interruptible ? 'checked' : ''}/> Interruptible</label><label class="wizard-check-line"><input type="checkbox" data-playback="holdLastFrame" ${playback.holdLastFrame ? 'checked' : ''}/> Hold last frame</label><label>Priority<input data-playback="priority" type="number" min="0" max="10" value="${escapeHtml(playback.priority)}" /></label><label>Blend frames<input data-playback="blendFrames" type="number" min="0" max="30" value="${escapeHtml(playback.blendFrames)}" /></label></div><h4>Frame Events</h4><div data-frame-events></div><button type="button" class="wizard-add-frame-event">➕ Add Frame Event</button>`;
  section.querySelector('[data-trigger="source"]').value = trigger.source || 'auto';
  section.querySelectorAll('[data-trigger]').forEach((input) => input.addEventListener('input', () => saveTriggerMapping(section, requirementId)));
  section.querySelectorAll('select[data-trigger]').forEach((input) => input.addEventListener('change', () => saveTriggerMapping(section, requirementId)));
  section.querySelectorAll('[data-playback]').forEach((input) => input.addEventListener('input', () => savePlaybackRules(section, requirementId)));
  section.querySelectorAll('input[type="checkbox"][data-playback]').forEach((input) => input.addEventListener('change', () => savePlaybackRules(section, requirementId)));
  renderFrameEvents(section, requirementId, frameEvents);
  section.querySelector('.wizard-add-frame-event')?.addEventListener('click', () => {
    const current = readFrameEvents(section);
    current.push({ frame: '', eventType: 'custom', payload: '' });
    writeRequirementData(requirementId, { frameEvents: current });
    renderFrameEvents(section, requirementId, current);
  });
}

function saveTriggerMapping(section, requirementId) {
  const triggerMapping = { ...DEFAULT_TRIGGER };
  section.querySelectorAll('[data-trigger]').forEach((input) => { triggerMapping[input.dataset.trigger] = input.value; });
  writeRequirementData(requirementId, { triggerMapping });
}
function savePlaybackRules(section, requirementId) {
  const playbackRules = { ...DEFAULT_PLAYBACK };
  section.querySelectorAll('[data-playback]').forEach((input) => { playbackRules[input.dataset.playback] = input.type === 'checkbox' ? input.checked : Number.isFinite(Number(input.value)) ? Number(input.value) : input.value; });
  writeRequirementData(requirementId, { playbackRules });
}
function renderFrameEvents(section, requirementId, frameEvents) {
  const list = section.querySelector('[data-frame-events]');
  if (!list) return;
  list.innerHTML = '';
  if (!frameEvents.length) {
    list.innerHTML = '<p class="wizard-empty-events">No frame events added.</p>';
    return;
  }
  frameEvents.forEach((event, index) => {
    const row = document.createElement('div');
    row.className = 'wizard-frame-event-row';
    row.innerHTML = `<span>${index + 1}</span><input data-frame-event="frame" type="number" min="0" value="${escapeHtml(event.frame ?? '')}" placeholder="Frame" /><select data-frame-event="eventType">${FRAME_EVENT_TYPES.map((item) => `<option value="${item}">${humanize(item)}</option>`).join('')}</select><input data-frame-event="payload" value="${escapeHtml(event.payload || '')}" placeholder="sound asset ID, object ID, note" /><button type="button" title="Remove this frame event">×</button>`;
    row.querySelector('[data-frame-event="eventType"]').value = event.eventType || 'custom';
    row.querySelectorAll('[data-frame-event]').forEach((input) => input.addEventListener('input', () => writeRequirementData(requirementId, { frameEvents: readFrameEvents(section, true) })));
    row.querySelectorAll('select[data-frame-event]').forEach((input) => input.addEventListener('change', () => writeRequirementData(requirementId, { frameEvents: readFrameEvents(section, true) })));
    row.querySelector('button')?.addEventListener('click', () => { row.remove(); const remaining = readFrameEvents(section, true); writeRequirementData(requirementId, { frameEvents: remaining }); renderFrameEvents(section, requirementId, remaining); });
    list.appendChild(row);
  });
}
function readFrameEvents(section, preserveBlankRows = false) {
  const events = Array.from(section.querySelectorAll('.wizard-frame-event-row')).map((row) => ({ frame: row.querySelector('[data-frame-event="frame"]')?.value || '', eventType: row.querySelector('[data-frame-event="eventType"]')?.value || 'custom', payload: row.querySelector('[data-frame-event="payload"]')?.value || '' }));
  return preserveBlankRows ? events : events.filter((item) => item.frame || item.payload || item.eventType !== 'custom');
}
function writeRequirementData(requirementId, updates) {
  if (!requirementId) return;
  const current = editorState.archetype?.productionAssets || { version: VERSION, requirements: {}, requirementOrder: [] };
  updateArchetype({ productionAssets: { ...current, version: VERSION, requirements: { ...(current.requirements || {}), [requirementId]: { ...((current.requirements || {})[requirementId] || {}), ...updates } } } });
}
function getRequirementData(requirementId) { return editorState.archetype?.productionAssets?.requirements?.[requirementId] || {}; }
function actionIdFromRequirement(requirementId) { return String(requirementId || '').split(':')[1] || String(requirementId || 'asset'); }
function splitSoundValues(value) { return String(value || '').split(/[\n,]+/).map((item) => item.trim()).filter(Boolean); }
function humanize(value) { return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function toast(message, type) { window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message, type } })); }
