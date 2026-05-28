// Maze / Labyrinth consolidation loader
//
// Consolidation phase 1: index.html now loads one Maze entrypoint and the
// V1.11 runtime behaviour has been moved into a stable module name.
//
// Temporary imports still present by design during consolidation:
// - maze-v112-modal.js: branded report modal
// - maze-v113-polish.js: triangle lockout, solution status, difficulty regen
// - maze-v114-completion-rules.js: completion rule builder
// - maze-v115-ui-polish.js: layout and button polish
// - maze-v116-portals.js: portal builder, markers, walk-test teleporting

import './maze-labyrinth-runtime-controls.js?v=1.18';
import './maze-v112-modal.js?v=1.18';
import './maze-v113-polish.js?v=1.18';
import './maze-v114-completion-rules.js?v=1.18';
import './maze-v115-ui-polish.js?v=1.18';
import './maze-v116-portals.js?v=1.18';

window.__artifexMazeConsolidation = {
  phase: 'phase_1_runtime_controls',
  status: 'v111_runtime_patch_replaced_by_stable_module_name',
  next: [
    'move modal behaviour into maze-difficulty-report.js or shared artifex modal module',
    'rename completion, portals, and UI polish to permanent module names',
    'delete versioned patch files once permanent modules pass live tests'
  ]
};
