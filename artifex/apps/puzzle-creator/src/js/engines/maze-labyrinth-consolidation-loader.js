// Maze / Labyrinth consolidation loader
//
// Consolidation phase 5: index.html loads one Maze entrypoint and the
// V1.11 runtime controls, V1.12 difficulty report, V1.13 runtime status,
// V1.14 completion rules, and V1.16 portals are routed through stable module names.
//
// Stable UI defaults keep the Overview open on the right and the main preview left-aligned.
//
// Temporary imports still present by design during consolidation:
// - maze-v115-ui-polish.js: layout and button polish
//
// Note: completion rules and portals currently use stable wrapper modules first. After live
// testing passes, the former versioned code can be inlined into stable modules and
// the old files can be deleted.

import './maze-labyrinth-runtime-controls.js?v=1.23';
import './maze-difficulty-report.js?v=1.23';
import './maze-preview-default-layout.js?v=1.23';
import './maze-runtime-status.js?v=1.23';
import './maze-completion-system.js?v=1.23';
import './maze-v115-ui-polish.js?v=1.23';
import './maze-portals-system.js?v=1.23';

window.__artifexMazeConsolidation = {
  phase: 'phase_5_portals_system',
  status: 'completion_rules_and_portals_routed_through_stable_module_names',
  next: [
    'move UI polish to permanent module name',
    'inline wrapper modules after live smoke test',
    'delete versioned patch files once permanent modules pass live tests'
  ]
};
