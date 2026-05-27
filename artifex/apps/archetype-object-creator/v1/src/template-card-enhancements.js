import { editorState, updateArchetype } from './editor-state.js';
import { ROLE_TEMPLATES } from './templates.js';

const VERSION = '1.14';
const ICON_PATHS = [
  `./v1/icons/object-archetypes/icons1.png?v=${VERSION}`,
  `./v1/icons/object-archetypes/icons2.png?v=${VERSION}`,
  `./v1/icons/object-archetypes/icons3.png?v=${VERSION}`
];
const COLUMNS = 6;
const COMBINED_ROWS = 3;
const OUT_W = 304;
const OUT_H = 305;

const GROUPS = {
  person_static: 'people', person_npc_basic: 'people', person_npc_moving: 'people', person_vendor_job: 'people', person_companion: 'people',
  person_player_full: 'hero', person_foe_human: 'hostile-human', person_thrall: 'possessed', person_caster: 'caster', creature_foe: 'creature', boss_bellator: 'boss',
  static_prop: 'prop', door_exit: 'door', pickup: 'pickup', searchable_cache: 'cache', throwable_object: 'interactable', marker: 'marker', hazard: 'hazard'
};

const POSITIONS = {
  person_static: [0, 0], person_npc_basic: [1, 0], person_npc_moving: [2, 0], person_vendor_job: [3, 0], person_companion: [4, 0], person_player_full: [5, 0],
  person_foe_human: [0, 1], person_thrall: [1, 1], person_caster: [2, 1], creature_foe: [3, 1], boss_bellator: [4, 1], static_prop: [5, 1],
  door_exit: [0, 2], pickup: [1, 2], searchable_cache: [2, 2], throwable_object: [3, 2], marker: [4, 2], hazard: [5, 2]
};

const FALLBACK = {
  person_static: '♙', person_npc_basic: '♙', person_npc_moving: '♙', person_vendor_job: '◇', person_companion: '✦', person_player_full: '☥',
  person_foe_human: '⚔', person_thrall: '◎', person_caster: '✧', creature_foe: '♞', boss_bellator: '♛', static_prop: '▣',
  door_exit: '⌂', pickup: '✦', searchable_cache: '▤', throwable_object: '◈', marker: '⬡', hazard: '⚠'
};

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

const CSS = `
.object-template-card{--template-accent:#e2cca7;--template-soft:rgba(226,204,167,.16);--template-glow:rgba(226,204,167,.28);max-width:186px!important;padding:10px!important;border-color:color-mix(in srgb,var(--template-accent),#382a21 58%)!important;background:radial-gradient(circle at 50% 14%,var(--template-soft),transparent 44%),linear-gradient(180deg,rgba(34,25,20,.98),rgba(16,12,10,.98))!important;box-shadow:0 10px 22px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,240,206,.03)!important}
.object-template-card:hover{border-color:var(--template-accent)!important;box-shadow:0 0 0 1px var(--template-soft),0 0 24px var(--template-glow),0 14px 26px rgba(0,0,0,.72)!important}
.object-template-card[data-template-group='people']{--template-accent:#e2cca7;--template-soft:rgba(226,204,167,.18);--template-glow:rgba(226,204,167,.34)}.object-template-card[data-template-group='hero']{--template-accent:#d84545;--template-soft:rgba(216,69,69,.22);--template-glow:rgba(216,69,69,.42)}.object-template-card[data-template-group='hostile-human']{--template-accent:#b83131;--template-soft:rgba(184,49,49,.24);--template-glow:rgba(184,49,49,.42)}.object-template-card[data-template-group='possessed']{--template-accent:#9e4cff;--template-soft:rgba(158,76,255,.20);--template-glow:rgba(158,76,255,.38)}.object-template-card[data-template-group='caster']{--template-accent:#f277d5;--template-soft:rgba(242,119,213,.18);--template-glow:rgba(242,119,213,.36)}.object-template-card[data-template-group='creature']{--template-accent:#9dbb3f;--template-soft:rgba(157,187,63,.18);--template-glow:rgba(157,187,63,.36)}.object-template-card[data-template-group='boss']{--template-accent:#c35cff;--template-soft:rgba(195,92,255,.22);--template-glow:rgba(195,92,255,.44)}.object-template-card[data-template-group='prop']{--template-accent:#9f8b74;--template-soft:rgba(159,139,116,.18);--template-glow:rgba(159,139,116,.30)}.object-template-card[data-template-group='door']{--template-accent:#c9863b;--template-soft:rgba(201,134,59,.18);--template-glow:rgba(201,134,59,.36)}.object-template-card[data-template-group='pickup']{--template-accent:#f2d36b;--template-soft:rgba(242,211,107,.20);--template-glow:rgba(242,211,107,.40)}.object-template-card[data-template-group='cache']{--template-accent:#a46c3f;--template-soft:rgba(164,108,63,.20);--template-glow:rgba(164,108,63,.36)}.object-template-card[data-template-group='interactable']{--template-accent:#57bd8c;--template-soft:rgba(87,189,140,.18);--template-glow:rgba(87,189,140,.36)}.object-template-card[data-template-group='marker']{--template-accent:#c6d967;--template-soft:rgba(198,217,103,.18);--template-glow:rgba(198,217,103,.36)}.object-template-card[data-template-group='hazard']{--template-accent:#ff7b3d;--template-soft:rgba(255,123,61,.22);--template-glow:rgba(255,123,61,.42)}
.template-card-grid,.wizard-template-grid,.wizard-existing-grid{grid-template-columns:repeat(auto-fill,minmax(174px,186px))!important;justify-content:start!important;align-items:start!important;gap:14px!important}.template-visual{width:100%!important;aspect-ratio:304/305!important;min-height:0!important;height:auto!important;display:grid!important;place-items:center!important;overflow:hidden!important;margin:0 0 10px!important;padding:8px!important;border:1px solid color-mix(in srgb,var(--template-accent),#382a21 52%)!important;border-radius:16px!important;background:radial-gradient(circle at 50% 42%,var(--template-soft),transparent 48%),linear-gradient(180deg,rgba(35,26,21,.92),rgba(14,10,9,.95))!important;box-shadow:inset 0 0 0 1px rgba(255,240,206,.04)!important}.template-icon-img{width:62%!important;height:62%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;filter:drop-shadow(0 0 12px var(--template-glow))!important}.template-icon-fallback{width:40%!important;height:40%!important;display:grid!important;place-items:center!important;border-radius:999px!important;color:#fff0ce!important;background:var(--template-soft)!important;box-shadow:0 0 18px var(--template-glow)!important;font-size:clamp(28px,4vw,46px)!important;line-height:1!important}.object-template-card h4{font-size:13px!important;line-height:1.2!important;margin-bottom:5px!important}.object-template-card p{font-size:11px!important;line-height:1.25!important}.object-template-card button{width:100%!important;min-height:38px!important;padding:8px 10px!important;font-size:13px!important}.menu-bar{flex:1;justify-content:center}@media(max-width:980px){.menu-bar{justify-content:flex-start}}
body .wizard-session-wrap .wizard-session-button{width:auto!important;height:auto!important;min-width:0!important;min-height:0!important;padding:0 6px!important;border:none!important;background:transparent!important;border-radius:0!important;box-shadow:none!important;color:#fff0ce!important;font-size:30px!important;line-height:1!important;display:flex!important;align-items:center!important;justify-content:center!important;text-shadow:0 0 6px rgba(216,69,69,.90),0 0 16px rgba(216,69,69,.72),0 0 28px rgba(216,69,69,.50),0 0 42px rgba(216,69,69,.28)!important;filter:none!important}body .wizard-session-wrap .wizard-session-button:hover,body .wizard-session-wrap .wizard-session-button:focus{background:transparent!important;border:none!important;box-shadow:none!important;transform:scale(1.12)!important}.wizard-session-wrap{display:none;align-items:center}.wizard-session-wrap.has-sessions{display:flex!important}
#quickstart-dialog.wizard-dialog{width:min(94vw,1360px)!important;max-width:94vw!important;overflow:hidden!important}#quickstart-dialog .dialog-shell{width:100%!important;max-width:100%!important;max-height:92vh!important;overflow:hidden!important}#quickstart-dialog .wizard-content{max-height:calc(92vh - 112px)!important;overflow:auto!important;overflow-x:hidden!important;padding:0 8px 10px 0!important}#quickstart-dialog .wizard-toolbar{margin:4px 0 9px!important;gap:6px!important}#quickstart-dialog .wizard-toolbar button{min-height:31px!important;padding:5px 9px!important;font-size:11px!important;line-height:1.1!important;white-space:nowrap!important}#quickstart-dialog .wizard-build-shell{grid-template-columns:minmax(220px,300px) minmax(0,1fr)!important;gap:14px!important;min-height:620px!important;max-width:100%!important;overflow:hidden!important;margin-top:4px!important}#quickstart-dialog .wizard-build-left{min-width:0!important}#quickstart-dialog .wizard-build-nav button{grid-template-columns:22px minmax(0,1fr) auto!important}#quickstart-dialog .wizard-build-nav small{display:block!important;margin-top:3px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
#quickstart-dialog .wizard-build-detail-panel{display:grid!important;grid-template-columns:minmax(270px,.82fr) minmax(300px,1.18fr)!important;align-content:start!important;column-gap:16px!important;row-gap:8px!important;min-width:0!important;overflow:hidden!important}#quickstart-dialog .wizard-build-detail-panel>h3{grid-column:2!important;grid-row:1!important;display:flex!important;align-items:center!important;gap:8px!important;min-width:0!important;margin:0!important}#quickstart-dialog .wizard-build-detail-panel>p.hint{display:none!important}.wizard-action-meta{grid-column:1/-1!important;color:rgba(255,240,206,.58)!important;font-size:11px!important;text-transform:none!important;letter-spacing:normal!important;margin:-2px 0 0!important}.wizard-title-complete{margin-left:auto!important;display:inline-flex!important;align-items:center!important;gap:6px!important;border:1px solid rgba(226,204,167,.18)!important;border-radius:999px!important;padding:5px 10px!important;background:rgba(0,0,0,.16)!important;color:#fff0ce!important;font-size:11px!important;white-space:nowrap!important}.wizard-title-complete input{width:auto!important}.wizard-action-info-button{width:26px!important;height:26px!important;min-height:26px!important;border-radius:999px!important;padding:0!important;font-size:14px!important;font-weight:900!important;color:#fff0ce!important;border:1px solid var(--red)!important;background:rgba(216,69,69,.16)!important}.wizard-action-info-text{grid-column:2!important;grid-row:2!important;margin:0!important;padding:8px 10px!important;border:1px solid rgba(226,204,167,.18)!important;border-radius:12px!important;background:rgba(0,0,0,.16)!important;color:rgba(255,240,206,.78)!important;font-size:12px!important;line-height:1.35!important}
#quickstart-dialog .wizard-preview-stage{grid-column:1!important;grid-row:1 / span 2!important;width:100%!important;max-width:390px!important;margin:0!important;align-self:start!important}#quickstart-dialog .wizard-preview-controls{grid-column:1!important;grid-row:3!important;margin:4px 0 0!important;position:relative!important}#quickstart-dialog .wizard-preview-controls button{min-height:33px!important;padding:6px 10px!important;font-size:12px!important}.wizard-frame-correct-button{min-height:33px!important;padding:6px 10px!important;font-size:12px!important}.wizard-reference-panel{grid-column:1!important;grid-row:4!important;border-top:1px solid rgba(226,204,167,.18);padding-top:10px;margin-top:6px}.wizard-reference-panel h4{margin:0 0 6px;color:#e2cca7;font-size:11px;text-transform:uppercase;letter-spacing:.12em}.wizard-reference-scroll{height:118px;overflow:auto;border:1px solid rgba(226,204,167,.18);border-radius:14px;background:rgba(0,0,0,.16);padding:8px;color:rgba(255,240,206,.74);font-size:11px;line-height:1.35}.wizard-reference-scroll ul{margin:0;padding-left:16px}.wizard-reference-scroll li{margin:0 0 5px}.wizard-reference-scroll code{color:#fff0ce;word-break:break-word}.wizard-reference-empty{color:rgba(255,240,206,.54)}
.wizard-correction-popover{position:absolute;z-index:20;left:0;top:42px;width:min(390px,92vw);padding:12px;border:1px solid var(--red);border-radius:16px;background:#130e0c;box-shadow:0 18px 42px rgba(0,0,0,.72),0 0 22px rgba(216,69,69,.20)}.wizard-correction-popover[hidden]{display:none!important}.wizard-correction-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;color:#fff0ce;font-weight:800;font-size:12px}.wizard-correction-title{margin-right:auto}.wizard-correction-head button{min-height:26px!important;padding:2px 8px!important}.wizard-correction-grid{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;margin:0!important}.wizard-correction-grid label{display:grid!important;grid-template-columns:1fr!important;gap:6px!important}.wizard-correction-control{display:grid!important;grid-template-columns:28px 48px 28px!important;gap:6px!important;align-items:center!important;justify-content:end!important}.wizard-correction-control button{min-height:26px!important;padding:2px 8px!important}.wizard-correction-control output{text-align:center;color:#fff0ce;font-size:12px;border:1px solid rgba(226,204,167,.18);border-radius:999px;padding:4px 6px;background:rgba(0,0,0,.18)}
#quickstart-dialog .wizard-right-stack{grid-column:2!important;grid-row:3 / span 2!important;display:grid!important;grid-template-columns:1fr!important;gap:10px!important;align-self:start!important;min-width:0!important}#quickstart-dialog .wizard-right-stack .wizard-build-fields{grid-column:auto!important;grid-row:auto!important;display:grid!important;grid-template-columns:repeat(3,minmax(100px,1fr))!important;margin:0!important;gap:8px!important;align-self:start!important;min-width:0!important}.wizard-field-asset-path{grid-column:1/-1!important}.wizard-field-hidden{display:none!important}.wizard-sound-list,.wizard-action-behaviour-panel{border:1px solid rgba(226,204,167,.18);border-radius:14px;background:rgba(0,0,0,.14);padding:8px 10px}.wizard-sound-list summary,.wizard-action-behaviour-panel summary{cursor:pointer;color:#fff0ce;font-size:12px;font-weight:800;letter-spacing:.05em}.wizard-sound-primary{margin-top:8px!important}.wizard-sound-rows{display:grid;gap:7px;margin-top:8px}.wizard-sound-row{display:grid;grid-template-columns:auto minmax(0,1fr) 90px 62px 62px 76px auto;gap:7px;align-items:center}.wizard-sound-row span{color:rgba(255,240,206,.68);font-size:11px}.wizard-sound-row input,.wizard-sound-row select{width:100%;padding:7px 8px!important;font-size:12px!important}.wizard-sound-row button{min-height:28px!important;padding:4px 8px!important;font-size:11px!important}.wizard-add-sound-button{margin-top:8px!important;min-height:29px!important;padding:5px 9px!important;font-size:11px!important}
.wizard-behaviour-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:9px}.wizard-behaviour-grid label{font-size:10px!important;letter-spacing:.08em!important;text-transform:uppercase!important;color:rgba(226,204,167,.82)!important}.wizard-check-line{display:flex!important;align-items:center!important;gap:7px!important;font-size:12px!important;text-transform:none!important;letter-spacing:normal!important;color:#fff0ce!important}.wizard-check-line input{width:auto!important}.wizard-frame-events{display:grid;gap:7px;margin-top:9px}.wizard-frame-event-row{display:grid;grid-template-columns:56px 130px minmax(0,1fr) auto;gap:7px;align-items:end}.wizard-frame-event-row input,.wizard-frame-event-row select{width:100%;padding:7px 8px!important;font-size:12px!important}.wizard-frame-event-row button{min-height:28px!important;padding:4px 8px!important;font-size:11px!important}.wizard-add-frame-event{margin-top:8px!important;min-height:29px!important;padding:5px 9px!important;font-size:11px!important}.wizard-notes-field textarea{min-height:86px!important;resize:vertical!important}
#quickstart-dialog .wizard-frame-strip{grid-column:1/-1!important;grid-row:5!important;min-height:170px!important;width:100%!important;max-width:100%!important;overflow-x:auto!important;margin-top:4px!important}#quickstart-dialog .wizard-frame-strip.is-drag-over{box-shadow:0 0 0 1px var(--red),0 0 22px rgba(216,69,69,.32)!important}#quickstart-dialog .wizard-frame-strip .hint{margin:auto!important;text-align:center!important}#quickstart-dialog .wizard-build-actions{grid-column:1/-1!important;grid-row:6!important;display:flex!important;flex-wrap:wrap!important;gap:8px!important;margin:0!important;align-items:center!important}#quickstart-dialog .wizard-build-actions label.button-like{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:34px!important;padding:6px 12px!important;border:1px solid var(--border)!important;border-radius:var(--radius-pill)!important;background:linear-gradient(180deg,rgba(51,38,30,.98),rgba(28,20,17,.98))!important;color:#fff0ce!important;font-family:inherit!important;font-size:12px!important;font-weight:700!important;letter-spacing:normal!important;text-transform:none!important;cursor:pointer!important}#quickstart-dialog [data-empty-frame],#quickstart-dialog .wizard-download-zip-button{min-height:34px!important;padding:6px 12px!important;font-size:12px!important}.wizard-download-zip-button{margin-left:auto!important}.wizard-frame-file-table-wrap{grid-column:1/-1!important;grid-row:7!important;border:1px solid rgba(226,204,167,.18);border-radius:14px;background:rgba(0,0,0,.14);overflow:auto;max-width:100%}.wizard-frame-file-table{width:100%;border-collapse:collapse;font-size:11px}.wizard-frame-file-table th,.wizard-frame-file-table td{padding:7px 8px;border-bottom:1px solid rgba(226,204,167,.12);vertical-align:top}.wizard-frame-file-table th{text-align:left;color:#e2cca7;text-transform:uppercase;letter-spacing:.08em;font-size:10px}.wizard-frame-file-table code{white-space:normal;word-break:break-word;color:#fff0ce}.wizard-frame-file-table .muted{color:rgba(255,240,206,.58)}#quickstart-dialog .wizard-frame-box{flex-basis:112px!important;min-height:112px!important}@media(max-width:1100px){#quickstart-dialog.wizard-dialog{width:96vw!important;max-width:96vw!important}#quickstart-dialog .wizard-build-shell{grid-template-columns:1fr!important}#quickstart-dialog .wizard-build-detail-panel{grid-template-columns:1fr!important}#quickstart-dialog .wizard-build-detail-panel>*{grid-column:1!important;grid-row:auto!important}#quickstart-dialog .wizard-right-stack{grid-column:1!important;grid-row:auto!important}.wizard-sound-row,.wizard-frame-event-row{grid-template-columns:1fr!important}#quickstart-dialog .wizard-right-stack .wizard-build-fields{grid-template-columns:1fr!important}}
`;

const imagePromises = new Map();
const cropCache = new Map();
let observer = null;
let queued = false;
const textEncoder = new TextEncoder();

function injectStyles() {
  if (document.getElementById('object-template-card-enhancements')) return;
  const style = document.createElement('style');
  style.id = 'object-template-card-enhancements';
  style.textContent = CSS;
  document.head.appendChild(style);
}

function loadImage(path) {
  if (imagePromises.has(path)) return imagePromises.get(path);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${path}`));
    image.src = path;
  });
  imagePromises.set(path, promise);
  return promise;
}

function loadBestAtlas(row) {
  return loadImage(ICON_PATHS[row] || ICON_PATHS[0]).catch(() => loadImage(ICON_PATHS[0]));
}

function cropIcon(templateId) {
  if (cropCache.has(templateId)) return Promise.resolve(cropCache.get(templateId));
  const position = POSITIONS[templateId];
  if (!position) return Promise.resolve('');
  const [column, row] = position;
  return loadBestAtlas(row).then((atlas) => {
    const singleCellWidth = atlas.naturalWidth / COLUMNS;
    const looksCombined = atlas.naturalHeight > singleCellWidth * 1.45;
    const sourceCellHeight = looksCombined ? atlas.naturalHeight / COMBINED_ROWS : atlas.naturalHeight;
    const sourceRow = looksCombined ? row : 0;
    const canvas = document.createElement('canvas');
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const context = canvas.getContext('2d');
    if (!context) return '';
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(atlas, column * singleCellWidth, sourceRow * sourceCellHeight, singleCellWidth, sourceCellHeight, 0, 0, OUT_W, OUT_H);
    const dataUrl = canvas.toDataURL('image/png');
    cropCache.set(templateId, dataUrl);
    return dataUrl;
  });
}

function decorateTemplateCards() {
  document.querySelectorAll('.template-card,.library-card').forEach(decorateTemplateCard);
}

function decorateTemplateCard(card) {
  const templateId = readTemplateId(card);
  if (!templateId || !ROLE_TEMPLATES[templateId]) return;
  card.dataset.templateId = templateId;
  card.dataset.templateGroup = GROUPS[templateId] || 'default';
  card.classList.add('object-template-card');
  let visual = card.querySelector(':scope > .template-visual') || card.querySelector('.template-visual,.library-card-preview,.template-icon');
  if (!visual) {
    visual = document.createElement('div');
    visual.className = 'template-visual';
    card.prepend(visual);
  }
  visual.classList.add('template-visual');
  visual.dataset.templateGroup = GROUPS[templateId] || 'default';
  visual.dataset.iconFor = templateId;
  if (card.dataset.templateIconReady !== `${templateId}-${VERSION}`) {
    showFallbackIcon(visual, templateId);
    card.dataset.templateIconReady = `${templateId}-${VERSION}`;
  }
  cropIcon(templateId).then((dataUrl) => {
    if (!dataUrl || visual.dataset.iconFor !== templateId) return;
    const image = document.createElement('img');
    image.className = 'template-icon-img';
    image.alt = `${ROLE_TEMPLATES[templateId].label} icon`;
    image.src = dataUrl;
    visual.replaceChildren(image);
  }).catch(() => {});
}

function showFallbackIcon(visual, templateId) {
  const fallback = document.createElement('span');
  fallback.className = 'template-icon-fallback';
  fallback.textContent = FALLBACK[templateId] || '⬡';
  visual.replaceChildren(fallback);
}

function readTemplateId(card) {
  const direct = card.dataset.templateId || card.dataset.role || card.dataset.template;
  if (direct && ROLE_TEMPLATES[direct]) return direct;
  const button = card.querySelector('[data-template-id],[data-role],[data-template]');
  const nested = button?.dataset.templateId || button?.dataset.role || button?.dataset.template;
  if (nested && ROLE_TEMPLATES[nested]) return nested;
  const text = card.textContent?.trim().toLowerCase() || '';
  return Object.entries(ROLE_TEMPLATES).find(([, template]) => text.includes(String(template.label).toLowerCase()))?.[0] || '';
}

function enhanceWizardBuildPanel() {
  const wizardContent = document.getElementById('quickstart-content');
  const intro = wizardContent?.querySelector(':scope > p.hint');
  if (intro?.textContent?.includes('Use the numbered list')) intro.remove();
  enhanceWizardButtons(wizardContent);

  const panel = document.querySelector('#quickstart-dialog .wizard-build-detail-panel');
  if (!panel) return;
  const selectedId = selectedRequirementId();
  if (!selectedId) return;

  const metaText = panel.querySelector(':scope > p.hint')?.textContent?.trim() || '';
  enhanceActionTitle(panel, selectedId);

  const fields = panel.querySelector(':scope > .wizard-build-fields');
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

  enhanceCorrectionPopup(panel, selectedId);
  enhanceReferencePanel(panel, selectedId);

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
    const addFrame = actions.querySelector('[data-empty-frame]');
    setButtonText(addFrame, '➕ Add Empty Frame Slot');
    if (!actions.querySelector('[data-download-asset-zip]')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'wizard-download-zip-button';
      button.dataset.downloadAssetZip = 'true';
      button.textContent = '📦 Download ZIP';
      button.title = 'Download this object archetype package as a ZIP';
      button.addEventListener('click', downloadAssetZip);
      actions.appendChild(button);
    }
  }

  renderFramePathTable(panel);
  applyFrameCorrection(selectedId);
}

function arrangeFields(fields, metaText) {
  const mode = fields.querySelector('[data-build="mode"]')?.closest('label');
  const frameCount = fields.querySelector('[data-build="frameCount"]')?.closest('label');
  const fps = fields.querySelector('[data-build="fps"]')?.closest('label');
  const asset = fields.querySelector('[data-build="spriteSheetAssetId"]')?.closest('label');
  const sound = fields.querySelector('[data-build="soundAssetId"]')?.closest('label');
  const complete = fields.querySelector('[data-build="complete"]')?.closest('label');
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
  complete?.classList.add('wizard-field-hidden');
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
      const text = panel.querySelector('.wizard-action-info-text');
      if (text) text.hidden = !text.hidden;
    });
  }
  const completeField = panel.querySelector('[data-build="complete"]')?.closest('label');
  if (completeField && !h3.querySelector('.wizard-title-complete')) {
    completeField.classList.add('wizard-title-complete');
    completeField.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) node.textContent = 'Complete ';
    });
    h3.appendChild(completeField);
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

function enhanceWizardButtons(root) {
  if (!root) return;
  setButtonText(root.querySelector('[data-back]'), '← Back');
  setButtonText(root.querySelector('[data-session]'), '💾 Save');
  setButtonText(root.querySelector('[data-save]'), '✅ Save Local');
  setButtonText(root.querySelector('[data-finish]'), '🏁 Finish');
  const play = root.querySelector('[data-play-toggle]');
  if (play && !/^▶|^⏸/.test(play.textContent.trim())) play.textContent = `${play.textContent.trim().toLowerCase().includes('pause') ? '⏸️' : '▶️'} ${play.textContent.trim()}`;
  setButtonText(root.querySelector('[data-prev-frame]'), '◀ Frame');
  setButtonText(root.querySelector('[data-next-frame]'), 'Frame ▶');
  const brightness = root.querySelector('[data-match-brightness]');
  if (brightness && !brightness.textContent.includes('✨')) brightness.textContent = '✨ Match brightness across frames';
}

function setButtonText(button, text) {
  if (button && button.textContent.trim() !== text) button.textContent = text;
}

function setLabelButtonText(label, text) {
  const input = label.querySelector('input');
  label.textContent = text;
  if (input) label.appendChild(input);
}

function enhanceSoundList(container, soundField) {
  if (!container || !soundField) return;
  let details = container.querySelector('.wizard-sound-list');
  if (!details) {
    details = document.createElement('details');
    details.className = 'wizard-sound-list';
    details.open = false;
    details.innerHTML = '<summary>🔊 Sound Events</summary><div class="wizard-sound-primary"></div><div class="wizard-sound-rows"></div><button type="button" class="wizard-add-sound-button" title="Add another sound event row">➕ Add Sound</button>';
    container.insertBefore(details, container.querySelector('.wizard-notes-field'));
  }
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
    : splitSoundValues(soundField.value).map((path) => ({ path, trigger: 'frame', frame: '', volume: 1, pitchVariance: 0, spatial: false, loop: false, stopOnEnd: true, cooldown: 0 }));
  const signature = `${selectedId}:${JSON.stringify(soundEvents)}`;
  if (rows.dataset.renderedFor !== signature) {
    rows.dataset.renderedFor = signature;
    rows.innerHTML = '';
    (soundEvents.length ? soundEvents : [{ path: '', trigger: 'frame', frame: '', volume: 1, pitchVariance: 0, spatial: false, loop: false, stopOnEnd: true, cooldown: 0 }])
      .forEach((event, index) => addSoundRow(rows, soundField, event, index));
  }
  const addButton = details.querySelector('.wizard-add-sound-button');
  if (addButton && !addButton.dataset.bound) {
    addButton.dataset.bound = 'true';
    addButton.addEventListener('click', () => {
      const current = readSoundRows(rows);
      current.push({ path: '', trigger: 'frame', frame: '', volume: 1, pitchVariance: 0, spatial: false, loop: false, stopOnEnd: true, cooldown: 0 });
      writeRequirementData(selectedRequirementId(), { soundEvents: current });
      rows.dataset.renderedFor = '';
      enhanceSoundList(container, soundField);
    });
  }
}

function addSoundRow(rows, soundField, event, index) {
  const row = document.createElement('div');
  row.className = 'wizard-sound-row';
  row.innerHTML = `<span>${index + 1}</span><input data-sound="path" value="${escapeHtml(event.path || '')}" placeholder="assets/audio/sfx/${safeId(actionFromSelected())}_${String(index + 1).padStart(2, '0')}.ogg" title="Sound file path" /><select data-sound="trigger" title="When this sound plays"><option value="frame">frame</option><option value="start">start</option><option value="end">end</option><option value="loop">loop</option><option value="random">random</option></select><input data-sound="frame" type="number" min="0" value="${escapeHtml(event.frame ?? '')}" placeholder="Frame" title="Frame number to trigger on" /><input data-sound="volume" type="number" min="0" max="2" step="0.05" value="${escapeHtml(event.volume ?? 1)}" title="Volume" /><input data-sound="pitchVariance" type="number" min="0" max="1" step="0.01" value="${escapeHtml(event.pitchVariance ?? 0)}" title="Pitch variance" /><button type="button" title="Remove this sound row">×</button>`;
  row.querySelector('[data-sound="trigger"]').value = event.trigger || 'frame';
  row.querySelectorAll('[data-sound]').forEach((input) => input.addEventListener('input', () => syncSoundRows(rows, soundField)));
  row.querySelectorAll('select[data-sound]').forEach((input) => input.addEventListener('change', () => syncSoundRows(rows, soundField)));
  row.querySelector('button').addEventListener('click', () => {
    row.remove();
    renumberSoundRows(rows);
    syncSoundRows(rows, soundField);
  });
  rows.appendChild(row);
  renumberSoundRows(rows);
}

function readSoundRows(rows) {
  return Array.from(rows.querySelectorAll('.wizard-sound-row')).map((row) => ({
    path: row.querySelector('[data-sound="path"]')?.value.trim() || '',
    trigger: row.querySelector('[data-sound="trigger"]')?.value || 'frame',
    frame: row.querySelector('[data-sound="frame"]')?.value || '',
    volume: Number(row.querySelector('[data-sound="volume"]')?.value || 1),
    pitchVariance: Number(row.querySelector('[data-sound="pitchVariance"]')?.value || 0),
    spatial: false,
    loop: false,
    stopOnEnd: true,
    cooldown: 0
  })).filter((item) => item.path || item.frame);
}

function splitSoundValues(value) {
  return String(value || '').split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
}

function syncSoundRows(rows, soundField) {
  const values = readSoundRows(rows);
  soundField.value = values.map((item) => item.path).filter(Boolean).join(', ');
  writeRequirementData(selectedRequirementId(), { soundEvents: values, soundAssetId: soundField.value });
  soundField.dispatchEvent(new Event('input', { bubbles: true }));
  soundField.dispatchEvent(new Event('change', { bubbles: true }));
}

function renumberSoundRows(rows) {
  rows.querySelectorAll('.wizard-sound-row span').forEach((span, index) => { span.textContent = `${index + 1}`; });
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
  list.innerHTML = '';
  (frameEvents.length ? frameEvents : [{ frame: '', eventType: 'play_sound', payload: '' }]).forEach((item) => {
    const row = document.createElement('div');
    row.className = 'wizard-frame-event-row';
    row.innerHTML = `<input data-frame-event="frame" type="number" min="0" value="${escapeHtml(item.frame ?? '')}" placeholder="Frame" title="Frame number" /><select data-frame-event="eventType" title="Event type">${FRAME_EVENT_TYPES.map((type) => `<option value="${type}">${humanize(type)}</option>`).join('')}</select><input data-frame-event="payload" value="${escapeHtml(item.payload || '')}" placeholder="sound id, hitbox name, object id, event payload" title="Frame event payload" /><button type="button" title="Remove this frame event">×</button>`;
    row.querySelector('[data-frame-event="eventType"]').value = item.eventType || 'custom';
    row.querySelectorAll('[data-frame-event]').forEach((input) => input.addEventListener('input', () => writeRequirementData(requirementId, { frameEvents: readFrameEvents(section) })));
    row.querySelectorAll('select[data-frame-event]').forEach((input) => input.addEventListener('change', () => writeRequirementData(requirementId, { frameEvents: readFrameEvents(section) })));
    row.querySelector('button').addEventListener('click', () => {
      row.remove();
      writeRequirementData(requirementId, { frameEvents: readFrameEvents(section) });
    });
    list.appendChild(row);
  });
}

function readFrameEvents(section) {
  return Array.from(section.querySelectorAll('.wizard-frame-event-row')).map((row) => ({
    frame: row.querySelector('[data-frame-event="frame"]')?.value || '',
    eventType: row.querySelector('[data-frame-event="eventType"]')?.value || 'custom',
    payload: row.querySelector('[data-frame-event="payload"]')?.value.trim() || ''
  })).filter((item) => item.frame || item.payload);
}

function enhanceCorrectionPopup(panel, requirementId) {
  const correction = panel.querySelector('.wizard-correction-grid');
  const controls = panel.querySelector('.wizard-preview-controls');
  if (!correction || !controls) return;
  let popover = controls.querySelector('.wizard-correction-popover');
  if (!popover) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wizard-frame-correct-button';
    button.textContent = '🎚️ Frame Fix';
    button.title = 'Adjust the currently selected frame';
    controls.appendChild(button);

    popover = document.createElement('div');
    popover.className = 'wizard-correction-popover';
    popover.hidden = true;
    popover.innerHTML = '<div class="wizard-correction-head"><span class="wizard-correction-title">Frame Correction</span><button type="button" data-reset-correction title="Reset this frame correction">↺ Reset</button><button type="button" data-close-correction title="Close frame correction">×</button></div>';
    popover.querySelector('[data-close-correction]').addEventListener('click', () => { popover.hidden = true; });
    popover.querySelector('[data-reset-correction]').addEventListener('click', () => resetCurrentFrameCorrection(requirementId));
    controls.appendChild(popover);
    button.addEventListener('click', () => {
      popover.hidden = !popover.hidden;
      loadFrameCorrection(requirementId);
    });
    controls.querySelectorAll('[data-prev-frame], [data-next-frame], [data-play-toggle]').forEach((control) => {
      control.addEventListener('click', () => window.setTimeout(() => loadFrameCorrection(requirementId), 60));
    });
  }
  if (correction.parentElement !== popover) popover.appendChild(correction);
  ensureBrightnessSlider(correction);
  enhanceCorrectionControls(correction, requirementId);
  loadFrameCorrection(requirementId);
}

function ensureBrightnessSlider(correction) {
  if (correction.querySelector('[data-correct="brightness"]')) return;
  const label = document.createElement('label');
  label.textContent = 'Brightness %';
  const input = document.createElement('input');
  input.type = 'range';
  input.min = '-50';
  input.max = '50';
  input.step = '1';
  input.value = '0';
  input.dataset.correct = 'brightness';
  input.title = 'Manual brightness correction for this frame';
  label.appendChild(input);
  correction.insertBefore(label, correction.querySelector('[data-match-brightness]')?.closest('button') || correction.firstChild);
}

function enhanceCorrectionControls(correction, requirementId) {
  correction.querySelectorAll('input[type="range"][data-correct]').forEach((input) => {
    input.title ||= `Adjust ${input.dataset.correct} for the selected frame`;
    if (!input.closest('label').querySelector('.wizard-correction-control')) {
      const wrap = document.createElement('div');
      wrap.className = 'wizard-correction-control';
      wrap.innerHTML = '<button type="button" data-step="-1" title="Decrease by 1">‹</button><output></output><button type="button" data-step="1" title="Increase by 1">›</button>';
      input.after(wrap);
      wrap.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
        input.value = String(clamp(Number(input.value) + Number(button.dataset.step), Number(input.min), Number(input.max)));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }));
    }
    if (!input.dataset.boundCorrection) {
      input.dataset.boundCorrection = 'true';
      input.addEventListener('input', () => {
        saveFrameCorrectionFromInputs(requirementId);
        syncCorrectionOutputs(correction);
        applyFrameCorrection(requirementId);
      });
    }
  });
  const matchButton = correction.querySelector('[data-match-brightness]');
  if (matchButton && !matchButton.dataset.boundBrightnessMatch) {
    matchButton.dataset.boundBrightnessMatch = 'true';
    matchButton.title = 'Scan uploaded frames and store brightness offsets per frame';
    matchButton.addEventListener('click', () => matchBrightnessAcrossFrames(requirementId));
  }
  syncCorrectionOutputs(correction);
}

function currentFrameIndex() {
  const text = document.querySelector('#quickstart-dialog [data-frame-readout]')?.textContent || '';
  const value = text.split('/')[0] || '1';
  return Math.max(0, Number(value) - 1 || 0);
}

function loadFrameCorrection(requirementId) {
  const correction = document.querySelector('#quickstart-dialog .wizard-correction-grid');
  if (!correction) return;
  const frameNumber = currentFrameIndex() + 1;
  const title = document.querySelector('#quickstart-dialog .wizard-correction-title');
  if (title) title.textContent = `Frame Correction – Frame ${String(frameNumber).padStart(2, '0')}`;
  const data = getRequirementData(requirementId);
  const frameCorrection = (data.frameCorrections || {})[currentFrameIndex()] || data.correction || { scale: 0, x: 0, y: 0, brightness: 0 };
  correction.querySelectorAll('[data-correct]').forEach((input) => {
    const key = input.dataset.correct;
    input.value = String(frameCorrection[key] ?? 0);
  });
  syncCorrectionOutputs(correction);
  applyFrameCorrection(requirementId);
}

function saveFrameCorrectionFromInputs(requirementId) {
  const correction = document.querySelector('#quickstart-dialog .wizard-correction-grid');
  if (!correction) return;
  const data = getRequirementData(requirementId);
  const frameCorrections = { ...(data.frameCorrections || {}) };
  frameCorrections[currentFrameIndex()] = {
    scale: Number(correction.querySelector('[data-correct="scale"]')?.value || 0),
    x: Number(correction.querySelector('[data-correct="x"]')?.value || 0),
    y: Number(correction.querySelector('[data-correct="y"]')?.value || 0),
    brightness: Number(correction.querySelector('[data-correct="brightness"]')?.value || 0)
  };
  writeRequirementData(requirementId, { frameCorrections });
}

function resetCurrentFrameCorrection(requirementId) {
  const data = getRequirementData(requirementId);
  const frameCorrections = { ...(data.frameCorrections || {}) };
  frameCorrections[currentFrameIndex()] = { scale: 0, x: 0, y: 0, brightness: 0 };
  writeRequirementData(requirementId, { frameCorrections });
  loadFrameCorrection(requirementId);
}

function syncCorrectionOutputs(correction) {
  correction.querySelectorAll('input[type="range"][data-correct]').forEach((input) => {
    const output = input.closest('label')?.querySelector('output');
    if (output) output.textContent = input.value;
  });
}

function applyFrameCorrection(requirementId) {
  const data = getRequirementData(requirementId);
  const current = (data.frameCorrections || {})[currentFrameIndex()] || data.correction || {};
  document.querySelectorAll('#quickstart-dialog [data-preview-stage] img, #quickstart-dialog .wizard-preview-stage img').forEach((img) => applyCorrectionToImage(img, current));
  document.querySelectorAll('#quickstart-dialog .wizard-frame-box img').forEach((img, index) => {
    const corr = (data.frameCorrections || {})[index] || data.correction || {};
    applyCorrectionToImage(img, corr);
  });
}

function applyCorrectionToImage(img, correction = {}) {
  const scale = 1 + (Number(correction.scale || 0) / 100);
  const x = Number(correction.x || 0);
  const y = Number(correction.y || 0);
  const brightness = 1 + (Number(correction.brightness || 0) / 100);
  img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  img.style.transformOrigin = 'center center';
  img.style.filter = `brightness(${brightness})`;
}

async function matchBrightnessAcrossFrames(requirementId) {
  const data = getRequirementData(requirementId);
  const frames = data.frames || [];
  const readableFrames = frames.filter((frame) => frame.dataUrl);
  if (readableFrames.length < 2) {
    toast('Add at least two image frames before matching brightness.', 'warning');
    return;
  }
  try {
    const averages = await Promise.all(frames.map((frame) => frame.dataUrl ? averageBrightness(frame.dataUrl) : Promise.resolve(null)));
    const valid = averages.filter((value) => typeof value === 'number' && Number.isFinite(value));
    const target = valid.reduce((sum, value) => sum + value, 0) / valid.length;
    const frameCorrections = { ...(data.frameCorrections || {}) };
    averages.forEach((average, index) => {
      if (typeof average !== 'number') return;
      const current = frameCorrections[index] || { scale: 0, x: 0, y: 0, brightness: 0 };
      const adjustment = clamp(Math.round(((target - average) / Math.max(average, 1)) * 100), -50, 50);
      frameCorrections[index] = { ...current, brightness: adjustment };
    });
    writeRequirementData(requirementId, { frameCorrections, brightnessMatch: { target: Math.round(target), generatedAt: new Date().toISOString() } });
    loadFrameCorrection(requirementId);
    toast('Brightness matched and stored per frame.', 'success');
  } catch (error) {
    toast(`Could not match brightness: ${error.message}`, 'error');
  }
}

function averageBrightness(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const max = 96;
      const scale = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return resolve(128);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let total = 0;
      let count = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];
        if (alpha < 24) continue;
        total += (0.2126 * pixels[i]) + (0.7152 * pixels[i + 1]) + (0.0722 * pixels[i + 2]);
        count += 1;
      }
      resolve(count ? total / count : 128);
    };
    image.onerror = () => reject(new Error('frame image could not be read'));
    image.src = dataUrl;
  });
}

function enhanceReferencePanel(panel, requirementId) {
  const controls = panel.querySelector('.wizard-preview-controls');
  if (!controls) return;
  let reference = panel.querySelector('.wizard-reference-panel');
  if (!reference) {
    reference = document.createElement('section');
    reference.className = 'wizard-reference-panel';
    reference.innerHTML = '<h4>Reference</h4><div class="wizard-reference-scroll"></div>';
    controls.after(reference);
  }
  const box = reference.querySelector('.wizard-reference-scroll');
  box.innerHTML = renderReferenceList(requirementId);
}

function renderReferenceList(requirementId) {
  const refs = findProjectReferences(requirementId);
  if (!refs.indexAvailable) {
    return '<p class="wizard-reference-empty">No project reference index is loaded yet. This panel is ready for <code>projects/&lt;project-id&gt;/reference-index.json</code> once Project Manager / Health Guide generates it.</p>';
  }
  if (!refs.items.length) {
    return '<p class="wizard-reference-empty">No scene, quest, route, object, or FX references found for this action in the loaded index.</p>';
  }
  return `<ul>${refs.items.map((item) => `<li><strong>${escapeHtml(item.type || 'reference')}</strong>: <code>${escapeHtml(item.file || item.path || item.id || '')}</code>${item.label ? ` — ${escapeHtml(item.label)}` : ''}</li>`).join('')}</ul>`;
}

function findProjectReferences(requirementId) {
  const index = editorState.projectReferenceIndex || editorState.referenceIndex || window.artifexReferenceIndex || readReferenceIndexFromLocalStorage();
  if (!index) return { indexAvailable: false, items: [] };
  const actionId = actionIdFromRequirement(requirementId);
  const objectId = editorState.archetype?.id || '';
  const all = Array.isArray(index.references) ? index.references : Array.isArray(index.items) ? index.items : [];
  const items = all.filter((item) => {
    const haystack = JSON.stringify(item).toLowerCase();
    return (objectId && haystack.includes(objectId.toLowerCase())) || (actionId && haystack.includes(actionId.toLowerCase())) || haystack.includes(requirementId.toLowerCase());
  });
  return { indexAvailable: true, items };
}

function readReferenceIndexFromLocalStorage() {
  try {
    const raw = localStorage.getItem('artifex.referenceIndex') || localStorage.getItem('artifex.projectReferenceIndex');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeRequirementData(requirementId, updates) {
  if (!requirementId) return;
  const current = editorState.archetype?.productionAssets || { version: VERSION, requirements: {}, requirementOrder: [] };
  const productionAssets = {
    ...current,
    version: VERSION,
    requirements: {
      ...(current.requirements || {}),
      [requirementId]: {
        ...((current.requirements || {})[requirementId] || {}),
        ...updates
      }
    }
  };
  updateArchetype({ productionAssets });
}

function renderFramePathTable(panel) {
  const selectedId = selectedRequirementId();
  const actions = panel.querySelector('.wizard-build-actions');
  if (!selectedId || !actions) return;
  let wrap = panel.querySelector('.wizard-frame-file-table-wrap');
  if (!wrap) {
    wrap = document.createElement('section');
    wrap.className = 'wizard-frame-file-table-wrap';
    actions.after(wrap);
  }
  const data = getRequirementData(selectedId);
  const frames = data.frames || [];
  const count = Math.max(frames.length, Number(data.frameCount) || 0);
  const rows = [];
  for (let index = 0; index < count; index += 1) {
    const frame = frames[index] || { name: `Frame ${index + 1}`, assetId: '' };
    rows.push(`<tr><td>${index + 1}</td><td>${escapeHtml(frame.name || `Frame ${index + 1}`)}</td><td><code>${escapeHtml(expectedFramePath(selectedId, frame, index))}</code></td></tr>`);
  }
  wrap.innerHTML = `<table class="wizard-frame-file-table"><thead><tr><th>#</th><th>Frame name</th><th>Expected game folder / file path</th></tr></thead><tbody>${rows.length ? rows.join('') : '<tr><td colspan="3" class="muted">No frame slots yet. Add images or set a frame count.</td></tr>'}</tbody></table>`;
}

function selectedRequirementId() {
  return document.querySelector('#quickstart-dialog .wizard-build-nav button.is-selected')?.dataset.requirementId || '';
}

function getRequirementData(requirementId) {
  return editorState.archetype?.productionAssets?.requirements?.[requirementId] || {};
}

function expectedFramePath(requirementId, frame, index) {
  const actionId = actionIdFromRequirement(requirementId);
  const folder = objectAssetFolder();
  const padded = String(index + 1).padStart(3, '0');
  const sourceName = frame?.name || `${actionId}_${padded}.png`;
  const ext = extensionFromName(sourceName) || 'png';
  const mode = requirementId.startsWith('portrait:') ? 'portraits' : requirementId.startsWith('asset:') ? 'assets' : requirementId.startsWith('metadata:') ? 'metadata' : 'animations';
  if (requirementId === 'asset:gameplay_sprite') return `${folder}/sprites/${safeId(editorState.archetype?.id || 'object')}_gameplay_sheet.${ext}`;
  if (requirementId === 'asset:dialogue_portrait') return `${folder}/portraits/${safeId(editorState.archetype?.id || 'object')}_portrait_${padded}.${ext}`;
  if (requirementId.startsWith('metadata:')) return `${folder}/metadata/${safeId(actionId)}.json`;
  return `${folder}/${mode}/${safeId(actionId)}/${padded}_${safeId(removeExtension(sourceName))}.${ext}`;
}

function objectAssetFolder() {
  const item = editorState.archetype || {};
  const id = safeId(item.id || item.name || 'object_archetype');
  const category = String(item.category || '').toLowerCase();
  const role = String(item.role || '').toLowerCase();
  if (category.includes('npc') || category.includes('character') || role.startsWith('person_')) return `assets/characters/${id}`;
  if (category.includes('enemy') || category.includes('foe')) return `assets/foes/${id}`;
  if (category.includes('creature')) return `assets/creatures/${id}`;
  if (role.includes('boss') || category.includes('boss')) return `assets/bosses/${id}`;
  return `assets/objects/${id}`;
}

function actionIdFromRequirement(requirementId) {
  return String(requirementId || '').split(':')[1] || String(requirementId || 'asset');
}

function actionFromSelected() {
  return actionIdFromRequirement(selectedRequirementId() || 'sound');
}

function downloadAssetZip() {
  try {
    const zipBytes = buildAssetZip();
    const blob = new Blob([zipBytes], { type: 'application/zip' });
    const objectId = safeId(editorState.archetype?.id || editorState.archetype?.name || 'object_archetype');
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${objectId}_asset_package.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('Asset ZIP created from uploaded frames.', 'success');
  } catch (error) {
    toast(`Could not create ZIP: ${error.message}`, 'error');
  }
}

function buildAssetZip() {
  const item = editorState.archetype || {};
  const requirements = item.productionAssets?.requirements || {};
  const files = [];
  const manifest = {
    packageType: 'artifex-archetype-object-assets',
    version: VERSION,
    archetypeId: item.id,
    archetypeName: item.name,
    rootFolder: objectAssetFolder(),
    generatedAt: new Date().toISOString(),
    files: [],
    actionSettings: {}
  };
  Object.entries(requirements).forEach(([requirementId, data]) => {
    manifest.actionSettings[requirementId] = {
      playbackRules: data.playbackRules || {},
      triggerMapping: data.triggerMapping || {},
      soundEvents: data.soundEvents || [],
      frameEvents: data.frameEvents || [],
      frameCorrections: data.frameCorrections || {},
      brightnessMatch: data.brightnessMatch || null
    };
    (data.frames || []).forEach((frame, index) => {
      if (!frame.dataUrl) return;
      const path = expectedFramePath(requirementId, frame, index);
      files.push({ path, bytes: dataUrlToBytes(frame.dataUrl) });
      manifest.files.push({ requirementId, frame: index + 1, name: frame.name || `Frame ${index + 1}`, path });
    });
  });
  files.push({ path: `${objectAssetFolder()}/metadata/archetype.json`, bytes: textEncoder.encode(JSON.stringify(item, null, 2)) });
  files.push({ path: `${objectAssetFolder()}/metadata/asset_manifest.json`, bytes: textEncoder.encode(JSON.stringify(manifest, null, 2)) });
  return createZip(files);
}

function dataUrlToBytes(dataUrl) {
  const [, meta = '', data = ''] = String(dataUrl).match(/^data:([^,]*),(.*)$/) || [];
  if (!data) return new Uint8Array();
  if (meta.includes(';base64')) {
    const raw = atob(data);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
    return bytes;
  }
  return textEncoder.encode(decodeURIComponent(data));
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  files.forEach((file) => {
    const name = textEncoder.encode(file.path.replace(/^\/+/, ''));
    const data = file.bytes instanceof Uint8Array ? file.bytes : new Uint8Array(file.bytes || []);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, dosTime(), true);
    view.setUint16(12, dosDate(), true);
    view.setUint32(14, crc, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, data.length, true);
    view.setUint16(26, name.length, true);
    view.setUint16(28, 0, true);
    local.set(name, 30);
    localParts.push(local, data);

    const central = new Uint8Array(46 + name.length);
    const cview = new DataView(central.buffer);
    cview.setUint32(0, 0x02014b50, true);
    cview.setUint16(4, 20, true);
    cview.setUint16(6, 20, true);
    cview.setUint16(8, 0, true);
    cview.setUint16(10, 0, true);
    cview.setUint16(12, dosTime(), true);
    cview.setUint16(14, dosDate(), true);
    cview.setUint32(16, crc, true);
    cview.setUint32(20, data.length, true);
    cview.setUint32(24, data.length, true);
    cview.setUint16(28, name.length, true);
    cview.setUint16(30, 0, true);
    cview.setUint16(32, 0, true);
    cview.setUint16(34, 0, true);
    cview.setUint16(36, 0, true);
    cview.setUint32(38, 0, true);
    cview.setUint32(42, offset, true);
    central.set(name, 46);
    centralParts.push(central);
    offset += local.length + data.length;
  });
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const eview = new DataView(end.buffer);
  eview.setUint32(0, 0x06054b50, true);
  eview.setUint16(8, files.length, true);
  eview.setUint16(10, files.length, true);
  eview.setUint32(12, centralSize, true);
  eview.setUint32(16, offset, true);
  return concatUint8([...localParts, ...centralParts, end]);
}

function concatUint8(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => { out.set(part, offset); offset += part.length; });
  return out;
}

let crcTable;
function crc32(bytes) {
  if (!crcTable) crcTable = makeCrcTable();
  let crc = 0 ^ -1;
  for (let i = 0; i < bytes.length; i += 1) crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

function dosTime(date = new Date()) { return (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2); }
function dosDate(date = new Date()) { return ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(); }
function extensionFromName(name) { return String(name || '').split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''; }
function removeExtension(name) { return String(name || '').replace(/\.[^.]+$/, ''); }
function safeId(value) { return String(value || 'object').trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '') || 'object'; }
function humanize(value) { return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function toast(message, type = 'info') { window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message, type } })); }

function scheduleDecorate() {
  if (queued) return;
  queued = true;
  window.requestAnimationFrame(() => {
    queued = false;
    decorateTemplateCards();
    enhanceWizardBuildPanel();
  });
}

function startObserver() {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    const shouldScan = mutations.some((mutation) => Array.from(mutation.addedNodes).some((node) => node.nodeType === Node.ELEMENT_NODE));
    if (shouldScan) scheduleDecorate();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  decorateTemplateCards();
  enhanceWizardBuildPanel();
  startObserver();
});
