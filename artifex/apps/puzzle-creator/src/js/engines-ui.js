import { puzzleEngines, getPuzzleEngine } from './engines/index.js';

const $ = (id) => document.getElementById(id);
let activeEngine = getPuzzleEngine('arena-trial');
const engineValues = {};

window.addEventListener('DOMContentLoaded', () => {
  buildEngineButtons();
  setActiveEngine(activeEngine.id);
  bindImageContrastVisibility();
  patchExportPayload();
});

function buildEngineButtons() {
  const host = $('engine-switcher');
  if (!host) return;
  host.innerHTML = '';
  puzzleEngines.forEach((engine) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'engine-button';
    button.dataset.engine = engine.id;
    button.title = engine.purpose;
    button.innerHTML = `<span class="engine-icon">${engine.icon}</span><span>${engine.label}</span>`;
    button.addEventListener('click', () => setActiveEngine(engine.id));
    host.appendChild(button);
  });
}

function setActiveEngine(engineId) {
  activeEngine = getPuzzleEngine(engineId);
  window.__artifexActivePuzzleEngine = activeEngine;
  window.__artifexPuzzleEngineValues = engineValues;

  document.querySelectorAll('.engine-button').forEach((button) => button.classList.toggle('is-active', button.dataset.engine === activeEngine.id));
  if ($('active-engine-title')) $('active-engine-title').textContent = activeEngine.label;
  if ($('active-engine-purpose')) $('active-engine-purpose').textContent = activeEngine.purpose;
  if ($('playable-label')) $('playable-label').textContent = `${activeEngine.label} Preview`;

  if ($('module-id')) $('module-id').value = activeEngine.defaultModuleId;
  if ($('calling-text')) $('calling-text').value = activeEngine.callingText;
  if ($('gameplay-mode')) $('gameplay-mode').value = activeEngine.mode;

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
  const canvas = $('maze-preview-canvas');
  if (!canvas) return;
  setTimeout(() => {
    const ctx = canvas.getContext('2d');
    const r = canvas.getBoundingClientRect();
    const ratio = canvas.width / Math.max(1, r.width);
    ctx.save();
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = 'rgba(2, 10, 5, .74)';
    ctx.strokeStyle = engine.preview?.accent || '#9ee6a4';
    ctx.lineWidth = 1;
    rounded(ctx, 18, 18, 220, 58, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e9dcc1';
    ctx.font = '700 15px Inter, sans-serif';
    ctx.fillText(engine.label, 54, 41);
    ctx.fillStyle = engine.preview?.accent || '#9ee6a4';
    ctx.font = '700 26px Inter, sans-serif';
    ctx.fillText(engine.icon, 29, 45);
    ctx.restore();
  }, 20);
}

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function patchExportPayload() {
  const downloadButton = $('btn-export-json');
  const copyButton = $('btn-copy-json');
  const augment = (payload) => ({
    ...payload,
    engine: {
      id: activeEngine.id,
      label: activeEngine.label,
      moduleType: activeEngine.moduleType,
      mode: activeEngine.mode,
      values: engineValues[activeEngine.id] || {}
    }
  });
  window.__artifexAugmentPuzzlePayload = augment;
  [downloadButton, copyButton].forEach((button) => button?.addEventListener('click', () => {
    window.__artifexActivePuzzleEngine = activeEngine;
    window.__artifexPuzzleEngineValues = engineValues;
  }, true));
}
