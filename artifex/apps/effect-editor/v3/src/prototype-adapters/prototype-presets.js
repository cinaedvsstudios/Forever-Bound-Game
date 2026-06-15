const PROTOTYPE_PRESETS = [
  {
    id: 'prototype-smoke-rising',
    label: 'Rising Smoke',
    engine: 'prototype-smoke',
    description: 'Placeholder linked to the existing Smoke Engine prototype: Rising Smoke mode.',
    config: prototypeLayerConfig('Rising Smoke', 'smoke-engine', 'rising')
  },
  {
    id: 'prototype-smoke-wispy',
    label: 'Wispy / Incense Smoke',
    engine: 'prototype-smoke',
    description: 'Placeholder linked to the existing Smoke Engine prototype: Wispy / Incense Smoke mode.',
    config: prototypeLayerConfig('Wispy / Incense Smoke', 'smoke-engine', 'wispy')
  },
  {
    id: 'prototype-smoke-vignette',
    label: 'Smoke Vignette',
    engine: 'prototype-smoke',
    description: 'Placeholder linked to the existing Smoke Engine prototype: Smoke Vignette mode.',
    config: prototypeLayerConfig('Smoke Vignette', 'smoke-engine', 'vignette')
  },
  {
    id: 'prototype-smoke-fullscreen',
    label: 'Full Screen Smoke',
    engine: 'prototype-smoke',
    description: 'Placeholder linked to the existing Smoke Engine prototype: Full Screen Smoke mode.',
    config: prototypeLayerConfig('Full Screen Smoke', 'smoke-engine', 'fullscreen')
  },
  {
    id: 'prototype-smoke-emission',
    label: 'Emission Point / Chimney Fire',
    engine: 'prototype-smoke',
    description: 'Placeholder linked to the existing Smoke Engine prototype: Emission Point / Chimney Fire mode.',
    config: prototypeLayerConfig('Emission Point / Chimney Fire', 'smoke-engine', 'emission')
  },
  {
    id: 'prototype-shimmer-portal-ring',
    label: 'Portal Ring',
    engine: 'prototype-shimmer',
    description: 'Placeholder linked to the existing FX Shimmer prototype: Portal Ring mode.',
    config: prototypeLayerConfig('Portal Ring', 'fx-shimmer', 'portal-ring')
  },
  {
    id: 'prototype-shimmer-wormhole-tunnel',
    label: 'Wormhole Tunnel',
    engine: 'prototype-shimmer',
    description: 'Placeholder linked to the existing FX Shimmer prototype: Wormhole Tunnel mode.',
    config: prototypeLayerConfig('Wormhole Tunnel', 'fx-shimmer', 'wormhole-tunnel')
  },
  {
    id: 'prototype-shimmer-heat-shimmer',
    label: 'Heat Shimmer',
    engine: 'prototype-shimmer',
    description: 'Placeholder linked to the existing FX Shimmer prototype: Heat Shimmer mode.',
    config: prototypeLayerConfig('Heat Shimmer', 'fx-shimmer', 'heat-shimmer')
  },
  {
    id: 'prototype-shimmer-transition-tear',
    label: 'Transition Tear',
    engine: 'prototype-shimmer',
    description: 'Placeholder linked to the existing FX Shimmer prototype: Transition Tear mode.',
    config: prototypeLayerConfig('Transition Tear', 'fx-shimmer', 'transition-tear')
  }
];

function prototypeLayerConfig(name, prototypeFolder, prototypeMode) {
  return {
    name,
    engine: prototypeFolder === 'smoke-engine' ? 'prototype-smoke' : 'prototype-shimmer',
    prototypeFolder,
    prototypeMode,
    prototypeStatus: 'placeholder-layer-controls-hidden',
    prototypeSourcePath: `./${prototypeFolder}/index.html`,
    colorA: '#7be7ff',
    colorB: '#b45cff',
    alphaStart: 0,
    alphaEnd: 0,
    sizeStart: 1,
    sizeEnd: 1,
    glow: 0,
    spawnRate: 0,
    speedMin: 0,
    speedMax: 0,
    angle: 0,
    spread: 0,
    gravity: 0,
    lifetime: 120,
    emitterX: 640,
    emitterY: 360
  };
}

export function clonePrototypePreset(id) {
  const preset = PROTOTYPE_PRESETS.find((item) => item.id === id);
  return preset ? JSON.parse(JSON.stringify(preset)) : null;
}

export function isPrototypeLayer(layer) {
  return Boolean(layer && (layer.engine === 'prototype-smoke' || layer.engine === 'prototype-shimmer' || layer.prototypeFolder));
}

export function listPrototypePresets() {
  return JSON.parse(JSON.stringify(PROTOTYPE_PRESETS));
}
