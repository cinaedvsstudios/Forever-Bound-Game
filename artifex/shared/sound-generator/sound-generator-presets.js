const makePreset = (id, name, category, description, controls) => Object.freeze({
  id,
  name,
  category,
  description,
  controls: Object.freeze({ name, category, tags: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'), ...controls })
});

export const EXAMPLE_GROUPS = Object.freeze([
  {
    id: 'ui-feedback',
    label: 'UI + Feedback',
    presets: Object.freeze([
      makePreset('ui-confirm', 'Gentle Confirm', 'UI Feedback', 'A clean confirmation ping for selecting or accepting.', { pitch: 69, pitchChange: 'rises', brightness: 72, length: 22, tone: 13, static: 0, echo: 18, wobble: 0, pattern: 'single', pace: 62, volume: 54, loop: false }),
      makePreset('puzzle-correct', 'Puzzle Correct Input', 'Puzzle Feedback', 'Bright two-note reward feedback for a correct step.', { pitch: 63, pitchChange: 'rises', brightness: 78, length: 20, tone: 19, static: 0, echo: 25, wobble: 0, pattern: 'double', pace: 80, volume: 56, loop: false }),
      makePreset('puzzle-wrong', 'Puzzle Wrong Input', 'Puzzle Feedback', 'Short blunt refusal cue without sounding violent.', { pitch: 36, pitchChange: 'drops', brightness: 30, length: 17, tone: 64, static: 28, echo: 4, wobble: 8, pattern: 'double', pace: 91, volume: 57, loop: false }),
      makePreset('timer-warning', 'Timer Warning', 'UI Feedback', 'Repeating warning pulse for time-sensitive interactions.', { pitch: 58, pitchChange: 'steady', brightness: 57, length: 15, tone: 41, static: 14, echo: 5, wobble: 0, pattern: 'triple', pace: 62, volume: 50, loop: false })
    ])
  },
  {
    id: 'objects-actions',
    label: 'Objects + Actions',
    presets: Object.freeze([
      makePreset('locked-door', 'Locked Door Buzz', 'Object Interaction', 'A mechanical refusal buzz for a blocked door or lock.', { pitch: 31, pitchChange: 'drops', brightness: 25, length: 24, tone: 82, static: 48, echo: 4, wobble: 38, pattern: 'single', pace: 62, volume: 62, loop: false }),
      makePreset('item-pickup', 'Item Pickup Chime', 'Object Interaction', 'A quick rewarding pickup sparkle.', { pitch: 73, pitchChange: 'rises', brightness: 86, length: 24, tone: 10, static: 0, echo: 32, wobble: 3, pattern: 'double', pace: 86, volume: 50, loop: false }),
      makePreset('mechanism-click', 'Mechanism Unlock', 'Object Interaction', 'A firm activation click followed by a small success lift.', { pitch: 45, pitchChange: 'rises', brightness: 53, length: 18, tone: 54, static: 22, echo: 10, wobble: 0, pattern: 'double', pace: 90, volume: 57, loop: false }),
      makePreset('footstep-soft', 'Soft Footstep', 'Movement', 'Small muted thud for lightweight movement testing.', { pitch: 24, pitchChange: 'drops', brightness: 18, length: 10, tone: 74, static: 44, echo: 0, wobble: 0, pattern: 'single', pace: 62, volume: 45, loop: false })
    ])
  },
  {
    id: 'magic-world',
    label: 'Magic + World',
    presets: Object.freeze([
      makePreset('magic-spark', 'Magic Spark', 'Magic', 'A small shining spell accent or rune activation.', { pitch: 78, pitchChange: 'rises', brightness: 91, length: 32, tone: 23, static: 4, echo: 51, wobble: 17, pattern: 'double', pace: 90, volume: 50, loop: false }),
      makePreset('portal-flicker', 'Portal Flicker', 'Magic', 'An unstable pulsing shimmer for a magical gateway.', { pitch: 57, pitchChange: 'steady', brightness: 72, length: 42, tone: 43, static: 12, echo: 48, wobble: 62, pattern: 'triple', pace: 81, volume: 48, loop: true }),
      makePreset('machine-hum', 'Ancient Machine Hum', 'Ambience', 'A continuous low mechanical atmosphere.', { pitch: 23, pitchChange: 'steady', brightness: 29, length: 74, tone: 52, static: 18, echo: 18, wobble: 45, pattern: 'single', pace: 62, volume: 40, loop: true }),
      makePreset('cave-wind', 'Cave Wind', 'Ambience', 'Breathy environmental texture for a dark location.', { pitch: 18, pitchChange: 'steady', brightness: 38, length: 87, tone: 90, static: 84, echo: 38, wobble: 26, pattern: 'single', pace: 62, volume: 34, loop: true })
    ])
  }
]);

export const START_FOUNDATIONS = Object.freeze([
  makePreset('foundation-bleep', 'New Bleep', 'Custom Sound', 'Clean electronic starting point.', { pitch: 61, pitchChange: 'steady', brightness: 69, length: 19, tone: 8, static: 0, echo: 10, wobble: 0, pattern: 'single', pace: 62, volume: 50, loop: false }),
  makePreset('foundation-buzz', 'New Buzz', 'Custom Sound', 'Rough mechanical starting point.', { pitch: 35, pitchChange: 'steady', brightness: 32, length: 28, tone: 84, static: 50, echo: 3, wobble: 35, pattern: 'single', pace: 62, volume: 55, loop: false }),
  makePreset('foundation-chime', 'New Chime', 'Custom Sound', 'Bright resonant starting point.', { pitch: 75, pitchChange: 'drops', brightness: 88, length: 40, tone: 13, static: 0, echo: 48, wobble: 0, pattern: 'single', pace: 62, volume: 48, loop: false }),
  makePreset('foundation-thump', 'New Thump', 'Custom Sound', 'Short low-impact starting point.', { pitch: 20, pitchChange: 'drops', brightness: 18, length: 14, tone: 68, static: 37, echo: 0, wobble: 0, pattern: 'single', pace: 62, volume: 57, loop: false }),
  makePreset('foundation-sweep', 'New Sweep', 'Custom Sound', 'Moving tonal effect for transitions.', { pitch: 48, pitchChange: 'rises', brightness: 60, length: 47, tone: 29, static: 4, echo: 26, wobble: 5, pattern: 'single', pace: 62, volume: 50, loop: false }),
  makePreset('foundation-pulse', 'New Pulse', 'Custom Sound', 'Repeated signal or alert foundation.', { pitch: 50, pitchChange: 'steady', brightness: 53, length: 16, tone: 37, static: 10, echo: 10, wobble: 0, pattern: 'triple', pace: 66, volume: 50, loop: false }),
  makePreset('foundation-noise', 'New Noise Burst', 'Custom Sound', 'Breath, hit or rough texture foundation.', { pitch: 29, pitchChange: 'drops', brightness: 40, length: 24, tone: 96, static: 96, echo: 12, wobble: 10, pattern: 'single', pace: 62, volume: 46, loop: false }),
  makePreset('foundation-hum', 'New Hum', 'Custom Sound', 'Looping atmosphere or machine foundation.', { pitch: 26, pitchChange: 'steady', brightness: 31, length: 76, tone: 39, static: 12, echo: 15, wobble: 44, pattern: 'single', pace: 62, volume: 38, loop: true })
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
