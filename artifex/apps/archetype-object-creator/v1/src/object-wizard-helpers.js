export const WIZARD_DATA_VERSION = '1.36';

const EMOJI = {
  idle: '🧍', turn_face: '↔️', walk: '👟', patrol_walk: '🚶', move: '➡️', jump: '🦘', crouch_hide: '🫥', pickup: '🤲', hold_carry: '📦', throw: '🪨', use_item: '🛠️', gesture: '👋', give_item: '🎁', receive_item: '📥', interact_assist: '🤝', sing_magic_cast: '🎵', cast_ritual: '✨', channel: '🔮', attack: '⚔️', special_attack: '💥', take_damage: '💢', stunned: '💫', phase_change: '🌀', death: '☠️', enter_door: '🚪', exit_door: '🚪', open: '🔓', close: '🔒', locked: '🔐', collect: '🪙', searched_opened: '🔍', activate: '⚡', trigger: '🎚️', reset: '↩️', land_break: '💥', possession_overlay: '👁️', blink: '😉', expression_neutral: '😐', expression_happy: '🙂', expression_angry: '😠', expression_sad: '😟', mouth_loop: '🗣️', gameplay_sprite_asset: '🧩', dialogue_portrait_asset: '🖼️', collision: '📐', interaction: '💬'
};

export function emojiFor(id) { return EMOJI[id] || '🔹'; }
export function labelFor(list, id) { return list.find((item) => item.id === id)?.label || humanize(id); }
export function safeId(value) { return String(value || 'object_archetype').trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '') || 'object_archetype'; }
export function humanize(value) { return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()); }
export function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
export function clampNumber(value, fallback, min, max) { const number = Number(value); return Math.min(max, Math.max(min, Number.isFinite(number) ? number : fallback)); }
export function appendNote(existing, note) { return existing ? `${existing}\n${note}` : note; }
