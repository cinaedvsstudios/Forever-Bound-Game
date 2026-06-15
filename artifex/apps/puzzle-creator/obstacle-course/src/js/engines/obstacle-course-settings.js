import { OC } from './obstacle-course-state.js';

const sideDefaults = { leftX: 0, leftY: 0, leftZ: 0, rightX: 0, rightY: 0, rightZ: 0 };
const visualDefaults = { opacity: 1, brightness: 1, contrast: 1, saturation: 1, tint: '#ffffff', tintStrength: 0, order: 0 };
const glbDefault = (overrides = {}) => ({ x: 0, y: 0, z: 0, ...sideDefaults, scale: 1, ...visualDefaults, ...overrides });

export const DEFAULT_SETTINGS = {
  engine: 'obstacle-course',
  version: 'V3.0.24',
  templateId: 'horse_forest_easy',
  difficulty: 3,
  courseLength: 2400,
  sceneryDistance: 8,
  vanishX: 0,
  vanishY: 100,
  cameraAngle: 0,
  backgroundZoom: 1.1,
  visual: { brightness: 1, contrast: 1, saturation: 1, tint: '#000000', tintStrength: 0 },
  pathSegments: Array.from({ length: 34 }, (_, index) => ({ id: '1', distance: index * 80 })),
  layers: {
    ground: { visible: true, opacity: 1, x: 0, y: 4.1, z: 0, scale: 0.24950000000000006, order: 1, brightness: 0.58, contrast: 1.18, saturation: 0.84, tint: '#ffffff', tintStrength: 0 },
    path: { visible: false, opacity: 1, x: 0, y: 0, z: 0, scale: 1, order: 2, brightness: 1, contrast: 1, saturation: 1, tint: '#ffffff', tintStrength: 0 },
    treeShadows: { visible: true, opacity: 1, x: 0.8, y: 0, z: 0, scale: 1, order: 6, brightness: 1, contrast: 1, saturation: 1, tint: '#ffffff', tintStrength: 0 },
    trees: { visible: true, opacity: 1, x: 0, y: 3.3, z: 0, scale: 4, order: 20, brightness: 0.62, contrast: 1, saturation: 0.78, tint: '#ffffff', tintStrength: 0 },
    details: { visible: true, opacity: 1, x: 0, y: 3.5, z: 100, scale: 0.7435, order: 25, brightness: 0.56, contrast: 1, saturation: 1, tint: '#ffffff', tintStrength: 0 },
    obstacles: { visible: true, opacity: 1, x: 0, y: 2.8, z: 0, scale: 1, order: 16, brightness: 1, contrast: 1, saturation: 1, tint: '#ffffff', tintStrength: 0 },
    collectibles: { visible: true, opacity: 1, x: 0, y: 0, z: 0, scale: 1, order: 15, brightness: 1, contrast: 1, saturation: 1, tint: '#ffffff', tintStrength: 0 },
  },
  glbControls: {
    './assets/3d/tree_low-poly.glb': glbDefault({ y: 1, scale: 4, brightness: 0.96 }),
    './assets/3d/pine_tree.glb': glbDefault({ y: 1, scale: 4, brightness: 0.96, scaleOffset: 100, opacityOffset: 9, brightnessOffset: -4, contrastOffset: 0, saturationOffset: 0 }),
    './assets/3d/oak_trees.glb': glbDefault({ y: 1.1, scale: 2.176, brightness: 0.96 }),
    './assets/3d/pine_tree_-_ps1_low_poly.glb': glbDefault({ y: 0.8, leftX: -1.7000000000000002, scale: 4, brightness: 0.96 }),
    './assets/3d/tall_bush.glb': glbDefault({ y: -3.8000000000000003, leftX: -10, rightX: 10, scale: 1.72 }),
    './assets/3d/bush.glb': glbDefault(),
    './assets/3d/geranium.glb': glbDefault(),
    './assets/3d/fern2.glb': glbDefault({ y: 1.4 }),
    './assets/3d/low_poly_fern.glb': glbDefault(),
    './assets/3d/fern.glb': glbDefault(),
    './assets/3d/rock_low-poly.glb': glbDefault(),
    './assets/3d/stylized_glowing_mushrooms.glb': glbDefault({ y: 4.5 }),
    './assets/3d/moneysack.glb': glbDefault({ y: 4.5 }),
  },
};

function clone(value) {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function normalizeCriticalLayerSettings(layerSettings = {}) {
  if (layerSettings.treeShadows) layerSettings.treeShadows.opacity = 1;
  return layerSettings;
}

export function getLayerDefault(id) {
  return (OC.defaultLayerSettings && OC.defaultLayerSettings[id]) || (DEFAULT_SETTINGS.layers && DEFAULT_SETTINGS.layers[id]) || {
    visible: true, opacity: 1, x: 0, y: 0, z: 0, scale: 1, order: 0, brightness: 1, contrast: 1, saturation: 1, tint: '#ffffff', tintStrength: 0
  };
}

export function getGlbDefault(url) {
  return (OC.defaultGlbControls && OC.defaultGlbControls[url]) || (DEFAULT_SETTINGS.glbControls && DEFAULT_SETTINGS.glbControls[url]) || {
    x: 0, y: 0, z: 0, leftX: 0, leftY: 0, leftZ: 0, rightX: 0, rightY: 0, rightZ: 0, scale: 1, opacity: 1, brightness: 1, contrast: 1, saturation: 1, tint: '#ffffff', tintStrength: 0, order: 0
  };
}

export function applySettingsObject(data = DEFAULT_SETTINGS, { setAsDefault = false } = {}) {
  if (setAsDefault) {
    OC.defaultLayerSettings = normalizeCriticalLayerSettings(clone(data.layers || {}));
    OC.defaultGlbControls = clone(data.glbControls || {});
  }
  if (data.templateId) OC.templateId = data.templateId;
  if (data.difficulty !== undefined) OC.difficulty = Number(data.difficulty);
  if (data.courseLength !== undefined) OC.courseLength = Number(data.courseLength);
  if (data.sceneryDistance !== undefined) OC.sceneryDistance = Number(data.sceneryDistance);
  if (data.vanishX !== undefined) OC.vanishX = Number(data.vanishX);
  if (data.vanishY !== undefined) OC.vanishY = Number(data.vanishY);
  if (data.cameraAngle !== undefined) OC.cameraAngle = Number(data.cameraAngle);
  if (data.backgroundZoom !== undefined) OC.backgroundZoom = Number(data.backgroundZoom);
  if (data.pathSegments) OC.customPathSequence = clone(data.pathSegments);
  if (data.layers) OC.pendingLayerSettings = normalizeCriticalLayerSettings(clone(data.layers));
  if (data.glbControls) OC.pendingGlbControls = clone(data.glbControls);
  if (data.visual) {
    OC.screenBrightness = data.visual.brightness ?? OC.screenBrightness;
    OC.screenContrast = data.visual.contrast ?? OC.screenContrast;
    OC.screenSaturation = data.visual.saturation ?? OC.screenSaturation;
    OC.screenTint = data.visual.tint ?? OC.screenTint;
    OC.screenTintStrength = data.visual.tintStrength ?? OC.screenTintStrength;
  }
}

export function applyDefaultSettings() { applySettingsObject(DEFAULT_SETTINGS, { setAsDefault: true }); }
