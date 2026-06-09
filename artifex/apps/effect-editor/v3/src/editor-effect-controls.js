import { getActiveLayer, updateActiveLayer } from './editor-state.js';

const LAYER_POSITION_OPTIONS = [
  ['back', 'Behind aperture'], ['aperture', 'Inside aperture'], ['rim-back', 'Behind cloudy rim'],
  ['rim-front', 'Above cloudy rim'], ['particles-front', 'Above particles'], ['front', 'Topmost']
];
const COLOR_MODE_OPTIONS = [['solid-a', 'Solid Colour A'], ['solid-b', 'Solid Colour B'], ['blend', '50/50 blend'], ['animated', 'Animated blend']];
const C = {
  r: (property, label, min, max, step = 1) => ({ property, label, type: 'range', min, max, step }),
  s: (property, label, options) => ({ property, label, type: 'select', options }),
  b: (property, label) => ({ property, label, type: 'checkbox' }),
  c: (property, label) => ({ property, label, type: 'color' }),
  g: (title, controls) => ({ title, controls })
};
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
const STRUCTURED_ENGINE_CONTROLS = {
  'portal-ring': [
    C.g('Portal Aperture / Middle', [C.r('effectScale', 'Overall scale', 8, 120), C.r('apertureOpacity', 'Aperture opacity', 0, 100), C.r('apertureRadius', 'Aperture radius', 30, 120), C.c('apertureColor', 'Aperture colour')]),
    C.g('Cloudy Rim Body', [C.r('rimAmount', 'Rim amount', 0, 80), C.r('rimOpacity', 'Rim opacity', 0, 100), C.r('rimThickness', 'Rim thickness', 4, 55), C.r('rimRadius', 'Rim radius', 35, 120), C.r('rimSoftness', 'Rim softness', 0, 70), C.r('rimSpeed', 'Rim speed', 0, 80)]),
    C.g('Portal Inner Wisps', [C.r('innerWispAmount', 'Amount', 0, 24), C.r('innerWispOpacity', 'Opacity', 0, 100), C.r('innerWispThickness', 'Thickness', 0, 16, 0.1), C.r('innerWispGlow', 'Glow', 0, 70), C.r('innerWispSpeed', 'Speed', 0, 80), C.r('innerWispCurl', 'Curl / wave amount', 0, 100), C.r('innerWispVerticalSpread', 'Vertical spread', 0, 100), C.c('innerWispColorA', 'Colour A'), C.c('innerWispColorB', 'Colour B'), C.s('innerWispLayerPosition', 'Layer position', LAYER_POSITION_OPTIONS)]),
    C.g('Portal Line Outline', [C.r('outlineThickness', 'Thickness', 0, 18, 0.1), C.r('outlineOpacity', 'Opacity', 0, 100), C.r('outlineGlow', 'Glow', 0, 100), C.r('outlineRadius', 'Radius', 40, 130), C.r('outlinePulseStrength', 'Pulse strength', 0, 100), C.r('outlinePulseSpeed', 'Pulse speed', 0, 80), C.s('outlineColorMode', 'Colour mode', COLOR_MODE_OPTIONS), C.c('outlineColorA', 'Colour A'), C.c('outlineColorB', 'Colour B'), C.s('outlineLayerPosition', 'Layer position', LAYER_POSITION_OPTIONS)]),
    C.g('Orbit Clouds', [C.r('cloudAmount', 'Cloud amount', 0, 72), C.r('cloudOpacity', 'Cloud opacity', 0, 100), C.r('cloudSize', 'Cloud size', 2, 55), C.r('orbitRadius', 'Orbit radius', 8, 150), C.r('cloudStagger', 'Cloud stagger', 0, 100), C.r('cloudPulseStrength', 'Cloud pulse strength', 0, 100), C.r('cloudOrbitSpeed', 'Cloud orbit speed', 0, 80)]),
    C.g('Particles', [C.r('particleAmount', 'Particle amount', 0, 90), C.r('particleOpacity', 'Particle opacity', 0, 100), C.r('particleSpeed', 'Particle speed', 0, 80), C.r('particleSpread', 'Particle spread', 20, 130), C.r('particleSize', 'Particle size', 0, 24, 0.1), C.r('particleGlow', 'Particle glow', 0, 60), C.r('particlePulseStrength', 'Particle pulse strength', 0, 100)])
  ],
  'wormhole-tunnel': [
    C.g('Wormhole Core', [C.r('effectScale', 'Overall scale', 8, 120), C.r('coreOpacity', 'Core opacity', 0, 100), C.r('coreRadius', 'Core radius', 4, 70), C.r('corePulseStrength', 'Core pulse strength', 0, 100)]),
    C.g('Arms / Nebula Bands', [C.r('armAmount', 'Arm amount', 0, 72), C.r('armOpacity', 'Arm opacity', 0, 100), C.r('armThickness', 'Arm thickness', 3, 80), C.r('armRadius', 'Arm radius', 8, 125), C.r('armSoftness', 'Arm softness', 0, 100), C.r('armDefinition', 'Arm definition', 5, 100), C.r('armPulseStrength', 'Arm pulse strength', 0, 100), C.r('armRotationSpeed', 'Arm rotation speed', 0, 80), C.r('armCurlTurns', 'Arm curl / turns', 0, 100)]),
    C.g('Orbit Clouds', [C.r('cloudAmount', 'Cloud amount', 0, 72), C.r('cloudOpacity', 'Cloud opacity', 0, 100), C.r('cloudSize', 'Cloud size', 2, 55), C.r('orbitRadius', 'Orbit radius', 8, 150), C.r('cloudStagger', 'Cloud stagger', 0, 100), C.r('cloudPulseStrength', 'Cloud pulse strength', 0, 100), C.r('cloudOrbitSpeed', 'Cloud orbit speed', 0, 80)]),
    C.g('Particles', [C.r('particleAmount', 'Particle amount', 0, 90), C.r('particleOpacity', 'Particle opacity', 0, 100), C.r('particleSpeed', 'Particle speed', 0, 80), C.r('particleSpread', 'Particle spread', 8, 130), C.r('particleSize', 'Particle size', 0, 18, 0.1), C.r('particleGlow', 'Particle glow', 0, 50), C.r('particlePulseStrength', 'Particle pulse strength', 0, 100)]),
    C.g('Emission', [C.r('emissionAmount', 'Emission amount', 0, 60), C.r('emissionOpacity', 'Emission opacity', 0, 100), C.r('emissionSpeed', 'Emission speed', 0, 80), C.r('emissionDirection', 'Emission direction', 0, 360), C.b('emissionVacuum', 'Vacuum / suck inward'), C.r('emissionTrailLength', 'Trail length', 0, 150), C.r('emissionTrailOpacity', 'Trail opacity', 0, 100)])
  ]
};
const TEXT_CONTROLS = [
  { property: 'textContent', label: 'Text Content', type: 'textarea', rows: 4, action: 'uppercase' },
  { property: 'textFont', label: 'Font', type: 'select', options: [['Cinzel, Georgia, serif', 'Cinzel / Fantasy Serif'], ['Georgia, serif', 'Georgia Serif'], ['Garamond, serif', 'Garamond Serif'], ['Arial, sans-serif', 'Arial Sans'], ['monospace', 'Monospace']] },
  { property: 'textWeight', label: 'Font Weight', type: 'select', options: [['400', 'Regular'], ['500', 'Medium'], ['700', 'Bold'], ['900', 'Black']] },
  { property: 'textLetterSpacing', label: 'Letter Spacing', type: 'range', min: 0, max: 18, step: 0.1 },
  { property: 'textBlockWidth', label: 'Block Width / Wrap', type: 'range', min: 0, max: 900, step: 10 },
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
  if (key !== renderedKey) { renderedKey = key; renderControls(body, layer); }
  syncValues(body, layer);
}

function renderControls(body, layer) {
  body.replaceChildren();
  if (!layer) return body.append(paragraph('Select a layer to see engine controls.'));
  const groups = getControlGroups(layer);
  if (!groups.length) return body.append(paragraph('This engine has no extra controls yet.'));
  groups.forEach((group) => body.append(group.title ? buildGroup(group, layer) : fragment(group.controls.map((control) => buildControl(control, layer)))));
}
function getControlGroups(layer) {
  if (isTextLayer(layer)) return [{ controls: TEXT_CONTROLS.filter((control) => !control.revealModes || control.revealModes.includes(layer.textRevealMode || 'all')) }];
  if (STRUCTURED_ENGINE_CONTROLS[layer.engine]) return STRUCTURED_ENGINE_CONTROLS[layer.engine];
  const controls = (ENGINE_CONTROLS[layer.engine] || []).map(([property, label, min, max, step]) => ({ property, label, type: 'range', min, max, step }));
  return controls.length ? [{ controls }] : [];
}
function buildGroup(group, layer) {
  const section = document.createElement('section');
  section.className = 'index2-effect-control-group';
  const h = document.createElement('h4');
  h.textContent = group.title;
  section.append(h, ...group.controls.map((control) => buildControl(control, layer)));
  return section;
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
    if (control.action === 'uppercase') {
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'index2-inline-action';
      action.textContent = 'ALL CAPS';
      action.title = 'Convert this text layer content to uppercase.';
      action.addEventListener('click', () => convertTextToUppercase(input));
      heading.append(action);
    }
  } else if (control.type === 'select') {
    input = document.createElement('select');
    control.options.forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      input.append(option);
    });
    input.value = String(layer[control.property] ?? control.options[0]?.[0] ?? '');
  } else if (control.type === 'checkbox') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = Boolean(layer[control.property]);
  } else if (control.type === 'color') {
    input = document.createElement('input');
    input.type = 'color';
    input.value = normalizeColor(layer[control.property] || '#4ff7ff');
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
  return label;
}
function fragment(nodes) { const frag = document.createDocumentFragment(); nodes.forEach((node) => frag.append(node)); return frag; }
function convertTextToUppercase(input) { const upper = String(input.value || '').toUpperCase(); input.value = upper; updateActiveLayer({ [input.dataset.effectProperty]: upper }); }
function updateFromInput(input) { let value = input.value; if (input.type === 'range' || input.type === 'number') value = Number(input.value); if (input.type === 'checkbox') value = input.checked; updateActiveLayer({ [input.dataset.effectProperty]: value }); }
function syncValues(body, layer) {
  if (!layer) return;
  body.querySelectorAll('[data-effect-property]').forEach((input) => {
    const value = layer[input.dataset.effectProperty];
    if (document.activeElement !== input) {
      if (input.type === 'checkbox') input.checked = Boolean(value);
      else if (input.type === 'color') input.value = normalizeColor(value);
      else input.value = String(value ?? '');
    }
    const output = body.querySelector(`[data-output-property="${input.dataset.effectProperty}"]`);
    if (output) output.textContent = formatValue(value);
  });
}
function isTextLayer(layer) { return Boolean(layer && (layer.engine === 'text' || (layer.appearanceMode === 'shape' && layer.particleShape === 'text'))); }
function paragraph(text) { const p = document.createElement('p'); p.className = 'index2-control-empty'; p.textContent = text; return p; }
function formatValue(value) { const number = Number(value); if (!Number.isFinite(number)) return '0'; return Number.isInteger(number) ? String(number) : String(Number(number.toFixed(2))); }
function normalizeColor(value) { const string = String(value || '').trim(); if (/^#[0-9a-f]{6}$/iu.test(string)) return string; if (/^#[0-9a-f]{3}$/iu.test(string)) return `#${string.slice(1).split('').map((char) => char + char).join('')}`; return '#4ff7ff'; }
