import { state } from './state.js';

export function solveMaze() {
  const matrix = state.mazeMatrix;
  if (!matrix.length) return [];
  const size = matrix.length;
  const start = state.startNode;
  const end = state.endNode;
  const queue = [[start]];
  const visited = new Set([`${start.x},${start.y}`]);

  while (queue.length) {
    const path = queue.shift();
    const current = path[path.length - 1];
    if (current.x === end.x && current.y === end.y) {
      state.solutionPath = path;
      return path;
    }

    const neighbours = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];

    neighbours.forEach((next) => {
      if (next.x < 0 || next.y < 0 || next.x >= size || next.y >= size) return;
      if (matrix[next.y][next.x] !== 0) return;
      const key = `${next.x},${next.y}`;
      if (visited.has(key)) return;
      visited.add(key);
      queue.push([...path, next]);
    });
  }

  state.solutionPath = [];
  return [];
}
