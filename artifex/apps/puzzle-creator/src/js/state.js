import { DEFAULT_STATE } from './config.js';

export const state = structuredClone(DEFAULT_STATE);

export const runtime = {
  sourceImage: null,
  rendererApi: null,
  parserBusy: false,
  isSolved: false,
  keys: {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false
  },
  pointer: {
    is3dDrawing: false,
    is2dDrawing: false,
    lastToggleTarget: 1
  },
  player: {
    x: 1.5,
    z: 1.5,
    angle: Math.PI,
    speed: 0.08,
    turnSpeed: 0.04
  }
};

export function setMatrix(size, fill = 0) {
  state.mazeMatrix = Array.from({ length: size }, () => Array(size).fill(fill));
  state.colorMatrix = Array.from({ length: size }, () => Array(size).fill(null));
  state.textureMatrix = Array.from({ length: size }, () => Array(size).fill(null));
}

export function resetPaintMatrices() {
  const size = state.mazeMatrix.length || state.gridSize;
  state.colorMatrix = Array.from({ length: size }, () => Array(size).fill(null));
  state.textureMatrix = Array.from({ length: size }, () => Array(size).fill(null));
}

export function updateStartEnd(start, end) {
  state.startNode = { x: start.x, y: start.y };
  state.endNode = { x: end.x, y: end.y };
  runtime.player.x = start.x + 0.5;
  runtime.player.z = start.y + 0.5;
}
