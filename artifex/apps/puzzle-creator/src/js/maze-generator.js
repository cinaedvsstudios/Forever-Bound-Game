import { state, setMatrix, updateStartEnd } from './state.js';

function seededRandomFactory(seed = 42) {
  let value = seed;
  return function seededRandom() {
    const x = Math.sin(value++) * 10000;
    return x - Math.floor(x);
  };
}

export function generateMazeMatrix(size, seed = null) {
  const rand = seed === null ? Math.random : seededRandomFactory(seed);
  const matrix = Array.from({ length: size }, () => Array(size).fill(1));

  function carve(x, y) {
    matrix[y][x] = 0;
    const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]];
    directions.sort(() => rand() - 0.5);
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && matrix[ny][nx] === 1) {
        matrix[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);
  matrix[0][1] = 0;
  matrix[size - 1][size - 2] = 0;
  return matrix;
}

export function renderMazeToCanvas(matrix, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = options.width || 640;
  canvas.height = options.height || 640;
  const ctx = canvas.getContext('2d');
  const size = matrix.length;
  const margin = Math.floor(canvas.width * 0.075);
  const playSize = canvas.width - margin * 2;
  const cell = playSize / size;

  ctx.fillStyle = options.pathColor || '#6d5438';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = options.wallColor || '#21452f';
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (matrix[y][x] === 1) {
        ctx.fillRect(margin + x * cell - 0.5, margin + y * cell - 0.5, cell + 1, cell + 1);
      }
    }
  }

  return canvas;
}

export function loadReferenceMaze() {
  const matrix = generateMazeMatrix(31, 42);
  setMatrix(31);
  state.mazeMatrix = matrix;
  state.gridSize = 31;
  updateStartEnd({ x: 1, y: 0 }, { x: 29, y: 30 });
  const canvas = renderMazeToCanvas(matrix);
  state.sourceImageDataUrl = canvas.toDataURL('image/png');
  state.hasCustomSourceImage = false;
  return canvas;
}

export function loadRandomMaze(size) {
  const matrix = generateMazeMatrix(size, null);
  setMatrix(size);
  state.mazeMatrix = matrix;
  state.gridSize = size;
  updateStartEnd({ x: 1, y: 0 }, { x: size - 2, y: size - 1 });
  const canvas = renderMazeToCanvas(matrix);
  state.sourceImageDataUrl = canvas.toDataURL('image/png');
  state.hasCustomSourceImage = false;
  return canvas;
}
