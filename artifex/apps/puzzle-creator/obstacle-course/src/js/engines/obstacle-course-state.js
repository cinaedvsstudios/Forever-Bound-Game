// Obstacle Course V3.0.3 state and constants
export const VERSION = 'V3.0.3';
export const CACHE_VERSION = '3.0.3';
export const ASSET_BASE = './assets/';
export const SHARED_UI_BASE = '../../../shared/ui/';
export const GROUND_Y = -1.62;
export const SECTION_PIXEL_HEIGHT = 4000;
export const SECTION_WORLD_LENGTH = 80;
export const SECTION_WORLD_STEP = 80;
export const COURSE_WORLD_WIDTH = 64;
export const PATH_WORLD_WIDTH = 9.2;
export const PATH_ALPHA_THRESHOLD = 0.18;
export const PATH_POSITIONS = { left: -6.3, centre: 0, center: 0, right: 6.3 };
export const BASE_SPEED = 34;
export const BACK_SPEED = -7;
export const SLOW_TROT_SPEED = 8;
export const ACCEL = 24;
export const DECEL = 26;

export const OC = {
  mounted: false,
  version: VERSION,
  cacheVersion: CACHE_VERSION,
  leftPanel: null,
  rightPanel: null,
  host: null,
  stage: null,
  scene: null,
  camera: null,
  renderer: null,
  textureLoader: null,
  gltfLoader: null,
  clock: null,
  world: null,
  grid: null,
  animationFrame: 0,
  renderLoopRunning: false,
  requiredReady: false,
  loadingDone: false,
  loadingCount: 0,
  loadingTotal: 0,
  failures: [],
  optionalFailures: [],
  images: new Map(),
  textures: new Map(),
  alphaMaps: new Map(),
  groundPathMap: null,
  groundTileAssets: [],
  glbTemplates: new Map(),
  glbInstances: [],
  layers: new Map(),
  entities: [],
  objects: [],
  selectionBoxes: [],
  keys: new Set(),
  templateId: 'horse_forest_easy',
  difficulty: 3,
  courseLength: 1500,
  speed: BASE_SPEED,
  pathVisualWidth: PATH_WORLD_WIDTH,
  sceneryDistance: 8,
  vanishX: 0,
  vanishY: 49,
  cameraAngle: 0,
  backgroundZoom: 1.1,
  backgroundJumpShift: 0,
  screenBrightness: 1,
  screenContrast: 1,
  screenSaturation: 1,
  screenTint: '#000000',
  screenTintStrength: 0,
  whiteBackground: false,
  pathSequence: [],
  customPathSequence: null,
  pathAlphaThreshold: PATH_ALPHA_THRESHOLD,
  overviewPathOverlay: true,
  overviewRaf: 0,
  active: false,
  running: false,
  paused: false,
  complete: false,
  currentSpeed: 0,
  targetSpeed: 0,
  distance: 0,
  score: 0,
  hits: 0,
  jumps: 0,
  collected: 0,
  offPathTime: 0,
  pathHintDirection: 'right',
  player: { x: 0, y: 0, vy: 0, grounded: true, jumpHoldTime: 0, maxJumpHoldTime: 0.18, duck: false },
  selectedLayerId: 'ground',
  selectedGlbAssetUrl: '',
  glbControls: new Map(),
};
