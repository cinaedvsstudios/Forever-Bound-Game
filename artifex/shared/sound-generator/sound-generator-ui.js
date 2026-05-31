import '../project-folder/project-folder-client.js?v=0.1.0';

const STYLE_ID = 'artifex-sound-generator-styles';
const ASSET_INDEX_PATH = 'assets/asset-index.json';
const ASSET_INDEX_SCHEMA = 'artifex.assets.index.v1';
const PRESETS = Object.freeze({
  blip: { tone: 24, pitch: 65, length: 16, pitchChange: 'steady', pattern: 'single', loop: false },
  buzz: { tone: 78, pitch: 28, length: 34, pitchChange: 'drops', pattern: 'single', loop: false },
  chime: { tone: 14, pitch: 78, length: 46, pitchChange: 'rises', pattern: 'double', loop: false },
  pulse: { tone: 46, pitch: 52, length: 24, pitchChange: 'steady', pattern: 'triple', loop: false },
  hum: { tone: 48, pitch: 21, length: 74, pitchChange: 'steady', pattern: 'single', loop: true },
  alarm: { tone: 69, pitch: 64, length: 32, pitchChange: 'drops', pattern: 'repeat', loop: true }
});

let audioContext = null;
let activeOscillators = [];
let activeTimers = [];

export function createSoundGeneratorUI(container, options = {}) {
  injectStyles();
  const sourceLabel = String(options.sourceLabel || options.contextLabel || 'Current sound field');
  container.innerHTML = `
    <section class="sound-generator-shell ${options.mode === 'floating' ? 'is-floating' : ''}" aria-label="Create Synth Sound">
      <header class="sound-generator-head">
        <div><p>Generated Audio Asset</p><h2>Create Synth Sound</h2><small>Source: ${escapeHtml(sourceLabel)}</small></div>
        ${options.mode === 'floating' ? '<button type="button" data-sound-close title="Close without saving">×</button>' : ''}
      </header>
      <div class="sound-generator-title-row">
        <label>Name<input data-sound-name value="New Synth Sound" placeholder="Locked Door Buzz" /></label>
        <label>Category<select data-sound-category><option value="object-events">Object Events</option><option value="doors-machines">Doors & Machines</option><option value="pickups-rewards">Pickups & Rewards</option><option value="puzzle-feedback">Puzzle Feedback</option><option value="magic-energy">Magic & Energy</option><option value="alarms-threats">Alarms & Threats</option><option value="loops-atmosphere">Loops & Atmosphere</option></select></label>
        <button type="button" data-preview-sound title="Preview this sound">▶ Preview</button>
        <button type="button" data-stop-sound title="Stop preview">■ Stop</button>
      </div>
      <div class="sound-generator-body">
        <section class="sound-generator-presets">
          <h3>Start New</h3>
          <div class="sound-shapes" data-sound-shapes>
            <button type="button" data-shape="blip" class="is-selected">Blip</button>
            <button type="button" data-shape="buzz">Buzz</button>
            <button type="button" data-shape="chime">Chime</button>
            <button type="button" data-shape="pulse">Pulse</button>
            <button type="button" data-shape="hum">Hum</button>
            <button type="button" data-shape="alarm">Alarm</button>
          </div>
          <p class="sound-generator-note">Creates a reusable registered sound under <code>assets/audio/sfx/</code>. The calling object stores only the resulting <code>asset_</code> ID.</p>
        </section>
        <section class="sound-generator-controls">
          <h3>Adjust Sound</h3>
          <label>Tone <small>Soft ↔ Harsh</small><input data-control="tone" type="range" min="0" max="100" value="24" /></label>
          <label>Pitch <small>Low ↔ High</small><input data-control="pitch" type="range" min="0" max="100" value="65" /></label>
          <label>Length <small>Short ↔ Long</small><input data-control="length" type="range" min="0" max="100" value="16" /></label>
          <label>Pitch Change<select data-control="pitchChange"><option value="drops">Drops</option><option value="steady" selected>Steady</option><option value="rises">Rises</option></select></label>
          <label>Pattern<select data-control="pattern"><option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option><option value="repeat">Repeat</option></select></label>
          <label class="sound-loop-row"><input data-control="loop" type="checkbox" /> Loop until stopped</label>
        </section>
      </div>
      <footer class="sound-generator-actions">
        <span class="sound-generator-status" data-sound-status>Not saved</span>
        <button type="button" data-sound-cancel>Cancel</button>
        <button type="button" data-save-library>Save to Library</button>
        <button type="button" data-save-assign class="primary">Save and Assign Here</button>
      </footer>
    </section>`;

  const root = container.querySelector('.sound-generator-shell');
  let currentRecord = null;
  let destroyed = false;
  const close = () => options.onClose?.();
  root.querySelector('[data-sound-close]')?.addEventListener('click', close);
  root.querySelector('[data-sound-cancel]')?.addEventListener('click', close);
  root.querySelector('[data-preview-sound]')?.addEventListener('click', () => previewSound(readSoundDraft(root)));
  root.querySelector('[data-stop-sound]')?.addEventListener('click', stopPreview);
  root.querySelectorAll('[data-shape]').forEach((button) => button.addEventListener('click', () => {
    root.querySelectorAll('[data-shape]').forEach((item) => item.classList.remove('is-selected'));
    button.classList.add('is-selected');
    setControls(root, PRESETS[button.dataset.shape] || PRESETS.blip);
  }));
  root.querySelector('[data-save-library]')?.addEventListener('click', async () => {
    currentRecord = await saveSoundDraft(root, false, options);
  });
  root.querySelector('[data-save-assign]')?.addEventListener('click', async () => {
    currentRecord = await saveSoundDraft(root, true, options);
  });

  return {
    getRecord: () => currentRecord || readSoundDraft(root),
    stop: stopPreview,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      stopPreview();
      container.innerHTML = '';
    }
  };
}

async function saveSoundDraft(root, assign, options) {
  const status = root.querySelector('[data-sound-status]');
  try {
    status.textContent = 'Saving…';
    const client = await obtainProjectClient();
    const index = await client.readJson(ASSET_INDEX_PATH);
    if (!index || index.schemaVersion !== ASSET_INDEX_SCHEMA || !Array.isArray(index.assets)) {
      throw new Error(`Expected ${ASSET_INDEX_PATH} with schema ${ASSET_INDEX_SCHEMA} and an assets array.`);
    }
    const draft = readSoundDraft(root);
    const existingIndex = index.assets.findIndex((item) => item?.id === draft.record.id);
    if (existingIndex >= 0) index.assets[existingIndex] = draft.record;
    else index.assets.push(draft.record);
    await client.writeJson(draft.record.file, draft.recipe);
    await client.writeJson(ASSET_INDEX_PATH, index);
    status.textContent = `Saved: ${draft.record.id}`;
    emitToast(`${draft.record.name} saved to the project sound library.`, 'success');
    options.onSave?.(draft);
    if (assign) {
      options.onAssign?.(draft);
      options.onSelect?.(draft);
      options.onClose?.();
    }
    return draft;
  } catch (error) {
    status.textContent = 'Save failed';
    emitToast(`Sound save failed: ${error.message || String(error)}`, 'error');
    return null;
  }
}

function readSoundDraft(root) {
  const controls = {
    startingShape: root.querySelector('[data-shape].is-selected')?.dataset.shape || 'blip',
    tone: Number(root.querySelector('[data-control="tone"]')?.value || 24),
    pitch: Number(root.querySelector('[data-control="pitch"]')?.value || 65),
    length: Number(root.querySelector('[data-control="length"]')?.value || 16),
    pitchChange: root.querySelector('[data-control="pitchChange"]')?.value || 'steady',
    pattern: root.querySelector('[data-control="pattern"]')?.value || 'single',
    loop: Boolean(root.querySelector('[data-control="loop"]')?.checked)
  };
  const name = String(root.querySelector('[data-sound-name]')?.value || 'New Synth Sound').trim() || 'New Synth Sound';
  const category = root.querySelector('[data-sound-category]')?.value || 'object-events';
  const slug = safeId(name);
  const assetId = `asset_sfx_${slug}`;
  const file = `assets/audio/sfx/synth_${slug}.json`;
  const recipe = createRecipe(assetId, name, category, controls);
  return {
    assetId,
    record: { id: assetId, name, type: 'sound-effect', assetKind: 'procedural-synth', file, playbackEngine: 'web-audio', category, status: 'ready', tags: ['sound-effect', 'procedural', controls.startingShape] },
    recipe
  };
}

function createRecipe(assetId, name, category, controls) {
  const startFrequencyHz = Math.round(80 + controls.pitch * 7);
  const change = controls.pitchChange === 'drops' ? -0.24 : controls.pitchChange === 'rises' ? 0.24 : 0;
  const durationMs = Math.round(90 + controls.length * 10);
  return {
    schemaVersion: 'artifex.audio.procedural-synth.v1',
    assetId,
    name,
    category,
    editor: { startingMode: 'new', startingShape: controls.startingShape, controls },
    recipe: {
      masterGain: 0.2,
      durationMs,
      tone: { waveform: controls.tone > 68 ? 'sawtooth' : controls.tone > 36 ? 'square' : 'sine', startFrequencyHz, endFrequencyHz: Math.round(startFrequencyHz * (1 + change)), attackMs: 8, releaseMs: Math.min(150, Math.round(durationMs * 0.3)) },
      pattern: { mode: controls.pattern, paceMs: Math.max(90, Math.round(durationMs * 0.7)), loop: controls.loop }
    }
  };
}

async function obtainProjectClient() {
  const client = window.ArtifexProjectFolder;
  if (!client) throw new Error('Project-folder service is unavailable.');
  let state = client.getState();
  if (state.folderStatus === 'permission-required') state = await client.reauthoriseProjectFolder();
  else if (state.folderStatus !== 'connected') state = await client.connectProjectFolder();
  if (state.folderStatus !== 'connected') throw new Error('Connect a writable project folder first.');
  return client;
}

async function previewSound(draft) {
  stopPreview();
  const recipe = draft.recipe.recipe;
  audioContext = audioContext || new AudioContext();
  if (audioContext.state === 'suspended') await audioContext.resume();
  const count = recipe.pattern.mode === 'double' ? 2 : recipe.pattern.mode === 'triple' ? 3 : recipe.pattern.mode === 'repeat' ? 4 : 1;
  for (let index = 0; index < count; index += 1) activeTimers.push(window.setTimeout(() => playTone(recipe), index * recipe.pattern.paceMs));
  if (recipe.pattern.loop) activeTimers.push(window.setTimeout(() => previewSound(draft), count * recipe.pattern.paceMs + 80));
}

function playTone(recipe) {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const duration = recipe.durationMs / 1000;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = recipe.tone.waveform;
  oscillator.frequency.setValueAtTime(recipe.tone.startFrequencyHz, now);
  oscillator.frequency.linearRampToValueAtTime(recipe.tone.endFrequencyHz, now + duration);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(recipe.masterGain, now + recipe.tone.attackMs / 1000);
  gain.gain.linearRampToValueAtTime(0, now + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
  activeOscillators.push(oscillator);
  oscillator.addEventListener('ended', () => { activeOscillators = activeOscillators.filter((item) => item !== oscillator); });
}

function stopPreview() {
  activeTimers.forEach((timer) => window.clearTimeout(timer));
  activeTimers = [];
  activeOscillators.forEach((oscillator) => { try { oscillator.stop(); } catch { /* already ended */ } });
  activeOscillators = [];
}

function setControls(root, values) {
  Object.entries(values).forEach(([key, value]) => {
    const field = root.querySelector(`[data-control="${key}"]`);
    if (!field) return;
    if (field.type === 'checkbox') field.checked = Boolean(value);
    else field.value = String(value);
  });
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .sound-modal-backdrop{position:fixed;z-index:10000;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.72);backdrop-filter:blur(2px)}
    .sound-modal-mount{width:min(820px,calc(100vw - 40px));border:1px solid rgba(226,204,167,.28);border-radius:16px;background:#140f0d;color:#fff0ce;box-shadow:0 25px 70px rgba(0,0,0,.72);overflow:hidden}
    .sound-generator-shell{display:grid;grid-template-rows:auto auto 1fr auto;color:#fff0ce;background:#140f0d}
    .sound-generator-head{display:flex;justify-content:space-between;gap:16px;padding:15px 17px 12px;border-bottom:1px solid rgba(226,204,167,.16)}
    .sound-generator-head p{margin:0 0 4px;color:#cbb18d;font:700 10px/1.2 Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase}.sound-generator-head h2{margin:0 0 3px;font-size:19px}.sound-generator-head small{color:rgba(255,240,206,.62)}
    .sound-generator-head button{width:34px;height:34px;padding:0}
    .sound-generator-title-row{display:grid;grid-template-columns:minmax(180px,1fr) minmax(170px,.85fr) auto auto;align-items:end;gap:9px;padding:12px 17px;border-bottom:1px solid rgba(226,204,167,.12)}
    .sound-generator-title-row label,.sound-generator-controls label{display:grid;gap:5px;font-size:11px;color:#e2cca7}.sound-generator-title-row input,.sound-generator-title-row select,.sound-generator-controls select{width:100%;box-sizing:border-box;padding:7px 8px}
    .sound-generator-title-row button{min-height:34px;padding:7px 10px;white-space:nowrap}
    .sound-generator-body{display:grid;grid-template-columns:220px minmax(0,1fr);min-height:300px}.sound-generator-presets{padding:15px;border-right:1px solid rgba(226,204,167,.12)}.sound-generator-controls{padding:15px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px 14px;align-content:start}
    .sound-generator-body h3{grid-column:1/-1;margin:0 0 8px;color:#fff0ce;font-size:13px;letter-spacing:.08em;text-transform:uppercase}.sound-shapes{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.sound-shapes button{padding:8px 6px;font-size:11px}.sound-shapes .is-selected{border-color:#e2cca7;background:rgba(226,204,167,.16);color:#fff0ce}
    .sound-generator-note{margin:16px 0 0;color:rgba(255,240,206,.64);font-size:10px;line-height:1.5}.sound-generator-note code{color:#e2cca7}.sound-generator-controls label small{color:rgba(255,240,206,.58);font-size:10px}.sound-generator-controls input[type=range]{width:100%}.sound-loop-row{display:flex!important;align-items:center;gap:8px!important;margin-top:19px}
    .sound-generator-actions{display:flex;justify-content:flex-end;align-items:center;gap:8px;padding:12px 17px;border-top:1px solid rgba(226,204,167,.14)}.sound-generator-status{margin-right:auto;color:rgba(255,240,206,.65);font-size:11px}.sound-generator-actions button{min-height:35px;padding:7px 12px}.sound-generator-actions .primary{border-color:rgba(226,204,167,.46);background:rgba(132,94,51,.42)}
    @media(max-width:700px){.sound-generator-title-row,.sound-generator-body,.sound-generator-controls{grid-template-columns:1fr}.sound-generator-presets{border-right:0;border-bottom:1px solid rgba(226,204,167,.12)}}
  `;
  document.head.appendChild(style);
}

function safeId(value) { return String(value || 'sound').trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '') || 'sound'; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])); }
function emitToast(message, type = 'success') { window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message, type } })); }
