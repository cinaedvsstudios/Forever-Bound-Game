import { getActiveLayer, onStateChange, updateActiveLayer } from './editor-state.js';

export function initV322TextControls() {
  injectStyles();
  installTextControls();
  onStateChange(installTextControls);
}

function injectStyles() {
  if (document.getElementById('v322-text-controls-style')) return;
  const style = document.createElement('style');
  style.id = 'v322-text-controls-style';
  style.textContent = `
    .text-extra-controls-v322 {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 9px;
      border: 1px solid rgba(0,174,234,.28);
      border-radius: 14px;
      background: rgba(0,174,234,.06);
    }
    .text-extra-controls-v322 label { margin: 0; }
    .text-extra-controls-v322 select { font-size: 10px !important; font-weight: 400 !important; }
    .text-extra-controls-v322 .wide { grid-column: 1 / -1; }
  `;
  document.head.append(style);
}

function installTextControls() {
  const layer = getActiveLayer();
  const grid = document.getElementById('effect-specific-grid');
  removeLegacyTextTools();
  if (!grid || !isTextLayer(layer)) return;
  if (document.getElementById('text-extra-controls-v322')) {
    syncTextControls(layer);
    return;
  }

  const controls = document.createElement('div');
  controls.id = 'text-extra-controls-v322';
  controls.className = 'text-extra-controls-v322';
  controls.innerHTML = `
    <label>Emission
      <select id="text-emission-mode-v322" title="Choose whether this text emits once, loops in bursts, or streams continuously.">
        <option value="once">Once</option>
        <option value="loop">Loop</option>
        <option value="continuous">Continuous</option>
      </select>
    </label>
    <label>Direction
      <select id="text-direction-v322" title="Choose whether the spawned text rises, falls, stays still, or drifts.">
        <option value="rise">Rise</option>
        <option value="fall">Fall</option>
        <option value="static">Static</option>
        <option value="drift">Drift</option>
      </select>
    </label>
    <label>Reveal
      <select id="text-reveal-v322" title="Choose whether text spawns as a block, line by line, or individual characters.">
        <option value="all">All Text</option>
        <option value="line">Line by Line</option>
        <option value="character">Character Spray</option>
      </select>
    </label>
    <label>Scatter
      <input id="text-scatter-v322" type="range" min="0" max="160" step="1" value="0" title="How far spawned text pieces can separate from the origin." />
      <output>0</output>
    </label>
    <label>Lifetime Bias
      <select id="text-lifetime-bias-v322" title="Make text particles fade sooner or remain longer.">
        <option value="short">Short</option>
        <option value="normal">Normal</option>
        <option value="long">Long</option>
      </select>
    </label>
    <label class="wide">Keep Block Together
      <button id="text-keep-block-v322" type="button" title="Keep multiline text together as a block instead of scattering pieces.">✅</button>
    </label>
  `;
  grid.append(controls);
  bindControls();
  syncTextControls(layer);
}

function bindControls() {
  const emission = document.getElementById('text-emission-mode-v322');
  const direction = document.getElementById('text-direction-v322');
  const reveal = document.getElementById('text-reveal-v322');
  const scatter = document.getElementById('text-scatter-v322');
  const bias = document.getElementById('text-lifetime-bias-v322');
  const keep = document.getElementById('text-keep-block-v322');

  emission?.addEventListener('change', () => updateActiveLayer({ textEmissionMode: emission.value }));
  direction?.addEventListener('change', () => updateActiveLayer({ textDirection: direction.value }));
  reveal?.addEventListener('change', () => updateActiveLayer({ textRevealMode: reveal.value }));
  scatter?.addEventListener('input', () => {
    const value = Number(scatter.value) || 0;
    scatter.parentElement.querySelector('output').textContent = String(value);
    updateActiveLayer({ textScatter: value });
  });
  bias?.addEventListener('change', () => updateActiveLayer({ textLifetimeBias: bias.value }));
  keep?.addEventListener('click', () => {
    const next = !(getActiveLayer()?.textKeepBlockTogether !== false);
    keep.textContent = next ? '✅' : '⬜';
    updateActiveLayer({ textKeepBlockTogether: next });
  });
}

function syncTextControls(layer) {
  setValue('text-emission-mode-v322', layer.textEmissionMode || 'loop');
  setValue('text-direction-v322', layer.textDirection || 'rise');
  setValue('text-reveal-v322', layer.textRevealMode || 'all');
  setValue('text-scatter-v322', Number(layer.textScatter || 0));
  setTextForOutput('text-scatter-v322', Number(layer.textScatter || 0));
  setValue('text-lifetime-bias-v322', layer.textLifetimeBias || 'normal');
  const keep = document.getElementById('text-keep-block-v322');
  if (keep) keep.textContent = layer.textKeepBlockTogether === false ? '⬜' : '✅';
}

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element && document.activeElement !== element && String(element.value) !== String(value)) element.value = value;
}

function setTextForOutput(id, value) {
  const output = document.getElementById(id)?.parentElement?.querySelector('output');
  if (output) output.textContent = String(value);
}

function removeLegacyTextTools() {
  const legacy = document.getElementById('text-tools-v314');
  if (legacy) legacy.remove();
}

function isTextLayer(layer) {
  return Boolean(layer && ((layer.appearanceMode === 'shape' && layer.particleShape === 'text') || layer.engine === 'text'));
}
