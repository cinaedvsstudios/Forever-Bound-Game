import { getActiveLayer, updateActiveLayer } from './editor-state.js';

let notify = () => {};

export function initEditorQuickEditControls(showToast = () => {}) {
  notify = typeof showToast === 'function' ? showToast : () => {};
  document.querySelectorAll('[data-helper-preset]').forEach((button) => {
    if (button.dataset.quickEditBound === 'true') return;
    button.dataset.quickEditBound = 'true';
    button.addEventListener('click', () => {
      const preset = HELPER_PRESETS[button.dataset.helperPreset];
      if (!preset) return;
      const layer = getActiveLayer();
      if (!layer) {
        notify('Select an effect layer before applying a helper.', 'warn');
        return;
      }
      if (layer.locked) {
        notify('Unlock this layer before applying a helper.', 'warn');
        return;
      }
      updateActiveLayer(resolveHelperPatch(preset, layer));
      notify(`${button.textContent.trim()} helper applied.`, 'success');
    });
  });
}


function resolveHelperPatch(preset, layer) {
  // Explicit colour/ramp presets replace the gradient and select the first marker.
  if (Array.isArray(preset.appearanceStops)) {
    return { ...preset, activeAppearanceStopIndex: 0 };
  }

  // Older appearance helpers changed fields the renderer no longer reads while
  // appearanceStops exist. Apply these adjustments to the existing markers instead.
  const hasGlow = Object.prototype.hasOwnProperty.call(preset, 'glow');
  const hasStartSize = Object.prototype.hasOwnProperty.call(preset, 'sizeStart');
  const hasEndSize = Object.prototype.hasOwnProperty.call(preset, 'sizeEnd');
  if (!hasGlow && !hasStartSize && !hasEndSize) return preset;

  const { glow, sizeStart, sizeEnd, ...rest } = preset;
  const stops = Array.isArray(layer.appearanceStops) && layer.appearanceStops.length
    ? layer.appearanceStops
    : [
      { position: 0, color: layer.colorA || '#ffcc66', opacity: layer.alphaStart ?? 1, size: layer.sizeStart ?? 20, glow: layer.glow ?? 12 },
      { position: 1, color: layer.colorB || '#ff6600', opacity: layer.alphaEnd ?? 0, size: layer.sizeEnd ?? 4, glow: 0 }
    ];
  const first = stops[0];
  const last = stops[stops.length - 1];
  const previousGlow = Math.max(0, Number(first.glow) || 0);
  const nextStartSize = hasStartSize ? Number(sizeStart) : Number(first.size);
  const nextEndSize = hasEndSize ? Number(sizeEnd) : Number(last.size);

  const appearanceStops = stops.map((stop) => {
    const position = Math.min(1, Math.max(0, Number(stop.position) || 0));
    const next = { ...stop };
    if (hasStartSize || hasEndSize) {
      next.size = nextStartSize + (nextEndSize - nextStartSize) * position;
    }
    if (hasGlow) {
      // Preserve a custom glow curve, including transparent zero-glow tails.
      // If the original curve has no starting glow, introduce a gentle fade.
      const scaled = previousGlow > 0
        ? (Math.max(0, Number(stop.glow) || 0) / previousGlow) * Number(glow)
        : Number(glow) * (1 - position);
      next.glow = Math.min(80, Math.max(0, Math.round(scaled * 100) / 100));
    }
    return next;
  });
  return { ...rest, appearanceStops };
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
  'appearance:white-fog': {
    appearanceStops: [
      { position: 0, color: '#ffffff', opacity: 0.45, size: 38, glow: 0 },
      { position: 1, color: '#d9e6ea', opacity: 0, size: 64, glow: 0 }
    ],
    edgeBlur: 1.6, blendMode: 'screen'
  },
  'appearance:sooty-smoke': {
    appearanceStops: [
      { position: 0, color: '#696360', opacity: 0.6, size: 28, glow: 0 },
      { position: 1, color: '#161413', opacity: 0, size: 54, glow: 0 }
    ],
    edgeBlur: 1.4, textureContrast: 0.8
  },
  'dynamics:slow-drift': { spawnRate: 6, speedMin: 0.35, speedMax: 1.4, gravity: -10, gravityScaleVersion: 'ui', gravityBoost: false, spread: 110, lifetime: 155 },
  'dynamics:burst-out': { spawnRate: 36, speedMin: 6, speedMax: 14, gravity: 0, gravityScaleVersion: 'ui', gravityBoost: false, spread: 360, lifetime: 46 },
  'dynamics:rise-up': { spawnRate: 14, speedMin: 1.6, speedMax: 5.5, angle: -90, gravity: -75, gravityScaleVersion: 'ui', gravityBoost: false, spread: 42, lifetime: 96 },
  'dynamics:tight-trail': { spawnRate: 22, speedMin: 2, speedMax: 4.4, spread: 10, lifetime: 72 }
};
