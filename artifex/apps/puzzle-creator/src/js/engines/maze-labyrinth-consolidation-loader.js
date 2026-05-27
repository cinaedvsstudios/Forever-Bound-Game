// Maze / Labyrinth consolidation loader
//
// This is the first consolidation step after the V1.11–V1.16 patch stack.
// It keeps the live behaviour stable while index.html is cleaned down to one
// Maze module entry point. The next consolidation step is to move each imported
// file into its permanent module name, then delete the versioned patch files.
//
// Temporary imports still present by design during consolidation:
// - maze-v111-fixes.js: generated maze runtime, walk test, solver, difficulty basics
// - maze-v112-modal.js: branded report modal
// - maze-v113-polish.js: triangle lockout, solution status, difficulty regen
// - maze-v114-completion-rules.js: completion rule builder
// - maze-v115-ui-polish.js: layout and button polish
// - maze-v116-portals.js: portal builder, markers, walk-test teleporting

import './maze-v111-fixes.js?v=1.17';
import './maze-v112-modal.js?v=1.17';
import './maze-v113-polish.js?v=1.17';
import './maze-v114-completion-rules.js?v=1.17';
import './maze-v115-ui-polish.js?v=1.17';
import './maze-v116-portals.js?v=1.17';

window.__artifexMazeConsolidation = {
  phase: 'phase_0_loader',
  status: 'index_uses_single_maze_entrypoint',
  next: [
    'move v111 runtime behaviour into maze-labyrinth-runtime.js or smaller permanent runtime modules',
    'rename modal, completion, portals, and UI polish to permanent module names',
    'delete versioned patch files once permanent modules pass live tests'
  ]
};
