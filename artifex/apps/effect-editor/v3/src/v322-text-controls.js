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
    .text-extra-controls-v322 .is-hidden { display: none !important; }
  `;
  document.head.append(style);
}

function installTextControls() {
  const layer = getActiveLayer();
  const grid = document.getElementById('effect-specific-grid');
  removeLegacyTextTools();
  repairCustomControlsPanel();
  if (!grid || !isTextLayer(layer)) return;
  if (document.getElementById('text-extra-controls-v322')) {
    syncTextControls(layer);
    return;
  }

  const controls = document.createElement('div');
  controls.id = 'text-extra-controls-v322';
  controls.className = 'text-extra-controls-v322';
  controls.innerHTML = `
    <label>Text Density
      <input id="text-density-input-v322" type="range" min="1" max="10" step="0.1" value="4" title="How much text is emitted per burst or stream." />
      <output>4</output>
    </label>
    <label>General Speed
      <input id="text-general-speed-v322" type="range" min="0.25" max="3" step="0.05" value="1" title="Overall movement speed for text particles." />
      <output>1</output>
    </label>
    <label>Emission
      <select id="text-emission-mode-v322" title="Choose whether this text emits once, loops in bursts, or streams continuously.">
        <option value="once">Once</option>
        <option value="loop">Loop</option>
        <option value="continuous">Continuous</option>
      </select>
    </label>
    <label>Block Delay
      <input id="text-block-delay-v322" type="range" min="1" max="240" step="1" value="48" title="Delay between full text blocks or between repeated line/character cycles." />
      <output>48</output>
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
    <label id="text-line-delay-label-v322">Line Delay
      <input id="text-line-delay-v322" type="range" min="1" max="120" step="1" value="6" title="Delay between each line when Reveal is Line by Line." />
      <output>6</output>
    </label>
    <label id="text-character-delay-label-v322">Character Delay
      <input id="text-character-delay-v322" type="range" min="1" max="90" step="1" value="2" title="Delay between each character when Reveal is Character Spray." />
      <output>2</output>
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
  const density = document.getElementById('text-density-input-v322');
  const generalSpeed = document.getElementById('text-general-speed-v322');
  const emission = document.getElementById('text-emission-mode-v322');
  const blockDelay = document.getElementById('text-block-delay-v322');
  const direction = document.getElementById('text-direction-v322');
  const reveal = document.getElementById('text-reveal-v322');
  const lineDelay = document.getElementById('text-line-delay-v322');
  const characterDelay = document.getElementById('text-character-delay-v322');
  const scatter = document.getElementById('text-scatter-v322');
  const bias = document.getElementById('text-lifetime-bias-v322');
  const keep = document.getElementById('text-keep-block-v322');

  bindRange(density, (value) => updateActiveLayer({ textDensity: value, spawnRate: value }));
  bindRange(generalSpeed, (value) => updateActiveLayer({ textGeneralSpeed: value }));
  emission?.addEventListener('change', () => updateActiveLayer({ textEmissionMode: emission.value }));
  bindRange(blockDelay, (value) => updateActiveLayer({ textBlockDelay: Math.round(value), textSpawnDelay: Math.round(value) }));
  direction?.addEventListener('change', () => updateActiveLayer({ textDirection: direction.value }));
  reveal?.addEventListener('change', () => updateActiveLayer({ textRevealMode: reveal.value }));
  bindRange(lineDelay, (value) => updateActiveLayer({ textLineDelay: Math.round(value) }));
  bindRange(characterDelay, (value) => updateActiveLayer({ textCharacterDelay: Math.round(value) }));
  bindRange(scatter, (value) => updateActiveLayer({ textScatter: Math.round(value) }));
  bias?.addEventListener('change', () => updateActiveLayer({ textLifetimeBias: bias.value }));
  keep?.addEventListener('click', () => {
    const next = !(getActiveLayer()?.textKeepBlockTogether !== false);
    keep.textContent = next ? '✅' : '⬜';
    updateActiveLayer({ textKeepBlockTogether: next });
  });
}

function bindRange(input, update) {
  input?.addEventListener('input', () => {
    const value = Number(input.value) || 0;
    setTextForOutput(input.id, format(value));
    update(value);
  });
}

function syncTextControls(layer) {
  repairCustomControlsPanel();
  const reveal = layer.textRevealMode || 'all';
  setValue('text-density-input-v322', Number(layer.textDensity || layer.spawnRate || 4));
  setTextForOutput('text-density-input-v322', format(Number(layer.textDensity || layer.spawnRate || 4)));
  setValue('text-general-speed-v322', Number(layer.textGeneralSpeed || 1));
  setTextForOutput('text-general-speed-v322', format(Number(layer.textGeneralSpeed || 1)));
  setValue('text-emission-mode-v322', layer.textEmissionMode || 'loop');
  setValue('text-block-delay-v322', Number(layer.textBlockDelay || layer.textSpawnDelay || 48));
  setTextForOutput('text-block-delay-v322', format(Number(layer.textBlockDelay || layer.textSpawnDelay || 48)));
  setValue('text-direction-v322', layer.textDirection || 'rise');
  setValue('text-reveal-v322', reveal);
  setValue('text-line-delay-v322', Number(layer.textLineDelay || 6));
  setTextForOutput('text-line-delay-v322', format(Number(layer.textLineDelay || 6)));
  setValue('text-character-delay-v322', Number(layer.textCharacterDelay || 2));
  setTextForOutput('text-character-delay-v322', format(Number(layer.textCharacterDelay || 2)));
  setValue('text-scatter-v322', Number(layer.textScatter || 0));
  setTextForOutput('text-scatter-v322', format(Number(layer.textScatter || 0)));
  setValue('text-lifetime-bias-v322', layer.textLifetimeBias || 'normal');
  setConditionalDelayVisibility(reveal);
  const keep = document.getElementById('text-keep-block-v322');
  if (keep) keep.textContent = layer.textKeepBlockTogether === false ? '⬜' : '✅';
}

function repairCustomControlsPanel() {
  const card = document.getElementById('effect-specific-controls-card');
  const heading = card?.querySelector('h2');
  if (card && !card.classList.contains('is-hidden') && heading) heading.textContent = 'Custom Controls';

  const jumpButton = getCustomControlsJumpButton();
  if (!jumpButton || jumpButton.dataset.customControlsJumpBound === 'true') return;
  jumpButton.dataset.customControlsJumpBound = 'true';
  jumpButton.title = 'Jump to Custom Controls.';
  jumpButton.addEventListener('click', () => {
    const panel = document.getElementById('effect-specific-controls-card');
    if (!panel || panel.classList.contains('is-hidden')) return;
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    panel.classList.add('is-cyan-selected');
    setTimeout(() => panel.classList.remove('is-cyan-selected'), 900);
  });
}

function getCustomControlsJumpButton() {
  const buttons = Array.from(document.querySelectorAll('#left-card-jumpbar button'));
  return buttons[buttons.length - 1] || null;
}

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element && document.activeElement !== element && String(element.value) !== String(value)) element.value = value;
}

function setTextForOutput(id, value) {
  const output = document.getElementById(id)?.parentElement?.querySelector('output');
  if (output) output.textContent = String(value);
}

function setConditionalDelayVisibility(reveal) {
  document.getElementById('text-line-delay-label-v322')?.classList.toggle('is-hidden', reveal !== 'line');
  document.getElementById('text-character-delay-label-v322')?.classList.toggle('is-hidden', reveal !== 'character');
}

function removeLegacyTextTools() {
  const legacy = document.getElementById('text-tools-v314');
  if (legacy) legacy.remove();
  const helper = document.getElementById('text-helper-fields-v317');
  if (helper) helper.remove();
}

function format(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/u, '').replace(/\.$/u, '');
}

function isTextLayer(layer) {
  return Boolean(layer && ((layer.appearanceMode === 'shape' && layer.particleShape === 'text') || layer.engine === 'text'));
}
