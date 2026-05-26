import { editorState, getActiveLayer, onStateChange, updateActiveLayer, updateSyncedLayers } from './editor-state.js';

const CONTROL_CONFIG = {
  'electric-arc': {
    title: 'Electric Arc Controls',
    fields: [
      ['arcLength', 'Arc Length', 'range', 10, 260, 1],
      ['arcLengthVariation', 'Length Variation', 'range', 0, 180, 1],
      ['arcBranches', 'Branches', 'range', 0, 10, 1],
      ['arcBranchLength', 'Branch Length', 'range', 4, 120, 1],
      ['arcJaggedness', 'Jaggedness', 'range', 0, 80, 1],
      ['arcFlicker', 'Flicker', 'range', 0, 1, 0.05]
    ]
  },
  shockwave: {
    title: 'Shockwave Pulse Controls',
    fields: [
      ['shockwaveRadius', 'Ring Radius', 'range', 20, 650, 1],
      ['shockwaveStartRadius', 'Start Offset', 'range', 0, 220, 1],
      ['shockwaveThickness', 'Ring Thickness', 'range', 1, 60, 1],
      ['shockwaveSoftness', 'Ring Softness', 'range', 0, 1, 0.05],
      ['shockwaveBreakup', 'Breakup', 'range', 0, 1, 0.05],
      ['shockwaveSegments', 'Segments', 'range', 0, 36, 1],
      ['shockwaveCenterFlash', 'Centre Flash', 'range', 0, 1, 0.05]
    ]
  },
  ring: {
    title: 'Radial Burst Controls',
    fields: [
      ['pulseMode', 'Emission Mode', 'select', ['once', 'loop', 'continuous']],
      ['pulseDelay', 'Pulse Delay', 'range', 10, 240, 1],
      ['burstCount', 'Burst Count', 'range', 6, 180, 1],
      ['burstDuration', 'Burst Duration', 'range', 1, 40, 1]
    ]
  },
  heatdistortion: {
    title: 'Heat Distortion Controls',
    notice: 'Current V3.12 version is still a visual heat-haze overlay. True image/video pixel warping needs the next renderer pass.',
    fields: [
      ['distortionStrength', 'Warp Strength', 'range', 0, 48, 1],
      ['distortionScale', 'Warp Scale', 'range', 4, 96, 1]
    ]
  },
  'true-lensflare': {
    title: 'True Lens Flare Controls',
    notice: 'Overlays will auto-load from artifex/apps/effect-editor/overlays when image files are added there.',
    fields: [
      ['flareStreakLength', 'Streak Length', 'range', 20, 1000, 1],
      ['flareGhosts', 'Ghost Orbs', 'range', 0, 8, 1],
      ['flareHalo', 'Halo Size', 'range', 4, 260, 1],
      ['flareOverlayScale', 'Overlay Scale', 'range', 0.1, 3, 0.05],
      ['flareOverlayOpacity', 'Overlay Opacity', 'range', 0, 1, 0.05]
    ]
  },
  text: {
    title: 'Text Effect Controls',
    fields: [
      ['textContent', 'Text', 'text'],
      ['textFont', 'Font', 'select', ['Cinzel, Georgia, serif', 'Georgia, serif', 'Garamond, serif', 'Arial, sans-serif', 'monospace']],
      ['textAlign', 'Align', 'select', ['left', 'center', 'right']],
      ['textWeight', 'Weight', 'select', ['400', '500', '700', '900']],
      ['textKeepUpright', 'Keep Upright', 'checkbox'],
      ['textStroke', 'Stroke', 'checkbox'],
      ['textStrokeWidth', 'Stroke Width', 'range', 0, 8, 0.5],
      ['textLetterSpacing', 'Letter Spacing', 'range', 0, 12, 1],
      ['textRotation', 'Text Rotation', 'range', -180, 180, 1],
      ['textSizeOverride', 'Text Size', 'range', 0, 140, 1]
    ]
  }
};

export function initEffectSpecificControls(showToast = () => {}) {
  injectStyles();
  ensurePanel();
  bindPanel(showToast);
  renderPanel();
  onStateChange(renderPanel);
}

function injectStyles() {
  if (document.getElementById('effect-specific-controls-style')) return;
  const style = document.createElement('style');
  style.id = 'effect-specific-controls-style';
  style.textContent = `
    #effect-specific-controls-card {
      border-color: rgba(0, 174, 234, .68) !important;
      box-shadow: 0 0 0 1px rgba(0, 174, 234, .18), 0 0 18px rgba(0, 174, 234, .22);
    }
    #effect-specific-controls-card.is-hidden { display: none !important; }
    .effect-specific-note {
      color: var(--gold-muted);
      font-size: 10px;
      line-height: 1.35;
      margin: 4px 0 12px;
    }
    .effect-specific-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .effect-specific-grid label.wide { grid-column: 1 / -1; }
    .effect-specific-grid select { font-size: 10px !important; font-weight: 400 !important; }
    .sync-control-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      align-items: end;
      margin-top: 12px;
      padding-top: 11px;
      border-top: 1px solid rgba(226,204,167,.14);
    }
    .sync-control-row button { min-height: 38px; }
  `;
  document.head.append(style);
}

function ensurePanel() {
  if (document.getElementById('effect-specific-controls-card')) return;
  const cards = Array.from(document.querySelectorAll('#left-panel .card'));
  const dynamics = cards.find((card) => card.querySelector('h2')?.textContent?.trim() === 'Effect Layer Dynamics');
  const target = dynamics || cards[cards.length - 1];
  if (!target) return;
  target.insertAdjacentHTML('afterend', `
    <section id="effect-specific-controls-card" class="card is-hidden">
      <header><h2>Effect Specific Controls</h2></header>
      <p id="effect-specific-note" class="effect-specific-note"></p>
      <div id="effect-specific-grid" class="effect-specific-grid"></div>
      <div class="sync-control-row">
        <label>Sync Group
          <input id="effect-sync-group-input" type="text" placeholder="optional group name" title="Layers with the same sync group can receive shared control values." />
        </label>
        <button id="effect-sync-apply-button" type="button" title="Apply emitter/target/rotation controls to all layers in this sync group.">🔗</button>
      </div>
    </section>
  `);
}

function bindPanel(showToast) {
  document.getElementById('effect-sync-group-input')?.addEventListener('input', (event) => {
    updateActiveLayer({ syncGroup: event.target.value.trim() });
  });
  document.getElementById('effect-sync-apply-button')?.addEventListener('click', () => {
    const layer = getActiveLayer();
    if (!layer?.syncGroup) {
      showToast('Set a Sync Group first.', 'warn');
      return;
    }
    updateSyncedLayers(layer.syncGroup, {
      emitterX: layer.emitterX,
      emitterY: layer.emitterY,
      targetX: layer.targetX,
      targetY: layer.targetY,
      angle: layer.angle,
      rotation: layer.rotation,
      emitterRotation: layer.emitterRotation
    });
    showToast(`Synced shared controls across ${layer.syncGroup}.`, 'success');
  });
}

function getConfigForLayer(layer) {
  if (!layer) return null;
  if ((layer.appearanceMode === 'shape' && layer.particleShape === 'text') || layer.engine === 'text') return CONTROL_CONFIG.text;
  return CONTROL_CONFIG[layer.engine] || null;
}

function renderPanel() {
  const card = document.getElementById('effect-specific-controls-card');
  const grid = document.getElementById('effect-specific-grid');
  const note = document.getElementById('effect-specific-note');
  if (!card || !grid || !note) return;
  const layer = getActiveLayer();
  const config = getConfigForLayer(layer);
  card.classList.toggle('is-hidden', !config);
  if (!config) return;

  card.querySelector('h2').textContent = config.title || 'Effect Specific Controls';
  note.textContent = config.notice || 'Only appears when the selected layer has custom engine/shape controls.';
  grid.innerHTML = config.fields.map((field) => renderField(field, layer)).join('');
  const sync = document.getElementById('effect-sync-group-input');
  if (sync) sync.value = layer.syncGroup || '';
  bindDynamicFields(config);
}

function renderField(field, layer) {
  const [key, label, type, a, b, c] = field;
  const value = layer?.[key];
  if (type === 'range') {
    const display = Number.isFinite(Number(value)) ? Number(value) : Number(a || 0);
    return `<label>${label}<input data-effect-field="${key}" type="range" min="${a}" max="${b}" step="${c}" value="${display}" title="Adjust ${label}." /><output>${format(display)}</output></label>`;
  }
  if (type === 'select') {
    return `<label>${label}<select data-effect-field="${key}" title="Choose ${label}.">${a.map((option) => `<option value="${escapeHtml(option)}" ${String(value) === option ? 'selected' : ''}>${escapeHtml(readableOption(option))}</option>`).join('')}</select></label>`;
  }
  if (type === 'checkbox') {
    return `<label>${label}<button data-effect-field="${key}" data-checkbox="true" type="button" title="Toggle ${label}.">${value ? '✅' : '⬜'}</button></label>`;
  }
  return `<label class="wide">${label}<input data-effect-field="${key}" type="text" value="${escapeHtml(value || '')}" title="Type ${label}." /></label>`;
}

function readableOption(value) {
  return String(value).replace(/,.*$/u, '').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function bindDynamicFields() {
  document.querySelectorAll('[data-effect-field]').forEach((control) => {
    const key = control.dataset.effectField;
    if (control.dataset.boundEffectSpecific === 'true') return;
    control.dataset.boundEffectSpecific = 'true';
    if (control.dataset.checkbox === 'true') {
      control.addEventListener('click', () => {
        const layer = getActiveLayer();
        updateActiveLayer({ [key]: !Boolean(layer?.[key]) });
      });
      return;
    }
    control.addEventListener('input', () => {
      const value = control.type === 'range' ? Number(control.value) : control.value;
      const output = control.parentElement?.querySelector('output');
      if (output) output.textContent = format(value);
      updateActiveLayer({ [key]: value });
    });
  });
}

function format(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value ?? '');
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/u, '').replace(/\.$/u, '');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}
