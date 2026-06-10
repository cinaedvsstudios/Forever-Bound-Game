import mazeLabyrinth from './maze-labyrinth.js';

export const puzzleEngines = [mazeLabyrinth];

export const getPuzzleEngine = (id) => puzzleEngines.find((engine) => engine.id === id) || puzzleEngines[0];
