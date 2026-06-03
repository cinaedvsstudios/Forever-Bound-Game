const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value)));
const integer = (value, min, max) => Math.round(clamp(value, min, max));
const round = (value, digits = 3) => Number(Number(value).toFixed(digits));
const scale = (min, max, amount) => min + (max - min) * amount;
const exponentialScale = (min, max, amount) => min * Math.pow(max / min, amount);
const patternFromLegacyCount = (count) => Number(count) <= 1 ? 'single' : Number(count) === 2 ? 'double' : Number(count) === 3 ? 'triple' : 'repeat';

export const PITCH_CURVE_PRESETS = Object.freeze({
  drops: Object.freeze([
    Object.freeze({ time: 0, value: 0.5 }),
    Object.freeze({ time: 0.25, value: 0.47 }),
    Object.freeze({ time: 0.5, value: 0.34 }),
    Object.freeze({ time: 0.75, value: 0.17 }),
    Object.freeze({ time: 1, value: 0 })
  ]),
  steady: Object.freeze([
    Object.freeze({ time: 0, value: 0.5 }),
    Object.freeze({ time: 0.25, value: 0.5 }),
    Object.freeze({ time: 0.5, value: 0.5 }),
    Object.freeze({ time: 0.75, value: 0.5 }),
    Object.freeze({ time: 1, value: 0.5 })
  ]),
  rises: Object.freeze([
    Object.freeze({ time: 0, value: 0.5 }),
    Object.freeze({ time: 0.25, value: 0.53 }),
    Object.freeze({ time: 0.5, value: 0.66 }),
    Object.freeze({ time: 0.75, value: 0.83 }),
    Object.freeze({ time: 1, value: 1 })
  ])
});

export function pitchCurveForPreset(pitchChange = 'steady') {
  const preset = PITCH_CURVE_PRESETS[pitchChange] || PITCH_CURVE_PRESETS.steady;
  return preset.map(({ time, value }) => ({ time, value }));
}

export function normalizePitchCurve(input, pitchChange = 'steady') {
  const source = Array.isArray(input) && input.length >= 2 ? input : pitchCurveForPreset(pitchChange);
  const points = source
    .map((point) => ({ time: round(clamp(point?.time, 0, 1)), value: round(clamp(point?.value, 0, 1)) }))
    .filter((point) => Number.isFinite(point.time) && Number.isFinite(point.value))
    .sort((left, right) => left.time - right.time)
    .slice(0, 8);
  if (points.length < 2) return pitchCurveForPreset(pitchChange);
  points[0].time = 0;
  points[points.length - 1].time = 1;
  for (let index = 1; index < points.length - 1; index += 1) {
    const minimum = points[index - 1].time + 0.025;
    const maximum = points[index + 1].time - 0.025;
    points[index].time = round(clamp(points[index].time, minimum, maximum));
  }
  return points;
}

export const SIMPLE_CONTROL_DEFINITIONS = Object.freeze([
  { key: 'tone', label: 'Tone', hint: 'Soft and rounded to sharp and buzzy.', min: 0, max: 100, ends: ['Soft', 'Sharp'] },
  { key: 'pitch', label: 'Pitch', hint: 'How high or low the sound feels.', min: 0, max: 100, ends: ['Low', 'High'] },
  { key: 'length', label: 'Length', hint: 'Very short click to longer sustained cue.', min: 0, max: 100, ends: ['Short', 'Long'] },
  { key: 'brightness', label: 'Brightness', hint: 'Dark and muffled to crisp and bright.', min: 0, max: 100, ends: ['Dark', 'Bright'] },
  { key: 'static', label: 'Noise', hint: 'Clean oscillator to rough/noise texture.', min: 0, max: 100, ends: ['Clean', 'Rough'] },
  { key: 'echo', label: 'Echo', hint: 'Dry cue to echoing/shimmering tail.', min: 0, max: 100, ends: ['Dry', 'Echoing'] },
  { key: 'wobble', label: 'Wobble', hint: 'Stable tone to warbling pitch movement.', min: 0, max: 100, ends: ['Stable', 'Warbling'] },
  { key: 'impact', label: 'Impact', hint: 'Gentle accent to punchy transient.', min: 0, max: 100, ends: ['Gentle', 'Punchy'] }
]);

export const ADVANCED_CONTROL_DEFINITIONS = Object.freeze([
  { key: 'pace', label: 'Repeat Pace', hint: 'How quickly repeated steps follow each other.', min: 0, max: 100, ends: ['Slow', 'Fast'] },
  { key: 'volume', label: 'Preview Volume', hint: 'Capped for safe editor playback.', min: 0, max: 100, ends: ['Quiet', 'Loud'] }
]);

export const CONTROL_DEFINITIONS = Object.freeze([...SIMPLE_CONTROL_DEFINITIONS, ...ADVANCED_CONTROL_DEFINITIONS]);

export const DEFAULT_CONTROLS = Object.freeze({
  name: 'New Sound', category: 'sfx', tags: '', tone: 20, pitch: 50, pitchChange: 'steady',
  pitchCurve: PITCH_CURVE_PRESETS.steady, brightness: 55, length: 25, static: 0, echo: 10, wobble: 0,
  impact: 45, pattern: 'single', pace: 62, volume: 50, loop: false
});

export function normalizeControls(input = {}) {
  const legacyTone = input.tone ?? input.texture ?? DEFAULT_CONTROLS.tone;
  const legacyStatic = input.static ?? input.noise ?? Math.max(0, Number(legacyTone) - 52);
  const pitchChange = ['drops', 'steady', 'rises', 'custom'].includes(input.pitchChange) ? input.pitchChange : 'steady';
  return {
    ...DEFAULT_CONTROLS,
    name: String(input.name || DEFAULT_CONTROLS.name).trim().slice(0, 80) || DEFAULT_CONTROLS.name,
    category: String(input.category || DEFAULT_CONTROLS.category).trim().slice(0, 50) || DEFAULT_CONTROLS.category,
    tags: String(input.tags || '').trim().slice(0, 180),
    tone: integer(legacyTone, 0, 100),
    pitch: integer(input.pitch ?? DEFAULT_CONTROLS.pitch, 0, 100),
    pitchChange,
    pitchCurve: normalizePitchCurve(input.pitchCurve, pitchChange),
    brightness: integer(input.brightness ?? DEFAULT_CONTROLS.brightness, 0, 100),
    length: integer(input.length ?? DEFAULT_CONTROLS.length, 0, 100),
    static: integer(legacyStatic, 0, 100),
    echo: integer(input.echo ?? DEFAULT_CONTROLS.echo, 0, 100),
    wobble: integer(input.wobble ?? DEFAULT_CONTROLS.wobble, 0, 100),
    impact: integer(input.impact ?? DEFAULT_CONTROLS.impact, 0, 100),
    pattern: ['single', 'double', 'triple', 'repeat'].includes(input.pattern) ? input.pattern : patternFromLegacyCount(input.repetitions || 1),
    pace: integer(input.pace ?? (100 - Number(input.gap ?? 38)), 0, 100),
    volume: integer(input.volume ?? DEFAULT_CONTROLS.volume, 0, 100),
    loop: Boolean(input.loop)
  };
}

export function controlsToRecipe(rawControls = {}) {
  const controls = normalizeControls(rawControls);
  const baseFrequencyHz = exponentialScale(55, 1760, controls.pitch / 100);
  const pitchTravel = scale(0.12, 0.64, controls.tone / 100);
  const durationMs = Math.round(exponentialScale(55, 2400, controls.length / 100));
  const attackMs = Math.round(scale(62, 2, Math.max(controls.tone, controls.impact) / 100));
  const releaseMs = Math.min(Math.round(scale(190, 22, controls.impact / 100)), Math.round(durationMs * 0.5));
  const waveform = controls.tone > 82 ? 'square' : controls.tone > 56 ? 'sawtooth' : controls.tone > 26 ? 'triangle' : 'sine';
  const outputGain = round(scale(0, 0.26, controls.volume / 100) * scale(0.72, 1.12, controls.impact / 100));
  const repeatCounts = { single: 1, double: 2, triple: 3, repeat: 4 };
  const frequencyCurve = controls.pitchCurve.map(({ time, value }) => ({
    time,
    frequencyHz: Math.round(baseFrequencyHz * scale(1 - pitchTravel, 1 + pitchTravel, value))
  }));

  return {
    masterGain: outputGain,
    durationMs,
    tone: {
      waveform,
      startFrequencyHz: frequencyCurve[0].frequencyHz,
      endFrequencyHz: frequencyCurve[frequencyCurve.length - 1].frequencyHz,
      frequencyCurve,
      attackMs,
      releaseMs
    },
    filter: {
      type: 'lowpass',
      frequencyHz: Math.round(exponentialScale(210, 12000, controls.brightness / 100)),
      resonance: round(scale(0.35, 8, controls.brightness / 100))
    },
    noise: {
      enabled: controls.static > 0,
      level: round(scale(0, 0.62, controls.static / 100) * scale(0.78, 1.18, controls.impact / 100))
    },
    modulation: {
      rateHz: round(scale(0.5, 14, controls.wobble / 100)),
      depthHz: Math.round(baseFrequencyHz * scale(0, 0.18, controls.wobble / 100))
    },
    echo: {
      enabled: controls.echo > 0,
      delayMs: Math.round(scale(45, 285, controls.echo / 100)),
      feedback: round(scale(0, 0.42, controls.echo / 100)),
      mix: round(scale(0, 0.44, controls.echo / 100))
    },
    impact: {
      transient: round(scale(0.05, 0.95, controls.impact / 100)),
      punch: round(scale(0.75, 1.28, controls.impact / 100))
    },
    pattern: {
      mode: controls.pattern,
      steps: repeatCounts[controls.pattern],
      paceMs: Math.round(scale(520, 30, controls.pace / 100)),
      loop: controls.loop
    },
    safety: { previewGainCap: 0.26 }
  };
}

function jitter(value, span) {
  return integer(Number(value) + (Math.random() * span * 2 - span), 0, 100);
}

export function randomVariation(rawControls) {
  const controls = normalizeControls(rawControls);
  return normalizeControls({
    ...controls,
    tone: jitter(controls.tone, 10),
    pitch: jitter(controls.pitch, 9),
    brightness: jitter(controls.brightness, 11),
    length: jitter(controls.length, 8),
    static: jitter(controls.static, 10),
    echo: jitter(controls.echo, 10),
    wobble: jitter(controls.wobble, 12),
    impact: jitter(controls.impact, 10),
    pace: jitter(controls.pace, 10),
    volume: controls.volume
  });
}

export function randomSound(rawControls = DEFAULT_CONTROLS) {
  const anchor = normalizeControls(rawControls);
  const pitchChanges = ['drops', 'steady', 'rises'];
  const patterns = ['single', 'double', 'triple', 'repeat'];
  return normalizeControls({
    ...anchor,
    name: `Random ${anchor.category}`,
    tone: integer(Math.random() * 100, 0, 100),
    pitch: integer(Math.random() * 100, 0, 100),
    pitchChange: pitchChanges[Math.floor(Math.random() * pitchChanges.length)],
    pitchCurve: undefined,
    brightness: integer(Math.random() * 100, 0, 100),
    length: integer(Math.random() * 78 + 8, 0, 100),
    static: integer(Math.random() * 72, 0, 100),
    echo: integer(Math.random() * 58, 0, 100),
    wobble: integer(Math.random() * 72, 0, 100),
    impact: integer(Math.random() * 100, 0, 100),
    pattern: patterns[Math.floor(Math.random() * patterns.length)],
    pace: integer(Math.random() * 82 + 10, 0, 100),
    loop: false
  });
}
