import { normalizeControls } from './sound-generator-controls.js';

const makePreset = (id, name, category, description, controls) => Object.freeze({
  id,
  name,
  category,
  description,
  controls: Object.freeze(normalizeControls({
    name,
    category,
    tags: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    soundTypeId: id,
    ...controls
  }))
});

export const EXAMPLE_GROUPS = Object.freeze([
  {
    id: 'ui-feedback',
    label: 'UI + Feedback',
    presets: Object.freeze([
      makePreset('ui-confirm', 'Gentle Confirm', 'UI Feedback', 'A clean confirmation ping for selecting or accepting.', { waveform: 'sine', pitch: 69, pitchChange: 'rises', brightness: 78, length: 18, tone: 12, static: 0, echo: 18, wobble: 0, impact: 36, attack: 0, sustain: 8, sustainPunch: 18, decay: 24, slide: 58, arpMult: 28, arpSpeed: 76, lpfCutoff: 88, pattern: 'single', pace: 70, volume: 54, loop: false }),
      makePreset('puzzle-correct', 'Puzzle Correct Input', 'Puzzle Feedback', 'Bright reward feedback for a correct step.', { waveform: 'sine', pitch: 64, pitchChange: 'rises', brightness: 84, length: 22, tone: 17, static: 0, echo: 28, wobble: 0, impact: 42, attack: 0, sustain: 10, sustainPunch: 22, decay: 30, slide: 62, arpMult: 42, arpSpeed: 80, lpfCutoff: 92, pattern: 'double', pace: 84, volume: 56, loop: false }),
      makePreset('puzzle-wrong', 'Puzzle Wrong Input', 'Puzzle Feedback', 'Short blunt refusal cue without sounding violent.', { waveform: 'square', pitch: 34, pitchChange: 'drops', brightness: 31, length: 16, tone: 68, static: 28, echo: 3, wobble: 6, impact: 58, attack: 0, sustain: 8, sustainPunch: 20, decay: 38, slide: 28, deltaSlide: 38, hpfCutoff: 5, lpfCutoff: 42, pattern: 'double', pace: 82, volume: 57, loop: false }),
      makePreset('timer-warning', 'Timer Warning', 'UI Feedback', 'Repeating warning pulse for time-sensitive interactions.', { waveform: 'square', pitch: 58, pitchChange: 'steady', brightness: 60, length: 15, tone: 44, static: 10, echo: 5, wobble: 0, impact: 58, attack: 0, sustain: 12, sustainPunch: 36, decay: 32, slide: 50, retriggerRate: 0, lpfCutoff: 76, pattern: 'triple', pace: 62, volume: 52, loop: false })
    ])
  },
  {
    id: 'objects-actions',
    label: 'Objects + Actions',
    presets: Object.freeze([
      makePreset('locked-door', 'Locked Door Buzz', 'Object Interaction', 'Dull blocked-door thud with metallic rattle and refusal buzz.', { waveform: 'square', pitch: 30, pitchChange: 'drops', brightness: 24, length: 28, tone: 82, static: 58, echo: 4, wobble: 28, impact: 78, attack: 0, sustain: 16, sustainPunch: 38, decay: 46, slide: 24, deltaSlide: 38, retriggerRate: 46, flangerOffset: 24, lpfCutoff: 36, lpfResonance: 38, hpfCutoff: 4, pattern: 'single', pace: 62, volume: 62, loop: false }),
      makePreset('item-pickup', 'Item Pickup Chime', 'Object Interaction', 'Quick rewarding pickup sparkle with a click and rising tonal tail.', { waveform: 'sine', pitch: 76, pitchChange: 'rises', brightness: 92, length: 20, tone: 8, static: 0, echo: 30, wobble: 2, impact: 42, attack: 0, sustain: 10, sustainPunch: 18, decay: 28, slide: 70, arpMult: 58, arpSpeed: 86, lpfCutoff: 96, pattern: 'double', pace: 88, volume: 50, loop: false }),
      makePreset('mechanism-click', 'Mechanism Unlock', 'Object Interaction', 'Firm activation click followed by a tiny mechanical lift.', { waveform: 'square', pitch: 47, pitchChange: 'rises', brightness: 56, length: 20, tone: 54, static: 22, echo: 8, wobble: 0, impact: 82, attack: 0, sustain: 8, sustainPunch: 44, decay: 30, slide: 58, arpMult: 22, arpSpeed: 74, retriggerRate: 18, lpfCutoff: 70, pattern: 'double', pace: 88, volume: 57, loop: false }),
      makePreset('door-open', 'Door Open / Creak', 'Object Interaction', 'Low scrape and creak movement for a door opening.', { waveform: 'sawtooth', pitch: 35, pitchChange: 'drops', brightness: 36, length: 48, tone: 60, static: 38, echo: 9, wobble: 18, impact: 48, attack: 4, sustain: 42, sustainPunch: 12, decay: 56, slide: 32, deltaSlide: 42, flangerOffset: 16, lpfCutoff: 44, lpfSweep: 40, pattern: 'single', pace: 62, volume: 50, loop: false }),
      makePreset('footstep-soft', 'Soft Footstep', 'Movement', 'Small muted thud for lightweight movement testing.', { waveform: 'noise', pitch: 24, pitchChange: 'drops', brightness: 18, length: 10, tone: 74, static: 52, echo: 0, wobble: 0, impact: 62, attack: 0, sustain: 5, sustainPunch: 18, decay: 24, slide: 35, lpfCutoff: 26, hpfCutoff: 0, pattern: 'single', pace: 62, volume: 45, loop: false })
    ])
  },
  {
    id: 'combat-impact',
    label: 'Combat + Impact',
    presets: Object.freeze([
      makePreset('hit-impact', 'Hit / Impact', 'Combat', 'Sharp impact burst with body and rough contact texture.', { waveform: 'noise', pitch: 32, pitchChange: 'drops', brightness: 44, length: 18, tone: 76, static: 68, echo: 2, wobble: 0, impact: 92, attack: 0, sustain: 8, sustainPunch: 54, decay: 38, slide: 24, retriggerRate: 18, lpfCutoff: 54, hpfCutoff: 6, pattern: 'single', pace: 62, volume: 62, loop: false }),
      makePreset('explosion', 'Explosion', 'Combat', 'Noise-heavy impact with a low boom and crackling tail.', { waveform: 'noise', pitch: 20, pitchChange: 'drops', brightness: 32, length: 56, tone: 92, static: 94, echo: 12, wobble: 16, impact: 96, attack: 0, sustain: 40, sustainPunch: 64, decay: 76, slide: 18, deltaSlide: 34, retriggerRate: 52, lpfCutoff: 38, lpfResonance: 12, hpfCutoff: 0, pattern: 'single', pace: 62, volume: 60, loop: false })
    ])
  },
  {
    id: 'magic-world',
    label: 'Magic + World',
    presets: Object.freeze([
      makePreset('magic-spark', 'Magic Spark', 'Magic', 'Small shining spell accent or rune activation.', { waveform: 'sine', pitch: 78, pitchChange: 'rises', brightness: 94, length: 34, tone: 20, static: 4, echo: 48, wobble: 14, impact: 42, attack: 0, sustain: 18, sustainPunch: 18, decay: 46, slide: 66, arpMult: 38, arpSpeed: 82, vibratoDepth: 16, vibratoSpeed: 76, flangerOffset: 14, lpfCutoff: 96, pattern: 'double', pace: 90, volume: 50, loop: false }),
      makePreset('portal-flicker', 'Portal Flicker', 'Magic', 'Unstable pulsing shimmer for a magical gateway.', { waveform: 'sawtooth', pitch: 52, pitchChange: 'steady', brightness: 72, length: 54, tone: 46, static: 12, echo: 54, wobble: 62, impact: 35, attack: 8, sustain: 65, sustainPunch: 10, decay: 70, slide: 52, deltaSlide: 58, vibratoDepth: 66, vibratoSpeed: 70, flangerOffset: 48, flangerSweep: 70, lpfCutoff: 78, lpfResonance: 54, pattern: 'triple', pace: 78, volume: 48, loop: true }),
      makePreset('machine-hum', 'Ancient Machine Hum', 'Ambience', 'Continuous low mechanical atmosphere.', { waveform: 'sawtooth', pitch: 23, pitchChange: 'steady', brightness: 29, length: 76, tone: 52, static: 18, echo: 18, wobble: 45, impact: 20, attack: 20, sustain: 84, sustainPunch: 0, decay: 76, slide: 50, vibratoDepth: 48, vibratoSpeed: 36, flangerOffset: 18, lpfCutoff: 38, hpfCutoff: 2, pattern: 'single', pace: 62, volume: 40, loop: true }),
      makePreset('cave-wind', 'Cave Wind', 'Ambience', 'Breathy environmental texture for a dark location.', { waveform: 'noise', pitch: 18, pitchChange: 'steady', brightness: 38, length: 88, tone: 90, static: 88, echo: 38, wobble: 26, impact: 14, attack: 30, sustain: 86, sustainPunch: 0, decay: 84, slide: 50, vibratoDepth: 24, vibratoSpeed: 24, lpfCutoff: 44, hpfCutoff: 12, pattern: 'single', pace: 62, volume: 34, loop: true })
    ])
  }
]);

export const START_FOUNDATIONS = Object.freeze([
  makePreset('foundation-bleep', 'New Bleep', 'Custom Sound', 'Clean electronic starting point.', { waveform: 'sine', pitch: 61, pitchChange: 'steady', brightness: 69, length: 19, tone: 8, static: 0, echo: 10, wobble: 0, impact: 34, attack: 0, sustain: 12, decay: 28, pattern: 'single', pace: 62, volume: 50, loop: false }),
  makePreset('foundation-buzz', 'New Buzz', 'Custom Sound', 'Rough mechanical starting point.', { waveform: 'square', pitch: 35, pitchChange: 'steady', brightness: 32, length: 28, tone: 84, static: 50, echo: 3, wobble: 35, impact: 52, attack: 0, sustain: 18, decay: 42, retriggerRate: 20, pattern: 'single', pace: 62, volume: 55, loop: false }),
  makePreset('foundation-chime', 'New Chime', 'Custom Sound', 'Bright resonant starting point.', { waveform: 'sine', pitch: 75, pitchChange: 'drops', brightness: 88, length: 40, tone: 13, static: 0, echo: 48, wobble: 0, impact: 34, attack: 0, sustain: 32, decay: 54, arpMult: 18, pattern: 'single', pace: 62, volume: 48, loop: false }),
  makePreset('foundation-thump', 'New Thump', 'Custom Sound', 'Short low-impact starting point.', { waveform: 'noise', pitch: 20, pitchChange: 'drops', brightness: 18, length: 14, tone: 68, static: 42, echo: 0, wobble: 0, impact: 78, attack: 0, sustain: 5, decay: 34, pattern: 'single', pace: 62, volume: 57, loop: false }),
  makePreset('foundation-sweep', 'New Sweep', 'Custom Sound', 'Moving tonal effect for transitions.', { waveform: 'sawtooth', pitch: 48, pitchChange: 'rises', brightness: 60, length: 47, tone: 29, static: 4, echo: 26, wobble: 5, impact: 32, attack: 4, sustain: 45, decay: 55, slide: 66, pattern: 'single', pace: 62, volume: 50, loop: false }),
  makePreset('foundation-pulse', 'New Pulse', 'Custom Sound', 'Repeated signal or alert foundation.', { waveform: 'square', pitch: 50, pitchChange: 'steady', brightness: 53, length: 16, tone: 37, static: 10, echo: 10, wobble: 0, impact: 46, attack: 0, sustain: 12, decay: 34, pattern: 'triple', pace: 66, volume: 50, loop: false }),
  makePreset('foundation-noise', 'New Noise Burst', 'Custom Sound', 'Breath, hit or rough texture foundation.', { waveform: 'noise', pitch: 29, pitchChange: 'drops', brightness: 40, length: 24, tone: 96, static: 96, echo: 12, wobble: 10, impact: 64, attack: 0, sustain: 16, decay: 48, pattern: 'single', pace: 62, volume: 46, loop: false }),
  makePreset('foundation-hum', 'New Hum', 'Custom Sound', 'Looping atmosphere or machine foundation.', { waveform: 'sawtooth', pitch: 26, pitchChange: 'steady', brightness: 31, length: 76, tone: 39, static: 12, echo: 15, wobble: 44, impact: 18, attack: 20, sustain: 82, decay: 76, pattern: 'single', pace: 62, volume: 38, loop: true })
]);

export function copyPresetControls(preset) {
  return { ...preset.controls };
}

export function findExamplePreset(id) {
  return EXAMPLE_GROUPS.flatMap((group) => group.presets).find((preset) => preset.id === id) || null;
}

export function findFoundationPreset(id) {
  return START_FOUNDATIONS.find((preset) => preset.id === id) || null;
}

export function firstExamplePreset() {
  return EXAMPLE_GROUPS[0].presets[0];
}
