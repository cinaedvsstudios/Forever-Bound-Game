import { ADVANCED_CONTROL_GROUPS, CONTROL_DEFINITIONS, WAVEFORMS, normalizeControls, randomSound, randomVariation } from './sound-generator-controls.js';
import { EXAMPLE_GROUPS, START_FOUNDATIONS, copyPresetControls, firstExamplePreset } from './sound-generator-presets.js';
import { buildProceduralSynthAsset, controlsFromImportedAsset } from './procedural-synth-schema.js';
import { ProceduralSoundRuntime } from './procedural-synth-runtime.js';
import '../project-folder/project-folder-client.js?v=0.1.0';
import { downloadProceduralSynthRecipe, readImportedProceduralSynth, proceduralSynthToJson, saveProceduralSynthToLibrary } from './sound-generator-store.js';

const VERSION = 'V1.10';
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
  link.href = new URL('./sound-generator.css?v=1.10', import.meta.url).href;
  document.head.appendChild(link);
}

function sliderMarkup(definitions) {
  return definitions.map(({ key, label, hint, min, max, ends = [] }) => `<label class="sound-slider" title="${esc(hint)}"><span><b>${esc(label)} <small>${esc(ends[0] || '')}${ends.length ? ' ↔ ' : ''}${esc(ends[1] || '')}</small></b><output data-out="${esc(key)}">0</output></span><input type="range" min="${min}" max="${max}" step="1" data-field="${esc(key)}" /></label>`).join('');
}

function advancedGroupMarkup(group) {
  return `<fieldset class="sound-sfxr-group"><legend>${esc(group.label)}</legend><div class="sound-sfxr-sliders">${sliderMarkup(group.controls)}</div></fieldset>`;
}

function markup(options) {
  const close = options.mode === 'floating' ? '<button class="sound-close" type="button" data-act="close" title="Close">×</button>' : '';
  return `<section class="sound-generator-card" aria-label="Create Synth Sound">
    <header class="sound-header"><div class="sound-brand"><span class="sound-rune">ᚠ</span><div><p class="sound-kicker">ARTIFEX UTILITY</p><h1>Create Synth Sound</h1></div><span class="sound-version">${VERSION}</span></div>${close}</header>
    <div class="sound-source-row"><span>Source</span><strong>${esc(options.sourceLabel || 'Standalone preview')}</strong><span class="sound-state" data-runtime>Ready.</span></div>
    <div class="sound-layout">
      <aside class="sound-library">
        <nav class="sound-mode-tabs"><button class="is-active" data-mode="examples">Use Example</button><button data-mode="new">Start New</button></nav>
        <section data-examples><label class="sound-select-label">Purpose<select data-group></select></label><div class="sound-preset-list" data-example-list></div></section>
        <section data-new hidden><p class="sound-help">Choose a starting shape, then use the SFXR-style controls to tune it.</p><div class="sound-preset-list" data-new-list></div></section>
      </aside>
      <section class="sound-editor">
        <div class="sound-toolbar">
          <button class="primary" data-act="preview">▶️ Preview</button>
          <button data-act="variation">🎲 Variation</button>
          <button data-act="stop">⏹️ Stop</button>
          <button data-act="reset">↺ Reset</button>
        </div>
        <div class="sound-identity"><label>Name<input type="text" maxlength="80" data-field="name" /></label><label>Category<input type="text" maxlength="50" data-field="category" /></label><label class="wide">Tags<input type="text" maxlength="180" data-field="tags" placeholder="puzzle, correct, magical" /></label></div>
        <fieldset class="sound-waveform"><legend>Waveform</legend>${WAVEFORMS.map((wave) => `<button type="button" data-waveform="${esc(wave.id)}">${esc(wave.label)}</button>`).join('')}</fieldset>
        <fieldset class="sound-pitch-change"><legend>Pitch Change</legend><button data-pitch="drops">↘️ Drops</button><button data-pitch="steady">➡️ Steady</button><button data-pitch="rises">↗️ Rises</button></fieldset>
        <div class="sound-control-grid">${sliderMarkup(CONTROL_DEFINITIONS)}</div>
        <details class="sound-advanced" open><summary>⚙️ Advanced SFXR-style controls</summary><div class="sound-advanced-grid">${ADVANCED_CONTROL_GROUPS.map(advancedGroupMarkup).join('')}</div></details>
        <div class="sound-pattern-row"><label>Pattern<select data-field="pattern"><option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option><option value="repeat">Repeat</option></select></label><label class="check"><input type="checkbox" data-field="loop" /> Loop until stopped</label></div>
      </section>
      <aside class="sound-record"><h2>Generated Sound Asset</h2><dl class="sound-record-summary"><div><dt>Asset ID</dt><dd data-id></dd></div><div><dt>Recipe Path</dt><dd data-path></dd></div><div><dt>Kind</dt><dd>procedural-synth</dd></div></dl><label class="sound-json-label">Generated JSON<textarea data-json readonly spellcheck="false"></textarea></label><p class="sound-library-note">Save writes the recipe under <code>assets/audio/sfx/</code> and registers one <code>asset_sfx_</code> entry in <code>assets/asset-index.json</code>.</p></aside>
    </div>
    <footer class="sound-actions"><div class="sound-preview-actions"><button data-act="random">🎰 Random Sound</button><button data-act="export">Export JSON</button><input type="file" accept=".json,application/json" data-file hidden /><button data-act="import">Import JSON</button></div><div class="sound-file-actions"><button data-act="save">💾 Save to Library</button><button class="assign-action" data-act="assign">✅ Save and Assign Here</button></div></footer>
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
  const message = (value, kind = '') => { text('[data-message]', value); $('[data-message]').dataset.kind = kind; };
  const runtime = new ProceduralSoundRuntime(({ message: value }) => text('[data-runtime]', value));

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
    text('[data-id]', state.record.assetId);
    text('[data-path]', state.record.resourcePath);
    $('[data-json]').value = proceduralSynthToJson(state.record);
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
    $('[data-field="pattern"]').value = state.values.pattern;
    $('[data-field="loop"]').checked = state.values.loop;
    $$('[data-pitch]').forEach((button) => button.classList.toggle('is-active', button.dataset.pitch === state.values.pitchChange));
    $$('[data-waveform]').forEach((button) => button.classList.toggle('is-active', button.dataset.waveform === state.values.waveform));
    record();
  }

  function selectPreset(preset, isNew = false) {
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
    const group = EXAMPLE_GROUPS.find((item) => item.id === state.group) || EXAMPLE_GROUPS[0];
    $('[data-group]').innerHTML = EXAMPLE_GROUPS.map((item) => `<option value="${item.id}">${esc(item.label)}</option>`).join('');
    $('[data-group]').value = group.id;
    $('[data-example-list]').innerHTML = group.presets.map((preset) => `<button data-preset="${preset.id}" title="${esc(preset.description)}"><strong>${esc(preset.name)}</strong><small>${esc(preset.description)}</small></button>`).join('');
    $$('[data-example-list] [data-preset]').forEach((button) => {
      button.onclick = () => selectPreset(group.presets.find((preset) => preset.id === button.dataset.preset));
    });
  }

  function foundations() {
    $('[data-new-list]').innerHTML = START_FOUNDATIONS.map((preset) => `<button data-preset="${preset.id}" title="${esc(preset.description)}"><strong>${esc(preset.name)}</strong><small>${esc(preset.description)}</small></button>`).join('');
    $$('[data-new-list] [data-preset]').forEach((button) => {
      button.onclick = () => selectPreset(START_FOUNDATIONS.find((preset) => preset.id === button.dataset.preset), true);
    });
  }

  function switchMode(mode) {
    $$('[data-mode]').forEach((button) => button.classList.toggle('is-active', button.dataset.mode === mode));
    $('[data-examples]').hidden = mode !== 'examples';
    $('[data-new]').hidden = mode !== 'new';
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
  $('[data-group]').onchange = (event) => {
    state.group = event.target.value;
    examples();
    const group = EXAMPLE_GROUPS.find((item) => item.id === state.group) || EXAMPLE_GROUPS[0];
    selectPreset(group.presets[0]);
  };

  ['name', 'category', 'tags'].forEach((key) => {
    $(`[data-field="${key}"]`).oninput = (event) => {
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

  $('[data-field="pattern"]').onchange = (event) => { state.values.pattern = event.target.value; record(); };
  $('[data-field="loop"]').onchange = (event) => { state.values.loop = event.target.checked; record(); };

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

  $('[data-act="preview"]').onclick = async () => {
    try {
      await runtime.play(record());
      message('Previewing current sound.');
    } catch (error) {
      message(error.message || error, 'error');
    }
  };
  $('[data-act="stop"]').onclick = () => { runtime.stop(); message('Preview stopped.'); };
  $('[data-act="random"]').onclick = () => {
    state.values = randomSound(state.baseline);
    state.values.name = `Random ${state.baseline.name}`;
    state.mode = 'random';
    state.id = null;
    state.createdAt = null;
    sync();
    message('Created a random sound.');
  };
  $('[data-act="variation"]').onclick = () => {
    state.values = randomVariation(state.baseline);
    state.values.name = `${state.baseline.name} Variation`;
    state.mode = 'variation';
    state.id = null;
    state.createdAt = null;
    sync();
    message('Created a recognisable variation.');
  };
  $('[data-act="reset"]').onclick = () => {
    state.values = clone(state.baseline);
    state.id = null;
    state.createdAt = null;
    sync();
    message('Restored the selected starting sound.');
  };
  $('[data-act="export"]').onclick = () => {
    const item = record();
    downloadProceduralSynthRecipe(item);
    message(`Exported ${item.resourcePath.split('/').pop()}.`, 'good');
  };
  $('[data-act="import"]').onclick = () => $('[data-file]').click();
  $('[data-file]').onchange = async (event) => {
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

  $('[data-act="save"]').onclick = () => save(false);
  $('[data-act="assign"]').onclick = () => save(true);
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
