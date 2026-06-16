// Prototype control adapter definitions for the existing standalone Smoke Engine.
// Source of truth checked against:
// - artifex/apps/effect-editor/smoke-engine/index.html
// - artifex/apps/effect-editor/smoke-engine/smoke-engine.js
// This file is intentionally not wired into the live editor yet.

export const SMOKE_CONTROL_ADAPTER_VERSION = 'smoke-controls-adapter-0.1';

export const SMOKE_SOURCE = {
  prototypeFolder: 'smoke-engine',
  prototypeIndex: './smoke-engine/index.html',
  prototypeScript: './smoke-engine/smoke-engine.js',
  prototypeVersion: 'SMOKE-ENGINE-0.6'
};

export const SMOKE_MODES = [
  { id: 'rising', label: 'Rising Smoke', placeholderPresetId: 'prototype-smoke-rising' },
  { id: 'wispy', label: 'Wispy / Incense Smoke', placeholderPresetId: 'prototype-smoke-wispy' },
  { id: 'vignette', label: 'Smoke Vignette', placeholderPresetId: 'prototype-smoke-vignette' },
  { id: 'fullscreen', label: 'Full Screen Smoke', placeholderPresetId: 'prototype-smoke-fullscreen' },
  { id: 'emission', label: 'Chimney Smoke', prototypeLabel: 'Emission Point / Chimney Fire', placeholderPresetId: 'prototype-smoke-emission' }
];

export const SMOKE_DEFAULTS = {
  mode: 'rising',
  scene: 'forest-gate',
  layer: 'front',
  doubleLayer: true,
  colour: '#dce2e7',
  colourHex: '#dce2e7',
  mistOpacity: 0.36,
  density: 0.86,
  puffSize: 1.73,
  definition: 0.82,
  wispCount: 13,
  wispBrightness: 0.09,
  wispLength: 0.95,
  wispWidth: 0.42,
  tailFade: 0.98,
  curl: 0.94,
  rotation: 0.91,
  duration: 8.6,
  gravity: 0.31,
  gravityAngle: -90,
  drift: 0.13,
  turbulence: 0.54,
  clear: 0.54,
  edge: 0.64,
  bias: 0,
  sourceX: 50,
  sourceY: 76,
  sourceWidth: 34,
  height: 400,
  showMarker: true
};

const SMOKE_MODE_LABELS = [
  ['rising', 'Rising Smoke'],
  ['wispy', 'Wispy / Incense Smoke'],
  ['vignette', 'Smoke Vignette'],
  ['fullscreen', 'Full Screen Smoke'],
  ['emission', 'Chimney Smoke']
];

const SCENE_OPTIONS = [
  ['forest-gate', 'Forest Gate'],
  ['ruined-road', 'Ruined Road'],
  ['underworld', 'Underworld'],
  ['transparent-check', 'Transparency Check']
];

const LAYER_OPTIONS = [
  ['back', 'Behind Scene Objects'],
  ['mid', 'Between Objects and Figures'],
  ['front', 'In Front of Figures']
];

const control = {
  range: (field, label, min, max, step, extra = {}) => ({ type: 'range', field, label, min, max, step, ...extra }),
  select: (field, label, options, extra = {}) => ({ type: 'select', field, label, options, ...extra }),
  checkbox: (field, label, extra = {}) => ({ type: 'checkbox', field, label, ...extra }),
  color: (field, label, extra = {}) => ({ type: 'color', field, label, ...extra }),
  text: (field, label, extra = {}) => ({ type: 'text', field, label, ...extra }),
  action: (action, label, extra = {}) => ({ type: 'action', action, label, ...extra })
};

export const SMOKE_CONTROL_GROUPS = [
  {
    id: 'smoke-mode',
    title: 'Smoke Mode',
    source: 'index.html identity-card',
    controls: [
      control.select('prototypeMode', 'Smoke Mode', SMOKE_MODE_LABELS),
      control.select('scene', 'Test Background', SCENE_OPTIONS),
      control.select('layer', 'Preview Layer', LAYER_OPTIONS),
      control.checkbox('doubleLayer', 'Double Layer Preview')
    ]
  },
  {
    id: 'mist-smoke-body',
    title: 'Mist / Smoke Body',
    source: 'index.html Mist / Smoke Body card',
    note: 'These controls affect only the soft smoke body underneath. They no longer change the ribbon wisps.',
    controls: [
      control.color('colour', 'Smoke Tint'),
      control.text('colourHex', 'Smoke Tint Hex', { maxLength: 7, transform: 'hex' }),
      control.range('mistOpacity', 'Mist Opacity', 0, 1, 0.01),
      control.range('density', 'Mist Density', 0, 1, 0.01, { regeneratesForms: true }),
      control.range('puffSize', 'Mist Size', 0.25, 2, 0.01, { regeneratesForms: true }),
      control.range('definition', 'Mist Definition', 0, 1, 0.01, { tooltip: 'Higher creates brighter internal folds in the soft smoke body.' })
    ]
  },
  {
    id: 'ribbon-wisps',
    title: 'Ribbon Wisps',
    source: 'index.html Ribbon Wisps card',
    note: 'Wisp Amount means the same thing in every smoke mode. If it says 50, the engine creates 50 wisps per preview layer.',
    controls: [
      control.range('wispCount', 'Wisp Amount', 0, 50, 1, { regeneratesForms: true }),
      control.range('wispBrightness', 'Wisp Opacity', 0, 1.5, 0.01, { tooltip: 'Opacity/strength of the visible ribbon wisps. This is separate from Mist Opacity.' }),
      control.range('wispLength', 'Ribbon Length', 0.15, 1, 0.01, { regeneratesForms: true }),
      control.range('wispWidth', 'Ribbon Width', 0.05, 1, 0.01, { regeneratesForms: true }),
      control.range('tailFade', 'End Fade', 0.05, 1, 0.01, { tooltip: 'Softens the visible beginning and end of every smoke ribbon.' }),
      control.range('curl', 'Curl', 0, 1, 0.01),
      control.range('rotation', 'Rotation / Fold', 0, 1, 0.01, { tooltip: 'Moves and turns the ribbon shape while it exists.' }),
      control.range('duration', 'Form Duration', 1.5, 12, 0.1, { unit: 's', regeneratesForms: true })
    ]
  },
  {
    id: 'movement-gravity',
    title: 'Movement / Gravity',
    source: 'index.html Movement / Gravity card',
    note: 'Gravity controls the main direction the smoke travels. At -90° it rises straight up; 0° moves right; 90° moves down; 180° moves left.',
    controls: [
      control.range('gravity', 'Gravity Strength', 0, 3, 0.01),
      control.range('gravityAngle', 'Gravity Angle', -180, 180, 1, { unit: '°' }),
      control.range('drift', 'Side Drift', -1, 1, 0.01),
      control.range('turbulence', 'Turbulence', 0, 1, 0.01)
    ]
  },
  {
    id: 'vignette-shape',
    title: 'Vignette Shape',
    source: 'index.html #vignette-controls',
    visibleWhen: { mode: 'vignette' },
    controls: [
      control.range('clear', 'Centre Opening', 0.18, 0.9, 0.01),
      control.range('edge', 'Edge Smoke Depth', 0.1, 1, 0.01, { regeneratesForms: true }),
      control.range('bias', 'Vertical Bias', -1, 1, 0.01, { regeneratesForms: true })
    ]
  },
  {
    id: 'emission-point',
    title: 'Emission Point',
    source: 'index.html #emission-controls',
    visibleWhen: { mode: 'emission' },
    controls: [
      control.range('sourceX', 'Origin X', 0, 100, 1, { unit: '%', regeneratesForms: true }),
      control.range('sourceY', 'Origin Y', 0, 100, 1, { unit: '%', regeneratesForms: true }),
      control.range('sourceWidth', 'Source Width', 4, 260, 1, { unit: 'px', regeneratesForms: true }),
      control.range('height', 'Plume Height', 60, 680, 1, { unit: 'px', regeneratesForms: true }),
      control.checkbox('showMarker', 'Show Test Origin')
    ]
  },
  {
    id: 'performance-test',
    title: 'Performance / Test',
    source: 'index.html Performance / Test card',
    note: 'Double Layer Preview draws the same configured effect twice with different randomized forms and phase offsets.',
    controls: [
      control.action('regenerateSmokeForms', 'Regenerate Smoke Forms')
    ]
  }
];

export const SMOKE_CONTROL_AUDIT = {
  modeOptionsChecked: ['rising', 'wispy', 'vignette', 'fullscreen', 'emission'],
  groupsChecked: [
    'Smoke Mode',
    'Mist / Smoke Body',
    'Ribbon Wisps',
    'Movement / Gravity',
    'Vignette Shape',
    'Emission Point',
    'Performance / Test'
  ],
  stateDefaultsChecked: Object.keys(SMOKE_DEFAULTS),
  hiddenConditionalGroups: ['Vignette Shape visible only for mode=vignette', 'Emission Point visible only for mode=emission'],
  notConnectedYet: true
};

export function cloneSmokeDefaults(overrides = {}) {
  return JSON.parse(JSON.stringify({ ...SMOKE_DEFAULTS, ...overrides }));
}

export function getSmokeControlGroups(mode = 'rising') {
  return SMOKE_CONTROL_GROUPS.filter((group) => !group.visibleWhen || group.visibleWhen.mode === mode);
}
