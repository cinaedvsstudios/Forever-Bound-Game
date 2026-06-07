const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value)));
const integer = (value, min, max) => Math.round(clamp(value, min, max));
const round = (value, digits = 3) => Number(Number(value).toFixed(digits));
const scale = (min, max, amount) => min + (max - min) * amount;
const exponentialScale = (min, max, amount) => min * Math.pow(max / min, amount);
const patternFromLegacyCount = (count) => Number(count) <= 1 ? 'single' : Number(count) === 2 ? 'double' : Number(count) === 3 ? 'triple' : 'repeat';
const signed = (value) => (Number(value) - 50) / 50;

export const WAVEFORMS = Object.freeze([
  Object.freeze({ id: 'square', label: 'Square' }),
  Object.freeze({ id: 'sawtooth', label: 'Sawtooth' }),
  Object.freeze({ id: 'sine', label: 'Sine' }),
  Object.freeze({ id: 'noise', label: 'Noise' })
]);

export const CONTROL_DEFINITIONS = Object.freeze([
  { key: 'tone', label: 'Tone', hint: 'Soft and rounded to sharp and buzzy.', min: 0, max: 100, ends: ['Soft', 'Harsh'] },
  { key: 'pitch', label: 'Pitch', hint: 'How high or low the sound feels.', min: 0, max: 100, ends: ['Low', 'High'] },
  { key: 'length', label: 'Length', hint: 'Very short click to longer sustained cue.', min: 0, max: 100, ends: ['Short', 'Long'] },
  { key: 'brightness', label: 'Brightness', hint: 'Dark and muffled to crisp and sharp.', min: 0, max: 100, ends: ['Muffled', 'Sharp'] },
  { key: 'static', label: 'Noise', hint: 'Adds generated noise texture.', min: 0, max: 100, ends: ['Clean', 'Noisy'] },
  { key: 'echo', label: 'Echo', hint: 'Adds a trailing space or shimmer.', min: 0, max: 100, ends: ['Dry', 'Spacious'] },
  { key: 'wobble', label: 'Wobble', hint: 'Adds pulsing or mechanical instability.', min: 0, max: 100, ends: ['Still', 'Warbling'] },
  { key: 'impact', label: 'Impact', hint: 'Extra attack/transient strength.', min: 0, max: 100, ends: ['Soft', 'Punchy'] },
  { key: 'volume', label: 'Preview Volume', hint: 'Capped for safe editor playback.', min: 0, max: 100, ends: ['Quiet', 'Loud'] }
]);

export const ADVANCED_CONTROL_GROUPS = Object.freeze([
  Object.freeze({
    id: 'envelope',
    label: 'Envelope',
    controls: Object.freeze([
      { key: 'attack', label: 'Attack time', hint: 'How instantly the sound starts.', min: 0, max: 100, ends: ['Snap', 'Fade in'] },
      { key: 'sustain', label: 'Sustain time', hint: 'How long the body holds before decay.', min: 0, max: 100, ends: ['Tiny', 'Held'] },
      { key: 'sustainPunch', label: 'Sustain punch', hint: 'Extra push at the start of the sustain body.', min: 0, max: 100, ends: ['Flat', 'Punchy'] },
      { key: 'decay', label: 'Decay time', hint: 'How quickly the tail falls away.', min: 0, max: 100, ends: ['Tight', 'Long'] }
    ])
  }),
  Object.freeze({
    id: 'frequency',
    label: 'Frequency',
    controls: Object.freeze([
      { key: 'slide', label: 'Slide', hint: 'Continuous pitch movement over the sound.', min: 0, max: 100, ends: ['Down', 'Up'] },
      { key: 'deltaSlide', label: 'Delta slide', hint: 'Curves the pitch movement so it bends over time.', min: 0, max: 100, ends: ['Falls', 'Bends up'] }
    ])
  }),
  Object.freeze({
    id: 'vibrato',
    label: 'Vibrato',
    controls: Object.freeze([
      { key: 'vibratoDepth', label: 'Depth', hint: 'How much the pitch wobbles.', min: 0, max: 100, ends: ['Off', 'Deep'] },
      { key: 'vibratoSpeed', label: 'Speed', hint: 'How fast the pitch wobble moves.', min: 0, max: 100, ends: ['Slow', 'Fast'] }
    ])
  }),
  Object.freeze({
    id: 'arpeggiation',
    label: 'Arpeggiation',
    controls: Object.freeze([
      { key: 'arpMult', label: 'Frequency mult', hint: 'A quick second pitch jump, useful for pickups and UI chimes.', min: 0, max: 100, ends: ['Off', 'Jump'] },
      { key: 'arpSpeed', label: 'Change speed', hint: 'How soon the pitch jump happens.', min: 0, max: 100, ends: ['Late', 'Early'] }
    ])
  }),
  Object.freeze({
    id: 'duty',
    label: 'Duty Cycle',
    controls: Object.freeze([
      { key: 'duty', label: 'Duty cycle', hint: 'Pulse-width feel for square-wave sounds.', min: 0, max: 100, ends: ['Thin', 'Wide'] },
      { key: 'dutySweep', label: 'Sweep', hint: 'Movement in the pulse width over time.', min: 0, max: 100, ends: ['Narrow', 'Wide'] }
    ])
  }),
  Object.freeze({
    id: 'retrigger',
    label: 'Retrigger',
    controls: Object.freeze([
      { key: 'retriggerRate', label: 'Rate', hint: 'Rapid re-triggering for rattles, crackles and alarms.', min: 0, max: 100, ends: ['Off', 'Fast'] }
    ])
  }),
  Object.freeze({
    id: 'flanger',
    label: 'Flanger',
    controls: Object.freeze([
      { key: 'flangerOffset', label: 'Offset', hint: 'Hollow comb-filter character for metallic and portal sounds.', min: 0, max: 100, ends: ['Off', 'Deep'] },
      { key: 'flangerSweep', label: 'Sweep', hint: 'How much the flanger moves over time.', min: 0, max: 100, ends: ['Still', 'Moving'] }
    ])
  }),
  Object.freeze({
    id: 'lowpass',
    label: 'Low-Pass Filter',
    controls: Object.freeze([
      { key: 'lpfCutoff', label: 'Cutoff frequency', hint: 'Darker/muffled to open/bright.', min: 0, max: 100, ends: ['Muffled', 'Open'] },
      { key: 'lpfSweep', label: 'Cutoff sweep', hint: 'Moves the low-pass filter over time.', min: 0, max: 100, ends: ['Closes', 'Opens'] },
      { key: 'lpfResonance', label: 'Resonance', hint: 'Whistling/peaky edge on the filter.', min: 0, max: 100, ends: ['Flat', 'Peaky'] }
    ])
  }),
  Object.freeze({
    id: 'highpass',
    label: 'High-Pass Filter',
    controls: Object.freeze([
      { key: 'hpfCutoff', label: 'Cutoff frequency', hint: 'Removes low rumble and body.', min: 0, max: 100, ends: ['Full', 'Thin'] },
      { key: 'hpfSweep', label: 'Cutoff sweep', hint: 'Moves the high-pass filter over time.', min: 0, max: 100, ends: ['Drops', 'Rises'] }
    ])
  }),
  Object.freeze({
    id: 'output',
    label: 'Output',
    controls: Object.freeze([
      { key: 'pace', label: 'Repeat Pace', hint: 'How quickly repeated steps follow each other.', min: 0, max: 100, ends: ['Slow', 'Fast'] }
    ])
  })
]);

export const ADVANCED_CONTROL_DEFINITIONS = Object.freeze(ADVANCED_CONTROL_GROUPS.flatMap((group) => group.controls));

function normalizeFrequencyCurve(input) {
  if (!Array.isArray(input)) return null;
  const curve = input
    .map((point) => ({
      time: Math.max(0, Math.min(1, Number(point?.time ?? 0))),
      value: Math.max(0, Math.min(1, Number(point?.value ?? point?.ratio ?? 0.5)))
    }))
    .filter((point) => Number.isFinite(point.time) && Number.isFinite(point.value))
    .sort((left, right) => left.time - right.time);
  if (curve.length < 2) return null;
  curve[0].time = 0;
  curve[curve.length - 1].time = 1;
  return curve.map((point) => ({ time: round(point.time, 3), value: round(point.value, 3) }));
}

export const DEFAULT_CONTROLS = Object.freeze({
  name: 'New Sound',
  category: 'custom',
  tags: '',
  soundTypeId: 'custom',
  waveform: 'sine',
  tone: 20,
  pitch: 50,
  pitchChange: 'steady',
  brightness: 55,
  length: 25,
  static: 0,
  echo: 10,
  wobble: 0,
  impact: 45,
  attack: 0,
  sustain: 18,
  sustainPunch: 0,
  decay: 32,
  slide: 50,
  deltaSlide: 50,
  vibratoDepth: 0,
  vibratoSpeed: 35,
  arpMult: 0,
  arpSpeed: 55,
  duty: 50,
  dutySweep: 50,
  retriggerRate: 0,
  flangerOffset: 0,
  flangerSweep: 50,
  lpfCutoff: 82,
  lpfSweep: 50,
  lpfResonance: 28,
  hpfCutoff: 0,
  hpfSweep: 50,
  pattern: 'single',
  pace: 62,
  volume: 50,
  loop: false,
  frequencyCurve: null
});

export function normalizeControls(input = {}) {
  const legacyTone = input.tone ?? input.texture ?? DEFAULT_CONTROLS.tone;
  const legacyStatic = input.static ?? Math.max(0, Number(legacyTone) - 52);
  const waveform = WAVEFORMS.some((item) => item.id === input.waveform) ? input.waveform : DEFAULT_CONTROLS.waveform;

  return {
    ...DEFAULT_CONTROLS,
    name: String(input.name || DEFAULT_CONTROLS.name).trim().slice(0, 80) || DEFAULT_CONTROLS.name,
    category: String(input.category || DEFAULT_CONTROLS.category).trim().slice(0, 50) || DEFAULT_CONTROLS.category,
    tags: String(input.tags || '').trim().slice(0, 180),
    soundTypeId: String(input.soundTypeId || DEFAULT_CONTROLS.soundTypeId).trim().slice(0, 80) || DEFAULT_CONTROLS.soundTypeId,
    waveform,
    tone: integer(legacyTone, 0, 100),
    pitch: integer(input.pitch ?? DEFAULT_CONTROLS.pitch, 0, 100),
    pitchChange: ['drops', 'steady', 'rises', 'custom'].includes(input.pitchChange) ? input.pitchChange : 'steady',
    brightness: integer(input.brightness ?? DEFAULT_CONTROLS.brightness, 0, 100),
    length: integer(input.length ?? DEFAULT_CONTROLS.length, 0, 100),
    static: integer(legacyStatic, 0, 100),
    echo: integer(input.echo ?? DEFAULT_CONTROLS.echo, 0, 100),
    wobble: integer(input.wobble ?? DEFAULT_CONTROLS.wobble, 0, 100),
    impact: integer(input.impact ?? DEFAULT_CONTROLS.impact, 0, 100),
    attack: integer(input.attack ?? DEFAULT_CONTROLS.attack, 0, 100),
    sustain: integer(input.sustain ?? DEFAULT_CONTROLS.sustain, 0, 100),
    sustainPunch: integer(input.sustainPunch ?? DEFAULT_CONTROLS.sustainPunch, 0, 100),
    decay: integer(input.decay ?? DEFAULT_CONTROLS.decay, 0, 100),
    slide: integer(input.slide ?? DEFAULT_CONTROLS.slide, 0, 100),
    deltaSlide: integer(input.deltaSlide ?? DEFAULT_CONTROLS.deltaSlide, 0, 100),
    vibratoDepth: integer(input.vibratoDepth ?? input.wobble ?? DEFAULT_CONTROLS.vibratoDepth, 0, 100),
    vibratoSpeed: integer(input.vibratoSpeed ?? DEFAULT_CONTROLS.vibratoSpeed, 0, 100),
    arpMult: integer(input.arpMult ?? DEFAULT_CONTROLS.arpMult, 0, 100),
    arpSpeed: integer(input.arpSpeed ?? DEFAULT_CONTROLS.arpSpeed, 0, 100),
    duty: integer(input.duty ?? DEFAULT_CONTROLS.duty, 0, 100),
    dutySweep: integer(input.dutySweep ?? DEFAULT_CONTROLS.dutySweep, 0, 100),
    retriggerRate: integer(input.retriggerRate ?? DEFAULT_CONTROLS.retriggerRate, 0, 100),
    flangerOffset: integer(input.flangerOffset ?? DEFAULT_CONTROLS.flangerOffset, 0, 100),
    flangerSweep: integer(input.flangerSweep ?? DEFAULT_CONTROLS.flangerSweep, 0, 100),
    lpfCutoff: integer(input.lpfCutoff ?? input.brightness ?? DEFAULT_CONTROLS.lpfCutoff, 0, 100),
    lpfSweep: integer(input.lpfSweep ?? DEFAULT_CONTROLS.lpfSweep, 0, 100),
    lpfResonance: integer(input.lpfResonance ?? DEFAULT_CONTROLS.lpfResonance, 0, 100),
    hpfCutoff: integer(input.hpfCutoff ?? DEFAULT_CONTROLS.hpfCutoff, 0, 100),
    hpfSweep: integer(input.hpfSweep ?? DEFAULT_CONTROLS.hpfSweep, 0, 100),
    pattern: ['single', 'double', 'triple', 'repeat'].includes(input.pattern) ? input.pattern : patternFromLegacyCount(input.repetitions || 1),
    pace: integer(input.pace ?? (100 - Number(input.gap ?? 38)), 0, 100),
    volume: integer(input.volume ?? DEFAULT_CONTROLS.volume, 0, 100),
    loop: Boolean(input.loop),
    frequencyCurve: normalizeFrequencyCurve(input.frequencyCurve)
  };
}

function makePitchCurve(controls, baseFrequencyHz, pitchTravel) {
  if (Array.isArray(controls.frequencyCurve) && controls.frequencyCurve.length >= 2) {
    return controls.frequencyCurve.map((point) => ({
      time: Math.max(0, Math.min(1, Number(point.time))),
      frequencyHz: Math.max(25, Math.round(baseFrequencyHz * scale(1 - pitchTravel, 1 + pitchTravel, Number(point.value))))
    }));
  }
  const direction = controls.pitchChange === 'drops' ? -1 : controls.pitchChange === 'rises' ? 1 : 0;
  const slide = signed(controls.slide);
  const deltaSlide = signed(controls.deltaSlide);
  const points = [0, 0.25, 0.5, 0.75, 1];
  return points.map((time) => {
    const directionFactor = 1 + direction * pitchTravel * time;
    const slideFactor = 1 + slide * 0.82 * time + deltaSlide * 0.38 * time * time;
    const frequencyHz = Math.max(25, Math.round(baseFrequencyHz * Math.max(0.16, directionFactor * slideFactor)));
    return { time, frequencyHz };
  });
}

function makeLayer(kind, offsetMs, durationMs, gain, extra = {}) {
  return {
    kind,
    offsetMs: Math.round(offsetMs),
    durationMs: Math.max(10, Math.round(durationMs)),
    gain: round(gain),
    ...extra
  };
}

function profileLayersFor(controls, baseFrequencyHz, pitchTravel) {
  const short = scale(38, 220, controls.length / 100);
  const medium = scale(110, 520, controls.length / 100);
  const long = scale(260, 1600, controls.length / 100);
  const brightGain = scale(0.04, 0.22, controls.brightness / 100);
  const roughGain = scale(0.02, 0.34, Math.max(controls.static, controls.tone - 45) / 100);
  const punchGain = scale(0.035, 0.24, controls.impact / 100);
  const id = `${controls.soundTypeId || ''} ${controls.name || ''}`.toLowerCase();
  const layers = [];
  const pitchCurve = makePitchCurve(controls, baseFrequencyHz, pitchTravel);
  const frequencyAt = (time, multiplier = 1) => {
    const t = Math.max(0, Math.min(1, Number(time)));
    let previous = pitchCurve[0];
    for (let index = 1; index < pitchCurve.length; index += 1) {
      const next = pitchCurve[index];
      if (t <= next.time) {
        const span = Math.max(0.0001, next.time - previous.time);
        const amount = Math.max(0, Math.min(1, (t - previous.time) / span));
        return Math.max(25, scale(previous.frequencyHz, next.frequencyHz, amount) * multiplier);
      }
      previous = next;
    }
    return Math.max(25, previous.frequencyHz * multiplier);
  };

  const click = (offset = 0, gain = punchGain) => layers.push(makeLayer('click', offset, 20, gain, { frequencyHz: frequencyAt(0, 2.8) }));
  const sparkle = (offset = 20, pitch = 1.8, gain = brightGain) => {
    const startTime = Math.max(0, Math.min(1, offset / Math.max(1, long)));
    const endTime = Math.max(startTime, Math.min(1, startTime + 0.32));
    layers.push(makeLayer('tone', offset, short, gain, { waveform: 'sine', startFrequencyHz: frequencyAt(startTime, pitch), endFrequencyHz: frequencyAt(endTime, pitch * 1.45), filterHz: 10000 }));
  };
  const thud = (offset = 0, gain = punchGain) => layers.push(makeLayer('thud', offset, scale(70, 260, controls.decay / 100), gain, { startFrequencyHz: frequencyAt(0, 0.6), endFrequencyHz: frequencyAt(1, 0.18) }));
  const buzz = (offset = 22, gain = roughGain) => layers.push(makeLayer('buzz', offset, medium, gain, { frequencyHz: frequencyAt(0.5, 0.75), wobble: controls.vibratoDepth }));
  const rattle = (offset = 36, gain = roughGain) => layers.push(makeLayer('rattle', offset, scale(90, 340, controls.retriggerRate / 100), gain, { rate: scale(16, 62, controls.retriggerRate / 100), frequencyHz: frequencyAt(0.25, 2.2) }));
  const noise = (offset = 0, gain = roughGain, duration = medium) => layers.push(makeLayer('noise', offset, duration, gain, { filterHz: scale(700, 9500, controls.brightness / 100) }));
  const sweep = (offset = 0, gain = brightGain, dir = 1) => layers.push(makeLayer('tone', offset, long, gain, { waveform: controls.waveform === 'noise' ? 'sawtooth' : controls.waveform, startFrequencyHz: frequencyAt(0, dir >= 0 ? 0.65 : 1.8), endFrequencyHz: frequencyAt(1, dir >= 0 ? 2.2 : 0.45), filterHz: scale(1200, 11000, controls.lpfCutoff / 100) }));

  if (id.includes('pickup') || id.includes('coin') || id.includes('reward')) {
    click(0, punchGain * 0.85);
    sparkle(18, 2.15, brightGain * 1.3);
    sparkle(74, 2.85, brightGain * 0.85);
  } else if (id.includes('locked') || id.includes('lock')) {
    thud(0, punchGain * 1.2);
    rattle(34, Math.max(0.05, roughGain * 1.25));
    buzz(76, Math.max(0.04, roughGain * 0.75));
  } else if (id.includes('door') || id.includes('chest')) {
    thud(0, punchGain * 0.78);
    noise(28, roughGain * 0.65, long);
    sweep(58, brightGain * 0.45, -1);
  } else if (id.includes('unlock') || id.includes('mechanism') || id.includes('lever')) {
    click(0, punchGain * 1.2);
    rattle(26, roughGain * 0.7);
    sparkle(85, 1.45, brightGain * 0.55);
  } else if (id.includes('footstep') || id.includes('land') || id.includes('drop') || id.includes('thump')) {
    thud(0, punchGain * 1.25);
    noise(8, roughGain * 0.55, short);
  } else if (id.includes('explosion') || id.includes('impact') || id.includes('hit')) {
    thud(0, punchGain * 1.55);
    noise(0, Math.max(0.16, roughGain * 1.4), long);
    rattle(48, roughGain * 0.6);
  } else if (id.includes('magic') || id.includes('spell') || id.includes('portal') || id.includes('healing') || id.includes('spark')) {
    sweep(0, brightGain * 0.9, id.includes('flicker') || id.includes('loop') ? 0 : 1);
    sparkle(46, 2.2, brightGain * 0.75);
    layers.push(makeLayer('shimmer', 0, long, brightGain * 0.62, { rate: scale(6, 34, controls.vibratoSpeed / 100), depth: controls.vibratoDepth }));
  } else if (id.includes('complete') || id.includes('correct') || id.includes('confirm')) {
    click(0, punchGain * 0.65);
    sparkle(20, 1.55, brightGain);
    sparkle(112, 2.05, brightGain * 0.75);
  } else if (id.includes('wrong') || id.includes('cancel') || id.includes('refuse')) {
    buzz(0, Math.max(0.08, roughGain));
    thud(20, punchGain * 0.5);
  } else if (id.includes('warning') || id.includes('timer') || id.includes('pulse')) {
    click(0, punchGain);
    buzz(38, roughGain);
  } else if (id.includes('hum') || id.includes('wind')) {
    buzz(0, Math.max(0.055, roughGain * 0.7));
    noise(0, roughGain * 0.35, long);
  } else {
    click(0, punchGain * 0.65);
    sparkle(28, 1.4, brightGain * 0.55);
  }

  return layers.filter((layer) => Number(layer.gain) > 0.006);
}

export function controlsToRecipe(rawControls = {}) {
  const controls = normalizeControls(rawControls);
  const baseFrequencyHz = exponentialScale(55, 1760, controls.pitch / 100);
  const pitchTravel = scale(0.08, 0.78, controls.tone / 100);
  const durationMs = Math.round(exponentialScale(45, 2600, controls.length / 100));
  const attackMs = Math.round(scale(0.4, 180, controls.attack / 100));
  const sustainMs = Math.round(scale(3, 620, controls.sustain / 100));
  const releaseMs = Math.min(Math.round(scale(18, 880, controls.decay / 100)), Math.round(durationMs * 0.86));
  const waveform = controls.waveform === 'noise' ? 'sawtooth' : controls.waveform;
  const outputGain = round(scale(0, 0.26, controls.volume / 100) * scale(0.78, 1.18, controls.impact / 100));
  const repeatCounts = { single: 1, double: 2, triple: 3, repeat: 4 };
  const frequencyCurve = makePitchCurve(controls, baseFrequencyHz, pitchTravel);

  return {
    masterGain: outputGain,
    durationMs,
    tone: {
      waveform,
      sourceWaveform: controls.waveform,
      startFrequencyHz: frequencyCurve[0].frequencyHz,
      endFrequencyHz: frequencyCurve[frequencyCurve.length - 1].frequencyHz,
      frequencyCurve,
      attackMs,
      sustainMs,
      sustainPunch: round(scale(0, 0.9, controls.sustainPunch / 100)),
      releaseMs,
      duty: round(scale(0.05, 0.95, controls.duty / 100)),
      dutySweep: round(signed(controls.dutySweep))
    },
    filter: {
      type: 'lowpass',
      frequencyHz: Math.round(exponentialScale(120, 14000, controls.lpfCutoff / 100)),
      sweep: round(signed(controls.lpfSweep)),
      resonance: round(scale(0.2, 14, controls.lpfResonance / 100)),
      highpassHz: Math.round(exponentialScale(18, 4800, controls.hpfCutoff / 100)),
      highpassSweep: round(signed(controls.hpfSweep))
    },
    noise: {
      enabled: controls.static > 0 || controls.waveform === 'noise',
      level: round(scale(0, 0.62, Math.max(controls.static, controls.waveform === 'noise' ? 70 : 0) / 100) * scale(0.78, 1.18, controls.impact / 100))
    },
    modulation: {
      rateHz: round(scale(0.2, 24, controls.vibratoSpeed / 100)),
      depthHz: Math.round(baseFrequencyHz * scale(0, 0.26, Math.max(controls.wobble, controls.vibratoDepth) / 100))
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
    arpeggiation: {
      multiplier: round(scale(1, 3.4, controls.arpMult / 100)),
      changeAtMs: Math.round(scale(durationMs * 0.82, 8, controls.arpSpeed / 100))
    },
    retrigger: {
      rateHz: round(scale(0, 42, controls.retriggerRate / 100))
    },
    flanger: {
      offsetMs: round(scale(0, 12, controls.flangerOffset / 100)),
      sweep: round(signed(controls.flangerSweep))
    },
    layers: profileLayersFor(controls, baseFrequencyHz, pitchTravel),
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
    attack: jitter(controls.attack, 10),
    sustain: jitter(controls.sustain, 10),
    sustainPunch: jitter(controls.sustainPunch, 12),
    decay: jitter(controls.decay, 12),
    slide: jitter(controls.slide, 12),
    deltaSlide: jitter(controls.deltaSlide, 12),
    vibratoDepth: jitter(controls.vibratoDepth, 12),
    vibratoSpeed: jitter(controls.vibratoSpeed, 12),
    arpMult: jitter(controls.arpMult, 10),
    arpSpeed: jitter(controls.arpSpeed, 10),
    retriggerRate: jitter(controls.retriggerRate, 12),
    flangerOffset: jitter(controls.flangerOffset, 10),
    lpfCutoff: jitter(controls.lpfCutoff, 10),
    hpfCutoff: jitter(controls.hpfCutoff, 10),
    pace: jitter(controls.pace, 10),
    volume: controls.volume
  });
}

export function randomSound(rawControls = DEFAULT_CONTROLS) {
  const anchor = normalizeControls(rawControls);
  const pitchChanges = ['drops', 'steady', 'rises'];
  const patterns = ['single', 'double', 'triple', 'repeat'];
  const waveforms = ['square', 'sawtooth', 'sine', 'noise'];
  return normalizeControls({
    ...anchor,
    name: `Random ${anchor.category}`,
    waveform: waveforms[Math.floor(Math.random() * waveforms.length)],
    tone: integer(Math.random() * 100, 0, 100),
    pitch: integer(Math.random() * 100, 0, 100),
    pitchChange: pitchChanges[Math.floor(Math.random() * pitchChanges.length)],
    frequencyCurve: null,
    brightness: integer(Math.random() * 100, 0, 100),
    length: integer(Math.random() * 78 + 8, 0, 100),
    static: integer(Math.random() * 72, 0, 100),
    echo: integer(Math.random() * 58, 0, 100),
    wobble: integer(Math.random() * 72, 0, 100),
    impact: integer(Math.random() * 100, 0, 100),
    attack: integer(Math.random() * 35, 0, 100),
    sustain: integer(Math.random() * 70, 0, 100),
    sustainPunch: integer(Math.random() * 70, 0, 100),
    decay: integer(Math.random() * 85, 0, 100),
    slide: integer(Math.random() * 100, 0, 100),
    deltaSlide: integer(Math.random() * 100, 0, 100),
    vibratoDepth: integer(Math.random() * 70, 0, 100),
    vibratoSpeed: integer(Math.random() * 100, 0, 100),
    arpMult: integer(Math.random() * 85, 0, 100),
    arpSpeed: integer(Math.random() * 100, 0, 100),
    duty: integer(Math.random() * 100, 0, 100),
    dutySweep: integer(Math.random() * 100, 0, 100),
    retriggerRate: integer(Math.random() * 70, 0, 100),
    flangerOffset: integer(Math.random() * 70, 0, 100),
    flangerSweep: integer(Math.random() * 100, 0, 100),
    lpfCutoff: integer(Math.random() * 100, 0, 100),
    lpfSweep: integer(Math.random() * 100, 0, 100),
    lpfResonance: integer(Math.random() * 100, 0, 100),
    hpfCutoff: integer(Math.random() * 55, 0, 100),
    hpfSweep: integer(Math.random() * 100, 0, 100),
    pattern: patterns[Math.floor(Math.random() * patterns.length)],
    pace: integer(Math.random() * 82 + 10, 0, 100),
    loop: false
  });
}
