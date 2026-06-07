import { ADVANCED_CONTROL_GROUPS, CONTROL_DEFINITIONS, WAVEFORMS, normalizeControls, randomSound, randomVariation } from './sound-generator-controls.js';
import { EXAMPLE_GROUPS, START_FOUNDATIONS, copyPresetControls, firstExamplePreset } from './sound-generator-presets.js';
import { buildProceduralSynthAsset, controlsFromImportedAsset } from './procedural-synth-schema.js';
import { ProceduralSoundRuntime } from './procedural-synth-runtime.js';
import '../project-folder/project-folder-client.js?v=0.1.0';
import { downloadProceduralSynthRecipe, readImportedProceduralSynth, saveProceduralSynthToLibrary } from './sound-generator-store.js';

const VERSION = 'V1.14';
const STYLE_ID = 'artifex-sound-generator-css';
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const clone = (value) => structuredClone(value);
const controls = (preset) => normalizeControls(copyPresetControls(preset));
const allSliderDefinitions = Object.freeze([...CONTROL_DEFINITIONS, ...ADVANCED_CONTROL_GROUPS.flatMap((group) => group.controls)]);

function loadCss() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = new URL('./sound-generator.css?v=1.14', import.meta.url).href;
  document.head.appendChild(link);
}

function sliderMarkup(definitions) {
  return definitions.map(({ key, label, hint, min, max, ends = [] }) => `<label class="sound-slider" title="${esc(hint)}"><span><b>${esc(label)} <small>${esc(ends[0] || '')}${ends.length ? ' ↔ ' : ''}${esc(ends[1] || '')}</small></b><output data-out="${esc(key)}">0</output></span><input type="range" min="${min}" max="${max}" step="1" data-field="${esc(key)}" /></label>`).join('');
}

function advancedGroupMarkup(group) {
  return `<fieldset class="sound-sfxr-group"><legend>${esc(group.label)}</legend><div class="sound-sfxr-sliders">${sliderMarkup(group.controls)}</div></fieldset>`;
}

function frequencyGraphMarkup() {
  return `<section class="sound-frequency-panel" aria-label="Frequency graph">
    <div class="sound-frequency-header"><h3>Frequency graph</h3><output data-frequency-duration>0.00 / 0.00 sec</output></div>
    <svg class="sound-frequency-graph compact" data-frequency-graph viewBox="0 0 620 140" role="img" aria-label="Pitch movement over sound duration">
      <g class="frequency-grid" aria-hidden="true">
        <line x1="42" y1="16" x2="42" y2="104"></line><line x1="176" y1="16" x2="176" y2="104"></line><line x1="310" y1="16" x2="310" y2="104"></line><line x1="444" y1="16" x2="444" y2="104"></line><line x1="578" y1="16" x2="578" y2="104"></line>
        <line x1="42" y1="16" x2="578" y2="16"></line><line x1="42" y1="38" x2="578" y2="38"></line><line x1="42" y1="60" x2="578" y2="60"></line><line x1="42" y1="82" x2="578" y2="82"></line><line x1="42" y1="104" x2="578" y2="104"></line>
      </g>
      <g data-frequency-y-labels></g>
      <polyline class="frequency-curve" data-frequency-curve points="42,60 578,60"></polyline>
      <g data-frequency-points></g>
    </svg>
    <div class="sound-frequency-time-index" data-frequency-time-index></div>
    <div class="sound-frequency-footer">
      <button class="primary inline-preview" type="button" data-act="preview">▶️ Preview</button>
    </div>
  </section>`;
}

function markup(options) {
  const close = options.mode === 'floating' ? '<button class="sound-close" type="button" data-act="close" title="Close">×</button>' : '';
  return `<section class="sound-generator-card" aria-label="Create Synth Sound">
    <header class="sound-header"><div class="sound-brand"><span class="sound-rune">ᚠ</span><div><p class="sound-kicker">ARTIFEX UTILITY</p><h1>Create Synth Sound</h1></div><span class="sound-version">${VERSION}</span></div>${close}</header>
    <div class="sound-source-row"><span>Source</span><strong>${esc(options.sourceLabel || 'Standalone preview')}</strong><span class="sound-state" data-runtime>Ready.</span></div>
    <div class="sound-layout">
      <aside class="sound-library">
        <nav class="sound-mode-tabs"><button class="is-active" data-mode="examples">Use Example</button><button data-mode="new">Start New</button></nav>
        <section data-examples><div class="sound-example-groups" data-example-list></div></section>
        <section data-new hidden><p class="sound-help">Choose a starting shape, then use the SFXR-style controls to tune it.</p><div class="sound-preset-list" data-new-list></div></section>
      </aside>
      <section class="sound-editor">
        <div class="sound-toolbar">
          <button data-act="variation">🎲 Variation</button>
          <button data-act="stop">⏹️ Stop</button>
          <button data-act="reset">↺ Reset</button>
          <button data-act="random">🎰 Random Sound</button>
          <button data-act="export">📤 Export JSON</button>
          <input type="file" accept=".json,application/json" data-file hidden />
          <button data-act="import">📥 Import JSON</button>
          <button data-act="save">💾 Save to Library</button>
          <button class="assign-action" data-act="assign">✅ Save and Assign Here</button>
        </div>
        <div class="sound-identity compact-three"><label>Name<input type="text" maxlength="80" data-field="name" /></label><label>Category<input type="text" maxlength="50" data-field="category" /></label><label>Tags<input type="text" maxlength="180" data-field="tags" placeholder="puzzle, correct, magical" /></label></div>
        <div class="sound-top-controls-row">
          <fieldset class="sound-waveform"><legend>Waveform</legend>${WAVEFORMS.map((wave) => `<button type="button" data-waveform="${esc(wave.id)}">${esc(wave.label)}</button>`).join('')}</fieldset>
          <fieldset class="sound-pitch-change"><legend>Pitch Change</legend><button data-pitch="drops">↘️ Drops</button><button data-pitch="steady">➡️ Steady</button><button data-pitch="rises">↗️ Rises</button></fieldset>
        </div>
        ${frequencyGraphMarkup()}
        <div class="sound-control-grid">${sliderMarkup(CONTROL_DEFINITIONS)}</div>
        <details class="sound-advanced" open><summary>⚙️ Advanced SFXR-style controls</summary><div class="sound-advanced-grid">${ADVANCED_CONTROL_GROUPS.map(advancedGroupMarkup).join('')}</div></details>
        <div class="sound-pattern-row"><label>Pattern<select data-field="pattern"><option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option><option value="repeat">Repeat</option></select></label><label class="check"><input type="checkbox" data-field="loop" /> Loop until stopped</label></div>
      </section>
    </div>
    <p class="sound-message" data-message aria-live="polite"></p>
  </section>`;
}

export function createSoundGeneratorUI(container, options = {}) {
  loadCss();
  const config = { mode: 'standalone', sourceLabel: '', onAssign: null, onClose: null, ...options };
  const first = firstExamplePreset();
  const state = {
    group: EXAMPLE_GROUPS[0].id,
    preset: first.id,
    baseline: controls(first),
    values: controls(first),
    mode: 'example',
    id: null,
    createdAt: null,
    record: null
  };

  container.innerHTML = markup(config);
  const root = container.querySelector('.sound-generator-card');
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  const text = (s, value) => { const node = $(s); if (node) node.textContent = value || ''; };
  const message = (value, kind = '') => { const node = $('[data-message]'); if (node) { node.textContent = value || ''; node.dataset.kind = kind; } };
  const runtime = new ProceduralSoundRuntime(({ message: value }) => text('[data-runtime]', value));

  function renderFrequencyGraph(item) {
    const recipe = item?.recipe || {};
    const tone = recipe.tone || {};
    const durationMs = Math.max(1, Number(recipe.durationMs || 100));
    const rawCurve = Array.isArray(tone.frequencyCurve) && tone.frequencyCurve.length
      ? tone.frequencyCurve
      : [
          { time: 0, frequencyHz: Number(tone.startFrequencyHz || 440) },
          { time: 1, frequencyHz: Number(tone.endFrequencyHz || tone.startFrequencyHz || 440) }
        ];
    const curve = rawCurve
      .map((point) => ({
        time: Math.max(0, Math.min(1, Number(point.time ?? 0))),
        frequencyHz: Math.max(1, Number(point.frequencyHz || 440))
      }))
      .sort((left, right) => left.time - right.time);
    const minFrequency = Math.min(...curve.map((point) => point.frequencyHz));
    const maxFrequency = Math.max(...curve.map((point) => point.frequencyHz));
    const range = Math.max(1, maxFrequency - minFrequency);
    const graphLeft = 42;
    const graphWidth = 536;
    const graphTop = 16;
    const graphHeight = 88;

    const points = curve.map((point) => {
      const x = graphLeft + point.time * graphWidth;
      const y = graphTop + graphHeight - ((point.frequencyHz - minFrequency) / range) * graphHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const line = $('[data-frequency-curve]');
    if (line) line.setAttribute('points', points);
    const pointHost = $('[data-frequency-points]');
    if (pointHost) {
      pointHost.innerHTML = curve.map((point) => {
        const x = graphLeft + point.time * graphWidth;
        const y = graphTop + graphHeight - ((point.frequencyHz - minFrequency) / range) * graphHeight;
        return `<circle class="frequency-point" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5"><title>${Math.round(point.frequencyHz)} Hz at ${(point.time * durationMs / 1000).toFixed(2)} sec</title></circle>`;
      }).join('');
    }

    const yAxis = $('[data-frequency-y-labels]');
    if (yAxis) {
      const ticks = [1, 0.75, 0.5, 0.25, 0];
      yAxis.innerHTML = ticks.map((ratio) => {
        const hz = minFrequency + range * ratio;
        const y = graphTop + graphHeight - (ratio * graphHeight);
        return `<text class="frequency-number" x="6" y="${(y + 4).toFixed(1)}">${Math.round(hz)}</text>`;
      }).join('');
    }

    text('[data-frequency-duration]', `0.00 / ${(durationMs / 1000).toFixed(2)} sec`);
    const index = $('[data-frequency-time-index]');
    if (index) {
      const seconds = durationMs / 1000;
      index.innerHTML = [0, 0.25, 0.5, 0.75, 1].map((ratio) => `<span>${(seconds * ratio).toFixed(2)}s</span>`).join('');
    }
  }

  function record() {
    state.values = normalizeControls(state.values);
    state.record = buildProceduralSynthAsset(state.values, {
      assetId: state.id || undefined,
      createdAt: state.createdAt || undefined,
      creationMode: state.mode,
      presetId: state.preset,
      sourceLabel: config.sourceLabel
    });
    state.createdAt ||= state.record.createdAt;
    renderFrequencyGraph(state.record);
    return state.record;
  }

  function sync() {
    ['name', 'category', 'tags'].forEach((key) => {
      const input = $(`[data-field="${key}"]`);
      if (input) input.value = state.values[key] || '';
    });
    allSliderDefinitions.forEach(({ key }) => {
      const input = $(`[data-field="${key}"]`);
      if (!input) return;
      input.value = state.values[key];
      text(`[data-out="${key}"]`, `${state.values[key]}${key === 'volume' ? '%' : ''}`);
    });
    const pattern = $('[data-field="pattern"]');
    if (pattern) pattern.value = state.values.pattern;
    const loop = $('[data-field="loop"]');
    if (loop) loop.checked = state.values.loop;
    $$('[data-pitch]').forEach((button) => button.classList.toggle('is-active', button.dataset.pitch === state.values.pitchChange));
    $$('[data-waveform]').forEach((button) => button.classList.toggle('is-active', button.dataset.waveform === state.values.waveform));
    record();
  }

  function selectPreset(preset, isNew = false) {
    if (!preset) return;
    runtime.stop(false);
    state.preset = preset.id;
    state.mode = isNew ? 'start-new' : 'example';
    state.id = null;
    state.createdAt = null;
    state.baseline = controls(preset);
    state.values = controls(preset);
    $$('[data-preset]').forEach((button) => button.classList.toggle('is-selected', button.dataset.preset === preset.id));
    sync();
    message(`Loaded ${preset.name}.`);
  }

  function examples() {
    const host = $('[data-example-list]');
    if (!host) return;
    host.innerHTML = EXAMPLE_GROUPS.map((group, index) => `
      <details class="sound-example-group" ${index === 0 ? 'open' : ''}>
        <summary><span class="sound-group-toggle">▸</span><span>${esc(group.label)}</span></summary>
        <div class="sound-preset-list">${group.presets.map((preset) => `<button data-preset="${preset.id}" title="${esc(preset.description)}"><strong>${esc(preset.name)}</strong><small>${esc(preset.description)}</small></button>`).join('')}</div>
      </details>
    `).join('');
    $$('[data-example-list] [data-preset]').forEach((button) => {
      button.onclick = () => {
        const preset = EXAMPLE_GROUPS.flatMap((item) => item.presets).find((entry) => entry.id === button.dataset.preset);
        if (preset) selectPreset(preset);
      };
    });
  }

  function foundations() {
    const host = $('[data-new-list]');
    if (!host) return;
    host.innerHTML = START_FOUNDATIONS.map((preset) => `<button data-preset="${preset.id}" title="${esc(preset.description)}"><strong>${esc(preset.name)}</strong><small>${esc(preset.description)}</small></button>`).join('');
    $$('[data-new-list] [data-preset]').forEach((button) => {
      button.onclick = () => selectPreset(START_FOUNDATIONS.find((preset) => preset.id === button.dataset.preset), true);
    });
  }

  function switchMode(mode) {
    $$('[data-mode]').forEach((button) => button.classList.toggle('is-active', button.dataset.mode === mode));
    const examplesSection = $('[data-examples]');
    const newSection = $('[data-new]');
    if (examplesSection) examplesSection.hidden = mode !== 'examples';
    if (newSection) newSection.hidden = mode !== 'new';
    selectPreset(mode === 'new' ? START_FOUNDATIONS[0] : firstExamplePreset(), mode === 'new');
  }

  async function save(assign) {
    try {
      runtime.stop(false);
      message('Saving to the connected project folder…');
      const saved = await saveProceduralSynthToLibrary(record());
      message(`Saved ${saved.assetId} to the Asset Library.`, 'good');
      if (assign) {
        config.onAssign?.(saved);
        config.onClose?.();
      }
    } catch (error) {
      message(`Save failed: ${error.message || error}`, 'error');
    }
  }

  $$('[data-mode]').forEach((button) => { button.onclick = () => switchMode(button.dataset.mode); });

  ['name', 'category', 'tags'].forEach((key) => {
    const input = $(`[data-field="${key}"]`);
    if (!input) return;
    input.oninput = (event) => {
      state.values[key] = event.target.value;
      if (key === 'name') state.id = null;
      record();
    };
  });

  allSliderDefinitions.forEach(({ key }) => {
    const input = $(`[data-field="${key}"]`);
    if (!input) return;
    input.oninput = (event) => {
      state.values[key] = Number(event.target.value);
      text(`[data-out="${key}"]`, `${state.values[key]}${key === 'volume' ? '%' : ''}`);
      record();
    };
  });

  const pattern = $('[data-field="pattern"]');
  if (pattern) pattern.onchange = (event) => { state.values.pattern = event.target.value; record(); };
  const loop = $('[data-field="loop"]');
  if (loop) loop.onchange = (event) => { state.values.loop = event.target.checked; record(); };

  $$('[data-pitch]').forEach((button) => {
    button.onclick = () => {
      state.values.pitchChange = button.dataset.pitch;
      sync();
    };
  });

  $$('[data-waveform]').forEach((button) => {
    button.onclick = () => {
      state.values.waveform = button.dataset.waveform;
      sync();
    };
  });

  $$('[data-act="preview"]').forEach((button) => {
    button.onclick = async () => {
      try {
        await runtime.play(record());
        message('Previewing current sound.');
      } catch (error) {
        message(error.message || error, 'error');
      }
    };
  });

  $('[data-act="stop"]')?.addEventListener('click', () => { runtime.stop(); message('Preview stopped.'); });
  $('[data-act="random"]')?.addEventListener('click', () => {
    state.values = randomSound(state.baseline);
    state.values.name = `Random ${state.baseline.name}`;
    state.mode = 'random';
    state.id = null;
    state.createdAt = null;
    sync();
    message('Created a random sound.');
  });
  $('[data-act="variation"]')?.addEventListener('click', () => {
    state.values = randomVariation(state.baseline);
    state.values.name = `${state.baseline.name} Variation`;
    state.mode = 'variation';
    state.id = null;
    state.createdAt = null;
    sync();
    message('Created a recognisable variation.');
  });
  $('[data-act="reset"]')?.addEventListener('click', () => {
    state.values = clone(state.baseline);
    state.id = null;
    state.createdAt = null;
    sync();
    message('Restored the selected starting sound.');
  });
  $('[data-act="export"]')?.addEventListener('click', () => {
    const item = record();
    downloadProceduralSynthRecipe(item);
    message(`Exported ${item.resourcePath.split('/').pop()}.`, 'good');
  });
  $('[data-act="import"]')?.addEventListener('click', () => $('[data-file]')?.click());
  const fileInput = $('[data-file]');
  if (fileInput) {
    fileInput.onchange = async (event) => {
      try {
        const item = await readImportedProceduralSynth(event.target.files[0]);
        state.values = controlsFromImportedAsset(item);
        state.baseline = clone(state.values);
        state.id = item.assetId;
        state.createdAt = item.createdAt;
        state.mode = 'imported';
        sync();
        message(`Imported ${item.assetId}.`, 'good');
      } catch (error) {
        message(error.message || error, 'error');
      }
      event.target.value = '';
    };
  }

  $('[data-act="save"]')?.addEventListener('click', () => save(false));
  $('[data-act="assign"]')?.addEventListener('click', () => save(true));
  $('[data-act="close"]')?.addEventListener('click', () => config.onClose?.());

  examples();
  foundations();
  selectPreset(first, false);

  return {
    getRecord: () => clone(record()),
    stop: () => runtime.stop(),
    destroy: () => {
      runtime.destroy();
      container.innerHTML = '';
    }
  };
}
