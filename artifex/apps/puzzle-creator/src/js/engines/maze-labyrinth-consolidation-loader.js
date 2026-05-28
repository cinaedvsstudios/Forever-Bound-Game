// Maze / Labyrinth consolidation loader
//
// Consolidation phase 4: index.html loads one Maze entrypoint and the
// V1.11 runtime controls, V1.12 difficulty report, V1.13 runtime status,
// and V1.14 completion rules are now routed through stable module names.
//
// Stable UI defaults keep the Overview open on the right and the main preview left-aligned.
//
// Temporary imports still present by design during consolidation:
// - maze-v115-ui-polish.js: layout and button polish
// - maze-v116-portals.js: portal builder, markers, walk-test teleporting
//
// Note: completion rules currently use a stable wrapper module first. After live
// testing passes, the former V1.14 code can be inlined into the stable module and
// the old file can be deleted.

import './maze-labyrinth-runtime-controls.js?v=1.22';
import './maze-difficulty-report.js?v=1.22';
import './maze-preview-default-layout.js?v=1.22';
import './maze-runtime-status.js?v=1.22';
import './maze-completion-system.js?v=1.22';
import './maze-v115-ui-polish.js?v=1.22';
import './maze-v116-portals.js?v=1.22';

window.__artifexMazeConsolidation = {
  phase: 'phase_4_completion_system',
  status: 'completion_rules_routed_through_stable_module_name',
  next: [
    'inline completion rules code into the stable module after live smoke test',
    'move portals and UI polish to permanent module names',
    'delete versioned patch files once permanent modules pass live tests'
  ]
};
