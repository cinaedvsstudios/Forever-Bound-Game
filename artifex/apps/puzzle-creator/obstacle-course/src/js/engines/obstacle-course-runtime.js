// Obstacle Course V2.7.11 / Horse Forest Runner
// Consolidated runtime: no post-load patch stack.
// The obstacle-course UI, generation, alpha-path logic, GLB controls, overview, HUD, and JSON settings live here.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

const VERSION = 'V2.7.11';
const CACHE_VERSION = '2.7.11';
const ASSET_BASE = './assets/';
const SHARED_UI_BASE = '../../../shared/ui/';
const GROUND_Y = -1.62;
const SEGMENT_WORLD_LENGTH = 80;
const SEGMENT_WORLD_OVERLAP = 10;
const SEGMENT_WORLD_STEP = SEGMENT_WORLD_LENGTH - SEGMENT_WORLD_OVERLAP;
const PATH_POSITIONS = { left: -6.3, centre: 0, center: 0, right: 6.3 };
const BASE_SPEED = 34;
const BACK_SPEED = -7;
const SLOW_TROT_SPEED = 8;
const ACCEL = 24;
const DECEL = 26;

const ASSETS = {
  horse: `${ASSET_BASE}foreground/horse.png`,
  background: `${ASSET_BASE}backgrounds/horseridebg.jpg`,
  ground: `${ASSET_BASE}ground/forest_ground.webp`,
  powerbars: `${ASSET_BASE}ui/powerbars.png`,
  arrows: `${SHARED_UI_BASE}defaultarrows.webp`,
  pathSegments: {
    straight: { key: 'straight', id: 'pathstraight', label: 'Straight', file: `${ASSET_BASE}path-segments/pathstraight.webp`, start: 'centre', end: 'centre' },
    kink: { key: 'kink', id: 'pathkink', label: 'Kink', file: `${ASSET_BASE}path-segments/pathkink.webp`, start: 'centre', end: 'centre' },
    left: { key: 'left', id: 'pathleft', label: 'Move left', file: `${ASSET_BASE}path-segments/pathleft.webp`, start: 'centre', end: 'left' },
    right: { key: 'right', id: 'pathright', label: 'Move right', file: `${ASSET_BASE}path-segments/pathright.webp`, start: 'centre', end: 'right' },
    leftToStraight: { key: 'leftToStraight', id: 'pathlefttostraight', label: 'Left to centre', file: `${ASSET_BASE}path-segments/pathlefttostraight.webp`, start: 'left', end: 'centre' },
    rightToStraight: { key: 'rightToStraight', id: 'righttostraight', label: 'Right to centre', file: `${ASSET_BASE}path-segments/righttostraight.webp`, start: 'right', end: 'centre' },
  },
  audio: {
    snort: `${ASSET_BASE}audio/horse_snort.wav`,
    neigh: `${ASSET_BASE}audio/horse_neigh.mp3`,
    gallopSlow: `${ASSET_BASE}audio/horse_gallop_slow.mp3`,
    gallopFull: `${ASSET_BASE}audio/horse_gallop_full.mp3`,
    land: `${ASSET_BASE}audio/horse_land.mp3`,
    forest: `${ASSET_BASE}audio/forest_ambience.mp3`,
    bush: `${ASSET_BASE}audio/bush.mp3`,
  }
};

const GLB_ASSETS = [
  { url: `${ASSET_BASE}3d/dead_tree.glb`, label: 'Dead tree', type: 'tree', scale: 10, density: 0.55 },
  { url: `${ASSET_BASE}3d/hill_top_tree.glb`, label: 'Hill top tree', type: 'tree', scale: 9, density: 0.45 },
  { url: `${ASSET_BASE}3d/low_poly_fern.glb`, label: 'Low poly fern', type: 'detail', scale: 1.6, density: 0.75 },
  { url: `${ASSET_BASE}3d/fern.glb`, label: 'Fern', type: 'detail', scale: 1.5, density: 0.75, optional: true },
  { url: `${ASSET_BASE}3d/tall_bush.glb`, label: 'Tall bush', type: 'detail', scale: 2.2, density: 0.65, optional: true },
  { url: `${ASSET_BASE}3d/oak_trees.glb`, label: 'Oak trees', type: 'tree', scale: 11, density: 0.55 },
  { url: `${ASSET_BASE}3d/pine_tree.glb`, label: 'Pine tree', type: 'tree', scale: 13, density: 0.85 },
  { url: `${ASSET_BASE}3d/pine_tree__ps1_low_poly.glb`, label: 'Pine tree PS1', type: 'tree', scale: 12, density: 0.6 },
  { url: `${ASSET_BASE}3d/pine_with_awkward_teenage_face.glb`, label: 'Pine face', type: 'tree', scale: 12, density: 0.25 },
  { url: `${ASSET_BASE}3d/small_pine.glb`, label: 'Small pine', type: 'tree', scale: 7, density: 0.8 },
  { url: `${ASSET_BASE}3d/tree.glb`, label: 'Tree', type: 'tree', scale: 10, density: 0.75 },
  { url: `${ASSET_BASE}3d/tree_gn.glb`, label: 'Tree gn', type: 'tree', scale: 11, density: 0.45 },
  { url: `${ASSET_BASE}3d/tree_low-poly.glb`, label: 'Low poly tree', type: 'tree', scale: 10, density: 0.75 },
  { url: `${ASSET_BASE}3d/rock_low-poly.glb`, label: 'Rock', type: 'rock', scale: 1.25, density: 0.8 },
  { url: `${ASSET_BASE}3d/stone_low-poly.glb`, label: 'Stone', type: 'rock', scale: 1.1, density: 0.75 },
  { url: `${ASSET_BASE}3d/stylized_glowing_mushrooms.glb`, label: 'Glowing mushrooms', type: 'collectible', scale: 1.55, density: 0.38, value: 3 },
  { url: `${ASSET_BASE}3d/moneysack.glb`, label: 'Money sack', type: 'collectible', scale: 1.35, density: 0.24, value: 7, optional: true },
];

const DEFAULT_SETTINGS = {
  "engine": "obstacle-course",
  "version": "V2.7.5",
  "templateId": "horse_forest_easy",
  "difficulty": 2,
  "courseLength": 1500,
  "speed": 34,
  "sceneryDistance": 1.6,
  "pathVisualWidth": 31.8,
  "vanishX": 0,
  "vanishY": 26.5,
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
      "id": "right",
      "start": "centre",
      "end": "right",
      "distance": 0
    },
    {
      "id": "rightToStraight",
      "start": "right",
      "end": "centre",
      "distance": 70
    },
    {
      "id": "kink",
      "start": "centre",
      "end": "centre",
      "distance": 140
    },
    {
      "id": "kink",
      "start": "centre",
      "end": "centre",
      "distance": 210
    },
    {
      "id": "kink",
      "start": "centre",
      "end": "centre",
      "distance": 280
    },
    {
      "id": "right",
      "start": "centre",
      "end": "right",
      "distance": 350
    },
    {
      "id": "rightToStraight",
      "start": "right",
      "end": "centre",
      "distance": 420
    },
    {
      "id": "straight",
      "start": "centre",
      "end": "centre",
      "distance": 490
    },
    {
      "id": "straight",
      "start": "centre",
      "end": "centre",
      "distance": 560
    },
    {
      "id": "kink",
      "start": "centre",
      "end": "centre",
      "distance": 630
    },
    {
      "id": "kink",
      "start": "centre",
      "end": "centre",
      "distance": 700
    },
    {
      "id": "left",
      "start": "centre",
      "end": "left",
      "distance": 770
    },
    {
      "id": "leftToStraight",
      "start": "left",
      "end": "centre",
      "distance": 840
    },
    {
      "id": "left",
      "start": "centre",
      "end": "left",
      "distance": 910
    },
    {
      "id": "leftToStraight",
      "start": "left",
      "end": "centre",
      "distance": 980
    },
    {
      "id": "kink",
      "start": "centre",
      "end": "centre",
      "distance": 1050
    },
    {
      "id": "kink",
      "start": "centre",
      "end": "centre",
      "distance": 1120
    },
    {
      "id": "left",
      "start": "centre",
      "end": "left",
      "distance": 1190
    },
    {
      "id": "leftToStraight",
      "start": "left",
      "end": "centre",
      "distance": 1260
    },
    {
      "id": "left",
      "start": "centre",
      "end": "left",
      "distance": 1330
    },
    {
      "id": "leftToStraight",
      "start": "left",
      "end": "centre",
      "distance": 1400
    },
    {
      "id": "kink",
      "start": "centre",
      "end": "centre",
      "distance": 1470
    },
    {
      "id": "right",
      "start": "centre",
      "end": "right",
      "distance": 1540
    },
    {
      "id": "rightToStraight",
      "start": "right",
      "end": "centre",
      "distance": 1610
    },
    {
      "id": "left",
      "start": "centre",
      "end": "left",
      "distance": 1680
    },
    {
      "id": "leftToStraight",
      "start": "left",
      "end": "centre",
      "distance": 1750
    },
    {
      "id": "kink",
      "start": "centre",
      "end": "centre",
      "distance": 1820
    },
    {
      "id": "kink",
      "start": "centre",
      "end": "centre",
      "distance": 1890
    }
  ],
  "layers": {
    "ground": {
      "visible": true,
      "opacity": 0.84,
      "x": 0,
      "y": 1.5,
      "z": 0,
      "scale": 0.19999999999999996,
      "order": 0,
      "brightness": 0.62,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0
    },
    "path": {
      "visible": true,
      "opacity": 0.56,
      "x": 0,
      "y": -2.5,
      "z": -6,
      "scale": 1.4,
      "order": 4,
      "brightness": 0.5,
      "contrast": 0.8,
      "saturation": 0.5,
      "tint": "#7a6a47",
      "tintStrength": 0.26
    },
    "trees": {
      "visible": true,
      "opacity": 1,
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "order": 12,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0
    },
    "rocks": {
      "visible": true,
      "opacity": 1,
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "order": 13,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0
    },
    "details": {
      "visible": true,
      "opacity": 1,
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "order": 14,
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
      "y": 0,
      "z": 0,
      "scale": 1,
      "order": 15,
      "brightness": 1,
      "contrast": 1,
      "saturation": 1,
      "tint": "#ffffff",
      "tintStrength": 0
    },
    "obstacles": {
      "visible": true,
      "opacity": 1,
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "order": 16,
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
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/pine_with_awkward_teenage_face.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/hill_top_tree.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/tree.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/pine_tree.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/small_pine.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/oak_trees.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/tree_gn.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/dead_tree.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/stone_low-poly.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/rock_low-poly.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/tall_bush.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/low_poly_fern.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/fern.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/moneysack.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    },
    "./assets/3d/stylized_glowing_mushrooms.glb": {
      "x": 0,
      "y": 0,
      "z": 0,
      "scale": 1,
      "scaleOffset": 0,
      "opacity": 1,
      "brightness": 1,
      "brightnessOffset": 0,
      "contrast": 1,
      "contrastOffset": 0,
      "saturation": 1,
      "saturationOffset": 0,
      "tint": "#ffffff",
      "tintStrength": 0,
      "order": 0
    }
  }
};

const TEMPLATES = {
  horse_forest_easy: { label: 'Obstacle Course', obstacleRate: 1, treeRate: 1, rockRate: 1, detailRate: 1 },
  horse_forest_dense: { label: 'Dense Forest Course', obstacleRate: 1.35, treeRate: 1.65, rockRate: 1.15, detailRate: 1.4 },
  horse_forest_night: { label: 'Moonlit Forest Course', obstacleRate: 1.15, treeRate: 1.25, rockRate: 1.1, detailRate: 1.2 },
};

const OC = {
  version: VERSION,
  mounted: false,
  active: false,
  running: false,
  paused: false,
  complete: false,
  templateId: 'horse_forest_easy',
  difficulty: 2,
  courseLength: 1500,
  speed: BASE_SPEED,
  currentSpeed: 0,
  targetSpeed: 0,
  startAssistTime: 0,
  distance: 0,
  score: 0,
  hits: 0,
  jumps: 0,
  collected: 0,
  successScore: 20,
  offPathTime: 0,
  pathHintDirection: 'right',
  pathAlphaThreshold: 96,
  collectibleAlphaThreshold: 150,
  pathVisualWidth: 31.8,
  laneWidth: 2.7,
  groundVisualWidth: 220,
  groundTextureWorldSize: 220,
  sceneryDistance: 1.6,
  steerSpeed: 18,
  bumpStrength: 0.12,
  displacementStrength: 0.035,
  vanishX: 0,
  vanishY: 0,
  cameraAngle: 0,
  backgroundZoom: 1.1,
  backgroundJumpShift: 0,
  gridEnabled: false,
  overviewPathOverlay: true,
  whiteBackground: false,
  screenBrightness: 1,
  screenContrast: 1,
  screenSaturation: 1,
  screenTint: '#000000',
  screenTintStrength: 0,
  keys: new Set(),
  player: { x: 0, y: 0, vy: 0, grounded: true, jumpingHeld: false, jumpHoldTime: 0, maxJumpHoldTime: 0.68 },
  pathSequence: [],
  customPathSequence: null,
  defaultSettingsApplied: false,
  objects: [],
  placed: [],
  glbInstances: [],
  glbTemplates: new Map(),
  glbAssetUrls: GLB_ASSETS.map((asset) => asset.url),
  glbControls: new Map(),
  selectedGlbAssetUrl: '',
  selectionBoxes: [],
  selectedLayerId: 'path',
  soloLayerId: null,
  layers: new Map(),
  pathAlphaMaps: new Map(),
  pathAlphaPromises: new Map(),
  requiredAssetFailures: [],
  requiredReady: false,
  loadingDone: false,
  renderLoopRunning: false,
  renderLoopTick: false,
  overviewRaf: 0,
  selectedLayerHelper: null,
  loadingTotal: 0,
  loadingCount: 0,
  textureLoader: null,
  gltfLoader: null,
  textureCache: new Map(),
  pathMaterialCache: new Map(),
  audioReady: false,
  audioClips: new Map(),
  lastVoiceAt: 0,
  lastBushAt: 0,
  wasForwardMoving: false,
  host: null,
  leftPanel: null,
  rightPanel: null,
  stage: null,
  scene: null,
  camera: null,
  renderer: null,
  world: null,
  grid: null,
  clock: null,
  frame: null,
  groundMaterial: null,
};

const $ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const signedToFactor = (value) => {
  const v = Number(value || 0);
  return v >= 0 ? clamp(1 + (v / 100) * 3, 1, 4) : clamp(1 + (v / 100) * 0.95, 0.05, 1);
};
const factorToSigned = (value) => {
  const f = Number(value || 1);
  return Math.round(f >= 1 ? ((f - 1) / 3) * 100 : ((f - 1) / 0.95) * 100);
};
const sliderToVisualFactor = (value) => clamp(1 + (Number(value || 0) / 100), 0, 2.5);
const visualFactorToSlider = (value) => Math.round((Number(value || 1) - 1) * 100);
const sliderToGlobalBrightness = (value) => sliderToVisualFactor(value);
const globalBrightnessToSlider = (value) => visualFactorToSlider(value);
const sliderToGlobalContrast = (value) => sliderToVisualFactor(value);
const globalContrastToSlider = (value) => visualFactorToSlider(value);
const sliderToGlobalSaturation = (value) => sliderToVisualFactor(value);
const globalSaturationToSlider = (value) => visualFactorToSlider(value);
const sliderToOpacity = (value) => clamp(1 + Math.min(Number(value || 0), 0) / 100, 0, 1);
const opacityToSlider = (value) => Math.round((Number(value ?? 1) - 1) * 100);
const tintToSlider = (value) => Math.round(clamp(Number(value || 0), 0, 1) * 100);
const sliderToTint = (value) => clamp(Number(value || 0) / 100, 0, 1);

function formatNumber(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return '0';
  return Math.abs(n % 1) < 0.001 ? String(Math.round(n)) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export function openObstacleCourseWorkflow() {
  ensureMounted();
}

function ensureMounted() {
  if (OC.mounted) return;
  OC.mounted = true;
  OC.leftPanel = document.querySelector('.left-panel-body') || document.querySelector('.left-panel') || document.body;
  OC.rightPanel = document.querySelector('.right-panel') || document.body;
  applyDefaultSettings();
  updateDocumentVersion();
  injectStyles();
  mountLayout();
  enhanceStaticRangeSteppers();
  bindInputs();
  initThree();
  preloadAssets().then(() => {
    updateStats();
  });
}

function updateDocumentVersion() {
  document.title = `Obstacle Course · Puzzle Creator ${VERSION} · Forever Bound`;
  document.querySelectorAll('.version-pill,.status-pill').forEach((node) => {
    if (/V\d/.test(node.textContent || '')) node.textContent = VERSION;
  });
}

function injectStyles() {
  if ($('oc-consolidated-styles')) return;
  const style = document.createElement('style');
  style.id = 'oc-consolidated-styles';
  style.textContent = `
    .obstacle-app{height:100%;display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:12px;padding:14px;overflow:hidden}
    .obstacle-main-card,.obstacle-side-card{min-height:0;border:1px solid rgba(238,196,90,.32);border-radius:16px;background:rgba(5,10,16,.9);box-shadow:0 20px 70px rgba(0,0,0,.34);padding:16px;overflow:auto}
    .obstacle-header-line{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;border-bottom:1px solid rgba(238,196,90,.22);padding-bottom:12px;margin-bottom:14px}
    .obstacle-header-line h2{font-family:Cinzel,Georgia,serif;margin:.2rem 0;font-size:1.35rem}.obstacle-header-line .eyebrow{font-size:.66rem;color:#9ee6a4;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .obstacle-header-line p{margin:.3rem 0;color:#c9bfae;font-size:.78rem}.obstacle-status-pill{border:1px solid rgba(238,196,90,.55);border-radius:999px;padding:8px 10px;color:#eec45a;font-weight:900;font-size:.72rem}
    .obstacle-three-wrap{position:relative;width:100%;aspect-ratio:16/9;min-height:360px;border:1px solid rgba(124,202,125,.24);border-radius:14px;overflow:hidden;background-color:#05080d;background-image:var(--oc-bg-image,none);background-repeat:no-repeat;background-size:var(--oc-bg-size,110%) auto;background-position:var(--oc-bg-x,50%) var(--oc-bg-y,50%)}
    .obstacle-three-wrap canvas{display:block;width:100%!important;height:100%!important;filter:brightness(var(--oc-brightness,1)) contrast(var(--oc-contrast,1)) saturate(var(--oc-saturation,1))}
    .obstacle-tint-overlay{position:absolute;inset:0;z-index:6;pointer-events:none;background:var(--oc-tint,#000);opacity:var(--oc-tint-opacity,0);mix-blend-mode:color}
    .obstacle-horse-overlay{position:absolute;left:50%;bottom:-38px;z-index:7;width:430px;height:247px;margin-left:-215px;pointer-events:none;filter:drop-shadow(0 7px 9px rgba(0,0,0,.72));opacity:.98;background-image:url('${ASSETS.horse}');background-repeat:no-repeat;background-size:700% 100%;background-position:50% 100%;transition:background-position .08s linear}
    .obstacle-hud{position:absolute;left:14px;right:14px;bottom:12px;z-index:8;display:flex;justify-content:space-between;gap:12px;pointer-events:none;color:#f4ead4;font-size:.75rem;text-shadow:0 2px 5px rgba(0,0,0,.8)}
    .obstacle-speed-badge{position:absolute;right:14px;top:12px;z-index:9;width:260px;background:transparent;border:0;padding:0;color:#f4ead4;pointer-events:none}
    .oc-powerbar-wrap{position:relative;width:230px;height:50px;margin:0 auto 4px;overflow:visible}
    .oc-powerbar-empty,.oc-powerbar-full,.oc-powerbar-full-clip{position:absolute;left:0;top:0;width:230px;height:50px;background-image:url('${ASSETS.powerbars}');background-repeat:no-repeat;background-size:230px auto;pointer-events:none}
    .oc-powerbar-empty{background-position:0 -124px}.oc-powerbar-full-clip{overflow:hidden;width:0;background:none;transition:width .08s linear}.oc-powerbar-full{background-position:0 -86px}
    .oc-powerbar-emoji{position:absolute;left:14px;top:11px;z-index:3;font-size:24px;line-height:1;filter:drop-shadow(0 2px 2px rgba(0,0,0,.8))}
    .oc-speed-label{display:flex;gap:8px;justify-content:flex-end;align-items:center;font-size:.72rem;font-weight:900;color:#eec45a}
    .oc-offpath-label{font-size:.72rem;font-weight:900;color:#ff7373;text-align:right}
    .oc-offpath-arrow{position:absolute;left:50%;top:42%;z-index:10;width:104px;height:104px;margin:-52px 0 0 -52px;display:none;background-image:url('${ASSETS.arrows}');background-repeat:no-repeat;background-size:200% 200%;background-color:transparent;border:0;border-radius:0;color:transparent;text-shadow:none;box-shadow:none;filter:drop-shadow(0 7px 10px rgba(0,0,0,.78));animation:ocPulseArrow .9s ease-in-out infinite;pointer-events:none}
    .oc-offpath-arrow.is-visible{display:block}.oc-offpath-arrow.dir-left{background-position:0% 100%}.oc-offpath-arrow.dir-right{background-position:100% 100%}@keyframes ocPulseArrow{0%,100%{transform:translateY(0) scale(.92)}50%{transform:translateY(-11px) scale(1.12)}}
    .hf-run-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.hf-run-controls button,.wide-button,.hf-export-json-button{min-height:36px;border:1px solid rgba(124,202,125,.35);border-radius:10px;background:rgba(20,72,37,.64);color:#f4ead4;font-weight:900;cursor:pointer}.hf-run-controls button:hover,.wide-button:hover,.hf-export-json-button:hover{border-color:rgba(238,196,90,.75)}
    .hf-run-controls button.is-running{border-color:rgba(158,230,164,.95);background:rgba(36,120,62,.9);box-shadow:0 0 0 2px rgba(158,230,164,.22),0 0 18px rgba(158,230,164,.2)}.hf-run-controls button.is-paused{border-color:rgba(238,196,90,.95);background:rgba(95,63,9,.88)}
    .hf-layer-panel,.hf-control-section{border:1px solid rgba(124,202,125,.22);border-radius:14px;padding:12px;background:rgba(7,14,22,.72);margin-bottom:12px}.hf-layer-panel h3,.hf-control-section h3{font-family:Cinzel,Georgia,serif;margin:.1rem 0 .75rem;font-size:.95rem}
    label.field-block,.range-row{display:block;color:#c9bfae;font-size:.72rem;font-weight:800;margin:9px 0}.field-block span,.range-row span{display:flex;justify-content:space-between;gap:8px;margin-bottom:5px}.field-block select,.field-block input,.range-row input{width:100%;min-width:0}.field-block select{background:#0b1219;color:#f4ead4;border:1px solid rgba(124,202,125,.28);border-radius:10px;padding:8px}.range-row output{color:#eec45a}
    .hf-button-row{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.hf-button-row button{min-height:34px;border:1px solid rgba(124,202,125,.35);border-radius:9px;background:rgba(20,72,37,.62);color:#f4ead4;font-weight:900}
    .field-check{display:flex;align-items:center;gap:8px;color:#c9bfae;font-size:.72rem;font-weight:800;margin:8px 0}.field-check input{width:auto}
    .hf-overview-wrap{margin-top:12px;border:1px solid rgba(238,196,90,.25);border-radius:12px;overflow:auto;background:#101914;max-height:390px}.hf-overview{display:block;width:100%;height:auto;min-height:250px}
    .hf-key-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;color:#c9bfae;font-size:.72rem}.hf-key-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px}.hf-key-path{background:#eec45a}.hf-key-tree{background:#48a24a}.hf-key-rock{background:#aaa}.hf-key-collectible{background:#5be5ff}.hf-key-obstacle{background:#b04b35}
    .oc-result{min-height:24px;margin:8px 0;color:#eec45a;font-size:.75rem}.oc-result.failure{color:#ff9a9a}.oc-result.success{color:#9ee6a4}
    .oc-loading{color:#eec45a;font-size:.72rem;font-weight:900;margin-top:8px}.right-preview-layout,.overview-window,.render-viewport{display:none!important}
    .oc-topbar{display:grid;grid-template-columns:minmax(260px,1fr) auto;gap:12px;align-items:center;border:1px solid rgba(238,196,90,.26);border-radius:14px;background:rgba(7,14,22,.86);padding:10px 12px;margin-bottom:12px}
    .oc-topbar h2{font-family:Cinzel,Georgia,serif;margin:.15rem 0;font-size:1.12rem}.oc-topbar .eyebrow{font-size:.62rem;color:#9ee6a4;font-weight:900;letter-spacing:.16em;text-transform:uppercase;margin:0}
    .oc-topbar p{margin:.2rem 0 0;color:#c9bfae;font-size:.7rem;line-height:1.25}.oc-top-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
    .oc-top-actions button{min-height:34px;border:1px solid rgba(124,202,125,.38);border-radius:10px;background:rgba(20,72,37,.72);color:#f4ead4;font-weight:900;cursor:pointer;padding:0 11px}
    .oc-top-actions button:hover{border-color:rgba(238,196,90,.75)}.oc-top-actions button.is-running{border-color:rgba(158,230,164,.95);background:rgba(36,120,62,.9);box-shadow:0 0 0 2px rgba(158,230,164,.22),0 0 18px rgba(158,230,164,.2)}.oc-top-actions button.is-paused{border-color:rgba(238,196,90,.95);background:rgba(95,63,9,.88)}
    .oc-top-status{display:grid;gap:2px;min-width:190px;border:1px solid rgba(238,196,90,.45);border-radius:10px;background:rgba(5,10,16,.74);padding:7px 9px;color:#eec45a;font-size:.66rem;font-weight:900;line-height:1.25}.oc-top-status small{color:#c9bfae;font-size:.62rem;font-weight:800}

  `;
  document.head.appendChild(style);
}

function mountLayout() {
  OC.rightPanel.innerHTML = `
    <div class="obstacle-app">
      <section class="obstacle-main-card">
        <div id="obstacle-stage" class="obstacle-three-wrap">
          <div class="obstacle-tint-overlay"></div>
          <div id="obstacle-speed-badge" class="obstacle-speed-badge"></div>
          <div id="oc-offpath-arrow" class="oc-offpath-arrow dir-right"></div>
          <div id="obstacle-horse" class="obstacle-horse-overlay"></div>
          <div id="oc-loading-horse" class="oc-loading-horse" hidden><div class="oc-loading-spinner"></div><strong id="oc-loading-horse-title">Loading assets</strong><span id="oc-loading-horse-count">Assets 0 / 0</span></div>
          <div class="obstacle-hud"><span id="obstacle-distance-readout">Distance 0 / ${OC.courseLength}</span><span id="obstacle-score-readout">Score 0</span></div>
        </div>
        <div id="obstacle-result" class="oc-result"></div>
        <div id="oc-loading" class="oc-loading">Loading assets 0 / 0</div>
        <section class="hf-overview-wrap"><canvas id="hf-overview" class="hf-overview" width="280" height="500"></canvas></section>
      </section>
      <aside class="obstacle-side-card">
        <section class="hf-layer-panel"><h3>Layer Controls</h3>
          <label class="field-block"><span>Selected layer</span><select id="hf-layer-select"><option value="path">Path</option></select></label>
          <div class="hf-button-row"><button id="hf-layer-visible" type="button">Hide/Show</button><button id="hf-layer-solo" type="button">Solo</button><button id="hf-layer-all" type="button">All</button></div>
          <div class="hf-button-row" style="margin-top:7px"><button id="hf-layer-above" type="button">Above</button><button id="hf-layer-below" type="button">Below</button><button id="hf-white-bg" type="button">BG White</button></div>
          <div id="hf-layer-selected-label" class="hint-text" style="margin-top:8px">Layer controls appear when required assets finish loading.</div>
          <div id="hf-layer-sliders"><p class="hint-text">Waiting for required assets: background, horse, ground, path images, arrows, and power bar.</p></div>
        </section>
        <section class="hf-layer-panel"><h3>Global Visual</h3>
          <div id="hf-global-sliders"></div>
        </section>
      </aside>
    </div>
  `;
  OC.host = OC.rightPanel.querySelector('.obstacle-app');
  OC.stage = $('obstacle-stage');
  mountLeftPanel();
  createGlobalSliders();
  updateScreenFilters();
  updateStats();
}

function mountLeftPanel() {
  if (!OC.leftPanel) return;
  OC.leftPanel.innerHTML = `
    <section class="panel tool-panel obstacle-panel"><div class="panel-title-row"><div><p class="eyebrow">Obstacle Course · ${VERSION}</p><h2>Obstacle Course</h2></div><span class="status-pill">${VERSION}</span></div><p class="obstacle-panel-copy">Course editor controls use transparent path segment WEBPs over forest_ground.webp.</p><p class="hint-text">Forest Distance From Path Edge controls X distance from the visible path edge, not forward Z distance.</p></section>
    <section class="hf-control-section"><h3>Construction</h3>
      <label class="field-block"><span>Course Template</span><select id="obstacle-template"><option value="horse_forest_easy">Obstacle Course</option><option value="horse_forest_dense">Dense Forest Course</option><option value="horse_forest_night">Moonlit Forest Course</option></select></label>
      <label class="range-row"><span>Difficulty <output id="obstacle-difficulty-out">${OC.difficulty}</output></span><input id="obstacle-difficulty" type="range" min="1" max="5" step="1" value="${OC.difficulty}"></label>
      <label class="range-row"><span>Course Distance <output id="obstacle-distance-out">${OC.courseLength}</output></span><input id="obstacle-distance" type="range" min="700" max="3000" step="50" value="${OC.courseLength}"></label>
      <label class="range-row"><span>Forest Distance From Path Edge <output id="obstacle-scenery-distance-out">${OC.sceneryDistance.toFixed(1)}</output></span><input id="obstacle-scenery-distance" type="range" min="0.2" max="10" step="0.1" value="${OC.sceneryDistance}"></label>
      <button id="obstacle-regenerate" class="wide-button" type="button">Regenerate Obstacle Course</button>
    </section>
    <section class="hf-layer-panel"><h3>View Helpers</h3>
      <label class="field-check"><input id="oc-ground-grid-toggle" type="checkbox"> Show ground grid</label>
      <label class="field-check"><input id="oc-overview-path-overlay" type="checkbox" checked> Show path alpha on overview</label>
      <label class="range-row"><span>Vanishing Point X <output id="oc-vp-x-out">${(OC.vanishX || 0).toFixed(1)}</output></span><input id="oc-vp-x" type="range" min="-100" max="100" step="0.5" value="${OC.vanishX || 0}"></label>
      <label class="range-row"><span>Vanishing Point Y <output id="oc-vp-y-out">${(OC.vanishY || 0).toFixed(2)}</output></span><input id="oc-vp-y" type="range" min="-100" max="100" step="0.5" value="${OC.vanishY || 0}"></label>
      <label class="range-row"><span>View Angle <output id="oc-vp-angle-out">${(OC.cameraAngle || 0).toFixed(1)}</output></span><input id="oc-vp-angle" type="range" min="-100" max="100" step="0.5" value="${OC.cameraAngle || 0}"></label>
    </section>
    <section class="hf-control-section"><h3>Overview Key</h3><div class="hf-key-list"><div><span class="hf-key-dot hf-key-path"></span>Path</div><div><span class="hf-key-dot hf-key-tree"></span>Tree</div><div><span class="hf-key-dot hf-key-rock"></span>Rock</div><div><span class="hf-key-dot hf-key-collectible"></span>Collectible</div><div><span class="hf-key-dot hf-key-obstacle"></span>Obstacle</div></div></section>
    <section class="hf-control-section"><h3>Settings</h3><button id="hf-export-json" class="hf-export-json-button" type="button">Download JSON</button><input id="hf-import-json-file" type="file" accept="application/json,.json" hidden><button id="hf-import-json" class="hf-export-json-button" type="button" style="margin-top:8px">Import JSON Settings</button></section>
  `;
}

let sceneryDistanceRegenTimer = 0;

function scheduleSceneryRegenerate() {
  clearTimeout(sceneryDistanceRegenTimer);
  sceneryDistanceRegenTimer = setTimeout(() => regenerateCourse(), 180);
}



function enhanceStaticRangeSteppers(scope = document) {
  scope.querySelectorAll('.range-row').forEach((row) => {
    if (row.classList.contains('oc-enhanced-range') || row.dataset.stepperReady === '1') return;
    const input = row.querySelector('input[type="range"]');
    const output = row.querySelector('output');
    if (!input || !output) return;
    row.dataset.stepperReady = '1';

    const wrap = document.createElement('span');
    wrap.className = 'oc-range-stepper';
    const down = document.createElement('button');
    down.type = 'button';
    down.className = 'oc-range-step';
    down.textContent = '<';
    const up = document.createElement('button');
    up.type = 'button';
    up.className = 'oc-range-step';
    up.textContent = '>';
    const number = document.createElement('input');
    number.type = 'number';
    number.className = 'oc-range-value';
    number.min = input.min;
    number.max = input.max;
    number.step = input.step || '1';
    number.value = output.textContent || input.value || '0';
    output.classList.add('oc-hidden-output');
    output.setAttribute('aria-hidden', 'true');

    wrap.append(down, number, up);
    output.insertAdjacentElement('afterend', wrap);

    const commit = (value) => {
      const min = Number(input.min || -100);
      const max = Number(input.max || 100);
      const v = clamp(Number(value || 0), min, max);
      input.value = v;
      number.value = formatNumber(v);
      output.textContent = formatNumber(v);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };

    input.addEventListener('input', () => {
      number.value = formatNumber(input.value);
      output.textContent = formatNumber(input.value);
    });
    number.addEventListener('change', () => commit(number.value));
    down.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      commit(Number(input.value || 0) - Number(input.step || 1));
    });
    up.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      commit(Number(input.value || 0) + Number(input.step || 1));
    });
  });
}

function bindInputs() {
  $('obstacle-start')?.addEventListener('click', startRun);
  $('obstacle-pause')?.addEventListener('click', pauseRun);
  $('obstacle-reset-run')?.addEventListener('click', () => resetRun(false));
  $('obstacle-template')?.addEventListener('change', (event) => { OC.templateId = event.target.value; regenerateCourse(); });
  $('obstacle-difficulty')?.addEventListener('input', (event) => { OC.difficulty = Number(event.target.value); $('obstacle-difficulty-out').textContent = OC.difficulty; });
  $('obstacle-distance')?.addEventListener('input', (event) => { OC.courseLength = Number(event.target.value); $('obstacle-distance-out').textContent = OC.courseLength; updateStats(); });
  $('obstacle-scenery-distance')?.addEventListener('input', (event) => { OC.sceneryDistance = Number(event.target.value); $('obstacle-scenery-distance-out').textContent = OC.sceneryDistance.toFixed(1); scheduleSceneryRegenerate(); });
  $('obstacle-regenerate')?.addEventListener('click', regenerateCourse);
  $('hf-layer-select')?.addEventListener('change', (event) => { OC.selectedLayerId = event.target.value; createLayerSliders(); refreshGlbSelectionBoxes(); scheduleOverviewDraw(); });
  $('hf-layer-visible')?.addEventListener('click', toggleSelectedLayerVisible);
  $('hf-layer-solo')?.addEventListener('click', toggleSelectedLayerSolo);
  $('hf-layer-all')?.addEventListener('click', () => { OC.soloLayerId = null; applyAllLayers(); scheduleOverviewDraw(); });
  $('hf-layer-above')?.addEventListener('click', () => nudgeSelectedOrder(1));
  $('hf-layer-below')?.addEventListener('click', () => nudgeSelectedOrder(-1));
  $('hf-white-bg')?.addEventListener('click', toggleWhiteBackground);
  $('oc-ground-grid-toggle')?.addEventListener('change', (event) => { OC.gridEnabled = event.target.checked; if (OC.grid) OC.grid.visible = OC.gridEnabled; drawFrame(); });
  $('oc-overview-path-overlay')?.addEventListener('change', (event) => { OC.overviewPathOverlay = event.target.checked; scheduleOverviewDraw(); });
  $('oc-vp-x')?.addEventListener('input', (event) => { OC.vanishX = Number(event.target.value); $('oc-vp-x-out').textContent = OC.vanishX.toFixed(1); applyCamera(); drawFrame(); });
  $('oc-vp-y')?.addEventListener('input', (event) => { OC.vanishY = Number(event.target.value); $('oc-vp-y-out').textContent = OC.vanishY.toFixed(2); applyCamera(); drawFrame(); });
  $('oc-vp-angle')?.addEventListener('input', (event) => { OC.cameraAngle = Number(event.target.value); $('oc-vp-angle-out').textContent = OC.cameraAngle.toFixed(1); applyCamera(); drawFrame(); });
  $('hf-export-json')?.addEventListener('click', exportJsonSettings);
  $('hf-import-json')?.addEventListener('click', () => $('hf-import-json-file')?.click());
  $('hf-import-json-file')?.addEventListener('change', importJsonSettings);
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('keyup', handleKeyUp, true);
  window.addEventListener('resize', resizeRenderer);
  OC.stage?.addEventListener('pointerdown', () => OC.stage?.focus?.());
}

function initThree() {
  OC.textureLoader = new THREE.TextureLoader();
  OC.gltfLoader = new GLTFLoader();
  OC.scene = new THREE.Scene();
  OC.camera = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 5000);
  OC.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  OC.stage.tabIndex = 0;
  OC.renderer.domElement.tabIndex = 0;
  OC.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  OC.renderer.outputEncoding = THREE.sRGBEncoding;
  OC.stage.appendChild(OC.renderer.domElement);
  OC.world = new THREE.Group();
  OC.scene.add(OC.world);
  OC.scene.add(new THREE.HemisphereLight(0xffffff, 0x203020, 1.25));
  const sun = new THREE.DirectionalLight(0xffffff, 1.05);
  sun.position.set(-8, 16, 8);
  OC.scene.add(sun);
  OC.grid = new THREE.GridHelper(140, 70, 0xeec45a, 0x2d5b42);
  OC.grid.position.y = GROUND_Y + 0.08;
  OC.grid.visible = false;
  OC.scene.add(OC.grid);
  OC.clock = new THREE.Clock();
  applyCamera();
  resizeRenderer();
  applyBackgroundPlate();
  drawFrame();
}

function applyCamera() {
  if (!OC.camera) return;
  const camX = (OC.vanishX || 0) * 0.035;
  const lookX = (OC.vanishX || 0) * 0.07;
  const lookY = GROUND_Y + (OC.vanishY || 0) * 0.05;
  OC.camera.position.set(camX, 4.4, 10.8);
  OC.camera.lookAt(lookX, lookY, -92);
  OC.camera.rotation.z += (OC.cameraAngle || 0) * 0.0035;
  OC.camera.updateProjectionMatrix();
  applyBackgroundPlate();
}

function resizeRenderer() {
  if (!OC.renderer || !OC.stage || !OC.camera) return;
  const width = Math.max(1, OC.stage.clientWidth);
  const height = Math.max(300, Math.round(width * 9 / 16));
  OC.camera.aspect = width / height;
  OC.camera.updateProjectionMatrix();
  OC.renderer.setSize(width, height);
}

function applyBackgroundPlate() {
  if (!OC.stage) return;
  if (OC.whiteBackground) {
    OC.stage.style.setProperty('--oc-bg-image', 'none');
    OC.stage.style.backgroundColor = '#ffffff';
    return;
  }
  const x = 50 + (OC.vanishX || 0) * 0.18;
  const y = 50 + (OC.vanishY || 0) * 0.18 + (OC.backgroundJumpShift || 0);
  const zoom = Math.max(100, Math.round((OC.backgroundZoom || 1.1) * 100));
  OC.stage.style.backgroundColor = '#05080d';
  OC.stage.style.setProperty('--oc-bg-image', `url("${ASSETS.background}?v=${CACHE_VERSION}")`);
  OC.stage.style.setProperty('--oc-bg-size', `${zoom}%`);
  OC.stage.style.setProperty('--oc-bg-x', `${clamp(x, -25, 125)}%`);
  OC.stage.style.setProperty('--oc-bg-y', `${clamp(y, -25, 125)}%`);
}

function updateBackgroundJumpShift() {
  OC.backgroundJumpShift = clamp((OC.player.y || 0) * 3.5, 0, 18);
  applyBackgroundPlate();
}


function loadTexture(url, options = {}) {
  const key = `${url}|${JSON.stringify(options)}`;
  if (OC.textureCache.has(key)) return OC.textureCache.get(key);
  const texture = OC.textureLoader.load(`${url}?v=${CACHE_VERSION}`, undefined, undefined, () => console.warn('[ObstacleCourse] texture failed', url));
  texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  if (options.repeat) {
    texture.wrapS = options.repeatX === false ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    texture.wrapT = options.repeatY === false ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    texture.repeat.set(options.repeat[0], options.repeat[1]);
  }
  OC.textureCache.set(key, texture);
  return texture;
}

function setLoading(count, total) {
  OC.loadingCount = count;
  OC.loadingTotal = total;
  const message = `Assets ${count} / ${total}`;
  const node = $('oc-loading');
  if (node) node.textContent = `Loading ${message}`;
  const top = $('oc-top-load');
  if (top) top.textContent = message;
  const horseCount = $('oc-loading-horse-count');
  if (horseCount) horseCount.textContent = message;
}

async function preloadAssets() {
  const firstImages = [ASSETS.background, ASSETS.horse];
  const requiredImages = [
    ASSETS.ground,
    ASSETS.powerbars,
    ASSETS.arrows,
    ...Object.values(ASSETS.pathSegments).map((item) => item.file),
  ];
  const requiredAlpha = Object.values(ASSETS.pathSegments);
  const optionalGlb = GLB_ASSETS;
  const total = firstImages.length + requiredImages.length + requiredAlpha.length + optionalGlb.length;
  let count = 0;
  OC.requiredAssetFailures = [];
  setLoading(0, total);

  for (const url of firstImages) {
    const ok = await preloadImage(url);
    count += 1;
    setLoading(count, total);
    if (!ok) OC.requiredAssetFailures.push(url);
  }

  const loadingHorse = $('oc-loading-horse');
  if (loadingHorse) loadingHorse.hidden = false;

  await Promise.all(requiredImages.map((url) => preloadImage(url).then((ok) => {
    count += 1;
    setLoading(count, total);
    if (!ok) OC.requiredAssetFailures.push(url);
  })));

  await Promise.all(requiredAlpha.map((def) => loadPathAlphaMap(def).then((ok) => {
    count += 1;
    setLoading(count, total);
    if (!ok) OC.requiredAssetFailures.push(def.file);
  })));

  OC.requiredReady = OC.requiredAssetFailures.length === 0;
  const startButton = $('obstacle-start');
  if (startButton) startButton.disabled = !OC.requiredReady;

  if (OC.requiredReady) {
    regenerateCourse();
    updateStats();
    setResult('Required obstacle course assets ready. Optional 3D assets are still loading.', 'success');
  } else {
    const title = $('oc-loading-horse-title');
    if (title) title.textContent = 'Required assets missing';
    setResult(`Required asset failure: ${OC.requiredAssetFailures.join(', ')}`, 'failure');
    updateStats();
    showLayerLoadFailure();
    return;
  }

  await Promise.all(optionalGlb.map((asset) => loadGlbAsset(asset).finally(() => {
    count += 1;
    setLoading(count, total);
  })));

  OC.loadingDone = true;
  const node = $('oc-loading');
  if (node) node.textContent = `Loading assets ${count} / ${total} complete`;
  const top = $('oc-top-load');
  if (top) top.textContent = `Assets ${count} / ${total} loaded`;
  if (loadingHorse) loadingHorse.hidden = true;

  regenerateCourse();
  updateStats();
  setResult('Obstacle course ready.', 'success');
}

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => {
      console.warn('[ObstacleCourse] required image failed', url);
      resolve(false);
    };
    img.src = `${url}?v=${CACHE_VERSION}`;
  });
}

function loadGlbAsset(asset) {
  return new Promise((resolve) => {
    OC.gltfLoader.load(`${asset.url}?v=${CACHE_VERSION}`, (gltf) => {
      const scene = gltf.scene || gltf.scenes?.[0];
      if (scene) {
        normalizeGlbTemplate(scene);
        OC.glbTemplates.set(asset.url, { asset, scene });
      }
      resolve(true);
    }, undefined, (error) => {
      if (!asset.optional) console.warn('[ObstacleCourse] GLB failed', asset.url, error);
      resolve(false);
    });
  });
}

function normalizeGlbTemplate(root) {
  root.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = false;
      node.receiveShadow = true;
      if (node.material) {
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach((mat) => {
          if (mat.map) mat.map.encoding = THREE.sRGBEncoding;
          mat.transparent = mat.transparent || false;
        });
      }
    }
  });
}

function makeLayer(id, label, group, options = {}) {
  const layer = {
    id, label, group,
    visible: options.visible ?? true,
    opacity: options.opacity ?? 1,
    x: options.x ?? 0,
    y: options.y ?? 0,
    z: options.z ?? 0,
    scale: options.scale ?? 1,
    brightness: options.brightness ?? 1,
    contrast: options.contrast ?? 1,
    saturation: options.saturation ?? 1,
    tint: options.tint ?? '#ffffff',
    tintStrength: options.tintStrength ?? 0,
    order: options.order ?? 0,
  };
  OC.layers.set(id, layer);
  return layer;
}

function isLayerDisplayed(layer) {
  if (!layer) return false;
  if (OC.soloLayerId) return layer.id === OC.soloLayerId;
  return layer.visible;
}

function rememberBaseScale(node) {
  if (!node?.userData) return;
  if (!node.userData.baseScale) node.userData.baseScale = node.scale.clone();
}

function rememberBaseMaterial(mat) {
  if (!mat?.userData) mat.userData = {};
  if (mat.color && !mat.userData.baseColor) mat.userData.baseColor = mat.color.clone();
}


function ensureVisualShader(mat) {
  if (!mat || mat.userData?.ocVisualShaderInstalled) return;
  mat.userData.ocVisualShaderInstalled = true;
  mat.userData.ocVisualUniforms = null;
  mat.userData.ocVisualConfig = mat.userData.ocVisualConfig || {
    brightness: 1,
    contrast: 1,
    saturation: 1,
    tint: '#ffffff',
    tintStrength: 0,
  };
  mat.onBeforeCompile = (shader) => {
    const cfg = mat.userData.ocVisualConfig || {};
    shader.uniforms.ocBrightness = { value: cfg.brightness ?? 1 };
    shader.uniforms.ocContrast = { value: cfg.contrast ?? 1 };
    shader.uniforms.ocSaturation = { value: cfg.saturation ?? 1 };
    shader.uniforms.ocTintColor = { value: new THREE.Color(cfg.tint || '#ffffff') };
    shader.uniforms.ocTintStrength = { value: clamp(cfg.tintStrength || 0, 0, 1) };
    mat.userData.ocVisualUniforms = shader.uniforms;
    shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', `
      vec3 ocCol = gl_FragColor.rgb;
      ocCol = (ocCol - 0.5) * ocContrast + 0.5;
      float ocGray = dot(ocCol, vec3(0.299, 0.587, 0.114));
      ocCol = mix(vec3(ocGray), ocCol, ocSaturation);
      ocCol *= ocBrightness;
      ocCol = mix(ocCol, ocTintColor, ocTintStrength);
      gl_FragColor.rgb = clamp(ocCol, 0.0, 1.0);
      #include <dithering_fragment>
    `);
  };
  mat.customProgramCacheKey = () => 'oc-visual-shader-v2';
  mat.needsUpdate = true;
}

function updateVisualShaderUniforms(mat, cfg) {
  if (!mat) return;
  const visualConfig = {
    brightness: cfg.brightness ?? 1,
    contrast: cfg.contrast ?? 1,
    saturation: cfg.saturation ?? 1,
    tint: cfg.tint || '#ffffff',
    tintStrength: clamp(cfg.tintStrength || 0, 0, 1),
  };
  mat.userData.ocVisualConfig = visualConfig;
  ensureVisualShader(mat);
  const uniforms = mat.userData?.ocVisualUniforms;
  if (uniforms) {
    uniforms.ocBrightness.value = visualConfig.brightness;
    uniforms.ocContrast.value = visualConfig.contrast;
    uniforms.ocSaturation.value = visualConfig.saturation;
    uniforms.ocTintColor.value.set(visualConfig.tint);
    uniforms.ocTintStrength.value = visualConfig.tintStrength;
  } else {
    mat.needsUpdate = true;
  }
}

function applyVisualToMaterial(mat, cfg) {
  if (!mat) return;
  rememberBaseMaterial(mat);
  const opacity = cfg.opacity ?? 1;
  mat.transparent = opacity < 0.995 || mat.transparent;
  mat.opacity = opacity;
  updateVisualShaderUniforms(mat, cfg);
  mat.needsUpdate = true;
}

function applyLayer(layer) {
  if (!layer?.group) return;
  layer.group.visible = isLayerDisplayed(layer);
  layer.group.position.set(layer.x || 0, layer.y || 0, layer.z || 0);
  layer.group.scale.setScalar(['ground'].includes(layer.id) ? (layer.scale || 1) : 1);
  layer.group.children.forEach((child) => {
    rememberBaseScale(child);
    if (!['ground'].includes(layer.id)) {
      const base = child.userData.baseScale || child.scale;
      child.scale.copy(base).multiplyScalar(layer.scale || 1);
    }
  });
  layer.group.traverse((node) => {
    node.renderOrder = layer.order || 0;
    if (!node.material) return;
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    mats.forEach((mat) => applyVisualToMaterial(mat, layer));
  });
}

function applyAllLayers() {
  OC.layers.forEach(applyLayer);
  applyAllGlbAssetControls();
}

function populateLayerSelect() {
  const select = $('hf-layer-select');
  if (!select) return;
  const selected = OC.selectedLayerId;
  const options = [
    ['ground', 'Forest ground'],
    ['path', 'Path'],
    ['trees', 'Trees'],
    ['rocks', 'Rocks'],
    ['details', 'Ferns / bushes'],
    ['collectibles', 'Collectibles'],
    ['obstacles', 'Obstacles'],
    ['glbAsset', 'GLB Asset'],
  ];
  select.innerHTML = options.map(([id, label]) => `<option value="${id}">${label}</option>`).join('');
  select.value = options.some(([id]) => id === selected) ? selected : 'path';
  OC.selectedLayerId = select.value;
}

function buildSliderRow(host, prefix, prop, label, min, max, step, value, handler) {
  const row = document.createElement('div');
  row.className = 'range-row oc-enhanced-range';
  const id = `${prefix}-${prop}`;
  const numericValue = Number(value || 0);
  row.innerHTML = `
    <span class="oc-range-title">${label}</span>
    <span class="oc-range-stepper">
      <button type="button" class="oc-range-step" data-delta="-1" aria-label="${label} down">&lt;</button>
      <input id="${id}-value" class="oc-range-value" type="number" min="${min}" max="${max}" step="${step}" value="${formatNumber(numericValue)}">
      <button type="button" class="oc-range-step" data-delta="1" aria-label="${label} up">&gt;</button>
    </span>
    <input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${numericValue}">
  `;
  host.appendChild(row);
  const slider = row.querySelector(`#${id}`);
  const number = row.querySelector(`#${id}-value`);

  const commit = (raw) => {
    const v = clamp(Number(raw || 0), Number(min), Number(max));
    slider.value = v;
    number.value = formatNumber(v);
    handler(v);
  };

  slider.addEventListener('input', (event) => commit(event.target.value));
  number.addEventListener('change', (event) => commit(event.target.value));
  row.querySelectorAll('.oc-range-step').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const delta = Number(button.dataset.delta || 0) * Number(step || 1);
      commit(Number(slider.value || 0) + delta);
    });
  });
}

function createGlobalSliders() {
  const host = $('hf-global-sliders');
  if (!host) return;
  host.innerHTML = '';
  buildSliderRow(host, 'hf-global', 'brightness', 'Brightness', -100, 100, 1, globalBrightnessToSlider(OC.screenBrightness), (v) => { OC.screenBrightness = sliderToGlobalBrightness(v); updateScreenFilters(); });
  buildSliderRow(host, 'hf-global', 'contrast', 'Contrast', -100, 100, 1, globalContrastToSlider(OC.screenContrast), (v) => { OC.screenContrast = sliderToGlobalContrast(v); updateScreenFilters(); });
  buildSliderRow(host, 'hf-global', 'saturation', 'Saturation', -100, 100, 1, globalSaturationToSlider(OC.screenSaturation), (v) => { OC.screenSaturation = sliderToGlobalSaturation(v); updateScreenFilters(); });
  buildSliderRow(host, 'hf-global', 'tintStrength', 'Tint Amt', -100, 100, 1, tintToSlider(OC.screenTintStrength), (v) => { OC.screenTintStrength = sliderToTint(v); updateScreenFilters(); });
  const tintRow = document.createElement('label');
  tintRow.className = 'field-block';
  tintRow.innerHTML = `<span>Screen Tint</span><input id="hf-global-tint" type="color" value="${OC.screenTint}">`;
  host.appendChild(tintRow);
  tintRow.querySelector('input').addEventListener('input', (event) => { OC.screenTint = event.target.value; updateScreenFilters(); });
}

function showLayerLoadFailure() {
  const host = $('hf-layer-sliders');
  if (!host) return;
  host.innerHTML = `<p class="hint-text">Required assets failed to load. Open Asset Debug for exact missing paths.</p>`;
  const label = $('hf-layer-selected-label');
  if (label) label.textContent = 'Layer controls unavailable until required assets load.';
}

function createLayerSliders() {
  const host = $('hf-layer-sliders');
  if (!host) return;
  host.innerHTML = '';
  const label = $('hf-layer-selected-label');
  if (label) label.textContent = OC.selectedLayerId === 'glbAsset' ? 'Selected: GLB Asset' : `Selected: ${OC.layers.get(OC.selectedLayerId)?.label || OC.selectedLayerId}`;
  if (OC.selectedLayerId === 'glbAsset') {
    createGlbAssetSliders(host);
    refreshGlbSelectionBoxes();
    return;
  }
  const layer = OC.layers.get(OC.selectedLayerId);
  if (!layer) {
    host.innerHTML = '<p class="hint-text">No layer selected.</p>';
    return;
  }
  layer.scaleOffset = layer.scaleOffset ?? factorToSigned(layer.scale);
  layer.brightnessOffset = layer.brightnessOffset ?? visualFactorToSlider(layer.brightness);
  layer.contrastOffset = layer.contrastOffset ?? visualFactorToSlider(layer.contrast);
  layer.saturationOffset = layer.saturationOffset ?? visualFactorToSlider(layer.saturation);
  layer.opacityOffset = layer.opacityOffset ?? opacityToSlider(layer.opacity);

  buildSliderRow(host, 'hf-layer', 'x', 'X', -100, 100, 1, layer.x || 0, (v) => { layer.x = v; applyLayer(layer); drawFrame(); scheduleOverviewDraw(); });
  buildSliderRow(host, 'hf-layer', 'z', 'Z', -100, 100, 1, layer.z || 0, (v) => { layer.z = v; applyLayer(layer); drawFrame(); scheduleOverviewDraw(); });
  buildSliderRow(host, 'hf-layer', 'y', 'Y', -100, 100, 1, layer.y || 0, (v) => { layer.y = v; applyLayer(layer); drawFrame(); });
  buildSliderRow(host, 'hf-layer', 'scaleOffset', 'Scale', -100, 100, 1, layer.scaleOffset, (v) => { layer.scaleOffset = v; layer.scale = signedToFactor(v); applyLayer(layer); drawFrame(); scheduleOverviewDraw(); });
  buildSliderRow(host, 'hf-layer', 'opacityOffset', 'Opacity', -100, 100, 1, layer.opacityOffset, (v) => { layer.opacityOffset = v; layer.opacity = sliderToOpacity(v); applyLayer(layer); drawFrame(); });
  buildSliderRow(host, 'hf-layer', 'brightnessOffset', 'Bright', -100, 100, 1, layer.brightnessOffset, (v) => { layer.brightnessOffset = v; layer.brightness = sliderToVisualFactor(v); applyLayer(layer); drawFrame(); });
  buildSliderRow(host, 'hf-layer', 'contrastOffset', 'Contrast', -100, 100, 1, layer.contrastOffset, (v) => { layer.contrastOffset = v; layer.contrast = sliderToVisualFactor(v); applyLayer(layer); drawFrame(); });
  buildSliderRow(host, 'hf-layer', 'saturationOffset', 'Saturation', -100, 100, 1, layer.saturationOffset, (v) => { layer.saturationOffset = v; layer.saturation = sliderToVisualFactor(v); applyLayer(layer); drawFrame(); });
  buildSliderRow(host, 'hf-layer', 'tintStrength', 'Tint Amt', -100, 100, 1, tintToSlider(layer.tintStrength), (v) => { layer.tintStrength = sliderToTint(v); applyLayer(layer); drawFrame(); });
  buildSliderRow(host, 'hf-layer', 'order', 'Order', -100, 100, 1, layer.order || 0, (v) => { layer.order = v; applyLayer(layer); drawFrame(); });
  const tintRow = document.createElement('label');
  tintRow.className = 'field-block';
  tintRow.innerHTML = `<span>Layer Tint</span><input id="hf-layer-tint" type="color" value="${layer.tint || '#ffffff'}">`;
  host.appendChild(tintRow);
  tintRow.querySelector('input').addEventListener('input', (event) => { layer.tint = event.target.value; applyLayer(layer); drawFrame(); });
  refreshGlbSelectionBoxes();
}


function glbControl(url) {
  if (!url) return null;
  if (!OC.glbControls.has(url)) {
    OC.glbControls.set(url, { x: 0, y: 0, z: 0, scale: 1, scaleOffset: 0, opacity: 1, brightness: 1, brightnessOffset: 0, contrast: 1, contrastOffset: 0, saturation: 1, saturationOffset: 0, tint: '#ffffff', tintStrength: 0, order: 0 });
  }
  return OC.glbControls.get(url);
}

function createGlbAssetSliders(host) {
  const urls = Array.from(new Set([...OC.glbAssetUrls, ...OC.glbInstances.map((obj) => obj.userData.glbAssetUrl).filter(Boolean)]));
  if (!OC.selectedGlbAssetUrl && urls.length) OC.selectedGlbAssetUrl = urls[0];
  const row = document.createElement('label');
  row.className = 'field-block';
  row.innerHTML = `<span>GLB Asset</span><select id="hf-glb-asset-select">${urls.map((url) => `<option value="${url}">${url.split('/').pop()}</option>`).join('')}</select>`;
  host.appendChild(row);
  const select = row.querySelector('select');
  select.value = OC.selectedGlbAssetUrl;
  select.addEventListener('change', (event) => {
    OC.selectedGlbAssetUrl = event.target.value;
    refreshGlbSelectionBoxes();
    createLayerSliders();
    scheduleOverviewDraw();
  });
  const cfg = glbControl(OC.selectedGlbAssetUrl);
  if (!cfg) return;
  buildSliderRow(host, 'hf-glb', 'x', 'X', -100, 100, 1, cfg.x || 0, (v) => { cfg.x = v; applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'z', 'Z', -100, 100, 1, cfg.z || 0, (v) => { cfg.z = v; applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'y', 'Y', -100, 100, 1, cfg.y || 0, (v) => { cfg.y = v; applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'scaleOffset', 'Scale', -100, 100, 1, cfg.scaleOffset || 0, (v) => { cfg.scaleOffset = v; cfg.scale = signedToFactor(v); applyAllGlbAssetControls(); });
  cfg.opacityOffset = cfg.opacityOffset ?? opacityToSlider(cfg.opacity);
  buildSliderRow(host, 'hf-glb', 'opacityOffset', 'Opacity', -100, 100, 1, cfg.opacityOffset, (v) => { cfg.opacityOffset = v; cfg.opacity = sliderToOpacity(v); applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'brightnessOffset', 'Bright', -100, 100, 1, cfg.brightnessOffset || 0, (v) => { cfg.brightnessOffset = v; cfg.brightness = sliderToVisualFactor(v); applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'contrastOffset', 'Contrast', -100, 100, 1, cfg.contrastOffset || 0, (v) => { cfg.contrastOffset = v; cfg.contrast = sliderToVisualFactor(v); applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'saturationOffset', 'Saturation', -100, 100, 1, cfg.saturationOffset || 0, (v) => { cfg.saturationOffset = v; cfg.saturation = sliderToVisualFactor(v); applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'tintStrength', 'Tint Amt', -100, 100, 1, tintToSlider(cfg.tintStrength), (v) => { cfg.tintStrength = sliderToTint(v); applyAllGlbAssetControls(); });
  buildSliderRow(host, 'hf-glb', 'order', 'Order', -100, 100, 1, cfg.order || 0, (v) => { cfg.order = v; applyAllGlbAssetControls(); });
  const tintRow = document.createElement('label');
  tintRow.className = 'field-block';
  tintRow.innerHTML = `<span>GLB Tint</span><input id="hf-glb-tint" type="color" value="${cfg.tint || '#ffffff'}">`;
  host.appendChild(tintRow);
  tintRow.querySelector('input').addEventListener('input', (event) => { cfg.tint = event.target.value; applyAllGlbAssetControls(); });
  refreshGlbSelectionBoxes();
}

function toggleSelectedLayerVisible() {
  const layer = OC.layers.get(OC.selectedLayerId);
  if (!layer) return;
  layer.visible = !layer.visible;
  applyAllLayers();
  drawOverview();
}

function toggleSelectedLayerSolo() {
  if (!OC.layers.has(OC.selectedLayerId)) return;
  OC.soloLayerId = OC.soloLayerId === OC.selectedLayerId ? null : OC.selectedLayerId;
  applyAllLayers();
  drawOverview();
}

function nudgeSelectedOrder(delta) {
  const layer = OC.layers.get(OC.selectedLayerId);
  if (!layer) return;
  layer.order = (layer.order || 0) + delta;
  applyLayer(layer);
  createLayerSliders();
  drawFrame();
}

function toggleWhiteBackground() {
  OC.whiteBackground = !OC.whiteBackground;
  if (OC.scene) OC.scene.background = null;
  applyBackgroundPlate();
  drawFrame();
}

function updateScreenFilters() {
  const brightness = clamp(OC.screenBrightness || 1, 0, 2.5);
  const contrast = clamp(OC.screenContrast || 1, 0, 2.5);
  const saturation = clamp(OC.screenSaturation || 1, 0, 2.5);
  const filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;

  const canvas = OC.renderer?.domElement;
  if (canvas) canvas.style.filter = filter;

  const tint = document.querySelector('.obstacle-tint-overlay');
  if (tint) {
    tint.style.setProperty('--oc-tint', OC.screenTint || '#000000');
    tint.style.setProperty('--oc-tint-opacity', String(clamp(OC.screenTintStrength || 0, 0, 1)));
    tint.style.opacity = String(clamp(OC.screenTintStrength || 0, 0, 1));
  }

  renderOnce();
}

function normalizePathSegmentId(id) {
  const key = String(id || '').trim();
  if (ASSETS.pathSegments[key]) return key;
  const found = Object.entries(ASSETS.pathSegments).find(([, def]) => def.id === key || def.key === key);
  return found?.[0] || 'straight';
}

function applySettingsObject(data, options = {}) {
  if (!data || typeof data !== 'object') return;
  if (data.templateId) OC.templateId = data.templateId;
  if (data.difficulty !== undefined) OC.difficulty = Number(data.difficulty);
  if (data.courseLength !== undefined) OC.courseLength = Number(data.courseLength);
  if (data.speed !== undefined) OC.speed = Number(data.speed);
  if (data.sceneryDistance !== undefined) OC.sceneryDistance = Number(data.sceneryDistance);
  if (data.pathVisualWidth !== undefined) OC.pathVisualWidth = Number(data.pathVisualWidth);
  if (data.vanishX !== undefined) OC.vanishX = Number(data.vanishX);
  if (data.vanishY !== undefined) OC.vanishY = Number(data.vanishY);
  if (data.cameraAngle !== undefined) OC.cameraAngle = Number(data.cameraAngle);
  if (data.backgroundZoom !== undefined) OC.backgroundZoom = Number(data.backgroundZoom);
  if (data.visual) {
    OC.screenBrightness = data.visual.brightness ?? OC.screenBrightness;
    OC.screenContrast = data.visual.contrast ?? OC.screenContrast;
    OC.screenSaturation = data.visual.saturation ?? OC.screenSaturation;
    OC.screenTint = data.visual.tint ?? OC.screenTint;
    OC.screenTintStrength = data.visual.tintStrength ?? OC.screenTintStrength;
  }
  if (data.pathSegments && Array.isArray(data.pathSegments)) {
    OC.customPathSequence = data.pathSegments.map((seg, i) => {
      const key = normalizePathSegmentId(seg.id);
      const def = ASSETS.pathSegments[key] || ASSETS.pathSegments.straight;
      const start = seg.start || def.start;
      const end = seg.end || def.end;
      const distance = Number(seg.distance ?? i * SEGMENT_WORLD_STEP);
      return { ...def, key, id: def.id, start, end, startX: PATH_POSITIONS[start] ?? 0, endX: PATH_POSITIONS[end] ?? 0, distance };
    });
  }
  if (data.layers) {
    Object.entries(data.layers).forEach(([id, cfg]) => {
      const pending = OC.pendingLayerSettings || (OC.pendingLayerSettings = {});
      pending[id] = { ...(pending[id] || {}), ...cfg };
      const layer = OC.layers.get(id);
      if (layer) Object.assign(layer, cfg);
    });
  }
  if (data.glbControls) OC.glbControls = new Map(Object.entries(data.glbControls));
  if (options.updateUi) syncUiFromState();
}

function applyDefaultSettings() {
  if (OC.defaultSettingsApplied) return;
  applySettingsObject(DEFAULT_SETTINGS);
  OC.defaultSettingsApplied = true;
}

function syncUiFromState() {
  if ($('obstacle-template')) $('obstacle-template').value = OC.templateId;
  if ($('obstacle-difficulty')) $('obstacle-difficulty').value = OC.difficulty;
  if ($('obstacle-difficulty-out')) $('obstacle-difficulty-out').textContent = OC.difficulty;
  if ($('obstacle-distance')) $('obstacle-distance').value = OC.courseLength;
  if ($('obstacle-distance-out')) $('obstacle-distance-out').textContent = OC.courseLength;
  if ($('obstacle-scenery-distance')) $('obstacle-scenery-distance').value = OC.sceneryDistance;
  if ($('obstacle-scenery-distance-out')) $('obstacle-scenery-distance-out').textContent = Number(OC.sceneryDistance).toFixed(1);
  if ($('oc-vp-x')) $('oc-vp-x').value = OC.vanishX || 0;
  if ($('oc-vp-x-out')) $('oc-vp-x-out').textContent = Number(OC.vanishX || 0).toFixed(1);
  if ($('oc-vp-y')) $('oc-vp-y').value = OC.vanishY || 0;
  if ($('oc-vp-y-out')) $('oc-vp-y-out').textContent = Number(OC.vanishY || 0).toFixed(2);
  if ($('oc-vp-angle')) $('oc-vp-angle').value = OC.cameraAngle || 0;
  if ($('oc-vp-angle-out')) $('oc-vp-angle-out').textContent = Number(OC.cameraAngle || 0).toFixed(1);
  createGlobalSliders();
  createLayerSliders();
  updateScreenFilters();
}


function generatePathSequence() {
  if (OC.customPathSequence?.length) {
    OC.pathSequence = OC.customPathSequence.map((seg) => ({ ...seg }));
    return;
  }
  OC.pathSequence = [];
  let pos = 'centre';
  const count = Math.ceil((OC.courseLength + 420) / SEGMENT_WORLD_STEP);
  for (let i = 0; i < count; i += 1) {
    let choices;
    if (pos === 'left') choices = [ASSETS.pathSegments.straight, ASSETS.pathSegments.kink, ASSETS.pathSegments.leftToStraight, ASSETS.pathSegments.leftToStraight];
    else if (pos === 'right') choices = [ASSETS.pathSegments.straight, ASSETS.pathSegments.kink, ASSETS.pathSegments.rightToStraight, ASSETS.pathSegments.rightToStraight];
    else choices = [ASSETS.pathSegments.straight, ASSETS.pathSegments.straight, ASSETS.pathSegments.kink, ASSETS.pathSegments.left, ASSETS.pathSegments.right];
    let def = pick(choices);
    if (pos !== 'centre' && def.start === 'centre') def = pos === 'left' ? ASSETS.pathSegments.leftToStraight : ASSETS.pathSegments.rightToStraight;
    const distance = i * SEGMENT_WORLD_STEP;
    const startX = PATH_POSITIONS[def.start] ?? PATH_POSITIONS[pos] ?? 0;
    const endX = PATH_POSITIONS[def.end] ?? startX;
    OC.pathSequence.push({ ...def, distance, startX, endX });
    pos = def.end;
  }
}

function clearWorld() {
  if (!OC.world) return;
  while (OC.world.children.length) {
    const child = OC.world.children.pop();
    child.traverse?.((node) => {
      if (node.userData?.fromGlbTemplate) return;
      node.geometry?.dispose?.();
      if (Array.isArray(node.material)) node.material.forEach((mat) => mat.dispose?.());
      else node.material?.dispose?.();
    });
  }
  OC.objects = [];
  OC.placed = [];
  OC.glbInstances = [];
  clearSelectionBoxes();
}

function regenerateCourse() {
  if (!OC.world || !OC.scene) return;
  clearWorld();
  OC.layers.clear();
  OC.distance = 0;
  resetRun(true);
  buildMaterials();
  buildWorld();
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  addObstacles(Math.round((7 + OC.difficulty * 4) * template.obstacleRate));
  addCollectibles(5 + OC.difficulty * 2);
  populateLayerSelect();
  createLayerSliders();
  applyAllLayers();
  refreshGlbSelectionBoxes();
  updateTemplateText();
  updateStats();
  drawOverview();
  renderOnce();
}

function buildMaterials() {
  const length = Math.max(OC.courseLength + 780, SEGMENT_WORLD_STEP * 6);
  const groundMap = loadTexture(ASSETS.ground, { repeat: [1, Math.max(1, length / OC.groundTextureWorldSize)], repeatX: false });
  groundMap.wrapS = THREE.ClampToEdgeWrapping;
  groundMap.wrapT = THREE.RepeatWrapping;
  OC.scene.background = null;
  applyBackgroundPlate();
  OC.groundMaterial = new THREE.MeshStandardMaterial({
    map: groundMap,
    bumpMap: groundMap,
    displacementMap: groundMap,
    bumpScale: OC.bumpStrength,
    displacementScale: OC.displacementStrength,
    roughness: 1,
    metalness: 0,
    transparent: true,
    alphaTest: 0.01,
    opacity: 1,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}

function applyPendingLayerSettings() {
  if (!OC.pendingLayerSettings) return;
  Object.entries(OC.pendingLayerSettings).forEach(([id, cfg]) => {
    const layer = OC.layers.get(id);
    if (layer) Object.assign(layer, cfg);
  });
}

function buildWorld() {
  const groundLayer = new THREE.Group();
  const pathLayer = new THREE.Group();
  const treeLayer = new THREE.Group();
  const rockLayer = new THREE.Group();
  const detailLayer = new THREE.Group();
  const collectibleLayer = new THREE.Group();
  const obstacleLayer = new THREE.Group();
  OC.world.add(groundLayer, pathLayer, treeLayer, rockLayer, detailLayer, collectibleLayer, obstacleLayer);
  makeLayer('ground', 'Forest ground', groundLayer, { order: 0 });
  makeLayer('path', 'Path', pathLayer, { order: 4 });
  makeLayer('trees', 'Trees', treeLayer, { order: 12 });
  makeLayer('rocks', 'Rocks', rockLayer, { order: 13 });
  makeLayer('details', 'Ferns / bushes', detailLayer, { order: 14 });
  makeLayer('collectibles', 'Collectibles', collectibleLayer, { order: 15 });
  makeLayer('obstacles', 'Obstacles', obstacleLayer, { order: 16 });
  applyPendingLayerSettings();
  generatePathSequence();
  buildGround(groundLayer);
  buildPathSegments(pathLayer);
  buildTreeCorridor(treeLayer);
  scatterForestFloorDetail(rockLayer);
  scatterPathEdgeDetails(detailLayer);
}

function buildGround(parent) {
  const length = Math.max(OC.courseLength + 780, SEGMENT_WORLD_STEP * 6);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(OC.groundVisualWidth, length, 36, 96), OC.groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, GROUND_Y, -length / 2 + 120);
  ground.renderOrder = 0;
  parent.add(ground);
}

function getPathMaterial(def) {
  if (OC.pathMaterialCache.has(def.id)) return OC.pathMaterialCache.get(def.id);
  const texture = loadTexture(def.file);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.03, depthWrite: false, side: THREE.DoubleSide });
  OC.pathMaterialCache.set(def.id, material);
  return material;
}

function buildPathSegments(parent) {
  OC.pathSequence.forEach((seg) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(OC.pathVisualWidth, SEGMENT_WORLD_LENGTH, 1, 1), getPathMaterial(seg));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set((seg.startX + seg.endX) / 2, GROUND_Y + 0.052, -seg.distance - SEGMENT_WORLD_LENGTH / 2);
    mesh.renderOrder = 4;
    mesh.userData.pathSegment = seg;
    parent.add(mesh);
  });
}

function pathCenterAt(distance) {
  if (!OC.pathSequence.length) return 0;
  const index = clamp(Math.floor(distance / SEGMENT_WORLD_STEP), 0, OC.pathSequence.length - 1);
  const seg = OC.pathSequence[index];
  const t = clamp((distance - seg.distance) / SEGMENT_WORLD_LENGTH, 0, 1);
  const eased = t * t * (3 - 2 * t);
  return seg.startX + (seg.endX - seg.startX) * eased;
}

function playerWorldX() {
  return pathCenterAt(OC.distance) + OC.player.x;
}

function ensurePathAlphaMaps() {
  return Promise.all(Object.values(ASSETS.pathSegments).map(loadPathAlphaMap));
}

function loadPathAlphaMap(def) {
  if (!def) return Promise.resolve(false);
  if (OC.pathAlphaMaps.has(def.id)) return Promise.resolve(Boolean(OC.pathAlphaMaps.get(def.id)));
  if (OC.pathAlphaPromises.has(def.id)) return OC.pathAlphaPromises.get(def.id);

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        OC.pathAlphaMaps.set(def.id, {
          width: canvas.width,
          height: canvas.height,
          data: ctx.getImageData(0, 0, canvas.width, canvas.height).data
        });
        resolve(true);
      } catch (error) {
        console.warn('[ObstacleCourse] path alpha map failed', def.id, error);
        OC.pathAlphaMaps.set(def.id, null);
        resolve(false);
      }
    };
    img.onerror = () => {
      console.warn('[ObstacleCourse] path alpha map image failed', def.file);
      OC.pathAlphaMaps.set(def.id, null);
      resolve(false);
    };
    img.src = `${def.file}?v=${CACHE_VERSION}`;
  });

  OC.pathAlphaPromises.set(def.id, promise);
  return promise;
}

function alphaSegmentAt(distance) {
  if (!OC.pathSequence.length) return null;
  const index = clamp(Math.floor(distance / SEGMENT_WORLD_STEP), 0, OC.pathSequence.length - 1);
  return OC.pathSequence[index] || null;
}

function sampleAlpha(map, u, v, radius = 1) {
  if (!map?.data) return null;
  const cx = clamp(Math.round(u * (map.width - 1)), 0, map.width - 1);
  const cy = clamp(Math.round(v * (map.height - 1)), 0, map.height - 1);
  let maxAlpha = 0;
  for (let yy = -radius; yy <= radius; yy += 1) {
    const py = clamp(cy + yy, 0, map.height - 1);
    for (let xx = -radius; xx <= radius; xx += 1) {
      const px = clamp(cx + xx, 0, map.width - 1);
      maxAlpha = Math.max(maxAlpha, map.data[(py * map.width + px) * 4 + 3] || 0);
    }
  }
  return maxAlpha;
}

function pathAlphaAtWorld(worldX, distance) {
  const seg = alphaSegmentAt(distance);
  if (!seg) return null;
  const map = OC.pathAlphaMaps.get(seg.id);
  if (!map) return null;
  const width = OC.pathVisualWidth;
  const meshCenterX = (seg.startX + seg.endX) / 2;
  const u = clamp(((worldX - meshCenterX) / width) + 0.5, 0, 1);
  const t = clamp((distance - seg.distance) / SEGMENT_WORLD_LENGTH, 0, 1);
  return Math.max(sampleAlpha(map, u, t, 2) || 0, sampleAlpha(map, u, 1 - t, 2) || 0);
}

function nearestVisiblePathX(distance, fromX) {
  const seg = alphaSegmentAt(distance);
  if (!seg) return pathCenterAt(distance);
  const width = OC.pathVisualWidth;
  const meshCenterX = (seg.startX + seg.endX) / 2;
  let best = null;
  const step = Math.max(0.35, width / 48);
  for (let x = meshCenterX - width * 0.49; x <= meshCenterX + width * 0.49; x += step) {
    const alpha = pathAlphaAtWorld(x, distance) || 0;
    if (alpha >= OC.pathAlphaThreshold) {
      const dist = Math.abs(x - fromX);
      if (!best || dist < best.dist) best = { x, dist, alpha };
    }
  }
  return best?.x ?? pathCenterAt(distance);
}

function visibleCollectiblePathX(distance) {
  const centre = pathCenterAt(distance);
  const seg = alphaSegmentAt(distance);
  if (!seg) return centre;
  const width = OC.pathVisualWidth;
  const meshCenterX = (seg.startX + seg.endX) / 2;
  const candidates = [];
  const step = Math.max(0.35, width / 44);
  for (let x = meshCenterX - width * 0.48; x <= meshCenterX + width * 0.48; x += step) {
    const alpha = pathAlphaAtWorld(x, distance) || 0;
    if (alpha >= OC.collectibleAlphaThreshold) candidates.push({ x, alpha, bias: Math.abs(x - centre) });
  }
  if (!candidates.length) {
    for (let x = meshCenterX - width * 0.48; x <= meshCenterX + width * 0.48; x += step) {
      const alpha = pathAlphaAtWorld(x, distance) || 0;
      if (alpha >= OC.pathAlphaThreshold) candidates.push({ x, alpha, bias: Math.abs(x - centre) });
    }
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => (a.bias - b.bias) || (b.alpha - a.alpha));
  return pick(candidates.slice(0, Math.min(8, candidates.length))).x;
}

function pathStatus() {
  const worldX = playerWorldX();
  const alpha = pathAlphaAtWorld(worldX, OC.distance);
  if (alpha === null) {
    const abs = Math.abs(OC.player.x);
    return abs > OC.laneWidth * 0.95 ? 'off' : abs > OC.laneWidth * 0.7 ? 'edge' : 'on';
  }
  if (alpha >= OC.pathAlphaThreshold) return 'on';
  const nearest = nearestVisiblePathX(OC.distance, worldX);
  OC.pathHintDirection = nearest < worldX ? 'left' : 'right';
  return 'off';
}

function cloneGlbInstance(template) {
  const root = cloneGlbInstance(template);
  root.traverse((node) => {
    node.userData.fromGlbTemplate = true;
    if (node.isMesh) {
      if (node.geometry) node.geometry = node.geometry.clone();
      if (Array.isArray(node.material)) node.material = node.material.map((mat) => mat.clone());
      else if (node.material) node.material = node.material.clone();
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  return root;
}

function createGlbModel(type, targetHeight) {
  const assets = GLB_ASSETS.filter((asset) => asset.type === type && OC.glbTemplates.has(asset.url));
  if (!assets.length) return null;
  const asset = pick(assets);
  const template = OC.glbTemplates.get(asset.url);
  const root = template.scene.clone(true);
  const wrapper = new THREE.Group();
  wrapper.add(root);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = (targetHeight || asset.scale || 1) / Math.max(size.y, 0.001);
  root.scale.multiplyScalar(scale);
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  root.position.set(-(box2.min.x + box2.max.x) / 2, -box2.min.y, -(box2.min.z + box2.max.z) / 2);
  wrapper.userData.glbAssetUrl = asset.url;
  wrapper.userData.glbAssetLabel = asset.label;
  wrapper.userData.ocType = asset.type;
  wrapper.userData.baseScale = wrapper.scale.clone();
  return wrapper;
}

function registerGlbInstance(obj, assetType, x, z) {
  obj.userData.basePosition = obj.position.clone();
  obj.userData.baseScale = obj.scale.clone();
  obj.userData.ocType = assetType || obj.userData.ocType || 'glb';
  OC.glbInstances.push(obj);
  OC.placed.push({ type: obj.userData.ocType, x, z, mesh: obj });
}

function buildTreeCorridor(parent) {
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  const step = Math.max(32, 52 / template.treeRate);
  const maxTrees = Math.min(170, Math.round(70 + OC.courseLength / 18));
  let made = 0;
  for (let d = 32; d < OC.courseLength + 210 && made < maxTrees; d += step) {
    [-1, 1].forEach((side) => {
      if (made >= maxTrees) return;
      const rows = OC.templateId === 'horse_forest_dense' ? 3 : 2;
      for (let row = 0; row < rows && made < maxTrees; row += 1) {
        if (row > 0 && Math.random() > 0.62) continue;
        const offset = (OC.pathVisualWidth * 0.5) + OC.sceneryDistance + row * rand(4.2, 7.5) + rand(0.4, 2.2);
        addTreeAt(parent, d + rand(-8, 10), side, offset, rand(6.5, 15));
        made += 1;
      }
    });
  }
}

function addTreeAt(parent, distance, side, offset, height) {
  const tree = createGlbModel('tree', height);
  if (!tree) return;
  const x = pathCenterAt(distance) + side * offset;
  tree.position.set(x, GROUND_Y, -distance);
  tree.rotation.y = rand(0, Math.PI * 2);
  parent.add(tree);
  registerGlbInstance(tree, 'tree', x, -distance);
}

function scatterForestFloorDetail(parent) {
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  const maxRocks = Math.min(120, Math.round(42 + OC.courseLength / 28));
  let made = 0;
  for (let d = 22; d < OC.courseLength + 240 && made < maxRocks; d += rand(18, 34) / template.rockRate) {
    [-1, 1].forEach((side) => {
      if (made >= maxRocks || Math.random() > 0.74) return;
      addSceneryRock(parent, pathCenterAt(d) + side * rand(OC.pathVisualWidth * 0.5 + 1.2, OC.pathVisualWidth * 0.5 + OC.sceneryDistance + 7), d + rand(-5, 5));
      made += 1;
    });
  }
}

function addSceneryRock(parent, x, distance) {
  const rock = createGlbModel('rock', rand(0.7, 1.6)) || new THREE.Mesh(new THREE.DodecahedronGeometry(rand(0.35, 0.9), 0), new THREE.MeshStandardMaterial({ color: 0x6d665a, roughness: 1 }));
  rock.position.set(x, GROUND_Y + 0.15, -distance);
  rock.rotation.y = rand(0, Math.PI * 2);
  parent.add(rock);
  registerGlbInstance(rock, 'rock', x, -distance);
}

function scatterPathEdgeDetails(parent) {
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  const maxDetails = Math.min(160, Math.round(55 + OC.courseLength / 20));
  let made = 0;
  for (let d = 28; d < OC.courseLength + 220 && made < maxDetails; d += rand(18, 30) / template.detailRate) {
    [-1, 1].forEach((side) => {
      if (made >= maxDetails || Math.random() > 0.72) return;
      const detail = createGlbModel('detail', rand(0.9, 2.2));
      if (!detail) return;
      const edgeX = nearestVisiblePathX(d, pathCenterAt(d) + side * (OC.pathVisualWidth * 0.48));
      const x = edgeX + side * rand(0.45, 1.9);
      detail.position.set(x, GROUND_Y + 0.02, -d);
      detail.rotation.y = rand(0, Math.PI * 2);
      parent.add(detail);
      registerGlbInstance(detail, 'detail', x, -d);
      made += 1;
    });
  }
}

function addObstacles(count) {
  const parent = OC.layers.get('obstacles')?.group || OC.world;
  for (let i = 0; i < count; i += 1) {
    const distance = 85 + Math.random() * Math.max(80, OC.courseLength - 170);
    const visibleX = visibleCollectiblePathX(distance);
    const x = (visibleX === null || visibleX === undefined ? pathCenterAt(distance) : visibleX) + rand(-1.2, 1.2);
    const obj = createGlbModel('rock', rand(1.4, 2.8)) || new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x55423d, roughness: 1 }));
    obj.position.set(x, GROUND_Y + 0.3, -distance);
    obj.rotation.y = rand(0, Math.PI * 2);
    obj.userData.kind = 'obstacle';
    obj.userData.radius = 1.25;
    parent.add(obj);
    OC.objects.push(obj);
    registerGlbInstance(obj, 'obstacle', x, -distance);
  }
}

function addCollectibles(count) {
  const parent = OC.layers.get('collectibles')?.group || OC.world;
  const total = Math.max(3, Math.round(count * 0.7));
  for (let i = 0; i < total; i += 1) {
    const distance = 65 + Math.random() * Math.max(80, OC.courseLength - 120);
    const x = visibleCollectiblePathX(distance);
    if (x === null || x === undefined) continue;
    const obj = createGlbModel('collectible', Math.random() < 0.55 ? rand(1.3, 1.8) : rand(0.9, 1.35)) || new THREE.Mesh(new THREE.OctahedronGeometry(0.46, 0), new THREE.MeshBasicMaterial({ color: 0xeec45a, transparent: true, opacity: 0.95 }));
    obj.position.set(x, GROUND_Y + rand(0.22, 0.62), -distance);
    obj.rotation.y = rand(0, Math.PI * 2);
    obj.userData.kind = 'collectible';
    obj.userData.collected = false;
    obj.userData.radius = 1.15;
    obj.userData.value = GLB_ASSETS.find((asset) => asset.url === obj.userData.glbAssetUrl)?.value || 1;
    obj.userData.visiblePathOnly = true;
    parent.add(obj);
    OC.objects.push(obj);
    registerGlbInstance(obj, 'collectible', x, -distance);
  }
}

function glbConfigFor(url) {
  return url ? glbControl(url) : null;
}

function applyAllGlbAssetControls() {
  OC.glbInstances.forEach((obj) => {
    const cfg = glbConfigFor(obj.userData.glbAssetUrl);
    if (!cfg) return;
    const basePos = obj.userData.basePosition || obj.position;
    const baseScale = obj.userData.baseScale || obj.scale;
    obj.position.set(basePos.x + (cfg.x || 0), basePos.y + (cfg.y || 0), basePos.z + (cfg.z || 0));
    obj.scale.copy(baseScale).multiplyScalar(cfg.scale || 1);
    obj.traverse((node) => {
      node.renderOrder = cfg.order || 0;
      if (!node.material) return;
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((mat) => applyVisualToMaterial(mat, cfg));
    });
  });
  refreshGlbSelectionBoxes();
  drawFrame();
  drawOverview();
}

function clearSelectionBoxes() {
  OC.selectionBoxes.forEach((box) => {
    box.parent?.remove(box);
    box.dispose?.();
  });
  OC.selectionBoxes = [];
}

function refreshGlbSelectionBoxes() {
  clearSelectionBoxes();
  if (!OC.scene) return;
  if (OC.selectedLayerId === 'glbAsset' && OC.selectedGlbAssetUrl) {
    OC.glbInstances.filter((obj) => obj.userData.glbAssetUrl === OC.selectedGlbAssetUrl).forEach((obj) => {
      const helper = new THREE.BoxHelper(obj, 0xeec45a);
      helper.renderOrder = 999;
      OC.scene.add(helper);
      OC.selectionBoxes.push(helper);
    });
    return;
  }
  const layer = OC.layers.get(OC.selectedLayerId);
  if (!layer?.group || !layer.group.children.length) return;
  const helper = new THREE.BoxHelper(layer.group, 0xeec45a);
  helper.renderOrder = 999;
  OC.scene.add(helper);
  OC.selectionBoxes.push(helper);
}

function startRun() {
  document.activeElement?.blur?.();
  OC.stage?.focus?.();
  if (!OC.requiredReady) {
    setResult('Cannot start: required obstacle-course assets are missing.', 'failure');
    updateStats();
    return;
  }
  OC.active = true;
  OC.running = true;
  OC.paused = false;
  OC.complete = false;
  OC.startAssistTime = 1.2;
  startRenderLoop();
  ensureAudioReady();
  playRandomHorseVoice(true);
  updateStats();
}

function pauseRun() {
  if (!OC.active && !OC.running && OC.distance <= 0) {
    updateStats();
    return;
  }
  OC.running = !OC.running;
  OC.paused = !OC.running;
  if (!OC.running) stopMotionLoops();
  startRenderLoop();
  updateStats();
}

function resetRun(silent = false) {
  OC.active = false;
  OC.running = false;
  OC.paused = false;
  OC.complete = false;
  OC.currentSpeed = 0;
  OC.targetSpeed = 0;
  OC.distance = 0;
  OC.score = 0;
  OC.hits = 0;
  OC.jumps = 0;
  OC.collected = 0;
  OC.offPathTime = 0;
  OC.player.x = 0;
  OC.player.y = 0;
  OC.player.vy = 0;
  OC.player.grounded = true;
  OC.objects.forEach((obj) => {
    if (obj.userData.kind === 'collectible') {
      obj.visible = true;
      obj.userData.collected = false;
    }
  });
  stopMotionLoops();
  if (!silent) setResult('Run reset.', 'success');
  updateStats();
  drawFrame();
  drawOverview();
}

function isTextEntryTarget(event) {
  const target = event.target;
  if (!target) return false;
  if (target.isContentEditable) return true;
  const tag = String(target.tagName || '').toLowerCase();
  if (tag === 'textarea' || tag === 'select') return true;
  if (tag !== 'input') return false;
  const type = String(target.type || 'text').toLowerCase();
  return !['range', 'button', 'checkbox', 'color', 'radio'].includes(type);
}

function handleKeyDown(event) {
  if (isTextEntryTarget(event)) return;
  const key = normalizeKey(event);
  if (!key) return;
  OC.keys.add(key);
  event.preventDefault();
  if (key === 'jump') OC.player.jumpingHeld = true;
  if (OC.active) startRenderLoop();
}

function handleKeyUp(event) {
  if (isTextEntryTarget(event)) return;
  const key = normalizeKey(event);
  if (!key) return;
  OC.keys.delete(key);
  if (key === 'jump') OC.player.jumpingHeld = false;
  event.preventDefault();
}

function normalizeKey(event) {
  const key = String(event.key || '').toLowerCase();
  const code = String(event.code || '').toLowerCase();
  if (key === 'w' || key === 'arrowup' || code === 'keyw' || code === 'arrowup') return 'forward';
  if (key === 's' || key === 'arrowdown' || code === 'keys' || code === 'arrowdown') return 'back';
  if (key === 'a' || key === 'arrowleft' || code === 'keya' || code === 'arrowleft') return 'left';
  if (key === 'd' || key === 'arrowright' || code === 'keyd' || code === 'arrowright') return 'right';
  if (key === ' ' || key === 'spacebar' || key === 'space' || code === 'space') return 'jump';
  if (key === 'control' || key === 'ctrl' || code === 'controlleft' || code === 'controlright') return 'duck';
  return null;
}

function updateRun(dt) {
  if (!OC.active) return;
  const steer = (OC.keys.has('right') ? 1 : 0) - (OC.keys.has('left') ? 1 : 0);
  if (steer) OC.player.x += steer * OC.steerSpeed * dt;
  OC.player.x = clamp(OC.player.x, -OC.pathVisualWidth * 0.55, OC.pathVisualWidth * 0.55);

  if (OC.player.grounded && OC.keys.has('jump')) {
    OC.player.grounded = false;
    OC.player.vy = 8.5;
    OC.player.jumpHoldTime = 0;
    OC.jumps += 1;
    playClip('land', { volume: 0.2 });
  }
  if (!OC.player.grounded) {
    const holdBoost = OC.keys.has('jump') && OC.player.jumpHoldTime < OC.player.maxJumpHoldTime ? 3.3 : 0;
    OC.player.jumpHoldTime += dt;
    OC.player.vy += (-18 + holdBoost) * dt;
    OC.player.y += OC.player.vy * dt;
    if (OC.player.y <= 0) {
      OC.player.y = 0;
      OC.player.vy = 0;
      OC.player.grounded = true;
      playClip('land', { volume: 0.5 });
    }
  }

  updateBackgroundJumpShift();

  const status = pathStatus();
  if (status === 'off') OC.offPathTime += dt;
  else OC.offPathTime = 0;

  let desired = 0;
  if (OC.keys.has('forward')) desired = OC.speed;
  if (OC.keys.has('back')) desired = BACK_SPEED;
  if (OC.startAssistTime > 0) {
    desired = Math.max(desired, OC.speed * 0.72);
    OC.startAssistTime -= dt;
  }
  if (status === 'off' && desired > SLOW_TROT_SPEED) desired = SLOW_TROT_SPEED;
  if (status === 'edge' && desired > OC.speed * 0.65) desired = OC.speed * 0.65;
  OC.targetSpeed = desired;
  const rate = Math.abs(OC.targetSpeed) > Math.abs(OC.currentSpeed) ? ACCEL : DECEL;
  const diff = OC.targetSpeed - OC.currentSpeed;
  OC.currentSpeed += clamp(diff, -rate * dt, rate * dt);
  if (Math.abs(OC.currentSpeed) < 0.05) OC.currentSpeed = 0;
  if (OC.running && !OC.paused) {
    OC.distance += OC.currentSpeed * dt;
  }
  if (OC.distance >= OC.courseLength) completeRun();

  checkInteractions();
  updateRideAudio();
  updateOffPathWarning(status);
  updateHorseFrame(steer);
  updateStats();
}

function checkInteractions() {
  const px = playerWorldX();
  const pz = -OC.distance;
  const py = OC.player.y;
  OC.objects.forEach((obj) => {
    if (!obj.visible) return;
    const dx = obj.position.x - px;
    const dz = obj.position.z - pz;
    const dy = obj.position.y - (GROUND_Y + py);
    const radius = obj.userData.radius || 1;
    const dist = Math.sqrt(dx * dx + dz * dz + dy * dy);
    if (obj.userData.kind === 'collectible' && !obj.userData.collected && dist < radius + 0.9) {
      obj.userData.collected = true;
      obj.visible = false;
      OC.collected += 1;
      OC.score += obj.userData.value || 1;
      playClip('snort', { volume: 0.38 });
    } else if (obj.userData.kind === 'obstacle' && dist < radius + 0.7 && !obj.userData.hit) {
      obj.userData.hit = true;
      OC.hits += 1;
      OC.score = Math.max(0, OC.score - 1);
      playBushRustle();
    }
  });
}

function completeRun() {
  OC.complete = true;
  OC.active = false;
  OC.running = false;
  OC.currentSpeed = 0;
  OC.targetSpeed = 0;
  stopMotionLoops();
  setResult(`Complete. Score ${OC.score}, collectibles ${OC.collected}, hits ${OC.hits}.`, 'success');
}

function updateOffPathWarning(status) {
  const arrow = $('oc-offpath-arrow');
  const label = $('oc-offpath-label');
  const show = status === 'off' && OC.offPathTime >= 2;
  if (arrow) {
    arrow.classList.toggle('is-visible', show);
    arrow.classList.toggle('dir-left', OC.pathHintDirection === 'left');
    arrow.classList.toggle('dir-right', OC.pathHintDirection !== 'left');
  }
  if (label) {
    label.textContent = show ? (OC.pathHintDirection === 'left' ? '← Off Path' : 'Off Path →') : '';
  }
}

function updateHorseFrame(steer) {
  const horse = $('obstacle-horse');
  if (!horse) return;
  let frame = 3;
  if (steer < 0) frame = OC.currentSpeed > 8 ? 1 : 2;
  if (steer > 0) frame = OC.currentSpeed > 8 ? 5 : 4;
  horse.style.backgroundPosition = `${(frame / 6) * 100}% 100%`;
}

function updateStats() {
  const speed = Math.max(0, Math.round(OC.currentSpeed));
  const max = Math.max(1, Math.round(OC.speed));
  const status = pathStatus();
  const gait = status === 'off' ? 'Off Path' : speed < 3 ? 'Stopped' : speed < max * 0.45 ? 'Trot' : speed < max * 0.75 ? 'Canter' : 'Gallop';
  const clip = document.querySelector('.oc-powerbar-full-clip');
  if (clip) clip.style.width = `${clamp(speed / max, 0, 1) * 100}%`;
  const state = $('oc-speed-state');
  const value = $('oc-speed-value');
  if (!state || !value) {
    const badge = $('obstacle-speed-badge');
    if (badge) {
      badge.innerHTML = `<div class="oc-powerbar-wrap"><div class="oc-powerbar-emoji">🐴</div><div class="oc-powerbar-empty"></div><div class="oc-powerbar-full-clip"><div class="oc-powerbar-full"></div></div></div><div class="oc-speed-label"><span id="oc-speed-state"></span><b id="oc-speed-value"></b></div><div id="oc-offpath-label" class="oc-offpath-label"></div>`;
      const newClip = document.querySelector('.oc-powerbar-full-clip');
      if (newClip) newClip.style.width = `${clamp(speed / max, 0, 1) * 100}%`;
    }
  }
  if ($('oc-speed-state')) $('oc-speed-state').textContent = gait;
  if ($('oc-speed-value')) $('oc-speed-value').textContent = `${speed}/${max}`;
  if ($('obstacle-distance-readout')) $('obstacle-distance-readout').textContent = `Distance ${Math.max(0, Math.round(OC.distance))} / ${Math.round(OC.courseLength)}`;
  if ($('obstacle-score-readout')) $('obstacle-score-readout').textContent = `Score ${OC.score} · Collected ${OC.collected} · Hits ${OC.hits}`;
  if ($('oc-top-info')) $('oc-top-info').textContent = `Distance ${Math.max(0, Math.round(OC.distance))}/${Math.round(OC.courseLength)} · Score ${OC.score} · Collected ${OC.collected}/${OC.objects.filter((obj) => obj.userData.kind === 'collectible').length}`;
  const statusNode = $('obstacle-status');
  if (statusNode) statusNode.textContent = OC.complete ? 'Complete' : OC.running ? 'Running' : OC.paused ? 'Paused' : OC.requiredReady ? 'Ready' : 'Loading';
  $('obstacle-start')?.classList.toggle('is-running', OC.running);
  $('obstacle-pause')?.classList.toggle('is-paused', OC.paused);
}

function updateTemplateText() {
  const title = $('obstacle-title');
  const objective = $('obstacle-objective');
  if (title) title.textContent = TEMPLATES[OC.templateId]?.label || 'Obstacle Course';
  if (objective) objective.textContent = 'Horse forest obstacle course using visible path alpha, GLB scenery, and collectible scoring.';
}

function setResult(message, type = '') {
  const node = $('obstacle-result');
  if (!node) return;
  node.textContent = message;
  node.className = `oc-result ${type || ''}`;
}

function ensureAudioReady() {
  if (OC.audioReady || typeof Audio === 'undefined') return;
  OC.audioReady = true;
  Object.entries(ASSETS.audio).forEach(([key, src]) => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.loop = ['forest', 'gallopSlow', 'gallopFull'].includes(key);
    audio.volume = key === 'forest' ? 0.16 : 0.45;
    OC.audioClips.set(key, audio);
  });
}

function playClip(id, options = {}) {
  ensureAudioReady();
  const clip = OC.audioClips.get(id);
  if (!clip) return;
  try {
    if (!options.allowOverlap) clip.currentTime = 0;
    if (options.volume !== undefined) clip.volume = options.volume;
    const play = clip.play();
    if (play?.catch) play.catch(() => {});
  } catch (_) {}
}

function setLoop(id, active, volume) {
  ensureAudioReady();
  const clip = OC.audioClips.get(id);
  if (!clip) return;
  if (volume !== undefined) clip.volume = volume;
  if (active) {
    const play = clip.play();
    if (play?.catch) play.catch(() => {});
  } else clip.pause();
}

function stopMotionLoops() {
  setLoop('gallopSlow', false);
  setLoop('gallopFull', false);
}

function playRandomHorseVoice(force = false) {
  const now = performance.now();
  if (!force && now - OC.lastVoiceAt < 6500) return;
  OC.lastVoiceAt = now;
  playClip(Math.random() < 0.58 ? 'neigh' : 'snort');
}

function playBushRustle() {
  const now = performance.now();
  if (now - OC.lastBushAt < 900) return;
  OC.lastBushAt = now;
  playClip('bush');
}

function updateRideAudio() {
  const forward = OC.running && !OC.complete && OC.currentSpeed > 1.2;
  const fast = forward && OC.currentSpeed > OC.speed * 0.62;
  if (forward && !OC.wasForwardMoving) playRandomHorseVoice();
  OC.wasForwardMoving = forward;
  setLoop('forest', OC.active, 0.16);
  setLoop('gallopSlow', forward && !fast, 0.34);
  setLoop('gallopFull', fast, 0.44);
}

function renderOnce() {
  if (!OC.renderer || !OC.scene || !OC.camera) return;
  OC.selectionBoxes.forEach((box) => box.update());
  OC.renderer.render(OC.scene, OC.camera);
}

function startRenderLoop() {
  if (OC.renderLoopRunning) return;
  OC.renderLoopRunning = true;
  OC.clock?.getDelta?.();
  OC.frame = requestAnimationFrame(animateFrame);
}

function animateFrame() {
  if (!OC.renderLoopRunning) return;
  const dt = Math.min(0.033, OC.clock?.getDelta?.() || 0.016);
  if (OC.active) updateRun(dt);
  renderOnce();
  OC.frame = requestAnimationFrame(animateFrame);
}

function drawFrame() {
  startRenderLoop();
  renderOnce();
}

function worldToOverview(x, z) {
  const c = $('hf-overview');
  const width = c?.width || 280;
  const height = c?.height || 500;
  const ox = width / 2 + x * 5.1;
  const oy = height - 28 + z * 0.17;
  return { x: ox, y: oy };
}

function scheduleOverviewDraw() { drawOverview(); }

function drawOverview() {
  if (OC.overviewRaf) return;
  OC.overviewRaf = requestAnimationFrame(() => {
    OC.overviewRaf = 0;
    renderOverview();
  });
}

function renderOverview() {
  const c = $('hf-overview');
  if (!c) return;
  const height = Math.max(340, Math.min(1800, Math.round((OC.courseLength + 300) / 3.4)));
  if (c.height !== height) c.height = height;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#101914';
  ctx.fillRect(0, 0, c.width, c.height);

  if (OC.overviewPathOverlay) {
    ctx.fillStyle = 'rgba(238,196,90,.28)';
    for (let d = 0; d < OC.courseLength; d += 18) {
      const seg = alphaSegmentAt(d);
      if (!seg) continue;
      const meshCenterX = (seg.startX + seg.endX) / 2;
      for (let x = meshCenterX - OC.pathVisualWidth * 0.50; x <= meshCenterX + OC.pathVisualWidth * 0.50; x += 2.4) {
        if ((pathAlphaAtWorld(x, d) || 0) >= OC.pathAlphaThreshold) {
          const p = worldToOverview(x, -d);
          ctx.fillRect(p.x - 1.3, p.y - 1.3, 2.6, 2.6);
        }
      }
    }
  }

  ctx.strokeStyle = '#d09a55';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let d = 0; d < OC.courseLength; d += 20) {
    const p = worldToOverview(pathCenterAt(d), -d);
    if (d === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  const seen = new Set();
  const markers = [];
  [...OC.placed, ...OC.objects.map((obj) => ({ type: obj.userData.kind || obj.userData.ocType, x: obj.position.x, z: obj.position.z, mesh: obj }))].forEach((item) => {
    const key = item.mesh?.uuid || `${item.type}:${item.x}:${item.z}`;
    if (seen.has(key)) return;
    seen.add(key);
    markers.push(item);
  });

  const selectedType = OC.selectedLayerId === 'trees' ? 'tree'
    : OC.selectedLayerId === 'rocks' ? 'rock'
    : OC.selectedLayerId === 'details' ? 'detail'
    : OC.selectedLayerId === 'collectibles' ? 'collectible'
    : OC.selectedLayerId === 'obstacles' ? 'obstacle'
    : null;

  markers.forEach((item) => {
    const p = worldToOverview(item.x, item.z);
    const type = item.type;
    ctx.fillStyle = type === 'tree' ? '#48a24a' : type === 'rock' ? '#aaa' : type === 'detail' ? '#73c470' : type === 'collectible' ? '#5be5ff' : '#b04b35';
    ctx.beginPath();
    ctx.arc(p.x, p.y, type === selectedType ? 5.6 : type === 'tree' ? 3.7 : 3.1, 0, Math.PI * 2);
    ctx.fill();
    if (type === selectedType) {
      ctx.strokeStyle = '#eec45a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  const player = worldToOverview(playerWorldX(), -OC.distance);
  ctx.fillStyle = '#f4ead4';
  ctx.beginPath();
  ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#eec45a';
  ctx.strokeRect(1, 1, c.width - 2, c.height - 2);
}

function exportJsonSettings() {
  const config = {
    engine: 'obstacle-course',
    version: VERSION,
    templateId: OC.templateId,
    difficulty: OC.difficulty,
    courseLength: OC.courseLength,
    speed: OC.speed,
    sceneryDistance: OC.sceneryDistance,
    pathVisualWidth: OC.pathVisualWidth,
    vanishX: OC.vanishX,
    vanishY: OC.vanishY,
    cameraAngle: OC.cameraAngle,
    backgroundZoom: OC.backgroundZoom,
    visual: {
      brightness: OC.screenBrightness,
      contrast: OC.screenContrast,
      saturation: OC.screenSaturation,
      tint: OC.screenTint,
      tintStrength: OC.screenTintStrength,
    },
    pathSegments: OC.pathSequence.map((seg) => ({ id: seg.key || seg.id, start: seg.start, end: seg.end, distance: seg.distance })),
    layers: Object.fromEntries(Array.from(OC.layers).map(([id, layer]) => [id, { visible: layer.visible, opacity: layer.opacity, x: layer.x, y: layer.y, z: layer.z, scale: layer.scale, order: layer.order, brightness: layer.brightness, contrast: layer.contrast, saturation: layer.saturation, tint: layer.tint, tintStrength: layer.tintStrength }])),
    glbControls: Object.fromEntries(OC.glbControls),
  };
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `obstacle-course-settings-${VERSION.toLowerCase().replace(/\./g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importJsonSettings(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    applySettingsObject(data, { updateUi: true });
    regenerateCourse();
    updateScreenFilters();
    setResult('Imported obstacle course JSON settings.', 'success');
  } catch (error) {
    setResult(`JSON import failed: ${error.message}`, 'failure');
  } finally {
    event.target.value = '';
  }
}
