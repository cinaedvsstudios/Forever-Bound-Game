import { patternTemplates } from './pattern-lock-templates.js';
import { PatternLockRenderer } from './pattern-lock-renderer.js';

const $ = (id) => document.getElementById(id);
const state = {
  mounted: false,
  active: false,
  templateId: 'cube',
  points: [],
  placements: new Map(),
  selectedEmoji: null,
  erase: false,
  complete: false,
  renderer: null,
  stage: null,
  panels: null
};

export function openPatternLockWorkflow() {
  ensureMounted();
  state.active = true;
  document.body.classList.add('is-pattern-lock');
  document.body.classList.remove('is-puzzle-brief', 'is-puzzle-chooser');
  state.stage.hidden = false;
  state.panels.hidden = false;
  showPanel('build');
  if (!state.points.length) loadTemplate('cube');
  state.renderer.start();
  state.renderer.resize();
}

export function closePatternLockWorkflow() {
  if (!state.mounted) return;
  state.active = false;
  document.body.classList.remove('is-pattern-lock');
  state.stage.hidden = true;
  state.panels.hidden = true;
  state.renderer.stop();
}

function ensureMounted() {
  if (state.mounted) return;
  const rightPanel = document.querySelector('.right-panel');
  const leftBody = document.querySelector('.left-panel-body');
  if (!rightPanel || !leftBody) return;
  state.stage = document.createElement('section');
  state.stage.id = 'pattern-lock-stage';
  state.stage.className = 'pattern-lock-stage';
  state.stage.hidden = true;
  state.stage.innerHTML = `
    <div class="pattern-workspace">
      <div class="pattern-view-frame">
        <div class="pattern-view-toolbar"><span id="pattern-view-status">Select an emoji, then place it on a surface point.</span><button id="pattern-reset-view" class="small-button" type="button">Reset View</button></div>
        <div id="pattern-three-container" class="pattern-three-container"></div>
        <div id="pattern-hint-overlay" class="pattern-hint-overlay"><small>Hint</small><strong id="pattern-hint-text"></strong></div>
      </div>
      <aside class="pattern-tray-panel">
        <p class="eyebrow">Available signs</p><h3>Emoji Tray</h3>
        <div id="pattern-emoji-tray" class="pattern-emoji-tray"></div>
        <button id="pattern-eraser" class="pattern-eraser" type="button">⌫ Erase point</button>
        <div class="pattern-progress"><small>Placed</small><strong id="pattern-progress-count">0 / 0</strong></div>
        <button id="pattern-check-stage" class="primary-button" type="button">Check Pattern</button>
        <div id="pattern-result-stage" class="pattern-result" aria-live="polite">The form awaits its signs.</div>
      </aside>
    </div>`;
  rightPanel.prepend(state.stage);

  state.panels = document.createElement('div');
  state.panels.id = 'pattern-lock-panels';
  state.panels.className = 'pattern-lock-panels';
  state.panels.hidden = true;
  state.panels.innerHTML = `
    <section class="panel tool-panel pattern-panel" data-pattern-panel="build">
      <div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Pattern Lock</h2></div><span class="status-pill is-waiting">Prototype</span></div>
      <p class="pattern-panel-copy">Emoji demonstrations only. Each template is a rotatable outer-surface point puzzle based on the reference interaction.</p>
      <label class="field-block"><span>Shape Template</span><select id="pattern-template-select"><option value="cube">Cube</option><option value="pyramid">Pyramid</option><option value="diamond">Diamond</option><option value="sphere">Sphere</option></select></label>
      <div class="pattern-template-note"><strong id="pattern-template-name">Cube</strong><small>Rotatable outer-surface point form.</small></div>
      <div class="pattern-button-stack"><button id="pattern-new-template" class="wide-button" type="button">Reset Template</button><button id="pattern-fill-example" class="wide-button pattern-demo-button" type="button">Show Correct Example</button></div>
    </section>
    <section class="panel tool-panel pattern-panel" data-pattern-panel="display" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Display</h2></div></div>
      <label class="range-row"><span>Point Size <output id="pattern-point-size-output">100%</output></span><input id="pattern-point-size" type="range" min="70" max="150" step="5" value="100" /></label>
      <label class="toggle-row"><span><strong>Show Hint</strong><small>Show the clue over the viewer.</small></span><input id="pattern-show-hint" type="checkbox" checked /></label>
      <div class="pattern-point-key"><i></i><span>Empty surface point awaiting an item.</span></div>
      <button id="pattern-reset-view-panel" class="wide-button" type="button">Reset View</button>
    </section>
    <section class="panel tool-panel pattern-panel" data-pattern-panel="logic" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Objective</h2></div></div>
      <div class="pattern-logic-block"><small>Objective</small><p id="pattern-objective-text"></p></div>
      <div class="pattern-logic-block"><small>Hint</small><p id="pattern-logic-hint"></p></div>
      <div class="pattern-validation"><strong>Validation</strong><span>Check Pattern · the puzzle does not reveal individual wrong points.</span></div>
      <button id="pattern-check-panel" class="wide-button" type="button">Check Pattern</button>
      <div id="pattern-result-panel" class="pattern-result" aria-live="polite">The form awaits its signs.</div>
    </section>
    <section class="panel tool-panel pattern-panel" data-pattern-panel="visuals" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">04 · Colors</p><h2>Point Styling</h2></div></div>
      <label class="field-block"><span>Point Shape</span><select id="pattern-point-shape"><option value="sphere">Sphere</option><option value="cube">Cube</option><option value="gem">Faceted Gem</option></select></label>
      <label class="field-block compact"><span>Empty Point Colour</span><input id="pattern-empty-color" type="color" value="#d5dbd6" /></label>
      <div class="pattern-texture-control">
        <span class="pattern-control-label">Point Texture</span>
        <label class="wide-button pattern-texture-upload"><input id="pattern-point-texture" class="file-input-hidden" type="file" accept="image/*" />Choose Texture Image</label>
        <small id="pattern-texture-name">No custom texture selected.</small>
        <button id="pattern-clear-texture" class="wide-button" type="button">Remove Texture</button>
      </div>
      <p class="pattern-panel-copy">Texture and point shape change the marker surface only; emoji placement and pattern logic stay the same.</p>
      <button id="pattern-clear-placements" class="wide-button danger-lite" type="button">Clear Placements</button>
    </section>`;
  leftBody.appendChild(state.panels);
  state.renderer = new PatternLockRenderer($('pattern-three-container'), { onPointClick: placeAtPoint });
  bindControls();
  state.mounted = true;
}

function bindControls() {
  $('pattern-template-select').addEventListener('change', (event) => loadTemplate(event.target.value));
  $('pattern-new-template').addEventListener('click', () => loadTemplate(state.templateId));
  $('pattern-fill-example').addEventListener('click', fillExample);
  $('pattern-reset-view').addEventListener('click', () => state.renderer.resetView());
  $('pattern-reset-view-panel').addEventListener('click', () => state.renderer.resetView());
  $('pattern-check-stage').addEventListener('click', checkPattern);
  $('pattern-check-panel').addEventListener('click', checkPattern);
  $('pattern-clear-placements').addEventListener('click', clearPlacements);
  $('pattern-eraser').addEventListener('click', () => selectEmoji(null));
  $('pattern-point-size').addEventListener('input', (event) => {
    $('pattern-point-size-output').textContent = `${event.target.value}%`;
    state.renderer.setPointScale(Number(event.target.value));
  });
  $('pattern-show-hint').addEventListener('change', (event) => { $('pattern-hint-overlay').hidden = !event.target.checked; });
  $('pattern-point-shape').addEventListener('change', (event) => state.renderer.setPointShape(event.target.value));
  $('pattern-empty-color').addEventListener('input', (event) => state.renderer.setEmptyColor(event.target.value, state.placements, state.complete));
  $('pattern-point-texture').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    $('pattern-texture-name').textContent = file.name;
    state.renderer.setPointTexture(file, state.placements, state.complete).catch(() => {
      $('pattern-texture-name').textContent = 'Texture could not be loaded.';
    });
  });
  $('pattern-clear-texture').addEventListener('click', () => {
    $('pattern-point-texture').value = '';
    $('pattern-texture-name').textContent = 'No custom texture selected.';
    state.renderer.clearPointTexture(state.placements, state.complete);
  });
  document.querySelector('.left-icon-bar')?.addEventListener('click', (event) => {
    if (!state.active) return;
    const button = event.target.closest('.panel-nav-button');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showPanel(button.dataset.panel);
  }, true);
}

function loadTemplate(templateId) {
  const template = patternTemplates[templateId] || patternTemplates.cube;
  state.templateId = patternTemplates[templateId] ? templateId : 'cube';
  state.points = template.makePoints();
  state.placements.clear();
  state.complete = false;
  $('pattern-template-select').value = state.templateId;
  $('pattern-template-name').textContent = template.label;
  $('pattern-hint-text').textContent = template.hint;
  $('pattern-objective-text').textContent = template.objective;
  $('pattern-logic-hint').textContent = template.hint;
  renderTray(template);
  selectEmoji(template.emojis[0]);
  state.renderer.load(state.points, state.placements, false);
  updateProgress();
  setMessage('The form awaits its signs.', 'waiting');
}

function renderTray(template) {
  const tray = $('pattern-emoji-tray');
  tray.innerHTML = '';
  template.emojis.forEach((emoji) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pattern-emoji';
    button.dataset.patternEmoji = emoji;
    button.textContent = emoji;
    button.title = `Place ${emoji}`;
    button.addEventListener('click', () => selectEmoji(emoji));
    tray.appendChild(button);
  });
}

function selectEmoji(emoji) {
  state.selectedEmoji = emoji;
  state.erase = emoji === null;
  document.querySelectorAll('[data-pattern-emoji]').forEach((button) => button.classList.toggle('is-active', button.dataset.patternEmoji === emoji));
  $('pattern-eraser').classList.toggle('is-active', state.erase);
  $('pattern-view-status').textContent = state.erase ? 'Erase selected. Click a surface point to clear it.' : `${emoji} selected. Click points to place it; drag to rotate.`;
}

function placeAtPoint(index) {
  if (!state.active) return;
  if (state.erase) state.placements.delete(index);
  else state.placements.set(index, state.selectedEmoji);
  state.complete = false;
  state.renderer.paint(state.placements, false);
  updateProgress();
  setMessage('Pattern changed. Press Check Pattern when ready.', 'waiting');
}

function fillExample() {
  state.placements.clear();
  state.points.forEach((point, index) => state.placements.set(index, point.expected));
  state.complete = false;
  state.renderer.paint(state.placements, false);
  updateProgress();
  setMessage('Correct example loaded. Press Check Pattern to validate it.', 'waiting');
}

function clearPlacements() {
  state.placements.clear();
  state.complete = false;
  state.renderer.paint(state.placements, false);
  updateProgress();
  setMessage('Placements cleared. The form awaits its signs.', 'waiting');
}

function checkPattern() {
  const complete = state.points.every((point, index) => state.placements.get(index) === point.expected);
  state.complete = complete;
  state.renderer.paint(state.placements, complete);
  setMessage(complete ? 'Pattern Complete · the form answers the hint.' : 'The pattern does not yet answer the hint.', complete ? 'success' : 'error');
}

function updateProgress() {
  $('pattern-progress-count').textContent = `${state.placements.size} / ${state.points.length}`;
}

function setMessage(text, status) {
  ['pattern-result-stage', 'pattern-result-panel'].forEach((id) => {
    const target = $(id);
    if (!target) return;
    target.textContent = text;
    target.dataset.state = status;
  });
}

function showPanel(panelId) {
  state.panels.querySelectorAll('[data-pattern-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.patternPanel !== panelId;
    panel.classList.toggle('is-active', panel.dataset.patternPanel === panelId);
  });
  document.querySelectorAll('.panel-nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.panel === panelId));
}
