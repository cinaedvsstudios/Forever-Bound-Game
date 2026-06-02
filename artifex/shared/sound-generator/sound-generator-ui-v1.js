import { ADVANCED_CONTROL_DEFINITIONS, SIMPLE_CONTROL_DEFINITIONS, normalizeControls } from './sound-generator-controls.js';
import { SOUND_TYPE_GROUPS, SOUND_TYPES, constrainedVariationForSoundType, copyPresetControls, firstExamplePreset } from './sound-generator-presets.js';
import { buildProceduralSynthAsset, makeAudioAssetId, makeRecipePath } from './procedural-synth-schema.js';
import { ProceduralSoundRuntime } from './procedural-synth-runtime.js';
import '../project-folder/project-folder-client.js?v=0.1.0';
import { downloadProceduralSynthRecipe, readImportedProceduralSynth, saveProceduralSynthToLibrary } from './sound-generator-store.js';

const VERSION = 'V1.10';
const STYLE_ID = 'artifex-sound-generator-css';
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const clone = (value) => structuredClone(value);

function loadCss() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = new URL('./sound-generator.css?v=1.11', import.meta.url).href;
  document.head.appendChild(link);
}

function controlSliderMarkup(definition) {
  const ends = definition.ends || ['', ''];
  return `<label class="sound-slider" title="${esc(definition.hint)}"><span><b>${esc(definition.label)}</b><output data-out="${esc(definition.key)}">0</output></span><input type="range" min="${definition.min}" max="${definition.max}" step="1" data-field="${esc(definition.key)}" /><small>${esc(ends[0])} ↔ ${esc(ends[1])}</small></label>`;
}

function markup(options) {
  const close = options.mode === 'floating' ? '<button class="sound-close" type="button" data-act="close" title="Close">✕</button>' : '';
  return `<section class="sound-generator-card" aria-label="Create Synth Sound">
    <header class="sound-header sound-tool-header"><div class="sound-brand"><span class="sound-rune">ᚠ</span><div><p class="sound-kicker">ARTIFEX SOUND LIBRARY TOOL</p><h1>Create Synth Sound</h1></div><span class="sound-version">${VERSION}</span></div>${close}</header>
    <nav class="sound-top-actions" aria-label="Sound editing actions">
      <p class="sound-variation-count" data-variation-count>Variation 1 of 1</p>
      <button type="button" data-act="back">↩️ Library</button>
      <button class="primary" data-act="preview">▶️ Preview</button>
      <button class="variation-action" data-act="variation">🎲 Random Variation</button>
      <button data-act="stop">⏹️ Stop</button>
      <span class="sound-tool-divider" aria-hidden="true"></span>
      <button data-act="prev">⬅️ Previous</button>
      <button data-act="next">➡️ Next</button>
      <button data-act="favorite">⭐ Favourite</button>
      <button data-act="reset">🔄 Reset Type</button>
      <span class="sound-tool-divider" aria-hidden="true"></span>
      <button data-act="save">💾 Save Sound</button>
      <button class="assign-action" data-act="assign">✅ Save and Select</button>
    </nav>
    <div class="sound-layout sound-layout-redesigned">
      <aside class="sound-type-panel"><h2>Sound Types</h2><label class="sound-search-label">Search starting sounds<input type="search" data-sound-type-search placeholder="coin, locked, quest, portal…" /></label><div class="sound-type-list" data-sound-types></div></aside>
      <section class="sound-editor">
        <div class="sound-favourites" data-favourites-panel hidden><h3>⭐ Favourites in this unsaved session</h3><div data-favourites></div></div>
        <div class="sound-control-grid">${SIMPLE_CONTROL_DEFINITIONS.map(controlSliderMarkup).join('')}</div>
        <details class="sound-advanced"><summary>⚙️ Advanced Controls</summary><fieldset class="sound-pitch-change"><legend>Frequency movement</legend><button data-pitch="drops">↘️ Drops</button><button data-pitch="steady">➡️ Steady</button><button data-pitch="rises">↗️ Rises</button></fieldset><div class="sound-control-grid compact">${ADVANCED_CONTROL_DEFINITIONS.map(controlSliderMarkup).join('')}</div><div class="sound-pattern-row"><label>Pattern<select data-field="pattern"><option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option><option value="repeat">Repeat</option></select></label><label class="check"><input type="checkbox" data-field="loop" /> Loop until stopped</label></div><div class="sound-file-actions secondary"><input type="file" accept=".json,application/json" data-file hidden /><button data-act="import">📥 Import procedural JSON</button><button data-act="export">📤 Export current recipe JSON</button></div></details>
      </section>
    </div>
    <p class="sound-message" data-message aria-live="polite"></p>
  </section>`;
}

function saveDialogMarkup(record, options) {
  const suggestedId = makeAudioAssetId(record.name);
  const path = makeRecipePath(record.name);
  return `<div class="sound-save-backdrop" role="dialog" aria-modal="true" aria-label="Save Sound to Library"><form class="sound-save-dialog" data-save-form><h2>Save Sound to Library</h2><p>Name, category and tags are only required now, after auditioning.</p><label>Name <input required maxlength="80" data-save-name value="${esc(record.name)}" /></label><label>Audio category <input maxlength="50" data-save-category value="${esc(record.category || 'sfx')}" /></label><label>Tags <input maxlength="180" data-save-tags value="${esc(record.tags)}" placeholder="ui, pickup, reward" /></label><dl><div><dt>Asset ID preview</dt><dd data-save-id>${esc(suggestedId)}</dd></div><div><dt>Location</dt><dd>Audio Library / <code>assets/audio/sfx/</code></dd></div><div><dt>Recipe path preview</dt><dd data-save-path>${esc(path)}</dd></div></dl><div class="sound-save-actions"><button type="button" data-save-cancel>✖️ Cancel</button><button class="primary" type="submit">${options.assignAfterSave ? '✅ Save and Select' : '💾 Save Sound'}</button></div></form></div>`;
}

export function createSoundGeneratorUI(container, options = {}) {
  loadCss();
  const config = { mode: 'standalone', sourceLabel: '', onAssign: null, onSaved: null, onBack: null, onClose: null, ...options };
  const first = firstExamplePreset();
  const initialControls = copyPresetControls(first);
  const state = {
    soundTypeId: first.id,
    history: [{ controls: initialControls, favourite: false, label: 'Base' }],
    historyIndex: 0,
    record: null,
    createdAt: null,
    runtimeMessage: 'Ready.'
  };

  container.innerHTML = markup(config);
  const root = container.querySelector('.sound-generator-card');
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  const text = (s, value) => { const node = $(s); if (node) node.textContent = value || ''; };
  const message = (value, kind = '') => { text('[data-message]', value); $('[data-message]').dataset.kind = kind; };
  const runtime = new ProceduralSoundRuntime(({ message: runtimeMsg }) => {
    state.runtimeMessage = runtimeMsg || 'Ready.';
    message(state.runtimeMessage);
  });

  function currentControls() {
    return normalizeControls(state.history[state.historyIndex]?.controls || initialControls);
  }

  function selectedType() {
    return SOUND_TYPES.find((type) => type.id === state.soundTypeId) || first;
  }

  function currentRecord(metadata = {}) {
    const type = selectedType();
    return buildProceduralSynthAsset(currentControls(), {
      createdAt: state.createdAt,
      sourceLabel: config.sourceLabel,
      presetId: type.id,
      creationMode: 'sound-library-create-synth',
      ...metadata
    });
  }

  function renderSoundTypes() {
    const term = String($('[data-sound-type-search]')?.value || '').trim().toLowerCase();
    const list = $('[data-sound-types]');
    list.innerHTML = SOUND_TYPE_GROUPS.map((group) => {
      const items = SOUND_TYPES.filter((type) => type.group === group.label && (!term || `${type.label} ${type.description} ${type.group}`.toLowerCase().includes(term)));
      if (!items.length) return '';
      return `<section class="sound-type-group"><h3>${esc(group.label)}</h3>${items.map((type) => `<button type="button" class="sound-type-row ${type.id === state.soundTypeId ? 'is-active' : ''}" data-type="${esc(type.id)}"><strong>${esc(type.label)}</strong></button>`).join('')}</section>`;
    }).join('') || '<p class="sound-empty">No starting sounds match that search.</p>';
  }

  function renderFavourites() {
    const favourites = state.history.map((entry, index) => ({ ...entry, index })).filter((entry) => entry.favourite);
    const panel = $('[data-favourites-panel]');
    const host = $('[data-favourites]');
    if (panel) panel.hidden = !favourites.length;
    host.innerHTML = favourites.map((entry) => `<button type="button" data-favourite-index="${entry.index}">⭐ Variation ${entry.index + 1} <span>${esc(entry.label || '')}</span></button>`).join('');
  }

  function renderControls() {
    const values = currentControls();
    [...SIMPLE_CONTROL_DEFINITIONS, ...ADVANCED_CONTROL_DEFINITIONS].forEach(({ key }) => {
      const input = root.querySelector(`[data-field="${key}"]`);
      const output = root.querySelector(`[data-out="${key}"]`);
      if (input) input.value = values[key];
      if (output) output.textContent = values[key];
    });
    const pattern = root.querySelector('[data-field="pattern"]');
    if (pattern) pattern.value = values.pattern;
    const loop = root.querySelector('[data-field="loop"]');
    if (loop) loop.checked = values.loop;
    $$('[data-pitch]').forEach((button) => button.classList.toggle('is-active', button.dataset.pitch === values.pitchChange));
    text('[data-variation-count]', `Variation ${state.historyIndex + 1} of ${state.history.length}`);
    const favButton = $('[data-act="favorite"]');
    const isFavourite = Boolean(state.history[state.historyIndex]?.favourite);
    favButton.textContent = isFavourite ? '⭐ Favourited' : '⭐ Favourite';
    favButton.classList.toggle('is-active', isFavourite);
    state.record = currentRecord();
    renderSoundTypes();
    renderFavourites();
  }

  function updateCurrentControls(patch) {
    state.history[state.historyIndex] = { ...state.history[state.historyIndex], controls: normalizeControls({ ...currentControls(), ...patch }) };
    renderControls();
  }

  function selectType(typeId) {
    const type = SOUND_TYPES.find((item) => item.id === typeId);
    if (!type) return;
    state.soundTypeId = type.id;
    state.history = [{ controls: copyPresetControls(type), favourite: false, label: 'Base' }];
    state.historyIndex = 0;
    runtime.stop();
    renderControls();
    message(`Selected ${type.label}. Use Random Variation or adjust the controls.`);
  }

  function addVariation() {
    const type = selectedType();
    const controls = constrainedVariationForSoundType(type);
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push({ controls, favourite: false, label: type.label });
    state.historyIndex = state.history.length - 1;
    renderControls();
    message(`Random Variation ${state.historyIndex + 1} stays within the ${type.label} profile.`);
  }

  async function preview() {
    try {
      await runtime.play(currentRecord());
    } catch (error) {
      message(error.message || String(error), 'error');
    }
  }

  async function saveWithMetadata(assignAfterSave = false) {
    return new Promise((resolve) => {
      const baseline = currentControls();
      root.insertAdjacentHTML('beforeend', saveDialogMarkup(baseline, { assignAfterSave }));
      const backdrop = root.querySelector('.sound-save-backdrop');
      const form = root.querySelector('[data-save-form]');
      const nameInput = root.querySelector('[data-save-name]');
      const categoryInput = root.querySelector('[data-save-category]');
      const tagsInput = root.querySelector('[data-save-tags]');
      const updatePreview = () => {
        const name = nameInput.value || 'New Sound';
        root.querySelector('[data-save-id]').textContent = makeAudioAssetId(name);
        root.querySelector('[data-save-path]').textContent = makeRecipePath(name);
      };
      const close = (result = null) => { backdrop.remove(); resolve(result); };
      nameInput.addEventListener('input', updatePreview);
      root.querySelector('[data-save-cancel]').addEventListener('click', () => close(null));
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nextControls = normalizeControls({ ...currentControls(), name: nameInput.value, category: categoryInput.value || 'sfx', tags: tagsInput.value });
        state.history[state.historyIndex] = { ...state.history[state.historyIndex], controls: nextControls };
        const recipeRecord = currentRecord({ assetId: makeAudioAssetId(nextControls.name) });
        try {
          const result = await saveProceduralSynthToLibrary(recipeRecord);
          state.createdAt = recipeRecord.createdAt;
          message(`Saved ${result.assetId} to the Audio Library.`, 'success');
          config.onSaved?.({ ...result, assignAfterSave });
          if (assignAfterSave) config.onAssign?.({ assetId: result.assetId, sourceLabel: config.sourceLabel });
          close(result);
        } catch (error) {
          message(error.message || String(error), 'error');
        }
      });
      nameInput.focus();
      updatePreview();
    });
  }

  root.addEventListener('input', (event) => {
    const target = event.target;
    if (target.matches('[data-sound-type-search]')) renderSoundTypes();
    if (target.matches('input[type="range"][data-field]')) updateCurrentControls({ [target.dataset.field]: target.value });
  });

  root.addEventListener('change', (event) => {
    const target = event.target;
    if (target.matches('[data-field="pattern"]')) updateCurrentControls({ pattern: target.value });
    if (target.matches('[data-field="loop"]')) updateCurrentControls({ loop: target.checked });
  });

  root.addEventListener('click', async (event) => {
    const typeButton = event.target.closest('[data-type]');
    if (typeButton) { selectType(typeButton.dataset.type); return; }
    const favButton = event.target.closest('[data-favourite-index]');
    if (favButton) { state.historyIndex = Number(favButton.dataset.favouriteIndex); renderControls(); return; }
    const pitchButton = event.target.closest('[data-pitch]');
    if (pitchButton) { updateCurrentControls({ pitchChange: pitchButton.dataset.pitch }); return; }
    const action = event.target.closest('[data-act]')?.dataset.act;
    if (!action) return;
    if (action === 'close') { runtime.stop(); config.onClose?.(); }
    if (action === 'back') { runtime.stop(); config.onBack?.(); }
    if (action === 'preview') await preview();
    if (action === 'stop') { runtime.stop(); message('Preview stopped.'); }
    if (action === 'variation') addVariation();
    if (action === 'prev') { state.historyIndex = Math.max(0, state.historyIndex - 1); runtime.stop(); renderControls(); }
    if (action === 'next') { state.historyIndex = Math.min(state.history.length - 1, state.historyIndex + 1); runtime.stop(); renderControls(); }
    if (action === 'favorite') { state.history[state.historyIndex].favourite = !state.history[state.historyIndex].favourite; renderControls(); }
    if (action === 'reset') selectType(state.soundTypeId);
    if (action === 'save') await saveWithMetadata(false);
    if (action === 'assign') await saveWithMetadata(true);
    if (action === 'export') downloadProceduralSynthRecipe(currentRecord());
    if (action === 'import') $('[data-file]')?.click();
  });

  $('[data-file]')?.addEventListener('change', async (event) => {
    try {
      const record = await readImportedProceduralSynth(event.target.files?.[0]);
      state.soundTypeId = first.id;
      state.history = [{ controls: normalizeControls(record.editor.controls), favourite: false, label: 'Imported JSON' }];
      state.historyIndex = 0;
      renderControls();
      message('Imported procedural synth JSON into the current unsaved session.');
    } catch (error) {
      message(error.message || String(error), 'error');
    } finally {
      event.target.value = '';
    }
  });

  renderControls();
  message('Choose a sound type, create constrained variations, then save when ready.');

  return {
    destroy() { runtime.stop(); },
    stop() { runtime.stop(); },
    getRecord() { return clone(currentRecord()); },
    getHistory() { return clone(state.history); }
  };
}