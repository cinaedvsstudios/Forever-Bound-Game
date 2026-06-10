import { state, resetPaintMatrices, updateStartEnd } from './state.js';
import { dom, setStatus } from './dom.js';

function distanceSq(a, b) {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}

function locateStartAndEnd(matrix) {
  const size = matrix.length;
  const openings = [];
  for (let x = 0; x < size; x += 1) {
    if (matrix[0][x] === 0) openings.push({ x, y: 0 });
    if (matrix[size - 1][x] === 0) openings.push({ x, y: size - 1 });
  }
  for (let y = 1; y < size - 1; y += 1) {
    if (matrix[y][0] === 0) openings.push({ x: 0, y });
    if (matrix[y][size - 1] === 0) openings.push({ x: size - 1, y });
  }

  if (openings.length >= 2) {
    updateStartEnd(openings[0], openings[openings.length - 1]);
  } else {
    updateStartEnd({ x: 1, y: 1 }, { x: size - 2, y: size - 2 });
  }
}

export function parseSourceImage(image) {
  if (!image) return;
  const size = state.gridSize;
  const canvas = dom.analysisCanvas;
  const ctx = canvas.getContext('2d');
  canvas.width = 300;
  canvas.height = 300;

  setStatus('Parsing', 'warn');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const cellW = canvas.width / size;
  const cellH = canvas.height / size;
  const samples = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const px = Math.floor(x * cellW + cellW / 2);
      const py = Math.floor(y * cellH + cellH / 2);
      const idx = (py * canvas.width + px) * 4;
      samples.push({ r: imgData[idx], g: imgData[idx + 1], b: imgData[idx + 2], x, y });
    }
  }

  let clusterA = { r: samples[0].r, g: samples[0].g, b: samples[0].b };
  let clusterB = samples.reduce((furthest, sample) => {
    return distanceSq(sample, clusterA) > distanceSq(furthest, clusterA) ? sample : furthest;
  }, samples[0]);

  for (let i = 0; i < 5; i += 1) {
    const sumA = { r: 0, g: 0, b: 0, n: 0 };
    const sumB = { r: 0, g: 0, b: 0, n: 0 };
    samples.forEach((sample) => {
      const a = distanceSq(sample, clusterA);
      const b = distanceSq(sample, clusterB);
      const target = a < b ? sumA : sumB;
      target.r += sample.r;
      target.g += sample.g;
      target.b += sample.b;
      target.n += 1;
    });
    if (sumA.n) clusterA = { r: sumA.r / sumA.n, g: sumA.g / sumA.n, b: sumA.b / sumA.n };
    if (sumB.n) clusterB = { r: sumB.r / sumB.n, g: sumB.g / sumB.n, b: sumB.b / sumB.n };
  }

  const threshold = state.threshold / 100;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  samples.forEach((sample) => {
    const dA = Math.sqrt(distanceSq(sample, clusterA));
    const dB = Math.sqrt(distanceSq(sample, clusterB));
    const total = dA + dB || 1;
    let isWall = dB / total > (1 - threshold);
    if (state.invert) isWall = !isWall;
    matrix[sample.y][sample.x] = isWall ? 1 : 0;
  });

  state.mazeMatrix = matrix;
  resetPaintMatrices();
  locateStartAndEnd(matrix);
  redrawAnalysisCanvas();
  setStatus('Parsed', 'good');
}

export function redrawAnalysisCanvas() {
  const size = state.mazeMatrix.length;
  if (!size) return;

  const canvas = dom.analysisCanvas;
  const ctx = canvas.getContext('2d');
  const cellW = canvas.width / size;
  const cellH = canvas.height / size;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (state.sourceImageDataUrl) {
    const image = new Image();
    image.onload = () => drawMatrixOverlay(ctx, cellW, cellH);
    image.src = state.sourceImageDataUrl;
  } else {
    drawMatrixOverlay(ctx, cellW, cellH);
  }

  drawMatrixOverlay(ctx, cellW, cellH);
}

function drawMatrixOverlay(ctx, cellW, cellH) {
  const size = state.mazeMatrix.length;
  let wallCount = 0;
  let pathCount = 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (state.mazeMatrix[y][x] === 1) {
        wallCount += 1;
        ctx.fillStyle = state.colorMatrix?.[y]?.[x] || 'rgba(54, 95, 57, 0.74)';
        ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
      } else {
        pathCount += 1;
        ctx.fillStyle = 'rgba(132, 95, 51, 0.42)';
        ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
      }
      ctx.strokeStyle = 'rgba(233, 215, 174, 0.13)';
      ctx.lineWidth = 0.65;
      ctx.strokeRect(x * cellW, y * cellH, cellW, cellH);
    }
  }

  drawNode(ctx, state.startNode, cellW, cellH, '#bd6651');
  drawNode(ctx, state.endNode, cellW, cellH, '#7fd2cf');

  if (state.solutionPath?.length) {
    ctx.strokeStyle = '#7fd2cf';
    ctx.lineWidth = Math.max(2, cellW * 0.18);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    state.solutionPath.forEach((node, index) => {
      const px = node.x * cellW + cellW / 2;
      const py = node.y * cellH + cellH / 2;
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }

  dom.matrixSummary.textContent = `${size}×${size} · ${wallCount} walls · ${pathCount} paths`;
}

function drawNode(ctx, node, cellW, cellH, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(node.x * cellW + cellW / 2, node.y * cellH + cellH / 2, Math.min(cellW, cellH) * 0.34, 0, Math.PI * 2);
  ctx.fill();
}
