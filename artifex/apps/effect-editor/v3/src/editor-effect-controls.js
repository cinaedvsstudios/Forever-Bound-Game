import { getActiveLayer, updateActiveLayer } from './editor-state.js';

const ENGINE_CONTROLS = {
  lightning: [['arcLength', 'Arc Length', 10, 260, 1], ['arcBranches', 'Branches', 0, 12, 1], ['arcJaggedness', 'Jaggedness', 0, 60, 1], ['arcFlicker', 'Flicker', 0, 1, 0.01]],
  'electric-arc': [['arcLength', 'Arc Length', 10, 260, 1], ['arcBranchLength', 'Branch Length', 0, 120, 1], ['arcJaggedness', 'Jaggedness', 0, 60, 1], ['arcFlicker', 'Flicker', 0, 1, 0.01]],
  shockwave: [['shockwaveRadius', 'Radius', 10, 620, 1], ['shockwaveStartRadius', 'Start Radius', 0, 120, 1], ['shockwaveThickness', 'Thickness', 1, 80, 1], ['shockwaveCenterFlash', 'Center Flash', 0, 1, 0.01]],
  refraction: [['distortionStrength', 'Distortion Strength', 0, 80, 1], ['distortionScale', 'Distortion Scale', 1, 120, 1], ['noiseGrain', 'Noise Grain', 0, 1, 0.01]],
  heatdistortion: [['distortionStrength', 'Distortion Strength', 0, 80, 1], ['distortionScale', 'Distortion Scale', 1, 120, 1], ['noiseGrain', 'Noise Grain', 0, 1, 0.01]],
  lensflare: [['flareStreakLength', 'Streak Length', 0, 900, 1], ['flareGhosts', 'Ghosts', 0, 12, 1], ['flareHalo', 'Halo', 0, 260, 1], ['flareOverlayOpacity', 'Overlay Opacity', 0, 1, 0.01]],
  'true-lensflare': [['flareStreakLength', 'Streak Length', 0, 900, 1], ['flareGhosts', 'Ghosts', 0, 12, 1], ['flareHalo', 'Halo', 0, 260, 1], ['flareOverlayOpacity', 'Overlay Opacity', 0, 1, 0.01]],
  gas: [['noiseGrain', 'Noise Grain', 0, 1, 0.01], ['edgeBlur', 'Edge Blur', 0, 60, 1], ['textureContrast', 'Texture Contrast', 0, 3, 0.01]],
  ribbon: [['friction', 'Friction', 0, 1, 0.01], ['orbitalForce', 'Orbital Force', -2, 2, 0.01], ['emitterWidth', 'Emitter Width', 0, 720, 1]],
  projectile: [['friction', 'Friction', 0, 1, 0.01], ['targetX', 'Target X', 0, 1280, 1], ['targetY', 'Target Y', 0, 720, 1]]
};
const TEXT_CONTROLS = [
  { property: 'textContent', label: 'Text Content', type: 'textarea', rows: 4 },
  { property: 'textFont', label: 'Font', type: 'select', options: [['Cinzel, Georgia, serif', 'Cinzel / Fantasy Serif'], ['Georgia, serif', 'Georgia Serif'], ['Garamond, serif', 'Garamond Serif'], ['Arial, sans-serif', 'Arial Sans'], ['monospace', 'Monospace']] },
  { property: 'textWeight', label: 'Font Weight', type: 'select', options: [['400', 'Regular'], ['500', 'Medium'], ['700', 'Bold'], ['900', 'Black']] },
  { property: 'textLetterSpacing', label: 'Letter Spacing', type: 'range', min: 0, max: 18, step: 0.1 },
  { property: 'textLineSpacing', label: 'Line Spacing', type: 'range', min: 0.7, max: 2.4, step: 0.05 },
  { property: 'textGeneralSpeed', label: 'General Speed', type: 'range', min: 0.25, max: 3, step: 0.05 },
  { property: 'textBlockDelay', label: 'Delay Between Text Blocks', type: 'range', min: 1, max: 240, step: 1 },
  { property: 'textLineDelay', label: 'Delay Between Lines', type: 'range', min: 1, max: 120, step: 1 },
  { property: 'textCharacterDelay', label: 'Delay Between Characters', type: 'range', min: 1, max: 90, step: 1, revealModes: ['character'] },
  { property: 'textRevealMode', label: 'Reveal Mode', type: 'select', options: [['all', 'All Text'], ['line', 'Line by Line'], ['character', 'Character Spray']] },
  { property: 'textDirection', label: 'Direction', type: 'select', options: [['rise', 'Rise'], ['fall', 'Fall'], ['static', 'Static'], ['drift', 'Drift']] },
  { property: 'textDensity', label: 'Text Density', type: 'range', min: 0, max: 10, step: 0.1 },
  { property: 'textSpawnDelay', label: 'Spawn Delay', type: 'range', min: 0, max: 240, step: 1 },
  { property: 'textScatter', label: 'Scatter', type: 'range', min: 0, max: 180, step: 1 },
  { property: 'textLifetimeBias', label: 'Lifetime Bias', type: 'select', options: [['short', 'Short'], ['normal', 'Normal'], ['long', 'Long']] },
  { property: 'textKeepBlockTogether', label: 'Keep Block Together', type: 'checkbox' }
];
let renderedKey = '';

export function syncEffectControls() {
  const body = document.getElementById('effect-specific-controls-body');
  if (!body) return;
  const layer = getActiveLayer();
  const key = layer ? `${layer.id}|${isTextLayer(layer) ? 'text' : layer.engine}|${layer.textRevealMode || ''}` : 'none';
  if (key !== renderedKey) {
    renderedKey = key;
    renderControls(body, layer);
  }
  syncValues(body, layer);
}

function renderControls(body, layer) {
  body.replaceChildren();
  if (!layer) {
    body.append(paragraph('Select a layer to see engine controls.'));
    return;
  }
  const controls = getControls(layer);
  if (!controls.length) {
    body.append(paragraph('This engine has no extra controls yet.'));
    return;
  }
  if (isTextLayer(layer)) {
    const note = paragraph('Text is drawn using only the line breaks entered below. Size changes will not re-wrap it.');
    note.className = 'index2-control-note';
    body.append(note);
  }
  controls.forEach((control) => body.append(buildControl(control, layer)));
}

function getControls(layer) {
  if (isTextLayer(layer)) return TEXT_CONTROLS.filter((control) => !control.revealModes || control.revealModes.includes(layer.textRevealMode || 'all'));
  return (ENGINE_CONTROLS[layer.engine] || []).map(([property, label, min, max, step]) => ({ property, label, type: 'range', min, max, step }));
}

function buildControl(control, layer) {
  const label = document.createElement('label');
  label.className = 'index2-effect-control';
  const heading = document.createElement('span');
  const name = document.createElement('b');
  name.textContent = control.label;
  heading.append(name);
  let input;
  if (control.type === 'textarea') {
    input = document.createElement('textarea');
    input.rows = control.rows || 3;
    input.value = layer[control.property] || '';
  } else if (control.type === 'select') {
    input = document.createElement('select');
    control.options.forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      input.append(option);
    });
    input.value = String(layer[control.property] ?? '');
  } else if (control.type === 'checkbox') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = layer[control.property] !== false;
  } else {
    input = document.createElement('input');
    input.type = 'range';
    input.min = String(control.min);
    input.max = String(control.max);
    input.step = String(control.step);
    input.value = String(layer[control.property] ?? 0);
    const output = document.createElement('output');
    output.dataset.outputProperty = control.property;
    output.textContent = formatValue(layer[control.property]);
    heading.append(output);
  }
  input.dataset.effectProperty = control.property;
  input.addEventListener('input', () => updateFromInput(input));
  input.addEventListener('change', () => updateFromInput(input));
  label.append(heading, input);
  if (control.property === 'textContent') label.append(buildUppercaseAction(input));
  return label;
}

function buildUppercaseAction(textarea) {
  const row = document.createElement('span');
  row.className = 'index2-text-actions';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'index2-text-action';
  button.textContent = 'ALL CAPS';
  button.title = 'Convert text content to uppercase';
  button.addEventListener('click', () => {
    const next = String(textarea.value || '').toUpperCase();
    textarea.value = next;
    updateActiveLayer({ textContent: next });
  });
  row.append(button);
  return row;
}

function updateFromInput(input) {
  let value = input.value;
  if (input.type === 'range' || input.type === 'number') value = Number(input.value);
  if (input.type === 'checkbox') value = input.checked;
  updateActiveLayer({ [input.dataset.effectProperty]: value });
}

function syncValues(body, layer) {
  if (!layer) return;
  body.querySelectorAll('[data-effect-property]').forEach((input) => {
    const value = layer[input.dataset.effectProperty];
    if (document.activeElement !== input) {
      if (input.type === 'checkbox') input.checked = value !== false;
      else input.value = String(value ?? '');
    }
    const output = body.querySelector(`[data-output-property="${input.dataset.effectProperty}"]`);
    if (output) output.textContent = formatValue(value);
  });
}

function isTextLayer(layer) {
  return Boolean(layer && (layer.engine === 'text' || (layer.appearanceMode === 'shape' && layer.particleShape === 'text')));
}
function paragraph(text) {
  const p = document.createElement('p');
  p.className = 'index2-control-empty';
  p.textContent = text;
  return p;
}
function formatValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return Number.isInteger(number) ? String(number) : String(Number(number.toFixed(2)));
}
