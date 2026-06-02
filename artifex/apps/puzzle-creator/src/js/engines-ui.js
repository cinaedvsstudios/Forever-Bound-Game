import { puzzleEngines, getPuzzleEngine } from './engines/index.js';

const $ = (id) => document.getElementById(id);
const engineValues = {};
let activeEngine = null;

window.addEventListener('DOMContentLoaded', () => {
  buildEngineButtons();
  buildPuzzleLauncher();
  bindImageContrastVisibility();
  patchExportPayload();
  showPuzzleChooser();
});

function buildEngineButtons() {
  const host = $('engine-switcher');
  if (!host) return;
  host.innerHTML = '';

  const chooserButton = document.createElement('button');
  chooserButton.type = 'button';
  chooserButton.className = 'engine-button engine-chooser-button';
  chooserButton.title = 'Return to the puzzle type selection screen without deleting current work.';
  chooserButton.innerHTML = '<span class="engine-icon">‹</span><span>Choose Puzzle Type</span>';
  chooserButton.addEventListener('click', showPuzzleChooser);
  host.appendChild(chooserButton);

  puzzleEngines.forEach((engine) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'engine-button';
    button.dataset.engine = engine.id;
    button.title = `${engine.label}: ${engine.purpose}`;
    button.innerHTML = `<span class="engine-icon">${engine.icon}</span><span>${engine.label}</span>`;
    button.addEventListener('click', () => openWorkflow(engine.id));
    host.appendChild(button);
  });
}

function buildPuzzleLauncher() {
  const host = document.querySelector('.left-panel-body');
  if (!host || $('puzzle-launcher-panel')) return;
  const panel = document.createElement('section');
  panel.id = 'puzzle-launcher-panel';
  panel.className = 'panel puzzle-launcher-panel';
  panel.innerHTML = `
    <p class="eyebrow">Start a puzzle</p>
    <h2>Choose a Puzzle Type</h2>
    <p class="puzzle-launcher-copy">Choose the challenge workflow you want to author. Maze / Labyrinth is the currently developed playable editor; other puzzle types retain their existing early workflow state.</p>
    <div class="puzzle-type-grid" aria-label="Available puzzle types"></div>
  `;
  host.prepend(panel);
  const grid = panel.querySelector('.puzzle-type-grid');
  puzzleEngines.forEach((engine) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'puzzle-type-option';
    button.dataset.engine = engine.id;
    button.title = engine.purpose;
    button.innerHTML = `<span class="engine-icon">${engine.icon}</span><span class="puzzle-type-copy"><strong>${engine.label}</strong><small>${launcherDescription(engine.id)}</small></span><span class="puzzle-type-arrow">›</span>`;
    button.addEventListener('click', () => openWorkflow(engine.id));
    grid.appendChild(button);
  });
}

function launcherDescription(engineId) {
  const descriptions = {
    'maze-labyrinth': 'Build and test a navigable maze route.',
    'arena-trial': 'Configure a contained combat challenge.',
    'obstacle-course': 'Configure a movement and obstacle route.',
    'symbol-assembly': 'Configure a symbol-based challenge.',
    'item-order-puzzle': 'Configure an item ordering challenge.',
    'hazard-puzzle': 'Configure an environmental hazard challenge.'
  };
  return descriptions[engineId] || 'Open this puzzle workflow.';
}

function showPuzzleChooser() {
  document.body.classList.add('is-puzzle-chooser');
  activeEngine = null;
  window.__artifexActivePuzzleEngine = null;
  $('puzzle-launcher-panel')?.removeAttribute('hidden');
  document.querySelectorAll('.engine-button[data-engine]').forEach((button) => button.classList.remove('is-active'));
  document.querySelectorAll('[data-panel-content]').forEach((panel) => {
    panel.hidden = true;
    panel.classList.remove('is-active');
  });
}

function openWorkflow(engineId) {
  document.body.classList.remove('is-puzzle-chooser');
  $('puzzle-launcher-panel')?.setAttribute('hidden', '');
  setActiveEngine(engineId);
  const setupButton = document.querySelector('.panel-nav-button[data-panel="build"]');
  setupButton?.click();
}

function setActiveEngine(engineId) {
  activeEngine = getPuzzleEngine(engineId);
  window.__artifexActivePuzzleEngine = activeEngine;
  window.__artifexPuzzleEngineValues = engineValues;
  document.querySelectorAll('.engine-button[data-engine]').forEach((button) => button.classList.toggle('is-active', button.dataset.engine === activeEngine.id));
  if ($('active-engine-title')) $('active-engine-title').textContent = activeEngine.label;
  if ($('active-engine-purpose')) $('active-engine-purpose').textContent = activeEngine.purpose;
  if ($('playable-label')) $('playable-label').textContent = `${activeEngine.label} Preview`;
  if ($('module-id')) $('module-id').value = activeEngine.defaultModuleId;
  if ($('calling-text')) $('calling-text').value = activeEngine.callingText;
  if ($('gameplay-mode') && activeEngine.mode) $('gameplay-mode').value = activeEngine.mode;
  renderFields(activeEngine);
  drawEnginePreviewBadge(activeEngine);
}

function renderFields(engine) {
  const host = $('engine-fields');
  if (!host) return;
  host.innerHTML = '';
  engineValues[engine.id] ||= {};
  engine.fields.forEach((field) => {
    if (engineValues[engine.id][field.key] === undefined) engineValues[engine.id][field.key] = field.value;
    const label = document.createElement('label');
    label.className = 'field-block engine-field';
    const title = document.createElement('span');
    title.textContent = field.label;
    label.appendChild(title);
    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      field.options.forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        input.appendChild(option);
      });
    } else {
      input = document.createElement('input');
      input.type = field.type || 'text';
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      if (field.step !== undefined) input.step = field.step;
    }
    input.value = engineValues[engine.id][field.key];
    input.dataset.engineField = field.key;
    input.addEventListener('input', () => {
      engineValues[engine.id][field.key] = input.type === 'range' ? Number(input.value) : input.value;
      drawEnginePreviewBadge(activeEngine);
    });
    label.appendChild(input);
    host.appendChild(label);
  });
}

function bindImageContrastVisibility() {
  const upload = $('image-upload');
  const group = $('image-contrast-group');
  if (!upload || !group) return;
  const update = () => { group.hidden = !(upload.files && upload.files.length); };
  upload.addEventListener('change', update);
  update();
}

function drawEnginePreviewBadge(engine) {
  if (!engine) return;
  setTimeout(() => {
    const canvas = $('maze-preview-canvas');
    if (!canvas || document.body.classList.contains('is-puzzle-chooser')) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const ratio = canvas.width / Math.max(1, rect.width);
    ctx.save();
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = 'rgba(2, 10, 5, .74)';
    ctx.strokeStyle = engine.preview?.accent || '#9ee6a4';
    ctx.lineWidth = 1;
    rounded(ctx, 18, 18, 240, 58, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e9dcc1';
    ctx.font = '700 15px Inter, sans-serif';
    ctx.fillText(engine.label, 58, 41);
    ctx.fillStyle = engine.preview?.accent || '#9ee6a4';
    ctx.font = '700 26px Inter, sans-serif';
    ctx.fillText(engine.icon, 29, 45);
    ctx.restore();
  }, 30);
}

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
}

function patchExportPayload() {
  window.__artifexAugmentPuzzlePayload = (payload) => ({
    ...payload,
    engine: activeEngine ? {
      id: activeEngine.id,
      label: activeEngine.label,
      moduleType: activeEngine.moduleType,
      mode: activeEngine.mode,
      values: engineValues[activeEngine.id] || {}
    } : null
  });
}
