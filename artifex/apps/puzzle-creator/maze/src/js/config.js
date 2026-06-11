export const APP_SCHEMA = 'cinaedvs.artifex.maze.v1';

export const EDGE_STYLE_LABELS = ['Sharp', 'Rough', 'Smooth'];
export const LAYOUT_STYLE_LABELS = ['Straight', 'Natural', 'Curved'];

export const DEFAULT_SWATCHES = [
  '#24513a', '#6f4a2d', '#8b3f2f', '#b37a37', '#7fd2cf', '#684b8f',
  '#2b3341', '#59624c', '#bd6651', '#e1c073', '#4c6f61', '#0f1712'
];

export const MATERIAL_PRESETS = {
  hedge: {
    label: 'Hedge',
    color: 0x24513a,
    roughness: 0.96,
    metalness: 0.0
  },
  stone: {
    label: 'Ancient Stone',
    color: 0x6f6960,
    roughness: 0.9,
    metalness: 0.04
  },
  rune: {
    label: 'Runic Bronze',
    color: 0x8a5a2a,
    emissive: 0x3a2513,
    roughness: 0.48,
    metalness: 0.42
  },
  shadow: {
    label: 'Underworld',
    color: 0x0d1110,
    emissive: 0x143316,
    roughness: 0.36,
    metalness: 0.25
  }
};

export const FLOOR_PRESETS = {
  soil: { color: 0x3a2818, roughness: 0.94, metalness: 0.02 },
  parchment: { color: 0x8a6e42, roughness: 0.85, metalness: 0.0 },
  stone: { color: 0x383734, roughness: 0.72, metalness: 0.06 },
  underworld: { color: 0x050706, roughness: 0.28, metalness: 0.18 }
};

export const DEFAULT_STATE = {
  moduleId: 'ch00_q00_labyrinth_maze',
  displayName: 'Labyrinth Maze',
  puzzleType: 'pass_environmental_obstacle',
  gameplayMode: 'scene_mode',
  completionFlag: 'maze_exit_reached',
  callingText: 'Find the correct passage through the labyrinth.',
  gridSize: 31,
  threshold: 50,
  invert: false,
  mazeMatrix: [],
  colorMatrix: [],
  textureMatrix: [],
  startNode: { x: 1, y: 1 },
  endNode: { x: 29, y: 29 },
  solutionPath: [],
  sourceImageDataUrl: '',
  hasCustomSourceImage: false,
  wallHeight: 1.5,
  gap: 0.98,
  layoutStyle: 0,
  edgeStyle: 0,
  wallMaterialPreset: 'hedge',
  wallColor: '#24513a',
  floorStyle: 'soil',
  brushColor: '#8b3f2f',
  currentTool: 'camera',
  currentViewMode: 'diorama',
  lightAngle: 135,
  shadows: true
};
