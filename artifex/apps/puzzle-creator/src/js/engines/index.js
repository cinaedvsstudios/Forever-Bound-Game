import arenaTrial from './arena-trial.js';
import flightCourse from './flight-course.js';
import symbolAssembly from './symbol-assembly.js';
import recipeSequence from './recipe-sequence.js';
import corruptionFlow from './corruption-flow.js';

export const puzzleEngines = [
  arenaTrial,
  flightCourse,
  symbolAssembly,
  recipeSequence,
  corruptionFlow
];

export const getPuzzleEngine = (id) => puzzleEngines.find((engine) => engine.id === id) || puzzleEngines[0];
