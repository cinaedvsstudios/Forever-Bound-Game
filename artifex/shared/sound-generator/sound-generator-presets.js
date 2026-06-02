import { normalizeControls } from './sound-generator-controls.js';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(Number(value))));
const sample = (items) => items[Math.floor(Math.random() * items.length)];
const vary = (base, amount) => clamp(base + (Math.random() * amount * 2 - amount));

function makeSoundType(group, id, label, description, controls, variation = {}) {
  return Object.freeze({
    group,
    id,
    label,
    description,
    controls: Object.freeze(normalizeControls({
      name: label,
      category: group.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tags: `${group}, ${label}`,
      ...controls
    })),
    variation: Object.freeze(variation)
  });
}

export const SOUND_TYPE_GROUPS = Object.freeze([
  Object.freeze({ id: 'ui', label: 'UI' }),
  Object.freeze({ id: 'puzzle', label: 'Puzzle' }),
  Object.freeze({ id: 'objects', label: 'Objects' }),
  Object.freeze({ id: 'movement', label: 'Movement' }),
  Object.freeze({ id: 'combat', label: 'Combat' }),
  Object.freeze({ id: 'magic-fx', label: 'Magic / FX' }),
  Object.freeze({ id: 'world-ambience', label: 'World / Ambience' }),
  Object.freeze({ id: 'quest-dialogue', label: 'Quest / Dialogue' })
]);

export const SOUND_TYPES = Object.freeze([
  makeSoundType('UI', 'ui-confirm', 'Confirm', 'Small positive UI acknowledgement.', { pitch: 67, pitchChange: 'rises', brightness: 76, length: 15, tone: 20, static: 0, echo: 12, wobble: 0, impact: 42, pattern: 'single', pace: 78 }),
  makeSoundType('UI', 'ui-cancel-refuse', 'Cancel / Refuse', 'Short downward refusal response.', { pitch: 38, pitchChange: 'drops', brightness: 36, length: 13, tone: 56, static: 14, echo: 2, wobble: 6, impact: 48, pattern: 'single', pace: 72 }),
  makeSoundType('UI', 'ui-hover', 'Hover', 'Very small hover tick.', { pitch: 61, pitchChange: 'steady', brightness: 63, length: 7, tone: 32, static: 3, echo: 0, wobble: 0, impact: 26, pattern: 'single', pace: 80 }),
  makeSoundType('UI', 'ui-warning', 'Warning', 'Attention pulse without becoming an alarm loop.', { pitch: 50, pitchChange: 'steady', brightness: 59, length: 19, tone: 46, static: 16, echo: 5, wobble: 18, impact: 56, pattern: 'double', pace: 66 }),
  makeSoundType('UI', 'ui-notification', 'Notification', 'Bright compact attention chime.', { pitch: 69, pitchChange: 'rises', brightness: 81, length: 22, tone: 18, static: 0, echo: 18, wobble: 4, impact: 38, pattern: 'double', pace: 86 }),

  makeSoundType('Puzzle', 'puzzle-correct-input', 'Correct Input', 'Positive puzzle input confirmation.', { pitch: 68, pitchChange: 'rises', brightness: 78, length: 20, tone: 24, static: 0, echo: 20, wobble: 2, impact: 44, pattern: 'double', pace: 84 }),
  makeSoundType('Puzzle', 'puzzle-wrong-input', 'Wrong Input', 'Short blunt puzzle refusal.', { pitch: 34, pitchChange: 'drops', brightness: 31, length: 16, tone: 66, static: 28, echo: 3, wobble: 9, impact: 52, pattern: 'double', pace: 76 }),
  makeSoundType('Puzzle', 'puzzle-unlock', 'Unlock', 'Mechanical success click with a lift.', { pitch: 49, pitchChange: 'rises', brightness: 57, length: 24, tone: 50, static: 20, echo: 11, wobble: 0, impact: 70, pattern: 'double', pace: 78 }),
  makeSoundType('Puzzle', 'puzzle-timer-warning', 'Timer Warning', 'Repeating warning pulse for time pressure.', { pitch: 58, pitchChange: 'steady', brightness: 57, length: 15, tone: 41, static: 14, echo: 5, wobble: 0, impact: 58, pattern: 'triple', pace: 62 }),
  makeSoundType('Puzzle', 'puzzle-complete', 'Puzzle Complete', 'Small completion flourish.', { pitch: 72, pitchChange: 'rises', brightness: 84, length: 36, tone: 18, static: 0, echo: 35, wobble: 5, impact: 46, pattern: 'triple', pace: 84 }),

  makeSoundType('Objects', 'pickup-coin', 'Pickup / Coin', 'Short bright upward/rewarding pickup sparkle.', { pitch: 76, pitchChange: 'rises', brightness: 90, length: 20, tone: 9, static: 0, echo: 24, wobble: 2, impact: 42, pattern: 'double', pace: 89 }, { pitch: 8, length: 5, brightness: 8, echo: 12, pattern: ['double', 'triple'], pitchChange: ['rises'] }),
  makeSoundType('Objects', 'object-drop', 'Drop', 'Small object landing thud.', { pitch: 27, pitchChange: 'drops', brightness: 24, length: 16, tone: 67, static: 32, echo: 2, wobble: 0, impact: 64, pattern: 'single', pace: 62 }),
  makeSoundType('Objects', 'door-open', 'Door Open', 'Wooden/mechanical door movement cue.', { pitch: 36, pitchChange: 'drops', brightness: 36, length: 42, tone: 58, static: 31, echo: 9, wobble: 16, impact: 45, pattern: 'single', pace: 62 }),
  makeSoundType('Objects', 'locked-door', 'Locked Door', 'Brief dull locked refusal cue with buzz/knock identity.', { pitch: 30, pitchChange: 'drops', brightness: 24, length: 22, tone: 80, static: 48, echo: 4, wobble: 34, impact: 62, pattern: 'single', pace: 66 }, { pitch: 5, length: 5, tone: 10, static: 12, echo: 8, wobble: 16, pitchChange: ['drops', 'steady'], pattern: ['single', 'double'] }),
  makeSoundType('Objects', 'lever', 'Lever', 'Firm lever switch movement.', { pitch: 40, pitchChange: 'drops', brightness: 42, length: 27, tone: 60, static: 29, echo: 5, wobble: 7, impact: 73, pattern: 'double', pace: 58 }),
  makeSoundType('Objects', 'chest-open', 'Chest Open', 'Lid open with small reward tail.', { pitch: 50, pitchChange: 'rises', brightness: 54, length: 34, tone: 42, static: 18, echo: 19, wobble: 3, impact: 58, pattern: 'double', pace: 64 }),

  makeSoundType('Movement', 'footstep', 'Footstep', 'Brief impact/noise-like step.', { pitch: 23, pitchChange: 'drops', brightness: 20, length: 9, tone: 74, static: 48, echo: 0, wobble: 0, impact: 66, pattern: 'single', pace: 62 }, { pitch: 7, length: 4, brightness: 13, tone: 12, static: 18, impact: 18, echo: 3, pitchChange: ['drops'], pattern: ['single'] }),
  makeSoundType('Movement', 'jump', 'Jump', 'Short upward movement cue.', { pitch: 53, pitchChange: 'rises', brightness: 50, length: 20, tone: 38, static: 4, echo: 2, wobble: 4, impact: 36, pattern: 'single', pace: 62 }),
  makeSoundType('Movement', 'land', 'Land', 'Ground impact landing thump.', { pitch: 24, pitchChange: 'drops', brightness: 22, length: 15, tone: 72, static: 35, echo: 0, wobble: 0, impact: 78, pattern: 'single', pace: 62 }),
  makeSoundType('Movement', 'slide-fall', 'Slide / Fall', 'Downward noisy slide cue.', { pitch: 36, pitchChange: 'drops', brightness: 32, length: 38, tone: 64, static: 45, echo: 7, wobble: 20, impact: 48, pattern: 'single', pace: 62 }),

  makeSoundType('Combat', 'attack-swing', 'Attack Swing', 'Fast airy weapon swing.', { pitch: 45, pitchChange: 'drops', brightness: 58, length: 17, tone: 56, static: 35, echo: 2, wobble: 4, impact: 64, pattern: 'single', pace: 62 }),
  makeSoundType('Combat', 'hit', 'Hit', 'Sharp contact hit.', { pitch: 31, pitchChange: 'drops', brightness: 38, length: 13, tone: 76, static: 54, echo: 1, wobble: 0, impact: 88, pattern: 'single', pace: 62 }),
  makeSoundType('Combat', 'hurt', 'Hurt', 'Short rough hurt cue.', { pitch: 34, pitchChange: 'drops', brightness: 30, length: 18, tone: 68, static: 46, echo: 2, wobble: 16, impact: 70, pattern: 'single', pace: 62 }),
  makeSoundType('Combat', 'impact', 'Impact', 'Heavy contact impact.', { pitch: 24, pitchChange: 'drops', brightness: 27, length: 21, tone: 74, static: 58, echo: 5, wobble: 3, impact: 92, pattern: 'single', pace: 62 }),
  makeSoundType('Combat', 'defeat', 'Defeat', 'Falling defeat cue.', { pitch: 30, pitchChange: 'drops', brightness: 26, length: 45, tone: 62, static: 32, echo: 17, wobble: 9, impact: 66, pattern: 'double', pace: 50 }),
  makeSoundType('Combat', 'explosion', 'Explosion', 'Strong noise-heavy impact with falling rumble tail.', { pitch: 20, pitchChange: 'drops', brightness: 30, length: 52, tone: 88, static: 86, echo: 14, wobble: 22, impact: 95, pattern: 'single', pace: 62 }, { pitch: 6, length: 16, brightness: 12, tone: 12, static: 14, echo: 10, wobble: 12, impact: 6, pitchChange: ['drops'], pattern: ['single'] }),

  makeSoundType('Magic / FX', 'magic-spark', 'Magic Spark', 'Bright magical flicker.', { pitch: 79, pitchChange: 'rises', brightness: 92, length: 31, tone: 22, static: 4, echo: 49, wobble: 18, impact: 42, pattern: 'double', pace: 90 }, { pitch: 10, length: 10, brightness: 8, echo: 18, wobble: 18, static: 8, pitchChange: ['rises', 'steady'], pattern: ['double', 'triple'] }),
  makeSoundType('Magic / FX', 'spell-cast', 'Spell Cast', 'Rising magical cast.', { pitch: 58, pitchChange: 'rises', brightness: 76, length: 46, tone: 30, static: 7, echo: 38, wobble: 26, impact: 46, pattern: 'single', pace: 62 }),
  makeSoundType('Magic / FX', 'spell-impact', 'Spell Impact', 'Spark impact burst.', { pitch: 48, pitchChange: 'drops', brightness: 73, length: 24, tone: 38, static: 28, echo: 29, wobble: 12, impact: 82, pattern: 'single', pace: 62 }),
  makeSoundType('Magic / FX', 'portal-open', 'Portal Open', 'Rising portal activation.', { pitch: 46, pitchChange: 'rises', brightness: 68, length: 63, tone: 42, static: 15, echo: 45, wobble: 48, impact: 45, pattern: 'triple', pace: 70 }),
  makeSoundType('Magic / FX', 'portal-loop', 'Portal Loop', 'Sustained atmospheric portal loop.', { pitch: 34, pitchChange: 'steady', brightness: 42, length: 78, tone: 48, static: 18, echo: 42, wobble: 62, impact: 30, pattern: 'single', pace: 62, loop: true }, { pitch: 8, length: 10, brightness: 20, tone: 14, static: 12, echo: 16, wobble: 22, impact: 8, pitchChange: ['steady'], pattern: ['single'], loop: true }),
  makeSoundType('Magic / FX', 'healing', 'Healing', 'Soft restorative magical shimmer.', { pitch: 67, pitchChange: 'rises', brightness: 78, length: 48, tone: 16, static: 0, echo: 44, wobble: 10, impact: 28, pattern: 'triple', pace: 82 }),

  makeSoundType('World / Ambience', 'water-drop', 'Water Drop', 'Small water droplet.', { pitch: 62, pitchChange: 'drops', brightness: 58, length: 31, tone: 18, static: 4, echo: 35, wobble: 3, impact: 35, pattern: 'single', pace: 62 }),
  makeSoundType('World / Ambience', 'fire-crackle', 'Fire Crackle', 'Short fire noise crackle.', { pitch: 38, pitchChange: 'steady', brightness: 57, length: 36, tone: 76, static: 80, echo: 4, wobble: 20, impact: 40, pattern: 'triple', pace: 78 }),
  makeSoundType('World / Ambience', 'machine-hum', 'Machine Hum', 'Continuous low machine ambience.', { pitch: 23, pitchChange: 'steady', brightness: 29, length: 74, tone: 52, static: 18, echo: 18, wobble: 45, impact: 22, pattern: 'single', pace: 62, loop: true }),
  makeSoundType('World / Ambience', 'wind-pulse', 'Wind Pulse', 'Breathy environmental pulse.', { pitch: 24, pitchChange: 'steady', brightness: 38, length: 70, tone: 88, static: 83, echo: 38, wobble: 26, impact: 24, pattern: 'single', pace: 62, loop: true }),

  makeSoundType('Quest / Dialogue', 'quest-accepted', 'Quest Accepted', 'Positive quest start cue.', { pitch: 64, pitchChange: 'rises', brightness: 72, length: 36, tone: 25, static: 0, echo: 28, wobble: 4, impact: 42, pattern: 'double', pace: 80 }),
  makeSoundType('Quest / Dialogue', 'quest-complete', 'Quest Complete', 'Rewarding celebratory completion cue.', { pitch: 72, pitchChange: 'rises', brightness: 86, length: 51, tone: 18, static: 0, echo: 41, wobble: 5, impact: 48, pattern: 'triple', pace: 86 }, { pitch: 10, length: 14, brightness: 9, echo: 16, wobble: 8, impact: 10, pitchChange: ['rises'], pattern: ['triple', 'repeat'] }),
  makeSoundType('Quest / Dialogue', 'reward', 'Reward', 'Small reward sparkle.', { pitch: 76, pitchChange: 'rises', brightness: 88, length: 32, tone: 14, static: 0, echo: 32, wobble: 3, impact: 44, pattern: 'triple', pace: 90 }),
  makeSoundType('Quest / Dialogue', 'dialogue-advance', 'Dialogue Advance', 'Subtle dialogue tick.', { pitch: 55, pitchChange: 'steady', brightness: 52, length: 9, tone: 34, static: 4, echo: 0, wobble: 0, impact: 30, pattern: 'single', pace: 62 })
]);

export const EXAMPLE_GROUPS = Object.freeze(SOUND_TYPE_GROUPS.map((group) => Object.freeze({
  id: group.id,
  label: group.label,
  presets: Object.freeze(SOUND_TYPES.filter((type) => type.group === group.label))
})));

export const START_FOUNDATIONS = Object.freeze(SOUND_TYPES.slice(0, 8));

export function copyPresetControls(preset) {
  return normalizeControls({ ...preset.controls });
}

export function findSoundType(id) {
  return SOUND_TYPES.find((type) => type.id === id) || null;
}

export function findExamplePreset(id) {
  return findSoundType(id);
}

export function findFoundationPreset(id) {
  return findSoundType(id);
}

export function firstExamplePreset() {
  return SOUND_TYPES[0];
}

export function constrainedVariationForSoundType(soundTypeOrId) {
  const soundType = typeof soundTypeOrId === 'string' ? findSoundType(soundTypeOrId) : soundTypeOrId;
  if (!soundType) return copyPresetControls(firstExamplePreset());
  const base = soundType.controls;
  const profile = soundType.variation || {};
  return normalizeControls({
    ...base,
    pitch: vary(base.pitch, profile.pitch ?? 8),
    length: vary(base.length, profile.length ?? 7),
    brightness: vary(base.brightness, profile.brightness ?? 10),
    tone: vary(base.tone, profile.tone ?? 10),
    static: vary(base.static, profile.static ?? 10),
    echo: vary(base.echo, profile.echo ?? 10),
    wobble: vary(base.wobble, profile.wobble ?? 12),
    impact: vary(base.impact, profile.impact ?? 10),
    pace: vary(base.pace, profile.pace ?? 8),
    pitchChange: sample(profile.pitchChange || [base.pitchChange]),
    pattern: sample(profile.pattern || [base.pattern]),
    loop: Object.hasOwn(profile, 'loop') ? Boolean(profile.loop) : base.loop,
    name: soundType.label,
    category: base.category,
    tags: base.tags
  });
}
