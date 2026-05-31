import { editorState, updateArchetype } from './editor-state.js';
import { openSoundGeneratorModal } from '../../../../shared/sound-generator/sound-generator-window.js?v=0.1.0';

const VERSION = '1.35';

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
  give_item: 'Used when handing something to another character or container. Needs handoff/completion frame marker if game logic waits for it.',
  receive_item: 'Used when accepting an item from another object. May trigger inventory, quest, or dialogue changes.',
  interact_assist: 'Generic interaction support animation, usually triggered by an interaction prompt, quest event, or helper action.',
  sing_magic_cast: 'Performance or magic vocal casting. Usually uses longer timing, channel audio, and frame markers for glow/effect moments.',
  cast_ritual: 'Ritual/casting animation. Often loops or channels until a script, timer, or quest condition completes.',
  channel: 'Sustained magical or energy state. Usually looped and stopped by an external trigger or action transition.',
  attack: 'Combat action. Needs hit-frame windows, optional weapon/projectile spawn frame, and impact audio/effect markers.',
  special_attack: 'Higher-priority combat action with stronger timing, VFX, cooldown, and possible non-interruptible playback.',
  take_damage: 'Reaction to harm. Usually one-shot, briefly interrupts current action, then returns to previous or idle state.',
  stunned: 'Temporary disabled state. Often looped until a timer or gameplay event releases the object.',
  phase_change: 'Transformation or state swap. Usually non-interruptible and may switch archetype state, visibility, or collision rules.',
  death: 'Removal, fall, vanish, or destruction animation. Usually does not return to idle and may end by disabling the object.',
  enter_door: 'Transition into a doorway, portal, or passage. Needs a completion/transition frame marker.',
  exit_door: 'Transition out of a doorway or portal. Often paired with spawn-position and facing-direction rules.',
  open: 'Object changes to open state. Usually one-shot, then holds final state or switches to an opened variant.',
  close: 'Object changes to closed state. Usually one-shot, then holds final state or switches to a closed variant.',
  locked: 'Feedback action for blocked interaction. Usually short shake, rattle, glow, or denied sound.',
  collect: 'Used when the object is picked up/collected by contact or interaction. Often removes the object after completion.',
  searched_opened: 'Used when a cache or container has been searched. Often switches visual state to opened/empty.',
  activate: 'Object begins or performs an active state, such as lever on, rune lit, mechanism running.',
  trigger: 'Object fires a scene event, trap, puzzle signal, or script action.',
  reset: 'Object returns to default state after activation, failure, timer, or puzzle reset.',
  land_break: 'Impact/break action for thrown objects, falling objects, hazards, or destructible props.',
  possession_overlay: 'Overlay/FX state used when an object is possessed, controlled, cursed, or influenced.'
};

const DEFAULT_PLAYBACK = { loop: false, pingPong: false, holdLastFrame: false, returnToIdle: true, interruptible: true, priority: 5, blendFrames: 0 };
const DEFAULT_TRIGGER = { source: 'auto', inputAction: '', keyboard: '', gamepad: '', touch: '', aiState: '', sceneEvent: '' };
const FRAME_EVENT_TYPES = ['play_sound', 'hitbox_on', 'hitbox_off', 'spawn_object', 'release_projectile', 'complete_action', 'transition', 'custom'];
const TRIGGER_SOURCES = ['auto', 'player_input', 'ai_state', 'interaction_button', 'collision_contact', 'quest_event', 'scene_script', 'timer', 'cutscene'];
let step5Observer = null;
let step5Queued = false;

export function initObjectWizardStep5() {
  injectStep5CoreStyles();
  if (!step5Observer) {
    step5Observer = new MutationObserver(scheduleStep5Refresh);
    step5Observer.observe(document.body, { childList: true, subtree: true });
  }
  scheduleStep5Refresh();
}

function injectStep5CoreStyles() {
  if (document.getElementById('object-wizard-step5-core-styles')) return;
  const style = document.createElement('style');
  style.id = 'object-wizard-step5-core-styles';
  style.textContent = `
    #quickstart-dialog .wizard-right-stack{display:grid;grid-template-columns:1fr;gap:10px;min-width:0;align-content:start}
    #quickstart-dialog .wizard-action-info-button{width:28px!important;height:28px!important;min-width:28px!important;min-height:28px!important;padding:0!important;border-radius:999px!important;font-size:13px!important;line-height:1!important}
    #quickstart-dialog .wizard-action-info-text{grid-column:2;margin:-2px 0 4px;color:rgba(255,240,206,.72);font-size:12px;line-height:1.35}
    #quickstart-dialog .wizard-title-complete{margin-left:auto!important;min-width:0!important;display:inline-flex!important;align-items:center!important;gap:8px!important;padding:6px 10px!important;border:1px solid rgba(126,212,150,.38)!important;border-radius:999px!important;background:rgba(72,192,113,.12)!important;font-size:11px!important;letter-spacing:0!important;text-transform:none!important}
    #quickstart-dialog .wizard-title-complete span{font-size:11px!important;font-weight:700!important;white-space:nowrap!important}
    #quickstart-dialog .wizard-field-hidden{display:none!important}
    #quickstart-dialog .wizard-action-meta{margin:-2px 0 8px;color:rgba(255,240,206,.62);font-size:11px}
    #quickstart-dialog .wizard-sound-list,#quickstart-dialog .wizard-action-behaviour-panel{border:1px solid rgba(226,204,167,.18);border-radius:14px;background:rgba(0,0,0,.14);padding:8px 10px}
    #quickstart-dialog .wizard-sound-list summary,#quickstart-dialog .wizard-action-behaviour-panel summary{cursor:pointer;color:#fff0ce;font-weight:800}
    #quickstart-dialog .wizard-sound-list summary{display:flex;align-items:center;gap:7px;min-width:0}
    #quickstart-dialog .wizard-sound-summary-label{flex:1;min-width:0}
    #quickstart-dialog .wizard-create-sound-button{flex:none;display:inline-flex;align-items:center;justify-content:center;width:29px!important;min-width:29px!important;height:29px!important;min-height:29px!important;padding:0!important;border-radius:8px!important;font-size:14px!important}
    #quickstart-dialog .wizard-behaviour-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 10px;margin-top:8px}
    #quickstart-dialog .wizard-check-line{display:flex!important;flex-direction:row!important;align-items:center!important;gap:8px!important}
    #quickstart-dialog .wizard-sound-row,#quickstart-dialog .wizard-frame-event-row{display:grid;grid-template-columns:24px minmax(120px,1.2fr) minmax(86px,.7fr) 72px 72px 72px 30px;gap:6px;align-items:center;margin-top:7px}
    #quickstart-dialog .wizard-frame-event-row{grid-template-columns:24px 72px minmax(110px,.7fr) minmax(150px,1fr) 30px}
    #quickstart-dialog .wizard-sound-row>span,#quickstart-dialog .wizard-frame-event-row>span{color:rgba(255,240,206,.64);text-align:center}
    @media(max-width:900px){#quickstart-dialog .wizard-behaviour-grid,#quickstart-dialog .wizard-sound-row,#quickstart-dialog .wizard-frame-event-row{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function scheduleStep5Refresh() {
  if (step5Queued) return;
  step5Queued = true;
  window.requestAnimationFrame(() => {
    step5Queued = false;
    enhanceStep5WizardPanel();
  });
}

function enhanceStep5WizardPanel() {
  const root = document.querySelector('#quickstart-dialog .wizard-content');
  const panel = root?.querySelector('.wizard-build-detail-panel');
  if (!panel) return;
  enhancePlayerControls(root);
  const selectedId = selectedRequirementId();
  if (!selectedId) return;
  const metaText = panel.querySelector(':scope > p.hint')?.textContent?.trim() || '';
  enhanceActionTitle(panel, selectedId);
  const fields = panel.querySelector(':scope > .wizard-build-fields, .wizard-right-stack > .wizard-build-fields');
  if (!fields) return;
  let rightStack = panel.querySelector('.wizard-right-stack');
  if (!rightStack) {
    rightStack = document.createElement('section');
    rightStack.className = 'wizard-right-stack';
    fields.before(rightStack);
  }
  if (fields.parentElement !== rightStack) rightStack.appendChild(fields);
  arrangeFields(fields, metaText);
  enhanceSoundList(rightStack, fields.querySelector('[data-build="soundAssetId"]'));
  enhanceActionBehaviour(rightStack, selectedId);
  const notesField = panel.querySelector('textarea[data-build="notes"]')?.closest('label');
  if (notesField) {
    notesField.classList.add('wizard-notes-field');
    if (notesField.parentElement !== rightStack) rightStack.appendChild(notesField);
  }
  const strip = panel.querySelector('[data-frame-strip]');
  if (strip) {
    strip.classList.add('wizard-frame-drop-zone');
    const hint = strip.querySelector('.hint');
    if (hint && !strip.querySelector('.wizard-frame-box')) hint.textContent = 'Drop image files here, or use 🖼️ Add Images below.';
  }
  const actions = panel.querySelector('.wizard-build-actions');
  if (actions) {
    const addImages = actions.querySelector('label.button-like');
    if (addImages) setLabelButtonText(addImages, '🖼️ Add Images');
    setButtonText(actions.querySelector('[data-empty-frame]'), '➕ Add Empty Frame Slot');
  }
}

function arrangeFields(fields, metaText) {
  const mode = fields.querySelector('[data-build="mode"]')?.closest('label');
  const frameCount = fields.querySelector('[data-build="frameCount"]')?.closest('label');
  const fps = fields.querySelector('[data-build="fps"]')?.closest('label');
  const asset = fields.querySelector('[data-build="spriteSheetAssetId"]')?.closest('label');
  const sound = fields.querySelector('[data-build="soundAssetId"]')?.closest('label');
  const ready = fields.querySelector('[data-build="complete"]')?.closest('label');
  [mode, frameCount, fps, asset].filter(Boolean).forEach((node) => fields.appendChild(node));
  asset?.classList.add('wizard-field-asset-path');
  let meta = fields.querySelector('.wizard-action-meta');
  if (!meta && metaText) {
    meta = document.createElement('div');
    meta.className = 'wizard-action-meta';
    asset?.after(meta);
  }
  if (meta) meta.textContent = metaText;
  sound?.classList.add('wizard-field-hidden');
  ready?.classList.add('wizard-field-hidden');
}

function enhanceActionTitle(panel, requirementId) {
  const h3 = panel.querySelector(':scope > h3');
  if (!h3) return;
  if (!h3.querySelector('.wizard-action-info-button')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wizard-action-info-button';
    button.textContent = 'i';
    button.title = 'Explain this gameplay action';
    h3.appendChild(button);
    button.addEventListener('click', () => {
      const text = panel.querySelector(':scope > .wizard-action-info-text');
      if (text) text.hidden = !text.hidden;
    });
  }
  const readyField = panel.querySelector('[data-build="complete"]')?.closest('label');
  if (readyField) {
    readyField.classList.add('wizard-title-complete');
    readyField.title = 'Mark this selected task as ready. This does not finish or save the whole object.';
    const label = readyField.querySelector('span');
    if (label) label.textContent = 'Mark Task Ready';
    if (!h3.contains(readyField)) h3.appendChild(readyField);
  }
  let info = panel.querySelector(':scope > .wizard-action-info-text');
  if (!info) {
    info = document.createElement('p');
    info.className = 'wizard-action-info-text';
    h3.after(info);
  }
  const action = actionIdFromRequirement(requirementId);
  info.textContent = ACTION_INFO[action] || `Defines how ${humanize(action)} behaves, what triggers it, how it plays back, which sounds fire, and which frame events affect gameplay.`;
  info.hidden = true;
}

function enhancePlayerControls(root) {
  const play = root.querySelector('[data-play-toggle]');
  if (play && !/^▶|^⏸/.test(play.textContent.trim())) play.textContent = `${play.textContent.trim().toLowerCase().includes('pause') ? '⏸️' : '▶️'} ${play.textContent.trim()}`;
  setButtonText(root.querySelector('[data-prev-frame]'), '◀ Frame');
  setButtonText(root.querySelector('[data-next-frame]'), 'Frame ▶');
  const brightness = root.querySelector('[data-match-brightness]');
  if (brightness && !brightness.textContent.includes('✨')) brightness.textContent = '✨ Match brightness across frames';
}

function enhanceSoundList(container, soundField) {
  if (!container || !soundField) return;
  let details = container.querySelector('.wizard-sound-list');
  if (!details) {
    details = document.createElement('details');
    details.className = 'wizard-sound-list';
    details.open = false;
    details.innerHTML = '<summary><span class="wizard-sound-summary-label">🔊 Sound Events</span><button type="button" class="wizard-create-sound-button" title="Create Synth Sound and assign its registered asset ID here" aria-label="Create Synth Sound">🎛️</button></summary><div class="wizard-sound-primary"></div><div class="wizard-sound-rows"></div><button type="button" class="wizard-add-sound-button" title="Add another sound event row">➕ Add Sound</button>';
    container.insertBefore(details, container.querySelector('.wizard-notes-field'));
  }
  bindCreateSoundButton(details);
  const primary = details.querySelector('.wizard-sound-primary');
  const soundLabel = soundField.closest('label');
  if (soundLabel && soundLabel.parentElement !== primary) {
    soundLabel.classList.remove('wizard-field-hidden');
    primary.appendChild(soundLabel);
  }
  const rows = details.querySelector('.wizard-sound-rows');
  const selectedId = selectedRequirementId();
  const data = getRequirementData(selectedId);
  const soundEvents = Array.isArray(data.soundEvents)
    ? data.soundEvents
    : splitSoundValues(soundField.value).map((assetId) => ({ assetId, trigger: 'frame', frame: '', volume: 1, pitchVariance: 0, spatial: false, loop: false, stopOnEnd: true, cooldown: 0 }));
  const signature = `${selectedId}:${JSON.stringify(soundEvents)}`;
  if (rows.dataset.renderedFor !== signature) {
    rows.dataset.renderedFor = signature;
    rows.innerHTML = '';
    (soundEvents.length ? soundEvents : [{ assetId: '', trigger: 'frame', frame: '', volume: 1, pitchVariance: 0, spatial: false, loop: false, stopOnEnd: true, cooldown: 0 }]).forEach((event, index) => addSoundRow(rows, soundField, event, index));
  }
  const addButton = details.querySelector('.wizard-add-sound-button');
  if (addButton && !addButton.dataset.boundStep5Core) {
    addButton.dataset.boundStep5Core = 'true';
    addButton.addEventListener('click', () => {
      const current = readSoundRows(rows);
      current.push({ assetId: '', trigger: 'frame', frame: '', volume: 1, pitchVariance: 0, spatial: false, loop: false, stopOnEnd: true, cooldown: 0 });
      writeRequirementData(selectedRequirementId(), { soundEvents: current });
      rows.dataset.renderedFor = '';
      enhanceSoundList(container, soundField);
    });
  }
}

function bindCreateSoundButton(details) {
  const button = details.querySelector('.wizard-create-sound-button');
  if (!button || button.dataset.boundSoundCreator) return;
  button.dataset.boundSoundCreator = 'true';
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openSoundGeneratorModal({
      sourceLabel: `Archetype Object Creator > ${humanize(actionIdFromRequirement(selectedRequirementId()))} > Sound Events`,
      onAssign: ({ assetId }) => assignGeneratedSound(details, assetId)
    });
  });
}

function assignGeneratedSound(details, assetId) {
  if (!assetId) return;
  const rows = details.querySelector('.wizard-sound-rows');
  const soundField = details.querySelector('[data-build="soundAssetId"]');
  if (!rows || !soundField) return;
  let input = Array.from(rows.querySelectorAll('[data-sound="assetId"]')).find((field) => !field.value.trim());
  if (!input) {
    details.querySelector('.wizard-add-sound-button')?.click();
    input = Array.from(rows.querySelectorAll('[data-sound="assetId"]')).find((field) => !field.value.trim());
  }
  if (input) input.value = assetId;
  syncSoundRows(rows, soundField);
  toast(`Assigned generated sound: ${assetId}`, 'success');
}

function addSoundRow(rows, soundField, event, index) {
  const assetId = event.assetId || event.path || '';
  const row = document.createElement('div');
  row.className = 'wizard-sound-row';
  row.innerHTML = `<span>${index + 1}</span><input data-sound="assetId" value="${escapeHtml(assetId)}" placeholder="asset_sfx_object_action" title="Registered sound asset ID" /><select data-sound="trigger" title="When this sound plays"><option value="frame">frame</option><option value="start">start</option><option value="end">end</option><option value="loop">loop</option><option value="random">random</option></select><input data-sound="frame" type="number" min="0" value="${escapeHtml(event.frame ?? '')}" placeholder="Frame" title="Frame number to trigger on" /><input data-sound="volume" type="number" min="0" max="2" step="0.05" value="${escapeHtml(event.volume ?? 1)}" title="Volume" /><input data-sound="pitchVariance" type="number" min="0" max="1" step="0.01" value="${escapeHtml(event.pitchVariance ?? 0)}" title="Pitch variance" /><button type="button" title="Remove this sound row">×</button>`;
  row.querySelector('[data-sound="trigger"]').value = event.trigger || 'frame';
  row.querySelectorAll('[data-sound]').forEach((input) => input.addEventListener('input', () => syncSoundRows(rows, soundField)));
  row.querySelectorAll('select[data-sound]').forEach((input) => input.addEventListener('change', () => syncSoundRows(rows, soundField)));
  row.querySelector('button')?.addEventListener('click', () => {
    row.remove();
    renumberRows(rows, '.wizard-sound-row span');
    syncSoundRows(rows, soundField);
  });
  rows.appendChild(row);
  renumberRows(rows, '.wizard-sound-row span');
}

function readSoundRows(rows) {
  return Array.from(rows.querySelectorAll('.wizard-sound-row')).map((row) => ({
    assetId: row.querySelector('[data-sound="assetId"]')?.value.trim() || '',
    trigger: row.querySelector('[data-sound="trigger"]')?.value || 'frame',
    frame: row.querySelector('[data-sound="frame"]')?.value || '',
    volume: Number(row.querySelector('[data-sound="volume"]')?.value || 1),
    pitchVariance: Number(row.querySelector('[data-sound="pitchVariance"]')?.value || 0),
    spatial: false,
    loop: false,
    stopOnEnd: true,
    cooldown: 0
  })).filter((item) => item.assetId || item.frame);
}

function syncSoundRows(rows, soundField) {
  const values = readSoundRows(rows);
  soundField.value = values.map((item) => item.assetId).filter(Boolean).join(', ');
  writeRequirementData(selectedRequirementId(), { soundEvents: values, soundAssetId: soundField.value });
  soundField.dispatchEvent(new Event('input', { bubbles: true }));
  soundField.dispatchEvent(new Event('change', { bubbles: true }));
}

function enhanceActionBehaviour(container, requirementId) {
  let section = container.querySelector('.wizard-action-behaviour-panel');
  if (!section) {
    section = document.createElement('details');
    section.className = 'wizard-action-behaviour-panel';
    section.open = true;
    container.insertBefore(section, container.querySelector('.wizard-sound-list'));
  }
  if (section.dataset.renderedFor === requirementId) return;
  section.dataset.renderedFor = requirementId;
  const data = getRequirementData(requirementId);
  const playback = { ...DEFAULT_PLAYBACK, ...(data.playbackRules || {}) };
  const trigger = { ...DEFAULT_TRIGGER, ...(data.triggerMapping || {}) };
  const frameEvents = Array.isArray(data.frameEvents) ? data.frameEvents : [];
  section.innerHTML = `<summary>🎮 Action Behaviour</summary><div class="wizard-behaviour-grid"><label>Trigger source<select data-trigger="source" title="What starts this action">${TRIGGER_SOURCES.map((item) => `<option value="${item}">${humanize(item)}</option>`).join('')}</select></label><label>Input/action name<input data-trigger="inputAction" value="${escapeHtml(trigger.inputAction)}" placeholder="move_left, interact, attack" title="Canonical input action name" /></label><label>Keyboard<input data-trigger="keyboard" value="${escapeHtml(trigger.keyboard)}" placeholder="WASD, Space, E" title="Default keyboard mapping" /></label><label>Gamepad<input data-trigger="gamepad" value="${escapeHtml(trigger.gamepad)}" placeholder="Left stick, A, RT" title="Default gamepad mapping" /></label><label>Touch<input data-trigger="touch" value="${escapeHtml(trigger.touch)}" placeholder="Swipe, tap, hold" title="Default touch mapping" /></label><label>AI / scene state<input data-trigger="aiState" value="${escapeHtml(trigger.aiState)}" placeholder="patrol, alert, scripted" title="AI state or scene state that uses this action" /></label><label class="wizard-check-line"><input type="checkbox" data-playback="loop" ${playback.loop ? 'checked' : ''}/> Loop</label><label class="wizard-check-line"><input type="checkbox" data-playback="pingPong" ${playback.pingPong ? 'checked' : ''}/> Ping-pong</label><label class="wizard-check-line"><input type="checkbox" data-playback="holdLastFrame" ${playback.holdLastFrame ? 'checked' : ''}/> Hold last frame</label><label class="wizard-check-line"><input type="checkbox" data-playback="returnToIdle" ${playback.returnToIdle ? 'checked' : ''}/> Return to idle</label><label class="wizard-check-line"><input type="checkbox" data-playback="interruptible" ${playback.interruptible ? 'checked' : ''}/> Interruptible</label><label>Priority<input type="number" data-playback="priority" value="${escapeHtml(playback.priority)}" min="0" max="99" title="Higher priority interrupts lower priority actions" /></label><label>Blend frames<input type="number" data-playback="blendFrames" value="${escapeHtml(playback.blendFrames)}" min="0" max="30" title="Transition frames into this action" /></label><label>Scene event<input data-trigger="sceneEvent" value="${escapeHtml(trigger.sceneEvent)}" placeholder="quest.updated, door.opened" title="Scene or quest event trigger" /></label></div><div class="wizard-frame-events" data-frame-events></div><button type="button" class="wizard-add-frame-event" title="Add a frame marker event">➕ Add Frame Event</button>`;
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
    section.dataset.renderedFor = '';
    enhanceActionBehaviour(container, requirementId);
  });
}

function saveTriggerMapping(section, requirementId) {
  const triggerMapping = { ...DEFAULT_TRIGGER };
  section.querySelectorAll('[data-trigger]').forEach((input) => { triggerMapping[input.dataset.trigger] = input.value; });
  writeRequirementData(requirementId, { triggerMapping });
}

function savePlaybackRules(section, requirementId) {
  const playbackRules = { ...DEFAULT_PLAYBACK };
  section.querySelectorAll('[data-playback]').forEach((input) => {
    playbackRules[input.dataset.playback] = input.type === 'checkbox' ? input.checked : Number.isFinite(Number(input.value)) ? Number(input.value) : input.value;
  });
  writeRequirementData(requirementId, { playbackRules });
}

function renderFrameEvents(section, requirementId, frameEvents) {
  const list = section.querySelector('[data-frame-events]');
  if (!list) return;
  list.innerHTML = '';
  (frameEvents.length ? frameEvents : [{ frame: '', eventType: 'custom', payload: '' }]).forEach((event, index) => {
    const row = document.createElement('div');
    row.className = 'wizard-frame-event-row';
    row.innerHTML = `<span>${index + 1}</span><input data-frame-event="frame" type="number" min="0" value="${escapeHtml(event.frame ?? '')}" placeholder="Frame" /><select data-frame-event="eventType">${FRAME_EVENT_TYPES.map((item) => `<option value="${item}">${humanize(item)}</option>`).join('')}</select><input data-frame-event="payload" value="${escapeHtml(event.payload || '')}" placeholder="sound asset ID, object ID, note" /><button type="button" title="Remove this frame event">×</button>`;
    row.querySelector('[data-frame-event="eventType"]').value = event.eventType || 'custom';
    row.querySelectorAll('[data-frame-event]').forEach((input) => input.addEventListener('input', () => writeRequirementData(requirementId, { frameEvents: readFrameEvents(section) })));
    row.querySelectorAll('select[data-frame-event]').forEach((input) => input.addEventListener('change', () => writeRequirementData(requirementId, { frameEvents: readFrameEvents(section) })));
    row.querySelector('button')?.addEventListener('click', () => {
      row.remove();
      renumberRows(list, '.wizard-frame-event-row span');
      writeRequirementData(requirementId, { frameEvents: readFrameEvents(section) });
    });
    list.appendChild(row);
  });
  renumberRows(list, '.wizard-frame-event-row span');
}

function readFrameEvents(section) {
  return Array.from(section.querySelectorAll('.wizard-frame-event-row')).map((row) => ({
    frame: row.querySelector('[data-frame-event="frame"]')?.value || '',
    eventType: row.querySelector('[data-frame-event="eventType"]')?.value || 'custom',
    payload: row.querySelector('[data-frame-event="payload"]')?.value || ''
  })).filter((item) => item.frame || item.payload || item.eventType !== 'custom');
}

function writeRequirementData(requirementId, updates) {
  if (!requirementId) return;
  const current = editorState.archetype?.productionAssets || { version: VERSION, requirements: {}, requirementOrder: [] };
  updateArchetype({ productionAssets: { ...current, version: VERSION, requirements: { ...(current.requirements || {}), [requirementId]: { ...((current.requirements || {})[requirementId] || {}), ...updates } } } });
}

function selectedRequirementId() { return document.querySelector('#quickstart-dialog .wizard-build-nav button.is-selected')?.dataset.requirementId || ''; }
function getRequirementData(requirementId) { return editorState.archetype?.productionAssets?.requirements?.[requirementId] || {}; }
function actionIdFromRequirement(requirementId) { return String(requirementId || '').split(':')[1] || String(requirementId || 'asset'); }
function splitSoundValues(value) { return String(value || '').split(/[\n,]+/).map((item) => item.trim()).filter(Boolean); }
function renumberRows(root, selector) { root.querySelectorAll(selector).forEach((span, index) => { span.textContent = `${index + 1}`; }); }
function setButtonText(button, text) { if (button && button.textContent.trim() !== text) button.textContent = text; }
function setLabelButtonText(label, text) { const input = label.querySelector('input'); label.textContent = text; if (input) label.appendChild(input); }
function humanize(value) { return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function toast(message, type) { window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message, type } })); }
