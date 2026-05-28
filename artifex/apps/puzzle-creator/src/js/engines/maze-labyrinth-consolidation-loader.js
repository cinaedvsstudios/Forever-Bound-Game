// Maze / Labyrinth consolidation loader
//
// Consolidation phase 3: index.html loads one Maze entrypoint and the
// V1.11 runtime controls, V1.12 difficulty report, and V1.13 runtime status behaviour
// have been moved into stable module names.
//
// Stable UI defaults keep the Overview open on the right and the main preview left-aligned.
//
// Temporary imports still present by design during consolidation:
// - maze-v114-completion-rules.js: completion rule builder
// - maze-v115-ui-polish.js: layout and button polish
// - maze-v116-portals.js: portal builder, markers, walk-test teleporting

import './maze-labyrinth-runtime-controls.js?v=1.21';
import './maze-difficulty-report.js?v=1.21';
import './maze-preview-default-layout.js?v=1.21';
import './maze-runtime-status.js?v=1.21';
import './maze-v114-completion-rules.js?v=1.21';
import './maze-v115-ui-polish.js?v=1.21';
import './maze-v116-portals.js?v=1.21';

window.__artifexMazeConsolidation = {
  phase: 'phase_3_runtime_status',
  status: 'v111_v112_v113_behaviour_replaced_by_stable_module_names',
  next: [
    'move completion rules to maze-completion-rules.js',
    'move portals and UI polish to permanent module names',
    'delete versioned patch files once permanent modules pass live tests'
  ]
};
