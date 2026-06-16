import { OC } from './obstacle-course-state.js';

export const DEFAULT_SETTINGS = {
  "engine": "obstacle-course",
  "version": "V3.0.39",
  "templateId": "horse_forest_easy",
  "difficulty": 3,
  "courseLength": 2400,
  "sceneryDistance": 8,
  "vanishX": 0,
  "vanishY": 0,
  "cameraAngle": 0,
  "backgroundZoom": 1.1,
  "visual": {
    "brightness": 1,
    "contrast": 1,
    "saturation": 1,
    "tint": "#000000",
    "tintStrength": 0
  },
  "pathSegments": [
    {
      "id": "1",
      "distance": 0
    },
    {
      "id": "1",
      "distance": 80
    },
    {
      "id": "1",
      "distance": 160
    },
    {
      "id": "1",
      "distance": 240
    },
    {
      "id": "1",
      "distance": 320
    },
    {
      "id": "1",
      "distance": 400
    },
    {
      "id": "1",
      "distance": 480
    },
    {
      "id": "1",
      "distance": 560
    },
    {
      "id": "1",
      "distance": 640
    },
    {
      "id": "1",
      "distance": 720
    },
    {
      "id": "1",
      "distance": 800
    },
    {
      "id": "1",
      "distance": 880
    },
    {
      "id": "1",
      "distance": 960
    },
    {
      "id": "1",
      "distance": 1040
    },
    {
      "id": "1",
      "distance": 1120
    },
    {
      "id": "1",
      "distance": 1200
    },
    {
      "id": "1",
      "distance": 1280
    },
    {
      "id": "1",
      "distance": 1360
    },
    {
      "id": "1",
      "distance": 1440
    },
    {
      "id": "1",
      "distance": 1520
    },
    {
      "id": "1",
      "distance": 1600
    },
    {
      "id": "1",
      "distance": 1680
    },
    {
      "id": "1",
      "distance": 1760
    },
    {
      "id": "1",
      "distance": 1840
    },
    {
      "id": "1",
      "distance": 1920
    },
    {
      "id": "1",
      "distance": 2000
    },
    {
      "id": "1",
      "distance": 2080
    },
    {
      "id": "1",
      "distance": 2160
    },
    {
      "id": "1",
      "distance": 2240
    },
    {
      "id": "1",
      "distance": 2320
    },
    {
      "id": "1",
      "distance": 2400
    },
    {
      "id": "1",
      "distance": 2480
    },
    {
      "id": "1",
      "distance": 2560
    },
    {
      "id": "1",
      "distance": 2640
    }
  ],
  "layers": {
    "ground": {
      "visible": true,
      "opacity": 1,
      "x": 0,
      "y": 2.3,
      "z": 0,
      "scale": 0.24950000000000006,
      "order": 1,
      "brightness": 0.58,
      "contrast": 1.18,
      "saturation": 0.84,
      "tint": "#ffffff",
      "tintStrength": 0
    },
    "path": {
      "visible": false,
      "opacity": 1,
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "order": 2,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0
    },
    "treeShadows": {
      "visible": true,
      "opacity": 1,
      "x": 0.8,
      "y": 0,
      "z": 0,
      "scale": 1,
      "order": 6,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0
    },
    "trees": {
      "visible": true,
      "opacity": 1,
      "x": 0,
      "y": 1.5999999999999996,
      "z": 0,
      "scale": 4,
      "order": 20,
      "brightness": 0.62,
      "contrast": 1,
      "saturation": 0.78,
      "tint": "#ffffff",
      "tintStrength": 0
    },
    "details": {
      "visible": true,
      "opacity": 1,
      "x": 0,
      "y": 3.5,
      "z": 100,
      "scale": 0.7435,
      "order": 25,
      "brightness": 0.56,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0
    },
    "obstacles": {
      "visible": true,
      "opacity": 1,
      "x": 0,
      "y": 0.8999999999999997,
      "z": 0,
      "scale": 1,
      "order": 16,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0
    },
    "collectibles": {
      "visible": true,
      "opacity": 1,
      "x": 0,
      "y": -2.3000000000000003,
      "z": 0,
      "scale": 1,
      "order": 15,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0
    }
  },
  "glbControls": {
    "./assets/3d/tree_low-poly.glb": {
      "x": 0,
      "y": 1,
      "z": 0,
      "leftX": 0,
      "leftY": 0,
      "leftZ": 0,
      "rightX": 0,
      "rightY": 0,
      "rightZ": 0,
      "scale": 4,
      "opacity": 1,
      "brightness": 0.96,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/pine_tree.glb": {
      "x": 0,
      "y": 1,
      "z": 0,
      "leftX": 0,
      "leftY": 0,
      "leftZ": 0,
      "rightX": 0,
      "rightY": 0,
      "rightZ": 0,
      "scale": 4,
      "opacity": 1,
      "brightness": 0.96,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0,
      "scaleOffset": 100,
      "opacityOffset": 9,
      "brightnessOffset": -4,
      "contrastOffset": 0,
      "saturationOffset": 0
    },
    "./assets/3d/oak_trees.glb": {
      "x": 0,
      "y": 1.1,
      "z": 0,
      "leftX": 0,
      "leftY": 0,
      "leftZ": 0,
      "rightX": 0.2,
      "rightY": 0,
      "rightZ": 0,
      "scale": 2.176,
      "opacity": 1,
      "brightness": 0.96,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/pine_tree_-_ps1_low_poly.glb": {
      "x": 0,
      "y": 0.8,
      "z": 0,
      "leftX": -1.7000000000000002,
      "leftY": 0,
      "leftZ": 0,
      "rightX": 0,
      "rightY": 0,
      "rightZ": 0,
      "scale": 4,
      "opacity": 1,
      "brightness": 0.96,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/tall_bush.glb": {
      "x": 0,
      "y": -5.7,
      "z": 0,
      "leftX": -5.5,
      "leftY": 0.2,
      "leftZ": 0,
      "rightX": 6.699999999999999,
      "rightY": 0,
      "rightZ": 0,
      "scale": 1.72,
      "opacity": 1,
      "brightness": 1,
      "contrast": 1,
      "saturation": 0.86,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/bush.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "leftX": 0,
      "leftY": 0,
      "leftZ": 0,
      "rightX": 0,
      "rightY": 0,
      "rightZ": 0,
      "scale": 1,
      "opacity": 1,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/geranium.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "leftX": 0,
      "leftY": 0,
      "leftZ": 0,
      "rightX": 0,
      "rightY": 0,
      "rightZ": 0,
      "scale": 1,
      "opacity": 1,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/fern2.glb": {
      "x": 0,
      "y": 1.4,
      "z": 0,
      "leftX": 0,
      "leftY": 0,
      "leftZ": 0,
      "rightX": 0,
      "rightY": 0,
      "rightZ": 0,
      "scale": 1,
      "opacity": 1,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/low_poly_fern.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "leftX": 0,
      "leftY": 0,
      "leftZ": 0,
      "rightX": 0,
      "rightY": 0,
      "rightZ": 0,
      "scale": 1,
      "opacity": 1,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/fern.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "leftX": 0,
      "leftY": 0,
      "leftZ": 0,
      "rightX": 0,
      "rightY": 0,
      "rightZ": 0,
      "scale": 1,
      "opacity": 1,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/rock_low-poly.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "leftX": 0,
      "leftY": 0,
      "leftZ": 0,
      "rightX": 0,
      "rightY": 0,
      "rightZ": 0,
      "scale": 1,
      "opacity": 1,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/moneysack.glb": {
      "x": 0,
      "y": 4.5,
      "z": 0,
      "leftX": 0,
      "leftY": 0,
      "leftZ": 0,
      "rightX": 0,
      "rightY": 0,
      "rightZ": 0,
      "scale": 1,
      "opacity": 1,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/stylized_glowing_mushrooms.glb": {
      "x": 0,
      "y": 4.5,
      "z": 0,
      "leftX": 0,
      "leftY": 0,
      "leftZ": 0,
      "rightX": 0,
      "rightY": 0,
      "rightZ": 0,
      "scale": 1,
      "opacity": 1,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    }
  }
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
