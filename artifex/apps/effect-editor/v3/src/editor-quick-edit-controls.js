import { updateActiveLayer } from './editor-state.js';

let notify = () => {};

export function initEditorQuickEditControls(showToast = () => {}) {
  notify = typeof showToast === 'function' ? showToast : () => {};
  document.querySelectorAll('[data-helper-preset]').forEach((button) => {
    if (button.dataset.quickEditBound === 'true') return;
    button.dataset.quickEditBound = 'true';
    button.addEventListener('click', () => {
      const patch = HELPER_PRESETS[button.dataset.helperPreset];
      if (!patch) return;
      updateActiveLayer(patch);
      notify(`${button.textContent.trim()} helper applied.`, 'success');
    });
  });
}

const HELPER_PRESETS = {
  'colour:fire': {
    appearanceStops: [
      { position: 0, color: '#fff1a8', opacity: 1, size: 24, glow: 34 },
      { position: 0.5, color: '#ff8a00', opacity: 0.8, size: 18, glow: 24 },
      { position: 1, color: '#ff2600', opacity: 0, size: 5, glow: 0 }
    ],
    gravity: 100,
    gravityScaleVersion: 'ui',
    gravityBoost: false,
    blendMode: 'lighter'
  },
  'colour:ice': {
    appearanceStops: [
      { position: 0, color: '#ffffff', opacity: 0.95, size: 18, glow: 22 },
      { position: 0.5, color: '#99f2ff', opacity: 0.7, size: 14, glow: 16 },
      { position: 1, color: '#00a1d7', opacity: 0, size: 2, glow: 0 }
    ],
    gravity: -25,
    gravityScaleVersion: 'ui',
    gravityBoost: false,
    blendMode: 'screen'
  },
  'colour:good-magic': {
    appearanceStops: [
      { position: 0, color: '#fff7cf', opacity: 1, size: 18, glow: 30 },
      { position: 0.5, color: '#d65cff', opacity: 0.85, size: 22, glow: 34 },
      { position: 1, color: '#5e8cff', opacity: 0, size: 8, glow: 0 }
    ],
    gravity: -20,
    gravityScaleVersion: 'ui',
    gravityBoost: false,
    blendMode: 'lighter'
  },
  'colour:dark-magic': {
    appearanceStops: [
      { position: 0, color: '#b6ff2e', opacity: 0.95, size: 20, glow: 24 },
      { position: 0.5, color: '#29e36c', opacity: 0.8, size: 24, glow: 20 },
      { position: 1, color: '#061709', opacity: 0, size: 6, glow: 0 }
    ],
    gravity: 38,
    gravityScaleVersion: 'ui',
    gravityBoost: false,
    blendMode: 'lighter'
  },
  'colour:water': {
    appearanceStops: [
      { position: 0, color: '#dffbff', opacity: 0.9, size: 18, glow: 10 },
      { position: 0.5, color: '#38b6ff', opacity: 0.75, size: 20, glow: 12 },
      { position: 1, color: '#0356a6', opacity: 0, size: 5, glow: 0 }
    ]
  },
  'colour:evil': {
    appearanceStops: [
      { position: 0, color: '#ffb0b0', opacity: 0.95, size: 19, glow: 24 },
      { position: 0.5, color: '#ff003c', opacity: 0.85, size: 24, glow: 22 },
      { position: 1, color: '#130006', opacity: 0, size: 7, glow: 0 }
    ],
    blendMode: 'lighter'
  },
  'appearance:soft-glow': { glow: 24, edgeBlur: 1.2, blendMode: 'screen', textureContrast: 0.9 },
  'appearance:sharp-sparks': { appearanceMode: 'brush', builtInBrush: 'slash', glow: 10, edgeBlur: 0, sizeStart: 10, sizeEnd: 1, textureContrast: 1.45 },
  'appearance:fade-in-out': {
    appearanceStops: [
      { position: 0, color: '#ffcc66', opacity: 0, size: 4, glow: 0 },
      { position: 0.5, color: '#fff1a8', opacity: 1, size: 18, glow: 18 },
      { position: 1, color: '#ff6600', opacity: 0, size: 4, glow: 0 }
    ]
  },
  'appearance:bright-add': { blendMode: 'lighter', glow: 30, textureAlpha: 1, textureContrast: 1.25 },
  'appearance:white-fog': { colorA: '#ffffff', colorB: '#d9e6ea', alphaStart: 0.45, alphaEnd: 0, sizeStart: 38, sizeEnd: 64, edgeBlur: 1.6, blendMode: 'screen' },
  'appearance:sooty-smoke': { colorA: '#696360', colorB: '#161413', alphaStart: 0.6, alphaEnd: 0, sizeStart: 28, sizeEnd: 54, edgeBlur: 1.4, textureContrast: 0.8 },
  'dynamics:slow-drift': { spawnRate: 6, speedMin: 0.35, speedMax: 1.4, gravity: -10, gravityScaleVersion: 'ui', gravityBoost: false, spread: 110, lifetime: 155 },
  'dynamics:burst-out': { spawnRate: 36, speedMin: 6, speedMax: 14, gravity: 0, gravityScaleVersion: 'ui', gravityBoost: false, spread: 360, lifetime: 46 },
  'dynamics:rise-up': { spawnRate: 14, speedMin: 1.6, speedMax: 5.5, angle: -90, gravity: -75, gravityScaleVersion: 'ui', gravityBoost: false, spread: 42, lifetime: 96 },
  'dynamics:tight-trail': { spawnRate: 22, speedMin: 2, speedMax: 4.4, spread: 10, lifetime: 72 }
};
