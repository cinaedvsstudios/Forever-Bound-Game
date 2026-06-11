export const SIZE_MAP = { 1: 11, 2: 15, 3: 20, 4: 25, 5: 30 };
export const SHAPES = ['Triangle', 'Square', 'Pentagon', 'Hexagon', 'Circle'];

export function isInsideShape(x, y, size, shapeIndex, stretchX = 100, stretchY = 100) {
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const sx = Math.max(0.2, stretchX / 100);
  const sy = Math.max(0.2, stretchY / 100);
  const nx = ((x - cx) / sx) / (size / 2);
  const ny = ((y - cy) / sy) / (size / 2);

  if (shapeIndex === 1) return true;
  if (shapeIndex === 4) return Math.hypot(nx, ny) <= 1.02;
  if (shapeIndex === 0) return pointInPolygon(nx, ny, regularPolygon(3, -Math.PI / 2));
  if (shapeIndex === 2) return pointInPolygon(nx, ny, regularPolygon(5, -Math.PI / 2));
  if (shapeIndex === 3) return pointInPolygon(nx, ny, regularPolygon(6, -Math.PI / 2));
  return true;
}

export function shapeMask(size, shapeIndex, stretchX = 100, stretchY = 100) {
  return Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => isInsideShape(x, y, size, shapeIndex, stretchX, stretchY)));
}

export function isBoundaryCell(x, y, size, shapeIndex, stretchX = 100, stretchY = 100) {
  if (!isInsideShape(x, y, size, shapeIndex, stretchX, stretchY)) return false;
  const neighbours = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  return neighbours.some(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    return nx < 0 || ny < 0 || nx >= size || ny >= size || !isInsideShape(nx, ny, size, shapeIndex, stretchX, stretchY);
  });
}

export function edgeCells(size, shapeIndex, stretchX = 100, stretchY = 100) {
  const cells = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isBoundaryCell(x, y, size, shapeIndex, stretchX, stretchY)) cells.push({ x, y });
    }
  }
  return cells;
}

export function chooseEntranceExit(size, shapeIndex, stretchX = 100, stretchY = 100) {
  const cells = edgeCells(size, shapeIndex, stretchX, stretchY);
  if (!cells.length) return { start: { x: 1, y: 0 }, exit: { x: size - 2, y: size - 1 } };
  const scoreStart = (p) => p.y * 2 + Math.abs(p.x - Math.floor(size / 2));
  const scoreExit = (p) => (size - 1 - p.y) * 2 + Math.abs(p.x - Math.floor(size / 2));
  const start = [...cells].sort((a, b) => scoreStart(a) - scoreStart(b))[0];
  const exit = [...cells].sort((a, b) => scoreExit(a) - scoreExit(b))[0];
  return { start, exit };
}

export function applyShapeMaskAndBorder(matrix, shapeIndex, stretchX = 100, stretchY = 100, openings = []) {
  const size = matrix.length;
  const openingKeys = new Set(openings.map((p) => `${p.x},${p.y}`));
  const output = matrix.map((row) => row.slice());
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const key = `${x},${y}`;
      if (!isInsideShape(x, y, size, shapeIndex, stretchX, stretchY)) output[y][x] = 1;
      else if (isBoundaryCell(x, y, size, shapeIndex, stretchX, stretchY) && !openingKeys.has(key)) output[y][x] = 1;
    }
  }
  openings.forEach((p) => {
    if (!p) return;
    output[p.y][p.x] = 0;
    const inner = nearestInteriorNeighbour(p, size, shapeIndex, stretchX, stretchY);
    if (inner) output[inner.y][inner.x] = 0;
  });
  return output;
}

export function nearestInteriorNeighbour(p, size, shapeIndex, stretchX = 100, stretchY = 100) {
  const neighbours = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  for (const [dx, dy] of neighbours) {
    const x = p.x + dx;
    const y = p.y + dy;
    if (x >= 0 && y >= 0 && x < size && y < size && isInsideShape(x, y, size, shapeIndex, stretchX, stretchY) && !isBoundaryCell(x, y, size, shapeIndex, stretchX, stretchY)) return { x, y };
  }
  return null;
}

export function drawShapePath(ctx, size, cell, shapeIndex, stretchX = 100, stretchY = 100) {
  ctx.save();
  ctx.scale(stretchX / 100, stretchY / 100);
  const cx = size * cell / 2;
  const cy = size * cell / 2;
  const r = size * cell / 2;
  ctx.beginPath();
  if (shapeIndex === 0) polygonPath(ctx, cx, cy, r, 3, -Math.PI / 2);
  else if (shapeIndex === 1) ctx.rect(0, 0, size * cell, size * cell);
  else if (shapeIndex === 2) polygonPath(ctx, cx, cy, r, 5, -Math.PI / 2);
  else if (shapeIndex === 3) polygonPath(ctx, cx, cy, r, 6, -Math.PI / 2);
  else ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.restore();
}

function regularPolygon(sides, rotation) {
  return Array.from({ length: sides }, (_, i) => [Math.cos(rotation + i * Math.PI * 2 / sides), Math.sin(rotation + i * Math.PI * 2 / sides)]);
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || 0.0001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function polygonPath(ctx, cx, cy, r, sides, rotation) {
  for (let i = 0; i < sides; i++) {
    const x = cx + Math.cos(rotation + i * Math.PI * 2 / sides) * r;
    const y = cy + Math.sin(rotation + i * Math.PI * 2 / sides) * r;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}
