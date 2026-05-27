import mazeLabyrinth from './maze-labyrinth.js';
import arenaTrial from './arena-trial.js';
import obstacleCourse from './obstacle-course.js';
import symbolAssembly from './symbol-assembly.js';
import itemOrderPuzzle from './item-order-puzzle.js';
import hazardPuzzle from './hazard-puzzle.js';

export const puzzleEngines = [
  mazeLabyrinth,
  arenaTrial,
  obstacleCourse,
  symbolAssembly,
  itemOrderPuzzle,
  hazardPuzzle
];

export const getPuzzleEngine = (id) => puzzleEngines.find((engine) => engine.id === id) || puzzleEngines[0];
