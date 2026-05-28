// Maze / Labyrinth consolidation loader
//
// Consolidation phase 2: index.html loads one Maze entrypoint and the
// V1.11 runtime controls plus V1.12 difficulty report have been moved into stable module names.
//
// Temporary imports still present by design during consolidation:
// - maze-v113-polish.js: triangle lockout, solution status, difficulty regen
// - maze-v114-completion-rules.js: completion rule builder
// - maze-v115-ui-polish.js: layout and button polish
// - maze-v116-portals.js: portal builder, markers, walk-test teleporting

import './maze-labyrinth-runtime-controls.js?v=1.19';
import './maze-difficulty-report.js?v=1.19';
import './maze-v113-polish.js?v=1.19';
import './maze-v114-completion-rules.js?v=1.19';
import './maze-v115-ui-polish.js?v=1.19';
import './maze-v116-portals.js?v=1.19';

window.__artifexMazeConsolidation = {
  phase: 'phase_2_difficulty_report',
  status: 'v111_runtime_and_v112_modal_replaced_by_stable_module_names',
  next: [
    'move V1.13 triangle lockout, solution status, and difficulty regen into stable runtime/UI modules',
    'move completion, portals, and UI polish to permanent module names',
    'delete versioned patch files once permanent modules pass live tests'
  ]
};
