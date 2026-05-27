import mazeLabyrinth from './maze-labyrinth.js';
import obstacleCourse from './flight-course.js';
import symbolAssembly from './symbol-assembly.js';
import itemOrderPuzzle from './recipe-sequence.js';
import hazardPuzzle from './corruption-flow.js';

export const puzzleEngines = [
  mazeLabyrinth,
  obstacleCourse,
  symbolAssembly,
  itemOrderPuzzle,
  hazardPuzzle
];

export const getPuzzleEngine = (id) => puzzleEngines.find((engine) => engine.id === id) || puzzleEngines[0];
